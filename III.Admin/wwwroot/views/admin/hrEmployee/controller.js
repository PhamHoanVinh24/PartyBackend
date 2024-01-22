var ctxfolderHrEmployee = "/views/admin/hREmployee";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderMessage = "/views/message-box";
var ctxfolderLog = "/views/log-box";
var app = angular.module('App_ESEIM_HR_EMPLOYEE', ['App_ESEIM_DASHBOARD', 'App_ESEIM_REPOSITORY', 'App_ESEIM_SUPPLIER', 'App_ESEIM_FILE_PLUGIN', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'ngJsTree', 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'dynamicNumber', "ngCookies", 'ngTagsInput', "pascalprecht.translate", 'monospaced.qrcode', 'ng.jsoneditor']).
    directive("filesInput", function () {
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

app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 400) {
                App.toastrError(rejection.data);
            }
            return $q.reject(rejection);
        }
    };
}]);
app.directive('autoLoad', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var src = scope.$eval(attrs.autoLoad);
            //element.on('change', onChangeHandler);
            //element.on('$destroy', function () {
            //    element.off();
            //});
            scope.$watch($parse(attrs.autoLoad), function (newval) {
                var src = newval;
                if (element.length && element.length > 0 && src != '' && src != null) {
                    element[0].src = src;
                    element.css('background', 'white');
                }
            });
        }
    };
});

