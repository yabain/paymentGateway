import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentRequestCreateComponent } from './payment-request-create/payment-request-create.component';
import { PaymentRequestListComponent } from './payment-request-list/payment-request-list.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentRequestListComponent,
  },
  {
    path: 'create',
    component: PaymentRequestCreateComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRequestRoutingModule {}

