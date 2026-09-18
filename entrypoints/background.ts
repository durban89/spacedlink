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
import { browser } from 'wxt/browser';
import { addCard, deleteCard, getCards } from '@/utils/cards';
import type { BackgroundMessage } from '@/utils/cards';
import { getCategoryList, signInWithGoogle } from '@/utils/firebase';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (msg: BackgroundMessage) => {
    switch (msg?.type) {
      case 'sign-in':
        try {
          await signInWithGoogle();
          return { ok: true } as const;
        } catch (error) {
          return { ok: false, error: String(error) } as const;
        }
      case 'new-card':
        try {
          const id = await addCard(msg.payload);
          return { ok: true, id } as const;
        } catch (error) {
          return { ok: false, error: String(error) } as const;
        }
      case 'delete-card':
        try {
          await deleteCard(msg.payload.id);
          return { ok: true } as const;
        } catch (error) {
          return { ok: false, error: String(error) } as const;
        }
      case 'get-categories':
        try {
          const categories = await getCategoryList();
          return { ok: true, categories } as const;
        } catch (error) {
          return { ok: false, error: String(error) } as const;
        }
      case 'get-cards':
        try {
          const cards = await getCards();
          return { ok: true, cards } as const;
        } catch (error) {
          return { ok: false, error: String(error) } as const;
        }
      default:
        return null;
    }
  });
});