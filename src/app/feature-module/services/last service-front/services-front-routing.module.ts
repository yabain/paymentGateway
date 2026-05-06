import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicesFrontComponent } from './services-front.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'services-front/:id',
    component: ServicesFrontComponent,
  },
  {
    path: 'services/:id',
    component: ServicesFrontComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'welcome',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesFrontRoutingModule {}
