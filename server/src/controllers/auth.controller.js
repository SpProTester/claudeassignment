import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import { sendOtpEmail } from '../utils/email.utils.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

const REFRESH_COOKIE = 'refreshToken';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const CLEAR_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const publicUser = (u) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
});

// ── POST /api/auth/register ────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role = 'seeker' } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return sendError(res, 'Email already in use.', 409);

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const passwordHash = await bcrypt.hash(password, rounds);

    const user = await User.create({ fullName, email, passwordHash, role });

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    await user.update({ refreshToken });
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);

    sendSuccess(
      res,
      { accessToken, user: publicUser(user) },
      'Registered successfully.',
      201
    );
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return sendError(res, 'Invalid email or password.', 401);
    if (!user.isActive) return sendError(res, 'Account deactivated.', 401);

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return sendError(res, 'Invalid email or password.', 401);

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    await user.update({ refreshToken });
    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);

    sendSuccess(res, { accessToken, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/refresh ─────────────────────────────────────────────────
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return sendError(res, 'No refresh token provided.', 401);

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return sendError(res, 'Invalid or expired refresh token.', 401);
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive || user.refreshToken !== token) {
      return sendError(res, 'Refresh token is no longer valid.', 401);
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    sendSuccess(res, { accessToken });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ──────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await User.update({ refreshToken: null }, { where: { id: decoded.id } });
      } catch {
        // token already invalid — still clear the cookie
      }
    }
    res.clearCookie(REFRESH_COOKIE, CLEAR_COOKIE_OPTS);
    sendSuccess(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    // Always return 200 to prevent user enumeration
    if (!user) {
      return sendSuccess(res, null, 'If that email is registered, an OTP has been sent.');
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({ passwordResetOtp: otp, passwordResetOtpExpiry: expiry });
    await sendOtpEmail(email, otp);

    sendSuccess(res, null, 'OTP sent to your email address. It expires in 10 minutes.');
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/reset-password ─────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return sendError(res, 'Invalid OTP or email.', 400);

    const otpValid =
      user.passwordResetOtp &&
      user.passwordResetOtpExpiry &&
      user.passwordResetOtp === otp &&
      new Date() <= user.passwordResetOtpExpiry;

    if (!otpValid) return sendError(res, 'OTP is invalid or has expired.', 400);

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const passwordHash = await bcrypt.hash(newPassword, rounds);

    await user.update({
      passwordHash,
      passwordResetOtp: null,
      passwordResetOtpExpiry: null,
      refreshToken: null, // invalidate all active sessions
    });

    res.clearCookie(REFRESH_COOKIE, CLEAR_COOKIE_OPTS);
    sendSuccess(res, null, 'Password reset successfully. Please log in again.');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    sendSuccess(res, { user: req.user });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/auth/me ─────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    await req.user.update({ fullName });
    sendSuccess(res, { user: req.user });
  } catch (err) {
    next(err);
  }
};
