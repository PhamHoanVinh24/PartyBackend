var ctxfolder = "/views/admin/companyEvent";
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
        getItem: function (data, callback) {
            $http.post('/Admin/CMSItem/GetItem', data).then(callback);
        },

        getEvent: function (data, callback) {
            $http.get('/Admin/CompanyEvent/GetEvent?type=' + data).then(callback)
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
            //max: 'Max some message {0}'
        });
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CompanyEvent/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
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
                dataservice.getItem(calEvent.id, function (rs) {
                    rs = rs.data;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/viewCmsItem.html',
                        controller: 'viewCmsItem',
                        backdrop: 'static',
                        size: '60',
                        resolve: {
                            para: function () {
                                return rs;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {

                    }, function () {
                    });
                })
            },
        })
        $('#calendar').fullCalendar('option', 'locale', initialLocaleCode);
    }

    setTimeout(function () {
        loadCalendar("calendar");
    }, 200);
});



app.controller('viewCmsItem', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = para;
    setTimeout(function () {
        $('#cmsViewItem').html($scope.model.full_text);
        setModalDraggable('.modal-dialog');
    }, 200)
});
