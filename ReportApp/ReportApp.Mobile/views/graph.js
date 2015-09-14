ReportApp.graph = function (params) {

    var baseAddress = "http://localhost:8733/Design_Time_Addresses/MobileReportService/Service/";

    var test = $.ajax({
        url: baseAddress + "test/testBoard(ch og dr)",
        type: "GET",
        success: function (xmlObject) {
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.load(xmlObject);
            x = xmlDoc.getElementsByTagName("Items");
            for (i = 0; i < x.length; i++) {
                console.log(x[i].childNodes[0].nodeName);
            }
        },
        error: function (err) {
            console.log("STATUSCODE: " + err.status);
            console.log("RESPONSE: " + err.responseText);
        }
    })

    var viewModel = {

    };

    return viewModel;
};