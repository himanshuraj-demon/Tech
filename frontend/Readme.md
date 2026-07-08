# Technical Council Website - Frontend Application

A Next.js static client application built for the **Technical Council of IIT Gandhinagar**. The frontend is fully decoupled from the backend and is designed to build and export as static HTML/CSS/JS files, which can be deployed to any static host (such as Vercel, Netlify, GitHub Pages, or Nginx).

---

## 🚀 Getting Started

Follow these steps to set up the frontend project locally:

### 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or later recommended)
- **npm** (v9.x or later)

### 2. Installation

Clone the repository, navigate to the `frontend` folder, and install dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Copy the template environment variables to create a `.env.local` file:

```bash
npm run setup:env
```

Alternatively, you can manually copy `.env.example` to `.env.local`:
- **Windows (PowerShell)**: `copy .env.example .env.local`
- **Linux / macOS**: `cp .env.example .env.local`

---

## 🔑 Environment Variables

The frontend relies on the following environment variables. Ensure these are defined in your local environment file (`.env` or `.env.local`):

| Variable | Type | Description | Default / Local | Production Example |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public (Client) | The base URL(backend) of the backend API server. Used for all API requests. | `http://localhost:3001` | `https://api.yourdomain.com` |
| `NEXTAUTH_URL` | Private / Reference | The URL(backend) of the authentication server. Used for callbacks and session matching. | `http://localhost:3001` | `https://api.yourdomain.com` |


> [!NOTE]
> Environment variables prefixed with `NEXT_PUBLIC_` are automatically bundled and exposed to the browser client by Next.js. Any other environment variables will not be available in client-side code.

---

## 🛠️ Available Scripts

In the project directory, you can run the following commands:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the Next.js development server with Turbopack enabled on `http://localhost:3000`. |
| `npm run build` | Builds the application for production. Because the app is configured for static export (`output: "export"`), it automatically exports the static site to the `/out` directory. |
| `npm run start` | Starts a Next.js production server. *(Note: Since this frontend is statically exported, you typically serve the `/out` directory rather than running this server in production).* |
| `npm run lint` | Runs ESLint to check code quality and formatting. |
| `npm run setup:env` | Automatically copies `.env.example` to `.env.local` for quick environment setup. |

---

## 📦 Deployment & Static Export

The project uses Next.js Static HTML Export, configured via `next.config.ts`:

```typescript
// next.config.ts
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Required for static exports
  },
  trailingSlash: false,
};
```

### Production Build & Hosting
1. Build the production build:
   ```bash
   npm run build
   ```
2. The output will be generated inside the `out/` directory.
3. You can deploy this directory to any static hosting service (e.g. Vercel, Netlify, AWS S3, or Nginx).

> [!IMPORTANT]
> **API Server Communication**: Ensure the `NEXT_PUBLIC_API_URL` is set to the live backend server URL before running `npm run build` for production. The static build will hardcode this URL value into client-side API requests.
