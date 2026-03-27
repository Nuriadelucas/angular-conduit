# Component Reference

All components are **standalone** (no NgModules). Change detection is `OnPush` throughout unless noted.

---

## Core / Layout

### `AppComponent`

**File:** `src/app/app.component.ts`
The root shell of the app. Renders the header, the active page via `<router-outlet>`, and the footer. Contains no logic of its own.
**Dependencies:** `HeaderComponent`, `FooterComponent`, `RouterOutlet`

---

### `HeaderComponent`

**File:** `src/app/core/layout/header.component.ts`
The top navigation bar shown on every page. Displays different links based on auth state: unauthenticated users see Sign In/Sign Up; authenticated users see New Article, Settings, and their avatar/username.
**Dependencies:** `UserService`, `RouterLink`, `RouterLinkActive`, `AsyncPipe`, `DefaultImagePipe`

---

### `FooterComponent`

**File:** `src/app/core/layout/footer.component.ts`
Static footer with the Conduit logo, current year copyright, and a link to the RealWorld project.
**Dependencies:** `DatePipe`, `RouterLink`

---

## Authentication

### `AuthComponent`

**File:** `src/app/core/auth/auth.component.ts`
Handles both the Login (`/login`) and Register (`/register`) pages in a single component — it detects which page it's on from the URL and adjusts the form accordingly (adds a username field for registration).
**Dependencies:** `UserService`, `ReactiveFormsModule`, `RouterLink`, `ListErrorsComponent`

---

### `IfAuthenticatedDirective`

**File:** `src/app/core/auth/if-authenticated.directive.ts`
A structural directive (like `*ngIf`) that shows or hides a block of HTML based on login state. Use `*ifAuthenticated="true"` to show content only to logged-in users, `*ifAuthenticated="false"` for logged-out users.
**Dependencies:** `UserService`, `TemplateRef`, `ViewContainerRef`

---

## Article Feature

### `HomeComponent`

**File:** `src/app/features/article/pages/home/home.component.ts`
The main landing page. Shows "Your Feed" and "Global Feed" tabs, a tag-filtered view when a tag is selected, and a popular tags sidebar. Reads the URL to determine which tab/filter is active.
**Dependencies:** `ArticlesService`, `TagsService`, `UserService`, `ArticleListComponent`, `IfAuthenticatedDirective`, `RouterLink`, `NgClass`, `RxLet`

---

### `ArticleListComponent`

**File:** `src/app/features/article/components/article-list.component.ts`
A reusable paginated list of articles. Accepts a config object that controls which articles to fetch (global, feed, by author, by favorites, by tag). Handles its own loading state and pagination.
**Dependencies:** `ArticlesService`, `ArticlePreviewComponent`, `RouterLink`, `NgClass`

---

### `ArticlePreviewComponent`

**File:** `src/app/features/article/components/article-preview.component.ts`
A single article card showing the title, description, author info, date, and favorite count. Clicking the title navigates to the full article.
**Dependencies:** `ArticleMetaComponent`, `FavoriteButtonComponent`, `RouterLink`

---

### `ArticleMetaComponent`

**File:** `src/app/features/article/components/article-meta.component.ts`
The author row shown on article cards and the article detail page: avatar, author name link, and publication date. Includes a `<ng-content>` slot for action buttons (edit/delete/favorite/follow).
**Dependencies:** `RouterLink`, `DatePipe`, `DefaultImagePipe`

---

### `ArticleComponent`

**File:** `src/app/features/article/pages/article/article.component.ts`
The full article detail page. Renders the article body as Markdown, shows the author info with follow/favorite actions, lists comments, and (if the current user is the author) shows edit and delete buttons.
**Dependencies:** `ArticlesService`, `CommentsService`, `UserService`, `ArticleMetaComponent`, `FavoriteButtonComponent`, `FollowButtonComponent`, `ArticleCommentComponent`, `MarkdownPipe`, `IfAuthenticatedDirective`, `ListErrorsComponent`, `FormsModule`, `ReactiveFormsModule`

