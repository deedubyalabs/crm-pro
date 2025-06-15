# Architecture & Tech Stack: PROActive OS - AI-Powered Operations Hub

**Version:** 1.0
**Date:** May 26, 2025

## 1. Overall Architecture: AI-Powered Operations Hub (Hub & Spoke Model)

*   **Hub:** The core PROActive OS application (Next.js frontend, Next.js backend/API routes/Server Actions, Supabase database). This is the single source of truth for the contractor's business data and the primary user interface.
*   **Agent Data Fabric (ADF):** A robust data layer built on Supabase, leveraging Zep for advanced active memory and knowledge graph capabilities to provide agents with context, memory, and access to relevant information (Vector Database, Knowledge Graph).
*   **Spokes (Internal):**
    *   **Next.js API Routes/TypeScript Modules:** Specialized LangGraph.js agents (e.g., `EstimatorPro`, communication drafting agents, project description agents, lead qualifier agent, project planner agent, daily log agent, expense agent, invoicing agent, job costing agent, communication agent, document agent, rewards agent, reporting agent) are hosted directly within Next.js API routes or imported TypeScript modules. These handle the complexities of running LangGraph.js workflows, managing agent sessions, and orchestrating agent tool calls.
    *   **Module-Specific Services:** Backend logic organized by PROActive OS modules (e.g., `EstimationService`, `ProjectService`, `ClientService`) handling business rules and Supabase interactions. These services are called by LangGraph.js agents via internal TypeScript tools.
*   **Spokes (External):** Essential third-party APIs (Square, Cal.com, Google Calendar, BigBox API, Accounting API, Sendbird) are accessed via dedicated API clients within the PROActive OS backend. These API clients are called by LangGraph.js agents via custom TypeScript tools.

## 2. Key Technical Decisions & Patterns

*   **AI-Powered Conversational Interfaces:** Prioritize conversational interfaces powered by LangGraph.js agents for data-intensive workflows (estimation, scheduling, communication), embedded within relevant modules for intuitive user interaction. This includes an embedded chat interface within the Estimate view for direct interaction with the AI Estimator agent, an embedded chat interface within the Project details view for project updates, task management, and information retrieval, an embedded chat interface within the Jobs module for direct interaction with AI agents for task management and updates, embedded chat interfaces within Work Orders and Service Tickets modules for AI assistance, an embedded chat interface within the Change Orders module for AI assistance, an embedded chat interface within the Daily Logs module for AI assistance, an embedded chat interface within the Expenses module for AI assistance, and an embedded chat interface within the Purchase Orders module for AI assistance.
*   **Agent Data Fabric (ADF) Implementation:** Build a robust data layer on Supabase, with LangGraph.js's checkpointer mechanism configured to use Supabase Postgres for persisting conversation state, and TypeScript tools interacting with Supabase (via `supabase-js`) for knowledge retrieval and access to core PROActive OS data.
*   **Component-Based Frontend:** Leverage React components (from PROActive OS, adapted from EstiMATE Pro & FloorPlan Pro, and new ones) with shadcn/ui for a modular and maintainable UI.
*   **Server Components & Client Components (Next.js App Router):** Implement a pattern where Server Components handle data fetching and initial rendering, passing data to Client Components that manage state and interactivity. Utilize Server Actions for mutations.
*   **Direct Supabase Interaction:** Backend services and LangGraph.js agents (via internal TypeScript tools) will interact directly with the PROActive OS Supabase instance for all CRUD operations.
*   **API Abstraction Layer for External Services:** Create dedicated service files in `HomeProOS/lib/` to encapsulate logic for interacting with third-party APIs (Square, Cal.com, BigBox, Google Calendar, Accounting API, Sendbird). These services will be called by LangGraph.js agents via custom TypeScript tools.
*   **Modular Codebase:** Organize PROActive OS code by feature/module for maintainability.
*   **State Management:** Utilize React Context for global UI state, React hooks for local client state, and SWR or React Query for server-side data caching and synchronization.
*   **Asynchronous Operations:** Extensive use of `async/await` throughout the application and agent workflows.
*   **Data Linking:** Maintain and leverage foreign key relationships in Supabase to ensure deep relational linking between entities, including Contacts, Opportunities, the new "Jobs" feature (and its checklist items), estimate-related entities (sections, optional items, tax marking, assignments, markup details, item groups within the Cost Items database), bidding-related entities (Estimates, Bid Packages, Contractors, Documents, Estimate Items), post-estimate approval entities (Blueprint of Values, Invoice, Project, Schedule), project-related entities (Estimates, Invoices, Expenses, Time Entries, Documents, Jobs, Contacts, Schedule, etc.), Work Orders/Service Tickets (Clients, Projects, Membership Plans), Change Orders (Projects, Customers, Estimate/Blueprint of Values items), Daily Logs (Projects, People, Time Entries, Materials, Equipment, Files, and Incidents), Expenses (Projects), and Purchase Orders (Projects, Suppliers, Cost Items, Blueprint of Values), accessible via backend API routes/Server Actions and AI agents.
*   **Environment Variables:** Consistent and secure use of environment variables for configuration and API keys.
*   **Human-in-the-Loop (HITL) Safeguards:** Design explicit HITL steps within user journeys for critical AI-assisted actions, ensuring contractor review and approval.
*   **Observability and Evaluation:** Integrate Langtrace for tracing and monitoring agent behavior and utilize evaluation frameworks (like Inspect AI) for systematic assessment of AI performance and safety.

## 3. Integration Patterns

