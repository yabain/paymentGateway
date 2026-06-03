import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { routes } from '../../core.index';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  constructor(private router: Router) {}
  canActivate(
 
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (localStorage.getItem('authenticated')) {
      if (
        localStorage.getItem('mustChangePassword') === 'true' &&
        this.router.url !== '/auth/force-password-change'
      ) {
        this.router.navigate(['/auth/force-password-change']);
        return false;
      }
      return true;
    } else {
      this.router.navigate([routes.login]);
      return false;
    }
  }
}
