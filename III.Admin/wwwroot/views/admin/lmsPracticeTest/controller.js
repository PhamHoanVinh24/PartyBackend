var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderLmsPracticeTest = "/views/admin/lmsPracticeTest";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_EDU_EXAM', ['App_ESEIM_LMS_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'youtube-embed', 'FBAngular'])
    .directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
    });

app.directive('customOnChangeSupplier', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeSupplier);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});
app.directive('fabricCanvasTest', function ($parse, $timeout) {
    return {
        restrict: 'A',
        scope: {
            fabricCanvas: '=',
            obj: '=ngModel',
            handler: '&handler'
        },
        link: function (scope, el, attrs) {
            var innerCanvas = el[0].querySelector('canvas');
            var outerWidth = el.outerWidth();
            var canvas = new fabric.Canvas(innerCanvas, { width: outerWidth - 10, height: 400 });
            scope.obj.canvas = canvas;
            var listCheckAnswer = [];
            scope.obj.listCheckAnswer = listCheckAnswer;
            var index = scope.obj.index;
            var results_pair = [];
            scope.obj.resultPairs = results_pair;
            scope.handler({ index: index });
        }
    };
});
app.directive('fabricCanvasExercise', function ($timeout, $parse) {
    return {
        restrict: 'A',
        scope: {
            fabricCanvas: '=',
            obj: '=ngModel',
            handler: '&handler'
        },
        link: function (scope, el, attrs) {
            var innerCanvas = el[0].querySelector('canvas');
            var lmsCourse = angular.element(document).find('.lms-courses');
            var outerWidth = lmsCourse.outerWidth();
            console.log(outerWidth);
            var canvas = new fabric.Canvas(innerCanvas, { width: outerWidth - 80, height: 400 });
            scope.obj.canvas = canvas;
            var listCheckAnswer = [];
            scope.obj.listCheckAnswer = listCheckAnswer;
            var index = scope.obj.index;
            var results_pair = [];
            scope.obj.resultPairs = results_pair;
            scope.handler({ index: index });
        }
    }
});
app.directive('sameHeightSpecial', function ($timeout, $parse) {
    return {
        restrict: 'AE',
        link: function (scope, element, attrs) {
            var selector = attrs.sameHeightSpecial;
            var currentMaxHeight = 0;
            scope.$watch($parse(attrs.trigger), function (newval) {
                if (newval == true) {
                    $children = element.parent().find(selector);/*.querySelector(selector);*/
                    $timeout(function () {
                        if ($children) {
                            angular.forEach($children, function (child) {
                                var childHeight = $(child).outerHeight();
                                console.log(childHeight);

                                if (childHeight > currentMaxHeight) {
                                    currentMaxHeight = childHeight;
                                }
                            });
                            // set heights
                            $children.css({ height: currentMaxHeight });
                        }
                    }, 500);
                }
            });
        }
    }
});
app.directive('sameHeight', function ($timeout, $parse) {
    return {
        restrict: 'AE',
        link: function (scope, element, attrs) {
            var selector = attrs.sameHeight;
            var currentMaxHeight = 0;
            $timeout(function () {
                if (scope.$last) {
                    $children = element.parent().find(selector);/*.querySelector(selector);*/
                    if ($children) {
                        angular.forEach($children, function (child) {
                            var childHeight = $(child).outerHeight();
                            console.log(childHeight);

                            if (childHeight > currentMaxHeight) {
                                currentMaxHeight = childHeight;
                            }
                        });
                        // set heights
                        $children.css({ height: currentMaxHeight });
                    }
                    //var elementHeight = element.height();
                }
            });
        }
    }
});

app.factory('dataserviceEduExam', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callbackExam) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        $http(req).then(callbackExam);
    };
    var submitFormUpload1 = function (url, data, callbackExam) {
        var formData = new FormData();
        formData.append("FileUpload", data.FileUpload);
        formData.append("file_name", data.FileName);
        formData.append("file_type", data.FileType);
        formData.append("title", data.title);
        formData.append("title_attribute", data.title_attribute);
        formData.append("item_id", data.item_id);
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: formData
        }
        $http(req).then(callbackExam);
    };
    return {
        insert: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/Insert/', data).then(callbackExam);
        },
        update: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/Update/', data).then(callbackExam);
        },
        getItem: function (data, data1, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetItem?id=' + data + '&taskCode=' + data1).then(callbackExam);
        },
        getListSubject: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListSubject').then(callback);
        },
        getListSubjectWithPage: function (data, data1, data2, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetListSubject?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callbackExam);
        },
        getSingleSubject: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetSingleSubject?subjectCode=' + data).then(callbackExam);
        },
        delete: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/Delete?id=' + data).then(callbackExam);
        },
        getListExamInheritance: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetListExamInheritance?code=' + data).then(callbackExam);
        },
        getListQuestion: function (data, data1, data2, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetListQuestion?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callbackExam);
        },
        getListDetail: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetListDetail?practiceTestCode=' + data).then(callbackExam);
        },
        getListDetailQuiz: function (data, data1, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetListDetailQuiz?practiceTestCode=' + data + '&sessionCode=' + data1).then(callbackExam);
        },
        insertQuestion: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/InsertQuestion/', data).then(callbackExam);
        },
        logSession: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/LogSession/', data).then(callbackExam);
        },
        deleteQuestion: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/DeleteQuestion?id=' + data).then(callbackExam);
        },
        trackDilligence: function (data, callback) {
            $http.post('/Admin/LmsPracticeTest/TrackDilligence/', data).then(callback);
        },
        updateDoingPracticeProgress: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/UpdateDoingPracticeProgress/', data).then(callbackExam);
        },
        getListDetailQuizAssignment: function (data, data1, callback) {
            $http.post('/Admin/LmsAssignment/GetListDetailQuiz?lectureCode=' + data + '&sessionCode=' + data1).then(callback);
        },
        getEvent: function (data, callback) {
            $http.get('/Admin/LmsPracticeTest/GetEvent?type=' + data).then(callback);
        },
        updateDoingExerciseProgress: function (data, callback) {
            $http.post('/Admin/LmsAssignment/UpdateDoingExerciseProgress?id=' + data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getListClass: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListClass').then(callback);
        },
        getListUserOfClass: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListUserOfClass?classCode=' + data).then(callback);
        },
        getCountQuiz: function (callback) {
            $http.post('/Admin/LmsDashBoard/CountPracticeAssignAndVoluntary').then(callback);
        },
        //share
        getListUserConnected: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListUserConnected').then(callback);
        },
        getUserSharePracticeTestPermission: function (data, callback) {
            $http.post('/Admin/LmsPracticeTest/GetUserSharePracticeTestPermission?id=' + data).then(callback);
        },
        updatePracticeTestPermission: function (data, callback) {
            $http.post('/Admin/LmsPracticeTest/UpdatePracticeTestPermission/', data).then(callback);
        },
        //ref
        insertQuizRef: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/InsertQuizRef', data).then(callback);
        },
        updateQuizRef: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/UpdateQuizRef', data).then(callback);
        },
        deleteQuizRef: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/DeleteQuizRef?id=' + data).then(callback);
        },
        getQuizRef: function (data, callback) {
            $http.post('/Admin/LmsDashBoard/GetQuizRef?quizCode=' + data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_EDU_EXAM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceEduExam, $cookies, $translate) {
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
            //min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.CurrencyCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.FCC_MSG_ITEM_CODE, "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Code: {
                    required: true,
                    regx: /^[^\s].*/
                },
                Title: {
                    required: true,
                    regx: /^[^\s].*/
                },
                Duration: {
                    required: true,
                    regx: /^[^\s].*/
                },
                MarkPass: {
                    required: true
                },
            },
            messages: {
                Code: {
                    required: caption.LMS_PRACTICE_TEST_MSG_REQUIRED_CODE,
                    regx: caption.LMS_PRACTICE_TEST_MSG_CODE_NO_SPACE
                },
                Title: {
                    required: caption.LMS_PRACTICE_TEST_MSG_REQUIRED_TITLE,
                    regx: caption.LMS_PRACTICE_TEST_MSG_TITLE_NO_SPACE
                },
                Duration: {
                    required: caption.LMS_PRACTICE_TEST_MSG_REQUIRED_TIME,
                    regx: caption.LMS_PRACTICE_TEST_MSG_TIME_NO_SPACE
                },
                MarkPass: {
                    required: caption.LMS_PRACTICE_TEST_MSG_REQUIRED_MARK_PASS
                },
            }
        }
        $rootScope.validationOptionsDetail = {
            rules: {
                Duration: {
                    required: true,
                    regx: /^[^\s].*/
                },
                Order: {
                    required: true
                },
                Mark: {
                    required: true
                },
            },
            messages: {
                Duration: {
                    required: caption.LMS_PRACTICE_TEST_MSG_REQUIRED_TIME,
                    regx: caption.LMS_PRACTICE_TEST_MSG_TIME_NO_SPACE
                },
                Order: {
                    required: caption.LMS_PRACTICE_TEST_MSG_REQUIRED_MARK_PASS
                },
                MarkPass: {
                    required: caption.LMS_PRACTICE_TEST_MSG_REQUIRED_MARK_PASS
                },
            }
        }
        $rootScope.listUnit = [
            {
                Code: "MINUTE",
                Name: "Phút"
            }, {
                Code: "HOUR",
                Name: "Giờ"
            },];
    });
    $rootScope.isAdded = false;
    $rootScope.pageQ = 1;
    $rootScope.pageSizeQ = 10;
    $rootScope.pageS = 1;
    $rootScope.pageSizeS = 10;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $translateProvider.useUrlLoader('/Admin/LmsPracticeTest/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: /*ctxfolderLmsDashBoard + '/index.html'*/ctxfolderLmsPracticeTest + '/index.html',
            controller: 'indexPracticeTest'
        })
        .when('/assignmentPractice/', {
            templateUrl: ctxfolderLmsPracticeTest + '/index.html',
            controller: 'assignmentPractice'
        })
        .when('/possessAndSharePractice/', {
            templateUrl: ctxfolderLmsPracticeTest + '/index.html',
            controller: 'possessAndSharePractice'
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

app.controller('indexPracticeTest', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceEduExam, $translate, $window, $filter) {
    $("#breadcrumb").addClass('hidden');
    $("#breadcrumbIndex").appendTo("#breadcrumb-container");
    $(document).ready(function () {
        $("#sb-left-practice-menu").addClass("open");
    });
    var vm = $scope;
    $scope.model = {
        Title: '',
        FromDate: '',
        ToDate: '',
        Subject: '',
        OnlyAssignment: false,
        IsSharedAndEditable: true,
        GroupBySubject: false
    };
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.isShow = false;
    $scope.showList = function () {
        if (!$scope.isShow) {
            $scope.isShow = true;
        } else {
            $scope.isShow = false;
        }
    }
    $("#FromDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#ToDate').datepicker('setStartDate', maxDate);
    });
    $("#ToDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#FromDate').datepicker('setEndDate', maxDate);
    });

    function loadCalendar(id) {
        $('#' + id).fullCalendar({
            defaultView: 'month',
            selectable: true,
            editable: true,
            eventLimit: true,
            fixedWeekCount: false,
            //aspectRatio: 2,
            header: {
                left: 'prev,next,today',
                right: 'prevYear, nextYear',
                center: 'title',
            },
            dayNames: [caption.STL_COL_DATE_SUNDAY, caption.STL_COL_DATE_MONDAY, caption.STL_COL_DATE_TUESDAY, caption.STL_COL_DATE_WEDNESDAY, caption.STL_COL_DATE_THUSDAY, caption.STL_COL_DATE_FRIDAY, caption.STL_COL_DATE_STATURDAY],
            monthNames: [caption.STL_MONTH_JANUARY + ' - ', caption.STL_MONTH_FEBRUARY + ' - ', caption.STL_MONTH_MARCH + ' - ', caption.STL_MONTH_APRIL + ' - ', caption.STL_MONTH_MAY + ' - ', caption.STL_MONTH_JUNE + ' - ', caption.STL_MONTH_JULY + ' - ', caption.STL_MONTH_AUGUST + ' - ', caption.STL_MONTH_SEPTEMBER + ' - ', caption.STL_MONTH_OCTOBER + ' - ', caption.STL_MONTH_NOVEMBER + ' - ', caption.STL_MONTH_DECEMBER + ' - '],
            monthNamesShort: [caption.STL_MONTH_JAN + ' - ', caption.STL_MONTH_FEB + ' - ', caption.STL_MONTH_MAR + ' - ', caption.STL_MONTH_APR + ' - ', caption.STL_MONTH_MA + ' - ', caption.STL_MONTH_JUN + ' - ', caption.STL_MONTH_JUL + ' - ', caption.STL_MONTH_AUG + ' - ', caption.STL_MONTH_SEPT + ' - ', caption.STL_MONTH_OCT + ' - ', caption.STL_MONTH_NOV + ' - ', caption.STL_MONTH_DEC + ' - '],
            dayNamesShort: [caption.STL_COL_DATE_SUN, caption.STL_COL_DATE_MON, caption.STL_COL_DATE_TUE, caption.STL_COL_DATE_WED, caption.STL_COL_DATE_THUS, caption.STL_COL_DATE_FRI, caption.STL_COL_DATE_SAT],

            buttonText: {
                today: caption.STL_BTN_TODAY,
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                dataserviceEduExam.getEvent("DO_PRACTICE", function (rs) {
                    rs = rs.data;
                    var event = [];
                    for (var i = 0; i < rs.length; i++) {
                        var obj = {
                            title: rs[i].title,
                            start: rs[i].start,
                            end: rs[i].end,
                            className: rs[i].className,
                            //color: rs[i].color,
                            displayEventTime: false,
                            progress: rs[i].ProgressAuto,
                            author: rs[i].Author,
                            teacher: rs[i].Teacher,
                            timemeet: rs[i].sStartTime + ' - ' + rs[i].sEndTime,
                            //workContent: rs[i].workContent,
                            id: rs[i].Id
                        }
                        event.push(obj);
                    }
                    callback(event);
                })
            },
            eventMouseover: function (calEvent, jsEvent) {
                var author = author != null && author != '' && author != undefined ? ' (' + calEvent.author + ')' : '';
                var tooltip = '<div class="tooltipevent"' +
                    'style="width: 250px; background:#c6ef9c; color: #000; position: absolute; border-radius: 10px; padding: 5px;">'
                    + '' + caption.LMS_PRACTICE_TEST_LBL_HW + ': ' + calEvent.title + ' [' + calEvent.progress + '%]' + author +
                    '<br />' + caption.LMS_PRACTICE_TEST_LBL_DO_TIME + ': ' + calEvent.timemeet +
                    /*'<br />' + caption.MS_LBL_STATUS + ': ' + calEvent.status +*/
                    '</div>';

                var $tooltip = $(tooltip).appendTo('body');
                $(this).mouseover(function (e) {
                    $(this).css('z-index', 10000);
                    $tooltip.fadeIn('500');
                    $tooltip.fadeTo('10', 1.9);
                }).mousemove(function (e) {
                    $tooltip.css('top', e.pageY + 10);
                    $tooltip.css('left', e.pageX + 20);
                });
            },
            eventMouseout: function (calEvent, jsEvent) {
                $(this).css('z-index', 8);
                $('.tooltipevent').remove();
            },
            eventClick: function (calEvent) {
                var date = $filter('date')(new Date(calEvent.date), 'dd/MM/yyyy');
                var numLate = calEvent.numLate;
            },
        })
    }

    setTimeout(function () {
        loadCalendar("calendar");
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
        //loadDate();
    }, 200);
    // exam
    $scope.headerCompiledExam = false;
    $scope.selectedExam = [];
    $scope.selectAllExam = false;
    $scope.toggleAllExam = toggleAllExam;
    $scope.toggleOneExam = toggleOneExam;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAllExam" ng-click="toggleAllExam(selectAllExam, selected)"/><span></span></label>';
    vm.dtOptionsExam = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsPracticeTest/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Title = $scope.model.Keyword;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.SubjectCode = $scope.model.SubjectCode;
                d.OnlyAssignment = $scope.model.OnlyAssignment;
                d.IsSharedAndEditable = $scope.model.IsSharedAndEditable;
                //d.GroupBySubject = $scope.model.GroupBySubject;
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                heightTableViewportManual(218, '#tblDataExam');
                $scope.totalAssignments = d.responseJSON.countAssignment;
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [3, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiledExam) {
                $scope.headerCompiledExam = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('rowCallback', function (row, data) {
            if (data.IsRead == 'False') {
                $(row).addClass('row-no-read');
            }
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
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumnsExam = [];
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            //$scope.selectedExam[full.id] = false;
            //return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOneExam(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('_STT').withOption('sClass', 'wpercent5').withTitle('{{"STT" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('PracticeTestTitle').withTitle('{{"Tiêu đề" | translate}}').renderWith(function (data, type, full) {
        var title = '<span class1="text-important">' + data + '</span>';
        if (full.IsAssignment == "True") {
            title += '<img class="blink-act" src="/images/default/green-blink.png" style="width: 17px;height: 17px;margin-top: -5px; margin-left: 10px" /><br/>';
            title += '<span class="text-purple fs10">(' + full.LmsTaskName;
            if (full.IsAlreadyDone === "True") {
                title += ' - Đã làm';
            }
            title += ')</span></br>';
        }
        return title;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('Duration').withOption('sClass', 'wpercent5').withTitle('{{"LMS_PRACTICE_TEST_LBL_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('ExamSubject').withOption('sClass', 'wpercent5').withTitle('{{"LMS_PRACTICE_TEST_LBL_SUBJECTS" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'wpercent5').withTitle('{{"LMS_PRACTICE_TEST_MSG_DATE_CREATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm:ss') : null;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('DoPractice').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{ "LMS_PRACTICE_TEST_LBL_TEST" | translate }}').renderWith(function (data, type, full, meta) {
        if (full.IsShared == "True" || full.IsAssignment == "True" || full.IsEditable == "True") {
            return '<a title="{{&quot;LMS_PRACTICE_TEST_LBL_TEST&quot; | translate}}" ng-click="test(' + full.Id + ',\'' + full.LmsTaskCode + '\')"  class="fs25"><i class="fas fa-play text-green"></i></a>';
        }
        else {
            return '<a title="{{&quot;LMS_PRACTICE_TEST_LBL_TEST&quot; | translate}}" ng-click="test(' + full.Id + ',\'' + full.LmsTaskCode + '\')"  class="fs25 disabled-element"><i class="fas fa-play text-green"></i></a>';
        }
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('Action').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        if (full.IsEditable == "True") {
            return '<a title="{{&quot;COM_BTN_SHARE&quot; | translate}}" ng-click="share(' + full.Id + ')" class="fs25 pr20"><i class="fas fa-share-alt"></i></a>' +
                '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
        }
        else {
            return '<a title="{{&quot;COM_BTN_SHARE&quot; | translate}}" ng-click="share(' + full.Id + ')" class="fs25 pr20 disabled-element"><i class="fas fa-share-alt"></i></a>' +
                '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')"  class="fs25 pr10 disabled-element"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')"  class="fs25 disabled-element"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
        }
    }));
    vm.reloadDataExam = reloadDataExam;
    vm.dtInstanceExam = {};
    function reloadDataExam(resetPaging) {
        vm.dtInstanceExam.reloadData(callbackExam, resetPaging);
    }
    function callbackExam(json) {

    }
    function toggleAllExam(selectAllExam, selectedItemsExam) {
        for (var id in selectedItemsExam) {
            if (selectedItemsExam.hasOwnProperty(id)) {
                selectedItemsExam[id] = selectAllExam;
            }
        }
    }
    function toggleOneExam(selectedItemsExam) {
        for (var id in selectedItemsExam) {
            if (selectedItemsExam.hasOwnProperty(id)) {
                if (!selectedItemsExam[id]) {
                    vm.selectAllExam = false;
                    return;
                }
            }
        }
        vm.selectAllExam = true;
    }

    $scope.reloadExam = function () {
        reloadDataExam(true);
    }
    $rootScope.reloadNoResetPageExam = function () {
        reloadDataExam(false);
    }
    $scope.search = function () {
        reloadDataExam(true);
    }

    $scope.searchAssignmentOnly = function () {
        $scope.model.IsSharedAndEditable = false;
        $scope.model.OnlyAssignment = true;
        reloadDataExam(true);
    }
    $scope.searchShareAndEditable = function () {
        $scope.model.IsSharedAndEditable = true;
        $scope.model.OnlyAssignment = false;
        reloadDataExam(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsPracticeTest + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadExam();
            $scope.reloadCount();
            $rootScope.isAdded = false;
        }, function () {
        });
    }

    $scope.edit = function (id) {
        dataserviceEduExam.getItem(id, "", function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsPracticeTest + '/add.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPageExam();
                    $scope.reloadCount();
                }, function () {
                });
            }
        });
    }
    $scope.test = function (id, taskCode) {
        dataserviceEduExam.getItem(id, taskCode, function (rs) {
            rs = rs.data;
            rs.Object.fromPractice = true;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsPracticeTest + '/test.html',
                    controller: 'test',
                    backdrop: 'static',
                    backdropClass: 'custom-black full-opacity',
                    size: '90',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    clearInterval(clockTick);
                    $scope.reloadNoResetPageExam();
                    window.userResultIndex = -1;
                }, function () {
                    clearInterval(clockTick);
                    window.userResultIndex = -1;
                });
            }
        });
    }
    $scope.share = function (id) {
        var userModel = {};
        //var listdata = $('#tblDataCustomerFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}

        //if (!$rootScope.isApprove && userModel.CreatedBy != userName) {
        //    return App.toastrError("Bạn không có quyền thực hiện chức năng này");
        //}

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsPracticeTest + '/shareObject.html',
            controller: 'sharePracticeTest',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Id: id,
                        //CardCode: $rootScope.CardCode
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPageExam();
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
                    dataserviceEduExam.delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
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
            $scope.reloadNoResetPageExam();
            $scope.reloadCount();
        }, function () {
        });
    }
    $scope.reloadCount = function () {
        dataserviceEduExam.getCountQuiz(function (rs) {
            rs = rs.data;
            if (rs.Object) {
                $scope.countAssignment = rs.Object.countAssignment;
                $scope.countVoluntary = rs.Object.countVoluntary;
            }
        });
    };
    $scope.initData = function () {
        dataserviceEduExam.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
        dataserviceEduExam.getListSubject(function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
        dataserviceEduExam.getCountQuiz(function (rs) {
            rs = rs.data;
            if (rs.Object) {
                $scope.countAssignment = rs.Object.countAssignment;
                $scope.countVoluntary = rs.Object.countVoluntary;
            }
        });
    };
    $scope.initData();
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    };
    $scope.collapse = function () {
        heightTableAuto();
        $scope.isShow = true;
    }
    $scope.expand = function () {
        heightTableManual(320, '#tblData');
        heightTableManual(320, '#tblDataExam');
        $scope.isShow = false;
    }
    setTimeout(function () {
    }, 200);
    $("#PostFromDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#PostToDate').datepicker('setStartDate', maxDate);
    });
    $("#PostToDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#PostFromDate').datepicker('setEndDate', maxDate);
    });
    $("#CreFromDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#CreToDate').datepicker('setStartDate', maxDate);
    });
    $("#CreToDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#CreFromDate').datepicker('setEndDate', maxDate);
    });
    $('.end-post-date').click(function () {
        $('#PostFromDate').datepicker('setEndDate', null);
    });
    $('.start-post-date').click(function () {

        $('#PostToDate').datepicker('setStartDate', null);
    });
    $('.end-create-date').click(function () {
        $('#CreFromDate').datepicker('setEndDate', null);
    });
    $('.start-create-date').click(function () {

        $('#CreToDate').datepicker('setStartDate', null);
    });
});

