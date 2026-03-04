import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { UsuariosComponent } from './usuarios';
import { UsuarioService } from '../services/usuario';
import { ToastService } from '../services/toast';
import { ConfirmService } from '../services/confirm';
import { EditModalService } from '../services/edit-modal';
import { WebSocketService } from '../services/websocket.service';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;

  const usuarioServiceMock: any = {
    listar: vi.fn(() => of([
      { id: 'u1', nome: 'Admin', email: 'admin@mail.com', role: 'ADMINISTRADOR' },
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
      imports: [RouterTestingModule, UsuariosComponent],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: ConfirmService, useValue: confirmServiceMock },
        { provide: EditModalService, useValue: editModalServiceMock },
        { provide: WebSocketService, useValue: websocketServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve carregar e exibir usuários na tabela', () => {
    expect(component.usuarios.length).toBe(1);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Admin');
    expect(compiled.textContent).toContain('admin@mail.com');
  });

  it('deve navegar para criar usuário ao clicar em novoUsuario', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.novoUsuario();

    expect(navigateSpy).toHaveBeenCalledWith(['/criar-usuario']);
  });

  it('deve exibir estado vazio quando não houver usuários', () => {
    usuarioServiceMock.listar.mockReturnValueOnce(of([]));

    component.carregar();
    fixture.detectChanges();

    expect(component.usuarios.length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum usuário cadastrado');
  });

  it('deve definir erro e chamar toast quando falhar ao carregar usuários', () => {
    usuarioServiceMock.listar.mockReturnValueOnce(throwError(() => new Error('falha')));

    component.carregar();

    expect(component.error).toBe('Erro ao carregar usuários.');
    expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao carregar usuários.');
  });

  it('deve editar usuário quando modal retornar dados', async () => {
    editModalServiceMock.open.mockResolvedValueOnce({
      nome: 'Admin Atualizado',
      role: 'USUARIO',
    });

    await component.editar({ id: 'u1', nome: 'Admin', email: 'admin@mail.com', role: 'ADMINISTRADOR' } as any);

    expect(usuarioServiceMock.atualizar).toHaveBeenCalledWith('u1', {
      id: 'u1',
      nome: 'Admin Atualizado',
      email: 'admin@mail.com',
      role: 'USUARIO',
    });
    expect(toastServiceMock.success).toHaveBeenCalledWith('Usuário atualizado com sucesso!');
  });

  it('deve excluir usuário quando confirmado', async () => {
    confirmServiceMock.confirm.mockResolvedValueOnce(true);

    await component.deletar({ id: 'u1', nome: 'Admin', email: 'admin@mail.com', role: 'ADMINISTRADOR' } as any);

    expect(usuarioServiceMock.deletar).toHaveBeenCalledWith('u1');
    expect(toastServiceMock.success).toHaveBeenCalledWith('Usuário excluído com sucesso!');
  });
});
