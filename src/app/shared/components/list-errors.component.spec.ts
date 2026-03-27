import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { By } from '@angular/platform-browser';
import { ListErrorsComponent } from './list-errors.component';
import type { Errors } from '../../core/models/errors.model';

describe('ListErrorsComponent', () => {
  let fixture: ComponentFixture<ListErrorsComponent>;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListErrorsComponent],
    });
    fixture = TestBed.createComponent(ListErrorsComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows no error items when errors is null', () => {
    fixture.componentRef.setInput('errors', null);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('li'))).toHaveLength(0);
  });

  it('renders one <li> per field (single field)', () => {
    fixture.componentRef.setInput('errors', { errors: { email: 'is invalid' } } as Errors);
    fixture.detectChanges();
    const items = fixture.debugElement.queryAll(By.css('li'));
    expect(items).toHaveLength(1);
    expect(items[0].nativeElement.textContent.trim()).toBe('email is invalid');
  });

  it('renders messages from multiple fields', () => {
    fixture.componentRef.setInput('errors', { errors: { username: 'is taken', password: 'is too short' } } as Errors);
    fixture.detectChanges();
    const items = fixture.debugElement.queryAll(By.css('li'));
    expect(items).toHaveLength(2);
    const texts = items.map((el: any) => el.nativeElement.textContent.trim());
    expect(texts).toContain('username is taken');
    expect(texts).toContain('password is too short');
  });

  it('renders the error list with the correct CSS class', () => {
    fixture.componentRef.setInput('errors', { errors: { title: "can't be blank" } } as Errors);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.error-messages'))).not.toBeNull();
  });

  it('clears the list when errors is set back to null', () => {
    fixture.componentRef.setInput('errors', { errors: { email: 'is invalid' } } as Errors);
    fixture.detectChanges();
    fixture.componentRef.setInput('errors', null);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('li'))).toHaveLength(0);
  });
});
