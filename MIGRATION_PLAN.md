# Migration Plan

This document outlines a recommended approach for migrating the Angular Conduit app to another framework (e.g., React, Vue, Svelte, or similar).

> **Migration completed.** The React implementation is at [`../react-conduit/`](../react-conduit/). A full retrospective — including the Angular → React concept mapping, key decisions, and challenges — is documented in [`react-conduit/MIGRATION_REPORT.md`](../react-conduit/MIGRATION_REPORT.md).

---

## Guiding Principle

Migrate from the **bottom up**: start with small, isolated pieces that have no dependencies on other app components (leaf nodes), then work toward the bigger page-level components that depend on everything else.

---

## Recommended Migration Order

### Phase 1 — Foundation (no app dependencies)

These are pure utilities with no Angular-specific logic. Migrate first to establish a shared base.

| #   | Item                          | File                                   | Angular-specific to replace        | Notes                                                                                                    |
| --- | ----------------------------- | -------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | **API base URL config**       | `core/interceptors/api.interceptor.ts` | Angular `HttpInterceptorFn`        | Becomes a constant or Axios `baseURL`.                                                                   |
| 2   | **Type definitions / models** | `core/models/`, `features/*/models/`   | None — pure TypeScript             | `User`, `Article`, `Comment`, `Profile`, `ArticleListConfig`, `Errors`, `LoadingState`. Copy as-is.      |
| 3   | **JWT storage**               | `core/auth/services/jwt.service.ts`    | `@Injectable` decorator            | 3 methods: get/save/destroy token in `localStorage`. Rewrite as plain functions.                         |
| 4   | **DefaultImage logic**        | `shared/pipes/default-image.pipe.ts`   | `@Pipe` decorator, `PipeTransform` | Port as a utility function: `defaultImage(image) => image ?? '/assets/default-avatar.svg'`.              |
| 5   | **Markdown rendering**        | `shared/pipes/markdown.pipe.ts`        | `@Pipe`, `DomSanitizer`            | Port as an async utility function using `marked` + `DOMPurify`. The npm packages are framework-agnostic. |

---

### Phase 2 — HTTP Services (no UI)

These are data-fetching classes. Port them next so the rest of the migration has real data. Replace `HttpClient` with `fetch` or Axios and replicate the three interceptors as wrapper functions or middleware.

**Interceptors to port:**

| Angular interceptor                                     | Framework-agnostic equivalent                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| `api.interceptor.ts` — prepends base URL                | Axios `baseURL` or a `fetch` wrapper                              |
| `token.interceptor.ts` — injects JWT header             | Axios request interceptor or custom `fetch` wrapper               |
| `error.interceptor.ts` — normalizes errors, handles 401 | Axios response interceptor or `fetch` wrapper with error handling |

| #   | Service             | File                                            | Angular-specific to replace                                        | Key methods                                                                                                                           |
| --- | ------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | **TagsService**     | `features/article/services/tags.service.ts`     | `@Injectable`, `HttpClient`                                        | `getAll()` — one GET. Simplest.                                                                                                       |
| 7   | **CommentsService** | `features/article/services/comments.service.ts` | `@Injectable`, `HttpClient`                                        | `getAll()`, `add()`, `delete()`                                                                                                       |
| 8   | **ProfileService**  | `features/profile/services/profile.service.ts`  | `@Injectable`, `HttpClient`                                        | `get()`, `follow()`, `unfollow()`                                                                                                     |
| 9   | **ArticlesService** | `features/article/services/articles.service.ts` | `@Injectable`, `HttpClient`                                        | `query()`, `get()`, `create()`, `update()`, `delete()`, `favorite()`, `unfavorite()`                                                  |
| 10  | **UserService**     | `core/auth/services/user.service.ts`            | `@Injectable`, `HttpClient`, RxJS `BehaviorSubject` + `Observable` | Most complex: manages auth state machine, JWT validation, exponential backoff retry. Port the state logic carefully (see Challenges). |

---

### Phase 3 — Leaf UI Components (no child components)

These components have no child app-components — they only use HTML and the utilities from Phase 1.

| #   | Component                     | File                                                       | Angular-specific to replace                                                                                     |
| --- | ----------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 11  | **`ListErrorsComponent`**     | `shared/components/list-errors.component.ts`               | `@Component`, `@Input`, `*ngFor`                                                                                |
| 12  | **`FooterComponent`**         | `core/layout/footer.component.ts`                          | `@Component`, `RouterLink`, `DatePipe`                                                                          |
| 13  | **`ArticleMetaComponent`**    | `features/article/components/article-meta.component.ts`    | `@Component`, `<ng-content>` slot → new framework's slot/children, `DatePipe`, `RouterLink`, `DefaultImagePipe` |
| 14  | **`ArticleCommentComponent`** | `features/article/components/article-comment.component.ts` | `@Component`, `@Input`, `@Output`, `AsyncPipe`, `UserService`, `DefaultImagePipe`                               |

