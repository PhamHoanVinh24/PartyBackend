var ctxfolder = "/views/admin/edmsDiagramWarehouseAsset";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", "pascalprecht.translate", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngTagsInput', 'dynamicNumber']);
app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);

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
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            headers: {
                'Content-Type': undefined
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: data
        }
        $http(req).then(callback);
    };
    return {
        //Sinh mã QR_CODE
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseAsset/GenQRCode?code=' + data, callback).then(callback);
        },
        getObjectsType: function (callback) {
            $http.post('/Admin/EDMSRepository/GetObjectsType').then(callback);
        },
        getListObject: function (data, callback) {
            $http.get('/Admin/EDMSRepository/GetListObject?objectType=' + data).then(callback);
        },
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSDiagramWarehouseAsset/GetListWareHouse').then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseAsset/GetListFloorByWareHouseCode?wareHouseCode=' + data).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseAsset/GetListLineByFloorCode?floorCode=' + data).then(callback);
        },
        getListChildByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseAsset/GetListChildByFloorCode?floorCode=' + data).then(callback);
        },
        getZoneDetail: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseAsset/GetZoneDetail?zoneCode=' + data).then(callback);
        },
        getListCabinet: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseAsset/GetListCabinet?floorCode=' + data).then(callback);
        },
        getPositionByFileID: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseAsset/GetPositionByFileID?id=' + data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/EDMSDiagramWarehouseAsset/GetListUser').then(callback);
        },
        getRackDetail: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseAsset/GetRackDetail?rackCode=' + data).then(callback);
        },
        getPackDetail: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseAsset/GetPackDetail?cabinetCode=' + data).then(callback);
        },
        saveData: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseAsset/SaveData', data).then(callback);
        },
        loadData: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseAsset/LoadData?floorCode=' + data).then(callback);
        },

        getStatus: function (callback) {
            $http.post('/Admin/Asset/GetStatus').then(callback);
        },
        getAssetType: function (callback) {
            $http.post('/Admin/Asset/GetAssetType').then(callback);
        },
        getAssetGroup: function (callback) {
            $http.post('/Admin/Asset/GetAssetGroup').then(callback);
        },
        getPositionByAssetID: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseAsset/GetPositionByAssetID?id=' + data).then(callback);
        }
    };
});

