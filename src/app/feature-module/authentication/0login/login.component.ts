import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { AuthService, routes } from 'src/app/core/core.index';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isLoading: boolean = false;
  public routes = routes;
  public show_password = true;
  form = new FormGroup({
    email: new FormControl('', [Validators.required,  Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  constructor(
    private router: Router,
    private auth: AuthService,
    private userService: UserService,
    private storage: StorageService,
    private toastr: ToastrService) {

  }



  loginFormSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      this.auth.login(this.form.value)
        .then((res) => {
          console.log("res login: ", res);
          if (res.success === true){
            this.userService.getUserData(res.message)
            .pipe(take(1))
            .subscribe((data: any) => {
              if(data){
                console.log('data of getting userDaya: ',  JSON.stringify(data))
                this.storage.setStorage('user_data', JSON.stringify(data))
                this.toastr.success("Heureux de vous revoir!", "Bienvenue", {
                  timeOut: 7000,
                  closeButton: true,
                });
                this.router.navigate([routes.superAdminDashboard]);
                this.isLoading = false;
              } else {
                this.auth.logout()
                this.toastr.error(res.message, "Erreur", {
                  timeOut: 7000,
                  closeButton: true,
                });
                console.log('No userDaya: ')
                this.isLoading = false;
              }
              return;
            })
          } else {
            this.toastr.error(res.message, "Erreur", {
              timeOut: 7000,
              closeButton: true,
            });
            this.isLoading = false;
          }
        })
    } else {
      this.toastr.error("Veuillez vérifier vos données", "Formulaire invalide", {
        timeOut: 7000,
        closeButton: true,
      });
    }
  }
}
