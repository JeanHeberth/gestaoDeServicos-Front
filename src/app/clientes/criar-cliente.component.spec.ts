import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CriarClienteComponent } from './criar-cliente.component';
import { ClienteService } from '../services/cliente';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CriarClienteComponent', () => {
  let component: CriarClienteComponent;
  let fixture: ComponentFixture<CriarClienteComponent>;
  let clienteServiceMock: any;

  beforeEach(async () => {
    clienteServiceMock = {
      criar: () => of({}),
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, HttpClientTestingModule, CriarClienteComponent],
      providers: [
        { provide: ClienteService, useValue: clienteServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar os campos como vazios', () => {
    expect(component.cliente.nome).toBe('');
    expect(component.cliente.email).toBe('');
    expect(component.cliente.documento).toBe('');
    expect(component.cliente.telefone).toBe('');
  });

  it('deve limpar inputs preenchidos por autofill nativo', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('[data-testid="email-input"]') as HTMLInputElement;
    const documentoInput = compiled.querySelector('[data-testid="documento-input"]') as HTMLInputElement;

    emailInput.value = 'autofill@example.com';
    documentoInput.value = '123456';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    documentoInput.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();

    await new Promise((r) => setTimeout(r, 500));
    fixture.detectChanges();

    expect((compiled.querySelector('[data-testid="email-input"]') as HTMLInputElement).value).toBe('');
    expect((compiled.querySelector('[data-testid="documento-input"]') as HTMLInputElement).value).toBe('');
    expect(component.cliente.email).toBe('');
    expect(component.cliente.documento).toBe('');
  });
});
