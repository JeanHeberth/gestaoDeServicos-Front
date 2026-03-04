import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CriarVeiculoComponent } from './criar-veiculo.component';
import { VeiculoService } from '../services/veiculo.service';
import { ClienteService } from '../services/cliente';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CriarVeiculoComponent', () => {
  let component: CriarVeiculoComponent;
  let fixture: ComponentFixture<CriarVeiculoComponent>;
  let veiculoServiceMock: any;
  let clienteServiceMock: any;

  beforeEach(async () => {
    veiculoServiceMock = {
      criar: vi.fn(() => of({})),
    };

    clienteServiceMock = {
      listar: vi.fn(() => of([
        { id: 'c1', nome: 'Pela', documento: '123', email: 'pela@mail.com', telefone: '11999999999' },
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, HttpClientTestingModule, CriarVeiculoComponent],
      providers: [
        { provide: VeiculoService, useValue: veiculoServiceMock },
        { provide: ClienteService, useValue: clienteServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarVeiculoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar os campos de veículo e carregar clientes', () => {
    expect(component.veiculo.placa).toBe('');
    expect(component.veiculo.marca).toBe('');
    expect(component.veiculo.modelo).toBe('');
    expect(component.veiculo.clienteNome).toBe('');
    expect(component.clientes.length).toBe(1);
    expect(component.clientes[0].nome).toBe('Pela');
  });

  it('deve enviar payload com placa normalizada e clienteNome', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.veiculo = {
      placa: 'aaa-1234',
      marca: 'VW',
      modelo: 'T-cross',
      ano: 2026,
      cor: 'Prata',
      clienteNome: 'Pela',
    };

    component.salvar();

    expect(veiculoServiceMock.criar).toHaveBeenCalledWith({
      placa: 'AAA1234',
      marca: 'VW',
      modelo: 'T-cross',
      ano: 2026,
      cor: 'Prata',
      clienteNome: 'Pela',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/veiculos']);
  });
});
