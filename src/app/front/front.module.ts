
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PackageDetailsComponent } from './package-details/package-details.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureModuleRoutingModule } from '../feature-module/feature-module-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PageComponent } from './page/page.component';
import { FooterComponent } from './footer/footer.component';
import { AddSubscriberComponent } from './add-subscriber/add-subscriber.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarComponent } from './calendar/calendar.component';
import { PortalComponent } from './portal/portal.component';
import { InvoiceListComponent } from './invoice/invoice-list/invoice-list.component';
import { SubscriberListComponent } from './subscriber-list/subscriber-list.component';
import { QRCodeModule } from 'angularx-qrcode';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { ProceedPaymentComponent } from './proceed-payment/proceed-payment.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json?v=' + new Date().getTime());
}

@NgModule({
  declarations: [
    PackageDetailsComponent,
    PageComponent,
    FooterComponent,
    AddSubscriberComponent,
    CalendarComponent,
    PortalComponent,
    InvoiceListComponent,
    PackageDetailsComponent,
    SubscriberListComponent,
    QrCodeComponent,
    ProceedPaymentComponent
  ],
  providers: [],
  imports: [
    CommonModule,
    FeatureModuleRoutingModule, 
    TranslateModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
    QRCodeModule
  ],
    exports: [
      PackageDetailsComponent,
      PageComponent,
      FooterComponent,
      CalendarComponent,
      InvoiceListComponent,
      PackageDetailsComponent,
      SubscriberListComponent,
      FullCalendarModule,
      QrCodeComponent,
      ProceedPaymentComponent
    ],
})
export class FrontModule {}
