// src/app/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, tap } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { ToastService } from '../toast.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class MailService {


  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private toastService: ToastService,
    private apiService: ApiService
  ) {
  }

  getMailerStatus(): Observable<boolean> {
    return this.apiService.getWithoutId('whatsapp/get-client-status').pipe(
      map((res: any) => {
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

  updateMail(code: string, phone: string): Observable<any> {
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

  sendTestMail(code: string, to: string, message: string): Observable<any> {
    return this.apiService.create('whatsapp/send', { to, message, code }).pipe(
      map((res: any) => {
        console.log('res', res);
        if (res && res.success) {
          this.toastService.presentToast('Test message sent !', 'top', 'success');
          return res;
        } else {
          this.toastService.presentToast('Unable to send test message', 'top', 'danger');
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

}
