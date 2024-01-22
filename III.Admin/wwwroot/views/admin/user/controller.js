var ctxfolder = "/views/admin/user";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
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
        insert: function (data, callback) {
            submitFormUpload('/Admin/User/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/User/Update', data, callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/User/Getitem/' + data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/User/Delete/' + data).then(callback);
        },
        resort: function (data, callback) {
            $http.post('/Admin/User/Resort', data).then(callback);
        },
        getAll: function (callback) {
            $http.post('/Admin/User/GetAll/').then(callback);
        },
        loadGroupResource: function (callback) {
            $http.post('/Admin/User/GetGroupResource/').then(callback);
        },
        loadCompany: function (callback) {
            $http.post('/Admin/User/GetCompany/').then(callback);
        },
        loadOrganization: function (callback) {
            $http.post('/Admin/User/GetOrganization/').then(callback);
        },
        loadDepartment: function (callback) {
            $http.post('/Admin/User/GetDepartment/').then(callback);
        },
        loadRole: function (callback) {
            $http.post('/Admin/User/GetRole/').then(callback);
        },
        loadBranch: function (callback) {
            $http.post('/Admin/User/GetBranch/').then(callback);
        },
        loadProfitCenter: function (callback) {
            $http.post('/Admin/User/GetProfitCenter/').then(callback);
        },
        loadAccountExecutive: function (callback) {
            $http.post('/Admin/User/GetAccountExecutive/').then(callback);
        },
        deleteGUser: function (data, callback) {
            $http.post('/Admin/User/DeleteGUser', data).then(callback);
        },
        getListGroupRole: function (data, callback) {
            $http.get('/Admin/User/GetListGroupRole/' + data).then(callback);
        },
        deactive: function (data, callback) {
            $http.post('/Admin/User/Deactive', data).then(callback);
        },
        active: function (data, callback) {
            $http.post('/Admin/User/Active', data).then(callback);
        },
        checkUser: function (data, callback) {
            $http.get('/Admin/User/checkUser?userName=' + data).then(callback);
        },
        submitUpload: function (data, callback) {
            submitFormUpload('/Admin/User/UploadUser', data, callback);
        },
        submitInsertUser: function (data, callback) {
            $http.post('/Admin/User/InsertUsers', data).then(callback);
        },
        getAllApplication: function (callback) {
            $http.post('/Admin/PermissionResource/GetApplication/').then(callback);
        },
        getAllBranch: function (data, callback) {
            $http.post('/Admin/PermissionResource/GetAllBranch', data).then(callback);
        },
        getDepartmentByApp: function (data, callback) {
            $http.post('/Admin/User/GetDepartmentByApp', data).then(callback);
        },
        getResourceOfGroup: function (data, callback) {
            $http.post('/Admin/User/GetResourceOfGroup', data).then(callback);
        },
        updatePermission: function (data, callback) {
            $http.post('/Admin/User/UpdateUserPermission', data).then(callback);
        },
        getArea: function (callback) {
            $http.post('/Admin/User/GetArea/').then(callback);
        },
        getGroupUser: function (callback) {
            $http.post('/Admin/User/GetGroupUser/').then(callback);
        },
        //getAllStaff: function (callback) {
        //    $http.post('/Admin/User/GetAllStaff/').then(callback);
        //},
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getListEmployeeCode: function (data, callback) {
            $http.get('/Admin/User/GetListEmployeeCode?id=' + data).then(callback);
        },
        getListRoleCombination: function (callback) {
            $http.post('/Admin/User/GetListRoleCombination/').then(callback);
        },
        deleteUserGroupRole: function (data, callback) {
            $http.post('/Admin/User/DeleteUserGroupRole?id=' + data).then(callback);
        },
        insertUserGroupRole: function (data, callback) {
            $http.post('/Admin/User/InsertUserGroupRole', data).then(callback);
        },
        insertUserDepartmentRole: function (data, callback) {
            $http.post('/Admin/User/InsertUserDepartmentRole', data).then(callback);
        },
        deleteUserDepartmentRole: function (data, callback) {
            $http.post('/Admin/User/DeleteUserDepartmentRole?id=' + data).then(callback);
        },
        getHrEmployee: function (callback) {
            $http.get('/Admin/User/GetHrEmployee/').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },
        getDepartmentInBranch: function (data, callback) {
            $http.get('/Admin/User/GetDepartmentInBranch?branch=' + data).then(callback);
        },
        getShift: function (callback) {
            $http.post('/Admin/User/GetShift').then(callback);
        },
        getAllManager: function (data, callback) {
            $http.post('/Admin/User/GetAllManager?userId=' + data).then(callback);
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
    dataservice.getListUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/User/Translation');
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
    var vm = $scope;
    $scope.liAdd = [];
    $scope.model = {
        GroupUser: '',
        Role: 0,
        Organizations: 0,
        UserName: '',
        Email: '',
        Status: '',
        BranchId: '',
        DepartmentCode: '',
        GivenName: ''
    };


    // view help detail
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

    $scope.init = function () {
        dataservice.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            }
            $scope.listBranch.unshift(all)
        })
        dataservice.getGroupUser(function (rs) {
            rs = rs.data;
            $scope.groupUserList = rs;
        })
        dataservice.loadDepartment(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liDepartment = rs;
            }
        });
        dataservice.loadBranch(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liBranch = rs;
            }
        });
        dataservice.loadDepartment(function (rs) {
            rs = rs.data;
            $scope.departmentList = rs;
        });
    }
    $scope.init();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    //#region
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/User/JTable",
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
                d.DepartmentCode = $scope.model.DepartmentCode;
                d.BranchId = $scope.model.BranchId;
                d.GroupUser = $scope.model.GroupUser;
                d.Status = $scope.model.Status;
                d.UserName = $scope.model.UserName;
                d.Email = $scope.model.Email;
                d.GivenName = $scope.model.GivenName;
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
                    if (isAllData == "True" || userName == data.UserName) {
                        var Id = data._STT;
                        $scope.edit(Id);
                    }
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
            $scope.addId(full);
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ord').withTitle('{{"" | translate}}').withOption('sClass', 'tcenter  hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedDate').withTitle('{{"CREATED_DATE" | translate}}').withOption('sClass', 'tcenter  hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"GUSR_STT" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').withTitle('{{"ADM_USER_LIST_COL_NAME" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<span class="' + full.Color + '">' + data + ' <span class="text-primary">(' + full.UserName + ')</span>' + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Branch').withTitle('{{"ADM_USER_LIST_COL_BRANCH" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Role').withTitle('{{"ADM_USER_LIST_COL_ROLE" | translate}}').renderWith(function (data, type) {
        return '<span class="text-purple">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ListRoleGroup').withTitle('{{"ADM_USER_LIST_COL_LISTGROUP" | translate}}').renderWith(function (data, type, full) {
        var item = "";

        if (full.ListRoleGroup != null && full.ListRoleGroup != undefined && full.ListRoleGroup != '') {
            var listGroup = JSON.parse(full.ListRoleGroup);
            for (var i = 0; i < listGroup.length; i++) {
                item += "<span class='text-primary'>- " + listGroup[i].GroupName + ' <br/><span class="text-brown">(' + listGroup[i].RoleName + ')</span>' + "</span></br>";
            }
        }

        return item;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{"ADM_USER_LIST_COL_EMAIL" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Active').withTitle('{{"ADM_USER_LIST_COL_STATUS" | translate}}').withOption('sClass', 'dataTable-w90 text-center').renderWith(function (data, type) {
        return data == "True" ? '<span class="text-success">{{"ADM_USER_CURD_LBL_ACTIVE" | translate}}</span>' : '<span class="text-danger">{{"ADM_USER_CURD_LBL_INACTIVE" | translate}}</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Picture').withTitle('{{"ADM_USER_LIST_COL_AVATAR" | translate}}').withOption('sClass', 'dataTable-w90 text-center').renderWith(function (data, type, full, meta) {
        return data === "" ? "" : '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' class="img-responsive" height="40" width="40">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withTitle('{{"ADM_USER_LIST_COL_ACTION" | translate}}').withOption('sClass', 'dataTable-w80 text-center nowrap').renderWith(function (data, type, full) {
        if (isAllData == "True") {
            return '<a ng-click="edit(' + full._STT + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>' +
                '<a title="Xoá" ng-click="delete(' + full._STT + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></button>';
        } else if (userName == full.UserName) {
            return '<a ng-click="edit(' + full._STT + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>';
        }
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
    $scope.addId = function (data) {
        for (var i = 0; i < $scope.liAdd.length; i++) {
            if ($scope.liAdd[i] == data.Id) {
                return;
            }
        }
        $scope.liAdd.push(data);
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
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (stt) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i]._STT == stt) {
                userModel = listdata[i];
                $rootScope.UserId = listdata[i].Id;
                break;
            }
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return userModel;
                }
            }

        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.delete = function (stt) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i]._STT == stt) {
                userModel = listdata[i];
                $rootScope.UserId = listdata[i].Id;
                break;
            }
        }

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete($rootScope.UserId, function (rs) {
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

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
    }, 50);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate) {
    $scope.model = {
        TempSub: {
            IdI: [],
            IdS: [],
        },
        VIBUserInGroups: [],
        AspNetUserRoles: [],
        Organizations: 0,
        ApplicationCode: 'ADMIN',
        RoleId: '',
        UserName: '',
        Password: '',
        GivenName: '',
        EmployeeCode: '',
        Email: '',
        PhoneNumber: '',
        BranchId: '',
        DepartmentId: '',
        UserType: '1',
        Picture: '',
        Active: true,
        Note: '',
        TypeStaff: '',
        LeadersOfUser: ''
        //TypeWork: '',
        //Area: [],
        //GroupUserCode: []
    };
    $rootScope.model1 = {
        listLeader: [],
    }
    $scope.liBranch = [];
    var allBranch = {
        OrgCode: "ALL",
        OrgName: "Tất cả",
        OrgAddonCode: "b_ALL"
    }
    $scope.liBranch.push(allBranch);

    $scope.initData = function () {
        $rootScope.UserId = '';
        dataservice.loadRole(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.listRoles = rs;
            }
        });
        dataservice.loadDepartment(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liDepartment = rs;
            }
        });
        dataservice.loadBranch(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liBranch = rs;
            }
        });
        dataservice.loadProfitCenter(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.liProfitCenter = rs;
            }
        });
        dataservice.getAllApplication(function (rs1) {
            rs1 = rs1.data;
            if (rs1.Error) { }
            else {
                $scope.listApplication = rs1;
            }
        });
        dataservice.getArea(function (rs) {
            rs = rs.data;
            $scope.listArea = rs;
        });
        dataservice.getGroupUser(function (rs) {
            rs = rs.data;
            $scope.listGroupUser = rs;
        });
        //dataservice.getListEmployeeCode('', function (rs) {rs=rs.data;
        //    if (rs.Error) { }
        //    else {
        //        $scope.listEmployeeCode = rs.Object;
        //    }
        //});
        dataservice.getHrEmployee(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.listEmployeeCode = rs.Object;
            }
        });
        dataservice.getListRoleCombination(function (rs) {
            rs = rs.data;
            $scope.entities = rs;
        })
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {

            if ($scope.model.BranchId == null) {
                mess.Status = true;
                mess.Title += " - " + caption.ERR_REQUIRED.replace('{0}', caption.BRANCH) + "<br/>";
            }
            if ($scope.model.DepartmentId == null) {
                mess.Status = true;
                mess.Title += " - " + caption.ERR_REQUIRED.replace('{0}', caption.DEPARTMENT) + "<br/>";
            }
            var mess = { Status: false, Title: "" }
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }

            var fileSign = document.getElementById("FileSign").files[0]
            if (fileSign != undefined) {
                var idxDot = fileSign.name.lastIndexOf(".") + 1;
                var extFile = fileSign.name.substr(idxDot, fileSign.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }
            $scope.model.LeadersOfUser = $rootScope.model1.listLeader.join(',');

            var formData = new FormData();
            formData.append("image", file != undefined ? file : null);
            formData.append("imageSign", fileSign != undefined ? fileSign : null);
            formData.append("UserName", $scope.model.UserName);
            formData.append("Password", $scope.model.Password);
            formData.append("GivenName", $scope.model.GivenName);
            formData.append("Email", $scope.model.Email == null ? '' : $scope.model.Email);
            formData.append("PhoneNumber", $scope.model.PhoneNumber);
            formData.append("BranchId", $scope.model.BranchId);
            formData.append("DepartmentId", $scope.model.DepartmentId);
            formData.append("RoleId", $scope.model.RoleId);
            formData.append("ApplicationCode", $scope.model.ApplicationCode);
            formData.append("EmployeeCode", $scope.model.EmployeeCode);
            formData.append("UserType", $scope.model.UserType);
            formData.append("Active", $scope.model.Active);
            formData.append("Note", $scope.model.Note);
            formData.append("LeadersOfUser", $scope.model.LeadersOfUser);
            formData.append("TypeStaff", $scope.model.TypeStaff == null ? '' : $scope.model.TypeStaff);
            //formData.append("Area", $scope.model.Area.length != 0 ? $scope.model.Area.join(';') : '');
            //formData.append("GroupUserCode", $scope.model.GroupUserCode.length != 0 ? $scope.model.GroupUserCode.join(';') : '');
            var roleCombination = [];
            for (var i = 0; i < $scope.entities.length; i++) {
                if ($scope.entities[i].Check) {
                    var obj = {
                        Code: $scope.entities[i].Code
                    }
                    roleCombination.push(obj);
                }
            }
            formData.append("RoleCombination", JSON.stringify(roleCombination));
            dataservice.insert(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    //if ($scope.model.BranchId == null || $scope.model.DepartmentId == null) {
                    //    App.toastrError(mess.Title);
                    //} else {
                    $rootScope.UserId = rs.Object;
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadModelGroupUser();
                    $rootScope.reloadModelDepartmentUser();
                    $rootScope.countGroupUser = 0;
                    $rootScope.countDepartmentUser = 0;
                    //$uibModalInstance.close();
                    //}
                }
            });
        }
    };


    // view help detail
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

    $scope.save = function () {
        if ($rootScope.countGroupUser <= 0) {
            return App.toastrError(caption.ADM_USER_GROUP_NO_BLANK);
        }
        if ($rootScope.countDepartmentUser <= 0) {
            return App.toastrError(caption.ADM_USER_VALIDATE_DEPARTMENT);
        }


        $scope.model.ApplicationCode = 'ADMIN';
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }

            var fileSign = document.getElementById("FileSign").files[0]
            if (fileSign != undefined) {
                var idxDot = fileSign.name.lastIndexOf(".") + 1;
                var extFile = fileSign.name.substr(idxDot, fileSign.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }
            $scope.model.LeadersOfUser = $rootScope.model1.listLeader.join(',');

            var formData = new FormData();
            formData.append("image", file != undefined ? file : null);
            formData.append("imageSign", fileSign != undefined ? fileSign : null);
            formData.append("Id", $scope.model.Id);
            formData.append("UserName", $scope.model.UserName);
            formData.append("Password", $scope.model.Password);
            formData.append("GivenName", $scope.model.GivenName);
            formData.append("Email", $scope.model.Email == null ? '' : $scope.model.Email);
            formData.append("PhoneNumber", $scope.model.PhoneNumber == null ? '' : $scope.model.PhoneNumber);
            formData.append("BranchId", $scope.model.BranchId == null ? '' : $scope.model.BranchId);
            formData.append("DepartmentId", $scope.model.DepartmentId == null ? '' : $scope.model.DepartmentId);
            formData.append("RoleId", $scope.model.RoleId == null ? '' : $scope.model.RoleId);
            formData.append("ApplicationCode", $scope.model.ApplicationCode == null ? '' : $scope.model.ApplicationCode);
            formData.append("EmployeeCode", $scope.model.EmployeeCode == null ? '' : $scope.model.EmployeeCode);
            formData.append("UserType", $scope.model.UserType);
            formData.append("Active", $scope.model.Active);
            formData.append("Note", $scope.model.Note == null ? '' : $scope.model.Note);
            formData.append("LeadersOfUser", $scope.model.LeadersOfUser == null ? '' : $scope.model.LeadersOfUser);
            formData.append("TypeStaff", $scope.model.TypeStaff == null ? '' : $scope.model.TypeStaff);
            formData.append("Reason", $scope.model.Reason);
            formData.append("Area", $scope.model.Area.length != 0 ? $scope.model.Area.join(';') : '');
            //formData.append("GroupUserCode", $scope.model.GroupUserCode.length != 0 ? $scope.model.GroupUserCode.join(';') : '');
            var roleCombination = [];
            for (var i = 0; i < $scope.entities.length; i++) {
                if ($scope.entities[i].Check) {
                    var obj = {
                        Code: $scope.entities[i].Code
                    }
                    roleCombination.push(obj);
                }
            }
            formData.append("RoleCombination", JSON.stringify(roleCombination));
            $scope.ShiftList = [];
            for (var i = 0; i < $scope.lstShift.length; i++) {
                if ($scope.lstShift[i].IsChecked) {
                    var obj = {
                        Code: $scope.lstShift[i].Code
                    }
                    $scope.ShiftList.push(obj);
                }
            }
            formData.append("ShiftList", JSON.stringify($scope.ShiftList))
            dataservice.update(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadNoResetPage();
                    $uibModalInstance.close();
                }
            });
        }
    };
    $scope.updateManager = function () {
        dataservice.getAllManager($rootScope.UserId, function (rs) {
            rs = rs.data;
            $rootScope.model1.listLeader.splice(0);
            for (var leader of rs) {
                $rootScope.model1.listLeader.push(leader.UserName);
            }
        });
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "Branch" && $scope.model.BranchId != "") {
            $scope.errorBranch = false;
        }
        if (selectType == "Department" && $scope.model.DepartmentId != "") {
            $scope.errorDepartment = false;
        }
        if (selectType == "ApplicationCode" && $scope.model.ApplicationCode != "") {
            $scope.errorApplicationCode = false;
        }
        if (selectType == "RoleId" && $scope.model.RoleId != "") {
            $scope.errorRoleId = false;
        }
        //if (selectType == "Area") {
        //    if ($scope.model.Area.length > 0) {
        //        $scope.errorArea = false;
        //    } else {
        //        $scope.errorArea = true;
        //    }
        //}
        //if (selectType == "GroupUserCode") {
        //    if ($scope.model.GroupUserCode.length > 0) {
        //        $scope.errorGroupUserCode = false;
        //    } else {
        //        $scope.errorGroupUserCode = true;
        //    }
        //}
        if ($scope.model.PhoneNumber != "") {
            if (selectType == "PhoneNumber" && $scope.model.PhoneNumber && $rootScope.partternPhone.test($scope.model.PhoneNumber)) {
                $scope.errorPhoneNumber = false;
            }
        } else {
            $scope.errorPhoneNumber = false;
        }
    }
    $scope.selectTypeStaff = function (type) {
        $scope.errorBranch = false;
        $scope.errorDepartment = false;
        $scope.errorRoleId = false;
        $scope.errorApplicationCode = false;
    }
    $scope.selectEmployeeCode = function (item) {
        if (item != null) {
            $scope.model.GivenName = item.Name;
            $scope.model.Email = item.Email;
            $scope.model.PhoneNumber = item.PhoneNumber;
            $scope.model.DepartmentId = item.DepartmentId;
            $scope.model.RoleId = item.RoleId;
        }
        else {
            $scope.model.GivenName = '';
            $scope.model.Email = '';
            $scope.model.PhoneNumber = '';
            $scope.model.DepartmentId = '';
            $scope.model.RoleId = '';
        }
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.loadImageSign = function () {
        var fileuploader = angular.element("#FileSign");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageIdSign').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    function showPassWord() {
        $(".toggle-password").click(function () {
            $(this).toggleClass("fa-eye fa-eye-slash");
            var input = $($(this).attr("toggle"));
            if (input.attr("type") == "password") {
                input.attr("type", "text");
            } else {
                input.attr("type", "password");
            }
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if ($scope.model.TypeStaff === "" || $scope.model.TypeStaff === null || $scope.model.TypeStaff === 10) {
            //Check null Branch
            if (data.BranchId == "" || data.BranchId == null) {
                $scope.errorBranch = true;
                mess.Status = true;
            } else {
                $scope.errorBranch = false;
            }
            //Check null Department
            if (data.DepartmentId == "" || data.DepartmentId == null) {
                $scope.errorDepartment = true;
                mess.Status = true;
            } else {
                $scope.errorDepartment = false;
            }
            //Check null Application
            if (data.ApplicationCode == "" || data.ApplicationCode == null) {
                $scope.errorApplicationCode = true;
                mess.Status = true;
            } else {
                $scope.errorApplicationCode = false;
            }
            //Check null role
            if (data.RoleId == "" || data.RoleId == null) {
                $scope.errorRoleId = true;
                mess.Status = true;
            } else {
                $scope.errorRoleId = false;
            }
        } else {
            $scope.errorBranch = false;
            $scope.errorDepartment = false;
            $scope.errorRoleId = false;
            $scope.errorApplicationCode = false;
        }
        //if ($scope.model.Area.length == 0) {
        //    $scope.errorArea = true;
        //    mess.Status = true;

        //}
        //if ($scope.model.GroupUserCode.length == 0) {
        //    $scope.errorGroupUserCode = true;
        //    mess.Status = true;
        //}
        if (data.PhoneNumber && !$rootScope.partternPhone.test(data.PhoneNumber)) {
            $scope.errorPhoneNumber = true;
            mess.Status = true;
        } else {
            $scope.errorPhoneNumber = false;
        }


        return mess;
    };
    function showPassWord() {
        $(".toggle-password").click(function () {
            $(this).toggleClass("fa-eye fa-eye-slash");
            var input = $($(this).attr("toggle"));
            if (input.attr("type") == "password") {
                input.attr("type", "text");
            } else {
                input.attr("type", "password");
            }
        });
    }
    setTimeout(function () {
        showPassWord();
        setModalDraggable('.modal-dialog');
    }, 200);
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, DTOptionsBuilder, DTColumnBuilder, $translate, $timeout, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.TempSub = {
        IdI: [],
        IdS: [],
    };
    $scope.TempSubTemp = {
        IdI: [],
        IdS: [],
    };
    $scope.model = {
        TempSub: {
            IdI: [],
            IdS: [],
        },
        OrgId: 0,
        VIBUserInGroups: [],
        AspNetUserRoles: [],
        Organizations: 0,
        Password: '',
    };
    $rootScope.model1 = {
        listLeader: [],
    }
    $scope.liBranch = [];
    $scope.initData = function () {
        dataservice.getItem(para.Id, function (rs) {
            rs = rs.data;
            //$rootScope.UserId = '';
            //$rootScope.UserId = rs.Id;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                $scope.model.ApplicationCode = 'ADMIN';
                $scope.model.Password = '';
                $scope.model.Area = $scope.model.Area != '' && $scope.model.Area != null ? $scope.model.Area.split(';') : [];
                //$scope.model.GroupUserCode = $scope.model.GroupUserCode != null ? $scope.model.GroupUserCode : [];
                $rootScope.model1.listLeader = $scope.model.LeadersOfUser != '' && $scope.model.LeadersOfUser != null ?  $scope.model.LeadersOfUser.split(',') : [];
                $scope.model.TempSub = {
                    IdI: [],
                    IdS: [],
                };
                dataservice.getListRoleCombination(function (rs) {
                    rs = rs.data;
                    var listRoleCombination = $scope.model.RoleCombination != null ? JSON.parse($scope.model.RoleCombination) : [];
                    for (var i = 0; i < rs.length; i++) {
                        for (var j = 0; j < listRoleCombination.length; j++) {
                            if (rs[i].Code == listRoleCombination[j].Code) {
                                rs[i].Check = true;
                                break;
                            }
                        }
                    }
                    $scope.entities = rs;
                })
                dataservice.loadRole(function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) { }
                    else {
                        $scope.listRoles = rs1;
                    }
                });
                dataservice.loadDepartment(function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) {
                        //App.toastrError(rs1.Title);
                    }
                    else {
                        $scope.liDepartment = rs1;
                    }
                });
                dataservice.loadBranch(function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) { }
                    else {
                        $scope.liBranch = rs1;
                        var allBranch = {
                            OrgCode: "ALL",
                            OrgName: "Tất cả",
                            OrgAddonCode: "b_ALL"
                        }
                        $scope.liBranch.push(allBranch);
                    }
                });
                dataservice.getListGroupRole(para.Id, function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) { }
                    else {
                        $scope.listGroupRole = rs1;
                    }
                });
                dataservice.getAllApplication(function (rs1) {
                    rs1 = rs1.data;
                    if (rs1.Error) { }
                    else {
                        $scope.listApplication = rs1;
                    }
                });
                dataservice.getArea(function (rs) {
                    rs = rs.data;
                    $scope.listArea = rs;
                });
                dataservice.getGroupUser(function (rs) {
                    rs = rs.data;
                    $scope.listGroupUser = rs;
                });
                $scope.model.EmployeeCode = $scope.model.EmployeeCode == null ? '' : $scope.model.EmployeeCode;
                //dataservice.getListEmployeeCode($scope.model.EmployeeCode, function (rs) {rs=rs.data;
                //    if (rs.Error) { }
                //    else {
                //        $scope.listEmployeeCode = rs.Object;
                //    }
                //});

                dataservice.getShift(function (rs) {
                    rs = rs.data;
                    var shifts = $scope.model.ShiftList != null ? JSON.parse($scope.model.ShiftList) : [];
                    for (var i = 0; i < rs.length; i++) {
                        for (var j = 0; j < shifts.length; j++) {
                            if (rs[i].Code == shifts[j].Code) {
                                rs[i].IsChecked = true;
                            }
                        }
                    }

                    $scope.lstShift = rs;
                })

            }
        });
        dataservice.getHrEmployee(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.listEmployeeCode = rs.Object;
            }
        });
    }
    $scope.initData();

    $scope.submit = function () {
        
        $scope.model.ApplicationCode = 'ADMIN';
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }

            var fileSign = document.getElementById("FileSign").files[0]
            if (fileSign != undefined) {
                var idxDot = fileSign.name.lastIndexOf(".") + 1;
                var extFile = fileSign.name.substr(idxDot, fileSign.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }
            $scope.model.LeadersOfUser = $rootScope.model1.listLeader.join(',');

            var formData = new FormData();
            formData.append("image", file != undefined ? file : null);
            formData.append("imageSign", fileSign != undefined ? fileSign : null);
            formData.append("Id", $scope.model.Id);
            formData.append("UserName", $scope.model.UserName);
            formData.append("Password", $scope.model.Password);
            formData.append("GivenName", $scope.model.GivenName);
            formData.append("Email", $scope.model.Email == null ? '' : $scope.model.Email);
            formData.append("PhoneNumber", $scope.model.PhoneNumber == null ? '' : $scope.model.PhoneNumber);
            formData.append("BranchId", $scope.model.BranchId == null ? '' : $scope.model.BranchId);
            formData.append("DepartmentId", $scope.model.DepartmentId == null ? '' : $scope.model.DepartmentId);
            formData.append("RoleId", $scope.model.RoleId == null ? '' : $scope.model.RoleId);
            formData.append("ApplicationCode", $scope.model.ApplicationCode == null ? '' : $scope.model.ApplicationCode);
            formData.append("EmployeeCode", $scope.model.EmployeeCode == null ? '' : $scope.model.EmployeeCode);
            formData.append("UserType", $scope.model.UserType);
            formData.append("Active", $scope.model.Active);
            formData.append("Note", $scope.model.Note == null ? '' : $scope.model.Note);
            formData.append("LeadersOfUser", $scope.model.LeadersOfUser == null ? '' : $scope.model.LeadersOfUser);
            formData.append("TypeStaff", $scope.model.TypeStaff == null ? '' : $scope.model.TypeStaff);
            formData.append("Reason", $scope.model.Reason);
            formData.append("Area", $scope.model.Area.length != 0 ? $scope.model.Area.join(';') : '');
            //formData.append("GroupUserCode", $scope.model.GroupUserCode.length != 0 ? $scope.model.GroupUserCode.join(';') : '');
            var roleCombination = [];
            for (var i = 0; i < $scope.entities.length; i++) {
                if ($scope.entities[i].Check) {
                    var obj = {
                        Code: $scope.entities[i].Code
                    }
                    roleCombination.push(obj);
                }
            }
            formData.append("RoleCombination", JSON.stringify(roleCombination));
            $scope.ShiftList = [];
            for (var i = 0; i < $scope.lstShift.length; i++) {
                if ($scope.lstShift[i].IsChecked) {
                    var obj = {
                        Code: $scope.lstShift[i].Code
                    }
                    $scope.ShiftList.push(obj);
                }
            }
            formData.append("ShiftList", JSON.stringify($scope.ShiftList))
            dataservice.update(formData, function (rs) {
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


    // view help detail
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


    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Branch" && $scope.model.BranchId != "") {
            $scope.errorBranch = false;
        }
        //if (SelectType == "Department" && $scope.model.DepartmentId != "") {
        //    $scope.errorDepartment = false;
        //}
        if (SelectType == "ApplicationCode" && $scope.model.ApplicationCode != "") {
            $scope.errorApplicationCode = false;
        }
        if (SelectType == "RoleId" && $scope.model.RoleId != "") {
            $scope.errorRoleId = false;
        }
        if ($scope.model.PhoneNumber != "") {
            if (SelectType == "PhoneNumber" && $rootScope.partternPhone.test($scope.model.PhoneNumber)) {
                $scope.errorPhoneNumber = false;
            }
        } else {
            $scope.errorPhoneNumber = false;
        }
        if (SelectType == "Area") {
            if ($scope.model.Area.length > 0) {
                $scope.errorArea = false;
            } else {
                $scope.errorArea = true;
            }
        }
        //if (SelectType == "GroupUserCode") {
        //    if ($scope.model.GroupUserCode.length > 0) {
        //        $scope.errorGroupUserCode = false;
        //    } else {
        //        $scope.errorGroupUserCode = true;
        //    }
        //}
    }
    $scope.selectTypeStaff = function (type) {
        $scope.errorBranch = false;
        $scope.errorDepartment = false;
        $scope.errorRoleId = false;
        $scope.errorApplicationCode = false;
    }
    $scope.selectEmployeeCode = function (item) {
        
        if (item != null) {
            $scope.model.GivenName = item.Name;
            $scope.model.Email = item.Email;
            $scope.model.PhoneNumber = item.PhoneNumber;
            $scope.model.DepartmentId = item.DepartmentId;
            $scope.model.RoleId = item.RoleId;
        }
        else {
            $scope.model.GivenName = '';
            $scope.model.Email = '';
            $scope.model.PhoneNumber = '';
            $scope.model.DepartmentId = '';
            $scope.model.RoleId = '';
        }
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.loadImageSign = function () {
        var fileuploader = angular.element("#FileSign");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageIdSign').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    //Validate UiSelect
    function validationSelect(data) {
        
        var mess = { Status: false, Title: "" }
        if ($scope.model.TypeStaff === "" || $scope.model.TypeStaff === null || $scope.model.TypeStaff === 10) {
            //Check null Branch
            if (data.BranchId == "" || data.BranchId == null) {
                $scope.errorBranch = true;
                mess.Status = true;
            } else {
                $scope.errorBranch = false;
            }
            //Check null Department
            if (data.DepartmentId == "" || data.DepartmentId == null) {
                $scope.errorDepartment = true;
                mess.Status = true;
            } else {
                $scope.errorDepartment = false;
            }
            //Check null Application
            if (data.ApplicationCode == "" || data.ApplicationCode == null) {
                $scope.errorApplicationCode = true;
                mess.Status = true;
            } else {
                $scope.errorApplicationCode = false;
            }
            //Check null role
            if (data.RoleId == "" || data.RoleId == null) {
                $scope.errorRoleId = true;
                mess.Status = true;
            } else {
                $scope.errorRoleId = false;
            }
        } else {
            $scope.errorBranch = false;
            $scope.errorDepartment = false;
            $scope.errorRoleId = false;
            $scope.errorApplicationCode = false;
        }
        //if ($scope.model.Area.length == 0) {
        //    $scope.errorArea = true;
        //    mess.Status = true;
        //}
        //if ($scope.model.GroupUserCode.length == 0) {
        //    $scope.errorGroupUserCode = true;
        //    mess.Status = true;
        //}
        if (data.PhoneNumber && !$rootScope.partternPhone.test(data.PhoneNumber)) {
            $scope.errorPhoneNumber = true;
            mess.Status = true;
        } else {
            $scope.errorPhoneNumber = false;
        }
        return mess;
    };
    function showPassWord() {
        $(".toggle-password").click(function () {
            $(this).toggleClass("fa-eye fa-eye-slash");
            var input = $($(this).attr("toggle"));
            if (input.attr("type") == "password") {
                input.attr("type", "text");
            } else {
                input.attr("type", "password");
            }
        });
    }

    $scope.log = {};
    $scope.system = {};
    var vmLog = $scope.log;
    $scope.system = {
        DepartmentCode: '',
        GroupUserCode: '',
        UserName: '',
        FromDate: '',
        ToDate: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vmLog.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DashBoard/JTableSystemLog",
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
                d.DepartmentCode = $scope.system.DepartmentCode;
                d.GroupUserCode = $scope.system.GroupUserCode;
                d.UserName = para.UserName;
                d.FromDate = $scope.system.FromDate;
                d.ToDate = $scope.system.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(252, "#tblDataSystemLog");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [1, 'asc'])
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

                    var Id = data.Id;
                    $scope.openLog(Id);
                }
            });
        });

    vmLog.dtColumns = [];
    vmLog.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full._STT] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected,$event)"/><span></span></label>';
    }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"ADM_USER_LBL_ID" | translate}}').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"ADM_USER_LIST_COL_OBJECT" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vmLog.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{"ADM_USER_LIST_COL_ACTION_LOG" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('RequestBody').withTitle('{{"DB_LIST_COL_REQUEST_BODY" | translate}}').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('{{"ADM_USER_LIST_COL_USER_ACTION" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"ADM_USER_LIST_COL_TIME_LOG" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vmLog.dtColumns.push(DTColumnBuilder.newColumn('IP').withTitle('{{"ADM_USER_LIST_COL_IP_LOG" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));

    vmLog.reloadData = reloadData;
    vmLog.dtInstance = {};
    function reloadData(resetPaging) {
        vmLog.dtInstance.reloadData(callback, resetPaging);
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
    function toggleOne(selectedItems, evt) {
        $(evt.target).closest('tr').toggleClass('selected');
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                if (!selectedItems[id]) {
                    vmLog.selectAll = false;
                    return;
                }
            }
        }
        vmLog.selectAll = true;
    }
    function resetCheckbox() {
        $scope.selected = [];
        vmLog.selectAll = false;
    }
    $scope.search = function () {
        reloadData(true);
    };
    $scope.reload = function () {
        reloadData(true);
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.updateManager = function () {
        dataservice.getAllManager($rootScope.UserId, function (rs) {
            rs = rs.data;
            $rootScope.model1.listLeader.splice(0);
            for (var leader of rs) {
                $rootScope.model1.listLeader.push(leader.UserName);
            }
        });
    }

    $timeout(function () {
        showPassWord();
        setModalDraggable('.modal-dialog');
    }, 100);
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.controller('groupUser', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.modelGroupUser = {
        UserId: $rootScope.UserId
    }
    $rootScope.reloadModelGroupUser = function () {
        $scope.modelGroupUser.UserId = $rootScope.UserId;
    }
    $scope.initLoad = function () {
        dataservice.getGroupUser(function (rs) {
            rs = rs.data;
            $scope.groupUserList = rs;
        })
        dataservice.loadRole(function (rs) {
            rs = rs.data;
            $scope.roleList = rs;
        })
        dataservice.loadBranch(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.lstBranch = rs;
            }
        });
    }
    $scope.initLoad();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/User/JtableUserGroupRole",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $scope.modelGroupUser.UserId;
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataGroupUser");
                $rootScope.countGroupUser = d.responseJSON.recordsTotal;
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
        .withOption('order', [1, 'asc'])
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    //vm.dtcolumns.push(dtcolumnbuilder.newcolumn("check").withtitle(titlehtml).notsortable().renderwith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleone(selected)"/><span></span></label>';
    //}).withoption('sclass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Branch').withTitle($translate('ADM_USER_CURD_LBL_BRANCH')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GroupTitle').withTitle($translate('ADM_USER_LIST_COL_GROUP_USER')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserName').withTitle($translate('ADM_USER_LIST_COL_USERNAME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RoleTitle').withTitle($translate('ADM_USER_LIST_COL_ROLE_USER')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle($translate('ADM_USER_LIST_COL_ACTION')).renderWith(function (data, type, full) {
        return '<a title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
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
    $rootScope.reloadTabTicket = function () {
        reloadData(true);
    }
    $scope.addUserGroupRole = function () {
        if ($rootScope.isAllData != 'True') {
            return App.toastrError("Bạn không có quyền thêm");
        }
        if ($rootScope.UserId == '') {
            return App.toastrError("Bạn không có quyền thêm");
        }
        validationSelect($scope.modelGroupUser);
        if (!validationSelect($scope.modelGroupUser).Status) {
            dataservice.insertUserGroupRole($scope.modelGroupUser, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $rootScope.reloadNoResetPage();
                    if (rs.Object.length > 0) {
                        for (var leader of rs.Object) {
                            if ($rootScope.model1.listLeader.findIndex(x => x == leader.UserName) == -1) {
                                $rootScope.model1.listLeader.push(leader.UserName);
                            }
                        }
                    }
                }
            });
        }
    }
    $scope.delete = function (id) {
        if ($rootScope.isAllData != 'True') {
            return App.toastrError("Bạn không có quyền xóa");
        }
        dataservice.deleteUserGroupRole(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
                $rootScope.reloadNoResetPage();
                if (rs.Object.length > 0) {
                    for (var leader of rs.Object) {
                        var index = $rootScope.model1.listLeader.findIndex(x => x == leader.UserName);
                        if (index != -1) {
                            $rootScope.model1.listLeader.splice(index, 1);
                        }
                    }
                }
            }
        })
    }
    $scope.changeSelect = function (selectType) {
        if (selectType == "GroupUserCode" && $scope.modelGroupUser.GroupUserCode != "") {
            $scope.errorGroupUserCode = false;
        }
        if (selectType == "RoleId" && $scope.modelGroupUser.RoleId != "") {
            $scope.errorRoleId = false;
        }
        if (selectType == "Branch" && $scope.modelGroupUser.Branch != "") {
            $scope.errorBranchExtGrp = false;
        }
    }
    function validationSelect(data) {
        
        var mess = { Status: false, Title: "" }
        //Check null Branch
        if (data.GroupUserCode == "" || data.GroupUserCode == null) {
            $scope.errorGroupUserCode = true;
            mess.Status = true;
        } else {
            $scope.errorGroupUserCode = false;
        }
        //Check null Department
        if (data.RoleId == "" || data.RoleId == null) {
            $scope.errorRoleId = true;
            mess.Status = true;
        } else {
            $scope.errorRoleId = false;
        }

        if (data.Branch == "" || data.Branch == null) {
            $scope.errorBranchExtGrp = true;
            mess.Status = true;
        } else {
            $scope.errorBranchExtGrp = false;
        }
        return mess;
    };
});

