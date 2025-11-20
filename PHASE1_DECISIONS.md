# Phase 1: Foundation & Setup - Decision Tracking

**Status**: 🟡 In Progress (15 decisions made)  
**Last Updated**: November 19, 2025

---

## 1. Testing Framework Decisions

### 1.1 E2E Testing Framework
- **Decision**: ✅ **Playwright**
- **Reasoning**: 
  - Mobile testing support (iPhone, Android emulation)
  - Safari (WebKit) support for cross-browser compatibility
  - Faster parallel execution with built-in parallelization
  - Better for complex scenarios (Polar payment iframes, multi-tab support)
  - Completely free (no CI/CD costs)
  - Test generator available
- **Notes**: Slightly steeper learning curve than Cypress, but worth it for features and performance

### 1.2 Code Coverage Enforcement
- **Decision**: ✅ **Yes, with context-aware thresholds**
- **Configuration**:
  - **Business logic** (`src/services/`): 85% statements, 80% branches
  - **API routes** (`src/pages/api/`): 80% statements, 75% branches
  - **UI components** (`src/components/`): 70% statements, 60% branches
  - **Global baseline**: 75% statements, 70% branches
- **Reasoning**: Higher thresholds for critical code (payments, auth), more lenient for UI

---

## 2. ORM Choice

### 2.1 Database ORM Selection
- **Decision**: ✅ **Prisma**
- **Reasoning**:
  - Perfect Next.js + Refine integration
  - Best-in-class TypeScript support with automatic type generation
  - Critical for financial data - type safety prevents costly bugs
  - Excellent handling of complex relations
  - Superior migration system for evolving schema across 18 phases
  - Prisma Studio GUI for visualization
  - Great PostgreSQL support (Decimal types for currency, UUID, JSON fields)
- **Trade-offs**: Larger bundle size (~5MB), less raw SQL control

---

## 3. AWS Infrastructure Details

### 3.1 AWS RDS (PostgreSQL)

#### 3.1.1 Instance Sizes
- **Decision**: ✅ **db.t4g.micro (Dev) / db.t4g.small (Prod)**
- **Development**: db.t4g.micro (1 GB RAM, ~$12/month, free tier eligible)
- **Production**: db.t4g.small (2 GB RAM, ~$30/month total)
- **Reasoning**: ARM Graviton2 instances 20-30% cheaper with better performance. Easy upgrade path when needed.
- **Scaling Path**: db.t4g.medium at 50-75 customers, db.t4g.large at 100+ customers

#### 3.1.2 Automated Backups
- **Decision**: ✅ **Yes - Nightly at midnight, 7-day retention**
- **Configuration**:
  - Backup window: 12:00 AM - 1:00 AM
  - Point-in-time recovery enabled
  - Transaction logs backed up every 5 minutes
- **Benefits**: Protection against data loss, disaster recovery, rollback capability
- **Cost**: ~$2.30/month (dev), ~$5.75/month (prod)

#### 3.1.3 Multi-AZ Deployment
- **Decision**: ✅ **No initially - Enable when revenue > $500/month OR 20+ customers**
- **Reasoning**: 
  - Save $360/year initially
  - Single-AZ is 99.95% reliable (acceptable at launch)
  - Can enable later with zero downtime
  - Automated backups provide adequate disaster recovery

---

### 3.2 AWS Cognito

#### 3.2.1 Email Verification
- **Decision**: ✅ **Yes - Required for email/password, automatic for OAuth**
- **Strategy**:
  - Email/password: Manual verification via link (24-hour expiration)
  - OAuth (Google, LinkedIn, GitHub): Automatic verification
  - Email-based identity (one account, multiple login methods)
- **Benefits**: Security, data quality, GDPR compliance

#### 3.2.2 MFA Availability
- **Decision**: ✅ **Configure in Phase 1, keep optional until launch**
- **Implementation**:
  - Phase 1: Configure TOTP in Cognito (infrastructure ready)
  - Pre-Launch: Enable for admin account
  - Post-Launch: Build full MFA UI/UX (Phase 12)
- **Cost**: TOTP free, SMS $0.00645 per message (if enabled)

#### 3.2.3 OAuth Providers
- **Decision**: ✅ **Google, LinkedIn, and GitHub**
- **Reasoning**:
  - **Google**: 90%+ coverage, most trusted
  - **LinkedIn**: B2B professional services audience
  - **GitHub**: Tech community and developers
  - Covers 95%+ of target audience
- **Setup Time**: ~35 minutes total

---

### 3.3 AWS S3 Buckets

