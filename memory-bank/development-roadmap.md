# Development Roadmap: PROActive OS - Your Operations Hub for Construction Success

**Version:** 1.0 (Production-Grade Manual System)
**Last Updated:** June 13, 2025

## Overall Project Status

**Phase 1: Core Manual Modules - In Progress**

The project is currently focused on completing the core manual modules to achieve a production-grade manual system (Version 1.0). Future AI integrations are planned but not part of the immediate scope for this version.

## Current Sprint/Focus

The immediate focus is on completing the foundational manual modules and ensuring their stability and usability. This involves:
- Finalizing UI/UX for core data entry and management workflows.
- Ensuring robust data integrity and relational linking within Supabase.
- Implementing all essential features for each core module as outlined below.

## Workflow Breakdown & Development Tasks

### 1. Dashboard Module

*   **Status:** In Progress
*   **Description:** Customizable overview of key business metrics, upcoming tasks, project statuses, and financial summaries.
*   **Tasks:**
    *   [TO DO] Develop customizable widgets for key metrics (Open Estimates, Unpaid Invoices, Current Projects, Leads by Stage, Upcoming Tasks & Appointments, Recent Activity Feed, Key Financial KPIs).
    *   [TO DO] Implement data fetching and display logic for all dashboard widgets.
    *   [TO DO] Ensure dashboard data is reflective of the manual system's current state.

### 2. CRM Workflow (People & Opportunities)

*   **Status:** Functional (Core)
*   **PROActive OS Adaptation Summary:** Unified Contact entity in Supabase with a `type` field, automated Lead-to-Customer conversion, "add as you go" categories, dedicated "Jobs" feature linkable to entities, streamlined UI with side drawers, deep relational linking of data.
*   **Tasks:**
    *   [COMPLETED] Refine design and responsiveness for `app/people/person-form.tsx` and `app/opportunities/opportunity-form.tsx` by adding `ScrollArea`.
    *   [COMPLETED] Convert `app/people/[id]/edit/page.tsx`, `app/opportunities/[id]/edit/page.tsx`, `app/people/new/page.tsx`, and `app/opportunities/new/page.tsx` to side drawers and increased their width.
    *   [COMPLETED] Implement consistent validation and error handling for `person-form.tsx` and `opportunity-form.tsx`.
    *   [COMPLETED] Implement "add as you go" functionality for categories (Source, Stage, Type) via separate Supabase tables and associated UI/API.
    *   [COMPLETED] Implement manual Lead-to-Customer conversion workflow.
*   **API Endpoints Needed:**
    *   `POST /api/contacts`: Create new contact.
    *   `GET /api/contacts`: Retrieve contacts (with filtering/search).
    *   `GET /api/contacts/:id`: Retrieve contact details.
    *   `PUT /api/contacts/:id`: Update contact.
    *   `DELETE /api/contacts/:id`: Delete contact.
    *   `POST /api/opportunities`: Create new opportunity.
    *   `GET /api/opportunities`: Retrieve opportunities (with filtering/search).
    *   `GET /api/opportunities/:id`: Retrieve opportunity details.
    *   `PUT /api/opportunities/:id`: Update opportunity.
    *   `POST /api/jobs`: Create new job (linked to entity).
    *   `POST /api/documents`: Upload/create document (linked to entity).
    *   `GET /api/categories/:type`: Retrieve "add as you go" categories.
    *   `POST /api/categories/:type`: Add new "add as you go" category.
*   **Key Decisions/Notes:** Unified Contact entity with `type` field confirmed. Side drawers for creation forms for Contacts and Opportunities.