app.controller('userDepartment', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.modelDepartmentUser = {
        UserId: $rootScope.UserId
    }
    $rootScope.reloadModelDepartmentUser = function () {
        $scope.modelDepartmentUser.UserId = $rootScope.UserId;
    }
    $scope.initLoad = function () {
        dataservice.loadDepartment(function (rs) {
            rs = rs.data;
            $scope.departmentList = rs;
        });
        dataservice.loadRole(function (rs) {
            rs = rs.data;
            $scope.roleList = rs;
        });
        dataservice.loadBranch(function (rs) {
            rs = rs.data;
            if (rs.Error) { }
            else {
                $scope.lstBranch = rs;
            }
        });
    }
    $scope.initLoad();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/User/JtableUserDepartmentRole",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.UserId = $rootScope.UserId;
            },
            complete: function (d) {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataDepartment");
                $rootScope.countDepartmentUser = d.responseJSON.recordsTotal;
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
        .withOption('order', [1, 'asc'])
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
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Branch').withTitle($translate('ADM_USER_CURD_LBL_BRANCH')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DepartmentTitle').withTitle($translate('ADM_USER_CURD_TAP_DEPARTMENT')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UserName').withTitle($translate('ADM_USER_LIST_COL_USERNAME')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RoleTitle').withTitle($translate('ADM_USER_LIST_COL_ROLE')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle($translate('ADM_USER_LIST_COL_ACTION')).renderWith(function (data, type, full) {
        return '<a title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs20 text-danger"></i></button>';
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
    $rootScope.reloadTabTicket = function () {
        reloadData(true);
    }
    $scope.addUserDepartRole = function () {
        if ($rootScope.isAllData != 'True') {
            return App.toastrError("Bạn không có quyền thêm");
        }
        if ($rootScope.UserId == '') {
            return App.toastrError("Bạn không có quyền thêm");
        }
        validationSelect($scope.modelDepartmentUser);
        if (!validationSelect($scope.modelDepartmentUser).Status) {
            dataservice.insertUserDepartmentRole($scope.modelDepartmentUser, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                    $rootScope.reloadNoResetPage();
                }
            });
        }
    }
    $scope.delete = function (id) {
        if ($rootScope.isAllData != 'True') {
            return App.toastrError("Bạn không có quyền xóa");
        }
        dataservice.deleteUserDepartmentRole(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
                $rootScope.reloadNoResetPage();
            }
        })
    }
    $scope.changleSelect = function (selectType) {
        if (selectType == "DepartmentCode" && $scope.modelDepartmentUser.DepartmentCode != "") {
            $scope.errorDepartmentCode = false;
        }
        if (selectType == "RoleId" && $scope.modelDepartmentUser.RoleId != "") {
            $scope.errorRoleId = false;
        }
        if (selectType == "Branch" && $scope.modelDepartmentUser.Branch != "") {
            $scope.errorBranchExt = false;
            dataservice.getDepartmentInBranch($scope.modelDepartmentUser.Branch, function (rs) {
                rs = rs.data;
                $scope.departmentList = rs;
                $scope.modelDepartmentUser.DepartmentCode = "";
            })
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null Branch
        if (data.DepartmentCode == "" || data.DepartmentCode == null) {
            $scope.errorDepartmentCode = true;
            mess.Status = true;
        } else {
            $scope.errorDepartmentCode = false;
        }
        //Check null Department
        if ($scope.modelDepartmentUser.RoleId == "" || $scope.modelDepartmentUser.RoleId == null) {
            $scope.errorRoleId = true;
            mess.Status = true;
        } else {
            $scope.errorRoleId = false;
        }

        if ($scope.modelDepartmentUser.Branch == "" || $scope.modelDepartmentUser.Branch == null) {
            $scope.errorBranchExt = true;
            mess.Status = true;
        } else {
            $scope.errorBranchExt = false;
        }
        return mess;
    };
});

