import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { NabtoDevice, DeviceUser } from './device.class';
import { Subject } from 'rxjs';
import { Bookmark, BookmarksService } from './bookmarks.service';
import { Injectable } from '@angular/core';

// TODO: Clean up the types in here so we don't use 'any'
// TODO: Move strings that get displayed to the user out to the localization file?

declare let nabto: any;
declare let NabtoError: any;

@Injectable()
export class NabtoService {
  private pkPassword = 'empty'; // see comment on createKeyPair() below
  private lastUser = '';
  private initialized = false;

  constructor(private storage: Storage,
              private http: HttpClient,
              private bookmarksService: BookmarksService,
              private platform: Platform) {
    document.addEventListener('pause', this.onPause);
    document.addEventListener('resume', this.onResume);
    document.addEventListener('resign', this.onResign);
  }

  onPause() {
    this.log('Pause event received');
    if (!this.platform.is('ios')) {
      this.shutdown();
    }
  }

  onResume() {
    this.log('resume');
  }

  onResign() {
    this.log('Resign event received');
    if (this.platform.is('ios')) {
      // this event is also fired when notification center is shown
      // etc. - and there is no opposite event, meaning that we cannot
      // start again, hence the reason for introducing the initialized flag.
      this.shutdown();
    } else {
      console.error(`Error in NabtoService: received resign event on a platform that isn't ios.`);
    }
  }

  // NOTE: Keypair is stored directly on the filesystem with dummy
  // encryption (common password) - if necessary, encrypt with either
  // user provided password (more complex user experience) or protect
  // with a random password (e.g. through window.crypto.getRandomValues)
  // which is then stored in the platform's keystore.
  //
  // A Cordova plugin for accessing the native platform's secure
  // storage to store and retrieve such generated random password is
  // available at https://github.com/Crypho/cordova-plugin-secure-storage.
  //
  // However, please note that this approach only works well on iOS -
  // on Android, the keystore is completely nuked when the user
  // changes security settings as outlined here:
  // https://doridori.github.io/android-security-the-forgetful-keystore/
  //
  // The consequences must be carefully explained to the user - hence
  // per default, we have not enabled this.
  //
  public createKeyPair(username: string): Promise<string> {
    if (this.initialized) {
      return this.doCreateKeyPair(username);
    } else {
      return this.startup()
        .then(() => {
          return this.doCreateKeyPair(username);
        })
        .catch((err) => {
          console.error(`startup or createkeypair failed: ${err}`);
          return Promise.reject(err);
        });
    }
  }

