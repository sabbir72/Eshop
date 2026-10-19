# Ubuntu তে Appium Installation এবং Setup Guide

## 📋 সূচিপত্র
1. [System Requirements](#system-requirements)
2. [Java JDK Installation](#step-1-java-jdk-installation)
3. [Node.js এবং npm Installation](#step-2-nodejs-এবং-npm-installation)
4. [Android Studio Installation](#step-3-android-studio-installation)
5. [Android SDK Setup](#step-4-android-sdk-setup)
6. [Environment Variables Setup](#step-5-environment-variables-setup)
7. [Appium Installation](#step-6-appium-installation)
8. [Python এবং Appium Client Installation](#step-7-python-এবং-appium-client-installation)
9. [Device/Emulator Setup](#step-8-deviceemulator-setup)
10. [First Test Script](#step-9-first-test-script)
11. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Hardware:
- RAM: 8GB minimum (16GB recommended)
- Storage: 20GB free space
- USB port (physical device এর জন্য)

### Software:
- Ubuntu 20.04 LTS বা তার উপরে
- Internet connection

---

## Step 1: Java JDK Installation

### 1.1 System Update করুন

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Java JDK Install করুন

```bash
# OpenJDK 11 install করুন
sudo apt install openjdk-11-jdk -y
```

### 1.3 Verify করুন

```bash
java -version
javac -version
```

**Expected Output:**
```
openjdk version "11.0.x"
```

### 1.4 JAVA_HOME Set করুন

```bash
# Java path খুঁজুন
which java
readlink -f $(which java)

# .bashrc edit করুন
nano ~/.bashrc

# শেষে এই line add করুন:
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

# Save করুন (Ctrl+O, Enter, Ctrl+X)

# Apply করুন
source ~/.bashrc

# Verify করুন
echo $JAVA_HOME
```

---

## Step 2: Node.js এবং npm Installation

### 2.1 NVM (Node Version Manager) দিয়ে Install

```bash
# curl install করুন (যদি না থাকে)
sudo apt install curl -y

# NVM install করুন
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Terminal restart করুন অথবা
source ~/.bashrc

# NVM verify করুন
nvm --version
```

### 2.2 Node.js Install করুন

```bash
# Latest LTS version install করুন
nvm install --lts

# অথবা specific version
nvm install 20

# Default version set করুন
nvm use 20
nvm alias default 20
```

### 2.3 Verify করুন

```bash
node --version
npm --version
```

**Expected Output:**
```
v20.x.x
10.x.x
```

---

## Step 3: Android Studio Installation

### 3.1 Download করুন

```bash
cd ~/Downloads

# Latest version download করুন (অথবা browser থেকে download করুন)
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.1.1.28/android-studio-2023.1.1.28-linux.tar.gz
```

অথবা **Browser থেকে download:**
- https://developer.android.com/studio

### 3.2 Extract এবং Install করুন

```bash
# Extract করুন
tar -xzf android-studio-*.tar.gz

# /opt directory তে move করুন
sudo mv android-studio /opt/

# Desktop shortcut তৈরি করুন (optional)
sudo ln -sf /opt/android-studio/bin/studio.sh /usr/local/bin/android-studio
```

### 3.3 Android Studio Run করুন

```bash
/opt/android-studio/bin/studio.sh

# অথবা
android-studio
```

---

## Step 4: Android SDK Setup

### 4.1 Android Studio First Time Setup

1. **Welcome Screen** দেখবেন
2. **Next** click করুন
3. **Standard** install type select করুন
4. **Next** → **Finish**
5. Download complete হওয়া পর্যন্ত wait করুন

### 4.2 SDK Manager Configuration

1. Android Studio open করুন
2. **More Actions** → **SDK Manager** click করুন
3. **SDK Platforms** tab এ:
   - ✅ Android 13.0 (Tiramisu) - API Level 33
   - ✅ Android 12.0 (S) - API Level 31
   - ✅ Android 11.0 (R) - API Level 30

4. **SDK Tools** tab এ:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Command-line Tools (latest)
   - ✅ Android Emulator
   - ✅ Intel x86 Emulator Accelerator (HAXM installer)

5. **Apply** button click করুন
6. **Accept** licenses এবং download complete হতে দিন

**SDK Location নোট করুন:** `/home/your-username/Android/Sdk`

---

## Step 5: Environment Variables Setup

### 5.1 .bashrc File Edit করুন

```bash
nano ~/.bashrc
```

### 5.2 শেষে এই Lines Add করুন

```bash
# Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/emulator
```

### 5.3 Save এবং Apply করুন

```bash
# Save: Ctrl+O, Enter, Ctrl+X

# Apply করুন
source ~/.bashrc
```

### 5.4 Verify করুন

```bash
echo $ANDROID_HOME
adb --version
```

**Expected Output:**
```
/home/eng-sabbir/Android/Sdk
Android Debug Bridge version x.x.x
```

---

## Step 6: Appium Installation

### 6.1 Appium Server Install করুন

```bash
# Appium install করুন (global)
npm install -g appium

# Verify করুন
appium --version
```

### 6.2 Appium Doctor Install করুন

```bash
npm install -g @appium/doctor
```

### 6.3 UiAutomator2 Driver Install করুন

```bash
appium driver install uiautomator2

# Installed drivers দেখুন
appium driver list
```

### 6.4 Appium Doctor Run করুন

```bash
appium-doctor --android

# অথবা
npx @appium/doctor --android
```

**Expected Output:** সব জায়গায় ✓ mark থাকবে

**যদি ✗ mark থাকে:**
- ANDROID_HOME properly set হয়নি → Step 5 আবার করুন
- adb path missing → `which adb` run করে check করুন

---

## Step 7: Python এবং Appium Client Installation

### 7.1 Python3 এবং pip Install করুন

```bash
# Python3 check করুন (Ubuntu তে default থাকে)
python3 --version

# pip install করুন
sudo apt install python3-pip -y

# Verify করুন
pip3 --version
```

### 7.2 Appium Python Client Install করুন

```bash
# Appium Python client
pip3 install Appium-Python-Client

# Selenium
pip3 install selenium

# Verify করুন
pip3 list | grep Appium
```

**Expected Output:**
```
Appium-Python-Client    x.x.x
```

---

## Step 8: Device/Emulator Setup

### Option A: Physical Device Setup (Recommended)

#### 8.1 Phone এ Developer Options Enable করুন

1. **Settings** → **About Phone**
2. **Build Number** এ **7 বার** tap করুন
3. "You are now a developer!" message দেখবেন

#### 8.2 USB Debugging Enable করুন

1. **Settings** → **System** → **Developer Options**
2. **USB Debugging** toggle ON করুন
3. **Install via USB** toggle ON করুন (optional)

#### 8.3 Phone PC তে Connect করুন

```bash
# USB cable দিয়ে connect করুন
# Phone এ popup আসবে "Allow USB debugging?"
# "Always allow from this computer" checkbox দিন
# "Allow" click করুন

# Terminal এ verify করুন
adb devices
```

**Expected Output:**
```
List of devices attached
ABC123XYZ    device
```

#### 8.4 যদি "unauthorized" দেখায়

```bash
# Server restart করুন
adb kill-server
adb start-server
adb devices

# Phone এ আবার popup আসবে, Allow করুন
```

---

### Option B: Emulator Setup

#### 8.5 AVD Manager দিয়ে Emulator তৈরি করুন

1. Android Studio open করুন
2. **More Actions** → **Virtual Device Manager**
3. **Create Device** click করুন
4. **Phone** category → **Pixel 6** select করুন → **Next**
5. **System Image** → **Tiramisu (API 33)** → **Download** → **Next**
6. **AVD Name:** `TestDevice` → **Finish**

#### 8.6 Emulator Start করুন

**GUI থেকে:**
- AVD Manager → Play button click করুন

**Terminal থেকে:**
```bash
# Available AVDs list দেখুন
emulator -list-avds

# Emulator start করুন
emulator -avd TestDevice &

# Verify করুন
adb devices
```

**Expected Output:**
```
List of devices attached
emulator-5554    device
```

---

## Step 9: First Test Script

### 9.1 Project Directory তৈরি করুন

```bash
cd ~
mkdir android-automation
cd android-automation
```

### 9.2 Test Script তৈরি করুন

```bash
nano test_app.py
```

### 9.3 এই Code Paste করুন

```python
#!/usr/bin/env python3
"""
First Android Automation Test
Opens Settings app and takes screenshot
"""

from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
import time

print("=" * 50)
print("🚀 Starting Android Automation Test")
print("=" * 50)

# Appium Server URL
APPIUM_SERVER = 'http://localhost:4723'

# Device Capabilities
capabilities = {
    'platformName': 'Android',
    'automationName': 'UiAutomator2',
    'deviceName': 'Android Device',
    
    # Settings app open করবে
    'appPackage': 'com.android.settings',
    'appActivity': '.Settings',
    
    # App data reset করবে না
    'noReset': True,
}

try:
    print("\n📱 Connecting to device...")
    
    # Appium driver initialize করুন
    options = UiAutomator2Options().load_capabilities(capabilities)
    driver = webdriver.Remote(APPIUM_SERVER, options=options)
    
    print("✅ Settings app opened successfully!")
    
    # 3 second wait করুন
    time.sleep(3)
    
    # Screenshot নিন
    screenshot_path = 'test_screenshot.png'
    driver.save_screenshot(screenshot_path)
    print(f"📸 Screenshot saved: {screenshot_path}")
    
    # App close করুন
    driver.quit()
    print("\n✅ Test completed successfully!")
    print("=" * 50)

except Exception as e:
    print(f"\n❌ Error occurred: {str(e)}")
    print("\nTroubleshooting:")
    print("1. Check if Appium server is running")
    print("2. Check if device is connected: adb devices")
    print("3. Check if Settings app exists on device")
    print("=" * 50)
```

**Save করুন:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 9.4 Script Executable করুন

```bash
chmod +x test_app.py
```

---

## Step 10: Run Your First Test

### 10.1 Terminal 1: Appium Server Start করুন

```bash
appium

# অথবা verbose mode এ
appium --log-level debug
```

**Expected Output:**
```
[Appium] Welcome to Appium v2.x.x
[Appium] Appium REST http interface listener started on 0.0.0.0:4723
```

**এই terminal খোলা রাখুন!**

---

### 10.2 Terminal 2: Device Check করুন

নতুন terminal window খুলুন:

```bash
# Device connected আছে কিনা verify করুন
adb devices
```

**Expected Output:**
```
List of devices attached
ABC123XYZ    device
```

---

### 10.3 Terminal 2: Test Script Run করুন

```bash
cd ~/android-automation
python3 test_app.py
```

---

### 10.4 Expected Result

✅ **Success হলে:**
1. Phone/Emulator এ Settings app automatically খুলবে
2. Terminal এ success messages দেখবেন
3. `test_screenshot.png` file তৈরি হবে

```
==================================================
🚀 Starting Android Automation Test
==================================================

📱 Connecting to device...
✅ Settings app opened successfully!
📸 Screenshot saved: test_screenshot.png

✅ Test completed successfully!
==================================================
```

---

## Advanced Examples

### Example 1: WhatsApp Automation

```python
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

capabilities = {
    'platformName': 'Android',
    'automationName': 'UiAutomator2',
    'deviceName': 'Android',
    'appPackage': 'com.whatsapp',
    'appActivity': '.HomeActivity',
    'noReset': True,
}

driver = webdriver.Remote('http://localhost:4723', 
    options=UiAutomator2Options().load_capabilities(capabilities))

wait = WebDriverWait(driver, 20)

# Search button click করুন
search = wait.until(EC.presence_of_element_located(
    (AppiumBy.ID, "com.whatsapp:id/menuitem_search")))
search.click()

# Contact name type করুন
search_box = wait.until(EC.presence_of_element_located(
    (AppiumBy.ID, "com.whatsapp:id/search_src_text")))
search_box.send_keys("Contact Name")

driver.quit()
```

---

### Example 2: Browser Automation

```python
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy

capabilities = {
    'platformName': 'Android',
    'automationName': 'UiAutomator2',
    'deviceName': 'Android',
    'browserName': 'Chrome',
}

driver = webdriver.Remote('http://localhost:4723',
    options=UiAutomator2Options().load_capabilities(capabilities))

# Google open করুন
driver.get("https://www.google.com")

# Search করুন
search = driver.find_element(AppiumBy.NAME, "q")
search.send_keys("Android Automation")
search.submit()

driver.quit()
```

---

### Example 3: Element Inspector দিয়ে Element খুঁজুন

```bash
# Appium Inspector install করুন
npm install -g appium-inspector

# Run করুন
appium-inspector
```

**GUI তে:**
1. Remote Host: `localhost`
2. Remote Port: `4723`
3. Desired Capabilities add করুন
4. **Start Session** click করুন
5. Elements inspect করুন এবং locators কপি করুন

---

## Troubleshooting

### Problem 1: `adb: command not found`

**Solution:**
```bash
# ANDROID_HOME check করুন
echo $ANDROID_HOME

# যদি empty হয় Step 5 আবার করুন
# .bashrc reload করুন
source ~/.bashrc

# adb manually add করুন
export PATH=$PATH:$HOME/Android/Sdk/platform-tools
```

---

### Problem 2: `adb devices` shows empty list

**Solution:**
```bash
# ADB server restart করুন
adb kill-server
adb start-server

# Device permission check করুন
lsusb
sudo usermod -aG plugdev $USER

# Logout/Login করুন
# আবার try করুন
adb devices
```

---

### Problem 3: Phone এ "unauthorized" দেখাচ্ছে

**Solution:**
```bash
# RSA key revoke করুন phone থেকে
# Settings → Developer Options → Revoke USB debugging authorizations

# adb restart করুন
adb kill-server
adb start-server
adb devices

# Phone এ আবার popup আসবে
# "Always allow" checkbox দিন এবং Allow click করুন
```

---

### Problem 4: Appium connection refused

**Solution:**
```bash
# Appium server চলছে কিনা check করুন
ps aux | grep appium

# Port 4723 free আছে কিনা check করুন
netstat -tulpn | grep 4723

# Appium restart করুন
killall node
appium
```

---

### Problem 5: `npm: command not found`

**Solution:**
```bash
# NVM install করুন (Step 2 দেখুন)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Terminal restart করুন
source ~/.bashrc

# Node.js install করুন
nvm install --lts
```

---

### Problem 6: Python module not found

**Solution:**
```bash
# pip upgrade করুন
pip3 install --upgrade pip

# Appium client reinstall করুন
pip3 uninstall Appium-Python-Client
pip3 install Appium-Python-Client

# Virtual environment use করুন (recommended)
python3 -m venv venv
source venv/bin/activate
pip install Appium-Python-Client selenium
```

---

### Problem 7: `appium-doctor` সব ✓ দেখাচ্ছে না

**Common Issues:**

❌ **ANDROID_HOME not set**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
```

❌ **JAVA_HOME not set**
```bash
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
echo 'export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64' >> ~/.bashrc
```

❌ **adb not in PATH**
```bash
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**সব fix করার পর:**
```bash
source ~/.bashrc
appium-doctor --android
```

---

## Useful Commands Reference

### ADB Commands

```bash
# Devices list
adb devices

# Device information
adb shell getprop ro.build.version.release  # Android version
adb shell getprop ro.product.model          # Device model

# Install APK
adb install app.apk

# Uninstall app
adb uninstall com.package.name

# Screenshot
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png

# Screen recording
adb shell screenrecord /sdcard/demo.mp4

# Logcat (logs)
adb logcat

# Package list
adb shell pm list packages

# Current activity
adb shell dumpsys window | grep mCurrentFocus
```

---

### Appium Commands

```bash
# Start Appium server
appium

# Specific port এ start করুন
appium -p 4725

# Verbose logging
appium --log-level debug

# Log file এ save করুন
appium --log appium.log

# Driver list
appium driver list

# Install driver
appium driver install uiautomator2

# Update driver
appium driver update uiautomator2
```

---

### Python Script Snippets

#### Find element by ID
```python
element = driver.find_element(AppiumBy.ID, "com.app:id/button")
element.click()
```

#### Find element by XPath
```python
element = driver.find_element(AppiumBy.XPATH, "//android.widget.Button[@text='Login']")
```

#### Send keys
```python
text_field = driver.find_element(AppiumBy.ID, "input_field")
text_field.send_keys("Hello World")
```

#### Wait for element
```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)
element = wait.until(EC.presence_of_element_located(
    (AppiumBy.ID, "element_id")))
```

#### Swipe
```python
driver.swipe(start_x=500, start_y=1000, end_x=500, end_y=300, duration=800)
```

#### Scroll
```python
driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR, 
    'new UiScrollable(new UiSelector().scrollable(true)).scrollForward()')
```

---

## Best Practices

### 1. Use Explicit Waits
```python
# ❌ Bad
import time
time.sleep(5)

# ✅ Good
from selenium.webdriver.support.ui import WebDriverWait
wait = WebDriverWait(driver, 10)
element = wait.until(EC.presence_of_element_located((AppiumBy.ID, "id")))
```

### 2. Use Page Object Model (POM)
```python
class LoginPage:
    def __init__(self, driver):
        self.driver = driver
    
    def enter_username(self, username):
        self.driver.find_element(AppiumBy.ID, "username").send_keys(username)
    
    def enter_password(self, password):
        self.driver.find_element(AppiumBy.ID, "password").send_keys(password)
    
    def click_login(self):
        self.driver.find_element(AppiumBy.ID, "login_btn").click()
```

### 3. Handle Exceptions Properly
```python
try:
    element = driver.find_element(AppiumBy.ID, "element_id")
    element.click()
except NoSuchElementException:
    print("Element not found")
    driver.save_screenshot("error.png")
finally:
    driver.quit()
```

### 4. Use Configuration Files
```python
# config.py
APPIUM_SERVER = 'http://localhost:4723'
PLATFORM_NAME = 'Android'
DEVICE_NAME = 'Android Emulator'
```

---

## Resources এবং Links

### Official Documentation
- **Appium:** https://appium.io/docs/en/latest/
- **Android Developer:** https://developer.android.com/
- **Selenium Python:** https://selenium-python.readthedocs.io/

### Community এবং Support
- **Appium Forum:** https://discuss.appium.io/
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/appium
- **GitHub:** https://github.com/appium/appium

### Tutorials এবং Courses
- **Appium Tutorial (YouTube):** Search "Appium Python Tutorial"
- **Test Automation University:** https://testautomationu.applitools.com/

---

## Summary Checklist

Setup সম্পূর্ণ হয়েছে কিনা verify করুন:

- ✅ Java JDK installed
- ✅ Node.js এবং npm installed
- ✅ Android Studio installed
- ✅ Android SDK configured
- ✅ Environment variables set
- ✅ `adb devices` shows your device
- ✅ Appium installed
- ✅ `appium-doctor --android` সব ✓ দেখাচ্ছে
- ✅ Python এবং Appium-Python-Client installed
- ✅ Test script successfully runs

---

## Next Steps

এখন আপনি করতে পারবেন:

1. ✅ যেকোনো Android app automate করতে পারবেন
2. ✅ Automated testing framework তৈরি করতে পারবেন
3. ✅ CI/CD pipeline এ integrate করতে পারবেন
4. ✅ WhatsApp, Browser automation করতে পারবেন

---

**Created:** 2026-10-17  
**Last Updated:** 2026-10-17  
**Author:** Sabbir  
**Version:** 1.0

---

## License
এই documentation টি freely ব্যবহার করতে পারবেন শেখার এবং development এর জন্য।
