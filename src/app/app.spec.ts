import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should expose the title signal', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;
    // The component exposes a signal `title` whose value should be the app title
    expect(typeof app.title).toBe('function');
    expect(app.title()).toBe('gestaoDeServicos-Front');
  });
});
