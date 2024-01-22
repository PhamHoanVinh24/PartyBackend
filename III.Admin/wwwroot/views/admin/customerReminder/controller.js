var ctxfolder = "/views/admin/projectEvents";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getCustomer: function (callback) {
            $http.post('/Admin/CustomerReminder/GetCustomer').then(callback);
        },
        getAllEvent: function (callback) {
            $http.get('/Admin/CustomerReminder/GetAllEvent/').then(callback);
        },
        getEventForDate: function (data, callback) {
            $http.get('/Admin/StaffRegistration/GetEventForDate?date=' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.dateNow = new Date();
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CustomerReminder/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/',
            {
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
});
//app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
//    var vm = $scope;
//    $scope.model = {
//        FromDate: '',
//        ToDate: '',
//        CustomerId:''
//    }

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    function loadCalendar(id) {
        $('#' + id).fullCalendar({
            defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: false,
            nextDayThreshold: '00:00:00',
            header: {
                left: 'prev,next,today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            dayNames: [caption.CJ_LBL_SUNDAY, caption.CJ_LBL_MONDAY, caption.CJ_LBL_TUESDAY, caption.CJ_LBL_WEDNESDAY, caption.CJ_LBL_THUSDAY, caption.CJ_LBL_FRIDAY, caption.CJ_LBL_SATURDAY],
            monthNames: [caption.CJ_LBL_JANUARY + ' - ', caption.CJ_LBL_FEBRUARY + ' - ', caption.CJ_LBL_MARCH + ' - ', caption.CJ_LBL_APRIL + ' - ', caption.CJ_LBL_MAY + ' - ', caption.CJ_LBL_JUNE + ' - ', caption.CJ_LBL_JULY + ' - ', caption.CJ_LBL_AUGUST + ' - ', caption.CJ_LBL_SEPTEMBER + ' - ', caption.CJ_LBL_OCTOBER + ' - ', caption.CJ_LBL_NOVEMBER + ' - ', caption.CJ_LBL_DECEMBER + ' - '],
            monthNamesShort: [caption.CJ_LBL_JAN + ' - ', caption.CJ_LBL_FEB + ' - ', caption.CJ_LBL_MAR + ' - ', caption.CJ_LBL_APR + ' - ', caption.CJ_LBL_MA + ' - ', caption.CJ_LBL_JUN + ' - ', caption.CJ_LBL_JUL + ' - ', caption.CJ_LBL_AUG + ' - ', caption.CJ_LBL_SEP + ' - ', caption.CJ_LBL_OCT + ' - ', caption.CJ_LBL_NOV + ' - ', caption.CJ_LBL_DEC + ' - '],
            dayNamesShort: [caption.CJ_LBL_SUNDAY, caption.CJ_LBL_MON, caption.CJ_LBL_TUE, caption.CJ_LBL_WED, caption.CJ_LBL_THUS, caption.CJ_LBL_FRI, caption.CJ_LBL_SAT],

            buttonText: {
                today: caption.CJ_LBL_TODAY,
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                dataservice.getAllEvent(function (rs) {
                    rs = rs.data;
                    var event = [];
                    var stt = 0;
                    var checkDate = null;

                    for (var i = 0; i < rs.length; i++) {
                        var value = rs[i];

                        var obj = {
                            stt: stt,
                            value: value,
                            title: value.Title + ' [' + value.ItemName + ' - ' + value.ItemCode + ']', //(value.Title.length > 15 ? value.Title.substr(0, 15) + "..." : value.Title) + ' (' + value.sStartTime + ' - ' + value.sEndTime + ')' ,
                            //title: caption.MS_LBL_MEETING + ' ' + ": " + value.Title + ' \n' + caption.MS_LBL_TIME_MEETING + '  :  ' + value.sStartTime + ' - ' + value.sEndTime + '\n ' + caption.MS_LBL_STATUS + ' : ' + value.Status,
                            start: value.FromDate,
                            end: value.ToDate,
                            className: value.ClassName,
                            date: value.Date,
                            //color: value.Color,
                            //textColor: value.TextColor,
                            displayEventTime: false,
                            edit: false,
                            copy: false,
                            startTime: value.FromDate,
                            titlemeet: value.Title,
                            //status: value.Status,
                            //statusCode: value.StatusCode,
                            timemeet: value.sStartTime + ' - ' + value.sEndTime
                        }

                        stt++;

                        event.push(obj);

                        stt++;
                    }
                    callback(event);
                })
            },
            eventRender: function (event, element) {
                var content = element.find('.fc-content');
                content.addClass('fc-content-dynamic');
            },
            eventClick: function (calEvent) {
                //var date = $filter('date')(new Date(calEvent.date), 'dd/MM/yyyy');
                //var value = calEvent.value;
                //var modalInstance = $uibModal.open({
                //    animation: true,
                //    templateUrl: ctxfolderProject + '/view-calendar.html',
                //    controller: 'grid-view-calendar',
                //    size: '70',
                //    resolve: {
                //        para: function () {
                //            return {
                //                Date: date,
                //                Value: value,
                //            }
                //        }
                //    }
                //});
                //modalInstance.result.then(function (d) {

                //});
            },
            eventOrder: "value",
        })
    }
    setTimeout(function () {
        loadCalendar("calendar");
    }, 200);
});

    


