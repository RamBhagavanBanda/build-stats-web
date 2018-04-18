$(document).on('ready', function() {
	jobName = $('#jobName').val();
	qJobName= $('#QuarantineJobName').val();
	chartType =  $('#chartType').val();  
	durationType =  $('#durationType').val();
	startDate =  $('#startDate').val();  
	endDate =  $('#endDate').val();
	range =  $('#range').val();
   	createChart();
   	
});




