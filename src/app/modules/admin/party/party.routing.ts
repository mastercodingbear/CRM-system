import { Route } from '@angular/router';
import { PartyComponent } from './party.component';
import { PartyResolver } from './party.resolver';

export const partyRoutes: Route[] = [
  {
    path: '',
    component: PartyComponent,
    resolve: {
      data: PartyResolver
    }
  }
];
