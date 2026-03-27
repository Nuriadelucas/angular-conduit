import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FavoriteButtonComponent } from './favorite-button.component';
import { ArticlesService } from '../services/articles.service';
import { UserService } from '../../../core/auth/services/user.service';
import type { Article } from '../models/article.model';

const mockArticle: Article = {
  slug: 'test-article',
  title: 'Test Article',
  description: 'desc',
  body: '',
  tagList: [],
  createdAt: '',
  updatedAt: '',
  favorited: false,
  favoritesCount: 5,
  author: { username: 'janedoe', bio: null, image: null, following: false },
};

describe('FavoriteButtonComponent — not favorited', () => {
  let fixture: ComponentFixture<FavoriteButtonComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FavoriteButtonComponent, RouterTestingModule],
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
    fixture = TestBed.createComponent(FavoriteButtonComponent);
    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has btn-outline-primary class when article is not favorited', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('btn-outline-primary');
  });

  it('emits toggle=true when favoriting an unfavorited article', () => {
    const toggleEmit = vi.fn();
    fixture.componentInstance.toggle.subscribe(toggleEmit);
    fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
    expect(toggleEmit).toHaveBeenCalledWith(true);
  });
});

describe('FavoriteButtonComponent — favorited', () => {
  let fixture: ComponentFixture<FavoriteButtonComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FavoriteButtonComponent, RouterTestingModule],
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
    const favoritedArticle = { ...mockArticle, favorited: true };
    fixture = TestBed.createComponent(FavoriteButtonComponent);
    fixture.componentRef.setInput('article', favoritedArticle);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('has btn-primary class when article is favorited', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('btn-primary');
  });

  it('emits toggle=false when unfavoriting a favorited article', () => {
    const toggleEmit = vi.fn();
    fixture.componentInstance.toggle.subscribe(toggleEmit);
    fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
    expect(toggleEmit).toHaveBeenCalledWith(false);
  });
});

describe('FavoriteButtonComponent — unauthenticated', () => {
  let fixture: ComponentFixture<FavoriteButtonComponent>;
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
      imports: [FavoriteButtonComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesService, useValue: { favorite: vi.fn(), unfavorite: vi.fn() } },
        {
          provide: UserService,
          useValue: { currentUser: of(null), isAuthenticated: of(false), authState: of('unauthenticated') },
        },
      ],
    });
    fixture = TestBed.createComponent(FavoriteButtonComponent);
    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('redirects to /register when unauthenticated user clicks favorite', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
    expect(navigateSpy).toHaveBeenCalledWith(['/register']);
  });
});
