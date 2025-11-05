import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailsComponent } from './details/details.component';
import { ServicesComponent } from './services.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'services',
    pathMatch: 'full',
  },
  {
    path: 'services',
    component: ServicesComponent,
  },
  {
    path: 'details/:id',
    component: DetailsComponent,
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
export class ServicesRoutingModule {}