app.factory('dataserviceHrEmployee', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUploadHD = function (url, data, callback) {
        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        var formData = new FormData();
        angular.forEach(data, function (value, key) {
            if (value == undefined || value == null) {
                data[key] = '';
            }
        });
        formData.append("Id", data.Id);
        formData.append("Insuarance", data.Insuarance);
        formData.append("Dates_of_pay", data.Dates_of_pay);
        formData.append("Place_Work", data.Place_Work);
        formData.append("Exp_time_work", data.Exp_time_work);
        formData.append("Salary_Ratio", data.Salary_Ratio);
        formData.append("Payment", data.Payment);
        formData.append("Contract_Type", data.Contract_Type);
        formData.append("Signer", data.Signer);
        formData.append("Salary", data.Salary);
        formData.append("Start_Time", data.Start_Time);
        formData.append("End_Time", data.End_Time);
        formData.append("DateOf_LaborBook", data.DateOf_LaborBook);
        formData.append("Work_Content", data.Work_Content);
        formData.append("Allowance", data.Allowance);
        formData.append("Contract_Code", data.Contract_Code);
        formData.append("LaborBook_Code", data.LaborBook_Code);
        formData.append("Other_Agree", data.Other_Agree);
        formData.append("Info_Insuarance", data.Info_Insuarance);
        formData.append("Bonus", data.Bonus);
        formData.append("Tools_Work", data.Tools_Work);
        formData.append("Type_Money", data.Type_Money);
        formData.append("Type_Money", data.Type_Money);
        formData.append("File", data.File);
        formData.append("Info_Contract", data.Info_Contract);
        formData.append("PayScale", data.PayScale);

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }
        $http(req).then(callback);
    };
    var submitFormUploadFile = function (url, data, callback) {
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
        //CommonSetting
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        getJsonData: function (data, callback) {
            $http.get('/Admin/HREmployee/GetJsonData?id=' + data).then(callback);
        },

        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/HREmployee/Insert/', data).then(callback);
            //submitFormUpload1('/Admin/HREmployee/Insert', data, callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/HREmployee/Update', data).then(callback);
            //submitFormUpload('/Admin/HREmployee/Update', data, callback);
        },
        getBranch: function (callback) {
            $http.post('/Admin/Project/GetBranch').then(callback);
        },

        uploadFile: function (data, callback) {
            submitFormUploadFile('/Admin/HREmployee/UploadFile/', data, callback);
        },
        uploadImage: function (data, callback) {
            submitFormUploadFile('/Admin/HREmployee/UploadImage/', data, callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },

        getPosition: function (callback) {
            $http.post('/Admin/HREmployee/GetPosition').then(callback);
        },
        gettreedataunit: function (callback) {
            $http.post('/Admin/HREmployee/Gettreedataunit').then(callback);
        },
        getEmployeeType: function (callback) {
            $http.post('/Admin/HREmployee/GetEmployeeType').then(callback);
        },
        getEmployeeGroup: function (callback) {
            $http.post('/Admin/HREmployee/GetEmployeeGroup').then(callback);
        },
        getEmployeeStyle: function (callback) {
            $http.post('/Admin/HREmployee/GetEmployeeStyle').then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/HREmployee/GetDepartment').then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/HREmployee/GetItem/' + data).then(callback);
        },

        deleteItems: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/HREmployee/Delete/' + data).then(callback);
        },
        getItemT: function (data, callback) {
            $http.get('/Admin/HREmployee/GetItemT/' + data).then(callback);
        },

        setEmployeeId: function (data, callback) {
            $http.post('/Admin/HREmployee/SetEmployeeId/' + data).then(callback);
        },

        insertAddress: function (data, callback) {
            $http.post('/Admin/HREmployee/InsertAddress', data).then(callback);
        },
        updateAddress: function (data, callback) {
            $http.post('/Admin/HREmployee/UpdateAddress', data).then(callback);
        },
        deleteAddress: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteAddress/' + data).then(callback);
        },
        getItemAddress: function (data, callback) {
            $http.get('/Admin/HREmployee/GetitemAddress/' + data).then(callback);
        },

        insertLH: function (data, callback) {
            $http.post('/Admin/HREmployee/InsertLH', data).then(callback);
        },
        updateLH: function (data, callback) {
            $http.post('/Admin/HREmployee/UpdateLH', data).then(callback);
        },
        deleteItemsLH: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteItemsLH', data).then(callback);
        },
        deleteLH: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteLH/' + data).then(callback);
        },
        getItemLH: function (data, callback) {
            $http.get('/Admin/HREmployee/GetitemLH/' + data).then(callback);
        },

        insertQTLV: function (data, callback) {
            $http.post('/Admin/HREmployee/InsertQTLV', data).then(callback);
        },
        updateQTLV: function (data, callback) {
            $http.post('/Admin/HREmployee/UpdateQTLV', data).then(callback);
        },
        deleteItemsQTLV: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteItemsQTLV', data).then(callback);
        },
        deleteQTLV: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteQTLV/' + data).then(callback);
        },
        getItemQTLV: function (data, callback) {
            $http.get('/Admin/HREmployee/GetitemQTLV/' + data).then(callback);
        },
        insertQTCV: function (data, callback) {
            $http.post('/Admin/HREmployee/InsertQTCV', data).then(callback);
        },
        updateQTCV: function (data, callback) {
            $http.post('/Admin/HREmployee/UpdateQTCV', data).then(callback);
        },
        deleteItemsQTCV: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteItemsQTCV', data).then(callback);
        },
        deleteQTCV: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteQTCV/' + data).then(callback);
        },
        getItemQTCV: function (data, callback) {
            $http.get('/Admin/HREmployee/GetitemQTCV/' + data).then(callback);
        },



        insertBCCC: function (data, callback) {
            $http.post('/Admin/HREmployee/InsertBCCC', data).then(callback);
        },
        updateBCCC: function (data, callback) {
            $http.post('/Admin/HREmployee/UpdateBCCC', data).then(callback);
        },
        deleteItemsBCCC: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteItemsBCCC', data).then(callback);
        },
        deleteBCCC: function (data, callback) {
            $http.post('/Admin/HREmployee/deleteBCCC/' + data).then(callback);
        },
        getItemBCCC: function (data, callback) {
            $http.get('/Admin/HREmployee/getitemBCCC/' + data).then(callback);
        },



        insert_HD: function (data, callback) {
            submitFormUploadHD('/Admin/HREmployee/InsertHD', data, callback);
        },
        upload_HD: function (data, callback) {
            submitFormUploadHD('/Admin/HREmployee/UpdateHD', data, callback);
        },
        getItemHD: function (data, callback) {
            $http.get('/Admin/HREmployee/GetItemHD/' + data).then(callback);
        },
        getCurrencyHD: function (callback) {
            $http.post('/Admin/HREmployee/GetCurrencyHD').then(callback);
        },
        deleteItems_HD: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteItemsHD', data).then(callback);
        },
        delete_HD: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteHD', data).then(callback);
        },
        getPathFile: function (data, callback) {
            $http.get('/Admin/OrderRequestRaw/GetPathFile?path=' + data).then(callback);
        },
        viewFileHD: function (data, data1, callback) {
            $http.post('/Admin/HrEmployee/ViewFileHD?mode=' + data + '&url=' + data1).then(callback);
        },


        insertHrEmployeeFile: function (data, callback) {
            submitFormUpload('/Admin/HrEmployee/InsertHrEmployeeFile/', data, callback);
        },
        getSuggestionsHrEmployeeFile: function (data, callback) {
            $http.get('/Admin/HREmployee/GetSuggestionsHrEmployeeFile?employeeCode=' + data).then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        getHrEmployeeFile: function (data, callback) {
            $http.post('/Admin/HREmployee/GetHrEmployeeFile?id=' + data).then(callback);
        },

        updateHrEmployeeFile: function (data, callback) {
            submitFormUpload('/Admin/HREmployee/UpdateHrEmployeeFile/', data, callback);
        },
        deleteHrEmployeeFile: function (data, callback) {
            $http.post('/Admin/HREmployee/DeleteHrEmployeeFile/' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },

        getShift: function (callback) {
            $http.post('/Admin/User/GetShift').then(callback);
        },
        //Additional new design
        getStatusEmployee: function (callback) {
            $http.post('/Admin/HREmployee/GetStatusEmployee').then(callback);
        },
        getListPayCareer: function (callback) {
            $http.post('/Admin/HREmployee/GetListPayCareer').then(callback);
        },
        getListPayTitle: function (callback) {
            $http.post('/Admin/HREmployee/GetListPayTitle').then(callback);
        },
        getListPayCertificate: function (callback) {
            $http.post('/Admin/HREmployee/GetListPayCertificate').then(callback);
        },
        getListPayMajor: function (callback) {
            $http.post('/Admin/HREmployee/GetListPayMajor').then(callback);
        },
        //Log status
        getLogStatusEmployee: function (data, callback) {
            $http.get('/Admin/HREmployee/GetLogStatusEmployee?id=' + data).then(callback);
        },

        //Contract new design
        getPayScaleCat: function (callback) {
            $http.post('/Admin/HREmployee/GetPayScaleCat').then(callback);
        },
        getRangeOfPayScaleCat: function (data, callback) {
            $http.post('/Admin/HREmployee/GetRangeOfPayScaleCat?payCode=' + data).then(callback);
        },

        //
        statiscalEmployee: function (callback) {
            $http.post('/Admin/MapOnline/StatiscalEmployee').then(callback);
        },
        getCountEmployee: function (callback) {
            $http.get('/Admin/HREmployee/GetCountEmployee').then(callback);
        },

        //ExportExcel
        exportExcel: function (data, callback) {
            $http.post('/Admin/HREmployee/ExportExcel', data).then(callback);
        },

        //Update Notwork
        updateNotWork: function (data, callback) {
            $http.post('/Admin/HREmployee/UpdateNotWork', data).then(callback);
        },
    }
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

app.controller('Ctrl_ESEIM_HR_EMPLOYEE', function ($scope, $rootScope, $filter, dataserviceHrEmployee, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,

        });

        $rootScope.validationOptions = {
            rules: {
                fullname: {
                    required: true,
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                birthofplace: {
                    maxlength: 200,
                    regx: /^[^\s].*/
                },

                birthday: {
                    required: true,
                },
                nation: {
                    required: true,
                    maxlength: 50
                },
                phone: {
                    required: true,
                    maxlength: 50,
                    regx: /^(0)([0-9]{9,10})\b$/
                },
                permanentresidence: {
                    required: true,
                    maxlength: 200,
                    regx: /^[^\s].*/
                },
                health: {
                    required: true,
                    maxlength: 50
                },
                identitycard: {
                    required: true,
                    maxlength: 12,
                    regx: /^[^\s].*/
                },
                identitycardplace: {
                    maxlength: 100,
                    regx: /^[^\s].*/
                },
                taxcode: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },

                bank: {
                    maxlength: 100,
                    regx: /^[^\s].*/
                },

                accountnumber: {
                    required: true,
                    maxlength: 50
                },
                Permanent_Address: {
                    required: true,
                    maxlength: 250
                },
                Now_Address: {
                    required: true,
                    maxlength: 250
                },
                years_of_exp: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                    max: 60
                }
            },
            messages: {
                Now_Address: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_ADDRESS,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_ADDRESS
                },

                fullname: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_FULL_NAME,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_NAME,
                    regx: "Họ và tên không bắt đầu bằng khoảng trắng"
                },
                nation: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_NATIONANITY,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_NATIONANITY
                },
                phone: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_PHONE,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_PHONE,
                    regx: "Số điện thoại sai định dạng"
                },
                birthday: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_DATE_OF_BIRTH,
                    maxlength: caption.HR_HR_MAN_CURD_ERR_HR_MAN_BIRTHDAY
                },
                permanentresidence: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RESIDENT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_RESIDENT,
                    regx: "Hộ khẩu thường trú không bắt đầu bằng khoảng trắng"
                },
                health: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_HEALTH,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_HEALTH
                },
                identitycard: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_PASSPORT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_PASSPORT,
                    regx: "CMT/Hộ chiếu không bắt đầu bằng khoảng trắng"
                },
                identitycardplace: {
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_ISSUED,
                    regx: "Nơi cấp không bắt đầu bằng khoảng trắng"
                },
                taxcode: {
                    maxlength: caption.HR_HR_MAN_CURD_ERR_HR_MAN_DAY_RANGE,
                    regx: "Mã số thuế không bắt đầu bằng khoảng trắng"
                },
                accountnumber: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_NUMBER_ACCOUNT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_NUMBER_ACCOUNT
                },
                years_of_exp: {
                    required: "Yêu cầu nhập số năm kinh nghiệm",
                    regx: "Vui lòng điền đúng định dạng số",
                    max: "Số năm kinh nghiệm nhỏ hơn hoặc bằng 60"
                },
                birthofplace: {
                    maxlength: "Tối đa 200 ký tự",
                    regx: "Nguyên quán không bắt đầu bằng khoảng trắng"
                },
                bank: {
                    maxlength: "Tối đa 100 ký tự",
                    regx: "Tài khoản ngân hàng không bắt đầu bằng khoảng trắng"
                },
            }
        }
        $rootScope.validationOptionsInfomation = {
            rules: {
                socialinsurance: {
                    maxlength: 12,
                    regx: /^[^\s].*/
                },
                taxcode: {
                    digits: true,
                },
                accountnumber: {
                    digits: true,
                },
                accountholder: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                accountnumber: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                accountopenplace: {
                    maxlength: 100,
                    regx: /^[^\s].*/
                },
                languagelevel: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                socialinsuranceplace: {
                    maxlength: 20,
                    regx: /^[^\s].*/
                },
                trainingschool: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                trainingtime: {
                    maxlength: 200,
                    regx: /^[^\s].*/
                },
                trainingtype: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                disciplines: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                specialized: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                nation: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                religion: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                nationlaty: {
                    maxlength: 100,
                    regx: /^[^\s].*/
                },
                educationallevel: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                identification: {
                    maxlength: 100,
                    regx: /^[^\s].*/
                },
                salarytype: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                salarygroup: {
                    maxlength: 12,
                    regx: /^[^\s].*/
                },
                emailuser: {
                    maxlength: 100,
                    regx: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
                },
                salaryfactor: {
                    max: 20
                }
            },
            messages: {
                salaryfactor: {
                    max: "Hệ số lương nhỏ hơn hoặc bằng 20"
                },

                taxcode: {
                    digits: caption.HR_HR_MAN_CURD_ERR_HR_MAN_TAX_CODE,
                },
                accountnumber: {
                    digits: caption.HR_HR_MAN_CURD_ERR_HR_MAN_NUMBER_ACCOUNT,
                },
                emailuser: {
                    maxlength: "Tối đa 100 ký tự",
                    regx: "Thư điện tử sai định dạng"
                },
                salarygroup: {
                    maxlength: "Tối đa 12 ký tự",
                    regx: "Nhóm lương không bắt đầu bằng khoảng trắng"
                },
                salarytype: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Loại lương không bắt đầu bằng khoảng trắng"
                },
                identification: {
                    maxlength: "Tối đa 100 ký tự",
                    regx: "Nhận dạng không bắt đầu bằng khoảng trắng"
                },
                educationallevel: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Trình độ văn hóa không bắt đầu bằng khoảng trắng"
                },
                nationlaty: {
                    maxlength: "Tối đa 100 ký tự",
                    regx: "Quốc tịch không bắt đầu bằng khoảng trắng"
                },
                religion: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Tôn giáo không bắt đầu bằng khoảng trắng"
                },
                nation: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Dân tộc không bắt đầu bằng khoảng trắng"
                },
                specialized: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Chuyên ngành không bắt đầu bằng khoảng trắng"
                },
                disciplines: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Ngành học không bắt đầu bằng khoảng trắng"
                },

                trainingtype: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Loại hình đào tạo không bắt đầu bằng khoảng trắng"
                },

                trainingtime: {
                    maxlength: "Tối đa 200 ký tự",
                    regx: "Thời gian đào tạo không bắt đầu bằng khoảng trắng"
                },

                trainingschool: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Trường đào tạo không bắt đầu bằng khoảng trắng"
                },

                socialinsuranceplace: {
                    maxlength: "Tối đa 20 ký tự",
                    regx: "Nơi cấp không bắt đầu bằng khoảng trắng"
                },

                socialinsurance: {
                    maxlength: "Tối đa 12 ký tự",
                    regx: "Số BHXH không bắt đầu bằng khoảng trắng"
                },

                languagelevel: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Trình độ ngoại ngữ không bắt đầu bằng khoảng trắng"
                },

                accountopenplace: {
                    maxlength: "Tối đa 100 ký tự",
                    regx: "Nơi mở tài khoản không bắt đầu bằng khoảng trắng"
                },

                accountnumber: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Số tài khoản không bắt đầu bằng khoảng trắng"
                },

                accountholder: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Chủ tài khoản không bắt đầu bằng khoảng trắng"
                },

                Permanent_Address: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RESIDENT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_RESIDENT
                },
            }
        }
        $rootScope.validationOptionsAddress = {
            rules: {
                Permanent_Address: {
                    required: true
                },
                Now_Address: {
                    required: true,
                    maxlength: 250,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                Permanent_Address: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RESIDENT
                },
                Now_Address: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_ADDRESS,
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Địa chỉ không bắt đầu bằng khoảng trắng"
                }
            }
        }
        $rootScope.validationOptionsContact = {
            rules: {
                ContactName: {
                    required: true,
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Relationship: {
                    required: true,
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                Fax: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Email: {
                    maxlength: 250,
                },
                Address: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Note: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Job_Name: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                ContactName: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CONTRACTNAME,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_NAME_RELATIVES,
                    regx: "Người thân không bắt đầu bằng khoảng trắng"
                },
                Relationship: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RELATIONSHIP,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_RELATIONSHIP,
                    regx: "Mối quan hệ không bắt đầu bằng khoảng trắng"
                },
                Fax: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Fax không bắt đầu bằng khoảng trắng"
                },
                Email: {
                    maxlength: "Tối đa 250 ký tự",
                },
                Address: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Địa chỉ không bắt đầu bằng khoảng trắng"
                },
                Note: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Ghi chú không bắt đầu bằng khoảng trắng"
                },
                Job_Name: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Nghề nghiệp không bắt đầu bằng khoảng trắng"
                }
            }
        }
        $rootScope.validationOptionsDegree = {
            rules: {
                Education_Name: {
                    required: true,
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Result: {
                    required: true,
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                Certificate_Name: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Received_Place: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Traing_Place: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Info_Details1: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                Info_Details1: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Thông tin thêm không bắt đầu bằng khoảng trắng"
                },
                Traing_Place: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Nơi cử đi đào tạo không bắt đầu bằng khoảng trắng"
                },
                Received_Place: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Nơi cấp bằng không bắt đầu bằng khoảng trắng"
                },
                Certificate_Name: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Tên chứng chỉ không bắt đầu bằng khoảng trắng"
                },
                Education_Name: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_NAME_TRAINING,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_TRAINING_NAME,
                    regx: "Tên khóa đào tạo không bắt đầu bằng khoảng trắng"
                },
                Result: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_RESULT,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_RESULT,
                    regx: "Kết quả không bắt đầu bằng khoảng trắng"
                },
            }
        }
        $rootScope.validationOptionsWorkProgress = {
            rules: {
                Start_Time_Workprocess: {
                    required: true,
                },
                Wage_Level: {
                    required: true,
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Salary_Ratio: {
                    required: true,
                    regx: /^[0-9]+(\,[0-9][0-9]?)?/,
                    max: 10
                },
                Description1: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                Description1: {
                    maxlength: "Tối đã 250 ký tự",
                    regx: "Mô tả không bắt đầu bằng khoảng trắng"
                },

                Start_Time_Workprocess: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_START_DAY,
                },
                Wage_Level: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_SALARY_LEVEL,
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Cấp bậc lương không bắt đầu bằng khoảng trắng"
                },
                Salary_Ratio: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_COEFFICIENTS,
                    regx: "Nhập định dạng số",
                    max: "Hệ số lương lớn nhất bằng 10"
                },
            }
        }
        $rootScope.validationOptionsContract = {
            rules: {
                Contract_Code: {
                    required: true,
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                Salary: {
                    required: true,
                    regx: /^[0-9]+(\,[0-9][0-9]?)?/,
                },
                Insuarance: {
                    required: true,
                    regx: /^[0-9]+(\,[0-9][0-9]?)?/,
                },
                Start_Time: {
                    required: true,
                },

                End_Time: {
                    required: true,
                },
                LaborBook_Code: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Place_Work: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Payment: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Contract_Type: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                Work_Content: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Signer: {
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
                Exp_time_work: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Allowance: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Bonus: {
                    regx: /^[0-9]+(\,[0-9][0-9]?)?/,
                    max: 999999999
                },
                Tools_Work: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Info_Insuarance: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Info_Contract: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Other_Agree: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                Other_Agree: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Thỏa thuận khác không bắt đầu bằng khoảng trắng"
                },
                Info_Contract: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Thông tin hợp đồng không bắt đầu bằng khoảng trắng"
                },
                Info_Insuarance: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Thông tin bảo hiểm không bắt đầu bằng khoảng trắng"
                },
                Tools_Work: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Công cụ làm việc không bắt đầu bằng khoảng trắng"
                },
                Bonus: {
                    regx: "Vui lòng nhập định dạng số",
                    max: "Vui lòng nhập giá trị phù hợp"
                },
                Allowance: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Phụ cấp không bắt đầu bằng khoảng trắng"
                },
                Exp_time_work: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Thời gian làm việc không bắt đầu bằng khoảng trắng"
                },
                Signer: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Người ký không bắt đầu bằng khoảng trắng"
                },
                Work_Content: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Nội dung công việc không bắt đầu bằng khoảng trắng"
                },
                Contract_Type: {
                    maxlength: "Tối đa 50 ký tự",
                    regx: "Loại hợp đồng không bắt đầu bằng khoảng trắng"
                },
                Payment: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Thanh toán không bắt đầu bằng khoảng trắng"
                },
                Place_Work: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Nơi làm việc không bắt đầu bằng khoảng trắng"
                },

                LaborBook_Code: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Số sổ lao động không bắt đầu bằng khoảng trắng"
                },

                Contract_Code: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CONTRACT_NUMBER,
                    maxlength: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_CHARACTER_CONTRACT_NUMBER,
                    regx: "Số hợp đồng không bắt đầu bằng khoảng trắng"
                },
                Salary: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_SALALY,
                    regx: caption.HR_CONTRACT_VALIDATE_SALARY,
                },
                Insuarance: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_INSURRANCE_LEVEL,
                    regx: "Vui lòng nhập định dạng số",
                },
                Start_Time: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_SART_TIME,
                },
                End_Time: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_END_TIME,
                },

            }
        };
        $rootScope.validationOptionsWorkflow = {
            rules: {
                Name_Job: {
                    required: true,
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Working_Process: {
                    required: true,
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Description2: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                },
                Info_Details: {
                    maxlength: 250,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                Description2: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Mô tả công việc không bắt đầu bằng khoảng trắng"
                },
                Info_Details: {
                    maxlength: "Tối đa 250 ký tự",
                    regx: "Thông tin thêm không bắt đầu bằng khoảng trắng"
                },
                Name_Job: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_NAME_JOB,
                    maxlength: "Tối đa 250 ký tự"
                },
                Working_Process: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_PROCEDURE,
                    maxlength: "Tối đa 250 ký tự"
                }
            }
        };
        $rootScope.validationOptionsNwiy = {
            rules: {
                numNotWorkAllow: {
                    required: true,
                    regx: /^[+]?\d+(\.\d+)?$/,
                    //max: 60
                },
                year: {
                    required: true
                }
            },
            messages: {
                numNotWorkAllow: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_REQUIRE_NUM_NOT_WORK_ALLOW,
                    regx: caption.HR_HR_MAN_CURD_VALIDATATE_FORMAT_NUM_NOT_WORK_ALLOW,
                    //max: caption.HR_HR_MAN_CURD_VALIDATE_HR_MAN_DATE_OF_BIRTH
                },
                year: {
                    required: caption.HR_HR_MAN_CURD_VALIDATE_REQUIRE_NUM_WORK_YEAR
                }
            }
        }

        $rootScope.gioitinh = [
            { value: caption.HR_HR_MAN_CURD_TXT_MEN, gender: 1 },
            { value: caption.HR_HR_MAN_CURD_TXT_WOMEN, gender: 2 }
        ];
        $rootScope.partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
        $rootScope.partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/;
        //Miêu tả có thể null, và có chứa được khoảng trắng
        $rootScope.partternDescription = /^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9]*[^Đđ!@#$%^&*<>?]*$/;
        $rootScope.partternDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;//Pormat dd/mm/yyyy
        $rootScope.partternEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        $rootScope.partternNumber = /^[0-9]\d*(\\d+)?$/; //Chỉ cho nhập số khong the am
        $rootScope.partternFloat = /^-?\d*(\.\d+)?$/; //Số thực
        $rootScope.partternNotSpace = /^[^\s].*/; //Không chứa khoảng trắng đầu dòng hoặc cuối dòng
        $rootScope.partternPhone = /^(0)([0-9]{9,10})\b$/; //Số điện thoại 10,11 số bắt đầu bằng số 0
    });
    dataserviceHrEmployee.getEmployeeStyle(function (result) {
        result = result.data;
        $rootScope.employeeStyleData = result;
        var all = {
            Code: '',
            Name: caption.COM_TXT_ALL
        }
        $rootScope.employeeStyleData.unshift(all);
    });
    $rootScope.showFunctionHr = PERMISSION_HR;
    $rootScope.ObjectTypeFile = "HR_EMPLOYEE";
    $rootScope.moduleName = "EMPLOYEE";

});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/HREmployee/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderHrEmployee + '/index.html',
            controller: 'index'
        })
        .when('/edit', {
            templateUrl: ctxfolderHrEmployee + '/edit.html',
            controller: 'edit'
        })
        .when('/add_contract/', {
            templateUrl: ctxfolderHrEmployee + '/add_contract.html',
            controller: 'add_contract'
        })
        .when('/edit_contract/:id', {
            templateUrl: ctxfolderHrEmployee + '/edit_contract.html',
            controller: 'edit_contract'
        })
        .when('/add', {
            templateUrl: ctxfolderHrEmployee + '/add.html',
            controller: 'add'
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
    $httpProvider.interceptors.push('httpResponseInterceptor');
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $translate, $window, dataserviceHrEmployee, $filter, myService, $location) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.listGender = [
        {
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
    ]
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
        Status: '',
        CountDayEndContract: null
    }
    $scope.treeDataunit = [];
    $scope.positionData = [];

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HREmployee/jtable",
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
                d.Status = $scope.model.Status;
                d.CountDayEndContract = $scope.model.CountDayEndContract;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                //heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        .withOption('stateSave', true)
        .withOption('stateSaveCallback', function (settings, data) {
            sessionStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
        })
        .withOption('stateLoadCallback', function (settings) {
            if ($rootScope.savePageState) {
                return JSON.parse(sessionStorage.getItem('DataTables_' + settings.sInstance));
            } else {
                return settings.sInstance;
            }
        })
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
            $rootScope.savePageState = true;
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
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
            });
            if ($rootScope.showFunctionHr.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var Id = data.Id;
                        $scope.edit(Id);
                    }
                });
            }
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').withTitle('{{"HR_HR_MAN_LIST_COL_HR_MAN_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<span class="' + full.Color + '">' + data + '(' + full.EmployeeCode + ')</span>';
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Gender').withTitle('{{"HR_HR_MAN_LIST_COL_HR_MAN_SEX" | translate}}').renderWith(function (data, type) {
        if (data == 1) {
            return '<i class="fas fa-male "></i>';
        }
        if (data == 2) {
            return '<i class="fas fa-female " style="color: #f1204fcf;"></i>';
        }
    }).withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('phone').withTitle('{{"HR_HR_MAN_LIST_COL_HR_MAN_PHONE" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}).withOption('sClass', 'dataTable-pr0 hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitName').withTitle('{{"HR_HR_MAN_CURD_LBL_HR_MAN_DEPARTMENT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PositionName').withTitle('{{"HR_HR_MAN_CURD_LBL_HR_MAN_POSITION" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0  dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTimeContract').withTitle('{{"HR_HR_LIST_COL_DATE_END_CONTRACT" | translate}}').renderWith(function (data, type, full) {
        var created = new Date(full.EndTime);
        var now = new Date();
        var diffMs = (created - now);
        var diffDay = Math.floor((diffMs / 86400000));
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
    }).withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PermanentResidence').withTitle('{{"HR_HR_MAN_CURD_COL_HR_MAN_PERMANENTRESIDENCE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EmployeeType').withTitle('{{"HR_HR_MAN_LIST_COL_EMPLOYEE_TYPE" | translate}}').renderWith(function (data, type) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Picture').withTitle('{{"HR_HR_MAN_LIST_COL_HR_MAN_AVATAR" | translate}}').renderWith(function (data, type) {
        return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_user.png' + '"' + "'" + 'height="30" width="30">';
    }).withOption('sClass', 'tcenter dataTable-pr0 dataTable-w80'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"HR_HR_MAN_LIST_COL_HR_MAN_ACTION" | translate}}').notSortable().renderWith(function (data, type, full, meta) {
        var listButton = '';
        if ($rootScope.showFunctionHr.Update) {
            listButton += '<a ng-click="edit(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr10"></i></a>';
        }
        if ($rootScope.showFunctionHr.Delete) {
            listButton += '<a ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
        }
        return listButton;
    }).withOption('sClass', 'nowrap tcenter dataTable-w80'));
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

    $scope.initload = function () {
        dataserviceHrEmployee.gettreedataunit(function (result) {
            result = result.data;
            $scope.treeDataunit = result.Object;
            var all = {
                DepartmentCode: "",
                Title: caption.COM_TXT_ALL
            }
            $scope.treeDataunit.unshift(all);
        });
        dataserviceHrEmployee.getPosition(function (result) {
            result = result.data;
            $scope.positionData = result;
            var allPosition = {
                Code: "",
                Title: caption.COM_TXT_ALL
            }
            $scope.positionData.unshift(allPosition);
        });
        dataserviceHrEmployee.getCurrencyHD(function (result) {
            result = result.data;
            $rootScope.CurrencyData = result;
        });
        dataserviceHrEmployee.getBranch(function (rs) {
            rs = rs.data;
            $scope.listBranch = rs;
            var all = {
                Code: "",
                Name: caption.COM_TXT_ALL
            }
            $scope.listBranch.unshift(all)
        })
        dataserviceHrEmployee.statiscalEmployee(function (rs) {
            rs = rs.data;
            $scope.hrStatiscal = rs;
        })
        dataserviceHrEmployee.getCountEmployee(function (rs) {
            rs = rs.data;
            $scope.allEmp = rs;
        })
    }

    $scope.initload();

    $scope.add = function (p) {
        $scope.model.page = "add";
        myService.setData(data = $scope.model);
        $location.path('/add');
    }

    $scope.edit = function (id) {
        dataserviceHrEmployee.getItem(id, function (rs) {
            rs = rs.data;
            $rootScope.EmployeeCode = rs.Id;
            $rootScope.ObjCode = rs.Id;
            $scope.model.page = "edit";
            myService.setData(data = id);
            $location.path('/edit');
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceHrEmployee.delete(id, function (rs) {
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

    $rootScope.resetEmployee = function (resetPage) {
        $scope.reload(resetPage);
    }

    $scope.exportExcel = function () {
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        dataserviceHrEmployee.exportExcel($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                download(rs.fileName, '/' + rs.pathFile);
            }
            App.unblockUI("#contentMain");
        });
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
    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', text);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, dataserviceHrEmployee, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $translate, myService) {
    $scope.form = {};
    $scope.model = {
        Id: 0,
        gender: '',
        disciplines: '',
        employeekind: '',
        employeegroup: '',
        unit: '',
        employeetype: '',
        employeestype: '',
        years_of_exp: 0,
        status: ''
    }
    $scope.addCommonSettingEmployeeStype = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'EMPLOYEE_STYLE',
                        GroupNote: 'Kiểu nhân viên',
                        AssetCode: 'EMPLOYEE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceHrEmployee.getEmployeeStyle(function (result) {
                result = result.data;
                $rootScope.employeeStyleData = result;
            });
        }, function () { });
    }
    $scope.addCommonSettingEmployeeGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'EMPLOYEE_GROUP',
                        GroupNote: 'Nhóm nhân viên',
                        AssetCode: 'EMPLOYEE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceHrEmployee.getCustomerGroup(function (rs) {
                rs = rs.data;
                $scope.CustomerGroup = rs;
            });
        }, function () { });
    }
    $scope.addCommonSettingEmployeeType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'EMPLOYEE_TYPE',
                        GroupNote: 'Loại hình nhân viên',
                        AssetCode: 'EMPLOYEE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceHrEmployee.getEmployeeType(function (result) {
                result = result.data;
                $rootScope.employeeTypeData = result;
                //$scope.model.employeekind = result.length != 0 ? result[0].Code : '';
            });
        }, function () { });
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


    $scope.addCommonSettingEmployeeStatus = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'EMPLOYEE_STATUS',
                        GroupNote: 'Trạng thái nhân viên',
                        AssetCode: 'EMPLOYEE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceHrEmployee.getStatusEmployee(function (rs) {
                rs = rs.data;
                $scope.lstStatusEmployee = rs;
                $scope.model.status = "";
            })
        }, function () { });
    }
    $scope.addCommonSettingPayTitle = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PAY_TITLE',
                        GroupNote: 'Chức danh',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceHrEmployee.getListPayTitle(function (rs) {
                rs = rs.data;
                $scope.lstPayTitle = rs;
            })
        }, function () { });
    }
    $scope.addCommonSettingPayCertificate = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PAY_CERTIFICATE',
                        GroupNote: 'Bằng cấp/Trình độ',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceHrEmployee.getListPayCertificate(function (rs) {
                rs = rs.data;
                $scope.lstPayCertificate = rs;
            })
        }, function () { });
    }
    $scope.addCommonSettingPayMajor = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PAY_MAJOR',
                        GroupNote: 'Chuyên môn',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataserviceHrEmployee.getListPayMajor(function (rs) {
                rs = rs.data;
                $scope.lstPayMajor = rs;
            })
        }, function () { });
    }

    $scope.initData = function () {
        $rootScope.listNotWork = [];
        dataserviceHrEmployee.gettreedataunit(function (result) {
            result = result.data;
            $scope.treeDataunit = result.Object;
        });
        dataserviceHrEmployee.getPosition(function (result) {
            result = result.data;
            $scope.positionData = result;
        });
        dataserviceHrEmployee.getEmployeeType(function (result) {
            result = result.data;
            $rootScope.employeeTypeData = result;
            $scope.model.employeekind = result.length != 0 ? result[0].Code : '';
        });
        dataserviceHrEmployee.getEmployeeGroup(function (result) {
            result = result.data;
            $scope.employeeGroupData = result;
            $scope.model.employeegroup = result.length != 0 ? result[0].Code : '';
        });
        dataserviceHrEmployee.getEmployeeStyle(function (result) {
            result = result.data;
            $rootScope.employeeStyleData = result;
            $scope.model.employeetype = result.length != 0 ? result[0].Code : '';
        });
        dataserviceHrEmployee.getShift(function (rs) {
            rs = rs.data;
            $scope.lstShift = rs;
        })

        dataserviceHrEmployee.getStatusEmployee(function (rs) {
            rs = rs.data;
            $scope.lstStatusEmployee = rs;
        });
        dataserviceHrEmployee.getListPayTitle(function (rs) {
            rs = rs.data;
            $scope.lstPayTitle = rs;
        })
        dataserviceHrEmployee.getListPayCertificate(function (rs) {
            rs = rs.data;
            $scope.lstPayCertificate = rs;
        })
        dataserviceHrEmployee.getListPayMajor(function (rs) {
            rs = rs.data;
            $scope.lstPayMajor = rs;
        })
        dataserviceHrEmployee.getListPayCareer(function (rs) {
            rs = rs.data;
            $scope.lstPayCareer = rs;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
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
    $scope.selectImage = function () {
        var fileuploader = angular.element("#fileQr");
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
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.insertImage = function (callback, idInput, property) {
        var query = `input[type=file]#${idInput}`;
        var fileName = $(query).val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                callback();
            }
            else {
                var fi = document.getElementById(idInput);
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
                    callback();
                } else {
                    var query2 = `#${idInput}`;
                    var fileUpload = $(query2).get(0);
                    var reader = new FileReader();
                    reader.readAsDataURL(fileUpload.files[0]);
                    reader.onload = function (e) {
                        ////
                        //Initiate the JavaScript Image object.
                        var image = new Image();
                        //Set the Base64 string return from FileReader as source.
                        image.src = e.target.result;
                        image.onload = function () {
                            //Determine the Height and Width.
                            var height = this.height;
                            var width = this.width;
                            if (width > 5000 || height > 5000) {
                                App.toastrError(caption.MLP_MSG_IMG_SIZE_MAXIMUM);
                                callback();
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceHrEmployee.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        callback();
                                    }
                                    else {
                                        $scope.model[property] = '/uploads/images/' + rs.Object;
                                        ok = true;
                                        callback();
                                    }
                                })
                            }
                        };
                    }
                }
            }
        }
        else {
            callback();
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "gender" && ($scope.model.gender != "" || $scope.model.gender != null)) {
            $scope.errorGender = false;
        }
        if (SelectType == "unit" && $scope.model.unit != "") {
            $scope.errorUnit = false;
        }

        if (SelectType == "status" && $scope.model.status != "") {
            $scope.errorstatus = false;
        }

        if (SelectType == "employeekind" && $scope.model.employeekind != "") {
            $scope.errorEmployeekind = false;
        }
        //if (SelectType == "employeegroup" && $scope.model.employeegroup != "") {
        //    $scope.errorEmployeegroup = false;
        //}
        if (SelectType == "employeetype" && $scope.model.employeetype != "") {
            $scope.errorEmployeetype = false;
        }

        //if (SelectType == "phone" && $scope.model.phone != "") {
        //    $scope.errorphone = false;
        //} else if (SelectType == "phone") {
        //    $scope.errorphone = true;
        //}
        if (SelectType == "emailuser" && $scope.model.emailuser && $rootScope.partternEmail.test($scope.model.emailuser)) {
            $scope.errorEmail = false;
        } else if (SelectType == "emailuser") {
            $scope.errorEmail = true;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && $scope.form.addform1.validate() && validationSelect($scope.model).Status == false) {
            //var fileName = $('input[type=file]').val();
            var fileName = $('#file').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();

            $scope.ShiftList = [];
            for (var i = 0; i < $scope.lstShift.length; i++) {
                if ($scope.lstShift[i].IsChecked) {
                    var obj = {
                        Code: $scope.lstShift[i].Code
                    }
                    $scope.ShiftList.push(obj);
                }
            }
            $scope.model.ShiftList = JSON.stringify($scope.ShiftList);
            $scope.insertImage(function () {
                console.log($scope.model.picture);
                $scope.insertImage(function () {
                    console.log($scope.model.QrCodePayment);
                    dataserviceHrEmployee.insert($scope.model, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $rootScope.resetEmployee(false);
                        }
                    });
                }, "fileQr", "QrCodePayment");
            }, "file", "picture");
        }
    }

    $scope.viewLogStatus = function () {

        if ($scope.model.Id == 0) {
            return App.toastrError("Vui lòng thêm nhân viên trước");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderHrEmployee + '/view-status-log.html',
            controller: 'log-status',
            size: '30',
            resolve: {
                para: function () {
                    return $scope.model.Id;
                }
            }
        });
        modalInstance.result.then(function (d) {
        });
    }

    function convertDatetime(date) {
        if (date != null && date != '') {
            var array = date.split('/');
            var result = array[1] + '/' + array[0] + '/' + array[2];
            return result;
        } else {
            return '';
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.gender == "" || data.gender == null) {
            $scope.errorGender = true;
            mess.Status = true;
        } else {
            $scope.errorGender = false;

        }
        if (data.unit == "" || data.unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;

        }
        if (data.employeekind == "" || data.employeekind == null) {
            $scope.errorEmployeekind = true;
            mess.Status = true;
        } else {
            $scope.errorEmployeekind = false;

        }
        if (data.status == "" || data.status == null) {
            $scope.errorstatus = true;
            mess.Status = true;
        } else {
            $scope.errorstatus = false;
        }
        if (data.employeetype == "" || data.employeetype == null) {
            $scope.errorEmployeetype = true;
            mess.Status = true;
        } else {
            $scope.errorEmployeetype = false;
        }

        //if (data.phone && !$rootScope.partternPhone.test(data.phone)) {
        //    $scope.errorphone = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorphone = false;
        //}

        if (data.emailuser && !$rootScope.partternEmail.test(data.emailuser)) {
            $scope.errorEmail = true;
            mess.Status = true;
        } else {
            $scope.errorEmail = false;
        }

        return mess;
    };
    function loadDate() {
        $("#date-birthday").datepicker({
            autoclose: true,
            format: "dd/mm/yyyy",
            endDate: addYear(new Date(), -18),
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#date-birthday .input-date').valid()) {
                $('#date-birthday .input-date').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#date-birthday').datepicker('setEndDate', addYear(new Date(), -18));
            }
        });

        $("#date-birthday2").datepicker({
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#contact-birthday").datepicker({
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#date-identitycard").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function () {
            if ($('#date-identitycard .input-date').valid()) {
                $('#date-identitycard .input-date').removeClass('invalid').addClass('success');
            }
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#date-identitycard').datepicker('setEndDate', addYear(new Date(), -10));
            }
        });

        $("#date-birthday").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            if ($('#date-birthday .input-date').valid()) {
                $('#date-birthday .input-date').removeClass('invalid').addClass('success');
            }
        });
    };
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        loadDate();
    }, 200);

    //bảng địa chỉ
    var vm = $scope;
    vm.dt = {};
    $scope.address = {};
    $scope.selected = [];
    $scope.enableeditDC = false;
    $scope.enableaddDC = true;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllAddress(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsAddress = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HREmployee/JTableAddress",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.EmployeeId = $scope.model.Id;
            },
            complete: function () {
                heightTableManual(250, "#tblDataAddress");
                App.unblockUI("#contentMain");
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
            $compile(angular.element(row))($scope);
        });

    vm.dtColumnsAddress = [];
    vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('Now_Address').withTitle($translate('HR_HR_MAN_CURD_LIST_COL_HR_MAN_ADDRESS')).withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('Phone').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_PHONE')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('Start_Time').withTitle($translate('HR_HR_MAN_CURD_LBL_HR_MAN_DATE_FROM')).renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('End_Time').withTitle($translate('HR_HR_MAN_CURD_LBL_HR_MAN_DATE_TO')).renderWith(function (data, type) {
        return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('action').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id_dc] = full;
        return '<a ng-click="getAddress(selected[' + full.id_dc + '])" class1="btn blue btn-icon-only btn-circle btn-outline" style1="width: 25px; height: 25px; padding: 0px" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_ACCOUNT&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
            '<a class1="btn btn-icon-only red btn-circle btn-outline" style1= "width: 25px; height: 25px; padding: 0px" ng-click="delete_dc(selected[' + full.id_dc + '])" title = "{{&quot;HR_HR_MAN_TITLE_DEL_ADDRESS&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
    }).withOption('sClass', 'tcenter nowrap dataTable-w120'));
    vm.reloadDataAddress = reloadDataAddress;
    vm.dt.dtInstanceAddress = {};
    function reloadDataAddress(resetPaging) {
        vm.dt.dtInstanceAddress.reloadData(callbackAddress, resetPaging);
    }
    function callbackAddress(json) {

    }
    function resetInput() {
        $scope.address.id_dc = null;
        $scope.address.Permanent_Address = null;
        $scope.address.Now_Address = null;
        $scope.address.Phone = null;
        $scope.address.Start_Time = null;
        $scope.address.End_Time = null;
        $scope.enableeditDC = false;
        $scope.enableaddDC = true;
        resetValidateTimeAddress();
    }
    $scope.reloadDataAddress = function () {
        reloadDataAddress(true);
    }
    $scope.getAddress = function (selected) {
        $scope.enableeditDC = true;
        $scope.enableaddDC = false;
        dataserviceHrEmployee.getItemAddress(selected.id_dc, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.address = rs;
                $scope.address.Start_Time = $scope.address.Start_Time != null ? $filter('date')($scope.address.Start_Time, "dd/MM/yyyy") : '';
                $scope.address.End_Time = $scope.address.End_Time != null ? $filter('date')($scope.address.End_Time, "dd/MM/yyyy") : '';
            }
        });
    }
    $scope.addDC = function () {
        validationSelectAddress($scope.address);
        if ($scope.form.addformdc.validate() && validationSelectAddress($scope.address).Status == false) {
            dataserviceHrEmployee.insertAddress($scope.address, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadDataAddress();
                    resetInput();
                }
            });
        }

    }
    $scope.editDC = function () {
        validationSelectAddress($scope.address);
        if ($scope.form.addformdc.validate() && validationSelectAddress($scope.address).Status == false) {
            dataserviceHrEmployee.updateAddress($scope.address, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadDataAddress();
                    resetInput();
                }
            });
        }
    }
    $scope.delete_dc = function (selected) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceHrEmployee.deleteAddress(selected.id_dc, function (rs) {
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
            $scope.reloadDataAddress();
        }, function () {
        });
    }
    $scope.changleSelectAddress = function (SelectType) {
        if (SelectType == "Phone" && $scope.address.Phone && $rootScope.partternPhone.test($scope.address.Phone)) {
            $scope.errorAddressPhone = false;
        } else if (SelectType == "Phone") {
            $scope.errorAddressPhone = true;
        }
    }
    function validationSelectAddress(data) {
        var mess = { Status: false, Title: "" };

        if (data.Phone && !$rootScope.partternPhone.test(data.Phone)) {
            $scope.errorAddressPhone = true;
            mess.Status = true;
        } else {
            $scope.errorAddressPhone = false;
        }
        return mess;
    };
    function loadDateAddress() {
        $("#startTime").datepicker({
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#endTime').datepicker('setStartDate', maxDate);
        });
        $("#endTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#startTime').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#startTime').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#endTime').datepicker('setStartDate', null);
        });
    }
    function resetValidateTimeAddress() {
        $('#startTime').datepicker('setEndDate', null);
        $('#endTime').datepicker('setStartDate', null);
    }
    setTimeout(function () {
        loadDateAddress();
    }, 50);


    //bảng  liên hệ
    $scope.contact = {};
    $scope.enableeditLH = false;
    $scope.enableaddLH = true;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllContact(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsContact = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HREmployee/JTableLH",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.EmployeeId = $scope.model.Id;
            },
            complete: function () {
                heightTableManual(418, "#tblDataContact");
                App.unblockUI("#contentMain");
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
            $compile(angular.element(row))($scope);
        });
    vm.dtColumnsContact = [];
    vm.dtColumnsContact.push(DTColumnBuilder.newColumn('Name').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_CONTACT_NAME')).withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContact.push(DTColumnBuilder.newColumn('Relationship').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_RELATIONSHIP')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContact.push(DTColumnBuilder.newColumn('Phone1').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_PHONE')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContact.push(DTColumnBuilder.newColumn("null").withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id_lh] = full;
        return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="getLH(selected[' + full.id_lh + '])" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_INFORMATION&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
            '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="delete_lh(selected[' + full.id_lh + '])" title="{{&quot;HR_HR_MAN_TITLE_DEL_INFORMATION&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
    }).withOption('sClass', 'nowrap'));
    vm.reloadDataContact = reloadDataContact;
    vm.dt.dtInstanceContact = {};
    function reloadDataContact(resetPaging) {
        vm.dt.dtInstanceContact.reloadData(callbackContact, resetPaging);
    }
    function callbackContact(json) {

    }
    function resetInputContact() {
        $scope.contact.Name = null;
        $scope.contact.Relationship = null;
        $scope.contact.Job_Name = null;
        $scope.contact.Birthday = null;
        $scope.contact.Phone = null;
        $scope.contact.Fax = null;
        $scope.contact.Email = null;
        $scope.contact.Address = null;
        $scope.contact.Note = null;
        $scope.enableeditLH = false;
        $scope.enableaddLH = true;
    }
    $scope.reloadDataContact = function () {
        reloadDataContact(true);
    }
    $scope.getLH = function (selected) {
        dataserviceHrEmployee.getItemLH(selected.id_lh, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.enableeditLH = true;
                $scope.enableaddLH = false;
                $scope.contact = rs;
                $scope.contact.Birthday = $scope.contact.Birthday != null ? $filter('date')($scope.contact.Birthday, "dd/MM/yyyy") : '';
            }
        });
    }
    $scope.addLH = function () {
        validationSelectContact($scope.contact);
        if ($scope.form.addformlienhe.validate() && validationSelectContact($scope.contact).Status == false) {
            dataserviceHrEmployee.insertLH($scope.contact, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadDataContact();
                    resetInputContact();
                }
            });
        }

    }
    $scope.editLH = function () {
        validationSelectContact($scope.contact);
        if ($scope.form.addformlienhe.validate() && validationSelectContact($scope.contact).Status == false) {
            dataserviceHrEmployee.updateLH($scope.contact, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadDataContact();
                    resetInputContact();
                }
            });
        }
    }
    $scope.delete_lh = function (selected) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceHrEmployee.deleteLH(selected.id_lh, function (rs) {
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
            $scope.reloadDataContact();
        }, function () {
        });
    }
    $scope.changleSelectContact = function (SelectType) {
        if (SelectType == "Phone" && $scope.contact.Phone && $rootScope.partternPhone.test($scope.contact.Phone)) {
            $scope.errorContactPhone = false;
        } else if (SelectType == "Phone") {
            $scope.errorContactPhone = true;
        }
        if (SelectType == "Email" && $scope.contact.Email && $rootScope.partternEmail.test($scope.contact.Email)) {
            $scope.errorContactEmail = false;
        } else if (SelectType == "Email") {
            $scope.errorContactEmail = true;
        }
    }
    function validationSelectContact(data) {
        var mess = { Status: false, Title: "" };

        if (data.Phone && !$rootScope.partternPhone.test(data.Phone)) {
            $scope.errorContactPhone = true;
            mess.Status = true;
        } else {
            $scope.errorContactPhone = false;
        }
        if (data.Email && !$rootScope.partternEmail.test(data.Email)) {
            $scope.errorContactEmail = true;
            mess.Status = true;
        } else {
            $scope.errorContactEmail = false;
        }
        return mess;
    };


    //Hợp đồng
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllContract(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsContract = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HREmployee/JTableHD",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.EmployeeId = $scope.model.Id;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataContract");
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
            //contextScope.contextMenu = $scope.contextMenu4;
            $compile(angular.element(row))($scope);
            //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumnsContract = [];
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Contract_Code').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_CONTRACT_CODE')).withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Start_Time').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_START_TIME')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('End_Time').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_END_TIME')).withOption('sWidth', '30px').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Salary').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_SALARY')).renderWith(function (data, type) {
        var salary = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class= "text-danger bold">' + salary + '</span>'
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Insuarance').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_INSUARANCE')).renderWith(function (data, type) {
        var insuarance = data != "" ? $filter('currency')(data, '', 0) : null;
        return '<span class= "text-danger bold">' + insuarance + '</span>'
    }));
    vm.dtColumnsContract.push(DTColumnBuilder.newColumn("").withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = full;
            return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="edit_contract(' + full.id + ')" title="{{&quot;HR_HR_MAN_TITLE_MODIFY_ITEM&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="delete_contract(' + full.id + ')" title="{{&quot;HR_HR_MAN_TITLE_DEL_ITEM&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
    vm.reloadDataContract = reloadDataContract;
    vm.dt.dtInstanceContract = {};
    function reloadDataContract(resetPaging) {
        vm.dt.dtInstanceContract.reloadData(callbackContract, resetPaging);
    }
    function callbackContract(json) {

    }
    $scope.add_contract = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderHrEmployee + '/add_contract.html',
            controller: 'add_contract',
            backdrop: 'static',
            size: '80'
        });
        modalInstance.result.then(function (d) {
            reloadDataContract(true);

            $scope.model.Salary = d;
        }, function () {

        });
    }
    $scope.edit_contract = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderHrEmployee + '/edit_contract.html',
            controller: 'edit_contract',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            reloadDataContract(true);

            $scope.model.Salary = d;
        }, function () {
        });
    }
    $scope.delete_contract = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceHrEmployee.delete_HD(id, function (rs) {
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
            reloadDataContract(true);
        }, function () {
        });
    }


    //bảng  quá trình làm việc
    $scope.workprocess = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllWorkprocess(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsWorkprocess = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HREmployee/JTableQTLV",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.EmployeeId = $scope.model.Id;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(262, "#tblDataWorkprocess");
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
            //contextScope.contextMenu = $scope.contextMenu7;
            $compile(angular.element(row))($scope);
            //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumnsWorkprocess = [];
    vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn('Start_Time1').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_START_TIME1')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn('End_Date1').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_END_DATE1')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn('Wage_Level').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_WAGE_LEVEL')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn('Salary_Ratio').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_SALARY_RATIO')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn("null").withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_qt] = full;
            return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="editWorkprocess(selected[' + full.id_qt + '])" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_PROCESS&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="deleteWorkprocess(selected[' + full.id_qt + '])" title=" {{&quot;HR_HR_MAN_TITLE_DEL_PROCESS&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
        }));
    vm.reloadDataWorkprocess = reloadDataWorkprocess;
    vm.dt.dtInstanceWorkprocess = {};
    function reloadDataWorkprocess(resetPaging) {
        vm.dt.dtInstanceWorkprocess.reloadData(callbackWorkprocess, resetPaging);
    }
    function callbackWorkprocess(json) {

    }
    function resetInputWorkprocess() {
        $scope.workprocess.Wage_Level = null;
        $scope.workprocess.Salary_Ratio = null;
        $scope.workprocess.Description1 = null;
        $scope.workprocess.End_Date1 = null;
        $scope.workprocess.Start_Time1 = null;
        $scope.workprocess.id_qt = null;
        resetValidateTimeWorkprocess();
    }
    $scope.reloadWorkprocess = function () {
        reloadDataWorkprocess(true);
    }
    $scope.enableeditqtlv = false;
    $scope.enableaddqtlv = true;
    $scope.editWorkprocess = function (selected) {
        $scope.enableeditqtlv = true;
        $scope.enableaddqtlv = false;
        dataserviceHrEmployee.getItemQTLV(selected.id_qt, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.workprocess = rs.Object;
                if ($scope.workprocess.End_Date1 == null) {
                    $scope.isNow = true;
                    $scope.disabledEndate = true;
                    var data = new Date();
                    $scope.workprocess.End_Date1 = $filter('date')(new Date(data), 'dd/MM/yyyy')
                } else {
                    $scope.isNow = false;
                    $scope.disabledEndate = false;
                }
            }
        });
    }
    $scope.deleteWorkprocess = function (selected) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceHrEmployee.deleteQTLV(selected.id_qt, function (rs) {
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
            $scope.reloadWorkprocess();
        }, function () {
        });
    }
    $scope.submitQTLV = function () {
        if ($scope.form.addformqtlv.validate()) {
            dataserviceHrEmployee.insertQTLV($scope.workprocess, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadWorkprocess();
                    resetInputWorkprocess();
                }
            });
        }

    }
    $scope.editQTLV = function () {
        if ($scope.form.addformqtlv.validate()) {
            dataserviceHrEmployee.updateQTLV($scope.workprocess, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadWorkprocess();
                    resetInputWorkprocess();
                }
                $scope.enableeditqtlv = false;
                $scope.enableaddqtlv = true;
            });
        }
    }

    //disable
    $scope.isNow = false;
    $scope.disabledEndate = false;
    $scope.disabledIsNow = false;
    $scope.toNow = function (isNow) {
        $scope.isNow = isNow;
        if (isNow) {
            $scope.disabledEndate = true;
            $scope.workprocess.End_Date1 = "";
        } else {
            $scope.disabledEndate = false;
        }
    }

    function loadDateWorkprocess() {
        $("#Start_Time_Workprocess").datepicker({
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#End_Time_Workprocess').datepicker('setStartDate', maxDate);
            //if ($('#Start_Time_Workprocess').valid()) {
            //    $('#Start_Time_Workprocess').removeClass('invalid').addClass('success');
            //}
        });
        $("#End_Time_Workprocess").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#Start_Time_Workprocess').datepicker('setEndDate', maxDate);
            //if ($('#End_Time_Workprocess').valid()) {
            //    $('#End_Time_Workprocess').removeClass('invalid').addClass('success');
            //}
        });
    }
    function resetValidateTimeWorkprocess() {
        $('#Start_Time_Workprocess').datepicker('setEndDate', null);
        $('#End_Time_Workprocess').datepicker('setStartDate', null);
    }
    setTimeout(function () {
        loadDateWorkprocess();
    }, 50);


    //bảng  bằng cấp chứng chỉ
    $scope.certificate = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllCertificate(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsCertificate = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HREmployee/JTableBCCC",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.EmployeeId = $scope.model.Id;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(362, "#tblDataCertificate");
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
            $compile(angular.element(row))($scope);
        });
    vm.dtColumnsCertificate = [];
    vm.dtColumnsCertificate.push(DTColumnBuilder.newColumn('Education_Name').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_EDUCATION_NAME')).withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsCertificate.push(DTColumnBuilder.newColumn('Result').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_RESULT')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsCertificate.push(DTColumnBuilder.newColumn("null").withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_bccc] = full;
            return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="editCertificate(selected[' + full.id_bccc + '])" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_QUALIFICATION&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="deleteCertificate(selected[' + full.id_bccc + '])" title=" {{&quot;HR_HR_MAN_TITLE_DEL_QUALIFICATION&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
    vm.reloadDataCertificate = reloadDataCertificate;
    vm.dt.dtInstanceCertificate = {};
    function reloadDataCertificate(resetPaging) {
        vm.dt.dtInstanceCertificate.reloadData(callbackCertificate, resetPaging);
    }
    function callbackCertificate(json) {

    }
    function resetInputCertificate() {
        $scope.certificate.Education_Name = '';
        $scope.certificate.Start_Time3 = null;
        $scope.certificate.End_Time3 = null;
        $scope.certificate.Result = '';
        $scope.certificate.Certificate_Name = '';
        $scope.certificate.Received_Place = '';
        $scope.certificate.Traing_Place = '';
        $scope.certificate.Info_Details1 = '';
    }
    $scope.reloadCertificate = function () {
        reloadDataCertificate(true);
    }
    $scope.enableeditbccc = false;
    $scope.enableaddbccc = true;
    $scope.editCertificate = function (selected) {
        $scope.enableeditbccc = true;
        $scope.enableaddbccc = false;
        dataserviceHrEmployee.getItemBCCC(selected.id_bccc, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.certificate = rs[0];
                setTimeout(function () {
                    loadDateCertificate();
                    validateDefault(rs[0].Start_Time3, rs[0].End_Time3);
                }, 300);
            }
        });
    }
    $scope.deleteCertificate = function (selected) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceHrEmployee.deleteBCCC(selected.id_bccc, function (rs) {
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
            $scope.reloadCertificate();
        }, function () {
        });
    }
    $scope.submitBCCC = function () {
        if ($scope.form.addformBC.validate()) {
            dataserviceHrEmployee.insertBCCC($scope.certificate, function (rs) {

                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadCertificate();
                    resetInputCertificate();
                }
            });
        }

    }
    $scope.editBCCC = function () {
        if ($scope.form.addformBC.validate()) {
            dataserviceHrEmployee.updateBCCC($scope.certificate, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadCertificate();
                    resetInputCertificate();
                    $scope.enableeditbccc = false;
                    $scope.enableaddbccc = true;
                }
            });
        }
    }
    function loadDateCertificate() {
        $("#certificateStart").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#certificateEnd').datepicker('setStartDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#certificateEnd').datepicker('setStartDate', null);
            }
        });
        $("#certificateEnd").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#certificateStart').datepicker('setEndDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#certificateStart').datepicker('setEndDate', null);
            }
        });;
    }
    function validateDefault(from, to) {
        setStartDate("#certificateEnd", from);
        setEndDate("#certificateStart", to);
    }
    setTimeout(function () {
        loadDateCertificate();
    }, 50);

    //bảng  quy trình công việc
    $scope.workflow = {};
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsWorkflow = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HREmployee/JTableQTCV",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.EmployeeId = $scope.model.Id;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(247, "#tblDataWorkflow");
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
            contextScope.contextMenu = $scope.contextMenu2;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumnsWorkflow = [];
    vm.dtColumnsWorkflow.push(DTColumnBuilder.newColumn('Name_Job').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_NAME_JOB')).withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsWorkflow.push(DTColumnBuilder.newColumn('Working_Process').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_WORKING_PROCESS')).renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsWorkflow.push(DTColumnBuilder.newColumn("id_cv").withTitle($translate('COM_LIST_COL_ACTION')).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_cv] = full;
            return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="edit_cv(selected[' + full.id_cv + '])" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_PROCESS1&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="delete_cv(selected[' + full.id_cv + '])" title=" {{&quot;HR_HR_MAN_TITLE_DEL_PROCESS1&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
    vm.reloadDataWorkflow = reloadDataWorkflow;
    vm.dt.dtInstanceWorkflow = {};
    function reloadDataWorkflow(resetPaging) {
        vm.dt.dtInstanceWorkflow.reloadData(callbackWorkflow, resetPaging);
    }
    function callbackWorkflow(json) {

    }
    function resetInputWorkflow() {
        $scope.workflow.Name_Job = '';
        $scope.workflow.Working_Process = '';
        $scope.workflow.Description2 = '';
        $scope.workflow.Info_Details = '';
    }
    $scope.reloadWorkflow = function () {
        reloadDataWorkflow(true);
    }
    $scope.reloadNoResetPageWorkflow = function () {
        reloadDataWorkflow(false);
    }
    $scope.enableeditqtcv = false;
    $scope.enableaddqtcv = true;
    $scope.edit_cv = function (selected) {
        $scope.enableeditqtcv = true;
        $scope.enableaddqtcv = false;
        dataserviceHrEmployee.getItemQTCV(selected.id_cv, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.workflow = rs[0];
            }
        });
    }
    $scope.delete_cv = function (selected) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceHrEmployee.deleteQTCV(selected.id_cv, function (rs) {
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
            $scope.reloadNoResetPageWorkflow();
        }, function () {
        });
    }
    $scope.submitQTCV = function () {
        if ($scope.form.addformQTCV1.validate()) {
            dataserviceHrEmployee.insertQTCV($scope.workflow, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadWorkflow();
                    resetInputWorkflow();
                }
            });
        }

    }
    $scope.editQTCV = function () {
        if ($scope.form.addformQTCV1.validate()) {
            dataserviceHrEmployee.updateQTCV($scope.workflow, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPageWorkflow();
                    resetInputWorkflow();
                    $scope.enableeditqtcv = false;
                    $scope.enableaddqtcv = true;
                }
            });
        }
    }


    //Department
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsDepartment = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HrEmployee/JTableDepartment",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Id = $scope.model.Id;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataDepartment");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumnsDepartment = [];
    vm.dtColumnsDepartment.push(DTColumnBuilder.newColumn('DepartmentTitle').withTitle($translate('HR_HR_MAN_CURD_LBL_HR_MAN_DEPARTMENT')).renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsDepartment.push(DTColumnBuilder.newColumn('Role').withTitle($translate('HR_HR_LIST_COL_ROLE')).renderWith(function (data, type, full) {
        return data;
    }));
    vm.reloadDataDepartment = reloadDataDepartment;
    vm.dt.dtInstanceDepartment = {};
    function reloadDataDepartment(resetPaging) {
        vm.dt.dtInstanceDepartment.reloadData(callbackDepartment, resetPaging);
    }
    function callbackDepartment(json) {

    }

    //Group
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsGroup = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HrEmployee/JTableGroup",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Id = $scope.model.Id;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataGroup");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumnsGroup = [];
    vm.dtColumnsGroup.push(DTColumnBuilder.newColumn('GroupTitle').withTitle($translate('HR_HR_TABLE_NAME_GROUP')).renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsGroup.push(DTColumnBuilder.newColumn('Role').withTitle($translate('HR_HR_LIST_COL_ROLE')).renderWith(function (data, type, full) {
        return data;
    }));
    vm.reloadDataGroup = reloadDataGroup;
    vm.dt.dtInstanceGroup = {};
    function reloadDataGroup(resetPaging) {
        vm.dt.dtInstanceGroup.reloadData(callbackGroup, resetPaging);
    }
    function callbackGroup(json) {

    }
    //Show, hide header employee
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = true;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = false;
    }

    //End show, hide header employee
});

