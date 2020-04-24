import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppSettingsPageRoutingModule } from './app-settings-routing.module';

import { AppSettingsPage } from './app-settings.page';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileModalModule } from '../profile/profile.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppSettingsPageRoutingModule,
    TranslateModule,
    ProfileModalModule
  ],
  declarations: [AppSettingsPage]
})
export class AppSettingsPageModule {}
