var ctxfolderMaterialProd = "/views/admin/materialProduct";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderProductAttributeMain = "/views/admin/materialProductAttributeMain";
var ctxfolderGroup = "/views/admin/materialProductGroup";

var app = angular.module('App_ESEIM_MATERIAL_PROD', ['App_ESEIM_REPOSITORY', 'App_ESEIM_SUPPLIER', 'App_ESEIM_FILE_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput', 'dynamicNumber', 'monospaced.qrcode']);

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
app.directive('autoLoad', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var src = scope.$eval(attrs.autoLoad);
            //element.on('change', onChangeHandler);
            //element.on('$destroy', function () {
            //    element.off();
            //});
            if (element.length && element.length > 0 && src != '' && src != null) {
                element[0].src = src;
                element.css('background', 'white');
            }
        }
    };
});

app.factory('dataserviceMaterial', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    };

    var submitFormUpload = function (url, data, callback) {
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
        insert: function (data, callback) {
            $http.post('/Admin/materialProduct/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/materialProduct/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/materialProduct/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/materialProduct/Delete/' + data).then(callback);
        },
        cloneMultiple: function (data, data1, callback) {
            $http.post(`/Admin/materialProduct/CloneMultiple?productCode=${data}&number=${data1}`).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/materialProduct/GetItem?Id=' + data).then(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/materialProduct/GetItemDetail/' + data).then(callback);
        },
        getproductgroup: function (callback) {
            $http.post('/Admin/materialProduct/GetProductGroup/').then(callback);
        },
        //group
        getTreeDataParent: function (callback) {
            $http.post('/Admin/MaterialProductGroup/GetTreeDataParent/').then(callback);
        },
        getTreeInNode: function (data, callback) {
            $http.post('/Admin/MaterialProductGroup/GetTreeInNode?parentId=' + data).then(callback);
        },
        insertGroup: function (data, callback) {
            $http.post('/Admin/MaterialProductGroup/Insert', data, callback).then(callback);
        },
        updateGroup: function (data, callback) {
            $http.post('/Admin/MaterialProductGroup/Update', data).then(callback);
        },
        deleteGroup: function (data, callback) {
            $http.post('/Admin/MaterialProductGroup/Delete/' + data).then(callback);
        },
        getItemGroup: function (data, callback) {
            $http.get('/Admin/MaterialProductGroup/GetItem/' + data).then(callback);
        },
        gettreedataLevel: function (callback) {
            $http.post('/Admin/materialProduct/GetProductUnit/').then(callback);
        },
        getProductImpType: function (callback) {
            $http.post('/Admin/materialProduct/GetProductImpType/').then(callback);
        },
        getListBrand: function (callback) {
            $http.post('/Admin/materialProduct/GetListBrand/').then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/materialProduct/GetProductStatus/').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UploadImage/', data, callback);
        },
        getInheritances: function (data, callback) {
            $http.post('/Admin/materialProduct/GetInheritances?productCode=' + data).then(callback);
        },
        getInheritancesDetail: function (data, callback) {
            $http.post('/Admin/materialProduct/GetInheritancesDetail?productCode=' + data).then(callback);
        },
        getProductCategoryTypes: function (callback) {
            $http.post('/Admin/materialProduct/GetProductCategoryTypes/').then(callback);
        },
        getProductTypes: function (callback) {
            $http.post('/Admin/materialProduct/GetProductTypes/').then(callback);
        },
        getListCatalogue: function (callback) {
            $http.post('/Admin/materialProduct/GetProductCatelogue/').then(callback);
        },
        insertProductAttribute: function (data, callback) {
            $http.post('/Admin/materialProduct/InsertProductAttribute', data).then(callback);
        },
        deleteExtend: function (id, callback) {
            $http.post('/Admin/materialProduct/DeleteAttribute?Id=' + id).then(callback);
        },
        updateAttribute: function (data, callback) {
            $http.post('/Admin/materialProduct/UpdateAttribute', data).then(callback);
        },
        getAttributeItem: function (id, callback) {
            $http.post('/Admin/materialProduct/GetAttributeItem?id=' + id).then(callback);
        },

        getTreeRepository: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeRepository').then(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/InsertFile/', data, callback);
        },
        deleteFile: function (data, callback) {
            $http.post('/Admin/materialProduct/DeleteFile?id=' + data).then(callback);
        },
        updateFile: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UpdateFile/', data, callback);
        },
        getFile: function (data, callback) {
            $http.get('/Admin/materialProduct/GetFile?id=' + data).then(callback);
        },
        getListObjectTypeShare: function (callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectTypeShare/').then(callback);
        },
        getListObjectCode: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectCode?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListFileWithObject: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileWithObject?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListObjectShare: function (objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectShare?objectCodeShared=' + objectCodeShared + '&objectTypeShared=' + objectTypeShared + '&objectCode=' + objectCode + '&objectType=' + objectType + '&fileCode=' + fileCode).then(callback);
        },
        insertFileShare: function (data, callback) {
            $http.post('/Admin/FileObjectShare/InsertFileShare/', data).then(callback);
        },
        deleteObjectShare: function (data, callback) {
            $http.get('/Admin/FileObjectShare/DeleteObjectShare?id=' + data).then(callback);
        },

        getQrCodeFromString: function (data, callback) {
            $http.post('/Admin/lotProduct/GetQrCodeFromString?content=' + data).then(callback);
        },
        getBarCodeFromString: function (data, callback) {
            $http.post('/Admin/lotProduct/GetBarCodeFromString?content=' + data).then(callback);
        },
        uploadCatalogue: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UploadCatalogue', data, callback);
        },
        saveItems: function (data, callback) {
            $http.post('/Admin/materialProduct/SaveItems', data).then(callback);
        },


        insertAttributeMore: function (data, callback) {
            $http.post('/Admin/materialProduct/InsertAttributeMore', data).then(callback);
        },
        insertInheritanceAttributeMore: function (productCode, inheritance, callback) {
            $http.post('/Admin/materialProduct/InsertInheritanceAttributeMore?productCode=' + productCode + "&&inheritance=" + inheritance).then(callback);
        },

        updateAttributeMore: function (data, callback) {
            $http.post('/Admin/materialProduct/UpdateAttributeMore', data).then(callback);
        },
        deleteAttributeMore: function (data, callback) {
            $http.post('/Admin/materialProduct/DeleteAttributeMore/' + data).then(callback);
        },
        getDetailAttributeMore: function (data, callback) {
            $http.post('/Admin/materialProduct/GetDetailAttributeMore?Id=' + data).then(callback);
        },
        // Static
        insertAttributeMoreStatic: function (data, callback) {
            $http.post('/Admin/materialProduct/InsertAttributeMoreStatic', data).then(callback);
        },

        updateAttributeMoreStatic: function (data, callback) {
            $http.post('/Admin/materialProduct/UpdateAttributeMoreStatic', data).then(callback);
        },
        deleteAttributeMoreStatic: function (data, callback) {
            $http.post('/Admin/materialProduct/DeleteAttributeMoreStatic', data).then(callback);
        },
        getDetailAttributeMoreStatic: function (data, callback) {
            $http.post('/Admin/materialProduct/GetDetailAttributeMoreStatic', data).then(callback);
        },

        //getSosInfo: function (data, callback) {
        //    $http.post('/materialProduct/getSosInfo?id=' + data).then(callback);
        //}

        getListContract: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListContract/').then(callback);
        },
        getListCustommer: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListCustommer/').then(callback);
        },
        getListSupplier: function (callback) {
            $http.post('/Admin/MaterialProductHistorySale/GetListSupplier/').then(callback);
        },
        getProjects: function (callback) {
            $http.post('/Admin/Contract/GetProjects/').then(callback);
        },
        gettreedataCoursetype: function (callback) {
            $http.post('/Admin/MaterialProductGroup/gettreedataCoursetype/').then(callback);
        },
        insertProductGroup: function (data, callback) {
            $http.post('/Admin/MaterialProductGroup/Insert', data, callback).then(callback);
        },
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        getSuggestionsProductFile: function (data, callback) {
            $http.get('/Admin/materialProduct/GetSuggestionsProductFile?productCode=' + data).then(callback);
        },
        getListObjectTypeShare: function (callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectTypeShare/').then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getListFileWithObject: function (objectCode, objectType, callback) {
            $http.get('/Admin/FileObjectShare/GetListFileWithObject?objectCode=' + objectCode + '&objectType=' + objectType).then(callback);
        },
        getListObjectShare: function (objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, callback) {
            $http.get('/Admin/FileObjectShare/GetListObjectShare?objectCodeShared=' + objectCodeShared + '&objectTypeShared=' + objectTypeShared + '&objectCode=' + objectCode + '&objectType=' + objectType + '&fileCode=' + fileCode).then(callback);
        },
        insertProductFile: function (data, callback) {
            submitFormUpload('/Admin/MaterialProduct/InsertProductFile/', data, callback);
        },
        deleteProductFile: function (data, callback) {
            $http.post('/Admin/MaterialProduct/DeleteProductFile/' + data).then(callback);
        },
        getProductFile: function (data, callback) {
            $http.post('/Admin/MaterialProduct/GetProductFile/' + data).then(callback);
        },
        updateProductFile: function (data, callback) {
            submitFormUpload('/Admin/MaterialProduct/UpdateProductFile/', data, callback);
        },

        getListProductAttributeMain: function (callback) {
            $http.post('/Admin/MaterialProduct/GetListProductAttributeMain').then(callback);
        },

        getListProductAttributeChildren: function (data, callback) {
            $http.get('/Admin/MaterialProduct/GetListProductAttributeChildren?ParentCode=' + data).then(callback);
        },
        // non static
        insertComponent: function (data, callback) {
            $http.post('/Admin/materialProduct/InsertComponent', data).then(callback);
        },

        getDetailComponent: function (data, callback) {
            $http.post('/Admin/materialProduct/GetDetailComponent?Id=' + data).then(callback);
        },

        updateComponent: function (data, callback) {
            $http.post('/Admin/materialProduct/UpdateComponent', data).then(callback);
        },

        deleteComponent: function (data, callback) {
            $http.post('/Admin/materialProduct/DeleteComponent/' + data).then(callback);
        },
        // static
        insertComponentStatic: function (data, callback) {
            $http.post('/Admin/materialProduct/InsertComponentStatic', data).then(callback);
        },

        getDetailComponentStatic: function (data, callback) {
            $http.post('/Admin/materialProduct/GetDetailComponentStatic', data).then(callback);
        },

        updateComponentStatic: function (data, callback) {
            $http.post('/Admin/materialProduct/UpdateComponentStatic', data).then(callback);
        },

        deleteComponentStatic: function (data, callback) {
            $http.post('/Admin/materialProduct/DeleteComponentStatic', data).then(callback);
        },

        //Them thuoc tinh mo rong
        getListParent: function (callback) {
            $http.post('/Admin/MaterialProductAttributeMain/GetListParent').then(callback);
        },
        insertAttributeMain: function (data, callback) {
            $http.post('/Admin/MaterialProductAttributeMain/Insert', data, callback).then(callback);
        },
        getAttrUnit: function (callback) {
            $http.post('/Admin/MaterialProductAttributeMain/GetAttrUnit/').then(callback);
        },
        getAttrGroup: function (callback) {
            $http.post('/Admin/MaterialProductAttributeMain/GetAttrGroup/').then(callback);
        },
        getAttrDataType: function (callback) {
            $http.post('/Admin/MaterialProductAttributeMain/GetAttrDataType/').then(callback);
        },

        //Unit weight
        getUnitWeight: function (callback) {
            $http.get('/Admin/materialProduct/GetUnitWeight').then(callback);
        },
        unitFromPack: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/UnitFromPack?json=' + data).then(callback);
        },

        //Generate QrCode
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/GenQRCode?code=' + data, callback).then(callback);
        },
        //Exort Excel
        exportExcel: function (data, callback) {
            $http.post('/Admin/materialProduct/ExportExcel', data).then(callback);
        },
        //
        getListProductCategory: function (data, data1, data2, data3, callback) {
            $http.post('/Admin/ProductImport/GetListProductCategory?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2 + '&productCode=' + data3).then(callback);
        },
        //group
        
        getAllType: function (callback) {
            $http.post('/Admin/MaterialProductGroup/GetProductGroupTypes').then(callback);
        },
    };
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

