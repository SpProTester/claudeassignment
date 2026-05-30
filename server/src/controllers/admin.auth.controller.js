import bcrypt from 'bcryptjs';
import { User, AuditLog } from '../models/index.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

const ADMIN_COOKIE = 'adminRefreshToken';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 8 * 60 * 60 * 1000, // 8-hour admin session
};

const CLEAR_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

// ── POST /api/admin/auth/login ─────────────────────────────────────────────
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password are required.', 400);

    const user = await User.findOne({ where: { email } });
    if (!user) return sendError(res, 'Invalid credentials.', 401);
    if (!user.isActive) return sendError(res, 'Account is deactivated.', 401);
    if (user.role !== 'admin') return sendError(res, 'Access denied. Admin credentials required.', 403);

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return sendError(res, 'Invalid credentials.', 401);

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    // Shorter-lived refresh for admin sessions (8 h)
    const refreshToken = signRefreshToken({ id: user.id, scope: 'admin' });

    await user.update({ refreshToken });
    res.cookie(ADMIN_COOKIE, refreshToken, COOKIE_OPTS);

    await AuditLog.create({
      adminId: user.id,
      action: 'ADMIN_LOGIN',
      entityType: 'session',
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    sendSuccess(res, {
      accessToken,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/admin/auth/refresh ───────────────────────────────────────────
export const adminRefresh = async (req, res, next) => {
  try {
    const token = req.cookies?.[ADMIN_COOKIE];
    if (!token) return sendError(res, 'No admin session found.', 401);

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive || user.role !== 'admin' || user.refreshToken !== token) {
      return sendError(res, 'Session is no longer valid.', 401);
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    sendSuccess(res, { accessToken });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/admin/auth/logout ────────────────────────────────────────────
export const adminLogout = async (req, res, next) => {
  try {
    const token = req.cookies?.[ADMIN_COOKIE];
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await User.update({ refreshToken: null }, { where: { id: decoded.id } });
        await AuditLog.create({
          adminId: decoded.id,
          action: 'ADMIN_LOGOUT',
          entityType: 'session',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      } catch {
        // already invalid — clear anyway
      }
    }
    res.clearCookie(ADMIN_COOKIE, CLEAR_OPTS);
    sendSuccess(res, null, 'Logged out of admin portal.');
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/auth/me ─────────────────────────────────────────────────
export const adminMe = async (req, res, next) => {
  try {
    sendSuccess(res, {
      user: {
        id: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