#### 3.3.1 Bucket Structure
- **Decision**: ✅ **Multiple buckets with specific purposes**
- **Buckets**:
  1. **client-downloads**: Client deliverables (code, invoices, contracts)
     - Structure: `customer-{id}/project-{id}/[code|invoices|contracts]/`
     - Versioning: ENABLED
     - Cost: ~$1.27/year for 10 projects
  2. **portfolio-media**: Portfolio images/videos (public via CloudFront)
  3. **user-uploads**: Optional, for client-uploaded files

#### 3.3.2 Client Downloads Structure
- **Folder Organization**:
  ```
  customer-{customer_id}/
    project-{project_id}/
      code/
        milestone-1.zip (permanent)
        milestone-2.zip (permanent)
        full-project.zip (updated with each milestone)
      invoices/
        invoice-001.pdf
        invoice-002.pdf
      contracts/
        contract-signed.pdf
  ```
- **Storage Strategy**:
  - Per-milestone ZIPs: Permanent, never deleted
  - Full project ZIP: Replaced with each milestone (always current)
  - Invoice/Contract PDFs: Permanent (7-year retention for compliance)

#### 3.3.3 Storage Costs
- **Per Project** (4 milestones): ~462 MB total
- **10 Projects**: 4.62 GB = **~$1.27/year** (essentially free)
- **Total S3 Cost**: ~$2-6/month for all buckets

#### 3.3.4-3.3.6 Configuration
- **Lifecycle Rules**: None for client-downloads (permanent storage required)
- **Versioning**: Enabled on client-downloads for protection
- **Security**: 
  - Public access blocked
  - Signed URLs (1-hour expiration)
  - Multi-layered access control
  - Audit logging enabled

#### 3.3.7 Access Control
- **Code ZIPs**: Requires authentication + payment + code_released flag
- **Invoices**: Customer can download anytime (no payment required to view)
- **Contracts**: Always accessible after signing
- All downloads tracked in `download_logs` table

#### 3.3.8 PDF Workflows
- **Invoice**: Generated on creation → Upload to S3 → Email notification
- **Contract**: DocuSign webhook → Download signed PDF → Upload to S3
- **Code**: Milestone released → Generate ZIPs → Upload to S3 → Email

---

### 3.4 Real-time Communication

#### 3.4.1 Real-time Service Selection
- **Question**: AWS AppSync (GraphQL) or API Gateway WebSocket?
- **Decision**: ✅ **AWS AppSync (GraphQL subscriptions)**
- **Reasoning**:
  - Perfect for real-time data sync across web and future mobile apps
  - Refine has built-in GraphQL support (seamless integration)
  - Managed service (no WebSocket infrastructure management)
  - Automatic scaling
  - Ideal for live updates: invoice status, milestone progress, project changes
  - Works with React Native for future iOS/Android apps
- **Use Cases**:
  - Live dashboard updates when invoices are paid
  - Real-time milestone completion notifications
  - Project status changes
  - Chat/messaging features (if added)
- **Notes**: For background push notifications when mobile apps are closed, will use AWS SNS (separate service)

