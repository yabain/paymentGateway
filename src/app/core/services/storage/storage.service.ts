import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
  ) { }

  async setStorage(key: any, value: any) {
    return localStorage.setItem(
      key,
      value
    );
  }
  
  // async setStorageCrypt(key: any, value: any) {
  //   value = this.cryptService.encryptData(value);
  //   return Preferences.set({
  //     key,
  //     value
  //   });
  // }

  getStorage(key: any) {
    return localStorage.getItem(key);
  }
  
  // getStorageCrypt(key: any) {
  //   let data: any = Preferences.get({key});
  //   data = this.cryptService.decryptData(data.value);
  //   let output = {
  //     value: data,
  //   }
  //   return output;
  // }

  removeStorage(key: any) {
    return localStorage.removeItem(key);
  }
  
  clearStorage(){
    return localStorage.clear()
  }
}
