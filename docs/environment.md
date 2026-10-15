# Environment Variables

Every variable the app reads, what needs it, where to get it, and the local default. `.env.example` holds the same list with placeholders. Production setup (EC2, Nginx, PM2, migrations) is in `docs/deployment.md`; the local database workflow is in `docs/data-foundation.md`. This file does not repeat them.

## `.env` versus `.env.local`

Copy `.env.example` to both files. They are read by different tools:

| File | Read by | Needs |
| --- | --- | --- |
| `.env` | Prisma CLI (`prisma.config.ts` loads it with `dotenv`), `npm run db:*`, `npm run test:integration`, and `docker compose` (variable substitution in `docker-compose.yml`) | `DATABASE_URL`, `POSTGRES_*` |
| `.env.local` | Next.js (`npm run dev`, `npm run build`, `npm run start`) | everything |

`prisma generate` runs inside `npm run build` and `npm run typecheck` and reads `.env`, so both files need `DATABASE_URL`. A variable exported in the shell wins over both files.

`NEXT_PUBLIC_*` variables are inlined into the build. Changing one in production means rebuilding.

Both files are gitignored. Never commit real values.

## Postgres

| Variable | Required | Feature | Where to get it | Local default |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Required | All data: admin, portal, contracts, migrations, seed, integration tests | Local: the compose container. Production: your RDS or EC2 Postgres connection string | `postgresql://destinlmincy:destinlmincy_dev_password@127.0.0.1:5434/destinlmincy_dev?schema=public` |
| `POSTGRES_DB` | Required locally | The `docker compose` Postgres container | You choose it; must match `DATABASE_URL` | `destinlmincy_dev` |
| `POSTGRES_USER` | Required locally | Same | You choose it; must match `DATABASE_URL` | `destinlmincy` |
| `POSTGRES_PASSWORD` | Required locally | Same | You choose it; must match `DATABASE_URL` | `destinlmincy_dev_password` |

`docker-compose.yml` runs Postgres only, on `127.0.0.1:5434`. It has no S3 emulator, so anything that stores PDFs needs a real private S3 bucket (see AWS S3).

## Clerk

| Variable | Required | Feature | Where to get it | Local default |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Required | Sign-in, `/admin` and `/portal` protection (`proxy.ts`), portal entitlements | Clerk dashboard, your application, API keys | Format-valid placeholder `pk_test_ZXhh...` (pages render, sign-in does not work) |
| `CLERK_SECRET_KEY` | Required | Server-side Clerk calls (`currentUser`, `auth`, client user lookup when attaching users) | Clerk dashboard, API keys | `sk_test_placeholder` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Required | Where Clerk sends signed-out users | Fixed by this app | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Required | Where Clerk sends new users | Fixed by this app | `/sign-up` |

With the placeholder key, a malformed key is worse than none: Clerk rejects a key that is not `pk_test_<base64>` on every request, so every page returns 500. The placeholder in `.env.example` is format-valid for that reason.

Clerk instance settings this app depends on:

1. **Organizations: `force_organization_selection` must be off.** The app does not use Clerk organizations. When it is on, every sign-in stops at an organization screen. Check both the development and the production instance.
2. **Billing must be enabled** for the portal subscriptions page to resolve entitlements.
3. **Entitlement keys map to Clerk features.** `app/portal/subscriptions/page.tsx` calls `has({ feature: entitlementKey })` for each subscription record. The "Entitlement key" you type on a subscription in `/admin/relationships/[id]/subscriptions/new` must equal the key of a feature you create in Clerk Billing and attach to the plan the client subscribes to. Plan names, prices, and keys are not decided yet (open question in `context/progress-tracker.md`); this app does not define them.

Known gap: the Clerk entitlement result does not currently change what the portal shows. An `ACTIVE` subscription shows as active whether or not `has()` returns true, and `CANCELED` access is decided by `currentPeriodEndsAt`. This is recorded in `context/current-issues.md`.

## Admin allowlist

| Variable | Required | Feature | Where to get it | Local default |
| --- | --- | --- | --- | --- |
| `ADMIN_EMAILS` | Required to use `/admin` | Every `/admin` page and admin server action (`lib/auth/admin-allowlist.ts`) | Your own Clerk sign-in emails, comma-separated, case-insensitive | `admin@example.com` |

The email must be the primary email of a Clerk user and verified in Clerk. Anyone signed in who is not on the list gets a 404 from `/admin`.

## AWS S3

