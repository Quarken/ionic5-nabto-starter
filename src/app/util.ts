/**
 * Utility types and functions.
 */

import { ToastController } from '@ionic/angular';
import { ToastOptions } from '@ionic/core';

// NOTE(as): ionic refresher uses a custom event with no proper interface.
// https://ionicframework.com/docs/api/refresher
export type RefreshEvent = Event & { target: { complete: () => void } };

export async function showToast(toastCtrl: ToastController, msg: string, stayOnScreen = false) {
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

    const toast = await toastCtrl.create(options);
    toast.present();
}
