module.exports = function(config,externalDataAccessResources) {
  
  var service = { 
		  getprojectMetricsList: function(cb) {
			  var projectMetricsMongo = externalDataAccessResources.getprojectMetricsMongoDb();
			  var projectMetricsCollection = projectMetricsMongo.collection(config.projectMetricsCollection);
			  if (projectMetricsCollection) {
				  projectMetricsCollection.find().toArray(function(err, items) {
					  if (err){
						  cb({error:err})  
					  } 
					  else{
						  cb(items);
						  }
				  });
				  
			  } else {
				  console.log('Error connecting to BrontoLogics build stats Mongo collection: '+config.projectMetricsCollection);
			  }
		  },
		  PostDocuments: function(body,cb){
			  var projectMetricsMongo = externalDataAccessResources.getprojectMetricsMongoDb();
			  var projectMetricsCollection = projectMetricsMongo.collection(config.projectMetricsCollection);
			  var EJSON = require('mongodb-extended-json');
			  var MongoQS = require('mongo-querystring');
			  var queryString = EJSON.parse(EJSON.stringify(body));			//Query String
			  if (projectMetricsCollection) {
				  projectMetricsCollection.insert(queryString,function(err, result) {
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
				  console.log('Error connecting to BrontoLogics build stats Mongo collection: '+config.projectMetricsCollection);
			  }
			  
		  }
	}
  return service;
}
