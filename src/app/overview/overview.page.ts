import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController, NavController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { Bookmark, BookmarksService } from '../bookmarks.service';
import { DeviceAddComponent } from '../device-add/device-add.component';
import { NabtoDevice } from '../device.class';
import { NabtoService } from '../nabto.service';
import { ProfileService } from '../profile.service';
import { showToast } from '../util';
import { Router } from '@angular/router';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-home',
  templateUrl: 'overview.page.html',
  styleUrls: ['overview.page.scss'],
})
export class OverviewPage implements OnInit, OnDestroy {
  public devices: Observable<NabtoDevice[]>;
  public deviceInfoSource: Subject<NabtoDevice[]>;
  public shownDevices: NabtoDevice[] = [];
  public empty: boolean;
  public firstView = true;

  private profileLoaded = new Subject<void>();

  constructor(
    private bookmarksService: BookmarksService,
    private profileService: ProfileService,
    private nabtoService: NabtoService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private translate: TranslateService,
    public modalController: ModalController,
    public router: Router
  ) {
    this.deviceInfoSource = new Subject<NabtoDevice[]>();
  }

  ngOnInit() {
    this.devices = this.deviceInfoSource.asObservable();
    this.devices.subscribe(next => {
      console.log(`Got devices for overview ${JSON.stringify(next)}`);
      this.shownDevices = next;
    });

    this.profileLoaded.subscribe(() => this.refresh());
    this.verifyPlumbing()
      .then(() => this.initialize())
      .catch((err) => console.error(`App could not start: ${err.message || err}`));
  }

  ngOnDestroy() {
    this.profileLoaded.unsubscribe();
    this.deviceInfoSource.unsubscribe();
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
            this.showToast(this.translate.instant('OVERVIEW.ERROR_NABTO_NOT_AVAILABLE'), true);
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

  async showProfilePage() {
    const modal = await this.modalController.create({
      component: ProfileComponent,
      backdropDismiss: false,
    });

    return await modal.present();
  }

  async initialize() {
    try {
      const keypairName = await this.profileService.lookupKeyPairName();
      if (keypairName) {
        console.log(`Initializing using profile [${keypairName}]`);
        this.initializeWithKeyPair(keypairName);
      } else {
        console.log('No profile found, creating...');
        await this.nabtoService.startup();
        await this.showProfilePage();
      }
    } catch (err) {
      console.error(err);
      // TODO: Show profilepage?
    }
  }

  initializeWithKeyPair(name: string) {
    this.nabtoService.startupAndOpenProfile(name)
      .then(() => this.profileLoaded.next())
      .catch((error) => {
        if (error && error.message && error.message === 'BAD_PROFILE') {
          console.error(error.message);
          this.showProfilePage();
        } else {
          this.showAlert(this.translate.instant('ERROR_UNKNOWN') + error.message || error);
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
    const modal = await this.modalController.create({
      component: DeviceAddComponent,
      backdropDismiss: false
    });

    modal.onDidDismiss().then(modalOutput => {
      if (modalOutput.data) {
        const device = modalOutput.data as NabtoDevice;
        this.bookmarksService.addBookmarkFromDevice(device);
        this.deviceInfoSource.next([device]);
      }
    });

    return await modal.present();
  }

  async showAlert(msg: string, title?: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  showToast(msg: string, stayOnScreen = false) {
    showToast(this.toastCtrl, msg, stayOnScreen);
  }

  badImage(device: NabtoDevice) {
    device.setUnknownIcon();
    console.log(`No icon for ${JSON.stringify(device)}`);
  }
}
