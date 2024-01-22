var ctxfolder = "/views/admin/lmsTutoringSchedule";
var ctxfolderWorkingSchedule = "/views/admin/weekWorkingSchedule";
var ctxfolderLmsDashBoard = "/views/admin/lmsDashBoard";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_Token_Manager', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", "ngCookies", 'ngSanitize']);

app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getListUser: function (callback) {
            $http.get('/Admin/LmsTutoringSchedule/GetListUser').then(callback);
        },
        getListUserJoined: function (data, callback) {
            $http.post('/Admin/LmsTutoringSchedule/GetListUserJoined?users=' + data).then(callback);
        },
        getCurrentUser: function (callback) {
            $http.post('/Admin/WeekWorkingSchedule/GetCurrentUser').then(callback);
        },
        getListLesson: function (callback) {
            $http.get('/Admin/LmsTutoringSchedule/GetListLesson').then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/LmsTutoringSchedule/GetListStatus').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/LmsTutoringSchedule/Insert/', data).then(callback);
        },
        paste: function (data, callback) {
            $http.post('/Admin/LmsTutoringSchedule/Paste/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/LmsTutoringSchedule/Update/', data).then(callback);
        },
        updateOnDrag: function (data, callback) {
            $http.post('/Admin/LmsTutoringSchedule/UpdateOnDrag', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/LmsTutoringSchedule/Delete/' + data).then(callback);
        },
        updateStatus: function (data, callback) {
            $http.post('/Admin/LmsTutoringSchedule/UpdateStatus/', data).then(callback);
        },
        updateAutoStatus: function (callback) {
            $http.post('/Admin/LmsTutoringSchedule/UpdateAutoStatus').then(callback);
        },
        getItem: function (data, data1, callback) {
            $http.post('/Admin/LmsTutoringSchedule/GetItem?id=' + data + '&meetingId=' + data1).then(callback);
        },
        getAllEvent: function (data, callback) {
            $http.get('/Admin/LmsTutoringSchedule/GetAllEvent?userName=' + data).then(callback);
        },
        getListAccount: function (callback) {
            $http.get('/Admin/LmsTutoringSchedule/GetListAccount').then(callback);
        },
        getItemCms: function (data, callback) {
            $http.post('/Admin/WeekWorkingSchedule/GetItemCms?code=' + data).then(callback);
        },
        getListSubjectWithPage: function (data, data1, data2, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetListSubject?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callbackExam);
        },
        getSingleSubject: function (data, callbackExam) {
            $http.post('/Admin/LmsPracticeTest/GetSingleSubject?subjectCode=' + data).then(callbackExam);
        },
        getListClass: function (data, callback) {
            $http.post('/Admin/LmsTutoringSchedule/GetListClass?teacher=' + data).then(callback);
        },
        getListUserOfClass: function (data, callback) {
            $http.post('/Admin/LmsTutoringSchedule/GetListUserOfClass?classCode=' + data).then(callback);
        },
        trackDilligence: function (data, callback) {
            $http.post('/Admin/LmsPracticeTest/TrackDilligence/', data).then(callback);
        },
        //share
        getListUserConnected: function (callback) {
            $http.post('/Admin/LmsQuiz/GetListUserConnected').then(callback);
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

        $rootScope.validationOptionsTutor = {
            rules: {
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

        dataservice.getListUserConnected(function (rs) {
            rs = rs.data;
            $rootScope.listUser = rs;
            var all = {
                UserName: '',
                GivenName: caption.MS_TXT_ALL
            }
            $rootScope.listUser.unshift(all)
        });

        dataservice.getListLesson(function (rs) {
            rs = rs.data;
            $rootScope.listLesson = rs;
            //var all = {
            //    UserName: '',
            //    GivenName: caption.MS_TXT_ALL
            //}
            //$rootScope.listUser.unshift(all)
        });

        dataservice.getListAccount(function (rs) {
            rs = rs.data;
            $rootScope.listAccount = rs;
        });
    });
    $rootScope.session = null;
    $rootScope.pageS = 1;
    $rootScope.pageSizeS = 10;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsTutoringSchedule/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $document, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.isInit = false;
    if ($scope.isInit === false) {
        $("#breadcrumb").addClass('hidden');
        $("#breadcrumbIndex").appendTo("#breadcrumb-container");
        $scope.isInit = true;
    }
    $scope.model = {
        Student: ''
    }

    $scope.isAllData = function () {
        return isAllData;
    }

    $scope.search = function () {
        $('#calendar').fullCalendar('refetchEvents');
    }

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            windowClass: 'modal-registration',
            backdrop: 'static',
            size: '50',
        });
        modalInstance.result.then(function (d) {
            $('#calendar').fullCalendar('refetchEvents');
        }, function () {
        });
    }

    $scope.edit = function (id, meetingId) {
        dataservice.getItem(id, meetingId, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    windowClass: 'modal-registration',
                    backdrop: 'static',
                    size: '50',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    },
                });
                modalInstance.result.then(function (d) {
                    $('#calendar').fullCalendar('refetchEvents');
                }, function () {
                });
            }
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.LMS_TUTOR_DELETE_CONFIRM_MSG + "?";
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
            $('#calendar').fullCalendar('refetchEvents');
        }, function () {
        });
    }

    $scope.changeStudent = function () {
        $('#calendar').fullCalendar('refetchEvents');
    }

    $scope.paste = function (startTime) {
        if ($rootScope.session != null) {
            var model = {
                Title: $rootScope.session.Title,
                StartTime: startTime,
                EndTime: startTime,
                Comment: $rootScope.session.Comment,
                AccountZoom: $rootScope.session.AccountZoom,
            }
            dataservice.paste(model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $('#calendar').fullCalendar('refetchEvents');
                    $rootScope.session = null;
                }
            })
        }
    }

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
            dayNames: [caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],
            monthNames: [caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            monthNamesShort: [caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JAN + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_FEB + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_APR + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_MAY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JUNE + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_JULY + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_AUG + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_SEPT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_OCT + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_NOV + ' - ', caption.STRE_CURD_TAB_WORK_CALENDAR_LBL_MONTH_DEC + ' - '],
            dayNamesShort: [caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SUNDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_MONDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_TUESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_WEDNESDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_THURSDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_FRIDAY, caption.STRE_CURD_TAB_WORK_CALENDAR_LIST_COL_DAY_SATURDAY],
            buttonText: {
                today: caption.STRE_CURD_TAB_WORK_CALENDAR_BTN_TODAY,
                month: caption.COM_LBL_MONTH,
                agendaWeek: 'Tuần', //caption.COM_LBL_WEEK
                agendaDay: 'Ngày', //caption.COM_LBL_DAY
                icon: 'far fa-calendar-check'
            },
            events: function (start, end, timezone, callback) {
                dataservice.getAllEvent($scope.model.Student, function (rs) {
                    rs = rs.data;
                    var event = [];
                    var stt = 0;
                    var checkDate = null;

                    for (var i = 0; i < rs.length; i++) {
                        var value = rs[i];

                        var obj = {
                            stt: stt,
                            value: value,
                            title: (value.Title.length > 15 ? value.Title.substr(0, 15) + "..." : value.Title) + ' (' + value.sStartTime + ' - ' + value.sEndTime + ')',
                            //title: caption.MS_LBL_MEETING + ' ' + ": " + value.Title + ' \n' + caption.MS_LBL_TIME_MEETING + '  :  ' + value.sStartTime + ' - ' + value.sEndTime + '\n ' + caption.MS_LBL_STATUS + ' : ' + value.Status,
                            start: value.StartTime,
                            className: value.ClassName,
                            date: value.Date,
                            color: value.Color,
                            displayEventTime: false,
                            edit: false,
                            copy: false,
                            startTime: value.StartTime,
                            titlemeet: value.Title,
                            status: value.Status,
                            statusCode: value.StatusCode,
                            timemeet: value.sStartTime + ' - ' + value.sEndTime,
                        }

                        stt++;

                        event.push(obj);

                        stt++;
                    }
                    callback(event);
                })
            },
            eventClick: function (calEvent) {
                if (calEvent.edit) {
                    $scope.edit(calEvent.value.Id);
                } else if (calEvent.copy) {
                    $rootScope.session = calEvent.value;
                } else {
                    var msg = checkTime(calEvent.value.StartTime, calEvent.value.EndTime);
                    if (msg.Error) {
                        return App.toastrError(msg.Message);
                    } else {
                        joinMeeting(calEvent.value.MeetingId, calEvent.value.Id);
                    }
                }
            },
            eventOrder: "-date",
            eventMouseover: function (calEvent, jsEvent) {
                var tooltip = '<div class="tooltipevent"' +
                    'style="width: 250px; background:#c6ef9c; color: #000; position: absolute; border-radius: 10px; padding: 5px;">'
                    + '' + caption.MS_LBL_MEETING + ': ' + calEvent.titlemeet +
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
                    StartDateTime: moment(event.start),
                }
                dataservice.updateOnDrag(obj, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        revertFunc();
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $('#calendar').fullCalendar('refetchEvents');
                    }
                })
            },
            eventRender: function (event, element) {
                var originalClass = element[0].className;
                element[0].className = originalClass + ' hasmenu';
                element[0].setAttribute("data-event-id", event.value.Id);
                element[0].setAttribute("data-event-meeting-id", event.value.MeetingId);
            },
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
                    var msid = ui.target.closest('a').attr("data-event-id");
                    var meetingId = ui.target.closest('a').attr("data-event-meeting-id");
                    $scope.edit(msid, meetingId);
                }
                else if (ui.cmd == "delete") {
                    var msid = ui.target.closest('a').attr("data-event-id");
                    $scope.delete(msid);
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

    function joinMeeting(meetingId, id) {
        jQuery.ajax({
            type: "POST",
            url: "/Admin/Meeting/JoinTutorSession?meetingID=" + meetingId + '&scheduleID=' + id,
            //url: "/Admin/Notepad/JoinSession?meetingID=" + meetingId + '&scheduleID=' + id,
            contentType: "application/json",
            dataType: "JSON",
            success: function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    //window.open('/Admin/Notepad', '_blank');
                    window.open('/Admin/Meeting', '_blank');
                    trackDiligence("", "", id, rs.Object);
                    //dataservice.updateStatus(obj, function (rs) {
                    //    if (rs.Error) {
                    //        App.toastrError(rs.Title);
                    //    } else {
                    //        window.open('/Admin/Meeting', '_blank');
                    //    }
                    //});
                }
            },
            failure: function (errMsg) {
                App.toastrSuccess(errMsg);
            }
        });
    }
    //#region
    var vm = $scope;
    $scope.model = {
        Date: moment().format('DD/MM/YYYY')
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsTutoringSchedule/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            //search
            data: function (d) {
                d.Date = $scope.model.Date;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    //var Id = data.ActivityId;
                    //$scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ActivityId").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('ID').withOption('sClass', 'text-center nowrap w-5-percent').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{ "MS_CRUD_TITLE" | translate }}').renderWith(function (data, type, full) {
        return '<a class="color-dark fs14" ng-click="joinMeeting(' + full.MeetingId + ', ' + full.Id + '' + ')"><i class="fas fa-video fs10 text-green pr10"></i>' + data + '</a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('<i class="fas fa-stopwatch fs10 text-green"></i> {{ "MS_START_SHORT" | translate }}').withOption('sClass', 'w20 fs10').renderWith(function (data, type) {
        return data; /*MS_HDR_START*/
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('<i class="fas fa-clock fs10 text-green"></i> {{ "MS_END_SHORT" | translate }}').withOption('sClass', 'w20 fs10').renderWith(function (data, type) {
        return data; /*MS_HDR_END*/
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Comment').withTitle('{{ "Ghi chú" | translate }}').withOption('sClass', 'w-20').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListUserApproved').withTitle('{{ "MS_USER_JOINED" | translate }}').withOption('sClass', 'w20').renderWith(function (data, type) {
        var elements = '';
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
        return elements;
        //return data; /*MS_HDR_PARTICIPANT*/
        //if (data != null) {
        //    var listUser = "";
        //    var list = data.split(',');
        //    for (var i = 0; i < list.length; i++) {
        //        for (var j = 0; j < $rootScope.listUser.length; j++) {
        //            if (list[i] == $rootScope.listUser[j].Id) {
        //                listUser += $rootScope.listUser[j].GivenName;
        //                if (list.length - i > 1) {
        //                    listUser += ",";
        //                }
        //                break;
        //            }
        //        }
        //    }
        //    return listUser;
        //} else {
        //    return '';
        //}
    })); /*MS_HDR_DATA*/
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').withOption('sClass', 'text-center nowrap w-5-percent').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ', ' + full.MeetingId + ')" style = "width: 25px; height: 25px; padding: 0px; margin-right: 10px;"><i class="fas fa-edit fs20 color-dark"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;"><i class="fas fa-trash fs20 color-dark"></i></a>';
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
    $rootScope.search = function () {
        reloadData(true);
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }

    function trackDiligence(taskCode, quizType, objCode, endTime) {
        var listTrackDiligent = [];
        var listPracticeResult = [];
        //var correctAnswer = $scope.getCorrectAnswer(0);
        //var userResult = $scope.getUserResult(0);
        console.log(endTime);
        var objPracticeResult = {
            Id: 1, // will be changed in server side
            StartTime: moment().format("DD/MM/YYYY HH:mm:ss"),
            EndTime: moment(endTime).format("DD/MM/YYYY HH:mm:ss"),
            //UserResult: userResult,
            //CorrectResult: correctAnswer,
            Device: "WEB",
            TaskCode: taskCode,
            //QuizType: quizType,
            //QuizObjCode: objCode
        }
        listPracticeResult.push(objPracticeResult);
        var objTrackDilligent = {
            ObjectType: "TUTOR",
            ObjectCode: objCode,
            ObjectResult: JSON.stringify(listPracticeResult)
        };
        listTrackDiligent.push(objTrackDilligent);
        var modelDiligence = {
            sListDilligence: JSON.stringify(listTrackDiligent)
        }
        dataservice.trackDilligence(modelDiligence, function (rs) {
            rs = rs.data;
            console.log(rs.Title);
            $uibModalInstance.close();
        });
    }

    //#endregion
    setTimeout(function () {
        loadCalendar("calendar");
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
    $scope.listStudent = [];
    $scope.isStatusChanged = false;
    $rootScope.pageSize = 10;
    $scope.listSubject = [];
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
    $scope.model = {
        Title: '',
        StartTime: '',
        EndTime: '',
        Description: '',
        BackgroundColor: '',
        BackgroundImage: '',
        SubjectCode: ''
    }
    $scope.modelClass = {
        Code: ''
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.init = function () {
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $rootScope.listStatus = rs.Object;
        });
        dataservice.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, "", function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
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
        dataservice.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listStudent = [
                {
                    UserName: 'All',
                    GivenName: caption.LMS_USER_ALL
                }
            ];
            $scope.listUser = rs;
            $scope.listStudent = $scope.listStudent.concat(rs);
        });

        dataservice.getListClass("", function (rs) {
            rs = rs.data;
            $scope.listClass = rs;
        });
    }

    $scope.init();

    $rootScope.reloadSubject = function (input) {
        $rootScope.codeSearchS = input != undefined ? input : "";
        $rootScope.pageS = 1;
        $rootScope.itemsS = [];
        dataservice.getListSubjectWithPage($rootScope.pageS, $rootScope.pageSizeS, $rootScope.codeSearchS, function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });
    }
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

    $scope.submit = function () {
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        //if ($scope.model1.ListUser.length == 0) {
        //    return App.toastrError(caption.WWS_MSG_SELECT_LIST_USER);
        //}
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
        var check = CKEDITOR.instances['Description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Description'].getData();
            $scope.model.Description = data;
        }
        $scope.model.JsonStatus = JSON.stringify($scope.logStatus);
        validationSelect($scope.model);
        if ($scope.addformTutor.validate() && !validationSelect($scope.model).Status) {
            $scope.model.LessonDoc = JSON.stringify($scope.model.JsonLessonTemp);
            dataservice.insert($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.dismiss('cancel');
                    $('#calendar').fullCalendar('refetchEvents');
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
    $scope.changeTeacher = function () {
        dataservice.getListClass($scope.model.Teacher, function (rs) {
            rs = rs.data;
            $scope.listClass = rs;
        });
    }
    $scope.addUser = function (item) {
        var indexAll = $scope.model1.ListUser.findIndex(x => x == "All");
        if (indexAll !== -1) {
            $scope.model1.ListUser.splice(indexAll, 1);
        }
        if (item.UserName === "All") {
            var isUserExist = false;
            for (var i = 0; i < $scope.listStudent.length; i++) {
                if ($scope.listStudent[i].UserName !== "All") {
                    var userIndex = $scope.listUserApproved.findIndex(x => x.userName === $scope.listStudent[i].UserName);
                    if (userIndex !== -1) {
                        isUserExist = true;
                    }
                }
            }
            if (isUserExist) {
                App.toastrError(caption.LMS_STUDENT_EXIST_MANY);
            }
            $scope.addUserAsync(0);
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
                dataservice.getCurrentUser(function (user) {
                    user = user.data;
                    var result = $scope.listUserApproved.findIndex(x => x.userName == user);
                    if (result != -1) {
                        $scope.isUserInList = true;
                        $scope.model1.UserName = user;
                        $scope.model1.Status = $scope.listUserApproved[result].status;
                        var userInfo = $scope.listStudent.find(x => x.UserName == user);
                        if (userInfo != undefined) {
                            $scope.model1.GivenName = userInfo.GivenName;
                        }
                    }
                    else {
                        $scope.isUserInList = false;
                    }
                });
            }
        }
        $scope.errorUserId = false;
    }
    $scope.addUserAsync = function (index) {
        if (index >= $scope.listStudent.length) {
            return;
        }
        var userIndex = $scope.listUserApproved.findIndex(x => x.userName === $scope.listStudent[index].UserName);
        if (userIndex !== -1) {
            $scope.addUserAsync(index + 1);
        }
        else {
            if ($scope.listStudent[index].UserName !== "All") {
                $scope.listUserApproved.push({
                    userName: $scope.listStudent[index].UserName,
                    status: 'WORKING_SCHEDULE_NOT_APPROVED',
                });
                $scope.model1.ListUser.push($scope.listStudent[index].UserName);
                dataservice.getCurrentUser(function (user) {
                    user = user.data;
                    var result = $scope.listUserApproved.findIndex(x => x.userName == user);
                    if (result != -1) {
                        $scope.isUserInList = true;
                        $scope.model1.UserName = user;
                        $scope.model1.Status = $scope.listUserApproved[result].status;
                        var userInfo = $scope.listStudent.find(x => x.UserName == user);
                        if (userInfo != undefined) {
                            $scope.model1.GivenName = userInfo.GivenName;
                        }
                    }
                    $scope.addUserAsync(index + 1);
                });
            }
            else {
                $scope.addUserAsync(index + 1);
            }
        }
    }
    $scope.removeUser = function (item) {
        var index = $scope.listUserApproved.findIndex(x => x.userName == item);
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
            App.toastrError('CAPTION.LMS_ARTICLE_EXIST')
        }
        else {
            $scope.listRef.push(cmsItem);
        }
    }
    $scope.deleteCmsItem = function (item) {
        if ($scope.listRef.indexOf(item) == -1) {
            App.toastrError('CAPTION.LMS_FAILURE_DELETED')
        } else {
            $scope.listRef.splice($scope.listRef.indexOf(item), 1);
        }
    }
    // token Manager
    $scope.addTokenManager = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderTokenManager + '/add.html',
            controller: 'addTokenManager',
            backdrop: 'static',
            size: 50
        });
        modalInstance.result.then(function (d) {
            dataservice.getListAccount(function (rs) {
                rs = rs.data;
                $rootScope.listAccount = rs;
            });
        }, function () { });
    };

    // class selection

    $scope.classOff = function () {
        $scope.modelClass = {
            Code: ''
        };
        $scope.listStudent = [
            {
                UserName: 'All',
                GivenName: caption.LMS_USER_ALL
            }
        ];
        dataservice.getListUserConnected(function (rs) {
            rs = rs.data;
            $scope.listStudent = $scope.listStudent.concat(rs);
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
        $scope.listStudent = [];
        dataservice.getListUserOfClass($scope.modelClass.Code, function (rs) {
            rs = rs.data;
            $scope.listStudent = rs;
            $scope.countUser = rs.length;
            $scope.listStudent.unshift(allMember);
        });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Teacher == "" || data.Teacher == "[]" || data.Teacher == undefined) {
            $scope.errorTeacher = true;
            mess.Status = true;
        } else {
            $scope.errorTeacher = false;
        }

        if (data.ListUserApproved == "" || data.ListUserApproved == "[]" || data.ListUserApproved == undefined) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }

        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubject = true;
            mess.Status = true;
        } else {
            $scope.errorSubject = false;
        }

        if (data.AccountZoom == "" || data.AccountZoom == null || data.AccountZoom == undefined) {
            $scope.errorAccountZoom = true;
            mess.Status = true;
        } else {
            $scope.errorAccountZoom = false;
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
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "AccountZoom" && $scope.model.AccountZoom != "") {
            $scope.errorAccountZoom = false;
        }
        if (SelectType == "Subject") {
            if ($scope.model.SubjectCode != "") {
                $scope.errorSubject = false;
            }
        }
        if (SelectType == "Teacher") {
            $scope.changeTeacher();
            if ($scope.model.Teacher != "") {
                $scope.errorSubject = false;
            }
        }
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
    function loadDate() {
        $("#datefrom").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii",
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
        loadDate();
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $controller, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataservice, para) {
    $controller('add', { $scope: $scope, $uibModalInstance: $uibModalInstance });

    $scope.init = function () {
        $scope.model = para;
        $scope.model.JsonLessonTemp = JSON.parse($scope.model.LessonDoc);
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $rootScope.listStatus = rs.Object;
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

            $scope.model.StartTime = $filter('date')($scope.model.StartTime, 'dd/MM/yyyy');
            $scope.model.EndTime = $filter('date')($scope.model.EndTime, 'dd/MM/yyyy');
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
            var userJoined = $scope.listUserApproved.map(x => { return x.userName }).join(", ");
            dataservice.getListUserJoined(userJoined, function (listUserJoined) {
                listUserJoined = listUserJoined.data;
                $scope.listStudent = [
                    {
                        UserName: 'All',
                        GivenName: caption.LMS_USER_ALL
                    }
                ];
                $scope.listStudent = $scope.listStudent.concat(listUserJoined);

                dataservice.getListUserConnected(function (rs) {
                    rs = rs.data;
                    $scope.listStudent = $scope.listStudent.concat(rs);
                    $scope.listStudent = removeDuplicateUsers($scope.listStudent);
                });
            });
            $scope.model1.ListUser = [];
            for (var obj of $scope.listUserApproved) {
                $scope.model1.ListUser.push(obj.userName);
            }
            if ($scope.model.JsonStatus != '' && $scope.model.JsonStatus != null && $scope.model.JsonStatus != undefined) {
                $scope.logStatus = JSON.parse($scope.model.JsonStatus);
            }
            else {
                $scope.logStatus = [];
            }
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
        });
    }

    $scope.init();

    $scope.submit = function () {
        var selectColor = $scope.listColor.find(function (element) {
            if (element.Check == true) return true;
        });
        if (selectColor) {
            $scope.model.BackgroundColor = selectColor.BackgroundColor;
            $scope.model.BackgroundImage = selectColor.BackgroundImage;
        }
        var check = CKEDITOR.instances['Description'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Description'].getData();
            $scope.model.Description = data;
        }
        //if ($scope.model1.ListUser.length == 0) {
        //    return App.toastrError(caption.WWS_MSG_SELECT_LIST_USER);
        //}
        $scope.model.ListUserApproved = JSON.stringify($scope.listUserApproved);
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
        validationSelect($scope.model);
        if ($scope.editformTutor.validate() && !validationSelect($scope.model).Status) {
            $scope.model.LessonDoc = JSON.stringify($scope.model.JsonLessonTemp);
            dataservice.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $uibModalInstance.dismiss('cancel');
                    App.toastrSuccess(rs.Title);
                    $('#calendar').fullCalendar('refetchEvents');
                }
            })
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Teacher == "" || data.Teacher == "[]" || data.Teacher == undefined) {
            $scope.errorTeacher = true;
            mess.Status = true;
        } else {
            $scope.errorTeacher = false;
        }

        if (data.ListUserApproved == "" || data.ListUserApproved == "[]" || data.ListUserApproved == undefined) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }

        if (data.SubjectCode == "" || data.SubjectCode == null || data.SubjectCode == undefined) {
            $scope.errorSubject = true;
            mess.Status = true;
        } else {
            $scope.errorSubject = false;
        }

        if (data.AccountZoom == "" || data.AccountZoom == null || data.AccountZoom == undefined) {
            $scope.errorAccountZoom = true;
            mess.Status = true;
        } else {
            $scope.errorAccountZoom = false;
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
