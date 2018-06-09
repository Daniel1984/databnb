require('dotenv').config();

module.exports = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: process.env.DB_URL,

    // TODO Change this to your database name:
    databaseName: process.env.DB_NAME,

    // uncomment and edit to specify Mongo client connect options (eg. increase the timeouts)
    // see https://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html
    //
    // options: {
    //   // connectTimeoutMS: 3600000, // 1 hour
    //   // socketTimeoutMS: 3600000, // 1 hour
    //   authSource: 'metabnb',
    //   auth: {
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PASS,
    //   },
    // },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog',
};
