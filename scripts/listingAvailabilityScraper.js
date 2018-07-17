const axios = require('axios');
const format = require('date-fns/format');
const constants = require('../constants');

module.exports = async (url) => {
  try {
    const {
      data: {
        calendar_months,
      },
    } = await axios.get(url, { headers: constants.getAirbnbHeaders() });

    const filteredDays = calendar_months.map((calendarMonth) => {
      const { year, month, days } = calendarMonth;

      /*
        airbnb mixes dates from previous and next months into current one
        for date picker purpose I guess but that breaks our logic so need to filter
      */
      calendarMonth.days = days.filter(({ date }) => (
        format(date, 'YYYY-MM') === format([year, month], 'YYYY-MM')
      ));

      return calendarMonth;
    });

    return filteredDays;
  } catch (error) {
    console.log(`listingAvailabilityScraper.js: ${error}`);
    return [];
  }
};
