var debug = require('debug')('routes-lpas');
var express = require('express');
var router = express.Router();

//router.get('/', function(req, res) {
//  debug('LPAS')
//  res.setHeader('cache-control', 'no-cache')
//  res.status(200).send('ACTIVE')
//});


/* GET LPAS landing page */
router.get('/', function(req, res) {
  res.render('lpas', { title: 'BrontoLogics Build Stats Information Page for LPAS', name: "LPAS" });
});


module.exports = router;
