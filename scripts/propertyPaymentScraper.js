const request = require('request');
const utils = require('./utils');
const chalk = require('chalk');

module.exports = async (url) => {
  console.log(chalk.black.bgYellow.bold(`GET: PAYMENT INFO FROM - ${url}`));

  const options = {
    url,
    headers: {
      'authority': 'www.airbnb.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
      'x-csrf-token': 'V4$.airbnb.com$p2qO3lXWvn4$8d7lkccDKlIqHFxKgzWlJ08vIBOvUdWDLCdGOWqZvNk=',
    }
  };

  return new Promise((resolve) => {
    let failedRequest = false;
    let responseJson;

    do {
      request(options, (err, res, body) => {
        if (err || res.statusCode >= 400 || !body) {
          console.log(chalk.white.bgRed.bold(`ERROR: COULDN'T FETCH PAYMENT DATA, ${err}`));
          failedRequest = true;
        }

        try {
          responseJson = JSON.parse(body);
          failedRequest = false;

          const bookingDetails = responseJson.pdp_listing_booking_details[0];

          resolve({
            amount_including_fees: bookingDetails.rate_as_guest_canonical.amount,
            cleaning_fee: utils.getNumericValue(bookingDetails.localized_cleaning_fee),
            security_deposit: utils.getNumericValue(bookingDetails.localized_security_deposit),
            extra_people_fee: utils.getNumericValue(bookingDetails.localized_extra_people_fee),
            currency: bookingDetails.rate_as_guest_canonical.currency,
          });
        } catch (error) {
          console.log(chalk.white.bgRed.bold(`ERROR: COULDN'T PARSE PAYMENT RESPONSE DATA, TRYING AGAIN, ${error}`));
          responseJson = undefined;
          failedRequest = true;
        }
      });
    } while(!failedRequest && responseJson && responseJson.pdp_listing_booking_details && responseJson.pdp_listing_booking_details.length);
  });
}
