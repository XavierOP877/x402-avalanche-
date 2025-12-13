# Welcome to Facinet! 🚀

Hello and welcome to the team! This guide is designed to help you get up to speed with the Facinet codebase as quickly as possible. We know diving into a new project can be overwhelming, so we've broken it down for you.

## The Big Picture 🌍

Facinet is a decentralized network infrastructure for **Autonomous Agents**. Think of it as the "Visa/Mastercard network" but for AI bots paying each other.

Key Goals of this website:
1.  **Explain X402**: The protocol we use for payments.
2.  **Attract Facilitators**: People running nodes.
3.  **Onboard Developers**: Integrating our SDK.

## The "Vibe" (Aesthetics) 🎨

You'll notice the site looks very "cyberpunk" or "terminal-like". This is intentional! Use `components/ui/hero-ascii-one.tsx` (the global wrapper) to understand how the "CRT Monitor" effect works.
- **Root Layout using `HeroAsciiWrapper`**: The entire app is wrapped in a fake "terminal window".
- **Monospace Fonts**: We use `Geist Mono` heavily.

## 🏁 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the dev server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 🧭 Where is everything?

We follow a **Page-Centric** project structure.

-   **`components/pages/home/`**: Everything on the homepage is here, separated by section (e.g., `hero`, `products`).
-   **`lib/data/home/`**: All the text/content for the homepage is here. **Don't hardcode text in components!** Use these data files.
-   **`components/ui/`**: Reusable generic buttons, cards, and cool effects.

## 💡 "Why did they do that?"

-   *Why `gsap`?* We use GSAP for complex animations because it performs better than CSS animations for sequences.
-   *Why `data.ts` files?* To separate "Content" from "Code". Marketing can change text without breaking the React logic.

## Need help? 🆘

Check `CODE_MAP.md` to quickly find the file you need, or `STRUCTURE.md` to understand deeper architecture.

Happy coding!
