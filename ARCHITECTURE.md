# Architecture Overview

## What This Application Does

**Conduit** is a blogging platform (think Medium), built as the Angular implementation of the [RealWorld](https://realworld-apps.github.io) demo spec. Users can:

- Browse a global feed of articles and filter by tags
- Register / log in and get a personalized "following" feed
- Write, edit, and delete their own articles (with Markdown support)
- Favorite articles and follow other authors
- Comment on articles
- Edit their profile (bio, avatar, email, password)

The app is a **Single Page Application (SPA)** — it loads once, then navigates between pages without full browser reloads.

---

## Project Structure

```
angular-conduit/
├── src/
│   ├── main.ts               # App entry point — starts Angular
│   ├── index.html            # Root HTML shell (just loads <app-root>)
│   ├── test-setup.ts         # Test initialization
│   └── app/
│       ├── app.component.*   # Root component — renders nav + page + footer
│       ├── app.config.ts     # App-wide setup (routing, HTTP, auth init)
│       ├── app.routes.ts     # URL → page mapping
│       │
│       ├── core/             # Infrastructure used everywhere
│       │   ├── auth/         # Login/register page + auth state
│       │   ├── interceptors/ # HTTP middleware (adds API URL, token, errors)
│       │   ├── layout/       # Header and footer components
│       │   └── models/       # Shared TypeScript interfaces
│       │
│       ├── features/         # Page-level feature modules
│       │   ├── article/      # Home feed, article detail, editor
│       │   ├── profile/      # User profile pages
│       │   └── settings/     # Account settings page
│       │
│       └── shared/           # Reusable helpers
│           ├── components/   # ListErrorsComponent
│           └── pipes/        # defaultImage, markdown
│
├── e2e/                      # End-to-end tests (Playwright)
├── realworld/                # Git submodule — shared CSS theme + test specs
└── CLAUDE.md                 # Dev commands reference
```

### Folder Purposes

| Folder               | Purpose                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `core/auth/`         | Login/register UI, auth state machine, JWT storage                                        |
| `core/interceptors/` | Automatically attach API base URL, auth token, and normalize errors on every HTTP request |
| `core/layout/`       | The persistent top navbar and footer rendered on every page                               |
| `features/article/`  | Everything article-related: home feed, individual article view, create/edit editor        |
| `features/profile/`  | Public user profile with their posts and favorited articles                               |
| `features/settings/` | Logged-in user's own account settings                                                     |
| `shared/`            | Small utilities used across multiple features                                             |

---

## Key Components and Their Responsibilities

### Shell

- **`AppComponent`** — The outermost container. Just renders the header, the current page (via `<router-outlet>`), and the footer. No logic.

### Core

- **`HeaderComponent`** — Top navigation bar. Shows different links depending on auth state: logged-out users see Sign In / Sign Up; logged-in users see New Article, Settings, and their profile link.
- **`FooterComponent`** — Static footer with copyright and external links.
- **`AuthComponent`** — Handles both the Login page (`/login`) and Register page (`/register`). Reuses the same form component with a small tweak (adds the username field for registration).

### Article Feature

- **`HomeComponent`** — The main feed page. Shows "Your Feed" (posts from people you follow) and "Global Feed" tabs, plus a tag filter sidebar.
- **`ArticleListComponent`** — A reusable list that fetches and paginates articles. Used in the home feed and on profile pages.
- **`ArticlePreviewComponent`** — A single article card (title, description, author, date, favorite count).
- **`ArticleComponent`** — The full article detail page: renders body as Markdown, shows comments, follow/favorite buttons.
- **`EditorComponent`** — Create or edit an article. Has fields for title, description, body (Markdown), and tags.
- **`FavoriteButtonComponent`** — The heart button for favoriting/unfavoriting articles. Handles auth check (redirects to register if not logged in).

### Profile Feature

- **`ProfileComponent`** — A user's public profile page: avatar, bio, follow button (if not own profile), and tabs for their posts/favorites.
- **`ProfileArticlesComponent`** — Shows articles written by this user.
- **`ProfileFavoritesComponent`** — Shows articles this user has favorited.
- **`FollowButtonComponent`** — Follow/unfollow button. Handles auth check.

### Settings

- **`SettingsComponent`** — Account settings form: update image URL, username, bio, email, and password. Also has a logout button.

### Shared

- **`ListErrorsComponent`** — Displays a list of validation/API error messages. Used on forms throughout the app.

---

## Routing Structure

All pages are **lazy-loaded** — their code is only downloaded when you first navigate to them.

| URL                            | Page                           | Auth Required?                           |
| ------------------------------ | ------------------------------ | ---------------------------------------- |
| `/`                            | Home feed (global)             | No                                       |
| `/tag/:tag`                    | Home feed filtered by tag      | No                                       |
| `/login`                       | Login page                     | No (redirects away if already logged in) |
| `/register`                    | Register page                  | No (redirects away if already logged in) |
| `/settings`                    | Account settings               | **Yes** (redirects to `/login`)          |
| `/editor`                      | Create new article             | **Yes**                                  |
| `/editor/:slug`                | Edit existing article          | **Yes**                                  |
| `/article/:slug`               | View article                   | No                                       |
| `/profile/:username`           | User profile (their posts)     | No                                       |
| `/profile/:username/favorites` | User profile (their favorites) | No                                       |

**How auth guards work:** The `requireAuth` guard checks if the user is logged in. If not, it redirects to `/login` instead of loading the page.

---

## Services and Data Flow

The app uses **Services** to fetch data and manage state. Here's how data flows:

```
User action (click, form submit)
    │
    ▼
Component method called
    │
    ▼
Service method called
    │
    ▼
HTTP interceptors run automatically:
  1. apiInterceptor   → prepends "https://api.realworld.show/api"
  2. tokenInterceptor → adds "Authorization: Token <jwt>"
  3. errorInterceptor → normalizes error responses
    │
    ▼
Backend API responds
    │
    ▼
Service returns Observable (data stream)
    │
    ▼
Component updates its signals (reactive state)
    │
    ▼
Angular re-renders affected parts of the template
```

### Services

| Service           | Manages                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `UserService`     | Logged-in user state, login/register/logout, token validation, auto-retry on server errors |
| `JwtService`      | Raw read/write/delete of the JWT token in `localStorage`                                   |
| `ArticlesService` | CRUD for articles, favorite/unfavorite                                                     |
| `CommentsService` | Fetch, add, delete comments on an article                                                  |
| `TagsService`     | Fetch popular tags for the sidebar                                                         |
| `ProfileService`  | Fetch any user's public profile, follow/unfollow                                           |

### Auth State Machine

`UserService` maintains one of four states:

```
loading  →  authenticated    (token is valid)
         →  unauthenticated  (no token, or token invalid)
         →  unavailable      (server error — retries with exponential backoff: 2s → 4s → 8s → 16s)
```

---

## API Integration

The app connects to the **RealWorld API** at:

```
https://api.realworld.show/api
```

This is a shared public test backend used by all RealWorld demo apps. The base URL is hardcoded in `core/interceptors/api.interceptor.ts` — there are no environment config files.

### Authentication

- After login/register, the backend returns a **JWT token**
- The token is stored in `localStorage` (via `JwtService`)
- Every subsequent HTTP request automatically includes the header: `Authorization: Token <jwt>`
- On 401 responses (token expired/invalid), the app automatically logs the user out

### Key API Endpoints Used

| What             | Endpoint                                   |
| ---------------- | ------------------------------------------ |
| Login            | `POST /users/login`                        |
| Register         | `POST /users`                              |
| Get own profile  | `GET /user`                                |
| Update settings  | `PUT /user`                                |
| List articles    | `GET /articles`                            |
| Personal feed    | `GET /articles/feed`                       |
| Single article   | `GET /articles/:slug`                      |
| Create article   | `POST /articles/`                          |
| Favorite article | `POST /articles/:slug/favorite`            |
| Comments         | `GET/POST/DELETE /articles/:slug/comments` |
| User profile     | `GET /profiles/:username`                  |
| Follow/unfollow  | `POST/DELETE /profiles/:username/follow`   |
| Tags             | `GET /tags`                                |

---

## Technical Notes

- **Angular 21** with standalone components (no NgModules)
- **Zoneless change detection** — uses Angular Signals instead of Zone.js for reactivity
- **RxJS** for HTTP streams; Signals for local component state
- **Vitest** for unit tests; **Playwright** for end-to-end tests
- The `realworld/` folder is a **git submodule** containing shared CSS styles and test specs
- Markdown is rendered client-side using the `marked` library (lazily imported to keep bundle small)
