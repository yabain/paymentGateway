
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage.service';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

// Service to set initial demo data in database
export class ApiService {

  private apiUrl = environment.backendUrl; // URL of backend
  token: any;

  constructor(private http: HttpClient, private storage: StorageService) {
  }

  getToken(): Promise<string> {
    return this.storage.getStorage('token');
    // return this.storage.getStorage('token')
    //   .then((token: any) => {
    //     if (token) {
    //       token = token.replace('"', '');
    //       token = token.replace('"', '');
    //       return token
    //     } else return '';
    //   })
  }

  get(endpoint: string, id?: string): Observable<any[]> {
    if (id) return this.http.get<any[]>(`${this.apiUrl}/${endpoint}/${id}`);
    else return this.http.get<any[]>(`${this.apiUrl}/${endpoint}`);
  }

  getWithToken(endpoint: string, id?: string): Observable<any[]> {

    return from(this.getToken()).pipe(
      switchMap((token: string) => {
        // console.log('le token: ', token)
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        if (id) return this.http.get<any[]>(`${this.apiUrl}/${endpoint}/${id}`, { headers });
        else return this.http.get<any[]>(`${this.apiUrl}/${endpoint}`, { headers });
      })
    );
  }
  
  progressiveGetWithoutId(endpoint: string, page?: number, keyword?: string): Observable<any[]> {
  let params = new HttpParams();

  if (page !== undefined) {
    params = params.set('page', page.toString());
  }
  if (keyword) {
    params = params.set('keyword', keyword);
  }

  return from(this.getToken()).pipe(
    switchMap((token: string) => {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      return this.http.get<any[]>(`${this.apiUrl}/${endpoint}`, {
        headers: headers,
        params: params
      });
    })
  );
}


  progressiveGetWithId(endpoint: string, id?: string, page?: number, keyword?: string): Observable<any[]> {
    let params = new HttpParams();
    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<any[]>(`${this.apiUrl}/${endpoint}/${id}`, { params });
  }

  progressiveGetWith2Id(endpoint: string, id?: any, id2?: string, page?: number): Observable<any[]> {
    let params = new HttpParams();
    if (id2) {
      params = params.set('cityId', id2);
    }
    if (page !== undefined) {
      params = params.set('page', page.toString());
    }

    return this.http.get<any[]>(`${this.apiUrl}/${endpoint}/${id}`, { params });
  }

  getById(endpoint: string, id: any, params?): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap((token: string) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.get<any>(`${this.apiUrl}/${endpoint}/${id}`, { headers, params });
      })
    );
  }

  getWithoutId(endpoint: string, params?): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap((token: string) => {
        // console.log('le token: ', token)
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.get<any>(`${this.apiUrl}/${endpoint}`, { headers, params });
      })
    );
  }

  create(endpoint: string, data: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap((token: any) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(`${this.apiUrl}/${endpoint}`, data, { headers });
      })
    );
  }

  post(endpoint: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${endpoint}`, data);
  }

  postWithoutData(endpoint: string): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap((token: any) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(`${this.apiUrl}/${endpoint}`, { headers });
      })
    );
  }

  update(endpoint: string, id: string, data: any): Observable<any> {
    console.log('ici continu')
    return from(this.getToken()).pipe(
      switchMap((token: any) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        // console.log('apiUpdate: ', endpoint);
        return this.http.put<any>(`${this.apiUrl}/${endpoint}/${id}`, data, { headers });
      })
    );
  }

  updateWithoutId(endpoint: string, data: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap((token: any) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        // console.log('apiUpdate: ', endpoint);
        return this.http.put<any>(`${this.apiUrl}/${endpoint}`, data, { headers });
      })
    );
  }

  uploadPicture(endpoint: string, data: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap((token: any) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, let browser set it for FormData
        });
        console.log('Uploading to:', `${this.apiUrl}/${endpoint}`);
        console.log('FormData entries:');
        for (let pair of data.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
        return this.http.put<any>(`${this.apiUrl}/${endpoint}`, data, { headers });
      })
    );
  }

  // Supprimer un élément
  // delete(endpoint: string, id: string): Observable<void> {
  //   const token = this.storage.getStorage('token');

  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`
  //   });

  //   console.log('apiDelete: ', endpoint);
  //   return this.http.delete<void>(`${this.apiUrl}/${endpoint}/${id}`, { headers: headers });
  // }

  delete(endpoint: string, id: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap((token: string) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.delete<void>(`${this.apiUrl}/${endpoint}/${id}`, { headers });
      })
    );
  }
}
