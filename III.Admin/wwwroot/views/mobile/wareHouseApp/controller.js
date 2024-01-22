var ctxfolder = "/views/mobile/wareHouseApp/";
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
            $http.get('/WareHouseApp/GetListWareHouse').then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/WareHouseApp/GetListFloorByWareHouseCode?wareHouseCode=' + data).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/WareHouseApp/GetListLineByFloorCode?floorCode=' + data).then(callback);
        },
        getListRackByFloorCode: function (data, callback) {
            $http.get('/WareHouseApp/GetListChildByFloorCode?floorCode=' + data).then(callback);
        },
        getListCabinet: function (callback) {
            $http.get('/WareHouseApp/GetListCabinet').then(callback);
        },

        //Sinh mã QR_CODE
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/edmsWarehouseManagerDocument/GenQRCode?code=' + data, callback).then(callback);
        },
        getObjectsType: function (callback) {
            $http.post('/Admin/EDMSRepository/GetObjectsType').then(callback);
        },
        getListObject: function (data, callback) {
            $http.get('/Admin/EDMSRepository/GetListObject?objectType=' + data).then(callback);
        },
        //Deprecated
        //getListWareHouse: function (callback) {
        //    $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListWareHouseOld').then(callback);
        //},
        //getListFloorByWareHouseCode: function (data, callback) {
        //    $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListFloorByWareHouseCodeOld?wareHouseCode=' + data).then(callback);
        //},
        //getListLineByFloorCode: function (data, callback) {
        //    $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListLineByFloorCodeOld?floorCode=' + data).then(callback);
        //},
        //getListRackByLineCode: function (data, callback) {
        //    $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListRackByLineCode?lineCode=' + data).then(callback);
        //},
        getListChildByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListChildByFloorCode?floorCode=' + data).then(callback);
        },
        //New Dynamic
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListAreaCategory?type=AREA&parentCode=').then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListAreaCategory?type=FLOOR&parentCode=' + data).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListAreaCategory?type=LINE&parentCode=' + data).then(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListAreaCategory?type=RACK&parentCode=' + data).then(callback);
        },
        getListAreaByParentCode: function (data, data1, callback) {
            $http.get(`/Admin/EDMSDiagramWarehouseDocument/GetListAreaCategory?type=${data}&parentCode=${data1}`).then(callback);
        },
        // End New Dynamic
        getZoneDetail: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetZoneDetail?zoneCode=' + data).then(callback);
        },
        getListCabinet: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListCabinet?floorCode=' + data).then(callback);
        },
        getPositionByFileID: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseDocument/GetPositionByFileIdNew?id=' + data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/EDMSDiagramWarehouseDocument/GetListUser').then(callback);
        },
        getRackDetail: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetRackDetail?rackCode=' + data).then(callback);
        },
        getPackDetail: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetPackDetail?cabinetCode=' + data).then(callback);
        },
        saveData: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseDocument/SaveData', data).then(callback);
        },
        loadData: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseDocument/LoadData?floorCode=' + data).then(callback);
        },
        //Danh sách kho, tầng, dãy
        getListWareHouseWithType: function (data, callback) {
            $http.get('/Admin/edmsWarehouseManagerDocument/GetListWareHouse?type=' + data, callback).then(callback);
        },
        getListFloor: function (callback) {
            $http.get('/Admin/edmsWarehouseManagerDocument/GetListFloor', callback).then(callback);
        },
        getListLine: function (callback) {
            $http.get('/Admin/edmsWarehouseManagerDocument/GetListLine', callback).then(callback);
        },

        //Chi tiết 1 kho
        getDetailWareHouse: function (data, callback) {
            $http.get('/Admin/edmsWarehouseManagerDocument/GetDetailWareHouse?wareHouseCode=' + data).then(callback);
        },

        //Danh sách người quản lý
        getListManager: function (callback) {
            $http.get('/Admin/edmsWarehouseManagerDocument/GetListManager', callback).then(callback);
        },
        //List danh sách nhân viên (người quản lý)
        getListStaffBranch: function (callback) {
            $http.post('/Admin/edmsWarehouseManagerDocument/GetListStaffBranch/', callback).then(callback);
        },
        //Sinh mã tầng tự động
        genFloorCode: function (wareHouseCode, floorName, callback) {
            $http.get('/Admin/edmsWarehouseManagerDocument/GenFloorCode?wareHouseCode=' + wareHouseCode + '&floorName=' + floorName, callback).then(callback);
        },
        genLineCode: function (floorCode, lineName, callback) {
            $http.get('/Admin/edmsWarehouseManagerDocument/GenLineCode?floorCode=' + floorCode + '&lineName=' + lineName, callback).then(callback);
        },
        genRackCode: function (lineCode, rackName, callback) {
            $http.get('/Admin/edmsWarehouseManagerDocument/GenRackCode?lineCode=' + lineCode + '&rackName=' + rackName, callback).then(callback);
        },

        //Sinh mã QR_CODE
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/edmsWarehouseManagerDocument/GenQRCode?code=' + data, callback).then(callback);
        },

        //Thêm sửa xóa neo
        insertMapping: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseDocument/InsertMapping', data).then(callback);
        },
        updateMapping: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseDocument/UpdateMapping', data).then(callback);
        },
        updateMappingShape: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseDocument/UpdateMappingShape', data).then(callback);
        },
        getMapping: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseDocument/GetMapping?position=' + data).then(callback);
        },
        deleteMapping: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouseDocument/DeleteMapping?id=' + data).then(callback);
        },
        getListMapping: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouseDocument/GetListMapping?start=' + data).then(callback);
        },
        // upload image
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UploadImage/', data, callback);
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
    $translateProvider.useUrlLoader('/Admin/EDMSDiagramWarehouseDocument/Translation');
    caption = $translateProvider.translations();
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

    var url_string = window.location.href;

    var url = new URL(url_string);
    $scope.model = {
        WhsCode: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        PositionCode: '',
    };
    $scope.model.WhsCode = url.searchParams.get("whsCode");
    $scope.model.FloorCode = url.searchParams.get("floorCode");
    $rootScope.whsCode = $scope.model.WhsCode;
    $rootScope.floorCode = $scope.model.FloorCode;
    var canvas = new draw2d.Canvas("gfx_holder");
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
            $rootScope.listWareHouse = [{ Code: '', Name: caption.COM_TXT_ALL }];
            $rootScope.listWareHouse = $rootScope.listWareHouse.concat(rs);
        });
        $rootScope.canvas2 = canvas;
        $rootScope.Rack = Rack;
        $rootScope.Cabinet = Cabinet;
        $rootScope.Line = Line;
        $rootScope.Reader = Reader;
        $(".baolo").draggable();
    };
    $scope.init();
    $rootScope.drawObject = function () {
        if (!$rootScope.wareHouseCode || !$rootScope.floorCode) {
            return App.toastrError("Phải chọn một kho và một tầng");
        }
        canvas.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {
                displayJSON(canvas);
            }
        });

        if ($rootScope.floorCode != "" && $rootScope.floorCode != null) {
            var position = "";
            position += $rootScope.wareHouseCode ? 'A_' + $rootScope.wareHouseCode : "";
            position += $rootScope.floorCode ? '_F_' + $rootScope.floorCode : "";
            position += $rootScope.lineCode ? '_L_' + $rootScope.lineCode : "";
            position += $rootScope.rackCode ? '_R_' + $rootScope.rackCode : "";
            position += $rootScope.positionCode ? '_P_' + $rootScope.positionCode : "";
            dataservice.getListMapping(position, function (res) {
                canvas.clear();

                var json_data = [];
                res = res.data;
                for (var i = 0; i < res.length; i++) {
                    var type = res[i].Type;
                    var item = res[i];
                    var code = res[i].Code;
                    var dataObj = JSON.parse(res[i].ShapeData);
                    if (dataObj != null && dataObj != undefined) {
                        //if (code === rackCode) {
                        //    if (dataObj.labels.length > 5)
                        //        dataObj.labels[5].text = "Số tài liệu : " + item.FileCount;

                        //    dataObj.labels[1].path = "/images/wareHouse/linghtgif.svg";
                        //    var labelPosition = JSON.parse(JSON.stringify(dataObj.labels[2]));
                        //    labelPosition.text = "Vị trí :  " + positionPack;
                        //    labelPosition.x = 100;
                        //    labelPosition.y = -15;
                        //    dataObj.labels.push(labelPosition);
                        //}
                        json_data.push(dataObj);
                    } else {
                        $scope.initObject(type, item, true);
                    }
                }

                var reader = new Reader();
                reader.unmarshal(canvas, json_data);
                $scope.update();
            });
        }
    }
    $rootScope.searchObjectNew = function (position, categoryCode) {
        if (!$rootScope.wareHouseCode || !$rootScope.floorCode) {
            return App.toastrError("Phải chọn một kho và một tầng");
        }
        canvas.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {
                displayJSON(canvas);
            }
        });

        if ($rootScope.floorCode != "" && $rootScope.floorCode != null) {
            dataservice.getListMapping(position, function (res) {
                canvas.clear();

                var json_data = [];
                res = res.data;
                for (var i = 0; i < res.length; i++) {
                    var type = res[i].Type;
                    var item = res[i];
                    var code = res[i].Code;
                    var dataObj = JSON.parse(res[i].ShapeData);
                    if (dataObj != null && dataObj != undefined) {
                        if (code === categoryCode) {
                            if (dataObj.labels.length > 5)
                                dataObj.labels[5].text = "Số tài liệu : " + item.FileCount;

                            dataObj.labels[1].path = "/images/wareHouse/linghtgif.svg";
                            var labelPosition = JSON.parse(JSON.stringify(dataObj.labels[2]));
                            labelPosition.text = "Vị trí :  " + positionPack;
                            labelPosition.x = 100;
                            labelPosition.y = -15;
                            dataObj.labels.push(labelPosition);
                        }
                        json_data.push(dataObj);
                    } else {
                        $scope.initObject(type, item, true);
                    }
                }

                var reader = new Reader();
                reader.unmarshal(canvas, json_data);
                $scope.update();
            });
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
});
app.controller('map-search', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, $translate) {
    var vm = $scope;
    $scope.isEdit = false;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.model = {
        Content: '',
        ObjectType: '',
        ObjectCode: '',
        WhsCode: '',
        FromDate: '',
        ToDate: '',
        Status: '',
        UserUpload: ''
    };

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSDiagramWarehouseDocument/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Content = $scope.model.Content;
                d.ObjectType = $scope.model.ObjectType;
                d.ObjectCode = $scope.model.ObjectCode;
                d.WhsCode = $scope.model.WhsCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Status = $scope.model.Status;
                d.UserUpload = $scope.model.UserUpload;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle($translate('EDMSDWC_TITLE_FILE_NAME')).renderWith(function (data, type, full) {
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
        var download = "/ &nbsp;<a class=\"break-word\" ng-click='download(" + full.Id + ")'> _" + data + "</a>\n";
        var position = '\n<span class="text-green">' + full.Position + full.PositionPack + '</span>';
        var updateTime = '';
        var fileSize = 0;
        if (full.SizeOfFile != null) {
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
                var file = '<a class=\"break-word\" ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isContent)
                        file = file + download;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime + fileSize + position;
                } else {
                    return icon + '<a class=\"break-word\" ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize + position;
                }
            } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'Syncfusion';
                var file = '<a class=\"break-word\" ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isContent)
                        file = file + download;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime + fileSize + position;
                } else {
                    return icon + '<a class=\"break-word\" ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize + position;
                }
            } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'pdf';
                var file = '<a class=\"break-word\" ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isContent)
                        file = file + download;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime;
                } else {
                    return icon + '<a class=\"break-word\" ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>' + updateTime + fileSize + position;
                }
            } else {
                return icon + '<a class=\"break-word\" ng-click="getObjectFile(0)">' + data + '</a>' + updateTime + fileSize + position;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withOption('sClass', '').withTitle($translate('EDMSDWC_TITLE_SERVER')).renderWith(function (data, type, full) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withOption('sClass', '').withTitle($translate('EDMSDWC_TITLE_PATH')).renderWith(function (data, type, full) {
    //    var currentPath = "";
    //    if (full.CloudFileId != null && full.CloudFileId != "") {
    //        currentPath = full.CatName;
    //    }
    //    else {
    //        currentPath = full.CatName;
    //    }
    //    return currentPath;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'dataTable-w80').withTitle($translate('EDMSDWC_TITLE_DATE_CREATED')).renderWith(function (data, type, full) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle($translate('EDMSDWC_TITLE_PLACEMENT')).renderWith(function (data, type, full) {
        if (full.IsLocated === 'True') {
            return '<a ng-click="gotoDiagram(' + full.FileID + ')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="{{&quot; EDMSDWC_TITLE_UPDATE &quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-sitemap pt5"></i></a>';
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

    $scope.gotoDiagram = function (fileID) {
        dataservice.getPositionByFileID(fileID, function (rs) {
            rs = rs.data;
            $scope.position = rs;
            $rootScope.searchObjectNew($scope.position.ObjectCode, $scope.position.CategoryCode);
            //$rootScope.searchObject($scope.position.WhsCode, $scope.position.FloorCode, $scope.position.LineCode, $scope.position.RackCode, $scope.position.CabinetCode, $scope.position.PositionPack);
            $uibModalInstance.dismiss('cancel');
        });
    };

    $scope.init = function () {
        dataservice.getObjectsType(function (rs) {
            rs = rs.data;
            $scope.objects = rs;
        });
        dataservice.getListUser(function (rs) {
            rs = rs.data;
            $rootScope.listUser = rs;
        });
    };
    $scope.init();

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
        //setModalDraggable('.modal-dialog');
    }, 200);
});