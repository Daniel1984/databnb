const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const chalk = require('chalk');

const getPropertyPaymentData = require('./propertyPaymentScraper');
const getPropertyReviewsData = require('./reviewsScraper');
const scrapePropertyLinksAndMore = require('./propertyLinksScraper');
const scrapePropertyInfo = require('./propertyInfoScraper');
const Property = require('../models/property');

const {
  getDatesToFetch,
  getListingUrl,
  getListingPaymentUrl,
  getPropertyListUrl
} = require('./utils');

mongoose.connect('mongodb://localhost/databnb', { useMongoClient: true, promiseLibrary: global.Promise });

async function startCollectiong(page = 0) {
  let propertyUrlsAndIds = [];
  let canFetchNextPage = true;

  do {
    const propertiesLink = getPropertyListUrl(page);
    console.log(chalk.black.bgYellow.bold(`GET: PROPERTIES IDS: ${propertiesLink}`));

    const { linksAndIds, hasMoreProperties, hasErrors } = await scrapePropertyLinksAndMore(propertiesLink);
    propertyUrlsAndIds = linksAndIds;
    canFetchNextPage = hasMoreProperties;
  } while (!propertyUrlsAndIds.length && !hasErrors);

  console.log(chalk.black.bgGreen.bold(`FOUND ${propertyUrlsAndIds.length} PROPERTIES TO SCRAPE ON PAGE ${page}`));

  while (propertyUrlsAndIds.length) {
    const { listingId, listingUrl } = propertyUrlsAndIds.shift();
    const listingStartDate = await getPropertyReviewsData({ listingId });
    const datesToFetch = getDatesToFetch(listingStartDate);

    while (datesToFetch.length) {
      const { checkIn, checkOut } = datesToFetch.shift();
      console.log(chalk.black.bgYellow.bold(`GET: INFO FOR CHECKIN: ${checkIn} | CHECKOUT: ${checkOut}`));
      const propertyPaymentData = await getPropertyPaymentData(getListingPaymentUrl({ listingId, checkIn, checkOut }));
      const propertyInfoData = await scrapePropertyInfo(getListingUrl({ listingUrl, checkIn, checkOut }));

      console.log(JSON.stringify({
        ...propertyPaymentData,
        ...propertyInfoData,
        listing_id: listingId,
        check_in: checkIn,
        check_out: checkOut
      }));

      const property = new Property({
        ...propertyPaymentData,
        ...propertyInfoData,
        listing_id: listingId,
        check_in: checkIn,
        check_out: checkOut
      });

      property.save();
    }
  }

  console.log(chalk.black.bgGreen.bold(`DONE SCRAPING PAGE ${page}`));

  if (canFetchNextPage) {
    console.log(chalk.black.bgYellow.bold(`STARTING TO SCRAPE PAGE ${page + 1}`));
    startCollectiong(page + 1);
    return;
  }

  console.log(chalk.black.bgGreen.bold('DONE SCRAPING LONDON PROPERTIES'));
  mongoose.disconnect();
};

startCollectiong();
