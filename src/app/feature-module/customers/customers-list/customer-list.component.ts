import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService, routes } from 'src/app/core/core.index';
import {
  pageSelection,
  apiResultFormat,
  customers,
} from 'src/app/core/models/models';
import { MatTableDataSource } from '@angular/material/table';

import { Sort } from '@angular/material/sort';
import { PaginationService, tablePageSize } from 'src/app/shared/sharedIndex';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
import { DateService } from 'src/app/services/pipe/date.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
})
export class CustomerListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  // public customers: Array<customers> = [];
  public customers: Array<any> = [];
  isCollapsed = false;
  public showContent = false;
  public routes = routes;
  public toggleData = false;
  selectedUser!: any;
  activeSearch: boolean = false;
  searchString: string = '';
  private searchTerms = new Subject<string>();
  private pollTimer: any;
  public searchDataValue = '';
  public gettingUsers: boolean = true;
  page: number = 1;
  metadata: any;
  currentUser: any;
  //** / pagination variables
  constructor(
    private route: ActivatedRoute,
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private toastService: ToastService,
    private userService: UserService,
    private dateService: DateService,
  ) {
  }

  refresh() {
    this.customers = [];
    this.getCurrentUser();
  }

  getData() {
    this.getUsersList(this.page);
  }
  
  getUsersList(page: number = 1) {
    this.gettingUsers = true;
    this.startPolling(page);
  }
  // private getTableData(pageOption: pageSelection): void {
  //   this.data.getCustomers().subscribe((apiRes: apiResultFormat) => {
  //     this.customers = [];
  //     this.serialNumberArray = [];
  //     this.totalData = apiRes.totalData;
  //     apiRes.data.map((res: customers, index: number) => {
  //       const serialNumber = index + 1;
  //       if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
  //         res.id = serialNumber;
  //         this.customers.push(res);
  //         this.serialNumberArray.push(serialNumber);
  //       }
  //     });
  //     this.dataSource = new MatTableDataSource<customers>(this.customers);
  //     this.pagination.calculatePageSize.next({
  //       totalData: this.totalData,
  //       pageSize: this.pageSize,
  //       tableData: this.customers,
  //       serialNumberArray: this.serialNumberArray,
  //       tableData2: [],
  //     });
  //   });
  // }

  selectUser(user){
    this.selectedUser = user;
  }

  public getUserName(userData){
    return this.userService.showName(userData);
  }
  
  public getDate(date: string){
    console.log('currentUser: ', this.currentUser)
    return this.dateService.formatDate(date,'short', this.currentUser.language);
  }

  async getCurrentUser() {
    this.currentUser = await this.userService.getCurrentUser();
    console.log('currentUser 00: ', this.currentUser)
    this.getData();
  }
  public getUsersNumber(){
    return this.customers.length;
  }

  searchUser(searchText: any){
    this.userService.filterItems(searchText)
    .subscribe((userData: any) => {
      this.customers = userData;
      // this.handleUsers({ skip: 0, limit: 10 }, userData);
    })
  }

  toggleSearch(){
    this.activeSearch = !this.activeSearch;
    // this.searchData('');
  }

  changeUserActiveStatus(userId?: string){
    const userid = userId ? userId : this.selectedUser._id
    this.userService.changeStatus(userid)
    .then((res: any) => {
      // this.handleUsers({ skip: 0, limit: 10 }, res);
      this.toastService.presentToast('success', 'Done !', '', 3000);
    })
  }

  changeUserAdminStatus(userId?: string){
    const userid = userId ? userId : this.selectedUser._id
    this.userService.changeAdminStatus(userid)
    .then((res: any) => {
      // this.handleUsers({ skip: 0, limit: 10 }, res);
      this.toastService.presentToast('success', 'Done !', '', 3000);
    })
  }

  changeUserVerifiedStatus(userId?: string){
    const userid = userId ? userId : this.selectedUser._id
    this.userService.changeVerifiedStatus(userid)
    .then((res: any) => {
      // this.handleUsers({ skip: 0, limit: 10 }, res);
      this.toastService.presentToast('success', 'Done !', '', 3000);
    })
  }

  // public searchData(value: string): void {
  //   if (value) {
  //     value = value.trim().toLowerCase();
  //     this.customers = this.plansListBackup.filter(
  //       (plan: any) =>
  //         plan.title.toLowerCase().includes(value) ||
  //         plan.subTitle.toLowerCase().includes(value) ||
  //         plan.description.toLowerCase().includes(value),
  //     );
  //   } else return (this.plansList = this.plansListBackup);
  // }

  openContent() {
    this.toggleData = !this.toggleData;
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.getCurrentUser();
    });
  }  

  async startPolling(page: number = 1) {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(async () => {
      try {
        this.userService.getAllUser(page).subscribe({
          next: (res: any) => {
            this.customers = res.data;
            console.log('UsersList: ', this.customers);
            this.metadata = res.pagination;
            this.gettingUsers = false;
          },
          error: (err) => {
            this.gettingUsers = false;
            console.log(err);
          },
        });
        // console.log('polling');
      } catch (err) {
        console.warn('polling error', err);
      }
    }, 15 * 1000);
  }
  
  previousPage() {
    if (this.page < 2) {
      this.page = 1;
      return false;
    }
    this.page -= 1;
    this.gettingUsers = true;
    this.customers = [];
    this.scrollToTop();
    return this.getUsersList(this.page);
  }

  nextPage() {
    if (this.customers.length < 10) {
      return false;
    }
    this.page += 1;
    this.gettingUsers = true;
    this.customers = [];
    this.scrollToTop();
    return this.getUsersList(this.page);
  }

  scrollToTop(): void {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 100);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
