const request = require('request');
const City = require('../../models/city');
const Neighborhood = require('../../models/neighborhood');
const Listing = require('../../models/listing');
const suburbs = require('../../suburbs.json');

function getInfoUrl({ city, suburb }) {
  return [
    'https://www.airbnb.com/api/v2/explore_tabs',
    '?version=1.3.1',
    '&_format=for_explore_search_web',
    '&experiences_per_grid=0',
    '&items_per_grid=300',
    '&guidebooks_per_grid=0',
    '&auto_ib=true',
    '&fetch_filters=true',
    '&is_guided_search=false',
    '&is_new_trips_cards_experiment=true',
    '&is_new_homes_cards_experiment=false',
    '&luxury_pre_launch=false',
    '&screen_size=large',
    '&show_groupings=false',
    '&supports_for_you_v3=true',
    '&timezone_offset=120',
    '&metadata_only=false',
    '&is_standard_search=true',
    '&tab_id=home_tab',
    `&location=${suburb} ${city}`,
    '&federated_search_session_id=e30fad3d-4dfd-4348-b72a-bb2d1f53ca0c',
    '&_intents=p1',
    '&key=d306zoyjsyarp7ifhu67rjxn52tv0t20',
    '&currency=USD',
    '&locale=en'
  ].join('');
}

module.exports = async (req, res, next) => {
  const { city } = req.query;

  if (!city) {
    res.status(200).json({ err: 'city must be specified'});
    return;
  }

  if (!suburbs[city]) {
    res.status(200).json({ err: 'city is not yet set with suburbs data'});
    return;
  }

  let cityModel = await City.findOne({ name: city });

  if (!cityModel) {
    cityModel = await City.create({ name: city });;
  }

  res.status(200).json({ msg: `started getting listings for ${city}.`});

  suburbs[city].forEach((suburb) => {
    const options = {
      url: getInfoUrl({ city, suburb }),
      headers: {
        'authority': 'www.airbnb.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
        'x-csrf-token': 'V4$.airbnb.com$elyeLCWfhnw$UFJ_qHhwTrVcDVA4GRrgReIhG5o8ycPYhdyHMUKXXE0=',
      }
    };

    request(options, async (err, response, body) => {
      if (err || response.statusCode >= 400 || !body) {
        console.log('ERROR: COULDN`T FETCH LISTING INFO');
        return;
      }

      try {
        const { explore_tabs } = JSON.parse(body);

        const {
          sections
        } = explore_tabs.filter(tab => (tab.tab_id === 'home_tab' || tab.tab_name === 'Homes'))[0];

        const { listings } = sections[0];

        let suburbModel = await Neighborhood.findOne({ name: suburb, city_id: cityModel._id });

        if (!suburbModel) {
          suburbModel = await Neighborhood.create({
            name: suburb,
            city_id: cityModel._id
          });
        }

        while (listings.length) {
          const { listing } = listings.shift();
          const updatedListing = await Listing.findOneAndUpdate({ id: listing.id }, listing);

          if (!updatedListing) {
            await Listing.create({ ...listing, neighborhood_id: suburbModel._id, city_id: cityModel._id });
          }
        }

        console.log('DONE!');
      } catch (error) {
        console.log(`cant get info for ${suburb}`);
      }
    });
  });
}
