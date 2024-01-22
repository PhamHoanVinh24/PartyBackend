var ctxfolder = "/views/admin/edmsDiagramWarehouse";
var ctxfolderDocument = "/views/admin/edmsDiagramWarehouseDocument";
var ctxfolderDiagram = "/views/admin/edmsDiagramWarehouseDocument";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", "pascalprecht.translate", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngTagsInput', 'dynamicNumber', 'monospaced.qrcode']);

app.directive('taskbarNotepad', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $(element).find(".tool-btn").on("click", function () {
                var $this = $(this);
                if (
                    $(".tool-btn.active").length > 0 &&
                    $(".tool-btn.active")[0] != $this[0]
                ) {
                    if ($(".tool-btn.active").hasClass("tool-nosubmenu")) {
                        $(".tool-btn.active").removeClass("active");
                    } else {
                        $(".tool-btn.active")[0].click();
                    }
                }

                $(".tooltip-wrap").removeClass("show-tt");

                //var cnt = getCanvas();
                $("#panel").find(".typing-input").remove();
                $("#add-type-box").removeClass("active");

                if ($this.hasClass("active")) {
                    $this.removeClass("active");
                    // $this.parent(".tool-submenu").addClass("hidden");
                    $(`.tool-submenu.${$this.data('name')}-class`).addClass("hidden");

                    //tray_menu.removeClass("has-submenutool");
                    //sidemenu.removeClass("has-submenutool");
                } else {
                    $(element).find(".tool-btn").removeClass("active");
                    $(element).find(".tool-submenu").addClass("hidden");

                    $this.addClass("active");
                    // $this.next(".tool-submenu").removeClass("hidden");
                    $(`.tool-submenu.${$this.data('name')}-class`).removeClass("hidden");

                    //tray_menu.addClass("has-submenutool");
                    //sidemenu.addClass("has-submenutool");
                }
            });
        }
    };
});
app.directive('autoLoad', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var src = scope.$eval(attrs.autoLoad);
            //element.on('change', onChangeHandler);
            //element.on('$destroy', function () {
            //    element.off();
            //});
            scope.$watch($parse(attrs.autoLoad), function (newval) {
                var src = newval;
                if (element.length && element.length > 0 && src != '' && src != null) {
                    element[0].src = src;
                    element.css('background', 'white');
                }
            });
        }
    };
});