### 3. Estimate Creation Workflow (from Opportunity and Items View)

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Enhanced Estimate items view with sections, optional items, tax marking, and item assignment. Comprehensive Cost Items database UI with tabbed views and item groups. Seamless integration with Cost Items database via side drawer. Bulk markup functionality. "Add as you go" for line items and cost item categories. Summary view, dedicated UI sections for Terms, Scope of Work, Bidding, Files, Cover Sheet, Notes. "Preview & Send" workflow with PDF generation.
*   **Tasks:**
    *   [COMPLETED] Enhance existing Estimate items view to replicate the robust functionality, including sections (with optional), item options (optional, tax), and item assignment.
    *   [COMPLETED] Develop a comprehensive Cost Items database UI with a tabbed view (Material, Equipment, Labor, Subcontractor, Other, Groups), search, filtering, and the ability to create and manage item groups.
    *   [COMPLETED] Implement seamless integration with the Cost Items database from the Estimate items view via a side drawer, allowing import of existing items and adding new ones "as you go".
    *   [COMPLETED] Implement bulk markup functionality with flexible application options.
    *   [COMPLETED] "Add as you go" functionality for line items and cost item categories is supported by existing free-text fields and fixed enum, as per user clarification. No schema migration needed.
    *   [COMPLETED] Modals/sidedrawers are utilized for adding new cost items (via `CreateCostItemDialog` within `CostItemSelectorDrawer`) and selecting existing cost items (via `CostItemSelectorDrawer`), ensuring a smooth UI experience. Sections are handled via inline free-text input as per user's preference.
    *   [COMPLETED] Supabase schema already supports estimate sections, optional items, tax marking, assignments, markup details, and item groups within the Cost Items database.
    *   [COMPLETED] A comprehensive summary view displaying estimated cost, profit margin, hours needed, and markup is already implemented in `EstimateSummary.tsx`.
    *   [COMPLETED] Dedicated UI sections for Terms, Scope of Work, Cover Sheet, and Notes are handled by existing form fields and schema. The "Files" section UI is implemented and linked. The "Bidding" section UI is implemented. Backend logic for these sections is in progress or handled by existing services.
    *   [TO DO] Implement a "Preview & Send" workflow with a preview of the estimate package (generating a PDF).
*   **API Endpoints Needed:**
    *   `POST /api/estimates`: Create new estimate.
    *   `GET /api/estimates`: Retrieve estimate details.
    *   `PUT /api/estimates/:id`: Update estimate.
    *   `DELETE /api/estimates/:id`: Delete estimate.
    *   `POST /api/estimates/:id/items`: Add item to estimate.
    *   `PUT /api/estimates/:id/items/:itemId`: Update estimate item.
    *   `DELETE /api/estimates/:id/items/:itemId`: Delete estimate item.
    *   `POST /api/estimates/:id/sections`: Add section to estimate.
    *   `PUT /api/estimates/:id/sections/:sectionId`: Update estimate section.
    *   `DELETE /api/estimates/:id/sections/:sectionId`: Delete estimate section.
    *   `GET /api/cost-items`: Retrieve cost items (with filtering/search/group).
    *   `POST /api/cost-items`: Create new cost item ("add as you go").
    *   `POST /api/cost-item-groups`: Create new cost item group.
    *   `GET /api/cost-item-groups`: Retrieve cost item groups.
    *   `POST /api/estimates/:id/markup`: Apply bulk markup.
    *   `PUT /api/estimates/:id/assignments`: Assign items.
    *   `PUT /api/estimates/:id/terms`: Update terms.
    *   `PUT /api/estimates/:id/scope-of-work`: Update scope of work.
    *   `POST /api/estimates/:id/bidding`: Manage bidding for estimate.
    *   `POST /api/estimates/:id/files`: Add files to estimate.
    *   `PUT /api/estimates/:id/cover-sheet`: Update cover sheet.
    *   `PUT /api/estimates/:id/notes`: Update notes.
    *   `POST /api/estimates/:id/preview`: Generate estimate preview.
    *   `POST /api/estimates/:id/submit`: Submit estimate.
*   **Key Decisions/Notes:** Integration with Cost Items Database via side drawer, "add as you go" for items/categories, bulk markup.

### 4. Contractor/Bids Workflow (from Estimate)

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Estimates list dashboard, Bidding section within Estimate (bid package creation, item selection), unified Contact entity for contractors, centralized Documents module for all contractor-related documents, email bid packages with subcontractor interface for submission, "Submissions" section for review and status management, apply awarded bid price to estimate item.
*   **Tasks:**
    *   [TO DO] Develop an Estimates list dashboard providing status summaries and a detailed list view.
    *   [TO DO] Implement a Bidding section within the Estimate view, allowing users to create bid packages and select specific estimate items to include.
    *   [TO DO] Ensure contractor details are managed within the unified Contact entity in the CRM.
    *   [TO DO] Store all contractor-related documents (insurance, licenses, general files) within the central Documents module, utilizing a `type` field to categorize them.
    *   [TO DO] Implement functionality to email the bid package, providing a simple interface for subcontractors to submit their bid price.
    *   [TO DO] Develop a "Submissions" section within the Bidding feature for reviewing submitted bids and managing their status (Award, Request rebid, Decline, In Review).
    *   [TO DO] Implement the functionality to apply the awarded bid price to the corresponding estimate item price.
    *   [TO DO] Ensure deep relational linking between Estimates, Bid Packages, Contractors (Contacts), Documents, and Estimate Items.
