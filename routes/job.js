module.exports = function(config) {
  var express = require('express');
  var router = express.Router();
  
  /* GET home page. */
  router.get('/:job', function(req, res) {	
	console.log(req.params.job);
    res.render('job', { title: 'Job', jobName: req.params.job });
  });
  
  return router;
};