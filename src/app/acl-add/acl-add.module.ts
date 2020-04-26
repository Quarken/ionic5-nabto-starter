import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AclAddPageRoutingModule } from './acl-add-routing.module';

import { AclAddPage } from './acl-add.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AclAddPageRoutingModule,
    TranslateModule
  ],
  declarations: [AclAddPage]
})
export class AclAddPageModule {}
