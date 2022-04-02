import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { DashboardService } from './dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardResolver implements Resolve<any[]> {
  constructor(private _dashboardService: DashboardService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
    return forkJoin([
      this._dashboardService.getData(),
      this._dashboardService.getRecent()
    ]);
  }
}
