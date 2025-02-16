import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MakePaymentComponent } from './make-payment.component';

const routes: Routes = [
  { path: '',
    pathMatch: 'full',
    redirectTo: 'make-payment'
  },
  { path: 'make-payment', component: MakePaymentComponent },
  { path: 'make-payment/:id', component: MakePaymentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MakePaymentRoutingModule { }
