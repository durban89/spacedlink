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
    build: {
      chunkSizeWarningLimit: 1000,
    },
  }),
});