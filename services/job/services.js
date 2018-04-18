module.exports = function(config,externalDataAccessResources) {
  
  var services = function () {
	  return {
		  jobService            		:	require('./jobService')(config,externalDataAccessResources),
		  jobAggregationService 		:	require('./jobAggregationService')(config,externalDataAccessResources)
	  }
  }();
  return services;
}