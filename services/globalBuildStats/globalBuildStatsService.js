module.exports = function(config,externalDataAccessResources) {
  
  var service = { 
		  getglobalBuildStatsList: function(cb) {
			  var globalBuildStatsMongo = externalDataAccessResources.getglobalBuildStatsMongoDb();
			  var globalBuildStatsCollection = globalBuildStatsMongo.collection(config.globalBuildStatsCollection);
			  if (globalBuildStatsCollection) {
				  globalBuildStatsCollection.find().toArray(function(err, items) {
					  if (err){
						  cb({error:err})  
					  } 
					  else{
						  cb(items);
						  }
				  });
				  
			  } else {
				  console.log('Error connecting to BrontoLogics global build stats Mongo collection: '+config.globalBuildStatsCollection);
			  }
		  },
		  PostDocuments: function(body,cb){
			  var globalBuildStatsMongo = externalDataAccessResources.getglobalBuildStatsMongoDb();
			  var globalBuildStatsCollection = globalBuildStatsMongo.collection(config.globalBuildStatsCollection);
			  var EJSON = require('mongodb-extended-json');
			  var MongoQS = require('mongo-querystring');
			  var queryString = EJSON.parse(EJSON.stringify(body));			//Query String
			  if (globalBuildStatsCollection) {
				  globalBuildStatsCollection.insert(queryString,function(err, result) {
					  if (err){
						  console.log(err);
						  cb({error:err}); 
					  } 
					  else{
						  console.log(body);
						  cb((err == null) ? {msg: body} : {msg: 'err'});
					}
				  });
				  
			  } else {
				  console.log('Error connecting to expedia global build Stats Mongo collection: '+config.globalBuildStatsCollection);
			  }
			  
		  }
	}
  return service;
}