| Variable | Required | Feature | Where to get it | Local default |
| --- | --- | --- | --- | --- |
| `AWS_REGION` | Required for contracts | Contract generation, DocuSign send (reads the PDF back), DocuSign completion (stores the signed PDF) | The region of your bucket | `us-east-1` |
| `S3_PRIVATE_BUCKET` | Required for contracts | Same | The bucket name you create | empty |
| `AWS_ACCESS_KEY_ID` | Optional | Credentials for the bucket, read by the AWS SDK default credential chain | IAM user access key. Leave empty on EC2 with an instance role, or when an AWS profile provides credentials | empty |
| `AWS_SECRET_ACCESS_KEY` | Optional | Same | Same | empty |

The bucket must block all public access. The app writes with `ServerSideEncryption: AES256`. The credentials need `s3:PutObject` and `s3:GetObject` on the bucket. Generated PDFs land at `contracts/<relationshipId>/<uuid>.pdf`; signed PDFs at `contracts/<relationshipId>/signed-<envelopeId>.pdf`.

When either `AWS_REGION` or `S3_PRIVATE_BUCKET` is empty, contract generation shows an error and creates nothing, and the DocuSign webhook answers 503 for a completed envelope so DocuSign retries it later.

There is no admin or portal PDF download yet (`getPrivateDownloadUrl` is unused). Check stored PDFs in the S3 console.

## DocuSign

| Variable | Required | Feature | Where to get it | Local default |
| --- | --- | --- | --- | --- |
| `DOCUSIGN_CONNECT_HMAC_KEY` | Required for completion | `/api/webhooks/docusign` signature check | DocuSign eSignature Settings, Connect, Connect Keys: add a secret key and copy it | empty (webhook rejects everything) |
| `DOCUSIGN_INTEGRATION_KEY` | Required for send | JWT auth (`lib/docusign/client.ts`) | Apps and Keys page: your app's Integration Key | empty |
| `DOCUSIGN_ACCOUNT_ID` | Required for send | Envelope creation | Apps and Keys page: API Account ID | empty |
| `DOCUSIGN_IMPERSONATED_USER_ID` | Required for send | JWT user the app acts as | Apps and Keys page: User ID | empty |
| `DOCUSIGN_PRIVATE_KEY` | Required for send | JWT signing | Apps and Keys page: your app, Service Integration, generate an RSA key pair. Paste the private key content (not a path) on one line with newlines written as `\n`, in double quotes | empty |
| `DOCUSIGN_OAUTH_BASE_PATH` | Optional | JWT auth host and REST base path | `account-d.docusign.com` (sandbox) or `account.docusign.com` (production) | `account-d.docusign.com` |
| `DOCUSIGN_ADMIN_EMAIL` | Required for send | The admin countersigner on every envelope | Your DocuSign login email | `admin@example.com` |
| `DOCUSIGN_ADMIN_NAME` | Optional | Countersigner display name | You choose it | `Destin Mincy` (code falls back to `Admin`) |
| `NEXT_PUBLIC_APP_URL` | Required for send | Builds the webhook URL `${NEXT_PUBLIC_APP_URL}/api/webhooks/docusign` and the consent redirect | Production: `https://destinlmincy.com`. Locally: your public tunnel URL | `http://localhost:3000` |

Set DocuSign up in this order:

1. **Connect HMAC first.** The webhook fails closed: with `DOCUSIGN_CONNECT_HMAC_KEY` empty, or a request without a valid `X-DocuSign-Signature-1` header, it answers 401 and writes nothing. Each envelope asks Connect to sign its notifications (`includeHMAC`), using the account's Connect secret key. Create the key (Settings, Connect, Connect Keys), put it in `DOCUSIGN_CONNECT_HMAC_KEY`, and restart the app. Until then no contract can reach Complete. No account-level Connect configuration is needed; each envelope carries its own webhook URL.
2. **Public URL.** DocuSign must reach `${NEXT_PUBLIC_APP_URL}/api/webhooks/docusign`. Locally, run a tunnel to port 3000 (for example ngrok), set `NEXT_PUBLIC_APP_URL` to the tunnel's https URL, and restart `npm run dev`. `localhost` works for sending but no status update will ever arrive.
3. **Redirect URI.** In Apps and Keys, add `${NEXT_PUBLIC_APP_URL}/api/auth/callback` to your app's Redirect URIs.
4. **JWT consent, once per impersonated user.** Open this URL in a browser signed in as the impersonated user, with your values filled in:
   `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=<DOCUSIGN_INTEGRATION_KEY>&redirect_uri=<NEXT_PUBLIC_APP_URL>/api/auth/callback`
   (use `account.docusign.com` in production). Accept. The browser then lands on `/api/auth/callback`, which does not exist in this app, so **a 404 there is expected**: consent is already recorded. If you skip this step, Send for signing fails with "Failed to send to DocuSign. Check server logs." and the server log contains the same consent URL.
