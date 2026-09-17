import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { db, ensureSignIn } from './firebase';

export interface NewCard {
  category: string;
  question: string;
  answer: string;
}

export interface Card extends NewCard {
  id: string;
  level: number;
  nextReview: number;
  createdAt: number;
  updatedAt: number;
}

export async function addCard(input: NewCard): Promise<string> {
  const user = await ensureSignIn();
  if (!user) throw new Error('not-signed-in');
  const now = Date.now();
  const docRef = await addDoc(collection(db, 'users', user.uid, 'cards'), {
    category: input.category,
    question: input.question,
    answer: input.answer,
    level: 0,
    nextReview: now,
    reviewHistory: [],
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function getCards(): Promise<Card[]> {
  const user = await ensureSignIn();
  if (!user) return [];
  const q = query(
    collection(db, 'users', user.uid, 'cards'),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Card, 'id'>) }));
}

export async function deleteCard(id: string): Promise<void> {
  const user = await ensureSignIn();
  if (!user) return;
  await deleteDoc(doc(db, 'users', user.uid, 'cards', id));
}

export type BackgroundMessage =
  | { type: 'new-card'; payload: NewCard }
  | { type: 'delete-card'; payload: { id: string } }
  | { type: 'get-categories' }
  | { type: 'get-cards' }
  | { type: 'sign-in' };

export type BackgroundResponse<T> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

export type NewCardResponse = BackgroundResponse<{ id: string }>;
export type DeleteCardResponse = BackgroundResponse<Record<never, never>>;
export type GetCardsResponse = BackgroundResponse<{ cards: Card[] }>;