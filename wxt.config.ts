import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'SpacedLink',
    description: '划词收藏生词，随手记住不认识的英文单词',
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});