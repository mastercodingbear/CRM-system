/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThinqFormField } from '@core/thinq/thinq.type';
import { PMFilterForm } from '@core/project-management/pm.type';

@Component({
  selector: 'pm-dashboard-searchbar',
  templateUrl: './pm-search.component.html',
  encapsulation: ViewEncapsulation.None
})
export class PMSearchComponent implements OnInit {

  @Input() userArray: Record<string, string>;
  @Input() filterForm: PMFilterForm;
  @Output() filterEvent: EventEmitter<PMFilterForm> = new EventEmitter<PMFilterForm>();

  searchForm: FormGroup = new FormGroup({});
  searchFields: ThinqFormField[] = [];

  constructor(
    private _formBuilder: FormBuilder,
  ) { }

  /**
   * On init
   */
  ngOnInit(): void {
    for (const key in this.filterForm) {
      if (Object.prototype.hasOwnProperty.call(this.filterForm, key)) {
        const filter = this.filterForm[key];
        this.searchForm.addControl(key, this._formBuilder.control(filter, Validators.required));
      }
    }
    this.searchFields = [
      { Type: 'dte', Label: 'Date From', Value: this.filterForm.dateFrom },
      { Type: 'dte', Label: 'Date To', Value: this.filterForm.dateTo },
      { Type: 'toggle', Label: 'Ignore Closed Tasks?' },
      { Type: 'toggle', Label: 'Ignore Time' },
      { Type: 'ddl', Label: 'Select User', Options: this.userArray },
      { Type: 'ddl', Label: 'Select Owner', Options: this.userArray },
    ];
  }

  /**
   * Set search filter value
   */
  setFilterValue(): void {
    this.searchForm.setValue(this.filterForm);
    this.applyFilter();
  }

  /**
   * Apply filter
   */
  applyFilter(): void {
    this.filterEvent.emit(this.searchForm.value);
  }

  /**
   * Get filter value
   *
   * @param label Filter label
   * @returns Filter value
   */
  getField(label: string): string {
    const fieldLabel = {
      'Date From': 'dateFrom',
      'Date To': 'dateTo',
      'Ignore Closed Tasks?': 'blnIgnoreClosed',
      'Ignore Time': 'blnIgnoreDate',
      'Select User': 'selectUser',
      'Select Owner': 'selectOwner'
    };
    return fieldLabel[label];
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.Label || index;
  }
}
