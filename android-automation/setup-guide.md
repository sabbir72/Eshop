# Android Automation Setup Guide

## Step 1: Java JDK Install

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-11-jdk

# Check installation
java -version
javac -version
```

## Step 2: Android Studio Install

1. Download from: https://developer.android.com/studio
2. Install করুন
3. SDK Manager থেকে Android SDK install করুন
4. Platform Tools install করুন

## Step 3: Environment Variables Setup

```bash
# ~/.bashrc অথবা ~/.zshrc তে add করুন

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Apply changes
source ~/.bashrc
```

## Step 4: Node.js Install

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

## Step 5: Appium Install

```bash
# Global installation
npm install -g appium

# Appium Doctor (dependency checker)
npm install -g appium-doctor

# Check setup
appium-doctor --android

# Install UiAutomator2 driver
appium driver install uiautomator2
```

## Step 6: Python Setup (Optional)

```bash
# Python install
sudo apt install python3 python3-pip

# Appium Python client
pip3 install Appium-Python-Client

# Selenium
pip3 install selenium
```

## Step 7: Device Setup

### Physical Device:
1. Settings → About Phone → Build Number (7 বার tap করুন)
2. Developer Options enable হবে
3. USB Debugging enable করুন
4. USB দিয়ে connect করুন

### Verify Connection:
```bash
adb devices
```

### Emulator:
```bash
# Android Studio থেকে AVD Manager দিয়ে emulator তৈরি করুন
# অথবা command line থেকে:
emulator -list-avds
emulator -avd <avd_name>
```

---

## ✅ Verification

সব কিছু ঠিকমতো install হয়েছে কিনা check করুন:

```bash
appium-doctor --android
```

সব ✓ mark থাকলে আপনি ready!
