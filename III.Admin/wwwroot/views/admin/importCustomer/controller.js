var ctxfolder = "/views/admin/importCustomer";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ui.select", "ngCookies", "pascalprecht.translate"]);
app.directive('customOnChange', function () {
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
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
    }
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
        uploadPayrollBulk: function (data, callback) {
            submitFormUpload('/Admin/ImportCustomer/UploadPayrollBulk', data, callback);
        },
        saveItems: function (data, callback) {
            $http.post('/Admin/ImportCustomer/saveItems', data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.dateNow = new Date();
    $rootScope.$on('$translateChangeSuccess', function () {
        //$rootScope.checkData = function (data) {
        //    var mobilePhone = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
        //    var mess = { Status: false, Title: "" }
        //    if (!mobilePhone.test(data.MobilePhone)) {
        //        mess.Status = true;
        //        mess.Title = mess.Title.MobilePhone(" - ", "Sai định dạng, số điện thoại chỉ có thể là số", "<br/>");
        //    }
        //    return mess;
        //}
        caption = caption[culture];
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ImportCustomer/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
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

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, dataservice, $http, $filter) {
    $scope.currentTab = 'new';
    $scope.checkAllNew = false;
    $scope.checkAllUpdate = false;
    $scope.checkAllError = false;
    $scope.listNew = [];
    $scope.listUpdate = [];
    $scope.listError = [];

    $scope.isSave = false;
    $scope.listSelectd = [];
    var interval = 500000;

    // Get data from excel file
    $scope.loadFile = function (event) {
        $scope.listNew = [];
        $scope.listUpdate = [];
        $scope.listError = [];
        var files = event.target.files;
        if (files != null) {
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var name = files[0].name.substr(0, idxDot - 1).toLowerCase();
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            var excel = ['xlsx', 'xls'];
            if (excel.indexOf(extFile) !== -1) {
                extFile = 1;
            } else {
                extFile = 0;
            }

            if (extFile == 0) {
                App.toastrError(caption.EDMSR_MSG_FORMAT_FILE_NOT_ALLOWED);
                return;
            }
            $scope.$apply();

            App.blockUI({
                target: "#modal-body",
                boxed: true,
                message: 'loading...'
            });
            var formData = new FormData();
            formData.append("FileUpload", files[0]);

            App.blockUI({
                target: "#modal-body",
                boxed: true,
                message: 'loading...'
            });
            dataservice.uploadPayrollBulk(formData, function (rs) {rs=rs.data;
                $scope.importResult = [];
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.importResult = rs.Object;
                    var lenListImport = $scope.importResult.length;
                    for (var i = 0; i < lenListImport; ++i) {
                        
                        var item = {
                            Id: i,
                            Checked: false,
                            Tab: $scope.importResult[i].Tab,
                            CusCode: $scope.importResult[i].CusCode,

                            CusName: $scope.importResult[i].CusName,
                            TaxCode: $scope.importResult[i].TaxCode,
                            Address: $scope.importResult[i].Address,
                            MobilePhone: $scope.importResult[i].MobilePhone,
                            Area: $scope.importResult[i].Area,

                            CusCodeM: $scope.importResult[i].CusCodeM,
                            CusNameM: $scope.importResult[i].CusNameM,
                            AddressM: $scope.importResult[i].AddressM,
                            MobilePhoneM: $scope.importResult[i].MobilePhoneM,
                            AreaM: $scope.importResult[i].AreaM,
                        };
                        if ($scope.importResult[i].Tab == "Error") {
                            $scope.listError.push(item);
                        }
                            
                        else if ($scope.importResult[i].Tab == "Update")
                            $scope.listUpdate.push(item);
                        else {
                            $scope.listNew.push(item);
                        }
                    }
                }
                App.unblockUI("#modal-body");
                console.log($scope.listNew);
                console.log($scope.listError);
            });
        } else {
            App.toastrWarning("ICUS_VALIDATE_FILE_UPLOAD");
        }
        
        //var idxDot = files[0].name.lastIndexOf(".") + 1;
        //var name = files[0].name.substr(0, idxDot - 1).toLowerCase();
        //var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
        //var excel = ['xlsx', 'xls'];
        ////var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'csv'];
        ////var txt = ['txt'];
        ////var word = ['docx', 'doc'];
        ////var pdf = ['pdf'];
        ////var png = ['png', 'jpg'];
        ////var powerPoint = ['pps', 'pptx'];
        //if (excel.indexOf(extFile) !== -1) {
        //    extFile = 1;
        ////} else if (word.indexOf(extFile) !== -1) {
        ////    extFile = 2;
        ////} else if (txt.indexOf(extFile) !== -1) {
        ////    extFile = 3;
        ////} else if (pdf.indexOf(extFile) !== -1) {
        ////    extFile = 4;
        ////} else if (powerPoint.indexOf(extFile) !== -1) {
        ////    extFile = 5;
        ////} else if (png.indexOf(extFile) !== -1) {
        ////    extFile = 6;
        //} else {
        //    extFile = 0;
        //}
        //if (extFile == 0) {
        //    App.toastrError(caption.EDMSR_MSG_FORMAT_FILE_NOT_ALLOWED);
        //    $scope.model.FileName = '';
        //    $scope.model.FileType = '';
        //    return;
        //}
        //$scope.model.FileName = files[0].name;
        //$scope.model.FileType = files[0].type;
        $scope.$apply();
    };

    var input = $("#profile-edit-form").find("input[name=fileupload]");
    var fileName = input.val();

    if (fileName) { // returns true if the string is not empty
        input.replaceWith(input.val('').clone(true));
    }

    // Functions when select 1 tab
    $scope.selectTab = function (para) {
        $scope.currentTab = para;
        $scope.checkAllNew = false;
        $scope.checkAllUpdate = false;
        $scope.checkAllError = false;
        $scope.listSelectd = [];
        if ($scope.currentTab == 'new') {
            $scope.unCheckItemInTabUpdate();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'update') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabError();
        }
        if ($scope.currentTab == 'error') {
            $scope.unCheckItemInTabNew();
            $scope.unCheckItemInTabUpdate();
        }
        $scope.toggleAll();
    }
    $scope.unCheckItemInTabNew = function () {
        var lenListNew = $scope.listNew.length;
        for (var item = 0; item < lenListNew; ++item) {
            $scope.listNew[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabUpdate = function () {
        var lenListUpdate = $scope.listUpdate.length;
        for (var item = 0; item < lenListUpdate; ++item) {
            $scope.listUpdate[item].Checked = false;
        }
    }
    $scope.unCheckItemInTabError = function () {
        var lenListError = $scope.listError.length;
        for (var item = 0; item < lenListError; ++item) {
            $scope.listError[item].Checked = false;
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


    // Funtion select All
    $scope.toggleAll = function () {
        if ($scope.currentTab == 'new') {
            for (var item = 0; item < $scope.listNew.length; ++item) {
                $scope.listNew[item].Checked = $scope.checkAllNew;
            }
        }
        if ($scope.currentTab == 'update') {
            for (var item = 0; item < $scope.listUpdate.length; ++item) {
                $scope.listUpdate[item].Checked = $scope.checkAllUpdate;
            }
        }
        if ($scope.currentTab == 'error') {
            for (var item = 0; item < $scope.listError.length; ++item) {
                $scope.listError[item].Checked = $scope.checkAllError;
            }
        }
    }

    // Funtion select One
    $scope.toggleOne = function (Id) {
        var count = 0;
        if ($scope.currentTab == 'new') {
            var lenListNew = $scope.listNew.length;
            for (var item = 0; item < lenListNew; ++item) {
                if ($scope.listNew[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllNew = false;
                    return;
                }
            }
            if (count == lenListNew)
                $scope.checkAllNew = true;
            else
                $scope.checkAllNew = false;
        }
        if ($scope.currentTab == 'update') {
            var lenListUpdate = $scope.listUpdate.length;
            for (var item = 0; item < lenListUpdate; ++item) {
                if ($scope.listUpdate[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllUpdate = false;
                    return;
                }
            }
            if (count == lenListUpdate)
                $scope.checkAllUpdate = true;
            else
                $scope.checkAllUpdate = false;
        }
        if ($scope.currentTab == 'error') {
            var lenListError = $scope.listError.length;
            for (var item = 0; item < lenListError; ++item) {
                if ($scope.listError[item].Checked == true)
                    count++;
                else {
                    $scope.checkAllError = false;
                    return;
                }
            }
            if (count == lenListError)
                $scope.checkAllError = true;
            else
                $scope.checkAllError = false;
        }
    }

    $scope.deleteItems = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                if ($scope.currentTab == 'new') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listNew.indexOf(e);
                        $scope.listNew.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
                else if ($scope.currentTab == 'update') {
                    $scope.listSelectd.forEach(function (e) {
                        var index = $scope.listUpdate.indexOf(e);
                        $scope.listUpdate.splice(index, 1);
                    });
                    $scope.listSelectd = [];
                }
            }
            else {
                App.toastrWarning(caption.COM_MSG_RECORD_DELETE);
            }
        }
    }

    $scope.saveAllItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listSelectd = $scope.listNew;
            }
            else if ($scope.currentTab == 'update') {
                $scope.listSelectd = $scope.listUpdate;
            }
            var lenListAll = $scope.listSelectd.length;

            if (lenListAll > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                setTimeout(checkProgress, interval);
                dataservice.saveItems($scope.listSelectd, function (rs) {rs=rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);
                        if ($scope.currentTab == 'new') {
                            $scope.listNew = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listUpdate = [];
                        }
                    }
                    $scope.isSave = false;
                    document.getElementById("File").value = "";
                    App.unblockUI("#modal-body");
                    //$scope.reload();
                    //window.location.reload();

                    
                });
            }
            else {
                App.toastrWarning(caption.COM_MSG_NOT_EXIST_RECORD);
            }

        }
        
    }
    $scope.saveSelectedItem = function () {
        if (!$scope.isSave) {
            if ($scope.currentTab == 'new') {
                $scope.listNew.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            else if ($scope.currentTab == 'update') {
                $scope.listUpdate.forEach(function (obj) {
                    if (obj.Checked) $scope.listSelectd.push(obj);
                });
            }
            var lenListSelected = $scope.listSelectd.length;

            if (lenListSelected > 0) {
                $scope.isSave = true;

                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });

                setTimeout(checkProgress, interval);
                dataservice.saveItems($scope.listSelectd, function (rs) {rs=rs.data;
                    if (rs.Error)
                        App.toastrError(rs.Title);
                    else {
                        App.toastrSuccess(rs.Title);

                        if ($scope.currentTab == 'new') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listNew.indexOf(e);
                                $scope.listNew.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                        else if ($scope.currentTab == 'update') {
                            $scope.listSelectd.forEach(function (e) {
                                var index = $scope.listUpdate.indexOf(e);
                                $scope.listUpdate.splice(index, 1);
                            });
                            $scope.listSelectd = [];
                        }
                    }
                    $scope.isSave = false;
                    document.getElementById("File").value = "";
                    App.unblockUI("#modal-body");
                    //window.location.reload();
                    //$uibModalInstance.close();
                });
            }
            else {
                App.toastrWarning(caption.COM_MSG_RECORD_ADD);
            }
        }
    }
    function checkProgress() {
        $.ajax({
            type: 'POST',
            url: '/Admin/ImportCustomer/GetPercent',
            cache: false,
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                if (data != 'Done') {
                    $scope.progress = data;
                    setTimeout(checkProgress, interval);
                }
                else
                    $scope.progress = '';
                $scope.$apply();
            }
        });
    }

    $scope.exportError = function () {
        if ($scope.listError.length == 0) {
            return App.toastrError("Không có bản ghi lỗi");
        }
        var url = "/Admin/ImportCustomer/ExportError";
        location.href = url;
    }
});
