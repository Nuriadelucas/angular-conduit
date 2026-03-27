import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import HomeComponent from './home.component';
import { TagsService } from '../../services/tags.service';
import { ArticlesService } from '../../services/articles.service';
import { UserService } from '../../../../core/auth/services/user.service';

describe('HomeComponent — global feed (unauthenticated)', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule],
      providers: [
        { provide: TagsService, useValue: { getAll: vi.fn().mockReturnValue(of(['angular', 'react'])) } },
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
            snapshot: { params: {}, queryParams: {} },
            params: of({}),
            queryParams: of({}),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts with global feed config (type: all)', () => {
    expect(fixture.componentInstance.listConfig().type).toBe('all');
  });

  it('isFollowingFeed is false for the global feed', () => {
    expect(fixture.componentInstance.isFollowingFeed()).toBe(false);
  });
});

describe('HomeComponent — following feed redirect when unauthenticated', () => {
  let fixture: ComponentFixture<HomeComponent>;
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
      imports: [HomeComponent, RouterTestingModule],
      providers: [
        { provide: TagsService, useValue: { getAll: vi.fn().mockReturnValue(of([])) } },
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
            snapshot: { params: {}, queryParams: { feed: 'following' } },
            params: of({}),
            queryParams: of({ feed: 'following' }),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(HomeComponent);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('redirects to /login when unauthenticated user requests the following feed', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    // Re-trigger ngOnInit by creating a new fixture
    fixture.componentInstance.ngOnInit();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
