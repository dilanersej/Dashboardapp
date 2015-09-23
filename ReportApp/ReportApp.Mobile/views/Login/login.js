ReportApp.login = function (params) {

    //var baseAddress = 'http://172.20.40.125:7741/MobileReportService.Service.svc/';
    var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';

    window.loggedInUser = null;
    ReportApp.config.navigation[1].visible(false);
    ReportApp.config.navigation[2].visible(false);
    ReportApp.config.navigation[3].visible(true);

    function Login(username, password) {
        $.getJSON(baseAddress + 'users/' + username)
        .done(function (data) {
            if(data.Code === -1){
                DevExpress.ui.notify('Something went wrong. Please try again!', 'error', 3000);
            } else if(data.Code === -2){
                DevExpress.ui.notify('User not found. Please try again!', 'error', 3000);
            }

            if(data.Password != password){
                DevExpress.ui.notify('Incorrect username or password. Please try again!', 'error', 3000);
            } else {
                window.loggedInUser = data;
                DevExpress.ui.notify('Welcome back ' + data.Username, 'success', 5000);
                ReportApp.config.navigation[1].visible(true);
                ReportApp.config.navigation[2].visible(true);
                ReportApp.config.navigation[3].visible(false);
                ReportApp.app.navigate({
                    view: 'main'
                });
            }
        })
        .error(function (err) {
            DevExpress.ui.notify('Something went wrong. Please try again! CODE: ' + err.statusCode, 'error', 3000);
        })
    }

    var viewModel = {
        loginClicked: function (params) {
            var result = params.validationGroup.validate();
            if(result.isValid){
                Login($('#username').dxTextBox('option', 'value'), $('#password').dxTextBox('option', 'value'));
            }
        },
        newLoginClicked: function () {
            ReportApp.app.navigate({
                view: 'loginNew'
            });
        }
    };

    return viewModel;
};