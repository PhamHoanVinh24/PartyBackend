var ctxfolder = "/views/admin/vcInstock";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
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

        $http(req).success(callback);
    };
    return {
        //insert: function (data, callback) {
        //    $http.post('/Admin/VCInstock/Insert', data, callback).success(callback);
        //},
        //update: function (data, callback) {
        //    $http.post('/Admin/VCInstock/Update', data).success(callback);
        //},
        //deleteItems: function (data, callback) {
        //    $http.post('/Admin/VCInstock/DeleteItems', data).success(callback);
        //},
        //delete: function (data, callback) {
        //    $http.post('/Admin/VCInstock/Delete/' + data).success(callback);
        //},
        //getItem: function (data, callback) {
        //    $http.get('/Admin/VCInstock/GetItem/' + data).success(callback);
        //},
        //getItemDetail: function (data, callback) {
        //    $http.get('/Admin/VCInstock/GetItemDetail/' + data).success(callback);
        //},
        getListArea: function (callback) {
            $http.post('/Admin/VCInstock/GetListArea/').success(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/VCInstock/GetListProduct/').success(callback);
        },
        getListBrand: function (callback) {
            $http.post('/Admin/VCInstock/GetListBrand/').success(callback);
        },
        getTotal: function (data, callback) {
            $http.post('/Admin/VCInstock/GetTotal', data).success(callback);
        },
        getAllStaff: function (callback) {
            $http.post('/Admin/VCInstock/GetAllStaff/').success(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/VCInstock/GetListCustomer/').success(callback);
        },
        //gettreedataLevel: function (callback) {
        //    $http.post('/Admin/VCInstock/GetProductUnit/').success(callback);
        //},
        //uploadImage: function (data, callback) {
        //    submitFormUpload('/Admin/VCInstock/UploadImage/', data, callback);
        //}
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.dateNow = new Date();
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $http, $filter) {
    var vm = $scope;
    $scope.model = {
        CustomerName: '',
        Area: '',
        Staff: '',
        FromDate: '',
        ToDate: '',
        ProductCode: '',
        BrandCode: '',
        DateSearch: '',
        StaffCode:''
    };


    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/VCInstock/Jtable",
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
                d.CustomerName = $scope.model.CustomerName;
                d.Area = $scope.model.Area;
                d.StaffCode = $scope.model.StaffCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.ProductCode = $scope.model.ProductCode;
                d.BrandCode = $scope.model.BrandCode;
                d.DateSearch = $scope.model.DateSearch;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'desc'])
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
        })

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{ "VCMM_LIST_COL_STT" | translate }}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{ "VCMM_LIST_COL_ID" | translate }}').notSortable().withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CusName').withTitle('{{ "VCMM_LIST_COL_DISTRIBUTOR_AGENCY_STORE" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AreaName').withTitle('{{ "VCMM_LIST_COL_AREAS" | translate }}').notSortable().renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Birthday').withTitle('Ngày sinh').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    if (data != null && data != '')
    //        return $filter('date')(new Date(data), 'dd/MM/yyyy');
    //    else
    //        return '';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"VCMM_LIST_COL_SPECIES" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BrandName').withTitle('{{ "VCMM_TAB_DN_LIST_COL_TRADEMARK" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Instock').withTitle('{{ "VCMM_LIST_COL_INVENTORY" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        var dataFormat = $filter('currency')(data, '', 0);
        if (data <= 10) {
            return '<span class="text-success bold"> ' + dataFormat + '</span>';
        } else if (data >= 50) {
            return '<span class="text-danger bold"> ' + dataFormat + '</span>';
        } else {
            return '<span class="text-warning bold"> ' + dataFormat + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BuyCost').withTitle('{{ "VCMM_LIST_COL_IMPORT_PRICE" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        var dataFormat = $filter('currency')(data, '', 0);
        return '<span class="bold"> ' + dataFormat + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SaleCost').withTitle('{{ "VCMM_TAB_DN_LIST_COL_PRICE" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        var dataFormat = $filter('currency')(data, '', 0);
        return '<span class="bold"> ' + dataFormat + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Staff').withTitle('{{ "VCMM_LIST_COL_NAME" | translate }}').notSortable().withOption('sClass', 'tcenter').notSortable().renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{ "VCMM_LIST_COL_TIME" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data != null && data != '')
            return $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm');
        else
            return '';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('Ghi chú').notSortable().withOption('sClass', 'tcenter hidden').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('pathimg').withTitle('Ảnh').notSortable().renderWith(function (data, type) {
    //    return data === "" ? "" : '<img class="img-circle" src="' + data + '" height="65" width="65">';
    //}).withOption('sWidth', '50px'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('Tác vụ').renderWith(function (data, type, full) {
    //    return '<button ng-click="detail(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline green hidden"><i class="fa fa-info"></i></button>' +
    //        '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.reload = function () {
        reloadData(true);
        $scope.getTotalValue();
    }
    $rootScope.reload = function () {
        $scope.reload();
    }

    $rootScope.rootreload = function () {
        $scope.reload();
    }

    $scope.initLoad = function () {
        dataservice.getListArea(function (result) {
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.ListArea = result;
            }
        });
        dataservice.getListProduct(function (result) {
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.ListProduct = result;
            }
        });
        dataservice.getListBrand(function (result) {
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.ListBrand = result;
            }
        });
        dataservice.getListCustomer(function (rs) {
            $scope.listCustomer = rs;
        });
        setTimeout(function () {
            $scope.getTotalValue();
        }, 500);


    }
    $scope.initLoad();
    $scope.getTotalValue = function () {
        dataservice.getTotal($scope.model, function (result) {
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.totalInstock = result.totalInstock;
            }
        });
    };

    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '70',

    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}
    //$scope.edit = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: '70',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}
    //$scope.delete = function (id) {
    //    $confirm({ text: 'Bạn có chắc chắn xóa?', title: 'Xác nhận', cancel: ' Hủy ' })
    //        .then(function () {
    //            App.blockUI({
    //                target: "#contentMain",
    //                boxed: true,
    //                message: 'loading...'
    //            });
    //            dataservice.delete(id, function (result) {
    //                if (result.Error) {
    //                    App.toastrError(result.Title);
    //                } else {
    //                    App.toastrSuccess(result.Title);
    //                    $scope.reload();
    //                }
    //                App.unblockUI("#contentMain");
    //            });
    //        });
    //}
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $('#datesearch').datepicker({
            format: "mm/yyyy",
            autoclose: true,
            startView: "months",
            minViewMode: "months",
        });
    }

    setTimeout(function () {
        loadDate();

    }, 200);




    //function showHideSearch() {
    //    $(".btnSearch").click(function () {
    //        $(".input-search").removeClass('hidden');
    //        $(".btnSearch").hide();
    //    });
    //    $(".close-input-search").click(function () {
    //        $(".input-search").addClass('hidden');
    //        $(".btnSearch").show();
    //    });
    //}
    setTimeout(function () {
    
    }, 50);

    //Export Excel
    $scope.export = function () {
        var orderBy = 'Id DESC';
        var exportType = 0;
        var orderArr = $scope.dtInstance.DataTable.order();
        var column;
        if (orderArr.length == 2) {
            column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
            orderBy = column.mData + ' ' + orderArr[1];
        } else if (orderArr.length > 0) {
            var order = orderArr[0];
            column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
            orderBy = column.mData + ' ' + order[1];
        }
        //var pageInfo = $scope.dtInstance.DataTable.page.info();
        //var obj = {
        //    start: pageInfo.row,
        //    length: pageInfo.length,
        //    //QueryOrderBy: orderBy,
        //    ExportType: exportType,
        //    Month: $scope.model.CustomerMonth,
        //    Packcode: $scope.model.PackCode,
        //    Cif: $scope.model.CustomerCif
        //};

        var page = vm.dtInstance.DataTable.page() + 1;
        var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/VCInstock/ExportExcel?"
            + "page=" + page
            + "&row=" + length
            + "&customerName=" + $scope.model.CustomerName
            + "&areaExport=" + $scope.model.Area
            + "&staffCode=" + $scope.model.StaffCode
            + "&productCode=" + $scope.model.ProductCode
            + "&brandCode=" + $scope.model.BrandCode
            + "&fromDate=" + $scope.model.FromDate
            + "&toDate=" + $scope.model.ToDate
            + "&dateSearch=" + $scope.model.DateSearch
            + "&orderBy=" + orderBy
    }
    $scope.getAllStaff = function () {
        dataservice.getAllStaff(function (rs) {
            $scope.allStaff = rs;
        });
    }
    $scope.getAllStaff();


});



