import { Component } from '@angular/core';
import { DataService, routes } from 'src/app/core/core.index';
import {
  pageSelection,
  apiResultFormat,
  customers,
} from 'src/app/core/models/models';
import { MatTableDataSource } from '@angular/material/table';

import { Sort } from '@angular/material/sort';
import { PaginationService, tablePageSize } from 'src/app/shared/sharedIndex';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
})
export class CustomerListComponent {
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

  // pagination variables
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  dataSource!: MatTableDataSource<customers>;
  public searchDataValue = '';
  public gettingUsers: boolean = true;
  //** / pagination variables
  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private toastService: ToastService,
    private userService: UserService
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.customerList) {
        this.getUsers({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });
    this.searchTerms.pipe(
      debounceTime(300),              // attendre 300ms après la dernière frappe
      distinctUntilChanged(),         // ignorer si le mot est identique
      switchMap(term => this.userService.filterItems(term))
    ).subscribe((userData: any) => {
      this.handleUser({ skip: 0, limit: 10 }, userData);
    });
  }

  refresh(){
        this.getUsers({ skip: 0, limit: 10 });
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
    return date.split('T')[0];
  }

  public getUsersNumber(){
    return this.customers.length;
  }

  public getActiveUsersNumber(){
    const active = this.customers.filter(invoice => invoice.isActive != false);
    return active.length;
  }

  public getDesctiveUsersNumber(){
    const active = this.customers.filter(invoice => invoice.isActive === false);
    return active.length;
  }

  public getAdminUsersNumber(){
    const active = this.customers.filter(invoice => invoice.isAdmin === true);
    return active.length;
  }

  // searchUser(searchText: any){
  //   this.userService.filterItems(searchText)
  //   .subscribe((userData: any) => {
  //     this.handleUser({ skip: 0, limit: 10 }, userData);
  //   })
  // }
  searchUser(term: string): void {
    this.searchTerms.next(term);
  }

  toggleSearch(){
    this.activeSearch = !this.activeSearch;
  }

  changeUserActiveStatus(userId?: string){
    const userid = userId ? userId : this.selectedUser._id
    this.userService.changeStatus(userid)
    .then((res: any) => {
      this.handleUser({ skip: 0, limit: 10 }, res);
      this.toastService.presentToast('success', 'Done !', '', 3000);
    })
  }

  changeUserAdminStatus(userId?: string){
    const userid = userId ? userId : this.selectedUser._id
    this.userService.changeAdminStatus(userid)
    .then((res: any) => {
      this.handleUser({ skip: 0, limit: 10 }, res);
      this.toastService.presentToast('success', 'Done !', '', 3000);
    })
  }


  changeUserVerifiedStatus(userId?: string){
    const userid = userId ? userId : this.selectedUser._id
    this.userService.changeVerifiedStatus(userid)
    .then((res: any) => {
      this.handleUser({ skip: 0, limit: 10 }, res);
      this.toastService.presentToast('success', 'Done !', '', 3000);
    })
  }

  public getUsers(pageOption: pageSelection){
    this.gettingUsers = true;
    this.userService.getAllUser()
    .subscribe((resp: any) => {
      this.handleUser(pageOption, resp);
    })
  }

  handleUser(pageOption: pageSelection, resp){
      this.customers = [];
      this.serialNumberArray = [];
      this.totalData = resp.length;
      resp.map((res: customers, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.id = serialNumber;
          this.customers.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<customers>(this.customers);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.customers,
        serialNumberArray: this.serialNumberArray,
        tableData2: [],
      });
      this.gettingUsers = false;
    }

  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.customers = this.dataSource.filteredData;
  }

  public sortData(sort: Sort) {
    const data = this.customers.slice();

    if (!sort.active || sort.direction === '') {
      this.customers = data;
    } else {
      this.customers = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  openContent() {
    this.toggleData = !this.toggleData;
  }
  users = [
    { name: 'Pricilla Maureen', checked: false },
    { name: 'Randall Hollis', checked: false },
  ];

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
