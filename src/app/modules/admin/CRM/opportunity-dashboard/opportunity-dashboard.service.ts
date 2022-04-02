import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GetDataResponse } from '@core/admin-view/admin-view.type';
import { AuthService } from '@core/auth/auth.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpportunityDashboardService {

  private _apiUrl: string = environment.apiEndPoint;
  private _opportunity: BehaviorSubject<GetDataResponse> = new BehaviorSubject(null);

  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) { }

  /**
   * Getter for opportunity
   */
  get opportunity$(): Observable<GetDataResponse>
  {
    return this._opportunity.asObservable();
  }

  /**
   * Get Opportunity for this year
   *
   * @param partyId Party Id of user
   * @param dateFrom Opportunity date from
   * @param dateTo Opportunity date to
   * @returns data response
   */
  getData(
    partyId: number,
    dateFrom: string,
    dateTo: string,
  ): Observable<GetDataResponse>
  {
    const formData: FormData = this._authService.getAuthenticationData();
    const params: HttpParams = new HttpParams()
      .set('c', 'Opportunity')
      .set('PartyId', partyId)
      .set('fd', 'EstimateSaleDate')
      .set('df', dateFrom)
      .set('dt', dateTo);
    return this._httpClient.post<GetDataResponse>(this._apiUrl + '/api/coreapi/getApiV1GetData.php',
      formData,
      {
        params: params
      }
    ).pipe(
      tap((response: GetDataResponse) => {
        this._opportunity.next(response);
      })
    );
  }
}
