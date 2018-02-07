const DEFAULT_ENV = 'local';

module.exports = {
  local: {
    dbUri: 'mongodb://localhost/metabnb-local',
    apiUrl: 'http://localhost:3030',
    clientUrl: 'http://localhost:8080',
    mailgunUri: 'https://api:key-29f9230764201880aab439c452999cca@api.mailgun.net/v3/sandboxbbdfc55446de44ce825880d5ec3f07c1.mailgun.org/messages',
    tokenKey: '4e04432ac8f5f37fd91aecce7c3a989de5f46ba847a2157cd527c50c5d83ebaf',
  },
  production: {
    dbUri: 'mongodb://daniel:DSvr!l4ezv@94.130.183.7:27017/metabnb',
    clientUrl: 'https://metabnb.com',
    apiUrl: 'https://api.metabnb.com',
    mailgunUri: 'https://api:key-29f9230764201880aab439c452999cca@api.mailgun.net/v3/api.mailgun.net/v3/mg.metabnb.com/messages',
    tokenKey: '4e04432ac8f5f37fd91aecce7c3a989de5f46ba847a2157cd527c50c5d83ebaf',
  },
}[process.env.NODE_ENV || DEFAULT_ENV];
