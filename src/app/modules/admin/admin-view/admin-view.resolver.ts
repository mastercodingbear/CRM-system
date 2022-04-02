import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AdminViewService } from './admin-view.service';

@Injectable({
  providedIn: 'root'
})
export class AdminViewResolver implements Resolve<any> {
  constructor(private _adminViewService: AdminViewService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    // Get cabinet from url
    const cabinet = route.params['cabinet'];
    return this._adminViewService.getData(cabinet);
  }
}
