import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayoutComponent } from './payout.component';
import { PageComponent } from './page/page.component';
import { AllPayoutComponent } from './all-payout/all-payout.component';

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
        path: 'all-payout',
        component: AllPayoutComponent,
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
