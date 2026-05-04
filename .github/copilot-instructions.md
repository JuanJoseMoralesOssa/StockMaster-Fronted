# Copilot Project Instructions — my-inventory

Apply these rules to all code suggestions in this repository.

---

## 1) Effective Stack Baseline (source of truth)

| Layer | Library | Version |
|---|---|---|
| UI | React | 19 |
| Language | TypeScript | 6 |
| Bundler | Vite | 8 |
| Router | react-router-dom | 7 |
| Styling | Tailwind CSS | 4 |
| Forms | react-hook-form + @hookform/resolvers | 7 / 5 |
| Validation | Zod | 4 |
| Global state | Zustand | 5 |
| HTTP | Axios via service layer | — |
| Charts | Recharts | 3 |
| Tests | Vitest + React Testing Library | 4 |

Do not suggest Next.js App Router patterns (Server Components, Server Actions, file-based routing) — this is a Vite SPA with react-router-dom.

---

## 2) Architecture Rules (non-negotiable)

- This project is configuration-driven for CRUD screens.
- Do not create ad-hoc CRUD pages when the GenericPage pattern applies.
- Canonical flow for CRUD entities:
  1. Type in `src/types/`
  2. Service in `src/services/` extending shared API patterns
  3. Config in `src/config/`
  4. Route wiring in `src/App.tsx`
  5. Nav wiring in `src/constants/NavItems.tsx`

Before changing CRUD behavior, review:
- `src/pages/generic_page/GenericPage.tsx`
- a canonical config such as `src/config/productPageConfig.tsx`

---

## 3) TypeScript and Data Safety

- Strict typing everywhere. No `any` — use `unknown` at external boundaries.
- Prefer explicit DTOs (`CreateXInput`, `UpdateXInput`) over broad `Partial<T>` for service write methods.
- Keep generics in reusable form/hooks APIs when needed.
- Use `satisfies` over type assertions for config objects.
- Branded types for IDs: `type ProductId = string & { readonly __brand: "ProductId" }`.

### Zod v4 patterns

```ts
// Standalone validators — new in v4, prefer over .string().email()
const schema = z.object({
  email: z.email("Ingresa un correo válido"),
  url: z.url("URL inválida").optional(),
  id: z.uuid(),
  name: z.string().min(2, "Mínimo 2 caracteres"),
  amount: z.coerce.number().min(0, "Debe ser mayor a 0"),
})

type FormData = z.infer<typeof schema>
```

---

## 4) React 19 Patterns

- `ref` is now a prop in function components — **never use `forwardRef`**.
- **No manual memoization by default**: avoid `useMemo`, `useCallback`, `React.memo` unless profiling shows a real bottleneck.
- `useId()` for generating stable accessible IDs.

```tsx
// React 19 — ref as a prop (no forwardRef)
function Input({ ref, ...props }: React.ComponentProps<"input">) {
  return <input ref={ref} {...props} />
}

// useOptimistic for immediate UI feedback
function LikeButton({ post }) {
  const [likes, addOptimistic] = useOptimistic(post.likes, (n: number) => n + 1)
  return (
    <button onClick={() => { addOptimistic(); likePost(post.id) }}>
      ♥ {likes}
    </button>
  )
}
```

- Keep components small: one responsibility.
- Lift state only as high as needed.
- `Suspense` + `lazy()` at route level and for heavy components.

---

## 5) React Router v7 Patterns

This project uses **react-router-dom v7 in library mode** (not framework mode).

```tsx
// Route definition with lazy loading
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, lazy: () => import("./pages/Dashboard") },
      {
        path: "products",
        loader: productLoader,  // runs before render
        lazy: () => import("./pages/Products"),
      },
    ],
  },
])

export async function productLoader() {
  return productService.getAll()
}

const products = useLoaderData<typeof productLoader>()

const navigate = useNavigate()
navigate("/products/123", { replace: true })

const { id } = useParams<{ id: string }>()

const [searchParams, setSearchParams] = useSearchParams()
```

- Prefer `loader` for data fetching over `useEffect` + service call.
- Use `useFetcher` for background mutations (no navigation side effects).
- `<Link>` for navigation, `<NavLink>` when active state matters.

---

## 6) Forms — react-hook-form v7 + Zod v4

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.email("Formato inválido: usuario@dominio.com"),
  amount: z.coerce.number().min(0, "Debe ser mayor a 0"),
})

type FormValues = z.infer<typeof schema>

function ProductForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",  // validate on field blur, not on every keystroke
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="name">Nombre *</label>
      <input id="name" {...register("name")} aria-invalid={!!errors.name} />
      {errors.name && <p role="alert">{errors.name.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  )
}
```

- Always `mode: "onBlur"` — never `onChange` (irritating while typing).
- `noValidate` on `<form>` to disable browser-native validation bubbles.
- `aria-invalid` and `role="alert"` on error messages.

---

## 7) Global State — Zustand v5

```ts
import { create } from "zustand"
import { useShallow } from "zustand/shallow"  // moved in v5

