const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Auth Libraries
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoDBStore = require('connect-mongo')(session);

const index = require('./routes/index');
const users = require('./routes/users');

const User = require('./models/user');

const dbUri = 'mongodb://scope:scope@ds064799.mlab.com:64799/scope-lesson-4';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(dbUri);

// Create and link our session store
const store = new MongoDBStore({
  mongooseConnection: mongoose.connection
});

app.use(session({
  secret: 'keyboard cat',
  store: store,
  cookie: { maxAge: 2147483647 },
  resave: false,
  saveUninitialized: false
}));

// Passport configuration
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if(err) {
      return done(err);
    }

    done(null, user);
  });
});

passport.use('local', new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }

      // User doesn't exist
      if (!user) {
        return done(null, false, { message: 'No User Found!' });
      }

      // Password doesn't match
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Password does not match!' });
      }

      return done(null, user);
    });
  }
));

app.use(passport.initialize());
app.use(passport.session());

// Configure our routes
app.use('/', index);
app.use('/api/users', users);

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
  res.render('error');
});

module.exports = app;
