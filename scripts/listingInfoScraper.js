const { promisify } = require('util');
const request = require('request');
const requestPromise = promisify(request);

function getListingsInfoUrl({ suburb }) {
  const location = encodeURI(suburb);

  return [
    'https://www.airbnb.com/api/v2/explore_tabs',
    '?version=1.3.2',
    '&_format=for_explore_search_web',
    '&experiences_per_grid=20',
    '&items_per_grid=50',
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
    '&selected_tab_id=all_tab',
    '&tab_id=home_tab',
    `&location=${location}`,
    '&federated_search_session_id=e30fad3d-4dfd-4348-b72a-bb2d1f53ca0c',
    '&_intents=p1',
    // '&zoom=14',
    '&screen_size=large',
    '&key=d306zoyjsyarp7ifhu67rjxn52tv0t20',
    '&currency=USD',
    '&locale=en'
  ].join('');
}

const headers = {
  'authority': 'www.airbnb.com',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  'x-csrf-token': 'V4$.airbnb.com$HxMVGU-RyKM$1Zwcm1JOrU3Tn0Y8oRrvN3Hc67ZQSbOKVnMjCRtZPzQ=',
};

module.exports = async function scrapeListings({ suburb, socket }) {
  let hasMoreListingsToFetch = true;
  let sectionOffset = 0
  let foundListings = [];

  while (hasMoreListingsToFetch) {
    const listingsInfoUrl = getListingsInfoUrl({ suburb });
    const url = sectionOffset ? `${listingsInfoUrl}&section_offset=${sectionOffset}` : listingsInfoUrl;
    let body;

    try {
      const res = await requestPromise({ url, headers });
      body = res.body;
      hasMoreListingsToFetch = res.statusCode < 400;
    } catch (error) {
      hasMoreListingsToFetch = false;
      console.log(`requestPromise: ${error}`);
    }

    try {
      const { explore_tabs } = JSON.parse(body);

      const {
        sections,
        pagination_metadata: { has_next_page, section_offset },
      } = explore_tabs.filter(tab => (tab.tab_id === 'home_tab' || tab.tab_name === 'Homes'))[0];

      const { listings } = sections[0];
      foundListings = [...foundListings, ...listings];

      console.log(`got ${foundListings.length} listings for ${suburb}`);

      if (socket) {
        socket.emit('getListings:loadingInfo', {
          msg: `Found ${foundListings.length} properties`,
        });
      }

      hasMoreListingsToFetch = has_next_page;
      sectionOffset = section_offset;
    } catch (error) {
      console.log(`cant get info for suburb: ${suburb}, error: ${error}`);
      hasMoreListingsToFetch = false;
    }
  }

  return foundListings;
}
