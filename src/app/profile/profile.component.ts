import { Component, OnInit } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { ModalController, ToastController } from '@ionic/angular';
import { ProfileService } from '../profile.service';
import { NabtoService } from '../nabto.service';
import { showToast } from '../util';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  translationParams = { platform: '' };
  deviceName = '';

  constructor(
    private hostDevice: Device,
    private profileService: ProfileService,
    private nabtoService: NabtoService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.translationParams.platform = this.hostDevice.platform;
    this.deviceName = this.hostDevice.model;
  }

  log() {
    console.log(this.translationParams.platform);
    console.log(this.deviceName);
    console.log('Invoke create keypair');
  }

  showError(error: any) {
    console.log(`An error occurred when creating key pair: ${JSON.stringify(error)}`);
    showToast(this.toastCtrl, error.message);
  }

  clear() {
    this.deviceName = '';
  }

  submit() {
    this.profileService.createKeyPair(this.deviceName)
      .then((name) => {
        console.log(`Key pair created successfully for ${name}`);
        this.profileService.storeKeyPairName(name);
        // restarting Nabto to close session with previous key and start new with new one
        this.nabtoService.shutdown().then(() => {
          console.log('Nabto stopped');
          this.nabtoService.startupAndOpenProfile(name)
            .then(() => {
              console.log('Nabto re-started with profile ' + name);
              this.modalCtrl.dismiss(name);
            })
            .catch(() => {
              // TODO: Show message to user?
              console.log('Could not start Nabto after creating new key pair, please contact support');
              this.modalCtrl.dismiss(name);
            });
        });
      })
      .catch((error) => {
        this.showError(error);
      });
  }
}
