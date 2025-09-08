import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlutterwaveComponent } from './flutterwave.component';
import { PageComponent } from './page/page.component';

const routes: Routes = [
  {
    path: '',
    component: FlutterwaveComponent,
    children: [
      {
        path: '',
        redirectTo: 'page',
        pathMatch: 'full',
      },
      {
        path: 'page',
        component: PageComponent,
      },
      {
        path: 'page/:id',
        component: PageComponent,
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'flutterwave',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlutterwaveRoutingModule {}
