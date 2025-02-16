import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, from, map, Observable, switchMap } from 'rxjs';
import { routes, SideBarService } from '../../core.index';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirestoreService } from '../firestore/firestore.service';
import { environment } from 'src/environments/environment';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  public checkAuth: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('authenticated') || "false"
  );

  constructor(
    private router: Router,
    private sidebar: SideBarService,
    private afAuth: AngularFireAuth,
    private firestore: FirestoreService,
    private storage: StorageService
  ) {}



  /**
   * Registers a new user using the provided form values, stores user data in Firebase and local storage.
   * @param userData The form data containing email, password, and other user details.
   * @returns A promise resolving to user data or rejecting with an error.
   */
  register(userData: any): Observable<any> {
    return from(this.afAuth.createUserWithEmailAndPassword(userData.email, userData.password)).pipe(
      switchMap((user: any) => {
        const uid = user.user.uid;
        userData.id = uid;
        userData.password = '*************'

        // Create user in Firestore and save data in storage
        return from(this.firestore.create(`users/${uid}`, userData)).pipe(
          map(() => {
            this.router.navigate([routes.login]);
            return { success: true, message: 'Votre compte a bien été créé' }; // Emit the user data
          })
        );
      }),
      catchError((error) => {
        console.error('Error during registration:', error);
        throw { success: false, message: 'Erreur lors de la création de compte.' }; // Re-emit the error for further handling
      })
    );
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn() {
    return this.afAuth.authState;
  }


  async login(formData: any): Promise<{ success: boolean, message: string }> {
    try {
      const result: any = await this.afAuth.signInWithEmailAndPassword(formData.email, formData.password);
      
      // Si la connexion réussit
      const uid = result.user.uid;
      this.checkAuth.next('true');
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('timeOut', Date());
      localStorage.setItem('layoutPosition', '1');
      console.log('login credentials: ', formData);
      this.storage.setStorage('user_id', uid);
  
      return { success: true, message: uid };
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue lors de la connexion.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email ou mot de passe incorrect.';
        console.log(errorMessage);
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Connexion impossible. Vérifiez votre connexion internet.';
      }
      return { success: false, message: errorMessage };
    }
  }

  public logout() {
    return this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
      this.router.navigate([routes.login]);
      this.checkAuth.next("false");
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
