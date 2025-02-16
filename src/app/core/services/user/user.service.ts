import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable, pipe, switchMap, take } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(
    private firestore: FirestoreService,
    private storage: StorageService,
    private authService: AuthService
  ) { }

  getUserData(userId: string): Observable<any> {
    return this.firestore.read(`users/${userId}`)
    // .pipe(take(1))
  }

  getCurrentUserData(): Observable<any> {
    let currentUserId = this.storage.getStorage('user_id');

    if (!currentUserId) {
      return from(this.authService.logout());
    } else {
      return this.firestore.read(`users/${currentUserId}`)
    }
  }

  getAllUserData(): Observable<any> {
    return this.firestore.getDocuments(`users`)
      .pipe(take(1))
  }

  createUser(userData: any) {
    this.firestore.create(`users/${userData.id}`, userData)
      .then(() => {
        return { success: true, message: 'Votre compte a bien été créé' }; // Emit the user data
      })
  }
}
