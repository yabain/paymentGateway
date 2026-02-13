import { Component, OnInit} from '@angular/core';
import { SystemService } from 'src/app/services/system/system.service';
import { UserService } from 'src/app/services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
})
export class AuthenticationComponent  implements OnInit {

  segmentValue = '1';
  waitingData: boolean = true;

  constructor(
    private systemService: SystemService,
    private userService: UserService,
    private router: Router
  ) {
  }

  async ngOnInit() {
    let user = await this.userService.getCurrentUser();
    user = user != undefined ? true : false;
    if (user) this.navigateTo('/tabs');
    console.log('isUserConnected', user);
    this.systemService.getRacineToshare()
      .then(data => {
        if (data) {
          this.waitingData = false;
        }
      }).catch ((error: any) => {
        console.log('error: ', error)
        this.waitingData = false;
      });
  }

  /**
   * Navigates to the forgot password screen
   */
  navigateTo(route) {
    this.router.navigate([route]);
  }

  segmentChanged(event) {
    // console.log(event);
    this.segmentValue = event.detail.value;
  }

}
