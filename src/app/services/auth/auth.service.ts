import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { User } from './user.data';
import { environment } from 'src/environments/environment';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public checkAuth: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('authenticated') || 'false',
  );

  constructor(
    private router: Router,
    private storage: StorageService,
    private apiService: ApiService,
  ) {}

  register(formValue: any): Observable<any> {
    const data: User = {
      ...formValue,
      pictureUrl: 'assets/imgs/pictures/user.png',
    };

    return from(this.apiService.create(`auth/signup`, data)).pipe(
      map((user) => {
        this.storage.setStorage(environment.user_key, user.userData._id);
        this.storage.setStorage('token', user.token);
        return user.userData;
      }),
      catchError((error) => {
        console.error('Erreur lors de l’inscription:', error);

        const message =
          error?.error?.message || error?.message || 'Une erreur est survenue';

        return throwError(() => new Error(message));
      }),
    );
  }

  /**
   * Authenticates a user using the provided form values.
   * @param formValue The form data containing email and password.
   * @returns A promise resolving to the user's UID or rejecting with an error.
   */
  login(formValue): Promise<any> {
    console.log('login in service', formValue);
    return new Promise((resolve, reject) => {
      try {
        this.apiService.post('auth/signin', formValue).subscribe(
          (user: any) => {
            this.checkAuth.next('true');
            localStorage.setItem('authenticated', 'true');
            localStorage.setItem('timeOut', Date());
            localStorage.setItem('layoutPosition', '1');
            if (user) {
              console.log('token: ', user.token);
              this.storage.setStorage(environment.user_key, user.userData._id);
              this.storage.setStorage('token', JSON.stringify(user.token));
              resolve(user.userData); // Résoudre la Promise avec user.userData
            } else {
              resolve(false); // Résoudre la Promise avec false
            }
          },
          (error) => {
            reject(error); // Rejeter la Promise en cas d'erreur
          },
        );
      } catch (e) {
        reject(e); // Rejeter la Promise en cas d'exception
      }
    });
  }

  getUser(id: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      try {
        this.apiService.getById(`user`, id).subscribe((user: any) => {
          if (user) {
            resolve(user);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Logs out the user, clears stored user data, and redirects to the home page.
   * @returns A promise that resolves once the logout and redirect are complete.
   */
  async logout() {
    console.log('logout action initiated');
    this.storage.removeStorage(environment.user_key);
    this.storage.removeStorage(environment.user_data);
    this.storage.removeStorage('authenticated');
    this.storage.removeStorage('timeOut');
    setTimeout(() => {
      this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      // window.location.reload();
    }, 2000);
    try {
      this.apiService
        .create('auth/logout', {
          token: await this.storage.getStorage('token'),
        })
        .subscribe((res) => {
          this.storage.removeStorage('token');
          console.log('logout true');
          return true;
        });
    } catch (e) {
      console.log('logout error');
      console.error('Error during logout:', e);
      throw e;
    }
  }

  sendPasswordResetEmail(email): Observable<any> {
    return this.apiService.create('auth/request-password-reset', { email });
  }

  resetPassword(data): Observable<any> {
    return this.apiService.create('auth/reset-password', data);
  }

  /**
   * Redirects to the authentication screen.
   */
  navigate() {
    this.router.navigateByUrl('/auth-screen', { replaceUrl: true });
  }

  async refreshToUpgrade() {
    try {
      await this.storage.removeStorage(environment.countries_data);
      await this.storage.removeStorage(environment.cities_data);
      await this.storage.removeStorage(environment.categories_data);
      await this.storage.removeStorage(environment.appVersion);

      setTimeout(() => {
        this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
        setTimeout(() => {
          window.location.reload();
        }, 50);
        return true;
      }, 3000);
    } catch (e) {
      console.error('Error during logout:', e);
      throw e;
    }
  }

  verifyResetPwdToken(token): Observable<string> {
    return this.apiService.create('auth/verify-token', { token });
  }
}
