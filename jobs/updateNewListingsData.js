const setDate = require('date-fns/set_date');
const mongoose = require('mongoose');
const config = require('../config');
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
  today.setMonth(today.getMonth() + 1);

  return {
    year: today.getFullYear(),
    month: today.getMonth(),
  };
}

(async () => {
  const listings = await Listing.find({ createdAt: { $gte: new Date('2018-01-25') }});

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

  console.log('DONE');
  await mongoose.disconnect();
  process.exit(0);
})();
