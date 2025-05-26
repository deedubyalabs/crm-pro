# Development Roadmap: PROActive OS - AI-Powered Operations Hub

**Version:** 1.0
**Date:** May 26, 2025

## Overall Project Status

**Phase 3: UI/UX Refinements & AI Insights Panel - In Progress**

## Current Sprint/Focus

The immediate focus is on completing Phase 3: "UI/UX Refinements & AI Insights Panel".
- Design content and data flow for "AI Insights & Suggestions" Panel.
- Further integrate Agent Data Fabric (ADF) with Supabase (including transitioning from `InMemorySaver` to `SupabaseSaver` for production).
- Agent Workspace Repurposing: Continue work on `app/agent-workspace/` as a centralized hub for monitoring, debugging, and configuring the Pro-pilot AI assistant and other future agents. This includes fetching historical logs, implementing filtering, and designing UI for configuration and performance monitoring.

## Workflow Breakdown & Development Tasks

### 1. CRM Workflow (Leads and Opportunities)

*   **PROActive OS Adaptation Summary:** Unified Contact entity in Supabase with a `type` field, automated Lead-to-Customer conversion, "add as you go" categories, dedicated "Jobs" feature linkable to entities, streamlined UI with modals, deep relational linking for AI access, embedded chat, and proactive AI assistance.
*   **Tasks:**
    *   [COMPLETED] Refine design and responsiveness for `app/people/person-form.tsx` and `app/opportunities/opportunity-form.tsx` by adding `ScrollArea`.
    *   [COMPLETED] Convert `app/people/[id]/edit/page.tsx`, `app/opportunities/[id]/edit/page.tsx`, `app/people/new/page.tsx`, and `app/opportunities/new/page.tsx` to side drawers and increased their width.
    *   [COMPLETED] Implement consistent validation and error handling for `person-form.tsx` and `opportunity-form.tsx`.
    *   [COMPLETED] Implement predictive lead scoring (`lead_score` column, `calculate-lead-score.ts` tool, display in UI).
    *   [COMPLETED] Implement automated opportunity updates (`suggest-opportunity-update.ts` tool, `opportunity-suggestions.tsx` component).
    *   [COMPLETED] Implement AI-driven suggestions for next steps (`suggest-next-action.ts` tool).
    *   [COMPLETED] Implement automated Lead-to-Customer conversion workflow upon project creation, potentially with AI assistance for data enrichment.
    *   [TO DO] Implement "add as you go" functionality for categories (Source, Stage, Type) via separate Supabase tables and associated UI/API, with these categories accessible to AI agents via the ADF.
    *   [TO DO] Consider embedding a chat interface within the CRM views for direct interaction with AI agents for tasks like lead qualification or communication drafting.
    *   [TO DO] Implement proactive AI assistance for lead nurturing and opportunity management (e.g., suggesting follow-up actions).
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
    *   `POST /api/ai/qualify-lead`: Endpoint to trigger AI lead qualification.
    *   `POST /api/ai/draft-communication`: Endpoint to trigger AI communication drafting.
*   **Key Decisions/Notes:** Unified Contact entity with `type` field confirmed. Modals for initial creation forms for Contacts, Opportunities, and Jobs.

### 2. Estimate Creation Workflow (from Opportunity and Items View)

*   **PROActive OS Adaptation Summary:** Enhanced Estimate items view with sections, optional items, tax marking, and item assignment. Comprehensive Cost Items database UI with tabbed views and item groups. Seamless integration with Cost Items database via side drawer. Bulk markup functionality with AI suggestions. BigBoxAPI integration. "Add as you go" for line items and cost item categories. Summary view, dedicated UI sections for Terms, Scope of Work, Bidding, Files, Cover Sheet, Notes. "Review and Submit" workflow with preview and AI assistance. Embedded chat interface within the Estimate view for AI Estimator agent.
*   **Tasks:**
    *   [TO DO] Enhance existing Estimate items view to replicate the robust functionality, including sections (with optional), item options (optional, tax), and item assignment.
    *   [TO DO] Develop a comprehensive Cost Items database UI with a tabbed view (Material, Equipment, Labor, Subcontractor, Other, Groups), search, filtering, and the ability to create and manage item groups, with this data accessible to AI agents via the ADF.
    *   [TO DO] Implement seamless integration with the Cost Items database from the Estimate items view via a side drawer, allowing import of existing items and adding new ones "as you go".
    *   [TO DO] Implement bulk markup functionality with flexible application options, potentially with AI suggestions for markup percentages based on project context.
    *   [TO DO] Integrate with the BigBoxAPI for bulk searching and adding material items to the Cost Items database, likely via an Agno agent tool.
    *   [TO DO] Implement "add as you go" functionality for line items and cost item categories, accessible to AI agents.
    *   [TO DO] Utilize modals/sidedrawers for adding items, sections, and new cost items, ensuring a smooth UI experience that minimizes navigating away from the estimate.
    *   [TO DO] Ensure Supabase schema supports estimate sections, optional items, tax marking, assignments, markup details, and item groups within the Cost Items database, integrated into the ADF.
    *   [TO DO] Develop a summary view displaying estimated cost, profit margin, hours needed, markup, etc., potentially with AI insights.
    *   [TO DO] Create dedicated UI sections and backend logic for Terms, Scope of Work, Bidding, Files, Cover Sheet, and Notes, ensuring they are relationally linked to the Estimate in the Supabase schema and accessible to AI agents.
    *   [TO DO] Implement a "Review and Submit" workflow with a preview of the estimate package (potentially generating a PDF), with AI assistance for review and finalization.
    *   [TO DO] Crucially, integrate an embedded chat interface within the Estimate view, allowing users to interact conversationally with the AI Estimator agent for generating, refining, and editing estimate line items.
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
    *   `POST /api/integrations/bigbox/search`: Search BigBox API (likely via agent endpoint).
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
    *   `POST /api/ai/estimate-chat`: Endpoint for embedded conversational estimation.