//    $scope.selected = [];
//    $scope.selectAll = false;
//    $scope.toggleAll = toggleAll;
//    $scope.toggleOne = toggleOne;
//    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
//    vm.dtOptions = DTOptionsBuilder.newOptions()
//        .withOption('ajax', {
//            url: "/Admin/CustomerReminder/jtable",
//            beforeSend: function (jqXHR, settings) {
//                resetCheckbox();
//                App.blockUI({
//                    target: "#contentMain",
//                    boxed: true,
//                    message: 'loading...'
//                });
//            },
//            type: 'POST',
//            data: function (d) {
//                d.FromDate = $scope.model.FromDate;
//                d.ToDate = $scope.model.ToDate;
//                d.CustomerId = $scope.model.CustomerId;
//            },
//            complete: function () {
//                App.unblockUI("#contentMain");
//                heightTableAuto();
//            }
//        })
//        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
//        .withDataProp('data').withDisplayLength(pageLength)
//        .withOption('order', [0, 'asc'])
//        .withOption('serverSide', true)
//        .withOption('headerCallback', function (header) {
//            if (!$scope.headerCompiled) {
//                $scope.headerCompiled = true;
//                $compile(angular.element(header).contents())($scope);
//            }
//        })
//        .withOption('initComplete', function (settings, json) {
//        })
//        .withOption('createdRow', function (row, data, dataIndex) {
//            const contextScope = $scope.$new(true);
//            contextScope.data = data;
//            contextScope.contextMenu = $scope.contextMenu;
//            $compile(angular.element(row).contents())($scope);
//            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
//        });

//    vm.dtColumns = [];
//    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
//        $scope.selected[full.id] = false;
//        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
//    }).withOption('sClass', 'hidden'));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('ReminderName').withTitle('{{ "CR_LIST_COL_CR_REMINDERNAME" | translate }}').renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('ReminderTime').withTitle('{{ "CR_LIST_COL_CR_REMINDERTIME" | translate }}').renderWith(function (data, type) {
//        return data != '' ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:ss') : '';
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{ "CR_LIST_COL_CR_NOTE" | translate }}').renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{ "CR_LIST_COL_CR_CREATEBY" | translate }}').renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('CustomerName').withTitle('{{ "CR_LIST_COL_CR_CUSTOMER" | translate }}').renderWith(function (data, type) {
//        return data;
//    }));
//    vm.reloadData = reloadData;
//    vm.dtInstance = {};
//    function reloadData(resetPaging) {
//        vm.dtInstance.reloadData(callback, resetPaging);
//    }
//    function callback(json) {

//    }
//    function toggleAll(selectAll, selectedItems) {
//        for (var id in selectedItems) {
//            if (selectedItems.hasOwnProperty(id)) {
//                selectedItems[id] = selectAll;
//            }
//        }
//    }
//    function toggleOne(selectedItems, evt) {
//        $(evt.target).closest('tr').toggleClass('selected');
//        for (var id in selectedItems) {
//            if (selectedItems.hasOwnProperty(id)) {
//                if (!selectedItems[id]) {
//                    vm.selectAll = false;
//                    return;
//                }
//            }
//        }
//        vm.selectAll = true;
//    }
//    function resetCheckbox() {
//        $scope.selected = [];
//        vm.selectAll = false;
//    }
//    $scope.search = function () {
//        reloadData(true);
//    }
//    $scope.reload = function () {
//        reloadData(true);
//    }
//    $scope.reloadNoResetPage = function () {
//        reloadData(false);
//    };
//    $scope.init = function () {
//        dataservice.getCustomer(function (rs) {rs=rs.data;
//            $scope.customerData = rs;
//        })
//    }
//    $scope.init();

//    $scope.isSearch = false;
//    $scope.showSearch = function () {
//        if (!$scope.isSearch) {
//            $scope.isSearch = true;
//        } else {
//            $scope.isSearch = false;
//        }
//    }

//    // view help detail
//    $scope.viewCmsDetail = function (helpId) {
//        //item, bookMark
//        var modalInstance = $uibModal.open({
//            animation: true,
//            templateUrl: ctxfolderDashBoard + '/viewItem.html',
//            controller: 'viewItemHelp',
//            backdrop: 'static',
//            windowClass: 'message-avoid-header',
//            size: '65',
//            resolve: {
//                para: function () {
//                    return {
//                        helpId
//                    };
//                }
//            }
//        });
//        modalInstance.result.then(function (d) {

//        }, function () {
//        });
//    };
//    function loadDate() {
//        $("#FromTo").datepicker({
//            inline: false,
//            autoclose: true,
//            format: "dd/mm/yyyy",
//            fontAwesome: true,
//        }).on('changeDate', function (selected) {
//            var maxDate = new Date(selected.date.valueOf());
//            $('#DateTo').datepicker('setStartDate', maxDate);
//        });
//        $("#DateTo").datepicker({
//            inline: false,
//            autoclose: true,
//            format: "dd/mm/yyyy",
//            fontAwesome: true,
//        }).on('changeDate', function (selected) {
//            var maxDate = new Date(selected.date.valueOf());
//            $('#FromTo').datepicker('setEndDate', maxDate);
//        });
//        $('.end-date').click(function () {
//            $('#FromTo').datepicker('setEndDate', null);
//        });
//        $('.start-date').click(function () {
//            $('#DateTo').datepicker('setStartDate', null);
//        });
//    }

//    setTimeout(function () {
//        loadDate();
//    }, 50);
//});

