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
              type: 'Point',
              coordinates: [listing.lat, listing.lng],
            },
          },
        }
      );
    }
    await db.collection('listings').createIndex({ geo: '2dsphere' });
    next();
  },

  down: async (db, next) => {
    const listings = await db.collection('listings').find().toArray();

    while (listings.length) {
      const listing = listings.shift();
      await db.collection('listings').findOneAndUpdate(
        { id: listing.id },
        {
          $unset: { geo: 1 },
        }
      );
    }
    await db.collection('listings').dropIndex({ geo: '2dsphere' });
    next();
  },
};
