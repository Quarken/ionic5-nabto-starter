import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile.service';
import { ToastController } from '@ionic/angular';
import { showToast } from '../util';
import { TranslateService } from '@ngx-translate/core';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Component({
  selector: 'app-show-fp-qr',
  templateUrl: './show-fp-qr.page.html',
  styleUrls: ['./show-fp-qr.page.scss'],
})
export class ShowFpQrPage implements OnInit {
  qrInput: string;
  name: string;
  fingerprint: string;

  constructor(
    private translate: TranslateService,
    private clipboard: Clipboard,
    private profileService: ProfileService,
    private toastCtrl: ToastController
  ) {
    this.qrInput = '';
    this.name = '';
    this.fingerprint = '';
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.updateFingerPrint().then(() => {
      this.qrInput = JSON.stringify({
        f: this.fingerprint,
        n: this.name
      });
      console.log(`Input for QR code: [${this.qrInput}]`);
    });
  }

  updateFingerPrint() {
    return this.profileService.getFingerprintAndName()
      .then((result) => {
        this.name = result.keyName;
        this.fingerprint = result.fingerprint;
      })
      .catch((error) => {
        console.log(`Error getting name/fingerprint:  ${JSON.stringify(error)}`);
        showToast(this.toastCtrl, error.message);
      });
  }

  copyFingerprint() {
    this.clipboard.copy(this.fingerprint);
    showToast(this.toastCtrl, this.translate.instant('SHOW_FP_QR.FP_TOAST'));
  }

}
