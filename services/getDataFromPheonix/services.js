module.exports = function(config,externalDataAccessResources) {

    var services = function () {
        return {
            getDataFromPheonixService         :	require('./getDataFromPheonixService')(config,externalDataAccessResources)
        }
    }();
    return services;
}
