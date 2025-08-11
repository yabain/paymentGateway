import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * TimeAgoPipe
 *
 * A custom Angular pipe that transforms a date into a relative time string
 * (e.g., "4 months and 2 days ago") based on the current date. Useful for
 * displaying timestamps in a user-friendly way.
 */
@Pipe({
    name: 'timeAgo'
})

export class TimeAgoPipe implements PipeTransform {

    constructor(
        private translate: TranslateService,
    ) { }
    /**
     * Transforms a given date into a human-readable relative time format.
     * Calculates the difference between the current date and the provided
     * date, and returns an approximate duration string.
     *
     * @param {Date} creationDate - The date to be converted into a time-ago format.
     * @returns {string} - A string representing the relative time in months, days,
     *                     hours, or minutes, depending on the time difference.
     */
    transform(creationDate: Date): string {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - creationDate.getTime()) / 1000);

        // Calculate relative time in minutes, hours, days, and months
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        let displayText = '';

        // Construct the display text based on the time difference
        if (years > 0) {
            this.translate.get("notifications.years").subscribe((res1: string) => {
                // If years are present, display in "X years" format
                displayText += `${years} ${res1}`;
            })
        } else if (months > 0) {
            this.translate.get("notifications.months").subscribe((res1: string) => {
                // If months are present, display in "X months" format
                displayText += `${months} ${res1}`;
            })
        } else if (days > 0) {
            this.translate.get("notifications.days").subscribe((res1: string) => {
                // If days are present, display in "X days" format
                displayText += `${days} ${res1}`;
            })
        } else if (hours > 0) {
            this.translate.get("notifications.houres").subscribe((res1: string) => {
                // If hours are present, display in "X hours" format
                displayText += `${hours} ${res1}`;
            })
        } else if (minutes > 0) {
            this.translate.get("notifications.minutes").subscribe((res: string) => {
                // If minutes are present, display in "X minutes" format
                displayText += `${minutes} ${res}`;
            })
        } else {
            this.translate.get("notifications.fewSeconds").subscribe((res: string) => {
                // If the time difference is less than a minute, display "a few seconds"
                displayText += ` ${res}`;
            })
        }

        return displayText;
    }
}
