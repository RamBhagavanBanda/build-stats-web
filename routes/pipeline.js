module.exports = function(config) {
  var express = require('express');
  var router = express.Router();
  
  /* GET home page. */
  router.get('/:pipeline', function(req, res) {	
	console.log(req.params.pipeline);
    res.render('pipeline', { title: 'Pipeline', pipelineName: req.params.pipeline });
  });
  
  return router;
};