*   **Key Decisions/Notes:** Integration with Cost Items Database via side drawer, "add as you go" for items/categories, bulk markup, AI Estimator agent.

### 3. Contractor/Bids Workflow (from Estimate)

*   **PROActive OS Adaptation Summary:** Estimates list dashboard, Bidding section within Estimate (bid package creation, item selection), unified Contact entity for contractors, centralized Documents module for all contractor-related documents, email bid packages with subcontractor interface for submission, "Submissions" section for review and status management, apply awarded bid price to estimate item, deep relational linking, and AI assistance for bid analysis.
*   **Tasks:**
    *   [TO DO] Develop an Estimates list dashboard providing status summaries and a detailed list view.
    *   [TO DO] Implement a Bidding section within the Estimate view, allowing users to create bid packages and select specific estimate items to include.
    *   [TO DO] Ensure contractor details are managed within the unified Contact entity in the CRM, integrated into the ADF.
    *   [TO DO] Store all contractor-related documents (insurance, licenses, general files) within the central Documents module, utilizing a `type` field to categorize them, accessible to AI agents via the ADF.
    *   [TO DO] Implement functionality to email the bid package when its status is final, providing a simple interface for subcontractors to submit their bid price, potentially with AI assistance in drafting the email.
    *   [TO DO] Develop a "Submissions" section within the Bidding feature for reviewing submitted bids and managing their status (Award, Request rebid, Decline, In Review), potentially with AI analysis of bids.
    *   [TO DO] Implement the functionality to apply the awarded bid price to the corresponding estimate item price.
    *   [TO DO] Ensure deep relational linking between Estimates, Bid Packages, Contractors (Contacts), Documents, and Estimate Items, integrated into the ADF.
    *   [TO DO] Improvement Area: Ensure the subcontractor bid submission process is seamless and potentially integrated more closely, while remaining simple for the subcontractor. Consider AI assistance for bid analysis and comparison.
*   **API Endpoints Needed:**
    *   `POST /api/estimates`: Create new estimate.
    *   `GET /api/estimates`: Retrieve list of estimates (with filtering/search/status).
    *   `POST /api/estimates/:id/bid-packages`: Create new bid package for estimate.
    *   `GET /api/estimates/:id/bid-packages/:bidPackageId`: Retrieve bid package details.
    *   `PUT /api/estimates/:id/bid-packages/:bidPackageId`: Update bid package (including items, status).
    *   `DELETE /api/estimates/:id/bid-packages/:bidPackageId`: Delete bid package.
    *   `POST /api/estimates/:id/bid-packages/:bidPackageId/email`: Email bid package (potentially via AI endpoint).
    *   `POST /api/bid-submissions`: Endpoint for subcontractors to submit bids (external).
    *   `GET /api/estimates/:id/bid-packages/:bidPackageId/submissions`: Retrieve bid submissions.
    *   `PUT /api/bid-submissions/:submissionId`: Update bid submission status (Award, Decline, etc.).
    *   `POST /api/bid-submissions/:submissionId/apply-price`: Apply awarded bid price to estimate item.
    *   `POST /api/contacts/:id/documents`: Add document to contact (with type).
    *   `POST /api/ai/analyze-bids`: Endpoint to trigger AI bid analysis.
*   **Key Decisions/Notes:** Centralized document storage for contractors.

### 4. Post-Estimate Approval Workflow

*   **PROActive OS Adaptation Summary:** Implement a modal or clear UI element upon estimate approval presenting the user with key next steps: adding items to Schedule of Values, generating an initial Invoice, and creating a Project/Schedule. Ensure seamless transitions to relevant modules with AI assistance. Deep relational linking between approved Estimate and new entities.
*   **Tasks:**
    *   [TO DO] Implement a similar modal or clear UI element upon estimate approval presenting the user with key next steps: adding items to Schedule of Values, generating an initial Invoice, and creating a Project/Schedule.
    *   [TO DO] Ensure these options seamlessly transition the user to the relevant module or initiate the respective process, potentially with AI assistance in initiating these processes.
    *   [TO DO] Ensure deep relational linking between the approved Estimate and the newly created/updated entities (Schedule of Values, Invoice, Project, Schedule), integrated into the ADF.
*   **API Endpoints Needed:**
    *   `POST /api/estimates/:id/approve`: Approve estimate.
    *   `POST /api/estimates/:id/add-to-sov`: Add estimate items to Schedule of Values.
    *   `POST /api/estimates/:id/generate-invoice`: Generate invoice from estimate.
    *   `POST /api/estimates/:id/create-project-and-schedule`: Create project and schedule from estimate (potentially via AI endpoint).
*   **Key Decisions/Notes:** Clear next steps upon estimate approval.

### 5. Project Management Workflow (Dashboard and Details)

