import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'SpacedLink',
    description:
      'Save English words while browsing. Select text on any page to create vocabulary cards and sync them to the cloud.',
    permissions: ['identity'],
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwu+8mZbCLuETHlBkWO1xVoev+wvJk6BShdXbZ9pLVpPC7HKY3ybDqpAOyZUBsqfzKPyqH04+Uggo8a0zsS1Q9E4wR74/HQazRPE+gTqCpg8Ese4bgYZh+W3B4fCJpR6KDzy0ne0qeeRYOhQ745vutb56EghnhbrGSFSUzlUrDSpgM6DKevu/shYwgx71FilhgRIKdx7hdBor1btb3XbSFHAzbGjAOLm4ZUmzRPGoCFzPLjkwICaxsyXrhY3glAdUSP4QvVgn+X7cvXXyctOTfFB795TP3WdnnQIpudGJ6p767bo7r8i/CYbURzNKNcf18Zjx+8nCls7fwOx5EmpxKwIDAQAB',
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});