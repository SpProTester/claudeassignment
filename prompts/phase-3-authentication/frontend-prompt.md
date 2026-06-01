# Prompt 05 â€” Authentication Frontend

## Phase
Phase 2 â€” Authentication

## Objective
Build complete authentication UI in React with protected routes, role-based guards, global auth state via Context API, and automatic token refresh via Axios interceptors.

---

## Prompt to Use

```
Build the complete authentication frontend for the Job Portal React app.

1. client/src/store/authStore.js (Zustand store):
   - State: user(null), accessToken(null), isAuthenticated(false), isLoading(true)
   - Actions:
     - setAuth(user, accessToken) â€” set authenticated state
     - clearAuth() â€” reset to logged out state
     - updateUser(userData) â€” update user fields without clearing token
   - Persist user to localStorage (NOT the access token â€” keep in memory only)
   - On app load: check localStorage for user, set isLoading=false after check

2. client/src/api/axiosInstance.js (Axios configured instance):
   - baseURL from import.meta.env.VITE_API_BASE_URL
   - withCredentials: true (send cookies for refresh token)
   - Request interceptor: attach Authorization: Bearer <accessToken> from Zustand store
   - Response interceptor:
     - On 401 error: call POST /auth/refresh to get new access token
     - If refresh succeeds: retry original request with new token
     - If refresh fails: call clearAuth(), redirect to /login
     - Use a flag (isRefreshing) to queue multiple 401 requests during refresh
   - Export this instance as 'api'

3. client/src/api/authApi.js:
   - register(data) â†’ POST /auth/register
   - login(data) â†’ POST /auth/login
   - logout() â†’ POST /auth/logout
   - forgotPassword(email) â†’ POST /auth/forgot-password
   - resetPassword(data) â†’ POST /auth/reset-password
   - verifyEmail(token) â†’ GET /auth/verify-email/:token
   - getMe() â†’ GET /auth/me

4. client/src/hooks/useAuth.js (custom hook):
   - Wraps Zustand auth store
   - login(credentials) â€” calls authApi.login, calls setAuth, redirect based on role
     - seeker â†’ /seeker/dashboard
     - employer â†’ /employer/dashboard
     - admin â†’ /admin/dashboard
   - logout() â€” calls authApi.logout, clears store, redirect to /login
   - register(data) â€” calls authApi.register, returns response (user verifies email separately)
   - Returns: { user, isAuthenticated, isLoading, login, logout, register }

5. client/src/components/layout/ProtectedRoute.jsx:
   - Accepts: allowedRoles (array), redirectTo ('/login' default)
   - If isLoading: show full-page spinner
   - If !isAuthenticated: <Navigate to="/login" state={{ from: location }} />
   - If user.role not in allowedRoles: <Navigate to="/unauthorized" />
   - Otherwise: render <Outlet />

6. client/src/pages/auth/RegisterPage.jsx:
   - Step 1: Role selection â€” two large cards "I'm a Job Seeker" / "I'm an Employer"
     with icons, descriptions, select/deselect on click
   - Step 2: Registration form (shown after role selected)
     Common fields: Full Name, Email, Password, Confirm Password
     Employer-only fields: Company Name, Company Website (optional)
   - Password strength indicator (weak/fair/strong/very strong) with color bar
   - Validation with React Hook Form + Yup schema
   - On success: show "Check your email" confirmation screen (not redirect to login yet)
   - Show inline field errors; disable submit button while loading
   - Link to /login at bottom

7. client/src/pages/auth/LoginPage.jsx:
   - Email + Password fields
   - Show/Hide password toggle button
   - "Remember me" checkbox
   - "Forgot Password?" link â†’ /forgot-password
   - Submit button with loading spinner
   - Social login buttons (Google, LinkedIn) â€” disabled/placeholder for now
   - Error toast on failed login (react-hot-toast)
   - Redirect to original page after login (use location.state.from)
   - Link to /register

8. client/src/pages/auth/ForgotPasswordPage.jsx:
   - Step 1: Email input form â†’ submit â†’ shows "OTP sent" message
   - Step 2: OTP input (6-box digit input, auto-focus next box on input) + New Password + Confirm Password
   - Resend OTP link (cooldown 60 seconds with countdown timer)
   - On success: redirect to /login with success toast

9. client/src/pages/auth/VerifyEmailPage.jsx:
   - Extract token from URL params
   - On mount: call verifyEmail(token)
   - Loading state: spinner with "Verifying your email..."
   - Success state: checkmark icon + "Email verified! You can now log in." + button to /login
   - Error state: X icon + error message + "Resend verification email" button

10. client/src/App.jsx â€” Router setup:
    - Public routes (no auth needed):
      /, /jobs, /jobs/:slug, /companies/:slug, /about, /contact
    - Auth routes (redirect to dashboard if already logged in):
      /login, /register, /forgot-password, /verify-email
    - Seeker routes (ProtectedRoute allowedRoles=['seeker']):
      /seeker/dashboard, /seeker/profile, /seeker/resume, /seeker/applications,
      /seeker/saved-jobs, /seeker/alerts
    - Employer routes (ProtectedRoute allowedRoles=['employer']):
      /employer/dashboard, /employer/jobs, /employer/jobs/new,
      /employer/jobs/:id/edit, /employer/jobs/:id/applicants,
      /employer/company, /employer/analytics, /employer/billing
    - Admin routes (ProtectedRoute allowedRoles=['admin','super_admin']):
      /admin/dashboard, /admin/users, /admin/jobs, /admin/analytics
    - /unauthorized â€” 403 page
    - * â€” 404 page

Show complete code for all files. Use Tailwind CSS for all styling.
No external UI component libraries â€” build components from scratch with Tailwind.
```