app.controller('edit', function ($scope, $rootScope, $compile, dataserviceHrEmployee, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $translate, myService, $location) {
    $scope.goHome = function () {
        $location.path("/");
    }
    var para = myService.getData();
    if (para == undefined) {
        para = idObject;
    }
    if (para == undefined || para <= 0) {
        location.href = "/Admin/HREmployee";
    }
    else {
        $scope.empId = para;
        $scope.form = {};

        $scope.showLog = function () {
            dataserviceHrEmployee.getJsonData($scope.empId, function (rs) {
                rs = rs.data;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderLog + '/showLog.html',
                    controller: 'showLog',
                    backdrop: 'static',
                    size: '50',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                }, function () { });
            })
        }

        $scope.addCommonSettingEmployeeStype = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCommonSetting + "/detail.html",
                controller: 'detail',
                size: '50',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return {
                            Group: 'EMPLOYEE_STYLE',
                            GroupNote: 'Kiểu nhân viên',
                            AssetCode: 'EMPLOYEE'
                        }
                    }
                }
            });
            modalInstance.result.then(function (d) {
                dataserviceHrEmployee.getEmployeeStyle(function (result) {
                    result = result.data;
                    $rootScope.employeeStyleData = result;
                });
            }, function () { });
        }
        $scope.addCommonSettingEmployeeGroup = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCommonSetting + "/detail.html",
                controller: 'detail',
                size: '50',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return {
                            Group: 'EMPLOYEE_GROUP',
                            GroupNote: 'Nhóm nhân viên',
                            AssetCode: 'EMPLOYEE'
                        }
                    }
                }
            });
            modalInstance.result.then(function (d) {
                dataserviceHrEmployee.getCustomerGroup(function (rs) {
                    rs = rs.data;
                    $scope.CustomerGroup = rs;
                });
            }, function () { });
        }
        $scope.addCommonSettingEmployeeType = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCommonSetting + "/detail.html",
                controller: 'detail',
                size: '50',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return {
                            Group: 'EMPLOYEE_TYPE',
                            GroupNote: 'Loại hình nhân viên',
                            AssetCode: 'EMPLOYEE'
                        }
                    }
                }
            });
            modalInstance.result.then(function (d) {
                dataserviceHrEmployee.getEmployeeType(function (result) {
                    result = result.data;
                    $rootScope.employeeTypeData = result;
                    //$scope.model.employeekind = result.length != 0 ? result[0].Code : '';
                });
            }, function () { });
        }
        $scope.addCommonSettingEmployeeStatus = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCommonSetting + "/detail.html",
                controller: 'detail',
                size: '50',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return {
                            Group: 'EMPLOYEE_STATUS',
                            GroupNote: 'Trạng thái nhân viên',
                            AssetCode: 'EMPLOYEE'
                        }
                    }
                }
            });
            modalInstance.result.then(function (d) {
                dataserviceHrEmployee.getStatusEmployee(function (rs) {
                    rs = rs.data;
                    $scope.lstStatusEmployee = rs;
                    $scope.model.status = "";
                })
            }, function () { });
        }
        $scope.addCommonSettingPayTitle = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCommonSetting + "/detail.html",
                controller: 'detail',
                size: '50',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return {
                            Group: 'PAY_TITLE',
                            GroupNote: 'Chức danh',
                            AssetCode: ''
                        }
                    }
                }
            });
            modalInstance.result.then(function (d) {
                dataserviceHrEmployee.getListPayTitle(function (rs) {
                    rs = rs.data;
                    $scope.lstPayTitle = rs;
                })
            }, function () { });
        }
        $scope.addCommonSettingPayCertificate = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCommonSetting + "/detail.html",
                controller: 'detail',
                size: '50',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return {
                            Group: 'PAY_CERTIFICATE',
                            GroupNote: 'Bằng cấp/Trình độ',
                            AssetCode: ''
                        }
                    }
                }
            });
            modalInstance.result.then(function (d) {
                dataserviceHrEmployee.getListPayCertificate(function (rs) {
                    rs = rs.data;
                    $scope.lstPayCertificate = rs;
                })
            }, function () { });
        }
        $scope.addCommonSettingPayMajor = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderCommonSetting + "/detail.html",
                controller: 'detail',
                size: '50',
                backdrop: 'static',
                resolve: {
                    para: function () {
                        return {
                            Group: 'PAY_MAJOR',
                            GroupNote: 'Chuyên môn',
                            AssetCode: ''
                        }
                    }
                }
            });
            modalInstance.result.then(function (d) {
                dataserviceHrEmployee.getListPayMajor(function (rs) {
                    rs = rs.data;
                    $scope.lstPayMajor = rs;
                })
            }, function () { });
        }
        $scope.cancel = function () {
            $rootScope.EmployeeCode = "";
            $uibModalInstance.dismiss('cancel');
        }
        $scope.initData = function () {
            dataserviceHrEmployee.gettreedataunit(function (result) {
                result = result.data;
                $scope.treeDataunit = result.Object;
            });
            dataserviceHrEmployee.getEmployeeType(function (result) {
                result = result.data;
                $rootScope.employeeTypeData = result;
            });
            dataserviceHrEmployee.getEmployeeGroup(function (result) {
                result = result.data;
                $scope.employeeGroupData = result;
            });
            dataserviceHrEmployee.gettreedataunit(function (result) {
                result = result.data;
                $scope.treeDataunit = result.Object;
            });
            dataserviceHrEmployee.getItem(para, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    $rootScope.EmployeeCode = rs.Id;
                    $scope.model = rs;
                    if ($scope.model.picture == '/images/default/no_image.png') {
                        $scope.model.picture = '/images/default/uploadimg.png';
                    }
                    try {
                        if ($scope.model.notWorkDay != null) {
                            $rootScope.listNotWork = JSON.parse($scope.model.notWorkDay);
                        }
                        else {
                            $rootScope.listNotWork = [];
                        }
                    } catch (e) {
                        console.log(e);
                        $rootScope.listNotWork = [];
                    }
                    dataserviceHrEmployee.getShift(function (rs) {
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
            dataserviceHrEmployee.getPosition(function (result) {
                result = result.data;
                $scope.positionData = result;
            });
            dataserviceHrEmployee.getStatusEmployee(function (rs) {
                rs = rs.data;
                $scope.lstStatusEmployee = rs;
            });
            dataserviceHrEmployee.getListPayTitle(function (rs) {
                rs = rs.data;
                $scope.lstPayTitle = rs;
            })
            dataserviceHrEmployee.getListPayCertificate(function (rs) {
                rs = rs.data;
                $scope.lstPayCertificate = rs;
            })
            dataserviceHrEmployee.getListPayMajor(function (rs) {
                rs = rs.data;
                $scope.lstPayMajor = rs;
            })
            dataserviceHrEmployee.getListPayCareer(function (rs) {
                rs = rs.data;
                $scope.lstPayCareer = rs;
            });
        }
        $scope.initData();
        $scope.loadImage = function () {
            var fileuploader = angular.element("#file");
            fileuploader.on('click', function () {
            });
            fileuploader.on('change', function (e) {
                var reader = new FileReader();
                reader.onload = function () {
                    document.getElementById('picture').src = reader.result;
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
        $scope.selectImage = function () {
            var fileuploader = angular.element("#fileQr");
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
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                    return;
                }
                reader.readAsDataURL(files[0]);
            });
            fileuploader.trigger('click');
        }
        $scope.insertImage = function (callback, idInput, property) {
            var query = `input[type=file]#${idInput}`;
            var fileName = $(query).val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                    callback();
                }
                else {
                    var fi = document.getElementById(idInput);
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
                        callback();
                    } else {
                        var query2 = `#${idInput}`;
                        var fileUpload = $(query2).get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            ////
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.MLP_MSG_IMG_SIZE_MAXIMUM);
                                    callback();
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataserviceHrEmployee.uploadImage(data, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            callback();
                                        }
                                        else {
                                            $scope.model[property] = '/uploads/images/' + rs.Object;
                                            ok = true;
                                            callback();
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            }
            else {
                callback();
            }
        }
        $scope.changleSelect = function (SelectType) {
            if (SelectType == "gender" && ($scope.model.gender != "" || $scope.model.gender != null)) {
                $scope.errorGender = false;
            }
            if (SelectType == "unit" && $scope.model.unit != "") {
                $scope.errorUnit = false;
            }
            if (SelectType == "employeekind" && $scope.model.employeekind != "") {
                $scope.errorEmployeekind = false;
            }
            if (SelectType == "status" && $scope.model.status != "") {
                $scope.errorstatus = false;
            }
            //if (SelectType == "employeegroup" && $scope.model.employeegroup != "") {
            //    $scope.errorEmployeegroup = false;
            //}
            if (SelectType == "employeetype" && $scope.model.employeetype != "") {
                $scope.errorEmployeetype = false;
            }

            //if (SelectType == "phone" && $scope.model.phone && $rootScope.partternPhone.test($scope.model.phone)) {
            //    $scope.errorphone = false;
            //} else if (SelectType == "phone") {
            //    $scope.errorphone = true;
            //}
            if (SelectType == "emailuser" && $scope.model.emailuser && $rootScope.partternEmail.test($scope.model.emailuser)) {
                $scope.errorEmail = false;
            } else if (SelectType == "emailuser") {
                $scope.errorEmail = true;
            }
        }
        $scope.submit = function () {
            validationSelect($scope.model);
            if ($scope.form.editformTT.validate() && $scope.form.editform1.validate() && validationSelect($scope.model).Status == false) {
                $scope.ShiftList = [];
                for (var i = 0; i < $scope.lstShift.length; i++) {
                    if ($scope.lstShift[i].IsChecked) {
                        var obj = {
                            Code: $scope.lstShift[i].Code
                        }
                        $scope.ShiftList.push(obj);
                    }
                }
                $scope.model.ShiftList = JSON.stringify($scope.ShiftList);
                $scope.insertImage(function () {
                    console.log($scope.model.picture);
                    $scope.insertImage(function () {
                        dataserviceHrEmployee.update($scope.model, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                $rootScope.resetEmployee(false);
                            }
                        });
                    }, "fileQr", "QrCodePayment");
                }, "file", "picture");
            }
        }

        $scope.viewLogStatus = function () {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderHrEmployee + '/view-status-log.html',
                controller: 'log-status',
                size: '30',
                resolve: {
                    para: function () {
                        return para;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            });
        }

        function convertDatetime(date) {
            if (date != null && date != '') {
                var array = date.split('/');
                var result = array[1] + '/' + array[0] + '/' + array[2];
                return result;
            } else {
                return '';
            }
        }
        function validationSelect(data) {
            var mess = { Status: false, Title: "" };

            if (data.gender == "" || data.gender == null) {
                $scope.errorGender = true;
                mess.Status = true;
            } else {
                $scope.errorGender = false;

            }
            if (data.unit == "" || data.unit == null) {
                $scope.errorUnit = true;
                mess.Status = true;
            } else {
                $scope.errorUnit = false;

            }
            if (data.employeekind == "" || data.employeekind == null) {
                $scope.errorEmployeekind = true;
                mess.Status = true;
            } else {
                $scope.errorEmployeekind = false;

            }

            if (data.status == "" || data.status == null) {
                $scope.errorstatus = true;
                mess.Status = true;
            } else {
                $scope.errorstatus = false;
            }
            //if (data.employeegroup == "" || data.employeegroup == null) {
            //    $scope.errorEmployeegroup = true;
            //    mess.Status = true;
            //} else {
            //    $scope.errorEmployeegroup = false;
            //}
            if (data.employeetype == "" || data.employeetype == null) {
                $scope.errorEmployeetype = true;
                mess.Status = true;
            } else {
                $scope.errorEmployeetype = false;
            }

            //if (data.phone && !$rootScope.partternPhone.test(data.phone)) {
            //    $scope.errorphone = true;
            //    mess.Status = true;
            //} else {
            //    $scope.errorphone = false;
            //}


            if (data.emailuser && !$rootScope.partternEmail.test(data.emailuser)) {
                $scope.errorEmail = true;
                mess.Status = true;
            } else {
                $scope.errorEmail = false;
            }

            return mess;
        };
        function loadDateInfo() {
            $("#date-birthday").datepicker({
                autoclose: true,
                format: "dd/mm/yyyy",
                endDate: addYear(new Date(), -18),
                fontAwesome: true,
            }).on('changeDate', function () {
                if ($('#date-birthday .input-date').valid()) {
                    $('#date-birthday .input-date').removeClass('invalid').addClass('success');
                }
            }).keyup(function (e) {
                if (e.keyCode == 8 || e.keyCode == 46) {
                    $('#date-birthday').datepicker('setEndDate', addYear(new Date(), -18));
                }
            });
            $("#contact-birthday").datepicker({
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            });
            $("#date-birthday2").datepicker({
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            });
            $("#date-identitycard").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function () {
                if ($('#date-identitycard .input-date').valid()) {
                    $('#date-identitycard .input-date').removeClass('invalid').addClass('success');
                }
            }).keyup(function (e) {
                if (e.keyCode == 8 || e.keyCode == 46) {
                    $('#date-identitycard').datepicker('setEndDate', addYear(new Date(), -10));
                }
            });

            $("#date-birthday").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                if ($('#date-birthday .input-date').valid()) {
                    $('#date-birthday .input-date').removeClass('invalid').addClass('success');
                }
            });
        }
        setTimeout(function () {
            setModalMaxHeight('.modal');
            setModalDraggable('.modal-dialog');
            loadDateInfo();
        }, 400);

        //bảng địa chỉ
        var vm = $scope;
        vm.dt = {};
        $scope.address = {};
        $scope.selected = [];
        $scope.enableeditDC = false;
        $scope.enableaddDC = true;
        var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllAddress(selectAll, selected)"/><span></span></label>';
        vm.dtOptionsAddress = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: "/Admin/HREmployee/JTableAddress",
                beforeSend: function (jqXHR, settings) {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                type: 'POST',
                data: function (d) {
                    d.EmployeeId = para;
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                    heightTableManual(250, "#tblDataAddress");
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
                //contextScope.contextMenu = $scope.contextMenu;
                $compile(angular.element(row))($scope);
                //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            });

        vm.dtColumnsAddress = [];
        vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('Now_Address').withTitle($translate('HR_HR_MAN_CURD_LIST_COL_HR_MAN_ADDRESS')).withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('Phone').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_PHONE')).renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('Start_Time').withTitle($translate('HR_HR_MAN_CURD_LBL_HR_MAN_DATE_FROM')).renderWith(function (data, type) {
            return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
        }));
        vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('End_Time').withTitle($translate('HR_HR_MAN_CURD_LBL_HR_MAN_DATE_TO')).renderWith(function (data, type) {
            return data != null && data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
        }));
        vm.dtColumnsAddress.push(DTColumnBuilder.newColumn('action').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable().renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_dc] = full;
            return '<a ng-click="getAddress(selected[' + full.id_dc + '])" class1="btn blue btn-icon-only btn-circle btn-outline" style1="width: 25px; height: 25px; padding: 0px" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_ACCOUNT&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                '<a class1="btn btn-icon-only red btn-circle btn-outline" style1= "width: 25px; height: 25px; padding: 0px" ng-click="delete_dc(selected[' + full.id_dc + '])" title = "{{&quot;HR_HR_MAN_TITLE_DEL_PROCESS&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
        }).withOption('sClass', 'tcenter nowrap dataTable-w120'));
        vm.reloadDataAddress = reloadDataAddress;
        vm.dt.dtInstanceAddress = {};
        function reloadDataAddress(resetPaging) {
            vm.dt.dtInstanceAddress.reloadData(callbackAddress, resetPaging);
        }
        function callbackAddress(json) {

        }
        function resetInput() {
            $scope.address.id_dc = null;
            $scope.address.Permanent_Address = null;
            $scope.address.Now_Address = null;
            $scope.address.Phone = null;
            $scope.address.Start_Time = null;
            $scope.address.End_Time = null;
            $scope.enableeditDC = false;
            $scope.enableaddDC = true;
            resetValidateTimeAddress();
        }
        $scope.reloadDataAddress = function () {
            reloadDataAddress(true);
        }
        $scope.getAddress = function (selected) {
            $scope.enableeditDC = true;
            $scope.enableaddDC = false;
            dataserviceHrEmployee.getItemAddress(selected.id_dc, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.address = rs;
                    $scope.address.Start_Time = $scope.address.Start_Time != null ? $filter('date')($scope.address.Start_Time, "dd/MM/yyyy") : '';
                    $scope.address.End_Time = $scope.address.End_Time != null ? $filter('date')($scope.address.End_Time, "dd/MM/yyyy") : '';
                }
            });
        }
        $scope.addDC = function () {
            validationSelectAddress($scope.address);
            if ($scope.form.addformdc.validate() && validationSelectAddress($scope.address).Status == false) {
                dataserviceHrEmployee.insertAddress($scope.address, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadDataAddress();
                        resetInput();
                    }
                });
            }

        }
        $scope.editDC = function () {
            validationSelectAddress($scope.address);
            if ($scope.form.addformdc.validate() && validationSelectAddress($scope.address).Status == false) {
                dataserviceHrEmployee.updateAddress($scope.address, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadDataAddress();
                        resetInput();
                    }
                });
            }
        }
        $scope.delete_dc = function (selected) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                    $scope.ok = function () {
                        dataserviceHrEmployee.deleteAddress(selected.id_dc, function (rs) {
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
                $scope.reloadDataAddress();
            }, function () {
            });
        }
        $scope.changleSelectAddress = function (SelectType) {
            if (SelectType == "Phone" && $scope.address.Phone && $rootScope.partternPhone.test($scope.address.Phone)) {
                $scope.errorAddressPhone = false;
            } else if (SelectType == "Phone") {
                $scope.errorAddressPhone = true;
            }
        }

        function validationSelectAddress(data) {
            var mess = { Status: false, Title: "" };

            if (data.Phone && !$rootScope.partternPhone.test(data.Phone)) {
                $scope.errorAddressPhone = true;
                mess.Status = true;
            } else {
                $scope.errorAddressPhone = false;
            }
            return mess;
        };
        function loadDateAddress() {
            $("#startTime").datepicker({
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('#endTime').datepicker('setStartDate', maxDate);
            });
            $("#endTime").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('#startTime').datepicker('setEndDate', maxDate);
            });
            $('.end-date').click(function () {
                $('#startTime').datepicker('setEndDate', null);
            });
            $('.start-date').click(function () {
                $('#endTime').datepicker('setStartDate', null);
            });
        }
        function resetValidateTimeAddress() {
            $('#startTime').datepicker('setEndDate', null);
            $('#endTime').datepicker('setStartDate', null);
        }
        setTimeout(function () {
            loadDateAddress();
        }, 50);

        //bảng  liên hệ
        $scope.contact = {};
        $scope.enableeditLH = false;
        $scope.enableaddLH = true;
        var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllContact(selectAll, selected)"/><span></span></label>';
        vm.dtOptionsContact = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: "/Admin/HREmployee/JTableLH",
                beforeSend: function (jqXHR, settings) {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                type: 'POST',
                data: function (d) {
                    d.EmployeeId = para;
                },
                complete: function () {
                    heightTableManual(418, "#tblDataContact");
                    App.unblockUI("#contentMain");
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
                $compile(angular.element(row))($scope);
            });
        vm.dtColumnsContact = [];
        vm.dtColumnsContact.push(DTColumnBuilder.newColumn('Name').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_CONTACT_NAME')).withOption('sWidth', '30px').renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsContact.push(DTColumnBuilder.newColumn('Relationship').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_RELATIONSHIP')).renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsContact.push(DTColumnBuilder.newColumn('Phone1').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_PHONE')).renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsContact.push(DTColumnBuilder.newColumn("null").withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable().renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_lh] = full;
            return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="getLH(selected[' + full.id_lh + '])" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_INFORMATION&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="delete_lh(selected[' + full.id_lh + '])" title="{{&quot;HR_HR_MAN_TITLE_DEL_INFORMATION&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
        }).withOption('sClass', 'nowrap'));
        vm.reloadDataContact = reloadDataContact;
        vm.dt.dtInstanceContact = {};
        function reloadDataContact(resetPaging) {
            vm.dt.dtInstanceContact.reloadData(callbackContact, resetPaging);
        }
        function callbackContact(json) {

        }
        function resetInputContact() {
            $scope.contact.Name = null;
            $scope.contact.Relationship = null;
            $scope.contact.Job_Name = null;
            $scope.contact.Birthday = null;
            $scope.contact.Phone = null;
            $scope.contact.Fax = null;
            $scope.contact.Email = null;
            $scope.contact.Address = null;
            $scope.contact.Note = null;
            $scope.enableeditLH = false;
            $scope.enableaddLH = true;
        }
        $scope.reloadDataContact = function () {
            reloadDataContact(true);
        }
        $scope.getLH = function (selected) {
            dataserviceHrEmployee.getItemLH(selected.id_lh, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.enableeditLH = true;
                    $scope.enableaddLH = false;
                    $scope.contact = rs;
                    $scope.contact.Birthday = $scope.contact.Birthday != null ? $filter('date')($scope.contact.Birthday, "dd/MM/yyyy") : '';
                }
            });
        }
        $scope.addLH = function () {
            validationSelectContact($scope.contact);
            if ($scope.form.addformlienhe.validate() && validationSelectContact($scope.contact).Status == false) {
                dataserviceHrEmployee.insertLH($scope.contact, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadDataContact();
                        resetInputContact();
                    }
                });
            }

        }
        $scope.editLH = function () {
            validationSelectContact($scope.contact);
            if ($scope.form.addformlienhe.validate() && validationSelectContact($scope.contact).Status == false) {
                dataserviceHrEmployee.updateLH($scope.contact, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadDataContact();
                        resetInputContact();
                    }
                });
            }
        }
        $scope.delete_lh = function (selected) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                    $scope.ok = function () {
                        dataserviceHrEmployee.deleteLH(selected.id_lh, function (rs) {
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
                $scope.reloadDataContact();
            }, function () {
            });
        }
        $scope.changleSelectContact = function (SelectType) {
            if (SelectType == "Phone" && $scope.contact.Phone && $rootScope.partternPhone.test($scope.contact.Phone)) {
                $scope.errorContactPhone = false;
            } else if (SelectType == "Phone") {
                $scope.errorContactPhone = true;
            }
            if (SelectType == "Email" && $scope.contact.Email && $rootScope.partternEmail.test($scope.contact.Email)) {
                $scope.errorContactEmail = false;
            } else if (SelectType == "Email") {
                $scope.errorContactEmail = true;
            }
        }
        function validationSelectContact(data) {
            var mess = { Status: false, Title: "" };

            if (data.Phone && !$rootScope.partternPhone.test(data.Phone)) {
                $scope.errorContactPhone = true;
                mess.Status = true;
            } else {
                $scope.errorContactPhone = false;
            }
            if (data.Email && !$rootScope.partternEmail.test(data.Email)) {
                $scope.errorContactEmail = true;
                mess.Status = true;
            } else {
                $scope.errorContactEmail = false;
            }
            return mess;
        };

        //Hợp đồng
        var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllContract(selectAll, selected)"/><span></span></label>';
        vm.dtOptionsContract = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: "/Admin/HREmployee/JTableHD",
                beforeSend: function (jqXHR, settings) {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                type: 'POST',
                data: function (d) {
                    d.EmployeeId = para;
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                    heightTableManual(250, "#tblDataContract");
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
                //contextScope.contextMenu = $scope.contextMenu4;
                $compile(angular.element(row))($scope);
                //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            });
        vm.dtColumnsContract = [];
        vm.dtColumnsContract.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sClass', 'hidden'));
        vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Contract_Code').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_CONTRACT_CODE')).withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Start_Time').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_START_TIME')).renderWith(function (data, type) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
        }));
        vm.dtColumnsContract.push(DTColumnBuilder.newColumn('End_Time').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_END_TIME')).withOption('sWidth', '30px').renderWith(function (data, type) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
        }));
        vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Salary').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_SALARY')).renderWith(function (data, type) {
            var salary = data != "" ? $filter('currency')(data, '', 0) : null;
            return '<span class= "text-danger bold">' + salary + '</span>'
        }));
        vm.dtColumnsContract.push(DTColumnBuilder.newColumn('Insuarance').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_INSUARANCE')).renderWith(function (data, type) {
            var insurance = data != "" ? $filter('currency')(data, '', 0) : null;
            return '<span class= "text-danger bold">' + insurance + '</span>'
        }));
        vm.dtColumnsContract.push(DTColumnBuilder.newColumn("").withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable()
            .renderWith(function (data, type, full, meta) {
                $scope.selected[full.id] = full;
                return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="edit_contract(' + full.id + ')" title="{{&quot;HR_HR_MAN_TITLE_MODIFY_ITEM&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                    '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="delete_contract(' + full.id + ')" title="{{&quot;HR_HR_MAN_TITLE_DEL_ITEM&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
            }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
        vm.reloadDataContract = reloadDataContract;
        vm.dt.dtInstanceContract = {};
        function reloadDataContract(resetPaging) {
            vm.dt.dtInstanceContract.reloadData(callbackContract, resetPaging);
        }
        function callbackContract(json) {

        }
        $scope.add_contract = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderHrEmployee + '/add_contract.html',
                controller: 'add_contract',
                backdrop: 'static',
                size: '70'
            });
            modalInstance.result.then(function (d) {
                reloadDataContract(true);

                $scope.model.Salary = d;
            }, function () {

            });
        }
        $scope.edit_contract = function (id) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderHrEmployee + '/edit_contract.html',
                controller: 'edit_contract',
                backdrop: 'static',
                size: '70',
                resolve: {
                    para: function () {
                        return id;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadDataContract(true);

                $scope.model.Salary = d;
            }, function () {
            });
        }
        $scope.delete_contract = function (id) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                    $scope.ok = function () {
                        dataserviceHrEmployee.delete_HD(id, function (rs) {
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
                reloadDataContract(true);
            }, function () {
            });
        }
        $scope.getObjectFile = function (path) {
            dataserviceHrEmployee.getPathFile(path);
        }

        //bảng  quá trình làm việc
        $scope.workprocess = {
            Salary_Ratio: 0.0
        };
        var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllWorkprocess(selectAll, selected)"/><span></span></label>';
        vm.dtOptionsWorkprocess = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: "/Admin/HREmployee/JTableQTLV",
                beforeSend: function (jqXHR, settings) {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                type: 'POST',
                data: function (d) {
                    d.EmployeeId = para;
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                    heightTableManual(262, "#tblDataWorkprocess");
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
                //contextScope.contextMenu = $scope.contextMenu7;
                $compile(angular.element(row))($scope);
                //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            });
        vm.dtColumnsWorkprocess = [];
        vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn('Start_Time1').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_START_TIME1')).renderWith(function (data, type) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
        }));
        vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn('End_Date1').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_END_DATE1')).renderWith(function (data, type) {
            //return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
            return data;
        }));
        vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn('Wage_Level').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_WAGE_LEVEL')).renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn('Salary_Ratio').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_SALARY_RATIO')).renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsWorkprocess.push(DTColumnBuilder.newColumn("null").withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable()
            .renderWith(function (data, type, full, meta) {
                $scope.selected[full.id_qt] = full;
                return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="editWorkprocess(selected[' + full.id_qt + '])" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_PROCESS&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                    '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="deleteWorkprocess(selected[' + full.id_qt + '])" title=" {{&quot;HR_HR_MAN_TITLE_DEL_PROCESS&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
            }));
        vm.reloadDataWorkprocess = reloadDataWorkprocess;
        vm.dt.dtInstanceWorkprocess = {};
        function reloadDataWorkprocess(resetPaging) {
            vm.dt.dtInstanceWorkprocess.reloadData(callbackWorkprocess, resetPaging);
        }
        function callbackWorkprocess(json) {

        }
        function resetInputWorkprocess() {
            $scope.workprocess.Wage_Level = null;
            $scope.workprocess.Salary_Ratio = null;
            $scope.workprocess.Description1 = null;
            $scope.workprocess.End_Date1 = null;
            $scope.workprocess.Start_Time1 = null;
            $scope.workprocess.id_qt = null;
            resetValidateTimeWorkprocess();
        }
        $scope.reloadWorkprocess = function () {
            reloadDataWorkprocess(true);
        }
        $scope.enableeditqtlv = false;
        $scope.enableaddqtlv = true;
        $scope.editWorkprocess = function (selected) {
            $scope.enableeditqtlv = true;
            $scope.enableaddqtlv = false;
            dataserviceHrEmployee.getItemQTLV(selected.id_qt, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.workprocess = rs.Object;
                    if ($scope.workprocess.End_Date1 == null) {
                        $scope.isNow = true;
                        $scope.disabledEndate = true;
                        var data = new Date();
                        $scope.workprocess.End_Date1 = $filter('date')(new Date(data), 'dd/MM/yyyy')
                    } else {
                        $scope.isNow = false;
                        $scope.disabledEndate = false;
                    }
                }
            });
        }
        $scope.deleteWorkprocess = function (selected) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                    $scope.ok = function () {
                        dataserviceHrEmployee.deleteQTLV(selected.id_qt, function (rs) {
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
                $scope.reloadWorkprocess();
            }, function () {
            });
        }
        $scope.submitQTLV = function () {
            if ($scope.form.addformqtlv.validate()) {
                $scope.workprocess.Salary_Ratio = parseFloat($scope.workprocess.Salary_Ratio);
                $scope.workprocess.flag = 1;
                $scope.workprocess.id_qt = 0;
                debugger
                dataserviceHrEmployee.insertQTLV($scope.workprocess, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadWorkprocess();
                        resetInputWorkprocess();
                    }
                });
            }
        }
        $scope.editQTLV = function () {
            if ($scope.form.addformqtlv.validate()) {

                dataserviceHrEmployee.updateQTLV($scope.workprocess, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadWorkprocess();
                        resetInputWorkprocess();
                    }
                    $scope.enableeditqtlv = false;
                    $scope.enableaddqtlv = true;
                });
            }
        }

        //disable
        $scope.isNow = false;
        $scope.disabledEndate = false;
        $scope.disabledIsNow = false;
        $scope.toNow = function (isNow) {
            $scope.isNow = isNow;
            if (isNow) {
                $scope.disabledEndate = true;
                $scope.workprocess.End_Date1 = "";
            } else {
                $scope.disabledEndate = false;
            }
        }

        function loadDateWorkprocess() {
            $("#Start_Time_Workprocess").datepicker({
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('#End_Time_Workprocess').datepicker('setStartDate', maxDate);
                //if ($('#Start_Time_Workprocess').valid()) {
                //    $('#Start_Time_Workprocess').removeClass('invalid').addClass('success');
                //}
            });
            $("#End_Time_Workprocess").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('#Start_Time_Workprocess').datepicker('setEndDate', maxDate);
                //if ($('#End_Time_Workprocess').valid()) {
                //    $('#End_Time_Workprocess').removeClass('invalid').addClass('success');
                //}
            });
        }
        function resetValidateTimeWorkprocess() {
            $('#Start_Time_Workprocess').datepicker('setEndDate', null);
            $('#End_Time_Workprocess').datepicker('setStartDate', null);
        }
        setTimeout(function () {
            loadDateWorkprocess();
        }, 200);


        //bảng  bằng cấp chứng chỉ
        $scope.certificate = {};
        var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAllCertificate(selectAll, selected)"/><span></span></label>';
        vm.dtOptionsCertificate = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: "/Admin/HREmployee/JTableBCCC",
                beforeSend: function (jqXHR, settings) {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                type: 'POST',
                data: function (d) {
                    d.EmployeeId = para;
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                    heightTableManual(362, "#tblDataCertificate");
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
                $compile(angular.element(row))($scope);
            });
        vm.dtColumnsCertificate = [];
        vm.dtColumnsCertificate.push(DTColumnBuilder.newColumn("id_bccc").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_bccc] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id_bccc + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sClass', 'hidden'));
        vm.dtColumnsCertificate.push(DTColumnBuilder.newColumn('Education_Name').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_EDUCATION_NAME')).withOption('sWidth', '30px').renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsCertificate.push(DTColumnBuilder.newColumn('Result').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_RESULT')).renderWith(function (data, type) {
            return data;
        }));

        vm.dtColumnsCertificate.push(DTColumnBuilder.newColumn("null").withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_ACTION')).notSortable()
            .renderWith(function (data, type, full, meta) {
                $scope.selected[full.id_bccc] = full;
                return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="editCertificate(selected[' + full.id_bccc + '])" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_QUALIFICATION&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                    '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="deleteCertificate(selected[' + full.id_bccc + '])" title=" {{&quot;HR_HR_MAN_TITLE_DEL_QUALIFICATION&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
            }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
        vm.reloadDataCertificate = reloadDataCertificate;
        vm.dt.dtInstanceCertificate = {};
        function reloadDataCertificate(resetPaging) {
            vm.dt.dtInstanceCertificate.reloadData(callbackCertificate, resetPaging);
        }
        function callbackCertificate(json) {

        }
        function resetInputCertificate() {
            $scope.certificate.Education_Name = '';
            $scope.certificate.Start_Time3 = null;
            $scope.certificate.End_Time3 = null;
            $scope.certificate.Result = '';
            $scope.certificate.Certificate_Name = '';
            $scope.certificate.Received_Place = '';
            $scope.certificate.Traing_Place = '';
            $scope.certificate.Info_Details1 = '';
        }
        $scope.reloadCertificate = function () {
            reloadDataCertificate(true);
        }
        $scope.enableeditbccc = false;
        $scope.enableaddbccc = true;
        $scope.viewFile = function (id) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolderHrEmployee + '/viewFile.html',
                controller: 'viewFile',
                backdrop: true,
                size: '40',
                resolve: {
                    para: function () {
                        return id;
                    }
                }
            });
        }
        $scope.editCertificate = function (selected) {
            $scope.enableeditbccc = true;
            $scope.enableaddbccc = false;
            dataserviceHrEmployee.getItemBCCC(selected.id_bccc, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.certificate = rs[0];
                    setTimeout(function () {
                        loadDateCertificate();
                        validateDefault(rs[0].Start_Time3, rs[0].End_Time3);
                    }, 300);
                }
            });
        }
        $scope.deleteCertificate = function (selected) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                    $scope.ok = function () {
                        dataserviceHrEmployee.deleteBCCC(selected.id_bccc, function (rs) {
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
                $scope.reloadCertificate();
            }, function () {
            });
        }
        $scope.submitBCCC = function () {
            if ($scope.form.addformBC.validate()) {
                dataserviceHrEmployee.insertBCCC($scope.certificate, function (rs) {
                    rs = rs.data;
                    if (rs.error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadCertificate();
                        resetInputCertificate();
                    }
                });
            }

        }

        $scope.editBCCC = function () {
            if ($scope.form.addformBC.validate()) {
                dataserviceHrEmployee.updateBCCC($scope.certificate, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadCertificate();
                        resetInputCertificate();
                        $scope.enableeditbccc = false;
                        $scope.enableaddbccc = true;
                    }
                });
            }
        }
        function loadDateCertificate() {
            $("#certificateStart").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('#certificateEnd').datepicker('setStartDate', maxDate);
            }).keyup(function (e) {
                if (e.keyCode == 8 || e.keyCode == 46) {
                    $('#certificateEnd').datepicker('setStartDate', null);
                }
            });
            $("#certificateEnd").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('#certificateStart').datepicker('setEndDate', maxDate);
            }).keyup(function (e) {
                if (e.keyCode == 8 || e.keyCode == 46) {
                    $('#certificateStart').datepicker('setEndDate', null);
                }
            });;
        }
        function validateDefault(from, to) {
            setStartDate("#certificateEnd", from);
            setEndDate("#certificateStart", to);
        }
        setTimeout(function () {
            loadDateCertificate();
        }, 50);

        //bảng  quy trình công việc
        $scope.workflow = {};
        var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
        vm.dtOptionsWorkflow = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: "/Admin/HREmployee/JTableQTCV",
                beforeSend: function (jqXHR, settings) {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                type: 'POST',
                data: function (d) {
                    d.EmployeeId = para;
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                    heightTableManual(247, "#tblDataWorkflow");
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
                contextScope.contextMenu = $scope.contextMenu2;
                $compile(angular.element(row))($scope);
                $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            });
        vm.dtColumnsWorkflow = [];
        vm.dtColumnsWorkflow.push(DTColumnBuilder.newColumn('Name_Job').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_NAME_JOB')).withOption('sWidth', '30px').renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsWorkflow.push(DTColumnBuilder.newColumn('Working_Process').withTitle($translate('HR_HR_MAN_LIST_COL_HR_MAN_WORKING_PROCESS')).renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumnsWorkflow.push(DTColumnBuilder.newColumn("id_cv").withTitle($translate('COM_LIST_COL_ACTION')).notSortable()
            .renderWith(function (data, type, full, meta) {
                $scope.selected[full.id_cv] = full;
                return '<a class1="btn btn-icon-only btn-circle btn-outline blue" style1="width: 25px; height: 25px; padding: 0px" ng-click="edit_cv(selected[' + full.id_cv + '])" title="{{&quot;HR_HR_MAN_TITLE_UPDATE_PROCESS1&quot; | translate}}"><i class="fas fa-edit fs25 pr10"></i></a>' +
                    '<a class1="btn btn-icon-only btn-circle btn-outline red" style1="width: 25px; height: 25px; padding: 0px" ng-click="delete_cv(selected[' + full.id_cv + '])" title=" {{&quot;HR_HR_MAN_TITLE_DEL_PROCESS1&quot; | translate}}"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
            }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
        vm.reloadDataWorkflow = reloadDataWorkflow;
        vm.dt.dtInstanceWorkflow = {};
        function reloadDataWorkflow(resetPaging) {
            vm.dt.dtInstanceWorkflow.reloadData(callbackWorkflow, resetPaging);
        }
        function callbackWorkflow(json) {

        }
        function resetInputWorkflow() {
            $scope.workflow.Name_Job = '';
            $scope.workflow.Working_Process = '';
            $scope.workflow.Description2 = '';
            $scope.workflow.Info_Details = '';
        }
        $scope.reloadWorkflow = function () {
            reloadDataWorkflow(true);
        }
        $scope.reloadNoResetPageWorkflow = function () {
            reloadDataWorkflow(false);
        }
        $scope.enableeditqtcv = false;
        $scope.enableaddqtcv = true;
        $scope.edit_cv = function (selected) {
            $scope.enableeditqtcv = true;
            $scope.enableaddqtcv = false;
            dataserviceHrEmployee.getItemQTCV(selected.id_cv, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.workflow = rs[0];
                }
            });
        }
        $scope.delete_cv = function (selected) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                    $scope.ok = function () {
                        dataserviceHrEmployee.deleteQTCV(selected.id_cv, function (rs) {
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
                $scope.reloadNoResetPageWorkflow();
            }, function () {
            });
        }
        $scope.submitQTCV = function () {
            if ($scope.form.addformQTCV1.validate()) {
                dataserviceHrEmployee.insertQTCV($scope.workflow, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadWorkflow();
                        resetInputWorkflow();
                    }
                });
            }

        }
        $scope.editQTCV = function () {
            if ($scope.form.addformQTCV1.validate()) {
                dataserviceHrEmployee.updateQTCV($scope.workflow, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $scope.reloadNoResetPageWorkflow();
                        resetInputWorkflow();
                        $scope.enableeditqtcv = false;
                        $scope.enableaddqtcv = true;
                    }
                });
            }
        }

        //Department
        var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
        vm.dtOptionsDepartment = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: "/Admin/HrEmployee/JTableDepartment",
                beforeSend: function (jqXHR, settings) {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                type: 'POST',
                data: function (d) {
                    d.Id = para;
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                    heightTableManual(250, "#tblDataDepartment");
                }
            })
            .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
            .withDataProp('data').withDisplayLength(5)
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
                $compile(angular.element(row))($scope);
                $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            });
        vm.dtColumnsDepartment = [];
        vm.dtColumnsDepartment.push(DTColumnBuilder.newColumn('DepartmentTitle').withTitle($translate('HR_HR_MAN_CURD_LBL_HR_MAN_DEPARTMENT')).renderWith(function (data, type, full) {
            return data;
        }));
        vm.dtColumnsDepartment.push(DTColumnBuilder.newColumn('Role').withTitle($translate('HR_HR_LIST_COL_ROLE')).renderWith(function (data, type, full) {
            return data;
        }));
        vm.reloadDataDepartment = reloadDataDepartment;
        vm.dt.dtInstanceDepartment = {};
        function reloadDataDepartment(resetPaging) {
            vm.dt.dtInstanceDepartment.reloadData(callbackDepartment, resetPaging);
        }
        function callbackDepartment(json) {

        }

        //Group
        var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
        vm.dtOptionsGroup = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: "/Admin/HrEmployee/JTableGroup",
                beforeSend: function (jqXHR, settings) {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                type: 'POST',
                data: function (d) {
                    d.Id = para;
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                    heightTableManual(250, "#tblDataGroup");
                }
            })
            .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
            .withDataProp('data').withDisplayLength(5)
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
                $compile(angular.element(row))($scope);
                $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            });
        vm.dtColumnsGroup = [];
        vm.dtColumnsGroup.push(DTColumnBuilder.newColumn('GroupTitle').withTitle($translate('HR_HR_TABLE_NAME_GROUP')).renderWith(function (data, type, full) {
            return data;
        }));
        vm.dtColumnsGroup.push(DTColumnBuilder.newColumn('Role').withTitle($translate('HR_HR_LIST_COL_ROLE')).renderWith(function (data, type, full) {
            return data;
        }));
        vm.reloadDataGroup = reloadDataGroup;
        vm.dt.dtInstanceGroup = {};
        function reloadDataGroup(resetPaging) {
            vm.dt.dtInstanceGroup.reloadData(callbackGroup, resetPaging);
        }
        function callbackGroup(json) {

        }

        //Show, hide header employee
        $scope.isShowHeader = true;
        $scope.showHeaderCard = function () {
            $scope.isShowHeader = true;
        }
        $scope.hideHeader = function () {
            $scope.isShowHeader = false;
        }

        //End show, hide header employee
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
});

