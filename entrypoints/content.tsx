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
import { createRoot } from 'react-dom/client';
import { WordTooltip } from '@/components/word-tooltip/WordTooltip';
import { setWordTooltip, hideWordTooltip } from '@/components/word-tooltip/PopupStore';
import '@/styles/tooltip.css';

const TOOLTIP_WIDTH = 288;
const TOOLTIP_HEIGHT = 210;
const MARGIN = 8;

const ENGLISH_RE = /^[A-Za-z][A-Za-z0-9'’\- ]*$/;

function getSelectedText(): string | null {
  const active = document.activeElement;
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
    if (active.selectionStart == null || active.selectionEnd == null) return null;
    if (active.selectionEnd <= active.selectionStart) return null;
    return active.value.slice(active.selectionStart, active.selectionEnd).trim();
  }
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return null;
  return selection.toString().replace(/\s+/g, ' ').trim();
}

function getSelectionRect(): DOMRect | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  return selection.getRangeAt(0).getBoundingClientRect();
}

function clampTooltipPosition(rect: DOMRect): { top: number; left: number } {
  let left = Math.max(MARGIN, rect.left);
  if (left + TOOLTIP_WIDTH > window.innerWidth - MARGIN) {
    left = Math.max(MARGIN, window.innerWidth - TOOLTIP_WIDTH - MARGIN);
  }
  let top = rect.bottom + MARGIN;
  if (top + TOOLTIP_HEIGHT > window.innerHeight - MARGIN) {
    top = Math.max(MARGIN, rect.top - TOOLTIP_HEIGHT - MARGIN);
  }
  return { top, left };
}

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'spacedlink-word-tooltip',
      position: 'inline',
      onMount(container) {
        const root = createRoot(container);
        root.render(<WordTooltip />);
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });
    ui.mount();

    function showForSelection(): void {
      const text = getSelectedText();
      if (!text || !ENGLISH_RE.test(text)) {
        hideWordTooltip();
        return;
      }
      let rect = getSelectionRect();
      if (!rect) {
        const active = document.activeElement;
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
          rect = active.getBoundingClientRect();
        }
      }
      if (!rect) {
        hideWordTooltip();
        return;
      }
      const { top, left } = clampTooltipPosition(rect);
      setWordTooltip({
        visible: true,
        word: text,
        source: document.title || '',
        url: location.href,
        top,
        left,
      });
    }

    function isInsideOurUi(event: Event): boolean {
      const first = event.composedPath()[0];
      return first instanceof Node && ui.shadow.contains(first);
    }

    function onMouseUp(event: MouseEvent): void {
      if (isInsideOurUi(event)) return;
      showForSelection();
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') hideWordTooltip();
    }

    function onScroll(_event: Event): void {
      hideWordTooltip();
    }

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
  },
});