# EC2 Deployment Runbook

This document covers the production deployment of `destinlmincy.com` on AWS EC2. The architecture is intentionally boring: Next.js server process managed by PM2, Nginx as a reverse proxy terminating HTTPS, Postgres on RDS when the data volume justifies it.

---

## Infrastructure Overview

```
Internet
  |
  v
Route 53 (DNS)
  |
  v
EC2 instance (Ubuntu 22.04 LTS recommended)
  |
  v
Nginx (HTTPS termination, port 443 -> 3000)
  |
  v
Next.js app process (PM2, port 3000)
  |
  +-- PostgreSQL (Docker on EC2 for solo workloads, RDS when scale/HA justifies)
  +-- Private S3 bucket (contract PDFs)
```

**Security group ingress rules required:**

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP only | SSH access |
| 80 | TCP | 0.0.0.0/0 | HTTP (Nginx redirects to HTTPS) |
| 443 | TCP | 0.0.0.0/0 | HTTPS traffic |

No port 3000 should be open to the internet; Nginx proxies to it internally.

---

## Required Environment Variables

Set these in `/etc/environment` or in a `.env.production.local` file in the project root (never commit this file). PM2 can also load an env file via ecosystem config.

### Authentication (required)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Get these from the Clerk dashboard under your production application.

### Database (required)

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

For Docker Postgres on the same EC2 instance, this will be something like:
`postgresql://dlm_app:password@localhost:5434/dlm_prod`

For RDS, use the RDS endpoint and set `sslmode=require`.

### Admin access (required)

```
ADMIN_EMAILS=destin@destinlmincy.com,another@example.com
```

Comma-separated list of Clerk user emails that get admin access. Checked server-side on every admin route.

### DocuSign (optional, required for contract signing)

```
DOCUSIGN_INTEGRATION_KEY=
DOCUSIGN_ACCOUNT_ID=
DOCUSIGN_PRIVATE_KEY_PATH=/etc/secrets/docusign-rsa-key.pem
DOCUSIGN_OAUTH_BASE_PATH=https://account.docusign.com
```

Store the RSA private key outside the project directory. Reference it by absolute path.

### Stripe (optional, required for payment links)

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### AWS / S3 (optional, required for contract PDF storage)

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_PRIVATE_BUCKET=destinlmincy-contracts
```

The IAM user or role only needs `s3:GetObject`, `s3:PutObject`, and `s3:DeleteObject` on the contracts bucket. No public access.

---

## EC2 Instance Setup

### 1. Node.js via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
nvm alias default 22
```

Verify: `node -v && npm -v`

### 2. PM2

```bash
npm install -g pm2
pm2 startup systemd
# Run the command PM2 prints to auto-start on reboot
sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v22.x.x/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 3. Nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx
sudo systemctl enable nginx
```

