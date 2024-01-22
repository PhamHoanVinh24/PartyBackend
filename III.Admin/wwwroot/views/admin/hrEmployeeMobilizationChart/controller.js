var ctxfolderCustomer = "/views/admin/hrEmployeeMobilizationChart";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_CUSTOMER', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "pascalprecht.translate", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ui.tinymce', 'dynamicNumber', 'ngTagsInput']);
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

app.directive('customOnChangeCustomer', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCustomer);
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
    }
    var submitFormUpload = function (url, data, callback) {
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
            data: data
        }
        $http(req).then(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/Insert', data).then(callback);
        },
        getListEmpolyee: function (callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetListEmpolyee').then(callback);
        },
        getListReason: function (callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetListReason').then(callback);
        },
        insertEployeeMobilization: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/InsertEployeeMobilization', data).then(callback);
        },
        deleteEployeeMobilization: function (data, data1, callback) {
            $http.post('/Admin/HrEmployeeMobilization/DeleteEployeeMobilization?Id=' + data + "&StyleDecisionCode=" + data1).then(callback);
        },
        getListEployeeMobilization: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetListEployeeMobilization?DecistionId=' + data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/Delete?Id=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetItem?Id=' + data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/Update', data).then(callback);
        },
        getListDepartment: function (callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetListDepartment').then(callback);
        },
        getListRole: function (callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetListRole').then(callback);
        },
        getRanges: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetRanges?id=' + data).then(callback);
        },
        gettreedataunit: function (callback) {
            $http.post('/Admin/HREmployee/Gettreedataunit').then(callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },
        getPosition: function (callback) {
            $http.post('/Admin/HREmployee/GetPosition').then(callback);
        },
        getEmployeeType: function (callback) {
            $http.post('/Admin/HREmployee/GetEmployeeType').then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/HREmployee/GetDepartment').then(callback);
        },
        getEmployeeStyle: function (callback) {
            $http.post('/Admin/HREmployee/GetEmployeeStyle').then(callback);
        },
        jTableMain2: function (data, callback) {

            $http.post('/Admin/HrEmployeeMobilization/JTableMain2/', data).then(callback);
        },
        getPayScaleCat: function (callback) {
            $http.get('/Admin/SalaryScale/GetPayScaleCat').then(callback);
        },
        getRangesScale: function (data, callback) {

            $http.get('/Admin/HrEmployeeMobilization/GetRangesScale?Code=' + data).then(callback);
        },

        getRangesScaleCoeff: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetRangesScaleCoeff', data).then(callback);
        },
        insertDecisionMovement: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/InsertDecisionMovement', data).then(callback);
        },
        searchChart: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/SearchChart', data).then(callback);
        },
        getDecideBy: function (callback) {
            $http.get('/Admin/HrEmployeeMobilization/GetDecideBy/').then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM_CUSTOMER', function ($scope, $rootScope, $cookies, $filter, dataservice, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        //$.extend($.validator.messages, {
        //    min: caption.COM_VALIDATE_VALUE_MIN,
        //});
        //$rootScope.partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
        $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;        //Miêu tả có thể null, và có chứa được khoảng trắng
        $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
        $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số không âm
        $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
        $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
        $rootScope.partternPhone = /^[0|+|+84]+([\s0-9]{9,15})([\s#0-9]{5})?\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0


        $rootScope.checkDataCustomer = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.CusCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.CUS_CURD_VALIDATE_CHARACTERS_SPACE_CUSCODE, "<br/>");
            }
            if (data.Email != '' && data.Email != null && !$rootScope.partternEmail.test(data.Email)) {
                mess.Status = true;
                mess.Title += caption.CUS_TITLE_EMAIL_FALSE + "<br/>";
            }
            return mess;
        }
        $rootScope.checkDataMoreCustomer = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
            var mess = { Status: false, Title: "" }
            var a = data.ext_code;

            if (!partternCode.test(data.ext_code)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.CUS_CURD_VALIDATE_CHARACTERS_SPACE_EXTCODE, "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptionsCustomer = {
            rules: {
                CusCode: {
                    required: true,
                    maxlength: 50
                },
                CusName: {
                    required: true,
                    maxlength: 255
                },
                Address: {
                    required: true,
                    maxlength: 500
                },
                TaxCode: {
                    //required: true,
                    maxlength: 100
                },
                Mobile: {
                    required: true,
                    //regx: /^(0)+([0-9]{9,10})\b$/
                    regx: /^[0|+|+84]+([\s0-9]{9,15})([\s#0-9]{5})?\b$/
                },
                Email: {
                    regx: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
                },
                TaxCode: {
                    required: true,
                }
            },
            messages: {
                CusCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_LBL_CUS_CUSCODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_LBL_CUS_CUSCODE).replace("{1}", "50")
                },
                CusName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_LBL_CUS_CUSNAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_LBL_CUS_CUSNAME).replace("{1}", "50")
                },
                Address: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_LBL_CUS_ADDRESS),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_LBL_CUS_ADDRESS).replace("{1}", "50")
                },
                TaxCode: {
                    //required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_LBL_CUS_TAXCODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_LBL_CUS_TAXCODE).replace("{1}", "50")
                },
                Mobile: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_LBL_CUS_MOBIEPHONE),
                    regx: caption.CUS_VALIDATE_PHONE_NUM,
                },
                Email: {
                    regx: caption.CUS_VALIDATE_EMAIL,
                },
                TaxCode: {
                    required: caption.CUS_VALIDATE_TAX_CODE,
                }
            }
        }
        $rootScope.validationOptionsMoreCustomer = {
            rules: {
                ext_code: {
                    required: true,
                    maxlength: 100

                },
                ext_value: {
                    required: true,
                    maxlength: 500
                },

            },
            messages: {
                ext_code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_MORE_CURD_LBL_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_MORE_CURD_LBL_CODE).replace("{1}", "50")
                },
                ext_value: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_MORE_CURD_LBL_VALUE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_MORE_CURD_LBL_VALUE).replace("{1}", "50")
                },


            }
        }
        $rootScope.validationOptionsContactCustomer = {
            rules: {
                ContactName: {
                    required: true,
                    maxlength: 255
                },
                Email: {
                    required: true
                },
                Mobile: {
                    required: true,
                    maxlength: 100,
                },
                Title: {
                    maxlength: 1000
                },
                InChargeOf: {
                    maxlength: 1000
                },
                Address: {
                    maxlength: 500
                },
                Telephone: {
                    maxlength: 100
                },
                Fax: {
                    maxlength: 100
                },
                Facebook: {
                    maxlength: 100
                },
                GooglePlus: {
                    maxlength: 100
                },
                Twitter: {
                    maxlength: 100
                },
                Skype: {
                    maxlength: 100
                },
                Note: {
                    maxlength: 1000
                },
            },
            messages: {
                ContactName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_CONTACTNAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_CONTACTNAME).replace("{1}", "255")
                },
                Email: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_EMAIL),
                },
                Mobile: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_MOBIEPHONE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_MOBIEPHONE).replace("{1}", "100")
                },
                Title: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_POSITION).replace("{1}", "1000")
                },
                InChargeOf: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_INCHARGEOF).replace("{1}", "1000")
                },
                Address: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_ADDRESS).replace("{1}", "500")
                },
                Telephone: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_TELEPHONE).replace("{1}", "100")
                },
                Fax: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_FAX).replace("{1}", "100")
                },
                Facebook: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_FACEBOOK).replace("{1}", "100")
                },
                GooglePlus: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_GOOGLEPLUS).replace("{1}", "100")
                },
                Twitter: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_TWITTER).replace("{1}", "100")
                },
                Skype: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_SKYPE).replace("{1}", "100")
                },
                Note: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CUS_CURD_TAB_CONTACT_CURD_LBL_NOTE).replace("{1}", "1000")
                },
            }
        }
        $rootScope.validationOptionsAttrCustomer = {
            rules: {
                Code: {
                    required: true,

                },
                Value: {
                    required: true,

                }
            },
            messages: {
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_MORE_CURD_LBL_CODE),
                },
                Value: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_MORE_CURD_LBL_NAME),
                }
            }
        }
        $rootScope.validationOptionsFileCustomer = {
            rules: {
                FileName: {
                    required: true,
                },
            },
            messages: {
                FileName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_FILE_CURD_VALIDATE_FILENAME),
                },
            }
        }
        $rootScope.validationOptionsReminderCustomer = {
            rules: {
                ReminderTime: {
                    required: true,
                },
                Note: {
                    required: true,
                }
            },
            messages: {
                ReminderTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_REMINDER_CURD_LBL_REMINDERTIME),
                },
                Note: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CUS_CURD_TAB_REMINDER_CURD_LBL_REMINDERNOTE),
                }
            }
        }
    });
    $rootScope.zoomMapDefault = 16;
    $rootScope.latCustomerDefault = 21.0277644;
    $rootScope.lngCustomerDefault = 105.83415979999995;
    $rootScope.addressCustomerDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';
    $rootScope.ObjectCustomer = {
        CustomerId: '',
        CustommerCode: ''
    }
    //Lưu ý không tạo các biến chung ở đây(nếu tạo thêm tiền tố Customer)
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/HrEmployeeMobilizationChart/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderCustomer + '/index.html',
            controller: 'indexCustomer'
        })
        .when('/1', {
            templateUrl: ctxfolderCustomer + '/tabmenu.html',
            controller: 'indexCustomer'
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
    $httpProvider.interceptors.push('interceptors');
});

