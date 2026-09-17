import { browser } from 'wxt/browser';
import { addCard, deleteCard, getCards } from '@/utils/cards';
import type { BackgroundMessage } from '@/utils/cards';
import { getCategoryList } from '@/utils/firebase';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (msg: BackgroundMessage) => {
    switch (msg?.type) {
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