import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ThinqListResponse } from '@core/admin-view/admin-view.type';
import { AuthService } from '@core/auth/auth.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KanbanBoardService {

  cabinet: string = '';
  groupBy: string = '';

  private _apiUrl: string = environment.apiEndPoint;
  private _data: BehaviorSubject<any[]> = new BehaviorSubject(null);

  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) { }

  /**
   * Getter for data
   */
  get data$(): Observable<any[]> {
    return this._data.asObservable();
  }

  /**
   *
   * @param cabinet Cabinet class
   * @param field Kanban groupby value
   * @param searchForm FormGroup for filtering data
   * @returns
   */
  getData(
    cabinet: string,
    field: string,
    searchForm: FormGroup = null
  ): Observable<ThinqListResponse> {
    const formData: FormData = this._authService.getAuthenticationData();
    const searchQuery = searchForm?.value;
    this.cabinet = cabinet;
    this.groupBy = field;
    const params: HttpParams = new HttpParams()
      .set('c', cabinet)
      .set('AssignedTo', this._authService.kq_UserId);
    for (const key in searchQuery) {
      if (Object.prototype.hasOwnProperty.call(searchQuery, key)) {
        const query = searchQuery[key];
        formData.append(key, query);
      }
    }
    return this._httpClient.post<ThinqListResponse>(this._apiUrl + '/api/coreapi/getApiV1ThinqList.php',
      formData,
      {
        params: params
      }
    ).pipe(
      tap((response: ThinqListResponse) => {
        console.log(response);
        this._data.next(response.Data);
      })
    );
  }
}
