import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService, routes } from 'src/app/core/core.index';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  isLoading: boolean = false
  public isValidConfirmPassword = false;
  public CustomControler: undefined;
  public routes = routes;

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
    picture: new FormControl('assets/imgs/pictures/user.png'),
    status: new FormControl(true),
    verified: new FormControl(false),
  });

  
  get f() {
    return this.form.controls;
  }

  constructor(
    private router: Router,
    private auth: AuthService,
    private toastr: ToastrService) { }


  submit() {
    if (!this.form.valid) {
      console.log('formulaire invalide')
      return;
    }
    if (this.form.value.password != this.form.value.confirmPassword) {
      this.toastr.error('Les mot de passe ne correspond pas, vériviez les champs.', "Erreur", {
        timeOut: 10000,
        closeButton: true,
      });
      this.isValidConfirmPassword = true;
    } else {
      this.isLoading = true;
      this.isValidConfirmPassword = false;
      console.log('valeur du form: ', this.form.value)
      this.auth.register(this.form.value)
        .subscribe((res: any) => {
          console.log("res login: ", res);
          if (res.success === true) {
            this.toastr.success(res.message, "Succès", {
              timeOut: 7000,
              closeButton: true,
            });
          } else {
            this.toastr.error(res.message, "Erreur", {
              timeOut: 7000,
              closeButton: true,
            });
          }
          this.isLoading = false;
        })
    }
  }
}