*   **API Endpoints Needed:**
    *   `POST /api/estimates`: Create new estimate.
    *   `GET /api/estimates`: Retrieve list of estimates (with filtering/search/status).
    *   `POST /api/estimates/:id/bid-packages`: Create new bid package for estimate.
    *   `GET /api/estimates/:id/bid-packages/:bidPackageId`: Retrieve bid package details.
    *   `PUT /api/estimates/:id/bid-packages/:bidPackageId`: Update bid package (including items, status).
    *   `DELETE /api/estimates/:id/bid-packages/:bidPackageId`: Delete bid package.
    *   `POST /api/estimates/:id/bid-packages/:bidPackageId/email`: Email bid package.
    *   `POST /api/bid-submissions`: Endpoint for subcontractors to submit bids (external).
    *   `GET /api/estimates/:id/bid-packages/:bidPackageId/submissions`: Retrieve bid submissions.
    *   `PUT /api/bid-submissions/:submissionId`: Update bid submission status (Award, Decline, etc.).
    *   `POST /api/bid-submissions/:submissionId/apply-price`: Apply awarded bid price to estimate item.
    *   `POST /api/contacts/:id/documents`: Add document to contact (with type).
*   **Key Decisions/Notes:** Centralized document storage for contractors.

### 5. Post-Estimate Approval Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Implement a modal or clear UI element upon estimate approval presenting the user with key next steps: adding items to Blueprint of Values, generating an initial Invoice, and creating a Project/Schedule. Ensure seamless transitions to relevant modules. Deep relational linking between approved Estimate and new entities.
*   **Tasks:**
    *   [TO DO] Implement a similar modal or clear UI element upon estimate approval presenting the user with key next steps: adding items to Blueprint of Values, generating an initial Invoice, and creating a Project/Schedule.
    *   [TO DO] Ensure these options seamlessly transition the user to the relevant module or initiate the respective process.
    *   [TO DO] Ensure deep relational linking between the approved Estimate and the newly created/updated entities (Blueprint of Values, Invoice, Project, Schedule).
*   **API Endpoints Needed:**
    *   `POST /api/estimates/:id/approve`: Approve estimate.
    *   `POST /api/estimates/:id/add-to-pvb`: Add estimate items to Blueprint of Values.
    *   `POST /api/estimates/:id/generate-invoice`: Generate invoice from estimate.
    *   `POST /api/estimates/:id/create-project-and-schedule`: Create project and schedule from estimate.
*   **Key Decisions/Notes:** Clear next steps upon estimate approval.

### 6. Project Management Workflow (Dashboard and Details)

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Projects dashboard list view. Comprehensive Project details view with clear navigation to various integrated sections. Deep integration and display of relevant linked data within each section. Functionality to easily add new related items. Deep relational linking in Supabase schema.
*   **Tasks:**
    *   [TO DO] Develop a Projects dashboard list view displaying key project details and summaries.
    *   [COMPLETED] Create a comprehensive Project details view with a clear navigation structure (sidebar or tabs) to various sections mirroring the required modules (Summary, Financial, Blueprint of Values, Documents, Time, Files & Photos, Contacts, Schedule, Procurement, Client Access, Reports).
    *   [TO DO] Ensure each section within the Project details view is deeply integrated and displays relevant linked data (e.g., Financial section shows linked invoices, expenses, change orders; Documents section shows linked files; Time section shows linked time entries).
    *   [TO DO] Implement functionality within each section to easily add new related items (e.g., add a new Daily Log from the Documents section, add a new Time Entry from the Time section).
    *   [TO DO] Ensure deep relational linking in the Supabase schema between Projects and all related entities (Estimates, Invoices, Expenses, Time Entries, Documents, Jobs, Contacts, Schedule, etc.).
