const mongoose = require('mongoose');
const Listing = require('../models/listing');
const getListingStartDate = require('../scripts/reviewsScraper');

require('dotenv').config();

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('DB: SUCCESS'))
  .catch(err => console.log(err));

(async () => {
  const listings = await Listing.find({ listing_start_date: null });

  while (listings.length) {
    const listing = listings.shift();
    console.log(`checking start date for ${listing.id} listing`);

    try {
      const listingStartDate = await getListingStartDate({ listingId: listing.id });
      await Listing.findOneAndUpdate({ id: listing.id }, { listing_start_date: listingStartDate });
    } catch (error) {
      console.log(`Cant find start date for ${listing.id} listing: ${error}`);
    }
  }

  console.log('Done checking start date!');
  await mongoose.disconnect();
  // process.exit(0);
})();
