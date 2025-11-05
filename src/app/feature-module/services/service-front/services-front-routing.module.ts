import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicesFrontComponent } from './services-front.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'services',
    pathMatch: 'full',
  },
  {
    path: 'services',
    component: ServicesFrontComponent,
  },
  {
    path: 'services/:id',
    component: ServicesFrontComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'services',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesFrontRoutingModule {}