app.controller('Ctrl_ESEIM_MATERIAL_PROD', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterial, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.PERMISSION_MATERIAL_PRODUCT = PERMISSION_MATERIAL_PRODUCT;
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            // var partternCode = new RegExp("^[a-zA-Z0-9_äöüÄÖÜ]*$");
            //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ProductCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.MLP_VALIDATE_CHARACTER, "<br/>");
            }
            return mess;
        }

        $scope.validationOptionsmore = {
            rules: {
                AttributeCode: {
                    required: true,
                    maxlength: 255,
                },
                AttributeName: {
                    required: true,
                    maxlength: 255,
                },
                Page: {
                    required: true,
                    maxlength: 255,
                },
                Category: {
                    required: true,
                    maxlength: 255,
                },
                Width: {
                    required: true,
                    maxlength: 255,
                },
                Length: {
                    required: true,
                    maxlength: 255,
                },
                Weight: {
                    required: true,
                    maxlength: 255,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT,
                    maxlength: caption.MLP_VALIDATE_CODE_CHARACTER_PRODUCT
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT,
                    maxlength: caption.MLP_VALIDATE_NAME_CHARACTER_PRODUCT
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,

                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,

                },
                Width: {
                    required: caption.MLP_VALIDATE_WIDTH,

                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,

                },
                Weight: {
                    required: caption.MLP_VALIDATE_WEIGTH,

                },

            }
        }

        $rootScope.validationOptions = {
            rules: {
                ProductCode: {
                    required: true,
                    maxlength: 50,
                    //regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                },
                ProductName: {
                    required: true,
                    maxlength: 200
                },
                Unit: {
                    required: true,
                    maxlength: 100
                },
                PricePerM: {
                    required: true,
                },
                PricePerM2: {
                    required: true,
                },
                Wide: {
                    regx: /^[+]?\d+(\.\d+)?$/
                },
                High: {
                    regx: /^[+]?\d+(\.\d+)?$/
                },
                //Packing: {
                //    required: true,
                //},
                Long: {
                    regx: /^[+]?\d+(\.\d+)?$/
                },
            },
            messages: {
                ProductCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT,
                    maxlength: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT_CHARACTER,
                    //regx: caption.MLP_VALIDATE_PROD_CODE
                },
                ProductName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT,
                    maxlength: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT_CHARACTER
                },
                Unit: {
                    required: caption.MLP_VALIDATE_UNIT_IMPORT,
                    maxlength: caption.MLP_VALIDATE_UNIT_IMPORT_CHARACTER1
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM_IMPORT,
                },
                PricePerM2: {
                    required: caption.MLP_VALIDATE_PERM2_IMPORT,
                },
                Wide: {
                    regx: caption.MLP_VALIDATE_WIDTH,
                },
                High: {
                    regx: caption.MLP_VALIDATE_HEIGHT,
                },
                //Packing: {
                //    required: caption.MLP_VALIDATE_PACK,
                //},
                Long: {
                    regx: caption.MLP_VALIDATE_LONG,
                },
            }
        }

        $rootScope.validationAttributeOptions = {
            rules: {
                Code: {
                    required: true,
                    maxlength: 255,
                    //regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                },
                Value: {
                    required: true,
                }
            },
            messages: {
                Code: {
                    required: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT,
                    maxlength: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT_CHARACTER,
                    //regx: caption.MLP_VALIDATE_CODE_ATTR
                },
                Value: {
                    required: caption.MLP_VALIDATE_VALUE_IMPORT,
                }
            }
        };

        $rootScope.IsTranslate = true;
        $rootScope.validationOptionAddC1more = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Value: {
                    required: true,
                },

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT,
                },
                Value: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },

            }
        }
        $rootScope.validationOptionCarpetMore = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM2: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Width: {
                    required: true,
                },
                Length: {
                    required: true,
                },

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PROPERTIES_IMPORT,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM2: {
                    required: caption.MLP_VALIDATE_PERM2,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Width: {
                    required: caption.MLP_MSG_WIDTH_NOBLANK,
                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,
                },

            }
        }

        $rootScope.validationOptionSimpleOrder = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                Width: {
                    required: true,
                },
                Length: {
                    required: true,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PROPERTIES_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PROPERTIES_IMPORT,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                Width: {
                    required: caption.MLP_MSG_WIDTHS_NOBLANK,
                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,
                },
            }
        }
        $rootScope.validationOptionAddC2more = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                Width: {
                    required: true,
                },
                Length: {
                    required: true,
                },
                Weight: {
                    required: true,
                },

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                Width: {
                    required: caption.MLP_VALIDATE_WIDTH,
                },
                Length: {
                    required: caption.MLP_VALIDATE_LENGTH,
                },
                Weight: {
                    required: caption.MLP_VALIDATE_WEIGTH,
                },
            }
        }
        $rootScope.validationOptionFloorMore = {
            rules: {
                AttributeCode: {
                    required: true,
                },
                AttributeName: {
                    required: true,
                },
                Category: {
                    required: true,
                },
                PricePerM: {
                    required: true,
                },
                Page: {
                    required: true,
                },
                PricePerM2: {
                    required: true,
                },
                Width: {
                    required: true,
                }

            },
            messages: {
                AttributeCode: {
                    required: caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT,
                },
                AttributeName: {
                    required: caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT,
                },
                Category: {
                    required: caption.MLP_VALIDATE_CATEGORY,
                },
                PricePerM: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Page: {
                    required: caption.MLP_VALIDATE_PAGE,
                },
                PricePerM2: {
                    required: caption.MLP_VALIDATE_PERM,
                },
                Width: {
                    required: caption.MLP_MSG_WIDTHS_NOBLANK,
                },

            }
        }
        $rootScope.validationOptionsFile = {
            rules: {
                FileName: {
                    required: true
                },

            },
            messages: {
                FileName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MLP_CURD_TAB_FILE_LIST_COL_NAME),
                },

            }
        }

        $rootScope.validationComponentOptions = {
            rules: {
                Code: {
                    required: true,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                },
                Name: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                Quantity: {
                    required: true
                },
            },
            messages: {
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MLP_CURD_LBL_COMPONENT_CODE),
                    regx: caption.MLP_VALIDATE_COMPONENT_CODE
                },
                Name: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MLP_CURD_LBL_COMPONENT_NAME),
                    regx: caption.MLP_VALIDATE_COMPONENT_NAME
                },
                Quantity: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MLP_CURD_LBL_COMPONENT_QUANTITY),
                },
            }
        }

        $rootScope.validationOptionsAttrMain = {
            rules: {
                Code: {
                    required: true,
                    regx: /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/,
                    maxlength: 50
                },
                Name: {
                    required: true,
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
            },
            messages: {
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MPA_CURD_LBL_MPA_CODE),
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.MPA_CURD_LBL_MPA_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MPA_CURD_LBL_MPA_CODE).replace("{1}", "50")
                },
                Name: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MPA_CURD_LBL_MPA_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MPA_CURD_LBL_MPA_NAME).replace("{1}", "50"),
                    regx: caption.MLP_VALIDATE_REGX_ATTR_NAME
                }
            }
        };
    });
    $rootScope.partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
    $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
    //Miêu tả có thể null, và có chứa được khoảng trắng
    $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
    $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
    $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
    $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
    $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
    $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0
    $rootScope.partternPhone1 = /^([0-9]{9,10})/;

    $rootScope.patternPacking = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z]*(\sx?\s[1-9]{1}[0-9]* [ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z]*)*$/

    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
        var partternTelephone = /[0-9]/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.SupCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_SUPCODE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkDataPrice = function (data) {
        var partternNumber = /^[0-9]\d*(\\d+)?$/;
        var mess = { Status: false, Title: "" }
        if (!partternNumber.test(data.PricePerM)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.MLP_VALIDATE_PERM_VALUE, "<br/>");
        }
        if (!partternNumber.test(data.PricePerM2)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.MLP_VALIDATE_PERM2_VALUE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkDataMore = function (data) {
        var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.AttributeCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
        }
        if (data.Value == null || data.Value == '' || data.Value == undefined) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_VALUE, "<br/>");
        }

        return mess;
    };

    $rootScope.checkValidateValue = function (data) {
        var textStar = "[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*]";
        var textNoStar = "[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*";
        var numberStar = "[0-9_]*[*]";
        var numberNoStar = "[0-9_]*";

        var strGDT = "";
        $rootScope.regexGDT = /^[0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][0-9_]*$/;
        var strSan = "";
        $rootScope.regexSan = /^ [0 -9_] * [*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ - ỹa - zA - Z.0 - 9]* [^ Đđ!@#$ %^&* <>?]*[*][0-9_]*[*][0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
        var strTham = "";
        $rootScope.regexTham = /^[0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][0-9_]*[*][0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][0-9_]*[*][0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
        var strRem = "";
        $rootScope.regexRem = /^[0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][0-9_]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*[*][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;

        var mess = { Status: false, Title: "" }
        switch ($rootScope.groupCode) {
            case "GIAY_DAN_TUONG":
                if (!$rootScope.regexGDT.test(data)) {
                    mess.Status = true;
                    mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_VALUE_FORMAT, "<br/>");
                }
                break;
            case "SAN":
                if (!$rootScope.regexSan.test(data)) {
                    mess.Status = true;
                    mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_VALUE_FORMAT, "<br/>");
                }
                break;
            case "THAM":
                if (!$rootScope.regexTham.test(data)) {
                    mess.Status = true;
                    mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_VALUE_FORMAT, "<br/>");
                }
                break;
            case "REM":
                if (!$rootScope.regexTham.test(data)) {
                    mess.Status = true;
                    mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_VALUE_FORMAT, "<br/>");
                }
                break;
        }

        return mess;
    }

    $rootScope.checkDataMore1 = function (data, tab) {
        var msg = { Status: false, Title: '' }
        if (tab == 0) {
            if (data.AttributeCode == null || data.AttributeCode == '' || data.AttributeCode == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.SUP_CURD_VALIDATE_CODE_PRODUCT;
            }
            if (data.AttributeName == null || data.AttributeName == '' || data.AttributeName == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br>" + caption.SUP_CURD_VALIDATE_NAME_PRODUCT;
            }
            if (data.Value == null || data.Value == '' || data.Value == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.SUP_CURD_VALIDATE_VALUE;
            }
            //35 * 2 * 2 * 2 * 2 * 2 * 2 * Y * Y * Y * Y * Y * Y * Y * Y * Y
        }
        else if (tab == 1) {
            if (data.AttributeCode == null || data.AttributeCode == '' || data.AttributeCode == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + caption.SUP_CURD_VALIDATE_CODE_PRODUCT;
            }
            if (data.AttributeName == null || data.AttributeName == '' || data.AttributeName == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br>" + caption.SUP_CURD_VALIDATE_NAME_PRODUCT;
            }
            if (data.Page == null || data.Page == '' || data.Page == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_PAGE;
            }
            if (data.Category == null || data.Category == '' || data.Category == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_CATEGORY;
            }
            if (data.Length == null || data.Length == '' || data.Length == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_LENGTH;
            }
            if (data.Width == null || data.Width == '' || data.Width == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_WIDTH;
            }
            if (data.Weight == null || data.Weight == '' || data.Weight == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_WEIGTH;
            }
        }
        else if (tab == 2) {
            if (data.AttributeCode == null || data.AttributeCode == '' || data.AttributeCode == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT;
            }
            if (data.AttributeName == null || data.AttributeName == '' || data.AttributeName == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br>" + caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT;
            }
            if (data.Page == null || data.Page == '' || data.Page == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_PAGE;
            }
            if (data.Category == null || data.Category == '' || data.Category == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_CATEGORY;
            }
            if (data.PricePerM == null || data.PricePerM == '' || data.PricePerM == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_PERM;
            }
        }
        else if (tab == 3) {
            if (data.AttributeCode == null || data.AttributeCode == '' || data.AttributeCode == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + caption.MLP_VALIDATE_CODE_PRODUCT_IMPORT;
            }
            if (data.AttributeName == null || data.AttributeName == '' || data.AttributeName == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br>" + caption.MLP_VALIDATE_NAME_PRODUCT_IMPORT;
            }
            if (data.Page == null || data.Page == '' || data.Page == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_PAGE;
            }
            if (data.Category == null || data.Category == '' || data.Category == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_CATEGORY;
            }
            if (data.PricePerM == null || data.PricePerM == '' || data.PricePerM == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_PERM;
            }
            if (data.PricePerM2 == null || data.PricePerM2 == '' || data.PricePerM2 == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_PERM2;
            }
            if (data.Unit == null || data.Unit == '' || data.Unit == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_UNIT_IMPORT;
            }


            if (data.Width == null || data.Width == '' || data.Width == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_WIDTH;
            }
            if (data.Length == null || data.Length == '' || data.Length == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br>" + caption.MLP_VALIDATE_LENGTH;
            }
            if (data.CountPerBox == null || data.CountPerBox == '' || data.CountPerBox == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_PERM;
            }
            if (data.M2PerBox == null || data.M2PerBox == '' || data.M2PerBox == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_PERM2;
            }
            if (data.Deep == null || data.Deep == '' || data.Deep == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_DEEP;
            }
            if (data.TotalDeep == null || data.TotalDeep == '' || data.TotalDeep == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br>" + caption.MLP_VALIDATE_TOTAL;
            }
        }
        else if (tab == 4) {
            if (data.AttributeCode == null || data.AttributeCode == '' || data.AttributeCode == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + caption.MLP_VALIDATE_CODE_CHARACTER_PRODUCT;
            }
            if (data.AttributeName == null || data.AttributeName == '' || data.AttributeName == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + caption.MLP_VALIDATE_NAME_PRODUCT;
            }
            if (data.Page == null || data.Page == '' || data.Page == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br>" + caption.MLP_VALIDATE_PAGE;
            }
            if (data.Category == null || data.Category == '' || data.Category == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_CATEGORY;
            }
            if (data.PricePerM == null || data.PricePerM == '' || data.PricePerM == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_PERM_VALUE;
            }
            if (data.PricePerM2 == null || data.PricePerM2 == '' || data.PricePerM2 == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br>" + caption.MLP_VALIDATE_PERM2_VALUE;
            }
            if (data.Unit == null || data.Unit == '' || data.Unit == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_UNIT_IMPORT;
            }
            if (data.Width == null || data.Width == '' || data.Width == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_WIDTH;
            }
            if (data.Deep == null || data.Deep == '' || data.Deep == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_DEEP;
            }
            if (data.Weight == null || data.Weight == '' || data.Weight == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_WEIGTH;
            }
            if (data.VerticalStroke == null || data.VerticalStroke == '' || data.VerticalStroke == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_VERTICALSTROKE;
            }
            if (data.HorizontalStroke == null || data.HorizontalStroke == '' || data.HorizontalStroke == undefined) {
                msg.Status = true;
                msg.Title = msg.Title + "</br> " + caption.MLP_VALIDATE_HORIZONTALSTROKE;
            }
        }
        return msg;
    }
    $rootScope.checkDataContact = function (data) {
        var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.ext_code)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.SUP_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
        }
        return mess;
    }
    $rootScope.checkTelephone = function (data) {
        var partternTelephone = /[0-9]/g;
        var mess = { Status: false, Title: "" };
        if (!partternTelephone.test(data) && data != null) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.MLP_VALIDATE_NUMBER_PHONE, "<br/>");
        }
        return mess;
    }
    dataserviceMaterial.getListStatus(function (result) {
        result = result.data;

        $rootScope.StatusData = result;
    });
    //$rootScope.StatusData = [{
    //    Code: true,
    //    Name: 'Đang sản xuất'
    //}, {
    //    Code: false,
    //    Name: 'Dừng sản xuất'
    //}];

    $rootScope.antiMolds = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.antiFoulings = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.antiBacterias = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.deodorants = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.humidityControls = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.hardPaperSurfaces = [{
        Code: 'Y',
        Name: 'Đúng'
    }, {
        Code: '_',
        Name: 'Sai'
    }];
    $rootScope.fireSpreads = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.eSekous = [{
        Code: 'Y',
        Name: 'Đúng'
    }, {
        Code: '_',
        Name: 'Sai'
    }];

    $rootScope.sx2021s = [{
        Code: 'Y',
        Name: 'Đúng'
    }, {
        Code: '_',
        Name: 'Sai'
    }];
    $rootScope.formaldehydes = [{
        Code: 'Ｆ☆☆☆☆',
        Name: 'Ｆ☆☆☆☆'
    }, {
        Code: 'Ｆ☆☆☆',
        Name: 'Ｆ☆☆☆'
    }, {
        Code: 'Ｆ☆☆',
        Name: 'Ｆ☆☆'
    }, {
        Code: 'Ｆ☆',
        Name: 'Ｆ☆'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.friendlys = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.ECO_MARKs = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.JISs = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];

    $rootScope.CRIs = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];

    $rootScope.travelDensitys = [{
        Code: 'Heavy',
        Name: 'Đông người'
    }, {
        Code: 'Medium',
        Name: 'Thông thường'
    }, {
        Code: 'Low',
        Name: 'Thấp'
    }, {
        Code: '_',
        Name: 'Không xác định'
    }];
    $rootScope.antistatics = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.chemicalResistances = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];

    $rootScope.waxs = [{
        Code: 'Y',
        Name: 'Có'
    }, {
        Code: '_',
        Name: 'Không'
    }];

    $rootScope.outSides = [{
        Code: 'Y',
        Name: 'Được'
    }, {
        Code: '_',
        Name: 'Không'
    }];
    $rootScope.antiShocks = [{
        Code: 'Y',
        Name: 'Được'
    }, {
        Code: '_',
        Name: 'Không'
    }];

    $rootScope.objectMovings = [{
        Code: 'Y',
        Name: 'Được'
    }, {
        Code: '_',
        Name: 'Không'
    }];

    $rootScope.isAdd = true;
    $rootScope.groupCode = "";
    $rootScope.structNote = "";
    $rootScope.space = " ";
    $rootScope.plus = "x";

    $rootScope.listDataType = [{
        Code: 'NUMBER',
        Name: 'Số'
    }, {
        Code: 'TEXT',
        Name: 'Chữ'
    },
    {
        Code: 'MONEY',
        Name: 'Tiền tệ'
    }];

    $rootScope.listUnit = [{
        Code: 'BO',
        Name: 'Bộ'
    }, {
        Code: 'CAI',
        Name: 'Cái'
    }, {
        Code: 'CHIEC',
        Name: 'Chiếc'
    }];

    $rootScope.listGroup = [{
        Code: 'GROUP_1',
        Name: 'Nhóm linh kiện'
    }, {
        Code: 'GROUP_2',
        Name: 'Nhóm vật dụng'
    }];

    $rootScope.jsonSpecification = function (str) {
        var A = {
            Key: '',
            Value: ''
        };
        var B = {
            Key: '',
            Value: ''
        };
        var C = {
            Key: '',
            Value: ''
        };
        var D = {
            Key: '',
            Value: ''
        };

        if (str !== undefined && str !== null && str !== '') {
            var arr = str.split('x');

            for (var i = 0; i < arr.length; i++) {
                arr[i] = arr[i].trim();
            }

            if (arr[0].split(' ')[0] !== undefined && arr[0].split(' ')[0] !== null)
                A.Key = arr[0].split(' ')[0];

            if (arr.length >= 2)
                if (arr[1].split(' ')[1] !== undefined && arr[1].split(' ')[1] !== null) {
                    B.Key = arr[1].split(' ')[1];
                    B.Value = arr[1].split(' ')[0];
                }
            if (arr.length >= 3)
                if (arr[2].split(' ')[1] !== undefined && arr[2].split(' ')[1] !== null) {
                    C.Key = arr[2].split(' ')[1];
                    C.Value = arr[2].split(' ')[0];
                }
            if (arr.length >= 4)
                if (arr[3].split(' ')[1] !== undefined && arr[3].split(' ')[1] !== null) {
                    D.Key = arr[3].split(' ')[1];
                    D.Value = arr[3].split(' ')[0];
                }
        }

        var obj = {
            A: A,
            B: B,
            C: C,
            D: D
        };

        return obj;
    }
    $rootScope.ObjectTypeFile = "PRODUCT";
    $rootScope.moduleName = "PRODUCT";
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider, $locationProvider) {
    $translateProvider.useUrlLoader('/Admin/materialProduct/Translation');
    caption = $translateProvider.translations();
    $locationProvider.hashPrefix('');

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderMaterialProd + '/indexTree.html',
            controller: 'indexTree'
        })
        .when('/table', {
            templateUrl: ctxfolderMaterialProd + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolderMaterialProd + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderMaterialProd + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolderMaterialProd + '/detail.html',
            controller: 'detail'
        })

    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, $http, $q, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterial, $translate) {
    $scope.model = {
        Code: '',
        Name: '',
        FromTo: '',
        DateTo: '',
        Group: '',
        Type: '',
        Status: '',
        Catalogue: '',
    }
    $rootScope.Statuss = [{
        Code: "true",
        Name: 'Đang sản xuất'
    }, {
        Code: "false",
        Name: 'Dừng sản xuất'
    }];

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialProduct/Jtable",
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
                d.ListGroup = [];
                d.Group = $scope.model.Group;
                d.Type = $scope.model.Type;
                d.Status = $scope.model.Status;
                d.Catalogue = $scope.model.Catalogue;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            //double click trên 1 dòng
            if ($rootScope.PERMISSION_MATERIAL_PRODUCT.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {

                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var row = $(evt.target).closest('tr');
                        // data key value
                        var key = row.attr("data-id");
                        // cell values
                        var Id = row.find('td:eq(1)').text();
                        if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                            //$scope.selected[data.id] = !$scope.selected[data.id];
                        } else {
                            //var self = $(this).parent();
                            //$('#tblData').DataTable().$('tr.selected').removeClass('selected');
                            //$scope.selected.forEach(function (obj, index) {
                            //    if ($scope.selected[index])
                            //        $scope.selected[index] = false;
                            //});
                            //$(self).addClass('selected');
                            //$scope.selected[data.id] = true;

                            if (evt.target.localName == 'img') {
                                if (data.pathimg != '') {
                                    var modalInstance = $uibModal.open({
                                        animation: true,
                                        templateUrl: ctxfolderMaterialProd + '/slideImage.html',
                                        controller: 'slideImage',
                                        backdrop: 'static',
                                        size: '60',
                                        resolve: {
                                            para: function () {
                                                return data.pathimg;
                                            }
                                        }
                                    });
                                }
                                else {
                                    App.toastrError(caption.MLP_MSG_NOT_IMG);
                                }
                            } else {
                                var id = data.id;
                                $scope.edit(id);
                            }
                        }
                        $scope.$apply();
                    }
                });
            }
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('productcode').withTitle('{{"MLP_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'fw600 fs20'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productname').withTitle('{{"MLP_LIST_COL_PRODUCTNAME" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'fw600 fs20'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('serial').withTitle('Serial').renderWith(function (data, type) {
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
        return '<img class="img-responsive img-250" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('material').withTitle('Chất liệu').renderWith(function (data, type) {
    //        return data;
    //    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('pattern').withTitle('Hoa văn').renderWith(function (data, type) {
    //        return data;
    //    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('size').withTitle('Kích thước').renderWith(function (data, type) {
    //        return data;
    //    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withTitle('{{"MLP_LIST_COL_NOTEE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sQrCode').withTitle('{{"MLP_LIST_COL_QRCODE" | translate}}').renderWith(function (data, type) {
        if (removeQuote(data) != "") {
            return '<qrcode role="button" ng-click="viewQrCode(\'' + removeQuote(data) + '\')" data=' + data + ' size="60"></qrcode>';
        }
        else {
            return '<qrcode role="button" ng-click="viewQrCodeBase(\'' + removeQuote(data) + '\')" data=' + data + ' size="60"></qrcode>';

        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w50 nowrap').withTitle('{{"MLP_CURD_LBL_PROPETIES_ACTION" | translate}}').renderWith(function (data, type, full) {
        var listButton = '';
        if ($rootScope.PERMISSION_MATERIAL_PRODUCT.Update) {
            listButton += '<a ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>';
        }
        if ($rootScope.PERMISSION_MATERIAL_PRODUCT.Delete) {
            listButton += '<a ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
        }
        return listButton;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('sBarCode').withTitle('{{"MLP_LIST_COL_BARCODE" | translate}}').renderWith(function (data, type) {
    //    return '<img ng-click="viewBarCode(\'' + data + '\')" class="image-upload" role="button" src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="50" width="auto">';
    //}));
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
    $rootScope.reloadBase = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataserviceMaterial.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result;
        });
        dataserviceMaterial.getproductgroup(function (result) {
            result = result.data;
            $scope.productGroups = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.productGroups.unshift(all)
        });
        $rootScope.ProductCode = '';
        dataserviceMaterial.getProductTypes(function (result) {
            result = result.data;
            $scope.productTypes = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.productTypes.unshift(all)
        });
        dataserviceMaterial.getListCatalogue(function (result) {
            result = result.data;
            $scope.listCatalogue = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listCatalogue.unshift(all)
        });
        dataserviceMaterial.getListStatus(function (result) {
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

    $scope.add = function () {
        $rootScope.ProductCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaterialProd + '/add.html',
            controller: 'addMaterialProd',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return null;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {

        dataserviceMaterial.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                //$scope.model = rs;
                $rootScope.ProductID = rs.Id;
                $rootScope.ProductCode = rs.ProductCode;
                $rootScope.ObjCode = rs.ProductCode;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaterialProd + '/edit.html',
                    controller: 'editProd',
                    backdrop: 'static',
                    size: '65',
                    resolve: {
                        para: function () {
                            return rs;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaterial.delete(id, function (rs) {
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
    $scope.viewTree = function () {
        location.href = '/Admin/MaterialProduct';
    }

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

    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    $scope.viewQrCodeBase = function (code) {
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
    $scope.viewBarCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/brViewerBase64.html',
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    //Print
    $scope.print = function () {
        location.href = '/Admin/ProductQRCodeManager';
        // var listData = $('#tblData').DataTable().data();
        // var listPromise = [];
        // for (var i = 0; i < listData.length; i++) {
        //     var code = listData[i].productcode;
        //     listPromise.push($http.post('/Admin/EDMSWareHouseManager/GenQRCode?code=' + code));
        // }
        // $q.all(listPromise).then(result => {
        //     var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
        //     var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
        //     var content = '';
        //     for (var i = 0; i < listData.length; i++) {
        //         $scope.QR_CODE = result[i].data;
        //         if ($scope.QR_CODE != '') {
        //             var div = '<div style="display: inline-block; width: 125px">';
        //             var image = '<img src="data:image/png;base64,' + $scope.QR_CODE + '" width="125" height="125" /> ';
        //             div += image;
        //             div += `<div style="width: 110px; padding-left: 10px; text-align: center; font-size: 12px; word-break: break-all;">${i + 1}.${listData[i].productcode}</div>`;
        //             div += '</div>';
        //             content += div;
        //         } else {
        //             App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        //         }
        //     }
        //     doc.write('<style>@page{margin:0;size: auto;}' +
        //         '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + content + '</body>');
        //     doc.close();
        //     setTimeout(function () {
        //         hiddenFrame.contentWindow.print();
        //     }, 250);
        // })
    }

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
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#DateTo').datepicker('setStartDate', date);
            }
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#DateTo').datepicker('setStartDate', null);
        });
        //$('#FromTo').datepicker('setEndDate', $rootScope.DateNow);
        //$('#DateTo').datepicker('setStartDate', $rootScope.DateBeforeSevenDay);
        //$('#FromTo').datepicker('update', $rootScope.DateBeforeSevenDay);
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
    }

    $scope.exportExcel = function () {
        dataserviceMaterial.exportExcel($scope.model, function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            download(rs.fileName, '/' + rs.pathFile);
        });
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

    setTimeout(function () {
        loadDate();
    }, 50);
    function removeQuote(str) {
        str = str.replaceAll("'", '');
        str = str.replaceAll('"', '');
        return str;
    }
});

app.controller('indexTree', function ($scope, $rootScope, $compile, $uibModal, $http, $q, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterial, $translate) {
    $rootScope.isAllData = 'True';
    $scope.model = {
        Code: '',
        Name: '',
        FromTo: '',
        DateTo: '',
        Group: '',
        ListGroup: [],
        Type: '',
        Status: '',
        Catalogue: '',
        SupCode: '',
        CusCode: '',
    }
    $rootScope.Statuss = [{
        Code: "true",
        Name: 'Đang sản xuất'
    }, {
        Code: "false",
        Name: 'Dừng sản xuất'
    }]

    var vm = $scope;
    $scope.treeData = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialProduct/Jtable",
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
                if ($scope.model.Group) {
                    d.ListGroup = [$scope.model.Group];
                }
                else {
                    d.ListGroup = $scope.model.ListGroup;
                }
                d.Group = $scope.model.Group;
                d.Type = $scope.model.Type;
                d.Status = $scope.model.Status;
                d.Catalogue = $scope.model.Catalogue;
                d.CusCode = $scope.model.CusCode;
                d.SupCode = $scope.model.SupCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableViewportManual(220, "#tblData");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            //double click trên 1 dòng
            if ($rootScope.PERMISSION_MATERIAL_PRODUCT.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {

                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var row = $(evt.target).closest('tr');
                        // data key value
                        var key = row.attr("data-id");
                        // cell values
                        var Id = row.find('td:eq(1)').text();
                        if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                            //$scope.selected[data.id] = !$scope.selected[data.id];
                        } else {
                            //var self = $(this).parent();
                            //$('#tblData').DataTable().$('tr.selected').removeClass('selected');
                            //$scope.selected.forEach(function (obj, index) {
                            //    if ($scope.selected[index])
                            //        $scope.selected[index] = false;
                            //});
                            //$(self).addClass('selected');
                            //$scope.selected[data.id] = true;

                            if (evt.target.localName == 'img') {
                                if (data.pathimg != '') {
                                    var modalInstance = $uibModal.open({
                                        animation: true,
                                        templateUrl: ctxfolderMaterialProd + '/slideImage.html',
                                        controller: 'slideImage',
                                        backdrop: 'static',
                                        size: '60',
                                        resolve: {
                                            para: function () {
                                                return data.pathimg;
                                            }
                                        }
                                    });
                                }
                                else {
                                    App.toastrError(caption.MLP_MSG_NOT_IMG);
                                }
                            } else {
                                var id = data.id;
                                $scope.edit(id);
                            }
                        }
                        $scope.$apply();
                    }
                });
            }
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('productcode').withTitle('{{"MLP_LIST_COL_PRODUCT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'fw600 fs20'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('productname').withTitle('{{"MLP_LIST_COL_PRODUCTNAME" | translate}}').renderWith(function (data, type, full) {
        let jsonStatus = [];
        try {
            jsonStatus = JSON.parse(full.jsonStatus);
            console.log(jsonStatus.length);
        } catch (error) {
            console.log(error);
        }
        let res = `<b>${data}</b>`;
        console.log(jsonStatus);
        if (jsonStatus.length > 0) {
            const lastLog = jsonStatus[jsonStatus.length - 1];
            if (lastLog.MappingCode) {
                res += `<br /><span class="color-dark fs10 d-flex"><span class="nowrap">- {{'Vị trí' | translate}}:&nbsp;</span><span style="word-break: break-all">${lastLog.MappingCode}</span></span>`;
            }
            if (lastLog.CusCode) {
                res += `<br /><span class="color-dark fs10">- {{'Khách hàng' | translate}}: ${full.cusName} ( ${lastLog.CusCode} )</span>`;
            }
            if (lastLog.SupCode) {
                res += `<br /><span class="color-dark fs10">- {{'Nhà cung cấp' | translate}}: ${full.supName} ( ${lastLog.SupCode} )</span>`;
            }
        }
        return res;
        // return `${full.ProductName} (${full.ProductCode})
        // <br /><span class="text-primary fs10">- {{'MIS_CURD_TAB_SPECFICATION' | translate}}: ${full.PackType}</span>
        // <br /><span class="text-primary fs10">- {{'Id' | translate}}: ${full.Id}</span>
        // <br /><span class="text-primary fs10">- {{'Serial' | translate}}: ${full.Serial}</span>`;
    }).withOption('sClass', 'fw600 fs20'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('serial').withTitle('Serial').renderWith(function (data, type) {
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
        return '<img class="img-responsive img-250" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('material').withTitle('Chất liệu').renderWith(function (data, type) {
    //        return data;
    //    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('pattern').withTitle('Hoa văn').renderWith(function (data, type) {
    //        return data;
    //    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('size').withTitle('Kích thước').renderWith(function (data, type) {
    //        return data;
    //    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('note').withTitle('{{"MLP_LIST_COL_NOTEE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('sQrCode').withTitle('{{"MLP_LIST_COL_QRCODE" | translate}}').renderWith(function (data, type) {
        if (removeQuote(data) != "") {
            return '<qrcode role="button" ng-click="viewQrCode(\'' + removeQuote(data) + '\')" data=' + data + ' size="60"></qrcode>';
        }
        else {
            return '<qrcode role="button" ng-click="viewQrCodeBase(\'' + removeQuote(data) + '\')" data=' + data + ' size="60"></qrcode>';

        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w50 nowrap').withTitle('{{"MLP_CURD_LBL_PROPETIES_ACTION" | translate}}').renderWith(function (data, type, full) {
        var listButton = '';
        if ($rootScope.PERMISSION_MATERIAL_PRODUCT.Update) {
            listButton += '<a ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>';
        }
        if ($rootScope.PERMISSION_MATERIAL_PRODUCT.Delete) {
            listButton += '<a ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
        }
        return listButton;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('sBarCode').withTitle('{{"MLP_LIST_COL_BARCODE" | translate}}').renderWith(function (data, type) {
    //    return '<img ng-click="viewBarCode(\'' + data + '\')" class="image-upload" role="button" src="data:image/png;base64,' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="50" width="auto">';
    //}));
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
    $rootScope.reloadBase = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataserviceMaterial.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result;
        });
        dataserviceMaterial.getListSupplier(function (rs) {
            rs = rs.data;
            $scope.listSupplier = rs;
        });
        
        dataserviceMaterial.getListCustommer(function (rs) {
            rs = rs.data;
            $scope.listCustomer = rs;
        });
        dataserviceMaterial.getproductgroup(function (result) {
            result = result.data;
            $scope.productGroups = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.productGroups.unshift(all)
        });
        $rootScope.ProductCode = '';
        dataserviceMaterial.getProductTypes(function (result) {
            result = result.data;
            $scope.productTypes = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.productTypes.unshift(all)
        });
        dataserviceMaterial.getListCatalogue(function (result) {
            result = result.data;
            $scope.listCatalogue = result;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listCatalogue.unshift(all)
        });
        dataserviceMaterial.getListStatus(function (result) {
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

    $scope.add = function () {
        $rootScope.ProductCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaterialProd + '/add.html',
            controller: 'addMaterialProd',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return null;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {

        dataserviceMaterial.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                //$scope.model = rs;
                $rootScope.ProductID = rs.Id;
                $rootScope.ProductCode = rs.ProductCode;
                $rootScope.ObjCode = rs.ProductCode;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaterialProd + '/edit.html',
                    controller: 'editProd',
                    backdrop: 'static',
                    size: '65',
                    resolve: {
                        para: function () {
                            return rs;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaterial.delete(id, function (rs) {
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
    $scope.viewTable = function () {
        location.href = '/Admin/MaterialProduct#table';
    }

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

    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    $scope.viewQrCodeBase = function (code) {
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
    $scope.viewBarCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/brViewerBase64.html',
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    //Print
    $scope.print = function () {
        location.href = '/Admin/ProductQRCodeManager';
        // var listData = $('#tblData').DataTable().data();
        // var listPromise = [];
        // for (var i = 0; i < listData.length; i++) {
        //     var code = listData[i].productcode;
        //     listPromise.push($http.post('/Admin/EDMSWareHouseManager/GenQRCode?code=' + code));
        // }
        // $q.all(listPromise).then(result => {
        //     var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
        //     var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
        //     var content = '';
        //     for (var i = 0; i < listData.length; i++) {
        //         $scope.QR_CODE = result[i].data;
        //         if ($scope.QR_CODE != '') {
        //             var div = '<div style="display: inline-block; width: 125px">';
        //             var image = '<img src="data:image/png;base64,' + $scope.QR_CODE + '" width="125" height="125" /> ';
        //             div += image;
        //             div += `<div style="width: 110px; padding-left: 10px; text-align: center; font-size: 12px; word-break: break-all;">${i + 1}.${listData[i].productcode}</div>`;
        //             div += '</div>';
        //             content += div;
        //         } else {
        //             App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        //         }
        //     }
        //     doc.write('<style>@page{margin:0;size: auto;}' +
        //         '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + content + '</body>');
        //     doc.close();
        //     setTimeout(function () {
        //         hiddenFrame.contentWindow.print();
        //     }, 250);
        // })
    }

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
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#DateTo').datepicker('setStartDate', date);
            }
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#DateTo').datepicker('setStartDate', null);
        });
        //$('#FromTo').datepicker('setEndDate', $rootScope.DateNow);
        //$('#DateTo').datepicker('setStartDate', $rootScope.DateBeforeSevenDay);
        //$('#FromTo').datepicker('update', $rootScope.DateBeforeSevenDay);
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
    }

    $scope.exportExcel = function () {
        dataserviceMaterial.exportExcel($scope.model, function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            download(rs.fileName, '/' + rs.pathFile);
        });
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

    setTimeout(function () {
        loadDate();
    }, 50);
    function removeQuote(str) {
        str = str.replaceAll("'", '');
        str = str.replaceAll('"', '');
        return str;
    }

    //treeview
    var nodeBefore = "";
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataserviceMaterial.getTreeDataParent(function (result) {
            result = result.data;

            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: "Tất cả nhóm sản phẩm",//"Tất cả kho dữ liệu"
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeData.push(root);
                var index = 0;
                result = result.Object;
                $scope.ListParent = result.filter(function (item) {
                    return (item.ParentCode == null);
                });
                for (var i = 0; i < result.length; i++) {
                    if (result[i].ParentCode == null) {
                        var stt = $scope.ListParent.length - index;
                        if (stt.toString().length == 1) {
                            stt = "0" + stt;
                        }
                        index = index + 1;
                        var data = {
                            id: result[i].Id,
                            parent: 'root',
                            text: stt + ' - ' + result[i].Title,
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    } else {
                        var data = {
                            id: result[i].Id,
                            parent: result[i].ParentCode,
                            text: result[i].Code + ' - ' + result[i].Title,
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }

    $scope.selectNodeRepository = function (e, data) {
        var listSelect = [];
        var idCurrentNode = data.node.id;
        var codeCurrentNote = data.node.catCode;
        if (nodeBefore != idCurrentNode) {
            $("#" + nodeBefore + "_anchor").removeClass('bold');

            nodeBefore = idCurrentNode;
            $scope.recentFile = false;
            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].original.catCode);
            }
            $scope.model.ListGroup = listSelect;
            $scope.reload();
        }
        else {
            $scope.recentFile = false;
            listSelect = [];
            $("#" + idCurrentNode + "_anchor").addClass('bold');
            listSelect.push(codeCurrentNote);
            $scope.model.ListGroup = listSelect;
            $scope.reload();
        }
    }

    $scope.deselectNodeRepository = function (e, data) {
        $scope.recentFile = false;
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length > 0) {
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].original.catCode);
                dataserviceMaterial.getTreeInNode(listNoteSelect[i].id, function (rs) {
                    rs = rs.data;
                    if (rs.length > 0) {
                        for (var i = 0; i < rs.length; i++) {
                            listSelect.push(rs[i].Code);
                        }
                    }
                    $scope.model.ListGroup = listSelect;
                    $scope.reload();
                })
            }
        } else {
            $scope.model.ListGroup = listSelect;
            $scope.reload();
        }


    }
    $scope.treeConfig = {
        core: {
            multiple: true,
            animation: true,
            error: function (error) {
                //$log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
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
        plugins: ['checkbox', 'types', 'contextmenu'],
        checkbox: {
            "three_state": false,
            "whole_node": false,
            "keep_selected_style": false,
            "cascade": "undetermined",
        },
        contextmenu: {
            items: customMenu
        }
    };

    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'deselect_node': $scope.deselectNodeRepository,
    };

    $scope.ac = function () {
        return true;
    }

    function customMenu(node) {
        var items = {};

        items = {
                'item1': {
                    'label': caption.COM_BTN_EDIT,
                    'icon': "fa fa-edit",
                    'action': function (data) {
                        //if ((isAllData !== 'True')) {
                        //    return App.toastrError('Bạn không có quyền được sửa nhóm sp');
                        //}

                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolderGroup + '/edit.html',
                            controller: 'editGroup',
                            backdrop: 'static',
                            size: '40',
                            resolve: {
                                para: function () {
                                    return node.original.catId;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $('#treeDiv').jstree(true).refresh();
                            setTimeout(function () {
                                $scope.readyCB();
                            }, 200);
                        }, function () {
                        });
                        //dataserviceMaterial.getItemGroup(node.original.catId, function (rs) {
                        //    rs = rs.data;
                        //    if (rs.Error) {
                        //        App.toastrError(rs.Title);
                        //    } else {
                        //        var modalInstance = $uibModal.open({
                        //            animation: true,
                        //            templateUrl: ctxfolderRepository + '/editCategory.html',
                        //            controller: 'editCategory',
                        //            backdrop: 'static',
                        //            size: '80',
                        //            resolve: {
                        //                para: function () {
                        //                    return rs.Object;
                        //                }
                        //            }
                        //        });
                        //        modalInstance.result.then(function (d) {
                        //            $('#treeDiv').jstree(true).refresh();
                        //            setTimeout(function () {
                        //                $scope.readyCB();
                        //            }, 200);
                        //        }, function () {
                        //        });
                        //    }
                        //})
                    }
                },
                'item2': {
                    'label': caption.COM_BTN_DELETE,
                    'icon': "fa fa-trash",
                    'action': function (data) {
                        var modalInstance = $uibModal.open({
                            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                            windowClass: "message-center",
                            resolve: {
                                para: function () {
                                    return node.original.catId;
                                }
                            },
                            controller: function ($scope, $uibModalInstance, para) {
                                $scope.message = 'Bạn có muốn xóa nhóm sản phẩm';
                                $scope.ok = function () {
                                    dataserviceMaterial.deleteGroup(para, function (rs) {
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
                            $('#treeDiv').jstree(true).refresh();
                            setTimeout(function () {
                                $scope.readyCB();
                                $scope.reload();
                            }, 200);
                        }, function () {
                        });
                    }
                }
            };

        return items;
    }

    $scope.selectObjectType = function (objectType) {
        reloadData(true);
    }

    $scope.selectObjectCode = function (item) {
        $scope.model.ObjectType = item.ObjectType;
        reloadData(true);
    }

    $scope.resetObjectType = function () {
        //reloadObject('');
        reloadData(true);
    }

    $scope.addGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderGroup + '/add.html',
            controller: 'addGroup',
            backdrop: 'static',
            size: '40',
        });
        modalInstance.result.then(function (d) {
            $('#treeDiv').jstree(true).refresh();
            setTimeout(function () {
                $scope.readyCB();
            }, 200);
        }, function () {
        });
    }

    //$scope.deleteGroup = function () {
    //    var listSelect = [];
    //    var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
    //    for (var i = 0; i < listNoteSelect.length; i++) {
    //        listSelect.push(listNoteSelect[i].id);
    //    }
    //    if (listSelect.length == 0) {
    //        App.toastrError(caption.EDMSR_MSG_SELECT_CATEGORIES);
    //    } else if (listSelect.length > 1) {
    //        App.toastrError(caption.EDMSR_MSG_SELECT_A_CATEGORIES);
    //    } else {
    //        var modalInstance = $uibModal.open({
    //            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
    //            windowClass: "message-center",
    //            resolve: {
    //                para: function () {
    //                    return listSelect[0];
    //                }
    //            },
    //            controller: function ($scope, $uibModalInstance, para) {
    //                $scope.message = caption.EDMSR_MSG_DELETE_CATEGORIES;
    //                $scope.ok = function () {
    //                    dataserviceRepository.deleteCategory(para, function (rs) {
    //                        rs = rs.data;
    //                        if (rs.Error) {
    //                            App.toastrError(rs.Title);
    //                        } else {
    //                            App.toastrSuccess(rs.Title);
    //                            $uibModalInstance.close();
    //                        }
    //                    });
    //                };

    //                $scope.cancel = function () {
    //                    $uibModalInstance.dismiss('cancel');
    //                };
    //            },
    //            size: '25',
    //        });
    //        modalInstance.result.then(function (d) {
    //            $('#treeDiv').jstree(true).refresh();
    //            setTimeout(function () {
    //                $scope.readyCB();
    //                $scope.reload();
    //            }, 200);
    //        }, function () {
    //        });
    //    }
    //}
});

app.controller('addMaterialProd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter, para) {
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    $scope.isEdit = false;
    $rootScope.ProductCode = '';
    $scope.inheritances = [];
    $scope.productCategoryTypes = [];
    $scope.productTypes = [];
    $scope.productImpType = [];
    $rootScope.ProductID = '';
    $scope.model = {
        FileName: '',
        ProductGroup: '',
        Unit: '',
        ProductCode: '',
        TypeCode: '',
        GroupCode: '',
        PricePerM: 0,
        PricePerM2: 0,
        ForecastInStock: 0,
        sForeCastTime: '',
        Status: $rootScope.StatusData.length > 0 ? $rootScope.StatusData[0].Code : "",
        Json: '',
        Packing: '',
        Serial: ''
    };
    $rootScope.isShowInheritance = true;
    //$scope.ImageBase1 = $rootScope.BarDefault;
    //$scope.ImageBase = $rootScope.QrDefault;
    $scope.ImageBase = '';
    $scope.ImageBase1 = '';
    $scope.initData = function () {
        dataserviceMaterial.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result;
        });
        dataserviceMaterial.getProductImpType(function (result) {
            result = result.data;
            $scope.productImpType = result;
        });
        dataserviceMaterial.getListBrand(function (result) {
            result = result.data;
            $scope.listBrand = result;
        });
        dataserviceMaterial.getListSupplier(function (result) {
            result = result.data;
            $scope.listSupplier = result;
        });
        dataserviceMaterial.getproductgroup(function (result) {
            result = result.data;
            $scope.productgroup = result;
        });
        dataserviceMaterial.getInheritances($scope.model.ProductCode, function (result) {
            result = result.data;
            $scope.inheritances = result;
        });
        dataserviceMaterial.getProductTypes(function (result) {
            result = result.data;
            $scope.productTypes = result;
        });
        if (para != null) {
            $scope.model = para;
        };
        dataserviceMaterial.getUnitWeight(function (rs) {
            rs = rs.data;
            $scope.listUnitWeight = rs;
        })
    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        //if (data.Unit == "" || data.Unit == null) {
        //    $scope.errorUnit = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorUnit = false;
        //}
        //if (data.ImpType == "" || data.ImpType == null) {
        //    $scope.errorImpType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorImpType = false;
        //}
        if (data.GroupCode == "" || data.GroupCode == null) {
            $scope.errorGroupCode = true;
            mess.Status = true;
        } else {
            $scope.errorGroupCode = false;
        }
        if (data.TypeCode == "") {
            $scope.errorTypeCode = true;
            mess.Status = true;
        } else {
            $scope.errorTypeCode = false;
        }

        if (data.Packing == '' || $rootScope.patternPacking.test(data.Packing)) {
            $scope.errorPacking = false;
        } else {
            mess.Status = true;
            $scope.errorPacking = true;
        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ProductGroup" && $scope.model.ProductGroup != "") {
            $scope.errorProductGroup = false;
        }
        if (SelectType == "Unit" && $scope.model.Unit != "") {
            $scope.errorUnit = false;
        }
        if (SelectType == "ImpType" && $scope.model.ImpType != "") {
            $scope.errorImpType = false;
        }
        if (SelectType == "Inheritance" && $scope.model.Inheritance != "") {
            dataserviceMaterial.getInheritancesDetail($scope.model.Inheritance, function (result) {
                result = result.data;

                $scope.model.GroupCode = result[0].GroupCode;
                $scope.model.TypeCode = result[0].TypeCode;
                $scope.model.Unit = result[0].Unit;
                $scope.model.Material = result[0].Material;
                $scope.model.Pattern = result[0].Pattern;
                $scope.model.Wide = result[0].Wide;
                $scope.model.High = result[0].High;
                $scope.model.Note = result[0].Note;
                //$scope.model.ProductCode = sProductCode;
                //$scope.model.ProductName = sProductName;
            });
        }
        if (SelectType == "GroupCode" && $scope.model.GroupCode != "") {
            $scope.errorGroupCode = false;
            $rootScope.groupCode = $scope.model.GroupCode;
        }
        if (SelectType == "TypeCode" && $scope.model.TypeCode != "") {
            $scope.errorTypeCode = false;
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
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItem'].getData();
            $scope.model.Description = data;
        }

        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            //var msgPrice = $rootScope.checkDataPrice($scope.model);
            //if (msgPrice.Status) {
            //    App.toastrError(msgPrice.Title);
            //    return;
            //}

            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataserviceMaterial.uploadImage(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Image = '/uploads/images/' + rs.Object;
                                            if ($rootScope.ProductCode == '') {
                                                dataserviceMaterial.insert($scope.model, function (rs) {
                                                    rs = rs.data;
                                                    if (rs.Error) {
                                                        App.toastrError(rs.Title);

                                                    } else {
                                                        App.toastrSuccess(rs.Title);
                                                        $scope.model = rs.Object;
                                                        $rootScope.groupCode = $scope.model.GroupCode;
                                                        $rootScope.ProductID = $scope.model.Id;
                                                        $rootScope.ProductCode = $scope.model.ProductCode;
                                                    }
                                                });
                                            } else {
                                                dataserviceMaterial.update($scope.model, function (rs) {
                                                    rs = rs.data;
                                                    if (rs.Error) {
                                                        App.toastrError(rs.Title);
                                                    } else {
                                                        App.toastrSuccess(rs.Title);
                                                    }
                                                });
                                            }
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                if ($rootScope.ProductCode === '') {
                    $scope.model.Json = JSON.stringify($rootScope.jsonSpecification($scope.model.Packing));
                    dataserviceMaterial.insert($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $scope.model = rs.Object;
                            $rootScope.groupCode = $scope.model.GroupCode;
                            $rootScope.ProductID = $scope.model.Id;
                            $rootScope.ProductCode = $scope.model.ProductCode;
                            $rootScope.Inheritance = $scope.model.Inheritance;
                            $rootScope.ObjCode = $scope.model.ProductCode;
                            $uibModalInstance.close();
                        }
                    });
                } else {
                    $scope.model.Json = JSON.stringify($rootScope.jsonSpecification($scope.model.Packing));
                    dataserviceMaterial.update($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                        }
                    });
                }
            }
        }
    }
    $scope.addGroup = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMaterialProd + '/productGroupAdd.html',
            controller: 'addProductGroup',
            size: '40',
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getproductgroup(function (rs) {
                rs = rs.data;
                $scope.productgroup = rs;
            });
        }, function () {
        });
    }
    $scope.addBrand = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRODUCT_BRAND',
                        GroupNote: 'Thương hiệu',
                        AssetCode: 'PRODUCT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getListBrand(function (result) {
                result = result.data;
                $scope.listBrand = result;
            });

        }, function () { });
    }
    $scope.addUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'UNIT',
                        GroupNote: 'Đơn vị sản phẩm',
                        AssetCode: 'WAREHOUSE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.gettreedataLevel(function (result) {
                result = result.data;
                $scope.treedataLevel = result;
            });
        }, function () { });
    }
    $scope.addProductImpType = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRODUCT_IMP_TYPE',
                        GroupNote: 'Loại hình nhập kho',
                        AssetCode: 'MATERIAL_PRODUCT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getProductImpType(function (result) {
                result = result.data;
                $scope.productImpType = result;
            });
        }, function () { });
    }
    $scope.addStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CAT_STATUS',
                        GroupNote: 'Trạng thái sản phẩm',
                        AssetCode: 'WAREHOUSE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getListStatus(function (result) {
                result = result.data;
                $rootScope.StatusData = result;
            });

        }, function () { });
    }

    $scope.addUnitWeight = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'UNIT_WEIGHT_PROD',
                        GroupNote: 'Đơn vị tính trọng lượng',
                        AssetCode: 'UNIT_WEIGHT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getUnitWeight(function (rs) {
                rs = rs.data;
                $scope.listUnitWeight = rs;
            })
        }, function () { });
    }

    $scope.changePack = function () {
        if ($scope.model.Packing == '' || $rootScope.patternPacking.test($scope.model.Packing)) {
            $scope.errorPacking = false;
        } else {
            $scope.errorPacking = true;
        }
    }

    $scope.restrictUnit = function () {
        if ($scope.model.Packing != "") {
            $scope.model.Unit = "";
            var jsonPacking = JSON.stringify($rootScope.jsonSpecification($scope.model.Packing));
            dataserviceMaterial.unitFromPack(jsonPacking, function (rs) {
                rs = rs.data;
                $scope.treedataLevel = rs.Object;
            })
        }
    }

    $scope.chkProject = function () {
        if ($rootScope.ProjectCode == '' || $rootScope.ProjectCode == undefined) {
            //App.toastrError(caption.MLP_VALIDATE_CHK_TAB);
            App.toastrError(caption.MLP_VALIDATE_ADD_CATEGORY_SUPPLIES);
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    $scope.getQrCodeFromString = function () {
        $scope.ImageBase = "";
        $scope.ImageBase1 = "";
        //dataserviceMaterial.getQrCodeFromString($scope.model.ProductCode, function (rs) {
        //    if (rs) {
        //        rs = rs.data;
        //        if (rs == null || rs == "")
        //            $scope.ImageBase = "";
        //        else
        //            $scope.ImageBase = rs;
        //    }
        //});
        //dataserviceMaterial.getBarCodeFromString($scope.model.ProductCode, function (rs) {
        //    if (rs) {
        //        rs = rs.data;
        //        $scope.ImageBase1 = rs;
        //    }
        //});
    }
    $scope.autoFillGroup = function () {
        //
        var key = $scope.model.ProductCode;
        //$scope.model.GroupCode = "";
        //giay dan tuong
        if (key.toLowerCase().includes("ax")
            || key.toLowerCase().includes("pe")
            || key.toLowerCase().includes("k")
            || key.toLowerCase().includes("sj")
            || key.toLowerCase().includes("tw")
        ) {
            $scope.model.GroupCode = "GIAY_DAN_TUONG";
        }
        //rèm
        if (key.toLowerCase().includes("op")
            || key.toLowerCase().includes("fn")
        ) {
            $scope.model.GroupCode = "REM";
        }

        // thảm
        if (key.toLowerCase().includes("nt")
        ) {
            $scope.model.GroupCode = "THAM";
        }
        //sàn
        if (key.toLowerCase().includes("kb")
            || key.toLowerCase().includes("kg")
            || key.toLowerCase().includes("nu")
            || key.toLowerCase().includes("oh")

            || key.toLowerCase().includes("pf")
            || key.toLowerCase().includes("pg")
            || key.toLowerCase().includes("pm")
            || key.toLowerCase().includes("pp")
            || key.toLowerCase().includes("py")
            || key.toLowerCase().includes("sk")
            || key.toLowerCase().includes("ud")
        ) {
            $scope.model.GroupCode = "SAN";
        }
    }
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    $scope.viewBarCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/brViewerBase64.html',
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
    //Load init date
    function loadDate() {
        $("#ForeCastTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //var today = new Date(new Date());
        //$('#ForeCastTime').datepicker('setStartDate', today);
        //$('#ForeCastTime').datepicker('update', new Date());
        //$('#ForeCastTime').datepicker('setEndDate', today);
        //$scope.model.TimeTicketCreate = $filter('date')(new Date(today), 'dd/MM/yyyy');
        //$('#ForeCastTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }

    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItem', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }

    //Print
    $scope.print = function () {
        if ($scope.QR_CODE != '') {
            var image = '<img src="data:image/png;base64,' + $scope.QR_CODE + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }

    setTimeout(function () {
        loadDate();
        ckEditer();
    }, 200);
});

app.controller('editProd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceMaterial, para) {
    $scope.model = para;
    $scope.isEdit = true;
    console.log($scope.isCustom);
    $scope.header = caption.MLP_TITLE_EDIT_CATEGORY;
    $rootScope.groupCode = para.GroupCode;
    $scope.inheritances = [];
    $scope.productCategoryTypes = [];
    $scope.productTypes = [];
    $scope.productImpType = [];
    $rootScope.ProductID = $scope.model.Id;
    $rootScope.isShowInheritance = true;
    $scope.initData = function () {
        dataserviceMaterial.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result;
        });
        dataserviceMaterial.getListBrand(function (result) {
            result = result.data;
            $scope.listBrand = result;
        });
        dataserviceMaterial.getListSupplier(function (result) {
            result = result.data;
            $scope.listSupplier = result;
        });
        dataserviceMaterial.getProductImpType(function (result) {
            result = result.data;
            $scope.productImpType = result;
        });
        dataserviceMaterial.getListBrand(function (result) {
            result = result.data;
            $scope.listBrand = result;
        });
        dataserviceMaterial.getListSupplier(function (result) {
            result = result.data;
            $scope.listSupplier = result;
        });
        dataserviceMaterial.getproductgroup(function (result) {
            result = result.data;
            $scope.productgroup = result;
        });
        dataserviceMaterial.getInheritances($scope.model.ProductCode, function (result) {
            result = result.data;
            $scope.inheritances = result;
        });

        dataserviceMaterial.getUnitWeight(function (rs) {
            rs = rs.data;
            $scope.listUnitWeight = rs;
        })

        dataserviceMaterial.getProductTypes(function (result) {
            result = result.data;
            $scope.productTypes = result;
        });

        $rootScope.Inheritance = $scope.model.Inheritance;

        var jsonPacking = JSON.stringify($rootScope.jsonSpecification($scope.model.Packing));
        dataserviceMaterial.unitFromPack(jsonPacking, function (rs) {
            rs = rs.data;
            $scope.treedataLevel = rs.Object;
        })
        dataserviceMaterial.generatorQRCode($scope.model.ProductCode, function (rs) {
            rs = rs.data;
            $scope.QR_CODE = rs;
        })
        //document.getElementById('imageId').src = $scope.model.Image;
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
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
    $scope.submit = function () {
        if ($scope.isCustom) {
            return alert('isCustom');
        }
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItem'].getData();
            $scope.model.Description = data;
        }

        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            //var msgPrice = $rootScope.checkDataPrice($scope.model);
            //if (msgPrice.Status) {
            //    App.toastrError(msgPrice.Title);
            //    return;
            //}
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXIMUM);
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
                                    App.toastrError(caption.MLP_MSG_IMG_SIZE_MAXIMUM);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataserviceMaterial.uploadImage(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Image = '/uploads/images/' + rs.Object;
                                            dataserviceMaterial.update($scope.model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
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
                $scope.model.Json = JSON.stringify($rootScope.jsonSpecification($scope.model.Packing));

                dataserviceMaterial.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    };

    $scope.getQrCodeFromString = function () {
        $scope.ImageBase = "";
        $scope.ImageBase1 = "";
        //dataserviceMaterial.getQrCodeFromString($scope.model.ProductCode, function (rs) {
        //    if (rs) {
        //        rs = rs.data;
        //        if (rs == null || rs == "")
        //            $scope.ImageBase = "";
        //        else
        //            $scope.ImageBase = rs;
        //    }
        //});
        //dataserviceMaterial.getBarCodeFromString($scope.model.ProductCode, function (rs) {
        //    if (rs) {
        //        rs = rs.data;
        //        $scope.ImageBase1 = rs;
        //    }
        //});
    }
    $scope.getQrCodeFromString();
    $scope.addGroup = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMaterialProd + '/productGroupAdd.html',
            controller: 'addProductGroup',
            size: '40',
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getproductgroup(function (rs) {
                rs = rs.data;
                $scope.productgroup = rs;
            });
        }, function () {
        });
    }
    $scope.addUnit = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'UNIT',
                        GroupNote: 'Đơn vị sản phẩm',
                        AssetCode: 'WAREHOUSE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.gettreedataLevel(function (result) {
                result = result.data;
                $scope.treedataLevel = result;
            });
        }, function () { });
    }
    $scope.addBrand = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRODUCT_BRAND',
                        GroupNote: 'Thương hiệu',
                        AssetCode: 'PRODUCT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getListBrand(function (result) {
                result = result.data;
                $scope.listBrand = result;
            });

        }, function () { });
    }
    $scope.addProductImpType = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PRODUCT_IMP_TYPE',
                        GroupNote: 'Loại hình nhập kho',
                        AssetCode: 'MATERIAL_PRODUCT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getProductImpType(function (result) {
                result = result.data;
                $scope.productImpType = result;
            });
        }, function () { });
    }
    $scope.addStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CAT_STATUS',
                        GroupNote: 'Trạng thái sản phẩm',
                        AssetCode: 'WAREHOUSE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getListStatus(function (result) {
                result = result.data;
                $rootScope.StatusData = result;
            });

        }, function () { });
    }
    $scope.addUnitWeight = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'UNIT_WEIGHT_PROD',
                        GroupNote: 'Đơn vị tính trọng lượng',
                        AssetCode: 'UNIT_WEIGHT'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceMaterial.getUnitWeight(function (rs) {
                rs = rs.data;
                $scope.listUnitWeight = rs;
            })

        }, function () { });
    }

    $scope.clone = function (id) {
        //dataserviceMaterial.getItem(id, function (rs) {
        //    rs = rs.data;
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    }
        //    else {
        //        $scope.model = rs;
        //        $rootScope.ProductID = $scope.model.Id;
        //        $rootScope.ProductCode = $scope.model.ProductCode;
        //        var modalInstance = $uibModal.open({
        //            animation: true,
        //            templateUrl: ctxfolderMaterialProd + '/add.html',
        //            controller: 'addMaterialProd',
        //            backdrop: 'static',
        //            size: '60',
        //            resolve: {
        //                para: function () {
        //                    return $scope.model;
        //                }
        //            }
        //        });
        //        modalInstance.result.then(function (d) {
        //            $rootScope.reloadBase();
        //        }, function () {
        //        });
        //    }
        //});
        const productCode = $scope.model.ProductCode;
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmActionInput.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = 'Điền vào số lượng bạn muốn nhân bản';
                $scope.input = 100;
                $scope.ok = function () {
                    dataserviceMaterial.cloneMultiple(productCode, $scope.input, function (rs) {
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
            $uibModalInstance.close();
        }, function () {
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ProductGroup" && $scope.model.ProductGroup != "") {
            $scope.errorProductGroup = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
            $scope.errorUnit = false;
        }

        if (SelectType == "ImpType" && $scope.model.ImpType != "") {
            $scope.errorImpType = false;
        }
        if (SelectType == "GroupCode" && $scope.model.GroupCode != "") {
            $scope.errorGroupCode = false;
            $rootScope.groupCode = $scope.model.GroupCode;

        }
        if (SelectType == "TypeCode" && $scope.model.TypeCode != "") {
            $scope.errorTypeCode = false;
        }
        if (SelectType == "Inheritance" && $scope.model.Inheritance != "") {
            dataserviceMaterial.getInheritancesDetail($scope.model.Inheritance, function (result) {

                result = result.data;
                //var sProductCode = $scope.model.ProductCode;
                //var sProductName = $scope.model.ProductName;
                //$scope.model = result[0];
                //$scope.model.ProductCode = sProductCode;
                //$scope.model.ProductName = sProductName;
                $scope.model.GroupCode = result[0].GroupCode;
                $scope.model.TypeCode = result[0].TypeCode;
                $scope.model.Unit = result[0].Unit;
                $scope.model.Material = result[0].Material;
                $scope.model.Pattern = result[0].Pattern;
                $scope.model.Size = result[0].Size;
                $scope.model.Note = result[0].Note;
            });
        }
    }
    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }
    $scope.viewBarCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/brViewerBase64.html',
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

    $scope.changePack = function () {
        if ($scope.model.Packing == '' || $rootScope.patternPacking.test($scope.model.Packing)) {
            $scope.errorPacking = false;
        } else {
            $scope.errorPacking = true;
        }
    }
    $scope.restrictUnit = function () {
        if ($scope.model.Packing != "") {

            $scope.model.Unit = "";
            var jsonPacking = JSON.stringify($rootScope.jsonSpecification($scope.model.Packing));
            dataserviceMaterial.unitFromPack(jsonPacking, function (rs) {
                rs = rs.data;
                $scope.treedataLevel = rs.Object;
            })
        }
    }

    //Load init date
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        //if (data.Unit == "") {
        //    $scope.errorUnit = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorUnit = false;

        //}
        //if (data.ImpType == "" || data.ImpType == null) {
        //    $scope.errorImpType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorImpType = false;
        //}
        if (data.GroupCode == "") {
            $scope.errorGroupCode = true;
            mess.Status = true;
        } else {
            $scope.errorGroupCode = false;

        }
        if (data.TypeCode == "") {
            $scope.errorTypeCode = true;
            mess.Status = true;
        } else {
            $scope.errorTypeCode = false;
        }
        if (data.Packing == '' || $rootScope.patternPacking.test(data.Packing)) {
            $scope.errorPacking = false;
        } else {
            mess.Status = true;
            $scope.errorPacking = true;
        }
        //if (data.Size != null && data.Size != '' && data.Size != undefined) {
        //    var partternSize = /^[0-9]*(\s)?(x|X|\*)(\s)?[0-9]*$/;
        //    if (!partternSize.test(data.Size)) {
        //        mess.Title = mess.Title.concat(" - ", caption.MLP_VALIDATE_SIZE_FORMAT, "<br/>");
        //        $scope.errorSize = true;
        //        mess.Status = true;
        //    } else {
        //        $scope.errorSize = false;
        //    }
        //} else {
        //    $scope.errorSize = false;
        //}
        return mess;
    };
    function loadDate() {
        $("#ForeCastTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //var today = new Date(new Date());
        //$('#ForeCastTime').datepicker('setStartDate', today);
        //$('#ForeCastTime').datepicker('update', new Date());
        //$('#ForeCastTime').datepicker('setEndDate', today);
        //$scope.model.TimeTicketCreate = $filter('date')(new Date(today), 'dd/MM/yyyy');
        //$('#ForeCastTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItem', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }

    //Print
    $scope.print = function () {
        if ($scope.QR_CODE != '') {
            var image = '<img src="data:image/png;base64,' + $scope.QR_CODE + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }

    //Delete Itself
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceMaterial.delete(id, function (rs) {
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
            $uibModalInstance.close();
        }, function () {
        });
    }

    setTimeout(function () {
        loadDate();
        ckEditer();
    }, 200);
});

