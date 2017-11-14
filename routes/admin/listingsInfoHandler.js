const request = require('request');
const City = require('../../models/city');
const Neighborhood = require('../../models/neighborhood');
const Listing = require('../../models/listing');

function getInfoUrl({ city, neighborhood }) {
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
    `&location=${neighborhood} ${city}`,
    '&federated_search_session_id=e30fad3d-4dfd-4348-b72a-bb2d1f53ca0c',
    '&_intents=p1',
    '&key=d306zoyjsyarp7ifhu67rjxn52tv0t20',
    '&currency=USD',
    '&locale=en'
  ].join('');
}

module.exports = async (req, res, next) => {
  const { city, neighborhood } = req.query;

  if (!city || !neighborhood) {
    res.status(200).json({ err: 'city and neighborhood must be specified'});
    return;
  }

  let cityModel = await City.findOne({ name: city });

  if (!cityModel) {
    cityModel = await City.create({ name: city });;
  }

  res.status(200).json({ msg: `started getting info for ${neighborhood} neighborhood.`});

  const options = {
    url: getInfoUrl({ city, neighborhood }),
    headers: {
      'authority': 'www.airbnb.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
      'x-csrf-token': 'V4$.airbnb.com$elyeLCWfhnw$UFJ_qHhwTrVcDVA4GRrgReIhG5o8ycPYhdyHMUKXXE0=',
    }
  };

  request(options, async (err, response, body) => {
    if (err || response.statusCode >= 400 || !body) {
      console.log(chalk.white.bgRed.bold('ERROR: COULDN`T FETCH PAYMENT DATA'));
      res.status(200).json({ err: `cant get info for ${neighborhood}` });
      return;
    }

    try {
      const { explore_tabs } = JSON.parse(body);

      const {
        sections,
        home_tab_metadata: { listings_count }
      } = explore_tabs.filter(tab => (tab.tab_id === 'home_tab' || tab.tab_name === 'Homes'))[0];

      const { listings } = sections[0];

      let neighborhoodModel = await Neighborhood.findOne({ name: neighborhood, city: cityModel._id });

      if (!neighborhoodModel) {
        neighborhoodModel = await Neighborhood.create({
          name: neighborhood,
          city: cityModel._id,
          listings_count,
        });
      }

      listings.forEach(({ listing }) => {
        Listing.create({ ...listing, neighborhood: neighborhoodModel._id, city: cityModel._id });
      });

    } catch (error) {
      res.status(200).json({ err: `cant get info for ${neighborhood}` });
    }
  });
}
