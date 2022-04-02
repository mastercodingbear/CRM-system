import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { PMKanbanProject, PMSearchQuery } from '@core/project-management/pm.type';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PMKanbanBoardService {

  private _apiUrl: string = environment.apiEndPoint;
  private _tasks: BehaviorSubject<PMKanbanProject[]> = new BehaviorSubject(null);

  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) { }

  /**
   * Getter for data
   */
  get tasks$(): Observable<PMKanbanProject[]> {
    return this._tasks.asObservable();
  }

  /**
   * Get Project tasks with search query
   *
   * @param searchForm Search FormGroup
   * @returns Project Tasks
   */
  getTasks(
    searchForm: FormGroup = null
  ): Observable<PMKanbanProject[]> {
    const formData: FormData = this._authService.getAuthenticationData();
    // Set query value
    const searchQuery: PMSearchQuery = searchForm?.value;
    if (searchQuery) {
      for (const queryKey in searchQuery) {
        if (Object.prototype.hasOwnProperty.call(searchQuery, queryKey)) {
          const queryValue = searchQuery[queryKey];
          if (queryValue) {
            formData.append(queryKey, queryValue);
          }
        }
      }
    }
    return this._httpClient.post<PMKanbanProject[]>(this._apiUrl + '/api/coreapi/getApiV1PMData.php',
      formData
    ).pipe(
      tap((response: PMKanbanProject[]) => {
        console.log(response);
        this._tasks.next(response);
      })
    );
  }
}
