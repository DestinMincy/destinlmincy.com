# Portfolio Website - Project Plan

## Project Overview

### Purpose
Create a modern, professional portfolio website that showcases Destin L. Mincy's work as a Web Developer and AI Engineer. The site will highlight both traditional web development projects and AI-powered solutions, demonstrating expertise in Node.js, AI integration, and automation technologies.

### Goals
- Showcase professional work and personal projects
- Demonstrate technical skills across web development and AI
- Provide clear contact information and call-to-action
- Create a modern, responsive, and performant user experience
- Establish professional online presence
- **Full content management system (WordPress-like, but custom-built)**
- **Admin panel from day one** - manage all content without code changes
- **Future-proof architecture for customer portal and invoice management**
- Enable customer authentication and invoice payment functionality
- **Payment system architected from the start** - not an afterthought

### Target Audience
- Potential clients seeking web development services
- Companies looking for AI integration and automation solutions
- Recruiters and hiring managers
- Fellow developers and tech community
- **Existing customers (for portal access and invoice payments)**

---

## Technical Architecture

### Technology Stack

#### Primary Stack (Node.js + Refine Focus)
- **Runtime**: Node.js (Latest LTS)
- **Framework**: **Refine** (React-based framework for data-intensive applications)
  - Built-in authentication providers
  - Data providers for various backends
  - Perfect for customer portal and invoice management
  - Can be used with Next.js for SSR/SEO (Refine + Next.js)
