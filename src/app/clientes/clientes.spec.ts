import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ClientesComponent } from './clientes';
import { ClienteService } from '../services/cliente';
import { ToastService } from '../services/toast';
import { ConfirmService } from '../services/confirm';
import { EditModalService } from '../services/edit-modal';
import { WebSocketService } from '../services/websocket.service';

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;

  const clienteServiceMock: any = {
    listar: vi.fn(() => of([
      { id: 'c1', nome: 'Pela', documento: '12345678900', email: 'pela@mail.com', telefone: '11999999999' },
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

  const websocketServiceMock: any = {
    connect: vi.fn(),
    onMessage: vi.fn(() => of({ type: 'noop' })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ClientesComponent],
      providers: [
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: ConfirmService, useValue: confirmServiceMock },
        { provide: EditModalService, useValue: editModalServiceMock },
        { provide: WebSocketService, useValue: websocketServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar e exibir clientes na tabela', () => {
    expect(component.clientes.length).toBe(1);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pela');
    expect(compiled.textContent).toContain('12345678900');
  });

  it('deve navegar para criar cliente ao clicar em novoCliente', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.novoCliente();

    expect(navigateSpy).toHaveBeenCalledWith(['/criar-cliente']);
  });

  it('deve exibir estado vazio quando não houver clientes', () => {
    clienteServiceMock.listar.mockReturnValueOnce(of([]));

    component.carregar();
    fixture.detectChanges();

    expect(component.clientes.length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum cliente cadastrado');
  });

  it('deve definir erro e chamar toast quando falhar ao carregar clientes', () => {
    clienteServiceMock.listar.mockReturnValueOnce(throwError(() => new Error('falha')));

    component.carregar();

    expect(component.error).toBe('Erro ao carregar clientes.');
    expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao carregar clientes.');
  });

  it('deve editar cliente quando modal retornar dados', async () => {
    editModalServiceMock.open.mockResolvedValueOnce({
      nome: 'Pela Atualizada',
      email: 'novo@mail.com',
      telefone: '11888888888',
    });

    await component.editar('c1');

    expect(clienteServiceMock.atualizar).toHaveBeenCalledWith('c1', {
      id: 'c1',
      nome: 'Pela Atualizada',
      documento: '12345678900',
      email: 'novo@mail.com',
      telefone: '11888888888',
    });
    expect(toastServiceMock.success).toHaveBeenCalledWith('Cliente atualizado com sucesso!');
  });

  it('deve excluir cliente quando confirmado', async () => {
    confirmServiceMock.confirm.mockResolvedValueOnce(true);

    await component.deletar('c1');

    expect(clienteServiceMock.deletar).toHaveBeenCalledWith('c1');
    expect(toastServiceMock.success).toHaveBeenCalledWith('Cliente excluído com sucesso!');
  });
});
