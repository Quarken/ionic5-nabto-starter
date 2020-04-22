import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { OverviewPage } from './overview.page';
import { DeviceAddComponent } from '../device-add/device-add.component';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileComponent } from '../profile/profile.component';
import { Device } from '@ionic-native/device/ngx';

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
    TranslateModule
  ],
  declarations: [
    OverviewPage,
    DeviceAddComponent,
    ProfileComponent
  ],
  entryComponents: [
    DeviceAddComponent,
    ProfileComponent
  ]
})
export class OverviewPageModule {}
