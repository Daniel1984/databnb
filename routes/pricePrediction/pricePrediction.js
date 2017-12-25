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

function getYearAndMonthForAirbnbUrl() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() - 1;

  return { year, month };
}

module.exports = async function pricePrediction({ lat, lng, bedrooms, address, socketId, socket }) {
  let listings = await getListings({ lat, lng, bedrooms });

  if (listings.length) {
    const listingsWithAvailabilities = await getListingsWithAvailabilities(listings);
    socket.emit('listings', { listings: listingsWithAvailabilities });
    return;
  }

  const suburb = await getOrCreateNeighborhood(address);
  listings = await getListingsInfo({ suburb: address });
  listings = listings.filter(({ listing }) => listing.bedrooms == bedrooms);

  // deal with 0 listings
  let analyzedProperties = 0;
  let totalProperties = listings.length;

  while (listings.length) {
    socket.emit('getListings:loadingInfo', { msg: `Loading ${analyzedProperties += 1}/${totalProperties} properties` });
    const { listing } = listings.shift();
    const listingStartDate = await getListingStartDate({ listingId: listing.id });
    const persistedListing = await createOrUpdateListing({ listing, listingStartDate, suburbId: suburb._id });
    const { id: listingId, _id: listingDbId, neighborhood_id } = persistedListing;
    const availabilityUrl = getAvailabilityUrl({ listingId, ...getYearAndMonthForAirbnbUrl() });
    const availabilityMonths = await getListingAvailabilities(availabilityUrl);

    while (availabilityMonths.length) {
      let { days = [] } = availabilityMonths.shift();
      days = days.filter(({ date }) => isBefore(date, lastDayOfMonth(new Date())));

      while (days.length) {
        const day = days.shift();
        await ListingAvailability.create({ ...day, listing_id: listingDbId, neighborhood_id });
      }
    }

    const listingWithAvailabilities = await getListingsWithAvailabilities([persistedListing]);
    socket.emit('listing', { listing: listingWithAvailabilities });
    await Listing.findByIdAndUpdate(listingDbId, { availability_checked_at: Date.now() });
  }

  socket.emit('reenableForm', true);
};
