import { Component, OnInit } from '@angular/core';
import { BookmarksService } from '../bookmarks.service';
import { ProfileService } from '../profile.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { showToast } from '../util';
import { TranslateService } from '@ngx-translate/core';
import { ProfileComponent } from '../profile/profile.component';
import { Device } from '@ionic-native/device/ngx';

@Component({
  selector: 'app-app-settings',
  templateUrl: './app-settings.page.html',
  styleUrls: ['./app-settings.page.scss'],
})
export class AppSettingsPage implements OnInit {
  translateParams = { platform: '' };
  fingerprint: string;
  keyName: string;
  dirty: boolean;

  constructor(
    private hostDevice: Device,
    private translate: TranslateService,
    private bookmarksService: BookmarksService,
    private profileService: ProfileService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    this.dirty = false;
    this.fingerprint = '';
    this.keyName = '';
  }

  ngOnInit() {
    this.translateParams.platform = this.hostDevice.platform;
  }

  ionViewWillEnter() {
    this.updateFingerPrint();
  }

  updateFingerPrint() {
    this.profileService.getFingerprintAndName()
      .then((result) => {
        console.error('Got profile result for client settings: ' + JSON.stringify(result));
        this.keyName = result.keyName;
        this.fingerprint = result.fingerprint;
      })
      .catch((error) => {
        console.error('Error getting name/fingerprint: ' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
        showToast(this.toastCtrl, error.message);
        if (error.code == NabtoError.Code.API_OPEN_CERT_OR_PK_FAILED) {
          this.showProfilePage();
        }
      });
  }

  async showProfilePage() {
    const modal = await this.modalCtrl.create({
      component: ProfileComponent,
      backdropDismiss: false,
    });

    return await modal.present();
  }

  clearProfile() {
    this.clear(this.translate.instant('APP_SETTINGS.ALERT_CLEAR_PROFILE'), () => {
      this.dirty = true;
      this.profileService.clear();
      this.showProfilePage();
    });
  }

  clearDevices() {
    this.clear(this.translate.instant('APP_SETTINGS.ALERT_CLEAR_DEVICES'), () => {
      this.dirty = true;
      this.bookmarksService.clear();
    });
  }

  async clear(msg: string, clearHandler: () => void) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('CONFIRM'),
      message: msg,
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('YES'),
          handler: clearHandler
        }
    ]
    });
    return await alert.present();
  }
}
