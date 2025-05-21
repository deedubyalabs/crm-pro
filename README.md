# PROActive OS

![PROActive OS](public/abstract-logo.png)

PROActive OS is a comprehensive business operations platform designed specifically for home service professionals. It streamlines project management, customer relationships, financial operations, and field service coordination through an agent-optimized interface.

## 🌟 Overview

PROActive OS is built to address the unique challenges faced by home service businesses, including contractors, remodelers, HVAC specialists, plumbers, electricians, and other trade professionals. The platform integrates all aspects of business operations into a single, cohesive system.

## ✨ Key Features

### 🏗️ Project Management
- Complete project lifecycle management
- Job scheduling and tracking
- Material lists and takeoffs
- Intelligent scheduling with weather impact analysis

### 💼 Customer Relationship Management
- Lead and opportunity tracking
- Customer communication hub
- Appointment scheduling
- Client portal for customer access

### 💰 Financial Management
- Estimates and proposals
- Invoicing and payment processing
- Expense tracking
- Change order management
- Financial dashboard with KPIs

### 📄 Document Management
- Document storage and organization
- Document sharing and collaboration
- Version control
- E-signature capabilities

### 🤖 Agent Workspace
- AI-powered agents for task automation
- Tool integration framework
- Task management
- System settings and configuration

### 📱 Mobile Accessibility
- Responsive design for field use
- Voice notes and transcription
- Photo documentation

## 🛠️ Technology Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with Supabase
- **Payment Processing**: Square
- **Email**: Resend
- **Storage**: Supabase Storage
- **Deployment**: Vercel
- **External APIs**: BigBox API, Weather API

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Square developer account (for payment processing)
- Resend account (for email functionality)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/your-username/homepro-os.git
   cd homepro-os
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   NEXT_PUBLIC_SQUARE_APP_ID=your_square_app_id
   SQUARE_ACCESS_TOKEN=your_square_access_token
   SQUARE_LOCATION_ID=your_square_location_id
   NEXT_PUBLIC_SQUARE_API_URL=your_square_api_url
   
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=your_email_address
   
   NEXT_PUBLIC_BIGBOX_API_URL=your_bigbox_api_url
   BIGBOX_API_KEY=your_bigbox_api_key
   \`\`\`

4. Run database migrations:
   \`\`\`bash
   npm run migrate
   # or
   yarn migrate
   \`\`\`

5. Start the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

\`\`\`
homepro-os/
├── app/                    # Next.js App Router
│   ├── agent-workspace/    # Agent workspace pages
│   ├── api/                # API routes
│   ├── appointments/       # Appointment management
│   ├── auth/               # Authentication pages
│   ├── calendar/           # Calendar views
│   ├── change-orders/      # Change order management
│   ├── client-portal/      # Client portal pages
│   ├── cost-items/         # Cost items management
│   ├── documents/          # Document management
│   ├── estimates/          # Estimate creation and management
│   ├── expenses/           # Expense tracking
│   ├── financial-dashboard/# Financial reporting
│   ├── inbox/              # Communication hub
│   ├── invoices/           # Invoice management
│   ├── jobs/               # Job management
│   ├── material-lists/     # Material lists
│   ├── opportunities/      # Sales opportunities
│   ├── payments/           # Payment processing
│   ├── people/             # Customer and contact management
│   ├── projects/           # Project management
│   ├── settings/           # System settings
│   ├── voice-notes/        # Voice notes and transcription
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Shared React components
├── contexts/               # React context providers
├── db/                     # Database migrations and schema
├── emails/                 # Email templates
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and services
├── public/                 # Static assets
├── types/                  # TypeScript type definitions
├── .env.local              # Environment variables (not in repo)
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
\`\`\`

## 📖 Usage

### Agent Workspace

The Agent Workspace is the central hub for AI-powered automation. Here you can:
- Configure and deploy agents for specific tasks
- Manage tools that agents can use
- Monitor agent activity through logs
- Configure system-wide settings

### Project Management

Create and manage projects with:
- Customer details and project specifications
- Job scheduling and tracking
- Material takeoffs and lists
- Financial tracking including estimates, invoices, and expenses
- Document management

### Financial Management

Comprehensive financial tools including:
- Estimate creation with line items and payment schedules
- Invoice generation and payment tracking
- Change order management
- Expense tracking
- Financial dashboard with key metrics

### Customer Management

Manage your customer relationships with:
- Lead and opportunity tracking
- Customer communication
- Appointment scheduling
- Client portal for customer access to projects, invoices, and documents

## 🗺️ Roadmap

### Q3 2023
- [x] Core project management functionality
- [x] Basic financial management (estimates, invoices)
- [x] Customer relationship management
- [x] Document management system

### Q4 2023
- [x] Agent workspace for AI-powered automation
- [x] Enhanced financial reporting
- [x] Square payment integration
- [x] Client portal for customer access
- [x] Voice notes and transcription

### Q1 2024
- [x] Material takeoffs and lists
- [x] Purchase order management
- [x] Expense tracking
- [x] BigBox integration for material pricing
- [x] Document sharing and collaboration

### Q2 2024
- [x] Intelligent scheduling with weather impact analysis
- [x] Enhanced communication tools
- [x] Mobile app for field use
- [ ] Time tracking and payroll integration
- [ ] Enhanced reporting and analytics

### Q3 2024
- [ ] Equipment management and tracking
- [ ] Warranty management
- [ ] Customer review management
- [ ] Enhanced client portal features
- [ ] Advanced document management with version control

### Q4 2024
- [ ] Subcontractor management
- [ ] Advanced scheduling with resource optimization
- [ ] Inventory management
- [ ] Enhanced mobile capabilities
- [ ] Integration with accounting software

### 2025 and Beyond
- [ ] Multi-location support
- [ ] Franchise management
- [ ] Advanced business intelligence
- [ ] Machine learning for project estimation
- [ ] AR/VR integration for project visualization
- [ ] IoT integration for smart home services

## 🤝 Contributing

We welcome contributions to PROActive OS! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Square](https://squareup.com/developers)
- [Resend](https://resend.io/)
- [Vercel](https://vercel.com/)

---

Built with ❤️ by the PROActive OS Team
