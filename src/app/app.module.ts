import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/sharedIndex';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { WelcomeComponent } from './welcome/welcome.component';
import { DatePipe } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { CryptService } from './services/crypt/crypt.service';
import { ShareLinkService } from './services/share-link/share.link.service';
import { SystemService } from './services/system/system.service';
import { UserService } from './services/user/user.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TermsComponent } from './shared/terms/terms.component';
import { PaymentComponent } from './payment/payment.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from './services/toast/toast.service';
import { DataTablesModule } from 'angular-datatables';
import { FrontModule } from './front/front.module';
import { CommonItemModule } from './feature-module/common/common-item.module';
import { InvoiceComponent } from './invoice/invoice.component';
import { DevService } from './services/dev/dev.service';
import { ApiDocComponent } from './front/api-doc/api-doc.component';
import { UserSettingsService } from './services/user/userSettings.service';
// import { TransactionDetailsComponent } from './feature-module/common/transaction-details/transaction-details.component';
// import { JsonViewerComponent } from './feature-module/common/json-viewer/json-viewer.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    TermsComponent,
    PaymentComponent,
    InvoiceComponent,
    ApiDocComponent
    // TransactionDetailsComponent,
    // JsonViewerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    DataTablesModule,
    FrontModule,
    CommonItemModule,
  ],
  providers: [ { provide: LOCALE_ID, useValue: "fr-FR" },
    AuthService, UserService, CryptService, ShareLinkService, SystemService, DatePipe, UserSettingsService,
    Title, ToastService, DevService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
