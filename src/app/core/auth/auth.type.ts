/* eslint-disable @typescript-eslint/naming-convention */
import { PartyRole } from '@core/party/party.type';

export interface SignInResponse {
  Authenticated: boolean;
  ClientKey: string;
  DateTimeCreated: KoneQTDate;
  FirstName: string;
  LastName: string;
  Message: string;
  PartyId: string;
  PartyRoleArray: PartyRole[];
  StayOnPageAfterSave: 'Yes' | 'No';
  TimeZone: string;
  Token: string;
  TokenExpires: KoneQTDate;
  date: string;
  timezone_type: number;
  timezone: string;
  UserId: number;
  License?: string;
  LicenseAgreement?: boolean;
  LicenseClickWarpLicense: number;
};

export interface KoneQTDate {
  date: string;
  timezone_type: number;
  timezone: string;
}
