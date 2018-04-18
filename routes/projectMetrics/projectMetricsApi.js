module.exports = function(config,projectMetricsServices) {
  var express = require('express');
  var router = express.Router();
  
  //Post projectMetricss to Mongodb
  router.post('/post', function(req, res) {
	  var body = req.body;
	  projectMetricsServices.projectMetricsService.PostDocuments(body,function(data){
		  res.send(data);
	  })
  });
  
  //Get list of all projectMetricss from Mongodb
  router.get('/getlist', function(req, res) {
	  projectMetricsServices.projectMetricsService.getprojectMetricsList(function(data){
		  res.send(data);   
	  })
  });

  
  return router;
}
