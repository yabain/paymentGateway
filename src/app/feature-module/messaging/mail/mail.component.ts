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
  edition: boolean = false;

  status: boolean = true;
  waitingData: boolean = false;
  smtpData: any;

  email: string;
  subject: string = 'Test email';
  message: string = 'This is the body of test email';
  sending: boolean = false;

  outputList: any;

  constructor(private mailService: MailService) {}

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
  }

  toggleEdition() {
    this.edition = !this.edition;
  }

  changeUserActiveStatus() {}

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

  refresh() {
    this.getSmtpData();
    this.getOutputMails();
  }

  getOutputMails() {
    this.mailService.getOutputMails().subscribe({
      next: (res: any) => {
        this.outputList = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
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
}
