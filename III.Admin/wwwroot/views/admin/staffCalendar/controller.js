var ctxfolder = "/views/admin/staffCalendar";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", "ngCookies"]);

app.factory('dataservice', function ($http) {
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
        getListEmployee: function (callback) {
            $http.post('/Admin/StaffCalendar/GetListEmployee').then(callback);
        },
        getEventCat: function (data, callback) {
            $http.get('/Admin/StaffCalendar/GetEventCat?memberId=' + data).then(callback);
        },
        changeFrameTimeStatus: function (id, frame, callback) {
            $http.post('/Admin/StaffCalendar/ChangeFrametimeStatus/?id=' + id + "&frame=" + frame).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
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
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/StaffCalendar/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/search', {
            templateUrl: ctxfolder + '/duration-search.html',
            controller: 'duration-search'
        })
        .when('/interview', {
            templateUrl: ctxfolder + '/interview.html',
            controller: 'duration-search'
        })
        .when('/candidates', {
            templateUrl: ctxfolder + '/Candidate-grid.html',
            controller: 'candidate-grid'
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


app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var vm = $scope;
    $scope.model = {
        MemberId: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.initLoad = function () {
        dataservice.getListEmployee(function (rs) {rs=rs.data;
            $scope.listEmployeeData = rs;
        });
    }
    $scope.initLoad();

    $scope.reloadCalender = function () {
        $('#calendar').fullCalendar('refetchEvents');
    }
    function loadCalendar(id) {
        $('#' + id).fullCalendar({
            defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: true,
            header: {
                center: 'title',
                left: 'prev',
                right: 'next'
            },
            dayNames: [caption.SC_LIST_COL_DAY_NAME_SUNDAY, caption.SC_LIST_COL_DAY_NAME_MONDAY, caption.SC_LIST_COL_DAY_NAME_TUESDAY, caption.SC_LIST_COL_DAY_NAME_WEDNESDAY, caption.SC_LIST_COL_DAY_NAME_THURSDAY, caption.SC_LIST_COL_DAY_NAME_FRIDAY, caption.SC_LIST_COL_DAY_NAME_SATURDAY],
            monthNames: [caption.SC_LBL_MONTH_NAME_JAN + ' - ', caption.SC_LBL_MONTH_NAME_FEB + ' - ', caption.SC_LBL_MONTH_NAME_MAR + ' - ', caption.SC_LBL_MONTH_NAME_APR + ' - ', caption.SC_LBL_MONTH_NAME_MAY + ' - ', caption.SC_LBL_MONTH_NAME_JUNE + ' - ', caption.SC_LBL_MONTH_NAME_JULY + ' - ', caption.SC_LBL_MONTH_NAME_AUG + ' - ', caption.SC_LBL_MONTH_NAME_SEPT + ' - ', caption.SC_LBL_MONTH_NAME_OCT + ' - ', caption.SC_LBL_MONTH_NAME_NOV + ' - ', caption.SC_LBL_MONTH_NAME_DEC + ' - '],
            monthNamesShort: [caption.SC_LBL_MONTH_NAME_JAN + ' - ', caption.SC_LBL_MONTH_NAME_FEB + ' - ', caption.SC_LBL_MONTH_NAME_MAR + ' - ', caption.SC_LBL_MONTH_NAME_APR + ' - ', caption.SC_LBL_MONTH_NAME_MAY + ' - ', caption.SC_LBL_MONTH_NAME_JUNE + ' - ', caption.SC_LBL_MONTH_NAME_JULY + ' - ', caption.SC_LBL_MONTH_NAME_AUG + ' - ', caption.SC_LBL_MONTH_NAME_SEPT + ' - ', caption.SC_LBL_MONTH_NAME_OCT + ' - ', caption.SC_LBL_MONTH_NAME_NOV + ' - ', caption.SC_LBL_MONTH_NAME_DEC + ' - '],
            dayNamesShort: [caption.SC_LIST_COL_DAY_NAME_SUNDAY, caption.SC_LIST_COL_DAY_NAME_MONDAY, caption.SC_LIST_COL_DAY_NAME_TUESDAY, caption.SC_LIST_COL_DAY_NAME_WEDNESDAY, caption.SC_LIST_COL_DAY_NAME_THURSDAY, caption.SC_LIST_COL_DAY_NAME_FRIDAY, caption.SC_LIST_COL_DAY_NAME_SATURDAY],
            events: function (start, end, timezone, callback) {
                dataservice.getEventCat($scope.model.MemberId, function (rs) {rs=rs.data;
                    var event = [];
                    angular.forEach(rs, function (value, key) {
                        var calendar = value.FrameTime.split(';');
                        var morning = {
                            title: "1.Sáng",
                            start: value.DatetimeEvent,
                            allDay: true,
                            color: calendar[0] == "True" ? '#16a085' : '#bdc3c7',
                            id: value.Id,
                            frameTime: 0
                        }
                        var afternoon = {
                            title: "2.Chiều",
                            start: value.DatetimeEvent,
                            allDay: true,
                            color: calendar[1] == "True" ? '#16a085' : '#bdc3c7',
                            id: value.Id,
                            frameTime: 1
                        }
                        var evening = {
                            title: "3.Tối",
                            start: value.DatetimeEvent,
                            allDay: true,
                            color: calendar[2] == "True" ? '#16a085' : '#bdc3c7',
                            id: value.Id,
                            frameTime: 2
                        }
                        event.push(morning);
                        event.push(afternoon);
                        event.push(evening);
                    })
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                //calEvent.color = '#bdc3c7';
                //deleteFrameTime(calEvent.frameTime, calEvent.eventCode, calEvent);
                //$("a.fc-day-grid-event.fc-h-event.fc-event.fc-start.fc-end.fc-draggable").click(function () {
                //    var stt = $(this).hasClass("true");
                //    if (stt == true) {
                //        $(this).removeClass("true");
                //        $(this).css('background', 'silver');
                //    } else {
                //        $(this).addClass(" true");
                //        $(this).css('background', 'green');
                //    }
                //});
            },
            dayClick: function (date) {
            },
            customButtons: {
            }
        })
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
        loadCalendar("calendar");
        showHideSearch();
    }, 100);


    //tab today
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffCalendar/GetEventCatGridToday",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.MemberId = $scope.model.MemberId;
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fullname').withTitle('{{"SC_LIST_COL_FULL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DatetimeEvent').withTitle('{{"SC_LIST_COL_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Morning').withTitle('{{"SC_LIST_COL_MORNING" | translate}}').renderWith(function (data, type, full) {
        return (data == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
            '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>') + (full.MorningPresent == "False" ? "Vắng" : "");
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Afternoon').withTitle('{{"SC_LIST_COL_AFTERNOON" | translate}}').renderWith(function (data, type, full) {
        return (data == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
            '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>') + (full.AfternoonPresent == "False" ? "Vắng" : "");
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Evening').withTitle('{{"SC_LIST_COL_EVENING" | translate}}').renderWith(function (data, type, full) {
        return (data == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
            '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>') + (full.EveningPresent == "False" ? "Vắng" : "");
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withTitle('Thao tác').renderWith(function (data, type, full, meta) {
    //    return '<button title="Sửa" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));
    vm.reloadData = reloadData;
    vm.dt = {
        dtInstance: {}
    }
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
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
    $scope.reloadTable = function () {
        reloadData(true);
    };
    $scope.changeStatusFrameTime = function (eventId, frameTime) {
        dataservice.changeFrameTimeStatus(eventId, frameTime, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                element = document.getElementsByClassName('sorting')[0];
                element.click();
                $scope.reloadCalender();
            }
        });
    };
    
    setTimeout(function () {
      
    }, 600);
});