*   **PROActive OS Adaptation Summary:** Projects dashboard list view with AI insights. Comprehensive Project details view with clear navigation to various integrated sections. Deep integration and display of relevant linked data within each section. Functionality to easily add new related items with AI assistance. Deep relational linking in Supabase schema. Embedded chat interface within Project details view for AI agents. Proactive AI assistance for project management.
*   **Tasks:**
    *   [TO DO] Develop a Projects dashboard list view displaying key project details and summaries, potentially with AI-powered insights or action item suggestions.
    *   [TO DO] Create a comprehensive Project details view with a clear navigation structure (sidebar or tabs) to various sections mirroring the required modules (Summary, Financial, Schedule of Values, Documents, Time, Files & Photos, Contacts, Schedule, Procurement, Client Access, Reports).
    *   [TO DO] Ensure each section within the Project details view is deeply integrated and displays relevant linked data (e.g., Financial section shows linked invoices, expenses, change orders; Documents section shows linked files; Time section shows linked time entries), with this data accessible to AI agents via the ADF.
    *   [TO DO] Implement functionality within each section to easily add new related items (e.g., add a new Daily Log from the Documents section, add a new Time Entry from the Time section), potentially with AI assistance for data entry or task creation.
    *   [TO DO] Ensure deep relational linking in the Supabase schema between Projects and all related entities (Estimates, Invoices, Expenses, Time Entries, Documents, Jobs, Contacts, Schedule, etc.), integrated into the ADF.
    *   [TO DO] Integrate an embedded chat interface within the Project details view, allowing users to interact conversationally with AI agents for project updates, task management, and information retrieval.
    *   [TO DO] Implement proactive AI assistance for project management (e.g., identifying potential delays, suggesting resource reallocations).
*   **API Endpoints Needed:**
    *   `GET /api/projects`: Retrieve list of projects (with filtering/sorting/status).
    *   `GET /api/projects/:id`: Retrieve project details (including data for all linked sections).
    *   `PUT /api/projects/:id`: Update project details.
    *   `POST /api/projects/:id/daily-logs`: Add daily log to project (potentially via AI endpoint).
    *   `POST /api/projects/:id/invoices`: Generate invoice for project (potentially via AI endpoint).
    *   `POST /api/projects/:id/punchlists`: Add punchlist to project (potentially via AI endpoint).
    *   `POST /api/projects/:id/documents`: Add document to project (potentially via AI endpoint).
    *   `POST /api/projects/:id/time-entries`: Add time entry to project (potentially via AI endpoint).
    *   `GET /api/projects/:id/schedule`: Retrieve project schedule.
    *   `GET /api/projects/:id/contacts`: Retrieve project contacts.
    *   `GET /api/projects/:id/procurement`: Retrieve procurement data for project.
    *   `GET /api/projects/:id/client-access`: Retrieve client access settings for project.
    *   `GET /api/projects/:id/reports`: Retrieve reports for project (potentially via AI endpoint for insights).
    *   `POST /api/ai/plan-project`: Endpoint to trigger AI project planning.
    *   `POST /api/ai/project-chat`: Endpoint for embedded conversational project management.
*   **Key Decisions/Notes:** Comprehensive project details view.

### 6. Job Management Workflow

*   **PROActive OS Adaptation Summary:** Dedicated "Jobs" module linkable to Contacts, Opportunities, and Projects. Fields for task details, checklist functionality with adapted status updates ("In Progress" on checklist item completion). List and Kanban views for Jobs with AI-powered task prioritization. Embedded chat interface within Jobs module. Proactive AI assistance for task management.
*   **Tasks:**
    *   [COMPLETED] `jobs` table modified to link `assigned_to` to `people` table, and new columns (`due_date`, `due_time`, `priority`, `linked_contact_id`, `linked_opportunity_id`, `tags`) added. `job_checklist_items` table created.
    *   [TO DO] Develop a dedicated "Jobs" module linkable to Contacts, Opportunities, and Projects.
    *   [TO DO] Implement checklist functionality within Jobs with adapted status update logic (e.g., "In Progress" on checklist item completion). The status should only become "Complete" when all checklist items are completed or the user manually sets it.
    *   [TO DO] Provide list and potentially Kanban views for Jobs, potentially with AI-powered task prioritization or suggestions.
    *   [TO DO] Implement embedded chat interface within the Jobs module for direct interaction with AI agents for task management and updates.
    *   [TO DO] Implement proactive AI assistance for task management (e.g., reminding users of upcoming deadlines, suggesting task breakdowns).
*   **API Endpoints Needed:**
    *   `POST /api/jobs`: Create new job (linked to entity).
    *   `GET /api/jobs`: Retrieve jobs (with filtering/search/status).
    *   `GET /api/jobs/:id`: Retrieve job details (including checklist items).
    *   `PUT /api/jobs/:id`: Update job.
    *   `DELETE /api/jobs/:id`: Delete job.
    *   `POST /api/jobs/:id/checklist-items`: Add checklist item to job (potentially via AI endpoint).
    *   `PUT /api/jobs/:id/checklist-items/:itemId`: Update checklist item (including completion status).
    *   `POST /api/ai/job-chat`: Endpoint for embedded conversational job management.
*   **Key Decisions/Notes:** Renamed "To-Do's" to "Jobs". Adapted status update logic for checklists.

### 7. Work Orders and Service Tickets Workflow

