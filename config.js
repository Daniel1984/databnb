const DEFAULT_ENV = 'local';

module.exports = {
  local: {
    dbUri: 'mongodb://localhost/metabnb2',
  },
  production: {
    dbUri: 'mongodb://daniel:DSvr!l4ezv@159.89.11.146:27017/metabnb',
  },
}[process.env.NODE_ENV || DEFAULT_ENV];
