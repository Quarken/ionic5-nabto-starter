import { Component, OnInit } from '@angular/core';
import { BookmarksService, Bookmark } from '../bookmarks.service';
import { ProfileService } from '../profile.service';
import { ModalController, ToastController, AlertController, NavController } from '@ionic/angular';
import { NabtoService } from '../nabto.service';
import { Subject, Observable } from 'rxjs';
import { NabtoDevice } from '../device.class';
import { ToastOptions } from '@ionic/core';
import { DeviceAddPage } from '../device-add/device-add.page';

@Component({
  selector: 'app-home',
  templateUrl: 'overview.page.html',
  styleUrls: ['overview.page.scss'],
})
export class OverviewPage implements OnInit {
  public devices: Observable<NabtoDevice[]>;
  public deviceInfoSource: Subject<NabtoDevice[]>;
  public shownDevices: NabtoDevice[] = [];
  public empty: boolean;
  public firstView = true;

  private profileLoaded = new Subject<void>();

  constructor(private bookmarksService: BookmarksService,
              private profileService: ProfileService,
              private nabtoService: NabtoService,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private navCtrl: NavController,
              private modalCtrl: ModalController) {
    this.deviceInfoSource = new Subject<NabtoDevice[]>();
    this.devices = this.deviceInfoSource.asObservable();
    this.devices.subscribe(next => {
      console.log(`Got devices for overview ${JSON.stringify(next)}`);
      this.shownDevices = next;
    });
  }

  ngOnInit() {
    this.profileLoaded.subscribe(() => this.refresh());
    this.verifyPlumbing()
      .then(() => this.initialize())
      .catch((err) => console.error(`App could not start: ${err.message || err}`));
  }

  verifyPlumbing(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.nabtoService.checkNabto()
        .then((version) => {
          console.log(`Nabto SDK ${version} installed and working`);
          resolve();
        })
        .catch((err) => {
          if (err.message) {
            console.log('err.message=[' + err.message + ']');
            console.log('err.message===[NA...]? ' + err.message === 'NABTO_NOT_AVAILABLE' ? 'yes' : 'no');
          } else {
            console.log('err.message is undefined');
          }
          if (err && err.message && err.message === 'NABTO_NOT_AVAILABLE') {
            this.showToast('Installation problem: Nabto SDK not available, please contact vendor', true);
          } else {
            console.log('Could not get SDK version: ' + (err.message || err));
          }
          reject(err);
        })
        .catch(() => {
          console.log('Unspecified error');
          reject(new Error('Unspecified error'));
        });
    });
  }

  initialize() {
    this.profileService.lookupKeyPairName()
      .then((name) => {
        if (name) {
          console.log(`Initializing using profile [${name}]`);
          this.initializeWithKeyPair(name);
        } else {
          console.log('No profile found, creating');
          this.nabtoService.startup()
            .then(() => this.navCtrl.navigateRoot('ProfilePage'))
            .catch((err) => console.log(`An error occurred: ${err}`));
        }
      })
      .catch((err) => {
        console.log(`An error occurred: ${err}`);
        this.navCtrl.navigateRoot('ProfilePage');
      });
  }

  initializeWithKeyPair(name: string) {
    this.nabtoService.startupAndOpenProfile(name)
      .then(() => this.profileLoaded.next())
      .catch((error) => {
        if (error && error.message && error.message === 'BAD_PROFILE') {
          this.navCtrl.navigateRoot('ProfilePage');
        } else {
          this.showAlert('App could not start, please contact vendor: ' + error.message || error);
        }
      });
  }

  refresh() {
    this.bookmarksService.readBookmarks().then((bookmarks: Bookmark[]) => {
      console.log(`got bookmarks: ${JSON.stringify(bookmarks)}`);
      this.nabtoService.prepareInvoke(bookmarks.map((bookmark) => bookmark.id))
        .then(() => {
          // listview observes this.devices and will be populated as data is received
          this.nabtoService.getPublicInfo(bookmarks, this.deviceInfoSource);
        });
    }).catch((error) => {
      this.showToast(error.message || error);
    });
  }

  deviceTapped(device: NabtoDevice) {
    console.log('Tapped a device');
  }

  async addManually() {
    const modal = await this.modalCtrl.create({
      component: DeviceAddPage
    });
    await modal.present();
  }

  async showAlert(msg: string, title?: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  async showToast(msg: string, stayOnScreen = false) {
    const options: ToastOptions = {
      message: msg,
      buttons: [
        {
          side: 'end',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    };

    if (!stayOnScreen) {
      options.duration = 3000;
    }

    const toast = await this.toastCtrl.create(options);
    toast.present();
  }

  badImage(device: NabtoDevice) {
    device.setUnknownIcon();
    console.log(`No icon for ${JSON.stringify(device)}`);
  }
}
