import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { PaymentComponent } from './payment/payment.component';
import { LoggedInGuard } from './core/guards/loggedIn/logged-in.guard';
import { PageComponent } from './front/page/page.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ApiDocComponent } from './front/api-doc/api-doc.component';

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
    path: 'api-doc',
    component: ApiDocComponent,
  },
  {
    path: 'test',
    component: PaymentComponent,
  },
  {
    path: 'package-details/:id',
    component: PageComponent,
  },
  {
    path: 'invoice/:id',
    component: InvoiceComponent,
  },
  {
    path: 'payment',
    loadChildren: () =>
      import('./feature-module/make-payment/make-payment.module').then(
        (m) => m.MakePaymentModule
      ),
  },
  {
    path: 'services-list-user',
    loadChildren: () =>
      import('./feature-module/services/service-front/services-front.module').then(
        (m) => m.ServicesFrontModule
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
