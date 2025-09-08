import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { PaymentComponent } from './payment/payment.component';
import { LoggedInGuard } from './core/guards/loggedIn/logged-in.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'welcome',
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: 'test',
    component: PaymentComponent,
  },
  {
    path: 'payment',
    loadChildren: () =>
      import('./feature-module/make-payment/make-payment.module').then(
        (m) => m.MakePaymentModule
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./feature-module/feature-module.module').then(
        (m) => m.FeatureModuleModule
      ),
  },
  // {
  //   path: '**',
  //   pathMatch: 'full',
  //   redirectTo: 'login',
  // },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
