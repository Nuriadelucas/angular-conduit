import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';
import { UserService } from '../auth/services/user.service';

describe('HeaderComponent — unauthenticated', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: of(null),
            authState: of('unauthenticated'),
            isAuthenticated: of(false),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders Sign in and Sign up links for unauthenticated users', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sign in');
    expect(text).toContain('Sign up');
  });
});

describe('HeaderComponent — authenticated', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: of({ username: 'testuser', image: null }),
            authState: of('authenticated'),
            isAuthenticated: of(true),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders New Article and Settings links for authenticated users', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('New Article');
    expect(text).toContain('Settings');
  });

  it('renders the username in the nav', () => {
    expect(fixture.nativeElement.textContent).toContain('testuser');
  });
});

describe('HeaderComponent — unavailable', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: of(null),
            authState: of('unavailable'),
            isAuthenticated: of(false),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders Connecting... when auth is unavailable', () => {
    expect(fixture.nativeElement.textContent).toContain('Connecting...');
  });
});