#### 3.4.2 Push Notifications (Mobile Apps - Future)
- **Question**: AWS SNS or Amazon Pinpoint for mobile push notifications?
- **Decision**: ✅ **AWS SNS (Simple Notification Service)**
- **Reasoning**:
  - Mobile apps planned for future (iOS/Android client access)
  - SNS handles push notifications when apps are closed/background
  - Supports iOS (APNs) and Android (FCM)
  - Simple and cost-effective (~$0.50 per million notifications)
  - Can also send SMS and email notifications
  - Pinpoint not needed (overkill for this use case - it's for marketing campaigns)
- **Implementation Timeline**: Phase 17+ (when mobile apps are developed)
- **Cost**: Essentially free for initial client base (first million SNS publishes free/month)
- **Architecture**:
  - **AppSync**: Real-time sync when app/web is OPEN (live data)
  - **SNS**: Push notifications when mobile app is CLOSED (background alerts)
  - Both work together for complete notification coverage

---

### 3.5 AWS Lambda

#### 3.5.1 Lambda Project Structure
- **Question**: Monorepo or separate functions?
- **Decision**: ✅ **Monorepo**
- **Reasoning**:
  - Easier code sharing and utilities (DRY principle)
  - Single source of truth (matches Prisma schema-first approach)
  - Simplified dependency management
  - Consistent deployment pipeline
  - Better for solo developer (less overhead to maintain)
  - Industry standard for serverless projects
  - Easier refactoring across functions
- **Structure**:
  ```
  /lambdas
    /shared
      utils.ts
      aws-clients.ts
      prisma-client.ts
      types.ts
    /invoice-pdf
    /github-sync
    /docusign-webhook
    /email-notifications
  ```
- **Trade-offs**: Less isolation between functions (acceptable - all part of same system)

#### 3.5.2 Node.js Runtime Version
- **Question**: Node.js 18.x or 20.x?
- **Decision**: ✅ **Node.js 20.x (latest LTS)**
- **Reasoning**:
  - Latest LTS release (long-term support until 2026)
  - Better performance improvements over 18.x
  - Matches modern stack philosophy (Graviton2, Prisma, Playwright)
  - Future-proof (18.x support ends April 2025)
  - Native fetch API built-in
  - Improved TypeScript support
- **Notes**: AWS Lambda supports Node.js 20.x natively

---

### 3.6 AWS CodeCommit (Client Repositories)

#### 3.6.1 Repository Hosting
- **Decision**: ✅ **AWS CodeCommit**
- **Reasoning**:
  - 100% AWS ecosystem integration
  - IAM-based access control for milestone-based code release
  - Private by default
  - FREE (5 users, 50 GB storage, 10K requests/month)
  - Custom UI needed anyway

#### Repository Strategy
- **Naming**: `project-{project_id}` or `client-{customer_id}-{project_name}`
- **Access**: Admin full access, clients read-only via backend API
- **Milestone Control**: Backend enforces payment + completion before serving files

#### Open-Source Projects
- **Automatic GitHub Sync**: When `is_open_source = true`
  - Real-time sync via CodeCommit trigger → Lambda → GitHub API
  - CodeCommit remains source of truth, GitHub is public mirror
  - Sync completes in 3-5 seconds

#### Download System
- **Permanent Access**: Clients have lifetime access to released code/documents
- **Storage**: See Section 3.3 for complete S3 structure and costs
- **UI**: Custom file browser with commit history, milestone indicators, download buttons

#### Cost
- **CodeCommit**: FREE (under tier limits)
- **S3 Storage**: ~$0.05/month for download storage
- **Total**: Essentially free (<$1/year)

---

## 4. Polar (Payment Processing) Setup

### 4.1 Polar Account Status
- **Question**: Do you have a Polar account?
- **Decision**: ✅ **Not yet - Set up during Phase 5 (Invoices & Payments)**
- **Notes**: Will create account at https://polar.sh when implementing payment features

### 4.2 Stripe Connect Express
- **Question**: Have you set up Stripe Connect Express for payouts?
- **Decision**: ✅ **Not yet - Set up during Phase 5**
- **Notes**: Polar uses Stripe backend, will configure when setting up Polar

### 4.3 Polar API Keys
- **Question**: Do you have Polar API keys (test + production)?
- **Decision**: ✅ **Not yet - Obtain during Phase 5**
- **Notes**: Will generate test keys first for development, production keys before launch

---

## 5. Design System & Colors

### 5.1 Color Palette
- **Decision**: ✅ **Color Palette Defined**
- **Colors**:
  - Primary Blue: `#2776EA` (professional, trustworthy)
  - Gold/Accent: `#FFD700` (premium feel)
  - Silver/Gray: `#C0C0C0` (elegant neutral)
  - Background: `#FFFFFF` (light mode)
  - Text: `#333333` (high readability)
- **Implementation**: CSS variables/Tailwind config with light/dark modes

### 5.2 Font Stack
- **Decision**: ✅ **Felix Titling + Montserrat**
- **Usage**:
  - **Headings**: Felix Titling (elegant, distinctive)
  - **Body**: Montserrat (modern, readable)
- **Implementation**: Google Fonts, optimized loading

---

## 6. Environment Variables

### 6.1 .env Review
- **Question**: Review .env.example (752 lines) for Phase 1 requirements?
- **Decision**: ✅ **Deferred - Review during Phase 1 implementation**
- **Notes**: Too detailed for planning phase. Will identify required variables when building each feature.

### 6.2 Existing API Keys/Secrets
- **Question**: Do you have any API keys ready?
- **Decision**: ✅ **To be obtained before Phase 1 implementation**
- **Required Keys**:
  - OpenAI API Key: Need to obtain
  - AWS Access Keys: Need to create IAM user
  - Google API Keys (OAuth, Analytics, Calendar): Need to obtain
  - Polar API Keys: Deferred to Phase 5
  - DocuSign Keys: Deferred to Phase 8
- **Notes**: Will set up AWS and OpenAI keys before starting Phase 1 development

---

## 7. Domain & Hosting

### 7.1 Domain Name
- **Decision**: ✅ **destinlmincy.com**
- **Registration**: Not yet registered - Will use Namecheap
- **DNS**: Will transfer to AWS Route 53 after registration
- **SSL**: AWS Certificate Manager (free)
- **Cost**: ~$15-25/year (domain) + $6/year (Route 53)

### 7.2 AWS Route 53
- **Decision**: ✅ **Yes, transfer DNS to Route 53**
- **Reasoning**: Seamless AWS integration, automatic SSL validation, programmatic DNS management
- **Cost**: $0.50/month ($6/year)

### 7.3 Deployment Platform
- **Decision**: ✅ **AWS Amplify**
- **Reasoning**:
  - Next.js optimized
  - 15 min setup vs 2 days (ECS/EC2)
  - ~$15/month vs ~$80/month (ECS/EC2)
  - Zero maintenance, automatic scaling
  - Built-in CI/CD, preview deployments, one-click rollback
  - SSL/CDN included
- **Trade-offs**: Less infrastructure control (not needed for this project)

---

## 8. DocuSign Integration

### 8.1 DocuSign Account
- **Question**: Do you have a DocuSign account?
- **Decision**: ✅ **Yes - Account configured**
- **Account Details**:
  - User ID: `d91ab14c-2424-4aaa-ade7-8ef15627ee98`
  - API Account ID: `58084683-3088-42bd-b319-6d9452b742a6`
  - Account Base URI: `https://www.docusign.net`
  - Environment: Production
- **Notes**: Account ready for API integration when implementing contract features (Phase 8)

### 8.2 DocuSign API Credentials
- **Question**: Do you have DocuSign API credentials?
- **Decision**: ✅ **Account exists, need to generate Integration Key**
- **Required for API Integration**:
  - Integration Key (Client ID): Need to create app in DocuSign Developer Console
  - Secret Key: Generated with Integration Key
  - OAuth Redirect URI: Will configure during Phase 8
  - RSA Key Pair: For JWT authentication (recommended)
- **Setup Process** (when implementing Phase 8):
  1. Go to DocuSign Admin → Apps and Keys
  2. Create new app/integration
  3. Generate Integration Key and Secret Key
  4. Configure OAuth redirect URIs
  5. Set up webhook endpoints for envelope status updates
  6. Store credentials in environment variables
- **Notes**: Account foundation ready. Will complete API setup during Phase 8 (Contract Management)

---

## 9. n8n Workflows

### 9.1 n8n Instance
- **Question**: Do you have an n8n instance running?
- **Decision**: ✅ **Yes - n8n available, configuration pending**
- **Notes**: Have n8n instance, will configure workflows during implementation phases

### 9.2 n8n Webhook URLs
- **Question**: Do you have webhook URLs ready?
- **Decision**: ✅ **Not yet - Will create during workflow implementation**
- **Webhooks Needed**:
  - Contract generation workflow (Phase 8)
  - Meeting booking automation (Phase 13)
  - Contact form handling (Phase 2/3)
  - General automation triggers
- **Notes**: Will create and configure webhooks as each workflow is implemented

---

## 10. OpenAI API

### 10.1 OpenAI API Key
- **Question**: Do you have an OpenAI API key?
- **Decision**: ✅ **Yes - API key ready**
- **Security Notes**:
  - ⚠️ API key should be stored in `.env.local` file (never commit to git)
  - ⚠️ Add `.env.local` to `.gitignore` 
  - ⚠️ Use environment variable: `OPENAI_API_KEY=sk-proj-...`
  - Key prefix: `sk-proj-ju4M...` (project-scoped key)
- **Implementation**: Store in environment variables during Phase 1 setup

### 10.2 Model Access & Two-Tier Strategy
- **Question**: Which OpenAI models should power Nora AI?
- **Decision**: ✅ **Two-tier model strategy based on authentication status**

#### Unauthenticated Users → GPT-3.5-turbo
- **Use Cases**:
  - General business/portfolio Q&A chatbot
  - Appointment scheduling (calendar integration)
- **Model**: GPT-3.5-turbo ($0.50/1M input, $1.50/1M output)
- **Rate Limiting**:
  - 20 messages per IP per day (prevents abuse)
  - 5 messages per 10 minutes (burst protection)
  - Warning at 15 messages: "You have 5 messages remaining today"
  - Track by IP + session fingerprint
- **Reasoning**: Cost-effective, prevents spam, good enough for general inquiries

#### Authenticated Users (Clients) → GPT-4o
- **Use Cases**:
  - Full project management and automation
  - Invoice/contract review and Q&A
  - Milestone planning and suggestions
  - Email drafting to clients
  - Access to project-specific data
- **Model**: GPT-4o ($2.50/1M input, $10/1M output)
- **Rate Limiting**: None (paying clients)
- **Reasoning**:
  - GPT-4o is 4x cheaper than GPT-4-turbo on input, 3x cheaper on output
  - Faster responses (better UX)
  - Latest model with best reasoning capabilities
  - Multimodal support (can analyze PDFs/images)
  - Quality critical for client-facing automation

#### GPT-4o vs GPT-4-turbo Comparison
- **GPT-4o wins in every metric**: Cheaper, faster, more capable, newer
- **No reason to use GPT-4-turbo** - GPT-4o is objectively superior

### 10.3 Budget/Spending Limits
- **Question**: Any budget constraints for AI features?
- **Decision**: ✅ **Set usage limits: $25 soft / $50 hard**
- **Configuration**: Set in OpenAI dashboard
  - **Soft limit**: $25/month (warning notification sent)
  - **Hard limit**: $50/month (stops API usage)
- **Estimated Usage**: ~$5-10/month for moderate Nora AI usage (GPT-4o)
- **Notes**: Monitor usage monthly; adjust limits as needed based on actual patterns

---

## 11. Google Services

### 11.1 Google Analytics
- **Question**: Do you have a GA4 property ID?
- **Decision**: ✅ **Not yet - Create during Phase 1 setup**
- **Action Items**:
  - Create GA4 property for destinlmincy.com
  - Set up basic tracking (pageviews, events, conversions)
  - Track: Portfolio views, contact form submissions, client signups
  - Add Measurement ID to `.env.local`
- **Notes**: GA4 is free and essential for understanding traffic/conversions

### 11.2 Google Ads
- **Question**: Do you have a Google Ads account?
- **Decision**: ✅ **Skip for now - Not needed initially**
- **Reasoning**: 
  - Most freelancers/agencies rely on organic traffic, referrals, networking
  - Can enable later if you want to invest in paid acquisition
  - Focus on portfolio quality and SEO first
- **Notes**: Can revisit post-launch if needed

### 11.3 Google Calendar
- **Question**: Google Workspace or personal Gmail for booking?
- **Decision**: ✅ **Personal Gmail calendar**
- **Integration**: Nora AI will use Google Calendar API to:
  - Check your calendar availability
  - Schedule client appointments automatically
  - Send calendar invites to clients
- **Notes**: Personal Gmail works fine for Calendar API integration

### 11.4 Google Cloud Console
- **Question**: Do you have a Google Cloud project for Calendar API?
- **Decision**: ✅ **Yes - Project exists**
- **Project Details**:
  - **Project Name**: `destinlmincy-com`
  - **API Key**: `AIzaSyCeK9ypbeXW-155q7ywhO07f8bbnS24NUk`
- **Action Items During Phase 1**:
  - Enable Google Calendar API in the project
  - Set up OAuth 2.0 credentials (for calendar access)
  - Configure OAuth consent screen
  - Add credentials to `.env.local`
- **Security Notes**:
  - ⚠️ Store API key in `.env.local` (never commit)
  - ⚠️ Use environment variable: `GOOGLE_CLOUD_API_KEY`
  - ⚠️ OAuth credentials also needed for Calendar write access

---

## 12. Email Service (AWS SES)

### 12.1 Domain Verification
- **Question**: Have you verified your domain with SES?
- **Decision**: ✅ **Not yet - Set up during Phase 1**
- **Action Items**:
  - Verify `destinlmincy.com` domain in AWS SES
  - Add DNS records (TXT/CNAME) for domain verification
  - Verify email addresses: `nora@destinlmincy.com`, `noreply@destinlmincy.com`
- **Notes**: Required before sending any emails from @destinlmincy.com addresses

### 12.2 SMTP Credentials
- **Question**: Do you have SMTP credentials for SES?
- **Decision**: ✅ **Not yet - Generate during Phase 1**
- **Action Items**:
  - Generate SMTP credentials in AWS SES Console
  - Store credentials in `.env.local` (SMTP_USER, SMTP_PASSWORD)
  - Test email sending in development
- **Notes**: SMTP credentials are different from AWS IAM credentials

### 12.3 SES Production Access
- **Question**: Are you in SES sandbox or production mode?
- **Decision**: ✅ **Request production access during Phase 1**
- **Action Items**:
  - Submit production access request to AWS (typically approved in 24-48 hours)
  - Explain use case: Transactional emails for portfolio/client management platform
  - Monitor bounce/complaint rates to maintain good sender reputation
- **Notes**: Start in sandbox for development, move to production before launch

---

## 13. Project Scope Prioritization

### 13.1 MVP Scope Definition
- **Question**: Which phases are must-have for initial launch?
- **Decision**: ✅ **Phases 1-5, 10, 13, 15-17 as MVP** (aligned with PROJECT_PLAN.md)
- **MVP Phases (Core Functionality)**:
  - **Phase 1**: Foundation & Setup (Infrastructure, AWS, DB, Testing) - **CRITICAL**
  - **Phase 2**: Admin Panel & CMS (Content management, portfolio display) - **CRITICAL**
  - **Phase 3**: Authentication & Customer Portal (AWS Cognito, OAuth, dashboard) - **CRITICAL**
  - **Phase 4**: Quotes/Estimates System (Client acquisition, quote generation) - **HIGH**
  - **Phase 5**: Invoices, Contracts & Payments (Polar, DocuSign, revenue) - **CRITICAL**
  - **Phase 10**: AI Features Integration (Nora chat, function calling) - **CRITICAL** (core differentiator)
  - **Phase 13**: Meeting Booking System (Google Calendar, automated scheduling) - **HIGH**
- **Launch Preparation**:
  - **Phase 15**: Polish & Optimization (UX refinement, performance)
  - **Phase 16**: Deployment & Launch (AWS Amplify, production setup)
  - **Phase 17**: Customer Portal Launch (Final testing, go-live)
- **Timeline Estimate**: 8-11 weeks with AI assistance (7 core phases + 3 launch phases)
- **Reasoning**: These phases provide a fully functional client acquisition and project management platform with AI differentiation

### 13.2 Post-MVP Features
- **Question**: Which features can be added after launch?
- **Decision**: ✅ **Phases 6-9, 11-12, 14, 18 as post-launch enhancements**
- **Post-Launch Roadmap** (based on PROJECT_PLAN.md):
  - **Phase 6**: Client Project Repository & Git Integration (CodeCommit, GitHub sync)
  - **Phase 7**: Project Milestones & Deliverables (Milestone tracking, code release gates)
  - **Phase 8**: Project Features (Collaboration, status updates, activity feed)
  - **Phase 9**: Invoice Enhancements & Subscriptions (Recurring invoices, payment plans, automated follow-ups)
  - **Phase 11**: Email Notifications & Communication (AWS SES, notification system)
  - **Phase 12**: Security & Audit (Security hardening, audit logging, penetration testing)
  - **Phase 14**: Additional Features (Testimonials, expense tracking, certificates, referrals)
  - **Phase 18**: Post-Launch (Ongoing improvements, analytics, SEO)
- **Strategy**: Launch MVP to start acquiring clients, then add features based on real client feedback and requests
- **Benefit**: Generate revenue while building post-launch features (can bill clients during Phases 6-14 development)
- **Notes**: Phase 11 (Email) can be partially implemented using basic email in MVP, enhanced post-launch

---

## 14. Timeline Expectations

### 14.1 Timeline Flexibility
- **Question**: Is the 13-14 week timeline flexible?
- **Decision**: ✅ **Fully flexible - No hard deadlines**
- **Context**: PROJECT_PLAN.md estimates 13-14 weeks for full build (assumes full-time dedication)
- **Notes**:
  - Timeline is flexible and adjustable based on progress
  - No hard deadlines or commitments
  - Quality over speed approach
  - AI assistance should accelerate development significantly
- **Realistic Estimate**: 8-12 weeks with AI pair programming assistance

### 14.2 Weekly Time Commitment
- **Question**: How many hours per week can you dedicate?
- **Decision**: ✅ **Variable schedule - A few hours daily**
- **Estimated Hours**: ~10-20 hours per week (varies)
- **Approach**:
  - Consistent daily progress (few hours per day)
  - Flexible based on availability
  - Quality focused sessions over rushed work
- **Impact on Timeline**: Variable hours may extend timeline slightly, but AI assistance compensates

### 14.3 Launch Date Priority
- **Question**: Any specific date you need the portfolio live?
- **Decision**: ✅ **"Launch when ready" approach**
- **Strategy**:
  - No specific target launch date
  - No events/deadlines driving launch
  - Launch when MVP is polished and tested
  - Prioritize quality and completeness over arbitrary dates
- **Notes**: This allows for thorough testing and refinement before going live

---

## 15. Additional Decisions

### 15.1 Portfolio Projects
- **Question**: Do you have 3-5 completed projects ready to showcase?
- **Decision**: ✅ **2 featured real projects + placeholder content for others**
- **Featured Real Projects** (Long-term clients):
  1. **The Olympia Salon** (https://theolympiasalon.com)
     - Client: Tina-Marie
     - Duration: ~10 years ongoing maintenance
     - Services: Full website design, ongoing maintenance and updates
     - Status: Active long-term client
  2. **The Olympia Life Coaching Center**
     - Client: Tina-Marie (same owner as Salon)
     - Duration: Long-term ongoing maintenance
     - Services: Website design and maintenance
     - Status: Active long-term client
- **Additional Projects**: Use 3-4 placeholder/demo projects during development
  - Placeholder examples: AI Chatbot Integration, E-commerce Platform, SaaS Dashboard, etc.
  - Replace with real projects as you complete new work or gather more case studies
- **Portfolio Strategy**: 
  - Prominently feature the two Olympia projects as proof of long-term client relationships
  - Use placeholders to show breadth of capabilities (AI, e-commerce, portals, etc.)
  - Update portfolio section as new projects are completed
- **Content Needed Before Launch**:
  - Screenshots for both Olympia projects
  - Brief project descriptions and outcomes
  - Tech stacks used for each
- **Notes**: Can capture screenshots and write descriptions during Phase 2 (Admin/CMS setup)

### 15.2 Professional Headshot
- **Question**: Do you have a professional photo for About page?
- **Decision**: ✅ **Ready**
- **Asset**: `Destin-L-Mincy__HEADSHOT.png`
- **Usage**: About page, contact section, testimonials, footer
- **Notes**: High-quality professional headshot with gray background

### 15.3 About Page Bio
- **Question**: Do you have your bio/introduction written?
- **Decision**: ✅ **Written and ready**
- **Bio Content**:

**About Destin L. Mincy**

I fell in love with code at 10 years old when I got my hands on Microsoft FrontPage for Windows 3.1. By the time MySpace rolled around in late middle school and early high school, I was the guy everyone came to for custom profiles. Fast forward 17+ years, and I'm a freelance web developer and AI engineer helping small businesses and startups turn big ideas into reality.

I specialize in custom client portals, AI-powered automation, and solutions that blend cutting-edge technology with rock-solid reliability. My secret sauce? Attention to detail, relentless efficiency, and a problem-solving mindset that doesn't believe in brick walls.

**Communication is everything.** My platform automatically notifies you of every code commit, and I personally keep you updated on progress. I need you to be just as communicative about your vision, expectations, and needs. When challenges arise, we solve them together.

I'm driven by advancement—yours and mine. When you succeed, I succeed. That's why I've maintained [The Olympia Salon's](https://theolympiasalon.com) website for nearly a decade. Quality isn't negotiable. If you're not satisfied, neither am I.

I'm always learning new tech (though I'm partial to Node.js and React), but one thing never changes: **I refuse to deliver slop.** Every project gets my best work, every time.

Let's build something great together.

- **Tone**: Professional yet personable, concise, client-focused
- **Key Messages**: 17+ years experience, AI + web development expertise, transparent communication, quality-first approach, long-term partnerships
- **Notes**: Ready for implementation in Phase 2 (Admin/CMS)

### 15.4 Skills/Technologies List
- **Question**: What technologies and frameworks do you work with?
- **Decision**: ✅ **Based on project tech stack**
- **Skills List** (extracted from PROJECT_PLAN.md tech stack):
  - **Frontend Frameworks**: React, Next.js, Refine, TypeScript
  - **UI Libraries**: Ant Design, Tailwind CSS, Framer Motion
  - **Backend**: Node.js, Express, AWS Lambda (Serverless)
  - **Databases**: PostgreSQL, AWS RDS, Prisma ORM
  - **Authentication**: AWS Cognito, OAuth, JWT, MFA
  - **Cloud & DevOps**: AWS (Amplify, S3, CloudFront, API Gateway, AppSync, CodeCommit)
  - **Real-time**: AWS AppSync (GraphQL), WebSocket
  - **Payments**: Polar (Merchant of Record), Stripe Connect
  - **AI & ML**: OpenAI (GPT-3.5-turbo, GPT-4o), LangChain, Function Calling
  - **APIs & Integrations**: DocuSign API, Google Calendar API, n8n (Workflow Automation)
  - **Testing**: Jest, React Testing Library, Playwright (E2E), TDD Methodology
  - **Version Control**: Git, GitHub, AWS CodeCommit
  - **Other Tools**: Docker, CI/CD, RESTful APIs, GraphQL
- **Display Strategy**: Categorize by type (Frontend, Backend, Cloud, AI, etc.) with visual badges/icons
- **Notes**: This represents the full tech stack used in this portfolio project

### 15.5 Logo Design
- **Question**: Do you have a logo designed?
- **Decision**: ✅ **Create text-based logo with color palette**
- **Logo Design Specifications**:
  - **Text**: "Destin L. Mincy" (full name) or "DLM" (monogram)
  - **Font**: Felix Titling (primary brand font)
  - **Colors**: 
    - Primary: Blue (#2776EA)
    - Accent 1: Gold (#FFD700)
    - Accent 2: Silver (#C0C0C0)
  - **Style**: Modern, clean, professional
- **Logo Variations to Create**:
  - **Full Logo**: "Destin L. Mincy" in Felix Titling
  - **Short Logo**: "DLM" monogram for mobile/small spaces
  - **Light Version**: For dark backgrounds
  - **Dark Version**: For light backgrounds
  - **Favicon**: 512x512 icon derived from monogram or full logo
- **Design Notes**:
  - Can experiment with Blue as primary text color with Gold/Silver accent underline or elements
  - Or gradient effect using Blue → Gold
  - Keep it simple and scalable
- **Implementation**: Design and finalize during Phase 2 (Admin/CMS setup)

---

## Decision Summary

**Total Questions**: 60+  
**Answered**: 51 ✅  
**Needs User Input**: 0  
**In Progress**: 0

🎉 **ALL PHASE 1 DECISIONS COMPLETE!**

**Completed Decisions**:
- ✅ E2E Testing → **Playwright**
- ✅ Code Coverage → **Yes, context-aware thresholds**
- ✅ ORM → **Prisma**
- ✅ RDS Instances → **db.t4g.micro (Dev), db.t4g.small (Prod)**
- ✅ Backups → **Nightly, 7-day retention**
- ✅ Multi-AZ → **No initially** (enable when revenue > $500/month)
- ✅ Email Verification → **Yes** (required for email/password)
- ✅ MFA → **Configure Phase 1, optional until launch**
- ✅ OAuth → **Google, LinkedIn, GitHub**
- ✅ S3 Structure → **3 buckets** (client-downloads, portfolio-media, user-uploads)
- ✅ Real-time Service → **AWS AppSync** (GraphQL subscriptions)
- ✅ Push Notifications → **AWS SNS** (for future mobile apps)
- ✅ Lambda Structure → **Monorepo** (shared code, single deployment)
- ✅ Lambda Runtime → **Node.js 20.x** (latest LTS)
- ✅ CodeCommit → **Yes** (FREE, milestone control, GitHub sync for open-source)
- ✅ Colors → **Blue (#2776EA), Gold (#FFD700), Silver (#C0C0C0)**
- ✅ Fonts → **Felix Titling + Montserrat**
- ✅ Domain → **destinlmincy.com** (Namecheap + Route 53)
- ✅ Deployment → **AWS Amplify** (~$15/month, zero DevOps)
- ✅ MVP Scope → **Phases 1-5, 10, 13, 15-17** (aligned with PROJECT_PLAN.md)
- ✅ Timeline → **Flexible, no deadlines, ~10-20 hrs/week, launch when ready**
- ✅ OpenAI Models → **GPT-3.5-turbo (guests) + GPT-4o (authenticated)**
- ✅ OpenAI Budget → **$25 soft / $50 hard monthly limits**
- ✅ About Bio → **Written and ready** (17+ years, MySpace era, quality-first)
- ✅ Headshot → **Ready** (`Destin-L-Mincy__HEADSHOT.png`)
- ✅ Skills List → **Based on project tech stack** (React, Next.js, AWS, AI, etc.)
- ✅ Logo → **Text-based** ("Destin L. Mincy" / "DLM" in Felix Titling + colors)
- ✅ Portfolio → **2 real projects (Olympia Salon & Life Coaching) + placeholders**

**Monthly Cost Estimate** (initial):
- RDS (dev): $12/month
- RDS (prod): $30/month
- S3: ~$2-6/month
- Route 53: $0.50/month
- Amplify: ~$15-30/month
- **Total**: ~$60-80/month

---

## Next Steps - Ready for Phase 1 Implementation! 🚀

**All Pre-Phase 1 Decisions Complete!** ✅

### Immediate Action Items:
1. **Domain Registration**: Register `destinlmincy.com` via Namecheap
2. **AWS SES Setup**: Verify domain, generate SMTP credentials, request production access
3. **Google Analytics**: Create GA4 property for destinlmincy.com
4. **DocuSign**: Generate Integration Key for contract workflows
5. **Environment Variables**: Complete `.env.local` with all credentials from setup tasks

### Ready to Start Phase 1 When:
- Domain registered (can work in parallel with development)
- AWS account ready and credentials obtained
- All environment variables configured
- Development environment set up

### Phase 1 Focus:
- Foundation & Setup (Infrastructure, Auth, DB, Testing)
- AWS ecosystem configuration
- Design system implementation
- Test-driven development (TDD) infrastructure

---

**🎯 You're ready to build!** All critical decisions are locked in. Let's start Phase 1! 🚀
