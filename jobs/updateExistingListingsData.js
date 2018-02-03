const setDate = require('date-fns/set_date');
const mongoose = require('mongoose');
const config = require('../config');
const Neighborhood = require('../models/neighborhood');
const Listing = require('../models/listing');
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
  today.setDate(1);
  today.setMonth(today.getMonth() + 1);

  return {
    year: today.getFullYear(),
    month: today.getMonth(),
  };
}

(async () => {
  const neighborhoods = await Neighborhood.find();
    // .find({
    //   $or: [
    //     { listingsScrapedAt: { $lte: setDate(new Date(), (new Date()).getDate() - 7) } },
    //     { listingsScrapedAt: { $eq: null } }
    //   ]
    // });

  while (neighborhoods.length) {
    const neighborhood = neighborhoods.shift();
    const listings = await Listing.find({ neighborhood_id: neighborhood._id });

    while (listings.length) {
      const listing = listings.shift();
      const availabilityUrl = getAvailabilityUrl({ listingId: listing.id, ...getYearAndMonthForAirbnbUrl() });

      console.log(`Updating listing: ${listing._id}`);

      try {
        const availabilities = await getListingAvailabilities(availabilityUrl);

        try {
          await persistListingAvailabilities({
            availabilities,
            listingId: listing._id,
            neighborhoodId: listing.neighborhood_id
          });
        } catch (error) {
          console.log(`persistListingsWithAvailabilities.js:persistListingAvailabilities: ${error}`);
        }
      } catch (error) {
        console.log(`updateExistingListingsData.js:getListingAvailabilities: ${error}`);
      }
    }

    try {
      console.log(`Updating neighborhood: ${neighborhood._id}`);
      await Neighborhood.findByIdAndUpdate(neighborhood._id, { listingsScrapedAt: new Date() });
    } catch (error) {
      console.log(`persistListingsWithAvailabilities.js:findByIdAndUpdate: ${error}`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
})()
