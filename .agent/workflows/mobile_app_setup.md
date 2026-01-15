---
description: Install Android Studio & Build APK
---

Since you don't have Android Studio installed, follow these steps to set up your environment and generate the APK file.

## Phase 1: Install Android Studio (One-time Setup)

1.  **Download**:
    *   Go to: [https://developer.android.com/studio](https://developer.android.com/studio)
    *   Download the latest version for Windows.

2.  **Install**:
    *   Run the installer (`.exe`).
    *   **Important**: During installation, make sure both **"Android Studio"** and **"Android Virtual Device"** are checked.
    *   Click "Next" -> "Install".

3.  **First Run Wizard**:
    *   Open Android Studio after installation.
    *   It will ask to import settings -> Select "Do not import settings".
    *   Choose "Standard" setup type.
    *   **Crucial Step**: It will download the **Android SDK**. Let this finish (it might take some time depending on your internet).

## Phase 2: Build Your App

Once Android Studio is ready:

1.  **Open Project**:
    *   Open Android Studio.
    *   Click **"Open"**.
    *   Navigate to your project folder: `D:\spi completed\android`.
    *   Click **"OK"**.

2.  **Wait for Sync**:
    *   Android Studio will start scanning the project (bottom right bar).
    *   It might ask to "Install missing SDK platforms" or "Build Tools". **Click "Install" or "Update"** if asked. This solves the Java version issue automatically.

3.  **Generate APK**:
    *   Go to the top menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    *   Wait for the process to finish.
    *   A notification will appear: "APK(s) generated successfully".
    *   Click **"locate"** in that notification.
    *   You will see `app-debug.apk`. Transfer this file to your phone and install it!

## Note on Local Server
For the app to work on your phone, your backend API must be accessible.
1.  Find your laptop's IP address (Run `ipconfig` in terminal).
2.  Update `api/index.ts` (or wherever your API URL is defined) to use `http://YOUR_Laptop_IP:3000` instead of `localhost`.
3.  Re-run `npm run build` and `npx cap sync` before building the APK.
