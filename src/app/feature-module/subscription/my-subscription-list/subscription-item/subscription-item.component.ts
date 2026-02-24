import { Component, Input, OnInit } from '@angular/core';

interface data {
  value: string;
}
@Component({
  selector: 'app-subscription-item',
  templateUrl: './subscription-item.component.html',
  styleUrls: ['./subscription-item.component.scss'],
})
export class SubscriptionItemComponent implements OnInit {
  @Input() plan: any;
  @Input() currentUser: any;
  optionsData: any = [];

  constructor(
  ) {}

  ngOnInit(): void {
    // console.log('plan: ', this.plan);
    this.optionsData = this.plan ? this.plan.options : [];
  }
}
