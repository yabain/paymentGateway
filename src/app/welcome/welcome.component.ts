import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-intro',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(
    private router: Router,
  ) {
  }

  /**
   * Initializes the component. Sets up animations and checks if intro has been seen.
   */
  ngOnInit(): void {
  }

}
