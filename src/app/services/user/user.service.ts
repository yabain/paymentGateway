import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api/api.service';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private router: Router,
    private storage: StorageService,
    private authService: AuthService,
    private apiService: ApiService
  ) {

  }

  /**
   * Retrieves the current user data from storage.
   * @returns The user data if available, otherwise undefined.
   */
  async getCurrentUser() {
    try {
      let user: any = await this.storage.getStorage(environment.user_data);
      return user ? JSON.parse(user) : undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  /**
   * Returns the user's name formatted for display, with a fallback to the username if no first or last name is provided.
   * @param userData - The user data object containing name information
   * @returns Formatted user name or username
   */
  showName(userData: any): string {
    if (userData?.accountType === 'personal') {
      return `${userData?.firstName} ${userData?.lastName}`
    }
    return userData?.name;
  }

  /**
   * Retrieves the current user ID from storage.
   * @returns The user ID if available, otherwise undefined.
   */
  async getCurrentUserId() {
    try {
      let user: any = await this.storage.getStorage(environment.user_key);
      return user || undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  /**
   * Sets the current user data in storage.
   * @param userData - The user data to store.
   */
  async setCurrentUser(userData: any) {
    try {
      await this.storage.setStorage(environment.user_data, JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Retrieves the profile picture of a user.
   * @param userId - The user ID.
   * @returns An observable of the user's profile picture.
   */
  getCurrentUserPicture(userId: string): Observable<any | undefined> {
    return this.apiService.getById(`user`, userId);
  }

  /**
   * Stores user data in the database.
   * @param userData - The user data to store.
   * @returns A promise that resolves when the data is set successfully.
   */
  async setUserData(userData: any): Promise<void> {
    try {
      await this.apiService.update(`users`, userData._id, userData);
    } catch (e) {
      console.error("Error setting user data:", e);
      throw e;
    }
  }

  /**
   * Retrieves data for a specified user.
   * @param uid - The user ID.
   * @returns An observable of the user's data.
   */
  getUser(userId: string): Observable<any | undefined> {
    return this.apiService.get(`user/user-data/${userId}`);
  }

  /**
   * Retrieves data for all users.
   * @returns An observable of all users' data.
   */
  getAllUser(page: number = 1): Observable<any> {
    return this.apiService.getWithoutId(`user/all-users` + '?page=' + page).pipe(
      map((res: any) => {
        if (res) {
          return res;
        }
        return false;
      }),
      catchError((err) => {
        console.error('Error getting favorites:', err);
        return of(false); // Emit false if there's an error
      }),
    );
  }

  /**
   * Updates the profile of a specified user.
   * @param userId - The user ID.
   * @param userData - The data to update.
   * @returns An observable indicating the success or failure of the update.
   */
  updateUserProfile(userData: any): Observable<any> {
    return from(this.apiService.updateWithoutId(`user/update-profile`, userData))
      .pipe(
        catchError(error => {
          return of({ error: true, message: error.message || 'An error occurred' });
        })
      );
  }

  updateUserItems(userData: any): Observable<any> {
    return from(this.apiService.updateWithoutId(`user/update-items`, userData))
      .pipe(
        catchError(error => {
          return of({ error: true, message: error.message || 'An error occurred' });
        })
      );
  }

  /**
   * Updates the profile picture of a specified user.
   * @param userId - The user ID.
   * @param userDataPicture - The new profile picture data.
   * @param picture - The file to upload.
   * @returns An observable indicating the success or failure of the update.
   */
  updateUserPicture(imageFile?: File): Observable<any> {
    const data = new FormData();
    if (imageFile) {
      data.append('pictureFile', imageFile);
    } else {
      return of({ error: true, message: 'No file provided' });
    }

    return from(this.apiService.uploadPicture('user/picture', data)).pipe(
      catchError(error => {
        return of({ error: true, message: error.message || 'An error occurred: update user\'s picture' });
      })
    );
  }

  updateUserCover(imageFile?: File): Observable<any> {
    const data = new FormData();
    if (imageFile) {
      data.append('coverFile', imageFile);
    } else {
      return of({ error: true, message: 'No file provided' });
    }

    return from(this.apiService.uploadPicture('user/cover', data)).pipe(
      catchError(error => {
        return of({ error: true, message: error.message || 'An error occurred: update user\'s cover' });
      })
    );
  }

  /**
   * Navigates to the login page.
   */
  navigate() {
    this.router.navigateByUrl('/auth-screen', { replaceUrl: true });
  }

  /**
   * Searches for users by their username, first name, or last name.
   * @param searchString - The string to filter users by.
   * @returns An observable of users filtered by the search string.
   */
  //// Event Search
  filterItems(searchString) {
    if (!searchString || searchString == '') {
      return this.apiService.progressiveGetWithoutId('user/research');
    }

    return this.apiService.progressiveGetWithoutId('user/research', 1, searchString);;
  }

  async getCurrentUserData(): Promise<any> {
    try {
      const storedUserData: any = await this.storage.getStorage(environment.user_data);
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        return userData;
      } else {
        const userId = await this.getCurrentUserId();
        if (userId) {
          const user = await this.getUser(userId).pipe(take(1)).toPromise();
          if (user) {
            this.setCurrentUser(user);
            return user;
          } else {
            this.authService.logout();
            return undefined;
          }
        } else {
          return undefined;
        }
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  returnNameMaxLength(name, length?: number) {
    if (!length) {
      length = 15;
    }
    if (name) {
      if (name.length > length) {
        return name.slice(0, length) + '...';
      } else {
        return name;
      }
    } else {
      return ''
    }
  }

  async getUsersStatistics(): Promise<any> {
    try {
      const response = await this.apiService.getWithoutId('user/users-stats').toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching users stats:', error);
      throw error;
    }
  }

  async changeStatus(userId): Promise<any> {
    try {
      const response = await this.apiService.update('user/update-status', userId, {}).toPromise();
      return response;
    } catch (error) {
      console.error('Error to change users status:', error);
      throw error;
    }
  }

  async changeAdminStatus(userId): Promise<any> {
    try {
      const response = await this.apiService.update('user/update-adminStatus', userId, {}).toPromise();
      return response;
    } catch (error) {
      console.error('Error to change admin status:', error);
      throw error;
    }
  }

  async changeVerifiedStatus(userId): Promise<any> {
    try {
      const response = await this.apiService.update('user/update-verifiedStatus', userId, {}).toPromise();
      return response;
    } catch (error) {
      console.error('Error to change verified status:', error);
      throw error;
    }
  }

  getStatistics(): Observable<boolean> {
    return this.apiService
      .getWithoutId('user/get-statistics')
      .pipe(
        map((res: any) => {
          if (res) {
            return res;
          }
          return false;
        }),
        catchError((err) => {
          console.error('Error getting statistics:', err);
          return of(false);
        }),
      );
  }
}
