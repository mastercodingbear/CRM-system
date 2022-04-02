/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PMCountTaskInfo, PMProject, PMUser } from '@core/project-management/pm.type';
import { GetDataResponse } from '@core/admin-view/admin-view.type';
import { ThinqFormField, ThinqResponse } from '@core/thinq/thinq.type';

@Injectable({
  providedIn: 'root'
})
export class PMDashboardService {

  groupBy: string;

  private _projects: BehaviorSubject<PMProject[]> = new BehaviorSubject(null);
  private _pmFields: BehaviorSubject<Record<string, ThinqFormField>> = new BehaviorSubject(null);
  private _teamPlayers: BehaviorSubject<Record<string, string>> = new BehaviorSubject(null);
  private _countTaskInfo: BehaviorSubject<PMCountTaskInfo> = new BehaviorSubject(null);
  private _apiUrl: string = environment.apiEndPoint;

  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) { }

  /**
   * Getter for projects
   */
  get projects$(): Observable<PMProject[]> {
    return this._projects.asObservable();
  }

  /**
   * Getter for PM fields
   */
  get pmFields$(): Observable<Record<string, ThinqFormField>> {
    return this._pmFields.asObservable();
  }

  /**
   * Getter for teamPlayers
   */
  get teamPlayers$(): Observable<any> {
    return this._teamPlayers.asObservable();
  }

  /**
   * Getter for quantity info of tasks
   */
  get countTaskInfo$(): Observable<PMCountTaskInfo> {
    return this._countTaskInfo.asObservable();
  }
  /**
   * Get data
   */
  getPMData(
    dateFrom: string = '',
    dateTo: string = '',
    queryFunction: string = '',
    groupBy: string = 'Status',
    userId: string = 'All',
    ownerId: string = 'All',
    blnIgnoreClosed: 1 | 0 = 1,
    blnIgnoreDate: 1 | 0 = 1,
    status: string = '',
    type: string = '',
    nature: string = '',
    projectId: string = '',
    statusButtons: string = ''
  ): Observable<PMProject[] | PMCountTaskInfo> {
    const formData: FormData = this._authService.getAuthenticationData();
    this.groupBy = groupBy;
    const objFilters = {
      dteFrom: { Type: 'dte', Field: '', Value: dateFrom, Values: [], Operator: 'EQUALS' },
      dteTo: { Type: 'dte', Field: '', Value: dateTo, Values: [], Operator: 'EQUALS' },
      ProjectId: { Type: 'int', Field: '', Value: projectId, Values: [], Operator: 'EQUALS' },
      GroupBy: { Type: 'str', Field: '', Value: groupBy, Values: [], Operator: 'EQUALS' },
      UserId: { Type: 'int', Field: '', Value: userId || 'All', Values: [], Operator: 'EQUALS' },
      OwnerId: { Type: 'int', Field: '', Value: ownerId || 'All', Values: [], Operator: 'EQUALS' },
      blnIgnoreClosed: { Type: 'bln', Field: '', Value: blnIgnoreClosed, Values: [], Operator: 'LOGIC' },
      blnIgnoreDate: { Type: 'bln', Field: '', Value: blnIgnoreDate, Values: [], Operator: 'LOGIC' },
      Function: { Type: 'str', Field: '', Value: queryFunction, Values: [], Operator: 'EQUALS' },
      // Status loaded on Top row - new feature
      Status: { Type: 'str', Field: '', Value: status, Values: [], Operator: 'EQUALS' },
      // Status Nature buttons activated to load relevant tasks
      Type: { Type: 'str', Field: '', Value: type, Values: [], Operator: 'EQUALS' },
      Nature: { Type: 'str', Field: '', Value: nature, Values: [], Operator: 'EQUALS' },
      // Combination Status buttons created from Load
      StatusButtons: { Type: 'str', Field: '', Value: statusButtons, Values: [], Operator: 'EQUALS' },
    };
    formData.append('arrFilter', JSON.stringify(objFilters));
    return this._httpClient.post<PMProject[] | PMCountTaskInfo>(this._apiUrl + '/api/coreapi/getApiV1PMDashboard.php',
      formData
    ).pipe(
      tap((response: PMProject[] | PMCountTaskInfo) => {
        this.setPMData(response, queryFunction);
      })
    );
  }

  /**
   * Get Team players
   */
  getTeamPlayers(): Observable<GetDataResponse> {
    const formData: FormData = this._authService.getAuthenticationData();
    const params: HttpParams = new HttpParams()
      .set('c', 'User')
      .set('f', 'FirstName')
      .set('o', 'FirstName,LastName')
      .set('Role', '!api')
      .set('LoginStatus', 'active');
    return this._httpClient.post<GetDataResponse>(this._apiUrl + '/api/coreapi/getApiV1GetData.php',
      formData,
      {
        params: params
      }
    ).pipe(
      tap((response: GetDataResponse) => {
        // Update the user array to object that can be used in thinq ddl option
        const userArray = { '': 'All' };
        response.Data.map((user: PMUser) => {
          userArray[user.AppDataId] = user.Abstract;
        });
        this._teamPlayers.next(userArray);
      })
    );
  }

  /**
   * Set project management data
   *
   * @param data PMProject[] | PMCountTaskInfo
   * @param queryFunction Query function
   */
  setPMData(data: any, queryFunction: string): void {
    switch (queryFunction) {
      case 'Summary':
      case 'Sort':
      case 'Overdue':
      case 'NoDueDate':
      case 'Orphan':
        this._projects.next(data);
        this.getPMFields(data[0].AppDataId).subscribe();
        break;
      case 'doCountTasks':
      case 'OverDueCount':
        this._countTaskInfo.next(data);
        break;
    }
  }

  getPMFields(appId: number): Observable<ThinqResponse> {
    const formData: FormData = this._authService.getAuthenticationData();
    formData.append('i', appId.toString());
    return this._httpClient.post<ThinqResponse>(this._apiUrl + '/api/coreapi/getApiV1ThinqData.php',
      formData
    ).pipe(
      tap((response: ThinqResponse) => {
        if (response.Status === 'OK') {
          this._pmFields.next(response.Fields);
        }
        else {
          // TODO it can redirect error page
        }
      })
    );
  }

}
