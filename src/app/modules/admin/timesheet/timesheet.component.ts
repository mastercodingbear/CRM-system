/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar as FullCalendar, PluginDef } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import momentPlugin from '@fullcalendar/moment';
import rrulePlugin from '@fullcalendar/rrule';
import timeGridPlugin from '@fullcalendar/timegrid';
import * as moment from 'moment';
import { Observable, Subject, takeUntil, timer } from 'rxjs';
import { TimesheetService } from './timesheet.service';
import { AddTaskComponent } from './dialogs/add-task/add-task.component';
import { AddActivityComponent } from './dialogs/add-activity/add-activity.component';
import { SaveTimesheetComponent } from './dialogs/save-timesheet/save-timesheet.component';
import { KoneQTUtils } from '@core/utils/koneqt.utils';
import { Timesheet, TimesheetTask, TimeTracker } from '@core/timesheet/timesheet.type';
import { UserService } from '@core/user/user.service';
import { VALIDATION_MODAL_CONFIG } from '@core/config/thinq.config';

interface LocalStorageTimesheets {
  data: Timesheet[];
};

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TimesheetComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('fullCalendar') private _fullCalendar: FullCalendarComponent;

  calendarPlugins: PluginDef[] = [dayGridPlugin, interactionPlugin, listPlugin, momentPlugin, rrulePlugin, timeGridPlugin];
  viewCalendar: 'timeGridWeek' | 'timeGridDay' | 'calendarView' = 'timeGridDay';
  view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear' = 'timeGridWeek';

  viewTitle: string;
  weekDay: Date[];
  selectedDay: Date;
  isLoading$: Observable<boolean>;
  totalTasks: TimesheetTask[] = [];
  totalOpenTasks: TimesheetTask[] = [];
  totalTimesheets: Timesheet[];
  // PR -> Task -> Activity
  timesheetStructure: any;

  // Tracking Task
  trackingTimesheet: Timesheet;
  timeTracker: Observable<number>;
  trackerDestroy: Subject<any>;
  objectKeys = Object.keys;
  private _fullCalendarApi: FullCalendar;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _timesheetService: TimesheetService,
    private _userService: UserService,
    private _kqUtils: KoneQTUtils,
    private _changeDetectorRef: ChangeDetectorRef,
    private _matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Get the data
    this._timesheetService.tasks$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((tasks: TimesheetTask[]) => {
        // Store the data
        if (tasks !== null) {
          this.totalTasks = tasks ?? [];
          this.totalOpenTasks = this.totalTasks.filter(ts => ts.Status === 'Open');
          this.getTimesheetsInPeriod();
        }
      });
    this._timesheetService.timesheets$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: Timesheet[]) => {
        if (response) {
          // Store the data
          this.totalTimesheets = response ?? [];
          // Get new timesheets from localstorage that are not saved database yet
          const newTimesheets: LocalStorageTimesheets = JSON.parse(localStorage.getItem('timesheets')) || { data: [] };
          this.totalTimesheets.push(...newTimesheets.data);
          this.initTimesheets();
          this.loadTimetracker();
          this.saveTimetracker();

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }
      });

    this.isLoading$ = this._timesheetService.isLoading$;
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // Get the full calendar API
    this._fullCalendarApi = this._fullCalendar.getApi();

    // Get the current view's title
    const currentDate = this._fullCalendarApi.getDate();
    this.viewTitle = moment(currentDate).format('dddd, D MMM');
    this.selectedDay = new Date(this._kqUtils.convertToNormalDate(currentDate));
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this.trackerDestroy?.next(null);
    this.trackerDestroy?.complete();
  }

  /**
   * Initialize Timesheets
   */
  initTimesheets(): void {
    const timesheetsOnDay = this.totalTimesheets.filter(timesheet =>
      timesheet.StartDate === this._kqUtils.convertToKoneqtDate(this.selectedDay));

    // Generate timesheet structure Object: PR -> Task -> action -> Timesheet
    this.timesheetStructure = this.generateTimesheetStructure(timesheetsOnDay);
  }

  loadTimetracker(): void {
    // Check current time tracking from local storage
    const timeTracking: TimeTracker = JSON.parse(localStorage.getItem('timer'));
    if (timeTracking && !this.trackingTimesheet) {
      this.initTimeTracking(timeTracking);
    }
  }

  saveTimetracker(): void {
    // Check if tracking timesheet is on the selected day
    if (this.trackingTimesheet?.StartDate ===
      this._kqUtils.convertToKoneqtDate(this.selectedDay)) {
      // Push timetracker to timesheets structure
      const timesheets: Timesheet[] = this.timesheetStructure
        ?.[this.trackingTimesheet.PRId]?.[this.trackingTimesheet.TaskId]?.['activity']?.[this.trackingTimesheet.Activity]?.timesheets;
      if (!timesheets) {
        console.error('Impossible! Timetracking is created with wrong taskID');
      }
      const newTimeId = this.newTimeId(this.trackingTimesheet.TaskId, this.trackingTimesheet.Activity);
      // Replace trackingTimesheet to timesheet structure
      const timesheetIndex = timesheets.findIndex(ts => ts.TimeId.toString() === newTimeId);
      timesheets.splice(timesheetIndex, 1, this.trackingTimesheet);
      // Replace trackingTimesheet to total Timesheets
      const trackingTimesheetIndex = this.totalTimesheets.findIndex(ts => ts.TimeId === newTimeId);
      this.totalTimesheets.splice(trackingTimesheetIndex, 1, this.trackingTimesheet);
      // Mark for check
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Generate Timesheet structure from array
   * Obj structure: PR -> Task -> action -> Timesheet
   *
   * @param timesheets Timesheets
   * @returns Timesheet structure
   */
  generateTimesheetStructure(timesheets: Timesheet[]): any {
    const timesheetStructure = {};
    for (const timesheet of timesheets) {
      const projectId = timesheet.PRId;
      const activity = timesheet.Activity;
      const taskId = timesheet.TaskId;
      // Check if PR exists in structure
      if (!Object.prototype.hasOwnProperty.call(timesheetStructure, projectId)) {
        // Init PR
        timesheetStructure[projectId] = {};
      }
      // Check if task exists in project
      if (!Object.prototype.hasOwnProperty.call(timesheetStructure[projectId], taskId)) {
        // Init Task
        const task = this.totalTasks.find(ts => Number(ts.AppDataId) === Number(taskId));
        if (!task) {
          console.error('Impossible! There is no current task from timesheets');
          return;
        }
        timesheetStructure[projectId] = { ...timesheetStructure[projectId], projectName: task.Project };
        timesheetStructure[projectId][taskId] = {
          taskName: this._kqUtils.getFirstLine(task.Abstract),
          ownerId: task.OwnerId,
          ownerName: task.Owner,
          assignedId: task.AssignedTo,
          assignedName: task.AssignedToName,
          status: task.Status,
          activity: {}
        };
      }
      // Check activity
      if (!Object.prototype.hasOwnProperty.call(timesheetStructure[projectId][taskId]['activity'], activity)) {
        // Init timesheets array in activity
        timesheetStructure[projectId][taskId]['activity'][activity] = {
          timesheets: []
        };
      }
      // Finally push timesheet to structure
      timesheetStructure[projectId][taskId]['activity'][activity].timesheets.push(timesheet);
    }
    return timesheetStructure;
  }

  /**
   * Initialize current time tracking
   *
   * @param timeTracker TimeTracker
   */
  initTimeTracking(timeTracker: TimeTracker): void {
    const taskId = Number(timeTracker.taskId);
    const newTimesheets: LocalStorageTimesheets = JSON.parse(localStorage.getItem('timesheets')) || { data: [] };
    this.trackingTimesheet = newTimesheets.data.find(ts => ts.TimeId === timeTracker.timeId);
    if (!this.trackingTimesheet) {
      console.error('Error! Time tracker is not in timesheets local storage');
      return;
    }
    // Save time tracking info to service for navigation timesheet item
    const task = this.totalTasks.find(ts => ts.AppDataId === taskId);
    const durationMinutes = (new Date().getTime() - new Date(timeTracker.trackStartTime).getTime()) / 1000 / 60;
    this.trackingTimesheet.Time = durationMinutes / 60;
    this._timesheetService.trackingTask.next(this._kqUtils.getFirstLine(task?.Abstract));
    this._timesheetService.trackingTime.next(this.displayDurationTime(durationMinutes));
    // Start time tracking by seconds
    this.timeTracker = timer(1000, 1000);
    this.trackerDestroy = new Subject<any>();
    this.timeTracker.pipe(takeUntil(this.trackerDestroy)).subscribe((val) => {
      if (val % 60 === 0 && val > 0) {
        this.trackingTimesheet.Time += 1 / 60;
        this._timesheetService.trackingTime.next(
          this.displayDurationTime(this.trackingTimesheet.Time * 60)
        );
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  /**
   * Select date in day view
   *
   * @param date Date
   */
  selectDay(date: Date): void {
    this.selectedDay = new Date(date);
    this.initTimesheets();
    this.saveTimetracker();
    this.viewTitle = moment(this.selectedDay).format('dddd, D MMM');
  }

  /**
   * Get timesheets in period from calendar
   * #TODO: The _fullCalendarApi created after view init
   * But this function can be called before view init
   * Update
   */
  getTimesheetsInPeriod(): void {
    let start: Date;
    let end: Date;
    if(!this._fullCalendarApi?.view) {
      // Get start&end date of current week
      start = moment().startOf('isoWeek').toDate();
      end   = moment().endOf('isoWeek').toDate();
      this.weekDay = this.getWeekDays(start, end);
    } else {
      start = this._fullCalendarApi.view.currentStart;
      end = this._fullCalendarApi.view.currentEnd;
      this.weekDay = this.getWeekDays(start, end);
    }
    // Get the view's current week start and end dates
    const viewStart = this._kqUtils.convertToKoneqtDate(start);
    const viewEnd = this._kqUtils.convertToKoneqtDate(end);
    // Get timesheets in current period
    this._timesheetService.getTimesheetsbyDate(viewStart, viewEnd).subscribe();
  }

  /**
   * Timesheets group unique by Project and Activty
   * Week view
   *
   * @returns Timesheets
   */
  getGroupTimesheets(): Timesheet[] {
    const timesheets: Timesheet[] = [];
    for (const timesheet of this.totalTimesheets) {
      if (timesheets.findIndex(ts => ts.Project === timesheet.Project && ts.Activity === timesheet.Activity) === -1) {
        timesheets.push(timesheet);
      }
    }
    return timesheets;
  }

  /**
   * Get days in period
   * To get 7 days in week
   *
   * @param start Start date
   * @param end End date
   * @returns Date array
   */
  getWeekDays(start: Date, end: Date): Date[] {
    const arr: Date[] = [];
    const dt = new Date(start);
    while (dt < end) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }

  getDailyWorkTimeByTask(timesheet: any, day: Date): string {
    const d = this._kqUtils.convertToKoneqtDate(day);
    const workTime = this.totalTimesheets
      .filter(ts => ts.StartDate === d && ts.PRId === timesheet.PRId && ts.TaskId === timesheet.TaskId)
      .reduce((sum, time) => sum + time.Time * 60, 0);
    return this.displayDurationTime(workTime);
  }

  // Timesheet Day View functions
  getWorkTimeByDay(day: Date): string {
    const d = this._kqUtils.convertToKoneqtDate(day);
    const workTime = this.totalTimesheets
      ?.filter(ts => ts.StartDate === d)
      ?.reduce((sum, time) => sum + time.Time * 60, 0);
    return this.displayDurationTime(workTime);
  }

  getTotalWorkTimeByWeek(): string {
    const workTime = this.totalTimesheets?.reduce((sum, time) => sum + time.Time * 60, 0);
    return this.displayDurationTime(workTime);
  }

  // Timesheet Week View functions
  getWorkTimeByTimesheets(timesheets: Timesheet[]): string {
    const workTime = timesheets.reduce((sum, ts) => sum + ts.Time * 60, 0);
    return this.displayDurationTime(workTime);
  }

  getTimesheetsTime(projectId: number, taskId: number, activity: string, day: Date): number {
    let timesheets: Timesheet[] = this.timesheetStructure?.[projectId]?.[taskId]?.['activity']?.[activity]?.timesheets;
    timesheets = timesheets.filter(ts => ts.StartDate === this._kqUtils.convertToKoneqtDate(day));
    if (timesheets?.length) {
      const workTime = timesheets.reduce((sum, ts) => sum + ts.Time * 60, 0);
      return workTime;
    }
    return 0;
  }

  getWeeklyWorkTimeByTask(timesheet: Timesheet): string {
    const timesheets = this.totalTimesheets.filter(ts =>
      ts.Project === timesheet.Project &&
      ts.Activity === timesheet.Activity);
    const workTime = timesheets.reduce((sum, ts) => sum + ts.Time * 60, 0);
    return this.displayDurationTime(workTime);
  }

  /**
   * Start timesheet tracking
   *
   * @param projectId Project Id
   * @param taskId Task Id
   * @param activity Activity
   */
  startTracking(projectId: number, taskId: number, activity: string): void {
    // Set localstorage timer
    if (this.trackingTimesheet) {
      // Stop current tracking and Save
      this.stopTracking(
        {
          projectId: projectId,
          taskId: taskId,
          activity: activity
        }
      );
    } else {
      // Create timesheet
      if (activity === 'open') {
        // Open the select activity dialog
        const dialogRef = this._matDialog.open(AddActivityComponent);
        dialogRef.afterClosed().subscribe((newActivity: string) => {
          if (!newActivity) {
            return;
          }
          if (!this.timesheetStructure[projectId][taskId]['activity'][newActivity]) {
            this.timesheetStructure[projectId][taskId]['activity'][newActivity] = { timesheets: [] };
          }
          this.timesheetStructure[projectId][taskId]['activity'][newActivity].timesheets.push(
            ...this.timesheetStructure[projectId][taskId]['activity']['open'].timesheets
          );
          delete this.timesheetStructure[projectId][taskId]['activity']['open'];
          // Remove open timesheet from total timesheets
          const timesheetIndex = this.totalTimesheets
            .findIndex(ts => !(ts.Activity === 'open' && ts.TimeId === this.newTimeId(taskId, 'open')));
          this.totalTimesheets.splice(timesheetIndex, 1);
          // Update timesheet activity and time id from local storage
          const newTimesheets: LocalStorageTimesheets = JSON.parse(localStorage.getItem('timesheets'));
          const timesheet = newTimesheets.data.find(ts =>
            ts.TimeId === this.newTimeId(taskId, 'open') &&
            ts.StartDate === this._kqUtils.convertToKoneqtDate(this.selectedDay)
          );
          timesheet.Activity = newActivity;
          timesheet.TimeId = this.newTimeId(taskId, newActivity);
          localStorage.setItem('timesheets', JSON.stringify(newTimesheets));
          this.startRecordTime(projectId, taskId, newActivity);
          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
      } else {
        // Update timesheet activity and time id from local storage
        const newTimesheets: LocalStorageTimesheets = JSON.parse(localStorage.getItem('timesheets')) || { data: [] };
        const timesheet: Timesheet = {
          PRId: projectId,
          TaskId: taskId,
          Activity: activity,
          StartDate: this._kqUtils.convertToKoneqtDate(this.selectedDay),
          TimeId: this.newTimeId(taskId, activity),
          Time: 0
        };
        newTimesheets.data.push(timesheet);
        localStorage.setItem('timesheets', JSON.stringify(newTimesheets));
        this.startRecordTime(projectId, taskId, activity);
      }
    }
  }

  /**
   *
   * @param projectId Project Id
   * @param taskId Task Id
   * @param activity Activity
   */
  startRecordTime(projectId: number, taskId: number, activity: string): void {
    const timesheets: Timesheet[] = this.timesheetStructure[projectId][taskId]['activity'][activity].timesheets ?? [];
    let timesheet = timesheets[0];
    let taskName: string;
    if (timesheet.Activity === 'open') {
      timesheet = timesheets[0] = {
        PRId: Number(projectId),
        TaskId: Number(taskId),
        Activity: activity,
        StartDate: this._kqUtils.convertToKoneqtDate(new Date()),
        TimeId: this.newTimeId(taskId, activity),
        Time: 0
      };
      const task = this.totalTasks.find(ts => Number(ts.AppDataId) === Number(taskId));
      taskName = this._kqUtils.getFirstLine(task.Abstract);
    } else {
      timesheet = {
        ...timesheet,
        StartDate: this._kqUtils.convertToKoneqtDate(new Date()),
        TimeId: this.newTimeId(taskId, activity),
        Time: 0
      };
      timesheets.push(timesheet);
      taskName = timesheet.Task;
    }
    this.trackingTimesheet = timesheet;
    this.totalTimesheets.push(this.trackingTimesheet);
    // Update time tracker to local storage
    const timeTracker: TimeTracker = {
      projectId: projectId,
      taskId: taskId,
      activity: activity,
      timeId: timesheet.TimeId.toString(),
      trackedTime: timesheet.Time * 60,
      trackStartTime: new Date().toString()
    };
    localStorage.setItem('timer', JSON.stringify(timeTracker));
    // Update timesheet service variables for nav timesheet item
    this._timesheetService.trackingTime.next('0:00');
    this._timesheetService.trackingTask.next(taskName);
    // Set timer
    this.timeTracker = timer(1000, 1000);
    this.trackerDestroy = new Subject<any>();
    this.timeTracker.pipe(takeUntil(this.trackerDestroy)).subscribe((val) => {
      if (val % 60 === 0 && val > 0) {
        this.trackingTimesheet.Time += 1 / 60;
        this._timesheetService.trackingTime.next(
          this.displayDurationTime(this.trackingTimesheet.Time * 60)
        );
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  /**
   * Stop tracking and save timesheet
   *
   * @param projectId Project Id
   * @param taskId Task Id
   * @param activity Activity
   * @param newTracking New tracking or not
   * If User don't stop current tracking and start another track,
   * then this param will be new Timesheet data
   */
  stopTracking(newTracking: any = null): void {
    // Open the description dialog
    const dialogRef = this._matDialog.open(SaveTimesheetComponent, {
    });

    dialogRef.afterClosed().subscribe((description) => {
      if (!description) {
        return;
      }
      // Stop timer
      this.trackerDestroy.next(null);
      this.trackerDestroy.complete();
      // Get timesheets from timesheet structure for update
      this._timesheetService.saveTimesheet(this.trackingTimesheet, description).subscribe((res: string | number) => {
        if (typeof res === 'string') {
          this.validationDialog(res);
          return;
        }
        const newTimesheetId = res;
        const timesheets: Timesheet[] = this.timesheetStructure[this.trackingTimesheet.PRId][this.trackingTimesheet.TaskId]['activity'][this.trackingTimesheet.Activity].timesheets;
        const trackingTimesheet = timesheets.find(ts => ts.TimeId === this.trackingTimesheet.TimeId);
        trackingTimesheet.TimeId = newTimesheetId;
        trackingTimesheet.Time = this.trackingTimesheet.Time;
        // Set tracking value
        this.trackingTimesheet = null;
        // Remove timer from localstorage
        localStorage.removeItem('timer');
        // Remove timetrack from service (nav timer)
        this._timesheetService.trackingTask.next('');
        this._timesheetService.trackingTime.next('');
        // Remove new timesheet from timesheets list localstorage
        const localTimesheets: LocalStorageTimesheets = JSON.parse(localStorage.getItem('timesheets'));
        if (localTimesheets) {
          const newLocalTimesheet = localTimesheets?.data?.filter(ts =>
            !(ts.TimeId === this.newTimeId(trackingTimesheet.TaskId, trackingTimesheet.Activity) &&
              ts.StartDate === this._kqUtils.convertToKoneqtDate(this.selectedDay))
          );
          localStorage.setItem('timesheets', JSON.stringify({ data: newLocalTimesheet }));
        }
        if (newTracking) {
          this.startTracking(newTracking.projectId, newTracking.taskId, newTracking.activity);
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    });
  }

  displayDurationTime(minutes: number = 0, format: string = 'H:mm'): string {
    return this._kqUtils.displayDurationTime(minutes, format);
  }

  displayTime(date: Date, format: string): string {
    return this._kqUtils.displayTime(date, format);
  }

  isTracking(projectId: number, taskId: number, activity: string): boolean {
    const tracking: TimeTracker = JSON.parse(localStorage.getItem('timer'));
    if (!tracking) {
      return false;
    }
    return (this.trackingTimesheet.TimeId === this.newTimeId(taskId, activity) &&
      this._kqUtils.convertToKoneqtDate(this.selectedDay) === this._kqUtils.convertToKoneqtDate(tracking.trackStartTime)
    );
  }

  createTimesheet(): void {
    // Open the task dialog
    const dialogRef = this._matDialog.open(AddTaskComponent, {
      data: {
        openTasks: this.totalTasks
      }
    });

    dialogRef.afterClosed().subscribe((projectTask) => {
      if (!projectTask) {
        return;
      }
      const projectId = projectTask.project;
      const taskId = projectTask.task;
      const task = this.totalTasks.find(ts => ts.AppDataId === taskId);
      const newTimesheets: LocalStorageTimesheets = JSON.parse(localStorage.getItem('timesheets')) || { data: [] };
      if (!this.timesheetStructure?.[projectId]) {
        this.timesheetStructure[projectId] = { projectName: task.Project };
      }
      if (!this.timesheetStructure[projectId][taskId]) {
        this.timesheetStructure[projectId][taskId] = {
          taskName: this._kqUtils.getFirstLine(task.Abstract),
          ownerId: task.OwnerId,
          ownerName: task.Owner,
          assignedId: task.AssignedToName,
          assignedName: task.AssignedToName,
          status: task.Status,
          activity: {}
        };
      } else if (this.timesheetStructure[projectId][taskId]['activity']['open']) {
        return;
      }
      const timesheet: Timesheet = {
        PRId: Number(projectId),
        TaskId: Number(taskId),
        Activity: 'open',
        StartDate: this._kqUtils.convertToKoneqtDate(this.selectedDay),
        TimeId: 'newTime' + taskId + ':open',
        Time: 0
      };
      this.timesheetStructure[projectId][taskId]['activity']['open'] = {
        timesheets: [timesheet]
      };
      newTimesheets.data.push(timesheet);
      localStorage.setItem('timesheets', JSON.stringify(newTimesheets));
      this.totalTimesheets.push(timesheet);
      // Mark for check
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Edit timesheet time by editing input
   *
   * @param event Time input field
   * @param projectId Project Id
   * @param taskId Task Id
   * @param activity Activity
   */
  onEditTimesheet(event: HTMLInputElement, projectId: number, taskId: number, activity: string): void {
    const timesheets: Timesheet[] = this.timesheetStructure[projectId][taskId]['activity'][activity].timesheets;
    const time = event.value;
    /**
     * #TODO: This would be upgradable with other logic
     */
    // Calculate total timesheets
    const prevTime = this.getWorkTimeByTimesheets(timesheets);
    let oldTime = moment.duration(prevTime).asMinutes();
    const newTime = moment.duration(time).asMinutes();
    if (newTime > oldTime) {
      // If new time is bigger than prevTime,
      // then increase time of the last timesheet.
      const lastTimesheet = timesheets[timesheets.length - 1];
      this._timesheetService.updateTimesheet(Number(lastTimesheet.TimeId), lastTimesheet.Time * 60 + (newTime - oldTime))
        .subscribe((res: string | number) => {
          // Because of 10 hours limit tracking
          if (typeof res === 'string') {
            this.validationDialog(res);
          } else {
            lastTimesheet.Time = Number(res) / 60;
          }
          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
    } else if (newTime < oldTime) {
      // If new time is smaller than prevTime,
      // set 0 from the last timesheets
      let index = timesheets.length - 1;
      while (oldTime - timesheets[index].Time * 60 > newTime) {
        oldTime -= timesheets[index].Time * 60;
        this._timesheetService.updateTimesheet(Number(timesheets[index].TimeId), 0).subscribe(() => {
          timesheets[index].Time = 0;
          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
        index--;
      }
      this._timesheetService.updateTimesheet(Number(timesheets[index].TimeId), timesheets[index].Time * 60 - (oldTime - newTime))
        .subscribe((res) => {
          timesheets[index].Time = Number(res) / 60;
          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
    }
  }

  /**
   * Return time after blur input
   *
   * @param event Time input field
   * @param projectId Project Id
   * @param taskId Task Id
   * @param activity Activity
   */
  onBlurEditTime(event: HTMLInputElement, projectId: number, taskId: number, activity: string): void {
    const time = this.getWorkTimeByTimesheets(this.timesheetStructure[projectId][taskId]['activity'][activity].timesheets);
    event.value = time;
    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Check user assigned task
   *
   * @param userId User Id
   * @returns Is assigned by user or not
   */
  isAssignedTask(userId: number): boolean {
    // #TODO: This user Id would be partyId
    return this._userService.currentUser.id === userId;
  }

  /**
   * Generate Timesheet Id
   *
   * @param taskId Task Id
   * @param activity Activity
   * @returns New Timesheet Id
   */
  newTimeId(taskId: number, activity: string): string {
    return 'newTime' + taskId + ':' + activity;
  }


  /**
   * Validation dialog if error occurs when saving thinq
   *
   * @param msg Validation Message
   */
  validationDialog(msg: string): void {
    const dialogRef = this._kqUtils.fuseConfirmDialog(VALIDATION_MODAL_CONFIG, msg);

    // Subscribe to afterClosed from the dialog reference
    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  /**
   * Change the calendar view - calendar view dropdown
   *
   * @param view
   */
  changeView(view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listYear'): void {
    // Store the view
    this.view = view;

    // If the FullCalendar API is available...
    if (this._fullCalendarApi) {
      // Set the view
      this._fullCalendarApi.changeView(view);

      // Update the view title
      this.viewTitle = this._fullCalendarApi.view.title;
    }
  }

  /**
   * Change the calendar view - timesheet view button toggle
   *
   * @param view
   */
  changeTimesheetView(view: 'timeGridWeek' | 'timeGridDay' | 'calendarView'): void {
    this.viewCalendar = view;
    if (view !== 'calendarView') {
      this.view = 'timeGridWeek';
      // Set the view
      this._fullCalendarApi.changeView(this.view);

      // Update the view title   EEEE d\'th\' of MMMM y \'at\' H:M'
      const currentDate = this._fullCalendarApi.getDate();
      this.viewTitle = moment(currentDate).format('dddd, D MMM');
    } else {
      this.view = 'timeGridDay';
      // Set the view
      this._fullCalendarApi.changeView(this.view);

      // Update the view title
      this.viewTitle = this._fullCalendarApi.view.title;
    }
  }

  /**
   * Moves the calendar one stop back
   */
  previous(): void {
    // Go to previous stop
    if (this.viewCalendar === 'timeGridDay' && this.selectedDay.getDay() !== 1) {
      this.selectedDay.setDate(this.selectedDay.getDate() - 1);
      this.viewTitle = moment(this.selectedDay).format('dddd, D MMM');
      this.initTimesheets();
      this.saveTimetracker();
    } else {
      this.previousWeek();
    }
  }

  /**
   * Move previous week
   */
  previousWeek(): void {
    this._fullCalendarApi.prev();

    // Update the view title
    const currentDate = this._fullCalendarApi.getDate();
    this.viewTitle = moment(currentDate).format('dddd, D MMM');

    // Set selected day
    this.selectedDay = currentDate;

    // Get timesheets in current week
    this.getTimesheetsInPeriod();
  }

  /**
   * Moves the calendar to the current date
   */
  today(): void {
    // Go to today
    this._fullCalendarApi.today();

    this.selectedDay = new Date(moment(this._fullCalendarApi.getDate()).format('MM/D/yyyy'));

    // Update the view title
    this.viewTitle = moment(this.selectedDay).format('dddd, D MMM');

    // Get timesheets in current week
    this.getTimesheetsInPeriod();
  }

  /**
   * Moves the calendar one stop forward
   */
  next(): void {
    // Go to next stop
    if (this.viewCalendar === 'timeGridDay' && this.selectedDay.getDay() !== 0) {

      this.selectedDay.setDate(this.selectedDay.getDate() + 1);
      this.viewTitle = moment(this.selectedDay).format('dddd, D MMM');
      this.initTimesheets();
      this.saveTimetracker();
    } else {
      this.nextWeek();
    }
  }

  /**
   * Move next week
   */
  nextWeek(): void {
    this._fullCalendarApi.next();

    // Update the view title
    const currentDate = this._fullCalendarApi.getDate();
    this.viewTitle = moment(currentDate).format('dddd, D MMM');

    // Set selected day
    this.selectedDay = currentDate;

    // Get timesheets in current week
    this.getTimesheetsInPeriod();
  }
}