*   **PROActive OS Adaptation Summary:** Dedicated "Work Orders" and "Service Tickets" modules. Work Orders linked to clients and projects. Service Tickets integrated with membership plans. Electronic signature support for Service Tickets. Embedded chat interfaces and proactive AI assistance.
*   **Tasks:**
    *   [TO DO] Implement dedicated "Work Orders" and "Service Tickets" modules.
    *   [TO DO] Ensure Work Orders can be linked to clients and projects, with this data integrated into the ADF.
    *   [TO DO] Ensure Service Tickets are deeply integrated with the planned membership plans feature, linking to specific plans and included services/tasks, with this data integrated into the ADF.
    *   [TO DO] Include relevant fields for tracking details specific to Work Orders and Service Tickets, accessible to AI agents.
    *   [TO DO] Implement electronic signature support for Service Tickets.
    *   [TO DO] Consider embedding chat interfaces within these modules for AI assistance in managing work orders and service tickets.
    *   [TO DO] Implement proactive AI assistance for scheduling, dispatching, and status updates for work orders and service tickets.
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
    *   `POST /api/ai/work-order-chat`: Endpoint for embedded conversational work order management.
    *   `POST /api/ai/service-ticket-chat`: Endpoint for embedded conversational service ticket management.
*   **Key Decisions/Notes:** Dedicated modules for Work Orders and Service Tickets.

### 8. Change Order Workflow

*   **PROActive OS Adaptation Summary:** Dedicated "Change Orders" module. Deeply linked to Projects and Customers. Comprehensive fields for details. Process for adding Change Order Items (import from Estimate/SOV). Workflow for submitting for approval (email, client e-signature). Status tracking. Automatic updates to Project financials and Schedule of Values. Embedded chat interface and proactive AI assistance.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Change Orders" module.
    *   [TO DO] Ensure Change Orders can be created and deeply linked to Projects and Customers, with this data integrated into the ADF.
    *   [TO DO] Include comprehensive fields for tracking change order details, accessible to AI agents.
    *   [TO DO] Implement a process for adding Change Order Items, with options to import from the linked Estimate or Schedule of Values, potentially with AI assistance in identifying relevant items.
    *   [TO DO] Develop a workflow for submitting Change Orders for approval, including email notification and a client interface for review and electronic signature, potentially with AI assistance in drafting the submission email.
    *   [TO DO] Implement status tracking for Change Orders, with potential for proactive AI notifications on status changes.
    *   [TO DO] Ensure approved Change Orders automatically update Project financials and the Schedule of Values, with AI verification of the updates.
    *   [TO DO] Consider embedding a chat interface within the Change Orders module for AI assistance in managing change orders.
    *   [TO DO] Implement proactive AI assistance for tracking change order approvals and identifying potential delays.
*   **API Endpoints Needed:**
    *   `POST /api/change-orders`: Create new change order (linked to project/customer).
    *   `GET /api/change-orders`: Retrieve change orders (with filtering/search/status).
    *   `GET /api/change-orders/:id`: Retrieve change order details (including items).
    *   `PUT /api/change-orders/:id`: Update change order.
    *   `DELETE /api/change-orders/:id`: Delete change order.
    *   `POST /api/change-orders/:id/items`: Add item to change order (potentially via AI endpoint).
    *   `PUT /api/change-orders/:id/items/:itemId`: Update change order item.
    *   `DELETE /api/change-orders/:id/items/:itemId`: Delete change order item.
    *   `POST /api/change-orders/:id/submit-for-approval`: Submit change order for approval (potentially via AI endpoint).
    *   `POST /api/change-orders/:id/approve`: Endpoint for client approval (external interface).
    *   `POST /api/change-orders/:id/decline`: Endpoint for client decline (external interface).
    *   `POST /api/change-orders/:id/import-from-estimate`: Import items from estimate (potentially via AI endpoint).
    *   `POST /api/change-orders/:id/import-from-sov`: Import items from SOV (potentially via AI endpoint).
    *   `POST /api/ai/change-order-chat`: Endpoint for embedded conversational change order management.
*   **Key Decisions/Notes:** Electronic signature support, integration with project financials.

### 9. Daily Log Workflow

*   **PROActive OS Adaptation Summary:** Dedicated "Daily Logs" module. Deeply linked to Projects. Comprehensive fields for daily site information. Sections for People on Site, Material details, Equipment details, Notes, Files, and Incidents & Accidents. Embedded chat interface and proactive AI assistance.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Daily Logs" module.
    *   [TO DO] Ensure Daily Logs can be created and deeply linked to Projects, with this data integrated into the ADF.
    *   [TO DO] Include comprehensive fields for capturing daily site information, mirroring the Contractor Foreman approach (date, time, tasks, weather, jobsite conditions, delays), accessible to AI agents.
    *   [TO DO] Implement sections within the Daily Log for adding and linking People on Site (employees, subcontractors, visitors) with time entries, Material details (notes, delivered, used), Equipment details (notes, delivered, used, logs), Notes, Files, and Incidents & Accidents, with potential for AI assistance in data entry or summarizing information.
    *   [TO DO] Consider embedding a chat interface within the Daily Logs module for AI assistance in creating and reviewing daily logs.
    *   [TO DO] Implement proactive AI assistance for daily logs (e.g., identifying potential issues based on reported conditions, suggesting follow-up actions).
