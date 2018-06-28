const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const bugsnag = require('bugsnag');
const pricePrediction = require('./routes/pricePrediction/pricePrediction');
const subscribe = require('./routes/subscribe/subscribe');
const subscribeConfirmHandler = require('./routes/subscribeConfirmHandler/subscribeConfirmHandler');
const registerConfirmHandler = require('./routes/registerConfirmHandler/registerConfirmHandler');
const registrationHandler = require('./routes/registrationHandler/registrationHandler');
const loginHandler = require('./routes/loginHandler/loginHandler');
const meHandler = require('./routes/meHandler/meHandler');
const deactivateUserHandler = require('./routes/deactivateUserHandler/deactivateUserHandler');
const requestPasswordResetHandler = require('./routes/requestPasswordResetHandler/requestPasswordResetHandler');
const changePasswordHandler = require('./routes/changePasswordHandler/changePasswordHandler');
const airbnbPropertyHandler = require('./routes/airbnbPropertyHandler/airbnbPropertyHandler');

require('dotenv').config();

bugsnag.register('6ecefaae2b572d031cc92c700088245a');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.DB_URI)
  .then(() => console.log('SUCCESS'))
  .catch(err => console.log(err));

const app = express();

app.enable('trust proxy');
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/register', registrationHandler);
app.use('/login', loginHandler);
app.use('/me', meHandler);
app.use('/price-prediction', pricePrediction);
app.use('/subscribe', subscribe);
app.use('/confirm-subscriber', subscribeConfirmHandler);
app.use('/confirm-user', registerConfirmHandler);
app.use('/request-password-reset', requestPasswordResetHandler);
app.use('/change-password', changePasswordHandler);
app.use('/deactivate-account', deactivateUserHandler);
app.use('/properties', airbnbPropertyHandler);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
  // res.render('error');
});

module.exports = app;
