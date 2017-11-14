const request = require('request');
const utils = require('./utils');

module.exports = async ({ listingId }) => {
  console.log(`GET: LISTING AVAILABILITY INFO FOR ID: ${listingId}`);

  const options = {
    url,
    headers: {
      'authority': 'www.airbnb.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
      'x-csrf-token': 'V4$.airbnb.com$elyeLCWfhnw$UFJ_qHhwTrVcDVA4GRrgReIhG5o8ycPYhdyHMUKXXE0=',
    }
  };
}
