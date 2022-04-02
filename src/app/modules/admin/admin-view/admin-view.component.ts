/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { debounceTime, map, Observable, Subject, takeUntil } from 'rxjs';
import { ThinqListBasicData } from '@core/admin-view/admin-view.type';
import { SEARCH_OPERATORS, PAGINATION_CONFIG } from '@core/config/admin-view.config';
import { VALIDATION_MODAL_CONFIG } from '@core/config/thinq.config';
import { AdminViewPagination, ThinqFormField } from '@core/thinq/thinq.type';
import { KoneQTUtils } from '@core/utils/koneqt.utils';
import { ThinqService } from '@modules/admin/thinq/thinq.service';
import { AdminViewService } from './admin-view.service';
import { CabinetClass } from '@core/config/app.config';
import { FuseLoadingService } from '@fuse/services/loading';

interface SearchQuery {
  field: string;
  value: string;
}

@Component({
  selector: 'admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminViewComponent implements OnInit, OnDestroy {

  thinqList: ThinqListBasicData[];
  headerClass: CabinetClass;
  displayColumns: string[] = ['View'];
  visibleColumns: Record<string, boolean> = { View: true };
  widthColumns: Record<string, number>;
  cabinet: string;
  isLoading$: Observable<boolean>;
  // pagination
  pagination: AdminViewPagination;
  paginationConfig = PAGINATION_CONFIG;
  pageIndex: number;
  pageSize: number = PAGINATION_CONFIG.defaultPageSize;
  // Search input visible in column
  searchColVisible: Record<string, boolean> = {};
  searchOperator: Record<string, string> = {};
  searchColumnOperators = SEARCH_OPERATORS;
  selectedCell: {
    appDataId: number;
    fieldName: string;
  } = null;
  selectedCellFormControl: AbstractControl;
  selectedCellTxlControl: AbstractControl;
  selectedCellArrField: ThinqFormField;

  private _columns: Record<string, ThinqFormField>;
  private _rowFormGroup: FormGroup;
  private _sortQuery = [];
  private _searchGroup: FormGroup;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _loadingService: FuseLoadingService,
    private _adminviewService: AdminViewService,
    private _thinqService: ThinqService,
    private _kqUtils: KoneQTUtils
  ) { }

  ngOnInit(): void {
    // Get cabinet class and initialize sortQuery
    this._adminviewService.cabinet$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cabinet: string) => {
        this.cabinet = cabinet;
        this._sortQuery = [];
      });

    // Get the thinq list
    this._adminviewService.data$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: ThinqListBasicData[]) => {
        this.thinqList = data;
      });

    // Get header class for cabinet header of datatable
    this._adminviewService.headerClass$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((headerClass: CabinetClass) => {

        this.headerClass = headerClass;
      });

    // Get columns of table and initialize related data
    this._adminviewService.columns$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((columns: Record<string, ThinqFormField>) => {
        // Update the object columns
        this._columns = columns;
        // Convert object cols to array
        const arrayColumns = [];
        for (const key in this._columns) {
          if (Object.prototype.hasOwnProperty.call(this._columns, key)) {
            const colTemp = { ...this._columns[key], FieldName: key };
            arrayColumns.push(colTemp);
          }
        }
        // Initialize displayColumns and widthColumns
        this.displayColumns = ['View'];
        this.widthColumns = { View: 80 };
        // Init SearchGroup
        this._searchGroup = new FormGroup({});
        // Init FormGroup of selected row for save
        this._rowFormGroup = new FormGroup({});
        this._rowFormGroup.addControl('AppDataId', new FormControl(''));
        // Filter cols not htm and set value
        arrayColumns.filter(field => field.Type !== 'htm')
          .map((field: any) => {
            if (field.ExcludeFromView === false) {
              this.displayColumns.push(field.FieldName);
              this.visibleColumns[field.FieldName] = true;
              // this._widthColumns[field.FieldName] = field.Width;
              this.widthColumns[field.FieldName] = 150;
              this._searchGroup.addControl(field.FieldName, new FormControl(''));
              this.searchColVisible[field.FieldName] = false;
            }
            this._rowFormGroup.addControl(field.FieldName, new FormControl(''));
          });
      });

    // Get the pagination
    this._adminviewService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((pagination: AdminViewPagination) => {

        // Update the pagination
        this.pagination = pagination;
      });

    // Trigger when search form changes
    this._searchGroup.valueChanges
      .pipe(
        debounceTime(300),
        map(() => {
          this.getThinqList();
        })
      ).subscribe();

    this.isLoading$ = this._loadingService.show$;
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Get Thinq List
   */
  getThinqList(): void {
    const searchQuery = this.getSearchQuery(this.searchOperator, this._searchGroup);
    this._adminviewService.getData(
      this.cabinet,
      this.pageIndex,
      this.pageSize,
      this._sortQuery,
      searchQuery
    ).subscribe();
  }

  paginationChanged(pagination: { pageSize: number; pageIndex: number }): void {
    if (pagination.pageIndex === 0) {
      this.pageSize = pagination.pageSize;
      this.pageIndex = 1;
    } else {
      this.pageIndex = pagination.pageIndex;
    }
    this.getThinqList();
  }

  /**
   * Update search operator
   *
   * @param searchColumn Search column
   * @param operator Search operator
   */
  onSearchOption(searchColumn: string, operator: string): void {
    // Set search value
    this.searchOperator[searchColumn] = operator;
    this.getThinqList();
  }

  /**
   * Add Sort Column to sortQuery
   *
   * @param e Sort option
   */
  sortCol(e: Sort): void {
    this._sortQuery = this._sortQuery.filter(col => col.active !== e.active);
    if (e.direction !== '') {
      this._sortQuery = [...this._sortQuery, e];
    }

    this.getThinqList();
  }

  /**
   * Open Thinq
   *
   * @param appDataId Thinq ID
   */
  onOpenThinq(appDataId: string): void {
    this._router.navigate(['/admin/thinq/' + appDataId]);
  }

  /**
   * Generate search query
   *
   * @param operator Search operator object {FieldName: Search operator} i.e. ProjectName: *
   * @param searchGroup Search query form Group
   * @returns Search query
   * i.e. [ { field: Status, value: !open }, { field: ProjectName, value: *abc } ]
   */
  getSearchQuery(operator: any, searchGroup: FormGroup): SearchQuery[] {
    const value = searchGroup.value;
    const searchQuery: SearchQuery[] = [];
    for (const fieldName in value) {
      if (Object.prototype.hasOwnProperty.call(value, fieldName)) {
        const searchValue = value[fieldName];
        if (searchValue) {
          if (operator[fieldName] === undefined) {
            operator[fieldName] = '*';
          }
          searchQuery.push({
            field: fieldName,
            value: operator[fieldName] + searchValue
          });
        } else {
          if (operator[fieldName] !== undefined) {
            delete operator[fieldName];
          }
        }
      }
    }
    return searchQuery;
  }

  /**
   * Set value of selected row to FormGroup
   *
   * @param selectedRow Selected ThinqListBasicData
   * @param col Selected column
   */
  setEditMode(selectedRow: ThinqListBasicData, col: string): void {
    // Set value to row formGroup
    for (const field in this._rowFormGroup.controls) {
      if (Object.prototype.hasOwnProperty.call(this._rowFormGroup.controls, field)) {
        const control = this._rowFormGroup.controls[field];
        control.setValue(selectedRow[field].toString());
      }
    }
    // Set width
    if (this._columns[this.selectedCell?.fieldName]?.Type === 'txa') {
      this.widthColumns[this.selectedCell?.fieldName] = 150;
    }
    if (this._columns[col].Type === 'txa') {
      this.widthColumns[col] = 300;
    }
    // Update selectedCell
    this.selectedCell = {
      appDataId: selectedRow.AppDataId,
      fieldName: col
    };
    // Update selectedFormControl
    this.selectedCellFormControl = this._rowFormGroup.controls[col];
    // Update selectedArrField
    this.selectedCellArrField = this._columns[col];
    // Update txlIdControl
    if (this.selectedCellArrField.Type === 'txl' && this.selectedCellArrField.Lookup?.id) {
      const txlIdField = this.selectedCellArrField.Lookup.id;
      this.selectedCellTxlControl = null;
      if (txlIdField && this._rowFormGroup.get(txlIdField)) {
        this.selectedCellTxlControl = this._rowFormGroup.controls[txlIdField];
      }
    }
  }

  /**
   * Update value of selected field
   */
  onUpdateField(): void {
    if (!this.selectedCell) {
      return;
    }
    if (this._columns[this.selectedCell.fieldName].Type !== 'txl') {
      // Single field update : Selected cell
      const fieldValue = this._rowFormGroup.controls[this.selectedCell.fieldName].value;
      this._adminviewService.updateField(
        this.cabinet,
        this.selectedCell.appDataId,
        this.selectedCell.fieldName,
        fieldValue
      ).subscribe((res) => {
        if (res === true) {
          this._snackBar.open('Saved successfully!', '', {
            duration: 2000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          this.getThinqList();
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
            this.getThinqList();
          } else {
            this._kqUtils.fuseConfirmDialog(VALIDATION_MODAL_CONFIG, res.Data);
          }
        }
      );
    }
    if (this._columns[this.selectedCell.fieldName].Type === 'txa') {
      this.widthColumns[this.selectedCell.fieldName] = 150;
    }
    this.selectedCell = null;
  }

  /**
   * Get columns that can be visible
   *
   * @returns Fitler visible columns
   */
  filterColumn(): string[] {
    return this.displayColumns.filter(col => this.visibleColumns[col]);
  }

  /**
   *
   * @param col Column name
   * @returns Search query form control
   */
  getSearchControl(col: string): AbstractControl {
    return this._searchGroup.get(col);
  }

  /**
   * Check if search column
   *
   * @param col Column name
   * @returns boolean
   */
  isSearchCol(col: string): boolean {
    return this._searchGroup.get(col).value === '';
  }
}
