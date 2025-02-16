import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { routes, DataService } from 'src/app/core/core.index';
import {
  companies,
} from 'src/app/core/models/models';
import { PaginationService, tablePageSize } from 'src/app/shared/sharedIndex';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FacturationService } from 'src/app/core/services/facturation/facturation.service';

@Component({
  selector: 'app-facturation',
  templateUrl: './facturation.component.html',
  styleUrls: ['./facturation.component.scss'],
})

export class FacturationComponent implements OnInit {
  isLoading: boolean = false;
  public routes = routes;
  public tableData: any = [];
  // pagination variables
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<companies>;
  // pagination variables end

  form = new FormGroup({
    email: new FormControl('', [Validators.email]),
    name: new FormControl(''),
    phone: new FormControl(''),
    service: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    language: new FormControl('fr', [Validators.required]),
    currency: new FormControl('FCFA', [Validators.required]),
    payment: new FormControl('', [Validators.required]),
    rest: new FormControl('0', [Validators.required]),
    ir: new FormControl(true),
    yn: new FormControl(false),
    status: new FormControl(false),
  });

  constructor(
    private pagination: PaginationService,
    private toastr: ToastrService,
    private facturationService: FacturationService,
    private router: Router
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.companies) {
        this.pageSize = res.pageSize;
      }
    });
  }

  ngOnInit(): void {
    this.getAllInvoiceData();
  }

  getAllInvoiceData() {
    this.tableData = [];
    this.facturationService.getAllInvoiceData()
      .subscribe((res: any) => {
        console.log('les datas du res: ', res)
        if (res) {
          this.tableData = res
        }
      })
  }

  submit() {
    if (!this.form.valid) {
      this.toastr.error('Formulaire invalid', "Erreur", {
        timeOut: 10000,
        closeButton: true,
      });
      return
    }
    this.isLoading = true;
    this.facturationService.creatInvoice(this.form.value)
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

  public sortData(sort: Sort) {
    const data = this.tableData.slice();

    if (!sort.active || sort.direction === '') {
      this.tableData = data;
    } else {
      this.tableData = data.sort((a: any, b: any) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }
  isCollapsed1 = false;

  users = [
    { name: 'Sumo Soft Limited', checked: false },
    { name: 'Repair Group Co', checked: false },
  ];

  toggleCollapse1() {
    this.isCollapsed1 = !this.isCollapsed1;
  }
  public toggleData = false;
  openContent() {
    this.toggleData = !this.toggleData;
  }

  public password: boolean[] = [false];

  public togglePassword(index: any) {
    this.password[index] = !this.password[index]
  }
  phoneForm = new FormGroup({
    phone: new FormControl(undefined, [Validators.required]),
  });
}