  private doCreateKeyPair(username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      nabto.createKeyPair(username, this.pkPassword, (error: any) => {
        if (!error) {
          console.log('nabto.createKeyPair succeeded');
          this.storage.set('username', username);
          resolve(username);
        } else {
          console.log(`nabto.createKeyPair failed: ${error} (code=${error.code}, inner=${error.inner})`);
          reject(error);
        }
      });
    });
  }

  public getFingerprint(username: string): Promise<string> {
    if (this.initialized) {
      return this.doGetFingerprint(username);
    } else {
      return this.startupAndOpenProfile().then(() => this.doGetFingerprint(username));
    }
  }

  private doGetFingerprint(username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      nabto.getFingerprint(username, (err: any, result: any) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  }

  public startup(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        try {
          // if plugin not available, access to global "nabto" will
          // throw, neither of the following checks are possible:
          //   if (nabto) { ... }
          //   if (typeof(nabto) !== 'undefined'))
          nabto.startup((err: any) => {
            if (!err) {
              resolve();
            } else {
              console.log(`Could not start Nabto: ${err.message}`);
              reject(err);
            }
          });
        } catch (e) {
          console.log('Caught exception when invoking nabto: ' + (e.message || e));
          reject(new Error('NABTO_NOT_AVAILABLE'));
        }
      }).catch((err) => console.error(`platform.ready fail: ${err}`));
    });
  }

  public startupAndOpenProfile(certificate?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (certificate) {
        // save for later suspend/resume cycle
        this.lastUser = certificate;
      } else {
        if (this.lastUser) {
          certificate = this.lastUser;
        } else {
          console.error('Startup never invoked with a certificate');
          reject(new Error('Startup never invoked with a certificate'));
          return;
        }
      }

      // waits for platform.ready
      this.startup().then(() => {
        // NABTO-1397: redundant startup (but idempotent), introduce plain nabtoOpenSession in Cordova
        nabto.startupAndOpenProfile(certificate, this.pkPassword, (err: any) => {
          if (!err) {
            this.initialized = true;
            console.log('successfully initialized nabto service');
            this.injectInterfaceDefinition().then(resolve).catch(reject);
          } else {
            if (err == 'API_OPEN_CERT_OR_PK_FAILED') {
              reject(new Error('BAD_PROFILE'));
            } else {
              console.log(`Could not start Nabto and open profile "${certificate}": ${err.message}`);
              reject(new Error(err.message));
            }
          }
        });
      });
    });
  }

  // assumes nabto is available and started
  private injectInterfaceDefinition(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.get('./assets/unabto_queries.xml', {responseType: 'text'})
        .toPromise()
        .then((res: string) => {
          console.log('Got unabto_queries.xml, setting as default');
          nabto.rpcSetDefaultInterface(res, (err: any) => {
            if (!err) {
              console.log('nabto started and interface set ok!');
              resolve(true);
            } else {
              console.log('Could not inject interface definition: ' + err.message);
              reject(new Error('Could not inject device interface definition: ' +
                err.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')));
            }
          });
        })
        .catch((err) => {
          console.log('Error invoking rpcSetDefaultInterface: ' + err.message);
          reject(new Error('Could not load device interface definition: ' + err.message));
        });
    });
  }

  public shutdown(): Promise<boolean> {
    this.log('shutting down');
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        this.initialized = false;
        nabto.shutdown((error: any) => {
          if (!error) {
            this.log('shutdown ok');
            resolve(true);
          } else {
            this.log('shutdown failed');
            reject(new Error(error.message));
          }
        });
      });
    });
  }

  public discover(): Promise<string[]> {
    if (this.initialized) {
      return this.doDiscover();
    } else {
      return this.startupAndOpenProfile()
        .then(() => this.doDiscover())
        .catch((err) => Promise.reject(err));
    }
  }

  private doDiscover(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        nabto.getLocalDevices((error: any, deviceIds: any) => {
          if (!error) {
            resolve(deviceIds);
          } else {
            console.log(`getLocalDevices() failed: ${error}`);
            reject(new Error(`Discover failed: ${error.message}`));
          }
        });
      });
    });
  }

  private addInterfaceInfo(device: NabtoDevice): Promise<NabtoDevice> {
    return new Promise((resolve, reject) => {
      this.invokeRpc(device.id, 'get_interface_info.json')
        .then((details: any) => {
          console.log(`Got interface for ${JSON.stringify(details)}`);
          device.setInterfaceInfo(details);
          resolve(device);
        })
        .catch((error) => {
          if (error.code == NabtoError.Code.EXC_INV_QUERY_ID) {
            console.warn(`Device ${device.id} does not support strict interface check`);
            resolve(device);
          } else {
            reject(error);
          }
        });
    });
  }

  public getPublicInfo(bookmarks: Bookmark[], deviceInfoSource: Subject<NabtoDevice[]>) {
    const devices: NabtoDevice[] = [];
    if (bookmarks.length == 0) {
      deviceInfoSource.next(devices);
      return;
    }
    for (const bookmark of bookmarks) {
      this.getPublicDetails(bookmark.id)
        .then((device: NabtoDevice) => this.addInterfaceInfo(device))
        .then((device: NabtoDevice) => {
          devices.push(device);
          // notify for each completed detail retrieval so a single device that times out does not
          // block for showing remaining devices (...O(n^2) but the view lists need to observe an
          // array)
          deviceInfoSource.next(devices);
        })
        .catch((error) => {
          // device unavailable, use cached information from bookmark
          const unreachableDevice = new NabtoDevice(bookmark.name,
                                                  bookmark.id,
                                                  'Unknown',
                                                  bookmark.iconUrl,
                                                  error.message,
                                                  false, false, false);
          if (error.code == NabtoError.Code.P2P_RESPONSE_DECODE_ERROR) {
            unreachableDevice.setUnsupported('Invalid response from device - likely an interface mismatch, please contact vendor');
          }
          unreachableDevice.setOffline();
          devices.push(unreachableDevice);
          deviceInfoSource.next(devices); // see above comment
        });
    }
  }

  public getPublicDetails(deviceId: string): Promise<NabtoDevice> {
    return new Promise((resolve, reject) => {
      this.invokeRpc(deviceId, 'get_public_device_info.json')
        .then((details: any) => {
          const dev: NabtoDevice = new NabtoDevice(
            details.device_name,
            deviceId,
            details.device_type,
            details.device_icon,
            details.device_type,
            details.is_open_for_pairing,
            details.is_current_user_paired,
            details.is_current_user_owner
          );
          console.log(`resolving promise with public info from RPC for ${deviceId}: ` + JSON.stringify(dev));
          resolve(dev);
        })
        .catch((err) => {
          console.error(`public info could not be retrieved for ${deviceId}: ${JSON.stringify(err)}`);
          reject(err);
        });
    });
  }

  private buildParamString(input: any): string {
    const params = [];
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        const val = input[key];
        params.push(encodeURI(key) + '=' + encodeURI(val));
      }
    }
    return params.join('&');
  }

  public prepareInvoke(devices: string[]): Promise<void> {
    if (this.initialized) {
      return this.doPrepareInvoke(devices);
    } else {
      return this.startupAndOpenProfile().then(() => this.doPrepareInvoke(devices));
    }
  }

  private doPrepareInvoke(devices: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        nabto.prepareInvoke(devices, (error: any) => {
          if (!error) {
            console.log(`Prepare invoke succeeded for ${JSON.stringify(devices)}`);
            resolve(devices);
          } else {
            console.error(`Prepare invoke failed: ${error.message}`);
            reject(error);
            return;
          }
        });
      });
    });
  }

  public getCurrentUser(device: NabtoDevice): Promise<DeviceUser> {
    return new Promise((resolve, reject) => {
      this.invokeRpc(device.id, 'get_current_user.json')
        .then((user: any) => {
          resolve(new DeviceUser(user));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public readAllSecuritySettings(device: NabtoDevice) {
    return new Promise((resolve, reject) => {
      this.getCurrentUser(device)
        .then((user: DeviceUser) => {
          device.currentUserIsOwner = user.isOwner();
          return this.invokeRpc(device.id, 'get_system_security_settings.json');
        })
        .then((details: any) => {
          device.setSystemSecurityDetails(details);
          resolve(device);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public setSystemSecuritySettings(device: NabtoDevice) {
    return new Promise((resolve, reject) => {
      const settings: any = {
        // >>> 0: convert to unsigned
        permissions: device.getSystemPermissions() >>> 0,
        default_user_permissions_after_pairing: device.getDefaultUserPermissions() >>> 0
      };
      this.invokeRpc(device.id, 'set_system_security_settings.json', settings)
        .then((details: any) => {
          device.setSystemSecurityDetails(details);
          resolve(device);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public setSystemInfo(device: NabtoDevice) {
    return new Promise((resolve, reject) => {
      this.invokeRpc(device.id, 'set_device_info.json', { device_name: device.name })
        .then((details: any) => {
          device.name = details.device_name;
          resolve(device);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public pairWithCurrentUser(device: NabtoDevice, user: string): Promise<DeviceUser> {
    return new Promise((resolve, reject) => {
      this.invokeRpc(device.id, 'pair_with_device.json', { name: user })
        .then((pairedUser: any) => {
          console.log('Got paired user: ' + JSON.stringify(pairedUser));
          resolve(new DeviceUser(pairedUser));
        })
        .catch(reject);
    });
  }

  public setUserPermissions(device: NabtoDevice, user: DeviceUser): Promise<DeviceUser> {
    return new Promise((resolve, reject) => {
      this.invokeRpc(device.id, 'set_user_permissions.json', {
        fingerprint: user.fingerprint,
        permissions: user.permissions >>> 0 // >>> 0: convert to unsigned
      })
        .then((updatedUser: any) => {
          console.log('Got updated user: ' + JSON.stringify(updatedUser));
          resolve(new DeviceUser(updatedUser));
        })
        .catch(reject);
    });
  }

  public setUserName(device: NabtoDevice, user: DeviceUser): Promise<DeviceUser> {
    return new Promise((resolve, reject) => {
      this.invokeRpc(device.id, 'set_user_name.json', {
        fingerprint: user.fingerprint,
        name: user.name
      })
        .then((updatedUser: any) => {
          console.log('Got updated user: ' + JSON.stringify(updatedUser));
          resolve(new DeviceUser(updatedUser));
        })
        .catch(reject);
    });
  }

  public addUser(device: NabtoDevice, user: DeviceUser): Promise<number> {
    return new Promise((resolve, reject) => {
      this.invokeRpc(device.id, 'add_user.json', {
        fingerprint: user.fingerprint,
        name: user.name
      })
        .then((response: any) => {
          console.log('Added user, response: ' + JSON.stringify(response));
          resolve(response.status);
        })
        .catch(reject);
    });
  }

  public removeUser(device: NabtoDevice, user: DeviceUser): Promise<number> {
    return new Promise((resolve, reject) => {
      this.invokeRpc(device.id, 'remove_user.json', {
        fingerprint: user.fingerprint
      })
        .then((response: any) => {
          console.log('Removed user, status: ' + JSON.stringify(response.status));
          resolve(response.status);
        })
        .catch(reject);
    });
  }

  public invokeRpc(device: string, request: string, parameters?: any): Promise<any> {
    console.log(`Invoking RPC ${request} - initialized? ${this.initialized ? 'yes' : 'no'}`);
    let paramString = '';
    if (parameters) {
      paramString = this.buildParamString(parameters);
    }
    if (this.initialized) {
      return this.doInvokeRpc(device, request, paramString);
    } else {
      return this.startupAndOpenProfile().then(() => {
        return this.doInvokeRpc(device, request, paramString);
      }).catch((err) => {
        return Promise.reject(err);
      });
    }
  }

  private doInvokeRpc(id: string, request: string, paramString: string): Promise<any> {
    return new Promise((resolve, reject) => {
      nabto.rpcInvoke(`nabto://${id}/${request}?${paramString}`, (err: any, res: any) => {
        if (!err) {
          resolve(res.response);
        } else {
          if (err.code == NabtoError.Code.P2P_CONNECTION_PROBLEM) {
            // retry on this specific error (API will have flushed connection and re-connect)
            console.log('Retrying on error ' + err);
            nabto.rpcInvoke(`nabto://${id}/${request}?${paramString}`, (err2: any, res2: any) => {
              if (!err2) {
                resolve(res2.response);
              } else {
                console.log(`Failed again: ${JSON.stringify(err2)}`);
                if (err2.code == NabtoError.Code.P2P_TIMEOUT) {
                  // work around for NABTO-1330: if ec 1000026 follows after 2000058 it usually is
                  // because of target device has gone offline in between two invocations
                  err2.code = NabtoError.Code.P2P_DEVICE_OFFLINE;
                }
                reject(err2);
              }
            });
          } else {
            reject(err);
          }
        }
      });
    });
  }

  public openTunnel(host: string, remotePort: number): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        nabto.tunnelOpenTcp(host, remotePort, (err: any, tunnel: any) => {
          if (!err) {
            nabto.tunnelState(tunnel, (err2: any, tunnelState: number) => {
              if (!err2) {
                if (tunnelState > 0) {
                  nabto.tunnelPort(tunnel, (err3: any, port: any) => {
                    if (!err3) {
                      return resolve({
                        tunnelId: tunnel,
                        localPort: port,
                        state: tunnelState
                      });
                    } else {
                      reject(err3);
                    }
                  });
                } else {
                  reject(new Error('Tunnel not in connected state'));
                }
              } else {
                reject(err2);
              }
            });
          } else {
            reject(err);
          }
        });
      } catch (err) {
        console.log(`Caught error: ${err}`);
        reject(err);
      }
    });
  }

  public closeTunnel(tunnel: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        nabto.tunnelClose(tunnel, (err: any) => {
          resolve(true);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public checkNabto(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.startup().then(() => {
        // startup only resolves if nabto is ready and nabtoStartup() succeeds
        nabto.versionString((err: any, res: any) => {
          if (!err) {
            resolve(res);
          } else {
            reject(new Error(err.message));
          }
        });
      }).catch((e) => {
        console.log(`startup failed: ${e.message || e}`);
        reject(e);
      });
    });
  }

  log(text: string) {
    console.log(`NabtoService: ${text}`);
  }
}
