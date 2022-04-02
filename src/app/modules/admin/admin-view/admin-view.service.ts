import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthService } from '@core/auth/auth.service';
import { Sort } from '@angular/material/sort';
import { AdminViewPagination, ThinqFormField } from '@core/thinq/thinq.type';
import { Router } from '@angular/router';
import { ThinqListResponse, ThinqListBasicData } from '@core/admin-view/admin-view.type';
import { CabinetClass } from '@core/config/app.config';

@Injectable({
  providedIn: 'root'
})
export class AdminViewService {

  private _apiUrl: string = environment.apiEndPoint;
  private _cabinet: BehaviorSubject<string> = new BehaviorSubject(null);
  private _columns: BehaviorSubject<Record<string, ThinqFormField>> = new BehaviorSubject(null);
  private _headerClass: BehaviorSubject<CabinetClass> = new BehaviorSubject(null);
  private _data: BehaviorSubject<ThinqListBasicData[]> = new BehaviorSubject(null);
  private _pagination: BehaviorSubject<AdminViewPagination | null> = new BehaviorSubject(null);

  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService,
    private _router: Router
  ) { }

  /**
   * Getter for cabinet
   */
  get cabinet$(): Observable<string> {
    return this._cabinet.asObservable();
  }

  /**
   * Getter for columns
   */
  get columns$(): Observable<Record<string, ThinqFormField>> {
    return this._columns.asObservable();
  }

  /**
   * Getter for headerClass
   */
  get headerClass$(): Observable<CabinetClass> {
    return this._headerClass.asObservable();
  }

  /**
   * Getter for data
   */
  get data$(): Observable<ThinqListBasicData[]> {
    return this._data.asObservable();
  }

  /**
   * Getter for pagination
   */
  get pagination$(): Observable<AdminViewPagination> {
    return this._pagination.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get admin data
   *
   * @param cabinet Cabinet class
   * @param page Pagination Index
   * @param size Page Size
   * @param sortQuery SortyQuery
   * { direction: asc | desc, active: fieldName } -> i.e. 'ProjectId,Important,!ExpectedStart'
   * @param searchQuery Search Query i.e. {fieldName: SearchValue}
   * @returns data
   */
  getData(
    cabinet: string,
    page: number = 1,
    size: number = 25,
    sortQuery: Sort[] = [],
    searchQuery: any = null
  ): Observable<ThinqListResponse | string> {
    const formData: FormData = this._authService.getAuthenticationData();
    let params: HttpParams = new HttpParams()
      .set('c', cabinet)
      .set('p', page)
      .set('ps', size)
      .set('pc', true);
    // Add sort query
    if (sortQuery.length > 0) {
      let order = '';
      for (let i = 0; i < sortQuery.length; i++) {
        order += (sortQuery[i].direction === 'asc' ? '' : '!') + sortQuery[i].active;
        if (i !== sortQuery.length - 1) {
          order += ',';
        }
      }
      params = params.set('o', order);
    }
    // Add search query
    if (searchQuery) {
      for (const iterator of searchQuery) {
        params = params.set(iterator.field, iterator.value);
      }
    }
    return this._httpClient.post<ThinqListResponse | string>(this._apiUrl + '/api/coreapi/getApiV1ThinqList.php',
      formData,
      {
        params: params
      }
    ).pipe(
      tap((response: ThinqListResponse | string) => {
        if (typeof response === 'string') {
          this._router.navigate(['/']);
          return of(response);
        }
        this._data.next(response.Data);
        // Set columns and cabinet when initializing data for the first time
        if (!this._cabinet.value || this._cabinet.value !== cabinet) {
          this._columns.next(response.Fields);
          this._cabinet.next(cabinet);
        }
        this._headerClass.next(response.Class);
        this._pagination.next({
          size: Number(response.PageSize),
          page: Number(response.PageNumber),
          length: Number(response.RowCount)
        });
      })
    );
  }

  updateField(
    cabinet: string,
    appDataId: number,
    fieldName: string,
    value: string
  ): Observable<any> {
    const formData: FormData = this._authService.getAuthenticationData();
    formData.append('c', cabinet);
    formData.append('i', appDataId.toString());
    formData.append('f', fieldName);
    formData.append('v', value);
    return this._httpClient.post<any>(this._apiUrl + '/api/coreapi/doApiV1SaveField.php',
      formData,
    ).pipe(
      tap((response: any) => {
      })
    );
  }
}