*   **API Endpoints Needed:**
    *   `POST /api/daily-logs`: Create new daily log (linked to project).
    *   `GET /api/daily-logs`: Retrieve daily logs (with filtering/search).
    *   `GET /api/daily-logs/:id`: Retrieve daily log details.
    *   `PUT /api/daily-logs/:id`: Update daily log.
    *   `DELETE /api/daily-logs/:id`: Delete daily log.
    *   `POST /api/daily-logs/:id/people`: Add people on site to daily log (potentially via AI endpoint).
    *   `POST /api/daily-logs/:id/materials`: Add material details to daily log (potentially via AI endpoint).
    *   `POST /api/daily-logs/:id/equipment`: Add equipment details to daily log (potentially via AI endpoint).
    *   `POST /api/daily-logs/:id/notes`: Add notes to daily log (potentially via AI endpoint).
    *   `POST /api/daily-logs/:id/files`: Add files to daily log (potentially via AI endpoint).
    *   `POST /api/daily-logs/:id/incidents`: Add incident to daily log (potentially via AI endpoint).
    *   `POST /api/ai/daily-log-chat`: Endpoint for embedded conversational daily log management.
*   **Key Decisions/Notes:** Comprehensive daily site information capture.

### 10. Expense Workflow

*   **PROActive OS Adaptation Summary:** Dedicated "Expenses" module. Deeply linked to Projects. Comprehensive fields for details. Option to mark as Billable. Reflection in Project financials and reports. Embedded chat interface and proactive AI assistance.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Expenses" module.
    *   [TO DO] Ensure Expenses can be created and deeply linked to Projects, with this data integrated into the ADF.
    *   [TO DO] Include comprehensive fields for tracking expense details (date, vendor, name, total, bank account, category, notes, reference number, receipt), accessible to AI agents.
    *   [TO DO] Implement the option to mark an expense as Billable.
    *   [TO DO] Ensure expenses are reflected in Project financials and reports, potentially with AI analysis of spending patterns.
    *   [TO DO] Consider embedding a chat interface within the Expenses module for AI assistance in managing expenses.
    *   [TO DO] Implement proactive AI assistance for expense management (e.g., identifying potential cost savings, suggesting expense categorization).
*   **API Endpoints Needed:**
    *   `POST /api/expenses`: Create new expense (linked to project).
    *   `GET /api/expenses`: Retrieve expenses (with filtering/search).
    *   `GET /api/expenses/:id`: Retrieve expense details.
    *   `PUT /api/expenses/:id`: Update expense.
    *   `DELETE /api/expenses/:id`: Delete expense.
    *   `POST /api/ai/expense-chat`: Endpoint for embedded conversational expense management.
*   **Key Decisions/Notes:** Link expenses to projects, mark as billable.

### 11. Purchase Order Workflow

*   **PROActive OS Adaptation Summary:** "Purchase Orders" module. Deeply linked to Projects and Suppliers. Comprehensive fields for details. Ability to add PO Items (import from Cost Items Database, Schedule of Values, or manually). Attachment support. Delivered item tracking (consider if needed). Embedded chat interface and proactive AI assistance.
*   **Tasks:**
    *   [TO DO] Implement a "Purchase Orders" module.
    *   [TO DO] Ensure POs can be created and deeply linked to Projects and Suppliers (Contacts), with this data integrated into the ADF.
    *   [TO DO] Include comprehensive fields for tracking PO details, accessible to AI agents.
    *   [TO DO] Implement the ability to add PO Items, with options to import from the Cost Items Database and Schedule of Values, or add manually, potentially with AI assistance in identifying needed materials.
    *   [TO DO] Implement attachment support.
    *   [TO DO] Consider implementing delivered item tracking if needed, potentially with AI tracking and notifications.
    *   [TO DO] Consider embedding a chat interface within the Purchase Orders module for AI assistance in managing POs.
    *   [TO DO] Implement proactive AI assistance for purchase order management (e.g., reminding users of upcoming deliveries, suggesting reordering).
*   **API Endpoints Needed:**
    *   `POST /api/purchase-orders`: Create new PO (linked to project/supplier).
    *   `GET /api/purchase-orders`: Retrieve POs (with filtering/search).
    *   `GET /api/purchase-orders/:id`: Retrieve PO details (including items).
    *   `PUT /api/purchase-orders/:id`: Update PO.
    *   `DELETE /api/purchase-orders/:id`: Delete PO.
    *   `POST /api/purchase-orders/:id/items`: Add item to PO (potentially via AI endpoint).
    *   `PUT /api/purchase-orders/:id/items/:itemId`: Update PO item.
    *   `DELETE /api/purchase-orders/:id/items/:itemId`: Delete PO item.
    *   `POST /api/purchase-orders/:id/attachments`: Add attachment to PO.
    *   `POST /api/ai/purchase-order-chat`: Endpoint for embedded conversational purchase order management.
*   **Key Decisions/Notes:** Link POs to projects and suppliers, import items from other modules.

### 12. Subcontracts Workflow

