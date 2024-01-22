var ctxfolder = "/views/admin/workBookSalary";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", 'ngSanitize', "ngCookies"]);

app.factory('dataservice', function ($http) {
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
        }
        $http(req).then(callback);
    };
    return {
        getEmployee: function (callback) {
            $http.post('/Admin/WorkBookSalary/GetEmployee').then(callback);
        },
        getBasicInfo: function (callback) {
            $http.post('/Admin/WorkBookSalary/GetBasicInfo').then(callback);
        },
        getEmployeeDetail: function (month, user, totalDay, callback) {
            $http.post('/Admin/WorkBookSalary/GetEmployeeDetail?month=' + month + '&user=' + user + '&totalDay=' + totalDay).then(callback);
        },
        exportExcel: function (data, callback) {
            $http.post('/Admin/WorkBookSalary/ExportExcel', data).then(callback);
        },
        saveExcel: function (data, callback) {
            $http.post('/Admin/WorkBookSalary/SaveExcel', data).then(callback);
        },
        calSalary: function (month, user, file, callback) {
            $http.post('/Admin/WorkBookSalary/CalSalary?month=' + month + '&user=' + user + '&file=' + file).then(callback);
        },
        insertExcelDataDB: function (monthSalary, callback) {
            $http.post('/Admin/WorkBookSalary/InsertExcelDataDB?monthSalary=' + monthSalary).then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, dataservice, $cookies, $translate) {
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
        });
        $rootScope.validationOptions = {
            rules: {
                ActionTime: {
                    required: true,
                },
                ActionBegin: {
                    required: true,
                },
                ActionTo: {
                    required: true,
                }
            },
            messages: {
                ActionTime: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.STL_CURD_LBL_TIME),
                },
                ActionBegin: {
                    required: 'Từ ngày yêu cầu bắt buộc'
                },
                ActionTo: {
                    required: 'Đến ngày yêu cầu bắt buộc'
                }
            }
        }
    });
});

