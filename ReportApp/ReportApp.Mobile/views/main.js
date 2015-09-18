ReportApp.main = function (params) {

    var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportService/Service/';


    var dataSource = new DevExpress.data.DataSource({
        load: function (loadOptions) {
            return $.getJSON(baseAddress + "/dashboards",
                function (data) {
                    var navItems = [];
                    var subItems = [];
                    //navItems.concat(data);
                    for (i = 0; i < data.length; i++){
                       subItems = navItems.push(data[i])
                        subItems.splice(data[i]-4)
                    }
                    return subItems;
                });
        }

    });




    var viewModel = {
        dataSource: dataSource
    };

    return viewModel;
};