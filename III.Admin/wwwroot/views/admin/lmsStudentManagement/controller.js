var ctxfolder = "/views/admin/lmsStudentManagement";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
    .directive('customOnChange', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.on('change', onChangeHandler);
                element.on('$destroy', function () {
                    element.off();
                });

            }
        };
    });

app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    };
    var submitFormUpload = function (url, data, callback) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        };

        $http(req).then(callback);
    };
    return {
        getListCourse: function (callback) {
            $http.post('/Admin/LmsStudentManagement/GetListCourse').then(callback);
        },
        getLmsUserProgressGroupByTask: function (subjectCode, callback) {
            $http.post('/Admin/LmsStudentManagement/GetLmsUserProgressGroupByTask/?userId=' + subjectCode).then(callback);
        },
        getListSubject: function (callback) {
            $http.post('/Admin/LmsTaskManagement/GetListSubject').then(callback);
        },
        getListLecture: function (subjectCode, callback) {
            $http.post('/Admin/LmsTaskManagement/GetListLecture/?subjectCode=' + subjectCode).then(callback);
        },
        insertStudent: function (data, callback) {
            $http.post('/Admin/LmsStudentManagement/InsertStudent?keyword=' + data).then(callback);
        },
        deleteStudent: function (data, callback) {
            $http.post('/Admin/LmsStudentManagement/DeleteStudent?id=' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
    $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
    //Miêu tả có thể null, và có chứa được khoảng trắng
    $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
    $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
    $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
    $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
    $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
    $rootScope.partternPhone = /^(0)+([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0

    var culture = $cookies.get('.AspNetCore.Culture') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
            var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            //var partternPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}/;
            var partternPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/;
            var partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            var mess = { Status: false, Title: "" }
            if (data.EmployeeCode != null && data.EmployeeCode != '' && !partternCode.test(data.EmployeeCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.VALIDATE_ITEM_CODE.replace('{0}', caption.EMPLOYEE_CODE), "<br/>");
            }
            if (!partternName.test(data.FullName)) {
                mess.Status = true;
                mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.USER_FULLNAME) + "<br/>";
            }
            if (!partternDescription.test(data.Note)) {
                mess.Status = true;
                mess.Title += " - " + caption.VALIDATE_ITEM.replace('{0}', caption.NOTE) + "<br/>";
            }
            if (data.Password != undefined && data.Password != "" && data.Password.length < 6) {
                mess.Status = true;
                mess.Title += "Mật khẩu phải có ít nhất 6 ký tự" + "<br/>";
            }
            if (data.Email != '' && data.Email != null && !partternEmail.test(data.Email)) {
                mess.Status = true;
                mess.Title += caption.ADM_USER_VALIDATE_EMAIL + "<br/>";
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                UserName: {
                    required: true,
                    maxlength: 255,
                    regx: /^[a-zA-Z0-9]+[^êĂăĐđĨĩŨũƠơƯưẠ-ỹ!@#$%^&*<>?\s]*$/,
                },
                GivenName: {
                    required: true,
                    maxlength: 255
                },
                Email: {
                    //required: true,
                    //maxlength: 255,
                    regx: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
                },
                Note: {
                    maxlength: 2000
                },
                Reason: {
                    maxlength: 2000
                },
                Password: {
                    required: true,
                    maxlength: 50
                },
                PhoneNumber: {
                    //required: true,
                    regx: /^(0)+([0-9]{9,10})\b$/
                },
                //EmployeeCode: {
                //    required: true,
                //    maxlength: 50
                //},
                BranchId: {
                    required: true
                },
                DepartmentId: {
                    required: true
                }
                //ProfitCenterId: {
                //    required: true
                //},
                //AccountExecutiveId: {
                //    required: true
                //}
            },
            messages: {
                UserName: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_ACCOUNT_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_ACCOUNT_NAME).replace('{1}', '255'),
                    regx: caption.ADM_USER_VALIDATE_USERNAME
                },
                GivenName: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_NAME).replace('{1}', '255')
                },
                Email: {
                    regx: caption.ADM_USER_VALIDATE_EMAIL
                    //required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_EMAIL),
                    //maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_EMAIL).replace('{1}', '255')
                },
                Note: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_NOTE).replace('{1}', '2000')
                },
                Reason: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_REASON).replace('{1}', '2000')
                },
                Password: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_PASSWORD),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_PASSWORD).replace('{1}', '50')
                },
                //OfficeNumber: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.PHONE_NUMBER),
                //    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.PHONE_NUMBER).replace('{1}', '10')
                //},
                //EmployeeCode: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_EMPLOYEES_CODE),
                //    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_USER_CURD_LBL_EMPLOYEES_CODE).replace('{1}', '50')
                //},
                BranchId: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_BRANCH)
                },
                DepartmentId: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_DEPARTMENT)
                },
                PhoneNumber: {
                    //required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_USER_CURD_LBL_PHONE)
                    regx: caption.ADM_USER_CURD_MSG_ERR_PHONE
                },
                //ProfitCenterId: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.PROFIT_CENTER)
                //},
                //AccountExecutiveId: {
                //    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ACCOUNT_EXECUTIVE)
                //}
            }
        }
        $rootScope.StatusData = [
            { Value: null, Name: 'Tất cả' },
            {
                Value: true,
                Name: "Hoạt động"
            }, {
                Value: false,
                Name: "Không hoạt động"
            }];
        $rootScope.TypeStaffData = [{
            Code: 0,
            Name: "Nhân viên thị trường"
        }, {
            Code: 10,
            Name: "Cán bộ duyệt"
        }, {
            Code: 5,
            Name: "NPP/ĐLý/Cửa hàng"
        }];
        $rootScope.IsTranslate = true;
    });
    $rootScope.typeWork = [{
        Code: 'P',
        Name: 'PartTime'
    }, {
        Code: 'F',
        Name: 'FullTime'
    }]
    $rootScope.UserId = '';
    $rootScope.isAllData = isAllData;
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/LmsStudentManagement/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',//'/Admin/User/GetView/Index',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',//'/Admin/User/GetView/Edit',
            controller: 'edit'
        })
        .when('/groupRole/:id', {
            templateUrl: ctxfolder + '/groupRole.html',
            controller: 'groupRole'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',//'/Admin/User/GetView/Add',
            controller: 'add'
        })
        .when('/permission/:id', {
            templateUrl: ctxfolder + '/permission.html',
            controller: 'permission'
        });
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
});