app.controller('assignmentPractice',
    function ($scope,
        $rootScope,
        $compile, $controller,
        $uibModal,
        DTOptionsBuilder,
        DTColumnBuilder,
        DTInstances,
        dataserviceEduExam,
        $translate,
        $window,
        $filter) {
        $controller('indexPracticeTest', { $scope: $scope });

        setTimeout(function () {
            $scope.searchAssignmentOnly();
        }, 500);
    });
app.controller('possessAndSharePractice',
    function ($scope,
        $rootScope,
        $compile, $controller,
        $uibModal,
        DTOptionsBuilder,
        DTColumnBuilder,
        DTInstances,
        dataserviceEduExam,
        $translate,
        $window,
        $filter) {
        $controller('indexPracticeTest', { $scope: $scope });

        setTimeout(function () {
            $scope.searchShareAndEditable();
        }, 500);
    });
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceEduExam) {
    //detail
    $scope.model = {
        Code: generateUUID(),
        Title: '',
        Duration: '',
        Note: '',
    }
    $scope.modelQst = {
        QuestCode: '',
        Mark: 10
    }

    $scope.listQuestion = [];
    $scope.listSubject = [];
    $scope.listLevel = [
        {
            Code: "VERY_EASY",
            Name: caption.LMS_LEVEL_VERY_EASY
        },
        {
            Code: "EASY",
            Name: caption.LMS_LEVEL_EASY
        },
        {
            Code: "NORMAL",
            Name: caption.LMS_LEVEL_NORMAL
        },
        {
            Code: "HARD",
            Name: caption.LMS_LEVEL_HARD
        },
        {
            Code: "QUITE_HARD",
            Name: caption.LMS_LEVEL_QUITE_HARD
        },
        {
            Code: "VERY_HARD",
            Name: caption.LMS_LEVEL_VERY_HARD
        },
    ];

    $rootScope.id = -1;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.title = caption.LMS_PRACTICE_TEST_LBL_ADD_EXAM;

    $scope.initData = function () {
        dataserviceEduExam.getListQuestion($rootScope.pageQ, $rootScope.pageSizeQ, "", function (rs) {
            rs = rs.data;
            $scope.listQuestion = rs;
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
            }
        });
        dataserviceEduExam.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, "", function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
        $rootScope.loadMoreQ = function ($select, $event) {
            if (!$event) {
                $rootScope.pageQ = 1;
                $rootScope.itemsQ = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.pageQ++;
            }
            dataserviceEduExam.getListQuestion($rootScope.pageQ, $rootScope.pageSizeQ, $rootScope.codeSearchQ, function (rs) {
                rs = rs.data;
                $scope.listQuestion = $scope.listQuestion.concat(rs);
                for (var i = 0; i < $scope.listQuestion.length; i++) {
                    $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
                }
                $scope.listQuestion = removeDuplicate($scope.listQuestion);
            });
        }
        $rootScope.loadMoreS = function ($select, $event) {
            if (!$event) {
                $rootScope.pageS = 1;
                $rootScope.itemsS = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.pageS++;
            }
            dataserviceEduExam.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, $rootScope.codeSearchS, function (rs) {
                rs = rs.data;
                $scope.listSubject = $scope.listSubject.concat(rs);
                $scope.listSubject = removeDuplicate($scope.listSubject);
            });
        }
    };
    $scope.initData();

    $rootScope.reloadQuestion = function (input) {
        $rootScope.codeSearchQ = input;
        $rootScope.pageQ = 1;
        $rootScope.itemsQ = [];
        dataserviceEduExam.getListQuestion($rootScope.pageQ, $rootScope.pageSizeQ, $rootScope.codeSearchQ, function (rs) {
            rs = rs.data;
            $scope.listQuestion = rs;
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
            }
        });
    }

    $rootScope.reloadSubject = function (input) {
        $rootScope.codeSearchS = input;
        $rootScope.pageS = 1;
        $rootScope.itemsS = [];
        dataserviceEduExam.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, $rootScope.codeSearchS, function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
    }

    $scope.loadDetail = function () {
        dataserviceEduExam.getListDetail($scope.model.PracticeTestCode, function (rs) {
            rs = rs.data;
            $scope.listDetail = rs.Object;
            for (var i = 0; i < $scope.listDetail.length; i++) {
                $scope.listDetail[i].Content = decodeHTML($scope.listDetail[i].Content);
            }
        });
    }

    $scope.share = function (id) {
        var userModel = {};
        //var listdata = $('#tblDataCustomerFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}

        //if (!$rootScope.isApprove && userModel.CreatedBy != userName) {
        //    return App.toastrError("Bạn không có quyền thực hiện chức năng này");
        //}

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsPracticeTest + '/shareObject.html',
            controller: 'sharePracticeTest',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Id: $rootScope.id,
                        //CardCode: $rootScope.CardCode
                    };
                }
            }
        });
        //modalInstance.result.then(function (d) {
        //    $scope.reload();
        //}, function () {
        //});
    }
    $scope.submit = function () {
        if ($rootScope.id > 0) {
            dataserviceEduExam.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $scope.reloadNoResetPageExam();

                    return App.toastrSuccess(rs.Title);
                }
            });
        } else {
            validationSelect($scope.model);
            if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
                var check = CKEDITOR.instances['Description'];
                if (check !== undefined) {
                    var data = CKEDITOR.instances['Description'].getData();
                    $scope.model.Description = data;
                }
                dataserviceEduExam.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    };
    $scope.changeFlag = function (flag) {
        $scope.model[flag] = !$scope.model[flag];
    }

    $scope.addQuestion = function () {
        if ($rootScope.id < 0) {
            return App.toastrError(caption.LMS_PRACTICE_TEST_MSG_ADD_EXAM);
        }

        //if ($scope.modelQst.QuestCode == null || $scope.modelQst.QuestCode == '' || $scope.modelQst.QuestCode == undefined) {
        //    return App.toastrError(caption.LMS_PRACTICE_TEST_MSG_QUESTION_ADDING);
        //}
        $scope.modelQst.PracticeTestCode = $scope.model.PracticeTestCode;
        //var obj = {
        //    PracticeTestCode: $scope.model.Code,
        //    QuestCode: $scope.model.QuestCode
        //}

        validationSelectDetail($scope.modelQst);
        if ($scope.addDetail.validate() && !validationSelectDetail($scope.modelQst).Status) {
            dataserviceEduExam.insertQuestion($scope.modelQst, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.loadDetail();
                }
            });
        }
    }

    $scope.deleteQuestion = function (id) {
        dataserviceEduExam.deleteQuestion(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                $scope.loadDetail();
                return App.toastrSuccess(rs.Title);
            }
        });
    }

    $scope.changeData = function (type, item) {
        if (type == "SubjectCode") {
            $scope.errorSubject = false;
        }
        if (type == "Unit") {
            $scope.errorUnit = false;
        }
        if (type == "Level") {
            $scope.errorLevel = false;
        }
        if (type == "Question") {
            $scope.errorQuestion = false;
        }
        if (type == "UnitDetail") {
            $scope.errorDetailUnit = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubject = true;
            mess.Status = true;
        } else {
            $scope.errorSubject = false;
        }

        if (data.Unit == "" || data.Unit == null || data.Unit == undefined) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }

        if (data.Level == "" || data.Level == null || data.Level == undefined) {
            $scope.errorLevel = true;
            mess.Status = true;
        } else {
            $scope.errorLevel = false;
        }

        return mess;
    }
    function validationSelectDetail(data) {
        var mess = { Status: false, Title: "" }

        if (data.QuestCode == "" || data.QuestCode == null || data.QuestCode == undefined) {
            $scope.errorQuestion = true;
            mess.Status = true;
        } else {
            $scope.errorQuestion = false;
        }

        if (data.Unit == "" || data.Unit == null || data.Unit == undefined) {
            $scope.errorDetailUnit = true;
            mess.Status = true;
        } else {
            $scope.errorDetailUnit = false;
        }

        return mess;
    }
    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].Code == itm.Code) {
                    isDuplicate = true;
                    break;
                }
                //if (res[i].Id == itm.Id) {
                //    isDuplicate = true;
                //    break;
                //}
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('Description', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Description'].config.height = 120;
    }
    setTimeout(function () {
        ckEditer();
    }, 500);
    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    };
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceEduExam, para) {
    $scope.modelQst = {
        QuestCode: ''
    }

    $scope.title = caption.LMS_PRACTICE_TEST_EDIT_TEST;
    $scope.listQuestion = [];
    $scope.listSubject = [];
    $scope.listLevel = [
        {
            Code: "VERY_EASY",
            Name: caption.LMS_LEVEL_VERY_EASY
        },
        {
            Code: "EASY",
            Name: caption.LMS_LEVEL_EASY
        },
        {
            Code: "NORMAL",
            Name: caption.LMS_LEVEL_NORMAL
        },
        {
            Code: "HARD",
            Name: caption.LMS_LEVEL_HARD
        },
        {
            Code: "QUITE_HARD",
            Name: caption.LMS_LEVEL_QUITE_HARD
        },
        {
            Code: "VERY_HARD",
            Name: caption.LMS_LEVEL_VERY_HARD
        },
    ];
    $scope.cancel = function () {
        var check = CKEDITOR.instances['ckEditorItem'];
        if (check !== undefined) {
            CKEDITOR.instances['ckEditorItem'].destroy();
        }
        $uibModalInstance.close();
        $rootScope.isAdded = false;
        $rootScope.alias = null;
        $rootScope.id = -1;
    }

    $scope.loadDetail = function () {
        //dataserviceEduExam.getListSubject(function (rs) {
        //    rs = rs.data;
        //    $scope.listSubject = rs;
        //});
        dataserviceEduExam.getListDetail($scope.model.PracticeTestCode, function (rs) {
            rs = rs.data;
            $scope.listDetail = rs.Object;
            for (var i = 0; i < $scope.listDetail.length; i++) {
                $scope.listDetail[i].Content = decodeHTML($scope.listDetail[i].Content);
                var unit = $rootScope.listUnit.find(x => x.Code == $scope.listDetail[i].Unit);
                $scope.listDetail[i].UnitName = unit != undefined ? unit.Name : 'Phút';
            }
        });
    }
    $scope.initData = function () {
        $scope.model = para.Model;
        $rootScope.id = $scope.model.Id;
        dataserviceEduExam.getListQuestion($rootScope.pageQ, $rootScope.pageSizeQ, "", function (rs) {
            rs = rs.data;
            $scope.listQuestion = rs;
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
            }
        });
        dataserviceEduExam.getSingleSubject($scope.model.SubjectCode, function (rs) {
            rs = rs.data;
            if (rs != null && rs != undefined && rs != "") {
                $scope.listSubject.push(rs);
                dataserviceEduExam.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, "", function (result) {
                    result = result.data;
                    $scope.listSubject.concat(result);
                });
            }
        });
        $rootScope.loadMoreQ = function ($select, $event) {
            if (!$event) {
                $rootScope.pageQ = 1;
                $rootScope.itemsQ = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.pageQ++;
            }
            dataserviceEduExam.getListQuestion($rootScope.pageQ, $rootScope.pageSizeQ, $rootScope.codeSearchQ, function (rs) {
                rs = rs.data;
                $scope.listQuestion = $scope.listQuestion.concat(rs);
                for (var i = 0; i < $scope.listQuestion.length; i++) {
                    $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
                }
                $scope.listQuestion = removeDuplicate($scope.listQuestion);
            });
        }
        $rootScope.loadMoreS = function ($select, $event) {
            if (!$event) {
                $rootScope.pageS = 1;
                $rootScope.itemsS = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.pageS++;
            }
            dataserviceEduExam.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, $rootScope.codeSearchS, function (rs) {
                rs = rs.data;
                $scope.listSubject = $scope.listSubject.concat(rs);
                $scope.listSubject = removeDuplicate($scope.listSubject);
            });
        }
        setTimeout(function () {
            CKEDITOR.instances['Description'].setData($scope.model.Description);
        }, 1000);
        $scope.loadDetail();
    }

    $scope.initData();
    $rootScope.reloadQuestion = function (input) {
        $rootScope.codeSearchQ = input;
        $rootScope.pageQ = 1;
        $rootScope.itemsQ = [];
        dataserviceEduExam.getListQuestion($rootScope.pageQ, $rootScope.pageSizeQ, $rootScope.codeSearchQ, function (rs) {
            rs = rs.data;
            $scope.listQuestion = rs;
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = decodeHTML($scope.listQuestion[i].Content);
            }
        });
    }

    $rootScope.reloadSubject = function (input) {
        $rootScope.codeSearchS = input;
        $rootScope.pageS = 1;
        $rootScope.itemsS = [];
        dataserviceEduExam.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, $rootScope.codeSearchS, function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.share = function (id) {
        var userModel = {};
        //var listdata = $('#tblDataCustomerFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}

        //if (!$rootScope.isApprove && userModel.CreatedBy != userName) {
        //    return App.toastrError("Bạn không có quyền thực hiện chức năng này");
        //}

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsPracticeTest + '/shareObject.html',
            controller: 'sharePracticeTest',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Id: $rootScope.id,
                        //CardCode: $rootScope.CardCode
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataserviceEduExam.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPageExam();
                }
            });
        }
    };

    $scope.changeFlag = function (flag) {
        $scope.model[flag] = !$scope.model[flag];
    }
    $scope.addQuestion = function () {
        if ($rootScope.id < 0) {
            return App.toastrError(caption.LMS_PRACTICE_TEST_MSG_ADD_EXAM);
        }

        //if ($scope.modelQst.QuestCode == null || $scope.modelQst.QuestCode == '' || $scope.modelQst.QuestCode == undefined) {
        //    return App.toastrError(caption.LMS_PRACTICE_TEST_MSG_QUESTION_ADDING);
        //}
        $scope.modelQst.PracticeTestCode = $scope.model.PracticeTestCode;
        //var obj = {
        //    PracticeTestCode: $scope.model.Code,
        //    QuestCode: $scope.model.QuestCode
        //}

        validationSelectDetail($scope.modelQst);
        if ($scope.addDetail.validate() && !validationSelectDetail($scope.modelQst).Status) {
            dataserviceEduExam.insertQuestion($scope.modelQst, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.loadDetail();
                }
            });
        }
    }

    $scope.deleteQuestion = function (id) {
        dataserviceEduExam.deleteQuestion(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                $scope.loadDetail();
                return App.toastrSuccess(rs.Title);
            }
        });
    }

    $scope.changeData = function (type, item) {
        if (type == "SubjectCode") {
            $scope.errorSubject = false;
        }
        if (type == "Unit") {
            $scope.errorUnit = false;
        }
        if (type == "Level") {
            $scope.errorLevel = false;
        }
        if (type == "Question") {
            $scope.errorQuestion = false;
        }
        if (type == "UnitDetail") {
            $scope.errorDetailUnit = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubject = true;
            mess.Status = true;
        } else {
            $scope.errorSubject = false;
        }

        if (data.Unit == "" || data.Unit == null || data.Unit == undefined) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }

        if (data.Level == "" || data.Level == null || data.Level == undefined) {
            $scope.errorLevel = true;
            mess.Status = true;
        } else {
            $scope.errorLevel = false;
        }

        return mess;
    }
    function validationSelectDetail(data) {
        var mess = { Status: false, Title: "" }

        if (data.QuestCode == "" || data.QuestCode == null || data.QuestCode == undefined) {
            $scope.errorQuestion = true;
            mess.Status = true;
        } else {
            $scope.errorQuestion = false;
        }

        if (data.Unit == "" || data.Unit == null || data.Unit == undefined) {
            $scope.errorDetailUnit = true;
            mess.Status = true;
        } else {
            $scope.errorDetailUnit = false;
        }

        return mess;
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('Description', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Description'].config.height = 120;
    }
    setTimeout(function () {
        ckEditer();
    }, 500);
    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].Code == itm.Code) {
                    isDuplicate = true;
                    break;
                }
                //if (res[i].Id == itm.Id) {
                //    isDuplicate = true;
                //    break;
                //}
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
    }
    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }
});

