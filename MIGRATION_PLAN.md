# Migration Plan

This document outlines a recommended approach for migrating the Angular Conduit app to another framework (e.g., React, Vue, or similar).

---

## Guiding Principle

Migrate from the **bottom up**: start with small, isolated pieces that have no dependencies on other app components (leaf nodes), then work toward the bigger page-level components that depend on everything else.

---

## Recommended Migration Order

### Phase 1 — Foundation (no app dependencies)

These are pure utilities with no Angular-specific logic. Migrate first to establish a shared base.

| #   | Item                          | File                                   | Notes                                                                                                                                                      |
| --- | ----------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **API base URL config**       | `core/interceptors/api.interceptor.ts` | A single string `https://api.realworld.show/api`. Becomes a constant or env variable.                                                                      |
| 2   | **Type definitions / models** | `core/models/`, `features/*/models/`   | `User`, `Article`, `Comment`, `Profile`, `ArticleListConfig`, `Errors`, `LoadingState`. Port these as TypeScript interfaces — they are framework-agnostic. |
| 3   | **JWT storage**               | `core/auth/services/jwt.service.ts`    | 3 methods: get/save/destroy token in `localStorage`. Trivially portable as a plain module.                                                                 |
| 4   | **DefaultImage logic**        | `shared/pipes/default-image.pipe.ts`   | A one-liner function: `image ?? '/assets/default-avatar.svg'`. Port as a utility function.                                                                 |
| 5   | **Markdown rendering**        | `shared/pipes/markdown.pipe.ts`        | Calls `marked.parse()` then sanitizes HTML. Port as an async utility function — the `marked` npm package works in any framework.                           |

---

### Phase 2 — HTTP Services (no UI)

These are pure data-fetching modules. Port them next so the rest of the migration has real data to work with.

| #   | Service             | File                                            | Key methods to port                                                                                                                                                       |
| --- | ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | **TagsService**     | `features/article/services/tags.service.ts`     | `getAll()` — one GET request. Simplest service.                                                                                                                           |
| 7   | **CommentsService** | `features/article/services/comments.service.ts` | `getAll()`, `add()`, `delete()`                                                                                                                                           |
| 8   | **ProfileService**  | `features/profile/services/profile.service.ts`  | `get()`, `follow()`, `unfollow()`                                                                                                                                         |
| 9   | **ArticlesService** | `features/article/services/articles.service.ts` | `query()`, `get()`, `create()`, `update()`, `delete()`, `favorite()`, `unfavorite()`                                                                                      |
| 10  | **UserService**     | `core/auth/services/user.service.ts`            | Most complex: manages auth state machine, JWT validation, exponential backoff retry, login/register/logout/update. Port the state logic carefully (see Challenges below). |

**HTTP middleware to port:** The three interceptors become wrapper functions or middleware in the new HTTP layer:

- Prepend the API base URL to every request
- Attach `Authorization: Token <jwt>` header when a token exists
- Normalize all error responses into `{ errors: {...}, status: number }`

---

### Phase 3 — Leaf UI Components (no child components)

These components have no child app-components — they only use HTML and the utilities from Phase 1.

| #   | Component                     | Depends on                                              |
| --- | ----------------------------- | ------------------------------------------------------- |
| 11  | **`ListErrorsComponent`**     | Nothing (pure display)                                  |
| 12  | **`FooterComponent`**         | Nothing (static HTML)                                   |
| 13  | **`ArticleMetaComponent`**    | DefaultImage utility, router link                       |
| 14  | **`ArticleCommentComponent`** | UserService (for delete permission check), DefaultImage |

---

### Phase 4 — Action Button Components

These are small interactive buttons that depend on services but no other components.

| #   | Component                     | Depends on                   |
| --- | ----------------------------- | ---------------------------- |
| 15  | **`FavoriteButtonComponent`** | ArticlesService, UserService |
| 16  | **`FollowButtonComponent`**   | ProfileService, UserService  |

---

### Phase 5 — Compound Components

These compose the leaf components from Phase 3/4.