app.directive('numberInput', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModelCtrl) {

            ngModelCtrl.$formatters.push(function (modelValue) {
                return setDisplayNumber(modelValue, true);
            });

            // it's best to change the displayed text using elem.val() rather than
            // ngModelCtrl.$setViewValue because the latter will re-trigger the parser
            // and not necessarily in the correct order with the changed value last.
            // see http://radify.io/blog/understanding-ngmodelcontroller-by-example-part-1/
            // for an explanation of how ngModelCtrl works.
            ngModelCtrl.$parsers.push(function (viewValue) {
                setDisplayNumber(viewValue);
                return setModelNumber(viewValue);
            });

            // occasionally the parser chain doesn't run (when the user repeatedly 
            // types the same non-numeric character)
            // for these cases, clean up again half a second later using "keyup"
            // (the parser runs much sooner than keyup, so it's better UX to also do it within parser
            // to give the feeling that the comma is added as they type)
            elem.bind('keyup focus', function () {
                setDisplayNumber(elem.val());
            });

            function setDisplayNumber(val, formatter) {
                var valStr, displayValue;

                if (typeof val === 'undefined') {
                    return 0;
                }

                valStr = val.toString();
                displayValue = valStr.replace(/,/g, '').replace(/[A-Za-z]/g, '');
                displayValue = parseFloat(displayValue);
                displayValue = (!isNaN(displayValue)) ? displayValue.toString() : '';

                // handle leading character -/0
                if (valStr.length === 1 && valStr[0] === '-') {
                    displayValue = valStr[0];
                } else if (valStr.length === 1 && valStr[0] === '0') {
                    displayValue = '0';
                } else {
                    displayValue = $filter('number')(displayValue);
                }

                // handle decimal
                if (!attrs.integer) {
                    if (displayValue.indexOf('.') === -1) {
                        if (valStr.slice(-1) === '.') {
                            displayValue += '.';
                        } else if (valStr.slice(-2) === '.0') {
                            displayValue += '.0';
                        } else if (valStr.slice(-3) === '.00') {
                            displayValue += '.00';
                        }
                    } // handle last character 0 after decimal and another number
                    else {
                        if (valStr.slice(-1) === '0') {
                            displayValue += '0';
                        }
                    }
                }

                if (attrs.positive && displayValue[0] === '-') {
                    displayValue = displayValue.substring(1);
                }

                if (typeof formatter !== 'undefined') {
                    return (displayValue === '') ? 0 : displayValue;
                } else {
                    elem.val((displayValue === '0') ? 0 : displayValue);
                }
            }

            function setModelNumber(val) {
                var modelNum = val.toString().replace(/,/g, '').replace(/[A-Za-z]/g, '');
                modelNum = parseFloat(modelNum);
                modelNum = (!isNaN(modelNum)) ? modelNum : 0;
                if (modelNum.toString().indexOf('.') !== -1) {
                    modelNum = Math.round((modelNum + 0.00001) * 100) / 100;
                }
                if (attrs.positive) {
                    modelNum = Math.abs(modelNum);
                }
                return modelNum;
            }
        }
    };
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    $translateProvider.useUrlLoader('/Admin/WorkBookSalary/Translation');
    caption = $translateProvider.translations();
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

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        Month: '',
        Employee: '',
        EmployeeName: '',
        File: '',
    };

    $scope.dayInMonth = 22;
    $scope.dayOff = 0;
    $scope.salaryBasic = 1400000;
    $scope.salaryKDBasic = 3000000;
    $scope.costLunch = 10000;
    $scope.roundDefault = 10000;
    $scope.listEmployeeDetail = [];
    $scope.Total = {
        SUM_E: 0,
        SUM_F: 0,
        SUM_G: 0,
        SUM_H: 0,
        SUM_I: 0,
        SUM_J: 0,
        SUM_K: 0,
        SUM_L: 0,
        SUM_M: 0,
        SUM_N: 0,
        SUM_O: 0,
        SUM_P: 0,
        SUM_Q: 0,
        SUM_R: 0,
        SUM_S: 0,
        SUM_AT: 0,
        SUM_T: 0,
        SUM_U: 0,
        SUM_V: 0,
        SUM_VR: 0,
        SUM_X: 0,
        SUM_Y: 0
    };

    $scope.initData = function () {
        dataservice.getBasicInfo(function (rs) {
            rs = rs.data;
            console.log(rs);
            $scope.salaryBasic = Number(rs.BasicSalary);
            $scope.salaryKDBasic = Number(rs.BasicBusinessSalary);
            $scope.costLunch = Number(rs.CostLunch);
        });
        dataservice.getEmployee(function (rs) {
            rs = rs.data;
            $scope.listEmployee = rs;
            var all = {
                Code: '',
                Name: 'Tất cả'
            };
            $scope.listEmployee.unshift(all);
        });
    };
    $scope.initData();
    $scope.calSalary = function () {
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getEmployeeDetail($scope.model.Month, $scope.model.Employee, $scope.dayInMonth, function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            $scope.listEmployeeDetail = rs.data;
            $scope.groupDepartment = rs.groupDepartment;
            $scope.changeDayInMonth();
        });

        //dataservice.calSalary($scope.model.Month, $scope.model.Employee, '', function (rs) {
        //    rs = rs.data;
        //    $scope.model.File = rs;
        //    onCreated(rs);
        //});
    };
    $scope.calSalaryReload = function () {
        dataservice.calSalary($scope.model.Month, $scope.model.Employee, $scope.model.File, function (rs) {
            rs = rs.data;
            onCreated(rs);
        });
    };

    $scope.calculateFormula = function (x) {
        //x.E = $scope.dayInMonth - x.F - x.G - x.V - x.VR - x.X - x.Y;

        if (/*x.DepartmentCode !== 'BGD'*/true) {
            x.I = Math.round((x.D * $scope.salaryBasic) / $scope.dayInMonth * (x.E + x.G + x.V + x.VR + x.X)); //Mức lương cơ bản=(HS lương(D) * Lương cơ bản)/Số ngày trong tháng *(Số ngày LV tại VP(E) + Số ngày phép(G) + Công tác(V) + VR(VR) + Nghỉ lễ(X))
            x.M = Math.round(x.L + $scope.salaryKDBasic);
            x.O = Math.round(x.M * x.N);
            x.P = Math.round((x.D * $scope.salaryBasic + x.M) / $scope.dayInMonth * x.F * 0.75);//Lương ốm = (HS lương(D) * Lương cơ bản + Lương KD cơ cở(M))/Số ngày trong tháng * Số ngày nghỉ ốm(F)*75%
            x.Q = Math.round((x.E * $scope.costLunch) / $scope.roundDefault) * $scope.roundDefault;//Ăn trưa
        }
        x.K = Math.round(x.I + x.J);
        x.R = Math.round(x.K + x.O + x.P + x.Q);
        x.T = Math.round(x.R - x.S);

        $scope.calculateTotal();
    };

    $scope.calculateTotal = function () {
        $scope.Total = {
            SUM_E: 0,
            SUM_F: 0,
            SUM_G: 0,
            SUM_H: 0,
            SUM_I: 0,
            SUM_J: 0,
            SUM_K: 0,
            SUM_L: 0,
            SUM_M: 0,
            SUM_N: 0,
            SUM_O: 0,
            SUM_P: 0,
            SUM_Q: 0,
            SUM_R: 0,
            SUM_S: 0,
            SUM_AT: 0,
            SUM_T: 0,
            SUM_U: 0,
            SUM_V: 0,
            SUM_VR: 0,
            SUM_X: 0,
            SUM_Y: 0
        };

        for (var i = 0; i < $scope.listEmployeeDetail.length; i++) {
            $scope.Total.SUM_E += $scope.listEmployeeDetail[i].E;
            $scope.Total.SUM_F += $scope.listEmployeeDetail[i].F;
            $scope.Total.SUM_G += $scope.listEmployeeDetail[i].G;
            $scope.Total.SUM_H += $scope.listEmployeeDetail[i].H;
            $scope.Total.SUM_I += $scope.listEmployeeDetail[i].I;
            $scope.Total.SUM_J += $scope.listEmployeeDetail[i].J;
            $scope.Total.SUM_K += $scope.listEmployeeDetail[i].K;
            $scope.Total.SUM_L += $scope.listEmployeeDetail[i].L;
            $scope.Total.SUM_M += $scope.listEmployeeDetail[i].M;
            $scope.Total.SUM_N += $scope.listEmployeeDetail[i].N;
            $scope.Total.SUM_O += $scope.listEmployeeDetail[i].O;
            $scope.Total.SUM_P += $scope.listEmployeeDetail[i].P;
            $scope.Total.SUM_Q += $scope.listEmployeeDetail[i].Q;
            $scope.Total.SUM_R += $scope.listEmployeeDetail[i].R;
            $scope.Total.SUM_S += $scope.listEmployeeDetail[i].S;
            $scope.Total.SUM_AT += $scope.listEmployeeDetail[i].AT;
            $scope.Total.SUM_T += $scope.listEmployeeDetail[i].T;
            $scope.Total.SUM_U += $scope.listEmployeeDetail[i].U;
            $scope.Total.SUM_V += $scope.listEmployeeDetail[i].V;
            $scope.Total.SUM_VR += $scope.listEmployeeDetail[i].VR;
            $scope.Total.SUM_X += $scope.listEmployeeDetail[i].X;
            $scope.Total.SUM_Y += $scope.listEmployeeDetail[i].Y;
        }
    };

    $scope.changeDayInMonth = function () {
        if ($scope.dayInMonth < 0) {
            return App.toastrError('Số ngày công phải lớn hơn 0');
        }

        if ($scope.dayInMonth == null || $scope.dayInMonth == undefined) {
            $scope.dayInMonth = 0;
        }

        for (var i = 0; i < $scope.listEmployeeDetail.length; i++) {
            $scope.calculateFormula($scope.listEmployeeDetail[i]);
            $scope.listEmployeeDetail[i].TotalDay = $scope.dayInMonth;
        }
    };

    $scope.exportExcel = function () {
        if ($scope.listEmployeeDetail.length > 0) {
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });
            dataservice.exportExcel($scope.listEmployeeDetail, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");
                if (rs.pathFile) {
                    download(rs.fileName, '/' + rs.pathFile);
                } else {
                    App.toastrError(caption.COM_MSG_NO_PERMISSION);
                }
            });
        } else {
            App.toastrError(caption.WBS_LIST_STAFF_EMPTY);
        }
    };

    $scope.saveExcel = function () {
        if ($scope.listEmployeeDetail.length > 0) {
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });
            dataservice.saveExcel($scope.listEmployeeDetail, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        } else {
            App.toastrError(caption.WBS_LIST_STAFF_EMPTY);
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

    $scope.saveDB = function () {
        dataservice.insertExcelDataDB($scope.model.Month, function (rs) {
            rs = rs.data;
        });
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    };

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }
    function onCreated(file) {
        var spreadsheetObj = ej.base.getComponent(document.getElementById('spreadsheet'), 'spreadsheet');
        var request = new XMLHttpRequest();
        request.responseType = "blob";
        request.onload = () => {
            var file = new File([request.response], "excel.xlsx");
            spreadsheetObj.open({ file: file });
        };
        request.open("GET", file);
        request.send();
    }
    function loadDate() {
        //$("#monthSalary").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "mm/yyyy",
        //    fontAwesome: true,
        //}).on('changeDate', function (selected) {
        //    })
        $("#monthSalary").datepicker({
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
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {

    };

    $scope.initLoad = function () {

    };
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($rootScope.ServiceCode == '') {
                dataserviceSVC.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.ServiceCode = $scope.model.ServiceCode;
                        $rootScope.reload();
                    }
                });
            } else {
                dataserviceSVC.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reload();
                    }
                });
            }
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ServiceType" && $scope.model.ServiceType != "") {
            $scope.errorServiceType = false;
        }
        if (SelectType == "ServiceGroup" && $scope.model.ServiceGroup != "") {
            $scope.errorServiceGroup = false;
        }
        //if (SelectType == "Unit" && $scope.model.Unit != "") {
        //    $scope.errorUnit = false;
        //}
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ServiceType == "") {
            $scope.errorServiceType = true;
            mess.Status = true;
        } else {
            $scope.errorServiceType = false;
        }
        if (data.ServiceGroup == "") {
            $scope.errorServiceGroup = true;
            mess.Status = true;
        } else {
            $scope.errorServiceGroup = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

