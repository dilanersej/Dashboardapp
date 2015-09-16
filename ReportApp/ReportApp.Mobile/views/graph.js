ReportApp.graph = function (params) {

    var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportService/Service/';

    //GET DASHBOARD
    var GetDashboard = $.ajax({
        url: baseAddress + 'dashboard/testBoard(ch og dr)',
        type: 'GET',
        success: function (xmlObject) {
            var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = false;
            xmlDoc.load(xmlObject);
            var dataSource = GetData(xmlDoc);
            x = xmlDoc.getElementsByTagName('Items');
            for (i = 0; i < x.length; i++) {
                CheckType(x[i], dataSource);
            }
        },
        error: function (err) {
            alert("STATUSCODE GET XML: " + err.status);
        }
    })

    //GET DATA
    function GetData(xmlDoc) {
        var query = BuildQuery(xmlDoc);
        x = xmlDoc.getElementsByTagName('Parameters')[0];
        var data = JSON.stringify({
            'CsDTO': {
                'UserID': x.childNodes[5].getAttribute('Value'),
                'Password': x.childNodes[6].getAttribute('Value'),
                'Server': x.childNodes[0].getAttribute('Value'),
                'Database': x.childNodes[1].getAttribute('Value')
            },
            'Query': query
        })
        return dataSource = new DevExpress.data.DataSource({
            load: function (loadOptions) {
                return $.ajax({
                    url: baseAddress + 'data',
                    type: 'POST',
                    data: data,
                    contentType: "application/json; charset=utf-8",
                    success: function (json) {
                        alert(json)
                        console.log(json);
                        return json;
                    }
                })
            }
        })
    }

    //BUILD QUERY
    function BuildQuery(xmlDoc) {
        var columList = [];
        var tableList = [];
        var query = "SELECT";
        var tables = xmlDoc.getElementsByTagName('Table');
        var columns = xmlDoc.getElementsByTagName('Column');
        for (i = 0; i < columns.length; i++) {
            columList[i] = columns[i].getAttribute('Name');
        }

        for (h = 0; h < tables.length; h++){
            for (j = 0; j < columList.length; j++) {
                if (j === 0) {
                    query += " " + tables[h].getAttribute('Name') + "." + columList[j]
                } else {
                    query += ", " + tables[h].getAttribute('Name') + "." + columList[j];
                }
            }
        }

        for (k = 0; k < tables.length; k++){
            tableList[k] = tables[k].getAttribute('Name');
        }

        for (l = 0; l < tableList.length; l++){
            if(l === 0){
                query += " FROM " + tableList[l]
            } else {
                query += ", " + tableList[l]
            }
        }
        alert(query);
        return query;
    }

    //CHECK TYPE
    function CheckType(xmlType, dataSource) {
        //DETECT THE WIDGET TYPE AND CREATE THE WIDGET
        switch (xmlType.childNodes[0].nodeName) {
            //CHART
            case 'Chart':
                CreateChart(xmlType, dataSource)
                break;
    //        //PIE
    //        case 'Pie':
    //            CreatePie(xmlType, dataSource);
    //            break;
    //        //PIVOT
    //        case 'Pivot':
    //            CreatePivot(xmlType);
    //            break;
    //        //GAUGE
    //        case 'Gauge': 
    //            CreateGauge(xmlType)
    //            break;
    //        //COMBO BOX
    //        case 'ComboBox':
    //            CreateComboBox(xmlType);
    //            break;
    //        //RANGE FILTER
    //        case 'RangeFilter':
    //            CreateRangeFilter(xmlType);
    //            break;
    //        //LIST BOX
    //        case 'ListBox':
    //            CreateListBox(xmlType);
    //            break;
    //        //TREE VIEW
    //        case 'TreeView':
    //            CreateTreeView(xmlType);
    //            break;
    //        //GRID
    //        case 'Grid':
    //            CreateGrid(xmlType);
    //            break;
        }
    }

    ////CREATE CHART
    function CreateChart(xmlType, dataSource) {
        alert('DATASOURCE' + dataSource);
        $('#chart').dxChart({
            dataSource: dataSource,
            commomSeriesSettings: {
                argumentField: xmlType.getElementsByTagName('Value')[0].getAttribute('UniqueName'),
                type: 'bar'
            },
            name: xmlType.getAttribute('Name'),
            argumentField: xmlType.firstChild.firstChild.getAttribute('DataMember'),
            valueField: xmlType.firstChild.lastChild.getAttribute('DataMember')

        });
    }

    ////CREATE PIE
    //function CreatePie(xmlType) {
    //    $('#pie').dxPieChart({
    //        dataSource: function () {

    //        },
    //        series: {
    //            argumentField: xmpType.childNodes[1].lastChild.getAttribute('UniqueName'),
    //            valueField: xmlType.lastChild.lastChild.getAttribute('UniqueName'),
    //        }
    //    });
    //}

    ////CREATE PIVOT
    //function CreatePivot(xmlType) {
    //    $('#pivot').dxPivot({
    //        dataSource: function () {

    //        }
    //    });
    //}

    ////CREATE GAUGE
    //function CreateGauge(xmlType) {
    //    if (xmlType.getAttribute('ViewType') === 'LinearVertical') {
    //        $('#gauge').dxLinearGauge({
    //            geomerty: { orientation: 'vertical' },
    //            scale: {
    //                startValue: 0,
    //                endValue: 120,
    //                majorTick: {
    //                    tickInterval: 20
    //                }
    //            },
    //            value: function () {

    //            }
    //        })
    //    } else if (xmlType.getAttribute('ViewType') === 'LinearHorizontal') {
    //        $('#gauge').dxLinearGauge({
    //            scale: {
    //                startValue: 0,
    //                endValue: 120,
    //                majorTick: {
    //                    tickInterval: 20
    //                }
    //            },
    //            value: function () {

    //            }
    //        })
    //    } else {
    //        $('#gauge').dxCircularGauge({
    //            scale: {
    //                startValue: 0,
    //                endValue: 120,
    //                majorTick: {
    //                    tickInterval: 20
    //                }
    //            },
    //            value: function () {

    //            }
    //        })
    //    }
    //}

    ////CREATE COMBO BOX
    //function CreateComboBox(xmlType) {
    //    $('#combobox').dxSelectBox({
    //        dataSource: function () {

    //        },
    //        displayExpr: xmlType.lastChild.lastChild.getAttribute('UniqueName'),
    //        valueExpr: xmlType.childNodes[1].lastChild.getAttribute('UniqueName')
    //    });
    //}

    ////CREATE RANGE FILTER
    //function CreateRangeFilter(xmlType) {
    //    $('rangefilter').dxRangeSelector({
    //        scale: {
    //            startValue: 0,
    //            endValue: 120,
    //            macjorTickInterval: {}
    //        }
    //    })
    //}

    ////CREATE LIST BOX
    //function CreateListBox(xmlType) {

    //}

    ////CREATE TREE VIEW
    //function CreateTreeView(xmlType) {
    //    $('treeview').dxTreeView({
    //        dataSource: function () {

    //        },
    //        dataStructure: 'plain'
    //    })
    //}

    ////CREATE GRID
    //function CreateGrid(xmlType) {

    //}

    var viewModel = {

    };

    return viewModel;
};