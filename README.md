# Park Passport

A Next.js app for tracking U.S. National Park visits. Sign up, check off parks you've been to, save your progress, and build a ranked wishlist for parks still on your bucket list.

Built with **Next.js**, **React**, **vanilla CSS**, **Firebase** (Auth + Firestore), and deployed on **Vercel**.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with hero and sign-up / log-in |
| `/dashboard` | Protected dashboard — visited parks, wishlist, and full park list |

## Local development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Firebase** — copy the example env file and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

   Get values from Firebase Console → Project Settings → Your apps, or run:

   ```bash
   npx firebase-tools@latest apps:sdkconfig web <APP_ID>
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Firebase setup

1. Log in and create or select a project:

   ```bash
   npx firebase-tools@latest login
   npx firebase-tools@latest projects:create
   npx firebase-tools@latest apps:create web park-passport
   ```

2. Enable **Email/Password** auth in the [Firebase Console](https://console.firebase.google.com/project/_/authentication/providers).

3. Create a **Firestore** database (production mode is fine — included rules lock data per user).

4. Deploy Firestore rules and auth config:

   ```bash
   npx firebase-tools@latest use --add <PROJECT_ID>
   npm run firebase:deploy-rules
   ```

## Vercel deployment

1. Push this repo to GitHub.

2. Import the project in [Vercel](https://vercel.com/new):
   - Framework preset: **Next.js**
   - Add the `NEXT_PUBLIC_FIREBASE_*` environment variables from `.env.example`

3. Deploy. Vercel detects Next.js automatically.

Or deploy from the CLI:

```bash
npx vercel
```

## Project structure

```
├── app/
│   ├── layout.js           # Root layout + global styles
│   ├── page.js             # Home page (/)
│   ├── dashboard/page.js   # Dashboard (/dashboard)
│   └── globals.css
├── components/             # React components
├── context/                # Auth and toast providers
├── lib/                    # Firebase, auth helpers, park data
├── css/                    # Token-based design system
├── firestore.rules
├── firebase.json
└── next.config.js
```

## Design system

Colors are defined as CSS custom properties in `css/tokens.css`:

- **Primitive tokens** — green and orange scales (`--green-*`, `--orange-*`)
- **Semantic tokens** — component-level assignments (`--color-primary`, `--button-primary-bg`, etc.)

Backgrounds use green-to-orange gradients for hero sections, progress bars, and accent surfaces.

## Data model

Each user document lives at `users/{uid}`:

```json
{
  "visited": ["yosemite", "zion"],
  "wishlist": ["denali", "glacier", "arches"],
  "updatedAt": "<timestamp>"
}
```

Wishlist order is the rank (index 0 = #1 priority).
