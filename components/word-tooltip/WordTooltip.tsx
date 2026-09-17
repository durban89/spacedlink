import { useEffect, useRef, useState } from 'react';
import { browser } from 'wxt/browser';
import { hideWordTooltip, useWordTooltip } from './PopupStore';
import type { NewCardResponse } from '@/utils/cards';

type SaveStatus = 'idle' | 'saving' | 'done' | 'error';

const TOOLTIP_WIDTH = 288;

export function WordTooltip() {
  const state = useWordTooltip();
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState('');
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!state.visible) return;
    setStatus('idle');
    setError('');
    if (fetchedRef.current) return;
    (async () => {
      const res = (await browser.runtime.sendMessage({ type: 'get-categories' })) as
        | { ok: true; categories: string[] }
        | { ok: false; error: string };
      if (res?.ok && res.categories.length > 0) {
        fetchedRef.current = true;
        setCategories(res.categories);
        setCategory((prev) => prev || res.categories[0]!);
      } else {
        setError('获取分类失败，请先在扩展中完成 Google 登录');
        setStatus('error');
      }
    })();
  }, [state.visible]);

  if (!state.visible || !state.word) return null;

  const domain = state.url ? new URL(state.url).hostname : state.source;

  const handleSave = async () => {
    if (status === 'saving') return;
    if (!category) {
      setStatus('error');
      setError('请先在扩展里登录并同步分类');
      return;
    }
    setStatus('saving');
    const payload = { category, question: state.word, answer: answer.trim() };
    const res = (await browser.runtime.sendMessage({
      type: 'new-card',
      payload,
    })) as NewCardResponse;
    if (res?.ok) {
      setStatus('done');
      setTimeout(() => {
        setStatus('idle');
        setAnswer('');
        hideWordTooltip();
      }, 1000);
    } else {
      setStatus('error');
      setError(res?.error ?? '创建卡片失败');
    }
  };

  const left = Math.min(state.left, window.innerWidth - TOOLTIP_WIDTH - 8);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSave();
      }}
      onMouseDown={(e) => {
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'select' && tag !== 'textarea') e.preventDefault();
      }}
      className="fixed z-[2147483647] select-none rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
      style={{ top: state.top, left, width: TOOLTIP_WIDTH }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words text-base font-semibold text-gray-800">{state.word}</p>
          {domain ? <p className="mt-0.5 truncate text-xs text-gray-400">{domain}</p> : null}
        </div>
        <button
          type="button"
          onClick={hideWordTooltip}
          aria-label="关闭"
          className="-mr-1 -mt-1 shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <label className="mb-1 block text-xs font-medium text-gray-500">分类</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-400"
      >
        {categories.length === 0 ? <option value="">加载中…</option> : null}
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className="mb-1 block text-xs font-medium text-gray-500">释义 / 备注</label>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="可选，例如单词释义"
        className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-blue-400"
      />

      {status === 'done' ? (
        <div className="w-full rounded-lg bg-green-50 py-1.5 text-center text-sm font-medium text-green-600">
          已创建卡片
        </div>
      ) : (
        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full rounded-lg bg-blue-500 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
        >
          {status === 'saving' ? '创建中…' : '创建卡片'}
        </button>
      )}
      {status === 'error' ? (
        <p className="mt-1.5 break-words text-center text-xs text-red-500">{error}</p>
      ) : null}
    </form>
  );
}