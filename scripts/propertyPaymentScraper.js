const request = require('request');
const utils = require('./utils');

module.exports = async (url) => {
  console.log(`GET: PAYMENT INFO FROM - ${url}`);

  const options = {
    url,
    headers: {
      'authority': 'www.airbnb.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
      'x-csrf-token': 'V4$.airbnb.com$xBp27wugDFc$rr7NeRdApi5UCVMMsCPyQ2ulkwJ2MHJ1xxq7hv1Fkn8=',
    }
  };

  return new Promise((resolve) => {
    let responseJson;
    let skipScrape = false;

    do {
      responseJson = undefined;

      request(options, (err, res, body) => {
        if (err || res && res.statusCode >= 400 || !body) {
          console.log(`ERROR: GET PAYMENT DATA - ${err}, Status Code - ${res && res.statusCode ? res.statusCode: ''}, body - ${body}`);
          resolve(null);
          skipScrape = true;
          return;
        }

        try {
          responseJson = JSON.parse(body);

          const bookingDetails = responseJson.pdp_listing_booking_details[0];

          resolve({
            amount_including_fees: bookingDetails.rate_as_guest_canonical.amount,
            cleaning_fee: utils.getNumericValue(bookingDetails.localized_cleaning_fee),
            security_deposit: utils.getNumericValue(bookingDetails.localized_security_deposit),
            extra_people_fee: utils.getNumericValue(bookingDetails.localized_extra_people_fee),
            currency: bookingDetails.rate_as_guest_canonical.currency,
          });
        } catch (error) {
          console.log(`ERROR: COULDN'T PARSE PAYMENT RESPONSE DATA, TRYING AGAIN, ${error}`);
          resolve(null);
          skipScrape = true;
        }
      });
    } while(!skipScrape && (responseJson && responseJson.pdp_listing_booking_details && responseJson.pdp_listing_booking_details.length));
  });
}
