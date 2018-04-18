var cachedJData;
var overallAvgPercentage;

var createChart = function() {

    $('#container').empty();
    $('#TotalTestsVsQuarantinedTestContainer').empty();

    chartType = $('#chartType').val();
    durationType = $('#durationType').val();
    jobName = $('#jobName').val();
    qJobName = $('#QuarantineJobName').val();
    startDate = $('#startDate').val();
    endDate = $('#endDate').val();
    range = $('#range').val();

    if (startDate == "") {
        startDate = new Date();
    }
    if (endDate == "") {
        endDate = new Date();
    }
    if (!(range === undefined) && !(range == 'undefined')) {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - range);
    }
    console.log(endDate);
    console.log(startDate);
    startDate = getDatePart(startDate);
    endDate = getDatePart(endDate);

    if ((chartType == "TestPassPercentageVsQuarantinedTest")
            && ((jobName.indexOf("Acceptance") > -1) 
                    || (jobName.indexOf("Regression") > -1)
                    || (jobName.indexOf("Smoke") > -1) 
                    || (jobName.indexOf("DVT") > -1))) {
        getTestJsonData(jobName, qJobName, startDate, endDate, chartType, durationType);
    } else if (chartType == "FailuresByCategories") {
        getJobFailureJsonDataAndCreateChart(jobName, startDate, endDate, chartType);
    } else {
        getAggregatedData(jobName, startDate, endDate, chartType, durationType);
    }
};

function getAggregatedData(jobName, startDate, endDate, chartType, durationType) {

    var temp = "";

    if (durationType != "BOB") {
        temp = "/jobaggregate";
    }
    var url = "/buildstats/job/" + startDate + "/" + endDate + "/" + jobName + "/" + durationType + temp;

    $.getJSON(url, function(jsondata) {
        console.log("success");
    }).done(function(jsondata) {
        console.log("getSuccessPercentageJsonData=" + jsondata.length);
        drawChart(chartType, durationType, jsondata);
        printUrl(chartType, durationType);
    });
}

function getJobFailureJsonDataAndCreateChart(jobName, startDate, endDate, chartType) {

    var url = '/buildstats/job/' + startDate + '/' + endDate + '/' + jobName + '/allAggregatedFailures';

    $.getJSON(url, function(jsondata) {
        console.log("success");
    }).done(function(jsondata) {
        console.log("getSuccessPercentageJsonData=" + jsondata.length);
        drawChart(chartType, durationType, jsondata);
//        printUrl(chartType, durationType);
    });
}

var getDatePart = function(theDate) {
    theDate = new Date(theDate);
    return theDate.getFullYear() + "-" + (theDate.getMonth() + 1) + "-" + theDate.getDate();
};

var dateInMilliseconds = function(dateString) {

    console.log("dateString=" + dateString);
    var dateParam = new Date(dateString);
    return dateParam.getTime();
};

function getTestJsonData(jobName, qJobName, startDate, endDate, chartType, durationType) {

    var url = "/buildstats/pipeline/" + startDate + "/" + endDate + "/" + jobName + "/" + qJobName + "/totaltime";

    $.getJSON(url, function(jsondata) {
        console.log("success");
    }).done(function(jsondata) {
        cachedJData = jsondata;
        console.log("getTestJsonData=" + jsondata.length);
        drawTestChart(jobName, qJobName, chartType, durationType, jsondata);
        printUrl(chartType, durationType);
    });
}

