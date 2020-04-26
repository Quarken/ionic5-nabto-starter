import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  {
    path: 'overview',
    loadChildren: () => import('./overview/overview.module').then(m => m.OverviewPageModule)
  },
  {
    path: 'discover',
    loadChildren: () => import('./discover/discover.module').then(m => m.DiscoverPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./app-settings/app-settings.module').then(m => m.AppSettingsPageModule)
  },
  {
    path: 'help',
    loadChildren: () => import('./help/help.module').then(m => m.HelpPageModule)
  },
  {
    path: 'pairing',
    loadChildren: () => import('./pairing/pairing.module').then(m => m.PairingPageModule)
  },
  {
    path: 'vendor-heating',
    loadChildren: () => import('./vendor-heating/vendor-heating.module').then(m => m.VendorHeatingPageModule)
  },
  {
    path: 'device-settings',
    loadChildren: () => import('./device-settings/device-settings.module').then(m => m.DeviceSettingsPageModule)
  },
  {
    path: 'security',
    loadChildren: () => import('./security/security.module').then(m => m.SecurityPageModule)
  },
  {
    path: 'show-fp-qr',
    loadChildren: () => import('./show-fp-qr/show-fp-qr.module').then(m => m.ShowFpQrPageModule)
  },
  {
    path: 'acl-add',
    loadChildren: () => import('./acl-add/acl-add.module').then(m => m.AclAddPageModule)
  },
  {
    path: 'acl-edit',
    loadChildren: () => import('./acl-edit/acl-edit.module').then(m => m.AclEditPageModule)
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
