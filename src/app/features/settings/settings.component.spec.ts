import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import SettingsComponent from './settings.component';
import { UserService } from '../../core/auth/services/user.service';

const mockUser = {
  email: 'test@example.com',
  token: 'valid-token',
  username: 'testuser',
  bio: 'My bio',
  image: 'https://example.com/avatar.jpg',
};

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let mockUserService: any;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    mockUserService = {
      getCurrentUserSync: vi.fn().mockReturnValue(mockUser),
      update: vi.fn().mockReturnValue(of({ user: mockUser })),
      logout: vi.fn(),
      currentUser: of(mockUser),
      authState: of('authenticated'),
      isAuthenticated: of(true),
    };

    TestBed.configureTestingModule({
      imports: [SettingsComponent, RouterTestingModule],
      providers: [{ provide: UserService, useValue: mockUserService }],
    });
    fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('pre-fills the form with the current user data on init', () => {
    const form = fixture.componentInstance.settingsForm;
    expect(form.get('email')?.value).toBe('test@example.com');
    expect(form.get('username')?.value).toBe('testuser');
    expect(form.get('bio')?.value).toBe('My bio');
    expect(form.get('image')?.value).toBe('https://example.com/avatar.jpg');
  });

  it('calls userService.logout when logout() is invoked', () => {
    fixture.componentInstance.logout();
    expect(mockUserService.logout).toHaveBeenCalled();
  });

  it('calls userService.update with form values when submitForm() is invoked', () => {
    fixture.componentInstance.submitForm();
    expect(mockUserService.update).toHaveBeenCalled();
  });
});