app.controller('log-status', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceHrEmployee, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        dataserviceHrEmployee.getLogStatusEmployee(para, function (rs) {
            rs = rs.data;
            $scope.lstStatus = rs;
        });
    }
    $scope.initData();
    setTimeout(function () {
        setModalDraggable(".modal-dialog");
    }, 400);
});

app.controller('add_contract', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceHrEmployee) {
    $scope.contract = {
        Id: '',
        Contract_Code: '',
        LaborBook_Code: '',
        Insuarance: '',
        Dates_of_pay: '',
        Place_Work: '',
        Exp_time_work: '',
        Salary_Ratio: '',
        Payment: '',
        Contract_Type: '',
        Work_Content: '',
        Other_Agree: '',
        Signer: '',
        Salary: '',
        Start_Time: '',
        End_Time: '',
        Allowance: '',
        Bonus: '',
        Tools_Work: '',
        Type_Money: '',
        DateOf_LaborBook: '',
        Info_Insuarance: '',
        File: '',
        Info_Contract: '',
        PayScale: '',
    }
    $scope.initData = function () {
        dataserviceHrEmployee.getPayScaleCat(function (rs) {
            rs = rs.data;
            $scope.lstScaleCat = rs;
        });
    }
    $scope.initData();
    $scope.changePayScaleCat = function () {
        if ($scope.contract.PayScale != null) {
            $scope.errorPayScale = false;
            dataserviceHrEmployee.getRangeOfPayScaleCat($scope.contract.PayScale, function (rs) {
                rs = rs.data;
                $scope.lstRange = rs;
                if (rs != null && rs != "" && rs != undefined) {
                    $scope.pull = false;
                }
            });
        } else {
            $scope.pull = true;
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Salary" && $scope.contract.Salary != "") {
            $scope.errorSalary = false;
        }
    }

    $scope.submitHD = function () {
        validationSelect($scope.contract);
        if ($scope.addformhd.validate() && !validationSelect($scope.contract).Status) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile != "") {
                if (extFile != "docx" && extFile != "pdf") {
                    App.toastrError(caption.COM_MSG_FORMAT_DOCX_PDF);
                } else {
                    var fi = document.getElementById('fileContract');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 102400) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#fileContract").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onloadend = function (e) {
                            var data = new FormData();
                            file = fileUpload.files[0];
                            data.append("FileUpload", file);
                            dataserviceHrEmployee.uploadFile(data, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                    return;
                                }
                                else {
                                    $scope.contract.File = '/uploads/files/' + rs.Object;
                                    dataserviceHrEmployee.insert_HD($scope.contract, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                        } else {
                                            App.toastrSuccess(rs.Title);
                                            $uibModalInstance.close($scope.contract.Salary);
                                        }
                                    });
                                }
                            })
                        }
                    }
                }
            }
            else {
                dataserviceHrEmployee.insert_HD($scope.contract, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close($scope.contract.Salary);
                    }
                });
            }
        }
    }

    function loadDate() {
        $("#dates_of_pay").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
            if ($('#datefrom').valid()) {
                $('#datefrom').removeClass('invalid').addClass('success');
            }
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
            if ($('#dateto').valid()) {
                $('#dateto').removeClass('invalid').addClass('success');
            }
        });
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.PayScale == "" || data.PayScale == null || data.PayScale == undefined) {
            $scope.errorPayScale = true;
            mess.Status = true;
        } else {
            $scope.errorPayScale = false;
        }
        if (data.Salary == "" || data.Salary == null || data.Salary == undefined) {
            $scope.errorSalary = true;
            mess.Status = true;
        } else {
            $scope.errorSalary = false;
        }
        return mess;
    };

    setTimeout(function () {
        loadDate();
        //$(".date").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {

        //});
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit_contract', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceHrEmployee, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.fileName = "";

    $scope.initData = function () {
        dataserviceHrEmployee.getItemHD(para, function (rs) {

            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.contract = rs;

                var idxDot = $scope.contract.File.lastIndexOf("/") + 1;
                $scope.fileName = $scope.contract.File.substr(idxDot, $scope.contract.File.length);
                if ($scope.contract.PayScale != null) {
                    dataserviceHrEmployee.getRangeOfPayScaleCat($scope.contract.PayScale, function (rs) {
                        rs = rs.data;
                        $scope.lstRange = rs;
                        if (rs != null && rs != "" && rs != undefined) {
                            $scope.pull = false;
                        }
                    });
                } else {
                    $scope.pull = true;
                }
            }
        });
        dataserviceHrEmployee.getPayScaleCat(function (rs) {
            rs = rs.data;
            $scope.lstScaleCat = rs;
        });
    }
    $scope.initData();
    $scope.submitHD = function () {
        validationSelect($scope.contract);
        if ($scope.editformhd.validate() && !validationSelect($scope.contract).Status) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "docx" && extFile != "pdf") {
                    App.toastrError(caption.COM_MSG_FORMAT_DOCX_PDF);
                } else {
                    var fi = document.getElementById('fileContract');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 15360) {
                        App.toastrError(caption.HR_HR_MAN_CURD_VALIDATE_SIZE_FILE_MAX);
                    } else {
                        var fileUpload = $("#fileContract").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onloadend = function (e) {
                            var data = new FormData();
                            file = fileUpload.files[0];
                            data.append("FileUpload", file);
                            dataserviceHrEmployee.uploadFile(data, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                    return;
                                }
                                else {
                                    $scope.contract.File = '/uploads/files/' + rs.Object;
                                    dataserviceHrEmployee.upload_HD($scope.contract, function (rs) {
                                        rs = rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                        } else {
                                            App.toastrSuccess(rs.Title);
                                            $uibModalInstance.close($scope.contract.Salary);
                                        }
                                    });
                                }
                            })
                        }
                    }
                }
            } else {
                dataserviceHrEmployee.upload_HD($scope.contract, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {

                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close($scope.contract.Salary);
                    }
                });
            }
        }
    }

    $scope.downLoadFileHD = function (url) {
        if (url != "") {
            window.target = "_blank";
            location.href = url;
        }
    }

    $scope.viewfileHD = function (url) {
        if (url != "") {
            var extension = url.substr(url.lastIndexOf('.') + 1);
            var word = ['DOCX', 'DOC'];
            var pdf = ['PDF'];
            var excel = ['XLS', 'XLSX'];
            if (word.indexOf(extension.toUpperCase()) !== -1) {
                window.open('/Admin/Docman#', '_blank');
                dataserviceHrEmployee.viewFileHD(1, url, function (rs) {
                });
            }
            else if (pdf.indexOf(extension.toUpperCase()) !== -1) {
                window.open('/Admin/PDF#', '_blank');
                dataserviceHrEmployee.viewFileHD(1, url, function (rs) {
                });
            }
            else if (excel.indexOf(extension.toUpperCase()) !== -1) {
                window.open('/Admin/Excel#', '_blank');
                dataserviceHrEmployee.viewFileHD(1, url, function (rs) {
                });
            }
            else {
                window.open(source, '_blank');
                dataserviceHrEmployee.viewFileHD(1, url, function (rs) {
                });
            }
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.PayScale == "" || data.PayScale == null || data.PayScale == undefined) {
            $scope.errorPayScale = true;
            mess.Status = true;
        } else {
            $scope.errorPayScale = false;
        }
        if (data.Salary == "" || data.Salary == null || data.Salary == undefined) {
            $scope.errorSalary = true;
            mess.Status = true;
        } else {
            $scope.errorSalary = false;
        }
        return mess;
    };

    function loadDate() {
        $("#dates_of_pay").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
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
    setTimeout(function () {
        loadDate();
        //$(".date").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //});
        setModalDraggable('.modal-dialog');
    }, 200);
});

