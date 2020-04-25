import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ProfileService } from './profile.service';
import { NabtoService } from './nabto.service';
import { BookmarksService } from './bookmarks.service';
import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';

// TODO: Replace with custom loader?
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/localization/', '.json');
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ProfileService,
    NabtoService,
    BookmarksService,
    BarcodeScanner,
    Clipboard,
    Device,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