*   **LangGraph.js Agent Orchestration:** LangGraph.js agents will orchestrate interactions with both internal PROActive OS services and external third-party APIs via custom TypeScript tools.
*   **Backend-to-Backend API Calls:** PROActive OS backend API routes will directly host and invoke LangGraph.js agents for AI tasks and handle responses.
*   **Custom Tools for External APIs:** Develop custom TypeScript tools within the Next.js backend to interact with essential third-party APIs (Square, Cal.com, Google Calendar, BigBox API, Accounting API, Sendbird).
*   **Model Context Protocol (MCP):** Leverage MCP for standardized integration with external services where applicable (e.g., custom MCP servers for specific services).
*   **Real-time/Webhook-Driven:** For services like Square, utilize webhooks for real-time updates (e.g., payment status).
*   **API Polling (Fallback/Scheduled):** For less critical updates from external services, use scheduled API polling.
*   **Client-Side SDKs (where appropriate):** For UI-heavy integrations or features, use client-side SDKs.
*   **Agent Activity Logging:** LangGraph.js agents within the Next.js backend will call a dedicated PROActive OS backend endpoint (`/api/system/log-agent-activity`) to log agent actions and decisions for observability and evaluation.
*   **"Add as you go" Categories:** Implement functionality for dynamic categories (Source, Stage, Type, and line item/cost item categories) via separate Supabase tables and associated UI/API, ensuring these categories are accessible to AI agents via the ADF.
*   **External API Integration (BigBoxAPI):** Integrate with the BigBoxAPI for bulk searching and adding material items to the Cost Items database, likely via an agent tool.
*   **AI-Assisted Workflows:** Implement AI suggestions for markup percentages based on project context, AI assistance for review and finalization of estimate packages, AI assistance in drafting bid emails and AI analysis of bids, AI assistance in initiating processes after estimate approval, AI-powered insights/action item suggestions for the Projects dashboard, AI assistance for data entry/task creation within project sections, proactive AI assistance for project management (e.g., identifying potential delays, suggesting resource reallocations), AI assistance in generating checklists, task prioritization, and suggestions for Jobs, proactive AI assistance for task management (e.g., reminding users of upcoming deadlines, suggesting task breakdowns), AI assistance in managing work orders and service tickets, proactive AI assistance for scheduling, dispatching, and status updates for work orders and service tickets, AI assistance in identifying relevant items for change orders, drafting submission emails, and AI verification of updates, proactive AI assistance for tracking change order approvals and identifying potential delays, AI assistance in data entry or summarizing information for Daily Logs, proactive AI assistance for daily logs (e.g., identifying potential issues based on reported conditions, suggesting follow-up actions), AI analysis of spending patterns, identifying potential cost savings, suggesting expense categorization, AI assistance in identifying needed materials for POs, and proactive AI assistance for purchase order management (e.g., reminding users of upcoming deliveries, suggesting reordering).
*   **Event-Driven Triggers:** Implement event listeners within PROActive OS that trigger LangGraph agent workflows based on changes in the Supabase database.

## 4. Data Flow Examples

### 4.1. New AI-Powered Estimate (via Next.js API Route/LangGraph.js Agent)

1.  **User (Contractor)** interacts with **Conversational UI** in PROActive OS frontend (e.g., `UnifiedEstimateClientPage.tsx`). Context like `personId` or `opportunityId` may be passed via URL.
2.  Frontend sends user utterance, session ID (if exists), and any pre-filled context (from Person/Opportunity) to **PROActive OS Backend API Route** (`/api/ai/estimate-chat`).
3.  PROActive OS Backend API Route fetches additional context from Supabase (e.g., client name, zip code based on IDs), constructs request payload (including `conversationHistory`, `projectContext`), and directly invokes the **`EstimatorPro` LangGraph.js Agent** within the API route.
4.  **`EstimatorPro` LangGraph.js Agent** executes its workflow, using TypeScript tools as needed.
5.  `EstimatorPro` Agent returns response (conversational text + tool outputs, including structured estimate via a tool) to the invoking API route.
6.  PROActive OS Backend API Route formats the final response payload (`conversationalReply`, `structuredEstimate`, `materialsToAddToLibrary`, `sessionId`).
7.  PROActive OS Backend API Route returns data to Frontend.
8.  Frontend updates estimate state, displays conversational reply, and populates line items.
9.  User confirms/saves; Frontend calls PROActive OS Server Action to save data to **Supabase**.

### 4.2. AI Communication Drafting (Opportunity Follow-Up)

1.  **User** clicks "Draft Follow-Up Email" on Opportunity Detail Page in PROActive OS.
2.  Frontend calls **PROActive OS Backend API Route** (`/api/ai/draft-communication`) with `opportunityId` and `communicationType`.
3.  PROActive OS Backend API Route fetches opportunity and linked estimate details from **Supabase**.
4.  Constructs payload (client name, opportunity name, status, estimate details) and directly invokes a communication drafting **LangGraph.js agent** within the API route.
5.  Agent generates email text.
6.  PROActive OS Backend returns `{ draftedEmailText: "..." }` to Frontend.
7.  Frontend displays drafted text in a modal.

### 4.3. AI Project Description Generation (Estimate to Project)

