import { verifyToken } from '../utils/jwt.utils.js';
import { User } from '../models/index.js';
import { sendError } from '../utils/response.utils.js';

const SENSITIVE = ['passwordHash', 'refreshToken', 'passwordResetOtp', 'passwordResetOtpExpiry'];

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 'Not authenticated. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: SENSITIVE },
    });
    if (!user || !user.isActive) {
      return sendError(res, 'User no longer exists or is deactivated.', 401);
    }
    req.user = user;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token.', 401);
  }
};

// backward-compat alias used by existing routes
export const protect = authenticateToken;

export const authorizeRole = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return sendError(res, 'You do not have permission to perform this action.', 403);
    }
    next();
  };

// backward-compat alias
export const restrictTo = authorizeRole;
