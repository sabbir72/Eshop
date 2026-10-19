#!/usr/bin/env python3
"""
Basic Android Automation Example using Appium + Python
"""

from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
import time


# Appium Server Configuration
APPIUM_SERVER = 'http://localhost:4723'

# Android Device Capabilities
capabilities = {
    'platformName': 'Android',
    'platformVersion': '13',  # আপনার Android version
    'deviceName': 'Android Emulator',  # অথবা real device name
    'automationName': 'UiAutomator2',

    # App install করতে চাইলে
    # 'app': '/path/to/your/app.apk',

    # Already installed app open করতে
    'appPackage': 'com.android.settings',  # Example: Settings app
    'appActivity': '.Settings',

    # Optional settings
    'noReset': True,
    'fullReset': False,
}

def test_basic_automation():
    """Basic automation test example"""

    print("🚀 Starting Appium test...")

    # Appium driver initialize
    options = UiAutomator2Options().load_capabilities(capabilities)
    driver = webdriver.Remote(APPIUM_SERVER, options=options)

    try:
        print("✅ App opened successfully!")
        time.sleep(2)

        # Example: Search করা
        # search_box = driver.find_element(AppiumBy.ID, "com.android.settings:id/search_action_bar")
        # search_box.click()
        # search_box.send_keys("WiFi")

        print("📸 Taking screenshot...")
        driver.save_screenshot("screenshot.png")

        print("✅ Test completed successfully!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

    finally:
        print("🔚 Closing app...")
        driver.quit()


if __name__ == "__main__":
    test_basic_automation()
