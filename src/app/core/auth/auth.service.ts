/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from '@core/auth/auth.utils';
import { UserService } from '@core/user/user.service';
import { environment } from 'environments/environment';
import { CabinetClass, Relationship, setAppClasses, setAppRelations, setAppUserPersonae, setAppVersion } from '@core/config/app.config';
import { SignInResponse } from './auth.type';

@Injectable()
export class AuthService {

  kq_ClientKey: string | null;
  kq_Token: string | null;
  kq_UserName: string | null;
  kq_UserId: number | null;
  kq_TokenExpires: any | null;
  kq_License: string | null;
  kq_AppVersion: string | null;
  kq_LicenseVersion: number | null;
  kq_LicenseAgreement: boolean | null;
  private _apiUrl: string = environment.apiEndPoint;
  private kq_LoggedIn: boolean = false;
  private kq_Message: string = '';
  private requestUpdate: boolean = false;

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService
  ) {
    // Load environment settings
    // Set ClientKey if not yet set
    this.kq_ClientKey = this.kqGet('KQ-ClientKey');
    if (this.kq_ClientKey == null) {
      this.kqSet('KQ-ClientKey', this.kqRandomString(32));
      this.kq_ClientKey = this.kqGet('KQ-ClientKey');
    }
    this.kq_UserName = this.kqGet('KQ-UserName');
    const fullname = this.kqGet('KQ-FullName');
    this.kq_UserId = Number(this.kqGet('KQ-UserId'));
    this.kq_Token = this.kqGet('KQ-Token');
    this.kq_TokenExpires = JSON.parse(this.kqGet('KQ-TokenExpires'));
    this.kq_LoggedIn = (this.kqGet('KQ-Authenticated') === 'true');
    this.kq_License = this.kqGet('KQ-License');
    this.kq_LicenseVersion = Number(this.kqGet('KQ-LicenseVersion'));
    this.kq_LicenseAgreement = (this.kqGet('KQ-LicenseAgreement') === 'true');

    const partyId = this.kqGet('KQ-PartyId');
    const partyRoleArray = this.kqGet('KQ-PartyRoleArray');
    // Store the user on the user service
    this._userService.user = {
      id: this.kq_UserId,
      username: this.kq_UserName,
      fullname: fullname,
      partyId: partyId ? Number(partyId) : null,
      partyRoleArray: JSON.parse(partyRoleArray)
    };
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------


  /**
   * Sign in
   *
   * @param credentials
   */
  signIn(credentials: { username: string; password: string }): Observable<any> {
    this.kqSet('KQ-UserName', credentials.username);
    this.kq_UserName = this.kqGet('KQ-UserName');
    const newCredential = this.getCredentialData(credentials.password);
    return this._httpClient.post<SignInResponse>(
      this._apiUrl + '/api/coreapi/doApiV1Login.php',
      newCredential,
    ).pipe(
      switchMap((response: SignInResponse) => {
        console.log(response);
        this.kqLoginSet(response);

        // Store the user on the user service
        this._userService.user = {
          id: this.kq_UserId,
          username: this.kq_UserName,
          fullname: `${response.FirstName} ${response.LastName}`,
          partyId: response.PartyId ? Number(response.PartyId) : null,
          partyRoleArray: response.PartyRoleArray ?? null
        };
        return of(response);
      }),
      catchError((err) => {
        this.handleSignInError(err);
        return of({ error: err });
      })
    );
  }

  /**
   * Change authenticated to true when not accepted license
   *
   * @param response
   */
  handleSignInError(response: any): void {
    const error = response.error;
    switch (error?.Message) {
      case 'Accept License Agreement':
        error.LicenseAgreement = false;
        error.Authenticated = true;
        this.kqLoginSet(error);
        break;
    }
  }

  /**
   * Get credential form data with password
   *
   * @param password
   * @returns FormData
   */
  getCredentialData(password: string): FormData {
    const credentialData: FormData = new FormData();
    credentialData.append('ClientKey', this.kq_ClientKey);
    credentialData.append('UserName', this.kq_UserName);
    credentialData.append('Password', password);
    return credentialData;
  }

  /**
   * Get authentication form data with token
   *
   * @returns FormData
   */
  getAuthenticationData(): FormData {
    const authData: FormData = new FormData();
    authData.append('ClientKey', this.kq_ClientKey);
    authData.append('UserName', this.kq_UserName);
    authData.append('Token', this.kq_Token);
    return authData;
  }

  /**
   * Sign out
   */
  signOut(): Observable<any> {
    console.log('signout');
    this.kqClear('KQ-Message');
    const authData = this.getAuthenticationData();
    this.kqLoginClear();
    return this._httpClient.post<string>(
      this._apiUrl + '/api/coreapi/doApiV1Logout.php',
      authData
    ).pipe(
      switchMap((response: string) => {
        // Clear local settings
        if (response) {
          this.kqLoginClear();
          this._userService.user = {
            id: null,
            username: null,
            fullname: null,
            partyId: null,
            partyRoleArray: null
          };
        }
        return of(response);
      })
    );
  }

  /**
   * Check the authencation status
   *
   * @returns 0: no 1: authenticated 2: need to accept license
   */
  check(): Observable<0 | 1 | 2> {
    // Check if the user is logged in
    if (!this.kq_LoggedIn) {
      this.kqLoginClear();
      return of(0);
    }

    // Check the access token availability
    if (!this.kq_Token) {
      this.kqLoginClear();
      return of(0);
    }

    // Check the access token expire date
    if (AuthUtils.isTokenExpired(this.kq_Token, this.kq_TokenExpires)) {
      this.kqLoginClear();
      return of(0);
    }

    // Check License accpeted
    if (!this.kq_LicenseAgreement) {
      return of(2);
    }

    // If the access token exists and it didn't expire, sign in using it
    return of(1);
  }

  /**
   * ChangePwd Functions
   */

  changePwd(newPwd: string): Observable<any> {
    const formData: FormData = this.getAuthenticationData();
    formData.append('Action', 'ChangePwd');
    formData.append('AppDataId', this.kq_UserId.toString());
    formData.append('NewValue', newPwd);
    return this._httpClient.post(this._apiUrl + '/api/coreapi/doApiV1ThinqFunctions.php',
      formData,
    );
  }

  /**
   * Accept license
   */
  acceptLicense(): void {
    this.kq_LicenseAgreement = true;
    this.kqSet('KQ-LicenseAgreement', this.kq_LicenseAgreement);
  }

  /**
   * Check web app constants from local storage.
   * if it's possible to update, then get all contants data
   * TODO: currently didn't done with version checking
   */
  checkAppVersion(): void {
    const version = this.kqGet('KQ-AppVersion');
    const relationship = this.kqGet('KQ-Relationship');
    const classes = this.kqGet('KQ-Class');
    const personae = this.kqGet('KQ-Personae');
    if ((!version || !relationship || !classes || !personae) && !this.requestUpdate) {
      this.requestUpdate = true;
      this.getConstant();
    } else if (version && relationship && classes && personae) {
      const rowPersonae = personae.split(',');
      this.setConstant(version, JSON.parse(relationship), JSON.parse(classes), rowPersonae);
    }
  }

  /**
   * Get constant data like
   * AppVersion, Cabinet classes, Relationships, Personae Data
   */
  getConstant(): void {
    const formData: FormData = this.getAuthenticationData();
    this._httpClient.post<any>(this._apiUrl + '/api/coreapi/getApiV1Constants.php',
      formData
    ).subscribe((res: any) => {
      console.log(res);
      this.kqSet('KQ-Relationship', JSON.stringify(res.Relationship));
      this.kqSet('KQ-Class', JSON.stringify(res.Class));
      this.kqSet('KQ-AppVersion', res.kq_version);
      this.kqSet('KQ-Personae', res.Personae);
      this.setConstant(res.kq_version, res.Relationship, res.Class, res.Personae);
    });
  }

  /**
   * Set constant data to local storage
   *
   * @param version sting
   * @param relations Realtionship[]
   * @param classes CabinetClass[]
   * @param personae string[]
   */
  setConstant(version: string, relations: Relationship[], classes: CabinetClass[], personae: string[]): void {
    setAppVersion(version);
    setAppRelations(relations);
    setAppClasses(classes);
    setAppUserPersonae(personae);
  }

  /**
   * Set all login response data
   *
   * @param data LoginResponse
   */
  kqLoginSet(data: SignInResponse): void {

    this.kqSet('KQ-UserName', this.kq_UserName);
    this.kqSet('KQ-FullName', `${data.FirstName} ${data.LastName}`);
    this.kq_UserId = data.UserId;
    this.kqSet('KQ-UserId', data.UserId);
    this.kq_LoggedIn = data.Authenticated;
    this.kqSet('KQ-Authenticated', data.Authenticated);
    this.kq_Message = data.Message;
    this.kqSet('KQ-Message', data.Message);
    this.kq_Token = data.Token;
    this.kqSet('KQ-Token', data.Token);
    this.kq_ClientKey = data.ClientKey;
    this.kqSet('KQ-ClientKey', data.ClientKey);
    this.kq_TokenExpires = data.TokenExpires;
    this.kqSet('KQ-TokenExpires', JSON.stringify(data.TokenExpires));
    this.kq_LicenseAgreement = data.LicenseAgreement ?? true;
    this.kqSet('KQ-LicenseAgreement', this.kq_LicenseAgreement);
    this.kq_License = data.License ?? '';
    this.kqSet('KQ-License', this.kq_License);
    this.kq_LicenseVersion = data.LicenseClickWarpLicense ?? 1;
    this.kqSet('KQ-LicenseVersion', this.kq_LicenseVersion);
    this.kqSet('KQ-PartyId', data.PartyId);
    this.kqSet('KQ-PartyRoleArray', JSON.stringify(data.PartyRoleArray));
  }

  /**
   * Clear all login data
   */
  kqLoginClear(): void {
    this.kq_LoggedIn = false;
    this.kq_Token = null;
    this.kqSet('KQ-Message', 'User has logged out');
    this.kqClear('KQ-UserName');
    this.kqClear('KQ-UserId');
    this.kqClear('KQ-ClientKey');
    this.kqClear('KQ-Token');
    this.kqClear('KQ-TokenExpires');
    this.kqClear('KQ-License');
    this.kqClear('KQ-LicenseVersion');
    this.kqClear('KQ-PartyId');
    this.kqClear('KQ-PartyRoleArray');
    this.kqClear('KQ-LicenseVersion');
    this.kqClear('KQ-LicenseAgreement');
    this.kqSet('KQ-Authenticated', false);
  }

  kqSet(setting: string, value: any): void {
    if (value) {
      localStorage.setItem('_Setting_' + setting, value);
    }
  }

  kqGet(setting: string): string {
    return localStorage.getItem('_Setting_' + setting);
  }

  kqClear(setting: string): void {
    localStorage.removeItem('_Setting_' + setting);
  }

  /**
   * Generate random client key
   *
   * @param length number
   * @returns random generated client key
   */
  kqRandomString(length: number): string {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
  }
}
