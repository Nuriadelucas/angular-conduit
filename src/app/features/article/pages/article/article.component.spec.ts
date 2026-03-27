import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import ArticleComponent from './article.component';
import { ArticlesService } from '../../services/articles.service';
import { CommentsService } from '../../services/comments.service';
import { UserService } from '../../../../core/auth/services/user.service';
import type { Article } from '../../models/article.model';
import type { Comment } from '../../models/comment.model';

const mockProfile = { username: 'janedoe', bio: null, image: null, following: false };
const mockArticle: Article = {
  slug: 'test-slug',
  title: 'Test Article',
  description: 'desc',
  body: '# Hello',
  tagList: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  favorited: false,
  favoritesCount: 0,
  author: mockProfile,
};
const mockComment: Comment = { id: '1', body: 'Nice!', createdAt: '2024-01-01T00:00:00.000Z', author: mockProfile };
const mockUser = { username: 'me', email: 'me@example.com', token: 'tok', bio: null, image: null };

describe('ArticleComponent', () => {
  let fixture: ComponentFixture<ArticleComponent>;
  let mockArticlesService: any;
  let mockCommentsService: any;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    mockArticlesService = {
      get: vi.fn().mockReturnValue(of(mockArticle)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      favorite: vi.fn().mockReturnValue(of({ ...mockArticle, favorited: true })),
      unfavorite: vi.fn().mockReturnValue(of(undefined)),
    };
    mockCommentsService = {
      getAll: vi.fn().mockReturnValue(of([mockComment])),
      add: vi.fn().mockReturnValue(of(mockComment)),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      imports: [ArticleComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesService, useValue: mockArticlesService },
        { provide: CommentsService, useValue: mockCommentsService },
        {
          provide: UserService,
          useValue: {
            currentUser: of(mockUser),
            isAuthenticated: of(true),
            authState: of('authenticated'),
            getCurrentUserSync: () => mockUser,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { slug: 'test-slug' } },
            params: of({ slug: 'test-slug' }),
            queryParams: of({}),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ArticleComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads the article on init', () => {
    expect(mockArticlesService.get).toHaveBeenCalledWith('test-slug');
    expect(fixture.componentInstance.article()).toEqual(mockArticle);
  });

  it('loads comments on init', () => {
    expect(mockCommentsService.getAll).toHaveBeenCalledWith('test-slug');
    expect(fixture.componentInstance.comments()).toHaveLength(1);
  });

  it('onToggleFavorite(true) increments favoritesCount', () => {
    fixture.componentInstance.onToggleFavorite(true);
    expect(fixture.componentInstance.article()?.favoritesCount).toBe(1);
    expect(fixture.componentInstance.article()?.favorited).toBe(true);
  });

  it('onToggleFavorite(false) decrements favoritesCount', () => {
    fixture.componentInstance.onToggleFavorite(true);
    fixture.componentInstance.onToggleFavorite(false);
    expect(fixture.componentInstance.article()?.favoritesCount).toBe(0);
  });
});