app.controller('more', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter, $translate) {
    var vm = $scope;
    $scope.model = {
        AttributeCode: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialProduct/JTableExtend",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $rootScope.ProductCode;
                d.AttributeCode = $scope.model.AttributeCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataMore");
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeCode').withTitle('{{"MLP_LIST_COL_CODE_PRODUCT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttributeName').withTitle('{{"MLP_LIST_COL_NAME_PRODUCT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle('{{"MLP_LIST_COL_SIZE" | translate}}').renderWith(function (data, type, full) {

        var dt = "";
        if (full.Type == "GIAY_DAN_TUONG") {
            var arr = data.split('*');
            var width = arr[2] != "_" ? arr[2] + "(cm)" : "_";
            var length = arr[3] != "_" ? arr[3] : "_";
            dt = length + " x " + width;
        }
        if (full.Type == "REM") {
            var arr = data.split('*');
            var width = arr[2] != "_" ? arr[6] + "(m)" : "_";
            var length = arr[3] != "_" ? arr[3] + "(mm)" : "_";
            dt = length + " x " + width;
        }
        if (full.Type == "SAN") {
            var arr = data.split('*');
            var width = arr[5] != "_" ? arr[5] + "(cm)" : "_";
            //var length = arr[3] == "_" ? arr[3] + "(mm)" : "";
            dt = width;
        }

        if (full.Type == "THAM") {
            var arr = data.split('*');
            var width = arr[5] != "_" ? arr[5] + "(cm)" : "_";
            var length = arr[6] != "_" ? arr[6] + "(cm)" : "_";
            dt = length + " x " + width;
        }
        return dt;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle('{{"MLP_LIST_COL_PRICE" | translate}}').renderWith(function (data, type, full) {

        var dt = "";
        if (full.Type == "GIAY_DAN_TUONG") {
            var arr = data.split('*');
            var price = arr[16] != "_" ? arr[16] + "/m" : "";
            dt = price;
        }
        if (full.Type == "REM") {
            var arr = data.split('*');
            var price = arr[2] != "_" ? arr[2] + "(JPY/M)" : "";
            dt = price;
        }
        if (full.Type == "SAN") {
            var arr = data.split('*');
            var price2 = arr[2] != "_" ? arr[2] + "(Yên/m2)" : "";
            var price = arr[3] != "_" ? arr[3] + "(Yên / m)" : "";
            dt = price2 + " </br> -" + price;
        }
        if (full.Type == "THAM") {
            var arr = data.split('*');
            var price2 = arr[2] != "_" ? arr[2] + "(Yên/m2)" : "_";
            var price = arr[3] != "_" ? arr[3] + "(Yên/m)" : "_";
            dt = price2 + " </br> - " + price;
        }
        return dt;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle($translate('COM_LIST_COL_ACTION')).renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px;" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
        $scope.reload();
    }
    $scope.add = function () {
        $rootScope.isAdd = true;
        if ($rootScope.ProductID != '') {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderMaterialProd + '/moreAdd.html',
                controller: 'moreAdd',
                backdrop: 'static',
                size: '70'
            });
            modalInstance.result.then(function (d) {
                $scope.reload()
            }, function () { });
        }
    }

    $scope.edit = function (id) {
        $rootScope.isAdd = false;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderMaterialProd + '/moreEdit.html',
            controller: 'moreEdit',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadData(false);
        }, function () { });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.MLP_MSG_SURE_DEL;
                $scope.ok = function () {
                    dataserviceMaterial.deleteExtend(id, function (rs) {
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
            reloadData(false);
        }, function () {
        });
    }
    $scope.loadFile = function (event) {
        ////
        $scope.listNew = [];
        $scope.listUpdate = [];
        $scope.listError = [];
        var files = event.target.files;
        if (files != null) {
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var name = files[0].name.substr(0, idxDot - 1).toLowerCase();
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            var excel = ['xlsx', 'xls'];
            if (excel.indexOf(extFile) !== -1) {
                extFile = 1;
            } else {
                extFile = 0;
            }
            if (extFile == 0) {
                App.toastrError(caption.EDMSR_MSG_FORMAT_FILE_NOT_ALLOWED);
                return;
            }
            $scope.$apply();

            App.blockUI({
                target: "#modal-body",
                boxed: true,
                message: 'loading...'
            });

            var formData = new FormData();
            formData.append("FileUpload", files[0]);
            formData.append("Catalogue", $rootScope.ProductCode);
            formData.append("groupCode", $rootScope.groupCode);
            App.blockUI({
                target: "#modal-body",
                boxed: true,
                message: 'loading...'
            });
            dataserviceMaterial.uploadCatalogue(formData, function (rs) {
                rs = rs.data;
                ////
                var input = $("#File");
                input.replaceWith(input.val('').clone(true));
                App.unblockUI("#modal-body");
                rs.Catalogue = $rootScope.ProductCode;
                var modalInstance = {};
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return;
                }
                else {
                    var list = rs.list;
                    for (var indx = 0; indx < list.length; ++indx) {
                        list[indx].Type = $rootScope.groupCode;
                    }
                    rs.list = list;
                }
                if ($rootScope.groupCode == "GIAY_DAN_TUONG") {

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderMaterialProd + '/uploadFine1000Result.html',
                        controller: 'uploadFine1000Result',
                        backdrop: false,
                        size: '70',
                        resolve: {
                            para: function () {
                                return rs;
                            }
                        }
                    });
                }
                else if ($rootScope.groupCode == "REM") {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        return;
                    }
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderMaterialProd + '/uploadRemResult.html',
                        controller: 'uploadRemResult',
                        backdrop: false,
                        size: '70',
                        resolve: {
                            para: function () {
                                return rs;
                            }
                        }
                    });
                }
                else if ($rootScope.groupCode == "SAN") {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        return;
                    }
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderMaterialProd + '/uploadFloorResult.html',
                        controller: 'uploadFloorResult',
                        backdrop: false,
                        size: '70',
                        resolve: {
                            para: function () {
                                return rs;
                            }
                        }
                    });

                }
                else if ($rootScope.groupCode == "THAM") {
                    ////
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        return;
                    }
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderMaterialProd + '/uploadCarpetResult.html',
                        controller: 'uploadCarpetResult',
                        backdrop: false,
                        size: '70',
                        resolve: {
                            para: function () {
                                return rs;
                            }
                        }
                    });

                }
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                });
            });
        } else {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
    };

});

