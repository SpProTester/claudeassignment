import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { signToken } from '../utils/jwt.utils.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role = 'seeker' } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return sendError(res, 'Email already in use.', 409);

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const passwordHash = await bcrypt.hash(password, rounds);

    const user = await User.create({ firstName, lastName, email, passwordHash, role });

    const token = signToken({ id: user.id, role: user.role });

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      'Registered successfully.',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return sendError(res, 'Invalid email or password.', 401);
    if (!user.isActive) return sendError(res, 'Account deactivated.', 401);

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return sendError(res, 'Invalid email or password.', 401);

    const token = signToken({ id: user.id, role: user.role });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    sendSuccess(res, { user: req.user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatarUrl } = req.body;
    await req.user.update({ firstName, lastName, phone, avatarUrl });
    sendSuccess(res, { user: req.user });
  } catch (err) {
    next(err);
  }
};