app.controller('indexCustomer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.listGender = [
        , {
            Code: "",
            Name: caption.COM_TXT_ALL
        },
        {
            Code: "1",
            Name: caption.HMC_CHK_FEMALE
        },
        {
            Code: "2",
            Name: caption.HMC_CHK_MALE
        }
    ];
    $scope.lstDeciUser = [];
    $scope.CountEmployee = 0;
    $scope.model = {
        FullName: '',
        Phone: '',
        Permanentresidence: '',
        EmployeeType: '',
        FromDate: '',
        ToDate: '',
        Gender: '',
        NumberOfYears: '',
        YearsOfWork: '',
        Wage: '',
        EducationalLevel: '',
        Position: '',
        Unit: '',
        BranchId: '',
        FromTo: '',
        DateTo: '',
        DecisionNum: '',
        DepartmentCode: '',
        DecisionBy: '',
    }
    $scope.modelsearch = {
        DepartBegin: '',
        DepartLate: '',
        FromTime: '',
        ToTime: '',
    }
    $scope.headerCompiled = false;
    $scope.headerCompiled1 = false;
    $scope.treeDataunit = [];
    $scope.positionData = [];
    $scope.treedataHr = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HrEmployeeMobilizationChart/JtableMain",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FromTime = $scope.modelsearch.FromTime;
                d.ToTime = $scope.modelsearch.ToTime;
                d.DepartBegin = $scope.modelsearch.DepartBegin;
                d.DepartLate = $scope.modelsearch.DepartLate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(15)
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
            $scope.CountEmployee = data.count;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'dataTable-pr0 dataTable-5per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EmployeesCode').withTitle("{{'HMC_LÍT_COL_EMP_CODE' | translate}}").renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fullname').withTitle("{{'HMC_LIST_COL_FULL_NAME' | translate}}").renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DecisionNum').withTitle("{{'HMC_LIST_COL_NUM_DEC' | translate}}").renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-25per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromTime').withTitle("{{'HMC_LIST_COL_FROM_DATE' | translate}}").renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sClass', 'dataTable-pr0  dataTable-35per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ToTime').withTitle("{{'HMC_LIST_COL_TO_DATE' | translate}}").renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('unit').withTitle("{{'HMC_LIST_COL_UNIT' | translate}}").renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NewDepartCode').withTitle("{{'HMC_LIST_COL_UNIT_TO' | translate}}").renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
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
                $scope.selectedItems = selectedItems;
            }
        }
    }
    function toggleOne(selectedItems) {
        $scope.selectedItems = selectedItems;

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
    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
    }
    $scope.Export = function () {

        location.href = "/Admin/HrEmployeeMobilizationChart/ExportExcel?"
            + "&DepartmentCode=" + $scope.model.DepartmentCode
            + "&DecisionBy=" + $scope.model.DecisionBy
            + "&DecisionNum=" + $scope.model.DecisionNum
            + "&Fromto=" + $scope.model.FromTo
            + "&Dateto=" + $scope.model.DateTo
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.init = function () {
        dataservice.getEmployeeStyle(function (result) {
            result = result.data;
            $rootScope.employeeStyleData = result;
            var all = {
                Code: '',
                Name: caption.COM_TXT_ALL
            }
            $rootScope.employeeStyleData.unshift(all);
        });
        dataservice.gettreedataunit(function (result) {
            result = result.data;
            $scope.treeDataunit = result.Object;
            var all = {
                DepartmentCode: "",
                Title: caption.COM_TXT_ALL
            }
            $scope.treeDataunit.unshift(all);
        });
        dataservice.getPosition(function (result) {
            result = result.data;
            $scope.positionData = result;
            var allPosition = {
                Code: "",
                Title: caption.COM_TXT_ALL
            }
            $scope.positionData.unshift(allPosition);
        });

        dataservice.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: "",
                Name: caption.COM_TXT_ALL
            }
            $scope.listBranch.unshift(all)
        })
        dataservice.getPayScaleCat(function (rs) {
            rs = rs.data;
            $scope.lstPayScale = rs;
            var all = {
                Code: ""
            }
            $scope.lstPayScale.unshift(all)
        })
        dataservice.getDecideBy(function (rs) {
            rs = rs.data;
            if (rs.length > 0 && rs[0].hasOwnProperty('Code')) {
                $scope.lstDeciUser = rs;
                var all = {
                    Code: "",
                    Name: ""
                }
            }
        })
        dataservice.searchChart($scope.modelsearch, function (rs) {
            rs = rs.data;

            month = [];
            dd = ['dd'];
            hh = ['hh'];
            for (var i = 0; i < rs.length; i++) {
                dd.push(rs[i].Dieudong);
                hh.push(rs[i].HetHanDieudong);
                month.push(caption.HMC_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            dd,
                            hh,
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'dd': tabler.colors["blue"],
                            'hh': tabler.colors["red"],

                        },
                        names: {
                            // name of each serie
                            'dd': caption.HMC_LBL_MOBILITY,
                            'hh': caption.HMC_LBL_END_MOBI,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: month
                        },
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 100);


        })

    };

    $scope.init();
    window.tabler = {
        colors: {
            'blue': '#467fcf',
            'blue-darkest': '#0e1929',
            'blue-darker': '#1c3353',
            'blue-dark': '#3866a6',
            'blue-light': '#7ea5dd',
            'blue-lighter': '#c8d9f1',
            'blue-lightest': '#edf2fa',
            'azure': '#45aaf2',
            'azure-darkest': '#0e2230',
            'azure-darker': '#1c4461',
            'azure-dark': '#3788c2',
            'azure-light': '#7dc4f6',
            'azure-lighter': '#c7e6fb',
            'azure-lightest': '#ecf7fe',
            'indigo': '#6574cd',
            'indigo-darkest': '#141729',
            'indigo-darker': '#282e52',
            'indigo-dark': '#515da4',
            'indigo-light': '#939edc',
            'indigo-lighter': '#d1d5f0',
            'indigo-lightest': '#f0f1fa',
            'purple': '#a55eea',
            'purple-darkest': '#21132f',
            'purple-darker': '#42265e',
            'purple-dark': '#844bbb',
            'purple-light': '#c08ef0',
            'purple-lighter': '#e4cff9',
            'purple-lightest': '#f6effd',
            'pink': '#f66d9b',
            'pink-darkest': '#31161f',
            'pink-darker': '#622c3e',
            'pink-dark': '#c5577c',
            'pink-light': '#f999b9',
            'pink-lighter': '#fcd3e1',
            'pink-lightest': '#fef0f5',
            'red': '#e74c3c',
            'red-darkest': '#2e0f0c',
            'red-darker': '#5c1e18',
            'red-dark': '#b93d30',
            'red-light': '#ee8277',
            'red-lighter': '#f8c9c5',
            'red-lightest': '#fdedec',
            'orange': '#fd9644',
            'orange-darkest': '#331e0e',
            'orange-darker': '#653c1b',
            'orange-dark': '#ca7836',
            'orange-light': '#feb67c',
            'orange-lighter': '#fee0c7',
            'orange-lightest': '#fff5ec',
            'yellow': '#f1c40f',
            'yellow-darkest': '#302703',
            'yellow-darker': '#604e06',
            'yellow-dark': '#c19d0c',
            'yellow-light': '#f5d657',
            'yellow-lighter': '#fbedb7',
            'yellow-lightest': '#fef9e7',
            'lime': '#7bd235',
            'lime-darkest': '#192a0b',
            'lime-darker': '#315415',
            'lime-dark': '#62a82a',
            'lime-light': '#a3e072',
            'lime-lighter': '#d7f2c2',
            'lime-lightest': '#f2fbeb',
            'green': '#5eba00',
            'green-darkest': '#132500',
            'green-darker': '#264a00',
            'green-dark': '#4b9500',
            'green-light': '#8ecf4d',
            'green-lighter': '#cfeab3',
            'green-lightest': '#eff8e6',
            'teal': '#2bcbba',
            'teal-darkest': '#092925',
            'teal-darker': '#11514a',
            'teal-dark': '#22a295',
            'teal-light': '#6bdbcf',
            'teal-lighter': '#bfefea',
            'teal-lightest': '#eafaf8',
            'cyan': '#17a2b8',
            'cyan-darkest': '#052025',
            'cyan-darker': '#09414a',
            'cyan-dark': '#128293',
            'cyan-light': '#5dbecd',
            'cyan-lighter': '#b9e3ea',
            'cyan-lightest': '#e8f6f8',
            'gray': '#868e96',
            'gray-darkest': '#1b1c1e',
            'gray-darker': '#36393c',
            'gray-dark': '#6b7278',
            'gray-light': '#aab0b6',
            'gray-lighter': '#dbdde0',
            'gray-lightest': '#f3f4f5',
            'gray-dark': '#343a40',
            'gray-dark-darkest': '#0a0c0d',
            'gray-dark-darker': '#15171a',
            'gray-dark-dark': '#2a2e33',
            'gray-dark-light': '#717579',
            'gray-dark-lighter': '#c2c4c6',
            'gray-dark-lightest': '#ebebec'
        }
    };
    $scope.seachchart = function (value) {


        dataservice.searchChart($scope.modelsearch, function (rs) {
            rs = rs.data;

            month = [];
            dd = ['dd'];
            hh = ['hh'];
            for (var i = 0; i < rs.length; i++) {
                dd.push(rs[i].Dieudong);
                hh.push(rs[i].HetHanDieudong);
                month.push(caption.HMC_LBL_MONTH + ' ' + (rs[i].Month));
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            dd,
                            hh,
                        ],
                        type: 'area', // default type of chart
                        colors: {
                            'dd': tabler.colors["blue"],
                            'hh': tabler.colors["red"],

                        },
                        names: {
                            // name of each serie
                            'dd': caption.HMC_LBL_MOBILITY,
                            'hh': caption.HMC_LBL_END_MOBI,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: month
                        },
                    },
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 100);


        })

    }
    $scope.ChangPayScale = function (code) {
        dataservice.getRangesScale(code, function (rs) {
            rs = rs.data;
            $scope.lstRanges = rs;
        })
    }
    $scope.ChangPayScaleRanges = function (code, range) {
        var obj = {
            ScaleCode: code,
            Ranges: range
        }
        dataservice.getRangesScaleCoeff(obj, function (rs) {
            rs = rs.data;
            $scope.Coeff = rs;
        })
    }
    $scope.dieudong = true;

    $scope.Dieudong = function () {
        $scope.dieudong = true;
        $scope.hethan = false;
    }
    $scope.Hethan = function () {
        $scope.dieudong = false;
        $scope.hethan = true;
    }

    ////////////
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions1 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HrEmployeeMobilizationChart/jtablemaindead",
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
                d.FromTime = $scope.modelsearch.FromTime;
                d.ToTime = $scope.modelsearch.ToTime;
                d.DepartBegin = $scope.modelsearch.DepartBegin;
                d.DepartLate = $scope.modelsearch.DepartLate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled1) {
                $scope.headerCompiled1 = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            $rootScope.countyy = data.count;

            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                } else {
                    $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $(".disabled-element").removeClass("disabled-element");
                }
                $scope.$apply();
            });



        });

    vm.dtColumns1 = [];
    vm.dtColumns1.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'dataTable-pr0 dataTable-5per'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('EmployeesCode').withTitle('{{"HMC_LÍT_COL_EMP_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('fullname').withTitle('{{"HMC_LIST_COL_FULL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('DecisionNum').withTitle('{{"HMC_LIST_COL_NUM_DEC" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-25per'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('FromTime').withTitle('{{"HMC_LIST_COL_TO_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sClass', 'dataTable-pr0  dataTable-35per'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('ToTime').withTitle('{{"HMC_LIST_COL_FROM_DATE_1" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('unit').withTitle('{{"HMC_LIST_COL_DEPARTMENT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-10per'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('NewDepartCode').withTitle('{{"HMC_LIST_COL_NEW_DEPARTMENT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-10per'));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('ReasonMovement').withTitle('{{"HMC_LIST_COL_REASON" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.reloadData1 = reloadData1;
    vm.dtInstance1 = {};
    function reloadData1(resetPaging) {
        vm.dtInstance1.reloadData(callback, resetPaging);
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
        reloadData1(true);
        reloadData(true);
    }
    $scope.reload1 = function () {
        reloadData(true);
        reloadData1(true);
    };
    $rootScope.reload1 = function () {
        reloadData(true);
        reloadData1(true);
    };

    var current = 1;
    $scope.tab1 = true;
    $scope.next1 = function () {
        if (current == 1) {
            $('#personal').addClass('active');
            $scope.tab2 = true;
            $scope.tab1 = false;
            $scope.tab3 = false;
            $scope.previoust = true;

            var arrr = [];
            if ($scope.selectedItems != undefined) {
                for (var i = 0; i < $scope.selectedItems.length; i++) {
                    if ($scope.selectedItems[i] != undefined && $scope.selectedItems[i] == true) {
                        arrr.push(i);
                    }

                }
                dataservice.jTableMain2(arrr, function (rs) {
                    rs = rs.data;
                    var arrtab2 = [];
                    for (var j = 0; j < rs.length; j++) {
                        t = rs[j];
                        arrtab2.push(t);

                    }
                    $scope.arrtab2 = arrtab2;
                })
            }



        }
        if (current == 2) {
            $('#payment').addClass('active');
            $scope.tab3 = true;
            $scope.tab2 = false;
            $scope.tab1 = false;
            $scope.previoust = true;


        }
        if (current < 3 && current >= 0) {
            current++;
        }
        if (current >= 3) {
            current == 3
        }

    }
    $scope.next2 = function (decice, objj) {
        $scope.decisionNum = decice.DecisionNum;
        $scope.decisionDate = decice.DecisionDate;
        $scope.decisionFromTime = decice.FromTime;
        $scope.decisionToTime = decice.ToTime;
        $scope.arrtab3 = objj;
        if (current == 2) {
            $('#payment').addClass('active');
            $scope.tab3 = true;
            $scope.tab2 = false;
            $scope.tab1 = false;
            $scope.previoust = true;
        }
        if (current < 3 && current >= 0) {
            current++;
        }
        if (current >= 3) {
            current == 3
        }

    }
    $scope.next3 = function (modeldes, arr3) {
        $scope.modeldes.arr3 = [];

        /*   $scope.modeldes.FromTime = $filter('date')($scope.modeldes.FromTime, 'dd/MM/yyyy');
           $scope.modeldes.ToTime = $filter('date')($scope.modeldes.ToTime, 'dd/MM/yyyy');
           $scope.modeldes.DecideDate = $filter('date')($scope.modeldes.DecideDate, 'dd/MM/yyyy');*/
        for (var i = 0; i < arr3.length; i++) {
            var objjj = {
                Id: arr3[i].Id,
                Reason: arr3[i].Reason,
                PayScaleCode: arr3[i].PayScaleCode,
                Ranges: arr3[i].Ranges,
                Role: arr3[i].positionNameLate,
                DepartCode: arr3[i].unitNameLate
            }
            $scope.modeldes.arr3.push(objjj);
        }

        dataservice.insertDecisionMovement($scope.modeldes, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        })
    }
    $scope.previous = function () {
        if (current == 2) {
            $('#personal').removeClass('active');
            current = 1;
            $scope.tab1 = true;
            $scope.tab2 = false;
            $scope.previoust = false;
            $scope.tab3 = false;


        }
        if (current == 3) {
            $('#payment').removeClass('active');
            current = 2;
            $scope.tab2 = true;
            $scope.tab1 = false;
            $scope.previoust = true;
            $scope.tab3 = false;
        }

    }

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCustomer + '/add.html',
            controller: 'addCustomer',
            backdrop: 'static',
            size: '70',
            windowClass: "message-center",
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
        $rootScope.ObjectCustomer.CustomerId = id;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCustomer + '/edit.html',
            controller: 'editCustomer',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                        }
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.close();
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    };
    $scope.addCardJob = function () {
        var userModel = {};
        var editItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    editItems.push(id);
                }
            }
        }
        if (editItems.length > 0) {
            if (editItems.length == 1) {
                var listdata = $('#tblDataIndex').DataTable().data();
                for (var i = 0; i < listdata.length; i++) {
                    if (listdata[i].CusID == editItems[0]) {
                        userModel = listdata[i];
                        break;
                    }
                }
                var obj = {
                    Code: userModel.Code,
                    Name: userModel.Name,
                    TabBoard: 6
                }
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderCardJob + "/add-card.html",
                    controller: 'add-cardCardJob',
                    backdrop: 'static',
                    size: '80',
                    resolve: {
                        para: function () {
                            return obj;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                }, function () { });
            } else {
                App.toastrError(caption.CUS_ERROR_CHOOSE_CUS)
            }
        } else {
            App.toastrError(caption.CUS_ERROR_NOT_CUS)
        }
    };
    $rootScope.reloadCustomer = function (resetPage) {
        reloadData(resetPage);
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

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

    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };

        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('Address'), options);
    }
    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $("#appfrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });/*.on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });*/
        $("#appto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });/*.on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });*/
        $("#datedecision").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });/*.on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });*/
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });

    }
    setTimeout(function () {
        loadDate();
        //showHideSearch();
    }, 50);

});
app.controller('addCustomer', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.iconLevels = [];
    $scope.listEmployee = [];
    $scope.listReason = [];
    $scope.listEmployeeTermination = [];
    $scope.listDepartment = [];
    $scope.listRole = [];
    $scope.listStyleDecision = [
        {
            Code: 2,
            Name: "Điều động nhân sự"
        },
        {
            Code: 3,
            Name: "Luân chuyển phòng ban"
        },
    ]
    $scope.model = {
        Id: '',
        DecisionCode: '',
        DecisionWakingDate: '',
        StyleDecisionCode: '',
    };
    $scope.modelEmployee = {
        EmployeeId: '',
        DepartmentNameOld: '',
        DepartmentIdOld: '',
        RoleNameOld: '',
        RoleIdOld: '',
        DepartmentIdNew: '',
        RoleIdNew: '',
        WageLevel: '',
        Wage: '',
        Reason: '',
        FormDate: '',
        ToDate: '',
    }
    function loadDate() {
        var now = new Date();

        $("#decisionMakingDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            startDate: now,
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var minDate = new Date();
            $('.decisionMakingDate').datepicker('setStartDate', minDate);
        });
        $("#formDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

            var maxDate = new Date(selected.date.valueOf());
            $('#toDate').datepicker('setStartDate', maxDate);
        });
        $("#toDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,

        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#formDate').datepicker('setEndDate', maxDate);
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.initLoad = function () {
        dataservice.getListRole(function (rs) {
            rs = rs.data;
            $scope.listRole = rs.Object;
        });
        dataservice.getListEmpolyee(function (rs) {
            rs = rs.data;
            $scope.listEmployee = rs.Object;
        });
        dataservice.getListReason(function (rs) {
            rs = rs.data;
            $scope.listReason = rs.Object;
        });
        dataservice.getListDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs.Object;
        });

    };
    $scope.initLoad();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.DecisionWakingDate == "") {
            $scope.errorDecisionWakingDate = true;
            mess.Status = true;
        } else {
            $scope.errorDecisionWakingDate = false;
        }
        if (data.StyleDecisionCode == "") {
            $scope.errorStyleDecisionCode = true;
            mess.Status = true;
        } else {
            $scope.errorStyleDecisionCode = false;
        }

        return mess;
    };
    function validationSelectEmployee(data) {
        var mess = { Status: false, Title: "" };
        if (data.EmployeeId == "") {
            $scope.errorEmployeeId = true;
            mess.Status = true;
        } else {
            $scope.errorEmployeeId = false;
        }
        if (data.DepartmentIdNew == "") {
            $scope.errorDepartmentIdNew = true;
            mess.Status = true;
        } else {
            $scope.errorDepartmentIdNew = false;
        }
        if (data.RoleIdNew == "") {
            $scope.errorRoleIdNew = true;
            mess.Status = true;
        } else {
            $scope.errorRoleIdNew = false;
        }
        if (data.WageLevel == "") {
            $scope.errorWageLevel = true;
            mess.Status = true;
        } else {
            $scope.errorWageLevel = false;
        }
        if (data.Reason == "") {
            $scope.errorReason = true;
            mess.Status = true;
        } else {
            $scope.errorReason = false;
        }
        if ($scope.model.SelectType == 2) {
            if (data.FormDate == "") {
                $scope.errorFormDate = true;
                mess.Status = true;
            } else {
                $scope.errorFormDate = false;
            }
            if (data.ToDate == "") {
                $scope.errorToDate = true;
                mess.Status = true;
            } else {
                $scope.errorToDate = false;
            }
        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.modelEmployee.EmployeeId != "") {
            for (var i = 0; i < $scope.listEmployee.length; i++) {
                if ($scope.modelEmployee.EmployeeId == $scope.listEmployee[i].Id) {
                    $scope.modelEmployee.DepartmentNameOld = $scope.listEmployee[i].DepartmentName;
                    $scope.modelEmployee.RoleNameOld = $scope.listEmployee[i].RoleName;
                    $scope.modelEmployee.DepartmentIdOld = $scope.listEmployee[i].DepartmentId;
                    $scope.modelEmployee.RoleIdOld = $scope.listEmployee[i].RoleId;
                    break;
                }
            }
        }
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "RoleIdNew" && $scope.modelEmployee.RoleIdNew != "" && $scope.modelEmployee.RoleIdNew != null) {
            $scope.errorRoleIdNew = false;
            dataservice.getRanges($scope.modelEmployee.RoleIdNew, function (rs) {
                rs = rs.data;
                $scope.modelEmployee.WageLevel = rs;

            });
        }
    }
    $scope.addDecision = function () {
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            if ($scope.model.Id == "") {
                dataservice.insert({
                    DecisionCode: $scope.model.DecisionCode,
                    DecisionWakingDate: $scope.model.DecisionWakingDate,
                    StyleDecisionCode: $scope.model.StyleDecisionCode
                }, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.model.Id = rs.Object;
                    }
                });
            }
            else {
                dataservice.update({
                    Id: $scope.model.Id,
                    DecisionCode: $scope.model.DecisionCode,
                    DecisionWakingDate: $scope.model.DecisionWakingDate,
                    StyleDecisionCode: $scope.model.StyleDecisionCode
                }, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                });
            }

        }
    }
    $scope.addEmployee = function () {
        if ($scope.model.Id == "") {
            App.toastrError(caption.HMC_MSG_PLS_CREATE_DEC_FIRST);
            return;
        }
        else {
            validationSelectEmployee($scope.modelEmployee);
            if (validationSelectEmployee($scope.modelEmployee).Status == false) {
                if ($scope.model.Id != "") {
                    dataservice.insertEployeeMobilization({
                        DecisionId: $scope.model.Id,
                        StyleDecisionCode: $scope.model.StyleDecisionCode,
                        EmployeeId: $scope.modelEmployee.EmployeeId,
                        DepartmentIdOld: $scope.modelEmployee.DepartmentIdOld,
                        RoleIdOld: $scope.modelEmployee.RoleIdOld,
                        DepartmentIdNew: $scope.modelEmployee.DepartmentIdNew,
                        RoleIdNew: $scope.modelEmployee.RoleIdNew,
                        Wage: $scope.modelEmployee.Wage,
                        WageLevel: $scope.modelEmployee.WageLevel,
                        Reason: $scope.modelEmployee.Reason,
                        FormDate: $scope.modelEmployee.FormDate,
                        ToDate: $scope.modelEmployee.ToDate,
                    }, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            dataservice.getListEployeeMobilization($scope.model.Id, function (rs1) {
                                rs1 = rs1.data;
                                $scope.listEmployeeTermination = rs1.Object;
                            })
                        }
                    })
                }
                else {
                    dataservice.update({
                        Id: $scope.model.Id,
                        DecisionCode: $scope.model.DecisionCode,
                        DecisionWakingDate: $scope.model.DecisionWakingDate
                    }, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                        }
                    });
                }

            }
        };

    }
    $scope.deleteEmployee = function (Id) {
        dataservice.deleteEployeeMobilization(Id, $scope.model.StyleDecisionCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataservice.getListEployeeMobilization($scope.model.Id, function (rs1) {
                    rs1 = rs1.data;
                    $scope.listEmployeeTermination = rs1.Object;
                })
            }
        })
    }
    setTimeout(function () {
        loadDate();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('editCustomer', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para, $filter) {
    $scope.iconLevels = [];
    $scope.listEmployee = [];
    $scope.listReason = [];
    $scope.listEmployeeTermination = [];
    $scope.listDepartment = [];
    $scope.listRole = [];
    $scope.listStyleDecision = [
        {
            Code: 2,
            Name: "Điều động nhân sự"
        },
        {
            Code: 3,
            Name: "Luân chuyển phòng ban"
        },
    ]
    $scope.model = {
        Id: '',
        DecisionCode: '',
        DecisionWakingDate: '',
        StyleDecisionCode: '',
    };
    $scope.modelEmployee = {
        EmployeeId: '',
        DepartmentNameOld: '',
        DepartmentIdOld: '',
        RoleNameOld: '',
        RoleIdOld: '',
        DepartmentIdNew: '',
        RoleIdNew: '',
        WageLevel: '',
        Wage: '',
        Reason: '',
        FormDate: '',
        ToDate: '',
    }
    function loadDate() {
        $("#decisionMakingDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var minDate = new Date();
            $('.decisionMakingDate').datepicker('setStartDate', minDate);
        });
        $("#formDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

            var maxDate = new Date(selected.date.valueOf());
            $('#toDate').datepicker('setStartDate', maxDate);
        });
        $("#toDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,

        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#formDate').datepicker('setEndDate', maxDate);
        });
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.initLoad = function () {
        dataservice.getListRole(function (rs) {
            rs = rs.data;
            $scope.listRole = rs.Object;
        });
        dataservice.getListEmpolyee(function (rs) {
            rs = rs.data;
            $scope.listEmployee = rs.Object;
        });
        dataservice.getListReason(function (rs) {
            rs = rs.data;
            $scope.listReason = rs.Object;
        });
        dataservice.getListDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs.Object;
        });
        dataservice.getItem(para, function (rs) {

            rs = rs.data;
            $scope.model.DecisionCode = rs.Object.DecisionCode;
            $scope.model.DecisionWakingDate = $filter('date')(rs.Object.DecisionMakingDate, 'dd/MM/yyyy')
            if ($scope.model.DecisionCode == "") {
                $scope.checkUpdate = false;
            }
            $scope.model.StyleDecisionCode = rs.Object.Style
        });
        dataservice.getListEployeeMobilization(para, function (rs1) {
            rs1 = rs1.data;
            $scope.listEmployeeTermination = rs1.Object;
        })

    };
    $scope.initLoad();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.DecisionWakingDate == "") {
            $scope.errorDecisionWakingDate = true;
            mess.Status = true;
        } else {
            $scope.errorDecisionWakingDate = false;
        }
        if (data.StyleDecisionCode == "") {
            $scope.errorStyleDecisionCode = true;
            mess.Status = true;
        } else {
            $scope.errorStyleDecisionCode = false;
        }
        return mess;
    };
    function validationSelectEmployee(data) {

        var mess = { Status: false, Title: "" };
        if (data.EmployeeId == "") {
            $scope.errorEmployeeId = true;
            mess.Status = true;
        } else {
            $scope.errorEmployeeId = false;
        }
        if (data.DepartmentIdNew == "") {
            $scope.errorDepartmentIdNew = true;
            mess.Status = true;
        } else {
            $scope.errorDepartmentIdNew = false;
        }
        if (data.RoleIdNew == "") {
            $scope.errorRoleIdNew = true;
            mess.Status = true;
        } else {
            $scope.errorRoleIdNew = false;
        }
        if (data.WageLevel == "") {
            $scope.errorWageLevele = true;
            mess.Status = true;
        } else {
            $scope.errorWageLevele = false;
        }
        if (data.Reason == "") {
            $scope.errorReason = true;
            mess.Status = true;
        } else {
            $scope.errorReason = false;
        }
        if ($scope.model.SelectType == 2) {
            if (data.FormDate == "") {
                $scope.errorFormDate = true;
                mess.Status = true;
            } else {
                $scope.errorFormDate = false;
            }
            if (data.ToDate == "") {
                $scope.errorToDate = true;
                mess.Status = true;
            } else {
                $scope.errorToDate = false;
            }
        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "UserId" && $scope.modelEmployee.EmployeeId != "") {
            for (var i = 0; i < $scope.listEmployee.length; i++) {
                if ($scope.modelEmployee.EmployeeId == $scope.listEmployee[i].Id) {
                    $scope.modelEmployee.DepartmentNameOld = $scope.listEmployee[i].DepartmentName;
                    $scope.modelEmployee.RoleNameOld = $scope.listEmployee[i].RoleName;
                    $scope.modelEmployee.DepartmentIdOld = $scope.listEmployee[i].DepartmentId;
                    $scope.modelEmployee.RoleIdOld = $scope.listEmployee[i].RoleId;
                    break;
                }
            }
        }
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "RoleIdNew" && $scope.modelEmployee.RoleIdNew != "" && $scope.modelEmployee.RoleIdNew != null) {
            $scope.errorRoleIdNew = false;
            dataservice.getRanges($scope.modelEmployee.RoleIdNew, function (rs) {
                rs = rs.data;
                $scope.modelEmployee.WageLevel = rs;

            });
        }
    }
    $scope.addDecision = function () {

        if (validationSelect($scope.model).Status == false) {
            if (para == "") {
                dataservice.insert({
                    DecisionCode: $scope.model.DecisionCode,
                    DecisionWakingDate: $scope.model.DecisionWakingDate,
                    StyleDecisionCode: $scope.model.StyleDecisionCode
                }, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        para = rs.Object;
                    }
                });
            }
            else {
                dataservice.update({
                    Id: para,
                    DecisionCode: $scope.model.DecisionCode,
                    DecisionWakingDate: $scope.model.DecisionWakingDate,
                    StyleDecisionCode: $scope.model.StyleDecisionCode
                }, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                    }
                });
            }

        }
    }
    $scope.addEmployee = function () {
        if (para == "") {
            App.toastrError(caption.HMC_MSG_PLS_CREATE_DEC_FIRST);
            return;
        }
        else {
            validationSelectEmployee($scope.modelEmployee);
            if (validationSelectEmployee($scope.modelEmployee).Status == false) {
                if (para != "") {
                    dataservice.insertEployeeMobilization({
                        DecisionId: para,
                        StyleDecisionCode: $scope.model.StyleDecisionCode,
                        EmployeeId: $scope.modelEmployee.EmployeeId,
                        DepartmentIdOld: $scope.modelEmployee.DepartmentIdOld,
                        RoleIdOld: $scope.modelEmployee.RoleIdOld,
                        DepartmentIdNew: $scope.modelEmployee.DepartmentIdNew,
                        RoleIdNew: $scope.modelEmployee.RoleIdNew,
                        Wage: $scope.modelEmployee.Wage,
                        WageLevel: $scope.modelEmployee.WageLevel,
                        Reason: $scope.modelEmployee.Reason,
                        FormDate: $scope.modelEmployee.FormDate,
                        ToDate: $scope.modelEmployee.ToDate,
                    }, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            dataservice.getListEployeeMobilization(para, function (rs1) {
                                rs1 = rs1.data;
                                $scope.listEmployeeTermination = rs1.Object;
                            })
                        }
                    })
                }
                else {
                    dataservice.update({
                        Id: para,
                        DecisionCode: $scope.model.DecisionCode,
                        DecisionWakingDate: $scope.model.DecisionWakingDate
                    }, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                        }
                    });
                }

            }
        };

    }
    $scope.deleteEmployee = function (Id) {
        dataservice.deleteEployeeMobilization(Id, $scope.model.StyleDecisionCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                dataservice.getListEployeeMobilization(para, function (rs1) {
                    rs1 = rs1.data;
                    $scope.listEmployeeTermination = rs1.Object;
                })
            }
        })
    }
    setTimeout(function () {
        loadDate();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});

