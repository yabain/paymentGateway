import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-api-doc',
  templateUrl: './api-doc.component.html',
  styleUrls: ['./api-doc.component.scss'],
})
export class ApiDocComponent {
  selectedSection = 'intro'
  email: string = environment.email;
  frontUrl: string = environment.frontUrl;

  constructor(private router: Router) {}
  
  selectSection(section: string){
    this.selectedSection = section;
  }

  navigateTo(url){
    this.router.navigate([url]);
  }
}
