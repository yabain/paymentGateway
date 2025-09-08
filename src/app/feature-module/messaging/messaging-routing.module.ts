import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhatsappComponent } from './whatsapp/whatsapp.component';
import { MessagingComponent } from './messaging.component';
import { MailComponent } from './mail/mail.component';

const routes: Routes = [
  {
    path: '',
    component: MessagingComponent,
    children: [
      {
        path: '',
        redirectTo: 'mail',
        pathMatch: 'full',
      },
      {
        path: 'mail',
        component: MailComponent,
      },
      {
        path: 'whatsapp',
        component: WhatsappComponent,
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'mail',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagingRoutingModule {}
