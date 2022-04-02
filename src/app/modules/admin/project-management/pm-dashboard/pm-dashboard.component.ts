/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { PAGINATION_CONFIG } from '@core/config/admin-view.config';
import { DASHBOARD_COLUMNS, FILTER_FUNCTIONS, SEARCH_COL_VISIBLE } from '@core/config/pm-dashboard.config';
import { KoneQTUtils } from '@core/utils/koneqt.utils';
import { AdminViewPagination, ThinqFormField } from '@core/thinq/thinq.type';
import { merge, Observable, takeUntil, Subject, debounceTime, map, take } from 'rxjs';
import { PMDashboardService } from './pm-dashboard.service';
import { PMGroup, PMCountTaskInfo, PMProject, PMFilterForm, TaskInfoCard } from '@core/project-management/pm.type';
import { PMSearchComponent } from './pm-search/pm-search.component';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { FuseLoadingService } from '@fuse/services/loading';
import { VALIDATION_MODAL_CONFIG } from '@core/config/thinq.config';
import { AdminViewService } from '@modules/admin/admin-view/admin-view.service';
import { ThinqService } from '@modules/admin/thinq/thinq.service';

interface Column {
  field: string;
  value: string;
  width: number;
}

@Component({
  selector: 'pm-dashboard',
  templateUrl: './pm-dashboard.component.html',
  styleUrls: ['./pm-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PMDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('matDrawer') matDrawer: MatDrawer;
  @ViewChild('pmSearchbar') pmSearchBar: PMSearchComponent;

  objectKey = Object.keys;

  drawerMode: 'side' | 'over';
  dataSource = new MatTableDataSource<any | PMGroup>([]);

  projects: PMProject[];
  pmFields: Record<string, ThinqFormField>;
  countTaskInfo$: Observable<PMCountTaskInfo>;
  filterForm: PMFilterForm;
  filterFunction = FILTER_FUNCTIONS;
  selectedFilter: string;
  selectedCard: TaskInfoCard = null;
  selectedStatus: string = null;
  userArray$: Observable<any[]>;

  // Table variables
  columns: Column[];
  displayColumns: string[];
  strGroupBy: string;
  groupByColumns: string[] = [];
  // Variables for select mode
  selectedCell: {
    appDataId: number;
    colName: string;
  } = null;
  selectedCellFormControl: AbstractControl;
  selectedCellTxlControl: AbstractControl;
  selectedCellArrField: ThinqFormField;
  isLoading: boolean;
  // Search
  searchColVisible = SEARCH_COL_VISIBLE;
  // Pagination variables
  pagination: AdminViewPagination;
  paginationConfig = PAGINATION_CONFIG;

  private _tableData: any[];
  private _rowFormGroup: FormGroup;
  private _searchGroup: FormGroup;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _snackBar: MatSnackBar,
    private _loadingService: FuseLoadingService,
    private _kqUtils: KoneQTUtils,
    private _adminviewService: AdminViewService,
    private _thinqService: ThinqService,
    private _pmDashboardService: PMDashboardService
  ) {
    // Initialize filter bar
    const { startDate, endDate } = this.getStartEndDate();
    this.filterForm = {
      dateFrom: startDate,
      dateTo: endDate,
      blnIgnoreClosed: true,
      blnIgnoreDate: true,
      selectUser: '',
      selectOwner: '',
    };
    // Initialize table data
    this.columns = DASHBOARD_COLUMNS;
    this.displayColumns = this.columns.map(col => col.field);
    this.strGroupBy = this._pmDashboardService.groupBy;
    this.groupByColumns = this.getGroupList(this.strGroupBy);
  }

  /**
   * On init
   */
  ngOnInit(): void {

    // Get the projects
    this._pmDashboardService.projects$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: PMProject[]) => {

        // Update the projects
        this.projects = response;
        this.initPagination(this.projects);
        this.initDisplayProjects(this.projects);

        // Init search group
        this._searchGroup = new FormGroup({});
        this.columns.map((col: any) => {
          this._searchGroup.addControl(col.value, new FormControl(''));
        });
      });

    // Get the projects
    this._pmDashboardService.pmFields$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: Record<string, ThinqFormField>) => {

        // Update the pm fields info
        if (response) {
          this.pmFields = response;
          const arrayColumns = [];
          for (const key in this.pmFields) {
            if (Object.prototype.hasOwnProperty.call(this.pmFields, key)) {
              const colTemp = { ...this.pmFields[key], FieldName: key };
              arrayColumns.push(colTemp);
            }
          }
          this._rowFormGroup = new FormGroup({});
          this._rowFormGroup.addControl('AppDataId', new FormControl(''));
          // Filter cols not htm and set value
          arrayColumns.filter(field => field.Type !== 'htm' && field.ExcludeFromView === false)
            .map((field: any) => {
              this._rowFormGroup.addControl(field.FieldName, new FormControl(''));
            });
        }
      });

    // Get the quantity info of tasks
    this.countTaskInfo$ = this._pmDashboardService.countTaskInfo$;

    // Get the data
    this.userArray$ = this._pmDashboardService.teamPlayers$;

    // Trigger when search form changes
    this._searchGroup.valueChanges
      .pipe(
        debounceTime(300),
        map(() => {
          this.getProjectsBySearch(this._searchGroup);
        })
      ).subscribe();

    this._loadingService.show$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((isLoading: boolean) => {
        setTimeout(() => {
          this.isLoading = isLoading;
        });
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Project filter by clicked taskcard's status and type
   *
   * @param event Task card clicked in side nav
   */
  onTaskCardClick(event: TaskInfoCard): void {
    let projects = this.projects;
    this.selectedCard = event;
    if (this.selectedCard) {
      projects = this.projects.filter(pr => pr.Status === this.selectedCard.status && pr.Type === this.selectedCard.type);
    } else {
      projects = this.projects;
    }
    this.initPagination(projects);
    this.initDisplayProjects(projects);
  }

  /**
   * Apply filter tasks
   *
   * @param filterForm Filter form
   */
  applyFilter(filterForm: PMFilterForm): void {
    this.filterForm = filterForm;
    this.getProjects(this.filterForm, this.strGroupBy, this.selectedFilter);
  }

  /**
   * Get projects
   *
   * @param filterForm Filter form
   * @param groupBy Group by
   * @param filterType Filter type
   */
  getProjects(filterForm: PMFilterForm, groupBy: string, filterType: string): void {
    merge(
      this.getProjectsByFilterForm(
        filterForm,
        groupBy,
        FILTER_FUNCTIONS[filterType]?.getProject || 'Summary',
        FILTER_FUNCTIONS[filterType]?.status || '',
      ),
      this.getProjectsByFilterForm(
        filterForm,
        groupBy,
        FILTER_FUNCTIONS[filterType]?.getCountInfo || 'doCountTasks',
        FILTER_FUNCTIONS[filterType]?.status || '',
      )
    ).subscribe();
  }

  /**
   * Get projects info
   *
   * @param filterForm Filter form
   * @param groupBy Group by projects
   * @param pmFunction PM function: summary, counttasks, etc
   * @param status status
   * @returns Project info
   */
  getProjectsByFilterForm(
    filterForm: PMFilterForm,
    groupBy: string,
    pmFunction: string,
    status: string = ''
  ): Observable<PMProject[] | PMCountTaskInfo> {
    return this._pmDashboardService.getPMData(
      filterForm.dateFrom,
      filterForm.dateTo,
      pmFunction,
      groupBy,
      filterForm.selectUser,
      filterForm.selectOwner,
      filterForm.blnIgnoreClosed === true ? 1 : 0,
      filterForm.blnIgnoreDate === true ? 1 : 0,
      status
    );
  }

  /**
   * Filter projects
   *
   * @param filterType Filter type
   */
  filterProject(filterType: string): void {
    if (this.selectedFilter === filterType) {
      this.selectedFilter = 'All';
    } else {
      this.selectedFilter = filterType;
    }
    switch (this.selectedFilter) {
      case 'Today':
        this.setTodayFilter();
        break;
      case 'OverDue':
      case 'Pending':
      case 'Someday':
      case 'NoDueDate':
      case 'Orphaned':
      case 'All':
        this.setDefaultFilter();
    }
  }

  getProjectsBySearch(searchForm: FormGroup): void {
    const searchFormValue = searchForm.value;
    let projects = this.projects;
    for (const col in searchFormValue) {
      if (Object.prototype.hasOwnProperty.call(searchFormValue, col)) {
        const value = searchFormValue[col];
        if (value !== '') {
          projects = projects.filter((project: PMProject) => project[col].includes(value));
        }
      }
    }
    this.initPagination(projects);
    this.initDisplayProjects(projects);
  }

  /**
   * Set default filter form
   */
  setDefaultFilter(): void {
    const { startDate, endDate } = this.getStartEndDate();
    this.filterForm.dateFrom = startDate;
    this.filterForm.dateTo = endDate;
    this.filterForm.blnIgnoreDate = true;
    this.pmSearchBar.setFilterValue();
  }

  /**
   * Set today filter form
   */
  setTodayFilter(): void {
    this.filterForm.blnIgnoreDate = false;
    this.filterForm.dateFrom = this._kqUtils.convertToKoneqtDate(new Date());
    this.filterForm.dateTo = this._kqUtils.convertToKoneqtDate(new Date());
    this.pmSearchBar.setFilterValue();
  }

  /**
   * Backdrop clicked
   */
  onBackdropClicked(): void {
    this.matDrawer.toggle();
  }

  /**
   * Open side nav
   */
  openTotalInfo(): void {
    this.matDrawer.open();
  }

  /**
   * Select task status
   *
   * @param status Task status
   */
  onSelectTaskStatus(status: string): void {
    this.selectedStatus = status;
    this.matDrawer.open();
  }

  /**
   * Table functions
   */
  initDisplayProjects(projects: PMProject[]): void {
    this._tableData = this.isValidGroup(this.groupByColumns) ?
      this.addGroups(projects, this.groupByColumns) : projects;
    this.dataSource.data = this.getProjectsOnPage();
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
    this.dataSource.filter = performance.now().toString();
  }

  /**
   * Init pagination
   */
  initPagination(projects: PMProject[]): void {
    this.pagination = {
      page: 0,
      size: this.paginationConfig.defaultPageSize,
      length: projects.length
    };
  }

  /**
   * Get groupby list
   *
   * @param groupBy Group by field
   * @returns Group list
   */
  getGroupList(groupBy: string): string[] {
    const groups = groupBy.split(',');
    for (const group of groups) {
      if (this.displayColumns.indexOf(group) === -1) {
        return [''];
      }
    }
    return groups;
  }

  /**
   *
   * @param pagination Pagination
   */
  paginationChanged(pagination: { pageSize: number; pageIndex: number }): void {
    if (pagination.pageIndex === 0) {
      this.pagination.size = pagination.pageSize;
      this.pagination.page = 0;
    } else {
      this.pagination.page = pagination.pageIndex - 1;
    }
    this.dataSource.data = this.getProjectsOnPage();
  }

  getProjectsOnPage(): any[] {
    const projects = this._tableData.slice(
      this.pagination.page * this.pagination.size,
      (this.pagination.page + 1) * this.pagination.size,
    );
    return projects;
  }

  setEditMode(selectedRow: any, colName: string): void {
    // Set value to row formGroup
    for (const field in this._rowFormGroup.controls) {
      if (Object.prototype.hasOwnProperty.call(this._rowFormGroup.controls, field)) {
        const control = this._rowFormGroup.controls[field];
        control.setValue(selectedRow[field]?.toString() || '');
      }
    }
    // Set width
    if (this.pmFields[this.selectedCell?.colName]?.Type === 'txa') {
      const col = this.columns.find(column => column.value === this.selectedCell.colName);
      col.width = 150;
    }
    if (this.pmFields[colName].Type === 'txa') {
      const col = this.columns.find(column => column.value === colName);
      col.width = 300;
    }
    // Update selectedCell
    this.selectedCell = {
      appDataId: selectedRow.AppDataId,
      colName: colName
    };
    // Update selectedFormControl
    this.selectedCellFormControl = this._rowFormGroup.controls[colName];
    // Update selectedArrField
    this.selectedCellArrField = this.pmFields[colName];
    // Update txlIdControl
    if (this.selectedCellArrField.Type === 'txl' && this.selectedCellArrField.Lookup?.id) {
      const txlIdField = this.selectedCellArrField.Lookup.id;
      this.selectedCellTxlControl = null;
      if (txlIdField && this._rowFormGroup.get(txlIdField)) {
        this.selectedCellTxlControl = this._rowFormGroup.controls[txlIdField];
      }
    }
  }

  onUpdateCell(): void {
    if (!this.selectedCell) {
      return;
    }
    if (this.pmFields[this.selectedCell.colName].Type !== 'txl') {
      // Single field update : Selected cell
      const fieldValue = this._rowFormGroup.controls[this.selectedCell.colName].value;
      this._adminviewService.updateField(
        'ProjectTask',
        this.selectedCell.appDataId,
        this.selectedCell.colName,
        fieldValue
      ).subscribe((res) => {
        if (res === true) {
          this._snackBar.open('Saved successfully!', '', {
            duration: 2000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          this.getProjects(this.filterForm, this.strGroupBy, this.selectedFilter);
        } else {
          this._kqUtils.fuseConfirmDialog(VALIDATION_MODAL_CONFIG, 'Update field failed');
        }
      });
    } else {
      // Multiple fields update : Selected txl cell and txl value cell
      this._thinqService.saveForm(this._rowFormGroup.value).subscribe(
        (res) => {
          if (res['Data'] === 'OK') {
            this._snackBar.open('Saved successfully!', '', {
              duration: 2000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            });
            this.getProjects(this.filterForm, this.strGroupBy, this.selectedFilter);
          } else {
            this._kqUtils.fuseConfirmDialog(VALIDATION_MODAL_CONFIG, res.Data);
          }
        }
      );
    }
    if (this.pmFields[this.selectedCell.colName].Type === 'txa') {
      const col = this.columns.find(column => column.value === this.selectedCell.colName);
      col.width = 150;
    }
    this.selectedCell = null;
  }

  isValidGroup(groupByCols: string[]): boolean {
    return groupByCols[0] !== '';
  }

  groupBy(event, column): void {
    event.stopPropagation();
    this.checkGroupByColumn(column.field, true);
    this.dataSource.data = this.addGroups(this.projects, this.groupByColumns);
    this.dataSource.filter = performance.now().toString();
  }

  checkGroupByColumn(field, add): void {
    let found = null;
    for (const column of this.groupByColumns) {
      if (column === field) {
        found = this.groupByColumns.indexOf(column, 0);
      }
    }
    if (found != null && found >= 0) {
      if (!add) {
        this.groupByColumns.splice(found, 1);
      }
    } else {
      if (add) {
        this.groupByColumns.push(field);
      }
    }
  }

  unGroupBy(event, column): void {
    event.stopPropagation();
    this.checkGroupByColumn(column.field, false);
    this.dataSource.data = this.addGroups(this.projects, this.groupByColumns);
    this.dataSource.filter = performance.now().toString();
  }

  // below is for grid row grouping
  customFilterPredicate(data: any | PMGroup, filter: string): boolean {
    return (data instanceof PMGroup) ? data.visible : this.getDataRowVisible(data);
  }

  getDataRowVisible(data: any): boolean {
    const groupRows = this._tableData.filter(
      (row: PMGroup) => {
        let match = true;
        this.groupByColumns.forEach((column) => {
          if (!row[column] || !data[column] || row[column] !== data[column]) {
            match = false;
          }
        });
        return match;
      }
    );

    if (groupRows.length === 0) {
      return true;
    }
    const parent = groupRows[0] as PMGroup;
    return parent.visible && parent.expanded;
  }

  groupHeaderClick(row): void {
    row.expanded = !row.expanded;
    this.dataSource.filter = performance.now().toString();  // bug here need to fix
  }

  addGroups(data: any[], groupByColumns: string[]): any[] {
    const rootGroup = new PMGroup();
    rootGroup.expanded = true;
    return this.getSublevel(data, 0, groupByColumns, rootGroup);
  }

  getSublevel(data: any[], level: number, groupByColumns: string[], parent: PMGroup): any[] {
    if (level >= groupByColumns.length) {
      return data;
    }
    const groups = this.uniqueBy(
      data.map(
        (row: PMGroup) => {
          const result = new PMGroup();
          result.level = level + 1;
          result.parent = parent;
          for (let i = 0; i <= level; i++) {
            result[groupByColumns[i]] = row[groupByColumns[i]];
          }
          return result;
        }
      ),
      JSON.stringify);

    const currentColumn = groupByColumns[level];
    let subGroups = [];
    groups.forEach((group: PMGroup) => {
      const rowsInGroup = data.filter(row => group[currentColumn] === row[currentColumn]);
      group.totalCounts = rowsInGroup.length;
      const subGroup = this.getSublevel(rowsInGroup, level + 1, groupByColumns, group);
      subGroup.unshift(group);
      subGroups = subGroups.concat(subGroup);
    });
    return subGroups;
  }

  uniqueBy(a, key): PMGroup[] {
    const seen = {};
    return a.filter((item) => {
      const k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  isGroup(index, item): boolean {
    return item.level;
  }

  getStartEndDate(): any {
    const dteStartDate = new Date();
    dteStartDate.setDate(1);
    const dteEndDate = new Date();
    return {
      startDate: this._kqUtils.convertToKoneqtDate(dteStartDate),
      endDate: this._kqUtils.convertToKoneqtDate(dteEndDate),
    };
  }

  /**
   *
   * @param col Column name
   * @returns Search query form control
   */
  getSearchControl(col: string): AbstractControl {
    return this._searchGroup.get(col);
  }
}
