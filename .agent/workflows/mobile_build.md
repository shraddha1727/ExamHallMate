---
description: Build and Run Mobile App (Android)
---

This workflow describes how to build and run the VIVA Exam Manager as an Android application using Capacitor.

## Prerequisites
- **Android Studio**: Must be installed and configured on your machine.
- **Java/JDK**: Ensure a compatible JDK (usually JDK 11 or 17) is installed.
- **Android SDK**: Install the necessary SDK platforms and tools via Android Studio.

## Steps

1. **Build Web Assets**
   Ensure your latest code is built into the `dist` folder.
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**
   Copy the web assets to the Android native project.
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio**
   Open the native project to build and run.
   ```bash
   npx cap open android
   ```

4. **Build the APK (For Sharing)**
   - Inside Android Studio, go to the top menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Wait for the build to finish (bottom right progress bar).
   - Click the **"locate"** link that appears in the notification bubble to find your `.apk` file.
   - You can copy this file to your phone and install it.

5. **Run the App (Emulator/Testing)**
   - In Android Studio, wait for Gradle sync to complete.
   - Connect an Android device (USB Debugging enabled) or create an Emulator (AVD).
   - Click the **Run** (Play) button in the top toolbar.

## Troubleshooting
- If you see `ERR_CLEARTEXT_NOT_PERMITTED` when connecting to a local API:
  - Ensure your API URL in `api/index.ts` points to your computer's local IP address (e.g., `http://192.168.1.5:3000`), NOT `localhost`.
  - Android emulators use `10.0.2.2` to refer to the host machine's localhost.
- If assets don't update:
  - Run `npm run build` and `npx cap sync` again.
