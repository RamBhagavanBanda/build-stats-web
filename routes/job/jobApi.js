module.exports = function(config, jobServices) {
    var express = require('express');
    var router = express.Router();

    // Get list of all jobs from Mongodb
    router.get('/getlist', function(req, res) {
        jobServices.jobService.getBuildsList(function(data) {
            res.send(data);
        })
    });

    // Get list by ID from Mongodb
    router.get('/:id/id', function(req, res) {
        var Id = req.params.id;

        jobServices.jobService.getBuildsById(Id, function(data) {
            res.send(data);
        })
    });

    // Post jobs to Mongodb
    router.post('/post', function(req, res) {
        var body = req.body;
        jobServices.jobService.PostDocuments(body, function(data) {
            res.send(data);
        })
    });

    // Get distinct records by field name
    router.get('/:field/:pipelineName/distinct', function(req, res) {

        var field = req.params.field;
        var pipelineName = req.params.pipelineName;

        jobServices.jobService.getByDistinctQuery(field, pipelineName, function(data) {
            res.send(data);
        })
    })

    // Build over Build Metrics based on JobID
    router.get('/:buildStartTime/:buildEndTime/:JobName/bob', function(req, res) {
        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var JobName = req.params.JobName;

        jobServices.jobService.getBuildOverBuild(buildStartTime, buildEndTime, JobName, function(data) {
            res.send(data);
        })
    });
    http: // buildstats.tools.expedia.com/buildstats/bvjhgfjh/id

    // Aggregate Metrics based on job
    router.get('/:buildStartTime/:buildEndTime/:JobName/:aggregateType/jobaggregate', function(req, res) {
        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var JobName = req.params.JobName;
        var aggregateType = req.params.aggregateType;

        jobServices.jobAggregationService.getAggregateByWeek(buildStartTime, buildEndTime, JobName, aggregateType,
                function(data) {
                    res.send(data);
                })
    });

    // Aggregate failure categories based on job
    router.get('/:buildStartTime/:buildEndTime/:JobName/allAggregatedFailures', function(req, res) {

        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var JobName = req.params.JobName;

        jobServices.jobAggregationService.getMapReduceFailureCategory(buildStartTime, buildEndTime, JobName, 
                function(data) {
                    res.send(data);
                })
    });

    return router;
}
