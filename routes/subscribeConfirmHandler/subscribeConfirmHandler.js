const express = require('express');
const router = express.Router();
const Subscriber = require('../../models/subscriber');

router.get('/', (req, res) => {
  res.status(404).send('Malformed url, please try again later');
});

router.get('/:subscriber_id', async (req, res) => {
  const { subscriber_id } = req.params;

  try {
    await Subscriber.findByIdAndUpdate(subscriber_id, { confirmed: true });
    res.status(200).send('Thank you for subscribing to Metabnb newsletter.');
  } catch (error) {
    res.status(404).send('Malformed url, please try again later');
  }
});

module.exports = router;
