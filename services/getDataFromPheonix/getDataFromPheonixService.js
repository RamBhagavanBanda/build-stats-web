module.exports = function(config,externalDataAccessResources) {

    var service = {
        getDataFromPheonix: function(hotelId,startDate,endDate,cb) {
            var limMongo = externalDataAccessResources.getDataFromMongo();
            var startDate =  new Date(startDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var endDate   =  new Date(endDate.toISOString().split('T')[0] + 'T23:59:59.999Z');
            var collections = ['limrs2','limrs3','limrs4','limrs5','limrs6','limrs7','limrs8','limrs9',
                                'limrs10','limrs11','limrs12','limrs13','limrs14','limrs15','limrs16',
                                'limrs18','limrs19','limrs20','limrs21','limrs22','limrs23'];

                for (var i = 0; i < collections.length; i++) {

                    switch(collections[i]) {
                        case "limrs2":
                        case "limrs3":
                        case "limrs4":
                        case "limrs5":
                        case "limrs9":
                        case "limrs10":
                        case "limrs11":
                        case "limrs12":
                        case "limrs13":
                        case "limrs14":
                        case "limrs18":
                        case "limrs20":
                        case "limrs21":
                        case "limrs22":
                            var query = {SKUGroupID:hotelId};
                            break;
                        case "limrs6":
                            var query = {SKUGroupID:hotelId,ExtraPersonChargeDateStart:{$gt:endDate},ExtraPersonChargeDateEnd:{$lt:startDate}};
                            break;
                        case "limrs7":
                            var query = {SKUGroupID:hotelId,RoomTypeInventoryDate:{$gte:startDate,$lt:endDate}};
                            break;
                        case "limrs8":
                            var query = {SKUGroupID:hotelId,StayDate:{$gte:startDate,$lt:endDate}};
                            break;
                        case "limrs15":
                            var query = {SKUGroupID:hotelId,DateStart:{$gte:startDate,$lt:endDate}};
                            break;
                        case "limrs16":
                            var query = {SKUGroupID:hotelId,StayDateStart:{$gte:startDate,$lt:endDate}};
                            break;
                        case "limrs19":
                            var query = {SKUGroupID:hotelId,DateStart:{$gte:startDate,$lt:endDate}};
                            break;
                        case "limrs23":
                            var query = {SKUGroupID:hotelId,StayDate:{$gte:startDate,$lt:endDate}};
                            break;
                        default:
                            cb('lim partition does not exists');
                    }

                    var docs = [];
                    var collectionsArray = limMongo.collection(collections[i]);
                    var stream = collectionsArray.find(query).stream();

                    stream.on("data", function (item) {
                        docs.push(item);
                    });

                }
                stream.on("end", function () {
                    cb(docs);
                });
        }
    }
    return service;
}
