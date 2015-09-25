ReportApp.graph = function (params) {

    var baseAddress = 'http://172.20.40.125:7741/MobileReportService.Service.svc/';
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';

    var xml;
    var dataSource;

    //GET DASHBOARD
    var GetDashboard = $.ajax({
        url: baseAddress + 'dashboard/' + params.id.ItemID,
        type: 'GET',
        contentType: 'text/xml',
        success: function (xmlObject) {
            xml = xmlObject;
            dataSource = GetData(xmlObject);
        },
        error: function (err) {
            DevExpress.ui.notify('Something went wrong, please try again. CODE: ' + err.statusCode, 'error', 3000);
            console.log(err);
        }
    })

    //GET DATA
    function GetData(xmlDoc, userIdInput, passwordInput) {
        var query = BuildQuery(xmlDoc);
        var parameters = xmlDoc.getElementsByTagName('Parameters')[0].childNodes;
        var server = "";
        var database = "";
        var userId = userIdInput;
        var password = passwordInput;
        for (k = 0; k < parameters.length; k++){
            if(parameters[k].getAttribute('Name') === 'server'){
                server = parameters[k].getAttribute('Value');
            } else if (parameters[k].getAttribute('Name') === 'database') {
                database = parameters[k].getAttribute('Value');
            } else if (parameters[k].getAttribute('Name') === 'userid') {
                if(parameters[k].getAttribute('Value') != ""){
                    userId = parameters[k].getAttribute('Value');
                }
            } else if (parameters[k].getAttribute('Name') === 'password') {
                if (parameters[k].getAttribute('Value') != "") {
                    password = parameters[k].getAttribute('Value');
                }
            }
        }

        if(userId === undefined && password === undefined){
            ObtainLoginCredentials();
        } else {

            var data = JSON.stringify({
                'CsDTO': {
                    'UserID': userId,
                    'Password': password,
                    'Server': server,
                    'Database': database
                },
                'Query': query
            })
            $.ajax({
                url: baseAddress + 'data',
                type: 'POST',
                data: data,
                contentType: "application/json; charset=utf-8"
            })
            .done(function (json) {
                var tmpArray = [];
                var jsonArray = json;
                for (i = 0; i < jsonArray.length; i++) {
                    var item = {};
                    for (j = 0; j < jsonArray[i].length; j++) {
                        item[jsonArray[i][j].Key] = jsonArray[i][j].Value
                    }
                    tmpArray.push(item);
                }
                x = xmlDoc.getElementsByTagName('Items')[0].childNodes;
                for (i = 0; i < x.length; i++) {
                    CheckType(x[i], tmpArray);
                }
            })
            .error(function (err) {
                DevExpress.ui.notify('Something went wrong, please try again. CODE: ' + err.statusCode, 'error', 3000);
                console.log(err.message);
            })
        }
    }

    function ObtainLoginCredentials() {
        viewModel.popUpVisible(true);
    }

    //BUILD QUERY
    function BuildQuery(xmlDoc) {
        var columList = [];
        var tableList = [];
        var query = "SELECT";
        var relations = [];
        var tables = xmlDoc.getElementsByTagName('Table');
        for (h = 0; h < tables.length; h++){
            for (j = 0; j < tables[h].childNodes.length; j++) {
                if (h === 0 && j === 0) {
                    if(tables[h].childNodes[j].getAttribute('Alias') != undefined){
                        query += " [" + tables[h].getAttribute('Name') + "].[" + tables[h].childNodes[j].getAttribute('Name') + "] AS '" + tables[h].childNodes[j].getAttribute('Alias') + "'";
                    } else {
                        query += " [" + tables[h].getAttribute('Name') + "].[" + tables[h].childNodes[j].getAttribute('Name') + "]";
                    }
                } else {
                    if (tables[h].childNodes[j].getAttribute('Alias') != undefined) {
                        query += ", [" + tables[h].getAttribute('Name') + "].[" + tables[h].childNodes[j].getAttribute('Name') + "] AS '" + tables[h].childNodes[j].getAttribute('Alias') + "'";
                    } else {
                        query += ", [" + tables[h].getAttribute('Name') + "].[" + tables[h].childNodes[j].getAttribute('Name') + "]";
                    }
                }
            }
        }

        for (k = 0; k < tables.length; k++){
            tableList[k] = tables[k].getAttribute('Name');
        }

        relations = xmlDoc.getElementsByTagName('Relation');
        if(relations.length != 0){
            query += " FROM [" + relations[0].getAttribute('Parent') + "]";
        } else {
            query += " FROM [" + tableList[tableList.length - 1] + "]";
        }

        var used = {};

        for (k = 0; k < relations.length; k++){
            var keyColumns = relations[k].childNodes;
            var count1 = 0;
            if(!used[k]){
                if (keyColumns.length != 1) {
                    for (j = 0; j < keyColumns.length; j++) {
                        if (count1 === 0) {
                            query += " JOIN [" + relations[k].getAttribute('Nested') + "] ON [" + relations[k].getAttribute('Parent') + "].[" + keyColumns[j].getAttribute('Parent') + "] = [" + relations[k].getAttribute('Nested') + "].[" + keyColumns[j].getAttribute('Nested') + "]";
                            count1 = 1;
                        } else {
                            query += " AND  [" + relations[k].getAttribute('Parent') + "].[" + keyColumns[j].getAttribute('Parent') + "] = [" + relations[k].getAttribute('Nested') + "].[" + keyColumns[j].getAttribute('Nested') + "]";
                        }
                    }
                } else {
                    query += " JOIN [" + relations[k].getAttribute('Nested') + "] ON [" + relations[k].getAttribute('Parent') + "].[" + keyColumns[0].getAttribute('Parent') + "] = [" + relations[k].getAttribute('Nested') + "].[" + keyColumns[0].getAttribute('Nested') + "]";
                    count1 = 1;
                }

                for (l = 0; l < relations.length; l++) {
                    if (relations[k].getAttribute('Nested') === relations[l].getAttribute('Nested') && k != l) {
                        if (!used[l]) {
                            query += " AND  [" + relations[l].getAttribute('Parent') + "].[" + relations[l].firstChild.getAttribute('Parent') + "] = [" + relations[l].getAttribute('Nested') + "].[" + relations[l].firstChild.getAttribute('Nested') + "]";
                            used[l] = 1;
                        }
                    }
                }
                used[k] = 1;
            }
        }

        console.log(query);

        return query;
    }

    //CHECK TYPE
    function CheckType(xmlType, dataSource) {
        //DETECT THE WIDGET TYPE AND CREATE THE WIDGET
        switch (xmlType.nodeName) {
            //CHART
            case 'Chart':
                CreateChart(xmlType, dataSource);
                break;
                //PIE
            case 'Pie':
                CreatePie(xmlType, dataSource);
                break;
                //GAUGE
            case 'Gauge': 
                CreateGauge(xmlType, dataSource);
                break;
            case 'Card':
                CreateCard(xmlType, dataSource);
                break;
        }
    }

    //CREATE CHART 
    function CreateChart(xmlType, jsonArray) {
        var type = "";
        var seriesList = [];
        var title = xmlType.getAttribute('Name')
        
        if (xmlType.lastChild.firstChild.firstChild.firstChild.getAttribute('SeriesType') === null) {
            type = "bar";
        }else {
            type = xmlType.lastChild.firstChild.firstChild.firstChild.getAttribute('SeriesType').toLowerCase();
        }

        if (xmlType.getElementsByTagName('SeriesDimensions')[0] != null) {
            var seriesDimensions = xmlType.getElementsByTagName('SeriesDimensions')[0].childNodes;
            for (k = 0; k < seriesDimensions.length; k++) {
                var name = "";
                var argument = "";
                var dataItems = xmlType.getElementsByTagName('DataItems')[0].childNodes;
                for (l = 0; l < dataItems.length ; l++){
                    if (seriesDimensions[k].getAttribute('UniqueName') === dataItems[l].getAttribute('UniqueName')) {
                        name = dataItems[l].getAttribute('DataMember');
                        argument = name;
                    }
                }
                seriesList.push({ name: name, argumentField:argument, valueField: xmlType.firstChild.getElementsByTagName('Measure')[0].getAttribute("DataMember"), type: type })
            }
        } else {
            seriesList.push({ name: xmlType.firstChild.getElementsByTagName('Measure')[0].getAttribute('DataMember'), argumentField: xmlType.firstChild.getElementsByTagName('Dimension')[0].getAttribute("DataMember"), valueField: xmlType.firstChild.getElementsByTagName('Measure')[0].getAttribute("DataMember"), type: type })
        }
        $('<div class="content-style chart">').appendTo('.content').dxChart({
            dataSource: jsonArray,
            series: seriesList,
            commonSeriesSettings: {
                type: type
            },
            title: {
                text: title,
                font: {
                    color: '#afafaf',
                    size: 18
                }
            },
            size: {
                height: 300
            }
        });
    }

    //CREATE PIE CHART 
    function CreatePie(xmlType, jsonArray) {
        var series = {};
        var value = "";
        var argument = "";
        var title = xmlType.getAttribute('Name');
        var dataItems = xmlType.getElementsByTagName('DataItems')[0].childNodes;

        var argumentUniqueName = xmlType.getElementsByTagName('Arguments')[0].firstChild.getAttribute('UniqueName');
        var valueUniqueName = xmlType.getElementsByTagName('Values')[0].firstChild.getAttribute('UniqueName');

        for (k = 0; k < dataItems.length; k++){
            if(dataItems[k].getAttribute('UniqueName') === argumentUniqueName){
                argument = dataItems[k].getAttribute('DataMember');
            } else if(dataItems[k].getAttribute('UniqueName') === valueUniqueName){
                value = dataItems[k].getAttribute('DataMember');
            }
        }

        series = {
            name: argument,
            argumentField: argument,
            valueField: value,
            label: {
                visible: true,
                connector: {
                    visible: true,
                    width: 1
                }
            }
        };

        $('<div class="content-style pie">').appendTo('.content').dxPieChart({
            dataSource: jsonArray,
            series: series,
            title: {
                text: title,
                font: {
                    color: '#afafaf',
                    size: 18
                }
            },
            onPointClick: function (e) {
                var point = e.target;
                point.isVisible() ? point.hide() : point.show();
            },
            size: {
                height: 300
            }
        });
    }

    //CREATE GAUGE 
    function CreateGauge(xmlType, jsonArray) {

        var endValue = 0;
        for (k = 0; k < jsonArray.length; k++){
            var value = xmlType.firstChild.lastChild.getAttribute('DataMember')
            if(k === 0){
                endValue = jsonArray[k][value];
            } else if(jsonArray[k][value] > endValue){
                endValue = jsonArray[k][value];
            }
        }

        if (xmlType.getAttribute('ViewType') === 'LinearVertical') {
            //VERTICAL GAUGE
            var title = xmlType.getAttribute('Name')
            for (k = 0; k < jsonArray.length; k++) {
                var jsonItem = jsonArray[k];
                var value = jsonItem[xmlType.firstChild.lastChild.getAttribute('DataMember')];
                $('<div class="content-style gauge">').appendTo('.content').dxLinearGauge({
                    geomerty: { orientation: 'vertical' },
                    scale: {
                        startValue: 0,
                        endValue: endValue
                    },
                    value: value,
                    title: {
                        text: title,
                        font: {
                            color: '#afafaf',
                            size: 18
                        }
                    },
                    size: {
                        height: 200
                    }
                })
            }
        } else if (xmlType.getAttribute('ViewType') === 'LinearHorizontal') {
            //HORIZONTAL GAUGE
            var title = xmlType.getAttribute('Name')
            for (k = 0; k < jsonArray.length; k++) {
                var jsonItem = jsonArray[k];
                var value = jsonItem[xmlType.firstChild.lastChild.getAttribute('DataMember')];
                $('<div class="content-style gauge">').appendTo('.content').dxLinearGauge({
                    scale: {
                        startValue: 0,
                        endValue: endValue
                    },
                    value: value,
                    title: {
                        text: title,
                        font: {
                            color: '#afafaf',
                            size: 18
                        }
                    },
                    size: {
                        height: 200
                    }
                })
            }
        } else {
            //CIRCULAR GAUGE
            var title = xmlType.getAttribute('Name')
            for (k = 0; k < jsonArray.length; k++) {
                var jsonItem = jsonArray[k];
                var value = jsonItem[xmlType.firstChild.lastChild.getAttribute('DataMember')];
                $('<div class="content-style gauge">').appendTo('.content').dxCircularGauge({
                    scale: {
                        startValue: 0,
                        endValue: endValue
                    },
                    value: value,
                    title: {
                        text: title,
                        font: {
                            color: '#afafaf',
                            size: 18
                        }
                    },
                    size: {
                        height: 200
                    },
                    valueIndicator: {
                        type: 'triangleNeedle'
                    }
                })
            }
        }
    }

    function CreateCard(xmlType, jsonArray) {
        var dataItems = xmlType.getElementsByTagName('DataItems')[0].childNodes;
        var cards = xmlType.getElementsByTagName('Card');
        for (l = 0; l < cards.length; l++) {
            var actualKey;
            var targetKey;
            var cardValues = xmlType.getElementsByTagName('Card')[l].childNodes;
            var actualValue;
            var targetValue;
            for (k = 0; k < cardValues.length; k++){
                if(cardValues[k].nodeName === 'ActualValue'){
                    for (j = 0; j < dataItems.length; j++){
                        if (cardValues[k].getAttribute('UniqueName') === dataItems[j].getAttribute('UniqueName')) {
                            var hash = {};
                            for (m = 0; m < jsonArray.length; m++) {
                                if(!hash[dataItems[j].getAttribute('DataMember')]){
                                    hash[dataItems[j].getAttribute('DataMember')] = jsonArray[m][dataItems[j].getAttribute('DataMember')];
                                } else {
                                    hash[dataItems[j].getAttribute('DataMember')] += jsonArray[m][dataItems[j].getAttribute('DataMember')];
                                }
                            }
                            actualKey = dataItems[j].getAttribute('DataMember');
                            actualValue = hash[dataItems[j].getAttribute('DataMember')];
                        }
                    }
                } else if (cardValues[k].nodeName === 'TargetValue') {
                    for (j = 0; j < dataItems.length; j++) {
                        if (cardValues[k].getAttribute('UniqueName') === dataItems[j].getAttribute('UniqueName')) {
                            var hash = {};
                            for (m = 0; m < jsonArray.length; m++) {
                                if (!hash[dataItems[j].getAttribute('DataMember')]) {
                                    hash[dataItems[j].getAttribute('DataMember')] = jsonArray[m][dataItems[j].getAttribute('DataMember')];
                                } else {
                                    hash[dataItems[j].getAttribute('DataMember')] += jsonArray[m][dataItems[j].getAttribute('DataMember')];
                                }
                            }
                            targetKey = dataItems[j].getAttribute('DataMember');
                            targetValue = hash[dataItems[j].getAttribute('DataMember')];
                        }
                    }
                }
            }

            var originTarget = targetValue;
            targetValue = actualValue - targetValue;

            var percentage = Math.ceil((targetValue / actualValue * 100) * 100) / 100;

            if (actualValue < originTarget) {
                actualValue = actualValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                targetValue = targetValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                $('<div class="content-style card">').appendTo('.content')
                .html('<div align="center"><h1 class="card-headline">' + actualKey + ' vs. ' + targetKey + '</h1></div><div align="right"><p class="actual">' + actualValue + '</p><p class="percentage-negative percentage"><strong>' + percentage + ' %</strong></p><h2 class="target-negative target"><span class="arrow-down"></span><strong>' + targetValue + '</strong></h2></div>');
            } else if (actualValue > originTarget) {
                actualValue = actualValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                targetValue = targetValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                $('<div class="content-style card">').appendTo('.content')
                .html('<div align="center"><h1 class="card-headline">' + actualKey + ' vs. ' + targetKey + '</h1></div><div align="right"><p class="actual">' + actualValue + '</p><p class="percentage-positive percentage"><strong>+' + percentage + ' %</strong></p><h2 class="target-positive target"><span class="arrow-up"></span><strong>+' + targetValue + '</strong></h2></div>');
            } else {
                actualValue = actualValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                targetValue = targetValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                $('<div class="content-style card">').appendTo('.content')
                .html('<div align="center"><h1 class="card-headline">' + actualKey + ' vs. ' + targetKey + '</h1></div><div align="right"><p class="actual">' + actualValue + '</p><p class="percentage-neutral percentage"><strong>' + percentage + ' %</strong></p><h2 class="target-neutral target"><strong>+' + targetValue + '</strong></h2></div>');
            }
        }
    }

    var viewModel = {
        headline: params.id.Name,
        popUpVisible: ko.observable(false),
        popupClicked: function (params) {
            var result = params.validationGroup.validate();
            if (result.isValid) {
                viewModel.popUpVisible(false);
                GetData(xml, $('#userId').dxTextBox('option', 'value'), $('#password').dxTextBox('option', 'value'));
            }
        }
    };

    return viewModel;
};