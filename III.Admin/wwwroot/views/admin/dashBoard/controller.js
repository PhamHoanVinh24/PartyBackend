var ctxfolderDashBoard = "/views/admin/dashBoard";
var ctxfolderFilePlugin = "/views/admin/filePlugin";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_DASHBOARD', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber']).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
    });
app.factory('dataserviceDashBoard', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }

        $http(req).then(callback);
    };
    return {
        getCountProject: function (callback) {
            $http.get('/Admin/DashBoard/GetCountProject').then(callback);
        },
        amchartCountBuy: function (callback) {
            $http.get('/Admin/DashBoard/AmchartCountBuy').then(callback);
        },
        amchartCountSale: function (callback) {
            $http.get('/Admin/DashBoard/AmchartCountSale').then(callback);
        },
        amchartWorkFlow: function (callback) {
            $http.get('/Admin/DashBoard/AmchartWorkFlow/').then(callback);
        },
        AmchartPieSale: function (data, callback) {
            $http.post('/Admin/DashBoard/AmchartPieSale/', data).then(callback);
        },
        AmchartCountCustomers: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountCustomers').then(callback);
        },
        AmchartCountSupplier: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountSupplier').then(callback);
        },
        AmchartPieCustomers: function (data, callback) {
            $http.post('/Admin/DashBoard/AmchartPieCustomers/', data).then(callback);
        },
        AmchartPieSupplier: function (data, callback) {
            $http.post('/Admin/DashBoard/AmchartPieSupplier/', data).then(callback);
        },
        AmchartCountProject: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountProject').then(callback);
        },
        AmchartPieProject: function (data, callback) {
            $http.post('/Admin/DashBoard/AmchartPieProject/', data).then(callback);
        },
        AmchartCountEmployees: function (callback) {
            $http.post('/Admin/DashBoard/AmchartCountEmployees').then(callback);
        },
        getWorkFlow: function (callback) {
            $http.post('/Admin/DashBoard/GetWorkFlow').then(callback);
        },
        getCardInBoard: function (data, callback) {
            $http.post('/Admin/DashBoard/GetCardInBoard?ObjCode=' + data).then(callback);
        },
        getSystemLog: function (data, callback) {
            $http.get('/Admin/DashBoard/GetSystemLog?type=' + data).then(callback);
        },
        getStaffKeeping: function (data, callback) {
            $http.post('/MapOnline/GetStaffKeeping/', data).then(callback);
        },
        getObjTypeJC: function (callback) {
            $http.get('/Admin/DashBoard/GetObjTypeJC').then(callback);
        },
        getObjTypeCode: function (data, callback) {
            $http.post('/Admin/CardJob/GetObjFromObjType?code=' + data).then(callback);
        },
        highchartFunds: function (callback) {
            $http.post('/Admin/DashBoard/HighchartFunds').then(callback);
        },
        highchartProds: function (callback) {
            $http.post('/Admin/DashBoard/HighchartProds').then(callback);
        },
        highchartAssets: function (data, callback) {
            $http.post('/Admin/DashBoard/highchartAssets', data).then(callback);
        },
        highchartPieAssets: function (data, callback) {
            $http.post('/Admin/DashBoard/GetAssetType', data).then(callback);
        },
        getAssetType: function (callback) {
            $http.post('/Admin/Asset/GetAssetType').then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/User/GetDepartment/').then(callback);
        },
        getGroupUser: function (callback) {
            $http.post('/Admin/User/GetGroupUser/').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/User/GetListUser/').then(callback);
        },
        getRouteInOut: function (data, callback) {
            $http.post('/Admin/DashBoard/GetRouteInOut/', data).then(callback);
        },
        getCmsItemLastest: function (callback) {
            $http.get('/Admin/DashBoard/GetCmsItemLastest/').then(callback);
        },
        viewFileCms: function (data, data1, callback) {
            $http.post('/Admin/DashBoard/ViewFileCms?mode=' + data + '&url=' + data1).then(callback);
        },
        amchartProject: function (callback) {
            $http.get('/Admin/DashBoard/AmchartProject/').then(callback);
        },
        getCountCardWork: function (callback) {
            $http.get('/Admin/DashBoard/GetCountCardWork/').then(callback);
        },
        getActionCardWork: function (callback) {
            $http.get('/Admin/DashBoard/GetActionCardWork/').then(callback);
        },
        amchartCardWork: function (callback) {
            $http.get('/Admin/DashBoard/AmchartCardWork/').then(callback);
        },
        getCountSale: function (callback) {
            $http.get('/Admin/DashBoard/GetCountSale/').then(callback);
        },
        getCountBuyer: function (callback) {
            $http.get('/Admin/DashBoard/GetCountBuyer/').then(callback);
        },
        getActionUser: function (callback) {
            $http.get('/Admin/DashBoard/GetActionUser/').then(callback);
        },
        getBranAndDepartment: function (callback) {
            $http.get('/Admin/DashBoard/GetBranAndDepartment/').then(callback);
        },
        countAction: function (callback) {
            $http.get('/Admin/DashBoard/CountAction/').then(callback);
        },
        getCountWorkFlow: function (callback) {
            $http.get('/Admin/DashBoard/GetCountWorkFlow/').then(callback);
        },
        getCountAsset: function (callback) {
            $http.get('/Admin/DashBoard/GetCountAsset/').then(callback);
        },
        amchartAsset: function (callback) {
            $http.get('/Admin/DashBoard/AmchartAsset/').then(callback);
        },
        getGroupUser: function (callback) {
            $http.get('/Admin/DashBoard/GetGroupUser/').then(callback);
        },
        getActionUserGroup: function (callback) {
            $http.get('/Admin/DashBoard/GetActionUserGroup/').then(callback);
        },
        getActionCustomer: function (callback) {
            $http.get('/Admin/DashBoard/GetActionCustomer/').then(callback);
        },
        getCountCustomer: function (callback) {
            $http.get('/Admin/DashBoard/GetCountCustomer/').then(callback);
        },
        amchartCustomer: function (callback) {
            $http.get('/Admin/DashBoard/AmchartCustomer/').then(callback);
        },
        getActionSupplier: function (callback) {
            $http.get('/Admin/DashBoard/GetActionSupplier/').then(callback);
        },
        getCountSupplier: function (callback) {
            $http.get('/Admin/DashBoard/GetCountSupplier/').then(callback);
        },
        amchartSupplier: function (callback) {
            $http.get('/Admin/DashBoard/AmchartSupplier/').then(callback);
        },
        getCountFunds: function (callback) {
            $http.get('/Admin/DashBoard/GetCountFunds/').then(callback);
        },
        getActionFunds: function (callback) {
            $http.get('/Admin/DashBoard/GetActionFunds/').then(callback);
        },
        amchartFunds: function (callback) {
            $http.get('/Admin/DashBoard/AmchartFunds/').then(callback);
        },
        saveDashboardDataJson: function (data, callback) {
            $http.post('/Admin/DashBoard/SaveDashboardDataJson/', data).then(callback);
        },
        getDataJson: function (callback) {
            $http.get('/Admin/DashBoard/GetDataJson/').then(callback);
        },
        getCountFile: function (callback) {
            $http.get('/Admin/DashBoard/GetCountFile/').then(callback);
        },
        getActionFile: function (callback) {
            $http.get('/Admin/DashBoard/GetActionFile/').then(callback);
        },
        amchartFile: function (callback) {
            $http.get('/Admin/DashBoard/AmchartFile/').then(callback);
        },

        //View file
        getCmsIdBookmark: function (data, callback) {
            $http.post('/Admin/SettingUserguide/GetItem?helpId=' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },

        getContentCms: function (data, callback) {
            $http.get('/Admin/UserManual/GetContentCms?id=' + data).then(callback);
        },
    };
});

app.filter("fomartDateTime", function ($filter) {
    return function (date) {
        var dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
        var createDate = $filter('date')(new Date(date), 'dd/MM/yyyy');
        if (dateNow == createDate) {
            var today = new Date();
            var created = new Date(date);
            var diffMs = (today - created);
            var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            if (diffHrs <= 0) {
                if (diffMins <= 0) {
                    return 'Vừa xong';
                } else {
                    return diffMins + ' phút trước';
                }
            } else {
                return diffHrs + ' giờ ' + diffMins + ' phút trước.';
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});

app.controller('Ctrl_ESEIM_DASHBOARD', function ($scope, $rootScope, $compile, $uibModal, dataserviceDashBoard, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.IsTranslate = true;
    });

    $rootScope.user = {
        UserOnline: 0,
        PercentUserOnline: 0,
        UserActive: 0
    };

    $rootScope.listDepartment = [];
    $rootScope.listGroupUser = [];
    $rootScope.listUser = [];

    dataserviceDashBoard.getGroupUser(function (rs) {
        rs = rs.data;
        $rootScope.listGroupUser = rs;
    });

    dataserviceDashBoard.getUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/DashBoard/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderDashBoard + '/index.html',
            controller: 'indexDashBoard'
        })
        .when('/map', {
            templateUrl: ctxfolderDashBoard + '/google-map.html',
            controller: 'google-map'
        })


    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function (error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else if (element.prop('type') === 'radio' && element.parent('.radio-inline').length) {
                error.insertAfter(element.parent().parent());
            } else if (element.prop('type') === 'checkbox' || element.prop('type') === 'radio') {
                error.appendTo(element.parent().parent());
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        success: function (label) {
            label.closest('.form-group').removeClass('has-error');
        }
    });
});

