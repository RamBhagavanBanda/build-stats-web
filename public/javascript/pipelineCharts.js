var stackedData;

// TODO: This function getting called on page load, need to investigate why
var createChart = function() {

    var pipelineName = $('#pipelineName').val();

    var startDate = $('#startDate').val();
    if (startDate == "") {
        startDate = new Date();

    }
    startDate = getDatePart(startDate);
    console.log(startDate);

    var endDate = $('#endDate').val();
    if (endDate == "") {
        endDate = new Date();
    }
    endDate = getDatePart(endDate);
    console.log(endDate);

    var chartType = $('#chartType').val();
    var durationType = $('#durationType').val();
    var cutOffJobName = $('#cutOffJobName').val();

    if ((chartType == "PipelineDurationByStageName")) {
        getPipelineJsonDataByStageNameAndCreateChart(startDate, endDate, pipelineName, chartType);
    } else if ((chartType == "FailuresByCategory")) {
        getPipelineFailureJsonDataAndCreateChart(startDate, endDate, pipelineName, chartType);
    } else {
        getPipelineJsonDataAndCreateChart(startDate, endDate, pipelineName, chartType, durationType, cutOffJobName);
    }
};

var getDatePart = function(theDate) {
    theDate = new Date(theDate);
    return theDate.getFullYear() + "-" + (theDate.getMonth() + 1) + "-" + theDate.getDate();
};

function isNonQuarantinedStage(value) {
    return !(value.indexOf("Quarantined") >= 0);
}

var getDateForStackedGraph = function(aggregatedDataByStageName) {

    distictStagesInPipeline = aggregatedDataByStageName["stageNames"].reverse().filter(isNonQuarantinedStage);

    var count = 0;
    var resObj = {};

    var relationshipKeyArray = [];
    var relationshipKeyObj = {
        name : 'CL Number',
        data : []
    };
    relationshipKeyArray[0] = relationshipKeyObj;
    resObj[0] = relationshipKeyArray;

    var ciJobBuildIdArray = [];
    var ciJobBuildIdObj = {
        name : 'CI Job Build ID',
        data : []
    };
    ciJobBuildIdArray[0] = ciJobBuildIdObj;
    resObj[1] = ciJobBuildIdArray;

    var stageArray = [];
    $.each(distictStagesInPipeline, function(distictStagesInPipelineIndex, distictStagesInPipelineData) {
        var stageObj = {
            name : distictStagesInPipelineData,
            data : []
        };
        stageArray[distictStagesInPipelineIndex] = stageObj;
    });
    resObj[2] = stageArray;
    console.log(resObj);

    $.each(aggregatedDataByStageName["durationsbystage"], function(key, value) {

        if (((typeof value._id.ciJobBuildId != 'undefined') && (value._id.ciJobBuildId != null))
                && ((typeof value._id.relationshipKey != 'undefined') && (value._id.relationshipKey != null))) {

            $.each(distictStagesInPipeline, function(distictStagesInPipelineIndex, distictStagesInPipelineData) {
                $.each(value.data, function(index, mydata) {
                    if (mydata.stageName == distictStagesInPipelineData) {
                        resObj[0][0]["data"][count] = value._id.relationshipKey;
                        resObj[1][0]["data"][count] = value._id.ciJobBuildId;
                        resObj[2][distictStagesInPipelineIndex]["data"][count] = mydata.TotalTime;
                    } else if (typeof resObj[2][distictStagesInPipelineIndex]["data"][count] == 'undefined') {
                        resObj[2][distictStagesInPipelineIndex]["data"][count] = null;
                    }

                });

            });
            ++count;
        }
    });
    
    return resObj;
};

function getPipelineJsonDataAndCreateChart(startDate, endDate, pipelineName, chartType, durationType, cutOffJobName) {

    var url = '/buildstats/pipeline/' + startDate + '/' + endDate + '/' + pipelineName + '/' + cutOffJobName + '/pipelinemap';

    $.getJSON(url, function(jsondata) {
        console.log("success");
    }).done(function(jsondata) {
        console.log("getSuccessPercentageJsonData=" + jsondata.length);
        drawChart(chartType, durationType, jsondata, pipelineName);
        // printUrl(chartType,durationType);
    });
}

function getPipelineFailureJsonDataAndCreateChart(startDate, endDate, pipelineName, chartType) {

    var url = '/buildstats/pipeline/' + startDate + '/' + endDate + '/' + pipelineName + '/allAggregatedFailures';

    $.getJSON(url, function(jsondata) {
        console.log("success");
    }).done(function(jsondata) {
        console.log("getSuccessPercentageJsonData=" + jsondata.length);
        drawFailureCategoryChart(chartType, durationType, jsondata, pipelineName);
    });
}

function getPipelineJsonDataByStageNameAndCreateChart(startDate, endDate, pipelineName, chartType) {

    var restAPIs = [];
    restAPIs[0] = {
        key : "stageNames",
        value : '/buildstats/job/stageNam/' + pipelineName + '/distinct'
    };
    restAPIs[1] = {
        key : "durationsbystage",
        value : '/buildstats/pipeline/' + startDate + '/' + endDate + '/' + pipelineName + '/durationsbystage'
    };
    var dataObj = {
        count : 0,
        data : {}
    };

    $.each(restAPIs, function(j) {
        $.getJSON(restAPIs[j].value, function(jsondata) {
            console.log("success");
        }).done(function(jsondata) {
            dataObj.data[restAPIs[j].key] = jsondata;
            console.log("getTestJsonData=" + jsondata.length);
            dataObj.count += 1;
            if (dataObj.count === restAPIs.length) {
                drawStackedChart(chartType, durationType, dataObj.data, pipelineName);
            }
        });
    });
}

