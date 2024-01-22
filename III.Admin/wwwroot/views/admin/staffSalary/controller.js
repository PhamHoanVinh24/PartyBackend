var ctxfolder = "/views/admin/staffSalary";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', 'datatables.colreorder', "pascalprecht.translate", "chart.js", 'ngSanitize', "ngCookies", 'ui.select']);
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
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getAllTotal: function (memberId, month, year, from, to, callback) {
            $http.get('/Admin/StaffSalary/GetAllTotal?memberId=' + memberId + '&month=' + month + '&year=' + year + '&from=' + from + '&to=' + to).then(callback);
        },
        getListUserOfDate: function (date, memberId, callback) {
            $http.get('/Admin/StaffSalary/GetListUserOfDate?dateSearch=' + date + '&memberId=' + memberId).then(callback);
        },
        getListUserLateOfDate: function (date, memberId, callback) {
            $http.post('/Admin/StaffSalary/GetListUserLateOfDate?dateSearch=' + date + '&memberId=' + memberId).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getWorkTimeOfUser: function (from, to, userId, callback) {
            $http.get('/Admin/StaffSalary/GetWorkTimeOfUser?from=' + from + '&to=' + to + '&userId=' + userId).then(callback);
        },
        getEventForDate: function (data, memberId, callback) {
            $http.get('/Admin/StaffSalary/GetEventForDate?date=' + data + '&memberId=' + memberId).then(callback);
        },
        getAllInCalendar: function (data, memberId, callback) {
            $http.post('/Admin/StaffSalary/GetAllInCalendar?dateSearch=' + data + '&memberId=' + memberId).then(callback);
        },
        searchWorkTimeOfUser: function (from, to, userId, callback) {
            $http.get('/Admin/StaffSalary/GetWorkTimeOfUser?from=' + from + '&to=' + to + '&userId=' + userId, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#modal-body",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#modal-body");
                }
            }).then(callback);
        }
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $cookies, $translate, dataservice) {
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
            },
            messages: {
                ActionTime: {
                    required: caption.STL_CURD_VALIDATE_TIME,
                },
            }
        }
        $rootScope.validationOptionsSearchWorkTime = {
            rules: {
                FromDate: {
                    required: true
                },
                ToDate: {
                    required: true
                },
            },
            messages: {
                FromDate: {
                    required: caption.STL_CURD_VALIDATE_FROM_DAY
                },
                ToDate: {
                    required: caption.STL_CURD_VALIDATE_TO_DAY
                },
            }
        }
    });
    $rootScope.dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
   
    dataservice.getListUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
        var all = {
            UserId: '',
            GivenName: caption.STS_TXT_ALL,
            Picture:"/images/default/no_user.png",
        }
        $rootScope.listUser.unshift(all)
    })
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/StaffSalary/Translation');
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        MemberId: '',
        FromDate: '',
        ToDate: ''
    }
    $scope.search = function () {
        if ($scope.model.FromDate != '' || $scope.model.ToDate != '') {
            if ($scope.model.FromDate != '' && $scope.model.ToDate != '') {
                $('#calendar').fullCalendar('refetchEvents');
            } else {
                App.toastrError(caption.STS_ENTER_FROMDATE_TODATE);
            }
        } else {
            $('#calendar').fullCalendar('refetchEvents');
        }
    }
    $scope.statistical = function () {
        dataservice.getWorkTimeOfUser('', '', '', function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/statistical.html',
                    controller: 'statistical',
                    backdrop: 'static',
                    resolve: {
                        para: function () {
                            return {
                                data: rs.Object.Data,
                                user: rs.Object.User
                            };
                        }
                    },
                    size: '70'
                });
                modalInstance.result.then(function (d) {

                }, function () {
                });
            }
        })
    }
    $scope.export = function () {
        location.href = "/Admin/StaffSalary/ExportExcel"
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
    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
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
            dayNames: [caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],
            monthNames: [caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            monthNamesShort: [caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STS_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            dayNamesShort: [caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STS_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],

            buttonText: {
                today: caption.STS_CURD_TAB_WORK_CALENDAR_BTN_TODAY,
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                var month = $('#calendar').fullCalendar('getDate').format('MM');
                var year = $('#calendar').fullCalendar('getDate').format('YYYY');
                dataservice.getAllTotal($scope.model.MemberId, month, year, $scope.model.FromDate, $scope.model.ToDate, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        //select all member
                        if (rs.Object.All) {
                            var event = [];
                            angular.forEach(rs.Object.ListTotal, function (value, key) {
                                var userRegistration = {
                                    title: caption.STS_LBL_NUM_REGISTRATION + ": " + value.CountRegistration,
                                    start: value.Date,
                                    className: 'fc-event-event-azure',
                                    value: 2,
                                    date: value.Date,
                                    displayEventTime: false,
                                    numRegis: value.CountRegistration,
                                    numLate: value.CountLate,
                                    numReal: value.CountReal,
                                }
                                var userLate = {
                                    title: caption.STS_LBL_NUM_LATE_QUIT + ": " + value.CountLate,
                                    start: value.Date,
                                    className: 'fc-event-event-orange',
                                    value: 1,
                                    date: value.Date,
                                    displayEventTime: false,
                                    numRegis: value.CountRegistration,
                                    numLate: value.CountLate,
                                    numReal: value.CountReal,
                                }
                                var userReal = {
                                    title: caption.STS_LBL_NUM_REAL + ": " + value.CountReal,
                                    start: value.Date,
                                    className: 'fc-event-event-orange',
                                    value: 3,
                                    date: value.Date,
                                    displayEventTime: false,
                                    numRegis: value.CountRegistration,
                                    numLate: value.CountLate,
                                    numReal: value.CountReal,
                                }
                                event.push(userReal);
                                event.push(userRegistration);
                                event.push(userLate);
                            })
                            callback(event);
                            if ($scope.model.FromDate != '' || $scope.model.ToDate != '') {
                                gotoDate(rs.Object.ListTotal[rs.Object.ListTotal.length - 1].Date);
                            }
                        }
                        //select one user
                        else {
                            var event = [];
                            angular.forEach(rs.Object.ListTotal, function (value, key) {
                                var userLate = {
                                    title: "Xin muộn nghỉ" + ": " + value.CountLate,
                                    start: value.Date,
                                    className: 'fc-event-event-orange',
                                    value: 1,
                                    date: value.Date,
                                    displayEventTime: false,
                                    numRegis: 1,
                                    numLate: value.CountLate,
                                    numReal: value.CountReal,
                                }
                                var userReal = {
                                    title: "Thực tế" + ": " + value.CountReal,
                                    start: value.Date,
                                    className: 'fc-event-event-orange',
                                    value: 3,
                                    date: value.Date,
                                    displayEventTime: false,
                                    numRegis: 1,
                                    numLate: value.CountLate,
                                    numReal: value.CountReal,
                                }
                                event.push(userReal);
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
                var numRegis = calEvent.numRegis;
                var numLate = calEvent.numLate;
                var numReal = calEvent.numReal;
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.getAllInCalendar(date, $scope.model.MemberId, function (rs) {
                    rs = rs.data;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/listMemberRegistration.html',
                        controller: 'listMemberRegistration',
                        backdrop: 'static',
                        size: '70',
                        resolve: {
                            para: function () {
                                return {
                                    listMember: rs.Object,
                                    date: date,
                                    numRegis: numRegis,
                                    numLate: numLate,
                                    numReal: numReal
                                }
                            }
                        },
                    });
                    modalInstance.result.then(function (d) {

                    }, function () {
                    });
                    App.unblockUI("#contentMain");
                })


                //if (value == 3) {
                //    dataservice.getListUserOfDate(date, $scope.model.MemberId, function (rs) {
                //        rs = rs.data;

                //        var modalInstance = $uibModal.open({
                //            animation: true,
                //            templateUrl: ctxfolder + '/listInOutofDate.html',
                //            controller: 'listInOutofDate',
                //            backdrop: 'static',
                //            size: '50',
                //            resolve: {
                //                para: function () {
                //                    return {
                //                        ListInOut: rs,
                //                        Date: date
                //                    };
                //                }
                //            }
                //        });
                //        modalInstance.result.then(function (d) {

                //        }, function () {
                //        });

                //    });
                //} else if (value == 2) {
                //    dataservice.getEventForDate(date, "",function (rs) {
                //        rs = rs.data;
                //        if (!rs.Error) {
                //            var modalInstance = $uibModal.open({
                //                animation: true,
                //                templateUrl: ctxfolder + '/listMemberRegistration.html',
                //                controller: 'listMemberRegistration',
                //                backdrop: 'static',
                //                size: '50',
                //                resolve: {
                //                    para: function () {
                //                        return {
                //                            listMember: rs.Object,
                //                            date: date
                //                        }
                //                    }
                //                }
                //            });
                //            modalInstance.result.then(function (d) {

                //            }, function () {
                //            });
                //        } else {
                //            App.toastrError(rs.Title);
                //        }
                //    });
                //} else if (value == 1) {
                //    dataservice.getListUserLateOfDate(date, $scope.model.MemberId, function (rs) {
                //        rs = rs.data;
                //        var modalInstance = $uibModal.open({
                //            animation: true,
                //            templateUrl: ctxfolder + '/listUserLate.html',
                //            controller: 'listUserLate',
                //            backdrop: 'static',
                //            size: '50',
                //            resolve: {
                //                para: function () {
                //                    return {
                //                        ListUserLate: rs,
                //                        Date: date
                //                    };
                //                }
                //            }
                //        });
                //        modalInstance.result.then(function (d) {

                //        }, function () {
                //        });
                //    });
                //}

            },
            eventRender: function (event, element) {
                var content = element.find('.fc-content');
                content.addClass('fc-content-dynamic');
            }
        })
    }
    function gotoDate(date) {
        if (!$rootScope.isNext) {
            $('#calendar').fullCalendar('gotoDate', date);
        }
    }
    setTimeout(function () {
        loadCalendar("calendar");
        loadDate();
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
    }, 200);
});
app.controller('listInOutofDate', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.listInOut = [];
    $scope.init = function () {
        
        $scope.listInOut = para.ListInOut.Object;
        $scope.date = para.Date;
    }
    $scope.init();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});
