var ctxfolder = "/views/admin/notification";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getContract: function (callback) {
            $http.post('/Admin/Notification/GetContract').then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/Notification/getStatus/').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/Notification/GetItem', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/Notification/Insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Notification/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/Notification/Delete', data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
  var culture = $cookies.get('_CULTURE') || 'vi-VN';
  $translate.use(culture);
  $rootScope.$on('$translateChangeSuccess', function () {
      caption = caption[culture];
      $.extend($.validator.messages, {
          min: caption.COM_VALIDATE_VALUE_MIN,
          //max: 'Max some message {0}'
      });
  });
    $rootScope.validationOptions = {
        rules: {
            NotifyCode: {
                required: true
            },
            Title: {
                required: true
            }
        },
        messages: {
            NotifyCode: {
                required: caption.NTC_VALIDATE_CODE,
            },
            Title: {
                required: caption.NTC_VALIDATE_NAME,
            }
        }
      }
 
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
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
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        Name: '',
        FromDate: '',
        ToDate: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Notification/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Name = $scope.model.Name;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
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
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.NotifyID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.NotifyID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NotifyCode').withTitle('{{"NTC_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"NTC_LIST_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Content').withTitle('{{"NTC_LIST_COL_CONTENT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ReceiverConfirm').withTitle('Đồng ý').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ConfirmTime').withTitle('Thời gian đồng ý').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreateTime').withTitle('{{"NTC_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"NTC_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        return data ;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"NTC_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.NotifyID + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.NotifyID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.search = function () {
        if (($scope.model.UserId === '' || $scope.model.UserId == null) && ($scope.model.StartDate === '' || $scope.model.StartDate == null) && ($scope.model.EndDate === '' || $scope.model.EndDate == null) && ($scope.model.Action === '' || $scope.model.Action == null) && ($scope.model.ApplicationId === '' || $scope.model.ApplicationId == null)) {
            App.toastrWarning(caption.NTC_MSG_CONDITION);
        } else {
            reloadData(true);
        }
    }
    $scope.reload = function () {
        reloadData(false);
    }
    $scope.initLoad = function () {

    }
    $scope.initLoad();
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
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.delete = function (id) {
        $confirm({ text: caption.NTC_DELETE_NOTIFICATION, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM, cancel: caption.COM_CONFIRM_CANCEL })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.delete(id, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                    }
                });
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
    }
    setTimeout(function () {
        showHideSearch();
        loadDate();
    }, 50);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, $uibModalInstance, dataservice, $filter) {
    $scope.model = {
        NotifyCode: '',
        Title: '',
        Status: '',
        LstContractCode: '',
        Content: '',
    }
    $scope.model1 = {
        contractCode: []
    }
    $scope.initData = function () {
        dataservice.getStatus(function (result) {result=result.data;
            $scope.statusData = result;
        });
        dataservice.getContract(function (result) {result=result.data;
            $scope.contractData = result;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.LstContractCode = $scope.model1.contractCode.join(',');
            dataservice.insert($scope.model, function (rs) {rs=rs.data;
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
    $scope.changleSelect = function (selectType) {
        if (selectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (selectType == "Contract" && $scope.model1.contractCode.length != 0) {
            $scope.errorContract = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null status
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        //Check null contract
        if ($scope.model1.contractCode.length == 0) {
            $scope.errorContract = true;
            mess.Status = true;
        } else {
            $scope.errorContract = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, $uibModalInstance, dataservice, para) {
    $scope.model1 = {
        contractCode: []
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getStatus(function (result) {result=result.data;
            $scope.statusData = result;
        });
        dataservice.getContract(function (result) {result=result.data;
            $scope.contractData = result;
        });
        dataservice.getItem(para, function (result) {result=result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                $scope.model = result.Object;
                $scope.model1.contractCode = $scope.model.LstContractCode.split(',');
            }
        });
    }
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.LstContractCode = $scope.model1.contractCode.join(',');
            dataservice.update($scope.model, function (rs) {rs=rs.data;
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
    $scope.changleSelect = function (selectType) {
        if (selectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (selectType == "Contract" && $scope.model1.contractCode.length != 0) {
            $scope.errorContract = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null status
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        //Check null contract
        if ($scope.model1.contractCode.length == 0) {
            $scope.errorContract = true;
            mess.Status = true;
        } else {
            $scope.errorContract = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
