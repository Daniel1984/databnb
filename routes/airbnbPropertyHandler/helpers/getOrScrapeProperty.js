const getListingStartDate = require('../../../scripts/reviewsScraper');
const { getAvailabilityUrl, getYearAndMonthForAirbnbUrl } = require('../../../scripts/utils');
const getListingAvailabilities = require('../../../scripts/listingAvailabilityScraper');
const Listing = require('../../../models/listing');
const ListingAvailability = require('../../../models/listingAvailability');

module.exports = async function getOrScrapeProperty({ listingId, userId }) {
  let persistedProperty = await Listing.findOne({ id: listingId });

  if (!persistedProperty) {
    console.log('GOING NOW');
    let listingStartDate;
    try {
      listingStartDate = await getListingStartDate({ listingId });
    } catch (error) {
      console.log(`getOrScrapeProperty.js:getListingStartDate: ${error}`);
    }

    const availabilityUrl = getAvailabilityUrl({ listingId, ...getYearAndMonthForAirbnbUrl() });

    let availabilities;
    try {
      availabilities = await getListingAvailabilities(availabilityUrl);
    } catch (error) {
      console.log(`persistListingsWithAvailabilities.js:getListingAvailabilities: ${error}`);
    }

    while (availabilities.length) {
      let { days = [] } = availabilities.shift();

      while (days.length) {
        const day = days.shift();

        try {
          await ListingAvailability.create({
            ...day,
            listing_id: listingId,
          });
        } catch (error) {
          console.log(`persistListingAvailabilities.js:availability:crud: ${error}`);
        }
      }
    }
  }

  return persistedProperty;
}
