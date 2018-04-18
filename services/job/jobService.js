module.exports = function(config,externalDataAccessResources) {
  
  var service = { 
		  getBuildsList: function(cb) {
			  var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
			  var buildsCollection = buildsMongo.collection(config.buildsCollection);
			  if (buildsCollection) {
				  buildsCollection.find().toArray(function(err, items) {
					  if (err){
						  cb({error:err})  
					  } 
					  else{
						  cb(items);
						  }
				  });
				  
			  } else {
				  console.log('Error connecting to BrontoLogics build stats Mongo collection: '+config.buildsCollection);
			  }
		  },
		  getBuildsById: function(Id,cb){
			  var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
			  var buildsCollection = buildsMongo.collection(config.buildsCollection);
			  var queryString = {'_id': new RegExp(Id, 'i')};			//Query String
			  if (buildsCollection) {
				  buildsCollection.find(queryString).toArray(function(err, items) {
					  if (err){
						  cb({error:err});  
					  } 
					  else{
						  cb(items);}
				  });
				  
			  } else {
				  console.log('Error connecting to BrontoLogics build stats Mongo collection: '+config.buildsCollection);
			  }
		  },
		  PostDocuments: function(body,cb){
			  var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
			  var buildsCollection = buildsMongo.collection(config.buildsCollection);
			  var EJSON = require('mongodb-extended-json');
			  var MongoQS = require('mongo-querystring');
			  var queryString = EJSON.parse(EJSON.stringify(body));			//Query String
			  if (buildsCollection) {
				  buildsCollection.insert(queryString,function(err, result) {
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
				  console.log('Error connecting to BrontoLogics build stats Mongo collection: '+config.buildsCollection);
			  }
			  
		  },
		  getByDistinctQuery: function(field,pipelineName,cb){
			  var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
			  var buildsCollection = buildsMongo.collection(config.buildsCollection);
			  
			  if (pipelineName == 'null'){
				  Query = null;
			  }
			  else{
				  Query = {pipelineName:pipelineName};
			  }
			  
			  console.log(Query);
			  
			  if (buildsCollection) {
				  buildsCollection.distinct(field,Query,function(err, result) {
					  if (err){
						  cb({error:err});  
					  } 
					  else{
						  cb(result);
					}
				  });
				  
			  } else {
				  console.log('Error connecting to BrontoLogics build stats Mongo collection: '+config.buildsCollection);
			  }
			  
		  },
		  getBuildOverBuild: function(buildStartTime,buildEndTime,JobName,cb) {
			  var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
			  var buildsCollection = buildsMongo.collection(config.buildsCollection);
			  buildStartTime	=  new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
			  buildEndTime		=  new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');
			  
			  queryString		= {buildStarttime:{$gte:buildStartTime,$lt:buildEndTime},			//Query String
		    		   		 		jobName:JobName}
			  
			  if (buildsCollection){
				  buildsCollection.find(queryString).toArray(function(err,items){
			    			   if (err){
			    				   cb({error:err});
			    				   console.log(err);
			    			   }
			    			   else
			    				   cb(items);
			    		   });
			  		 }
			  else {
				  	console.log('Error connecting to BrontoLogics build stats Mongo collection: '+config.buildsCollection);
				  	cb({error:err});
			  	  }
		  }
	}
  return service;
}
