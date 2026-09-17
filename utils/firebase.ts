import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithCredential } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { browser } from 'wxt/browser';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);

const DEFAULTS = [
  'System Integration PM',
  'PMP',
  'Software Engineer',
  'Information Security',
  'French',
  'Other',
];

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

function buildGoogleAuthUrl(): string {
  const redirectUri = `https://${browser.runtime.id}.chromiumapp.org/`;
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

export async function signInWithGoogle(): Promise<User> {
  const redirectUrl = await browser.identity.launchWebAuthFlow({
    url: buildGoogleAuthUrl(),
    interactive: true,
  });
  if (!redirectUrl) throw new Error('Google sign-in was canceled');
  const params = new URLSearchParams(new URL(redirectUrl).hash.slice(1));
  const accessToken = params.get('access_token');
  if (!accessToken) throw new Error('Google sign-in did not return an access token');
  const credential = GoogleAuthProvider.credential(null, accessToken);
  const { user } = await signInWithCredential(auth, credential);
  return user;
}

export async function ensureSignIn(): Promise<User | null> {
  return getCurrentUser();
}

export async function getCategoryList(): Promise<string[]> {
  const user = await ensureSignIn();
  if (!user) return DEFAULTS;
  const snap = await getDoc(doc(db, 'users', user.uid));
  const list: unknown = snap.data()?.categories;
  if (Array.isArray(list) && list.length > 0) {
    return [...new Set(list.filter((c): c is string => typeof c === 'string'))];
  }
  return DEFAULTS;
}