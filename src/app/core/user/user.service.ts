import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { User } from '@core/user/user.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for user
   *
   * @param value
   */
  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  get currentUser(): User {
    return this._user.getValue();
  }

  set user(value: User) {
    // Store the value
    this._user.next(value);
  }
}
