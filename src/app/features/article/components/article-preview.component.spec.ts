import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ArticlePreviewComponent } from './article-preview.component';
import { ArticlesService } from '../services/articles.service';
import { UserService } from '../../../core/auth/services/user.service';
import type { Article } from '../models/article.model';

const mockArticle: Article = {
  slug: 'test-article',
  title: 'Test Article Title',
  description: 'This is a test description.',
  body: '# Hello',
  tagList: ['angular', 'testing'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  favorited: false,
  favoritesCount: 3,
  author: { username: 'janedoe', bio: null, image: null, following: false },
};

describe('ArticlePreviewComponent', () => {
  let fixture: ComponentFixture<ArticlePreviewComponent>;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArticlePreviewComponent, RouterTestingModule],
      providers: [
        {
          provide: ArticlesService,
          useValue: { favorite: vi.fn().mockReturnValue(of({})), unfavorite: vi.fn().mockReturnValue(of({})) },
        },
        {
          provide: UserService,
          useValue: { currentUser: of({ username: 'me' }), isAuthenticated: of(true), authState: of('authenticated') },
        },
      ],
    });
    fixture = TestBed.createComponent(ArticlePreviewComponent);
    fixture.componentRef.setInput('articleInput', mockArticle);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the article title', () => {
    expect(fixture.nativeElement.textContent).toContain('Test Article Title');
  });

  it('renders the article description', () => {
    expect(fixture.nativeElement.textContent).toContain('This is a test description.');
  });

  it('renders all tags', () => {
    const tags = fixture.debugElement.queryAll(By.css('.tag-default'));
    expect(tags).toHaveLength(2);
    const tagTexts = tags.map((t: any) => t.nativeElement.textContent.trim());
    expect(tagTexts).toContain('angular');
    expect(tagTexts).toContain('testing');
  });

  it('increments favoritesCount when toggleFavorite(true) is called', () => {
    fixture.componentInstance.toggleFavorite(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.article().favoritesCount).toBe(4);
    expect(fixture.componentInstance.article().favorited).toBe(true);
  });

  it('decrements favoritesCount when toggleFavorite(false) is called', () => {
    fixture.componentInstance.toggleFavorite(true);
    fixture.detectChanges();
    fixture.componentInstance.toggleFavorite(false);
    fixture.detectChanges();
    expect(fixture.componentInstance.article().favoritesCount).toBe(3);
    expect(fixture.componentInstance.article().favorited).toBe(false);
  });
});