//commonSetting
app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceHrEmployee, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',
        AssetCode: para.AssetCode,
        Group: para.Group,
        GroupNote: para.GroupNote
    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CommonSetting/JTableDetail/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SettingGroup = para.Group;
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
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.CodeSet = data.CodeSet;
                    $scope.model.ValueSet = data.ValueSet;
                    $scope.model.Type = data.Type;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"HR_HR_MAN_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"HR_HR_MAN_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"HR_HR_MAN_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"HR_HR_MAN_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"HR_HR_MAN_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"HR_HR_MAN_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="{{&quot;HR_HR_MAN_TITLE_DEL&quot; | translate}}" ng-click="delete(' + full.SettingID + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataserviceHrEmployee.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {

        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.HR_HR_MAN_CURD_MSG_SETTING_NOT_BLANK);
        }
        else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        }
        else {
            dataserviceHrEmployee.insertCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.CodeSet == '') {
            App.toastrError(caption.HR_HR_MAN_CURD_MSG_DATA_NOT_BLANK)
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataserviceHrEmployee.updateCommonSetting($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceHrEmployee.deleteCommonSetting(id, function (rs) {
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
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('fileHrEmployee', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceHrEmployee, $filter, $translate, dataserviceSupplier) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        FromDate: '',
        ToDate: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/HrEmployee/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.EmployeeCode = $rootScope.EmployeeCode;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblDataCustomerFile");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle($translate('HR_HR_LIST_COL_TITLE')).renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o" aria-hidden="true"></i>&nbsp;';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o" aria-hidden="true"></i>&nbsp;';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o" aria-hidden="true"></i>&nbsp;';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o" aria-hidden="true"></i>&nbsp;';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>&nbsp;';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o" aria-hidden="true"></i>&nbsp;';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify" aria-hidden="true"></i>&nbsp;';
        }
        return icon + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle($translate('HR_HR_LIST_COL_CATE_NAME')).renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle($translate('HR_HR_MAN_TITLE_VIEW_CONTENT')).notSortable().renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        var typefile = "#";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
            return '<a ng-click="viewExcel(' + full.Id + ', 2' + ')" title="{{&quot; HR_HR_MAN_TITLE_REPAIR &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'Syncfusion';
            return '<a ng-click="viewWord(' + full.Id + ', 2' + ')" title="{{&quot; HR_HR_MAN_TITLE_REPAIR &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            return '<a ng-click="viewPDF(' + full.Id + ', 2' + ')" title="{{&quot; HR_HR_MAN_TITLE_REPAIR &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            return '<a ng-click="tabFileHistory(0)"  title="{{&quot; HR_HR_MAN_TITLE_REPAIR_HISTORY &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
                '<a ng-click="view(' + full.Id + ')" title="{{&quot; HR_HR_MAN_TITLE_REPAIR &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        } else {
            return '<a ng-click="getObjectFile(0)" title="{{&quot; HR_HR_MAN_TITLE_REPAIR &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle($translate('HR_HR_MAN_TITLE_DESCRIBE')).notSortable().renderWith(function (data, type, full) {
        return '<button title="{{&quot;HR_HR_MAN_TITLE_DESCRIBE&quot; | translate}}" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info-circle"></i></button>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle($translate('HR_HR_MAN_LIST_COL_CREATE_TIME')).renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle($translate('HR_HR_LIST_COL_TYPE_FILE')).renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle($translate('COM_LIST_COL_ACTION')).withOption('sClass', 'w75').renderWith(function (data, type, full) {
        if (full.TypeFile == "SHARE") {
            return '<a ng-click="dowload(\'' + full.FileCode + '\')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="{{&quot;HR_HR_MAN_TITLE_DOWLOAD&quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
        } else {
            return '<a title="{{&quot;HR_HR_MAN_TITLE_REPAIR_N&quot; | translate}}" ng-click="edit(\'' + full.FileName + '\',' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr10"></i></a>' +
                '<a ng-click="dowload(\'' + full.FileCode + '\')" style1="width: 25px; height: 25px; padding: 0px" title="{{&quot;HR_HR_MAN_TITLE_DOWLOAD&quot; | translate}} - ' + full.FileName + '" class1="btn btn-icon-only btn-circle btn-outline green"><i class="fas fa-download pt5 fs25 pr10"></i></a>' +
                '<a title="{{&quot;HR_HR_MAN_TITLE_DEL&quot; | translate}}" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
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
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadFile = function () {
        $scope.reload();
    }
    $scope.search = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderCustomer + '/file_search.html',
            windowClass: 'modal-file',
            backdrop: 'static',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.add = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("EmployeeCode", $rootScope.EmployeeCode);
            data.append("IsMore", false);
            dataserviceHrEmployee.insertHrEmployeeFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $scope.reload();
                    debugger
                    $scope.file = undefined;
                }
            });
        }
    }
    $scope.edit = function (fileName, id) {
        dataserviceHrEmployee.getHrEmployeeFile(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                //rs.Object.FileName = fileName;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderHrEmployee + '/file_edit.html',
                    controller: 'fileEditCustomer',
                    windowClass: "modal-file",
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return {
                                data: rs.Object,
                                FileName: fileName
                            };
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    reloadData()
                }, function () { });
            }
        })
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceHrEmployee.deleteHrEmployeeFile(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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
            $scope.reload();
        }, function () {
        });
    }
    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'fileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.viewFile = function (id) {
        //dataserviceHrEmployeeCustomer.getByteFile(id, function (rs) {rs=rs.data;
        //    
        //    var blob = new Blob([rs.Object], { type: "application/msword;charset=utf-8" });
        //    var blobUrl = URL.createObjectURL(blob);
        //    var url = window.encodeURIComponent(blobUrl);
        //    window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
        //})
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //
        //var dt = userModel.Url;
        //dt = dt.replace("\/", "\\");
        //var url1 = "upload\\repository" + dt;
        //url1 = "\\uploads\\repository\\3.THÔNG TIN CHUNG\\mail vib.docx";
        //var url = window.encodeURIComponent(url1);
        //window.open('https://docs.google.com/gview?url=' + "https://facco.s-work.vn" + '' + url + '&embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        //var userModel = {};
        //var listdata = $('#tblDataFile').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}
        //toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/views/admin/edmsRepository/imageViewer.html',
        //        controller: 'contractTabFileImageViewer',
        //        backdrop: 'static',
        //        size: '40',
        //        resolve: {
        //            para: function () {
        //                return myBase64;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //    }, function () {
        //    });
        //});
    }
    $scope.dowload = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.extend = function (id) {
        //dataserviceHrEmployee.getSuggestionsHrEmployeeFile($rootScope.EmployeeCode, function (rs) {
        //    rs = rs.data;
        //    var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.EmployeeCode, ObjectType: 'EMPLOYEE' };
        //    var modalInstance = $uibModal.open({
        //        templateUrl: ctxfolderRepository + '/addFile.html',
        //        controller: 'addFile',
        //        windowClass: 'modal-file',
        //        backdrop: 'static',
        //        size: '60',
        //        resolve: {
        //            para: function () {
        //                return data;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //        reloadData();
        //    }, function () { });
        //})

        dataserviceSupplier.getDefaultRepo($rootScope.EmployeeCode, 'EMPLOYEE', function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.EmployeeCode, ObjectType: 'EMPLOYEE' };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderSupplier + '/addFile.html',
                controller: 'setupRepoDefault',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                reloadData();
            }, function () { });
        })
    }
    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    }
    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceHrEmployee.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return null;
                }
            });
        }
    };
    $scope.viewExcel = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceHrEmployee.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/Excel#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/Excel#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.HR_HR_FILE_SIZE_LIMIT);
            }

        }
    };
    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceHrEmployee.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/Docman#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/Docman#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.HR_HR_FILE_SIZE_LIMIT);
            }
        }
    };
    $scope.viewPDF = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceHrEmployee.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            setTimeout(function () {
                                window.open('/Admin/PDF#', '_blank');
                            }, 2000);
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        window.open('/Admin/PDF#', '_blank');
                    }
                });
            } else {
                App.toastrError(caption.HR_HR_FILE_SIZE_LIMIT);
            }
        }
    };
    $scope.view = function (id) {

        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataCustomerFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceHrEmployee.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        window.open(rs.Object, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    } else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
        else {
            dataserviceHrEmployee.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {

                        var url = window.location.origin + '/' + rs.Object;
                        window.open(url, '_blank')
                        //$scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                    }
                    else
                        $scope.openViewer(rs.Object, isImage);
                    //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                }
                else {

                }
            });
        }
    }
    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderHrEmployee + '/viewer.html',
            controller: 'viewer',
            backdrop: 'false',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
    }
    $scope.share = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFileShare + '/fileShare.html',
            controller: 'fileShareCustomer',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }
    $scope.extension = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRepository + '/extension.html',
            controller: 'extension',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Type: 'LIST',
                        Object: item
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };
    function loadDate() {
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('viewer', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, para, $sce) {

    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
    console.log($scope.currentProjectUrl);
    console.log(data);
});

