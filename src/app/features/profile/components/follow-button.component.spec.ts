import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FollowButtonComponent } from './follow-button.component';
import { ProfileService } from '../services/profile.service';
import { UserService } from '../../../core/auth/services/user.service';
import type { Profile } from '../models/profile.model';

const unfollowedProfile: Profile = { username: 'janedoe', bio: null, image: null, following: false };
const followedProfile: Profile = { username: 'janedoe', bio: null, image: null, following: true };

describe('FollowButtonComponent — not following', () => {
  let fixture: ComponentFixture<FollowButtonComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FollowButtonComponent, RouterTestingModule],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            follow: vi.fn().mockReturnValue(of(followedProfile)),
            unfollow: vi.fn().mockReturnValue(of(unfollowedProfile)),
          },
        },
        {
          provide: UserService,
          useValue: { currentUser: of({ username: 'me' }), isAuthenticated: of(true), authState: of('authenticated') },
        },
      ],
    });
    fixture = TestBed.createComponent(FollowButtonComponent);
    fixture.componentRef.setInput('profile', unfollowedProfile);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows "Follow janedoe" when not following', () => {
    expect(fixture.nativeElement.textContent).toContain('Follow');
    expect(fixture.nativeElement.textContent).toContain('janedoe');
  });

  it('has btn-outline-secondary class when not following', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('btn-outline-secondary');
  });

  it('emits updated profile when follow is toggled', () => {
    const toggleEmit = vi.fn();
    fixture.componentInstance.toggle.subscribe(toggleEmit);
    fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
    expect(toggleEmit).toHaveBeenCalledWith(followedProfile);
  });
});

describe('FollowButtonComponent — following', () => {
  let fixture: ComponentFixture<FollowButtonComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FollowButtonComponent, RouterTestingModule],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            follow: vi.fn().mockReturnValue(of(followedProfile)),
            unfollow: vi.fn().mockReturnValue(of(unfollowedProfile)),
          },
        },
        {
          provide: UserService,
          useValue: { currentUser: of({ username: 'me' }), isAuthenticated: of(true), authState: of('authenticated') },
        },
      ],
    });
    fixture = TestBed.createComponent(FollowButtonComponent);
    fixture.componentRef.setInput('profile', followedProfile);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows "Unfollow janedoe" when following', () => {
    expect(fixture.nativeElement.textContent).toContain('Unfollow');
    expect(fixture.nativeElement.textContent).toContain('janedoe');
  });

  it('has btn-secondary class when following', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('btn-secondary');
  });
});

describe('FollowButtonComponent — unauthenticated', () => {
  let fixture: ComponentFixture<FollowButtonComponent>;
  let router: Router;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FollowButtonComponent, RouterTestingModule],
      providers: [
        { provide: ProfileService, useValue: { follow: vi.fn(), unfollow: vi.fn() } },
        {
          provide: UserService,
          useValue: { currentUser: of(null), isAuthenticated: of(false), authState: of('unauthenticated') },
        },
      ],
    });
    fixture = TestBed.createComponent(FollowButtonComponent);
    fixture.componentRef.setInput('profile', unfollowedProfile);
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('redirects to /login when unauthenticated user clicks follow', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
