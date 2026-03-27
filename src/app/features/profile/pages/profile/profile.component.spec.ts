import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../services/profile.service';
import { UserService } from '../../../../core/auth/services/user.service';
import type { Profile } from '../../models/profile.model';

const mockProfile: Profile = { username: 'janedoe', bio: 'Hello', image: null, following: false };
const mockUser = { username: 'me', email: 'me@example.com', token: 'tok', bio: null, image: null };

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let mockProfileService: any;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    mockProfileService = { get: vi.fn().mockReturnValue(of(mockProfile)), follow: vi.fn(), unfollow: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ProfileComponent, RouterTestingModule],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        {
          provide: UserService,
          useValue: { currentUser: of(mockUser), isAuthenticated: of(true), authState: of('authenticated') },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { username: 'janedoe' } },
            params: of({ username: 'janedoe' }),
            queryParams: of({}),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads the profile on init', () => {
    expect(mockProfileService.get).toHaveBeenCalledWith('janedoe');
    expect(fixture.componentInstance.profile()).toEqual(mockProfile);
  });

  it("isUser is false when viewing another user's profile", () => {
    // mockUser.username ('me') !== profile.username ('janedoe')
    expect(fixture.componentInstance.isUser()).toBe(false);
  });

  it('onToggleFollowing updates the profile signal', () => {
    const updatedProfile: Profile = { ...mockProfile, following: true };
    fixture.componentInstance.onToggleFollowing(updatedProfile);
    expect(fixture.componentInstance.profile()).toEqual(updatedProfile);
  });
});

describe('ProfileComponent — own profile', () => {
  let fixture: ComponentFixture<ProfileComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProfileComponent, RouterTestingModule],
      providers: [
        {
          provide: ProfileService,
          useValue: { get: vi.fn().mockReturnValue(of(mockProfile)), follow: vi.fn(), unfollow: vi.fn() },
        },
        {
          provide: UserService,
          // Same username as mockProfile — viewing own profile
          useValue: {
            currentUser: of({ ...mockUser, username: 'janedoe' }),
            isAuthenticated: of(true),
            authState: of('authenticated'),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { username: 'janedoe' } },
            params: of({ username: 'janedoe' }),
            queryParams: of({}),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('isUser is true when viewing own profile', () => {
    expect(fixture.componentInstance.isUser()).toBe(true);
  });
});