app.directive('fabricCanvas', function () {
    return {
        restrict: 'A',
        link: function (scope, el, attrs) {
            var innerCanvas = el[0].querySelector('canvas');
            var outerWidth = attrs.width;
            var outerHeight = attrs.height;
            var canvas = new fabric.Canvas(innerCanvas, {
                width: outerWidth, height: outerHeight,
                fireRightClick: true,  // <-- enable firing of right click events
                // fireMiddleClick: true, // <-- enable firing of middle click events
                stopContextMenu: true, // <--  prevent context menu from showing 
                getScale: () => canvas.viewportTransform[0],
                getLeft: () => canvas.viewportTransform[4],
                getTop: () => canvas.viewportTransform[5],
            });
            scope.canvas = canvas;
            if (scope.initPencil) {
                scope.initPencil();
            }
            $(window).on("keydown", function (e) {
                console.log(e.keyCode);
                if (e.keyCode === 46) {

                    deleteObjects(canvas.getActiveObjects());
                }
                if (e.keyCode === 16) {
                    console.log('shifting');
                    // shift key
                    scope.isSelecting = true;
                }
            });
            scope.canvas.on("mouse:up", function (e) {
                if (
                    e.target != null &&
                    e.target.type != "image" &&
                    e.target.name != "quiz-inputObj" &&
                    e.target.name != "line-style" &&
                    e.target.name != "custom-group" &&
                    !scope.isDrawLine &&
                    !scope.isChoosePort
                ) {
                    if (e.target._objects && e.target._objects.length > 0) {
                        if (findTargetPort(e.target).x1) {
                        } else {
                            mouseUp(e);
                        }
                    } else {
                        mouseUp(e);
                    }
                } else {
                    if (e.target) {
                        console.log(e.target);
                    }
                }
            });
            function mouseUp(e) {
                let object = e.target;
                scope.objectMiro = null;
                if (
                    //!isChoosePort &&
                    object.type === "group" &&
                    object.name !== "quiz" &&
                    object.name !== "media"
                ) {
                    if (e.button === 3) {
                        object.clicked = false;
                    }
                    if (object.clicked) {
                        object._objects.forEach((obj) => {
                            if (obj.type == "textbox") {
                                handleTextEdit(object, obj);
                            }
                        });
                        object.clicked = false;
                    } else object.clicked = true;
                }
            }

            function deleteObjects(objects) {
                if (objects) {
                    objects.forEach(function (object) {
                        // remove lineConnect + curvePoint
                        canvas.getObjects().forEach((item) => {
                            if (
                                object.name === "curve-point" &&
                                item.objectID === object.lineID
                            ) {
                                canvas.remove(item);
                            } else if (
                                item.name === "lineConnect" &&
                                (item.idObject1 === object.objectID ||
                                    item.idObject2 === object.objectID)
                            ) {
                                const curvePoint = canvas.getObjects()
                                    .find((obj) => obj.lineID === item.objectID);
                                canvas.remove(item);
                                curvePoint && canvas.remove(curvePoint);
                            }
                        });
                        canvas.remove(object);
                    });
                }
            }
            function handleTextEdit(object, textObj) {
                console.log("edit text");
                //$("#edit-form-textbox").css({ visibility: "hidden" });

                let textForEditing = new fabric.Textbox(textObj.text, {
                    originX: "center",
                    originY: "center",

                    textAlign: textObj.textAlign,
                    fontSize: textObj.fontSize,
                    width: object.width,
                    fontFamily: textObj.fontFamily,

                    left: textObj.left + object.left + object.width / 2,
                    top: textObj.top + object.top + object.height / 2,
                    scaleX: textObj.scaleX,
                    scaleY: textObj.scaleY,
                    name: "textBoxEditor",
                });

                if (object.name === "latex") {
                    textForEditing.set({
                        fontSize: object.fontSize,
                    });
                }

                // hide group inside text
                object.visible = false;
                // note important, text cannot be hidden without this
                object.addWithUpdate();
                textForEditing.set({
                    visible: true,
                    hasBorders: true,
                    hasControls: false,
                });

                // now add this temporary obj to canvas
                canvas.add(textForEditing);
                canvas.setActiveObject(textForEditing);
                // make the cursor showing
                textForEditing.enterEditing();
                textForEditing.selectAll();

                // editing:exited means you click outside of the textForEditing
                textForEditing.on("editing:exited", () => {
                    let newVal = textForEditing.text;
                    let oldVal = textObj.text;

                    canvas.remove(textForEditing);
                    if (newVal != oldVal) {
                        if (object.name === "latex") {
                            //var options = {
                            //    fontSize: object.fontSize,
                            //    top: object.top,
                            //    left: object.left,
                            //};
                            //createLatex(newVal, options);
                            //deleteObjects([object]);
                        } else {
                            textObj.set({
                                text: newVal,
                                // width: textForEditing.width,
                                // fontSize: textForEditing.fontSize,
                                // fontFamily: textForEditing.fontFamily
                            });

                            object.set({
                                visible: true,
                            });
                            // comment before, you must call this
                            object.addWithUpdate();

                            // we do not need textForEditing anymore
                            // updateLocal(pool_data, object.objectID, object.toObject(customAttributes), socket);
                            // optional, buf for better user experience
                            // canvas.setActiveObject(object);
                        }
                    } else {
                        object.set({
                            visible: true,
                        });
                        object.addWithUpdate();
                        // canvas.setActiveObject(object);
                    }
                });
            }
        }
    };

    function findTargetPort(object, ports) {
        let points = new Array(4);
        let port;
        if (ports) {
            port = ports;
        } else {
            port = object.__corner;
        }
        switch (port) {
            case "mt":
                points = [
                    object.left + (object.width * object.scaleX) / 2,
                    object.top,
                    object.left + (object.width * object.scaleX) / 2,
                    object.top,
                ];
                break;
            case "mr":
                points = [
                    object.left + object.width * object.scaleX,
                    object.top + (object.height * object.scaleY) / 2,
                    object.left + object.width * object.scaleX,
                    object.top + (object.height * object.scaleY) / 2,
                ];
                break;
            case "mb":
                points = [
                    object.left + (object.width * object.scaleX) / 2,
                    object.top + object.height * object.scaleY,
                    object.left + (object.width * object.scaleX) / 2,
                    object.top + object.height * object.scaleY,
                ];
                break;
            case "ml":
                points = [
                    object.left,
                    object.top + (object.height * object.scaleY) / 2,
                    object.left,
                    object.top + (object.height * object.scaleY) / 2,
                ];
                break;

            default:
                break;
        }

        return {
            x1: points[0],
            y1: points[1],
            x2: points[2],
            y2: points[3],
        };
    }
});
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
            $http.post('/Admin/edmsWarehouseManager/GenQRCode?code=' + data).then(callback);
        },
        getObjectsType: function (callback) {
            $http.post('/Admin/EDMSRepository/GetObjectsType').then(callback);
        },
        getListObject: function (data, callback) {
            $http.get('/Admin/EDMSRepository/GetListObject?objectType=' + data).then(callback);
        },
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListWareHouse').then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListFloorByWareHouseCode?wareHouseCode=' + data).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListLineByFloorCode?floorCode=' + data).then(callback);
        },
        getListRackByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListRackByFloorCode?floorCode=' + data).then(callback);
        },
        getPositionByProdID: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/GetPositionByProdID?id=' + data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/GetListUser').then(callback);
        },
        getRackDetail: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetRackDetail?rackCode=' + data).then(callback);
        },
        getPackDetail: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetPackDetail?cabinetCode=' + data).then(callback);
        },
        saveData: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/SaveData', data).then(callback);
        },
        loadData: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/LoadData?floorCode=' + data).then(callback);
        },

        getproductgroup: function (callback) {
            $http.post('/Admin/materialProduct/GetProductGroup/').then(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/Admin/materialProduct/GetProductUnit/').then(callback);
        },
        getProductImpType: function (callback) {
            $http.post('/Admin/materialProduct/GetProductImpType/').then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/materialProduct/GetProductStatus/').then(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/Admin/materialProduct/GetProductTypes/').then(callback);
        },
        getListCatalogue: function (callback) {
            $http.post('/Admin/materialProduct/GetProductCatelogue/').then(callback);
        },
        //New Dynamic
        getListArea: function (callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListAreaCategory?type=AREA&parentCode=').then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListAreaCategory?type=FLOOR&parentCode=' + data).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListAreaCategory?type=LINE&parentCode=' + data).then(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListAreaCategory?type=RACK&parentCode=' + data).then(callback);
        },
        getListAreaByParentCode: function (data, data1, callback) {
            $http.get(`/Admin/EDMSDiagramWarehouse/GetListAreaCategory?type=${data}&parentCode=${data1}`).then(callback);
        },
        // End New Dynamic

        //Thêm sửa xóa danh mục khu vực
        insertCategory: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/InsertCategory', data).then(callback);
        },
        getCategory: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/GetCategory?id=' + data).then(callback);
        },
        updateCategory: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/UpdateCategory', data).then(callback);
        },
        deleteCategory: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/DeleteCategory?id=' + data).then(callback);
        },

        //Thêm sửa xóa neo
        insertMapping: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/InsertMapping', data).then(callback);
        },
        updateMapping: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/UpdateMapping', data).then(callback);
        },
        updateMappingShape: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/UpdateMappingShape', data).then(callback);
        },
        saveMappingShape: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/SaveMappingShape', data).then(callback);
        },
        getMapping: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/GetMapping?position=' + data).then(callback);
        },
        getObjectDetail: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetObjectDetail?objectCode=' + data).then(callback);
        },
        deleteMapping: function (data, callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/DeleteMapping?id=' + data).then(callback);
        },
        getListMapping: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMapping?start=' + data).then(callback);
        },
        getListMappingFilter: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMappingFilter?start=' + data).then(callback);
        },
        getListMappingFilterMisc: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMappingFilterMisc?start=' + data).then(callback);
        },
        // upload image
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UploadImage/', data, callback);
        },
        // data type
        getListATTRTYPE: function (callback) {
            $http.post('/Admin/AttributeSetup/GetListATTRTYPE').then(callback);
        },
        //Exort Excel
        exportExcel: function (callback) {
            $http.post('/Admin/EDMSDiagramWarehouse/ExportExcel').then(callback);
        },
        //Update Weight, Size and Quantity
        UpdateATTR: function (data, callback) {
            $http.put('/Admin/EDMSDiagramWarehouse/UpdateATTR', data).then(callback);
        },
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
        $rootScope.listWareHouse = [
            //{ Code: '', Name: caption.COM_TXT_ALL }
        ];
        $rootScope.listArea = [
            //{ Code: '', Name: caption.COM_TXT_ALL }
        ];
        $rootScope.listFloor = [{ Code: '', Name: caption.COM_TXT_ALL }];
        $rootScope.listLine = [{ Code: '', Name: caption.COM_TXT_ALL }];
        $rootScope.listRack = [{ Code: '', Name: caption.COM_TXT_ALL }];
        $rootScope.listPosition = [{ Code: '', Name: caption.COM_TXT_ALL }];
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
    //manager
    $rootScope.listWareHouse = [];
    $rootScope.listArea = [];
    $rootScope.listFloor = [];
    $rootScope.listLine = [];
    $rootScope.listRack = [];
    $rootScope.listPosition = [];

    $rootScope.wareHouseID = null;
    $rootScope.areaID = null;
    $rootScope.floorID = null;
    $rootScope.lineID = null;
    $rootScope.rackID = null;
    $rootScope.positionID = null;

    $rootScope.wareHouseCode = null;
    $rootScope.areaCode = null;
    $rootScope.floorCode = null;
    $rootScope.lineCode = null;
    $rootScope.rackCode = null;
    $rootScope.positionCode = null;

    $rootScope.wareHouseReload = false;
    $rootScope.floorReload = false;
    $rootScope.lineReload = false;
    $rootScope.rackReload = false;
    $rootScope.positionReload = false;

    $rootScope.StatusFloor = [{
        Value: '1',
        Name: 'Hoạt động'
    }, {
        Value: '0',
        Name: 'Không hoạt động'
    }];

    $rootScope.StatusLine = [{
        Value: '1',
        Name: 'Hoạt động'
    }, {
        Value: '0',
        Name: 'Không hoạt động'
    }];

    $rootScope.StatusRack = [{
        Value: '1',
        Name: 'Hoạt động'
    }, {
        Value: '0',
        Name: 'Không hoạt động'
    }];
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/EDMSDiagramWarehouse/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $http, $q, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {
    $scope.model = {
        WhsCode: '',
        AreaCode: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        PositionCode: '',
        Mapping: ''
    };
    $scope.modelMap = {
        WhsCode: '',
        AreaCode: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        PositionCode: '',
        Mapping: '',
        CategoryCode: '',
        Type: ''
    };
    $scope.setMap = false;
    $scope.editSvgMic = false;
    $scope.showSearch = true;
    console.log($scope.showSearch)
    $scope.showObjectProperty = false;
    $scope.listAreaMap = [];
    $scope.listFloorMap = [];
    $scope.listLineMap = [];
    $scope.listRackMap = [];
    $scope.listPositionMap = [];
    $scope._clipboard = {};
    $scope.center = null;
    $scope.zoomFocus = false;
    // store custom attributes to save and load json
    $scope.customAttributes = [
        // canvas
        "backgroundColor",
        "typeGrid",
        "layer",

        // object
        "fontSize",
        "textAlign",
        "underline",
        "fontStyle",

        // group
        "groupID",

        "name",
        "id",
        "port1",
        "port2",
        "idObject1",
        "idObject2",
        "objectID",
        "objectCode",
        "port",
        "lineID",
        "line2",
        "isDrop",
        "isDrag",
        "isBackground",
        "answerId",
        "text",
        "subTargetCheck",

        // 'isChoosePort',
        "colorBorder",
        "widthBorder",
        "curve",
        "hasShadow",
        "shadowObj",
        "fixed",
        "position",

        "isMoving",
        "isRepeat",
        "isDrawingPath",
        "speedMoving",
        "pathObj",
        "soundMoving",
        "nameSoundMoving",

        "blink",
        "lineStyle",
        "lineType",
        "lockMovementX",
        "lockMovementY",
        "customProps",
        "funct",
        "coord_x1",

        "select",
        "status",
        "colorText",
        "colorTextSelected",
        "colorSelected",
        "colorUnselected",
        "soundSelected",
        "nameSoundSelected",
        "soundUnselected",
        "nameSoundUnselected",
        // 'imageContent',
        "nameImageContent",

        "input",
        "soundTyping",
        "nameSoundTyping",

        "snap",
        "soundSnap",
        "nameSoundSnap",

        // device record
        "nameDevice",
        "device",
        "src",
        "countRecord",
        "files",

        //worksheet
        "soundWorksheet",
    ];
    $scope.cancel = function () {
        //$scope.setMap = false;
        /* $scope.momo = false;*/
        hidePopupMenu();
    };

    $scope.toggleObjectProperty = function () {
        $rootScope.reloadFloorMap();
        $rootScope.reloadLineMap();
        $rootScope.reloadRackMap();
        $rootScope.reloadPositionMap();
        $scope.showObjectProperty = !$scope.showObjectProperty;
    }

    $scope.openOption = function () {
        $scope.setMap = true;
        setTimeout($scope.$apply());
    }

    $scope.viewSearch = function () {
        $scope.showSearch = !$scope.showSearch;
        var parent_svg = document.getElementsByClassName('parent_svg');
        var contentMain = document.getElementById('contentMain');
        let height = contentMain.clientHeight;
        let width = contentMain.clientWidth;
        // if (parent_svg && parent_svg.length > 0) {
        //     if (!$scope.showSearch) {
        //         height = contentMain.clientHeight - 150;
        //         width = contentMain.clientWidth - 80;
        //     }
        //     parent_svg[0].setAttribute('height', height);
        //     parent_svg[0].style.height = `${height}px`;
        //     parent_svg[0].setAttribute('width', width);
        //     parent_svg[0].style.width = `${width}px`;
        // }
        if (!$scope.showSearch) {
            //parent_svg[0].setAttribute('height', height);
            //parent_svg[0].style.height = `${height}px`;
            //parent_svg[0].setAttribute('width', width);
            //parent_svg[0].style.width = `${width}px`;
            $('#contentMain').css('width', width + 220)
            $('.parent_svg').css('width', width + 220)
            $('.parent_svg').css('height', height + 50)

            $('#menu-web').addClass('hidden')
            $('.header-navbar').addClass('hidden')
            $('#nav-right').addClass('hidden')
            $('.app-content').css('padding-left', 0)
            $('.app-content').css('top', 0)
            $('.content-wrapper').removeClass('padding-right-80')
            $('.breadcrumb').addClass('hidden')
            $('.content-wrapper').css('padding', 0)
        } else {
            //height = contentMain.clientHeight - 150;
            //width = contentMain.clientWidth - 80;
            //parent_svg[0].setAttribute('height', height);
            //parent_svg[0].style.height = `${height}px`;
            //parent_svg[0].setAttribute('width', width);
            //parent_svg[0].style.width = `${width}px`;
            $('#contentMain').css('width', width - 220)
            $('.parent_svg').css('width', width - 220)
            $('.parent_svg').css('height', height - 50)

            $('#menu-web').removeClass('hidden')
            $('.header-navbar').removeClass('hidden')
            $('#nav-right').removeClass('hidden')
            $('.breadcrumb').removeClass('hidden')
            $('.app-content').removeAttr('style')
            $('.content-wrapper').addClass('padding-right-80')
            $('.content-wrapper').removeAttr('style')
        }
        $scope.canvas.setHeight(height);
        $scope.canvas.setWidth(width);
        $scope.canvas.renderAll();
        setTimeout(() => $scope.$apply());
    }

    //fullscreen
    $scope.fullscreen = false;
    $scope.checkFullScreen = function () {
        $scope.fullscreen = !$scope.fullscreen
        var contentMain = document.getElementById('contentMain');
        let height = contentMain.clientHeight;
        let width = contentMain.clientWidth;
        if ($scope.fullscreen) {
            openFullscreen()

            $('#contentMain').css('width', width + 220)
            $('.parent_svg').css('width', width + 220)
            $('.parent_svg').css('height', height + 50)

            $('#menu-web').addClass('hidden')
            $('.header-navbar').addClass('hidden')
            $('#nav-right').addClass('hidden')
            $('.app-content').css('padding-left', 0)
            $('.app-content').css('top', 0)
            $('.content-wrapper').removeClass('padding-right-80')
            $('.breadcrumb').addClass('hidden')
            $('.content-wrapper').css('padding', 0)
        } else {
            closeFullscreen()

            $('#contentMain').css('width', width - 220)
            $('.parent_svg').css('width', width - 220)
            $('.parent_svg').css('height', height - 50)

            $('#menu-web').removeClass('hidden')
            $('.header-navbar').removeClass('hidden')
            $('#nav-right').removeClass('hidden')
            $('.breadcrumb').removeClass('hidden')
            $('.app-content').removeAttr('style')
            $('.content-wrapper').addClass('padding-right-80')
            $('.content-wrapper').removeAttr('style')
        }
    }

    function openFullscreen() {
        let elem = document.documentElement;

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            /* Chrome, Safari & Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            /* IE/Edge */
            elem.msRequestFullscreen();
        }
    }

    function closeFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    $("#close-editor-textbox").on("click", function () {
        $("#edit-form-textbox").css({ visibility: "hidden" });
        $("#sub-menu").css({ visibility: "hidden" });
        // $('#path-menu').css({ 'visibility': 'hidden' })
    });

    $("#sub-menu li").on("click", function (e) {
        e.stopPropagation();
    });

    function startActiveTextbox(element) {
        element.on('mouseup', function (e) {
            const editForm = $("#edit-form-textbox")[0];
            // left click
            if (e.button === 1) {
            }
            // if(e.button === 2) {
            //     console.log("middle click");
            // }
            // right click
            if (e.button === 3) {
                if (editForm.style.visibility === "hidden" || activeObject !== this) {
                    activeObject = this;
                    if (activeObject.name === "latex") {
                        $(".latex").addClass("hidden");
                    } else {
                        $(".latex").removeClass("hidden");
                    }
                    $("#size-textbox li").removeClass("active");
                    $(`#size-textbox li[value=${activeObject.fontSize}]`).addClass(
                        "active"
                    );
                    $("#textColor-textbox")[0].value = activeObject.colorText;
                    $("#current-size-textbox span:first-child").text(
                        activeObject.fontSize | "Auto"
                    );
                    const zoom = $scope.canvas.getZoom();
                    let top = activeObject.top * zoom + canvas.viewportTransform[5] - 60;
                    let left =
                        (activeObject.left +
                            (activeObject.width / 2) * activeObject.scaleX) *
                        zoom +
                        canvas.viewportTransform[4] -
                        180;

                    if (activeObject.lineType == "waving") {
                        top =
                            Math.cos(activeObject.angle) * activeObject.top * zoom +
                            canvas.viewportTransform[5] -
                            60;
                        left =
                            Math.cos(activeObject.angle) *
                            (activeObject.left +
                                (activeObject.width / 2) * activeObject.scaleX) *
                            zoom +
                            canvas.viewportTransform[4] -
                            180;
                    }

                    $("#edit-form-textbox").css({
                        visibility: "visible",
                        top: top + "px",
                        left: left + "px",
                    });
                } else {
                    hidePopupMenu();
                }
            }
        });
    }

    function handleTextboxRightclick(_this) {
        console.log("right click");
        const editForm = $("#edit-form-textbox")[0];
        if (editForm.style.visibility === "hidden" || $scope.activeObject !== this) {
            if (this) {
                $scope.activeObject = this;
            }
            if (_this) {
                $scope.activeObject = _this;
            }
            $("#textColor-textbox")[0].value = $scope.activeObject.colorText;
            const zoom = $scope.canvas.getZoom();
            let top = $scope.activeObject.top * zoom;
            let left =
                ($scope.activeObject.left + ($scope.activeObject.width / 2) * $scope.activeObject.scaleX) *
                zoom;
            let groupTop =
                $scope.activeObject.group.top * zoom + $scope.canvas.viewportTransform[5] - 60;
            let groupLeft =
                ($scope.activeObject.group.left +
                    ($scope.activeObject.group.width / 2) * $scope.activeObject.group.scaleX) *
                zoom +
                $scope.canvas.viewportTransform[4] -
                180;

            // if (activeObject.lineType == 'waving') {
            //     top = Math.cos(activeObject.angle) * (activeObject.top) * zoom + canvas.viewportTransform[5] - 60;
            //     left = Math.cos(activeObject.angle) * (activeObject.left + (activeObject.width / 2) * activeObject.scaleX) * zoom + canvas.viewportTransform[4] - 180;
            // }

            $("#edit-form-textbox").css({
                visibility: "visible",
                top: top + groupTop + "px",
                left: left + groupLeft + "px",
            });
        } else {
            hidePopupMenu();
        }
    }

    $scope.objectMiro = null;
    function handleMouseUpSvg() {
        var object = this;
        $scope.objectMiro = null;
        if (object.clicked) {
            let obj = object.item(1);
            let textForEditing = new fabric.Textbox(obj.text, {
                top: object.top + object.item(0).height * object.item(0).scaleY + 10,
                left: object.left,
                fontSize: obj.fontSize * object.scaleY,
                fontFamily: obj.fontFamily,
                width: object.item(0).width * object.item(0).scaleX,
                textAlign: "center",
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                name: "textBoxEditor",
            });

            console.log(textForEditing);
            // hide group inside text
            obj.visible = false;
            // note important, text cannot be hidden without this
            // object.addWithUpdate();

            textForEditing.visible = true;
            // do not give controls, do not allow move/resize/rotation on this
            textForEditing.hasControls = false;

            // now add this temporary obj to canvas
            $scope.canvas.add(textForEditing);
            $scope.canvas.setActiveObject(textForEditing);
            // make the cursor showing
            textForEditing.enterEditing();
            textForEditing.selectAll();

            // editing:exited means you click outside of the
            textForEditing.on("text:changed", function () {
                console.log(textForEditing.text);
            });
            textForEditing.on("editing:exited", () => {
                let newVal = textForEditing.text;
                let oldVal = obj.text;

                // then we check if text is changed
                obj.set({
                    text: newVal,
                    visible: true,
                    // width: textForEditing.width,
                    // left: textForEditing.left,

                    // fontSize: textForEditing.fontSize,
                    // fontFamily: textForEditing.fontFamily,
                    textAlign: "center",
                });
                // comment before, you must call this
                // object.addWithUpdate();

                // we do not need textForEditing anymore
                textForEditing.visible = false;
                $scope.canvas.remove(textForEditing);

                // optional, buf for better user experience
                $scope.canvas.setActiveObject(object);
                console.log(object);
            });
            object.clicked = false;
        } else {
            console.log("here 2");

            // object.set({
            //     width: object.item(0).width,
            //     height: object.item(0).height,
            // })

            $scope.canvas.requestRenderAll();

            console.log("obj", object);

            $scope.objectMiro = object;
            object.clicked = true;
        }
    }

    function makeChildSelectable(obj) {
        obj.subTargetCheck = true;
        var listObject = obj._objects;
        for (let index = 0; index < listObject.length; index++) {
            const element = listObject[index];
            if (element.__eventListeners) {
                element.__eventListeners["mousedblclick"] = [];
            }
            console.log(element);
            if (element.type != "textbox" && element.type != "group") {
                element.on("mousedblclick", handleDbclickChild);
            } else if (element.type != "group") {
                element.on("mouseup", function (e) {
                    if (e.button === 1) {
                        console.log("left click");
                    }
                    // if(e.button === 2) {
                    //     console.log("middle click");
                    // }
                    if (e.button === 3) {
                        handleTextboxRightclick(this);
                    }
                });
            } else {
                makeChildSelectable(element);
            }
        }
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

    $scope.obj = {

    };

    var url_string = window.location.href;

    var url = new URL(url_string);
    $scope.isDraging = false;
    $scope.init_position = [];
    $scope.isSelecting = false;
    $scope.isScaling = false;
    $scope.isMoving = false;
    $scope.isRotating = false;
    $scope.isMakingAnswer = false;
    $scope.isDoQuiz = false;
    $scope.drawing = false;
    $scope.mousedown = false;
    $scope.isDrawMovingPath = false;
    $scope.isChoosePort = false;
    $scope.objCover = null;
    $scope.widthCanvas;
    $scope.init = function () {
        $scope.widthCanvas = $('.parent_svg').width();
        console.log($scope.widthCanvas);
        $scope.model.Mapping = url.searchParams.get("mapping");
        if ($scope.model.Mapping) {
            $scope.model.WhsCode = getWarehouse($scope.model.Mapping);
        }
        else {
            $scope.model.WhsCode = url.searchParams.get("WhsCode");
        }
        dataservice.getListArea(function (rs) {
            rs = rs.data;
            //$rootScope.listWareHouse = [{ Code: '', Name: caption.COM_TXT_ALL }];
            $rootScope.listArea = $rootScope.listArea.concat(rs);
            $scope.listAreaMap = rs;
            if ($scope.model.WhsCode) {
                //const warehouse = $scope.listAreaMap.find(x => x.Code === $scope.model.WhsCode);
                $scope.changeWareHouse($scope.model.WhsCode);
                initMap();
            }
            //else if (rs[0]) {
            //    $scope.model.WhsCode = rs[0].Code;
            //    $scope.changeWareHouse(rs[0]);
            //    initMap();
            //}
        });
    };
    function getWarehouse(mapping) {
        const a = mapping.split('_A_');
        const b = a[0];
        const c = b.split('WHS_');
        return c[1];
    }
    function initMap() {
        $(".baolo").draggable();
        $(".menu-3").draggable();
        if ($scope.model.Mapping) {
            $scope.zoomFocus = true;
        }
        setTimeout(function () {
            //$rootScope.drawObject();
            $scope.canvas.on("mouse:down", function (opts) {
                if ($(".tool-btn.active").length > 0) {
                    // if ()
                }

                var target = opts.target;
                var mousePos = $scope.canvas.getPointer(opts.e);
                if (target && target.type == "group-extended") {
                    var obj = opts.subTargets && opts.subTargets[0];
                    if (obj) {
                        target._selectedObject = obj;
                    } else {
                        target._selectedObject = null;
                    }
                    target._showSelectedBorder();
                }

                if ($scope.isChoosePort && target && target.name != "curve-point") {
                    if (!$scope.objCover) {
                        $scope.objCover = target;

                        const circle = new fabric.Circle({
                            top: $scope.objCover.top - 20,
                            left: $scope.objCover.left,
                            fill: "red",
                            radius: 6,
                            selectable: false,
                            blink: true,
                        });

                        $scope.canvas.add(circle);
                        blink(circle);
                        $scope.objCover.portMark = circle;

                        $scope.canvas.discardActiveObject();
                    } else if (target !== $scope.objCover) {
                        $scope.canvas.remove($scope.objCover.portMark);
                        $scope.objCover.portMark = null;

                        const point1 = findTargetPort(target, "mt");
                        const point2 = findTargetPort($scope.objCover, "mt");

                        point1.x2 = point2.x2;
                        point1.y2 = point2.y2;
                        const line = makeLine(
                            $scope.canvas,
                            point1,
                            target.objectID,
                            $scope.objCover.objectID,
                            "mt",
                            "mt",
                            randomID(),
                            userID
                        );

                        // line.selectable = true;
                        // setDefaultAttributes(line);
                        // startActiveObject(line);

                        $scope.objCover = null;
                        $scope.canvas.discardActiveObject();
                    }
                }
            });


            $scope.canvas.on("mouse:up", function (e) {
                $scope.isScaling = false;
                $scope.isMoving = false;
                $scope.isRotating = false;

                if ($scope.canvas.getActiveObject() && !$scope.isMakingAnswer && !$scope.isDoQuiz) {
                    // console.log(canvas.getActiveObject());
                    var object = $scope.canvas.getActiveObject();

                }
                // console.log('Event mouse:up Triggered');
            });

            $scope.canvas.on('mouse:down', function (e) {
                if (e.button === 1) {
                    $scope.isDraging = true;
                    $scope.init_position[0] = e.pointer.x;
                    $scope.init_position[1] = e.pointer.y;
                }
                // if(e.button === 2) {
                //     console.log("middle click");
                // }
                if (e.button === 3) {
                }
            })

            $scope.canvas.on('mouse:up', function (e) {
                $scope.isDraging = false;
                $scope.isSelecting = false;
                console.log('stop select');
            })

            $scope.canvas.on('mouse:move', function (options) {
                if ($scope.isDraging
                    && !$scope.drawing
                    && !$scope.isMoving
                    && !$scope.isScaling
                    && !$scope.isRotating
                    && !options.target
                    && !$scope.isSelecting
                    && !$scope.isDrawLine &&
                    !$scope.isGroup
                ) {
                    const x = options.pointer.x - $scope.init_position[0];
                    const y = options.pointer.y - $scope.init_position[1];

                    hidePopupMenu();

                    let delta = new fabric.Point(x, y);
                    $scope.canvas.relativePan(delta);

                    $scope.init_position[0] = options.pointer.x;
                    $scope.init_position[1] = options.pointer.y;
                    // }
                }
            })

            $scope.canvas.on("mouse:up", function () {
                if ($scope.drawing && $scope.mousedown && !$scope.isDrawMovingPath) {
                    $scope.mousedown = false;
                    // emitEvent()
                }

                // this for draw line
                // if (isDrawLine) {
                //     isDown = false;
                //     drawLine.setCoords();
                //     canvas.setActiveObject(drawLine).renderAll();
                // }
            });
        }, 1000);
    }
    $scope.init();

    $scope.update = function () {
        $scope.canvas.on('object:added', displayJSON);
        $scope.canvas.on('object:removed', displayJSON);
        $scope.canvas.on('object:modified', displayJSON);
        //setTimeout(function () {
        //    $(".RACK").dblclick(function () {
        //        var node = canvas.getPrimarySelection();
        //        if (node !== null) {
        //            $scope.rackDetail(node.id);
        //        }
        //    });

        //    $(".CABINET").dblclick(function () {
        //        var node = canvas.getPrimarySelection();
        //        if (node !== null) {
        //            $scope.packDetail(node.id);
        //        }
        //    });

        //    $(".rotate").click(function (rs) {
        //        var node = canvas.getPrimarySelection();
        //        var x = node.getX();
        //        var y = node.getY();
        //        if (node.path === "/images/wareHouse/rack_ngang.svg") {
        //            canvas.remove(node);
        //            var name = node.children.data[2].figure.text;
        //            var light = new draw2d.shape.basic.Image({ path: "/images/wareHouse/linght.svg", width: 30, height: 12, x: 35, y: 7, bgColor: "lime", stroke: 0.1, color: "#000" });
        //            var figure3 = new draw2d.shape.basic.Rectangle({ width: 40, height: 300, x: -40, y: 0, bgColor: "#fff", stroke: 0.1, color: "#000" });
        //            figure3.addCssClass('value');

        //            if ((node.children.data[2].figure.text).length < 15) {
        //                var txt11 = new draw2d.shape.basic.Label({ text: "" + node.children.data[2].figure.text, height: 10, x: -43, angle: 90, y: 20, stroke: 0 });
        //                txt11.addCssClass("txt1");
        //            }
        //            if ((node.children.data[2].figure.text).length >= 15 && (node.children.data[2].figure.text).length < 25) {
        //                var txt11 = new draw2d.shape.basic.Label({ text: "" + node.children.data[2].figure.text, height: 10, x: -66, angle: 90, y: 47, stroke: 0 });
        //                txt11.addCssClass("txt1");
        //            }
        //            else {
        //                if ((node.children.data[2].figure.text).length > 25) {
        //                    var txt11 = new draw2d.shape.basic.Label({ text: "" + node.children.data[2].figure.text, height: 10, x: -90, angle: 90, y: 70, stroke: 0 });
        //                    txt11.addCssClass("txt1");
        //                }
        //            }
        //            if ((node.children.data[3].figure.text).length < 10) {
        //                var txt22 = new draw2d.shape.basic.Label({ text: "" + node.children.data[3].figure.text, height: 10, x: -30, y: 180, angle: 90, stroke: 0, });
        //                txt22.addCssClass("txt2");
        //            }
        //            if ((node.children.data[3].figure.text).length < 15 && (node.children.data[3].figure.text).length > 10) {
        //                var txt22 = new draw2d.shape.basic.Label({ text: "" + node.children.data[3].figure.text, height: 10, x: -47, angle: 90, y: 195, stroke: 0 });
        //                txt22.addCssClass("txt2");
        //            }
        //            if ((node.children.data[3].figure.text).length >= 15 && (node.children.data[3].figure.text).length < 25) {
        //                var txt22 = new draw2d.shape.basic.Label({ text: "" + node.children.data[3].figure.text, height: 10, x: -55, angle: 90, y: 200, stroke: 0 });
        //                txt22.addCssClass("txt2");
        //            }

        //            var txt33 = new draw2d.shape.basic.Label({ text: "" + node.children.data[4].figure.text, height: 10, angle: 90, x: -65, y: 27, stroke: 0 });

        //            txt33.addCssClass("txt3");

        //            var txt55 = new draw2d.shape.basic.Label({ text: "" + node.children.data[5].figure.text, height: 10, x: -70, angle: 90, y: 200, stroke: 0 });

        //            txt55.addCssClass("txt5");
        //            var rotate2 = new draw2d.shape.basic.Image({ path: "/images/wareHouse/rotate.png", width: 20, height: 20, y: 280, x: 80, visible: true });
        //            rotate2.addCssClass('rotate');
        //            var rack_doc = new Rack({ height: 300, width: 100, stroke: 1, x: 100, y: 100, visible: true });
        //            rack_doc.setMinWidth(100);
        //            rack_doc.setMinHeight(280);
        //            rack_doc.attr({
        //                path: "/images/wareHouse/rack_doc.svg"
        //            });
        //            rack_doc.setId(node.id);
        //            rack_doc.addCssClass("RACK");
        //            rack_doc.add(figure3, new draw2d.layout.locator.Locator());
        //            rack_doc.add(light, new draw2d.layout.locator.Locator());

        //            rack_doc.add(txt11, new draw2d.layout.locator.Locator());
        //            rack_doc.add(txt22, new draw2d.layout.locator.Locator());
        //            rack_doc.add(txt33, new draw2d.layout.locator.Locator());

        //            rack_doc.add(txt55, new draw2d.layout.locator.Locator());
        //            rack_doc.add(rotate2, new draw2d.layout.locator.Locator());
        //            canvas.add(rack_doc, x, y);

        //            rotate2.on('click', function () {
        //                var node2 = canvas.getPrimarySelection();
        //                canvas.remove(node2);
        //                node.x = node2.x;
        //                node.y = node2.y;
        //                canvas.add(node);

        //                $scope.update();
        //                displayJSON(canvas);
        //            });
        //            displayJSON(canvas);
        //        }
        //        if (node.path == "/images/wareHouse/rack_doc.svg") {
        //            canvas.remove(node);
        //            var figure4 = new draw2d.shape.basic.Image({ path: "/images/wareHouse/linght.svg", width: 30, height: 12, x: 135, y: 5, bgColor: "lime", stroke: 0.1, color: "#000" });

        //            var figure1 = new draw2d.shape.basic.Rectangle({ width: 300, height: 40, x: 0, y: 100, bgColor: "#fff", stroke: 0.1, color: "#000" });
        //            figure1.addCssClass('value');
        //            var txt1 = new draw2d.shape.basic.Label({ text: "" + node.children.data[2].figure.text, height: 10, x: 0, y: 100, stroke: 0 });
        //            txt1.addCssClass("txt1");
        //            var txt2 = new draw2d.shape.basic.Label({ text: "" + node.children.data[3].figure.text, height: 10, x: 150, y: 100, stroke: 0, color: "#fff" });
        //            txt2.addCssClass("txt2");
        //            var txt3 = new draw2d.shape.basic.Label({ text: "" + node.children.data[4].figure.text, height: 10, x: 0, y: 120, stroke: 0 });

        //            txt3.addCssClass("txt3");

        //            var txt5 = new draw2d.shape.basic.Label({ text: "" + node.children.data[5].figure.text, height: 10, x: 150, y: 120, stroke: 0 });

        //            txt5.addCssClass("txt5");
        //            var rotate = new draw2d.shape.basic.Image({ path: "/images/wareHouse/rotate.png", width: 20, height: 20, y: 80, x: 303, visible: true });
        //            rotate.addCssClass('rotate');
        //            var rack_ngang = new Rack({ height: 100, width: 300, stroke: 1, x: 100, angle: 89, y: 100, visible: true });

        //            canvas.add(rack_ngang, x, y);
        //            rack_ngang.setId(node.id);
        //            rack_ngang.setMinWidth(300);
        //            rack_ngang.setMinHeight(100);

        //            rack_ngang.attr({
        //                path: "/images/wareHouse/rack_ngang.svg"
        //            });
        //            rack_ngang.addCssClass("RACK");
        //            rack_ngang.add(figure1, new draw2d.layout.locator.Locator());
        //            rack_ngang.add(figure4, new draw2d.layout.locator.Locator());
        //            rack_ngang.add(txt1, new draw2d.layout.locator.Locator());
        //            rack_ngang.add(txt2, new draw2d.layout.locator.Locator());
        //            rack_ngang.add(txt3, new draw2d.layout.locator.Locator());
        //            rack_ngang.add(txt5, new draw2d.layout.locator.Locator());
        //            rack_ngang.add(txt5, new draw2d.layout.locator.Locator());
        //            rack_ngang.add(rotate, new draw2d.layout.locator.Locator());

        //            rotate.on('click', function () {
        //                var node2 = canvas.getPrimarySelection();
        //                canvas.remove(node2);
        //                node.x = node2.x;
        //                node.y = node2.y;
        //                canvas.add(node);
        //                $scope.update();
        //                displayJSON(canvas);
        //            });
        //            displayJSON(canvas);
        //        }
        //    });
        //}, 100);

    }
    $scope.Clear = function (rs) {
        $scope.model.WhsCode = "";
        $scope.listFloor = "";
        var canvas = $rootScope.canvas2;
        canvas.clear();
    }

    $scope.zoomout = function (rs) {
        //var canvas = $rootScope.canvas2;
        //canvas.setZoom(canvas.getZoom() * 1.1, true);
        $scope.canvas.setZoom($scope.canvas.getZoom() / 1.1);
    }
    $scope.zoomin = function (rs) {
        //var canvas = $rootScope.canvas2;
        //canvas.setZoom(canvas.getZoom() * 0.9, true);
        $scope.canvas.setZoom($scope.canvas.getZoom() * 1.1);
    }
    $scope.zoomInit = function () {
        $scope.canvas.setZoom(0.18);
        console.log('zoomInit');
    }
    $rootScope.maxFloorHeight = 500;
    $rootScope.reloadCategory = function (type) {
        switch (type) {
            case "AREA": {
                dataservice.getListArea(function (rs) {
                    rs = rs.data;
                    $rootScope.listArea = [{ Code: '', Name: caption.COM_TXT_ALL }];
                    $rootScope.listArea = $rootScope.listArea.concat(rs);
                });
                break;
            }
            case "FLOOR": {
                $rootScope.reloadFloor();
                break;
            }
            case "LINE": {
                $rootScope.reloadLine();
                break;
            }
            case "RACK": {
                $rootScope.reloadRack();
                break;
            }
            case "POSITION": {
                $rootScope.reloadPosition();
                break;
            }
        }
        $rootScope.drawObject();
    }
    $scope.changeWareHouse = function (code) {
        $rootScope.wareHouseCode = $scope.model.WhsCode;
        // $scope.model.Mapping = code;
        $rootScope.drawObject();
    };
    $scope.changeArea = function (item) {
        $rootScope.areaID = item.Id;
        $rootScope.areaCode = $scope.model.AreaCode;
        $scope.model.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $scope.model.AreaCode;
        $rootScope.floorCode = '';
        $rootScope.lineCode = '';
        $rootScope.rackCode = '';
        $rootScope.positionCode = '';
        $scope.model.FloorCode = '';
        $scope.model.LineCode = '';
        $scope.model.RackCode = '';
        $scope.model.PositionCode = '';
        $scope.zoomFocus = false;
        $rootScope.reloadFloor();
        //$rootScope.drawObject();
    };
    $rootScope.reloadFloor = function () {
        dataservice.getListFloorByWareHouseCode($rootScope.wareHouseCode, function (rs) {
            rs = rs.data;
            $scope.listFloor = [{ Code: '', Name: caption.COM_TXT_ALL }];
            $scope.listFloor = $scope.listFloor.concat(rs);
            //var div = "";
            //if (rs.length > 0) {
            //    var height = 2450 / rs.length <= $rootScope.maxFloorHeight ? 2450 / rs.length : $rootScope.maxFloorHeight;
            //    for (var i = 0; i < rs.length; i++) {
            //        div += '<div class ="' + rs[i].Code + '" style="text-align:center;width: 2000px;  border: 1px solid red; margin:10px ;height:' + height + 'px"><label style = "z-index: 2000;font-weight: 600;font-size:15px; margin-top: 50px; z-index: 999;">' + rs[i].Name + '</label></div>';
            //        $(".milestone").html(div);
            //    }
            //}
            //else {
            //    $(".milestone").html("");
            //}
        });
    };
    $scope.changeFloor = function (item) {
        $rootScope.floorID = item.Id;
        $rootScope.floorCode = $scope.model.FloorCode;
        $scope.model.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $rootScope.areaCode + "_F_" + $scope.model.FloorCode;
        $rootScope.lineCode = '';
        $rootScope.rackCode = '';
        $rootScope.positionCode = '';
        $scope.model.LineCode = '';
        $scope.model.RackCode = '';
        $scope.model.PositionCode = '';
        $scope.zoomFocus = true;
        var div = "";
        div += '<div class ="' + item.Code + '" style="text-align:center;width: 2000px;  border: 1px solid red; margin:10px ;height:' + $rootScope.maxFloorHeight + 'px"><label style = "z-index: 2000;font-weight: 600;font-size:15px; margin-top: 50px; z-index: 999;">' + item.Name + '</label></div>';
        $(".milestone").html(div);
        $rootScope.reloadLine();
    };
    $rootScope.reloadLine = function () {
        dataservice.getListLineByFloorCode($rootScope.floorCode, function (rs) {
            rs = rs.data;
            $scope.listLine = [{ Code: '', Name: caption.COM_TXT_ALL }];
            $scope.listLine = $scope.listLine.concat(rs);
        });
    };
    $scope.changeLine = function (item) {
        $rootScope.lineID = item.Id;
        $rootScope.lineCode = $scope.model.LineCode;
        $scope.model.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $rootScope.areaCode + "_F_" + $rootScope.floorCode + "_L_" + $scope.model.LineCode;
        $rootScope.rackCode = '';
        $rootScope.positionCode = '';
        $scope.model.RackCode = '';
        $scope.model.PositionCode = '';
        $scope.zoomFocus = true;
        $rootScope.reloadRack();
    };
    $rootScope.reloadRack = function () {
        dataservice.getListRackByLineCode($rootScope.lineCode, function (rs) {
            rs = rs.data;
            $scope.listRack = [{ Code: '', Name: caption.COM_TXT_ALL }];
            $scope.listRack = $scope.listRack.concat(rs);
        });
    };
    $scope.changeRack = function (item) {
        $rootScope.rackID = item.Id;
        $rootScope.rackCode = $scope.model.RackCode;
        $scope.model.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $rootScope.areaCode + "_F_" + $rootScope.floorCode + "_L_" + $rootScope.lineCode + "_R_" + $scope.model.RackCode;
        $rootScope.positionCode = '';
        $scope.model.PositionCode = '';
        $scope.zoomFocus = true;
        $rootScope.reloadPosition();
    };
    $rootScope.reloadPosition = function () {
        dataservice.getListAreaByParentCode("POSITION", $rootScope.rackCode, function (rs) {
            rs = rs.data;
            $scope.listPosition = [{ Code: '', Name: caption.COM_TXT_ALL }];
            $scope.listPosition = $scope.listPosition.concat(rs);
        });
    };
    $scope.changePosition = function (item) {
        $rootScope.positionID = item.Id;
        $rootScope.positionCode = $scope.model.PositionCode;
        $scope.zoomFocus = true;
        $scope.model.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $rootScope.areaCode + "_F_" + $rootScope.floorCode + "_L_" + $rootScope.lineCode + "_R_" + $rootScope.rackCode + "_P_" + $scope.model.RackCode;
    };

    //change map
    $scope.changeAreaMap = function (item) {
        $scope.modelMap.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $scope.modelMap.AreaCode;
        $scope.modelMap.FloorCode = '';
        $scope.modelMap.LineCode = '';
        $scope.modelMap.RackCode = '';
        $scope.modelMap.PositionCode = '';
        $scope.modelMap.Type = 'AREA';
        $scope.modelMap.CategoryCode = $scope.modelMap.AreaCode;
        $rootScope.reloadFloorMap();
    };
    $rootScope.reloadFloorMap = function () {
        dataservice.getListFloorByWareHouseCode('', function (rs) {
            rs = rs.data;
            $scope.listFloorMap = rs;
        });
    };
    $scope.changeFloorMap = function (item) {
        $scope.modelMap.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $scope.modelMap.AreaCode + "_F_" + $scope.modelMap.FloorCode;
        $scope.modelMap.LineCode = '';
        $scope.modelMap.RackCode = '';
        $scope.modelMap.PositionCode = '';
        $scope.modelMap.Type = $scope.modelMap.FloorCode ? 'FLOOR' : 'AREA';
        $scope.modelMap.CategoryCode = $scope.modelMap.FloorCode ?? $scope.modelMap.AreaCode;
        $rootScope.reloadLineMap();
    };
    $rootScope.reloadLineMap = function () {
        dataservice.getListLineByFloorCode('', function (rs) {
            rs = rs.data;
            $scope.listLineMap = rs;
        });
    };
    $scope.changeLineMap = function (item) {
        $scope.modelMap.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $scope.modelMap.AreaCode + "_F_" + $scope.modelMap.FloorCode + "_L_" +
            $scope.modelMap.LineCode;
        $scope.modelMap.RackCode = '';
        $scope.modelMap.PositionCode = '';
        $scope.modelMap.Type = $scope.modelMap.LineCode ? 'LINE' : 'FLOOR';
        $scope.modelMap.CategoryCode = $scope.modelMap.LineCode ?? $scope.modelMap.FloorCode;
        $rootScope.reloadRackMap();
    };
    $rootScope.reloadRackMap = function () {
        dataservice.getListRackByLineCode('', function (rs) {
            rs = rs.data;
            $scope.listRackMap = rs;
        });
    };
    $scope.changeRackMap = function (item) {
        $scope.modelMap.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $scope.modelMap.AreaCode + "_F_" + $scope.modelMap.FloorCode + "_L_" +
            $scope.modelMap.LineCode + "_R_" + $scope.modelMap.RackCode;
        $scope.modelMap.PositionCode = '';
        $scope.modelMap.Type = $scope.modelMap.RackCode ? 'RACK' : 'LINE';
        $scope.modelMap.CategoryCode = $scope.modelMap.RackCode ?? $scope.modelMap.LineCode;
        $rootScope.reloadPositionMap();
    };
    $rootScope.reloadPositionMap = function () {
        dataservice.getListAreaByParentCode("POSITION", "", function (rs) {
            rs = rs.data;
            $scope.listPositionMap = rs;
        });
    };
    $scope.changePositionMap = function (item) {
        $scope.modelMap.Mapping = "WHS_" + $scope.model.WhsCode + "_A_" + $scope.modelMap.AreaCode + "_F_" + $scope.modelMap.FloorCode + "_L_" +
            $scope.modelMap.LineCode + "_R_" + $scope.modelMap.RackCode + "_P_" + $scope.modelMap.PositionCode;
        $scope.modelMap.Type = $scope.modelMap.PositionCode ? 'POSITION' : 'RACK';
        $scope.modelMap.CategoryCode = $scope.modelMap.PositionCode ?? $scope.modelMap.RackCode;
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
                        dataObj.labels[5].text = "Số tài liệu : " + item.FileCount;
                    json_data.push(dataObj);
                } else {
                    $scope.initObject(type, item, false); //Bỏ
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
            case 'AREA':
                return $scope.initArea(item);

            case 'FLOOR':
                return $scope.initFloor(item);

            case 'LINE':
                return $scope.initLine(item);

            case 'RACK':
                return $scope.initRack(item);

            case 'POSITION':
                return $scope.initPosition(item, search);
            default:
                return null;

            //case 'CABINET':
            //    $scope.initCabinet(item);
            //    break;
        }
    }
    $scope.strokeWidthArea = 25;
    $scope.strokeWidthFloor = 25;
    $scope.strokeWidthLine = 25;
    $scope.strokeWidthRack = 25;
    $scope.strokeWidthPosition = 12;

    $scope.initArea = function (item) {
        //var area = new Area({ x: 40, y: 10, stroke: 5 });
        //area.attr({
        //    color: "#FF0000",
        //    bgColor: "#FFFFFF",
        //    height: 2500,
        //    width: 2100
        //});
        //area.setId(item.Code);
        //canvas.add(area);
        //var name = new draw2d.shape.basic.Label({ text: item.Name + " - " + item.Mapping, height: 10, x: 5, y: 5, stroke: 0, fontSize: 20 });
        ////area.setWidth(150);
        //area.addCssClass("txt");
        //area.add(name, new draw2d.layout.locator.BottomLocator());
        //area.attr({ userData: item });
        return iconRect({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: item.Name, Map: item.Mapping, FontSize: 32, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: item });
    }
    $scope.initFloor = function (item) {
        //var floor = new Floor({ x: 40, y: 10, stroke: 3 });
        //floor.attr({
        //    color: "#FF0000",
        //    bgColor: "#FFFFFF",
        //    height: 800,
        //    width: 2000
        //});
        //floor.setId(item.Code);
        //canvas.add(floor);
        //var name = new draw2d.shape.basic.Label({ text: item.Name + " - " + item.Mapping, height: 10, x: 5, y: 5, stroke: 0, fontSize: 15 });
        //floor.setWidth(150);
        //floor.addCssClass("txt");
        //floor.add(name, new draw2d.layout.locator.BottomLocator());
        //floor.attr({ userData: item });
        return iconRect({ Width: 2000, Height: 800, Stroke: '#000', StrokeWidth: $scope.strokeWidthFloor, Text: item.Name, Map: item.Mapping, FontSize: 24, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: item });
    }
    $scope.initLine = function (item) {
        //var x = 50;
        //var line = new Line({});
        //line.attr({
        //    startX: 50,
        //    startY: 250 + x,
        //    endX: 1000,
        //    endY: 250 + x,
        //    stroke: 5,
        //    color: "grey"
        //});
        //line.setId(item.Code);
        //x = x + 200;
        //canvas.add(line);
        //var name = new draw2d.shape.basic.Label({ text: item.Name + " - " + item.Mapping, height: 10, x: 5, y: 5, stroke: 0 });
        //name.setWidth(150);
        //name.addCssClass("txt");
        //line.add(name, new draw2d.layout.locator.BottomLocator());
        //line.attr({ userData: item });
        return iconRect({ Width: 800, Height: 5, Stroke: '#183153', StrokeWidth: $scope.strokeWidthLine, Text: item.Name, Map: item.Mapping, FontSize: 18, TextY: 25, Fill: '#fff', IsDashed: false, UserData: item });
    }
    $scope.initRack = function (item) {
        return iconRect({ Width: 250, Height: 200, Stroke: 'green', StrokeWidth: $scope.strokeWidthRack, Text: item.Name, Map: item.Mapping, FontSize: 14, TextY: 0, Fill: '#fff', IsDashed: false, UserData: item });
    }
    $scope.initPosition = function (item) {
        return iconCircle({ Radius: 10, Text: item.Name, Map: item.Mapping, FontSize: 10, TextY: 15, UserData: item })
    }
    $scope.initCabinet = function () {

    }

    $scope.initTriangle = function () {
        const obj = iconTriange({
            Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea,
            Text: 'Tam giác', Map: '', FontSize: 18, TextY: -40, Fill: 'transparent', IsDashed: false, UserData: null
        });
        // $scope.canvas.add(obj);
        // $scope.canvas.renderAll();
    }

    $scope.initCircle = function () {
        const obj = iconCircleOld({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Tròn', Map: '', FontSize: 18, TextY: 0, fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initArc = function () {
        const obj = iconArc({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: '', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initEclipse = function () {
        const obj = iconElipse({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Elip', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initReact = function () {
        const obj = iconRectOld({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Chữ nhật', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initRoundedRect = function () {
        const obj = iconRoundedRect({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Chữ nhật bo góc', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initRightArrow = function () {
        const obj = iconArrowRightArrow({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Mũi tên bên phải', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initPolygon = function () {
        const obj = iconPolygon({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Poly', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initTurnLeftArrow = function () {
        const obj = iconTurnLeftArrow({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Mũi tên bên trái', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initTwoWayArrow = function () {
        const obj = iconTwoWayArrow({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Mũi tên hai hướng', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initStar = function () {
        const obj = iconStar({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Ngôi sao', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initPolygen = function () {
        const obj = iconPolygen({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Tứ giác', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initArrowTo = function () {
        const obj = iconArrowTo({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Vẽ hướng', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initTrapezoid = function () {
        const obj = iconTrapezoid({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Hình thang', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initHeart = function () {
        const obj = iconHeart({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: 'Trái tim', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initTextbox = function () {
        const obj = textMode({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: '', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
    }

    $scope.initImagemode = function () {
        const obj = imageMode({ Width: 2100, Height: 2500, Stroke: '#000', StrokeWidth: $scope.strokeWidthArea, Text: '', Map: '', FontSize: 18, TextY: 0, Fill: 'transparent', IsDashed: false, UserData: null });
        $scope.canvas.add(obj);
        $scope.canvas.renderAll();
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
            templateUrl: ctxfolderDiagram + '/mapSearch.html',
            controller: 'map-search',
            backdrop: 'static',
            size: '65'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };
    $scope.objectDetail = function () {
        var item = $scope.activeObject;
        dataservice.getObjectDetail(item.userData.Mapping, function (rs) {
            rs = rs.data;
            rs.object = item.userData;
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
    $scope.deleteObject = function () {
        if (!isAllData) {
            return App.toastrError('Không có quyền xóa đối tượng');
        }
        var item = $scope.activeObject;
        dataservice.deleteMapping(item.userData.Id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess("Xóa thành công");
                $rootScope.drawObject();
                hidePopupMenu();
            }
            console.log(rs);
        });
    };
    $scope.rackDetail = function (rackCode) {
        //dataservice.getZoneDetail(rackCode, function (rs) {
        //    rs = rs.data;

        //    var modalInstance = $uibModal.open({
        //        animation: true,
        //        templateUrl: ctxfolderDiagram + '/viewRackDetail.html',
        //        controller: 'view-rack-detail',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return rs;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //        $scope.reload();
        //    }, function () {
        //    });
        //});
    };
    $scope.packDetail = function (packCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDiagram + '/viewPackDetail.html',
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
        for (var i = 0; i < $scope.canvas._objects.length; i++) {
            // Lấy danh sách các đối tượng trong Canvas
            var objects = $scope.canvas.getObjects();

            // Tìm vị trí của đối tượng trong danh sách
            var zIndex = objects.indexOf($scope.canvas._objects[i]);
            var obj = {
                Type: $scope.canvas._objects[i].userData?.Type ?? 'MISC',
                Name: $scope.canvas._objects[i].name,
                ShapeData: JSON.stringify($scope.canvas._objects[i]),
                ObjectCode: $scope.canvas._objects[i].userData?.Mapping ??
                    `${"WHS_" + $scope.model.WhsCode + "_A_" + $scope.model.WhsCode}_${randomID()}`,
                Deep: zIndex
            };
            console.log(JSON.stringify(obj));
            $scope.listData.push(obj);
        }

        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        const diagramObj = {
            AreaCode: "WHS_" + $scope.model.WhsCode,
            MappingObjects: $scope.listData
        };

        //App.toastrSuccess("Lưu thành công");
        dataservice.saveMappingShape(diagramObj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
            App.unblockUI("#contentMain");
        });
    };

    $scope.activeObject;
    $scope.delayMenu = false;

    // initText
    function setDefaultAttributes(obj) {
        obj.set({
            // isChoosePort: false,
            // port: [],

            groupID: null,

            colorBorder: "#000",
            widthBorder: 1,
            curve: 0,
            hasShadow: false,
            shadow: null,
            shadowObj: new fabric.Shadow({
                blur: 30,
                color: "#999",
                offsetX: 0,
                offsetY: 0,
            }),
            fixed: false,
            position: "front",

            isMoving: false,
            isRepeat: false,
            isDrawingPath: false,
            speedMoving: 1,
            pathObj: null,
            soundMoving: "",
            nameSoundMoving: "",

            blink: false,
            lineStyle: "solid",
            lockMovementX: false,
            lockMovementY: false,

            select: false,
            status: false,
            colorText: "#000",
            colorTextSelected: "#000",
            colorSelected: "#ccc",
            colorUnselected: "#fff",
            soundSelected: "",
            nameSoundSelected: "",
            soundUnselected: "",
            nameSoundUnselected: "",

            input: false,
            soundTyping: "",
            nameSoundTyping: "",

            snap: false,
            soundSnap: "assets/song/snap.mp3",
            nameSoundSnap: "",
        });
    }

    function touchPopupMenu(position, callback) {
        var touchStartMenu = setTimeout(() => {
            callback();
            $scope.canvas.off("mouse:up", touchEndHandler);
            $scope.canvas.off("mouse:move", touchMoveHandler);
        }, 1000);

        const touchEndHandler = () => {
            clearTimeout(touchStartMenu);
            $scope.canvas.off("mouse:up", touchEndHandler);
        };

        $scope.canvas.on("mouse:up", touchEndHandler);

        const touchMoveHandler = (e) => {
            if (
                Math.abs(e.pointer.x - position.x) > 100 ||
                Math.abs(e.pointer.y - position.y) > 100
            ) {
                clearTimeout(touchStartMenu);
                $scope.canvas.off("mouse:move", touchMoveHandler);
            }
        };

        $scope.canvas.on("mouse:move", touchMoveHandler);
    }

    // Don't allow objects off the canvas
    function objectSnapCanvas(obj) {
        if (obj.snap) {
            obj.setCoords();

            const width = obj.width * obj.scaleX;
            const height = obj.height * obj.scaleY;

            if (obj.left < snap) {
                obj.left = 0;
            }

            if (obj.top < snap) {
                obj.top = 0;
            }

            if (width + obj.left > $scope.canvas.width - snap) {
                obj.left = canvas.width - width;
            }

            if (height + obj.top > $scope.canvas.height - snap) {
                obj.top = $scope.canvas.height - height;
            }

            $scope.canvas.requestRenderAll();
        }
    }

    //Canvas event with mouse
    function changeCoordinateConnectLine(obj) {
        function updateCoords() {
            let connectors = $scope.canvas
                .getObjects()
                .filter(
                    (value) =>
                        value.name == "lineConnect" &&
                        (value.idObject1 === obj.objectID ||
                            value.idObject2 === obj.objectID)
                );

            if (connectors) {
                for (let i = 0; i < connectors.length; i++) {
                    if (connectors[i].idObject1 === obj.objectID) {
                        obj.__corner = connectors[i].port1;
                        let targetPort = findTargetPort(obj);
                        connectors[i].path[0][1] = targetPort.x1;
                        connectors[i].path[0][2] = targetPort.y1;
                        movelinename(
                            $scope.canvas,
                            obj.objectID,
                            targetPort.y1,
                            targetPort.x1,
                            connectors[i].port1
                        );
                    } else {
                        obj.__corner = connectors[i].port2;
                        let portCenterPoint = findTargetPort(obj);
                        connectors[i].path[1][3] = portCenterPoint.x2;
                        connectors[i].path[1][4] = portCenterPoint.y2;
                        movelinename(
                            $scope.canvas,
                            obj.objectID,
                            portCenterPoint.y2,
                            portCenterPoint.x2,
                            connectors[i].port2
                        );
                    }
                }
            }
        }
        obj.on("moving", updateCoords);
        obj.on("scaling", updateCoords);
    }

    function textMode() {
        var textbox = new fabric.Textbox("Init Text", {
            left: 50,
            top: 50,
            width: 100,
            fontSize: 14,
            name: "text",
            textAlign: "center",
            fontFamily: "Times New Roman",
        });

        setDefaultAttributes(textbox);
        startActiveObject(textbox);
        getTextForObject(textbox, true);

        // $('#moveObject')[0].click();
    }

    $("#textMode").on("click", function () {
        textMode("Init Text");
    });

    //thêm hình
    $scope.drawing = false;
    //init variables
    let div = $("#panel");
    let hw = $("#wrapper");

    //width and height of canvas's wrapper
    var w, h;
    w = hw.width();
    h = hw.height();
    $scope.id;
    $scope.userID = "";
    $scope.username = "";
    $scope.stanza = 999999;
    $scope.worksheetType = "";

    // svg object device
    let attachFileObj = null;

    const customAttributes = [
        // canvas
        "backgroundColor",
        "typeGrid",
        "layer",

        // object
        "fontSize",
        "textAlign",
        "underline",
        "fontStyle",

        // group
        "groupID",

        "name",
        "id",
        "port1",
        "port2",
        "idObject1",
        "idObject2",
        "objectID",
        "objectCode",
        "port",
        "lineID",
        "line2",
        "isDrop",
        "isDrag",
        "isBackground",
        "answerId",
        "text",
        "subTargetCheck",

        // 'isChoosePort',
        "colorBorder",
        "widthBorder",
        "curve",
        "hasShadow",
        "shadowObj",
        "fixed",
        "position",

        "isMoving",
        "isRepeat",
        "isDrawingPath",
        "speedMoving",
        "pathObj",
        "soundMoving",
        "nameSoundMoving",

        "blink",
        "lineStyle",
        "lineType",
        "lockMovementX",
        "lockMovementY",
        "customProps",
        "funct",
        "coord_x1",

        "select",
        "status",
        "colorText",
        "colorTextSelected",
        "colorSelected",
        "colorUnselected",
        "soundSelected",
        "nameSoundSelected",
        "soundUnselected",
        "nameSoundUnselected",
        // 'imageContent',
        "nameImageContent",

        "input",
        "soundTyping",
        "nameSoundTyping",

        "snap",
        "soundSnap",
        "nameSoundSnap",

        // device record
        "nameDevice",
        "device",
        "src",
        "countRecord",
        "files",

        //worksheet
        "soundWorksheet",
    ];

    function getPencil() {
        var pencil = "1";
        $("#pencils-body li").each(function (i) {
            if ($(this).hasClass("active")) {
                pencil = $(this).attr("data-pencil");
            }
        });
        return pencil;
    }

    function deleteObjInPool(data, pool_data, layer, canvas) {
        const indexDelete = pool_data.findIndex(
            (item) => item.objectID === data && item.layer == layer
        );
        if (indexDelete >= 0) {
            pool_data.splice(indexDelete, 1);
        }
    }

    // copy active objects when press ctrl + c
    function copyObjects() {
        if (!$scope.canvas.getActiveObject()) {
            return;
        }
        $scope.canvas.getActiveObject().clone(function (cloned) {
            _clipboard = cloned;
        }, customAttributes);
    }

    // paste copied objects when press ctrl + v
    function pasteObjects() {
        if (_clipboard) {
            _clipboard.clone(function (clonedObj) {
                $scope.canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + 10,
                    top: clonedObj.top + 10,
                    evented: true,
                });
                // drag drop question special case
                if (clonedObj.answerId) {
                    countItem++;
                    clonedObj.answerId = countItem;
                }
                // end
                if (clonedObj.type === "activeSelection") {
                    // active selection needs a reference to the canvas.
                    clonedObj.canvas = canvas;
                    clonedObj.forEachObject(function (obj) {
                        obj.objectID = randomID();
                        if (obj.name == "media") {
                            if (obj.nameDevice == "attach-file") {
                                attachFileObj = obj;
                                startActiveFileObj(obj);

                            } else {
                                activeDeviceObject = obj;
                                startActiveMedia(obj);
                            }
                        } else {
                            activeDeviceObject = obj;
                            startActiveMedia(obj);
                        }
                        canvas.add(obj);
                    });
                    // this should solve the unselectability
                    clonedObj.setCoords();
                } else {
                    clonedObj.objectID = randomID();
                    if (clonedObj.name != "custom-group") {
                        startActiveObject(clonedObj);
                        $scope.canvas.add(clonedObj);
                    } else {
                        var listObject = clonedObj._objects;
                        for (let index = 0; index < listObject.length; index++) {
                            const element = listObject[index];
                            if (element.__eventListeners) {
                                element.__eventListeners["mousedblclick"] = [];
                            }
                            console.log(element);
                            if (element.type != "textbox") {
                                element.on("mousedblclick", handleDbclickChild);
                            } else {
                                element.on("mouseup", function (e) {
                                    if (e.button === 1) {
                                        console.log("left click");
                                    }
                                    // if(e.button === 2) {
                                    //     console.log("middle click");
                                    // }
                                    if (e.button === 3) {
                                        handleTextboxRightclick(this);
                                    }
                                });
                            }
                        }
                        $scope.canvas.add(clonedObj);
                    }
                }
                _clipboard.top += 10;
                _clipboard.left += 10;
                objectSnapAdjacent(clonedObj);
                $scope.canvas.setActiveObject(clonedObj);
                $scope.canvas.requestRenderAll();
            }, customAttributes);
        }
    }

    function deleteObjects(objects) {
        if (objects) {
            objects.forEach(function (object) {
                // remove lineConnect + curvePoint
                $scope.canvas.getObjects().forEach((item) => {
                    if (
                        object.name === "curve-point" &&
                        item.objectID === object.lineID
                    ) {
                        deleteObjInPool(item.objectID, $scope.pool_data, $scope.canvas.id, $scope.canvas);
                        $scope.canvas.remove(item);
                        resetObjList();
                    } else if (
                        item.name === "lineConnect" &&
                        (item.idObject1 === object.objectID ||
                            item.idObject2 === object.objectID)
                    ) {
                        const curvePoint = $scope.canvas
                            .getObjects()
                            .find((obj) => obj.lineID === item.objectID);
                        deleteObjInPool(item.objectID, $scope.pool_data, $scope.canvas.id, $scope.canvas);
                        $scope.canvas.remove(item);
                        resetObjList();
                        curvePoint && $scope.canvas.remove(curvePoint);
                    }
                });
                deleteObjInPool(object.objectID, $scope.pool_data, $scope.canvas.id, $scope.canvas);
                $scope.canvas.remove(object);
                resetObjList();
            });
        }
    }

    $scope.ctrlDown = false; // check ctrl press
    $scope.isEditText = false;
    var _clipboard;

    //dynamically resize the canvas on window resize
    $(window)
        .on("keydown", function (e) {
            if (e.keyCode === 46) {
                console.log("delete key");
                //delete key
                if (!$(".text-edit").hasClass("hidden")) {
                    $(".text-edit").addClass("hidden");
                }
                //$("#edit-form").css({ visibility: "hidden" });
                // $('#sub-menu').slideUp()
                // $('#path-menu').slideUp()

                deleteObjects($scope.canvas.getActiveObjects());
            }
            if (e.keyCode === 16) {
                // shift key
                $scope.isSelecting = true;
            }

            if (e.keyCode === 40) {
                //move up
                var units = 10;
                var delta = new fabric.Point(0, -units);
                $scope.canvas.relativePan(delta);
            }

            if (e.keyCode === 38) {
                //move down
                var units = 10;
                var delta = new fabric.Point(0, units);
                $scope.canvas.relativePan(delta);
            }

            if (e.keyCode === 37) {
                //move right
                var units = 10;
                var delta = new fabric.Point(units, 0);
                $scope.canvas.relativePan(delta);
            }

            if (e.keyCode === 39) {
                //move left
                var units = 10;
                var delta = new fabric.Point(-units, 0);
                $scope.canvas.relativePan(delta);
            }

            if (e.keyCode === 17) {
                // ctrl key check for ctrl + c/v
                $scope.ctrlDown = true;
            }

            if (!$scope.isEditText && $scope.ctrlDown && e.keyCode === 67) {
                // ctrl + c
                console.log($scope.isEditText);
                copyObjects();
            }

            if (!$scope.isEditText && $scope.ctrlDown && e.keyCode === 86) {
                // ctrl + v
                console.log($scope.isEditText);
                pasteObjects();
            }
        })
        .on("keyup", function (e) {
            if (e.keyCode === 17) {
                // remove checking ctrl + c/v
                ctrlDown = false;
            }
        });

    function addNewObject(object) {
        const li = document.createElement("li");
        li.classList.add("li-padding");
        li.innerHTML = `
                  <a>${object.type} - ${object.objectID}</a>
              `;
        li.onclick = function () {
            var zoom = $scope.canvas.getZoom();
            $scope.canvas.setZoom(1); // reset zoom so pan actions work as expected
            let vpw = $scope.canvas.width / zoom;
            let vph = $scope.canvas.height / zoom;
            let x = object.left - vpw / 2; // x is the location where the top left of the viewport should be
            let y = object.top - vph / 2; // y idem
            $scope.canvas.absolutePan({ x: x, y: y });
            $scope.canvas.setZoom(zoom);
        };
        console.log("check");
        $(`.list-object`)[0].appendChild(li);
    }

    var countItem = 0;

    function resetObjList() {
        $(`.list-object`)[0].innerHTML = "";
        for (const item of $scope.canvas._objects) {
            addNewObject(item);
        }
    }

    function emitEvent(isWorkSheetMore = true) {
        if (!$scope.isLoadDataLocal) {
            let json = $scope.canvas.getObjects();
            const obj = $scope.canvas.item(json.length - 1);
            console.log(obj.name);

            if (obj?.name == "line-style") {
                obj.set({
                    selectable: true,
                    hasBorders: true,
                    hasRotatingPoint: true,
                    hasBorders: true,
                    transparentCorners: false,
                });
                obj.setControlsVisibility({
                    tl: true,
                    tr: true,
                    bl: true,
                    br: true,
                    mtr: true,
                    mb: true,
                    mt: true,
                    ml: true,
                    mr: true,
                });
            }
            obj?.clone((lastObject) => {
                // lastObject.stroke = getColor();
                // lastObject.strokeWidth = getPencil();
                lastObject.objectID = randomID();
                let data = {
                    w: w,
                    h: h,
                    drawing: $scope.drawing,
                    color: getColor(),
                    id: $scope.id,
                    userID: $scope.userID,
                    objectID: lastObject.objectID,
                    username: $scope.username,
                    spessremo: getPencil(),
                    room: $scope.stanza,
                    layer: $scope.canvas.id,
                    //data: lastObject.toObject(customAttributes),
                };
                if ($scope.worksheetType && isWorkSheetMore) {
                    data.isWorkSheet = true;
                }
                $scope.pool_data.push(data);
                addNewObject(lastObject);
                // socket.emit('joinRoom',{room:$("#room")[0].value,userID:$("#username")[0].value})
                // socket.emit('drawing', data);
                //socket.emit("drawing", data);
                $scope.canvas.item(json.length - 1).set({
                    objectID: lastObject.objectID,
                    userID: $scope.userID,
                });
            });//, customAttributes
            $scope.canvas.requestRenderAll();
        }
    }

    function imageMode(item) {
        fabric.Image.fromURL(item.target.result, function (img) {
            //i create an extra var for to change some image properties
            const maxWidth = 600;
            const maxHeight = 400;

            if (img.width > maxWidth) {
                img.scaleToWidth(maxWidth);
            }

            if (img.height > maxHeight) {
                img.scaleToHeight(maxHeight);
            }
            // console.log(e.target.result.name);

            img.set({
                top: 100,
                left: 100,
                name: "image",
                nameImageContent: "",
                objectID: randomID(),
            });

            setDefaultAttributes(img);
            startActiveObject(img);

            $scope.canvas.add(img);
            isLoadDataLocal = false;

            // var grid = canvas._objects.find(obj => obj.name === 'grid')
            // if (grid) {
            //     img.moveTo(1)
            // }
            // else img.moveTo(0)

            $scope.canvas.requestRenderAll();
        });
    }

    function randomID() {
        return "_" + Math.random().toString(36).substr(2, 9);
    }

    $("#imageMode").change(function (item) {
        var files = item.target.files,
            imageType = /image.*/;
        for (const file of files) {
            if (!file.type.match(imageType)) return;
            var reader = new FileReader();
            reader.onload = imageMode;
            reader.readAsDataURL(file);
        }

        item.target.value = "";
    });

    $("#normal-addimage").on("click", function () {
        updateInputStyleImage($(this).hasClass("active"))
    });

    function updateInputStyleImage(check) {
        if (check) {
            $("#imageMode").removeAttr('style')
            $(this).removeClass("active")
        } else {
            $("#imageMode").css({ 'left': 320 + 'px' })
        }
    }

    $("#upload-file").on("click", function () {
        updateInputStyleFile($(this).hasClass("active"))
    });

    function updateInputStyleFile(check) {
        if (check) {
            $("#icon-load-canvas").removeAttr('style')
            $(this).removeClass("active")
        } else {
            $("#icon-load-canvas").css({ 'left': 700 + 'px' })
        }
    }

    function getTextForObject(obj, isText) {
        var text = $scope.username;
        var fontSize = 10;
        startActiveTextbox(obj);
        $scope.canvas.add(obj);

        $scope.isLoadDataLocal = false;
        emitEvent();
    }

    // canvas handle function
    //Fabric cho đối tượng hình học (Geometric)
    // Vẽ hình tròn
    function iconCircle(item) {
        //Vẽ hình tròn
        // var circle = new fabric.Circle({
        //     radius: item.Radius,
        //     stroke: '#000',
        //     strokeWidth: $scope.strokeWidthPosition,
        //     fill: '#fff',
        //     originX: 'center',
        //     originY: 'center'
        // });

        var circle = new fabric.Circle({
            radius: 20,
            left: 100,
            top: 100,
            angle: 45,
            startAngle: 0,
            endAngle: Math.PI,
            stroke: '#000',
            strokeWidth: 3,
            fill: ''
        });

        return createTextBox(circle, item);
    }
    function iconCircleOld(item) {
        var circle = new fabric.Circle({
            radius: 50,
            stroke: "#000",
            strokeWidth: 1,
            fill: "#fff",
            originX: "center",
            originY: "center",
        });

        return createTextBox(circle, item);
    }

    //Vẽ hình Arc
    function iconArc(item) {
        var arc = new fabric.Circle({
            left: 100, // Tọa độ X
            top: 100, // Tọa độ Y
            radius: 50, // Bán kính
            startAngle: 0, // Góc bắt đầu (được tính theo độ)
            endAngle: 90, // Góc kết thúc (được tính theo độ)
            angle: 0, // Góc quay (mặc định là 0)
            fill: 'transparent', // Màu nền (trong suốt)
            stroke: 'black', // Màu viền
            strokeWidth: 2, // Độ dày viền
            originX: 'center', // Tọa độ gốc X
            originY: 'center', // Tọa độ gốc Y
            selectable: false, // Không chọn được
            evented: false, // Không tương tác được
        });

        return createTextBox(arc, item);
    }

    // Vẽ hình tam giác
    function iconTriange(item) {
        var triangle = new fabric.Triangle({
            width: 100,
            height: 100,
            stroke: "#000",
            strokeWidth: 1,
            fill: "#fff",
            originX: "center",
            originY: "center",
        });
        getTextForObject(createTextBox(triangle, item))
    }

    //Vẽ hình elip
    function iconElipse(item) {
        var elipse = new fabric.Ellipse({
            rx: 80,
            ry: 40,
            stroke: "#000",
            strokeWidth: 1,
            fill: "#fff",
            originX: "center",
            originY: "center",
        });

        return createTextBox(elipse, item);
    }

    // Vẽ hình chữ nhật
    function iconRectOld(item) {
        var rect = new fabric.Rect({
            width: 100,
            height: 100,
            stroke: "#000",
            strokeWidth: 1,
            fill: "#fff",
            originX: "center",
            originY: "center",
            rx: 0,
            ry: 0,
        });
        rect.on('scaling', function () {
            console.log('scaling');
            this.set({
                width: this.width * this.scaleX,
                height: this.height * this.scaleY,
                scaleX: 1,
                scaleY: 1
            })
        })
        //if (item.IsDashed) {
        //    rect.set({ strokeDashArray: [5, 5] });
        //}
        console.log(rect);

        return createTextBox(rect, item);
    }
    function iconRect(item) {
        var rect = new fabric.Rect({
            width: item.Width,
            height: item.Height,
            stroke: item.Stroke,
            strokeWidth: item.StrokeWidth,
            fill: item.Fill,
            originX: 'center',
            originY: 'center',
            rx: 0,
            ry: 0
        });
        rect.on('scaling', function () {
            console.log('scaling');
            this.set({
                width: this.width * this.scaleX,
                height: this.height * this.scaleY,
                scaleX: 1,
                scaleY: 1
            })
        })
        if (item.IsDashed) {
            rect.set({ strokeDashArray: [5, 5] });
        }
        console.log(rect);

        return createTextBox(rect, item);
    }

    // Vẽ hình chữ nhật bo góc
    function iconRoundedRect(item) {
        var roundedRect = new fabric.Rect({
            width: 100,
            height: 100,
            stroke: "#000",
            strokeWidth: 1,
            fill: "#fff",
            originX: "center",
            originY: "center",
            rx: 10,
            ry: 10,
        });

        roundedRect.on("scaling", function () {
            this.set({
                width: this.width * this.scaleX,
                height: this.height * this.scaleY,
                scaleX: 1,
                scaleY: 1,
            });
        });

        return createTextBox(roundedRect, item);
    }

    function getColor() {
        var color = "#000";
        $("#colors-body li").each(function (i) {
            if ($(this).hasClass("active")) {
                color = $(this).attr("data-color");
            }
        });
        return color;
    }

    // Vẽ hình lục giác
    function iconPolygon(item) {
        var polygon = new fabric.Polygon(
            [
                { x: 850, y: 75 },
                { x: 958, y: 137.5 },
                { x: 958, y: 262.5 },
                { x: 850, y: 325 },
                { x: 742, y: 262.5 },
                { x: 742, y: 137.5 },
            ],
            {
                top: 0,
                left: 0,
                stroke: getColor(),
                strokeWidth: 1,
                fill: "#fff",
                scaleX: 0.5,
                scaleY: 0.5,
                left: -55,
                top: -60,
                originX: "center",
                originY: "center",
            }
        );

        return createTextBox(polygon, item);
    }

    //Right Arrow
    function iconArrowRightArrow(item) {
        var poly = new fabric.Polyline(
            [
                { x: 20, y: 20 },
                { x: 60, y: 20 },
                { x: 60, y: 10 },
                { x: 80, y: 30 },
                { x: 60, y: 50 },
                { x: 60, y: 40 },
                { x: 20, y: 40 },
                { x: 20, y: 20 },
            ],
            {
                width: 300,
                height: 200,
                stroke: getColor(),
                strokeWidth: 1,
                fill: "#fff",
                scaleX: 2,
                scaleY: 2,
                top: -40,
                left: -50,
                originX: "center",
                originY: "center",
            }
        );
        return createTextBox(poly, item);
    }

    // Left arrow
    function iconTurnLeftArrow(item) {
        var poly = new fabric.Polyline(
            [
                { x: 60, y: 30 },
                { x: 20, y: 30 },
                { x: 20, y: 20 },
                { x: 0, y: 40 },
                { x: 20, y: 60 },
                { x: 20, y: 50 },
                { x: 60, y: 50 },
                { x: 60, y: 30 },
            ],
            {
                // width: 150,
                // height: 200,
                stroke: getColor(),
                strokeWidth: 1,
                fill: "#fff",
                scaleX: 2,
                scaleY: 2,
                top: -40,
                left: -60,
                originX: "center",
                originY: "center",
            }
        );

        return createTextBox(poly, item);
    }

    // Right left arrow
    function iconTwoWayArrow(item) {
        var poly = new fabric.Polyline(
            [
                { x: 20, y: 20 },
                { x: 60, y: 20 },
                { x: 60, y: 10 },
                { x: 80, y: 30 },
                { x: 60, y: 50 },
                { x: 60, y: 40 },
                { x: 20, y: 40 },
                { x: 20, y: 50 },
                { x: 0, y: 30 },
                { x: 20, y: 10 },
                { x: 20, y: 20 },
            ],
            {
                stroke: getColor(),
                strokeWidth: 1,
                fill: "#fff",
                scaleX: 2,
                scaleY: 2,
                top: -40,
                left: -80,
                originX: "center",
                originY: "center",
            }
        );
        return createTextBox(poly, item);
    }

    // Hình ngôi sao
    function iconStar(item) {
        var poly = new fabric.Path(
            "M 251 30.5725 C 239.505 33.871 233.143 56.2086 228.247 66 L 192.247 139 C 187.613 148.267 183.524 162.173 176.363 169.682 C 170.726 175.592 151.9 174.914 144 176 L 57 188.729 C 46.5089 190.241 22.8477 189.409 18.0093 201.015 C 12.21 214.927 32.8242 228.824 41 237 L 95 289.83 C 104.569 298.489 120.214 309.405 126.11 321 C 130.001 328.651 123.466 345.797 122.081 354 L 107 442 C 105.042 452.114 99.142 469.478 105.228 478.895 C 109.142 484.95 116.903 484.628 123 482.64 C 137.319 477.973 151.822 468.444 165 461.139 L 232 425.756 C 238.285 422.561 249.81 413.279 257 415.071 C 268.469 417.93 280.613 427.074 291 432.691 L 359 468.258 C 369.618 473.739 386.314 487.437 398.985 483.347 C 413.495 478.664 405.025 453.214 403.25 443 L 388.75 358 C 387.045 348.184 380.847 332.006 383.194 322.285 C 385.381 313.225 403.044 300.467 410 294.424 L 469 237 C 477.267 228.733 493.411 218.004 492.941 205 C 492.398 189.944 465.753 190.478 455 189 L 369 176.421 C 359.569 175.025 343.388 175.914 335.213 170.976 C 328.335 166.822 323.703 151.166 320.576 144 L 289.753 82 L 268.532 39 C 264.58 32.6459 258.751 28.3485 251 30.5725 z",

            {
                stroke: getColor(),
                strokeWidth: 3,
                fill: "#fff",
                scaleX: 0.2,
                scaleY: 0.2,
                top: -50,
                left: -50,
                originX: "center",
                originY: "center",
            }
        );
        return createTextBox(poly, item);
    }

    // Vẽ hình tứ giác
    function iconPolygen(item) {
        var poly = new fabric.Polygon(
            [
                { x: 20, y: 10 },
                { x: 70, y: 10 },
                { x: 60, y: 50 },
                { x: 10, y: 50 },
                { x: 20, y: 10 },
            ],
            {
                scaleX: 2,
                scaleY: 2,
                stroke: getColor(),
                strokeWidth: 1,
                fill: "#fff",
                top: -40,
                left: -60,
                originX: "center",
                originY: "center",
            }
        );
        return createTextBox(poly, item);
    }

    //vẽ hướng
    function iconArrowTo(item) {
        var arrow = new fabric.Polygon(
            [
                { x: 10, y: 20 },
                { x: 20, y: 40 },
                { x: 10, y: 60 },
                { x: 40, y: 60 },

                { x: 50, y: 40 },
                { x: 40, y: 20 },
                { x: 10, y: 20 },
            ],
            {
                stroke: getColor(),
                strokeWidth: 1,
                fill: "#fff",
                scaleX: 1.5,
                scaleY: 1.5,
                left: -30,
                top: -30,
                originX: "center",
                originY: "center",
            }
        );
        return createTextBox(arrow, item);
    }

    // Vẽ hình thang
    function iconTrapezoid(item) {
        var traperzoid = new fabric.Polygon(
            [
                { x: -100, y: -50 },
                { x: 100, y: -50 },
                { x: 150, y: 50 },
                { x: -150, y: 50 },
            ],
            {
                stroke: getColor(),
                strokeWidth: 1,
                fill: "#fff",
                scaleX: 0.5,
                scaleY: 0.5,
                top: -25,
                left: -75,
                originX: "center",
                originY: "center",
            }
        );
        return createTextBox(traperzoid, item);
    }

    // Vẽ hình trái tim
    function iconHeart(item) {
        var heart = new fabric.Path(
            "M10,6 Q10,0 15,0 T20,6 Q20,10 15,14 T10,20 Q10,18 5,14 T0,6 Q0,0 5,0 T10,6 Z",
            {
                stroke: getColor(),
                strokeWidth: 0.2,
                fill: "#fff",
                scaleX: 4.5,
                scaleY: 4.5,
                top: -45,
                left: -45,
                originX: "center",
                originY: "center",
            }
        );
        return createTextBox(heart, item);
    }


    function createTextBox(obj, item) {
        var textbox = new fabric.Textbox(item.Text, {
            fontSize: item.FontSize,
            fontFamily: 'Time New Roman',
            originX: 'center',
            originY: 'center',
            left: obj.left,
            top: obj.top,
            width: obj.width,
            fill: '#333',
            textAlign: 'center',
            fontWidth: 600
        });

        if (item.TextY) {
            textbox.originY = 'bottom';
            textbox.top = -item.TextY;
        }

        let group = new fabric.Group([obj, textbox], {
            top: 100,
            left: 100,
            name: obj.type,
            subTargetCheck: false,
            fontSize: item.FontSize,
            fontFamily: 'Time New Roman',
            textAlign: 'center',
            fontWeight: 'normal',
            fontStyle: 'normal',
            underline: false,
            backgroundColor: item.Fill
        });

        setDefaultAttributes(group, item.UserData);
        startActiveObject(group);
        console.log(group);
        return group;
    }

    fabric.Textbox.prototype.onKeyDown = (function (onKeyDown) {
        return function (e) {
            if (e.keyCode == 16) {
                shift = true;
                return;
            } else if (e.keyCode === 17) {
                // remove ctrl key check for ctrl + c/v
                ctrlDown = false;
            } else if (e.keyCode == 13 && !shift) canvas.discardActiveObject();
            onKeyDown.call(this, e);
        };
    })(fabric.Textbox.prototype.onKeyDown);

    fabric.Textbox.prototype.onKeyUp = (function (onKeyUp) {
        return function (e) {
            if (e.keyCode == 16) {
                shift = false;
                return;
            }
            onKeyUp.call(this, e);
        };
    })(fabric.Textbox.prototype.onKeyUp);

    function setDefaultAttributes(obj, userData) {
        obj.set({
            // isChoosePort: false,
            // port: [],

            groupID: null,

            colorBorder: '#000',
            widthBorder: 1,
            curve: 0,
            hasShadow: false,
            shadow: null,
            shadowObj: new fabric.Shadow({
                blur: 30,
                color: '#999',
                offsetX: 0,
                offsetY: 0
            }),
            fixed: false,
            position: 'front',

            isMoving: false,
            isRepeat: false,
            isDrawingPath: false,
            speedMoving: 1,
            pathObj: null,
            soundMoving: '',
            nameSoundMoving: '',

            blink: false,
            lineStyle: 'solid',

            select: false,
            status: false,
            colorText: '#000',
            colorTextSelected: '#000',
            colorSelected: '#ccc',
            colorUnselected: '#fff',
            isFullText: false,

            userData: userData
        });
    }

    // call this function to create attributes and event for object
    function startActiveObject(obj) {

        if (obj.blink) blink(obj);

        obj.on('mouseup', function (e) {
            if (e.button === 3 && $scope.delayMenu == false) {
                console.log('showmenu');
                showPopUpMenu(obj);
                $scope.delayMenu = true;
                setTimeout(function () {
                    $scope.delayMenu = false;
                }, 500);
            }
        });
        console.log(obj.userData);
        //if (obj.userData) {
        //    if (obj.userData.Type == "AREA") {
        //        obj._objects[0].strokeWidth = $scope.strokeWidthArea;
        //    }
        //    if (obj.userData.Type == "FLOOR") {
        //        obj._objects[0].strokeWidth = $scope.strokeWidthFloor;
        //    }
        //    if (obj.userData.Type == "LINE") {
        //        obj._objects[0].strokeWidth = $scope.strokeWidthLine;
        //    }
        //    if (obj.userData.Type == "RACK") {
        //        obj._objects[0].strokeWidth = $scope.strokeWidthRack;
        //    }
        //    if (obj.userData.Type == "POSITION") {
        //        obj._objects[0].strokeWidth = $scope.strokeWidthPosition;
        //    }
        //}
    }

    // blink object animation
    function blink(obj) {
        if (obj.blink && obj.opacity == 1) {
            obj.animate('opacity', '0.3', {
                duration: 300,
                onChange: $scope.canvas.renderAll.bind($scope.canvas),
                onComplete: function () {
                    blink(obj);
                }
            });
        } else {
            obj.animate('opacity', '1', {
                duration: 300,
                onChange: $scope.canvas.renderAll.bind($scope.canvas),
                onComplete: function () {
                    blink(obj);
                }
            });
        }
    }

    $scope.widthBorderObj = 1;
    $scope.widthBorderObjFirst = 1;

    function showPopUpMenu(obj) {
        //$scope.openOption();
        const editForm = $('#menu-object')[0];

        //$scope.activeObject = obj;
        //$scope.fontSize = obj.fontSize;
        //$scope.fontColor = obj.colorText;
        //$scope.borderColor = obj.colorBorder;
        //$scope.borderWidth = obj.borderWidth;
        //$scope.isObjectFront = obj.pos == 'front';
        //$scope.isTextFull = obj.isFullText == true;
        //$scope.isObjectBlink = obj.blink == true;
        //$scope.isObjectShadow = obj.shadow == true;
        $scope.backgroundColor = obj.backgroundColor;
        //setTimeout(function () { $scope.$apply() });
        if (obj.userData != null && obj.userData.Mapping != null) {
            var mapping = obj.userData.Mapping.split('_');
            $scope.modelMap.Mapping = obj.userData.Mapping;
            $scope.modelMap.AreaCode = mapping[3] !== null ? mapping[3] : undefined;
            $scope.modelMap.FloorCode = mapping[5] !== null ? mapping[5] : undefined;
            $scope.modelMap.LineCode = mapping[7] !== null ? mapping[7] : undefined;
            $scope.modelMap.RackCode = mapping[9] !== null ? mapping[9] : undefined;
            $scope.modelMap.PositionCode = mapping[11] !== null ? mapping[11] : undefined;
            if($scope.modelMap.PositionCode){
                $scope.modelMap.Type = 'POSITION';
            }else if($scope.modelMap.RackCode){
                $scope.modelMap.Type = 'RACK';
            }else if($scope.modelMap.LineCode){
                $scope.modelMap.Type = 'LINE';
            }else if($scope.modelMap.FloorCode){
                $scope.modelMap.Type = 'FLOOR';
            } else if($scope.model.AreaCode){
                $scope.modelMap.Type = 'AREA';
            }
        }

        if (editForm.style.visibility === 'hidden' || $scope.activeObject !== obj) {
            console.log('show popup menu');
            if ($scope.activeObject == null) {
                $scope.activeObject = obj;
            }
            if ($scope.activeObject !== obj) {
                if($scope.widthBorderObjFirst != $scope.borderWidth){
                    $scope.widthBorderObjFirst = $scope.borderWidth
                }
                updateBorderWidth($scope.widthBorderObjFirst)
                $scope.borderWidth = 1
            }
            $scope.activeObject = obj;
            $scope.fontSize = obj.fontSize;
            $scope.fontColor = obj.colorText;
            $scope.isObjectFront = obj.pos == 'front';
            $scope.isTextFull = obj.isFullText == true;
            $scope.isObjectBlink = obj.blink == true;
            if($scope.activeObject._objects != undefined){
                $scope.widthBorderObjFirst = $scope.activeObject._objects[0].strokeWidth;
            }
            if($scope.activeObject._objects != undefined){
                $scope.widthBorderObjFirst = $scope.borderWidth = $scope.activeObject._objects[0].strokeWidth;
            }

            setTimeout(function () { $scope.$apply() });
            const zoom = $scope.canvas.getZoom();
            let top = (obj.top) * zoom + $scope.canvas.getTop() + $scope.widthCanvas * 0.1;
            let left = (obj.left + (obj.width / 2) * obj.scaleX) * zoom + $scope.canvas.getLeft() - 150;
            if (obj.lineType == 'waving') {
                top = Math.cos(obj.angle) * (obj.top) * zoom + $scope.canvas.viewportTransform[5] + 20;
                left = Math.cos(obj.angle) * (obj.left + (obj.width / 2) * obj.scaleX) * zoom + $scope.canvas.viewportTransform[4];
            }

            if (top < 0) top = 20
            if (left < -50) left = -50
            if (left > 2500) left = 2500
            if (left < 250) left = 250
            if ($scope.activeObject.type === 'text' || $scope.activeObject.type === 'textbox') {
                top -= 20
            }
            if (($scope.widthCanvas - left) < 680) left = $scope.widthCanvas * 0.5

            $('#menu-object').css({ 'visibility': 'visible', 'top': top + 'px', 'left': left + 'px' });
            if ($scope.widthBorderObjFirst != $scope.widthBorderObj){
                $scope.widthBorderObj = $scope.widthBorderObjFirst;
            }
            updateDataSubMenu()
            updateBorderWidth($scope.widthBorderObjFirst+2)
        }
        else {
            console.log('hide popup menu');
            hidePopupMenu();
        }
    }

    function updateBorderWidth(value) {
        if ($scope.activeObject != null) {
            if ($scope.activeObject._objects) {
                $scope.activeObject.item(0)?.set({
                    strokeWidth: value,
                });
            } else {
                $scope.activeObject.set({
                    strokeWidth: value,
                });
            }
            $scope.activeObject.set({
                widthBorder: value,
            });
        }
        $scope.canvas.requestRenderAll();
    }

    function hidePopupMenu() {
        if ($scope.borderWidth != $scope.widthBorderObjFirst) {
            $scope.widthBorderObjFirst = $scope.borderWidth;
        }
        updateBorderWidth($scope.widthBorderObjFirst);
        $("#menu-object").css({ visibility: "hidden" });
        //$scope.cancel();
    }

    function randomID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    $scope.isLockObject = true;
    $scope.toggleLock = function () {
        $scope.isLockObject = !$scope.isLockObject;
        $scope.drawObject();
    }
    function loadImageAsync(obj) {
        return new Promise((resolve) => {
            fabric.Image.fromURL(obj.src, function (img) {
                console.log(obj);
                img.set({
                    top: obj.top,
                    left: obj.left,
                    width: obj.width,
                    height: obj.height,
                    scaleX: obj.scaleX,
                    scaleY: obj.scaleY,
                    isBackground: obj.isBackground,
                })
                startActiveObject(img);
                if ($scope.isLockObject) {
                    obj.set({
                        "selectable": false,
                        lockMovementX: false,
                        lockMovementY: false,
                    })
                }
                if (obj.userData.Mapping === $scope.model.Mapping) {
                    $scope.center = img;
                }
                $scope.canvas.add(img);
                resolve();
                //repositionBackground();
            });
        });
    }
    function loadCanvasJsonNew(listObjects) {
        // Sắp xếp mảng theo thuộc tính Deep
        listObjects.sort(function(a, b) {
            return a.userData.Deep - b.userData.Deep;
        });
        console.log(listObjects);
        fabric.util.enlivenObjects(listObjects.filter(x => x.isFromDb), async function (enlivenedObjects) {
            console.log(enlivenedObjects);
            for (var i = 0; i < listObjects.length; i++) {
                var obj = listObjects[i];
                if (obj.isFromDb) {
                    var obj = enlivenedObjects.find(x => x.userData.Mapping == obj.userData.Mapping);
                }
                if (obj.isFromDb == true) {
                    if (obj.name == 'lineConnect') {
                        var line = new fabric.Path('M 65 0 Q 100 100 200 0', {
                            //  M 65 0 L 73 6 M 65 0 L 62 6 z 
                            fill: '',
                            stroke: '#000',
                            objectCaching: false,
                            originX: 'center',
                            originY: 'center',
                            name: 'lineConnect',
                            idObject1: obj.idObject1,
                            idObject2: obj.idObject2,
                            port1: obj.port1,
                            port2: obj.port2,
                            objectID: obj.objectID
                        });

                        line.selectable = false;
                        line.path = obj.path;

                        $scope.canvas.add(line);
                    } else if (obj.name == "media") {
                        if (obj.nameDevice == "attach-file") {
                            attachFileObj = obj;
                            startActiveFileObj(obj);
                        } else {
                            activeDeviceObject = obj;
                            obj.on("mouseup", handleMouseUpSvg);
                            startActiveMedia(obj);
                        }
                        console.log("obj", obj);
                        $scope.canvas.add(obj);
                    } else if (obj.type === 'group') {
                        if (obj.name != 'custom-group') {
                            if (obj.name == 'line-style' && obj.lineType == 'curve') {
                                obj._objects.forEach(obj => obj._setPath(obj.path));
                            }
                            if (obj.name == 'grid') {
                                obj.set({
                                    evented: false,
                                    selectable: false,
                                    renderOnAddRemove: false,
                                    objectCaching: false,
                                })
                            }
                            obj.isFullText = false;
                            if(obj._objects.length > 0) {
                                for (var j = 0; j < obj._objects.length; j++) {
                                    var _obj = obj._objects[j];
                                    if(_obj.type == 'group'){
                                        startActiveObject(_obj);
                                    } 
                                }
                            }
                            startActiveObject(obj);
                        }
                        else {
                            makeChildSelectable(obj);
                        }
                        if ($scope.isLockObject) {
                            obj.set({
                                "selectable": false,
                                lockMovementX: false,
                                lockMovementY: false,
                            });
                        };
                        if (obj._objects?.length > 0 && obj.userData.Type != "MISC") {
                            obj.forEachObject(o => {
                                if (o.type === 'text') {
                                    o.set({
                                        text: obj.userData.Name
                                    })
                                }
                            })
                        }
                        obj.set({
                            isFullText: false
                        });
                        if (obj.userData.Mapping === $scope.model.Mapping) {
                            $scope.center = obj;
                        }
                        $scope.canvas.add(obj);
                    } else if (obj.type === 'image') {
                        await loadImageAsync(obj);

                    } else if (obj.type === 'textbox') {
                        startActiveObject(obj);
                        $scope.canvas.add(obj);
                    } else if (obj.name == 'line-style') {
                        if (obj.type == 'wavy-line-with-arrow') {
                            console.log(obj);
                            obj._objects = [];
                            obj.objects = [];
                            obj.updateInternalPointsData();
                        }

                        startActiveObject(obj);
                        $scope.canvas.add(obj);
                    } else {
                        obj.hasBorders = obj.hasControls = false;

                        if (obj.name === 'curve-point') {
                            obj.on('moving', function () {
                                const line = $scope.canvas.getObjects().find(item =>
                                    item.type === 'path' &&
                                    item.objectID === obj.lineID
                                );

                                if (line) {
                                    line.path[1][1] = obj.left;
                                    line.path[1][2] = obj.top;
                                }
                            })
                        } else if (obj.type === 'path') {
                            obj._setPath(obj.path);
                            obj.selectable = false;

                            if (obj.name == 'svg') {
                                startActiveObject(obj);
                            }
                        }
                        $scope.canvas.add(obj);
                    }
                    $scope.canvas.moveTo(obj, obj.userData.Deep);
                }
                else {
                    console.log(obj);
                    $scope.canvas.add(obj);
                }
            }
            //enlivenedObjects.forEach(function (obj) {

            //});
        });
    };

    // snap object to adjacent position of an object
    function objectSnapAdjacent(object) {
        // Sets corner position coordinates based on current angle, width and height
        object.setCoords();

        // Loop through objects
        $scope.canvas.forEachObject(function (obj) {
            if (obj === object || obj.name != "quiz-inputObj") return;

            // If objects intersect
            if (
                object.isContainedWithinObject(obj) ||
                object.intersectsWithObject(obj) ||
                obj.isContainedWithinObject(object)
            ) {
                var distX =
                    (obj.left + obj.width) / 2 - (object.left + object.width) / 2;
                var distY =
                    (obj.top + obj.height) / 2 - (object.top + object.height) / 2;

                // Set new position
                findNewPos(distX, distY, object, obj);
            }

            // Snap objects to each other horizontally

            // If bottom points are on same Y axis
            if (
                Math.abs(object.top + object.height - (obj.top + obj.height)) < snap
            ) {
                // Snap target BL to object BR
                if (Math.abs(object.left - (obj.left + obj.width)) < snap) {
                    object.left = obj.left + obj.width;
                    object.top = obj.top + obj.height - object.height;
                }

                // Snap target BR to object BL
                if (Math.abs(object.left + object.width - obj.left) < snap) {
                    object.left = obj.left - object.width;
                    object.top = obj.top + obj.height - object.height;
                }
            }

            // If top points are on same Y axis
            if (Math.abs(object.top - obj.top) < snap) {
                // Snap target TL to object TR
                if (Math.abs(object.left - (obj.left + obj.width)) < snap) {
                    object.left = obj.left + obj.width;
                    object.top = obj.top;
                }

                // Snap target TR to object TL
                if (Math.abs(object.left + object.width - obj.left) < snap) {
                    object.left = obj.left - object.width;
                    object.top = obj.top;
                }
            }

            // Snap objects to each other vertically

            // If right points are on same X axis
            if (
                Math.abs(object.left + object.width - (obj.left + obj.width)) < snap
            ) {
                // Snap target TR to object BR
                if (Math.abs(object.top - (obj.top + obj.height)) < snap) {
                    object.left = obj.left + obj.width - object.width;
                    object.top = obj.top + obj.height;
                }

                // Snap target BR to object TR
                if (Math.abs(object.top + object.height - obj.top) < snap) {
                    object.left = obj.left + obj.width - object.width;
                    object.top = obj.top - object.height;
                }
            }

            // If left points are on same X axis
            if (Math.abs(object.left - obj.left) < snap) {
                // Snap target TL to object BL
                if (Math.abs(object.top - (obj.top + obj.height)) < snap) {
                    object.left = obj.left;
                    object.top = obj.top + obj.height;
                }

                // Snap target BL to object TL
                if (Math.abs(object.top + object.height - obj.top) < snap) {
                    object.left = obj.left;
                    object.top = obj.top - object.height;
                }
            }
        });

        object.setCoords();

        // If objects still overlap

        var outerAreaLeft = null,
            outerAreaTop = null,
            outerAreaRight = null,
            outerAreaBottom = null;

        $scope.canvas.forEachObject(function (obj) {
            if (obj === object || obj.name != "quiz-inputObj") return;

            if (
                object.isContainedWithinObject(obj) ||
                object.intersectsWithObject(obj) ||
                obj.isContainedWithinObject(object)
            ) {
                var intersectLeft = null,
                    intersectTop = null,
                    intersectWidth = null,
                    intersectHeight = null,
                    intersectSize = null,
                    targetLeft = object.left,
                    targetRight = targetLeft + object.width,
                    targetTop = object.top,
                    targetBottom = targetTop + object.height,
                    objectLeft = obj.left,
                    objectRight = objectLeft + obj.width,
                    objectTop = obj.top,
                    objectBottom = objectTop + obj.height;

                // Find intersect information for X axis
                if (targetLeft >= objectLeft && targetLeft <= objectRight) {
                    intersectLeft = targetLeft;
                    intersectWidth = obj.width - (intersectLeft - objectLeft);
                } else if (objectLeft >= targetLeft && objectLeft <= targetRight) {
                    intersectLeft = objectLeft;
                    intersectWidth = object.width - (intersectLeft - targetLeft);
                }

                // Find intersect information for Y axis
                if (targetTop >= objectTop && targetTop <= objectBottom) {
                    intersectTop = targetTop;
                    intersectHeight = obj.height - (intersectTop - objectTop);
                } else if (objectTop >= targetTop && objectTop <= targetBottom) {
                    intersectTop = objectTop;
                    intersectHeight = object.height - (intersectTop - targetTop);
                }

                // Find intersect size (this will be 0 if objects are touching but not overlapping)
                if (intersectWidth > 0 && intersectHeight > 0) {
                    intersectSize = intersectWidth * intersectHeight;
                }

                // Set outer snapping area
                if (obj.left < outerAreaLeft || outerAreaLeft == null) {
                    outerAreaLeft = obj.left;
                }

                if (obj.top < outerAreaTop || outerAreaTop == null) {
                    outerAreaTop = obj.top;
                }

                if (obj.left + obj.width > outerAreaRight || outerAreaRight == null) {
                    outerAreaRight = obj.left + obj.width;
                }

                if (obj.top + obj.height > outerAreaBottom || outerAreaBottom == null) {
                    outerAreaBottom = obj.top + obj.height;
                }

                // If objects are intersecting, reposition outside all shapes which touch
                if (intersectSize) {
                    var distX = outerAreaRight / 2 - (object.left + object.width) / 2;
                    var distY = outerAreaBottom / 2 - (object.top + object.height) / 2;

                    // Set new position
                    findNewPos(distX, distY, object, obj);
                }
            }
        });
    }
    function centerOnBackground(object, canvas) {
        var zoom = canvas.getZoom();
        canvas.setZoom(1)  // reset zoom so pan actions work as expected
        var vpw = canvas.width / zoom;
        var vph = canvas.height / zoom;
        var x = (object.left + object.width / 2 - vpw / 2);  // x is the location where the top left of the viewport should be
        var y = (object.top + object.height / 2 - vph / 2);  // y idem
        if (object.scaleX && object.scaleY) {
            x = (object.left + object.width * object.scaleX / 2 - vpw / 2);  // x is the location where the top left of the viewport should be
            y = (object.top + object.height * object.scaleY / 2 - vph / 2);  // y idem
        }
        canvas.absolutePan({ x, y });
        canvas.setZoom(zoom);
    }

    //tham khao

    $scope.listFont = ['Times New Roman', 'Quicksand', 'VT323', 'Inconsolata', 'Pacifico'];
    $scope.listSize = [4, 8, 10, 12, 14, 18, 24, 32, 48, 64];
    var alignOptions = ["left", "center", "right"];
    $scope.fontSize = '';
    $scope.fontColor = '#000000';
    $scope.borderColor = '#000000';
    $scope.borderWidth = 1;
    $scope.curveValue = 0;
    $scope.backgroundColor = 'rgba(240,248,255,0)';
    $scope.isObjectFront = false;
    $scope.isTextFull = false;
    $scope.isObjectBlink = false;
    $scope.isObjectShadow = false;
    $scope.modelMapping = {};
    $scope.pool_data = [];
    $scope.currentLayer = 1;
    $scope.layerStorage = [
        {
            id: 1,
            canvas: {
                backgroundColor: "#ffffff",
                gridObj: null,
            },
        },
    ];

    $scope.changeFrontBack = function () {
        if ($scope.activeObject.pos === 'back') {
            $scope.activeObject.set({
                pos: 'front'
            })
            $scope.canvas.bringToFront($scope.activeObject);
            $scope.canvas.requestRenderAll();
        }
        else {
            $scope.activeObject.set({
                pos: 'back'
            })
            $scope.canvas.sendToBack($scope.activeObject);
            $scope.canvas.requestRenderAll();
        }
    }

    $scope.changeFontSize = function (font_size) {
        $scope.activeObject.set({
            fontSize: font_size
        })
        if ($scope.activeObject._objects?.length > 0) {
            if ($scope.activeObject.name === 'latex') {
                $scope.activeObject.item(0).set({
                    scaleX: (font_size + 16) / 12,
                    scaleY: (font_size + 16) / 12,
                })
                // activeObject.item(1).set({
                //     fontSize: font_size
                // })

                $scope.activeObject.addWithUpdate()
            }
            else {
                $scope.activeObject._objects.forEach(obj => {
                    if (obj.type == 'text' || obj.type == 'textbox') {
                        obj.set({
                            fontSize: font_size
                        })
                    }
                })
            }
        }
        if ($scope.activeObject.type === 'text') {
            $scope.activeObject.set({
                width: (font_size + 10) * 4
            })
        }

        console.log('font size', $scope.activeObject);
        $scope.canvas.requestRenderAll();
    }

    //Thay đổi font chữ
    $scope.changeFont = function (font) {
        if (font == "Times New Roman") {
            $scope.activeObject.set({
                fontFamily: font
            })

            $scope.activeObject

            $scope.activeObject._objects?.forEach(function (o) {
                if (o.type == "text" || o.type == "textbox") {
                    o.set("fontFamily", font)
                }
            })
            $scope.canvas.requestRenderAll();
        } else {
            WebFont.load({
                google: {
                    families: [font]
                },
                loading: function () { },
                active: function () {
                    $scope.activeObject.set({
                        fontFamily: font
                    });

                    $scope.activeObject._objects?.forEach(function (o) {
                        if (o.type === "text" || o.type == "textbox") {
                            o.set("fontFamily", font)
                        }
                    })

                    $scope.canvas.requestRenderAll()
                }
            })
        }
    }

    //Bold
    $scope.boldText = function () {
        if ($scope.activeObject.fontWeight != "bold") {
            $scope.activeObject.set({ fontWeight: "bold" });
            $scope.activeObject._objects?.forEach((o) => {
                if (o.type == "text" || o.type == "textbox") {
                    o.set("fontWeight", "bold")
                }
            });
            $scope.canvas.requestRenderAll()
        } else {
            $scope.activeObject.set({ fontWeight: "normal" });
            $scope.activeObject._objects?.forEach((o) => {
                if (o.type == "text" || o.type == "textbox") {
                    o.set("fontWeight", "normal")
                }
            });
            $scope.canvas.requestRenderAll()
        }
    }

    //Italic
    $scope.italicText = function () {
        if ($scope.activeObject.fontStyle != "italic") {
            $scope.activeObject.set({ fontStyle: "italic" })
            $scope.activeObject._objects?.forEach((o) => {
                if (o.type == "text" || o.type == "textbox") {
                    o.set("fontStyle", "italic")
                }
            })
            $scope.canvas.requestRenderAll()
        } else {
            $scope.activeObject.set({ fontStyle: "normal" })
            $scope.activeObject._objects?.forEach((o) => {
                if (o.type == "text" || o.type == "textbox") {
                    o.set("fontStyle", "normal")
                }
            })
            $scope.canvas.requestRenderAll()
        }
    }

    //Underline
    $scope.underlineText = function () {
        if ($scope.activeObject) {
            $scope.activeObject.underline = !$scope.activeObject.underline
            $scope.activeObject._objects?.forEach((o) => {
                if (o.type == "text" || o.type == "textbox") {
                    o.set("underline", $scope.activeObject.underline)
                }
            })

            $scope.canvas.requestRenderAll();
        }
    }

    $("#underline").on("click", function () {
        if ($scope.activeObject) {
            if ($scope.activeObject.type === "textbox") {
                console.log("if")
                $scope.activeObject.set('underline', !$scope.activeObject.underline);
            } else {
                console.log("else")
                $scope.activeObject.underline = !$scope.activeObject.underline;
                $scope.activeObject._objects?.forEach((o) => {
                    if (o.type === "textbox") {
                        o.set('underline', $scope.activeObject.underline);
                    }
                });
            }

            $(this).toggleClass("active");
        }
        console.log($scope.activeObject.underline);
        $scope.canvas.requestRenderAll();
    });

    $scope.alignText = function () {
        var idx = alignOptions.findIndex((o) => o === $scope.activeObject.textAlign);
        if (idx !== -1) {
            idx++;
            if (idx === 3) idx = 0;
            $("#align i:first-child").removeClass(
                `fa-align-${$scope.activeObject.textAlign}`
            );
            console.log(alignOptions[idx]);
            $scope.activeObject.textAlign = alignOptions[idx];
            $scope.activeObject._objects?.forEach((o) => {
                if (o.type == "text" || o.type == "textbox") {
                    o.textAlign = alignOptions[idx];
                }
            });
            $("#align i:first-child").addClass(
                `fa-align-${$scope.activeObject.textAlign}`
            );
        }

        $scope.canvas.requestRenderAll();
    }


    $scope.updateLineStyle = function (lineStyle) {
        if ($scope.activeObject.name == "line-style" || $scope.activeObject.type === "path") {
            if (lineStyle == "solid" || lineStyle == "dash") {
                $scope.activeObject.lineStyle = this.value;
                let strokeArr = [0, 0];
                if (lineStyle == "dash") strokeArr = [5, 5];

                if ($scope.activeObject._objects) {
                    $scope.activeObject._objects?.forEach((obj) => {
                        if (obj.type == "line" || obj.type == "path") {
                            obj.strokeDashArray = strokeArr;
                            obj.stroke = "#000";
                        }
                    });
                } else {
                    $scope.activeObject.strokeDashArray = strokeArr;
                    $scope.activeObject.stroke = "#000";
                }
                $scope.activeObject.shadow = null;
            } else if (lineStyle == "shadow") {
                const shadow = new fabric.Shadow({
                    blur: 5,
                    color: "#000",
                    offsetX: 0,
                    offsetY: 0,
                });

                $scope.activeObject.set({
                    shadow: shadow,
                });
                if ($scope.activeObject._objects) {
                    $scope.activeObject._objects.forEach((obj) => {
                        if (obj.type == "line" || obj.type == "path") {
                            obj.stroke = "#ddd";
                            obj.strokeDashArray = [0, 0];
                        }
                    });
                } else {
                    $scope.activeObject.stroke = "#ddd";
                    $scope.activeObject.strokeDashArray = [0, 0];
                }
            }

            $scope.canvas.requestRenderAll();
        }
    }

    $scope.changeFontColor = function (value) {
        if ($scope.activeObject._objects?.length > 0) {
            $scope.activeObject.forEachObject(o => {
                if (o.type === 'text' || o.type == "textbox") {
                    o.set({
                        fill: value
                    })
                }
            })
        }
        $scope.activeObject.set({
            colorText: value,
            fill: value,
        });
        $scope.canvas.requestRenderAll();
    }

    $scope.changeBorderColor = function (value) {
        if ($scope.activeObject._objects && $scope.activeObject.item(0)?.type != "textbox") {
            $scope.activeObject.item(0)?.set({
                stroke: value,
            })
        } else if ($scope.activeObject.name !== "text" && $scope.activeObject.name !== "latex") {
            $scope.activeObject.set({
                stroke: value,
            })
        }

        $scope.activeObject.set({
            colorBorder: value,
        })
        $scope.canvas.requestRenderAll();
    }

    $scope.changeBorderWidth = function (value) {
        if ($scope.activeObject._objects) {
            $scope.activeObject.item(0)?.set({
                strokeWidth: value,
            });
        } else {
            $scope.activeObject.set({
                strokeWidth: value,
            });
        }
        $scope.activeObject.set({
            widthBorder: value,
        });
        $scope.canvas.requestRenderAll();
    }

    $scope.changeCurve = function (value) {
        if ($scope.activeObject.name == "rect") {
            $scope.activeObject.item(0).set({
                rx: value,
                ry: value,
            });
        }

        $scope.activeObject.set({
            curve: value,
        });

        $scope.canvas.requestRenderAll();
    }

    $scope.changeShadowObject = function () {
        var item = document.getElementById('objShadow');
        if ($scope.activeObject.hasShadow) {
            $scope.activeObject.hasShadow = false;
            if ($scope.activeObject._objects) {
                $scope.activeObject.item(0).shadow = null;
            }
            else {
                $scope.activeObject.shadow = null;
            }

            item.innerText = "Off";
        } else {
            $scope.activeObject.hasShadow = true;
            if ($scope.activeObject._objects) {
                $scope.activeObject.item(0).shadow = $scope.activeObject.shadowObj;
            }
            else {
                $scope.activeObject.shadow = $scope.activeObject.shadowObj;
            }
            item.innerText = "On";
        }
        $scope.canvas.requestRenderAll();
    }

    $scope.fixed = function () {
        var item = document.getElementById('objFixed');
        if ($scope.activeObject.lockMovementX) {
            $scope.activeObject.set({
                lockMovementX: false,
                lockMovementY: false,
            });
            item.innerText = "Off";
        } else {
            $scope.activeObject.set({
                lockMovementX: true,
                lockMovementY: true,
            });
            item.innerText = "On";
        }
        $scope.canvas.requestRenderAll();
    }

    $scope.openSubMenu = function(){
        updateDataSubMenu()
    }

    function updateDataSubMenu(){
        var itemObjBring = document.getElementById('objBring');
        console.log($scope.activeObject.pos)
        if($scope.activeObject.pos === "back"){
            itemObjBring.innerText = "Back";
        }else{
            itemObjBring.innerText = "Front";
        }
    }

    $scope.changeBringTo = function () {
        var item = document.getElementById('objBring');
        $scope.pool_data = $scope.canvas.getObjects();
        if ($scope.activeObject.pos === "back") {
            $scope.activeObject.set({
                pos: "front",
            });
            $scope.canvas.bringToFront($scope.activeObject);
            item.innerText = "Back";
            $scope.pool_data = $scope.canvas.getObjects();
            console.log($scope.pool_data);
            if($scope.pool_data.length > 1){
                const fromIndex = $scope.pool_data.findIndex(
                    (o) => o.id === $scope.activeObject.objectID
                );
                const obj = $scope.pool_data.splice(fromIndex, 1)[0];
                $scope.pool_data.push(obj);
            }
        } else {
            $scope.activeObject.set({
                pos: "back",
            });
            if ($scope.layerStorage[$scope.currentLayer - 1].canvas.gridObj) {
                $scope.activeObject.moveTo(1);

                if($scope.pool_data.length > 1){
                    const fromIndex = $scope.pool_data.findIndex(
                        (o) => o.id === $scope.activeObject.objectID
                    );
                    const obj = $scope.pool_data.splice(fromIndex, 1)[0];
                    $scope.pool_data.splice(1, 0, obj);
                }
            } else {
                $scope.canvas.sendToBack($scope.activeObject);

                if($scope.pool_data.length > 1){
                    const fromIndex = $scope.pool_data.findIndex(
                        (o) => o.id === $scope.activeObject.objectID
                    );
                    const obj = $scope.pool_data.splice(fromIndex, 1)[0];
                    $scope.pool_data.unshift(obj);
                }
            }
            item.innerText = "Front";
        }
        updateDataSubMenu()
        $scope.canvas.requestRenderAll();
    }

    $scope.bgToggle = function () {
        var item = document.getElementById('bgToggle');
        if ($scope.activeObject.isBackground) {
            $scope.activeObject.set({
                isBackground: false,
                isDrag: true,
                isDrop: false,
                lockMovementX: false,
                lockMovementY: false,
            });
            item.innerText = "Off";

            $scope.canvas.setBackgroundImage(null, $scope.canvas.renderAll.bind($scope.canvas));
        } else {
            $scope.activeObject.set({
                isBackground: true,
                isDrag: false,
                isDrop: false,
                lockMovementX: true,
                lockMovementY: true,
            });
            repositionDragDrop();
            item.innerText = "On";

            $scope.canvas.setBackgroundImage($scope.activeObject, $scope.canvas.renderAll.bind($scope.canvas), {
                top: 0,
                left: 0,
                scaleX: $scope.canvas.width / $scope.activeObject.width,
                scaleY: $scope.canvas.height / $scope.activeObject.height,
            });
        }
        $scope.canvas.requestRenderAll();
    }

    function repositionDragDrop() {
        $scope.canvas.forEachObject(function (obj) {
            if (obj.isDrop === true) {
                obj.set({
                    pos: "back",
                    lockMovementY: true,
                    lockMovementX: true,
                    selectable: false,
                });
                $scope.canvas.sendToBack(obj);
            }
        });
        $scope.canvas.forEachObject(function (obj) {
            if (obj.isBackground === true) {
                obj.set({
                    pos: "back",
                    lockMovementY: true,
                    lockMovementX: true,
                    selectable: false,
                });
                $scope.canvas.sendToBack(obj);
            }
        });
    }

    $scope.changeBackgroundColor = function (value) {
        //value += '80';
        console.log(value);
        if ($scope.activeObject._objects?.length > 0) {
            $scope.activeObject.forEachObject(o => {
                o.set({
                    fill: value
                })
            })
        }
        $scope.activeObject.set({
            //colorText: value,
            backgroundColor: value,
        });
        $scope.canvas.requestRenderAll();
    }

    $scope.changeTextFull = function (value) {
        //var userData = $scope.activeObject.userData;
        for (var item of $scope.canvas._objects) {
            var userData = item.userData;
            if (!value && userData) {
                if (item._objects?.length > 0) {
                    item.forEachObject(o => {
                        if (o.type === 'text') {
                            o.set({
                                text: userData.Mapping
                            })
                        }
                    })
                }
                item.set({
                    isFullText: true
                });
            }
            else if (userData) {
                if (item._objects?.length > 0) {
                    item.forEachObject(o => {
                        if (o.type === 'text') {
                            o.set({
                                text: userData.Name
                            })
                        }
                    })
                }
                item.set({
                    isFullText: false
                });
            }
        }
        $scope.canvas.requestRenderAll();
    }
    $scope.changeObjectBlink = function () {
        var item = document.getElementById('objBlink');
        $scope.activeObject.blink = !$scope.activeObject.blink;
        if ($scope.activeObject.blink) {
            item.innerText = "ON";
            blink($scope.activeObject);
        } else {
            item.innerText = "OFF";
        }
        $scope.isObjectBlink = $scope.activeObject.blink;
    }
    $scope.group = function () {
        if (!$scope.canvas.getActiveObject()) {
            return;
        }
        if ($scope.canvas.getActiveObject().type !== 'activeSelection') {
            return;
        }
        const group = $scope.canvas.getActiveObject().toGroup()
        const objID = randomID();
        group.set({
            subTargetCheck: false,
            name: 'custom-group',
            objectID: objID,
        })

        group._objects.forEach(o => {
            o.groupID = objID
        })

        $scope.canvas.requestRenderAll();
    }
    $scope.ungroup = function () {
        if (!$scope.canvas.getActiveObject()) {
            return;
        }
        if ($scope.canvas.getActiveObject().type !== 'group') {
            return;
        }
        const group = $scope.canvas.getActiveObject()

        group.forEachObject((i) => {
            group.removeWithUpdate(i);
            $scope.canvas.add(i);
        });
        $scope.canvas.remove(group)

        $scope.canvas.requestRenderAll();
    }

    $rootScope.drawObject = function () {
        //if (!$rootScope.wareHouseCode || !$rootScope.floorCode) {
        //    return App.toastrError("Phải chọn một kho và một tầng");
        //}
        //canvas.getCommandStack().addEventListener(function (e) {
        //    if (e.isPostChangeEvent()) {
        //        displayJSON(canvas);
        //    }
        //});

        //if ($rootScope.floorCode != "" && $rootScope.floorCode != null) {

        //}
        $scope.center = null;
        var position = "";
        position += $rootScope.wareHouseCode ? 'WHS_' + $rootScope.wareHouseCode : "";
        //position += $rootScope.floorCode ? '_F_' + $rootScope.floorCode : "";
        //position += $rootScope.lineCode ? '_L_' + $rootScope.lineCode : "";
        //position += $rootScope.rackCode ? '_R_' + $rootScope.rackCode : "";
        //position += $rootScope.positionCode ? '_P_' + $rootScope.positionCode : "";
        dataservice.getListMappingFilterMisc(position, function (res) {
            $scope.canvas.clear();

            var json_data = [];
            res = res.data;
            for (var i = 0; i < res.length; i++) {
                var type = res[i].Type;
                var item = res[i];
                var code = res[i].Code;
                var dataObj = JSON.parse(res[i].ShapeData);
                if (dataObj != null && dataObj != undefined) {
                    //if ($rootScope.positionCode == res[i].Code && res[i].Type == "POSITION") {
                    //    json_data.push(dataObj);
                    //}
                    //else if (res[i].Type != "POSITION") {
                    //    json_data.push(dataObj);
                    //}
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
                    console.log(res[i].ShapeData);
                    var data = JSON.parse(res[i].ShapeData);
                    data.userData = res[i];
                    if (res[i].Mapping == $scope.model.Mapping) {
                        data.blink = true;
                    }
                    data.isFromDb = true;
                    json_data.push(data);
                } else {
                    //var data = $scope.initObject(type, item, true);
                    //if (res[i].Mapping == $scope.model.Mapping) {
                    //    data.blink = true;
                    //}
                    //data.isFromDb = false;
                    //json_data.push(data);
                }
            }

            //var reader = new Reader();
            //reader.unmarshal(canvas, json_data);
            $scope.update();
            loadCanvasJsonNew(json_data);
            displayJSON();
            $scope.canvas.renderAll();
            setTimeout(() => {
                if ($scope.center && $scope.zoomFocus) {
                    centerOnBackground($scope.center, $scope.canvas);
                }
            }, 1000);
            //$scope.zoomInit();
        });
    }
    $rootScope.searchObjectNew = function (position, categoryCode) {
        if (!$rootScope.areaCode || !$rootScope.floorCode) {
            return App.toastrError("Phải chọn một khu vực và một tầng");
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
                        $scope.initObject(type, item, true); //Bỏ
                    }
                }

                var reader = new Reader();
                reader.unmarshal(canvas, json_data);
                $scope.update();
            });
        }
    }
    $rootScope.searchObject = function (WhsCode, FloorCode, LineCode, rackCode, cabinetCode, positionPack) {
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
                        $scope.initObject(type, item, true); //Bỏ
                    }
                }

                var reader = new Reader();
                reader.unmarshal(canvas, json_data);
                $scope.update();
            });
        }
        else {
            if ($scope.model.WhsCode != WhsCode) {
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
                canvas.clear();

                var json_data = [];
                dataservice.getListChildByFloorCode(FloorCode, function (res) {
                    res = res.data;
                    for (var i = 0; i < res.length; i++) {
                        var type = res[i].ZoneType;
                        var item = res[i];

                        var dataObj = JSON.parse(res[i].ShapeData);
                        if (dataObj != null && dataObj != undefined) {
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
            else {
                if (rackCode !== undefined && rackCode != null && rackCode !== '') {
                    if (count < 1) {
                        canvas.setZoom(canvas.getZoom() * 0.8, true);
                    }

                    var node = $rootScope.canvas2.getFigure(rackCode);
                    if (node != null) {
                        $('#contentMain ').scrollTop(node.y);
                        $('#contentMain ').scrollLeft(node.x);
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
                    $('#contentMain ').scrollTop(node2.y);
                    $('#contentMain ').scrollLeft(node2.x);
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
    function displayJSON() {
        //var writer = new draw2d.io.json.Writer();
        //writer.marshal(canvas, function (json) {

        //});
        var json = $scope.canvas._objects;
        $("#json").text(JSON.stringify(json, null, 2));
        $scope.shapeData = json;
        $rootScope.shapeData = json;
    }
    // manager

    $scope.addArea = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDiagram + '/addCategory.html',
            controller: 'addCategory',
            keyboard: true,
            backdrop: false,
            //backdrop: 'static',
            size: '35',
            resolve: {
                para: function () {
                    return {
                        Parent: "",
                        Title: caption.EDMSWM_CURD_TITLE_ADD_AREA,
                        Type: "AREA",
                        ParentType: "AREA",
                        LockParent: false
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.editArea = function () {
        var id = $rootScope.areaID;
        if (id != null) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderDiagram + '/editCategory.html',
                controller: 'editCategory',
                keyboard: true,
                backdrop: false,
                //backdrop: 'static',
                size: '35',
                resolve: {
                    para: function () {
                        return {
                            Parent: "",
                            Title: caption.EDMSWM_CURD_TITLE_EDIT_AREA,
                            Type: "AREA",
                            ParentType: "AREA",
                            LockParent: false,
                            Id: $rootScope.areaID
                        };
                    }
                }
            });
            modalInstance.result.then(function (d) {

            }, function () {
            });
        } else {
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_CATEGORY_EDIT);
        }
    };

    $scope.deleteArea = function () {
        if (!isAllData) {
            return App.toastrError('Không có quyền xóa đối tượng');
        }
        var id = $rootScope.areaID;
        if (id != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.EDMSW_MSG_CLEAR_CATEGORY;
                    $scope.ok = function () {
                        dataservice.deleteCategory(id, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: '25',
            });
            modalInstance.result.then(function (d) {
                //$rootScope.reloadFloor();
                $rootScope.reloadCategory('AREA');
                $rootScope.areaCode = '';
                $rootScope.floorCode = '';
                $rootScope.lineCode = '';
                $rootScope.rackCode = '';
                $rootScope.positionCode = '';
                $scope.model.WhsCode = '';
                $scope.model.FloorCode = '';
                $scope.model.LineCode = '';
                $scope.model.RackCode = '';
                $scope.model.PositionCode = '';
            }, function () {
            });
        } else {
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_CATEGORY_EDIT);
        }
    };

    $scope.addFloor = function () {
        var floor = $scope.listFloor.find(x => x.Code == $rootScope.floorCode);
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDiagram + '/addCategory.html',
            controller: 'addCategory',
            keyboard: true,
            backdrop: false,
            //backdrop: 'static',
            size: '35',
            resolve: {
                para: function () {
                    return {
                        Code: $rootScope.floorCode ? $rootScope.floorCode : "",
                        Name: floor ? floor.Name : "",
                        Parent: $rootScope.areaCode,
                        Title: caption.EDMSWM_CURD_TITLE_ADD_FLOOR,
                        Type: "FLOOR",
                        ParentType: "AREA",
                        LockParent: true
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.editFloor = function () {
        var id = $rootScope.floorID;
        if (id != null) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderDiagram + '/editCategory.html',
                controller: 'editCategory',
                keyboard: true,
                backdrop: false,
                //backdrop: 'static',
                size: '35',
                resolve: {
                    para: function () {
                        return {
                            Parent: $rootScope.areaCode,
                            Title: caption.EDMSWM_TITLE_EDIT_FLOOR,
                            Type: "FLOOR",
                            ParentType: "AREA",
                            LockParent: true,
                            Id: $rootScope.floorID
                        };
                    }
                }
            });
            modalInstance.result.then(function (d) {

            }, function () {
            });
        } else {
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_CATEGORY_EDIT);
        }
    };

    $scope.deleteFloor = function () {
        if (!isAllData) {
            return App.toastrError('Không có quyền xóa đối tượng');
        }
        var floorId = $rootScope.floorID;
        if (floorId != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.EDMSW_MSG_CLEAR_CATEGORY;
                    $scope.ok = function () {
                        dataservice.deleteCategory(floorId, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: '25',
            });
            modalInstance.result.then(function (d) {
                $rootScope.reloadFloor();
                $rootScope.floorCode = '';
                $rootScope.lineCode = '';
                $rootScope.rackCode = '';
                $rootScope.positionCode = '';
                $scope.model.FloorCode = '';
                $scope.model.LineCode = '';
                $scope.model.RackCode = '';
                $scope.model.PositionCode = '';
            }, function () {
            });
        } else {
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_CATEGORY_EDIT);
        }
    };

    $scope.addLine = function () {
        var line = $scope.listLine.find(x => x.Code == $rootScope.lineCode);
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDiagram + '/addCategory.html',
            controller: 'addCategory',
            keyboard: true,
            backdrop: false,
            //backdrop: 'static',
            size: '35',
            resolve: {
                para: function () {
                    return {
                        Code: $rootScope.lineCode ? $rootScope.lineCode : "",
                        Name: line ? line.Name : "",
                        Parent: $rootScope.floorCode,
                        Title: caption.EDMSWM_CURD_TITLE_ADD_LINE,
                        Type: "LINE",
                        ParentType: "FLOOR",
                        LockParent: true
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.editLine = function () {
        var id = $rootScope.lineID;
        if (id != null) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderDiagram + '/editCategory.html',
                controller: 'editCategory',
                keyboard: true,
                backdrop: false,
                //backdrop: 'static',
                size: '35',
                resolve: {
                    para: function () {
                        return {
                            Parent: $rootScope.floorCode,
                            Title: caption.EDMSWM_TITLE_EDIT_LINE,
                            Type: "LINE",
                            ParentType: "FLOOR",
                            LockParent: true,
                            Id: $rootScope.lineID
                        };
                    }
                }
            });
            modalInstance.result.then(function (d) {

            }, function () {
            });
        } else {
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_CATEGORY_EDIT);
        }
    }

    $scope.deleteLine = function () {
        if (!isAllData) {
            return App.toastrError('Không có quyền xóa đối tượng');
        }
        var lineId = $rootScope.lineID;
        if (lineId != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.EDMSWH_MSG_DEL_RANGE;
                    $scope.ok = function () {
                        dataservice.deleteCategory(lineId, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: '25',
            });
            modalInstance.result.then(function (d) {
                $rootScope.reloadLine();
                $rootScope.lineCode = '';
                $rootScope.rackCode = '';
                $rootScope.positionCode = '';
                $scope.model.LineCode = '';
                $scope.model.RackCode = '';
                $scope.model.PositionCode = '';
            }, function () {
            });
        } else {
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_LINE_DELETE);
        }
    };

    $scope.addRack = function () {
        var rack = $scope.listRack.find(x => x.Code == $rootScope.rackCode);
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDiagram + '/addCategory.html',
            controller: 'addCategory',
            keyboard: true,
            backdrop: false,
            //backdrop: 'static',
            size: '35',
            resolve: {
                para: function () {
                    return {
                        Code: $rootScope.rackCode ? $rootScope.rackCode : "",
                        Name: rack ? rack.Name : "",
                        Parent: $rootScope.lineCode,
                        Title: caption.EDMSWM_CURD_TITLE_ADD_RACK,
                        Type: "RACK",
                        ParentType: "LINE",
                        LockParent: true
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.editRack = function () {
        var rackId = $rootScope.rackID;
        if (rackId != null) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderDiagram + '/editCategory.html',
                controller: 'editCategory',
                keyboard: true,
                backdrop: false,
                //backdrop: 'static',
                size: '35',
                resolve: {
                    para: function () {
                        return {
                            Parent: $rootScope.lineCode,
                            Title: caption.EDMSWM_TITLE_EDIT_LINE,
                            Type: "RACK",
                            ParentType: "LINE",
                            LockParent: true,
                            Id: $rootScope.rackID
                        };
                    }
                }
            });
            modalInstance.result.then(function (d) {

            }, function () {
            });
        } else {
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_RACK_EDIT);
        }
    };

    $scope.deleteRack = function () {
        if (!isAllData) {
            return App.toastrError('Không có quyền xóa đối tượng');
        }
        var rackId = $rootScope.rackID;
        if (rackId != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.EDMSWH_MSG_DEL_SHELF;
                    $scope.ok = function () {
                        dataservice.deleteCategory(rackId, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: '25',
            });
            modalInstance.result.then(function (d) {
                $rootScope.reloadRack();
                $rootScope.rackCode = '';
                $rootScope.positionCode = '';
                $scope.model.RackCode = '';
                $scope.model.PositionCode = '';
            }, function () {
            });
        } else {
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_RACK_DELETE);
        }
    };

    $scope.addPosition = function () {
        var position = $scope.listPosition.find(x => x.Code == $rootScope.positionCode);
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDiagram + '/addCategory.html',
            controller: 'addCategory',
            keyboard: true,
            backdrop: false,
            //backdrop: 'static',
            size: '35',
            resolve: {
                para: function () {
                    return {
                        Code: $rootScope.positionCode ? $rootScope.positionCode : "",
                        Name: position ? position.Name : "",
                        Parent: $rootScope.rackCode,
                        Title: caption.EDMSWM_CURD_TITLE_ADD_POSITION,
                        Type: "POSITION",
                        ParentType: "RACK",
                        LockParent: true
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    $scope.editPosition = function () {
        var id = $rootScope.positionID;
        if (id != null) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderDiagram + '/editCategory.html',
                controller: 'editCategory',
                keyboard: true,
                backdrop: false,
                //backdrop: 'static',
                size: '35',
                resolve: {
                    para: function () {
                        return {
                            Parent: $rootScope.rackCode,
                            Title: caption.EDMSWM_TITLE_EDIT_LINE,
                            Type: "POSITION",
                            ParentType: "RACK",
                            LockParent: true,
                            Id: $rootScope.positionID
                        };
                    }
                }
            });
            modalInstance.result.then(function (d) {

            }, function () {
            });
        } else {
            App.toastrError(caption.EDMSWM_VALIDATE_CHOOSE_RACK_EDIT);
        }
    };

    $scope.deletePosition = function () {
        if (!isAllData) {
            return App.toastrError('Không có quyền xóa đối tượng');
        }
        var id = $rootScope.positionID;
        if (id != null) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = /*caption.EDMSWH_MSG_DEL_SHELF*/'Bạn có chắc chắn xóa vị trí';
                    $scope.ok = function () {
                        dataservice.deleteCategory(id, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: '25',
            });
            modalInstance.result.then(function (d) {
                $rootScope.reloadPosition();
                $rootScope.positionCode = '';
                $scope.model.PositionCode = '';
            }, function () {
            });
        } else {
            App.toastrError(/*caption.EDMSWM_VALIDATE_CHOOSE_RACK_DELETE*/'');
        }
    };

    $scope.addBox = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addBox.html',
            controller: 'addBox',
            backdrop: 'static',
            size: '65'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.edit = function (id) {
        var model = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id + "") {
                model = listdata[i];
                break;
            }
        }
        $rootScope.areaID = id;
        //$rootScope.wareHouseCode = model.WHS_Code;
        $rootScope.floorCode = '';
        $rootScope.lineCode = '';
        //$rootScope.showListFloor = true;
        //$rootScope.showListLine = false;
        //$rootScope.showListRack = false;
        if ($rootScope.floorReload)
            $rootScope.reloadFloor();
    }

    $scope.exportExcel = function () {
        dataservice.exportExcel(function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            download(rs.fileName, '/' + rs.pathFile);
        });
    }
    $scope.cloneCount = 0;
    $scope.cloneObj = function () {
        if (!$scope.activeObject) {
            return;
        }

        if ($scope.activeObject.type === 'textbox') {
            copyObjects()
            pasteObjects()
        } else {
            $scope.activeObject.clone(function (cloned) {
                $scope._clipboard = cloned;

                $scope._clipboard.clone(function (clonedObj) {
                    //$scope.canvas.discardActiveObject();
                    clonedObj.set({
                        left: clonedObj.left + 10,
                        top: clonedObj.top + 10,
                        evented: true,
                    });
                    // drag drop question special case
                    if (clonedObj.answerId) {
                        countItem++;
                        clonedObj.answerId = countItem;
                    }
                    // end
                    if (clonedObj.type === "activeSelection") {
                        // active selection needs a reference to the $scope.canvas.
                        clonedObj.canvas = $scope.canvas;
                        clonedObj.forEachObject(function (obj) {
                            obj.objectID = randomID();
                            if (obj.name == "media") {
                                if (obj.nameDevice == "attach-file") {
                                    attachFileObj = obj;
                                    startActiveFileObj(obj);

                                } else {
                                    activeDeviceObject = obj;
                                    startActiveMedia(obj);
                                }
                            } else {
                                activeDeviceObject = obj;
                                startActiveMedia(obj);
                            }
                            $scope.canvas.add(obj);
                        });
                        // this should solve the unselectability
                        clonedObj.setCoords();
                    } else {
                        clonedObj.objectID = randomID();
                        if (clonedObj.name != "custom-group") {
                            clonedObj._objects[0].strokeWidth = $scope.widthBorderObjFirst
                            var listObject = clonedObj._objects;
                            for (let index = 0; index < listObject.length; index++) {
                                const element = listObject[index];
                                if (element.type === "text") {
                                    $scope.cloneCount++;
                                    element.text += ` [ Copy ${$scope.cloneCount} ] `;
                                    console.log(element);
                                }
                            }
                            startActiveObject(clonedObj);
                            $scope.canvas.add(clonedObj);
                        } else {
                            var listObject = clonedObj._objects;
                            for (let index = 0; index < listObject.length; index++) {
                                const element = listObject[index];
                                if (element.__eventListeners) {
                                    element.__eventListeners["mousedblclick"] = [];
                                }
                                console.log(element);
                                if (element.type != "textbox") {
                                    element.on("mousedblclick", handleDbclickChild);
                                } else {
                                    element.on("mouseup", function (e) {
                                        if (e.button === 1) {
                                            console.log("left click");
                                        }
                                        // if(e.button === 2) {
                                        //     console.log("middle click");
                                        // }
                                        if (e.button === 3) {
                                            handleTextboxRightclick(this);
                                        }
                                    });
                                }
                            }
                            $scope.canvas.add(clonedObj);
                        }
                    }
                    $scope._clipboard.top += 10;
                    $scope._clipboard.left += 10;
                    objectSnapAdjacent(clonedObj);
                    $scope.canvas.setActiveObject(clonedObj);
                    $scope.canvas.requestRenderAll();
                }, $scope.customAttributes);
            }, $scope.customAttributes);
        }
    }

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', text);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    $scope.saveMapping = function () {
        if (!$scope.modelMap.CategoryCode) {
            return App.toastrError("Bạn chưa chọn danh mục nào");
        }
        // #region Chỉnh sửa lại border width và strokeWidth của object
        if ($scope.activeObject._objects) {
            $scope.activeObject.item(0)?.set({
                strokeWidth: $scope.widthBorderObjFirst,
            });
        } else {
            $scope.activeObject.set({
                strokeWidth: $scope.widthBorderObjFirst,
            });
        }
        $scope.activeObject.set({
            widthBorder: $scope.widthBorderObjFirst,
        });
        // #endregion
        console.log($scope.modelMap);
        // #region Đưa object này lên đầu
        $scope.canvas.bringToFront($scope.activeObject);

        // Lấy danh sách các đối tượng trong Canvas
        var objects = $scope.canvas.getObjects();

        // Tìm vị trí của đối tượng trong danh sách
        var zIndex = objects.indexOf($scope.activeObject);
        console.log($scope.activeObject);
        console.log("Độ sâu của đối tượng là: " + zIndex);
        // #endregion
        const model = {
            ObjectCode: $scope.modelMap.Mapping,
            OldObjectCode: $scope.activeObject.userData?.Mapping ?? '',
            ObjectType: $scope.modelMap.Type,
            CategoryCode: $scope.modelMap.CategoryCode,
            WhsCode: $scope.model.WhsCode,
            Status: /*$scope.model.Status*/"",
            SvgIconData: "",
            Image: "",
            ShapeData: JSON.stringify($scope.activeObject),
            JsonAttr: /*JSON.stringify($scope.listNewAttr)*/"{}",
            Deep: zIndex
        };
        console.log(model);
        // $scope.insertImage(function () {

        // })
        dataservice.insertMapping(model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                console.log("error");
                App.toastrError(rs.Title);
            } else {
                console.log("oke");
                App.toastrSuccess("Lưu thành công");
                $rootScope.drawObject();
                //$uibModalInstance.dismiss('cancel');
            }
        });
    }

    function detectMob() {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];

        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    }

    if (detectMob()) {
        // alert("Mobile / Tablet version");
        $("#curve-line").addClass("hidden");
    }

    let isCreateDoquiz = false;
    let correctAnswerBox;
    let userAnswerBox;

    // function loadLayerCanvasJsonNew(arr, canvas) {
    //     console.log(`  ~ arr, canvas`, arr, canvas.id);
    //     // console.log('load layer canvas', arr, canvas.id);// vuong
    //     var groups = [];
    //     for (let index = 0; index < arr.length; index++) {
    //         if (arr[index].data && arr[index].layer == canvas.id) {
    //             var jsonObj = arr[index].data;
    //             if (arr[index].type == "lineConnect") {
    //                 // }
    //                 // if (jsonObj.name === 'custom-group') {
    //             } else {
    //                 fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
    //                     enlivenedObjects.forEach(function (obj) {
    //                         // console.log(obj);
    //                         // if (obj.groupID) {
    //                         //     const group = groups.find(g => g.id === obj.groupID)
    //                         //     if (group) {
    //                         //         group.objs.push(obj)
    //                         //     }
    //                         //     else {
    //                         //         groups.push({
    //                         //             id: obj.groupID,
    //                         //             objs: [obj]
    //                         //         })
    //                         //     }
    //                         //     return;
    //                         // }
    //                         var quizType = $("#quiz-type").val();
    //                         if (obj.isDrag === true || obj.isDrop === true) {
    //                             countItem++;
    //                         }
    //                         if (obj?.name === "line-style") {
    //                             obj.set({
    //                                 selectable: true,
    //                                 hasBorders: true,
    //                                 hasRotatingPoint: true,
    //                                 hasBorders: true,
    //                                 transparentCorners: false,
    //                             });
    //                             obj.setControlsVisibility({
    //                                 tl: true,
    //                                 tr: true,
    //                                 bl: true,
    //                                 br: true,
    //                                 mtr: true,
    //                                 mb: true,
    //                                 mt: true,
    //                                 ml: true,
    //                                 mr: true,
    //                             });
    //                         }

    //                         if (obj.name == "lineConnect") {
    //                             var line = new fabric.Path("M 65 0 Q 100 100 200 0", {
    //                                 //  M 65 0 L 73 6 M 65 0 L 62 6 z
    //                                 fill: "",
    //                                 stroke: "#000",
    //                                 objectCaching: false,
    //                                 originX: "center",
    //                                 originY: "center",
    //                                 name: "lineConnect",
    //                                 idObject1: obj.idObject1,
    //                                 idObject2: obj.idObject2,
    //                                 port1: obj.port1,
    //                                 port2: obj.port2,
    //                                 objectID: obj.objectID,
    //                             });

    //                             line.selectable = false;
    //                             line.path = obj.path;

    //                             canvas.add(line);
    //                         } else if (obj.name == "media") {
    //                             console.log("media", obj);
    //                             if (obj.nameDevice == "attach-file") {
    //                                 attachFileObj = obj;
    //                                 startActiveFileObj(obj);
    //                             } else {
    //                                 activeDeviceObject = obj;
    //                                 obj.on("mouseup", handleMouseUpSvg);
    //                                 startActiveMedia(obj);
    //                             }

    //                             obj.set({
    //                                 objectID: arr[index].objectID,
    //                                 userID: arr[index].userID,
    //                             });
    //                             canvas.add(obj);
    //                         } else if (obj.name == "latex") {
    //                             obj.set({
    //                                 objectID: arr[index].objectID,
    //                                 userID: arr[index].userID,
    //                             });
    //                             startActiveTextbox(obj)
    //                             startActiveObject(obj);
    //                             canvas.add(obj);
    //                         } else if (obj.type === "group") {
    //                             if (obj.name == "line-style" && obj.lineType == "curve") {
    //                                 obj._objects.forEach((obj) => obj._setPath(obj.path));
    //                             }
    //                             obj._objects.forEach((child) => {
    //                                 if (child.id == "answer-correct-textbox") {
    //                                     correctAnswerBox = child;
    //                                     if (quizType == "quiz-3") {
    //                                         console.log(correctAnswerBox);
    //                                         correctAnswerBox.text = correctAnswerMatch
    //                                             .map((item) => item)
    //                                             .join(", ");
    //                                     }
    //                                     const title = new fabric.Text("User Answer", {
    //                                         top: 0,
    //                                         left: 30,
    //                                         fontSize: 16,
    //                                         fontFamily: "Times New Roman",
    //                                     });

    //                                     userAnswerBox = new fabric.Textbox("", {
    //                                         left: 0,
    //                                         top: 40,
    //                                         width: 200,
    //                                         fontSize: 10,
    //                                         fontFamily: "Times New Roman",
    //                                         id: "answer-correct-textbox",
    //                                     });

    //                                     const group = new fabric.Group([title, userAnswerBox], {
    //                                         top: 150,
    //                                         left: 50,
    //                                         selectable: false,
    //                                     });

    //                                     canvas.add(group);
    //                                     isCreateDoquiz = true;
    //                                 } else if (child.type == "textbox") {
    //                                     startActiveTextbox(obj)
    //                                     startActiveObject(obj);
    //                                 }
    //                             });

    //                             if (obj.name == "grid") {
    //                                 obj.set({
    //                                     evented: false,
    //                                     selectable: false,
    //                                     renderOnAddRemove: false,
    //                                     objectCaching: false,
    //                                 });
    //                                 obj.moveTo(0);
    //                             }

    //                             obj.set({
    //                                 objectID: arr[index].objectID,
    //                                 userID: arr[index].userID,
    //                             });

    //                             startActiveObject(obj);
    //                             canvas.add(obj);
    //                         } else if (obj.type === "image") {
    //                             fabric.util.loadImage(
    //                                 obj.src,
    //                                 function (para) {
    //                                     var img = new fabric.Image(para);
    //                                     img.set({
    //                                         ...obj,
    //                                     });
    //                                     if (quizType == "quiz-3") {
    //                                         img.set({
    //                                             name: obj.name,
    //                                             id: obj.id,
    //                                             port1: obj.port1,
    //                                             port2: obj.port2,
    //                                             idObject1: obj.idObject1,
    //                                             idObject2: obj.idObject2,
    //                                             objectID: obj.objectID,
    //                                             port: obj.port,
    //                                             lineID: obj.lineID,
    //                                             hasShadow: obj.hasShadow,
    //                                             shadowObj: obj.shadowObj,
    //                                             pos: obj.pos,
    //                                             snap: obj.snap,
    //                                             readySound: obj.readySound,
    //                                             sound: obj.sound,
    //                                             line2: obj.line2,
    //                                             isDrop: obj.isDrop,
    //                                             isDrag: obj.isDrag,
    //                                             isBackground: obj.isBackground,
    //                                             answerId: obj.answerId,
    //                                         });
    //                                     }
    //                                     startActiveObject(img);
    //                                     img.set({
    //                                         objectID: arr[index].objectID,
    //                                         userID: arr[index].userID,
    //                                     });
    //                                     console.log("load image", img, obj);
    //                                     canvas.add(img);
    //                                     repositionBackground();
    //                                 },
    //                                 null,
    //                                 { crossOrigin: "anonymous" }
    //                             );
    //                         } else if (obj.name == "line-style") {
    //                             if (obj.type == "wavy-line-with-arrow") {
    //                                 console.log("obj", obj);
    //                                 obj._objects = [];
    //                                 obj.objects = [];
    //                                 obj.updateInternalPointsData();
    //                             }

    //                             startActiveObject(obj);
    //                             obj.set({
    //                                 objectID: arr[index].objectID,
    //                                 userID: arr[index].userID,
    //                             });
    //                             canvas.add(obj);
    //                         } else if (obj.type === "textbox") {
    //                             obj.set({
    //                                 objectID: arr[index].objectID,
    //                                 userID: arr[index].userID,
    //                             });
    //                             startActiveTextbox(obj)
    //                             startActiveObject(obj);
    //                             canvas.add(obj);
    //                         } else {
    //                             obj.hasBorders = obj.hasControls = false;

    //                             if (obj.name === "curve-point") {
    //                                 obj.on("moving", function () {
    //                                     const line = canvas
    //                                         .getObjects()
    //                                         .find(
    //                                             (item) =>
    //                                                 item.type === "path" && item.objectID === obj.lineID
    //                                         );

    //                                     if (line) {
    //                                         line.path[1][1] = obj.left;
    //                                         line.path[1][2] = obj.top;
    //                                     }
    //                                 });
    //                             } else if (obj.type === "path") {
    //                                 obj._setPath(obj.path);

    //                                 if (obj.name == "svg") {
    //                                     startActiveObject(obj);
    //                                     obj.set({
    //                                         objectID: arr[index].objectID,
    //                                         userID: arr[index].userID,
    //                                     });
    //                                 }
    //                             }
    //                             canvas.add(obj);
    //                         }
    //                         if (obj.isMoving && obj.startMoving) {
    //                             obj.startMoving();
    //                         }
    //                     });
    //                 });
    //             }
    //         }
    //     }
    //     console.log("groups", groups);

    //     groups.forEach((g) => {
    //         const grp = pool_data.find((o) => o.objectID === g.id);
    //         const group = new fabric.Group(g.objs, {
    //             ...grp?.data,
    //             name: "custom-group",
    //             objectID: g.id,
    //         });
    //         canvas.add(group);
    //     });
    //     canvas.renderAll();
    // }

    //function event for draw line
    $scope.isCurving = false;
    $scope.isDrawLine = false;
    $scope.lineType = "";
    $scope.drawLine;
    $scope.isLoadDataLocal = true;
    $scope.lineArray = [];
    $scope.pointArray = [];
    $scope.isDown;
    $scope.drawLineTimeId = null;
    $scope.isDrawingLine = false;
    $scope.typesOfLinesIter = -1;
    $scope.typesOfLines = [
        // Default: sine
        null,
        // Custom: tangens
        [
            function (x) {
                return Math.max(-10, Math.min(Math.tan(x / 2) / 3, 10));
            },
            4 * Math.PI,
        ],
        // Custom: Triangle function
        [
            function (x) {
                let g = x % 6;
                if (g <= 3) return g * 5;
                if (g > 3) return (6 - g) * 5;
            },
            6,
        ],
        // Custom: Square function
        [
            function (x) {
                let g = x % 6;
                if (g <= 3) return 15;
                if (g > 3) return -15;
            },
            6,
        ],
    ];
    $scope.nextPointStart = null;
    $scope.drawingLineTimeId = null;

    function addDrawLineListener() {
        $scope.canvas.on("mouse:up", onDrawLineMouseUp);
        $scope.canvas.on("mouse:down", onDrawLineMouseDown);
        $scope.canvas.on("mouse:dblclick", onDrawLineDblClick);
        $scope.canvas.on("mouse:move", onDrawLineMouseMove);
    }

    function removeDrawLineListener() {
        $scope.canvas.off("mouse:up", onDrawLineMouseUp);
        $scope.canvas.off("mouse:down", onDrawLineMouseDown);
        $scope.canvas.off("mouse:dblclick", onDrawLineDblClick);
        $scope.canvas.off("mouse:move", onDrawLineMouseMove);
    }

    function setSelectDrawLine(value) {
        $scope.canvas.forEachObject(function (object) {
            object.selectable = value;
            object.setCoords();
        });
        $scope.canvas.selection = value;
        // if (lineType == 'multiple' || lineType == 'dash') {

        // }
        $scope.canvas.renderAll();
    }

    function onDrawLineMouseUp(options) {
        $scope.isCurving = false;
        if ($scope.lineType == "waving" || $scope.lineType == "simple") {
            $scope.isDown = false;
            $scope.drawLine.setCoords();
            setDefaultAttributes($scope.drawLine);
            startActiveObject($scope.drawLine);
            $scope.drawLine.set({
                name: "line-style",
                lineType,
            });

            $scope.canvas.setActiveObject($scope.drawLine).renderAll();
            $scope.drawLine = null;
            $scope.isLoadDataLocal = false;
            emitEvent();

            $("#lines").click();
        }
        else if ($scope.lineType == "curve") {
            const pointer = $scope.canvas.getPointer(options.e);

            $scope.drawLine = new fabric.Path("M 0 0 Q 100 100 200 0", {
                stroke: "black",
                hasControls: false,
                hasBorders: false,
                strokeWidth: 1,
                fill: "",
            });

            $scope.drawLine.path[0] = ["M", pointer.x, pointer.y];
            $scope.drawLine.path[1] = ["Q", pointer.x, pointer.y, pointer.x, pointer.y];

            if ($scope.nextPointStart) {
                $scope.drawLine.path[0] = ["M", $scope.nextPointStart.x, $scope.nextPointStart.y];
                $scope.drawLine.path[1] = [
                    "Q",
                    $scope.nextPointStart.x,
                    $scope.nextPointStart.y,
                    $scope.nextPointStart.x,
                    $scope.nextPointStart.y,
                ];
            }
            $scope.lineArray.push($scope.drawLine);
            $scope.canvas.add($scope.drawLine);
            $scope.canvas.renderAll();
        }

        var time = 500;

        if ($scope.lineType === "dot") {
            time = 1000;
        }
        $scope.drawLineTimeId = setTimeout(() => {
            onDrawLineDblClick()
        }, time);
    }

    function onDrawLineMouseDown(options) {
        // fake double click event for ipad,...
        if ($scope.isDrawingLine) {
            onDrawLineDblClick();
            $scope.isDrawingLine = false;
        } else {
            $scope.isDrawingLine = true;
            $scope.drawingLineTimeId = setTimeout(() => {
                $scope.isDrawingLine = false;
            }, 500);
        }

        if ($scope.drawLineTimeId) {
            clearTimeout($scope.drawLineTimeId);
            $scope.drawLineTimeId = null;
        }

        $scope.isDown = true;
        const pointer = $scope.canvas.getPointer(options.e);
        const points = [pointer.x, pointer.y, pointer.x, pointer.y];

        if ($scope.lineType == "multiple") {
            $scope.drawLine = new fabric.Line(points, {
                stroke: "black",
                hasControls: false,
                hasBorders: false,
                lockMovementX: false,
                lockMovementY: false,
                hoverCursor: "default",
                selectable: false,
            });

            $scope.lineArray.push($scope.drawLine);
            $scope.canvas.add($scope.drawLine);
            // isLoadDataLocal = false;
        } else if ($scope.lineType == "dash") {
            $scope.drawLine = new fabric.Line(points, {
                stroke: "black",
                hasControls: false,
                hasBorders: false,
                lockMovementX: false,
                lockMovementY: false,
                hoverCursor: "default",
                strokeDashArray: [5, 5],
                selectable: false,
            });

            $scope.lineArray.push($scope.drawLine);
            $scope.canvas.add($scope.drawLine);
            $scope.isLoadDataLocal = false;
            emitEvent();
        } else if ($scope.lineType == "simple") {
            $scope.drawLine = new fabric.LineWithArrow(points, {
                strokeWidth: 1,
                stroke: "#000",
            })

            $scope.canvas.add(drawLine);
            // Tạo mũi tên tại điểm cuối cùng của đường thẳng
            // var arrowHead = new fabric.Triangle({
            //     left: points[2],
            //     top: points[3],
            //     width: 10,
            //     height: 10,
            //     fill: '#000',
            //     angle: 90
            // });

            // $scope.lineArray.push(arrowHead);
            // $scope.canvas.add(arrowHead);
            // $scope.pointArray.push(arrowHead);

            // const length = $scope.pointArray.length;
            // if (length > 1) {
            //     const line = new fabric.Line(
            //         [
            //             $scope.pointArray[length - 2].left,
            //             $scope.pointArray[length - 2].top,
            //             $scope.pointArray[length - 1].left,
            //             $scope.pointArray[length - 1].top,
            //         ],
            //         {
            //             strokeWidth: 2,
            //             fill: "black",
            //             stroke: "black",
            //             originX: "center",
            //             originY: "center",
            //             selectable: false,
            //         }
            //     );

            //     $scope.pointArray[length - 2].line2 = line;
            //     $scope.pointArray[length - 1].line1 = line;

            //     $scope.lineArray.unshift(line);
            //     $scope.canvas.add(line);
            //     $scope.canvas.sendToBack(line);
            // }

        } else if ($scope.lineType == "waving") {
            ++$scope.typesOfLinesIter;
            $scope.typesOfLinesIter %= $scope.typesOfLines.length;

            $scope.drawLine = new fabric.WavyLineWithArrow(points, {
                strokeWidth: 1,
                stroke: "#000",
                funct: $scope.typesOfLines[$scope.typesOfLinesIter],
            });

            $scope.canvas.add($scope.drawLine);
        } else if (
            $scope.lineType == "dot" &&
            (!options.target ||
                (options.target && options.target.name != "dot-line"))
        ) {
            var point = new fabric.Circle({
                left: pointer.x,
                top: pointer.y,
                radius: 8,
                fill: "green",
                originX: "center",
                originY: "center",
                hasControls: false,
                name: "dot-line",
            });

            $scope.lineArray.push(point);
            $scope.canvas.add(point);
            $scope.pointArray.push(point);

            const length = $scope.pointArray.length;
            if (length > 1) {
                const line = new fabric.Line(
                    [
                        $scope.pointArray[length - 2].left,
                        $scope.pointArray[length - 2].top,
                        $scope.pointArray[length - 1].left,
                        $scope.pointArray[length - 1].top,
                    ],
                    {
                        strokeWidth: 2,
                        fill: "black",
                        stroke: "black",
                        originX: "center",
                        originY: "center",
                        selectable: false,
                    }
                );

                $scope.pointArray[length - 2].line2 = line;
                $scope.pointArray[length - 1].line1 = line;

                $scope.lineArray.unshift(line);
                $scope.canvas.add(line);
                $scope.canvas.sendToBack(line);
            }

            point.on("moving", function () {
                if (point.line1) {
                    point.line1.set({
                        x2: point.left,
                        y2: point.top,
                    });
                }
                if (point.line2) {
                    point.line2.set({
                        x1: point.left,
                        y1: point.top,
                    });
                }
            });
        } else if ($scope.lineType == "curve") {
            $scope.nextPointStart = pointer;
            $scope.isCurving = true;
        }
        $scope.canvas.requestRenderAll();
    }

    function onDrawLineDblClick() {
        if ($scope.drawingLineTimeId) {
            clearTimeout($scope.drawingLineTimeId);
            $scope.drawingLineTimeId = null;
        }

        if ($scope.drawLineTimeId) {
            clearTimeout($scope.drawLineTimeId);
            $scope.drawLineTimeId = null;
        }

        if (
            $scope.lineType == "multiple" ||
            $scope.lineType == "dash" ||
            $scope.lineType == "curve" ||
            $scope.lineType == "dot"
        ) {
            if ($scope.drawLine) {
                $scope.drawLine.setCoords();
            }
            $scope.isDown = false;
            $scope.isDrawingLine = false;
            $scope.drawLine = null;
            if ($scope.lineArray.length > 0) {
                $scope.lineArray.forEach((line) => $scope.canvas.remove(line));

                let lines;
                if ($scope.lineType == "curve") {
                    lines = new fabric.Path("M 0 0", {
                        fill: null,
                        selectable: true,
                        stroke: "#000",
                        strokeWidth: 1,
                    });

                    const path = [];

                    $scope.lineArray.forEach((line, index) => {
                        if (index == 0) path.push(line.path[0]);

                        path.push(line.path[1]);

                        // if(index == lineArray.length - 1) lines.path.push([ 'L', line.path[ 1 ][ 3 ], line.path[ 1 ][ 4 ] ]);
                    });

                    lines._setPath(path);
                } else {
                    var stringLine = $scope.lineType;
                    lines = new fabric.Group($scope.lineArray, {
                        objectID: randomID(),
                        name: "line-style",
                        stringLine,
                    });
                }
                if ($scope.lineType == "dash") lines.lineStyle = "dash";

                setDefaultAttributes(lines);
                startActiveObject(lines);
                $scope.canvas.add(lines);
                $scope.isLoadDataLocal = false;
                emitEvent();

                $scope.lineArray = [];
            }

            if ($scope.pointArray.length > 0) {
                $scope.pointArray = [];
            }
            $scope.canvas.requestRenderAll();

            $("#lines").click();
        }
    }

    function onDrawLineMouseMove(o) {
        if ($scope.drawLineTimeId) {
            clearTimeout($scope.drawLineTimeId);
            $scope.drawLineTimeId = null;
        }

        if (!$scope.isDown) {
            return;
        }
        var pointer = $scope.canvas.getPointer(o.e);
        if ($scope.drawLine && $scope.lineType == "curve") {
            if ($scope.isCurving) {
                $scope.drawLine.path[1][1] = pointer.x;
                $scope.drawLine.path[1][2] = pointer.y;
            } else {
                $scope.drawLine.path[1][3] = pointer.x;
                $scope.drawLine.path[1][4] = pointer.y;
            }
        } else if ($scope.lineType == "dot" && o.target) {
            // if (o.target.name == 'dot-line') {
            //     const obj = o.target;
            //     obj.line1.set({
            //         x2: obj.
            //         y2:
            //     })
            // }
        } else if (
            // lineType == 'multiple' || lineType == 'waving' || lineType == 'dash' &&
            $scope.drawLine
        ) {
            $scope.drawLine.set({
                x2: pointer.x,
                y2: pointer.y,
            });
        }
        $scope.canvas.requestRenderAll();
    } //end mouse:move


    $(".draw-line").on("click", function (e) {
        if ($(".draw-line.active").length > 0 && !$scope.isDrawLine) {
            $scope.isDrawLine = true;

            addDrawLineListener();
            setSelectDrawLine(false);

            hidePopupMenu();
        } else if ($(".draw-line.active").length == 0 && $scope.isDrawLine) {
            $scope.isDrawLine = false;

            removeDrawLineListener();
            setSelectDrawLine(true);

            if (
                ($scope.lineType == "multiple" ||
                    $scope.lineType == "dash" ||
                    $scope.lineType == "curve") &&
                $scope.drawLine
            ) {
                var canvas_objects = $scope.canvas._objects;
                var sel = $scope.canvas_objects[canvas_objects.length - 1]; //Get last object
                $scope.canvas.remove(sel);
            }
        }
        // console.log(canvas);
    });

    $("#simple-line").on("click", function () {
        if ($(this).hasClass("active")) {
            $scope.lineType = "";
            $(this).removeClass("active");
        } else {
            $(".draw-line.active").removeClass("active");
            $(this).addClass("active");
            $scope.lineType = "simple";
        }
    });

    $("#waving-line").on("click", function () {
        if ($(this).hasClass("active")) {
            $scope.lineType = "";
            $(this).removeClass("active");
        } else {
            $(".draw-line.active").removeClass("active");
            $(this).addClass("active");
            $scope.lineType = "waving";
        }
    });

    $("#multiple-line").on("click", function () {
        if ($(this).hasClass("active")) {
            $scope.lineType = "";
            $(this).removeClass("active");
        } else {
            $(".draw-line.active").removeClass("active");
            $(this).addClass("active");
            $scope.lineType = "multiple";
        }
    });

    $("#dash-line").on("click", function () {
        if ($(this).hasClass("active")) {
            $scope.lineType = "";
            $(this).removeClass("active");
        } else {
            $(".draw-line.active").removeClass("active");
            $(this).addClass("active");
            $scope.lineType = "dash";
        }
    });

    $("#curve-line").on("click", function () {
        if ($(this).hasClass("active")) {
            $scope.lineType = "";
            $(this).removeClass("active");
        } else {
            $(".draw-line.active").removeClass("active");
            $(this).addClass("active");
            $scope.lineType = "curve";
        }
    });

    $("#dot-line").on("click", function () {
        if ($(this).hasClass("active")) {
            $scope.lineType = "";
            $(this).removeClass("active");

            if ($scope.lineArray.length > 0) {
                $scope.lineArray.forEach((line) => $scope.canvas.remove(line));

                const lines = new fabric.Group($scope.lineArray, {
                    objectID: randomID(),
                    name: "line-style",
                });

                setDefaultAttributes(lines);
                startActiveObject(lines);
                $scope.canvas.add(lines);
                $scope.isLoadDataLocal = false;
                emitEvent();

                $scope.lineArray = [];
            }

            if ($scope.pointArray.length > 0) {
                $scope.pointArray = [];
            }
            $scope.canvas.requestRenderAll();
        } else {
            $(".draw-line.active").removeClass("active");
            $(this).addClass("active");
            $scope.lineType = "dot";
        }
    });

    $(".draw-line").on("click", function (e) {
        if ($(".draw-line.active").length > 0 && !$scope.isDrawLine) {
            $scope.isDrawLine = true;

            addDrawLineListener()
            setSelectDrawLine(false)

            hidePopupMenu();
        } else if ($(".draw-line.active").length == 0 && $scope.isDrawLine) {
            $scope.isDrawLine = false

            removeDrawLineListener()
            setSelectDrawLine(true)

            if (
                ($scope.lineType == "multiple" ||
                    $scope.lineType == "dash" ||
                    $scope.lineType == "curve") &&
                $scope.drawLine
            ) {
                var canvas_objects = $scope.canvas._objects;
                var sel = canvas_objects[canvas_objects.length - 1]; //Get last object
                $scope.canvas.remove(sel);
            }
        }
        // console.log(canvas);
    })

    $("#lines").on("click", function () {
        if (!$("#lines").hasClass("active")) {
            if ($(".draw-line.active").length > 0)
                $(".draw-line.active")[0].click();
        }
    })


    $scope.isGroup = false;
    function handleGroup() {
        if (!$scope.canvas.getActiveObject()) {
            return;
        }
        if ($scope.canvas.getActiveObject().type !== "activeSelection") {
            return;
        }
        const group = $scope.canvas.getActiveObject().toGroup();
        const objID = randomID();
        group.set({
            subTargetCheck: false,
            name: "custom-group",
            objectID: objID,
        });

        group._objects.forEach((o) => {
            o.groupID = objID;
            $scope.pool_data = $scope.pool_data.filter((item) => item.objectID !== o.objectID);
        });
        let data = {
            w: w,
            h: h,
            drawing: $scope.drawing,
            color: getColor(),
            id: $scope.id,
            userID: $scope.userID,
            objectID: objID,
            username: $scope.username,
            spessremo: getPencil(),
            room: $scope.stanza,
            layer: $scope.canvas.id,
            data: group.toObject(customAttributes),
        };
        $scope.pool_data.push(data);
        console.log("emit group", $scope.pool_data);

        // for (let index = 0; index < listObject.length; index++) {
        //     const element = listObject[index];
        //     if (element.__eventListeners) {
        //         element.__eventListeners["mousedblclick"] = [];
        //     }
        //     if (element.type != 'textbox') {
        //         element.on('mousedblclick', handleDbclickChild);
        //     }
        //     else {
        //         element.on('mouseup', function (e) {
        //             if (e.button === 1) {
        //                 console.log("left click");
        //             }
        //             // if(e.button === 2) {
        //             //     console.log("middle click");
        //             // }
        //              if (e.button === 3) {
        //                 handleTextboxRightclick(this);
        //             }
        //         });
        //     }
        // }
        // startActiveObject(group);
        $scope.canvas.requestRenderAll();
        $("#moveObject")[0].click();

    }

    // group active objects
    $("#icon-group").click(function () {
        if ($scope.isGroup) {
            handleGroup()
        }
        $scope.isGroup = !$scope.isGroup;
    });

    // ungroup selected group
    $("#icon-ungroup").click(function () {
        if (!$scope.canvas.getActiveObject()) {
            return;
        }
        if ($scope.canvas.getActiveObject().type !== "group") {
            return;
        }
        const group = $scope.canvas.getActiveObject();
        $scope.pool_data = $scope.pool_data.filter((o) => o.objectID !== group.objectID);
        group.forEachObject((i) => {
            group.removeWithUpdate(i);
            $scope.canvas.add(i);
            $scope.pool_data.push({
                w: w,
                h: h,
                drawing: $scope.drawing,
                color: getColor(),
                id: $scope.id,
                userID: $scope.userID,
                objectID: i.objectID,
                username: $scope.username,
                spessremo: getPencil(),
                room: $scope.stanza,
                layer: $scope.canvas.id,
                data: i.toObject(customAttributes),
            });
        });
        $scope.canvas.remove(group);

        $scope.canvas.requestRenderAll();
        $("#moveObject")[0].click();
    });

    $scope.isFreeDrawing = false;
    $scope.isArrowActive = false;
    $scope.isRectActive = false;
    $scope.isCircleActive = false;

    function setFreeDrawingMode(val) {
        $scope.isFreeDrawing = val;
        disableShapeMode();
    }

    function disableShapeMode() {
        $scope.canvas.isDrawingMode = $scope.isFreeDrawing;
        if ($scope.isFreeDrawing) {
            $("#drwToggleDrawMode").addClass("active");
        }
        $scope.canvas.selection = true;
        $scope.isArrowActive = $scope.isRectActive = $scope.isCircleActive = false;
        setCanvasSelectableStatus(true);
    }

    function setCanvasSelectableStatus(val) {
        $scope.canvas.forEachObject(function (obj) {
            obj.lockMovementX = !val;
            obj.lockMovementY = !val;
            obj.hasControls = val;
            obj.hasBorders = val;
            obj.selectable = val;
        });
        $scope.canvas.requestRenderAll();
    }

    $scope.drawing = false;
    $scope.isPencilInit = false;
    $scope.initPencil = function () {
        $scope.isPencilInit = true;
        //Toggle between drawing tools
        $("#drwToggleDrawMode").on("click", function () {
            $("#toolbox button").removeClass("active");
            if ($scope.canvas.isDrawingMode) {
                setFreeDrawingMode(false);
                $(this).removeClass("active");
                $scope.drawing = false;
            } else {
                setFreeDrawingMode(true);
                $(this).addClass("active");
                $scope.drawing = true;

                //set default drawing line
                if ($scope.canvas.freeDrawingBrush.getPatternSrc) {
                    $scope.canvas.freeDrawingBrush.source =
                        $scope.canvas.freeDrawingBrush.getPatternSrc.call($scope.canvas.freeDrawingBrush);
                }
                $scope.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                    blur: 0,
                    offsetX: 0,
                    offsetY: 0,
                    affectStroke: true,
                    color: "#ffffff",
                });
            }
        });
        fabric.Object.prototype.transparentCorners = false;

        //Create type pen (IMPORTANT)
        if (fabric.PatternBrush) {
            var vLinePatternBrush = new fabric.PatternBrush($scope.canvas);

            vLinePatternBrush.getPatternSrc = function () {
                var patternCanvas = fabric.document.createElement("canvas");
                patternCanvas.width = patternCanvas.height = 10;
                var ctx = patternCanvas.getContext("2d");

                ctx.strokeStyle = this.color;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(0, 5);
                ctx.lineTo(10, 5);
                ctx.closePath();
                ctx.stroke();

                return patternCanvas;
            };

            var hLinePatternBrush = new fabric.PatternBrush($scope.canvas);
            hLinePatternBrush.getPatternSrc = function () {
                var patternCanvas = fabric.document.createElement("canvas");
                patternCanvas.width = patternCanvas.height = 10;
                var ctx = patternCanvas.getContext("2d");

                ctx.strokeStyle = this.color;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(5, 0);
                ctx.lineTo(5, 10);
                ctx.closePath();
                ctx.stroke();

                return patternCanvas;
            };

            var squarePatternBrush = new fabric.PatternBrush($scope.canvas);
            squarePatternBrush.getPatternSrc = function () {
                var squareWidth = 10,
                    squareDistance = 2;

                var patternCanvas = fabric.document.createElement("canvas");
                patternCanvas.width = patternCanvas.height =
                    squareWidth + squareDistance;
                var ctx = patternCanvas.getContext("2d");

                ctx.fillStyle = this.color;
                ctx.fillRect(0, 0, squareWidth, squareWidth);

                return patternCanvas;
            };

            var diamondPatternBrush = new fabric.PatternBrush($scope.canvas);
            diamondPatternBrush.getPatternSrc = function () {
                var squareWidth = 10,
                    squareDistance = 5;
                var patternCanvas = fabric.document.createElement("canvas");
                var rect = new fabric.Rect({
                    width: squareWidth,
                    height: squareWidth,
                    angle: 45,
                    fill: this.color,
                });

                var canvasWidth = rect.getBoundingRect().width;

                patternCanvas.width = patternCanvas.height =
                    canvasWidth + squareDistance;
                rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

                var ctx = patternCanvas.getContext("2d");
                rect.render(ctx);

                return patternCanvas;
            };
        }

        let drawingLineWidthEl = $("#drawing-line-width"); //Select width of drawing line
        let drawingColorEl = $("#drawing-color"); //Select color of drawing line

        //Catch type pen
        $(".drawing-mode-selector").on("click", function () {
            $(".drawing-mode-selector").removeClass("active");
            $(this).addClass("active");
            let val = $(this).attr("data-pencil");

            let oldWidth = $scope.canvas.freeDrawingBrush.width;
            let oldColor = $scope.canvas.freeDrawingBrush.color;
            if (val === "Hline") {
                $scope.canvas.freeDrawingBrush = vLinePatternBrush;
            } else if (val === "Vline") {
                $scope.canvas.freeDrawingBrush = hLinePatternBrush;
            } else if (val === "Square") {
                $scope.canvas.freeDrawingBrush = squarePatternBrush;
            } else if (val === "Diamond") {
                $scope.canvas.freeDrawingBrush = diamondPatternBrush;
            } else {
                $scope.canvas.freeDrawingBrush = new fabric[val + "Brush"]($scope.canvas);
            }

            if ($scope.canvas.freeDrawingBrush) {
                console.log(oldColor);
                console.log(oldWidth);
                $scope.canvas.freeDrawingBrush.color = oldColor;
                $scope.canvas.freeDrawingBrush.width = oldWidth;
                if ($scope.canvas.freeDrawingBrush.getPatternSrc) {
                    $scope.canvas.freeDrawingBrush.source =
                        $scope.canvas.freeDrawingBrush.getPatternSrc.call($scope.canvas.freeDrawingBrush);
                }
                $scope.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                    blur: 0,
                    offsetX: 0,
                    offsetY: 0,
                    affectStroke: true,
                    color: "#ffffff",
                });
            }
        });

        //Catch wdith pen
        drawingLineWidthEl.on("change", function () {
            $scope.canvas.freeDrawingBrush.width = parseInt(this.value);
            let percent = ((this.value / 60) * 100).toFixed(2);
            $("#drawing-line-width-label").text(percent + "%");
        });

        //Catch color pen
        drawingColorEl.on("change", function () {
            $scope.canvas.freeDrawingBrush.color = this.value;

            if ($scope.canvas.freeDrawingBrush.getPatternSrc) {
                $scope.canvas.freeDrawingBrush.source =
                    $scope.canvas.freeDrawingBrush.getPatternSrc.call($scope.canvas.freeDrawingBrush);
            }
        });

        $("#moveObject").on("click", function () {
            $("#toolbox button").removeClass("active");
            $('#normal-addimage').removeClass("active");
            updateInputStyleImage($('#normal-addimage').hasClass("active"))
            $('#upload-file').removeClass("active");
            updateInputStyleFile($('#upload-file').hasClass("active"))
            if ($scope.canvas.isDrawingMode) {
                setFreeDrawingMode(false);
                $(this).removeClass("active");
                $scope.drawing = false;
            }
            $(this).addClass("active");
        });
    }
    //if (!$scope.isPencilInit) {
    //    $scope.initPencil();
    //}

    //function voice
    var snap = 20; //Pixels to snap
    let activeObject = null; // get obj was dblclick for config

    // device variables
    let isRecordAudio = false;
    let isRecordVideo = false;
    $scope.audioStream;
    let videoStream;
    let audioRecorder = null;
    let cameraRecorder = null;
    let audioRecorded = $("#micRecorded")[0];
    let cameraRecorded = $("#cameraRecorded")[0];
    let cameraRecording = $("#cameraRecording")[0];
    let screenshotImg = $("#screenshot-img")[0];
    let takephotoImg = $("#takephoto-img")[0];
    let activeDeviceObject = null;

    function createTextBoxFooter(obj, size) {
        var textbox = new fabric.Textbox("Text", {
            fontSize: 12,
            fontFamily: "Time New Roman",
            originX: "center",
            originY: "top",
            left: size / 2,
            top: size + 10,
            fill: "#333",
            textAlign: "center",
        });

        let group = new fabric.Group([obj, textbox], {
            top: 100,
            left: 100,
            name: obj.type,
            subTargetCheck: false,
        });

        setDefaultAttributes(group);
        // startActiveObject(group);

        return group;
    }

    // obj moving on path animation
    function moveToPoint(object, path, index, pos, reverse) {
        if (object.isMoving) {
            if (0 <= index && index < path.length) {
                object.animate(
                    "left",
                    path[index][pos] - (object.width / 2) * object.scaleX,
                    {
                        duration: 100 / object.speedMoving,
                        onChange: $scope.canvas.renderAll.bind(canvas),
                    }
                );

                object.animate(
                    "top",
                    path[index][pos + 1] - (object.height / 2) * object.scaleY,
                    {
                        duration: 100 / object.speedMoving,
                        onChange: $scope.canvas.renderAll.bind(canvas),
                        onComplete: function () {
                            if (reverse) {
                                if (path[index].length == 5 && pos == 3)
                                    moveToPoint(object, path, index, 1, reverse);
                                else if (index > 0 && path[index - 1].length == 5 && pos == 1)
                                    moveToPoint(object, path, --index, 3, reverse);
                                else moveToPoint(object, path, --index, 1, reverse);
                            } else {
                                if (path[index].length == 5 && pos == 1)
                                    moveToPoint(object, path, index, 3, reverse);
                                else moveToPoint(object, path, ++index, 1, reverse);
                            }
                        },
                    }
                );
            } else if (object.isRepeat) {
                if (index >= path.length)
                    moveToPoint(object, path, path.length - 1, 1, !reverse);
                else moveToPoint(object, path, 0, 1, !reverse);
            } else {
                $("#pathMovingMark").css({ left: "1px", background: "#aaa" });
                $scope.activeObject.isMoving = false;
            }
        }
    }

    function startPathAnimation(object) {
        moveToPoint(object, object.pathObj.path, 0, 1, false);
    }

    // Add new record to list
    var listMedia = [];
    function addNewRecord(name, id) {
        let player;
        switch (name) {
            case "mic":
                player = audioRecorded;
                break;
            case "camera":
                player = cameraRecorded;
                break;
            case "takephoto":
                player = takephotoImg;
                break;
            default:
                break;
        }

        const li = document.createElement("li");
        const playButton = document.createElement("button");
        const deleteButton = document.createElement("button");
        const div = document.createElement("div");
        const src = activeDeviceObject.src.find((value) => value.id == id);

        if (!src) return;
        li.innerHTML = `
                <p>${src.name}</p>
            `;
        li.classList.add("device-item");

        if (name == "takephoto") {
            playButton.innerHTML =
                '<i class="fa fa-picture-o" aria-hidden="true"></i>';
        } else {
            playButton.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
        }
        playButton.classList.add("btn", "btn-primary");
        playButton.value = id;

        playButton.onclick = async function () {
            //     var requestOptions = {
            //         method: 'GET'
            //     };
            //     var response = await fetch(src.url, requestOptions);
            //     console.log(response);
            if (name != "takephoto") {
                try {
                    player.src = src.url;
                    player.load();
                    player.play();
                } catch (e) {
                    // player.src = URL.createObjectURL(src.blob);
                    console.log(e);
                    alert(`Get data failed: ${e}`);
                }
            } else {
                player.src = src.url;
            }
        };

        deleteButton.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
        deleteButton.classList.add("btn", "btn-danger");

        deleteButton.onclick = function () {
            li.remove();
            activeDeviceObject.src = activeDeviceObject.src.filter(
                (item) => item.id != id
            );
            listMedia = listMedia.filter((item) => item.id !== id);
            if (activeDeviceObject.src.length == 0) {
                player.src = "";
                if (name == "takephoto") {
                    player.style.display = "none";
                }
            } else if (player.src == src.url) {
                // name == 'takephoto' ?
                player.src = activeDeviceObject.src[0].url;
                // : player.src = activeDeviceObject.src[0].blob
            }
            // removeTempFile(src.url)
        };

        div.appendChild(playButton);
        div.appendChild(deleteButton);
        li.appendChild(div);

        $(`.${name}-popup-class .list`)[0].appendChild(li);
    }

    async function uploadTempFile(url) {
        var requestOptions = {
            method: "POST",
            redirect: "follow",
        };

        var res = await fetch(
            `https://admin.metalearn.vn/MobileLogin/CreateTempFileFromUrl?url=${url}`,
            requestOptions
        );
        var rs = await res.json(); // de y bat dong bo
        return rs.Object;
        // var rs = json.json();
        // return rs.Object;
    }

    function showMediaMenu(svg, name) {
        $(`.${name}-popup-class .list`)[0].innerHTML = "";
        svg.src.forEach((item) => addNewRecord(name, item.id));

        const zoom = $scope.canvas.getZoom();
        const left =
            (svg.left + (svg.width / 2) * svg.scaleX) * zoom +
            $scope.canvas.viewportTransform[4] +
            80;
        let top = svg.top * zoom + $scope.canvas.viewportTransform[5] + 60;
        if (name == "takephoto") top += 60;

        if (svg.src.length > 0) {
            if (name == "mic") {
                audioRecorded.src = svg.src[svg.src.length - 1].blob;
                audioRecorded.load();
            } else if (name == "camera") {
                cameraRecorded.src = svg.src[svg.src.length - 1].blob;
                cameraRecorded.load();
            } else if (name == "takephoto") {
                takephotoImg.src = svg.src[svg.src.length - 1].url;
            }
        } else {
            if (name == "mic") {
                audioRecorded.src = "";
            } else if (name == "camera") {
                cameraRecorded.src = "";
            } else if (name == "takephoto") {
                takephotoImg.style.display = "none";
            }
        }

        $(`.${name}-popup-class`).css({ top: top + "px", left: left + "px" });
        $(`.${name}-popup-class`).removeClass("hidden");

        if (name != "takephoto") {
            $(`#objBlink-${name}`)[0].innerText = svg.blink ? "ON" : "OFF";
            //$(`#textColor-${name}`)[0].value = svg.colorText;
            //$(`#borderColor-${name}`)[0].value = svg.colorBorder;
        }
        // $(`#lineStyle-${name}`)[0].value = svg.lineStyle;

        // $(`#borderWidth-${name}`)[0].value = svg.widthBorder;
        // $(`#objCurve-${name}`)[0].value = svg.curve;
        // $(`#objAngle-${name}`)[0].value = svg.angle;

        if (svg.pathObj) {
            const value = svg.pathObj.path
                .map((point) => `[${parseInt(point[2])}, ${parseInt(point[1])}]`)
                .join(" ");
            $(`#pathObj-${name}`).val(value);
        } else $(`#pathObj-${name}`).val("Empty");

        if (svg.isMoving) {
            $(`#pathMovingMark-${name}`).css({ left: "33px", background: "#ff0000" });
        } else {
            $(`#pathMovingMark-${name}`).css({ left: "1px", background: "#aaa" });
        }

        // $(`#pathMovingRepeat-${name}`)[0].checked = svg.isRepeat;
        // $(`#pathMovingSpeed-${name}`)[0].value = svg.speedMoving;

        if (svg.lineType == "waving") {
            top =
                Math.cos(svg.angle) * svg.top * zoom + $scope.canvas.viewportTransform[5] - 60;
            left =
                Math.cos(svg.angle) * (svg.left + (svg.width / 2) * svg.scaleX) * zoom +
                $scope.canvas.viewportTransform[4] -
                180;
        }
    }

    function startActiveMedia(svg) {
        const name = svg.nameDevice;

        svg.on("moving", function () {
            $(`.${name}-popup-class`).addClass("hidden");
        });

        svg.startMoving = function () {
            startPathAnimation(svg);
        };

        // start object animation if isMoving
        if (svg.isMoving) svg.startMoving();
        if (svg.blink) blink(svg);

        changeCoordinateConnectLine(svg);

        svg.on("mousedblclick", function () {
            var check = $(`.${name}-popup-class`).hasClass("hidden");
            activeDeviceObject = this;
            activeObject = this;
            if (check) {
                // re render list
                showMediaMenu(svg, name);
            } else {
                $(`.${name}-popup-class`).addClass("hidden");
            }
        });

        svg.on("mousedown", function (e) {
            activeDeviceObject = this;
            activeObject = this;

            touchPopupMenu(e.pointer, () => showMediaMenu(svg, name));
        });
    }

    // load svg for user device using
    function loadSVG(name, svg, player) {
        fabric.loadSVGFromURL(svg, function (objects, options) {
            const svg = fabric.util.groupSVGElements(objects, options);
            const maxWidth = 50;
            const maxHeight = 50;

            // resize svg if size is too large
            if (svg.width > maxWidth) {
                svg.scaleToWidth(maxWidth);
            }
            if (svg.height > maxHeight) {
                svg.scaleToHeight(maxHeight);
            }
            var size = 50;
            var obj = createTextBoxFooter(svg, size);
            obj.set({
                top: 100,
                left: 100,
                objectID: randomID(),
                name: "media",
                nameDevice: name,
                player: player,
                src: [],
            });
            obj.on("mouseup", handleMouseUpSvg);
            console.log('mic:' + JSON.stringify(obj));
            startActiveMedia(obj);

            $scope.canvas.add(obj);
            $scope.isLoadDataLocal = false;
            emitEvent();
        });

        $("#moveObject")[0].click();
    }

    function createMediaID() {
        const today = new Date();
        return `${today.getSeconds()}_${today.getMinutes()}_${today.getHours()}-${today.getDay()}_${today.getMonth()}_${today.getFullYear()}`;
    }

    // add mic svg
    $("#icon-mic").click(function () {
        loadSVG("mic", "/images/notepad/notepad/microphone.svg");
    });

    // start / stop audio record
    $("#mic-record").click(function () {
        if (!isRecordAudio) {
            console.log("Start recording")
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                $scope.audioStream = stream;
                audioRecorder = new MediaRecorder(stream);

                const audioChunks = [];
                audioRecorder.addEventListener("dataavailable", (event) => {
                    audioChunks.pop();
                    audioChunks.push(event.data);
                });

                audioRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks, {
                        type: "audio/wav",
                    });
                    const id = createMediaID();
                    console.log("audio blob:", audioBlob);
                    pushAudio(audioBlob, id, "wav");
                });

                audioRecorder.start();
                activeDeviceObject.blink = true;

                blink(activeDeviceObject);
                this.classList.remove("btn-primary");
                this.classList.add("btn-warning");
                this.innerHTML = '<i class="fa fa-stop" aria-hidden="true"></i>';
            });
        } else {
            console.log("Stop recording")
            $scope.audioStream.getTracks().forEach((track) => {
                track.stop();
            });
            audioRecorder.stop();
            activeDeviceObject.blink = false;
            this.classList.remove("btn-warning");
            this.classList.add("btn-primary");
            this.innerHTML = '<i class="fa fa-microphone" aria-hidden="true"></i>';
        }

        isRecordAudio = !isRecordAudio;
    });
    $("#mic-upload").click(function () {
        $("#mic-file").click();
    });
    $("#mic-file").on("change", function (e) {
        var file = e.target.files[0];
        var type = file.name.split(".").slice(-1)[0];
        const id = createMediaID();
        pushAudio(file, id, type);
        App.toastrSuccess("File đang đƯợc tải lên vui lòng đợi!")
    });
    async function pushAudio(audioBlob, id, type) {
        var formdata = new FormData();
        formdata.append("fileUpload", audioBlob, `${id}.${type}`);
        formdata.append("CateRepoSettingId", "2255");
        formdata.append("CreatedBy", "admin");

        var requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow",
        };
        var response = await fetch(
            "https://admin.metalearn.vn/MobileLogin/InsertFile",
            requestOptions
        );
        var result = await response.json();
        if (!result.Error && result.Object) {
            console.log("Send record data success!", result);

            // const audioUrl = await uploadTempFile(result.Object.Url);
            const audioUrl = result.Object.Url;
            const file = {
                id: id,
                catFileId: result.ID,
                name: `${id}.${type}`,
                url: audioUrl,
                blob: audioBlob,
            };

            listMedia.push({
                id: id,
                name: `${id}.${type}`,
                blob: audioBlob,
                url: audioUrl,
            });

            audioRecorded.src = audioUrl;
            audioRecorded.load();

            // download
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = audioUrl;
            a.download = file.name;
            // a.click();
            // window.URL.revokeObjectURL(audioUrl);
            document.body.removeChild(a);

            // add new record
            activeDeviceObject.src.push(file);
            addNewRecord("mic", id);
        } else {
            alert(`Send data failed: ${result.Title}`);
        }
        // try {
        //     let reader = new FileReader();
        //     reader.addEventListener('load', async e => {

        //     });
        //     reader.readAsDataURL(audioBlob);

        // } catch(e) {
        //     console.log(e);
        //     alert(`File ${file.name} did not found in /file folder!`)
        // }
    }
    // close mic form
    $("#mic-close").click(function () {
        audioRecorded.pause();
        $(".mic-popup-class").addClass("hidden");
    });

    // add camera svg
    $("#icon-camera").click(function () {
        loadSVG("camera", "/images/notepad/notepad/camera.svg");
    });

    // start / stop video record
    $("#camera-record").click(function () {
        if (!isRecordVideo) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    cameraRecorded.style.display = "none";
                    cameraRecording.style.display = "inline-block";

                    videoStream = stream;
                    cameraRecording.srcObject = stream;
                    cameraRecording.play();
                    cameraRecorder = new MediaRecorder(stream);

                    const videoChunks = [];
                    cameraRecorder.addEventListener("dataavailable", (event) => {
                        videoChunks.pop();
                        videoChunks.push(event.data);
                    });

                    cameraRecorder.addEventListener("stop", () => {
                        const videoBlob = new Blob(videoChunks, {
                            type: "video/mp4",
                        });
                        const id = createMediaID();
                        pushVideo(videoBlob, id, "mp4");
                    });

                    cameraRecorder.start();
                    activeDeviceObject.blink = true;
                    $("#camera-mark").css({ display: "block" });

                    blink(activeDeviceObject);
                    this.classList.remove("btn-primary");
                    this.classList.add("btn-warning");
                    this.innerHTML = '<i class="fa fa-stop" aria-hidden="true"></i>';
                })
                .catch((error) => {
                    console.log(error);
                    activeDeviceObject.blink = false;
                    this.classList.remove("btn-warning");
                    this.classList.add("btn-primary");
                    this.innerHTML =
                        '<i class="fa fa-video-camera" aria-hidden="true"></i>';
                    isRecordVideo = false;
                });
        } else {
            $("#camera-mark").css({ display: "none" });

            videoStream.getTracks().forEach((track) => {
                track.stop();
            });
            cameraRecorder.stop();
            activeDeviceObject.blink = false;
            this.classList.remove("btn-warning");
            this.classList.add("btn-primary");
            this.innerHTML =
                '<i class="fa fa-video-camera" aria-hidden="true"></i>';
        }

        isRecordVideo = !isRecordVideo;
    });
    $("#camera-upload").click(function () {
        $("#camera-file").click();
    });
    $("#camera-file").on("change", function (e) {
        var file = e.target.files[0];
        var type = file.name.split(".").slice(-1)[0];
        const id = createMediaID();
        pushVideo(file, id, type);
        App.toastrSuccess("File đang đƯợc tải lên vui lòng đợi!")
    });
    async function pushVideo(videoBlob, id, type) {
        var formdata = new FormData();
        formdata.append("fileUpload", videoBlob, `${id}.${type}`);
        formdata.append("CateRepoSettingId", "2255");
        formdata.append("CreatedBy", "admin");

        var requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow",
        };
        var response = await fetch(
            "https://admin.metalearn.vn/MobileLogin/InsertFile",
            requestOptions
        );
        var result = await response.json();
        if (!result.Error && result.Object) {
            console.log("Send record data success!", result);

            const videoUrl = await uploadTempFile(result.Object.Url);
            console.log(videoUrl);
            const file = {
                id: id,
                catFileId: result.ID,
                name: `${id}.${type}`,
                url: "https://admin.metalearn.vn/" + videoUrl,
                blob: videoBlob,
            };

            listMedia.push({
                id: id,
                name: `${id}.${type}`,
                blob: videoBlob,
                url: "https://admin.metalearn.vn/" + videoUrl,
            });

            cameraRecorded.src = "https://admin.metalearn.vn/" + videoUrl;
            cameraRecorded.load();

            cameraRecording.pause();
            cameraRecorded.style.display = "inline-block";
            cameraRecording.style.display = "none";

            // download
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = "https://admin.metalearn.vn/" + videoUrl;
            a.download = file.name;
            // a.click();
            // window.URL.revokeObjectURL(audioUrl);
            document.body.removeChild(a);

            // add new record
            activeDeviceObject.src.push(file);
            addNewRecord("camera", id);
        } else {
            alert(`Send data failed: ${result.Title}`);
        }
        // let reader = new FileReader();
        // reader.addEventListener('load', async e => {
        // })
        // reader.readAsDataURL(videoBlob);
    }
    $("#camera-close").click(function () {
        cameraRecorded.pause();
        $(".camera-popup-class").addClass("hidden");
    });

    $("#menuMore-mic").on("click", function (e) {
        const subMenu = $("#sub-menu-mic")[0];
        if (subMenu.style.visibility === "hidden") {
            $("#sub-menu-mic").css({
                visibility: "visible",
                top: 50 + "px",
                left: 0 + "px",
            });
        } else {
            $("#sub-menu-mic").css({ visibility: "hidden" });
        }
    });

    $("#menuMore-camera").on("click", function (e) {
        const subMenu = $("#sub-menu-camera")[0];
        if (subMenu.style.visibility === "hidden") {
            $("#sub-menu-camera").css({
                visibility: "visible",
                top: 50 + "px",
                left: 0 + "px",
            });
        } else {
            $("#sub-menu-camera").css({ visibility: "hidden" });
        }
    });

    $("#menuMore-file").on("click", function (e) {
        const subMenu = $("#sub-menu-file")[0];
        if (subMenu.style.visibility === "hidden") {
            $("#sub-menu-file").css({
                visibility: "visible",
                top: 50 + "px",
                left: 0 + "px",
            });
        } else {
            $("#sub-menu-file").css({ visibility: "hidden" });
        }
    });

    $("#size-mic li").click(function () {
        let font_size = parseInt($(this).attr("value"));
        activeObject.item(1).set({
            fontSize: font_size,
        });

        document.getElementById("current-size-mic").innerHTML =
            font_size + ` <span class="caret">`;
        $scope.canvas.requestRenderAll();
    });

    $("#size-camera li").click(function () {
        let font_size = parseInt($(this).attr("value"));
        activeObject.item(1).set({
            fontSize: font_size,
        });

        document.getElementById("current-size-camera").innerHTML =
            font_size + ` <span class="caret">`;
        $scope.canvas.requestRenderAll();
    });

    $("#size-file li").click(function () {
        let font_size = parseInt($(this).attr("value"));
        activeObject.item(1).set({
            fontSize: font_size,
        });

        document.getElementById("current-size-file").innerHTML =
            font_size + ` <span class="caret">`;
        $scope.canvas.requestRenderAll();
    });

    $("#objBlink-mic").on("click", function () {
        activeObject.blink = !activeObject.blink;
        if (activeObject.blink) {
            this.innerText = "ON";
            blink(activeObject);
        } else {
            this.innerText = "OFF";
        }

    });

    $("#objBlink-camera").on("click", function () {
        activeObject.blink = !activeObject.blink;
        if (activeObject.blink) {
            this.innerText = "ON";
            blink(activeObject);
        } else {
            this.innerText = "OFF";
        }

    });

    $("#objBlink-file").on("click", function () {
        activeObject.blink = !activeObject.blink;
        if (activeObject.blink) {
            this.innerText = "ON";
            blink(activeObject);
        } else {
            this.innerText = "OFF";
        }

    });

    $scope.colorTextMic = '#000000';

    $("#textColor-mic").on("input", function () {
        activeObject.item(1).set({
            fill: this.value,
        });
        activeObject.colorText = this.value;
        $scope.canvas.requestRenderAll();
    });

    $scope.changeFontColorMic = function (value) {
        activeObject.item(1).set({
            fill: value,
        });
        activeObject.colorText = value;
        $scope.canvas.requestRenderAll();
    }

    $("#textColor-camera").on("input", function () {
        activeObject.item(1).set({
            fill: this.value,
        });
        activeObject.colorText = this.value;
        $scope.canvas.requestRenderAll();

    });

    $("#textColor-file").on("input", function () {
        activeObject.item(1).set({
            fill: this.value,
        });
        activeObject.colorText = this.value;
        $scope.canvas.requestRenderAll();

    });

    $("#borderColor-mic").on("input", function () {
        console.log(activeObject);
        activeObject.item(0).set({
            stroke: this.value,
        });
        activeObject.item(0)._objects.forEach((x) => {
            x.set({
                fill: this.value,
            });
        });
        activeObject.colorBorder = this.value;
        $scope.canvas.requestRenderAll();

    });

    $scope.borderColorMic = "#000000"

    $scope.changeBorderColorMic = function (value) {
        activeObject.item(0).set({
            stroke: value,
        })
        activeObject.item(0)._objects.forEach((x) => {
            x.set({
                fill: value,
            })
        })
        activeObject.colorBorder = value
        $scope.canvas.requestRenderAll()
    }

    $("#borderColor-camera").on("input", function () {
        activeObject.item(0).set({
            stroke: this.value,
        });
        activeObject.item(0)._objects.forEach((x) => {
            x.set({
                fill: this.value,
            });
        });
        activeObject.colorBorder = this.value;
        $scope.canvas.requestRenderAll();

    });

    $("#borderColor-file").on("input", function () {
        activeObject.item(0).set({
            stroke: this.value,
        });
        activeObject.item(0)._objects.forEach((x) => {
            x.set({
                fill: this.value,
            });
        });
        activeObject.colorBorder = this.value;
        $scope.canvas.requestRenderAll();

    });

    // popup path-menu
    $("#pathMover-mic").on("click", function () {
        const pathMenu = $("#path-menu-mic")[0];
        if (pathMenu.style.visibility === "hidden") {
            $("#path-menu-mic").css({
                visibility: "visible",
                top: 50 + "px",
                left: 0 + "px",
            });

            if (activeObject.isMoving) {
                $(`#pathMovingMark-mic`).css({ left: "33px", background: "#ff0000" });
            } else {
                $(`#pathMovingMark-mic`).css({ left: "1px", background: "#aaa" });
            }
        } else {
            $("#path-menu-mic").css({ visibility: "hidden" });
        }
    });
    $("#pathMover-camera").on("click", function () {
        const pathMenu = $("#path-menu-camera")[0];
        if (pathMenu.style.visibility === "hidden") {
            $("#path-menu-camera").css({
                visibility: "visible",
                top: 50 + "px",
                left: 0 + "px",
            });

            if (activeObject.isMoving) {
                $(`#pathMovingMark-camera`).css({
                    left: "33px",
                    background: "#ff0000",
                });
            } else {
                $(`#pathMovingMark-camera`).css({ left: "1px", background: "#aaa" });
            }
        } else {
            $("#path-menu-camera").css({ visibility: "hidden" });
        }
    });
    $("#pathMover-file").on("click", function () {
        const pathMenu = $("#path-menu-file")[0];
        if (pathMenu.style.visibility === "hidden") {
            $("#path-menu-file").css({
                visibility: "visible",
                top: 50 + "px",
                left: 0 + "px",
            });

            if (activeObject.isMoving) {
                $(`#pathMovingMark-file`).css({ left: "33px", background: "#ff0000" });
            } else {
                $(`#pathMovingMark-file`).css({ left: "1px", background: "#aaa" });
            }
        } else {
            $("#path-menu-file").css({ visibility: "hidden" });
        }
    });

    // start create path
    $("#pathCreate-mic").on("click", function () {
        hidePopupMenu();
        $("#pathBtns-mic").css({ visibility: "visible" });

        $("#pathToggleDrawing-mic").click();

        $(".pencil-class").addClass("hidden");
    });
    $("#pathCreate-camera").on("click", function () {
        hidePopupMenu();
        $("#pathBtns-camera").css({ visibility: "visible" });

        $("#pathToggleDrawing-camera").click();

        $(".pencil-class").addClass("hidden");
    });
    $("#pathCreate-file").on("click", function () {
        hidePopupMenu();
        $("#pathBtns-file").css({ visibility: "visible" });

        $("#pathToggleDrawing-file").click();

        $(".pencil-class").addClass("hidden");
    });

    // startIdx for check path created for path moving
    // after creating path, get the last path for obj moving
    var startIdxMic;
    $("#pathToggleDrawing-mic").on("click", function () {
        if (activeObject.isDrawingPath) {
            $("#drwToggleDrawMode").click();
            $(".tool-btn").removeClass("active");
            $(".pencil-class").addClass("hidden");

            activeObject.isDrawingPath = false;
            this.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';

            const pathObj = $scope.canvas._objects.splice(
                startIdxMic,
                $scope.canvas._objects.length - startIdxMic
            )[0];

            activeObject.pathObj = pathObj.item(0);

            $scope.canvas.renderAll();

            const value = activeObject.pathObj.path
                .map((point) => `[${parseInt(point[2])}, ${parseInt(point[1])}]`)
                .join(" ");
            $("#pathObj-mic").val(value);
        } else {
            $("#drwToggleDrawMode").click();
            $(".tool-btn").removeClass("active");
            $(".pencil-class").addClass("hidden");

            activeObject.isDrawingPath = true;
            this.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';

            startIdxMic = $scope.canvas._objects.length;

            $("#pathObj-mic").val("Empty");
        }
    });
    var startIdxCamera;
    $("#pathToggleDrawing-camera").on("click", function () {
        if (activeObject.isDrawingPath) {
            $("#drwToggleDrawMode").click();
            $(".tool-btn").removeClass("active");
            $(".pencil-class").addClass("hidden");

            activeObject.isDrawingPath = false;
            this.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';

            const pathObj = $scope.canvas._objects.splice(
                startIdxCamera,
                $scope.canvas._objects.length - startIdxCamera
            )[0];

            activeObject.pathObj = pathObj.item(0);

            $scope.canvas.renderAll();

            const value = activeObject.pathObj.path
                .map((point) => `[${parseInt(point[2])}, ${parseInt(point[1])}]`)
                .join(" ");
            $("#pathObj-camera").val(value);
        } else {
            $("#drwToggleDrawMode").click();
            $(".tool-btn").removeClass("active");
            $(".pencil-class").addClass("hidden");

            activeObject.isDrawingPath = true;
            this.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';

            startIdxCamera = $scope.canvas._objects.length;

            $("#pathObj-camera").val("Empty");
        }
    });
    var startIdxFile;
    $("#pathToggleDrawing-file").on("click", function () {
        if (activeObject.isDrawingPath) {
            $("#drwToggleDrawMode").click();
            $(".tool-btn").removeClass("active");
            $(".pencil-class").addClass("hidden");

            activeObject.isDrawingPath = false;
            this.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';

            const pathObj = $scope.canvas._objects.splice(
                startIdxFile,
                $scope.canvas._objects.length - startIdxFile
            )[0];

            activeObject.pathObj = pathObj.item(0);

            $scope.canvas.renderAll();

            const value = activeObject.pathObj.path
                .map((point) => `[${parseInt(point[2])}, ${parseInt(point[1])}]`)
                .join(" ");
            $("#pathObj-file").val(value);
        } else {
            $("#drwToggleDrawMode").click();
            $(".tool-btn").removeClass("active");
            $(".pencil-class").addClass("hidden");

            activeObject.isDrawingPath = true;
            this.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';

            startIdxFile = $scope.canvas._objects.length;

            $("#pathObj-file").val("Empty");
        }
    });

    $("#closePathDrawMode-camera").on("click", function () {
        activeObject.isDrawingPath = false;
        $("#pathBtns-camera").css({ visibility: "hidden" });

        // $('#edit-form').css({ 'visibility': 'visible' });
        $("#path-menu-camera").css({ visibility: "visible" });
    });
    $("#closePathDrawMode-mic").on("click", function () {
        activeObject.isDrawingPath = false;
        $("#pathBtns-mic").css({ visibility: "hidden" });

        // $('#edit-form').css({ 'visibility': 'visible' });
        $("#path-menu-mic").css({ visibility: "visible" });
    });
    $("#closePathDrawMode-file").on("click", function () {
        activeObject.isDrawingPath = false;
        $("#pathBtns-file").css({ visibility: "hidden" });

        // $('#edit-form').css({ 'visibility': 'visible' });
        $("#path-menu-file").css({ visibility: "visible" });
    });

    $("#pathMovingRepeat-mic").on("change", function () {
        activeObject.isRepeat = !activeObject.isRepeat;

    });
    $("#pathMovingRepeat-camera").on("change", function () {
        activeObject.isRepeat = !activeObject.isRepeat;

    });
    $("#pathMovingRepeat-file").on("change", function () {
        activeObject.isRepeat = !activeObject.isRepeat;
    });

    $("#pathMovingSpeed-mic").on("input", function () {
        activeObject.speedMoving = this.value;
    });
    $("#pathMovingSpeed-camera").on("input", function () {
        activeObject.speedMoving = this.value;

    });
    $("#pathMovingSpeed-file").on("input", function () {
        activeObject.speedMoving = this.value;

    });

    $("#pathMovingMode-mic").on("click", function () {
        if (activeObject.pathObj) {
            activeObject.isMoving = !activeObject.isMoving;
            if (activeObject.isMoving) {
                $("#pathMovingMark-mic").css({ left: "33px", background: "#ff0000" });
                hidePopupMenu();
                activeObject.startMoving();
            } else {
                $("#pathMovingMark-mic").css({ left: "1px", background: "#aaa" });
            }
        }
        socket.emit("pathMoving", {
            objectID: activeObject.objectID,
            moving: activeObject.isMoving,
        });
    });
    $("#pathMovingMode-camera").on("click", function () {
        if (activeObject.pathObj) {
            activeObject.isMoving = !activeObject.isMoving;
            if (activeObject.isMoving) {
                $("#pathMovingMark-camera").css({
                    left: "33px",
                    background: "#ff0000",
                });
                hidePopupMenu();
                activeObject.startMoving();
            } else {
                $("#pathMovingMark-camera").css({ left: "1px", background: "#aaa" });
            }
            socket.emit("pathMoving", {
                objectID: activeObject.objectID,
                moving: activeObject.isMoving,
            });
        }
    });
    $("#pathMovingMode-file").on("click", function () {
        if (activeObject.pathObj) {
            activeObject.isMoving = !activeObject.isMoving;
            if (activeObject.isMoving) {
                $("#pathMovingMark-file").css({ left: "33px", background: "#ff0000" });
                hidePopupMenu();
                activeObject.startMoving();
            } else {
                $("#pathMovingMark-file").css({ left: "1px", background: "#aaa" });
            }
            socket.emit("pathMoving", {
                objectID: activeObject.objectID,
                moving: activeObject.isMoving,
            });
        }
    });

    $("#path-menu-mic li").on("click", function (e) {
        e.stopPropagation();
    });

    $("#sub-menu-mic li").on("click", function (e) {
        e.stopPropagation();
    });
});

app.controller('indexOld', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
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
        var jsont = $scope.shapeData;


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

    var canvas2;

    $scope.hidejson = function () {
        $(".json_div").toggleClass('jsonhide');
    }

    var canvas = new draw2d.Canvas("gfx_holder_svg");

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

    $scope.init = function () {
        dataservice.getListWareHouse(function (rs) {
            rs = rs.data;
            $rootScope.listWareHouse = rs;
            if ($rootScope.listWareHouse.length > 0) {
                dataservice.getListFloorByWareHouseCode($rootScope.listWareHouse[0].Code, function (rs) {
                    rs = rs.data;
                    $scope.listFloor = rs;
                    if ($scope.listFloor.length > 0) {
                        $scope.chooseFloor($scope.listFloor[0]);
                    }
                });
            }
        });
        $rootScope.canvas2 = canvas;
        $rootScope.Rack = Rack;
        $rootScope.Cabinet = Cabinet;
        $rootScope.Line = Line;
        $rootScope.Reader = Reader;
    };

    $scope.init();

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
        canvas.setZoom(1.2, true);


        canvas.clear();
        var Rack = $rootScope.Rack;
        var Cabinet = $rootScope.Cabinet;
        var Line = $rootScope.Line;

        canvas.getCommandStack().addEventListener(function (e) {
            if (e.isPostChangeEvent()) {
                displayJSON(canvas);
            }
        });
        var json_data = [];
        dataservice.getListLineByFloorCode(item.Code, function (rs) {
            rs = rs.data;
            $scope.listLine = rs;
            dataservice.getListRackByFloorCode(item.Code, function (res) {
                //canvas.add(new draw2d.shape.basic.Image({ path: "/images/wareHouse/warehouse.svg", width: 2000, height: 1000, x: 135, y: 5, bgColor: "lime", stroke: 0.1, color: "#000" }));
                res = res.data;
                $scope.listRack = res;
                var x = 50;
                var y = 200;
                var checkrack = [];
                var checkline = [];

                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].ShapeData !== null && rs[i].ShapeData !== '' && rs[i].ShapeData !== undefined) {
                        var json1 = JSON.parse(rs[i].ShapeData);
                        json_data.push(json1[0]);
                        checkline.push(json1[0].id);
                        for (var j = 1; j < json1.length; j++) {
                            for (var k = 0; k < res.length; k++) {
                                if (json1[j].id == res[k].RackCode) {
                                    json1[j].labels[1].path = "/images/wareHouse/linght.svg";
                                    json1[j].labels[2].text = "Tên : " + res[k].RackName;
                                    json1[j].labels[3].text = "Size :" + res[k].R_Size;
                                    json1[j].labels[4].text = "Trạng thái :" + res[k].R_Status;
                                    json1[j].labels[5].text = "Số sản phẩm : " + res[k].ProductCount;
                                    json_data.push(json1[j]);
                                    checkrack.push(json1[j].id);
                                }
                            }
                        }
                    }
                }

                //for (var n = 0; n < res.length; n++) {
                //    if ((checkrack.indexOf(res[n].RackCode)) == -1) {
                //        var x = 50;
                //        var y = 200;
                //        var figure4 = new draw2d.shape.basic.Image({ path: "/images/wareHouse/linght.svg", width: 30, height: 12, x: 135, y: 5, bgColor: "lime", stroke: 0.1, color: "#000" });

                //        var figure1 = new draw2d.shape.basic.Rectangle({ width: 300, height: 40, x: 0, y: 100, bgColor: "#fff", stroke: 0.1, color: "#000" });
                //        figure1.addCssClass('value');
                //        var txt1 = new draw2d.shape.basic.Label({ text: "Tên :  " + res[n].RackName, height: 10, x: 0, y: 100, stroke: 0 });
                //        txt1.addCssClass("txt1");
                //        var txt2 = new draw2d.shape.basic.Label({ text: "Size : " + res[n].R_Size, height: 10, x: 150, y: 100, stroke: 0, color: "#fff" });
                //        txt2.addCssClass("txt2");
                //        var txt3 = new draw2d.shape.basic.Label({ text: "Tình trạng : " + res[n].R_Status, height: 10, x: 0, y: 120, stroke: 0 });

                //        txt3.addCssClass("txt3");

                //        var txt5 = new draw2d.shape.basic.Label({ text: "Số sản phẩm : " + res[n].ProductCount, height: 10, x: 150, y: 120, stroke: 0 });

                //        txt5.addCssClass("txt5");
                //        var rotate = new draw2d.shape.basic.Image({ path: "/images/wareHouse/rotate.png", width: 20, height: 20, y: 80, x: 303, visible: true });
                //        rotate.addCssClass('rotate');
                //        var rack_ngang = new Rack({ height: 100, width: 300, stroke: 1, x: 100, angle: 89, y: 100, visible: true });

                //        canvas.add(rack_ngang, x, y);
                //        rack_ngang.setId(res[n].RackCode);
                //        rack_ngang.setMinWidth(300);
                //        rack_ngang.setMinHeight(100);
                //        x = x + 350;
                //        if (x > 1100) {
                //            x = 50;
                //            y = y + 100;
                //        }
                //        rack_ngang.attr({
                //            path: "/images/wareHouse/rack_ngang.svg"
                //        });
                //        rack_ngang.add(figure1, new draw2d.layout.locator.Locator());
                //        rack_ngang.add(figure4, new draw2d.layout.locator.Locator());
                //        rack_ngang.add(txt1, new draw2d.layout.locator.Locator());
                //        rack_ngang.add(txt2, new draw2d.layout.locator.Locator());
                //        rack_ngang.add(txt3, new draw2d.layout.locator.Locator());
                //        rack_ngang.add(txt5, new draw2d.layout.locator.Locator());
                //        rack_ngang.add(txt5, new draw2d.layout.locator.Locator());
                //        rack_ngang.add(rotate, new draw2d.layout.locator.Locator());
                //    }
                //}

                for (var m = 0; m < rs.length; m++) {
                    if (checkline.indexOf(rs[m].LineCode) == -1) {
                        var x = 50;
                        var line2 = new Line({

                        });
                        line2.attr({
                            startX: 50,
                            startY: 250 + x,
                            endX: 1000,
                            endY: 250 + x,
                            stroke: 5,
                            color: "grey"
                        });
                        line2.setId(rs[m].LineCode);
                        x = x + 200;
                        canvas.add(line2);
                        var txt7 = new draw2d.shape.basic.Label({ text: "" + rs[m].L_Text, height: 10, x: 5, y: 5, stroke: 0 });
                        txt7.setWidth(150);

                        txt7.addCssClass("txt7");
                        line2.add(txt7, new draw2d.layout.locator.BottomLocator())
                    }
                }

                var reader = new Reader();
                reader.unmarshal(canvas, json_data);
                displayJSON(canvas);
                $scope.update();
            });
        });
        App.unblockUI("#contentMain");
    };

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
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/viewRackDetail.html',
            controller: 'view-rack-detail',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return rackCode;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

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

            dataservice.getListLineByFloorCode(FloorCode, function (rs) {
                rs = rs.data;
                $scope.listLine = rs;
                dataservice.getListRackByFloorCode(FloorCode, function (res) {
                    canvas.clear();
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
                canvas.clear();

                var json_data = [];

                dataservice.getListLineByFloorCode(FloorCode, function (rs) {
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
                                                $('#contentMain ').scrollTop(json1[j].y);
                                                $('#contentMain ').scrollLeft(json1[j].x);
                                                json1[j].labels[1].path = "/images/wareHouse/linghtgif.svg";
                                            }
                                            else {
                                                json1[j].labels[1].path = "/images/wareHouse/linght.svg";
                                            }
                                            json1[j].labels[2].text = "Tên : " + res[k].RackName;
                                            json1[j].labels[3].text = "Size :" + res[k].R_Size;
                                            json1[j].labels[4].text = "Trạng thái :" + res[k].R_Status;
                                            json1[j].labels[5].text = "Số sản phẩm :  " + res[k].ProductCount;
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
                if (rackCode !== undefined && rackCode != null && rackCode !== '') {
                    if (count < 1) {
                        canvas.setZoom(canvas.getZoom() * 0.8, true);
                    }

                    var node = $rootScope.canvas2.getFigure(rackCode);
                    if (node != null) {
                        $('#contentMain').scrollTop(node.y);
                        $('#contentMain').scrollLeft(node.x);
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
                    $('#contentMain').scrollTop(node2.y);
                    $('#contentMain').scrollLeft(node2.x);
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
            url: "/Admin/EDMSDiagramWarehouse/JTableProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
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
                setTimeout(function () {
                    window.dispatchEvent(new Event('resize'));
                }, 1000);
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('productcode').withTitle('{{"MLP_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productname').withTitle('{{"MLP_LIST_COL_PRODUCTNAME" | translate}}').renderWith(function (data, type, full) {
        var position = '<br/><span class="text-green">' + full.Position + '</span>';
        data += position;
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productgroup').withTitle('{{"MLP_LIST_COL_GROUP_PRODUCT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('producttype').withTitle('{{"MLP_LIST_COL_TYPE_PRODUCT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('unit').withTitle('{{"MLP_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('pathimg').withTitle('{{"MLP_LIST_COL_PATHIMG" | translate}}').renderWith(function (data, type) {
        return '<img class="img-circle img-responsive" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withTitle('{{"MLP_LIST_COL_NOTEE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sQrCode').withTitle('{{"MLP_LIST_COL_QRCODE" | translate}}').renderWith(function (data, type) {
        return '<qrcode role="button" ng-click="viewQrCode(\'' + data + '\')" data=' + data + ' size="60"></qrcode>';
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

app.controller('view-rack-detail-old', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, para) {
    var vm = $scope;
    $scope.isEdit = false;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.model = {
        Code: '',
        Name: '',
        FromTo: '',
        DateTo: '',
        Group: '',
        Type: '',
        Status: '',
        Catalogue: '',
        RackCode: ''
    };

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSDiagramWarehouse/JTableProduct",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.RackCode = para;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('productcode').withTitle('{{"MLP_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productname').withTitle('{{"MLP_LIST_COL_PRODUCTNAME" | translate}}').renderWith(function (data, type, full) {
        var position = '<br/><span class="text-green">' + full.Position + '</span>';
        data += position;
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productgroup').withTitle('{{"MLP_LIST_COL_GROUP_PRODUCT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('producttype').withTitle('{{"MLP_LIST_COL_TYPE_PRODUCT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('unit').withTitle('{{"MLP_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('pathimg').withTitle('{{"MLP_LIST_COL_PATHIMG" | translate}}').renderWith(function (data, type) {
        return '<img class="img-circle img-responsive" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withTitle('{{"MLP_LIST_COL_NOTEE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sQrCode').withTitle('{{"MLP_LIST_COL_QRCODE" | translate}}').renderWith(function (data, type) {
        return '<qrcode role="button" ng-click="viewQrCode(\'' + data + '\')" data=' + data + ' size="60"></qrcode>';
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

    $scope.init = function () {
        dataservice.generatorQRCode(para, function (rs) {
            rs = rs.data;
            $scope.QR_Code = rs;
        });

        dataservice.getRackDetail(para, function (rs) {
            rs = rs.data;
            $scope.rack = rs;
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

app.controller('view-rack-detail', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, para) {
    var vm = $scope;
    $scope.isEdit = false;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.QR_Code = '';
    $scope.checkProduct = false;
    $scope.model = para;
    $scope.rack = para.object;
    $scope.JsonAttr = JSON.parse($scope.rack.JsonAttr)
    $scope.data = {
        Weight: /*$scope.JsonAttr.Weight*/para?.Weight ?? 0,
        Size: para?.Size ?? 0,
        Quanity: para?.Quanity ?? 0,
        Group: para?.Group ?? '',
    };
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSDiagramWarehouse/JTableProductNew",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.MappingCode = $scope.rack.Mapping;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('productcode').withTitle('{{"MLP_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productname').withTitle('{{"MLP_LIST_COL_PRODUCTNAME" | translate}}').renderWith(function (data, type, full) {
        var position = '<br/><span class="text-green">' + full.Position + '</span>';
        data += position;
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productgroup').withTitle('{{"MLP_LIST_COL_GROUP_PRODUCT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('producttype').withTitle('{{"MLP_LIST_COL_TYPE_PRODUCT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('unit').withTitle('{{"MLP_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('pathimg').withTitle('{{"MLP_LIST_COL_PATHIMG" | translate}}').renderWith(function (data, type) {
        return '<img class="img-circle img-responsive" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withTitle('{{"MLP_LIST_COL_NOTEE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productqrcode').withTitle('{{"MLP_LIST_COL_QRCODE" | translate}}').renderWith(function (data, type) {
        return '<qrcode role="button" ng-click="viewQrCode(\'' + data + '\')" data=' + data + ' size="60"></qrcode>';
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

    $scope.updateObject = function () {
        console.log('data' + JSON.stringify($scope.data))
        var obj = {
            ObjectCode: $scope.rack.Mapping,
            Weight: $scope.data.Weight,
            Size: $scope.data.Size,
            Quanity: $scope.data.Quanity,
            Group: $scope.data.Group,
        }
        dataservice.UpdateATTR(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
    }

    $scope.attributes = [];
    $scope.init = function () {
        console.log($scope.rack);
        dataservice.generatorQRCode($scope.rack.Mapping, function (rs) {
            rs = rs.data;
            $scope.QR_Code = rs;
        });

        try {
            var attributes = JSON.parse($scope.rack.JsonAttr);
            console.log(attributes.length);
        } catch (e) {
            attributes = [];
            console.log(e);
        }
        $scope.attributes = attributes;
        //dataservice.getRackDetail(para, function (rs) {
        //    rs = rs.data;
        //    $scope.rack = rs;
        //});
    };

    $scope.init();

    $scope.toggleProducts = function() {
        $scope.checkProduct = !$scope.checkProduct;
        setTimeout(() => $scope.$apply());
    }

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

    $scope.viewQrCode = function (code) {

        dataservice.generatorQRCode(code, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderQrCode + '/qrViewerBase64.html',
                controller: function ($scope, $uibModalInstance) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                    $scope.data = rs;
                    setTimeout(function () {
                        setModalDraggable('.modal-dialog');
                    }, 200);
                },
                backdrop: 'static',
                size: '25',
            });
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
//Thêm, Sửa, Xóa Danh mục
app.controller('addCategory', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, para, dataservice) {
    $scope.model = {
        PAreaCode: para.Code,
        PAreaDescription: para.Name,
        PAreaParent: para.Parent,
        PAreaType: para.Type
    }
    $scope.title = para.Title;
    $scope.lockParent = para.LockParent;
    $scope.lockCode = para.Code != "" && para.Code != null && para.Code != undefined;
    $scope.listParent = [];

    $scope.init = function () {
        dataservice.getListAreaByParentCode(para.ParentType, "", function (rs) {
            rs = rs.data;
            $scope.listParent = rs;
            $scope.model.PAreaParent = para.Parent;
        });

        dataservice.getListATTRTYPE(function (result) {
            result = result.data;
            $scope.ListATTRTYPE = result.Object;
        });
        var position = "";
        var added = "";
        //position += $rootScope.wareHouseCode ? 'A_' + $rootScope.wareHouseCode : (para.Type == "AREA" ? 'A_' + $scope.model.PAreaCode : "");
        //if (para.Type != "AREA") {
        //    added = ` [${position}]`;
        //    position += $rootScope.floorCode ? '_F_' + $rootScope.floorCode : (para.Type == "FLOOR" ? '_F_' + $scope.model.PAreaCode : "");
        //}
        //if (para.Type != "AREA" && para.Type != "FLOOR") {
        //    added = ` [${position}]`;
        //    position += $rootScope.lineCode ? '_L_' + $rootScope.lineCode : (para.Type == "LINE" ? '_L_' + $scope.model.PAreaCode : "");
        //}
        //if (para.Type != "AREA" && para.Type != "FLOOR" && para.Type != "LINE") {
        //    added = ` [${position}]`;
        //    position += $rootScope.rackCode ? '_R_' + $rootScope.rackCode : (para.Type == "RACK" ? '_R_' + $scope.model.PAreaCode : "");
        //}
        //if (para.Type != "AREA" && para.Type != "FLOOR" && para.Type != "LINE" && para.Type != "RACK") {
        //    added = ` [${position}]`;
        //    position += $rootScope.positionCode ? '_P_' + $rootScope.positionCode : (para.Type == "POSITION" ? '_P_' + $scope.model.PAreaCode : "");
        //}
        //$scope.title += added;
        //$scope.QR_Code = position;
    }
    $scope.init();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    //Action khi chọn 1 combobox
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "PAreaParent" && $scope.model.PAreaParent != "") {
            $scope.errorPAreaParent = false;
        }
        if (SelectType == "PAreaCode" && $scope.model.PAreaCode != "") {
            var position = "";
            position += $rootScope.wareHouseCode ? 'A_' + $rootScope.wareHouseCode : (para.Type == "AREA" ? 'A_' + $scope.model.PAreaCode : "");
            if (para.Type != "AREA") {
                position += $rootScope.floorCode ? '_F_' + $rootScope.floorCode : (para.Type == "FLOOR" ? '_F_' + $scope.model.PAreaCode : "");
            }
            if (para.Type != "AREA" && para.Type != "FLOOR") {
                position += $rootScope.lineCode ? '_L_' + $rootScope.lineCode : (para.Type == "LINE" ? '_L_' + $scope.model.PAreaCode : "");
            }
            if (para.Type != "AREA" && para.Type != "FLOOR" && para.Type != "LINE") {
                position += $rootScope.rackCode ? '_R_' + $rootScope.rackCode : (para.Type == "RACK" ? '_R_' + $scope.model.PAreaCode : "");
            }
            if (para.Type != "AREA" && para.Type != "FLOOR" && para.Type != "LINE" && para.Type != "RACK") {
                position += $rootScope.positionCode ? '_P_' + $rootScope.positionCode : (para.Type == "POSITION" ? '_P_' + $scope.model.PAreaCode : "");
            }
            $scope.QR_Code = position;
        }
    }
    $scope.submit = function () {
        if ($scope.lockCode == false) {
            validationSelect($scope.model);
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                dataservice.insertCategory($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        //$uibModalInstance.close();
                        /*$uibModalInstance.dismiss('cancel');*/
                        $rootScope.reloadCategory(para.Type);
                        //$scope.saveMapping();
                    }
                });
            }
        }
        else {
            //$scope.saveMapping();
        }
    }
    $scope.modelMapping = {};

    $scope.saveMapping = function () {
        $scope.modelMapping = {
            ObjectCode: $scope.QR_Code,
            ObjectType: para.Type,
            CategoryCode: $scope.model.PAreaCode,
            Status: $scope.model.Status,
            SvgIconData: $scope.model.SvgIconData,
            Image: "",
            JsonAttr: JSON.stringify($scope.listNewAttr),
        };
        console.log("Kiem tra " + $scope.modelMapping);
        $scope.insertImage(function () {
            dataservice.insertMapping($scope.modelMapping, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    console.log("error");
                    App.toastrError(rs.Title);
                } else {
                    console.log("oke");
                    $uibModalInstance.dismiss('cancel');
                }
            });
        })
    }

    //Validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.PAreaType != "AREA" && (data.PAreaParent == undefined || data.PAreaParent == null || data.PAreaParent == '')) {
            $scope.errorPAreaParent = true;
            mess.Status = true;
        } else {
            $scope.errorPAreaParent = false;
        }

        return mess;
    };

    //Mapping
    $scope.insertImage = function (callback) {
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                callback();
            }
            else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
                    callback();
                } else {
                    var fileUpload = $("#file").get(0);
                    var reader = new FileReader();
                    reader.readAsDataURL(fileUpload.files[0]);
                    reader.onload = function (e) {
                        ////
                        //Initiate the JavaScript Image object.
                        var image = new Image();
                        //Set the Base64 string return from FileReader as source.
                        image.src = e.target.result;
                        image.onload = function () {
                            //Determine the Height and Width.
                            var height = this.height;
                            var width = this.width;
                            if (width > 5000 || height > 5000) {
                                App.toastrError(caption.MLP_MSG_IMG_SIZE_MAXIMUM);
                                callback();
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataservice.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        callback();
                                    }
                                    else {
                                        $scope.modelMapping.Image = '/uploads/images/' + rs.Object;
                                        ok = true;
                                        callback();
                                    }
                                })
                            }
                        };
                    }
                }
            }
        }
        else {
            callback();
        }
    }
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.listNewAttr = [];
    $scope.currentId = 0;

    $scope.addNewAttr = function () {
        var newAttr = {
            Id: $scope.currentId,
            AttrName: '',
            Value: '',
        };
        $scope.listNewAttr.push(newAttr);
        $scope.currentId = $scope.currentId + 1;
    }

    $scope.deleteNewAtt = function (id) {
        for (var i = 0; i < $scope.listNewAttr.length; i++) {
            if ($scope.listNewAttr[i].Id == id) {
                $scope.listNewAttr.splice(i, 1);
                break;
            }
        }
    }

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

app.controller('editCategory', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, para, dataservice) {
    $scope.model = {
        PAreaCode: '',
        PAreaDescription: '',
        PAreaParent: para.Parent,
        PAreaType: para.Type
    }
    $scope.title = para.Title;
    $scope.lockParent = para.LockParent;
    $scope.listParent = [];

    $scope.init = function () {
        // $scope.model = para;

        dataservice.getListATTRTYPE(function (result) {
            result = result.data;
            $scope.ListATTRTYPE = result.Object;
        });
        dataservice.getCategory(para.Id, function (result) {
            result = result.data;
            $scope.model = result.Object;
            // dataservice.generatorQRCode($scope.model.FloorCode, function (result) {
            //     result = result.data;
            //     $scope.QR_Code = result;
            // });
            var position = "";
            position += $rootScope.wareHouseCode ? 'A_' + $rootScope.wareHouseCode : (para.Type == "AREA" ? 'A_' + $scope.model.PAreaCode : "");
            if (para.Type != "AREA") {
                position += $rootScope.floorCode ? '_F_' + $rootScope.floorCode : (para.Type == "FLOOR" ? '_F_' + $scope.model.PAreaCode : "");
            }
            if (para.Type != "AREA" && para.Type != "FLOOR") {
                position += $rootScope.lineCode ? '_L_' + $rootScope.lineCode : (para.Type == "LINE" ? '_L_' + $scope.model.PAreaCode : "");
            }
            if (para.Type != "AREA" && para.Type != "FLOOR" && para.Type != "LINE") {
                position += $rootScope.rackCode ? '_R_' + $rootScope.rackCode : (para.Type == "RACK" ? '_R_' + $scope.model.PAreaCode : "");
            }
            if (para.Type != "AREA" && para.Type != "FLOOR" && para.Type != "LINE" && para.Type != "RACK") {
                position += $rootScope.positionCode ? '_P_' + $rootScope.positionCode : (para.Type == "POSITION" ? '_P_' + $scope.model.PAreaCode : "");
            }
            $scope.QR_Code = position;
            $scope.initMapping();
        });

        dataservice.getListAreaByParentCode(para.ParentType, "", function (rs) {
            rs = rs.data;
            $scope.listParent = rs;
            $scope.model.PAreaParent = para.Parent;
        });
    }
    $scope.initMapping = function () {
        dataservice.getMapping($scope.QR_Code, function (result) {
            result = result.data;
            if (result.Error == false) {
                $scope.model.Image = result.Object.Image;
                $scope.model.SvgIconData = result.Object.SvgIconData;
                try {
                    $scope.listNewAttr = JSON.parse(result.Object.JsonAttr);
                    console.log($scope.listNewAttr.length);
                } catch (e) {
                    console.log(e);
                }
            }
            else {
                App.toastrError(result.Title);
            }
        });
    }
    $scope.init();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "PAreaParent" && $scope.model.PAreaParent != "") {
            $scope.errorPAreaParent = false;
        }
        if (SelectType == "PAreaCode" && $scope.model.PAreaCode != "") {
            var position = "";
            position += $rootScope.wareHouseCode ? 'A_' + $rootScope.wareHouseCode : (para.Type == "AREA" ? 'A_' + $scope.model.PAreaCode : "");
            if (para.Type != "AREA") {
                position += $rootScope.floorCode ? '_F_' + $rootScope.floorCode : (para.Type == "FLOOR" ? '_F_' + $scope.model.PAreaCode : "");
            }
            if (para.Type != "AREA" && para.Type != "FLOOR") {
                position += $rootScope.lineCode ? '_L_' + $rootScope.lineCode : (para.Type == "LINE" ? '_L_' + $scope.model.PAreaCode : "");
            }
            if (para.Type != "AREA" && para.Type != "FLOOR" && para.Type != "LINE") {
                position += $rootScope.rackCode ? '_R_' + $rootScope.rackCode : (para.Type == "RACK" ? '_R_' + $scope.model.PAreaCode : "");
            }
            if (para.Type != "AREA" && para.Type != "FLOOR" && para.Type != "LINE" && para.Type != "RACK") {
                position += $rootScope.positionCode ? '_P_' + $rootScope.positionCode : (para.Type == "POSITION" ? '_P_' + $scope.model.PAreaCode : "");
            }
            $scope.QR_Code = position;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataservice.updateCategory($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    //$uibModalInstance.close();
                    /*$uibModalInstance.dismiss('cancel');*/
                    $rootScope.reloadCategory(para.Type);
                    //$scope.saveMapping();
                }
            });
        }
    };
    $scope.modelMapping = {};
    $scope.saveMapping = function () {
        $scope.modelMapping = {
            ObjectCode: $scope.QR_Code,
            ObjectType: para.Type,
            CategoryCode: $scope.model.PAreaCode,
            Status: $scope.model.Status,
            SvgIconData: $scope.model.SvgIconData,
            Image: "",
            JsonAttr: JSON.stringify($scope.listNewAttr),
        };
        $scope.insertImage(function () {
            dataservice.insertMapping($scope.modelMapping, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $uibModalInstance.dismiss('cancel');
                }
            });
        })
    }

    //Validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.PAreaType != "AREA" && (data.PAreaParent == undefined || data.PAreaParent == null || data.PAreaParent == '')) {
            $scope.errorPAreaParent = true;
            mess.Status = true;
        } else {
            $scope.errorPAreaParent = false;
        }

        return mess;
    };

    //Mapping
    $scope.insertImage = function (callback) {
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                callback();
            }
            else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
                    callback();
                } else {
                    var fileUpload = $("#file").get(0);
                    var reader = new FileReader();
                    reader.readAsDataURL(fileUpload.files[0]);
                    reader.onload = function (e) {
                        ////
                        //Initiate the JavaScript Image object.
                        var image = new Image();
                        //Set the Base64 string return from FileReader as source.
                        image.src = e.target.result;
                        image.onload = function () {
                            //Determine the Height and Width.
                            var height = this.height;
                            var width = this.width;
                            if (width > 5000 || height > 5000) {
                                App.toastrError(caption.MLP_MSG_IMG_SIZE_MAXIMUM);
                                callback();
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataservice.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        callback();
                                    }
                                    else {
                                        $scope.modelMapping.Image = '/uploads/images/' + rs.Object;
                                        ok = true;
                                        callback();
                                    }
                                })
                            }
                        };
                    }
                }
            }
        }
        else {
            callback();
        }
    }
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    };
    $scope.listNewAttr = [];
    $scope.currentId = 0;

    $scope.addNewAttr = function () {
        var newAttr = {
            Id: $scope.currentId,
            AttrName: '',
            Value: '',
        };
        $scope.listNewAttr.push(newAttr);
        $scope.currentId = $scope.currentId + 1;
    }

    $scope.deleteNewAtt = function (id) {
        for (var i = 0; i < $scope.listNewAttr.length; i++) {
            if ($scope.listNewAttr[i].Id == id) {
                $scope.listNewAttr.splice(i, 1);
                break;
            }
        }
    }

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
