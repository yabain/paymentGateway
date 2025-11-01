import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsComponent } from './payments.component';
import { AdminGuard } from 'src/app/core/guards/adminer/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: PaymentsComponent,
    children: [
      {
        path: 'payments-list',
        loadChildren: () =>
          import('./payments-list/payments-list.module').then((m) => m.PaymentsListModule),
      },
      {
        path: 'add-payment',
        loadChildren: () =>
          import('./add-payments/add-payments.module').then((m) => m.AddPaymentsModule),
      },
      {
        path: 'admin-payments',
        canActivate: [AdminGuard],
        loadChildren: () =>
          import('./payout/payout.module').then(
            (m) => m.PayoutModule,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentsRoutingModule {}
