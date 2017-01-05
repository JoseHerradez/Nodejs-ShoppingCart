// set up ======================================================================
// get all the tools we need
var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var passport = require("passport");
var flash = require("connect-flash");

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var expressHbs = require('express-handlebars');

var validator = require("express-validator");
var MongoStore = require("connect-mongo")(session);

var index = require('./routes/index');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var user = require("./config/roles");

// configuration ===============================================================
mongoose.connect('localhost:27017/shopping');

require("./config/passport");

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// set up our express application
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());

// required for passport
app.use(session({
  secret: 'mysupersecret', 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(user.middleware());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.admin = (res.locals.login ? req.user.roles[0] === "admin" : false);
  next();
});

// routes ======================================================================
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// launch ======================================================================
module.exports = app;