---

## Expected Output Files

```
client/src/
â”œâ”€â”€ store/authStore.js
â”œâ”€â”€ api/
â”‚   â”œâ”€â”€ axiosInstance.js
â”‚   â””â”€â”€ authApi.js
â”œâ”€â”€ hooks/useAuth.js
â”œâ”€â”€ components/
â”‚   â””â”€â”€ layout/ProtectedRoute.jsx
â”œâ”€â”€ pages/auth/
â”‚   â”œâ”€â”€ RegisterPage.jsx
â”‚   â”œâ”€â”€ LoginPage.jsx
â”‚   â”œâ”€â”€ ForgotPasswordPage.jsx
â”‚   â””â”€â”€ VerifyEmailPage.jsx
â””â”€â”€ App.jsx
```

---

## Key Concepts to Learn

- **Zustand** â€” lightweight state management; no Provider needed; access store anywhere with `useStore()`
- **Axios interceptors** â€” `axios.interceptors.request.use()` runs before every request; `response.use(onSuccess, onError)` intercepts errors
- **Token refresh race condition** â€” if 3 requests fail with 401 simultaneously, only one should call refresh; others should queue and retry after. The `isRefreshing` flag solves this
- **React Router v6 protected routes** â€” use `<Outlet />` pattern with wrapper components instead of v5's render props
- **React Hook Form** â€” `useForm()`, `register()`, `handleSubmit()`, `formState.errors`; uncontrolled by default (better performance)
- **Yup validation** â€” `yup.object().shape({})` defines schema; use `resolver: yupResolver(schema)` in `useForm`

---

## Component Design Notes

### OTP Input (6 boxes)
```jsx
// Each box is an <input maxLength={1} />
// On input: move focus to next input
// On backspace: move focus to previous input
// Combine all values for the OTP string
```

### Password Strength Indicator
```jsx
const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return ['', 'weak', 'fair', 'strong', 'very strong'][score];
};
```

---

## Validation Checklist

- [ ] Register as seeker â†’ redirected to "check email" page
- [ ] Register as employer â†’ company name field appears
- [ ] Login â†’ redirected to correct dashboard based on role
- [ ] Invalid credentials â†’ error message displayed
- [ ] Accessing `/seeker/dashboard` without login â†’ redirected to `/login`
- [ ] After login, accessing `/login` â†’ redirected to dashboard
- [ ] Employer accessing `/seeker/dashboard` â†’ redirected to `/unauthorized`
- [ ] Token auto-refresh works when access token expires
- [ ] Logout clears all state and cookies

---

## Next Step
Move to **Prompt 06 â€” Seeker Profile Backend** once login/register flows work end-to-end.

