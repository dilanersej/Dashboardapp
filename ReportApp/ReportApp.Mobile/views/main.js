ReportApp.main = function (params) {

    var baseAddress = 'http://172.20.40.126:7741/MobileReportService.Service.svc/';


    var dataSource = new DevExpress.data.DataSource({
        load: function (loadOptions) {
            return $.getJSON(baseAddress + "dashboards",
                function (data) {
                    return data;
                });
        }
       
    });


    function graphNavigation(xmlName) {
        var uri = ReportApp.app.router.format({
            view: 'graph',
            id: xmlName
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