| #   | Component                       | Depends on                                    |
| --- | ------------------------------- | --------------------------------------------- |
| 17  | **`ArticlePreviewComponent`**   | ArticleMetaComponent, FavoriteButtonComponent |
| 18  | **`ArticleListComponent`**      | ArticlePreviewComponent, ArticlesService      |
| 19  | **`ProfileArticlesComponent`**  | ArticleListComponent, ProfileService          |
| 20  | **`ProfileFavoritesComponent`** | ArticleListComponent, ProfileService          |

---

### Phase 6 — Auth

| #   | Component                            | Notes                                                                                                                                                            |
| --- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21  | **`AuthComponent`** (Login/Register) | Depends on UserService. One component handles both pages — you may want to split it into two in the new framework.                                               |
| 22  | **`IfAuthenticatedDirective`**       | In the new framework this becomes a conditional render: `{isAuthenticated && <Component />}` or equivalent. Not a separate component to port — inline the logic. |

---

### Phase 7 — Page Components

Port these last since they depend on everything above.

| #   | Component               | Major dependencies                                                                                                                                         |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 23  | **`SettingsComponent`** | UserService, ListErrorsComponent                                                                                                                           |
| 24  | **`ProfileComponent`**  | ProfileService, UserService, FollowButtonComponent, ProfileArticlesComponent, ProfileFavoritesComponent                                                    |
| 25  | **`EditorComponent`**   | ArticlesService, UserService, ListErrorsComponent                                                                                                          |
| 26  | **`ArticleComponent`**  | ArticlesService, CommentsService, UserService, ArticleMetaComponent, FavoriteButtonComponent, FollowButtonComponent, ArticleCommentComponent, MarkdownPipe |
| 27  | **`HomeComponent`**     | ArticlesService, TagsService, UserService, ArticleListComponent, IfAuthenticatedDirective                                                                  |

---

### Phase 8 — Routing and App Shell

| #   | Item                            | Notes                                                                                                                                                     |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 28  | **Route definitions**           | Port `app.routes.ts` and `profile.routes.ts` to the new framework's router. Recreate the `requireAuth` guard (redirect to `/login` if not authenticated). |
| 29  | **`HeaderComponent`**           | Depends on UserService and routing. Implement the 4 auth-state variants (loading, unauthenticated, authenticated, unavailable).                           |
| 30  | **`AppComponent` / root shell** | Wire together header, router outlet, and footer. Last step.                                                                                               |

---

## Potential Challenges

### 1. Auth State Machine

`UserService` has a 4-state machine (`loading → authenticated | unauthenticated | unavailable`) with exponential backoff retry for server errors. This is the most complex piece of logic in the app. Plan carefully:

- Map the 4 states to your new framework's state management solution
- Preserve the backoff retry logic (2s → 4s → 8s → 16s → 16s)
- The `initAuth()` bootstrap step (validate token on page load) must run before any protected route renders

### 2. Lazy Loading

Angular lazy-loads every route by default. In the new framework, ensure you set up code-splitting for route components to keep initial load fast.

### 3. CSS / Styling

The app's CSS lives in `realworld/assets/theme/styles.css` (a git submodule). This is shared CSS from the RealWorld project and uses class names from [Conduit's design spec](https://github.com/gothinkster/conduit-bootstrap-template). You can keep using these class names or replace the stylesheet entirely.

### 4. HTTP Interceptors

Angular's interceptor pipeline (API URL prefix → token injection → error normalization) runs automatically on every request. In the new framework, you'll need to replicate this, typically as wrapper functions around `fetch`/`axios` or as middleware/plugins.

### 5. Reactive State (`Observable` vs Signals)

The current app mixes two reactive patterns:

- **RxJS Observables** for HTTP responses and auth state streams
- **Angular Signals** for local component state

In a framework like React, you'll replace both with a single pattern (e.g., `useState` + `useEffect` for local state; React Query / SWR / Zustand for server state).

### 6. The `IfAuthenticatedDirective`

Angular structural directives don't exist in other frameworks. Anywhere `*ifAuthenticated="true/false"` is used, replace it with a conditional render in the new framework (e.g., `{isAuthenticated ? <X /> : null}`).

### 7. `ArticleListComponent` — Config-Based Fetching

This component is reused in 4 different contexts by passing different `config` objects. Make sure your port supports the same flexibility, or consider duplicating into context-specific components.

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
