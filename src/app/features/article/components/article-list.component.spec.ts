import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { ArticleListComponent } from './article-list.component';
import { ArticlesService } from '../services/articles.service';
import { UserService } from '../../../core/auth/services/user.service';
import { LoadingState } from '../../../core/models/loading-state.model';
import type { Article } from '../models/article.model';
import type { ArticleListConfig } from '../models/article-list-config.model';

const mockArticle: Article = {
  slug: 'test-article',
  title: 'Test Article',
  description: 'desc',
  body: '',
  tagList: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  favorited: false,
  favoritesCount: 0,
  author: { username: 'janedoe', bio: null, image: null, following: false },
};

const config: ArticleListConfig = { type: 'all', filters: {} };

describe('ArticleListComponent', () => {
  let fixture: ComponentFixture<ArticleListComponent>;
  let articlesService: { query: ReturnType<typeof vi.fn> };

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    articlesService = { query: vi.fn().mockReturnValue(of({ articles: [mockArticle], articlesCount: 1 })) };

    TestBed.configureTestingModule({
      imports: [ArticleListComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesService, useValue: articlesService },
        {
          provide: UserService,
          useValue: { currentUser: of({ username: 'me' }), isAuthenticated: of(true), authState: of('authenticated') },
        },
      ],
    });
    fixture = TestBed.createComponent(ArticleListComponent);
    fixture.componentRef.setInput('limit', 10);
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls articlesService.query when config is set', () => {
    expect(articlesService.query).toHaveBeenCalled();
  });

  it('transitions to LOADED state after query resolves', () => {
    expect(fixture.componentInstance.loading()).toBe(LoadingState.LOADED);
  });

  it('renders articles after loading', () => {
    expect(fixture.componentInstance.results()).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Test Article');
  });

  it('shows "No articles are here" for an empty global feed', () => {
    articlesService.query.mockReturnValue(of({ articles: [], articlesCount: 0 }));
    fixture.componentRef.setInput('config', { type: 'all', filters: {} });
    fixture.componentRef.setInput('isFollowingFeed', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No articles are here');
  });

  it('shows following-feed message for an empty following feed', () => {
    articlesService.query.mockReturnValue(of({ articles: [], articlesCount: 0 }));
    fixture.componentRef.setInput('config', { type: 'feed', filters: {} });
    fixture.componentRef.setInput('isFollowingFeed', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Your feed is empty');
  });
});
