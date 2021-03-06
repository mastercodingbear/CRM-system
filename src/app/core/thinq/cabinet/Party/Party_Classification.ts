/* eslint-disable @typescript-eslint/naming-convention */
import { ThinqFormFieldUI } from '@core/thinq/thinq.type';

export class Party_Classification {
  fields: ThinqFormFieldUI[] = [
    {
      fieldName: 'Status',
      startCol: 1,
      endCol: 4
    },
    {
      fieldName: 'PartyType',
      startCol: 4,
      endCol: 7
    },
    {
      fieldName: 'DateFrom',
      startCol: 7,
      endCol: 10
    },
    {
      fieldName: 'DateTo',
      startCol: 10,
      endCol: 13
    },
    {
      fieldName: 'PartyName'
    },
    {
      fieldName: 'PartyClassification'
    },
    {
      fieldName: 'Description'
    },
    {
      fieldName: 'Tag',
      startCol: 1,
      endCol: 13
    }
  ];
  constructor() {
  }
}
