# Testing Guide

The project has two separate test suites:

| Suite            | Tool                                                           | What it tests                     | Config file            |
| ---------------- | -------------------------------------------------------------- | --------------------------------- | ---------------------- |
| Unit tests       | [Vitest](https://vitest.dev) + `@analogjs/vite-plugin-angular` | Individual services in isolation  | `vitest.config.ts`     |
| End-to-end tests | [Playwright](https://playwright.dev)                           | Full user flows in a real browser | `playwright.config.ts` |

---

## Unit Tests

### Running

```bash
bun run test               # Run all unit tests (watch mode)
bun run test:ui            # Open the Vitest browser UI
bun run test:coverage      # Run with V8 coverage report
```

Coverage reports are written to `coverage/` in `text`, `json`, and `html` formats.

### Test Files

Unit tests live alongside the source files they test, named `*.spec.ts`:

```
src/app/core/auth/services/
├── jwt.service.ts
├── jwt.service.spec.ts
├── user.service.ts
└── user.service.spec.ts

src/app/features/article/services/
├── articles.service.ts
├── articles.service.spec.ts
├── comments.service.ts
├── comments.service.spec.ts
├── tags.service.ts
└── tags.service.spec.ts

src/app/features/profile/services/
├── profile.service.ts
└── profile.service.spec.ts
```

### Test Setup

`src/test-setup.ts` is loaded before every test file. `zone.js` and `zone.js/testing` must be imported here (even though the app itself is zoneless) because `@angular/core/testing` still requires them.

### Framework

Tests use the **Vitest** API (`describe`, `it`, `expect`, `beforeEach`, `afterEach`, `vi`) — not Jasmine. Angular's `TestBed` is still used for dependency injection.

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
```

### Writing a Unit Test

#### Service with HTTP calls

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ArticlesService } from './articles.service';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ArticlesService],
    });
    service = TestBed.inject(ArticlesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Fail if any unmatched requests remain
    TestBed.resetTestingModule();
  });

  it('should fetch a single article', () => {
    const slug = 'my-article';
    service.get(slug).subscribe(res => {
      expect(res.data.article.slug).toBe(slug);
    });
    const req = httpMock.expectOne(`/articles/${slug}`);
    expect(req.request.method).toBe('GET');
    req.flush({ article: { slug } });
  });
});
```

#### Service with mocked dependencies

Use `vi.fn()` for dependencies that should not make real calls:

```ts
const jwtService = {
  saveToken: vi.fn(),
  destroyToken: vi.fn(),
  getToken: vi.fn().mockReturnValue('mock-token'),
};

TestBed.configureTestingModule({
  providers: [UserService, { provide: JwtService, useValue: jwtService }],
});
```

#### Testing Observables

Use `firstValueFrom` from RxJS to await a single emission:

```ts
import { firstValueFrom } from 'rxjs';

it('should emit the current user after login', async () => {
  const promise = firstValueFrom(service.login(credentials));
  httpMock.expectOne('/users/login').flush({ user: mockUser });
  await promise;
  const user = await firstValueFrom(service.currentUser);
  expect(user).toEqual(mockUser);
});
```

---

## End-to-End Tests

### Running

The e2e tests require the Angular dev server to be running (or Playwright will start it automatically).

```bash
bun run test:e2e            # Run all non-security tests
bun run test:e2e:security   # Run XSS/security-tagged tests only
bun run test:e2e:ui         # Open the Playwright interactive UI
bun run test:e2e:headed     # Run in a visible browser window
bun run test:e2e:debug      # Attach Playwright Inspector for step-through debugging
bun run test:e2e:report     # Open the last HTML test report
```

### Test Files

E2E tests live in `e2e/`:

| File                        | What it covers                                                       |
| --------------------------- | -------------------------------------------------------------------- |
| `auth.spec.ts`              | Login, registration, invalid credentials, logout                     |
| `articles.spec.ts`          | Create, edit, delete articles; feed filtering; pagination            |
| `comments.spec.ts`          | Add and delete comments; comment author visibility                   |
| `settings.spec.ts`          | Profile updates, password change, logout from settings               |
| `navigation.spec.ts`        | Route guards, redirects, browser back/forward                        |
| `social.spec.ts`            | Follow/unfollow users, favorite/unfavorite articles                  |
| `error-handling.spec.ts`    | Network errors, 422 validation errors displayed correctly            |
| `health.spec.ts`            | App loads, title correct, no console errors on home page             |
| `null-fields.spec.ts`       | Handles `null` bio and image gracefully                              |
| `url-navigation.spec.ts`    | Deep-link to article/profile pages; 404 redirect                     |
| `user-fetch-errors.spec.ts` | Auth init failures (server down, 401) handled correctly              |
| `xss-security.spec.ts`      | Markdown content is sanitized; no script injection (`@security` tag) |

### Helpers

`e2e/helpers/` contains shared utilities (authentication helpers, common selectors). See `e2e/SELECTORS.md` for the full list of data-testid selectors used in tests.

### Configuration

`playwright.config.ts` extends the shared `e2e/playwright.base.ts` config:

- **Base URL:** `http://localhost:4200`
- **Web server:** Starts `npm run start` automatically if the server is not already running
- **Timeout:** 120 seconds for server startup (CI-friendly)
- **Reuse server:** Enabled when not in CI (`reuseExistingServer: !process.env.CI`)

### Writing an E2E Test

```ts
import { test, expect } from '@playwright/test';

test('home page displays article list', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.article-preview')).toHaveCount(10);
});

test('redirects to login when accessing /settings unauthenticated', async ({ page }) => {
  await page.goto('/settings');
  await expect(page).toHaveURL('/login');
});
```

For tests that require a logged-in user, use the auth helpers in `e2e/helpers/` to set a token in `localStorage` before navigation.

---

## What Is and Is Not Tested

| Layer                                               | Tested           | How                                     |
| --------------------------------------------------- | ---------------- | --------------------------------------- |
| Services (HTTP calls, auth state, token management) | Yes              | Unit tests with `HttpTestingController` |
| Components (template rendering, user interactions)  | No               | Not yet — contributions welcome         |
| Pipes (`defaultImage`, `markdown`)                  | No               | Not yet                                 |
| Route guards                                        | Yes (indirectly) | E2E navigation tests                    |
| Full user flows                                     | Yes              | E2E tests                               |
| XSS protection                                      | Yes              | E2E security tests                      |
| Error handling                                      | Yes              | E2E error-handling tests                |
