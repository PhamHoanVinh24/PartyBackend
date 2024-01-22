var ctxfolderAsset = "/views/admin/asset";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderProductAttributeMain = "/views/admin/materialProductAsset";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_ASSET', ['App_ESEIM_DASHBOARD','App_ESEIM_REPOSITORY', 'App_ESEIM_SUPPLIER', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'monospaced.qrcode', 'ngTagsInput']).
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

app.factory('dataserviceAsset', function ($http) {
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
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },
        insertAsset: function (data, callback) {
            $http.post('/Admin/Asset/InsertAsset/', data).then(callback);
        },
        insertAssetAuto: function (data, callback) {
            $http.post('/Admin/Asset/insertAssetAuto/', data).then(callback);
        },
        updateAsset: function (data, callback) {
            $http.post('/Admin/Asset/UpdateAsset/', data).then(callback);
        },
        deleteAsset: function (data, callback) {
            $http.post('/Admin/Asset/DeleteAsset/' + data).then(callback);
        },
        genAssetCode: function (callback) {
            $http.get('/Admin/Asset/GenAssetCode').then(callback);

        },
        getItem: function (data, callback) {
            $http.post('/Admin/Asset/GetItem?id=' + data).then(callback);
        },
        getAsset: function (data, callback) {
            $http.post('/Admin/Asset/GetAsset/' + data).then(callback);
        },
        getAssetType: function (callback) {
            $http.post('/Admin/Asset/GetAssetType').then(callback);
        },
        getAssetGroup: function (callback) {
            $http.post('/Admin/Asset/GetAssetGroup').then(callback);
        },
        getCurrency: function (callback) {
            $http.post('/Admin/Asset/GetCurrency').then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/Asset/GetStatus').then(callback);
        },
        getSupplier: function (callback) {
            $http.post('/Admin/Asset/GetAllSupplier/').then(callback);
        },
        uploadImg: function (data, callback) {
            submitFormUpload('/Admin/Asset/UploadImage/', data, callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/Asset/GetDepartment').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Asset/GetBranch').then(callback);
        },
        GetPerson: function (callback) {
            $http.post('/Admin/Asset/GetPerson').then(callback);
        },


        insertAttr: function (data, callback) {
            $http.post('/Admin/Asset/InsertAttr/', data).then(callback);
        },
        getItemAttr: function (data, callback) {
            $http.post('/Admin/Asset/GetItemAttr?id=' + data).then(callback);
        },
        updateAttr: function (data, callback) {
            $http.post('/Admin/Asset/UpdateAttr/', data).then(callback);
        },
        getAttr: function (data, callback) {
            $http.post('/Admin/Asset/GetAttr/' + data).then(callback);
        },
        deleteAttr: function (data, callback) {
            $http.post('/Admin/Asset/DeleteAttr/' + data).then(callback);
        },
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/Asset/GeneratorQRCode?code=' + data).then(callback);
        },
        generatorPicture: function (data, callback) {
            $http.post('/Admin/Asset/GeneratorPicture?path=' + data).then(callback);
        },
        //file
        insertAssetFile: function (data, callback) {
            submitFormUpload1('/Admin/Asset/InsertAssetFile/', data, callback);
        },
        getSuggestionsAssetFile: function (data, callback) {
            $http.get('/Admin/Asset/GetSuggestionsAssetFile?assetCode=' + data).then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getAssetFile: function (data, callback) {
            $http.post('/Admin/Asset/GetAssetFile/' + data).then(callback);
        },
        updateAssetFile: function (data, callback) {
            submitFormUpload('/Admin/Asset/UpdateAssetFile/', data, callback);
        },
        deleteAssetFile: function (data, callback) {
            $http.post('/Admin/Asset/DeleteAssetFile/' + data).then(callback);
        },
        getListObjectTypeShare: function (callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectTypeShare/').then(callback);
        },
        getListFileWithObject: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileWithObject?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListObjectShare: function (objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectShare?objectCodeShared=' + objectCodeShared + '&objectTypeShared=' + objectTypeShared + '&objectCode=' + objectCode + '&objectType=' + objectType + '&fileCode=' + fileCode).then(callback);
        },
        getListObjectCode: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectCode?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        insertFileShare: function (data, callback) {
            $http.post('/Admin/FileObjectShare/InsertFileShare/', data).then(callback);
        },
        deleteObjectShare: function (data, callback) {
            $http.get('/Admin/FileObjectShare/DeleteObjectShare?id=' + data).then(callback);
        },

        //Commonsetting
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },

        //Them thuoc tinh mo rong
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        getListProductAttributeMain: function (callback) {
            $http.post('/Admin/Asset/GetListAssetAttributeMain').then(callback);
        },
        getListParent: function (callback) {
            $http.post('/Admin/MaterialProductAsset/GetListParent').then(callback);
        },
        getAttrUnit: function (callback) {
            $http.post('/Admin/MaterialProductAsset/GetAttrUnit/').then(callback);
        },
        getAttrGroup: function (callback) {
            $http.post('/Admin/MaterialProductAsset/GetAttrGroup/').then(callback);
        },
        getAttrDataType: function (callback) {
            $http.post('/Admin/MaterialProductAsset/GetAttrDataType/').then(callback);
        },

        insertAttributeMain: function (data, callback) {
            $http.post('/Admin/MaterialProductAsset/Insert', data, callback).then(callback);
        },
        getDetailAttributeMore: function (data, callback) {
            $http.post('/Admin/Asset/GetDetailAttributeMore?Id=' + data).then(callback);
        },
        insertAttributeMore: function (data, callback) {
            $http.post('/Admin/Asset/InsertAttributeMore', data).then(callback);
        },
        updateAttributeMore: function (data, callback) {
            $http.post('/Admin/Asset/UpdateAttributeMore', data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        deleteAttributeMore: function (data, callback) {
            $http.post('/Admin/Asset/deleteAttributeMore/' + data).then(callback);
        },
        getAssetSuggestions: function (data, data1, callback) {
            $http.post('/Admin/Asset/GetAssetSuggestions?assetGroup=' + data + '&&assetType=' + data1).then(callback);
        },
        updateAttributeMoreAll: function (data, callback) {
            $http.post('/Admin/Asset/UpdateAttributeMoreAll/', data).then(callback);
        },

        //Arrange asset
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListWareHouse').then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListFloorByWareHouseCode?wareHouseCode=' + data).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListLineByFloorCode?floorCode=' + data).then(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListRackByLineCode?lineCode=' + data).then(callback);
        },
        getTreeRecordsPack: function (callback) {
            $http.post('/Admin/AssetPackManager/GetTreeRecordsPack').then(callback);
        },
        getTreeZone: function (callback) {
            $http.post('/Admin/AssetZoneManager/GetTreeZone').then(callback);
        },
        arrangeAsset: function (data, callback) {
            $http.post('/Admin/Asset/ArrangeAsset', data).then(callback);
        },
        getInfoRecordsPack: function (data, callback) {
            $http.post('/Admin/AssetPackManager/GetInfoRecordsPack?packCode=' + data).then(callback);
        },
        getInfoZone: function (data, callback) {
            $http.post('/Admin/AssetZoneManager/GetInfoZone?zoneCode=' + data).then(callback);
        },
        getPositionAsset: function (data, callback) {
            $http.post('/Admin/Asset/GetPositionAsset?assetCode=' + data).then(callback);
        },

        //Search
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListWareHouse').then(callback);
        },
        getListFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListFloorByWareHouseCode?wareHouseCode=' + data).then(callback);
        },
        getListLineByFloorCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListLineByFloorCode?floorCode=' + data).then(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/EDMSWarehouseManagerAsset/GetListRackByLineCode?lineCode=' + data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_ASSET', function ($scope, $rootScope, $compile, $uibModal, dataserviceAsset, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/;
            var mess = { Status: false, Title: "" };
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            //if (!partternName.test(data.AssetName)) {
            //    mess.Status = true;
            //    mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            //}
            return mess;
        }
        $rootScope.checkDataAssetAttribute = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = $rootScope.checkData;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AttrCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE), "<br/>");//"Mã bao gồm chữ cái và số"
            }
            //if (!partternName.test(data.AttrValue)) {
            //    mess.Status = true;
            //    mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE)//"Yêu cầu góa trị có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            //}
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                AssetCode: {
                    required: true
                },
                AssetName: {
                    required: true
                },
                AssetCost: {

                }
            },
            messages: {
                AssetCode: {
                    required: caption.ASSET_VALIDATE_ITEM.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE)//'Mã tài sản yêu cầu bắt buộc'
                },
                AssetName: {
                    required: caption.ASSET_VALIDATE_ITEM.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//'Tên tài sản yêu cầu bắt buộc'
                },
                AssetCost: {

                }
            }
        }
        $rootScope.validationOptionsAssetAttribute = {
            rules: {
                AttrCode: {
                    required: true
                },
                AttrName: {
                    required: true
                },
                AttrValue: {
                    required: true
                }
            },
            messages: {
                AttrCode: {
                    required: caption.ASSET_VALIDATE_ITEM.replace("{0}", caption.ASSET_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE)
                },
                AttrName: {
                    required: caption.ASSET_VALIDATE_ATTR_NAME
                },
                AttrValue: {
                    required: caption.ASSET_VALIDATE_ITEM.replace("{0}", caption.ASSET_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE)
                }
            }
        }
        $rootScope.validationAttributeOptions = {
            rules: {
                Code: {
                    required: true,
                    maxlength: 255
                },
                Value: {
                    required: true
                }
            },
            messages: {
                Code: {
                    required: caption.ASSET_VALIDATE_PROPERTY_CODE,
                    maxlength: caption.ASSET_VALIDATE_PROPERTY_CODE_SMALL_CHAR
                },
                Value: {
                    required: caption.ASSET_VALIDATE_PROPERTY_NAME,
                }
            }
        };
        $rootScope.IsTranslate = true;
    });
    dataserviceAsset.getStatus(function (rs) {
        rs = rs.data;
        $rootScope.Status = rs;
    })
    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    $rootScope.ObjectTypeFile = "ASSET";
    $rootScope.moduleName = "ASSET"
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Asset/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderAsset + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolderAsset + '/google-map.html',
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $filter) {
    var vm = $scope;
    $scope.model = {
        AssetCode: '',
        AssetGroup: '',
        AssetType: '',
        Status: '',
        FromDate: '',
        ToDate: '',
        ManagerId: '',
        WHS_Code: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        RackPosition: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Asset/JTableAsset",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AssetCode = $scope.model.AssetCode;
                d.Status = $scope.model.Status;
                d.AssetGroup = $scope.model.AssetGroup;
                d.AssetType = $scope.model.AssetType;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.ManagerId = $scope.model.ManagerId;
                d.WHS_Code = $scope.model.WHS_Code;
                d.FloorCode = $scope.model.FloorCode;
                d.LineCode = $scope.model.LineCode;
                d.RackCode = $scope.model.RackCode;
                d.RackPosition = $scope.model.RackPosition;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'asc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.AssetID;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("AssetID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AssetCode').withTitle('{{"ASSET_LIST_COL_ASSET" | translate}}').renderWith(function (data, type, full) {
        return full.AssetName + ' </br >(' + full.AssetCode.toLowerCase() + ')';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('AssetName').withTitle('{{"ASSET_LIST_COL_ASSET_NAME" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
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
        return '<span class="text-green">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Postion').withTitle('{{"ASSET_LIST_COL_POSITION" | translate}}').withOption('sClass', 'wpercent10').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'nowrap wpercent5 text-center').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.AssetID + ')" class1="fs25 pr5"><i class="fas fa-edit fs20 pr10" style="--fa-primary-color: green;"></i></a>' +
            '<button title="Xếp kho" ng-click="orderAssetVatCo(\'' + full.AssetCode + '\')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45); margin-right: 10px" class="btn btn-icon-only btn-circle btn-outline blue"><img src="../../../images/wareHouse/orderStore.png" height="25" width="25" /></button>' +
            '<a title="Xoá" ng-click="delete(' + full.AssetID + ')"  class1="fs25"><i class="fas fa-trash fs20" style="--fa-primary-color: red;"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }

    function callback(json) {

    }

    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }

    function toggleOne(selectedItems) {
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
    }

    $scope.search = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $rootScope.reloadIndex = function () {
        reloadData(false);
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }

    // view help detail
    $scope.viewCmsDetail = function (helpId) {
        //item, bookMark
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemHelp',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        helpId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };


    $scope.edit = function (id) {
        //var userModel = {};
        //var listdata = $('#tblData').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //var modalInstance = $uibModal.open({
        //    animation: true,
        //    templateUrl: ctxfolderAsset + '/edit.html',
        //    controller: 'edit',
        //    backdrop: true,
        //    size: '70',
        //    resolve: {
        //        para: function () {
        //            return {
        //                id: userModel.id,
        //                code: userModel.code
        //            };
        //        }
        //    }
        //});
        //modalInstance.result.then(function (d) {
        //    $scope.reloadNoResetPage();
        //}, function () { });

        dataserviceAsset.getItem(id, function (rs) {
            rs = rs.data;
            $rootScope.AssetCode = rs.Object.AssetCode;
            $rootScope.ObjCode = rs.Object.AssetCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderAsset + '/edit.html',
                controller: 'edit',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
            }, function () {
            });
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceAsset.deleteAsset(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    }

    $scope.isSearch = false;

    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    $scope.orderAssetVatCo = function (assetCode) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/orderAsset.html',
            controller: 'orderAsset',
            backdrop: 'static',
            size: '55',
            resolve: {
                para: function () {
                    return assetCode;
                }
            }
        });
        modalInstance.result.then(function (id) {
        }, function () { });
    }

    //Search
    $scope.initData = function () {
        dataserviceAsset.getListWareHouse(function (rs) {
            rs = rs.data;
            $scope.lstWareHouse = rs;
        })

        dataserviceAsset.getAssetType(function (rs) {
            rs = rs.data;
            $scope.lstAssetType = rs;
        });

        dataserviceAsset.getAssetGroup(function (rs) {
            rs = rs.data;
            $scope.lstAssetGroup = rs;
        })

        dataserviceAsset.GetPerson(function (rs) {
            rs = rs.data;
            $scope.lstManager = rs;
        })
    }

    $scope.initData();

    $scope.changeSelect = function (type, item) {
        $scope.reload();
        if (type == "WHS") {
            dataserviceAsset.getListFloorByWareHouseCode(item.WHS_Code, function (rs) {
                rs = rs.data;
                $scope.lstFloor = rs;
                $scope.whsName = item.WHS_Name;
            })
        }
        else if (type == "FLS") {
            dataserviceAsset.getListLineByFloorCode(item.FloorCode, function (rs) {
                rs = rs.data;
                $scope.lstLine = rs;
                $scope.floorName = item.FloorName;
            })
        }
        else if (type == "LINE") {
            dataserviceAsset.getListRackByLineCode(item.LineCode, function (rs) {
                rs = rs.data;
                $scope.lstRack = rs;
                $scope.lineName = item.L_Text;
            })
        }
        else if (type == "RACK") {
            $scope.rackName = item.RackName;
        }
    }

    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
    }

    function initDateTime() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
    }

    setTimeout(function () {
        initDateTime();
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceAsset, $filter) {
    $rootScope.AssetCode = '';
    $rootScope.AssetCodeTemp = '';
    $scope.CheckCode = '';
    $scope.model = {
        Id: 0,
        LocationText: '',
        LocationGps: '',
        SupplierCode: '',
        Status: '',
        Branch: '',
        Department: '',
        UserResponsible: '',
        Quantity: null,
        AssetType: '',
        AssetGroup: ''
    };
    $scope.Pic = "";

    $scope.qrCode = '';

    $scope.initLoad = function () {
        $scope.model.Status = "SERVICE_ACTIVE";
        dataserviceAsset.genAssetCode(function (rs) {
            rs = rs.data;
            $scope.model.AssetCode = rs;
            dataserviceAsset.generatorQRCode($scope.model.AssetCode, function (rs) {
                $scope.qrCode = rs.data;
                if ($scope.model.PathIMG != null && $scope.model.PathIMG != "") {
                    dataserviceAsset.generatorPicture($scope.model.PathIMG, function (rs) {
                        $scope.Pic = rs.data;
                    })
                } else {
                    $scope.Pic = "/uploads/images/no-image.png";
                    dataserviceAsset.generatorPicture($scope.Pic, function (rs) {
                        $scope.Pic = rs.data;
                    })
                }
            })
        })
        dataserviceAsset.getSupplier(function (rs) {
            rs = rs.data;
            $scope.SupplierData = rs;
        })
        dataserviceAsset.getAssetType(function (rs) {
            rs = rs.data;
            $scope.AssetType = rs;
        })
        dataserviceAsset.getAssetGroup(function (rs) {
            rs = rs.data;
            $scope.AssetGroup = rs;
        })
        dataserviceAsset.getCurrency(function (rs) {
            rs = rs.data;
            $scope.Currency = rs;
        })
        dataserviceAsset.getDepartment(function (rs) {
            $rootScope.listDepartment = rs.data;
        });
        dataserviceAsset.getBranch(function (rs) {
            $rootScope.listBranch = rs.data;
        });
        dataserviceAsset.GetPerson(function (result) {
            result = result.data;
            $scope.ListPerson = result;
        });
    }

    $scope.initLoad();

    $scope.chkSubTab = function () {
        if ($rootScope.AssetCode === '' || $rootScope.AssetCode === undefined) {
            App.toastrError(caption.ASSET_MSG_ADD_ASSET_FIRST);
        }
    }

    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "gender" && ($scope.model.gender != "" || $scope.model.gender != null)) {
            $scope.errorGender = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "employeekind" && $scope.model.employeekind != "") {
            $scope.errorEmployeekind = false;
        }
        //if (SelectType == "employeegroup" && $scope.model.employeegroup != "") {
        //    $scope.errorEmployeegroup = false;
        //}
        if (SelectType == "employeetype" && $scope.model.employeetype != "") {
            $scope.errorEmployeetype = false;
        }

        if (SelectType == "phone" && $scope.model.phone && $rootScope.partternPhone.test($scope.model.phone)) {
            $scope.errorphone = false;
        } else if (SelectType == "phone") {
            $scope.errorphone = true;
        }
    }

    $scope.changeQRCode = function () {
        $scope.model.QrCode = $scope.model.AssetCode;
    }


    // view help detail
    $scope.viewCmsDetail = function (helpId) {
        //item, bookMark
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemHelp',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        helpId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };


    $scope.changeAssetGroupType = function () {
        dataserviceAsset.getAssetSuggestions($scope.model.AssetGroup, $scope.model.AssetType, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model.AssetName = rs.Object.AssetName;
                $scope.model.AssetType = rs.Object.AssetType;
                $scope.model.SupplierCode = rs.Object.SupplierCode;
                $scope.model.LocationGps = rs.Object.LocationGps;
                $scope.model.LocationText = rs.Object.LocationText;
                $scope.model.LocationSet = rs.Object.LocationSet;
                $scope.model.Branch = rs.Object.Branch;
                $scope.model.Department = rs.Object.Department;
                $scope.model.UserResponsible = rs.Object.UserResponsible;
                $scope.model.Status = rs.Object.Status;
                $scope.model.Description = rs.Object.Description;
                $rootScope.AssetCodeTemp = rs.Object.AssetCode;
                $scope.model.AssetCodeTemp = rs.Object.AssetCode;
                $rootScope.reloadAttribute();
            } else {
                App.toastrError(rs.Title);
            }
        });
    };

    $scope.checkAdded = false;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $rootScope.isAdded = false;

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.COM_MSG_IMG_TOO_BIG);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataserviceAsset.uploadImg(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.PathIMG = '/uploads/images/' + rs.Object;
                                            if ($scope.model.Id == 0) {
                                                dataserviceAsset.insertAsset($scope.model, function (result) {
                                                    result = result.data;
                                                    if (result.Error) {
                                                        App.toastrError(result.Title);
                                                    } else {
                                                        App.toastrSuccess(result.Title);
                                                        $scope.CheckCode = $scope.model.AssetCode;
                                                        $scope.model.Id = 10;
                                                        $rootScope.reloadIndex();
                                                        //$uibModalInstance.close();
                                                    }
                                                });
                                            } else {

                                            }
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                if (!$rootScope.isAdded) {
                    dataserviceAsset.insertAssetAuto($scope.model, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $scope.CheckCode = $scope.model.AssetCode;
                            $rootScope.AssetCode = $scope.model.AssetCode;
                            $rootScope.ObjCode = $scope.model.AssetCode;
                            $rootScope.AssetCodeTemp = '';
                            $rootScope.reloadIndex();
                            $rootScope.reloadAttribute();
                            
                            if ($scope.model.Quantity > 0 || $scope.model.Quantity == null || $scope.model.Quantity == undefined) {
                                $rootScope.isAdded = true;
                                $scope.model.AssetID = result.Object;
                            }
                            else {
                                $uibModalInstance.close();
                            }
                        }
                    });
                }
                else {
                    
                    dataserviceAsset.updateAsset($scope.model, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            }
        }
    };

    $scope.chkAdd = function () {
        if ($scope.CheckCode == '') {
            App.toastrError(caption.ASSET_MSG_ADD_ASSET_FIRST);
        }
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "SupplierCode" && $scope.model.SupplierCode != "") {
            $scope.errorSupplierCode = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "Branch" && $scope.model.Branch != "") {
            $scope.errorBranch = false;
        }
        if (SelectType == "Department" && $scope.model.Department != "") {
            $scope.errorDepartment = false;
        }
        if (SelectType == "UserResponsible" && $scope.model.UserResponsible != "") {
            $scope.errorUserResponsible = false;
        }
    }

    $scope.openMap = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/googleMap.html',
            controller: 'googleMap',
            backdrop: true,
            size: '80',
            resolve: {
                para: function () {
                    return '';
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.LocationGps = d.lat + ',' + d.lng;
                $scope.model.LocationText = d.address;
            }
        }, function () { });
    }

    $scope.printQRCode = function () {
        var qrCode = $scope.qrCode;
        var picture = $scope.Pic;
        var assetType = "";
        for (var i = 0; i < $scope.AssetType.length; i++) {
            if ($scope.model.AssetType == $scope.AssetType[i].Code) {
                assetType = $scope.AssetType[i].Name;
            }
        }
        var supplier = "";
        for (var i = 0; i < $scope.SupplierData.length; i++) {
            if ($scope.model.SupplierCode == $scope.SupplierData[i].SupCode) {
                supplier = $scope.SupplierData[i].SupName;
            }
        }
        var status = "";
        for (var i = 0; i < $rootScope.Status.length; i++) {
            if ($scope.model.Status == $rootScope.Status[i].Code) {
                status = $rootScope.Status[i].Name;
            }
        }
        var assetName = ""
        if ($scope.model.AssetName != null && $scope.model.AssetName != "") {
            assetName = $scope.model.AssetName
        }
        var buyedTime = ""
        if ($scope.model.BuyedTime != null && $scope.model.BuyedTime != "") {
            buyedTime = $scope.model.BuyedTime
        }
        var locationText = ""
        if ($scope.model.LocationText != null && $scope.model.LocationText != "") {
            locationText = $scope.model.LocationText;

        }
        var description = ""
        if ($scope.model.Description != null && $scope.model.Description != "") {
            description = $scope.model.Description
        }
        if (qrCode != '') {
            var frame1 = document.createElement('iframe');
            document.body.appendChild(frame1);
            var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
            //var content = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var contentPrint = '';
            contentPrint += '<div class="uppercase" style="padding: 5px;border: #000 solid 1px; width:80%;margin: auto;margin-top:150px;">';
            contentPrint += '<p style="text-align: center;font-size:24px;"><strong>Thông Tin Tài Sản</strong></p>';
            contentPrint += '<table style="height: auto; width: 100%;line-height: 30px;">';
            contentPrint += '<tbody>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Mã tài sản</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + $scope.model.AssetCode + '</strong></td>';
            contentPrint += '<td style="width: 61px;" rowspan="5">' + '<img style="height:120px;weight:120px;margin-top:0px;display: block; margin-left: auto; margin-right: auto;" src="data:image/png;base64,' + qrCode + '">' + '</td>';
            contentPrint += '</tr>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Tên tài sản</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + assetName + '</strong></td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Loại tài sản</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + assetType + '</strong></td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Nhà cung cấp</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + supplier + '</strong></td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Trạng thái</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + status + '</strong></td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Thời gian mua</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + buyedTime + '</strong></td>';
            contentPrint += '<td style="width: 61px;" rowspan="5">' + '<img style="height:120px;weight:120px;margin-top:0px;display: block; margin-left: auto; margin-right: auto;" src="data:image/png;base64,' + picture + '">' + '</td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Địa điểm - vị trí tài sản:</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + locationText + '</strong></td>';
            contentPrint += '</tr>';
            contentPrint += '</tbody>';
            contentPrint += '</table>';
            contentPrint += '<div style="padding-left:8px;line-height: 2em;"><p><strong>Mô tả:&nbsp;' + description + '</strong></p></div>';
            contentPrint += '</div>';
            frameDoc.document.write('<style>@page{margin: 0;size: landscape;}' +
                '.col-md-5{width: 41.66667%;float: left;} .col-md-7{width: 58.33333%;float: left;} .col-md-12{width: 100%;float: left;} .uppercase{text-transform: uppercase;} .fw500{font-weight: 500;}' +
                '.col-md-4{width: 33.33333%;float: left;} .col-md-3{width: 25%;float: left;}' +
                '.col-md-6{width: 50%;float: left;} .col-md-2{width: 16.66667%;float: left;}</style>' +
                '<body onload="window.print()">' + contentPrint + '</body>');
            frameDoc.document.close();
            setTimeout(function () {
                document.body.removeChild(frame1);
            }, 1500);
        } else {
            App.toastrError(caption.ASSET_MSG_ERR_PRINT_LABEL_ASSET)
        }
    };

    function initAutocomplete() {
        var input = document.getElementById('address');
        var autocomplete = new google.maps.places.Autocomplete(input);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            $scope.lat = place.geometry.location.lat();
            $scope.lng = place.geometry.location.lng();
            $scope.model.LocationGps = $scope.lat + "," + $scope.lng;
            $scope.$apply();
        });
    }

    function initDateTime() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $('#datefrom').datepicker().datepicker("setDate", new Date());
        $('#dateto').datepicker().datepicker("setDate", new Date());
    }

    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        //if (data.SupplierCode == "") {
        //    $scope.errorSupplierCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorSupplierCode = false;
        //}

        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        //if (data.Branch == "") {
        //    $scope.errorBranch = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorBranch = false;
        //}

        //if (data.Department == "") {
        //    $scope.errorDepartment = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorDepartment = false;
        //}

        //if (data.UserResponsible == "") {
        //    $scope.errorUserResponsible = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorUserResponsible = false;
        //}
        return mess;
    };

    setTimeout(function () {
        initDateTime();
        initAutocomplete();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceAsset, $filter, para) {
    $scope.model = {
        Status: '',
        Branch: '',
        Department: '',
        UserResponsible: '',
    }
    $scope.qrCode = '';
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.asset = {

    };
    $scope.initData = function () {
        $scope.model = para;
        $rootScope.PathIMG = $scope.model.PathIMG;
        dataserviceAsset.getSupplier(function (rs) {
            rs = rs.data;
            $scope.SupplierData = rs;
        })
        dataserviceAsset.getAssetType(function (rs) {
            rs = rs.data;
            $scope.AssetType = rs;
        })
        dataserviceAsset.getAssetGroup(function (rs) {
            rs = rs.data;
            $scope.AssetGroup = rs;
        })
        dataserviceAsset.getCurrency(function (rs) {
            rs = rs.data;
            $scope.Currency = rs;
        })
        dataserviceAsset.getDepartment(function (rs) {
            $rootScope.listDepartment = rs.data;
        });
        dataserviceAsset.getBranch(function (rs) {
            $rootScope.listBranch = rs.data;
        });
        dataserviceAsset.GetPerson(function (result) {
            result = result.data;
            $scope.ListPerson = result;
        });
        dataserviceAsset.generatorQRCode($scope.model.AssetCode, function (rs) {
            $scope.qrCode = rs.data;
        });
        if ($scope.model.PathIMG != null && $scope.model.PathIMG != "") {
            dataserviceAsset.generatorPicture($scope.model.PathIMG, function (rs) {
                $scope.Pic = rs.data;
            })
        } else {
            $scope.Pic = "/uploads/images/no-image.png";
            dataserviceAsset.generatorPicture($scope.Pic, function (rs) {
                $scope.Pic = rs.data;
            })
        }

    }
    $scope.initData();

    // view help detail
    $scope.viewCmsDetail = function (helpId) {
        //item, bookMark
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemHelp',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        helpId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };



    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.openMap = function () {
        
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/googleMap.html',
            controller: 'googleMap',
            backdrop: true,
            size: '80',
            resolve: {
                para: function () {
                    return {
                        locationText: $scope.model.LocationText,
                        locationGPS: $scope.model.LocationGps
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            if (d != undefined) {
                $scope.model.LocationGps = d.lat + ',' + d.lng;
                $scope.model.LocationText = d.address;
            }
        }, function () { });
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.asset.editform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.ASSET_MSG_SIZE_IMG_TOO_LARGE);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataserviceAsset.uploadImg(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.PathIMG = '/uploads/images/' + rs.Object;
                                            dataserviceAsset.updateAsset($scope.model, function (result) {
                                                result = result.data;
                                                if (result.Error) {
                                                    App.toastrError(result.Title);
                                                } else {
                                                    App.toastrSuccess(result.Title);
                                                    $uibModalInstance.close();
                                                }
                                            });
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                dataserviceAsset.updateAsset($scope.model, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
            //var files = $('#FileInput').get(0);
            //var file = files.files[0];
            //var data = new FormData();
            //if (file == null) {
            //    dataserviceAsset.updateAsset($scope.model, function (result) {
            //        result = result.data;
            //        if (result.Error) {
            //            App.toastrError(result.Title);
            //        } else {
            //            App.toastrSuccess(result.Title);
            //            $uibModalInstance.close();
            //        }
            //    });
            //}
            //else {
            //    data.append("FileUpload", file);
            //    dataserviceAsset.uploadImg(data, function (rs) {
            //        rs = rs.data;
            //        if (rs.Error) {
            //            App.toastrError(rs.Title);
            //            return;
            //        }
            //        else {
            //            $scope.model.PathIMG = '/uploads/images/' + rs.Object;
            //            dataserviceAsset.updateAsset($scope.model, function (result) {
            //                result = result.data;
            //                if (result.Error) {
            //                    App.toastrError(result.Title);
            //                } else {
            //                    App.toastrSuccess(result.Title);
            //                    $uibModalInstance.close();
            //                }
            //            });
            //        }
            //    });
            //}
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "SupplierCode" && $scope.model.SupplierCode != "") {
            $scope.errorSupplierCode = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "Branch" && $scope.model.Branch != "") {
            $scope.errorBranch = false;
        }
        if (SelectType == "Department" && $scope.model.Department != "") {
            $scope.errorDepartment = false;
        }
        if (SelectType == "UserResponsible" && $scope.model.UserResponsible != "") {
            $scope.errorUserResponsible = false;
        }
    }
    function initAutocomplete() {
        var input = document.getElementById('address');
        var autocomplete = new google.maps.places.Autocomplete(input);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            $scope.lat = place.geometry.location.lat();
            $scope.lng = place.geometry.location.lng();
            $scope.model.LocationGps = $scope.lat + "," + $scope.lng;
            $scope.$apply();
        });
    }
    function convertDatetime(date) {
        var result = '';
        if (date != null && date != '') {
            var array = date.split('/');
            result = array[1] + '/' + array[0] + '/' + array[2];
        }
        return result;
    }
    function convertFomartdate(dateTime) {
        var result = "";
        if (dateTime != null && dateTime != "") {
            result = $filter('date')(new Date(dateTime), 'dd/MM/yyyy');
        }
        return result;
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        //if (data.SupplierCode == "") {
        //    $scope.errorSupplierCode = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorSupplierCode = false;
        //}

        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        //if (data.Branch == "") {
        //    $scope.errorBranch = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorBranch = false;
        //}

        //if (data.Department == "") {
        //    $scope.errorDepartment = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorDepartment = false;
        //}

        //if (data.UserResponsible == "") {
        //    $scope.errorUserResponsible = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorUserResponsible = false;
        //}
        return mess;
    };
    $scope.viewwer = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/viewwer.html',
            controller: 'viewwer',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return $rootScope.PathIMG;
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    };
    $scope.printQRCode = function () {
        var qrCode = $scope.qrCode;
        var picture = $scope.Pic;
        var assetType = "";
        for (var i = 0; i < $scope.AssetType.length; i++) {
            if ($scope.model.AssetType == $scope.AssetType[i].Code) {
                assetType = $scope.AssetType[i].Name;
            }
        }
        var supplier = "";
        for (var i = 0; i < $scope.SupplierData.length; i++) {
            if ($scope.model.SupplierCode == $scope.SupplierData[i].SupCode) {
                supplier = $scope.SupplierData[i].SupName;
            }
        }
        var status = "";
        for (var i = 0; i < $rootScope.Status.length; i++) {
            if ($scope.model.Status == $rootScope.Status[i].Code) {
                status = $rootScope.Status[i].Name;
            }
        }
        var note = "";
        if ($scope.model.Description != null && $scope.model.Description != "") {
            note = $scope.model.Description;
        }
        var assetName = ""
        if ($scope.model.AssetName != null && $scope.model.AssetName != "") {
            assetName = $scope.model.AssetName
        }
        var buyedTime = ""
        if ($scope.model.sBuyedTime != null && $scope.model.sBuyedTime != "") {
            buyedTime = $scope.model.sBuyedTime
        }
        var locationText = ""
        if ($scope.model.LocationSet != null && $scope.model.LocationSet != "") {
            locationText = $scope.model.LocationSet;

        }
        if (qrCode != '') {
            var frame1 = document.createElement('iframe');
            document.body.appendChild(frame1);
            var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
            //var content = '<img src="data:image/png;base64,' + qrCode + '" width="125" height="125" /> ';
            var contentPrint = '';
            contentPrint += '<div class="uppercase" style="padding: 5px;border: #000 solid 1px; width:80%;margin: auto;margin-top:150px;">';
            contentPrint += '<p style="text-align: center;font-size:24px;"><strong>Thông Tin Tài Sản</strong></p>';
            contentPrint += '<table style="height: auto; width: 100%;line-height: 30px;">';
            contentPrint += '<tbody>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Mã tài sản</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + $scope.model.AssetCode + '</strong></td>';
            contentPrint += '<td style="width: 61px;" rowspan="5">' + '<img style="height:120px;weight:120px;margin-top:0px;display: block; margin-left: auto; margin-right: auto;" src="data:image/png;base64,' + qrCode + '">' + '</td>';
            contentPrint += '</tr>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Tên tài sản</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + assetName + '</strong></td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Loại tài sản</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + assetType + '</strong></td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Nhà cung cấp</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + supplier + '</strong></td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Trạng thái</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + status + '</strong></td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Thời gian mua</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + buyedTime + '</strong></td>';
            contentPrint += '<td style="width: 61px;" rowspan="5">' + '<img style="height:120px;weight:120px;margin-top:0px;display: block; margin-left: auto; margin-right: auto;" src="data:image/png;base64,' + picture + '">' + '</td>';
            contentPrint += '</tr>';
            contentPrint += '<tr>';
            contentPrint += '<td style="width: 293px;"><strong>&nbsp;Địa điểm - vị trí tài sản</strong></td>';
            contentPrint += '<td style="width: 10px;"><strong>:</strong></td>';
            contentPrint += '<td style="width: 446px;"><strong>&nbsp;' + locationText + '</strong></td>';
            contentPrint += '</tr>';

            contentPrint += '</tbody>';
            contentPrint += '</table>';
            contentPrint += '<div style="padding-left:8px;line-height: 2em;"><p><strong>Mô tả:&nbsp;' + note + '</strong></p></div>';
            contentPrint += '</div>';
            frameDoc.document.write('<style>@page{margin: 0;size: landscape;}' +
                '.col-md-5{width: 41.66667%;float: left;} .col-md-7{width: 58.33333%;float: left;} .col-md-12{width: 100%;float: left;} .uppercase{text-transform: uppercase;} .fw500{font-weight: 500;}' +
                '.col-md-4{width: 33.33333%;float: left;} .col-md-3{width: 25%;float: left;}' +
                '.col-md-6{width: 50%;float: left;} .col-md-2{width: 16.66667%;float: left;}</style>' +
                '<body onload="window.print()">' + contentPrint + '</body>');
            frameDoc.document.close();
            setTimeout(function () {
                document.body.removeChild(frame1);
            }, 1500);
        } else {
            App.toastrError(caption.ASSET_MSG_ERR_PRINT_LABEL_ASSET)
        }
    };
    setTimeout(function () {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            //var maxDate = new Date(selected.date.valueOf());
            //$('#datefrom').datepicker('setEndDate', maxDate);
        });
        initAutocomplete();
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 100);
});