app.controller('test', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceEduExam, dataserviceLms, para, $sce, $window, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.listColorIconBoard = ["#8e44ad33", "#27ae6026", "#2980b921", "#2ca94b29", "#ed78322b", "#ed1b2433"];
    $scope.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    $rootScope.progressBar = { name: 'file X', uuid: '', progress: '0%', style: { 'width': '0%' } };
    $rootScope.progressBarAuto = { name: 'file X', uuid: '', progress: '0%', style: { 'width': '0%' } };
    //$scope.listQuestion = Array.from(Array(30).keys());
    $scope.listQuestion = [];
    $scope.currentPoint = 0;
    $scope.totalPoint = 0;
    $scope.currentQuestion = 0;
    $scope.totalQuestion = 0;
    $scope.listTwoAllowedTypes = [
        "one"
    ];
    $scope.listOneType = "one";
    $scope.listTwoType = "two";
    $scope.initDragDrop = function (minWidth, index) {
        $scope.listQuestion[index].placeHolderMinW = minWidth;
        var listObject = $scope.listQuestion[index].listAnswer;
        $scope.listQuestion[index].isDragDropOn = false;
        $scope.listQuestion[index].listOne = [];
        $scope.listQuestion[index].listTwo = listObject.filter(e => {
            return e.IsAnswer != true;
        });
        for (let i = 0; i < $scope.listQuestion[index].listTwo.length; i++) {
            const element = $scope.listQuestion[index].listTwo[i];
            element.minW = minWidth;
            element.Moved = false;
            element.DragIndex = i;
        }
    }
    $scope.dragDropOn = function (quizCode, index) {
        var qIndex = $scope.listQuestion.findIndex(x => x.Code == quizCode);
        if (qIndex != -1) {
            $scope.listQuestion[qIndex].listTwo[index].Moved = true;
            if (!$scope.listQuestion[qIndex].isDragDropOn) {
                $scope.listQuestion[qIndex].isDragDropOn = true;
                $scope.currentQuestion++;
                $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
                $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
            }
        }
    }
    $scope.dragDropOff = function (quizCode, item, external, type) {
        var qIndex = $scope.listQuestion.findIndex(x => x.Code == quizCode);
        if (qIndex != -1) {
            console.log(item.DragIndex);
            $scope.listQuestion[qIndex].listTwo[item.DragIndex].Moved = false;
            if ($scope.listQuestion[qIndex].listOne.length <= 1) {
                $scope.listQuestion[qIndex].isDragDropOn = false;
                $scope.currentQuestion--;
                $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
                $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
            }
        }
        // Return false here to cancel drop. Return true if you insert the item yourself.
        return true;
    };
    $scope.initCanvas = function (index) {
        $scope.redraw($scope.listQuestion[index].listAnswer, 120, 50, 120, 50, 80, 250, 25, 400, index);
    }
    $scope.loadDetail = function () {
        dataserviceEduExam.getListDetailQuiz($scope.model.PracticeTestCode, sessionCode, function (examDetails) {
            examDetails = examDetails.data;
            $scope.isAlreadyDone = examDetails.Object.isAlreadyDone;
            $scope.listQuestion = examDetails.Object.details;
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = $sce.trustAsHtml($scope.listQuestion[i].Content)/*($scope.listQuestion[i].Content)*/;
                if ($scope.listQuestion[i].JsonData != null && $scope.listQuestion[i].JsonData != '') {
                    $scope.listQuestion[i].listAnswer = JSON.parse($scope.listQuestion[i].JsonData);
                }
                else {
                    $scope.listQuestion[i].listAnswer = [];
                }
                $scope.listQuestion[i].containVideo = {};
                $scope.listQuestion[i].ShowHint = false;
                $scope.totalPoint += $scope.listQuestion[i].Mark;
                var colorIndex = i % $scope.listColorIconBoard.length;
                $scope.listQuestion[i].color = { 'color': $scope.listColorIconBoard[colorIndex] };
                for (var j = 0; j < $scope.listQuestion[i].listAnswer.length; j++) {
                    $scope.listQuestion[i].listAnswer[j].alphabet = $scope.alphabet[j];
                    if ($scope.listQuestion[i].UserChoose == $scope.listQuestion[i].listAnswer[j].Code) {
                        $scope.listQuestion[i].listAnswer[j].check = true;
                        if ($scope.listQuestion[i].listAnswer[j].IsAnswer) {
                            $scope.currentPoint += $scope.listQuestion[i].Mark;
                        }
                    }
                    else {
                        $scope.listQuestion[i].listAnswer[j].check = false;
                    }
                    $scope.listQuestion[i].listAnswer[j].Content = decodeHTML($scope.listQuestion[i].listAnswer[j].Answer);
                    if ($scope.listQuestion[i].listAnswer[j].Type == "VIDEO") {
                        $scope.listQuestion[i].containVideo = { 'flex-wrap': 'wrap' };
                    }
                };
                if ($scope.listQuestion[i].Type === 'QUIZ_SORT_ARRANGE') {
                    $scope.initDragDrop(100, i);
                }
                if ($scope.listQuestion[i].Type === 'QUIZ_NO_CH_FILL_WORD' || $scope.listQuestion[i].Type === 'QUIZ_NO_CH_REPLY_WORD') {
                    $scope.listQuestion[i].isFilled = false;
                }
                if ($scope.listQuestion[i].Type === 'QUIZ_PAIRS_ELEMENT') {
                    $scope.listQuestion[i].modelFabric = {
                        canvas: null,
                        resultPairs: [],
                        listCheckAnswer: [],
                        index: i,
                    };

                    //setTimeout((function (i) {
                    //    $scope.redraw($scope.listQuestion[i].listAnswer, 120, 50, 120, 50, 80, 250, 25, 400, i);
                    //}) (i), 200);
                }
                if ($scope.listQuestion[i].Type === 'QUIZ_GAME') {
                    $scope.listQuestion[i].isCheck = false;
                    $scope.listQuestion[i].userResult = "";
                    $scope.listQuestion[i].played = false;
                    $scope.listQuestion[i].playGame = false;
                    $scope.listQuestion[i].isCorrect = false;
                }
                $scope.totalQuestion++;
                try {
                    $scope.listQuestion[i].ListMediaType = JSON.parse($scope.listQuestion[i].QuestionMedia);
                    console.log($scope.listQuestion[i].ListMediaType.length);
                } catch (e) {
                    console.log(e);
                    $scope.listQuestion[i].ListMediaType = [];
                }
            }
            $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
            $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
            $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
            setTimeout(function () {
                MathJax.Hub.Register.StartupHook("End", function () {
                    console.log("Mathjax loaded");
                    console.log(MathJax);
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "TFS"]);
                });
            }, 1000);
        });
    }
    initData = function () {
        $scope.model = para.Model;
        $scope.model.fromPractice = para.fromPractice;
        if ($scope.model.fromPractice) {
            $scope.model.IsAlreadyDone = para.IsAlreadyDone;
            $scope.model.LmsTaskCode = para.LmsTaskCode;
            $scope.model.typeTraining = "DO_PRACTICE";
            $scope.model.objectCode = $scope.model.PracticeTestCode;
            $scope.loadDetail();
            $scope.examTime = new moment();
            if ($scope.model.Unit == "HOUR") {
                $scope.examDeadline = moment($scope.examTime).add(parseInt($scope.model.Duration), 'hours').format("YYYY:MM:DD:HH:mm:ss"); //2021:11:22:14:20:00
            } else {
                $scope.examDeadline = moment($scope.examTime).add(parseInt($scope.model.Duration), 'm').format("YYYY:MM:DD:HH:mm:ss"); //2021:11:22:14:20:00
            }
            setTimeout(function () {
                $scope.timeStart = moment().format("DD/MM/YYYY HH:mm:ss");
                console.log($scope.timeStart);
                initClockSimple($scope.examDeadline);
                //countDownClock.iniClock($scope.examDeadline);
            }, 500);
        }
    }
    initData();
    $scope.checkQuestion = function (quizCode, answerIndex) {
        var qIndex = $scope.listQuestion.findIndex(x => x.Code == quizCode);
        if (qIndex != -1) {
            if ($scope.listQuestion[qIndex].Type == "QUIZ_SING_CH") {
                $scope.checkSingleAnswer(qIndex, answerIndex);
            }
            else if ($scope.listQuestion[qIndex].Type == "QUIZ_MUL_CH") {
                $scope.checkMultipleAnswer(qIndex, answerIndex);
            }
        }
    };
    $scope.checkSingleAnswer = function (qIndex, answerIndex) {
        var oldResult = $scope.listQuestion[qIndex].listAnswer[answerIndex].check;
        var isPreviousChoiceTrue = false;
        var isAlreadyChecked = false;
        $scope.containVideo = false;
        for (var i = 0; i < $scope.listQuestion[qIndex].listAnswer.length; i++) {
            if ($scope.listQuestion[qIndex].listAnswer[i].IsAnswer && $scope.listQuestion[qIndex].listAnswer[i].check && i != answerIndex) {
                isPreviousChoiceTrue = true;
            }

            if ($scope.listQuestion[qIndex].listAnswer[i].check) {
                isAlreadyChecked = true;
                $scope.listQuestion[qIndex].listAnswer[i].check = false;
            }
        }
        $scope.listQuestion[qIndex].listAnswer[answerIndex].check = !oldResult;
        if ($scope.listQuestion[qIndex].listAnswer[answerIndex].check) {
            if (!isAlreadyChecked) {
                $scope.currentQuestion++;
                $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
                $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
            }
            //var result = false;
            //if ($scope.listQuestion[qIndex].listAnswer[answerIndex].IsAnswer) {
            //    $scope.currentPoint += $scope.listQuestion[qIndex].Mark;
            //    $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            //    $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
            //    result = true;
            //}
            //else {
            //    if (isPreviousChoiceTrue) {
            //        $scope.currentPoint -= $scope.listQuestion[qIndex].Mark;
            //        $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            //        $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
            //    }
            //}
        } else {
            $scope.currentQuestion--;
            $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
            $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
            //$scope.currentPoint -= $scope.listQuestion[qIndex].Mark;
            //$rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            //$rootScope.progressBar.style.width = $rootScope.progressBar.progress;
        }
    };
    $scope.checkMultipleAnswer = function (qIndex, answerIndex) {
        var oldResult = $scope.listQuestion[qIndex].listAnswer[answerIndex].check;
        var isPreviousChoiceTrue = false;
        var isAlreadyChecked = false;
        $scope.containVideo = false;
        for (var i = 0; i < $scope.listQuestion[qIndex].listAnswer.length; i++) {
            if ($scope.listQuestion[qIndex].listAnswer[i].IsAnswer && $scope.listQuestion[qIndex].listAnswer[i].check && i != answerIndex) {
                isPreviousChoiceTrue = true;
            }

            if ($scope.listQuestion[qIndex].listAnswer[i].check) {
                isAlreadyChecked = true;
            }
        }
        $scope.listQuestion[qIndex].listAnswer[answerIndex].check = !oldResult;
        if ($scope.listQuestion[qIndex].listAnswer[answerIndex].check) {
            if (!isAlreadyChecked) {
                $scope.currentQuestion++;
                $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
                $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
            }
            //var result = false;
            //if ($scope.listQuestion[qIndex].listAnswer[answerIndex].IsAnswer) {
            //    $scope.currentPoint += $scope.listQuestion[qIndex].Mark;
            //    $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            //    $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
            //    result = true;
            //}
            //else {
            //    if (isPreviousChoiceTrue) {
            //        $scope.currentPoint -= $scope.listQuestion[qIndex].Mark;
            //        $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            //        $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
            //    }
            //}
        } else {
            var checkedIndex = $scope.listQuestion[qIndex].listAnswer.findIndex(x => x.check == true);
            if (checkedIndex == -1) { // if no answer is check, reduce the progress
                $scope.currentQuestion--;
                $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
                $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
            }
            //$scope.currentPoint -= $scope.listQuestion[qIndex].Mark;
            //$rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            //$rootScope.progressBar.style.width = $rootScope.progressBar.progress;
        }
    };
    $scope.checkFillAnswer = function (quizCode) {
        var qIndex = $scope.listQuestion.findIndex(x => x.Code == quizCode);
        if (qIndex != -1) {
            if ($scope.listQuestion[qIndex].listAnswer[0].ContentDecode.replace(/(\r\n|\n|\r)/gm, "") == $scope.listQuestion[qIndex].fillAnswer) {
                console.log("True");
            }
            if ($scope.listQuestion[qIndex].fillAnswer.length > 0) {
                if (!$scope.listQuestion[qIndex].isFilled) {
                    $scope.listQuestion[qIndex].isFilled = true;
                    $scope.currentQuestion++;
                    $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
                    $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
                }
            }
            else {
                if ($scope.listQuestion[qIndex].isFilled) {
                    $scope.listQuestion[qIndex].isFilled = false;
                    $scope.currentQuestion--;
                    $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
                    $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
                }
            }
        }
    }
    $scope.addRef = function (id, type) {
        var size = 30;
        if (type == 'VIDEO' || type == 'CMS') {
            size = 50;
        }
        dataserviceLms.getItemQuiz(id, function (rs) {
            rs = rs.data;
            rs.Type = type;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsPracticeTest + '/add-ref.html',
                controller: 'addReference',
                backdrop: 'false',
                resolve: {
                    para: function () {
                        return rs;
                    }
                },
                size: size
            });
            modalInstance.result.then(function (d) {
                $rootScope.idQuiz = -1;
            }, function () {
            });
        });
    };
    $scope.getUserResult = function (qIndex) {
        if ($scope.listQuestion[qIndex].Type == "QUIZ_SING_CH") {
            var cAnswerIndex = $scope.listQuestion[qIndex].listAnswer.findIndex(x => x.check === true);
            return cAnswerIndex;
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_MUL_CH") {
            var listAnswer = $scope.listQuestion[qIndex].listAnswer.filter(x => x.check === true).map(x => $scope.listQuestion[qIndex].listAnswer.indexOf(x));
            //return cAnswerIndex;
            console.log(listAnswer);
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_NO_CH_FILL_WORD" || $scope.listQuestion[qIndex].Type == "QUIZ_NO_CH_REPLY_WORD") {
            if ($scope.listQuestion[qIndex].fillAnswer != "" && $scope.listQuestion[qIndex].fillAnswer != null && $scope.listQuestion[qIndex].fillAnswer != undefined) {
                return $scope.listQuestion[qIndex].fillAnswer;
            }
            else {
                return -1;
            }
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_SORT_ARRANGE") {
            //var cAnswerIndex = $scope.listQuestion[qIndex].listAnswer.findIndex(x => x.IsAnswer === true);
            //return $scope.listQuestion[qIndex].listAnswer[cAnswerIndex].Answer;
            try {
                var content = [];
                if ($scope.listQuestion[qIndex].listOne.length == 0) {
                    return -1;
                }
                for (const item of $scope.listQuestion[qIndex].listOne) {
                    content.push(item.DragIndex + 1);
                }
                return JSON.stringify(content);
            } catch (e) {
                console.log(e);
                return -1;
            }
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_PAIRS_ELEMENT") {
            //var cAnswerIndex = $scope.listQuestion[qIndex].listAnswer.findIndex(x => x.IsAnswer === true);
            //return $scope.getAllAnswer($scope.listQuestion[qIndex].listAnswer[cAnswerIndex].Answer);
            try {
                if ($scope.listQuestion[qIndex].modelFabric.listCheckAnswer.length == 0) {
                    return -1;
                }
                return JSON.stringify($scope.listQuestion[qIndex].modelFabric.listCheckAnswer);
            } catch (e) {
                console.log(e);
                return -1;
            }
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_GAME") {
            if ($scope.listQuestion[qIndex].userResult != "" && $scope.listQuestion[qIndex].userResult != null && $scope.listQuestion[qIndex].userResult != undefined) {
                return $scope.listQuestion[qIndex].userResult;
            }
            else {
                return -1;
            }
        }
    }
    $scope.getCorrectAnswer = function (qIndex) {
        if ($scope.listQuestion[qIndex].Type == "QUIZ_SING_CH") {
            var cAnswerIndex = $scope.listQuestion[qIndex].listAnswer.findIndex(x => x.IsAnswer === true);
            return cAnswerIndex;
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_MUL_CH") {
            var listAnswer = $scope.listQuestion[qIndex].listAnswer.filter(x => x.IsAnswer === true).map(x => $scope.listQuestion[qIndex].listAnswer.indexOf(x));
            //return cAnswerIndex;
            console.log(listAnswer);
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_NO_CH_FILL_WORD" || $scope.listQuestion[qIndex].Type == "QUIZ_NO_CH_REPLY_WORD") {
            return $scope.listQuestion[qIndex].listAnswer[0].ContentDecode.replace(/(\r\n|\n|\r)/gm, "");
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_SORT_ARRANGE") {
            var cAnswerIndex = $scope.listQuestion[qIndex].listAnswer.findIndex(x => x.IsAnswer === true);
            return $scope.listQuestion[qIndex].listAnswer[cAnswerIndex].Answer;
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_PAIRS_ELEMENT") {
            var cAnswerIndex = $scope.listQuestion[qIndex].listAnswer.findIndex(x => x.IsAnswer === true);
            return $scope.getAllAnswer($scope.listQuestion[qIndex].listAnswer[cAnswerIndex].Answer);
        }
        else if ($scope.listQuestion[qIndex].Type == "QUIZ_GAME") {
            return $scope.listQuestion[qIndex].listAnswer[0].Answer;
        }
    }
    $scope.getAllAnswer = function (answer) {
        var stringAnswer = '';
        stringAnswer = answer.ContentDecode.replace(/\n|\[|\]/g, '')
        var answerTrue = stringAnswer.split(',');
        function reverses(s) {
            var o = '';
            for (var i = s.length - 1; i >= 0; i--)
                o += s[i];
            return o.trim();
        }
        for (let item of answerTrue) {
            stringAnswer += ', ' + reverses(item)
        }
        return stringAnswer;
    }
    //$scope.refresh = function () {
    //    $scope.isAlreadyDone = false;
    //    for (var i = 0; i < $scope.listQuestion.length; i++) {
    //        for (var j = 0; j < $scope.listQuestion[i].listAnswer.length; j++) {
    //            $scope.listQuestion[i].listAnswer[j].check = false;
    //        }
    //    }
    //    $scope.currentPoint = 0;
    //    $rootScope.progressBar.progress = '0%';
    //    $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
    //};
    $scope.showHint = function (index) {
        $scope.listQuestion[index].ShowHint = !$scope.listQuestion[index].ShowHint;
        if ($scope.listQuestion[index].Type == "QUIZ_SING_CH" || $scope.listQuestion[index].Type == "QUIZ_MUL_CH") {
            for (var i = 0; i < $scope.listQuestion[index].listAnswer.length; i++) {
                if ($scope.listQuestion[index].listAnswer[i].IsAnswer) {
                    $scope.checkQuestion($scope.listQuestion[index].Code, i);
                }
            }
        }
        if ($scope.listQuestion[index].Type == "QUIZ_NO_CH_FILL_WORD" || $scope.listQuestion[index].Type == "QUIZ_NO_CH_REPLY_WORD") {
            $scope.listQuestion[index].fillAnswer = $scope.listQuestion[index].listAnswer[0].ContentDecode.replace(/(\r\n|\n|\r)/gm, "");
        }
        if ($scope.listQuestion[index].Type == "QUIZ_GAME") {
            var item = $scope.listQuestion[index];
            if (isValidHttpUrl(decodeHTML(item.Content.toString()))) {
                dataserviceLms.getGameJsonData(decodeHTML(item.Content.toString()), function (rs) {
                    rs = rs.data;
                    var canvasWindow = window.open("/lib/EduComposeEngine/play.html", "_blank", "width=" + screen.availWidth + ",height=" + screen.availHeight);
                    try {
                        var content = decodeURIComponent(rs);
                        var canvasContent = { content: JSON.parse(content) };
                        canvasContent.doQuiz = false;
                        canvasContent.viewAnswer = true;
                        canvasContent.qIndex = index;
                        canvasContent.quizName = "";
                        canvasWindow.canvasData = canvasContent;
                    } catch (e) {
                        console.log(e);
                        var canvasContent = {};
                        canvasContent.doQuiz = false;
                        canvasContent.viewAnswer = true;
                        canvasContent.quizName = $scope.model.Code;
                        canvasWindow.canvasData = canvasContent;
                    }
                });
            }
        }
        //$scope.currentPoint += $scope.listQuestion[index].Mark;
        //$rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
        //$rootScope.progressBar.style.width = $rootScope.progressBar.progress;
    };
    $scope.listCorrectAnswer = [];
    $scope.listUserResult = [];
    $scope.listIsResultCorrect = [];
    $scope.submit = function () {
        var countQuizDone = 0;
        var countQuizCorrect = 0;
        var countTotalQuiz = $scope.listQuestion.length;
        for (var i = 0; i < $scope.listQuestion.length; i++) {
            var correctAnswer = "" + $scope.getCorrectAnswer(i);
            var userResult = "" + $scope.getUserResult(i);
            var checkCorrect = false;
            var quizType = $scope.listQuestion[i].Type;
            if (userResult != -1) {
                countQuizDone++;
                checkCorrect = $scope.checkCorrectQuiz(userResult, correctAnswer, quizType, i);
                //var indexCorrect = correctAnswer.indexOf(userResult);
                //if (indexCorrect != -1) {
                //    countQuizCorrect++;
                //}
            }
            $scope.listCorrectAnswer.push(correctAnswer);
            $scope.listUserResult.push(userResult);
            $scope.listIsResultCorrect.push(checkCorrect);
        }
        if ($scope.model.IsAlreadyDone === true) {
            trackDiligence($scope.model.LmsTaskCode, "PRACTICE", $scope.model.PracticeTestCode, 0);
        } else {
            var itemProgress = {
                ItemCode: $scope.model.PracticeTestCode,
                LmsTaskCode: $scope.model.LmsTaskCode,
                ProgressAuto: (countQuizDone / countTotalQuiz) * 100,
                TeacherApproved: (countQuizCorrect / countTotalQuiz) * 100
            }
            dataserviceEduExam.updateDoingPracticeProgress(itemProgress, function (rs) {
                rs = rs.data;
                console.log(rs.Title);
                trackDiligence($scope.model.LmsTaskCode, "PRACTICE", $scope.model.PracticeTestCode, 0);
            });
        }
    }
    $scope.countDiligence = 0;
    $scope.checkCorrectQuiz = function (userResult, correctAnswer, quizType, quizIndex) {
        if (quizType != "QUIZ_PAIRS_ELEMENT" && quizType != "QUIZ_GAME") {
            return userResult === correctAnswer;
        }
        else if (quizType == "QUIZ_PAIRS_ELEMENT") {
            return correctAnswer.indexOf(userResult) != -1;
        }
        else if (quizType == "QUIZ_GAME") {
            return $scope.listQuestion[quizIndex].isCorrect;
        }
    }
    function trackDiligence(taskCode, quizType, objCode, index) {
        var listTrackDiligent = [];
        var listPracticeResult = [];
        var correctAnswer = $scope.listCorrectAnswer[index];
        var userResult = $scope.listUserResult[index];
        if (userResult != -1) {
            var objPracticeResult = {
                Id: 1, // will be changed in server side
                StartTime: $scope.timeStart,
                EndTime: moment().format("DD/MM/YYYY HH:mm:ss"),
                UserResult: userResult,
                CorrectResult: correctAnswer,
                IsCorrect: false,
                Device: "WEB",
                TaskCode: taskCode,
                QuizType: quizType,
                QuizObjCode: objCode
            }
            listPracticeResult.push(objPracticeResult);
            var objTrackDilligent = {
                ObjectType: "QUIZ",
                ObjectCode: $scope.listQuestion[index].Code,
                ObjectResult: JSON.stringify(listPracticeResult)
            };
            listTrackDiligent.push(objTrackDilligent);
            var modelDiligence = {
                sListDilligence: JSON.stringify(listTrackDiligent)
            }
            dataserviceEduExam.trackDilligence(modelDiligence, function (rs) {
                rs = rs.data;
                console.log(rs.Title);
                $scope.countDiligence++;
                if ($scope.countDiligence == $scope.listQuestion.length) {
                    $uibModalInstance.close();
                }
                else {
                    trackDiligence(taskCode, quizType, objCode, $scope.countDiligence);
                }
            });
        }
        else {
            $scope.countDiligence++;
            if ($scope.countDiligence == $scope.listQuestion.length) {
                $uibModalInstance.close();
            }
            else {
                trackDiligence(taskCode, quizType, objCode, $scope.countDiligence);
            }
        }
    }
    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }

    // zoom quiz full screen
    $scope.isFullScreen = false;
    $scope.goFullscreen = function () {
        $scope.isFullScreen = !$scope.isFullScreen;
    }

    // canvas handler

    $scope.zoomIn = function (i) {
        $scope.listQuestion[i].modelFabric.canvas.setZoom($scope.listQuestion[i].modelFabric.canvas.getZoom() * 1.1);
        // this.refreshGrid();
    };
    $scope.zoomOut = function (i) {
        $scope.listQuestion[i].modelFabric.canvas.setZoom($scope.listQuestion[i].modelFabric.canvas.getZoom() / 1.1);
        // this.refreshGrid();
    };
    $scope.deleteLine = function (i) {
        let objects = $scope.listQuestion[i].modelFabric.canvas.getObjects().filter(obj =>
            obj.isLine &&
            obj.stroke == "black"
        );
        if (objects && objects.length > 0) {
            objects.forEach(object => {
                var indexPair = $scope.listQuestion[i].modelFabric.resultPairs.findIndex(x => x.id1 == object.linePortId);
                if (indexPair != -1) {
                    $scope.listQuestion[i].modelFabric.resultPairs.splice(indexPair, 1);
                    $scope.listQuestion[i].modelFabric.listCheckAnswer.splice(indexPair, 1);
                }
                $scope.listQuestion[i].modelFabric.canvas.remove(object);
            });
        }
        $scope.listQuestion[i].modelFabric.canvas.renderAll();
    };
    $scope.redrawCanvas = function (i) {
        $scope.listQuestion[i].modelFabric.resultPairs = [];
        //$scope.listQuestion[index].modelFabric.listCheckAnswer = [];
        $scope.listQuestion[i].modelFabric.canvas.setZoom(1);
        $scope.listQuestion[i].modelFabric.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        $scope.redraw($scope.listQuestion[i].listAnswer, 120, 50, 120, 50, 80, 250, 25, 400, i);
    };
    $scope.redraw = function (listObjectOrigin, width1, height1, width2, height2, distanceVertical, distanceHorizontal, top, left, qIndex) {
        $scope.listQuestion[qIndex].modelFabric.canvas.clear();
        var listObject = angular.copy(listObjectOrigin);
        //var listObject = newValue;
        var topEvenContent = top; //25
        var topOddContent = top; //25
        var leftEventContent = left; //20
        var leftOddContent = left + distanceHorizontal; //20+65
        var offSet = distanceVertical; //80
        var fontSize = 15;
        var index = 1;
        var countObjectDraw = 1;
        var answerIndex = listObject.findIndex(x => x.IsAnswer == true);
        if (answerIndex != -1) {
            if (listObject[answerIndex].Answer != null && listObject[answerIndex].Answer != '' && listObject[answerIndex].Answer != undefined) {
                listCheckAnswer = JSON.parse(listObject[answerIndex].Answer);
                $scope.listQuestion[qIndex].modelFabric.listCheckAnswer = listCheckAnswer;
            }
            listObject.splice(answerIndex, 1);
        }
        for (let item of listObject) {
            if (item.Column == 1) {
                var dynamicOffset = height1;
                if (item.Type == 'TEXT') {
                    // text
                    // vertical align = center
                    var text = new fabric.Textbox(item.ContentDecode, {
                        originX: 'center', originY: 'center',
                        left: 0.5 * width1, top: 0.5 * (height1 + fontSize), fontSize: fontSize, width: width1 - 20, dirty: true
                    })
                    dynamicOffset = text.height > height1 ? text.height : height1;
                    text.set({ top: 0.5 * (dynamicOffset + fontSize) });
                    var rect = new fabric.Rect({
                        width: width1, height: dynamicOffset,
                        fill: 'rgb(239, 239, 239, 0.25)', stroke: '#e5e5e5',
                        rx: 10,
                        ry: 10, dirty: true
                    })
                    // group
                    var group = new fabric.Group(
                        [rect, text], {
                        id: index, Column: item.Column, top: topEvenContent, left: leftEventContent,
                        hasControls: false, hasBorders: false
                    })
                    $scope.listQuestion[qIndex].modelFabric.canvas.add(group);
                    addPort(group, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                    countObjectDraw++;
                } else if (item.Type == 'IMAGE') {
                    var idxDot = item.ContentDecode.lastIndexOf(".") + 1;
                    var extFile = item.ContentDecode.substr(idxDot, item.ContentDecode.length).toLowerCase();
                    if (extFile === "SVG") {
                        (function (topEvenContent, index) {
                            fabric.loadSVGFromURL(item.ContentDecode, function (objects, options) {
                                var obj = fabric.util.groupSVGElements(objects, options);
                                obj.set({
                                    id: index, Column: item.Column, left: leftEventContent, top: topEvenContent, scaleX: 4, scaleY: 4, isSvg: true,
                                    hasControls: false, hasBorders: false
                                })
                                obj.scaleToWidth(height1)
                                obj.scaleToHeight(height1)
                                $scope.listQuestion[qIndex].modelFabric.canvas.calcOffset();
                                $scope.listQuestion[qIndex].modelFabric.canvas.add(obj).renderAll();
                                addPort(obj, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                                countObjectDraw++;
                            });
                        })(topEvenContent, index);
                    }
                    else {
                        (function (topOddContent, index) {
                            var imgs = new fabric.Image.fromURL(item.ContentDecode, function (img) {
                                var oImg = img.set({
                                    id: index, Column: item.Column, top: topOddContent, left: leftOddContent,
                                    hasControls: false, hasBorders: false
                                }).scale(0.25);
                                img.scaleToWidth(height2)
                                img.scaleToHeight(height2)
                                $scope.listQuestion[qIndex].modelFabric.canvas.add(oImg);
                                addPort(oImg, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                                countObjectDraw++;
                            })
                        })(topOddContent, index);
                    }
                } else {
                    (function (topEvenContent, index) {
                        fabric.loadSVGFromURL(item.ContentDecode, function (objects, options) {
                            var obj = fabric.util.groupSVGElements(objects, options);
                            obj.set({
                                id: index, Column: item.Column, left: leftEventContent, top: topEvenContent, scaleX: 4, scaleY: 4, isSvg: true,
                                hasControls: false, hasBorders: false
                            })
                            obj.scaleToWidth(height1)
                            obj.scaleToHeight(height1)
                            $scope.listQuestion[qIndex].modelFabric.canvas.add(obj).renderAll();
                            addPort(obj, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                            countObjectDraw++;
                        });
                    })(topEvenContent, index);
                }

                index++;
                topEvenContent += (offSet + dynamicOffset - height1);
            } else {
                var dynamicOffset = height2;
                if (item.Type == 'TEXT') {
                    // text
                    // vertical align = center
                    var text = new fabric.Textbox(item.ContentDecode, {
                        originX: 'center', originY: 'center',
                        left: 0.5 * width2, top: 0.5 * (height2 + fontSize), fontSize: fontSize, width: width2 - 20
                    })
                    dynamicOffset = text.height > height2 ? text.height : height2;
                    text.set({ top: 0.5 * (dynamicOffset + fontSize) });
                    var rect = new fabric.Rect({
                        width: width2, height: dynamicOffset,
                        fill: 'rgb(239, 239, 239, 0.25)', stroke: '#e5e5e5',
                        rx: 10,
                        ry: 10,
                    })
                    // group
                    var group = new fabric.Group(
                        [rect, text], {
                        id: index, Column: item.Column, top: topOddContent, left: leftOddContent,
                        hasControls: false, hasBorders: false
                    })
                    $scope.listQuestion[qIndex].modelFabric.canvas.add(group);
                    addPort(group, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                    countObjectDraw++;
                } else if (item.Type == 'IMAGE') {
                    var idxDot = item.ContentDecode.lastIndexOf(".") + 1;
                    var extFile = item.ContentDecode.substr(idxDot, item.ContentDecode.length).toLowerCase();
                    if (extFile === "SVG") {
                        (function (topEvenContent, index) {
                            fabric.loadSVGFromURL(item.ContentDecode, function (objects, options) {
                                var obj = fabric.util.groupSVGElements(objects, options);
                                obj.set({
                                    id: index, Column: item.Column, left: leftEventContent, top: topEvenContent, scaleX: 4, scaleY: 4, isSvg: true,
                                    hasControls: false, hasBorders: false
                                })
                                obj.scaleToWidth(height1)
                                obj.scaleToHeight(height1)
                                $scope.listQuestion[qIndex].modelFabric.canvas.calcOffset();
                                $scope.listQuestion[qIndex].modelFabric.canvas.add(obj).renderAll();
                                addPort(obj, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                                countObjectDraw++;
                            });
                        })(topEvenContent, index);
                    }
                    else {
                        (function (topOddContent, index) {
                            var imgs = new fabric.Image.fromURL(item.ContentDecode, function (img) {
                                var oImg = img.set({
                                    id: index, Column: item.Column, top: topOddContent, left: leftOddContent,
                                    hasControls: false, hasBorders: false
                                }).scale(0.25);
                                img.scaleToWidth(height2)
                                img.scaleToHeight(height2)
                                $scope.listQuestion[qIndex].modelFabric.canvas.add(oImg);
                                addPort(oImg, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                                countObjectDraw++;
                            })
                        })(topOddContent, index);
                    }
                } else {
                    (function (topOddContent, index) {
                        var imgs = new fabric.Image.fromURL('https://os.3i.com.vn//uploads/repository/SUBJECT/background_slogan.jpg', function (img) {
                            var oImg = img.set({
                                id: index, Column: item.Column, top: topOddContent, left: leftOddContent,
                                hasControls: false, hasBorders: false
                            }).scale(0.25);
                            img.scaleToWidth(height2)
                            img.scaleToHeight(height2)
                            $scope.listQuestion[qIndex].modelFabric.canvas.add(oImg);
                            addPort(oImg, $scope.listQuestion[qIndex].modelFabric.canvas, index, item.Column);
                            countObjectDraw++;
                        })
                    })(topOddContent, index);

                }

                console.log(index);
                index++;
                topOddContent += (offSet + dynamicOffset - height2);
            }

        }


        /* #region  mouse event handler */
        var ObjSelectedBefore = 0;
        var ObjSelectedCur = 0;
        var checkIdObj = 0;
        var checkBefore = 0;
        var ObjSelectedBefore_left = 0;
        var ObjSelectedBefore_top = 0;
        var ObjSelectedCur_top = 0;
        var ObjSelectedCur_left = 0;
        var ColmnSelecBefor = 1
        var CollumnSelecAfter = 1
        if (true) {
            (function (ObjSelectedBefore, ObjSelectedCur, checkIdObj, checkBefore, ObjSelectedBefore_left, ObjSelectedBefore_top, ObjSelectedCur_top, ObjSelectedCur_left, ColmnSelecBefor, CollumnSelecAfter, qIndex) {
                var canvas = $scope.listQuestion[qIndex].modelFabric.canvas;
                //var listCheckAnswer = $scope.listQuestion[qIndex].modelFabric.listCheckAnswer;
                canvas.on('mouse:down', function (opt) {
                    // slides.lockSwipes(true);
                    var evt = opt.e;
                    if (opt.target === null) {
                        this.isDragging = true;
                        this.selection = false;
                        var pointer = canvas.getPointer(opt.e, true);
                        var posX = pointer.x;
                        var posY = pointer.y;
                        this.lastPosX = posX;
                        this.lastPosY = posY;
                    }
                });
                canvas.on('mouse:move', function (opt) {
                    //$timeout(function () {
                    //    scope.$apply();
                    //})
                    if (this.isDragging) {
                        var e = opt.e;
                        var vpt = this.viewportTransform;
                        var pointer = canvas.getPointer(opt.e, true);
                        var posX = pointer.x;
                        var posY = pointer.y;
                        vpt[4] += posX - this.lastPosX;
                        vpt[5] += posY - this.lastPosY;
                        this.requestRenderAll();
                        this.lastPosX = posX;
                        this.lastPosY = posY;
                    }
                });
                canvas.on("mouse:up", function (e) {
                    if (e.target !== null) {
                        var objectList = e;
                        const objId = objectList.target['id']
                        const objCol = objectList.target['Column']
                        ObjSelectedBefore = ObjSelectedCur;
                        ObjSelectedCur = objId;

                        ColmnSelecBefor = CollumnSelecAfter;
                        CollumnSelecAfter = objCol;

                        checkIdObj = checkBefore
                        checkBefore++;

                        ObjSelectedBefore_left = ObjSelectedCur_left;
                        ObjSelectedBefore_top = ObjSelectedCur_top;

                        /* #region  get port top left */
                        let object = canvas.getObjects().filter(obj =>
                            (obj.port == "ml" || obj.port == "mr") &&
                            obj.portID == objId
                        );
                        if (object && object.length > 0) {
                            ObjSelectedCur_top = object[0].top;
                            ObjSelectedCur_left = object[0].left;
                        }
                        /* #endregion */
                        /* #region  expand object */
                        //let object = canvas.getObjects().filter(obj =>
                        //    obj.id == objId
                        //);
                        //if (object && object.length > 0) {
                        //    obj.scaleToWidth(mediaSize)
                        //    obj.scaleToHeight(mediaSize)
                        //    canvas.calcOffset();
                        //    canvas.add(obj).renderAll();
                        //}
                        /* #endregion */
                        // ObjSelectedCur_top = objectList.target.top;
                        // ObjSelectedCur_left = objectList.target.left;

                        if ((ColmnSelecBefor == 1 && CollumnSelecAfter == 2 && checkIdObj >= 1) || (ColmnSelecBefor == 2 && CollumnSelecAfter == 1 && checkIdObj >= 1)) {
                            console.log("ObjSelectedCur: " + CollumnSelecAfter, "ObjSelectedBefore: " + ColmnSelecBefor);
                            checkBefore = 0

                            if (!checkExistId(ObjSelectedCur, qIndex)) {
                                let connectorLine = { x1: ObjSelectedCur_left, y1: ObjSelectedCur_top, x2: ObjSelectedBefore_left, y2: ObjSelectedBefore_top };

                                createCurves(canvas, connectorLine, ObjSelectedBefore, ObjSelectedCur, left + width1, distanceHorizontal);
                                $scope.listQuestion[qIndex].modelFabric.listCheckAnswer.push(ObjSelectedBefore + '-' + ObjSelectedCur)
                                $scope.listQuestion[qIndex].modelFabric.resultPairs.push({
                                    id1: ObjSelectedBefore,
                                    id2: ObjSelectedCur
                                });
                                unchoosePort(canvas);
                                unchooseLine(canvas);
                            }
                            else {
                                unchoosePort(canvas);
                                unchooseLine(canvas);
                            }
                        } else {
                            if (isPortChoosen(canvas)) {
                                unchoosePort(canvas);
                                var targetLine = getLine(canvas, objId, qIndex);
                                if (targetLine != -1) {
                                    chooseLine(canvas, targetLine)
                                }
                            }
                            else {
                                choosePort(canvas, objId);
                                var targetLine = getLine(canvas, objId, qIndex);
                                if (targetLine != -1) {
                                    chooseLine(canvas, targetLine)
                                }
                            }
                        }
                    } else {
                        unchoosePort(canvas);
                        unchooseLine(canvas);
                    }
                    var evt = e.e;
                    if (this.isDragging) {
                        this.setViewportTransform(this.viewportTransform);
                        this.isDragging = false;
                        this.selection = true;
                    }
                });
                canvas.on("object:moving", (e) => {
                    let ports = canvas.getItemsByName("port");
                    ports.forEach((port) => {
                        if (port.portID == e.target.id) {
                            canvas.remove(port);
                        }
                    });
                    addPort(e.target, canvas, e.target.id, e.target.Column);
                    let movingPorts = getPortOnMoving(e.target, canvas, e.target.id, e.target.Column);
                    if (movingPorts.result != -1) {
                        let connectorLine = movingPorts.points;
                        let connectline = getLine(canvas, e.target.id, qIndex);
                        if (connectline != -1) {
                            let otherPortId = getOtherPortId(canvas, e.target.id, qIndex);
                            let otherPort = getPortById(canvas, otherPortId);
                            // let portCenter = getPortCenterPoint(e.target, e.target.__corner);

                            connectorLine.x2 = otherPort.left;
                            connectorLine.y2 = otherPort.top;
                            connectline.path[0][1] = connectorLine.x1;
                            connectline.path[0][2] = connectorLine.y1;

                            // connectline[0].path[1][1] = connectorLine.x1;
                            // connectline[0].path[1][2] = connectorLine.y1;

                            connectline.path[1][3] = connectorLine.x2;
                            connectline.path[1][4] = connectorLine.y2;
                        }
                    }
                });
                fabric.Canvas.prototype.getItemsByName = function (name) {
                    var objectList = [],
                        objects = this.getObjects();

                    for (var i = 0, len = this.size(); i < len; i++) {
                        if (objects[i].name && objects[i].name === name) {
                            objectList.push(objects[i]);
                        }
                    }

                    return objectList;
                };
            })(ObjSelectedBefore, ObjSelectedCur, checkIdObj, checkBefore, ObjSelectedBefore_left, ObjSelectedBefore_top, ObjSelectedCur_top, ObjSelectedCur_left, ColmnSelecBefor, CollumnSelecAfter, qIndex);
        }
        /* #endregion */
        //$timeout(function () {
        //    scope.$apply();
        //});
    };

    /* #region  port and connect */
    function findTargetPort(object, ports) {
        let points = new Array(4);
        let port;
        if (ports) {
            port = ports;
        } else {
            port = object.__corner;
        }
        switch (port) {

            case 'mt':
                points = [
                    object.left + (object.width / 2), object.top,
                    object.left + (object.width / 2), object.top
                ];
                break;
            case 'mr':
                points = [
                    object.left + object.width + 10, object.top + (object.height / 2),
                    object.left + object.width + 10, object.top + (object.height / 2)
                ];
                break;
            case 'mb':
                points = [
                    object.left + (object.width / 2), object.top + object.height,
                    object.left + (object.width / 2), object.top + object.height
                ];
                break;
            case 'ml':
                points = [
                    object.left - 10, object.top + (object.height / 2),
                    object.left - 10, object.top + (object.height / 2)
                ];
                break;

            default:
                break;
        }

        return {
            'x1': points[0], 'y1': points[1],
            'x2': points[2], 'y2': points[3]
        };
    }
    function findTargetPortScale(object, ports) {
        let points = new Array(4);
        let port;
        if (ports) {
            port = ports;
        } else {
            port = object.__corner;
        }
        switch (port) {

            case 'mt':
                points = [
                    object.left + (object.width * object.scaleX / 2), object.top,
                    object.left + (object.width * object.scaleX / 2), object.top
                ];
                break;
            case 'mr':
                points = [
                    object.left + object.width * object.scaleX + 10, object.top + (object.height * object.scaleY / 2),
                    object.left + object.width * object.scaleX + 10, object.top + (object.height * object.scaleY / 2)
                ];
                break;
            case 'mb':
                points = [
                    object.left + (object.width * object.scaleX / 2), object.top + object.height,
                    object.left + (object.width * object.scaleX / 2), object.top + object.height
                ];
                break;
            case 'ml':
                points = [
                    object.left - 10, object.top + (object.height * object.scaleY / 2),
                    object.left - 10, object.top + (object.height * object.scaleY / 2)
                ];
                break;

            default:
                break;
        }

        return {
            'x1': points[0], 'y1': points[1],
            'x2': points[2], 'y2': points[3]
        };
    }

    function addPort(object, canvas, objectID, column) {
        if (object.name == "p1" || object.name == "p2" || object.name == "p0") {
            return;
        }
        let ports;
        if (
            object.type === "rect" ||
            object.type === 'circle' ||
            object.type === 'ellipse' ||
            object.type === 'polygon' ||
            object.type === "path" ||
            object.type === "group" ||
            object.type === "image"
        ) {
            if (column == 1) {
                ports = ['mr'];
            }
            else {
                ports = ['ml'];
            }
        }
        if (ports && ports.length > 0 && object.type != "image" && !object.hasOwnProperty('svgUid')) {
            ports.forEach(port => {
                let point = findTargetPort(object, port);
                var c = new fabric.Circle({
                    left: point.x1,
                    top: point.y1,
                    radius: 10,
                    fill: 'green',
                    name: "port",
                    port: port,
                    portID: objectID,
                    column: column,
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    isChosen: false
                });
                canvas.add(c);
            });
        }
        else if (ports && ports.length > 0) {
            ports.forEach(port => {
                let point = findTargetPortScale(object, port);
                var c = new fabric.Circle({
                    left: point.x1,
                    top: point.y1,
                    radius: 10,
                    fill: 'green',
                    name: "port",
                    port: port,
                    portID: objectID,
                    column: column,
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    isChosen: false
                });
                canvas.add(c);
            });
        }
    }
    function createCurves(canvas, points, portId1, portId2, left, distanceHorizon) {
        canvas.on({
            'object:selected': onObjectSelected,
            // 'object:moving': onObjectMoving, //decrepitated
        });

        (function drawQuadratic(points) {

            var line = new fabric.Path('M 65 0 Q 100, 100, 200, 0', { fill: '', stroke: '#ccc', objectCaching: false, isLine: true, linePortId: portId1 });

            line.path[0][1] = points.x1;
            line.path[0][2] = points.y1;

            line.path[1][1] = left + distanceHorizon / 2;
            line.path[1][2] = 200;

            line.path[1][3] = points.x2;
            line.path[1][4] = points.y2;

            line.selectable = false;
            canvas.add(line);

            let objects1 = canvas.getObjects().filter(obj =>
                (obj.id && obj.id > 0)
            );
            if (objects1 && objects1.length > 0) {
                objects1.forEach(object => {
                    canvas.remove(object);
                    canvas.add(object);
                });
            }

            let objects2 = canvas.getObjects().filter(obj =>
                (obj.port == "ml" || obj.port == "mr")
            );
            if (objects2 && objects2.length > 0) {
                objects2.forEach(object => {
                    canvas.remove(object);
                    canvas.add(object);
                });
            }

            /* #region  decrepitated */
            // var p1 = makeCurvePoint(200, 200, null, line, null);
            // p1.name = "p1";
            // p1.port = object.objid;
            // canvas.add(p1);

            // var p0 = makeCurveCircle(points.x1, points.y1, line, p1, null);
            // p0.name = "p0";
            // canvas.add(p0);

            // var p2 = makeCurveCircle(300, 100, null, p1, line);
            // p2.name = "p2";
            // canvas.add(p2);
            /* #endregion */

        })(points);

        /* #region  decrepitated */
        function makeCurveCircle(left, top, line1, line2, line3) {
            var c = new fabric.Circle({
                left: left,
                top: top,
                strokeWidth: 5,
                radius: 12,
                fill: '#fff',
                stroke: '#666'
            });

            c.hasBorders = c.hasControls = false;

            c.line1 = line1;
            c.line2 = line2;
            c.line3 = line3;

            return c;
        }

        function makeCurvePoint(left, top, line1, line2, line3) {
            var c = new fabric.Circle({
                left: left,
                top: top,
                strokeWidth: 8,
                name: "linecnt",
                radius: 14,
                fill: '#fff',
                stroke: '#666'
            });

            c.hasBorders = c.hasControls = false;

            c.line1 = line1;
            c.line2 = line2;
            c.line3 = line3;

            return c;
        }
        /* #endregion */

        function onObjectSelected(e) {
            var activeObject = e.target;

            if (activeObject.name == "p0" || activeObject.name == "p2") {
                activeObject.line2.animate('opacity', '1', {
                    duration: 200,
                    onChange: canvas.renderAll.bind(canvas),
                });
                activeObject.line2.selectable = true;
            }
        }

        function onObjectMoving(e) {
            if (e.target.name == "p0" || e.target.name == "p2") {
                var p = e.target;

                if (p.line1) {
                    p.line1.path[0][1] = p.left;
                    p.line1.path[0][2] = p.top;
                }
                else if (p.line3) {
                    p.line3.path[1][3] = p.left;
                    p.line3.path[1][4] = p.top;
                }
            }
            else if (e.target.name == "p1") {
                var p = e.target;

                if (p.line2) {
                    p.line2.path[1][1] = p.left;
                    p.line2.path[1][2] = p.top;
                }
            }
            else if (e.target.name == "p0" || e.target.name == "p2") {
                var p = e.target;

                p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
                p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top });
                p.line3 && p.line3.set({ 'x1': p.left, 'y1': p.top });
                p.line4 && p.line4.set({ 'x1': p.left, 'y1': p.top });
            }
        }
    }

    function getPortCenterPoint(object, port) {
        var x1 = 0;
        var y1 = 0;

        switch (port) {

            case 'mt':
                x1 = object.left + (object.width / 2);
                y1 = object.top;
                break;

            case 'mr':
                x1 = object.left + object.width;
                y1 = object.top + (object.height / 2);
                break;

            case 'mb':
                x1 = object.left + (object.width / 2);
                y1 = object.top + object.height;
                break;
            case 'ml':
                x1 = object.left;
                y1 = object.top + (object.height / 2);
                break;

            default:
                break;
        }

        return {
            'x1': x1, 'y1': y1,
            'x2': x1, 'y2': y1
        };
    }
    function getPortOnMoving(object, canvas, objectID, column) {
        if (object.name == "p1" || object.name == "p2" || object.name == "p0") {
            return;
        }
        let ports;
        if (
            object.type === "rect" ||
            object.type === 'circle' ||
            object.type === 'ellipse' ||
            object.type === 'polygon' ||
            object.type === "path" ||
            object.type === "group" ||
            object.type === "image"
        ) {
            if (column == 1) {
                ports = ['mr'];
            }
            else {
                ports = ['ml'];
            }
        }
        if (ports && ports.length > 0 && object.type != "image" && !object.hasOwnProperty('svgUid')) {
            var points = findTargetPort(object, ports[0]);
            return { result: 0, points: points };
        }
        else if (ports && ports.length > 0) {
            var points = findTargetPortScale(object, ports[0]);
            return { result: 0, points: points };
        }
        return {
            result: -1, points: {
                'x1': 0, 'y1': 0,
                'x2': 0, 'y2': 0
            }
        };
    }

    function choosePort(canvas, objectID) {
        if (objectID == undefined || objectID == null) {
            return;
        }

        let object = canvas.getObjects().filter(obj =>
            (obj.port == "ml" || obj.port == "mr") &&
            obj.portID == objectID
        );
        if (object && object.length > 0) {
            object[0].set({
                isChosen: true,
                radius: 10,
            });
        }
        canvas.renderAll();
    }
    function unchoosePort(canvas) {
        let objects = canvas.getObjects().filter(obj =>
            (obj.port == "ml" || obj.port == "mr")
        );
        if (objects && objects.length > 0) {
            objects.forEach(object => {
                object.set({
                    isChosen: false,
                    radius: 10,
                });
            });
        }
        canvas.renderAll();
    }
    function isPortChoosen(canvas) {
        let objects = canvas.getObjects().filter(obj =>
            (obj.port == "ml" || obj.port == "mr") && obj.isChosen == true
        );
        if (objects && objects.length > 0) {
            return true;
        }
        return false;
    }
    function getLine(canvas, portId, index) {
        var pairIndex = $scope.listQuestion[index].modelFabric.resultPairs.findIndex(x => x.id1 == portId || x.id2 == portId);
        if (pairIndex != -1) {
            var pair = $scope.listQuestion[index].modelFabric.resultPairs[pairIndex];
            let objects = canvas.getObjects().filter(obj =>
                obj.linePortId == pair.id1 && obj.isLine
            );
            if (objects && objects.length > 0) {
                return objects[0];
            }
        }
        return -1;
    }
    function chooseLine(canvas, line) {
        let objects = canvas.getObjects().filter(obj =>
            obj.isLine &&
            obj.stroke == "black"
        );
        if (objects && objects.length > 0) {
            objects.forEach(object => {
                object.set({
                    stroke: "#ccc",
                    strokeWidth: 1
                });
            });
        }
        line.set({
            stroke: "black",
            strokeWidth: 2
        });
        canvas.renderAll();
        isLineChoosen = true;
    }
    function unchooseLine(canvas) {
        let objects = canvas.getObjects().filter(obj =>
            obj.isLine &&
            obj.stroke == "black"
        );
        if (objects && objects.length > 0) {
            objects.forEach(object => {
                object.set({
                    stroke: "#ccc",
                    strokeWidth: 1
                });
            });
        }
        canvas.renderAll();
        isLineChoosen = false;
    };
    function getOtherPortId(canvas, portId, index) {
        var pairIndex = $scope.listQuestion[index].modelFabric.resultPairs.findIndex(x => x.id1 == portId || x.id2 == portId);
        if (pairIndex != -1) {
            var pair = $scope.listQuestion[index].modelFabric.resultPairs[pairIndex];
            if (pair.id1 == portId) {
                return pair.id2;
            } else {
                return pair.id1;
            }
        }
        return -1;
    }
    function getPortById(canvas, portId) {
        if (portId == undefined || portId == null) {
            return -1;
        }

        let object = canvas.getObjects().filter(obj =>
            (obj.port == "ml" || obj.port == "mr") &&
            obj.portID == portId
        );
        return object[0];
    }
    function checkExistId(idX, index) {
        for (let i = 0; i < $scope.listQuestion[index].modelFabric.resultPairs.length; i++) {
            if (($scope.listQuestion[index].modelFabric.resultPairs[i].id1 == idX) || ($scope.listQuestion[index].modelFabric.resultPairs[i].id2 == idX)) {
                return true;
            }
        }
        return false;
    }
    // quiz game
    $scope.playQuizGame = function (item, index) {
        if (item.playGame == false) {
            if (isValidHttpUrl(decodeHTML(item.Content.toString()))) {
                dataserviceLms.getGameJsonData(decodeHTML(item.Content.toString()), function (rs) {
                    rs = rs.data;
                    item.playGame = true;
                    //var canvasWindow = window.open("/lib/EduComposeEngine/play.html", "_blank", "width=" + screen.availWidth + ",height=" + screen.availHeight);
                    try {
                        var content = decodeURIComponent(rs);
                        var canvasContent = { content: JSON.parse(content) };
                        canvasContent.doQuiz = true;
                        canvasContent.viewAnswer = false;
                        canvasContent.qIndex = index;
                        canvasContent.quizName = "";
                        canvasContent.played = item.played;
                        canvasContent.userResult = item.userResult;
                        canvasContent.userCanvas = item.userCanvas;
                        window.canvasData = canvasContent;
                    } catch (e) {
                        console.log(e);
                        var canvasContent = {};
                        canvasContent.doQuiz = true;
                        canvasContent.viewAnswer = false;
                        canvasContent.quizName = $scope.model.Code;
                        canvasContent.played = item.played;
                        window.canvasData = canvasContent;
                    }
                });
            }
            if ($scope.listQuestion[index].isCheck === false) {
                $scope.listQuestion[index].isCheck = true;
                $scope.currentQuestion++;
                $rootScope.progressBarAuto.progress = ($scope.currentQuestion / $scope.totalQuestion * 100).toFixed(0) + '%';
                $rootScope.progressBarAuto.style.width = $rootScope.progressBarAuto.progress;
            }
        }
        else {
            item.playGame = false;
        }
    }
    $scope.$watch(function () {
        return $window.userResultGame;
    }, function (newVal, oldVal) {
        if (newVal) {
            var qIndex = $window.userResultIndex;
            var userCanvas = $window.userCanvas;
            if ($window.userResultIndex != -1) {
                $scope.listQuestion[qIndex].userResult = newVal;
                $scope.listQuestion[qIndex].played = true;
                $scope.listQuestion[qIndex].userCanvas = userCanvas;
                $scope.listQuestion[qIndex].userPosition = userPosition;
            }
        }
    });
    $scope.$watch($rootScope.uiChange, function (newVal, oldVal) {
        var backup = angular.copy($scope.listQuestion);
        console.log('flash UI');
        $timeout(function () {
            if (backup.length > 0) {
                $scope.listQuestion = backup;
            }
            $scope.$apply;
        }, 500);
    });

    function initClockSimple(date) {
        date = date.split(':');
        toDate = new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);

        var currentDate = new Date();
        dateDif = toDate - currentDate;
        var duration = moment.duration(dateDif, 'milliseconds');
        $scope.countDown = duration.hours() + ":" + duration.minutes() + ":" + duration.seconds();
        $timeout(function () {
            $scope.$apply();
        })
        var interval = 1000;
        var ticksCount = Math.round(dateDif / 1000);
        clockTick = setInterval(function () {
            ticksCount--;
            if (ticksCount >= 0) {
                duration = moment.duration(duration - interval, 'milliseconds');
                $scope.countDown = duration.hours() + ":" + duration.minutes() + ":" + duration.seconds();
                $timeout(function () {
                    $scope.$apply();
                })
            }
            else {
                clearInterval(clockTick);
            }
        }, interval);
    };
    function isValidHttpUrl(string) {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    };
});

app.controller('addReference', function ($scope, $rootScope, $sce, $compile, $uibModal, $uibModalInstance, dataserviceEduExam, dataserviceLms, dataserviceCmsItem, $uibModal, Upload, para, $filter) {
    $scope.modelRef = { Type: "CMS" };
    $scope.idRef = -1;
    $scope.listRefType = [
        {
            Code: "CMS",
            Name: caption.LMS_PRACTICE_TEST_LBL_POST
        }, {
            Code: "VOICE",
            Name: caption.LMS_PRACTICE_TEST_LBL_SOUND
        }, {
            Code: "VIDEO",
            Name: caption.LMS_PRACTICE_TEST_LBL_VIDEO
        }, {
            Code: "IMAGE",
            Name: caption.LMS_PRACTICE_TEST_LBL_IMAGE
        },];
    $scope.reloadRef = function () {
        dataserviceEduExam.getQuizRef($scope.model.Code, function (rs) {
            rs = rs.data;
            $rootScope.listReference = rs;
            for (ref of $rootScope.listReference) {
                ref.showContent = false;
                try {
                    ref.listContent = JSON.parse(ref.RefContent);
                    for (var i = 0; i < ref.listContent.length; i++) {
                        if (ref.listContent[i].Type == "CMS") {
                            dataserviceLms.getItemCms(ref.listContent[i].Link, function (rs) {
                                rs = rs.data;
                                var cmsRefs = $rootScope.listReference.filter(x => x.Link == rs.alias);
                                if (cmsRefs.length > 0) {
                                    for (var i = 0; i < cmsRefs.length; i++) {
                                        cmsRefs[i].cmsContent = $sce.trustAsHtml(rs.full_text);
                                    }
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.log(e);
                    ref.listContent = [];
                }
            }
            console.log($rootScope.listReference);
        });
    }
    $scope.init = function () {
        $scope.model = para;
        $rootScope.idQuiz = $scope.model.Id;
        $scope.modelRef.Type = $scope.model.Type;
        $scope.reloadRef();
        //if ($scope.model.JsonRef != null && $scope.model.JsonRef != '') {
        //    $rootScope.listReference = JSON.parse($scope.model.JsonRef);
        //    $scope.reloadRef();
        //}
        //else {
        //    $rootScope.listReference = [];
        //}
        dataserviceLms.getCurrentUserFullName(function (rs) {
            rs = rs.data;
            $scope.userName = rs;
        });
        dataserviceLms.getListCmsItem(function (rs) {
            rs = rs.data;
            $scope.listCmsQuiz = rs;
            $scope.listCmsQuiz.unshift({ Code: '', Name: caption.LMS_PRACTICE_TEST_LBL_NO_SELECT });
        });
    }
    $scope.init();
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemCmsTest'];
        if (check !== undefined && $scope.modelRef.Type == "CMS") {
            var data = CKEDITOR.instances['ckEditorItemCmsTest'].getData();
            $scope.modelCmsItem.full_text = data;
        }
        if (/*!validationSelect($scope.model).Status*/true) {
            if ($scope.modelRef.Link == '' || $scope.modelRef.Link == null || $scope.modelRef.Link == undefined) {
                if ($scope.modelRef.Type == "CMS") {
                    dataserviceCmsItem.insert($scope.modelCmsItem, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $scope.modelRef.Link = $scope.modelCmsItem.alias;
                            $scope.addReference();
                            $scope.reloadRef();
                        }
                    });
                }
            }
            else {
                $scope.addReference();
            }
        }
    };
    $scope.cancel = function () {
        $rootScope.JsonData = '';
        $rootScope.JsonRef = '';
        $uibModalInstance.close();
        $rootScope.idQuiz = -1;
    }
    $scope.addReference = function () {
        var obj = {
            Code: generateUUID(),
            Link: $scope.modelRef.Link,
            Type: $scope.modelRef.Type,
            TypeName: $scope.listRefType.find(x => x.Code == $scope.modelRef.Type).Name,
            CreatedBy: $scope.userName,
            CreatedTime: new Date(Date.now()).toLocaleString()
        }

        if ($scope.idRef == -1) {
            var listContent = [];
            listContent.push(obj);

            var refData = {
                QuizCode: $scope.model.Code,
                UserCreateRef: $scope.userName,
                RefContent: JSON.stringify(listContent)
            }
            dataserviceEduExam.insertQuizRef(refData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $scope.idRef = rs.ID;
                    $scope.reloadRef();
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
        else {
            var indexRef = $rootScope.listReference.findIndex(x => x.Id == $scope.idRef);
            if (indexRef != -1) {

                $rootScope.listReference[indexRef].listContent.push(obj);
                var refData = {
                    QuizCode: $scope.model.Code,
                    UserCreateRef: $scope.userName,
                    RefContent: JSON.stringify($rootScope.listReference[indexRef].listContent)
                }
                dataserviceEduExam.insertQuizRef(refData, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        return App.toastrError(rs.Title);
                    } else {
                        $scope.idRef = rs.ID;
                        $scope.reloadRef();
                        return App.toastrSuccess(rs.Title);
                    }
                });
            }
        }
    };
    $scope.loadImageRef = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp" && extFile != "svg") {
            App.toastrError(caption.COM_MSG_FORMAT_IMAGE);
            return;
        }
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ModuleName = "LMS_QUIZ_REF";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.modelRef.Link = result.Object;
                    $scope.ImageRef = $scope.modelRef.Link != null && $scope.modelRef.Link != '' ? $scope.modelRef.Link.split('/').pop() : '';
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
            });
        }
    };
    $scope.loadVoiceRef = function (event) {
        var files = event.target.files;
        var idxDot = files[0].name.lastIndexOf(".") + 1;
        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        if (extFile != "jpg" && extFile != "mp3" && extFile != "wav"/* && extFile != "gif" && extFile != "bmp" && extFile != "svg"*/) {
            App.toastrError(caption.LMS_PRACTICE_TEST_MSG_ERR_SOUND); //caption.COM_MSG_FORMAT_IMAGE
            return;
        }
        var file = event.target.files[0];
        if (file == '' || file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if (file.size > 20971520) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = {};
            data.FileUpload = file;
            data.ModuleName = "LMS_QUIZ_REF";
            data.IsMore = false;

            Upload.upload({
                url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
                data: data
            }).then(function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.modelRef.Link = result.Object;
                    $scope.VoiceRef = $scope.modelRef.Link != null && $scope.modelRef.Link != '' ? $scope.modelRef.Link.split('/').pop() : '';
                }
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
            });
        }
    };
    $scope.uploadBlob = function (blob, ext) {
        var data = {};
        var file = new File([blob], create_UUID() + ext);
        data.FileUpload = file;
        data.ModuleName = "LMS_QUIZ_REF";
        data.IsMore = false;

        Upload.upload({
            url: '/Admin/LmsDashBoard/InsertObjectFileSubject/',
            data: data
        }).then(function (result) {
            result = result.data;
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                $scope.modelRef.Link = result.Object;
                $scope.VoiceRef = $scope.modelRef.Link != null && $scope.modelRef.Link != '' ? $scope.modelRef.Link.split('/').pop() : '';
            }
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
        });
    }
    $scope.deleteReference = function (data) {
        if ($rootScope.listReference.indexOf(data) == -1) {
            App.toastrError(caption.LMS_PRACTICE_TEST_DELETE_ERR);
        } else {
            if (data.UserCreateRef != $scope.userName) {
                App.toastrError(caption.COM_MSG_NO_PERMISSION);
            }
            // if data is Cms delete Cms too
            if (data.Id != undefined) {
                dataserviceEduExam.deleteQuizRef(data.Id, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        return App.toastrError(rs.Title);
                    } else {
                        $scope.reloadRef();
                        return App.toastrSuccess(rs.Title);
                    }
                });
            }
        }
    };

    $scope.changeType = function () {
        $scope.modelRef.Link = '';
    }

    $scope.updateReference = function (code) {
        var item = $rootScope.listReference.find(function (element) {
            if (element.Code == code) return true;
        });

        if (item != null && item != undefined && item != '') {
            item.IsRef = !item.IsRef;

            $rootScope.JsonRef = JSON.stringify($rootScope.listReference);
            var refData = {
                Id: $rootScope.idQuiz,
                JsonRef: $rootScope.JsonRef
            }

            dataserviceLms.updateReference(refData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItemCmsTest', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        //CKEDITOR.instances['ckEditorItemCms'].config.height = 80;
    }
    $scope.viewReference = function (index) {
        var showContent = $rootScope.listReference[index].showContent;
        for (ref of $rootScope.listReference) {
            ref.showContent = false;
            $rootScope.listReference[index].showContent = !showContent;
        }
    }
    $scope.showVideo = function (link) {
        $rootScope.video = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/show-video.html',
            controller: function ($scope, $uibModalInstance, youtubeEmbedUtils) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reloadExam();
        }, function () {
        });
    };
    $scope.playAudio = function (link) {
        $rootScope.audio = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/play-audio.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reloadExam();
        }, function () {
        });
    };
    $scope.viewImage = function (link) {
        $rootScope.imageForView = link;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsDashBoard + '/view-image.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            //$scope.reloadExam();
        }, function () {
        });
    };
    $scope.viewCms = function (link) {
        dataserviceLms.getItemCms(link, function (rs) {
            rs = rs.data;
            $rootScope.cmsContent = $sce.trustAsHtml(rs);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/view-cms.html',
                controller: function ($scope, $uibModalInstance, $sce) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                backdrop: 'static',
                size: '50'
            });
            modalInstance.result.then(function (d) {
                //$scope.reloadExam();
            }, function () {
            });
        });
    };
    // CMS Item CRUD
    $scope.modelCmsItem = {
        alias: '',
        title: '',
        cat_id: 228,
        published: true,
        full_text: '',
        created_by_alias: ''
    }
    $scope.ConvertToAlias = function (strInput) {
        strInput = strInput.toLowerCase().trim();
        strInput = strInput.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        strInput = strInput.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        strInput = strInput.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        strInput = strInput.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        strInput = strInput.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        strInput = strInput.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        strInput = strInput.replace(/đ/g, "d");
        strInput = strInput.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g, "-");
        strInput = strInput.replace(/-+-/g, "-"); //thay thế 2- thành 1-
        strInput = strInput.replace(/^\-+|\-+$/g, "");//cắt bỏ ký tự - ở đầu và cuối chuỗi
        $scope.modelCmsItem.alias = strInput;
    };
    setTimeout(function () {
        ckEditer();
    }, 500);
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
});

