# AWS deployment guide

You're staying on AWS. Here's the cleanest static-site setup that uses what you likely already have wired up for the current `index.html`.

## Architecture

```
Route 53 (DNS)
   │
   ▼
ACM Certificate (us-east-1, required for CloudFront)
   │
   ▼
CloudFront Distribution (with custom domain destinlmincy.com)
   │
   ▼
S3 Bucket (private, OAC-restricted) ← `_site/` syncs here
```

`elatum.ai` is on its own distribution/domain. Don't touch it during this migration.

## One-time setup (if not already done)

1. **S3 bucket** — `destinlmincy-com-site` (or whatever name). Block all public access.
2. **CloudFront distribution** with:
   - Origin: the S3 bucket via **Origin Access Control (OAC)**, not legacy OAI
   - Default root object: `index.html`
   - Alternate domain name (CNAME): `destinlmincy.com` and `www.destinlmincy.com`
   - SSL cert: ACM cert in `us-east-1`
   - Default cache behavior: redirect HTTP → HTTPS, compress, GET/HEAD only
   - **Custom error response:** 403/404 → `/index.html` 200 (optional; only needed if you add client-side routing later)
3. **Bucket policy** allowing only that CloudFront distribution to `GetObject`.
4. **Route 53 A-record alias** → CloudFront distribution.

If all of that already exists for the current "Coming Soon" page, you reuse it as-is. The deploy script only needs:
- The S3 bucket name
- The CloudFront distribution ID

## Wire up the deploy script

Open `package.json` and replace:

```json
"deploy:s3":         "aws s3 sync _site/ s3://YOUR_BUCKET_NAME --delete --cache-control 'public, max-age=300'",
"deploy:invalidate": "aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths '/*'"
```

With your real values. The `--cache-control max-age=300` is a conservative 5-minute cache while you're iterating — bump it to `max-age=86400` (1 day) once the site is stable and you're not deploying daily.

## Run a deploy

```bash
# from repo root
aws configure   # if not done; or rely on env vars / SSO
npm run deploy
```

That runs `build → sync → invalidate` in order. Watch the CloudFront invalidation status in the console; takes 1–3 minutes.

## Optional, but worth doing later

- **Move the deploy to GitHub Actions.** Trigger on `main` push, run `npm ci && npm run build && aws s3 sync && aws cloudfront create-invalidation`. Use OIDC instead of long-lived IAM keys.
- **Separate cache rules per filetype.** Long cache (1y, immutable) on `/styles/*`, `/scripts/*`, `/img/*`. Short cache (5min) on HTML. Either via S3 `--cache-control` per upload or CloudFront cache policies.
- **Add CloudFront Functions** for clean trailing-slash handling if you want `/about` to work the same as `/about/`.
- **Hook up CloudWatch RUM or a basic analytics tool** so you actually know what's getting traffic.

## Common gotchas

- ACM cert **must** be in `us-east-1` for CloudFront, regardless of where the bucket lives.
- After CloudFront cert/domain changes, propagation takes 15–30 minutes.
- If you see your old "Coming Soon" page after deploy, it's the CloudFront cache — invalidation may still be running, or your browser cached it.
- Don't forget to update `robots.txt` and `sitemap.xml` URLs if the canonical domain changes.
