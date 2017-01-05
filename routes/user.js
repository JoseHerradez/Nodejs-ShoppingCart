var express = require('express');
var router = express.Router();
var csrf = require("csurf");
var passport = require("passport");

var Cart = require("../models/cart");
var Orders = require("../models/order");
var user = require("../config/roles");

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next) {
  Orders.find({user: req.user}, function(err, orders) {
    if (err) return res.write('Error');
    
    var cart;
    orders.forEach(function(order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('user/profile', {orders: orders});
  });
});

router.get('/logout', isLoggedIn, function(req, res, next) {
  req.logout();
  res.redirect('/');
});

// This apply for every route below, just make sure these routes are only
// available if the user is not logged in
router.use('/', user.is('not logged'), function (req, res, next) {
  next();
});


// =====================================
// LOCAL ROUTES ========================
// =====================================
router.get('/signup', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup', 
  failureFlash: true
}), function(req, res, next) {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }
});

router.get('/signin', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin', 
  failureFlash: true
}), function(req, res, next) {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }
});

// =====================================
// FACEBOOK ROUTES =====================
// =====================================
// route for facebook authentication and login
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect : '/user/profile',
  failureRedirect : '/',
  failureFlash: true
}));

module.exports = router;

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated()) return next();
  
  // if they aren't redirect them to the home page
  res.redirect('/');
}