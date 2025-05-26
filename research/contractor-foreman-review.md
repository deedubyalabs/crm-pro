# Contractor Foreman Review & PROActive OS Alignment

**NOTE:** The detailed workflow analysis and PROActive OS adaptations from this document have been integrated into `memory-bank/development-roadmap.md` for active project tracking. This file now serves as a historical reference.

## Introduction

This document tracks the review of the Contractor Foreman construction management software platform and the planning process for aligning PROActive OS with desired functionalities, while leveraging PROActive OS's modern architecture, advanced AI capabilities powered by the Agno framework and Agent Data Fabric (ADF), and a strong focus on intuitive UI/UX with embedded chat interfaces and proactive assistance. The goal is to identify key workflows, analyze Contractor Foreman's approach, determine likes and dislikes, and define adaptations for PROActive OS, emphasizing deep integration, relational linking, embedded AI, and necessary API endpoints.

## Reviewed Workflows

### 1. CRM Workflow (Leads and Opportunities)

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the CRM/Directory.
    2.  User can view a list of contacts, filtered by type (Leads, Customers, etc.).
    3.  User can create a new contact, specifying the type.
    4.  User can view/edit details of an existing contact.
    5.  From a Contact or Leads view, user can create an Opportunity.
    6.  Opportunity details include stages, linked contact, address, tasks, files, and notes.
    7.  User can add tasks, files, and notes directly to the Opportunity.
    8.  User can create an Estimate from the Opportunity details view.
    9.  (Inferred) User manually updates contact type from Lead to Customer upon project creation.
