const mongoose = require('mongoose');
const chalk = require('chalk');

const propertyLinksScraper = require('./propertyLinksScraper');
const City = require('../models/city');
const { getPropertyListUrl } = require('./utils');


(async () => {
  mongoose.connect('mongodb://localhost/databnb', { useMongoClient: true });

  let payload = [];
  let canScrape = true;
  let page = 0;

  do {
    const propertiesUrl = getPropertyListUrl(page);
    console.log(`GET: ${propertiesUrl}`)
    const { linksAndIds, hasMoreProperties, hasErrors } = await propertyLinksScraper(propertiesUrl);
    canScrape = hasErrors || hasMoreProperties;
    page += 1;

    payload = [...payload, ...linksAndIds];
  } while (canScrape);


  const city = new City({ listings: payload, city: 'london' });

  city.save((err) => {
    if (err) {
      console.log(`ERR saving listing ids and urls - ${err}`)
    }

    console.log('DONE SAVING');
    mongoose.disconnect();
  });


  console.log('DONE');
})();
