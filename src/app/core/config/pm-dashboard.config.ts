/* eslint-disable @typescript-eslint/naming-convention */
export const DASHBOARD_COLUMNS = [
  {
    field: 'Id',
    value: 'AppDataId',
    width: 50,
  },
  {
    field: 'Age',
    value: 'age',
    width: 50,
  },
  {
    field: 'User',
    value: 'AssignedToName',
    width: 130,
  },
  {
    field: 'Owner',
    value: 'Owner',
    width: 130,
  },
  {
    field: 'Nature',
    value: 'Nature',
    width: 110,
  },
  {
    field: 'Status',
    value: 'Status',
    width: 60,
  },
  {
    field: 'Type',
    value: 'Type',
    width: 60,
  },
  {
    field: 'Due',
    value: 'DueDate',
    width: 100,
  },
  {
    field: 'Defer',
    value: 'DeferDate',
    width: 100,
  },
  {
    field: 'Description',
    value: 'Description',
    width: 200,
  },
  {
    field: 'Project',
    value: 'Project',
    width: 150,
  },
  {
    field: 'Epic',
    value: 'Epic',
    width: 150,
  },
  {
    field: 'Parent',
    value: 'ParentTaskName',
    width: 150,
  },
  {
    field: 'Sequence',
    value: 'Sequence',
    width: 150,
  },
  {
    field: 'Value',
    value: 'Value',
    width: 50,
  },
  {
    field: 'Estimate',
    value: 'Estimate',
    width: 80,
  },
  {
    field: 'BFTB',
    value: 'BFTB',
    width: 50,
  },
];

export const FILTER_FUNCTIONS = {
  'Today': {
    getProject: 'Summary',
    getCountInfo: 'doCountTasks'
  },
  'OverDue': {
    getProject: 'OverDue',
    getCountInfo: 'OverDueCount'
  },
  'Pending': {
    getProject: 'Summary',
    getCountInfo: 'doCountTasks',
    status: 'Pending'
  },
  'Someday': {
    getProject: 'Summary',
    getCountInfo: 'doCountTasks',
    status: 'Someday'
  },
  'NoDueDate': {
    label: 'No Due Date',
    getProject: 'NoDueDate',
    getCountInfo: 'doCountTasks'
  },
  'Orphaned': {
    getProject: 'Orphan',
    getCountInfo: 'doCountTasks'
  }
};

export const SEARCH_COL_VISIBLE = {
  'Age': false,
  'User': false,
  'Owner': false,
  'Nature': false,
  'Status': false,
  'Type': false,
  'Due': false,
  'Defer': false,
  'Description': false,
  'Project': false,
  'Epic': false,
  'Parent': false,
  'Sequence': false,
  'Value': false,
  'Estimate': false,
  'BFTB': false,
};
