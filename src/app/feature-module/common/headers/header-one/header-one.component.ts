import { Component, OnInit } from '@angular/core';

import { AuthService, routes } from 'src/app/core/core.index';
import { SideBarService } from 'src/app/core/services/side-bar/side-bar.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss'],
})
export class HeaderOneComponent implements OnInit  {
  userData: any = [];
  public miniSidebar = false;
  public headerSidebarStyle = '1';
  public routes = routes;
  elem=document.documentElement

  constructor(
    private auth: AuthService,
    private sideBar: SideBarService,
    private storage: StorageService
  ) {
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    this.sideBar.headerSidebarStyle.subscribe((res: string) => {
      this.headerSidebarStyle = res;
    });
  }
 

  ngOnInit(): void {
      this.getUserData();
  }

  public logOut(): void {
    this.auth.logout();
  }

  public toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }

  public toggleMobileIcon(): void {
    this.sideBar.switchMobileSideBarPosition();
  }

  getUserData(){
    this.userData = this.storage.getStorage('user_data');
    if(this.userData){
      this.userData = JSON.parse(this.userData);
    }
  }

  fullscreen() {
    if(!document.fullscreenElement) {
      this.elem.requestFullscreen();
    }
    else {
      document.exitFullscreen();
    }
  }
}
