var ctxfolderStaffLate = "/views/admin/staffLate";
var ctxfolderCommon = "/views/admin/commonSetting";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_STAFF_LATE', ['App_ESEIM_DASHBOARD', 'App_ESEIM', 'App_ESEIM_WF_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", 'ngSanitize', "ngCookies"]);

app.directive('bDatetimepicker', function ($parse) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attr) {
            el.datetimepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy hh:ii",
                fontAwesome: true,
            }).on('changeDate', function () {
                if (el.valid()) {
                    el.removeClass('invalid').addClass('success');
                }
            });
            var noStartDate = false;
            var startDate = new Date();
            if (attr.noStartDate != null && attr.noStartDate != "") {
                scope.$watch($parse(attr.noStartDate), function (newval) {
                    noStartDate = newval;
                    if (newval == true) {
                        el.datetimepicker('setStartDate', new Date(1960, 01, 01));
                    }
                    else {
                        el.datetimepicker('setStartDate', startDate);
                    }
                });
            }
            if (attr.startDate != null && attr.startDate != "") {
                scope.$watch($parse(attr.startDate), function (newval) {
                    startDate = newval;
                    if (newval == true) {
                        el.datetimepicker('setStartDate', startDate);
                    }
                });
            }
            if (attr.endDate != null && attr.endDate != "") {
                scope.$watch($parse(attr.endDate), function (newval) {
                    endDate = newval;
                    if (newval == true) {
                        el.datetimepicker('setEndDate', endDate);
                    }
                });
            }
        }
    };
});

app.directive('bDatepicker', function ($parse) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attr) {
            el.datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function () {
                if (el.valid()) {
                    el.removeClass('invalid').addClass('success');
                }
            });
            var noStartDate = false;
            var startDate = new Date();
            if (attr.noStartDate != null && attr.noStartDate != "") {
                scope.$watch($parse(attr.noStartDate), function (newval) {
                    noStartDate = newval;
                    if (newval == true) {
                        el.datepicker('setStartDate', new Date(1960, 01, 01));
                    }
                    else {
                        el.datepicker('setStartDate', startDate);
                    }
                });
            }
            if (attr.startDate != null && attr.startDate != "") {
                scope.$watch($parse(attr.startDate), function (newval) {
                    console.log(newval);
                    startDate = newval;
                    if (noStartDate == false) {
                        el.datepicker('setStartDate', startDate);
                    }
                });
            }
            if (attr.endDate != null && attr.endDate != "") {
                scope.$watch($parse(attr.endDate), function (newval) {
                    console.log(newval);
                    endDate = newval;
                    if (noStartDate == false) {
                        el.datepicker('setEndDate', endDate);
                    }
                });
            }
        }
    };
});

app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});

app.factory('dataserviceStaffLate', function ($http) {
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
        add: function (data, callback) {
            submitFormUpload('/Admin/StaffLate/Add/', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/StaffLate/update/', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/StaffLate/Delete', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/StaffLate/GetItem/', data).then(callback);
        },
        exportExcel: function (data, callback) {
            submitFormUpload('/Admin/StaffLate/ExportExcel/', data, callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getStaffLateOfUser: function (data, callback) {
            $http.get('/Admin/StaffLate/GetStaffLateOfUser?').then(callback);
        },
        getAddressForCoordinates: function (latitude, longitude, callback) {
            $http.get('/Admin/StaffLate/GetAddressForCoordinates?latitude=' + latitude + '&longitude=' + longitude).then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/StaffLate/GetListStatus').then(callback);
        },
        getListNotWorkType: function (callback) {
            $http.post('/Admin/StaffLate/GetListNotWorkType').then(callback);
        },
        eventCalendar: function (data, memberId, viewMode, callback) {
            $http.post('/Admin/StaffLate/EventCalendar?dateSearch=' + data + '&memberId=' + memberId + '&viewMode=' + viewMode).then(callback);
        },
        getAllTotal: function (memberId, month, year, from, to, viewMode, callback) {
            $http.get('/Admin/StaffLate/GetAllTotal?memberId=' + memberId + '&month=' + month + '&year=' + year + '&from=' + from + '&to=' + to + '&viewMode=' + viewMode).then(callback);
        },
        //approve: function (data, callback) {
        //    $http.post('/Admin/StaffLate/Approve?id=' + data).then(callback);
        //},

        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        getGroupNotWork: function (callback) {
            $http.post('/Admin/StaffLate/GetGroupNotWork').then(callback);
        },
        getWorkflowNotWork: function (callback) {
            $http.get('/Admin/StaffLate/GetWorkflowNotWork').then(callback);
        },
        createWfInstance: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CreateWfInstance', data).then(callback)
        },
        checkDate: function (data, data1, callback) {
            $http.get('/Admin/StaffLate/CheckDate?fromDate=' + data + '&toDate=' + data1).then(callback);
        },

        //Workflow
        checkPermissionEditActivityById: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/CheckPermissionEditActivityById?id=' + data).then(callback);
        },
        getItemActInst: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetItemActInst?id=' + data).then(callback)
        },
        getLogStatus: function (data, callback) {
            $http.post('/Admin/StaffLate/GetLogStatus?id=' + data).then(callback);
        },
        suggestWF: function (callback) {
            $http.post('/Admin/StaffLate/SuggestWF').then(callback);
        },
        updateStatusActInst: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/UpdateStatusActInst?actInst=' + data + '&status=' + data1).then(callback);
        },
        getPermission: function (data, callback) {
            $http.get('/Admin/WorkflowActivity/GetPermission?actInstCode=' + data).then(callback);
        },
        approveStaffLate: function (data, callback) { // not used anymore
            $http.post('/Admin/StaffLate/ApproveStaffLate?id=' + data).then(callback)
        },
        approve: function (data, callback) {
            $http.post('/Admin/WorkflowActivity/Approve?actInstCode=' + data).then(callback)
        },
        unapprove: function (data, data1, callback) {
            $http.post('/Admin/WorkflowActivity/Unapprove?actInstCode=' + data + '&status=' + data1).then(callback)
        },
    }
});

app.controller('Ctrl_ESEIM_STAFF_LATE', function ($scope, $rootScope, $filter, dataserviceStaffLate, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                ActionTime: {
                    required: true,
                },
                ActionBegin: {
                    required: true,
                },
                ActionTo: {
                    required: true,
                }
            },
            messages: {
                ActionTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.STL_CURD_LBL_TIME),
                },
                ActionBegin: {
                    required: 'Từ ngày yêu cầu bắt buộc'
                },
                ActionTo: {
                    required: 'Đến ngày yêu cầu bắt buộc'
                }
            }
        }
    });
    $rootScope.dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
    dataserviceStaffLate.getListUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderStaffLate + '/index.html',
            controller: 'indexStaffLate'
        })
        .when('/add', {
            templateUrl: ctxfolderStaffLate + '/add.html',
            controller: 'addStaffLate'
        })
        .when('/edit', {
            templateUrl: ctxfolderStaffLate + '/edit.html',
            controller: 'editStaffLate'
        })

    $translateProvider.useUrlLoader('/Admin/StaffLate/Translation');
    caption = $translateProvider.translations();
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

