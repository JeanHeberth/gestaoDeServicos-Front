import { Directive, ElementRef, AfterViewInit, Renderer2, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[autoFillGuard]',
  standalone: true,
})
export class AutoFillGuardDirective implements AfterViewInit {
  @Output() cleared = new EventEmitter<void>();

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const host = this.el.nativeElement as HTMLElement;
    const form = host.tagName.toLowerCase() === 'form' ? (host as HTMLFormElement) : host.querySelector('form');
    const root = (form || host) as HTMLElement;

    // create honeypots to attract autofill
    try {
      const hpUser = this.renderer.createElement('input') as HTMLInputElement;
      this.renderer.setAttribute(hpUser, 'type', 'text');
      this.renderer.setAttribute(hpUser, 'autocomplete', 'username');
      this.renderer.setAttribute(hpUser, 'aria-hidden', 'true');
      this.renderer.setAttribute(hpUser, 'tabindex', '-1');
      this.renderer.setStyle(hpUser, 'position', 'absolute');
      this.renderer.setStyle(hpUser, 'left', '-9999px');
      this.renderer.setStyle(hpUser, 'opacity', '0');
      this.renderer.appendChild(root, hpUser);

      const hpPass = this.renderer.createElement('input') as HTMLInputElement;
      this.renderer.setAttribute(hpPass, 'type', 'password');
      this.renderer.setAttribute(hpPass, 'autocomplete', 'current-password');
      this.renderer.setAttribute(hpPass, 'aria-hidden', 'true');
      this.renderer.setAttribute(hpPass, 'tabindex', '-1');
      this.renderer.setStyle(hpPass, 'position', 'absolute');
      this.renderer.setStyle(hpPass, 'left', '-9999px');
      this.renderer.setStyle(hpPass, 'opacity', '0');
      this.renderer.appendChild(root, hpPass);
    } catch (e) {
      // ignore
    }

    const inputs = () => Array.from(root.querySelectorAll('input, select, textarea')) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

    const clearInputElement = (inp: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      try {
        if ('value' in inp) {
          (inp as HTMLInputElement).value = '';
        }
        if ('defaultValue' in inp) {
          (inp as HTMLInputElement).defaultValue = '';
        }
        inp.removeAttribute('value');
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        try { inp.blur(); } catch {}
        try { inp.focus(); } catch {}
        try { inp.blur(); } catch {}
        if ((inp as HTMLInputElement).type === 'password') {
          try {
            (inp as HTMLInputElement).type = 'text';
            setTimeout(() => { try { (inp as HTMLInputElement).type = 'password'; } catch {} }, 10);
          } catch {}
        }
      } catch {}
    };

    const doClearOnce = () => {
      inputs().forEach((i) => clearInputElement(i as HTMLInputElement));
      this.cleared.emit();
    };

    // initial clears
    doClearOnce();
    setTimeout(doClearOnce, 50);

    // rAF loop window
    const start = performance.now();
    const maxWindow = 2000;
    const rafClear = () => {
      let any = false;
      inputs().forEach((i) => {
        if ((i as HTMLInputElement).value) { clearInputElement(i as HTMLInputElement); any = true; }
      });
      if (any) this.cleared.emit();
      if (performance.now() - start < maxWindow) requestAnimationFrame(rafClear);
    };
    requestAnimationFrame(rafClear);

    // fallback polling
    const intervalMs = 300;
    const maxTime = 5000;
    let elapsed = 0;
    const id = setInterval(() => {
      let any = false;
      inputs().forEach((i) => { if ((i as HTMLInputElement).value) { clearInputElement(i as HTMLInputElement); any = true; } });
      if (any) this.cleared.emit();
      elapsed += intervalMs;
      if (elapsed >= maxTime) { clearInterval(id); }
    }, intervalMs);
  }
}

