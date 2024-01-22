var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderLmsAssignment = "/views/admin/lmsAssignment";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM_LMS_ASSIGN', ['App_ESEIM_EDU_EXAM', 'App_ESEIM_LMS_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'youtube-embed'])
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

app.directive('sameHeight', function ($timeout) {
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
})

app.factory('dataserviceLmsAssign', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
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
    var submitFormUpload1 = function (url, data, callback) {
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
        $http(req).then(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/LmsExam/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/LmsExam/Update/', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/LmsExam/GetItem', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/LmsExam/Delete?id=' + data).then(callback);
        },
        getListExamInheritance: function (data, callback) {
            $http.post('/Admin/LmsExam/GetListExamInheritance?code=' + data).then(callback);
        },
        insertQuestion: function (data, callback) {
            $http.post('/Admin/LmsExam/InsertQuestion/', data).then(callback);
        },
        logSession: function (data, callback) {
            $http.post('/Admin/LmsExam/LogSession/', data).then(callback);
        },
        deleteQuestion: function (data, callback) {
            $http.post('/Admin/LmsExam/DeleteQuestion?id=' + data).then(callback);
        },
        getListQuestion: function (data, data1, data2, callback) {
            $http.post('/Admin/LmsAssignment/GetListQuestion?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callback);
        },
        getListDetailQuiz: function (data, data1, callback) {
            $http.post('/Admin/LmsAssignment/GetListDetailQuiz?lectureCode=' + data + '&sessionCode=' + data1).then(callback);
        },
        getEvent: function (data, callback) {
            $http.get('/Admin/LmsAssignment/GetEvent').then(callback);
        },
        updateDoingExerciseProgress: function (data, callback) {
            $http.post('/Admin/LmsAssignment/UpdateDoingExerciseProgress?id=' + data).then(callback);
        },
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_LMS_ASSIGN', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLmsAssign, $cookies, $translate) {
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
                Title: {
                    required: true,
                    regx: /^[^\s].*/
                },
                Duration: {
                    required: true,
                    regx: /^[^\s].*/
                },
            },
            messages: {
                Title: {
                    required: caption.LMS_ASSIGNMENT_REQUEST_HEADER,
                    regx: caption.LMS_ASSIGNMENT_TITLE_NOT_START_SPACE
                },
                Duration: {
                    required: caption.LMS_ASSIGNMENT_REQUEST_DURATION,
                    regx: caption.LMS_ASSIGNMENT_REQUEST_HEADER
                },
            }
        }
    });
    $rootScope.isAdded = false;
    $rootScope.listUnit = [
        {
            Code: "MINUTE",
            Name: "Phút"
        }, {
            Code: "HOUR",
            Name: "Giờ"
        },];
    $rootScope.page = 1;
    $rootScope.pageSize = 10;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsAssignment/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderLmsAssignment + '/index.html',
            controller: 'index'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceLmsAssign, $translate, $window, $filter) {
    $("#breadcrumbIndex").appendTo("#breadcrumb-container");
    var vm = $scope;
    $scope.model = {
        Title: '',
        PostFromDate: '',
        PostToDate: '',
        FromDate: '',
        ToDate: '',
        Category: '',
        Status: '',
        TypeItem: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsAssignment/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Keyword = $scope.model.Keyword;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Teacher = $scope.model.Teacher;
                d.Author = $scope.model.Author;
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                console.log(d);
                heightTableManual(320, '#tblData');
                $scope.totalAssignments = d.responseJSON.recordsTotal;
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(4)
        .withOption('order', [2, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
                console.log('translated');
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
            //$(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //    } else {
            //        var Id = data.Id;
            //        $scope.edit(Id);
            //    }
            //});
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"LMS_ASSIGNMENT_TYPE_STT" | translate}}').notSortable().withOption('sClass', 'tcenter wpercent5').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LectName').withTitle('{{ "LMS_ASSIGNMENT_LESSON" | translate}}').renderWith(function (data, type, full) {
        //full.Author = "Tác giả";
        var author = full.Author != null && full.Author != '' && full.Author != undefined ?
            '<span class="fs10"> ' + /*caption.MS_LBL_TIME_MEETING*/ caption.LMS_ASSIGNMENT_AUTHOR + ': ' + full.Author + '</span>' : '';
        return '<span class="text-important">' + data + '</span>' +
            '<br />' + '<span class="fs10"> ' + /*caption.MS_LBL_TIME_MEETING*/ caption.LMS_ASSIGNMENT_NUMBER_OF_QUESTIONS + ': ' + full.QuizCount + '</span>' +
            '<br />' + author;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectName').withOption('sClass', '').withTitle('{{"Môn học" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('LmsTaskName').withOption('sClass', '').withTitle('{{"Nhiệm vụ" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withOption('sClass', 'wpercent10').withTitle('{{"LMS_ASSIGNMENT_STATUS_START" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withOption('sClass', 'wpercent10').withTitle('{{"LMS_ASSIGNMENT_STATUS_END" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProgressAuto').withOption('sClass', 'wpercent5').withTitle('{{"LMS_ASSIGNMENT_PROGRESS" | translate}}').renderWith(function (data, type) {
        return data + '%';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'tcenter nowrap wpercent5').withTitle('{{"LMS_ASSIGNMENT_DO_HOMEWORK" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title1="{{&quot;COM_BTN_EDIT&quot; | translate}}" title="Làm thử" ng-click="test(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0;" class="text-green"><i class="fa fa-play"></i></button>' +
            '<br />' + '<span class="fs10"> ' + /*caption.MS_LBL_TIME_MEETING*/ caption.LMS_ASSIGNMENT_NUMBER_TIME + ': ' + full.DoCount + '</span>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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

    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }

    $scope.test = function (id) {
        var dataModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                dataModel = listdata[i];
                break;
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsAssignment + '/test.html',
                controller: 'exercise',
                backdrop: 'static',
                backdropClass: 'custom-black full-opacity',
                size: '90',
                resolve: {
                    para: function () {
                        return dataModel;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
            }, function () {
            });
        }
    }
    $scope.initData = function () {
        dataserviceLmsAssign.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
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
            aspectRatio: 2,
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
                dataserviceLmsAssign.getEvent("", function (rs) {
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
                    + '' + /*caption.MS_LBL_MEETING*/ caption.LMS_ASSM_LBL_EXERCISE + ': ' + calEvent.title + ' [' + calEvent.progress + '%]' + author +
                    '<br />' + /*caption.MS_LBL_TIME_MEETING*/ caption.LMS_ASSM_LBL_EXERCISE_TIME + ': ' + calEvent.timemeet +
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
});

app.controller('exercise', function ($scope, $rootScope, $compile, $controller, $uibModal, $uibModalInstance, dataserviceLmsAssign, dataserviceLms, para, $sce) {
    $scope.loadDetailLecture = function () {
        dataserviceLmsAssign.getListDetailQuiz($scope.LectCode, sessionCode, function (rs) {
            rs = rs.data;
            $scope.isAlreadyDone = rs.Object.isAlreadyDone;
            $scope.listQuestion = rs.Object.details;
            $scope.duration = rs.Object.totalDuration;
            $scope.examTime = new moment();
            $scope.examDeadline = moment($scope.examTime).add(parseInt($scope.duration), 'm').format("YYYY:MM:DD:HH:mm:ss"); //2021:11:22:14:20:00
            //setTimeout(function () {
            //    countDownClock.iniClock($scope.examDeadline);
            //}, 500);
            for (var i = 0; i < $scope.listQuestion.length; i++) {
                $scope.listQuestion[i].Content = $sce.trustAsHtml($scope.listQuestion[i].Content)/*($scope.listQuestion[i].Content)*/;
                if ($scope.listQuestion[i].JsonData != null && $scope.listQuestion[i].JsonData != '') {
                    $scope.listQuestion[i].listAnswer = JSON.parse($scope.listQuestion[i].JsonData);
                }
                else {
                    $scope.listQuestion[i].listAnswer = [];
                }
                $scope.listQuestion[i].containVideo = {};
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
                }
            }
            $rootScope.progressBar.progress = ($scope.currentPoint / $scope.totalPoint * 100).toFixed(0) + '%';
            $rootScope.progressBar.style.width = $rootScope.progressBar.progress;
        });
    }
    $rootScope.data = {
        fromExam: false
    };
    $controller('test', { $scope: $scope, $uibModalInstance: $uibModalInstance, para: $rootScope.data });
    initData = function () {
        $scope.LectCode = para.LectCode;
        $scope.AssignId = para.Id;
        $scope.model.typeTraining = "DO_EXERCISE";
        $scope.model.objectCode = $scope.LectCode;
        $scope.loadDetailLecture();
    }
    initData();
    $scope.submit = function () {
        dataserviceEduExam.updateDoingExerciseProgress($scope.AssignId, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
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