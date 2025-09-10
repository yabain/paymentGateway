// src/app/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { from, Observable, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../api/api.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {


  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private toastService: ToastService,
    private apiService: ApiService
  ) {
  }

  getQrCode(): Observable<boolean> {
    return this.apiService.getWithoutId('whatsapp/get-qr-code').pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting qr:', err);
        return of(false); // Emit false if there's an error
      })
    );
  }

  refreshQrCode(): Observable<boolean> {
    return this.apiService.getWithoutId('whatsapp/refresh-qr-code').pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting qr:', err);
        return of(false); // Emit false if there's an error
      })
    );
  }

  getClienStatus(): Observable<boolean> {
    return this.apiService.getWithoutId('whatsapp/get-client-status').pipe(
      map((res: any) => {
        console.log('res getClienStatus: ', res)
        if (res) {
          return res.status;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting client status:', err);
        this.toastService.presentToast(this.translate.instant('whatsapp.statusError') + ': ' + err, 'top', 'danger');
        return of(false); // Emit false if there's an error
      })
    );
  }

  updateContact(code: string, phone: string): Observable<any> {
    return this.apiService.updateWithoutId('whatsapp/update-contact', { code, phone }).pipe(
      map((res: any) => {
        if (res && res.status) {
          this.toastService.presentToast('Whatsapp contact for alert update', 'top', 'success');
          return res;
        } else {
          this.toastService.presentToast('Unable to update the Whatsapp admin contact for alert', 'top', 'danger');
          return false;
        }
      }),
      catchError((err) => {
        console.error('Error updating contact:', err);
        this.toastService.presentToast(this.translate.instant('whatsapp.contactUpdateError') + ': ' + err, 'top', 'danger');
        return throwError(err); // Propagate the error
      })
    );
  }

  sendTestMessage(code: string, to: string, message: string): Observable<any> {
    return this.apiService.create('whatsapp/send', { to, message, code }).pipe(
      map((res: any) => {
        console.log('res', res);
        if (res && res.success) {
          this.toastService.presentToast('success', 'Message was send', 'Test message sent !');
          return res;
        } else {
          this.toastService.presentToast('error', 'Error', 'Unable to send test message');
          return false;
        }
      }),
      catchError((err) => {
        console.error('Error updating contact:', err);
        this.toastService.presentToast('Error to send test message' + ': ' + err, 'top', 'danger');
        return throwError(err); // Propagate the error
      })
    );
  }


  initialise(): Observable<any> {
    return this.apiService.getWithoutId('whatsapp/init-whatsapp').pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error disconnecting:', err);
        this.toastService.presentToast(this.translate.instant('whatsapp.disconnectError') + ': ' + err, 'top', 'danger');
        return throwError(err); // Propagate the error
      })
    );
  }

  disconnect(): Observable<any> {
    return this.apiService.postWithoutData('whatsapp/disconnect').pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error disconnecting:', err);
        this.toastService.presentToast(this.translate.instant('whatsapp.disconnectError') + ': ' + err, 'top', 'danger');
        return throwError(err); // Propagate the error
      })
    );
  }

}