*   **PROActive OS Adaptation Summary:** "Subcontracts" module. Deeply linked to Projects and Subcontractors. Comprehensive fields for details. Ability to add Original Scope items. Sections for Documents, Terms, and Notes. Embedded chat interface and proactive AI assistance.
*   **Tasks:**
    *   [TO DO] Implement a "Subcontracts" module.
    *   [TO DO] Ensure Subcontracts can be created and deeply linked to Projects and Subcontractors (Contacts), with this data integrated into the ADF.
    *   [TO DO] Include comprehensive fields for tracking subcontract details, accessible to AI agents.
    *   [TO DO] Implement the ability to add Original Scope items, potentially leveraging the same UI/logic as adding Estimate items, with potential for AI assistance in defining the scope.
    *   [TO DO] Include sections for Documents, Terms, and Notes, ensuring they are relationally linked to the Subcontract and accessible to AI agents.
    *   [TO DO] Consider embedding a chat interface within the Subcontracts module for AI assistance in managing subcontracts.
    *   [TO DO] Implement proactive AI assistance for subcontract management (e.g., reminding users of upcoming payment milestones, suggesting contract clauses).
*   **API Endpoints Needed:**
    *   `POST /api/subcontracts`: Create new subcontract (linked to project/subcontractor).
    *   `GET /api/subcontracts`: Retrieve subcontracts (with filtering/search).
    *   `GET /api/subcontracts/:id`: Retrieve subcontract details (including items).
    *   `PUT /api/subcontracts/:id`: Update subcontract.
    *   `DELETE /api/subcontracts/:id`: Delete subcontract.
    *   `POST /api/subcontracts/:id/items`: Add item to subcontract (potentially via AI endpoint).
    *   `PUT /api/subcontracts/:id/items/:itemId`: Update subcontract item.
    *   `DELETE /api/subcontracts/:id/items/:itemId`: Delete subcontract item.
    *   `POST /api/subcontracts/:id/documents`: Add document to subcontract.
    *   `PUT /api/subcontracts/:id/terms`: Update terms.
    *   `PUT /api/subcontracts/:id/notes`: Update notes.
    *   `POST /api/ai/subcontract-chat`: Endpoint for embedded conversational subcontract management.
*   **Key Decisions/Notes:** Link subcontracts to projects and subcontractors.

### 13. Time Cards Workflow

*   **PROActive OS Adaptation Summary:** Dedicated "Time Cards" module. Features for viewing time stats, upcoming days off, time spent on projects, and weekly timesheet. User-friendly interface for adding time entries with clock-in/out, project/location linking, and cost code selection. Detailed activity log. Deeply linked to Projects and Cost Codes for job costing. Improvement Area: Address lack of offline functionality. Embedded chat interface and proactive AI assistance.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Time Cards" module.
    *   [TO DO] Include features for viewing time stats, upcoming days off, time spent on current projects, and a weekly timesheet, potentially with AI analysis of time allocation.
    *   [TO DO] Develop a user-friendly interface for adding time entries with clock-in/out, project/location linking, and cost code selection, potentially with AI assistance for faster entry or suggestions.
    *   [TO DO] Implement a detailed activity log for time entries, accessible to AI agents for analysis.
    *   [TO DO] Ensure time entries are deeply linked to Projects and Cost Codes in the Supabase schema and are used for job costing calculations, integrated into the ADF.
    *   [TO DO] Improvement Area: Address the lack of offline functionality for time tracking, which was noted as a major weakness of Contractor Foreman's mobile app. This is a significant challenge but a key area for future development.
    *   [TO DO] Consider embedding a chat interface within the Time Cards module for AI assistance in managing time entries and viewing time-related reports.
    *   [TO DO] Implement proactive AI assistance for time tracking (e.g., reminding users to clock in/out, identifying discrepancies).
*   **API Endpoints Needed:**
    *   `POST /api/time-cards`: Create new time card entry (clock-in).
    *   `PUT /api/time-cards/:id`: Update time card entry (clock-out, edit).
    *   `GET /api/time-cards`: Retrieve time card entries (with filtering/search).
    *   `GET /api/time-cards/stats`: Retrieve time card statistics (potentially via AI endpoint for analysis).
    *   `GET /api/time-cards/weekly-timesheet`: Retrieve weekly timesheet data.
    *   `GET /api/time-cards/activity-log`: Retrieve detailed activity log.
    *   `POST /api/ai/time-card-chat`: Endpoint for embedded conversational time card management.
*   **Key Decisions/Notes:** Comprehensive time tracking, offline functionality is a future challenge.

### 14. Invoicing, Payments, and Job Costing Workflow

*   **PROActive OS Adaptation Summary:** Dedicated "Invoices" and "Payments" modules. Invoices deeply linked to Projects and Customers. Robust functionality for adding items to Invoices (import from CID, SOV, Approved Estimates; manual; discounts; retainage; time & material - unbilled only). Comprehensive Payments workflow. Robust Job Costing system automatically aggregating data from all relevant linked modules. Job Costing reports with AI-powered analysis. Embedded chat interfaces and proactive AI assistance.
*   **Tasks:**
    *   [TO DO] Implement dedicated "Invoices" and "Payments" modules.
    *   [TO DO] Ensure Invoices can be created and deeply linked to Projects and Customers, with this data integrated into the ADF.
    *   [TO DO] Implement robust functionality for adding items to Invoices, including importing from the Cost Items Database, Schedule of Values, and Approved Estimates, potentially with AI assistance in identifying items to bill.
    *   [TO DO] Implement the ability to add Manual Invoice Items, Discounts, and Retainage.
    *   [TO DO] Develop a feature to add Time and Material items (Time Cards, Expenses, Change Orders, Bills, Equipment Logs) to Invoices, ensuring only unbilled items are presented, potentially with AI assistance in identifying unbilled items.
    *   [TO DO] Implement a comprehensive Payments workflow for recording and tracking payments against invoices, potentially with AI assistance in reconciliation.
    *   [TO DO] Develop a robust Job Costing system that automatically aggregates data from all relevant linked modules (Estimates, Invoices, Payments, Expenses, Time Cards, POs, Bills, Change Orders, Equipment Logs) in the Supabase schema, integrated into the ADF.
    *   [TO DO] Implement Job Costing reports to provide insights into project profitability, potentially with AI-powered analysis and insights.
    *   [TO DO] Consider embedding chat interfaces within the Invoicing, Payments, and Job Costing modules for AI assistance in managing financials.
    *   [TO DO] Implement proactive AI assistance for financial management (e.g., reminding users of upcoming invoice due dates, identifying potential cash flow issues).