---

### Phase 4 — Action Button Components

Small interactive buttons that depend on services but no other components.

| #   | Component                     | File                                                       | Angular-specific to replace                                                                           |
| --- | ----------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 15  | **`FavoriteButtonComponent`** | `features/article/components/favorite-button.component.ts` | `@Component`, `@Input`, `@Output EventEmitter`, `NgClass`, `ArticlesService`, `UserService`, `Router` |
| 16  | **`FollowButtonComponent`**   | `features/profile/components/follow-button.component.ts`   | `@Component`, `@Input`, `@Output EventEmitter`, `NgClass`, `ProfileService`, `UserService`, `Router`  |

---

### Phase 5 — Compound Components

These compose the leaf components from Phase 3/4.

| #   | Component                       | File                                                         | Angular-specific to replace                                                                                        |
| --- | ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 17  | **`ArticlePreviewComponent`**   | `features/article/components/article-preview.component.ts`   | `@Component`, Angular Signals (`signal()`) → local state, `@Input`                                                 |
| 18  | **`ArticleListComponent`**      | `features/article/components/article-list.component.ts`      | `@Component`, `@Input`, `@Output`, `RxLet`, Angular Signals, `ArticlesService`. See config-object challenge below. |
| 19  | **`ProfileArticlesComponent`**  | `features/profile/components/profile-articles.component.ts`  | `@Component`, `@Input`, `ProfileService`, `ArticleListComponent`                                                   |
| 20  | **`ProfileFavoritesComponent`** | `features/profile/components/profile-favorites.component.ts` | `@Component`, `@Input`, `ProfileService`, `ArticleListComponent`                                                   |

---

### Phase 6 — Auth

| #   | Item                           | File                                      | Angular-specific to replace                                                              | Notes                                                                                                                                                                  |
| --- | ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21  | **`AuthComponent`**            | `core/auth/auth.component.ts`             | `@Component`, `ReactiveFormsModule`, `FormGroup`, `FormControl`, `UserService`, `Router` | One component handles both login and register — you may split into two in the new framework.                                                                           |
| 22  | **`IfAuthenticatedDirective`** | `core/auth/if-authenticated.directive.ts` | `@Directive`, `TemplateRef`, `ViewContainerRef`                                          | Angular structural directives don't exist elsewhere. Replace with a conditional render inline: `{isAuthenticated && <Component />}`. Not a separate component to port. |

---

### Phase 7 — Page Components

Port these last since they depend on everything above.

| #   | Component               | File                                                  | Major dependencies                                                                                                                                                                                     |
| --- | ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 23  | **`SettingsComponent`** | `features/settings/settings.component.ts`             | `UserService`, `ReactiveFormsModule`, `ListErrorsComponent`                                                                                                                                            |
| 24  | **`ProfileComponent`**  | `features/profile/pages/profile/profile.component.ts` | `ProfileService`, `UserService`, `FollowButtonComponent`, `ProfileArticlesComponent`, `ProfileFavoritesComponent`, nested `<router-outlet>`                                                            |
| 25  | **`EditorComponent`**   | `features/article/pages/editor/editor.component.ts`   | `ArticlesService`, `UserService`, `ReactiveFormsModule`, `ListErrorsComponent`                                                                                                                         |
| 26  | **`ArticleComponent`**  | `features/article/pages/article/article.component.ts` | `ArticlesService`, `CommentsService`, `UserService`, `ArticleMetaComponent`, `FavoriteButtonComponent`, `FollowButtonComponent`, `ArticleCommentComponent`, `MarkdownPipe`, `IfAuthenticatedDirective` |
| 27  | **`HomeComponent`**     | `features/article/pages/home/home.component.ts`       | `ArticlesService`, `TagsService`, `UserService`, `ArticleListComponent`, `IfAuthenticatedDirective`, `RxLet`, `ActivatedRoute`                                                                         |

---

### Phase 8 — Routing and App Shell

| #   | Item                            | File                                 | Angular-specific to replace                                                                                             | Notes                                                                                                           |
| --- | ------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 28  | **Route definitions**           | `app.routes.ts`, `profile.routes.ts` | `Routes` array, `loadComponent`, `loadChildren`                                                                         | Port to the new framework's router. Recreate the `requireAuth` guard (redirect to `/login` if unauthenticated). |
| 29  | **`HeaderComponent`**           | `core/layout/header.component.ts`    | `@Component`, `UserService` observables, `RouterLink`, `RouterLinkActive`, `AsyncPipe`, `DefaultImagePipe`              | Implement the 4 auth-state variants (loading, unauthenticated, authenticated, unavailable).                     |
| 30  | **`AppComponent` / root shell** | `app.component.ts`, `app.config.ts`  | `bootstrapApplication`, `provideRouter`, `provideHttpClient`, `provideZonelessChangeDetection`, `provideAppInitializer` | Wire together header, router outlet, and footer. Last step.                                                     |

