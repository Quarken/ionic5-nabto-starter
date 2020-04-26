# Ionic Starter for Nabto IoT / AppMyProduct


# Guide
## Prerequisites
### Common prerequisites
1. [Git Large File Storage](https://git-lfs.github.com/) (for binary data such as the included .png files)
2. [NodeJS](https://nodejs.org/) and a node package manager (`npm` or [`yarn`](https://yarnpkg.com/))

### Android-specific  prerequisites
1. [Android Studio](https://developer.android.com/studio)
2. Android SDK (comes packaged with Android Studio usually)

### iOS-specific prerequisites
1. [Xcode](https://developer.apple.com/xcode/)
2. [CocoaPods](https://cocoapods.org/)

## Installing
Once you have these prerequisites, you can install ionic CLI globally (using a project-local ionic install with `npx` is also an option).

```ShellSession
npm install -g @ionic/cli
```
Use the following commands in a terminal to clone and install the project.
```ShellSession
git clone git@github.com:Quarken/ionic5-nabto-starter.git
cd ionic5-nabto-starter
npm install
```

## Running
Before running the app, make sure to run `ionic cap sync` to build and copy code and assets to the platform project folder. Running `ionic cap open` will open the project in the native IDE, allowing you to run, debug and deploy the app from there. Generally, when you make changes to the app, you should run `ionic cap sync` before running the app.

Note that capacitor may print an error if you do not have CocoaPods installed, this is fine if you're doing Android development.

```ShellSession
ionic cap sync
ionic cap open
```

## Live-reloading
You can start a live-reload server by running one of these two commands.

```ShellSession
# Live-reloading on iOS
ionic cap run ios -l --external

# Live-reloading on Android
ionic cap run android -l --external
```
This will start up the native IDE for your platform of choice, from there you should run the app. Live-reloading allows you to make changes to the code in the `src` folder and see the changes update on your Android device live.

# Customization
Product specific customization takes place through `src/app/customization.class.ts`. It allows you to setup the page the app should navigate to when a device is accessed instead of the default heating app. It also specifies the Nabto RPC interface that is supported by this app:

```ts
const enum Customization {
  // name of page to navigate to from overview (the essential page of the app)
  vendorPage = 'vendor-heating',

  // supported device interface - only interact with devices that match exactly this
  interfaceId = '317aadf2-3137-474b-8ddb-fea437c424f4',

  // supported major version of the device interface - only interact with devices that match exactly this
  interfaceVersionMajor = 1,

  // supported minor version of the device interface - only interact with devices that match at least this
  interfaceVersionMinor = 0
}
```
Replace `vendor-heating` with the name of the target page's route (which is specified in `src/app/app-routing.module.ts`).

The `interfaceId` and `interfaceVersionMajor` must match exactly what is implemented by the
device. The device must implement at least `interfaceVersionMinor` version of the interface. See
below for details.

## RPC interface configuration
With the current Nabto RPC implementation, the interface checking is implemented at the application
level, ie by convention. The app expects the device to implement the following Nabto RPC function:

```XML
  <!-- interface id version info that clients must match -->
  <query name="get_interface_info.json" id="0">
    <request>
    </request>
    <response format="json">
      <parameter name="interface_id" type="raw"/>
      <parameter name="interface_version_major" type="uint16"/>
      <parameter name="interface_version_minor" type="uint16"/>
    </response>
  </query>
```

Implemented for instance as:

```C
    ...
    static const char* device_interface_id_ = "317aadf2-3137-474b-8ddb-fea437c424f4";
    static uint16_t device_interface_version_major_ = 1;
    static uint16_t device_interface_version_minor_ = 0;

    ...
    switch (request->queryId) {
    case 0:
        // get_interface_info.json
        if (!write_string(query_response, device_interface_id_)) return AER_REQ_RSP_TOO_LARGE;
        if (!unabto_query_write_uint16(query_response, device_interface_version_major_)) return AER_REQ_RSP_TOO_LARGE;
        if (!unabto_query_write_uint16(query_response, device_interface_version_minor_)) return AER_REQ_RSP_TOO_LARGE;
        return AER_REQ_RESPONSE_READY;
```

As mentioned above, `device_interface_id_` and `device_interface_version_major_` must match exactly
what is expected by the client to allow the client to invoke the device. The minor version
`device_interface_version_minor_` must be at least the version expected by the client.

## Localization
Though you could hardcode strings, it might be more useful for your app to be localization-ready. For that end, this project uses [ngx-translate](https://github.com/ngx-translate/core) to localize strings displayed to the user. Detailed specifics on how to use ngx-translate can be found at the repository link.

The ngx-translate loader will look in the `src/assets/localization` folder for localization files. English localization is included in `src/assets/localization/en.json`.

## Icons and graphics
TODO
