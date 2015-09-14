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
                CheckType(x[i]);
            }
        },
        error: function (err) {
            console.log("STATUSCODE: " + err.status);
            console.log("RESPONSE: " + err.responseText);
        }
    })

    function CheckType(xmlType){
        var type;
        if(xmlType.lastChild.lastChild.lastChild.lastChild.lastChild.getAttribute('SeriesType') === "undefined"){
            type = "Bar";
        } else{
            type = xmlType.lastChild.lastChild.lastChild.lastChild.lastChild.getAttribute('SeriesType');
        }
        switch(xmlType.childNodes[0].nodeName){
            case "Chart":
                $("#chart").dxChart({
                    commomSeriesSettings: {
                        argumentField: xmlType.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.getAttribute('UniqueName'),
                        type: type
                    },
                    name: xmlType.getAttribute('Name'),

                });
                break;
            case "StackedSplineArea":
                $("#chart").dxChart({
                    dataSource: datasource,
                    commomSeriesSettings: {
                        argumentField: xmlType.lastChild.lastChild.lastChild.lastChild.lastChild.lastChild.getAttribute('UniqueName'),
                        type: type
                    },
                    name: xmlType.getAttribute('Name'),
                    argumentField: xmlType.firstChild.firstChild.getAttribute('DataMember'),
                    valueField: xmlType.firstChild.lastChild.getAttribute('DataMember')
                });
        }
    }

    var viewModel = {

    };

    return viewModel;
};