var ctxfolder = "/views/admin/staffWarning";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", 'ngSanitize', "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getDetailStatisticalWithMember: function (memberId, from, to, callback) {
            $http.get('/Admin/StaffWarning/GetDetailStatisticalWithMember?memberId=' + memberId + '&fromDate=' + from + '&toDate=' + to).then(callback);
        },
        countUserWorking: function (callback) {
            $http.get('/Admin/StaffWarning/CountUserWorking').then(callback);
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
        });
    });
    $rootScope.today = new Date();
    dataservice.getListUser(function (rs) {rs=rs.data;
        $rootScope.listUser = rs;
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/StaffWarning/Translation');
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
        UserId: '',
        FromDate: '',
        ToDate: ''
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffWarning/JtableStaffLate",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.model.UserId;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    //var Id = data.Id;
                    var obj = {
                        MemberId: data.MemberId,
                        GivenName: data.GivenName,
                        Picture: data.Picture,
                        FromDate: $scope.model.FromDate,
                        ToDate: $scope.model.ToDate,
                    };
                    var UserId = data.MemberId;
                    //$scope.edit(Id, UserId);
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/statisticalDetail.html',
                        controller: 'statisticalDetail',
                        backdrop: 'static',
                        size: '20',
                        resolve: {
                            para: function () {
                                return obj;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                    }, function () { });
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.NotifyID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.NotifyID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Picture').withOption('sClass', '').withTitle('{{"SW_LIST_COL_AVATAR" | translate}}').renderWith(function (data, type) {
        return data === "" ? "" : '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_user.png' + '"' + "'" + ' class="img-responsive" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withOption('sClass', '').withTitle('{{"SW_LIST_COL_EMPLOYEE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumberLate').withTitle('{{"SW_LIST_COL_TOTAL_TIME_LATE" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data > 0) {
            return '<span class="text-danger bold">' + data + '</span>'
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LatePermision').withTitle('{{"SW_LIST_COL_LATE_TIMES_ALLOW" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data > 0) {
            return '<span class="text-danger bold">' + data + '</span>'
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"SW_LIST_COL_LATE_TIMES_NO_ALLOW" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        var total = (parseInt(full.NumberLate) - parseInt(full.LatePermision));
        if (total > 0) {
            return '<span class="text-danger bold">' + total + '</span>'
        } else {
            return '<span ">' + total + '</span>'
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumberNoWorking').withTitle('{{"SW_LIST_COL_TOTAL_BREAK" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data > 0) {
            return '<span class="text-danger bold">' + data + '</span>'
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NoWorkingPermision').withTitle('{{"SW_LIST_COL_TIMES_BREAK_ALLOW" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data > 0) {
            return '<span class="text-danger bold">' + data + '</span>'
        } else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('{{"SW_LIST_COL_TIMES_BREAK_NO_ALLOW" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        var total = (parseInt(full.NumberNoWorking) - parseInt(full.NoWorkingPermision));
        if (total > 0) {
            return '<span class="text-danger bold">' + total + '</span>'
        } else {
            return '<span ">' + total + '</span>'
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Active').withTitle('{{"SW_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        if (data == 'True') {
            return '<span class="text-success">Đang sử dụng</span>'
        } else {
            return '<span class="text-danger">Không sử dụng</span>'
        }
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
    $scope.init = function () {
        dataservice.countUserWorking(function (rs) {rs=rs.data;
            $scope.model.CountWorking = rs;
        })
    }
    $scope.init();
    $scope.search = function () {
        if ($scope.model.FromDate != '' || $scope.model.ToDate != '') {
            if ($scope.model.FromDate == '' && $scope.model.ToDate == '') {
                App.toastrError(caption.SW_MSG_PLS_ENTER_DATE_TO_DATE);
            } else {
                reloadData(true);
            }
        } else {
            reloadData(true);
        }
    }
    $scope.reload = function () {
        reloadData(false);
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
app.controller('statisticalDetail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model = {
        FromDate: para.FromDate,
        ToDate: para.ToDate,
        MemberId: para.MemberId,
        GivenName: para.GivenName,
        Picture: para.Picture,
        CountWorking: 0,
        HoursWork: 0,
        MinutesWork: 0,
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        dataservice.getDetailStatisticalWithMember($scope.model.MemberId, $scope.model.FromDate, $scope.model.ToDate, function (rs) {rs=rs.data;
            if (!rs.Error) {
                $scope.model.HoursWork = rs.Object.Hours;
                $scope.model.MinutesWork = rs.Object.Minutes;
            }
        })
       
    }
    $scope.init();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});