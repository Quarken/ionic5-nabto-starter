import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DeviceAddPageModule } from '../device-add/device-add.module';

import { OverviewPage } from './overview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: OverviewPage
      }
    ]),
    DeviceAddPageModule,
  ],
  declarations: [OverviewPage]
})
export class OverviewPageModule {}
