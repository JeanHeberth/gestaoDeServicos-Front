import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CriarOrdemServicoComponent } from './criar-ordem-servico.component';
import { OrdemServicoService } from '../services/ordem-servico';
import { ClienteService } from '../services/cliente';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CriarOrdemServicoComponent', () => {
  let component: CriarOrdemServicoComponent;
  let fixture: ComponentFixture<CriarOrdemServicoComponent>;
  let ordemServiceMock: any;
  let clienteServiceMock: any;

  beforeEach(async () => {
    ordemServiceMock = { criar: () => of({}) };
    clienteServiceMock = { listar: () => of([{ id: 'c1', nome: 'Cliente 1' }]) };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, HttpClientTestingModule, CriarOrdemServicoComponent],
      providers: [
        { provide: OrdemServicoService, useValue: ordemServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarOrdemServicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar os campos como vazios', () => {
    expect(component.ordemServico.descricao).toBe('');
    expect(component.ordemServico.clienteId).toBe('');
    expect(component.ordemServico.status).toBe('ABERTA');
  });

  it('deve limpar inputs preenchidos por autofill nativo', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const descricaoInput = compiled.querySelector('input[type="text"]') as HTMLInputElement;

    descricaoInput.value = 'autofill description';
    descricaoInput.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((r) => setTimeout(r, 60));
    fixture.detectChanges();

    await new Promise((r) => setTimeout(r, 500));
    fixture.detectChanges();

    expect((compiled.querySelector('input[type="text"]') as HTMLInputElement).value).toBe('');
    expect(component.ordemServico.descricao).toBe('');
  });
});
