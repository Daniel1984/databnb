const puppeteer = require('puppeteer');

function getPropertyInfo(page) {
  return page.evaluate((selector) => {
    const getNumericValue = (str) => Number(`${str}`.split('').filter(n => /^\d+$/.test(n)).join(''));

    const jsonTags = Array.from(document.querySelectorAll(selector))
      .map(tag => JSON.parse(tag.innerHTML.replace(/<!--|-->/g, '')));

    const propertyInfo = jsonTags.filter((json) => {
      const isObject = !Array.isArray(json);

      const hasWantedPropertyInfo =
        isObject &&
        json.bootstrapData &&
        json.bootstrapData.reduxData &&
        json.bootstrapData.reduxData.marketplacePdp &&
        json.bootstrapData.reduxData.marketplacePdp.listingInfo &&
        json.bootstrapData.reduxData.marketplacePdp.listingInfo.listing &&
        json.bootstrapData.reduxData.marketplacePdp.listingInfo.listing.p3_event_data_logging &&
        json.bootstrapData.reduxData.marketplacePdp.listingInfo.listing.price_interface;

      return hasWantedPropertyInfo;
    });

    const {
      listing: {
        bedrooms,
        country,
        city,
        localized_room_type,
        star_rating,
        price_interface,
        p3_event_data_logging,
      },
    } = propertyInfo[0].bootstrapData.reduxData.marketplacePdp.listingInfo;

    function getPrisingValueSafelyFor(key) {
      if (price_interface && price_interface[key] && price_interface[key].value) {
        return getNumericValue(price_interface[key].value);
      }

      return 0;
    }

    return {
      bedrooms,
      country,
      city,
      room_type: localized_room_type,
      star_rating,
      monthly_discount: getPrisingValueSafelyFor('monthly_discount'),
      monthly_discount: getPrisingValueSafelyFor('weekly_discount'),
      extra_people_charge: getPrisingValueSafelyFor('extra_people'),
      listing_lat: p3_event_data_logging.listing_lat,
      listing_lng: p3_event_data_logging.listing_lng,
    };
  }, 'script[type="application/json"]');
}

module.exports = async (url) => {
  console.log(`GET: PROPERTY INFO FROM - ${url}`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  let propertyInfo = null;

  try {
    propertyInfo = await getPropertyInfo(page);
  } catch (error) {
    console.log('ERROR - PROPERTY JSON DATA HAS CHANGED, SOME OF THE FIELDS COULD NOt BE Found');
  }

  await browser.close();
  return Promise.resolve(propertyInfo)
}
