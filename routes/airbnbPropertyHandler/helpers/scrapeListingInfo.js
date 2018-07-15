const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function scrapeListingInfo(listingId) {
  try {
    const { data } = await axios.get(`https://www.airbnb.com/rooms/${listingId}`);
    const $ = cheerio.load(data);
    const dataString = $('script[type="application/json"][data-hypernova-key="spaspabundlejs"]')[0].children[0].data;
    const json = JSON.parse(dataString.replace(/<!--|-->/g, '').trim());
    const {
      bootstrapData: {
        query: { location },
        reduxData: {
          homePDP: {
            listingInfo: {
              listing: {
                star_rating,
                localized_city,
                lat,
                lng,
                visible_review_count,
                person_capacity,
                bed_label,
                bedroom_label,
                name,
                photos,
                p3_event_data_logging: {
                  picture_count,
                  room_type,
                },
              },
            },
          },
        },
      },
    } = json;

    return {
      star_rating,
      localized_city,
      geo: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      lat,
      lng,
      visible_review_count,
      person_capacity,
      picture_count,
      room_type,
      location,
      name,
      picture_url: photos.length ? photos[0].large : '',
      bedrooms: parseFloat(bedroom_label),
      beds: parseInt(bed_label, 10),
    };
  } catch (error) {
    throw error;
  }
};
