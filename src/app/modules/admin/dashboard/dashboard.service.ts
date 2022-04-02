import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { RecentAction } from '@core/thinq/thinq.type';
import { environment } from 'environments/environment';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private _recentActions: BehaviorSubject<RecentAction[]> = new BehaviorSubject(null);
  private _apiUrl: string = environment.apiEndPoint;
  private _data: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for data
   */
  get data$(): Observable<any> {
    return this._data.asObservable();
  }

  /**
   * Getter for recent actions
   */
  get recentActions$(): Observable<RecentAction[]> {
    return this._recentActions.asObservable();
  }

  getRecent(): Observable<RecentAction[]> {
    const formData: FormData = this._authService.getAuthenticationData();
    const params: HttpParams = new HttpParams()
      .set('i', this._authService.kq_UserId);
    return this._httpClient.post<RecentAction[]>(this._apiUrl + '/api/coreapi/doApiV1Home.php',
      formData,
      {
        params: params
      }
    ).pipe(
      tap((response: RecentAction[]) => {
        console.log(response);
        this._recentActions.next(response);
      })
    );
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get data
   */
  getData(): Observable<any> {
    return this._httpClient.get('api/dashboards/project').pipe(
      tap((response: any) => {
        console.log(response);
        this._data.next(response);
      })
    );
  }
}
