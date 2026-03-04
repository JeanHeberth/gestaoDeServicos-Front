import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { OrdensServicoComponent } from './ordens-servico';
import { OrdemServicoService } from '../services/ordem-servico';
import { ClienteService } from '../services/cliente';
import { ToastService } from '../services/toast';
import { ConfirmService } from '../services/confirm';
import { EditModalService } from '../services/edit-modal';
import { WebSocketService } from '../services/websocket.service';

describe('OrdensServicoComponent', () => {
  let component: OrdensServicoComponent;
  let fixture: ComponentFixture<OrdensServicoComponent>;

  const osServiceMock: any = {
    listar: vi.fn(() => of([
      {
        id: 'os1',
        codigo: 'OS-001',
        descricao: 'Troca de pneu',
        clienteId: 'c1',
        status: 'ABERTA',
        dataAbertura: '2026-03-02T10:00:00Z',
        dataFechamento: null,
      },
    ])),
    atualizar: vi.fn(() => of({})),
    deletar: vi.fn(() => of(void 0)),
  };

  const clienteServiceMock: any = {
    listar: vi.fn(() => of([
      { id: 'c1', nome: 'Pela', documento: '123', email: 'pela@mail.com', telefone: '11999999999' },
    ])),
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

  const websocketServiceMock: any = {
    connect: vi.fn(),
    onMessage: vi.fn(() => of({ type: 'noop' })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, OrdensServicoComponent],
      providers: [
        { provide: OrdemServicoService, useValue: osServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: ConfirmService, useValue: confirmServiceMock },
        { provide: EditModalService, useValue: editModalServiceMock },
        { provide: WebSocketService, useValue: websocketServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdensServicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar ordens e exibir cliente mapeado na tabela', () => {
    expect(component.ordens.length).toBe(1);
    expect(component.clientesMap['c1']).toBe('Pela');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Troca de pneu');
    expect(compiled.textContent).toContain('Pela');
  });

  it('deve navegar para criar OS ao clicar em novaOS', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.novaOS();

    expect(navigateSpy).toHaveBeenCalledWith(['/criar-ordem-servico']);
  });

  it('deve exibir estado vazio quando não houver ordens de serviço', () => {
    osServiceMock.listar.mockReturnValueOnce(of([]));
    clienteServiceMock.listar.mockReturnValueOnce(of([]));

    component.carregar();
    fixture.detectChanges();

    expect(component.ordens.length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhuma ordem de serviço');
  });

  it('deve definir erro quando falhar ao carregar ordens', () => {
    osServiceMock.listar.mockReturnValueOnce(throwError(() => new Error('falha ao carregar ordens')));

    component.carregar();

    expect(component.error).toBe('falha ao carregar ordens');
    expect(component.loading).toBe(false);
  });

  it('deve editar ordem quando modal retornar dados', async () => {
    editModalServiceMock.open.mockResolvedValueOnce({
      descricao: 'Troca de pneu dianteiro',
      status: 'EM_ANDAMENTO',
    });

    await component.editar('os1');

    expect(osServiceMock.atualizar).toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalledWith('OS atualizada com sucesso!');
  });

  it('deve excluir ordem quando confirmado', async () => {
    confirmServiceMock.confirm.mockResolvedValueOnce(true);

    await component.deletar('os1');

    expect(osServiceMock.deletar).toHaveBeenCalledWith('os1');
    expect(toastServiceMock.success).toHaveBeenCalledWith('OS excluída com sucesso!');
  });
});
