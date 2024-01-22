var ctxfolder = "/views/admin/calendarCandidate";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "ngCookies", "pascalprecht.translate"]);

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
        getListCandidate: function (callback) {
            $http.post('/Admin/CalendarCandidate/GetListCandidate').success(callback);
        },
        getEventCat: function (data, callback) {
            $http.post('/Admin/CalendarCandidate/GetEventCat', data).success(callback);
        },
        changeFrametimeCadidate: function (id, frame, callback) {
            $http.post('/Admin/CandidatesManagement/ChangeFrametimeCadidate/?id=' + id + "&frame=" + frame).success(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.dateNow = new Date();
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    //$translateProvider.preferredLanguage('en-US');
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


app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        FromDate: $filter('date')(addDay(new Date(), -3), 'dd/MM/yyyy'),
        ToDate: $filter('date')(addDay(new Date(), 3), 'dd/MM/yyyy'),
    };
    $scope.initLoad = function () {
        dataservice.getListCandidate(function (rs) {
            $scope.listCandidateData = rs;
        });
    }
    $scope.initLoad();


    $scope.search = function () {
        dataservice.getEventCat($scope.model, function (rs) {
            var event = [];
            debugger
            angular.forEach(rs, function (value, key) {
                var calendar = value.FrameTime.split(';');
                var morning = calendar[0] == 'True' ? 'S' : '';
                var afternoon = calendar[1] == 'True' ? 'C' : '';
                var evening = calendar[2] == 'True' ? 'T' : '';
                var schedule = '';
                schedule += morning != '' ? morning : '';
                if (afternoon != '') {
                    schedule += '/';
                }
                schedule += afternoon != '' ? afternoon : '';
                if (evening != '') {
                    schedule += '/';
                }
                schedule += evening != '' ? evening : '';
                var obj = {
                    title: value.Fullname + ' - ' + schedule,
                    start: value.DatetimeEvent,
                    className: 'fc-event-event-azure',
                    candidateCode: value.CandidateCode,
                    fullName: value.Fullname,
                    allDay: true,
                    id: value.Id,
                }
                event.push(obj);
            })
            if (event.length != 0) {
                $('#calendar').fullCalendar('removeEvents');
                $('#calendar').fullCalendar('addEventSource', event);
            } else {
                App.toastrError("Không tìm thấy người đăng ký");
            }
        })
    }
    function initCalendar(id) {
        $('#' + id).fullCalendar({
            eventLimit: true,
            header: {
                left: 'prev,next, today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            buttonText: {
                today: caption.CI_BTN_TODAY,
                icon: 'far fa-calendar-check'
            },
            dayNames: [caption.CI_COL_DAY_NAME_SUNDAY, caption.CI_COL_DAY_NAME_MONDAY, caption.CI_COL_DAY_NAME_TUESDAY, caption.CI_COL_DAY_NAME_WEDNESDAY, caption.CI_COL_DAY_NAME_THURSDAY, caption.CI_COL_DAY_NAME_FRIDAY, caption.CI_COL_DAY_NAME_SATURDAY],
            monthNames: [caption.CI_LBL_MONTH_NAME_JAN + ' - ', caption.CI_LBL_MONTH_NAME_FEB + ' - ', caption.CI_LBL_MONTH_NAME_MAR + ' - ', caption.CI_LBL_MONTH_NAME_APR + ' - ', caption.CI_LBL_MONTH_NAME_MAY + ' - ', caption.CI_LBL_MONTH_NAME_JUNE + ' - ', caption.CI_LBL_MONTH_NAME_JULY + ' - ', caption.CI_LBL_MONTH_NAME_AUG + ' - ', caption.CI_LBL_MONTH_NAME_SEPT + ' - ', caption.CI_LBL_MONTH_NAME_OCT + ' - ', caption.CI_LBL_MONTH_NAME_NOV + ' - ', caption.CI_LBL_MONTH_NAME_DEC + ' - '],
            monthNamesShort: [caption.CI_LBL_MONTH_NAME_JAN + ' - ', caption.CI_LBL_MONTH_NAME_FEB + ' - ', caption.CI_LBL_MONTH_NAME_MAR + ' - ', caption.CI_LBL_MONTH_NAME_APR + ' - ', caption.CI_LBL_MONTH_NAME_MAY + ' - ', caption.CI_LBL_MONTH_NAME_JUNE + ' - ', caption.CI_LBL_MONTH_NAME_JULY + ' - ', caption.CI_LBL_MONTH_NAME_AUG + ' - ', caption.CI_LBL_MONTH_NAME_SEPT + ' - ', caption.CI_LBL_MONTH_NAME_OCT + ' - ', caption.CI_LBL_MONTH_NAME_NOV + ' - ', caption.CI_LBL_MONTH_NAME_DEC + ' - '],
            dayNamesShort: [caption.CI_COL_DAY_NAME_SUNDAY, caption.CI_COL_DAY_NAME_MONDAY, caption.CI_COL_DAY_NAME_TUESDAY, caption.CI_COL_DAY_NAME_WEDNESDAY, caption.CI_COL_DAY_NAME_THURSDAY, caption.CI_COL_DAY_NAME_FRIDAY, caption.CI_COL_DAY_NAME_SATURDAY],
            events: function (start, end, timezone, callback) {
                var obj = {
                    FromDate: '',
                    ToDate: ''
                }
                dataservice.getEventCat(obj, function (rs) {
                    var event = [];
                    angular.forEach(rs, function (value, key) {
                        var calendar = value.FrameTime.split(';');
                        var morning = calendar[0] == 'True' ? 'S' : '';
                        var afternoon = calendar[1] == 'True' ? 'C' : '';
                        var evening = calendar[2] == 'True' ? 'T' : '';
                        var schedule = '';
                        schedule += morning != '' ? morning : '';
                        if (afternoon != '') {
                            schedule += '/';
                        }
                        schedule += afternoon != '' ? afternoon : '';
                        if (evening != '') {
                            schedule += '/';
                        }
                        schedule += evening != '' ? evening : '';
                        var obj = {
                            title: value.Fullname + ' - ' + schedule,
                            start: value.DatetimeEvent,
                            className: 'fc-event-event-azure',
                            candidateCode: value.CandidateCode,
                            fullName: value.Fullname,
                            allDay: true,
                            id: value.Id,
                        }
                        event.push(obj);
                    })
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/detailRegistration.html',
                    controller: 'detailRegistration',
                    backdrop: 'static',
                    size: '35',
                    resolve: {
                        para: function () {
                            return {
                                candidateCode: calEvent.candidateCode,
                                fullName: calEvent.fullName
                            }
                        }
                    }
                });
                modalInstance.result.then(function (d) {

                }, function () {
                });
            },
            eventRender: function (calEvent, element) {
            },
        })
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
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
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
        showHideSearch();
        initCalendar("calendar");
        loadDate();
    }, 100);
});
app.controller('detailRegistration', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $uibModalInstance, $filter, $timeout, para) {
    var vm = $scope;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CandidatesManagement/GetEventCatGrid",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CandidateCode = para.candidateCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('DatetimeEvent').withTitle('Ngày').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Morning').withTitle('Sáng').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0) && full.FrameTime.split(';')[0] == "True") {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[0] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 1 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Afternoon').withTitle('Chiều').renderWith(function (data, type, full) {
        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0) && full.FrameTime.split(';')[1] == "True") {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';

        } else {
            return full.FrameTime.split(';')[1] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 2 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Evening').withTitle('Tối').renderWith(function (data, type, full) {

        var dateRegistraion = (new Date(full.DatetimeEvent)).getDay();
        if ((dateRegistraion == 6 || dateRegistraion == 0) && full.FrameTime.split(';')[2] == "True") {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px;background-color:#fc9600;color:#fff""><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        } else {
            return full.FrameTime.split(';')[2] == "True" ? '<button class="btn btn-circle btn-icon-only green" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-check"></i></button>' :
                '<button class="btn btn-circle btn-icon-only red" ng-click="changeStatusFrameTime(' + full.Id + ',' + 3 + ')" style="padding: 0px; width: 25px; height: 25px"><i class="fa fa-times" style="color: #ffffff"></i></button>';
        }
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {}
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    $scope.init = function () {
        $scope.fullName = para.fullName;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.changeStatusFrameTime = function (eventId, frameTime) {
        dataservice.changeFrametimeCadidate(eventId, frameTime, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                reloadData(false);
            }
        });
    }
    $timeout(function () {
        setModalDraggable('.modal-dialog');
    }, 100);
});

