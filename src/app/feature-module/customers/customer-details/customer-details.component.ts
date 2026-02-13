import { Component, OnDestroy, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Subject, takeUntil, of } from 'rxjs';
import { DataService, routes } from 'src/app/core/core.index';
import { UserService } from 'src/app/services/user/user.service';
import {
  apiResultFormat,
  pageSelection,
  recurringinvoice,
} from 'src/app/core/models/models';
import { ToastService } from 'src/app/services/toast/toast.service';
import { BalanceService } from 'src/app/services/balance/balance.service';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss'],
})
export class CustomerDetailsComponent implements OnInit, OnDestroy {
  public recurringinvoice: Array<recurringinvoice> = [];
  public routes = routes;
  public Toggledata = false;
  dataSource!: MatTableDataSource<recurringinvoice>;
  public searchDataValue = '';
  // pagination variables
  public lastIndex = 0;
  public pageSize = 10;
  public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<pageSelection> = [];
  public totalPages = 0;
  balance: number;

  private destroy$ = new Subject<void>();
  gettingUserData: boolean = true;
  userData: any;
  userId!: string;
  cover: string = "assets/img/resources/cover.png";
  currentUser: any;

  constructor(
    private data: DataService,
    private route: ActivatedRoute,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router,
    private balanceService: BalanceService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.getId();
    });
    this.getTableData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getId(): void {
    let idParam: any = this.router.url;
    idParam = idParam.split('/')[3];
    if (!idParam) {
      this.router.navigate(['/dashboard']);
    }
    this.userId = idParam;
    this.getUserData(idParam);
    this.getCurrentUser()
  }

  getUserData(userId) {
    this.gettingUserData = true;
    this.userService
      .getUser(userId)
      .pipe(
        catchError((error: any) => {
          console.log('error: ', error);
          this.gettingUserData = false;
          this.router.navigateByUrl('/dashboard');
          return of({
            error: true,
            message: error.message || 'An error occurred',
          });
        }),
      )
      .subscribe((user: any) => {
        this.userData = user;
        console.log('userData: ', this.userData)
        this.gettingUserData = false;
      });
  }

  getBalance(userId) {
    this.balanceService.getBalance(userId)
      .subscribe((data: any) => {
        this.balance = data ? data.balance : 0;
        console.log('balance: ', data)
      })
  }

  refresh() {
    this.getUserData(this.userId);
    this.getCurrentUser()
  }
  getName() {
    return this.userService.showName(this.userData);
  }

  changeUserActiveStatus(userId?: string) {
    const userid = userId ? userId : this.userData._id;
    this.userService.changeStatus(userid).then((res: any) => {
      this.getUserData(this.userId);
      this.toastService.presentToast('success', 'Done !', '', 3000);
    });
  }

  changeUserAdminStatus(userId?: string) {
    const userid = userId ? userId : this.userData._id;
    this.userService.changeAdminStatus(userid).then((res: any) => {
      this.getUserData(this.userId);
      this.toastService.presentToast('success', 'Done !', '', 3000);
    });
  }

  changeUserVerifiedStatus(userId?: string) {
    const userid = userId ? userId : this.userData._id;
    this.userService.changeVerifiedStatus(userid).then((res: any) => {
      this.getUserData(this.userId);
      this.toastService.presentToast('success', 'Done !', '', 3000);
    });
  }

  private getTableData(): void {
    this.recurringinvoice = [];
    this.serialNumberArray = [];

    this.data.recurringinvoice().subscribe((data: apiResultFormat) => {
      this.totalData = data.totalData;
      data.data.map((res: recurringinvoice, index: number) => {
        const serialNumber = index + 1;
        if (index >= this.skip && serialNumber <= this.limit) {
          res.recurringinvoice = serialNumber;
          this.recurringinvoice.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<recurringinvoice>(
        this.recurringinvoice,
      );
      this.calculateTotalPages(this.totalData, this.pageSize);
    });
  }

  public sortData(sort: Sort) {
    const data = this.recurringinvoice.slice();

    if (!sort.active || sort.direction === '') {
      this.recurringinvoice = data;
    } else {
      this.recurringinvoice = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }
  public getMoreData(event: string): void {
    if (event == 'next') {
      this.currentPage++;
      this.pageIndex = this.currentPage - 1;
      this.limit += this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableData();
    } else if (event == 'previous') {
      this.currentPage--;
      this.pageIndex = this.currentPage - 1;
      this.limit -= this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableData();
    }
  }

  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.skip = this.pageSelection[pageNumber - 1].skip;
    this.limit = this.pageSelection[pageNumber - 1].limit;
    if (pageNumber > this.currentPage) {
      this.pageIndex = pageNumber - 1;
    } else if (pageNumber < this.currentPage) {
      this.pageIndex = pageNumber + 1;
    }
    this.getTableData();
  }

  public PageSize(): void {
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.getTableData();
  }
  private calculateTotalPages(totalData: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = totalData / pageSize;
    if (this.totalPages % 1 != 0) {
      this.totalPages = Math.trunc(this.totalPages + 1);
    }
    for (let i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip: skip, limit: limit });
    }
  }

  open() {
    this.Toggledata = !this.Toggledata;
  }

  showName(userData: any): string {
    return this.userService.showName(userData);
  }

  whatsappUrl(whatsapp) {
    const data = whatsapp.replace(' ', '');
    return `https://wa.me/${data}`;
  }

  async getCurrentUser() {
    this.currentUser = await this.userService.getCurrentUser();
    console.log('currentUser: ', this.currentUser)
    if (this.currentUser.isAdmin) {
      this.getBalance(this.userId);
    }
  }
}
