$(document).on('ready', function() {	
	var jobsList = '';
	var _pipelineName = $('#pipelineName').val();    
	console.log(_pipelineName);
	
	var url = '/buildstats/job/jobName/'+_pipelineName+'/distinct';
	
	$.getJSON(url, function(jsondata) {
		 console.log("success");
		 }).
			 done(function(jsondata) {
				 $.each(jsondata, function(){
					    jobsList +=  '<option value="' + this + '">' + this + '</option>';		   
					});
					        
					$('#cutOffJobName').html(jobsList);
	});
    
	$(function() {
	    $( "#startDate" ).datepicker();
	  	});	
	$(function() {
		$( "#endDate" ).datepicker();
	});	
	
	
});