app.controller('index', function ($scope, $rootScope, $filter, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    //#init
    $("#breadcrumb").addClass('hidden');
    $("#breadcrumbIndex").appendTo("#breadcrumb-container");
    var vm = $scope;
    $scope.model = {
        UserName: '',
        Email: '',
        SubjectCode: '',
        LectCode: '',
        Teacher: '',
        GivenName: ''
    };
    $scope.init = function () {
        dataservice.getListSubject(function (rs) {
            rs = rs.data;
            $rootScope.listSubject = rs;
        });
        dataservice.getListCourse(function (rs) {
            rs = rs.data;
            $rootScope.listCourse = rs;
        });
    }
    $scope.init();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    //#endinit

    //#region
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsStudentManagement/JTable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserName = $scope.model.UserName;
                d.Email = $scope.model.Email;
                d.GivenName = $scope.model.GivenName;
                d.CourseCode = $scope.model.CourseCode;
                d.SubjectCode = $scope.model.SubjectCode;
                d.Teacher = $scope.model.Teacher;
            },
            complete: function (rs) {
                App.unblockUI("#contentMain");
                heightTableAuto();
                if (rs && rs.responseJSON && rs.responseJSON.Error) {
                    App.toastrError(rs.responseJSON.Title);
                }
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data._STT] = !$scope.selected[data._STT];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data._STT] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data._STT] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data._STT;
                    $scope.showProgress(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedDate').withTitle('{{"CREATED_DATE" | translate}}').withOption('sClass', 'tcenter  hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').withTitle('{{"LMS_FIRST_LAST_NAME_STUDENT" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) { //LMS_STUDENT_LIST_COL_NAME
        return full.Picture === "" ? "" : '<img class="img-circle mr10" src="' + full.Picture + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' class="img-responsive" height="40" width="40">'
        + data + ' <span class="text-primary">(' + full.UserName + ')</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{"ADM_USER_LIST_COL_EMAIL" | translate}}').withOption('sClass', 'nowrap wpercent25').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Gender').withTitle('{{"LMS_GENDER" | translate}}').withOption('sClass', 'nowrap wpercent5').renderWith(function (data, type, full) { //LMS_STUDENT_LIST_COL_GENDER
        return data == 1 ? caption.HR_HR_MAN_CURD_TXT_MEN : caption.HR_HR_MAN_CURD_TXT_WOMEN;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Phone').withTitle('{{"LMS_PHONE_NUMBER" | translate}}').withOption('sClass', 'nowrap wpercent10').renderWith(function (data, type, full, meta) { // LMS_STUDENT_LIST_COL_PHONE
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Progress').withTitle('{{"LMS_PROGRESS" | translate}}').withOption('sClass', 'nowrap wpercent10').renderWith(function (data, type, full, meta) { // LMS_STUDENT_LIST_COL_PROGRESS
        return '<span class="text-green" ng-click="showProgress(\'' + full.Id + '\')">' + Number.parseFloat(data).toFixed(2) + '%</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TaskNumber').withTitle('{{"LMS_TASK_ASSIGNED" | translate}}').withOption('sClass', 'nowrap wpercent10').renderWith(function (data, type, full, meta) { // LMS_STUDENT_LIST_COL_TASK_NUM
        return 'Tổng: ' + data; //COM_TXT_SUM
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.reload = function () {
        reloadData(true);
    }
    //#endregion

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '35'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }

    $scope.changeSubject = function (item) {
        dataservice.getListLecture(item.Code, function (rs) {
            rs = rs.data;
            $rootScope.listLecture = rs;
        })
    };

    $scope.showProgress = function (userId) {
        dataservice.getLmsUserProgressGroupByTask(userId, function (rs) {
            rs = rs.data;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/show-user-progress.html',
                //openedClass: 'vertical-container',
                //windowClass: 'vertical-center',
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.listTask = para;
                    $scope.ok = function () {
                        $uibModalInstance.close(true);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };
                },
                backdrop: 'static',
                size: '50',
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

    setTimeout(function () {
    }, 50);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {
    //detail
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        UserName: 'cntt',
        Email: '',
        SubjectCode: '',
        LectCode: '',
        Teacher: '',
        GivenName: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    //#region
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsMentee = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LmsStudentManagement/JTableMentee",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

            },
            complete: function (rs) {
                App.unblockUI("#contentMain");
                heightTableAuto();
                if (rs && rs.responseJSON && rs.responseJSON.Error) {
                    App.toastrError(rs.responseJSON.Title);
                }
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data._STT] = !$scope.selected[data._STT];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data._STT] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data._STT] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data._STT;
                    $scope.showProgress(Id);
                }
            });
        });

    vm.dtColumnsMentee = [];
    vm.dtColumnsMentee.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    //vm.dtColumnsMentee.push(DTColumnBuilder.newColumn('CreatedDate').withTitle('{{"CREATED_DATE" | translate}}').withOption('sClass', 'tcenter  hidden').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumnsMentee.push(DTColumnBuilder.newColumn('FullName').withTitle('{{"LMS_FIRST_LAST_NAME_STUDENT" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) { //LMS_STUDENT_LIST_COL_NAME
        return full.Picture === "" ? "" : '<img class="img-circle mr10" src="' + full.Picture + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' class="img-responsive" height="40" width="40">'
            + data + ' <span class="text-primary">(' + full.UserName + ')</span>';
    }));
    vm.dtColumnsMentee.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sClass', 'nowrap wpercent5').renderWith(function (data, type, full, meta) {
        return '<a title="{{"LMS_PRACTICE_TEST_LBL_DELETE" | translate}}" ng-click="deleteStudent(\'' + full.MenteeId + '\')" class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstanceMentee = {};
    function reloadData(resetPaging) {
        vm.dtInstanceMentee.reloadData(callback, resetPaging);
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.reload = function () {
        reloadData(true);
    }
    //#endregion
    $scope.addStudent = function () {
        dataservice.insertStudent($scope.model.Keyword, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        });
    }
    $scope.deleteStudent = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteStudent(id, function (rs) {
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
});