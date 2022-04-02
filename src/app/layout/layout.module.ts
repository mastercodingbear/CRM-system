import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerModule } from '@fuse/components/drawer';
import { LayoutComponent } from 'app/layout/layout.component';
import { EmptyLayoutModule } from 'app/layout/layouts/empty/empty.module';
import { SharedModule } from 'app/shared/shared.module';
import { ClassyLayoutModule } from '@layout/layouts/vertical/classy/classy.module';

const layoutModules = [
  // Empty
  EmptyLayoutModule,

  // Vertical navigation
  ClassyLayoutModule,
];

@NgModule({
  declarations: [
    LayoutComponent
  ],
  imports: [
    MatIconModule,
    MatTooltipModule,
    FuseDrawerModule,
    SharedModule,
    ...layoutModules
  ],
  exports: [
    LayoutComponent,
    ...layoutModules
  ]
})
export class LayoutModule {
}
