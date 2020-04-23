import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PairingPageRoutingModule } from './pairing-routing.module';

import { PairingPage } from './pairing.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PairingPageRoutingModule
  ],
  declarations: [PairingPage]
})
export class PairingPageModule {}
