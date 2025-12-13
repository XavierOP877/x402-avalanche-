# Contributing to Facinet 🤝

We love high-quality code. Here are the rules to keep our codebase clean and professional.

## 1. Code Style
- **Naming**: Use `PascalCase` for Components (`HeroSection`) and `camelCase` for variables/functions (`handleSubmit`).
- **Files**: Use kebab-case for filenames (`hero-section.tsx`).
- **Comments**: Write "Why", not "What".
    - ❌ `// Sets loading to true` (Obvious)
    - ✅ `// Set loading state to disable double-submissions while API is pending` (Helpful)

## 2. Making Changes
1.  **Find the Data**: If you are changing text, go to `lib/data/`.
2.  **Find the Component**: If you are changing layout/CSS, go to `components/pages/`.
3.  **Strict Typing**: Always define interfaces for your Props. Avoid `any`.

## 3. Pull Requests
-   Run `npm run build` locally before pushing to ensure no errors.
-   Describe *what* you changed and *why*.
-   Include screenshots for UI changes.

## 4. Junior Tips
-   Don't be afraid to break things locally! That's how you learn.
-   Use the `CODE_MAP.md` to navigate.
