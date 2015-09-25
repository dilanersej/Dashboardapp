ReportApp.main = function (params) {

    var baseAddress = 'http://172.20.40.125:7741/MobileReportService.Service.svc/';
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';


    var dataSource = new DevExpress.data.DataSource(baseAddress + "dashboards");


    function graphNavigation(xmlItem) {
        var uri = ReportApp.app.router.format({
            view: 'graph',
            id: xmlItem
        });

        ReportApp.app.navigate(uri);
    }


    var viewModel = {
        dataSource: dataSource,
        itemClicked: function(item)
        {
            graphNavigation(item.itemData);
        }
    };

    return viewModel;
};