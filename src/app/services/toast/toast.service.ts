import { Injectable } from '@angular/core';
import { ToastrService, IndividualConfig, ActiveToast } from 'ngx-toastr';

export interface ToastConfig {
  timeOut?: number;
  progressBar?: boolean;
  progressAnimation?: 'increasing' | 'decreasing';
  positionClass?: string;
  disableTimeOut?: boolean;
  closeButton?: boolean;
  tapToDismiss?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastService: ToastrService) {}

  presentToast(
    type: string, // 'success' | 'error' | 'warning' | 'info' | 'dark'
    title: string,
    message: string,
    timer: number = 5000
  ): ActiveToast<any> {
    const config: ToastConfig = {
      timeOut: timer,
      progressBar: true,
      progressAnimation: 'increasing',
      positionClass: 'toast-top-right',
    };

    switch (type) {
      case 'info':
        return this.toastService.info(message, title, config);
      case 'warning':
        return this.toastService.warning(message, title, config);
      case 'error':
        return this.toastService.error(message, title, config);
      case 'success':
        return this.toastService.success(message, title, config);
      case 'dark':
        return this.toastService.show(message, title, {
          ...config,
          positionClass: 'toast-top-right toast-dark'
        });
      default:
        return this.toastService.show(message, title, config);
    }
  }

  // Méthode pour effacer tous les toasts
  clearAllToasts(): void {
    this.toastService.clear();
  }

  // Méthode pour effacer un toast spécifique
  clearToast(toast: ActiveToast<any>): void {
    this.toastService.remove(toast.toastId);
  }
}