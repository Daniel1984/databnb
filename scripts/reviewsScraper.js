const addMonths = require('date-fns/add_months');
const request = require('request');
const chalk = require('chalk');
const { getReviewsUrl } = require('./utils');

const MONTH_AGO = addMonths(new Date(), -1);

module.exports = async ({ listingId }) => {
  console.log(chalk.black.bgYellow.bold(`GET: LISTING REVIEWS FOR ID - ${listingId}`));

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
        console.log(chalk.white.bgRed.bold(`ERR: NO REVIEWS FOUND, USING DEFAULT ${defaultListingStartDate}`));
        resolve(defaultListingStartDate);
      }

      const responseReviews = JSON.parse(body);

      if (!responseReviews.reviews.length) {
        console.log(chalk.black.bgGreen.bold(`WARNING: NO REVIEWS FOUND, USING DEFAULT ${defaultListingStartDate}`));
        resolve(defaultListingStartDate);
        return;
      }

      const { created_at } = responseReviews.reviews.pop();

      console.log(chalk.black.bgGreen.bold(`SUCCESS: GOT LISTING START TIME - ${created_at}`));

      resolve(created_at);
    });
  });
}
