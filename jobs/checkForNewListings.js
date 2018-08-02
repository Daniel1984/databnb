const mongoose = require('mongoose');
const Neighborhood = require('../models/neighborhood');
const Listing = require('../models/listing');
const scrapeListings = require('../scripts/allListingsInfoScraper');

require('dotenv').config();

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('DB: SUCCESS'))
  .catch(err => console.log(err));

(async () => {
  const neighborhoods = await Neighborhood.find();

  while (neighborhoods.length) {
    const neighborhood = neighborhoods.shift();
    console.log(`neighborhoods ${neighborhoods.length} left`);
    const listings = await scrapeListings(neighborhood.name);

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
        console.log(`Found new listing: ${listing.id}`);

        await Listing.create({
          ...listing,
          geo: {
            type: 'Point',
            coordinates: [listing.lng, listing.lat],
          },
        });
      } else {
        console.log(`updating listing: ${persistedListing.id}`);
      }
    }
  }

  console.log('Done looking for new listings!');
  await mongoose.disconnect();
  // process.exit(0);
})();
