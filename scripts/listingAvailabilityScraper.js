const request = require('request');
const format = require('date-fns/format');
const constants = require('../constants.json');

module.exports = async (url) => {
  const options = { url, headers: constants.airbnbHeaders };

  return new Promise((resolve) => {
    request(options, (err, res, body) => {
      if (err || res.statusCode >= 400 || !body) {
        resolve([]);
        return;
      }

      try {
        const { calendar_months } = JSON.parse(body);
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

        resolve(filteredDays);
      } catch (error) {
        console.log(`listingAvailabilityScraper:error: ${error}, body: ${body}`);
        resolve([]);
      }
    });
  });
};