app.controller('viewwer', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataserviceAsset, $uibModalInstance, para) {
    $scope.model = {
        Banner: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        $scope.model.Picture = para;
    }
    $scope.initData();
});

app.controller('assetAttribute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $filter, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        AttrCode: '',
        AttrValue: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Asset/JTableAttr",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AssetCode = $rootScope.AssetCode;
                d.AttrName = $scope.model.AttrName;
                d.AttrCode = $scope.model.AttrCode;
                d.AttrValue = $scope.model.AttrValue;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(1)
        .withOption('order', [1, 'asc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("AttrID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrCode').withTitle('{{"ASSET_LIST_COL_ATTR_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrName').withTitle('{{"ASSET_LIST_COL_ATTR_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrValue').withTitle('{{"ASSET_CURD_TAB_ATTRIBUTE_LIST_COL_VALUE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle($translate('ASSET_CURD_TAB_ATTRIBUTE_LIST_COL_ACTION')).withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.AttrID + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.AttrID + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }

    $scope.reload = function () {
        reloadData(true);
    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
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

    function callback(json) {

    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/addAssetAttribute.html',
            controller: 'addAssetAttribute',
            backdrop: true,
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }
    $scope.edit = function (id) {
        dataserviceAsset.getItemAttr(id, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderAsset + '/editAssetAttribute.html',
                controller: 'editAssetAttribute',
                backdrop: true,
                size: '35',
                resolve: {
                    para: function () {
                        return id;
                    }
                }

            });
            modalInstance.result.then(function (d) {
                $scope.reload()
            }, function () { });
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceAsset.deleteAttr(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
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
            $scope.reload();
        }, function () {
        });


    }
});

