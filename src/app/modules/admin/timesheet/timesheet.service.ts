/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Timesheet, TimesheetTask } from '@core/timesheet/timesheet.type';
import { UserService } from '@core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { appClasses, appRelationship } from 'app/core/config/app.config';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, mergeMap, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {

  // Current time tracking info for navigation timesheet item
  trackingTime: BehaviorSubject<any> = new BehaviorSubject(null);
  trackingTask: BehaviorSubject<any> = new BehaviorSubject(null);

  private _apiUrl: string = environment.apiEndPoint;
  private _tasks: BehaviorSubject<TimesheetTask[]> = new BehaviorSubject(null);
  private _timesheets: BehaviorSubject<Timesheet[]> = new BehaviorSubject(null);
  private _isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService,
    private _userService: UserService
  ) {
    this.getOpenTasks().subscribe();
  }

  /**
   * Getter for tasks
   */
  get tasks$(): Observable<TimesheetTask[]> {
    return this._tasks.asObservable();
  }

  /**
   * Getter for trackingTimer
   */
  get trackingTime$(): Observable<any> {
    return this.trackingTime.asObservable();
  }

  /**
   * Getter for trackingTask
   */
  get trackingTask$(): Observable<any> {
    return this.trackingTask.asObservable();
  }

  /**
   * Getter for timesheet
   */
  get timesheets$(): Observable<Timesheet[]> {
    return this._timesheets.asObservable();
  }

  /**
   * Getter for isLoading
   */
  get isLoading$(): Observable<any> {
    return this._isLoading.asObservable();
  }

  /**
   * Get My Open Tasks
   */
  getOpenTasks(): Observable<TimesheetTask[]> {
    // UserId would be PartyId
    const userId = this._userService.currentUser.id;
    const formData: FormData = this._authService.getAuthenticationData();
    formData.append('assignedto', userId.toString());
    formData.append('owner', userId.toString());
    this._isLoading.next(true);
    return this._httpClient.post<TimesheetTask[]>(this._apiUrl + '/api/coreapi/getApiV1PMData.php',
      formData,
    ).pipe(
      tap((response: TimesheetTask[]) => {
        this._isLoading.next(false);
        this._tasks.next(response);
      })
    );
  }

  /**
   * Get timesheets in period
   *
   * @param startDate Start date
   * @param endDate End date
   * @returns Timesheets
   */
  getTimesheetsbyDate(startDate: string, endDate: string): Observable<Timesheet[]> {
    // UserId would be PartyId
    const userId = this._userService.currentUser.id;
    const formData: FormData = this._authService.getAuthenticationData();
    const params: HttpParams = new HttpParams()
      .set('i', userId)
      .set('df', startDate)
      .set('dt', endDate)
      .set('f', 'Summary');
    this._isLoading.next(true);
    return this._httpClient.post<Timesheet[]>(this._apiUrl + '/api/coreapi/getApiV1PMTime.php',
      formData,
      {
        params: params
      }
    ).pipe(
      tap((response: Timesheet[]) => {
        this._isLoading.next(false);
        this._timesheets.next(response);
      })
    );
  }

  /**
   * Create timesheet first and save data
   *
   * @param trackingTimesheet Tracking Timesheet
   * @param description Timesheet description
   * @returns Timesheet
   */
  saveTimesheet(trackingTimesheet: Timesheet, description: string): Observable<string | number> {
    const formData: FormData = this._authService.getAuthenticationData();
    let params: HttpParams = new HttpParams();
    const timesheetCabinet = appClasses.find(cab => cab.ClassName === 'Timesheet');
    const parentofRelation = appRelationship.find(rel => rel.RelationshipName === 'Parent of');
    params = params.set('c', timesheetCabinet.ClassId);
    params = params.set('r', trackingTimesheet.TaskId);
    params = params.set('rti', parentofRelation.RelationshipId);
    this._isLoading.next(true);
    // Create timesheet
    return this._httpClient.post(this._apiUrl + '/api/coreapi/createApiV1Thinq.php',
      formData,
      {
        params: params,
        observe: 'body' as const,
        responseType: 'text' as const
      }
    ).pipe(
      mergeMap((response: string) => {
        // Save timesheet
        const timesheetId = Number(response);
        // At least 1 min when save new timesheet
        trackingTimesheet.Time = trackingTimesheet.Time > 0 ? trackingTimesheet.Time : 1;
        const trackedTime = trackingTimesheet.Time * 60;
        const trackedHoursmin = Math.floor(trackedTime / 60);
        const trackedMinutes = Math.floor(trackedTime % 60);
        const data = {
          'AppDataId': timesheetId,
          'Activity': trackingTimesheet.Activity,
          'DurationTimeHours': trackedHoursmin,
          'DurationTime': trackedMinutes,
          'Description': description,
        };
        formData.append('Data', JSON.stringify(data));
        return this._httpClient.post<any>(this._apiUrl + '/api/coreapi/doApiV1SaveThinq.php',
          formData
        ).pipe(
          switchMap((res: any) => {
            this._isLoading.next(false);
            if(res.Data === 'OK') {
              return of(timesheetId);
            }
            return of(res.Data);
          })
        );
      })
    );
  }

  /**
   * Update timesheet by editing time
   *
   * @param timesheetId Timesheet Id
   * @param time Tracked Time
   * @returns Tracked Time(edited)
   */
  updateTimesheet(timesheetId: number, time: number): Observable<string | number> {
    const formData: FormData = this._authService.getAuthenticationData();
    const trackedHoursmin = Math.floor(time / 60);
    const trackedMinutes = Math.floor(time % 60);
    const data = {
      'AppDataId': timesheetId,
      'DurationTimeHours': trackedHoursmin,
      'DurationTime': trackedMinutes
    };
    formData.append('Data', JSON.stringify(data));
    return this._httpClient.post<any>(this._apiUrl + '/api/coreapi/doApiV1SaveThinq.php',
      formData
    ).pipe(
      map((res) => {
        if (res.Data === 'OK') {
          return time;
        }
        // It can be Error string
        return res.Data;
      })
    );
  }
}
