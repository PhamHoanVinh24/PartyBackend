var ctxfolderALSP = "/views/admin/allowanceSettingParam";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_ALSP', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload2 = function (url, data, callback) {

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
        getListUser: function (callback) {
            $http.post('/Admin/User/GetListUser').then(callback);
        },
        getListEmployee: function (callback) {
            $http.post('/Admin/WorkBookSalary/GetEmployee').then(callback);
        },
        getLastInOut: function (callback) {
            $http.post('/Admin/StaffTimeKeeping/GetLastInOut').then(callback);
        },
        getEmployeeDetailAllowance: function (month, departmentId, callback) {
            $http.post('/Admin/AllowanceSettingParam/GetEmployeeDetailAllowance?month=' + month + '&departmentId=' + departmentId).then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/HREmployee/GetDepartment').then(callback);
        },
        exportExcelAllowance: function (data, callback) {
            $http.post('/Admin/AllowanceSettingParam/ExportExcel', data).then(callback);
        },
        saveExcelAllowance: function (data, callback) {
            $http.post('/Admin/AllowanceSettingParam/SaveExcel', data).then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM_ALSP', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                Code: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 255
                },
                Name: {
                    required: true,
                    maxlength: 255
                },
            },
            messages: {
                Code: {
                    required: caption.ALSP_MSG_NOT_CODE,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.ALSP_CURD_LBL_SERVICE_CODE),
                    maxlength: caption.ALSP_MSG_NOT_CODE_CHARACTER_255
                },
                Name: {
                    required: caption.ALSP_MSG_NOT_NAME,
                    maxlength: caption.ALSP_MSG_NOT_NAME_CHARACTER
                },
            }
        }
    });

    dataservice.getListUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
        var all = {
            UserName: '',
            GivenName: 'Tất cả'
        };
        $rootScope.listUser.unshift(all);
    });
    dataservice.getListEmployee(function (rs) {
        rs = rs.data;
        $rootScope.listEmployee = rs;
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AllowanceSettingParam/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderALSP + '/index.html',
            controller: 'index'
        })
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        Month: '',
        UserManager: '',
        UserCreated: '',
        DepartmentId: '',
        TotalWork: 22
    };

    $scope.listEmployeeDetail = [];

    $scope.Total = {
        C: 0,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
        I: 0,
        J: 0,
        K: 0,
        L: 0,
        M: 0,
        N: 0,
        O: 0,
        P: 0,
        Q: 0,
        R: 0,
        S: 0,
        T: 0,
    };

    var currentdate = new Date();
    $scope.month = 'Tháng ' + (currentdate.getMonth() + 1);
    $scope.year = currentdate.getFullYear();

    $scope.init = function () {
        dataservice.getDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs.Object;
        });
    };

    $scope.init();

    $scope.changeDepartment = function () {
        $scope._listUser = $rootScope.listEmployee.filter(x => x.DepartmentId === $scope.model.DepartmentId);
    };

    $scope.calTimeSheet = function () {
        //if ($scope.model.DepartmentId === '' || $scope.model.DepartmentId === undefined || $scope.model.DepartmentId === null) {
        //    App.toastrError('Vui lòng chọn phòng ban !');
        //    return;
        //}

        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });

        dataservice.getEmployeeDetailAllowance($scope.model.Month, $scope.model.DepartmentId, function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            
            $scope.listEmployeeDetail = rs.result;
            $scope.Total = {
                C: 0,
                D: 0,
                E: 0,
                F: 0,
                G: 0,
                H: 0,
                I: 0,
                J: 0,
                K: 0,
                L: 0,
                M: 0,
                N: 0,
                O: 0,
                P: 0,
                Q: 0,
                R: 0,
                S: 0,
                T: 0,
            };

            for (var i = 0; i < $scope.listEmployeeDetail.length; i++) {
                $scope.listEmployeeDetail[i].T =
                    parseFloat($scope.listEmployeeDetail[i].L)
                    + parseFloat($scope.listEmployeeDetail[i].M)
                    + parseFloat($scope.listEmployeeDetail[i].N)
                    + parseFloat($scope.listEmployeeDetail[i].O)
                    + parseFloat($scope.listEmployeeDetail[i].P)
                    + parseFloat($scope.listEmployeeDetail[i].Q)
                    + parseFloat($scope.listEmployeeDetail[i].R);

                $scope.listEmployeeDetail[i].T = Math.round($scope.listEmployeeDetail[i].T / 1000) * 1000;

                if ($scope.listEmployeeDetail[i].C !== '' && $scope.listEmployeeDetail[i].C !== undefined && $scope.listEmployeeDetail[i].C !== null)
                    $scope.Total.C += parseFloat($scope.listEmployeeDetail[i].C);

                if ($scope.listEmployeeDetail[i].D !== '' && $scope.listEmployeeDetail[i].D !== undefined && $scope.listEmployeeDetail[i].D !== null)
                    $scope.Total.D += parseFloat($scope.listEmployeeDetail[i].D);

                if ($scope.listEmployeeDetail[i].E !== '' && $scope.listEmployeeDetail[i].E !== undefined && $scope.listEmployeeDetail[i].E !== null)
                    $scope.Total.E += parseFloat($scope.listEmployeeDetail[i].E);

                if ($scope.listEmployeeDetail[i].F !== '' && $scope.listEmployeeDetail[i].F !== undefined && $scope.listEmployeeDetail[i].F !== null)
                    $scope.Total.F += parseFloat($scope.listEmployeeDetail[i].F);

                if ($scope.listEmployeeDetail[i].G !== '' && $scope.listEmployeeDetail[i].G !== undefined && $scope.listEmployeeDetail[i].G !== null)
                    $scope.Total.G += parseFloat($scope.listEmployeeDetail[i].G);

                if ($scope.listEmployeeDetail[i].H !== '' && $scope.listEmployeeDetail[i].H !== undefined && $scope.listEmployeeDetail[i].H !== null)
                    $scope.Total.H += parseFloat($scope.listEmployeeDetail[i].H);

                if ($scope.listEmployeeDetail[i].I !== '' && $scope.listEmployeeDetail[i].I !== undefined && $scope.listEmployeeDetail[i].I !== null)
                    $scope.Total.I += parseFloat($scope.listEmployeeDetail[i].I);

                if ($scope.listEmployeeDetail[i].J !== '' && $scope.listEmployeeDetail[i].J !== undefined && $scope.listEmployeeDetail[i].J !== null)
                    $scope.Total.J += parseFloat($scope.listEmployeeDetail[i].J);

                if ($scope.listEmployeeDetail[i].K !== '' && $scope.listEmployeeDetail[i].K !== undefined && $scope.listEmployeeDetail[i].K !== null)
                    $scope.Total.K += parseFloat($scope.listEmployeeDetail[i].K);

                if ($scope.listEmployeeDetail[i].L !== '' && $scope.listEmployeeDetail[i].L !== undefined && $scope.listEmployeeDetail[i].L !== null)
                    $scope.Total.L += parseFloat($scope.listEmployeeDetail[i].L);

                if ($scope.listEmployeeDetail[i].M !== '' && $scope.listEmployeeDetail[i].M !== undefined && $scope.listEmployeeDetail[i].M !== null)
                    $scope.Total.M += parseFloat($scope.listEmployeeDetail[i].M);

                if ($scope.listEmployeeDetail[i].N !== '' && $scope.listEmployeeDetail[i].N !== undefined && $scope.listEmployeeDetail[i].N !== null)
                    $scope.Total.N += parseFloat($scope.listEmployeeDetail[i].N);

                if ($scope.listEmployeeDetail[i].O !== '' && $scope.listEmployeeDetail[i].O !== undefined && $scope.listEmployeeDetail[i].O !== null)
                    $scope.Total.O += parseFloat($scope.listEmployeeDetail[i].O);

                if ($scope.listEmployeeDetail[i].P !== '' && $scope.listEmployeeDetail[i].P !== undefined && $scope.listEmployeeDetail[i].P !== null)
                    $scope.Total.P += parseFloat($scope.listEmployeeDetail[i].P);

                if ($scope.listEmployeeDetail[i].Q !== '' && $scope.listEmployeeDetail[i].Q !== undefined && $scope.listEmployeeDetail[i].Q !== null)
                    $scope.Total.Q += parseFloat($scope.listEmployeeDetail[i].Q);

                if ($scope.listEmployeeDetail[i].R !== '' && $scope.listEmployeeDetail[i].R !== undefined && $scope.listEmployeeDetail[i].R !== null)
                    $scope.Total.R += parseFloat($scope.listEmployeeDetail[i].R);

                if ($scope.listEmployeeDetail[i].S !== '' && $scope.listEmployeeDetail[i].S !== undefined && $scope.listEmployeeDetail[i].S !== null)
                    $scope.Total.S += parseFloat($scope.listEmployeeDetail[i].S);

                if ($scope.listEmployeeDetail[i].T !== '' && $scope.listEmployeeDetail[i].T !== undefined && $scope.listEmployeeDetail[i].T !== null)
                    $scope.Total.T += parseFloat($scope.listEmployeeDetail[i].T);
            };

            if ($scope.model.Month !== null && $scope.model.Month !== undefined && $scope.model.Month !== '') {
                $scope.month = $scope.model.Month.split('/')[0];
                $scope.year = $scope.model.Month.split('/')[1];
            } else {
                var currentdate = new Date();
                $scope.month = (currentdate.getMonth() + 1);
                $scope.year = currentdate.getFullYear();
            }
        });
    };

    $scope.exportExcel = function () {
        //if ($scope.model.DepartmentId === '' || $scope.model.DepartmentId === undefined || $scope.model.DepartmentId === null) {
        //    App.toastrError('Vui lòng chọn phòng ban !');
        //    return;
        //}

        if ($scope.listEmployeeDetail.length > 0) {
            //if ($scope.model.UserManager === '' || $scope.model.UserManager === undefined || $scope.model.UserManager === null) {
            //    App.toastrError('Vui lòng chọn trưởng bộ phận !');
            //    return;
            //}
            //if ($scope.model.UserCreated === '' || $scope.model.UserCreated === undefined || $scope.model.UserCreated === null) {
            //    App.toastrError('Vui lòng chọn người lập !');
            //    return;
            //}

            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });

            var obj = {
                UserManager: $scope.model.UserManager,
                UserCreated: $scope.model.UserCreated,
                Month: $scope.month,
                Year: $scope.year,
                ListEmployeeDetail: $scope.listEmployeeDetail
            };

            dataservice.exportExcelAllowance(obj, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");
                download(rs.fileName, '/' + rs.pathFile);
            });
        } else {
            App.toastrError(caption.ALSP_MSG_LIST_EMPLOYEE_EMPTY);
        }
    };

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

    $scope.saveExcel = function () {
        if ($scope.listEmployeeDetail.length > 0) {
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });

            var obj = {
                UserManager: $scope.model.UserManager,
                UserCreated: $scope.model.UserCreated,
                Month: $scope.month,
                Year: $scope.year,
                ListEmployeeDetail: $scope.listEmployeeDetail
            };

            dataservice.saveExcelAllowance(obj, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        } else {
            App.toastrError(caption.ALSP_MSG_LIST_EMPLOYEE_EMPTY);
        }
    };

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', text);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    function loadDate() {
        $("#Month").datepicker({
            inline: false,
            autoclose: true,
            format: "mm/yyyy",
            fontAwesome: true,
            todayHighlight: true,
            viewMode: "months",
            minViewMode: "months"
        });
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});