5. **Sandbox versus production.** `DOCUSIGN_OAUTH_BASE_PATH` containing `account-d` selects `https://demo.docusign.net/restapi`; anything else selects `https://www.docusign.net/restapi`. A production account whose Account Base URI on Apps and Keys is a different host (for example `na3.docusign.net`) is not handled by the code yet; check that before going live.

## Stripe

No Stripe variables. v1 does not call the Stripe API: payment gates store a Stripe invoice or payment-link URL and ID that you paste in by hand, and you mark them paid yourself (`context/architecture.md`, Payment And Subscription Flow; `context/project-overview.md`, Deferred). `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` were removed from `.env.example` and `docs/deployment.md` because nothing reads them. You only need a Stripe account to create the invoices or payment links you paste.

## Test-only variables

Not in `.env.example`; the app does not read them.

| Variable | Used by |
| --- | --- |
| `NODE_ENV` | Set by Next.js and Node. `lib/db/client.ts` caches the Prisma client outside production |
| `PLAYWRIGHT_BASE_URL` | `playwright.config.ts`, base URL for `npm run test:e2e` |
| `UNIT05_ALLOW_DESTRUCTIVE_E2E`, `UNIT05_ADMIN_IMPERSONATION_URL`, `UNIT05_CLIENT_IMPERSONATION_URL`, `UNIT05_CLIENT_EMAIL`, `UNIT05_CLIENT_USER_ID`, `UNIT05_RELATIONSHIP_ID` | `tests/e2e/unit05.spec.ts`, the guarded Unit 05 Playwright run |

## Test from nextjs-application-overhaul

Setup:

1. `git checkout nextjs-application-overhaul`
2. `npm ci`
3. `cp .env.example .env` and `cp .env.example .env.local`, then fill in real values in both (at minimum the Clerk keys and `ADMIN_EMAILS` to sign in; S3 and DocuSign for the contract steps).
4. `docker compose up -d` (Postgres on `127.0.0.1:5434`).
5. `npm run db:deploy`
6. `npm run db:seed` (creates `DLM Demo Relationship`, slug `dlm-demo`, with one project, one payment gate, one subscription, one milestone, and a client user `client@example.test` tied to the fake Clerk id `user_unit02_demo`).
7. `npm run dev`, then open `http://localhost:3000`.

You need two Clerk users in your development instance: an **admin** whose verified email is in `ADMIN_EMAILS`, and a **client** with a different verified email. Use a separate browser profile or a private window for the client.

Feature checks:

1. **Auth and admin allowlist.** Signed out, visit `/admin` and `/portal`: both redirect to `/sign-in`. Sign up the client at `/sign-up`, then visit `/admin`: 404. Visit `/portal`: the "no client relationship on file" message. Sign in as the admin at `/sign-in` and visit `/admin`: the operator console. Credentials: Clerk keys, `ADMIN_EMAILS`.
2. **Relationships.** As admin, open `/admin/relationships`, create one at `/admin/relationships/new`, open it at `/admin/relationships/[id]`, edit it at `/admin/relationships/[id]/edit`, and change its lifecycle. In the Users section, attach the client by email: it is found in Clerk and listed as active. Expected: the client's `/portal` now shows this relationship's name. Credentials: Clerk keys (the attach looks the email up in Clerk).
3. **Applications and projects.** On the relationship, add a site at `/admin/relationships/[id]/applications/new` and edit it at `/admin/relationships/[id]/applications/[applicationSiteId]/edit`. Create a project at `/admin/relationships/[id]/projects/new` attached to that site, then open `/admin/relationships/[id]/projects/[projectId]` and edit it at `/admin/relationships/[id]/projects/[projectId]/edit`. Expected: both appear in `/admin/relationships/[id]/applications` and `/admin/relationships/[id]/projects`, and the active project appears for the client at `/portal/projects`. Credentials: none beyond admin.
4. **Contract templates.** Open `/admin/relationships/[id]/contracts`, create a template at `/admin/relationships/[id]/contracts/templates/new`, then edit it at `/admin/relationships/[id]/contracts/templates/[templateId]/edit`: add heading, paragraph, clause, variable, and signature blocks and one required variable (for example key `projectName`), and save. Expected: "Draft saved." Open the same edit page in a second tab, save in the first tab, then save in the second: the second shows "This template changed after you opened it" and the first tab's content is kept. Publish from `/admin/relationships/[id]/contracts/templates/[templateId]`. Credentials: none beyond admin.
5. **Contract generation.** From the published template, open `/admin/relationships/[id]/contracts/templates/[templateId]/generate`. First submit with the required variable empty: the page shows "Fill in the required fields" and no contract is listed. With `S3_PRIVATE_BUCKET` empty, a complete submit shows "PDF storage is not configured" and creates nothing. With S3 configured, submit with the client's email as signer: you land on `/admin/relationships/[id]/contracts` and the contract shows status Draft and PDF Stored. In the S3 console, `contracts/<relationshipId>/<uuid>.pdf` exists and is encrypted (SSE-S3). Credentials: `AWS_REGION`, `S3_PRIVATE_BUCKET`, AWS credentials.
6. **DocuSign send, sign, and countersign.** Do the DocuSign setup above first (HMAC key, tunnel URL, redirect URI, consent). On `/admin/relationships/[id]/contracts`, click Send for signing. Expected: status Sent for signing; clicking twice quickly still creates one envelope (check the DocuSign sandbox Sent folder). The client signer gets the DocuSign email and signs at the "Client signature" line; then `DOCUSIGN_ADMIN_EMAIL` gets it and countersigns at "Admin signature". Expected after the completed notification reaches `/api/webhooks/docusign`: status Complete, and `contracts/<relationshipId>/signed-<envelopeId>.pdf` in the S3 console. In DocuSign Connect logs (Settings, Connect, Logs), the final delivery is 200; a 401 means the HMAC key is wrong or missing, a 503 means S3 is not configured, and DocuSign retries non-2xx answers. The client sees the contract at `/portal/contracts`. Credentials: every DocuSign variable, S3, and a public `NEXT_PUBLIC_APP_URL`.
7. **Payment gates.** Create a Stripe invoice or payment link in your Stripe dashboard. At `/admin/relationships/[id]/payment-gates/new`, create a gate for the project with "Required before work begins" checked and paste the https Stripe URL. Expected: the project cannot move to a started status from `/admin/relationships/[id]/projects/[projectId]/edit` while the gate is unpaid. The client sees the gate and can open the Stripe link at `/portal/payments`. Mark the gate Paid at `/admin/relationships/[id]/payment-gates/[gateId]/edit`: the project can now start. Credentials: a Stripe account (no keys in the app).
8. **Subscriptions.** In Clerk Billing, create a feature and a plan that includes it, and subscribe the client user. At `/admin/relationships/[id]/subscriptions/new`, create a subscription with the feature's key as the entitlement key, then edit it at `/admin/relationships/[id]/subscriptions/[subId]/edit` (status Canceled with a past and then a future period end). Expected at `/portal/subscriptions`: the service with its status; a Canceled record with a past period end shows "Access has ended". Remember the known gap above: the Clerk entitlement does not change the display yet. Credentials: Clerk keys with Billing enabled.
9. **Milestones and deliverables.** At `/admin/relationships/[id]/projects/[projectId]/milestones/new`, create a milestone with "Require client approval before proceeding" checked and a payment dependency. Choosing a gate that belongs to a different project shows a field error under Payment dependency. Open `/admin/relationships/[id]/projects/[projectId]/milestones/[milestoneId]` and edit at `/admin/relationships/[id]/projects/[projectId]/milestones/[milestoneId]/edit`; saving from a second, older tab shows "This milestone changed after you opened it". Add a link at `/admin/relationships/[id]/projects/[projectId]/deliverables/new`. Expected: both listed at `/admin/relationships/[id]/projects/[projectId]/milestones` and `/admin/relationships/[id]/projects/[projectId]`. Credentials: none beyond admin.
10. **Client portal.** As the client, walk `/portal`, `/portal/contracts`, `/portal/payments`, `/portal/subscriptions`, `/portal/projects`, and `/portal/projects/[projectId]`. Expected: only the attached relationship's data; the milestone from step 9 shows "Your approval is required to proceed" and approving or requesting changes records the action. Remove the client from the relationship (step 2's Users section): `/portal` falls back to the no-relationship message. Credentials: the client's Clerk login.
11. **Blog.** Visit `/blog`, open `/blog/agents-as-a-service-explained` and `/blog/introducing-elatum`, and fetch `/blog/feed.xml`. Expected: the index lists both posts, each post renders, and the feed is valid RSS listing both. Credentials: none.