app.controller('addAssetAttribute', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceAsset, $filter) {
    $scope.model = {
        AssetCode: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.addformAssetAttribute.validate()) {
            var msg = $rootScope.checkDataAssetAttribute($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            $scope.model.AssetCode = $rootScope.AssetCode;
            dataserviceAsset.insertAttr($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('editAssetAttribute', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceAsset, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initLoad = function () {
        dataserviceAsset.getAttr(para, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model = rs;
            }
        })
    }
    $scope.initLoad();
    $scope.submit = function () {
        if ($scope.editformAssetAttribute.validate()) {
            var msg = $rootScope.checkDataAssetAttribute($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            $scope.model.AssetCode = $rootScope.AssetCode;
            dataserviceAsset.updateAttr($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });

        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('assetTabHistoryRun', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        //Tax: 0
    }
    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];

    $scope.priceOptionAgent = [
        { Code: "PRICE_COST_CATELOGUE", Name: "Giá đại lý catalogue" },
        { Code: "PRICE_COST_AIRLINE", Name: "Giá đại lý đường bay" },
        { Code: "PRICE_COST_SEA", Name: "Giá đại lý đường biển" }
    ];
    $scope.priceOptionRetail = [
        { Code: "PRICE_RETAIL_BUILD", Name: "Giá bán lẻ có thi công" },
        { Code: "PRICE_RETAIL_BUILD_AIRLINE", Name: "Giá bán lẻ có thi công bay" },
        { Code: "PRICE_RETAIL_BUILD_SEA", Name: "Giá bán lẻ có thi công kho,biển" },
        { Code: "PRICE_RETAIL_NO_BUILD", Name: "Giá bán lẻ không thi công" },
        { Code: "PRICE_RETAIL_NO_BUILD_AIRLINE", Name: "Giá bán lẻ không thi công bay" },
        { Code: "PRICE_RETAIL_NO_BUILD_SEA", Name: "Giá bán lẻ không thi công kho, biển" }
    ];
    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/asset/JTableHistoryRun",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                //d.ContractCode = $rootScope.ContractCode;
                d.Id = $rootScope.Id;

            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })

        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [0, 'desc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"ASSET_MSG_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeFrom').withTitle('{{"ASSET_LIST_COL_TIME_FROM" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeTo').withTitle('{{"ASSET_LIST_COL_TIME_TO" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Expense').withTitle('{{"ASSET_LIST_COL_FUND" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ASSET_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    }

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {

    }
    $scope.edit = function (id) {

    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceAsset.deleteProductInContract(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result.Object);
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
            $scope.reload();
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.init = function () {
        
        $scope.model = $scope.ListHistoryRun;
    }
    $scope.init();
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
    }
    $scope.save = function (id) {

    }
});

app.controller('assetTabFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $filter, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        AttrCode: '',
        AttrValue: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Asset/JTableAttr",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AssetCode = $rootScope.AssetCode;
                d.AttrCode = $scope.model.AttrCode;
                d.AttrValue = $scope.model.AttrValue;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [0, 'asc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractFileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{"ASSET_LIST_COL_FILE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"ASSET_LIST_COL_DATE_CREATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"ASSET_LIST_COL_STORE" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{"ASSET_LIST_COL_DESCRIPTION" | translate}}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Url').withTitle('{{"ASSET_LIST_COL_VIEW_ONL" | translate}}').renderWith(function (data, type, full) {
        var idxDot = data.lastIndexOf(".") + 1;
        var extFile = data.substr(idxDot, data.length).toLowerCase();
        var file = ['XLSX', 'XLS', 'TXT', 'DOCX', 'DOC', 'PDF', 'PPS', 'PPTX', 'PPT',];
        var image = ['JPG', 'PNG', 'TIF', 'TIFF'];
        if (file.indexOf(extFile.toUpperCase()) != -1) {
            return "<a ng-click='viewFile(" + full.Id + ")'>Xem trực tuyến</a>";

        } else if (image.indexOf(extFile.toUpperCase()) != -1) {
            return "<a ng-click='viewImage(" + full.Id + ")'>Xem trực tuyến</a>";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{"ASSET_LIST_COL_FILE_TYPE" | translate}}').renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'w75').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a href="' + full.Url + '" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
                '<a href="' + full.Url + '" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }

    $scope.reload = function () {
        reloadData(true);
    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
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

    function callback(json) {

    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/addAssetAttribute.html',
            controller: 'addAssetAttribute',
            backdrop: true,
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/editAssetAttribute.html',
            controller: 'editAssetAttribute',
            backdrop: true,
            size: '35',
            resolve: {
                para: function () {
                    return id;
                }
            }

        });
        modalInstance.result.then(function (d) {
            $scope.reload()
        }, function () { });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceAsset.deleteAttr(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
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
            $scope.reload();
        }, function () {
        });


    }
});

