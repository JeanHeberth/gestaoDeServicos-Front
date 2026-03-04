import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CriarUsuarioComponent } from './criar-usuario.component';
import { UsuarioService } from '../services/usuario';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CriarUsuarioComponent', () => {
  let component: CriarUsuarioComponent;
  let fixture: ComponentFixture<CriarUsuarioComponent>;
  let usuarioServiceMock: any;

  beforeEach(async () => {
    usuarioServiceMock = {
      criar: () => of({}),
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, HttpClientTestingModule, CriarUsuarioComponent],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar os campos como vazios', () => {
    expect(component.usuario.nome).toBe('');
    expect(component.usuario.email).toBe('');
    expect(component.usuario.senha).toBe('');
    expect(component.usuario.role).toBe('');
  });

  it('deve limpar inputs preenchidos por autofill nativo', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('[data-testid="email-input"]') as HTMLInputElement;
    const senhaInput = compiled.querySelector('[data-testid="senha-input"]') as HTMLInputElement;

    // simula autofill do navegador: preenche valores diretamente no DOM
    emailInput.value = 'autofill@example.com';
    senhaInput.value = 'autofillpw';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    senhaInput.dispatchEvent(new Event('input', { bubbles: true }));

    // aguardar o setTimeout(clearOnce, 50)
    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();

    // aguardar um tempo suficiente para o polling (max 5s) – usamos 1s para o teste ser rápido
    await new Promise((r) => setTimeout(r, 1000));
    fixture.detectChanges();

    // após limpeza os inputs e o modelo devem estar vazios
    expect((compiled.querySelector('[data-testid="email-input"]') as HTMLInputElement).value).toBe('');
    expect((compiled.querySelector('[data-testid="senha-input"]') as HTMLInputElement).value).toBe('');
    expect(component.usuario.email).toBe('');
    expect(component.usuario.senha).toBe('');
  });
});
