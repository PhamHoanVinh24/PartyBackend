var ctxfolderLmsClass = "/views/admin/lmsClass";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", "ngCookies", 'ngSanitize']);

app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getListUser: function (callback) {
            $http.post('/Admin/LmsClass/GetListUser').then(callback);
        },
        getListUserJoined: function (data, callback) {
            $http.post('/Admin/LmsClass/GetListUserJoined?classCode=' + data).then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/LmsExamSchedule/GetListStatus').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/LmsClass/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/LmsClass/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/LmsClass/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/LmsClass/GetItem?id=' + data).then(callback);
        },
        getClassCode: function (data, callback) {
            $http.post('/Admin/LmsClass/GetClassCode?teacher=' + data).then(callback);
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

        $rootScope.validationOptions = {
            rules: {
                ClassCode: {
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
                    required: caption.LMS_VALIDATE_CLASS_CODE,
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

        dataservice.getListUser(function (rs) {
            rs = rs.data;
            $rootScope.listUserTeacher = rs;
            $rootScope.listUser = rs;
        });
        //dataservice.getListAccount(function (rs) {
        //    rs = rs.data;
        //    $rootScope.listAccount = rs;
        //});
    });
    $rootScope.session = null;
    $rootScope.pageP = 1;
    $rootScope.pageSizeP = 10;
    $rootScope.pageS = 1;
    $rootScope.pageSizeS = 10;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsClass/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderLmsClass + '/index.html',
            controller: 'indexClass'
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

app.controller('indexClass', function ($scope, $rootScope, $compile, $confirm, $document, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $("#breadcrumb").addClass('hidden');
    $("#breadcrumbIndex").appendTo("#breadcrumb-container");
    $scope.model = {
        Teacher: '',
        FromDate: '',
        ToDate: '',
        Student: ''
    };
    var vm = $scope;// exam
    $scope.headerCompiledExam = false;
    $scope.selectedExam = [];
    $scope.selectAllExam = false;
    $scope.toggleAllExam = toggleAllExam;
    $scope.toggleOneExam = toggleOneExam;
    $scope.listStatus = [{
        Code: 'WORKING_SCHEDULE_NOT_APPROVED',
        Name: caption.LMS_NOT_APPROVED
    },
    {
        Code: 'WORKING_SCHEDULE_APPROVED',
        Name: caption.LMS_APPROVED
    },];

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAllExam" ng-click="toggleAllExam(selectAllExam, selected)"/><span></span></label>';
    vm.dtOptionsExam = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsClass/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Teacher = $scope.model.Teacher;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Student = $scope.model.Student;
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                heightTableViewportManual(218, '#tblDataExam');
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
                    if (userName === data.ManagerTeacher || userName === data.CreatedBy) {
                        $scope.edit(Id);
                    }
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
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('ClassName').withTitle('{{ "LMS_CLASS_NAME" | translate }}').renderWith(function (data, type, full) {
        return data + '</br>' + full.ClassCode;
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('StartTime').withTitle('<i class="fas fa-stopwatch fs10 text-green"></i> {{ "LMS_START_TIME" | translate }}').withOption('sClass', 'w20 fs10').renderWith(function (data, type) {
        return data; /*MS_HDR_START*/
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('EndTime').withTitle('<i class="fas fa-clock fs10 text-green"></i> {{ "LMS_END_TIME" | translate }}').withOption('sClass', 'w20 fs10').renderWith(function (data, type) {
        return data; /*MS_HDR_END*/
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('CountStudent').withTitle('{{ "LMS_STUDENT" | translate }}').withOption('sClass', 'w20 text-center').renderWith(function (data, type, full) {
        return data + ' <a title="{{&quot;LMS_STUDENTs&quot; | translate}}" ng-click="showListUser(\'' + full.ClassCode + '\')"  class="fs25 pl20"><i class="fas fa-users color-dark"></i></a>';
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
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('Status').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{ "LMS_SUBJECT_STATUS" | translate }}').renderWith(function (data, type, full, meta) {
        var index = $scope.listStatus.findIndex(x => x.Code == data);
        if (index !== -1) {
            return $scope.listStatus[index].Name;
        }
    }));
    vm.dtColumnsExam.push(DTColumnBuilder.newColumn('Action').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        if (userName === full.ManagerTeacher || userName === full.CreatedBy) {
            return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="editExamSchedule(' +
                full.Id +
                ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' +
                full.Id +
                ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
        } else {
            return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="editExamSchedule(' +
                full.Id +
                ')"  class="fs25 pr10 disabled-element"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
                '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' +
                full.Id +
                ')"  class="fs25 disabled-element"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    };

    $scope.showListUser = function (classCode) {
        dataservice.getListUserJoined(classCode, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderLmsClass + '/show-user-joined.html',
                //openedClass: 'vertical-container',
                //windowClass: 'vertical-center',
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.listUser = para.listUser;
                    $scope.classCode = para.classCode;
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
                        return {
                            listUser: rs,
                            classCode: classCode
                        };
                    }
                }
            });
            modalInstance.result.then(function (d) {

            }, function () { });
        });
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderLmsClass + '/add.html',
            controller: 'addClass',
            backdrop: 'static',
            keyboard: false,
            size: '55',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadExam();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLmsClass + '/add.html',
                    controller: 'editClass',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadExam();
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
                $scope.message = "Xóa cuộc họp?";
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
});

app.controller('addClass', function ($scope, $rootScope, $compile, $uibModal, $sce, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataservice) {
    $scope.listStatus = [{
        Code: 'WORKING_SCHEDULE_NOT_APPROVED',
        Name: caption.LMS_NOT_APPROVED
    },
    {
        Code: 'WORKING_SCHEDULE_APPROVED',
        Name: caption.LMS_APPROVED
    },];
    $scope.listStudent = [];
    $scope.model1 = {
        ListUser: [],
        UserName: '',
        GivenName: '',
        Status: 'WORKING_SCHEDULE_NOT_APPROVED'
    };
    $scope.model = {
        ClassCode: '',
        ClassName: '',
        StartTime: '',
        EndTime: '',
        Status: '',
        Noted: '',
        UserClass: '',
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    if ($scope.edit !== true) {
        $scope.title = caption.LMS_CLASS_TITLE_CREATE_CLASS;
    }

    $scope.init = function () {
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $rootScope.listStatus = rs.Object;
        });
    }

    $scope.init();

    $scope.submit = function () {
        $scope.model.UserClass = JSON.stringify($scope.listStudent);
        var check = CKEDITOR.instances['Noted'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Noted'].getData();
            $scope.model.Noted = data;
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
    $scope.addUser = function (item) {
        $scope.listStudent.push({
            userName: item.UserName,
        });
        $scope.errorUserId = false;
    }
    $scope.removeUser = function (item) {
        var index = $scope.listUserApproved.findIndex(x => x.userName == item.UserName);
        if (index != -1) {
            $scope.listUserApproved.splice(index, 1);
        }
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Teacher" && $scope.model.ManagerTeacher != "") {
            $scope.errorTeacher = false;
            dataservice.getClassCode($scope.model.ManagerTeacher, function (rs) {
                rs = rs.data;
                $scope.model.ClassCode = rs;
            });
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.ManagerTeacher == "" || data.ManagerTeacher == "[]" || data.ManagerTeacher == undefined) {
            $scope.errorTeacher = true;
            mess.Status = true;
        } else {
            $scope.errorTeacher = false;
        }

        if (data.UserClass == "" || data.UserClass == "[]" || data.UserClass == undefined) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }

        if (data.ManagerTeacher == "" || data.ManagerTeacher == null || data.ManagerTeacher == undefined) {
            $scope.errorPractice = true;
            mess.Status = true;
        } else {
            $scope.errorPractice = false;
        }

        return mess;
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
        var editor = CKEDITOR.replace('Noted', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Noted'].config.height = 120;
    }
    setTimeout(function () {
        //setModalDraggable('.modal-dialog');
        ckEditer();
        loadDate();
    }, 200);
});

app.controller('editClass', function ($scope, $rootScope, $compile, $controller, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, dataservice, para) {
    $scope.edit = true;
    $controller('addClass', { $scope: $scope, $uibModalInstance: $uibModalInstance });
    $scope.init = function () {
        $scope.model = para;
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $rootScope.listStatus = rs.Object;
        });

        $scope.model.StartTime = $filter('date')($scope.model.StartTime, 'dd/MM/yyyy');
        $scope.model.EndTime = $filter('date')($scope.model.EndTime, 'dd/MM/yyyy');
        // get List User
        if ($scope.model.UserClass != '' && $scope.model.UserClass != null && $scope.model.UserClass != undefined) {
            $scope.listStudent = JSON.parse($scope.model.UserClass);
        }
        else {
            $scope.listStudent = [];
        }
        $scope.model1.ListUser = [];
        for (var obj of $scope.listStudent) {
            $scope.model1.ListUser.push(obj.UserName);
        }
        setTimeout(function () {
            CKEDITOR.instances['Noted'].setData($scope.model.Noted);
        }, 1000);
    }

    $scope.init();

    if ($scope.edit === true) {
        $scope.title = caption.LMS_CLASS_TITLE_EDIT_CLASS;
    }

    $scope.submit = function () {
        $scope.model.UserClass = JSON.stringify($scope.listStudent);
        var check = CKEDITOR.instances['Noted'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['Noted'].getData();
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

        if (data.UserClass == "" || data.UserClass == "[]" || data.UserClass == undefined) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }

        if (data.ManagerTeacher == "" || data.ManagerTeacher == null || data.ManagerTeacher == undefined) {
            $scope.errorPractice = true;
            mess.Status = true;
        } else {
            $scope.errorPractice = false;
        }

        return mess;
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
        var editor = CKEDITOR.replace('Noted', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Noted'].config.height = 120;
    }
    setTimeout(function () {
        //setModalDraggable('.modal-dialog');
        ckEditer();
        loadDate();
    }, 200);
});