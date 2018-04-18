'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 9090,
	accessLog: {
		fileSize: '1m',
		keep: 10,
		compress: true
	},
	buildsMongoUrl				: 'mongodb://127.0.0.1:27017/BuildStats', //test
	buildsCollection			:	'builds',	
	projectMetricsMongoUrl		: 'mongodb://127.0.0.1:27017/BuildStats',
	projectMetricsCollection	:	'builds',
	globalBuildStatsMongoUrl	: 'mongodb://127.0.0.1:27017/BuildStats',
	globalBuildStatsCollection	:	'builds',
	gradleDataMongoUrl			: 'mongodb://127.0.0.1:27017/BuildStats',
	gradleDataCollection		:	'builds',
	getDataFromMongoUrl			: 'mongodb://127.0.0.1:27017/BuildStats',
	getDataFromMongoUrlCollection	:	'builds'
	
	/*projectMetricsMongoUrl		: 'mongodb://10.2.13.12:27017/ProjectMetrics', //test
	projectMetricsCollection	:	'ProjectMetrics',
	globalBuildStatsMongoUrl	: 'mongodb://10.2.13.12:27017/GlobalBuildStats', //test
	globalBuildStatsCollection	:	'globalBuilds',
	gradleDataMongoUrl			: 'mongodb://10.2.13.12:27017/gradleData', //test
	gradleDataCollection		:	'gradleData',
	getDataFromMongoUrl			: 'mongodb://phelmondbaa004.karmalab.net:27061/LodgingInventory', //test
	getDataFromMongoUrlCollection	:	'limrs16'*/

};

