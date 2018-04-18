module.exports = function(config,externalDataAccessResources) {
  
  var services = function () {
	  return {
		  globalBuildStatsService            		:	require('./globalBuildStatsService')(config,externalDataAccessResources)
	  }
  }();
  return services;
}