app.controller('indexStaffLate', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceStaffLate, $filter, $location, myService) {
    $scope.model = {
        UserId: '',
        FromDate: moment().format('DD/MM/YYYY'),
        ToDate: '',
        Status: '',
        ViewMode: 'ACTION_TIME'
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffLate/Jtable",
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
                d.Status = $scope.model.Status;
                d.ViewMode = $scope.model.ViewMode;
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                console.log(d);
                $scope.totalRecord = d.responseJSON.recordsTotal;
                $scope.totalSessionUser = d.responseJSON.totalUserRecord;
                $scope.$apply();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        //.withOption('scrollY', "62vh")
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('rowCallback', function (tabRow, data, dataIndex) {
            var tr = $(tabRow);
            var table = $scope.dtInstance.DataTable;
            var row = table.row(tr);
            if (data.ListAct != '' && data.ListAct != null && data.ListAct != '[]') {
                row.child(formatRow(row.data())).show();
                const contextScope = $scope.$new(true);
                $compile(angular.element(row.child()).contents())($scope);
                contextScope.data = data;
                if (data.WfInstStatus == "STATUS_WF_SUCCESS") {
                    angular.element(row.child()).addClass('disabled-element');
                }
                angular.element(row.child()).addClass('no-border-top');
                if (data._STT % 2 == 1) {
                    angular.element(row.child()).addClass('odd');
                }
            }
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            if (data.WfInstStatus == "STATUS_WF_SUCCESS") {
                angular.element(row).addClass('disabled-element');
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    var UserId = data.UserId;
                    var CreatedBy = data.CreatedBy;
                    if (Id != -1) {
                        $scope.edit(Id, UserId, CreatedBy);
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Picture').withOption('sClass', 'tcenter w20').withTitle('{{"STL_LIST_COL_IMAGE" | translate}}').renderWith(function (data, type) {
        return data === "" ? "" : '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_user.png' + '"' + "'" + ' class="img-responsive" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').withOption('sClass', 'dataTable-20per no-wrap').withTitle('{{"STL_LIST_COL_FULL_NAME" | translate}}').renderWith(function (data, type, full) {
        var content = '<span class="text-purple">' + full._STT + ". " + data + '</span>';
        if (full.CountAll && full.Action == 'NOT_WORK')
            content = content + '<br><span class="text-danger">(' + caption.STL_COUNT_NOT_WORK_DAY + ': ' + full.CountAll + ')<span>';

        if (full.SLastLog != '' && full.SLastLog != null && full.SLastLog != undefined) {
            content += formatDetail(full);
        }
        return content;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{"STL_CURD_LBL_REPORT_TYPE" | translate}}').withOption('sClass', 'w20').renderWith(function (data, type, full) {
        var content = full.Status;
        if (full.NotWorkType !== '' && full.NotWorkType !== null && full.NotWorkType !== undefined)
            content = content + '<br><span class="text-danger">(' + full.NotWorkTypeName + ')<span>';
        return content;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActionTime').withTitle('{{"STL_LIST_COL_TIME" | translate}}').withOption('sClass', 'w20').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LocationText').withOption('sClass', 'dataTable-20per').withTitle('{{"STL_LIST_COL_PLACE" | translate}}').withOption('sClass', 'dataTable-20per').renderWith(function (data, type, full) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Approve').withOption('sClass', 'tcenter').withTitle('{{"STL_LIST_COL_APPROVAL" | translate}}').withOption('sClass', 'dataTable-20per').renderWith(function (data, type, full) {

    //    if (data == "True") {
    //        return '<span class="cursor glyphicon glyphicon-ok-sign text-success fs24 pl-2 pTip-right btn-publish-inline" ng-click="approve(' + full.Id + ')" ></span> ' +
    //            '<br><span>Duyệt bởi: ' + full.Approver + ',</span><br>' +
    //            '<span>lúc: ' + full.ApproveTime + '</span>';
    //    }
    //    else {
    //        return '<span class="cursor glyphicon glyphicon-ban-circle text-danger fs24 pl-2 pTip-right btn-publish-inline" ng-click="approve(' + full.Id + ')"></span> '
    //    }
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"STL_LIST_COL_ACTION" | translate}}').withOption('sClass', 'dataTable-w80 nowrap').renderWith(function (data, type, full) {
        if (full.Id != -1) {
            return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ',\'' + full.UserId + '\',\'' + full.CreatedBy + '\')" style = "width: 25px; height: 25px; padding: 0px; margin-right: 10px;"><i class="fas fa-edit fs20 color-dark"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ',\'' + full.UserId + '\',\'' + full.CreatedBy + '\')" style="width: 25px; height: 25px; padding: 0px; margin-right: 10px;"><i class="fas fa-trash fs20 color-dark"></i></a>' +
                '<a title="{{&quot;STL_TITLE_WORKFLOW&quot; | translate}}" ng-click="viewWf(' + full.Id + ',\'' + full.UserId + '\',\'' + full.CreatedBy + '\')" style="width: 25px; height: 25px; padding: 0px;"><i class="fas fa-thumbs-up fs20 color-dark"></i></a>';
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


    $scope.reload = function () {
        reloadData(false);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $rootScope.reloadIndex = function () {
        reloadData(false);
    }

    $scope.initData = function () {
        dataserviceStaffLate.getListStatus(function (rs) {
            rs = rs.data;
            $scope.ListStatus = rs;
        });
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

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderStaffLate + '/add.html',
            controller: 'addStaffLate',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
            $('#calendar').fullCalendar('refetchEvents');
        }, function () {
        });
        //$location.path("/add");
    }

    $scope.edit = function (id, targetId, createdBy) {
        //myService.setData(data = { Id: id, UserId: userId });
        //$location.path('/edit');
        if (createdBy != userName && isAllData != "True") {
            return App.toastrError(caption.COM_MSG_NO_PERMISSION);
        }

        dataserviceStaffLate.getItem(id, function (obj) {
            obj = obj.data;

            if (obj.Object && obj.Object.Approve == true) {
                return App.toastrError(caption.STL_MSG_APPROVED_NOT_EDIT);
            }

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderStaffLate + '/edit.html',
                controller: 'editStaffLate',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return obj.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
                $('#calendar').fullCalendar('refetchEvents');
            }, function () {
            });
        });
    }
    $scope.viewWf = function (id, targetId, createdBy) {

        dataserviceStaffLate.getItem(id, function (obj) {
            obj = obj.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderStaffLate + '/staff-wf.html',
                controller: 'staff-wf',
                backdrop: 'static',
                size: '35',
                resolve: {
                    para: function () {
                        return obj.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reload();
                $('#calendar').fullCalendar('refetchEvents');
            }, function () {
            });
        });
    }

    $scope.delete = function (id, targetId, createdBy) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceStaffLate.delete(id, function (result) {
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
            $scope.reloadNoResetPage();
            $('#calendar').fullCalendar('refetchEvents');
        }, function () {
        });
    };

    $rootScope.approve = function (actInstCode, status, id) {
        dataserviceStaffLate.getPermission(actInstCode, function (obj) {
            obj = obj.data;
            if (!obj.PermisstionApprove) {
                return App.toastrError(caption.COM_MSG_NO_PERMISSION);
            }
            if (status == "Đang xử lý") {
                dataserviceStaffLate.approve(actInstCode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        dataserviceStaffLate.updateStatusActInst(actInstCode, "STATUS_ACTIVITY_END", function (rs1) {
                            rs1 = rs1.data;
                            if (rs1.Error) {
                                App.toastrError(rs1.Title);
                            } else {
                                reloadData(true);
                            }
                        })
                    }
                });
            }
            else {
                var actStatus = "";
                if (status == "Kích hoạt") {
                    actStatus = "STATUS_ACTIVITY_CANCEL";
                }
                else if (status == "Đã xử lý") {
                    actStatus = "STATUS_ACTIVITY_STOPPED";
                }
                else if (status == "Hủy") {
                    actStatus = "STATUS_ACTIVITY_ACTIVE";
                }
                else if (status == "Dừng lại") {
                    actStatus = "STATUS_ACTIVITY_DOING";
                }
                if (actStatus != "") {
                    dataserviceStaffLate.unapprove(actInstCode, actStatus, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            dataserviceStaffLate.updateStatusActInst(actInstCode, actStatus, function (rs1) {
                                rs1 = rs1.data;
                                if (rs1.Error) {
                                    App.toastrError(rs1.Title);
                                } else {
                                    reloadData(true);
                                }
                            })
                        }
                    });
                }
            }
        });
        //dataserviceStaffLate.approve(id, function (rs) {
        //    rs = rs.data;
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    } else {
        //        App.toastrSuccess(rs.Title);
        //        $scope.reload();
        //    }
        //})
    }

    $scope.changeView = function (mode) {
        $scope.model.ViewMode = mode;
        $scope.reload();
        $('#calendar').fullCalendar('refetchEvents');
    }


    $scope.exportExcel = function () {
        location.href = "/Admin/StaffLate/ExportExcel?"
            + "&UserId=" + $scope.model.UserId
            + "&FromDate=" + $scope.model.FromDate
            + "&ToDate=" + $scope.model.ToDate
            + "&Status=" + $scope.model.Status
            + "&ViewMode=" + $scope.model.ViewMode;
    }

    function loadDate() {
        var dt = new Date();
        $("#From").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#To').datepicker('setStartDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#To').datepicker('setStartDate', null);
            }
        });
        $("#To").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#From').datepicker('setEndDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#From').datepicker('setEndDate', null);
            }
        });
        $('.end-date').click(function () {
            $('#From').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#To').datepicker('setStartDate', null);
        });
        $('#From').datepicker('setEndDate', dt);
        $('#To').datepicker('setStartDate', dt);
    }

    function loadCalendar(id) {
        $('#' + id).fullCalendar({
            defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: false,
            height: '100%',
            header: {
                left: 'prev,next,today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            dayNames: [caption.STL_COL_DATE_SUNDAY, caption.STL_COL_DATE_MONDAY, caption.STL_COL_DATE_TUESDAY, caption.STL_COL_DATE_WEDNESDAY, caption.STL_COL_DATE_THUSDAY, caption.STL_COL_DATE_FRIDAY, caption.STL_COL_DATE_STATURDAY],
            monthNames: [caption.STL_MONTH_JANUARY + ' - ', caption.STL_MONTH_FEBRUARY + ' - ', caption.STL_MONTH_MARCH + ' - ', caption.STL_MONTH_APRIL + ' - ', caption.STL_MONTH_MAY + ' - ', caption.STL_MONTH_JUNE + ' - ', caption.STL_MONTH_JULY + ' - ', caption.STL_MONTH_AUGUST + ' - ', caption.STL_MONTH_SEPTEMBER + ' - ', caption.STL_MONTH_OCTOBER + ' - ', caption.STL_MONTH_NOVEMBER + ' - ', caption.STL_MONTH_DECEMBER + ' - '],
            monthNamesShort: [caption.STL_MONTH_JAN + ' - ', caption.STL_MONTH_FEB + ' - ', caption.STL_MONTH_MAR + ' - ', caption.STL_MONTH_APR + ' - ', caption.STL_MONTH_MA + ' - ', caption.STL_MONTH_JUN + ' - ', caption.STL_MONTH_JUL + ' - ', caption.STL_MONTH_AUG + ' - ', caption.STL_MONTH_SEPT + ' - ', caption.STL_MONTH_OCT + ' - ', caption.STL_MONTH_NOV + ' - ', caption.STL_MONTH_DEC + ' - '],
            dayNamesShort: [caption.STL_COL_DATE_SUN, caption.STL_COL_DATE_MON, caption.STL_COL_DATE_TUE, caption.STL_COL_DATE_WED, caption.STL_COL_DATE_THUS, caption.STL_COL_DATE_FRI, caption.STL_COL_DATE_SAT],

            buttonText: {
                today: caption.STL_BTN_TODAY,
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                var month = $('#calendar').fullCalendar('getDate').format('MM');
                var year = $('#calendar').fullCalendar('getDate').format('YYYY');
                var toDate = $scope.model.ToDate;
                if ($scope.model.ToDate == '') {
                    toDate = $('#calendar').fullCalendar('getDate').endOf('month').format('DD/MM/YYYY');
                }
                dataserviceStaffLate.getAllTotal($scope.model.UserId, month, year, $scope.model.FromDate, toDate, $scope.model.ViewMode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        //select all member
                        if (rs.Object.All) {
                            var event = [];
                            angular.forEach(rs.Object.ListTotal, function (value, key) {
                                var userLate = {
                                    title: caption.STL_CALENDAR_EVENT_TITLE_SCHEDULE + ": " + value.CountPlanSchedule + "\n" + //STL_LBL_LATE
                                        caption.STL_CALENDAR_EVENT_TITLE_OVERTIME + ": " + value.CountOvertime + "\n" + //STL_LBL_LATE
                                        caption.STL_CALENDAR_EVENT_TITLE_GOLATE + ": " + value.CountLate + "\n" + //STL_LBL_LATE
                                        caption.STL_CALENDAR_EVENT_TITLE_NOTWORK + ": " + value.CountNotWork + "\n" + //STL_LBL_LATE
                                        caption.STL_CALENDAR_EVENT_TITLE_QUITWORK + ": " + value.CountQuitWork, //STL_LBL_LATE
                                    start: value.Date,
                                    className: value.Class,
                                    date: value.Date,
                                    displayEventTime: false,
                                    numLate: value.CountLate,
                                    numQuit: value.CountQuitWork,
                                    numPlan: value.CountPlanSchedule,
                                    numOver: value.CountOvertime,
                                    numOff: value.CountNotWork,
                                }
                                event.push(userLate);
                            })
                            callback(event);
                            if ($scope.model.FromDate != '' || $scope.model.ToDate != '') {
                                gotoDate(rs.Object.ListTotal[rs.Object.ListTotal.length - 1].Date);
                            }
                        }
                    }
                })
            },
            eventClick: function (calEvent) {
                var date = $filter('date')(new Date(calEvent.date), 'dd/MM/yyyy');
                var numLate = calEvent.numLate;
                dataserviceStaffLate.eventCalendar(date, $scope.model.UserId, $scope.model.ViewMode, function (rs) {
                    rs = rs.data;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderStaffLate + '/listUserLate.html',
                        controller: 'listUserLate',
                        backdrop: 'static',
                        size: '50',
                        resolve: {
                            para: function () {
                                return {
                                    listMember: rs,
                                    date: date,
                                    viewMode: $scope.model.ViewMode,
                                }
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {

                    }, function () {
                    });
                })
            },
        });
    }

    function gotoDate(date) {
        if (!$rootScope.isNext) {
            $('#calendar').fullCalendar('gotoDate', date);
        }
    }

    function formatRow(full) {
        var lstAct = JSON.parse(full.ListAct);
        var domActs = ''; /*'<div class="d-flex">';*/
        for (var i = 0; i < lstAct.length; i++) {
            var actName = "";
            if (lstAct[i].IsLock && lstAct[i].ActStatus != "Khóa hoạt động" && lstAct[i].ActStatus != "Không kích hoạt") {
                actName = '<span>' + (lstAct[i].ActName.length > 20 ? lstAct[i].ActName.substr(0, 20) + " ..." : lstAct[i].ActName) + '</span>';
            }
            else {
                actName = lstAct[i].ActName.length > 20 ? lstAct[i].ActName.substr(0, 20) + " ..." : lstAct[i].ActName;
            }
            //if (i % 4 != 0) {
            //    domActs += '<div class="mnh70 col-lg-3 col-md-6 pl-0 pr5 mt5">';
            //}
            //else {
            //    domActs += '<div class="row">'
            //}
            domActs += '<div class="mnh70 col-xl-3 col-lg-4 col-md-6 pr5 mt5">';
            domActs += '<div class="d-flex">';
            domActs += '<div style="display: inline-block; vertical-align:top">';
            if (/*data == "True"*/(lstAct[i].ActType == "Bắt đầu" && lstAct[i].ActStatus == "Kích hoạt") || lstAct[i].ActStatus == "Đã xử lý") {
                domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct[i].ActivityInstCode + '\', \'' + lstAct[i].ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-check-circle" style="--fa-secondary-color:green; --fa-secondary-opacity: 1; --fa-primary-color: white; font-size: 25px;margin-right: 10px;"></i></a>';
            }
            else if (lstAct[i].ActStatus == "Hủy" || lstAct[i].ActStatus == "Dừng lại") {
                domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct[i].ActivityInstCode + '\', \'' + lstAct[i].ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-circle" style="color:orange;font-size: 25px;margin-right: 10px;"></i></a>';
            }
            else if (lstAct[i].ActStatus == "Đang xử lý") {
                domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct[i].ActivityInstCode + '\', \'' + lstAct[i].ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-circle" style="color:green;font-size: 25px;margin-right: 10px;"></i></button>';
            }
            else {
                domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct[i].ActivityInstCode + '\', \'' + lstAct[i].ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-circle" style="color:grey;font-size: 25px;margin-right: 10px;"></i></button>';
            }
            domActs += '</div>';
            domActs += '<div style="display: inline-block; margin-left: 5px; font-weight: 500">';
            if (lstAct[i].ActStatus == "Đã xử lý") {
                domActs += '<a class="actName" title="' + lstAct[i].ActName + '" ng-click1="editInstAct(' + lstAct[i].Id + ',\'' + full.ObjectCode + '\')"><div class="numberStep1" style1="background: #009933;" style="display: inline">(' + (lstAct[i].Level) + ')</div>  ' + actName + '</a>' + '<br /><span class="badge-customer badge-customer-success">' + lstAct[i].ActStatus + '</span>';
            }
            else if (lstAct[i].ActStatus == "Đang xử lý" || lstAct[i].ActStatus == "Chưa xử lý" || lstAct[i].ActStatus == "Kích hoạt") {
                var pending = '';
                if (lstAct[i].ActStatus != "Chưa xử lý") {
                    domActs += '<a class="actName" title="' + lstAct[i].ActName + '" ng-click1="editInstAct(' + lstAct[i].Id + ',\'' + full.ObjectCode + '\')"><div class="numberStep1" style1="background: #FF9900;" style="display: inline">(' + (lstAct[i].Level) + ')</div>  ' + actName + '</a>' + '<br /><span class="badge-customer badge-customer-warning">' + lstAct[i].ActStatus + '</span>' + pending;
                }
                else {
                    domActs += '<a class="actName" title="' + lstAct[i].ActName + '" ng-click1="editInstAct(' + lstAct[i].Id + ',\'' + full.ObjectCode + '\')"><div class="numberStep1" style1="background: #a59f9f;" style="display: inline">(' + (lstAct[i].Level) + ')</div>  ' + actName + '</a>' + '<br /><span class="badge-customer badge-customer-lock">' + lstAct[i].ActStatus + '</span>';
                }
            }
            else if (lstAct[i].ActStatus == "Hủy") {
                domActs += '<a class="actName" title="' + lstAct[i].ActName + '" ng-click1="editInstAct(' + lstAct[i].Id + ',\'' + full.ObjectCode + '\')"><div class="numberStep1" style1="background: red;" style="display: inline">(' + (lstAct[i].Level) + ')</div>' + actName + '</a>' + '<br /><span class="badge-customer badge-customer-danger">' + lstAct[i].ActStatus + '</span>';
            }
            else if (lstAct[i].ActStatus == "Dừng lại") {
                domActs += '<a class="actName" title="' + lstAct[i].ActName + '" ng-click1="editInstAct(' + lstAct[i].Id + ',\'' + full.ObjectCode + '\')"><div class="numberStep1" style1="background: #FF9800;" style="display: inline">(' + (lstAct[i].Level) + ')</div>' + actName + '</a>' + '<br /><span class="badge-customer badge-customer-pause">' + lstAct[i].ActStatus + '</span>';
            }
            else {
                domActs += '<a class="actName" title="' + lstAct[i].ActName + '" ng-click1="editInstAct(' + lstAct[i].Id + ',\'' + full.ObjectCode + '\')"><div class="numberStep1" style1="background: #FF9800;" style="display: inline">(' + (lstAct[i].Level) + ')</div>' + actName + '</a>' + '<br />';
            }
            if (lstAct[i].IsApprovable) {
                domActs += '<img class="blink-act" src="/images/default/green-blink.png" style="width: 17px;height: 17px;margin-top: -5px;" />';
            }
            domActs += '</div>';
            domActs += '</div>';
            if (lstAct[i].ActStatus == "Đã xử lý" && lstAct[i].Log) {
                domActs += '<span class="fs10"><span class="bold fs12">' + lstAct[i].Log.CreatedBy + '</span><br/> [' + lstAct[i].Log.sCreatedTime + ']</span>';
            }
            //if (i % 3 == 0 && i != 0) {
            //    domActs += '</div>';
            //}
            domActs += '</div>';
        }
        //domActs += '</div>';
        return domActs;
    }
    function formatDetail(full) {
        try {
            var log = JSON.parse(full.SLastLog);
            console.log(log.ObjectRelative)
        } catch (e) {
            console.log(e);
            return "";
        }
        //console.log(log);
        var domActs = '<div>'; /*'<div class="d-flex">';*/
        domActs += log.ObjectRelative + ' - ' + log.Name + ' [ ' + log.CreatedBy + ' - ' + log.SCreatedTime + ' ]</div>';
        return domActs;
        //var actName = "";
        //if (lstAct.IsLock && lstAct.ActStatus != "Khóa hoạt động" && lstAct.ActStatus != "Không kích hoạt") {
        //    actName = '<span>' + (lstAct.ActName.length > 50 ? lstAct.ActName.substr(0, 50) + " ..." : lstAct.ActName) + '</span>';
        //}
        //else {
        //    actName = lstAct.ActName.length > 50 ? lstAct.ActName.substr(0, 50) + " ..." : lstAct.ActName;
        //}
        //if (i % 4 != 0) {
        //    domActs += '<div class="mnh70 col-lg-3 col-md-6 pl-0 pr5 mt5">';
        //}
        //else {
        //    domActs += '<div class="row">'
        //}
        //domActs += '<div class="mt5">';
        //domActs += '<div class="d-flex">';
        //domActs += '<div style="display: inline-block; vertical-align:top">';
        //if (/*data == "True"*/(lstAct.ActType == "Bắt đầu" && lstAct.ActStatus == "Kích hoạt") || lstAct.ActStatus == "Đã xử lý") {
        //    domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct.ActivityInstCode + '\', \'' + lstAct.ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-check-circle" style="--fa-secondary-color:green; --fa-secondary-opacity: 1; --fa-primary-color: white; font-size: 25px;margin-right: 10px;"></i></a>';
        //}
        //else if (lstAct.ActStatus == "Hủy" || lstAct.ActStatus == "Dừng lại") {
        //    domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct.ActivityInstCode + '\', \'' + lstAct.ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-circle" style="color:orange;font-size: 25px;margin-right: 10px;"></i></a>';
        //}
        //else if (lstAct.ActStatus == "Đang xử lý") {
        //    domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct.ActivityInstCode + '\', \'' + lstAct.ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-circle" style="color:green;font-size: 25px;margin-right: 10px;"></i></button>';
        //}
        //else {
        //    domActs += '<a title="Xét duyệt" type="button" ng-click="approve(\'' + lstAct.ActivityInstCode + '\', \'' + lstAct.ActStatus + '\')" style1 = "width: 28px; height: 28px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline"><i class="fas fa-circle" style="color:grey;font-size: 25px;margin-right: 10px;"></i></button>';
        //}
        //domActs += '</div>';
        //domActs += '<div style="display: inline-block; margin-left: 5px; font-weight: 500">';
        //if (lstAct.ActStatus == "Đã xử lý") {
        //    domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-success">' + lstAct.ActStatus + '</span>';
        //}
        //else if (lstAct.ActStatus == "Đang xử lý" || lstAct.ActStatus == "Chưa xử lý" || lstAct.ActStatus == "Kích hoạt") {
        //    var pending = '';
        //    if (lstAct.ActStatus != "Chưa xử lý") {
        //        domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-warning">' + lstAct.ActStatus + '</span>' + pending;
        //    }
        //    else {
        //        domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-lock">' + lstAct.ActStatus + '</span>';
        //    }
        //}
        //else if (lstAct.ActStatus == "Hủy") {
        //    domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-danger">' + lstAct.ActStatus + '</span>';
        //}
        //else if (lstAct.ActStatus == "Dừng lại") {
        //    domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '<span class="badge-customer badge-customer-pause">' + lstAct.ActStatus + '</span>';
        //}
        //else {
        //    domActs += '<a class="actName" title="' + lstAct.ActName + '" ng-click1="editInstAct(' + lstAct.Id + ',\'' + full.ObjectCode + '\')">' + actName + '</a>' + '';
        //}
        //if (lstAct.IsApprovable) {
        //    domActs += '<img class="blink-act" src="/images/default/green-blink.png" style="width: 17px;height: 17px;margin-top: -5px;" />';
        //}
        //domActs += '</div>';
        //domActs += '</div>';
        //if (lstAct.ActStatus == "Đã xử lý" && lstAct.Log) {
        //    domActs += '<span class="fs10"><span class="bold fs12">' + lstAct.Log.CreatedBy + '</span><br/> [' + lstAct.Log.sCreatedTime + ']</span>';
        //}
        //if (i % 3 == 0 && i != 0) {
        //    domActs += '</div>';
        //}
        //domActs += '</div>';
        //domActs += '</div>';
        //return domActs;
    }

    setTimeout(function () {
        loadCalendar("calendar");
        $('.fc-prev-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-next-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-today-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-prevYear-button').click(function () {
            $rootScope.isNext = true;
        });
        $('.fc-nextYear-button').click(function () {
            $rootScope.isNext = true;
        });
        loadDate();
    }, 200);
});