app.controller('indexDashBoard', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceDashBoard, $filter, $translate) {
    //$('.menu-toggle').addClass('hidden');
    //$(".content-wrapper").removeClass("padding-right-80");
    $(".content-wrapper").addClass("pt-0");
    $scope.hasPermissionViewChartFund = PERMISSION_FUND.viewChart;
    $scope.hasPermissionViewActionFund = PERMISSION_FUND.viewActionFund;
    $scope.hasPermissionViewCountFund = PERMISSION_FUND.viewCountFund;

    $scope.hasPermissionViewCountFile = PERMISSION_FILE.viewCountFile;
    $scope.hasPermissionViewChartFile = PERMISSION_FILE.viewChartFile;
    $scope.hasPermissionViewActionFile = PERMISSION_FILE.viewActionFile;

    $scope.hasPermissionViewChartAsset = PERMISSION_ASSET.viewChartAsset;
    $scope.hasPermissionViewCountAsset = PERMISSION_ASSET.viewCountAsset;

    //Box employee
    $scope.viewActionEmployee = PERMISSION_EMPLOYEE.viewActionEmployee;
    $scope.viewDiagram = PERMISSION_EMPLOYEE.viewDiagram;

    //Box CMS
    $scope.viewCMS = PERMISSION_CMS.viewCMS;

    //Box group
    $scope.viewActionGroup = PERMISSION_GROUP.viewActionGroup;

    //Box project
    $scope.viewChartProj = PERMISSION_PROJECT.viewChartProj;
    $scope.viewCountProj = PERMISSION_PROJECT.viewCountProj;

    //Box card
    $scope.viewActionCard = PERMISSION_CARD.viewActionCard;
    $scope.viewChartCard = PERMISSION_CARD.viewChartCard;
    $scope.viewCountCard = PERMISSION_CARD.viewCountCard;

    //Box customer
    $scope.viewActionCus = PERMISSION_CUS.viewActionCus;
    $scope.viewChartCus = PERMISSION_CUS.viewChartCus;
    $scope.viewCountCus = PERMISSION_CUS.viewCountCus;

    //Box supplier
    $scope.viewActionSupp = PERMISSION_SUPP.viewActionSupp;
    $scope.viewChartSupp = PERMISSION_SUPP.viewChartSupp;
    $scope.viewCountSupp = PERMISSION_SUPP.viewCountSupp;

    //Box buyer
    $scope.viewChartBuyer = PERMISSION_BUYER.viewChartBuyer;
    $scope.viewCountBuyer = PERMISSION_BUYER.viewCountBuyer;

    //Box sale
    $scope.viewChartSale = PERMISSION_SALE.viewChartSale;
    $scope.viewCountSale = PERMISSION_SALE.viewCountSale;

    //Box Workflow
    $scope.viewChartWF = PERMISSION_WORKFLOW.viewChartWF;
    $scope.viewCountWF = PERMISSION_WORKFLOW.viewCountWF;


    //Default show dashboard, hide IOT, hide in out
    $scope.dashboard = true;
    $scope.iot = false;
    $scope.inOut = false;
    $scope.Dashboard = function () {
        if (!$scope.dashboard) {
            $scope.dashboard = true;
            $scope.iot = false;
            $scope.inOut = false;
        }
    }
    var count = 1;
    $scope.reload = function () {
        $('.content-wrapper').toggleClass('demoscreen');
        $('.app-content').toggleClass('demoscreen');
        $('.border-box-dashboard').toggleClass('demobox');
        $('.boxdeu').toggleClass('demobox');
        $('.text-content-box-act-emp').toggleClass('text-content-box-act-emp-demo');
        $('.text-header-box-act-employee').toggleClass('text-header-box-act-employee-demo');
        $('.text-header-box').toggleClass('text-header-box-demo');
        $('.color-text-cms').toggleClass('color-text-cms-demo');
        $('.txtAction').toggleClass('txtAction-demo');
        $('.txtName').toggleClass('txtName-demo');
        $('h4').toggleClass('h42');
        if (count == 1) {
            $('rect.Object_Label').css('fill', '#fff');
            $('text.draw2d_shape_basic_Label.txt1').css('fill', '#000');
            $('text.draw2d_shape_basic_Label.txt2').css('fill', '#000');
            $('text.draw2d_shape_basic_Label.txt3').css('fill', '#000');
            $('text.draw2d_shape_basic_Label.txt5').css('fill', '#000');
            $('text.draw2d_shape_basic_Label.txt6').css('fill', '#000');

            count = 2;
        }
        else {
            $('rect.Object_Label').css('fill', '#000');
            $('text.draw2d_shape_basic_Label.txt1').css('fill', '#fff');
            $('text.draw2d_shape_basic_Label.txt2').css('fill', 'lime');
            $('text.draw2d_shape_basic_Label.txt3').css('fill', 'red');
            $('text.draw2d_shape_basic_Label.txt5').css('fill', 'grey');
            $('text.draw2d_shape_basic_Label.txt6').css('fill', '#00adef');
            count = 1;
        }
    }

    $scope.viewIOT = function () {
        if (!$scope.iot) {
            $scope.dashboard = false;
            $scope.iot = true;
            $scope.inOut = false;
        }
        else {
            $scope.dashboard = true;
            $scope.inOut = false;
            $scope.iot = false;
        }
    }

    $scope.viewInOut = function () {
        if (!$scope.inOut) {
            $scope.dashboard = false;
            $scope.iot = false;
            $scope.inOut = true;
            showTime();
        }
        else {
            $scope.dashboard = true;
            $scope.iot = false;
            $scope.inOut = false;
        }
    }

    //Box action user-department, canvas department, cms

    $scope.lstFigure = [];

    $scope.initDataFor3BoxFirst = function () {
        dataserviceDashBoard.getActionUser(function (rs) {
            rs = rs.data;
            $scope.lstActEmployee = rs;
        });
        dataserviceDashBoard.getCmsItemLastest(function (rs) {
            rs = rs.data;
            $scope.lstCms = rs;
            for (var i = 0; i < $scope.lstCms.length; i++) {
                for (var j = 0; j < $scope.lstCms[i].ListFile.length; j++) {
                    var typeFile = $scope.lstCms[i].ListFile[j].FileTypePhysic;

                    switch (typeFile) {
                        case '.mp4':
                            $scope.lstCms[i].ListFile[j].Icon = 'fa fa-video-camera';
                            break;

                        case '.mp3':
                            $scope.lstCms[i].ListFile[j].Icon = 'fa fa-file-audio-o';
                            break;

                        case '.docx':
                            $scope.lstCms[i].ListFile[j].Icon = 'fa fa-file-word-o';
                            break;

                        case '.xls':
                        case '.xlsx':
                            $scope.lstCms[i].ListFile[j].Icon = 'fa fa-file-excel-o';
                            break;

                        case '.pdf':
                            $scope.lstCms[i].ListFile[j].Icon = 'fa fa-file-pdf-o';
                            break;

                        case '.ppt':
                        case '.pptx':
                            $scope.lstCms[i].ListFile[j].Icon = 'fa fa-file-powerpoint-o';
                            break;

                        case '.zip':
                        case '.rar':
                            $scope.lstCms[i].ListFile[j].Icon = 'fa fa-file-archive-o';
                            break;

                        case '.jpg':
                        case '.png':
                            $scope.lstCms[i].ListFile[j].Icon = 'fa fa-file-image-o';
                            break;

                        default:
                            $scope.lstCms[i].ListFile[j].Icon = 'fa fa-file';
                            break;
                    }
                }
            }
        })
        var LabelConnection = draw2d.Connection.extend({
            init: function () {
                this._super();
                var auto = new Connection_Label({

                });
                auto.attr({
                    text: "Auto",
                    width: 20,
                    height: 1,
                    bgColor: "white",
                    cssClass: "auto",
                    radius: 3
                });
                //this.add(auto, new draw2d.layout.locator.PolylineMidpointLocator(), 1000000);
                var dell = new draw2d.shape.basic.Image({
                    path: "/images/workflowActivity/delete.png",
                    color: "#27ae60",
                    fontColor: "#0d0d0d",
                    bgColor: "#ffffff",
                    stroke: 1,
                    height: 25,
                    width: 25,
                    y: -30,
                    x: 20,
                    visible: false
                });
                auto.add(dell, new draw2d.layout.locator.Locator());
                var setting = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/setting.png", height: 25, width: 25, stroke: 1, x: -10, y: -30, visible: false, cssClass: "settinglabel" });
                auto.add(setting, new draw2d.layout.locator.Locator());
                var that = this;
                that.setCssClass("connect");
                auto.installEditor(new draw2d.ui.LabelInplaceEditor({ width: 1 }));
                dell.on("click", function () {
                    $scope.deleteSettingWF();
                    canvas2.remove(that);
                });
                auto.on("click", function () {
                    if (dell.isVisible() == false) {
                        dell.attr({
                            visible: true
                        });
                        setting.attr({
                            visible: true
                        });
                    } else {
                        dell.attr({
                            visible: false
                        });
                        setting.attr({
                            visible: false
                        });
                    }
                });
                this.attr({
                    cssClass: "path",
                    router: new draw2d.layout.connection.InteractiveManhattanConnectionRouter(),
                    outlineStroke: 1,
                    outlineColor: "#303030",
                    stroke: 2,
                    color: "lime",
                    radius: 4,
                });

                this.installEditPolicy(new draw2d.policy.figure.DragDropEditPolicy());
                setting.on("click", function () {
                    $scope.settingTransition();
                })
            },
            getPersistentAttributes: function () {
                var memento = this._super();

                // add all decorations to the memento 
                //
                memento.labels = [];
                this.children.each(function (i, e) {
                    var labelJSON = e.figure.getPersistentAttributes();
                    labelJSON.locator = e.locator.NAME;
                    memento.labels.push(labelJSON);
                });

                return memento;
            },
            setPersistentAttributes: function (memento) {
                this._super(memento);

                this.resetChildren();

                $.each(memento.labels, $.proxy(function (i, json) {
                    // create the figure stored in the JSON
                    var figure = eval("new " + json.type + "()");

                    // apply all attributes
                    figure.attr(json);

                    // instantiate the locator
                    var locator = eval("new " + json.locator + "()");

                    // add the new figure as child to this figure
                    this.add(figure, locator);
                }, this));
            }
        });
        var Object_Label = draw2d.shape.basic.Rectangle.extend({
            NAME: "Object_Label",
            init: function () {
                this._super();
            },
            getPersistentAttributes: function () {
                var memento = this._super();

                // add all decorations to the memento 
                //
                memento.labels = [];
                this.children.each(function (i, e) {
                    var labelJSON = e.figure.getPersistentAttributes();
                    labelJSON.locator = e.locator.NAME;
                    memento.labels.push(labelJSON);
                });

                return memento;
            },
            setPersistentAttributes: function (memento) {
                this._super(memento);

                // remove all decorations created in the constructor of this element
                //
                this.resetChildren();

                // and add all children of the JSON document.
                //
                $.each(memento.labels, $.proxy(function (i, json) {
                    // create the figure stored in the JSON
                    var figure = eval("new " + json.type + "()");

                    // apply all attributes
                    figure.attr(json);

                    // instantiate the locator
                    var locator = eval("new " + json.locator + "()");

                    // add the new figure as child to this figure
                    this.add(figure, locator);
                }, this));
            }
        });
        var Reader = draw2d.io.Reader.extend({
            NAME: "draw2d.io.json.Reader",
            init: function () {
                this._super();
            },
            unmarshal: function (canvas, json) {
                var _this = this;
                var result = new draw2d.util.ArrayList();

                if (typeof json === "string") {
                    json = JSON.parse(json);
                }
                var node = null;
                for (var i = 0; i < json.length; i++) {
                    $.each(json, $.proxy(function (i, element) {
                        try {
                            if (element.type == "Object_Label") {
                                element.type = "Object_Label";
                                var o = _this.createFigureFromType(element.type);
                            }
                            else {
                                var o = _this.createFigureFromType(element.type);
                            }
                            var source = null;
                            var target = null;
                            for (i in element) {
                                var val = element[i];
                                if (i === "source") {
                                    node = canvas.getFigure(val.node);
                                    if (node === null) {
                                        throw "Source figure with id '" + val.node + "' not found";
                                    }
                                    source = node.getPort(val.port);
                                    if (source === null) {
                                        throw "Unable to find source port '" + val.port + "' at figure '" + val.node + "' to unmarschal '" + element.type + "'";
                                    }
                                } else if (i === "target") {
                                    node = canvas.getFigure(val.node);
                                    if (node === null) {
                                        throw "Target figure with id '" + val.node + "' not found";
                                    }
                                    target = node.getPort(val.port);
                                    if (target === null) {
                                        throw "Unable to find target port '" + val.port + "' at figure '" + val.node + "' to unmarschal '" + element.type + "'";
                                    }
                                }
                            }
                            if (source !== null && target !== null) {
                                // don't change the order or the source/target set.
                                // TARGET must always be the second one because some applications needs the "source"
                                // port in the "connect" event of the target.
                                o.setSource(source);
                                o.setTarget(target);
                            }
                            o.setPersistentAttributes(element);
                            canvas.add(o);
                            att = result.add(o);
                        } catch (exc) {
                            debug.error(element, "Unable to instantiate figure type '" + element.type + "' with id '" + element.id + "' during unmarshal by " + this.NAME + ". Skipping figure..");
                            debug.error(exc);
                            debug.warn(element);
                        }
                    }, this));

                    // restore group assignment
                    //
                    $.each(json, $.proxy(function (i, element) {
                        if (typeof element.composite !== "undefined") {
                            var figure = canvas.getFigure(element.id);
                            if (figure === null) {
                                figure = canvas.getLine(element.id);
                            }
                            var group = canvas.getFigure(element.composite);
                            group.assignFigure(figure);
                        }
                    }, this));

                    // recalculate all crossings and repaint the connections with 
                    // possible crossing decoration
                    canvas.calculateConnectionIntersection();
                    canvas.getLines().each(function (i, line) {
                        line.svgPathString = null;
                        line.repaint();
                    });
                    canvas.linesToRepaintAfterDragDrop = canvas.getLines().clone();

                    canvas.showDecoration();

                    return result;

                    canvas.remove(result);
                }
            },
            createFigureFromType: function (type) {
                return eval("new " + type + "()");
            }
        });
        var canvas = new draw2d.Canvas("gfx_holder_svg");
        $scope.canvas = canvas;
        var canvas3 = new draw2d.Canvas("gfx_holder_svg1");
        canvas.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {

            }
        });
        canvas3.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {
                displayJSON(canvas3);
            }
        });
        function displayJSON(canvas) {
            var writer = new draw2d.io.json.Writer();
            writer.marshal(canvas, function (json) {
                $("#json").text(JSON.stringify(json, null, 2));
                $scope.shapeData = json;
            });
        }

        $scope.SaveJsonData = function (objType) {
            if (objType == "EMPlOYEE") {
                displayJSON(canvas);
                var obj = {
                    ObjectType: objType,
                    DataJson: JSON.stringify($scope.shapeData),
                };
                dataserviceDashBoard.saveDashboardDataJson(obj, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                })
            }
            if (objType == "GROUPUSER") {
                displayJSON(canvas3);
                var obj = {
                    ObjectType: objType,
                    DataJson: JSON.stringify($scope.shapeData),
                };
                dataserviceDashBoard.saveDashboardDataJson(obj, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                })
            }


        }
        canvas.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
            createConnection: function (sourcePort, targetPort) {
                var itemmmm = new LabelConnection();
                itemmmm.setSourceDecorator(new draw2d.decoration.connection.BarDecorator());
                itemmmm.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
                return itemmmm;
            }
        }));

        setTimeout(function () {
            dataserviceDashBoard.getDataJson(function (rs) {
                rs = rs.data;
                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].ObjectType == "EMPlOYEE") {
                        if (rs[i].DataJson != "" && rs[i].DataJson != null && rs[i].DataJson != undefined && JSON.parse(rs[i].DataJson).length != 0) {
                            var userJson = JSON.parse(rs[i].DataJson);
                        }
                        else {
                            dataserviceDashBoard.getBranAndDepartment(function (rs) {
                                debugger
                                rs = rs.data;
                                $rootScope.LstOrg = rs.LstOrg;
                                $rootScope.LstDepartment = rs.LstDepartment;
                                var x = 50;
                                var y = 100;
                                for (var j = 0; j < $rootScope.LstOrg.length; j++) {
                                    var figure1 = new Object_Label({});
                                    canvas.add(figure1, x, y);
                                    figure1.attr({
                                        width: 140,
                                        height: 40,
                                        x: 100,
                                        y: 80,
                                        bgColor: "#1A1A1A",
                                        stroke: 0.05,
                                        color: "#fff"
                                    });
                                    figure1.setId($rootScope.LstOrg[j].Code);
                                    figure1.setMinWidth(140);
                                    figure1.setMinHeight(40);
                                    x = x + 200;
                                    if (x > 750) {
                                        x = 50;
                                        y = y + 150;
                                    }
                                    count++;
                                    var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/center.svg", height: 100, width: 75, stroke: 1, x: 20, y: -50, visible: true });
                                    figure1.add(icon, new draw2d.layout.locator.Locator());
                                    var txt1 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_CHART_TEXT_SUM + " : " + $rootScope.LstOrg[j].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                    txt1.setWidth(150);
                                    txt1.addCssClass("txt1");
                                    var txt2 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_IN + " : " + $rootScope.LstOrg[j].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                    txt2.setWidth(150);
                                    txt2.addCssClass("txt2");
                                    $rootScope.ActDate = txt2;
                                    var txt3 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_NO_WORK + " : " + $rootScope.LstOrg[j].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                    txt3.setWidth(150);
                                    txt3.addCssClass("txt3");
                                    var txt5 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_LATE + " : " + $rootScope.LstOrg[j].Late, height: 10, x: 70, y: 20, stroke: 0 });
                                    txt5.setWidth(150);
                                    txt5.addCssClass("txt5");
                                    var txt6 = new draw2d.shape.basic.Label({ text: "" + $rootScope.LstOrg[j].Name, height: 10, x: 20, y: -60, stroke: 0 });
                                    txt6.setWidth(150);
                                    txt6.addCssClass("txt6");
                                    ////////////add text in activity///////////
                                    figure1.add(txt1, new draw2d.layout.locator.Locator());
                                    figure1.add(txt2, new draw2d.layout.locator.Locator());
                                    figure1.add(txt3, new draw2d.layout.locator.Locator());
                                    figure1.add(txt5, new draw2d.layout.locator.Locator());
                                    figure1.add(txt6, new draw2d.layout.locator.Locator());
                                    figure1.createPort("output");

                                    $scope.lstFigure.push(figure1);

                                    figure1.on('move', function () {
                                        if (figure1.getAbsoluteX() > 400 && figure1.getAbsoluteX() < 1500) {
                                            $("#gfx_holder_svg").css({ left: (-figure1.getAbsoluteX() + 400) });
                                            figure1.setX(figure1.getAbsoluteX());
                                        }
                                        if (figure1.getAbsoluteY() > 400 && figure1.getAbsoluteY() < 1500) {
                                            $("#gfx_holder_svg").css({ top: (-figure1.getAbsoluteX() + 100) });
                                            console.log(figure1.getAbsoluteY());
                                            figure1.setY(figure1.getAbsoluteY());
                                        }
                                    })
                                    for (var i = 0; i < $rootScope.LstDepartment.length; i++) {
                                        debugger
                                        if ($rootScope.LstOrg[j].Code == $rootScope.LstDepartment[i].OrgCode) {
                                            var figure = new Object_Label({});
                                            canvas.add(figure, x, y);
                                            figure.attr({
                                                width: 140,
                                                height: 40,
                                                x: 100,
                                                y: 100,
                                                bgColor: "#1A1A1A",
                                                stroke: 0.05,
                                                color: "#fff"
                                            });
                                            figure.setId($rootScope.LstDepartment[i].IdSvg);
                                            figure.setMinWidth(140);
                                            figure.setMinHeight(40);
                                            figure.setX(x);
                                            figure.setY(y);
                                            x = x + 200;
                                            if (x > 750) {
                                                x = 50;
                                                y = y + 150;
                                            }
                                            count++;
                                            var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/vanphong.svg", height: 100, width: 75, stroke: 1, x: 20, y: -65, visible: true });
                                            figure.add(icon, new draw2d.layout.locator.Locator());
                                            var txt1 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_CHART_TEXT_SUM + " : " + $rootScope.LstDepartment[i].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                            txt1.setWidth(150);
                                            txt1.addCssClass("txt1");
                                            var txt2 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_IN + " : " + $rootScope.LstDepartment[i].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                            txt2.setWidth(150);
                                            txt2.addCssClass("txt2");
                                            var txt3 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_NO_WORK + " : " + $rootScope.LstDepartment[i].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                            txt3.setWidth(150);
                                            txt3.addCssClass("txt3");
                                            var txt5 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_LATE + " : " + $rootScope.LstDepartment[i].Late, height: 10, x: 70, y: 20, stroke: 0 });
                                            txt5.setWidth(150);
                                            txt5.addCssClass("txt5");
                                            var txt6 = new draw2d.shape.basic.Label({ text: "" + $rootScope.LstDepartment[i].Name, height: 10, x: 15, y: -70, stroke: 0 });
                                            txt6.setWidth(150);
                                            txt6.addCssClass("txt6");
                                            ////////////add text in activity///////////
                                            figure.add(txt1, new draw2d.layout.locator.Locator());
                                            figure.add(txt2, new draw2d.layout.locator.Locator());
                                            figure.add(txt3, new draw2d.layout.locator.Locator());
                                            figure.add(txt5, new draw2d.layout.locator.Locator());
                                            figure.add(txt6, new draw2d.layout.locator.Locator());
                                            figure.createPort("input");
                                            $scope.lstFigure.push(figure);

                                            var c = new LabelConnection();
                                            c.setSourceDecorator(new draw2d.decoration.connection.BarDecorator());
                                            c.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
                                            c.setTarget(figure.getInputPort(0));
                                            c.setSource(figure1.getOutputPort(0));
                                            canvas.add(c);
                                        }
                                    }

                                    var node = $scope.canvas.getPrimarySelection();
                                }
                            });
                        }
                        var checkdepartment = [];
                        var checkdepartment2 = [];
                        dataserviceDashBoard.getBranAndDepartment(function (res) {
                            for (var t = 0; t < userJson.length; t++) {
                                if (userJson[t].type == "Object_Label") {
                                    checkdepartment.push(userJson[t].id);
                                }
                            }
                            res = res.data;
                            $rootScope.LstOrg = res.LstOrg;
                            $rootScope.LstDepartment = res.LstDepartment;
                            var x = 50;
                            var y = 100;
                            var count = 0;
                            for (var j = 0; j < $rootScope.LstOrg.length; j++) {
                                checkdepartment2.push($rootScope.LstOrg[j].Code);
                                for (var k = 0; k < $rootScope.LstDepartment.length; k++) {
                                    if ($rootScope.LstOrg[j].Code == $rootScope.LstDepartment[k].OrgCode) {
                                        checkdepartment2.push($rootScope.LstDepartment[k].IdSvg);
                                    }
                                }
                            }
                            for (var m = 0; m < checkdepartment.length; m++) {
                                if (checkdepartment2.indexOf(checkdepartment[m]) == -1) {
                                    for (var t = 0; t < userJson.length; t++) {
                                        if (userJson[t].id == checkdepartment[m]) {
                                            userJson.splice(t, 1);
                                        }
                                    }
                                }
                            }
                            var reader = new Reader();
                            reader.unmarshal(canvas, userJson);
                            setTimeout(function () {

                                $('.parent_svg').draggable();
                                $('.draw2d_shape_basic_Image').mousedown(function () {
                                    var node = canvas.getPrimarySelection();
                                    $('.parent_svg').draggable({ disabled: true });
                                });
                                $('.draw2d_shape_basic_Image').mouseup(function () {
                                    $('.parent_svg').draggable({ disabled: false });
                                });
                                $('.draw2d_shape_basic_Label').mousedown(function () {
                                    $('.parent_svg').draggable({ disabled: true });
                                });
                                $('.draw2d_shape_basic_Label').mouseup(function () {
                                    $('.parent_svg').draggable({ disabled: false });
                                });

                            }, 1000);
                            displayJSON(canvas);
                            for (var j = 0; j < $rootScope.LstOrg.length; j++) {
                                var node1 = canvas.getFigure($rootScope.LstOrg[j].Code);
                                if (node1 != null) {
                                    node1.children.data[1].figure.attr({
                                        text: caption.DB_LBL_CHART_TEXT_SUM + " :" + $rootScope.LstOrg[j].Total
                                    });
                                    node1.children.data[2].figure.attr({
                                        text: caption.DB_LBL_IN + " : " + $rootScope.LstOrg[j].CheckIn
                                    });
                                    node1.children.data[3].figure.attr({
                                        text: caption.DB_LBL_NO_WORK + " : " + $rootScope.LstOrg[j].OffWork
                                    });
                                    node1.children.data[4].figure.attr({
                                        text: caption.DB_LBL_LATE + " : " + $rootScope.LstOrg[j].Late
                                    });
                                    node1.children.data[5].figure.attr({
                                        text: "" + $rootScope.LstOrg[j].Name
                                    });
                                }
                                if (checkdepartment.indexOf($rootScope.LstOrg[j].Code) == -1 || node1 == null) {
                                    var figure1 = new Object_Label({});
                                    canvas.add(figure1, x, y);
                                    figure1.attr({
                                        width: 140,
                                        height: 40,
                                        x: 100,
                                        y: 80,
                                        bgColor: "#1A1A1A",
                                        stroke: 0.05,
                                        color: "#fff"
                                    });
                                    figure1.setId($rootScope.LstOrg[j].Code);
                                    figure1.setMinWidth(140);
                                    figure1.setMinHeight(40);
                                    figure1.setX(x);
                                    figure1.setY(y);
                                    x = x + 200;
                                    if (x > 750) {
                                        x = 50;
                                        y = y + 150;
                                    }
                                    count++;
                                    var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/center.svg", height: 80, width: 60, stroke: 1, x: 10, y: 0, visible: true });
                                    figure1.add(icon, new draw2d.layout.locator.TopLocator());



                                    var txt1 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_CHART_TEXT_SUM + " : " + $rootScope.LstOrg[j].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                    txt1.setWidth(150);
                                    txt1.addCssClass("txt1");
                                    var txt2 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_IN + " : " + $rootScope.LstOrg[j].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                    txt2.setWidth(150);
                                    txt2.addCssClass("txt2");
                                    $rootScope.ActDate = txt2;
                                    var txt3 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_NO_WORK + " : " + $rootScope.LstOrg[j].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                    txt3.setWidth(150);
                                    txt3.addCssClass("txt3");
                                    var txt5 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_LATE + " : " + $rootScope.LstOrg[j].Late, height: 10, x: 70, y: 20, stroke: 0 });
                                    txt5.setWidth(150);
                                    txt5.addCssClass("txt5");
                                    var txt6 = new draw2d.shape.basic.Label({ text: "" + $rootScope.LstOrg[j].Name, height: 10, x: 35, y: -90, stroke: 0 });
                                    txt6.setWidth(150);
                                    txt6.addCssClass("txt6");
                                    ////////////add text in activity///////////
                                    figure1.add(txt1, new draw2d.layout.locator.Locator());
                                    figure1.add(txt2, new draw2d.layout.locator.Locator());
                                    figure1.add(txt3, new draw2d.layout.locator.Locator());
                                    figure1.add(txt5, new draw2d.layout.locator.Locator());
                                    figure1.add(txt6, new draw2d.layout.locator.Locator());
                                    figure1.createPort("output");
                                }
                                for (var k = 0; k < $rootScope.LstDepartment.length; k++) {
                                    var node2 = canvas.getFigure($rootScope.LstDepartment[k].IdSvg);
                                    node2.children.data[1].figure.attr({
                                        text: caption.DB_LBL_CHART_TEXT_SUM + " : " + $rootScope.LstDepartment[k].Total
                                    });
                                    node2.children.data[2].figure.attr({
                                        text: caption.DB_LBL_IN + " : " + $rootScope.LstDepartment[k].CheckIn
                                    });
                                    node2.children.data[3].figure.attr({
                                        text: caption.DB_LBL_NO_WORK + " : " + $rootScope.LstDepartment[k].OffWork
                                    });
                                    node2.children.data[4].figure.attr({
                                        text: caption.DB_LBL_LATE + " : " + $rootScope.LstDepartment[k].Late
                                    });
                                    node2.children.data[5].figure.attr({
                                        text: "" + $rootScope.LstDepartment[k].Name
                                    });
                                    if (checkdepartment.indexOf($rootScope.LstDepartment[k].IdSvg) == -1 && $rootScope.LstOrg[j].Code == $rootScope.LstDepartment[k].OrgCode) {
                                        var figure = new Object_Label({});
                                        canvas.add(figure, x, y);
                                        figure.attr({
                                            width: 140,
                                            height: 40,
                                            x: 100,
                                            y: 100,
                                            bgColor: "#1A1A1A",
                                            stroke: 0.05,
                                            color: "#fff"
                                        });
                                        figure.setId($rootScope.LstDepartment[k].IdSvg);
                                        figure.setMinWidth(140);
                                        figure.setMinHeight(40);
                                        figure.setX(x);
                                        figure.setY(y);
                                        x = x + 200;
                                        if (x > 750) {
                                            x = 50;
                                            y = y + 150;
                                        }
                                        count++;
                                        var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/vanphong.svg", height: 100, width: 80, stroke: 1, x: 10, y: -105, visible: true });
                                        figure.add(icon, new draw2d.layout.locator.Locator());
                                        var txt1 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_CHART_TEXT_SUM + "Tổng : " + $rootScope.LstDepartment[k].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                        txt1.setWidth(150);
                                        txt1.addCssClass("txt1");
                                        var txt2 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_IN + " : " + $rootScope.LstDepartment[k].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                        txt2.setWidth(150);
                                        txt2.addCssClass("txt2");
                                        var txt3 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_NO_WORK + " : " + $rootScope.LstDepartment[k].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                        txt3.setWidth(150);
                                        txt3.addCssClass("txt3");
                                        var txt5 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_LATE + " : " + $rootScope.LstDepartment[k].Late, height: 10, x: 70, y: 20, stroke: 0 });
                                        txt5.setWidth(150);
                                        txt5.addCssClass("txt5");
                                        var txt6 = new draw2d.shape.basic.Label({ text: "" + $rootScope.LstDepartment[k].Name, height: 10, x: 20, y: -100, stroke: 0 });
                                        txt6.setWidth(150);
                                        txt6.addCssClass("txt6");
                                        ////////////add text in activity///////////
                                        figure.add(txt1, new draw2d.layout.locator.Locator());
                                        figure.add(txt2, new draw2d.layout.locator.Locator());
                                        figure.add(txt3, new draw2d.layout.locator.Locator());
                                        figure.add(txt5, new draw2d.layout.locator.Locator());
                                        figure.add(txt6, new draw2d.layout.locator.Locator());
                                        figure.createPort("input");
                                        var c = new LabelConnection();
                                        c.setSourceDecorator(new draw2d.decoration.connection.BarDecorator());
                                        c.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
                                        c.setTarget(figure.getInputPort(0));
                                        c.setSource(figure1.getOutputPort(0));
                                        canvas.add(c);

                                    }
                                }
                            }


                        })
                    }
                    if (rs[i].ObjectType == "GROUPUSER") {
                        if (rs[i].DataJson != "" && rs[i].DataJson != null && rs[i].DataJson != undefined && JSON.parse(rs[i].DataJson).length != 0) {
                            var GroupData = JSON.parse(rs[i].DataJson);
                        }
                        else {
                            dataserviceDashBoard.getGroupUser(function (rs) {
                                rs = rs.data;
                                $rootScope.LstGroup = rs.LstGroup;
                                var x = 50;
                                var y = 100;
                                var count = 0;
                                for (var j = 0; j < $rootScope.LstGroup.length; j++) {
                                    var figure1 = new Object_Label({});
                                    canvas3.add(figure1, x, y);
                                    figure1.attr({
                                        width: 140,
                                        height: 40,
                                        x: 100,
                                        y: 80,
                                        bgColor: "#1A1A1A",
                                        stroke: 0.05,
                                        color: "#fff"
                                    });
                                    figure1.setId($rootScope.LstGroup[j].Code);
                                    figure1.setMinWidth(140);
                                    figure1.setMinHeight(40);
                                    figure1.setX(x);
                                    figure1.setY(y);
                                    x = x + 200;
                                    if (x > 750) {
                                        x = 50;
                                        y = y + 150;
                                    }
                                    count++;
                                    var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/groupuser.svg", height: 35, width: 45, stroke: 1, x: 40, y: -40, visible: true });
                                    figure1.add(icon, new draw2d.layout.locator.Locator());
                                    var txt1 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_CHART_TEXT_SUM + " :" + $rootScope.LstGroup[j].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                    txt1.setWidth(150);
                                    txt1.addCssClass("txt1");
                                    var txt2 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_IN + " :" + $rootScope.LstGroup[j].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                    txt2.setWidth(150);
                                    txt2.addCssClass("txt2");
                                    $rootScope.ActDate = txt2;
                                    var txt3 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_NO_WORK + " :" + $rootScope.LstGroup[j].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                    txt3.setWidth(150);
                                    txt3.addCssClass("txt3");
                                    var txt5 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_LATE + " : " + $rootScope.LstGroup[j].Late, height: 10, x: 70, y: 20, stroke: 0 });
                                    txt5.setWidth(150);
                                    txt5.addCssClass("txt5");
                                    var txt6 = new draw2d.shape.basic.Label({ text: "" + $rootScope.LstGroup[j].Name, height: 10, x: 15, y: -60, stroke: 0 });
                                    txt6.setWidth(150);
                                    txt6.addCssClass("txt6");
                                    ////////////add text in activity///////////
                                    figure1.add(txt1, new draw2d.layout.locator.Locator());
                                    figure1.add(txt2, new draw2d.layout.locator.Locator());
                                    figure1.add(txt3, new draw2d.layout.locator.Locator());
                                    figure1.add(txt5, new draw2d.layout.locator.Locator());
                                    figure1.add(txt6, new draw2d.layout.locator.Locator());
                                }
                            });
                        }
                        var checkgroup = [];
                        var checkgroup2 = [];
                        dataserviceDashBoard.getGroupUser(function (res) {
                            for (var t = 0; t < GroupData.length; t++) {
                                if (GroupData[t].type == "Object_Label") {
                                    checkgroup.push(GroupData[t].id);
                                }
                            }
                            res = res.data;
                            $rootScope.LstGroup = res.LstGroup;
                            var x = 50;
                            var y = 100;
                            var count = 0;
                            for (var j = 0; j < $rootScope.LstGroup.length; j++) {
                                checkgroup2.push($rootScope.LstGroup[j].Code);
                            }
                            for (var m = 0; m < checkgroup.length; m++) {
                                if (checkgroup2.indexOf(checkgroup[m]) == -1) {
                                    for (var t = 0; t < GroupData.length; t++) {
                                        if (GroupData[t].id == checkgroup[m]) {
                                            GroupData.splice(t, 1);
                                        }
                                    }
                                }
                            }
                            var reader = new Reader();
                            reader.unmarshal(canvas3, GroupData);
                            setTimeout(function () {

                                $('.parent_svg').draggable();
                                $('.draw2d_shape_basic_Image').mousedown(function () {
                                    var node = canvas.getPrimarySelection();
                                    $('.parent_svg').draggable({ disabled: true });
                                });
                                $('.draw2d_shape_basic_Image').mouseup(function () {
                                    $('.parent_svg').draggable({ disabled: false });
                                });
                                $('.draw2d_shape_basic_Label').mousedown(function () {
                                    $('.parent_svg').draggable({ disabled: true });
                                });
                                $('.draw2d_shape_basic_Label').mouseup(function () {
                                    $('.parent_svg').draggable({ disabled: false });
                                });

                            }, 1000);
                            displayJSON(canvas3);
                            for (var k = 0; k < $rootScope.LstGroup.length; k++) {
                                if (checkgroup.indexOf($rootScope.LstGroup[k].Code) == -1) {
                                    var figure1 = new Object_Label({});
                                    canvas3.add(figure1, x, y);
                                    figure1.attr({
                                        width: 140,
                                        height: 40,
                                        x: 100,
                                        y: 80,
                                        bgColor: "#1A1A1A",
                                        stroke: 0.05,
                                        color: "#fff"
                                    });
                                    figure1.setId($rootScope.LstGroup[k].Code);
                                    figure1.setMinWidth(140);
                                    figure1.setMinHeight(40);
                                    figure1.setX(x);
                                    figure1.setY(y);
                                    x = x + 200;
                                    if (x > 750) {
                                        x = 50;
                                        y = y + 150;
                                    }
                                    count++;
                                    var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/groupuser.svg", height: 60, width: 75, stroke: 1, x: 30, y: -65, visible: true });
                                    figure1.add(icon, new draw2d.layout.locator.Locator());
                                    var txt1 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_CHART_TEXT_SUM + " :" + $rootScope.LstGroup[k].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                    txt1.setWidth(150);
                                    txt1.addCssClass("txt1");
                                    var txt2 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_IN + " :" + $rootScope.LstGroup[k].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                    txt2.setWidth(150);
                                    txt2.addCssClass("txt2");
                                    var txt3 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_NO_WORK + " :" + $rootScope.LstGroup[k].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                    txt3.setWidth(150);
                                    txt3.addCssClass("txt3");
                                    var txt5 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_LATE + " : " + $rootScope.LstGroup[k].Late, height: 10, x: 70, y: 20, stroke: 0 });
                                    txt5.setWidth(150);
                                    txt5.addCssClass("txt5");
                                    var txt6 = new draw2d.shape.basic.Label({ text: "" + res.LstGroup[k].Name, height: 10, x: 20, y: -90, stroke: 0 });
                                    txt6.setWidth(150);
                                    txt6.addCssClass("txt6");
                                    ////////////add text in activity///////////
                                    figure1.add(txt1, new draw2d.layout.locator.Locator());
                                    figure1.add(txt2, new draw2d.layout.locator.Locator());
                                    figure1.add(txt3, new draw2d.layout.locator.Locator());
                                    figure1.add(txt5, new draw2d.layout.locator.Locator());
                                    figure1.add(txt6, new draw2d.layout.locator.Locator());
                                }
                                var node = canvas3.getFigure($rootScope.LstGroup[k].Code);
                                node.children.data[1].figure.attr({
                                    text: caption.DB_LBL_CHART_TEXT_SUM + " : " + $rootScope.LstGroup[k].Total
                                });
                                node.children.data[2].figure.attr({
                                    text: caption.DB_LBL_IN + " : " + $rootScope.LstGroup[k].CheckIn
                                });
                                node.children.data[3].figure.attr({
                                    text: caption.DB_LBL_NO_WORK + " : " + $rootScope.LstGroup[k].OffWork
                                });
                                node.children.data[4].figure.attr({
                                    text: caption.DB_LBL_LATE + " : " + $rootScope.LstGroup[k].Late
                                });
                                node.children.data[5].figure.attr({
                                    text: "" + $rootScope.LstGroup[k].Name
                                });
                            }

                        });
                    }
                }
            })
            function rs() {
                var figure = new draw2d.shape.basic.Rectangle({ width: 140, height: 40, x: 100, y: 100, bgColor: "#1A1A1A", stroke: 0.05, color: "#fff" });
                canvas.add(figure);
                figure.setMinWidth(140);
                figure.setMinHeight(40);
                var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/vanphong.svg", height: 160, width: 120, stroke: 1, x: 10, y: -105, visible: true });
                figure.add(icon, new draw2d.layout.locator.Locator());
                var txt1 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_CHART_TEXT_SUM + " : 100", height: 10, x: 0, y: 0, stroke: 0 });
                txt1.setWidth(150);

                txt1.addCssClass("txt1");
                $rootScope.ActName = txt1;

                var txt2 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_IN + " : 100", height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                txt2.setWidth(150);

                txt2.addCssClass("txt2");
                $rootScope.ActDate = txt2;

                var txt3 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_NO_WORK + " : 100", height: 10, x: 0, y: 20, stroke: 0 });
                txt3.setWidth(150);

                txt3.addCssClass("txt3");

                var txt5 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_LATE + " :100", height: 10, x: 70, y: 20, stroke: 0 });
                txt5.setWidth(150);

                txt5.addCssClass("txt5");
                var txt6 = new draw2d.shape.basic.Label({ text: caption.DB_LBL_DEPARTMENT_SALE, height: 10, x: 20, y: -100, stroke: 0 });
                txt6.setWidth(150);

                txt6.addCssClass("txt6");

                ////////////add text in activity///////////

                figure.add(txt1, new draw2d.layout.locator.Locator());
                figure.add(txt2, new draw2d.layout.locator.Locator());
                figure.add(txt3, new draw2d.layout.locator.Locator());
                figure.add(txt5, new draw2d.layout.locator.Locator());
                figure.add(txt6, new draw2d.layout.locator.Locator());

                figure.createPort("output");
                figure.createPort("input");
            }
        }, 10);
    }

    $scope.initDataFor3BoxFirst();

    //Box action user-group, canvas group, project
    $scope.initDataBoxGroupProj = function () {
        dataserviceDashBoard.getActionUserGroup(function (rs) {
            rs = rs.data;
            $scope.groupUsers = rs;
        });
        dataserviceDashBoard.getCountProject(function (rs) {
            rs = rs.data;
            $scope.countProject = rs.Sumproject;
            $scope.numProjectPending = rs.ProjectPending;
            $scope.numProjectsuccess = rs.ProjectSuccess;
            $scope.numProjectcancel = rs.ProjectCancel;
            $scope.sumMoney = (rs.Summoney).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            $scope.sumMonrydepending = (rs.Summoneydepend).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            $scope.sumMoneySucess = (rs.Summoneysucess).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            $scope.sumMoneyCancel = (rs.Summoneycancel).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        });
    }

    $scope.initDataBoxGroupProj();

    $scope.initBoxCard = function () {
        dataserviceDashBoard.getActionCardWork(function (rs) {
            rs = rs.data;
            $scope.lstActCardJob = rs;
        })

        dataserviceDashBoard.getCountCardWork(function (rs) {
            rs = rs.data;

            $scope.sumCardWork = rs.sumCardWork;
            $scope.cardWorkPending = rs.cardWorkPending;
            $scope.cardWorkSuccess = rs.cardWorkSuccess;
            $scope.cardWorkcancel = rs.cardWorkcancel;
            $scope.cardWorkExpires = rs.cardWorkExpires;
        })
    }

    $scope.initBoxCard();

    $scope.initData = function () {
        window.tabler = {
            colors: {
                'blue': '#467fcf',
                'blue-darkest': '#0e1929',
                'blue-darker': '#1c3353',
                'blue-dark': '#3866a6',
                'blue-light': '#7ea5dd',
                'blue-lighter': '#c8d9f1',
                'blue-lightest': '#edf2fa',
                'azure': '#45aaf2',
                'azure-darkest': '#0e2230',
                'azure-darker': '#1c4461',
                'azure-dark': '#3788c2',
                'azure-light': '#7dc4f6',
                'azure-lighter': '#c7e6fb',
                'azure-lightest': '#ecf7fe',
                'indigo': '#6574cd',
                'indigo-darkest': '#141729',
                'indigo-darker': '#282e52',
                'indigo-dark': '#515da4',
                'indigo-light': '#939edc',
                'indigo-lighter': '#d1d5f0',
                'indigo-lightest': '#f0f1fa',
                'purple': '#a55eea',
                'purple-darkest': '#21132f',
                'purple-darker': '#42265e',
                'purple-dark': '#844bbb',
                'purple-light': '#c08ef0',
                'purple-lighter': '#e4cff9',
                'purple-lightest': '#f6effd',
                'pink': '#f66d9b',
                'pink-darkest': '#31161f',
                'pink-darker': '#622c3e',
                'pink-dark': '#c5577c',
                'pink-light': '#f999b9',
                'pink-lighter': '#fcd3e1',
                'pink-lightest': '#fef0f5',
                'red': '#e74c3c',
                'red-darkest': '#2e0f0c',
                'red-darker': '#5c1e18',
                'red-dark': '#b93d30',
                'red-light': '#ee8277',
                'red-lighter': '#f8c9c5',
                'red-lightest': '#fdedec',
                'orange': '#fd9644',
                'orange-darkest': '#331e0e',
                'orange-darker': '#653c1b',
                'orange-dark': '#ca7836',
                'orange-light': '#feb67c',
                'orange-lighter': '#fee0c7',
                'orange-lightest': '#fff5ec',
                'yellow': '#f1c40f',
                'yellow-darkest': '#302703',
                'yellow-darker': '#604e06',
                'yellow-dark': '#c19d0c',
                'yellow-light': '#f5d657',
                'yellow-lighter': '#fbedb7',
                'yellow-lightest': '#fef9e7',
                'lime': '#7bd235',
                'lime-darkest': '#192a0b',
                'lime-darker': '#315415',
                'lime-dark': '#62a82a',
                'lime-light': '#a3e072',
                'lime-lighter': '#d7f2c2',
                'lime-lightest': '#f2fbeb',
                'green': '#5eba00',
                'green-darkest': '#132500',
                'green-darker': '#264a00',
                'green-dark': '#4b9500',
                'green-light': '#8ecf4d',
                'green-lighter': '#cfeab3',
                'green-lightest': '#eff8e6',
                'teal': '#2bcbba',
                'teal-darkest': '#092925',
                'teal-darker': '#11514a',
                'teal-dark': '#22a295',
                'teal-light': '#6bdbcf',
                'teal-lighter': '#bfefea',
                'teal-lightest': '#eafaf8',
                'cyan': '#17a2b8',
                'cyan-darkest': '#052025',
                'cyan-darker': '#09414a',
                'cyan-dark': '#128293',
                'cyan-light': '#5dbecd',
                'cyan-lighter': '#b9e3ea',
                'cyan-lightest': '#e8f6f8',
                'gray': '#868e96',
                'gray-darkest': '#1b1c1e',
                'gray-darker': '#36393c',
                'gray-dark': '#6b7278',
                'gray-light': '#aab0b6',
                'gray-lighter': '#dbdde0',
                'gray-lightest': '#f3f4f5',
                'gray-dark': '#343a40',
                'gray-dark-darkest': '#0a0c0d',
                'gray-dark-darker': '#15171a',
                'gray-dark-dark': '#2a2e33',
                'gray-dark-light': '#717579',
                'gray-dark-lighter': '#c2c4c6',
                'gray-dark-lightest': '#ebebec'
            }
        };

        dataserviceDashBoard.amchartProject(function (rs) {
            rs = rs.data;
            month = [];
            sum = ['sum'];
            suc = ['success'];
            pend = ['pend'];
            cancel = ['cancel'];
            for (var i = 0; i < rs.length; i++) {
                sum.push(rs[i].sum);
                suc.push(rs[i].success);
                pend.push(rs[i].pending);
                cancel.push(rs[i].cancel);
                month.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }

            setTimeout(function () {

                var chart = c3.generate({

                    bindto: '#chart-area-in', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sum,
                            suc,
                            pend,
                            cancel,

                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],
                            'success': tabler.colors["pink"],
                            'pend': tabler.colors["red"],
                            'cancel': tabler.colors["yellow"],
                            //'data5': tabler.colors["white"],

                        },
                        names: {
                            // name of each serie
                            'sum': caption.DB_LBL_TOTAL_NUMBER,
                            'success': caption.DB_LBL_FINISH,
                            'pend': caption.DB_LBL_PROCESSING,
                            'cancel': caption.DB_LBL_CANCEL,
                            //'data5': 'Hủy bỏ',
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: month
                        },
                        y: {
                            tick: {
                                format: function (x) {
                                    if (x != Math.floor(x)) {
                                        var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                            var text = d3.select(this).select('text').text();
                                            return +text === x;
                                        }).style('opacity', 0);
                                        return '';
                                    }
                                    return x;
                                }
                            }
                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 100);
        });

        dataserviceDashBoard.amchartCardWork(function (rs) {
            rs = rs.data;
            monthcard = [];
            sumcard = ['sum'];
            succard = ['success'];
            pendcard = ['pend'];
            cancelcard = ['cancel'];
            expirescard = ['expires'];
            createdcard = ['created'];
            for (var i = 0; i < rs.length; i++) {
                sumcard.push(rs[i].sum);
                succard.push(rs[i].success);
                pendcard.push(rs[i].pending);
                cancelcard.push(rs[i].cancel);
                expirescard.push(rs[i].expires);
                createdcard.push(rs[i].created);
                monthcard.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart_cardwork', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sumcard,
                            succard,
                            pendcard,
                            cancelcard,
                            expirescard,
                            createdcard
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],
                            'success': tabler.colors["pink"],
                            'pend': tabler.colors["red"],
                            'cancel': tabler.colors["yellow"],
                            'expires': tabler.colors["green"],
                            'created': tabler.colors["hotpink"],
                        },
                        names: {
                            // name of each serie
                            'sum': caption.DB_LBL_TOTAL_NUMBER,
                            'success': caption.DB_LBL_FINISH,
                            'pend': caption.DB_LBL_PROCESSING,
                            'expires': caption.DB_LBL_OUT_DATE,
                            'cancel': caption.DB_LBL_CANCEL,
                            'created': "Mới tạo",
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthcard
                        },
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });

            }, 100);
        })

        dataserviceDashBoard.getCountBuyer(function (rs) {
            rs = rs.data;
            $scope.SumBuyer = rs.SumBuyer;
            $scope.BuyerPending = rs.BuyerPending;
            $scope.BuyerSuccess = rs.BuyerSuccess;
            $scope.BuyerCancel = rs.BuyerCancel;
            $scope.SumMoney = (rs.SumMoney);
            $scope.Moneypeding = (rs.Moneypeding);
            $scope.MoneypSuccess = (rs.MoneypSuccess);
            $scope.MoneyCancel = (rs.MoneyCancel);

            $scope.summoneyOut = (rs.summoneyOut);
            $scope.SummoneydependOut = (rs.SummoneydependOut);
            $scope.SummoneysucessOut = (rs.SummoneysucessOut);
            $scope.SummoneycancelOut = (rs.SummoneycancelOut);



        });

        dataserviceDashBoard.getCountSale(function (rs) {
            rs = rs.data;
            $scope.SumSale = rs.SumSale;
            $scope.SalePending = rs.SalePending;
            $scope.SaleSuccess = rs.SaleSuccess;
            $scope.SaleCancel = rs.SaleCancel;
            $scope.SaleMoney = (rs.Summoney)
            $scope.SaleMonrydepending = (rs.Summoneydepend);
            $scope.SaleMoneySucess = (rs.Summoneysucess);
            $scope.SaleMoneyCancel = (rs.Summoneycancel);

            $scope.SummoneyIn = (rs.SummoneyIn).toString();
            $scope.SummoneydependIn = (rs.SummoneydependIn);
            $scope.SummoneysucessIn = (rs.SummoneysucessIn);
            $scope.SummoneycancelIn = (rs.SummoneycancelIn);
        });

        dataserviceDashBoard.countAction(function (rs) {
            rs = rs.data;
            $scope.count = rs;
        });

        dataserviceDashBoard.amchartWorkFlow(function (rs) {
            rs = rs.data;
            monthwf = [];
            sumwf = ['sum'];
            sucwf = ['success'];
            pendwf = ['pend'];
            cancelwf = ['cancel'];
            expireswf = ['expires'];
            for (var i = 0; i < rs.length; i++) {
                sumwf.push(rs[i].sum);
                sucwf.push(rs[i].success);
                pendwf.push(rs[i].pending);
                cancelwf.push(rs[i].cancel);
                expireswf.push(rs[i].expires);
                monthwf.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart_workflow', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sumwf,
                            sucwf,
                            pendwf,
                            cancelwf,
                            expireswf
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],
                            'success': tabler.colors["pink"],
                            'pend': tabler.colors["red"],
                            'cancel': tabler.colors["yellow"],
                            'expires': tabler.colors["green"],

                        },
                        names: {
                            // name of each serie
                            'sum': caption.DB_LBL_TOTAL_NUMBER,
                            'success': caption.DB_LBL_FINISH,
                            'pend': caption.DB_LBL_PROCESSING,
                            'expires': caption.DB_LBL_OUT_DATE,
                            'cancel': caption.DB_LBL_CANCEL,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthwf
                        },
                        y: {
                            tick: {
                                format: function (x) {
                                    if (x != Math.floor(x)) {
                                        var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                            var text = d3.select(this).select('text').text();
                                            return +text === x;
                                        }).style('opacity', 0);
                                        return '';
                                    }
                                    return x;
                                }
                            }
                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 100);
        });

        dataserviceDashBoard.amchartCountSale(function (rs) {
            rs = rs.data;
            monthsale = [];
            sumsale = ['sum'];
            sucsale = ['success'];
            pendsale = ['pend'];
            cancelsale = ['cancel'];
            for (var i = 0; i < rs.length; i++) {
                sumsale.push(rs[i].sum);
                sucsale.push(rs[i].success);
                pendsale.push(rs[i].pending);
                cancelsale.push(rs[i].cancel);
                monthsale.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }

            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#sale', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sumsale,
                            sucsale,
                            pendsale,
                            cancelsale,

                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],
                            'success': tabler.colors["pink"],
                            'pend': tabler.colors["red"],
                            'cancel': tabler.colors["yellow"],
                            //'data5': tabler.colors["white"],

                        },
                        names: {
                            // name of each serie
                            'sum': caption.DB_LBL_TOTAL_NUMBER,
                            'success': caption.DB_LBL_FINISH,
                            'pend': caption.DB_LBL_PROCESSING,
                            'cancel': caption.DB_LBL_CANCEL,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthsale
                        },
                        y: {
                            tick: {
                                format: function (x) {
                                    if (x != Math.floor(x)) {
                                        var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                            var text = d3.select(this).select('text').text();
                                            return +text === x;
                                        }).style('opacity', 0);
                                        return '';
                                    }
                                    return x;
                                }
                            }
                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 100);

        });

        dataserviceDashBoard.amchartCountBuy(function (rs) {
            rs = rs.data;
            monthbuy = [];
            sumbuy = ['sum'];
            sucbuy = ['success'];
            pendbuy = ['pend'];
            cancelbuy = ['cancel'];
            for (var i = 0; i < rs.length; i++) {
                sumbuy.push(rs[i].sum);
                sucbuy.push(rs[i].success);
                pendbuy.push(rs[i].pending);
                cancelbuy.push(rs[i].cancel);
                monthbuy.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#buyer', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sumbuy,
                            sucbuy,
                            pendbuy,
                            cancelbuy,

                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],
                            'success': tabler.colors["pink"],
                            'pend': tabler.colors["red"],
                            'cancel': tabler.colors["yellow"],
                            //'data5': tabler.colors["white"],

                        },
                        names: {
                            // name of each serie
                            'sum': caption.DB_LBL_TOTAL_NUMBER,
                            'success': caption.DB_LBL_FINISH,
                            'pend': caption.DB_LBL_PROCESSING,
                            'cancel': caption.DB_LBL_CANCEL,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthbuy
                        },
                        y: {
                            tick: {
                                format: function (x) {
                                    if (x != Math.floor(x)) {
                                        var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                            var text = d3.select(this).select('text').text();
                                            return +text === x;
                                        }).style('opacity', 0);
                                        return '';
                                    }
                                    return x;
                                }
                            }
                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });

            }, 100);


        });

        dataserviceDashBoard.getCountWorkFlow(function (rs) {
            rs = rs.data;
            $scope.numWorkFlow = rs.sumWorkflow;
            $scope.numWorkFlowPending = rs.WorkflowPending;

            $scope.numWorkFlowSuccess = rs.WorkflowSuccess;
            $scope.numWorkFlowCancel = rs.Workflowcancel;
            $scope.numWorkFlowExpires = rs.WorkflowExpires;
            $scope.listWFL = rs.list;
        });
        //khách hàng

        dataserviceDashBoard.getActionCustomer(function (rs) {
            rs = rs.data;
            $scope.lstCus = rs;

        });
        dataserviceDashBoard.getCountCustomer(function (rs) {
            rs = rs.data;
            $scope.sumCustomer = rs.NumCustomer;
            $scope.sumCustomerActive = rs.NumCusActive;
            $scope.sumCustomerDeActive = rs.NumCusDeActive;
            $scope.SummoneyCus = rs.Summoney;
            $scope.SummoneyIn = rs.SummoneyIn;
        });

        dataserviceDashBoard.amchartCustomer(function (rs) {
            rs = rs.data;
            monthcus = [];
            sumcus = ['sum'];
            activecus = ['active'];
            deactivecus = ['deactive'];
            for (var i = 0; i < rs.length; i++) {
                sumcus.push(rs[i].sum);
                activecus.push(rs[i].Active);
                deactivecus.push(rs[i].DeActive);
                monthcus.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart_customer', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sumcus,
                            activecus,
                            deactivecus,
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],
                            'active': tabler.colors["pink"],
                            'deactive': tabler.colors["red"],

                        },
                        names: {
                            // name of each serie
                            'sum': caption.DB_LBL_TOTAL_NUMBER,
                            'active': caption.DB_LBL_BEING_ACTIVE,
                            'deactive': caption.DB_LBL_SHUT_DOWN,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthcus
                        },
                        y: {
                            tick: {
                                format: function (x) {
                                    if (x != Math.floor(x)) {
                                        var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                            var text = d3.select(this).select('text').text();
                                            return +text === x;
                                        }).style('opacity', 0);
                                        return '';
                                    }
                                    return x;
                                }
                            }
                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 100);
        })

        // supplier
        dataserviceDashBoard.getActionSupplier(function (rs) {
            rs = rs.data;
            $scope.lstSup = rs;

        });
        dataserviceDashBoard.getCountSupplier(function (rs) {
            rs = rs.data;
            $scope.sumSup = rs.NumSupplier;
            $scope.sumSupActive = rs.NumSupActive;
            $scope.sumSupDeActive = rs.NumSupDeActive;
            $scope.SumMoneySup = rs.SumMoney;
            $scope.summoneyOut = rs.summoneyOut;
        });

        dataserviceDashBoard.amchartSupplier(function (rs) {
            rs = rs.data;
            monthsup = [];
            sumsup = ['sum'];
            activesup = ['active'];
            deactivesup = ['deactive'];
            for (var i = 0; i < rs.length; i++) {
                sumsup.push(rs[i].sum);
                activesup.push(rs[i].Active);
                deactivesup.push(rs[i].DeActive);
                monthsup.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart_supplier', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sumsup,
                            activesup,
                            deactivesup,
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],
                            'active': tabler.colors["pink"],
                            'deactive': tabler.colors["red"],

                        },
                        names: {
                            // name of each serie
                            'sum': caption.DB_LBL_TOTAL_NUMBER,
                            'active': caption.DB_LBL_BEING_ACTIVE,
                            'deactive': caption.DB_LBL_SHUT_DOWN,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthsup
                        },
                        y: {
                            tick: {
                                format: function (x) {
                                    if (x != Math.floor(x)) {
                                        var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                            var text = d3.select(this).select('text').text();
                                            return +text === x;
                                        }).style('opacity', 0);
                                        return '';
                                    }
                                    return x;
                                }
                            }
                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });


            }, 100);


        })
        //tài sản
        dataserviceDashBoard.getCountAsset(function (rs) {
            rs = rs.data;
            $scope.sumAsset = rs.sumasset;
            $scope.assetActive = rs.assetActive;
            $scope.assetMainten = rs.assetMainten;
            $scope.assetDelete = rs.assetDelete;
            $scope.SumValueAsset = formatNumber(rs.SumValueAsset.toString());
            $scope.ValueAssetActive = formatNumber(rs.ValueAssetActive.toString());
            $scope.ValueAssetMainten = formatNumber(rs.ValueAssetMainten.toString());
            $scope.ValueAssetDelete = formatNumber(rs.ValueAssetDelete.toString());
        });

        dataserviceDashBoard.amchartAsset(function (rs) {
            rs = rs.data;
            monthas = [];
            sumas = ['sum'];
            activeas = ['active'];
            maintenas = ['mainten'];
            deleteas = ['delete'];
            for (var i = 0; i < rs.length; i++) {
                sumas.push(rs[i].sum);
                activeas.push(rs[i].active);
                maintenas.push(rs[i].mainten);
                deleteas.push(rs[i].cancel);
                monthas.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart_asset', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sumas,
                            activeas,
                            maintenas,
                            deleteas,
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],
                            'active': tabler.colors["pink"],
                            'mainten': tabler.colors["red"],
                            'delete': tabler.colors["yellow"],

                        },
                        names: {
                            // name of each serie
                            'sum': caption.DB_LBL_ALL_ASSET,
                            'active': caption.DB_LBL_ASSET_USING,
                            'mainten': caption.DB_LBL_ASSET_REPAIR,
                            'delete': caption.DB_LBL_ASSET_LIQUIDATION,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthas
                        },
                        y: {
                            tick: {
                                format: function (x) {
                                    if (x != Math.floor(x)) {
                                        var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                            var text = d3.select(this).select('text').text();
                                            return +text === x;
                                        }).style('opacity', 0);
                                        return '';
                                    }
                                    return x;
                                }
                            }
                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });

            }, 100);



        });
        //quỹ
        dataserviceDashBoard.getCountFunds(function (rs) {
            rs = rs.data;
            $scope.SumMoneyGive = rs.SumMoneyGive;
            $scope.SumMoneyPay = rs.SumMoneyPay;
            $scope.SumMoneyNeedGive = rs.SumMoneyNeedGive;
            $scope.SumMoneyNeedPay = rs.SumMoneyNeedPay;

        });
        dataserviceDashBoard.getActionFunds(function (rs) {
            rs = rs.data;
            $scope.lstActFun = rs;
        })
        dataserviceDashBoard.amchartFunds(function (rs) {
            rs = rs.data;
            monthfun = [];
            givefun = ['give'];
            payfun = ['pay'];

            for (var i = 0; i < rs.length; i++) {
                givefun.push(rs[i].give);
                payfun.push(rs[i].pay);
                monthfun.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var format = d3.format(',.2f');
                var chart = c3.generate({

                    bindto: '#chart_funds', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            givefun,
                            payfun,
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'give': tabler.colors["blue"],
                            'pay': tabler.colors["red"],

                        },
                        names: {
                            // name of each serie
                            'give': caption.DB_LBL_TOTAL_REVENUE,
                            'pay': caption.DB_LBL_TOTAL_EXPEN,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthfun
                        },
                        y: {
                            tick: {
                                format: d3.format(',')
                                //or format: function (d) { return '$' + d; }
                            }


                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });

            }, 100);
        })

        // kho soos hoa
        dataserviceDashBoard.getActionFile(function (rs) {
            rs = rs.data;
            $scope.lstFile = rs;
        })
        dataserviceDashBoard.getCountFile(function (rs) {
            rs = rs.data;
            $scope.sumFile = rs.SumFile;
        })

        dataserviceDashBoard.amchartFile(function (rs) {
            rs = rs.data;
            monthfile = [];
            sumfile = ['sum'];
            for (var i = 0; i < rs.length; i++) {
                sumfile.push(rs[i].sum);
                monthfile.push(caption.DB_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart_file', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            sumfile,
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],

                        },
                        names: {
                            // name of each serie
                            'sum': caption.DB_LBL_TOTAL_FILE,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthfile
                        },
                        y: {
                            tick: {
                                format: function (x) {
                                    if (x != Math.floor(x)) {
                                        var tick = d3.selectAll('.c3-axis-y g.tick').filter(function () {
                                            var text = d3.select(this).select('text').text();
                                            return +text === x;
                                        }).style('opacity', 0);
                                        return '';
                                    }
                                    return x;
                                }
                            }
                        }
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 100);


        })
    };

    $scope.initData();

    $scope.downloadFileCms = function (fileCode) {
        if (fileCode != "" && fileCode != null && fileCode != undefined) {
            location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
                + fileCode;
        }
    }

    $scope.download = function (id) {
        location.href = "/Admin/EDMSRepository/Download?"
            + "Id=" + id;
    }

    var date = new Date();
    $scope.toDay = $filter('date')(date, 'dd/MM/yyyy')

    $scope.viewfileCms = function (url, id, fileSize, cloudId, fileType) {
        switch (fileType) {
            case '.doc':
            case '.docx':
                $scope.viewWord(id, 1, fileSize);
                break;

            case '.xls':
            case '.xlsx':
                $scope.viewExcel(id, 1, fileSize);
                break;

            case '.pdf':
                $scope.viewPDF(id, 1, fileSize);
                break;

            default:
                $scope.download(id);
                break;
        }
    }

    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceDashBoard.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return null;
                }
            });
        }
    };

    $scope.viewExcel = function (id, mode, filesize) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (filesize < 20971520) {
                dataserviceDashBoard.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                var icon = 'fa-file-excel-o';
                                $scope.editFile(object.Link, icon);
                                //$window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/Excel#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            var icon = 'fa-file-excel-o';
                            $scope.editFile(object.Link, icon);
                            //$window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/Excel#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError("Tệp tin lớn hơn 20MB");
            }

        }
    };

    $scope.viewWord = function (id, mode, filesize) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {

            if (filesize < 20971520) {
                dataserviceDashBoard.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                var icon = 'fa-file-word-o';
                                $scope.editFile(object.Link, icon);
                                //$window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/Docman#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            var icon = 'fa-file-word-o';
                            $scope.editFile(object.Link, icon);
                            //$window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/Docman#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError("Vui lòng chọn tệp tin nhỏ hơn 20MB");
            }
        }
    };

    $scope.viewPDF = function (id, mode, filesize) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (filesize < 20971520) {
                dataserviceDashBoard.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                var icon = 'fa-file-pdf-o';
                                $scope.editFile(object.Link, icon);
                                //$window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/PDF#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            var icon = 'fa-file-pdf-o';
                            $scope.editFile(object.Link, icon);
                            //$window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/PDF#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError("Vui lòng chọn tệp tin nhỏ hơn 20MB");
            }
        }
    };

    $scope.view = function (id, fileType, cloudId) {
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];

        if (image.indexOf(fileType.toUpperCase()) !== -1) {
            isImage = true;
        }
        if (cloudId != null && cloudId != "") {
            dataserviceDashBoard.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        window.open(rs.Object, '_blank')
                    } else
                        $scope.openViewer(rs.Object, isImage);
                }
                else {

                }
            });
        }
        else {
            dataserviceDashBoard.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {

                        var url = window.location.origin + '/' + rs.Object;
                        window.open(url, '_blank')
                    }
                    else
                        $scope.openViewer(rs.Object, isImage);
                }
                else {

                }
            });
        }
    }

    $scope.viewCmsDetail = function (data, bookMark) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemDashBoard',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        data: data.ItemId,
                        bookMark: bookMark
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.editFile = function (link, icon) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/editFile.html',
            controller: 'editFileDashBoard',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '80',
            resolve: {
                para: function () {
                    return {
                        link: link,
                        icon: icon
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFilePlugin + '/viewer.html',
            controller: 'viewerPluginDashBoard',
            backdrop: 'false',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
    };

    $scope.goToDepartmentDiagram = function () {
        location.href = "/DepartmentDiagram";
    }

    $scope.isExpand = false;
    $scope.toggleExpand = function () {
        if (!$scope.isExpand) {
            $scope.isExpand = true;
        }
        else {
            $scope.isExpand = false;
        }
    }

    function formatNumber(n) {
        // format number 1000000 to 1,234,567
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    $(document).ready(function () {
        $("#activityHrEmployee").mouseover();
    });

    function showTime() {
        var date = new Date();
        var h = date.getHours(); // 0 - 23
        var m = date.getMinutes(); // 0 - 59
        var s = date.getSeconds(); // 0 - 59
        var session = "AM";

        if (h == 0) {
            h = 12;
        }

        if (h > 12) {
            h = h - 12;
            session = "PM";
        }

        h = (h < 10) ? "0" + h : h;
        m = (m < 10) ? "0" + m : m;
        s = (s < 10) ? "0" + s : s;

        var time = h + ":" + m + ":" + s + " " + session;
        document.getElementById("MyClockDisplay").innerText = time;
        document.getElementById("MyClockDisplay").textContent = time;

        //setTimeout(showTime, 1000);
    }

    setTimeout(function () {
        $("#activityHrEmployee").mouseout();
    }, 1500)
});

app.controller('viewerPluginDashBoard', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, para, $sce) {
    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
});

