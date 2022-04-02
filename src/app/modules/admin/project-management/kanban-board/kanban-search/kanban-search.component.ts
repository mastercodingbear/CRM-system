/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PMKanbanProject } from '@core/project-management/pm.type';
import { ThinqFormField } from '@core/thinq/thinq.type';
import { debounceTime, map } from 'rxjs';

interface OptionKey {
  name: string;
  id: string;
  value: string;
}

interface OptionValue {
  value: string;
  label: string;
}

@Component({
  selector: 'pm-kanban-search',
  templateUrl: './kanban-search.component.html',
  encapsulation: ViewEncapsulation.None
})
export class PMKanbanSearchComponent implements OnInit, OnChanges {

  @Input() projectTasks: PMKanbanProject[];
  @Output() searchEvent: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  searchForm: FormGroup;
  searchFields: ThinqFormField[] = [];
  optionArray: Record<string, Record<string, string>> = {};
  optionKeyValue: OptionKey[] = [
    { name: 'epicOptions', id: 'EpicId', value: 'Epic' },
    { name: 'projectOptions', id: 'projectid', value: 'projectname' },
    { name: 'subprojectOptions', id: 'ParentTask', value: 'ParentTaskName' },
    { name: 'natureOptions', id: 'Nature', value: 'Nature' },
    { name: 'typeOptions', id: 'Type', value: 'Type' },
    { name: 'assignedtoOptions', id: 'AssignedTo', value: 'AssignedToName' },
    { name: 'ownerOptions', id: 'OwnerId', value: 'Owner' },
  ];
  updateOptionKeyValue: OptionKey[] = [
    { name: 'projectOptions', id: 'projectid', value: 'projectname' },
    { name: 'subprojectOptions', id: 'ParentTask', value: 'ParentTaskName' },
  ];
  constructor(
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    // Create the form
    this.searchForm = this._formBuilder.group({
      project: [''],
      nature: [''],
      subproject: [''],
      type: [''],
      epic: [''],
      assignedto: [''],
      owner: [''],
      datefrom: [''],
      dateto: [''],
      search: [''],
    });
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        map(() => {
          this.searchEvent.emit(this.searchForm);
        })
      ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes.projectTasks.firstChange) {
      this.generateInitialOptions(changes.projectTasks.currentValue);
    } else {
      this.generateProjectOptions(changes.projectTasks.currentValue);
    }
  }

  /**
   * Generate Initial Search form fields options
   *
   * @param tasks ProjectTasks
   */
  generateInitialOptions(tasks: PMKanbanProject[]): void {
    for (const task of tasks) {
      for (const option of this.optionKeyValue) {
        const optionKey = task[option.id];
        const optionValue = task[option.value];
        if (!this.optionArray[option.name]) {
          this.optionArray[option.name] = { '': 'All' };
        }
        this.optionArray[option.name][optionKey] = optionValue;
      }
    }
    this.searchFields = [];
    this.searchFields.push(
      { Type: 'dte', Label: 'datefrom' },
      { Type: 'dte', Label: 'dateto' },
      { Type: 'ddl', Label: 'epic', Options: this.optionArray['epicOptions'] },
      { Type: 'ddl', Label: 'project', Options: this.optionArray['projectOptions'] },
      { Type: 'ddl', Label: 'subproject', Options: this.optionArray['subprojectOptions'] },
      { Type: 'ddl', Label: 'nature', Options: this.optionArray['natureOptions'] },
      { Type: 'ddl', Label: 'type', Options: this.optionArray['typeOptions'] },
      { Type: 'ddl', Label: 'assignedto', Options: this.optionArray['assignedtoOptions'] },
      { Type: 'ddl', Label: 'owner', Options: this.optionArray['ownerOptions'] },
      { Type: 'txt', Label: 'search' },
    );
  }

  /**
   * Generate search fields options which are related to Project
   * i.e. Project field, SubProject field
   *
   * @param tasks Project Tasks
   */
  generateProjectOptions(tasks: PMKanbanProject[]): void {
    for (const option of this.updateOptionKeyValue) {
      this.optionArray[option.name] = {};
    }
    for (const task of tasks) {
      for (const option of this.updateOptionKeyValue) {
        const optionKey = task[option.id];
        const optionValue = task[option.value];
        this.optionArray[option.name][optionKey] = optionValue;
      }
    }
    this.searchFields[3].Options = this.optionArray['projectOptions'];
    this.searchFields[4].Options = this.optionArray['subprojectOptions'];
  }
}