app.controller('moreAdd', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter) {
    $scope.isEdit = false;
    if ($rootScope.groupCode == "GIAY_DAN_TUONG") {
        $rootScope.structNote = "Trang * Category * Chiều rộng * Chiều dài * Trọng lượng * Vân dọc * Vân ngang * E-Sekou * Sx đến 2021 * Chống nấm mốc * Chống bám bẩn * Chống vi khuẩn * Khử mùi * Kiểm soát độ ẩm * Bề mặt giấy cứng * Chống cháy lan * Giá";
        $scope.tab = 1;
    }
    if ($rootScope.groupCode == "REM") {
        $rootScope.structNote = "Trang * Category * Giá * Khổ rộng(mm) * Bước hoa dọc * Bước hoa ngang * Chiều dài cuộn * Trọng lượng * Chất liệu * Xuất xứ";
        $scope.tab = 2;
    }
    if ($rootScope.groupCode == "THAM") {
        $rootScope.structNote = "Trang * Category * Giá Catalogue2 *  Giá Catalogue1 * Đơn vị * Khổ rộng * Chiều dài * Số tấm/hộp *  Số m2/hộp * Độ dầy TT * Tổng độ dày * Cấu tạo * Kiểu dệt * Gauge * Sticth * Formaldehyde * Chống cháy lan * Chống tĩnh điện * Thân thiện MT * ECO MARK * Tiêu chuẩn JIS * Tiêu chuẩn CRI * Kháng khuẩn * Mật độ đi lại";
        $scope.tab = 3;
    }
    if ($rootScope.groupCode == "SAN") {
        $rootScope.structNote = "Trang * Category * Giá Catalogue2 * Giá Catalogue1 * Đơn vị * Chiều rộng * Tổng độ dày *  Trọng lượng * Bước hoa dọc * Bước hoa ngang * Kháng khuẩn * Kháng hóa chất * Chống tĩnh điện * Không cần sáp * Dùng ngoài trời * Dễ lau chùi * Chống nấm mốc * Chống shock * Chịu vật nặng *  Chống cháy lan";
        $scope.tab = 4;
    }

    $scope.productType = "FE1000";

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
        Inheritance: '_',
        Page: 1,
        Category: '',
        PricePerM2: 0,
        PricePerM: 0,
        Unit: '',
        Width: 1,
        Length: 1,
        Weight: 1,
        VerticalStroke: 1,
        HorizontalStroke: 1,
        Note: '',
        ESekou: '_',
        Sx2021: '_',
        AntiMold: '_',
        AntiFouling: '_',
        AntiBacteria: '_',
        Deodorant: '_',
        HumidityControl: '_',
        HardPaperSurface: '_',
        FireSpread: '_',
        AntiScatter: '_',
        UVProtection: '_',
        InsectRepellent: '_',
        BrigthnessControl: '_',
        HeatReflection: '_',
        OutsideInstallation: '_',
        StrongCoated: '_',
        LowReflection: '_',
        LowReflection: '_',
        Material: '',
        Origin: '',
        Value: '',
        ForecastInStock: 0,
        sForeCastTime: ''
    }
    $scope.model1 = {
        Inheritance: '_',
        Page: 1,
        Category: '',
        PricePerM2: '',
        PricePerM: '',
        Unit: '',
        Width: 1,
        Length: 1,
        Weight: 1,
        VerticalStroke: 1,
        HorizontalStroke: 1,
        Note: '',
        ESekou: '_',
        Sx2021: '_',
        AntiMold: '_',
        AntiFouling: '_',
        AntiBacteria: '_',
        Deodorant: '_',
        HumidityControl: '_',
        HardPaperSurface: '_',
        FireSpread: '_',
        AntiScatter: '_',
        UVProtection: '_',
        InsectRepellent: '_',
        BrigthnessControl: '_',
        HeatReflection: '_',
        OutsideInstallation: '_',
        StrongCoated: '_',
        LowReflection: '_',
        LowReflection: '_',
        Material: '',
        Origin: '',
        Value: '',
        Formaldehyde: '_',
        Friendly: 'Y',
        ECO_MARK: 'Y',
        JIS: 'Y',
        CRI: 'Y',
        TravelDensity: 'Heavy',
        Antistatic: '_',
        ObjectMoving: '_',
        AntiShock: '_',
        ChemicalResistance: '_',
        Wax: '_',
        OutSide: '_'

    }
    $scope.ImageBase = "";
    $scope.forms = {};

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    var init = function () {
        dataserviceMaterial.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result;
        });
        dataserviceMaterial.getproductgroup(function (result) {
            result = result.data;
            $scope.productgroup = result;
        });
    }
    init();
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
                document.getElementById('imageId1').src = reader.result;
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

    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var msg = $rootScope.checkDataMore($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            if ($rootScope.ProductID == '') {
                App.toastrError(caption.COM_MSG_ADD_BEFORE);
            }
            $scope.model.ProductCode = $rootScope.ProductCode;
            ////
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataserviceMaterial.uploadImage(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            ////
                                            $scope.model.Image = '/uploads/images/' + rs.Object;
                                            dataserviceMaterial.insertProductAttribute($scope.model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                                App.unblockUI("#contentMain");
                                            });
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                dataserviceMaterial.insertProductAttribute($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    App.unblockUI("#contentMain");
                });
            }
        }
    }

    $scope.getQrCodeFromString = function () {
        $scope.ImageBase = "";
        //if ($scope.tab == 0) {
        //    dataserviceMaterial.getQrCodeFromString($rootScope.ProductCode + "_" + $scope.model.AttributeCode, function (rs) {
        //        if (rs) {
        //            rs = rs.data;
        //            if (rs == null || rs == "")
        //                $scope.ImageBase = "";
        //            else
        //                $scope.ImageBase = rs;
        //        }
        //    });
        //}
        //else {
        //    dataserviceMaterial.getQrCodeFromString($rootScope.ProductCode + "_" + $scope.model1.AttributeCode, function (rs) {
        //        if (rs) {
        //            rs = rs.data;
        //            if (rs == null || rs == "")
        //                $scope.ImageBase = "";
        //            else
        //                $scope.ImageBase = rs;
        //        }
        //    });
        //}
    }

    $scope.onTextChange = function () {
        if ($scope.productType == "FE1000") {
            $scope.model.Value =
                //$scope.model.Inheritance + "*" +
                $scope.model.Page + "*" +
                $scope.model.Category + "*" +
                //$scope.model.PricePerM2 + "*" +
                //$scope.model.PricePerM + "*" +
                //$scope.model.Unit + "*" +
                $scope.model.Width + "*" +
                $scope.model.Length + "*" +
                $scope.model.Weight + "*" +
                $scope.model.VerticalStroke + "*" +
                $scope.model.HorizontalStroke + "*" +
                //$scope.model.Note + "*" +
                $scope.model.ESekou + "*" +
                $scope.model.Sx2021 + "*" +
                $scope.model.AntiMold + "*" +
                $scope.model.AntiFouling + "*" +
                $scope.model.AntiBacteria + "*" +
                $scope.model.Deodorant + "*" +
                $scope.model.HumidityControl + "*" +
                $scope.model.HardPaperSurface + "*" +
                $scope.model.FireSpread;
            //$scope.model.AntiScatter + "*" +
            //$scope.model.UVProtection + "*" +
            //$scope.model.InsectRepellent + "*" +
            //$scope.model.BrigthnessControl + "*" +
            //$scope.model.HeatReflection + "*" +
            //$scope.model.OutsideInstallation + "*" +
            //$scope.model.StrongCoated + "*" +
            //$scope.model.LowReflection + "*" +
            //$scope.model.LowReflection + "*" +
            //$scope.model.Material + "*" +
            //$scope.model.Origin;
        }
    }

    $scope.submit1 = function () {
        //if ($scope.tab == 0) {
        if ($scope.forms.addC1more.validate()) {
            $scope.insertTabZero();
        }
        //} else {
        //    if ($rootScope.groupCode == "GIAY_DAN_TUONG") {
        //        $scope.insertFine1000();
        //    }
        //    if ($rootScope.groupCode == "REM") {
        //        $scope.insertSimpleOrder();
        //    }
        //    if ($rootScope.groupCode == "THAM") {
        //        $scope.insertCarpet();
        //    }
        //    if ($rootScope.groupCode == "SAN") {
        //        $scope.insertSfloor();
        //    }
        //}
    }

    $scope.changeTab = function (tab) {
        $scope.tab = tab;
    }

    $scope.insertFine1000 = function () {

        var msg = {};
        var model;
        if ($scope.tab == 0) {
            model = $scope.model;

            msg = $rootScope.checkDataMore1($scope.model, $scope.tab);
        }
        else {
            model = $scope.model1;
            model.Value = $scope.model.Page + "*" +
                model.Category + "*" +

                model.Width + "*" +
                model.Length + "*" +
                model.Weight + "*" +
                model.VerticalStroke + "*" +
                model.HorizontalStroke + "*" +
                model.ESekou + "*" +
                model.Sx2021 + "*" +
                model.AntiMold + "*" +
                model.AntiFouling + "*" +
                model.AntiBacteria + "*" +
                model.Deodorant + "*" +
                model.HumidityControl + "*" +
                model.HardPaperSurface + "*" +
                model.FireSpread + "*" +
                model.PricePerM;
            msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        }
        //if (msg.Status == true) {
        //    App.toastrError(msg.Title);
        //    return;
        //}
        //else {

        //}

        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }
        $scope.model.ProductCode = $rootScope.ProductCode;
        model.Type = $rootScope.groupCode;
        model.ProductCode = $rootScope.ProductCode;
        ////
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object;

                                        model.Image = '/uploads/images/' + rs.Object;
                                        if ($scope.forms.addC2more.validate()) {
                                            dataserviceMaterial.insertProductAttribute(model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                                App.unblockUI("#contentMain");
                                            });
                                        }

                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {
            if ($scope.forms.addC2more.validate()) {
                dataserviceMaterial.insertProductAttribute(model, function (rs) {
                    rs = rs.data;

                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    App.unblockUI("#contentMain");
                });

            }
        }

    }
    $scope.insertSimpleOrder = function () {

        var msg = {};
        var model;
        if ($scope.tab == 0) {
            model = $scope.model;
            msg = $rootScope.checkDataMore1($scope.model, $scope.tab);
        }
        else {
            model = $scope.model1;
            model.Value = model.Page + "*" +
                model.Category + "*" +
                model.PricePerM + "*" +
                model.Width + "*" +
                model.VerticalStroke + "*" +
                model.HorizontalStroke + "*" +
                model.Length + "*" +
                model.Weight + "*" +
                model.Material + "*" +
                model.Origin;
            msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        }
        //if (msg.Status == true) {
        //    App.toastrError(msg.Title);
        //    return;
        //}
        //else {

        //}

        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }
        $scope.model.ProductCode = $rootScope.ProductCode;
        model.Type = $rootScope.groupCode;
        model.ProductCode = $rootScope.ProductCode;
        ////
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object;
                                        model.Image = '/uploads/images/' + rs.Object;
                                        if ($scope.forms.simpleOrderform.validate()) {
                                            dataserviceMaterial.insertProductAttribute(model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                                App.unblockUI("#contentMain");
                                            });
                                        }
                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {
            if ($scope.forms.simpleOrderform.validate()) {
                dataserviceMaterial.insertProductAttribute(model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    App.unblockUI("#contentMain");
                });
            }
        }

    }
    $scope.insertSfloor = function () {
        var msg = {};
        var model;
        if ($scope.tab == 0) {
            model = $scope.model;
            msg = $rootScope.checkDataMore1($scope.model, $scope.tab);
        }
        else {
            model = $scope.model1;
            model.Value = model.Page + "*" +
                model.Category + "*" +
                model.PricePerM2 + "*" +
                model.PricePerM + "*" +
                model.Unit + "*" +
                model.Width + "*" +
                model.Deep + "*" +
                model.Weight + "*" +
                model.VerticalStroke + "*" +
                model.HorizontalStroke + "*" +
                model.AntiBacteria + "*" +
                model.ChemicalResistance + "*" +
                model.Antistatic + "*" +
                model.Wax + "*" +
                model.OutSide + "*" +
                model.AntiFouling + "*" +
                model.AntiMold + "*" +
                model.AntiShock + "*" +
                model.ObjectMoving + "*" +
                model.FireSpread;
            msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        }
        //if (msg.Status == true) {
        //    App.toastrError(msg.Title);
        //    return;
        //}
        //else {

        //}

        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }
        $scope.model.ProductCode = $rootScope.ProductCode;
        model.Type = $rootScope.groupCode;
        model.ProductCode = $rootScope.ProductCode;
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object;

                                        model.Image = '/uploads/images/' + rs.Object;
                                        if ($scope.forms.floormore.validate()) {
                                            dataserviceMaterial.insertProductAttribute(model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                                App.unblockUI("#contentMain");
                                            });
                                        }

                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {
            if ($scope.forms.floormore.validate()) {
                dataserviceMaterial.insertProductAttribute(model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    App.unblockUI("#contentMain");
                });

            }
        }
    }
    $scope.insertCarpet = function () {
        var msg = {};
        var model;
        if ($scope.tab == 0) {
            model = $scope.model;
            msg = $rootScope.checkDataMore1($scope.model, $scope.tab);
        }
        else {
            model = $scope.model1;
            model.Value = model.Page + "*" +
                model.Category + "*" +
                model.PricePerM2 + "*" +
                model.PricePerM + "*" +
                model.Unit + "*" +
                model.Width + "*" +
                model.Length + "*" +
                model.CountPerBox + "*" +
                model.M2PerBox + "*" +
                model.Deep + "*" +
                model.TotalDeep + "*" +
                ((model.Structure == null || model.Structure == '' || model.Structure == undefined) ? "_" : model.Structure) + "*" +
                ((model.TextileType == null || model.TextileType == '' || model.TextileType == undefined) ? "_" : model.TextileType) + "*" +
                ((model.Gauge == null || model.Gauge == '' || model.Gauge == undefined) ? "_" : model.Gauge) + "*" +
                ((model.Sticth == null || model.Sticth == '' || model.Sticth == undefined) ? "_" : model.Sticth) + "*" +
                model.Formaldehyde + "*" +
                model.FireSpread + "*" +
                model.Antistatic + "*" +
                model.Friendly + "*" +
                model.ECO_MARK + "*" +
                model.JIS + "*" +
                model.CRI + "*" +
                model.AntiBacteria + "*" +
                model.TravelDensity;
            msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        }
        //if (msg.Status == true) {
        //    App.toastrError(msg.Title);
        //    return;
        //}
        //else {

        //}

        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }
        $scope.model.ProductCode = $rootScope.ProductCode;
        model.Type = $rootScope.groupCode;
        model.ProductCode = $rootScope.ProductCode;
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object;

                                        model.Image = '/uploads/images/' + rs.Object;

                                        if ($scope.forms.carpetmore.validate()) {
                                            dataserviceMaterial.insertProductAttribute(model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                                App.unblockUI("#contentMain");
                                            });
                                        }

                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {
            if ($scope.forms.carpetmore.validate()) {
                dataserviceMaterial.insertProductAttribute(model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    App.unblockUI("#contentMain");
                });
            }

        }

    }
    $scope.insertTabZero = function () {
        var msg = {};

        //if ($scope.tab == 0) {
        //    model = $scope.model;
        //    //msg = $rootScope.checkDataMore1($scope.model, $scope.tab);

        //}
        //else {
        //    model = $scope.model1;
        //    msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        //}

        msg = $rootScope.checkValidateValue($scope.model.Value);

        if (msg.Status == true) {
            App.toastrError(msg.Title);
            return;
        }

        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }
        $scope.model.ProductCode = $rootScope.ProductCode;
        $scope.model.Type = $rootScope.groupCode;
        $scope.model.ProductCode = $rootScope.ProductCode;
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object;
                                        model.Image = '/uploads/images/' + rs.Object;

                                        dataserviceMaterial.insertProductAttribute(model, function (rs) {
                                            rs = rs.data;
                                            if (rs.Error) {
                                                App.toastrError(rs.Title);
                                            } else {
                                                App.toastrSuccess(rs.Title);
                                                $uibModalInstance.close();
                                            }
                                            App.unblockUI("#contentMain");
                                        });

                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {
            dataserviceMaterial.insertProductAttribute($scope.model, function (rs) {
                rs = rs.data;

                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
                App.unblockUI("#contentMain");
            });

        }
    }

    //Load init date
    function loadDate() {
        $("#ForeCastTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //var today = new Date(new Date());
        //$('#ForeCastTime').datepicker('setStartDate', today);
        //$('#ForeCastTime').datepicker('update', new Date());
        //$('#ForeCastTime').datepicker('setEndDate', today);
        //$scope.model.TimeTicketCreate = $filter('date')(new Date(today), 'dd/MM/yyyy');
        //$('#ForeCastTime').datepicker('setStartDate', today);

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('moreEdit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceMaterial, para) {
    $scope.isEdit = true;
    if ($rootScope.groupCode == "GIAY_DAN_TUONG") {
        $rootScope.structNote = "Trang * Category * Chiều rộng * Chiều dài * Trọng lượng * Vân dọc * Vân ngang * E-Sekou * Sx đến 2021 * Chống nấm mốc * Chống bám bẩn * Chống vi khuẩn * Khử mùi * Kiểm soát độ ẩm * Bề mặt giấy cứng * Chống cháy lan * Giá";
        $scope.tab = 1;
    }
    if ($rootScope.groupCode == "REM") {
        $rootScope.structNote = "Trang * Category * Giá * Khổ rộng(mm) * Bước hoa dọc * Bước hoa ngang * Chiều dài cuộn * Trọng lượng * Chất liệu * Xuất xứ";
        $scope.tab = 2;
    }
    if ($rootScope.groupCode == "THAM") {
        $rootScope.structNote = "Trang * Category * Giá Catalogue2 *  Giá Catalogue1 * Đơn vị * Khổ rộng * Chiều dài * Số tấm/hộp *  Số m2/hộp * Độ dầy TT * Tổng độ dày * Cấu tạo * Kiểu dệt * Gauge * Sticth * Formaldehyde * Chống cháy lan * Chống tĩnh điện * Thân thiện MT * ECO MARK * Tiêu chuẩn JIS * Tiêu chuẩn CRI * Kháng khuẩn * Mật độ đi lại";
        $scope.tab = 3;
    }
    if ($rootScope.groupCode == "SAN") {
        $rootScope.structNote = "Trang * Category * Giá Catalogue2 * Giá Catalogue1 * Đơn vị * Chiều rộng * Tổng độ dày *  Trọng lượng * Bước hoa dọc * Bước hoa ngang * Kháng khuẩn * Kháng hóa chất * Chống tĩnh điện * Không cần sáp * Dùng ngoài trời * Dễ lau chùi * Chống nấm mốc * Chống shock * Chịu vật nặng *  Chống cháy lan";
        $scope.tab = 4;
    }
    $scope.productType = "FE1000";
    $scope.groupCode1 = "";

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.model = {
        Inheritance: '_',
        Page: 1,
        Category: '',
        PricePerM2: 0,
        PricePerM: 0,
        Unit: '',
        Width: 1,
        Length: 1,
        Weight: 1,
        VerticalStroke: 1,
        HorizontalStroke: 1,
        Note: '',
        ESekou: '_',
        Sx2021: '_',
        AntiMold: '_',
        AntiFouling: '_',
        AntiBacteria: '_',
        Deodorant: '_',
        HumidityControl: '_',
        HardPaperSurface: '_',
        FireSpread: '_',
        AntiScatter: '_',
        UVProtection: '_',
        InsectRepellent: '_',
        BrigthnessControl: '_',
        HeatReflection: '_',
        OutsideInstallation: '_',
        StrongCoated: '_',
        LowReflection: '_',
        LowReflection: '_',
        Material: '_',
        Origin: '_',
        Value: '',
        ForecastInStock: 0,
        sForeCastTime: ''
    }
    $scope.model1 = {
        Inheritance: '_',
        Page: 1,
        Category: '',
        PricePerM2: 0,
        PricePerM: 0,
        Unit: '',
        Width: 1,
        Length: 1,
        Weight: 1,
        VerticalStroke: 1,
        HorizontalStroke: 1,
        Note: '',
        ESekou: '_',
        Sx2021: '_',
        AntiMold: '_',
        AntiFouling: '_',
        AntiBacteria: '_',
        Deodorant: '_',
        HumidityControl: '_',
        HardPaperSurface: '_',
        FireSpread: '_',
        AntiScatter: '_',
        UVProtection: '_',
        InsectRepellent: '_',
        BrigthnessControl: '_',
        HeatReflection: '_',
        OutsideInstallation: '_',
        StrongCoated: '_',
        LowReflection: '_',
        LowReflection: '_',
        Material: '_',
        Origin: '_',
        Value: ''

    }
    $scope.ImageBase = "";
    $scope.initData = function () {
        dataserviceMaterial.getAttributeItem(para, function (rs) {
            rs = rs.data;

            $scope.groupCode1 = rs.Object.Type;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs.Object;
                $scope.model1 = rs.Object;
                try {
                    ////
                    var data = $scope.model.Value.split('*');
                    if ($scope.groupCode1 == "GIAY_DAN_TUONG") {
                        $scope.model1.Page = parseFloat(data[0]);
                        $scope.model1.Category = data[1];
                        $scope.model1.Width = parseFloat(data[2]);
                        $scope.model1.Length = parseFloat(data[3]);
                        $scope.model1.Weight = parseFloat(data[4]);
                        $scope.model1.VerticalStroke = parseFloat(data[5]);
                        $scope.model1.HorizontalStroke = parseFloat(data[6]);
                        $scope.model1.ESekou = data[7];
                        $scope.model1.Sx2021 = data[8];
                        $scope.model1.AntiMold = data[9];
                        $scope.model1.AntiFouling = data[10];
                        $scope.model1.AntiBacteria = data[11];
                        $scope.model1.Deodorant = data[12];
                        $scope.model1.HumidityControl = data[13];
                        $scope.model1.HardPaperSurface = data[14];
                        $scope.model1.FireSpread = data[15];
                        if (data.length == 17)
                            $scope.model1.PricePerM = parseFloat(data[16]);
                    }
                    if ($scope.groupCode1 == "REM") {
                        //

                        $scope.model1.Page = parseInt(data[0]);
                        $scope.model1.Category = data[1];
                        $scope.model1.PricePerM = parseFloat(data[2].replace(',', ''));
                        $scope.model1.Width = parseFloat(data[3]);
                        $scope.model1.VerticalStroke = parseFloat(data[4]);
                        $scope.model1.HorizontalStroke = parseFloat(data[5]);
                        $scope.model1.Length = parseFloat(data[6]);
                        $scope.model1.Weight = parseFloat(data[7]);
                        $scope.model1.Material = data[8];
                        $scope.model1.Origin = data[9];
                    }
                    if ($scope.groupCode1 == "THAM") {
                        $scope.model1.Page = parseInt(data[0]);
                        $scope.model1.Category = data[1];
                        $scope.model1.PricePerM2 = parseFloat(data[2].replace(',', ''));
                        $scope.model1.PricePerM = parseFloat(data[3].replace(',', ''));
                        $scope.model1.Unit = data[4];
                        $scope.model1.Width = parseFloat(data[5]);
                        $scope.model1.Length = parseFloat(data[6]);
                        $scope.model1.CountPerBox = parseFloat(data[7]);
                        $scope.model1.M2PerBox = parseFloat(data[8]);
                        $scope.model1.Deep = parseFloat(data[9]);
                        $scope.model1.TotalDeep = parseFloat(data[10]);
                        $scope.model1.Structure = data[11];
                        $scope.model1.TextileType = data[12];
                        $scope.model1.Gauge = parseFloat(data[13]);
                        $scope.model1.Sticth = parseFloat(data[14]);
                        $scope.model1.Formaldehyde = data[15];
                        $scope.model1.FireSpread = data[16];
                        $scope.model1.Antistatic = data[17];
                        $scope.model1.Friendly = data[18];
                        $scope.model1.ECO_MARK = data[19];
                        $scope.model1.JIS = data[20];
                        $scope.model1.CRI = data[21];
                        $scope.model1.AntiBacteria = data[22];
                        $scope.model1.TravelDensity = data[23];

                    }
                    if ($scope.groupCode1 == "SAN") {
                        $scope.model1.Page = parseInt(data[0]);
                        $scope.model1.Category = data[1];
                        $scope.model1.PricePerM2 = parseFloat(data[2].replace(',', ''));
                        $scope.model1.PricePerM = parseFloat(data[3].replace(',', ''));
                        $scope.model1.Unit = data[4];
                        $scope.model1.Width = parseFloat(data[5]);
                        $scope.model1.Deep = parseFloat(data[6]);
                        $scope.model1.Weight = parseFloat(data[7]);
                        $scope.model1.VerticalStroke = parseFloat(data[8]);
                        $scope.model1.HorizontalStroke = parseFloat(data[9]);
                        $scope.model1.AntiBacteria = data[10];
                        $scope.model1.ChemicalResistance = data[11];
                        $scope.model1.Antistatic = data[12];
                        $scope.model1.Wax = data[13];
                        $scope.model1.OutSide = data[14];
                        $scope.model1.AntiFouling = data[15];
                        $scope.model1.AntiMold = data[16];
                        $scope.model1.AntiShock = data[17];
                        $scope.model1.ObjectMoving = data[18];
                        $scope.model1.FireSpread = data[19];;
                    }
                    if ($scope.groupCode1 == "GIAY_DAN_TUONG") {
                        $scope.tab = 1;
                    }
                    if ($scope.groupCode1 == "REM") {
                        $scope.tab = 2;
                    }
                    if ($scope.groupCode1 == "THAM") {
                        $scope.tab = 3;
                    }
                    if ($scope.groupCode1 == "SAN") {
                        $scope.tab = 4;
                    }
                }
                catch (Exception) { }
                $scope.getQrCodeFromString($scope.model.ProductQrCode);
            }
        });
    }
    $scope.initData();
    $scope.forms = {};

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    var init = function () {
        dataserviceMaterial.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result;
        });
        dataserviceMaterial.getproductgroup(function (result) {
            result = result.data;
            $scope.productgroup = result;
        });
    }
    init();
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
                document.getElementById('imageId1').src = reader.result;
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

    $scope.submit = function () {
        var msg = $rootScope.checkDataMore($scope.model);
        if (msg.Status) {
            App.toastrError(msg.Title);
            return;
        }
        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }

        if ($scope.addform.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                                    App.toastrError(caption.MLP_MSG_IMG_SIZE_MAXIMUM);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataserviceMaterial.uploadImage(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {

                                            $scope.model.Image = '/uploads/images/' + rs.Object;
                                            dataserviceMaterial.updateAttribute($scope.model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
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
                dataserviceMaterial.updateAttribute($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
    $scope.getQrCodeFromString = function () {
        $scope.ImageBase = "";
        //dataserviceMaterial.getQrCodeFromString($rootScope.ProductCode + "_" + $scope.model.AttributeCode, function (rs) {
        //    rs = rs.data;
        //    if (rs) {
        //        if (rs == null || rs == "")
        //            $scope.ImageBase = "";
        //        else
        //            $scope.ImageBase = rs;
        //    }
        //});
    }

    $scope.onTextChange = function () {
        if ($scope.productType == "FE1000") {
            $scope.model.Value =
                //$scope.model.Inheritance + "*" +
                $scope.model.Page + "*" +
                $scope.model.Category + "*" +
                //$scope.model.PricePerM2 + "*" +
                //$scope.model.PricePerM + "*" +
                //$scope.model.Unit + "*" +
                $scope.model.Width + "*" +
                $scope.model.Length + "*" +
                $scope.model.Weight + "*" +
                $scope.model.VerticalStroke + "*" +
                $scope.model.HorizontalStroke + "*" +
                //$scope.model.Note + "*" +
                $scope.model.ESekou + "*" +
                $scope.model.Sx2021 + "*" +
                $scope.model.AntiMold + "*" +
                $scope.model.AntiFouling + "*" +
                $scope.model.AntiBacteria + "*" +
                $scope.model.Deodorant + "*" +
                $scope.model.HumidityControl + "*" +
                $scope.model.HardPaperSurface + "*" +
                $scope.model.FireSpread;
            //$scope.model.AntiScatter + "*" +
            //$scope.model.UVProtection + "*" +
            //$scope.model.InsectRepellent + "*" +
            //$scope.model.BrigthnessControl + "*" +
            //$scope.model.HeatReflection + "*" +
            //$scope.model.OutsideInstallation + "*" +
            //$scope.model.StrongCoated + "*" +
            //$scope.model.LowReflection + "*" +
            //$scope.model.LowReflection + "*" +
            //$scope.model.Material + "*" +
            //$scope.model.Origin;
        }
    }

    $scope.submit1 = function () {

        //if ($scope.tab == 0) {
        if ($scope.forms.addC1more.validate()) {
            $scope.updateTabZero();
        }
        //} else {
        //    if ($scope.groupCode1 == "GIAY_DAN_TUONG") {
        //        $scope.updateFine1000();
        //    }
        //    if ($scope.groupCode1 == "REM") {
        //        $scope.updateSimpleOrder();
        //    }
        //    if ($scope.groupCode1 == "THAM") {
        //        $scope.updateCarpet();
        //    }
        //    if ($scope.groupCode1 == "SAN") {
        //        $scope.updateSfloor();
        //    }
        //}
    }
    $scope.changeTab = function (tab) {
        $scope.tab = tab;
    }
    $scope.updateFine1000 = function () {
        var msg = {};
        var model;
        if ($scope.tab == 0) {
            model = $scope.model;
            msg = $rootScope.checkDataMore1($scope.model, $scope.tab);
        }
        else {
            model = $scope.model1;

            model.Value = $scope.model.Page + "*" +
                model.Category + "*" +
                model.Width + "*" +
                model.Length + "*" +
                model.Weight + "*" +
                model.VerticalStroke + "*" +
                model.HorizontalStroke + "*" +
                model.ESekou + "*" +
                model.Sx2021 + "*" +
                model.AntiMold + "*" +
                model.AntiFouling + "*" +
                model.AntiBacteria + "*" +
                model.Deodorant + "*" +
                model.HumidityControl + "*" +
                model.HardPaperSurface + "*" +
                model.FireSpread + "*" +
                model.PricePerM;
            msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        }
        //if (msg.Status == true) {
        //    App.toastrError(msg.Title);
        //    return;
        //}

        $scope.model.ProductCode = $rootScope.ProductCode;
        model.Type = $rootScope.groupCode;
        model.ProductCode = $rootScope.ProductCode;
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object;

                                        model.Image = '/uploads/images/' + rs.Object;
                                        if ($scope.forms.addC2more.validate()) {
                                            dataserviceMaterial.updateAttribute(model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                                App.unblockUI("#contentMain");
                                            });
                                        }
                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {
            if ($scope.forms.addC2more.validate()) {
                dataserviceMaterial.updateAttribute(model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    App.unblockUI("#contentMain");
                });
            }

        }
    }
    $scope.updateSimpleOrder = function () {
        var msg = {};
        var model;
        if ($scope.tab == 0) {
            model = $scope.model;
            msg = $rootScope.checkDataMore1($scope.model, $scope.tab);
        }
        else {
            model = $scope.model1;
            model.Value = model.Page + "*" +
                model.Category + "*" +
                model.PricePerM + "*" +
                model.Width + "*" +
                model.VerticalStroke + "*" +
                model.HorizontalStroke + "*" +
                model.Length + "*" +
                model.Weight + "*" +
                model.Material + "*" +
                model.Origin;
            msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        }
        //if (msg.Status == true) {
        //    App.toastrError(msg.Title);
        //    return;
        //}
        //else {

        //}

        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }
        $scope.model.ProductCode = $rootScope.ProductCode;
        model.Type = $rootScope.groupCode;
        model.ProductCode = $rootScope.ProductCode;
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object; s
                                        model.Image = '/uploads/images/' + rs.Object;
                                        if ($scope.forms.simpleOrderform.validate()) {
                                            dataserviceMaterial.updateAttribute(model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                                App.unblockUI("#contentMain");
                                            });
                                        }
                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {

            if ($scope.forms.simpleOrderform.validate()) {
                dataserviceMaterial.updateAttribute(model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    App.unblockUI("#contentMain");
                });
            }
        }
    }
    $scope.updateSfloor = function () {
        var msg = {};
        var model;
        if ($scope.tab == 0) {
            model = $scope.model;
            msg = $rootScope.checkDataMore1($scope.model, $scope.tab);
        }
        else {
            model = $scope.model1;
            model.Value = model.Page + "*" +
                model.Category + "*" +
                model.PricePerM2 + "*" +
                model.PricePerM + "*" +
                model.Unit + "*" +
                model.Width + "*" +
                model.Deep + "*" +
                model.Weight + "*" +
                model.VerticalStroke + "*" +
                model.HorizontalStroke + "*" +
                model.AntiBacteria + "*" +
                model.ChemicalResistance + "*" +
                model.Antistatic + "*" +
                model.Wax + "*" +
                model.OutSide + "*" +
                model.AntiFouling + "*" +
                model.AntiMold + "*" +
                model.AntiShock + "*" +
                model.ObjectMoving + "*" +
                model.FireSpread;
            msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        }
        //if (msg.Status == true) {
        //    App.toastrError(msg.Title);
        //    return;
        //}
        //else {

        //}

        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }
        $scope.model.ProductCode = $rootScope.ProductCode;
        model.Type = $rootScope.groupCode;
        model.ProductCode = $rootScope.ProductCode;
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object;

                                        model.Image = '/uploads/images/' + rs.Object;
                                        if ($scope.forms.floormore.validate()) {
                                            dataserviceMaterial.updateAttribute(model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                                App.unblockUI("#contentMain");
                                            });
                                        }
                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {

            if ($scope.forms.floormore.validate()) {
                dataserviceMaterial.updateAttribute(model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    App.unblockUI("#contentMain");
                });
            }
        }
    }
    $scope.updateCarpet = function () {

        var msg = {};
        var model;
        if ($scope.tab == 0) {
            model = $scope.model;
            msg = $rootScope.checkDataMore1($scope.model, $scope.tab);
        }
        else {
            model = $scope.model1;
            model.Value = model.Page + "*" +
                model.Category + "*" +
                model.PricePerM2 + "*" +
                model.PricePerM + "*" +
                model.Unit + "*" +
                model.Width + "*" +
                model.Length + "*" +
                model.CountPerBox + "*" +
                model.M2PerBox + "*" +
                model.Deep + "*" +
                model.TotalDeep + "*" +
                ((model.Structure == null || model.Structure == '' || model.Structure == undefined) ? "_" : model.Structure) + "*" +
                ((model.TextileType == null || model.TextileType == '' || model.TextileType == undefined) ? "_" : model.TextileType) + "*" +
                ((model.Gauge == null || model.Gauge == '' || model.Gauge == undefined) ? "_" : model.Gauge) + "*" +
                ((model.Sticth == null || model.Sticth == '' || model.Sticth == undefined) ? "_" : model.Sticth) + "*" +
                model.Formaldehyde + "*" +
                model.FireSpread + "*" +
                model.Antistatic + "*" +
                model.Friendly + "*" +
                model.ECO_MARK + "*" +
                model.JIS + "*" +
                model.CRI + "*" +
                model.AntiBacteria + "*" +
                model.TravelDensity;
            msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        }
        //if (msg.Status == true) {
        //    App.toastrError(msg.Title);
        //    return;
        //}
        //else {

        //}

        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }
        $scope.model.ProductCode = $rootScope.ProductCode;
        model.Type = $rootScope.groupCode;
        model.ProductCode = $rootScope.ProductCode;
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object;

                                        model.Image = '/uploads/images/' + rs.Object;
                                        if ($scope.forms.carpetmore.validate()) {
                                            dataserviceMaterial.updateAttribute(model, function (rs) {
                                                rs = rs.data;
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                                App.unblockUI("#contentMain");
                                            });
                                        }

                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {

            if ($scope.forms.carpetmore.validate()) {
                dataserviceMaterial.updateAttribute(model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                    App.unblockUI("#contentMain");
                });
            }


        }
    }
    $scope.updateTabZero = function () {
        var msg = {};
        var model;
        //if ($scope.tab == 0) {
        //    model = $scope.model;
        //    msg = $rootScope.checkDataMore1($scope.model, $scope.tab);
        //}
        //else {
        //    model = $scope.model1;
        //    msg = $rootScope.checkDataMore1($scope.model1, $scope.tab);
        //}

        msg = $rootScope.checkValidateValue($scope.model.Value);

        if (msg.Status == true) {
            App.toastrError(msg.Title);
            return;
        }
        if ($rootScope.ProductID == '') {
            App.toastrError(caption.COM_MSG_ADD_BEFORE);
        }
        $scope.model.ProductCode = $rootScope.ProductCode;
        $scope.model.Type = $rootScope.groupCode;
        $scope.model.ProductCode = $rootScope.ProductCode;
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
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
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceMaterial.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        return;
                                    }
                                    else {
                                        ////
                                        $scope.model.Image = '/uploads/images/' + rs.Object;

                                        model.Image = '/uploads/images/' + rs.Object;

                                        dataserviceMaterial.updateAttribute(model, function (rs) {
                                            rs = rs.data;
                                            if (rs.Error) {
                                                App.toastrError(rs.Title);
                                            } else {
                                                App.toastrSuccess(rs.Title);
                                                $uibModalInstance.close();
                                            }
                                            App.unblockUI("#contentMain");
                                        });

                                    }
                                })
                            }
                        };
                    }
                }
            }
        } else {
            dataserviceMaterial.updateAttribute($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
                App.unblockUI("#contentMain");
            });

        }
    }

    //Load init date
    function loadDate() {
        $("#ForeCastTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        //var today = new Date(new Date());
        //$('#ForeCastTime').datepicker('setStartDate', today);
        //$('#ForeCastTime').datepicker('update', new Date());

        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }
    setTimeout(function () {
        loadDate();
    }, 200);

});

