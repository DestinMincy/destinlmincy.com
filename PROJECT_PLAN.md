# Portfolio Website - Master Project Plan
## Destin L. Mincy - Web Developer & AI Engineer

---

## Executive Summary

**Project**: AI-Powered Portfolio & Client Management Platform  
**Owner**: Destin L. Mincy  
**Domain**: destinlmincy.com  
**Development Methodology**: Test-Driven Development (TDD)  
**MVP Timeline**: 8-11 weeks (Phases 1-10)  
**Full Launch**: Flexible, launch when ready  
**Status**: ✅ All Pre-Phase 1 Decisions Complete - Ready for Development

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **UI Framework**: Refine (data-intensive apps)
- **Component Library**: Ant Design (admin/portals)
- **Styling**: Tailwind CSS + Ant Design
- **Animations**: Framer Motion
- **State Management**: React Context + Refine providers
- **Icons**: Font Awesome / Heroicons

### Backend & Infrastructure
- **Database**: AWS RDS PostgreSQL
  - **Dev**: db.t4g.micro (1 vCPU, 1GB RAM)
  - **Prod**: db.t4g.small (2 vCPU, 2GB RAM)
  - **ORM**: Prisma (type-safe)
- **Authentication**: AWS Cognito
  - Email/password with verification
  - OAuth: Google, LinkedIn, GitHub
  - MFA: Configured, optional until launch
- **Storage**: AWS S3 (3 buckets)
  - `client-downloads`: Project deliverables, invoices, contracts
  - `portfolio-media`: Public portfolio assets
  - `user-uploads`: Client file uploads
- **Serverless**: AWS Lambda (Node.js 20.x LTS)
  - **Structure**: Monorepo (shared code, single deployment)
- **Real-time**: AWS AppSync (GraphQL subscriptions)
- **CDN**: AWS CloudFront
- **Deployment**: AWS Amplify
- **Repository Hosting**: AWS CodeCommit (with GitHub sync for client projects marked as open-source)

### AI & Automation
- **AI Provider**: OpenAI API
  - **Unauthenticated**: GPT-3.5-turbo ($0.50/1M in, $1.50/1M out)
  - **Authenticated**: GPT-4o ($2.50/1M in, $10/1M out)
  - **Rate Limits**: 20 msg/day, 5 msg/10min (guests only)
  - **Budget**: $25 soft limit / $50 hard limit monthly
- **Workflow Automation**: n8n (webhooks for complex workflows)
- **Contracts**: DocuSign API
- **Calendar**: Google Calendar API

### Payments & Business
- **Payment Processing**: Polar (Merchant of Record)
  - Handles tax compliance globally
  - Stripe Connect Express for payouts
- **Notifications (Future)**: AWS SNS (mobile push for iOS/Android)

### Testing (TDD)
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright
- **API Testing**: Jest + Supertest
- **Coverage**: Jest coverage tools
- **Methodology**: Red → Green → Refactor

---

## Budget & Cost Estimates

### Monthly Operational Costs

| Service | Environment | Specs | Monthly Cost |
|---------|-------------|-------|--------------|
| **AWS RDS** | Development | db.t4g.micro | ~$12 |
| **AWS RDS** | Production | db.t4g.small | ~$30 |
| **AWS S3** | All buckets | ~10GB storage | ~$2-6 |
| **AWS Route 53** | DNS hosting | 1 hosted zone | $0.50 |
| **AWS Amplify** | Hosting | Next.js app | ~$15-30 |
| **OpenAI API** | GPT-3.5/GPT-4o | Moderate usage | ~$5-10 |
| **CloudFront** | CDN | Low traffic initially | ~$1-5 |
| **Lambda** | Serverless | Low invocations | ~$0-2 |
| **AppSync** | Real-time | GraphQL subscriptions | ~$0-5 |
| **Cognito** | Auth | 50K MAU free | $0 |
| **CodeCommit** | Git repos | 5 users free | $0 |
| **SNS** | Notifications | Future use | $0 (initially) |
| **SES** | Email | Transactional only | ~$1-3 |
| **n8n** | Self-hosted/Cloud | Workflow automation | $0-20 |
| **Polar** | Payment processing | Per-transaction fees | Variable |
| **DocuSign** | Contracts | Pay per envelope | Variable |
| **Domain** | Namecheap | Annual renewal | ~$1/month |
| **TOTAL** | **All services** | **Estimated** | **~$80-130/month** |