---

### `EditorComponent`

**File:** `src/app/features/article/pages/editor/editor.component.ts`
The article create/edit form. Used for both `/editor` (new article) and `/editor/:slug` (edit existing). Includes fields for title, description, body (Markdown), and a tag input with removable tag pills.
**Dependencies:** `ArticlesService`, `UserService`, `ReactiveFormsModule`, `ListErrorsComponent`

---

### `ArticleCommentComponent`

**File:** `src/app/features/article/components/article-comment.component.ts`
Renders a single comment card with the author's avatar, name, date, and comment body. Shows a delete button only if the logged-in user is the comment author.
**Dependencies:** `UserService`, `RouterLink`, `DatePipe`, `AsyncPipe`, `DefaultImagePipe`

---

### `FavoriteButtonComponent`

**File:** `src/app/features/article/components/favorite-button.component.ts`
A heart button for favoriting/unfavoriting an article. Checks if the user is logged in before acting — redirects to `/register` if not. Emits the new favorited state to the parent component.
**Dependencies:** `ArticlesService`, `UserService`, `Router`, `NgClass`

---

## Profile Feature

### `ProfileComponent`

**File:** `src/app/features/profile/pages/profile/profile.component.ts`
The public profile page for any user. Shows their avatar, bio, follow button (or "Edit Settings" link if viewing own profile), and tabs for their posts / favorited articles.
**Dependencies:** `ProfileService`, `UserService`, `FollowButtonComponent`, `RouterLink`, `RouterLinkActive`, `RouterOutlet`, `ListErrorsComponent`, `DefaultImagePipe`

---

### `ProfileArticlesComponent`

**File:** `src/app/features/profile/components/profile-articles.component.ts`
The "My Posts" tab on a profile page. Displays a paginated list of all articles written by that user.
**Dependencies:** `ProfileService`, `ArticleListComponent`

---

### `ProfileFavoritesComponent`

**File:** `src/app/features/profile/components/profile-favorites.component.ts`
The "Favorited Posts" tab on a profile page. Displays a paginated list of all articles that user has favorited.
**Dependencies:** `ProfileService`, `ArticleListComponent`

---

### `FollowButtonComponent`

**File:** `src/app/features/profile/components/follow-button.component.ts`
A follow/unfollow toggle button for a user profile. Checks auth before acting — redirects to `/login` if not logged in. Emits the updated profile to the parent when the follow state changes.
**Dependencies:** `ProfileService`, `UserService`, `Router`, `NgClass`

---

## Settings Feature

### `SettingsComponent`

**File:** `src/app/features/settings/settings.component.ts`
The account settings page (`/settings`). Pre-fills the form with the current user's data and allows updating avatar URL, username, bio, email, and password. Also contains the logout button.
**Dependencies:** `UserService`, `ReactiveFormsModule`, `ListErrorsComponent`

---

## Shared

### `ListErrorsComponent`

**File:** `src/app/shared/components/list-errors.component.ts`
Displays a list of error messages from API responses or form validation. Accepts an `Errors` object and renders it as a `<ul>`. Used on every form in the app.
**Dependencies:** none (pure display component)

---

## Shared Pipes

### `DefaultImagePipe`

**File:** `src/app/shared/pipes/default-image.pipe.ts`
Transforms a user image URL: returns the URL if it exists, or `/assets/default-avatar.svg` as a fallback. Used on every avatar `<img>` in the app.

---

### `MarkdownPipe`

**File:** `src/app/shared/pipes/markdown.pipe.ts`
Converts a Markdown string to sanitized HTML. Dynamically imports the `marked` library on first use (keeps bundle small). Used as `[innerHTML]="article.body | markdown | async"` in the article detail page.
**Dependencies:** `marked` (npm package), Angular `DomSanitizer`
