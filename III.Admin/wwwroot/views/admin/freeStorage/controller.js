var ctxfolder = "/views/admin/freeStorage";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce', 'monospaced.qrcode']);
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
        getProduct: function (callback) {
            $http.post('/Admin/freeStorage/GetProduct', callback).then(callback);
        },
        getFloorInStoreByProductId: function (Id, callback) {
            $http.post('/Admin/freeStorage/GetFloorInStoreByProductId?Id=' + Id, callback).then(callback);
        },
        getLineByFloor: function (data, callback) {
            $http.post('/Admin/freeStorage/GetLineByFloor?floorCode=' + data, callback).then(callback);
        },
        getRackByLine: function (data, callback) {
            $http.post('/Admin/freeStorage/GetRackByLine?lineCode=' + data, callback).then(callback);
        },
        getItem: function (Id, callback) {
            $http.post('/Admin/freeStorage/GetItem?Id=' + Id, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/freeStorage/Update', data, callback).then(callback);
        },
        getListTicketCode: function (callback) {
            $http.post('/Admin/freeStorage/GetListTicketCode').then(callback);
        },
        getPositionProductVatco: function (data, data1, callback) {
            $http.post('/Admin/freeStorage/GetPositionProductVatco?id=' + data + "&ticketCode=" + data1).then(callback);
        },
        moveProductVatco: function (data, callback) {
            $http.post('/Admin/freeStorage/MoveProductVatco', data).then(callback);
        },
        //getProductDetail: function (data, callback) {
        //    $http.get('/Admin/MaterialImpStore/GetProductDetail?ticketCode=' + data).then(callback);
        //},
        getListStore: function (callback) {
            $http.post('/Admin/MaterialImpStore/GetListStore').then(callback);
        },
        checkProductInStore: function (data, callback) {
            $http.get('/Admin/ProductImport/CheckProductInStore?productQrCode=' + data, callback).then(callback);
        },
        getDetailTicketCode: function (data, callback) {
            $http.post('/Admin/freeStorage/GetDetailTicketCode?ticketCode=' + data).then(callback);
        },
        getListLine: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetListLine?storeCode=' + data, callback).then(callback);
        },
        getListRackByLineCode: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetListRackByLineCode?lineCode=' + data, callback).then(callback);
        },
        getListProductInStore: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetListProductInStore?rackCode=' + data, callback).then(callback);
        },
        getPositionProduct: function (productQrCode, productCoil, callback) {
            $http.get('/Admin/MaterialImpStore/GetPositionProduct?productQrCode=' + productQrCode + '&&productCoil=' + productCoil, callback).then(callback);
        },
        getProductNotInStore: function (productQrCode, productCoil, callback) {
            $http.get('/Admin/MaterialImpStore/GetProductNotInStore?productQrCode=' + productQrCode + '&&productCoil=' + productCoil, callback).then(callback);
        },
        getQuantityEmptyInRack: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/GetQuantityEmptyInRack?rackCode=' + data, callback).then(callback);
        },
        checkProductInExpTicket: function (data, callback) {
            $http.get('/Admin/MaterialImpStore/CheckProductInExpTicket?productQrCode=' + data, callback).then(callback);
        },
        deleteOrderProduct: function (data, callback) {
            $http.post('/Admin/ProductImport/DeleteOrderProduct?id=' + data).then(callback);
        },
        getListUserImport: function (callback) {
            $http.post('/Admin/FreeStorage/GetListUserImport').then(callback);
        },
        getProductDetail: function (data, callback) {
            $http.post('/Admin/FreeStorage/GetProductDetail', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#tblListProduct",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#tblListProduct");
                }
            }).then(callback);
        },
        //New Mapping
        getListWareHouse: function (callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMappingType?type=AREA').then(callback);
        },
        getListMapping: function (data, callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMapping?start=' + data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    //$rootScope.PERMISSION_FREE_STROEAGE = PERMISSION_FREE_STROEAGE;
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                ProductCode: {
                    required: true,
                    maxlength: 50
                },
                ProductName: {
                    required: true,
                    maxlength: 200
                },
                Unit: {
                    required: true,
                    maxlength: 100
                },


            },
            messages: {
                ProductCode: {
                    required: caption.FREE_STORAGE_MSG_ENTER_PRODUCT,
                    maxlength: caption.FREE_STORAGE_MSG_CODE_PRODUCT_CHAR
                },
                ProductName: {
                    required: caption.FREE_STORAGE_MSG_ENTER_NAME_PRODUCT,
                    maxlength: caption.FREE_STORAGE_MSG_NAME_PRODUCT_CHAR
                },
                Unit: {
                    required: caption.FREE_STORAGE_MSG_ENTER_UNIT,
                    maxlength: caption.FREE_STORAGE_MSG_UNIT_CHAR
                },

            }
        }
        $rootScope.IsTranslate = true;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/freeStorage/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolder + '/detail.html',
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

});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    $scope.model = {
        TicketCode: '',
        StoreCode: '',
        FromDate: '',
        ToDate: '',
        UserImport: ''
    };
    $scope.sort = {
        sortingOrder: 'id',
        reverse: false
    };
    $scope.gap = 2;

    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.itemsPerPage = 25;
    $scope.pagedItems = [];
    $scope.currentPage = 0;

    $scope.initData = function () {
        dataservice.getListTicketCode(function (rs) {
            rs = rs.data;
            if (rs.Error != true) {
                $scope.listTicketCode = rs;
            } else {
                App.toastrError(rs.Title);
            }
        });

        dataservice.getListStore(function (rs) {
            rs = rs.data;
            $scope.listStore = rs;
        });

        dataservice.getListUserImport(function (rs) {
            rs = rs.data;
            if (rs.Error != true) {
                $scope.listUserImport = rs;
            } else {
                App.toastrError(rs.Title);
            }
        });
        dataservice.getProductDetail($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error != true) {
                $scope.listProdDetail = rs;
                //$scope.lstQr = rs;
                $scope.filteredItems = rs;
                $scope.currentPage = 0;
                // now group by pages
                $scope.groupToPages();
            } else {
                App.toastrError(rs.Title);
            }
            //App.unblockUI("#modal-body");
        })
    }

    $scope.initData();

    $scope.isSearch = false;

    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
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

    $scope.orderProductVatCo = function (index) {
        var item = $scope.listProdDetail[index];
        if (item != null) {
            dataservice.checkProductInStore(item.Id, function (rs) {
                rs = rs.data;
                var getStore = $scope.listStore.find(function (element) {
                    if (element.Code == $scope.model.StoreCode) return true;
                });
                $scope.model.StoreCode = item.StoreCode;
                $rootScope.storeCode = item.StoreCode;
                $rootScope.rootId = item.IdTicket;
                var objPara = {
                    item: item,
                    rootId: item.IdTicket,
                    mapId: item.MapId,
                    productName: item.ProductName,
                    productCoil: '',
                    storeName: item.StoreName,
                    productNo: item.ProductNo,
                    isTankStatic: rs === false
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/orderProduct.html',
                    controller: 'orderProduct',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return {
                                objPara
                            };
                        }
                    }
                });
                modalInstance.result.then(function (id) {
                    dataservice.getProductDetail($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error != true) {
                            $scope.listProdDetail = rs;
                            //$scope.lstQr = rs;
                            $scope.filteredItems = rs;
                            $scope.currentPage = 0;
                            // now group by pages
                            $scope.groupToPages();
                        } else {
                            App.toastrError(rs.Title);
                        }
                    })
                }, function () {
                    dataservice.getProductDetail($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error != true) {
                            $scope.listProdDetail = rs;
                            //$scope.lstQr = rs;
                            $scope.filteredItems = rs;
                            $scope.currentPage = 0;
                            // now group by pages
                            $scope.groupToPages();
                        } else {
                            App.toastrError(rs.Title);
                        }
                    })
                });
            });
        } else {
            App.toastrError(caption.MIST_ADD_PRODUCT_SAVE_BEFORE_SORT);
        }
    }

    $scope.search = function () {
        //App.blockUI({
        //    target: "#modal-body",
        //    boxed: true,
        //    message: 'loading...'
        //});
        dataservice.getProductDetail($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error != true) {
                $scope.listProdDetail = rs;
                $scope.filteredItems = rs;
                $scope.currentPage = 0;
                // now group by pages
                $scope.groupToPages();
            } else {
                App.toastrError(rs.Title);
            }
            //App.unblockUI("#modal-body");
        })
    }

    // calculate page in place
    $scope.groupToPages = function () {
        $scope.pagedItems = [];
        console.log($scope.filteredItems);
        for (var i = 0; i < $scope.filteredItems.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.filteredItems[i]];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
            }
        }
    };

    $scope.range = function (size, start, end) {
        var ret = [];
        console.log(size, start, end);

        if (size < end) {
            end = size;
            start = size - $scope.gap;
        }
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        console.log(ret);
        return ret;
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage++;
        }
    };

    $scope.setPage = function () {
        $scope.currentPage = this.n;
    };

    $scope.firstPage = function () {
        $scope.currentPage = 0;
    };

    $scope.lastPage = function () {
        $scope.currentPage = $scope.pagedItems.length - 1;
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
    }, 200);
});