*   **API Endpoints Needed:**
    *   `GET /api/projects`: Retrieve list of projects (with filtering/sorting/status).
    *   `GET /api/projects/:id`: Retrieve project details (including data for all linked sections).
    *   `PUT /api/projects/:id`: Update project details.
    *   `POST /api/projects/:id/daily-logs`: Add daily log to project.
    *   `POST /api/projects/:id/invoices`: Generate invoice for project.
    *   `POST /api/projects/:id/punchlists`: Add punchlist to project.
    *   `POST /api/projects/:id/documents`: Add document to project.
    *   `POST /api/projects/:id/time-entries`: Add time entry to project.
    *   `GET /api/projects/:id/schedule`: Retrieve project schedule.
    *   `GET /api/projects/:id/contacts`: Retrieve project contacts.
    *   `GET /api/projects/:id/procurement`: Retrieve procurement data for project.
    *   `GET /api/projects/:id/client-access`: Retrieve client access settings for project.
    *   `GET /api/projects/:id/reports`: Retrieve reports for project.
*   **Key Decisions/Notes:** Comprehensive project details view.

### 7. Job Management Workflow

*   **Status:** Functional (Core)
*   **PROActive OS Adaptation Summary:** Dedicated "Jobs" module linkable to Contacts, Opportunities, and Projects. Fields for task details, checklist functionality with adapted status updates ("In Progress" on checklist item completion). List and Kanban views for Jobs.
*   **Tasks:**
    *   [COMPLETED] `jobs` table modified to link `assigned_to` to `people` table, and new columns (`due_date`, `due_time`, `priority`, `linked_contact_id`, `linked_opportunity_id`, `tags`) added. `job_checklist_items` table created.
    *   [COMPLETED] Develop a dedicated "Jobs" module linkable to Contacts, Opportunities, and Projects.
    *   [COMPLETED] Implement checklist functionality within Jobs with adapted status update logic (e.g., "In Progress" on checklist item completion). The status should only become "Complete" when all checklist items are completed or the user manually sets it. (Schema updated, services refactored, and UI components adjusted for 'jobs' terminology and new status values.)
    *   [TO DO] Provide list and potentially Kanban views for Jobs.
*   **API Endpoints Needed:**
    *   `POST /api/jobs`: Create new job (linked to entity).
    *   `GET /api/jobs`: Retrieve jobs (with filtering/search).
    *   `GET /api/jobs/:id`: Retrieve job details (including checklist items).
    *   `PUT /api/jobs/:id`: Update job.
    *   `DELETE /api/jobs/:id`: Delete job.
    *   `POST /api/jobs/:id/checklist-items`: Add checklist item to job.
    *   `PUT /api/jobs/:id/checklist-items/:itemId`: Update checklist item (including completion status).
*   **Key Decisions/Notes:** Renamed "To-Do's" to "Jobs". Adapted status update logic for checklists.

### 8. Work Orders and Service Tickets Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Dedicated "Work Orders" and "Service Tickets" modules. Work Orders linked to clients and projects. Service Tickets integrated with membership plans. Electronic signature support for Service Tickets.
*   **Tasks:**
    *   [TO DO] Implement dedicated "Work Orders" and "Service Tickets" modules.
    *   [TO DO] Ensure Work Orders can be linked to clients and projects.
    *   [TO DO] Ensure Service Tickets are deeply integrated with the planned membership plans feature, linking to specific plans and included services/tasks.
    *   [TO DO] Include relevant fields for tracking details specific to Work Orders and Service Tickets.
    *   [TO DO] Implement electronic signature support for Service Tickets.
*   **API Endpoints Needed:**
    *   `POST /api/work-orders`: Create new work order (linked to client/project).
    *   `GET /api/work-orders`: Retrieve work orders (with filtering/search).
    *   `GET /api/work-orders/:id`: Retrieve work order details.
    *   `PUT /api/work-orders/:id`: Update work order.
    *   `DELETE /api/work-orders/:id`: Delete work order.
    *   `POST /api/service-tickets`: Create new service ticket (linked to client/membership/service).
    *   `GET /api/service-tickets`: Retrieve service tickets (with filtering/search).
    *   `GET /api/service-tickets/:id`: Retrieve service ticket details.
    *   `PUT /api/service-tickets/:id`: Update service ticket.
    *   `DELETE /api/service-tickets/:id`: Delete service ticket.
    *   `POST /api/service-tickets/:id/esign`: Capture electronic signature for service ticket.