var drawTestChart = function(jobName, qJobName, chartType, durationType, jData) {

    var count = 0;
    var sumOfSuccessPercentages = 0;
    var series1 = [];
    var categories = [];
    var options1 = createOptions(chartType, durationType, 'container', 425, "Pass %");
    var options2 = createOptions(chartType, durationType, 'TotalTestsVsQuarantinedTestContainer', 425,
            "Number of tests");

    var testPassPercentageSeries = [];
    var totalTestsVsQuarantinedTestSeries = [];

    var successPercentageData = [];
    var failPercentageData = [];
    var totalTestsData = [];
    var quarantinedTestsData = [];

    var successPercentageDataObj = {
        name : "Success Percentage",
        data : [],
        color : '#8dc63f',
        fillOpacity : 0.2
    };
    var failPercentageDataObj = {
        name : "Fail Percentage",
        data : []
    };
    var totalTestsDataObj = {
        name : "Total Tests",
        data : [],
        color : '#005a84',
        fillOpacity : 0.2,
    };
    var quarantinedTestsDataObj = {
        name : "Quarantined Tests",
        data : [],
        color : '#d9531e',
        fillOpacity : 0.2,
    };

    $.each(jData, function(index, value) {

        if (value.value != null) {

            var tests = value.value[jobName].totalTests;
            var failures = value.value[jobName].failedTests;

            var successPercentage = null;
            if (tests > 0) {
                successPercentage = ((tests - failures) / tests) * 100;
            }

            successPercentageData.push(successPercentage);
            count++;
            sumOfSuccessPercentages += successPercentage;
            totalTestsData.push(value.value.combinedTotalTests);
            quarantinedTestsData.push(value.value.quarantinedTests);

            categories.push(value._id.relationshipKey);

        }

    });

    overallAvgPercentage = sumOfSuccessPercentages / count;
    successPercentageDataObj.data = successPercentageData;
    totalTestsDataObj.data = totalTestsData;
    quarantinedTestsDataObj.data = quarantinedTestsData;

    testPassPercentageSeries.push(successPercentageDataObj);
    totalTestsVsQuarantinedTestSeries.push(totalTestsDataObj, quarantinedTestsDataObj);

    options1.series = testPassPercentageSeries;
    options2.series = totalTestsVsQuarantinedTestSeries;
    options1.chart.type = options2.chart.type = 'areaspline';
    options1.xAxis.categories = options2.xAxis.categories = categories;

    var chart1 = new Highcharts.Chart(options1);
    var chart2 = new Highcharts.Chart(options2);
};

var drawChart = function(chartType, durationType, jData) {

    var sumOfSuccessPercentages = 0;
    var count = 0;

    var series1 = [];
    var categories = [];
    var options = createOptions(chartType, durationType, "container", 700);

    $.each(jData, function(index, value) {

        if (chartType == "TotalNumberOfBuilds") {
            series1.push(value.totalNumberOfJobs);
        } else if (chartType == "BuildRedPercentage") {
            series1.push(value.failedJobsPercentage * 100);
        } else if (chartType == "BuildGreenPercentage") {
            series1.push(value.successJobsPercentage * 100);
            sumOfSuccessPercentages += value.successJobsPercentage * 1;
            count++;
        } else if ((chartType == "BuildDuration") && (durationType == "BOB")) {

            if (value.buildResult != "SUCCESS") {
                duration = {
                    y : value.buildDurationInMilliseconds,
                    color : '#FF0000'
                };
                series1.push(duration);
            } else {
                series1.push(value.buildDurationInMilliseconds);
            }
        } else if (chartType == "FailuresByCategories") {
            series1.push(value.value.count);
            categories.push(value._id.failureCategory);
        } else {
            series1.push(value.averageJobsDuration);
        }
        
        if (chartType != "FailuresByCategories") {
            if (durationType == "WOW") {
                categories.push(value._id.Week);
            } else if (durationType == "BOB") {
                categories.push(value.relationshipKey);
            } else {
                categories.push(value.dateOfDay.split("T")[0]);
            }
        }
    });
    
    overallAvgPercentage = (sumOfSuccessPercentages / count) * 100;
    options.series[0].name = chartType;
    options.series[0].data = series1;
    options.xAxis.categories = categories;
    var chart1 = new Highcharts.Chart(options);
};

function printUrl(chartType, durationType) {

    var strOverallAvgPercentage = "";
    if (overallAvgPercentage > 0)
        strOverallAvgPercentage = "<br>Overall Avg Percentage: " + overallAvgPercentage;
    var temp = "";
    if (qJobName != "") {
        temp = "&qJobName=" + qJobName;
    }
    $('#url')
            .html(
                    "http://"
                            + window.document.location.host
                            + "/createchart?jobName="
                            + jobName
                            + "&chartType="
                            + chartType
                            + "&startDate="
                            + startDate
                            + "&endDate="
                            + endDate
                            + "&durationType="
                            + durationType
                            + temp
                            + "<br>NOTE: if you wanted to get last N days you can add range=N, when you ask for range start and end dates will be ingored."
                            + strOverallAvgPercentage);

};