*   **Contractor Foreman UI/Features:** Centralized Directory, distinct contact types, Leads Manager module, Opportunities module, fields for tracking lead/opportunity details (source, stage, etc.), ability to add tasks/files/notes, linking to Estimates/Projects, modals for creation forms.
*   **Likes (User Feedback):** Ability to add contacts from various forms. Concept of converting Lead to Customer upon estimate approval/project creation. Ability to add categories ("add as you go"). Inclusion of "Tasks" distinct from Appointments. Use of modals for initial creation. Interconnectedness of entities (tasks, files, notes linked to opportunities).
*   **Dislikes (User Feedback):** Potential workflow quirk in manual lead conversion (inferred from CF analysis).
*   **PROActive OS Adaptation:**
    *   Unified Contact entity in Supabase with a `type` field, integrated into the Agent Data Fabric (ADF).
    *   Implement automated Lead-to-Customer conversion workflow upon project creation, potentially with AI assistance for data enrichment.
    *   Implement "add as you go" functionality for categories (Source, Stage, Type) via separate Supabase tables and associated UI/API, with these categories accessible to AI agents via the ADF.
    *   Add a dedicated "Jobs" feature (corresponding to Contractor Foreman's "To-Do's") linkable to Contacts, Opportunities, and Projects, with potential for AI assistance in task creation and management.
    *   Utilize modals for initial creation forms for Contacts, Opportunities, and Jobs, ensuring a streamlined UI.
    *   Ensure deep relational linking in Supabase schema and backend API routes/Server Actions, making this data accessible and usable by AI agents via the ADF.
    *   Consider embedding a chat interface within the CRM views for direct interaction with AI agents for tasks like lead qualification or communication drafting.
    *   Implement proactive AI assistance for lead nurturing and opportunity management (e.g., suggesting follow-up actions).
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

### 2. Estimate Creation Workflow (from Opportunity and Items View)

*   **Contractor Foreman Workflow Steps:**
    1.  User initiates Estimate creation from Opportunity details or Estimates module.
    2.  User views/edits Estimate details (customer, date, project type, etc.).
    3.  User navigates to the "Items" view.
    4.  User can add items via "Add Item to Estimate" dropdown.
    5.  Choosing "Import from Cost Items Database" opens a side drawer with tabbed views (Material, Equipment, Labor, Subcontractor, Other, Groups).
    6.  User can search/filter items within tabs.
    7.  User can select existing items to add.
    8.  User can click "Add Material Item" (or other type) to add a new item to the Cost Items Database via a modal/side drawer.
    9.  User can select item groups from the "Groups" tab to add multiple items at once.
    10. User can "Add Manual Item" directly to the estimate.
    11. User can create/add sections to organize items.
    12. User can mark individual items or entire sections as Optional.
    13. User can mark items for Tax.
    14. User can apply Automatic/Bulk Markup to sections or the entire estimate, selecting item types to apply it to.
    15. User can assign items to employees, contractors, etc.
    16. User views a summary including estimated cost, profit margin, hours, markup.
    17. User navigates to other sections: Terms, Scope of Work, Bidding, Files, Cover Sheet, Notes.
    18. User uses "Review and Submit" for finalization and preview.
*   **Contractor Foreman UI/Features:** Estimate details view, "Items" view with dropdown for adding items/sections, side drawer for Cost Items Database import (tabbed view, search, favorites, selected items list), modal/side drawer for adding new Cost Items ("add as you go"), functionality for item groups, manual item addition, sections, optional items/sections, tax marking, bulk markup options, item assignment, summary view, dedicated sections for Terms, Scope of Work, Bidding, Files, Cover Sheet, Notes, "Review and Submit" with preview.
*   **Likes (User Feedback):** Integration with Cost Items Database (tabbed view, groups, "add as you go" via side drawer, never leaving the screen, showing selected items, favorites, "Save & Add Another Item"). Ability to create optional sections for upsells. "Add as you go" functionality for items/categories. Use of modals/sidedrawers. Ability to mark for Tax. Bulk markup functionality. Item assignment. Comprehensive summary view. Inclusion of Terms, Scope of Work, Bidding, Files, Cover Sheet, Notes sections. "Review and Submit" with preview.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Enhance existing Estimate items view to replicate the robust functionality, including sections (with optional), item options (optional, tax), and item assignment.
    *   Develop a comprehensive Cost Items database UI with a tabbed view (Material, Equipment, Labor, Subcontractor, Other, Groups), search, filtering, and the ability to create and manage item groups, with this data accessible to AI agents via the ADF.
    *   Implement seamless integration with the Cost Items database from the Estimate items view via a side drawer, allowing import of existing items and adding new ones "as you go".
    *   Implement bulk markup functionality with flexible application options, potentially with AI suggestions for markup percentages based on project context.
    *   Integrate with the BigBoxAPI for bulk searching and adding material items to the Cost Items database, likely via an Agno agent tool.
    *   Implement "add as you go" functionality for line items and cost item categories, accessible to AI agents.
    *   Utilize modals/sidedrawers for adding items, sections, and new cost items, ensuring a smooth UI experience that minimizes navigating away from the estimate.
    *   Ensure Supabase schema supports estimate sections, optional items, tax marking, assignments, markup details, and item groups within the Cost Items database, integrated into the ADF.
    *   Develop a summary view displaying estimated cost, profit margin, hours needed, markup, etc., potentially with AI insights.
    *   Create dedicated UI sections and backend logic for Terms, Scope of Work, Bidding, Files, Cover Sheet, and Notes, ensuring they are relationally linked to the Estimate in the Supabase schema and accessible to AI agents.
    *   Implement a "Review and Submit" workflow with a preview of the estimate package (potentially generating a PDF), with AI assistance for review and finalization.
    *   **Crucially, integrate an embedded chat interface within the Estimate view**, allowing users to interact conversationally with the AI Estimator agent for generating, refining, and editing estimate line items.
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

## General Considerations

*   **UI/UX:** A key goal is to update and modernize the user interface throughout the application, ensuring it is intuitive and efficient, addressing the "dated" criticism of Contractor Foreman.

### 3. Contractor/Bids Workflow (from Estimate)

*   **Contractor Foreman Workflow Steps:**
    1.  User views the Estimates list dashboard, showing estimates by status and a list view with key details.
    2.  User navigates to the Bidding section within a specific Estimate.
    3.  User creates a Bid Package.
    4.  User selects specific items from the Estimate to include in the Bid Package.
    5.  User manages bidders (contractors).
    6.  User can set the status of the Bid Package (e.g., Draft, Final).
    7.  When the Bid Package is in final status, the user can email it.
    8.  Subcontractor receives an email with a link to view the bid package and submit their price.
    9.  Subcontractor enters their bid price and submits.
    10. The status of the bid updates in the Estimates view.
    11. User reviews bid submissions in the "Submissions" section.
    12. User can choose options to Award, Request rebid, Decline, or state as In Review.
    13. If awarded, the user can apply the bid price to the corresponding estimate item price.
    14. (Related) User manages contractor details in the Directory, which includes separate sections for Licenses & Certifications and Insurance Certificates, in addition to a general Files section.
*   **Contractor Foreman UI/Features:** Estimates list dashboard (status summaries, list view with details), Bidding section within Estimate (Bid Package creation, item selection from estimate, bidder management, status setting, email option), Subcontractor bid submission interface (external to main app), Submissions section within Bidding (review bids, status options - Award, Request rebid, Decline, In Review), option to apply bid price to estimate item price, Contractor Directory view (separate sections for Licenses & Certifications, Insurance Certificates, Files).
*   **Likes (User Feedback):** Estimates list dashboard provides a good overview. The Bidding section allows choosing specific items from the estimate for a bid package. Simple process for subcontractors to submit bids. Ability to review bid submissions and manage their status. Powerful feature to apply awarded bid price to estimate item price.
*   **Dislikes (User Feedback):** Contractor Directory splits documents (insurance, licenses, files) into separate sections.
*   **PROActive OS Adaptation:**
    *   Develop an Estimates list dashboard providing status summaries and a detailed list view.
    *   Implement a Bidding section within the Estimate view, allowing users to create bid packages and select specific estimate items to include.
    *   Ensure contractor details are managed within the unified Contact entity in the CRM, integrated into the ADF.
    *   Store all contractor-related documents (insurance, licenses, general files) within the central Documents module, utilizing a `type` field to categorize them, accessible to AI agents via the ADF.
    *   Implement functionality to email the bid package when its status is final, providing a simple interface for subcontractors to submit their bid price, potentially with AI assistance in drafting the email.
    *   Develop a "Submissions" section within the Bidding feature for reviewing submitted bids and managing their status (Award, Request rebid, Decline, In Review), potentially with AI analysis of bids.
    *   Implement the functionality to apply the awarded bid price to the corresponding estimate item price.
    *   Ensure deep relational linking between Estimates, Bid Packages, Contractors (Contacts), Documents, and Estimate Items, integrated into the ADF.
    *   **Improvement Area:** Ensure the subcontractor bid submission process is seamless and potentially integrated more closely, while remaining simple for the subcontractor. Consider AI assistance for bid analysis and comparison.
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

### 4. Post-Estimate Approval Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User approves an Estimate.
    2.  A modal appears with options: Add items to Schedule of Values, Generate an Invoice from Estimate items, Create Schedule from Estimate.
    3.  Choosing one of these options (or presumably navigating to the Projects module) leads to the Project workflow.
*   **Contractor Foreman UI/Features:** Modal with post-approval options (Add to Schedule of Values, Generate Invoice, Create Schedule).
*   **Likes (User Feedback):** The clear presentation of next steps upon estimate approval.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Implement a similar modal or clear UI element upon estimate approval presenting the user with key next steps: adding items to Schedule of Values, generating an initial Invoice, and creating a Project/Schedule.
    *   Ensure these options seamlessly transition the user to the relevant module or initiate the respective process, potentially with AI assistance in initiating these processes.
    *   Ensure deep relational linking between the approved Estimate and the newly created/updated entities (Schedule of Values, Invoice, Project, Schedule), integrated into the ADF.
*   **API Endpoints Needed:**
    *   `POST /api/estimates/:id/approve`: Approve estimate.
    *   `POST /api/estimates/:id/add-to-sov`: Add estimate items to Schedule of Values.
    *   `POST /api/estimates/:id/generate-invoice`: Generate invoice from estimate.
    *   `POST /api/estimates/:id/create-project-and-schedule`: Create project and schedule from estimate (potentially via AI endpoint).

### 5. Project Management Workflow (Dashboard and Details)

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Projects dashboard list view.
    2.  User views a list of projects with key details (name, complete %, amount, cost, profit, PM, type, status).
    3.  User can see summaries of projects by status, action items, weekly tasks, and unpaid items on the dashboard.
    4.  User clicks on a project to view the Project details.
    5.  User navigates through various sections within the Project details (Summary, Financial, Schedule of Values, Documents, Time, Files & Photos, Contacts, Schedule, Procurement, Client Access, Reports).
    6.  User can perform actions within these sections (e.g., add daily log, add invoice, add punchlist, add document, add time entry, view schedule, view contacts).
*   **Contractor Foreman UI/Features:** Projects dashboard list view (project list with details, status summaries, action items, weekly tasks, unpaid items), Project details view with a sidebar navigation to various sections (Summary, Financial, Schedule of Values, Documents, Time, Files & Photos, Contacts, Schedule, Procurement, Client Access, Reports), buttons/options for adding related items within sections.
*   **Likes (User Feedback):** Comprehensive project details view with various linked sections. The ability to see everything related to a project in one place.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Develop a Projects dashboard list view displaying key project details and summaries, potentially with AI-powered insights or action item suggestions.
    *   Create a comprehensive Project details view with a clear navigation structure (sidebar or tabs) to various sections mirroring the required modules (Summary, Financial, Schedule of Values, Documents, Time, Files & Photos, Contacts, Schedule, Procurement, Client Access, Reports).
    *   Ensure each section within the Project details view is deeply integrated and displays relevant linked data (e.g., Financial section shows linked invoices, expenses, change orders; Documents section shows linked files; Time section shows linked time entries), with this data accessible to AI agents via the ADF.
    *   Implement functionality within each section to easily add new related items (e.g., add a new Daily Log from the Documents section, add a new Time Entry from the Time section), potentially with AI assistance for data entry or task creation.
    *   Ensure deep relational linking in the Supabase schema between Projects and all related entities (Estimates, Invoices, Expenses, Time Entries, Documents, Jobs, Contacts, Schedule, etc.), integrated into the ADF.
    *   **Integrate an embedded chat interface within the Project details view**, allowing users to interact conversationally with AI agents for project updates, task management, and information retrieval.
    *   Implement proactive AI assistance for project management (e.g., identifying potential delays, suggesting resource reallocations).
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

### 6. Job Management Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the To-Do's module or adds a To-Do from another entity (e.g., Opportunity, Project).
    2.  User creates a new To-Do, linking it to a project/opportunity, adding task name, due date/time, priority, assigned user, description, tags, and custom fields.
    3.  User can add checklist items to a To-Do.
    4.  Completing a checklist item automatically changes the To-Do status to "incomplete".
    5.  User can view To-Do's in a list or Kanban board.
*   **Contractor Foreman UI/Features:** To-Do's module, form for creating/editing To-Do's (linking to project/opportunity, fields for details, assignments), checklist functionality within To-Do's, automatic status update on checklist completion, list and Kanban views for To-Do's.
*   **Likes (User Feedback):** Inclusion of Tasks (To-Do's) in addition to Appointments. Ability to link tasks to projects/opportunities. Checklist functionality.
*   **Dislikes (User Feedback):** The naming convention "To-Do's" might be unconventional. The automatic status change to "incomplete" on checklist completion might not align with desired workflow (should be "in progress").
*   **PROActive OS Adaptation:**
    *   Implement a dedicated "Jobs" module (corresponding to Contractor Foreman's "To-Do's").
    *   Ensure Jobs can be created and linked to Contacts, Opportunities, and Projects, with this data integrated into the ADF.
    *   Include fields for task name, due date/time, priority, assigned user, description, and support for custom fields, accessible to AI agents.
    *   Implement checklist functionality within Jobs, with potential for AI assistance in generating checklists.
    *   Adapt the status update logic: completing a checklist item should set the Job status to "In Progress" (if not already). The status should only become "Complete" when all checklist items are completed or the user manually sets it.
    *   Provide list and potentially Kanban views for Jobs, potentially with AI-powered task prioritization or suggestions.
    *   Ensure deep relational linking between Jobs and other entities, integrated into the ADF.
    *   Consider embedding a chat interface within the Jobs module for direct interaction with AI agents for task management and updates.
    *   Implement proactive AI assistance for task management (e.g., reminding users of upcoming deadlines, suggesting task breakdowns).
*   **API Endpoints Needed:**
    *   `POST /api/jobs`: Create new job (linked to entity).
    *   `GET /api/jobs`: Retrieve jobs (with filtering/search/status).
    *   `GET /api/jobs/:id`: Retrieve job details (including checklist items).
    *   `PUT /api/jobs/:id`: Update job.
    *   `DELETE /api/jobs/:id`: Delete job.
    *   `POST /api/jobs/:id/checklist-items`: Add checklist item to job (potentially via AI endpoint).
    *   `PUT /api/jobs/:id/checklist-items/:itemId`: Update checklist item (including completion status).
    *   `POST /api/ai/job-chat`: Endpoint for embedded conversational job management.

### 7. Work Orders and Service Tickets Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Work Orders or Service Tickets module.
    2.  User creates a new Work Order or Service Ticket, linking it to a project (for Work Orders) or potentially a client/membership plan (for Service Tickets).
    3.  User fills in relevant details (subject, dates, assigned user, description, etc.).
    4.  (For Service Tickets) Potentially link to membership plans and included services/tasks.
    5.  (For Work Orders) Similar to Jobs but outside of Projects.
    6.  (For Service Tickets) Support for electronic signatures.
*   **Contractor Foreman UI/Features:** Work Orders module, Service Tickets module, forms for creating/editing Work Orders/Service Tickets, fields for relevant details, linking to projects/clients/membership plans, electronic signature support (Service Tickets).
*   **Likes (User Feedback):** The concept of dedicated modules for Work Orders and Service Tickets.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Implement dedicated "Work Orders" and "Service Tickets" modules.
    *   Ensure Work Orders can be linked to clients and projects, with this data integrated into the ADF.
    *   Ensure Service Tickets are deeply integrated with the planned membership plans feature, linking to specific plans and included services/tasks, with this data integrated into the ADF.
    *   Include relevant fields for tracking details specific to Work Orders and Service Tickets, accessible to AI agents.
    *   Implement electronic signature support for Service Tickets.
    *   Consider embedding chat interfaces within these modules for AI assistance in managing work orders and service tickets.
    *   Implement proactive AI assistance for scheduling, dispatching, and status updates for work orders and service tickets.
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

### 8. Change Order Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Change Orders module or initiates from a Project/Estimate.
    2.  User creates a new Change Order, linking it to a Project and Customer.
    3.  User fills in details like subject, date, CO number, requested by, original estimate link, time delay, days delayed, and description.
    4.  User adds Change Order Items (can import from Estimate or SOV).
    5.  User can preview the Change Order document.
    6.  User submits the Change Order for approval (often via email with a link for the client to review and sign electronically).
    7.  Client reviews and provides an electronic signature to approve.
    8.  The status of the Change Order updates (e.g., Open, Pending Approval, Approved, Billed).
    9.  Approved Change Order items are reflected in the Project financials and Schedule of Values.
*   **Contractor Foreman UI/Features:** Change Orders module (list view, pending approval summary), form for creating/editing Change Orders (linking to project/customer, fields for details), ability to add Change Order Items (import options), preview functionality, submission for approval workflow (email, client review interface, electronic signature), status tracking, integration with Project financials/Schedule of Values.
*   **Likes (User Feedback):** The dedicated Change Order module and workflow. Electronic signature support. Seamless integration with Project financials. Ability to import items from Estimate or SOV.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Implement a dedicated "Change Orders" module.
    *   Ensure Change Orders can be created and deeply linked to Projects and Customers, with this data integrated into the ADF.
    *   Include comprehensive fields for tracking change order details, accessible to AI agents.
    *   Implement a process for adding Change Order Items, with options to import from the linked Estimate or Schedule of Values, potentially with AI assistance in identifying relevant items.
    *   Develop a workflow for submitting Change Orders for approval, including email notification and a client interface for review and electronic signature, potentially with AI assistance in drafting the submission email.
    *   Implement status tracking for Change Orders, with potential for proactive AI notifications on status changes.
    *   Ensure approved Change Orders automatically update Project financials and the Schedule of Values, with AI verification of the updates.
    *   Consider embedding a chat interface within the Change Orders module for AI assistance in managing change orders.
    *   Implement proactive AI assistance for tracking change order approvals and identifying potential delays.
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

### 9. Daily Log Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Daily Logs module or adds a Daily Log from a Project.
    2.  User creates a new Daily Log, linking it to a Project.
    3.  User fills in details like date, arrival/departure time, tasks performed, weather conditions (temp, condition, notes), jobsite conditions, delays (weather, schedule, notes).
    4.  User can add People on Site (employees, subcontractors, visitors) with notes and time entries.
    5.  User can add Material Notes, Material Items Delivered, and Material Items Used.
    6.  User can add Equipment Notes, Equipment Items Delivered, Equipment Items Used, and Equipment Logs.
    7.  User can add Notes and Files.
    8.  User can add Incidents & Accidents.
*   **Contractor Foreman UI/Features:** Daily Logs module (list view, calendar navigation), form for creating/editing Daily Logs (linking to project, fields for date/time, tasks, weather, jobsite conditions, delays), sections for adding People on Site (with time entries), Material details, Equipment details, Notes, Files, and Incidents & Accidents.
*   **Likes (User Feedback):** Comprehensive fields for capturing daily site information. Ability to link various types of data (people, materials, equipment, incidents) to the daily log.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Implement a dedicated "Daily Logs" module.
    *   Ensure Daily Logs can be created and deeply linked to Projects, with this data integrated into the ADF.
    *   Include comprehensive fields for capturing daily site information, mirroring the Contractor Foreman approach (date, time, tasks, weather, jobsite conditions, delays), accessible to AI agents.
    *   Implement sections within the Daily Log for adding and linking People on Site (employees, subcontractors, visitors) with time entries, Material details (notes, delivered, used), Equipment details (notes, delivered, used, logs), Notes, Files, and Incidents & Accidents, with potential for AI assistance in data entry or summarizing information.
    *   Consider embedding a chat interface within the Daily Logs module for AI assistance in creating and reviewing daily logs.
    *   Implement proactive AI assistance for daily logs (e.g., identifying potential issues based on reported conditions, suggesting follow-up actions).
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

### 10. Expense Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Expenses module or adds an Expense from a Project.
    2.  User creates a new Expense, linking it to a Project.
    3.  User fills in details like date, vendor, expense name, total amount, bank account, category, and notes.
    4.  User can mark the expense as Billable.
    5.  User can add a reference number and attach a receipt.
    6.  Expenses are reflected in project financials and reports.
*   **Contractor Foreman UI/Features:** Expenses module (list view, charts by month/type), form for creating/editing Expenses (linking to project, fields for details), option to mark as Billable, fields for reference number and receipt attachment.
*   **Likes (User Feedback):** Ability to link expenses to projects. Comprehensive fields for tracking expense details. Option to mark as Billable.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Implement a dedicated "Expenses" module.
    *   Ensure Expenses can be created and deeply linked to Projects, with this data integrated into the ADF.
    *   Include comprehensive fields for tracking expense details (date, vendor, name, total, bank account, category, notes, reference number, receipt), accessible to AI agents.
    *   Implement the option to mark an expense as Billable.
    *   Ensure expenses are reflected in Project financials and reports, potentially with AI analysis of spending patterns.
    *   Consider embedding a chat interface within the Expenses module for AI assistance in managing expenses.
    *   Implement proactive AI assistance for expense management (e.g., identifying potential cost savings, suggesting expense categorization).
*   **API Endpoints Needed:**
    *   `POST /api/expenses`: Create new expense (linked to project).
    *   `GET /api/expenses`: Retrieve expenses (with filtering/search).
    *   `GET /api/expenses/:id`: Retrieve expense details.
    *   `PUT /api/expenses/:id`: Update expense.
    *   `DELETE /api/expenses/:id`: Delete expense.
    *   `POST /api/ai/expense-chat`: Endpoint for embedded conversational expense management.

### 11. Purchase Order Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Purchase Orders module or adds a PO from a Project.
    2.  User creates a new Purchase Order, linking it to a Project and Supplier.
    3.  User fills in details like subject, date, PO number, order delivery date, ship via, ship to/from addresses, payment terms, billing status, and description.
    4.  User adds Purchase Order Items (can import from Cost Items Database, Schedule of Values, or add manually).
    5.  User can add attachments.
    6.  User can track delivered items.
*   **Contractor Foreman UI/Features:** Purchase Orders module (list view), form for creating/editing POs (linking to project/supplier, fields for details), ability to add PO Items (import options, manual), attachment support, delivered item tracking.
*   **Likes (User Feedback):** Ability to link POs to projects and suppliers. Options to import items from other modules.
*   **Dislikes (User Feedback):** User does not use POs much.
*   **PROActive OS Adaptation:**
    *   Implement a "Purchase Orders" module.
    *   Ensure POs can be created and deeply linked to Projects and Suppliers (Contacts), with this data integrated into the ADF.
    *   Include comprehensive fields for tracking PO details, accessible to AI agents.
    *   Implement the ability to add PO Items, with options to import from the Cost Items Database and Schedule of Values, or add manually, potentially with AI assistance in identifying needed materials.
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

### 12. Subcontracts Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Sub-Contracts module or adds a Sub-Contract from a Project.
    2.  User creates a new Sub-Contract, linking it to a Project and Subcontractor.
    3.  User fills in details like subject, agreement number, issued by, date, and work retainage percentage.
    4.  User can add Original Scope items (similar to adding Estimate items).
    5.  User can add Documents, Terms, and Notes.
*   **Contractor Foreman UI/Features:** Sub-Contracts module (list view, stats summaries), form for creating/editing Sub-Contracts (linking to project/subcontractor, fields for details), ability to add Original Scope items, sections for Documents, Terms, and Notes.
*   **Likes (User Feedback):** Ability to link subcontracts to projects and subcontractors. Inclusion of sections for documents, terms, and notes.
*   **Dislikes (User Feedback):** User does not use subcontracts much.
*   **PROActive OS Adaptation:**
    *   Implement a "Subcontracts" module.
    *   Ensure Subcontracts can be created and deeply linked to Projects and Subcontractors (Contacts), with this data integrated into the ADF.
    *   Include comprehensive fields for tracking subcontract details, accessible to AI agents.
    *   Implement the ability to add Original Scope items, potentially leveraging the same UI/logic as adding Estimate items, with potential for AI assistance in defining the scope.
    *   Include sections for Documents, Terms, and Notes, ensuring they are relationally linked to the Subcontract and accessible to AI agents.
    *   Consider embedding a chat interface within the Subcontracts module for AI assistance in managing subcontracts.
    *   Implement proactive AI assistance for subcontract management (e.g., reminding users of upcoming payment milestones, suggesting contract clauses).
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

### 13. Time Cards Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Time Cards module or adds a Time Card entry.
    2.  User can view time card stats and upcoming days off.
    3.  User can view time spent on current projects.
    4.  User can view a current week timesheet.
    5.  User adds a Time Card entry, including clock-in time, project/location, and cost code.
    6.  User clocks out, adding clock-out time.
    7.  User can view detailed activity log.
    8.  (Related) Time entries are linked to projects and used in job costing.
*   **Contractor Foreman UI/Features:** Time Cards module (calendar view, stats, upcoming days off, time spent on projects, weekly timesheet), form for adding time entries (clock-in/out, project/location, cost code), detailed activity log.
*   **Likes (User Feedback):** Comprehensive time tracking features. Linking time entries to projects and cost codes.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Implement a dedicated "Time Cards" module.
    *   Include features for viewing time stats, upcoming days off, time spent on current projects, and a weekly timesheet, potentially with AI analysis of time allocation.
    *   Develop a user-friendly interface for adding time entries with clock-in/out, project/location linking, and cost code selection, potentially with AI assistance for faster entry or suggestions.
    *   Implement a detailed activity log for time entries, accessible to AI agents for analysis.
    *   Ensure time entries are deeply linked to Projects and Cost Codes in the Supabase schema and are used for job costing calculations, integrated into the ADF.
    *   **Improvement Area:** Address the lack of offline functionality for time tracking, which was noted as a major weakness of Contractor Foreman's mobile app. This is a significant challenge but a key area for future development.
    *   Consider embedding a chat interface within the Time Cards module for AI assistance in managing time entries and viewing time-related reports.
    *   Implement proactive AI assistance for time tracking (e.g., reminding users to clock in/out, identifying discrepancies).
*   **API Endpoints Needed:**
    *   `POST /api/time-cards`: Create new time card entry (clock-in).
    *   `PUT /api/time-cards/:id`: Update time card entry (clock-out, edit).
    *   `GET /api/time-cards`: Retrieve time card entries (with filtering/search).
    *   `GET /api/time-cards/stats`: Retrieve time card statistics (potentially via AI endpoint for analysis).
    *   `GET /api/time-cards/weekly-timesheet`: Retrieve weekly timesheet data.
    *   `GET /api/time-cards/activity-log`: Retrieve detailed activity log.
    *   `POST /api/ai/time-card-chat`: Endpoint for embedded conversational time card management.

### 14. Invoicing, Payments, and Job Costing Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Invoices module or generates an Invoice from an Estimate or Project.
    2.  User creates a new Invoice, linking it to a Project and Customer.
    3.  User adds items to the Invoice. This can include:
        *   Importing from Cost Items Database.
        *   Importing from Schedule of Values.
        *   Importing from Estimate (Approved).
        *   Adding Manual Invoice Items.
        *   Adding Discounts.
        *   Adding Retainage.
        *   Adding Time & Material Items (Time Cards, Expenses, Change Orders, Bills, Equipment Logs) - only unbilled items are shown.
    4.  User manages Invoice details (date, due date, status, etc.).
    5.  User can send the Invoice to the client.
    6.  User can record Payments received against an Invoice, specifying payment date, amount, status (Received, In Review, Verified, Failed), type, and linking to the Invoice.
    7.  User can view Payment details and history.
    8.  Job Costing data is automatically updated based on linked Estimates, Invoices, Payments, Expenses, Time Cards, POs, Bills, Change Orders, and Equipment Logs.
    9.  User can view Job Costing reports (e.g., Job Cost Actual Report).
*   **Contractor Foreman UI/Features:** Invoices module (list view, status summaries), form for creating/editing Invoices (linking to project/customer, fields for details), options for adding various item types to invoices (import from CID, SOV, Estimate; manual; discounts; retainage; time & material from linked modules - showing only unbilled), Payments module (list view, stats summaries), form for adding Payments (linking to invoice, fields for details, status options), Payment details view, Job Costing calculations (backend), Job Costing reports.
*   **Likes (User Feedback):** Ability to add various item types to invoices, especially time and materials from linked modules. Only showing unbilled items when adding time and materials to invoices. Comprehensive Job Costing based on integrated data.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Implement dedicated "Invoices" and "Payments" modules.
    *   Ensure Invoices can be created and deeply linked to Projects and Customers, with this data integrated into the ADF.
    *   Implement robust functionality for adding items to Invoices, including importing from the Cost Items Database, Schedule of Values, and Approved Estimates, potentially with AI assistance in identifying items to bill.
    *   Implement the ability to add Manual Invoice Items, Discounts, and Retainage.
    *   Develop a feature to add Time and Material items (Time Cards, Expenses, Change Orders, Bills, Equipment Logs) to Invoices, ensuring only unbilled items are presented, potentially with AI assistance in identifying unbilled items.
    *   Implement a comprehensive Payments workflow for recording and tracking payments against invoices, potentially with AI assistance in reconciliation.
    *   Develop a robust Job Costing system that automatically aggregates data from all relevant linked modules (Estimates, Invoices, Payments, Expenses, Time Cards, POs, Bills, Change Orders, Equipment Logs) in the Supabase schema, integrated into the ADF.
    *   Implement Job Costing reports to provide insights into project profitability, potentially with AI-powered analysis and insights.
    *   Consider embedding chat interfaces within the Invoicing, Payments, and Job Costing modules for AI assistance in managing financials.
    *   Implement proactive AI assistance for financial management (e.g., reminding users of upcoming invoice due dates, identifying potential cash flow issues).
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

### 15. Client Portal Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  Client accesses a dedicated online portal.
    2.  Client can view project updates and track progress (including photos and change orders).
    3.  Client can communicate with the project team via chat.
    4.  Client can access shared documents (proposals, invoices).
    5.  Client can electronically sign documents.
    6.  Client can potentially make online payments.
    7.  Contractor controls what information is shared in the portal.
*   **Contractor Foreman UI/Features:** Dedicated Client Portal interface (web-based), sections for project updates, progress tracking (photos, change orders), integrated chat, document access, e-signature capability, online payment option, contractor controls for shared information.
*   **Likes (User Feedback):** Provides transparency and access for clients. Integrated chat for communication. Ability to access documents and e-sign.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Implement a dedicated Client Portal for each project.
    *   Provide clients with secure access to view project progress, updates, shared files, estimates, invoices, and change orders, with this data integrated into the ADF.
    *   Integrate with the planned communication features (Sendbird) for client-contractor chat within the portal, potentially with a client-facing AI assistant.
    *   Implement electronic signature capabilities for documents shared through the portal.
    *   Integrate with Square API for online payment processing of invoices.
    *   Develop granular controls for contractors to manage what information is visible to the client in the portal.
    *   Consider embedding a chat interface within the Client Portal for clients to interact with an AI assistant for project updates or questions.
*   **API Endpoints Needed:**
    *   `GET /api/projects/:id/client-portal-data`: Retrieve data for client portal (based on contractor sharing settings).
    *   `POST /api/projects/:id/client-portal-chat`: Send message via client portal chat (potentially with AI endpoint).
    *   `POST /api/documents/:id/esign`: Endpoint for client e-signature.
    *   `POST /api/invoices/:id/pay`: Initiate online payment via Square.
    *   `PUT /api/projects/:id/client-access-settings`: Update contractor sharing settings for client portal.
    *   `POST /api/ai/client-portal-chat`: Endpoint for embedded conversational client portal interactions.

### 16. Reporting Workflow

*   **Contractor Foreman Workflow Steps:**
    1.  User navigates to the Reports module.
    2.  User can view a list of available reports, categorized by module (Activities, Change Orders, Contacts & Renewals, Daily Reports, Equipment and Vehicles Report, Estimate Report, Financials Report, Incidents & Employee Write-Ups, Job Costs, Misc. Reports, Punchlist & Submittal, Purchase Order Report, Safety Meeting Report).
    3.  User can create a New Custom Report.
    4.  User can filter reports based on various criteria (e.g., status, project type, date range, customers, projects, project manager).
    5.  User generates the report.
    6.  (Inferred from CF analysis) Reports are primarily generated as downloadable Excel spreadsheets.
*   **Contractor Foreman UI/Features:** Reports module (categorized list of reports, option to create custom report), filtering options for reports, report generation.
*   **Likes (User Feedback):** Ability to customize what is needed for each module in reporting.
*   **Dislikes (User Feedback):** Reports are primarily downloadable spreadsheets, lacking interactive in-app viewing. Limited customization flexibility compared to some competitors. Performance issues with large datasets.
*   **PROActive OS Adaptation:**
    *   Implement a comprehensive "Reporting" module.
    *   Provide a wide range of pre-built reports covering all modules, with data accessible to AI agents via the ADF.
    *   Develop a flexible custom report builder allowing users to select data points and apply advanced filtering.
    *   Prioritize interactive in-app viewing of reports, in addition to export options (e.g., PDF, CSV).
    *   Ensure report performance is optimized, especially for larger datasets.
    *   Consider embedding a chat interface within the Reporting module for AI assistance in generating and analyzing reports.
    *   Implement proactive AI assistance for reporting (e.g., identifying key trends, suggesting reports to run).
    *   Integrate AI-powered analysis and insights directly into reports.
*   **API Endpoints Needed:**
    *   `GET /api/reports`: Retrieve list of available reports.
    *   `POST /api/reports/custom`: Create/save custom report definition.
    *   `POST /api/reports/generate`: Generate a report (with filtering/parameters, potentially via AI endpoint for insights).
    *   `GET /api/reports/:id`: Retrieve details of a saved custom report.
    *   `PUT /api/reports/:id`: Update saved custom report.
    *   `DELETE /api/reports/:id`: Delete saved custom report.
    *   `POST /api/ai/reporting-chat`: Endpoint for embedded conversational reporting management.

### 17. Membership/Rewards Management Workflow

*   **PROActive OS Prototype Features:** Membership tiers and benefits, points earning and redemption history, ways to earn points (spending, sign-up bonus, referrals, social media engagement), redeeming points for discounts, optional add-on packages.
*   **Likes (User Feedback):** The concept of membership tiers and a points-based rewards system. Various ways to earn points. Ability to redeem points for discounts. Optional add-on packages.
*   **Dislikes (User Feedback):** None explicitly stated for this workflow so far.
*   **PROActive OS Adaptation:**
    *   Implement a dedicated "Membership/Rewards" module.
    *   Define flexible membership tiers with customizable benefits and point multipliers.
    *   Develop a system for tracking points earned and redeemed by clients, with this data integrated into the ADF.
    *   Implement various methods for clients to earn points (linked to spending on services/materials, sign-ups, referrals, social media engagement), potentially with AI tracking and analysis of earning opportunities.
    *   Implement a process for clients to redeem points for discounts on future services or invoices.
    *   Develop functionality to manage optional add-on packages linked to membership tiers.
    *   Integrate with the CRM to link membership/rewards data to clients.
    *   Consider integrating with email marketing or in-app chat messaging for marketing and communication related to memberships and rewards, while keeping complexity in mind and potentially leveraging AI for personalized messaging.
    *   Consider embedding a chat interface within the Membership/Rewards module for AI assistance in managing membership details or answering client questions.
    *   Implement proactive AI assistance for membership/rewards management (e.g., notifying clients of new rewards earned, suggesting redemption options).
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

## General Considerations

*   **UI/UX:** A key goal is to update and modernize the user interface throughout the application, ensuring it is intuitive and efficient, addressing the "dated" criticism of Contractor Foreman.
