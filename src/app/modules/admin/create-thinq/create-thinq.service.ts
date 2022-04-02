import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { CabinetClass } from '@core/config/app.config';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateThinqService {

  private _apiUrl: string = environment.apiEndPoint;
  private _appDataId: number;
  private _cabinets: BehaviorSubject<CabinetClass[]> = new BehaviorSubject(null);
  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService,
  ) { }

  /**
   * Getter for cabinetList
   */
  get cabinets$(): Observable<CabinetClass[]> {
    return this._cabinets.asObservable();
  }

  /**
   * Get cabinet classes that users can create
   *
   * @param appId Related Thinq Id for Create
   * @returns Cabinet classes
   */
  getCabinets(appId: number = 0): Observable<CabinetClass[]> {
    const formData: FormData = this._authService.getAuthenticationData();
    return this._httpClient.post<CabinetClass[]>(this._apiUrl + '/api/coreapi/getApiV1CreateList.php',
      formData
    ).pipe(
      tap((response: CabinetClass[]) => {
        console.log(response);
        this._appDataId = appId;
        this._cabinets.next(response);
      })
    );
  }

  /**
   * Create new thinq
   *
   * @param cabinetClassId
   * @returns Created Thinq Id
   */
  createThinq(cabinetClassId: number): Observable<number> {
    const formData: FormData = this._authService.getAuthenticationData();
    const t = this._authService.kq_ClientKey;
    let params: HttpParams = new HttpParams();
    params = params.set('t', t);
    params = params.set('c', cabinetClassId);
    params = params.set('r', this._appDataId);
    return this._httpClient.post<number>(this._apiUrl + '/api/coreapi/createApiV1Thinq.php',
      formData,
      {
        params: params
      }
    );
  }
}
