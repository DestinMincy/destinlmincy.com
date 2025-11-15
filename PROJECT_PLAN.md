# Portfolio Website - Project Plan

## Executive Summary

**Project**: Modern portfolio website with integrated customer portal, invoice management, and AI-powered features  
**Tech Stack**: Refine + Next.js + TypeScript + AWS (RDS, Cognito, S3, Lambda, Amplify) + Stripe + Google Ads  
**Development Methodology**: **Test-Driven Development (TDD)** - Tests written before implementation  
**Timeline**: 11 weeks (portfolio) | 12+ weeks (full launch)  
**Status**: Planning Complete - AWS Ecosystem - Ready for Development

---

## Project Overview

### Purpose
Professional portfolio showcasing Destin L. Mincy's work as a Web Developer and AI Engineer, with integrated customer portal for invoice management and payments.

### Core Goals
- ✅ Full CMS (WordPress-like, custom-built) - **ALL content editable via admin**
- ✅ Admin panel from day one
- ✅ Customer portal with authentication
- ✅ Invoice management & payment processing (Stripe)
- ✅ AI chat assistant (Nora) with smart navigation
- ✅ Future-proof architecture (blog-ready, scalable)
- ✅ **Test-Driven Development (TDD)** - All features developed test-first

### Target Audience
Potential clients, recruiters, tech community, **existing customers** (portal access)

---

## Technology Stack

### Core Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Refine + Next.js | Data-intensive apps + SSR/SEO |
| **Language** | TypeScript | Type safety |
| **UI Framework** | Ant Design | Admin/customer portals |
| **Styling** | Tailwind CSS + Ant Design | Portfolio pages + dashboards |
| **Database** | AWS RDS (PostgreSQL) | Data storage, scalable relational database |
| **Authentication** | AWS Cognito | User authentication, OAuth, MFA |
| **Storage** | AWS S3 | File storage (client uploads, media, documents) |
| **Real-time** | AWS AppSync / API Gateway WebSocket | Real-time notifications, messaging |
| **Serverless** | AWS Lambda | API routes, background jobs, automation |
| **CDN** | AWS CloudFront | Global content delivery, static assets |
| **Payments** | Stripe | Invoice payments |
| **AI** | OpenAI (GPT-3.5 Turbo / GPT-4 Turbo) | Nora chat widget |
| **Contracts** | DocuSign API | Contract management |

### Supporting Libraries
- **Charts**: Recharts (dashboard visualizations)
- **Animations**: Framer Motion (portfolio pages)
- **Icons**: Font Awesome / Heroicons

### Testing Stack (TDD)
- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright (recommended) or Cypress
- **API Testing**: Jest + Supertest (for API routes)
- **Test Coverage**: Coverage tools (Jest coverage, Istanbul)
- **TDD Workflow**: Red → Green → Refactor cycle

### Deployment (AWS Ecosystem)
- **Frontend**: AWS Amplify (Next.js) or ECS/EC2
- **Database**: AWS RDS (PostgreSQL) - managed, scalable
- **Storage**: AWS S3 (file uploads, media)
- **CDN**: AWS CloudFront (global content delivery)
- **API**: AWS Lambda (serverless functions) or API Gateway
- **Real-time**: AWS AppSync (GraphQL subscriptions) or API Gateway WebSocket
- **Environment**: Node.js LTS
- **Benefits**: Full AWS ecosystem, easier scaling, enterprise-ready

---

## Site Structure

### Public Pages
| Page | Route | Key Features |
|------|-------|--------------|
| **Home** | `/` | Hero, services preview, featured projects, skills highlight |
| **Projects** | `/projects` | Filterable grid, categories, search, project details |
| **Skills** | `/skills` | Categorized skills, visual progress bars, tech badges |
| **About** | `/about` | Professional bio, career timeline, headshot |
| **Book a Meeting** | `/book` | Meeting booking page with availability calendar, time slots, operation hours |
| **Contact** | `/contact` | Contact form (AI spam detection), contact info (optional - can be combined with booking) |

### Customer Portal Pages
| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/dashboard` | Balance summary, invoices/contracts overview, payment history, quick actions, notifications |
| **Invoices** | `/invoices` | Invoice list, filters, payment status, PDF download, recurring invoices |
| **Invoice Detail** | `/invoices/:id` | Full invoice, payment form (Stripe), payment history, partial payments, payment plans |
| **Contracts** | `/contracts` | Contract list, signing status, DocuSign integration, request new contract |
| **Contract Detail** | `/contracts/:id` | Contract view, embedded signing, download |
| **Request Contract** | `/contracts/request` | New contract request form (or via Nora chat) |
| **Projects** | `/projects` | View assigned projects, upload files (logos, assets), project files library |
| **Project Detail** | `/projects/:id` | Project details, file upload interface, file library, project messages |
| **Payments** | `/payments` | Payment history, receipts, filters, payment plans |
| **Messages** | `/messages` | In-app messaging with admin, message threads, file attachments |
| **Notifications** | `/notifications` | Notification center, mark as read/unread, preferences |
| **Profile** | `/profile` | Account info, billing address, password change, 2FA setup, email preferences |
| **Payment Methods** | `/payment-methods` | Saved cards, add/remove methods, set default |

### Admin Pages
| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/admin` | Revenue analytics, invoice/customer stats, project metrics, quick actions, notifications |
| **Projects** | `/admin/projects` | CRUD operations, image upload, featured toggle |
| **Content Management** | `/admin/content` | Edit ALL pages (Home, About, Skills, Contact, Projects) |
| **Blog** | `/admin/blog` | Blog CRUD (architecture ready, can be hidden) |
| **Invoices** | `/admin/invoices` | Create/edit invoices, send to customers, payment tracking, recurring invoices, invoice numbering |
| **Contracts** | `/admin/contracts` | Create contracts, send via DocuSign, track status, review client-requested contracts, approve/reject |
| **Customers** | `/admin/customers` | Customer management, view invoices/contracts, messaging |
| **Messages** | `/admin/messages` | Customer messaging, message threads, file attachments |
| **Email Templates** | `/admin/email-templates` | Manage email templates, preview, test |
| **Activity Logs** | `/admin/activity-logs` | Audit trail, user actions, search/filter, export |
| **Settings** | `/admin/settings` | Site config, payment keys, DocuSign settings, theme, tax rates, invoice numbering, email settings, security |
| **Bookings** | `/admin/bookings` | View all bookings, manage status, operation hours, blocked times |
| **Reports** | `/admin/reports` | Financial reports, exports (CSV, PDF, Excel), scheduled reports |

---

## Key Features

### 1. Content Management System (CMS)
- **ALL content editable** via admin panel (no code changes)
- WYSIWYG editor for rich content
- Image/media management
- Page status (published/draft)
- Blog architecture ready (can be hidden until needed)

### 2. Nora AI Chat Widget ⭐
- **Persistent chat bubble** (bottom-right, all pages)
- **Hybrid AI Models**:
  - Guest users: GPT-3.5 Turbo (cost-effective Q&A)
  - Authenticated users: GPT-4 Turbo (function calling, data access)
- **Smart Navigation**: Navigate users to pages/sections and highlight content
- **Chat History**: Session-based (guests) | Persistent DB (authenticated)
- **Account Access** (authenticated only): Query invoices, payments, contracts
- **Meeting Booking**: When users request a meeting, Nora triggers n8n automation workflow
- **Personality**: Warm, professional, intelligent, patient, proactive

### 3. Customer Portal
- **Authentication Options**:
  - Email/password login
  - OAuth providers: Google, Facebook, LinkedIn (GitHub optional)
  - AWS Cognito via Refine (custom data provider)
- Dashboard with widgets (balance, invoices, contracts, payments)
- Invoice management & payment processing
- Contract viewing & signing (DocuSign)
- **Client-Initiated Contract Requests** ⭐:
  - Request new contract via form or Nora chat
  - Two-way signing workflow (client signs first, then admin)
  - Admin approval/rejection system
  - Notifications for both parties
  - Fully signed contract delivery
- **Project File Uploads** ⭐:
  - Upload files (logos, assets) to assigned projects
  - File library per project
  - File management (view, download, delete)
  - File organization and categorization
- Payment method management
- Account settings

### 3.5. AI Contract Generation ⭐
- **n8n AI Agent**: Automated contract generation based on client and project information
- **Input Data**: Client information, project details, scope, pricing, terms
- **Output**: Fully formatted, ready-to-sign contract document
- **Integration**: Seamless DocuSign workflow (generated contract → DocuSign → signing)
- **Client-Initiated Requests**:
  - Clients can request new contracts via form or Nora chat
  - Two-way signing: Client signs first → Admin reviews & signs → Both notified
  - Admin approval workflow (approve/reject contract requests)
  - Automatic project creation upon contract approval
- **Features**:
  - Pulls client data from customer profiles
  - Incorporates project scope and requirements
  - Generates professional contract with all necessary clauses
  - Saves contract to database
  - Ready for immediate DocuSign sending
- *See Phase 5 for detailed implementation*

### 4. Payment Processing
- Stripe integration (architected from start)
- Payment Intents API
- Stripe Elements (secure forms)
- **Stripe Link** (one-click checkout - faster payment experience)
- Webhook handling
- Receipt generation
- PCI-compliant

