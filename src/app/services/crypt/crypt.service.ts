import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class CryptService {
  private key = environment.ENCRYPTION_KEY; // Encryption key from environment variables

  constructor() { }

  encryptData(data: any) {
    if (data == null || data == undefined || data == "") return null;
    let xxx = CryptoJS.AES.encrypt(data, this.key).toString();
    xxx = xxx.replaceAll("/", "AaAaAaA");
    return xxx;
  }

  encryptObject(data: any) {
    if (data == null || data == undefined || data == "") return null;
    data = JSON.stringify(data);
    let xxx = CryptoJS.AES.encrypt(data, this.key).toString();
    xxx = xxx.replaceAll("/", "AaAaAaA");
    return xxx;
  }

  decryptData(data: any) {
    if (data == null || data == undefined || data == "") return null;
    data = data.toString();
    data = data.replaceAll("AaAaAaA", "/");
    const bytes = CryptoJS.AES.decrypt(data, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  decryptObject(data: any) {
    if (data == null || data == undefined || data == "") return null;
    data = data.replaceAll("AaAaAaA", "/");
    const bytes = CryptoJS.AES.decrypt(data, this.key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // encryptData2(data: any){
  //   if(data == null || data == undefined || data == "") return null;
  //   let xxx = CryptoJS.AES.encrypt(data, this.key).toString();
  //   xxx = xxx.replaceAll("/", "AaAaAaA");
  //   return xxx;
  // } 


  //  decryptData2(data: any){
  //   if(data == null || data == undefined || data == "") return null;
  //   data = data.replaceAll("AaAaAaA", "/");
  //   const bytes = CryptoJS.AES.decrypt(data, this.key);
  //   return bytes.toString(CryptoJS.enc.Utf8);
  // }
}
