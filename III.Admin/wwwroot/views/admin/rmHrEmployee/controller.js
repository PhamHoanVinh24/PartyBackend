var ctxfolder = "/views/admin/RMAdmin/RMHrEmployee";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select']).
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }


    var submitFormUpload1 = function (url, data, callback) {
        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        var formData = new FormData();

        formData.append("Id", data.Id);
        formData.append("fullname", data.fullname !=null ? data.fullname:null);
        formData.append("nickname", data.nickname != null ? data.nickname : null);
        formData.append("gender", data.gender != null ? data.gender : null);
        formData.append("birthday", data.birthday != null ? data.birthday : null);
        formData.append("birthofplace", data.birthofplace != null ? data.birthofplace : null);
        formData.append("permanentresidence", data.permanentresidence != null ? data.permanentresidence : null);
        formData.append("identitycard", data.identitycard != null ? data.identitycard : null);
        formData.append("identitycarddate", data.identitycarddate != null ? data.identitycarddate : null);
        formData.append("identitycardplace", data.identitycardplace != null ? data.identitycardplace : null);
        formData.append("unit", data.unit != null ? data.unit : null);
        formData.append("position", data.position != null ? data.position : null);
        formData.append("employeekind", data.employeekind != null ? data.employeekind : null);
        formData.append("nationlaty", data.nationlaty != null ? data.nationlaty : null);
        formData.append("employeetype", data.employeetype != null ? data.employeetype : null);
        formData.append("employeegroup", data.employeegroup != null ? data.employeegroup : null);
        formData.append("picture", data.picture != null && data.picture.length > 0 ? data.picture[0] : null);

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }
        $http(req).success(callback);
    }


    var submitFormUpload = function (url, data, callback) {

        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        var formData = new FormData();

        formData.append("Id", data.Id);
        formData.append("fullname", data.fullname != null ? data.fullname:null);
        formData.append("nickname", data.nickname != null ? data.nickname : null);
        formData.append("gender", data.gender != null ? data.gender : null);
        formData.append("nation", data.nation != null ? data.nation : null);   
        formData.append("factiondate", data.factiondate != null ? data.factiondate : null);  
        formData.append("religion", data.religion != null ? data.religion : null);
        formData.append("birthday", data.birthday != null ? data.birthday : null);
        formData.append("birthofplace", data.birthofplace != null ? data.birthofplace : null);
        formData.append("languagelevel", data.languagelevel != null ? data.languagelevel : null);     
        formData.append("permanentresidence", data.permanentresidence != null ? data.permanentresidence : null);
        formData.append("phone", data.phone != null ? data.phone : null);  
        formData.append("factiondate", data.factiondate != null ? data.factiondate : null);
        formData.append("educationallevel", data.educationallevel != null ? data.educationallevel : null);
        formData.append("health", data.health != null ? data.health : null);
        formData.append("identitycard", data.identitycard != null ? data.identitycard : null);
        formData.append("identitycarddate", data.identitycarddate != null ? data.identitycarddate : null);  
        formData.append("identitycardplace", data.identitycardplace != null ? data.identitycardplace : null);
        formData.append("socialinsurance", data.socialinsurance != null ? data.socialinsurance : null);
        formData.append("socialinsurancedate", data.socialinsurancedate != null ? data.socialinsurancedate : null);
        formData.append("socialinsuranceplace", data.socialinsuranceplace != null ? data.socialinsuranceplace : null);
        formData.append("identification", data.identification != null ? data.identification : null); 
        formData.append("unit", data.unit != null ? data.unit : null);
        formData.append("wage", data.wage != null ? data.wage : null);
        formData.append("salarytype", data.salarytype != null ? data.salarytype : null);
        formData.append("salarygroup", data.salarygroup != null ? data.salarygroup : null);
        formData.append("salaryfactor", data.salaryfactor != null ? data.salaryfactor : null); 
        formData.append("trainingschool", data.trainingschool != null ? data.trainingschool : null);
        formData.append("trainingtime", data.trainingtime != null ? data.trainingtime : null);
        formData.append("trainingtype", data.trainingtype != null ? data.trainingtype : null);
        formData.append("disciplines", data.disciplines != null ? data.disciplines : null);
        formData.append("specialized", data.specialized != null ? data.specialized : null); 
        formData.append("taxcode", data.taxcode != null ? data.taxcode : null);
        formData.append("position", data.position != null ? data.position : null);
        formData.append("employeekind", data.employeekind != null ? data.employeekind : null);
        formData.append("emailuser", data.emailuser != null ? data.emailuser : null);
        formData.append("emailpassword", data.emailpassword != null ? data.emailpassword : null); 
        formData.append("nationlaty", data.nationlaty != null ? data.nationlaty : null);
        formData.append("status", data.status != null ? data.status : null);
        formData.append("employeetype", data.employeetype != null ? data.employeetype : null);
        formData.append("bank", data.bank != null ? data.bank : null);
        formData.append("accountholder", data.accountholder != null ? data.accountholder : null); 
        formData.append("accountopenplace", data.accountopenplace != null ? data.accountopenplace : null);
        formData.append("accountnumber", data.accountnumber != null ? data.accountnumber : null);
        formData.append("maritalstatus", data.maritalstatus != null ? data.maritalstatus : null);
        formData.append("computerskill", data.computerskill != null ? data.computerskill : null);
        formData.append("employeegroup", data.employeegroup != null ? data.employeegroup : null); 
        formData.append("language", data.language != null ? data.language : null);
        formData.append("picture", data.picture != null && data.picture.length > 0 ? data.picture[0] : null);
       
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }
        $http(req).success(callback);
    };


    var submitFormUploadHD = function (url, data, callback) {
        debugger
        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        var formData = new FormData();

        formData.append("id", data.id);
        formData.append("Insuarance", data.Insuarance != null ? data.Insuarance : null);
        formData.append("Dates_of_pay", data.Dates_of_pay != null ? data.Dates_of_pay : null);
        formData.append("Place_Work", data.Place_Work != null ? data.Place_Work : null);
        formData.append("Exp_time_work", data.Exp_time_work != null ? data.Exp_time_work : null);
        formData.append("Salary_Ratio", data.Salary_Ratio != null ? data.Salary_Ratio : null);
        formData.append("Payment", data.Payment != null ? data.Payment : null);
        formData.append("Contract_Type", data.Contract_Type != null ? data.Contract_Type : null);
        formData.append("Signer_Id", data.Signer_Id != null ? data.Signer_Id : null);
        formData.append("Salary", data.Salary != null ? data.Salary : null);
        formData.append("Start_Time", data.Start_Time != null ? data.Start_Time : null);
        formData.append("End_Time", data.End_Time != null ? data.End_Time : null);
        formData.append("DateOf_LaborBook", data.DateOf_LaborBook != null ? data.DateOf_LaborBook : null);
        formData.append("Place_LaborBook", data.Place_LaborBook != null ? data.Place_LaborBook : null);
        formData.append("Work_Content", data.Work_Content != null ? data.Work_Content : null);
        formData.append("Allowance", data.Allowance != null ? data.Allowance : null);
        formData.append("Contract_Code", data.Contract_Code != null ? data.Contract_Code : null);
        formData.append("LaborBook_Code", data.LaborBook_Code != null ? data.LaborBook_Code : null);
        formData.append("Other_Agree", data.Other_Agree != null ? data.Other_Agree : null);
        formData.append("Info_Insuarance", data.Info_Insuarance != null ? data.Info_Insuarance : null);
        formData.append("Info_Contract", data.Info_Contract != null ? data.Info_Contract : null);
        formData.append("Bonus", data.Bonus != null ? data.Bonus : null);
        formData.append("Tools_Work", data.Tools_Work != null ? data.Tools_Work : null);
        formData.append("Active", data.Active != null ? data.Active : null);
        formData.append("Type_Money", data.Type_Money != null ? data.Type_Money : null);
        formData.append("Value_time_work", data.Value_time_work != null ? data.Value_time_work : null);
        formData.append("Type_Money", data.Type_Money != null ? data.Type_Money : null);
  
        formData.append("File", data.File != null && data.File.length > 0 ? data.File[0] : null);

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }
        $http(req).success(callback);
    };


    return {
        insert: function (data, callback) {
            submitFormUpload1('/Admin/RMHrEmployee/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/RMHrEmployee/Update', data, callback);
        },

        gettreedataunit: function (callback) {
            $http.post('/Admin/RMHrEmployee/gettreedataunit').success(callback);
        },

         getItem: function (data, callback) {
             $http.get('/Admin/RMHrEmployee/GetItem/' + data).success(callback);
        },

        deleteItems: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/DeleteItems', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/Delete/' + data).success(callback);
        }, 
        getItemT: function (data, callback) {
            $http.get('/Admin/RMHrEmployee/GetItemT/' + data).success(callback);
        },



        insertDC: function (data, callback) {
              $http.post('/Admin/RMHrEmployee/insertDC', data).success(callback);
        },
        updateDC: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/updateDC', data).success(callback);
        },
        deleteItemsDC: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteItemsDC', data).success(callback);
        },
        deleteDC: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteDC/' + data).success(callback);
        },
        getItemDC: function (data, callback) {
            $http.get('/Admin/RMHrEmployee/getitemDC/' + data).success(callback);
        },

          insertLH: function (data, callback) {
              $http.post('/Admin/RMHrEmployee/insertLH', data).success(callback);
        },
        updateLH: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/updateLH', data).success(callback);
        },
        deleteItemsLH: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteItemsLH', data).success(callback);
        },
        deleteLH: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteLH/' + data).success(callback);
        },
        getItemLH: function (data, callback) {
            $http.get('/Admin/RMHrEmployee/getitemLH/' + data).success(callback);
        },

        insertQTLV: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/insertQTLV', data).success(callback);
        },
        updateQTLV: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/updateQTLV', data).success(callback);
        },
        deleteItemsQTLV: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteItemsQTLV', data).success(callback);
        },
        deleteQTLV: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteQTLV/' + data).success(callback);
        },
        getItemQTLV: function (data, callback) {
            $http.get('/Admin/RMHrEmployee/getitemQTLV/' + data).success(callback);
        },
        insertQTCV: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/insertQTCV', data).success(callback);
        },
        updateQTCV: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/updateQTCV', data).success(callback);
        },
        deleteItemsQTCV: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteItemsQTCV', data).success(callback);
        },
        deleteQTCV: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteQTCV/' + data).success(callback);
        },
        getItemQTCV: function (data, callback) {
            $http.get('/Admin/RMHrEmployee/getitemQTCV/' + data).success(callback);
        },



         insertBCCC: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/insertBCCC', data).success(callback);
        },
        updateBCCC: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/updateBCCC', data).success(callback);
        },
        deleteItemsBCCC: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteItemsBCCC', data).success(callback);
        },
        deleteBCCC: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/deleteBCCC/' + data).success(callback);
        },
        getItemBCCC: function (data, callback) {
            $http.get('/Admin/RMHrEmployee/getitemBCCC/' + data).success(callback);
        },



         insert_HD: function (data, callback) {
             submitFormUploadHD('/Admin/RMHrEmployee/InsertHD', data, callback);
        },
        upload_HD: function (data, callback) {
            submitFormUploadHD('/Admin/RMHrEmployee/UpdateHD', data, callback);
        },
        getItemHD: function (data, callback) {
            $http.get('/Admin/RMHrEmployee/GetItemHD/' + data).success(callback);
        },
        deleteItems_HD: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/DeleteItemsHD', data).success(callback);
        },
        delete_HD: function (data, callback) {
            $http.post('/Admin/RMHrEmployee/DeleteHD/' + data).success(callback);
        }



    }
});
app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 401) {
                var url = "/Home/Logout";
                location.href = url;
            }
            return $q.reject(rejection);
        }
    };
}]);
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.validationOptions = {
        rules: {
            fullname: {
                required: true,
                maxlength: 50
            },
            nation: {
                required: true,
                maxlength: 50
            },

            permanentresidence: {
                required: true,
                maxlength: 200
            },
            phone: {
                required: true,
                maxlength: 50
            },
            health: {
                required: true,
                maxlength: 50
            },
            identitycard: {
                required: true,
                maxlength: 12
            },
            socialinsurance: {
                required: true,
                maxlength: 12
            },

            identification: {
                required: true,
                maxlength: 100
            },


            taxcode: {
                required: true,
                maxlength: 50
            },



            bank: {
                required: true,
                maxlength: 100
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
        },
        messages: {
            Permanent_Address: {
                required: "Yêu cầu nhập hộ khẩu thường trú.",
                maxlength: "Hộ khẩu thường trú không vượt quá 250 ký tự."
            },
            Now_Address: {
                required: "Yêu cầu nhập địa chỉ.",
                maxlength: "Địa chỉ không vượt quá 250 ký tự."
            },

            fullname: {
                required: "Yêu cầu nhập họ và tên.",
                maxlength: "Họ tên không vượt quá 50 ký tự."
            },
            nation: {
                required: "Yêu cầu nhập quốc tịch.",
                maxlength: "Quốc tịch không vượt quá 50 ký tự."
            },
            birthday: {
                required: "Yêu cầu nhập ngày sinh.",
                maxlength: "Lỗi nhập ngày sinh."
            },
            permanentresidence: {
                required: "Yêu cầu nhập hộ khẩu thường trú.",
                maxlength: "Hộ khẩu thường trú không vượt quá 200 ký tự."
            },
            phone: {
                required: "Yêu cầu nhập số điện thoại.",
                maxlength: "Số điện thoại không vượt quá 50 ký tự."
            },
            educationallevel: {
                required: "Yêu cầu nhập trình độ văn hóa.",
                maxlength: "Trình độ văn hóa không vượt quá 50 ký tự."
            },
            health: {
                required: "Yêu cầu nhập tình trạng sức khoẻ.",
                maxlength: "Tình trạng sức khoẻ không vượt quá 50 ký tự."
            },
            identitycard: {
                required: "Yêu cầu nhập CMT/Hộ chiếu.",
                maxlength: "CMT/Hộ chiếu không vượt quá 12 ký tự."
            },
            taxcode: {
                required: "Yêu cầu mã số thuế.",
                maxlength: "Lỗi nhập ngày cấp."
            },
            bank: {
                required: "Yêu cầu nhập tài khoản ngân hàng.",
                maxlength: "Tài khoản ngân hàng không vượt quá 100 ký tự."
            },
            accountnumber: {
                required: "Yêu cầu nhập số tài khoản.",
                maxlength: "Số tài khoản không vượt quá 50 ký tự."
            },
           

        }
    }
    $rootScope.validationOptions1 = {
        rules: {
            fullname: {
                required: true,
                maxlength: 50
            },

            permanentresidence: {
                required: true,
                maxlength: 200
            },


            identitycard: {
                required: true,
                maxlength: 12
            },
          
        },
        messages: {
           

            fullname: {
                required: " ",
                maxlength: " "
            },
           
            permanentresidence: {
                required: " ",
                maxlength: " "
            },
            
           
            identitycard: {
                required: " ",
                maxlength: " "
            }
           


        }
    }
    $rootScope.validationOptions2 = {
        rules: {
            fullname: {
                required: true,
                maxlength: 50
            },
            nation: {
                required: true,
                maxlength: 50
            },

            permanentresidence: {
                required: true,
                maxlength: 200
            },
            phone: {
                required: true,
                maxlength: 50
            },
            health: {
                required: true,
                maxlength: 50
            },
            identitycard: {
                required: true,
                maxlength: 12
            },
            socialinsurance: {
                required: true,
                maxlength: 12
            },

            identification: {
                required: true,
                maxlength: 100
            },


            taxcode: {
                required: true,
                maxlength: 50
            },



            bank: {
                required: true,
                maxlength: 100
            },

            accountnumber: {
                required: true,
                maxlength: 50
            },



          
        },
        messages: {
           

            fullname: {
                required: " ",
                maxlength: " "
            },
            nation: {
                required: " ",
                maxlength: " "
            },
            birthday: {
                required: " ",
                maxlength: " "
            },
            permanentresidence: {
                required: " ",
                maxlength: " "
            },
            phone: {
                required: " ",
                maxlength: " "
            },
            educationallevel: {
                required: " ",
                maxlength: " "
            },
            health: {
                required: " ",
                maxlength: " "
            },
            identitycard: {
                required: " ",
                maxlength: " "
            },
            taxcode: {
                required: " ",
                maxlength: " "
            },
            bank: {
                required: " ",
                maxlength: " "
            },
            accountnumber: {
                required: " ",
                maxlength: " "
            },


        }
    }
    $rootScope.validationOptions3 = {
        rules: {
            Name: {
                required: true,
                maxlength: 250
            },
            Relationship: {
                required: true,
                maxlength: 50
            },
        },
        messages: {
            Name: {
                required: " ",
                maxlength: " "
            },
            Relationship: {
                required: " ",
                maxlength: " "
            },
        }
    }
    $rootScope.validationOptions4 = {
        rules: {
            Education_Name: {
                required: true,
                maxlength: 250
            },
            Result: {
                required: true,
                maxlength: 50
            },
        },
        messages: {
            Education_Name: {
                required: " ",
                maxlength: " "
            },
            Result: {
                required: " ",
                maxlength: " "
            },
        }
    }
    $rootScope.validationOptions5 = {
        rules: {
            Start_Time1: {
                required: true,
                maxlength: 250
            },
            End_Date1: {
                required: true,
                maxlength: 50
            },
            Wage_Level: {
                required: true,
                maxlength: 250
            },
            Salary_Ratio: {
                required: true,
                maxlength: 50
            },
        },
        messages: {
            Start_Time1: {
                required: " ",
                maxlength: " "
            },
            End_Date1: {
                required: " ",
                maxlength: " "
            },
            Wage_Level: {
                required: " ",
                maxlength: " "
            },
            Salary_Ratio: {
                required: " ",
                maxlength: " "
            },
        }
    }
    $rootScope.validationOptions6 = {
        rules: {
            Working_Process: {
                required: true,
                maxlength: 250
            }
        },
        messages: {
            Working_Process: {
                required: " ",
                maxlength: " "
            }
        }
    }
    $rootScope.validationOptions7 = {
        rules: {
            Contract_Code: {
                required: true,
                maxlength: 50
            },
            Start_Time: {
                required: true,
                maxlength: 50
            },

            End_Time: {
                required: true,
                maxlength: 200
            },


        },
        messages: {
            Contract_Code: {
                required: "Yêu cầu nhập số hợp đồng.",
                maxlength: "Số hợp đồng không vượt quá 250 ký tự."
            },
            Start_Time: {
                required: "Yêu cầu thời gian bắt đầu.",
                maxlength: "Lỗi nhập giờ."
            },

            End_Time: {
                required: "Yêu cầu nhập thời gian kết thúc.",
                maxlength: "Lỗi nhập giờ."
            },
           


        }
    }
    $rootScope.StatusData = [{
        Value: 1,
        Name: 'Hoạt động'
    }, {
        Value: 0,
        Name: 'Ngừng hoạt động'
    }];

});

