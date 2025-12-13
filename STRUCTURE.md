# Project Structure Guide 🏗️

This document explains the file organization of Facinet. We use a **Feature-First / Page-Centric** architecture to keep related things together.

## 📂 /app
The Next.js App Router directory. This defines the **routes** (URLs) of the application.
- `page.tsx`: The Homepage route (`/`).
- `layout.tsx`: The global wrapper (contains fonts, analytics, and the ASCII shell).
- `globals.css`: Global styles and Tailwind directives.

## 📂 /components
### `/components/pages`
Contains components specific to a single page.
- `/home`: Homepage sections (`Hero`, `Products`, `Waitlist`, etc.).
- Each folder has an `index.tsx` which allows importing like `@/components/pages/home/hero`.

### `/components/ui`
Shared, reusable UI elements.
- `button.tsx`: Standard buttons.
- `code-window.tsx`: The terminal-like code display block.
- `web-gl-shader.tsx`: The fancy background liquid effect.

## 📂 /lib
Utilities and Data.
- `/lib/data/`: **Content Repository**. Stores text, links, and configuration for the UI.
    - `/home/`: Data for the homepage sections.
- `utils.ts`: Helper functions (like `cn` for Tailwind class merging).

## 📂 /public
Static assets like images, fonts, and icons.

---

### 🧠 Design Philosophy
1.  **Co-location**: Keep the component code near where it is used.
2.  **Separation of Concerns**: UI components handle *rendering*, `lib/data` handles *content*, `app` handles *routing*.
