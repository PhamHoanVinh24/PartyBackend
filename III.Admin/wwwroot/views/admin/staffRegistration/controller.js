var ctxfolder = "/views/admin/staffRegistration";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", "ngCookies", 'ngSanitize']);

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
        insertEvent: function (data, callback) {
            $http.post('/Admin/StaffRegistration/InsertEvent/', data).then(callback);
        },
        getAllEvent: function (memberId, monthYear, morning, afternoon, evening, saturday, sunday, department, callback) {
            $http.get('/Admin/StaffRegistration/GetAllEvent?memberId=' + memberId + '&monthYear=' + monthYear + '&morning=' + morning + '&afternoon=' + afternoon + '&evening=' + evening + '&saturday=' + saturday + '&sunday=' + sunday + '&department=' + department).then(callback);
        },
        getEventForDate: function (data, callback) {
            $http.get('/Admin/StaffRegistration/GetEventForDate?date=' + data).then(callback);
        },
        //getListEmployee: function (callback) {
        //    $http.post('/Admin/StaffRegistration/GetListEmployee').then(callback);
        //},
        getListUser: function (data, callback) {
            $http.get('/Admin/StaffRegistration/GetListUser?department=' + data).then(callback);
        },
        getItemUser: function (data, callback) {
            $http.get('/Admin/StaffRegistration/GetItemUser?userId=' + data).then(callback);
        },
        getItemScheduleMember: function (data, callback) {
            $http.get('/Admin/StaffRegistration/GetItemScheduleMember?memberId=' + data).then(callback);
        },
        changeFrametimeStaff: function (id, frame, callback) {
            $http.get('/Admin/StaffRegistration/ChangeFrametimeStaff?id=' + id + "&frame=" + frame).then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/CardJob/GetDepartment').then(callback)
        }
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
            //max: 'Max some message {0}'
        });
    });
    dataservice.getListUser('', function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
        var all = {
            Id: '',
            GivenName: "Tất cả"
        }
        $rootScope.listUser.unshift(all)
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/StaffRegistration/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
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

    $scope.model = {
        MemberId: '',
        Department: ''
    };

    $scope.initData = function () {
        dataservice.getDepartment(function (rs) {
            rs = rs.data;
            $scope.lstDepartment = rs;
        })
    }

    $scope.initData();

    $scope.changeDepartment = function () {
        dataservice.getListUser($scope.model.Department, function (rs) {
            rs = rs.data;
            $rootScope.listUser = rs;
            $scope.model.MemberId = "";
        });
    }

    $scope.reloadUser = function () {
        dataservice.getListUser('', function (rs) {
            rs = rs.data;
            $rootScope.listUser = rs;
            $scope.model.Department = "";
        });
    }

    $scope.search = function () {
        $('#calendar').fullCalendar('refetchEvents');
    }

    $scope.registration = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/registration.html',
            controller: 'registration',
            windowClass: 'modal-registration',
            backdrop: 'static',
            size: '50',
        });
        modalInstance.result.then(function (d) {
            $('#calendar').fullCalendar('refetchEvents');
        }, function () {
        });
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
                right: 'month,agendaWeek,agendaDay',
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
                dataservice.getAllEvent($scope.model.MemberId, monthYear, morning, afternoon, evening, saturday, sunday, $scope.model.Department, function (rs) {
                    rs = rs.data;

                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        //select all member
                        if (rs.Object.All) {
                            if (rs.Object.ListMemberSchedule.length == 0) {
                                App.toastrError(caption.STRE_ERROR_NOT_FIND_WORK_CALENDAR);
                                return;
                            }
                            var event = [];
                            angular.forEach(rs.Object.ListMemberSchedule, function (value, key) {
                                var calendar = value.FrameTime.split(';');
                                var morning = calendar[0] == 'True' ? 'S' : '';
                                var afternoon = calendar[1] == 'True' ? 'C' : '';
                                var evening = calendar[2] == 'True' ? 'T' : '';
                                var schedule = '';
                                schedule += morning != '' ? morning : '';
                                if (afternoon != '') {
                                    schedule += ',';
                                }
                                schedule += afternoon != '' ? afternoon : '';
                                if (evening != '') {
                                    schedule += ',';
                                }
                                schedule += evening != '' ? evening : '';
                                var obj = {
                                    title: value.GivenName + ' (' + schedule + ')',
                                    start: value.DatetimeEvent,
                                    className: 'fc-event-event-azure',
                                    givenName: value.GivenName,
                                    memberId: value.MemberId,
                                    displayEventTime: false,
                                }
                                event.push(obj);
                            })

                            angular.forEach(rs.Object.ListTotalSchedule, function (value, key) {
                                var total = " " + caption.STRE_CHECKBOX_MORNING + ": " + value.Morning + "\n " + caption.STRE_CHECK_BOX_AFTERNOON + ": " + value.Afternoon + "\n " + caption.STRE_CHECK_BOX_EVENING + ": " + value.Evening;
                                var obj = {
                                    title: total,
                                    start: value.DatetimeEvent,
                                    className: 'fc-event-event-orange',
                                    allDay: true,
                                    total: true,
                                    date: value.DatetimeEvent
                                }
                                event.push(obj);
                            })
                            callback(event);
                        }
                        //select one user
                        else {
                            if (rs.Object.ListScheduleForMember.length == 0) {
                                App.toastrError(caption.STRE_ERROR_NOT_FIND_WORK_CALENDAR);
                                return;
                            }
                            var event = [];
                            angular.forEach(rs.Object.ListScheduleForMember, function (value, key) {
                                var calendar = value.FrameTime.split(';');
                                var dateRegistraion = (new Date(value.DatetimeEvent)).getDay();
                                var morning = {
                                    title: "1." + caption.STRE_CHECKBOX_MORNING,
                                    start: value.DatetimeEvent,
                                    allDay: true,
                                    className: ((dateRegistraion == 6 || dateRegistraion == 0) && calendar[0] == "True") ? 'fc-event-event-orange' : calendar[0] == "True" ? 'fc-event-event-azure' : 'fc-event-event-default',
                                    id: value.Id,
                                    frameTime: 0
                                }
                                var afternoon = {
                                    title: "2." + caption.STRE_CHECK_BOX_AFTERNOON,
                                    start: value.DatetimeEvent,
                                    allDay: true,
                                    className: ((dateRegistraion == 6 || dateRegistraion == 0) && calendar[1] == "True") ? 'fc-event-event-orange' : calendar[1] == "True" ? 'fc-event-event-azure' : 'fc-event-event-default',
                                    id: value.Id,
                                    frameTime: 1
                                }
                                var evening = {
                                    title: "3." + caption.STRE_CHECK_BOX_EVENING,
                                    start: value.DatetimeEvent,
                                    allDay: true,
                                    className: ((dateRegistraion == 6 || dateRegistraion == 0) && calendar[2] == "True") ? 'fc-event-event-orange' : calendar[2] == "True" ? 'fc-event-event-azure' : 'fc-event-event-default',
                                    id: value.Id,
                                    frameTime: 2
                                }
                                event.push(morning);
                                event.push(afternoon);
                                event.push(evening);
                            })
                            callback(event);
                        }
                    }
                })
            },
            eventClick: function (calEvent) {
                if (calEvent.total) {
                    var date = $filter('date')(new Date(calEvent.date), 'dd/MM/yyyy');
                    dataservice.getEventForDate(date, function (rs) {
                        rs = rs.data;
                        if (!rs.Error) {
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolder + '/listMemberRegistration.html',
                                controller: 'listMemberRegistration',
                                backdrop: 'static',
                                size: '50',
                                resolve: {
                                    para: function () {
                                        return {
                                            listMember: rs.Object,
                                            date: date
                                        }
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                                $('#' + id).fullCalendar('refetchEvents');
                            }, function () {
                            });
                        } else {
                            App.toastrError(rs.Title);
                        }
                    });
                } else {
                    dataservice.getItemUser(calEvent.memberId, function (rs) {
                        rs = rs.data;
                        if (calEvent.memberId == '' || calEvent.memberId == null || calEvent.memberId == undefined) {
                            return;
                        }
                        if (!rs.Error) {
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolder + '/memberDetail.html',
                                controller: 'memberDetail',
                                backdrop: 'static',
                                size: '20',
                                resolve: {
                                    para: function () {
                                        return rs;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {

                            }, function () {
                            });
                        } else {
                            App.toastrError(rs.Title);
                        }
                    });
                }
            },
        })
    }

    setTimeout(function () {
        loadCalendar("calendar");
    }, 200);
});

