const { promisify } = require('util');
const request = require('request');
const { mailgunUri } = require('../config');

const requestPromise = promisify(request.post);

const defaultPayload = {
  from: 'Team Metabnb <no-reply@metabnb.com>',
}

module.exports = props => {
  return requestPromise(mailgunUri, { form: { ...defaultPayload, ...props } })
};