app.controller('addStaffLate', function ($scope, $rootScope, $compile, dataserviceStaffLate, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, $translate) {
    $scope.model = {
        Ip: '',
        Address: '',
        UserId: '',
        Action: '',
        ActionTime: '',
        ActionTo: '',
        Note: '',
        Lat: 0,
        Lon: 0,
        LocationText: '',
        Picture: '',
        NotWorkType: '',
        WorkHoliday: false,
        IsException: false,
        WorkflowCode: 'LDNP'
    };

    //wflow
    $rootScope.modelWf = {
        WorkflowCode: "LDNP",
        ObjectType: "NOT_WORK",
        ObjectInst: "",
    };

    $scope.lstActRelative = [];

    $scope.image = "";

    $scope.goLate = true;

    $scope.notWork = false;

    $scope.quitWork = false;

    $scope.planSchedule = false;

    $scope.overtime = false;

    $scope.isLoadWfInst = false;

    $scope.listWorkUser = [];

    $scope.lockUser = false;

    $scope.entities = [
        {
            name: caption.STL_CURD_LBL_LATE,
            checked: true,
            value: 0,
        },
        {
            name: caption.STL_CURD_LBL_NOT_WORK,
            checked: false,
            value: 1,
        },
        {
            name: caption.STL_CJHK_SCHEDULE_PLAN,
            checked: false,
            value: 2,
        },
        {
            name: caption.STL_CHK_OVERTIME,
            checked: false,
            value: 3,
        },
        {
            name: caption.STL_CURD_LBL_LEAVE,
            checked: false,
            value: 4,
        },
    ]

    var vm = $scope;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffLate/GetJtableUserLate/",
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
            },
            complete: function (data) {
                if (data.status === 401) {
                    var url = "/Home/Logout";
                    location.href = url;
                }
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataUserLate");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                    $scope.isLoadWfInst = false;
                    $scope.listStatusLog = []
                } else {
                    $('#tblDataUserLate').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.infoLog = null;
                    $scope.errorNotWorkType = false;
                    if (data.Action == 'GOLATE') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy HH:mm');
                        $scope.entities[0].checked = true;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = false;
                        $scope.entities[3].checked = false;
                        $scope.entities[4].checked = false;
                        $scope.goLate = true;
                        $scope.notWork = false;
                        $scope.quitWork = false;
                        $scope.planSchedule = false;
                        $scope.overtime = false;
                        $scope.model.WorkflowCode = data.WorkflowCode;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'GOLATE';
                        //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        $rootScope.WfInstCode = data.Id;
                        setTimeout(function () {
                            loadDateLate();
                        }, 200);
                    }
                    else if (data.Action == 'NOT_WORK') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy');
                        $scope.model.NotWorkType = data.NotWorkType;
                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = true;
                        $scope.entities[2].checked = false;
                        $scope.entities[3].checked = false;
                        $scope.entities[4].checked = false;
                        $scope.goLate = false;
                        $scope.notWork = true;
                        $scope.quitWork = false;
                        $scope.planSchedule = false;
                        $scope.overtime = false;
                        $scope.model.WorkflowCode = data.WorkflowCode;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'NOT_WORK';
                        //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        $rootScope.WfInstCode = data.Id;
                        dataserviceStaffLate.getLogStatus(data.Id, function (rs) {
                            rs = rs.data;
                            var lstStatus = JSON.parse(rs.Status);
                            if (lstStatus.length > 0) {
                                $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                                $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                                $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                                $scope.listStatusLog = lstStatus;
                            }
                        })

                        setTimeout(function () {
                            loadDateNoWork();
                        }, 200);
                    }
                    else if (data.Action == 'PLAN_SCHEDULE') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy');
                        $scope.model.WorkHoliday = (data.WorkHoliday == "True");
                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = true;
                        $scope.entities[3].checked = false;
                        $scope.entities[4].checked = false;
                        $scope.goLate = false;
                        $scope.notWork = false;
                        $scope.quitWork = false;
                        $scope.planSchedule = true;
                        $scope.overtime = false;
                        $scope.model.WorkflowCode = data.WorkflowCode;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'PLAN_SCHEDULE';
                        //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        $rootScope.WfInstCode = data.Id;
                        setTimeout(function () {
                            loadDatePlanSchedule();
                        }, 200);
                    }
                    else if (data.Action == 'OVERTIME') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy HH:mm');
                        $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy HH:mm');
                        $scope.model.NotWorkType = data.NotWorkType;
                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = false;
                        $scope.entities[3].checked = true;
                        $scope.entities[4].checked = false;
                        $scope.goLate = false;
                        $scope.notWork = false;
                        $scope.quitWork = false;
                        $scope.planSchedule = false;
                        $scope.overtime = true;
                        $scope.model.WorkflowCode = data.WorkflowCode;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'OVERTIME';
                        //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        $rootScope.WfInstCode = data.Id;
                        setTimeout(function () {
                            loadDateOverTime();
                        }, 200);
                    }
                    else if (data.Action == 'QUITWORK') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = false;
                        $scope.entities[3].checked = false;
                        $scope.entities[4].checked = true;
                        $scope.goLate = false;
                        $scope.notWork = false;
                        $scope.quitWork = true;
                        $scope.planSchedule = false;
                        $scope.overtime = false;
                        $scope.model.WorkflowCode = data.WorkflowCode;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'QUITWORK';
                        //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        $rootScope.WfInstCode = data.Id;
                        setTimeout(function () {
                            loadDateQuitWork();
                        }, 200);
                    }
                    $scope.model.Id = data.Id;
                    $scope.model.Note = data.Note;
                    setTimeout(function() {
                        CKEDITOR.instances['staffLateNote'].setData(data.Note);
                    }, 500);
                    $scope.image = data.Picture;
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').notSortable().withOption('sWidth', '30px').withTitle($translate('STL_LIST_COL_STATUS')).renderWith(function (data, type, full) {
        if (full.NotWorkType !== '' && full.NotWorkType !== null && full.NotWorkType !== '')
            data = data + '<br><span class="text-danger">(' + full.NotWorkTypeName + ')<span>';
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').notSortable().withOption('sWidth', '30px').withTitle($translate('STL_LIST_COL_USERID')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').notSortable().withOption('sClass', ' dataTable-pr0').withTitle($translate('STL_LIST_COL_TIME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LocationText').notSortable().withTitle($translate('STL_LIST_COL_PLACE')).renderWith(function (data, type, full) {
        return data
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').notSortable().withTitle($translate('STL_LIST_COL_DESCRIPTION')).renderWith(function (data, type, full) {
        return data
    }));
    vm.reloadData = reloadData;

    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }

    function callback(json) {

    }

    $scope.reload = function () {
        reloadData(false);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.initload = function () {
        // model init
        $scope.model.UserId = userId;
        //if (isAllData == "False" && departmentCode != "PHCNS") {
        //    $scope.lockUser = true;
        //    $scope.model.UserId = userId;
        //}
        initGeolocation();
        dataserviceStaffLate.getListNotWorkType(function (rs) {
            rs = rs.data;
            $scope.listNotWorkType = rs;
        });
        dataserviceStaffLate.getWorkflowNotWork(function (rs) {
            rs = rs.data;
            $scope.lstWorkFlow = rs;
            if (rs != null && rs.length > 0) {
                for (var i = 0; i < $scope.lstWorkFlow.length; i++) {
                    if ($scope.lstWorkFlow[i].Code == "LDNP") {
                        $scope.model.WorkflowCode = "LDNP";
                        setTimeout(function () {
                            $rootScope.loadDiagramWF($scope.model.WorkflowCode);
                        }, 1000);
                        break;
                    }
                }
            }
        })
    }

    $scope.initload();

    // modal close
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
        if (SelectType == "NotWorkType" && $scope.model.NotWorkType != "") {
            $scope.errorNotWorkType = false;
        }
        if (SelectType == "Action" && $scope.model.Action != "") {
            $scope.errorAction = false;
        }
    }

    $scope.selectUser = function (userId) {
        var getUser = $scope.listUser.find(function (element) {
            if (element.Id == userId) return true;
        });
        if (getUser) {
            $scope.GiveName = getUser.GivenName;
        }
        reloadData(true);
    }

    $scope.updateSelection = function (position, entities) {
        angular.forEach(entities, function (subscription, index) {
            if (position != index) {
                subscription.checked = false;
            } else {
                subscription.checked = true;
            }
        });
        var isValied = false;
        $scope.model.IsException = false;
        $scope.errorUserId = false;
        $scope.errorNotWorkType = false;
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                $scope.goLate = true;
                $scope.notWork = false;
                $scope.planSchedule = false;
                $scope.overtime = false;
                $scope.quitWork = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';

                dataserviceStaffLate.suggestWF(function (rs) {
                    rs = rs.data;
                    $scope.suggestWfCode = 'LDNP';
                    $scope.model.WorkflowCode = 'LDNP';
                    $rootScope.loadDiagramWF($scope.model.WorkflowCode);
                })
                setTimeout(function () {
                    loadDateLate();
                }, 500);
                break;
            }
            if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                $scope.goLate = false;
                $scope.notWork = true;
                $scope.planSchedule = false;
                $scope.overtime = false;
                $scope.quitWork = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';

                dataserviceStaffLate.suggestWF(function (rs) {
                    rs = rs.data;
                    $scope.suggestWfCode = 'LDNP';
                    $scope.model.WorkflowCode = 'LDNP';
                    $rootScope.loadDiagramWF($scope.model.WorkflowCode);
                })
                setTimeout(function () {
                    loadDateNoWork();
                }, 500);
                break;
            }
            if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                $scope.goLate = false;
                $scope.notWork = false;
                $scope.planSchedule = true;
                $scope.overtime = false;
                $scope.quitWork = false;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';

                dataserviceStaffLate.suggestWF(function (rs) {
                    rs = rs.data;
                    $scope.suggestWfCode = 'LDNP';
                    $scope.model.WorkflowCode = 'LDNP';
                    $rootScope.loadDiagramWF($scope.model.WorkflowCode);
                })
                isValied = true;
                setTimeout(function () {
                    loadDatePlanSchedule();
                }, 500);
                break;
            }
            if ($scope.entities[i].value == 3 && ($scope.entities[i].checked == true)) {
                $scope.goLate = false;
                $scope.notWork = false;
                $scope.planSchedule = false;
                $scope.overtime = true;
                $scope.quitWork = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';

                dataserviceStaffLate.suggestWF(function (rs) {
                    rs = rs.data;
                    $scope.suggestWfCode = 'LDNP';
                    $scope.model.WorkflowCode = 'LDNP';
                    $rootScope.loadDiagramWF($scope.model.WorkflowCode);
                })

                setTimeout(function () {
                    loadDateOverTime();
                }, 500);
                break;
            }
            if ($scope.entities[i].value == 4 && ($scope.entities[i].checked == true)) {
                $scope.goLate = false;
                $scope.notWork = false;
                $scope.planSchedule = false;
                $scope.overtime = false;
                $scope.quitWork = true;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';

                dataserviceStaffLate.suggestWF(function (rs) {
                    rs = rs.data;
                    $scope.suggestWfCode = 'LDNP';
                    $scope.model.WorkflowCode = 'LDNP';
                    $rootScope.loadDiagramWF($scope.model.WorkflowCode);
                })
                setTimeout(function () {
                    loadDateQuitWork();
                }, 500);
                break;
            }
        }
        if (isValied == false) {
            $scope.entities[0].checked = true;
        }
    }

    $scope.add = function () {
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "GOLATE";
            } else if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "NOT_WORK";
            } else if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "PLAN_SCHEDULE";
            } else if ($scope.entities[i].value == 3 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "OVERTIME";
            } else if ($scope.entities[i].value == 4 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "QUITWORK";
            }
        }
        var check = CKEDITOR.instances['staffLateNote'];
        if (check !== undefined) {
            $scope.model.Note = CKEDITOR.instances['staffLateNote'].getData();
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var formData = new FormData();
            formData.append("Picture", $scope.model.Picture);
            formData.append("UserId", $scope.model.UserId);
            formData.append("Action", $scope.model.Action);
            formData.append("ActionTime", $scope.model.ActionTime);
            formData.append("ActionTo", $scope.model.ActionTo);
            formData.append("NotWorkType", $scope.model.NotWorkType);
            formData.append("WorkHoliday", $scope.model.WorkHoliday);
            formData.append("IsException", $scope.model.IsException);
            formData.append("LocationText", $scope.model.LocationText);
            formData.append("Lat", $scope.model.Lat);
            formData.append("Lon", $scope.model.Lon);
            formData.append("Ip", $scope.model.Ip);
            formData.append("Note", $scope.model.Note);
            formData.append("WorkflowCode", $scope.model.WorkflowCode)
            dataserviceStaffLate.add(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $rootScope.reloadIndex();
                    if (rs.Object != null) {
                        $rootScope.loadDiagramWfInst(rs.Object.Id, $rootScope.modelWf.ObjectType);
                        if (rs.Object.IsSuperior && rs.Object.NextActInstCode != null && rs.Object.NextActInstCode != '' && rs.Object.NextActInstCode != undefined) {
                            $rootScope.approve(rs.Object.NextActInstCode, "Đang xử lý");
                        }
                        //dataserviceStaffLate.getLogStatus(rs.Object, function (rs) {
                        //    rs = rs.data;
                        //    var lstStatus = JSON.parse(rs.Status);
                        //    if (lstStatus.length > 0) {
                        //        $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                        //        $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                        //        $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                        //        $scope.listStatusLog = lstStatus;
                        //    }
                        //})
                    }
                }
            })
        }
    }

    $scope.update = function () {
        if ($scope.model.Id == '') {
            App.toastrError(caption.COM_MSG_UNSELECTED_RECORD);
        } else {
            for (var i = 0; i < $scope.entities.length; i++) {
                if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "GOLATE";
                }
                else if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "NOT_WORK";
                }
                else if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "PLAN_SCHEDULE";
                }
                else if ($scope.entities[i].value == 3 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "OVERTIME";
                }
                else if ($scope.entities[i].value == 4 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "QUITWORK";
                }
            }
            var check = CKEDITOR.instances['staffLateNote'];
            if (check !== undefined) {
                $scope.model.Note = CKEDITOR.instances['staffLateNote'].getData();
            }
            validationSelect($scope.model);
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                var formData = new FormData();
                formData.append("Picture", $scope.model.Picture);
                formData.append("Id", $scope.model.Id);
                formData.append("UserId", $scope.model.UserId);
                formData.append("Action", $scope.model.Action);
                formData.append("ActionTime", $scope.model.ActionTime);
                formData.append("ActionTo", $scope.model.ActionTo);
                formData.append("NotWorkType", $scope.model.NotWorkType);
                formData.append("WorkHoliday", $scope.model.WorkHoliday);
                formData.append("IsException", $scope.model.IsException);
                formData.append("Note", $scope.model.Note);
                dataserviceStaffLate.update(formData, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $rootScope.reloadIndex();
                        resetInput();
                    }
                });
            }
        }
    }

    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
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
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.STL_CURD_VALIDATE_IMG_FORMAT);
                return;
            } else {
                $scope.model.Picture = files[0];
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.addCommonSettingNotWork = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderStaffLate + "/detail.html",
            controller: 'detail-status',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'EMPLOYEE_GROUP_NOTWORK',
                        GroupNote: 'Loại báo nghỉ',
                        AssetCode: 'EMPLOYEE_GROUP_NOTWORK'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceStaffLate.getListNotWorkType(function (rs) {
                rs = rs.data;
                $scope.listNotWorkType = rs;
            });
        }, function () { });
    }

    //Workflow 
    $scope.editInstAct = function (id, objCode) {
        dataserviceStaffLate.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceStaffLate.getItemActInst(id, function (rs) {
                $rootScope.IsLock = rs.data.IsLock;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/add-activity-instance.html',
                    controller: 'edit-activity-instance',
                    backdrop: 'static',
                    keyboard: false,
                    size: '50',
                    resolve: {
                        para: function () {
                            return {
                                Data: rs.data,
                                ObjCode: objCode
                            }
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    dataserviceStaffLate.getLogStatus(objCode, function (rs) {
                        rs = rs.data;
                        var lstStatus = JSON.parse(rs.Status);
                        if (lstStatus.length > 0) {
                            $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                            $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                            $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                            $scope.listStatusLog = lstStatus;
                        }
                    })
                    $rootScope.loadDiagramWfInst($rootScope.WfInstCode, $rootScope.modelWf.ObjectType);
                }, function () {
                });
            })
        })
    }

    //End workflow

    // Date limit unbound - bound
    $scope.checkException = function () {
        if ($scope.model.IsException == false) {
            $scope.model.ActionTime = '';
            $scope.model.ActionTo = '';
        }
    }
    $scope.changeDate = function (value, type) {
        var correctValue = moment(value, "DD/MM/YYYY");
        if (correctValue.get('year') >= 2000) {
            if (type == "ActionTime") {
                $scope.model.ActionTime = correctValue.format("DD/MM/YYYY");
            }
            else {
                $scope.model.ActionTo = correctValue.format("DD/MM/YYYY");
            }
        }
        else {
            if (type == "ActionTime") {
                $scope.model.ActionTime = "";
            }
            else {
                $scope.model.ActionTo = "";
            }
        }
    }
    $scope.changeDateTime = function (value, type) {
        var correctValue = moment(value, "DD/MM/YYYY HH:mm");
        if (correctValue.get('year') >= 2000) {
            if (type == "ActionTime") {
                $scope.model.ActionTime = correctValue.format("DD/MM/YYYY HH:mm");
            }
            else {
                $scope.model.ActionTo = correctValue.format("DD/MM/YYYY HH:mm");
            }
        }
        else {
            if (type == "ActionTime") {
                $scope.model.ActionTime = "";
            }
            else {
                $scope.model.ActionTo = "";
            }
        }
    }

    function loadDateNoWork() {
        //$("#FromTo").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#DateTo').datepicker('setStartDate', maxDate);
        //    if ($('#FromTo').valid()) {
        //        $('#FromTo').removeClass('invalid').addClass('success');
        //    }

        //    if ($scope.model.ActionTime != '' && $scope.model.ActionTo != '') {
        //        dataserviceStaffLate.checkDate($scope.model.ActionTime, $scope.model.ActionTo, function (rs) {
        //            rs = rs.data;
        //            $scope.isNotice = rs.IsNotice;
        //            $scope.noticeDate = rs.NoticeDate;
        //        })
        //    }
        //});
        //$("#DateTo").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#FromTo').datepicker('setEndDate', maxDate);
        //    if ($('#DateTo').valid()) {
        //        $('#DateTo').removeClass('invalid').addClass('success');
        //    }
        //    if ($scope.model.ActionTime != '' && $scope.model.ActionTo != '') {
        //        dataserviceStaffLate.checkDate($scope.model.ActionTime, $scope.model.ActionTo, function (rs) {
        //            rs = rs.data;
        //            $scope.isNotice = rs.IsNotice;
        //            $scope.noticeDate = rs.NoticeDate;
        //        })
        //    }
        //});
    }

    function loadDateLate() {
        //$("#ActionTime").datetimepicker({
        //    startDate: new Date(),
        //    useCurrent: false,
        //    autoclose: true,
        //    keepOpen: false,
        //    format: 'dd/mm/yyyy hh:ii',
        //}).on('changeDate', function () {
        //    if ($('#ActionTime').valid()) {
        //        $('#ActionTime').removeClass('invalid').addClass('success');
        //    }
        //});
    };

    function loadDateQuitWork() {
        //$("#ActionDate").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function () {
        //    if ($('#ActionDate').valid()) {
        //        $('#ActionDate').removeClass('invalid').addClass('success');
        //    }
        //});
    };

    function loadDatePlanSchedule() {
        //$("#FromToPlan").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#DateToPlan').datepicker('setStartDate', maxDate);
        //    if ($('#FromToPlan').valid()) {
        //        $('#FromToPlan').removeClass('invalid').addClass('success');
        //    }
        //});
        //$("#DateToPlan").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#FromToPlan').datepicker('setEndDate', maxDate);
        //    if ($('#DateToPlan').valid()) {
        //        $('#DateToPlan').removeClass('invalid').addClass('success');
        //    }
        //});

        //$('.end-date').click(function () {
        //    $('#DateToPlan').datepicker('setEndDate', null);
        //});
        //$('.start-date').click(function () {
        //    $('#DateToPlan').datepicker('setStartDate', null);
        //});
    }

    function loadDateOverTime() {
        //$("#FromToOverTime").datetimepicker({
        //    inline: false,
        //    autoclose: true,
        //    startDate: new Date(),
        //    format: "dd/mm/yyyy hh:ii",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#DateToOverTime').datetimepicker('setStartDate', maxDate);
        //    if ($('#FromToOverTime').valid()) {
        //        $('#FromToOverTime').removeClass('invalid').addClass('success');
        //    }
        //});

        //$("#DateToOverTime").datetimepicker({
        //    inline: false,
        //    autoclose: true,
        //    startDate: new Date(),
        //    format: "dd/mm/yyyy hh:ii",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#FromToOverTime').datetimepicker('setEndDate', maxDate);
        //    if ($('#DateToOverTime').valid()) {
        //        $('#DateToOverTime').removeClass('invalid').addClass('success');
        //    }
        //});
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null user
        if (data.UserId == "" || data.UserId == null || data.UserId == undefined) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        if ($scope.model.Action == "NOT_WORK") {
            if (data.NotWorkType == "" || data.NotWorkType == null || data.NotWorkType == undefined) {
                $scope.errorNotWorkType = true;
                mess.Status = true;
            } else {
                $scope.errorNotWorkType = false;
            }
        }

        ////Check null status
        //if (data.Action == "") {
        //    $scope.errorAction = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorAction = false;
        //}
        return mess;
    };

    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, fail);
        }
        else {
            alert("Sorry, your browser does not support geolocation services.");
        }
    }

    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&', { lat: lat, lon: lon }, function (data) {
            $scope.model.LocationText = data.display_name;
            $scope.model.Lat = lat;
            $scope.model.Lon = lon;
            $scope.$apply();
        });
        $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
            $scope.model.Ip = data.ip;
        });
    }

    function fail() {

    }

    function resetInput() {
        $scope.model.Id = '';
        $scope.model.ActionTime = '';
        $scope.model.Note = '';
        CKEDITOR.instances['ckEditorItem'].setData('');
        $scope.model.Picture = '';
        $scope.entities[0].checked = true;
        $scope.entities[1].checked = false;
        $scope.entities[2].checked = false;
        $scope.entities[3].checked = false;
        $scope.entities[4].checked = false;
        $scope.goLate = true;
        $scope.notWork = false;
        $scope.quitWork = false;
        $scope.planSchedule = false;
        $scope.overtime = false;
        setTimeout(function () {
            $scope.updateSelection();
            loadDateLate();
        }, 200);
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('staffLateNote', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['staffLateNote'].config.height = 90;
    }

    setTimeout(function () {
        ckEditer();
        $scope.updateSelection();
        setModalDraggable('.modal-dialog');
        loadDateLate();
    }, 200);
});

