import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaystackComponent } from './paystack.component';
import { PageComponent } from './page/page.component';

const routes: Routes = [
  {
    path: '',
    component: PaystackComponent,
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaystackRoutingModule {}
