import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { routes } from 'src/app/core/core.index';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
import { UserService } from 'src/app/services/user/user.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { FlutterwaveService } from 'src/app/services/flutterwave/flutterwave.service';
import { SystemService } from 'src/app/services/system/system.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { environment } from 'src/environments/environment';

interface data {
  value: string;
}
@Component({
  selector: 'app-subscriber-list',
  templateUrl: './subscriber-list.component.html',
  styleUrls: ['./subscriber-list.component.scss'],
})
export class SubscriberListComponent implements OnInit {
  isAdmin: boolean = false;
  @Input('subscribers') subscribers: any[] = [];


  constructor(
    private userService: UserService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private location: Location,
    private paymentService: PaymentService,
    private flutterwaveService: FlutterwaveService,
    private systemService: SystemService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
  }

  showName(userData) {
    return this.userService.showName(userData);
  }

  openSubscription(subscription, subscriberId){
    console.log('openSubscription', subscription, subscriberId);
    return this.navigateTo('/subscription/subscription-details/' + subscription + '&&' + subscriberId);
  }


  navigateTo(route) {
    this.router.navigate([route]);
  }

  public getDate(date: string) {
    return date.split('T')[0];
  }


  changeSubscriptionActiveStatus(subscriptionId: string) {
    this.subscriptionService.changeSubscriptionStatus(subscriptionId).then((res: any) => {
      this.toastService.presentToast('success', 'Done !', '', 3000);
    });
  }
}
