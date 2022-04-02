import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelateThinqComponent } from './relate-thinq.component';
import { RouterModule } from '@angular/router';
import { relateRoutes } from './relate-thinq.routing';
import { SharedModule } from 'app/shared/shared.module';
import { SharedThinqModule } from '@shared/thinq/thinq.module';
import { ExistingRelationshipsComponent } from '@modules/admin/relate-thinq/existing-relationships/existing-relationships.component';
import { NewRelationshipsComponent } from '@modules/admin/relate-thinq/new-relationships/new-relationships.component';
import { RelationSearchComponent } from '@modules/admin/relate-thinq/relation-search/relation-search.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';



@NgModule({
  declarations: [
    RelateThinqComponent,
    ExistingRelationshipsComponent,
    NewRelationshipsComponent,
    RelationSearchComponent
  ],
  imports: [
    RouterModule.forChild(relateRoutes),
    CommonModule,
    SharedModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    SharedThinqModule
  ]
})
export class RelateThinqModule { }
