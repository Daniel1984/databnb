const includes = require('lodash/includes');
const { promisify } = require('util');
const request = require('request');
const constants = require('../constants.json');
const requestPromise = promisify(request);

// safety switch as sometimes it goes into infinite count
const MAX_LISTINGS_PER_LOCATION = 300;
const MAX_SCRAPING_ATTEMPTS = 6;

function getListingsInfoUrl({ suburb }) {
  const location = encodeURI(suburb);

  return [
    'https://www.airbnb.com/api/v2/explore_tabs',
    '?version=1.3.4',
    '&_format=for_explore_search_web',
    '&experiences_per_grid=20',
    '&items_per_grid=18',
    '&guidebooks_per_grid=20',
    '&auto_ib=false',
    '&fetch_filters=true',
    '&has_zero_guest_treatment=false',
    '&is_guided_search=true',
    '&is_new_cards_experiment=true',
    '&luxury_pre_launch=false',
    '&query_understanding_enabled=true',
    '&show_groupings=true',
    '&supports_for_you_v3=true',
    '&timezone_offset=120',
    '&metadata_only=false',
    '&is_standard_search=true',
    '&tab_id=home_tab',
    '&refinement_paths%5B%5D=%2Fhomes',
    '&allow_override%5B%5D=',
    '&min_beds=0',
    '&min_bedrooms=1',
    '&s_tag=7XYmZYoy',
    '&last_search_session_id=',
    '&screen_size=medium',
    `&query=${location}`,
    '&_intents=p1',
    '&federated_search_session_id=a50200a5-ac1b-4f52-8070-acd28ecdc3fb',
    '&key=d306zoyjsyarp7ifhu67rjxn52tv0t20',
    '&currency=EUR',
    '&locale=en',
  ].join('');
}

module.exports = async function scrapeListings({ suburb, socket, bedrooms = null, persistedListingsIds }) {
  let hasMoreListingsToFetch = true;
  let sectionOffset = 0;
  let foundListings = [];
  let scrapeAttempt = 0;

  while (hasMoreListingsToFetch) {
    const listingsInfoUrl = getListingsInfoUrl({ suburb });
    const url = sectionOffset ? `${listingsInfoUrl}&section_offset=${sectionOffset}` : listingsInfoUrl;
    let body;

    try {
      const res = await requestPromise({ url, headers: constants.airbnbHeaders });
      body = res.body;
      hasMoreListingsToFetch = res.statusCode < 400;

      if (!hasMoreListingsToFetch) {
        continue;
      }
    } catch (error) {
      hasMoreListingsToFetch = false;
      console.log(`requestPromise: ${error}`);
      continue;
    }

    try {
      const { explore_tabs } = JSON.parse(body);

      const {
        sections,
        pagination_metadata: { has_next_page },
      } = explore_tabs.filter(({ tab_id, tab_name }) => (
        tab_id === 'home_tab' || tab_name === 'Homes' || tab_id === 'all_tab'
      ))[0];

      let listings = [];

      sections.forEach((section) => {
        listings = [...listings, ...(section.listings || [])];
      });

      if (persistedListingsIds && persistedListingsIds.length) {
        listings = listings.filter(({ listing: { id } }) => !includes(persistedListingsIds, id));
      }

      if (bedrooms !== null) {
        listings = listings.filter(({ listing }) => listing.bedrooms == bedrooms);
      }

      foundListings = [...foundListings, ...listings];

      console.log(`found ${foundListings.length} listings for ${suburb}`);

      if (socket) {
        socket.emit('getListings:loadingInfo', {
          msg: 'Scanning area for properties',
        });
      }

      hasMoreListingsToFetch = has_next_page || false;
      sectionOffset += 1;

      if (foundListings.length > MAX_LISTINGS_PER_LOCATION) {
        hasMoreListingsToFetch = false;
      }

      scrapeAttempt += 1;

      if (scrapeAttempt > MAX_SCRAPING_ATTEMPTS) {
        hasMoreListingsToFetch = false;
      }
    } catch (error) {
      console.log(`cant get info for suburb: ${suburb}, error: ${error}`);
      hasMoreListingsToFetch = false;
    }
  }

  return foundListings;
};
