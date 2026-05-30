# Authentication — API Reference

Base path: `/api/auth`

---

## POST /api/auth/register

Register a new user (seeker or employer).

**Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "seeker",
  "full_name": "John Doe",
  "company_name": "TechCorp"   // required only if role = "employer"
}
```

**Validation:**
- `email` — valid email format, unique
- `password` — min 8 chars, ≥1 uppercase, ≥1 digit, ≥1 special character
- `role` — must be `"seeker"` or `"employer"`
- `full_name` — min 2 characters
- `company_name` — required when `role = "employer"`

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "role": "seeker",
      "full_name": "John Doe",
      "is_verified": false
    }
  }
}
```

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid input fields |
| 409 | EMAIL_EXISTS | Email already registered |

---

## POST /api/auth/login

Authenticate user and issue tokens.

**Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "role": "seeker",
      "full_name": "John Doe",
      "is_verified": true
    }
  }
}
```

**Side effects:** Sets `refreshToken` in httpOnly cookie (`Max-Age: 30d`, `SameSite=Strict`)

**Errors:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Missing or invalid fields |
| 401 | INVALID_CREDENTIALS | Wrong email or password |
| 403 | ACCOUNT_INACTIVE | Account deactivated |
| 423 | ACCOUNT_LOCKED | Too many failed attempts; includes `retryAfter` seconds |

---

## POST /api/auth/refresh

Issue new access token from refresh token cookie.

**Auth:** Refresh token cookie (httpOnly)

**Request Body:** None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
| Status | Description |
|--------|-------------|
| 401 | Missing, expired, or revoked refresh token |

---

## POST /api/auth/logout

Revoke refresh token and clear cookie.

**Auth:** Bearer token (access token)

**Request Body:** None

**Response 200:**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

## GET /api/auth/verify-email/:token

Verify email address using the token sent in the verification email.

**Auth:** None

**Path Param:** `token` — 64-character hex string

**Response 200:**
```json
{
  "success": true,
  "message": "Email verified successfully. Welcome!"
}
```

**Errors:**
| Status | Description |
|--------|-------------|
| 400 | Token expired or invalid |

---

## POST /api/auth/forgot-password

Request a password reset OTP. Always returns 200 to prevent email enumeration.

**Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "If that email is registered, you will receive an OTP shortly."
}
```

---

## POST /api/auth/reset-password

Reset password using OTP.

**Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "483921",
  "new_password": "NewSecurePass456!"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Password reset successful. Please log in with your new password."
}
```

**Errors:**
| Status | Description |
|--------|-------------|
| 400 | Invalid or expired OTP |

---

## GET /api/auth/me

Return the currently authenticated user.

**Auth:** Bearer token

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "role": "seeker",
      "full_name": "John Doe",
      "is_verified": true,
      "avatar_url": null,
      "last_login_at": "2026-05-30T10:00:00.000Z"
    }
  }
}
```

---

## Standard Error Response Shape

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password.",
    "details": []
  }
}
```

For validation errors, `details` is an array of `{ field, message }` objects.
