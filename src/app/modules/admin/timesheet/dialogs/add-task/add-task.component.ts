/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TimesheetTask } from '@core/timesheet/timesheet.type';
import { KoneQTUtils } from '@core/utils/koneqt.utils';
import { ThinqFormField } from 'app/core/thinq/thinq.type';
import { groupBy } from 'lodash-es';

@Component({
  selector: 'timesheet-add-task',
  templateUrl: './add-task.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AddTaskComponent implements OnInit {

  timesheetForm: FormGroup;
  openProjectField: ThinqFormField;
  tasksByProject: Record<string, TimesheetTask[]>;
  openTaskField: ThinqFormField;
  constructor(
    public matDialogRef: MatDialogRef<AddTaskComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: { openTasks: TimesheetTask[] },
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _kqUtils: KoneQTUtils
  ) { }

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.timesheetForm = this._formBuilder.group({
      openProject: [''],
      openTask: ['', [Validators.required]]
    });
    // Generate project ddl option
    const projectOption = {};
    this.tasksByProject = groupBy(this._data.openTasks, 'ProjectId');
    for (const projectId in this.tasksByProject) {
      if (Object.prototype.hasOwnProperty.call(this.tasksByProject, projectId)) {
        const tasks = this.tasksByProject[projectId];
        projectOption[tasks[0].ProjectId] = tasks[0].Project;
      }
    }
    // Generate task ddl option
    const taskOption = this._kqUtils.generateTxlOptionByArray(this._data.openTasks, 'Abstract', 'AppDataId');

    const projectField = this.timesheetForm.controls['openProject'];
    projectField.valueChanges.subscribe((projectId: number) => {
      if (projectId === null) {
        // User didn't select parent project
        // Set ddl field value to projectTask field
        this.openTaskField = {
          ...this.openTaskField,
          Options: this._kqUtils.generateTxlOptionByArray(this._data.openTasks, 'Abstract', 'AppDataId')
        };
        this._changeDetectorRef.markForCheck();
      } else {
        // User selected project and search tasks from it
        const tasks = this.tasksByProject[projectId];
        if (tasks) {
          // Set ddl field value to projectTask field
          this.openTaskField = {
            ...this.openTaskField,
            Options: this._kqUtils.generateTxlOptionByArray(tasks, 'Abstract', 'AppDataId')
          };
          this._changeDetectorRef.markForCheck();
        }
      }
    });
    this.openProjectField = { Type: 'ddl', Label: 'Open Project assigned to you', Options: projectOption };
    this.openTaskField = { Type: 'ddl', Label: 'Open Task assigned to you', Options: taskOption };
  }
  /**
   * Create timesheet and close
   */
  createTimesheet(): void {
    if (this.timesheetForm.invalid) {
      return;
    }
    const openTask = Number(this.timesheetForm.controls['openTask'].value);
    const task = this._data.openTasks.find(ts => ts.AppDataId === openTask);
    // Close the dialog
    this.matDialogRef.close({
      project: task.ProjectId,
      task: openTask
    });
  }

  /**
   * Discard the message
   */
  discard(): void {
    this.timesheetForm.reset({ openProject: '', openTask: '' });
    // Close the dialog
    this.matDialogRef.close(null);
  }
}
