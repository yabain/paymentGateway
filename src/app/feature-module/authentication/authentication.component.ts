import { Component, OnInit} from '@angular/core';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
})
export class AuthenticationComponent  implements OnInit {

  segmentValue = '1';
  networkError: boolean = false;
  idrate: boolean;
  wattingData: boolean = true;

  constructor(
    private systemService: SystemService,
  ) {
  }

  ngOnInit() {
    this.systemService.getRacineToshare()
      .then(data => {
        if (data) {
          this.idrate = true;
          this.checkNetwork();
          this.wattingData = false;
        }
      }). catch ((error: any) => {
        console.log('error: ', error)
        this.wattingData = false;
        this.networkError = true;
        this.checkNetwork();
      });
  }

  segmentChanged(event) {
    // console.log(event);
    this.segmentValue = event.detail.value;
  }

  checkNetwork() {
    setTimeout(() => {
      if (this.idrate) {
        this.networkError = false;
      } else {
        this.networkError = true;
        this.checkNetwork();
      }
    }, 8000)
  }

}
