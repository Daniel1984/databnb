const addMonths = require('date-fns/add_months');
const request = require('request');
const { getReviewsUrl } = require('./utils');

const today = new Date();
today.setDate(1);
const MONTH_AGO = addMonths(today, -1);

module.exports = ({ listingId }) => {
  const options = {
    url: getReviewsUrl({ listingId }),
    headers: {
      authority: 'www.airbnb.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
      'x-csrf-token': 'V4$.airbnb.com$HxMVGU-RyKM$1Zwcm1JOrU3Tn0Y8oRrvN3Hc67ZQSbOKVnMjCRtZPzQ=',
    }
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
}
