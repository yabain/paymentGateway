import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayoutComponent } from './payout.component';
import { PageComponent } from './page/page.component';
import { AllPaymentsComponent } from './all-payments/all-payments.component';
import { PayinComponent } from '../payin/payin.component';

const routes: Routes = [
  {
    path: '',
    component: PayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'payout',
        pathMatch: 'full',
      },
      {
        path: 'payout',
        component: PageComponent,
      },
      {
        path: 'payin',
        component: PayinComponent,
      },
      {
        path: 'all-payments',
        component: AllPaymentsComponent,
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'payout',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayoutRoutingModule {}
