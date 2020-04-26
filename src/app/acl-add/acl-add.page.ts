import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NabtoDevice, DeviceUser } from '../device.class';
import { ToastController, NavController } from '@ionic/angular';
import { NabtoService } from '../nabto.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { showToast } from '../util';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-acl-add',
  templateUrl: './acl-add.page.html',
  styleUrls: ['./acl-add.page.scss'],
})
export class AclAddPage implements OnInit {
  device?: NabtoDevice;
  fingerprint = '';
  name = '';

  constructor(
    private translate: TranslateService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController,
    private nabtoService: NabtoService,
    private barcodeScanner: BarcodeScanner
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const state = this.router.getCurrentNavigation()?.extras.state;
      if (state?.device) {
        this.device = state.device;
      } else {
        // TODO: Show error to user?
        console.error('ACL add page was loaded without a device.');
      }
    });
  }

  parseFingerprint(fp: string) {
    // workaround for NABTO-1941 (cordova plugin includes terminating null in fp string passed on to js on iOS)
    fp = fp.replace(/\0/g, '');

    if (fp.length != 32 && fp.length != 32 + 15) {
      throw new Error(`Invalid length (${fp.length}), fingerprint must be 16 8-bit hex values, optionally separated with ':'`);
    }
    if (fp.length == 32 + 15) {
      fp = fp.replace(/:/g, '');
      if (fp.length != 32) {
        throw new Error('Invalid separator, fingerprint must be 16 8-bit hex values, optionally separated with \':\'');
      }
    }
    if (!fp.match(/^[a-zA-Z0-9]+$/)) {
      throw new Error(`Only hex values allowed in fingerprint (${fp})`);
    }
    return fp;
  }

  add() {
    if (!this.device) { return; }
    let fp: string;
    try {
      fp = this.parseFingerprint(this.fingerprint);
    } catch (e) {
      console.log(`Bad fingerprint: [${this.fingerprint}]: ` + e.message);
      showToast(this.toastCtrl, this.translate.instant('ACL_ADD.TOAST_INVALID_FP') + e.message);
      return;
    }
    const user = new DeviceUser({ fingerprint: fp,
                                name: this.name });
    this.nabtoService.addUser(this.device, user)
      .then((status: number) => {
        if (status == 0) {
          this.navCtrl.pop();
        } else {
          showToast(this.toastCtrl, this.translate.instant('ACL_ADD.TOAST_FAIL1') + status);
        }
      })
      .catch(error => {
        console.error(error.message);
        showToast(this.toastCtrl, this.translate.instant('ACL_ADD.TOAST_FAIL2') + error.message);
      });
  }

  scan() {
    this.barcodeScanner.scan().then(barcodeResult => {
      if (barcodeResult.cancelled) {
        showToast(this.toastCtrl, this.translate.instant('ACL_ADD.TOAST_CANCEL'));
        return;
      }
      console.log('Scanned QR code, got data: ' + JSON.stringify(barcodeResult));
      let json = null;
      try {
        json = JSON.parse(barcodeResult.text);
        if (!json.hasOwnProperty('f')) {
          json = null;
          showToast(this.toastCtrl, this.translate.instant('ACL_ADD.TOAST_MISSING_FP'));
        } else if (!json.hasOwnProperty('n')) {
          json = null;
          showToast(this.toastCtrl, this.translate.instant('ACL_ADD.TOAST_MISSING_NAME'));
        }
      } catch (e) {
        showToast(this.toastCtrl, this.translate.instant('ACL_ADD.TOAST_INVALID_DATA'));
      }
      if (json != null) {
        this.name = json.n;
        this.fingerprint = json.f;
      }
    }).catch((error) => showToast(this.toastCtrl, error));
  }

  clear() {
    this.name = '';
    this.fingerprint = '';
  }
}
