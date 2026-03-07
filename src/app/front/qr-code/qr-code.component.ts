import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent {
  @Input() data!: string;
  @Input() size: number = 100;
  @Input() color: string = "#000";

  constructor() { }
}
