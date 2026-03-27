import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ArticleCommentComponent } from './article-comment.component';
import { UserService } from '../../../core/auth/services/user.service';
import type { Comment } from '../models/comment.model';

const mockComment: Comment = {
  id: '1',
  body: 'Great article!',
  createdAt: '2024-01-01T00:00:00.000Z',
  author: { username: 'janedoe', bio: null, image: null, following: false },
};

describe('ArticleCommentComponent — non-owner', () => {
  let fixture: ComponentFixture<ArticleCommentComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArticleCommentComponent, RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: of({ username: 'otheruser' }),
            isAuthenticated: of(true),
            authState: of('authenticated'),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ArticleCommentComponent);
    fixture.componentRef.setInput('comment', mockComment);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the comment body', () => {
    expect(fixture.nativeElement.textContent).toContain('Great article!');
  });

  it('renders the author username', () => {
    expect(fixture.nativeElement.textContent).toContain('janedoe');
  });

  it('hides the delete button when user is not the author', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.mod-options'))).toBeNull();
  });
});

describe('ArticleCommentComponent — owner', () => {
  let fixture: ComponentFixture<ArticleCommentComponent>;

  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch {
      /* already initialized */
    }
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ArticleCommentComponent, RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: of({ username: 'janedoe' }),
            isAuthenticated: of(true),
            authState: of('authenticated'),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ArticleCommentComponent);
    fixture.componentRef.setInput('comment', mockComment);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows the delete button when user is the author', () => {
    expect(fixture.debugElement.query(By.css('.mod-options'))).not.toBeNull();
  });

  it('emits delete=true when the trash icon is clicked', () => {
    const deleteEmit = vi.fn();
    fixture.componentInstance.delete.subscribe(deleteEmit);
    fixture.debugElement.query(By.css('.ion-trash-a')).triggerEventHandler('click', null);
    expect(deleteEmit).toHaveBeenCalledWith(true);
  });
});
