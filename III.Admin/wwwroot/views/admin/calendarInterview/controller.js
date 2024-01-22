var ctxfolder = "/views/admin/calendarInterview";
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
        $http(req).success(callback);
    };
    return {
        getUserCandidate: function (callback) {
            $http.post('/Admin/CalendarInterview/GetUserCandidate').success(callback);
        },
        getItemCandidate: function (data, callback) {
            $http.get('/Admin/CalendarInterview/GetItemCandidate?candidateCode=' + data).success(callback);
        },
        getInterviewDate: function (data, callback) {
            $http.post('/Admin/CalendarInterview/GetInterviewDate/', data).success(callback);
        },
        getCandidateInterviewDate: function (data, callback) {
            $http.get('/Admin/CalendarInterview/GetCandidateInterviewDate?dateSearch=' + data).success(callback);
        },
        setInterviewDate: function (data, callback) {
            $http.post('/Admin/CalendarInterview/SetInterviewDate/', data).success(callback);
        },
        getLanguage: function (data, callback) {
            $http.get('/Admin/CalendarInterview/GetItemLanguage?langCode=' + data).success(callback);
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
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        FromDate: $filter('date')(addDay(new Date(), -3), 'dd/MM/yyyy'),
        ToDate: $filter('date')(addDay(new Date(), 3), 'dd/MM/yyyy'),
    };
    $scope.search = function () {
        dataservice.getInterviewDate($scope.model, function (rs) {
            var event = [];
            angular.forEach(rs, function (value, key) {
                var obj = {
                    title: value.Fullname,
                    start: value.InterviewDate,
                    className: (new Date(value.InterviewDateCompare) > new Date()) ? 'fc-event-event-pink' : 'fc-event-event-default',
                    candidateCode: value.CandidateCode,
                }
                event.push(obj);
            })
            if (event.length != 0) {
                $('#calendar-interview').fullCalendar('removeEvents');
                $('#calendar-interview').fullCalendar('addEventSource', event);
            } else {
                App.toastrError("Không tìm thấy lịch phỏng vấn");
            }
        })
    };
    $scope.registrationInterview = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/registration.html',
            controller: 'registration',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $('#calendar-interview').fullCalendar('refetchEvents');
        }, function () { });
    }
    function initCalendar(id) {
        $('#' + id).fullCalendar({
            editable: true,
            eventLimit: true,
            selectable: true,
            header: {
                left: 'prev,next, today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            buttonText: {
                today: caption.CI_BTN_TODAY,
                icon: 'far fa-calendar-check'
            },
            timeFormat: 'H:mm',
            dayNames: [caption.CI_COL_DAY_NAME_SUNDAY, caption.CI_COL_DAY_NAME_MONDAY, caption.CI_COL_DAY_NAME_TUESDAY, caption.CI_COL_DAY_NAME_WEDNESDAY, caption.CI_COL_DAY_NAME_THURSDAY, caption.CI_COL_DAY_NAME_FRIDAY, caption.CI_COL_DAY_NAME_SATURDAY],
            monthNames: [caption.CI_LBL_MONTH_NAME_JAN + ' - ', caption.CI_LBL_MONTH_NAME_FEB + ' - ', caption.CI_LBL_MONTH_NAME_MAR + ' - ', caption.CI_LBL_MONTH_NAME_APR + ' - ', caption.CI_LBL_MONTH_NAME_MAY + ' - ', caption.CI_LBL_MONTH_NAME_JUNE + ' - ', caption.CI_LBL_MONTH_NAME_JULY + ' - ', caption.CI_LBL_MONTH_NAME_AUG + ' - ', caption.CI_LBL_MONTH_NAME_SEPT + ' - ', caption.CI_LBL_MONTH_NAME_OCT + ' - ', caption.CI_LBL_MONTH_NAME_NOV + ' - ', caption.CI_LBL_MONTH_NAME_DEC + ' - '],
            monthNamesShort: [caption.CI_LBL_MONTH_NAME_JAN + ' - ', caption.CI_LBL_MONTH_NAME_FEB + ' - ', caption.CI_LBL_MONTH_NAME_MAR + ' - ', caption.CI_LBL_MONTH_NAME_APR + ' - ', caption.CI_LBL_MONTH_NAME_MAY + ' - ', caption.CI_LBL_MONTH_NAME_JUNE + ' - ', caption.CI_LBL_MONTH_NAME_JULY + ' - ', caption.CI_LBL_MONTH_NAME_AUG + ' - ', caption.CI_LBL_MONTH_NAME_SEPT + ' - ', caption.CI_LBL_MONTH_NAME_OCT + ' - ', caption.CI_LBL_MONTH_NAME_NOV + ' - ', caption.CI_LBL_MONTH_NAME_DEC + ' - '],
            dayNamesShort: [caption.CI_COL_DAY_NAME_SUNDAY, caption.CI_COL_DAY_NAME_MONDAY, caption.CI_COL_DAY_NAME_TUESDAY, caption.CI_COL_DAY_NAME_WEDNESDAY, caption.CI_COL_DAY_NAME_THURSDAY, caption.CI_COL_DAY_NAME_FRIDAY, caption.CI_COL_DAY_NAME_SATURDAY],
            events: function (start, end, timezone, callback) {
                var obj = {
                    FromDate: '',
                    ToDate: ''
                }
                dataservice.getInterviewDate(obj, function (rs) {
                    var event = [];
                    angular.forEach(rs, function (value, key) {
                        var obj = {
                            title: value.Fullname,
                            start: value.InterviewDate,
                            className: (new Date(value.InterviewDate) > new Date()) ? 'fc-event-event-pink' : 'fc-event-event-default',
                            candidateCode: value.CandidateCode,
                            interView: value.InterviewDate,
                        }
                        event.push(obj);
                    })
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                dataservice.getItemCandidate(calEvent.candidateCode, function (rs) {
                    debugger
                    dataservice.getLanguage(rs.Object.LanguageUse, function (resul) {
                        rs.Object.LanguageUse = resul;
                    });
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/candidateDetail.html',
                            controller: 'candidateDetail',
                            backdrop: 'static',
                            size: '35',
                            resolve: {
                                para: function () {
                                    return {
                                        interView: calEvent.interView,
                                        detail: rs.Object
                                    }
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {

                        }, function () {
                        });
                    }
                })
            },
            dayClick: function (date, jsEvent, view) {
                date = $filter('date')(date._d, 'dd/MM/yyyy')
                dataservice.getCandidateInterviewDate(date, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/listCandidateInterview.html',
                            controller: 'listCandidateInterview',
                            backdrop: 'static',
                            size: '35',
                            resolve: {
                                para: function () {
                                    return rs;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {

                        }, function () {
                        });
                    }
                })
            },
        })
    }
    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
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
        $(".interview-date").datetimepicker({
            startDate: new Date(),
            autoclose: true
        });
    }
    setTimeout(function () {
        loadDate();
        initCalendar("calendar-interview");
    }, 200);
});

app.controller('registration', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.interview = {
        CandidateCode: '',
        InterviewDate: ''
    };
    $scope.init = function () {
        dataservice.getUserCandidate(function (rs) {
            $scope.listCandidate = rs;
        })
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.interview.CandidateCode == '' || $scope.interview.InterviewDate == '') {
            App.toastrError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        dataservice.setInterviewDate($scope.interview, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
    }
    function loadDate() {
        $(".interview-date").datetimepicker({
            startDate: new Date(),
            autoclose: true
        });
    }
    setTimeout(function () {
        loadDate();
    }, 500);
});
app.controller('candidateDetail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, $timeout, $filter, dataservice, para) {
    $scope.init = function () {
        $scope.model = para.detail;
        dataservice.getCandidateInterviewDate($filter('date')(para.interView, 'dd/MM/yyyy'), function (rs) {
            $scope.listCandidateInterview = rs;
        })
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $timeout(function () {
        setModalDraggable('.modal-dialog');
    }, 100);
});
app.controller('listCandidateInterview', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, $timeout, para) {
    $scope.init = function () {
        $scope.listCandidateInterview = para;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $timeout(function () {
        setModalDraggable('.modal-dialog');
    }, 100);
});