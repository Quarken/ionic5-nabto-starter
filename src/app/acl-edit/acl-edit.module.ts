import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AclEditPageRoutingModule } from './acl-edit-routing.module';

import { AclEditPage } from './acl-edit.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AclEditPageRoutingModule,
    TranslateModule
  ],
  declarations: [AclEditPage]
})
export class AclEditPageModule {}
