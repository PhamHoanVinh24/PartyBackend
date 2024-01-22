var ctxfolderReport = "/views/admin/reportRecruitment";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_REPORT', ['App_ESEIM_DASHBOARD',"App_ESEIM_PER", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", "ngCookies", 'ngSanitize']);

app.factory('dataserviceReport', function ($http) {
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
        getAllEvent: function (memberId, monthYear, morning, afternoon, evening, saturday, sunday, callback) {
            $http.get('/Admin/reportRecruitment/GetAllEvent?memberId=' + memberId + '&monthYear=' + monthYear + '&morning=' + morning + '&afternoon=' + afternoon + '&evening=' + evening + '&saturday=' + saturday + '&sunday=' + sunday).then(callback);
        },
        chartReportRecuruitment: function (callback) {
            $http.get('/Admin/reportRecruitment/ChartReportRecuruitment/').then(callback);
        },
        getListPlan: function (callback) {
            $http.get('/Admin/reportRecruitment/GetListPlan/').then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/Delete/' + data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_REPORT', function ($scope, $rootScope, $compile, $uibModal, dataserviceReport, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.IsTranslate = true;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/reportRecruitment/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderReport + '/index.html',
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

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceReport, $filter) {
    $scope.schedule = [{
        name: caption.STRE_CHECKBOX_MORNING,
        checked: false,
        value: 0,
    }, {
        name: caption.STRE_CHECK_BOX_AFTERNOON,
        checked: false,
        value: 1,
    }, {
        name: caption.STRE_CHECK_BOX_EVENING,
        checked: false,
        value: 2,
    }, {
        name: caption.STRE_CHECK_BOX_SATURDAY,
        checked: false,
        value: 3,
    }, {
        name: caption.STRE_LBL_SEARCH_SUNDAY,
        checked: false,
        value: 4,
    }]

    $scope.initData = function () {
        window.tabler = {
            colors: {
                'blue': '#467fcf',
                'blue-darkest': '#0e1929',
                'blue-darker': '#1c3353',
                'blue-dark': '#3866a6',
                'blue-light': '#7ea5dd',
                'blue-lighter': '#c8d9f1',
                'blue-lightest': '#edf2fa',
                'azure': '#45aaf2',
                'azure-darkest': '#0e2230',
                'azure-darker': '#1c4461',
                'azure-dark': '#3788c2',
                'azure-light': '#7dc4f6',
                'azure-lighter': '#c7e6fb',
                'azure-lightest': '#ecf7fe',
                'indigo': '#6574cd',
                'indigo-darkest': '#141729',
                'indigo-darker': '#282e52',
                'indigo-dark': '#515da4',
                'indigo-light': '#939edc',
                'indigo-lighter': '#d1d5f0',
                'indigo-lightest': '#f0f1fa',
                'purple': '#a55eea',
                'purple-darkest': '#21132f',
                'purple-darker': '#42265e',
                'purple-dark': '#844bbb',
                'purple-light': '#c08ef0',
                'purple-lighter': '#e4cff9',
                'purple-lightest': '#f6effd',
                'pink': '#f66d9b',
                'pink-darkest': '#31161f',
                'pink-darker': '#622c3e',
                'pink-dark': '#c5577c',
                'pink-light': '#f999b9',
                'pink-lighter': '#fcd3e1',
                'pink-lightest': '#fef0f5',
                'red': '#e74c3c',
                'red-darkest': '#2e0f0c',
                'red-darker': '#5c1e18',
                'red-dark': '#b93d30',
                'red-light': '#ee8277',
                'red-lighter': '#f8c9c5',
                'red-lightest': '#fdedec',
                'orange': '#fd9644',
                'orange-darkest': '#331e0e',
                'orange-darker': '#653c1b',
                'orange-dark': '#ca7836',
                'orange-light': '#feb67c',
                'orange-lighter': '#fee0c7',
                'orange-lightest': '#fff5ec',
                'yellow': '#f1c40f',
                'yellow-darkest': '#302703',
                'yellow-darker': '#604e06',
                'yellow-dark': '#c19d0c',
                'yellow-light': '#f5d657',
                'yellow-lighter': '#fbedb7',
                'yellow-lightest': '#fef9e7',
                'lime': '#7bd235',
                'lime-darkest': '#192a0b',
                'lime-darker': '#315415',
                'lime-dark': '#62a82a',
                'lime-light': '#a3e072',
                'lime-lighter': '#d7f2c2',
                'lime-lightest': '#f2fbeb',
                'green': '#5eba00',
                'green-darkest': '#132500',
                'green-darker': '#264a00',
                'green-dark': '#4b9500',
                'green-light': '#8ecf4d',
                'green-lighter': '#cfeab3',
                'green-lightest': '#eff8e6',
                'teal': '#2bcbba',
                'teal-darkest': '#092925',
                'teal-darker': '#11514a',
                'teal-dark': '#22a295',
                'teal-light': '#6bdbcf',
                'teal-lighter': '#bfefea',
                'teal-lightest': '#eafaf8',
                'cyan': '#17a2b8',
                'cyan-darkest': '#052025',
                'cyan-darker': '#09414a',
                'cyan-dark': '#128293',
                'cyan-light': '#5dbecd',
                'cyan-lighter': '#b9e3ea',
                'cyan-lightest': '#e8f6f8',
                'gray': '#868e96',
                'gray-darkest': '#1b1c1e',
                'gray-darker': '#36393c',
                'gray-dark': '#6b7278',
                'gray-light': '#aab0b6',
                'gray-lighter': '#dbdde0',
                'gray-lightest': '#f3f4f5',
                'gray-dark': '#343a40',
                'gray-dark-darkest': '#0a0c0d',
                'gray-dark-darker': '#15171a',
                'gray-dark-dark': '#2a2e33',
                'gray-dark-light': '#717579',
                'gray-dark-lighter': '#c2c4c6',
                'gray-dark-lightest': '#ebebec'
            }
        };

        dataserviceReport.chartReportRecuruitment(function (rs) {
            rs = rs.data;
            monthcard = [];
            sumRegis = ['sum'];
            sumPass = ['success'];
            for (var i = 0; i < rs.length; i++) {
                sumRegis.push(rs[i].SumRegis);
                sumPass.push(rs[i].SumPass);
                monthcard.push('Tháng' + ' ' + (rs[i].Month));
            }

            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart_recruitment', // id of chart wrapper
                    data: {
                        columns: [
                            sumRegis,
                            sumPass,
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'sum': tabler.colors["blue"],
                            'success': tabler.colors["pink"],
                        },
                        names: {
                            // name of each serie
                            'sum': 'Đăng ký',
                            'success': 'Đạt',
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: monthcard
                        },
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 100);
        })
    }
    $rootScope.showHeader = true;
    $rootScope.showDetail = false;

    $scope.switchDiv = function () {
        divCalendar = $('#div-calender');
        divChart = $('#div-chart');
        tdivCalendar = divCalendar.clone();
        tdivChart = divChart.clone();
        if (!divChart.is(':empty')) {
            divCalendar.replaceWith(tdivChart);
            divChart.replaceWith(tdivCalendar);
        }
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
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


    function loadCalendar(id) {
        $('#' + id).fullCalendar({
            defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: true,
            header: {
                left: 'prev,next,today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            dayNames: [caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],
            monthNames: [caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            monthNamesShort: [caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            dayNamesShort: [caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],

            buttonText: {
                today: caption.STRE_CURD_TAB_WORK_CALENDAR_BTN_TODAY,
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                var monthYear = $('#calendar').fullCalendar('getDate').format('MM/YYYY');
                var morning = false;
                var afternoon = false;
                var evening = false;
                var saturday = false;
                var sunday = false;
                for (var i = 0; i < $scope.schedule.length; i++) {
                    if ($scope.schedule[i].value == 0 && $scope.schedule[i].checked) {
                        morning = true;
                    }
                    if ($scope.schedule[i].value == 1 && $scope.schedule[i].checked) {
                        afternoon = true;
                    }
                    if ($scope.schedule[i].value == 2 && $scope.schedule[i].checked) {
                        evening = true;
                    }
                    if ($scope.schedule[i].value == 3 && $scope.schedule[i].checked) {
                        saturday = true;
                    }
                    if ($scope.schedule[i].value == 4 && $scope.schedule[i].checked) {
                        sunday = true;
                    }
                }
                dataserviceReport.getAllEvent('', monthYear, morning, afternoon, evening, saturday, sunday, function (rs) {
                    rs = rs.data;

                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        if (rs.Object.ListTotalPlan.length == 0) {
                            App.toastrError(caption.STRE_ERROR_NOT_FIND_WORK_CALENDAR);
                            return;
                        }
                        var event = [];
                        angular.forEach(rs.Object.ListTotalPlan, function (value, key) {
                            var obj = {
                                code: value.PlanNumber,
                                title: value.Title + ' (' + value.TotalCandidate + ')',
                                start: value.PlanDate,
                                className: 'fc-event-event-azure',
                                displayEventTime: false,
                                isPlan: true
                            }
                            event.push(obj);
                        })

                        angular.forEach(rs.Object.ListTotalExcute, function (value, key) {
                            var startDate = new Date(value.StartDate);
                            var endDate = new Date(value.EndDate);

                            for (var i = startDate; i <= endDate; i.setDate(i.getDate() + 1)) {
                                var obj = {
                                    code: value.RecruitmentCode,
                                    title: value.Title + ' (' + value.TotalCandidate + ')',
                                    start: i.toLocaleString(),
                                    className: 'fc-event-event-orange',
                                    displayEventTime: false,
                                    isPlan: false
                                }
                                event.push(obj);
                            }
                        });

                        callback(event);
                    }
                })
            },
            eventClick: function (calEvent) {
                $rootScope.PlanNumber = '';
                $rootScope.RecruitmentCode = '';
                if (calEvent.isPlan) {
                    $rootScope.PlanNumber = calEvent.code;

                    var modalInstance = $uibModal.open({
                        windowClass: "message-center",
                        animation: true,
                        templateUrl: ctxfolderReport + '/detailPlan.html',
                        controller: 'detailPlan',
                        backdrop: 'static',
                        size: '60',
                    });
                    modalInstance.result.then(function (d) {

                    }, function () {
                    });
                } else {
                    $rootScope.RecruitmentCode = calEvent.code;

                    var modalInstance = $uibModal.open({
                        windowClass: "message-center",
                        animation: true,
                        templateUrl: ctxfolderReport + '/detailExcute.html',
                        controller: 'detailExcute',
                        backdrop: 'static',
                        size: '60',
                    });
                    modalInstance.result.then(function (d) {

                    }, function () {
                    });
                }
            },
        })
    }
    setTimeout(function () {
        loadCalendar("calendar");
        $scope.initData();

    }, 300);
});

app.controller('detailPlan', function ($scope, $rootScope, $filter, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $uibModal, dataserviceReport) {
    var vm = $scope;
    $scope.model = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PlanRecruitment/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PlanNumber = $rootScope.PlanNumber;
            },
            complete: function (e) {
                if (e.responseJSON != undefined && e.responseJSON != null && e.responseJSON != '') {
                    $rootScope.countDetail = e.responseJSON.recordsTotal;
                } else {
                    $rootScope.countDetail = 0;
                }

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

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Position').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_POSITION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span class="text-green bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_QUANTITY" | translate}}').renderWith(function (data, type, full, meta) {
        if (data != null)
            return '<span class="text-primary bold">' + data + ' ứng viên' + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Age').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_AGE" | translate}}').renderWith(function (data, type, full, meta) {
        if (data != '')
            return data + ' tuổi';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Gender').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_GENDER" | translate}}').renderWith(function (data, type, full, meta) {
        if (data == "0") {
            return 'Nam hoặc nữ';
        }
        if (data == "1") {
            return '<i class="fas fa-male"></i>';
        }
        if (data == "2") {
            return '<i class="fas fa-female" style="color: #f1204fcf;"></i>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LevelName').withTitle('{{"PR_DETAIL_LEVEL" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span class="text-green bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SpecializeName').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_SPECIALIZE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Tier').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_TIER" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('YearOfExperience').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_YEAR_OF_EXPERIENCE" | translate}}').renderWith(function (data, type, full, meta) {
        if (data != null)
            return data + ' năm';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Local').withOption('sClass', 'text-center').withTitle('{{"PR_DETAIL_LOCAL" | translate}}').renderWith(function (data, type, full, meta) {
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
                selectedItems[Id] = selectAll;
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('detailExcute', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataserviceReport) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PlanExcuteRecruitment/JtableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.RecruitmentCode = $rootScope.RecruitmentCode;
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
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CandidateCode').withTitle('{{"PER_DETAIL_CANDIDATE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CandidateName').withTitle('{{"PER_DETAIL_CANDIDATE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('{{"PER_DETAIL_STATUS_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Result').withTitle('{{"PER_DETAIL_RESULT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PER_DETAIL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('search', function ($scope, dataserviceReport, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, $uibModal) {
    var vm = $scope;
    $scope.model = {
        ObjectType: 'All',
        ObjectCode: '',
        FromDate: '',
        ToDate: '',
        Name: '',
        FileType: '',
        Content: '',
        Tags: '',
        check: false,
        UserUpload: ''
    };
    $scope.search = function () {
        $scope.reload();
        $rootScope.reloadDetail();
    }
    $scope.isReload = false;
    $rootScope.RecruitmentCode = "";

    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ReportRecruitment/JtableSearch",
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
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.PlanNumber = $scope.model.PlanNumber;
            },
            complete: function (json) {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(9)
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

                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle("ID").notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return data;
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withOption('sClass', '').withTitle('{{"REP_COL_RECRUIMENT_NAME" |translate}}').renderWith(function (data, type, full) {
        return '<span class="text-green bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withOption('sClass', 'dataTable-80 text-center').withTitle('{{"REP_COL_START_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withOption('sClass', 'dataTable-80 text-center').withTitle('{{"REP_COL_END_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QuantityJoin').withOption('sClass', 'dataTable-80 text-center').withTitle('{{"REP_COL_QUANTITY_JOIN" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QuantityDK').withOption('sClass', 'dataTable-80 text-center').withTitle('{{"REP_COL_QUANTITY_DK" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('QuantityPass').withOption('sClass', 'dataTable-80 text-center').withTitle('{{"REP_COL_QUANTITY_PASS" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'dataTable-80 text-center').withTitle('{{"REP_COL_STATUS" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button ng-click="loadDetail(\'' + full.RecruitmentCode + '\')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info"></i></button>' +
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
    $scope.reload = function () {
        reloadData(true);
    }

    $rootScope.checkFunction = function (check) {
        if (check == true) {
            $rootScope.showHeader = false;
            $rootScope.showDetail = true;
        }
        else {
            $rootScope.showHeader = true;
            $rootScope.showDetail = false;
        }
    }
    $scope.init = function () {
        dataserviceReport.getListPlan(function (rs) {
            rs = rs.data;
            $scope.lstPlan = rs;
        })
    }
    $scope.init();

    $scope.loadDetail = function (recruitmentCode) {
        $rootScope.RecruitmentCode = recruitmentCode;
        $rootScope.showHeader = true;
        $rootScope.showDetail = true;
        setTimeout(function () {
            $rootScope.reloadDetail();
        }, 300);
    }

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceReport.deleteDetail(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.dismiss('cancel');
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
        }, function () {
            $scope.reload();
        });
    }

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
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
    }, 300);
});
app.controller('detailSearch', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, $uibModal) {
    var vm = $scope;
    $scope.model = {
        ObjectType: 'All',
        ObjectCode: '',
        FromDate: '',
        ToDate: '',
        Name: '',
        FileType: '',
        Content: '',
        Tags: '',
        ListRepository: [],
        UserUpload: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ReportRecruitment/JtableSearchDetail",
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
                d.RecruitmentCode = $rootScope.RecruitmentCode;
            },
            complete: function (json) {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(9)
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle("ID").notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return data;
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Fullname').withOption('sClass', '').withTitle('{{"REP_COL_DETAIL_USER" |translate}}').renderWith(function (data, type, full) {
        if (full.Sex == 1) {
            data = '' + full.CandidateCode + ' - ' + full.Fullname + ' - ' + full.Phone + ' - Nam';
        }
        else {
            data = '' + full.CandidateCode + ' - ' + full.Fullname + ' - ' + full.Phone + ' - Nữ';
        }

        return '<span class="text-danger bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withOption('sClass', '').withTitle('{{"REP_COL_RECRUIMENT_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<span class="text-green bold">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'dataTable-80 text-center').withTitle('{{"REP_DETAIL_ANSWER" | translate}}').renderWith(function (data, type, full) {
        return '<span class="bold">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withOption('sClass', 'dataTable-80 text-center').withTitle('{{"REP_COL_START_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withOption('sClass', 'dataTable-80 text-center').withTitle('{{"REP_COL_END_TIME" | translate}}').renderWith(function (data, type, full) {
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadDetail = function () {
        reloadData(true);
    }
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
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
    }, 300);
});
