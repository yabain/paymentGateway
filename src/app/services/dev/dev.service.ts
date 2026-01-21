
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage.service';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})

// Service to set initial demo data in database
export class DevService {

  constructor(
    // private router: Router,
    // private storage: StorageService,
    // private authService: AuthService,
    private apiService: ApiService
  ) {
  }

  async getMyKeys(): Promise<any> {
    try {
      const response = await this.apiService.getWithoutId('dev/my-key').toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching users stats:', error);
      throw error;
    }
  }

  async updateKeyStatus(status): Promise<any> {
    try {
      const response = await this.apiService.updateWithoutId(`dev/update-key`, {status}).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching users stats:', error);
      throw error;
    }
  }

  async generateKey()
  {
    try {
      const response = await this.apiService.postWithoutData(`dev/generate-key`).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching users stats:', error);
      throw error;
    }
  }

  async removeKey(id): Promise<any> {
    try {
      const response = await this.apiService.delete(`dev/key/${id}`, id).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching users stats:', error);
      throw error;
    }
  }
}
