import { CabinetClass } from '@core/config/app.config';
import { ThinqFormField } from '@core/thinq/thinq.type';

/* eslint-disable @typescript-eslint/naming-convention */
export interface ThinqListResponse {
  Class: CabinetClass;
  ClassId: number;
  ClassName: string;
  Data: any[];
  Fields: Record<string, ThinqFormField>;
  Fields2?: CabinetClassField[];
  PageNumber: number;
  PageSize: number;
  QueryTime: string;
  RowCount: number;
}

export interface GetDataResponse {
  ClassId: number;
  ClassName: string;
  Data: any[];
  Fields: Record<string, ThinqFormField>;
  PageNumber: number;
  PageSize: number;
  QueryTime: string;
  RowCount: number;
}

export interface ThinqListBasicData {
  Abstract: string;
  AppDataId: number;
  AssignedTo: string;
  AssignedToName: string;
  Description: string;
  EndDate: string;
  ExpectedEnd: string;
  ExpectedStart: string;
  ProjectEpicId: string;
  StartDate: string;
  Status: string;
  Tag: string;
  TimeStamp: string;
  Value: string;
}

export interface CabinetClassField {
  ClassFieldId: number;
  ClassId: number;
  DataType: string;
  ExcludeFromApi: number;
  ExcludeFromSearch: number;
  ExcludeFromView: number;
  FieldLabel: string;
  FieldName: string;
  InheritsFrom: string;
  Mandatory: number;
  ReadOnly: number;
  RenderType: string;
  Width: number;
}
