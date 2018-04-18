module.exports = function(config, pipelineServices) {
    var express = require('express');
    var router = express.Router();

    router.get('/:pipelineName/:relationshipKey/:ciJobBuildId/:stageName/pipelineByStage', function(req, res) {

        var pipelineName = req.params.pipelineName;
        var relationshipKey = req.params.relationshipKey;
        var ciJobBuildId = req.params.ciJobBuildId;
        var stageName = req.params.stageName;

        pipelineServices.pipelineService.getByStageName(pipelineName, relationshipKey, ciJobBuildId, stageName,
                function(data) {
                    res.send(data);
                })
    });

    router.get('/:buildStartTime/:buildEndTime/:pipelineName/pipelineaggregate', function(req, res) {

        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var pipelineName = req.params.pipelineName;

        pipelineServices.pipelineAggregateService.getAggregateByPipelinename(buildStartTime, buildEndTime,
                pipelineName, function(data) {
                    res.send(data);
                })
    });

    router.get('/:buildStartTime/:buildEndTime/:pipelineName/:cutoffJob/pipelinemap', function(req, res) {

        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var pipelineName = req.params.pipelineName;
        var cutoffJob = req.params.cutoffJob;

        pipelineServices.pipelineAggregateService.getMapreduceByPipelinename(buildStartTime, buildEndTime,
                pipelineName, cutoffJob, function(data) {
                    res.send(data);
                })
    });

    router.get('/:buildStartTime/:buildEndTime/:startJobName/:endJobName/totaltime', function(req, res) {

        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var startJobName = req.params.startJobName;
        var endJobName = req.params.endJobName;

        pipelineServices.pipelineAggregateService.getMapreduceBytotalTests(buildStartTime, buildEndTime, startJobName,
                endJobName, function(data) {
                    res.send(data);
                })
    });

    router.get('/:buildStartTime/:buildEndTime/:pipelineName/durationsbystage', function(req, res) {

        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var pipelineName = req.params.pipelineName;

        pipelineServices.pipelineAggregateService.getDurationsByStage(buildStartTime, buildEndTime, pipelineName,
                function(data) {
                    res.send(data);
                })
    });

    router.get('/:buildStartTime/:buildEndTime/:pipelineName/all', function(req, res) {

        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var pipelineName = req.params.pipelineName;

        pipelineServices.pipelineAggregateService.getAll(buildStartTime, buildEndTime, pipelineName, function(data) {
            res.send(data);
        })
    });

    router.get('/:buildStartTime/:buildEndTime/:pipelineName/allFailures', function(req, res) {

        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var pipelineName = req.params.pipelineName;

        pipelineServices.pipelineAggregateService.getAllFailureCategory(buildStartTime, buildEndTime, pipelineName,
                function(data) {
                    res.send(data);
                })
    });

    router.get('/:buildStartTime/:buildEndTime/:pipelineName/allAggregatedFailures', function(req, res) {

        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var pipelineName = req.params.pipelineName;

        pipelineServices.pipelineAggregateService.getMapReduceFailureCategory(buildStartTime, buildEndTime,
                pipelineName, function(data) {
                    res.send(data);
                })
    });

    return router;
}
