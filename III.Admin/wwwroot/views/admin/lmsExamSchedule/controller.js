var ctxfolderExamSchedule = "/views/admin/lmsExamSchedule";
var ctxfolderWorkingSchedule = "/views/admin/weekWorkingSchedule";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderLmsPracticeTest = "/views/admin/lmsPracticeTest";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_EXAM_SCHEDULE', ["App_ESEIM_EDU_EXAM", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", "ngCookies", 'ngSanitize']);

app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getListUser: function (callback) {
            $http.get('/Admin/LmsExamSchedule/GetListUser').then(callback);
        },
        getListUserJoined: function (data, callback) {
            $http.post('/Admin/LmsExamSchedule/GetListUserJoined?users=' + data).then(callback);
        },
        getCurrentUser: function (callback) {
            $http.post('/Admin/WeekWorkingSchedule/GetCurrentUser').then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/LmsExamSchedule/GetListStatus').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/LmsExamSchedule/Insert/', data).then(callback);
        },
        paste: function (data, callback) {
            $http.post('/Admin/LmsExamSchedule/Paste/', data).then(callback);
        },
        updateOnDrag: function (data, callback) {
            $http.post('/Admin/LmsExamSchedule/UpdateOnDrag', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/LmsExamSchedule/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/LmsExamSchedule/Delete/' + data).then(callback);
        },
        updateStatus: function (data, callback) {
            $http.post('/Admin/LmsExamSchedule/UpdateStatus/', data).then(callback);
        },
        updateAutoStatus: function (callback) {
            $http.post('/Admin/LmsExamSchedule/UpdateAutoStatus').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/LmsExamSchedule/GetItem?id=' + data).then(callback);
        },
        getItemTest: function (data, callbackExam) {
            $http.post('/Admin/LmsExamSchedule/GetItemTest?id=' + data).then(callbackExam);
        },
        getAllEvent: function (callback) {
            $http.get('/Admin/LmsExamSchedule/GetAllEvent').then(callback);
        },
        getListAccount: function (callback) {
            $http.get('/Admin/LmsExamSchedule/GetListAccount').then(callback);
        },
        getListCmsItem: function (data, data1, data2, callback) {
            $http.post('/Admin/WeekWorkingSchedule/GetListCmsItem?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callback);
        },
        getItemCms: function (data, callback) {
            $http.post('/Admin/WeekWorkingSchedule/GetItemCms?code=' + data).then(callback);
        },
        getListUserConnected: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListUserConnected').then(callback);
        },
        getListSubjectWithPage: function (data, data1, data2, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetListSubject?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callbackExam);
        },
        getSingleSubject: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetSingleSubject?subjectCode=' + data).then(callbackExam);
        },
        getListPractice: function (data, data1, data2, data3, callbackExam) {
            $http.post('/Admin/LmsExamSchedule/GetListPractice?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2 + '&subject=' + data3).then(callbackExam);
        },
        getSinglePractice: function (data, callbackExam) {
            $http.post('/Admin/LmsExamSchedule/GetSinglePractice?practiceCode=' + data).then(callbackExam);
        },
        getListDetailQuiz: function (data, data1, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetListDetailQuiz?practiceTestCode=' + data + '&sessionCode=' + data1).then(callbackExam);
        },
        trackDilligence: function (data, callback) {
            $http.post('/Admin/LmsPracticeTest/TrackDilligence/', data).then(callback);
        },
        getListClass: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListClass').then(callback);
        },
        getListUserOfClass: function (data, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListUserOfClass?classCode=' + data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_EXAM_SCHEDULE', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
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

        $rootScope.validationOptions = {
            rules: {
                ExamCode: {
                    required: true,
                },
                Title: {
                    required: true,
                },
                StartTime: {
                    required: true,
                },
                EndTime: {
                    required: true,
                }
            },
            messages: {
                ExamCode: {
                    required: caption.LMS_VALIDATE_EXAM_CODE,
                },
                Title: {
                    required: caption.MS_VALIDATE_TITLE,
                },
                StartTime: {
                    required: caption.MS_VALIDATE_STARTTIME,
                },
                EndTime: {
                    required: caption.MS_VALIDATE_END_TIME,
                }
            }
        }

        //dataservice.getListUser(function (rs) {
        //    rs = rs.data;
        //    $rootScope.listUser = rs;
        //    var all = {
        //        UserName: '',
        //        GivenName: caption.MS_TXT_ALL
        //    }
        //    $rootScope.listUser.unshift(all)
        //});

        dataservice.getListAccount(function (rs) {
            rs = rs.data;
            $rootScope.listAccount = rs;
        });
    });
    $rootScope.session = null;
    $rootScope.pageP = 1;
    $rootScope.pageSizeP = 10;
    $rootScope.pageS = 1;
    $rootScope.pageSizeS = 10;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsExamSchedule/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderExamSchedule + '/index.html',
            controller: 'indexExamSchedule'
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