app.controller('viewItemDashBoard', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataserviceDashBoard, para, $location, $anchorScroll) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.model = {};
    console.log(para);
    if (para.data) {
        var id = para.data;
        dataserviceDashBoard.getContentCms(id, function (rs) {
            rs = rs.data;
            $scope.model.Title = rs.Title;
            $('#cmsViewItem').html(rs.Content);
            $compile(angular.element("#cmsViewItem"))($scope);

            if (para.bookMark) {
                $location.hash(para.bookMark);

                // call $anchorScroll()
                $anchorScroll();
            }
        })
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('viewItemHelp', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataserviceDashBoard, para, $location, $anchorScroll) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.model = {};
    console.log(para);
    if (para.helpId) {
        var helpId = para.helpId;
        dataserviceDashBoard.getCmsIdBookmark(helpId, function (setting) {
            setting = setting.data;
            if (setting.Error) {
                return App.toastr(setting.Title);
            }
            dataserviceDashBoard.getContentCms(setting.ArticleId, function (rs) {
                rs = rs.data;
                $scope.model.Title = rs.Title;
                $('#cmsViewItem').html(rs.Content);
                $compile(angular.element("#cmsViewItem"))($scope);

                if (setting.BookMark) {
                    $location.hash(setting.BookMark);

                    // call $anchorScroll()
                    $anchorScroll();
                }
            })
        });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('editFileDashBoard', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataserviceDashBoard, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.link = $sce.trustAsResourceUrl(para.link);
    $scope.icon = para.icon;

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});

