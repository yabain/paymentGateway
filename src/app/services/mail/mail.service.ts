// src/app/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, tap } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../api/api.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private toastService: ToastService,
    private apiService: ApiService,
  ) {}

  getSmtpData(): Observable<boolean> {
    return this.apiService.getWithoutId('smtp').pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting smtp settings:', err);
        this.toastService.presentToast(
          'error',
          'Error',
          'Error to get data',
          7000,
        );
        return of(false);
      }),
    );
  }

  updateSmtp(smtpData): Observable<any> {
    return this.apiService.updateWithoutId('smtp/update', smtpData).pipe(
      map((res: any) => {
        if (res) {
          this.toastService.presentToast(
            'success',
            'Done!',
            'SMTP settings updated',
            7000,
          );
          return res;
        }
      }),
      catchError((err) => {
        console.error('Error updating contact:', err);
        this.toastService.presentToast(
          'error',
          'Error',
          'Error to update data',
          7000,
        );
        return throwError(err); // Propagate the error
      }),
    );
  }

  sendTestMail(to: string, subject: string, message: string): Observable<any> {
    return this.apiService
      .create('email/send-test', { to, subject, message })
      .pipe(
        map((res: any) => {
          if (res) {
            this.toastService.presentToast(
              'success',
              'Success!',
              'Test mail sent !',
              7000,
            );
            return res;
          }
        }),
        catchError((err) => {
          console.error('Error updating contact:', err);
          this.toastService.presentToast(
            'error',
            'Error',
            'Error to send test email',
            7000,
          );
          return throwError(err); // Propagate the error
        }),
      );
  }

  resetSmtp(): Observable<boolean> {
    return this.apiService.getWithoutId('smtp/reset').pipe(
      map((res: any) => {
        if (res) {
          this.toastService.presentToast(
            'success',
            'Done!',
            'SMTP factory reset.',
            7000,
          );
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting smtp settings:', err);
        this.toastService.presentToast(
          'error',
          'Error',
          'Error to get data',
          7000,
        );
        return of(false);
      }),
    );
  }

  getOutputMails(page: number = 1, keyword: string = ''): Observable<boolean> {
    return this.apiService
      .getWithoutId('email/output?page=' + page + '&keyword=' + keyword)
      .pipe(
        map((res: any) => {
          if (res) {
            return res;
          }
          return false;
        }),
        catchError((err) => {
          console.error('Error getting smtp settings:', err);
          this.toastService.presentToast(
            'error',
            'Error',
            'Error to get output emails',
            7000,
          );
          return of(false);
        }),
      );
  }
}
