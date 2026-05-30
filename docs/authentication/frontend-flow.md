# Authentication — Frontend Flow

---

## User Flows

### Registration Flow

```
/register
  ↓
User selects role (Seeker / Employer)
  ↓
Fills form: email, password, full_name [+ company_name if Employer]
  ↓
Submit → POST /api/auth/register
  ↓
Success → Show "Check your email" confirmation screen
  ↓
User clicks email link → GET /api/auth/verify-email/:token
  ↓
Redirect to /login with success toast "Email verified!"
```

### Login Flow

```
/login
  ↓
User enters email + password
  ↓
Submit → POST /api/auth/login
  ↓
Success → Store accessToken in memory (AuthContext)
         Refresh token stored in httpOnly cookie (server-side)
  ↓
Redirect based on role:
  seeker   → /seeker/dashboard
  employer → /employer/dashboard
  admin    → /admin/dashboard
```

### Token Refresh Flow

```
Axios interceptor intercepts 401 response
  ↓
POST /api/auth/refresh (cookie sent automatically)
  ↓
Success → Retry original request with new accessToken
Failure → Call logout(), redirect to /login
```

### Password Reset Flow

```
/forgot-password
  ↓
Enter email → POST /api/auth/forgot-password
  ↓
Show OTP input screen (regardless of whether email exists)
  ↓
Enter OTP + new password → POST /api/auth/reset-password
  ↓
Success → Redirect to /login with toast "Password updated"
```

---

## Component Hierarchy

```
App.jsx
└── Routes (React Router v6)
    ├── <Layout> (public)
    │   ├── /login       → Login.jsx
    │   ├── /register    → Register.jsx
    │   └── /forgot-password → ForgotPassword.jsx
    │
    ├── <ProtectedRoute>        (requires valid accessToken)
    │   ├── <RoleRoute role="seeker">
    │   │   └── /seeker/*   → SeekerLayout + SeekerDashboard, etc.
    │   └── <RoleRoute role="employer">
    │       └── /employer/* → EmployerLayout + EmployerDashboard, etc.
    │
    └── <ProtectedRoute + RoleRoute role="admin">
        └── /admin/*    → AdminLayout + admin pages
```

---

## State Management

### AuthContext (`client/src/context/AuthContext.jsx`)

```javascript
const AuthContext = {
  user: null | { id, email, role, full_name, is_verified },
  accessToken: null | string,
  isLoading: boolean,
  login(credentials) → Promise,
  logout() → void,
  refreshToken() → Promise<string>,
}
```

- `accessToken` is stored in React state (memory only — never localStorage)
- On page refresh, `AuthContext` calls `POST /api/auth/refresh` on mount to restore session
- If refresh fails, user is treated as unauthenticated

### Axios Interceptor (`client/src/services/api.js`)

```javascript
// Request interceptor: attach access token to every request
api.interceptors.request.use(config => {
  const token = getAccessToken(); // from AuthContext
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(null, async error => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    const newToken = await refreshToken();
    error.config.headers.Authorization = `Bearer ${newToken}`;
    return api(error.config);
  }
  return Promise.reject(error);
});
```

---

## Route Guards

### ProtectedRoute (`client/src/components/common/ProtectedRoute.jsx`)

```jsx
// Redirects unauthenticated users to /login
// Shows loading spinner while refreshToken() is in progress
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};
```

### RoleRoute (`client/src/components/common/RoleRoute.jsx`)

```jsx
// Redirects users with wrong role to their own dashboard
const RoleRoute = ({ role, children }) => {
  const { user } = useAuth();
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
};
```

---

## Form Validation (React Hook Form + Yup)

### Register Schema
```javascript
yup.object({
  email: yup.string().email().required(),
  password: yup.string()
    .min(8)
    .matches(/[A-Z]/, 'Must contain uppercase')
    .matches(/[0-9]/, 'Must contain number')
    .matches(/[!@#$%^&*]/, 'Must contain special char')
    .required(),
  role: yup.string().oneOf(['seeker', 'employer']).required(),
  full_name: yup.string().min(2).required(),
  company_name: yup.string().when('role', {
    is: 'employer',
    then: s => s.required(),
  }),
})
```

---

## Pages & Key Components

| Page / Component | Route | Purpose |
|-----------------|-------|---------|
| `Login.jsx` | `/login` | Email + password form, error display |
| `Register.jsx` | `/register` | Role selector + registration form |
| `ForgotPassword.jsx` | `/forgot-password` | 3-step: email → OTP → new password |
| `ResetPassword.jsx` | `/reset-password` | Direct link from email (token-based) |
| `ProtectedRoute.jsx` | — | Auth guard HOC |
| `RoleRoute.jsx` | — | Role guard HOC |
| `OtpInput.jsx` | — | 6-box OTP input component |
