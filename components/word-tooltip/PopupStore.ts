import { useSyncExternalStore } from 'react';

export interface WordTooltipState {
  visible: boolean;
  word: string;
  source: string;
  url: string;
  top: number;
  left: number;
}

export const HIDDEN_STATE: WordTooltipState = {
  visible: false,
  word: '',
  source: '',
  url: '',
  top: 0,
  left: 0,
};

let state: WordTooltipState = HIDDEN_STATE;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function setWordTooltip(next: WordTooltipState): void {
  state = next;
  emit();
}

export function hideWordTooltip(): void {
  setWordTooltip({
    ...state,
    visible: false,
  });
}

export function getWordTooltip(): WordTooltipState {
  return state;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useWordTooltip(): WordTooltipState {
  return useSyncExternalStore(subscribe, getWordTooltip);
}