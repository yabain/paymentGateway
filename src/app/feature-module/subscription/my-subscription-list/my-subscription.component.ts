import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-my-subscription',
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.scss'],
})
export class MySubscriptionComponent implements OnInit {
  public searchDataValue = '';
  subscriptionList: any;
  currentUser: any;
  loading: boolean = true;


  constructor(
    private router: Router,
    private subscriptionService: SubscriptionService,
    private userService: UserService,
  ) {
    this.scrollToTop();
  }


  ngOnInit(): void {
    this.scrollToTop();
    this.getCurrentUser();
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


  async getCurrentUser() {
    this.currentUser = await this.userService.getCurrentUserData();
    // this.userData = await this.storage.getStorage(environment.user_data);
    if (this.currentUser) {
      console.log('current user: ', this.currentUser);
      this.getMySubscriptions(this.currentUser._id);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    // this.router.navigateByUrl('/' + route , { replaceUrl: true });
  }

  getMySubscriptions(userId) {
    this.loading = false;
    this.subscriptionService.getSubscriptionListBySubscriber(userId)
    .subscribe({
        next: (response) => {
          console.log('response', response);
          const hasError =
            !!response?.error ||
            (!!response?.statusCode && Number(response.statusCode) >= 400) ||
            response?.statusCode === 404;
          if (!hasError) {
            this.subscriptionList = response.data;
            console.log('subscription list: ', this.subscriptionList);
            this.loading = true;
          }
        },
        error: (error) => {
          console.log('error', error);
          this.loading = true;
        },
      });
  }
}
