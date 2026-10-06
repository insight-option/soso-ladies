# SOSO Ladies Salon — website + admin panel

Bilingual (English `/`, Arabic `/ar`) marketing site for **SOSO Ladies Salon (سوسو صالون نسائي)**, Doha, with a private admin panel at `/admin`. The site converts through **WhatsApp** and **phone calls** only — there is no booking, checkout or customer account.

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4
- AWS Amplify Gen 2 backend (`/amplify`): Cognito (one owner), AppSync/DynamoDB, S3
- Self-hosted fonts (Inter, Playfair Display, IBM Plex Sans Arabic, Amiri — SIL OFL, see `src/fonts/licenses`)

## Run locally

```bash
npm ci
npm run dev        # http://localhost:3000  (Arabic: /ar, admin: /admin)
npm run lint
npm run typecheck
npm run build
```

The site works **without** `amplify_outputs.json`: content then comes from the static files in `src/config`, and `/admin` shows a "backend not deployed yet" message. To work against a personal cloud backend, `npx ampx sandbox --profile <aws-profile>` writes that file (git-ignored). Note that this **creates AWS resources**.

### Environment variables

| Name | Where | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Amplify console → *Hosting → Environment variables* (or `.env.local` locally) | The salon's final domain, e.g. `https://www.example.com` (no trailing slash). Used for canonical URLs, hreflang, Open Graph, `sitemap.xml` and `robots.txt`. |

The value is read when the site is **built**, so redeploy after changing it. If it is not set, the build falls back to Amplify's default domain (`https://<branch>.<appId>.amplifyapp.com`), and to `http://localhost:3000` for local development. Nothing is hard-coded. `.env*` files are git-ignored, so never commit them.

### Dependencies and the lockfile

Amplify builds on Node 22, which ships **npm 10**, and runs `npm ci`. A lockfile written by npm 11 can be rejected by npm 10 (`Missing: … from lock file`). After changing dependencies, update and check the lockfile with npm 10:

```bash
npx npm@10 install --package-lock-only
npx npm@10 ci
```

## Where content lives

| What | File | Notes |
| --- | --- | --- |
| Phone / WhatsApp | `src/config/site.ts` | Fixed: `+974 3342 8070`. Never editable from `/admin`. |
| Address, hours, Instagram, email, map | `src/config/site.ts` or `/admin → بيانات التواصل` | `null` = hidden on the site. Nothing is invented. |
| Services | `src/config/services.ts` or `/admin → الخدمات` | One object = card, detail page, sitemap entry and footer link. |
| Salon / home availability | `/admin → الخدمات → أماكن تقديم الخدمة` | Per service (`availableAtSalon`, `availableAtHome`). Not set = nothing shown; only enabled options appear on the site. Never assumed or imported. |
| Offers | `src/config/offers.ts` or `/admin → العروض` | Empty → Offers page shows "coming soon", Home hides the section. |
| Hero video / poster | `public/video/` or `/admin → الوسائط` | Bundled files are the default. |

Database values win over the static files. Services are matched by slug, so built-in services keep their highlights and sub-services. Only published items are shown, sorted by their order in the admin.

### Caching: admin edits appear within ~60 seconds

- **Pages**: the public pages (`src/app/[lang]/**`, `sitemap.ts`) use `dynamic = 'force-dynamic'`, so they are rendered on every request. We deliberately do not use ISR or prerendering. On Amplify Hosting, each server instance kept its own copy of prerendered pages, starting from the build-time copy. Visitors then saw old and new content alternate, depending on which instance answered.
- **Data**: `src/lib/content.ts` keeps successful database responses in memory for **60 seconds per server instance**. The database is read at most once per minute per model and instance, and an edit made in `/admin` shows up on every page within about 60 seconds, with no redeploy.
- **Failures are never cached**: if a read fails, that request shows the static content from `src/config` and the next request retries. A new server instance always reads from the database, never from build-time data.
- **Logs** (Amplify console → *Hosting → Monitoring → Hosting compute logs*, i.e. CloudWatch). Messages contain only the error name and message, never error objects, keys, tokens or configuration:
  - `[amplify] services read failed: <ErrorName>: <message>` (also `offers read` / `settings read`): a database read failed, and that request used the static content.
  - `[amplify] amplify_outputs.json not found …`: the backend config is missing. Logged once per instance; retried on every request.
  - `[content] services: database returned 0 rows; using static config`: a successful but empty read, e.g. before "Import current services".