var drawStackedChart = function(chartType, durationType, jData, pipelineName) {

    stackedData = getDateForStackedGraph(jData);
    var series1 = stackedData[2];
    var categories = stackedData[0];
    var options = createOptions(chartType, durationType, pipelineName);

    options.series = series1;
    options.xAxis.categories = categories[0]['data'];
    var chart = new Highcharts.Chart(options);
};

var drawChart = function(chartType, durationType, jData, pipelineName) {

    var series1 = [];
    var categories = [];
    var ciJobBuildIds = [];
    var options = createOptions(chartType, durationType, pipelineName);

    $.each(jData, function(index, value) {
        if (value.value.cutoffJobFound) {
            series1.push(value.value.TotalTimeTaken);
            categories.push(value._id.relationshipKey);
            ciJobBuildIds.push(value._id.ciJobBuildId);
        }
    });

    options.series[0].name = chartType;
    options.series[0].data = series1;
    options.xAxis.categories = categories;
    var chart = new Highcharts.Chart(options);
};

var drawFailureCategoryChart = function(chartType, durationType, jData, pipelineName) {

    var series1 = [];
    var categories = [];
    var options = createOptions(chartType, durationType, pipelineName);

    $.each(jData, function(index, value) {
        series1.push(value.value.count);
        categories.push(value._id.failureCategory);
    });

    options.series[0].name = chartType;
    options.series[0].data = series1;
    options.xAxis.categories = categories;
    var chart = new Highcharts.Chart(options);
};

function createOptions(chartType, durationType, pipelineName) {

    var yaxis;
    var xaxis =   {
        min : 0,
        tickInterval : 1,
        title : {
            text : xAxisLabel
        }
    };
    var xAxisLabel;
    var yAxisLabel;
    var _stacking = null;

    if (chartType == "PipelineDuration") {
        xAxisLabel = "CL Number";
        yAxisLabel = "Duration";
    }

    if (chartType == "PipelineDurationByStageName") {

        _stacking = 'normal';
        yaxis = {
            type : 'datetime',
            dateTimeLabelFormats : {
                millisecond : '%H:%M:%S',
                second : '%H:%M:%S',
                minute : '%H:%M:%S',
                hour : '%H:%M:%S',
                day : '%H:%M:%S',
                week : '%H:%M:%S',
                month : '%H:%M:%S',
                year : '%H:%M:%S'
            },
            title : {
                text : 'Duration'
            },
            stackLabels : {
                // enabled: true,
                style : {
                    fontWeight : 'bold',
                    color : (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        };
    } else if (chartType == "PipelineDuration") {
        yaxis = {
            type : 'datetime',
            dateTimeLabelFormats : {
                millisecond : '%H:%M:%S',
                second : '%H:%M:%S',
                minute : '%H:%M:%S',
                hour : '%H:%M:%S',
                day : '%H:%M:%S',
                week : '%H:%M:%S',
                month : '%H:%M:%S',
                year : '%H:%M:%S'
            },
            title : {
                text : 'Duration'
            }
        };
    } else if (chartType == "FailuresByCategory") {
        yaxis = {
            type : 'linear',
            title : {
                text : 'Failure Count'
            }
        }, xaxis = {
            min : 0,
            tickInterval : 1,
            title : {
                text : 'Failure Category'
            }
        };
    } else {
        yaxis = {
            title : {
                text : yAxisLabel
            }
        }, xaxis = {
            min : 0,
            tickInterval : 1,
            title : {
                text : xAxisLabel
            }
        };
    }
    
    console.log(xaxis);

    var start = +new Date();
    var options = {
        tooltip : {
            formatter : function() {
                return getTooltip(this.x, this.y, chartType, durationType);
            }
        },
        chart : {
            height : 700,
            events : {
                load : function() {
                    if (!window.isComparing) {
                        this.setTitle(null, {
                            text : 'Built chart in ' + (new Date() - start) / 1000 + 'sec'
                        });
                    }
                }
            },
            renderTo : 'container',
            type : 'column',
            zoomType : 'x'
        },
        xAxis : xaxis,
        yAxis : yaxis,
        title : {
            text : pipelineName + ' pipeline build Duration View'
        },
        subtitle : {
            text : 'Built chart in ...' // dummy text to reserve space for
                                        // dynamic subtitle
        },
        plotOptions : {
            column : {
                stacking : _stacking
            }
        },
        series : [ { /*type: 'area'*/} ]
    };

    return options;
};

var getTooltip = function(xValue, yValue, chartType) {
    var xInfo;
    var yInfo;

    //xInfo = getCiJobBuildId(xValue);
    if (chartType == "FailuresByCategory") {
        yInfo = yValue;
    } else {
        yInfo = convertMillisToHHMMSS(yValue);
    }

    xInfo = xValue;

    return xInfo + ' <br> <b>' + yInfo + '</b>';
};

//var getCiJobBuildId = function(clNumber){
//
//	return stackedData[1][0]['data'][stackedData[0][0]['data'].indexOf(clNumber)];
//};  

var convertWeekToDateRange = function(weekNo) {

    return "TBD1 - TBD2";
};

var convertMillisToHHMMSS = function(yValue) {

    return (new Date(yValue)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
};