app.controller('fileAddCustomer', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceHrEmployee, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.CatCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (data.FolderId == '' || data.FolderId == null) {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (full.FolderId == '' || full.FolderId == null) {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            } else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }

            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').notSortable().withTitle('{{"HR_HR_FORDER_SAVE" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
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
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.loadFile = function (event) {

        $scope.file = event.target.files[0];
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var itemSelect = [];
            for (var id in $scope.selected) {
                if ($scope.selected.hasOwnProperty(id)) {
                    if ($scope.selected[id]) {
                        itemSelect.push(id);
                    }
                }
            }
            if (itemSelect.length == 0) {
                App.toastrError(caption.HR_HR_MAN_MSG_SELECT_FORDER);
                return;
            } else if (itemSelect.length > 1) {
                App.toastrError(caption.HR_HR_MAN_MSG_SELECT_FORDER);
                return;
            }
            var data = new FormData();
            data.append("CateRepoSettingId", itemSelect.length != 0 ? itemSelect[0] : "");
            data.append("FileUpload", $scope.file);
            data.append("FileName", $scope.file.name);
            data.append("Desc", $scope.model.Desc);
            data.append("Tags", $scope.model.Tags);
            data.append("NumberDocument", $scope.model.NumberDocument);
            data.append("EmployeeCode", $rootScope.EmployeeCode);
            data.append("IsMore", true);
            dataserviceHrEmployee.insertHrEmployeeFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    };

    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceHrEmployee.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: "Tất cả danh mục",//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.CatCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('fileEditCustomer', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataserviceHrEmployee, para) {
    $scope.treeDataCategory = [];
    $scope.catCode = para.data.CateRepoSettingCode;
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: '',
        FileName: ''
    };
    var vm = $scope;
    vm.dt = {};
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRepository/JtableFolderSettingWithCategory",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CatCode = $scope.catCode;
                $scope.selected = [];
            },
            complete: function () {
                App.unblockUI("#contentMain");
                $(".dataTables_scrollBody").addClass('scroller-sm-fade');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('scrollY', "340px")
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
            if (para.Path != null && para.Path != "") {
                if (para.Path == data.Path) {
                    angular.element(row).addClass('selected');
                }
            } else {
                if (para.FolderId == data.FolderId) {
                    angular.element(row).addClass('selected');
                }
            }
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                    }
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            if (para.Path != null && para.Path != "") {
                if (para.Path == full.Path) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            else {
                if (para.FolderId == full.FolderId) {
                    $scope.selected[full.Id] = true;
                } else {
                    $scope.selected[full.Id] = false;
                }
            }
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected,$event,' + full.Id + ')"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withOption('sClass', '').withTitle('{{"HR_HR_FORDER" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="jstree-icon jstree-themeicon fa fa-folder icon-state-warning jstree-themeicon-custom" aria-hidden="true"></i>&nbsp;' + data;
    }));
    vm.reloadData = reloadData;
    vm.dt.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dt.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {
        if (selectAll)
            $('#tblDataDetailRepository').DataTable().$('tr:not(.selected)').addClass('selected');
        else
            $('#tblDataDetailRepository').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems, evt, itemId) {
        $('#tblDataFolder').DataTable().$('tr.selected').removeClass('selected');
        for (var id in selectedItems) {
            if (id != itemId) {
                selectedItems[id] = false;
            } else {
                if (selectedItems[id]) {
                    $(evt.target).closest('tr').toggleClass('selected');
                }
            }
        }
    }

    $scope.init = function () {
        $scope.model.FileName = para.FileName;
        $scope.model.NumberDocument = para.data.NumberDocument;
        $scope.model.Tags = (para.data.Tags != '' && para.data.Tags != null) ? para.data.Tags.split(',') : [];
        $scope.model.Desc = para.data.Desc;
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        var itemSelect = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    itemSelect.push(id);
                }
            }
        }
        if (itemSelect.length == 0) {
            App.toastrError(caption.HR_HR_MAN_MSG_SELECT_FORDER);
        } else if (itemSelect.length > 1) {
            App.toastrError(caption.HR_HR_MAN_MSG_SELECT_FORDER);
        } else {
            if ($scope.editformfile.validate()) {
                var data = new FormData();
                data.append("CateRepoSettingId", itemSelect[0]);
                data.append("FileCode", para.data.FileCode);
                data.append("Desc", $scope.model.Desc);
                data.append("Tags", $scope.model.Tags);
                data.append("NumberDocument", $scope.model.NumberDocument);
                data.append("EmployeeCode", $rootScope.EmployeeCode);
                dataserviceHrEmployee.updateHrEmployeeFile(data, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    };
    //treeview
    $scope.ctr = {};
    $scope.readyCB = function () {
        if ($scope.treeDataCategory.length == 0) {
            App.blockUI({
                target: "#contentMainRepository",
                boxed: true,
                message: 'loading...'
            });
            dataserviceHrEmployee.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: "Tất cả danh mục",//"Tất cả kho dữ liệu"
                        state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                    }
                    $scope.treeDataCategory.push(root);
                    var index = 0;
                    $scope.ListParent = result.filter(function (item) {
                        return (item.ParentCode == '#');
                    });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].ParentCode == '#') {
                            var stt = $scope.ListParent.length - index;
                            if (stt.toString().length == 1) {
                                stt = "0" + stt;
                            }
                            index = index + 1;
                            var data = {
                                id: result[i].Code,
                                parent: 'root',
                                text: stt + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.data.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        } else {
                            var data = {
                                id: result[i].Code,
                                parent: result[i].ParentCode,
                                text: result[i].Code + ' - ' + result[i].Title,
                                catId: result[i].Id,
                                catCode: result[i].Code,
                                catName: result[i].Title,
                                catParent: result[i].ParentCode,
                                listRepository: result[i].ListRepository,
                                state: { selected: result[i].Code == para.data.CateRepoSettingCode ? true : false, opened: true }
                            }
                            $scope.treeDataCategory.push(data);
                        }
                    }
                    App.unblockUI("#contentMainRepository");
                    console.log($scope.treeDataCategory);
                }
            });
        }
    }
    $scope.selectNodeCategory = function () {
        var listNoteSelect = $scope.ctr.treeInstance.jstree(true).get_checked(true);
        $scope.catCode = listNoteSelect[0].id;
        reloadData(true);
    }
    $scope.deselectNodeCategory = function () {
        $scope.catCode = "";
        reloadData(true);
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'sort'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeCategory,
        'deselect_node': $scope.deselectNodeCategory,
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        //setModalMaxHeight('.modal-file');
    }, 200);
});

