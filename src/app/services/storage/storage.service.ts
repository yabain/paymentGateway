import { Injectable } from '@angular/core';
import { CryptService } from '../crypt/crypt.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private cryptService: CryptService) {}

  async setStorage(key, value) {
    return localStorage.setItem(key, value);
  }

  async setStorageCrypt(key, value) {
    value = this.cryptService.encryptData(value);
    return localStorage.setItem(key, value);
  }

  async getStorage(key) {
    return localStorage.getItem(key);
  }

  getStorageCrypt(key) {
    let data: any = localStorage.getItem(key);
    data = this.cryptService.decryptData(data.value);
    let output = {
      value: data,
    };
    return output;
  }

  removeStorage(key) {
    return localStorage.removeItem(key);
  }

  clearStorage() {
    return localStorage.clear();
  }
}
