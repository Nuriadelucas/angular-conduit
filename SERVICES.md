# Services Reference

All services are `Injectable({ providedIn: 'root' })` singletons. HTTP requests are automatically processed by the three HTTP interceptors (API base URL, auth token, error normalization) — services work with relative paths only.

---

## JwtService

**File:** `src/app/core/auth/services/jwt.service.ts`

Manages the JWT token in `localStorage`. No HTTP calls.

| Method         | Signature                 | Description                                    |
| -------------- | ------------------------- | ---------------------------------------------- |
| `getToken`     | `() => string \| null`    | Returns the stored JWT or `null` if absent     |
| `saveToken`    | `(token: string) => void` | Writes the token to `localStorage['jwtToken']` |
| `destroyToken` | `() => void`              | Removes the token from `localStorage`          |

---

## UserService

**File:** `src/app/core/auth/services/user.service.ts`

Central auth state machine. Maintains a 4-state model exposed as RxJS Observables.

### Auth States

| State             | Meaning                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| `loading`         | App has just started; token validation in progress                            |
| `authenticated`   | Token validated; `currentUser` is populated                                   |
| `unauthenticated` | No token, or token rejected (4xx)                                             |
| `unavailable`     | Server error (5xx); retries with exponential backoff (2s → 4s → 8s → 16s cap) |

### Properties

| Property          | Type                       | Description                                                      |
| ----------------- | -------------------------- | ---------------------------------------------------------------- |
| `currentUser`     | `Observable<User \| null>` | Emits the logged-in user, or `null`. Emits distinct values only. |
| `isAuthenticated` | `Observable<boolean>`      | Derived from `currentUser`; `true` when a user is set            |
| `authState`       | `Observable<AuthState>`    | The current 4-state machine value                                |

### Methods

| Method                  | HTTP                | Description                                                                                                            |
| ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `login(credentials)`    | `POST /users/login` | Authenticates with email + password. Calls `setAuth()` on success.                                                     |
| `register(credentials)` | `POST /users`       | Creates a new account. Calls `setAuth()` on success.                                                                   |
| `getCurrentUser()`      | `GET /user`         | Validates the stored token. Calls `setAuth()` on success, `purgeAuth()` on 4xx. Returns a `shareReplay(1)` Observable. |
| `update(user)`          | `PUT /user`         | Updates the current user's profile. Calls `setAuth()` with the response.                                               |
| `logout()`              | none                | Calls `purgeAuth()` and navigates to `/`.                                                                              |
| `setAuth(user)`         | none                | Saves the token via `JwtService`, sets `currentUser`, transitions to `authenticated`.                                  |
| `purgeAuth()`           | none                | Destroys the token, sets `currentUser` to `null`, transitions to `unauthenticated`.                                    |
| `getCurrentUserSync()`  | none                | Returns the last emitted `User \| null` synchronously (for template pre-fill).                                         |

### Credentials Payloads

```ts
// login
{ email: string; password: string }

// register
{ username: string; email: string; password: string }

// update
Partial<User> & { password?: string }
```

---

## ArticlesService

**File:** `src/app/features/article/services/articles.service.ts`

CRUD operations for articles, plus favorite/unfavorite.

| Method             | HTTP                                    | Description                                                                                                                                                                                  |
| ------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query(config)`    | `GET /articles` or `GET /articles/feed` | Fetches a paginated list. `config.type === 'feed'` hits the personal feed endpoint. Supports `tag`, `author`, `favorited`, `limit`, `offset` filters. Returns `{ articles, articlesCount }`. |
| `get(slug)`        | `GET /articles/:slug`                   | Fetches a single article by slug. Returns `{ article }`.                                                                                                                                     |
| `create(article)`  | `POST /articles/`                       | Creates a new article. Returns `{ article }`.                                                                                                                                                |
| `update(article)`  | `PUT /articles/:slug`                   | Updates an existing article. `article.slug` is required. Returns `{ article }`.                                                                                                              |
| `delete(slug)`     | `DELETE /articles/:slug`                | Deletes an article. Returns an empty response.                                                                                                                                               |
| `favorite(slug)`   | `POST /articles/:slug/favorite`         | Marks an article as favorited. Returns `{ article }` with updated `favorited` + `favoritesCount`.                                                                                            |
| `unfavorite(slug)` | `DELETE /articles/:slug/favorite`       | Removes a favorite. Returns `{ article }` with updated counts.                                                                                                                               |

### ArticleListConfig

```ts
interface ArticleListConfig {
  type: 'all' | 'feed';
  filters: {
    tag?: string; // filter by tag
    author?: string; // filter by author username
    favorited?: string; // filter by username who favorited
    limit?: number; // default 10
    offset?: number; // default 0
  };
}
```

---

## CommentsService

**File:** `src/app/features/article/services/comments.service.ts`

| Method                    | HTTP                                         | Description                                                                             |
| ------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `getAll(slug)`            | `GET /articles/:slug/comments`               | Returns `{ comments: Comment[] }` for an article.                                       |
| `add(slug, payload)`      | `POST /articles/:slug/comments`              | Creates a comment. `payload` is `{ comment: { body: string } }`. Returns `{ comment }`. |
| `delete(commentId, slug)` | `DELETE /articles/:slug/comments/:commentId` | Deletes a comment by its numeric ID. Returns an empty response.                         |

---

## TagsService

**File:** `src/app/features/article/services/tags.service.ts`

| Method     | HTTP        | Description                                                              |
| ---------- | ----------- | ------------------------------------------------------------------------ |
| `getAll()` | `GET /tags` | Returns `{ tags: string[] }` — the list of popular tags for the sidebar. |

---

## ProfileService

**File:** `src/app/features/profile/services/profile.service.ts`

| Method               | HTTP                                | Description                                                      |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `get(username)`      | `GET /profiles/:username`           | Returns `{ profile: Profile }` for any user.                     |
| `follow(username)`   | `POST /profiles/:username/follow`   | Follows a user. Returns `{ profile }` with `following: true`.    |
| `unfollow(username)` | `DELETE /profiles/:username/follow` | Unfollows a user. Returns `{ profile }` with `following: false`. |

---

## HTTP Interceptors

Interceptors run automatically on every request/response in this order:

### 1. `apiInterceptor`

**File:** `src/app/core/interceptors/api.interceptor.ts`

Prepends `https://api.realworld.show/api` to all relative request URLs. Services use paths like `/users/login`; this interceptor makes them absolute.

### 2. `tokenInterceptor`

**File:** `src/app/core/interceptors/token.interceptor.ts`

Reads the JWT from `JwtService.getToken()`. If a token exists, adds the header:

```
Authorization: Token <jwt>
```

### 3. `errorInterceptor`

**File:** `src/app/core/interceptors/error.interceptor.ts`

Catches all HTTP errors and:

- **401 responses** (except `GET /user`): calls `UserService.purgeAuth()` to log the user out immediately.
- **All errors**: normalizes the response body to `{ errors: { [key: string]: string[] }, status: number }` so components always handle errors in the same shape.

If the server returns a body without an `errors` key, a generic network error is synthesized:

```ts
{
  errors: {
    network: ['Unable to connect. Please check your internet connection.'];
  }
}
```
