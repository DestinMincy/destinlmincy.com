# Portfolio Website - Project Plan

## Executive Summary

**Project**: Modern portfolio website with integrated customer portal, invoice management, and AI-powered features  
**Tech Stack**: Refine + Next.js + TypeScript + AWS (RDS, Cognito, S3, Lambda, Amplify) + Polar (MoR) + Google Ads  
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
- ✅ Invoice management & payment processing (Polar - Merchant of Record)
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
| **Payments** | Polar (MoR) | Invoice payments, tax compliance |
| **AI** | OpenAI (GPT-3.5 Turbo / GPT-4 Turbo) | Nora chat widget |
| **Contracts** | DocuSign API | Contract management |
| **Repository Hosting** | AWS CodeCommit | Client project repository hosting (100% AWS, closed-source, managed Git service) |

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
| **Dashboard** | `/dashboard` | Balance summary, invoices/contracts/quotes overview, payment history, quick actions, notifications |
| **Quotes** | `/quotes` | Quote list, filters, approval status, PDF download, initial/final quotes |
| **Quote Detail** | `/quotes/:id` | Full quote view, approve/reject, convert to contract, download PDF |
| **Invoices** | `/invoices` | Invoice list, filters, payment status, PDF download, recurring invoices |
| **Invoice Detail** | `/invoices/:id` | Full invoice, payment form (Polar), payment history, partial payments, payment plans |
| **Contracts** | `/contracts` | Contract list, signing status, DocuSign integration, request new contract |
| **Contract Detail** | `/contracts/:id` | Contract view, embedded signing, download |
| **Request Contract** | `/contracts/request` | New contract request form (or via Nora chat) |
| **Projects** | `/projects` | View assigned projects, upload files (logos, assets), project files library |
| **Project Detail** | `/projects/:id` | Project details, milestones view, file upload interface, file library, project messages |
| **Project Milestones** | `/projects/:id/milestones` | Milestone list, status tracking, deliverables linked to repository files/commits, approval workflow, milestone-based collaboration (comments/requests) |
| **Project Repository** | `/projects/:id/repository` | Repository browser, file system view, git commit history, code visibility control, milestone-linked deliverables |
| **Project Certificate** | `/projects/:id/certificate` | View completion certificate, download certificate PDF, view certificate in repository |
| **Project Activity** | `/projects/:id/activity` | Project activity feed, status updates, timeline view |
| **Submit Testimonial** | `/testimonials/submit` | Submit testimonial form (or via Nora chat) |
| **Payments** | `/payments` | Payment history, receipts, filters, payment plans |
| **Subscriptions** | `/subscriptions` | Active subscriptions, subscription management, upgrade/downgrade, cancel/pause, billing history, usage tracking |
| **Messages** | `/messages` | In-app messaging with admin, message threads, file attachments |
| **Notifications** | `/notifications` | Notification center, mark as read/unread, preferences |
| **Profile** | `/profile` | Account info, billing address, password change, 2FA setup, email preferences |
| **Payment Methods** | `/payment-methods` | Saved cards, add/remove methods, set default |

### Admin Pages
| Page | Route | Features |
|------|-------|----------|
| **Dashboard** | `/admin` | Revenue analytics, invoice/customer/quote stats, project metrics, quick actions, notifications |
| **Projects** | `/admin/projects` | CRUD operations, image upload, featured toggle |
| **Project Milestones** | `/admin/projects/:id/milestones` | Create/edit milestones, link deliverables to repository files/commits, track completion, client approval workflow, review milestone comments/requests |
| **Project Repositories** | `/admin/projects/:id/repository` | Create/manage AWS repositories, configure settings, view all files, set open-source licensing |
| **Project Certificates** | `/admin/projects/:id/certificate` | Generate completion certificates, view certificate history, manage certificate templates |
| **Content Management** | `/admin/content` | Edit ALL pages (Home, About, Skills, Contact, Projects) |
| **Blog** | `/admin/blog` | Blog CRUD (architecture ready, can be hidden) |
| **Quotes** | `/admin/quotes` | Create/edit quotes, initial/final quote workflow, hourly rate management, convert to contracts, quote numbering |
| **Invoices** | `/admin/invoices` | Create/edit invoices, send to customers, payment tracking, recurring invoices, invoice numbering |
| **Contracts** | `/admin/contracts` | Create contracts, send via DocuSign, track status, review client-requested contracts, approve/reject, generate from quotes |
| **Customers** | `/admin/customers` | Customer management, view invoices/contracts, messaging |
| **Messages** | `/admin/messages` | Customer messaging, message threads, file attachments |
| **Email Templates** | `/admin/email-templates` | Manage email templates, preview, test |
| **Activity Logs** | `/admin/activity-logs` | Audit trail, user actions, search/filter, export |
| **Expenses** | `/admin/expenses` | Track project expenses, receipt upload, categorize, mark billable/non-billable, link to invoices |
| **Testimonials** | `/admin/testimonials` | View testimonials, approve/reject, feature testimonials, manage display |
| **Subscriptions** | `/admin/subscriptions` | Manage subscription tiers, view all subscriptions, subscription analytics, manage customer subscriptions, pause/cancel/activate |
| **Subscription Tiers** | `/admin/subscription-tiers` | Create/edit subscription tiers, pricing, features, billing frequency, Polar product/price integration |
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
- Dashboard with widgets (balance, quotes, invoices, contracts, payments)
- **Quote Management** ⭐:
  - View quotes (initial and final)
  - Approve/reject quotes
  - Download quote PDFs
  - Convert approved quotes to contracts
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
- **Project Milestones** ⭐:
  - View project milestones with status tracking and payment status
  - See deliverables linked to repository files/commits
  - Payment required before milestone begins (full upfront or per-milestone payment)
  - Code released per milestone after payment received and deliverables completed
  - Approve/reject completed milestones (after code is released)
  - Timeline view of milestone progress
  - Click deliverables to view linked files/commits in repository (if code is released)
- **Project Repository Access** ⭐:
  - Access to project repository (100% AWS-hosted, closed-source by default)
  - File system browser (explore project structure)
  - Code visibility control (code released per milestone after payment received and milestone completed)
  - Git commit history as project activity log (commits made directly to AWS repository)
  - Real-time updates (notifications when commits are made)
  - Milestone indicators on files/commits (shows which deliverables are linked)
  - Download final product on completion
  - File preview and download (based on visibility rules)
  - Open-source licensing (if contractually specified)

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
- Polar integration (Merchant of Record - architected from start)
- Polar Payment API
- Polar secure payment forms
- Webhook handling
- Receipt generation
- Tax compliance handled by Polar (MoR)
- PCI-compliant (handled by Polar)

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

