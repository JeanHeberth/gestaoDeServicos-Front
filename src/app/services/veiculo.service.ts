import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Veiculo {
  placa: string;
  marca: string;
  modelo: string;
  ano?: number;
  cor?: string;
  clienteNome?: string;
}

@Injectable({ providedIn: 'root' })
export class VeiculoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/veiculos';

  listar(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.apiUrl);
  }

  criar(veiculo: Veiculo): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.apiUrl, veiculo);
  }

  atualizar(placa: string, veiculo: Veiculo): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.apiUrl}/${encodeURIComponent(placa)}`, veiculo);
  }

  deletar(placa: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(placa)}`);
  }

  buscarPorPlaca(placa: string): Observable<Veiculo> {
    const params = new HttpParams().set('placa', placa.toUpperCase().replace(/[^A-Z0-9]/g, ''));
    return this.http.get<Veiculo>(this.apiUrl, { params });
  }
}

