var ctxfolder = "/views/mobile/wareHouseVatTuApp/";
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
        getListWareHouse: function (callback) {
            $http.get('/WareHouseVatTuApp/GetListWareHouse').then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/WareHouseVatTuApp/GetListFloorByWareHouseCode?wareHouseCode=' + data).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/WareHouseVatTuApp/GetListLineByFloorCode?floorCode=' + data).then(callback);
        },
        getListRackByFloorCode: function (data, callback) {
            $http.get('/WareHouseVatTuApp/GetListRackByFloorCode?floorCode=' + data).then(callback);
        },
        getListCabinet: function (callback) {
            $http.get('/WareHouseVatTuApp/GetListCabinet').then(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/WareHouseVatTuApp/GetProductUnit/').then(callback);
        },
        getPositionByProdID: function (data, callback) {
            $http.post('/WareHouseVatTuApp/GetPositionByProdID?id=' + data).then(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/WareHouseVatTuApp/GetProductGroup/').then(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/WareHouseVatTuApp/GetProductTypes/').then(callback);
        },
        getListObject: function (data, callback) {
            $http.get('/WareHouseVatTuApp/GetListObject?objectType=' + data).then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/WareHouseVatTuApp/GetProductStatus/').then(callback);
        },
        getListCatalogue: function (callback) {
            $http.post('/WareHouseVatTuApp/GetProductCatelogue/').then(callback);
        },
        getFloor: function (data, callback) {
            $http.post('/WareHouseVatTuApp/GetFloor?floorCode=' + data).then(callback);
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
    $scope.model = {
        WhsCode: '',
        FloorCode: ''
    };

    var Rack = draw2d.shape.basic.Image.extend({
        NAME: "RACK",
        init: function () {
            this._super();

            // labels are added via JSON document.
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
                        if (element.type == "RACK") {
                            element.type = "Rack";
                            var o = _this.createFigureFromType(element.type);
                        }
                        if (element.type == "LINE") {
                            element.type = "Line";
                            var o = _this.createFigureFromType(element.type);
                        }
                        if (element.type == "CABINET") {
                            element.type = "Cabinet";
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

    var Cabinet = draw2d.shape.basic.Image.extend({
        NAME: "CABINET",
        init: function () {
            this._super();

            // labels are added via JSON document.
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

    var Line = draw2d.shape.basic.Line.extend({
        NAME: "LINE",
        init: function () {
            this._super();

            // labels are added via JSON document.
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

    var url_string = window.location.href;

    var url = new URL(url_string);

    $scope.model.FloorCode = url.searchParams.get("floorCode");

    $scope.initData = function () {
        dataservice.getFloor($scope.model.FloorCode, function (result) {
            result = result.data;
            $scope.model.WhsCode = result.WHS_Code;
        });
        $rootScope.Rack = Rack;
        $rootScope.Cabinet = Cabinet;
        $rootScope.Line = Line;
        $rootScope.Reader = Reader;
        var app;
        var itemmmm;
        var canvas2;
        var item1;
        var item2;
        var item3;
        var item5;
        var dataweb = "";
        var check = 0;
        var checkconn = 0;
        var checkdell = [];
        var checkdell2 = [];
        var timer;
        var time;
        var arr = [];
        var cu = 0;
        var idtxt = 1;
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
        $rootScope.canvas2 = canvas;
        canvas2 = canvas;
        canvas.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {
                displayJSON(canvas);
                if (cu >= 1) {
                    newdata = JSON.parse(dataweb);


                }

            }
        });

        canvas.installEditPolicy(new draw2d.policy.canvas.FadeoutDecorationPolicy());
        canvas.installEditPolicy(new draw2d.policy.canvas.ExtendedKeyboardPolicy());
        canvas.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
            createConnection: function (sourcePort, targetPort) {
                itemmmm = new LabelConnection();
                itemmmm.setSourceDecorator(new draw2d.decoration.connection.BarDecorator());
                itemmmm.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());

                // $(".parent_svg").append('<div id ="ball" class ="ball' + cu + '"></div>');



                checkconn = 1;
                arr.push(itemmmm);
                console.log(arr);
                return itemmmm;

            }
        }));
        readdata();
        function readdata() {
            canvas.clear();
            var Rack = draw2d.shape.basic.Image.extend({
                NAME: "RACK",
                init: function () {
                    this._super();

                    // labels are added via JSON document.
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
                                if (element.type == "RACK") {
                                    element.type = "Rack";
                                    var o = _this.createFigureFromType(element.type);
                                }
                                if (element.type == "LINE") {
                                    element.type = "Line";
                                    var o = _this.createFigureFromType(element.type);
                                }
                                if (element.type == "CABINET") {
                                    element.type = "Cabinet";
                                    var o = _this.createFigureFromType(element.type);
                                } else {
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
            var Cabinet = draw2d.shape.basic.Image.extend({
                NAME: "CABINET",
                init: function () {
                    this._super();

                    // labels are added via JSON document.
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
            var Line = draw2d.shape.basic.Line.extend({
                NAME: "LINE",
                init: function () {
                    this._super();

                    // labels are added via JSON document.
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
            var tech = GetURLParameter('floorCode');
            var json_data = [];
            dataservice.getListLineByFloorCode(tech, function (rs) {

                rs = rs.data;
                $scope.listLine = rs;
                canvas.setZoom(2, true);
                $scope.zoomout = function () {
                    canvas.setZoom(canvas.getZoom() * 1.1, true);
                }
                $scope.zoomin = function () {
                    canvas.setZoom(canvas.getZoom() * 0.9, true);
                }
                dataservice.getListRackByFloorCode(tech, function (res) {
                    res = res.data;
                    $scope.listRack = res;
                    var x = 50;
                    var y = 200;
                    for (var i = 0; i < rs.length; i++) {
                        if (rs[i].shapeData != "") {
                            var json1 = JSON.parse(rs[i].ShapeData);
                            json_data.push(json1[0]);
                            for (var j = 1; j < json1.length; j++) {
                                for (var k = 0; k < res.length; k++) {
                                    if (json1[j].id == res[k].RackCode) {
                                        $(".container").scrollTop(json1[j].y / 2);
                                        $(".container").scrollLeft(json1[j].x / 2);
                                        json1[j].labels[1].path = "/images/wareHouse/linghtgif.svg";
                                        json1[j].labels[2].text = "Tên : " + res[k].RackName;
                                        json1[j].labels[3].text = "Size :" + res[k].R_Size;
                                        json1[j].labels[4].text = "Trạng thái :" + res[k].R_Status;
                                        json1[j].labels[5].text = "Số sản phẩm : " + res[k].ProductCount;
                                        json1[j].labels[6].text = "";
                                        json_data.push(json1[j]);

                                    }
                                }
                            }
                        }
                    }
                    var reader = new Reader();
                    reader.unmarshal(canvas, json_data);
                    displayJSON(canvas);





                });
            });



        }
    }

    $scope.initData();

    var count = 0;

    $rootScope.searchObject = function (WhsCode, FloorCode, LineCode, rackCode, cabinetCode) {
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        $('#contentMain ').scrollTop(0);
        $('#contentMain ').scrollLeft(0);
        var canvas = $rootScope.canvas2;
        var Rack = $rootScope.Rack;
        var Cabinet = $rootScope.Cabinet;
        var Line = $rootScope.Line;
        
        canvas.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {
                displayJSON(canvas);
            }
        });
        $scope.model.WhsCode = "";
        if ($scope.model.WhsCode == '') {
            //if (count < 1) {
            //    canvas.setZoom(canvas.getZoom() * 1.1, true);
            //}

            $scope.model.WhsCode = WhsCode;
            dataservice.getListFloorByWareHouseCode(WhsCode, function (rs) {
                rs = rs.data;
                $scope.listFloor = rs;
                for (var i = 0; i < $scope.listFloor.length; i++) {
                    if ($scope.listFloor[i].Code === FloorCode) {
                        $scope.listFloor[i].Active = true;
                    } else {
                        $scope.listFloor[i].Active = false;
                    }
                }
            });
            var json_data = [];

            dataservice.getListLineByFloorCode(FloorCode, function (rs) {
                canvas.clear();
                rs = rs.data;
                $scope.listLine = rs;
                dataservice.getListRackByFloorCode(FloorCode, function (res) {
                    res = res.data;
                    $scope.listRack = res;
                    var x = 50;
                    var y = 200;
                    for (var i = 0; i < rs.length; i++) {
                        if (rs[i].ShapeData !== "" && rs[i].ShapeData !== undefined && rs[i].ShapeData !== null) {
                            var json1 = JSON.parse(rs[i].ShapeData);
                            json_data.push(json1[0]);
                            for (var j = 1; j < json1.length; j++) {
                                for (var k = 0; k < res.length; k++) {
                                    if (json1[j].id == res[k].RackCode) {
                                        if (json1[j].id == rackCode) {
                                            $('#contentMain').scrollTop(json1[j].y - 100);
                                            $('#contentMain').scrollLeft(json1[j].x - 500);
                                            json1[j].labels[1].path = "/images/wareHouse/linghtgif.svg";
                                        }
                                        else {
                                            json1[j].labels[1].path = "/images/wareHouse/linght.svg";
                                        }
                                        json1[j].labels[2].text = "Tên : " + res[k].RackName;
                                        json1[j].labels[3].text = "Size :" + res[k].R_Size;
                                        json1[j].labels[4].text = "Trạng thái :" + res[k].R_Status;
                                        json1[j].labels[5].text = "Số sản phẩm : " + res[k].ProductCount;
                                        json_data.push(json1[j]);
                                    }
                                }
                            }
                        }
                    }

                    var reader = new Reader();
                    reader.unmarshal(canvas, json_data);
                    displayJSON(canvas);
                    $scope.update();
                });
            });
        }

        else {
            if ($scope.model.WhsCode != WhsCode) {
                App.toastrError("Sản phẩm không nằm trong kho!")
            }
            else {
                if (rackCode !== undefined && rackCode != null && rackCode !== '') {
                    //if (count < 1) {
                        //canvas.setZoom(canvas.getZoom() * 1.1, true);
                    //}

                    var node = $rootScope.canvas2.getFigure(rackCode);
                    if (node != null) {
                        $('#contentMain').scrollTop(node.y - 100);
                        $('#contentMain').scrollLeft(node.x - 500);
                        node.children.data[1].figure.attr({
                            "path": "/images/wareHouse/linghtgif.svg"
                        });

                    }
                    var full = $rootScope.canvas2.getFigures();
                    if (full != null) {
                        for (var i = 0; i < full.data.length; i++) {
                            if (full.data[i].id != rackCode) {
                                full.data[i].children.data[1].figure.attr({
                                    "path": "/images/wareHouse/linght.svg"
                                });
                            }
                        }
                    }
                }

                if (cabinetCode !== undefined && cabinetCode !== null && cabinetCode !== '') {
                    var node2 = $rootScope.canvas2.getFigure(cabinetCode);
                    node2.children.data[1].figure.attr({
                        "path": "/images/wareHouse/linghtgif.svg"
                    });
                    $('#contentMain').scrollTop(node2.y - 100);
                    $('#contentMain').scrollLeft(node2.x - 500);
                    var full = $rootScope.canvas2.getFigures();
                    for (var i = 0; i < full.data.length; i++) {
                        if (full.data[i].id != rackCode && full.data[i].id != cabinetCode) {
                            full.data[i].children.data[1].figure.attr({
                                "path": "/images/wareHouse/linght.svg"
                            });
                        }
                    }
                }
            }
        }

        App.unblockUI("#contentMain");
        displayJSON(canvas);
        count++;
    };

    $scope.mapSearch = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/mapSearch.html',
            controller: 'map-search',
            backdrop: 'static',
            size: '65'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.update = function () {
        setTimeout(function () {
            $(".RACK").dblclick(function () {
                var node = canvas.getPrimarySelection();
                if (node !== null) {
                    $scope.rackDetail(node.id);
                }
            });

            $(".CABINET").dblclick(function () {
                var node = canvas.getPrimarySelection();
                if (node !== null) {
                    $scope.packDetail(node.id);
                }
            });

            $(".rotate").click(function (rs) {
                var node = canvas.getPrimarySelection();
                var x = node.getX();
                var y = node.getY();
                if (node.path === "/images/wareHouse/rack_ngang.svg") {

                    canvas.remove(node);
                    var name = node.children.data[2].figure.text;
                    var light = new draw2d.shape.basic.Image({ path: "/images/wareHouse/linght.svg", width: 30, height: 12, x: 35, y: 7, bgColor: "lime", stroke: 0.1, color: "#000" });

                    var figure3 = new draw2d.shape.basic.Rectangle({ width: 40, height: 300, x: -40, y: 0, bgColor: "#fff", stroke: 0.1, color: "#000" });
                    figure3.addCssClass('value');

                    if ((node.children.data[2].figure.text).length < 15) {
                        var txt11 = new draw2d.shape.basic.Label({ text: "" + node.children.data[2].figure.text, height: 10, x: -43, angle: 90, y: 20, stroke: 0 });
                        txt11.addCssClass("txt1");
                    }
                    if ((node.children.data[2].figure.text).length >= 15 && (node.children.data[2].figure.text).length < 25) {
                        var txt11 = new draw2d.shape.basic.Label({ text: "" + node.children.data[2].figure.text, height: 10, x: -66, angle: 90, y: 47, stroke: 0 });
                        txt11.addCssClass("txt1");
                    }
                    else {
                        if ((node.children.data[2].figure.text).length > 25) {
                            var txt11 = new draw2d.shape.basic.Label({ text: "" + node.children.data[2].figure.text, height: 10, x: -90, angle: 90, y: 70, stroke: 0 });
                            txt11.addCssClass("txt1");
                        }
                    }
                    if ((node.children.data[3].figure.text).length < 10) {
                        var txt22 = new draw2d.shape.basic.Label({ text: "" + node.children.data[3].figure.text, height: 10, x: -30, y: 180, angle: 90, stroke: 0, });
                        txt22.addCssClass("txt2");
                    }
                    if ((node.children.data[3].figure.text).length < 15 && (node.children.data[3].figure.text).length > 10) {
                        var txt22 = new draw2d.shape.basic.Label({ text: "" + node.children.data[3].figure.text, height: 10, x: -47, angle: 90, y: 195, stroke: 0 });
                        txt22.addCssClass("txt2");
                    }
                    if ((node.children.data[3].figure.text).length >= 15 && (node.children.data[3].figure.text).length < 25) {
                        var txt22 = new draw2d.shape.basic.Label({ text: "" + node.children.data[3].figure.text, height: 10, x: -55, angle: 90, y: 200, stroke: 0 });
                        txt22.addCssClass("txt2");
                    } /*else {
                        if ((node.children.data[3].figure.text).length > 25) {
                            var txt22 = new draw2d.shape.basic.Label({ text: "" + node.children.data[3].figure.text, height: 10, x: -50, angle: 90, y: 190, stroke: 0 });
                            txt22.addCssClass("txt2");
                        }
                    }*/

                    var txt33 = new draw2d.shape.basic.Label({ text: "" + node.children.data[4].figure.text, height: 10, angle: 90, x: -90, y: 50, stroke: 0 });

                    txt33.addCssClass("txt3");

                    var txt55 = new draw2d.shape.basic.Label({ text: "" + node.children.data[5].figure.text, height: 10, x: -75, angle: 90, y: 200, stroke: 0 });

                    txt55.addCssClass("txt5");
                    var rotate2 = new draw2d.shape.basic.Image({ path: "/images/wareHouse/rotate.png", width: 20, height: 20, y: 280, x: 80, visible: true });
                    rotate2.addCssClass('rotate');
                    var rack_doc = new Rack({ height: 300, width: 100, stroke: 1, x: 100, y: 100, visible: true });
                    rack_doc.setMinWidth(100);
                    rack_doc.setMinHeight(280);
                    rack_doc.attr({
                        path: "/images/wareHouse/rack_doc.svg"
                    });
                    rack_doc.setId(node.id);
                    rack_doc.addCssClass("RACK");
                    rack_doc.add(figure3, new draw2d.layout.locator.Locator());
                    rack_doc.add(light, new draw2d.layout.locator.Locator());

                    rack_doc.add(txt11, new draw2d.layout.locator.Locator());
                    rack_doc.add(txt22, new draw2d.layout.locator.Locator());
                    rack_doc.add(txt33, new draw2d.layout.locator.Locator());

                    rack_doc.add(txt55, new draw2d.layout.locator.Locator());
                    rack_doc.add(rotate2, new draw2d.layout.locator.Locator());
                    canvas.add(rack_doc, x, y);

                    rotate2.on('click', function () {
                        var node2 = canvas.getPrimarySelection();
                        canvas.remove(node2);
                        node.x = node2.x;
                        node.y = node2.y;
                        canvas.add(node);

                        $scope.update();
                        displayJSON(canvas);
                    });
                    displayJSON(canvas);

                }
                if (node.path == "/images/wareHouse/rack_doc.svg") {
                    canvas.remove(node);
                    var figure4 = new draw2d.shape.basic.Image({ path: "/images/wareHouse/linght.svg", width: 30, height: 12, x: 135, y: 5, bgColor: "lime", stroke: 0.1, color: "#000" });

                    var figure1 = new draw2d.shape.basic.Rectangle({ width: 300, height: 40, x: 0, y: 100, bgColor: "#fff", stroke: 0.1, color: "#000" });
                    figure1.addCssClass('value');
                    var txt1 = new draw2d.shape.basic.Label({ text: "" + node.children.data[2].figure.text, height: 10, x: 0, y: 100, stroke: 0 });
                    txt1.addCssClass("txt1");
                    var txt2 = new draw2d.shape.basic.Label({ text: "" + node.children.data[3].figure.text, height: 10, x: 150, y: 100, stroke: 0, color: "#fff" });
                    txt2.addCssClass("txt2");
                    var txt3 = new draw2d.shape.basic.Label({ text: "" + node.children.data[4].figure.text, height: 10, x: 0, y: 120, stroke: 0 });

                    txt3.addCssClass("txt3");

                    var txt5 = new draw2d.shape.basic.Label({ text: "" + node.children.data[5].figure.text, height: 10, x: 150, y: 120, stroke: 0 });

                    txt5.addCssClass("txt5");
                    var rotate = new draw2d.shape.basic.Image({ path: "/images/wareHouse/rotate.png", width: 20, height: 20, y: 80, x: 303, visible: true });
                    rotate.addCssClass('rotate');
                    var rack_ngang = new Rack({ height: 100, width: 300, stroke: 1, x: 100, angle: 89, y: 100, visible: true });

                    canvas.add(rack_ngang, x, y);
                    rack_ngang.setId(node.id);
                    rack_ngang.setMinWidth(300);
                    rack_ngang.setMinHeight(100);

                    rack_ngang.attr({
                        path: "/images/wareHouse/rack_ngang.svg"
                    });
                    rack_ngang.addCssClass("RACK");
                    rack_ngang.add(figure1, new draw2d.layout.locator.Locator());
                    rack_ngang.add(figure4, new draw2d.layout.locator.Locator());
                    rack_ngang.add(txt1, new draw2d.layout.locator.Locator());
                    rack_ngang.add(txt2, new draw2d.layout.locator.Locator());
                    rack_ngang.add(txt3, new draw2d.layout.locator.Locator());
                    rack_ngang.add(txt5, new draw2d.layout.locator.Locator());
                    rack_ngang.add(txt5, new draw2d.layout.locator.Locator());
                    rack_ngang.add(rotate, new draw2d.layout.locator.Locator());

                    rotate.on('click', function () {
                        var node2 = canvas.getPrimarySelection();
                        canvas.remove(node2);
                        node.x = node2.x;
                        node.y = node2.y;
                        canvas.add(node);
                        $scope.update();
                        displayJSON(canvas);
                    });
                    displayJSON(canvas);

                }

            });
        }, 100);

    }

    function displayJSON(canvas) {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas, function (json) {
            $("#json").text(JSON.stringify(json, null, 2));
            $scope.shapeData = json;
        });
    }
});

app.controller('map-search', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice) {
    var vm = $scope;
    $scope.isEdit = false;

    $scope.model = {
        Code: '',
        Name: '',
        FromTo: '',
        DateTo: '',
        Group: '',
        Type: '',
        Status: '',
        Catalogue: '',
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/WareHouseVatTuApp/JTableProduct",
            beforeSend: function (jqXHR, settings) {
                //App.blockUI({
                //    target: "#contentMain",
                //    boxed: true,
                //    message: 'loading...'
                //});
            },
            type: 'POST',
            data: function (d) {
                d.Code = $scope.model.Code;
                d.Name = $scope.model.Name;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;

                d.Group = $scope.model.Group;
                d.Type = $scope.model.Type;
                d.Status = $scope.model.Status;
                d.Catalogue = $scope.model.Catalogue;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {

                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productcode').withTitle('{{"Mã sản phẩm" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productname').withTitle('{{"Tên sản phẩm" | translate}}').renderWith(function (data, type, full) {
        var position = '<br/><span class="text-green">' + full.Position + '</span>';
        data += position;
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle('Vị trí đặt').renderWith(function (data, type, full) {
        if (full.IsLocated === 'True') {
            return '<a ng-click="gotoDiagram(' + full.MappingId + ')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Cập nhật - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-sitemap pt5"></i></a>';
        }
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {

    }
    function toggleOne(selectedItems, evt) {
        $(evt.target).closest('tr').toggleClass('selected');
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    return;
                }
            }
        }
        vm.selectAll = true;
    }

    $scope.reload = function () {
        reloadData(true);
    };

    $scope.search = function () {
        
        reloadData(true);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.gotoDiagram = function (mappingID) {
        dataservice.getPositionByProdID(mappingID, function (rs) {
            rs = rs.data;
            $scope.position = rs;
            $rootScope.searchObject($scope.position.WhsCode, $scope.position.FloorCode, $scope.position.LineCode, $scope.position.RackCode, $scope.position.CabinetCode);
            $uibModalInstance.dismiss('cancel');
        });
    };

    $scope.initData = function () {
        dataservice.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result;
        });
        dataservice.getproductgroup(function (result) {
            result = result.data;
            $scope.productGroups = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.productGroups.unshift(all)
        });
        $rootScope.ProductCode = '';
        dataservice.getProductTypes(function (result) {
            result = result.data;
            $scope.productTypes = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.productTypes.unshift(all)
        });
        dataservice.getListCatalogue(function (result) {
            result = result.data;
            $scope.listCatalogue = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listCatalogue.unshift(all)
        });
        dataservice.getListStatus(function (result) {
            result = result.data;
            $scope.StatusData = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.StatusData.unshift(all)
        });
    }
    $scope.initData();
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewerBase64.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.data = code;
                setTimeout(function () {
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    $scope.selectObjectType = function (objectType) {
        dataservice.getListObject(objectType, function (rs) {
            rs = rs.data;
            $scope.listObjects = rs;
        });
    };

    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});