app.controller('indexExamSchedule', function ($scope, $rootScope, $compile, $confirm, $document, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $("#breadcrumb").addClass('hidden');
    $("#breadcrumbIndex").appendTo("#breadcrumb-container");
    $scope.search = function () {
        $('#calendarExam').fullCalendar('refetchEvents');
    }
    $scope.model = {
        Date: moment().format('DD/MM/YYYY')
    };
    var vm = $scope;// exam
    $scope.headerCompiledExam = false;
    $scope.selectedExam = [];
    $scope.selectAllExam = false;
    $scope.toggleAllExam = toggleAllExam;
    $scope.toggleOneExam = toggleOneExam;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAllExam" ng-click="toggleAllExam(selectAllExam, selected)"/><span></span></label>';
    vm.dtOptionsExam = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsExamSchedule/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Date = $scope.model.Date;
                d.OnlyAssignment = true;
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
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn("ActivityId").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            //$scope.selected[full.Id] = false;
            //return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
            return "";
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('Id').withTitle('ID').withOption('sClass', 'text-center nowrap w-5-percent').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('Title').withTitle('{{ "LMS_PRACTICE_TEST_LBL_TITLE" | translate }}').renderWith(function (data, type, full) {
        return '<a class="color-dark fs14" ng-click="joinMeeting(' + full.MeetingId + ', ' + full.Id + '' + ')"><i class="fas fa-video fs10 text-green pr10"></i>' + data + '</a>';
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('StartDate').withTitle('<i class="fas fa-stopwatch fs10 text-green"></i> {{ "LMS_START_DATE" | translate }}').withOption('sClass', 'w20 fs10').renderWith(function (data, type) {
        return data; /*MS_HDR_START*/
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('EndDate').withTitle('<i class="fas fa-clock fs10 text-green"></i> {{ "LMS_END_DATE" | translate }}').withOption('sClass', 'w20 fs10').renderWith(function (data, type) {
        return data; /*MS_HDR_END*/
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('ListUserJoined').withTitle('{{ "LMS_LIST_STUDENT_JOINED" | translate }}').withOption('sClass', 'w20 text-center').renderWith(function (data, type) {
        var elements = '';
        try {
            if (data != null && data != '' && data != undefined) {
                var listUserApproved = JSON.parse(data);
                for (var i in listUserApproved) {
                    if (listUserApproved[i].userName != "") {
                        elements += (listUserApproved[i].userName + (i != listUserApproved.length - 1 ? ', ' : ''));
                    }
                    else {
                        elements = caption.MS_TXT_ALL;
                        break;
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
        return '<a title="{{&quot;LMS_LIST_STUDENT_JOINED&quot; | translate}}" ng-click="showListUser(\'' +
            elements +
            '\')"  class="fs25"><i class="fas fa-user-edit color-dark"></i></a>';
        /*if (full.IsShared === "True" || full.IsAssignment === "True" || full.IsEditable === "True") {
            return '<a title="{{&quot;LMS_LIST_STUDENT_JOINED&quot; | translate}}" ng-click="showListUser(\'' +
                elements +
                '\')"  class="fs25"><i class="fas fa-users color-dark"></i></a>';
        } else {
            return '<a title="{{&quot;LMS_LIST_STUDENT_JOINED&quot; | translate}}" ng-click="showListUser(\'' +
                elements +
                '\')"  class="fs25 disabled-element"><i class="fas fa-users color-dark"></i></a>';
        }*/
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('DoPractice').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{ "LMS_PRACTICE_TEST_LBL_TEST" | translate }}').renderWith(function (data, type, full, meta) {
        if (full.IsShared === "True" || full.IsAssignment === "True" || full.IsEditable === "True") {
            return '<a title="{{&quot;LMS_PRACTICE_TEST_LBL_TEST&quot; | translate}}" ng-click="prepareExam(' + full.Id + ',\'' + full.StartDate + '\',\'' + full.EndDate + '\')"  class="fs25"><i class="fas fa-play text-green"></i></a>';
        }
        else {
            return '<a title="{{&quot;LMS_PRACTICE_TEST_LBL_TEST&quot; | translate}}" ng-click="prepareExam(' + full.Id + ',\'' + full.StartDate + '\',\'' + full.EndDate + '\')"  class="fs25 disabled-element"><i class="fas fa-play text-green"></i></a>';
        }
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('Action').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        if (full.IsEditable === "True") {
            return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="editExamSchedule(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
        }
        else {
            return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="editExamSchedule(' + full.Id + ')"  class="fs25 pr10 disabled-element"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
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

    $scope.showListUser = function (users) {
        dataservice.getListUserJoined(users, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderExamSchedule + '/show-user-joined.html',
                //openedClass: 'vertical-container',
                //windowClass: 'vertical-center',
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.listUser = para;
                    $scope.ok = function () {
                        $uibModalInstance.close(true);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };
                },
                backdrop: 'static',
                size: '40',
                keyboard: false,
                resolve: {
                    para: function () {
                        return rs;
                    }
                }
            });
            modalInstance.result.then(function (d) {

            }, function () { });
        });
    };
    $scope.addExamSchedule = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderExamSchedule + '/add.html',
            controller: 'add',
            backdrop: 'static',
            keyboard: false,
            size: '55',
        });
        modalInstance.result.then(function (d) {
            $('#calendarExam').fullCalendar('refetchEvents');
            $scope.reloadExam();
        }, function () {
        });
    }

    $scope.editExamSchedule = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderExamSchedule + '/add.html',
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
                    $('#calendarExam').fullCalendar('refetchEvents');
                    $scope.reloadExam();
                }, function () {
                });
            }
        });
    }

    $scope.prepareExam = function (id, timeStart, timeEnd) {
        var msg = checkTime(timeStart, timeEnd);
        if (msg.Error) {
            return App.toastrError(msg.Message);
        } else {
            $scope.joinExam(id);
        }
    }

    $scope.joinExam = function (id) {
        dataservice.getItemTest(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                rs.Object.fromPractice = false;
                rs.Object.fromExam = true;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsPracticeTest + '/test.html',
                    controller: 'doExam',
                    backdrop: 'static',
                    backdropClass: 'custom-black full-opacity',
                    windowClass: 'no-scroll',
                    size: '90',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    clearInterval(clockTick);
                    $scope.reloadExam();
                }, function () {
                    clearInterval(clockTick);
                });
            }
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.LMS_EXS_DELETE_CONFIRM_MSG + "?";
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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
            $('#calendarExam').fullCalendar('refetchEvents');
            $scope.reloadExam();
        }, function () {
        });
    }

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
            dayNames: [caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],
            monthNames: [caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            monthNamesShort: [caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            dayNamesShort: [caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],
            buttonText: {
                today: caption.STRE_CURD_TAB_WORK_CALENDAR_BTN_TODAY,
                month: 'M',
                agendaWeek: 'W',
                agendaDay: 'D',
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                dataservice.getAllEvent(function (rs) {
                    rs = rs.data;
                    var event = [];
                    for (var i = 0; i < rs.length; i++) {
                        var obj = {
                            title: rs[i].title,
                            code: rs[i].code,
                            start: rs[i].start,
                            value: rs[i],
                            end: rs[i].end,
                            className: rs[i].className,
                            color: rs[i].color,
                            displayEventTime: false,
                            description: rs[i].description,
                            practiceTestCode: rs[i].practiceTestCode,
                            id: rs[i].Id,
                            timemeet: moment(rs[i].start).format("HH:mm") + ' - ' + moment(rs[i].end).format("HH:mm"),
                        }
                        event.push(obj);
                    }
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                if (calEvent.edit) {
                    $scope.editExamSchedule(calEvent.value.id);
                } else if (calEvent.copy) {
                    $rootScope.session = calEvent.value;
                } else {
                    var msg = checkTime(calEvent.value.start, calEvent.value.end);
                    if (msg.Error) {
                        return App.toastrError(msg.Message);
                    } else {
                        $scope.joinExam(calEvent.value.Id);
                    }
                }
            },
            eventOrder: "-date",
            eventMouseover: function (calEvent, jsEvent) {
                var tooltip = '<div class="tooltipevent"' +
                    'style="width: 250px; background:#c6ef9c; color: #000; position: absolute; border-radius: 10px; padding: 5px;">'
                    + '' + caption.LMS_LBL_EXAM + ': ' + calEvent.title +
                    '<br />' + caption.MS_LBL_TIME_MEETING + ': ' + calEvent.timemeet +
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
            eventDrop: function (event, delta, revertFunc) {
                var obj = {
                    Id: event.value.Id,
                    StartTime: moment(event.start).format("DD/MM/YYYY HH:mm"),
                }
                dataservice.updateOnDrag(obj, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        revertFunc();
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $('#calendarExam').fullCalendar('refetchEvents');
                    }
                })
            },
            eventRender: function (event, element) {
                var originalClass = element[0].className;
                element[0].className = originalClass + ' hasmenu';
                element[0].setAttribute("data-event-id", event.value.Id);
                //element[0].setAttribute("data-event-meeting-id", event.value.MeetingId);
            },
            select: function (start) {
                $scope.model.Date = start.format("DD/MM/YYYY");
                $scope.reloadExam();
                //alert('selected ' + start.format("DD/MM/YYYY"));
            }
            //dayRender: function (day, cell) {
            //    var originalClass = cell[0].className;
            //    cell[0].className = originalClass + ' hasmenu';
            //    //cell[0].setAttribute("data-cell-day", day.format("DD/MM/YYYY HH:mm"));
            //},
        });
        $('#' + id).contextmenu({
            delegate: ".hasmenu",
            preventcontextmenuforpopup: true,
            preventselect: true,
            menu: [
                /*{ title: "copy", cmd: "copy", uiIcon: "ui-icon-copy" },*/
                { title: "edit", cmd: "edit", uiIcon: "ui-icon-edit" },
                /*{ title: "paste", cmd: "paste", uiIcon: "ui-icon-clipboard"},*/
                { title: "delete", cmd: "delete", uiIcon: "ui-icon-trash" },
            ],
            select: function (event, ui) {
                // logic for handing the selected option
                if (ui.cmd == "edit") {
                    var id = ui.target.closest('a').attr("data-event-id");
                    //var meetingId = ui.target.closest('a').attr("data-event-meeting-id");
                    $scope.editExamSchedule(id);
                }
                else if (ui.cmd == "delete") {
                    var id = ui.target.closest('a').attr("data-event-id");
                    $scope.delete(id);
                }
            },
            beforeopen: function (event, ui) {
                // things to happen right before the menu pops up
                ui.menu.zIndex($(event.target).zIndex() + 1);
                ui.target.attr("data-event-id");
            }
        });
    }

    function checkTime(startTime, endTime) {
        var msg = {
            Error: true,
            Message: ''
        };

        var date = new Date();
        var timeNow = date.getTime();

        var dateStart = new Date(startTime);
        var timeStart = dateStart.getTime();

        var dateEnd = new Date(endTime);
        var timeEnd = dateEnd.getTime();

        if (timeNow < timeStart) {
            msg.Message = caption.MS_LBL_MEETING_NOT_IN_TIME;
        } else if (timeNow >= timeStart && timeNow <= timeEnd) {
            msg.Error = false;
            msg.Message = caption.MS_LBL_MEETING_READY;
        } else {
            msg.Message = caption.MS_LBL_MEETING_OUT_TIME;
        }

        return msg;
    }

    setTimeout(function () {
        loadCalendar("calendarExam");
    }, 500);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $sce, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataservice) {
    $scope.listStatus = [{
        Code: 'WORKING_SCHEDULE_NOT_APPROVED',
        Name: caption.LMS_NOT_APPROVED
    },
    {
        Code: 'WORKING_SCHEDULE_APPROVED',
        Name: caption.LMS_APPROVED
    },];
    $scope.model1 = {
        ListUser: [],
        UserName: '',
        GivenName: '',
        Status: 'WORKING_SCHEDULE_NOT_APPROVED'
    };
    $scope.model2 = {
        CmsItemCode: '',
        CmsItemName: ''
    }
    $scope.isUserInList = false;
    $scope.countUserApproved = 0;
    $scope.listUserApproved = [];
    $scope.listCmsItem = [];
    $scope.listRef = [];
    $scope.logStatus = [];
    $scope.isStatusChanged = false;
    $scope.listPracticeTest = [];
    $scope.listSubject = [];
    $rootScope.codeSearchP = "";
    $rootScope.codeSearchS = "";
    $scope.listColor = [
        //{
        //    Id: 0,
        //    Check: true,
        //    BackgroundColor: '#f1f1f1',
        //    BackgroundImage: '',
        //},
        /*{
            Id: 1,
            Check: true,
            BackgroundColor: '#179da7',
            BackgroundImage: '',
        }, {
            Id: 2,
            Check: false,
            BackgroundColor: '#17a742',
            BackgroundImage: '',
        }, {
            Id: 3,
            Check: false,
            BackgroundColor: 'rgb(14, 220, 222)',
            BackgroundImage: '',
        },*/ {
            Id: 4,
            Check: true,
            BackgroundColor: 'rgb(255, 156, 25)',
            BackgroundImage: '',
        }, {
            Id: 5,
            Check: false,
            BackgroundColor: 'rgb(26, 219, 91)',
            BackgroundImage: '',
        }, {
            Id: 6,
            Check: false,
            BackgroundColor: 'rgb(255, 92, 161)',
            BackgroundImage: '',
        }];
    $scope.modelClass = {
        Code: ''
    }
    $scope.model = {
        ExamCode: '',
        Title: '',
        StartTime: '',
        EndTime: '',
        Status: '',
        Description: '',
        ListUserJoined: '',
        BackgroundColor: '',
        BackgroundImage: '',
        SubjectCode: ''
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    if ($scope.edit !== true) {
        $scope.title = caption.LMS_TITLE_ADD_EXAM;
    }

    $scope.init = function () {
        dataservice.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listUser = [
                {
                    UserName: 'All',
                    GivenName: caption.LMS_USER_ALL
                }
            ];
            $scope.listUser = $scope.listUser.concat(rs);
        });
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $rootScope.listStatus = rs.Object;
        });
        dataservice.getListPractice($rootScope.pageP, $rootScope.pageSizeP, "", $scope.model.SubjectCode, function (rs) {
            rs = rs.data;
            $scope.listPracticeTest = rs;
        });
        dataservice.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, "", function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });

        dataservice.getListClass(function (rs) {
            rs = rs.data;
            $scope.listClass = rs;
        });
        $rootScope.loadMoreP = function ($select, $event) {
            if (!$event) {
                $rootScope.pageP = 1;
                $rootScope.itemsP = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.pageP++;
            }
            dataservice.getListPractice($rootScope.pageP, $rootScope.pageSizeP, $rootScope.codeSearchP, $scope.model.SubjectCode, function (rs) {
                rs = rs.data;
                $scope.listPracticeTest = $scope.listPracticeTest.concat(rs);
                $scope.listPracticeTest = removeDuplicate($scope.listPracticeTest);
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
            dataservice.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, $rootScope.codeSearchS, function (rs) {
                rs = rs.data;
                $scope.listSubject = $scope.listSubject.concat(rs);
                $scope.listSubject = removeDuplicate($scope.listSubject);
            });
        }
    }

    $scope.init();
    $scope.selectColor = function (id) {
        for (var i = 0; i < $scope.listColor.length; i++) {
            if ($scope.listColor[i].Id == id) {
                if ($scope.listColor[i].Check) {
                    $scope.listColor[i].Check = false;
                } else {
                    $scope.listColor[i].Check = true;
                }
            } else {
                $scope.listColor[i].Check = false;
            }
        }
    }
    $rootScope.reloadPractice = function (input) {
        $rootScope.codeSearchP = input != undefined ? input : "";
        $rootScope.pageP = 1;
        $rootScope.itemsP = [];
        dataservice.getListPractice($rootScope.pageP, $rootScope.pageSizeP, $rootScope.codeSearchP, $scope.model.SubjectCode, function (rs) {
            rs = rs.data;
            $scope.listPracticeTest = rs;
        });
    }

    $rootScope.reloadSubject = function (input) {
        $rootScope.codeSearchS = input != undefined ? input : "";
        $rootScope.pageS = 1;
        $rootScope.itemsS = [];
        dataservice.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, $rootScope.codeSearchS, function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
    }

    $scope.changeSubject = function () {
        $scope.model.PracticeTestCode = "";
        $rootScope.reloadPractice();
    }

    $scope.updateListAccount = function (type) {
        if (type == 'startTime') {
            console.log($scope.model.StartTime);
        }
        else {
            console.log($scope.model.EndTime);
        }
    }

    $scope.submit = function () {
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check === true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        //if ($scope.model1.ListUser.length === 0) {
        //    return App.toastrError(caption.WWS_MSG_SELECT_LIST_USER);
        //}
        $scope.model.ListUserJoined = JSON.stringify($scope.listUserApproved);
        var check = CKEDITOR.instances['Description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Description'].getData();
            $scope.model.Description = data;
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insert($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    $scope.changeStatus = function (item) {
        var userInfo = $scope.listUserApproved.find(x => x.userName == $scope.model1.UserName);
        if (item.Code == "WORKING_SCHEDULE_APPROVED" && userInfo.status == "WORKING_SCHEDULE_NOT_APPROVED") {
            $scope.isStatusChanged = true;
            $scope.countUserApproved++;
        }
        else if (item.Code == "WORKING_SCHEDULE_NOT_APPROVED" && userInfo.status == "WORKING_SCHEDULE_APPROVED") {
            $scope.isStatusChanged = true;
            $scope.countUserApproved--;
        }
        userInfo.status = item.Code;
    }
    $scope.addUser = function (item) {
        var indexAll = $scope.model1.ListUser.findIndex(x => x == "All");
        if (indexAll !== -1) {
            $scope.model1.ListUser.splice(indexAll, 1);
        }
        if (item.UserName === "All") {
            var isUserExist = false;
            for (var i = 0; i < $scope.listUser.length; i++) {
                if ($scope.listUser[i].UserName !== "All") {
                    var userIndex = $scope.listUserApproved.findIndex(x => x.userName === $scope.listUser[i].UserName);
                    if (userIndex !== -1) {
                        isUserExist = true;
                    }
                    else {
                        $scope.listUserApproved.push({
                            userName: $scope.listUser[i].UserName,
                            status: 'WORKING_SCHEDULE_NOT_APPROVED',
                        });
                        $scope.model1.ListUser.push($scope.listUser[i].UserName);
                    }
                }
            }
            if (isUserExist) {
                App.toastrError(caption.LMS_STUDENT_EXIST_MANY);
            }
        }
        else {
            var userIndex = $scope.listUserApproved.findIndex(x => x.userName === item.UserName);
            if (userIndex !== -1) {
                App.toastrError(caption.LMS_STUDENT_EXIST);
                var indexExist = $scope.model1.ListUser.lastIndexOf(item.UserName);
                if (indexExist !== -1) {
                    $scope.model1.ListUser.splice(indexExist, 1);
                }
            }
            else {
                $scope.listUserApproved.push({
                    userName: item.UserName,
                    status: 'WORKING_SCHEDULE_NOT_APPROVED',
                });
            }
        }
        $scope.errorUserId = false;
    }
    $scope.removeUser = function (item) {
        var index = $scope.listUserApproved.findIndex(x => x.userName == item.UserName);
        if (index != -1) {
            $scope.listUserApproved.splice(index, 1);
        }
    }
    $scope.viewLogStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderWorkingSchedule + '/view-status-log.html',
            controller: 'log-status',
            size: '30',
            resolve: {
                para: function () {
                    return $scope.logStatus;
                }
            }
        });
        modalInstance.result.then(function (d) {
        });
    }
    $scope.viewCms = function (link) {
        dataservice.getItemCms(link, function (rs) {
            rs = rs.data;
            $rootScope.cmsContent = $sce.trustAsHtml(rs.full_text);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsDashBoard + '/view-cms.html',
                //openedClass: 'vertical-container',
                //windowClass: 'vertical-center',
                controller: function ($scope, $uibModalInstance, $sce) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                backdrop: 'static',
                size: '80'
            });
            modalInstance.result.then(function (d) {
            }, function () {
            });
        });
    };
    $scope.changeCmsItem = function (item) {
        $scope.model2.CmsItemName = item.Name;
    }
    $scope.addCmsItem = function (item) {
        var cmsItem = angular.copy(item);
        if ($scope.listRef.findIndex(x => x.CmsItemCode == cmsItem.CmsItemCode) != -1) {
            App.toastrError('Đã tồn tại bài viết')
        }
        else {
            $scope.listRef.push(cmsItem);
        }
    }
    $scope.deleteCmsItem = function (item) {
        if ($scope.listRef.indexOf(item) == -1) {
            App.toastrError('Xóa thất bại')
        } else {
            $scope.listRef.splice($scope.listRef.indexOf(item), 1);
        }
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "Practice" && $scope.model.PracticeTestCode != "") {
            $scope.errorPractice = false;
        }
        if (SelectType == "Subject") {
            $scope.changeSubject();
            if ($scope.model.SubjectCode != "") {
                $scope.errorSubject = false;
            }
        }
    }

    // class selection

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
        dataservice.getListUserConnected(function (rs) {
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
        dataservice.getListUserOfClass($scope.modelClass.Code, function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
            $scope.countUser = rs.length;
            $scope.listUser.unshift(allMember);
        });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.ListUserJoined == "" || data.ListUserJoined == "[]" || data.ListUserJoined == undefined) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }

        if (data.PracticeTestCode == "" || data.PracticeTestCode == null || data.PracticeTestCode == undefined) {
            $scope.errorPractice = true;
            mess.Status = true;
        } else {
            $scope.errorPractice = false;
        }

        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubject = true;
            mess.Status = true;
        } else {
            $scope.errorSubject = false;
        }

        return mess;
    };
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
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
    };
    function loadDate() {
        $("#datefrom").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            startDate: new Date(),
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datetimepicker('setStartDate', maxDate);

            if ($('#datefrom').valid()) {
                $('#datefrom').removeClass('invalid').addClass('success');
            }
        });
        $("#dateto").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            startDate: new Date(),
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datetimepicker('setEndDate', maxDate);

            if ($('#dateto').valid()) {
                $('#dateto').removeClass('invalid').addClass('success');
            }
        });
        $('.start-date').click(function () {
            $('#datefrom').datetimepicker('setEndDate', null);
        });
        $('.end-date').click(function () {
            $('#dateto').datetimepicker('setStartDate', null);
        });
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('Description', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Description'].config.height = 80;
    }
    setTimeout(function () {
        //setModalDraggable('.modal-dialog');
        ckEditer();
        loadDate();
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $controller, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataservice, para) {
    $scope.edit = true;
    $controller('add', { $scope: $scope, $uibModalInstance: $uibModalInstance });
    $scope.init = function () {
        $scope.model = para;
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $rootScope.listStatus = rs.Object;
        });

        dataservice.getListClass(function (rs) {
            rs = rs.data;
            $scope.listClass = rs;
        });
        dataservice.getSinglePractice($scope.model.PracticeTestCode, function (rs) {
            rs = rs.data;
            if (rs != null && rs != undefined && rs != "") {
                $scope.listPracticeTest.push(rs);
                dataservice.getListPractice($rootScope.pageP, $rootScope.pageSizeP, "", $scope.model.SubjectCode, function (result) {
                    result = result.data;
                    $scope.listPracticeTest.concat(result);
                });
            }
        });
        dataservice.getSingleSubject($scope.model.SubjectCode, function (rs) {
            rs = rs.data;
            if (rs != null && rs != undefined && rs != "") {
                $scope.listSubject.push(rs);
                dataservice.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, "", function (result) {
                    result = result.data;
                    $scope.listSubject.concat(result);
                });
            }
        });
        // get color
        var selectColor = $scope.listColor.find(function (element) {
            if (element.BackgroundColor == $scope.model.BackgroundColor && element.BackgroundImage == $scope.model.BackgroundImage) return true;
        });
        for (var color of $scope.listColor) {
            color.Check = false;
        }
        if (selectColor != undefined) {
            selectColor.Check = true;
        }

        $scope.model.StartTime = $filter('date')($scope.model.TimeStart, 'dd/MM/yyyy');
        $scope.model.EndTime = $filter('date')($scope.model.TimeEnd, 'dd/MM/yyyy');
        // get List User
        if ($scope.model.ListUserJoined != '' && $scope.model.ListUserJoined != null && $scope.model.ListUserJoined != undefined) {
            $scope.listUserApproved = JSON.parse($scope.model.ListUserJoined);
        }
        else {
            $scope.listUserApproved = [];
        }
        var userJoined = $scope.listUserApproved.map(x => { return x.userName }).join(", ");
        dataservice.getListUserJoined(userJoined, function (listUserJoined) {
            listUserJoined = listUserJoined.data;
            $scope.listUser = [
                {
                    UserName: 'All',
                    GivenName: caption.LMS_USER_ALL
                }
            ];
            $scope.listUser = $scope.listUser.concat(listUserJoined);

            dataservice.getListUserConnected(function (rs) {
                rs = rs.data;
                $scope.listUser = $scope.listUser.concat(rs);
                $scope.listUser = removeDuplicateUsers($scope.listUser);
            });
        });
        console.log($scope.listUserApproved);
        $scope.model1.ListUser = [];
        for (var obj of $scope.listUserApproved) {
            $scope.model1.ListUser.push(obj.userName);
        }
        $rootScope.loadMoreP = function ($select, $event) {
            if (!$event) {
                $rootScope.pageP = 1;
                $rootScope.itemsP = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.pageP++;
            }
            dataservice.getListPractice($rootScope.pageP, $rootScope.pageSizeP, $rootScope.codeSearchP, $scope.model.SubjectCode, function (rs) {
                rs = rs.data;
                $scope.listPracticeTest = $scope.listPracticeTest.concat(rs);
                $scope.listPracticeTest = removeDuplicate($scope.listPracticeTest);
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
            dataservice.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, $rootScope.codeSearchS, function (rs) {
                rs = rs.data;
                $scope.listSubject = $scope.listSubject.concat(rs);
                $scope.listSubject = removeDuplicate($scope.listSubject);
            });
        }
        setTimeout(function () {
            CKEDITOR.instances['Description'].setData($scope.model.Description);
        }, 1000);
    }

    $scope.init();

    if ($scope.edit === true) {
        $scope.title = caption.LMS_TITLE_EDIT_EXAM;
    }

    $scope.submit = function () {
        delete $scope.model.TimeStart;
        delete $scope.model.TimeEnd;
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        $scope.model.ListUserJoined = JSON.stringify($scope.listUserApproved);
        var check = CKEDITOR.instances['Description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Description'].getData();
            $scope.model.Description = data;
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.ListUserJoined == "" || data.ListUserJoined == "[]" || data.ListUserJoined == undefined) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }

        if (data.PracticeTestCode == "" || data.PracticeTestCode == null || data.PracticeTestCode == undefined) {
            $scope.errorPractice = true;
            mess.Status = true;
        } else {
            $scope.errorPractice = false;
        }

        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubject = true;
            mess.Status = true;
        } else {
            $scope.errorSubject = false;
        }

        return mess;
    };
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
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
    };
    function removeDuplicateUsers(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].UserName == itm.UserName) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
    };
    function loadDate() {
        $("#datefrom").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            startDate: new Date(),
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datetimepicker('setStartDate', maxDate);

            if ($('#datefrom').valid()) {
                $('#datefrom').removeClass('invalid').addClass('success');
            }
        });
        $("#dateto").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            startDate: new Date(),
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datetimepicker('setEndDate', maxDate);

            if ($('#dateto').valid()) {
                $('#dateto').removeClass('invalid').addClass('success');
            }
        });
        $('.start-date').click(function () {
            $('#datefrom').datetimepicker('setEndDate', null);
        });
        $('.end-date').click(function () {
            $('#dateto').datetimepicker('setStartDate', null);
        });
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('Description', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Description'].config.height = 80;
    }
    setTimeout(function () {
        //setModalDraggable('.modal-dialog');
        ckEditer();
        loadDate();
    }, 200);
});

