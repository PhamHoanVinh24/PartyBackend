var ctxfolder = "/views/admin/projectEvents";
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
        getAllEvent: function (callback) {
            $http.get('/Admin/SupplierEvents/GetAllEvent/').then(callback);
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
    $translateProvider.useUrlLoader('/Admin/ProjectEvents/Translation');
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