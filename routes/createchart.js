
module.exports = function(config) {
  var express = require('express');
  var router = express.Router();
  
router.get('/', function(req, res) {	
	   
	    var jobName = req.query.jobName;		
	    var chartType = req.query.chartType;
	    var startDate = req.query.startDate;
	    var endDate = req.query.endDate;
	    var durationType = req.query.durationType;
	    var qJobName = req.query.qJobName;
	    var range = req.query.range;
	    
	    // send params to view index.jade   
	    var params = {
	    	jobName: req.query.jobName,
	    	chartType: req.query.chartType, 
	    	startDate: req.query.startDate, 
	    	endDate: req.query.endDate, 
	    	durationType: req.query.durationType,
	    	qJobName: req.query.qJobName,
	    	range: req.query.range,
	    	
	        };
	    res.render('createchart', { title: 'createchart', params: params, createchart: true});  
	  });

return router;
}; 	