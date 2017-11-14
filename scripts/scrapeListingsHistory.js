const chalk = require('chalk');
const getPropertyPaymentData = require('./propertyPaymentScraper');
const scrapePropertyInfo = require('./propertyInfoScraper');
const { getListingUrl, getListingPaymentUrl, getDatesToFetch } = require('./utils');
const Listing = require('../models/listing');

module.exports = async ({ listingUrl, listingStartDate, _id, listingId }) => {
  let datesToFetch = getDatesToFetch(listingStartDate);
  const listingsHistory = [];

  console.log(chalk.black.bgYellow.bold(`GET: LISTING HISTORY FOR DATES - ${JSON.stringify(datesToFetch)}`));

  while (datesToFetch.length) {
    const { checkIn, checkOut } = datesToFetch.shift();
    const propertyInfoData = await scrapePropertyInfo(getListingUrl({ listingUrl, checkIn, checkOut }));
    const propertyPaymentData = await getPropertyPaymentData(getListingPaymentUrl({ listingId, checkIn, checkOut }));

    if (propertyInfoData && propertyPaymentData) {
      listingsHistory.push({
        ...propertyPaymentData,
        ...propertyInfoData,
        check_in: checkIn,
        check_out: checkOut,
        listing: _id,
      });
    } else {
      await Listing.findByIdAndUpdate(_id, { unavailable: true });
      datesToFetch = [];
    }
  }

  return listingsHistory;
}
