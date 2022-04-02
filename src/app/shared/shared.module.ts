import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatRippleModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgxPaginationModule } from 'ngx-pagination';
import { CabinetIconComponent } from '@shared/layout/cabinet-icon/cabinet-icon.component';
import { CabinetHeaderComponent } from '@shared/layout/cabinet-header/cabinet-header.component';
import { AppFooterComponent } from '@shared/layout/footer/app-footer.component';
import { FooterButtonComponent } from '@shared/layout/footer/components/footer-button/footer-button.component';
import { FooterDropdownComponent } from '@shared/layout/footer/components/footer-dropdown/footer-dropdown.component';
import { ShortNumberPipe } from '@shared/pipe/short-number.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatRippleModule,
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
    QuillModule,
    NgSelectModule,
    NgOptionHighlightModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Cabinet Header
    CabinetHeaderComponent,
    CabinetIconComponent,
    // Footer
    AppFooterComponent,
    // Pipe
    ShortNumberPipe
  ],
  declarations: [
    CabinetHeaderComponent,
    CabinetIconComponent,
    AppFooterComponent,
    FooterButtonComponent,
    FooterDropdownComponent,
    ShortNumberPipe,
  ],
  providers: [
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
})
export class SharedModule {
}
