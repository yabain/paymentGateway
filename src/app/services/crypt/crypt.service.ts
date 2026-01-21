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

  PBKDF2_ITERS = 100000;
  KEY_SIZE = 256 / 32;
  DIGEST = CryptoJS.algo.SHA256;

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

  // Decript for backend data encrypted
  decryptPayload(payload: string): string {
    const passphrase = this.key;
    const [saltB64, ivB64, ctB64, hmacB64] = payload.split(':');
    if (!saltB64 || !ivB64 || !ctB64 || !hmacB64) throw new Error('Invalid payload');
  
    const salt = CryptoJS.enc.Base64.parse(saltB64);
    const iv = CryptoJS.enc.Base64.parse(ivB64);
    const ciphertext = CryptoJS.enc.Base64.parse(ctB64);
  
    const key = CryptoJS.PBKDF2(passphrase, salt, {
      keySize: this.KEY_SIZE,
      iterations: this.PBKDF2_ITERS,
      hasher: this.DIGEST,
    });
  
    const dataForHmac = salt.clone().concat(iv).concat(ciphertext);
    const hmacCheck = CryptoJS.HmacSHA256(dataForHmac, key).toString(CryptoJS.enc.Base64);
    if (hmacCheck !== hmacB64) throw new Error('HMAC verification failed');
  
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext },
      key,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
  
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

}