*   **API Endpoints Needed:**
    *   `POST /api/invoices`: Generate new invoice (linked to project/customer).
    *   `GET /api/invoices`: Retrieve invoices (with filtering/search/status).
    *   `GET /api/invoices/:id`: Retrieve invoice details (including items).
    *   `PUT /api/invoices/:id`: Update invoice.
    *   `DELETE /api/invoices/:id`: Delete invoice.
    *   `POST /api/invoices/:id/items`: Add item to invoice (potentially via AI endpoint).
    *   `PUT /api/invoices/:id/items/:itemId`: Update invoice item.
    *   `DELETE /api/invoices/:id/items/:itemId`: Delete invoice item.
    *   `POST /api/invoices/:id/add-time-material`: Add time and material items to invoice (showing unbilled, potentially via AI endpoint).
    *   `POST /api/payments`: Record new payment (linked to invoice/customer).
    *   `GET /api/payments`: Retrieve payments (with filtering/search).
    *   `GET /api/payments/:id`: Retrieve payment details.
    *   `PUT /api/payments/:id`: Update payment.
    *   `DELETE /api/payments/:id`: Delete payment.
    *   `GET /api/projects/:id/job-costing-report`: Retrieve job costing report for project (potentially via AI endpoint for insights).
    *   `GET /api/job-costing-reports`: Retrieve overall job costing reports (potentially via AI endpoint for insights).
    *   `POST /api/ai/invoicing-chat`: Endpoint for embedded conversational invoicing management.
    *   `POST /api/ai/payments-chat`: Endpoint for embedded conversational payments management.
    *   `POST /api/ai/job-costing-chat`: Endpoint for embedded conversational job costing management.
*   **Key Decisions/Notes:** Comprehensive job costing, unbilled items for time and materials.

### 15. Client Portal Workflow

*   **PROActive OS Adaptation Summary:** Dedicated Client Portal per project. Secure access to project progress, updates, shared files, estimates, invoices, and change orders. Integrated chat with client-facing AI assistant. Electronic signature capabilities. Online payment processing via Square API. Granular controls for contractors on shared information. Embedded chat interface for clients.
*   **Tasks:**
    *   [TO DO] Implement a dedicated Client Portal for each project.
    *   [TO DO] Provide clients with secure access to view project progress, updates, shared files, estimates, invoices, and change orders, with this data integrated into the ADF.
    *   [TO DO] Integrate with the planned communication features (Sendbird) for client-contractor chat within the portal, potentially with a client-facing AI assistant.
    *   [TO DO] Implement electronic signature capabilities for documents shared through the portal.
    *   [TO DO] Integrate with Square API for online payment processing of invoices.
    *   [TO DO] Develop granular controls for contractors to manage what information is visible to the client in the portal.
    *   [TO DO] Consider embedding a chat interface within the Client Portal for clients to interact with an AI assistant for project updates or questions.
*   **API Endpoints Needed:**
    *   `GET /api/projects/:id/client-portal-data`: Retrieve data for client portal (based on contractor sharing settings).
    *   `POST /api/projects/:id/client-portal-chat`: Send message via client portal chat (potentially with AI endpoint).
    *   `POST /api/documents/:id/esign`: Endpoint for client e-signature.
    *   `POST /api/invoices/:id/pay`: Initiate online payment via Square.
    *   `PUT /api/projects/:id/client-access-settings`: Update contractor sharing settings for client portal.
    *   `POST /api/ai/client-portal-chat`: Endpoint for embedded conversational client portal interactions.
*   **Key Decisions/Notes:** Transparency and access for clients, integrated chat, e-sign, online payments.

### 16. Reporting Workflow

*   **PROActive OS Adaptation Summary:** Comprehensive "Reporting" module. Wide range of pre-built reports. Flexible custom report builder. Prioritize interactive in-app viewing. Optimized report performance. Embedded chat interface and proactive AI assistance. AI-powered analysis and insights.
*   **Tasks:**
    *   [TO DO] Implement a comprehensive "Reporting" module.
    *   [TO DO] Provide a wide range of pre-built reports covering all modules, with data accessible to AI agents via the ADF.
    *   [TO DO] Develop a flexible custom report builder allowing users to select data points and apply advanced filtering.
    *   [TO DO] Prioritize interactive in-app viewing of reports, in addition to export options (e.g., PDF, CSV).
    *   [TO DO] Ensure report performance is optimized, especially for larger datasets.
    *   [TO DO] Consider embedding a chat interface within the Reporting module for AI assistance in generating and analyzing reports.
    *   [TO DO] Implement proactive AI assistance for reporting (e.g., identifying key trends, suggesting reports to run).
    *   [TO DO] Integrate AI-powered analysis and insights directly into reports.
