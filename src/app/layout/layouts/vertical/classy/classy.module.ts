import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { FuseLoadingBarModule } from '@fuse/components/loading-bar';
import { FuseFullscreenModule } from '@fuse/components/fullscreen/fullscreen.module';
import { SearchModule } from 'app/layout/common/search/search.module';
import { UserModule } from 'app/layout/common/user/user.module';
import { SharedModule } from 'app/shared/shared.module';
import { ClassyLayoutComponent } from 'app/layout/layouts/vertical/classy/classy.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TimesheetModule } from 'app/modules/admin/timesheet/timesheet.module';
import { TimesheetNavModule } from 'app/layout/common/timesheet/timesheet.module';

@NgModule({
  declarations: [
    ClassyLayoutComponent
  ],
  imports: [
    HttpClientModule,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    FuseFullscreenModule,
    FuseLoadingBarModule,
    FuseNavigationModule,
    MatSidenavModule,
    TimesheetModule,
    TimesheetNavModule,
    SearchModule,
    UserModule,
    SharedModule
  ],
  exports: [
    ClassyLayoutComponent
  ]
})
export class ClassyLayoutModule {
}