app.controller('uploadFine1000Result', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceMaterial, para) {
    $scope.progress = "Trạng thái insert/update";
    $scope.currentTab = 'new';
    $scope.checkAllNew = false;
    $scope.checkAllUpdate = false;
    $scope.checkAllError = false;
    $scope.listError = [];
    $scope.isSave = false;
    $scope.listSelectd = [];
    $scope.listUpdate = [];
    $scope.listNew = [];
    var interval = 300;
    $scope.model = para.list;
    for (var i = 0; i < $scope.model.length; ++i) {
        if ($scope.model[i].Status == "NEW")
            $scope.listNew.push($scope.model[i]);
        else if ($scope.model[i].Status == "UPDATE") {
            $scope.listUpdate.push($scope.model[i]);
        }
        else
            $scope.listError.push($scope.model[i]);
    }
    //"UPDATE"
    $scope.selectTab = function (para) {
        $scope.currentTab = para;
        $scope.checkAllNew = false;
        $scope.checkAllUpdate = false;
        $scope.checkAllError = false;
        $scope.listSelectd = [];
        if ($scope.currentTab == 'new') {
            $scope.unCheckItemInTabUpdate();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'update') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'error') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabUpdate();
        }
        $scope.toggleAll();
    }
    $scope.unCheckItemInTabNew = function () {
        var lenListNew = $scope.listNew.length;
        for (var item = 0; item < lenListNew; ++item) {
            $scope.listNew[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabUpdate = function () {
        var lenListUpdate = $scope.listUpdate.length;
        for (var item = 0; item < lenListUpdate; ++item) {
            $scope.listUpdate[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabError = function () {
        var lenListError = $scope.listError.length;
        for (var item = 0; item < lenListError; ++item) {
            $scope.listError[item].Checked = false;
        }
    }

    // Funtion select All
    $scope.toggleAll = function () {
        if ($scope.currentTab == 'new') {
            for (var item = 0; item < $scope.listNew.length; ++item) {
                $scope.listNew[item].Checked = $scope.checkAllNew;
            }
        }
        if ($scope.currentTab == 'update') {
            for (var item = 0; item < $scope.listUpdate.length; ++item) {
                $scope.listUpdate[item].Checked = $scope.checkAllUpdate;
            }
        }
        if ($scope.currentTab == 'error') {
            for (var item = 0; item < $scope.listError.length; ++item) {
                $scope.listError[item].Checked = $scope.checkAllError;
            }
        }
    }

    // Funtion select One
    $scope.toggleOne = function (Id) {
        var count = 0;
        if ($scope.currentTab == 'new') {
            var lenListNew = $scope.listNew.length;
            for (var item = 0; item < lenListNew; ++item) {
                if ($scope.listNew[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllNew = false;
                    return;
                }
            }
            if (count == lenListNew)
                $scope.checkAllNew = true;
            else
                $scope.checkAllNew = false;
        }
        if ($scope.currentTab == 'update') {
            var lenListUpdate = $scope.listUpdate.length;
            for (var item = 0; item < lenListUpdate; ++item) {
                if ($scope.listUpdate[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllUpdate = false;
                    return;
                }
            }
            if (count == lenListUpdate)
                $scope.checkAllUpdate = true;
            else
                $scope.checkAllUpdate = false;
        }
        if ($scope.currentTab == 'error') {
            var lenListError = $scope.listError.length;
            for (var item = 0; item < lenListError; ++item) {
                if ($scope.listError[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllError = false;
                    return;
                }
            }
            if (count == lenListError)
                $scope.checkAllError = true;
            else
                $scope.checkAllError = false;
        }
    }


    $scope.deleteItems = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                if ($scope.currentTab == 'new') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listNew.indexOf(e);
                        $scope.listNew.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
                else if ($scope.currentTab == 'update') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listUpdate.indexOf(e);
                        $scope.listUpdate.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
            }
            else {
                App.toastrError(caption.COM_MSG_RECORD_DELETE);
            }
        }
    }

    $scope.saveAllItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listSelectd = $scope.listNew;
            }
            else if ($scope.currentTab == 'update') {
                $scope.listSelectd = $scope.listUpdate;
            }
            var lenListAll = $scope.listSelectd.length;

            if (lenListAll > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                //setTimeout(checkProgress, 2000);
                dataserviceMaterial.saveItems($scope.listSelectd, function (rs) {
                    rs = rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);
                        if ($scope.currentTab == 'new') {
                            $scope.listNew = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listUpdate = [];
                        }
                    }
                    $scope.isSave = false;

                    App.unblockUI("#modal-body");
                });
            }
            else {
                App.toastrError(caption.COM_MSG_NOT_EXIST_RECORD);
            }
        }
    }
    $scope.saveSelectedItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                //setTimeout(checkProgress, 2000);
                dataserviceMaterial.saveItems($scope.listSelectd, function (rs) {
                    rs = rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);
                        if ($scope.currentTab == 'new') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listNew.indexOf(e);
                                $scope.listNew.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listUpdate.indexOf(e);
                                $scope.listUpdate.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                    }
                    $scope.isSave = false;

                    App.unblockUI("#modal-body");
                });
            }
            else {
                App.toastrError(caption.COM_MSG_RECORD_ADD);
            }
        }
    }
    function checkProgress() {
        $.ajax({
            type: 'POST',
            url: '/Admin/MaterialProduct/GetPercent',
            cache: false,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                if (data != 'Done') {
                    $scope.progress = data;
                    setTimeout(checkProgress, interval);
                }
                else {
                    $scope.progress = '';
                    $scope.$apply();
                }
            }
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
});

