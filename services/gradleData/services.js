module.exports = function(config,externalDataAccessResources) {
  
  var services = function () {
	  return {
		  gradleDataService            		:	require('./gradleDataService')(config,externalDataAccessResources)
	  }
  }();
  return services;
}