---

## Potential Challenges

### 1. Auth State Machine

`UserService` has a 4-state machine (`loading → authenticated | unauthenticated | unavailable`) with **exponential backoff retry** (2s → 4s → 8s → 16s cap) for server errors. This is the most complex piece of logic in the app.

- Map the 4 states to your new framework's state management solution
- Preserve the backoff retry logic or decide to simplify it (one attempt + `unavailable` state is acceptable for most use cases)
- The `initAuth()` bootstrap step (validate token on page load via `GET /user`) **must complete before any protected route renders**

### 2. Angular Signals vs Framework Reactivity

The app mixes two reactive patterns:

- **RxJS Observables** — for HTTP responses and auth state streams (`UserService`)
- **Angular Signals** (`signal()`, `computed()`) — for local component state

In the new framework, replace both with a single pattern appropriate to that framework (e.g., `useState` + `useEffect` in React, `ref`/`reactive` in Vue, Svelte stores, etc.).

### 3. `IfAuthenticatedDirective`

Angular structural directives don't exist in other frameworks. Anywhere `*ifAuthenticated="true/false"` is used, replace with an inline conditional render. This is not a separate component to port — just inline the auth check.

### 4. `ArticleListComponent` — Config-Based Fetching

This component is reused in 4 different contexts by passing different `@Input() config: ArticleListConfig` objects. Angular's `OnPush` change detection re-renders only when the input reference changes. Other frameworks may handle object identity differently:

- **React:** A config object recreated on every render causes infinite re-renders. Solution: derive a `configKey` string from the config's primitive values.
- **Vue:** Use `watchEffect` or `watch` with `deep: true` to react to config changes.
- **Svelte:** Use reactive declarations (`$:`) that respond to the config's properties.

### 5. `<ng-content>` Content Projection

`ArticleMetaComponent` uses `<ng-content>` to project action buttons (edit/delete or follow/favorite) into the author row. Port this as:

- **React:** `children` prop or a named render prop
- **Vue:** `<slot>` / named slots
- **Svelte:** `<slot>`

### 6. Lazy Loading

All routes use `loadComponent` / `loadChildren` for automatic code splitting. Ensure the new router supports per-route lazy loading to keep the initial bundle size comparable.

### 7. CSS / Styling

The app's CSS lives in `realworld/assets/theme/styles.css` (a git submodule). This is shared CSS from the RealWorld project and uses class names from [Conduit's design spec](https://github.com/gothinkster/conduit-bootstrap-template). Copy the stylesheet to the new project and keep all existing class names — no CSS changes are needed.

---

## What Does NOT Need to Change

| Item                                            | Reason                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `core/models/*.ts`, `features/*/models/*.ts`    | Pure TypeScript interfaces                                               |
| `core/auth/services/jwt.service.ts` (logic)     | Plain `localStorage` operations — only the `@Injectable` wrapper changes |
| API base URL (`https://api.realworld.show/api`) | Backend is shared and unchanged                                          |
| Service HTTP endpoints and payloads             | The RealWorld API contract is framework-agnostic                         |
| `realworld/assets/theme/styles.css`             | Conduit CSS class names are used as-is                                   |
| `src/assets/` (icons, images)                   | Static assets                                                            |
| `index.html` CDN links                          | Ionicons + Google Fonts are loaded from CDN                              |

---

## Component Dependency Graph

```
AppComponent
├── HeaderComponent          ← UserService
├── RouterOutlet (pages)
│   ├── HomeComponent        ← TagsService, UserService, ArticleListComponent
│   ├── AuthComponent        ← UserService
│   ├── ArticleComponent     ← ArticlesService, CommentsService, UserService
│   │   ├── ArticleMetaComponent
│   │   ├── FavoriteButtonComponent  ← ArticlesService, UserService
│   │   ├── FollowButtonComponent    ← ProfileService, UserService
│   │   └── ArticleCommentComponent  ← UserService
│   ├── EditorComponent      ← ArticlesService, UserService
│   ├── SettingsComponent    ← UserService
│   └── ProfileComponent     ← ProfileService, UserService
│       ├── FollowButtonComponent
│       ├── ProfileArticlesComponent   ← ArticleListComponent
│       └── ProfileFavoritesComponent  ← ArticleListComponent
│           └── ArticleListComponent
│               └── ArticlePreviewComponent
│                   ├── ArticleMetaComponent
│                   └── FavoriteButtonComponent
└── FooterComponent
```

**Shared everywhere:** `ListErrorsComponent`, `DefaultImagePipe`
