/*
 * SpacedLink
 * Copyright (C) 2026 Daniel Zhang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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