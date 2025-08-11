import { Injectable } from '@angular/core';
// import { IonicModule, ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    constructor(
        // private toastController: ToastController
    ) {
    }

    // position: 'top' | 'middle' | 'bottom'
    // type: 'success' | 'danger' | 'warning' | 'info' | 'dark' 
    async presentToast(message, position?, type?, timer?: number){
        if(!timer) timer = 5000
        // const toast = await this.toastController.create({
        //     message: message,
        //     duration: timer,
        //     position: position,
        //     cssClass: 'custom-' + type + '-toast'
        // });
        // await toast.present();
    }

}
