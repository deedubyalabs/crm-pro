# PROActive ONE: Your Operations Hub for Construction Success

**Version:** 1.0 (Production-Grade Manual System)
**Last Updated:** May 21, 2025

## 1. Project Vision & Mission

**Vision:** To be the most intuitive, efficient, and reliable operations hub for solo residential contractors and small construction businesses, empowering them to manage their entire project lifecycle with clarity and professionalism.

**Mission:** To provide a comprehensive, yet easy-to-use, cloud-based platform that streamlines Customer Relationship Management (CRM), estimating, project management, financial tracking, and communication, enabling contractors to save time, improve profitability, and deliver exceptional client experiences.

## 2. Core Problem Addressed

Solo residential contractors and small construction firms often juggle numerous administrative and operational tasks that detract from their core craft. They face challenges in:

*   Efficiently managing leads, client communications, and sales opportunities.
*   Quickly creating accurate, professional estimates and proposals.
*   Tracking project progress, schedules, and tasks effectively.
*   Managing project financials, including expenses, invoices, payments, and job costing.
*   Organizing project documents, photos, and notes.
*   Coordinating with subcontractors and managing bids.
*   Handling change orders systematically.
*   Maintaining a professional image and ensuring client satisfaction.

PROActive ONE is designed to be the central nervous system for their business, bringing all these functions into one integrated and user-friendly platform.

## 3. High-Level System Overview

PROActive ONE is a web-based application built with a modern tech stack (Next.js, Supabase) designed for performance, reliability, and ease of use. It provides a suite of interconnected modules covering the full spectrum of a contractor's operational needs. The system prioritizes a clean user interface, logical workflows, and deep relational linking of data to provide a holistic view of the business.

**Key Modules:**

*   **Dashboard:** Customizable overview of key business metrics, upcoming tasks, project statuses, and financial summaries.
*   **CRM (People & Opportunities):**
    *   **People:** Comprehensive contact management for Leads, Customers, Subcontractors, Vendors, and Employees.
    *   **Opportunities:** Tracking potential projects from initial qualification to estimate creation.
