# Destin L. Mincy - Portfolio Website

> **Web development, but with style** - A modern portfolio website with integrated customer portal, invoice management, and AI-powered features.

## 🚀 Project Overview

This is a comprehensive portfolio website showcasing Destin L. Mincy's work as a Web Developer and AI Engineer, featuring an integrated customer portal for invoice management, payments, contract signing, and project collaboration.

### Key Features

- ✅ **Full CMS** - All content editable via admin panel (no code changes)
- ✅ **Customer Portal** - Authentication, invoices, contracts, payments, project management
- ✅ **AI Chat Widget (Nora)** - Smart navigation, account access, meeting booking
- ✅ **Invoice Management** - Recurring invoices, payment plans, tax calculation, multi-currency
- ✅ **Contract Management** - AI-generated contracts, DocuSign integration, two-way signing
- ✅ **Payment Processing** - Stripe integration with one-click checkout (Stripe Link)
- ✅ **Meeting Booking** - Google Calendar sync, real-time availability, unified API
- ✅ **Client File Uploads** - Project file management for clients
- ✅ **Client-Initiated Contracts** - Request contracts via form or Nora chat
- ✅ **Email Notifications** - Automated reminders, confirmations, templates
- ✅ **Security & Compliance** - 2FA, audit logs, rate limiting, GDPR compliance

## 🛠️ Tech Stack

### Core
- **Framework**: Refine + Next.js (App Router)
- **Language**: TypeScript
- **UI Framework**: Ant Design
- **Styling**: Tailwind CSS + Ant Design
- **Database**: AWS RDS (PostgreSQL)
- **Authentication**: AWS Cognito (Email/Password + OAuth)
- **Storage**: AWS S3 (file uploads, media)
- **Real-time**: AWS AppSync / API Gateway WebSocket
- **Serverless**: AWS Lambda
- **CDN**: AWS CloudFront

### Integrations
- **Payments**: Stripe (Payment Intents, Elements, Link)
- **AI**: OpenAI (GPT-3.5 Turbo / GPT-4 Turbo)
- **Contracts**: DocuSign API
- **Calendar**: Google Calendar API
- **Automation**: n8n (workflows & AI Agents)
- **Analytics**: Google Analytics, Google Ads

### Testing (TDD)
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright
- **API Testing**: Jest + Supertest
- **Mocking**: Mock Service Worker (MSW)

### Deployment (AWS Ecosystem)
- **Frontend**: AWS Amplify (Next.js) or ECS/EC2
- **Database**: AWS RDS (PostgreSQL)
- **Storage**: AWS S3
- **CDN**: AWS CloudFront
- **API**: AWS Lambda (serverless)
- **Environment**: Node.js LTS

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js LTS installed
- Git installed
- AWS account with appropriate permissions
- Accounts set up for:
  - AWS (RDS, Cognito, S3, Lambda, Amplify, etc.)
  - Stripe (test mode)
  - OpenAI
  - DocuSign (optional)
  - Google Calendar API
  - n8n (optional, for automation)

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd destinlmincy.com
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all environment variables in `.env`:
   - AWS credentials (RDS, Cognito, S3, Lambda, etc.)
   - OAuth provider credentials (Google, Facebook, LinkedIn)
   - Stripe keys (test mode)
   - OpenAI API key
   - DocuSign credentials (if using)
   - Google Calendar API credentials
   - n8n webhook URLs
   - Email configuration (AWS SES)
   - Other service credentials

3. Generate secure secrets:
   ```bash
   openssl rand -base64 32  # For SESSION_SECRET
   ```

### 4. AWS Infrastructure Setup

1. **AWS RDS**: Create PostgreSQL database instance
   - Configure security groups and VPC settings
   - Set up automated backups
2. **AWS Cognito**: Create User Pool and Identity Pool
   - Configure OAuth providers (Google, Facebook, LinkedIn, GitHub)
   - Set up hosted UI (optional)
3. **AWS S3**: Create buckets (media, client-uploads, public)
   - Configure bucket policies and CORS
   - Set up CloudFront distribution for CDN
4. **AWS CloudFront**: Create distribution (for production)
   - Link to S3 buckets
   - Configure custom domain and SSL
