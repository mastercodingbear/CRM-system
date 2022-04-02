import { PartyRole } from '@core/party/party.type';

export interface User {
  id: number;
  username: string;
  fullname: string;
  partyId: number | null;
  partyRoleArray: PartyRole[] | null;
}
