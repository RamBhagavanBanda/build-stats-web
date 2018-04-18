module.exports = function(config, externalDataAccessResources) {

    var service = {
        getAggregateByPipelinename : function(buildStartTime, buildEndTime, pipelineName, cb) {
            var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
            var buildsCollection = buildsMongo.collection(config.buildsCollection);
            var buildstartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var buildendTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');

            var match = {
                $match : {
                    buildStarttime : {
                        $gte : buildStartTime,
                        $lt : buildEndTime
                    },
                    ciJobBuildId : {
                        $exists : true
                    },
                    pipelineName : pipelineName,
                    jobName : {
                        $not : /Quarantined/
                    }
                // Eliminating Quarantined Jobs
                }
            };
            var group = {
                $group : {
                    _id : {
                        relationshipKey : "$relationshipKey",
                        ciJobBuildId : "$ciJobBuildId"
                    },
                    MinimumDateTime : {
                        $min : "$buildStarttime"
                    },
                    MaximumDateTime : {
                        $max : "$buildEndtime"
                    },
                    Failed : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "FAILURE" ]
                            }, 1, 0 ]
                        }
                    },
                    Success : {
                        $sum : {
                            $cond : [ {
                                $eq : [ "$buildResult", "SUCCESS" ]
                            }, 1, 0 ]
                        }
                    }
                }
            };
            var sort = {
                $sort : {
                    MinimumDateTime : 1
                }
            };
            var project = {
                $project : {
                    MinimumDateTime : 1,
                    MaximumDateTime : 1,
                    TotalTimeTaken : {
                        $subtract : [ "$MaximumDateTime", "$MinimumDateTime" ]
                    },
                    Pipelinestatus : {
                        "$cond" : {
                            "if" : {
                                "$gt" : [ "$Failed", 0 ]
                            },
                            "then" : "RED",
                            "else" : {
                                "$cond" : {
                                    "if" : {
                                        "$gt" : [ "$Success", 0 ]
                                    },
                                    "then" : "GREEN",
                                    "else" : "NONE"
                                }
                            }
                        }
                    }
                }
            };

            if (buildsCollection) {
                buildsCollection.aggregate([ match, group, sort, project ], function(err, items) {
                    if (err) {
                        console.log('PIPELINE AGGREGATION QUERY FAILED TO GET THE INFORMATION FROM MONGODB' + err);
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
        getMapreduceByPipelinename : function(buildStartTime, buildEndTime, pipelineName, cutoffJob, cb) {

            var buildsMongo = externalDataAccessResources.getBuildsMongoDb();

            var buildsCollection = buildsMongo.collection(config.buildsCollection);
            var buildstartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var buildendTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');
            var KEYS = {
                cutoffJOB : cutoffJob,
                buildStartTime : buildstartTime,
                buildEndTime : buildendTime,
                pipeLineName : pipelineName
            };

            // Creating Query String
            var mapper = function() {
                if (this.buildStarttime >= KEYS.buildStartTime 
                        && this.buildEndtime <= KEYS.buildEndTime
                        && this.pipelineName == KEYS.pipeLineName) {
                    if ((typeof this.relationshipKey !== 'undefined' && this.relationshipKey !== null)) {
                        if (typeof this.ciJobBuildId !== 'undefined' && this.ciJobBuildId !== null) {
                            if (this.jobName.toLowerCase().indexOf("Quarantined".toLowerCase()) == -1) {

                                var mapKey = {
                                    relationshipKey : this.relationshipKey,
                                    ciJobBuildId : this.ciJobBuildId
                                };
                                var mapValues = {
                                    relationshipKey : this.relationshipKey,
                                    ciJobBuildId : this.ciJobBuildId,
                                    jobName : this.jobName,
                                    buildStarttime : this.buildStarttime,
                                    buildEndtime : this.buildEndtime,
                                    TotalTimeTaken : this.buildEndtime - this.buildStarttime,
                                    cutoffJobFound : (this.jobName == KEYS.cutoffJOB)
                                };
                                emit(mapKey, mapValues);
                            }
                        }
                    }
                }
            };
            var reducer = function(key, values) {
                var result = {
                    relationshipKey : "",
                    ciJobBuildId : "",
                    jobName : "",
                    buildStarttime : "",
                    buildEndtime : "",
                    TotalTimeTaken : 0,
                    cutoffJobFound : false
                };

                var startTime;
                var endTime;
                startTime = values[0].buildStarttime;

                for (var i = 0; i < values.length; i++) {

                    if (startTime > values[i].buildStarttime) {
                        startTime = values[i].buildStarttime;
                    }

                    result.relationshipKey = values[i].relationshipKey;
                    result.ciJobBuildId = values[i].ciJobBuildId;
                    result.jobName = values[i].jobName;

                    if (values[i].jobName == KEYS.cutoffJOB) {
                        endTime = values[i].buildEndtime;
                        result.cutoffJobFound = true;
                    }
                }
                ;
                result.TotalTimeTaken = endTime - startTime;
                result.buildStarttime = startTime;
                result.buildEndtime = endTime;

                return (result);
            };

            if (buildsCollection) {
                buildsCollection.mapReduce(mapper, reducer, {
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
                        cb({
                            error : err
                        });
                    } else
                        cb(results)
                })
            } else {
                console.log('Error connecting to BrontoLogics build stats Mongo collection: ' + config.buildsCollection);
            }
        },
        getMapreduceBytotalTests : function(buildStartTime, buildEndTime, startJobName, endJobName, cb) {
            var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
            var buildsCollection = buildsMongo.collection(config.buildsCollection);
            var buildstartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var buildendTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');
            var KEYS = {
                StartJobName : startJobName,
                buildStartTime : buildstartTime,
                buildEndTime : buildendTime,
                EndJobName : endJobName
            };

            // Creating Query String
            var mapper = function() {
                if (this.buildStarttime >= KEYS.buildStartTime 
                        && this.buildEndtime <= KEYS.buildEndTime
                        && (this.jobName == KEYS.StartJobName || this.jobName == KEYS.EndJobName)) {
                    if ((typeof this.relationshipKey !== 'undefined' && this.relationshipKey !== null)) {
                        if (typeof this.ciJobBuildId !== 'undefined' && this.ciJobBuildId !== null) {

                            var mapKey = {
                                relationshipKey : this.relationshipKey,
                                ciJobBuildId : this.ciJobBuildId
                            };
                            var mapValues = {
                                relationshipKey : this.relationshipKey,
                                jobName : this.jobName,
                                totalTests : this.totalTests,
                                failedTests : this.failedTests,
                                skippedTests : this.skippedTests
                            };
                            emit(mapKey, mapValues);

                        }
                    }
                }
            };
            var reducer = function(key, values) {
                var result = {};

                result["combinedTotalTests"] = 0;
                result["quarantinedTests"] = 0;

                for (var i = 0; i < values.length; i++) {

                    var jobNameKey = values[i].jobName;

                    if (result[jobNameKey] === undefined) {
                        result[jobNameKey] = {};
                    }

                    result[jobNameKey]["totalTests"] = values[i].totalTests;
                    result[jobNameKey]["failedTests"] = values[i].failedTests;
                    result[jobNameKey]["skippedTests"] = values[i].skippedTests;

                    if (jobNameKey.toLowerCase().indexOf("Quarantined".toLowerCase()) > -1) {
                        result["quarantinedTests"] = values[i].totalTests;
                    }

                    result["combinedTotalTests"] = result["combinedTotalTests"] + values[i].totalTests;
                }
                return (result);
            };

            var finalize = function(key, reduced) {
                if (typeof reduced.combinedTotalTests != 'undefined' && reduced.combinedTotalTests !== null) {
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
                        cb({
                            error : err
                        });
                    } else
                        cb(results)
                })
            } else {
                console.log('Error connecting to BrontoLogics build stats Mongo collection: ' + config.buildsCollection);
            }
        },
        getDurationsByStage : function(buildStartTime, buildEndTime, pipelineName, cb) {
            var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
            var buildsCollection = buildsMongo.collection(config.buildsCollection);
            var buildstartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var buildendTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');
            // Creating Query String
            var match = {
                $match : {
                    buildStarttime : {
                        $gte : buildStartTime,
                        $lt : buildEndTime
                    },
                    pipelineName : pipelineName
                }
            };
            var group1 = {
                $group : {
                    _id : {
                        relationshipKey : "$relationshipKey",
                        ciJobBuildId : "$ciJobBuildId",
                        stageNam : "$stageNam"
                    },
                    MinimumDate : {
                        $min : "$buildStarttime"
                    },
                    MaximumDateTime : {
                        $max : "$buildEndtime"
                    }
                }
            };
            var project1 = {
                $project : {
                    _id : 1,
                    MinimumDate : 1,
                    MaximumDateTime : 1,
                    TimeTaken : {
                        $subtract : [ "$MaximumDateTime", "$MinimumDate" ]
                    }
                }
            };
            var group2 = {
                $group : {
                    _id : {
                        relationshipKey : "$_id.relationshipKey",
                        ciJobBuildId : "$_id.ciJobBuildId"
                    },
                    data : {
                        $push : {
                            stageName : "$_id.stageNam",
                            TotalTime : "$TimeTaken"
                        }
                    }
                }
            };

            var project2 = {
                $project : {
                    _id : 1,
                    data : 1
                }
            }
            var sort = {
                $sort : {
                    _id : 1
                }
            }

            if (buildsCollection) {
                buildsCollection.aggregate([ match, group1, project1, group2, project2, sort ], function(err, items) {
                    if (err) {
                        console.log('PIPELINE AGGREGATION QUERY FAILED TO GET THE INFORMATION FROM MONGODB' + err);
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
        getAll : function(buildStartTime, buildEndTime, pipelineName, cb) {
            var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
            var buildsCollection = buildsMongo.collection(config.buildsCollection);
            var _buildStartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var _buildEndTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');
            var queryString = {
                buildStarttime : {
                    $gte : _buildStartTime,
                    $lt : _buildEndTime
                },
                pipelineName : pipelineName
            };
            console.log(queryString);
            var projection = {
                "jobName" : 1,
                "pipelineName" : 1,
                "buildStarttime" : 1,
                "buildEndtime" : 1,
                "buildResult" : 1,
                "buildDurationInMilliseconds" : 1
            };
            var sortBy = {
                "buildStarttime" : 1
            };
            if (buildsCollection) {
                buildsCollection.find(queryString, projection).sort(sortBy).toArray(function(err, items) {
                    if (err) {
                        cb({
                            error : err
                        });
                    } else {
                        cb(items);
                    }
                });

            } else {
                console.log('Error connecting to BrontoLogics build stats Mongo collection: ' + config.buildsCollection);
            }
        },
        getAllFailureCategory : function(buildStartTime, buildEndTime, pipelineName, cb) {
            var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
            var buildsCollection = buildsMongo.collection(config.buildsCollection);
            var _buildStartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var _buildEndTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');
            var queryString = {
                buildStarttime : {
                    $gte : _buildStartTime,
                    $lt : _buildEndTime
                },
                relationshipKey : {
                    $exists : true
                },
                ciJobBuildId : {
                    $exists: true
                },
                pipelineName : pipelineName,
                buildResult : "FAILURE"
            };
            
            console.log(queryString);

            var projection = {
                "_id" : 1,
                "buildId" : 1,
                "relationshipKey" : 1,
                "ciJobBuildId" : 1,
                "jobName" : 1,
                "pipelineName" : 1,
                "buildStarttime" : 1,
                "buildEndtime" : 1,
                "buildResult" : 1,
                "buildDurationInMilliseconds" : 1,
                "environmentVariables.FailureCategory" : 1
            };
            
            var sortBy = {
                "buildStarttime" : 1
            };
            
            if (buildsCollection) {
                buildsCollection.find(queryString, projection).sort(sortBy).toArray(function(err, items) {
                    if (err) {
                        cb({
                            error : err
                        });
                    } else {
                        cb(items);
                    }
                });

            } else {
                console.log('Error connecting to BrontoLogics build stats Mongo collection: ' + config.buildsCollection);
            }
        },
        getMapReduceFailureCategory : function(buildStartTime, buildEndTime, pipelineName, callback) {
            var buildsMongo = externalDataAccessResources.getBuildsMongoDb();
            var buildsCollection = buildsMongo.collection(config.buildsCollection);
            var _buildStartTime = new Date(buildStartTime.toISOString().split('T')[0] + 'T00:00:00.000Z');
            var _buildEndTime = new Date(buildEndTime.toISOString().split('T')[0] + 'T23:59:59.999Z');

            var KEYS = {
                buildStartTime : _buildStartTime,
                buildEndTime : _buildEndTime,
                pipeLineName : pipelineName,
                buildResult : "FAILURE"
            };

            console.log(KEYS);

            // Creating Query String
            var mapper = function() {
                if ((this.buildStarttime >= KEYS.buildStartTime)
                        && (this.buildStarttime <= KEYS.buildEndTime)
                        && (this.pipelineName == KEYS.pipeLineName)
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
                        buildId : this.buildId,
                        relationshipKey : this.relationshipKey,
                        ciJobBuildId : this.ciJobBuildId,
                        jobName : this.jobName,
                        pipelineName : this.pipelineName,
                        buildStarttime : this.buildStarttime,
                        buildEndtime : this.buildEndtime,
                        buildDurationInMilliseconds : this.buildDurationInMilliseconds,
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
