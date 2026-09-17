import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { browser } from 'wxt/browser';
import { auth, getCategoryList } from '@/utils/firebase';
import type { Card, DeleteCardResponse } from '@/utils/cards';

const GOOGLE_ICON = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.73-2.46 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4.01-3.1z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44A12 12 0 0 0 1.27 6.6l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75z"
    />
  </svg>
);

function getDisplayTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + ` ${time}`;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (value) => {
      setUser(value);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    getCategoryList().then((list) => {
      if (alive) setCategories(list);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCards([]);
      return;
    }
    let alive = true;
    setCardsLoading(true);
    const load = async () => {
      const res = (await browser.runtime.sendMessage({ type: 'get-cards' })) as
        | { ok: true; cards: Card[] }
        | { ok: false; error: string };
      if (alive) {
        setCards(res?.ok ? res.cards : []);
        setCardsLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [user]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setSignInError('');
    try {
      const res = (await browser.runtime.sendMessage({ type: 'sign-in' })) as
        | { ok: true }
        | { ok: false; error: string };
      if (!res?.ok) {
        setSignInError(res?.error ?? 'Sign-in failed, please try again');
      }
    } catch (error) {
      setSignInError(error instanceof Error ? error.message : 'Sign-in failed, please try again');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setCategories([]);
    setCards([]);
  };

  const handleDelete = async (id: string) => {
    const res = (await browser.runtime.sendMessage({
      type: 'delete-card',
      payload: { id },
    })) as DeleteCardResponse;
    if (res?.ok) {
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const visibleCards = activeCategory
    ? cards.filter((c) => c.category === activeCategory)
    : cards;

  const handleCategoryClick = (category: string) => {
    setActiveCategory((prev) => (prev === category ? '' : category));
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-gray-900">Word Book</h1>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {visibleCards.length}
          </span>
        </div>
        {user ? (
          <button
            onClick={handleSignOut}
            title={user.email ?? undefined}
            className="max-w-32 truncate text-xs text-gray-400 hover:text-gray-600"
          >
            {user.displayName ?? user.email ?? 'Sign out'}
          </button>
        ) : null}
      </header>

      {!authReady ? null : !user ? (
        <div className="flex flex-col items-center gap-3 px-8 py-10">
          <p className="text-sm text-gray-500">Sign in to sync your cards to the cloud</p>
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            {GOOGLE_ICON}
            {signingIn ? 'Signing in...' : 'Sign in with Google'}
          </button>
          {signInError ? (
            <p className="text-center text-xs text-red-500">{signInError}</p>
          ) : null}
        </div>
      ) : (
        <>
          <section className="border-b border-gray-100 bg-white px-4 py-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Categories
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={
                    'rounded-full px-2.5 py-1 text-xs font-medium transition-colors ' +
                    (activeCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100')
                  }
                >
                  {category}
                </button>
              ))}
              {activeCategory ? (
                <button
                  onClick={() => setActiveCategory('')}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200"
                >
                  All
                </button>
              ) : null}
            </div>
          </section>

          <section className="flex items-center justify-between px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              My cards
            </h2>
          </section>

          {cards.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <p className="text-lg">📖</p>
              <p className="text-sm font-medium text-gray-600">
                {cardsLoading ? 'Loading...' : 'No cards yet'}
              </p>
              {!cardsLoading ? (
                <p className="text-xs leading-relaxed text-gray-400">
                  Select English text on any webpage, pick a category, and click 'Create card'
                  to save it here.
                </p>
              ) : null}
            </div>
          ) : visibleCards.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <p className="text-sm font-medium text-gray-600">No cards in this category</p>
              <p className="text-xs text-gray-400">Pick another category or click 'All' to see all cards</p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-gray-100">
              {visibleCards.map((item) => (
                <li key={item.id} className="group flex items-center gap-3 bg-white px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-gray-900">{item.question}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-500">
                        {item.category}
                      </span>
                      {item.answer ? (
                        <span className="truncate">{item.answer}</span>
                      ) : null}
                      <span className="shrink-0">{getDisplayTime(item.createdAt)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete"
                    className="shrink-0 rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <footer className="px-4 py-3 text-center text-[11px] text-gray-300">
        SpacedLink · save words while browsing · v{browser.runtime.getManifest().version}
      </footer>
    </div>
  );
}

export default App;