app.controller('uploadRemResult', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceMaterial, para) {
    $scope.progress = "Trạng thái insert/update";
    $scope.currentTab = 'new';
    $scope.checkAllNew = false;
    $scope.checkAllUpdate = false;
    $scope.checkAllError = false;
    $scope.listError = [];
    $scope.isSave = false;
    $scope.listSelectd = [];
    $scope.listUpdate = [];
    $scope.listNew = [];
    var interval = 300;
    $scope.model = para.list;
    for (var i = 0; i < $scope.model.length; ++i) {
        if ($scope.model[i].Status == "NEW")
            $scope.listNew.push($scope.model[i]);
        else if ($scope.model[i].Status == "UPDATE") {
            $scope.listUpdate.push($scope.model[i]);
        }
        else
            $scope.listError.push($scope.model[i]);
    }
    //"UPDATE"
    $scope.selectTab = function (para) {
        $scope.currentTab = para;
        $scope.checkAllNew = false;
        $scope.checkAllUpdate = false;
        $scope.checkAllError = false;
        $scope.listSelectd = [];
        if ($scope.currentTab == 'new') {
            $scope.unCheckItemInTabUpdate();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'update') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'error') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabUpdate();
        }
        $scope.toggleAll();
    }
    $scope.unCheckItemInTabNew = function () {
        var lenListNew = $scope.listNew.length;
        for (var item = 0; item < lenListNew; ++item) {
            $scope.listNew[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabUpdate = function () {
        var lenListUpdate = $scope.listUpdate.length;
        for (var item = 0; item < lenListUpdate; ++item) {
            $scope.listUpdate[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabError = function () {
        var lenListError = $scope.listError.length;
        for (var item = 0; item < lenListError; ++item) {
            $scope.listError[item].Checked = false;
        }
    }

    // Funtion select All
    $scope.toggleAll = function () {
        if ($scope.currentTab == 'new') {
            for (var item = 0; item < $scope.listNew.length; ++item) {
                $scope.listNew[item].Checked = $scope.checkAllNew;
            }
        }
        if ($scope.currentTab == 'update') {
            for (var item = 0; item < $scope.listUpdate.length; ++item) {
                $scope.listUpdate[item].Checked = $scope.checkAllUpdate;
            }
        }
        if ($scope.currentTab == 'error') {
            for (var item = 0; item < $scope.listError.length; ++item) {
                $scope.listError[item].Checked = $scope.checkAllError;
            }
        }
    }

    // Funtion select One
    $scope.toggleOne = function (Id) {
        var count = 0;
        if ($scope.currentTab == 'new') {
            var lenListNew = $scope.listNew.length;
            for (var item = 0; item < lenListNew; ++item) {
                if ($scope.listNew[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllNew = false;
                    return;
                }
            }
            if (count == lenListNew)
                $scope.checkAllNew = true;
            else
                $scope.checkAllNew = false;
        }
        if ($scope.currentTab == 'update') {
            var lenListUpdate = $scope.listUpdate.length;
            for (var item = 0; item < lenListUpdate; ++item) {
                if ($scope.listUpdate[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllUpdate = false;
                    return;
                }
            }
            if (count == lenListUpdate)
                $scope.checkAllUpdate = true;
            else
                $scope.checkAllUpdate = false;
        }
        if ($scope.currentTab == 'error') {
            var lenListError = $scope.listError.length;
            for (var item = 0; item < lenListError; ++item) {
                if ($scope.listError[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllError = false;
                    return;
                }
            }
            if (count == lenListError)
                $scope.checkAllError = true;
            else
                $scope.checkAllError = false;
        }
    }


    $scope.deleteItems = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                if ($scope.currentTab == 'new') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listNew.indexOf(e);
                        $scope.listNew.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
                else if ($scope.currentTab == 'update') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listUpdate.indexOf(e);
                        $scope.listUpdate.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
            }
            else {
                App.toastrError(caption.COM_MSG_RECORD_DELETE);
            }
        }
    }

    $scope.saveAllItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listSelectd = $scope.listNew;
            }
            else if ($scope.currentTab == 'update') {
                $scope.listSelectd = $scope.listUpdate;
            }
            var lenListAll = $scope.listSelectd.length;

            if (lenListAll > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                //setTimeout(checkProgress, 2000);
                dataserviceMaterial.saveItems($scope.listSelectd, function (rs) {
                    rs = rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);
                        if ($scope.currentTab == 'new') {
                            $scope.listNew = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listUpdate = [];
                        }
                    }
                    $scope.isSave = false;

                    App.unblockUI("#modal-body");
                });
            }
            else {
                App.toastrError(caption.COM_MSG_NOT_EXIST_RECORD);
            }
        }
    }
    $scope.saveSelectedItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                //setTimeout(checkProgress, 2000);
                dataserviceMaterial.saveItems($scope.listSelectd, function (rs) {
                    rs = rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);
                        if ($scope.currentTab == 'new') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listNew.indexOf(e);
                                $scope.listNew.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listUpdate.indexOf(e);
                                $scope.listUpdate.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                    }
                    $scope.isSave = false;

                    App.unblockUI("#modal-body");
                });
            }
            else {
                App.toastrError(caption.COM_MSG_RECORD_ADD);
            }
        }
    }
    function checkProgress() {
        $.ajax({
            type: 'POST',
            url: '/Admin/MaterialProduct/GetPercent',
            cache: false,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                if (data != 'Done') {
                    $scope.progress = data;
                    setTimeout(checkProgress, interval);
                }
                else {
                    $scope.progress = '';
                    $scope.$apply();
                }
            }
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
});

