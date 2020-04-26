import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowFpQrPageRoutingModule } from './show-fp-qr-routing.module';

import { ShowFpQrPage } from './show-fp-qr.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowFpQrPageRoutingModule
  ],
  declarations: [ShowFpQrPage]
})
export class ShowFpQrPageModule {}
