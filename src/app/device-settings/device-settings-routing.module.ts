import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeviceSettingsPage } from './device-settings.page';

const routes: Routes = [
  {
    path: '',
    component: DeviceSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeviceSettingsPageRoutingModule {}
