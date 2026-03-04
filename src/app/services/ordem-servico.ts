import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrdemServico {
  id: string;
  codigo: string | null;
  descricao: string;
  clienteId: string;
  status: string;
  dataAbertura: string | null;
  dataFechamento: string | null;
}

@Injectable({ providedIn: 'root' })
export class OrdemServicoService {
  private apiUrl = '/api/os';
  private http = inject(HttpClient);

  listar(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.apiUrl);
  }

  obterPorId(id: string): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.apiUrl}/${id}`);
  }

  criar(os: OrdemServico): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.apiUrl, os);
  }

  atualizar(id: string, os: OrdemServico): Observable<OrdemServico> {
    return this.http.put<OrdemServico>(`${this.apiUrl}/${id}`, os);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