*   **Key Decisions/Notes:** Dedicated modules for Work Orders and Service Tickets.

### 9. Change Order Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Dedicated "Change Orders" module. Deeply linked to Projects and Customers. Comprehensive fields for details. Process for adding Change Order Items (import from Estimate/BOV). Workflow for submitting for approval (email, client e-signature). Status tracking. Automatic updates to Project financials and Blueprint of Values.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Change Orders" module.
    *   [TO DO] Ensure Change Orders can be created and deeply linked to Projects and Customers.
    *   [TO DO] Include comprehensive fields for tracking change order details.
    *   [TO DO] Implement a process for adding Change Order Items, with options to import from the linked Estimate or Blueprint of Values.
    *   [TO DO] Develop a workflow for submitting Change Orders for approval, including email notification and a client interface for review and electronic signature.
    *   [TO DO] Implement status tracking for Change Orders.
    *   [TO DO] Ensure approved Change Orders automatically update Project financials and the Blueprint of Values.
*   **API Endpoints Needed:**
    *   `POST /api/change-orders`: Create new change order (linked to project/customer).
    *   `GET /api/change-orders`: Retrieve change orders (with filtering/search/status).
    *   `GET /api/change-orders/:id`: Retrieve change order details (including items).
    *   `PUT /api/change-orders/:id`: Update change order.
    *   `DELETE /api/change-orders/:id`: Delete change order.
    *   `POST /api/change-orders/:id/items`: Add item to change order.
    *   `PUT /api/change-orders/:id/items/:itemId`: Update change order item.
    *   `DELETE /api/change-orders/:id/items/:itemId`: Delete change order item.
    *   `POST /api/change-orders/:id/submit-for-approval`: Submit change order for approval.
    *   `POST /api/change-orders/:id/approve`: Endpoint for client approval (external interface).
    *   `POST /api/change-orders/:id/decline`: Endpoint for client decline (external interface).
    *   `POST /api/change-orders/:id/import-from-estimate`: Import items from estimate.
    *   `POST /api/change-orders/:id/import-from-pvb`: Import items from BOV.
*   **Key Decisions/Notes:** Electronic signature support, integration with project financials.

### 10. Daily Log Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Dedicated "Daily Logs" module. Deeply linked to Projects. Comprehensive fields for daily site information. Sections for People on Site, Material details, Equipment details, Notes, Files, and Incidents & Accidents.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Daily Logs" module.
    *   [TO DO] Ensure Daily Logs can be created and deeply linked to Projects.
    *   [TO DO] Include comprehensive fields for capturing daily site information, mirroring the Contractor Foreman approach (date, time, tasks, weather, jobsite conditions, delays).
    *   [TO DO] Implement sections within the Daily Log for adding and linking People on Site (employees, subcontractors, visitors) with time entries, Material details (notes, delivered, used), Equipment details (notes, delivered, used, logs), Notes, Files, and Incidents & Accidents.
*   **API Endpoints Needed:**
    *   `POST /api/daily-logs`: Create new daily log (linked to project).
    *   `GET /api/daily-logs`: Retrieve daily logs (with filtering/search).
    *   `GET /api/daily-logs/:id`: Retrieve daily log details.
    *   `PUT /api/daily-logs/:id`: Update daily log.
    *   `DELETE /api/daily-logs/:id`: Delete daily log.
    *   `POST /api/daily-logs/:id/people`: Add people on site to daily log.
    *   `POST /api/daily-logs/:id/materials`: Add material details to daily log.
    *   `POST /api/daily-logs/:id/equipment`: Add equipment details to daily log.
    *   `POST /api/daily-logs/:id/notes`: Add notes to daily log.
    *   `POST /api/daily-logs/:id/files`: Add files to daily log.
    *   `POST /api/daily-logs/:id/incidents`: Add incident to daily log.
*   **Key Decisions/Notes:** Comprehensive daily site information capture.

### 11. Expense Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Dedicated "Expenses" module. Deeply linked to Projects. Comprehensive fields for details. Option to mark as Billable. Reflection in Project financials and reports.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Expenses" module.
    *   [TO DO] Ensure Expenses can be created and deeply linked to Projects.
    *   [TO DO] Include comprehensive fields for tracking expense details (date, vendor, name, total, bank account, category, notes, reference number, receipt).
    *   [TO DO] Implement the option to mark an expense as Billable.
    *   [TO DO] Ensure expenses are reflected in Project financials and reports.
