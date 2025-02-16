import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication.component';

const routes: Routes = [
  {
    path: '',
    component: AuthenticationComponent,
    children: [
      {
        path: '',
        redirectTo: 'loginAdmin123',
        pathMatch: 'full',
      },
      {
        path: 'loginAdmin123',
        loadChildren: () =>
          import('./login/login.module').then((m) => m.LoginModule),
      },
      {
        path: 'registerAdmin123',
        loadChildren: () =>
          import('./register/register.module').then((m) => m.RegisterModule),
      },
      {
        path: 'lock-screen',
        loadChildren: () =>
          import('./lock-screen/lock-screen.module').then(
            (m) => m.LockScreenModule,
          ),
      },
      {
        path: 'forgot-password',
        loadChildren: () =>
          import('./forgot-password/forgot-password.module').then(
            (m) => m.ForgotPasswordModule,
          ),
      },
      {
        path: 'sass-login',
        loadChildren: () =>
          import('./sass-login/sass-login.module').then(
            (m) => m.SassLoginModule,
          ),
      },
      {
        path: 'sass-register',
        loadChildren: () =>
          import('./sass-register/sass-register.module').then(
            (m) => m.SassRegisterModule,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
