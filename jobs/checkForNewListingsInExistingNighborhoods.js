const setDate = require('date-fns/set_date');
const mongoose = require('mongoose');
const config = require('../config');
const Neighborhood = require('../models/neighborhood');
const Listing = require('../models/listing');
const scrapeListings = require('../scripts/listingInfoScraper');
const getListingStartDate = require('../scripts/reviewsScraper');

mongoose.Promise = require('bluebird');
mongoose.connect(config.dbUri, { useMongoClient: true })
  .then(() => console.log('SUCCESS'))
  .catch(err => console.log(err));

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

        await Listing.create({
          ...listing,
          neighborhood_id: neighborhood._id,
          listing_start_date: listingStartDate,
          availability_checked_at: null,
        });
      }
    }
  }

  console.log('Done!');
  await mongoose.disconnect();
  process.exit(0);
})()
