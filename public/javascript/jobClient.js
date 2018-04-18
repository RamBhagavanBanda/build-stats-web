$(document).on(
        'ready',
        function() {

            jobName = $('#jobName').val().toLowerCase();
            disableOption("chartType", "TestPassPercentageVsQuarantinedTest");

            $("[id^=QuarantineJobName]").hide();

            if (jobName.indexOf("partnerCentral") > -1
                    || jobName.indexOf("promotion") > -1
                    || jobName.indexOf("reservation") > -1
                    || jobName.indexOf("content") > -1
                    || jobName.indexOf("roomRate") > -1
                    || jobName.indexOf("roomsandrates") > -1
                    || jobName.indexOf("GSO") > -1
                    || jobName.indexOf("marketplace") > -1
                    || jobName.indexOf("partner_central") > -1 ) {

                if ((jobName.indexOf("quarantined") == -1)
                        && ((jobName.indexOf("acceptance") > -1)
                                || (jobName.indexOf("regression") > -1)
                                || (jobName.indexOf("smoke") > -1))) {
                    // $("[id^=QuarantineJobName]").show();
                    var temp = jobName;
                    temp = temp.replace(jobName.split("-")[1], jobName.split("-")[1] + "Quarantined");
                    $('#QuarantineJobName').val(temp);
                    enableOption("chartType", "TestPassPercentageVsQuarantinedTest");
                }
            } else {

                if ((jobName.indexOf("quarantined") == -1)
                        && ((jobName.indexOf("acceptance") > -1)
                                || (jobName.indexOf("regression") > -1)
                                || (jobName.indexOf("smoke") > -1))) {
                    // $("[id^=QuarantineJobName]").show();
                    var temp = jobName;
                    temp = "?";
                    $('#QuarantineJobName').val(temp);
                    enableOption("chartType", "TestPassPercentageVsQuarantinedTest");
                }
            }

            // date picker intialization
            $(function() {
                $("#startDate").datepicker();
            });
            $(function() {
                $("#endDate").datepicker();
            });

            $('#chartType').change(function() {
                selectedOption = $(this).val();
                verifyAndChangeDurationType(selectedOption);
                verifyAndQuarantineSection(selectedOption);
            });

            $('#startDate').change(function() {
                console.log($(this).val());
            });
            $('#endDate').change(function() {
                console.log($(this).val());
            });

        });

function verifyAndQuarantineSection(selectedOption) {
    if (selectedOption == "TestPassPercentageVsQuarantinedTest") {
        $("[id^=QuarantineJobName]").show();
        // $('#durationType').val("BOB");
    } else {
        $("[id^=QuarantineJobName]").hide();
    }
}

function verifyAndChangeDurationType(selectedOption) {
    if (selectedOption == "TestPassPercentageVsQuarantinedTest") {
        disableOption("durationType", "DOD");
        disableOption("durationType", "WOW");
        $('#durationType').val("BOB");
    } else {
        enableOption("durationType", "DOD");
        enableOption("durationType", "WOW");
    }

    if ((selectedOption == "BuildGreenPercentage") 
            || (selectedOption == "BuildRedPercentage")
            || (selectedOption == "TotalNumberOfBuilds")) {
        disableOption("durationType", "BOB");
        $('#durationType').val("DOD");
    } else {
        enableOption("durationType", "BOB");
    }
}

function disableOption(listId, optionValue) {
    $('#' + listId + ' option[value="' + optionValue + '"]').attr('disabled', 'disabled');
}

function enableOption(listId, optionValue) {
    $('#' + listId + ' option[value="' + optionValue + '"]').removeAttr('disabled');

}

function addDays(theDate, days) {
    return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}
