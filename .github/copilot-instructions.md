#  Project Instructions for GitHub Copilot

We prefer **simple, reliable, and efficient** code over complex, verbose solutions. Please follow these guidelines:

---

##  General Principles

- **Use the simplest approach** that meets requirements. Avoid complex abstractions unless genuinely necessary.
- **Write concise code**; if a function or file grows too large (> ~200 lines or >300 LOC), split it into logical, modular components.
- **Favor readability and maintainability**. Use clear naming, consistent patterns, and comments where helpful.
- **Always check** your suggestions—Copilot is a tool, not the expert—validate logic, edge cases, and performance.

##  Styling & Theming (shadcn/ui)

- Always use **shadcn color variables** (e.g., `--primary`, `--background`, etc.)—do **not** hard‑code hex values.
- Apply classes like `bg-primary text-primary-foreground` for components—do not override unless truly required.
- Ensure light/dark mode support via `.dark { … }` using matching variables.

##  Responsiveness

- All components must be **mobile‑responsive**. Use responsive utility classes: `sm:`, `md:`, etc.
- Layouts should fluidly adapt—for example, grids stack into columns on narrow screens.
- Validate in mobile, tablet, and desktop viewports.

##  Production & Quality

- **Avoid over‑engineering**. If a feature seems complex, break it into multiple well‑scoped tasks or components.
- Use **automated tooling**: linters, formatters, static analysis, and type checks on all PRs.
- In PRs, guide Copilot via comments—point out what needs attention or review, then merge only when all comments are addressed.

---

##  How to Prompt Copilot in Code

Inside code or chat:

```js
//  Goal: Create a responsive button component using shadcn colors.

// 1. Generate a Button component using shadcn:
// ‣ Should use `bg-primary text-primary-foreground`
// ‣ Has padding, rounded corners, hover/focus states

// 2. Make it mobile responsive (size adjusts on sm/md breakpoints)

// 3. If component grows >200 LOC or has multiple responsibilities, split it into logical sub‑components or utils