interface ProductStore {
  products: Product[]
  isLoading: boolean
  setProducts: (products: Product[]) => void
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  isLoading: false,
  setProducts: (products) => set({ products }),
}))

// useShallow avoids re-renders when selecting multiple fields
const { products, isLoading } = useProductStore(
  useShallow((s) => ({ products: s.products, isLoading: s.isLoading }))
)
```

- Use Zustand for cross-component shared state.
- Prefer local `useState` for component-only state.
- `useShallow` when selecting multiple fields from a store.

---

## 8) UI/UX and Accessibility

- Use semantic HTML (`button` for actions, `a` for navigation). Never `<div onClick>`.
- Every input must have label association (`htmlFor` / `id`).
- Every image: meaningful `alt` (or `alt=""` if decorative) + `width` + `height`.
- Preserve visible focus states — never `outline: none` without replacement.
- Color contrast: 4.5:1 normal text, 3:1 large text / UI components.
- Target size: ≥ 44×44 CSS px for primary interactive elements.
- Use ARIA only when native HTML semantics are insufficient.
- Icons used as the sole content of a button/link must have `aria-label`.

### Cognitive load checklist (apply before completing any UI change)

- [ ] Does the user know what each button does? (descriptive text, not just "OK")
- [ ] Is there at most 1 primary action per section/view?
- [ ] Do error messages say what to do, not only what failed?
- [ ] Is the loading state visible? (skeleton rows or in-button spinner)
- [ ] Does the empty state offer a next action?
- [ ] Are colors used semantically, not decoratively?
- [ ] Does the form validate `onBlur`, not `onChange`?
- [ ] Does each modal do exactly one thing?
- [ ] Does every table handle all 4 states: loading, error, empty, data?

---

## 9) Styling and Design Tokens

- Tailwind utilities are the default. No inline styles.
- Components must consume **semantic tokens**, never primitive color values.
  - ✅ `var(--color-text-primary)` ❌ `var(--color-gray-900)`
  - ✅ `var(--color-action-bg)` ❌ `var(--color-brand-600)`
- Prefer `oklch()` for any custom color values (perceptually uniform).
- Animate only `transform` and `opacity`. Never `width`, `height`, `top`, `left`.
- Always gate animations: `@media (prefers-reduced-motion: no-preference) { ... }`.
- Use logical properties: `margin-inline`, `padding-block`, `inset-inline-start`.
- Use `dvh` / `svh` instead of `vh` on mobile-facing layouts.

Design system source files (philosophy + patterns — read for intent, adapt to installed libs):
- `files/globals.css` — full token set (colors, radius, shadows, z-index, duration, typography scale)
- `files/button.tsx` — Button variant system
- `files/badge.tsx` — Badge for states, categories, counts
- `files/modal.tsx` — Modal patterns (uses Radix Dialog — not installed; adapt to SweetAlert2 or native `<dialog>`)
- `files/form.tsx` — Label, Input, FieldGroup principles
- `files/data-table.tsx` — DataTable with all 4 states + sorting
- `files/feedback.tsx` — Alert, EmptyState, Skeleton
- `files/ARCHITECTURE.md` — component category rules

> `files/` components use `@radix-ui/*`, `class-variance-authority`, `clsx`, and `tailwind-merge` — **none installed**. Use them for design philosophy; adapt to plain Tailwind + installed libraries.

### Component Design Rules

**Button**
- Use `variant` prop (primary, secondary, ghost, danger). No boolean flags (`isDanger`, `isOutlined`).
- One `primary` per page/section.
- `danger` → irreversible actions only, always preceded by a confirmation step.
- In-button `loading` state blocks submit — prevents double submit without extra logic.

**Badge**
- Color only when semantic: `success` = active, `warning` = pending, `danger` = error/expired.
- Max 3–4 distinct badge styles in one table.
- Text must convey meaning without color alone.

**Modal / Dialog**
- Use for: destructive confirmations, quick forms (<5 fields), expanded row detail.
- Do not use for: success messages (→ SweetAlert2 toast), long forms (→ page), non-blocking alerts (→ Banner).
- Title = action name ("Eliminar producto" ✅ — "Advertencia" ❌).
- Footer order: Cancel (left) → Primary action (right).
- One modal, one purpose. No tabs inside a modal.

**DataTable — 4 states are mandatory**
1. Loading → animated skeleton rows (not a centered spinner)
2. Empty → descriptive message + next-action button
3. Error → what failed + how to recover
4. Data → the actual table

Column alignment: text → left | numbers → right | small badges → center | actions → right (last column).

**Feedback hierarchy** (least to most disruptive)
1. Inline field error — inside the form
2. Toast (SweetAlert2) — auto-dismisses
3. Alert/Banner — persists until dismissed
4. Confirmation modal — blocks screen, requires action

Use `Skeleton` over `Spinner` when content has a known shape — reduces perceived load time.

---

## 10) Data/Service Layer Invariants

- Do not call `httpClient` directly from page components.
- Go through service modules in `src/services/`.
- Keep error flow consistent: service → request hook state → UI feedback/toast.
- If an entity has a dedicated store/cache pattern, do not bypass it without justification.

### State decision rule (apply in this order)

| Source of state | Use |
|---|---|
| Server data (lists, details) | Zustand store via `createEntityStore` (5-min TTL) **or** `useApiRequest` for one-off |
| Form fields | `react-hook-form` + `zodResolver`, `mode: "onBlur"` |
| Component-only ephemeral | `useState` |
| Cross-route shared / complex | Zustand store (`useShallow` when picking multiple fields) |
| Many related sub-states (complex filters) | `useReducer` |

- **Never copy server state into local `useState`** — the store already caches it.
- **Never use `useEffect` to sync derived state.** Compute in render or with `useMemo` (only if measurably costly).
- This project does **not** use TanStack Query. Do not import `@tanstack/react-query`.
- This project is **not** organized by `features/`. CRUD pages are configuration-driven via `GenericPage` + `src/config/*PageConfig.tsx`. Do not propose a `features/` folder reorganization.

---

## 11) Security Rules

- Never `dangerouslySetInnerHTML` with user-provided content.
- Validate/sanitize user input at boundaries (Zod).
- Do not add client-side password hashing logic.
- `bcryptjs` in frontend is discouraged; do not introduce new usage.
- Prefer auth with httpOnly cookies; avoid extending token persistence in localStorage.
- Use `rel="noopener noreferrer"` on `target="_blank"` links.

---

## 12) Performance Rules

- Keep Core Web Vitals healthy: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Avoid layout shifts: reserve media/content space with `aspect-ratio` or explicit dimensions.
- Break long event handlers with `scheduler.yield()` or `await Promise.resolve()`.
- Route-level and heavy-component code splitting with `lazy()` + `Suspense`.

---

## 13) Testing Expectations

- Test behavior, not implementation details.
- Prefer RTL queries by role/label/text — never by class or test ID.
- For new logic in hooks/services/components, add or update tests when relevant.
- Priority coverage areas:
  - request/pagination hooks
  - generic page behavior
  - generic form validation
  - store caching behavior

---

## 14) Language and Copy Consistency

- Keep user-facing copy in Spanish unless the user asks otherwise.
- Error messages must explain the next action, not only the failure.

---

## 15) Git and Change Hygiene

- Keep changes atomic and scoped.
- Preserve existing conventions and file organization.
- Do not introduce broad refactors unless requested.

---

## 16) Naming and Code Hygiene

- **Components:** one responsibility per component. Split when a file passes ~150–200 lines.
- **Handlers must name the action**, not the event:
  - ❌ `handleClick`, `onChange`, `submit`
  - ✅ `handleAddProductToStock`, `handleConfirmDeleteExpense`
- **Custom hooks:** intent-revealing names (`useStockAdjustment`, `useProductSearch`, `useDebouncedValue`). Place in `src/hooks/`. Avoid `useData`, `useStuff`.
- **Magic strings/numbers:** if used 2+ times, extract to a constant. For domain values, use `as const` enums:
  ```ts
  export const STOCK_STATUS = { LOW: 'low_stock', OK: 'ok', OUT: 'out' } as const
  ```
  For UI copy in a domain with >5 strings, create `src/constants/<domain>Messages.ts`.
- **Composition over flags:** prefer `<Modal.Footer>{children}</Modal.Footer>` over `<Modal hasFooter footerVariant="...">`.
- **Container vs presentational:** the component that fetches and orchestrates is not the same one that renders the table. Split them.
- **Debounce** all search/filter inputs ≥ 300 ms (`useEffect` + `setTimeout` cleanup, or extract to `useDebouncedValue`).

---

## 17) Anti-patterns — never suggest these

1. ❌ `useEffect` to sync state derived from another `useState`. Compute in render or with `useMemo` instead.
2. ❌ `axios` or `httpClient` imported directly inside a component, page, or hook (must go through a service).
3. ❌ `any` on props, hook generics, service signatures, or API responses. Use `unknown` at boundaries and narrow.
4. ❌ Business logic inside JSX: nested ternaries, inline calculations, type casts mid-render.
5. ❌ Copying server state (from a Zustand store or `useApiRequest`) into a local `useState`.
6. ❌ Manual memoization without a measured bottleneck — React 19 compiler already memoizes.
7. ❌ "God components" that fetch + filter + render table + handle modal + edit. Split.
8. ❌ Magic strings/numbers repeated across files. Extract to `src/constants/`.
9. ❌ Bypassing `GenericPage` for standard CRUDs without written justification.
10. ❌ `dangerouslySetInnerHTML` with user-supplied content.
11. ❌ Class selectors or test IDs in tests when role/label/text would work.
12. ❌ `forwardRef` (use React 19's ref-as-prop instead).

---

## 18) Definition of Done

A change is complete only if:

- TypeScript remains valid for touched code.
- Existing relevant tests pass (or limitations are explicitly reported).
- New behavior has appropriate validation/tests when practical.
- No architecture invariants above were broken.
- Zero new `any`. Zero anti-patterns from §17 in the diff.
