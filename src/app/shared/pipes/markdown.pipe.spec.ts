import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownPipe],
    });
    pipe = TestBed.inject(MarkdownPipe);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('converts a markdown heading to HTML', async () => {
    const result = await pipe.transform('# Hello');
    expect(result).toContain('<h1>Hello</h1>');
  });

  it('converts bold markdown to HTML', async () => {
    const result = await pipe.transform('**bold**');
    expect(result).toContain('<strong>bold</strong>');
  });

  it('wraps a plain paragraph in <p> tags', async () => {
    const result = await pipe.transform('Hello world');
    expect(result).toContain('<p>Hello world</p>');
  });

  it('returns an empty string for empty input', async () => {
    const result = await pipe.transform('');
    expect(result).toBe('');
  });

  it('strips script tags (XSS protection)', async () => {
    const result = await pipe.transform('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
  });

  it('strips onerror attributes (XSS protection)', async () => {
    const result = await pipe.transform('<img onerror="alert(1)" src="x">');
    expect(result).not.toContain('onerror');
  });
});
