# Dynamic CV Builder & Applicant Tracking System

Solution Byte is a full-stack, role-based platform designed to bridge the gap between recruiters and candidates. It allows recruiters to dynamically construct job positions with specific requirements (Access Rules), while enabling candidates to build a master profile and generate tailored, professional CVs that automatically validate against those requirements.

⭐ Key Features </br>
🏢 For Recruiters & Admins
- Attribute Library Management: Create and manage a global repository of CV attributes (e.g., "IELTS Score", "Years of React Experience"). Supports multiple data types: Text, Numeric, Boolean, and Dropdowns.
- Dynamic Position Templates: Create job listings (Positions) and attach strict Access Rules using the Attribute Library. Set minimum scores, exact matches, or required skills.
- Applicant Tracking: View all dynamically generated CVs submitted by candidates for specific roles.
- Real-time Interaction: Like submitted CVs and participate in live-polling discussion boards for every position.
- User Management (Admin): Full control panel to change user roles, block malicious accounts, or delete users.

🎓 For Candidates
- Master Profile: A central hub to manage personal information, projects (with Markdown support and tech tags), and skill attributes.
- Auto-Saving: The core profile features a robust debounced auto-save mechanism to prevent data loss.
- Smart CV Generation: Candidates apply to positions by "Generating a CV". The engine intercepts the request, validates the candidate's master profile against the Recruiter's Access Rules, and either rejects the application or dynamically generates a professional document.
- Context-Aware Rendering: The generated CV automatically filters the candidate's projects to highlight only those matching the technology tags requested by the position.

🪢 Architecture & Technical Decisions
- Optimistic Locking: Implemented across core entities (Attributes, Profiles, Positions) using a version integer to prevent race conditions and lost updates when multiple users edit the same data concurrently.
- Debounced API Calls: Implemented custom hooks for search inputs and auto-save fields to minimize unnecessary database queries and optimize performance.
- Role-Based Access Control (RBAC): Strict JWT-based authentication via HTTP-only secure cookies. Middleware guards ensure routes are explicitly locked down to CANDIDATE, RECRUITER, or ADMIN roles.
- Relational Data Modeling: Leveraging Prisma ORM on a PostgreSQL database for complex table joins (e.g., linking a CV to a Profile, to a Position, and mapping Attribute Values to specific requirements).

💻 Tech Stack

__Frontend:__
- React 19 (Vite)
- Tailwind CSS & Shadcn UI (Component Library)
- TanStack Query (React Query) for data fetching, caching, and live polling
- React Router DOM for client-side navigation
- React Hot Toast for UI notifications

__Backend:__
- Node.js & Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JSON Web Tokens (JWT) & Cookie Parser for secure auth

🚀 Getting Started
__Prerequisites__
- Node.js (v18 or higher)
- PostgreSQL database (Local or Cloud like Neon/Supabase)

### 1. Backend Setup
Navigate to the backend directory:
```
cd backend
```

Install dependencies:
```
npm install
```

Create a .env file in the root of the backend directory:
```
DATABASE_URL="****"
JWT_SECRET="****"
FRONTEND_URL="http://localhost:5173"
PORT=5000

# saleforce
SF_CLIENT_ID="****"
SF_CLIENT_SECRET="****"
SF_USERNAME="****
SF_PASSWORD="****"
SF_SECURITY_TOKEN="****"
```

Push the database schema and start the server:
```
npx prisma db push
npm run dev
```

### 2. Frontend Setup
Navigate to the frontend directory:
```
cd frontend
```

Install dependencies:
```
pnpm install
```

Create a .env file in the root of the frontend directory:
```
VITE_API_URL="http://localhost:5000/api"
```

Start the development server:
```
pnpm run dev
```

### 🔐 Initial Admin Setup
By design, the registration endpoint defaults new users to the CANDIDATE or RECRUITER role. To bootstrap your first ADMIN account:
1. Register a new user via the UI.
2. Open your database via Prisma Studio: npx prisma studio
3. Locate your user record and change the role enum to ADMIN.
4. Refresh the application to access the User Management dashboard.

### 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.