# SpacedLink

A Chrome extension (MV3) for saving and reviewing English vocabulary while you browse. Select any English text on a page, pick a category, and it becomes a card in your cloud-synced word book.

## Features

- **Select-to-save** — select English text on any page (including inside inputs); a tooltip lets you pick a category, add a meaning/note, and create a card
- **Google Sign-in** — Chrome-native OAuth (`browser.identity.launchWebAuthFlow`), no remote scripts, so it works under MV3's strict CSP
- **Firestore-backed** — cards and categories are stored under `users/{uid}` and stay in sync across devices
- **Category filter** — browse cards by category from the popup
- **Fixed extension ID** — a manifest `key` pins the extension ID so OAuth redirect URIs are stable across machines/reloads

## Tech stack

- [WXT](https://wxt.dev) 0.21 + Vite + TypeScript
- React 19 + Tailwind CSS v4 (popup & tooltip UI)
- Firebase (Auth, Authentication via Google, Cloud Firestore)

## Prerequisites

- Node.js >= 22 and pnpm (developed with pnpm 11)
- A Firebase project with **Authentication** > **Google** provider enabled
- A Google Cloud **OAuth 2.0 Client ID** for the extension

## Setup

```bash
pnpm install
cp .env.example .env
```

Fill in `.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_GOOGLE_CLIENT_ID=
```

`VITE_GOOGLE_CLIENT_ID` is a Google Cloud OAuth 2.0 **Web application** client. Create it at Console > APIs & Services > Credentials, then add the authorize redirect URI to the client:

```
https://<extension-id>.chromiumapp.org/
```

The host is the extension's ID. If you pin it with a `key` in `wxt.config.ts`, load the extension once and read the ID from `chrome://extensions`; register that exact URI in the OAuth client. If you change the `key`, the ID changes and the redirect URI must be updated to match.

## Development

```bash
pnpm dev          # start WXT dev server (load .output/chrome-mv3-dev)
pnpm build        # build for production (load .output/chrome-mv3)
pnpm compile      # typecheck with tsc --noEmit
```

In `chrome://extensions`, enable **Developer mode** → **Load unpacked** and pick the output directory above.

## Project structure

```
entrypoints/
  background.ts       # message router (sign-in, cards CRUD, categories)
  content.tsx         # select-to-save tooltip (Shadow DOM)
  popup/App.tsx       # popup: sign-in, categories, card list
components/
  word-tooltip/       # tooltip UI + shared store
utils/
  firebase.ts         # Firebase init + identity OAuth flow
  cards.ts            # card CRUD + background message types
public/icon/          # extension icons (+ icon.svg source)
wxt.config.ts         # WXT/manifest config (name, description, key, permissions)
```

## License

AGPL-3.0. See [LICENSE](LICENSE).