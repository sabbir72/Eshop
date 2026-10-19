#!/usr/bin/env python3
"""
WhatsApp Automation Example
Automatically send messages
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
    'appPackage': 'com.whatsapp',
    'appActivity': '.HomeActivity',
    'noReset': True,
}


def send_whatsapp_message(contact_name, message):
    """
    WhatsApp এ automatically message পাঠানো

    Args:
        contact_name: যাকে message পাঠাবেন তার নাম
        message: কি message পাঠাবেন
    """

    print(f"🚀 Opening WhatsApp...")

    options = UiAutomator2Options().load_capabilities(capabilities)
    driver = webdriver.Remote(APPIUM_SERVER, options=options)
    wait = WebDriverWait(driver, 20)

    try:
        time.sleep(3)

        # Search icon click
        print(f"🔍 Searching for contact: {contact_name}")
        search_btn = wait.until(
            EC.presence_of_element_located((AppiumBy.ID, "com.whatsapp:id/menuitem_search"))
        )
        search_btn.click()

        # Contact name type করা
        search_box = wait.until(
            EC.presence_of_element_located((AppiumBy.ID, "com.whatsapp:id/search_src_text"))
        )
        search_box.send_keys(contact_name)
        time.sleep(2)

        # First contact select করা
        contact = driver.find_element(
            AppiumBy.XPATH,
            f"//android.widget.TextView[@text='{contact_name}']"
        )
        contact.click()

        # Message লেখা
        print(f"✍️ Typing message...")
        message_box = wait.until(
            EC.presence_of_element_located((AppiumBy.ID, "com.whatsapp:id/entry"))
        )
        message_box.send_keys(message)

        # Send button click
        print(f"📤 Sending message...")
        send_btn = driver.find_element(AppiumBy.ID, "com.whatsapp:id/send")
        send_btn.click()

        print(f"✅ Message sent successfully to {contact_name}!")
        time.sleep(2)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        driver.save_screenshot("error_screenshot.png")

    finally:
        driver.quit()


def bulk_send_messages(contacts, message):
    """
    একাধিক contacts এ একই message পাঠানো

    Args:
        contacts: list of contact names
        message: message to send
    """
    for contact in contacts:
        print(f"\n{'='*50}")
        send_whatsapp_message(contact, message)
        time.sleep(5)  # প্রতিটি message এর মাঝে delay


if __name__ == "__main__":
    # Example 1: Single message
    send_whatsapp_message("Sabbir", "Hello! This is an automated message")

    # Example 2: Bulk messages
    # contacts = ["Contact1", "Contact2", "Contact3"]
    # bulk_send_messages(contacts, "Automated greeting message!")
