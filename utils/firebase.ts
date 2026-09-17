import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

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

export async function ensureSignIn(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
  return user;
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