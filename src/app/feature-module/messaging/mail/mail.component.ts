import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { routes } from 'src/app/core/core.index';
import { SubscriptionService } from 'src/app/services/subscription/subscription.service';
import { UserService } from 'src/app/services/user/user.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Location } from '@angular/common';

interface data {
  value: string;
}
@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss'],
})
export class MailComponent implements OnInit {
  status: boolean = false;
  waitingData: boolean = false;
  constructor(
  ) {}

  ngOnInit(): void {
  }

  changeUserActiveStatus(){}

  refresh(){}
}