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
  ngOnInit(): void {
    if (this.isUserConnected()) this.navigateTo('/tabs');
  }

  isUserConnected(): boolean {
    const user = this.userService.getCurrentUser();
    return !!user;
  }

  navigateTo(route) {
    this.router.navigate([route]);
  }
}
