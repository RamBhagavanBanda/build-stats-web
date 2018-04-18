module.exports = function(config,externalDataAccessResources) {
  
  var service = { 
		  
		  getByStageName: function(pipelineName,relationshipKey,ciJobBuildId,stageName,cb){
			  var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
			  var buildsCollection = buildsMongo.collection(config.buildsCollection);

			  var queryString = {'pipelineName': pipelineName,
		 						 'relationshipKey': relationshipKey,
		 						 'ciJobBuildId': ciJobBuildId,
		 						 'stageNam': stageName}
			  
			  if (buildsCollection) {
				  buildsCollection.find(queryString).toArray(function(err, items) {
					  if (err){
						  cb({error:err});  
					  } 
					  else{
						  cb(items);
					}
				  });
				  
			  } else {
				  console.log('Error connecting to BrontoLogics build stats Mongo collection: '+config.buildsCollection);
			  }
			  
		  }
	}
  return service;
}
