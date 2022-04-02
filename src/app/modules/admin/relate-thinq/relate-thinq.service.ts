import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CabinetClassField } from '@core/admin-view/admin-view.type';
import { AuthService } from '@core/auth/auth.service';
import { ThinqRelation } from '@core/thinq/thinq.type';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ThinqService } from '../thinq/thinq.service';

@Injectable({
  providedIn: 'root'
})
export class RelateThinqService {

  private _apiUrl: string = environment.apiEndPoint;
  private _appDataId: number;
  private _existingRelations: BehaviorSubject<ThinqRelation[]> = new BehaviorSubject(null);
  private _relationsFirstLevel: BehaviorSubject<ThinqRelation[]> = new BehaviorSubject(null);
  private _enabledClassName: BehaviorSubject<string[]> = new BehaviorSubject(null);
  private _classFields: BehaviorSubject<CabinetClassField[]> = new BehaviorSubject(null);
  private _relatedSearchResult: BehaviorSubject<any[]> = new BehaviorSubject(null);
  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService,
    private _thinqService: ThinqService
  ) { }

  /**
   * Getter for existingRelations
   */
  get existingRelations$(): Observable<ThinqRelation[]> {
    return this._existingRelations.asObservable();
  }

  /**
   * Getter for relationsFirstLevel
   */
  get relationsFirstLevel$(): Observable<ThinqRelation[]> {
    return this._relationsFirstLevel.asObservable();
  }

  /**
   * Getter for enabledClasses
   */
  get enabledClassName$(): Observable<string[]> {
    return this._enabledClassName.asObservable();
  }

  /**
   * Getter for classFields
   */
  get classFields$(): Observable<CabinetClassField[]> {
    return this._classFields.asObservable();
  }

  /**
   * Getter for relatedSearchResult
   */
  get relatedSearchResult$(): Observable<any[]> {
    return this._relatedSearchResult.asObservable();
  }

  /**
   * Get existing relations of given thinq record
   *
   * @param appDataId AppDataId
   * @returns Existing relations
   */
  getExistingRelations(appDataId: number): Observable<ThinqRelation[]> {
    const formData: FormData = this._authService.getAuthenticationData();
    this._appDataId = appDataId;
    formData.append('function', 'GetRelationshipsThinq');
    formData.append('i', appDataId.toString());
    return this._httpClient.post<ThinqRelation[]>(this._apiUrl + '/api/coreapi/getApiV1Relate.php',
      formData
    ).pipe(
      tap((response: ThinqRelation[]) => {
        let relations = response;
        relations = relations.filter(relation =>
          relation.RelationshipName !== 'Creator of' &&
          relation.RelationshipName !== 'Created by');
        this._existingRelations.next(relations);
      })
    );
  }

  /**
   * Get Related First Level
   */
  getRelatedFirstLevel(appDataId: number): Observable<ThinqRelation[]> {
    const formData: FormData = this._authService.getAuthenticationData();
    this._appDataId = appDataId;
    formData.append('function', 'GetRelatedFirstLevel');
    formData.append('i', appDataId.toString());
    return this._httpClient.post<ThinqRelation[]>(this._apiUrl + '/api/coreapi/getApiV1Relate.php',
      formData
    ).pipe(
      tap((response: ThinqRelation[]) => {
        this._relationsFirstLevel.next(response);
      })
    );
  }

  /**
   * Get Enabled Classes
   */
  getEnabledClassesString(): Observable<string[]> {
    const formData: FormData = this._authService.getAuthenticationData();
    formData.append('function', 'GetEnabledClasses');
    return this._httpClient.post<string[]>(this._apiUrl + '/api/coreapi/getApiV1Relate.php',
      formData
    ).pipe(
      tap((response: string[]) => {
        this._enabledClassName.next(response);
      })
    );
  }
  /**
   * Get Class Fields
   */
  getClassFields(cabinet: string): Observable<CabinetClassField[]> {
    const formData: FormData = this._authService.getAuthenticationData();
    formData.append('function', 'GetClassFields');
    formData.append('c', cabinet);
    return this._httpClient.post<CabinetClassField[]>(this._apiUrl + '/api/coreapi/getApiV1Relate.php',
      formData
    ).pipe(
      tap((response: CabinetClassField[]) => {
        this._classFields.next(response);
      })
    );
  }

  /**
   * Get thinq list
   *
   * @param cabinet Cabinet class name
   * @param searchField Search field of cabinet
   * @param searchQuery Search query
   * @returns Thinq list that can create new relationship
   */
  getRelateSearch(
    cabinet: string = '',
    searchField: string = '',
    searchQuery: string = ''
  ): Observable<any[]> {
    const formData: FormData = this._authService.getAuthenticationData();
    formData.append('function', 'GetRelateSearch');
    formData.append('c', cabinet);
    formData.append('f', searchField);
    formData.append('s', searchQuery);
    return this._httpClient.post<any[]>(this._apiUrl + '/api/coreapi/getApiV1Relate.php',
      formData
    ).pipe(
      tap((response: any[]) => {
        this._relatedSearchResult.next(response);
      })
    );
  }

  /**
   * Create/Update Relationship
   */
  updateRelationship(params: any): Observable<any> {
    const functionData = params;
    functionData.SourceId = this._appDataId;
    // Run thinq create relationship function
    return this._thinqService.runThinqFunction('CreateRelationship', params);
  }

  /**
   * Delete Relationship
   */
  deleteRelationship(params: any): Observable<any> {
    const functionData = params;
    functionData.SourceId = this._appDataId;
    // Run thinq delete relationship function
    return this._thinqService.runThinqFunction('DeleteRelationship', params);
  }
}