app.controller('showLog', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $uibModalInstance, $timeout, para) {
    var data = JSON.parse(para);
    //var data = para;
    $scope.obj = { data: data, options: { mode: 'code' } };
    //$scope.onLoad = function (instance) {
    //    instance.expandAll();
    //};

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 1);
});

app.controller('manageNotWork', function ($scope, $rootScope, $compile, dataserviceHrEmployee, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $filter, $translate, myService) {
    console.log($scope.model);
    $scope.modelNwiy = {
        NumNotWorkAllow: 0,
        Year: ''
    }
    $scope.addNotWork = function () {
        if ($scope.model.Id <= 0) {
            return App.toastrError(caption.HR_HR_MAN_EMPLOYEE_NOT_EXIST);
        }
        if ($scope.form.addformNotWorkInYear.validate()) {
            var obj = {
                Code: generateUUID(),
                NumNotWorkAllow: $scope.modelNwiy.NumNotWorkAllow,
                Year: $scope.modelNwiy.Year,
            }

            var checkExit = $rootScope.listNotWork.findIndex(function (element) {
                if (element.Year == obj.Year) return true;
            });

            if (checkExit != -1) {
                return App.toastrError(caption.HR_HR_MAN_NUM_WORK_EXIST);
            }
            var listNotWork = angular.copy($rootScope.listNotWork);
            listNotWork.push(obj);

            var dataJSON = JSON.stringify(listNotWork);
            var notWorkData = {
                Id: $scope.model.Id,
                notWorkDay: dataJSON
            }

            dataserviceHrEmployee.updateNotWork(notWorkData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $rootScope.listNotWork.push(obj);
                    $scope.modelNwiy.NumNotWorkAllow = 0;
                    $scope.modelNwiy.Year = '';
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    };

    $scope.deleteNotWork = function (data) {
        if ($rootScope.listNotWork.indexOf(data) == -1) {
            App.toastrError(caption.HR_HR_MAN_NUM_WORK_NOT_EXIST)
        } else {
            var listNotWork = angular.copy($rootScope.listNotWork);
            listNotWork.splice($rootScope.listNotWork.indexOf(data), 1);

            var dataJSON = JSON.stringify(listNotWork);
            var notWorkData = {
                Id: $scope.model.Id,
                notWorkDay: dataJSON
            }

            dataserviceHrEmployee.updateNotWork(notWorkData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    return App.toastrError(rs.Title);
                } else {
                    $rootScope.listNotWork.splice($rootScope.listNotWork.indexOf(data), 1);
                    return App.toastrSuccess(rs.Title);
                }
            });
        }
    };
    function loadDate() {
        $("#notWorkYear").datepicker({
            autoclose: true,
            format: "yyyy",
            fontAwesome: true,
            startView: "years",
            minViewMode: "years"
        }).on('changeDate', function () {
            if ($('#date-birthday .input-date').valid()) {
                $('#date-birthday .input-date').removeClass('invalid').addClass('success');
            }
        });
    };

    setTimeout(function () {
        loadDate();
    }, 200);
})
