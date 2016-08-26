var app = require('../app')
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

//Hyperledger-SDK configuration for managing user profiles
var profiles = require('../utils/profiles');

var hlc = require('hfc');


// Cloudant connection
var new_creds = {
  host: 'fdc45491-fa13-4064-a77d-d433ae04a9ec-bluemix.cloudant.com',
  port: "443",
  username: 'itedifergaideredisseckst', //Key
  password: '336c044aff82222a34828992bdbc830ff5a6bc5e',//API password
};

var nano = require('nano')('https://' + new_creds.username + ':' + new_creds.password + '@' + new_creds.host + ':' + new_creds.port);	//lets use api key to make the docs
var db = nano.use("users");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'ChainChat' });
});

//POST login page
router.post("/login", function (req, res) {
  var log_err = null;
  username = req.body.username;
  password = req.body.password;

  //Check username and password
  if (username == '') {
    console.log("Username was null");
    res.render('index', { error1: 'Please input a username' });
  } else if (password == '') {
    console.log("Empty password field");
    res.render('index', { error1: 'Password field cannot be empty!' });
  } else {
    console.log('Proper login input');

    //From profiles.js
    profiles.loginProfile(username, password, function (loginOk, fromCA, dataforUser, userExists, app) {
      if (!userExists) {
        console.log(userExists);
        console.log("User does not exist!");
        log_err = 'Invalid Login!';
      }
      if (loginOk) {
        var usrJSON = {
          id: dataforUser.username,
          username: dataforUser.username,
          color: dataforUser.customProperties.profileColor
        }
        console.log(usrJSON.id + " has logged in successfully");
        var token = jwt.sign(usrJSON, req.app.get('jwtSecret'), { expiresIn: 60 * 5 });
        res.render('main', { title: 'ChainChat', token: token });
      } else {
        console.log("User password was invalid");
        res.render('index', { error1: "Invalid login" });
      }
    });

    var token = jwt.sign
  }
});

module.exports = router;

// POST the register page
router.post('/register', function (req, res, next) {
  username = req.body.username;
  password = req.body.password;
  passcheck = req.body.passwordCheck;
  var color = '#' + req.body.color2;
  if (username.length > 11) {
    username = username.slice(0, 11);
  }

  //check username and password
  if (username == '') {
    console.log("Username was null");
    res.render('register', { error1: 'Please input a username' });
  } else if (password == '' && passcheck == '') {
    console.log("Empty password fields");
    res.render('register', { error1: 'Password field cannot be empty!' });
  } else if (password != passcheck) {
    console.log('password mismatch');
    res.render('register', { error1: 'Passwords do not match!' });
  } else {
    console.log('password match');

    profiles.registerProfileWithPass(username, password, "group1", "00001", [], [], [], { profileColor: color }, function (profileUsername, profilePassword, profileKeys, userExists) {
      console.log(profileUsername);
      console.log(profilePassword);
      req.app.addUserToChain(profileUsername, profileUsername, profileUsername, 'Room1', '');
      if (!userExists) {
        console.log(profileKeys.public);
        console.log(profileKeys.private);
        res.redirect('/');
      } else {
        res.render('register', { error1: 'User already exists' });
      }
    });
    
  }
});

//Redirects to the login page
router.get('/logout', function (req, res, next) {
  res.redirect('/');
});

router.get('/register', function (req, res, next) {
  res.render('register', { title: 'ChainChat' });
});

