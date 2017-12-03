const addMonths = require('date-fns/add_months');
const request = require('request');
const { getReviewsUrl } = require('./utils');

let today = new Date();
today.setDate(1);
const MONTH_AGO = addMonths(today, -1);

module.exports = ({ listingId }) => {
  const options = {
    url: getReviewsUrl({ listingId }),
    headers: {
      'authority': 'www.airbnb.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
      'x-csrf-token': 'V4$.airbnb.com$p2qO3lXWvn4$8d7lkccDKlIqHFxKgzWlJ08vIBOvUdWDLCdGOWqZvNk=',
    }
  };

  const defaultListingStartDate = MONTH_AGO;

  return new Promise((resolve) => {
    request(options, (err, res, body) => {

      if (err || res.statusCode >= 400 || !body) {
        // console.log(`ERR: NO REVIEWS FOUND, USING DEFAULT ${defaultListingStartDate}`);
        resolve(defaultListingStartDate);
      }

      try {
        const responseReviews = JSON.parse(body);

        if (!responseReviews.reviews.length) {
          // console.log(`WARNING: NO REVIEWS FOUND, USING DEFAULT ${defaultListingStartDate}`);
          resolve(defaultListingStartDate);
          return;
        }

        const { created_at } = responseReviews.reviews.pop();

        // console.log(`SUCCESS: GOT LISTING START TIME - ${created_at}`);

        const startDate = new Date(created_at);
        startDate.setDate(1);
        resolve(startDate);
      } catch (error) {
        // console.log(`ERR: PARSING JSON ${error}`);
        resolve(defaultListingStartDate);
      }
    });
  });
}
