module.exports = function(config,externalDataAccessResources) {
  
  var services = function () {
	  return {
		  projectMetricsService            		:	require('./projectMetricsService')(config,externalDataAccessResources)
	  }
  }();
  return services;
}