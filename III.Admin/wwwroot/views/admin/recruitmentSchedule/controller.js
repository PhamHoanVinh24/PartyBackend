var ctxfolder = "/views/admin/recruitmentSchedule";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD','App_ESEIM_FILE_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ui.select", "ngCookies", "pascalprecht.translate"]);

app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);

app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getItem: function (data, callback) {
            $http.post('/Admin/weekWorkingSchedule/GetItem/', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },

        getAll: function (callback) {
            $http.post('/Admin/weekWorkingSchedule/GetAll').then(callback);
        },
        getEventToday: function (callback) {
            $http.post('/Admin/weekWorkingSchedule/GetEventToday').then(callback);
        },
        checkIsSecretary: function (callback) {
            $http.post('/Admin/weekWorkingSchedule/CheckIsSecretary').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/weekWorkingSchedule/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/weekWorkingSchedule/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/weekWorkingSchedule/Delete/', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },

        //New design

        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        insertWorkingSchedule: function (data, callback) {
            $http.post('/Admin/RecruitmentSchedule/InsertWorkingSchedule', data).then(callback);
        },
        updateWorkingSchedule: function (data, callback) {
            $http.post('/Admin/RecruitmentSchedule/UpdateWorkingSchedule', data).then(callback);
        },
        deleteWorkingSchedule: function (data, callback) {
            $http.post('/Admin/RecruitmentSchedule/DeleteWorkingSchedule?id=' + data).then(callback);
        },
        getItemWorkingSchedule: function (data, callback) {
            $http.post('/Admin/RecruitmentSchedule/GetItemWorkingSchedule?id=' + data).then(callback);
        },

        getEvent: function (data, callback) {
            $http.get('/Admin/RecruitmentSchedule/GetEvent?type=' + data).then(callback)
        }
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $cookies, $compile, $uibModal, dataservice, $filter, $translate) {
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.IsTranslate = true;

        $rootScope.validationOptions = {
            rules: {
                EndDate: {
                    required: true,
                },
                StartDate: {
                    required: true,
                },
                Location: {
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                Content: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                Location: {
                    maxlength: caption.WWS_VALIDATE_LENGTH,
                    regx: caption.WWS_VALIDATE_BLANK
                },
                Content: {
                    required: "Nội dung công tác không được bỏ trống",
                    maxlength: caption.WWS_VALIDATE_LENGTH,
                    regx: caption.WWS_VALIDATE_BLANK
                },
                EndDate: {
                    required: caption.WWS_VALIDATE_START_DATE
                },
                StartDate: {
                    required: caption.WWS_VALIDATE_END_DATE
                },
            }
        }
    });
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    dataservice.checkIsSecretary(function (rs) {
        rs = rs.data;
        $rootScope.IsSecretary = rs;
    })
    $rootScope.today = $filter('date')(new Date(), 'dd/MM/yyyy');
    $rootScope.ObjectTypeFile = "RECRUIMENT_SCHEDULE";
    $rootScope.moduleName = "RECRUIMENT";
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

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $locationProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/weekWorkingSchedule/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/',
            {
                templateUrl: ctxfolder + '/manager.html',
                controller: 'manager'
            })
        .when('/manager/', {
            templateUrl: ctxfolder + '/manager.html',
            controller: 'manager'
        })
    //$locationProvider.html5Mode({
    //    enabled: true,
    //    requireBase: false
    //});
    //$locationProvider.hashPrefix('!');
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
    $httpProvider.interceptors.push('interceptors');
    //$httpProvider.interceptors.push('httpResponseInterceptor');
});

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService, $timeout) {
    debugger
    $scope.monday = "";
    $scope.saturday = "";
    $scope.countEventToday = 0;
    $scope.initLoad = function () {
        dataservice.getAll(function (rs) {
            rs = rs.data;
            $scope.model = rs.ListWeek;
            $scope.weekNumber = rs.WeekNumber;
            $scope.monday = rs.FromDate;
            $scope.saturday = rs.ToDate;
        })
        dataservice.getEventToday(function (rs) {
            rs = rs.data;
            $scope.countEventToday = rs;
        })
    }
    $scope.initLoad();
    $scope.addEvent = function () {
        $location.path('/manager/');
    }
});

app.controller('manager', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService) {
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            
        }, function () {
        });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '50',
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
        $confirm({ text: caption.WWS_QUES_DEL, title: caption.WWS_BTN_CONFIRM, ok: caption.WWS_BTN_CONFIRM, cancel: caption.COM_BTN_CANCEL })
            .then(function () {
                dataservice.deleteWorkingSchedule(id, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                    }
                });
            });
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
        var initialLocaleCode = "vi";
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
            locale: initialLocaleCode,
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
                dataservice.getEvent("", function (rs) {
                    rs = rs.data;
                    var event = [];
                    for (var i = 0; i < rs.length; i++) {
                        var obj = {
                            title: rs[i].title,
                            start: rs[i].start,
                            end: rs[i].end,
                            className: rs[i].className,
                            displayEventTime: false,
                            id: rs[i].Id
                        }
                        event.push(obj);
                    }
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                debugger
                $scope.edit(calEvent.id);
            },
        })
        $('#calendar').fullCalendar('option', 'locale', initialLocaleCode);
    }

    setTimeout(function () {
        loadCalendar("calendar");
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.model1 = {
        ListUser: []
    };

    $scope.model = {
        StartDate: '',
        ListUser: '',
        EndDate: '',
        Location: '',
        Content: '',
        Result: ''
    }

    $scope.initData = function () {
        dataservice.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        })
    }

    $scope.initData();

    $scope.submit = function () {
        debugger
        if ($scope.model1.ListUser.length == 0) {
            return App.toastrError(caption.WWS_MSG_SELECT_LIST_USER);
        }
        $scope.model.ListUser = $scope.model1.ListUser.join(',');

        if ($scope.addform.validate()) {
            dataservice.insertWorkingSchedule($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            })
        }
    }

    function loadDate() {
        $("#startDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endDate').datepicker('setStartDate', maxDate);
        });
        $("#endDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#startDate').datepicker('setEndDate', maxDate);
        });
    }

    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $filter, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.model1 = {
        ListUser: []
    };

    $scope.model = {
        StartDate: '',
        ListUser: '',
        EndDate: '',
        Location: '',
        Content: ''
    }

    $scope.initData = function () {
        dataservice.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        })

        dataservice.getItemWorkingSchedule(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            $scope.model1.ListUser = $scope.model.ListUser.split(",");
            $scope.model.StartDate = $filter('date')($scope.model.StartDate, 'dd/MM/yyyy');
            $scope.model.EndDate = $filter('date')($scope.model.EndDate, 'dd/MM/yyyy');
        })
    }

    $scope.initData();

    $scope.submit = function () {
        if ($scope.model1.ListUser.length == 0) {
            return App.toastrError(caption.WWS_MSG_SELECT_LIST_USER);
        }
        $scope.model.ListUser = $scope.model1.ListUser.join(',');

        if ($scope.addform.validate()) {
            dataservice.updateWorkingSchedule($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            })
        }
    }

    function loadDate() {
        $("#startDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endDate').datepicker('setStartDate', maxDate);
        });
        $("#endDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#startDate').datepicker('setEndDate', maxDate);
        });
    }

    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});
