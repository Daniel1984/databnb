const mongoose = require('mongoose');
const Neighborhood = require('../models/neighborhood');
const Listing = require('../models/listing');
const persistListingAvailabilities = require('../routes/pricePrediction/helpers/persistListingAvailabilities');
const { getAvailabilityUrl, getYearAndMonthForAirbnbUrl } = require('../scripts/utils');
const getListingAvailabilities = require('../scripts/listingAvailabilityScraper');

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.DB_URI, { useMongoClient: true })
  .then(() => console.log('SUCCESS'))
  .catch(err => console.log(err));

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

      console.log(`Updating listing: ${listing._id}, neighborhoods left: ${neighborhoods.length}`);

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
  console.log('DONE!');
  // process.exit(0);
})();
