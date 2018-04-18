module.exports = function (config, gradleDataServices) {
    var express = require('express');
    var router = express.Router();

    //Post gradleDatas to Mongodb
    router.post('/post', function (req, res) {
        var body = req.body;
        gradleDataServices.gradleDataService.PostDocuments(body, function (data) {
            res.send(data);
        })
    });

    //Get list of all gradleDatas from Mongodb
    router.get('/getlist', function (req, res) {
        gradleDataServices.gradleDataService.getgradleDataList(function (data) {
            res.send(data);
        })
    });

    //Get average build duration for the given interval
    router.get('/:buildStartTime/:buildEndTime/:invokedTargets/averageBuildTime', function (req, res) {

        var buildStartTime = new Date(req.params.buildStartTime);
        var buildEndTime = new Date(req.params.buildEndTime);
        var invokedTargets = req.params.invokedTargets;

        gradleDataServices.gradleDataService.averageBuildTime(buildStartTime, buildEndTime, invokedTargets, function (data) {
            res.send(data);
        })
    });

    return router;
}