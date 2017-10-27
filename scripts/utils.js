const addMonths = require('date-fns/add_months');
const formatDate = require('date-fns/format');
const addYears = require('date-fns/add_years')
const differenceInMonths = require('date-fns/difference_in_months')

// default for range of scraping start from same day last month until today
const MONTH_AGO = addMonths(new Date(), -1);

module.exports = {
  getNumericValue(str) {
    return Number(`${str}`.split('').filter(n => /^\d+$/.test(n)).join(''));
  },

  getDatesToFetch(listingStartDate = MONTH_AGO) {
    const datesToFetch = [];
    const monthsSinceLaunch = differenceInMonths(new Date(), listingStartDate);

    for (let i = 0; i <= monthsSinceLaunch; i += 1) {
      const checkIn = formatDate(addMonths(listingStartDate, i), 'YYYY-MM-DD');
      const checkOut = formatDate(addMonths(listingStartDate, i + 1), 'YYYY-MM-DD');
      datesToFetch.push({ checkIn, checkOut });
    }

    return datesToFetch;
  },

  getListingPaymentUrl({ listingId, checkIn, checkOut }) {
    return `https://www.airbnb.com/api/v2/pdp_listing_booking_details?guests=1&listing_id=${listingId}&_format=for_web_with_date&_intents=p3_book_it&check_in=${checkIn}&check_out=${checkOut}&number_of_adults=1&number_of_children=0&number_of_infants=0&key=d306zoyjsyarp7ifhu67rjxn52tv0t20&currency=USD`;
  },

  getListingUrl({ listingUrl, checkIn, checkOut }) {
    return `${listingUrl}&check_in=${checkIn}&guests=1&adults=1&check_out=${checkOut}`
  },

  getReviewsUrl({ listingId }) {
    return `https://www.airbnb.com/api/v2/reviews?key=d306zoyjsyarp7ifhu67rjxn52tv0t20&currency=USD&locale=en&listing_id=${listingId}&role=guest&_format=for_p3&_limit=0&_offset=1&_order=language_country`;
  },

  getPropertyListUrl(page) {
    return `https://www.airbnb.com/s/London--United-Kingdom/homes${page ? `?section_offset=${page}` : ''}`;
  }
};
