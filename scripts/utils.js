module.exports = {
  getNumericValue(str) {
    return Number(`${str}`.split('').filter(n => /^\d+$/.test(n)).join(''));
  },

  getReviewsUrl: ({ listingId }) => (
    `https://www.airbnb.com/api/v2/reviews?key=d306zoyjsyarp7ifhu67rjxn52tv0t20&currency=USD&locale=en&listing_id=${listingId}&role=guest&_format=for_p3&_limit=0&_offset=1&_order=language_country`
  ),

  getAvailabilityUrl({ listingId, year, month }) {
    month = !month ? 1 : month;
    return `https://www.airbnb.com/api/v2/calendar_months?key=d306zoyjsyarp7ifhu67rjxn52tv0t20&currency=USD&locale=en&listing_id=${listingId}&month=${month}&year=${year}&count=5&_format=with_conditions`
  },

  getYearAndMonthForAirbnbUrl() {
    const today = new Date();
    today.setDate(1);
    today.setMonth(today.getMonth() + 1);

    return {
      year: today.getFullYear(),
      month: today.getMonth(),
    };
  },
};
