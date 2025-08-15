import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastService: ToastrService) {}

  // type: 'success' | 'error' | 'warning' | 'info' | 'dark'
presentToast(
    type: string,
    title: string,
    message: string,
    timer: number = 5000,
  ): any {
    if (type === 'info') return this.toastService.info(message, title, { timeOut: timer });
    if (type === 'warning') return this.toastService.warning(message, title, { timeOut: timer });
    if (type === 'error') return this.toastService.error(message, title, { timeOut: timer });
    if (type === 'success') return this.toastService.success(message, title, { timeOut: timer });
    // const toast = await this.toastController.create({
    //     message: message,
    //     duration: timer,
    //     position: position,
    //     cssClass: 'custom-' + type + '-toast'
    // });
    // await toast.present();
  }
}
