import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import EditorComponent from './editor.component';
import { ArticlesService } from '../../services/articles.service';
import { UserService } from '../../../../core/auth/services/user.service';
import type { Article } from '../../models/article.model';

const mockArticle: Article = {
  slug: 'test-slug',
  title: 'Test Title',
  description: 'Test desc',
  body: 'Test body',
  tagList: ['angular', 'testing'],
  createdAt: '',
  updatedAt: '',
  favorited: false,
  favoritesCount: 0,
  author: { username: 'testuser', bio: null, image: null, following: false },
};

const mockUser = { username: 'testuser', email: 'test@example.com', token: 'tok', bio: null, image: null };

describe('EditorComponent — new article', () => {
  let fixture: ComponentFixture<EditorComponent>;
  let mockArticlesService: any;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    mockArticlesService = {
      create: vi.fn().mockReturnValue(of(mockArticle)),
      update: vi.fn().mockReturnValue(of(mockArticle)),
      get: vi.fn().mockReturnValue(of(mockArticle)),
    };

    TestBed.configureTestingModule({
      imports: [EditorComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesService, useValue: mockArticlesService },
        {
          provide: UserService,
          useValue: {
            currentUser: of(mockUser),
            authState: of('authenticated'),
            isAuthenticated: of(true),
            getCurrentUser: vi.fn().mockReturnValue(of({ user: mockUser })),
            getCurrentUserSync: vi.fn().mockReturnValue(mockUser),
          },
        },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} }, params: of({}), queryParams: of({}) } },
      ],
    });
    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts with an empty form for a new article', () => {
    expect(fixture.componentInstance.articleForm.get('title')?.value).toBe('');
    expect(fixture.componentInstance.tagList()).toHaveLength(0);
  });

  it('addTag() adds a tag to the list', () => {
    fixture.componentInstance.tagField.setValue('react');
    fixture.componentInstance.addTag();
    expect(fixture.componentInstance.tagList()).toContain('react');
  });

  it('addTag() does not add duplicate tags', () => {
    fixture.componentInstance.tagField.setValue('react');
    fixture.componentInstance.addTag();
    fixture.componentInstance.tagField.setValue('react');
    fixture.componentInstance.addTag();
    expect(fixture.componentInstance.tagList().filter((t: string) => t === 'react')).toHaveLength(1);
  });

  it('removeTag() removes a tag from the list', () => {
    fixture.componentInstance.tagField.setValue('react');
    fixture.componentInstance.addTag();
    fixture.componentInstance.removeTag('react');
    expect(fixture.componentInstance.tagList()).not.toContain('react');
  });

  it('calls articlesService.create on submitForm() for a new article', () => {
    fixture.componentInstance.articleForm.setValue({ title: 'T', description: 'D', body: 'B' });
    fixture.componentInstance.submitForm();
    expect(mockArticlesService.create).toHaveBeenCalled();
  });
});
