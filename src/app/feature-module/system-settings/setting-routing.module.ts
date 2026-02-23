import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemSettingsComponent } from './system-settings.component';
import { WhatsappSettingsComponent } from './whatsapp-settings/whatsapp-settings.component';
import { EmailSettingsComponent } from './email-settings/email-settings.component';
import { InvoiceSettingsComponent } from './invoice-settings/invoice-settings.component';
import { PaymentSettingsComponent } from './payment-settings/payment-settings.component';

const routes: Routes = [
  {
    path: '',
    component: SystemSettingsComponent,
    children: [
      {
        path: 'whatsapp-settings',
        component: WhatsappSettingsComponent
      },
      {
        path: 'email-settings',
        component: EmailSettingsComponent
      },
      {
        path: 'invoice-settings',
        component: InvoiceSettingsComponent
      },
      {
        path: 'payment-settings',
        component: PaymentSettingsComponent
      },
      {
        path: 'tax-types',
        loadChildren: () =>
          import('./tax-types/tax-types.module').then((m) => m.TaxTypesModule),
      },
      {
        path: 'delete-account',
        loadChildren: () =>
          import('./delete-account/delete-account.module').then(
            (m) => m.DeleteAccountModule,
          ),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./notifications/notifications.module').then(
            (m) => m.NotificationsModule,
          ),
      },
      {
        path: 'preferences',
        loadChildren: () =>
          import('./preferences/preferences.module').then(
            (m) => m.PreferencesModule,
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'company-settings',
        loadChildren: () =>
          import('./company-settings/company-settings.module').then(
            (m) => m.CompanySettingsModule,
          ),
      },
      {
        path: 'bank-account',
        loadChildren: () =>
          import('./bank-account/bank-account.module').then(
            (m) => m.BankAccountModule,
          ),
      },
      {
        path: 'tax-rats',
        loadChildren: () =>
          import('./tax-rats/tax-rats.module').then((m) => m.TaxRatsModule),
      },
      {
        path: 'template-invoice',
        loadChildren: () =>
          import('./template-invoice/template-invoice.module').then(
            (m) => m.TemplateInvoiceModule,
          ),
      },
      {
        path: 'plan-billing',
        loadChildren: () =>
          import('./plan-billing/plan-billing.module').then(
            (m) => m.PlanBillingModule,
          ),
      },
      {
        path: 'two-factor',
        loadChildren: () =>
          import('./two-factor/two-factor.module').then(
            (m) => m.TwoFactorModule,
          ),
      },
      {
        path: 'seo-settings',
        loadChildren: () =>
          import('./seo-settings/seo-settings.module').then(
            (m) => m.SeoSettingsModule,
          ),
      },
      {
        path: 'sass-settings',
        loadChildren: () =>
          import('./sass-settings/sass-settings.module').then(
            (m) => m.SassSettingsModule,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingRoutingModule {}
