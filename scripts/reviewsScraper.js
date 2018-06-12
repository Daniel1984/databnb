const addMonths = require('date-fns/add_months');
const request = require('request');
const { getReviewsUrl } = require('./utils');
const constants = require('../constants.json');

const today = new Date();
today.setDate(1);
const MONTH_AGO = addMonths(today, -1);

module.exports = ({ listingId }) => {
  const options = {
    url: getReviewsUrl({ listingId }),
    headers: constants.airbnbHeaders,
  };

  const defaultListingStartDate = MONTH_AGO;

  return new Promise((resolve) => {
    request(options, (err, res, body) => {
      if (err || res.statusCode >= 400 || !body) {
        resolve(defaultListingStartDate);
      }

      try {
        const responseReviews = JSON.parse(body);

        if (!responseReviews.reviews.length) {
          resolve(defaultListingStartDate);
          return;
        }

        const { created_at } = responseReviews.reviews.pop();

        const startDate = new Date(created_at);
        startDate.setDate(1);
        resolve(startDate);
      } catch (error) {
        resolve(defaultListingStartDate);
      }
    });
  });
};
