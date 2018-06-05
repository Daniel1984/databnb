module.exports = {
  up: async (db, next) => {
    const listings = await db.collection('listings').find().toArray();

    while (listings.length) {
      const listing = listings.shift();
      await db.collection('listings').findOneAndUpdate(
        { id: listing.id },
        {
          $set: {
            geo: {
              type: [listing.lat, listing.lng],
              index: '2d',
            },
          },
          $unset: { lat: 1, lng: 1 },
        }
      );
    }
    next();
  },

  down: async (db, next) => {
    const listings = await db.collection('listings').find().toArray();

    while (listings.length) {
      const listing = listings.shift();
      await db.collection('listings').findOneAndUpdate(
        { id: listing.id },
        {
          $set: { lat: listing.geo.type[0], lng: listing.geo.type[1] },
          $unset: { geo: 1 },
        }
      );
    }
    next();
  },
};
