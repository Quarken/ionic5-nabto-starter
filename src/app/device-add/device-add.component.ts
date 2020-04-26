import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NabtoService } from '../../app/nabto.service';
import { showToast } from '../util';
import { TranslateService } from '@ngx-translate/core';
import { NabtoDevice } from '../device.class';

@Component({
  selector: 'app-device-add',
  templateUrl: './device-add.component.html',
  styleUrls: ['./device-add.component.scss'],
})
export class DeviceAddComponent implements OnInit {
  deviceId = '';
  busy = false;

  constructor(
    public modalController: ModalController,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private nabtoService: NabtoService,
    private barcodeScanner: BarcodeScanner) { }

  ngOnInit() { }

  showError(error: any) {
    this.busy = false;
    const prefix: string = this.translate.instant('ADD_DEVICE.ERROR_DEVICE_ACCESS');
    if (error.message) {
      showToast(this.toastCtrl, `${prefix}: ${error.message}`, false);
    } else {
      showToast(this.toastCtrl, prefix, false);
    }
  }

  add() {
    this.busy = true;
    this.nabtoService.prepareInvoke([this.deviceId]).then(() => {
      this.nabtoService.getPublicDetails(this.deviceId).then((device: NabtoDevice) => {
        this.busy = false;
        this.modalController.dismiss(device);
      }).catch((error) => {
        if (error && error.code && (error.code == NabtoError.Code.P2P_ACCESS_DENIED_CONNECT ||
          error.code == NabtoError.Code.EXC_NO_ACCESS)) {
          this.busy = false;
          showToast(this.toastCtrl, this.translate.instant('ADD_DEVICE.ERROR_ACCESS_DENIED'), false);
        } else {
          this.showError(error);
        }
      });
    }).catch((error) => {
      this.showError(error);
    });
  }

  scan() {
    this.barcodeScanner.scan().then(barcodeResult => {
      if (barcodeResult.cancelled) {
        showToast(this.toastCtrl, this.translate.instant('ADD_DEVICE.SCAN_CANCEL'));
        return;
      }
      console.log('Scanned QR code, got data: ' + JSON.stringify(barcodeResult));
      let json = null;
      try {
        json = JSON.parse(barcodeResult.text);
        if (!json.hasOwnProperty('i')) {
          json = null;
          showToast(this.toastCtrl, this.translate.instant('ADD_DEVICE.ERROR_QR_MISSING_ID'));
        }
      } catch (e) {
        showToast(this.toastCtrl, this.translate.instant('ADD_DEVICE.ERROR_QR_INVALID_DATA'));
      }
      if (json != null) {
        this.deviceId = json.i;
      }
    }).catch((error) => showToast(this.toastCtrl, error));
  }

  clear() {
    this.deviceId = '';
  }

  shareFingerprint() {
    // TODO: ShowFpQrPage
  }
}
