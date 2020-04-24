import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { OverviewPage } from './overview.page';
import { DeviceAddComponent } from '../device-add/device-add.component';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileModalModule } from '../profile/profile.module';

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
    TranslateModule,
    ProfileModalModule
  ],
  declarations: [
    OverviewPage,
    DeviceAddComponent,
  ],
  entryComponents: [
    DeviceAddComponent,
  ]
})
export class OverviewPageModule {}