*   **API Endpoints Needed:**
    *   `POST /api/expenses`: Create new expense (linked to project).
    *   `GET /api/expenses`: Retrieve expenses (with filtering/search).
    *   `GET /api/expenses/:id`: Retrieve expense details.
    *   `PUT /api/expenses/:id`: Update expense.
    *   `DELETE /api/expenses/:id`: Delete expense.
*   **Key Decisions/Notes:** Link expenses to projects, mark as billable.

### 12. Purchase Order Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** "Purchase Orders" module. Deeply linked to Projects and Suppliers. Comprehensive fields for details. Ability to add PO Items (import from Cost Items Database, Blueprint of Values, or manually). Attachment support. Delivered item tracking (consider if needed).
*   **Tasks:**
    *   [TO DO] Implement a "Purchase Orders" module.
    *   [TO DO] Ensure POs can be created and deeply linked to Projects and Suppliers (Contacts).
    *   [TO DO] Include comprehensive fields for tracking PO details.
    *   [TO DO] Implement the ability to add PO Items, with options to import from the Cost Items Database and Blueprint of Values, or add manually.
    *   [TO DO] Implement attachment support.
    *   [TO DO] Consider implementing delivered item tracking if needed.
*   **API Endpoints Needed:**
    *   `POST /api/purchase-orders`: Create new PO (linked to project/supplier).
    *   `GET /api/purchase-orders`: Retrieve POs (with filtering/search).
    *   `GET /api/purchase-orders/:id`: Retrieve PO details (including items).
    *   `PUT /api/purchase-orders/:id`: Update PO.
    *   `DELETE /api/purchase-orders/:id`: Delete PO.
    *   `POST /api/purchase-orders/:id/items`: Add item to PO.
    *   `PUT /api/purchase-orders/:id/items/:itemId`: Update PO item.
    *   `DELETE /api/purchase-orders/:id/items/:itemId`: Delete PO item.
    *   `POST /api/purchase-orders/:id/attachments`: Add attachment to PO.
*   **Key Decisions/Notes:** Link POs to projects and suppliers, import items from other modules.

### 13. Subcontracts Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** "Subcontracts" module. Deeply linked to Projects and Subcontractors. Comprehensive fields for details. Ability to add Original Scope items. Sections for Documents, Terms, and Notes.
*   **Tasks:**
    *   [TO DO] Implement a "Subcontracts" module.
    *   [TO DO] Ensure Subcontracts can be created and deeply linked to Projects and Subcontractors (Contacts).
    *   [TO DO] Include comprehensive fields for tracking subcontract details.
    *   [TO DO] Implement the ability to add Original Scope items, potentially leveraging the same UI/logic as adding Estimate items.
    *   [TO DO] Include sections for Documents, Terms, and Notes, ensuring they are relationally linked to the Subcontract.
*   **API Endpoints Needed:**
    *   `POST /api/subcontracts`: Create new subcontract (linked to project/subcontractor).
    *   `GET /api/subcontracts`: Retrieve subcontracts (with filtering/search).
    *   `GET /api/subcontracts/:id`: Retrieve subcontract details (including items).
    *   `PUT /api/subcontracts/:id`: Update subcontract.
    *   `DELETE /api/subcontracts/:id`: Delete subcontract.
    *   `POST /api/subcontracts/:id/items`: Add item to subcontract.
    *   `PUT /api/subcontracts/:id/items/:itemId`: Update subcontract item.
    *   `DELETE /api/subcontracts/:id/items/:itemId`: Delete subcontract item.
    *   `POST /api/subcontracts/:id/documents`: Add document to subcontract.
    *   `PUT /api/subcontracts/:id/terms`: Update terms.
    *   `PUT /api/subcontracts/:id/notes`: Update notes.
*   **Key Decisions/Notes:** Link subcontracts to projects and subcontractors.

