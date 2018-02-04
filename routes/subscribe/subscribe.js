const express = require('express');
const RateLimit = require('express-rate-limit');
const router = express.Router();
const Subscriber = require('../../models/subscriber');
const sendEmail = require('../../services/mailgun');
const { apiUrl } = require('../../config');

const createSubscriberReqLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  delayAfter: 3, // begin slowing down responses after the first request
  delayMs: 5*1000, // slow down subsequent responses by 3 seconds per request
  max: 6, // start blocking after 5 requests
  message: "Too many subscriptions created from this IP, please try again after an hour"
});

function emailVerificationRequest({ to, url }) {
  sendEmail({
    to,
    subject: 'Please verify your email',
    html: `
      Please verify your email by clicking this link <a href="${url}" target="_blank">${url}</a>
    `,
  });
}

async function handleSubscriber(req, res, next) {
  try {
    const subscriber = await Subscriber.create(req.body);
    const subscribeUrl = `${apiUrl}/confirm-subscriber/${subscriber._id}`;

    emailVerificationRequest({ to: subscriber.email, url: subscribeUrl });

    res.status(200).json({ msg: 'subscriber added' });
  } catch (error) {
    res.status(400).json(error)
  }
}

router.post('/', [createSubscriberReqLimiter, handleSubscriber]);

module.exports = router;