### One-Time Costs
- Domain registration: ~$12/year (destinlmincy.com)
- SSL Certificate: $0 (AWS Certificate Manager - free)

### Cost Optimization Notes
- **Multi-AZ Deployment**: Deferred until revenue justifies (~$500+/month revenue)
- **RDS Backups**: Automated nightly, 7-day retention (minimal cost)
- **S3 Lifecycle**: Permanent storage for client downloads (no deletion rules)
- **Free Tier**: Cognito, CodeCommit, Lambda free tier covers initial usage
- **Scalability**: Costs increase proportionally with usage

---

## Design System

### Brand Identity
- **Primary Color**: Blue (#2776EA) - Trust, professionalism, technology
- **Accent 1**: Gold (#FFD700) - Premium, quality, achievement
- **Accent 2**: Silver (#C0C0C0) - Sophistication, modern
- **Background**: White (#FFFFFF), Dark gray (#333333)

### Typography
- **Primary Font**: Felix Titling (headings, logo, emphasis)
- **Body Font**: Montserrat (body text, UI elements)
- **Code Font**: Monospace (code snippets if needed)

### Logo & Branding
- **Logo**: Text-based
  - **Full**: "Destin L. Mincy" in Felix Titling + Blue/Gold
  - **Monogram**: "DLM" for compact spaces
  - **Variations**: Light (dark backgrounds), Dark (light backgrounds)
- **Favicon**: 512x512 derived from logo/monogram
- **Style**: Modern, clean, professional, scalable

---

## Content & Assets

### Portfolio Projects
1. **The Olympia Salon** (Featured)
   - URL: https://theolympiasalon.com
   - Client: Tina-Marie
   - Duration: ~10 years ongoing maintenance
   - Showcase: Long-term client relationship

2. **The Olympia Life Coaching Center** (Featured)
   - Client: Tina-Marie
   - Duration: Long-term ongoing maintenance
   - Showcase: Multi-business partnership

3. **Additional Projects**: 3-4 placeholder/demo projects
   - Replace with real projects as completed
   - Examples: AI Chatbot Integration, SaaS Dashboard, E-commerce Platform

### About Page Bio (Ready)
I fell in love with code at 10 years old when I got my hands on Microsoft FrontPage for Windows 3.1. By the time MySpace rolled around in late middle school and early high school, I was the guy everyone came to for custom profiles. Fast forward 17+ years, and I'm a freelance web developer and AI engineer helping small businesses and startups turn big ideas into reality.

I specialize in custom client portals, AI-powered automation, and solutions that blend cutting-edge technology with rock-solid reliability. My secret sauce? Attention to detail, relentless efficiency, and a problem-solving mindset that doesn't believe in brick walls.

**Communication is everything.** My platform automatically notifies you of every code commit, and I personally keep you updated on progress. I need you to be just as communicative about your vision, expectations, and needs. When challenges arise, we solve them together.

I'm driven by advancement—yours and mine. When you succeed, I succeed. That's why I've maintained [The Olympia Salon's](https://theolympiasalon.com) website for nearly a decade. Quality isn't negotiable. If you're not satisfied, neither am I.

I'm always learning new tech (though I'm partial to Node.js and React), but one thing never changes: **I refuse to deliver slop.** Every project gets my best work, every time.

Let's build something great together.

### Professional Assets
- **Headshot**: `Destin-L-Mincy__HEADSHOT.png` ✅
- **Logo**: To be designed in Phase 2
- **Favicon**: To be created from logo in Phase 2

### Skills/Technologies
**Frontend**: React, Next.js, Refine, TypeScript, Ant Design, Tailwind CSS, Framer Motion  
**Backend**: Node.js, Express, AWS Lambda (Serverless)  
**Databases**: PostgreSQL, AWS RDS, Prisma ORM  
**Authentication**: AWS Cognito, OAuth, JWT, MFA  
**Cloud & DevOps**: AWS (Amplify, S3, CloudFront, API Gateway, AppSync, CodeCommit)  
**Real-time**: AWS AppSync (GraphQL), WebSocket  
**Payments**: Polar (Merchant of Record), Stripe Connect  
**AI & ML**: OpenAI (GPT-3.5-turbo, GPT-4o), LangChain, Function Calling  
**APIs & Integrations**: DocuSign API, Google Calendar API, n8n (Workflow Automation)  
**Testing**: Jest, React Testing Library, Playwright (E2E), TDD Methodology  
**Version Control**: Git, GitHub, AWS CodeCommit  
**Other Tools**: Docker, CI/CD, RESTful APIs, GraphQL

---

## MVP Scope & Timeline

### MVP Definition (8-11 weeks)
**Core Phases**: 1-10 (Foundation to Launch)

#### Phase 1: Foundation & Setup (Week 1)
- AWS infrastructure setup (RDS, Cognito, S3, Lambda, AppSync)
- Next.js + Refine + TypeScript + Tailwind initialization
- Prisma ORM setup and database schema
- TDD infrastructure (Jest, Playwright, test database)
- Design system implementation (colors, fonts, components)
- Environment configuration and validation

#### Phase 2: Admin Panel & CMS (Weeks 2-3)
- Admin authentication and authorization
- Admin dashboard with analytics
- Content Management System (WYSIWYG editor)
- Portfolio projects CRUD (image upload to S3)
- Public portfolio pages (Home, About, Projects, Skills, Contact)
- Dynamic content rendering from database

#### Phase 3: Authentication & Customer Portal (Week 4-5)
- AWS Cognito integration (email/password, OAuth)
- Customer authentication flows (signup, login, password reset)
- Email verification
- Customer dashboard
- Profile management
- Basic notification system

#### Phase 4: Project Management Engine (Week 6) **[MOVED UP]**
- Project data structure (Prisma models)
- AWS CodeCommit integration (create/view repositories)
- Milestone tracking system
- Deliverables management
- File browser for repositories
- **Goal**: Clients can see their project progress and code immediately.

#### Phase 5: Quotes & Estimates (Week 7)
- Quote creation and management (admin)
- Quote numbering system
- Quote PDF generation
- Customer quote viewing and approval
- Quote status tracking
- Convert quotes to contracts workflow

#### Phase 6: Invoices, Contracts & Payments (Weeks 7.5-8)
- Invoice creation and management (admin)
- Invoice numbering system
- Invoice PDF generation
- Polar payment integration
- Payment processing and tracking
- DocuSign contract integration
- Contract creation, sending, and tracking
- Two-way signing workflow

#### Phase 7: AI Features Integration (Nora) (Weeks 8-9)
- OpenAI API integration (GPT-3.5-turbo + GPT-4o)
- Nora chat widget UI (persistent bubble)
- Model routing (guest vs authenticated)
- Rate limiting for unauthenticated users
- Chat history (session-based + persistent)
- Smart navigation and page highlighting
- Function calling for authenticated users (invoice/contract queries)
- Meeting booking integration

#### Phase 8: Meeting Booking System (Week 10)
- Google Calendar API integration
- Booking page with calendar and time slots
- Availability management (operation hours, blocked times)
- Real-time availability checking
- Admin booking management
- n8n workflow for booking automation
- Email confirmations and reminders

#### Phase 9: Polish & Optimization (Week 11)
- UI/UX refinement across all pages
- Performance optimization
- Accessibility improvements
- Mobile responsiveness testing
- Cross-browser testing
- Bug fixes and quality assurance

#### Phase 10: Deployment & Launch (Week 11-12)
- AWS Amplify production deployment
- Domain configuration (Route 53)
- SSL certificate setup (AWS Certificate Manager)
- Environment variable configuration
- Database migration to production
- Final security audit
- **Launch!** 🚀

### Post-MVP Phases (After Launch)
**Phases 11+**: Add features based on client feedback while generating revenue

- **Phase 11**: Project Collaboration (Comments, Approvals)
- **Phase 12**: Invoice Enhancements & Subscriptions (Recurring invoices, payment plans)
- **Phase 13**: Email Notifications & Communication (AWS SES, notification system)
- **Phase 14**: Security & Audit (Security hardening, audit logging, penetration testing)
- **Phase 15**: Additional Features
  - **Client Onboarding Checklists**: Structured task lists for new clients (upload assets, sign contract, fill questionnaire)
  - **Project Templates**: Pre-configured project types with default milestones and deliverables
  - **Testimonials**: Submission workflow and display
  - **Expense Tracking**: Project-based expense logging
  - **Certificates**: Project completion certificates
- **Phase 16**: Post-Launch (Ongoing improvements, analytics, SEO)

---

## Key Decisions Summary

### ✅ Technical Decisions
| Category | Decision | Rationale |
|----------|----------|-----------|
| **E2E Testing** | Playwright | Better performance, modern API, cross-browser |
| **Code Coverage** | Yes, context-aware | 80% critical paths, 50% utils, flexible |
| **ORM** | Prisma | Type-safe, migrations, great DX |
| **RDS Instances** | db.t4g.micro (dev), db.t4g.small (prod) | Cost-effective for initial scale |
| **Backups** | Nightly at midnight, 7-day retention | Balance cost and disaster recovery |
| **Multi-AZ** | No initially | Cost savings (~$500/month extra) |
| **Email Verification** | Yes, required | Security and valid contact info |
| **MFA** | Optional until launch | Configured but not forced initially |
| **OAuth Providers** | Google, LinkedIn, GitHub | Target professional audience |
| **Real-time Service** | AWS AppSync | GraphQL subscriptions, managed |
| **Push Notifications** | AWS SNS | For future mobile apps |
| **Lambda Structure** | Monorepo | Shared code, easier management |
| **Lambda Runtime** | Node.js 20.x | Latest LTS |
| **Repository Hosting** | AWS CodeCommit | Free, AWS ecosystem, milestone control |
| **Deployment Platform** | AWS Amplify | Zero DevOps, automatic CI/CD |

### ✅ Service Integrations
| Service | Status | Details |
|---------|--------|---------|
| **Polar** | Setup Phase 6 | Merchant of Record for payments |
| **Google Cloud** | Project exists | Project: destinlmincy-com, API Key ready |
| **Google Calendar** | Personal Gmail | OAuth client configured |
| **Google Analytics** | Create Phase 1 | GA4 property needed |
| **AWS SES** | Setup Phase 1 | Domain verification, SMTP, production access |
| **n8n** | Available | Workflows to be configured |
| **DocuSign** | Account ready | User ID & Account ID configured, need Integration Key |
| **OpenAI** | API key ready | Full model access, GPT-3.5-turbo + GPT-4o |
| **AWS** | Setup Phase 1 | Need Access Key ID, Secret Access Key |

### ✅ Project Scope
| Aspect | Decision |
|--------|----------|
| **MVP Phases** | 1-10 (Core + Launch) |
| **Post-MVP** | 11+ (Enhancements) |
| **Timeline** | Flexible, no hard deadlines |
| **Weekly Hours** | ~10-20 hours (variable schedule) |
| **Launch Strategy** | "Launch when ready" - quality over speed |

---

## Site Structure

### Public Pages
| Page | Route | Key Features |
|------|-------|--------------|
| **Home** | `/` | Hero, services preview, featured projects, Nora AI chat |
| **Projects** | `/projects` | Portfolio showcase, filterable, detailed views |
| **Skills** | `/skills` | Tech stack, categorized skills, visual presentation |
| **About** | `/about` | Professional bio, headshot, experience timeline |
| **Book a Meeting** | `/book` | Google Calendar integration, availability, time slots |
| **Contact** | `/contact` | Contact form, AI spam detection, contact info |

### Customer Portal Pages
| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/dashboard` | Balance, invoices, quotes, contracts overview |
| **Quotes** | `/quotes` | View quotes, approve/reject, download PDFs |
| **Invoices** | `/invoices` | View invoices, pay via Polar, payment history |
| **Contracts** | `/contracts` | View contracts, DocuSign signing, request new |
| **Projects** | `/projects` | Assigned projects, file uploads, project details |
| **Repositories** | `/projects/:id/repo` | Browse code, view commits, download milestones |
| **Milestones** | `/projects/:id/milestones` | Track progress, view deliverables |
| **Payments** | `/payments` | Payment history, receipts, saved methods |
| **Messages** | `/messages` | In-app messaging with admin |
| **Notifications** | `/notifications` | Notification center, preferences |
| **Profile** | `/profile` | Account settings, password, 2FA, email preferences |

### Admin Pages
| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/admin` | Analytics, revenue, stats, quick actions |
| **Projects** | `/admin/projects` | Portfolio CRUD, image upload, featured toggle |
| **Content** | `/admin/content` | Edit all pages (Home, About, Skills, etc.) |
| **Quotes** | `/admin/quotes` | Create/manage quotes, convert to contracts |
| **Invoices** | `/admin/invoices` | Create/manage invoices, payment tracking |
| **Contracts** | `/admin/contracts` | Create contracts, DocuSign integration |
| **Customers** | `/admin/customers` | Customer management, view accounts |
| **Messages** | `/admin/messages` | Customer messaging, threads |
| **Bookings** | `/admin/bookings` | View bookings, manage availability |
| **Settings** | `/admin/settings` | Site config, integrations, security |

---

## Core Features

### 1. Nora (New Opportunity Relationship Advisor) ⭐
**Persistent chat widget on all pages**

**Two-Tier Model Strategy**:
- **Unauthenticated Users**: GPT-3.5-turbo
  - General business Q&A
  - Appointment scheduling
  - Rate limited: 20 msg/day, 5 msg/10min
  - Session-based chat history
  
- **Authenticated Users**: GPT-4o
  - All unauthenticated features
  - Query invoices, payments, contracts
  - Project-specific assistance
  - No rate limits
  - Persistent chat history

**Capabilities**:
- Smart navigation (directs users to pages/sections)
- Visual highlighting of content
- Meeting booking via Google Calendar
- Contract request assistance
- Function calling for data access (authenticated)

### 2. Customer Portal
**Authentication via AWS Cognito**:
- Email/password with verification
- OAuth: Google, LinkedIn, GitHub
- MFA available (optional)
- Password reset flows
- Session management

**Portal Features**:
- Dashboard with financial overview
- Quote approval workflow
- Invoice viewing and payment (Polar)
- Contract signing (DocuSign)
- Project file uploads
- **Repository Browsing** (CodeCommit integration)
- **Milestone Tracking**
- In-app messaging
- Notification center
- Profile and settings management

### 3. Admin CMS
**Full Content Management**:
- WYSIWYG editor (TinyMCE/react-quill)
- Edit all public pages without code changes
- Portfolio project management
- Image/media upload to S3
- Draft/publish workflow
- Content preview

**Business Management**:
- Quote creation and tracking
- Invoice generation and management
- Contract workflow automation
- Customer account management
- Booking management
- Analytics and reporting

### 4. Payment Processing (Polar)
**Merchant of Record Benefits**:
- Global tax compliance handled
- Multi-currency support
- Automatic invoicing
- Stripe Connect Express for payouts
- Customer payment methods storage
- Subscription support (future)

**Payment Features**:
- One-time invoice payments
- Payment plans (future)
- Automatic receipts
- Payment history tracking
- Refund processing

### 5. Contract Management (DocuSign)
**Automated Workflows**:
- Contract generation from quotes
- Electronic signature integration
- Two-way signing support
- Client-initiated contract requests
- Status tracking (draft, sent, signed, completed)
- Automatic storage in S3
- Email notifications

---

## Database Schema (Prisma)

### Core Models

```prisma
model Customer {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String
  role          String   @default("customer") // admin, customer
  cognitoId     String?  @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  quotes        Quote[]
  invoices      Invoice[]
  contracts     Contract[]
  projects      Project[]
  payments      Payment[]
  messages      Message[]
}

model Quote {
  id            String   @id @default(uuid())
  quoteNumber   String   @unique
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  status        String   // draft, sent, approved, rejected, converted
  amount        Decimal
  description   String   @db.Text
  items         Json     // Line items
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  expiresAt     DateTime?
}

model Invoice {
  id            String   @id @default(uuid())
  invoiceNumber String   @unique
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  status        String   // draft, sent, paid, overdue, cancelled
  amount        Decimal
  paidAmount    Decimal  @default(0)
  description   String   @db.Text
  items         Json     // Line items
  dueDate       DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  payments      Payment[]
}

model Contract {
  id            String   @id @default(uuid())
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  title         String
  status        String   // draft, sent, signed, completed, cancelled
  docusignId    String?  @unique
  s3Url         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  signedAt      DateTime?
}

model Payment {
  id            String   @id @default(uuid())
  invoiceId     String
  invoice       Invoice  @relation(fields: [invoiceId], references: [id])
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  amount        Decimal
  status        String   // pending, completed, failed, refunded
  polarPaymentId String? @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Project {
  id            String   @id @default(uuid())
  title         String
  description   String   @db.Text
  slug          String   @unique
  featured      Boolean  @default(false)
  technologies  String[] // Array of tech used
  images        String[] // S3 URLs
  liveUrl       String?
  githubUrl     String?
  customerId    String?
  customer      Customer? @relation(fields: [customerId], references: [id])
  
  // New MVP Features
  repositoryUrl String?  // AWS CodeCommit URL
  licenseType   String   @default("PROPRIETARY") // MIT, APACHE2, GPL3, PROPRIETARY, SOURCE_AVAILABLE
  milestones    Milestone[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Milestone {
  id            String   @id @default(uuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  title         String
  status        String   // pending, in_progress, completed, approved
  dueDate       DateTime?
  deliverables  Json     // Links to files/commits
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model PageContent {
  id            String   @id @default(uuid())
  page          String   @unique // home, about, skills, contact
  content       Json     // Flexible JSON structure
  published     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Booking {
  id            String   @id @default(uuid())
  name          String
  email         String
  phone         String?
  date          DateTime
  duration      Int      // minutes
  status        String   // pending, confirmed, cancelled, completed
  notes         String?  @db.Text
  googleEventId String?  @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Message {
  id            String   @id @default(uuid())
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  fromAdmin     Boolean  @default(false)
  content       String   @db.Text
  read          Boolean  @default(false)
  createdAt     DateTime @default(now())
}
```

---

## Pre-Phase 1 Action Items

Before starting development:

### ☐ Domain & DNS
- [ ] Register `destinlmincy.com` via Namecheap
- [ ] Transfer DNS management to AWS Route 53
- [ ] Configure DNS records

### ☐ AWS Setup
- [ ] Create/configure AWS account with appropriate permissions
- [ ] Generate AWS Access Key ID and Secret Access Key
- [ ] Set up AWS SES (domain verification, SMTP credentials)
- [ ] Request AWS SES production access

### ☐ Third-Party Services
- [ ] Create Google Analytics GA4 property
- [ ] Generate DocuSign Integration Key
- [ ] Configure n8n instance and obtain webhook URLs
- [ ] Set up Polar account (Phase 6, can defer)

### ☐ Environment Configuration
- [ ] Complete all variables in `.env.local`
- [ ] Verify all API keys and credentials
- [ ] Test service connections

### ☐ Development Environment
- [ ] Node.js 20.x LTS installed
- [ ] Git configured
- [ ] IDE/Editor ready (VS Code recommended)
- [ ] Docker installed (for local PostgreSQL)

---

## Development Guidelines

### Test-Driven Development (TDD)
**Workflow**: Red → Green → Refactor

1. **Write the test first** (it will fail - red)
2. **Write minimal code** to make test pass (green)
3. **Refactor** for quality and maintainability
4. **Repeat** for each feature

**Coverage Targets**:
- Critical paths (auth, payments): 80%+
- Business logic: 70%+
- Utilities: 50%+
- UI components: 60%+

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Enforce code style
- **Prettier**: Automatic formatting
- **Git Hooks**: Pre-commit linting and formatting
- **PR Reviews**: All code reviewed before merge
- **Documentation**: Comment complex logic

### Git Workflow
- **Branches**: `feature/*`, `bugfix/*`, `hotfix/*`
- **Commits**: Conventional commits format
- **Main Branch**: Protected, requires PR + tests passing
- **Deployments**: Automatic via AWS Amplify on merge to main

### Security Best Practices
- **Environment Variables**: Never commit `.env.local` to git
- **API Keys**: Rotate regularly, use AWS Secrets Manager for production
- **Authentication**: AWS Cognito handles security
- **Input Validation**: Validate all user inputs
- **SQL Injection**: Prisma prevents by default
- **XSS Protection**: React escapes by default
- **HTTPS**: Enforced via AWS CloudFront + Certificate Manager

---

## Deployment Strategy

### Development Environment
- **Local Database**: PostgreSQL via Docker
- **Local S3**: LocalStack or direct AWS dev bucket
- **Local Testing**: Jest + Playwright
- **Hot Reload**: Next.js fast refresh

### Staging Environment (AWS Amplify Preview)
- **Branch**: `develop`
- **Database**: Dev RDS instance
- **Services**: Dev AWS resources
- **Purpose**: Pre-production testing

### Production Environment (AWS Amplify)
- **Branch**: `main`
- **Database**: Prod RDS instance
- **Domain**: destinlmincy.com
- **SSL**: AWS Certificate Manager (automatic)
- **CDN**: CloudFront distribution
- **Monitoring**: AWS CloudWatch

### CI/CD Pipeline (AWS Amplify)
1. Push to `main` branch
2. Amplify detects change
3. Run build: `npm run build`
4. Run tests: `npm test`
5. Deploy to production (if tests pass)
6. Invalidate CloudFront cache
7. Notify deployment status

---

## Monitoring & Maintenance

### Monitoring Tools
- **AWS CloudWatch**: Application logs, metrics, alarms (Backend/Infrastructure)
- **Sentry**: Frontend error tracking and performance monitoring (Free tier)
- **RDS Monitoring**: Database performance, query analytics
- **Amplify Monitoring**: Build logs, deployment history

### Email Configuration
- **System Notifications**: `noreply@destinlmincy.com` (Automated emails)
- **Personal/Support**: `dlmincy@destinlmincy.com` (Direct communication)
- **Service**: AWS SES (verify both addresses + domain)

### Backup Strategy
- **Database**: Automated nightly backups, 7-day retention
- **S3**: Versioning enabled on critical buckets
- **Code**: Git repository (AWS CodeCommit + GitHub)
- **License**: Apache 2.0 + Commons Clause (this project is NOT open source)
- **Client Project Licenses**: Individual client projects can choose their own license (MIT, Apache 2.0, GPL3, Proprietary, Source Available) during project creation

### Maintenance Schedule
- **Weekly**: Review error logs, performance metrics
- **Monthly**: Security updates, dependency updates
- **Quarterly**: Cost optimization review, feature planning
- **Annually**: Security audit, disaster recovery test

---

## Success Metrics

### Launch Goals
- [ ] All MVP features functional and tested
- [ ] Zero critical bugs
- [ ] Page load time < 3 seconds
- [ ] Mobile responsive on all pages
- [ ] Accessibility score 90%+ (Lighthouse)
- [ ] SEO optimized (meta tags, sitemap, robots.txt)

### Post-Launch Metrics
- **Traffic**: Google Analytics tracking
- **Conversion**: Contact form submissions, booking requests
- **Engagement**: Nora AI interaction rate
- **Client Satisfaction**: Contract completion rate, repeat clients
- **Performance**: Uptime 99.9%+, response time < 500ms

---

## Contact & Support

**Project Owner**: Destin L. Mincy  
**Domain**: destinlmincy.com  
**Email**: (to be configured via SES)

---

## Document Version

**Last Updated**: 2025-01-20  
**Status**: ✅ All Pre-Phase 1 Decisions Complete  
**Next Phase**: Phase 1 - Foundation & Setup

---

🚀 **Ready to Build!** Let's start Phase 1 when you've completed the Pre-Phase 1 action items.
