ReportApp.main = function (params) {

    var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportService/Service/';

    $.getJSON(baseAddress + "/dashboards", function (data) {
        var navItems = [];
        

       for (i = 0; i < data.length; i++) {
            var item = {
                title: data[i],
                onExecute:
                    function () {
                        var uri = ReportApp.app.router.format({
                            view: "graph",
                            id: data[i].substring(0,data[i]-4)
                        })

                        ReportApp.app.navigate(uri);
                    }
            };
            navItems.push(item.title);
        }
        ReportApp.app.navigation = navItems;
    })

    var viewModel = {
//  Put the binding properties here
    };

    return viewModel;
};