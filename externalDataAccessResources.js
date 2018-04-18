module.exports = function(config) {
	console.log('Instantiating external data access resources: Mongodb');
	var externalDataAccessResources =
		{
			getBuildsMongoDb: function() {
				console.log('Connecting to expedia-Build-stats Mongo @ buildstats db...');
				  var MongoClient = require('mongodb').MongoClient;
				  var buildsMongo = null;
				  
				  MongoClient.connect(config.buildsMongoUrl, function(err, db) {
				      if(err) {
				    	  console.log('COULD NOT CONNECT TO builds MONGO AT '+config.buildsMongoUrl);
				      } else {
				    	  console.log('Successfully connected to builds Mongo at '+config.buildsMongoUrl);
				    	  buildsMongo = db;
				      }
				  });
				return function() {
					return buildsMongo;
				};
			}(),
			getprojectMetricsMongoDb: function() {
				console.log('Connecting to expedia-Build-stats Mongo @ projectMetrics...');
				  var MongoClient = require('mongodb').MongoClient;
				  var projectMetricsMongo = null;
				  
				  MongoClient.connect(config.projectMetricsMongoUrl, function(err, db) {
				      if(err) {
				    	  console.log('COULD NOT CONNECT TO projectMetrics MONGO AT '+config.projectMetricsMongoUrl);
				      } else {
				    	  console.log('Successfully connected to projectMetrics Mongo at '+config.projectMetricsMongoUrl);
				    	  projectMetricsMongo = db;
				      }
				  });
				return function() {
					return projectMetricsMongo;
				};
			}(),
			getglobalBuildStatsMongoDb: function() {
				console.log('Connecting to expedia-Build-stats Mongo @ globalBuildStats...');
				  var MongoClient = require('mongodb').MongoClient;
				  var globalBuildStatsMongo = null;
				  
				  MongoClient.connect(config.globalBuildStatsMongoUrl, function(err, db) {
				      if(err) {
				    	  console.log('COULD NOT CONNECT TO globalBuildStats MONGO AT '+config.globalBuildStatsMongoUrl);
				      } else {
				    	  console.log('Successfully connected to globalBuildStats Mongo at '+config.globalBuildStatsMongoUrl);
				    	  globalBuildStatsMongo = db;
				      }
				  });
				return function() {
					return globalBuildStatsMongo;
				};
			}(),
			getgradleDataMongoDb: function() {
				console.log('Connecting to expedia-Build-stats Mongo @ gradleData...');
				  var MongoClient = require('mongodb').MongoClient;
				  var gradleDataMongo = null;
				  
				  MongoClient.connect(config.gradleDataMongoUrl, function(err, db) {
				      if(err) {
				    	  console.log('COULD NOT CONNECT TO gradleData MONGO AT '+config.gradleDataMongoUrl);
				      } else {
				    	  console.log('Successfully connected to gradleData Mongo at '+config.gradleDataMongoUrl);
				    	  gradleDataMongo = db;
				      }
				  });
				return function() {
					return gradleDataMongo;
				};
			}(),
			getDataFromMongo: function() {
				console.log('Connecting to Pheonix Mongo @ getDataFromMongo...');
				var MongoClient = require('mongodb').MongoClient;
				var getDataFromMongo = null;

				MongoClient.connect(config.getDataFromMongoUrl, function(err, db) {
					if(err) {
						console.log('COULD NOT CONNECT TO getdatafromPheonix MONGO AT '+config.getDataFromMongoUrl);
					} else {
						console.log('Successfully connected to getdatafromPheonix Mongo at '+config.getDataFromMongoUrl);
						getDataFromMongo = db;
					}
				});
				return function() {
					return getDataFromMongo;
				};
			}()
		}
	return externalDataAccessResources;
};