app.controller('assetTabMaintenanceHistory', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        ProductCode: '',
        PriceOption: '',
        //UnitPrice: 0,
        //Tax: 0
    }
    $scope.currentSelectedProduct = null;
    $scope.products = [];
    $scope.productType = "";
    $scope.isAdd = true;
    $scope.isShowImpProduct = true;
    $scope.priceOption = [];

    //$scope.currentData = '';
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Asset/JTableMaintenanceHistory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ContractCode = $rootScope.ContractCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(1)
        .withOption('order', [0, 'desc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Maintenance').withTitle('{{"ASSET_LIST_COL_HM" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"ASSET_LIST_COL_TYPE1" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"ASSET_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').withTitle('{{"ASSET_LIST_COL_DATE_START" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ASSET_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Address').withTitle('{{"ASSET_LIST_COL_ADDRESS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ASSET_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sWidth', '40px').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));

    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
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
    function validationselectTabProject(data) {
        var mess = { Status: false, Title: "" }
        if (data.ProductCode == "" || data.ProductCode == null) {
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        return mess;
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.add = function () {

    }
    $scope.edit = function (id) {

    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceAsset.deleteProductInContract(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close(result.Object);
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
            $scope.reload();
            $rootScope.amountbudget(d);
        }, function () {
        });
    }
    $scope.init = function () {

    }
    $scope.init();
    $scope.close = function (id) {
        $scope.isAdd = true;
        $scope.model = {
            ServiceCode: '',
            Quantity: 1,
            Cost: '',
            Unit: '',
            Currency: 'VND',
            Tax: 0
        }
        $scope.editId = -1;
    }
    $scope.save = function (id) {

    }
});

