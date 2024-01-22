var ctxfolder = "/views/admin/materialPaymentTicket";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        //getUnit: function (data, callback) {
        //    $http.get('/Admin/MaterialPaymentTicket/GetUnit?impCode=' + data).then(callback);
        //},
        //getStore: function (callback) {
        //    $http.post('/Admin/MaterialPaymentTicket/GetStore').then(callback);
        //},
        //getUser: function (callback) {
        //    $http.post('/Admin/MaterialPaymentTicket/GetUser').then(callback);
        //},
        //getSupplier: function (callback) {
        //    $http.post('/Admin/MaterialPaymentTicket/Getsupplier').then(callback);
        //},
        getContract: function (callback) {
            $http.post('/Admin/MaterialPaymentTicket/GetContract').then(callback);
        },
        checkContract: function (data, callback) {
            $http.get('/Admin/MaterialPaymentTicket/CheckContract?contractCode=' + data).then(callback);
        },
        getPaymentObjType: function (callback) {
            $http.post('/Admin/MaterialPaymentTicket/GetPaymentObjType').then(callback);
        },
        getUnit: function (callback) {
            $http.post('/Admin/MaterialPaymentTicket/GetUnit').then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/MaterialPaymentTicket/GetItem?id=' + data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/MaterialPaymentTicket/Insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/MaterialPaymentTicket/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/MaterialPaymentTicket/Delete', data).then(callback);
        }
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'en-US';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });


        $rootScope.validationOptions = {
            rules: {
                PayCode: {
                    required: true
                },
                PayTitle: {
                    required: true
                },
                MoneyTotal: {
                    required: true
                }
            },
            messages: {
                PayCode: {
                    
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MPT_CURD_LBL_MPT_PAY_CODE),
                },
                PayTitle: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MPT_CURD_LBL_MPT_PAY_TITLE),
                },
                MoneyTotal: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MPT_CURD_LBL_MPT_MONEY_TOTAL),
                }
            }
        }
        
    });
    dataservice.getPaymentObjType(function (rs) {rs=rs.data;
        $rootScope.PaymentObjType = rs;
    })
    dataservice.getUnit(function (rs) {rs=rs.data;
        $rootScope.UnitData = rs;
    })
    $rootScope.PaymentType = [{
        Value: true,
        Name: "Phiếu thu"
    }, {
        Value: false,
        Name: "Phiếu chi"
    }]
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
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
        }).when('/function/', {
            templateUrl: ctxfolder + '/function.html',
            controller: 'function'
        });

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
    var vm = $scope;
    $scope.model = {
        PayTitle: '',
        PayType: '',
        ContractName: '',
        FromDate: '',
        ToDate: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialPaymentTicket/jtable",
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
                d.PayTitle = $scope.model.PayTitle;
                d.PayType = $scope.model.PayType;
                d.ContractName = $scope.model.ContractName;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"MPT_LIST_COL_MPT_TITLE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContractName').withTitle('{{"MPT_LIST_COL_MPT_CONTRACT_NAME" | translate}}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"MPT_LIST_COL_MPT_TITLE_TYPE" | translate}}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalPay').withTitle('{{"MPT_LIST_COL_MPT_TOTAL_PAY" | translate}}').renderWith(function (data) {
        return data != "" ? $filter('currency')(data, '', 0) : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"MPT_LIST_COL_MPT_UNIT" | translate}}').renderWith(function (data) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"MPT_LIST_COL_MPT_CREATED_TIME" | translate}}').renderWith(function (data) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MPT_LIST_COL_MPT_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.search = function () {
        if ($scope.model.Name === '' || $scope.model.Name == null) {
            App.toastrWarning('Nhập điều kiện tìm kiếm');
        } else {
            reloadData(true);
        }
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '40'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        dataservice.getItem(userModel.Id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '40',
                    resolve: {
                        para: function () {
                            return rs.Object;
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
                $scope.message = "Bạn có muốn xóa ";
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {rs=rs.data;
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
    function loadDate() {
        $("#FromDate").datepicker({
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
            $('#FromDate').datepicker('setEndDate', maxDate);
        });
    }
    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });
    }
    setTimeout(function () {
        showHideSearch();
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice) {
    var vm = $scope;
    $scope.model = {
        PayCode: '',
        PayTitle: '',
        PayType: null,
        PayObjType: '',
        PayObjId: '',
        MoneyTotal: '',
        Currency: '',
        PayNote: ''
    }
    $scope.model1 = {
        Paid: false,
        PaymentCompleted: false,
        Total: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if (parseFloat($scope.model.MoneyTotal) > parseFloat($scope.model1.Total)) {
                App.toastrError(caption.MPT_VALIDATE_PAYMENT);
            } else {
                dataservice.insert($scope.model, function (rs) {rs=rs.data;
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

    $scope.selectObj = function (obj) {
        if (obj.indexOf("Contract")) {
            dataservice.getContract(function (rs) {rs=rs.data;
                $scope.ObjectName = rs;
            });
        }
    }
    $scope.selectObjName = function (obj) {
        dataservice.checkContract(obj, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                if (rs.Object == '0') {
                    $("#MoneyTotal").prop('disabled', true);
                    $scope.model1.PaymentCompleted = true;
                    $scope.model1.Paid = true;
                    $scope.model1.Total = '';
                    $scope.model.MoneyTotal = '';
                } else {
                    $("#MoneyTotal").prop('disabled', false);
                    $scope.model1.Paid = false;
                    $scope.model1.Total = rs.Object;
                }
            }
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "PayType" && $scope.model.PayType != "") {
            $scope.errorPayType = false;
        }
        if (SelectType == "PayObjType" && $scope.model.PayObjType != "") {
            $scope.errorPayObjType = false;
        }
        if (SelectType == "PayObjId" && $scope.model.PayObjId != "") {
            $scope.errorPayObjId = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null loại phiếu
        if (data.PayType != null) {
            $scope.errorPayType = false;
        } else {
            $scope.errorPayType = true;
            mess.Status = true;
        }
        //Check null loại đối tượng
        if (data.PayObjType == "") {
            $scope.errorPayObjType = true;
            mess.Status = true;
        } else {
            $scope.errorPayObjType = false;
        }

        //Check null Tên đối tượng
        if (data.PayObjId == "") {
            $scope.errorPayObjId = true;
            mess.Status = true;
        } else {
            $scope.errorPayObjId = false;
        }

        //Check null Tên đối tượng
        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }

        //Check null loại tiền
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model1 = {
        Paid: false,
        PaymentCompleted: false,
        Total: ''
    }
    $scope.initLoad = function () {
        $scope.model = para;

        //dataservice.getUnit($rootScope.ImpCode, function (rs) {rs=rs.data;
        //    $scope.UnitData = rs;
        //});
        //dataservice.getUser(function (rs) {rs=rs.data;
        //    $scope.UserData = rs;
        //});
        //dataservice.getStore(function (rs) {rs=rs.data;
        //    $scope.StoreData = rs;
        //});
        //dataservice.getSupplier(function (rs) {rs=rs.data;
        //    $scope.SupplierData = rs;
        //});
        if ($scope.model.PayObjType.indexOf("Contract")) {
            dataservice.getContract(function (rs) {rs=rs.data;
                $scope.ObjectName = rs;
            });
        }
    }
    $scope.initLoad();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataservice.update($scope.model, function (result) {result=result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }

    $scope.selectObj = function (obj) {
        if (obj.indexOf("Contract")) {
            dataservice.getContract(function (rs) {rs=rs.data;
                $scope.ObjectName = rs;
            });
        }
    }
    $scope.selectObjName = function (obj) {
        dataservice.checkContract(obj, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                if (rs.Object == '0') {
                    $("#MoneyTotal").prop('disabled', true);
                    $scope.model1.PaymentCompleted = true;
                    $scope.model1.Paid = true;
                    $scope.model1.Total = '';
                    $scope.model.MoneyTotal = '';
                } else {
                    $("#MoneyTotal").prop('disabled', false);
                    $scope.model1.Paid = false;
                    $scope.model1.Total = rs.Object;
                }
            }
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "PayType" && $scope.model.PayType != "") {
            $scope.errorPayType = false;
        }
        if (SelectType == "PayObjType" && $scope.model.PayObjType != "") {
            $scope.errorPayObjType = false;
        }
        if (SelectType == "PayObjId" && $scope.model.PayObjId != "") {
            $scope.errorPayObjId = false;
        }
        if (SelectType == "Currency" && $scope.model.Currency != "") {
            $scope.errorCurrency = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null loại phiếu
        if (data.PayType != null) {
            $scope.errorPayType = false;
        } else {
            $scope.errorPayType = true;
            mess.Status = true;
        }
        //Check null loại đối tượng
        if (data.PayObjType == "") {
            $scope.errorPayObjType = true;
            mess.Status = true;
        } else {
            $scope.errorPayObjType = false;
        }

        //Check null Tên đối tượng
        if (data.PayObjId == "") {
            $scope.errorPayObjId = true;
            mess.Status = true;
        } else {
            $scope.errorPayObjId = false;
        }

        //Check null Tên đối tượng
        if (data.Currency == "") {
            $scope.errorCurrency = true;
            mess.Status = true;
        } else {
            $scope.errorCurrency = false;
        }

        //Check null loại tiền
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