Uploaded files are stored in S3 under `media/` and served through `/api/media/<key>`. That route redirects to a fresh presigned URL, so presigned URLs never end up in cached HTML.

## Deploy with AWS Amplify Hosting

### 1. Connect the repository

1. Amplify console → **Create new app** → **GitHub** → authorize → select `insight-option/soso-ladies` and the `main` branch.
2. Amplify detects Next.js (SSR) and uses `amplify.yml` from the repository. Keep the default build settings.
3. **Service role**: choose *Create and use a new service role* (or an existing role with the `AmplifyBackendDeployFullAccess` policy). The backend phase needs it to deploy Cognito, AppSync/DynamoDB and S3.
4. *Optional now, recommended before launch*: add the `NEXT_PUBLIC_SITE_URL` environment variable (see above).
5. **Save and deploy**. In the build log, the backend phase deploys the `amplify/` stack and the frontend phase runs `next build`.

### 2. Custom domain

Amplify console → **Hosting → Custom domains** → add the salon's domain. Then set `NEXT_PUBLIC_SITE_URL` to `https://<that domain>` and redeploy.

### 3. Create the owner account (once)

Self sign-up is disabled (`allowAdminCreateUserOnly`), so the only account is created by hand:

1. Open the user pool. Either use Amplify console → the app → **Authentication** → **User management**, or the **Amazon Cognito** console → **User pools** → the pool whose name starts with `amplifyAuthUserPool` (same region as the app).
2. **Users** → **Create user**.
3. **Invitation message**: *Send an email invitation* (Cognito emails a temporary password), or *Don't send an invitation* and give the temporary password to the owner privately.
4. **Email address**: the owner's email. Tick **Mark email address as verified**. This is required for "Forgot password?" to work.
5. **Temporary password**: generate or set one. It needs at least 8 characters with upper-case, lower-case, a number and a symbol.
6. **Create user**. Its status shows *Force change password*.
7. The owner opens `https://<domain>/admin`, signs in with the email and temporary password, and is asked to choose a new password.

Don't create other users: any user in this pool can edit the website.

### 4. First sign-in: import the services

In `/admin` → **الخدمات**, press **استيراد الخدمات الحالية** once. This copies the five built-in services into the database so they can be edited, hidden, reordered or given new photos. Until then, the site shows the built-in services and the "Add service" button stays disabled.

### 5. Check that it works

- Add a hidden test offer with a photo → make it visible → it should appear on `/offers` within about a minute, with its image loading through `/api/media/…`. Then delete it.
- `/admin` must never be indexed: it sends `X-Robots-Tag: noindex`, has a `noindex` meta tag, and is disallowed in `robots.txt`.

### Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `/admin` says the backend is not deployed | The backend phase did not produce `amplify_outputs.json`. Check the backend step of the build log and the service role. |
| Build fails at `npm ci` | The lockfile was updated with npm 11. Regenerate it with npm 10 (see above). |
| Uploaded image doesn't show | Check the `media/*` objects in the Amplify Storage bucket, and the guest read access defined in `amplify/storage/resource.ts`. |
| Change not visible | Database responses are cached for up to 60 s per server instance. Reload after a minute. If it is still old, look for `[amplify] … read failed` in the Hosting compute logs. |

## Structure

```
amplify/            auth · data · storage · backend.ts
public/             brand/logo.png · images/ · video/hero.(mp4|webm) · hero-poster.webp
src/app/[lang]/     layout, home, services, services/[slug], offers, about, contact, not-found
src/app/admin/      separate root layout (ar, rtl, noindex) + page
src/app/api/media/  [...path]/route.ts — presigned S3 redirect
src/config/         site.ts · services.ts · offers.ts
src/i18n/           config · routes · dictionaries · en · ar (ar.ts is typed by en.ts)
src/lib/            content (server, DB + fallback) · amplify-server · seo · nav · media · contact-details
src/components/     ui · cta · layout · sections · admin
src/fonts/          self-hosted font files + index.ts
src/proxy.ts        locale routing (/ → /en rewrite, /en/* → / redirect)
```

WhatsApp and phone URLs are built in one place only: `src/components/cta/ContactLinks.tsx`.

## Assets

- `public/brand/logo.png` is the official logo, with only its empty white margin trimmed. It is shown with `mix-blend-mode: multiply`. The favicon and app icons are crops of the same file.
- `public/images/**` are stills taken from the supplied hero video (`Soso_Website_Hero_12s.mp4`). Services without a photo show a blush placeholder with the service icon. Real photos can be uploaded from `/admin`.
