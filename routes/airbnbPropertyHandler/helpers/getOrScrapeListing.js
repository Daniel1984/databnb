const { getAvailabilityUrl, getYearAndMonthForAirbnbUrl } = require('../../../scripts/utils');
const getListingAvailabilities = require('../../../scripts/listingAvailabilityScraper');
const Listing = require('../../../models/listing');
const ListingAvailability = require('../../../models/listingAvailability');
const scrapeListingInfo = require('./scrapeListingInfo');

module.exports = async function getOrScrapeProperty({ listingId, userId }) {
  let persistedListing = await Listing.findOne({ id: listingId });

  if (!persistedListing) {
    try {
      const listingData = await scrapeListingInfo(listingId);
      persistedListing = await Listing.create({ id: listingId, ...listingData, user_id: userId });
    } catch (error) {
      persistedListing = await Listing.create({ id: listingId, user_id: userId });
    }
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
          listing_id: persistedListing._id,
        });
      } catch (error) {
        console.log(`persistListingAvailabilities.js:availability:crud: ${error}`);
      }
    }
  }

  return persistedListing;
}
