import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeviceSettingsPageRoutingModule } from './device-settings-routing.module';
import { DeviceSettingsPage } from './device-settings.page';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeviceSettingsPageRoutingModule,
    TranslateModule,
    QRCodeModule
  ],
  declarations: [DeviceSettingsPage]
})
export class DeviceSettingsPageModule {}
