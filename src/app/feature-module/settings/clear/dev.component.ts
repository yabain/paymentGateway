import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from 'src/app/services/storage/storage.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss'],
})
export class DevComponent implements OnInit {
  
  constructor(
    private Router: Router,
    private storage: StorageService,
    private toastr: ToastrService,
    private userService: UserService,
  ) {
  }

  ngOnInit(): void {
  }
 
}