app.controller('statistical', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, $timeout, para) {
    $scope.WorkTime = {
        labels: [],
        data: [],
        date: [],
        user: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.optionsWorkTime = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    //var label = $scope.workProgress.worked[tooltipItem.index] || '';
                    //var date = $scope.workProgress.date[tooltipItem.index] || '';

                    //if (label) {
                    //    label += " vào ngày " + date;
                    //} else {
                    //    label += "Không có kế hoạch công việc vào ngày " + date;
                    //}
                    //var percent = Math.round(tooltipItem.yLabel * 100) / 100 + "%";
                    //return [label, 'Tỷ lệ: ' + percent];;
                }
            },
        },
        animation: {
            duration: 100,
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(11, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.data.datasets.forEach(function (dataset) {
                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                            scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
                        ctx.fillStyle = '#444';
                        var y_pos = model.y - 5;
                        // Make sure data value does not get overflown and hidden
                        // when the bar's value is too close to max value of scale
                        // Note: The y value is reverse, it counts from top down
                        if ((scale_max - model.y) / scale_max >= 0.93)
                            y_pos = model.y + 20;
                        //if (dataset.data[i] != 0) {
                        ctx.fillText(Math.round(dataset.data[i] * 100) / 100, model.x, y_pos);
                        //}
                    }
                });
            }
        },
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true // minimum will be 0, unless there is a lower value.
                    // OR //
                }
            }]
        },
        //legend: { display: true },
        responsive: true,
    };
    $scope.searchStatistical = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/searchStatistical.html',
            controller: 'searchStatistical',
            backdrop: 'static',
            size: '30'
        });
        modalInstance.result.then(function (d) {
            
            $scope.WorkTime.labels = [];
            $scope.WorkTime.data = [[]];
            $scope.WorkTime.date = [];
            $scope.WorkTime.user = d.User;
            for (var i = 0; i < d.WorkTime.length; i++) {
                $scope.WorkTime.labels.push($filter('date')(new Date(d.WorkTime[i].Date), 'dd/MM/yyyy'));
                $scope.WorkTime.date.push($filter('date')(new Date(d.WorkTime[i].Date), 'dd/MM/yyyy'));
                $scope.WorkTime.data[0].push(d.WorkTime[i].TimeWork);
            }
        }, function () {
        });
    }
    function loadData() {
        $scope.WorkTime.user = para.user;
        for (var i = 0; i < para.data.length; i++) {
            $scope.WorkTime.labels.push($filter('date')(new Date(para.data[i].Date), 'dd/MM/yyyy'));
            $scope.WorkTime.data.push(para.data[i].TimeWork);
        }
        console.log($scope.WorkTime);
    }
    $timeout(function () {
        setModalMaxHeight('.modal');
        loadData();
        setModalDraggable('.modal-dialog');
    }, 50);
});
//workProgress
app.controller('searchStatistical', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        FromDate: '',
        ToDate: '',
        UserId: '',
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.searchform.validate() && !validationSelect($scope.model).Status) {
            dataservice.searchWorkTimeOfUser($scope.model.FromDate, $scope.model.ToDate, $scope.model.UserId, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var obj = {
                        User: rs.Object.User,
                        WorkTime: rs.Object.Data
                    }
                    $uibModalInstance.close(obj);
                }
            });
        }
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUser = false;
        }
    }
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            endDate: new Date(),
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            var maxDate = addMonths(new Date(selected.date.valueOf()), 1);
            $('#DateTo').datepicker('setStartDate', minDate);
            $('#DateTo').datepicker('setEndDate', maxDate);

            $('#DateTo').datepicker('setEndDate', new Date());
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            endDate: new Date(),
            format: "dd/mm/yyyy",
            todayHighlight: true,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            var minDate = addMonths(new Date(selected.date.valueOf()), -2);
            $('#FromTo').datepicker('setEndDate', maxDate);
            $('#FromTo').datepicker('setStartDate', minDate);
            $('#FromTo').datepicker('setEndDate', new Date());
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setStartDate', null);
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
            $('#DateTo').datepicker('setEndDate', null);
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.UserId == "" || data.UserId == null) {
            $scope.errorUser = true;
            mess.Status = true;
        } else {
            $scope.errorUser = false;
        }
        return mess;
    };
    $timeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 100);
});
app.controller('listMemberRegistration', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        
        $scope.listMember = para.listMember;
        $scope.date = para.date
        $scope.numRegis = para.numRegis
        $scope.numLate = para.numLate
        $scope.numReal = para.numReal
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
app.controller('listUserLate', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        
        $scope.listUserLate = para.ListUserLate;
        $scope.date = para.Date;
    }
    $scope.init();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 200);
});