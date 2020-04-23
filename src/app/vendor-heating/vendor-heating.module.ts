import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VendorHeatingPageRoutingModule } from './vendor-heating-routing.module';

import { VendorHeatingPage } from './vendor-heating.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VendorHeatingPageRoutingModule,
    TranslateModule
  ],
  declarations: [VendorHeatingPage]
})
export class VendorHeatingPageModule {}
