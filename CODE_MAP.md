# Code Map 🗺️

A quick index to find the most important parts of the codebase.

## 🏠 Homepage
| Section | Component File | Data File |
| :--- | :--- | :--- |
| **Hero** | [components/pages/home/hero/index.tsx](components/pages/home/hero/index.tsx) | [lib/data/home/hero.ts](lib/data/home/hero.ts) |
| **X402 Concept** | [components/pages/home/x402/index.tsx](components/pages/home/x402/index.tsx) | [lib/data/home/x402.ts](lib/data/home/x402.ts) |
| **Comparison** | [components/pages/home/comparison/index.tsx](components/pages/home/comparison/index.tsx) | [lib/data/home/comparison.ts](lib/data/home/comparison.ts) |
| **Facilitators** | [components/pages/home/facilitator/index.tsx](components/pages/home/facilitator/index.tsx) | [lib/data/home/facilitator.ts](lib/data/home/facilitator.ts) |
| **Ways to Use** | [components/pages/home/ways-to-use/index.tsx](components/pages/home/ways-to-use/index.tsx) | [lib/data/home/ways-to-use.ts](lib/data/home/ways-to-use.ts) |
| **Waitlist** | [components/pages/home/waitlist/index.tsx](components/pages/home/waitlist/index.tsx) | *Self-contained* |

## 🎨 Shared UI
| Component | Path | Description |
| :--- | :--- | :--- |
| **ASCII Shell** | [components/ui/hero-ascii-one.tsx](components/ui/hero-ascii-one.tsx) | The global "Terminal" frame |
| **Code Window** | [components/ui/code-window.tsx](components/ui/code-window.tsx) | Reusable code block display |
| **Buttons** | [components/ui/button.tsx](components/ui/button.tsx) | Standard button variants |

## ⚙️ Core
-   **Routes**: `app/`
-   **Global Styles**: `app/globals.css`
-   **Config**: `next.config.mjs`, `tailwind.config.ts`
