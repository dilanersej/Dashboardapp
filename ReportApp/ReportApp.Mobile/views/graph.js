ReportApp.graph = function (params) {

    var baseAddress = 'http://172.20.40.125:7741/MobileReportService.Service.svc/';
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';

    var xml;

    //GET DASHBOARD
    var GetDashboard = $.ajax({
        url: baseAddress + 'dashboard/' + params.id.ItemID,
        type: 'GET',
        contentType: 'text/xml',
        success: function (xmlObject) {
            xml = xmlObject;
            var dataSource = GetData(xmlObject);
        },
        error: function (err) {
            DevExpress.ui.notify('Something went wrong, please try again. CODE: ' + err.statusCode, 'error', 3000);
            console.log(err);
        }
    })

    //GET DATA
    function GetData(xmlDoc, userIdInput, passwordInput) {
        console.log(userIdInput + " " + passwordInput);
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

        console.log("LOGIN: " + userId + " " + password);

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
        console.log(tables[0].childNodes);
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

        console.log(xml);
        console.log(query);

        return query;
    }

    //CHECK TYPE
    function CheckType(xmlType, dataSource) {
        //DETECT THE WIDGET TYPE AND CREATE THE WIDGET
        switch (xmlType.nodeName) {
            //CHART
            case 'Chart':
                CreateChart(xmlType, dataSource)
                break;
                //PIE
            case 'Pie':
                CreatePie(xmlType, dataSource);
                break;
                //GAUGE
            case 'Gauge': 
                CreateGauge(xmlType, dataSource)
                break;
                //COMBO BOX
            case 'ComboBox':
                CreateComboBox(xmlType, dataSource);
                break;
            //RANGE FILTER
            //case 'RangeFilter':
            //  CreateRangeFilter(xmlType);
            //  break;
            // LIST BOX
            //case 'ListBox':
            //    CreateListBox(xmlType. dataSource);
            //    break;
            //TREE VIEW
            //case 'TreeView':
            //    CreateTreeView(xmlType, dataSource);
            //    break;
            //GRID
            case 'Grid':
                CreateGrid(xmlType, dataSource);
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

    //CREATE COMBO BOX
    function CreateComboBox(xmlType, jsonArray) {
        console.log(xmlType);
        try{
            var dataItems = xmlType.getElementsByTagName('DataItems')[0].childNodes;
            var filterDimensions = xmlType.getElementsByTagName('FilterDimensions')[0].childNodes;
            var displayExpr = 'display';
            var value = "";
            var comboArray = $.extend(true, [], jsonArray)
            for (l = 0; l < comboArray.length; l++) {
                comboArray[l].display = "";
                for (k = 0; k < filterDimensions.length; k++) {
                    for (j = 0; j < dataItems.length; j++) {
                        if (filterDimensions[k].getAttribute('UniqueName') === dataItems[j].getAttribute('UniqueName')) {
                            comboArray[l].display += comboArray[l][dataItems[j].getAttribute('DataMember')] + ", ";
                            if (k === 0) {
                                value = comboArray[l][dataItems[j].getAttribute('DataMember')];
                            }
                            break;
                        }
                    }
                }
            }

            $('<div class="content-style combo-box">').appendTo('.content').dxSelectBox({
                dataSource: comboArray,
                displayExpr: displayExpr,
                valueExpr: value
            });
        } catch (err){

        }
       
    }

    ////CREATE RANGE FILTER
    //function CreateRangeFilter(xmlType) {
    //     $('<div class="content-style range-selector">').appendTo('.content').dxRangeSelector({
    //        scale: {
    //            startValue: 0,
    //            endValue: 120,
    //            macjorTickInterval: {}
    //        }
    //    })
    //}

    //CREATE LIST BOX
    //function CreateListBox(xmlType, jsonArray) {
    //    for (k = 0; k < jsonArray.length; k++) {
    //        var jsonItem = jsonArray[k];
    //        var value = jsonItem[xmlType.firstChild.lastChild.getAttribute('DataMember')];

    //        $('<div class="content-style list-box">').appendTo('.content').dxList({
    //            dataSource: jsonArray,
    //            showSelectionControls: true,
    //            onSelectionChanged: function (data) {
    //                alert(data);
    //            }
    //        })
    //        return jsonArray;
    //    }
    //}



    ////CREATE TREE VIEW
    //function CreateTreeView(xmlType, jsonArray) {
        //for (k = 0; k < jsonArray.length; k++) {
        //    var jsonItem = jsonArray[k];
        //    var value = jsonItem[xmlType.getElementsByTagName('DataItems')[0].lastChild.getAttribute('DataMember')];
            //var dataItems = xmlType.getElementsByTagName('DataItems')[0].lastChild.getAttribute('DataMember');

            //for (var i = 0; i < 2; i++) {
            //    var dataItem = value[i].firstChild.getAttribute;
            //}

            //var treeViewData = [
            //    { id: 1, parentId: 0, text: "Animals" },
            //    { id: 2, parentId: 1, text: "Cat" },
            //    { id: 3, parentId: 1, text: "Dog" },
            //    { id: 4, parentId: 1, text: "Cow" },
            //    { id: 5, parentId: 2, text: "Abyssinian" },
            //    { id: 6, parentId: 2, text: "Aegean cat" },
            //    { id: 7, parentId: 2, text: "Australian Mist" },
            //    { id: 8, parentId: 3, text: "Affenpinscher" },
            //    { id: 9, parentId: 3, text: "Afghan Hound" },
            //    { id: 10, parentId: 3, text: "Airedale Terrier" },
            //    { id: 11, parentId: 3, text: "Akita Inu" },
            //    { id: 12, parentId: 0, text: "Birds" },
            //    { id: 13, parentId: 12, text: "Akekee" },
            //    { id: 14, parentId: 12, text: "Arizona Woodpecker" },
            //    { id: 15, parentId: 12, text: "Black-chinned Sparrow" }
            //];

            //$('<div class="content-style treeview">').appendTo('.content').dxTreeView({
            //    dataSource: jsonArray,
                //xmlDoc.getElementByTagName("DataMember"),
        //        dataStructure: 'plain'
        //    })
        //}
        
    //}

    //CREATE GRID
    function CreateGrid(xmlType, jsonArray) {
        var columnsList = [];
        var xmlColumns = xmlType.getElementsByTagName('GridColumns')[0].childNodes;
        var xmlDataItems = xmlType.firstChild.childNodes;
        for (j = 0; j < xmlDataItems.length; j++){
            if(xmlDataItems[j].nodeName === 'Dimension'){
                columnsList.push(xmlDataItems[j].getAttribute('DataMember'));
            }
        }
        for (j = 0; j < xmlDataItems.length; j++) {
            if (xmlDataItems[j].nodeName != 'Dimension') {
                columnsList.push(xmlDataItems[j].getAttribute('DataMember'));
            }
        }
        
        $('<div class="content-style grid">').appendTo('.content').dxDataGrid({
            dataSource: jsonArray,
            columns: columnsList,
            paging: {
                pageSize: 5
            },
            rowPrepared: function (rowElement, rowInfo) {
                rowElement.css('background', '#282828');
                rowElement.css('color', '#a1a1a1');
            }

        })
    }

    var viewModel = {
        headline: params.id.Name,
        xmlDoc: ko.observable(""),
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