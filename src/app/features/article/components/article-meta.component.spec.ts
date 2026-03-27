import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { ArticleMetaComponent } from './article-meta.component';
import type { Article } from '../models/article.model';

const mockArticle: Article = {
  slug: 'test-article',
  title: 'Test Article',
  description: 'A test article',
  body: '# Hello',
  tagList: ['test'],
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  favorited: false,
  favoritesCount: 0,
  author: { username: 'janedoe', bio: null, image: null, following: false },
};

describe('ArticleMetaComponent', () => {
  let fixture: ComponentFixture<ArticleMetaComponent>;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArticleMetaComponent, RouterTestingModule],
    });
    fixture = TestBed.createComponent(ArticleMetaComponent);
    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the author username', () => {
    expect(fixture.nativeElement.textContent).toContain('janedoe');
  });

  it('renders a link to the author profile', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    const profileLinks = links.filter((l: any) => l.nativeElement.getAttribute('href')?.includes('/profile/janedoe'));
    expect(profileLinks.length).toBeGreaterThan(0);
  });

  it('renders the article creation date', () => {
    expect(fixture.nativeElement.textContent).toContain('2024');
  });
});
