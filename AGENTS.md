<!-- BEGIN:nextjs-agent-rules -->


<!-- END:nextjs-agent-rules -->

# Project Frontend Rules

Follow these rules for every UI change. Goal: keep the frontend simple, consistent, and easy to change.

## 1. Reuse before you build
-use daisy ui and tailwind

- **Always check `components/ui` and `components/common` first** before creating any new component. If a suitable component exists, use it. If it is close but not quite right, extend it (add a prop or variant) instead of making a near-duplicate.
- **Any UI you build that could be reused elsewhere** (buttons, cards, modals, inputs, empty states, table wrappers, badges, etc.) goes in `components/ui` (generic primitives) or `components/common` (app-level shared pieces), not inline in a page.
- One-off, page-specific markup can stay in the page's own folder. If it gets used a second time, move it to `ui` or `common`.

## 2. Theme and styling

- **Check `globals.css` for the theme** (colors, spacing, fonts, radius, CSS variables, utility classes) before writing any styles.
- Use existing theme tokens and variables. Do not hardcode colors, font sizes, or spacing values that the theme already defines.
- If a new token is genuinely needed, add it to `globals.css` rather than scattering one-off values across components.

## 3. Forms

- **For any form-related UI, use the `FormWrapper` component.** Do not build form layout, submission handling, or validation wiring from scratch.
- Check how `FormWrapper` is already used in the codebase and follow the same pattern for fields, validation, and submit handling.
- Reuse existing input components from `components/ui` / `components/common` inside the form.
- **Form fields already exist as reusable components** (input, dropdown, searchable dropdown, etc.). Always use them for form fields. Never use raw `<input>`, `<select>`, or `<textarea>` elements, or build a new dropdown or searchable dropdown, when a matching component exists.
- If a needed field type doesn't exist yet (for example date picker, checkbox group, or file upload), check `components/ui` and `components/common` first. If it is truly missing, build it as a reusable component there, following the same props and naming pattern as the existing field components, so it works inside `FormWrapper`.
- If an existing field component is close but missing a feature, extend it with a prop instead of creating a duplicate.

## 4. Minimize frontend churn

- **Use the same names** that already exist: component names, prop names, file names, folder names, CSS classes, and variables. Match the existing naming style rather than introducing new terms for the same concept.
- Do not rename, move, or restructure existing files or components unless the task requires it.
- Keep diffs small and focused. Change only what the task needs.
- Don't touch unrelated code, formatting, or imports.

## 5. Keep it simple and clean

- Prefer the simplest structure that works. No unnecessary abstractions, wrappers, layers, or deeply nested folders.
- Don't add new libraries, state management, or patterns when the existing ones already handle the case.
- Write small, readable components with clear props. Avoid over-engineering for hypothetical future needs.
- Remove dead code and unused imports you introduce.

## 6. Async actions and DB operations with `useAnyAction`

- **Use the existing `useAnyAction` hook (`useAnyAction.ts`) whenever you need to track async or action state** (loading, success, error, etc.) for API calls, form submits, button actions, and similar flows.
- **For database operations, use `run()` from `useAnyAction`.** Most DB operation executions (create, update, delete, fetch-on-action, and similar) should go through `run()` so loading, success, and error handling stay consistent across the app.
- Check how `run()` is already used in the codebase and follow the same pattern. Don't create separate `isLoading` / `isSuccess` / `isError` `useState` variables or manual try/catch wrappers when the hook already covers it.
- Don't write a new custom hook for loading/success/error handling. If the hook is missing something, extend `useAnyAction` instead.

## 7. Write optimized, professional code

Every change should be production quality: efficient, readable, and maintainable.

**Structure and readability**

- Use clear, descriptive names for components, props, variables, and functions. Keep functions and components small and single-purpose.
- Use TypeScript types for props, API responses, and form data. Avoid `any`.
- Follow the existing code style, linting, and formatting rules. Don't leave `console.log`, commented-out code, or unused variables and imports.
- Don't duplicate logic. Extract repeated code into a shared helper, hook, or component.

**Performance**

- Prefer Server Components by default. Add `"use client"` only where interactivity, state, or browser APIs are actually needed, and keep client components as small and low in the tree as possible.
- Use `next/image` for images and `next/link` for navigation.
- Lazy-load heavy or rarely used components with dynamic imports.
- Avoid unnecessary `useEffect`, state, and re-renders. Derive values instead of storing them in state. Use `useMemo`, `useCallback`, and `React.memo` only when there is a real, measurable need, not by default.
- Don't fetch the same data twice. Fetch on the server where possible, and avoid request waterfalls by running independent requests in parallel.
- Don't import whole libraries for one function. Keep bundle size in mind.

**Reliability and UX**

- Handle loading, error, and empty states for every data-driven UI.
- Validate user input and handle failed requests gracefully, with clear messages for the user.
- Keep components accessible: semantic HTML, labels for inputs, alt text, keyboard support, and sufficient contrast.
- Make layouts responsive using the existing theme and breakpoints.

**Security**

- Never hardcode secrets or expose private environment variables to the client.
- Never trust client input. Validate and sanitize on the server too.

## Checklist before finishing a UI task

1. Did I check `components/ui` and `components/common` for an existing component?
2. Did I use theme tokens from `globals.css` instead of hardcoded values?
3. Did I use `FormWrapper` and the existing field components (input, dropdown, searchable dropdown, etc.) for any form?
4. Did I place anything reusable in `ui` or `common`?
5. Did I keep existing names and structure, with a minimal diff?
6. Is the code typed, clean, and free of debug leftovers and unused code?
7. Did I keep client components minimal and avoid unnecessary re-renders and requests?
8. Are loading, error, and empty states handled?
9. Did I use `run()` from `useAnyAction` for DB operations and async actions instead of separate `useState` flags or manual try/catch?
