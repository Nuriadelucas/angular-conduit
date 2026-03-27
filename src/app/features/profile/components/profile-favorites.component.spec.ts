import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import ProfileFavoritesComponent from './profile-favorites.component';
import { ProfileService } from '../services/profile.service';
import { ArticlesService } from '../../article/services/articles.service';
import { UserService } from '../../../core/auth/services/user.service';
import type { Profile } from '../models/profile.model';

const mockProfile: Profile = { username: 'janedoe', bio: null, image: null, following: false };

describe('ProfileFavoritesComponent', () => {
  let fixture: ComponentFixture<ProfileFavoritesComponent>;
  let mockProfileService: any;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    mockProfileService = { get: vi.fn().mockReturnValue(of(mockProfile)) };

    TestBed.configureTestingModule({
      imports: [ProfileFavoritesComponent, RouterTestingModule],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        {
          provide: ArticlesService,
          useValue: { query: vi.fn().mockReturnValue(of({ articles: [], articlesCount: 0 })) },
        },
        {
          provide: UserService,
          useValue: { currentUser: of(null), isAuthenticated: of(false), authState: of('unauthenticated') },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
            parent: { snapshot: { params: { username: 'janedoe' } } },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ProfileFavoritesComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls profileService.get with the parent route username on init', () => {
    expect(mockProfileService.get).toHaveBeenCalledWith('janedoe');
  });

  it('sets favoritesConfig with favorited filter after loading profile', () => {
    const config = fixture.componentInstance.favoritesConfig();
    expect(config).not.toBeNull();
    expect(config?.filters.favorited).toBe('janedoe');
  });
});
