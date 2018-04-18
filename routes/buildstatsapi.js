'use strict';

var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

var myCollection;
var MongoQS = require('mongo-querystring');	//*testing
var EJSON = require('mongodb-extended-json');

console.log("Before MongoClient connect");
//MongoClient.connect(config.buildsMongoUrl, function(err, db) {

var db = MongoClient.connect( 'mongodb://127.0.0.1:27017/BuildStats', function(err,db) {
	
	//assert.equal(null, err);
	//assert.ok(db != null);
	
	console.log("MongoClient connect");
    if (err)
	    throw err;
	    console.log("connected to the mongo host succesfully!");
	    myCollection = db.collection('builds');
 });

console.log("myCollection:"+myCollection);

	//Get all the build data from the collection
	router.get('/getlist', function(req, res) {
		
		myCollection.find().toArray(function (err, items) {
	    	if (err)
	        	throw err;
	    	res.json(items);
	    });
	});

	//Get the build data based by id
	router.get('/id/:id', function(req, res) {
		var Id = req.params.id;
		console.log('Id : ' + Id);
		myCollection.find({'_id': new RegExp(Id, 'i')}).toArray(function (err, items) { //
			if (err){
				res.send('Id not found Please try with valid Id' + Id);	
			}
			else {
				res.json(items);
			}
	    });
	});

	//post the data to collection

	router.post('/post', function(req, res) {
		myCollection.insert(EJSON.parse(EJSON.stringify(req.body)), function (err, result){
		    	if (err) {
		    		console.log(err);
		    		res.send('Id alreday exists Try posting with new Id' + req.body._id);
		    	}
		    	else
		    		console.log(req.body);
		    		res.send((err == null) ? {msg: req.body} : {msg: 'err'});
		    });
	});	

	// Post the mongo Query to retrive the data
	
	router.post('/query', function(req, res) {
		console.log(req.body);
		if (!(req.body['query'])) {
			res.send('query missing in post data. ' + req.body);
			return;
		}
		var query = EJSON.parse(EJSON.stringify(req.body.query));

		var fields = (req.body['fields'] == undefined) ? {}: EJSON.parse(EJSON.stringify(req.body.fields));
		var sortBy = (req.body['sort'] == undefined) ? {} : EJSON.parse(EJSON.stringify(req.body.sort));

		myCollection.find(query, fields).sort(sortBy).toArray(function (err, items) {

		    	if (err) {
		    	   res.send('data not found for the Query String' + req.body._id);
		    	}
		    	else
		    	   res.json(items);
		    });
	});

	router.post('/aggregate', function(req, res) {
		
		if (!(req.body['group'])) {
			res.send('group missing in post data. ' + req.body);
			return;
		}
		
		var group = EJSON.parse(EJSON.stringify(req.body.group));		
		var match = (req.body['match'] == undefined) ? {} : EJSON.parse(EJSON.stringify(req.body.match));
		var project = (req.body['project'] == undefined) ? {} : EJSON.parse(EJSON.stringify(req.body.project));
		var sort = (req.body['sort'] == undefined) ? {} : EJSON.parse(EJSON.stringify(req.body.sort));		

		var queryJson;
		
		if (!(req.body['project'])){
			queryJson = [{$match : match}, {$group : group}, {$sort : sort}];
		} else {
			queryJson = [{$match : match}, {$group : group}, {$project : project}, {$sort : sort}];
		} 			
		
		console.log(queryJson);
		
		myCollection.aggregate(queryJson , function (err, items) {

		if (err) {			
			console.log("error occured in query " +err);
			res.send('data not found for the Query String' + req.body);
		} else
			res.json(items);
			});
	});
	
	router.post('/distinct', function(req, res) {
		
		console.log("rambanda");
		
		if (!(req.body['field'])) {
			res.send('field missing in post data. ' + req.body);
			return;
		}
		
	
		
		var field = req.body.field;
		
		console.log("field: "+field);
		console.log("query: "+req.body.query);
		
		var findQuery = (req.body['query'] == undefined) ? {} : EJSON.parse(EJSON.stringify(req.body.query));
		
		console.log("findQuery: "+ EJSON.stringify(req.body.query));
		
	

		myCollection.distinct(field, findQuery, function (err, items) {

		    	if (err) {
		    	 
		    		console.log("err: "+err);
		    	   res.send('data not found for the Query String' + req.body._id);
		    	   
		    	}
		    	else
{
			    	console.log("items: "+items);
		    	   res.json(items); }
		    	
		    });
	});

module.exports = router;