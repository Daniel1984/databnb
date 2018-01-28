const mongoose = require('mongoose');
const config = require('../config');
const Neighborhood = require('../models/neighborhood');
const Listing = require('../models/listing');
const scrapeListings = require('../scripts/listingInfoScraper');
const getListingStartDate = require('../scripts/reviewsScraper');
const ListingAvailability = require('../models/listingAvailability');
const persistListingAvailabilities = require('../routes/pricePrediction/helpers/persistListingAvailabilities');
const { getAvailabilityUrl } = require('../scripts/utils');
const getListingAvailabilities = require('../scripts/listingAvailabilityScraper');

mongoose.Promise = require('bluebird');
mongoose.connect(config.dbUri, { useMongoClient: true })
  .then(() => console.log('SUCCESS'))
  .catch(err => console.log(err));

function getYearAndMonthForAirbnbUrl() {
  const today = new Date();
  today.setMonth(today.getMonth() + 1);

  return {
    year: today.getFullYear(),
    month: today.getMonth(),
  };
}

(async () => {
  const neighborhoods = await Neighborhood.find();

  while (neighborhoods.length) {
    const neighborhood = neighborhoods.shift();
    const listings = await scrapeListings({ suburb: neighborhood.name });

    while (listings.length) {
      const { listing } = listings.shift();
      const persistedListing = await Listing.findOne({ id: listing.id });

      if (!persistedListing) {
        let listingStartDate;
        try {
          listingStartDate = await getListingStartDate({ listingId: listing.id });
        } catch (error) {
          console.log(`persistListingsWithAvailabilities.js:getListingStartDate: ${error}`);
        }

        console.log(`Got new listing: ${listing.id}`);

        const persistedListing = await Listing.create({
          ...listing,
          neighborhood_id: neighborhood._id,
          listing_start_date: listingStartDate,
          availability_checked_at: new Date(),
        });

        const availabilityUrl = getAvailabilityUrl({ listingId: persistedListing.id, ...getYearAndMonthForAirbnbUrl() });

        try {
          const availabilities = await getListingAvailabilities(availabilityUrl);

          try {
            await persistListingAvailabilities({
              availabilities,
              listingId: persistedListing._id,
              neighborhoodId: neighborhood._id
            });
          } catch (error) {
            console.log(`checkForNewListingsInExistingNighborhoods.js:persistListingAvailabilities: ${error}`);
          }
        } catch (error) {
          console.log(`checkForNewListingsInExistingNighborhoods.js:getListingAvailabilities: ${error}`);
        }
      }
    }
  }

  console.log('Done!');
  await mongoose.disconnect();
  process.exit(0);
})()
