/* eslint-disable @typescript-eslint/naming-convention */
export interface TimesheetTask {
  Abstract: string;
  AppDataId: number;
  AssignedTo: string;
  AssignedToName: string;
  BFTB: string;
  Description: string;
  Epic: string;
  EpicId: string;
  ExpectedStart: string;
  Nature: string;
  Owner: string;
  OwnerId: string;
  ParentTask: string;
  ParentTaskName: string;
  Project: string;
  ProjectId: string;
  Status: string;
  Type: string;
  projectid: number;
  projectname: string;
  projectuser: string;
  projectuserid: string;
}

export interface Timesheet {
  Activity: string;
  BFTB?: string;
  BillingCode?: string;
  Description?: string;
  Entity?: string;
  Nature?: string;
  Owner?: string;
  OwnerId?: string;
  PRId: number;
  PTDateCreated?: string;
  Project?: string;
  StartDate: string;
  StatusTask?: string;
  TSDateCreated?: string;
  TSStatus?: string;
  TSUser?: string;
  TSUserId?: string;
  Task?: string;
  TaskId: number;
  TaskUser?: string;
  TaskUserId?: string;
  Time: number;
  TimeId: string | number;
}

export interface TimeTracker {
  projectId: number;
  taskId: number;
  activity: string;
  timeId: string;
  trackedTime: number;
  trackStartTime: string;
}
