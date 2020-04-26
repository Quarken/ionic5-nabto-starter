import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowFpQrPage } from './show-fp-qr.page';

const routes: Routes = [
  {
    path: '',
    component: ShowFpQrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowFpQrPageRoutingModule {}
