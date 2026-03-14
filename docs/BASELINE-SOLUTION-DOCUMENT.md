# MCQ Platform – Baseline Solution Document

**Version:** 1.0  
**Date:** March 2025  
**Purpose:** Single source of truth for the current baseline. Use this for onboarding, handover, or to ensure future work does not break existing functionality.

---

## 1. Executive Summary

The MCQ Platform frontend is a Next.js 16 application for IELTS-style practice. The **baseline** is the set of features and behaviours that are stable and must not be broken by future changes. It includes:

- **Reading theater** with passage view and coach flip cards
- **3D flip card** interaction (front text → click → flip → back text; no mirroring)
- **Dark mode** with user toggle, persistence, and theme-aware UI (including cards)
- **Visible Dark/Light mode** button with text and icon in header and on reading theater

All UI that uses theme tokens adapts to light and dark. The baseline is also recorded in `.cursor/rules/baseline.mdc` for AI-assisted development.

---

## 2. Technology Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework   | Next.js 16 (App Router)              |
| Language    | TypeScript                           |
| UI          | React 19, Tailwind CSS v4             |
| Fonts       | Geist, Geist Mono (next/font)        |
| Icons       | Lucide React                         |
| State       | React (useState, context for theme)   |
| Styling     | CSS variables + Tailwind, dark via `.dark` on `<html>` |

---

## 3. Baseline Features (Do Not Break)

### 3.1 Reading Theater

- **Route:** `/practice/theater` (canonical). `/reading/theater` and `/practice/reading/theater` redirect to it.
- **Behaviour:**
  - Left (~70%): Passage content (title + paragraphs) from `passage-001`.
  - Right (~30%): Column of three coach flip cards.
  - Top bar: “Home” link and “Dark mode” / “Light mode” button (header is hidden on this route).
- **Data:** Passage loaded via `loadReadingPassage("passage-001")` from `lib/content/reading.ts`; content from `content/reading/passage-001.json`.

### 3.2 Coach Flip Cards

- **Count:** 3 cards.
- **Required behaviour (must be preserved):**
  1. **Front:** User sees one text (`frontTitle`) and a “Click here and rotate the card” cue (amber box with rotate icon).
  2. **Click:** The whole card flips with a 3D animation (rotate around Y-axis).
  3. **Back:** User sees different text (`backTitle`) and a green “OK” button.
  4. **OK or click again:** Card flips back to front.
  5. **No mirroring:** Text and content on both sides must render right-side up (readable), never mirrored.

- **Implementation:**
  - **Component:** `FlipCoachCard` in `modules/reading/PassageOnlyView.tsx`.
  - **CSS:** `app/globals.css` – `.flip-card`, `.flip-card-inner`, `.flip-card-face`, `.flip-card-back`, `backface-visibility`, and `.flip-card.is-flipped .flip-card-inner { transform: rotateY(180deg); }`.
  - **State:** `is-flipped` class on the card wrapper toggled on click; OK button calls `setFlipped(false)` and `stopPropagation` so the card flips back once.

- **Card styling (theme-aware):**
  - Card surface: `bg-surface`, `border border-border`, so cards adapt to light/dark and stay clearly identifiable.
  - Dark mode: `dark:shadow-none`, `dark:ring-1 dark:ring-border` for clear card outline.
  - “Click here and rotate” box and OK button have light/dark variants so they remain visible and accessible.

- **Data:** Card copy is in the `COACH_CARDS` array in `PassageOnlyView.tsx` (id, frontTitle, backTitle). Content can be edited there; interaction and layout must not break.

### 3.3 Dark Mode

- **Behaviour:**
  - User can switch between light and dark theme.
  - Preference is persisted in `localStorage` under the key `mcq-theme` (values: `"light"` or `"dark"`).
  - If no preference is set, the app follows the system setting (`prefers-color-scheme: dark`).
  - Applying dark mode is done by adding the class `dark` to the `<html>` element; removing it restores light mode.

