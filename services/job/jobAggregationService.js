module.exports = function(config, externalDataAccessResources) {

    var service = {
        getAggregateByWeek : function(buildStartTime, buildEndTime, JobName, aggregateType, cb) {
            var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
            var buildsCollection = buildsMongo.collection(config.buildsCollection);
            var buildStartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var buildEndTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');
            var aggregateType = aggregateType.toLowerCase();
            var aggregateType = aggregateType.toString();

            switch (aggregateType) {
            case "dod":
                aggregationMethod = {
                    Day : {
                        $dayOfMonth : "$buildStarttime"
                    },
                    Month : {
                        $month : "$buildStarttime"
                    },
                    Year : {
                        $year : "$buildStarttime"
                    },
                    Jobname : "$jobName"
                }
                break;
            case "wow":
                aggregationMethod = {
                    Week : {
                        $week : "$buildStarttime"
                    },
                    Jobname : "$jobName",
                    Year : {
                        $year : "$buildStarttime"
                    }
                }
                break;
            case "mom":
                aggregationMethod = {
                    Month : {
                        $month : "$buildStarttime"
                    },
                    Jobname : "$jobName",
                    Year : {
                        $year : "$buildStarttime"
                    }
                }
                break;
            case "yoy":
                aggregationMethod = {
                    Year : {
                        $year : "$buildStarttime"
                    },
                    Jobname : "$jobName"
                }
                break;
            default:
                cb('PLEASE ENTER A VALID AGGREGATION METHOD. VALID VALUES ARE: DOD, WOW, MOM, YOY');
            }

            // Todo Need to filter aborted pipelines

            // Creating Query String
            var match = {
                $match : {
                    buildStarttime : {
                        $gte : buildStartTime,
                        $lt : buildEndTime
                    },
                    jobName : JobName
                }
            };
            var group = {
                $group : {
                    _id : aggregationMethod,
                    failedJobs : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "FAILURE" ]
                            }, 1, 0 ]
                        }
                    },
                    successJobs : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "SUCCESS" ]
                            }, 1, 0 ]
                        }
                    },
                    abortedJobs : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "ABORTED" ]
                            }, 1, 0 ]
                        }
                    },
                    unstableJobs : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "UNSTABLE" ]
                            }, 1, 0 ]
                        }
                    },
                    failedJobsDuration : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "FAILURE" ]
                            }, "$buildDurationInMilliseconds", 0 ]
                        }
                    },
                    successJobsDuration : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "SUCCESS" ]
                            }, "$buildDurationInMilliseconds", 0 ]
                        }
                    },
                    abortedJobsDuration : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "ABORTED" ]
                            }, "$buildDurationInMilliseconds", 0 ]
                        }
                    },
                    unstableJobsDuration : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "UNSTABLE" ]
                            }, "$buildDurationInMilliseconds", 0 ]
                        }
                    },
                    totalNumberOfJobs : {
                        $sum : 1
                    },
                    dateOfDay : {
                        "$first" : "$buildStarttime"
                    },
                    averageJobsDuration : {
                        "$avg" : "$buildDurationInMilliseconds"
                    }
                }
            };
            var sort = {
                $sort : {
                    dateOfDay : 1
                }
            };
            var project = {
                $project : {
                    failedJobs : 1,
                    successJobs : 1,
                    abortedJobs : 1,
                    unstableJobs : 1,
                    failedJobsDuration : 1,
                    successJobsDuration : 1,
                    abortedJobsDuration : 1,
                    unstableJobsDuration : 1,
                    totalNumberOfJobs : 1,
                    dateOfDay : 1,
                    averageJobsDuration : 1,
                    failedJobsPercentage : {
                        $divide : [ "$failedJobs", "$totalNumberOfJobs" ]
                    },
                    successJobsPercentage : {
                        $divide : [ "$successJobs", "$totalNumberOfJobs" ]
                    },
                    abortedJobsPercentage : {
                        $divide : [ "$abortedJobsDuration", "$totalNumberOfJobs" ]
                    },
                    unstableJobsPercentage : {
                        $divide : [ "$unstableJobsDuration", "$totalNumberOfJobs" ]
                    },
                    failedDurationPercentage : {
                        $cond : [ {
                            $eq : [ "$failedJobs", 0 ]
                        }, null, {
                            "$divide" : [ "$failedJobsDuration", "$failedJobs" ]
                        } ]
                    },
                    successDurationPercentage : {
                        $cond : [ {
                            $eq : [ "$successJobs", 0 ]
                        }, null, {
                            "$divide" : [ "$successJobsDuration", "$successJobs" ]
                        } ]
                    },
                    abortedDurationPercentage : {
                        $cond : [ {
                            $eq : [ "$abortedJobs", 0 ]
                        }, null, {
                            "$divide" : [ "$abortedJobsDuration", "$abortedJobs" ]
                        } ]
                    },
                    unstableDurationPercentage : {
                        $cond : [ {
                            $eq : [ "$unstableJobs", 0 ]
                        }, null, {
                            "$divide" : [ "$unstableJobsDuration", "$unstableJobs" ]
                        } ]
                    }
                }
            };

            if (buildsCollection) {
                buildsCollection.aggregate([ match, group, sort, project ], function(err, items) {
                    if (err) {
                        console.log('AGGREGATION QUERY FAILED TO GET THE INFORMATION FROM MONGODB' + err);
                        cb({
                            error : err
                        });
                    } else
                        cb(items);
                })
            } else {
                console.log('Error connecting to BrontoLogics build stats Mongo collection: ' + config.buildsCollection);
            }
        },
        getMapReduceFailureCategory : function(buildStartTime, buildEndTime, jobName, callback) {
            var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
            var buildsCollection = buildsMongo.collection(config.buildsCollection);
            var _buildStartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var _buildEndTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');

            var KEYS = {
                buildStartTime : _buildStartTime,
                buildEndTime : _buildEndTime,
                jobName : jobName,
                buildResult : "FAILURE"
            };

            //Creating Query String
            var mapper = function() {
                if ((this.buildStarttime >= KEYS.buildStartTime)
                        && (this.buildEndtime <= KEYS.buildEndTime)
                        && (this.jobName == KEYS.jobName)
                        && (this.buildResult == KEYS.buildResult)
                        && (typeof this.relationshipKey !== 'undefined' && this.relationshipKey !== null)
                        && (typeof this.ciJobBuildId !== 'undefined' && this.ciJobBuildId !== null)
                        && (this.jobName.toLowerCase().indexOf("Quarantined".toLowerCase()) == -1)) {

                    var mapKey = {
                        failureCategory : this.environmentVariables.FailureCategory == null ? "CATEGORY UNDEFINED"
                                : this.environmentVariables.FailureCategory.replace(/,+$/, "")
                    };
                    
                    var mapValues = {
                        _id : this._id,
                        ciJobBuildId : this.ciJobBuildId,
                        relationshipKey : this.relationshipKey,
                        jobName : this.jobName,
                        pipelineName : this.pipelineName,
                        failureCategory : this.environmentVariables.FailureCategory
                    };
                    
                    emit(mapKey, mapValues);
                }
            };

            var reducer = function(key, values) {
                result = { count: 0};

                for (var i = 0; i < values.length; i++) {
                    if (values[i].count != null && values[i].count != 'undefined') {
                        result.count += values[i].count;
                    } else {
                        result.count ++;
                    }
                }

                return (result);
            };

            var finalize = function(key, reduced) {
                if (reduced.count !== null && typeof reduced.count != 'undefined') {
                    return reduced;
                } else {
                    reduced = {};
                    reduced.count = 1;
                    return reduced;
                }
            };

            if (buildsCollection) {
                buildsCollection.mapReduce(mapper, reducer, {
                    finalize : finalize,
                    scope : {
                        KEYS : KEYS
                    },
                    out : {
                        inline : 1
                    },
                    verbose : true
                }, function(err, results) {
                    if (err) {
                        console.log('MAPREDUCE QUERY FAILED TO GET THE INFORMATION FROM MONGODB' + err);
                        callback({
                            error : err
                        });
                    } else
                        callback(results)
                })
            } else {
                console.log('Error connecting to BrontoLogics build stats Mongo collection: ' + config.buildsCollection);
            }
        }
    }

    return service;
}
