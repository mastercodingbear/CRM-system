import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThinqFormField } from '@core/thinq/thinq.type';

@Component({
  selector: 'app-thinq-field-ddl',
  templateUrl: './thinq-field-ddl.component.html',
  styleUrls: ['./thinq-field-ddl.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThinqFieldDdlComponent implements OnChanges {

  @Input() control: FormControl;
  @Input() arrField: ThinqFormField = {
    /* eslint-disable @typescript-eslint/naming-convention */
    Type: 'ddl',
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
    ExcludeFromApi: false,
    ExcludeFromView: false,
    GenerateLink: false,
    GenerateURL: false,
    InheritsFrom: '',
    Valid: true,
    Update: true,
    ErrorMessage: '',
    RenderLevel: '',
    Value: '',
    Changed: '',
    Options: null,
    ChangeAudit: null
  };
  @Input() labelVisibility: boolean;
  options: {
    value: string;
    label: string;
  }[];
  blnClearable: boolean = true;
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.options = [];
    // Convert options to can used in ng-select
    for (const optionKey in this.arrField.Options) {
      if (Object.prototype.hasOwnProperty.call(this.arrField.Options, optionKey)) {
        this.options.push({
          value: optionKey,
          label: this.arrField.Options[optionKey]
        });
      }
    }
    // If there's empty value in options, set the clearable false
    if (this.arrField.Options) {
      const findIndex = Object.values(this.arrField.Options).findIndex(option => option === null || option === '');
      this.blnClearable = (findIndex === -1);
    }
  }
}
