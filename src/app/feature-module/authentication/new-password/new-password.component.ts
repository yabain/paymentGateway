import { Component} from '@angular/core';
import { routes } from 'src/app/core/core.index';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
})
export class NewPasswordComponent  {
  public routes = routes;
}
