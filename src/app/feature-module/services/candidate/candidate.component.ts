import { Component, Input, OnInit } from '@angular/core';

interface data {
  value: string;
}
@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.scss'],
})
export class CandidateComponent implements OnInit {
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
