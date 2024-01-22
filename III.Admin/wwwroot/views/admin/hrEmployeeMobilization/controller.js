var ctxfolderCustomer = "/views/admin/hrEmployeeMobilization";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFileShare = "/views/admin/fileObjectShare";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_CUSTOMER', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "pascalprecht.translate", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ui.tinymce', 'dynamicNumber', 'ngTagsInput']);
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
            $http.post('/Admin/HrEmployeeMobilization/GetRanges?id='+ data).then(callback);
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

            $http.get('/Admin/HrEmployeeMobilization/GetRangesScale?Code='+data).then(callback);
        },
        
        getRangesScaleCoeff: function (data, callback) {
            $http.post('/Admin/HrEmployeeMobilization/GetRangesScaleCoeff', data).then(callback);
        },
        insertDecisionMovement: function (data, callback) {
            
            $http.post('/Admin/HrEmployeeMobilization/InsertDecisionMovement', data).then(callback);
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
    $translateProvider.useUrlLoader('/Admin/HrEmployeeMobilization/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderCustomer + '/index.html',
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

app.controller('indexCustomer', function ($scope,$route, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
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
            Name: "Nam"
        },
        {
            Code: "2",
            Name: "Nữ"
        }
    ];
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
        BranchId: ''
    }
    $scope.modeldes = {
        DecideNum: '',
        DecideDate: '',
        FromTime: '',
        ToTime: '',
        arr3:[]
    }
    $scope.treeDataunit = [];
    $scope.positionData = [];
    $scope.treedataHr = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HrEmployeeMobilization/jtablemain",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {

                d.FullName = $scope.model.FullName;
                d.Phone = $scope.model.Phone;
                d.Permanentresidence = $scope.model.Permanentresidence;
                d.EmployeeType = $scope.model.EmployeeType;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Unit = $scope.model.Unit;
                d.Position = $scope.model.Position;
                d.BranchId = $scope.model.BranchId;
                d.Gender = $scope.model.Gender;
                d.NumberOfYears = $scope.model.NumberOfYears;
                d.YearsOfWork = $scope.model.YearsOfWork;
                d.Wage = $scope.model.Wage;
                d.EducationalLevel = $scope.model.EducationalLevel;
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

           /* $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataContract').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });*/
            /*if ($rootScope.showFunctionHr.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var Id = data.Id;
                        $scope.edit(Id);
                    }
                });
            }*/
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'dataTable-pr0 dataTable-5per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('employee_code').withTitle('{{"Mã nhân viên"| translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fullname').withTitle('{{"Họ và Tên" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BirthDay').withTitle('{{"Ngày sinh" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-15per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('gender').withTitle('{{"Giới tính" | translate}}').renderWith(function (data, type) {
        if (data == 1) {
            return '<i class="fas fa-male "></i>';
        }
        if (data == 2) {
            return '<i class="fas fa-female " style="color: #f1204fcf;"></i>';
        }
    }).withOption('sClass','tcenter dataTable-pr0 dataTable-10per'));
   
    vm.dtColumns.push(DTColumnBuilder.newColumn('unitName').withTitle('{{"Phòng ban" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-25per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('positionName').withTitle('{{"Chức vụ" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0  dataTable-35per'));
   /* vm.dtColumns.push(DTColumnBuilder.newColumn('EndTimeContract').withTitle('{{"HR_HR_LIST_COL_DATE_END_CONTRACT" | translate}}').renderWith(function (data, type, full) {
        var created = new Date(full.EndTime);
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        var diffMs = (created - now);
        var diffDay = Math.floor((diffMs / 86400000));
        if (full.employeetype != 'Đã chấm dứt') {
            if (full.EndTime != null && full.EndTime != "" && full.EndTime != undefined) {
                if (diffDay > 0) {
                    return '<p class="text-green bold" >' + data + '</p>' +
                        '<span class="badge-customer badge-customer-success">Còn ' + diffDay + ' ngày' + '</span>';
                } else {
                    var diMs = (now - created);
                    var dDay = Math.floor((diMs / 86400000));
                    return '<p class="text-green bold" >' + data + '</p>' +
                        '<span class="badge-customer badge-customer-danger">Đã quá hạn ' + dDay + ' ngày' + '</span>';
                }
            } else {
                return '<p class="text-green bold" >' + data + '</p>' +
                    '<span class="badge-customer badge-customer-danger">' + 'Chưa có hợp đồng lao động' + '</span>';
            }
        } else {
            return '<span class="badge-customer badge-customer-danger"> Đã nghỉ việc </span>';
        }
    }).withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('permanentresidence').withTitle('{{"HR_HR_MAN_CURD_COL_HR_MAN_PERMANENTRESIDENCE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('employeetype').withTitle('{{"HR_HR_MAN_LIST_COL_EMPLOYEE_TYPE" | translate}}').renderWith(function (data, type) {
        if (data == 'Nhân viên thử việc') {
            return '<span class="text-warning">' + data + '</span>';
        } else if (data == 'Nhân viên thực tập') {
            return '<span class="text-danger">' + data + '</span>';
        } else if (data == 'Nhân viên chính thức') {
            return '<span class="text-success">' + data + '</span>';
        } else if (data == 'Cộng tác viên') {
            return '<span class="text-info">' + data + '</span>';
        } else if (data == 'Đã nghỉ việc') {
            return '<span class="text-danger">' + data + '</span>';
        } else {
            return data;
        }
    }).withOption('sClass', 'nowrap dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('picture').withTitle('{{"HR_HR_MAN_LIST_COL_HR_MAN_AVATAR" | translate}}').renderWith(function (data, type) {
        return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_user.png' + '"' + "'" + 'height="30" width="30">';
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-w80'));*/
    /*vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"HR_HR_MAN_LIST_COL_HR_MAN_ACTION" | translate}}').notSortable().renderWith(function (data, type, full, meta) {
        var listButton = '<button title="{{&quot;Xuất quyết định&quot; | translate}}" ng-click="importWork(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline green"><i class="fa fa-file-word-o"></i></button>';
        if ($rootScope.showFunctionHr.Update) {
            listButton += '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
        }
        if ($rootScope.showFunctionHr.Delete) {
            listButton += '<button ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
        }
        return listButton;
    }).withOption('sClass', 'nowrap tcenter dataTable-w80'));*/
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
        dataservice.getListRole(function (rs) {
            
            rs = rs.data;
            $scope.listRole = rs.Object;
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
            $scope.lstPayScale.unshift(all);
        })

    };

    $scope.init();
    $scope.ChangPayScale = function (code) {
        dataservice.getRangesScale(code, function (rs) {
            rs = rs.data;
            $scope.lstRanges = rs;
        })
    }

    $scope.ChangPayScaleRanges = function (code, range) {
        var obj = {
            ScaleCode: code,
            Ranges:range
        }
        dataservice.getRangesScaleCoeff(obj, function (rs) {
            rs = rs.data;
            $scope.Coeff = rs;
        })
    }
    var current = 1;
    $scope.tab1 = true;
    $scope.next1 = function () {
        if (current == 1) {
            

            var arrr = [];
            if ($scope.selectedItems != undefined) {
                for (var i = 0; i < $scope.selectedItems.length; i++) {
                    if ($scope.selectedItems[i] != undefined && $scope.selectedItems[i] == true) {
                        arrr.push(i);
                    }

                }
                if (arrr.length > 0) {
                  
                    $('#personal').addClass('active');
                    $scope.tab2 = true;
                    $scope.tab1 = false;
                    $scope.tab3 = false;
                    $scope.previoust = true;
                    current = 2;
                    dataservice.jTableMain2(arrr, function (rs) {
                        rs = rs.data;
                        var arrtab2 = [];
                        for (var j = 0; j < rs.length; j++) {
                            t = rs[j];
                        /*    var unitNameLate = t.unitName;
                            var positionNameLate = t.positionName;
                            $scope.unitNameLate = unitNameLate;
                            $scope.positionNameLate = positionNameLate;
                            t.unitNameLate = $scope.unitNameLate;
                            t.positionNameLate = $scope.positionNameLate;*/
                            arrtab2.push(t);


                        }
                        $scope.arrtab2 = arrtab2;
                        

                    })
                }
                if (arrr.length == 0) {
                    App.toastrError("Chưa chọn nhân viên điều động !");
                }

                
               
            }
            else {
                App.toastrError("Chưa chọn nhân viên điều động !");
            }



        }
        /*if (current == 2) {
            $('#payment').addClass('active');
            $scope.tab3 = true;
            $scope.tab2 = false;
            $scope.tab1 = false;
            $scope.previoust = true;


        }
        if (current < 3 && current >= 0) {
            current++;
        }
        */

    }
    $scope.next2 = function (decice, objj) {
        

        $scope.decisionNum = decice.DecideNum;
        $scope.decisionDate = decice.DecideDate;
        $scope.decisionFromTime = decice.FromTime;
        $scope.decisionToTime = decice.ToTime;
        $scope.arrtab3 = objj;
        validationDetailMove(decice);
        if (!validationDetailMove(decice).Status) {
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

        

    }
    $scope.next3 = function (modeldes, arr3) {
        $scope.modeldes.arr3 = [];
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
        dataservice.insertDecisionMovement($scope.modeldes,function (rs) {
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

            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = "Việc quay lại có thể gây mất dữ liệu,bạn có chắc muốn quay lại";
                    $scope.ok = function () {
                        $('#personal').removeClass('active');
                        current = 1;
                        $scope.tab1 = true;
                        $scope.tab2 = false;
                        $scope.previoust = false;
                        $scope.tab3 = false;
                        $route.reload();
                        $uibModalInstance.close();
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: '25',
            });
            modalInstance.result.then(function (d) {
                reloadData(true);
            }, function () {
            });
            
         

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
    function validationDetailMove(data1) {
        var mess = { Status: false, Title: "" }
     /*   if (data.Ranges == "") {
            $scope.errorRanges = true;
            mess.Status = true;
        } else {
            $scope.errorRanges = false;
        }
        if (data.PayScaleCode == "") {
            $scope.errorPayScaleCode = true;
            mess.Status = true;
        } else {
            $scope.errorPayScaleCode = false;
        }
        if (data.unitNameLate == "") {
            $scope.errorunitNameLate = true;
            mess.Status = true;
        } else {
            $scope.errorunitNameLate = false;
        }
        if (data.positionNameLate == "") {
            $scope.errorpositionNameLate = true;
            mess.Status = true;
        } else {
            $scope.errorpositionNameLate = false;
        }*/
        // thông tin header//

        if (data1.DecideNum == "") {
            $scope.errorDecideNum = true;
            mess.Status = true;
        } else {
            $scope.errorDecideNum = false;
        }
        if (data1.DecideDate == "") {
            $scope.errorDecideDate = true;
            mess.Status = true;
        } else {
            $scope.errorDecideDate = false;
        } if (data1.FromTime == "") {
            $scope.errorFromTime = true;
            mess.Status = true;
        } else {
            $scope.errorFromTime = false;
        }
        if (data1.ToTime == "") {
            $scope.errorToTime = true;
            mess.Status = true;
        } else {
            $scope.errorToTime = false;
        }

        return mess;
    };
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
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
            App.toastrError("Vui lòng tạo quyết định trước");
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
            App.toastrError("Vui lòng tạo quyết định trước");
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

