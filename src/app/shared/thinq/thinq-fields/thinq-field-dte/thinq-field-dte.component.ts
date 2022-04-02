import { DatePipe } from '@angular/common';
import { Component, DoCheck, Input, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThinqFormField } from '@core/thinq/thinq.type';
import { KoneQTUtils } from '@core/utils/koneqt.utils';

@Component({
  selector: 'app-thinq-field-dte',
  templateUrl: './thinq-field-dte.component.html',
  styleUrls: ['./thinq-field-dte.component.scss'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ThinqFieldDteComponent implements DoCheck {

  @Input() control: FormControl;
  @Input() arrField: ThinqFormField = {
    /* eslint-disable @typescript-eslint/naming-convention */
    Type: 'dte',
    DataType: 'txt',
    Label: '',
    Width: 50,
    Format: '',
    Align: '',
    //22/10/2018 NR added for fields to be logged
    AuditStatus: false,
    Mandatory: false,
    ReadOnly: false,
    Default: '',
    ExcludeFromSearch: false,
    ExcludeFromView: false,
    ExcludeFromApi: false,
    GenerateLink: false,
    GenerateURL: false,
    InheritsFrom: '',
    Valid: true,
    Update: true,
    ErrorMessage: '',
    RenderLevel: '',
    Value: '',
    Changed: '',
    ChangeAudit: null
  };
  @Input() labelVisibility: boolean;
  dateControl: FormControl;
  oldDate: string = null;

  constructor(
    private _kqUtils: KoneQTUtils
  ) { }

  /**
   * There are 2 form control: one for date field and the other is for thinq form
   */
  ngDoCheck(): void {
    const currentControlValue = this.control.value;
    if (currentControlValue !== this.oldDate) {
      if (!this.oldDate) {
        // Initialize date control of date field
        this.dateControl = new FormControl();
        this.dateControl.valueChanges.subscribe(
          (date) => {
            // Set koneqt format date in form control when dateControl value changes
            if (!date) {
              this.control.setValue('');
            } else {
              const stringD = this._kqUtils.convertToKoneqtDate(date);
              this.control.setValue(stringD);
            }
          }
        );
        // Set initial value
        const d = new Date(this._kqUtils.convertToNormalDate(currentControlValue));
        if (!isNaN(d.getTime())) {
          this.dateControl.setValue(d);
        } else {
          this.control.setValue('');
        }
        // Update oldDate
        this.oldDate = currentControlValue;
      } else {
        const d = new Date(this._kqUtils.convertToNormalDate(currentControlValue));
        // Check if invalid date
        if (!isNaN(d.getTime())) {
          this.dateControl.setValue(d);
        } else {
          this.control.setValue('');
        }
        this.oldDate = currentControlValue;
      }
    }
  }
}