### 9. Quotes/Estimates System ⭐
- **Initial vs. Final Quote Workflow**: Initial estimate → Planning session → Final quote with exact pricing
- **Hourly Rate Management**: Base rates, project type rates, complexity multipliers (Low/Medium/High)
- **32-Hour Work Week Calculation**: Timeline based on 32-hour weeks
- **Automatic Price Calculation**: Hourly rate × estimated hours = total price
- **Quote Numbering**: Customizable format (QUOTE-YYYY-###), sequential numbering
- **Quote Templates**: Multiple templates, custom branding, preview
- **Planning Session Tracking**: Schedule, complete, and link to final quote
- **Quote → Contract Workflow**: Approved final quote triggers contract generation
- **Quote PDF Generation**: Professional quote documents
- *See Phase 5 for detailed implementation*

### 10. Invoice Management Enhancements
- **Invoice Numbering**: Customizable format (INV-YYYY-###), sequential numbering, reset options
- **Recurring Invoices**: Templates, automatic generation, pause/resume
- **Payment Plans**: Installments, partial payments, balance tracking
- **Tax & Currency**: Multi-rate tax calculation, multi-currency support, exchange rates
- **Invoice Templates**: Multiple templates, custom branding, preview
- **Automated Invoice Follow-ups** ⭐: Escalating reminders for overdue invoices, configurable reminder schedule (e.g., 3 days, 7 days, 14 days), late fee automation (optional), payment plan offers, grace period settings
- *See Phase 5.5 & 8 for detailed implementation*

### 10. Recurring Service Subscriptions ⭐
- **Subscription Tiers/Packages**: Create subscription plans with pricing, features, billing frequency (monthly, quarterly, yearly)
- **Subscription Management**: Customer subscriptions, lifecycle management (active, paused, cancelled, expired)
- **Polar Subscriptions Integration**: Full integration with Polar Subscriptions API for automatic billing
- **Subscription Portal**: Customer self-service portal for managing subscriptions, upgrades/downgrades, cancellations
- **Usage Tracking**: Track subscription usage (optional, for usage-based billing)
- **Subscription Analytics**: Revenue analytics, churn tracking, subscription metrics
- **Automatic Billing**: Automatic invoice generation and payment processing via Polar (MoR)
- **Subscription Renewals**: Automatic renewal management, renewal reminders
- *See Phase 9 for detailed implementation*

### 11. Security & Compliance
- **2FA**: TOTP-based (Google Authenticator, Authy), SMS optional, backup codes, admin enforcement
- **Activity Logs**: Complete audit trail, search/filter, export
- **Rate Limiting**: API limits, login attempt limiting, IP whitelisting, account lockout
- **GDPR**: Privacy policy, data export/deletion, cookie consent, privacy settings
- *See Phase 10 for detailed implementation*

### 12. Customer Communication
- **In-App Messaging**: Admin-customer messaging, threads per invoice/contract, file attachments, read receipts
- **Notifications Center**: Real-time notifications, categories, preferences, email digest
- *See Phase 9 for detailed implementation*

### 13. Enhanced Project Collaboration ⭐
- **Milestone-Based Collaboration**: Clients can make comments and requests only on visible milestone deliverables
- **One-Time Submission Per Milestone**: Once comments/suggestions are submitted and acceptance/request is pushed through, client must wait until next milestone release
- **Milestone-Scoped Comments**: Comments and requests are tied to specific milestones and their released deliverables
- **Request Workflow**: Client submits feedback → Admin reviews → Admin responds/addresses → Next milestone release unlocks new collaboration
- **Visibility Control**: Clients can only collaborate on milestones that have been released (payment received + deliverables completed)
- *See Phase 9.5 for detailed implementation*

### 14. Project Completion Certificates ⭐
- **Notice of Completion**: Official certificate representing that contractor has no further obligation to the project
- **Repository Storage**: Certificate stored in final project repository alongside the project files
- **Certificate Generation**: Automated generation when project is marked complete
- **Digital Signatures**: Certificate includes digital signatures (admin signature, completion date)
- **Certificate Download**: Client can download certificate from project repository
- **Legal Documentation**: Serves as formal documentation of project completion and release of obligations
- *See Phase 9.75 for detailed implementation*

### 15. Project Milestones & Deliverables ⭐
- **Milestone Tracking**: Break projects into milestones with due dates, status tracking, and completion percentages
- **Payment-First Model**: Payment required upfront before milestone begins (supports both full upfront payment and per-milestone payment)
- **Code Release Per Milestone**: Files/code for a milestone are released to client only after:
  1. Milestone deliverables are completed
  2. Payment for that milestone is received in full
- **Deliverables Integration**: Link deliverables to repository files/commits (deliverables are files/features in the GitHub-like repository)
- **Client Approval Workflow**: Client can approve/reject completed milestones (after code is released)
- **Repository Linking**: Each deliverable can link to specific files or git commits in the repository
- **Milestone-Based Payments**: Invoice generation per milestone (or full upfront payment option)
- **Code Visibility Control**: Milestone-specific code visibility (code released per milestone after payment)
- **Timeline View**: Visual timeline/Gantt chart showing milestone progress
- **Status Workflow**: `pending` → `payment_required` → `in_progress` → `completed` → `code_released` → `approved`/`rejected`
- **Auto-Detection**: Automatically mark deliverables as completed when linked files/commits are created
- *See Phase 6 for detailed implementation*

### 14. Client Project Repository & Git Integration ⭐
- **Repository Hosting**: AWS CodeCommit (managed Git service) - 100% AWS-hosted, closed-source by default
- **Private Repositories**: All projects hosted privately on AWS CodeCommit, not publicly accessible
- **Open-Source Exception**: If project uses your open-source code, can be made available with proper licensing (specified in contract)
- **File System Browser**: Client-accessible file tree with code visibility control
- **Code Visibility**: Code files released per milestone after payment received and milestone completed (milestone-based code release)
- **Git Commit History**: Real-time commit log as project activity feed (commits made directly to CodeCommit)
- **Milestone Indicators**: Files/commits show which milestones/deliverables they're linked to
- **Milestone Code Release**: Code for each milestone becomes visible after that milestone is paid and completed
- **Client Notifications**: Notify clients of repository updates (commits, file changes, milestone code releases)
- **Download System**: Final product download on completion
- **Security**: IAM access control, signed URLs, backend validation, private repositories by default
- **Integration**: CodeCommit API for file browser, commit history, and repository management
- *See Phase 5.75 for detailed implementation*

### 15. Additional Features
- **Discount Codes**: Percentage/fixed discounts, expiration, usage limits, minimum amounts
- **Credit Notes & Refunds**: Credit notes, Polar refunds, partial refunds
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

### Quotes & Estimates System
- `quotes` - Quote/estimate records
  - Fields: id, customer_id, quote_number, quote_type (initial/final), status, expiration_date, hourly_rate, estimated_hours, total_amount, currency, tax_rate_id, project_scope (text), timeline_weeks (integer), complexity_level (low/medium/high), planning_session_completed (boolean), planning_session_notes (text), terms (text), notes, approved_at, rejected_at, contract_id (when contract created), initial_payment_invoice_id, converted_to_invoice_id (optional), parent_quote_id (for revisions), created_at, updated_at
- `quote_items` - Quote line items
  - Fields: id, quote_id, description, quantity, unit_price, total, created_at
- `hourly_rates` - Hourly rate configuration
  - Fields: id, project_type, complexity_level, hourly_rate, is_default, is_active, created_at, updated_at

### Invoice & Payment System
- `invoices` - Invoice records
  - Fields: id, customer_id, quote_id (optional, for tracking), invoice_number (custom format), currency, tax_rate_id, recurring_invoice_id, payment_plan_id, status, due_date, total_amount, created_at, updated_at
- `invoice_items` - Invoice line items
  - Fields: id, invoice_id, description, quantity, unit_price, total, created_at
- `payments` - Payment transactions
  - Fields: id, invoice_id, customer_id, amount, payment_method_id, partial_payment (flag), payment_plan_installment_id, polar_payment_id, status, created_at, updated_at
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
- `invoice_reminders` - Invoice reminder tracking
  - Fields: id, invoice_id, reminder_type, sent_at, next_reminder_date, created_at
- `invoice_reminder_rules` - Escalation rules for invoice reminders
  - Fields: id, days_overdue, reminder_type, email_template_id, late_fee_percentage (optional), is_active, created_at
- `credit_notes` - Credit note records
  - Fields: id, invoice_id, customer_id, amount, reason, status, applied_to_invoice_id, created_at, updated_at
- `refunds` - Refund transactions
  - Fields: id, payment_id, invoice_id, amount, reason, status, polar_refund_id, created_at, updated_at

### Recurring Service Subscriptions
- `subscription_tiers` - Subscription plan definitions
  - Fields: id, name, description, price, billing_frequency (monthly/quarterly/yearly), currency, features (JSON), polar_product_id, polar_price_id, is_active, trial_days (optional), created_at, updated_at
- `subscriptions` - Customer subscription records
  - Fields: id, customer_id, subscription_tier_id, status (active/paused/cancelled/expired/trialing), start_date, end_date (optional), next_billing_date, current_period_start, current_period_end, cancel_at_period_end (boolean), cancelled_at, polar_subscription_id, polar_customer_id, trial_start, trial_end, created_at, updated_at
- `subscription_usage` - Usage tracking for subscriptions (optional, for usage-based billing)
  - Fields: id, subscription_id, usage_type, quantity, period_start, period_end, created_at
- `subscription_invoices` - Link subscriptions to invoices (for tracking)
  - Fields: id, subscription_id, invoice_id, billing_period_start, billing_period_end, created_at

### Contracts
- `contracts` - Customer contracts (DocuSign integration)
  - Fields: id, customer_id, quote_id (when generated from quote), invoice_id (optional), project_id (optional), contract_type, docusign_envelope_id, contract_content (text/JSON), generated_by_ai (boolean), ai_generation_data (JSON - stores input data used for generation), requested_by_client (boolean), client_signed_at, admin_signed_at, admin_approved_at, admin_rejected_at, rejection_reason, status (draft/pending_client_signature/pending_admin_approval/pending_admin_signature/completed/rejected), signed_at, created_at, updated_at
- `contract_requests` - Client-initiated contract requests
  - Fields: id, customer_id, project_id (optional), request_data (JSON - form data or Nora conversation), contract_id (after generation), status (pending/approved/rejected/contract_generated), created_at, updated_at

### Projects & File Management
- `projects` - Portfolio projects (admin-managed) - Enhanced for client access
  - Fields: id, customer_id (optional - for client-assigned projects), title, description, status, featured, images, created_at, updated_at
- `project_files` - Files uploaded by clients for projects
  - Fields: id, project_id, customer_id, file_name, file_path, file_type, file_size, category (logo/assets/documentation/etc.), description, uploaded_by, created_at, updated_at
- `project_milestones` - Project milestones for tracking progress
  - Fields: id, project_id, name, description, due_date, start_date, status (pending/payment_required/in_progress/completed/approved/rejected), completion_percentage, order (integer for sequencing), payment_required (boolean), payment_received (boolean), payment_received_at, invoice_id (for milestone-based payments), approved_at, approved_by, rejected_at, rejection_reason, code_released (boolean), code_released_at, created_at, updated_at
- `milestone_deliverables` - Deliverables linked to milestones (files/commits in repository)
  - Fields: id, milestone_id, name, description, deliverable_type (file/commit/feature), repository_file_path (for file deliverables), git_commit_hash (for commit deliverables), status (pending/completed/verified), completed_at, verified_at, created_at, updated_at
- `milestone_comments` - Client comments on milestone deliverables
  - Fields: id, milestone_id, customer_id, comment_text, file_path (optional, for file-specific comments), line_number (optional, for code comments), created_at, updated_at
- `milestone_requests` - Client change requests for milestones
  - Fields: id, milestone_id, customer_id, request_type (change/addition/removal), description, status (pending/reviewed/addressed), admin_response (text), addressed_at, created_at, updated_at
- `milestone_collaboration_submissions` - Track one-time submissions per milestone
  - Fields: id, milestone_id, customer_id, submission_type (comments/requests/both), submitted_at, locked_until_next_milestone (boolean), created_at
- `project_certificates` - Completion certificate records
  - Fields: id, project_id, certificate_number, certificate_file_path (S3 path), repository_file_path (path in CodeCommit repo), generated_at, admin_signature, completion_date, certificate_hash (for verification), created_at, updated_at
- `certificate_templates` - Certificate template definitions
  - Fields: id, name, template_content (HTML/PDF template), variables (JSON), is_default, created_at, updated_at
- `project_status_updates` - Project status updates and activity feed
  - Fields: id, project_id, status_type (design/development/testing/deployment/completed), title, description, created_by, created_at, updated_at
- `project_activity_log` - Comprehensive project activity log
  - Fields: id, project_id, activity_type, description, user_id, metadata (JSON), created_at
- `testimonials` - Client testimonials and reviews
  - Fields: id, customer_id, project_id, rating (1-5, optional), testimonial_text, status (pending/approved/rejected), featured (boolean), approved_at, created_at, updated_at
- `expenses` - Project-related expenses
  - Fields: id, project_id, customer_id, category_id, description, amount, date, receipt_file_path, billable (boolean), markup_percentage, invoice_id (if billed), created_at, updated_at
- `expense_categories` - Expense category management
  - Fields: id, name, description, created_at

### Project Repositories & Git Integration
- `project_repositories` - Client project repository connections (AWS CodeCommit)
  - Fields: id, project_id, codecommit_repo_name, codecommit_repo_arn, codecommit_clone_url_http, codecommit_clone_url_ssh, is_open_source (boolean), open_source_license (text), code_unlocked (boolean), unlocked_at, unlocked_by, created_at, updated_at
- `repository_files` - Repository file metadata
  - Fields: id, repository_id, file_path, file_name, file_type, file_size, is_code_file (boolean), is_visible (boolean), last_modified, git_commit_hash, created_at, updated_at
- `repository_commits` - Git commit history
  - Fields: id, repository_id, commit_hash, commit_message, author_name, author_email, commit_date, files_changed (JSON), created_at

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
- ✅ Payment processing (Polar integration - Merchant of Record)
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
- All accounts set up (AWS, Polar, OpenAI, etc.)
- AWS account with appropriate permissions
- Environment variables configured (see `.env.example`)
- Development environment ready

**Tasks**:
- [ ] **TDD: Write tests first for all features below** (applies throughout)
- [ ] **Project Initialization**:
  - [ ] Create Next.js project with TypeScript and Tailwind
  - [ ] Install Refine core packages and Ant Design
  - [ ] Set up project structure (app/, components/, lib/, __tests__/)
  - [ ] Configure TypeScript paths and environment variables
- [ ] **Testing Infrastructure**:
  - [ ] Jest + React Testing Library configuration
  - [ ] Playwright setup for E2E testing
  - [ ] Mock Service Worker (MSW) setup
  - [ ] Test database configuration (local PostgreSQL or separate RDS instance)
  - [ ] Test utilities and helpers
  - [ ] CI/CD pipeline with test automation
- [ ] **AWS Infrastructure Setup**:
  - [ ] AWS RDS PostgreSQL instance (development)
  - [ ] AWS Cognito User Pool with OAuth providers (Google, Facebook, LinkedIn, GitHub)
  - [ ] AWS S3 buckets (media, client-uploads, public)
  - [ ] AWS CloudFront distribution (for production)
  - [ ] AWS Lambda functions structure
  - [ ] AWS AppSync API or API Gateway WebSocket (for real-time)
- [ ] **Database Schema**:
  - [ ] Choose ORM (Prisma recommended)
  - [ ] Create core tables: customers, projects, page_content
  - [ ] Run initial migrations
  - [ ] Set up seed data (optional)
- [ ] **Custom Refine Providers**:
  - [ ] Custom AWS data provider (RDS PostgreSQL)
  - [ ] Custom AWS Cognito auth provider
- [ ] **Design System**:
  - [ ] Tailwind CSS configuration (Blue, Gold, Silver color palette)
  - [ ] Ant Design theme customization
- [ ] **Polar Setup**:
  - [ ] Polar account configuration (get from https://polar.sh)
  - [ ] Polar API client setup (server and client-side)
  - [ ] Configure payout account (uses Stripe Connect Express for payouts)
- [ ] **Environment Validation**:
  - [ ] Environment variable validation utility
  - [ ] Verify all required variables are set

**Deliverable**: Working development environment with TDD infrastructure, AWS ecosystem configured, and design system

### Phase 2: Admin Panel & CMS (Weeks 2-3)
**Goal**: Build admin panel with full CMS capabilities and populate initial content

**Prerequisites**: Phase 1 complete (Foundation ready)

**Tasks**:
- [ ] **TDD: Write tests first for all features below** (applies throughout)
- [ ] **Admin Authentication & Authorization**:
  - [ ] Add role field to Customer model (admin/customer)
  - [ ] Admin login page and route protection
  - [ ] Admin logout functionality
- [ ] **Admin Dashboard**:
  - [ ] Dashboard layout with sidebar navigation
  - [ ] Statistics cards (projects, customers, invoices, revenue)
  - [ ] Quick actions (create project, quote, invoice, etc.)
- [ ] **Admin Projects CRUD** (`/admin/projects`):
  - [ ] Projects list with search, filters, pagination
  - [ ] Create/edit project forms
  - [ ] Image upload to S3 (multiple images)
  - [ ] Featured project toggle
  - [ ] Delete project with confirmation
- [ ] **Admin Content Management** (`/admin/content`):
  - [ ] WYSIWYG editor integration (react-quill or TinyMCE)
  - [ ] Page content CRUD (Home, About, Skills, Contact)
  - [ ] Structured content editor (flexible JSON)
  - [ ] Save draft / Publish workflow
  - [ ] Content preview
- [ ] **Public Portfolio Pages** (read from DB):
  - [ ] Home page with dynamic content
  - [ ] Projects page with filters and search
  - [ ] Skills page
  - [ ] About page
  - [ ] Contact page
- [ ] **Admin Settings** (`/admin/settings`):
  - [ ] General settings (site name, email, company info)
  - [ ] Feature flags management
- [ ] **Blog Structure** (optional, hidden until ready):
  - [ ] Blog database schema
  - [ ] Basic blog CRUD (can be hidden via feature flag)
- [ ] **Content Creation**:
  - [ ] Gather project information
  - [ ] Build projects via admin panel
  - [ ] Edit all page content via admin
  - [ ] Add professional headshot (`img/Destin-L-Mincy__HEADSHOT.png`)
  - [ ] Test full CMS workflow

**Deliverable**: Fully functional admin panel with CMS, public portfolio pages displaying dynamic content, initial content populated


### Phase 3: Authentication & Customer Portal (Week 5)
**Goal**: Implement authentication system and customer portal foundation

**Prerequisites**: Phase 1 complete (AWS Cognito configured), Phase 2 complete (Admin panel ready)

**Tasks**:
- [ ] **TDD: Write tests first for all features below** (applies throughout)
- [ ] **Customer Authentication (AWS Cognito)**:
  - [ ] AWS Cognito User Pool configuration
  - [ ] Custom Refine Cognito auth provider implementation
  - [ ] Email/password authentication
  - [ ] OAuth providers (Google, Facebook, LinkedIn, GitHub optional):
    - [ ] OAuth configuration in Cognito
    - [ ] OAuth provider UI buttons/components
  - [ ] Account linking (OAuth + email/password)
  - [ ] User sync from Cognito to RDS (customers table)
- [ ] **Dashboards**:
  - [ ] Customer Dashboard (`/dashboard`): Widgets (balance, quotes, invoices, contracts, payments), layout, navigation
  - [ ] Admin Dashboard (`/admin`): Analytics widgets (revenue, customers, quotes, invoices), charts (Recharts)
  - [ ] Widget data fetching (populated in Phase 5)
- [ ] **Access Control**:
  - [ ] Protected routes & middleware
  - [ ] Role-based access control (admin/customer/guest)
  - [ ] User role management (admin panel)
- [ ] **E2E Tests**: Authentication flows (email/password, OAuth, role-based access)

**Deliverable**: Working authentication system (email/password + OAuth), protected routes, customer/admin dashboards (structure ready for data)

### Phase 4: Quotes/Estimates System (Week 6)
**Goal**: Build quotes/estimates system with hourly rate management, initial/final quote workflow, and quote-to-contract integration

**Prerequisites**: Phase 3 complete (Authentication & customer portal ready)

**Tasks**:
- [ ] **TDD: Write tests first for all features below** (applies throughout)
- [ ] **Database Schema**:
  - [ ] quotes, quote_items, hourly_rates tables
  - [ ] Add quote_id to contracts table (for tracking)
  - [ ] Add quote_id to invoices table (optional, for tracking)
- [ ] **Hourly Rate Management**:
  - [ ] Admin settings page for hourly rates (`/admin/settings/hourly-rates`)
  - [ ] Base hourly rate configuration
  - [ ] Project type rates (website, e-commerce, AI integration, etc.)
  - [ ] Complexity multipliers (Low: 1.0x, Medium: 1.25x, High: 1.5x)
  - [ ] Default rate selection
  - [ ] Rate override capability per quote
- [ ] **Initial Quote Creation**:
  - [ ] Admin UI (`/admin/quotes/create`): Create initial quote
  - [ ] Quote form: Customer selection, project details, rough estimate
  - [ ] Quote numbering system (QUOTE-YYYY-### format)
  - [ ] Quote expiration date (default 30 days, configurable)
  - [ ] Save as draft or send to client
  - [ ] Email quote to client
- [ ] **Planning Session Integration**:
  - [ ] Link planning session to quote (meeting booking integration)
  - [ ] Mark planning session as completed
  - [ ] Planning session notes field
  - [ ] Create final quote from initial quote
- [ ] **Final Quote Creation**:
  - [ ] Admin UI: Create final quote from initial quote
  - [ ] Enter exact hours needed (32-hour work week basis)
  - [ ] Select complexity level (Low/Medium/High)
  - [ ] System calculates: hourly rate (based on complexity) × hours = total price
  - [ ] Timeline calculation: estimated hours ÷ 32 = weeks
  - [ ] Final quote includes: hourly rate, estimated hours, timeline, total price
  - [ ] Quote line items (similar to invoice items)
  - [ ] Send final quote to client
- [ ] **Quote Management**:
  - [ ] Admin quotes list (`/admin/quotes`): View all quotes, filters, status tracking
  - [ ] Quote detail page: View, edit, duplicate, delete
  - [ ] Quote status workflow: `draft` → `sent` → `approved`/`rejected` → `contract_created` → `expired`
  - [ ] Quote revision workflow: Initial quote → Final quote (parent_quote_id linking)
- [ ] **Client Quote Portal**:
  - [ ] Client quotes list (`/quotes`): View quotes, filters, status
  - [ ] Quote detail page (`/quotes/:id`): View full quote, approve/reject
  - [ ] Quote approval workflow: Client reviews → approves/rejects
  - [ ] Quote PDF download
  - [ ] Quote expiration notifications
- [ ] **Quote PDF Generation**:
  - [ ] PDF template system (reuse invoice PDF templates)
  - [ ] Quote PDF includes: Quote number, customer info, line items, hourly rate, estimated hours, timeline, total, terms
  - [ ] Download functionality
  - [ ] Email attachment
- [ ] **Quote Templates**:
  - [ ] Multiple quote templates
  - [ ] Custom branding (logo, colors)
  - [ ] Template preview
  - [ ] Template selection per quote
- [ ] **Quote → Contract Integration**:
  - [ ] "Create Contract from Quote" button (appears when final quote is approved)
  - [ ] Quote data transfer to contract generation:
    - [ ] Project scope → contract scope
    - [ ] Pricing → contract pricing
    - [ ] Terms → contract terms
    - [ ] Timeline → contract timeline
  - [ ] Link contract to quote (`contract.quote_id`)
  - [ ] Update quote status to `contract_created`
  - [ ] Integration with AI contract generation (n8n workflow)
- [ ] **Quote → Invoice Integration** (optional, for quick projects):
  - [ ] Convert approved quote directly to invoice (skip contract)
  - [ ] Link invoice to quote (`invoice.quote_id`)
- [ ] **Nora AI Integration** (Phase 8):
  - [ ] Nora can help create quotes (function calling)
  - [ ] Nora can answer questions about quotes
  - [ ] Quote status queries for authenticated users
- [ ] **Integration Tests**: Initial quote → Planning session → Final quote → Contract workflow

**Deliverable**: Complete quotes/estimates system with hourly rate management, initial/final quote workflow, planning session integration, and quote-to-contract conversion

### Phase 5: Invoices, Contracts & Payments (Week 6.5)
**Goal**: Build core invoice and contract management system with payment integration (contracts can be generated from quotes)

**Prerequisites**: Phase 4 complete (Quotes system ready), Phase 3 complete (Authentication & customer portal ready)

**Tasks**:
- [ ] **TDD: Write tests first for all features below** (applies throughout)
- [ ] **Database Schema**:
  - [ ] invoices, invoice_items, contracts, contract_requests, project_files tables
  - [ ] Add invoice_number, currency fields to invoices
  - [ ] Add client request and two-way signing fields to contracts
  - [ ] Add customer_id to projects table
- [ ] **Invoice Management**:
  - [ ] Invoice CRUD (admin & customer views)
  - [ ] Invoice numbering system (customizable format, sequential logic)
  - [ ] Invoice PDF generation (template system, download)
  - [ ] Invoice templates (multiple templates, custom branding, preview)
- [ ] **AI Contract Generation (n8n Agent)**:
  - [ ] n8n AI Agent workflow setup:
    - [ ] Create workflow for contract generation
    - [ ] Set up `N8N_WEBHOOK_CONTRACT_GENERATION` webhook
    - [ ] Configure AI Agent with contract templates and legal clauses
    - [ ] Input: client info, project details, scope, pricing, terms (from quote if available)
    - [ ] Output: PDF-ready contract document
  - [ ] Contract generation API endpoint:
    - [ ] Accept quote_id (preferred) OR client_id, project_id, contract type
    - [ ] If quote_id provided: Fetch quote data (scope, pricing, terms, timeline)
    - [ ] If no quote_id: Fetch client/project information from database
    - [ ] Send to n8n webhook → receive generated contract
    - [ ] Save to database → link to quote if applicable → return for review
  - [ ] Admin UI (`/admin/contracts/generate`):
    - [ ] Contract generation form (select quote OR client/project, contract type)
    - [ ] "Generate from Quote" option (shows approved quotes)
    - [ ] Preview generated contract
    - [ ] Edit contract (manual override)
    - [ ] Save and send to DocuSign
- [ ] **Client-Initiated Contract Requests**:
  - [ ] Contract request form (customer portal `/contracts/request`):
    - [ ] Form fields (project details, scope, pricing, terms, timeline)
    - [ ] Validation and submission → save to database
  - [ ] Contract request via Nora (Phase 8 integration):
    - [ ] Add `request_contract` function to Nora
    - [ ] Nora collects project details via conversation
    - [ ] Submit to same API endpoint as form
  - [ ] Contract generation from request:
    - [ ] Auto-generate contract when request submitted (via n8n AI Agent)
    - [ ] Link contract to request
  - [ ] Two-way signing workflow:
    - [ ] Client signs first (DocuSign embedded signing)
    - [ ] Admin receives notification → review in admin UI
    - [ ] Admin approval/rejection → if approved: admin signs
    - [ ] Both parties notified when fully signed → deliver signed contract
  - [ ] Admin contract review UI (`/admin/contracts/requests`):
    - [ ] View pending contract requests
    - [ ] Review generated contract
    - [ ] Approve/reject with comments
    - [ ] Sign approved contracts
- [ ] **Client File Uploads for Projects**:
  - [ ] File upload API endpoint:
    - [ ] Accept file uploads (AWS S3)
    - [ ] Validate file types and sizes
    - [ ] Store file metadata in database → link to projects/customers
  - [ ] Customer portal file upload UI (`/projects/:id`):
    - [ ] File upload interface (drag-and-drop or file picker)
    - [ ] File category selection (logo, assets, documentation, etc.)
    - [ ] File description/notes
    - [ ] Upload progress indicator
  - [ ] Project file library (customer portal):
    - [ ] Display all files for a project
    - [ ] File filtering by category
    - [ ] File preview/download/deletion (with permissions)
  - [ ] Admin file management (`/admin/projects/:id/files`):
    - [ ] View all client-uploaded files
    - [ ] Download/organize files by project
- [ ] **DocuSign Integration**:
  - [ ] DocuSign OAuth setup
  - [ ] Contract creation, sending, embedded signing
  - [ ] Webhook handlers for contract status updates
  - [ ] Contract status tracking
  - [ ] Integration with AI-generated contracts (seamless flow)
- [ ] **Customer Portal Pages**:
  - [ ] Payment Methods page (`/payment-methods`): Polar integration, add/remove/set default
  - [ ] Account Settings page (`/profile`): Profile management, billing address, password change
- [ ] **Payment Integration**:
  - [ ] Polar payment form integration: Secure payment form UI, card validation
  - [ ] Payment creation: API route, amount validation, Polar API integration
  - [ ] Payment flow: Invoice → payment → confirmation, success/failure handling
  - [ ] Polar webhook handlers: Signature verification, payment status webhooks, error handling
  - [ ] Payment status updates: Database updates, invoice status sync
  - [ ] Receipt generation: PDF template, email receipt
  - [ ] Security audit: PCI compliance verification (handled by Polar), webhook security review
- [ ] **Integration Tests**: Invoice → contract → payment flow

**Deliverable**: Complete invoice and contract management system with payment integration, AI contract generation, client-initiated contract requests, two-way signing workflow, and client file uploads

### Phase 6: Client Project Repository & Git Integration (Week 7)
**Goal**: Implement client-accessible project repositories 100% hosted on AWS CodeCommit (closed-source by default), with file browser and code visibility control

**Prerequisites**: Phase 5 complete (Projects and file management ready), Phase 1 complete (AWS infrastructure ready)

**Tasks**:
- [ ] **TDD: Write tests first for all repository features** (applies to all sections below)
- [ ] **Foundation Setup**:
  - [ ] Database schema: project_repositories, repository_files, repository_commits tables
  - [ ] AWS CodeCommit service setup and configuration
  - [ ] IAM roles and policies for CodeCommit access (admin full access, client read-only)
  - [ ] CodeCommit API credentials setup (IAM credentials via Secrets Manager or IAM roles)
  - [ ] Repository naming convention (e.g., `project-{project_id}`)
- [ ] **CodeCommit API Integration** (shared across features):
  - [ ] CodeCommit API client setup (`@aws-sdk/client-codecommit`)
  - [ ] API methods: `CreateRepository`, `GetFile`, `GetFolder`, `ListBranches`, `GetCommit`, `ListCommits`
  - [ ] Error handling and retry logic
  - [ ] Rate limiting on API calls
- [ ] **Repository Management**:
  - [ ] Create CodeCommit repository per project (private by default, via `CreateRepository` API)
  - [ ] Store repository metadata: ARN, clone URLs (HTTP/SSH), name
  - [ ] Auto-create repository when project starts
  - [ ] Repository initialization (initial commit, README, .gitignore)
  - [ ] Repository deletion/archival (if needed)
- [ ] **Code Visibility & Security**:
  - [ ] File type detection (code vs. non-code files by extension: .js, .ts, .py, .php, etc.)
  - [ ] Visibility rules: project status + payment status → code visibility
  - [ ] Backend API filtering (enforce visibility server-side, not just frontend)
  - [ ] Admin override capability
  - [ ] IAM-based repository access control (project owner only)
  - [ ] Private repository enforcement (CodeCommit repositories are private by default)
- [ ] **Commit Tracking & History**:
  - [ ] Parse git commit history using CodeCommit API (`GetCommit`, `ListCommits`)
  - [ ] Store commits in database (hash, message, author, date, files changed)
  - [ ] Real-time commit updates (poll CodeCommit API or CloudWatch events)
  - [ ] Commit history viewer UI component
  - [ ] Commit diff view (for non-code files or after payment)
  - [ ] Filter/search commits
- [ ] **File System Browser**:
  - [ ] Backend API: Fetch file tree from CodeCommit (`GetFile`, `GetFolder`, `ListBranches`)
  - [ ] File tree component (react-tree-view or similar)
  - [ ] Display file structure (folders, file names, sizes, metadata)
  - [ ] Code file visibility indicators (locked/hidden)
  - [ ] File preview modal (for non-code files)
  - [ ] File download (based on visibility rules, serve via signed URLs)
  - [ ] Search files/folders
- [ ] **Client Notifications**:
  - [ ] Notification on new commits (triggered by commit tracking)
  - [ ] Email notification (via existing email system)
  - [ ] In-app notification (via existing notification system)
  - [ ] Notification content (commit message, files changed, commit date)
- [ ] **Download System**:
  - [ ] Generate ZIP package from CodeCommit repository on project completion
  - [ ] Store ZIP in S3 (or generate on-demand)
  - [ ] Download button (only when project complete + paid)
  - [ ] Secure download URLs (signed S3 URLs)
- [ ] **Admin UI** (`/admin/projects/:id/repository`):
  - [ ] Create/manage CodeCommit repositories
  - [ ] View all files (no restrictions for admin)
  - [ ] Unlock code visibility manually (if needed)
  - [ ] Set open-source licensing (if contractually specified)
  - [ ] Repository access management (IAM policies)
- [ ] **Client UI** (`/projects/:id/repository`):
  - [ ] Repository browser tab in project detail page
  - [ ] File system view (with code visibility control)
  - [ ] Git commit history tab
  - [ ] Download button (when unlocked)
- [ ] **System Integrations**:
  - [ ] Payment system: Check payment status → unlock code when project complete + paid
  - [ ] Project status: Auto-create repository when project starts, update visibility on status change
  - [ ] Contracts: Check for open-source licensing terms → set repository open-source flag if specified
- [ ] **E2E Tests**:
  - [ ] Create CodeCommit repository → commit → client notification
  - [ ] Client file browser access with code visibility
  - [ ] Code visibility before/after payment
  - [ ] Download final product
  - [ ] Open-source repository (if contractually specified)
  - [ ] IAM access control validation

**Deliverable**: Complete client project repository system 100% hosted on AWS CodeCommit (closed-source by default), with file browser, code visibility control, git commit history, download functionality, and optional open-source licensing support

### Phase 7: Project Milestones & Deliverables (Week 8)
**Goal**: Implement milestone tracking system with deliverables linked to repository files/commits

**Prerequisites**: Phase 6 complete (Repository system ready), Phase 4 complete (Quotes system ready)

**Tasks**:
- [ ] **TDD: Write tests first for all features below** (applies throughout)
- [ ] **Database Schema**:
  - [ ] project_milestones, milestone_deliverables tables
  - [ ] Add milestone_id to invoices table (optional, for milestone-based payments)
- [ ] **Milestone Management (Admin)**:
  - [ ] Admin UI (`/admin/projects/:id/milestones`): Create/edit/delete milestones
  - [ ] Milestone form: Name, description, due date, start date, order/sequence, milestone amount (for per-milestone payments)
  - [ ] Payment model selection: Full upfront payment OR per-milestone payment
  - [ ] Milestone status workflow: `pending` → `payment_required` → `in_progress` → `completed` → `code_released` → `approved`/`rejected`
  - [ ] Payment tracking: Mark payment as received, link to invoice
  - [ ] Completion percentage tracking
  - [ ] Milestone ordering/sequencing
- [ ] **Deliverables Management (Admin)**:
  - [ ] Create deliverables for each milestone
  - [ ] Deliverable types: `file` (specific file in repository), `commit` (specific git commit), `feature` (description-based)
  - [ ] Link deliverables to repository:
    - [ ] File deliverables: Link to repository file path (e.g., `/src/components/Header.tsx`)
    - [ ] Commit deliverables: Link to git commit hash
    - [ ] Feature deliverables: Text description (can be linked to commits later)
  - [ ] Deliverable status: `pending` → `completed` → `verified`
  - [ ] Mark deliverables as completed when files/commits are ready
- [ ] **Repository Integration & Code Release**:
  - [ ] Link deliverables to repository files (file path matching)
  - [ ] Link deliverables to git commits (commit hash matching)
  - [ ] Repository browser shows milestone indicators on files/commits
  - [ ] Click deliverable → navigate to linked file/commit in repository
  - [ ] Auto-detect completion: When file is committed or commit is made, mark deliverable as completed
  - [ ] **Milestone Code Release Logic**:
    - [ ] When milestone is completed AND payment received: Release code/files for that milestone
    - [ ] Code visibility per milestone: Only show code for milestones that are paid and completed
    - [ ] Repository browser filters: Show/hide code based on milestone payment status
    - [ ] Code release notification: Notify client when milestone code is released
    - [ ] Admin can manually release code for a milestone (if payment received)
- [ ] **Client Milestone Portal**:
  - [ ] Client milestones list (`/projects/:id/milestones`): View all milestones with status
  - [ ] Milestone detail view: See deliverables, linked files/commits, progress, payment status
  - [ ] Payment status display: Show if milestone payment is required/received
  - [ ] Deliverables view: List of deliverables with links to repository files/commits
  - [ ] Click deliverable → opens repository browser at linked file/commit (if code is released)
  - [ ] Code release indicator: Show which milestones have code released
  - [ ] Milestone approval workflow: Client can approve/reject completed milestones (after code is released)
  - [ ] Visual progress indicators (completion percentage, status badges, payment status)
  - [ ] Payment prompt: If milestone requires payment, show payment button/link
- [ ] **Timeline/Gantt View**:
  - [ ] Timeline component showing milestones with dates
  - [ ] Visual progress bars for each milestone
  - [ ] Gantt chart view (optional, can use library like `react-gantt-chart`)
  - [ ] Milestone dependencies (optional)
- [ ] **Milestone-Based Payments**:
  - [ ] Link milestones to invoices (milestone_id in invoices table)
  - [ ] **Payment Models**:
    - [ ] Full upfront payment: Single invoice for entire project (all milestones)
    - [ ] Per-milestone payment: Generate invoice per milestone before work begins
  - [ ] Payment required before milestone starts: Block milestone from `in_progress` until payment received
  - [ ] Auto-generate invoice for next milestone (if per-milestone model)
  - [ ] Milestone payment tracking: Mark payment as received, update milestone status
  - [ ] Payment status affects code visibility: Code only released after payment received
  - [ ] Payment confirmation: Update milestone status when payment is received
- [ ] **Notifications**:
  - [ ] Notify client when milestone payment is required (if per-milestone model)
  - [ ] Notify client when milestone payment is received
  - [ ] Notify client when milestone is marked completed
  - [ ] Notify client when milestone code is released (after payment + completion)
  - [ ] Notify admin when client approves/rejects milestone
  - [ ] Notify client when deliverable is completed
- [ ] **Activity Feed Integration**:
  - [ ] Milestone status changes appear in project activity feed
  - [ ] Deliverable completions appear in activity feed
  - [ ] Link activity items to milestones/deliverables
- [ ] **Integration with Quotes/Contracts**:
  - [ ] Milestones can be defined in final quote (optional)
  - [ ] Milestones can be included in contract (optional)
  - [ ] Payment model selection (full upfront vs per-milestone) in quote/contract
  - [ ] Link milestones to quote/contract for reference
- [ ] **Code Visibility System Integration**:
  - [ ] Update repository code visibility logic to be milestone-based
  - [ ] Code files visible only for milestones that are: completed + paid + code released
  - [ ] Repository browser filters code by milestone payment status
  - [ ] Admin override: Can manually release code if needed
- [ ] **Integration Tests**: 
  - [ ] Milestone creation → Payment required → Payment received → Work begins → Deliverable completion → Code release → Client approval workflow
  - [ ] Full upfront payment model: All milestones accessible after full payment
  - [ ] Per-milestone payment model: Each milestone requires individual payment

**Deliverable**: Complete milestone tracking system with payment-first model (full upfront or per-milestone), milestone-based code release, deliverables linked to repository files/commits, client approval workflow, and timeline view

### Phase 8: Project Features (Week 8.5-9)
**Goal**: Implement project status updates, activity feed, testimonials, expense tracking, collaboration, and completion certificates

**Prerequisites**: Phase 7 complete (Milestones ready), Phase 6 complete (Repository ready)

**Tasks**:
- [ ] **TDD: Write tests first for all features below** (applies throughout)
- [ ] **Database Schema**:
  - [ ] project_status_updates, project_activity_log tables
- [ ] **Status Updates (Admin)**:
  - [ ] Admin UI: Post status updates to projects (`/admin/projects/:id`)
  - [ ] Status update form: Status type (design/development/testing/deployment/completed), title, description
  - [ ] Status categories: `design`, `development`, `testing`, `deployment`, `completed`
  - [ ] Save status update → create activity log entry
- [ ] **Activity Feed System**:
  - [ ] Activity log component: Display all project activity
  - [ ] Activity types: Status updates, milestone changes, deliverable completions, commits, messages, payments
  - [ ] Activity feed API: Fetch and filter activities by project
  - [ ] Real-time updates: Activity feed updates when new activities occur
  - [ ] Activity metadata: Store additional context in JSON field
- [ ] **Client Activity Portal**:
  - [ ] Client activity feed (`/projects/:id/activity`): View all project activity
  - [ ] Activity timeline view: Visual timeline of project activity
  - [ ] Activity filtering: Filter by activity type, date range
  - [ ] Status indicators: Visual status badges/indicators
  - [ ] Activity details: Expandable activity items with full details
- [ ] **Status Indicators**:
  - [ ] Visual status badges for each status type
  - [ ] Progress indicators showing project status
  - [ ] Status history: View status change history
- [ ] **Notifications Integration**:
  - [ ] Notify client when status update is posted
  - [ ] Notify client when project status changes
  - [ ] Activity feed notifications (optional, can be disabled)
- [ ] **Integration with Existing Systems**:
  - [ ] Milestone status changes → activity log entry
  - [ ] Deliverable completions → activity log entry
  - [ ] Repository commits → activity log entry
  - [ ] Payment received → activity log entry
  - [ ] Messages → activity log entry (optional)
- [ ] **Activity Feed Component**:
  - [ ] Reusable activity feed component
  - [ ] Activity item rendering (different layouts for different activity types)
  - [ ] Infinite scroll or pagination
  - [ ] Activity grouping (by date, by type)
- [ ] **Integration Tests**: Status update creation → Activity log entry → Client notification → Activity feed display

- [ ] **Client Testimonials & Reviews**:
  - [ ] Database schema: testimonials table
  - [ ] Client testimonial form (`/testimonials/submit`): Project selection, rating, testimonial text
  - [ ] Testimonial submission via Nora (Phase 10 integration)
  - [ ] Admin testimonials management (`/admin/testimonials`): Approve/reject, feature testimonials
  - [ ] Portfolio display: Public testimonials component, featured testimonials section
  - [ ] Automated testimonial requests: Auto-request after project completion, reminder emails
- [ ] **Expense Tracking**:
  - [ ] Database schema: expenses, expense_categories tables
  - [ ] Expense categories management (`/admin/expenses/categories`)
  - [ ] Expense management (`/admin/expenses`): Create/edit expenses, receipt upload to S3
  - [ ] Expense-to-invoice integration: Mark billable, add to invoices, prevent double-billing
  - [ ] Expense reports: Generate reports by project/customer/category, export CSV/PDF
- [ ] **Enhanced Project Collaboration**:
  - [ ] Database schema: milestone_comments, milestone_requests, milestone_collaboration_submissions tables
  - [ ] Milestone-based comment system: Comments on visible deliverables only, file/code line comments
  - [ ] Milestone-based request system: Change requests on released milestones
  - [ ] One-time submission logic: Lock after submission until next milestone release
  - [ ] Admin review interface: View comments/requests, mark as reviewed/addressed
- [ ] **Project Completion Certificates**:
  - [ ] Database schema: project_certificates, certificate_templates tables
  - [ ] Certificate template management (`/admin/settings/certificate-templates`)
  - [ ] Automatic certificate generation: Trigger on project completion, PDF generation, repository commit
  - [ ] Certificate management: Admin view, client access, certificate verification (hash)
  - [ ] Repository integration: Commit certificate to project repository

**Deliverable**: Complete project features system (status updates, activity feed, testimonials, expenses, collaboration, certificates)


### Phase 9: Invoice Enhancements & Subscriptions (Week 10)
**Goal**: Add advanced invoice features and implement subscription management

**Prerequisites**: Phase 5 complete (Basic invoices and payments working)

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
  - [ ] Polar refund integration
  - [ ] Apply credit to invoices
- [ ] **Automated Invoice Follow-ups**:
  - [ ] Database schema (invoice_reminders, invoice_reminder_rules tables)
  - [ ] **Escalation Rules Configuration (Admin)**:
    - [ ] Admin settings page (`/admin/settings/invoice-reminders`): Configure reminder rules
    - [ ] Create/edit reminder rules: Days overdue, reminder type, email template, late fee percentage (optional)
    - [ ] Reminder schedule configuration (e.g., 3 days, 7 days, 14 days overdue)
    - [ ] Grace period settings (days before first reminder)
    - [ ] Enable/disable reminder rules
  - [ ] **Email Templates for Reminders**:
    - [ ] Create email templates for each escalation level
    - [ ] Template variables: Invoice details, days overdue, payment link, late fee amount
    - [ ] Template preview and testing
  - [ ] **Automated Reminder System**:
    - [ ] Automated job (n8n workflow or AWS Lambda + EventBridge):
      - [ ] Check for overdue invoices daily
      - [ ] Determine which reminder to send based on days overdue
      - [ ] Check if reminder already sent for this level
      - [ ] Send reminder email
      - [ ] Log reminder in database (invoice_reminders table)
      - [ ] Schedule next reminder if applicable
    - [ ] Reminder tracking: Track which reminders have been sent
    - [ ] Prevent duplicate reminders: Don't send same reminder twice
  - [ ] **Late Fee Automation** (optional):
    - [ ] Calculate late fees based on reminder rules
    - [ ] Auto-apply late fees to invoice (optional, configurable)
    - [ ] Late fee notification: Notify client when late fee is applied
    - [ ] Late fee reversal: Admin can reverse late fees if needed
  - [ ] **Payment Plan Offers** (optional):
    - [ ] Offer payment plans for overdue invoices (in reminder emails)
    - [ ] Link to payment plan creation in reminder email
  - [ ] **Integration with Email System**:
    - [ ] Use existing email template system
    - [ ] Use existing email notification infrastructure
    - [ ] Email delivery tracking for reminders
  - [ ] **Admin Reminder Management**:
    - [ ] View all sent reminders (`/admin/invoices/:id/reminders`)
    - [ ] Manual reminder trigger (admin can manually send reminder)
    - [ ] Reminder history per invoice
  - [ ] **Client Portal Integration**:
    - [ ] Show reminder status on invoice detail page
    - [ ] Show late fee information if applicable
  - [ ] **Integration Tests**: Overdue invoice detection → Reminder rule matching → Email sending → Reminder logging

- [ ] **Recurring Service Subscriptions**:
  - [ ] Database schema: subscription_tiers, subscriptions, subscription_usage, subscription_invoices tables
  - [ ] Subscription tiers management (`/admin/subscription-tiers`): Create/edit tiers, Polar Product/Price sync
  - [ ] Subscription management (`/admin/subscriptions`): View all subscriptions, analytics (MRR, churn), manual actions
  - [ ] Customer subscription portal (`/subscriptions`): View subscriptions, upgrade/downgrade, cancel/pause, billing history
  - [ ] Polar Subscriptions integration: Webhook handlers, lifecycle management, automatic billing
  - [ ] Usage tracking (optional): Track usage per period, display in portal
  - [ ] Email notifications: Subscription created, upgraded/downgraded, cancelled, payment succeeded/failed

**Deliverable**: Enhanced invoice system with recurring invoices, payment plans, tax, discounts, credits, automated follow-ups, and complete subscription management


### Phase 10: AI Features Integration (Week 10.5)
**Goal**: Implement Nora AI chat widget with smart navigation and function calling

**Prerequisites**: Phase 3 complete (Authentication working for guest/authenticated distinction)

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

### Phase 11: Email Notifications & Communication (Week 11)
**Goal**: Implement email notifications, in-app messaging, and notifications center

**Prerequisites**: Phase 5 complete (Invoices and payments working)

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
  - [ ] Payment confirmations
  - [ ] *Note: Automated invoice follow-ups with escalation rules implemented in Phase 8*
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

### Phase 12: Security & Audit (Week 11.5)
**Goal**: Implement security features and compliance

**Prerequisites**: Phase 3 complete (Authentication system in place)

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

### Phase 13: Meeting Booking System (Week 12)
**Goal**: Build complete meeting booking system with Google Calendar integration

**Prerequisites**: Phase 3 complete (Authentication), Phase 10 complete (Nora AI for booking integration)

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

### Phase 14: Additional Features (Week 12.5)
**Goal**: Add polish features (export, bulk ops, search, dark mode, meeting enhancements)

**Prerequisites**: Core features complete (Phases 1-12)

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

### Phase 15: Polish & Optimization (Week 13)
**Goal**: Optimize performance, accessibility, SEO, and security

**Prerequisites**: All feature phases complete (Phases 1-13)

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

### Phase 16: Deployment & Launch (Week 14)
**Goal**: Deploy to production and launch portfolio

**Prerequisites**: Phase 15 complete (Polish & optimization done)

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
- [ ] Polar webhooks (production):
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

### Phase 17: Customer Portal Launch (Week 15+)
**Goal**: Launch customer portal with beta testing

**Prerequisites**: Phase 16 complete (Portfolio launched)

**Tasks**:
- [ ] Beta testing with 1 current client
- [ ] Feedback & bug fixes
- [ ] Customer onboarding
- [ ] **Full Customer Portal Launch**

**Deliverable**: Fully operational customer portal with all features

### Phase 18: Post-Launch (Ongoing)
**Goal**: Monitor, maintain, and enhance the application

**Prerequisites**: Phase 17 complete (Full launch)

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

### Payment Architecture (Polar - Merchant of Record)
- **Frontend**: Polar secure payment forms
- **Backend**: Polar Payment API
- **Webhooks**: Payment event handling
- **Security**: PCI-compliant (handled by Polar), webhook signature verification
- **Tax Compliance**: Handled automatically by Polar as Merchant of Record
- **Payouts**: Managed through Polar dashboard (uses Stripe Connect Express for payouts)

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
5. ✅ **Payment Provider**: Polar (Merchant of Record)
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
17. ✅ **Polar Payment Processing**: Merchant of Record handles payments, tax compliance, and billing
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
- **Polar**: https://polar.sh/docs
  - [Getting Started](https://polar.sh/docs/getting-started)
  - [Payment API](https://polar.sh/docs/api/payments)
  - [Subscriptions](https://polar.sh/docs/api/subscriptions)
  - [Webhooks](https://polar.sh/docs/webhooks)
  - [Polar as Merchant of Record](https://polar.sh/docs/documentation/polar-as-merchant-of-record)
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
5. ⏭️ Set up Polar account (get from https://polar.sh)
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
- [ ] Polar account configured (Merchant of Record - get from https://polar.sh)
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
  - [ ] Fill in all API keys (Polar, OpenAI, DocuSign, Google Calendar, etc.)
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
