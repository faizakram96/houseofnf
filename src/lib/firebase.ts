import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const isFirebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * 1. Initialize Invisible Recaptcha for Firebase Phone Auth
 */
export function initRecaptcha(containerId: string = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;

  try {
    // Clear previous instance if exists
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('[FIREBASE] Recaptcha verified automatically');
      },
      'expired-callback': () => {
        console.warn('[FIREBASE] Recaptcha expired');
      },
    });

    (window as any).recaptchaVerifier = recaptchaVerifier;
    return recaptchaVerifier;
  } catch (err: any) {
    console.warn('[FIREBASE RECAPTCHA INIT ERROR]', err.message);
    return null;
  }
}

/**
 * 2. Send Real SMS OTP via Firebase Google Infrastructure (10,000 Free SMS/mo)
 */
export async function sendFirebasePhoneOtp(
  rawPhone: string,
  verifier: any
): Promise<ConfirmationResult | null> {
  if (!isFirebaseConfigured) {
    console.log('[FIREBASE] Firebase API Key not present in .env.local, using backend OTP engine.');
    return null;
  }

  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const formattedPhone = `+91${cleanPhone}`;

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    console.log(`[FIREBASE SMS SENT] Google dispatched real SMS OTP to ${formattedPhone}`);
    return confirmationResult;
  } catch (err: any) {
    console.error('[FIREBASE SMS ERROR]', err.message);
    throw err;
  }
}

/**
 * 3. Real Google OAuth Popup
 */
export async function signInWithGoogleRealPopup() {
  if (!isFirebaseConfigured) {
    console.log('[FIREBASE] Firebase credentials missing, using demo Google login.');
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      sub: user.uid,
      email: user.email || '',
      name: user.displayName || 'Customer',
      picture: user.photoURL || '',
      emailVerified: user.emailVerified,
    };
  } catch (err: any) {
    console.error('[FIREBASE GOOGLE LOGIN ERROR]', err.message);
    throw err;
  }
}

export { isFirebaseConfigured };
