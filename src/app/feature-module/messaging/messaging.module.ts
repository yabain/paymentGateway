import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessagingRoutingModule } from './messaging-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MessagingComponent } from './messaging.component';
import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { MailComponent } from './mail/mail.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    MessagingComponent,
    WhatsappComponent,
    MailComponent
  ],
  imports: [
    CommonModule,
    MessagingRoutingModule,
    SharedModule,
    TranslateModule,
    QRCodeModule
  ],
  providers: []
})
export class MessagingModule { }
