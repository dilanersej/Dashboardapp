ReportApp.graph = function (params) {

    var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportService/Service/';

    var connectionString = "";

    //GET DASHBOARD
    var GetDashboard = $.ajax({
        url: baseAddress + 'dashboard/testBoard(ch og dr)',
        type: 'GET',
        success: function (xmlObject) {
            var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = false;
            xmlDoc.load(xmlObject);
            SetConnectionString(xmlDoc);
            alert(xmlDoc.xml);
            //GET DATA
            var dataSource = new DevExpress.data.DataSource({
                load: function (loadOptions) {
                    return $.ajax({
                        url: baseAddress + '/data',
                        type: 'POST',
                        data: JSON.stringify({
                            'ConnectionString': connectionString,
                            'Data': xmlDoc.getElementsByTagName('ResultSchema').firstChild.firstChild
                        }),
                        success: function (data) {
                            alert(data);
                            return data;
                        },
                        error: function (err) {
                            alert("STATUSCODE: " + err.status + " | RESPONSE: " + err.responseText);
                        }
                    })
                }
            })
            //x = xmlDoc.getElementsByTagName('Items');
            //for (i = 0; i < x.length; i++) {
            //    CheckType(x[i]);
            //}
        },
        error: function (err) {
            alert("STATUSCODE: " + err.status + " | RESPONSE: " + err.responseText);
        }
    })

    //SET CONNECTION STRING
    function SetConnectionString(xml) {
        x = xml.getElementsByTagName('Parameters')
            
        connectionString = JSON.Stringify({
            'UserId': x.childNodes[5].getAttribute('Value'),
            'Password': x.childNode[6].getAttribute('Value'),
            'Server': x.childNode[0].getAttribute('Value'),
            'Database': x.childNode[1].getAttribute('Value')
        })

        alert(connectionString);
    }

    

    //CHECK TYPE
    //function CheckType(xmlType){
    //    //DETECT THE WIDGET TYPE AND CREATE THE WIDGET
    //    switch(xmlType.childNodes[0].nodeName){
    //        //CHART
    //        case 'Chart':
    //           CreateChart(xmlType)
    //            break;
    //        //PIE
    //        case 'Pie':
    //            CreatePie(xmlType);
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
    //    }
    //}

    ////CREATE CHART
    //function CreateChart(xmlType) {
    //    $('#chart').dxChart({
    //        dataSource: function () {
    //            $.ajax({
    //                url: baseAddress + "chart",
    //                type: "POST",
    //                contentType: 'text/xml'
    //            })
    //        },
    //        commomSeriesSettings: {
    //            argumentField: xmlType.getElementsByTagName('Value').getAttribute('UniqueName'),
    //            type: type
    //        },
    //        name: xmlType.getAttribute('Name'),
    //        argumentField: xmlType.firstChild.firstChild.getAttribute('DataMember'),
    //        valueField: xmlType.firstChild.lastChild.getAttribute('DataMember')

    //    });
    //}

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