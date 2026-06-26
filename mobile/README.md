# FinAdvisor Mobile

Free, private, **on-device** personal finance app for India. No server, no cloud, no cost.
All data lives on the phone (AsyncStorage). Investments auto-refresh from AMFI's free NAV feed.

## What's inside
- **Today** — net worth (animated), % to financial freedom, FIRE date, milestone progress, advisor cards
- **Portfolio** — holdings with gain/loss, set purchase dates, **↻ Refresh prices** (AMFI NAV sync)
- **Optimize** — capital-gains tax estimate, LTCG harvesting, STCG→LTCG timing, 80C, concentration risk
- **Future** — FIRE projection + what-if steppers (extra SIP / retire age / return %) with live trajectory
- **Budget** — income + expense buckets → live surplus & savings rate

Finance engines (tax, XIRR, Monte Carlo, projection) are ported to TypeScript in `src/lib/finance/`.

## Run in development (free, no Android SDK)
```
npm start
```
Install **Expo Go** from the Play Store, scan the QR. The dev server runs on your PC; phone must be
on the same Wi-Fi.

## Build a standalone APK (one-time setup)
Requires the Android toolchain on this PC:
1. Install **JDK 17** and **Android Studio** (free). In Android Studio → SDK Manager, install
   *Android SDK Platform 34* + *Android SDK Build-Tools*.
2. Set environment variables:
   - `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
   - add `%ANDROID_HOME%\platform-tools` to PATH
3. Generate native projects and build:
   ```
   npx expo prebuild --platform android
   cd android
   ./gradlew assembleRelease
   ```
   APK appears at `android/app/build/outputs/apk/release/app-release.apk`.
4. Copy the APK to your phone and install (enable "install from unknown sources").

For painless updates without rebuilding each time, EAS Update (free tier) can push JS-only changes
OTA — optional, set up later.

## Data
Seeded from a real Groww export on first launch; edits persist locally. To reset, clear app storage.