function createOptions(chartType, durationType, containerName, chartHeight, yAxisLabel) {

    var yaxis;
    var xaxis;
    var xAxisLabel;

    if ((chartType == "TotalNumberOfBuilds") && (durationType == "DOD")) {
        xAxisLabel = "Date";
        yAxisLabel = "Number of builds";
    } else if ((chartType == "TotalNumberOfBuilds") && (durationType == "WOW")) {
        xAxisLabel = "Week";
        yAxisLabel = "Number of builds";
    } else if ((chartType != "BuildGreenPercentage") && (durationType == "WOW")) {
        xAxisLabel = "Week Number";
        yAxisLabel = "Average Duration";
    } else if ((chartType != "BuildGreenPercentage") && (durationType == "DOD")) {
        xAxisLabel = "Date";
        yAxisLabel = "Average Duration";
    } else if ((chartType == "BuildGreenPercentage") && (durationType == "DOD")) {
        xAxisLabel = "Date";
        yAxisLabel = "Success Percentage";
    } else if ((chartType == "BuildGreenPercentage") && (durationType == "WOW")) {
        xAxisLabel = "Week Number";
        yAxisLabel = "Success Percentage";
    } else if ((chartType == "BuildDuration") && (durationType == "BOB")) {
        xAxisLabel = "CL Number";
        yAxisLabel = "Duration";
    } else if ((chartType == "FailuresByCategories")) {
        xAxisLabel = "Failure Categories";
        yAxisLabel = "Failure Count"
    }

    if (chartType == "BuildDuration") {
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
    } else if (chartType == "FailuresByCategories") {
        yaxis = {
            type : 'linear',
            title : {
                text : yAxisLabel
            }
        };
    } else {
        yaxis = {
            title : {
                text : yAxisLabel
            }
        };
    }

    var start = +new Date();
    var options = {
        tooltip : {
            formatter : function() {
                return getTooltip(this.x, this.y, chartType, durationType);
            }
        },
        chart : {
            height : chartHeight,
            events : {
                load : function() {
                    if (!window.isComparing) {
                        this.setTitle(null, {
                            text : 'Built chart in ' + (new Date() - start) / 1000 + 'sec'
                        });
                    }
                }
            },
            renderTo : containerName,
            type : 'column',
            zoomType : 'x'
        },
        xAxis : {
            min : 0,
            tickInterval : 1,
            title : {
                text : xAxisLabel
            }
        },

        yAxis : yaxis,
        title : {
            text : jobName + ' Job ' + chartType + ' View'
        },
        subtitle : {
            text : 'Built chart in ...' // dummy text to reserve space for
                                        // dynamic subtitle
        },
        series : [ { /* type: 'area' */} ]
    };
    return options;
};

var getTooltip = function(xValue, yValue, chartType, durationType) {
    var xInfo;
    var yInfo;

    if (durationType == "WOW") {
        xInfo = convertWeekToDateRange(xValue, 2015);
    } else {
        xInfo = xValue;
    }

    if (chartType == "BuildDuration") {
        yInfo = convertMillisToHHMMSS(yValue);
    } else {
        yInfo = yValue;
    }
    
    return xInfo + ' <br> <b>' + yInfo + '</b>';
};

var convertMillisToHHMMSS = function(yValue) {

    return (new Date(yValue)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
};

var convertWeekToDateRange = function(weeknumber, year) {

    var janFirst = new Date(year, 0, 1, 1, 1, 1, 1);
    var i = 1;
    var weekStart = janFirst;
    var weekEnd;

    switch (janFirst.getDay()) {
    case 0:
        if (weeknumber == 0) {
            weekStart = weekEnd = null;
            break;
        }
        if (weeknumber == 1) {
        } else {
            while (i < weeknumber) {
                weekStart = addDays(weekStart, 7);
                i++;
            }
        }

        if (weeknumber == 53) {
            weekEnd = weekStart;
            while (addDays(weekEnd, 1).getFullYear() == year) {
                weekEnd = addDays(weekEnd, 1);
            }
        } else {
            weekEnd = addDays(weekStart, 6);
        }

        break;
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
        if (weeknumber == 53) {
            weekStart = weekEnd = null;
            break;
        }
        weekEnd = weekStart;
        while (addDays(weekEnd, 1).getDay() > 0) {
            weekEnd = addDays(weekEnd, 1);
        }

        if (weeknumber == 0) {
            break;
        } else {
            weekStart = addDays(weekEnd, 1);
            while (i < weeknumber) {
                weekStart = addDays(weekStart, 7);
                i++;
            }
        }

        if (weeknumber == 52) {
            weekEnd = weekStart;
            while (addDays(weekEnd, 1).getFullYear() == year) {
                weekEnd = addDays(weekEnd, 1);
            }
        } else {
            weekEnd = addDays(weekStart, 6);
        }
        break;
    }

    return weekStart.getFullYear() + "-" + (weekStart.getMonth() + 1) + "-" + weekStart.getDate() + " to "
            + weekEnd.getFullYear() + "-" + (weekEnd.getMonth() + 1) + "-" + weekEnd.getDate();
}
