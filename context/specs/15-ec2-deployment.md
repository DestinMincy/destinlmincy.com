# Unit 15: EC2 Deployment

## Goal

Document and implement the production deployment path for running the Next.js app on AWS EC2.

## Design

Deployment should be boring: repeatable build, explicit environment variables, process supervision, reverse proxy, TLS, logs, and rollback notes. Avoid clever infrastructure until traffic or operational pain justifies it.

## Implementation

### Runtime

- Define Node.js version.
- Define build command and production start command.
- Define process manager: systemd or PM2.
- Define environment variable loading strategy.

### Reverse Proxy

- Configure Nginx or Caddy in front of the Next.js process.
- Terminate HTTPS.
- Forward required headers for Clerk, Stripe, DocuSign, and Next.js.

### AWS

- Document EC2 instance assumptions.
- Document security group ingress.
- Document DNS cutover.
- Document private S3 bucket requirements for contracts.
- Document RDS Postgres activation path when deployment/client need justifies cost.

### Operations

- Add deploy checklist.
- Add log locations.
- Add restart/rollback steps.
- Add backup notes for database and S3.

## Dependencies

- Completed Next.js foundation.
- Clerk, Stripe, DocuSign, S3 environment variables.
- Database configuration.

## Verify When Done

- [ ] Production build passes locally.
- [ ] Production server starts locally.
- [ ] EC2 runbook includes env vars, process manager, reverse proxy, TLS, logs, S3, and database notes.
- [ ] DNS and rollback steps are documented.
