import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import ProfileArticlesComponent from './profile-articles.component';
import { ProfileService } from '../services/profile.service';
import { ArticlesService } from '../../article/services/articles.service';
import { UserService } from '../../../core/auth/services/user.service';
import type { Profile } from '../models/profile.model';

const mockProfile: Profile = { username: 'janedoe', bio: null, image: null, following: false };

describe('ProfileArticlesComponent', () => {
  let fixture: ComponentFixture<ProfileArticlesComponent>;
  let mockProfileService: any;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    mockProfileService = { get: vi.fn().mockReturnValue(of(mockProfile)) };

    TestBed.configureTestingModule({
      imports: [ProfileArticlesComponent, RouterTestingModule],
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
        { provide: ActivatedRoute, useValue: { snapshot: { params: { username: 'janedoe' } }, parent: null } },
      ],
    });
    fixture = TestBed.createComponent(ProfileArticlesComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls profileService.get with the route username on init', () => {
    expect(mockProfileService.get).toHaveBeenCalledWith('janedoe');
  });

  it('sets articlesConfig with author filter after loading profile', () => {
    const config = fixture.componentInstance.articlesConfig();
    expect(config).not.toBeNull();
    expect(config?.filters.author).toBe('janedoe');
  });
});