*   **Operations:**
    *   **Projects:** Central hub for managing active jobs, including all related details, financials, documents, and tasks.
    *   **Estimates:** Powerful and flexible tool for creating detailed, professional estimates and proposals.
    *   **Jobs (Tasks & To-Do's):** Managing general tasks and specific project-related jobs with checklists and assignments.
    *   **Schedule:** Visual calendar for managing appointments, project tasks, and deadlines.
    *   **Daily Logs:** Comprehensive daily reporting from the job site.
    *   **Work Orders & Service Tickets:** Managing ad-hoc service requests and smaller jobs, with integration for membership plans.
    *   **Documents:** Centralized repository for all project and contact-related files with versioning and categorization.
    *   **Voice Notes:** (Future integration point for AI transcription)
*   **Financials:**
    *   **Financial Hub:** Overview of financial health, linking to all financial modules.
    *   **Cost Items Database:** Central library for materials, labor rates, equipment, and subcontractor costs.
    *   **Change Orders:** Managing scope changes, client approvals, and financial impact on projects.
    *   **Invoices:** Creating and sending professional invoices, tracking payment status.
    *   **Payments:** Recording and managing client payments.
    *   **Expenses:** Tracking all project-related and overhead expenses.
    *   **Purchase Orders:** Managing orders with suppliers.
    *   **Sub-Contracts:** Managing agreements with subcontractors.
    *   **Bills (Accounts Payable):** Tracking bills from vendors and subcontractors.
    *   **Job Costing:** Real-time and historical analysis of project profitability.
*   **Admin & Settings:**
    *   User profile management.
    *   Company settings (branding, default terms, etc.).
    *   Customizable categories ("add as you go" for stages, sources, types, etc.).
    *   Integration management (Square, Accounting, etc.).
    *   (Future) User roles and permissions for small teams.
*   **Reporting:** Comprehensive reporting suite with pre-built reports and a custom report builder, focusing on in-app interactive viewing.
*   **Client Portal:** Secure portal for clients to view project progress, documents, make payments, and communicate.
*   **Communication (Future Placeholder for Sendbird):** Integrated email and in-app messaging capabilities.
*   **Membership & Rewards:** Managing client membership plans and loyalty programs.

## 4. Target User Profile

*   **Solo Residential General Contractors & Remodelers.**
*   **Specialized Trade Contractors** (Plumbers, Electricians, HVAC, Painters, Landscapers, etc.) operating independently or with very small crews (1-5 people).
*   Users who value simplicity, efficiency, and a modern user experience.
*   Often mobile (using tablets/laptops on-site or in their vehicle).
*   May have varying levels of technical comfort but need a tool that "just works" and doesn't require extensive training.
*   Primarily focused on residential projects, but may do some light commercial work.

## 5. Key Value Propositions (Manual System)

*   **Centralized Control:** Manage your entire business from one place, eliminating the need to juggle multiple disconnected apps and spreadsheets.
*   **Time Savings:** Streamlined workflows for common tasks like estimating, invoicing, and scheduling free up significant time.
*   **Enhanced Professionalism:** Consistently produce professional-looking documents (estimates, invoices, change orders) and maintain clear communication with clients.
*   **Improved Organization:** Keep all project information, client details, documents, and financial records neatly organized and easily accessible.
*   **Better Financial Oversight:** Gain clear visibility into project costs, revenue, and profitability with integrated job costing and financial reporting.
*   **Increased Efficiency:** Reduce redundant data entry through interconnected modules and intelligent data pre-filling.
*   **Customizable to Your Business:** Flexible "add as you go" categories allow you to tailor the system to your specific terminology and processes.
*   **User-Friendly Interface:** A clean, modern, and intuitive design makes the platform easy to learn and use, even for less tech-savvy contractors.

## 6. Core Principles (Guiding Development)

*   **User-Centric Design:** Every feature and workflow is designed with the solo contractor's needs and ease of use as the top priority.
*   **Simplicity & Intuition:** The platform must be easy to learn and navigate, with clear, uncluttered interfaces. Side drawers are preferred for creation/edit forms to maintain context.
*   **Deep Integration & Relational Data:** All modules are tightly integrated, with data flowing seamlessly between them. A robust relational database schema (Supabase/PostgreSQL) is foundational.
*   **Efficiency:** Workflows are optimized to minimize clicks and save the user time.
*   **Reliability & Security:** The platform must be stable, performant, and secure, protecting sensitive business and client data.
*   **Modern Technology:** Built with a modern, scalable tech stack (Next.js, Supabase, Tailwind CSS).
*   **Future-Readiness for AI:** While this README focuses on the manual system, the underlying architecture and data structures (Agent Data Fabric foundation) are designed to readily accommodate future AI integrations for enhanced automation and proactive assistance.

## 7. Key Features & Functionality (Manual System - End Goal)

*(This section would be very detailed, drawing heavily from your `contractor-foreman-review.md` "PROActive ONE Adaptation" sections for each module. Below is a high-level summary; the full version would list out specific fields, actions, and sub-features for each.)*

### 7.1. Dashboard
    * Customizable widgets for:
        * Open Estimates (list, stats)
        * Unpaid Invoices (chart, list)
        * Current Projects (list, progress summary)
        * Leads by Stage
        * Upcoming Tasks & Appointments
        * Recent Activity Feed
        * Key Financial KPIs (e.g., Revenue YTD, Profit Margin Average)

### 7.2. CRM
    *   **People Module (Contacts):**
        *   Unified list for Leads, Customers, Subcontractors, Vendors, Employees (filterable by type).
        *   Side drawer for quick creation/editing of contacts.
        *   Comprehensive contact detail view:
            *   Contact Information (multiple phones, emails, addresses).
            *   Key Information (status, source, dates).
            *   Notes, Tags.
            *   Related entities tabs: Opportunities, Projects, Estimates, Invoices, Jobs, Appointments, Documents, Activity Log, AI Insights (placeholder).
        *   "Add as you go" for Lead Source, Lead Stage, Contact Tags, etc.
        *   Manual conversion of Lead to Customer.
        *   Bulk actions (delete, assign tags).
    *   **Opportunities Module:**
        *   List view with customizable columns and filters.
        *   Side drawer for quick creation/editing of opportunities (link to Person).
        *   Opportunity detail view:
            *   Details (Opportunity Name, Stage, Project Type, Est. Value, Close Date, Sales Rep).
            *   Sales pipeline visualizer.
            *   Address information (can differ from primary contact).
            *   Related entities tabs: Tasks/Jobs, Estimates, Files, Notes, Activity Log.
        *   "Add as yougo" for Opportunity Stage, Project Type.
    *   **Inbox (Future - Manual Email Integration):**
        *   Connect personal email (Gmail/Outlook) to send/receive emails within PROActive ONE, automatically linking them to contacts/projects.

### 7.3. Operations
    *   **Projects Module:**
        *   Dashboard/list view of all projects (filterable, sortable).
        *   Comprehensive project detail view (central hub):
            *   Summary (status, key dates, budget vs. actual).
            *   Financials (linked Estimates, Change Orders, Invoices, Payments, Expenses, Purchase Orders, Bills, Job Costing summary).
            *   Schedule of Values.
            *   Schedule (Gantt chart view, task list).
            *   Jobs/Tasks.
            *   Daily Logs.
            *   Documents & Photos.
            *   Contacts (Client, Subcontractors, etc.).
            *   Procurement (linked POs).
            *   Client Portal access controls.
            *   Reports specific to the project.
            *   Notes, Activity Log.
    *   **Estimates Module:**
        *   List view of all estimates (filterable by status, etc.).
        *   Side drawer for quick estimate creation.
        *   Detailed estimate creation/editing interface:
            *   Link to Opportunity/Person.
            *   Estimate details (number, issue/expiry date, project type).
            *   Line Items:
                *   Sections (with optional toggle for groups of items).
                *   Import from Cost Items Database (materials, labor, equipment, subs, groups) via side drawer.
                *   Add new cost items "as you go" to the database.
                *   Manual item entry.
                *   Fields: Description, Qty, Unit, Unit Cost, Markup (%, $), Taxable, Total.
                *   Assign items to internal staff or subcontractors.
            *   Summary (Subtotal, Discount, Tax, Total, Est. Cost, Est. Profit, Est. Hours).
            *   Terms & Conditions, Scope of Work, Cover Sheet, Notes, Files.
            *   Bidding section for managing subcontractor bids on specific line items/sections.
            *   Preview & Send functionality (PDF generation).
            *   Convert to Project/Invoice/Schedule of Values upon approval.
    *   **Jobs (Tasks & To-Do's) Module:**
        *   List view and Kanban board view.
        *   Side drawer for task creation (link to Person, Opportunity, Project).
        *   Fields: Subject, Assigned To, Due Date/Time, Type (Call, Email, Meeting, Site Visit, etc. - "add as you go"), Status, Priority, Description, Checklist Items, Notes.
        *   "Show on Calendar" option.
    *   **Schedule (Calendar) Module:**
        *   Day, Week, Month views.
        *   Displays Appointments and Jobs/Tasks marked "Show on Calendar."
        *   Drag-and-drop rescheduling.
        *   Integration with external calendars (e.g., Google Calendar via API).
    *   **Daily Logs Module:**
        *   List view (per project) and calendar navigation.
        *   Comprehensive form for daily entries:
            *   Date, Weather, Jobsite Conditions, Delays.
            *   People on Site (Employees, Subs - with time in/out).
            *   Materials Delivered/Used.
            *   Equipment Used/Logs.
            *   Notes, Photos/Files, Incidents.
    *   **Work Orders & Service Tickets Module:**
        *   Dedicated modules for managing smaller, often service-oriented jobs.
        *   Link to Clients, (potentially) Projects, Membership Plans.
        *   Scheduling, assignment, status tracking, description, items/services used.
        *   Electronic signature support for completion.
    *   **Documents Module:**
        *   Central repository for ALL uploaded files and generated documents (Estimates, Invoices, Change Orders, POs, etc.).
        *   Folder structure or robust tagging/categorization (`document_type` field).
        *   Link documents to People, Opportunities, Projects, Estimates, etc.
        *   Version control (basic).
        *   Advanced search and filtering.

### 7.4. Financials
    *   **Financial Hub:** Dashboard with key financial KPIs, links to other financial modules.
    *   **Cost Items Database Module:**
        *   Manage library of Materials, Labor Rates, Equipment, Subcontractor services, Other costs.
        *   Fields: Item Code, Name, Description, Type, Unit, Unit Cost, Default Markup.
        *   Ability to create and manage Cost Item Groups (assemblies).
        *   "Add as you go" from Estimates/POs.
        *   (Future) BigBoxAPI integration for price updates.
    *   **Change Orders Module:**
        *   List view and status tracking.
        *   Create COs linked to Projects.
        *   Add CO line items (import from Estimate/SOV or manual).
        *   Approval workflow with client (e-signature).
        *   Automatic update to Project financials and Schedule of Values.
    *   **Invoices Module:**
        *   List view, status tracking (Draft, Sent, Paid, Overdue).
        *   Create Invoices from Projects, Estimates, or manually.
        *   Add various item types: from Cost Items, SOV, Estimate, Time & Materials (unbilled Time Cards, Expenses, COs), Manual Items, Discounts, Retainage.
        *   Professional PDF generation.
        *   Send via email (integration).
        *   Square integration for online payments.
    *   **Payments Module:**
        *   Record payments against Invoices.
        *   Track payment method, date, amount, reference.
        *   Square integration for automatic reconciliation of online payments.
    *   **Expenses Module:**
        *   Track project-related and overhead expenses.
        *   Link to Projects, categorize ("add as you go").
        *   Fields: Date, Vendor, Description, Amount, Receipt attachment.
        *   Mark as billable to include on invoices.
    *   **Purchase Orders Module:**
        *   Create and manage POs for suppliers.
        *   Link to Projects, Suppliers.
        *   Add items from Cost Database, Material Lists, or manually.
        *   Track status (Draft, Sent, Partially Received, Received).
    *   **Sub-Contracts Module:**
        *   Manage agreements with subcontractors.
        *   Link to Projects, Subcontractors.
        *   Define scope of work, contract amount, terms.
    *   **Bills (Accounts Payable) Module:**
        *   Track incoming bills from vendors and subcontractors.
        *   Link to POs or Expenses.
        *   Manage due dates and payment status.
    *   **Job Costing:**
        *   Automatic calculation based on all linked financial data (Estimates, COs, Invoices, Payments, Expenses, Time Cards, POs, Bills).
        *   Real-time and summary views of estimated vs. actual costs, revenue, and profit per project.

### 7.5. Admin & Settings
    *   User Profile.
    *   Company Information & Branding (for documents).
    *   Default Payment Terms, Estimate Terms, etc.
    *   Management of "Add as you go" categories (Lead Sources, Stages, Project Types, Task Types, Expense Categories, etc.).
    *   Third-party integrations dashboard (Square, Accounting API, Calendar).

### 7.6. Reporting Module
    *   Library of pre-built reports for all major modules (CRM, Projects, Financials, etc.).
    *   Custom Report Builder:
        *   Select modules/data sources.
        *   Choose columns/fields.
        *   Apply filters, sorting, grouping.
        *   Save custom report templates.
    *   Interactive in-app report viewing with charts and data tables.
    *   Export options (PDF, CSV).

### 7.7. Client Portal
    *   Secure, unique portal access per client/project.
    *   View project progress, key dates, shared documents (estimates, invoices, COs, photos).
    *   Communication channel (chat/messaging - Sendbird integration).
    *   E-signature for documents.
    *   Online payment of invoices (Square integration).
    *   Contractor controls for information visibility.

### 7.8. Membership & Rewards
    *   Define membership tiers and benefits.
    *   Track client membership status.
    *   Points earning rules (spending, referrals, etc.).
    *   Points redemption for discounts or services.
    *   Manage optional add-on service packages.

## 8. Technology Stack (Recap)

*   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
*   **Backend:** Next.js API Routes / Server Actions
*   **Database:** Supabase (PostgreSQL) - serving as the core Agent Data Fabric foundation.
*   **Authentication:** Supabase Auth (or custom with Supabase).
*   **File Storage:** Supabase Storage.
*   **Deployment:** Vercel.
*   **Key External APIs (for manual system):** Square (Payments, Invoicing), Accounting API (user's choice - Xero, QuickBooks via API), Google Calendar. (Sendbird for chat is more of an AI-phase integration but good to keep in mind).

## 9. Future Considerations (Beyond Manual MVP)

*   **Deep AI Integration:** Embedded AI Assistant (conversational UI via side drawer), proactive suggestions, AI-powered data analysis, automation of complex workflows using Agno agents.
*   **Mobile Apps:** Native or PWA for enhanced offline capabilities (especially time tracking, daily logs).
*   **Advanced Team Features:** User roles, permissions, team scheduling, collaborative workflows (for slightly larger teams).
*   **Inventory Management:** Basic tracking for commonly used materials.
*   **Full Visual Takeoff (FloorPlan Pro integration).**

---