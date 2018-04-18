module.exports = function(config,globalBuildStatsServices) {
  var express = require('express');
  var router = express.Router();
  
  //Post globalBuildStatss to Mongodb
  router.post('/post', function(req, res) {
	  var body = req.body;
	  globalBuildStatsServices.globalBuildStatsService.PostDocuments(body,function(data){
		  res.send(data);
	  })
  });
  
  //Get list of all globalBuildStatss from Mongodb
  router.get('/getlist', function(req, res) {
	  globalBuildStatsServices.globalBuildStatsService.getglobalBuildStatsList(function(data){
		  res.send(data);   
	  })
  });

  
  return router;
}