app.controller('editStaffLate', function ($scope, $rootScope, $compile, dataserviceStaffLate, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, $translate, para, $location) {
    //var para = myService.getData();
    if (para == undefined) {
        var id = $location.search().id;
        var userId = $location.search().userId;
        para = { UserId: userId, Id: id };
        if (para == undefined)
            return location.href = "/Admin/StaffLate";
    }
    $scope.model = {
        Ip: '',
        Address: '',
        UserId: para.UserId,
        Action: '',
        ActionTime: '',
        ActionTo: '',
        Note: '',
        Lat: '',
        Lon: '',
        LocationText: '',
        Picture: '',
        NotWorkType: '',
        WorkHoliday: false,
        IsException: false,
    };

    $rootScope.modelWf = {
        WorkflowCode: "",
        ObjectType: "NOT_WORK",
        ObjectInst: "",
    };
    $scope.isLoadWfInst = true;

    $scope.image = "";
    $scope.goLate = true;
    $scope.notWork = false;
    $scope.quitWork = false;
    $scope.listWorkUser = [];
    $scope.entities = [
        {
            name: caption.STL_CURD_LBL_LATE,
            checked: true,
            value: 0,
        },
        {
            name: caption.STL_CURD_LBL_NOT_WORK,
            checked: false,
            value: 1,
        },
        {
            name: caption.STL_CJHK_SCHEDULE_PLAN,
            checked: false,
            value: 2,
        },
        {
            name: caption.STL_CHK_OVERTIME,
            checked: false,
            value: 3,
        },
        {
            name: caption.STL_CURD_LBL_LEAVE,
            checked: false,
            value: 4,
        },
    ]
    var vm = $scope;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffLate/GetJtableUserLate/",
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
            },
            complete: function (data) {
                if (data.status === 401) {
                    var url = "/Home/Logout";
                    location.href = url;
                }
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataUserLate");
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
            if (data.Id == para.Id) {
                angular.element(row).addClass('selected');
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                $scope.errorNotWorkType = false;
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                    $scope.isLoadWfInst = false;
                    $scope.listStatusLog = []
                } else {
                    $('#tblDataUserLate').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    if (data.Action == 'GOLATE') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy HH:mm');
                        $scope.entities[0].checked = true;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = false;
                        $scope.entities[3].checked = false;
                        $scope.entities[4].checked = false;
                        $scope.goLate = true;
                        $scope.notWork = false;
                        $scope.planSchedule = false;
                        $scope.overtime = false;
                        $scope.quitWork = false;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'GOLATE';
                        setTimeout(function () {
                            //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        }, 1000)
                        setTimeout(function () {
                            loadDateLate();
                        }, 200);
                    }
                    else if (data.Action == 'NOT_WORK') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy');
                        $scope.model.NotWorkType = data.NotWorkType;
                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = true;
                        $scope.entities[2].checked = false;
                        $scope.entities[3].checked = false;
                        $scope.entities[4].checked = false;
                        $scope.goLate = false;
                        $scope.notWork = true;
                        $scope.planSchedule = false;
                        $scope.overtime = false;
                        $scope.quitWork = false;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'NOT_WORK';
                        setTimeout(function () {
                            //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        }, 1000)
                        setTimeout(function () {
                            loadDateNoWork();
                        }, 200);
                    }
                    else if (data.Action == 'PLAN_SCHEDULE') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy');
                        $scope.model.WorkHoliday = (data.WorkHoliday == "True");

                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = true;
                        $scope.entities[3].checked = false;
                        $scope.entities[4].checked = false;
                        $scope.goLate = false;
                        $scope.notWork = false;
                        $scope.planSchedule = true;
                        $scope.overtime = false;
                        $scope.quitWork = false;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'PLAN_SCHEDULE';
                        setTimeout(function () {
                            //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        }, 1000)
                        setTimeout(function () {
                            loadDatePlanSchedule();
                        }, 200);
                    }
                    else if (data.Action == 'OVERTIME') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy HH:mm');
                        $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy HH:mm');

                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = false;
                        $scope.entities[3].checked = true;
                        $scope.entities[4].checked = false;
                        $scope.goLate = false;
                        $scope.notWork = false;
                        $scope.planSchedule = false;
                        $scope.overtime = true;
                        $scope.quitWork = false;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'OVERTIME';
                        setTimeout(function () {
                            //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        }, 1000)
                        dataserviceStaffLate.getLogStatus(data.Id, function (rs) {
                            rs = rs.data;
                            var lstStatus = JSON.parse(rs.Status);
                            if (lstStatus != null && lstStatus != undefined && lstStatus.length > 0) {
                                $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                                $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                                $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                                $scope.listStatusLog = lstStatus;
                            }
                        })
                        setTimeout(function () {
                            loadDateOverTime();
                        }, 200);
                    }
                    else if (data.Action == 'QUITWORK') {
                        $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                        $scope.entities[0].checked = false;
                        $scope.entities[1].checked = false;
                        $scope.entities[2].checked = false;
                        $scope.entities[3].checked = false;
                        $scope.entities[4].checked = true;
                        $scope.goLate = false;
                        $scope.notWork = false;
                        $scope.planSchedule = false;
                        $scope.overtime = false;
                        $scope.quitWork = true;
                        $scope.isLoadWfInst = true;
                        $rootScope.modelWf.ObjectType = 'QUITWORK';
                        setTimeout(function () {
                            //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                        }, 1000)
                        setTimeout(function () {
                            loadDateQuitWork();
                        }, 200);
                    }
                    $scope.model.Id = data.Id;
                    $scope.model.Note = data.Note;
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').notSortable().withOption('sWidth', '30px').withTitle($translate('STL_LIST_COL_STATUS')).renderWith(function (data, type, full) {
        if (full.NotWorkType !== '' && full.NotWorkType !== null && full.NotWorkType !== '')
            data = data + '<br><span class="text-danger">(' + full.NotWorkTypeName + ')<span>';
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').notSortable().withOption('sWidth', '30px').withTitle($translate('STL_LIST_COL_USERID')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').notSortable().withOption('sClass', ' dataTable-pr0').withTitle($translate('STL_LIST_COL_TIME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LocationText').notSortable().withTitle($translate('STL_LIST_COL_PLACE')).renderWith(function (data, type, full) {
        return data
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').notSortable().withTitle($translate('STL_LIST_COL_DESCRIPTION')).renderWith(function (data, type, full) {
        return data
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }

    $scope.reload = function () {
        reloadData(false);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.initload = function () {
        var data = para;
        console.log(data);
        if (data.Id == para.Id) {
            if (data.Action == 'GOLATE') {
                $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy HH:mm');
                $scope.entities[0].checked = true;
                $scope.entities[1].checked = false;
                $scope.entities[2].checked = false;
                $scope.entities[3].checked = false;
                $scope.entities[4].checked = false;
                $scope.goLate = true;
                $scope.notWork = false;
                $scope.planSchedule = false;
                $scope.overtime = false;
                $scope.quitWork = false;
                $scope.isLoadWfInst = true;
                $rootScope.modelWf.ObjectType = 'GOLATE';
                $scope.model.WorkflowCode = data.WorkflowCode;
                setTimeout(function () {
                    //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                }, 1000)
                setTimeout(function () {
                    loadDateLate();
                }, 200);
            }
            else if (data.Action == 'NOT_WORK') {
                $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy');
                $scope.model.NotWorkType = data.NotWorkType;
                $scope.entities[0].checked = false;
                $scope.entities[1].checked = true;
                $scope.entities[2].checked = false;
                $scope.entities[3].checked = false;
                $scope.entities[4].checked = false;
                $scope.goLate = false;
                $scope.notWork = true;
                $scope.planSchedule = false;
                $scope.overtime = false;
                $scope.quitWork = false;
                $scope.isLoadWfInst = true;
                $rootScope.modelWf.ObjectType = 'NOT_WORK';
                $scope.model.WorkflowCode = data.WorkflowCode;

                dataserviceStaffLate.getLogStatus(data.Id, function (rs) {
                    rs = rs.data;
                    var lstStatus = JSON.parse(rs.Status);
                    if (lstStatus.length > 0) {
                        $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                        $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                        $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                        $scope.listStatusLog = lstStatus;
                    }
                })
                setTimeout(function () {
                    //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                }, 1000)

                setTimeout(function () {
                    loadDateNoWork();
                }, 200);
            }
            else if (data.Action == 'PLAN_SCHEDULE') {
                $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy');
                $scope.model.WorkHoliday = (data.WorkHoliday == "True");

                $scope.entities[0].checked = false;
                $scope.entities[1].checked = false;
                $scope.entities[2].checked = true;
                $scope.entities[3].checked = false;
                $scope.entities[4].checked = false;
                $scope.goLate = false;
                $scope.notWork = false;
                $scope.planSchedule = true;
                $scope.overtime = false;
                $scope.quitWork = false;
                $scope.isLoadWfInst = true;
                $rootScope.modelWf.ObjectType = 'PLAN_SCHEDULE';
                $scope.model.WorkflowCode = data.WorkflowCode;
                setTimeout(function () {
                    //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                }, 1000)
                setTimeout(function () {
                    loadDatePlanSchedule();
                }, 200);
            }
            else if (data.Action == 'OVERTIME') {
                $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy HH:mm');
                $scope.model.ActionTo = $filter('date')(new Date(data.ActionTo), 'dd/MM/yyyy HH:mm');

                $scope.entities[0].checked = false;
                $scope.entities[1].checked = false;
                $scope.entities[2].checked = false;
                $scope.entities[3].checked = true;
                $scope.entities[4].checked = false;
                $scope.goLate = false;
                $scope.notWork = false;
                $scope.planSchedule = false;
                $scope.overtime = true;
                $scope.quitWork = false;
                $scope.isLoadWfInst = true;
                $rootScope.modelWf.ObjectType = 'OVERTIME';
                $scope.model.WorkflowCode = data.WorkflowCode;
                setTimeout(function () {
                    //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                }, 1000)
                setTimeout(function () {
                    loadDateOverTime();
                }, 200);
            }
            else if (data.Action == 'QUITWORK') {
                $scope.model.ActionTime = $filter('date')(new Date(data.ActionTime), 'dd/MM/yyyy');
                $scope.entities[0].checked = false;
                $scope.entities[1].checked = false;
                $scope.entities[2].checked = false;
                $scope.entities[3].checked = false;
                $scope.entities[4].checked = true;
                $scope.goLate = false;
                $scope.notWork = false;
                $scope.planSchedule = false;
                $scope.overtime = false;
                $scope.quitWork = true;
                $scope.isLoadWfInst = true;
                $rootScope.modelWf.ObjectType = 'QUITWORK';
                $scope.model.WorkflowCode = data.WorkflowCode;
                setTimeout(function () {
                    //$rootScope.loadDiagramWfInst(data.Id, $rootScope.modelWf.ObjectType);
                }, 1000)
                setTimeout(function () {
                    loadDateQuitWork();
                }, 200);
            }
            $scope.model.Id = data.Id;
            $scope.model.Note = data.Note;
            setTimeout(function () {
                CKEDITOR.instances['staffLateNote'].setData(data.Note);
            }, 500);
            $scope.image = data.Picture;
        }
        initGeolocation();
        dataserviceStaffLate.getListNotWorkType(function (rs) {
            rs = rs.data;
            $scope.listNotWorkType = rs;
        });
        dataserviceStaffLate.getWorkflowNotWork(function (rs) {
            rs = rs.data;
            $scope.lstWorkFlow = rs;

            if (rs != null && rs.length > 0) {
                $scope.model.WorkflowCode = rs[0].Code;
            }
        })
    }
    $scope.initload();

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
        if (SelectType == "NotWorkType" && $scope.model.NotWorkType != "") {
            $scope.errorNotWorkType = false;
        }
        if (SelectType == "Action" && $scope.model.Action != "") {
            $scope.errorAction = false;
        }
    }
    $scope.selectUser = function (userId) {
        var getUser = $scope.listUser.find(function (element) {
            if (element.Id == userId) return true;
        });
        if (getUser) {
            $scope.GiveName = getUser.GivenName;
        }
        reloadData(true);
    }
    $scope.updateSelection = function (position, entities) {
        angular.forEach(entities, function (subscription, index) {
            if (position != index) {
                subscription.checked = false;
            } else {
                subscription.checked = true;
            }
        });
        $scope.errorNotWorkType = false;
        var isValied = false;
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                $scope.goLate = true;
                $scope.notWork = false;
                $scope.planSchedule = false;
                $scope.overtime = false;
                $scope.quitWork = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                setTimeout(function () {
                    loadDateLate();
                }, 500);
                break;
            }
            if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                $scope.goLate = false;
                $scope.notWork = true;
                $scope.planSchedule = false;
                $scope.overtime = false;
                $scope.quitWork = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                setTimeout(function () {
                    loadDateNoWork();
                }, 500);
                break;
            }
            if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                $scope.goLate = false;
                $scope.notWork = false;
                $scope.planSchedule = true;
                $scope.overtime = false;
                $scope.quitWork = false;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                isValied = true;
                setTimeout(function () {
                    loadDatePlanSchedule();
                }, 200);
                break;
            }
            if ($scope.entities[i].value == 3 && ($scope.entities[i].checked == true)) {
                $scope.goLate = false;
                $scope.notWork = false;
                $scope.planSchedule = false;
                $scope.overtime = true;
                $scope.quitWork = false;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                setTimeout(function () {
                    loadDateOverTime();
                }, 200);
                break;
            }
            if ($scope.entities[i].value == 4 && ($scope.entities[i].checked == true)) {
                $scope.goLate = false;
                $scope.notWork = false;
                $scope.planSchedule = false;
                $scope.overtime = false;
                $scope.quitWork = true;
                isValied = true;
                $scope.model.ActionTime = '';
                $scope.model.ActionTo = '';
                setTimeout(function () {
                    loadDateQuitWork();
                }, 200);
                break;
            }
        }
        if (isValied == false) {
            $scope.entities[0].checked = true;
        }
    }

    $scope.add = function () {
        for (var i = 0; i < $scope.entities.length; i++) {
            if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "GOLATE";
            }
            else if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "NOT_WORK";
            }
            else if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "PLAN_SCHEDULE";
            }
            else if ($scope.entities[i].value == 3 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "OVERTIME";
            }
            else if ($scope.entities[i].value == 4 && ($scope.entities[i].checked == true)) {
                $scope.model.Action = "QUITWORK";
            }
        }
        var check = CKEDITOR.instances['staffLateNote'];
        if (check !== undefined) {
            $scope.model.Note = CKEDITOR.instances['staffLateNote'].getData();
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var formData = new FormData();
            formData.append("Picture", $scope.model.Picture);
            formData.append("UserId", $scope.model.UserId);
            formData.append("Action", $scope.model.Action);
            formData.append("ActionTime", $scope.model.ActionTime);
            formData.append("ActionTo", $scope.model.ActionTo);
            formData.append("NotWorkType", $scope.model.NotWorkType);
            formData.append("WorkHoliday", $scope.model.WorkHoliday);
            formData.append("IsException", $scope.model.IsException);
            formData.append("LocationText", $scope.model.LocationText);
            formData.append("Lat", $scope.model.Lat);
            formData.append("Lon", $scope.model.Lon);
            formData.append("Ip", $scope.model.Ip);
            formData.append("Note", $scope.model.Note)
            dataserviceStaffLate.add(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $rootScope.reloadIndex();
                    if (rs.Object != null) {
                        if (rs.Object.IsSuperior && rs.Object.NextActInstCode != null && rs.Object.NextActInstCode != '' && rs.Object.NextActInstCode != undefined) {
                            $rootScope.approve(rs.Object.NextActInstCode, "Đang xử lý");
                        }
                    }
                }
            })
        }
    }
    $scope.update = function () {
        if ($scope.model.Id == '') {
            App.toastrError(caption.COM_MSG_UNSELECTED_RECORD);
        } else {
            for (var i = 0; i < $scope.entities.length; i++) {
                if ($scope.entities[i].value == 0 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "GOLATE";
                }
                else if ($scope.entities[i].value == 1 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "NOT_WORK";
                }
                else if ($scope.entities[i].value == 2 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "PLAN_SCHEDULE";
                }
                else if ($scope.entities[i].value == 3 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "OVERTIME";
                }
                else if ($scope.entities[i].value == 4 && ($scope.entities[i].checked == true)) {
                    $scope.model.Action = "QUITWORK";
                }
            }
            var check = CKEDITOR.instances['staffLateNote'];
            if (check !== undefined) {
                $scope.model.Note = CKEDITOR.instances['staffLateNote'].getData();
            }
            validationSelect($scope.model);
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                var formData = new FormData();
                formData.append("Picture", $scope.model.Picture);
                formData.append("Id", $scope.model.Id);
                formData.append("UserId", $scope.model.UserId);
                formData.append("Action", $scope.model.Action);
                formData.append("ActionTime", $scope.model.ActionTime);
                formData.append("ActionTo", $scope.model.ActionTo);
                formData.append("NotWorkType", $scope.model.NotWorkType);
                formData.append("WorkHoliday", $scope.model.WorkHoliday);
                formData.append("IsException", $scope.model.IsException);
                formData.append("Note", $scope.model.Note);
                dataserviceStaffLate.update(formData, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $rootScope.reloadIndex();
                        resetInput();
                    }
                })
            }
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
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
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.STL_CURD_VALIDATE_IMG_FORMAT);
                return;
            } else {
                $scope.model.Picture = files[0];
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.addCommonSettingNotWork = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderStaffLate + "/detail.html",
            controller: 'detail-status',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'EMPLOYEE_GROUP_NOTWORK',
                        GroupNote: 'Loại báo nghỉ',
                        AssetCode: 'EMPLOYEE_GROUP_NOTWORK'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceStaffLate.getListNotWorkType(function (rs) {
                rs = rs.data;
                $scope.listNotWorkType = rs;
            });
        }, function () { });
    }

    //Workflow 
    $scope.editInstAct = function (id, objCode) {
        dataserviceStaffLate.checkPermissionEditActivityById(id, function (rs) {
            rs = rs.data;
            if (!rs) {
                return App.toastrError(caption.COM_MSG_PERMISSION_EDIT_ACT);
            }
            dataserviceStaffLate.getItemActInst(id, function (rs) {
                $rootScope.IsLock = rs.data.IsLock;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/add-activity-instance.html',
                    controller: 'edit-activity-instance',
                    backdrop: 'static',
                    keyboard: false,
                    size: '50',
                    resolve: {
                        para: function () {
                            return {
                                Data: rs.data,
                                ObjCode: objCode
                            }
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    dataserviceStaffLate.getLogStatus(objCode, function (rs) {
                        rs = rs.data;
                        var lstStatus = JSON.parse(rs.Status);
                        if (lstStatus.length > 0) {
                            $scope.model.Status = lstStatus[lstStatus.length - 1].Code;
                            $scope.model.StatusDefault = lstStatus[lstStatus.length - 1].Code;
                            $scope.model.StatusTemp = lstStatus[lstStatus.length - 1].Code;
                            $scope.listStatusLog = lstStatus;
                        }
                    })
                    $rootScope.loadDiagramWfInst(objCode, $rootScope.modelWf.ObjectType);
                }, function () {
                });
            })
        })
    }

    // Date limit unbound - bound
    $scope.checkException = function () {
        if ($scope.model.IsException == false) {
            $scope.model.ActionTime = '';
            $scope.model.ActionTo = '';
        }
    }

    //End workflow

    $scope.changeDate = function (value, type) {
        var correctValue = moment(value, "DD/MM/YYYY");
        if (correctValue.get('year') >= 2000) {
            if (type == "ActionTime") {
                $scope.model.ActionTime = correctValue.format("DD/MM/YYYY");
            }
            else {
                $scope.model.ActionTo = correctValue.format("DD/MM/YYYY");
            }
        }
        else {
            if (type == "ActionTime") {
                $scope.model.ActionTime = "";
            }
            else {
                $scope.model.ActionTo = "";
            }
        }
    }
    $scope.changeDateTime = function (value, type) {
        var correctValue = moment(value, "DD/MM/YYYY HH:mm");
        if (correctValue.get('year') >= 2000) {
            if (type == "ActionTime") {
                $scope.model.ActionTime = correctValue.format("DD/MM/YYYY HH:mm");
            }
            else {
                $scope.model.ActionTo = correctValue.format("DD/MM/YYYY HH:mm");
            }
        }
        else {
            if (type == "ActionTime") {
                $scope.model.ActionTime = "";
            }
            else {
                $scope.model.ActionTo = "";
            }
        }
    }
    function loadDateNoWork() {
        //$("#FromTo").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#DateTo').datepicker('setStartDate', maxDate);
        //    if ($('#FromTo').valid()) {
        //        $('#FromTo').removeClass('invalid').addClass('success');
        //    }

        //    if ($scope.model.ActionTime != '' && $scope.model.ActionTo != '') {
        //        dataserviceStaffLate.checkDate($scope.model.ActionTime, $scope.model.ActionTo, function (rs) {
        //            rs = rs.data;
        //            $scope.isNotice = rs.IsNotice;
        //            $scope.noticeDate = rs.NoticeDate;
        //        })
        //    }
        //});
        //$("#DateTo").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#FromTo').datepicker('setEndDate', maxDate);
        //    if ($('#DateTo').valid()) {
        //        $('#DateTo').removeClass('invalid').addClass('success');
        //    }
        //    if ($scope.model.ActionTime != '' && $scope.model.ActionTo != '') {
        //        dataserviceStaffLate.checkDate($scope.model.ActionTime, $scope.model.ActionTo, function (rs) {
        //            rs = rs.data;
        //            $scope.isNotice = rs.IsNotice;
        //            $scope.noticeDate = rs.NoticeDate;
        //        })
        //    }
        //});
    }
    function loadDateLate() {
        //$("#ActionTime").datetimepicker({
        //    startDate: new Date(),
        //    useCurrent: false,
        //    autoclose: true,
        //    keepOpen: false,
        //    format: 'dd/mm/yyyy hh:ii',
        //}).on('changeDate', function () {
        //    if ($('#ActionTime').valid()) {
        //        $('#ActionTime').removeClass('invalid').addClass('success');
        //    }
        //});
    }
    function loadDateQuitWork() {
        //$("#ActionDate").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //});
    }
    function loadDatePlanSchedule() {
        //$("#FromToPlan").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#DateToPlan').datepicker('setStartDate', maxDate);
        //    if ($('#FromToPlan').valid()) {
        //        $('#FromToPlan').removeClass('invalid').addClass('success');
        //    }
        //});
        //$("#DateToPlan").datepicker({
        //    inline: false,
        //    startDate: new Date(),
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#FromToPlan').datepicker('setEndDate', maxDate);
        //    if ($('#DateToPlan').valid()) {
        //        $('#DateToPlan').removeClass('invalid').addClass('success');
        //    }
        //});

        //$('.end-date').click(function () {
        //    $('#DateToPlan').datepicker('setEndDate', null);
        //});
        //$('.start-date').click(function () {
        //    $('#DateToPlan').datepicker('setStartDate', null);
        //});
    }
    function loadDateOverTime() {
        //$("#FromToOverTime").datetimepicker({
        //    inline: false,
        //    autoclose: true,
        //    startDate: new Date(),
        //    format: "dd/mm/yyyy hh:ii",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#DateToOverTime').datetimepicker('setStartDate', maxDate);
        //    if ($('#FromToOverTime').valid()) {
        //        $('#FromToOverTime').removeClass('invalid').addClass('success');
        //    }
        //});

        //$("#DateToOverTime").datetimepicker({
        //    inline: false,
        //    autoclose: true,
        //    startDate: new Date(),
        //    format: "dd/mm/yyyy hh:ii",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    var maxDate = new Date(selected.date.valueOf());
        //    $('#FromToOverTime').datetimepicker('setEndDate', maxDate);
        //    if ($('#DateToOverTime').valid()) {
        //        $('#DateToOverTime').removeClass('invalid').addClass('success');
        //    }
        //});
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null user
        if (data.UserId == "" || data.UserId == null || data.UserId == undefined) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        if ($scope.model.Action == "NOT_WORK") {
            if (data.NotWorkType == "" || data.NotWorkType == null || data.NotWorkType == undefined) {
                $scope.errorNotWorkType = true;
                mess.Status = true;
            } else {
                $scope.errorNotWorkType = false;
            }
        }
        ////Check null status
        //if (data.Action == "") {
        //    $scope.errorAction = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorAction = false;
        //}
        return mess;
    };
    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, fail);
        }
        else {
            alert("Sorry, your browser does not support geolocation services.");
        }
    }
    function success(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        $.getJSON('https://nominatim.openstreetmap.org/reverse?format=json&', { lat: lat, lon: lon }, function (data) {
            $scope.model.LocationText = data.display_name;
            $scope.model.Lat = lat;
            $scope.model.Lon = lon;
            $scope.$apply();
        });
        $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
            $scope.model.Ip = data.ip;
        });
    }
    function fail() {

    }
    function resetInput() {
        $scope.model.Id = '';
        $scope.model.ActionTime = '';
        $scope.model.Note = '';
        CKEDITOR.instances['ckEditorItem'].setData('');

        $scope.entities[0].checked = true;
        $scope.entities[1].checked = false;
        $scope.entities[2].checked = false;
        $scope.entities[3].checked = false;
        $scope.entities[4].checked = false;
        $scope.goLate = true;
        $scope.notWork = false;
        $scope.quitWork = false;
        $scope.planSchedule = false;
        $scope.overtime = false;
        setTimeout(function () {
            loadDateLate();
        }, 200);
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('staffLateNote', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['staffLateNote'].config.height = 90;
    }
    setTimeout(function () {
        ckEditer();
        setModalDraggable('.modal-dialog');
        loadDateLate();
    }, 200);
});
app.controller('staff-wf', function ($scope, $rootScope, $compile, dataserviceStaffLate, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, $filter, $translate, para, $location) {
    //var para = myService.getData();
    if (para == undefined) {
        // var id = $location.search().id;
        // var userId = $location.search().userId;
        // para = { UserId: userId, Id: id };
        // if (para == undefined)
        //     return location.href = "/Admin/StaffLate";
    }
    $rootScope.modelWf = {
        WorkflowCode: "",
        ObjectType: "NOT_WORK",
        ObjectInst: "",
    };
    $rootScope.modelWf.ObjectType = para.Action;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        console.log($rootScope);
        $rootScope.loadDiagramWfInst(para.Id, $rootScope.modelWf.ObjectType);
    }, 1000);
});

