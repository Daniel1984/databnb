const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const admin = require('./routes/admin/admin');
const scraper = require('./routes/scraper/scraper');
const pricePrediction = require('./routes/pricePrediction/pricePrediction');
const subscribe = require('./routes/subscribe/subscribe');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(config.dbUri, { useMongoClient: true })
  .then(() => console.log('SUCCESS'))
  .catch(err => console.log(err));

const app = express();

app.enable('trust proxy');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/admin', admin);
app.use('/1984', scraper);
app.use('/price-prediction', pricePrediction);
app.use('/subscribe', subscribe);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
  // res.render('error');
});

module.exports = app;
