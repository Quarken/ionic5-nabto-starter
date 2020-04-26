# Ionic Starter for Nabto IoT / AppMyProduct


# Android
## Prerequisites
1. [Git Large File Storage](https://git-lfs.github.com/) (for binary data such as the included .png files)
2. [NodeJS](https://nodejs.org/) and a node package manager (`npm` or [`yarn`](https://yarnpkg.com/))
3. [Android Studio](https://developer.android.com/studio)
4. Android SDK (comes packaged with Android Studio usually)

## Installing
Once you have these prerequisites, you can install ionic CLI globally (using a project-local ionic install with `npx` is also an option).

```
npm install -g @ionic/cli
```
Use the following commands in a terminal to clone and install the project.
```
git clone git@github.com:Quarken/ionic5-nabto-starter.git
cd ionic5-nabto-starter
npm install
```

## Running
Before running the app, make sure to run `ionic cap sync` to build and copy code and assets to the android project. Running `ionic cap open` will open the project in Android studio, allowing you to run, debug and deploy the app from there.

```
ionic cap sync
ionic cap open
```

## Live-reloading
TODO

# iOS
TODO

# Customization
TODO
