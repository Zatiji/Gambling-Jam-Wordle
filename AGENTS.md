# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the React app and shared logic.
- Entry points: `src/main.tsx` (web), `src/main_cli.ts` (CLI build).
- UI: `src/components/`, `src/layout/`, `src/screens/`.
- Game logic and services: `src/logic/`, `src/services/`, `src/data/`, `src/types/`.
- Styles: `src/index.css`.
- Build output goes to `dist/`.

## Build, Test, and Development Commands
- `npm run dev`: start the Vite dev server for the React UI.
- `npm run build`: type-check and build the web app.
- `npm run preview`: serve the production build locally.
- `npm run build:cli`: compile the CLI entry with `tsconfig.cli.json`.
- `npm run start:cli`: build the CLI and run `dist/main_cli.js`.
- `npm run lint`: run ESLint on `.ts` and `.tsx` files.

## Coding Style & Naming Conventions
- Language: TypeScript + React (`.ts`, `.tsx`).
- Indentation: 2 spaces (follow existing files).
- Components: PascalCase filenames (e.g., `src/components/WordGrid.tsx`).
- Hooks/services: camelCase function names; types/interfaces in PascalCase.
- Linting: ESLint via `npm run lint`.

## Testing Guidelines
- No testing framework is configured yet.
- If adding tests, prefer colocated `*.test.ts(x)` or a `tests/` directory and document the new command in this file.

## Commit & Pull Request Guidelines
- Commit messages in history are short and descriptive (e.g., `add index.html : backbone of the UI`).
- Use imperative, concise subjects; add context after `:` when helpful.
- PRs should include: a short summary, manual test steps, and screenshots for UI changes.

## Security & Configuration Tips
- Runtime config lives in `src/data/` (e.g., game config constants).
- Avoid committing secrets; use local environment setup when needed.
