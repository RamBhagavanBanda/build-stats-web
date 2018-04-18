module.exports = function(config,getDataFromPheonixServices) {
    var express = require('express');
    var router = express.Router();

    router.get('/skuGroupId=:hotelId/startDate=:startDate/endDate=:endDate', function(req, res) {
        var hotelId = req.params.hotelId;
        var startDate = new Date(req.params.startDate);
        var endDate = new Date(req.params.endDate);
        getDataFromPheonixServices.getDataFromPheonixService.getDataFromPheonix(hotelId,startDate,endDate,function(data){
            res.send(data);
        })
    });
    return router;
}
