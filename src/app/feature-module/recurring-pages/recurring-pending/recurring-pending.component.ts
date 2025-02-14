import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from 'src/app/shared/sharedIndex';
import { DataService, routes } from 'src/app/core/core.index';
import {
  apiResultFormat,
  pageSelection,
  pending,
} from 'src/app/core/models/models';

@Component({
  selector: 'app-recurring-pending',
  templateUrl: './recurring-pending.component.html',
  styleUrls: ['./recurring-pending.component.scss'],
})
export class RecurringPendingComponent {
  public recurringinvoice: Array<pending> = [];
  public Toggledata = false;
  isCollapsed = false;
  public routes = routes;
  // pagination variables
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  dataSource!: MatTableDataSource<pending>;
  public searchDataValue = '';
  //** / pagination variables

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.recurringpending) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });
  }

  private getTableData(pageOption: pageSelection): void {
    this.data.recurringPending().subscribe((apiRes: apiResultFormat) => {
      this.recurringinvoice = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: pending, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.id = serialNumber;
          this.recurringinvoice.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<pending>(this.recurringinvoice);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.recurringinvoice,
        serialNumberArray: this.serialNumberArray,
        tableData2: [],
      });
    });
  }

  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.recurringinvoice = this.dataSource.filteredData;
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

  isCollapsed1 = false;
  isCollapsed2 = false;

  users = [
    { name: 'Barbara Moore', checked: false },
    { name: 'Hendry Evan', checked: false },
    { name: 'Richard Miles', checked: false },
  ];
  users2 = [
    { name: 'Stationary', checked: false },
    { name: 'Medical', checked: false },
    { name: 'Designing', checked: false },
  ];

  toggleCollapse1() {
    this.isCollapsed1 = !this.isCollapsed1;
  }
  toggleCollapse2() {
    this.isCollapsed2 = !this.isCollapsed2;
  }
  public toggleData = false;
  openContent() {
    this.toggleData = !this.toggleData;
  }
}