app.config(function ($routeProvider, $validatorProvider, $httpProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add_contract/', {
            templateUrl: ctxfolder + '/add_contract.html',
            controller: 'add_contract'
        })
        .when('/edit_contract/:id', {
            templateUrl: ctxfolder + '/edit_contract.html',
            controller: 'edit_contract'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/export/', {
            templateUrl: ctxfolder + '/export.html',
            controller: 'export'
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
    $httpProvider.interceptors.push('httpResponseInterceptor');
});
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {

    var vm = $scope;
    vm.exportData = exportData;
    $scope.selected = {};
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.edit = edit;
    $scope.deleteItem = deleteItem;

    $scope.model = {
        Key: ''
    }
    
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMHrEmployee/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Key = $scope.model.Key;
            },
            complete: function (data) {
                if (data.status === 401) {
                    var url = "/Home/Logout";
                    location.href = url;
                }
                App.unblockUI("#contentMain");
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
            //$(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);

            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('No.').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fullname').withTitle('Họ và tên').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));  
    vm.dtColumns.push(DTColumnBuilder.newColumn('gender').withTitle('Giới tính').renderWith(function (data, type) {
        if (data == 1) {
            return "Nam";
        }
        if (data == 2)
        {
            return "Nữ"
        }       
    })); 
    vm.dtColumns.push(DTColumnBuilder.newColumn('phone').withTitle('Số điện thoại').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('picture').withTitle('Ảnh').renderWith(function (data, type) {
        //return '<img src="' + data + '" class="img-responsive " style="height:40px;width:40px">';
        var dt = '<img style="width:64px; height:64px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' class="img-responsive">';
        console.log(dt);
        return dt;

    }));  
    vm.dtColumns.push(DTColumnBuilder.newColumn("null0").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = full;
            //$scope.addId(full);
            return '<p class="mt-checkbox"><a ng-click="edit(selected[' + full.Id + '])" style="padding-right:10px;" title="Cập nhật thông tin"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deleteItem(selected[' + full.Id + '])"  title="Xóa khoản mục"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
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

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }


    function edit(selected) {
        console.log("hello" + JSON.stringify(selected));
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '70',
            resolve: {
                para: function () {
                    return selected.Id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    function deleteItem(selected) {
        $confirm({ text: 'Bạn có chắc chắn xóa nhân viên: ' + selected.fullname, title: 'Xác nhận', cancel: ' Hủy ' })
            .then(function () {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                dataservice.delete(selected.Id, function (result) {
                    if (result.Error) {
                        App.notifyDanger(result.Title);
                        //alert(result.Title)
                    } else {
                        App.notifyInfo(result.Title);
                        //alert(result.Title)
                        $scope.reload();
                    }
                    App.unblockUI("#contentMain");
                });
            });
    } 
    function exportData() {
        
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/export.html',
            controller: 'export',
            backdrop: true,
            size: '30'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.deleteChecked = function () {
        var deleteItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    deleteItems.push(id);
                }
            }
        }
        if (deleteItems.length > 0) {
            $confirm({ text: 'Bạn có chắc chắn muốn xóa các khoản mục đã chọn?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteItems(deleteItems, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                        } else {
                            App.notifyInfo(result.Title);
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });

                });
        } else {
            App.notifyDanger("Không có khoản mục nào được chọn");
        }
    }

    //$scope.contextMenu = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i> Thông tin chi tiết';
    //    }, function ($itemScope, $event, model) {
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/edit.html',
    //            controller: 'edit',
    //            backdrop: true,
    //            size: '80',
    //            resolve: {
    //                para: function () {
    //                    return $itemScope.data.Id;
    //                }
    //            }
    //        });
    //        modalInstance.result.then(function (d) {
    //            $scope.reload();
    //        }, function () {
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return '<i class="fa fa-remove"></i> Xóa khoản mục';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.Title, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.delete($itemScope.data.Id, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                    } else {
    //                        App.notifyInfo(result.Title);
    //                        $scope.reload();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];

    $scope.search = function () {
        $scope.reload();
    }

});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.gioitinh = [
        { value: "Nam", gender: 1 },
        { value: "Nữ", gender: 2 }
    ];

    $scope.tinhtranglamviec = [
        { value: "Đang làm việc", disciplines: "1" },
        { value: "Đang nghỉ phép", disciplines: "2" },
         { value: "Đã nghỉ việc", disciplines: "3" }
    ];
    $scope.loaihinhnhanvien = [
        { value: "Full time", employeekind: "1" },
        { value: "Part time", employeekind: "2" }
    ];
    $scope.nhom = [
        { value: "Sáng", employeegroup: "1" },
        { value: "Chiều", employeegroup: "2" },
        { value: "Tối", employeegroup: "3" },
    ];
    $scope.kieunhanvien = [
        { value: "Lái xe", employeetype: "1" }
    ];

    $scope.initData = function () {
        dataservice.gettreedataunit(function (result) {
            $scope.treeDataunit = result.Object;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.submit = function () {
        if ($scope.addform.validate()) {
      
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.notifyDanger("Chọn file có đuôi png, jpg, jpeg, gif, bmp!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.notifyDanger("Độ lớn file không quá 1 MB !");
                    } else {
                        var fileUpload = $("#file")[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 1000 || height > 1000) {
                                    App.notifyDanger("Kích thước file không quá (1000px x 1000px)!");
                                } else {
                                    console.log('Click')

                                    dataservice.insert($scope.model, function (rs) {
                                        if (rs.Error) {
                                            App.notifyDanger(rs.Title);
                                        } else {
                                            App.notifyInfo(rs.Title);
                                            $uibModalInstance.close();
                                        }
                                    });
                                }
                            };
                        }
                    }
                }
            } else {
                console.log('Click else')


                dataservice.insert($scope.model, function (rs) {
                    if (rs.Error) {
                        App.notifyDanger(rs.Title);
                    } else {
                        App.notifyInfo(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para, DTOptionsBuilder, DTColumnBuilder, DTInstances) {
    $scope.gioitinh = [
        { value: "Nam", gender: 1 },
        { value: "Nữ", gender: 2 }
    ];
    $scope.loaihinhnhanvien = [
        { value: "Full time", employeekind: 1 },
        { value: "Part time", employeekind: 2 }
    ];
    $scope.nhom = [
        { value: "Sáng", employeegroup: 1 },
        { value: "Chiều", employeegroup: 2 },
        { value: "Tối", employeegroup: 3 },
    ];
    $scope.kieunhanvien = [
        { value: "Lái xe", employeetype: 1 }
    ];

    $scope.cancel = function () {
       // $uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    $scope.initData = function () {

        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
        dataservice.gettreedataunit(function (result) {
            $scope.treeDataunit = result.Object;
        });
    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.editformTT.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.notifyDanger("Chọn đuôi có đuôi png, jpg, jpeg, gif, bmp!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.notifyDanger("Độ lớn file không quá 1 MB !");
                    } else {
                        var fileUpload = $("#file")[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 1000 || height > 1000) {
                                    App.notifyDanger("Kích thước file không quá (1000px x 1000px)!");
                                } else {
                                    console.log('Click')

                                    dataservice.update($scope.model, function (rs) {
                                        if (rs.Error) {
                                            App.notifyDanger(rs.Title);
                                        } else {
                                            App.notifyInfo(rs.Title);
                                            $uibModalInstance.close();
                                        }
                                    });
                                }
                            };
                        }
                    }
                }
            } else {
                console.log('Click else')
                dataservice.update($scope.model, function (rs) {
                    if (rs.Error) {
                        App.notifyDanger(rs.Title);
                    } else {
                        App.notifyInfo(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
    $scope.submit1 = function () {
        if ($scope.editform1.validate()) {
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            console.log('Name File: ' + extFile);
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.notifyDanger("Chọn file có đuôi png, jpg, jpeg, gif, bmp!");
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.notifyDanger("Độ lớn file không quá 1 MB !");
                    } else {
                        var fileUpload = $("#file")[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 1000 || height > 1000) {
                                    App.notifyDanger("Kích thước file không quá (1000px x 1000px)!");
                                } else {
                                    console.log('Click')

                                    dataservice.update($scope.model, function (rs) {
                                        if (rs.Error) {
                                            App.notifyDanger(rs.Title);
                                        } else {
                                            App.notifyInfo(rs.Title);
                                            $uibModalInstance.close();
                                        }
                                    });
                                }
                            };
                        }
                    }
                }
            } else {
                console.log('Click else')
                dataservice.update($scope.model, function (rs) {
                    if (rs.Error) {
                        App.notifyDanger(rs.Title);
                    } else {
                        App.notifyInfo(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }
    //bảng địa chỉ
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.edit_dc = edit_dc;
    $scope.delete_dc = delete_dc;
    $scope.delete_lh = delete_lh;
    $scope.edi_lh = edit_lh;
    $scope.edit_qt = edit_qt;
    $scope.delete_qt = delete_qt;
    $scope.edit_cv = edit_cv;
    $scope.delete_cv = delete_cv;
    $scope.edit_bccc = edit_bccc;
    $scope.delete_bccc = delete_bccc;
    $scope.edit = edit;
    $scope.deleteItem = deleteItem;
  
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMHrEmployee/JTableDC",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                
            },
            complete: function () {
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
           // $(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("id_dc").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id_dc] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id_dc + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '20px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('No.').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Permanent_Address').withTitle('Hộ khẩu thường trú').withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Now_Address').withTitle('Hiện tại').withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Start_Time').withTitle('Có giá trị từ ngày').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('End_Time').withTitle('Đến ngày').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("null1").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_dc] = full;
            console.log(full);
            return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-click="edit_dc(selected[' + full.id_dc + '])" style="padding-right:10px;" title="Cập nhật tài khoản"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="delete_dc(selected[' + full.id_dc + '])" title="Xóa địa chỉ này"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
    vm.reloadData = reloadData2;
    vm.dtInstance = {};
    function reloadData2(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    $scope.enableeditDC = false;
    $scope.enableaddDC = true;

    function edit_dc(selected) {
        $scope.enableeditDC = true;
             $scope.enableaddDC = false;
            dataservice.getItemDC(selected.id_dc, function (rs) {
                //console.log("RS: " + $itemScope.data.id);
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    $scope.model = rs[0];
                    console.log('Data details: ' + JSON.stringify(rs))
                }
            });
    } 

    function delete_dc(selected){
            $confirm({ text: 'Bạn có chắc chắn xóa: ' + selected.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteDC(selected.id_dc, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                            //alert(result.Title)
                        } else {
                            App.notifyInfo(result.Title);
                            //alert(result.Title)
                            $scope.reload2();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
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
    $scope.reload2 = function () {
        reloadData2(true);
    }
    
    //$scope.contextMenu = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i>Cập nhật tài khoản ';
    //    }, function ($itemScope, $event, model) {
			 //$scope.enableeditDC = true;
    //         $scope.enableaddDC = false;
    //        dataservice.getItemDC($itemScope.data.id_dc, function (rs) {
    //            console.log("RS: " + $itemScope.data.id);
    //            if (rs.Error) {
    //                App.notifyDanger(rs.Title);
    //            } else {
    //                $scope.model = rs[0];
    //                console.log('Data details: ' + JSON.stringify(rs))
    //            }
    //        });
          
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return '<i class="fa fa-remove"></i> Xóa địa chỉ này';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.deleteDC($itemScope.data.id_dc, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                        //alert(result.Title)
    //                    } else {
    //                        App.notifyInfo(result.Title);
    //                        //alert(result.Title)
    //                        $scope.reload2();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];


    $scope.submitDC = function () {

        console.log(JSON.stringify($scope.model))

        if ($scope.addformdc.validate()) {
        dataservice.insertDC($scope.model, function (rs) {
         
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    App.notifyInfo(rs.Title);
                    $scope.reload2();
                    $scope.model.id_dc = null;
                    $scope.model.Permanent_Address = null;
                    $scope.model.Now_Address = null;
                    $scope.model.Phone = null;
                    $scope.model.Start_Time = null;
                    $scope.model.End_Time = null;
                }
            });
        }

    }

    $scope.editDC = function () {
        if ($scope.addformdc.validate()) {
        debugger
        console.log('Nga' + $scope.model)
        dataservice.updateDC($scope.model, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $scope.reload2();
                $scope.model.id_dc = null;
                $scope.model.Permanent_Address = null;
                $scope.model.Now_Address = null;
                $scope.model.Phone = null;
                $scope.model.Start_Time = null;
                $scope.model.End_Time = null;
            }
			 $scope.enableeditDC = false;
            $scope.enableaddDC = true;
        });
        }
    }


    //bảng  liên hệ
    var vm1 = $scope;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm1.dtOptions1 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMHrEmployee/JTableLH",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                //d.Key = $scope.model.Key;
            },
            complete: function () {
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
           // $(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu1;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm1.dtColumns1 = [];
    //vm1.dtColumns1.push(DTColumnBuilder.newColumn("id_lh").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id_lh] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id_lh + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sStyle', 'width: 30px;').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('No.').renderWith(function (data, type) {
    //    return data;
    //}));
    vm1.dtColumns1.push(DTColumnBuilder.newColumn('Name').withTitle('Tên liên hệ').withOption('sWidth', '30px').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm1.dtColumns1.push(DTColumnBuilder.newColumn('Relationship').withTitle('Quan hệ').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm1.dtColumns1.push(DTColumnBuilder.newColumn('Address').withTitle('Địa chỉ').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm1.dtColumns1.push(DTColumnBuilder.newColumn('Phone1').withTitle('Điện thoại').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm1.dtColumns1.push(DTColumnBuilder.newColumn("null2").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_lh] = full;
            return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-click="edit_lh(selected[' + full.id_lh + '])" style="padding-right:10px;" title="Cập nhật thông tin liên hệ"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="delete_lh(selected[' + full.id_lh + '])" title="Xóa thông tin liên hệ"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
    vm1.reloadData = reloadData1;
    vm1.dtInstance1 = {};
    function reloadData1(resetPaging) {
        vm1.dtInstance1.reloadData(callback, resetPaging);
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
    $scope.reload1 = function () {
        reloadData1(true);
    }
 $scope.enableeditLH = false;
 $scope.enableaddLH = true;

 function edit_lh(selected) {
      $scope.enableeditLH = true;
    $scope.enableaddLH = false;
            dataservice.getItemLH(selected.id_lh, function (rs) {
                //console.log("RS: " + $itemScope.data.id);
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    $scope.model = rs[0];
                    console.log('Data details: ' + JSON.stringify(rs))
                }
            });
 }
 function delete_lh(selected) {
     $confirm({ text: 'Bạn có chắc chắn xóa: ' + selected.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteLH(selected.id_lh, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                            //alert(result.Title)
                        } else {
                            App.notifyInfo(result.Title);
                            //alert(result.Title)
                            $scope.reload1();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
 }
    //$scope.contextMenu1 = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i>Cập nhật liên hệ ';
    //    }, function ($itemScope, $event, model) {
			 //$scope.enableeditLH = true;
    //$scope.enableaddLH = false;
    //        dataservice.getItemLH($itemScope.data.id_lh, function (rs) {
    //            console.log("RS: " + $itemScope.data.id);
    //            if (rs.Error) {
    //                App.notifyDanger(rs.Title);
    //            } else {
    //                $scope.model = rs[0];
    //                console.log('Data details: ' + JSON.stringify(rs))
    //            }
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return '<i class="fa fa-remove"></i> Xóa liên hệ này';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.deleteLH($itemScope.data.id_lh, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                        //alert(result.Title)
    //                    } else {
    //                        App.notifyInfo(result.Title);
    //                        //alert(result.Title)
    //                        $scope.reload1();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];


    $scope.submitLH = function () {

        console.log(JSON.stringify($scope.model))

        if ($scope.addformlienhe.validate()) {
        dataservice.insertLH($scope.model, function (rs) {

            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $scope.reload1();
                $scope.model.Name = null;
                $scope.model.Relationship = null;
                $scope.model.Job_Name = null;
                $scope.model.Birthday = null;
                $scope.model.Phone1 = null;
                $scope.model.Fax = null;
                $scope.model.Email = null;
                $scope.model.Address = null;
                $scope.model.Note = null;
            }
        });
         }

    }

    $scope.editLH = function () {
        if ($scope.addformlienhe.validate()) {
        dataservice.updateLH($scope.model, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $scope.reload1();
                $scope.model.Name = null;
                $scope.model.Relationship = null;
                $scope.model.Job_Name = null;
                $scope.model.Birthday = null;
                $scope.model.Phone1 = null;
                $scope.model.Fax = null;
                $scope.model.Email = null;
                $scope.model.Address = null;
                $scope.model.Note = null;
            }
			 $scope.enableeditLH = false;
    $scope.enableaddLH = true;
        });
    }
    }



    //bảng  qua trình làm việc
    var vm2 = $scope;

    $scope.model = {
        Key: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm2.dtOptions2 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMHrEmployee/JTableQTLV",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Key = $scope.model.Key;
            },
            complete: function () {
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
            //$(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu7;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm2.dtColumns2 = [];
    //vm2.dtColumns2.push(DTColumnBuilder.newColumn("id_qt").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id_qt] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id_qt + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('No.').renderWith(function (data, type) {
    //    return data;
    //}));
    vm2.dtColumns2.push(DTColumnBuilder.newColumn('Start_Time1').withTitle('Từ ngày ').withOption('sWidth', '30px').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm2.dtColumns2.push(DTColumnBuilder.newColumn('End_Date1').withTitle('Đến ngày').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm2.dtColumns2.push(DTColumnBuilder.newColumn('Wage_Level').withTitle('Cấp bậc lương').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm2.dtColumns2.push(DTColumnBuilder.newColumn('Salary_Ratio').withTitle('Hệ số lương').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm2.dtColumns2.push(DTColumnBuilder.newColumn("null3").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_qt] = full;
            
            return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-model="edit_qt(selected[' + full.id_qt + '])" style="padding-right:10px;" title="Cập nhật quá trình"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="delete_qt(selected[' + full.id_qt + '])" title=" Xóa địa chỉ này"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
    vm2.reloadData = reloadData3;
    vm2.dtInstance2 = {};
    function reloadData3(resetPaging) {
        vm2.dtInstance2.reloadData(callback, resetPaging);
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
    $scope.reload3 = function () {
        reloadData3(true);
    }
 $scope.enableeditqtlv = false;
 $scope.enableaddqtlv = true;

 function edit_qt(selected) {
     $scope.enableeditqtlv = true;
    $scope.enableaddqtlv = false;
            dataservice.getItemQTLV(selected.id_qt, function (rs) {

                console.log("RS: " + selected.id_qt);
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    $scope.model = rs[0];
                    console.log('Data details: ' + JSON.stringify(rs))
                }
            });
 }
 function delete_qt(selected) {
     $confirm({ text: 'Bạn có chắc chắn xóa: ' + selected.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteQTLV(selected.id_qt, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                            //alert(result.Title)
                        } else {
                            App.notifyInfo(result.Title);
                            //alert(result.Title)
                            $scope.reload3();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
 }
    //$scope.contextMenu7 = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i>Cập nhật quá trình ';
    //    }, function ($itemScope, $event, model) {
			 //$scope.enableeditqtlv = true;
    //$scope.enableaddqtlv = false;
    //        dataservice.getItemQTLV($itemScope.data.id_qt, function (rs) {
				
    //            console.log("RS: " + $itemScope.data.id_qt);
    //            if (rs.Error) {
    //                App.notifyDanger(rs.Title);
    //            } else {
    //                $scope.model = rs[0];
    //                console.log('Data details: ' + JSON.stringify(rs))
    //            }
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return '<i class="fa fa-remove"></i> Xóa địa chỉ này';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.deleteQTLV($itemScope.data.id_qt, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                        //alert(result.Title)
    //                    } else {
    //                        App.notifyInfo(result.Title);
    //                        //alert(result.Title)
    //                        $scope.reload3();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];


    $scope.submitQTLV = function () {

        console.log(JSON.stringify($scope.model))

        if ($scope.addformqtlv.validate()) {
        dataservice.insertQTLV($scope.model, function (rs) {
         
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $scope.reload3();
                $scope.model.Wage_Level = null;
                $scope.model.Salary_Ratio = null;
                $scope.model.Description1 = null;
                $scope.model.End_Date1 = null;
                $scope.model.Start_Time1 = null;
                $scope.model.id_qt = null;
            }
        });
         }

    }

    $scope.editQTLV = function () {
         if ($scope.addformqtlv.validate()) {
            dataservice.updateQTLV($scope.model, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $scope.reload3();
                $scope.model.Wage_Level = null;
                $scope.model.Salary_Ratio = null;
                $scope.model.Description1 = null;
                $scope.model.End_Date1 = null;
                $scope.model.Start_Time1 = null;
                $scope.model.id_qt = null;
            }
			 $scope.enableeditqtlv = false;
    $scope.enableaddqtlv = true;
        });
         }
    }
    

    //bảng  quy trình công việc
    var vm3 = $scope;

    $scope.model = {
        Key: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm3.dtOptions3 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMHrEmployee/JTableQTCV",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Key = $scope.model.Key;
            },
            complete: function () {
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
            //$(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu2;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm3.dtColumns3 = [];
    //vm3.dtColumns3.push(DTColumnBuilder.newColumn("id_cv").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id_cv] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id_cv + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('No.').renderWith(function (data, type) {
    //    return data;
    //}));
    vm3.dtColumns3.push(DTColumnBuilder.newColumn('Name_Job').withTitle('Tên công việc ').withOption('sWidth', '30px').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm3.dtColumns3.push(DTColumnBuilder.newColumn('Working_Process').withTitle('Quy trình công việc').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm3.dtColumns3.push(DTColumnBuilder.newColumn("null4").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_cv] = full;            
            return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-click="edit_cv(selected[' + full.id_cv + '])" style="padding-right:10px;" title="Cập nhật quy trình"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="delete_cv(selected[' + full.id_cv + '])" title=" Xóa quy trình này"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));

    vm3.reloadData = reloadData4;
    vm3.dtInstance3 = {};
    function reloadData4(resetPaging) {
        vm3.dtInstance3.reloadData(callback, resetPaging);
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
    $scope.reload4 = function () {
        reloadData4(true);
    }
 $scope.enableeditqtcv = false;
 $scope.enableaddqtcv = true;

 function edit_cv(selected) {
      $scope.enableeditqtcv = true;
    $scope.enableaddqtcv = false;
            dataservice.getItemQTCV(selected.id_cv, function (rs) {
                console.log("RS: " + selected.id_cv);
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    $scope.model = rs[0];
                    console.log('Data details: ' + JSON.stringify(rs))
                }
            });
 }
 function delete_cv(selected) {
              $confirm({ text: 'Bạn có chắc chắn xóa: ' + selected.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteQTCV(selected.id_cv, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                            //alert(result.Title)
                        } else {
                            App.notifyInfo(result.Title);
                            //alert(result.Title)
                            $scope.reload4();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
 }
    //$scope.contextMenu2 = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i>Cập nhật quy trình ';
    //    }, function ($itemScope, $event, model) {
			 //$scope.enableeditqtcv = true;
    //$scope.enableaddqtcv = false;
    //        dataservice.getItemQTCV($itemScope.data.id_cv, function (rs) {
    //            console.log("RS: " + $itemScope.data.id_cv);
    //            if (rs.Error) {
    //                App.notifyDanger(rs.Title);
    //            } else {
    //                $scope.model = rs[0];
    //                console.log('Data details: ' + JSON.stringify(rs))
    //            }
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return '<i class="fa fa-remove"></i> Xóa quy trình này';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.deleteQTCV($itemScope.data.id_cv, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                        //alert(result.Title)
    //                    } else {
    //                        App.notifyInfo(result.Title);
    //                        //alert(result.Title)
    //                        $scope.reload4();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];


    $scope.submitQTCV = function () {

        console.log(JSON.stringify($scope.model))

         if ($scope.addformQTCV1.validate()) {
        dataservice.insertQTCV($scope.model, function (rs) {

            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $scope.reload4();
                $scope.model.Name_Job = '';
                $scope.model.Working_Process = '';
                $scope.model.Description2 = '';          
                $scope.model.Info_Details = '';
            }
        });
          }

    }

    $scope.editQTCV = function () {
        if ($scope.addformQTCV1.validate()) {
            dataservice.updateQTCV($scope.model, function (rs) {
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    App.notifyInfo(rs.Title);
                    $scope.reload4();
                    $scope.model.Name_Job = '';
                    $scope.model.Working_Process = '';
                    $scope.model.Description2 = '';
                    $scope.model.Info_Details = '';
                }
				 $scope.enableeditqtcv = false;
    $scope.enableaddqtcv = true;
            });
        }
    }





    //bảng  bằng cấp chứng chỉ
    var vm4 = $scope;

    $scope.model = {
        Key: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm4.dtOptions4 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMHrEmployee/JTableBCCC",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Key = $scope.model.Key;
            },
            complete: function () {
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
            //$(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu3;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm4.dtColumns4 = [];
    //vm4.dtColumns4.push(DTColumnBuilder.newColumn("id_bccc").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id_bccc] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id_bccc + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('No.').renderWith(function (data, type) {
    //    return data;
    //}));
    vm4.dtColumns4.push(DTColumnBuilder.newColumn('Education_Name').withTitle('Tên khóa đào tạo').withOption('sWidth', '30px').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm4.dtColumns4.push(DTColumnBuilder.newColumn('Result').withTitle('Kết quả').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm4.dtColumns4.push(DTColumnBuilder.newColumn("null5").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id_bccc] = full;
           
            return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-click="edit_bccc(selected[' + full.id_bccc + '])" style="padding-right:10px;" title="Cập nhật bằng cấp"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="delete_bccc(selected[' + full.id_bccc + '])" title=" Xóa bằng cấp"><i class="fa fa-remove" style="font-size:18px"></i></a></p>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));

    vm4.reloadData = reloadData5;
    vm4.dtInstance4 = {};
    function reloadData5(resetPaging) {
        vm3.dtInstance4.reloadData(callback, resetPaging);
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
    $scope.reload5 = function () {
        reloadData5(true);
    }
   $scope.enableeditbccc = false;
   $scope.enableaddbccc = true;
   function edit_bccc(selected) {
          $scope.enableeditbccc = true;
    $scope.enableaddbccc = false;
            dataservice.getItemBCCC(selected.id_bccc, function (rs) {
                console.log("RS: " + selected.id_bccc);
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    $scope.model = rs[0];
                    console.log('Data details: ' + JSON.stringify(rs))
                }
            });
   }
   function delete_bccc(selected) {
                   $confirm({ text: 'Bạn có chắc chắn xóa: ' + selected.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.deleteBCCC(selected.id_bccc, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                            //alert(result.Title)
                        } else {
                            App.notifyInfo(result.Title);
                            //alert(result.Title)
                            $scope.reload5();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
   }
    //$scope.contextMenu3 = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i>Cập nhật bằng cấp ';
    //    }, function ($itemScope, $event, model) {
			 //  $scope.enableeditbccc = true;
    //$scope.enableaddbccc = false;
    //        dataservice.getItemBCCC($itemScope.data.id_bccc, function (rs) {
    //            console.log("RS: " + $itemScope.data.id_bccc);
    //            if (rs.Error) {
    //                App.notifyDanger(rs.Title);
    //            } else {
    //                $scope.model = rs[0];
    //                console.log('Data details: ' + JSON.stringify(rs))
    //            }
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return '<i class="fa fa-remove"></i> Xóa bằng cấp này';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn xóa: ' + $itemScope.data.Permanent_Address, title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.deleteBCCC($itemScope.data.id_bccc, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                        //alert(result.Title)
    //                    } else {
    //                        App.notifyInfo(result.Title);
    //                        //alert(result.Title)
    //                        $scope.reload5();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];


    $scope.submitBCCC = function () {
        debugger
        console.log(JSON.stringify($scope.model))

        if ($scope.addformBC.validate()) {
        dataservice.insertBCCC($scope.model, function (rs) {

            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $scope.reload5();
                $scope.model.Education_Name = '';
                $scope.model.Start_Time3 = null;
                $scope.model.End_Time3 = null;
                $scope.model.Result = '';
                $scope.model.Certificate_Name = '';
                $scope.model.Received_Place = '';
                $scope.model.Traing_Place = '';
                $scope.model.Info_Details1 = '';
            }
        });
          }

    }

    $scope.editBCCC = function () {
        if ($scope.addformBC.validate()) {
        dataservice.updateBCCC($scope.model, function (rs) {
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                App.notifyInfo(rs.Title);
                $scope.reload5();
                $scope.model.Education_Name = '';
                $scope.model.Start_Time3 = null;
                $scope.model.End_Time3 = null;
                $scope.model.Result = '';
                $scope.model.Certificate_Name = '';
                $scope.model.Received_Place = '';
                $scope.model.Traing_Place = '';
                $scope.model.Info_Details1 = '';
            }
			   $scope.enableeditbccc = true;
    $scope.enableaddbccc = false;
        });
    }
    }




    //bảng  hợp đồng
    var vm5 = $scope;

    $scope.model = {
        Key: ''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm5.dtOptions5 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/RMHrEmployee/JTableHD",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Key = $scope.model.Key;
            },
            complete: function () {
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
            //$(this.api().table().header()).css({ 'background-color': '#1a2226', 'color': '#f9fdfd', 'font-size': '8px', 'font-weight': 'bold' });
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu4;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm5.dtColumns5 = [];
    //vm5.dtColumns5.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '10px').withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('No.').renderWith(function (data, type) {
    //    return data;
    //}));
    vm5.dtColumns5.push(DTColumnBuilder.newColumn('Contract_Code').withTitle('Số hợp đồng').withOption('sWidth', '10px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm5.dtColumns5.push(DTColumnBuilder.newColumn('Start_Time').withTitle('Ngày bắt đầu').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm5.dtColumns5.push(DTColumnBuilder.newColumn('End_Time').withTitle('Ngày kết thúc').withOption('sWidth', '30px').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm5.dtColumns5.push(DTColumnBuilder.newColumn('Salary').withTitle('Mức lương chính').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm5.dtColumns5.push(DTColumnBuilder.newColumn('Insuarance').withTitle('Mức đóng bảo hiểm xã hội').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm5.dtColumns5.push(DTColumnBuilder.newColumn('Type_Money').withTitle('Loại tiền').withOption('sWidth', '30px').renderWith(function (data, type) {
        if (data == 'null' || data == 'undefined')
            return '';
        else
            return data;
    }));
    vm5.dtColumns5.push(DTColumnBuilder.newColumn('Active').withTitle('Trạng thái').renderWith(function (data, type) {
        if (data == 1) {
            return '<a class="btn btn- primary" style="margin- top:30px">Còn hạn</a>';

        }
        if (data == 0) {
            return '<a class="btn btn-danger" style="margin-top:30px">Hết hạn</a>';
        }
    }));
    vm5.dtColumns5.push(DTColumnBuilder.newColumn("null6").withTitle('Tác vụ').notSortable()
        .renderWith(function (data, type, full, meta) {
            
            $scope.selected[full.id] = full;
            
            return '<p class="mt-checkbox" style ="margin-top:0px"><a ng-click="edit(selected[' + full.id + '])" style="padding-right:10px;" title="Sửa khoản mục"><i class="fa fa-edit" style="font-size:18px"></i></a><a ng-click="deleteItem(selected[' + full.id + '])" title="Khóa khoản mục"><i class="fa fa-lock" style="font-size:18px"></i></a></p>';
        }).withOption('sWidth', '120px').withOption('sClass', 'tcenter'));
    vm5.reloadData = reloadData;
    vm5.dtInstance5 = {};
    function reloadData(resetPaging) {
        vm5.dtInstance5.reloadData(callback, resetPaging);
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

    $scope.add_contract = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add_contract.html',
            controller: 'add_contract',
            backdrop: true,
            size: '80'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
            return $itemScope.data.id;
        });
    }




    $scope.edit_contract = function () {
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
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit_contract.html',
                    controller: 'edit_contract',
                    backdrop: 'static',
                    size: '80',
                    resolve: {
                        para: function () {
                            return editItems[0];
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                    return $itemScope.data.id;
                });
            } else {
                App.notifyDanger(caption.ONLY_SELECT.replace('{0}', caption.FUNCTION));
            }
        } else {
            App.notifyDanger(caption.ERR_NOT_CHECKED.replace('{0}', caption.FUNCTION));
        }
    }

    $scope.deleteChecked = function () {
        var deleteItems = [];
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    deleteItems.push(id);
                }
            }
        }
        if (deleteItems.length > 0) {
            $confirm({ text: 'Bạn có chắc chắn muốn khoá các khoản mục đã chọn này ?', title: 'Xác nhận', ok: 'Chắc chắn', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });

                    dataservice.deleteItems_HD(deleteItems, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                        } else {
                            App.notifyInfo(result.Title);
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });

                });
        } else {
            App.notifyDanger("Không có khoản mục nào được chọn!");
        }
    }

    function edit(selected) {
        var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/edit_contract.html',
                        controller: 'edit_contract',
                        backdrop: true,
                        size: '80',
                        resolve: {
                            para: function () {

                                return selected.id;

                                
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                        $scope.reload();
                    }, function () {
                    });
    }
    function deleteItem(selected) {
                 $confirm({ text: 'Bạn có chắc chắn khoá khoản mục này ?', title: 'Xác nhận', cancel: ' Hủy ' })
                .then(function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                    dataservice.delete_HD(selected.id, function (result) {
                        if (result.Error) {
                            App.notifyDanger(result.Title);
                            //alert(result.Title)
                        } else {
                            App.notifyInfo(result.Title);
                            //alert(result.Title)
                            $scope.reload();
                        }
                        App.unblockUI("#contentMain");
                    });
                });
    }
    //$scope.contextMenu4 = [
    //    [function ($itemScope) {
    //        return '<i class="fa fa-edit"></i> Sửa khoản mục';
    //    }, function ($itemScope, $event, model) {
    //        var modalInstance = $uibModal.open({
    //            animation: true,
    //            templateUrl: ctxfolder + '/edit_contract.html',
    //            controller: 'edit_contract',
    //            backdrop: true,
    //            size: '80',
    //            resolve: {
    //                para: function () {

    //                    return $itemScope.data.id;

    //                    console.log(JSON.stringify($itemScope));
    //                }
    //            }
    //        });
    //        modalInstance.result.then(function (d) {
    //            $scope.reload();
    //        }, function () {
    //        });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }],
    //    [function ($itemScope) {
    //        return '<i class="fa fa-remove"></i> Khoá khoản mục';
    //    }, function ($itemScope, $event, model) {

    //        $confirm({ text: 'Bạn có chắc chắn khoá khoản mục này ?', title: 'Xác nhận', cancel: ' Hủy ' })
    //            .then(function () {
    //                App.blockUI({
    //                    target: "#contentMain",
    //                    boxed: true,
    //                    message: 'loading...'
    //                });
    //                dataservice.delete_HD($itemScope.data.id, function (result) {
    //                    if (result.Error) {
    //                        App.notifyDanger(result.Title);
    //                        //alert(result.Title)
    //                    } else {
    //                        App.notifyInfo(result.Title);
    //                        //alert(result.Title)
    //                        $scope.reload();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });
    //            });
    //    }, function ($itemScope, $event, model) {
    //        return true;
    //    }]
    //];



});



app.controller('add_contract', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.names1 = [
        { value: "Tiếng Việt", language: "vi-VN" },
        { value: "Tiếng Anh", language: "en-US" }
    ];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submitHD = function () {

        if ($scope.addformhd.validate()) {
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        console.log('Name File: ' + extFile);
        if (extFile != "") {
            if (extFile != "docx" && extFile != "pdf") {
                App.notifyDanger("Chọn file có đuôi docx, pdf!");
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 102400) {
                    App.notifyDanger("Độ lớn file không quá 1 MB !");
                } else {
                    var fileUpload = $("#file")[0];
                    var reader = new FileReader();
                    reader.readAsDataURL(fileUpload.files[0]);
                    reader.onloadend = function (e) {
                        //Initiate the JavaScript Image object.
                        //  var file1 = new File();
                        //   var image = new Image();
                        //Set the Base64 string return from FileReader as source.
                        var file1 = e.target.result;
                        // image.src = e.target.result;
                        //    file1.onload = function () {
                        dataservice.insert_HD($scope.model, function (rs) {
                            if (rs.Error) {
                                App.notifyDanger(rs.Title);
                            } else {
                                App.notifyInfo(rs.Title);
                                $uibModalInstance.close();
                            }
                        });
                    }
                    //   }
                }
            }
        } else {
            console.log('Click else')
            dataservice.insert_HD($scope.model, function (rs) {
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {
                    App.notifyInfo(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
         }
    }
});

app.controller('edit_contract', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.names1 = [
        { value: "Tiếng Việt", language: "vi-VN" },
        { value: "Tiếng Anh", language: "en-US" }
    ];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.cancel1 = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $uibModalInstance.close();
    $scope.initData = function () {

        dataservice.getItemHD(para, function (rs) {
            console.log("RS: " + para);
            if (rs.Error) {
                App.notifyDanger(rs.Title);
            } else {
                $scope.model = rs;
                console.log('Data details: ' + JSON.stringify(rs))
            }
        });
    }
    $scope.initData();
    $scope.loadData = function () {

    }
    $scope.loadData();
    $scope.submitHD = function () {
        if ($scope.editformhd.validate()) {
        debugger
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        console.log('Name File: ' + extFile);
        if (extFile != "") {
            if (extFile != "docx" && extFile != "pdf") {
                App.notifyDanger("Format required is docx,pdf!");
            } else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.notifyDanger("Maximum allowed file size is 1 MB !");
                } else {
                    var fileUpload = $("#file")[0];
                    var reader = new FileReader();
                    reader.readAsDataURL(fileUpload.files[0]);
                    reader.onloadend = function (e) {
                        var file1 = e.target.result;
                        console.log('Click')
                        dataservice.upload_HD($scope.model, function (rs) {
                            console.log("rs ne:: " + JSON.stringify(rs))
                            if (rs.Error) {
                                App.notifyDanger(rs.Title);
                            } else {
                                App.notifyInfo(rs.Title);
                                $uibModalInstance.close();
                            }
                        });
                    }
                }
            }
        } else {
            console.log('Click else')
            dataservice.upload_HD($scope.model, function (rs) {
                console.log("rs ne:: " + JSON.stringify(rs))
                if (rs.Error) {
                    App.notifyDanger(rs.Title);
                } else {

                    App.notifyInfo(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
        }
    }
});
app.controller('export', function ($scope, $rootScope, $filter, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $uibModalInstance, $location) {
    
    $scope.model = {
        startDate: '',
        endDate: ''
    }
    $scope.export = function () {
        
        location.href = "/Admin/RMHrEmployee/ExportRomooc/?startTime=" + $scope.model.startDate + "&endTime=" + $scope.model.endDate;
        $uibModalInstance.dismiss('cancel');
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
});



