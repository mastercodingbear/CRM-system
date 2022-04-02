import { Injectable } from '@angular/core';
import { KoneQTUtils } from '@core/utils/koneqt.utils';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { appUserPersonae } from '@core/config/app.config';
import {
  getNavAccounts,
  getNavERP_ACC,
  getNavERP_Invoicing,
  getNavGlider,
  getNavMarketing,
  getNavParty,
  getNavProjects,
  getNavRecruitment,
  getNavReports,
  getNavSales,
  getNavTinMan,
  getNav_ISP
} from '@core/config/navigation.config';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private _navigation: FuseNavigationItem[] = [];

  /**
   * Constructor
   */
  constructor(private _kqUtils: KoneQTUtils) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all navigation data
   */
  get(): FuseNavigationItem[] {
    // Subscribe to media changes
    this._navigation = this.generateNavigation();
    return this._navigation;
  }

  /**
   * Generate navigations with given personae
   *
   * @returns Naviation items
   */
  generateNavigation(): FuseNavigationItem[] {
    const navigation: FuseNavigationItem[] = [];
    for (const personae of appUserPersonae) {
      switch (personae) {
        case 'Accounts':
          navigation.push(getNavAccounts());
          navigation.push(getNavMarketing(appUserPersonae[0]));
          break;
        case 'Network':
          navigation.push(getNavMarketing(appUserPersonae[0]));
          break;
        case 'ISP':
          navigation.push(getNav_ISP());
          navigation.push(getNavSales());
          navigation.push(getNavMarketing(appUserPersonae[0]));
          navigation.push(getNavReports());
          break;
        case 'Client_Tinman':
          navigation.push(getNavTinMan());
          navigation.push(getNavParty());
          break;
        case 'Glider':
          navigation.push(getNavGlider());
          break;
        case 'Recruitment':
          navigation.push(getNavRecruitment());
          break;
        case 'Core':
          navigation.push(getNavSales());
          navigation.push(getNavMarketing(appUserPersonae[0]));
          navigation.push(getNavParty());
          break;
        /**
         * Modules
         */
        case 'ERP_Invoicing':
          navigation.push(getNavERP_Invoicing());
          break;
        case 'ERP_ACC':
          navigation.push(getNavERP_ACC());
          break;
        case 'ERP_Sales':
          //Customers
          break;
        case 'ERP_WIP':
          break;
        case 'Project':
          navigation.push(getNavProjects());
          break;
        case 'CRM_LEGACY':
          // navigation.push(getNavCRM_Legacy());
          break;
      }
    }
    return navigation;
  }
}