app.controller('googleMap', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceAsset, $filter, para) {
    var lat = '';
    var lng = '';
    var address = '';

    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        var obj = {
            lat: lat,
            lng: lng,
            address: address,
        }
        $uibModalInstance.close(obj);
    }
    $scope.initMap = function () {
        
        fields_vector_source = new ol.source.Vector({});
        var center = ol.proj.transform([$rootScope.lngDefault, $rootScope.latDefault], 'EPSG:4326', 'EPSG:3857');
        map = new ol.Map({
            target: $('#map')[0],

            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'


                    })
                }),
                new ol.layer.Vector({
                    source: fields_vector_source
                })
            ],

            view: new ol.View({
                center: center,
                zoom: 15

            }),

            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            })
        });
        var pathGG = $('#pathGG').html();
        var id = $("#ID").html();
        var aaa = parseInt(id);
        if (pathGG != "" && pathGG != null) {
            pathSourceVector = new ol.source.Vector({
                features: []
            });
            pathLayerMarker = new ol.layer.Vector({
                source: pathSourceVector
            });
            var path = polyline.decode(pathGG);

            pathLayerMarker = renderLinePathLayer(path);
            map.addLayer(pathLayerMarker);

            var styles3 = [

                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#64c936',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(100, 201, 54,1)'
                    })
                }),
            ];

            var iconStyleStart = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/pjZYQLJ.png'
                })),
                zIndex: 11
            });
            var iconStyleEnd = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 26],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'https://i.imgur.com/3g07NhB.png'
                })),
                zIndex: 11
            });

            var pathLenght = path.length - 1;
            var iconFeatureStart = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[0][1]), parseFloat(path[0][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });

            iconFeatureStart.setId(1);
            iconFeatureStart.setStyle(iconStyleStart);
            var iconFeatureEnd = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(path[pathLenght][1]), parseFloat(path[pathLenght][0])], 'EPSG:4326', 'EPSG:3857')),
                type: "valve"
            });
            iconFeatureEnd.setId(2);
            iconFeatureEnd.setStyle(iconStyleEnd);
            var vectorIcon = new ol.source.Vector({});
            vectorIcon.addFeature(iconFeatureStart);
            vectorIcon.addFeature(iconFeatureEnd);

            var vectorLayer = new ol.layer.Vector({
                source: vectorIcon,
                style: styles3
            });

            map.addLayer(vectorLayer);


            //pathSource = new ol.source.Vector({});


            pathSource.addFeature(renderLineStringFeature(path))
            var field_location = pathSource.getFeatureById(aaa).getProperties();
            var field_extent = field_location.geometry.getExtent();
            map.getView().fit(field_extent, map.getSize());
            map.getView().setZoom(12);
        }
    }
    $scope.initMap();
    function setHeightMap() {
        var maxHeightMap = $(window).height() - $("#map").position().top - 200;
        $("#map").css({
            'max-height': maxHeightMap,
            'height': maxHeightMap,
            'overflow': 'auto',
        });
        mapReSize();
    }
    function mapReSize() {
        setTimeout(function () {
            map.updateSize();
        }, 600);
    }
    function initData() {
        //init
        if (para.locationGPS !== undefined && para.locationGPS !== '' && para.locationGPS !== null) {
            lat = parseFloat(para.locationGPS.split(",")[0]);
            lng = parseFloat(para.locationGPS.split(",")[1]);
            address = para.locationText;
            document.getElementById("startPlace").value = para.address;
        } else {
            lat = $rootScope.latDefault;
            lng = $rootScope.lngDefault;
            address = $rootScope.addressDefault;
            document.getElementById("startPlace").value = $rootScope.addressDefault;
        }

        //var centerPoint = { lat: lat, lng: lng };
        var centerPoint = { lat: lat == '' ? $rootScope.latDefault : lat, lng: lng == '' ? $rootScope.lngDefault : lng };
        var infowindow = new google.maps.InfoWindow({
            content: '<b>Thông tin</b> <br/>' + address,
        });
        var maps = new google.maps.Map(
            document.getElementById('map'), { zoom: $rootScope.zoomMapDefault, center: centerPoint });
        maps.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('startPlace'));
        var marker = new google.maps.Marker({
            zoom: 12,
            position: centerPoint,
            map: maps,
        });
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };




        //Autocomplete
        var input = document.getElementById('startPlace');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        var service = new google.maps.places.PlacesService(maps);



        //Map change
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                maps.fitBounds(place.geometry.viewport);
            } else {
                maps.setCenter(place.geometry.location);
                maps.setZoom(17);
            }
            marker.setIcon(({
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            var html = "<b>" + place.name + "</b> <br/>" + place.formatted_address;
            infowindow.setContent(html);
            infowindow.open(maps, marker);
            address = place.formatted_address;
            $scope.$apply();
        });



        //Map click
        infowindow.open(map, marker);
        maps.addListener('click', function (event) {
            var point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
            var str = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + point.lat + ',' + point.lng + '&sensor=true&key=AIzaSyDZ8uIjezAevvVrMusU_cz8eju6rIXHmc4';
            lat = point.lat;
            lng = point.lng;

            $.getJSON(str, function (data) {
                service.getDetails({
                    placeId: data.results[0].place_id
                }, function (result, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        var html = "<b>" + result.name + "</b> <br/>" + result.formatted_address;
                        infowindow.setContent(html);
                        infowindow.open(map, marker, html);
                        document.getElementById("startPlace").value = result.formatted_address;
                        address = result.formatted_address;
                        $scope.$apply();
                    }
                });


            });
            if (marker) {
                marker.setPosition(point);
            }
            else {
                marker = new google.maps.Marker({
                    position: point,
                    map: maps,
                });
            }
            maps.setZoom($rootScope.zoomMapDefault);
        })
    }
    setTimeout(function () {
        initData();
        setHeightMap();
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('tabAttribute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        AttrCode: '',
    };
    $scope.listProductAttributeMain = [];
    $scope.listProductAttributeChildren = [];
    $scope.listValues = [];

    $rootScope.isEditAttribute = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Asset/JTableAttribute",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AssetCode = $rootScope.AssetCode;
                d.AssetCodeTemp = $rootScope.AssetCodeTemp;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataAttribute");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [0, 'desc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrCode').withTitle('{{"ASSET_LIST_COL_ATTR_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrName').withTitle('{{"ASSET_LIST_COL_ATTR_NAME" | translate}}').renderWith(function (data, type, full) {
        return data;
        //return '<input id="attrName_' + full.Id + '" type="text" class="form-control" value="' + data + '">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrValue').withTitle('{{"ASSET_CURD_LBL_COST" | translate}}').renderWith(function (data, type, full) {
        //return data;
        return '<input id="attrValue_' + full.Id + '" type="text" class="form-control br24" value="' + data + '">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"ASSET_LIST_COL_CURRENCY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"ASSET_COL_GROUP" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DataType').withTitle('{{"ASSET_COL_DATA_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Parent').withTitle('{{"ASSET_COL_PARENT_PROPERTY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ASSET_CURD_TAB_ATTRIBUTE_LIST_COL_ACTION" | translate}}').withOption('sClass', 'nowrap wpercent5 text-center').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.Id + ')" style1= "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25 pr10"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
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
    function callback(json) {

    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadAttribute = function () {
        $scope.reload();
    }
    $scope.init = function () {
        dataserviceAsset.getListProductAttributeMain(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.listProductAttributeMain = rs.Object;
            }
        })
    }
    $scope.init();
    $rootScope.initAttr = function () {
        $scope.init();
    };
    $scope.selectAttributeMain = function (code) {
        if ($scope.model.AttrCode != "") {
            $scope.errAttrCode = false;
        }
        $scope.listValues = [];
        $scope.model.ProductAttributeChildren = '';
        dataserviceAsset.getListProductAttributeChildren(code, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.listProductAttributeChildren = rs.Object;
            }
        })
    }
    $scope.selectAttributeChildren = function (item) {

        var obj = { code: item.Code, name: item.Name };
        var checkExits = $scope.listValues.filter(k => k.name === item.Name);
        if (checkExits.length === 0) {
            $scope.listValues.push(obj);
        }
    };
    $scope.removeValues = function (index) {
        if ($scope.listValues[index].code == $scope.model.ProductAttributeChildren)
            $scope.model.ProductAttributeChildren = '';

        $scope.listValues.splice(index, 1);
        if ($scope.listValues.length == 0)
            $scope.model.ProductAttributeChildren = '';
    }
    $scope.addAttributeMain = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderProductAttributeMain + '/add.html',
            controller: 'addAssetAttribute',
            size: '40',
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.checkInsert = function () {
        var error = false;
        if ($rootScope.AssetCode === '' || $rootScope.AssetCode === undefined) {
            App.toastrError(caption.ASSET_MSG_ADD_ASSET_FIRST);
            error = true;
        }

        return error;
    };
    $scope.saveAll = function () {
        if (!$scope.checkInsert()) {
            var listAssetAttr = [];
            var userModel = {};
            var listdata = $('#tblDataAttribute').DataTable().data();
            for (var i = 0; i < listdata.length; i++) {
                var idAttrValue = '#attrValue_' + listdata[i].Id;
                var obj = {
                    Id: parseInt(listdata[i].Id),
                    AssetCode: $rootScope.AssetCode,
                    AttrCode: listdata[i].AttrCode,
                    AttrValue: $(idAttrValue).val()
                };

                listAssetAttr.push(obj);
            };
            
            if (listAssetAttr.length > 0) {
                dataserviceAsset.updateAttributeMoreAll(listAssetAttr, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadAttribute();
                    }
                });
            } else {
                App.toastrError(caption.ASSET_MSG_LIST_ATTR_EMPTY);
            }

        }
    };
    $scope.add = function () {
        if (!$scope.checkInsert()) {
            validationSelect($scope.model);
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                $scope.model.AssetCode = $rootScope.AssetCode;
                dataserviceAsset.insertAttributeMore($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadAttribute();
                        //$uibModalInstance.close(rs.Object);
                    }
                })
            }
        }

    };
    $scope.inheritance = function () {
        $scope.model.Inheritance = $rootScope.Inheritance;
        if ($scope.model.Inheritance == '' || $scope.model.Inheritance == undefined) {
            App.toastrError(caption.MLP_MSG_NOT_PICK_PRODUCT);
        } else {
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataserviceAsset.insertInheritanceAttributeMore($scope.model.ProductCode, $scope.model.Inheritance, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadAttribute();
                }
            })
        }
    }
    $scope.edit = function (id) {
        if (!$scope.checkInsert()) {
            dataserviceAsset.getDetailAttributeMore(id, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = rs.Object;
                    $rootScope.isEditAttribute = true;
                }
            })
        }
    };
    $scope.submit = function () {
        if (!$scope.checkInsert()) {
            if ($scope.addform.validate()) {
                $scope.model.ProductCode = $rootScope.ProductCode;
                dataserviceAsset.updateAttributeMore($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.isEditAttribute = false;
                        $rootScope.reloadAttribute();
                        $uibModalInstance.close(rs.Object);
                    }
                })
            }
        }
    }
    $scope.cancel = function () {
        $rootScope.isEditAttribute = false;
    }
    $scope.delete = function (id) {
        if (!$scope.checkInsert()) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                    $scope.ok = function () {
                        dataserviceAsset.deleteAttributeMore(id, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $rootScope.reloadAttribute();
                                $rootScope.isEditAttribute = false;
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
                $scope.reload();
            }, function () {
            });
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 

        if (data.AttrCode == "") {
            $scope.errAttrCode = true;
            mess.Status = true;
        } else {
            $scope.errAttrCode = false;
        }
        return mess;
    };
});

