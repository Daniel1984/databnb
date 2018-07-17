const mongoose = require('mongoose');
const Neighborhood = require('../models/neighborhood');
const Listing = require('../models/listing');
const scrapeListings = require('../scripts/listingInfoScraper');
const getListingStartDate = require('../scripts/reviewsScraper');

require('dotenv').config();

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('DB: SUCCESS'))
  .catch(err => console.log(err));

(async () => {
  const neighborhoods = await Neighborhood.find();

  while (neighborhoods.length) {
    const neighborhood = neighborhoods.shift();
    const listings = await scrapeListings({ suburb: neighborhood.name });

    while (listings.length) {
      const listing = listings.shift();

      const persistedListing = await Listing.findOneAndUpdate(
        { id: listing.id },
        {
          ...listing,
          geo: {
            type: 'Point',
            coordinates: [listing.lng, listing.lat],
          },
        }
      );

      if (!persistedListing) {
        let listingStartDate;
        try {
          listingStartDate = await getListingStartDate({ listingId: listing.id });
        } catch (error) {
          console.log(`persistListingsWithAvailabilities.js:getListingStartDate: ${error}`);
        }

        console.log(`Found new listing: ${listing.id}`);

        await Listing.create({
          ...listing,
          geo: {
            type: 'Point',
            coordinates: [listing.lng, listing.lat],
          },
          listing_start_date: listingStartDate,
          availability_checked_at: new Date(),
        });
      } else {
        console.log(`updating listing: ${persistedListing.id}`);
      }
    }
  }

  console.log('Done!');
  await mongoose.disconnect();
  // process.exit(0);
})();
