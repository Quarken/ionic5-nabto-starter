import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AclAddPage } from './acl-add.page';

const routes: Routes = [
  {
    path: '',
    component: AclAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AclAddPageRoutingModule {}
