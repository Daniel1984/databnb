const addMonths = require('date-fns/add_months');
const axios = require('axios');
const { getReviewsUrl } = require('./utils');

module.exports = async ({ listingId }) => {
  const today = new Date();
  today.setDate(1);
  const defaultListingStartDate = addMonths(today, -1);

  try {
    const { data: { reviews } } = await axios.get(getReviewsUrl(listingId));

    if (!reviews || !reviews.length) {
      return defaultListingStartDate;
    }

    const { created_at } = reviews.pop();

    const startDate = new Date(created_at);
    startDate.setDate(1);
    return startDate;
  } catch (error) {
    console.log(error);
    return defaultListingStartDate;
  }
};
