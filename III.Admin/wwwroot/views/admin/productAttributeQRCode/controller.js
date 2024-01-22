var ctxfolder = "/views/admin/productAttributeQRCode";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
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
            headers: {
                'Content-Type': undefined
            },
            data: data
        }

        $http(req).then(callback);
    };
    return {
        insert: function (data, callback) {
            submitFormUpload('/Admin/IconManager/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/IconManager/Update', data, callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/IconManager/DeleteItems/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/IconManager/Delete/' + data).then(callback);
        },
        updatePrint: function (data, callback) {
            $http.post('/Admin/productAttributeQRCode/UpdatePrint', data).then(callback);
        },
        getListUser: function (callback) {
            $http.get('/Admin/productAttributeQRCode/GetListUser', callback).then(callback);
        },
        //Danh sách kho
        getListWareHouse: function (callback) {
            $http.get('/Admin/productAttributeQRCode/GetListWareHouse', callback).then(callback);
        },
        getWareHouseById: function (data, callback) {
            $http.get('/Admin/productAttributeQRCode/GetWareHouseById?id=' + data).then(callback);
        },
        getFloorById: function (data, callback) {
            $http.get('/Admin/productAttributeQRCode/GetFloorById?id=' + data).then(callback);
        },
        getLineById: function (data, callback) {
            $http.get('/Admin/productAttributeQRCode/GetLineById?id=' + data).then(callback);
        },
        getRackById: function (data, callback) {
            $http.get('/Admin/productAttributeQRCode/GetRackById?id=' + data).then(callback);
        },

        getFloorByWareHouseCode: function (data, callback) {
            $http.get('/Admin/productAttributeQRCode/GetFloorByWareHouseCode?wareHouseCode=' + data).then(callback);
        },
        getLineByFloorCode: function (data, callback) {
            $http.get('/Admin/productAttributeQRCode/GetLineByFloorCode?floorCode=' + data).then(callback);
        },
        getRackByLineCode: function (data, callback) {
            $http.get('/Admin/productAttributeQRCode/GetRackByLineCode?lineCode=' + data).then(callback);
        },

        //Tạo mã QR_CODE
        genWareHouseCode: function (callback) {
            $http.get('/Admin/productAttributeQRCode/GenWareHouseCode').then(callback);
        },
        genFloorCode: function (wareHouseCode, callback) {
            $http.get('/Admin/productAttributeQRCode/GenFloorCode?wareHouseCode' + wareHouseCode).then(callback);
        },
        genLineCode: function (wareHouseCode, floorCode, callback) {
            $http.get('/Admin/productAttributeQRCode/GenLineCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode).then(callback);
        },
        genRackCode: function (wareHouseCode, floorCode, lineCode, callback) {
            $http.get('/Admin/productAttributeQRCode/GenRackCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode + '&lineCode' + lineCode).then(callback);
        },
        genBoxCode: function (wareHouseCode, floorCode, lineCode, rackCode, callback) {
            $http.get('/Admin/productAttributeQRCode/GenBoxCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode + '&lineCode' + lineCode + '&rackCode' + rackCode).then(callback);
        },
        genBookCode: function (wareHouseCode, floorCode, lineCode, rackCode, boxCode, callback) {
            $http.get('/Admin/productAttributeQRCode/GenBookCode?wareHouseCode' + wareHouseCode + '&floorCode' + floorCode + '&lineCode' + lineCode + '&rackCode' + rackCode + '&boxCode' + boxCode).then(callback);
        },

        //Lấy danh sách theo đối tượng
        getListObjByObjType: function (objType, callback) {
            $http.get('/Admin/productAttributeQRCode/GetListObjByObjType?objType=' + objType).then(callback);
        },
        createQRCode: function (data, callback) {
            $http.post('/Admin/productAttributeQRCode/CreateQRCode/', data).then(callback);
        },
        genQRCode: function (code, callback) {
            $http.get('/Admin/productAttributeQRCode/GenQRCode?code=' + code).then(callback);
        },
        getLotProduct: function (callback) {
            $http.post('/Admin/productAttributeQRCode/GetLotProduct').then(callback);
        },
        getImp: function (callback) {
            $http.post('/Admin/productAttributeQRCode/GetImp').then(callback);
        },
        getListQrCodeBySearch: function (data, callback) {
            $http.post('/Admin/productAttributeQRCode/GetListQrCodeBySearch', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });

    $rootScope.isShowQRCode = false;

    $rootScope.listWareHouse = [];
    $rootScope.listFloor = [];
    $rootScope.listLine = [];
    $rootScope.listRack = [];

    $rootScope.wareHouseID = null;
    $rootScope.floorID = null;
    $rootScope.lineID = null;
    $rootScope.rackID = null;

    $rootScope.wareHouseCode = null;
    $rootScope.floorCode = null;
    $rootScope.lineCode = null;
    $rootScope.rackCode = null;

    $rootScope.listObjType = [
        {
            OBJ_Code: 'OBJ_WAREHOUSE',
            OBJ_Name: 'Kho'
        },
        {
            OBJ_Code: 'OBJ_FLOOR',
            OBJ_Name: 'Tầng'
        },
        {
            OBJ_Code: 'OBJ_LINE',
            OBJ_Name: 'Dãy'
        },
        {
            OBJ_Code: 'OBJ_RACK',
            OBJ_Name: 'Kệ'
        },
        {
            OBJ_Code: 'OBJ_RACK_POSITION',
            OBJ_Name: 'Vị trí Kệ'
        },
        {
            OBJ_Code: 'OBJ_BOX',
            OBJ_Name: 'Thùng HSCT'
        },
        {
            OBJ_Code: 'OBJ_BOOK',
            OBJ_Name: 'Cuốn HSCT'
        }
    ];
    $rootScope.listQRCode = [];
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/productAttributeQRCode/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.searchBoxAdvanced = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.listUser = [];
    $scope.listWareHouse = [];
    $scope.listFloor = [];
    $scope.listLine = [];
    $scope.listRack = [];

    $scope.lotProducts = [];
    $scope.ticketImps = [];

    $scope.qrcodeString2 = 'YOUR TEXT TO ENCODE';
    $scope.size = 50;
    $scope.correctionLevel = '';
    $scope.typeNumber = 0;
    $scope.inputMode = '';
    $scope.image = true;

    $scope.model = {
        FromDate: '',
        ToDate: '',
        ObjType: ''
    };
    $scope.jtableData = {};


    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/productAttributeQRCode/JTable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $scope.jtableData = [];
                d.Product = $scope.model.Product;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function (data) {
                $rootScope.listQRCode = data.responseJSON.data;
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            console.log(data.ID);
            $scope.jtableData[data.Id] = data;
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QrCode').withTitle('QR Code').renderWith(function (data, type) {
        return '<img ng-click="viewQrCode(\'' + data + '\')" class=" image-upload h-50 w50"  role="button" src="data:image/png;base64, ' + data + '" />';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"PAQRC_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"PAQRC_COL_PRODUCT_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"PAQRC_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"PAQRC_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        $scope.jtableData = [];
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
        console.log($scope.jtableData);
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vm.selectAll = false;
                    console.log(selectedItems);
                    return;
                }
            }
        }
        vm.selectAll = true;
    }
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.reload = function () {
        $scope.jtableData = [];
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        $scope.jtableData = [];
        reloadData(false);
    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.init = function () {
        dataservice.getLotProduct(function (rs) {rs=rs.data;
            $scope.lotProducts = rs;
        });
        dataservice.getImp(function (rs) {rs=rs.data;
            $scope.ticketImps = rs;
        });
    }
    $scope.init();
    $scope.showSearchBox = function (hidden) {
        $scope.searchBoxAdvanced = true;
    }
    $scope.hideSearchBox = function (hidden) {
        $scope.searchBoxAdvanced = false;
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '65'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
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
    $scope.print = function () {
        $rootScope.listQRCode = [];
        var listdata = $('#tblData').DataTable();
        $rootScope.listQRCode = listdata.rows('.selected').data();
        if ($rootScope.listQRCode.length > 0) {
            var listQrCode = "";
            for (var j = 0; j < $rootScope.listQRCode.length; j++) {
                var str = $scope.subString($rootScope.listQRCode[j].ProductName);
                var strLenght = $rootScope.listQRCode[j].ProductName.length;
                var margin_bottom = -14;
                //if (strLenght > 26) {
                //    margin_bottom = -8;
                //}
                listQrCode = listQrCode + '<div class="col-md-2" style="text-align: center;margin-bottom:10px;"> ' +
                    '<img src="data:image/png;base64,' + $rootScope.listQRCode[j].QrCode + '"width="125" height="125" style="margin-bottom:' + margin_bottom + 'px;" /> ' +
                    '<p class="textQr">' + str + '<p/>' +
                    '</div>';
            }
            var mainWindow = window.open('', '');
            mainWindow.document.write('<html><head><title></title>');
            mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
                '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
            mainWindow.document.write('</head><body onload="window.print();window.close()">');
            mainWindow.document.write(listQrCode);
            mainWindow.document.write('</body></html>');
            mainWindow.document.close();
        } else {
            App.toastrError(caption.PAQRC_MSG_QR_CODE);
        }

        //$rootScope.listQRCode = [];
        //dataservice.getListQrCodeBySearch($scope.model, function (rs) {rs=rs.data;
        //    $rootScope.listQRCode = rs;
        //    if ($rootScope.listQRCode.length > 0) {
        //        var listQrCode = "";
        //        for (var j = 0; j < $rootScope.listQRCode.length; j++) {
        //            var str = $scope.subString($rootScope.listQRCode[j].ProductName);
        //            var strLenght = $rootScope.listQRCode[j].ProductName.length;
        //            var margin_bottom = -14;
        //            //if (strLenght > 26) {
        //            //    margin_bottom = -8;
        //            //}
        //            listQrCode = listQrCode + '<div class="col-md-2" style="text-align: center;margin-bottom:10px;"> ' +
        //                '<img src="data:image/png;base64,' + $rootScope.listQRCode[j].QrCode + '"width="125" height="125" style="margin-bottom:' + margin_bottom + 'px;" /> ' +
        //                '<p class="textQr">' + str + '<p/>' +
        //                '</div>';
        //        }
        //        var mainWindow = window.open('', '');
        //        mainWindow.document.write('<html><head><title></title>');
        //        mainWindow.document.write('<style type="text/css" media="print">@page {size: auto; margin: 0mm;}' +
        //                 '.col-md-2{width: 16.66667%;float: left;} .textQr{font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all;}</style >');
        //        mainWindow.document.write('</head><body onload="window.print();window.close()">');
        //        mainWindow.document.write(listQrCode);
        //        mainWindow.document.write('</body></html>');
        //        mainWindow.document.close();
        //    } else {
        //        App.toastrError("Danh sách không có mã QRCode nào !")
        //    }
        //});
    }
    $scope.subString = function (str) {
        var strResult = '';
        var lenght = str.length;
        strResult = str;

        //if (lenght > 26) {
        //    strResult = str.substr(0, 26) + "" + str.substr(26, lenght - 1);
        //} else {
        //    strResult = str;
        //}
        return strResult;
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    function loadDate() {
        //Yêu cầu từ ngày --> đến ngày
        $("#dateFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateTo').datepicker('setStartDate', maxDate);
        });
        $("#dateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateFrom').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        loadDate();
        $('#tblData tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');
        });
    }, 50);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.QRCode = '';
    $scope.model = {
        OBJ_Type: '',
        OBJ_Code: ''
    }

    $scope.guideMsg = '';

    $scope.listWareHouse = [];
    $scope.listFloor = [];
    $scope.listLine = [];
    $scope.listRack = [];
    $scope.listObjCode = [];
    $scope.listQRCode = [];

    $scope.init = function () {
        dataservice.getListWareHouse(function (rs) {rs=rs.data;
            $scope.listWareHouse = rs;
        });
    }
    $scope.init();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.createQRCode($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else
                    App.toastrSuccess(rs.Title);
                dataservice.genQRCode($scope.model.OBJ_Code, function (rs) {rs=rs.data;
                    $scope.QRCode = rs;
                    $rootScope.isShowQRCode = true;
                    $scope.addQRCode($scope.QRCode);
                    $scope.model.OBJ_Code = '';
                });
            });
        }
    }

    $scope.addQRCode = function (qrCode) {
        var exits = $scope.listQRCode.filter(k => k.ObjCode === $scope.model.OBJ_Code);
        if (exits.length == 0) {
            var obj = {
                STT: 0,
                QRCode: qrCode,
                ObjCode: $scope.model.OBJ_Code
            }

            $scope.listQRCode.push(obj);
        } else {
            App.toastrError(caption.PAQRC_MSG_OBJ_CODE_EXISTED);
        }
    };

    $scope.removeQRCode = function (index) {
        $scope.listQRCode.splice(index, 1);
    }

    $scope.changeWareHouse = function (wareHouseCode) {
        dataservice.getFloorByWareHouseCode(wareHouseCode, function (rs) {rs=rs.data;
            $scope.listFloor = [];
            $scope.listFloor.push(rs);
        });
    }

    $scope.changeFloor = function (floorCode) {
        dataservice.getLineByFloorCode(floorCode, function (rs) {rs=rs.data;
            $scope.listLine = [];
            $scope.listLine.push(rs);
        });
    }

    $scope.changeLine = function (lineCode) {
        dataservice.getRackByLineCode(lineCode, function (rs) {rs=rs.data;
            $scope.listRack = rs;
        });
    }

    $scope.changeObjType = function (ObjType) {
        $scope.errorObjType = false;
        dataservice.getListObjByObjType(ObjType, function (rs) {rs=rs.data;
            $scope.listObjCode = [];
            $scope.listObjCode = rs;
            $scope.model.OBJ_Code = '';
            switch (ObjType) {
                case 'OBJ_WAREHOUSE':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc WH.Tên Kho';
                    break;
                case 'OBJ_FLOOR':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc F.Tên Tầng_Mã kho';
                    break;
                case 'OBJ_LINE':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc F.Tên Dãy_Mã tầng';
                    break;
                case 'OBJ_RACK':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc R.Tên Kệ_Mã Dãy';
                    break;
                case 'OBJ_RACK_POSITION':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc RP.Tên Vị Trí Kệ_Mã Dãy';
                    break;
                case 'OBJ_BOX':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc BX.Số thùng_BR.Mã Chi Nhánh_TYPE.Mã Loại chứng từ_USR.Mã nhân viên_Time.hhmmss';
                    break;
                case 'OBJ_BOOK':
                    $scope.guideMsg = '* Mã QR Code được sinh theo quy tắc BX.Số thùng_BR.Mã Chi Nhánh_TYPE.Mã Loại chứng từ_USR.Mã nhân viên_Time.hhmmss';
                    break;
            }
        });
    }

    $scope.changeObjCode = function (ObjCode) {
        $scope.errorObjCode = false;
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.OBJ_Type == "") {
            $scope.errorObjType = true;
            mess.Status = true;
        } else {
            $scope.errorObjType = false;
        }

        if (data.OBJ_Code == "") {
            $scope.errorObjCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjCode = false;
        }
        return mess;
    };

    $scope.print = function () {
        var listPrint = [];
        if ($scope.listQRCode.length > 0) {
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            var listQrCode = "";
            for (var j = 0; j < $scope.listQRCode.length; j++) {
                var str = $scope.subString($scope.listQRCode[j].ObjCode);
                var strLenght = $scope.listQRCode[j].ObjCode.length;
                var margin_bottom = -10;
                if (strLenght > 26) {
                    margin_bottom = -8;
                }
                listPrint.push($scope.listQRCode[j].ObjCode);
                listQrCode = listQrCode + '<div class="col-md-2" style="text-align: center;margin-bottom:20px;"> ' +
                    '<img src="data:image/png;base64,' + $scope.listQRCode[j].QRCode + '" width="125" height="125" style="margin-bottom:' + margin_bottom + 'px;" /> ' +
                    '<span style="font-family:verdana, arial, sans-serif;font-size:6px;pading-top:0;">' + str + '<span/>' +
                    '</div >';
            }
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style>' + '<body>' + listQrCode + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);

            if (listPrint.length > 0) {
                dataservice.updatePrint(listPrint, function (rs) {rs=rs.data;

                });
            }
        } else {
            App.toastrError(caption.PAQRC_MSG_LIST_BLANK)
        }
    }

    $scope.subString = function (str) {
        var strResult = '';
        var lenght = str.length;
        if (lenght > 26) {
            strResult = str.substr(0, 26) + "<br/>" + str.substr(26, lenght - 1);
        } else {
            strResult = str;
        }
        return strResult;
    }

    $timeout(function () {
        setModalDraggable('.modal-dialog');
    }, 100);
});

