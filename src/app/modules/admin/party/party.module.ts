import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartyComponent } from './party.component';
import { RouterModule } from '@angular/router';
import { partyRoutes } from './party.routing';



@NgModule({
  declarations: [
    PartyComponent
  ],
  imports: [
    RouterModule.forChild(partyRoutes),
    CommonModule
  ]
})
export class PartyModule { }
