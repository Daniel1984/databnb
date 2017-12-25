const express = require('express');
const groupBy = require('lodash/fp/groupBy');
const map = require('lodash/fp/map');
const flow = require('lodash/fp/flow');
const sumBy = require('lodash/fp/sumBy');
const lastDayOfMonth = require('date-fns/last_day_of_month');
const isBefore = require('date-fns/is_before');
const Listing = require('../../models/listing');
const ListingAvailability = require('../../models/listingAvailability');
const getListingsInfo = require('../../scripts/listingInfoScraper');
const getListingStartDate = require('../../scripts/reviewsScraper');
const { getAvailabilityUrl } = require('../../scripts/utils');
const getListingAvailabilities = require('../../scripts/listingAvailabilityScraper');
const getListingsWithAvailabilities = require('./helpers/getListingsWithAvailabilities');
const getListings = require('./helpers/getListings');
const getOrCreateNeighborhood = require('./helpers/getOrCreateNeighborhood');
const createOrUpdateListing = require('./helpers/createOrUpdateListing');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const { lat, lng, bedrooms, address } = req.query;
  let listings = await getListings({ lat, lng, bedrooms });

  if (listings.length) {
    const listingsWithAvailabilities = await getListingsWithAvailabilities(listings);
    res.status(200).json({ listings: listingsWithAvailabilities });
    return;
  }

  listings = await getListingsInfo({ suburb: address });

  if (!listings.length) {
    return res.status(403).json({ msg: `No listings found in ${address}` });
  }

  listings = listings.filter(({ listing }) => listing.bedrooms == bedrooms);

  const suburb = await getOrCreateNeighborhood(address);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() - 1;

  let persistedListings = [];
  res.set({ 'content-type': 'application/json' })

  while (listings.length) {
    const { listing } = listings.shift();
    const listingStartDate = await getListingStartDate({ listingId: listing.id });
    const persistedListing = await createOrUpdateListing({ listing, listingStartDate, suburbId: suburb._id });
    const { id: listingId, _id: listingDbId, neighborhood_id } = persistedListing;
    const availabilityUrl = getAvailabilityUrl({ listingId, year, month });
    const availabilityMonths = await getListingAvailabilities(availabilityUrl);

    persistedListings = [...persistedListings, persistedListing];

    while (availabilityMonths.length) {
      let { days = [] } = availabilityMonths.shift();
      days = days.filter(({ date }) => isBefore(date, lastDayOfMonth(today)));

      while (days.length) {
        const day = days.shift();
        await ListingAvailability.create({ ...day, listing_id: listingDbId, neighborhood_id });
      }
    }

    await Listing.findByIdAndUpdate(listingDbId, { availability_checked_at: new Date() });
  }

  const listingsWithAvailabilities = await getListingsWithAvailabilities(persistedListings);
  res.status(200).json({ listings: listingsWithAvailabilities });
});

module.exports = router;
