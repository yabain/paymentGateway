import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { routes } from 'src/app/core/core.index';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
import { UserService } from 'src/app/services/user/user.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Location } from '@angular/common';
import { MailService } from 'src/app/services/mail/mail.service';

interface data {
  value: string;
}
@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss'],
})
export class MailComponent implements OnInit {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  smtpEncription: string;
  emailForAlert: string;
  edition: boolean = false;

  status: boolean = true;
  waitingData: boolean = false;
  smtpData: any;
  gettingtOutputMails: boolean = false;

  email: string;
  subject: string = 'Test email';
  message: string = 'This is the body of test email';
  sending: boolean = false;

  emailList: any;
  emailPage: number = 1;

  selectedEmail!: any;
  
  emailBody: string = "";

  constructor(private mailService: MailService) { }

  ngOnInit(): void {
    this.refresh();
  }

  cancel() {
    this.idrate();
    this.toggleEdition();
  }

  idrate() {
    this.smtpHost = this.smtpData.smtpHost;
    this.smtpPort = this.smtpData.smtpPort;
    this.smtpSecure = this.smtpData.smtpSecure;
    this.smtpEncription = this.smtpData.smtpEncription;
    this.smtpUser = this.smtpData.smtpUser;
    this.smtpPassword = this.smtpData.smtpPassword;
    this.status = this.smtpData.status;
    this.emailForAlert = this.smtpData.emailForAlert;
  }

  toggleEdition() {
    this.edition = !this.edition;
  }

  changeUserActiveStatus() { }

  getSmtpData() {
    this.waitingData = true;
    this.mailService.getSmtpData().subscribe({
      next: (res: any) => {
        this.smtpData = res;
        this.idrate();
        this.waitingData = false;
      },
      error: (err) => {
        this.waitingData = false;
        console.log(err);
      },
    });
  }

  getFirst60Chars(str) {
    if (typeof str !== 'string') {
      throw new Error('Parameter must be a string.');
    }
    if (str.length <= 60) {
      return str;
    }
    return str.substring(0, 60) + '...';
  }

  refresh() {
    this.getSmtpData();
    this.getOutputMails();
  }

  getOutputMails(page: number = 1, keyword?: string) {
    this.gettingtOutputMails = true
    this.mailService.getOutputMails(page, keyword ? keyword : '')
      .subscribe({
        next: (res: any) => {
          this.emailList = res;
          this.gettingtOutputMails = false
        },
        error: (err) => {
          this.emailList = [];
          this.gettingtOutputMails = false;
          console.log(err);
        },
      });
  }


  previousEmailPage() {
    if (this.emailPage < 2) {
      this.emailPage = 1;
      return false;
    }
    this.emailPage -= 1;
    return this.getOutputMails(this.emailPage);
  }

  nextEmailPage() {
    if (this.emailList.length < 10) {
      return false;
    }
    this.emailPage += 1;
    return this.getOutputMails(this.emailPage);
  }

  save() {
    let data = {
      smtpHost: this.smtpHost,
      smtpPort: this.smtpPort,
      smtpSecure: this.smtpSecure,
      smtpEncription: this.smtpEncription,
      smtpUser: this.smtpUser,
      smtpPassword: this.smtpPassword,
      status: this.status,
      emailForAlert: this.emailForAlert,
    };
    if (!this.verifyData()) {
      return;
    }
    this.mailService.updateSmtp(data).subscribe({
      next: (res: any) => {
        if (res) {
          this.smtpData = res;
          this.idrate();
        }
        this.edition = false;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  verifyData() {
    if (
      this.smtpHost &&
      this.smtpPort &&
      this.smtpUser &&
      this.smtpPassword &&
      this.smtpSecure
    ) {
      return true;
    } else {
      return false;
    }
  }

  send() {
    if (!this.verifyForm()) {
      this.sending = false;
      return;
    }
    this.sending = true;
    this.mailService
      .sendTestMail(this.email, this.subject, this.message)
      .subscribe({
        next: (res: any) => {
          this.getOutputMails();
          this.sending = false;
        },
        error: (err) => {
          this.sending = false;
          console.log(err);
        },
      });
  }

  verifyForm() {
    if (this.subject && this.email && this.message) {
      return true;
    } else {
      return false;
    }
  }

  resetSmtp() {
    this.mailService.resetSmtp().subscribe({
      next: (res: any) => {
        if (res) {
          this.smtpData = res;
          this.idrate();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  selectEmail(email) {
    this.selectedEmail = email;
    this.emailBody = email.body || "<h4 style='color: green!important'>Nothing in Body</h4><br><p>This email has no content.</p>";
  }
}
