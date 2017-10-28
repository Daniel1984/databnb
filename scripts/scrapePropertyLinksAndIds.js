const mongoose = require('mongoose');
const chalk = require('chalk');

const propertyLinksScraper = require('./propertyLinksScraper');
const getListingStartDate = require('./reviewsScraper');
const City = require('../models/city');
const { getPropertyListUrl } = require('./utils');


(async () => {
  mongoose.connect('mongodb://localhost/databnb', { useMongoClient: true });

  let listingIdsAndUrls = [];
  let canScrape = true;
  let page = 0;

  const listingsWithIdsUrlsAndStartDate = [];

  do {
    const listingsUrl = getPropertyListUrl(page);
    const { linksAndIds, hasMoreProperties, hasErrors } = await propertyLinksScraper(listingsUrl);
    canScrape = hasErrors || hasMoreProperties;
    page += 1;

    listingIdsAndUrls = [...listingIdsAndUrls, ...linksAndIds];
  } while (canScrape);

  do {
    const { listingId, listingUrl } = listingIdsAndUrls.pop();
    const listingStartDate = await getListingStartDate({ listingId });
    listingsWithIdsUrlsAndStartDate.push({ listingId, listingUrl, listingStartDate });
  } while(listingIdsAndUrls.length);


  const city = new City({ listings: listingsWithIdsUrlsAndStartDate, city: 'london' });

  city.save((err) => {
    if (err) {
      console.log(chalk.white.bgRed.bold(`ERROR: SAVING LISTINGS FOR LONDON - ${err}`));
    }

    console.log(chalk.black.bgGreen.bold(`SUCCESS: SAVING LISTINGS FOR LONDON`));
    mongoose.disconnect();
  });
})();
