import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { routes } from '../../core.index';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(private router: Router) {}

  canActivate(
  
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!localStorage.getItem(environment.user_data)) {
      this.router.navigate([routes.dashboard]);
      return false;
    } else {
      const user = JSON.parse(localStorage.getItem(environment.user_data));
      if(user.isAdmin) return true
      else return true;
    }
  }
}
