/* eslint-disable @typescript-eslint/naming-convention */
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ThinqFormField, ThinqFormFieldUI } from '@core/thinq/thinq.type';
import { KoneQTUtils } from '@core/utils/koneqt.utils';
import {
  // Communication cabinets
  Campaign,
  Email,
  GeoLocation,
  Group,
  Party_Contact_Mechanism,
  Sms,
  TemplateMessage,
  // CRM cabinets
  Contact,
  Opportunity,
  Organisation,
  // Documentation cabinets
  Document,
  // Party cabinets
  Party_Classification,
  Party_Organisation,
  Party_Person,
  Party_Relationship_Link,
  Party_Role_Link,
  // Party definition cabinets
  Party_Classification_Def,
  Party_Relationship_Def,
  Party_Role_Def,
  // Project cabinets
  Action,
  ProjectEpic,
  Project,
  ProjectTask,
  Timesheet,
  // Recruitment cabinets
  Application,
  Candidate,
  CandidateAction,
  Job,
  WebPostAdo,
  // Survey cabinets
  Survey,
  Survey_Answer,
  Survey_Question,
  // System cabinets
  User,
  System_Org,
  FilteredList,
  Lookup,
  Repeater
} from '@core/thinq/cabinet';

@Component({
  selector: 'app-thinq-form',
  templateUrl: './thinq-form.component.html',
  styleUrls: ['./thinq-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ThinqFormComponent implements OnInit, OnChanges {

  @Input() cabinet: string;
  @Input() arrFields: BehaviorSubject<ThinqFormField[]>;
  fields: ThinqFormFieldUI[];
  thinqForm: FormGroup;
  thinqSaveForm: any;
  objectKeys = Object.keys;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Get custom layout fields
   *
   * @param cabinet Cabinet class name
   * @returns Formfield UI
   */
  getCabinetFields(cabinet: string): ThinqFormFieldUI[] {
    const cabinetFields = {
      // CRM
      'Contact': new Contact().fields,
      'Opportunity': new Opportunity().fields,
      'Organisation': new Organisation().fields,
      // Communication
      'Campaign': new Campaign().fields,
      'Email': new Email().fields,
      'GeoLocation': new GeoLocation().fields,
      'Group': new Group().fields,
      'TemplateMessage': new TemplateMessage().fields,
      'Party_Contact_Mechanism': new Party_Contact_Mechanism().fields,
      'Sms': new Sms().fields,
      // Documentation
      'Document': new Document().fields,
      // Party
      'Party_Organisation': new Party_Organisation().fields,
      'Party_Classification': new Party_Classification().fields,
      'Party_Person': new Party_Person().fields,
      'Party_Relationship_Link': new Party_Relationship_Link().fields,
      'Party_Role_Link': new Party_Role_Link().fields,
      // Party definitions
      'Party_Classification_Def': new Party_Contact_Mechanism().fields,
      'Party_Relationship_Def': new Party_Relationship_Def().fields,
      'Party_Role_Def': new Party_Role_Def().fields,
      // Project
      'Action': new Action().fields,
      'ProjectEpic': new ProjectEpic().fields,
      'Project': new Project().fields,
      'ProjectTask': new ProjectTask().fields,
      'Timesheet': new Timesheet().fields,
      // Recruitment
      'Application': new Application().fields,
      'Candidate': new Candidate().fields,
      'CandidateAction': new CandidateAction().fields,
      'Job': new Job().fields,
      'WebPostAdo': new WebPostAdo().fields,
      // Survey
      'Survey': new Survey().fields,
      'Survey_Question': new Survey_Question().fields,
      'Survey_Answer': new Survey_Answer().fields,
      // System
      'FilteredList': new FilteredList().fields,
      'Lookup': new Lookup().fields,
      'Repeater': new Repeater().fields,
      'System_Org': new System_Org().fields,
      'User': new User().fields
    };
    return cabinetFields[cabinet] || null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', this.arrFields);
    this.thinqForm = new FormGroup({});
    this.fields = this.getCabinetFields(this.cabinet);
    if (this.fields) {
      // Exist custom cabinet layout form
      for (const iterator of this.fields) {
        const thinqField = this.arrFields[iterator.fieldName];
        if (!thinqField) {
          continue;
        }
        const value = thinqField.Value.toString();
        if (thinqField.Type === 'txl' && thinqField.Lookup?.id) {
          const txlIdField = this.arrFields[thinqField.Lookup['id']];
          if (txlIdField) {
            this.thinqForm.addControl(thinqField.Lookup['id'], new FormControl(txlIdField.Value));
          }
        }
        this.thinqForm.addControl(iterator.fieldName, new FormControl(value));
      }
    } else {
      // Basic form layout
      for (const key in this.arrFields) {
        if (Object.prototype.hasOwnProperty.call(this.arrFields, key)) {
          const field = this.arrFields[key];
          const value = field.Value.toString();
          this.thinqForm.addControl(key, new FormControl(value));
        }
      }
    }
    // Save the thinq form value
    this.thinqSaveForm = this.thinqForm.value;
  }

  /**
   * Get column class
   *
   * @param fieldUI Thinq form field
   * @param type Field type
   * @returns Column class
   */
  generateCol(fieldUI: ThinqFormFieldUI, type: string): string {
    if (fieldUI.startCol && fieldUI.endCol) {
      return `sm:col-start-${fieldUI.startCol} sm:col-end-${fieldUI.endCol}`;
    } else if (!['txa', 'htm'].includes(type)) {
      return 'sm:col-span-6';
    }
  }

  /**
   * Get value control of txl control
   *
   * @param fieldName Field name of txl value
   * i.e. `ProjectTaskId` can be txl value field of `ProjectTask` txl field
   * If user lookup value from txl field and choose one of them,
   * then should upgrade txl field and txl value field like `ProjectTask`, `ProjectTaskId`
   */
  getTxlControl(fieldName: string): AbstractControl {
    const thinqTxlField = this.arrFields[fieldName];
    if (thinqTxlField.Type !== 'txl' || !thinqTxlField.Lookup?.id) {
      return null;
    }
    const txlIdField = thinqTxlField.Lookup['id'];
    if (txlIdField && this.thinqForm.get(txlIdField)) {
      return this.thinqForm.controls[txlIdField];
    }
    return null;
  }

  /**
   * Reset thinq form
   */
  resetForm(): void {
    this.thinqForm.reset(this.thinqSaveForm);
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: ThinqFormFieldUI): string | number {
    return item.fieldName || index;
  }
}
