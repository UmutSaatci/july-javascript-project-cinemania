# 🎬 Cinemania - Modern Phonebook & Cinema Community Application

This repository is a fully modernized, secure, and feature-rich **React + Redux Toolkit** application built on top of the original **Cinemania** template. By forking the original codebase, I refactored the entire architectural skeleton, decoupled core components, integrated persistent authentication, and injected fluid micro-interactions to maximize user experience (UX).

---

## 🔥 Key Contributions & Architectural Enhancements (What I Built)

After forking the repository, I implemented the following critical technical milestones to elevate the project to production-ready standards:

### 1. 🔐 Robust Authentication & Session Persistence
* **Asynchronous Auth Flows:** Leveraged Redux Toolkit's `createAsyncThunk` to architect end-to-end asynchronous flows for `signupUser`, `loginUser`, and `logoutUser`.
* **F5 / Page Refresh Protection (`refreshUserToken`):** Solved the common SPA state-wipe bug upon browser refresh by integrating a background hydration check with the `GET /users/current` endpoint, ensuring seamless token validation.

### 2. 🛡️ Advanced Route Guarding & Structural Layouts
* **Modular Dashboard Layout (`Layout` & `AppBar`):** Crafted a responsive, globally accessible layout structure. Separated the main navigation bar into isolated, clean sub-components: `Navigation`, `AuthNav`, and `UserMenu`.
* **Smart Route Barriers:** Designed scalable `PrivateRoute` and `RestrictedRoute` components. Unauthenticated users are securely guarded against private routes (`/contacts`), while authenticated users are barred from backtracking into `/login` or `/register`.

### 3. 💾 State Persistence & Zero-Flakiness API Integration
* **Token Whitelisting with Redux Persist:** Integrated `@reduxjs/toolkit` with `redux-persist` to save only the secure JWT token inside `localStorage`.
* **Vite-Compatible Storage Handler:** Overcame Vite's bundle-time CommonJS issues with `redux-persist/lib/storage` by writing a seamless, async-safe `customStorage` object mapping directly to native browser methods.
* **Global Authorization Injection (`setAuthHeader`):** Solved the **401 Unauthorized** error chain upon refreshing the page by centralizing token injection directly inside Axios global defaults.

### 4. ✏️ Inline Live Editing Support (`PATCH` Request)
* **Fluid Inline CRUD Operations:** Expanded the backend API usage beyond simple deletions by tapping into the `PATCH /contacts/{id}` endpoint. Users can now toggle an editing state directly within any card and update a contact's name or phone number seamlessly.
* **Duplicate Entry Guard:** Implemented a case-insensitive, space-trimmed data filter (`toLowerCase` and `trim`) that intercepts form submissions to prevent duplicate contact information.

### 5. ✨ Impeccable UX & Polished Micro-Interactions
* **Bug-Free Confirmation Modal via React Portals:** Built a fully centered delete-confirmation dialog that renders outside the deep component hierarchy (directly under `document.body`) using `createPortal`. It completely bypasses parent CSS overflow issues and supports native `ESC` key listening.
* **Instant Feedbacks (`React Hot Toast`):** Wired up beautiful, reactive notification bubbles for login, logout, account creation, successful CRUD operations, and system alerts using `.unwrap()` thunk chaining.
* **Active Routing State (`NavLink`):** Stylized navigation cues using CSS Modules to visually tint and highlight the active link based on the user's viewport location.

---

## 🛠️ Technology Stack & Dependencies

* **Core Framework:** React (v18+) & Vite (Next-generation lightning-fast build tool)
* **State Management:** Redux Toolkit (`@reduxjs/toolkit`) & `redux-persist`
* **Routing Engine:** React Router DOM (v6+)
* **Form Integrity:** Formik & Yup (Strict client-side schemas for data structures)
* **User Notifications:** React Hot Toast
* **Iconsets:** React Icons (`bs` suite)
* **Style Architecture:** CSS Modules (Scoped, component-isolated styling)
* **Code Quality Assurance:** ESLint (Optimized for flat config structures / `eslint.config.mjs`)

---

## 🚀 Live Environment Refresh Routing Fix (Vercel)

To avoid breaking the application router when users manually refresh the browser under a specific sub-route on production (MERN stack SPA 404 error), I deployed a custom redirection asset (`vercel.json`) at the absolute root of the workspace:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 💻 Local Spin-Up Instructions

Follow these instructions to clone and run the application locally on your machine:

1. Clone the repository into your local space:
   ```bash
   git clone <your-repo-url>
   ```
2. Step inside the workspace directory:
   ```bash
   cd goit-react-hw-08
   ```
3. Install all baseline and architectural dependencies:
   ```bash
   npm install
   ```
4. Run the project under a localized dev server:
   ```bash
   npm run dev
   ```