*   **API Endpoints Needed:**
    *   `GET /api/reports`: Retrieve list of available reports.
    *   `POST /api/reports/custom`: Create/save custom report definition.
    *   `POST /api/reports/generate`: Generate a report (with filtering/parameters, potentially via AI endpoint for insights).
    *   `GET /api/reports/:id`: Retrieve details of a saved custom report.
    *   `PUT /api/reports/:id`: Update saved custom report.
    *   `DELETE /api/reports/:id`: Delete saved custom report.
    *   `POST /api/ai/reporting-chat`: Endpoint for embedded conversational reporting management.
*   **Key Decisions/Notes:** Customizable reports, interactive viewing.

### 17. Membership/Rewards Management Workflow

*   **PROActive OS Adaptation Summary:** Dedicated "Membership/Rewards" module. Flexible membership tiers. Points earning and redemption system. Various methods for earning points. Process for redeeming points for discounts. Functionality to manage optional add-on packages. Integration with CRM. Consider email marketing/in-app chat messaging. Embedded chat interface and proactive AI assistance.
*   **Tasks:**
    *   [TO DO] Implement a dedicated "Membership/Rewards" module.
    *   [TO DO] Define flexible membership tiers with customizable benefits and point multipliers.
    *   [TO DO] Develop a system for tracking points earned and redeemed by clients, with this data integrated into the ADF.
    *   [TO DO] Implement various methods for clients to earn points (linked to spending on services/materials, sign-ups, referrals, social media engagement), potentially with AI tracking and analysis of earning opportunities.
    *   [TO DO] Implement a process for clients to redeem points for discounts on future services or invoices.
    *   [TO DO] Develop functionality to manage optional add-on packages linked to membership tiers.
    *   [TO DO] Integrate with the CRM to link membership/rewards data to clients.
    *   [TO DO] Consider integrating with email marketing or in-app chat messaging for marketing and communication related to memberships and rewards, while keeping complexity in mind and potentially leveraging AI for personalized messaging.
    *   [TO DO] Consider embedding a chat interface within the Membership/Rewards module for AI assistance in managing membership details or answering client questions.
    *   [TO DO] Implement proactive AI assistance for membership/rewards management (e.g., notifying clients of new rewards earned, suggesting redemption options).
*   **API Endpoints Needed:**
    *   `POST /api/membership-tiers`: Create new membership tier.
    *   `GET /api/membership-tiers`: Retrieve membership tiers.
    *   `PUT /api/membership-tiers/:id`: Update membership tier.
    *   `DELETE /api/membership-tiers/:id`: Delete membership tier.
    *   `POST /api/clients/:id/points`: Add points to client (potentially via AI endpoint).
    *   `POST /api/clients/:id/redeem-points`: Redeem points for client.
    *   `GET /api/clients/:id/points-history`: Retrieve client's points history.
    *   `POST /api/membership-plans`: Create new membership plan.
    *   `GET /api/membership-plans`: Retrieve membership plans.
    *   `PUT /api/membership-plans/:id`: Update membership plan.
    *   `DELETE /api/membership-plans/:id`: Delete membership plan.
    *   `POST /api/clients/:id/membership`: Assign membership plan to client.
    *   `POST /api/marketing/email`: Send marketing email (potentially linked to membership data, via AI endpoint).
    *   `POST /api/marketing/chat`: Send in-app chat marketing message (potentially linked to membership data, via AI endpoint).
    *   `POST /api/ai/membership-rewards-chat`: Endpoint for embedded conversational membership/rewards management.
*   **Key Decisions/Notes:** Membership tiers, points system, add-on packages.

## Cross-Cutting Tasks

*   **Agent Data Fabric (ADF) Enhancements:**
    *   [TO DO] Transition from `InMemorySaver` to `SupabaseSaver` for production-ready checkpointer.
*   **Agent Workspace Full Functionality:**
    *   [TO DO] Implement fetching and filtering of historical agent logs.
    *   [TO DO] Develop UI for configuring agent parameters and monitoring performance metrics.
*   **UI/UX Refinements (General):**
    *   [TO DO] Continue to ensure streamlined UI with modals for initial creation forms for Contacts, Opportunities, and Jobs, and for adding estimate items/sections/cost items.
    *   [COMPLETED] AI Assistant Chat: Enhanced chat interface for better user interaction and clarity of AI responses. Implemented streaming responses for a more dynamic experience and increased drawer width.
    *   [TO DO] Update and modernize the user interface throughout the application, ensuring it is intuitive and efficient, addressing the "dated" criticism of Contractor Foreman. Create a "super easy to use and understand" platform for contractors, with seamless integration of embedded chat interfaces and proactive assistance.
    *   [TO DO] Ensure deep integration and relational linking: Ensure all modules and data are deeply interlinked in the Supabase schema and accessible across the application, making it easy for users to see everything in front of them. This is a core principle for PROActive OS and the foundation for the Agent Data Fabric (ADF).
    *   [TO DO] Embedded AI: Integrate AI capabilities seamlessly into workflows through embedded chat interfaces and proactive assistance features, minimizing the need for users to navigate to separate AI modules.
    *   [TO DO] Proactive Assistance: Design the system to proactively identify potential issues, suggest actions, and anticipate user needs across all modules, leveraging AI analysis of the data in the ADF.

## Known Issues/Blockers

*   None critical at this moment, focus is on new feature development and refinements.