### 14. Time Cards Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Dedicated "Time Cards" module. Features for viewing time stats, upcoming days off, time spent on projects, and weekly timesheet. User-friendly interface for adding time entries with clock-in/out, project/location linking, and cost code selection. Detailed activity log. Deeply linked to Projects and Cost Codes for job costing.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Time Cards" module.
    *   [TO DO] Include features for viewing time stats, upcoming days off, time spent on current projects, and a weekly timesheet.
    *   [TO DO] Develop a user-friendly interface for adding time entries with clock-in/out, project/location linking, and cost code selection.
    *   [TO DO] Implement a detailed activity log for time entries.
    *   [TO DO] Ensure time entries are deeply linked to Projects and Cost Codes in the Supabase schema and are used for job costing calculations.
    *   [TO DO] Improvement Area: Address the lack of offline functionality for time tracking, which was noted as a major weakness of Contractor Foreman's mobile app. This is a significant challenge but a key area for future development.
*   **API Endpoints Needed:**
    *   `POST /api/time-cards`: Create new time card entry (clock-in).
    *   `PUT /api/time-cards/:id`: Update time card entry (clock-out, edit).
    *   `GET /api/time-cards`: Retrieve time card entries (with filtering/search).
    *   `GET /api/time-cards/stats`: Retrieve time card statistics.
    *   `GET /api/time-cards/weekly-timesheet`: Retrieve weekly timesheet data.
    *   `GET /api/time-cards/activity-log`: Retrieve detailed activity log.
*   **Key Decisions/Notes:** Comprehensive time tracking, offline functionality is a future challenge.

### 15. Invoicing, Payments, and Job Costing Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Dedicated "Invoices" and "Payments" modules. Invoices deeply linked to Projects and Customers. Robust functionality for adding items to Invoices (import from CID, BOV, Approved Estimates; manual; discounts; retainage; time & material - unbilled only). Comprehensive Payments workflow. Robust Job Costing system automatically aggregating data from all relevant linked modules. Job Costing reports.
*   **Tasks:**
    *   [TO DO] Implement dedicated "Invoices" and "Payments" modules.
    *   [TO DO] Ensure Invoices can be created and deeply linked to Projects and Customers.
    *   [TO DO] Implement robust functionality for adding items to Invoices, including importing from the Cost Items Database, Blueprint of Values, and Approved Estimates.
    *   [TO DO] Implement the ability to add Manual Invoice Items, Discounts, and Retainage.
    *   [TO DO] Develop a feature to add Time and Material items (Time Cards, Expenses, Change Orders, Bills, Equipment Logs) to Invoices, ensuring only unbilled items are presented.
    *   [TO DO] Implement a comprehensive Payments workflow for recording and tracking payments against invoices.
    *   [TO DO] Develop a robust Job Costing system that automatically aggregates data from all relevant linked modules (Estimates, Invoices, Payments, Expenses, Time Cards, POs, Bills, Change Orders, Equipment Logs) in the Supabase schema.
    *   [TO DO] Implement Job Costing reports to provide insights into project profitability.
*   **API Endpoints Needed:**
    *   `POST /api/invoices`: Generate new invoice (linked to project/customer).
    *   `GET /api/invoices`: Retrieve invoices (with filtering/search/status).
    *   `GET /api/invoices/:id`: Retrieve invoice details (including items).
    *   `PUT /api/invoices/:id`: Update invoice.
    *   `DELETE /api/invoices/:id`: Delete invoice.
    *   `POST /api/invoices/:id/items`: Add item to invoice.
    *   `PUT /api/invoices/:id/items/:itemId`: Update invoice item.
    *   `DELETE /api/invoices/:id/items/:itemId`: Delete invoice item.
    *   `POST /api/invoices/:id/add-time-material`: Add time and material items to invoice (showing unbilled).
    *   `POST /api/payments`: Record new payment (linked to invoice/customer).
    *   `GET /api/payments`: Retrieve payments (with filtering/search).
    *   `GET /api/payments/:id`: Retrieve payment details.
    *   `PUT /api/payments/:id`: Update payment.
    *   `DELETE /api/payments/:id`: Delete payment.
    *   `GET /api/projects/:id/job-costing-report`: Retrieve job costing report for project.
    *   `GET /api/job-costing-reports`: Retrieve overall job costing reports.
*   **Key Decisions/Notes:** Comprehensive job costing, unbilled items for time and materials.

