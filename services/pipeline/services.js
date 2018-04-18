module.exports = function(config,externalDataAccessResources) {
  
  var services = function () {
	  return {
		  pipelineService            		:	require('./pipelineService')(config,externalDataAccessResources),
		  pipelineAggregateService 			:	require('./pipelineAggregationService')(config,externalDataAccessResources)
	  }
  }();
  return services;
}