5. **AWS Lambda**: Set up function structure (optional, for serverless API routes)
6. **AWS AppSync**: Create GraphQL API (for real-time) or API Gateway WebSocket
   - Configure authentication and authorization
7. **AWS SES**: Configure email service
   - Verify domain or email addresses
   - Set up SMTP credentials
8. **AWS ElastiCache**: Set up Redis cluster (optional, for caching)
9. Run database migrations (schema will be provided)

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

This project follows **Test-Driven Development (TDD)** methodology. All features are developed test-first.

### Run Tests

```bash
# Unit & Integration tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### TDD Workflow

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass test
3. **Refactor**: Improve code while keeping tests green

## 📁 Project Structure

```
destinlmincy.com/
├── app/                    # Next.js App Router (pages & routes)
│   ├── (public)/          # Public pages (Home, Projects, Skills, About, Contact)
│   ├── dashboard/         # Customer portal pages
│   ├── admin/             # Admin panel pages (Refine-powered)
│   ├── api/               # API routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── src/                    # Main application code (Refine structure)
│   ├── components/        # React components
│   ├── providers/         # Refine providers (data, auth, access control)
│   │   ├── dataProvider.ts    # Custom AWS RDS data provider
│   │   ├── authProvider.ts     # Custom AWS Cognito auth provider
│   │   └── accessControlProvider.ts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   └── types/             # TypeScript type definitions
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # Playwright E2E tests
├── config/                # Configuration files
│   └── nora-system-message.txt  # Nora AI system message
├── public/                # Static assets
├── .env.example           # Environment variables template
├── PROJECT_PLAN.md        # Comprehensive project plan
└── README.md              # This file
```

**Note**: This structure combines:
- **Next.js App Router** (`app/` directory) for routing and pages
- **Refine structure** (`src/` directory) for providers, components, and business logic
- This is a **hybrid approach** that leverages both frameworks' strengths

## 🎯 Development Phases

See `PROJECT_PLAN.md` for complete development roadmap. Summary:

- **Phase 1**: Foundation & Setup (Week 1)
- **Phase 2**: Admin Panel & CMS (Weeks 2-3)
- **Phase 3**: Content Creation (Week 4)
- **Phase 4**: Authentication & Customer Portal (Week 5)
- **Phase 5**: Invoice & Contract Management (Week 6)
- **Phase 6**: Payment Integration (Week 7)
- **Phase 7**: Invoice Enhancements (Week 7.5)
- **Phase 8**: AI Features Integration (Week 8)
- **Phase 9**: Email Notifications & Communication (Week 8.5)
- **Phase 10**: Security & Audit (Week 8.75)
- **Phase 11**: Meeting Booking System (Week 9)
- **Phase 12**: Additional Features (Week 9.5)
- **Phase 13**: Polish & Optimization (Week 10)
- **Phase 14**: Deployment & Launch (Week 11)
- **Phase 15**: Customer Portal Launch (Week 12+)
- **Phase 16**: Post-Launch (Ongoing)

## 📚 Documentation

- **Project Plan**: See `PROJECT_PLAN.md` for complete feature specifications, database schema, and implementation details
- **Environment Variables**: See `.env.example` for all required configuration
- **API Documentation**: Will be generated during development

## 🔐 Security

- All API endpoints are rate-limited
- Authentication uses AWS Cognito with OAuth support
- Two-factor authentication (2FA) available
- PCI-compliant payment processing (Stripe)
- GDPR compliance features
- Activity logs and audit trail

## 🤝 Contributing

This is a personal portfolio project. For questions or collaboration inquiries, please contact Destin L. Mincy.

## 📝 License

#### APACHE 2.0 + COMMONS CLAUSE

See LICENSE and COMMONS_CLAUSE files for details.

## 👤 Author

**Destin L. Mincy**
- Email: dlmincy@destinlmincy.com
- Website: destinlmincy.com
- LinkedIn: [linkedin.com/in/destinlmincy](https://linkedin.com/in/destinlmincy)
- GitHub: [github.com/DestinMincy](https://github.com/DestinMincy)

---

**Status**: 🚧 In Development  
**Last Updated**: 11-14-2025 
**Version**: 3.0 (Refactored & Streamlined)
