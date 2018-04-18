module.exports = function(config) {
  var express = require('express');
  var router = express.Router();
  
  /* GET home page. */
  router.get('/', function(req, res) {
    res.render('index', { title: 'BrontoLogics Build Stats Information Page', name: config.name });
  });
  
  return router;
}
