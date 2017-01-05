var express = require('express');
var router = express.Router();

var Product = require("../models/product");
var user = require("../config/roles");

router.get('/panel', isLoggedIn, user.is('admin'), function(req, res, next) {
  var errMsgs = req.flash('error');
  res.render('admin/panel', {errMsgs: errMsgs, noError: errMsgs.length > 0});
});

router.post('/add-product', isLoggedIn, user.is('admin'), function(req, res, next) {
  req.checkBody('title', 'Title cannot be empty.').notEmpty();
  req.checkBody('description', 'Description cannot be empty.').notEmpty();
  req.checkBody('imagePath', 'You must provide an IMG to the product.').notEmpty();
  req.checkBody('price', 'You must put a price on the product.').notEmpty();
  
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function(error) {
      messages.push(error.msg);
    });
    req.flash('error', messages);
    return res.redirect('/admin/panel');
  }
  
  // find a product whose title is the same as the forms title
  // we are checking to see if the product already exists
  Product.findOne({'title': req.body.title}, function(err, product) {
    // if there are any errors, return the error
    if (err) {
      req.flash('error', [err.message]);
      return res.redirect('/admin/panel');
    }
    
    // check to see if theres already a product with that title
    if (product) {
      req.flash('error', ['This product is already added.']);
      return res.redirect('/admin/panel');
    }
    
    // if there is no product with that title create the product
    var newProduct = new Product();
    
    // set the product's properties
    newProduct.title = req.body.title;
    newProduct.description = req.body.description;
    newProduct.imagePath = req.body.imagePath;
    newProduct.price = req.body.price;

    // save the product
    newProduct.save(function(err, result) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/panel');
      }
      
      return res.redirect('/');
    });
  });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated()) return next();
  
  // if they aren't redirect them to the home page
  res.redirect('/');
}