app.controller('doExam', function ($scope, $rootScope, $controller, $sce, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, para, $filter, $translate) {
    $controller('test', { $scope: $scope, $uibModalInstance: $uibModalInstance, para: para });
    $scope.loadDetailExam = function () {
        dataservice.getListDetailQuiz($scope.model.PracticeTestCode, sessionCode, function (examDetails) {
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
                }
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
                        index: i
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
                try {
                    $scope.listQuestion[i].ListMediaType = JSON.parse($scope.listQuestion[i].QuestionMedia);
                    console.log($scope.listQuestion[i].ListMediaType.length);
                } catch (e) {
                    console.log(e);
                    $scope.listQuestion[i].ListMediaType = [];
                }
                $scope.totalQuestion++;
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
        $scope.loadDetailExam();
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
    initData();
    $scope.listCorrectAnswer = [];
    $scope.listUserResult = [];
    $scope.submit = function () {
        var countQuizDone = 0;
        var countQuizCorrect = 0;
        var countTotalQuiz = $scope.listQuestion.length;
        for (var i = 0; i < $scope.listQuestion.length; i++) {
            var correctAnswer = "" + $scope.getCorrectAnswer(i);
            var userResult = "" + $scope.getUserResult(i);
            if (userResult != -1) {
                countQuizDone++;
                var indexCorrect = correctAnswer.indexOf(userResult);
                if (indexCorrect != -1) {
                    countQuizCorrect++;
                }
            }
            $scope.listCorrectAnswer.push(correctAnswer);
            $scope.listUserResult.push(userResult);
        }
        trackDiligence("", "EXAM", $scope.model.PracticeTestCode, 0);
    }
    $scope.countDiligence = 0;
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
            dataservice.trackDilligence(modelDiligence, function (rs) {
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
    };

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