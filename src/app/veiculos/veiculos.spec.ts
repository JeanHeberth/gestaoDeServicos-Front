import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { VeiculosComponent } from './veiculos';
import { VeiculoService } from '../services/veiculo.service';
import { ToastService } from '../services/toast';
import { ConfirmService } from '../services/confirm';
import { EditModalService } from '../services/edit-modal';
import { ClienteService } from '../services/cliente';

describe('VeiculosComponent', () => {
  let component: VeiculosComponent;
  let fixture: ComponentFixture<VeiculosComponent>;

  const veiculoServiceMock: any = {
    listar: vi.fn(() => of([
      { placa: 'AAA1234', marca: 'VW', modelo: 'T-cross', ano: 2026, cor: 'Prata', clienteNome: 'Pela' },
    ])),
    atualizar: vi.fn(() => of({})),
    deletar: vi.fn(() => of(void 0)),
  };

  const toastServiceMock: any = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const confirmServiceMock: any = {
    confirm: vi.fn(async () => true),
  };

  const editModalServiceMock: any = {
    open: vi.fn(async () => null),
  };

  const clienteServiceMock: any = {
    listar: vi.fn(() => of([{ id: 'c1', nome: 'Pela', documento: '123', email: 'pela@mail.com', telefone: '11999999999' }])),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, VeiculosComponent],
      providers: [
        { provide: VeiculoService, useValue: veiculoServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: ConfirmService, useValue: confirmServiceMock },
        { provide: EditModalService, useValue: editModalServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VeiculosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar veículos e exibir clienteNome na tabela', () => {
    expect(component.veiculos.length).toBe(1);
    expect(component.veiculos[0].clienteNome).toBe('Pela');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pela');
    expect(compiled.textContent).toContain('AAA1234');
  });

  it('deve navegar para criar veículo ao clicar em novoVeiculo', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.novoVeiculo();

    expect(navigateSpy).toHaveBeenCalledWith(['/criar-veiculo']);
  });

  it('deve exibir estado vazio quando não houver veículos', () => {
    veiculoServiceMock.listar.mockReturnValueOnce(of([]));

    component.carregar();
    fixture.detectChanges();

    expect(component.veiculos.length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum veículo cadastrado');
  });

  it('deve definir erro e chamar toast quando falhar ao carregar veículos', () => {
    veiculoServiceMock.listar.mockReturnValueOnce(throwError(() => new Error('falha')));

    component.carregar();

    expect(component.error).toBe('Erro ao carregar veículos.');
    expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao carregar veículos.');
  });

  it('deve editar veículo quando modal retornar dados', async () => {
    editModalServiceMock.open.mockResolvedValueOnce({
      marca: 'Volkswagen',
      modelo: 'T-Cross Highline',
      clienteNome: 'Pela',
      ano: '2026',
      cor: 'Prata',
    });

    await component.editar({ placa: 'AAA1234', marca: 'VW', modelo: 'T-cross', ano: 2026, cor: 'Prata', clienteNome: 'Pela' });

    expect(veiculoServiceMock.atualizar).toHaveBeenCalledWith('AAA1234', {
      placa: 'AAA1234',
      marca: 'Volkswagen',
      modelo: 'T-Cross Highline',
      clienteNome: 'Pela',
      ano: 2026,
      cor: 'Prata',
    });
    expect(toastServiceMock.success).toHaveBeenCalledWith('Veículo atualizado com sucesso!');
  });

  it('deve excluir veículo quando confirmado', async () => {
    confirmServiceMock.confirm.mockResolvedValueOnce(true);

    await component.deletar('AAA1234');

    expect(veiculoServiceMock.deletar).toHaveBeenCalledWith('AAA1234');
    expect(toastServiceMock.success).toHaveBeenCalledWith('Veículo excluído com sucesso!');
  });
});