app.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChange);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            var partternTelephone = /[0-9]/g;
            var partternVersion = /^\d+(\.\d+)*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.WHS_Code) && data.WHS_Code != null && data.WHS_Code != '' && data.WHS_Code != undefined) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Mã không được chứa ký tự đặc biệt và khoảng trắng.", "<br/>");
            }
            return mess;
        }
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.validationOptionsFile = {
            rules: {
                FileName: {
                    required: true
                },
            },
            messages: {
                FileName: {
                    required: caption.EDMSWHPV_VALIDATE_NAME_FILE,
                },
            }
        }
        $rootScope.validationOptionsmore = {
            rules: {
                ext_code: {
                    required: true,
                    maxlength: 100
                },
                ext_value: {
                    required: true,
                    maxlength: 500
                },
            },
            messages: {
                ext_code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.EDMSWHPV_CURD_LBL_EXT_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.EDMSWHPV_CURD_LBL_EXT_CODE).replace("{1}", "50")
                },
                ext_value: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.EDMSWHPV_CURD_LBL_EXT_VALUE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.EDMSWHPV_CURD_LBL_EXT_VALUE).replace("{1}", "50")
                },
            }
        }
        $rootScope.validationOptions = {
            rules: {
                Code: {
                    required: true
                },
                Name: {
                    required: true
                },
                Address: {
                    required: true
                },
                AreaSquare: {
                    required: true
                },
                Floor: {
                    required: true
                }
            },
            messages: {
                Code: {
                    required: caption.EDMSWHPV_VALIDATE_CODE,
                },
                Name: {
                    required: caption.EDMSWHPV_VALIDATE_NAME,
                },
                Address: {
                    required: caption.EDMSWHPV_VALIDATE_ADDRESS,
                },
                AreaSquare: {
                    required: caption.EDMSWHPV_VALIDATE_AREA,
                },
                Floor: {
                    required: caption.EDMSWHPV_VALIDATE_CNT_FLOOR,
                }
            }
        }
    });

    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    $rootScope.type = type;
    $rootScope.Object = {
        WHS_Code: '',
    }

    $rootScope.listType = [{
        Code: '1',
        Name: 'Tập'
    }, {
        Code: '2',
        Name: 'Cuốn'
    }, {
        Code: '3',
        Name: 'Thùng'
    }];
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/EDMSDiagramWarehouseAsset/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
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
    $httpProvider.interceptors.push('interceptors');
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {
    $scope.model = {
        WhsCode: '',
        FloorCode: ''
    };
    $scope.cancel = function () {
        $scope.setsize = false;
        /* $scope.momo = false;*/
    };

    $scope.hidelst = function () {
        $scope.setsize = true;
        var canvas = $rootScope.canvas2;
    }
    $scope.redesign = function (data) {
        var jsont = $rootScope.shapeData;


        var canvas = $rootScope.canvas2;
        canvas.clear();
        var arrJson = [];

        for (var i = 0; i < jsont.length; i++) {
            t = jsont[i];
            if (t.type == "RACK") {
                if (data.showrack == true) {
                    if (data.rack == 1) {
                        t.width = 300;
                        t.height = 100;
                        t.path = "/images/wareHouse/rack_ngang.svg"
                        t.labels[0].y = 100;
                        t.labels[0].x = 0;
                        t.labels[1].x = 135;
                        t.labels[1].y = 5;
                        t.labels[2].y = 100;
                        t.labels[2].x = 0;
                        t.labels[3].y = 100;
                        t.labels[3].x = 150;
                        t.labels[4].x = 0;
                        t.labels[4].y = 120;
                        t.labels[5].x = 150;
                        t.labels[5].y = 120;
                        t.labels[6].x = 150;
                        t.labels[6].y = 120;
                        t.labels[7].x = 303;
                        t.labels[7].y = 80;
                        arrJson.push(t);
                    }
                    if (data.rack == 2) {
                        t.path = "/images/wareHouse/rack_ngang.svg";
                        t.width = 240;
                        t.height = 80;
                        t.labels[0].y = 80;
                        t.labels[2].y = 80;
                        t.labels[3].y = 80;
                        t.labels[4].y = 100;
                        t.labels[5].y = 100;
                        t.labels[6].y = 100;
                        t.labels[1].x = 110;
                        arrJson.push(t);
                    }
                    if (data.rack == 3) {
                        t.path = "/images/wareHouse/rack_ngang.svg";
                        t.width = 150;
                        t.height = 50;
                        t.labels[0].y = 55;
                        t.labels[0].x = -75;
                        t.labels[1].x = 65;
                        t.labels[1].y = -5;
                        t.labels[2].y = 55;
                        t.labels[2].x = -75;
                        t.labels[3].y = 55;
                        t.labels[3].x = 75;
                        t.labels[4].x = -75;
                        t.labels[4].y = 75;
                        t.labels[5].x = 75;
                        t.labels[5].y = 75;
                        t.labels[6].x = 75;
                        t.labels[6].y = 75;
                        t.labels[7].x = 225;
                        arrJson.push(t);
                    }
                    if (data.rack == 4) {
                        t.width = 90;
                        t.height = 30;
                        t.path = "/images/wareHouse/covayden.svg"
                        t.labels[0].y = 50;
                        t.labels[0].x = -110;
                        t.labels[1].x = 30;
                        t.labels[1].y = -10;
                        t.labels[2].y = 65;
                        t.labels[2].x = -110;
                        t.labels[3].y = 65;
                        t.labels[3].x = 40;
                        t.labels[4].x = -110;
                        t.labels[4].y = 85;
                        t.labels[5].x = 40;
                        t.labels[5].y = 85;
                        t.labels[6].x = 40;
                        t.labels[6].y = 85;
                        t.labels[7].x = 190;
                        t.labels[7].y = 95;
                        //
                        t.labels[0].cssClass = "hide";
                        t.labels[1].cssClass = t.labels[1].cssClass + " " + "hide";
                        t.labels[2].cssClass = t.labels[2].cssClass + " " + "hide";
                        t.labels[3].cssClass = t.labels[3].cssClass + " " + "hide";
                        t.labels[4].cssClass = t.labels[4].cssClass + " " + "hide";
                        t.labels[5].cssClass = t.labels[5].cssClass + " " + "hide";
                        t.labels[6].cssClass = t.labels[6].cssClass + " " + "hide";
                        t.labels[7].cssClass = t.labels[7].cssClass + " " + "hide";
                        arrJson.push(t);
                    }
                }
            }

            if (t.type == "CABINET") {
                if (data.showcabin == true) {
                    if (data.cabin == 1) {
                        t.path = "/images/wareHouse/cabinet_doc.svg";

                        t.width = 100;
                        t.height = 100;
                        t.labels[0].x = 0;
                        t.labels[0].x = 102;
                        t.labels[1].x = 35;
                        t.labels[1].y = 0;
                        t.labels[2].y = 0.4;
                        t.labels[2].y = 102;
                        arrJson.push(t);
                    }
                    if (data.cabin == 2) {
                        t.path = "/images/wareHouse/cabinet_doc.svg";

                        t.width = 80;
                        t.height = 80;

                        t.labels[1].x = 27;
                        t.labels[1].y = -5;
                        arrJson.push(t);
                    }
                    if (data.cabin == 3) {
                        t.path = "/images/wareHouse/cabinet_doc.svg";

                        t.width = 50;
                        t.height = 50;
                        t.labels[1].x = 12;
                        t.labels[1].y = -7;
                        arrJson.push(t);
                    }
                    if (data.cabin == 4) {

                        t.width = 90;
                        t.height = 30;
                        t.path = "/images/wareHouse/covayxam.svg"

                        t.labels[1].x = -8;
                        t.labels[1].y = -10;
                        //
                        t.labels[0].cssClass = t.labels[0].cssClass + " " + "hide";
                        t.labels[1].cssClass = t.labels[1].cssClass + " " + "hide";
                        /* t.labels[2].cssClass = t.labels[2].cssClass + " " + "hide";*/
                        arrJson.push(t);


                    }
                }
            }

            if (t.type == "LINE") {
                if (data.showline == true) {
                    if (data.line == 1) {
                        t.vertex[1].x = t.vertex[0].x + 1000;
                        t.vertex[1].y = t.vertex[0].y;
                        t.stroke = 5;

                        arrJson.push(t);
                    }
                    if (data.line == 2) {
                        t.vertex[1].x = t.vertex[0].x + 600;
                        t.vertex[1].y = t.vertex[0].y;
                        t.stroke = 3;
                        arrJson.push(t);

                        /*if (t.vertex[1].y >= t.vertex[0].y) {
                            t.vertex[1].x = t.vertex[0].x +200;
                            t.vertex[1].y = t.vertex[0].y + 400;
                            arrJson.push(t);
                        }
                        if (t.vertex[1].y < t.vertex[0].y) {
                            t.vertex[1].x = t.vertex[0].x;
                            t.vertex[1].y = t.vertex[0].y - 400;
                            arrJson.push(t);
                        }*/


                    }
                    if (data.line == 3) {
                        t.vertex[1].x = t.vertex[0].x + 200;
                        t.vertex[1].y = t.vertex[0].y;
                        t.stroke = 2;
                        arrJson.push(t);

                        /* if (t.vertex[1].y >= t.vertex[0].y) {
                             t.vertex[1].x = t.vertex[0].x + 100;
                             t.vertex[1].y = t.vertex[0].y + 200;
                             t.stroke = 3;
                             arrJson.push(t);
                         }
                         if (t.vertex[1].y < t.vertex[0].y) {
                             t.vertex[1].x = t.vertex[0].x ;
                             t.vertex[1].y = t.vertex[0].y - 200;
                             t.stroke = 3;
 
                             arrJson.push(t);
                         }*/
                    }
                    if (data.line == 4) {
                        t.vertex[1].x = t.vertex[0].x + 30;
                        t.vertex[1].y = t.vertex[0].y;
                        t.stroke = 1;
                        arrJson.push(t);

                        /* if (t.vertex[1].y >= t.vertex[0].y) {
                             t.vertex[1].x = t.vertex[0].x + 30;
                             t.vertex[1].y = t.vertex[0].y + 30;
                             t.stroke = 1;
 
                             arrJson.push(t);
                         }
                         if (t.vertex[1].y < t.vertex[0].y) {
                             t.vertex[1].x = t.vertex[0].x;
                             t.stroke = 1;
 
                             t.vertex[1].y = t.vertex[0].y -30;
                             arrJson.push(t);
                         }*/
                    }
                }
            }

        }
        var reader = new Reader();
        reader.unmarshal(canvas, arrJson);
        displayJSON(canvas);
        $scope.update();
        $scope.setsize = false;

        $(".RACK").click(function () {
            var node = canvas.getPrimarySelection();
            node.children.data[0].figure.addCssClass('value');
            node.children.data[0].figure.removeCssClass('hide');
            node.children.data[1].figure.removeCssClass('hide');
            node.children.data[2].figure.removeCssClass('hide');
            node.children.data[3].figure.removeCssClass('hide');
            node.children.data[4].figure.removeCssClass('hide');
            node.children.data[5].figure.removeCssClass('hide');
            node.children.data[6].figure.removeCssClass('hide');
            node.children.data[7].figure.removeCssClass('hide');
        })
    }

    $scope.shapeData = [];
    $scope.listData = [];

    $scope.hidejson = function () {
        $(".json_div").toggleClass('jsonhide');
    }

    var canvas = new draw2d.Canvas("gfx_holder_svg");
    var Rack = draw2d.shape.basic.Image.extend({
        NAME: "RACK",
        init: function () {
            this._super();
        },
        getPersistentAttributes: function () {
            var memento = this._super();
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

    $scope.init = function () {
        dataservice.getListWareHouse(function (rs) {
            rs = rs.data;
            $rootScope.listWareHouse = rs;
        });
        $rootScope.canvas2 = canvas;
        $rootScope.Rack = Rack;
        $rootScope.Cabinet = Cabinet;
        $rootScope.Line = Line;
        $rootScope.Reader = Reader;
        $(".baolo").draggable();
    };
    $scope.init();
    $scope.update = function () {
        setTimeout(function () {
            debugger
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
                    }

                    var txt33 = new draw2d.shape.basic.Label({ text: "" + node.children.data[4].figure.text, height: 10, angle: 90, x: -65, y: 27, stroke: 0 });

                    txt33.addCssClass("txt3");

                    var txt55 = new draw2d.shape.basic.Label({ text: "" + node.children.data[5].figure.text, height: 10, x: -70, angle: 90, y: 200, stroke: 0 });

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
    $scope.Clear = function (rs) {
        $scope.model.WhsCode = "";
        $scope.listFloor = "";
        var canvas = $rootScope.canvas2;
        canvas.clear();
    }

    $scope.zoomout = function (rs) {
        var canvas = $rootScope.canvas2;
        canvas.setZoom(canvas.getZoom() * 1.1, true);
    }
    $scope.zoomin = function (rs) {
        var canvas = $rootScope.canvas2;
        canvas.setZoom(canvas.getZoom() * 0.9, true);
    }

    $scope.changeWareHouse = function () {
        dataservice.getListFloorByWareHouseCode($scope.model.WhsCode, function (rs) {
            rs = rs.data;
            $scope.listFloor = rs;
        });
    };

    var count = 0;
    $scope.chooseFloor = function (item) {
        count = 0;
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        $scope.setActive(item);

        var canvas = $rootScope.canvas2;
        canvas.setZoom(1, true);

        canvas.clear();
        canvas.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {
                displayJSON(canvas);
            }
        });
        var json_data = [];

        dataservice.getListChildByFloorCode(item.Code, function (res) {
            res = res.data;
            for (var i = 0; i < res.length; i++) {
                var type = res[i].ZoneType;
                var item = res[i];

                var dataObj = JSON.parse(res[i].ShapeData);
                if (dataObj != null && dataObj != undefined) {
                    if (dataObj.labels.length > 5)
                        dataObj.labels[5].text = "Số tài sản : " + item.FileCount;
                    json_data.push(dataObj);
                } else {
                    $scope.initObject(type, item, false);
                }
            }

            var reader = new Reader();
            reader.unmarshal(canvas, json_data);
            $scope.update();
        });

        App.unblockUI("#contentMain");
    };

    $scope.initObject = function (type, item, search) {
        switch (type) {
            case 'LINE':
                $scope.initLine(item);
                break;

            case 'RACK':
                $scope.initRack(item, search);
                break;
        }
    }

    $scope.initLine = function (item) {
        debugger
        var x = 50;
        var line = new Line({});
        line.attr({
            startX: 50,
            startY: 250 + x,
            endX: 1000,
            endY: 250 + x,
            stroke: 5,
            color: "grey"
        });
        line.setId(item.ZoneCode);
        x = x + 200;
        canvas.add(line);
        var name = new draw2d.shape.basic.Label({ text: item.ZoneName, height: 10, x: 5, y: 5, stroke: 0 });
        name.setWidth(150);
        name.addCssClass("txt");
        line.add(name, new draw2d.layout.locator.BottomLocator());
    }
    $scope.initRack = function (item) {
        debugger
        var x = 50;
        var y = 200;
        var figure4 = new draw2d.shape.basic.Image({ path: "/images/wareHouse/linght.svg", width: 30, height: 12, x: 135, y: 5, bgColor: "lime", stroke: 0.1, color: "#000" });

        var figure1 = new draw2d.shape.basic.Rectangle({ width: 300, height: 40, x: 0, y: 100, bgColor: "#fff", stroke: 0.1, color: "#000" });
        figure1.addCssClass('value');
        var txt1 = new draw2d.shape.basic.Label({ text: "Tên :  " + item.ZoneName, height: 10, x: 0, y: 100, stroke: 0 });
        txt1.addCssClass("txt1");
        var txt2 = new draw2d.shape.basic.Label({ text: "Size : " + "", height: 10, x: 150, y: 100, stroke: 0, color: "#fff" });
        txt2.addCssClass("txt2");
        var txt3 = new draw2d.shape.basic.Label({ text: "Tình trạng : " + "", height: 10, x: 0, y: 120, stroke: 0 });
        txt3.addCssClass("txt3");

        var txt5 = new draw2d.shape.basic.Label({ text: "Số tài sản : " + item.FileCount, height: 10, x: 150, y: 120, stroke: 0 });
        txt5.addCssClass("txt5");
        var rotate = new draw2d.shape.basic.Image({ path: "/images/wareHouse/rotate.png", width: 20, height: 20, y: 80, x: 303, visible: true });
        rotate.addCssClass('rotate');
        var rack_ngang = new Rack({ height: 100, width: 300, stroke: 1, x: 100, angle: 89, y: 100, visible: true });

        canvas.add(rack_ngang, x, y);
        rack_ngang.setId(item.ZoneCode);
        rack_ngang.setMinWidth(300);
        rack_ngang.setMinHeight(100);
        x = x + 350;
        if (x > 1100) {
            x = 50;
            y = y + 100;
        }
        rack_ngang.attr({
            path: "/images/wareHouse/rack_ngang.svg"
        });
        rack_ngang.add(figure1, new draw2d.layout.locator.Locator());
        rack_ngang.add(figure4, new draw2d.layout.locator.Locator());
        rack_ngang.add(txt1, new draw2d.layout.locator.Locator());
        rack_ngang.add(txt2, new draw2d.layout.locator.Locator());
        rack_ngang.add(txt3, new draw2d.layout.locator.Locator());
        rack_ngang.add(txt5, new draw2d.layout.locator.Locator());
        rack_ngang.add(rotate, new draw2d.layout.locator.Locator());
    }

    $scope.setActive = function (item) {
        for (var i = 0; i < $scope.listFloor.length; i++) {
            if ($scope.listFloor[i].Code === item.Code) {
                $scope.listFloor[i].Active = true;
            } else {
                $scope.listFloor[i].Active = false;
            }
        }
    }
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
    $scope.rackDetail = function (rackCode) {
        dataservice.getZoneDetail(rackCode, function (rs) {
            rs = rs.data;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/viewRackDetail.html',
                controller: 'view-rack-detail',
                backdrop: 'static',
                size: '40',
                resolve: {
                    para: function () {
                        return rs;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        });
    };
    $scope.packDetail = function (packCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/viewPackDetail.html',
            controller: 'view-pack-detail',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return packCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.saveShapeData = function () {
        $scope.listData = [];
        for (var i = 0; i < $scope.shapeData.length; i++) {
            var obj = {
                Type: $scope.shapeData[i].type,
                Json: JSON.stringify($scope.shapeData[i]),
                ObjectCode: $scope.shapeData[i].id
            };

            $scope.listData.push(obj);
        }

        if ($scope.listData.length === 0) {
            return App.toastrError(caption.EDMSDWC_MSG_NO_DATA);
        }

        dataservice.saveData($scope.listData, function (rs) {
            rs = rs.data;

            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        });
    };

    $rootScope.searchObject = function (WhsCode, FloorCode, LineCode, rackCode, positionPack) {
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        $('#contentMain ').scrollTop(0);
        $('#contentMain ').scrollLeft(0);
        var canvas = $rootScope.canvas2;
        canvas.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {
                displayJSON(canvas);
            }
        });
        $scope.model.WhsCode = "";
        debugger
        if ($scope.model.WhsCode == '') {
            if (count < 1) {
                canvas.setZoom(canvas.getZoom() * 0.8, true);
            }

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
            canvas.clear();
            dataservice.getListChildByFloorCode(FloorCode, function (res) {
                res = res.data;
                for (var i = 0; i < res.length; i++) {
                    var type = res[i].ZoneType;
                    var item = res[i];
                    var code = res[i].ZoneCode;
                    var dataObj = JSON.parse(res[i].ShapeData);
                    if (dataObj != null && dataObj != undefined) {
                        if (code === rackCode) {
                            if (dataObj.labels.length > 5)
                                dataObj.labels[5].text = "Số tài sản : " + item.FileCount;

                            dataObj.labels[1].path = "/images/wareHouse/linghtgif.svg";
                            var labelPosition = JSON.parse(JSON.stringify(dataObj.labels[2]));
                            labelPosition.text = "Vị trí :  " + positionPack;
                            labelPosition.x = 100;
                            labelPosition.y = -15;
                            dataObj.labels.push(labelPosition);
                            $('#contentMain ').scrollTop(dataObj.y);
                            $('#contentMain ').scrollLeft(dataObj.x);
                        }
                        json_data.push(dataObj);
                    }
                    else {
                        $scope.initObject(type, item, true);
                    }
                }

                var reader = new Reader();
                reader.unmarshal(canvas, json_data);
                $scope.update();
            });
        }
        App.unblockUI("#contentMain");
        displayJSON(canvas);
        count++;
    };
    function displayJSON(canvas) {
        var writer = new draw2d.io.json.Writer();
        writer.marshal(canvas, function (json) {
            $("#json").text(JSON.stringify(json, null, 2));
            $scope.shapeData = json;
            $rootScope.shapeData = json;
        });
    }
});

app.controller('map-search', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, $filter) {
    var vm = $scope;
    $scope.isEdit = false;

    $scope.model = {
        AssetName: '',
        AssetGroup: '',
        AssetType: '',
        Status: '',
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSDiagramWarehouseAsset/JTableAsset",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AssetName = $scope.model.AssetName;
                d.AssetGroup = $scope.model.AssetGroup;
                d.AssetType = $scope.model.AssetType;
                d.Status = $scope.model.Status;
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

    vm.dtColumns.push(DTColumnBuilder.newColumn("AssetID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetCode').withTitle('{{"ASSET_LIST_COL_ASSET_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetName').withTitle('{{"ASSET_LIST_COL_ASSET_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetGroup').withTitle('{{"ASSET_LIST_COL_ASSET_GROUP" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetType').withTitle('{{"ASSET_LIST_COL_ASSET_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('SupplierName').withTitle('{{"ASSET_LIST_COL_SUPP" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('BuyedTime').withTitle('{{"ASSET_LIST_COL_DATE_BUY" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpiredDate').withTitle('{{"ASSET_LIST_COL_EXPERIED_DATE" | translate}}').renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Cost').withTitle('{{"ASSET_LIST_COL_COST1" | translate}}').renderWith(function (data, type) {
        var dt = data != "" ? $filter('currency')(data, '', 0) : 0;
        return '<span class= "text-success bold">' + dt + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"ASSET_LIST_COL_TYPE_MONEY" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PathIMG').withTitle('{{"ASSET_LIST_COL_IMAGE" | translate}}').renderWith(function (data, type) {
        if (data != '') {
            return '<a href="' + data + '" target="_blank"><img class="img-circle" style="max-height: 100%; max-width: 100%; height: 50px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + '></a>';
        }
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ASSET_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle('Vị trí đặt').renderWith(function (data, type, full) {
        if (full.IsLocated === 'True') {
            return '<a ng-click="gotoDiagram(' + full.AssetID + ')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Cập nhật - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-sitemap pt5"></i></a>';
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

    $scope.gotoDiagram = function (id) {
        dataservice.getPositionByAssetID(id, function (rs) {
            rs = rs.data;
            $scope.position = rs;
            $rootScope.AssetCode = rs.AssetCode;

            $rootScope.searchObject($scope.position.WhsCode, $scope.position.FloorCode, $scope.position.LineCode,
                $scope.position.RackCode, $scope.position.PositionPack);
            $uibModalInstance.dismiss('cancel');
        });
    };

    $scope.initData = function () {
        dataservice.getAssetType(function (rs) {
            rs = rs.data;
            $scope.lstType = rs;
        })
        dataservice.getAssetGroup(function (rs) {
            rs = rs.data;
            $scope.lstGroup = rs;
        })
        dataservice.getStatus(function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        })
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
                    setModalDraggable('.modal-dialog');
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
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('view-rack-detail', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, para, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.QR_Code = '';

    $scope.model = para;
    $scope.rack = para.Zone;

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ZoneManager/JtableAttributeEx",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ZoneType = para.Zone.ZoneType;
                d.ZoneGroup = para.Zone.ZoneGroup;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('')
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrCode').withTitle('Mã thuộc tính & tên thuộc tính').renderWith(function (data, type, full) {
        return data + ' - ' + full.ZoneAttrName;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrValue').withTitle('Giá trị(Đơn vị)').renderWith(function (data, type, full) {
        return data + ' (' + full.ZoneAttrUnitName + ')';
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.init = function () {
        dataservice.generatorQRCode($scope.rack.ZoneCode, function (rs) {
            rs = rs.data;
            $scope.QR_Code = rs;
        });
    };

    $scope.init();

    $scope.print = function (qrCode) {
        if (qrCode !== '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT);
        }
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('view-pack-detail', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, para) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.QR_Code = '';

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSDiagramWarehouseAsset/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PackCode = para;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle('{{"EDMSDWC_TITLE_FILE_NAME" | translate}}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o pr5" aria-hidden="true"></i>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o pr5" aria-hidden="true"></i>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o pr5" aria-hidden="true"></i>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o pr5" aria-hidden="true"></i>';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o pr5" aria-hidden="true"></i>';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o pr5" aria-hidden="true"></i>';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify pr5" aria-hidden="true"></i>';
        }
        var download = "/ &nbsp;<a ng-click='download(" + full.Id + ")'> _" + data + "</a>\n";
        var position = '\n<span class="text-green">' + full.Position + '</span>';
        var updateTime = '';
        var fileSize = 0;
        if (full.SizeOfFile != null) {
            //fileSize = (full.SizeOfFile / 1024000).toFixed(0);
            var kb = 1024;
            var mb = 1024 * kb;
            var gb = 1024 * mb;
            var dt = full.SizeOfFile / gb;
            if (full.SizeOfFile / gb > 1) {
                fileSize = Math.floor(full.SizeOfFile / gb) + " GB";
            }
            else if (full.SizeOfFile / mb > 1) {
                fileSize = Math.floor(full.SizeOfFile / mb) + " MB";
            }
            else if (full.SizeOfFile / kb > 1) {
                fileSize = Math.floor(full.SizeOfFile / kb) + " KB";
            }
            else {
                fileSize = full.SizeOfFile + " Byte";
            }

            fileSize = '<div><span class="badge-customer badge-customer-success">' + fileSize + '</span></div>';
        }

        if (full.UpdateTime != "" && full.UpdateTime != null && full.UpdateTime != undefined) {
            updateTime = '<div><span class="badge-customer badge-customer-black">' + full.UpdateTime + '</span></div>'
        }
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) != -1 || word.indexOf(full.FileTypePhysic.toUpperCase()) != -1
            || pdf.indexOf(full.FileTypePhysic.toUpperCase()) != -1 || powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'excel';
                var file = '<a ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isContent)
                        file = file + download;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime + fileSize + position;
                } else {
                    return icon + '<a ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize + position;
                }
            } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'Syncfusion';
                var file = '<a ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isContent)
                        file = file + download;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime + fileSize + position;
                } else {
                    return icon + '<a ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize + position;
                }
            } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'pdf';
                var file = '<a ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isContent)
                        file = file + download;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime;
                } else {
                    return icon + '<a ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>' + updateTime + fileSize + position;
                }
            } else {
                return icon + '<a ng-click="getObjectFile(0)">' + data + '</a>' + updateTime + fileSize + position;
            }
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                if ($scope.isContent)
                    file = file + download;
                var content = "<div>" + full.Content + "</div>";

                return icon + file + content + updateTime + fileSize + position;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize + position;
            }
        }
        else if (document.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                var content = "<div>" + full.Content + "</div>";
                return file + content + updateTime + fileSize + position;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize + position;
            }
        }
        else if (image.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                var content = "<div>" + full.Content + "</div>";
                return file + content + updateTime + fileSize + position;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize + position;
            }
        }
        else {
            return data + updateTime + fileSize + position;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withOption('sClass', '').withTitle('{{"EDMSDWC_TITLE_SERVER" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withOption('sClass', '').withTitle('{{"EDMSDWC_TITLE_PATH" | translate}}').renderWith(function (data, type, full) {
        var currentPath = "";
        if (full.CloudFileId != null && full.CloudFileId != "") {
            currentPath = full.CatName;
        }
        else {
            currentPath = full.CatName;
        }
        return currentPath;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'dataTable-w80').withTitle('{{"EDMSDWC_TITLE_DATE_CREATED" | translate}}').renderWith(function (data, type, full) {
        return data;
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.init = function () {
        dataservice.generatorQRCode(para, function (rs) {
            rs = rs.data;
            $scope.QR_Code = rs;
        });

        dataservice.getPackDetail(para, function (rs) {
            rs = rs.data;
            $scope.pack = rs;
        });
    };

    $scope.init();

    $scope.print = function (qrCode) {
        if (qrCode !== '') {
            var image = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(image);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.EDMSWM_MSG_ERR_PRINT);
        }
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
