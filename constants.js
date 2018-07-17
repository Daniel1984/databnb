const ba = require('browser-agents');

module.exports = {
  searchRadius: 700, // meters
  getAirbnbHeaders() {
    return {
      authority: 'www.airbnb.com',
      'x-csrf-token': 'V4$.airbnb.com$jddhhqyTx5s$dG0h85QNPK3WPkod4mmXsVqz8eYfpoHOzitSwfTuIwU=',
      'User-Agent': ba.random(),
    };
  },
};