- **Implementation:**
  - **CSS:** `app/globals.css` – `:root` holds light theme variables; `.dark` holds dark theme variables (e.g. `--bg`, `--surface`, `--text`, `--muted-text`, `--border`, `--primary`, etc.). All theme-aware components use these variables via Tailwind (e.g. `bg-bg`, `text-text`, `bg-surface`, `border-border`).
  - **Tailwind:** `@custom-variant dark (&:where(.dark, .dark *));` so `dark:` utilities apply when `.dark` is present on an ancestor.
  - **Theme provider:** `app/ThemeProvider.tsx` – React context that reads/writes theme, syncs `document.documentElement.classList` and `localStorage`.
  - **No flash:** An inline script in `app/layout.tsx` runs before paint and sets the `dark` class based on `localStorage` and `prefers-color-scheme`, so the correct theme shows on first paint.
  - **Toggles:** Header (`app/AppHeader.tsx`) and reading theater bar (`modules/reading/PassageOnlyView.tsx`) each have a button: icon (Sun/Moon) + label “Light mode” or “Dark mode”, styled as a visible button (border, surface background, padding, focus ring).

- **Dark palette (current):** Black/neutral grays – e.g. `--bg: #0a0a0a`, `--surface: #141414`, `--surface-2: #1f1f1f`, `--text: #fafafa`, `--muted-text: #a3a3a3`, `--border: #262626`. Primary and semantic colors are adjusted for contrast on dark background.

### 3.4 Layout and Navigation

- **Root layout:** `app/layout.tsx` – theme script, `ThemeProvider`, `AppHeader`, and main content area. Main is full width with responsive padding; no max-width constraint that would limit the reading theater.
- **Header:** Shown on all routes except `/practice/theater`. Contains logo/home link, Dark/Light mode button, and (on attempt routes) “Exit quiz” and modal. On the theater route, the header is not rendered; the theater page provides its own top bar (Home + Dark mode button).

---

## 4. Key Files Reference

| Purpose                    | File(s) |
|---------------------------|---------|
| Practice theater page (canonical) | `app/practice/theater/page.tsx` |
| Passage + flip cards UI  | `modules/reading/PassageOnlyView.tsx` |
| Flip card CSS             | `app/globals.css` (`.flip-card*`) |
| Theme variables (light/dark) | `app/globals.css` (`:root`, `.dark`) |
| Dark variant for Tailwind | `app/globals.css` (`@custom-variant dark`) |
| Theme context + persistence | `app/ThemeProvider.tsx` |
| Theme script (no flash)   | `app/layout.tsx` (inline script) |
| Header + Dark mode button | `app/AppHeader.tsx` |
| Baseline rule (AI)        | `.cursor/rules/baseline.mdc` |
| Reading content loader    | `lib/content/reading.ts` |
| Passage data              | `content/reading/passage-001.json` |

---

## 5. What “Do Not Break” Means

- **Flip cards:** Do not remove or alter the 3D flip behaviour, the two-face structure, or the CSS that prevents mirroring. Do not remove the “Click here and rotate” cue or the OK button on the back. Card count (3) and theme-aware styling can only be changed in ways that keep cards clearly identifiable and readable in both themes.
- **Dark mode:** Do not remove the theme toggle, the `ThemeProvider`, the theme script, or the `.dark` variable overrides. New screens and components should use theme tokens (`bg-bg`, `text-text`, `bg-surface`, `border-border`, etc.) so they adapt to light/dark.
- **Reading theater:** Do not remove the route or the two-column layout (passage + cards). The header can stay hidden on this route; the theater top bar (Home + Dark mode) must remain usable.

When adding features (e.g. new routes, new components, or content changes), run a quick check: (1) Open `/practice/theater`, flip each card and click OK. (2) Toggle Dark mode in header and on theater. (3) Confirm cards and text remain readable and non-mirrored in both themes.

---

## 6. Converting This Document to Word

This file is in Markdown (`.md`). To get a Word document (`.docx`):

1. **Open in Word:** In Microsoft Word, use File → Open and select this file. Word can open and render Markdown (Word 2019 and later).
2. **Export from Word:** After opening, use File → Save As and choose “Word Document (.docx)”.
3. **Using Pandoc (command line):** If you have Pandoc installed, run:  
   `pandoc docs/BASELINE-SOLUTION-DOCUMENT.md -o docs/BASELINE-SOLUTION-DOCUMENT.docx`
4. **Online converters:** Use any “Markdown to Word” or “MD to DOCX” converter and upload this file.

---

## 7. Document History

| Version | Date       | Change description        |
|--------|------------|----------------------------|
| 1.0    | March 2025 | Initial baseline document |

---

*End of Baseline Solution Document*
