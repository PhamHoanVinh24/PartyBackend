var ctxfolder = "/views/admin/employeeHome";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber']).
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
app.factory('dataservice', function ($http) {
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
        getCountEmployee: function (callback) {
            $http.get('/Admin/HrEmployee/GetCountEmployee').then(callback);
        },

        //Count Not work relative user
        getCountNotWork: function (callback) {
            $http.post('/Admin/StaffLate/GetCountNotWork').then(callback);
        }
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

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
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

    dataservice.getGroupUser(function (rs) {
        rs = rs.data;
        $rootScope.listGroupUser = rs;
    });

    dataservice.getUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/UserBusyOrFree/TranslationEmpHome');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
        })
        .when('/1', {
            templateUrl: ctxfolder + '/menu1.html',
            controller: 'index1'
        })
        .when('/2', {
            templateUrl: ctxfolder + '/menu2.html',
            controller: 'index'
        })
        .when('/3', {
            templateUrl: ctxfolder + '/menu3.html',
            controller: 'index'
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

app.controller('index', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    $scope.initDataFor3BoxFirst = function () {
        dataservice.getCountEmployee(function (rs) {
            rs = rs.data;
            $scope.countHr = rs;
        })

        dataservice.getCountNotWork(function (rs) {
            rs = rs.data;
            $scope.countYourSheets = rs.CountYourSheets;
            $scope.countTotalSheets = rs.CountTotalSheets;
        })

        dataservice.getActionUser(function (rs) {
            rs = rs.data;
            $scope.lstActEmployee = rs;
        });
        dataservice.getActionUserGroup(function (rs) {
            rs = rs.data;
            $scope.groupUsers = rs;
        });

        var LabelConnection = draw2d.Connection.extend({
            init: function () {
                this._super();
                var auto = new Connection_Label({

                });
                auto.attr({
                    text: "Auto",
                    width: 10,
                    height: 1,
                    bgColor: "white",
                    cssClass: "auto",
                    radius: 3
                });
                /*this.add(auto, new draw2d.layout.locator.PolylineMidpointLocator(), 1000000);*/
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
                    router: null,
                    //outlineStroke: 1,
                    //outlineColor: "#303030",
                    stroke: 1,
                    color: "#0000FF",
                    radius: 0,
                });
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



                // labels are added via JSON document.
            },

            /**
             * @method 
             * Return an objects with all important attributes for XML or JSON serialization
             * 
             * @returns {Object}
             */
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

            /**
             * @method 
             * Read all attributes from the serialized properties and transfer them into the shape.
             * 
             * @param {Object} memento
             * @returns 
             */
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
            /**
             * @method
             * 
             * Restore the canvas from a given JSON object.
             * 
             * @param {draw2d.Canvas} canvas the canvas to restore
             * @param {Object} document the json object to load.
             */
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
            /**
             * @method
             * Factory method to create an instance of the given element type.
             *
             * @param {String} type
             * @return {draw2d.Figure}
             */
            createFigureFromType: function (type) {
                return eval("new " + type + "()");
            }
        });

        var canvas = new draw2d.Canvas("gfx_holder_svg");
        canvas.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {
                displayJSON(canvas);
            }
        });
    
        function displayJSON(canvas) {
            var writer = new draw2d.io.json.Writer();
            writer.marshal(canvas, function (json) {
                $("#json").text(JSON.stringify(json, null, 2));
                $scope.shapeData = json;
                console.log(json);
            });
        }

        $scope.SaveJsonData = function (objType) {
            if (objType == "EMPlOYEE") {
                displayJSON(canvas);
                var obj = {
                    ObjectType: objType,
                    DataJson: JSON.stringify($scope.shapeData),
                };
                dataservice.saveDashboardDataJson(obj, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                })
            }
            /*if (objType == "GROUPUSER") {
                displayJSON(canvas3);
                var obj = {
                    ObjectType: objType,
                    DataJson: JSON.stringify($scope.shapeData),
                };
                dataservice.saveDashboardDataJson(obj, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                })
            }*/


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
            dataservice.getDataJson(function (rs) {
                rs = rs.data;
                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].ObjectType == "EMPlOYEE") {
                        
                        if (rs[i].DataJson != "" && JSON.parse(rs[i].DataJson).length != 0) {
                            var userJson = JSON.parse(rs[i].DataJson);
                        }
                        else {
                            dataservice.getBranAndDepartment(function (rs) {
                                rs = rs.data;
                                $rootScope.LstOrg = rs.LstOrg;
                                $rootScope.LstDepartment = rs.LstDepartment;
                                var x = 50;
                                var y = 100;
                                var count = 0;
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
                                    figure1.setX(x);
                                    figure1.setY(y);
                                    x = x + 200;
                                    if (x > 750) {
                                        x = 50;
                                        y = y + 150;
                                    }
                                    count++;
                                    var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/center.svg", height: 100, width: 75, stroke: 1, x: 20, y: -50, visible: true });
                                    figure1.add(icon, new draw2d.layout.locator.Locator());
                                    var txt1 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_TOTAL  + $rootScope.LstOrg[j].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                    txt1.setWidth(150);
                                    txt1.addCssClass("txt1");
                                    var txt2 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_ENTER  + $rootScope.LstOrg[j].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                    txt2.setWidth(150);
                                    txt2.addCssClass("txt2");
                                    $rootScope.ActDate = txt2;
                                    var txt3 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_VACATION  + $rootScope.LstOrg[j].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                    txt3.setWidth(150);
                                    txt3.addCssClass("txt3");
                                    var txt5 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_LATE  + $rootScope.LstOrg[j].Late, height: 10, x: 70, y: 20, stroke: 0 });
                                    txt5.setWidth(150);
                                    txt5.addCssClass("txt5");
                                    var sum = 0;
                                    var ckin = 0;
                                    var late = 0;
                                    var not = 0;
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
                                    for (var i = 0; i < $rootScope.LstDepartment.length; i++) {
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
                                            var txt1 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_TOTAL  + $rootScope.LstDepartment[i].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                            txt1.setWidth(150);
                                            txt1.addCssClass("txt1");
                                            var txt2 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_ENTER  + $rootScope.LstDepartment[i].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                            txt2.setWidth(150);
                                            txt2.addCssClass("txt2");
                                            var txt3 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_VACATION  + $rootScope.LstDepartment[i].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                            txt3.setWidth(150);
                                            txt3.addCssClass("txt3");
                                            var txt5 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_LATE  + $rootScope.LstDepartment[i].Late, height: 10, x: 70, y: 20, stroke: 0 });
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
                                            var c = new LabelConnection();
                                            c.setSourceDecorator(new draw2d.decoration.connection.BarDecorator());
                                            c.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
                                            c.setTarget(figure.getInputPort(0));
                                            c.setSource(figure1.getOutputPort(0));
                                            canvas.add(c);
                                        }
                                    }
                                }
                            });
                        }
                        var checkdepartment = [];
                        var checkdepartment2 = [];
                        dataservice.getBranAndDepartment(function (res) {
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
                                        text: caption.EM_LBL_TOTAL + $rootScope.LstOrg[j].Total
                                    });
                                    node1.children.data[2].figure.attr({
                                        text: caption.EM_LBL_ENTER  + $rootScope.LstOrg[j].CheckIn
                                    });
                                    node1.children.data[3].figure.attr({
                                        text: caption.EM_LBL_VACATION  + $rootScope.LstOrg[j].OffWork
                                    });
                                    node1.children.data[4].figure.attr({
                                        text: caption.EM_LBL_LATE  + $rootScope.LstOrg[j].Late
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
                                    var txt1 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_TOTAL  + $rootScope.LstOrg[j].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                    txt1.setWidth(150);
                                    txt1.addCssClass("txt1");
                                    var txt2 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_ENTER  + $rootScope.LstOrg[j].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                    txt2.setWidth(150);
                                    txt2.addCssClass("txt2");
                                    $rootScope.ActDate = txt2;
                                    var txt3 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_VACATION  + $rootScope.LstOrg[j].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                    txt3.setWidth(150);
                                    txt3.addCssClass("txt3");
                                    var txt5 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_LATE  + $rootScope.LstOrg[j].Late, height: 10, x: 70, y: 20, stroke: 0 });
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
                                        text: caption.EM_LBL_TOTAL  + $rootScope.LstDepartment[k].Total
                                    });
                                    node2.children.data[2].figure.attr({
                                        text: caption.EM_LBL_ENTER  + $rootScope.LstDepartment[k].CheckIn
                                    });
                                    node2.children.data[3].figure.attr({
                                        text: caption.EM_LBL_VACATION  + $rootScope.LstDepartment[k].OffWork
                                    });
                                    node2.children.data[4].figure.attr({
                                        text: caption.EM_LBL_LATE  + $rootScope.LstDepartment[k].Late
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
                                        figure.add(icon, new draw2d.layout.locator.ParallelMidpointLocator(this));
                                        var txt1 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_TOTAL  + $rootScope.LstDepartment[k].Total, height: 10, x: 0, y: 0, stroke: 0 });
                                        txt1.setWidth(150);
                                        txt1.addCssClass("txt1");
                                        var txt2 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_ENTER  + $rootScope.LstDepartment[k].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                                        txt2.setWidth(150);
                                        txt2.addCssClass("txt2");
                                        var txt3 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_VACATION  + $rootScope.LstDepartment[k].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                                        txt3.setWidth(150);
                                        txt3.addCssClass("txt3");
                                        var txt5 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_LATE  + $rootScope.LstDepartment[k].Late, height: 10, x: 70, y: 20, stroke: 0 });
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
                }
            })
            //function rs() {
            //    var figure = new draw2d.shape.basic.Rectangle({ width: 140, height: 40, x: 100, y: 100, bgColor: "#1A1A1A", stroke: 0.05, color: "#fff" });
            //    canvas.add(figure);
            //    figure.setMinWidth(140);
            //    figure.setMinHeight(40);
            //    var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/vanphong.svg", height: 160, width: 120, stroke: 1, x: 10, y: -105, visible: true });
            //    figure.add(icon, new draw2d.layout.locator.ParallelMidpointLocator(this));
            //    var txt1 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_TOTAL_100, height: 10, x: 0, y: 0, stroke: 0 });
            //    txt1.setWidth(150);

            //    txt1.addCssClass("txt1");
            //    $rootScope.ActName = txt1;

            //    var txt2 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_ENTER_100, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
            //    txt2.setWidth(150);

            //    txt2.addCssClass("txt2");
            //    $rootScope.ActDate = txt2;

            //    var txt3 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_VACATION_100, height: 10, x: 0, y: 20, stroke: 0 });
            //    txt3.setWidth(150);

            //    txt3.addCssClass("txt3");

            //    var txt5 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_LATE_100, height: 10, x: 70, y: 20, stroke: 0 });
            //    txt5.setWidth(150);

            //    txt5.addCssClass("txt5");
            //    var txt6 = new draw2d.shape.basic.Label({ text: caption.EM_LBL_BUSINESS, height: 10, x: 20, y: -100, stroke: 0 });
            //    txt6.setWidth(150);

            //    txt6.addCssClass("txt6");

            //    figure.add(txt1, new draw2d.layout.locator.Locator());
            //    figure.add(txt2, new draw2d.layout.locator.Locator());
            //    figure.add(txt3, new draw2d.layout.locator.Locator());
            //    figure.add(txt5, new draw2d.layout.locator.Locator());
            //    figure.add(txt6, new draw2d.layout.locator.Locator());

            //    figure.createPort("output");
            //    figure.createPort("input");
            //}
        }, 10);
    }
    $scope.initDataFor3BoxFirst();

    $scope.isExpand = false;
    $scope.toggleExpand = function () {
        
        if (!$scope.isExpand) {
            $scope.isExpand = true;
        }
        else {
            $scope.isExpand = false;
        }
    }

    $scope.isSwitch = false;
    $scope.switchDiv = function () {
        if ($scope.isSwitch) {
            $scope.isSwitch = false;
        }
        else {
            $scope.isSwitch = true;
        }
    }
});
