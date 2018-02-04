const DEFAULT_ENV = 'local';

module.exports = {
  local: {
    dbUri: 'mongodb://localhost/metabnb-local',
    apiUrl: 'http://localhost:3030',
    mailgunUri: 'https://api:key-29f9230764201880aab439c452999cca@api.mailgun.net/v3/sandboxbbdfc55446de44ce825880d5ec3f07c1.mailgun.org/messages',
  },
  production: {
    dbUri: 'mongodb://daniel:DSvr!l4ezv@94.130.183.7:27017/metabnb',
    apiUrl: 'https://api.metabnb.com',
    mailgunUri: 'https://api:key-29f9230764201880aab439c452999cca@api.mailgun.net/v3/api.mailgun.net/v3/mg.metabnb.com/messages',
  },
}[process.env.NODE_ENV || DEFAULT_ENV];
