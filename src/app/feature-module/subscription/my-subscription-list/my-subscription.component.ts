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
  statistics: any;
  gettingStatistics: boolean = true;


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
    this.getMyStatistics();
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
    if (this.currentUser) {
      this.getMySubscriptions(this.currentUser._id);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  getMySubscriptions(userId) {
    this.loading = true;
    this.subscriptionService.getSubscriptionListBySubscriber(userId)
    .subscribe({
        next: (response) => {
          const hasError =
            !!response?.error ||
            (!!response?.statusCode && Number(response.statusCode) >= 400) ||
            response?.statusCode === 404;
          if (!hasError) {
            this.subscriptionList = response;
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('error', error);
          this.loading = false;
        },
      });
  }

  getMyStatistics() {
    this.gettingStatistics = true;
    this.subscriptionService.getMySubscriptionStatistics()
    .subscribe({
        next: (response) => {
          const hasError =
            !!response?.error ||
            (!!response?.statusCode && Number(response.statusCode) >= 400) ||
            response?.statusCode === 404;
          if (!hasError) {
            this.statistics = response;
            this.gettingStatistics = false;
          }
        },
        error: (error) => {
          console.error('error', error);
          this.gettingStatistics = false;
        },
      });
  }
}
