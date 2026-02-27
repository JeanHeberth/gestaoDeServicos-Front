import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { ClientesComponent } from './clientes/clientes';
import { OrdensServicoComponent } from './ordens-servico/ordens-servico';
import { UsuariosComponent } from './usuarios/usuarios';
import { LayoutComponent } from './layout/layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'ordens-servico', component: OrdensServicoComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'usuarios', component: UsuariosComponent },
    ]
  },
  { path: '**', redirectTo: '/login' },
];
