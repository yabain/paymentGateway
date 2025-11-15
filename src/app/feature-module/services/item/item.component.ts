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
  @Input() service: any;
  optionsData: any = [];
  picture: string = 'assets/img/ressorces/generic.jpeg';

  constructor(
  ) {}

  ngOnInit(): void {
    // console.log('service: ', this.service);
    this.optionsData = this.service ? this.service.options : [];
  }


}
