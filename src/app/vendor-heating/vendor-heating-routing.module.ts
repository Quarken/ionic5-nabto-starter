import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VendorHeatingPage } from './vendor-heating.page';

const routes: Routes = [
  {
    path: '',
    component: VendorHeatingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorHeatingPageRoutingModule {}
