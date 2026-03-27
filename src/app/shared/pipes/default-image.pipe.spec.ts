import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { DefaultImagePipe } from './default-image.pipe';

describe('DefaultImagePipe', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  const pipe = new DefaultImagePipe();

  it('returns the image URL when a valid URL is provided', () => {
    expect(pipe.transform('https://example.com/avatar.jpg')).toBe('https://example.com/avatar.jpg');
  });

  it('returns the default avatar when image is null', () => {
    expect(pipe.transform(null)).toBe('/assets/default-avatar.svg');
  });

  it('returns the default avatar when image is undefined', () => {
    expect(pipe.transform(undefined)).toBe('/assets/default-avatar.svg');
  });

  it('returns the default avatar when image is an empty string', () => {
    expect(pipe.transform('')).toBe('/assets/default-avatar.svg');
  });
});
