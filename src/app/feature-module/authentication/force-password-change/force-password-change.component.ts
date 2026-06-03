import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-force-password-change',
  templateUrl: './force-password-change.component.html',
  styleUrls: ['./force-password-change.component.scss'],
})
export class ForcePasswordChangeComponent {
  form = new FormGroup({
    currentPassword: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(8)],
    }),
    newPassword: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  showCurrentPassword = false;
  showNewPassword = false;
  isSending = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private toastService: ToastService,
  ) {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.translate.get('auth.passwordMismatch').subscribe((message: string) => {
        this.toastService.presentToast('error', 'Error', message, 10000);
      });
      return;
    }

    this.isSending = true;
    this.authService
      .changePassword({
        currentPassword: this.form.value.currentPassword,
        newPassword: this.form.value.newPassword,
      })
      .pipe(
        catchError(() => {
          this.isSending = false;
          this.translate.get('auth.unableChangePassword').subscribe((message: string) => {
            this.toastService.presentToast('error', 'Error', message, 10000);
          });
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res === true) {
          localStorage.removeItem('mustChangePassword');
          const storedUser = localStorage.getItem(environment.user_data);
          if (storedUser) {
            const user = JSON.parse(storedUser);
            localStorage.setItem(
              environment.user_data,
              JSON.stringify({ ...user, mustChangePassword: false }),
            );
          }
          this.translate.get('auth.passwordUpdated').subscribe((message: string) => {
            this.toastService.presentToast('success', 'Success', message, 10000);
          });
          this.router.navigateByUrl('/dashboard', { replaceUrl: true });
        }
        this.isSending = false;
      });
  }
}
