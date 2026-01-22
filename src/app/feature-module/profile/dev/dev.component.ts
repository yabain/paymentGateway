import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CryptService } from 'src/app/services/crypt/crypt.service';
import { DevService } from 'src/app/services/dev/dev.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss'],
})
export class DevComponent implements OnInit {
  @Input('ableToShow') ableToShow: boolean = false;
  @Input('userData') userData: any;
  loading: boolean = true;
  updatingStatus: boolean = false;
  keyData: any;
  showKey: boolean = false;

  constructor(
    private Router: Router,
    private storage: StorageService,
    private toastr: ToastrService,
    private userService: UserService,
    private devService: DevService,
    private toastService: ToastService,
  ) {
  }


  ngOnInit(): void {
    if (this.ableToShow) this.getKeyData();
  }

  async getKeyData() {
    this.devService.getMyKeys()
      .then((data: any) => {
        if (data) {
          this.keyData = data;
          console.log('resp data', data);
        } else return null;
      }
      )
  }

  async updateKeyStatus() {
    this.updatingStatus = true;
    await this.devService.updateKeyStatus(!this.keyData.status)
      .then((data: any) => {
        console.log(data);
        this.getKeyData();
        this.updatingStatus = false;
      })
  }

  copy(data: string) {
    navigator.clipboard.writeText(data).then(() => {
      // Réinitialise le message après 2 secondes
      this.toastr.success('Copied to clipboard !');
    }).catch(err => {
      console.error('Impossible de copier : ', err);
    });
  }

  toggleShowKey() {
    this.showKey = !this.showKey;
  }

  async removeKey(id) {
    await this.devService.removeKey(id)
      .then((data: any) => {
        console.log(data);
        this.getKeyData();
      })
  }

  toggleStatus(){
    this.updatingStatus = true;
    this.devService.updateKeyStatus(!this.keyData.status)
      .then((data: any) => {
        console.log('data toggle status: ', data);
        if (data) {
          this.keyData = data;
          this.toastService.presentToast('success', 'Done !', '', 5 * 1000);
        } else return null;
        this.updatingStatus = false;
      })

  }

  async generateKey() {
    await this.devService.generateKey()
      .then((data: any) => {
        console.log(data);
        this.getKeyData();
      })
  }

}
