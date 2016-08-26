var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main', { title: 'ChainChat' });

});

router.post('/', function(req, res, next) {
  var validPass = true;
  var user = req.body;
  var people = {};
});

module.exports = router;
