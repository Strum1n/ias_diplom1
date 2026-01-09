import asyncio
import urllib.parse

import zendriver as driver
from fake_useragent import UserAgent
from geopy.geocoders import Nominatim


async def main():
    ua_desktop = UserAgent(platforms="desktop")
    browser_args_desktop = ["--window-size=1280,720", "--ignore-gpu-blocklist", f"--user-agent={ua_desktop.random}"]
    parse_url = "https://www.avito.ru/bryansk/kvartiry/"
    browser = await driver.start(browser_args=browser_args_desktop, headless=False)
    page = await browser.get(parse_url)
    while True:
        try:
            await page.wait_for_ready_state("complete", timeout=2)
            items_el = await page.select_all('[data-marker="item-photo-sliderLink"]')
            break
        except Exception as e:
            print(e)
        await page.reload()

    info_el = await page.find(r'window.__mfe__ = "%7B%22user-navigation-tools', timeout=3)
    info = await info_el.get_html()
    encoded_json_string = info.split("preloadedState__ = ")[1].split(";</script>")[0]

    decoded_string = urllib.parse.unquote(encoded_json_string)
    geolocator = Nominatim(api_key="516c69e6-532f-4aff-880f-f743b8c0e2a2", user_agent="sassessds")
    location_reverse = geolocator.reverse("пр-т Станке Димитрова, д. 67, корп. 7")
    location = geolocator.geocode("34.363731,53.243325")
    print("sas")


if __name__ == "__main__":
    asyncio.run(main())
