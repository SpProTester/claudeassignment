import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth.js';

const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID ?? '';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function SocialButton({ onClick, disabled, loading, icon: Icon, label, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl font-semibold text-sm transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <Icon />
      )}
      <span className="text-gray-700">{label}</span>
    </button>
  );
}

export default function SocialLoginButtons({ onSuccess, onError, disabled = false }) {
  const { socialLogin } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const googleEnabled = !!GOOGLE_CLIENT_ID;
  const appleEnabled = !!APPLE_CLIENT_ID;

  // Google uses the implicit token flow — credential is a signed JWT ID token
  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      // tokenResponse.access_token from useGoogleLogin implicit flow
      // We call the userinfo endpoint on the backend instead of verifying locally
      const user = await socialLogin('google', { accessToken: tokenResponse.access_token });
      onSuccess?.(user);
    } catch (err) {
      onError?.(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setGoogleLoading(false);
      onError?.('Google Sign-In was cancelled or failed.');
    },
    flow: 'implicit',
  });

  const handleGoogleClick = () => {
    if (!googleEnabled) {
      onError?.('Google Sign-In is not configured. Please contact support.');
      return;
    }
    setGoogleLoading(true);
    triggerGoogleLogin();
  };

  const handleAppleClick = async () => {
    if (!appleEnabled) {
      onError?.('Apple Sign-In is not configured. Please contact support.');
      return;
    }

    if (!window.AppleID) {
      onError?.('Apple Sign-In requires a secure (HTTPS) connection.');
      return;
    }

    setAppleLoading(true);
    try {
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();
      const { authorization, user: appleUserData } = response;

      const user = await socialLogin('apple', {
        identityToken: authorization.id_token,
        authorizationCode: authorization.code,
        user: appleUserData || null,
      });

      onSuccess?.(user);
    } catch (err) {
      // popup_closed_by_user is not an error
      if (err?.error !== 'popup_closed_by_user') {
        onError?.(err.message || 'Apple Sign-In failed. Please try again.');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <SocialButton
        onClick={handleGoogleClick}
        disabled={disabled}
        loading={googleLoading}
        icon={GoogleIcon}
        label="Continue with Google"
      />
      <SocialButton
        onClick={handleAppleClick}
        disabled={disabled}
        loading={appleLoading}
        icon={AppleIcon}
        label="Continue with Apple"
        className="bg-black border-black text-white hover:bg-gray-900 hover:border-gray-900 [&_span]:text-white"
      />
    </div>
  );
}
