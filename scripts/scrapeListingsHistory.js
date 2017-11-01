const chalk = require('chalk');
const getPropertyPaymentData = require('./propertyPaymentScraper');
const scrapePropertyInfo = require('./propertyInfoScraper');
const { getListingUrl, getListingPaymentUrl, getDatesToFetch } = require('./utils');

module.exports = async ({ listingUrl, listingStartDate, _id, listingId }) => {
  const datesToFetch = getDatesToFetch(listingStartDate);
  const listingsHistory = [];

  console.log(chalk.black.bgYellow.bold(`GET: LISTING HISTORY FOR DATES - ${JSON.stringify(datesToFetch)}`));

  while (datesToFetch.length) {
    const { checkIn, checkOut } = datesToFetch.shift();
    const propertyPaymentData = await getPropertyPaymentData(getListingPaymentUrl({ listingId, checkIn, checkOut }));
    const propertyInfoData = await scrapePropertyInfo(getListingUrl({ listingUrl, checkIn, checkOut }));

    listingsHistory.push({
      ...propertyPaymentData,
      ...propertyInfoData,
      checkIn,
      checkOut,
      listing: _id,
    });
  }

  return listingsHistory;
}
