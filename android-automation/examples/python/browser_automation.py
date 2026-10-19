#!/usr/bin/env python3
"""
Android Browser Automation Example
Chrome/Browser automation on Android
"""

from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


APPIUM_SERVER = 'http://localhost:4723'

capabilities = {
    'platformName': 'Android',
    'platformVersion': '13',
    'deviceName': 'Android Device',
    'automationName': 'UiAutomator2',
    'browserName': 'Chrome',  # Chrome browser automation
    'chromedriverExecutable': '/path/to/chromedriver',  # আপনার chromedriver path
}


def automate_web_browsing():
    """Android এ web browser automate করা"""

    print("🌐 Starting browser automation...")

    options = UiAutomator2Options().load_capabilities(capabilities)
    driver = webdriver.Remote(APPIUM_SERVER, options=options)
    wait = WebDriverWait(driver, 20)

    try:
        # Google open করা
        print("📱 Opening Google...")
        driver.get("https://www.google.com")
        time.sleep(2)

        # Search করা
        print("🔍 Searching...")
        search_box = wait.until(
            EC.presence_of_element_located((AppiumBy.NAME, "q"))
        )
        search_box.send_keys("Android Automation")
        search_box.submit()
        time.sleep(3)

        # Screenshot
        driver.save_screenshot("google_search.png")
        print("✅ Search completed!")

        # Facebook login example
        print("\n🔐 Testing Facebook login...")
        driver.get("https://m.facebook.com")
        time.sleep(3)

        email_field = driver.find_element(AppiumBy.NAME, "email")
        email_field.send_keys("your_email@example.com")

        pass_field = driver.find_element(AppiumBy.NAME, "pass")
        pass_field.send_keys("your_password")

        # Note: Don't actually login without permission!
        # login_btn = driver.find_element(AppiumBy.NAME, "login")
        # login_btn.click()

        print("✅ Browser automation completed!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        driver.save_screenshot("error.png")

    finally:
        driver.quit()


def automate_form_filling(url, form_data):
    """
    Web form automatically fill করা

    Args:
        url: website URL
        form_data: dictionary with form field data
    """

    options = UiAutomator2Options().load_capabilities(capabilities)
    driver = webdriver.Remote(APPIUM_SERVER, options=options)

    try:
        driver.get(url)
        time.sleep(2)

        for field_name, value in form_data.items():
            field = driver.find_element(AppiumBy.NAME, field_name)
            field.send_keys(value)
            time.sleep(0.5)

        print("✅ Form filled successfully!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

    finally:
        driver.quit()


if __name__ == "__main__":
    automate_web_browsing()

    # Example: Form filling
    # form_data = {
    #     'name': 'Sabbir',
    #     'email': 'sabbir@example.com',
    #     'phone': '01700000000'
    # }
    # automate_form_filling('https://example.com/form', form_data)
