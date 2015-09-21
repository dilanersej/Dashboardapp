ReportApp.graph = function (params) {

    var baseAddress = 'http://172.20.40.125:7741/MobileReportService.Service.svc/';

    //GET DASHBOARD
    var GetDashboard = $.ajax({
        url: baseAddress + 'dashboard/' + params.id,
        type: 'GET',
        contentType: 'text/xml',
        success: function (xmlObject) {

            console.log(xmlObject)

            var dataSource = GetData(xmlObject);
            
        },
        error: function (err) {
            alert("STATUSCODE GET XML: " + err.status);
            console.log(err);
        }
    })

    //GET DATA
    function GetData(xmlDoc) {
        var query = BuildQuery(xmlDoc);
        var parameters = xmlDoc.getElementsByTagName('Parameters')[0].childNodes;
        var server = "";
        var database = "";
        var userId = "";
        var password = "";
        for (k = 0; k < parameters.length; k++){
            if(parameters[k].getAttribute('Name') === 'server'){
                server = parameters[k].getAttribute('Value');
            } else if (parameters[k].getAttribute('Name') === 'database') {
                database = parameters[k].getAttribute('Value');
            } else if (parameters[k].getAttribute('Name') === 'userid') {
                userId = parameters[k].getAttribute('Value');
            } else if (parameters[k].getAttribute('Name') === 'password') {
                password = parameters[k].getAttribute('Value');
            }
        }
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
                console.log(i);
                CheckType(x[i], tmpArray);
            }
        })
        .error(function (err) {
            alert("ERROR: " + err.statusCode);
            console.log(err);
        })
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
                    query += " " + tables[h].getAttribute('Name') + "." + tables[h].childNodes[j].getAttribute('Name')
                } else {
                    query += ", " + tables[h].getAttribute('Name') + "." + tables[h].childNodes[j].getAttribute('Name');
                }
            }
        }

        for (k = 0; k < tables.length; k++){
            tableList[k] = tables[k].getAttribute('Name');
        }

        if (xmlDoc.getElementsByTagName('Relation') != null) {
            relations = xmlDoc.getElementsByTagName('Relation');
        }

        query += " FROM " + tableList[tableList.length-1];

        for (k = 0; k < relations.length; k++) {
            query += " JOIN " + relations[k].getAttribute('Parent') + " ON " + relations[k].getAttribute('Nested') + "." + relations[k].firstChild.getAttribute('Nested') + " = " + relations[k].getAttribute('Parent') + "." + relations[k].firstChild.getAttribute('Parent');
        }

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
    //        //RANGE FILTER
    //        case 'RangeFilter':
    //            CreateRangeFilter(xmlType);
    //            break;
    //        //LIST BOX
            //case 'ListBox':
            //    CreateListBox(xmlType. dataSource);
            //    break;
    //        //TREE VIEW
    //        case 'TreeView':
    //            CreateTreeView(xmlType);
    //            break;
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
        var display = xmlType.childNodes[1].firstChild.getAttribute('DataMember');
        var value = xmlType.childNodes[1].lastChild.getAttribute('DataMember');

         $('<div class="content-style combo-box">').appendTo('.content').dxSelectBox({
            dataSource: jsonArray,
            displayExpr: display,
            valueExpr: value
        });
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
    //    $('<div class="content-style list-box">').appendTo('.content').dxList({
    //        dataSource: jsonArray,
    //        showSelectionControls: true,
    //        onSelectionChanged: function (data) {
    //            alert(data);
    //        }
    //    })
    //}

    ////CREATE TREE VIEW
    //function CreateTreeView(xmlType) {
    //    $('<div class="content-style treeview">').appendTo('.content').dxTreeView({
    //        dataSource: function () {

    //        },
    //        dataStructure: 'plain'
    //    })
    //}

    //CREATE GRID
    function CreateGrid(xmlType, jsonArray) {
        var columnsList = [];
        var xmlColumns = xmlType.getElementsByTagName('GridColumns')[0].childNodes;
        var xmlDataItems = xmlType.firstChild.childNodes;
        for (j = 0; j < xmlDataItems.length; j++){
            columnsList.push(xmlDataItems[j].getAttribute('DataMember'));
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

    };

    return viewModel;
};