app.controller('listUserLate', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceStaffLate, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        $scope.viewMode = para.viewMode;
        $scope.listUserLate = para.listMember;
        $scope.date = para.date;
    }
    $scope.init();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('detail-status', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceStaffLate, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',
        AssetCode: para.AssetCode,
        Group: '',
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
            url: "/Admin/CommonSetting/JTableStatusDetail/",
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
                    $scope.model.Group = data.Group;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"TT" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"Giá trị cài đặt" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"Kiểu dữ liệu" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GroupName').withTitle('{{"Nhóm dữ liệu" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"Ngày tạo" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"Người tạo" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"Thao tác" | translate}}').renderWith(function (data, type, full) {
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
        $scope.model.ValueSet = '';
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataserviceStaffLate.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });

        dataserviceStaffLate.getGroupNotWork(function (rs) {
            rs = rs.data;
            $scope.listGroup = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '' || $scope.model.Group == '') {
            App.toastrError(caption.HR_HR_MAN_CURD_MSG_SETTING_NOT_BLANK);
        } else {
            dataserviceStaffLate.insertCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.CodeSet == '' || $scope.model.Group == '') {
            App.toastrError(caption.HR_HR_MAN_CURD_MSG_DATA_NOT_BLANK)
        } else {
            dataserviceStaffLate.updateCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
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
                    dataserviceStaffLate.deleteCommonSetting(id, function (rs) {
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
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