### 16. Client Portal Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Dedicated Client Portal per project. Secure access to project progress, updates, shared files, estimates, invoices, and change orders. Electronic signature capabilities. Online payment processing via Square API. Granular controls for contractors on shared information.
*   **Tasks:**
    *   [TO DO] Implement a dedicated Client Portal for each project.
    *   [TO DO] Provide clients with secure access to view project progress, updates, shared files, estimates, invoices, and change orders.
    *   [TO DO] Implement electronic signature capabilities for documents shared through the portal.
    *   [TO DO] Integrate with Square API for online payment processing of invoices.
    *   [TO DO] Develop granular controls for contractors to manage what information is visible to the client in the portal.
*   **API Endpoints Needed:**
    *   `GET /api/projects/:id/client-portal-data`: Retrieve data for client portal (based on contractor sharing settings).
    *   `POST /api/documents/:id/esign`: Endpoint for client e-signature.
    *   `POST /api/invoices/:id/pay`: Initiate online payment via Square.
    *   `PUT /api/projects/:id/client-access-settings`: Update contractor sharing settings for client portal.
*   **Key Decisions/Notes:** Transparency and access for clients, e-sign, online payments.

### 17. Reporting Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Comprehensive "Reporting" module. Wide range of pre-built reports. Flexible custom report builder. Prioritize interactive in-app viewing. Optimized report performance.
*   **Tasks:**
    *   [TO DO] Implement a comprehensive "Reporting" module.
    *   [TO DO] Provide a wide range of pre-built reports covering all modules.
    *   [TO DO] Develop a flexible custom report builder allowing users to select data points and apply advanced filtering.
    *   [TO DO] Prioritize interactive in-app viewing of reports, in addition to export options (e.g., PDF, CSV).
    *   [TO DO] Ensure report performance is optimized, especially for larger datasets.
*   **API Endpoints Needed:**
    *   `GET /api/reports`: Retrieve list of available reports.
    *   `POST /api/reports/custom`: Create/save custom report definition.
    *   `POST /api/reports/generate`: Generate a report (with filtering/parameters).
    *   `GET /api/reports/:id`: Retrieve details of a saved custom report.
    *   `PUT /api/reports/:id`: Update saved custom report.
    *   `DELETE /api/reports/:id`: Delete saved custom report.
*   **Key Decisions/Notes:** Customizable reports, interactive viewing.

### 18. Membership/Rewards Management Workflow

*   **Status:** In Progress
*   **PROActive OS Adaptation Summary:** Dedicated "Membership/Rewards" module. Flexible membership tiers. Points earning and redemption system. Various methods for earning points. Process for redeeming points for discounts. Functionality to manage optional add-on packages. Integration with CRM.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Membership/Rewards" module.
    *   [TO DO] Define flexible membership tiers with customizable benefits and point multipliers.
    *   [TO DO] Develop a system for tracking points earned and redeemed by clients.
    *   [TO DO] Implement various methods for clients to earn points (linked to spending on services/materials, sign-ups, referrals, social media engagement).
    *   [TO DO] Implement a process for clients to redeem points for discounts on future services or invoices.
    *   [TO DO] Develop functionality to manage optional add-on packages linked to membership tiers.
    *   [TO DO] Integrate with the CRM to link membership/rewards data to clients.
*   **API Endpoints Needed:**
    *   `POST /api/membership-tiers`: Create new membership tier.
    *   `GET /api/membership-tiers`: Retrieve membership tiers.
    *   `PUT /api/membership-tiers/:id`: Update membership tier.
    *   `DELETE /api/membership-tiers/:id`: Delete membership tier.
    *   `POST /api/clients/:id/points`: Add points to client.
    *   `POST /api/clients/:id/redeem-points`: Redeem points for client.
    *   `GET /api/clients/:id/points-history`: Retrieve client's points history.
    *   `POST /api/membership-plans`: Create new membership plan.
    *   `GET /api/membership-plans`: Retrieve membership plans.
    *   `PUT /api/membership-plans/:id`: Update membership plan.
    *   `DELETE /api/membership-plans/:id`: Delete membership plan.
    *   `POST /api/clients/:id/membership`: Assign membership plan to client.
*   **Key Decisions/Notes:** Customizable membership tiers, points system.

### 19. Voice Notes Module

*   **Status:** Planned (Future Integration)
*   **Description:** Future integration point for AI transcription of voice notes.

### 20. Communication Module

*   **Status:** Planned (Future Integration)
*   **Description:** Future placeholder for Sendbird integration for integrated email and in-app messaging capabilities.
