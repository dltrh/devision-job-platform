# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# JobManager Frontend

A scalable React application built with TypeScript, following a modularized component architecture with headless UI patterns.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📂 Project Structure

```
src/
├── components/
│   ├── headless/         # Logic-only components (Form, Table, Modal)
│   ├── ui/               # Presentational components (Button, Input, Card)
│   └── feature/          # Feature-specific components
│       └── Authentication/
│           └── CompanyLogin/
├── hooks/                # Global custom hooks
├── layout/               # Layout components
├── pages/                # Page components (Routes)
├── services/             # API services
├── store/                # Redux store
├── types/                # TypeScript types
└── utils/                # Utility functions
```

## 🎨 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **Redux Saga** - Side effects
- **Axios** - HTTP client
- **React Router** - Routing

## 🧩 Key Features

### Headless UI Pattern

Separate logic from presentation for maximum flexibility:

```tsx
<HeadlessForm onSubmit={handleSubmit} validate={validate}>
  {({ values, handleChange, errors }) => <YourCustomUI />}
</HeadlessForm>
```

### Path Aliases

Clean imports using `@/` prefix:

```tsx
import { Button } from "@/components/ui";
import { useDebounce } from "@/hooks";
```

### Component Library

- **UI Components**: Button, Input, Card, Alert, Spinner
- **Headless Components**: Form, Table, Modal
- **Hooks**: useDebounce, useLocalStorage, useMediaQuery

## 📝 Development Guidelines

### Creating a New Feature

1. **Create feature directory**:

```bash
mkdir -p src/components/feature/FeatureName
```

2. **Implement using the pattern**:

   - `FeatureName.tsx` - Main component (composition)
   - `FeatureNameUI.tsx` - UI layer
   - `useFeatureName.ts` - Business logic hook
   - `types.ts` - TypeScript types
   - `api/` - API services

3. **Export from index.ts**:

```tsx
export { FeatureName } from "./FeatureName";
```

### File Naming Conventions

| Type       | Convention        | Example      |
| ---------- | ----------------- | ------------ |
| Components | PascalCase        | `Button.tsx` |
| Hooks      | camelCase + `use` | `useAuth.ts` |
| Utils      | camelCase         | `helpers.ts` |
| Types      | PascalCase        | `common.ts`  |

## 🎯 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Path Aliases

Configured in `tsconfig.json` and `vite.config.js`:

```json
{
  "paths": {
    "@/*": ["src/*"]
  }
}
```
