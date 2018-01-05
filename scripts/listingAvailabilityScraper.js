const request = require('request');
const utils = require('./utils');
const format = require('date-fns/format');

module.exports = async (url) => {
  const options = {
    url,
    headers: {
      'authority': 'www.airbnb.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
      'x-csrf-token': 'V4$.airbnb.com$xBp27wugDFc$rr7NeRdApi5UCVMMsCPyQ2ulkwJ2MHJ1xxq7hv1Fkn8=',
    }
  };

  return new Promise((resolve) => {
    request(options, (err, res, body) => {
      if (err || res.statusCode >= 400 || !body) {
        resolve([]);
      }

      try {
        const { calendar_months } = JSON.parse(body);
        const filteredDays = calendar_months.map((calendarMonth) => {
          const { year, month, days } = calendarMonth;

          /*
            airbnb mizes dates from previous and next months into current one
            for date picker purpose I guess but that breaks our logic so need to filter
          */
          calendarMonth.days = days.filter(({ date }) => {
            return format(date, 'YYYY-MM') === format([year, month], 'YYYY-MM');
          });

          return calendarMonth;
        })
        resolve(filteredDays);
      } catch (error) {
        console.log(`ERR: PARSING AVAILABILITY JSON ${error}`);
        resolve([]);
      }
    });
  });
}
