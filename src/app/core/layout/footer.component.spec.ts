import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { TestBed, ComponentFixture, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FooterComponent, RouterTestingModule],
    });
    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a <footer> element', () => {
    expect(fixture.nativeElement.querySelector('footer')).not.toBeNull();
  });

  it('renders the current year', () => {
    const year = new Date().getFullYear().toString();
    expect(fixture.nativeElement.textContent).toContain(year);
  });

  it('sets today to a recent timestamp', () => {
    const before = Date.now();
    const newComp = TestBed.createComponent(FooterComponent);
    const after = Date.now();
    expect(newComp.componentInstance.today).toBeGreaterThanOrEqual(before - 100);
    expect(newComp.componentInstance.today).toBeLessThanOrEqual(after + 100);
  });
});
