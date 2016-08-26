var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var users = req.app.get('users');
  var pplArray = [];
  for( var i in users) {
    pplArray.push(i);
  }
  res.send(pplArray);

});
module.exports = router;
