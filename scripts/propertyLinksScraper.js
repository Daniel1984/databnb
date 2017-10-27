const puppeteer = require('puppeteer');
const chalk = require('chalk');
const { uniqBy } = require('lodash/fp');

function getPropertyLinksAndIds(page) {
  return page.evaluate((selector) => {
    const getNumericValue = (str) => Number(`${str}`.split('').filter(n => /^\d+$/.test(n)).join(''));
    const errors = [];

    const linksAndIds = Array.from(document.querySelectorAll(selector))
      .map(a => ({ href: a.href, target: a.target }))
      .filter(a => a.href.indexOf('/rooms/') !== -1)
      .map(({ href, target }) => {
        let listingId = getNumericValue(target);

        if (!listingId) {
          errors.push(`ERROR: LISTING ID NOT FOUND IN TARGET, TRYING TO GET FROM ${href}`);
          const matches = href.match(/rooms\/(\d+)/)
          listingId = matches ? matches[1] : null;
        }

        if (!listingId) {
          errors.push(`ERROR: LISTING ID NOT FOUND IN = ${href}`);
        }

        return { listingId, listingUrl: href };
      });

    const paginationNav = document.querySelector('nav[data-id="SearchResultsPagination"]');

    if (!paginationNav) {
      errors.push('ERROR: PAGINATION SELECTOR NOT FOUND');
    }

    return {
      linksAndIds,
      hasMoreProperties: paginationNav ? !!paginationNav.querySelector('svg[aria-label="Next"]') : true,
      errors,
    };
  }, 'a');
}

module.exports = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  let linksAndIds;
  let hasMoreProperties;
  let hasErrors = false;

  try {
    const propertiesData = await getPropertyLinksAndIds(page);
    linksAndIds = propertiesData.linksAndIds;
    hasMoreProperties = propertiesData.hasMoreProperties;
    hasErrors = !!propertiesData.errors.length;
    propertiesData.errors.length && console.log(chalk.white.bgRed.bold(propertiesData.errors.join('\n')));
  } catch (err) {
    hasErrors = true;
    console.log(chalk.white.bgRed.bold(`ERROR: FETCHING PROPERTY IDS AND URLS - ${err}`));
  }

  await browser.close();

  return Promise.resolve({
    linksAndIds: uniqBy('listingId', linksAndIds),
    hasMoreProperties,
    hasErrors,
  })
}
