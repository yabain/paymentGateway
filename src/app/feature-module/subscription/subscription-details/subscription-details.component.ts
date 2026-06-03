import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from 'src/app/core/core.index';
import { Location } from '@angular/common';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
import { environment } from 'src/environments/environment.prod';
import { UserService } from 'src/app/services/user/user.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.scss'],
})
export class SubscriptionDetailsComponent {
  public routes = routes;
  url: string = '';
  subscriptionId: string = '';
  subscriberId: string = '';
  loadingData: boolean = true;
  items: any[] = [];
  raw: any = [];
  frontUrl: string = environment.frontUrl;
  userData: any;
  gettingUserData: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private subscriptionService: SubscriptionService,
    private userService: UserService,
    private router: Router
  ) {
    this.getId();
    this.scrollToTop();
  }

  getId() {
    this.url = this.location.path();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'null' && idParam !== 'undefined') {
     [this.subscriptionId, this.subscriberId] = idParam.split('&&');
    }
    this.getSubscriptionItems(this.subscriptionId, this.subscriberId);
    this.getUserData(this.subscriberId);
  }

  
  getUserData(userId) {
    this.gettingUserData = true;
    this.userService
      .getUser(userId)
      .pipe(
        catchError((error: any) => {
          this.gettingUserData = false;
          this.router.navigateByUrl('/dashboard');
          return of({
            error: true,
            message: error.message || 'An error occurred',
          });
        }),
      )
      .subscribe((user: any) => {
        this.userData = user;
        this.gettingUserData = false;
      });
  }

  scrollToTop(): void {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 100);
  }

  getSubscriptionItems(subscriptionId, subscriberId) {
    this.subscriptionService.getSubscriptionItems(subscriptionId, subscriberId)
      .subscribe((data: any) => {
        this.raw = data;
        this.items = data.map(item => ({
          title: item.plansId.title || '...', 
          dateStart: item.dateStart,
          dateEnd: item.dateEnd,
          color: '#058507'
        }));
        this.loadingData = false;
      });
  }

}
