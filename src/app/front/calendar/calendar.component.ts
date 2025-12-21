import { Component, Input, OnChanges } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html'
})
export class CalendarComponent implements OnChanges {

  @Input() events: {
    title: string;
    dateStart: string;
    dateEnd: string;
    color?: string;
  }[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },
    events: [],
    height: 'auto',
    fixedWeekCount: false,
    displayEventTime: false
  };

  ngOnChanges(): void {
    this.calendarOptions.events = this.events.map(event => ({
      title: event.title,
      start: event.dateStart,
      end: event.dateEnd,
      backgroundColor: event.color,
      borderColor: event.color
    }));
  }
}
