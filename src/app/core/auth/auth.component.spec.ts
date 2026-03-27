import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { of } from 'rxjs';
import AuthComponent from './auth.component';
import { UserService } from './services/user.service';

const mockUser = { email: 'test@example.com', token: 'tok', username: 'testuser', bio: null, image: null };

function makeRoute(path: string): Partial<ActivatedRoute> {
  return {
    snapshot: {
      url: [new UrlSegment(path, {})],
      params: {},
      queryParams: {},
    } as any,
    url: of([new UrlSegment(path, {})]),
  };
}

describe('AuthComponent — login mode', () => {
  let fixture: ComponentFixture<AuthComponent>;
  let mockUserService: any;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    mockUserService = {
      login: vi.fn().mockReturnValue(of({ user: mockUser })),
      register: vi.fn().mockReturnValue(of({ user: mockUser })),
      currentUser: of(null),
      authState: of('unauthenticated'),
      isAuthenticated: of(false),
    };

    TestBed.configureTestingModule({
      imports: [AuthComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute('login') },
        { provide: UserService, useValue: mockUserService },
      ],
    });
    fixture = TestBed.createComponent(AuthComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets authType to "login"', () => {
    expect(fixture.componentInstance.authType).toBe('login');
  });

  it('sets title to "Sign in" for login route', () => {
    expect(fixture.componentInstance.title).toBe('Sign in');
  });

  it('does NOT add a username control in login mode', () => {
    expect(fixture.componentInstance.authForm.get('username')).toBeNull();
  });

  it('calls userService.login on submitForm()', () => {
    fixture.componentInstance.authForm.setValue({ email: 'a@b.com', password: 'pass' });
    fixture.componentInstance.submitForm();
    expect(mockUserService.login).toHaveBeenCalled();
  });
});

describe('AuthComponent — register mode', () => {
  let fixture: ComponentFixture<AuthComponent>;
  let mockUserService: any;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    mockUserService = {
      login: vi.fn().mockReturnValue(of({ user: mockUser })),
      register: vi.fn().mockReturnValue(of({ user: mockUser })),
      currentUser: of(null),
      authState: of('unauthenticated'),
      isAuthenticated: of(false),
    };

    TestBed.configureTestingModule({
      imports: [AuthComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute('register') },
        { provide: UserService, useValue: mockUserService },
      ],
    });
    fixture = TestBed.createComponent(AuthComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('sets title to "Sign up" for register route', () => {
    expect(fixture.componentInstance.title).toBe('Sign up');
  });

  it('adds a username control in register mode', () => {
    expect(fixture.componentInstance.authForm.get('username')).not.toBeNull();
  });

  it('calls userService.register on submitForm()', () => {
    fixture.componentInstance.authForm.setValue({ email: 'a@b.com', password: 'pass', username: 'user1' });
    fixture.componentInstance.submitForm();
    expect(mockUserService.register).toHaveBeenCalled();
  });
});
