import { Component, Input, OnInit } from '@angular/core';

interface data {
  value: string;
}
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  constructor(
  ) {}

  ngOnInit(): void {
  }
}
