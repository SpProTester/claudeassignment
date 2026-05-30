# Authentication — Test Cases

---

## Unit Tests

### authService.register

| Test | Input | Expected |
|------|-------|---------|
| Happy path seeker | Valid email, password, role=seeker | Returns user + seeker profile created |
| Happy path employer | Valid email, role=employer, company_name | Returns user + employer profile created |
| Duplicate email | Existing email | Throws 409 UniqueConstraintError |
| Weak password | Password without uppercase | Throws 400 validation error |
| Missing company_name | role=employer, no company_name | Throws 400 validation error |
| Verification email sent | Valid registration | `sendVerificationEmail` called once |

### authService.login

| Test | Input | Expected |
|------|-------|---------|
| Correct credentials | Valid email + password | Returns { user, accessToken, refreshToken } |
| Wrong password | Valid email, wrong password | Throws 401 INVALID_CREDENTIALS |
| Non-existent email | Unknown email | Throws 401 INVALID_CREDENTIALS |
| Inactive account | `is_active = false` | Throws 403 ACCOUNT_INACTIVE |
| Account locked | `lockout_until > now` | Throws 423 ACCOUNT_LOCKED with retryAfter |
| 5th failed attempt | 4 previous failures | Locks account, sets `lockout_until` |
| Successful after lock expiry | Valid creds after lock expired | Returns tokens, resets attempts |
| `last_login_at` updated | Valid login | User.updated_at reflects current time |

### authService.resetPassword

| Test | Input | Expected |
|------|-------|---------|
| Valid OTP | Correct OTP within expiry | Password updated, old refresh tokens revoked |
| Expired OTP | OTP past 10 min | Throws 400 OTP_EXPIRED |
| Wrong OTP | Incorrect OTP | Throws 400 INVALID_OTP |

---

## Integration Tests (Supertest)

### POST /api/auth/register

```javascript
it('returns 201 and creates user + seeker profile', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'Test123!', role: 'seeker', full_name: 'Test User' });

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.user.role).toBe('seeker');
  // Verify DB
  const user = await User.findOne({ where: { email: 'test@example.com' } });
  expect(user).not.toBeNull();
  const profile = await SeekerProfile.findOne({ where: { user_id: user.id } });
  expect(profile).not.toBeNull();
});

it('returns 409 for duplicate email', async () => {
  await User.create({ email: 'dup@example.com', ... });
  const res = await request(app).post('/api/auth/register').send({ email: 'dup@example.com', ... });
  expect(res.status).toBe(409);
});
```

### POST /api/auth/login

```javascript
it('returns accessToken and sets refreshToken cookie', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: seeder.email, password: seeder.rawPassword });

  expect(res.status).toBe(200);
  expect(res.body.data.accessToken).toBeDefined();
  expect(res.headers['set-cookie']).toEqual(
    expect.arrayContaining([expect.stringContaining('refreshToken')])
  );
});

it('returns 401 for wrong password', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: seeder.email, password: 'WrongPass!' });
  expect(res.status).toBe(401);
});

it('locks account after 5 failed attempts', async () => {
  for (let i = 0; i < 5; i++) {
    await request(app).post('/api/auth/login').send({ email, password: 'wrong' });
  }
  const res = await request(app).post('/api/auth/login').send({ email, password: 'wrong' });
  expect(res.status).toBe(423);
  expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
});
```

### GET /api/auth/me

```javascript
it('returns user data with valid token', async () => {
  const { accessToken } = await loginHelper();
  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${accessToken}`);
  expect(res.status).toBe(200);
  expect(res.body.data.user.email).toBe(seeder.email);
});

it('returns 401 without token', async () => {
  const res = await request(app).get('/api/auth/me');
  expect(res.status).toBe(401);
});
```

### POST /api/auth/refresh

```javascript
it('issues new accessToken from cookie', async () => {
  const agent = request.agent(app); // preserves cookies
  await agent.post('/api/auth/login').send(creds);
  const res = await agent.post('/api/auth/refresh');
  expect(res.status).toBe(200);
  expect(res.body.data.accessToken).toBeDefined();
});
```

---

## End-to-End Tests (Playwright)

### Registration & Email Verification

```
1. Navigate to /register
2. Select role "Job Seeker"
3. Fill: email, password, full_name
4. Submit → Assert toast "Check your email"
5. Simulate email token from test DB → visit /verify-email/:token
6. Assert redirect to /login with toast "Email verified!"
```

### Login & Dashboard Redirect

```
1. Navigate to /login
2. Fill credentials of verified seeker
3. Submit → Assert redirect to /seeker/dashboard
4. Assert Navbar shows user's name
```

### Account Lockout

```
1. Login 5× with wrong password
2. Assert lockout message on 5th attempt
3. Assert login form disabled with retry-after timer
```

---

## Security Tests

| Test | Description |
|------|-------------|
| Password not in response | `password_hash` MUST NOT appear in any API response |
| OTP not in response | `otp_hash` MUST NOT appear in any API response |
| Refresh token in httpOnly cookie | `document.cookie` must not contain `refreshToken` |
| CSRF protection | Cross-origin POST to /login should be blocked by CORS |
| SQL injection | Login with `' OR '1'='1` must return 401, not 200 |
| Token after logout | Old accessToken must still work until 15-min expiry (stateless); refresh token must be revoked |
