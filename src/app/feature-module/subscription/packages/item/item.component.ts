import { Component, Input, OnInit } from '@angular/core';

interface data {
  value: string;
}
@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit {
  @Input() plan: any;
  @Input() currentUser: any;
  optionsData: any = [];

  constructor(
  ) {}

  ngOnInit(): void {
    console.log('plan: ', this.plan);
    this.optionsData = this.plan ? this.plan.options : [];
  }


}
