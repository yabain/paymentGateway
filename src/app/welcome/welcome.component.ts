import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-intro',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}
  async ngOnInit() {
    const res: boolean = await this.isUserConnected();
    console.log('isUserConnected: ', res);
    if (res === true ) this.navigateTo('/tabs');
  }

  async isUserConnected(): Promise<boolean> {
    const user = await this.userService.getCurrentUser();
    return !!user;
  }

  navigateTo(route) {
    this.router.navigate([route]);
  }
}
