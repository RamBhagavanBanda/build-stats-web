module.exports = function(config,externalDataAccessResources) {
  
  var service = { 
		  getgradleDataList: function(cb) {
			  var gradleDataMongo = externalDataAccessResources.getgradleDataMongoDb();
			  var gradleDataCollection = gradleDataMongo.collection(config.gradleDataCollection);
			  if (gradleDataCollection) {
				  gradleDataCollection.find().toArray(function(err, items) {
					  if (err){
						  cb({error:err})  
					  } 
					  else{
						  cb(items);
						  }
				  });

			  } else {
				  console.log('Error connecting to BrontoLogics gradleData Mongo collection: '+config.gradleDataCollection);
			  }
		  },
		  PostDocuments: function(body,cb){
			  var gradleDataMongo = externalDataAccessResources.getgradleDataMongoDb();
			  var gradleDataCollection = gradleDataMongo.collection(config.gradleDataCollection);
			  var EJSON = require('mongodb-extended-json');
			  var MongoQS = require('mongo-querystring');
			  var queryString = EJSON.parse(EJSON.stringify(body));			//Query String
			  if (gradleDataCollection) {
				  gradleDataCollection.insert(queryString,function(err, result) {
					  if (err){
						  cb({error:err});  
					  } 
					  else{
						  cb((err == null) ? {msg: body} : {msg: 'err'});
					}
				  });

			  } else {
				  console.log('Error connecting to expedia gradleData Mongo collection: '+config.gradleDataCollection);
			  }

          },
          averageBuildTime: function (buildStartTime, buildEndTime, invokedTargetsString, cb) {
              var gradleDataMongo = externalDataAccessResources.getgradleDataMongoDb();
              var gradleDataCollection = gradleDataMongo.collection(config.gradleDataCollection);

              var buildstartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
              var buildendTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');
              if (invokedTargetsString == 1) {
                  invokedTargetsString = "gradlew build -x check";
              }

              var matchString = {
                  $match: {
                      date: {$gte: buildStartTime, $lt: buildEndTime},
                      invokedTargets: invokedTargetsString
                  }
              };
              var groupString = {
                  $group: {
                      _id: null,
                      avg_duration: { "$avg": "$buildSeconds" },
                      count: { $sum: 1 }
                  }
              };

              if (gradleDataCollection) {
                  gradleDataCollection.aggregate([matchString, groupString], function (err, items) {
                      if (err) {
                          console.log('gradleData AGGREGATION QUERY FAILED TO GET THE INFORMATION FROM MONGODB' + err);
                          cb({error: err});
                      }
                      else
                          cb(items);
                  })
              } else {
                  console.log('Error connecting to expedia build stats Mongo collection: ' + config.gradleDataCollection);
              }
          }
  }
  return service;
}