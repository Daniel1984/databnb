const axios = require('axios');
const flow = require('lodash/fp/flow');
const pick = require('lodash/fp/pick');
const filter = require('lodash/fp/filter');
const map = require('lodash/fp/map');
const compact = require('lodash/fp/compact');
const first = require('lodash/fp/first');
const includes = require('lodash/fp/includes');
const flatten = require('lodash/fp/flatten');
const constants = require('../constants');

// safety switch as sometimes it goes into infinite count
const MAX_LISTINGS_PER_LOCATION = 300;
const MAX_SCRAPING_ATTEMPTS = 6;

const WANTED_TAB_IDS = ['home_tab', 'all_tab'];

function getListingsInfoUrl({ suburb, bedrooms }) {
  const location = encodeURI(suburb);
  return [
    'https://www.airbnb.com/api/v2/explore_tabs',
    '?version=1.3.8',
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
    '&client_session_id=c2102072-77fe-4663-8006-97eb739901ae',
    '&metadata_only=false',
    '&is_standard_search=true',
    '&refinement_paths%5B%5D=%2Fhomes',
    '&selected_tab_id=home_tab',
    '&place_id=ChIJa3z2sROU3UYRQUVFTI3RACY',
    '&allow_override%5B%5D=',
    bedrooms ? `&min_bedrooms=${bedrooms}` : '',
    '&screen_size=medium',
    `&query=${location}`,
    '&_intents=p1',
    '&key=d306zoyjsyarp7ifhu67rjxn52tv0t20',
    '&currency=EUR',
    '&locale=en',
  ].join('');
}

const getMandatoryDataSet = ({ tab_id, tab_name }) => (
  includes(tab_id, WANTED_TAB_IDS) || tab_name === 'Homes'
);

const extractListings = dataset => ({
  listings: flow(
    map(({ listings }) => listings),
    flatten,
    compact,
    map(({ listing }) => listing)
  )(dataset.sections),
  hasNextPage: dataset.pagination_metadata.has_next_page,
});

const skipPersistedListings = ({ dataset, persistedListingsIds }) => ({
  ...dataset,
  listings: filter(({ id }) => !includes(id, persistedListingsIds))(dataset.listings),
});

const filterByBedrooms = ({ dataset, bedrooms }) => ({
  ...dataset,
  listings: filter(listing => Number(listing.bedrooms) === Number(bedrooms))(dataset.listings),
});

module.exports = async function scrapeListings({
  suburb,
  socket,
  bedrooms = null,
  persistedListingsIds = [],
}) {
  let hasMoreListingsToFetch = true;
  let sectionOffset = 0;
  let foundListings = [];
  let scrapeAttempt = 0;

  while (hasMoreListingsToFetch) {
    const listingsInfoUrl = getListingsInfoUrl({ suburb, bedrooms });
    const url = sectionOffset ? `${listingsInfoUrl}&section_offset=${sectionOffset}` : listingsInfoUrl;

    try {
      const { data: { explore_tabs } } = await axios.get(url, { headers: constants.getAirbnbHeaders() });
      const { listings, hasNextPage } = flow(
        filter(getMandatoryDataSet),
        first,
        pick(['sections', 'pagination_metadata']),
        extractListings,
        dataset => skipPersistedListings({ dataset, persistedListingsIds }),
        dataset => filterByBedrooms({ dataset, bedrooms })
      )(explore_tabs);

      hasMoreListingsToFetch = hasNextPage;
      foundListings = [...foundListings, ...listings];

      console.log(`found ${foundListings.length} listings for ${suburb}`);

      if (socket) {
        socket.emit('getListings:loadingInfo', {
          msg: 'Scanning area for properties',
        });
      }

      sectionOffset += 1;

      if (foundListings.length > MAX_LISTINGS_PER_LOCATION) {
        hasMoreListingsToFetch = false;
      }

      scrapeAttempt += 1;

      if (scrapeAttempt > MAX_SCRAPING_ATTEMPTS) {
        hasMoreListingsToFetch = false;
      }
    } catch (error) {
      console.log(`listingInfoScraper.js: ${error}`);
    }
  }

  return foundListings;
};
