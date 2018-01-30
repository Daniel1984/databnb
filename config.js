const DEFAULT_ENV = 'local';

module.exports = {
  local: {
    dbUri: 'mongodb://localhost/metabnb-local',
  },
  production: {
    dbUri: 'mongodb://daniel:DSvr!l4ezv@94.130.183.7:27017/metabnb',
  },
}[process.env.NODE_ENV || DEFAULT_ENV];