app.controller('uploadFloorResult', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceMaterial, para) {
    $scope.progress = "Trạng thái insert/update";
    $scope.currentTab = 'new';
    $scope.checkAllNew = false;
    $scope.checkAllUpdate = false;
    $scope.checkAllError = false;
    $scope.listError = [];
    $scope.isSave = false;
    $scope.listSelectd = [];
    $scope.listUpdate = [];
    $scope.listNew = [];
    var interval = 300;
    $scope.model = para.list;
    for (var i = 0; i < $scope.model.length; ++i) {
        if ($scope.model[i].Status == "NEW")
            $scope.listNew.push($scope.model[i]);
        else if ($scope.model[i].Status == "UPDATE") {
            $scope.listUpdate.push($scope.model[i]);
        }
        else
            $scope.listError.push($scope.model[i]);
    }
    //"UPDATE"
    $scope.selectTab = function (para) {
        $scope.currentTab = para;
        $scope.checkAllNew = false;
        $scope.checkAllUpdate = false;
        $scope.checkAllError = false;
        $scope.listSelectd = [];
        if ($scope.currentTab == 'new') {
            $scope.unCheckItemInTabUpdate();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'update') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'error') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabUpdate();
        }
        $scope.toggleAll();
    }
    $scope.unCheckItemInTabNew = function () {
        var lenListNew = $scope.listNew.length;
        for (var item = 0; item < lenListNew; ++item) {
            $scope.listNew[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabUpdate = function () {
        var lenListUpdate = $scope.listUpdate.length;
        for (var item = 0; item < lenListUpdate; ++item) {
            $scope.listUpdate[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabError = function () {
        var lenListError = $scope.listError.length;
        for (var item = 0; item < lenListError; ++item) {
            $scope.listError[item].Checked = false;
        }
    }

    // Funtion select All
    $scope.toggleAll = function () {
        if ($scope.currentTab == 'new') {
            for (var item = 0; item < $scope.listNew.length; ++item) {
                $scope.listNew[item].Checked = $scope.checkAllNew;
            }
        }
        if ($scope.currentTab == 'update') {
            for (var item = 0; item < $scope.listUpdate.length; ++item) {
                $scope.listUpdate[item].Checked = $scope.checkAllUpdate;
            }
        }
        if ($scope.currentTab == 'error') {
            for (var item = 0; item < $scope.listError.length; ++item) {
                $scope.listError[item].Checked = $scope.checkAllError;
            }
        }
    }

    // Funtion select One
    $scope.toggleOne = function (Id) {
        var count = 0;
        if ($scope.currentTab == 'new') {
            var lenListNew = $scope.listNew.length;
            for (var item = 0; item < lenListNew; ++item) {
                if ($scope.listNew[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllNew = false;
                    return;
                }
            }
            if (count == lenListNew)
                $scope.checkAllNew = true;
            else
                $scope.checkAllNew = false;
        }
        if ($scope.currentTab == 'update') {
            var lenListUpdate = $scope.listUpdate.length;
            for (var item = 0; item < lenListUpdate; ++item) {
                if ($scope.listUpdate[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllUpdate = false;
                    return;
                }
            }
            if (count == lenListUpdate)
                $scope.checkAllUpdate = true;
            else
                $scope.checkAllUpdate = false;
        }
        if ($scope.currentTab == 'error') {
            var lenListError = $scope.listError.length;
            for (var item = 0; item < lenListError; ++item) {
                if ($scope.listError[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllError = false;
                    return;
                }
            }
            if (count == lenListError)
                $scope.checkAllError = true;
            else
                $scope.checkAllError = false;
        }
    }


    $scope.deleteItems = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                if ($scope.currentTab == 'new') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listNew.indexOf(e);
                        $scope.listNew.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
                else if ($scope.currentTab == 'update') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listUpdate.indexOf(e);
                        $scope.listUpdate.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
            }
            else {
                App.toastrError(caption.COM_MSG_RECORD_DELETE);
            }
        }
    }

    $scope.saveAllItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listSelectd = $scope.listNew;
            }
            else if ($scope.currentTab == 'update') {
                $scope.listSelectd = $scope.listUpdate;
            }
            var lenListAll = $scope.listSelectd.length;

            if (lenListAll > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                //setTimeout(checkProgress, 2000);
                dataserviceMaterial.saveItems($scope.listSelectd, function (rs) {
                    rs = rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);
                        if ($scope.currentTab == 'new') {
                            $scope.listNew = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listUpdate = [];
                        }
                    }
                    $scope.isSave = false;

                    App.unblockUI("#modal-body");
                });
            }
            else {
                App.toastrError(caption.COM_MSG_NOT_EXIST_RECORD);
            }
        }
    }
    $scope.saveSelectedItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                //setTimeout(checkProgress, 2000);
                dataserviceMaterial.saveItems($scope.listSelectd, function (rs) {
                    rs = rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);
                        if ($scope.currentTab == 'new') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listNew.indexOf(e);
                                $scope.listNew.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listUpdate.indexOf(e);
                                $scope.listUpdate.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                    }
                    $scope.isSave = false;

                    App.unblockUI("#modal-body");
                });
            }
            else {
                App.toastrError(caption.COM_MSG_RECORD_ADD);
            }
        }
    }
    function checkProgress() {
        $.ajax({
            type: 'POST',
            url: '/Admin/MaterialProduct/GetPercent',
            cache: false,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                if (data != 'Done') {
                    $scope.progress = data;
                    setTimeout(checkProgress, interval);
                }
                else {
                    $scope.progress = '';
                    $scope.$apply();
                }
            }
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
});

app.controller('uploadCarpetResult', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceMaterial, para) {
    $('.pane-hScroll').scroll(function () {
        $('.pane-vScroll').width($('.pane-hScroll').width() + $('.pane-hScroll').scrollLeft());
    });
    $scope.progress = "Trạng thái insert/update";
    $scope.currentTab = 'new';
    $scope.checkAllNew = false;
    $scope.checkAllUpdate = false;
    $scope.checkAllError = false;
    $scope.listError = [];
    $scope.isSave = false;
    $scope.listSelectd = [];
    $scope.listUpdate = [];
    $scope.listNew = [];
    var interval = 300;
    $scope.model = para.list;
    for (var i = 0; i < $scope.model.length; ++i) {
        if ($scope.model[i].Status == "NEW")
            $scope.listNew.push($scope.model[i]);
        else if ($scope.model[i].Status == "UPDATE") {
            $scope.listUpdate.push($scope.model[i]);
        }
        else
            $scope.listError.push($scope.model[i]);
    }
    //"UPDATE"
    $scope.selectTab = function (para) {
        $scope.currentTab = para;
        $scope.checkAllNew = false;
        $scope.checkAllUpdate = false;
        $scope.checkAllError = false;
        $scope.listSelectd = [];
        if ($scope.currentTab == 'new') {
            $scope.unCheckItemInTabUpdate();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'update') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'error') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabUpdate();
        }
        $scope.toggleAll();
    }
    $scope.unCheckItemInTabNew = function () {
        var lenListNew = $scope.listNew.length;
        for (var item = 0; item < lenListNew; ++item) {
            $scope.listNew[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabUpdate = function () {
        var lenListUpdate = $scope.listUpdate.length;
        for (var item = 0; item < lenListUpdate; ++item) {
            $scope.listUpdate[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabError = function () {
        var lenListError = $scope.listError.length;
        for (var item = 0; item < lenListError; ++item) {
            $scope.listError[item].Checked = false;
        }
    }

    // Funtion select All
    $scope.toggleAll = function () {
        if ($scope.currentTab == 'new') {
            for (var item = 0; item < $scope.listNew.length; ++item) {
                $scope.listNew[item].Checked = $scope.checkAllNew;
            }
        }
        if ($scope.currentTab == 'update') {
            for (var item = 0; item < $scope.listUpdate.length; ++item) {
                $scope.listUpdate[item].Checked = $scope.checkAllUpdate;
            }
        }
        if ($scope.currentTab == 'error') {
            for (var item = 0; item < $scope.listError.length; ++item) {
                $scope.listError[item].Checked = $scope.checkAllError;
            }
        }
    }

    // Funtion select One
    $scope.toggleOne = function (Id) {
        var count = 0;
        if ($scope.currentTab == 'new') {
            var lenListNew = $scope.listNew.length;
            for (var item = 0; item < lenListNew; ++item) {
                if ($scope.listNew[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllNew = false;
                    return;
                }
            }
            if (count == lenListNew)
                $scope.checkAllNew = true;
            else
                $scope.checkAllNew = false;
        }
        if ($scope.currentTab == 'update') {
            var lenListUpdate = $scope.listUpdate.length;
            for (var item = 0; item < lenListUpdate; ++item) {
                if ($scope.listUpdate[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllUpdate = false;
                    return;
                }
            }
            if (count == lenListUpdate)
                $scope.checkAllUpdate = true;
            else
                $scope.checkAllUpdate = false;
        }
        if ($scope.currentTab == 'error') {
            var lenListError = $scope.listError.length;
            for (var item = 0; item < lenListError; ++item) {
                if ($scope.listError[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllError = false;
                    return;
                }
            }
            if (count == lenListError)
                $scope.checkAllError = true;
            else
                $scope.checkAllError = false;
        }
    }


    $scope.deleteItems = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                if ($scope.currentTab == 'new') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listNew.indexOf(e);
                        $scope.listNew.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
                else if ($scope.currentTab == 'update') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listUpdate.indexOf(e);
                        $scope.listUpdate.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
            }
            else {
                App.toastrError(caption.COM_MSG_RECORD_DELETE);
            }
        }
    }

    $scope.saveAllItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listSelectd = $scope.listNew;
            }
            else if ($scope.currentTab == 'update') {
                $scope.listSelectd = $scope.listUpdate;
            }
            var lenListAll = $scope.listSelectd.length;

            if (lenListAll > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                //setTimeout(checkProgress, 2000);
                dataserviceMaterial.saveItems($scope.listSelectd, function (rs) {
                    rs = rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);
                        if ($scope.currentTab == 'new') {
                            $scope.listNew = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listUpdate = [];
                        }
                    }
                    $scope.isSave = false;

                    App.unblockUI("#modal-body");
                });
            }
            else {
                App.toastrError(caption.COM_MSG_NOT_EXIST_RECORD);
            }
        }
    }
    $scope.saveSelectedItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                //setTimeout(checkProgress, 2000);
                dataserviceMaterial.saveItems($scope.listSelectd, function (rs) {
                    rs = rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);
                        if ($scope.currentTab == 'new') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listNew.indexOf(e);
                                $scope.listNew.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listUpdate.indexOf(e);
                                $scope.listUpdate.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                    }
                    $scope.isSave = false;

                    App.unblockUI("#modal-body");
                });
            }
            else {
                App.toastrError(caption.COM_MSG_RECORD_ADD);
            }
        }
    }
    function checkProgress() {
        $.ajax({
            type: 'POST',
            url: '/Admin/MaterialProduct/GetPercent',
            cache: false,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                if (data != 'Done') {
                    $scope.progress = data;
                    setTimeout(checkProgress, interval);
                }
                else {
                    $scope.progress = '';
                    $scope.$apply();
                }
            }
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
});

