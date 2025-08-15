import { Component, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { routes, SideBarService } from 'src/app/core/core.index';
import { UserService } from 'src/app/services/user/user.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  yaxis: ApexYAxis | any;
  xaxis: ApexXAxis | any;
  fill: ApexFill | any;
  tooltip: ApexTooltip | any;
  stroke: ApexStroke | any;
  legend: ApexLegend | any;
  title: ApexTitleSubtitle | any;
  colors: string[] | any;
  subtitle: ApexTitleSubtitle | any;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  currentUserData: any = [];
  userName: string = 'User';
  public routes = routes;
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public chartOptions2: Partial<ChartOptions>;
  public chartOptions3: Partial<ChartOptions>;

  public chartOptions4: Partial<ChartOptions>;
  public chartOptions5: Partial<ChartOptions>;
  public layoutPosition = '1';

  constructor(
    private sideBar: SideBarService,
    private userService: UserService,
  ) {
    this.initCharts();
    this.getUserData();
  }

  initCharts() {
    this.chartOptions = {
      series: [
        {
          name: 'Earnings ',
          data: [
            {
              x: 'Jan',
              y: 40,
            },
            {
              x: 'Feb',
              y: 38,
            },
            {
              x: 'Mar',
              y: 50,
            },
            {
              x: 'Apr',
              y: 85,
            },
            {
              x: 'May',
              y: 55,
            },
            {
              x: 'Jun',
              y: 45,
            },
            {
              x: 'Jul',
              y: 60,
            },
            {
              x: 'Aug',
              y: 40,
            },
            {
              x: 'Sep',
              y: 43,
            },
            {
              x: 'Oct',
              y: 30,
            },
            {
              x: 'Nov',
              y: 65,
            },
            {
              x: 'Dec',
              y: 50,
            },
          ],
        },
      ],
      chart: {
        type: 'bar',
        height: 250,
      },
      plotOptions: {
        bar: {
          columnWidth: '70%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: 'category',
        group: {
          style: {
            fontSize: '7px',
            fontWeight: 700,
          },
        },
      },
      fill: {
        colors: ['#021d66'],
      },
    };
    this.chartOptions2 = {
      series: [
        {
          name: 'Companies',
          data: [25, 40, 30, 55, 25, 35, 25, 50, 20],
        },
      ],
      chart: {
        height: 273,
        type: 'area',
        zoom: {
          enabled: false,
        },
      },
      fill: {
        colors: ['#FF9F43'],
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
        colors: ['#FF9F43'],
      },
      title: {
        text: '',
        align: 'left',
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
      },
      yaxis: {
        min: 10,
        max: 60,
        tickAmount: 5,
        labels: {
          formatter: (val: number) => {
            return val / 1 + 'K';
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
      },
    };
    this.chartOptions3 = {
      series: [
        {
          data: [400, 325, 312, 294, 254, 252],
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
      },
      plotOptions: {
        bar: {
          barHeight: '100%',
          distributed: true,
          horizontal: true,
        },
      },
      colors: [
        '#FFEFDD',
        '#EADDFF',
        '#DDF3FF',
        '#FFECEC',
        '#E1FFED',
        '#E0E0E0',
      ],
      dataLabels: {
        enabled: true,
        textAnchor: 'end',
        margin: 10,
        style: {
          colors: ['#1D1D1D'],
        },
        formatter: function (val: string, opt: any) {
          return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val;
        },
        offsetX: 0,
        dropShadow: {
          enabled: true,
        },
      },
      stroke: {
        width: 0,
        colors: ['#1D1D1D'],
      },
      xaxis: {
        categories: [
          'Sales : $6,100,00',
          'Sales : $5,100,00',
          'Sales : $4,200,00',
          'Sales : $3,400,00',
          'Sales : $3,400,00',
          'Sales : $400,00',
        ],
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false,
        },
        y: {
          title: {
            formatter: function () {
              return '';
            },
          },
        },
      },
    };
    this.chartOptions4 = {
      series: [
        {
          name: 'Received',
          data: [70, 150, 80, 180, 150, 175, 201, 60, 200, 120, 190, 160, 50],
          colors: ['#021d66'],
        },

        {
          name: 'Pending',
          data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16, 80],
          colors: ['#fda600'],
        },
      ],

      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 5,
          borderRadiusOnAllStackedSeries: true,
          borderRadiusApplication: 'end',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        markers: {
          fillColors: ['#7638ff', '#fda600'],
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: [
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
        ],
      },
      yaxis: {
        title: {
          text: '$ (thousands)',
        },
      },
      fill: {
        opacity: 1,
        colors: ['#7638ff', '#fda600'],
      },
      tooltip: {
        y: {
          formatter: function (val: string) {
            return '$ ' + val + ' thousands';
          },
        },
      },
    };

    // <* to check layout position *>
    this.sideBar.layoutPosition.subscribe((res) => {
      this.layoutPosition = res;
    });
  }

  async getUserData() {
    this.currentUserData = await this.userService.getCurrentUserData();
    // this.userData = await this.storage.getStorage(environment.user_data);
    console.log('user Data: ', this.currentUserData);
    if (this.currentUserData) {
      this.userName = this.userService.showName(this.currentUserData);
      this.userName = this.userName.split(' ')[0]; // Get only the first name
    }
  }
}