- **Language**: TypeScript (Recommended for Refine and type safety)
- **UI Framework Options**:
  - Ant Design (Recommended - Refine's default, comprehensive components)
  - Material UI (MUI)
  - Chakra UI
  - Headless UI + Tailwind CSS (Custom design)
- **Styling**: 
  - Tailwind CSS (If using headless UI approach)
  - Ant Design's built-in styling (if using Ant Design)
  - CSS Modules (Alternative)

#### AI Integration Capabilities
- **AI Features to Demonstrate**:
  - AI-powered contact form (spam detection, smart responses)
  - AI-generated project descriptions (optional)
  - Interactive AI chat widget (showcase AI capabilities)
  - Automated content management

#### Development Tools
- **Package Manager**: npm or pnpm
- **Build Tool**: Vite or Next.js built-in
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library (if React)
- **Charting Library** (for dashboards):
  - Recharts (Recommended - React-native, works with Ant Design)
  - Chart.js with react-chartjs-2
  - Victory (React charting library)
  - Apache ECharts (via echarts-for-react)
- **Animation Libraries** (for portfolio pages):
  - Framer Motion (Recommended - React animation library, smooth and performant)
  - GSAP (Advanced animations, timeline control)
  - React Spring (Physics-based animations)
  - AOS (Animate On Scroll) - Simple scroll-triggered animations

#### Deployment & Hosting
- **Frontend Options**:
  - Vercel (Recommended if using Next.js + Refine)
  - Netlify (Great for static sites)
  - AWS Amplify
  - DigitalOcean App Platform
  - Self-hosted (Node.js server)
- **Backend Options** (if custom backend):
  - Railway (Easy PostgreSQL + Node.js deployment)
  - Render (PostgreSQL + Node.js)
  - DigitalOcean Droplets/App Platform
  - AWS (EC2, RDS, Lambda)
  - Heroku (if still using)

#### Database (Required for Customer Portal & CMS)
- **Supabase (PostgreSQL)** (Selected)
  - Relational database - best for invoices, users, payments, content
  - Structured data for invoices, customers, payments, projects, content
  - ACID compliance for financial transactions
  - Strong relationships between entities
  - Perfect for content management (projects, pages, settings)
  - Real-time subscriptions
  - Row Level Security (RLS) for access control

#### Backend/API Layer
- **Supabase** (Selected - PostgreSQL + Auth + Storage + Real-time)
  - Perfect integration with Refine
  - Built-in authentication
  - Row Level Security (RLS) for data access control
  - PostgreSQL backend (as requested)
  - Real-time capabilities
  - Storage for images/files
  - Auto-generated REST API

#### Authentication
- **Refine Auth Providers**:
  - Supabase Auth (Recommended - if using Supabase)
  - Auth0
  - Keycloak
  - Custom JWT-based auth
  - NextAuth.js (if using Next.js)

#### Payment Processing
- **Stripe** (Selected)
  - Payment processing
  - Invoice generation
  - Subscription management
  - Webhook support for payment events
  - **Must be architected from the start** - not an afterthought
  - Integration planned from Phase 1 (foundation)
- **PayPal** (Future consideration if needed)
  - PayPal Checkout
  - PayPal Invoicing API

---

## Site Structure & Pages

### Core Pages

#### 1. Home Page (`/`)
- **Purpose**: First impression, overview of who you are
- **Content** (Inspired by ZYAN template):
  - **Hero Section** (Large, engaging):
    - Name, title, and tagline with emphasis (e.g., "HI, I'M DESTIN! **Web Developer** **AI Engineer** **Problem Solver**")
    - Brief introduction (2-3 sentences)
    - Call-to-action buttons (Download CV, Watch Video, View Projects, Contact Me)
    - Optional: Video background or animated background
    - Smooth scroll indicator
  - **Services/What I Do Section**:
    - Key services with icons
    - Brief descriptions
    - Visual cards with hover effects
  - **About Preview Section**:
    - Brief about text
    - Key statistics (projects completed, clients, etc.)
    - Link to full About page
  - **Featured Projects Preview** (3-4 projects):
    - Interactive project cards
    - Hover effects and animations
    - Filter/category options
  - **Skills Highlight**:
    - Visual skill bars or icons
    - Technology logos/badges
  - **Testimonials Section** (if available):
    - Client testimonials
    - Carousel or grid layout
- **Design**: Modern, clean, engaging hero with smooth animations (inspired by ZYAN and Drake templates)
- **Animations**: Fade-in on scroll, parallax effects, hover interactions
- **Note**: Final design will combine the most effective elements from both templates

#### 2. Projects Page (`/projects`)
- **Purpose**: Detailed showcase of work
- **Content**:
  - Filterable project grid/list
  - Categories: Client Projects, Personal Projects, AI Projects
  - Each project card includes:
    - Project image/screenshot
    - Project title
    - Brief description
    - Technologies used (tags)
    - Links (Live demo, GitHub, Case study)
    - Date/Year
- **Features**:
  - Filter by category
  - Filter by technology
  - Search functionality
  - Project detail modal/page

#### 3. Skills Page (`/skills`)
- **Purpose**: Comprehensive skills showcase
- **Content** (Inspired by ZYAN template):
  - **Education & Experience Timeline** (optional):
    - Timeline of education and career milestones
    - Visual timeline with dates
  - **Skills Organized by Category**:
    - Core Technologies (Node.js focus)
    - AI & Machine Learning (detailed breakdown)
    - Frameworks & Libraries
    - Tools & Platforms
    - Soft Skills
  - **Visual Representation**:
    - Animated progress bars (fill on scroll)
    - Skill icons/badges with hover effects
    - Interactive skill cards
    - Percentage indicators
  - **Brief descriptions** of expertise level
- **Design**: Interactive, visual, easy to scan with smooth animations
- **Animations**: Progress bar animations, fade-in on scroll, hover effects

#### 4. About Page (`/about`)
- **Purpose**: Personal story and professional journey
- **Content**:
  - Professional background
  - Career journey/timeline
  - What drives you
  - Current focus areas
  - Professional photo
  - Resume/CV download link
- **Tone**: Professional yet personable

#### 5. Contact Page (`/contact`)
- **Purpose**: Multiple ways to get in touch
- **Content**:
  - Contact form (with AI-powered features)
  - Direct contact information:
    - Phone: 865-232-8702
    - Email: dlmincy@destinlmincy.com
    - Website: destinlmincy.com
  - Social media links (if applicable)
  - Availability status
  - Response time expectations
- **Features**:
  - Form validation
  - Spam protection (AI-powered)
  - Success/error messaging
  - Optional: Integration with email service (SendGrid, Resend, etc.)

### Customer Portal Pages (Future Phase)

#### 6. Login/Register (`/login`, `/register`)
- **Purpose**: Customer authentication
- **Content**:
  - Login form (email/password, or OAuth)
  - Registration form (for new customers)
  - Password reset functionality
  - "Remember me" option
- **Features**:
  - Secure authentication via Refine auth provider
  - Session management
  - Protected routes

#### 7. Customer Dashboard (`/dashboard`)
- **Purpose**: Customer portal home - comprehensive overview
- **Design Inspiration**: [Refine MUI Admin Dashboard](https://example.mui.admin.refine.dev) and [Refine HR Dashboard](https://hr.refine.dev/login) - adapted for customer view
- **Content** (Dashboard Widgets):
  - **Balance Summary Widget** (Large):
    - Total outstanding balance
    - Recent balance changes
    - Balance trend chart (line chart over time)
  - **Invoices Overview** (Medium):
    - Total invoices count
    - Pending invoices count
    - Paid invoices count
    - Overdue invoices count
    - Quick invoice list (recent 5)
  - **Contracts Overview** (Medium):
    - Active contracts count
    - Contract status summary (draft/sent/signed/expired)
    - Recent contracts list
    - Contract expiration dates
    - Pending signatures indicator
  - **Payment Summary** (Medium):
    - Total paid this month/year
    - Payment history chart (bar chart)
    - Recent payments list
  - **Quick Actions** (Small):
    - View All Invoices
    - Make Payment
    - View Contracts
    - Sign Pending Contracts
    - Update Profile
  - **Recent Activity Feed** (Medium):
    - Recent invoices created
    - Payment confirmations
    - Contract updates
    - System notifications
- **Features**:
  - Protected route (authentication required)
  - Real-time updates (if using Supabase real-time)
  - Interactive charts and visualizations
  - Responsive grid layout
  - Modern, data-rich design (inspired by Refine dashboard examples and provided dashboard image)
  - Follow Refine dashboard patterns for customer portal
  - Consistent with Refine's design system

#### 8. Contracts Page (`/contracts`)
- **Purpose**: View and manage customer contracts
- **Content**:
  - List of all customer contracts
  - Filter by status (Draft, Sent, Signed, Expired, Cancelled)
  - Sort by date, status, title
  - Search functionality
  - Each contract shows:
    - Contract number/title
    - Status (with DocuSign status if applicable)
    - Date sent
    - Date signed (if signed)
    - Expiration date
    - Actions (View Details, Sign Contract, Download)
- **Features**:
  - Refine data provider for CRUD operations
  - DocuSign embedded signing (if enabled)
  - Contract status tracking
  - Download signed contracts
  - View contract history

#### 9. Contract Detail Page (`/contracts/:id`)
- **Purpose**: Detailed contract view and signing
- **Content**:
  - Full contract details
  - Contract document preview
  - Signing status
  - Signing history
  - Actions:
    - Sign contract (via DocuSign embedded signing)
    - Download contract
    - View signing progress
- **Features**:
  - DocuSign embedded signing integration
  - Contract document display
  - Signing status updates
  - Real-time status updates (via webhooks)

#### 10. Invoices Page (`/invoices`)
- **Purpose**: View and manage invoices
- **Content**:
  - List of all customer invoices
  - Filter by status (Pending, Paid, Overdue, Cancelled)
  - Sort by date, amount, status
  - Search functionality
  - Each invoice shows:
    - Invoice number
    - Date issued
    - Due date
    - Amount
    - Status
    - Actions (View Details, Pay Now)
- **Features**:
  - Refine data provider for CRUD operations
  - Pagination
  - Export to PDF
  - Print functionality

#### 11. Invoice Detail Page (`/invoices/:id`)
- **Purpose**: Detailed invoice view and payment
- **Content**:
  - Full invoice details:
    - Invoice number, dates
    - Line items with descriptions
    - Subtotal, taxes, total
    - Payment terms
    - Status and payment history
  - Payment section:
    - Pay Now button (Stripe/PayPal integration)
    - Payment method selection
    - Payment history
- **Features**:
  - Secure payment processing
  - Invoice PDF download
  - Email invoice option
  - Payment confirmation

#### 12. Payment History (`/payments`)
- **Purpose**: View payment history
- **Content**:
  - List of all payments made
  - Filter by date range, invoice, status
  - Payment details:
    - Date paid
    - Amount
    - Invoice reference
    - Payment method
    - Receipt download
- **Features**:
  - Receipt generation
  - Export payment history

#### 11. Profile/Settings (`/profile`)
- **Purpose**: Customer account management
- **Content**:
  - Personal information (name, email, phone)
  - Billing address
  - Password change
  - Notification preferences
- **Features**:
  - Update profile information
  - Change password
  - Account deletion (optional)

#### 14. Payment Methods (`/payment-methods`)
- **Purpose**: Manage saved payment methods
- **Content**:
  - List of saved payment methods (cards, bank accounts)
  - Add new payment method
  - Set default payment method
  - Remove payment methods
  - Payment method security indicators
- **Features**:
  - Stripe Elements integration for secure card entry
  - PCI-compliant payment method storage
  - Default payment method selection
  - Payment method validation

#### 15. Account Settings (`/account-settings`)
- **Purpose**: Comprehensive account configuration
- **Content**:
  - Account information
  - Billing preferences
  - Notification settings
  - Security settings
  - Privacy settings
- **Features**:
  - All account settings in one place
  - Save preferences
  - Two-factor authentication (optional, future)

### Optional Pages

#### 12. Blog/Articles (`/blog`) - Future Enhancement (Architecture Ready)
- **Note**: Blog architecture will be built from the start, but pages can be hidden until ready
- Technical articles
- Project case studies
- AI/automation tutorials
- Industry insights
- **Admin Management**: Full blog CRUD via admin panel (when enabled)

#### 15. Services (`/services`) - If offering services
- Web Development Services
- AI Integration Services
- Automation Solutions
- Consulting Services

### Admin Pages (Required from Start - Content Management System)

#### 14. Admin Dashboard (`/admin`)
- **Purpose**: Central admin hub - comprehensive data overview
- **Design Inspiration**: [Refine MUI Admin Dashboard](https://example.mui.admin.refine.dev) and [Refine HR Dashboard](https://hr.refine.dev/login)
- **Content** (Dashboard Widgets - Data-Rich Layout):
  - **Revenue Summary Widget** (Large):
    - Total revenue (all-time, this month, this year)
    - Revenue trends (line chart over time)
    - Revenue by customer breakdown
    - Growth indicators
  - **Invoices Overview** (Medium):
    - Total invoices count
    - Pending invoices
    - Paid invoices
    - Overdue invoices
    - Invoice status chart (donut/pie chart)
    - Recent invoices list
  - **Customers Summary** (Medium):
    - Total customers count
    - Active customers
    - New customers (this month)
    - Customer growth chart (bar chart)
    - Recent customer activity
  - **Projects Overview** (Medium):
    - Total projects count
    - Published projects
    - Draft projects
    - Featured projects
    - Project views/engagement metrics
  - **Payment Analytics** (Medium):
    - Total payments received
    - Payments this month/year
    - Payment methods breakdown (chart)
    - Average payment amount
    - Payment success rate
  - **Website Analytics** (Medium):
    - Site visitors (if analytics integrated)
    - Page views
    - Popular pages
    - Traffic sources
  - **Quick Stats Cards** (Small Widgets):
    - Outstanding invoices amount
    - Pending payments
    - Active contracts
    - Recent activity count
  - **Recent Activity Feed** (Medium):
    - Recent invoices created
    - Recent payments received
    - New customer registrations
    - Content updates
    - System notifications
  - **Quick Actions** (Small):
    - Create Invoice
    - Create Contract
    - Add Project
    - Create Customer
    - View Reports
- **Features**:
  - Role-based access control (Admin only)
  - Real-time data updates
  - Interactive charts and visualizations
  - Export data functionality
  - Filter by date ranges
  - Modern, data-rich design (inspired by Refine dashboard examples and provided dashboard image)
  - Responsive grid layout
  - Dark/light theme support
  - Follow Refine dashboard patterns and component usage
  - Consistent with Refine's design system (Ant Design or MUI)

#### 15. Admin Projects (`/admin/projects`)
- **Purpose**: Manage portfolio projects (CRUD operations)
- **Content**:
  - List all projects
  - Create new projects
  - Edit existing projects
  - Delete projects
  - Upload project images
  - Set featured projects
- **Features**:
  - Rich text editor for descriptions
  - Image upload and management
  - Technology tags management
  - Category management
  - Preview before publishing
  - Draft/Save functionality

#### 16. Admin Content Management (`/admin/content`)
- **Purpose**: Manage ALL website content (pages, sections, blog - future)
- **Content**:
  - Edit Home page content
  - Edit About page content
  - Edit Skills section
  - Edit Contact page content
  - Edit Projects page content (intro text, etc.)
  - Manage site-wide settings
  - Edit navigation menu
  - **Blog Management** (prepared for future):
    - Create/edit blog posts
    - Manage blog categories and tags
    - Blog settings (posts per page, etc.)
- **Features**:
  - WYSIWYG editor (like WordPress)
  - Live preview
  - Version history (optional)
  - SEO meta tags editor
  - Content blocks/sections management
  - Media library integration
  - **Blog-ready**: Structure prepared for blog posts when needed

#### 17. Admin Invoices (`/admin/invoices`)
- **Purpose**: Create and manage invoices
- **Content**:
  - Create new invoices
  - Edit existing invoices
  - Send invoices to customers
  - Mark as paid
  - Generate reports
- **Features**:
  - Refine's built-in CRUD pages
  - Bulk operations
  - Invoice templates
  - Payment tracking

#### 18. Admin Customers (`/admin/customers`)
- **Purpose**: Customer management
- **Content**:
  - Customer list
  - Customer details
  - Create/edit customers
  - View customer invoices
- **Features**:
  - Full customer management
  - Customer communication history

#### 19. Admin Settings (`/admin/settings`)
- **Purpose**: Website configuration and settings
- **Content**:
  - Site information (name, description, contact info)
  - Social media links
  - Payment settings (Stripe keys, etc.)
  - **DocuSign settings** (API keys, OAuth configuration)
  - Email settings
  - SEO settings
  - Theme/color customization
- **Features**:
  - All configurable from admin panel
  - No code changes needed for basic updates

#### 20. Admin Contracts (`/admin/contracts`)
- **Purpose**: Create and manage customer contracts via DocuSign
- **Content**:
  - List all contracts
  - Create new contracts
  - Edit contract details
  - Send contracts via DocuSign
  - View contract status
  - Track signing progress
  - Download signed contracts
- **Features**:
  - DocuSign integration for contract creation
  - Contract templates management
  - Send contracts via DocuSign API
  - Embedded signing (optional - in-app signing)
  - Contract status tracking
  - Webhook integration for status updates
  - Full CRUD operations using Refine

---

## Features & Functionality

### Core Features

#### 1. Responsive Design
- Mobile-first approach
- Breakpoints: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- Touch-friendly interactions
- Optimized images (WebP, lazy loading)
- Refine's responsive components (if using Ant Design)

#### 2. Performance Optimization
- Fast page load times (< 3 seconds)
- Code splitting
- Image optimization
- Lazy loading for images and components
- Minimal JavaScript bundle size
- SEO optimization (meta tags, structured data)
- Refine's optimized data fetching

#### 3. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Proper semantic HTML
- ARIA labels where needed
- Color contrast compliance
- Ant Design components are accessible by default

#### 4. Interactive Elements & Animations (Inspired by ZYAN and Drake Templates)
- **Smooth scroll animations**:
  - Fade-in on scroll
  - Slide-in animations
  - Stagger animations for lists
  - Parallax scrolling effects
- **Hover effects** on project cards:
  - Scale transforms
  - Shadow effects
  - Color transitions
- **Loading states** with animations
- **Page transitions** (smooth, modern)
- **Micro-interactions**:
  - Button hover effects
  - Form field focus animations
  - Icon animations
  - Progress indicators
- **Video backgrounds** (optional, for hero sections)
- **Parallax effects** for depth and engagement
- **Nora AI Chat Widget** - Persistent floating chat bubble with smooth animations
- **Animation Libraries**:
  - Framer Motion (Recommended - React animation library)
  - GSAP (Advanced animations)
  - React Spring (Physics-based animations)
  - AOS (Animate On Scroll) - Simple scroll animations

#### 5. Authentication & Authorization
- Secure user authentication
- Role-based access control (Customer, Admin)
- Protected routes
- Session management
- Password reset functionality
- OAuth options (Google, GitHub, etc.)

#### 6. Data Management
- CRUD operations via Refine data providers
- Real-time updates (if using Supabase)
- Optimistic updates
- Error handling and retry logic
- Caching strategies
- **Dashboard Data Aggregation**:
  - Efficient data queries for dashboard widgets
  - Cached summary statistics
  - Real-time data refresh
  - Chart data formatting
  - Performance optimization for multiple widgets

#### 7. Payment Processing (Architected from Start)
- Secure payment integration (Stripe)
- Payment system designed from Phase 1
- Invoice generation
- Payment confirmation
- Receipt generation
- Webhook handling for payment events
- PCI compliance considerations
- Payment status tracking in database

#### 8. Content Management System (CMS) - Comprehensive
- WordPress-like content management
- **ALL content editable via admin panel** (no exceptions)
- No code changes needed for ANY content updates
- WYSIWYG editor for rich content
- Image/media management
- Project management via admin
- **Complete page content management** (Home, About, Skills, Contact, Projects)
- Settings management (all site settings)
- **Blog-ready architecture** (tables and admin interface prepared)
- Blog can be enabled/disabled via settings
- Version control (optional, future)
- Content blocks/sections for flexible page building

### AI-Powered Features (Showcase Your Skills)

#### 1. Nora AI Chat Widget (Primary AI Feature) ⭐
- **Persistent chat bubble** in bottom-right corner of all pages
- **AI Assistant Name**: Nora
- **Functionality**:
  - Click to open chat interface
  - Conversational AI assistant
  - Answers questions about services, projects, skills
  - Provides information about your work and expertise
  - Demonstrates AI integration capabilities
  - Can be minimized/maximized
  - **Chat History (Authentication-Based)**:
    - **Unauthenticated users**: Session-based chat history only (cleared on page refresh/close)
    - **Authenticated customers**: Full persistent chat history (stored in database)
    - **Authenticated customers**: Nora can access account information
      - View invoice details
      - Check payment status
      - Access contract information
      - Check contract status
      - Answer account-specific questions
- **Technical Implementation**:
  - OpenAI API (GPT-4 or Claude) for conversational AI
  - Custom prompt engineering for Nora's personality
  - Context about your services, skills, and projects
  - **For authenticated users**: Access to customer data via Refine data providers
  - **For authenticated users**: Database storage for chat history
  - Real-time streaming responses
  - Error handling and fallback messages
  - Security: Role-based access to customer data
- **UI/UX**:
  - Floating chat bubble (bottom-right)
  - Smooth open/close animations
  - Modern chat interface design
  - Typing indicators
  - Message history (session-based for guests, persistent for customers)
  - Mobile-responsive
  - Visual indicator when Nora has access to account info (for authenticated users)

#### 2. Smart Contact Form
- AI-powered spam detection
- Auto-categorization of inquiries
- Suggested responses
- Sentiment analysis

#### 3. Intelligent Project Recommendations (Future)
- AI suggests relevant projects based on visitor behavior
- Personalized content based on interests

#### 4. Automated Content Updates (Future)
- Integration with n8n/Zapier for automated workflows
- Auto-update project status
- Social media integration

---

## Design Considerations

### Design Inspiration
- **Portfolio Template References**:
  - [ZYAN Portfolio Template](https://codeefly.net/wp/zyan)
  - [Drake Personal Portfolio Template](https://preview.themeforest.net/item/drake-personal-portfolio-html/full_screen_preview/43789350)
- **Dashboard References** (Refine Examples):
  - [Refine MUI Admin Dashboard](https://example.mui.admin.refine.dev) - Material UI admin panel example
  - [Refine HR Dashboard](https://hr.refine.dev/login) - HR management dashboard example
- **Design Philosophy**: 
  - **Portfolio Pages**: Select the most efficient and appealing elements from ZYAN and Drake templates
  - **Dashboards**: Follow Refine dashboard patterns and best practices from official examples
  - Create a cohesive, modern design that best serves the portfolio's purpose while maintaining consistency with Refine's design patterns
- **Key Elements to Incorporate** (Best of Both):
  - **From ZYAN**:
    - Modern, clean design aesthetic
    - Smooth animations and transitions
    - Interactive portfolio showcases
    - Engaging hero sections with emphasis styling
    - Skills visualization with animated progress bars
    - Testimonials section design
  - **From Drake** (to evaluate and incorporate best elements):
    - Unique layout patterns and section arrangements
    - Creative navigation approaches
    - Effective use of whitespace and typography
    - Portfolio presentation styles
    - Contact form designs
    - Any innovative UI patterns
  - **Common Elements** (from both):
    - Video background options
    - Parallax scrolling effects
    - Creative typography and layouts
    - Modern card-based designs
    - Smooth scroll animations

### Visual Identity

#### Color Scheme
- **Primary Colors**: Blue, Gold, Silver
  - Blue: Primary brand color (professional, trustworthy)
  - Gold: Accent color (premium, achievement)
  - Silver: Secondary accent (modern, sophisticated)
- **Implementation**:
  - Blue for primary actions, headers, links
  - Gold for highlights, CTAs, achievements
  - Silver for secondary elements, borders, backgrounds
  - Consider dark mode support with these colors
  - Ensure accessibility: High contrast ratios (WCAG AA)
  - Create color palette variations (light/dark themes)

#### Typography
- Clean, readable fonts
- Heading hierarchy
- Font pairing (e.g., Inter + Playfair Display)

#### Imagery
- Professional photos
- Project screenshots
- Icons for technologies
- Consistent style throughout

#### Layout
- Clean, uncluttered design
- Generous white space
- Grid-based layouts
- Consistent spacing system
- **Modern Design Patterns** (inspired by ZYAN and Drake templates):
  - Hero sections with video/image backgrounds
  - Parallax scrolling effects
  - Creative section transitions
  - Interactive hover states
  - Smooth scroll animations
  - Modern card-based layouts
  - Effective use of whitespace
  - Creative navigation patterns
  - Unique layout arrangements (selecting best from both templates)

### User Experience (UX)

#### Navigation
- Clear, intuitive menu
- Sticky header (optional)
- Breadcrumbs for deep pages
- Mobile hamburger menu

#### User Flow
1. Land on Home → See overview
2. Navigate to Projects → Browse work
3. View Skills → Understand capabilities
4. Read About → Connect personally
5. Contact → Reach out

#### Call-to-Actions
- Clear, prominent CTAs
- Strategic placement
- Action-oriented language

---

## Content Strategy

### Project Showcases

#### Client Projects
- Project name
- Client (if allowed)
- Challenge/Problem
- Solution
- Technologies used
- Results/Impact
- Screenshots/demos
- Links (if public)

#### Personal Projects
- Project name
- Inspiration/Motivation
- Technologies explored
- Key features
- Learning outcomes
- Live demo link
- GitHub repository

#### AI Projects
- Project name
- AI technology used
- Problem solved
- Implementation details
- Results/Impact
- Technical deep-dive option

### Skills Content
- Organized by category
- Proficiency indicators (optional)
- Years of experience (optional)
- Certifications (if any)

---

## Development Phases

### Phase 1: Foundation & Setup (Week 1)
- [ ] Review [Refine Documentation](https://refine.dev/docs) and key concepts
- [ ] Project initialization (Refine + Next.js)
  - [ ] Follow [Refine Quick Start Guide](https://refine.dev/docs/getting-started/quickstart)
  - [ ] Set up Refine with Next.js (see [Refine + Next.js guide](https://refine.dev/docs/guides-and-concepts/routing/nextjs))
- [ ] Technology stack setup
- [ ] Development environment configuration
- [ ] Git repository setup
- [ ] Basic project structure
- [ ] Design system setup (Blue, Gold, Silver color palette)
- [ ] Supabase project setup and configuration
- [ ] Database schema design and initial migration
- [ ] Refine data provider configuration (Supabase)
  - [ ] Follow [Refine Supabase Data Provider guide](https://refine.dev/docs/data-provider/supabase)
- [ ] Refine auth provider setup (Supabase Auth)
  - [ ] Follow [Refine Authentication guide](https://refine.dev/docs/guides-and-concepts/authentication)
- [ ] Environment variables configuration
- [ ] Stripe account setup (test mode)
- [ ] Payment architecture planning (from the start)
- [ ] Admin panel foundation structure

### Phase 2: Admin Panel & Core Portfolio Pages (Weeks 2-3)
- [ ] Admin authentication and access control
- [ ] Admin dashboard layout
- [ ] Admin projects CRUD (Create, Read, Update, Delete)
  - Project creation form with rich text editor
  - Image upload functionality
  - Technology tags management
  - Featured project toggle
- [ ] Admin content management (ALL pages editable)
  - Home page editor
  - About page editor
  - Skills page editor
  - Contact page editor
  - Projects page editor (intro content)
  - WYSIWYG editor integration
  - Content preview functionality
  - Page status (published/draft)
- [ ] Admin blog management (structure ready, can be hidden)
  - Blog posts CRUD interface
  - Categories and tags management
  - Blog settings
  - Can be disabled/hidden until ready to use
- [ ] Admin settings page (site configuration)
  - All site settings editable
  - Blog enable/disable toggle
- [ ] Public Home page (reads from database)
- [ ] Public Projects page (reads from database via Refine)
- [ ] Skills page (reads from database)
- [ ] About page (reads from database)
- [ ] Contact page (reads from database + form)
- [ ] Navigation and routing
- [ ] Responsive design implementation
- [ ] Public/portfolio routing setup

### Phase 3: Content & Projects (Week 4)
- [ ] Gather project information
- [ ] Build projects via admin panel (test CMS functionality)
- [ ] Create project cards/components (public-facing)
- [ ] Add project images/screenshots via admin upload
- [ ] Write project descriptions (via admin panel)
- [ ] **Edit ALL page content via admin panel:**
  - Home page content
  - About page content
  - Skills section content
  - Contact page content
  - Projects page intro content
- [ ] Populate skills section (via admin panel)
- [ ] Add contact information (via admin settings)
- [ ] Test full content management workflow
- [ ] Verify all content is editable without code changes
- [ ] ✅ **Professional headshot**: Ready - located at `img/Destin-L-Mincy__HEADSHOT.png`
- [ ] **Blog structure**: Database tables created, admin interface ready (can be hidden until needed)

### Phase 4: Authentication & Customer Portal Foundation (Week 5)
- [ ] Customer authentication setup (Supabase Auth via Refine)
- [ ] Create login/register pages
- [ ] Implement protected routes (customer vs admin)
- [ ] **Build Customer Dashboard** (inspired by Refine examples):
  - [ ] Review [Refine MUI Admin Dashboard](https://example.mui.admin.refine.dev) patterns (adapted for customer view)
  - [ ] Review [Refine HR Dashboard](https://hr.refine.dev/login) patterns
  - [ ] Dashboard layout with widget grid
  - [ ] Balance summary widget with charts
  - [ ] Invoices overview widget
  - [ ] Contracts overview widget
  - [ ] Payment summary widget
  - [ ] Recent activity feed
  - [ ] Quick actions panel
  - [ ] Data aggregation queries
  - [ ] Follow Refine dashboard component patterns
  - [ ] Implement customer-friendly navigation and layout
- [ ] **Build Admin Dashboard** (inspired by Refine examples):
  - [ ] Review [Refine MUI Admin Dashboard](https://example.mui.admin.refine.dev) patterns
  - [ ] Review [Refine HR Dashboard](https://hr.refine.dev/login) patterns
  - [ ] Dashboard layout with comprehensive widget grid
  - [ ] Revenue summary widget with charts
  - [ ] Invoices overview widget
  - [ ] Customers summary widget
  - [ ] Projects overview widget
  - [ ] Payment analytics widget
  - [ ] Website analytics widget (if integrated)
  - [ ] Quick stats cards
  - [ ] Recent activity feed
  - [ ] Quick actions panel
  - [ ] Data aggregation queries
  - [ ] Follow Refine dashboard component patterns
  - [ ] Implement consistent navigation and layout structure
- [ ] Database schema for customers and invoices
- [ ] User role management (Customer, Admin)
- [ ] Session management
- [ ] Admin can create customer accounts (optional)

### Phase 5: Invoice & Contract Management System (Week 6)
- [ ] Invoice data models in Supabase
- [ ] Admin: Invoice creation interface (full CRUD)
- [ ] Admin: Invoice templates and bulk operations
- [ ] Customer: Invoices list page (Refine CRUD - filtered by customer)
- [ ] Customer: Invoice detail page
- [ ] Invoice filtering and search (both admin and customer)
- [ ] Invoice PDF generation
- [ ] Email invoice functionality (from admin panel)
- [ ] Payment integration preparation (Stripe setup)
- [ ] **Contract Management with DocuSign**:
  - [ ] Review [DocuSign API Documentation](https://developers.docusign.com/docs)
  - [ ] DocuSign account setup and OAuth configuration
  - [ ] Contract data models in Supabase (with DocuSign fields)
  - [ ] Admin: Contract creation interface (full CRUD)
  - [ ] Admin: Contract templates management
  - [ ] DocuSign integration:
    - [ ] Send contracts via DocuSign API
    - [ ] Embedded signing setup (optional)
    - [ ] Webhook handlers for contract status updates
    - [ ] Contract status tracking
  - [ ] Customer: Contracts list page (Refine CRUD - filtered by customer)
  - [ ] Customer: Contract detail page
  - [ ] Customer: Contract signing interface (DocuSign embedded signing)
  - [ ] Contract filtering and search
  - [ ] Download signed contracts
- [ ] **Customer Payment Methods Page**:
  - [ ] Payment methods list
  - [ ] Add payment method (Stripe Elements)
  - [ ] Set default payment method
  - [ ] Remove payment methods
- [ ] **Customer Account Settings Page**:
  - [ ] Account information form
  - [ ] Billing preferences
  - [ ] Notification settings
  - [ ] Security settings

### Phase 6: Payment Integration (Week 7)
- [ ] Review [Stripe Documentation](https://docs.stripe.com)
- [ ] Stripe account configuration (production ready setup)
- [ ] Follow [Stripe development quickstart](https://docs.stripe.com/development/quickstart)
- [ ] Payment architecture implementation (planned from Phase 1)
- [ ] **Stripe Elements integration** (see [Stripe Elements docs](https://docs.stripe.com/payments/elements)):
  - [ ] Payment form components
  - [ ] Card element for secure card entry
  - [ ] Payment method management
  - [ ] Save payment methods for future use
- [ ] **Payment Intent creation** (see [Payment Intents API](https://docs.stripe.com/payments/payment-intents)):
  - [ ] Backend API endpoint
  - [ ] Amount and currency handling
  - [ ] Customer association
  - [ ] Metadata for invoice tracking
- [ ] Build payment flow (invoice → payment → confirmation)
- [ ] **Stripe webhook handlers** (see [Webhooks guide](https://docs.stripe.com/webhooks)):
  - [ ] Webhook endpoint setup
  - [ ] Signature verification (see [Webhook signatures](https://docs.stripe.com/webhooks/signatures))
  - [ ] Handle payment_intent.succeeded
  - [ ] Handle payment_intent.payment_failed
  - [ ] Idempotency key implementation
- [ ] Payment status updates in database
- [ ] Payment confirmation pages
- [ ] Receipt generation and storage
- [ ] Payment history page (customer view)
- [ ] Admin payment tracking
- [ ] Test payment flows (see [Stripe Testing guide](https://docs.stripe.com/testing))
- [ ] Security audit for payment flow (see [Stripe Security guide](https://docs.stripe.com/security))

### Phase 7: AI Features Integration (Week 8)
- [ ] Set up AI API integrations (OpenAI/Claude)
- [ ] **Build Nora AI Chat Widget (Primary Feature)**
  - [ ] Create floating chat bubble component (bottom-right)
  - [ ] Design chat interface UI
  - [ ] Implement chat open/close functionality
  - [ ] Integrate OpenAI/Claude API
  - [ ] Create Nora's personality prompt/context
  - [ ] Add context about services, skills, projects
  - [ ] Implement streaming responses
  - [ ] Add typing indicators
  - [ ] **Authentication-aware chat history**:
    - [ ] Session-based storage for unauthenticated users (client-side only)
    - [ ] Database storage for authenticated users (chat_messages table)
    - [ ] Load chat history for authenticated users on login
  - [ ] **Customer account access for authenticated users**:
    - [ ] Integrate with Refine data providers to access customer data
    - [ ] Nora can query invoices, payments, contracts
    - [ ] Secure access control (only user's own data)
    - [ ] Context injection for account-specific queries
    - [ ] Visual indicator when Nora has account access
  - [ ] Mobile responsiveness
  - [ ] Error handling and fallbacks
  - [ ] Security: Ensure customer data is only accessible to account owner
- [ ] Implement smart contact form (AI spam detection)
- [ ] Configure automation workflows (n8n) - optional
- [ ] AI-powered invoice categorization (optional)
- [ ] Test all AI features
- [ ] Test Nora chat widget across all pages

### Phase 8: Polish & Optimization (Week 9)
- [ ] Performance optimization
- [ ] SEO implementation (for public pages)
- [ ] Accessibility audit and fixes
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Animation and transitions
- [ ] Error handling
- [ ] Security audit (authentication, payments, data protection)
- [ ] Payment flow testing (end-to-end)

### Phase 9: Deployment & Launch (Week 10)
- [ ] Set up hosting/deployment (Vercel for frontend)
- [ ] Database migration to production
- [ ] Configure production environment variables
- [ ] Set up payment webhooks (production)
- [ ] Configure domain
- [ ] SSL certificate setup
- [ ] Analytics integration (Google Analytics, etc.)
- [ ] Final testing in production
- [ ] Launch portfolio site!
- [ ] Soft launch customer portal (invite-only initially)

### Phase 10: Customer Portal Launch (Week 11+)
- [ ] Beta testing with 1 current client
- [ ] Gather feedback from initial client
- [ ] Fix bugs and issues
- [ ] Documentation for customers
- [ ] Onboard current client to portal
- [ ] Full customer portal launch (ready for additional clients)

### Phase 11: Post-Launch (Ongoing)
- [ ] Monitor performance
- [ ] Gather user feedback (portfolio and portal)
- [ ] Regular content updates (projects, blog)
- [ ] Add new projects
- [ ] Monitor payment processing
- [ ] Customer support for portal
- [ ] Security updates
- [ ] Feature enhancements based on feedback
- [ ] Admin panel improvements (if needed)

---

## Technical Decisions

### Framework Choice: Refine (Primary Framework)

**Why Refine?**
- **Perfect for data-intensive applications** - Built for CRUD operations
- **Built-in authentication** - Multiple auth providers out of the box
- **Data providers** - Works with Supabase, REST APIs, GraphQL, etc.
- **Admin panel ready** - Can build admin interfaces quickly
- **TypeScript first** - Excellent type safety
- **Component library integration** - Works with Ant Design, MUI, etc.
- **Future-proof** - Easy to add customer portal, invoices, admin panel
- **React-based** - Familiar if you know React
- **Open source** - Active community and good documentation

**Refine Architecture Options:**

1. **Refine + Next.js** (Recommended for SEO + Customer Portal)
   - Next.js for public pages (portfolio, blog)
   - Refine for authenticated pages (customer portal, admin)
   - Best of both worlds: SEO + data management
   - Can use Next.js API routes for custom endpoints

2. **Refine + Vite** (Alternative - SPA approach)
   - Faster development experience
   - Simpler setup
   - Good for internal/admin tools
   - Less SEO-friendly (but can use pre-rendering)

3. **Refine + Remix** (Alternative)
   - Full-stack React framework
   - Great data loading patterns
   - Good SEO support

**Recommendation**: Refine + Next.js for this project
- Public portfolio pages benefit from Next.js SSR/SSG
- Customer portal uses Refine's powerful data management
- Single codebase, unified routing

### UI Framework: Ant Design (Recommended with Refine)

**Why Ant Design?**
- **Refine's default UI framework** - Seamless integration
- **Comprehensive components** - Tables, forms, modals, etc. built-in
- **Perfect for admin/customer portals** - Professional look out of the box
- **Accessible** - WCAG compliant components
- **Well-documented** - Extensive examples
- **Enterprise-ready** - Used by many large companies
- **Theming support** - Can customize to match brand

**Alternative Options:**
- **Material UI (MUI)** - If prefer Material Design
- **Chakra UI** - Modern, accessible components
- **Headless UI + Tailwind** - Full design control, more work
- **Mantine** - Modern React components

**Recommendation**: Start with Ant Design, can customize theme to match portfolio aesthetic

### State Management

**Refine handles most state management:**
- **Data fetching state** - Handled by Refine data providers
- **Authentication state** - Handled by Refine auth provider
- **Form state** - Ant Design Form or React Hook Form
- **UI state** - React useState/useReducer
- **Global state** (if needed): Zustand or Jotai (lightweight)

**No need for Redux** - Refine's architecture reduces need for complex state management

### Form Handling

- **Ant Design Form** (Recommended - if using Ant Design)
  - Built-in validation
  - Works seamlessly with Refine
- **React Hook Form** (Alternative - if prefer)
  - Better performance for complex forms
  - Can integrate with Ant Design components
- **Form validation**: Zod (TypeScript-first) or Yup
- **Email service**: Resend, SendGrid, or Nodemailer

### Database Schema Design

**Core Tables Needed:**

1. **users** (if custom auth, or use Supabase auth.users)
   - id, email, name, password_hash, role, created_at, updated_at

2. **customers**
   - id, user_id (FK), company_name, contact_name, email, phone, billing_address, created_at, updated_at

3. **invoices**
   - id, customer_id (FK), invoice_number, issue_date, due_date, status (pending/paid/overdue/cancelled), subtotal, tax, total, notes, created_at, updated_at

4. **invoice_items**
   - id, invoice_id (FK), description, quantity, unit_price, amount, created_at

5. **payments**
   - id, invoice_id (FK), amount, payment_method, payment_date, transaction_id, status, receipt_url, created_at

6. **projects** (for portfolio - managed via admin)
   - id, title, description, category, technologies (JSON array), image_url, live_url, github_url, featured, status (draft/published), created_at, updated_at

7. **pages** (for content management - ALL pages editable)
   - id, slug, title, content (rich text), meta_title, meta_description, page_type (home/about/contact/projects/skills/custom), published, created_at, updated_at

8. **blog_posts** (prepared for future blog functionality)
   - id, title, slug, excerpt, content (rich text), featured_image, author_id (FK to users), status (draft/published/archived), published_at, meta_title, meta_description, created_at, updated_at

9. **blog_categories** (for blog organization)
   - id, name, slug, description, created_at

10. **blog_tags** (for blog tagging)
    - id, name, slug, created_at

11. **blog_post_categories** (many-to-many relationship)
    - id, post_id (FK), category_id (FK)

12. **blog_post_tags** (many-to-many relationship)
    - id, post_id (FK), tag_id (FK)

13. **settings** (site-wide configuration)
    - id, key, value, type, description, created_at, updated_at
    - Examples: site_name, contact_email, contact_phone, social_links (JSON), theme_colors (JSON), blog_enabled (boolean)

14. **media** (for uploaded images/files)
    - id, filename, url, file_type, file_size, alt_text, uploaded_by, created_at

15. **chat_messages** (for Nora chat history - authenticated users only)
    - id, user_id (FK to users - nullable for session-based), session_id (for guests), message, role (user/assistant), context_data (JSON - for account queries), created_at
    - Note: Only store messages for authenticated users; guests use session storage

16. **contracts** (for customer contracts with DocuSign integration)
    - id, customer_id (FK), contract_number, title, description, start_date, end_date, status (draft/sent/signed/expired/cancelled), document_url, docusign_envelope_id, docusign_status, signed_date, signed_by, created_at, updated_at

**Relationships:**
- Customer → User (one-to-one)
- Customer → Invoices (one-to-many)
- Customer → Contracts (one-to-many)
- Invoice → Invoice Items (one-to-many)
- Invoice → Payments (one-to-many)
- User → Media (one-to-many - who uploaded)
- User → Chat Messages (one-to-many - for authenticated users)
- User → Blog Posts (one-to-many - author)
- Project → Media (many-to-many - project images)
- Blog Post → Categories (many-to-many)
- Blog Post → Tags (many-to-many)

### Refine Implementation Strategy

#### Data Provider Setup
- **Recommended**: Supabase Data Provider
  - Native Refine integration (see [Refine Supabase documentation](https://refine.dev/docs/data-provider/supabase))
  - Real-time subscriptions
  - Row Level Security (RLS) for data access
  - Automatic API generation
  - Built-in support in Refine core
- **Alternative**: Custom REST Data Provider
  - Full control over API design
  - Works with any backend (NestJS, Express, etc.)
  - See [Refine REST Data Provider documentation](https://refine.dev/docs/data-provider/rest)

#### Authentication Provider Setup
- **Recommended**: Supabase Auth Provider
  - Email/password authentication
  - OAuth providers (Google, GitHub, etc.)
  - Magic links
  - Session management
- **Alternative**: Custom Auth Provider
  - JWT-based authentication
  - Custom login flow
  - Integration with existing auth system

#### Refine Resources Configuration
```typescript
// Example resource structure
resources: [
  {
    name: "projects", // Public portfolio projects
    list: "/projects",
    show: "/projects/:id",
    // No auth required - public
  },
  {
    name: "pages", // All website pages (editable via admin)
    list: "/admin/pages",
    create: "/admin/pages/create",
    edit: "/admin/pages/edit/:id",
    show: "/admin/pages/show/:id",
    // Auth required - admin only
  },
  {
    name: "blog-posts", // Blog posts (prepared for future)
    list: "/admin/blog",
    create: "/admin/blog/create",
    edit: "/admin/blog/edit/:id",
    show: "/admin/blog/show/:id",
    // Auth required - admin only
    // Can be hidden until blog is enabled
  },
  {
    name: "invoices", // Customer invoices
    list: "/invoices",
    show: "/invoices/:id",
    // Auth required - customer only
  },
  {
    name: "contracts", // Customer contracts
    list: "/contracts",
    show: "/contracts/:id",
    // Auth required - customer only
  },
  {
    name: "payments", // Payment history
    list: "/payments",
    show: "/payments/:id",
    // Auth required - customer only
  },
  {
    name: "admin-invoices", // Admin invoice management
    list: "/admin/invoices",
    create: "/admin/invoices/create",
    edit: "/admin/invoices/edit/:id",
    show: "/admin/invoices/show/:id",
    // Auth required - admin role only
  },
  {
    name: "admin-contracts", // Admin contract management
    list: "/admin/contracts",
    create: "/admin/contracts/create",
    edit: "/admin/contracts/edit/:id",
    show: "/admin/contracts/show/:id",
    // Auth required - admin role only
  }
]
```

#### Route Protection Strategy
- **Public Routes**: Home, Projects, Skills, About, Contact, Blog (when enabled)
- **Authenticated Routes**: Dashboard, Invoices, Contracts, Payments, Profile
- **Admin Routes**: 
  - Admin Dashboard
  - Admin Projects
  - Admin Pages (all content editing)
  - Admin Blog (can be hidden until enabled)
  - Admin Invoices
  - Admin Contracts
  - Admin Customers
  - Admin Settings
- Use Refine's `<Authenticated>` component for route protection (see [Refine Authentication docs](https://refine.dev/docs/guides-and-concepts/authentication))
- Role-based access control using Refine's `<CanAccess>` component (see [Refine Authorization docs](https://refine.dev/docs/guides-and-concepts/access-control))
- Blog routes can be conditionally rendered based on settings
- See [Refine Routing documentation](https://refine.dev/docs/guides-and-concepts/routing) for Next.js integration

### Contract Management Architecture

#### DocuSign Integration
- **Documentation**: [DocuSign API Documentation](https://developers.docusign.com/docs)
- **Key Resources**:
  - [Getting Started](https://developers.docusign.com/docs) - Initial setup and authentication
  - [Envelopes API](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/envelopes/) - For sending contracts
  - [Templates API](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/templates/) - For contract templates
  - [Embedded Signing](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/embedding/) - In-app signing experience
  - [Webhooks](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/webhooks/) - Contract status updates
  - [OAuth 2.0 Authentication](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/authentication/) - API authentication

1. **Authentication**
   - OAuth 2.0 setup for DocuSign API
   - Store access tokens securely
   - Token refresh handling
   - Admin configuration in settings

2. **Contract Creation (Admin)**
   - Create contract templates
   - Generate contracts from templates
   - Add recipients (customers)
   - Send contracts via DocuSign API
   - Store envelope ID in database

3. **Contract Signing (Customer)**
   - Embedded signing experience (optional)
   - Or redirect to DocuSign signing page
   - Track signing status
   - Real-time status updates via webhooks

4. **Webhook Handling**
   - `envelope.completed` - Contract signed
   - `envelope.declined` - Contract declined
   - `envelope.voided` - Contract cancelled
   - Update contract status in database
   - Notify admin of status changes

5. **Security Considerations**
   - Secure OAuth token storage
   - Webhook signature verification
   - Access control (only contract recipients can sign)
   - Audit trail for contract actions

### Payment Integration Architecture

#### Stripe Integration (Recommended)
- **Documentation**: [Stripe Documentation](https://docs.stripe.com)
- **Key Resources**:
  - [Payment Intents API](https://docs.stripe.com/payments/payment-intents) - For invoice payments
  - [Stripe Elements](https://docs.stripe.com/payments/elements) - Secure frontend UI components
  - [Webhooks](https://docs.stripe.com/webhooks) - Payment event handling
  - [Customer Portal](https://docs.stripe.com/billing/subscriptions/customer-portal) - Customer self-service (optional)
  - [Invoicing API](https://docs.stripe.com/invoicing) - Automated invoice generation (optional)

1. **Frontend (Refine Pages)**
   - Stripe Elements for payment forms (see [Stripe Elements docs](https://docs.stripe.com/payments/elements))
   - Create payment intent on invoice detail page
   - Handle payment confirmation
   - Payment method management (save cards for future use)

2. **Backend (Next.js API Routes or Custom Backend)**
   - Create payment intent endpoint (see [Payment Intents API](https://docs.stripe.com/payments/payment-intents))
   - Handle Stripe webhooks (see [Webhooks guide](https://docs.stripe.com/webhooks))
   - Update invoice status
   - Generate receipts
   - Store payment records
   - Follow [Stripe development quickstart](https://docs.stripe.com/development/quickstart)

3. **Webhook Handling** (see [Stripe Webhooks documentation](https://docs.stripe.com/webhooks))
   - `payment_intent.succeeded` - Mark invoice as paid
   - `payment_intent.payment_failed` - Handle failures
   - `invoice.payment_succeeded` - If using Stripe Invoicing
   - `customer.subscription.*` - If using subscriptions (future)
   - Update database via Refine data provider
   - Implement webhook signature verification

4. **Security Considerations** (see [Stripe Security guide](https://docs.stripe.com/security))
   - Never expose Stripe secret key to frontend
   - Use Stripe's test mode during development (see [Testing](https://docs.stripe.com/testing))
   - Implement idempotency keys for webhooks
   - Validate webhook signatures (see [Webhook signatures](https://docs.stripe.com/webhooks/signatures))
   - Store sensitive payment data securely
   - Use Stripe's PCI-compliant components (Elements)

#### Payment Flow
1. Customer views invoice (`/invoices/:id`)
2. Clicks "Pay Now" button
3. Frontend calls API to create payment intent
4. Redirect to Stripe Checkout or show payment form
5. Customer completes payment
6. Webhook updates invoice status in database
7. Customer sees confirmation page
8. Receipt generated and stored

---

## AI Integration Plan

### Contact Form AI Features

#### Spam Detection
- Use OpenAI API to analyze form submissions
- Detect spam patterns
- Auto-flag suspicious submissions

#### Auto-Response
- Generate personalized acknowledgment emails
- Categorize inquiries (job opportunity, project inquiry, general)

#### Sentiment Analysis
- Understand inquiry tone
- Prioritize urgent requests

### Implementation Approach

1. **Backend API Route** (Next.js API route or Express endpoint)
   - Receive form submission
   - Call AI API (OpenAI/Claude)
   - Process response
   - Send email notification
   - Store submission (optional)

2. **n8n/Zapier Workflow** (Alternative)
   - Form submission triggers workflow
   - AI processing step
   - Email notification
   - Database logging

3. **Nora AI Chat Widget** (Primary AI Feature)
   - Persistent floating chat bubble (bottom-right corner)
   - OpenAI/Claude API integration
   - Custom prompt engineering for Nora's personality
   - Context-aware responses about services, skills, projects
   - Real-time streaming responses
   - **Authentication-aware chat history**:
     - Session-based for unauthenticated users (client-side only)
     - Persistent database storage for authenticated customers
   - **Customer account access** (authenticated users only):
     - Nora can access customer invoices, payments, contracts
     - Secure data access via Refine data providers
     - Role-based access control
   - Mobile-responsive design

---

## Content Requirements

### Text Content Needed

1. **Home Page**
   - Hero tagline
   - Brief bio (2-3 sentences)
   - Call-to-action text

2. **About Page**
   - Full professional bio
   - Career timeline
   - Personal interests (optional)

3. **Projects**
   - For each project:
     - Title
     - Description (2-3 paragraphs)
     - Technologies list
     - Challenges/solutions
     - Results (if applicable)

4. **Skills**
   - Brief description for each skill category
   - Proficiency levels (if showing)

5. **Contact**
   - Contact form labels
   - Success/error messages
   - Availability information

### Media Assets Needed

1. **Images**
   - ✅ Professional headshot (ready - `img/Destin-L-Mincy__HEADSHOT.png`)
   - Project screenshots (multiple per project)
   - Technology icons/logos
   - Background images (optional)
   - Logo/branding elements (if available)

2. **Optional**
   - Video demos
   - GIFs showing interactions
   - Logo/branding elements

---

## SEO Strategy

### On-Page SEO
- Meta titles and descriptions for each page
- Open Graph tags for social sharing
- Structured data (JSON-LD)
- Semantic HTML
- Alt text for all images
- Internal linking strategy

### Technical SEO
- Fast page load times
- Mobile-friendly
- HTTPS
- XML sitemap
- Robots.txt
- Canonical URLs

### Content SEO
- Keyword optimization (natural)
- Regular content updates
- Blog posts (future)

---

## Analytics & Monitoring

### Tools to Integrate
- Google Analytics 4
- Google Search Console
- Vercel Analytics (if using Vercel)
- Error tracking (Sentry, optional)

### Metrics to Track
- Page views
- User engagement
- Contact form submissions
- Project page views
- Bounce rate
- Conversion rate

---

## Security Considerations

- Environment variables for API keys
- Rate limiting on contact form
- Input validation and sanitization
- HTTPS/SSL
- Secure headers
- Regular dependency updates

---

## Future Enhancements

### Phase 2 Features (Post-Launch)
- Blog section with technical articles
- Project case studies in detail
- Testimonials section
- Interactive resume/CV viewer
- Dark mode toggle
- Multi-language support (if needed)
- Newsletter signup
- Social media feed integration

### Advanced AI Features
- AI-powered project recommendations
- Personalized content based on visitor
- Automated blog post generation
- AI assistant for portfolio navigation

---

## Success Metrics

### Launch Goals
- Site loads in < 3 seconds
- Mobile-friendly (100% responsive)
- Accessible (WCAG 2.1 AA)
- Zero critical bugs
- All pages functional

### Post-Launch Goals (3 months)
- Increase in contact form submissions
- Positive feedback from visitors
- Improved search rankings
- Regular traffic growth
- Professional appearance feedback

---

## Resources & References

### Design Inspiration
- Dribbble portfolio designs
- Behance portfolio showcases
- Awwwards portfolio sites

### Technical Resources
- **Refine Documentation**: https://refine.dev/docs
  - Overview and key concepts
  - Quick Start Guide
  - Tutorials and Examples
  - Templates
  - Core hooks and components
  - Data providers (including Supabase)
  - Authentication providers
  - Routing (Next.js, Remix, React Router)
  - UI integrations (Ant Design, Material UI, Mantine, Chakra UI)
  - Advanced features (Real-time, Audit Logs, i18n, etc.)
- **Refine + Next.js Guide**: https://refine.dev/docs/guides-and-concepts/guides/nextjs
- **Refine + Supabase Guide**: https://refine.dev/docs/data-provider/supabase
- **Refine Examples**: 
  - Official examples in documentation
  - [Refine MUI Admin Dashboard](https://example.mui.admin.refine.dev)
  - [Refine HR Dashboard](https://hr.refine.dev/login)
- **Next.js Documentation**: https://nextjs.org/docs
- **Ant Design Documentation**: https://ant.design
- **Supabase Documentation**: https://supabase.com/docs
- **Stripe Documentation**: https://docs.stripe.com
  - Get started with payments
  - API reference
  - Development quickstart
  - Sample projects
  - Payment Intents (for invoice payments)
  - Customer Portal (for customer self-service)
  - Webhooks (for payment event handling)
  - Stripe Elements (for secure payment forms)
  - Invoicing API (optional, for automated invoices)
- **OpenAI API Documentation**: https://platform.openai.com/docs
- **n8n Documentation**: https://docs.n8n.io
- **DocuSign API Documentation**: https://developers.docusign.com/docs
  - Getting started with DocuSign API
  - Authentication (OAuth 2.0)
  - Envelopes API (for sending contracts)
  - Templates API (for contract templates)
  - Webhooks (for contract status updates)
  - Embedded signing (for in-app signing)
  - REST API reference

### Tools
- Figma (design mockups)
- Canva (image editing)
- Unsplash (stock photos)
- Font Awesome / Heroicons (icons)

---

## Timeline Summary

- **Week 1**: Foundation & Setup (Refine + Next.js + Database)
- **Weeks 2-3**: Core Portfolio Pages Development
- **Week 4**: Content Creation
- **Week 5**: Authentication & Customer Portal Foundation
- **Week 6**: Invoice Management System
- **Week 7**: Payment Integration (Stripe/PayPal)
- **Week 8**: AI Features Integration
- **Week 9**: Polish & Optimization
- **Week 10**: Deployment & Portfolio Launch
- **Week 11+**: Customer Portal Beta & Full Launch
- **Ongoing**: Maintenance & Updates

**Total Estimated Time**: 
- **Portfolio Launch**: 10 weeks
- **Customer Portal Launch**: 11+ weeks (with beta testing)
- Timeline is adjustable based on availability and priorities

---

## Next Steps

1. **Review and approve this plan**
2. **Choose final technology stack** (Refine + Next.js recommended)
3. **Set up Supabase account** (or choose database solution)
4. **Set up Stripe account** (for payment processing)
5. **Create design mockups** (Figma or similar)
6. **Set up development environment**
7. **Begin Phase 1: Foundation & Setup**

---

## Decisions Made ✅

1. ✅ **Blog**: Add later (not in initial launch) - **BUT architecture will be ready from start**
2. ✅ **Color Scheme**: Blue, Gold, Silver
3. ✅ **Projects**: Will gather/build projects during development
4. ✅ **Headshot**: Ready and in project folder (`img/Destin-L-Mincy__HEADSHOT.png`)
5. ✅ **Design**: Will provide design direction later
6. ✅ **Timeline**: 10-11 weeks is acceptable (flexible if delays occur)
7. ✅ **Payment Provider**: Stripe (unless better option found before coding)
8. ✅ **Payment System**: Must be architected from the start (not an afterthought)
9. ✅ **Admin Panel**: Required from the start - full CMS capabilities (WordPress-like)
10. ✅ **Database**: Supabase (PostgreSQL backend)
11. ✅ **ALL Content Editable**: Every piece of content must be editable via admin panel
12. ✅ **Blog Architecture**: Blog structure prepared from start (tables, admin interface) - can be hidden until ready
13. ✅ **Primary AI Feature**: Nora AI Chat Widget - persistent chat bubble (bottom-right corner) on all pages
14. ✅ **Nora Chat History**: Session-based for guests, persistent for authenticated customers
15. ✅ **Nora Account Access**: Authenticated customers can ask Nora about their invoices, payments, and contracts
16. ✅ **Current Clients**: 1 client will need portal access initially

## Remaining Questions

1. ✅ **AI Features Priority**: Nora AI Chat Widget is the primary AI feature (persistent chat bubble, bottom-right corner)
2. ✅ **Design Inspiration**: 
   - **Portfolio Pages**: 
     - [ZYAN Portfolio Template](https://codeefly.net/wp/zyan) - modern animations, clean design, interactive elements
     - [Drake Personal Portfolio Template](https://preview.themeforest.net/item/drake-personal-portfolio-html/full_screen_preview/43789350) - additional layout patterns and design elements
   - **Dashboards**:
     - [Refine MUI Admin Dashboard](https://example.mui.admin.refine.dev) - Material UI admin panel patterns
     - [Refine HR Dashboard](https://hr.refine.dev/login) - HR management dashboard patterns
   - **Approach**: Select best elements from portfolio templates; follow Refine dashboard patterns for admin/customer portals
3. ✅ **Existing Customers**: 1 current client will need portal access initially
4. ✅ **Nora Chat Widget Details**: 
   - ✅ Chat history: Session-based for guests, persistent for authenticated customers
   - ✅ Authenticated customers: Nora can access account info (invoices, payments, contracts)
   - Which AI model? (OpenAI GPT-4, Claude, or other?)
   - Any specific personality traits for Nora?

---

**Document Version**: 2.0  
**Last Updated**: [Current Date]  
**Status**: Planning Phase - Updated for Refine + Customer Portal + Payment Integration

