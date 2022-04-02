import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { GetDataResponse } from '@core/admin-view/admin-view.type';
import { UserService } from '@core/user/user.service';
import { Observable, of } from 'rxjs';
import { OpportunityDashboardService } from './opportunity-dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class OpportunityDashboardResolver implements Resolve<GetDataResponse> {
  constructor(
    private _opportunityService: OpportunityDashboardService,
    private _userService: UserService
  ) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<GetDataResponse> {
    const year = new Date().getFullYear();
    const partyId = this._userService.currentUser.partyId;
    return this._opportunityService.getData(
      partyId,
      year + '-01-01',
      year + '-12-31',
    );
  }
}