app.controller('addAssetAttribute', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceAsset, $filter) {
    $scope.model = {
        ParentCode: '',
        Code: '',
        Name: '',
        Note: '',
        DataType: 'TEXT'
    };

    $rootScope.ParentCode = '';

    $scope.validationOptions = {
        rules: {
            Code: {
                required: true,
                regx: /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/,
                maxlength: 50
            },
            Name: {
                required: true,
                maxlength: 50
            },
        },
        messages: {
            Code: {
                required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MPAS_CURD_LBL_MPA_CODE),
                regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.MPAS_CURD_LBL_MPA_CODE),
                maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MPAS_CURD_LBL_MPA_CODE).replace("{1}", "50")
            },
            Name: {
                required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MPAS_CURD_LBL_MPA_NAME),
                maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MPAS_CURD_LBL_MPA_NAME).replace("{1}", "50")
            }
        }
    };

    $rootScope.loadData = function () {
        dataserviceAsset.getAttrUnit(function (rs) {
            rs = rs.data;
            $rootScope.listUnit = rs;
        });

        dataserviceAsset.getAttrGroup(function (rs) {
            rs = rs.data;
            $rootScope.listGroup = rs;
        });

        dataserviceAsset.getAttrDataType(function (rs) {
            rs = rs.data;
            $rootScope.listDataType = rs;
        });
    };
    $rootScope.loadData();

    $scope.initData = function () {
        dataserviceAsset.getListParent(function (rs) {
            rs = rs.data;
            $scope.listParent = rs;
        });
    };
    $scope.initData();

    $scope.addUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detailAsset',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_UNIT',
                        GroupNote: 'Đơn vị thuộc tính',
                        AssetCode: 'ATTRIBUTE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    }

    $scope.addGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detailAsset',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_GROUP',
                        GroupNote: 'Nhóm thuộc tính',
                        AssetCode: 'ATTRIBUTE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    }

    $scope.addDataType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detailAsset',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_DATA_TYPE',
                        GroupNote: 'Nhóm thuộc tính',
                        AssetCode: 'ATTRIBUTE'
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    };


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceAsset.insertAttributeMain($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $rootScope.ParentCode = $scope.model.Code;
                    App.toastrSuccess(rs.Title);
                    $rootScope.initAttr();
                    $uibModalInstance.close();
                }
            });
        }
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('detailAsset', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',
        AssetCode: para.AssetCode,
        Group: para.Group,
        GroupNote: para.GroupNote
    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CommonSetting/JTableDetail/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SettingGroup = para.Group;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.CodeSet = data.CodeSet;
                    $scope.model.ValueSet = data.ValueSet;
                    $scope.model.Type = data.Type;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"MLP_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"MLP_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"MLP_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"MLP_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"MLP_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataserviceAsset.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {

        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.MLP_CURD_MSG_SETTING_NOT_BLANK);
        } else {
            dataserviceAsset.insertCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    $rootScope.loadData();
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.CodeSet == '') {
            App.toastrError(caption.MLP_CURD_MSG_DATA_NOT_BLANK)
        } else {
            dataserviceAsset.updateCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                    $rootScope.loadData();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceAsset.deleteCommonSetting(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $rootScope.loadData();
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('fileAsset', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $filter, dataserviceSupplier) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Asset/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AssetCode = $rootScope.AssetCode;
                //d.FromDate = $scope.model.FromDate;
                //d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataCustomerFile");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(1)
        .withOption('order', [0, 'desc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{ "CUS_CURD_TAB_FILE_LIST_COL_TITLE" | translate }}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;';
        }
        return icon + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"CUS_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{ "CUS_CURD_TAB_FILE_LIST_COL_NOTE" | translate }}').renderWith(function (data, type, full) {
        return '<button title="Mô tả" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info-circle"></i></button>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "CUS_CURD_TAB_FILE_LIST_COL_CREATETIME" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{"ASSET_LIST_COL_FILE_TYPE" | translate}}').renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap text-center').withTitle('{{"ASSET_LIST_COL_EDIT_FILE" | translate }}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        var typefile = "#";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewExcel(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewWord(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="viewPDF(' + full.Id + ', 2' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; Lịch sử sửa tệp &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'width_90').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<button title="Sửa" ng-click="edit(\'' + full.FileName + '\',' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
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
    }
    $rootScope.reloadFile = function () {
        $scope.reload();
    }
    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/file_search.html',
            windowClass: 'modal-file',
            backdrop: 'static',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.add = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("AssetCode", $rootScope.AssetCode);
            data.append("IsMore", false);
            dataserviceAsset.insertAssetFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.edit = function (fileName, id) {
        dataserviceAsset.getAssetFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderAsset + '/file_edit.html',
                    controller: 'fileEditAsset',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    reloadData()
                }, function () { });
            }
        })
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceAsset.deleteAssetFile(id, function (result) {
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
            $scope.reload();
        }, function () {
        });
    }
    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'fileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataserviceAsset.getByteFile(id, function (rs) {rs=rs.data;
        //    
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/views/admin/edmsRepository/imageViewer.html',
        //        controller: 'contractTabFileImageViewer',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return myBase64;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //    }, function () {
        //    });
        //});
    }
    $scope.dowload = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        //dataserviceAsset.getSuggestionsAssetFile($rootScope.AssetCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.AssetCode, ObjectType: 'ASSET' };
        //    var modalInstance = $uibModal.open({
        //        templateUrl: ctxfolderRepository + '/addFile.html',
        //        controller: 'addFile',
        //        windowClass: 'modal-file',
        //        backdrop: 'static',
        //        size: '60',
        //        resolve: {
        //            para: function () {
        //                return data;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //        reloadData();
        //    }, function () { });
        //})
        dataserviceSupplier.getDefaultRepo($rootScope.AssetCode, 'ASSET', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.AssetCode, ObjectType: 'ASSET' };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderSupplier + '/addFile.html',
                controller: 'setupRepoDefault',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData();
            }, function () { });
        })
    }
    $scope.loadFile = function (event) {
        
        $scope.file = event.target.files[0];
    }
    //Editor online
    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceAsset.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return null;
                }
            });
        }
    };
    $scope.viewExcel = function (id, mode) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceAsset.getItemFile(id, true, mode, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    if (rs.ID === -1) {
                        App.toastrError(rs.Title);
                        setTimeout(function () {
                            window.open('/Admin/Excel#', '_blank');
                        }, 2000);
                    } else {
                        App.toastrError(rs.Title);
                    }
                    return null;
                } else {
                    window.open('/Admin/Excel#', '_blank');
                }
            });
        }
    };
    $scope.viewWord = function (id, mode) {
        
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceAsset.getItemFile(id, true, mode, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    if (rs.ID === -1) {
                        App.toastrError(rs.Title);
                        setTimeout(function () {
                            window.open('/Admin/Docman#', '_blank');
                        }, 2000);
                    } else {
                        App.toastrError(rs.Title);
                    }
                    return null;
                } else {
                    window.open('/Admin/Docman#', '_blank');
                }
            });
        }
    };
    $scope.viewPDF = function (id, mode) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceAsset.getItemFile(id, true, mode, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    if (rs.ID === -1) {
                        App.toastrError(rs.Title);
                        setTimeout(function () {
                            window.open('/Admin/PDF#', '_blank');
                        }, 2000);
                    } else {
                        App.toastrError(rs.Title);
                    }
                    return null;
                } else {
                    window.open('/Admin/PDF#', '_blank');
                }
            });
        }
    };
    $scope.view = function (id) {
        
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        var dt = null;
        //for (var i = 0; i < $scope.treeData.length; ++i) {
        //    var item = $scope.treeData[i];
        //    if (item.id == userModel.Category) {
        //        dt = item;
        //        break;
        //    }
        //}
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            //if (dt != null)
            //    $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            //else
            //    $scope.currentPath = "Google Driver/" + userModel.FileName;
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceAsset.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        window.open(rs.Object, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    } else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
        else {
            //if (dt != null)
            //    $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
            //else
            //    $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
            dataserviceAsset.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        
                        var url = window.location.origin + '/' + rs.Object;
                        window.open(url, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    }
                    else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
    }
    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/viewer.html',
            controller: 'viewer',
            backdrop: 'false',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
    }
    $scope.tabFileHistory = function (fileId) {
        if (fileId === 0) {
            App.toastrError(caption.COM_MSG_FILE_NOT_HISTORY);
            return null;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAsset + '/tabFileHistory.html',
            controller: 'tabFileHistory',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return fileId;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () { });
    };
    $scope.extension = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRepository + '/extension.html',
            controller: 'extension',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Type: 'LIST',
                        Object: item
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
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

