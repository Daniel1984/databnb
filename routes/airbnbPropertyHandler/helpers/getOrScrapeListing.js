const { getAvailabilityUrl } = require('../../../scripts/utils');
const getListingAvailabilities = require('../../../scripts/listingAvailabilityScraper');
const Listing = require('../../../models/listing');
const ListingAvailability = require('../../../models/listingAvailability');
const scrapeListingInfo = require('./scrapeListingInfo');

module.exports = async function getOrScrapeProperty({ listingId, userId }) {
  let persistedListing = await Listing.findOneAndUpdate({ id: listingId }, { user_id: userId });

  if (persistedListing && persistedListing.user_id) {
    throw new Error('this property is assigned to user');
  }

  if (!persistedListing) {
    try {
      const listingData = await scrapeListingInfo(listingId);
      persistedListing = await Listing.create({
        ...listingData,
        id: listingId,
        user_id: userId,
      });
    } catch (error) {
      console.log(`getOrScrapeListing: ${error}`);
      throw error;
    }
  }

  const availabilityUrl = getAvailabilityUrl({ listingId });

  let availabilities;
  try {
    availabilities = await getListingAvailabilities(availabilityUrl);
  } catch (error) {
    console.log(`getOrScrapeListing:getListingAvailabilities: ${error}`);
    throw error;
  }

  while (availabilities.length) {
    const { days = [] } = availabilities.shift();

    while (days.length) {
      const day = days.shift();

      try {
        await ListingAvailability.create({
          ...day,
          listing_id: persistedListing._id,
        });
      } catch (error) {
        console.log(`getOrScrapeListing:availability:crud: ${error}`);
      }
    }
  }

  return persistedListing;
};
