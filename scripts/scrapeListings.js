const mongoose = require('mongoose');
const chalk = require('chalk');

const propertyLinksScraper = require('./propertyLinksScraper');
const getListingStartDate = require('./reviewsScraper');
const City = require('../models/city');
const { getPropertyListUrl } = require('./utils');

module.exports = async ({ cityPath }) => {
  let listingIdsAndUrls = [];
  let canScrape = true;
  let page = 0;

  const listingsWithIdsUrlsAndStartDate = [];

  do {
    const listingsUrl = getPropertyListUrl({ page, cityPath });
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

  return listingsWithIdsUrlsAndStartDate;
}
