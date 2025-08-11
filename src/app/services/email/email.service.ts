import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { SystemService } from '../system/system.service';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(
    private systemService: SystemService
  ) { }

  async sendWelcomeEmail(email: string, name: string) {
    let publicKey = "_ezr02AWFAg_UNx6L";
    let serviceId = "service_l197pcj";
    let templateId = "template_fe8rww5";
    emailjs.init(publicKey);

    let templateParams = {
      to_name: name,
      to_email: email,
    };

    console.log("templateParams: ", templateParams);
    let res = await emailjs.send(serviceId, templateId, templateParams);
    console.log("mailService 1111");
  }

  async sendEmailJoinEvent(userEmail: string, eventData: any) {
    emailjs.init(environment.MailJS_publicKey);
    this.systemService.getRacineToshare()
    .then( data => {
      const sharLink = data + '/tabs/events/' + eventData._id + '_' + '_shared';
      let templateParams = {
        ...eventData,
        event_url: sharLink,
        to_email: userEmail,
      };
  
      return emailjs.send(
        environment.MailJS_serviceId,
        environment.MailJS_templateId,
        templateParams);
      // console.log("mailService 1111");
    })
  }
}
