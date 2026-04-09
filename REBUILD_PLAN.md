# WMealPlan Rebuild Plan: Modernizing with Next.js

## 1. Executive Summary
The current application is a functional full-stack app using a legacy pattern (React CRA + Express). We will rebuild it using **Next.js (App Router)** to unify the frontend and backend, improve security (hiding API keys), and modernize the UI with **Tailwind CSS**.

## 2. Architecture Comparison

| Feature | Current Architecture | New Architecture (Next.js) | Benefits |
| :--- | :--- | :--- | :--- |
| **Framework** | React (CRA) + Express | Next.js 14+ (App Router) | Unified codebase, better performance, SSR/ISR support. |
| **Language** | TypeScript | TypeScript | Type safety maintained. |
| **Styling** | Plain CSS | Tailwind CSS | Faster development, consistent design system, easier maintenance. |
| **API Calls** | Client-side (Exposes Keys) | Server Actions / API Routes | **Security**: API keys stay on the server. No exposure to client. |
| **Database** | Vercel Postgres (via Express) | Vercel Postgres (via Next.js) | Direct integration, serverless-friendly. |
| **Deployment** | Vercel (requires config) | Vercel (Native) | Zero-config deployment. |

## 3. Technology Stack
- **Core**: [Next.js](https://nextjs.org/) (React Framework)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (optional, for polished components)
- **AI**: Google Gemini API (Server-side)
- **Database**: Vercel Postgres (Existing)
- **State Management**: React Hooks (sufficient for this scale) / Context API

## 4. Migration Strategy

### Phase 1: Initialization & Setup
- Initialize a new Next.js project in the root (or a `web` folder temporarily).
- Configure Tailwind CSS.
- Set up environment variables (`GEMINI_API_KEY`, `POSTGRES_URL`, etc.).

### Phase 2: Backend & Logic Migration
- **Gemini Service**: Move `client/src/api/gemini.ts` logic to a Server Action (`app/actions/generate-plan.ts`).
  - *Improvement*: Better error handling and type validation using Zod.
- **Database Service**: Move `server.js` DB logic to `lib/db.ts` or Server Actions.
  - Port `saveMealPlan`, `loadMealPlan`, `saveFeedback`.

### Phase 3: Frontend Component Migration
- Rebuild `PreferencesForm` using Tailwind forms.
- Rebuild `MealPlanView` and `ShoppingListView` with responsive grid layouts.
- Rebuild `FeedbackModal` using a dialog component.
- Ensure all types from `types/mealPlan.ts` are preserved and shared.

### Phase 4: Integration & Refinement
- Connect Frontend forms to Server Actions.
- Implement "Streaming" UI for AI generation (optional but better UX).
- Add loading states (Skeletons).
- Verify PDF export functionality.

## 5. Directory Structure (Proposed)
```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx            # Home / Preferences Form
│   ├── plan/
│   │   └── [id]/           # Shared plan view
│   │       └── page.tsx
│   └── api/                # Internal APIs (if needed)
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── meal-plan/          # Specific feature components
│   │   ├── preferences-form.tsx
│   │   ├── meal-grid.tsx
│   │   └── shopping-list.tsx
│   └── feedback-modal.tsx
├── lib/
│   ├── gemini.ts           # AI Logic
│   ├── db.ts               # Database Logic
│   └── utils.ts
├── types/
│   └── index.ts
└── public/
```

## 6. Action Plan
1.  **Backup**: Ensure current code is safe (git commit).
2.  **Scaffold**: Create the Next.js app.
3.  **Port Types**: Copy `types/mealPlan.ts` to the new project.
4.  **Implement Backend**: Create the AI and DB functions.
5.  **Implement UI**: Build the pages and components.
6.  **Switch**: Replace the old build pipeline with the Next.js one.
