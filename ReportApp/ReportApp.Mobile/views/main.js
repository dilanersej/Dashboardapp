ReportApp.main = function (params) {

    var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportService/Service/';


    var dataSource = new DevExpress.data.DataSource({
        load: function (loadOptions) {
            return $.getJSON(baseAddress + "/dashboards",
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