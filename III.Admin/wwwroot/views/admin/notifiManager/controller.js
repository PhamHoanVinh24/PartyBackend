var ctxfolderProjectManagement = "/views/admin/notifiManager";
var ctxfolderMessage = "/views/message-box";
var appProjectManagement = angular.module('App_ESEIM_NOTIFIMANAGER', ['App_ESEIM_CARD_JOB', 'App_ESEIM_ATTR_MANAGER', "ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", "pascalprecht.translate", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
appProjectManagement.factory('dataserviceNotifiManager', function ($http) {
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
        getStatus: function (callback) {
            $http.post('/Admin/CardJob/GetStatus/').then(callback);
        },
        getCountNotify: function (callback) {
            $http.post('/Admin/NotifiManager/GetCountNotify/').then(callback);
        }
    };
});
appProjectManagement.controller('Ctrl_ESEIM_NOTIFIMANAGER', function ($scope, $rootScope, $compile, $cookies, $translate, dataserviceNotifiManager, $cookies, $translate) {
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
});

appProjectManagement.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/NotifiManager/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderProjectManagement + '/index.html',
            controller: 'indexNotifiManager'
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

appProjectManagement.controller('indexNotifiManager', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceNotifiManager, $filter) {
    $scope.initData = function () {
        dataserviceNotifiManager.getStatus(function (rs) {
            rs = rs.data;
            $scope.CardStatus = rs;
            var all = {
                Code: '',
                Value: 'Tất cả'
            }
            $scope.CardStatus.unshift(all)
        })
    }
    $scope.initData();
    var vm = $scope;
    $scope.model = {
        Code: '',
        Name: '',
        Status: '',
        DueDate: '',
        FromDate: '',
        ToDate: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/NotifiManager/JTable",
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
                d.Status = $scope.model.Status;
                d.DueDate = $scope.model.DueDate;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.UserId = userId;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    $rootScope.CardCode = data.CardCode;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderCardJob + '/add-card-buffer.html',
                        controller: 'edit-cardCardJob',
                        size: '80',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            para: function () {
                                return data.CardCode;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                        $scope.reload();
                        updateNotify();
                    }, function () { });
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("CardID").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CardName').withTitle('<i class="fa fa-paper-plane mr5"></i>{{"CJ_COL_CARD_NAME" | translate}}').renderWith(function (data, type, full) {
        var deadLine = '';
        var workType = "";
        var priority = "";
        var cardName = data.length > 40 ? data.substr(0, 40) + " ..." : data;
        if (full.UpdateTime != null && full.UpdateTime != "" && full.UpdateTime != undefined) {
            var updated = new Date(full.UpdateTime);
            var currentTime = new Date();
            var diffMsUpdate = (updated - currentTime);
            var diffDayUpdated = Math.floor((diffMsUpdate / 86400000));
            if (diffDayUpdated == -1) {
                var diffHrsUpdate = Math.floor((diffMsUpdate % 86400000) / 3600000);
                if (diffHrsUpdate < 10) {
                    cardName = '<span style = "color: #9406b7">' + cardName + '</span>'
                }
            }
        }
        if (full.WorkType != "") {
            workType = '<span class="fs9" style="color: #048004;">' + 'Kiểu việc: ' + full.WorkType + '</span>'
        }
        if (full.Priority != "") {
            priority = '<span class="badge-customer badge-customer-success ml-1">' + full.Priority + '</span>'
        }

        if (full.Deadline == '') {
            deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Không đặt thời hạn</span>'
        }
        else {
            var created = new Date(full.Deadline);
            var now = new Date();
            var diffMs = (created - now);
            var diffDay = Math.floor((diffMs / 86400000));
            if ((diffDay + 1) < 0) {
                deadLine = '<span class="badge-customer badge-customer-danger fs9 ml5">Đã quá hạn</span>';
            } else if ((diffDay + 1) > 0) {
                deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + (diffDay + 1) + ' ngày</span>'
            } else {
                var end = new Date(new Date().setHours(23, 59, 59, 999));
                var diffMs1 = (end - now);

                var diffHrs = Math.floor((diffMs1 % 86400000) / 3600000);
                var diffMins = Math.round(((diffMs1 % 86400000) % 3600000) / 60000);
                deadLine = '<span class="badge-customer badge-customer-success fs9 ml5">Còn ' + diffHrs + 'h ' + diffMins + 'p</span>'
            }
        }

        
        if (full.Status == 'Hoàn thành') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9">&nbsp;Hoàn thành</span>' + priority +
                '</div>' + '<div class ="pt5">' + workType + '</div>';
            '</div';
        } else if (full.Status == 'Đang triển khai') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                '<span> ' + cardName + '</span >' +
                '<div class="pt5"><span class="badge-customer badge-customer-danger">&nbsp;Đang triển khai</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + '</div>';
            '</div>';
        } else if (full.Status == 'Bị hủy') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-warning">&nbsp;Bị hủy</span>' + priority +
                '</div>' + '<div class ="pt5">' + workType + '</div>';
            '</div>';
        }
        else if (full.Status == 'Mới tạo') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-success fs9">&nbsp;Mới tạo</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + '</div>';
            '</div>';
        } else if (full.Status == 'Thẻ rác') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9">&nbsp;Thẻ rác</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + '</div>';
            '</div>';
        } else if (full.Status == 'Đóng') {
            return '<span class="bold text-underline" style="color:#ab7474">#' + full.CardCode + ': </span>' +
                cardName +
                '<div class="pt5"><span class="badge-customer badge-customer-danger fs9">&nbsp;Đóng</span>' + deadLine + priority +
                '</div>' + '<div class ="pt5">' + workType + '</div>';
            '</div>';
        }
    }).withOption('sClass', 'nowrap'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_START" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Deadline').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_DEADLINE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_END" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('<i class="fa fa-user-o mr5"></i>{{"CJ_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_COL_CREATE_DATE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UpdatedTimeTxt').withTitle('<i class="fa fa-calendar mr5"></i>{{"CJ_LIST_COL_UPDATE_TIME" | translate}}').renderWith(function (data, type) {
        return '<span class ="bold" style ="color: #9406b7;">' + data + '</span>';
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
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            todayHighlight: true,
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
        $("#DueDate").datepicker({
            inline: false,
            autoclose: true,
            todayHighlight: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);

    function updateNotify() {
        dataserviceNotifiManager.getCountNotify(function (rs) {
            rs = rs.data;
            document.getElementById("countCardWork").innerText = "Bạn có " + rs.CountWork + " công việc mới.";
            document.getElementById("countAllNotifyNew").innerText = rs.All;
            document.getElementById("allNotifyNew").innerText = rs.All + " mới";
        })
    }
});
