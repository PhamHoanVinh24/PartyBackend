var ctxfolder = "/views/mobile/groupuserapp/";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]).
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

app.directive('customOnChangeCustomer', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCustomer);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.directive('customOnChangeCardjob', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCardjob);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

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
    var submitFormUpload1 = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        getGroupUser: function (callback) {
            $http.get('/GroupUserApp/GetGroupUser').then(callback)
        },
        getActionUserGroup: function (callback) {
            $http.get('/DashBoardBuyer/GetActionUserGroup/').then(callback);
        },
        
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                WorkFlowCode: {
                    required: true,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                WorkFlowCode: {
                    required: caption.ACT_VALIDATE_ACTIVITY_CODE_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_CODE_SIZE
                },
                Name: {
                    required: caption.ACT_VALIDATE_ACTIVITY_NAME_NOT_NULL,
                    maxlength: caption.ACT_VALIDATE_ACTIVITY_NAME_SIZE
                },
            }
        }

        $rootScope.validationOptionsWF = {
            rules: {
                WfCode: {
                    required: true
                },
                WfName: {
                    required: true
                },
            },
            messages: {
                WfCode: {
                    required: "Mã luồng không được bỏ trống",
                },
                WfName: {
                    required: "Tên luồng không được bỏ trống",
                },
            }
        }
        $rootScope.validationOptionsCardLogger = {
            rules: {
                DtCode: {
                    required: true,
                },
                DtTitle: {
                    required: true,
                }
            },
            messages: {
                DtCode: {
                    required: "Mã thuộc tính không được bỏ trống"
                },
                DtTitle: {
                    required: "Tên thuộc tính không được bỏ trống",
                }
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    //$translateProvider.useUrlLoader('/Admin/WorkflowActivity/Translation');
    //caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.initData = function () {
        dataservice.getActionUserGroup(function (rs) {

            rs = rs.data;
            $scope.lstGroup = rs;
        });

        var LabelConnection = draw2d.Connection.extend({
            init: function () {
                this._super();
                var auto = new Connection_Label({

                });
                auto.attr({
                    text: "Auto",
                    width: 20,
                    height: 20,
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
                auto.installEditor(new draw2d.ui.LabelInplaceEditor({ width: 20 }));
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
        var canvas = new draw2d.Canvas("gfx_holder");
        $rootScope.canvas2 = canvas;
            canvas.installEditPolicy(new draw2d.policy.canvas.FadeoutDecorationPolicy());
            canvas.installEditPolicy(new draw2d.policy.canvas.ExtendedKeyboardPolicy());
            canvas.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
                createConnection: function (sourcePort, targetPort) {
                    itemmmm = new LabelConnection();
                    itemmmm.setSourceDecorator(new draw2d.decoration.connection.BarDecorator());
                    itemmmm.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());

                    checkconn = 1;
                    arr.push(itemmmm);
                    return itemmmm;
                }
            }));
      
        dataservice.getGroupUser(function (rs) {
            rs = rs.data;
            $rootScope.LstGroup = rs.LstGroup;
            /*  canvas.setZoom(2, true);*/
            $scope.zoomout = function () {
                canvas.setZoom(canvas.getZoom() * 1.3, true);
            }
            $scope.zoomin = function () {
                canvas.setZoom(canvas.getZoom() * 0.7, true);
            }
            var x = 80;
            var y = 100;
            var count = 0;
            for (var j = 0; j < $rootScope.LstGroup.length; j++) {
                var figure1 = new draw2d.shape.basic.Rectangle({ width: 140, height: 40, x: 100, y: 80, bgColor: "#1A1A1A", stroke: 0.05, color: "#fff" });
                canvas.add(figure1, x, y);
                figure1.setId($rootScope.LstGroup[j].Code);

                figure1.setMinWidth(140);
                figure1.setMinHeight(40);
                figure1.setX(x);
                figure1.setY(y);
                x = x + 150;
                if (x > 100) {
                    x = 80;
                    y = y + 150;

                }
                count++;

                var icon = new draw2d.shape.basic.Image({ path: "/images/workflowActivity/groupuser.svg", height: 60, width: 75, stroke: 1, x: 30, y: -65, visible: true });
                figure1.add(icon, new draw2d.layout.locator.Locator());



                var txt1 = new draw2d.shape.basic.Label({ text: "Tổng :" + $rootScope.LstGroup[j].Total, height: 10, x: 0, y: 0, stroke: 0 });
                txt1.setWidth(150);

                txt1.addCssClass("txt1");


                var txt2 = new draw2d.shape.basic.Label({ text: "Vào :" + $rootScope.LstGroup[j].CheckIn, height: 10, x: 70, y: 0, stroke: 0, color: "#fff" });
                txt2.setWidth(150);

                txt2.addCssClass("txt7");
                $rootScope.ActDate = txt2;


                var txt3 = new draw2d.shape.basic.Label({ text: "Nghỉ :" + $rootScope.LstGroup[j].OffWork, height: 10, x: 0, y: 20, stroke: 0 });
                txt3.setWidth(150);

                txt3.addCssClass("txt3");

                var txt5 = new draw2d.shape.basic.Label({ text: "Muộn : " + $rootScope.LstGroup[j].Late, height: 10, x: 70, y: 20, stroke: 0 });
                txt5.setWidth(150);

                txt5.addCssClass("txt5");


                var txt6 = new draw2d.shape.basic.Label({ text: "" + $rootScope.LstGroup[j].Name, height: 10, x: 20, y: -90, stroke: 0 });
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
    $scope.initData();

});

