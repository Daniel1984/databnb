const { promisify } = require('util');
const request = require('request');

const requestPromise = promisify(request.post);

const defaultPayload = {
  from: 'Team Metabnb <no-reply@metabnb.com>',
};

module.exports = props => (
  requestPromise(process.env.MAILGUN_URI, { form: { ...defaultPayload, ...props } })
);
