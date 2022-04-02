import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThinqFormfieldComponent } from './thinq-form-field.component';
import { SharedThinqModule } from '@shared/thinq/thinq.module';



@NgModule({
  declarations: [
    ThinqFormfieldComponent
  ],
  imports: [
    CommonModule,
    SharedThinqModule,
  ],
  exports: [
    ThinqFormfieldComponent
  ],
})
export class ThinqFormFieldModule { }
