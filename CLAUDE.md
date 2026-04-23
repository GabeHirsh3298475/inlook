# Inlook

Brand-creator marketplace that connects small brands with verified creators (YouTube and/or TikTok) for product launch sponsorships. Creators apply, connect YouTube and/or TikTok for verified analytics, and go live on the network. Brands browse verified creator profiles with real engagement data.

> **Active branch: `all-apis`.** All multi-platform (TikTok + YouTube) work — TikTok OAuth/PKCE, `primary_platform` routing, `/network` marketplace split, TikTok stats refresh, avatar routing by primary platform — lives on this branch. `main` still reflects the YouTube-only world. Assume work continues on `all-apis` unless told otherwise.

## Tech Stack

- **Framework:** Next.js 14.2 (App Router, server + client components)
- **Language:** TypeScript 5.6 strict
- **Auth:** Clerk v7.2.2 (user auth, middleware protection, admin role via publicMetadata) + NextAuth 4.24 (YouTube OAuth for read-only channel stats)
- **Auth backend:** `@clerk/backend` v3.2.12 for server-side Clerk invitation creation
- **Database:** Supabase (creators, brands, conversations, messages, deals, creator_waitlist tables — service role key for server ops)
- **Styling:** Tailwind CSS 3.4 with custom `ink` (dark theme grays) and `accent` (#d4ff3a green) color tokens
- **Fonts:** Fraunces (display), IBM Plex Sans (body), IBM Plex Mono (mono)
- **UI:** Framer Motion (transitions), Lucide React (icons)
- **Email:** nodemailer via SMTP — branded HTML templates for application confirmation, welcome/approval, and admin notification emails

## Project Structure

```
app/
  page.tsx              # Homepage (landing)
  layout.tsx            # Root layout with ClerkProvider + SessionProvider. Sets metadataBase + openGraph/twitter card (images auto-wired by app/opengraph-image.tsx)
  opengraph-image.tsx   # Dynamic 1200x630 OG/Twitter image via next/og ImageResponse (edge runtime). Renders logo + "Connect your brand with creators" + tagline. File-convention overrides metadata.openGraph.images for every route unless a segment defines its own
  sitemap.ts            # Public sitemap (static routes + dynamic creator URLs)
  robots.ts             # robots.txt (disallow /api/, /dashboard, /messages, /sign-in*, /sign-up, /no-signup)
  providers.tsx         # Client-side providers wrapper
  apply/                # Creator application form (3 fields: name, email, niche) with YouTube + TikTok OAuth (at least one required). Primary platform is derived from which account(s) the creator connects.
  brands/               # Brand-facing pitch page (includes brand waitlist form)
    [id]/               # Protected brand profile (creator/brand/admin only — shows business_name/bio/product_url/social_url, NEVER email)
  creators/             # Public "For creators" pitch page (marketing copy + apply CTA). NOT the marketplace.
  network/              # Public creator marketplace browser (server component fetches live creators from Supabase). This is what used to live at /creators.
    [id]/               # Individual creator profile page (basic info / about / price / analytics)
  dashboard/            # Protected — creator dashboard, brand dashboard, or admin panel (role-based)
  messages/             # Protected messaging UI (brand + creator). Polling thread view + list + agreement buttons in header (brand → "Offer long/short", creator → "Accept long/short" only after brand has offered)
  join/                 # Creator waitlist page (legacy)
  waitlist/             # Non-YouTube creator waitlist (TikTok/Instagram/X/Twitch/Other). Inserts into creator_waitlist table
  privacy/              # Public Privacy Policy page
  terms/                # Public Terms of Service page (includes FTC #ad disclosure obligation for creators)
  pricing/              # Public pricing page ($0 for brands / 15% platform fee for creators, Stripe Connect 85/15 split, FAQ)
  sign-in/              # Clerk sign-in
  sign-in-token/        # Legacy magic-link landing page (fallback only)
  sign-up/              # Clerk sign-up (invitation-only — redirects to /no-signup without __clerk_ticket)
  no-signup/            # "Sign-up disabled" page
  api/
    apply/              # POST creator application (inserts row + saves YouTube tokens + syncs stats)
      save-youtube-tokens/ # Saves NextAuth YouTube tokens to creator row (used for re-sync)
      sync-youtube/     # Fetches YouTube Data API + Analytics API stats, returns channel info
    auth/[...nextauth]/ # NextAuth Google OAuth handler
    admin/              # approve, reject, unreject, unpublish, toggle-visibility (creators); verify, reject-brand, unreject-brand (brands); mark-payment-link-sent, mark-paid (agreements — mark-paid also snapshots into `deals`)
    brands/apply/       # POST brand application (inserts brand row + emails support@inlookdeals.com)
    brand/              # link-account, update-bio endpoints
    creator/            # link-account, publish, update-profile, refresh-stats endpoints
    messages/           # start (brand-only, idempotent), send (inserts + fires first-msg/first-reply email), list, [id] (thread + agreement flags), [id]/agree (flip caller's agreement flag + email counterparty)
    waitlist/           # POST — public, inserts into creator_waitlist
components/             # Shared UI: nav, footer, logo, creator-card, verified-badge, message-button, messages-preview, chat-avatar
lib/
  supabase.ts           # Supabase client + CreatorRow, BrandRow, ConversationRow, MessageRow, ConversationPreview, AgreementEntry types (canonical source for all column types)
  auth-options.ts       # NextAuth config (shared by API routes — extracted because App Router forbids extra exports from route files)
  email.ts              # Email templates: sendApplicationConfirmation, sendWelcomeEmail, sendBrandWelcomeEmail, sendAdminNotification, sendBrandApplicationConfirmation, sendBrandApplicationNotification, sendCreatorNewMessageEmail, sendBrandMessageReplyEmail, sendCreatorAgreementEmail, sendBrandAgreementEmail
types/
  next-auth.d.ts        # Session type augmentation (accessToken, refreshToken)
```

## Flows

### 1. Creator Application Flow

1. Creator visits `/apply` — sees 4-field form (name, email, platform, niche) + "Connect YouTube" and "Connect TikTok" cards. Follower totals are pulled from the connected platforms — no manual entry, no channel URL field.
2. Form data persists across **both** OAuth round-trips via `sessionStorage` under key `"inlook-apply-draft"`:
   - **YouTube:** NextAuth Google OAuth (`youtube.readonly` + `yt-analytics.readonly`). On return, YouTube sync fires once `connected === true` AND `form.email` is populated (`POST /api/apply/save-youtube-tokens` then `POST /api/apply/sync-youtube`).
   - **TikTok:** `GET /api/tiktok/start` — CSRF state + PKCE S256, redirects to TikTok authorize. Scopes `user.info.basic,user.info.profile,user.info.stats,video.list` (`user.info.profile` is required to receive `profile_deep_link`, which we persist as `tiktok_url` for the creator's public profile link). Callback at `/api/tiktok/callback` sets a signed `inlook_tiktok` cookie (HMAC-SHA256 via `NEXTAUTH_SECRET`) with tokens + profile snapshot, redirects to `/apply?tiktok=connected`. `/apply` reads live status via `GET /api/tiktok/status` (cookie payload minus tokens). Disconnect: `POST /api/tiktok/disconnect`.
3. **Submission rule:** at least one of YouTube or TikTok must be connected. `POST /api/apply` returns 400 otherwise.
4. On submit:
   - Inserts creator row (`approved: false`, `published: false`), persists YouTube tokens and TikTok tokens + profile snapshot from the signed cookie (via `verifyCookie()` in `lib/tiktok.ts`).
   - Runs YouTube Data + Analytics sync inline if connected.
   - Runs TikTok video aggregate (`fetchVideoAggregate` in `lib/tiktok.ts`) inline if connected — pages through `video.list` (up to 10 pages × 20 videos), sums likes/comments/shares/views for lifetime and for videos with `create_time` in the last 30d, writes all totals + rates to Supabase.
   - Sends application confirmation + admin notification emails.
   - Clears the TikTok cookie on success.

**TikTok metrics computed at sync time:**
- `tiktok_avg_engagement_rate` = `(total_likes + total_comments + total_shares) / total_views × 100` (capped at 100)
- `tiktok_engagement_rate_30d` = same, restricted to videos posted in last 30 days
- Per-view ratios rendered on the dashboard: avg likes / avg comments / avg shares = `total_X / total_views × 100`
- **Not available from TikTok Login Kit:** saves/bookmarks. Engagement math uses likes + comments + shares only.

### 2. Admin Approval Flow

1. Admin visits `/dashboard` — server component checks `user.publicMetadata.role === "admin"`, renders admin panel
2. Admin panel has a top-level section toggle: **Creators** / **Brands** / **Agreements** (see Flow 7). Creators and Brands sections each have three tabs — Pending, Approved/Verified, Rejected — all with optimistic UI updates
3. **Creators section** — admin clicks "Approve" on a pending creator → client optimistically moves card to Approved tab. `POST /api/admin/approve` fires:
   - Sets `approved: true` in Supabase
   - Fetches creator email and name
   - **Clerk invitation** created via `clerk.invitations.createInvitation()` with `notify: false` (Clerk does NOT send its own email), `redirectUrl: /dashboard`, and `publicMetadata: { role: "creator" }`
   - **Welcome email** sent separately via `sendWelcomeEmail()` with the invitation URL as the button href
   - Invitation and email are in **separate try/catch blocks** — if the Clerk invitation fails (duplicate, existing user, etc.), the welcome email still sends with a fallback link to `/sign-in`
4. **Brands section** — admin clicks "Verify" on a pending brand → `POST /api/admin/verify` fires, mirroring the creator approve flow exactly except:
   - Sets `verified: true` on the `brands` row (field is `verified`, not `approved`)
   - Clerk invitation uses `publicMetadata: { role: "brand" }`
   - Welcome email uses `sendBrandWelcomeEmail()`
5. Approved creators and verified brands have **no "Remove" action** in the admin UI — those lists are read-only except for the Rejected tab's "Move to Pending" affordance (backed by `/api/admin/unreject` and `/api/admin/unreject-brand`).

### 3. Creator Sign-In / Account Setup Flow

1. Creator receives welcome email with "Set up my account" button linking to Clerk invitation URL
2. Clerk redirects to `/sign-up?__clerk_ticket=...`
3. Sign-up page checks for `__clerk_ticket` param — if present, renders Clerk `<SignUp />` component; if absent, redirects to `/no-signup` (blocks random sign-ups)
4. Creator sets their password via Clerk's sign-up form
5. `publicMetadata: { role: "creator" }` from the invitation is automatically applied to the new Clerk user
6. After sign-up, redirected to `/dashboard` (via invitation `redirectUrl` and `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`)
7. Dashboard client calls `POST /api/creator/link-account` on first load — matches creator by email, saves `clerk_user_id` to Supabase (only sets it if currently null)

### 4. Creator Dashboard Flow

1. Creator signs in → `/dashboard` server component fetches creator row by `clerk_user_id` (and falls back to linking by email if the row has no `clerk_user_id` yet — first load after sign-up). Same fallback also syncs the creator's `full_name` back to Clerk as firstName/lastName.
2. **Draft state** (not yet published):
   - **Analytics cards are platform-gated** — `YouTubeStats` renders only when `youtube_channel_id` is set; `TikTokStats` renders only when `tiktok_open_id` is set. If a creator connected both, both cards render stacked. If neither, a `NoPlatformCard` prompts them to go to `/apply`.
   - YouTube card: subscribers, engagement rate, avg view rate, 30d engagement, sub growth (30d %+count), total videos, total views. Refresh via `POST /api/creator/refresh-stats`.
   - TikTok card: avatar + display name, **Avg Engagement Rate**, **Avg Likes/Comments/Shares per View** (per-view ratios as percentages), followers, video count, total views, total likes. Refresh via `POST /api/creator/refresh-tiktok-stats` — uses stored `tiktok_refresh_token` → new access token → re-runs `fetchUserInfo` + `fetchVideoAggregate` → rewrites all `tiktok_*` columns. **No 30D row** — removed to keep the card focused.
   - Profile setup form: **Connected Platforms** (read-only chips for what the creator connected at apply), **Primary Platform selector** (options gated by what's connected: `youtube`/`tiktok`/`both`; selector hidden if only one platform is connected), bio for brands (300 char max), pricing (long-form and short-form video rates), **Post Publicly** and **Show Deal Stats** toggles. No social URL inputs — links are derived from connected accounts only.
   - Primary platform determines the stats shown on the creator's network card and the *order* of analytics sections on their full profile. Selector writes immediately via `POST /api/creator/update-profile`.
   - Go-live checklist: **Platform connected (YouTube or TikTok)**, bio written (min 50 chars), long video rate set, short video rate set. (No "Profile saved" gate — Save button persists changes but Go Live is not blocked by unsaved state.)
   - "Go Live" button → `POST /api/creator/publish` sets `published: true`
3. **Live state** (published):
   - Editable bio + Post Publicly toggle (both live-editable via `POST /api/creator/update-profile`)
   - Stats display, pricing display, social links display
   - Profile visible on `/network` marketplace and `/network/[id]` profile page

### 4b. Brand Application / Sign-In / Dashboard Flow

1. Brand fills out the `/brands` waitlist form (business name, email, product link, optional social URL) → `POST /api/brands/apply`:
   - Inserts a row into the `brands` table (`verified: false`, `rejected: false`)
   - Sends brand application confirmation email to the applicant via `sendBrandApplicationConfirmation`
   - Sends admin notification email to `support@inlookdeals.com` via `sendBrandApplicationNotification`
2. Admin verifies the brand via the admin panel's Brands section (see Flow 2).
3. Brand receives welcome email → Clerk invitation flow (identical to creator) with `publicMetadata: { role: "brand" }` → lands on `/dashboard`
4. `/dashboard` server component: when `role === "brand"`, fetches brand row by `clerk_user_id`, with an email-based fallback that sets `clerk_user_id` on first sign-in (same pattern as creators). Same fallback also syncs the brand's `business_name` back to Clerk as `firstName`.
5. Brand dashboard (`brand-dashboard-client.tsx`) shows business name, email, product link, and social media URL (read-only, "Contact support to update" on product link + social URL). It also has an editable **About** section backed by `brands.bio`, saved via `POST /api/brand/update-bio` (max 500 chars). The bio is optional — it does not gate anything on the brand. Includes a "Browse the creator network" link to `/network`.

### 5. Creator Network (`/network`) + Profile (`/network/[id]`)

- `/network` is a **server component** that fetches from Supabase where `approved = true AND published = true AND admin_hidden = false`. No placeholder data. (`/creators` is a separate static pitch page — don't confuse the two.)
- When no creators are live: renders "Inlook is still in beta testing. Creators coming soon..."
- **Role-based data gating** (in `app/network/page.tsx`'s `toPublicCreator`): before sending data to the client, the server checks whether the viewer is a brand, admin, or the creator themselves (`isSelf` via `clerk_user_id` match) — all three get full access. Everyone else gets a `PublicCreator` shape with `avg_view_rate`, `avg_engagement_rate`, `engagement_rate_30d`, `tiktok_avg_engagement_rate`, and `tiktokAvgLikesPerView` stripped to `null`, and (if `post_publicly = true`) `price_long_video` / `price_short_video` stripped to `null`. Stripped fields are never sent to the client, so inspect-element can't unblur them.
- **Avatar routing** (card + full profile): the rendered avatar follows `primary_platform`. TikTok-primary creators show `tiktok_avatar_url` (falling back to `profile_picture_url`); everyone else shows `profile_picture_url` (falling back to `tiktok_avatar_url`). Both `components/creator-card.tsx` and `app/network/[id]/page.tsx` use this same fallback chain.
- Card layout (sections separated by dividers):
  1. Profile picture + name + niche chip (top-right); then followers + social icons row for connected platforms (YouTube/TikTok).
  2. **Analytics — primary-platform-driven**: if `primary_platform === "youtube"` shows Avg. View Rate + Avg. Engagement Rate; if `"tiktok"` shows TikTok **Avg. Engagement Rate** + **Avg. Likes / View** (the same two metrics as the dashboard's TikTok card); if `"both"` stacks YouTube and TikTok rows with sub-labels. Blurred for non-brands.
  3. Price section: centered "Price" label with Long/Short columns. Blurred when `post_publicly = true` and viewer is not a brand.
  4. "View profile" link → `/network/[id]`.
- `/network/[id]` renders Basic Information + Price + About, then **one Analytics section per connected platform**, ordered primary-first. A creator who only connected TikTok shows only the TikTok Analytics section; one who connected both gets the primary first and the other stacked beneath. Each section carries its own `VerifiedBadge`. The header avatar follows the same primary-platform fallback chain as the card.
- Filters: Niche (matches /apply options exactly), Platform (YouTube/TikTok/Instagram/X — platform filter checks which URLs the creator has linked), Followers (Under 10K, 10K–50K, 50K–100K, 100K–250K, 250K+). No Price filter.

### 5b. Admin visibility override (`admin_hidden`)

- Column: `admin_hidden boolean default false` on `creators`.
- Admin panel's Approved tab shows a visibility switch per row. Flipping it OFF sets `admin_hidden = true` via `POST /api/admin/toggle-visibility`, which immediately removes the creator from `/network` and `/network/[id]` (both queries filter `admin_hidden = false`).
- Live rows in the admin panel (approved + published + not hidden) also show a "View profile" button linking to `/network/[id]` in a new tab.
- When `admin_hidden = true`, the creator's dashboard replaces the green "Live on Network" pill with a yellow "Not Live" pill; hover shows "Contact support for further help". The creator cannot unhide themselves — this is an admin-only override.
- The "Live on Network" stat card in the admin panel counts only creators that are `published = true AND admin_hidden = false`.

### 7. Messaging & Agreements

**Conversations:** Only brands can start a conversation via `POST /api/messages/start` — idempotent upsert on `(brand_id, creator_id)`, so a brand clicking "Message" on the same creator twice returns the existing conversation. Creators never start conversations.

**Message buttons:** `components/message-button.tsx` renders on the creator card (`/network`) and the individual creator profile (`/network/[id]`) under the Price section. If the viewer is not a signed-in brand, the button is disabled with tooltip "Sign in as a brand to message". Hidden entirely when `isSelf`.

**Sending messages:** Both brand and creator send via `POST /api/messages/send`. Client polls `GET /api/messages/[id]` every 5s (`POLL_MS`). Send route auth checks that the caller is a participant (derives brand_id/creator_id from `clerk_user_id`, never trusts request body). Max message length: 2000 chars. Conversation row updates `last_message_at` + `last_message_preview` (200 char truncate).

**First-message email gate:** After a successful insert, the send route runs `COUNT(messages WHERE conversation_id=X AND sender_role=Y)`. If `count === 1`, it fires the one-time email for that (conversation, sender_role) pair. Scoped per conversation, not per user — a *different* brand messaging the *same* creator triggers a new "A new brand messaged you" email; a *different* creator replying triggers a new "[Creator] replied to your message" email.

**Dashboard previews:** Both creator and brand dashboards embed `components/messages-preview.tsx`, which shows up to 5 conversations (counterparty name + last message, 1-line truncate). Clicks route to `/messages?thread=<id>`. Takes `counterpartyKind: "brand" | "creator"` so the avatar renders correctly.

**ChatAvatar (shared):** `components/chat-avatar.tsx` renders both conversation-list and thread avatars. `kind="brand"` always renders the Lucide `User` icon in a bordered circle (matches the Dev Patel example on the homepage — brands intentionally have no photo). `kind="creator"` renders the YouTube profile image, falling back to an initials gradient.

**View profile button:** Thread header has a "View profile" link. Brand viewers → `/network/[creatorId]`. Creator viewers → `/brands/[brandId]` (protected page that displays business name, bio, product/social URLs but **never** the brand's email).

**Agreement buttons (offer/accept asymmetry):** Brands always see both buttons labeled "Offer long" and "Offer short". Creators only see "Accept long" when `brand_agreed_long === true`, and "Accept short" only when `brand_agreed_short === true` — i.e., the creator can only accept a format the brand has already offered. Once the caller's own flag flips to true, the button becomes a disabled "Offered · Long/Short" pill (brand) or "Agreed · Long/Short" pill (creator). Click flow: click → inline `[Confirm] [Cancel]` → POST `/api/messages/[id]/agree` with `{ format }`. Each side has their own 2 flags (4 total per conversation: `brand_agreed_long`, `brand_agreed_short`, `creator_agreed_long`, `creator_agreed_short`). Flag is permanent from the user side; only admins can revert.

**Agreement email:** On the `false → true` transition, the agree route emails the counterparty. Brand agrees → `sendCreatorAgreementEmail` (subject: "[Brand Name] agreed to create a [long/short]"). Creator agrees → `sendBrandAgreementEmail` (subject: "[Creator Name] agreed to create a [long/short]"). Re-POSTing when already agreed returns `{ ok: true, alreadyAgreed: true }` and sends no duplicate email.

**Admin Agreements subpage:** Third section in the admin panel. Lists one row per `true` flag across all conversations, sorted newest-first, showing: brand name, creator name, agreed-at timestamp, "Brand agreed"/"Creator agreed" pill, "Long"/"Short" pill, and a **Cancel agreement** button with inline confirm/cancel flow. Confirm → `POST /api/admin/cancel-agreement` with `{ conversationId, who, format }` → flag flips to false, timestamp cleared. No email fires on cancel.

### 6. Post Publicly toggle

- Column: `post_publicly boolean default false` on `creators`.
- Creator controls whether their prices are visible to non-brand visitors. When `true`: prices are blurred on `/network` and `/network/[id]`. When `false`: prices are visible to all.
- The toggle is editable in both draft and live dashboard states. In live state it writes immediately via `POST /api/creator/update-profile`.

### 5. Emails

All branded dark theme with `#d4ff3a` accent:

1. **Application confirmation** (`sendApplicationConfirmation`) — sent to creator immediately after applying. Subject: "Thanks for applying to Inlook"
2. **Welcome/approval** (`sendWelcomeEmail`) — sent to creator when admin approves. Contains "Set up my account" button with Clerk invitation URL. Subject: "Welcome to Inlook!"
3. **Admin notification** (`sendAdminNotification`) — sent to `support@inlookdeals.com` when a creator applies. Contains: name, email, platform, channel URL, niche, follower range, YouTube account info
4. **Brand application notification** (`sendBrandApplicationNotification`) — sent to `support@inlookdeals.com` when a brand submits the `/brands` form. Subject: "New Brand Application". Contains: business name, business email, product link, optional social URL. Triggered by `POST /api/brands/apply`.
5. **Brand application confirmation** (`sendBrandApplicationConfirmation`) — sent to brand immediately after applying. Subject: "Your Inlook application has been received". Explains that the Inlook team will verify ownership via the brand's public contact channel within ~24 hours.
6. **Brand welcome/verification** (`sendBrandWelcomeEmail`) — sent to brand when admin verifies. Contains "Set up my account" button with Clerk invitation URL. Subject: "Welcome to Inlook!"
7. **Creator new message** (`sendCreatorNewMessageEmail`) — sent to a creator the first time a given brand messages them in a conversation. Subject: "A new brand messaged you". Gated by `COUNT(messages WHERE conversation_id=X AND sender_role='brand') === 1`.
8. **Brand message reply** (`sendBrandMessageReplyEmail`) — sent to a brand the first time a given creator replies in a conversation. Subject: "[Creator Name] replied to your message". Gated by `COUNT(messages WHERE conversation_id=X AND sender_role='creator') === 1`.
9. **Creator agreement notification** (`sendCreatorAgreementEmail`) — sent to creator when a brand flips their agreement flag for this conversation. Subject: "[Brand Name] agreed to create a [long/short]". Fires once per flag (re-POSTs short-circuit before emailing).
10. **Brand agreement notification** (`sendBrandAgreementEmail`) — sent to brand when a creator flips their agreement flag. Subject: "[Creator Name] agreed to create a [long/short]". Same once-per-flag gate.

## YouTube Data

### What's pulled from YouTube APIs

**YouTube Data API v3** (`channels?part=statistics,snippet,brandingSettings`):
- `youtube_channel_id`, `display_name`, `username`, `profile_picture_url` (medium quality 240x240, falls back to default 88x88), `channel_bio`, `subscriber_count`, `total_channel_views`, `total_videos`

**YouTube Analytics API** (30-day window, `metrics=views,likes,comments,shares,averageViewPercentage,subscribersGained,subscribersLost`):
- `avg_engagement_rate`: `(likes + comments + shares) / views * 100`
- `avg_view_rate`: direct from API
- `subscriber_growth_30d`: `(subscribersGained - subscribersLost) / subscriberCount * 100` (percentage)
- `subscriber_growth_30d_count`: `subscribersGained - subscribersLost` (absolute net delta, used to render `"-5.30% · -20"` alongside the percentage on dashboard + network profile)

**Not currently available from YouTube API:**
- "Saves" — not a YouTube metric. Engagement rate uses likes + comments + shares only.

### Stats refresh

- **Automatic sync**: runs at application time (inside `POST /api/apply`) and during `/apply` when the creator connects YouTube (`POST /api/apply/sync-youtube`).
- **Manual re-sync**: creators can click "Refresh" on their dashboard, which calls `POST /api/creator/refresh-stats`. That route uses the stored `youtube_refresh_token` to exchange for a fresh access token via `https://oauth2.googleapis.com/token`, then re-pulls Data + Analytics APIs and updates the row. Creators do NOT need a live NextAuth session for this — the refresh is server-to-server via the stored refresh token.
- `stats_last_updated` column tracks when stats were last pulled.
- When displaying, distinguish `null` (never synced) from `0` (synced but channel has 0 views in window): use `!= null` checks, not truthy checks. Zero is a valid value and must render as `0.0%`.

## Key Patterns

- `/dashboard` serves creators, brands, and admins — server component branches on `user.publicMetadata.role`: `admin` → `AdminClient`, `brand` → `BrandDashboardClient`, default → creator `DashboardClient`
- Two separate auth systems coexist: **Clerk** (user accounts, invitations, role management — roles: `admin` / `creator` / `brand`) and **NextAuth** (YouTube OAuth only, for read-only channel stats)
- `sessionStorage` persists form data across OAuth redirect on `/apply`
- Clerk middleware protects all routes except public pages and API endpoints listed in `middleware.ts`
- Public routes: `/`, `/apply`, `/network(.*)` (marketplace list AND individual profile pages), `/creators` (pitch page), `/brands`, `/join`, `/waitlist`, `/privacy`, `/terms`, `/pricing`, `/sign-in(.*)`, `/sign-up(.*)`, `/sign-in-token(.*)`, `/no-signup`, `/opengraph-image(.*)`, `/twitter-image(.*)`, `/icon(.*)`, `/robots.txt`, `/sitemap.xml`, `/api/apply(.*)`, `/api/auth(.*)`, `/api/brands/apply`, `/api/waitlist`, `/api/cron(.*)`, `/api/tiktok(.*)` (start, callback, status, disconnect)
- **Critical:** `/opengraph-image(.*)` MUST be public or Clerk middleware 404s the OG image route, breaking iMessage/Twitter/Slack link previews. If you add new file-convention metadata routes (e.g. `apple-icon.tsx`), add them to the public matcher too.
- **Days on Inlook** counter starts at 1 (first day) using `Math.floor(diff / dayMs) + 1`

## Validation

- Social URL fields (TikTok, Instagram, X) are validated both client-side and server-side:
  - TikTok URL must contain `tiktok.com`
  - Instagram URL must contain `instagram.com`
  - X URL must contain `x.com` or `twitter.com`
- Save button is disabled when any URL is invalid; server returns 400 for invalid URLs

## Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build (use to verify no type errors)
npm run lint   # ESLint
```

## Environment Variables

Required: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.

Clerk env: `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`.

`NEXTAUTH_URL` is also used as the base URL for welcome email links (falls back to `https://inlookdeals.com`).

## Database

Five tables in Supabase: `creators`, `brands`, `conversations`, `messages`, `creator_waitlist`. Canonical type definitions (`CreatorRow`, `BrandRow`, `ConversationRow`, `MessageRow`, plus the `ConversationPreview` and `AgreementEntry` view types) live in `lib/supabase.ts` — all components reference these types. When changing columns, update the type AND all components that reference the changed fields.

### `creators` table

Key columns: `youtube_access_token`, `youtube_refresh_token`, `connected_at`, `subscriber_count`, `avg_view_rate`, `avg_engagement_rate`, `subscriber_growth_30d`, `subscriber_growth_30d_count`, `total_channel_views`, `total_videos`, `profile_picture_url`, `display_name`, `username`, `channel_bio`, `youtube_channel_id`, `clerk_user_id`, `approved`, `rejected`, `published`, `price_long_video`, `price_short_video`, `tiktok_url`, `tiktok_follower_count`, `instagram_url`, `instagram_follower_count`, `deals_completed`, `stats_last_updated`, `post_publicly`, `admin_hidden`, `show_deal_stats`.

### `brands` table

Columns: `id` (uuid pk), `business_name` (text), `email` (text, unique), `product_url` (text), `social_url` (text, nullable), `verified` (boolean, default false), `rejected` (boolean, default false), `clerk_user_id` (text, nullable), `created_at` (timestamptz), `bio` (text, nullable — editable from brand dashboard, displayed read-only in the admin panel's Brands section).

Migration:
```sql
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  email text NOT NULL UNIQUE,
  product_url text NOT NULL,
  social_url text,
  verified boolean DEFAULT false,
  rejected boolean DEFAULT false,
  clerk_user_id text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS brands_clerk_user_id_idx ON brands(clerk_user_id);
CREATE INDEX IF NOT EXISTS brands_email_idx ON brands(email);
ALTER TABLE brands ADD COLUMN IF NOT EXISTS bio text;
```

**Removed columns** (drop if still in Supabase):
```sql
ALTER TABLE creators DROP COLUMN IF EXISTS price_per_post;
ALTER TABLE creators DROP COLUMN IF EXISTS organic_engagement_rate;
ALTER TABLE creators DROP COLUMN IF EXISTS sponsored_engagement_rate;
ALTER TABLE creators DROP COLUMN IF EXISTS avg_views_30d;
ALTER TABLE creators DROP COLUMN IF EXISTS avg_click_through_rate;
```

### `conversations` table

Columns: `id` (uuid pk), `brand_id` (fk → brands.id), `creator_id` (fk → creators.id), `created_at` (timestamptz), `last_message_at` (timestamptz, nullable), `last_message_preview` (text, nullable — truncated to 200 chars), plus 16 agreement lifecycle columns (8 bool + 8 timestamp) per format:
- `brand_agreed_long` / `brand_agreed_long_at` (brand offer for long)
- `brand_agreed_short` / `brand_agreed_short_at`
- `creator_agreed_long` / `creator_agreed_long_at` (creator accepts brand offer)
- `creator_agreed_short` / `creator_agreed_short_at`
- `payment_link_sent_long` / `payment_link_sent_long_at` (admin-flipped, one-way)
- `payment_link_sent_short` / `payment_link_sent_short_at`
- `paid_long` / `paid_long_at` (admin-flipped, one-way; increments creator `deals_completed`)
- `paid_short` / `paid_short_at`

Booleans default `false`; timestamps are nullable. Unique constraint on `(brand_id, creator_id)` — used by `/api/messages/start` for idempotent upsert.

**Agreement status state machine** (derived in `fetchAgreements`): for each format where `brand_agreed_[fmt] = true`, status is `"paid"` if `paid_[fmt]`, else `"payment_link_sent"` if `payment_link_sent_[fmt]`, else `"agreed"` if `creator_agreed_[fmt]`, else `"offered"`. Admin panel renders one row per `brand_agreed_[fmt]` entry (long and short counted separately).

### `messages` table

Columns: `id` (uuid pk), `conversation_id` (fk → conversations.id), `sender_role` (text: 'brand' or 'creator'), `body` (text, ≤ 2000 chars), `created_at` (timestamptz), `read_at` (timestamptz, nullable — reserved for future read-receipt work, not currently written).

### Messaging + agreements migration

```sql
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz,
  last_message_preview text,
  UNIQUE (brand_id, creator_id)
);
CREATE INDEX IF NOT EXISTS conversations_brand_idx ON conversations(brand_id);
CREATE INDEX IF NOT EXISTS conversations_creator_idx ON conversations(creator_id);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('brand','creator')),
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id, created_at);

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS brand_agreed_long boolean NOT NULL DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS brand_agreed_long_at timestamptz;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS brand_agreed_short boolean NOT NULL DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS brand_agreed_short_at timestamptz;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS creator_agreed_long boolean NOT NULL DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS creator_agreed_long_at timestamptz;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS creator_agreed_short boolean NOT NULL DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS creator_agreed_short_at timestamptz;

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS payment_link_sent_long boolean NOT NULL DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS payment_link_sent_long_at timestamptz;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS payment_link_sent_short boolean NOT NULL DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS payment_link_sent_short_at timestamptz;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS paid_long boolean NOT NULL DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS paid_long_at timestamptz;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS paid_short boolean NOT NULL DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS paid_short_at timestamptz;
```

### `deals` table

Immutable historical ledger of completed sponsorships. One row per `(conversation_id, format)` pair that reaches paid status. Inserted by `POST /api/admin/mark-paid` at the false→true transition of `paid_<format>` — snapshots the state at that moment so later profile edits (price changes, subscriber growth) don't distort historical reporting. `conversations` remains the live mutable state; `deals` is the append-only permanent record. No UI page — queried directly in Supabase for revenue/activity reporting.

**Cycle reset on paid:** after inserting the `deals` row, `mark-paid` resets all four per-format flags on the conversation (`brand_agreed_<fmt>`, `creator_agreed_<fmt>`, `payment_link_sent_<fmt>`, `paid_<fmt>`) and their `_at` timestamps back to false/null. The messaging UI reverts to "Offer long/short" for the brand; a fresh offer → accept → payment → paid cycle re-fires the agreement emails because the flags transition false→true again. The completed deal survives in the `deals` ledger, so the same conversation can accumulate many deals of the same format over time. As a side effect, completed agreements disappear from the admin Agreements panel (which derives rows from `brand_agreed_<fmt>=true`) — past deals live in the `deals` table.

Columns: `id` (uuid pk), `conversation_id`, `brand_id`, `creator_id` (fks, `ON DELETE SET NULL` so the ledger survives profile deletion), `format` ('long' or 'short'), `brand_name`, `creator_name`, `creator_youtube_channel_id`, `price`, `platform_fee` (15% of price), `creator_payout` (85% of price), `creator_subscribers_at_deal`, `creator_avg_view_rate`, `creator_avg_engagement_rate`, `offered_at`, `agreed_at`, `payment_link_sent_at`, `paid_at`, `created_at`.

Price is pulled from `creators.price_long_video` / `price_short_video` at the moment of payment — not from a negotiated amount. If pricing ever becomes per-deal, update `mark-paid` and this snapshot field.

Migration:
```sql
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES creators(id) ON DELETE SET NULL,
  format text NOT NULL CHECK (format IN ('long','short')),
  brand_name text NOT NULL,
  creator_name text NOT NULL,
  creator_youtube_channel_id text,
  price numeric NOT NULL,
  platform_fee numeric NOT NULL,
  creator_payout numeric NOT NULL,
  creator_subscribers_at_deal integer,
  creator_avg_view_rate numeric,
  creator_avg_engagement_rate numeric,
  offered_at timestamptz,
  agreed_at timestamptz,
  payment_link_sent_at timestamptz,
  paid_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deals_brand_idx ON deals(brand_id);
CREATE INDEX IF NOT EXISTS deals_creator_idx ON deals(creator_id);
CREATE INDEX IF NOT EXISTS deals_paid_at_idx ON deals(paid_at DESC);

ALTER TABLE creators ADD COLUMN IF NOT EXISTS subscriber_growth_30d_count integer;
```

### `creator_waitlist` table

Non-YouTube creator waitlist — people who want to join Inlook but aren't primarily on YouTube (Inlook launches YouTube-only). Populated by `POST /api/waitlist` from `/waitlist` page. No auth; public write.

Columns: `id` (uuid pk), `name` (text), `email` (text, unique), `platform` (text: TikTok/Instagram/X/Twitch/Other), `handle` (text — profile URL or handle), `follower_range` (text), `niche` (text, nullable), `created_at` (timestamptz).

Migration:
```sql
CREATE TABLE IF NOT EXISTS creator_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  platform text NOT NULL,
  handle text NOT NULL,
  follower_range text NOT NULL,
  niche text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS creator_waitlist_email_idx ON creator_waitlist(email);
```

### Older migrations (run in Supabase SQL Editor if not already applied)

```sql
ALTER TABLE creators ADD COLUMN IF NOT EXISTS rejected boolean DEFAULT false;
ALTER TABLE creators RENAME COLUMN tiktok_handle TO tiktok_url;
ALTER TABLE creators RENAME COLUMN instagram_handle TO instagram_url;
ALTER TABLE creators RENAME COLUMN x_handle TO x_url;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS price_long_video decimal;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS price_short_video decimal;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS post_publicly boolean DEFAULT false;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS admin_hidden boolean DEFAULT false;
```

## Legal / consent

- `/privacy`, `/terms`, and `/pricing` are static pages in `app/privacy/page.tsx`, `app/terms/page.tsx`, and `app/pricing/page.tsx`. All three are public routes. Footer "Company" column links to all three (Pricing between About and Privacy).
- Pricing page surfaces the commercial model: **$0 for brands / 15% platform fee for creators (Stripe Connect auto-split, 85% creator / 15% Inlook).** Stripe payment-processing fees are absorbed into Inlook's 15% — creators see 85% of gross deal value with no further deductions. `/creators` (pitch page) and `/brands` each surface a condensed pricing block linking to `/pricing`. TOS Section 9 reflects this fee structure and links to the Stripe Connected Account Agreement.
- Use **"platform fee"**, not "commission" — commission implies agency/talent-manager relationship (triggers CA/NY talent-agency licensing); platform fee is the correct marketplace term and matches Stripe Connect's `application_fee_amount`.
- Clickwrap-style consent is enforced at three entry points: creator apply (`Connect YouTube Account` button, in `app/apply/apply-client.tsx`), brand apply (`Request access` button, in `components/brand-application-form.tsx`), and waitlist (`Join the waitlist` button, in `app/waitlist/waitlist-client.tsx`). Each has a short line beneath the CTA: "By [action], you agree to our Terms of Service and Privacy Policy."
- TOS Section 5 requires creators to disclose sponsored content (e.g., `#ad`) per FTC Endorsement Guides. Creators indemnify Inlook for non-disclosure claims (Section 14).
- **Admin access disclosure:** TOS §3 and Privacy §4 disclose that Inlook administrators can view all profile data, verified engagement/analytics metrics, emails, and message content, for operating/moderating the Service. Keep this in sync if access scope changes.
- Both policies carry Effective/Last-updated date **April 22, 2026**. When making any material change, bump both dates in [app/terms/page.tsx](app/terms/page.tsx) and [app/privacy/page.tsx](app/privacy/page.tsx).
- Both policies contain `[⚠️ LEGAL REVIEW REQUIRED]` markers that must be addressed by counsel before public launch — notably governing-law/venue, fee/refund language, jurisdiction-specific rights (GDPR/CCPA), and cross-border transfer mechanisms.
- Footer copyright is hardcoded to "© 2026 Inlook. All rights reserved." per founder preference.

## Style Conventions

- Color tokens: `ink-50` (lightest) through `ink-950` (darkest) for grays; `accent` (#d4ff3a) / `accent-dim` / `accent-deep` for green
- Font classes: `font-display` (headings), `font-sans` (body), `font-mono` (labels/badges)
- Labels use: `font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300`
- Cards use: `rounded-3xl border border-ink-800 bg-ink-900 shadow-card`
- Buttons use: `btn-primary` class (defined in globals.css)
- Email templates use branded dark theme with `#d4ff3a` accent color