app.controller('orderProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $uibModalInstance, para) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.QuantityEmpty = "...";
    $scope.isCoil = false;

    $scope.ImpType = para.objPara.item.ImpType;
    if ($scope.ImpType == "Cuộn")
        $scope.isCoil = true;

    $scope.model = {
        ProductCode: '',
        ProductName: para.objPara.productName,
        LineCode: '',
        RackCode: '',
        RackPosition: '',
        Quantity: 0,
        Unit: para.objPara.item.Unit,
        MoveStock: false,
        ListCoil: []
    }
    //var listCoils = para.objPara.item.ListCoil.filter(k => k.RackCode === '' || k.RackCode === null || k.RackCode === undefined);

    $scope.RackPosition = '';
    $scope.listSelect = [];
    $scope.listLine = [];
    $scope.listRack = [];
    $scope.listCoil = [];

    $scope.obj = {
        WareHouseCode: '',
        FloorCode: '',
        LineCode: '',
        RackCode: '',
        WareHouseName: '',
        FloorName: '',
        LineName: '',
        RackName: '',
        CNTBox: '',
        NumBox: '',
    }

    $scope.listProducts = [];
    $scope.listSelect = [];

    $scope.QuantityMax = '';

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSWarehouseManager/JTable",
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

            },
            complete: function (data) {
                App.unblockUI("#contentMain");
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QRCode').withTitle('{{"EDWHR_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return '<img src="' + data + '" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"EDWHR_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION"|translate}}').renderWith(function (data, type, full) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-check"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red hidden"><i class="fa fa-trash"></i></button>';
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

    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.cancel = function () {
        $uibModalInstance.close($rootScope.rootId);
    }

    $scope.selectOrder = function (position, entities) {
        angular.forEach(entities, function (subscription, index) {
            if (position == index) {
                subscription.Checked = true;
                $rootScope.cntBox = subscription.Text;
            } else {
                subscription.Checked = false;
            }
        });
    }

    $scope.selectBox = function (position, boxs) {
        angular.forEach(boxs, function (subscription, index) {
            if (position == index) {
                if (subscription.Checked) {
                    subscription.Checked = false;
                    var indexRemove = $scope.listSelect.indexOf(boxs[index]);
                    $scope.listSelect.splice(indexRemove, 1);
                    boxs[index].WHS_Code = 0;
                    boxs[index].FloorCode = 0;
                    boxs[index].LineCode = 0;
                    boxs[index].RackCode = 0;
                    boxs[index].Ordering = 0;
                    boxs[index].RackPosition = '';
                    boxs[index].IsStored = false;
                } else {
                    boxs[index].WHS_Code = $rootScope.wareHouseCode;
                    boxs[index].FloorCode = $rootScope.floorCode;
                    boxs[index].LineCode = $rootScope.lineCode;
                    boxs[index].RackCode = $rootScope.rackCode;
                    boxs[index].Ordering = $rootScope.cntBox;
                    boxs[index].RackPosition = $scope.RackPosition;
                    boxs[index].IsStored = true;

                    if (boxs[index].FloorCode == 0) {
                        App.toastrError(caption.MIS_MSG_REQUEST_CHOSE_FLOOR_BEFORE_CHOSE_BOX);
                        return;
                    }

                    if (boxs[index].LineCode == 0) {
                        App.toastrError(caption.MIS_MSG_REQUEST_CHOSE_LINE_BEFORE_CHOSE_BOX);
                        return;
                    }

                    if (boxs[index].RackCode == 0) {
                        App.toastrError(caption.MIS_MSG_REQUEST_CHOSE_RACK_BEFORE_CHOSE_BOX);
                        return;
                    }

                    if (boxs[index].RackPosition == "") {
                        App.toastrError(caption.MIS_MSG_REQUEST_ENTER_LOCATION_RACK_BEFORE_CHOSE_BOX);
                        return;
                    }

                    if (boxs[index].Ordering == null) {
                        App.toastrError(caption.MIS_MSG_REQUEST_CHOSE_ORDERING_BEFORE_CHOSE_BOX);
                        return;
                    }

                    subscription.Checked = true;
                    $scope.listSelect.push(boxs[index]);
                }
            }
        });
    }

    $scope.initLoad = function () {
        debugger
        var itemProduct = para.objPara.item;
        $scope.model.ProductQrCode = itemProduct.ProductQRCode;
        $scope.model.Quantity = itemProduct.Quantity;
        $scope.model.sProductCoil = para.objPara.productCoil;
        $scope.model.IdImpProduct = para.objPara.item.IdImpProduct;
        $scope.model.ProductNoImp = para.objPara.isTankStatic ? '1' : para.objPara.productNo;
        $scope.model.ProductNo = para.objPara.isTankStatic ? '1' : '';
        $scope.model.IsTankStatic = para.objPara.isTankStatic;
        $scope.model.Id = para.objPara.mapId;
        dataservice.getListMapping("", function (rs) {
            rs = rs.data;
            $scope.listMapping = rs;
            //$scope.listRack = [];
            //$scope.model.RackCode = '';
            //if (rs.length > 0) {
            //    $scope.model.LineCode = rs[0].LineCode;
            //    dataservice.getListRackByLineCode(rs[0].LineCode, function (result) {
            //        result = result.data;
            //        $scope.listRack = result;
            //        if (result.length > 0) {
            //            $scope.model.RackCode = result[0].RackCode;
            //            dataservice.getQuantityEmptyInRack($scope.model.RackCode, function (rs) {
            //                rs = rs.data;
            //                $scope.QuantityEmpty = rs;
            //            });
            //        }
            //    });
            //} else {
            //    App.toastrError(caption.FREE_STORAGE_MSG_NOT_FOUND_LINE + ' ' + para.objPara.storeName);
            //}
        });
        //dataservice.getPositionProduct($scope.model.ProductQrCode, $scope.model.sProductCoil, function (rs) {
        //    rs = rs.data;
        //    if (!rs.Error) {
        //        $scope.model.ListCoil = rs.Object;
        //        for (var i = 0; i < $scope.model.ListCoil.length; i++) {
        //            $scope.model.ListCoil[i].sProductCoil = $scope.model.ListCoil[i].ProductCoil.split("_")[$scope.model.ListCoil[i].ProductCoil.split("_").length - 2];
        //            $scope.model.ListCoil[i].CoilCode = $scope.model.ListCoil[i].ProductCoil;
        //        }
        //    }
        //});
        //dataservice.getProductNotInStore($scope.model.ProductQrCode, $scope.model.sProductCoil, function (rs) {
        //    rs = rs.data;
        //    if (!rs.Error) {
        //        $scope.listCoil = rs.Object;
        //        for (var i = 0; i < $scope.listCoil.length; i++) {
        //            $scope.listCoil[i].sProductCoil = $scope.listCoil[i].ProductCoil.split("_")[$scope.listCoil[i].ProductCoil.split("_").length - 2];
        //        }
        //    }
        //});
        dataservice.getPositionProductVatco(para.objPara.item.IdImpProduct, para.objPara.item.TicketCode, function (rs) {
            rs = rs.data;
            $scope.lstProduct = rs;
        })
    }

    $scope.initLoad();

    $scope.setPositionBox = function () {
        $scope.obj.WareHouseCode = $rootScope.wareHouseCode;
        $scope.obj.FloorCode = $rootScope.floorCode;
        $scope.obj.LineCode = $rootScope.lineCode;
        $scope.obj.RackCode = $rootScope.rackCode;
        $scope.obj.CNTBox = $rootScope.cntBox;
        $scope.obj.NumBox = $rootScope.chooseBoxObj.NumBoxth;

        var objBox = $rootScope.chooseBoxObj;
        objBox.WHS_Code = $rootScope.wareHouseCode;
        objBox.FloorCode = $rootScope.floorCode;
        objBox.LineCode = $rootScope.lineCode;
        objBox.RackCode = $rootScope.rackCode;
        dataservice.getNameObjectType($scope.obj, function (rs) {
            rs = rs.data;
            $scope.obj = rs;
            $rootScope.positionBox = rs.PositionBox;
            App.toastrSuccess(caption.MIST_SORT_SUCCESS + "<br/>" + "Vị trí: " + $rootScope.positionBox);

            $uibModalInstance.close();
        });
    }

    $scope.validate = function () {
        if ($scope.model.MappingCode != '') {
            return false;
        } else {
            App.toastrError(caption.MIST_VALIDATE_ADD_REQUIRE_INFO_RB);
            return true;
        }
    }

    $scope.changeSelect = function (type, id) {
        switch (type) {
            case "LINE":
                dataservice.getListRackByLineCode(id, function (rs) {
                    rs = rs.data;
                    $scope.listRack = rs;
                    $scope.model.RackCode = '';
                });
            case "RACK":
                dataservice.getListProductInStore(id, function (rs) {
                    rs = rs.data;
                    $scope.listProducts = rs;
                });
                dataservice.getQuantityEmptyInRack(id, function (rs) {
                    rs = rs.data;
                    $scope.QuantityEmpty = rs;
                });
                break;
        }
    };

    $scope.item = [];

    $scope.changeCoil = function (item) {
        $scope.item = item;
        var check = $scope.model.ListCoil.filter(k => k.ProductCoil === item.ProductCoil);
        if (check.length > 0) {
            //App.toastrError(caption.MIST_LIST_EXIST);
            var position = '';
            var line = $scope.listLine.filter(k => k.LineCode === $scope.model.LineCode);
            var rack = $scope.listRack.filter(k => k.RackCode === $scope.model.RackCode);
            if (rack.length === 1 && line.length === 1) {
                position = $scope.model.RackPosition + ", " + rack[0].RackName + ", " + line[0].L_Text;
                item.PositionInStore = position;
                item.CoilRelative = item.ProductCoilRelative;
                item.CoilCode = item.ProductCoil;
                item.LineCode = $scope.model.LineCode;
                item.RackCode = $scope.model.RackCode;
                item.RackPosition = $scope.model.RackPosition;
            }
        } else {
            var position = '';
            var line = $scope.listLine.filter(k => k.LineCode === $scope.model.LineCode);
            var rack = $scope.listRack.filter(k => k.RackCode === $scope.model.RackCode);
            if (rack.length === 1 && line.length === 1) {
                position = $scope.model.RackPosition + ", " + rack[0].RackName + ", " + line[0].L_Text;
                item.PositionInStore = position;
                item.CoilRelative = item.ProductCoilRelative;
                item.CoilCode = item.ProductCoil;
                item.LineCode = $scope.model.LineCode;
                item.RackCode = $scope.model.RackCode;
                item.RackPosition = $scope.model.RackPosition;
            }

            if (!$scope.validate()) {
                $scope.model.Quantity = parseFloat(item.Remain);

                //$scope.model.ListCoil.push(item);
                //var index = $scope.listCoil.indexOf(item);
                //$scope.listCoil.splice(index, 1);
            } else {
                $scope.model.ProductCoil = '';
            }
        }
    };

    $scope.add = function (item) {

        if (!$scope.validate()) {
            for (var i = 0; i < $scope.model.Quantity; i++) {
                item = $scope.listCoil[i];
                var check = $scope.model.ListCoil.filter(k => k.ProductCoil === item.ProductCoil);
                if (check.length > 0) {
                    App.toastrError(caption.MIST_LIST_EXIST);
                } else {
                    var position = '';
                    var line = $scope.listLine.filter(k => k.LineCode === $scope.model.LineCode);
                    var rack = $scope.listRack.filter(k => k.RackCode === $scope.model.RackCode);
                    if (rack.length === 1 && line.length === 1) {
                        position = $scope.model.RackPosition + ", " + rack[0].RackName + ", " + line[0].L_Text;
                        item.PositionInStore = position;
                        item.CoilRelative = item.ProductCoilRelative;
                        item.CoilCode = item.ProductCoil;
                        item.LineCode = $scope.model.LineCode;
                        item.RackCode = $scope.model.RackCode;
                        item.RackPosition = $scope.model.RackPosition;
                    }

                    $scope.model.ListCoil.push(item);
                }
            }

            for (var j = 0; j < $scope.model.ListCoil.length; j++) {
                var index = $scope.listCoil.indexOf($scope.model.ListCoil[j]);
                $scope.listCoil.splice(index, 1);
            }
        }
    };

    $scope.orderingProduct = function () {
        if ($scope.model.RackCode != '' && $scope.model.RackPosition != '' && $scope.model.Size != '') {
            //var itemProduct = para.objPara.item;
            //$scope.changeCoil(itemProduct);
            dataservice.orderingProductInStore($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $rootScope.reloadData();
                }
            });
        } else {
            App.toastrError(caption.MIS_MSG_REQUEST_ENTER_INFORMATION_REQUIRE)
        }
    }

    var remain = para.objPara.item.QuantityMap;
    //Vatco: add product to order
    $scope.addToOrder = function () {
        debugger
        if (!$scope.validate()) {
            if ($scope.model.ProductNo === '') {
                return App.toastrError(/*caption.FREE_STORAGE_PLS_ENTER_QUANTITY*/'Vui lòng nhập thứ tự');
            }
            //if (parseInt($scope.QuantityEmpty) < $scope.model.Quantity) {
            //    App.toastrError(caption.FREE_STORAGE_QUANTITY_LARGER_THAN_RACK);
            //    return;
            //}
            //var line = $scope.listLine.filter(k => k.LineCode === $scope.model.LineCode);
            //var rack = $scope.listRack.filter(k => k.RackCode === $scope.model.RackCode);
            //$scope.model.PositionInStore = $scope.model.RackPosition + ", " + rack[0].RackName + ", " + line[0].L_Text;
            $scope.model.ProductQrCode = para.objPara.item.ProductQRCode;
            $scope.model.ProductCode = para.objPara.item.ProductCode;
            $scope.model.TicketCode = para.objPara.item.TicketCode;
            $scope.model.Size = para.objPara.item.Quantity;
            $scope.model.UnitCode = para.objPara.item.UnitCode;
            console.log(para.objPara.item);
            var entryObject = {
                OldMappingCode: para.objPara.item.Position,
                NewMappingCode: $scope.model.MappingCode,
                Value: $scope.model.Quantity,
            }
            $scope.model.EntryLog = entryObject;
            //if ($scope.model.Quantity <= remain) {
            //    $scope.model.Remain = remain - $scope.model.Quantity;
            //}
            //else {
            //    App.toastrError(caption.MIS_MSG_QUANTITY_EXIST);
            //    return;
            //}
            //remain = $scope.model.Remain;
            if (remain >= 0) {
                dataservice.moveProductVatco($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        dataservice.getPositionProductVatco(para.objPara.item.IdImpProduct, para.objPara.item.TicketCode, function (rs) {
                            rs = rs.data;
                            $scope.lstProduct = rs;
                        })
                        //dataservice.getQuantityEmptyInRack($scope.model.RackCode, function (rs) {
                        //    rs = rs.data;
                        //    $scope.QuantityEmpty = rs;
                        //});
                    }
                })
            }
            else {
                App.toastrError(caption.MIS_MSG_PROD_ALREADY_SET);
            }
        }
    };

    $scope.deleteOrder = function (id) {
        dataservice.deleteOrderProduct(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                remain = rs.Object;
                dataservice.getPositionProductVatco(para.objPara.item.IdImpProduct, para.objPara.item.TicketCode, function (rs) {
                    rs = rs.data;
                    $scope.lstProduct = rs;
                })
                dataservice.getQuantityEmptyInRack($scope.model.RackCode, function (rs) {
                    rs = rs.data;
                    $scope.QuantityEmpty = rs;
                });
            }
        })
    }

    //Hàm remove sản phẩm
    $scope.removeItem = function (index) {
        var productCoil = $scope.model.ListCoil[index];
        dataservice.deleteProductInStore(productCoil.Id, function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                if (para.objPara.item.Id != null && para.objPara.item.Id != '' && para.objPara.item.Id != undefined) {
                    $rootScope.updateOrderItemCoil(para.objPara.item.Id);
                    $rootScope.reloadData();
                }
                $scope.listCoil.push(productCoil);
                $scope.model.ListCoil.splice(index, 1);
                App.toastrSuccess(caption.MIST_DEL_LOCA_SUCESS);
            }
        });
    }

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
