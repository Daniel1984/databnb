const mongoose = require('mongoose');
const Neighborhood = require('../models/neighborhood');
const Listing = require('../models/listing');
const scrapeListings = require('../scripts/listingInfoScraper');
const getListingStartDate = require('../scripts/reviewsScraper');
const persistListingAvailabilities = require('../routes/pricePrediction/helpers/persistListingAvailabilities');
const { getAvailabilityUrl } = require('../scripts/utils');
const getListingAvailabilities = require('../scripts/listingAvailabilityScraper');

require('dotenv').config();

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('SUCCESS'))
  .catch(err => console.log(err));

(async () => {
  const neighborhoods = await Neighborhood.find();

  while (neighborhoods.length) {
    const neighborhood = neighborhoods.shift();
    const listings = await scrapeListings({ suburb: neighborhood.name });

    while (listings.length) {
      const listing = listings.shift();
      const persistedListing = await Listing.findOne({ id: listing.id });

      if (!persistedListing) {
        let listingStartDate;
        try {
          listingStartDate = await getListingStartDate({ listingId: listing.id });
        } catch (error) {
          console.log(`persistListingsWithAvailabilities.js:getListingStartDate: ${error}`);
        }

        console.log(`Found new listing: ${listing.id}`);

        const persistedListing = await Listing.create({
          ...listing,
          geo: {
            type: 'Point',
            coordinates: [listing.lng, listing.lat],
          },
          listing_start_date: listingStartDate,
          availability_checked_at: new Date(),
        });

        const availabilityUrl = getAvailabilityUrl({ listingId: persistedListing.id });
        try {
          const availabilities = await getListingAvailabilities(availabilityUrl);

          try {
            await persistListingAvailabilities({
              availabilities,
              listingId: persistedListing._id,
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
  // process.exit(0);
})();