app.controller('fileAddAsset', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceAsset, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.CatCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (data.FolderId == '' || data.FolderId == null) {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (full.FolderId == '' || full.FolderId == null) {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            } else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }

            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('{{"ASSET_LIST_COL_FOLDER_SAVE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var itemSelect = [];
            for (var id in $scope.selected) {
                if ($scope.selected.hasOwnProperty(id)) {
                    if ($scope.selected[id]) {
                        itemSelect.push(id);
                    }
                }
            }
            if (itemSelect.length == 0) {
                App.toastrError(caption.CUS_ERROR_CHOOSE_FILE);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.CUS_ERROR_CHOOSE_ONE_FILE);
                return;
            }
            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("AssetCode", $rootScope.AssetCode);
            data.append("IsMore", true);
            dataserviceAsset.insertAssetFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    };

    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceAsset.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.ASSET_ALL_CATEGORY,//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('fileEditAsset', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceAsset, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.CateRepoSettingCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: '',
        FileName: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (para.Path != null && para.Path != "") {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (para.Path != null && para.Path != "") {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{ "CUS_TITLE_FOLDER" | translate }}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        if (selectAll)
            $('#tblDataDetailRepository').DataTable().$('tr:not(.selected)').addClass('selected');
        else
            $('#tblDataDetailRepository').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.init = function () {
        $scope.model.FileName = para.FileName;
        $scope.model.NumberDocument = para.NumberDocument;
        $scope.model.Tags = (para.Tags != '' && para.Tags != null) ? para.Tags.split(',') : [];
        $scope.model.Desc = para.Desc;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        var itemSelect = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    itemSelect.push(id);
                }
            }
        }
        if (itemSelect.length == 0) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_FILE);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_ONE_FILE);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("AssetCode", $rootScope.AssetCode);
                dataserviceAsset.updateAssetFile(data, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    };
    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceAsset.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.ASSET_ALL_CATEGORY,//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                    console.log($scope.treeDataCategory);
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //setModalMaxHeight('.modal-file');
    }, 200);
});

