$(document).on('ready', function() {

    var jobsList = '';
    var pipelinesList = '';
    var jobs = [];
    var pipelines = [];

    var url = '/buildstats/job/jobName/HG_LPAS_EWE/distinct';
    var jsonData = {
	"field" : "jobName"
    };
    var contentType = 'json';
    var type = "GET";

    var request = $.ajax({
	url : url,
	type : type,
	dataType : contentType,
	data : jsonData,
    });

    request.done(function(jsondata) {
	console.dir(jsondata);
	$.each(jsondata, function() {
	    jobsList += '<li><a href="/job/' + this + '">' + this + '</a></li>';
	});

	$('#ul01').html(jobsList);
    });

    $('#ul02').html('<li><a href="/pipeline/HG_LPAS_EWE"> HG_LPAS_EWE </li>');
});
