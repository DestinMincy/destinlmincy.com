# Security Policy

## Supported Versions

Only the current production deployment at [destinlmincy.com](https://destinlmincy.com) is actively maintained and eligible for security review.

## Reporting a Vulnerability

Please report security issues privately — do not open a public GitHub issue.

**Contact:** dlmincy@destinlmincy.com

Include a description of the issue, steps to reproduce, and any relevant URLs or screenshots. I aim to respond within 5 business days. If the issue is confirmed, I'll work on a fix and keep you updated on the timeline.

## Scope

**In scope:**
- Authentication and session handling (client portal, blog admin)
- Content injection or XSS vulnerabilities
- Exposed credentials or sensitive data in the repository or live site
- Misconfigured security headers or CORS policies
- Form submission abuse or spam bypass

**Out of scope:**
- Third-party services (Formspree, AWS infrastructure, Calendly, Stripe) — report those directly to the respective vendors
- Vulnerabilities in underlying frameworks or dependencies without a proof of concept showing impact on this site
- Social engineering or phishing attacks not involving this codebase

## Disclosure Policy

I follow responsible disclosure. I ask that you give me reasonable time to address confirmed vulnerabilities before any public disclosure.
