var ctxfolder = "/views/admin/weekWorkingSchedule";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ui.select", "ngCookies", "pascalprecht.translate"]);

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
        getCurrentUser: function (callback) {
            $http.post('/Admin/WeekWorkingSchedule/GetCurrentUser').then(callback);
        },
        insertWorkingSchedule: function (data, callback) {
            $http.post('/Admin/WeekWorkingSchedule/InsertWorkingSchedule', data).then(callback);
        },
        updateWorkingSchedule: function (data, callback) {
            $http.post('/Admin/WeekWorkingSchedule/UpdateWorkingSchedule', data).then(callback);
        },
        updateOnDrag: function (data, callback) {
            $http.post('/Admin/WeekWorkingSchedule/UpdateOnDrag', data).then(callback);
        },
        deleteWorkingSchedule: function (data, callback) {
            $http.post('/Admin/WeekWorkingSchedule/DeleteWorkingSchedule?id=' + data).then(callback);
        },
        getItemWorkingSchedule: function (data, callback) {
            $http.post('/Admin/WeekWorkingSchedule/GetItemWorkingSchedule?id=' + data).then(callback);
        },

        getEvent: function (data, callback) {
            $http.get('/Admin/WeekWorkingSchedule/GetEvent?type=' + data).then(callback)
        },
        getWorkingScheduleStatus: function (callback) {
            $http.post('/Admin/Customer/GetWorkingScheduleStatus').then(callback); // not finished yet
        },
        getListCmsItem: function (data, data1, data2, callback) {
            $http.post('/Admin/WeekWorkingSchedule/GetListCmsItem?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callback);
        },
        getItemCms: function (data, callback) {
            $http.post('/Admin/WeekWorkingSchedule/GetItemCms?code=' + data).then(callback);
        },
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

app.controller('manager', function ($scope, $rootScope, $sce, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService) {
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $('#calendar').fullCalendar('refetchEvents');
        }, function () {
        });
    }

    $scope.edit = function (id, createdBy) {
        if (isAllData || userName === createdBy) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/add.html',
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
                $('#calendar').fullCalendar('refetchEvents');
            },
                function () {
                });
        } else {
            return App.toastrError(caption.COM_MSG_NO_PERMISSION);
        }
    }

    $scope.delete = function (id, createdBy) {
        if (isAllData || userName === createdBy) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                    $scope.ok = function () {
                        dataservice.deleteWorkingSchedule(id, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                $uibModalInstance.close();
                                $('#calendar').fullCalendar('refetchEvents');
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
                $scope.reload();
            }, function () {
            });
        } else {
            return App.toastrError(caption.COM_MSG_NO_PERMISSION);
        }
        //$confirm({ text: caption.WWS_QUES_DEL, title: caption.WWS_BTN_CONFIRM, ok: caption.WWS_BTN_CONFIRM, cancel: caption.COM_BTN_CANCEL })
        //    .then(function () {
        //    });
    }

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
                            color: rs[i].color,
                            displayEventTime: false,
                            workContent: rs[i].workContent,
                            id: rs[i].Id,
                            createdBy: rs[i].createdBy
                        }
                        event.push(obj);
                    }
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                $scope.edit(calEvent.id, calEvent.createdBy);
            },
            eventDrop: function (event, delta, revertFunc) {
                if (isAllData || userName === event.createdBy) {
                    if (moment(event.start).isAfter(moment(), 'day') || isAllData) {
                        var obj = {
                            Id: event.id,
                            StartDateTime: moment(event.start),
                        }
                        dataservice.updateOnDrag(obj,
                            function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                    revertFunc();
                                } else {
                                    App.toastrSuccess(rs.Title);
                                    $('#calendar').fullCalendar('refetchEvents');
                                }
                            });
                    } else {
                        $('#calendar').fullCalendar('refetchEvents');
                    }
                } else {
                    $('#calendar').fullCalendar('refetchEvents');
                    return App.toastrError(caption.COM_MSG_NO_PERMISSION);
                }
            },
            eventRender: function (event, element) {
                var content = element.find('.fc-content');
                content.addClass('fc-content-dynamic');
                var originalClass = element[0].className;
                element[0].className = originalClass + ' hasmenu';
                element[0].setAttribute("data-event-id", event.id);
            },
            eventMouseover: function (calEvent, jsEvent) {
                var tooltip = '<div class="tooltipevent"' +
                    'style="width: 250px; background:#26ab02; color: #fff; position: absolute; border-radius: 10px; padding: 5px; z-index: 1050">'
                    + '' + calEvent.workContent +
                    '</div>';

                var $tooltip = $(tooltip).appendTo('body');
                $(this).mouseover(function (e) {
                    $(this).css('z-index', 10000);
                    $tooltip.fadeIn('500');
                    $tooltip.fadeTo('10', 1.9);
                }).mousemove(function (e) {
                    var mousex = e.pageX + 20; //Get X coordinates
                    var mousey = e.pageY + 10; //Get Y coordinates
                    var height = $tooltip.outerHeight();
                    if ((mousey + height) > $(window).height() && (mousex + 250) > $(window).width()) {
                        console.log('Error sit');
                        $tooltip.css('top', mousey - height);
                        $tooltip.css('left', mousex - 250);
                    }
                    else if ((mousey + height) > $(window).height()) {
                        $tooltip.css('top', mousey - height);
                        $tooltip.css('left', mousex);
                    }
                    else if ((mousex + 250) > $(window).width()) {
                        $tooltip.css('top', mousey);
                        $tooltip.css('left', mousex - 250);
                    }
                    else {
                        $tooltip.css('top', mousey);
                        $tooltip.css('left', mousex);
                    }
                });
            },
            eventMouseout: function (calEvent, jsEvent) {
                $(this).css('z-index', 8);
                $('.tooltipevent').remove();
            },
        });
        $('#calendar').fullCalendar('option', 'locale', initialLocaleCode);
        $('#' + id).contextmenu({
            delegate: ".hasmenu",
            preventcontextmenuforpopup: true,
            preventselect: true,
            menu: [
                /*{ title: "copy", cmd: "copy", uiIcon: "ui-icon-copy" },*/
                //{ title: "edit", cmd: "edit", uiIcon: "ui-icon-edit" },
                /*{ title: "paste", cmd: "paste", uiIcon: "ui-icon-clipboard"},*/
                { title: "delete", cmd: "delete", uiIcon: "ui-icon-trash" },
            ],
            select: function (event, ui) {
                // logic for handing the selected option
                /*if (ui.cmd == "edit") {
                    var msid = ui.target.closest('a').attr("data-event-id");
                    var meetingId = ui.target.closest('a').attr("data-event-meeting-id");
                    $scope.edit(msid, meetingId);
                }
                else*/ if (ui.cmd == "delete") {
                    var wsid = ui.target.closest('a').attr("data-event-id");
                    $scope.delete(wsid);
                }
            },
            beforeopen: function (event, ui) {
                // things to happen right before the menu pops up
                ui.menu.zIndex($(event.target).zIndex() + 1);
                ui.target.attr("data-event-id");
            }
        });
    }
    setTimeout(function () {
        loadCalendar("calendar");
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $sce, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.submitBtnLabel = caption.COM_BTN_ADD;
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.listStatus = [{
        Code: 'WORKING_SCHEDULE_NOT_APPROVED',
        Name: 'Chưa duyệt'
    },
    {
        Code: 'WORKING_SCHEDULE_APPROVED',
        Name: 'Đã duyệt'
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
    $rootScope.pageSize = 10;
    $scope.model = {
        BackgroundColor: '',
        BackgroundImage: '',
        StartDate: '',
        ListUser: '',
        EndDate: '',
        Location: '',
        Content: ''
    }
    $scope.listColor = [
        {
            Id: 0,
            Check: true,
            BackgroundColor: '#f1f1f1',
            BackgroundImage: '',
        },
        {
            Id: 1,
            Check: false,
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
        }, {
            Id: 4,
            Check: false,
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
        }]

    $scope.initData = function () {
        dataservice.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
        $rootScope.loadMore = function ($select, $event) {
            if (!$event) {
                $rootScope.page = 1;
                $rootScope.items = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.page++;
            }
            dataservice.getListCmsItem($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
                rs = rs.data;
                $scope.listCmsItem = $scope.listCmsItem.concat(rs);
                $scope.listCmsItem = removeDuplicate($scope.listCmsItem);
            });
        };
    }
    $scope.initData();
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
    $rootScope.reloadCmsItem = function (input) {
        $rootScope.codeSearch = input;
        $rootScope.page = 1;
        $rootScope.items = [];
        dataservice.getListCmsItem($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
            rs = rs.data;
            $scope.listCmsItem = $scope.listCmsItem.concat(rs);
            $scope.listCmsItem = removeDuplicate($scope.listCmsItem);
        });
    }
    $scope.submit = function () {
        var check = CKEDITOR.instances['WorkContent'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['WorkContent'].getData();
            $scope.model.WorkContent = data;
        }
        //var check = CKEDITOR.instances['Content'];
        //if (check !== undefined) {
        //    var data = CKEDITOR.instances['Content'].getData();
        //    $scope.model.Content = data;
        //}
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        if ($scope.model1.ListUser.length == 0) {
            return App.toastrError(caption.WWS_MSG_SELECT_LIST_USER);
        }
        $scope.model.ListUserApproved = JSON.stringify($scope.listUserApproved);
        $scope.model.JsonRef = JSON.stringify($scope.listRef);
        if ($scope.isUserInList && $scope.isStatusChanged) {
            var statusInfo = $scope.listStatus.find(x => x.Code == $scope.model1.Status);
            if (statusInfo != undefined) {
                var log = {
                    CreatedBy: $scope.model1.GivenName,
                    Status: statusInfo.Name,
                    CreatedTime: moment().format("DD/MM/YYYY[, lúc ]HH:mm:ss")
                };
                $scope.logStatus.push(log);
            }
        }
        $scope.model.JsonStatus = JSON.stringify($scope.logStatus);
        if ($scope.addform.validate()) {
            dataservice.insertWorkingSchedule($scope.model, function (rs) {
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
        $scope.listUserApproved.push({
            userName: item.UserName,
            status: 'WORKING_SCHEDULE_NOT_APPROVED',
        });
        dataservice.getCurrentUser(function (user) {
            user = user.data;
            var result = $scope.listUserApproved.findIndex(x => x.userName == user);
            if (result != -1) {
                $scope.isUserInList = true;
                $scope.model1.UserName = user;
                $scope.model1.Status = $scope.listUserApproved[result].status;
                var userInfo = $scope.listUser.find(x => x.UserName == user);
                if (userInfo != undefined) {
                    $scope.model1.GivenName = userInfo.GivenName;
                }
            }
            else {
                $scope.isUserInList = false;
            }
        });
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
            templateUrl: ctxfolder + '/view-status-log.html',
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
                //windowClass: 'mt20',
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
    function loadDate() {
        $("#startDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            dateFormat: "dd/mm/yyyy hh:ii",
            startDate: new Date(moment().subtract(5, 'minutes')),
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endDate').datetimepicker('setStartDate', maxDate);
        });
        $("#endDate").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
            startDate: new Date(),
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#startDate').datetimepicker('setEndDate', maxDate);
        });
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
    function ckEditer() {
        var editor1 = CKEDITOR.replace('WorkContent', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['WorkContent'].config.height = 80;
        //var editor2 = CKEDITOR.replace('Content', {
        //    cloudServices_tokenUrl: '/MobileApp/Token',
        //    cloudServices_uploadUrl: '/MobileApp/UploadFile',
        //    filebrowserBrowseUrl: '',
        //    filebrowserUploadUrl: '/MobileApp/Upload',
        //    embed_provider: '/uploader/upload.php'
        //});
        //CKEDITOR.instances['Content'].config.height = 60;
    }
    setTimeout(function () {
        loadDate();
        ckEditer();
        setModalDraggable('.modal-dialog');
    }, 1000);
});

app.controller('edit', function ($scope, $controller, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $filter, para) {
    $controller('add', { $scope: $scope, $uibModalInstance: $uibModalInstance });
    $scope.submitBtnLabel = caption.COM_BTN_SAVE;

    $scope.initData = function () {
        dataservice.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        })
        $rootScope.loadMore = function ($select, $event) {
            if (!$event) {
                $rootScope.page = 1;
                $rootScope.items = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.page++;
            }
            dataservice.getListCmsItem($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
                rs = rs.data;
                $scope.listCmsItem = $scope.listCmsItem.concat(rs);
                $scope.listCmsItem = removeDuplicate($scope.listCmsItem);
            });
        };
        dataservice.getItemWorkingSchedule(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
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

            $scope.model.StartDate = moment($scope.model.StartDate).format("DD/MM/YYYY HH:mm");
            $scope.model.EndDate = moment($scope.model.EndDate).format("DD/MM/YYYY HH:mm");
            // get List User
            if ($scope.model.ListUserApproved != '' && $scope.model.ListUserApproved != null && $scope.model.ListUserApproved != undefined) {
                $scope.listUserApproved = JSON.parse($scope.model.ListUserApproved);
                $scope.countUserApproved = $scope.listUserApproved.filter(x => x.status == "WORKING_SCHEDULE_APPROVED").length;
                dataservice.getCurrentUser(function (user) {
                    user = user.data;
                    var result = $scope.listUserApproved.findIndex(x => x.userName == user);
                    if (result != -1) {
                        $scope.isUserInList = true;
                        $scope.model1.UserName = user;
                        $scope.model1.Status = $scope.listUserApproved[result].status;
                        var userInfo = $scope.listUser.find(x => x.UserName == user);
                        if (userInfo != undefined) {
                            $scope.model1.GivenName = userInfo.GivenName;
                        }
                    }
                    else {
                        $scope.isUserInList = false;
                    }
                });
            }
            else {
                $scope.listUserApproved = [];
            }
            $scope.model1.ListUser = [];
            for (var obj of $scope.listUserApproved) {
                $scope.model1.ListUser.push(obj.userName);
            }
            // get List User
            if ($scope.model.JsonRef != '' && $scope.model.JsonRef != null && $scope.model.JsonRef != undefined) {
                $scope.listRef = JSON.parse($scope.model.JsonRef);
            }
            else {
                $scope.listRef = [];
            }
            if ($scope.model.JsonStatus != '' && $scope.model.JsonStatus != null && $scope.model.JsonStatus != undefined) {
                $scope.logStatus = JSON.parse($scope.model.JsonStatus);
            }
            else {
                $scope.logStatus = [];
            }
            setTimeout(function () {
                CKEDITOR.instances['WorkContent'].setData($scope.model.WorkContent);
            }, 1000);
        })
    }

    $scope.initData();

    $scope.submit = function () {
        var check = CKEDITOR.instances['WorkContent'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['WorkContent'].getData();
            $scope.model.WorkContent = data;
        }
        //var check = CKEDITOR.instances['Content'];
        //if (check !== undefined) {
        //    var data = CKEDITOR.instances['Content'].getData();
        //    $scope.model.Content = data;
        //}
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        if ($scope.model1.ListUser.length == 0) {
            return App.toastrError(caption.WWS_MSG_SELECT_LIST_USER);
        }
        $scope.model.ListUserApproved = JSON.stringify($scope.listUserApproved);
        $scope.model.JsonRef = JSON.stringify($scope.listRef);
        if ($scope.isUserInList && $scope.isStatusChanged) {
            var statusInfo = $scope.listStatus.find(x => x.Code == $scope.model1.Status);
            if (statusInfo != undefined) {
                var log = {
                    CreatedBy: $scope.model1.GivenName,
                    Status: statusInfo.Name,
                    CreatedTime: moment().format("DD/MM/YYYY[, lúc ]HH:mm:ss")
                };
                $scope.logStatus.push(log);
            }
        }
        $scope.model.JsonStatus = JSON.stringify($scope.logStatus);
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
});
app.controller('log-status', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.lstStatus = para;
    setTimeout(function () {
        setModalDraggable(".modal-dialog");
    }, 400);
});
