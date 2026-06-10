import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import { User, UserSocialAccount } from '../models/index.js';
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
  avatarUrl: u.avatarUrl,
  emailVerified: u.emailVerified,
});

// Issues access + refresh tokens, sets cookie, returns accessToken
const issueTokens = async (user, res) => {
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });
  await user.update({ refreshToken });
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
  return accessToken;
};

// Find or create a user from a verified social auth payload
const findOrCreateSocialUser = async (provider, providerId, email, fullName, avatarUrl) => {
  // 1. Check if this exact social account is already linked
  const existing = await UserSocialAccount.findOne({
    where: { provider, providerId },
    include: [{ model: User, as: 'user' }],
  });

  if (existing) {
    // Keep social account data fresh
    await existing.update({
      email: email ?? existing.email,
      displayName: fullName ?? existing.displayName,
      avatarUrl: avatarUrl ?? existing.avatarUrl,
    });
    return { user: existing.user, isNewUser: false };
  }

  // 2. Social account not seen before — find or create the user
  let user = null;
  let isNewUser = false;

  if (email) {
    user = await User.findOne({ where: { email } });
  }

  if (!user) {
    // Brand new user — auto-register as seeker
    const rawName = fullName || (email ? email.split('@')[0] : null) || 'User';
    const safeName = rawName.length >= 2 ? rawName : `${rawName} User`;
    user = await User.create({
      fullName: safeName,
      email: email || null,
      passwordHash: null,
      role: 'seeker',
      isVerified: true,
      emailVerified: true,
      avatarUrl: avatarUrl || null,
    });
    isNewUser = true;
  } else {
    // Existing user — patch missing avatar / mark email verified
    const patch = {};
    if (!user.avatarUrl && avatarUrl) patch.avatarUrl = avatarUrl;
    if (!user.emailVerified) patch.emailVerified = true;
    if (Object.keys(patch).length) await user.update(patch);
  }

  // 3. Create the social account link
  await UserSocialAccount.create({
    userId: user.id,
    provider,
    providerId,
    email: email || null,
    displayName: fullName || null,
    avatarUrl: avatarUrl || null,
    linkedAt: new Date(),
  });

  return { user, isNewUser };
};

// ── POST /api/auth/register ────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role = 'seeker' } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return sendError(res, 'Email already in use.', 409);

    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
    const passwordHash = await bcrypt.hash(password, rounds);

    const user = await User.create({ fullName, email, passwordHash, role });

    const accessToken = await issueTokens(user, res);
    sendSuccess(res, { accessToken, user: publicUser(user) }, 'Registered successfully.', 201);
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

    // Social-only accounts have no password
    if (!user.passwordHash) {
      return sendError(res, 'This account uses social login. Please sign in with Google or Apple.', 401);
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return sendError(res, 'Invalid email or password.', 401);

    const accessToken = await issueTokens(user, res);
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
      refreshToken: null,
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

// ── POST /api/auth/social/google ───────────────────────────────────────────
export const googleAuth = async (req, res, next) => {
  try {
    const { accessToken: googleAccessToken } = req.body;
    if (!googleAccessToken) return sendError(res, 'Google access token is required.', 400);

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return sendError(res, 'Google Sign-In is not configured.', 503);

    const client = new OAuth2Client(clientId);

    // Verify the token and get basic claims
    let tokenInfo;
    try {
      tokenInfo = await client.getTokenInfo(googleAccessToken);
    } catch {
      return sendError(res, 'Invalid Google access token.', 401);
    }

    // Confirm token was issued for our client
    if (tokenInfo.azp !== clientId && tokenInfo.aud !== clientId) {
      return sendError(res, 'Google token audience mismatch.', 401);
    }

    const { sub: providerId, email, email_verified } = tokenInfo;
    if (!email) return sendError(res, 'Google account must have an email address.', 400);
    if (!email_verified) return sendError(res, 'Google email address is not verified.', 400);

    // Fetch full profile (name, picture) using the access token
    let fullName = null;
    let avatarUrl = null;
    try {
      client.setCredentials({ access_token: googleAccessToken });
      const { data } = await client.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });
      fullName = data.name ?? null;
      avatarUrl = data.picture ?? null;
    } catch {
      // Profile fetch failed but token is valid — proceed with limited data
    }

    const { user, isNewUser } = await findOrCreateSocialUser('google', providerId, email, fullName, avatarUrl);
    if (!user.isActive) return sendError(res, 'Account deactivated.', 401);

    const accessToken = await issueTokens(user, res);
    sendSuccess(
      res,
      { accessToken, user: publicUser(user), isNewUser },
      isNewUser ? 'Account created successfully.' : 'Signed in successfully.',
      isNewUser ? 201 : 200
    );
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/social/apple ────────────────────────────────────────────
export const appleAuth = async (req, res, next) => {
  try {
    const { identityToken, user: appleUserData } = req.body;
    if (!identityToken) return sendError(res, 'Apple identity token is required.', 400);

    const clientId = process.env.APPLE_CLIENT_ID;
    if (!clientId) return sendError(res, 'Apple Sign-In is not configured.', 503);

    let applePayload;
    try {
      applePayload = await appleSignin.verifyIdToken(identityToken, {
        audience: clientId,
        ignoreExpiration: false,
      });
    } catch {
      return sendError(res, 'Invalid Apple token.', 401);
    }

    const { sub: providerId, email } = applePayload;

    // Apple only sends user.name on the very first sign-in
    let fullName = null;
    if (appleUserData?.name) {
      const { firstName = '', lastName = '' } = appleUserData.name;
      fullName = `${firstName} ${lastName}`.trim() || null;
    }

    const { user, isNewUser } = await findOrCreateSocialUser('apple', providerId, email, fullName, null);
    if (!user.isActive) return sendError(res, 'Account deactivated.', 401);

    const accessToken = await issueTokens(user, res);
    sendSuccess(
      res,
      { accessToken, user: publicUser(user), isNewUser },
      isNewUser ? 'Account created successfully.' : 'Signed in successfully.',
      isNewUser ? 201 : 200
    );
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me/connected-accounts ───────────────────────────────────
export const getConnectedAccounts = async (req, res, next) => {
  try {
    const accounts = await UserSocialAccount.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'provider', 'email', 'displayName', 'avatarUrl', 'linkedAt'],
      order: [['linkedAt', 'ASC']],
    });

    const hasPassword = !!req.user.passwordHash;
    sendSuccess(res, { accounts, hasPassword });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/auth/me/connected-accounts/:provider ──────────────────────
export const unlinkSocialAccount = async (req, res, next) => {
  try {
    const { provider } = req.params;
    if (!['google', 'apple'].includes(provider)) {
      return sendError(res, 'Invalid provider.', 400);
    }

    const accountCount = await UserSocialAccount.count({ where: { userId: req.user.id } });
    const hasPassword = !!req.user.passwordHash;

    if (accountCount <= 1 && !hasPassword) {
      return sendError(
        res,
        'Cannot remove your last login method. Please set a password first.',
        400
      );
    }

    const deleted = await UserSocialAccount.destroy({
      where: { userId: req.user.id, provider },
    });

    if (!deleted) return sendError(res, `No linked ${provider} account found.`, 404);

    sendSuccess(res, null, `${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked.`);
  } catch (err) {
    next(err);
  }
};