app.controller('sharePracticeTest', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceEduExam, para) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    };

    $scope.model = {
        UserName: ''
    };
    $scope.modelClass = {
        Code: ''
    }
    $scope.modelShare = {
        isPublic: false
    }

    $scope.model1 = {
        UserName: '',
        GivenName: ''
    };

    $scope.init = function () {
        $scope.model.Id = para.Id;
        $scope.listUser = [
            {
                UserName: 'All',
                GivenName: caption.LMS_USER_ALL
            }
        ];
        dataserviceEduExam.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listUser = $scope.listUser.concat(rs);
        });

        dataserviceEduExam.getUserSharePracticeTestPermission($scope.model.Id, function (rs) {
            rs = rs.data;
            $scope.lstUserSharePermission = rs;
            var allIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName == "All");
            if (allIndex != -1) {
                $scope.lstUserSharePermission = $scope.lstUserSharePermission.filter(x => x.UserName == "All");
            }
        })

        dataserviceEduExam.getListClass(function (rs) {
            rs = rs.data;
            $scope.listClass = rs;
        });
    };

    $scope.init();

    $scope.share = function () {
        if ($scope.model.UserName == '' && $scope.modelShare.isPublic !== true) {
            return App.toastrError(caption.LMS_QUIZ_MUST_CHOOSE_USER);
        }
        var allIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName === "All");
        if (allIndex !== -1) {
            return App.toastrError(caption.LMS_QUIZ_ALREADY_ADD_ALL);
        }

        var model = angular.copy($scope.model1);
        if ($scope.modelShare.isPublic === true) {
            $scope.lstUserSharePermission = [];
            $scope.lstUserSharePermission.push({
                UserName: 'All',
                GivenName: caption.LMS_USER_ALL
            });
            var share = JSON.stringify($scope.lstUserSharePermission);

            var answerData = {
                Id: $scope.model.Id,
                Share: share
            }

            dataserviceEduExam.updatePracticeTestPermission(answerData,
                function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                });
        }
        else if (model.UserName === "All") {
            $scope.addUser(0);
        }
        else {
            var userIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName === model.UserName);
            if (userIndex !== -1) {
                App.toastrError(caption.LMS_STUDENT_EXIST);
            }
            else {
                $scope.lstUserSharePermission.push(model);
                var share = JSON.stringify($scope.lstUserSharePermission);

                var answerData = {
                    Id: $scope.model.Id,
                    Share: share
                }

                dataserviceEduExam.updatePracticeTestPermission(answerData, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        return App.toastrError(rs.Title);
                    } else {
                        return App.toastrSuccess(rs.Title);
                    }
                });
            }
        }
    }

    $scope.addUser = function (index) {
        if (index >= $scope.listUser.length) {
            return;
        }
        var model = $scope.listUser[index];
        var userIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName === model.UserName);
        if (userIndex !== -1) {
            App.toastrError(caption.LMS_STUDENT_EXIST);
            $scope.addUser(index + 1);
        }
        else if (model.UserName === "All") {
            $scope.addUser(index + 1);
        }
        else {
            $scope.lstUserSharePermission.push(model);
            var share = JSON.stringify($scope.lstUserSharePermission);

            var answerData = {
                Id: $scope.model.Id,
                Share: share
            }

            dataserviceEduExam.updatePracticeTestPermission(answerData,
                function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        $scope.addUser(index + 1);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.addUser(index + 1);
                    }
                });
        }
    }

    $scope.classOff = function () {
        $scope.modelClass = {
            Code: ''
        };
        $scope.listUser = [
            {
                UserName: 'All',
                GivenName: caption.LMS_USER_ALL
            }
        ];
        dataserviceEduExam.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listUser = $scope.listUser.concat(rs);
        });
    }

    var allMember = {
        UserId: "ALL",
        GivenName: caption.LMS_USER_ALL,
        UserName: "All",
        RoleSys: "",
        Branch: "",
        DepartmentName: ""
    }

    $scope.classSelect = function (obj) {
        $scope.listUser = [];
        dataserviceEduExam.getListUserOfClass($scope.modelClass.Code, function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
            $scope.countUser = rs.length;
            $scope.listUser.unshift(allMember);
            $scope.isClassSelect = true;
        });
    }

    $scope.deleteShare = function (userName) {
        var userIndex = $scope.lstUserSharePermission.findIndex(x => x.UserName == userName);
        if (userIndex == -1) {
            return App.toastrError(caption.LMS_QUIZ_USER_NOT_EXIST);
        }

        $scope.lstUserSharePermission.splice(userIndex, 1);
        var share = JSON.stringify($scope.lstUserSharePermission);

        var answerData = {
            Id: $scope.model.Id,
            Share: share
        }

        dataserviceEduExam.updatePracticeTestPermission(answerData, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                return App.toastrError(rs.Title);
            } else {
                return App.toastrSuccess(rs.Title);
            }
        });
    }

    $scope.changeUser = function (item) {
        $scope.model1.GivenName = item.GivenName;
        $scope.model1.UserName = item.UserName;
        //$scope.model1.DepartmentName = item.DepartmentName;
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});