1.  **User** clicks "Create Project from this Estimate" on an "Accepted" Estimate page in PROActive OS.
2.  User is navigated to New Project page (`/app/projects/new/page.tsx`) with `estimateId` in query params.
3.  **PROActive OS Server Component** (`NewProjectPage`) fetches estimate details from **Supabase**.
4.  If estimate is valid, constructs payload (estimate title, line items) and directly invokes a project description generation **LangGraph.js agent** within the Server Component or an associated API route.
5.  Agent generates project description.
6.  The LangGraph.js agent returns `{ suggestedProjectDescription: "..." }` to PROActive OS Server Component.
7.  PROActive OS Server Component passes fetched estimate data and `suggestedProjectDescription` as props to `ProjectForm`.
8.  `ProjectForm` pre-fills relevant fields.
9.  User reviews and saves; Frontend calls PROActive OS Server Action to save project to **Supabase`.

## 5. Core Platform: PROActive OS

*   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
*   **Backend:** Next.js API Routes, Server Actions
*   **Database:** Supabase (PostgreSQL). Includes schema updates such as adding `estimate_id` to the `projects` table for linking, the `ai_logs` table for agent activity logging, `categories` table for "add as you go" functionality, schema support for estimate sections, optional items, tax marking, assignments, markup details, item groups within the Cost Items database, schema support for bid packages and submissions, schema support for Blueprint of Values, Invoice, Project, Schedule, schema support for Projects and all related entities (Estimates, Invoices, Expenses, Time Entries, Documents, Jobs, Contacts, Schedule, etc.), schema support for Jobs and their checklist items, schema support for Work Orders, Service Tickets, Membership Plans, schema support for Change Orders, Daily Logs, and schema support for Expenses.
    *   **Supabase MCP Tool:** The Supabase MCP tool is available for interacting with the database. The project ID is `uvqhdryqbynouwvicelp`.
*   **Authentication:** Custom auth with Supabase, utilizing `@supabase/auth-helpers-nextjs` for route handlers.
*   **File Storage:** Supabase Storage
*   **Deployment:** Vercel
*   **UI Components:** shadcn/ui

## 6. Integrated Components & Their Technologies

### 6.1. Integrated AI Agent Architecture (Next.js & LangGraph.js)

*   **Technology Stack:** Next.js API Routes, LangGraph.js, TypeScript, Zod, `@langchain/core`, `@langchain/openai` (or other LLM providers like `@langchain/google-genai`), `supabase-js`, `@vercel/ai`.
*   **Purpose:** AI agent logic (e.g., Lia Lead Assistant, EstimatorPro for generating, refining, and editing estimate line items, lead qualification agent, communication drafting agent, bid analysis agent, project/schedule initiation agent, invoicing agent, project planning agent, project update agent, task management agent, information retrieval agent, checklist generation agent, task prioritization agent, work order management agent, service ticket management agent, scheduling agent, dispatching agent, change order management agent, change order item identification agent, change order submission drafting agent, change order update verification agent, daily log creation/review agent, daily log issue identification agent, expense management agent, spending pattern analysis agent, cost savings identification agent) is directly integrated into the PROActive OS Next.js backend within API routes. These API routes define and execute agentic workflows using LangGraph.js. Zod is used for data validation and structuring inputs/outputs for LLMs and tools.
*   **Agent Data Fabric (ADF) Interaction:** TypeScript tools within the Next.js backend interact with the ADF (Supabase) using `supabase-js` for agent memory, knowledge retrieval, and tool access to core PROActive OS data. LangGraph.js's checkpointer mechanism will persist conversation state in Supabase Postgres (or other chosen persistence layer like Vercel KV).
*   **Key Interaction Flow:** PROActive OS Frontend -> PROActive OS Next.js Backend API (`/app/api/ai/assistant-chat` containing LangGraph.js agent) -> `supabase-js`/External APIs -> Response back through the chain (via Vercel AI SDK).

### 6.2. EstiMATE Pro (Integrated Functionality within PROActive OS)

*   **Frontend (within PROActive OS):** Utilizes components adapted from the original EstiMATE Pro prototype for the conversational UI and estimate display (`UnifiedEstimateClientPage.tsx`, `EstimateForm.tsx`).
*   **Backend (within PROActive OS):** The `/api/ai/estimate-chat` Next.js API route will now directly host and invoke the `EstimatorPro` LangGraph.js agent logic.

### 6.3. FloorPlan Pro (Takeoff Prototype - to be integrated into PROActive OS)

*   **Frontend:** Vite, React, TypeScript, Tailwind CSS
*   **Core Drawing Technology:** Konva.js
*   **Key Components for Integration:**
    *   `src/components/CanvasPanel.tsx` (Main drawing canvas)
    *   `src/components/CanvasTools.tsx` & `ZoomControls.tsx` (UI for canvas interaction)
    *   `src/components/CommandPanel.tsx` & `CommandHistory.tsx` (Conversational interface for drawing commands - may also be adapted to use Gemini API for NLU).
*   **Data Output (Target):** Structured JSON representing the layout and takeoff quantities.

## 7. Key Third-Party API Integrations (for PROActive OS)

1.  **AI - Large Language Models (LLMs):**
    *   **Service:** Google Gemini API
    *   **Purpose:** Powering conversational interfaces, AI reasoning, and content generation.
2.  **Scheduling & Calendar:**
    *   **Service 1:** Cal.com API
        *   **Purpose:** Embedding booking pages, receiving new appointment data.
    *   **Service 2:** Google Calendar API
        *   **Purpose:** Two-way sync for contractor's primary calendar.
3.  **Material Pricing Lookup:**
    *   **Service:** BigBox API (Home Depot)
        *   **Purpose:** Initial population of the `cost_items` library; ad-hoc price lookups during AI-driven estimation. Accessed via TypeScript tools within Next.js API routes.
4.  **Estimates, Invoicing & Payments:**
    *   **Service:** Square API
        *   **Purpose:** Creating official Square Estimates/Invoices, sending them, processing online payments, receiving payment status webhooks.
5.  **Accounting:**
    *   **Service:** [User's Choice: Odoo, Akaunting, or Frappe Books] API
        *   **Purpose:** Syncing finalized financial data.
        *   **Alternative:** n8n (or similar) as an intermediary.
6.  **Communication (In-App Chat, Voice, Video):**
    *   **Service:** Sendbird SDK/API
    *   **Purpose:** Embedding real-time communication features within the PROActive OS UI.
7.  **AI - Communication Drafting:**
    *   **Service:** Google Gemini API
    *   **Purpose:** Generating draft text for various communications (emails, messages, etc.).
8.  **Model Context Protocol (MCP):**
    *   **Purpose:** Standardized integration with external services where applicable (e.g., custom MCP servers for other services). Direct `supabase-js` client interaction will be used for Supabase, not the Supabase MCP tool.

## 8. Architectural Goal

The primary goal is to evolve the existing **PROActive OS (Next.js/Supabase)** into the central, intelligent hub with embedded AI capabilities. Functionality and UI concepts from **EstiMATE Pro** and **FloorPlan Pro** will be refactored and integrated *into* PROActive OS. All data will reside in the PROActive OS Supabase instance, forming the **Agent Data Fabric (ADF)**. Backend logic for AI and third-party integrations will be built directly within the PROActive OS Next.js backend, leveraging LangGraph.js for complex AI tasks and utilizing the ADF for context and memory. The focus is on creating a proactive system with embedded chat interfaces and a decluttered UI, where modules and access points are only present where needed, supported by a robust agent data layer.

## 9. Critical Implementation Paths

*   **Reliable LangGraph.js Agent Execution:** Ensuring robust execution of LangGraph.js agents within Next.js API routes, effective prompt engineering, and accurate parsing of structured responses.
*   **Seamless Integration of FloorPlan Pro Canvas:** Making the Konva.js canvas and its takeoff data flow smoothly into the estimation process.
*   **Reliable Supabase CRUD Operations:** All services interacting with Supabase must handle data consistently and manage relationships correctly.
*   **Secure and Efficient External API Clients:** For Square, BigBox, etc.

## 10. Next.js App Router Learnings (from People Module Task)

- **Hooks in Server Components:** Confirmed that React hooks like `useState` and `useRouter` can only be used in Client Components. Attempting to use them in Server Components results in errors.
- **Async Client Components:** Client Components cannot be `async`. Data fetching or other asynchronous operations within a Client Component should be handled using `useEffect` or a data fetching library.
- **Awaiting `searchParams` in Server Components (Next.js 15+):** In Next.js 15 and later, the `searchParams` object in Server Components is a Promise and must be awaited before accessing its properties. Direct access without awaiting will cause errors.

## 11. API Endpoints

### AI Agent Endpoints

- **`/api/ai/assistant-chat` (POST)**
    - **Description:** Main endpoint for interacting with the Pro-pilot AI assistant. Handles conversational input, invokes the LangGraph agent, manages state, and integrates with Zep for memory.
    - **Request Body:** `{ message: string, sessionId: string, userId: string }`
    - **Response:** `{ response: string, debugLog: any }` (includes AI's response and a debug log of tool calls/agent steps)

### Core Business Module Endpoints

#### People Module

- **`/api/people` (GET)**
    - **Description:** Retrieves a list of all people.
    - **Query Params:** `search`, `personType`
    - **Response:** `Person[]`
- **`/api/people` (POST)**
    - **Description:** Creates a new person.
    - **Request Body:** `NewPerson`
    - **Response:** `Person`
- **`/api/people/[id]` (GET)**
    - **Description:** Retrieves details for a specific person.
    - **Response:** `Person`
- **`/api/people/[id]` (PUT)**
    - **Description:** Updates an existing person.
    - **Request Body:** `UpdatePerson`
    - **Response:** `Person`
- **`/api/people/[id]` (DELETE)**
    - **Description:** Deletes a person.
    - **Response:** `void`

#### Opportunities Module

- **`/api/opportunities` (GET)**
    - **Description:** Retrieves a list of all opportunities.
    - **Query Params:** `status`, `personId`, `search`, `minValue`, `maxValue`
    - **Response:** `OpportunityWithPerson[]`
- **`/api/opportunities` (POST)**
    - **Description:** Creates a new opportunity.
    - **Request Body:** `NewOpportunity`
    - **Response:** `Opportunity`
- **`/api/opportunities/[id]` (GET)**
    - **Description:** Retrieves details for a specific opportunity, including related person, estimates, appointments, and projects.
    - **Response:** `OpportunityWithRelations`
- **`/api/opportunities/[id]` (PUT)**
    - **Description:** Updates an existing opportunity.
    - **Request Body:** `UpdateOpportunity`
    - **Response:** `Opportunity`
- **`/api/opportunities/[id]` (DELETE)**
    - **Description:** Deletes an opportunity.
    - **Response:** `void`

#### Estimates Module

- **`/api/estimates` (POST)**
    - **Description:** Creates a new estimate.
    - **Request Body:** `NewEstimate`
    - **Response:** `Estimate`
- **`/api/estimates` (GET)**
    - **Description:** Retrieves a list of estimates (with filtering/search/status).
    - **Query Params:** `status`, `projectId`, `personId`, `search`
    - **Response:** `Estimate[]`
- **`/api/estimates/[id]` (GET)**
    - **Description:** Retrieves estimate details.
    - **Response:** `Estimate`
- **`/api/estimates/[id]` (PUT)**
    - **Description:** Updates an estimate.
    - **Request Body:** `UpdateEstimate`
    - **Response:** `Estimate`
- **`/api/estimates/[id]` (DELETE)**
    - **Description:** Deletes an estimate.
    - **Response:** `void`
- **`/api/estimates/[id]/items` (POST)**
    - **Description:** Adds an item to an estimate.
    - **Request Body:** `NewEstimateItem`
    - **Response:** `EstimateItem`
- **`/api/estimates/[id]/items/:itemId` (PUT)**
    - **Description:** Updates an estimate item.
    - **Request Body:** `UpdateEstimateItem`
    - **Response:** `EstimateItem`
- **`/api/estimates/[id]/items/:itemId` (DELETE)**
    - **Description:** Deletes an estimate item.
    - **Response:** `void`
- **`/api/estimates/[id]/sections` (POST)**
    - **Description:** Adds a section to an estimate.
    - **Request Body:** `NewEstimateSection`
    - **Response:** `EstimateSection`
- **`/api/estimates/[id]/sections/:sectionId` (PUT)**
    - **Description:** Updates an estimate section.
    - **Request Body:** `UpdateEstimateSection`
    - **Response:** `EstimateSection`
- **`/api/estimates/[id]/sections/:sectionId` (DELETE)**
    - **Description:** Deletes an estimate section.
    - **Response:** `void`
- **`/api/estimates/:id/markup` (POST)**
    - **Description:** Applies bulk markup to an estimate.
    - **Request Body:** `{ percentage: number, itemTypes: string[] }`
    - **Response:** `Estimate`
- **`/api/estimates/:id/assignments` (PUT)**
    - **Description:** Assigns items in an estimate to employees/contractors.
    - **Request Body:** `{ assignments: { itemId: string, assignedTo: string }[] }`
    - **Response:** `Estimate`
- **`/api/estimates/:id/terms` (PUT)**
    - **Description:** Updates terms for an estimate.
    - **Request Body:** `{ terms: string }`
    - **Response:** `Estimate`
- **`/api/estimates/:id/scope-of-work` (PUT)**
    - **Description:** Updates scope of work for an estimate.
    - **Request Body:** `{ scopeOfWork: string }`
    - **Response:** `Estimate`
- **`/api/estimates/:id/bidding` (POST)**
    - **Description:** Manages bidding for an estimate.
    - **Request Body:** `any`
    - **Response:** `any`
- **`/api/estimates/:id/files` (POST)**
    - **Description:** Adds files to an estimate.
    - **Request Body:** `NewFile`
    - **Response:** `File`
- **`/api/estimates/:id/cover-sheet` (PUT)**
    - **Description:** Updates cover sheet details for an estimate.
    - **Request Body:** `{ coverSheetDetails: any }`
    - **Response:** `Estimate`
- **`/api/estimates/:id/notes` (PUT)**
    - **Description:** Updates notes for an estimate.
    - **Request Body:** `{ notes: string }`
    - **Response:** `Estimate`
- **`/api/estimates/:id/preview` (POST)**
    - **Description:** Generates an estimate preview (e.g., PDF).
    - **Request Body:** `void`
    - **Response:** `{ previewUrl: string }`
- **`/api/estimates/:id/submit` (POST)**
    - **Description:** Submits an estimate.
    - **Request Body:** `void`
    - **Response:** `Estimate`
- **`/api/estimates/:id/approve` (POST)**
    - **Description:** Approves an estimate.
    - **Request Body:** `void`
    - **Response:** `Estimate`
- **`/api/estimates/:id/add-to-pvb` (POST)**
    - **Description:** Adds estimate items to Blueprint of Values.
    - **Request Body:** `{ estimateItems: string[] }`
    - **Response:** `ProjectValuesBlueprint[]`
- **`/api/estimates/:id/generate-invoice` (POST)**
    - **Description:** Generates an invoice from estimate items.
    - **Request Body:** `{ estimateItems: string[] }`
    - **Response:** `Invoice`
- **`/api/estimates/:id/create-project-and-schedule` (POST)**
    - **Description:** Creates a project and schedule from an estimate.
    - **Request Body:** `{ estimateId: string }`
    - **Response:** `{ projectId: string, scheduleId: string }`

#### Bid Packages Module

- **`/api/estimates/:id/bid-packages` (POST)**
    - **Description:** Creates a new bid package for an estimate.
    - **Request Body:** `NewBidPackage`
    - **Response:** `BidPackage`
- **`/api/estimates/:id/bid-packages/:bidPackageId` (GET)**
    - **Description:** Retrieves bid package details.
    - **Response:** `BidPackage`
- **`/api/estimates/:id/bid-packages/:bidPackageId` (PUT)**
    - **Description:** Updates a bid package (including items, status).
    - **Request Body:** `UpdateBidPackage`
    - **Response:** `BidPackage`
- **`/api/estimates/:id/bid-packages/:bidPackageId` (DELETE)**
    - **Description:** Deletes a bid package.
    - **Response:** `void`
- **`/api/estimates/:id/bid-packages/:bidPackageId/email` (POST)**
    - **Description:** Emails a bid package.
    - **Request Body:** `{ recipientEmail: string, message: string }`
    - **Response:** `void`

#### Bid Submissions Module

- **`/api/bid-submissions` (POST)**
    - **Description:** Endpoint for subcontractors to submit bids (external).
    - **Request Body:** `NewBidSubmission`
    - **Response:** `BidSubmission`
- **`/api/estimates/:id/bid-packages/:bidPackageId/submissions` (GET)**
    - **Description:** Retrieves bid submissions for a specific bid package.
    - **Response:** `BidSubmission[]`
- **`/api/bid-submissions/:submissionId` (PUT)**
    - **Description:** Updates bid submission status (Award, Decline, etc.).
    - **Request Body:** `{ status: string }`
    - **Response:** `BidSubmission`
- **`/api/bid-submissions/:submissionId/apply-price` (POST)**
    - **Description:** Applies awarded bid price to the corresponding estimate item.
    - **Request Body:** `void`
    - **Response:** `EstimateItem`

#### Cost Items Module

- **`/api/cost-items` (GET)**
    - **Description:** Retrieves cost items (with filtering/search/group).
    - **Query Params:** `search`, `type`, `groupId`
    - **Response:** `CostItem[]`
- **`/api/cost-items` (POST)**
    - **Description:** Creates a new cost item ("add as you go").
    - **Request Body:** `NewCostItem`
    - **Response:** `CostItem`

#### Cost Item Groups Module

- **`/api/cost-item-groups` (POST)**
    - **Description:** Creates a new cost item group.
    - **Request Body:** `NewCostItemGroup`
    - **Response:** `CostItemGroup`
- **`/api/cost-item-groups` (GET)**
    - **Description:** Retrieves cost item groups.
    - **Response:** `CostItemGroup[]`

#### Jobs Module

- **`/api/jobs` (POST)**
    - **Description:** Creates a new job, linked to a contact, opportunity, or project.
    - **Request Body:** `NewJob`
    - **Response:** `Job`
- **`/api/jobs` (GET)**
    - **Description:** Retrieves jobs (with filtering/search/status).
    - **Query Params:** `status`, `projectId`, `personId`, `search`
    - **Response:** `Job[]`
- **`/api/jobs/:id` (GET)**
    - **Description:** Retrieves job details (including checklist items).
    - **Response:** `Job`
- **`/api/jobs/:id` (PUT)**
    - **Description:** Updates a job.
    - **Request Body:** `UpdateJob`
    - **Response:** `Job`
- **`/api/jobs/:id` (DELETE)**
    - **Description:** Deletes a job.
    - **Response:** `void`
- **`/api/jobs/:id/checklist-items` (POST)**
    - **Description:** Adds a checklist item to a job.
    - **Request Body:** `NewChecklistItem`
    - **Response:** `ChecklistItem`
- **`/api/jobs/:id/checklist-items/:itemId` (PUT)**
    - **Description:** Updates a checklist item (including completion status).
    - **Request Body:** `UpdateChecklistItem`
    - **Response:** `ChecklistItem`

#### Work Orders Module

- **`/api/work-orders` (POST)**
    - **Description:** Creates a new work order, linked to a client or project.
    - **Request Body:** `NewWorkOrder`
    - **Response:** `WorkOrder`
- **`/api/work-orders` (GET)**
    - **Description:** Retrieves work orders (with filtering/search).
    - **Query Params:** `status`, `clientId`, `projectId`, `search`
    - **Response:** `WorkOrder[]`
- **`/api/work-orders/:id` (GET)**
    - **Description:** Retrieves work order details.
    - **Response:** `WorkOrder`
- **`/api/work-orders/:id` (PUT)**
    - **Description:** Updates a work order.
    - **Request Body:** `UpdateWorkOrder`
    - **Response:** `WorkOrder`
- **`/api/work-orders/:id` (DELETE)**
    - **Description:** Deletes a work order.
    - **Response:** `void`

#### Service Tickets Module

- **`/api/service-tickets` (POST)**
    - **Description:** Creates a new service ticket, linked to a client, membership, or service.
    - **Request Body:** `NewServiceTicket`
    - **Response:** `ServiceTicket`
- **`/api/service-tickets` (GET)**
    - **Description:** Retrieves service tickets (with filtering/search).
    - **Query Params:** `status`, `clientId`, `membershipId`, `search`
    - **Response:** `ServiceTicket[]`
- **`/api/service-tickets/:id` (GET)**
    - **Description:** Retrieves service ticket details.
    - **Response:** `ServiceTicket`
- **`/api/service-tickets/:id` (PUT)**
    - **Description:** Updates a service ticket.
    - **Request Body:** `UpdateServiceTicket`
    - **Response:** `ServiceTicket`
- **`/api/service-tickets/:id` (DELETE)**
    - **Description:** Deletes a service ticket.
    - **Response:** `void`
- **`/api/service-tickets/:id/esign` (POST)**
    - **Description:** Captures electronic signature for a service ticket.
    - **Request Body:** `{ signatureData: string }`
    - **Response:** `ServiceTicket`

#### Change Orders Module

- **`/api/change-orders` (POST)**
    - **Description:** Creates a new change order, linked to a project or customer.
    - **Request Body:** `NewChangeOrder`
    - **Response:** `ChangeOrder`
- **`/api/change-orders` (GET)**
    - **Description:** Retrieves change orders (with filtering/search/status).
    - **Query Params:** `status`, `projectId`, `customerId`, `search`
    - **Response:** `ChangeOrder[]`
- **`/api/change-orders/:id` (GET)**
    - **Description:** Retrieves change order details (including items).
    - **Response:** `ChangeOrder`
- **`/api/change-orders/:id` (PUT)**
    - **Description:** Updates a change order.
    - **Request Body:** `UpdateChangeOrder`
    - **Response:** `ChangeOrder`
- **`/api/change-orders/:id` (DELETE)**
    - **Description:** Deletes a change order.
    - **Response:** `void`
- **`/api/change-orders/:id/items` (POST)**
    - **Description:** Adds an item to a change order.
    - **Request Body:** `NewChangeOrderItem`
    - **Response:** `ChangeOrderItem`
- **`/api/change-orders/:id/items/:itemId` (PUT)**
    - **Description:** Updates a change order item.
    - **Request Body:** `UpdateChangeOrderItem`
    - **Response:** `ChangeOrderItem`
- **`/api/change-orders/:id/items/:itemId` (DELETE)**
    - **Description:** Deletes a change order item.
    - **Response:** `void`
- **`/api/change-orders/:id/submit-for-approval` (POST)**
    - **Description:** Submits a change order for approval.
    - **Request Body:** `void`
    - **Response:** `ChangeOrder`
- **`/api/change-orders/:id/approve` (POST)**
    - **Description:** Endpoint for client approval of a change order (external interface).
    - **Request Body:** `{ signatureData: string }`
    - **Response:** `ChangeOrder`
- **`/api/change-orders/:id/decline` (POST)**
    - **Description:** Endpoint for client decline of a change order (external interface).
    - **Request Body:** `{ reason: string }`
    - **Response:** `ChangeOrder`
- **`/api/change-orders/:id/import-from-estimate` (POST)**
    - **Description:** Imports items into a change order from an estimate.
    - **Request Body:** `{ estimateId: string, itemIds: string[] }`
    - **Response:** `ChangeOrder`
- **`/api/change-orders/:id/import-from-pvb` (POST)**
    - **Description:** Imports items into a change order from Blueprint of Values.
    - **Request Body:** `{ pvbId: string, itemIds: string[] }`
    - **Response:** `ChangeOrder`

#### Daily Logs Module

- **`/api/daily-logs` (POST)**
    - **Description:** Creates a new daily log, linked to a project.
    - **Request Body:** `NewDailyLog`
    - **Response:** `DailyLog`
- **`/api/daily-logs` (GET)**
    - **Description:** Retrieves daily logs (with filtering/search).
    - **Query Params:** `projectId`, `date`, `search`
    - **Response:** `DailyLog[]`
- **`/api/daily-logs/:id` (GET)**
    - **Description:** Retrieves daily log details.
    - **Response:** `DailyLog`
- **`/api/daily-logs/:id` (PUT)**
    - **Description:** Updates a daily log.
    - **Request Body:** `UpdateDailyLog`
    - **Response:** `DailyLog`
- **`/api/daily-logs/:id` (DELETE)**
    - **Description:** Deletes a daily log.
    - **Response:** `void`
- **`/api/daily-logs/:id/people` (POST)**
    - **Description:** Adds people on site to a daily log.
    - **Request Body:** `NewDailyLogPerson`
    - **Response:** `DailyLogPerson`
- **`/api/daily-logs/:id/materials` (POST)**
    - **Description:** Adds material details to a daily log.
    - **Request Body:** `NewDailyLogMaterial`
    - **Response:** `DailyLogMaterial`
- **`/api/daily-logs/:id/equipment` (POST)**
    - **Description:** Adds equipment details to a daily log.
    - **Request Body:** `NewDailyLogEquipment`
    - **Response:** `DailyLogEquipment`
- **`/api/daily-logs/:id/notes` (POST)**
    - **Description:** Adds notes to a daily log.
    - **Request Body:** `NewDailyLogNote`
    - **Response:** `DailyLogNote`
- **`/api/daily-logs/:id/files` (POST)**
    - **Description:** Adds files to a daily log.
    - **Request Body:** `NewDailyLogFile`
    - **Response:** `DailyLogFile`
- **`/api/daily-logs/:id/incidents` (POST)**
    - **Description:** Adds an incident to a daily log.
    - **Request Body:** `NewDailyLogIncident`
    - **Response:** `DailyLogIncident`

#### Expenses Module

- **`/api/expenses` (POST)**
    - **Description:** Creates a new expense, linked to a project.
    - **Request Body:** `NewExpense`
    - **Response:** `Expense`
- **`/api/expenses` (GET)**
    - **Description:** Retrieves expenses (with filtering/search).
    - **Query Params:** `projectId`, `dateRange`, `category`, `search`
    - **Response:** `Expense[]`
- **`/api/expenses/:id` (GET)**
    - **Description:** Retrieves expense details.
    - **Response:** `Expense`
- **`/api/expenses/:id` (PUT)**
    - **Description:** Updates an expense.
    - **Request Body:** `UpdateExpense`
    - **Response:** `Expense`
- **`/api/expenses/:id` (DELETE)**
    - **Description:** Deletes an expense.
    - **Response:** `void`

#### Projects Module

- **`/api/projects` (GET)**
    - **Description:** Retrieves a list of projects (with filtering/sorting/status).
    - **Query Params:** `status`, `projectManagerId`, `search`
    - **Response:** `Project[]`
- **`/api/projects/:id` (GET)**
    - **Description:** Retrieves project details (including data for all linked sections).
    - **Response:** `Project`
- **`/api/projects/:id` (PUT)**
    - **Description:** Updates project details.
    - **Request Body:** `UpdateProject`
    - **Response:** `Project`
- **`/api/projects/:id/daily-logs` (POST)**
    - **Description:** Adds a daily log to a project.
    - **Request Body:** `NewDailyLog`
    - **Response:** `DailyLog`
- **`/api/projects/:id/invoices` (POST)**
    - **Description:** Generates an invoice for a project.
    - **Request Body:** `NewInvoice`
    - **Response:** `Invoice`
- **`/api/projects/:id/punchlists` (POST)**
    - **Description:** Adds a punchlist to a project.
    - **Request Body:** `NewPunchlist`
    - **Response:** `Punchlist`
- **`/api/projects/:id/documents` (POST)**
    - **Description:** Adds a document to a project.
    - **Request Body:** `NewDocument`
    - **Response:** `Document`
- **`/api/projects/:id/time-entries` (POST)**
    - **Description:** Adds a time entry to a project.
    - **Request Body:** `NewTimeEntry`
    - **Response:** `TimeEntry`
- **`/api/projects/:id/schedule` (GET)**
    - **Description:** Retrieves the project schedule.
    - **Response:** `Schedule`
- **`/api/projects/:id/contacts` (GET)**
    - **Description:** Retrieves project contacts.
    - **Response:** `Contact[]`
- **`/api/projects/:id/procurement` (GET)**
    - **Description:** Retrieves procurement data for a project.
    - **Response:** `ProcurementData`
- **`/api/projects/:id/client-access` (GET)**
    - **Description:** Retrieves client access settings for a project.
    - **Response:** `ClientAccessSettings`
- **`/api/projects/:id/reports` (GET)**
    - **Description:** Retrieves reports for a project.
    - **Response:** `Report[]`

#### Documents Module

- **`/api/documents` (POST)**
    - **Description:** Uploads/creates a new document, linked to an entity (e.g., contact, opportunity, project).
    - **Request Body:** `NewDocument`
    - **Response:** `Document`
- **`/api/contacts/:id/documents` (POST)**
    - **Description:** Adds a document to a contact (with type).
    - **Request Body:** `NewDocument`
    - **Response:** `Document`

#### Categories Module

- **`/api/categories/:type` (GET)**
    - **Description:** Retrieves "add as you go" categories for a specific type (e.g., 'Source', 'Stage', 'Type').
    - **Response:** `Category[]`
- **`/api/categories/:type` (POST)**
    - **Description:** Adds a new "add as you go" category for a specific type.
    - **Request Body:** `{ name: string }`
    - **Response:** `Category`

### AI-Driven Endpoints

- **`/api/ai/estimate-chat` (POST)**
    - **Description:** Endpoint for embedded conversational estimation, allowing users to interact with the AI Estimator agent.
    - **Request Body:** `{ message: string, sessionId: string, estimateId: string }`
    - **Response:** `{ response: string, structuredEstimate: any }`
- **`/api/ai/qualify-lead` (POST)**
    - **Description:** Triggers the AI to qualify a lead.
    - **Request Body:** `{ leadId: string }`
    - **Response:** `{ leadId: string, qualificationStatus: string, rationale: string }`
- **`/api/ai/draft-communication` (POST)**
    - **Description:** Triggers the AI to draft a communication (e.g., email, message).
    - **Request Body:** `{ context: any, communicationType: string }`
    - **Response:** `{ draftedText: string }`
- **`/api/ai/opportunities/score` (POST)**
    - **Description:** Triggers the AI to calculate and update the lead score for a given opportunity.
    - **Request Body:** `{ opportunityId: string }`
    - **Response:** `{ opportunityId: string, newLeadScore: number }`
- **`/api/ai/opportunities/suggest-update` (POST)**
    - **Description:** Triggers the AI to analyze recent communications and suggest updates for an opportunity.
    - **Request Body:** `{ opportunityId: string, communicationContent: string }` (or reference to Zep session)
    - **Response:** `{ opportunityId: string, suggestedUpdates: { field: string, oldValue: any, newValue: any, rationale: string }[] }`
- **`/api/ai/opportunities/suggest-next-action` (GET)**
    - **Description:** Retrieves AI-driven suggestions for the next best actions for a specific opportunity.
    - **Query Params:** `opportunityId: string`
    - **Response:** `{ opportunityId: string, suggestedActions: { action: string, rationale: string }[] }`
- **`/api/ai/analyze-bids` (POST)**
    - **Description:** Endpoint to trigger AI bid analysis.
    - **Request Body:** `{ bidPackageId: string }`
    - **Response:** `{ bidAnalysis: any }`
- **`/api/ai/create-project-and-schedule` (POST)**
    - **Description:** Endpoint to trigger AI to create a project and schedule from an estimate.
    - **Request Body:** `{ estimateId: string }`
    - **Response:** `{ projectId: string, scheduleId: string }`
- **`/api/ai/plan-project` (POST)**
    - **Description:** Endpoint to trigger AI project planning.
    - **Request Body:** `{ projectId: string }`
    - **Response:** `{ projectPlan: any }`
- **`/api/ai/project-chat` (POST)**
    - **Description:** Endpoint for embedded conversational project management.
    - **Request Body:** `{ message: string, sessionId: string, projectId: string }`
    - **Response:** `{ response: string }`
- **`/api/ai/job-chat` (POST)**
    - **Description:** Endpoint for embedded conversational job management.
    - **Request Body:** `{ message: string, sessionId: string, jobId: string }`
    - **Response:** `{ response: string }`
- **`/api/ai/work-order-chat` (POST)**
    - **Description:** Endpoint for embedded conversational work order management.
    - **Request Body:** `{ message: string, sessionId: string, workOrderId: string }`
    - **Response:** `{ response: string }`
- **`/api/ai/service-ticket-chat` (POST)**
    - **Description:** Endpoint for embedded conversational service ticket management.
    - **Request Body:** `{ message: string, sessionId: string, serviceTicketId: string }`
    - **Response:** `{ response: string }`
- **`/api/ai/change-order-chat` (POST)**
    - **Description:** Endpoint for embedded conversational change order management.
    - **Request Body:** `{ message: string, sessionId: string, changeOrderId: string }`
    - **Response:** `{ response: string }`
- **`/api/ai/daily-log-chat` (POST)**
    - **Description:** Endpoint for embedded conversational daily log management.
    - **Request Body:** `{ message: string, sessionId: string, dailyLogId: string }`
    - **Response:** `{ response: string }`
- **`/api/ai/expense-chat` (POST)**
    - **Description:** Endpoint for embedded conversational expense management.
    - **Request Body:** `{ message: string, sessionId: string, expenseId: string }`
    - **Response:** `{ response: string }`
