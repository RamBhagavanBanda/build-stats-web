$(document).on('ready', function() {	
	var urlPipelines = '/expediabuildstats/distinct';
	var jsonPipelines = {"field": "pipelineName"};
	var contentType = 'json';
	var type = "POST";
	
	var requestPipelines = $.ajax({
		url: urlPipelines,  
		type: type,
		dataType: contentType,
	    data: jsonPipelines,		  
	});

	var pipelines = [];
	var table = '<table><tr><th>Pipeline Name</th><th>Job Name</th></tr>';
	
	requestPipelines.done(function(json) {
		$.each(json,function(){
			if(this.length>0){
				pipelines.push(this);	
			}
		});
		
		var tasks = [];
		$.each(pipelines, function(){	
			var pipelineName = this;	
			var urlPipelineJobs = '/buildstats/job/jobName/'+pipelineName+'/distinct';
			var res = $.getJSON(urlPipelineJobs, function(jsondata) {});
			tasks.push(res);
			
			res.done(function(jsondata){
				console.log("done");
				table += '<tr><td><li><a href="/pipeline/' + pipelineName + '">' + pipelineName + '</a></li>' + '</td><td>'
				 $.each(jsondata, function(){
					   var jobName = this;
					   table +=  '<li><a href="/job/' + jobName + '">' + jobName + '</a></li>';   
				   });
				 table += '</td></tr>'
			});
		});	 
			
		$.when.apply($,tasks).done(function(){
				table += '</table>'
				$('#tb01').html(table);	
		});
	});	

});












