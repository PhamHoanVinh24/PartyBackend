var ctxfolder = "/views/mobile/workflowActivity/";
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
        getWfGroup: function (callback) {
            $http.get('/Admin/MobileLogin/GetWfGroup').then(callback)
        },
        //Draw instance
        getActivityInstance: function (data, callback) {
            $http.get('/WorkflowActivity/GetActivityInstance?wfInstCode=' + data).then(callback);
        },
        getTransitionInstance: function (data, callback) {
            $http.get('/WorkflowActivity/GetTransitionInstance?WfInstCode=' + data).then(callback);
        },
        getItemActInst: function (data, callback) {
            $http.get('/WorkflowActivity/GetItemActInst?actInstCode=' + data).then(callback);
        },

        getMemberAssign: function (data, callback) {
            $http.post('/WorkflowActivity/GetMemberAssign?actInstCode=' + data).then(callback);
        },
        getLstResultAttrData: function (data, callback) {
            $http.post('/WorkflowActivity/GetLstResultAttrData?actInstCode=' + data).then(callback);
        },
        getObjectProcessDiagram: function (data, callback) {
            $http.post('/WorkflowActivity/GetObjectProcessDiagram?actInstCode=' + data).then(callback);
        },
        getAttachmentDiagram: function (data, callback) {
            $http.post('/WorkflowActivity/GetAttachmentDiagram?actInstCode=' + data).then(callback);
        },
         getStartXLast: function (data, callback) {
            $http.post('/WorkflowActivity/GetStartXLast?actInst=' + data).then(callback);
        },
        insertLogCountDown: function (data, data1, callback) {
            $http.post('/WorkflowActivity/InsertLogCountDown?actInst=' + data + '&cnt=' + data1).then(callback);
        },

        getItemActInstByCode: function (data, callback) {
            $http.get('/WorkflowActivity/GetItemActInstByCode?code=' + data).then(callback);
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
            this.add(auto, new draw2d.layout.locator.PolylineMidpointLocator(), 1000000);
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
                color: "gray",
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

    draw2d.shape.basic.Label.inject({
        clearCache: function () {
            this.portRelayoutRequired = true;
            this.cachedMinWidth = null;
            this.cachedMinHeight = null;
            this.cachedWidth = null;
            this.cachedHeight = null;
            this.lastAppliedTextAttributes = {};
            return this;
        }
    });
    var canvas = new draw2d.Canvas("gfx_holder");
    canvas.getCommandStack().addEventListener(function (e) {
        if (e.isPostChangeEvent()) {
            displayJSON(canvas);
        }
    });
    var interval = [];

    canvas.installEditPolicy(new draw2d.policy.canvas.FadeoutDecorationPolicy());
    canvas.installEditPolicy(new draw2d.policy.canvas.ExtendedKeyboardPolicy());
    canvas.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
        createConnection: function (sourcePort, targetPort) {
            itemmmm = new LabelConnection();
            itemmmm.setSourceDecorator(new draw2d.decoration.connection.BarDecorator());
            itemmmm.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
            canvas.add(new draw2d.shape.basic.Oval({
                cssClass: "ball" + cu,
                id: "ball",
                width: 10,
                height: 10,
                y: -5

            }));
            cu++;
            checkconn = 1;
            arr.push(itemmmm);
            console.log(arr);
            return itemmmm;

        }
    }));

    $scope.checkDraw = {
        ActCode: "",
        CntDraw: 0
    };
    canvas2 = canvas;

    $rootScope.canvas2 = canvas;

    $scope.updateLast = function () {
        var tech = GetURLParameter('wfCode');
        $('.setting').click(function () {
            
            var node = $rootScope.canvas2.getPrimarySelection();
            if (node != null) {
                dataservice.getItemActInst(node.id, function (rs) {
                    rs = rs.data;
                    $scope.actInst = rs;
                    $scope.ActInstCode = rs.ActivityInstCode;
                })

                $('.form').toggleClass('form');
                $('.modal').css('display', 'block');
            }
        });
        if (screen.width < 1000) {
            $(".txt1").css("width", "150px");
            $(".txt1").css("height", "60px");
            $(".txt1 ").click(function () {
                var node = canvas2.getPrimarySelection();
                $(document).on("mousemove", function (event) {
                    node.attr({
                        x: event.pageX,
                        y: event.pageY
                    });
                    $(document).off("mousemove");


                });
            });
        }
    }

    $scope.initData = function () {
        var wfInstCode = GetURLParameter('wfCode');
        drawWfInstance(wfInstCode);
    }
    $scope.initData();
    function drawWfInstance(wfInstCode) {
        if ($scope.checkDraw.CntDraw === 0) {
            dataservice.getActivityInstance(wfInstCode, function (rs) {
                $rootScope.canvas2.clear();
                canvas.clear();
                canvas2.clear();
                rs = rs.data;
                var data_json = [];
                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].shapJson != null) {
                        var shapeAct = JSON.parse(rs[i].shapJson);

                        clearInterval(interval[rs[i].ActInstCode]);

                        shapeAct.labels[0].text = rs[i].Title;
                        shapeAct.labels[2].text = rs[i].Status;
                        shapeAct.id = rs[i].ActInstCode;
                        shapeAct.labels[12].text = "Lệnh: " + rs[i].CommandText;

                        if (rs[i].IsLock) {
                            shapeAct.bgColor = "rgba(128,128,128,1)"
                        }
                        else if ((rs[i].StatusCode == "STATUS_ACTIVITY_APPROVED" || rs[i].StatusCode == "STATUS_ACTIVITY_APPROVE_END") && !rs[i].IsLock) {
                            shapeAct.bgColor = "rgba(0,128,128,1)";
                            if (rs[i].IsValid) {
                                shapeAct.labels[11].text = rs[i].EndTimeTxt;
                            } else {
                                shapeAct.labels[11].text = rs[i].EndTimeTxt + ", " + rs[i].LogCountDown;
                                shapeAct.labels[11].bgColor = "#FF9966";

                            }
                        }
                        else if ((rs[i].StatusCode == "STATUS_ACTIVITY_CANCELD" || rs[i].StatusCode == "STATUS_ACTIVITY_STOP") && !rs[i].IsLock) {
                            shapeAct.bgColor = "rgba(255,0,0,1)"
                        }
                        else {
                            shapeAct.bgColor = "rgba(0,128,0,1)"
                        }

                        if (rs[i].ConfirmedN) {
                            shapeAct.labels[13].text = "Làm lại";
                            shapeAct.labels[14].cssClass = "draw2d_shape_basic_Image";
                        } else {
                            shapeAct.labels[14].cssClass = "draw2d_shape_basic_Image hidden";
                        }

                        data_json.push(shapeAct);
                    }
                }
                var s = 60;
                var yh = 50;
                for (var i = 0; i < data_json.length; i++) {
                    if (data_json[i].type == "draw2d.shape.node.Hub") {
                        data_json[i].x = s;
                        data_json[i].y = yh;
                        yh = yh + 150;
                    }
                }
                dataservice.getTransitionInstance(wfInstCode, function (res) {
                    $scope.lisTrs = res.data;
                    if ($scope.lisTrs.length > 0) {
                        for (var k = 0; k < $scope.lisTrs.length; k++) {
                            var shapeTransition = JSON.parse($scope.lisTrs[k].tranShapJson);
                            shapeTransition.source.node = $scope.lisTrs[k].actintial;
                            shapeTransition.target.node = $scope.lisTrs[k].actdes;
                            shapeTransition.id = $scope.lisTrs[k].IdAutoGen;
                            data_json.push(shapeTransition);
                        }
                    }
                    var reader = new draw2d.io.json.Reader();
                    reader.unmarshal(canvas, data_json);
                    displayJSON(canvas);
                    for (var i = 0; i < rs.length; i++) {
                        if (!rs[i].IsLock && rs[i].StatusCode != "STATUS_ACTIVITY_CANCELD" && rs[i].StatusCode != "STATUS_ACTIVITY_STOP" && rs[i].StatusCode != "STATUS_ACTIVITY_APPROVED" && rs[i].StatusCode != "STATUS_ACTIVITY_APPROVE_END")
                            $rootScope.downTime(rs[i].StartTime, rs[i].ActInstCode, rs[i].Timer, rs[i].Unit);
                    }
                });
                setTimeout(function () {
                    var wfInstCode = GetURLParameter('wfCode');
                    ViewDetailActInst(wfInstCode);
                }, 500)
            })
        }
    }

    /*function drawWfInstance(wfInstCode) {
        canvas.clear();
        dataservice.getActivityInstance(wfInstCode, function (rs) {
            rs = rs.data;
            var data_json = [];
            for (var i = 0; i < rs.length; i++) {
                if (rs[i].shapJson != null) {
                    var jsons1 = JSON.parse(rs[i].shapJson);
                    jsons1.labels[0].text = rs[i].Title;
                    jsons1.labels[2].text = rs[i].Status;
                    jsons1.id = rs[i].ActInstCode;
                    jsons1.labels[12].text = "Lệnh: " + rs[i].CommandText

                    if (rs[i].Status == "Không hoạt động") {
                        jsons1.labels[10].path = "/images/workflowActivity/redclock.svg";
                    }
                    if (rs[i].IsLock) {
                        jsons1.bgColor = "grey";
                    } else {
                        if (rs[i].CommandSymbol == "COMMAND_WF_INSTANCE_BACK" || rs[i].CommandSymbol == "COMMAND_WF_INSTANCE_STOP") {
                            jsons1.bgColor = "red";
                        }
                        if (rs[i].CommandSymbol == "COMMAND_WF_INSTANCE_DO" || rs[i].CommandSymbol == "COMMAND_WF_INSTANCE_NEXT") {
                            jsons1.bgColor = "green";
                        }
                    }
                    data_json.push(jsons1);
                }
            }

            var s = 60;
            var yh = 50;
            for (var i = 0; i < data_json.length; i++) {
                if (data_json[i].type == "draw2d.shape.node.Hub") {
                    data_json[i].x = s;
                    data_json[i].y = yh;
                    yh = yh + 150;
                }
            }

            dataservice.getTransitionInstance(wfInstCode, function (res) {
                $scope.lisTrs = res.data;
                if ($scope.lisTrs.length > 0) {
                    for (var k = 0; k < $scope.lisTrs.length; k++) {
                        var jsons2 = JSON.parse($scope.lisTrs[k].tranShapJson);
                        jsons2.source.node = $scope.lisTrs[k].actintial;
                        jsons2.target.node = $scope.lisTrs[k].actdes;
                        jsons2.id = $scope.lisTrs[k].IdAutoGen;
                        data_json.push(jsons2);
                    }
                }
                var reader = new draw2d.io.json.Reader();
                reader.unmarshal(canvas, data_json);
                displayJSON(canvas);
                for (var i = 0; i < rs.length; i++) {
                    if (!rs[i].IsLock && rs[i].CommandSymbol != "COMMAND_WF_INSTANCE_STOP")
                        $rootScope.downTime(rs[i].StartTime, rs[i].ActInstCode);
                }
            });
            setTimeout(function () {
                var wfInstCode = GetURLParameter('wfCode');
                ViewDetailActInst(wfInstCode);
            }, 3000)
        })
    }*/

    function GetURLParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }

    function displayJSON(canvas) {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas, function (json) {
            $("#json").text(JSON.stringify(json, null, 2));
            dataweb = JSON.stringify(json, null, 2);
        });
    }


    $scope.getSafehtml = function (description) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = description;
        return tmp.textContent || tmp.innerText || "";
    }

    function ViewDetailActInst(tech) {
        $('.setting').click(function () {
            var node = $rootScope.canvas2.getPrimarySelection();
            if (node != null) {
                if (node != null) {
                    dataservice.getItemActInst(node.id, function (rs) {
                        debugger
                        rs = rs.data;
                        $scope.actInst = rs;
                        $scope.ActInstCode = rs.ActivityInstCode;
                        $scope.actInst.Desc = $scope.getSafehtml($scope.actInst.Desc);
                    })

                    dataservice.getMemberAssign(node.id, function (rs) {
                        rs = rs.data;
                        $scope.lstAssign = rs;
                    })

                    dataservice.getLstResultAttrData(node.id, function (rs) {
                        rs = rs.data;
                        $scope.lstAttr = rs;
                    })

                    dataservice.getObjectProcessDiagram(node.id, function (rs) {
                        rs = rs.data;
                        $scope.lstObject = rs;
                    })

                    dataservice.getAttachmentDiagram(node.id, function (rs) {
                        rs = rs.data;
                        $scope.lstAttachment = rs;
                    })

                    $('.form').toggleClass('form');
                    $('.modal').css('display', 'block');
                }
            }
        });
    }

    $rootScope.downTime = function (startTime, actInst, duration, unit) {
        var countDownDate = new Date(startTime).getTime();
        var cntOut = 0;
        var totalTimeOut = 0;
        var unitTimeOut = "";
        interval[actInst] = setInterval(function () {
            var allFigure = $rootScope.canvas2.getFigures();
            if (allFigure.data.length > 0) {
                for (var i = 0; i < allFigure.data.length; i++) {
                    if (allFigure.data[i].id === actInst) {
                        // Update the count down every 1 second
                        var now = new Date().getTime();
                        // Find the distance between now and the count down date
                        var distance = countDownDate - now;
                        var figure = allFigure.data[i].children.data[11].figure;
                        if (distance < 0) {
                            //Log time
                            dataservice.getStartXLast(actInst, function (rs) {
                                rs = rs.data;
                                var cnt = 0;
                                if (rs.StartX != null) {
                                    var checkTime = 0;
                                    var startX = new Date(rs.StartX).getTime();
                                    var timeOut = now - startX;

                                    if (unit == "Ngày" || unit == "DURATION_UNIT20200904094128") {
                                        cnt = timeOut / (duration * 24 * 60 * 60 * 1000);
                                        checkTime = new Date(rs.StartX).getTime() + (duration * 24 * 60 * 60 * 1000)
                                        unitTimeOut = "ngày"
                                    }
                                    if (unit == "Giờ" || unit == "DURATION_UNIT20200904094132") {
                                        cnt = timeOut / (duration * 60 * 60 * 1000);
                                        checkTime = new Date(rs.StartX).getTime() + (duration * 60 * 60 * 1000);
                                        unitTimeOut = "giờ"
                                    }
                                    if (unit == "Phút" || unit == "DURATION_UNIT20200904094135") {
                                        cnt = timeOut / (duration * 60 * 1000)
                                        checkTime = new Date(rs.StartX).getTime() + (duration * 60 * 1000);
                                        unitTimeOut = "phút"
                                    }
                                    if (unit == "Giây" || unit == "DURATION_UNIT20200904094139") {
                                        cnt = timeOut / (duration * 1000)
                                        checkTime = new Date(rs.StartX).getTime() + (duration * 1000);
                                        unitTimeOut = "giây"
                                    }

                                    if (checkTime - now > 0) {
                                        distance = checkTime - now;
                                        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                                        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                                        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                                        // Output the result in an element with id="demo"
                                        var time = days + "d " + hours + "h "
                                            + minutes + "m " + seconds + "s" + ", lần: " + rs.Cnt + ", tổng: " + rs.Total + " " + unitTimeOut;
                                        figure.attr({
                                            text: time,
                                            bgColor: "#FF9966"
                                        });
                                    } else {
                                        cnt = Math.round(cnt);
                                        dataservice.insertLogCountDown(actInst, cnt, function (rs) {
                                            rs = rs.data;
                                            $scope.logTime = rs.Object;
                                            if ($scope.logTime.UnitTime == "Ngày" || $scope.logTime.UnitTime == "DURATION_UNIT20200904094128") {
                                                countDownDate = new Date($scope.logTime.StartTimeX).getTime() + (duration * 24 * 60 * 60 * 1000)
                                                unitTimeOut = "ngày"
                                            }
                                            if ($scope.logTime.UnitTime == "Giờ" || $scope.logTime.UnitTime == "DURATION_UNIT20200904094132") {
                                                countDownDate = new Date($scope.logTime.StartTimeX).getTime() + (duration * 60 * 60 * 1000)
                                                unitTimeOut = "giờ"
                                            }
                                            if ($scope.logTime.UnitTime == "Phút" || $scope.logTime.UnitTime == "DURATION_UNIT20200904094135") {
                                                countDownDate = new Date($scope.logTime.StartTimeX).getTime() + (duration * 60 * 1000)
                                                unitTimeOut = "phút"
                                            }
                                            if ($scope.logTime.UnitTime == "Giây" || $scope.logTime.UnitTime == "DURATION_UNIT20200904094139") {
                                                countDownDate = new Date($scope.logTime.StartTimeX).getTime() + (duration * 1000)
                                                unitTimeOut = "giây"
                                            }
                                            //Set time back
                                            distance = countDownDate - new Date().getTime();

                                            cntOut = $scope.logTime.Cnt;
                                            totalTimeOut = $scope.logTime.Total;

                                            figure.attr({
                                                text: "",
                                                bgColor: "#FF9966"
                                            });
                                        })
                                    }
                                }
                                else {
                                    var startX = new Date(startTime).getTime();
                                    var timeOut = now - startX;

                                    if (unit == "Ngày" || unit == "DURATION_UNIT20200904094128") {
                                        cnt = timeOut / (duration * 24 * 60 * 60 * 1000)
                                    }
                                    if (unit == "Giờ" || unit == "DURATION_UNIT20200904094132") {
                                        cnt = timeOut / (duration * 60 * 60 * 1000)
                                    }
                                    if (unit == "Phút" || unit == "DURATION_UNIT20200904094135") {
                                        cnt = timeOut / (duration * 60 * 1000)
                                    }
                                    if (unit == "Giây" || unit == "DURATION_UNIT20200904094139") {
                                        cnt = timeOut / (duration * 1000)
                                    }
                                    cnt = Math.round(cnt);
                                    dataservice.insertLogCountDown(actInst, cnt, function (rs) {
                                        rs = rs.data;
                                        $scope.logTime = rs.Object;
                                        if ($scope.logTime.UnitTime == "Ngày" || $scope.logTime.UnitTime == "DURATION_UNIT20200904094128") {
                                            countDownDate = new Date($scope.logTime.StartTimeX).getTime() + (duration * 24 * 60 * 60 * 1000)
                                            unitTimeOut = "ngày"
                                        }
                                        if ($scope.logTime.UnitTime == "Giờ" || $scope.logTime.UnitTime == "DURATION_UNIT20200904094132") {
                                            countDownDate = new Date($scope.logTime.StartTimeX).getTime() + (duration * 60 * 60 * 1000)
                                            unitTimeOut = "giờ"
                                        }
                                        if ($scope.logTime.UnitTime == "Phút" || $scope.logTime.UnitTime == "DURATION_UNIT20200904094135") {
                                            countDownDate = new Date($scope.logTime.StartTimeX).getTime() + (duration * 60 * 1000)
                                            unitTimeOut = "phút"
                                        }
                                        if ($scope.logTime.UnitTime == "Giây" || $scope.logTime.UnitTime == "DURATION_UNIT20200904094139") {
                                            countDownDate = new Date($scope.logTime.StartTimeX).getTime() + (duration * 1000)
                                            unitTimeOut = "giây"
                                        }
                                        //Set time back
                                        distance = countDownDate - new Date().getTime();

                                        cntOut = $scope.logTime.Cnt;
                                        totalTimeOut = $scope.logTime.Total;

                                        figure.attr({
                                            text: "",
                                            bgColor: "#FF9966"
                                        });
                                    })
                                }
                            })
                        }
                        else {
                            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                            // Output the result in an element with id="demo"
                            var time = days + "d " + hours + "h "
                                + minutes + "m " + seconds + "s" + ", lần: " + cntOut + ", tổng: " + totalTimeOut + " " + unitTimeOut;
                            figure.attr({
                                text: time
                            });
                        }
                    }
                }
            }
        }, 1000);
    }

    $('.closeform').on('click', function () {
        $('.overlay').removeClass('overlay-show');
        $('.form2').toggleClass('form');
    });
});