app.controller('memberDetail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {

        $scope.model = para.Object;
        console.log($scope.model);
    }
    $scope.init();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('listMemberRegistration', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    };

    $scope.init = function () {
        $scope.listMember = para.listMember;
        $scope.date = para.date
    }

    $scope.init();

    $scope.changeStatusFrameTime = function (eventId, frameTime) {
        dataservice.changeFrametimeStaff(eventId, frameTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                var item = $scope.listMember.find(function (element) {
                    if (element.Id == eventId) return true;
                });
                if (item) {
                    if (frameTime == 1) {
                        if (item.Morning == 'True') {
                            item.Morning = 'False';
                        } else {
                            item.Morning = 'True';
                        }
                    } else if (frameTime == 2) {
                        if (item.Afternoon == 'True') {
                            item.Afternoon = 'False';
                        } else {
                            item.Afternoon = 'True';
                        }
                    } else {
                        if (item.Evening == 'True') {
                            item.Evening = 'False';
                        } else {
                            item.Evening = 'True';
                        }
                    }
                }
            }
        });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});

app.controller('registration', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataservice) {
    $scope.model = {
        MemberId: '',
        FromDate: '',
        ToDate: '',
        Morning: false,
        Afternoon: false,
        Evening: false,
        Saturday: false,
        Sunday: false,
        DatetimeEvent: ''

    }
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
    var vm = $scope;
    vm.dt = {};
    //select member
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffRegistration/JTableGetEventForMember",
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
                d.DatetimeEvent = $scope.model.DatetimeEvent;
                d.Morning = $scope.model.Morning;
                d.Evening = $scope.model.Evening;
                d.Afternoon = $scope.model.Afternoon
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $scope.$apply();
            },
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(7)
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
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('DatetimeEvent').withTitle('{{"STRE_CURD_TAB_LIST_LIST_COL_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Morning').withTitle('{{"STRE_CURD_TAB_LIST_LIST_COL_MORNING" | translate}}').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Afternoon').withTitle('{{"STRE_CURD_TAB_LIST_LIST_COL_AFTERNOON" | translate}}').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';

        } else {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Evening').withTitle('{{"STRE_CURD_TAB_LIST_LIST_COL_EVENING" | translate}}').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0)) {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff""><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTimeJtable(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.selectMember = function (memberId) {

        reloadData(true);
        dataservice.getItemUser(memberId, function (rs) {
            rs = rs.data;
            $scope.detailMember = rs.Object;

        })
        dataservice.getItemScheduleMember(memberId, function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $scope.model.FromDate = rs.Object != null ? rs.Object.FromDate : '';
                $scope.model.ToDate = rs.Object != null ? rs.Object.ToDate : '';
            }
        })
    }
    $scope.registration = function () {
        if ($scope.model.MemberId != '') {
            if ($scope.model.MemberId == '' || $scope.model.FromDate == '' || $scope.model.ToDate == '') {
                App.toastrError(caption.STRE_MSG_VALIDATE_DATA)
            } else {
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
                $scope.model.Morning = morning;
                $scope.model.Afternoon = afternoon;
                $scope.model.Evening = evening;
                $scope.model.Sunday = sunday;
                $scope.model.Saturday = saturday;
                if ($scope.model.Morning == false && $scope.model.Afternoon == false && $scope.model.Evening == false && $scope.model.Sunday == false && $scope.model.Saturday == false) {
                    App.toastrError(caption.STRE_MSG_CHOOSE_SUNDAY);
                } else {
                    dataservice.insertEvent($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            reloadData(true);
                            $('#calendar').fullCalendar('refetchEvents');
                        }
                    })
                }
            }
        }
    }
    $scope.changeStatusFrameTime = function (eventId, frameTime) {
        dataservice.changeFrametimeStaff(eventId, frameTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                var item = $scope.listMember.find(function (element) {
                    if (element.Id == eventId) return true;
                });
                if (item) {
                    if (frameTime == 1) {
                        if (item.Morning == 'True') {
                            item.Morning = 'False';
                        } else {
                            item.Morning = 'True';
                        }
                    } else if (frameTime == 2) {
                        if (item.Afternoon == 'True') {
                            item.Afternoon = 'False';
                        } else {
                            item.Afternoon = 'True';
                        }
                    } else {
                        if (item.Evening == 'True') {
                            item.Evening = 'False';
                        } else {
                            item.Evening = 'True';
                        }
                    }
                }
            }
        });
    }
    $scope.changeStatusFrameTimeJtable = function (eventId, frameTime) {
        dataservice.changeFrametimeStaff(eventId, frameTime, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                reloadData(false);
            }
        });
    }
    function loadDate() {
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
        $('.start-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.end-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        loadDate();
    }, 200);


    //select all
    $scope.listMember = [];
    vm.dtOptionsTotal = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/StaffRegistration/JTableGetEventTotal",
            beforeSend: function (jqXHR, settings) {
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
                var check = getCheckMorning();
                d.Morning = check.Morning;
                d.Afternoon = check.Afternoon;
                d.Evening = check.Evening;
                d.Saturday = check.Saturday;
                d.Sunday = check.Sunday;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            },
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(4)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    $scope.listMember = [];
                } else {
                    $('#tblDataTotal').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    var date = $filter('date')(new Date(data.DatetimeEvent), 'dd/MM/yyyy');
                    dataservice.getEventForDate(date, function (rs) {
                        rs = rs.data;
                        if (!rs.Error) {
                            $scope.listMember = rs.Object;
                        } else {
                            App.toastrError(rs.Title);
                        }
                    });
                }
                $scope.$apply();
            })
        });

    vm.dtColumnsTotal = [];
    vm.dtColumnsTotal.push(DTColumnBuilder.newColumn('DatetimeEvent').withTitle($translate('STRE_CURD_TAB_LIST_LIST_COL_DATE')).withOption('sClass', 'dataTable-pr5').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumnsTotal.push(DTColumnBuilder.newColumn('DatetimeEvent').withTitle($translate('STRE_CURD_TAB_LIST_LIST_COL_MORNING_AFTERNOON_EVENING')).withOption('sClass', 'dataTable-pr0').renderWith(function (data, type, full) {
        var morning = "<span style='padding: 10px;'><span class='icon-ios-partlysunny' style='font-size:25px;color: #9cb7b5;position: relative;top: 3px;'></span>" + caption.STRE_CHECKBOX_MORNING + " :" + full.Morning + "</span><br/>";
        var afternoon = "<span style='padding: 10px;'><i class='icon-ios-sunny' style='font-size:25px;color: #d8c63d; position: relative;top: 5px;'></i> " + caption.STRE_CHECK_BOX_AFTERNOON + " :" + full.Afternoon + "</span><br/>";
        var evening = "<span style='padding: 10px;'><i class='icon-ios-moon' style='font-size:25px; position: relative;top: 5px;'></i> " + caption.STRE_CHECK_BOX_EVENING + ": " + full.Evening + "</span>";
        return morning + afternoon + evening;
    }));
    vm.reloadDataTotal = reloadDataTotal;
    vm.dt.dtInstanceTotal = {};
    function reloadDataTotal(resetPaging) {
        vm.dt.dtInstanceTotal.reloadData(callbackTotal, resetPaging);
    }
    function callbackTotal(json) {

    }
    function getCheckMorning() {
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
        return {
            Morning: morning,
            Afternoon: afternoon,
            Evening: evening,
            Saturday: saturday,
            Sunday: sunday,
        }
    }
    $scope.search = function () {
        reloadDataTotal(true);
    }
});