app.controller('tabAttribute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {};
    $scope.listProductAttributeMain = [];
    $scope.listProductAttributeChildren = [];
    $scope.listValues = [];
    $scope.url = "/Admin/MaterialProduct/JTableAttributeMore";
    if ($rootScope.prodCustomUuid) {
        $scope.url = "/Admin/MaterialProduct/JTableAttributeMoreStatic";
    }
    $rootScope.isEditAttribute = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: $scope.url,
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $rootScope.ProductCode;
                d.Uuid = $rootScope.prodCustomUuid;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrCode').withTitle('{{"MLP_LIST_COL_ATTRIBUTE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrName').withTitle('{{"MLP_LIST_COL_ATTRIBUTE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrValue').withTitle('{{"MLP_LIST_COL_VALUE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"MLP_LIST_COL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"MLP_LIST_COL_GROUP" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DataType').withTitle('{{"MLP_LIST_COL_DATA_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Parent').withTitle('{{"MLP_LIST_COL_PARENT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"MLP_LIST_COL_ACTION" | translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
        dataserviceMaterial.getListProductAttributeMain(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.listProductAttributeMain = rs.Object;
            }
        })
    };

    $scope.init();

    $rootScope.initAttr = function () {
        $scope.init();
    };

    $scope.selectAttributeMain = function (code) {
        $scope.errorAttrCode = false;
        $scope.listValues = [];
        $scope.model.ProductAttributeChildren = '';
        dataserviceMaterial.getListProductAttributeChildren(code, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                $scope.model.AttrCode = '';
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
            templateUrl: ctxfolderMaterialProd + '/add-attr-main.html',
            controller: 'addProductAttribute',
            size: '40',
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.add = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ProductCode = $rootScope.ProductCode;
            if ($rootScope.prodCustomUuid) {
                dataserviceMaterial.insertAttributeMoreStatic($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadAttribute();
                        var listdata = $('#tblDataAttribute').DataTable().data();
                        $rootScope.listProductAttributes = listdata.toArray().map(x => {
                            return { AttrCode: x.AttrCode, AttrValue: x.AttrValue };
                        });
                        $rootScope.listProductAttributes.push({
                            AttrCode: $scope.model.AttrCode, AttrValue: $scope.model.AttrValue
                        });
                        console.log($rootScope.listProductAttributes);
                    }
                })
            }
            else {
                dataserviceMaterial.insertAttributeMore($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadAttribute();
                        $uibModalInstance.close(rs.Object);
                    }
                })
            }
        }
    };

    function validationSelect(data) {

        var mess = { Status: false, Title: "" };
        if (data.AttrCode === "" || data.AttrCode === null || data.AttrCode === undefined) {
            $scope.errorAttrCode = true;
            mess.Status = true;
        } else {
            $scope.errorAttrCode = false;
        }
        return mess;
    };

    $scope.inheritance = function () {
        $scope.model.Inheritance = $rootScope.Inheritance;
        if ($scope.model.Inheritance == '' || $scope.model.Inheritance == undefined) {
            App.toastrError(caption.MLP_MSG_NOT_PICK_PRODUCT);
        } else {
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataserviceMaterial.insertInheritanceAttributeMore($scope.model.ProductCode, $scope.model.Inheritance, function (rs) {
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
        if ($rootScope.prodCustomUuid) {
            var userModel = {};
            var listdata = $('#tblDataAttribute').DataTable().data();
            for (var i = 0; i < listdata.length; i++) {
                if (listdata[i].Id == id) {
                    userModel = listdata[i];
                    break;
                }
            }
            var obj = {
                ProductCode: $rootScope.ProductCode,
                AttrCode: userModel.AttrCode,
            };
            dataserviceMaterial.getDetailAttributeMoreStatic(obj, function (rs) {
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
        else {
            dataserviceMaterial.getDetailAttributeMore(id, function (rs) {
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
    }
    $scope.submit = function () {
        if ($rootScope.prodCustomUuid) {
            return $scope.submitStatic();
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataserviceMaterial.updateAttributeMore($scope.model, function (rs) {
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
    $scope.submitStatic = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataserviceMaterial.updateAttributeMoreStatic($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.isEditAttribute = false;
                    $rootScope.reloadAttribute();
                    var listdata = $('#tblDataAttribute').DataTable().data();
                    $rootScope.listProductAttributes = listdata.toArray().map(x => {
                        return { AttrCode: x.AttrCode, AttrValue: x.AttrValue };
                    });
                    var index = $rootScope.listProductAttributes.findIndex(x => x.AttrCode == $scope.model.AttrCode);
                    if (index != -1) {
                        $rootScope.listProductAttributes[index] = {
                            AttrCode: $scope.model.AttrCode, AttrValue: $scope.model.AttrValue
                        };
                        console.log($rootScope.listProductAttributes);
                    }
                }
            })
        }
    }
    $scope.cancel = function () {
        $rootScope.isEditAttribute = false;
    }
    $scope.delete = function (id) {
        var userModel = {};
        var listdata = $('#tblDataAttribute').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var obj = {
            ProductCode: $rootScope.ProductCode,
            AttrCode: userModel.AttrCode,
        };
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    if ($rootScope.prodCustomUuid) {
                        dataserviceMaterial.deleteAttributeMoreStatic(obj, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $rootScope.reloadAttribute();
                                $rootScope.isEditAttribute = false;
                                var listdata = $('#tblDataAttribute').DataTable().data();
                                $rootScope.listProductAttributes = listdata.toArray().map(x => {
                                    return { AttrCode: x.AttrCode, AttrValue: x.AttrValue };
                                });
                                $rootScope.listProductAttributes.splice(id, 1);
                                console.log($rootScope.listProductAttributes);
                                $uibModalInstance.close();
                            }
                        });
                    }
                    else {
                        dataserviceMaterial.deleteAttributeMore(id, function (result) {
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
                    }
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

app.controller('tabComponent', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {};
    $scope.listProductAttributeMain = [];
    $scope.listProductAttributeChildren = [];
    $scope.listValues = [];
    $scope.productImpType = [];
    $rootScope.isEditComponent = false;
    $scope.url = "/Admin/MaterialProduct/JTableComponent";
    if ($rootScope.prodCustomUuid) {
        $scope.url = "/Admin/MaterialProduct/JTableComponentStatic";
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: $scope.url,
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $rootScope.ProductCode;
                d.Uuid = $rootScope.prodCustomUuid;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataComponent");
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"MLP_CURD_LBL_COMPONENT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"MLP_CURD_LBL_COMPONENT_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"MLP_CURD_LBL_COMPONENT_QUANTITY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"MLP_CURD_LBL_COMPONENT_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"MLP_LIST_COL_ACTION" | translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
    $rootScope.reloadComponent = function () {
        $scope.reload();
    }
    // load more product (product > 1000)
    $rootScope.pageCategory = 1;
    $rootScope.pageSizeCategory = 25;
    $rootScope.codeSearchCategory = '';
    $scope.init = function () {
        dataserviceMaterial.getProductImpType(function (result) {
            result = result.data;
            $scope.productImpType = result;
        });
        dataserviceMaterial.getListProductAttributeMain(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.listProductAttributeMain = rs.Object;
            }
        })
        $rootScope.loadMoreCategory = function ($select, $event) {
            if (!$event) {
                $rootScope.pageCategory = 1;
                $scope.listProduct = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.pageCategory++;
            }
            var productcode = '';
            dataserviceMaterial.getListProductCategory($rootScope.pageCategory, $rootScope.pageSizeCategory, $rootScope.codeSearchCategory, productcode, function (rs) {
                rs = rs.data;
                $scope.listProduct = $scope.listProduct.concat(rs);
                $scope.listProduct = removeDuplicate($scope.listProduct);
            });
        }
    };

    $scope.init();
    // reload data search
    $rootScope.reloadProductCategory = function (input) {
        $rootScope.codeSearchCategory = input;
        $rootScope.pageCategory = 1;
        $scope.listProduct = [];
        var productcode = '';
        dataserviceMaterial.getListProductCategory($rootScope.pageCategory, $rootScope.pageSizeCategory, $rootScope.codeSearchCategory, productcode, function (rs) {
            rs = rs.data;
            $scope.listProduct = $scope.listProduct.concat(rs);
            $scope.listProduct = removeDuplicate($scope.listProduct);
        });
    }

    $scope.selectAttributeMain = function (code) {
        $scope.listValues = [];
        $scope.model.ProductAttributeChildren = '';
        dataserviceMaterial.getListProductAttributeChildren(code, function (rs) {
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
    $scope.add = function () {
        if ($rootScope.prodCustomUuid) {
            if ($scope.addform.validate()) {
                $scope.model.ProductCode = $rootScope.ProductCode;
                dataserviceMaterial.insertComponentStatic($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadComponent();
                        var listdata = $('#tblDataComponent').DataTable().data();
                        $rootScope.listProductComponents = listdata.toArray().map(x => {
                            return {
                                ProductCode: x.ProductCode,
                                Code: x.Code,
                                Name: x.Name,
                                Quantity: x.Quantity,
                                Unit: x.Unit,
                            };
                        });
                        $rootScope.listProductComponents.push({
                            ProductCode: $scope.model.ProductCode,
                            Code: $scope.model.Code,
                            Name: $scope.model.Name,
                            Quantity: $scope.model.Quantity,
                            Unit: $scope.model.Unit,
                        });
                        console.log($rootScope.listProductComponents);
                    }
                });
            }
        }
        else {
            if ($scope.addform.validate()) {
                $scope.model.ProductCode = $rootScope.ProductCode;
                dataserviceMaterial.insertComponent($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadComponent();
                    }
                });
            }
        }
    };
    $scope.inheritance = function () {
        $scope.model.Inheritance = $rootScope.Inheritance;
        if ($scope.model.Inheritance == '' || $scope.model.Inheritance == undefined) {
            App.toastrError(caption.MLP_MSG_NOT_PICK_PRODUCT);
        } else {
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataserviceMaterial.insertInheritanceAttributeMore($scope.model.ProductCode, $scope.model.Inheritance, function (rs) {
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
        if ($rootScope.prodCustomUuid) {
            var userModel = {};
            var listdata = $('#tblDataComponent').DataTable().data();
            for (var i = 0; i < listdata.length; i++) {
                if (listdata[i].Id == id) {
                    userModel = listdata[i];
                    break;
                }
            }
            var obj = {
                ProductCode: $rootScope.ProductCode,
                Code: userModel.Code,
            };
            var productcode = '';
            dataserviceMaterial.getDetailComponentStatic(obj, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = rs.Object;
                    $rootScope.isEditComponent = true;
                }
            });
            $rootScope.pageCategory = 1;
            //$scope.listProduct = [];
            dataserviceMaterial.getListProductCategory($rootScope.pageCategory, $rootScope.pageSizeCategory, $rootScope.codeSearchCategory, productcode, function (rs) {
                rs = rs.data;
                $scope.listProduct = $scope.listProduct.concat(rs);
                $scope.listProduct = removeDuplicate($scope.listProduct);
            });
        }
        else {
            var productcode = '';
            dataserviceMaterial.getDetailComponent(id, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = rs.Object;
                    console.log($scope.model.Code);
                    productcode = $scope.model.Code;
                    $rootScope.isEditComponent = true;
                }
            });
            $rootScope.pageCategory = 1;
            //$scope.listProduct = [];
            dataserviceMaterial.getListProductCategory($rootScope.pageCategory, $rootScope.pageSizeCategory, $rootScope.codeSearchCategory, productcode, function (rs) {
                rs = rs.data;
                $scope.listProduct = $scope.listProduct.concat(rs);
                $scope.listProduct = removeDuplicate($scope.listProduct);
            });
        }
    };
    $scope.submit = function () {
        if ($rootScope.prodCustomUuid) {
            return $scope.submitStatic();
        }
        if ($scope.addform.validate()) {
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataserviceMaterial.updateComponent($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.isEditComponent = false;
                    $rootScope.reloadComponent();
                }
            });
        }
    };
    $scope.submitStatic = function () {
        if ($scope.addform.validate()) {
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataserviceMaterial.updateComponentStatic($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.isEditComponent = false;
                    $rootScope.reloadComponent();
                    var listdata = $('#tblDataComponent').DataTable().data();
                    $rootScope.listProductComponents = listdata.toArray().map(x => {
                        return {
                            ProductCode: x.ProductCode,
                            Code: x.Code,
                            Name: x.Name,
                            Quantity: x.Quantity,
                            Unit: x.Unit,
                        };
                    });
                    var index = $rootScope.listProductComponents.findIndex(x => x.Code == $scope.model.Code);
                    if (index != -1) {
                        $rootScope.listProductAttributes[index] = {
                            Code: $scope.model.Code, Name: $scope.model.Name
                        };
                        console.log($rootScope.listProductComponents);
                    }
                }
            });
        }
    }
    $scope.cancel = function () {
        $rootScope.isEditComponent = false;
    }
    $scope.delete = function (id) {
        var userModel = {};
        var listdata = $('#tblDataComponent').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var obj = {
            ProductCode: $rootScope.ProductCode,
            Code: userModel.Code,
        };
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    if ($rootScope.prodCustomUuid) {
                        var userModel = {};
                        var listdata = $('#tblDataComponent').DataTable().data();
                        for (var i = 0; i < listdata.length; i++) {
                            if (listdata[i].Id == id) {
                                userModel = listdata[i];
                                break;
                            }
                        }
                        var obj = {
                            ProductCode: $rootScope.ProductCode,
                            Code: userModel.Code,
                        };
                        dataserviceMaterial.deleteComponentStatic(obj, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $rootScope.reloadComponent();
                                $rootScope.isEditComponent = false;
                                $uibModalInstance.close();
                            }
                        });
                    }
                    else {
                        dataserviceMaterial.deleteComponent(id, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $rootScope.reloadComponent();
                                $rootScope.isEditComponent = false;
                                $uibModalInstance.close();
                            }
                        });
                    }
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

app.controller('slideImage', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter, para) {
    var fisrtImg = [];
    var nextImgs = [];
    if (para != '')
        fisrtImg.push(para);
    $scope.model = {
        fisrtImg: fisrtImg,
        nextImgs: nextImgs
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});

app.controller('tabHistoryProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterial, $translate, $filter) {
    $scope.model = {
        productcode: '',
        productname: '',
        unit: '',
        describe: '',
    }

    $scope.listTypes = [
        {
            Code: '',
            Name: 'Tất cả'
        },
        {
            Code: "IMPORT_RETURN",
            Name: "Nhập trả về"
        },
        {
            Code: "ARRANGE_IMP",
            Name: "Xếp nhập"
        },
        {
            Code: "EXPORT_PARTIAL",
            Name: "Xuất linh kiện"
        },
        {
            Code: "EXPORT_FULL",
            Name: "Xuất đầy đủ"
        },
        {
            Code: "REARRANGE",
            Name: "Xếp lại"
        }
    ];

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialProductHistorySale/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Code = $rootScope.ProductCode;
                d.Name = $scope.model.Name;
                d.FromTo = $scope.model.FromTo;
                d.DateTo = $scope.model.DateTo;
                d.Category = $rootScope.ProductCode;
                d.ContractCode = $scope.model.ContractCode;
                d.CusCode = $scope.model.CusCode;
                d.SupCode = $scope.model.SupCode;
                d.Type = $scope.model.Type;
                d.MappingCode = $scope.model.MappingCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataHis");
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    var ad = 0;
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"STT" | translate}}').withOption('sClass', 'dataTable-10per').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"Kiểu" | translate}}').withOption('sClass', 'dataTable-20per').renderWith(function (data, type) {
        if (data == "EXPORT_PARTIAL" || data == "EXPORT_FULL")
            return '<span class="text-danger bold">Xuất (rút)</span>';
        if (data == "ARRANGE_IMP" || data == "IMPORT_RETURN")
            return '<span class="text-success bold">Nhập (trả)</span>';
        return '<span class="text-info bold">Xếp lại</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"Tên phiếu [ Vị trí cũ]" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        if (full.Type == "IMPORT_RETURN")
            return `<span class="bold">${full.TicketNameImpReturn}</span>`;
        if (full.Type == "EXPORT_PARTIAL")
            return `<span class="bold">${full.TicketNameExportPartial}</span>`;
        if (full.Type == "ARRANGE_IMP")
            return `<span class="bold">${full.TicketNameImpArrange}</span>`;
        if (full.Type == "EXPORT_FULL")
            return `<span class="bold">${full.TicketNameExportFull}</span>`;
        if (full.Type == "REARRANGE")
            return `<span class="bold">${full.MappingCodeOld}</span>`;
        return 'Không xác định';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MappingCode').withTitle('{{"Vị trí" | translate}}').renderWith(function (data, type, full) {
        if (full.Type != "EXPORT_FULL") {
            return data;
        }
        else {
            return full.MappingCodeOld;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withTitle('{{"MLP_TAB_HISTORY_LIST_COL_QUANTIY" | translate}}').renderWith(function (data, type, full) {
        return "<span class='text-primary'>" + data + "</span>";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductNo').withTitle('{{"Thứ tự" | translate}}').renderWith(function (data, type, full) {
        return "<span class='text-primary'>" + data + "</span>";
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GattrFlatCode').withTitle('{{"Thuộc tính" | translate}}').renderWith(function (data, type) {
        return "<span class='text-primary'>" + data + "</span>";
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataserviceMaterial.gettreedataLevel(function (result) {
            result = result.data;
            $scope.treedataLevel = result;
        });
        dataserviceMaterial.getproductgroup(function (result) {
            result = result.data;
            $scope.productGroups = result;
        });
        dataserviceMaterial.getProductTypes(function (result) {
            result = result.data;
            $scope.productTypes = result;
        });
        dataserviceMaterial.getListContract(function (result) {
            result = result.data;
            $scope.contracts = result;
        });
        dataserviceMaterial.getListCustommer(function (result) {
            result = result.data;
            $scope.customers = result;
        });
        dataserviceMaterial.getListSupplier(function (result) {
            result = result.data;
            $scope.suppliers = result;
        });
    }

    $scope.initData();

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
            if ($scope.model.FromDate != undefined && $scope.model.FromDate != '' && $scope.model.FromDate != null) {
                var from = $scope.model.FromDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#DateTo').datepicker('setStartDate', date);
            }
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            if ($scope.model.ToDate != undefined && $scope.model.ToDate != '' && $scope.model.ToDate != null) {
                var from = $scope.model.ToDate.split("/");
                var date = new Date(from[2], from[1] - 1, from[0])
                $('#FromTo').datepicker('setEndDate', $scope.model.ToDate);
            }
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    setTimeout(function () {
        loadDate();
    }, 50);
});

app.controller('addProductGroup', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter) {
    $scope.model = {
        ParentID: '',
        Code: '',
        Name: '',
        Description: ''
    }
    $scope.initData = function () {
        dataserviceMaterial.gettreedataCoursetype(function (result) {
            result = result.data;
            $scope.treedataCoursetype = result.Object;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceMaterial.insertProductGroup($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();

                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter, para) {
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
        return '<a title="Xoá" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
        dataserviceMaterial.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {

        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.MLP_CURD_MSG_SETTING_NOT_BLANK);
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceMaterial.insertCommonSetting($scope.model, function (rs) {
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
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceMaterial.updateCommonSetting($scope.model, function (rs) {
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
                    dataserviceMaterial.deleteCommonSetting(id, function (rs) {
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

app.controller('materialTabFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter, dataserviceSupplier) {
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
            url: "/Admin/MaterialProduct/JTableFileNew",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ProductCode = $rootScope.ProductCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataProductFile");
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
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractFileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{"MLP_CURD_TAB_FILE_LIST_COL_NAME" | translate}}').renderWith(function (data, type, full) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"MLP_CURD_TAB_FILE_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"MLP_CURD_TAB_FILE_LIST_COL_CATEGORY_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Desc').withTitle('{{"MLP_CURD_TAB_FILE_LIST_COL_DESCRIPTION" | translate}}').notSortable().renderWith(function (data, type, full) {
        return '<a title="Mô tả" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i class="fas fs25 fa-info-circle"></i></a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{"MLP_TAB_FILE_LIST_COL_FILE_TYPE" | translate}}').renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'w75').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class="" download><i class="fas fs25 fa-download pt5"></i></a>';
        } else {
            return '<a title="Sửa" ng-click="edit(\'' + full.FileName + '\',' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')"  style="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class=""><i style="--fa-primary-color: blue;" class="fas fs25 fa-download pt5"></i></a>' +
                '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
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
            templateUrl: ctxfolderMaterialProd + '/contractTabFileSearch.html',
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
            data.append("ProductCode", $rootScope.ProductCode);
            data.append("IsMore", false);
            dataserviceMaterial.insertProductFile(data, function (result) {
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
        dataserviceMaterial.getProductFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderMaterialProd + '/materialTabFileEdit.html',
                    controller: 'materialTabFileEdit',
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
                    dataserviceMaterial.deleteProductFile(id, function (result) {
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
        //dataserviceMaterial.getByteFile(id, function (rs) {rs=rs.data;
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
        //dataserviceMaterial.getSuggestionsProductFile($rootScope.ProductCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.ProductCode, ObjectType: 'PRODUCT' };
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
        dataserviceSupplier.getDefaultRepo($rootScope.ProductCode, 'PRODUCT', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.ProductCode, ObjectType: 'PRODUCT' };
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

app.controller('materialTabFileAdd', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceMaterial, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle(caption.MLP_VALIDATE_FOLDER_STORAGE).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
                App.toastrError(caption.MLP_MSG_CHOOSE_FOLDER_STORAGE);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.MLP_MSG_CHOOSE_FOLDER_STORAGE);
                return;
            }

            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("ProductCode", $rootScope.ProductCode);
            data.append("IsMore", true);
            dataserviceMaterial.insertProductFile(data, function (result) {
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
            dataserviceMaterial.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: "Tất cả danh mục",//"Tất cả kho dữ liệu"
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

app.controller('materialTabFileEdit', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceMaterial, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('Thư mục').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
            App.toastrError(caption.MLP_MSG_CHOOSE_FOLDER_STORAGE);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.MLP_MSG_CHOOSE_FOLDER_STORAGE);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("ProductCode", $rootScope.ProductCode);
                dataserviceMaterial.updateProductFile(data, function (result) {
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
            dataserviceMaterial.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: "Tất cả danh mục",//"Tất cả kho dữ liệu"
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

app.controller('fileShare', function ($scope, $rootScope, $compile, $uibModalInstance, dataserviceMaterial) {
    $scope.model = {
        ObjectCodeShared: $rootScope.ProductCode,
        ObjectTypeShared: 'PRODUCT',
        ObjectType: '',
        ObjectCode: '',
        FileCode: '',
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataserviceMaterial.getListObjectTypeShare(function (rs) {
            rs = rs.data;
            $scope.listObjType = rs;
        });
        dataserviceMaterial.getListFileWithObject($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, function (rs) {
            rs = rs.data;
            $scope.listFileObject = rs;
        });
        reloadListObjectShare($scope.model.ObjectCodeShared, $scope.model.ObjectTypeShared, $scope.model.ObjectCode, $scope.model.ObjectType, $scope.model.FileCode);
    }
    $scope.init();
    $scope.changeObjType = function (ObjType) {
        dataserviceMaterial.getListObjectCode($rootScope.ContractCode, ObjType, function (rs) {
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
        dataserviceMaterial.deleteObjectShare(id, function (rs) {
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
            dataserviceMaterial.insertFileShare($scope.model, function (rs) {
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
            App.toastrError(caption.MLP_VALIDATE_NOCHOOSE_OBJECT)
            error = true;
            return error;
        }
        if (($scope.model.ObjectCode == "" || $scope.model.ObjectCode == undefined)) {
            App.toastrError(caption.MLP_VALIDATE_NOCHOOSE_CODE_OBJECT)
            error = true;
            return error;
        }
        if (($scope.model.FileCode == "" || $scope.model.FileCode == undefined)) {
            App.toastrError(caption.MLP_VALIDATE_NOCHOOSE_FILE)
            error = true;
            return error;
        }
    }
    function reloadListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode) {
        dataserviceMaterial.getListObjectShare(objectCodeShared, objectTypeShared, objectCode, objectType, fileCode, function (rs) {
            rs = rs.data;
            $scope.listObjectShare = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('addProductAttribute', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter) {
    $scope.model = {
        ParentCode: '',
        Code: '',
        Name: '',
        Note: '',
        DataType: ''
    };

    $rootScope.loadData = function () {
        dataserviceMaterial.getAttrUnit(function (rs) {
            rs = rs.data;
            $rootScope.listUnit = rs;
        });

        dataserviceMaterial.getAttrGroup(function (rs) {
            rs = rs.data;
            $rootScope.listGroup = rs;
        });

        dataserviceMaterial.getAttrDataType(function (rs) {
            rs = rs.data;
            $rootScope.listDataType = rs;
        });
    };

    $rootScope.loadData();

    $rootScope.ParentCode = '';

    $scope.initData = function () {
        dataserviceMaterial.getListParent(function (rs) {
            rs = rs.data;
            $scope.listParent = rs;
        });
    };
    $scope.initData();

    $scope.addUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
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
            controller: 'detail',
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
            controller: 'detail',
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
            dataserviceMaterial.insertAttributeMain($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $rootScope.ParentCode = $scope.model.Code;
                    $scope.initData();
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                    $rootScope.reloadAttribute();
                }
            });
        }
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('editProductAttribute', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceMaterial, para) {
    $scope.model = {
        FileName: ''
    };
    $scope.cancel = function () {
        $rootScope.reloadNoResetPage();
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        $scope.model = para;
    };
    $scope.initData();
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceMaterial.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    //$uibModalInstance.close();
                }
            });
        }
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});


app.controller('addGroup', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceMaterial, $filter) {
    $scope.model = {
        ParentID: '',
        Code: '',
        Name: '',
        Description: ''
    }
    $scope.initData = function () {
        dataserviceMaterial.getTreeDataParent(function (result) {
            result = result.data;
            $scope.treeDataParent = result.Object;
        });
        dataserviceMaterial.getAllType(function (rs) {rs=rs.data;
            $scope.Types = rs;
        })
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceMaterial.insertGroup($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('editGroup', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceMaterial, para) {
    $scope.model = {
        FileName: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataserviceMaterial.getTreeDataParent(function (result) {
            result = result.data;
            $scope.treeDataParent = result.Object;
        });
        dataserviceMaterial.getAllType(function (rs) {rs=rs.data;
            $scope.Types = rs;
        })
        dataserviceMaterial.getItemGroup(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceMaterial.updateGroup($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});