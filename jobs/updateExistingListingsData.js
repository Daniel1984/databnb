const mongoose = require('mongoose');
const Neighborhood = require('../models/neighborhood');
const Listing = require('../models/listing');
const persistListingAvailabilities = require('../routes/pricePrediction/helpers/persistListingAvailabilities');
const { getAvailabilityUrl, getYearAndMonthForAirbnbUrl } = require('../scripts/utils');
const getListingAvailabilities = require('../scripts/listingAvailabilityScraper');

require('dotenv').config();

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('SUCCESS'))
  .catch(err => console.log(err));

(async () => {
  const listings = await Listing.find({});

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
        });
      } catch (error) {
        console.log(`persistListingsWithAvailabilities.js:persistListingAvailabilities: ${error}`);
      }
    } catch (error) {
      console.log(`updateExistingListingsData.js:getListingAvailabilities: ${error}`);
    }
  }

  await mongoose.disconnect();
  console.log('DONE!');
// process.exit(0);
})();
