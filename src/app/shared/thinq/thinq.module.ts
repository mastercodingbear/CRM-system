import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassGroupComponent } from '@shared/thinq/class-group/class-group.component';
import { ThinqFieldTxtComponent } from '@shared/thinq/thinq-fields/thinq-field-txt/thinq-field-txt.component';
import { ThinqFieldTxaComponent } from '@shared/thinq/thinq-fields/thinq-field-txa/thinq-field-txa.component';
import { ThinqFieldHtmComponent } from '@shared/thinq/thinq-fields/thinq-field-htm/thinq-field-htm.component';
import { ThinqFieldEmailComponent } from '@shared/thinq/thinq-fields/thinq-field-email/thinq-field-email.component';
import { ThinqFieldDdlComponent } from '@shared/thinq/thinq-fields/thinq-field-ddl/thinq-field-ddl.component';
import { ThinqFieldChkComponent } from '@shared/thinq/thinq-fields/thinq-field-chk/thinq-field-chk.component';
import { ThinqFieldDteComponent } from '@shared/thinq/thinq-fields/thinq-field-dte/thinq-field-dte.component';
import { ThinqFieldToggleComponent } from '@shared/thinq/thinq-fields/thinq-field-toggle/thinq-field-toggle.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { QuillModule } from 'ngx-quill';
import { ThinqFieldTxlModule } from './thinq-fields/thinq-field-txl/thinq-field-txl.module';
import { SharedModule } from '@shared/shared.module';



@NgModule({
  declarations: [
    ThinqFieldTxtComponent,
    ThinqFieldTxaComponent,
    ThinqFieldHtmComponent,
    ThinqFieldEmailComponent,
    ThinqFieldDdlComponent,
    ThinqFieldChkComponent,
    ThinqFieldDteComponent,
    ThinqFieldToggleComponent,
    ClassGroupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatRippleModule,
    QuillModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatMomentDateModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatSelectModule,
    MatSlideToggleModule,
    NgxPaginationModule,
    NgSelectModule,
    NgOptionHighlightModule,
    ThinqFieldTxlModule,
    SharedModule
  ],
  exports: [
    ThinqFieldTxtComponent,
    ThinqFieldTxaComponent,
    ThinqFieldHtmComponent,
    ThinqFieldEmailComponent,
    ThinqFieldDdlComponent,
    ThinqFieldChkComponent,
    ThinqFieldDteComponent,
    ThinqFieldTxlModule,
    ThinqFieldToggleComponent,
    ClassGroupComponent
  ]
})
export class SharedThinqModule { }