### 4. Certbot (TLS)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d destinlmincy.com -d www.destinlmincy.com
```

Certbot will auto-renew. Verify with:
```bash
sudo certbot renew --dry-run
```

---

## Nginx Configuration

Create `/etc/nginx/sites-available/destinlmincy.com`:

```nginx
server {
    listen 80;
    server_name destinlmincy.com www.destinlmincy.com;
    return 301 https://destinlmincy.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.destinlmincy.com;
    ssl_certificate     /etc/letsencrypt/live/destinlmincy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/destinlmincy.com/privkey.pem;
    return 301 https://destinlmincy.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name destinlmincy.com;

    ssl_certificate     /etc/letsencrypt/live/destinlmincy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/destinlmincy.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Note: proxy_set_header directives must be inside the location block.
    # Headers set in the server block are ignored when the location block
    # defines its own proxy_set_header directives (Nginx inheritance rule).

    # Next.js static assets
    location /_next/static/ {
        alias /home/ubuntu/destinlmincy.com/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Public folder
    location /fonts/ {
        alias /home/ubuntu/destinlmincy.com/public/fonts/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        # Forwarded headers (required for Clerk, Next.js, Stripe webhooks)
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 120s;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/destinlmincy.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## PM2 Ecosystem Config

Create `ecosystem.config.js` in the project root (do not commit it with secrets inline):

```js
module.exports = {
  apps: [
    {
      name: "destinlmincy",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/ubuntu/destinlmincy.com",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Add all required env vars here, or load them via systemd:
        // In the systemd unit generated by `pm2 startup`, add EnvironmentFile=
        // pointing to /home/ubuntu/destinlmincy.com/.env.production.local
        // Note: env_file is not a valid PM2 ecosystem config key; use the
        // systemd EnvironmentFile directive or export vars before pm2 start.
      },
    },
  ],
};
```

Start the app:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Deployment Runbook

Run this sequence on every deploy:

```bash
# 1. Pull latest code
cd /home/ubuntu/destinlmincy.com
git pull origin master

# 2. Install dependencies (respects lockfile; prisma CLI is a devDependency
#    needed for build-time codegen and db:deploy, so omit-dev is not used)
npm ci

# 3. Apply any pending database migrations
npm run db:deploy

# 4. Build the Next.js app
npm run build

# 5. Restart the app process gracefully
pm2 restart destinlmincy

# 6. Verify the process is running
pm2 status
```

Check the app is responding:
```bash
curl -I https://destinlmincy.com
```

---

## First Deployment Checklist

- [ ] EC2 instance provisioned (Ubuntu 22.04 LTS, t3.small or larger)
- [ ] Security group: ports 22 (your IP), 80, 443 open
- [ ] Node.js 22 installed via nvm
- [ ] PM2 installed globally and startup hook registered
- [ ] Nginx installed and enabled
- [ ] DNS A record for `destinlmincy.com` and `www.destinlmincy.com` pointing to EC2 public IP
- [ ] Certbot installed and TLS certificate issued
- [ ] Project cloned to `/home/ubuntu/destinlmincy.com`
- [ ] `.env.production.local` created with all required variables
- [ ] `npm ci` and `npm run build` completed without errors
- [ ] Database accessible from EC2 (Docker on instance, or RDS security group allows EC2)
- [ ] `npm run db:deploy` run to apply migrations
- [ ] PM2 started with `pm2 start ecosystem.config.js && pm2 save`
- [ ] Nginx config in place and `nginx -t` passes
- [ ] `curl -I https://destinlmincy.com` returns 200
- [ ] Production Clerk instance: disable `force_organization_selection` (Settings > Organization Management) as documented in `context/progress-tracker.md` Unit 03 notes — leaving it enabled forces every user through an organization-setup screen that this project's org-free v1 design does not use

---

## Log Locations

| Source | Location |
|--------|----------|
| Next.js app stdout/stderr | `pm2 logs destinlmincy` |
| Nginx access log | `/var/log/nginx/access.log` |
| Nginx error log | `/var/log/nginx/error.log` |
| Certbot renewal | `/var/log/letsencrypt/letsencrypt.log` |

Stream PM2 logs:
```bash
pm2 logs destinlmincy --lines 100
```

---

## Rollback Steps

If a deploy breaks the site:

```bash
# Option 1: Roll back to the previous git commit
cd /home/ubuntu/destinlmincy.com
git log --oneline -5          # identify the good commit hash
git checkout <good-commit>
npm ci
npm run build
pm2 restart destinlmincy

# Option 2: If you have a tagged release
git checkout v1.2.3
npm ci
npm run build
pm2 restart destinlmincy
```

Database rollbacks are not automatic. If a migration broke something, restore from the most recent database backup before rolling back the code.

---

## Database Notes

### Docker Postgres on EC2 (current)

The development and early production setup uses Docker Compose to run Postgres on the same EC2 instance. This works well for solo workloads but has no replication or managed backups.

Manual backup:
```bash
docker exec -t <postgres-container> pg_dump -U dlm_app dlm_prod | gzip > ~/backups/dlm-prod-$(date +%Y%m%d).sql.gz
```

Schedule this with cron or a simple systemd timer.

### RDS Postgres (production path when justified)

Provision RDS when one or more of these is true: traffic warrants it, you want automated backups and point-in-time recovery, or EC2 instance storage becomes a concern.

Steps when ready:
1. Provision a `db.t3.micro` RDS Postgres instance in the same VPC as EC2.
2. Create the application database and user.
3. Update `DATABASE_URL` in `.env.production.local`.
4. Run `npm run db:deploy` against RDS.
5. Verify the app connects and responds.
6. Enable automated backups with a 7-day retention window.

### S3 Contract Storage

The private S3 bucket stores generated and signed contract PDFs. It must never have public access.

Required bucket policy and IAM:
- Block all public access on the bucket.
- IAM user or role attached to EC2 needs `s3:GetObject`, `s3:PutObject`, and `s3:DeleteObject` on `arn:aws:s3:::destinlmincy-contracts/*`.
- Enable S3 versioning on the bucket to protect against accidental overwrites.

---

## DNS Cutover from Legacy S3/CloudFront

The legacy Eleventy site is served from S3 via CloudFront. DNS cutover from the old deployment to EC2:

1. Lower the TTL on the `destinlmincy.com` A record to 60 seconds at least 24 hours before the cutover.
2. Verify the Next.js app on EC2 is fully working (first deployment checklist complete).
3. Update the A record to point to the EC2 public IP (or an Elastic IP if you have one).
4. Wait for TTL to expire globally (use `dig +short destinlmincy.com` to monitor).
5. After verifying the new site is live, leave the old CloudFront distribution in place for 48 hours before decommissioning.
6. Do not delete the S3 static site bucket until all signed contract PDFs are migrated to the new private bucket.
