var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fs = require('fs')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cacheResponseDirective = require('express-cache-response-directive');
var stream = require('logrotate-stream');

var app = express();

//load config
var config = require('./config/config')

//set port
app.set('port', config.port)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

//set access logs
try {
    fs.mkdirSync(__dirname + '/logs/');
}
catch (ex) {
    if (ex.code != 'EEXIST') {
        throw ex;
    }
}

var accessLogStream = stream({
                                 file: __dirname + '/logs/access.log',
                                 size: config.accessLog.fileSize,
                                 keep: config.accessLog.keep,
                                 compress: config.accessLog.compress
                             });

logger.format('access', '[:date] ip=:remote-addr mtd=:method url=:url http=:http-version rfr=":referrer" st=:status cl=:res[content-length] - time=:response-time ms');
app.use(logger('access', {stream: accessLogStream, buffer: true}));

//configure
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));

//added this code to avoid HTTP 413 error excess data post

app.use(bodyParser.urlencoded({extended: false,limit: '100mb'}));
app.use(bodyParser.json({limit: '100mb'}));

app.use(cookieParser());
app.disable('etag')
app.use(cacheResponseDirective());
app.use(express.static(path.join(__dirname, 'public')));

console.log('Creating buildStats application resources: services and external data access');
var externalDataAccessResources = require('./externalDataAccessResources')(config);

//services
var jobServices = require('./services/job/services')(config,externalDataAccessResources);
var pipelineServices = require('./services/pipeline/services')(config,externalDataAccessResources);
var projectMetricsServices = require('./services/projectMetrics/services')(config,externalDataAccessResources);
var globalBuildStatsServices = require('./services/globalBuildStats/services')(config,externalDataAccessResources);
var gradleDataServices = require('./services/gradleData/services')(config,externalDataAccessResources);
var getDataFromPheonixServices = require('./services/getDataFromPheonix/services')(config,externalDataAccessResources);

//routes
var routes = require('./routes/index')(config);
var isactive = require('./routes/isactive');
var buildinfo = require('./routes/buildinfo');
app.use('/', routes);
app.use('/isActive', isactive);
app.use('/buildInfo', buildinfo);
app.use('/lpas', require('./routes/lpas'));

//other API's
var ourBuildstats = require('./routes/buildstatsapi');
var jobApi = require('./routes/job/jobApi')(config,jobServices);
var pipelineApi = require('./routes/pipeline/pipelineApi')(config,pipelineServices);
var projectMetricsApi = require('./routes/projectMetrics/projectMetricsApi')(config,projectMetricsServices);
var globalBuildStatsApi = require('./routes/globalBuildStats/globalBuildStatsApi')(config,globalBuildStatsServices);
var gradleDataApi = require('./routes/gradleData/gradleDataApi')(config,gradleDataServices);
var getDataFromPheonixAPI = require('./routes/getDataFromPheonixAPI')(config,getDataFromPheonixServices);
var email	=	require('./routes/email')(config);


//these are routes, if a call comes to /buildstats/job this jobApi will be used 
app.use('/expediabuildstats',ourBuildstats);
app.use('/buildstats/job',jobApi);
app.use('/buildstats/pipeline',pipelineApi);
app.use('/projectmetrics',projectMetricsApi);
app.use('/globalbuildstats',globalBuildStatsApi);
app.use('/gradleData',gradleDataApi);
app.use('/getdatafromlim',getDataFromPheonixAPI);

app.use('/job',require('./routes/job')(config));
app.use('/pipeline',require('./routes/pipeline')(config));
app.use('/createchart',require('./routes/createchart')(config));
//testing
app.use('/email',email);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'dev') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