### 5. Meeting Booking System
- **Booking Page** (`/book`): Calendar view, time slot selection, real-time availability, booking form
- **Availability Management**: Operation hours, blocked times, timezone support, double booking prevention
- **Integration**: Unified API (UI + Nora), Google Calendar sync, n8n automation
- **Admin Management**: View bookings, manage hours, block times, status management
- **Enhancements**: Video call links, preparation notes, group bookings, templates
- *See Phase 11 for detailed implementation*

### 6. Design & UX
- **Color Scheme**: Blue, Gold, Silver
- **Design Inspiration**: 
  - Portfolio: [ZYAN Template](https://codeefly.net/wp/zyan) + [Drake Template](https://preview.themeforest.net/item/drake-personal-portfolio-html/full_screen_preview/43789350)
  - Dashboards: [Refine MUI Admin](https://example.mui.admin.refine.dev) + [Refine HR](https://hr.refine.dev/login)
- Smooth animations (Framer Motion)
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)

### 7. Marketing & Analytics
- **Google Analytics**: Track website traffic and user behavior
- **Google Ads Integration**:
  - Conversion tracking (booking confirmations, contact form submissions)
  - Remarketing tags for retargeting campaigns
  - Google Tag Manager integration (optional - for easier tag management)
  - Conversion events:
    - Meeting booking completed
    - Contact form submitted
    - Invoice payment completed
    - Customer portal sign-up

### 8. Email Notifications System ⭐
- **Automated Notifications**: Invoice reminders, payment confirmations, contract reminders, welcome emails
- **Template Management**: Admin-managed templates, variables, preview/test
- **Email Preferences**: Customer opt-in/opt-out, frequency settings
- **Queue & Logs**: Delivery tracking, retry logic, audit trail
- *Note: Email primarily handled via n8n workflows (see .env.example for fallback SMTP config)*
- *See Phase 9 for detailed implementation*

### 9. Invoice Management Enhancements
- **Invoice Numbering**: Customizable format (INV-YYYY-###), sequential numbering, reset options
- **Recurring Invoices**: Templates, automatic generation, pause/resume
- **Payment Plans**: Installments, partial payments, balance tracking
- **Tax & Currency**: Multi-rate tax calculation, multi-currency support, exchange rates
- **Invoice Templates**: Multiple templates, custom branding, preview
- *See Phase 5 & 7 for detailed implementation*

### 10. Security & Compliance
- **2FA**: TOTP-based (Google Authenticator, Authy), SMS optional, backup codes, admin enforcement
- **Activity Logs**: Complete audit trail, search/filter, export
- **Rate Limiting**: API limits, login attempt limiting, IP whitelisting, account lockout
- **GDPR**: Privacy policy, data export/deletion, cookie consent, privacy settings
- *See Phase 10 for detailed implementation*

### 11. Customer Communication
- **In-App Messaging**: Admin-customer messaging, threads per invoice/contract, file attachments, read receipts
- **Notifications Center**: Real-time notifications, categories, preferences, email digest
- *See Phase 9 for detailed implementation*

### 12. Additional Features
- **Discount Codes**: Percentage/fixed discounts, expiration, usage limits, minimum amounts
- **Credit Notes & Refunds**: Credit notes, Stripe refunds, partial refunds
- **Export & Reporting**: CSV/PDF/Excel exports, scheduled reports, financial reports
- **Bulk Operations**: Bulk invoice/payment/customer operations
- **Global Search**: Cross-content search, autocomplete, filters, keyboard shortcut (Cmd/Ctrl + K)
- **Dark Mode**: System preference detection, manual toggle, persistent selection
- **Meeting Enhancements**: Video call links, preparation notes, group bookings, templates
- *See Phase 12 for detailed implementation*

---

## Database Schema

### Authentication & Users
- `users` - Authentication (AWS Cognito User Pool - stored in Cognito, synced to RDS)
- `customers` - Customer profiles (linked to users)

### Content Management
- `projects` - Portfolio projects (admin-managed, can be assigned to customers)
  - Fields: id, customer_id (optional - for client-assigned projects), title, description, status, featured, images, created_at, updated_at
- `pages` - Website content (ALL pages editable)
- `media` - Uploaded images/files (admin-managed)
- `settings` - Site configuration
- `blog_posts` - Blog articles (architecture ready)
- `blog_categories` - Blog categories
- `blog_tags` - Blog tags
- `blog_post_categories` - Post-category relationships
- `blog_post_tags` - Post-tag relationships

### Invoice & Payment System
- `invoices` - Invoice records
  - Fields: id, customer_id, invoice_number (custom format), currency, tax_rate_id, recurring_invoice_id, payment_plan_id, status, due_date, total_amount, created_at, updated_at
- `invoice_items` - Invoice line items
  - Fields: id, invoice_id, description, quantity, unit_price, total, created_at
- `payments` - Payment transactions
  - Fields: id, invoice_id, customer_id, amount, payment_method_id, partial_payment (flag), payment_plan_installment_id, stripe_payment_intent_id, status, created_at, updated_at
- `recurring_invoices` - Recurring invoice templates
  - Fields: id, customer_id, template_invoice_id, frequency (daily/weekly/monthly/yearly), start_date, end_date, next_generation_date, is_active, created_at, updated_at
- `payment_plans` - Payment plan configurations
  - Fields: id, invoice_id, customer_id, total_amount, number_of_installments, frequency, start_date, status, created_at, updated_at
- `payment_plan_installments` - Payment plan schedule
  - Fields: id, payment_plan_id, installment_number, due_date, amount, status (pending/paid/overdue), payment_id, created_at, updated_at
- `tax_rates` - Tax rate configurations
  - Fields: id, name, rate (percentage), type (federal/state/local), is_active, created_at, updated_at
- `discount_codes` - Discount code management
  - Fields: id, code, type (percentage/fixed), value, min_amount, max_uses, used_count, expires_at, is_active, created_at, updated_at
- `discount_code_usage` - Discount code tracking
  - Fields: id, discount_code_id, invoice_id, customer_id, used_at
- `credit_notes` - Credit note records
  - Fields: id, invoice_id, customer_id, amount, reason, status, applied_to_invoice_id, created_at, updated_at
- `refunds` - Refund transactions
  - Fields: id, payment_id, invoice_id, amount, reason, status, stripe_refund_id, created_at, updated_at

### Contracts
- `contracts` - Customer contracts (DocuSign integration)
  - Fields: id, customer_id, invoice_id (optional), project_id (optional), contract_type, docusign_envelope_id, contract_content (text/JSON), generated_by_ai (boolean), ai_generation_data (JSON - stores input data used for generation), requested_by_client (boolean), client_signed_at, admin_signed_at, admin_approved_at, admin_rejected_at, rejection_reason, status (draft/pending_client_signature/pending_admin_approval/pending_admin_signature/completed/rejected), signed_at, created_at, updated_at
- `contract_requests` - Client-initiated contract requests
  - Fields: id, customer_id, project_id (optional), request_data (JSON - form data or Nora conversation), contract_id (after generation), status (pending/approved/rejected/contract_generated), created_at, updated_at

### Projects & File Management
- `projects` - Portfolio projects (admin-managed) - Enhanced for client access
  - Fields: id, customer_id (optional - for client-assigned projects), title, description, status, featured, images, created_at, updated_at
- `project_files` - Files uploaded by clients for projects
  - Fields: id, project_id, customer_id, file_name, file_path, file_type, file_size, category (logo/assets/documentation/etc.), description, uploaded_by, created_at, updated_at

### Booking System
- `bookings` - Meeting bookings
  - Fields: id, name, email, phone, company, purpose, meeting_date, meeting_time, duration, status (pending/confirmed/cancelled), timezone, notes, video_call_link, preparation_notes, source (ui/nora), created_at, updated_at
- `booking_availability` - Operation hours and availability settings
  - Fields: id, day_of_week (0-6), start_time, end_time, is_available, timezone, created_at, updated_at
- `booking_blocks` - Blocked time slots (holidays, personal time, etc.)
  - Fields: id, block_date, start_time, end_time, reason, is_recurring, created_at, updated_at

### Communication & Notifications
- `messages` - Customer-admin messaging
  - Fields: id, thread_id, sender_id, recipient_id, message, attachments (JSON), is_read, created_at, updated_at
- `message_threads` - Message organization
  - Fields: id, customer_id, admin_id, subject, entity_type (invoice/contract/general), entity_id, last_message_at, created_at, updated_at
- `notifications` - In-app notifications
  - Fields: id, user_id, type, title, message, link, is_read, created_at
- `email_templates` - Email template management
  - Fields: id, name, subject, body, variables (JSON), type (invoice_reminder/payment_confirmation/etc.), is_active, created_at, updated_at
- `email_logs` - Email delivery tracking
  - Fields: id, template_id, recipient_email, subject, status (sent/failed), sent_at, error_message, created_at

### Security & Audit
- `activity_logs` - Audit trail
  - Fields: id, user_id, action_type, entity_type, entity_id, details (JSON), ip_address, user_agent, created_at

### AI Features
- `chat_messages` - Nora chat history (authenticated users)
  - Fields: id, user_id (Cognito user ID), message, role (user/assistant), created_at

### User Preferences
- `saved_filters` - User filter presets
  - Fields: id, user_id, name, entity_type, filters (JSON), created_at, updated_at

---

## Development Methodology: Test-Driven Development (TDD)

### TDD Principles
**⚠️ CRITICAL: All development follows TDD methodology**

1. **Red Phase**: Write failing test first
2. **Green Phase**: Write minimal code to pass test
3. **Refactor Phase**: Improve code while keeping tests green

### TDD Workflow for Each Feature
1. Write test (should fail initially)
2. Run test (confirm it fails for the right reason)
3. Write minimal implementation to pass test
4. Run test (should pass)
5. Refactor code (tests should still pass)
6. Repeat for next feature

### Testing Strategy
- **Unit Tests**: Individual functions/components
- **Integration Tests**: Component interactions, API integrations
- **E2E Tests**: Critical user flows (authentication, payments, invoice creation)
- **Test Coverage**: Aim for 80%+ coverage on business logic
- **Continuous Testing**: Run tests on every commit (CI/CD)

### What Gets Tested
- ✅ All API endpoints
- ✅ Authentication flows (email/password, OAuth, 2FA)
- ✅ Payment processing (Stripe integration)
- ✅ Invoice creation and management (including recurring, payment plans, partial payments)
- ✅ Contract management (DocuSign)
- ✅ AI contract generation (n8n AI Agent)
- ✅ Client-initiated contract requests (form + Nora)
- ✅ Two-way contract signing workflow
- ✅ Client file uploads for projects
- ✅ Nora AI chat widget functionality
- ✅ Navigation and highlighting features
- ✅ Admin panel CRUD operations
- ✅ Customer portal features
- ✅ Email notifications system
- ✅ In-app messaging
- ✅ Activity logs and audit trail
- ✅ Tax calculation and multi-currency
- ✅ Discount codes and credit notes
- ✅ Export and reporting
- ✅ Form validations
- ✅ Error handling
- ✅ Security features (rate limiting, 2FA, GDPR)

### Testing Tools Setup
- Jest configuration for Next.js
- React Testing Library for component testing
- Playwright for E2E testing
- Mock Service Worker (MSW) for API mocking
- Test database setup (AWS RDS test instance or local PostgreSQL)

---

## Development Phases

### Phase 1: Foundation & Setup (Week 1)
**Goal**: Establish development foundation with TDD infrastructure and AWS ecosystem setup

**Prerequisites**: 
- All accounts set up (AWS, Stripe, OpenAI, etc.)
- AWS account with appropriate permissions
- Environment variables configured (see `.env.example`)
- Development environment ready

**Tasks**:
- [ ] Project initialization (Refine + Next.js + TypeScript)
- [ ] **Testing infrastructure setup (TDD foundation)**:
  - [ ] Jest + React Testing Library configuration
  - [ ] Playwright setup for E2E testing
  - [ ] Test utilities and helpers
  - [ ] Mock Service Worker (MSW) setup
  - [ ] Test database configuration (AWS RDS test instance or local PostgreSQL)
  - [ ] CI/CD pipeline with test automation (AWS CodePipeline or GitHub Actions)
- [ ] **AWS Infrastructure Setup**:
  - [ ] AWS RDS PostgreSQL instance (development)
  - [ ] AWS Cognito User Pool setup:
    - [ ] Create User Pool
    - [ ] Configure OAuth providers (Google, Facebook, LinkedIn, GitHub):
      - [ ] Google: Set up OAuth 2.0 credentials in Google Cloud Console
      - [ ] Facebook: Create Facebook App and get App ID/Secret
      - [ ] LinkedIn: Create LinkedIn App and get Client ID/Secret
      - [ ] GitHub: Create GitHub OAuth App and get Client ID/Secret
      - [ ] Add each provider in Cognito Console > User Pool > Sign-in experience > Federated identity provider sign-in
      - [ ] Configure OAuth scopes and attributes for each provider
    - [ ] Set up Cognito Hosted UI (optional, for OAuth redirects)
    - [ ] Configure OAuth callback URLs
  - [ ] AWS S3 buckets (media, client-uploads)
  - [ ] AWS CloudFront distribution (for production)
  - [ ] AWS Lambda functions structure
  - [ ] AWS AppSync API (for real-time) or API Gateway WebSocket
- [ ] Database schema setup (core tables only)
- [ ] **Custom Refine Providers**:
  - [ ] Custom AWS data provider (RDS PostgreSQL)
  - [ ] Custom AWS Cognito auth provider
- [ ] Design system (Blue, Gold, Silver) - Tailwind + Ant Design
- [ ] Stripe account setup (test mode)
- [ ] Environment configuration validation

**Deliverable**: Working development environment with TDD infrastructure, AWS ecosystem configured, and design system

### Phase 2: Admin Panel & CMS (Weeks 2-3)
**Goal**: Build admin panel with full CMS capabilities

**Prerequisites**: Phase 1 complete (Foundation ready)

**Tasks**:
- [ ] **TDD: Write tests first for each feature below**
- [ ] Admin authentication & dashboard:
  - [ ] Write tests → Implement → Refactor
  - [ ] Admin login/logout
  - [ ] Admin dashboard with basic stats
- [ ] Admin Projects CRUD:
  - [ ] Write tests → Implement → Refactor
  - [ ] Create, read, update, delete projects
  - [ ] Image upload functionality
  - [ ] Featured project toggle
- [ ] Admin Content Management (ALL pages editable):
  - [ ] Write tests → Implement → Refactor
  - [ ] WYSIWYG editor integration
  - [ ] Page content CRUD (Home, About, Skills, Contact)
  - [ ] Page status (published/draft)
- [ ] Admin Blog structure (hidden until ready):
  - [ ] Write tests → Implement → Refactor
  - [ ] Database schema (blog tables)
  - [ ] Basic CRUD (can be hidden via feature flag)
- [ ] Admin Settings page:
  - [ ] Write tests → Implement → Refactor
  - [ ] Site configuration management
  - [ ] Feature flags
- [ ] Public portfolio pages (read from DB):
  - [ ] Write tests → Implement → Refactor
  - [ ] Home, Projects, Skills, About pages
  - [ ] Dynamic content loading
- [ ] Run full test suite and ensure all tests pass

**Deliverable**: Fully functional admin panel with CMS, public portfolio pages displaying dynamic content

### Phase 3: Content Creation (Week 4)
**Prerequisites**: Phase 2 complete (Admin Panel & CMS functional)
- [ ] Gather project information
- [ ] Build projects via admin panel
- [ ] Edit all page content via admin
- [ ] Add professional headshot (`img/Destin-L-Mincy__HEADSHOT.png`)
- [ ] Test full CMS workflow
- [ ] **Deliverable**: Portfolio content ready for public viewing

### Phase 4: Authentication & Customer Portal (Week 5)
**Goal**: Implement authentication system and customer portal foundation

**Prerequisites**: Phase 1 complete (AWS Cognito configured), Phase 2 complete (Admin panel ready)

**Tasks**:
- [ ] **TDD: Write tests first for authentication flows**
- [ ] Customer authentication setup (AWS Cognito):
  - [ ] Write tests for email/password auth → Implement → Refactor
  - [ ] AWS Cognito User Pool configuration
  - [ ] Custom Refine Cognito auth provider implementation
  - [ ] OAuth provider configuration (AWS Cognito Identity Pools):
    - [ ] Write tests for Google OAuth → Implement → Refactor
    - [ ] Write tests for Facebook OAuth → Implement → Refactor
    - [ ] Write tests for LinkedIn OAuth → Implement → Refactor
    - [ ] Write tests for GitHub OAuth (optional) → Implement → Refactor
  - [ ] OAuth provider UI buttons/components (test UI interactions)
  - [ ] Account linking (OAuth + email/password) - write tests first
  - [ ] User sync from Cognito to RDS (customers table)
- [ ] Customer Dashboard (widgets: balance, invoices, contracts, payments):
  - [ ] Write tests for each widget → Implement → Refactor
  - [ ] Dashboard layout and navigation
  - [ ] Widget data fetching (will be populated in Phase 5)
- [ ] Admin Dashboard (comprehensive analytics):
  - [ ] Write tests for analytics → Implement → Refactor
  - [ ] Analytics widgets (revenue, customers, invoices)
  - [ ] Charts integration (Recharts)
- [ ] Protected routes & role-based access:
  - [ ] Write tests for route protection → Implement → Refactor
  - [ ] Middleware for route protection
  - [ ] Role-based access control (admin/customer/guest)
- [ ] User role management:
  - [ ] Write tests for role management → Implement → Refactor
  - [ ] Role assignment (admin panel)
- [ ] E2E tests for authentication flows

**Deliverable**: Working authentication system (email/password + OAuth), protected routes, customer/admin dashboards (structure ready for data)

### Phase 5: Invoice & Contract Management (Week 6)
**Goal**: Build core invoice and contract management system

**Prerequisites**: Phase 4 complete (Authentication & customer portal ready)

**Tasks**:
- [ ] **TDD: Write tests first for all invoice/contract features**
- [ ] Database schema setup:
  - [ ] Write tests for schema → Implement → Refactor
  - [ ] invoices, invoice_items, contracts tables
  - [ ] Add invoice_number, currency fields
- [ ] Invoice CRUD (admin & customer views):
  - [ ] Write tests for invoice creation → Implement → Refactor
  - [ ] Write tests for invoice updates → Implement → Refactor
  - [ ] Write tests for invoice deletion → Implement → Refactor
  - [ ] Write tests for invoice viewing (admin & customer) → Implement → Refactor
- [ ] **Invoice Numbering System**:
  - [ ] Write tests for invoice numbering → Implement → Refactor
  - [ ] Customizable format configuration (admin settings)
  - [ ] Sequential numbering logic
  - [ ] Number format templates
- [ ] Invoice PDF generation:
  - [ ] Write tests for PDF generation → Implement → Refactor
  - [ ] PDF template system
  - [ ] Download functionality
- [ ] **Invoice Templates**:
  - [ ] Write tests for template management → Implement → Refactor
  - [ ] Multiple template support
  - [ ] Custom branding (logo, colors)
  - [ ] Template preview
- [ ] **AI Contract Generation (n8n Agent)**:
  - [ ] Write tests for contract generation API → Implement → Refactor
  - [ ] n8n AI Agent workflow setup:
    - [ ] Create n8n AI Agent workflow for contract generation
    - [ ] Set up `N8N_WEBHOOK_CONTRACT_GENERATION` webhook
    - [ ] Configure AI Agent with contract templates and legal clauses
    - [ ] Input data structure (client info, project details, scope, pricing, terms)
    - [ ] Output formatting (PDF-ready contract document)
  - [ ] Contract generation API endpoint:
    - [ ] Write tests for API endpoint → Implement → Refactor
    - [ ] Accept client_id, project_id (or project details), contract type
    - [ ] Fetch client information from database
    - [ ] Fetch project information (if exists) or use provided details
    - [ ] Send data to n8n AI Agent webhook
    - [ ] Receive generated contract
    - [ ] Save contract to database (contracts table)
    - [ ] Return contract document for review
  - [ ] Admin UI for contract generation:
    - [ ] Write tests for contract generation UI → Implement → Refactor
    - [ ] Contract generation form (select client, project, contract type)
    - [ ] Preview generated contract before sending
    - [ ] Edit contract if needed (manual override)
    - [ ] Save and send to DocuSign
- [ ] **Client-Initiated Contract Requests**:
  - [ ] Write tests for contract request system → Implement → Refactor
  - [ ] Database schema setup:
    - [ ] Write tests for schema → Implement → Refactor
    - [ ] contract_requests table
    - [ ] Update contracts table (add client request fields, two-way signing fields)
  - [ ] Contract request form (customer portal):
    - [ ] Write tests for request form → Implement → Refactor
    - [ ] Form fields (project details, scope, pricing, terms, timeline)
    - [ ] Validation and submission
    - [ ] Save request to database
  - [ ] Contract request via Nora (Phase 8 integration):
    - [ ] Write tests for Nora contract request function → Implement → Refactor
    - [ ] Add `request_contract` function to Nora (Phase 8)
    - [ ] Nora collects project details via conversation
    - [ ] Submit request to same API endpoint as form
  - [ ] Contract generation from request:
    - [ ] Write tests for auto-generation → Implement → Refactor
    - [ ] Auto-generate contract when request submitted (via n8n AI Agent)
    - [ ] Link contract to request
  - [ ] Two-way signing workflow:
    - [ ] Write tests for signing workflow → Implement → Refactor
    - [ ] Client signs first (DocuSign embedded signing)
    - [ ] Admin receives notification for review
    - [ ] Admin approval/rejection UI
    - [ ] If approved: Admin signs contract
    - [ ] If rejected: Client notified with reason
    - [ ] Both parties notified when fully signed
    - [ ] Fully signed contract delivered to both parties
  - [ ] Admin contract review UI:
    - [ ] Write tests for review UI → Implement → Refactor
    - [ ] View pending contract requests
    - [ ] Review generated contract
    - [ ] Approve/reject with comments
    - [ ] Sign approved contracts
- [ ] **Client File Uploads for Projects**:
  - [ ] Write tests for file upload system → Implement → Refactor
  - [ ] Database schema setup:
    - [ ] Write tests for schema → Implement → Refactor
    - [ ] project_files table
    - [ ] Update projects table (add customer_id for client-assigned projects)
  - [ ] File upload API endpoint:
    - [ ] Write tests for upload endpoint → Implement → Refactor
    - [ ] Accept file uploads (AWS S3)
    - [ ] Validate file types and sizes
    - [ ] Store file metadata in database
    - [ ] Link files to projects and customers
  - [ ] Customer portal file upload UI:
    - [ ] Write tests for upload UI → Implement → Refactor
    - [ ] File upload interface on project detail page
    - [ ] Drag-and-drop or file picker
    - [ ] File category selection (logo, assets, documentation, etc.)
    - [ ] File description/notes
    - [ ] Upload progress indicator
  - [ ] Project file library (customer portal):
    - [ ] Write tests for file library → Implement → Refactor
    - [ ] Display all files for a project
    - [ ] File filtering by category
    - [ ] File preview/download
    - [ ] File deletion (with permissions)
  - [ ] Admin file management:
    - [ ] Write tests for admin file management → Implement → Refactor
    - [ ] View all client-uploaded files
    - [ ] Download files
    - [ ] Organize files by project
- [ ] DocuSign integration:
  - [ ] Write tests for contract creation → Implement → Refactor
  - [ ] Write tests for contract sending → Implement → Refactor
  - [ ] Write tests for embedded signing → Implement → Refactor
  - [ ] Write tests for webhook handlers → Implement → Refactor
  - [ ] DocuSign OAuth setup
  - [ ] Contract status tracking
  - [ ] Integration with AI-generated contracts (seamless flow)
- [ ] Payment Methods page:
  - [ ] Write tests for payment method CRUD → Implement → Refactor
  - [ ] Stripe payment methods integration
  - [ ] Add/remove/set default methods
- [ ] Account Settings page:
  - [ ] Write tests for settings updates → Implement → Refactor
  - [ ] Profile management
  - [ ] Billing address
  - [ ] Password change
- [ ] Integration tests for invoice → contract → payment flow

**Deliverable**: Complete invoice and contract management system with AI contract generation, client-initiated contract requests, two-way signing workflow, and client file uploads for projects

### Phase 6: Payment Integration (Week 7)
**Goal**: Integrate Stripe payment processing with full security

**Prerequisites**: Phase 5 complete (Invoices ready for payment)

**Tasks**:
- [ ] **TDD: Write tests first for all payment features (CRITICAL for financial transactions)**
- [ ] Stripe Elements integration:
  - [ ] Write tests for payment form → Implement → Refactor
  - [ ] Secure payment form UI
  - [ ] Card validation
- [ ] **Stripe Link setup** (one-click checkout):
  - [ ] Write tests for Link integration → Implement → Refactor
  - [ ] Enable Stripe Link in Stripe dashboard
  - [ ] Configure Link in Stripe Elements
  - [ ] E2E tests for Link checkout flow
- [ ] Payment Intent creation:
  - [ ] Write tests for payment intent creation → Implement → Refactor
  - [ ] API route for payment intent
  - [ ] Amount validation
- [ ] Payment flow (invoice → payment → confirmation):
  - [ ] Write tests for complete payment flow → Implement → Refactor
  - [ ] Payment processing logic
  - [ ] Success/failure handling
  - [ ] E2E tests for payment process
- [ ] Stripe webhook handlers:
  - [ ] Write tests for webhook processing → Implement → Refactor
  - [ ] Webhook signature verification
  - [ ] Payment status webhooks
  - [ ] Error handling
- [ ] Payment status updates:
  - [ ] Write tests for status updates → Implement → Refactor
  - [ ] Database updates on payment
  - [ ] Invoice status sync
- [ ] Receipt generation:
  - [ ] Write tests for receipt generation → Implement → Refactor
  - [ ] Receipt PDF template
  - [ ] Email receipt (via n8n or email system)
- [ ] Security audit (including test coverage review)
  - [ ] PCI compliance verification
  - [ ] Webhook security review
  - [ ] Payment flow security testing

**Deliverable**: Fully functional payment system with Stripe integration, webhooks, and receipts

### Phase 7: Invoice Enhancements (Week 7.5)
**Goal**: Add advanced invoice features (recurring, payment plans, tax, discounts, credits)

**Prerequisites**: Phase 5 & 6 complete (Basic invoices and payments working)

**Tasks**:
- [ ] **TDD: Write tests first for invoice enhancements**
- [ ] Database schema setup:
  - [ ] Write tests for schema → Implement → Refactor
  - [ ] recurring_invoices, payment_plans, payment_plan_installments tables
  - [ ] tax_rates, discount_codes, discount_code_usage tables
  - [ ] credit_notes, refunds tables
- [ ] **Recurring Invoices**:
  - [ ] Write tests for recurring invoice creation → Implement → Refactor
  - [ ] Write tests for automatic generation → Implement → Refactor
  - [ ] Database schema (recurring_invoices table)
  - [ ] Cron job/scheduled task for generation
  - [ ] Pause/resume functionality
- [ ] **Partial Payments & Payment Plans**:
  - [ ] Write tests for payment plans → Implement → Refactor
  - [ ] Database schema (payment_plans, payment_plan_installments tables)
  - [ ] Payment plan creation UI
  - [ ] Partial payment tracking
  - [ ] Remaining balance calculation
- [ ] **Tax Calculation & Multi-Currency**:
  - [ ] Write tests for tax calculation → Implement → Refactor
  - [ ] Database schema (tax_rates table)
  - [ ] Tax rate configuration (admin)
  - [ ] Multi-currency support
  - [ ] Currency conversion API integration
  - [ ] Exchange rate management
- [ ] **Discount Codes**:
  - [ ] Write tests for discount codes → Implement → Refactor
  - [ ] Database schema (discount_codes, discount_code_usage tables)
  - [ ] Discount code creation/management
  - [ ] Apply discount to invoices
  - [ ] Usage tracking
- [ ] **Credit Notes & Refunds**:
  - [ ] Write tests for credit notes → Implement → Refactor
  - [ ] Write tests for refunds → Implement → Refactor
  - [ ] Database schema (credit_notes, refunds tables)
  - [ ] Credit note creation
  - [ ] Stripe refund integration
  - [ ] Apply credit to invoices

**Deliverable**: Enhanced invoice system with recurring invoices, payment plans, tax, discounts, and credits

### Phase 8: AI Features Integration (Week 8)
**Goal**: Implement Nora AI chat widget with smart navigation and function calling

**Prerequisites**: Phase 4 complete (Authentication working for guest/authenticated distinction)

**Tasks**:
- [ ] **TDD: Write tests first for AI features**
- [ ] **Nora Architecture Decision**: Direct OpenAI connection (recommended) ✅
  - [ ] Confirm architecture choice (see "Nora AI Architecture Decision" below)
- [ ] OpenAI API setup (hybrid: GPT-3.5/GPT-4):
  - [ ] Write tests for API integration → Implement → Refactor
  - [ ] Write tests for model routing (guest vs authenticated) → Implement → Refactor
- [ ] Nora Chat Widget:
  - [ ] Write tests for chat bubble UI → Implement → Refactor
  - [ ] Write tests for streaming responses → Implement → Refactor
  - [ ] **Smart Navigation & Highlighting**:
    - [ ] Write tests for navigation functions → Implement → Refactor
    - [ ] Write tests for highlighting effects → Implement → Refactor
    - [ ] Site structure mapping (test data structure)
    - [ ] Navigation functions (`navigate_to_page`, `highlight_section`)
    - [ ] Scroll-to-element with animations
    - [ ] Visual highlight effects
  - [ ] Authentication-aware chat history:
    - [ ] Write tests for session-based history → Implement → Refactor
    - [ ] Write tests for persistent history → Implement → Refactor
  - [ ] Function calling for customer data (authenticated users):
    - [ ] Write tests for function calling → Implement → Refactor
  - Meeting booking functionality:
    - [ ] Write tests for meeting booking detection → Implement → Refactor
    - [ ] Write tests for `book_meeting` function → Implement → Refactor
    - [ ] n8n workflow setup for meeting booking automation:
      - [ ] Create n8n workflow for meeting booking
      - [ ] Set up `N8N_WEBHOOK_BOOKING` webhook
      - [ ] Integrate with calendar service (Calendly, Google Calendar, etc.)
      - [ ] Email confirmation setup (via Gmail connection)
      - [ ] Test workflow end-to-end
  - Contract request functionality (for authenticated customers):
    - [ ] Write tests for contract request detection → Implement → Refactor
    - [ ] Write tests for `request_contract` function → Implement → Refactor
    - [ ] Function definition for contract requests:
      - [ ] Collect project details via conversation
      - [ ] Gather scope, pricing, timeline, requirements
      - [ ] Submit request to contract request API
      - [ ] Confirm request submission to user
- [ ] Contact form AI spam detection:
  - [ ] Write tests for spam detection → Implement → Refactor
  - [ ] **Optional: Use n8n workflow** for complex spam detection/automation:
    - [ ] Set up `N8N_WEBHOOK_CONTACT` webhook
    - [ ] Configure contact form to trigger n8n workflow
    - [ ] Set up email notifications via n8n Gmail connection
- [ ] E2E tests for AI features
- [ ] Test all AI features (comprehensive test suite)

**Deliverable**: Fully functional Nora AI chat widget with navigation, highlighting, and function calling

### Phase 9: Email Notifications & Communication (Week 8.5)
**Goal**: Implement email notifications, in-app messaging, and notifications center

**Prerequisites**: Phase 5 & 6 complete (Invoices and payments working)

**Tasks**:
- [ ] **TDD: Write tests first for email and communication features**
- [ ] **Email Notifications System**:
  - [ ] Write tests for email sending → Implement → Refactor
  - [ ] Database schema (email_templates, email_logs tables)
  - [ ] Email template management (admin panel)
  - [ ] Template variables system
  - [ ] Email queue system (AWS Lambda + SQS or n8n workflows):
    - [ ] AWS Lambda function for email processing
    - [ ] AWS SQS queue for email jobs (optional)
    - [ ] n8n workflows for complex email automation
  - [ ] AWS SES integration for email sending
  - [ ] Automated invoice reminders (configurable schedule)
  - [ ] Payment confirmations
  - [ ] Invoice sent notifications
  - [ ] Payment failed notifications
  - [ ] Contract signing reminders
  - [ ] Overdue invoice alerts
  - [ ] Welcome emails
  - [ ] Email preferences (customer opt-in/opt-out)
  - [ ] Email delivery tracking (SES delivery events)
- [ ] **In-App Messaging**:
  - [ ] Write tests for messaging system → Implement → Refactor
  - [ ] Database schema (messages, message_threads tables)
  - [ ] Message UI (customer & admin)
  - [ ] Message threads per invoice/contract
  - [ ] File attachments (AWS S3)
  - [ ] Read receipts
  - [ ] Real-time messaging (AWS AppSync or WebSocket)
  - [ ] Email notifications for new messages
- [ ] **Notifications Center**:
  - [ ] Write tests for notifications → Implement → Refactor
  - [ ] Database schema (notifications table)
  - [ ] Real-time notifications (AWS AppSync subscriptions or API Gateway WebSocket)
  - [ ] Notification bell UI
  - [ ] Mark as read/unread
  - [ ] Notification preferences
  - [ ] Email digest option

**Deliverable**: Complete communication system (email notifications, messaging, notifications center)

### Phase 10: Security & Audit (Week 8.75)
**Goal**: Implement security features and compliance

**Prerequisites**: Phase 4 complete (Authentication system in place)

**Tasks**:
- [ ] **TDD: Write tests first for security features**
- [ ] **Two-Factor Authentication (2FA)**:
  - [ ] Write tests for 2FA setup → Implement → Refactor
  - [ ] TOTP-based 2FA (Google Authenticator, Authy)
  - [ ] SMS-based 2FA (optional)
  - [ ] Backup codes generation
  - [ ] 2FA enforcement for admin
  - [ ] 2FA optional for customers
  - [ ] Recovery process
- [ ] **Activity Logs & Audit Trail**:
  - [ ] Write tests for activity logging → Implement → Refactor
  - [ ] Database schema (activity_logs table)
  - [ ] Log all user actions
  - [ ] Log invoice/payment/contract actions
  - [ ] Log admin actions
  - [ ] Activity log UI (admin)
  - [ ] Search/filter audit logs
  - [ ] Export audit logs
- [ ] **Rate Limiting & Security**:
  - [ ] Write tests for rate limiting → Implement → Refactor
  - [ ] API rate limiting (per user, per IP)
  - [ ] Login attempt limiting
  - [ ] IP whitelisting (admin)
  - [ ] Suspicious activity detection
  - [ ] Account lockout
  - [ ] Session timeout configuration
- [ ] **GDPR Compliance**:
  - [ ] Write tests for GDPR features → Implement → Refactor
  - [ ] Privacy policy acceptance
  - [ ] Terms of service acceptance
  - [ ] Data export functionality
  - [ ] Data deletion (right to be forgotten)
  - [ ] Cookie consent banner
  - [ ] Privacy settings

**Deliverable**: Complete security system with 2FA, audit logs, rate limiting, and GDPR compliance

### Phase 11: Meeting Booking System (Week 9)
**Goal**: Build complete meeting booking system with Google Calendar integration

**Prerequisites**: Phase 4 complete (Authentication), Phase 8 complete (Nora AI for booking integration)

**Tasks**:
- [ ] **Database Schema Setup** (foundation for booking system):
  - [ ] Write tests for database schema → Implement → Refactor
  - [ ] Create bookings table
  - [ ] Create booking_availability table
  - [ ] Create booking_blocks table
- [ ] **TDD: Write tests first for booking system**
- [ ] **Booking Page Development**:
  - [ ] Write tests for booking page UI → Implement → Refactor
  - [ ] Calendar component with date selection
  - [ ] Time slot display based on operation hours
  - [ ] Real-time availability checking (blocks scheduled meetings)
  - [ ] Booking form with validation
  - [ ] Time zone detection and handling
  - [ ] Confirmation flow
- [ ] **Availability Management**:
  - [ ] Write tests for availability logic → Implement → Refactor
  - [ ] Operation hours configuration (admin panel)
  - [ ] Availability rules (min/max advance booking, buffer times)
  - [ ] Blocked time slots management
  - [ ] Holiday/exception handling
  - [ ] Double booking prevention
- [ ] **Admin Booking Management**:
  - [ ] Write tests for admin booking CRUD → Implement → Refactor
  - [ ] View all bookings
  - [ ] Manage booking status
  - [ ] Operation hours management
  - [ ] Block/unblock time slots
  - [ ] Set holidays and exceptions
- [ ] **Integration**:
  - [ ] **Unified Booking API Endpoint**:
    - [ ] Write tests for unified booking API → Implement → Refactor
    - [ ] Create single API endpoint that both UI and Nora use
    - [ ] Same data structure for both booking methods
    - [ ] Validate booking data before sending to n8n
  - [ ] **Google Calendar Integration**:
    - [ ] Write tests for Google Calendar API integration → Implement → Refactor
    - [ ] Google Cloud Console setup (OAuth 2.0 credentials)
    - [ ] Google Calendar API authentication (Service Account or OAuth)
    - [ ] Availability API endpoint (`/api/availability`):
      - [ ] Write tests for availability endpoint → Implement → Refactor
      - [ ] Fetch busy/free times from Google Calendar (freebusy.query)
      - [ ] Combine with operation hours and blocked times
      - [ ] Calculate available time slots
      - [ ] Implement caching strategy (5-15 min cache)
    - [ ] Frontend integration:
      - [ ] Write tests for availability display → Implement → Refactor
      - [ ] Fetch availability when calendar loads
      - [ ] Display available/busy times on booking page
      - [ ] Real-time availability updates
    - [ ] Database sync:
      - [ ] Sync bookings with Google Calendar
      - [ ] Create calendar events on booking
      - [ ] Update/delete events on cancellation
  - [ ] **n8n Workflow** (shared by both UI and Nora):
    - [ ] Create single n8n workflow for all bookings
    - [ ] Workflow accepts standardized booking data
    - [ ] Google Calendar event creation (via n8n or direct API)
    - [ ] Email confirmation system (via n8n Gmail connection)
    - [ ] Reminder system (24h before, 1h before) (via n8n Gmail connection)
  - [ ] Cancellation/rescheduling functionality
  - [ ] Test that UI booking and Nora booking both use same workflow
- [ ] **Best Practices Implementation**:
  - [ ] Minimum advance booking time (configurable)
  - [ ] Maximum advance booking time (configurable)
  - [ ] Buffer time between meetings (configurable)
  - [ ] Meeting duration options (30 min, 60 min, etc.)
  - [ ] Time zone support
  - [ ] Real-time availability updates
- [ ] E2E tests for booking flow
- [ ] Test booking system comprehensively

**Deliverable**: Complete booking system with Google Calendar sync, unified API (UI + Nora), and n8n automation

---

## Architecture & Technical Details

### Nora AI Architecture Decision ✅

**Selected Approach**: Direct OpenAI Connection (Recommended)

**Architecture**: Frontend → Next.js API Route → OpenAI API

**Rationale**:
- ✅ Lower latency for real-time chat widget
- ✅ Better function calling support
- ✅ Simpler architecture, easier testing
- ✅ Real-time streaming responses

**n8n Integration**: Used for background automation only:
- **AI Contract Generation** (`N8N_WEBHOOK_CONTRACT_GENERATION`):
  - AI Agent workflow that generates contracts from client/project data
  - Input: Client info, project details, scope, pricing, terms
  - Output: Fully formatted contract ready for DocuSign
- Meeting booking automation (`N8N_WEBHOOK_BOOKING`)
- Contact form automation (`N8N_WEBHOOK_CONTACT`)
- General automation workflows (`N8N_WEBHOOK_GENERAL`)
- Scheduled tasks (invoice reminders, etc.)

*See "Technical Implementation Details" section below for full architecture*

### Phase 12: Additional Features (Week 9.5)
**Goal**: Add polish features (export, bulk ops, search, dark mode, meeting enhancements)

**Prerequisites**: Core features complete (Phases 1-11)

**Tasks**:
- [ ] **TDD: Write tests first for additional features**
- [ ] Database schema setup:
  - [ ] Write tests for schema → Implement → Refactor
  - [ ] saved_filters table (if not already created)
- [ ] **Export & Reporting**:
  - [ ] Write tests for export functionality → Implement → Refactor
  - [ ] Export invoices (CSV, PDF, Excel)
  - [ ] Export payments (CSV, Excel)
  - [ ] Export customers (CSV, Excel)
  - [ ] Custom date range exports
  - [ ] Scheduled reports (email)
  - [ ] Report templates
  - [ ] Financial reports
- [ ] **Bulk Operations**:
  - [ ] Write tests for bulk operations → Implement → Refactor
  - [ ] Bulk invoice creation
  - [ ] Bulk invoice sending
  - [ ] Bulk payment processing
  - [ ] Bulk customer updates
  - [ ] Bulk export
- [ ] **Global Search**:
  - [ ] Write tests for global search → Implement → Refactor
  - [ ] Search across all content
  - [ ] Search suggestions/autocomplete
  - [ ] Search filters
  - [ ] Search history
  - [ ] Keyboard shortcut (Cmd/Ctrl + K)
- [ ] **Dark Mode**:
  - [ ] Write tests for theme switching → Implement → Refactor
  - [ ] System preference detection
  - [ ] Manual toggle
  - [ ] Persistent theme selection
  - [ ] Smooth transitions
- [ ] **Meeting Enhancements**:
  - [ ] Write tests for meeting enhancements → Implement → Refactor
  - [ ] Video call link generation (Zoom, Google Meet, Teams)
  - [ ] Meeting preparation notes
  - [ ] Post-meeting follow-up automation
  - [ ] Multiple calendar support
  - [ ] Group bookings
  - [ ] Booking templates

**Deliverable**: Enhanced UX features (export, bulk ops, search, dark mode, meeting enhancements)

### Phase 13: Polish & Optimization (Week 10)
**Goal**: Optimize performance, accessibility, SEO, and security

**Prerequisites**: All feature phases complete (Phases 1-12)

**Tasks**:
- [ ] **Test coverage review** (ensure 80%+ coverage on business logic)
- [ ] Performance optimization (with performance tests)
- [ ] SEO implementation (test meta tags, structured data)
- [ ] Accessibility audit (automated + manual testing)
- [ ] Cross-browser testing (E2E tests across browsers)
- [ ] Security audit (including test coverage review)
- [ ] Payment flow testing (comprehensive E2E tests)
- [ ] Load testing for critical paths
- [ ] Final test suite review and optimization

**Deliverable**: Optimized, tested, and production-ready application

### Phase 14: Deployment & Launch (Week 11)
**Goal**: Deploy to production and launch portfolio

**Prerequisites**: Phase 13 complete (Polish & optimization done)

**Tasks**:
- [ ] Production deployment (AWS Amplify or ECS/EC2):
  - [ ] AWS Amplify app creation and configuration
  - [ ] Or ECS/EC2 instance setup with Docker
  - [ ] Environment variables configuration in AWS
  - [ ] Build and deployment pipeline setup
- [ ] Database migration (AWS RDS):
  - [ ] Run production database migrations
  - [ ] Verify database schema
  - [ ] Set up database backups
- [ ] Environment configuration:
  - [ ] Production environment variables in AWS
  - [ ] AWS Secrets Manager for sensitive credentials
- [ ] Stripe webhooks (production):
  - [ ] Configure production webhook endpoints
  - [ ] Test webhook delivery
- [ ] Domain & SSL setup:
  - [ ] AWS Route 53 for DNS (if using)
  - [ ] SSL certificate via AWS Certificate Manager (ACM)
  - [ ] CloudFront distribution with custom domain
- [ ] Analytics integration:
  - [ ] Google Analytics setup
  - [ ] Google Ads conversion tracking
  - [ ] Google Ads remarketing tags
- [ ] **Portfolio Launch** 🚀

**Deliverable**: Live portfolio website with all public features

### Phase 15: Customer Portal Launch (Week 12+)
**Goal**: Launch customer portal with beta testing

**Prerequisites**: Phase 14 complete (Portfolio launched)

**Tasks**:
- [ ] Beta testing with 1 current client
- [ ] Feedback & bug fixes
- [ ] Customer onboarding
- [ ] **Full Customer Portal Launch**

**Deliverable**: Fully operational customer portal with all features

### Phase 16: Post-Launch (Ongoing)
**Goal**: Monitor, maintain, and enhance the application

**Prerequisites**: Phase 15 complete (Full launch)

**Tasks**:
- [ ] Monitor performance
- [ ] Gather feedback
- [ ] Content updates
- [ ] Feature enhancements

**Deliverable**: Ongoing improvements based on feedback and usage

---

## Nora AI System Message

```
You are Nora, the friendly and professional AI assistant for Destin L. Mincy's portfolio website. You help visitors and customers learn about Destin's services, skills, and projects, and assist authenticated customers with their account information.

**Your Personality:**
- Warm and friendly: Be approachable and conversational, not robotic or overly formal
- Professional yet personable: Maintain professionalism while being easy to talk to
- Intelligent and knowledgeable: Speak with confidence about Destin's work and services
- Patient and understanding: Take time to clarify questions and ensure you understand what users need
- Proactive and helpful: Offer relevant information when appropriate, but don't be pushy
- Reliable and trustworthy: Be consistent, honest, and transparent

**Your Communication Style:**
- Use natural, conversational language - avoid jargon unless necessary
- Be clear and concise, but don't rush
- Show empathy when discussing account issues or concerns
- Express genuine enthusiasm about Destin's work and services
- Be supportive and encouraging
- Ask clarifying questions when you need more information to help effectively
- Acknowledge when you don't know something and offer to help find the answer

**Your Knowledge Base:**
You have access to information about:
- Destin L. Mincy's professional background and expertise
- Services offered (Node.js development, AI engineering, AI automation, etc.)
- Technical skills and technologies
- Portfolio projects (when available)
- General web development and AI topics

**For Authenticated Customers:**
When a user is authenticated, you have additional capabilities:
- You can access their account information, invoices, payments, and contracts
- Use the available functions to query their data when they ask about:
  - Their invoices (status, amounts, due dates)
  - Payment history
  - Contract details and status
  - Account summary information
- Always respect privacy - only access data for the authenticated user
- Be helpful and clear when explaining account information
- If there are issues (overdue invoices, payment problems), be empathetic and suggest next steps

**For Guest Users:**
- Help them learn about Destin's services and skills
- Answer questions about the portfolio and projects
- Guide them to relevant information on the website
- Be welcoming and helpful
- If they ask about account-specific information, politely explain they need to log in
- **Smart Navigation Feature**: If a user is having trouble finding something on the website, you can help them by:
  - Identifying which page contains the information they're looking for
  - Using the `navigate_to_page` function to take them directly to that page
  - Using the `highlight_section` function to highlight the specific section or content they need
  - This works for finding projects, skills, contact information, services, or any other content on the site
  - Always offer to navigate them when they seem lost or are looking for something specific
- **Meeting Booking**: If a user expresses interest in booking a meeting, scheduling a call, or wants to discuss working together:
  - Gather necessary information (name, email, preferred date/time if mentioned, purpose of meeting)
  - Use the `book_meeting` function to trigger the meeting booking automation
  - Let them know you're starting the booking process and they'll receive confirmation details
  - Be enthusiastic and helpful about connecting them with Destin
- **Contract Requests** (authenticated customers only): If a customer wants to request a new contract for a project:
  - Gather project details through conversation (title, description, scope, budget, timeline, requirements)
  - Use the `request_contract` function to submit the contract request
  - Explain the process: contract will be generated, they'll sign first, then Destin will review and sign if approved
  - Be helpful in collecting all necessary information for the contract

**Navigation & Highlighting Capabilities:**
You have the ability to help users find content on the website by:
- Understanding the site structure (pages: Home, Projects, Skills, About, Contact, etc.)
- Identifying which page and section contains the information users are seeking
- Using navigation functions to take users directly to relevant pages/sections
- Highlighting specific content with visual effects to draw attention
- This is especially helpful when users say things like:
  - "Where can I find your Node.js projects?"
  - "I'm looking for your contact information"
  - "Show me your AI skills"
  - "I can't find your portfolio projects"
  - "Where are your services listed?"
- When you navigate a user, let them know what you're doing: "Let me take you to the Projects page and highlight the Node.js projects for you!"

**Important Guidelines:**
- Always be respectful and professional
- Never make promises about services or pricing without confirming details
- If asked about something outside your knowledge, be honest and offer to help them contact Destin directly
- Maintain a positive, helpful tone
- Keep responses focused and relevant
- For technical questions, provide accurate information but don't overcomplicate things
- Remember: You represent Destin's brand, so be professional, warm, and helpful
- Proactively offer navigation help when users seem to be looking for something specific

**Response Format:**
- Write in a natural, conversational style
- Use appropriate punctuation and formatting for readability
- Break up long responses into paragraphs
- Use bullet points when listing multiple items
- Be concise but thorough
```

### Function Definitions (GPT-4 Turbo)

```typescript
// Navigation function
{
  name: "navigate_to_page",
  description: "Navigate user to a specific page or section on the website",
  parameters: {
    type: "object",
    properties: {
      page: {
        type: "string",
        enum: ["home", "projects", "skills", "about", "contact"],
        description: "The page to navigate to"
      },
      sectionId: {
        type: "string",
        description: "Optional: Specific section ID or element selector to scroll to"
      }
    },
    required: ["page"]
  }
}

// Highlighting function
{
  name: "highlight_section",
  description: "Highlight a specific section or element on the current page",
  parameters: {
    type: "object",
    properties: {
      elementSelector: {
        type: "string",
        description: "CSS selector or section ID of the element to highlight"
      },
      highlightType: {
        type: "string",
        enum: ["pulse", "glow", "border"],
        description: "Type of highlight animation"
      }
    },
    required: ["elementSelector"]
  }
}

// Customer data functions (authenticated users only)
{
  name: "get_customer_invoices",
  description: "Get list of customer invoices",
  parameters: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] }
},
{
  name: "get_invoice_details",
  description: "Get detailed invoice information",
  parameters: { type: "object", properties: { invoice_id: { type: "string" }, user_id: { type: "string" } }, required: ["invoice_id", "user_id"] }
},
{
  name: "get_payment_history",
  description: "Get customer payment history",
  parameters: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] }
},
{
  name: "get_contracts",
  description: "Get customer contracts",
  parameters: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] }
},
{
  name: "get_account_summary",
  description: "Get customer account summary",
  parameters: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] }
}

// Meeting booking function (triggers n8n automation)
// Note: This uses the same unified booking API endpoint as the UI booking page
// Both methods trigger the same n8n workflow with the same data structure
{
  name: "book_meeting",
  description: "Book a meeting with Destin L. Mincy. Uses the unified booking API endpoint (same as UI booking page) which triggers the n8n automation workflow to handle the booking process.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the person requesting the meeting"
      },
      email: {
        type: "string",
        description: "Email address of the person requesting the meeting"
      },
      preferred_date: {
        type: "string",
        description: "Preferred date for the meeting (if mentioned by user, format: YYYY-MM-DD)"
      },
      preferred_time: {
        type: "string",
        description: "Preferred time for the meeting (if mentioned by user, format: HH:MM or time range)"
      },
      purpose: {
        type: "string",
        description: "Purpose of the meeting or what they'd like to discuss"
      },
      company: {
        type: "string",
        description: "Company name (if mentioned)"
      },
      phone: {
        type: "string",
        description: "Phone number (if provided)"
      },
      notes: {
        type: "string",
        description: "Any additional notes or context from the conversation"
      }
    },
    required: ["name", "email"]
  }
}

// Contract request function (authenticated customers only)
// Allows customers to request a new contract via conversation with Nora
{
  name: "request_contract",
  description: "Request a new contract for a project. Nora will collect project details through conversation and submit a contract request. The contract will be generated and sent for signing (client signs first, then admin reviews and signs if approved).",
  parameters: {
    type: "object",
    properties: {
      project_title: {
        type: "string",
        description: "Title or name of the project"
      },
      project_description: {
        type: "string",
        description: "Description of what the project entails"
      },
      project_scope: {
        type: "string",
        description: "Detailed scope of work for the project"
      },
      budget: {
        type: "string",
        description: "Project budget or pricing (if mentioned)"
      },
      timeline: {
        type: "string",
        description: "Expected timeline or deadline (if mentioned)"
      },
      requirements: {
        type: "string",
        description: "Specific requirements or deliverables"
      },
      additional_notes: {
        type: "string",
        description: "Any additional notes or context from the conversation"
      }
    },
    required: ["project_title", "project_description"]
  }
}
```

---

## Technical Implementation Details

### Refine Configuration
- **Data Provider**: Custom AWS Data Provider (RDS PostgreSQL via Prisma/TypeORM)
  - Direct PostgreSQL connection (AWS RDS)
  - Custom data hooks for CRUD operations
  - Real-time subscriptions via AWS AppSync or WebSocket
- **Auth Provider**: Custom AWS Cognito Provider
  - Email/password authentication (AWS Cognito User Pools)
  - **OAuth providers**: Google, Facebook, LinkedIn, GitHub (optional) via Cognito User Pool OAuth
    - ✅ **Fully supported** - All major OAuth providers work seamlessly
    - Configured in AWS Cognito Console > User Pool > Sign-in experience > Federated identity provider sign-in
    - AWS Cognito handles OAuth flow, token management, and user profile sync
    - Users can link multiple OAuth accounts to the same user profile
  - MFA support (TOTP, SMS)
- **UI Framework**: Ant Design (default)
- **Routing**: Next.js App Router integration

### Payment Architecture (Stripe)
- **Frontend**: Stripe Elements (secure payment forms)
- **Stripe Link**: One-click checkout (enabled for faster payments)
- **Backend**: Payment Intents API
- **Webhooks**: Payment event handling
- **Security**: PCI-compliant, webhook signature verification

### Contract Management (DocuSign + AI Generation)
- **AI Contract Generation**: n8n AI Agent workflow
  - **Input**: Client information, project details, scope, pricing, terms
  - **Process**: AI Agent generates professional contract with all necessary clauses
  - **Output**: Fully formatted contract document (PDF-ready)
  - **Integration**: Seamless flow from generation → database → DocuSign
- **Client-Initiated Contract Requests**:
  - **Request Methods**: Form (customer portal) or Nora chat conversation
  - **Workflow**: Client requests → AI generates contract → Client signs first → Admin reviews → Admin approves/rejects → If approved: Admin signs → Both notified → Project begins
  - **Admin Approval**: Review interface for pending contract requests
  - **Notifications**: Both parties notified at each stage
- **DocuSign Integration**:
  - **Authentication**: OAuth 2.0
  - **API**: Envelopes API (sending contracts)
  - **Signing**: Embedded signing (two-way workflow)
  - **Webhooks**: Contract status updates
- **Workflows**: 
  - **Admin-initiated**: Admin generates contract → Review/Edit → Send to DocuSign → Client signs
  - **Client-initiated**: Client requests → AI generates → Client signs → Admin reviews & signs → Both notified

### AI Integration (Nora)
- **Architecture**: Direct OpenAI connection (see "Nora AI Architecture Decision" above)
- **Guest Users**: GPT-3.5 Turbo (simple Q&A)
- **Authenticated Users**: GPT-4 Turbo (function calling, data access)
- **Context Injection**: Services, skills, projects, site structure, user info
- **Function Calling**: Navigation, highlighting, customer data queries, meeting booking
- **Implementation**: Next.js API route → OpenAI API (direct connection)
- **n8n Integration**: Meeting booking triggers n8n webhook → automation workflow

### Booking System Architecture
- **Unified Booking Flow**: Both UI booking page and Nora chat widget use the same system
- **Single API Endpoint**: `/api/bookings/create` - handles bookings from both sources
- **Same Data Structure**: Both methods send identical booking data (see Phase 11 for details)
- **Single n8n Workflow**: One workflow handles all bookings regardless of source
- **Google Calendar Integration**: 
  - Availability API endpoint (`/api/availability`)
  - Fetches busy/free times via Google Calendar API (freebusy.query)
  - Combines with operation hours and blocked times
  - Caching strategy (5-15 min cache)
  - Two-way sync (bookings ↔ Google Calendar)
- *See Phase 11 for detailed implementation*

---

## Design Specifications

### Color Palette
- **Primary**: Blue (professional, trustworthy)
- **Accent**: Gold (premium, achievement)
- **Secondary**: Silver (modern, sophisticated)
- **Accessibility**: WCAG 2.1 AA compliance

### Typography
- Clean, readable fonts
- Heading hierarchy
- Font pairing (e.g., Inter + Playfair Display)

### Animations
- Framer Motion (portfolio pages)
- Smooth scroll animations
- Hover effects
- Parallax effects (optional)
- Highlight animations (Nora navigation)

---

## Content Requirements

### Assets Ready
- ✅ Professional headshot: `img/Destin-L-Mincy__HEADSHOT.png`

### Content Needed
- Project information & screenshots
- Professional bio & career timeline
- Skills descriptions
- Contact information
- Site copy (hero, CTAs, etc.)

---

## Key Decisions Made ✅

1. ✅ **Blog**: Architecture ready from start, can be hidden until needed
2. ✅ **Color Scheme**: Blue, Gold, Silver
3. ✅ **Headshot**: Ready in project folder
4. ✅ **Timeline**: 10-11 weeks (flexible)
5. ✅ **Payment Provider**: Stripe
6. ✅ **Payment System**: Architected from start
7. ✅ **Admin Panel**: Required from start, full CMS
8. ✅ **Database**: AWS RDS (PostgreSQL) - Scalable, enterprise-ready
9. ✅ **Infrastructure**: AWS Ecosystem (Cognito, S3, Lambda, Amplify, CloudFront)
10. ✅ **ALL Content Editable**: Via admin panel
11. ✅ **Primary AI Feature**: Nora AI Chat Widget
12. ✅ **AI Model**: Hybrid (GPT-3.5 Turbo guests, GPT-4 Turbo authenticated)
13. ✅ **Nora Personality**: Complete system message created
14. ✅ **Nora Smart Navigation**: Navigate & highlight content
15. ✅ **Current Clients**: 1 client for initial portal access
16. ✅ **OAuth Authentication**: Google, Facebook, LinkedIn (GitHub optional) alongside email/password
17. ✅ **Stripe Link**: One-click checkout enabled for faster payment experience
18. ✅ **Test-Driven Development (TDD)**: All features developed test-first (Red → Green → Refactor)
19. ✅ **AWS Ecosystem**: Full AWS infrastructure for scalability and enterprise growth

---

## Resources & Documentation

### Primary Documentation
- **Refine**: https://refine.dev/docs
  - [Quick Start](https://refine.dev/docs/getting-started/quickstart)
  - [Next.js Guide](https://refine.dev/docs/guides-and-concepts/guides/nextjs)
  - [Custom Data Provider](https://refine.dev/docs/data-provider/custom-data-provider) - For AWS RDS
  - [Custom Auth Provider](https://refine.dev/docs/guides-and-concepts/authentication) - For AWS Cognito
  - [Authentication](https://refine.dev/docs/guides-and-concepts/authentication)
- **Refine Examples**:
  - [MUI Admin Dashboard](https://example.mui.admin.refine.dev)
  - [HR Dashboard](https://hr.refine.dev/login)
- **Next.js**: https://nextjs.org/docs
- **Ant Design**: https://ant.design
- **Stripe**: https://docs.stripe.com
  - [Payment Intents](https://docs.stripe.com/payments/payment-intents)
  - [Elements](https://docs.stripe.com/payments/elements)
  - [Link](https://docs.stripe.com/payments/link) - One-click checkout
  - [Webhooks](https://docs.stripe.com/webhooks)
- **OpenAI**: https://platform.openai.com/docs
- **DocuSign**: https://developers.docusign.com/docs
- **n8n**: https://docs.n8n.io
  - [Getting Started](https://docs.n8n.io/getting-started/)
  - [AI Agents](https://docs.n8n.io/ai-agents/) - For contract generation workflow
  - [Webhooks](https://docs.n8n.io/integrations/builtin/core-nodes/webhook/) - For receiving data from Next.js
  - [Workflow Automation](https://docs.n8n.io/workflows/)
- **Google Calendar API**: https://developers.google.com/calendar
  - [Getting Started](https://developers.google.com/calendar/api/guides/overview)
  - [Authentication](https://developers.google.com/calendar/api/auth)
  - [Freebusy API](https://developers.google.com/calendar/api/v3/reference/freebusy/query) - For fetching availability
  - [Events API](https://developers.google.com/calendar/api/v3/reference/events) - For creating calendar events
  - [Push Notifications](https://developers.google.com/calendar/api/guides/push) - For real-time updates (optional)
- **Google Ads**: https://ads.google.com
  - [Google Ads API](https://developers.google.com/google-ads/api/docs/start) - For programmatic access
  - [Conversion Tracking](https://support.google.com/google-ads/answer/1722054) - Track conversions
  - [Remarketing Tags](https://support.google.com/google-ads/answer/2453998) - Remarketing pixel setup
  - [Google Tag Manager](https://tagmanager.google.com) - Manage tracking tags

### Design Inspiration
- [ZYAN Portfolio Template](https://codeefly.net/wp/zyan)
- [Drake Personal Portfolio](https://preview.themeforest.net/item/drake-personal-portfolio-html/full_screen_preview/43789350)

---

## Next Steps

### Immediate Actions
1. ✅ Review and approve project plan
2. ⏭️ Set up AWS account & configure services:
   - AWS RDS PostgreSQL instance
   - AWS Cognito User Pool
   - AWS S3 buckets (media, client-uploads, public)
   - AWS CloudFront distribution
   - AWS Lambda functions
   - AWS AppSync API (or API Gateway WebSocket)
   - AWS SES (email service)
   - AWS ElastiCache Redis (optional, for caching)
3. ⏭️ Set up OAuth provider accounts (Google, Facebook, LinkedIn, GitHub optional)
4. ⏭️ Configure OAuth in AWS Cognito Identity Pools
5. ⏭️ Set up Stripe account (test mode)
6. ⏭️ Set up OpenAI API account
7. ⏭️ Set up Google Calendar API credentials
8. ⏭️ **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in all AWS credentials and API keys (see `.env.example` for complete list)
   - Generate secure SESSION_SECRET (use: `openssl rand -base64 32`)
9. ⏭️ Initialize Refine + Next.js project
10. ⏭️ Begin Phase 1: Foundation & Setup

### Pre-Development Checklist
- [ ] **AWS Infrastructure Setup**:
  - [ ] AWS account created with appropriate IAM roles
  - [ ] AWS RDS PostgreSQL instance created
  - [ ] AWS Cognito User Pool created
  - [ ] AWS Cognito Identity Pool created (for OAuth)
  - [ ] AWS S3 buckets created (media, client-uploads, public)
  - [ ] AWS CloudFront distribution configured
  - [ ] AWS Lambda functions structure created
  - [ ] AWS AppSync API created (or API Gateway WebSocket)
  - [ ] AWS SES configured (email service)
  - [ ] AWS ElastiCache Redis cluster (optional, for caching)
- [ ] OAuth provider accounts configured (Google, Facebook, LinkedIn, GitHub optional)
- [ ] OAuth providers linked in AWS Cognito
- [ ] Stripe account configured (test mode)
- [ ] OpenAI API keys obtained
- [ ] Google Calendar API credentials obtained
- [ ] DocuSign API credentials obtained (if using)
- [ ] n8n instance set up (if using)
- [ ] Development environment ready
- [ ] **Testing tools installed** (Jest, React Testing Library, Playwright)
- [ ] Git repository initialized
- [ ] CI/CD pipeline configured (AWS CodePipeline or GitHub Actions with test automation)
- [ ] **Environment variables configured**:
  - [ ] Copy `.env.example` to `.env`
  - [ ] Fill in all AWS credentials (RDS, Cognito, S3, Lambda, etc.)
  - [ ] Fill in all API keys (Stripe, OpenAI, DocuSign, Google Calendar, etc.)
  - [ ] Generate SESSION_SECRET (use: `openssl rand -base64 32`)
  - [ ] Verify `.env` is in `.gitignore`
- [ ] Design mockups (optional, can iterate)

---

**Document Version**: 3.0 (Refactored & Streamlined)  
**Last Updated**: [Current Date]  
**Status**: ✅ Planning Complete - Refactored for Better Organization - Ready for Development

## Recent Updates (v3.0)
- ✅ **Refactored**: Removed redundancies, improved organization
- ✅ **Reorganized**: Database schema by feature area
- ✅ **Sequential Phases**: Fixed phase numbering (1-16) with clear prerequisites
- ✅ **Consolidated**: Feature descriptions, moved detailed architecture to appendices
- ✅ **Enhanced Flow**: Each phase now has prerequisites and deliverables
- ✅ **Streamlined**: Removed duplicate information, improved readability