app.controller('fileShareAsset', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceAsset) {
    $scope.model = {
        ObjectCodeShared: $rootScope.AssetCode,
        ObjectTypeShared: 'ASSET',
        ObjectType: '',
        ObjectCode: '',
        FileCode: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataserviceAsset.getListObjectTypeShare(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceAsset.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {
            rs = rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceAsset.getListObjectCode($rootScope.AssetCode, ObjType, function (rs) {
            rs = rs.data;
            $scope.listObjCode = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, ObjType, $scope.model.FileCode);
    }
    $scope.changeObjCode = function (objectCode) {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, objectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.selectFile = function (fileCode) {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, fileCode);
    }
    $scope.reloadListObjectShare = function () {
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.removeObjectShare = function (id) {
        dataserviceAsset.deleteObjectShare(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
            }
        });
    }
    $scope.share = function () {
        if (!$scope.validate()) {
            dataserviceAsset.insertFileShare($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
                }
            });
        }
    }
    $scope.validate = function () {
        var error = false;
        if (($scope.model.ObjectType == "" || $scope.model.ObjectType == undefined)) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_OBJECT)
            error = true;
            return error;
        }
        if (($scope.model.ObjectCode == "" || $scope.model.ObjectCode == undefined)) {
            App.toastrError(caption.CUS_ERROR_CHOOSE_OBJECT_CODE)
            error = true;
            return error;
        }
        if (($scope.model.FileCode == "" || $scope.model.FileCode == undefined)) {
            App.toastrError(caption.CUS_ERROR_SELECT_FILE)
            error = true;
            return error;
        }
    }
    function reloadListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode) {
        dataserviceAsset.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {
            rs = rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('tabFileHistory', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $filter, para) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    };
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Asset/JTableFileHistory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FileId = para;
                d.AssetCode = $rootScope.AssetCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [0, 'asc'])
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractFileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', 'w75').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_NAME" | translate}}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;';
        }

        if (full.IsFileMaster == "False") {
            data = '<span class="text-warning">' + data + '<span>';
        } else {
            data = '<span class="text-primary">' + data + '<span>';
        }

        return icon + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_DESCRIPTION" | translate}}').notSortable().renderWith(function (data, type, full) {
        return '<button title="Mô tả" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info-circle"></i></button>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EditedFileTime').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_EDITED_TIME" | translate}}').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'HH:mm dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EditedFileBy').withTitle('{{"CONTRACT_CURD_TAB_FILE_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"CONTRACT_CURD_TAB_FILE_COL_ACTION" | translate}}').withOption('sClass', 'w75 nowrap text-center').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        var typefile = "#";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
        }

        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(' + full.Id + ')" target="_blank" href=' + typefile + ' title="{{&quot; Xem &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-eye pt5"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')"  style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-download pt5"></i></a>' +
                '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems) {
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
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadFile = function () {
        $scope.reload();
    }

    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderAsset + '/contractTabFileSearch.html',
            windowClass: 'modal-file',
            backdrop: 'static',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.add = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("RequestCode", $rootScope.RequestCode);
            data.append("IsMore", false);
            dataserviceAsset.insertContractFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                }
            });
        }
    }
    $scope.edit = function (fileName, id) {
        dataserviceAsset.getContractFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderAsset + '/tabFileEdit.html',
                    controller: 'tabFileEdit',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '55',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    reloadData()
                }, function () { });
            }
        })
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceAsset.deleteAssetFile(id, function (result) {
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
            $scope.reload();
        }, function () {
        });
    }
    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'tabFileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataserviceAsset.getByteFile(id, function (rs) {rs=rs.data;
        //    
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/views/admin/edmsRepository/imageViewer.html',
        //        controller: 'contractTabFileImageViewer',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return myBase64;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //    }, function () {
        //    });
        //});
    }
    $scope.dowload = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        dataserviceAsset.getSuggestionsAssetFile($rootScope.AssetCode, function (rs) {
            rs = rs.data;
            var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.AssetCode, ObjectType: 'ASSET' };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderRepository + '/addFile.html',
                controller: 'addFile',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData();
            }, function () { });
        })
    }
    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }
    $scope.getObjectFile = function (id) {
        dataserviceAsset.getItemFile(id);
    };
    $scope.extension = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRepository + '/extension.html',
            controller: 'extension',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Type: 'LIST',
                        Object: item
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
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

app.controller('viewer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, para, $sce) {
    
    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
    console.log($scope.currentProjectUrl);
    console.log(data);
});

app.controller('orderAsset', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $location, $uibModalInstance, para) {
    $scope.model = {
        AssetCode: para,
        PackCode: '',
        ZoneCode: '',
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.initLoad = function () {
        dataserviceAsset.getTreeRecordsPack(function (rs) {
            rs = rs.data;
            $scope.lstRecordsPack = rs;
        })

        dataserviceAsset.getTreeZone(function (rs) {
            rs = rs.data;
            $scope.lstZone = rs;
        })

        dataserviceAsset.getPositionAsset(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            if (rs != null) {
                dataserviceAsset.getInfoZone(rs.ZoneCode, function (rs) {
                    rs = rs.data;
                    $scope.infoZone = rs;
                })
                if (rs.PackCode != null) {
                    dataserviceAsset.getInfoRecordsPack(rs.PackCode, function (rs) {
                        rs = rs.data;
                        $scope.infoPack = rs;
                    })
                }
            }
        })
    }

    $scope.initLoad();

    $scope.arrange = function () {
        if ($scope.model.ZoneCode == "") {
            return App.toastrError(caption.ASSET_MSG_ZONE_CODE_NOT_EXIST);
        }
        dataserviceAsset.arrangeAsset($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        })
    }

    $scope.changeSelect = function (type) {
        if (type == "Zone") {
            dataserviceAsset.getInfoZone($scope.model.ZoneCode, function (rs) {
                rs = rs.data;
                $scope.infoZone = rs;
            })
        }
        if (type == "Pack") {
            dataserviceAsset.getInfoRecordsPack($scope.model.PackCode, function (rs) {
                rs = rs.data;
                $scope.infoPack = rs;
            })
        }
    }

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('orderAssetTab', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAsset, $location) {
    $scope.model = {
        AssetCode: $rootScope.AssetCode,
        WHS_Code: '',
        FloorCode: '',
        LineCode: ''
    };

    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.initLoad = function () {
        dataserviceAsset.getPositionAsset($rootScope.AssetCode, function (rs) {
            rs = rs.data;
            $scope.lstPosition = rs;
        })
        dataserviceAsset.getListWareHouse(function (rs) {
            rs = rs.data;
            $scope.lstWareHouse = rs;
        })
    }
    $scope.initLoad();

    $scope.changeSelect = function (type, code) {
        if (type == "WareHouse") {
            dataserviceAsset.getListFloorByWareHouseCode(code, function (rs) {
                rs = rs.data;
                $scope.lstFloor = rs;
            })
        }
        if (type == "Floor") {
            dataserviceAsset.getListLineByFloorCode(code, function (rs) {
                rs = rs.data;
                $scope.lstLine = rs;
            })
        }
        if (type == "Line") {
            dataserviceAsset.getListRackByLineCode(code, function (rs) {
                rs = rs.data;
                $scope.lstRack = rs;
            })
        }
    }

    $scope.arrange = function () {
        if ($scope.model.WHS_Code == '' || $scope.model.LineCode == '' || $scope.model.FloorCode == '') {
            return App.toastrError(caption.ASSET_MSG_PLS_ENTER_INFO);
        }
        dataserviceAsset.arrangeAsset($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceAsset.getPositionAsset($rootScope.AssetCode, function (rs) {
                    rs = rs.data;
                    $scope.lstPosition = rs;
                })
            }
        })
    }

    $scope.delArrange = function (id) {
        dataserviceAsset.delArrangAsset(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataserviceAsset.getPositionAsset($rootScope.AssetCode, function (rs) {
                    rs = rs.data;
                    $scope.lstPosition = rs;
                })
            }
        })
    }

    setTimeout(function () {
        
    }, 200);
});
