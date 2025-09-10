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
import { TranslateService } from '@ngx-translate/core';
import { WhatsappService } from 'src/app/services/whatsapp/whatsapp.service';
import { catchError, takeUntil } from 'rxjs/operators';
import * as QRCode from 'qrcode';
import { interval, of, Subject, throwError } from 'rxjs';

interface data {
  value: string;
}
@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.scss'],
})
export class WhatsappComponent implements OnInit {
  status: boolean = false;
  private destroy$ = new Subject<void>();
  currentUserData: any;
  qrCode: any;
  waitingData: boolean = true;
  waitingQr: boolean = true;
  showInstructions: boolean = false;
  iconUrl: string = 'src/assets/imgs/YaBi_icon.png';
  inProcess: boolean = false;
  count: number = 0;
  clientStatus: string = 'wating'; // true if connected, false if not
  phone: string = '';
  countryCode: string = '';
  testPhone: string = '';
  testMessage: string = 'Test message';
  savingContact: boolean = false;
  sendingTest: boolean = false;
  testCountryCode: string = '237';
  
  
  constructor(
    private _location: Location,
    private translate: TranslateService,
    private userService: UserService,
    private whatsappService: WhatsappService,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.count = 0
    this.waitingData = true;
    this.waitingQr = true;
    interval(15000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getClientStatus();
        this.getQrCode();
      });
  }

  refresh(){}
  
  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  getCurrentUser() {
      this.getQrCode;
  }
  
  getQrCode() {
    this.inProcess = true;
    this.whatsappService.getQrCode()
      .pipe(
        catchError(error => of({ error }))
      )
      .subscribe({
        next: (resp: any) => {
          if (resp) {
            // console.log('count: ', this.count);
            // console.log('resp: ', resp);
            if (this.count === 0) {
              // console.log('test ');
              this.phone = resp.phone;
              this.countryCode = resp.code;
            }
            this.count++;
            // console.log('test 00 ');
            this.qrCode = resp.qr;
            this.countryCode = resp.code;
          } else {
            this.qrCode = undefined;
          }
          this.waitingQr = false;
          this.inProcess = false;
        },
        error: (err) => {
          // this.backClicked();
          this.toastService.presentToast(this.translate.instant('whatsapp.qrCodeError') + ': ' + err, 'top', 'danger');
          console.error('Error fetching QR code:', err);
          this.inProcess = false;
        },
      });
  }

  saveContact(): void {
    this.savingContact = true;
    console.log('Saving contact with phone:', this.phone, 'and country code:', this.countryCode);
    if (!this.phone || !this.countryCode) {
      this.toastService.presentToast('Invalid contact form', 'top', 'warning');
      this.savingContact = false;
      return;
    }

    this.whatsappService.updateContact(this.countryCode, this.phone)
      .pipe(
        catchError((err) => {
          console.error('Error saving contact:', err);
          this.toastService.presentToast('whatsapp contactSave Error ' + ': ' + err, 'top', 'danger');
          this.savingContact = false;
          return throwError(err); // Propagate the error
        })
      )
      .subscribe({
        next: (resp: any) => {
          this.savingContact = false;
        }
      });
  }

  sendTestMessage() {
    console.log('Saving contact with phone:', this.phone, 'and country code:', this.countryCode);
    if (!this.testPhone || !this.testCountryCode || !this.testMessage) {
      this.toastService.presentToast('warning', 'Error form!', 'Invalid contact form',);
      return;
    }
    this.sendingTest = true;

    this.whatsappService.sendTestMessage(this.testCountryCode, this.testPhone, this.testMessage)
      .pipe(
        catchError((err) => {
          console.error('Error saving contact:', err);
          this.sendingTest = false
          return throwError(err); // Propagate the error
        })
      )
      .subscribe({
        next: (resp: any) => {
          this.sendingTest = false;
        }
      });
  }

  refreshQr() {
    this.inProcess = true;
    this.whatsappService.refreshQrCode()
      .pipe(
        catchError(error => of({ error }))
      )
      .subscribe({
        next: (resp: any) => {
          if (resp) {
            this.qrCode = resp.qr;
          } else {
            this.qrCode = null;
          }
          this.waitingQr = false;
          this.inProcess = false;
        },
        error: (err) => {
          // this.backClicked();
          this.toastService.presentToast('error', 'Error', this.translate.instant('whatsapp.qrCodeError') + ': ' + err);
          console.error('Error fetching QR code:', err);
          this.inProcess = false;
        },
      });
  }

  getClientStatus() {
    console.log('getting status')
    this.whatsappService.getClienStatus()
      .pipe(
        catchError(error => of({ error }))
      )
      .subscribe({
        next: (resp: any) => {
          if (resp) {
            if (resp) {
              this.clientStatus = 'connected';
            } else {
              this.clientStatus = 'disconnected';
            }
          } else {
            this.clientStatus = 'disconnected';
          }
        },
        error: (err) => {
          console.error('Error fetching client status:', err.message);
          this.toastService.presentToast(this.translate.instant('whatsapp.statusError') + ': ' + err.message, 'top', 'danger');
        },
      });
  }

  initialise() {
    this.inProcess = true;
    this.clientStatus = 'wating'; // Update client status to disconnecting
    this.whatsappService.initialise()
      .pipe(
        catchError(error => of({ error }))
      )
      .subscribe({
        next: (resp: any) => {
          // console.log('Initialisation response:', resp);
          if (resp.status === true) {
            this.toastService.presentToast('Initialisation started !', 'top', 'success');
            this.refreshQr();
          } else {
            this.toastService.presentToast('Unable to initialise Whatsapp service', 'top', 'success');
            this.inProcess = false;
          }
        },
        error: (err) => {
          this.toastService.presentToast('Error to initialise Whatsapp service: ' + err, 'top', 'danger');
          console.error('Error disconnecting:', err);
          this.inProcess = false;
        },
      });
  }

  disconnect() {
    this.inProcess = true;
    this.clientStatus = 'wating'; // Update client status to disconnecting
    this.whatsappService.disconnect()
      .pipe(
        catchError(error => of({ error }))
      )
      .subscribe({
        next: (resp: any) => {
          this.toastService.presentToast(this.translate.instant('whatsapp.disconnected'), 'top', 'success');
          this.clientStatus = 'disconnected';
          this.inProcess = false;
        },
        error: (err) => {
          this.toastService.presentToast(this.translate.instant('whatsapp.disconnectError') + ': ' + err, 'top', 'danger');
          console.error('Error disconnecting:', err);
          this.inProcess = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.count = 0;
    this.qrCode = null;
  }
}
