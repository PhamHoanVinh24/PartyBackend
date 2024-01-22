var ctxfolderFilePlugin = "/views/admin/filePlugin";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_FILE_PLUGIN', ['App_ESEIM_REPOSITORY', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngFileUpload']);

app.directive('customOnChangeFilePlugin', function () {
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
app.factory('dataserviceFilePlugin', function ($http) {
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
        //Permission File
        getListUserShare: function (callback) {
            $http.post('/Admin/EDMSRepository/GetListUser').then(callback);
        },
        getUserShareFilePermission: function (data, callback) {
            $http.post('/Admin/CardJob/GetUserShareFilePermission?id=' + data).then(callback);
        },
        insertFileShareObject: function (data, callback) {
            $http.post('/Admin/FilePlugin/InsertFileShareObject', data).then(callback);
        },
        deleteShareFile: function (data, data1, callback) {
            $http.post('/Admin/CardJob/DeleteShareFile?id=' + data + '&userName=' + data1).then(callback);
        },
        autoShareFilePermission: function (data, callback) {
            $http.post('/Admin/FilePlugin/AutoShareFilePermission', data).then(callback);
        },
        getListUserShareActCat: function (data, callback) {
            $http.post('/Admin/Activity/GetListUserShare?actCode=' + data).then(callback);
        },

        //Default repo setup
        getDefaultRepo: function (data, data1, callback) {
            $http.post('/Admin/Supplier/GetDefaultRepo?objectCode=' + data + '&objectType=' + data1).then(callback);
        },
        setupDefaultRepoObject: function (data, data1, data2, callback) {
            $http.post('/Admin/Supplier/SetupDefaultRepoObject?objectCode=' + data + '&objectType=' + data1 + '&cateRepoSettingId=' + data2).then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },

        //File
        insertObjectFile: function (data, callback) {
            submitFormUpload('/Admin/FilePlugin/InsertObjectFile/', data, callback);
        },
        pasteObjectFile: function (data, callback) {
            $http.post('/Admin/FilePlugin/PasteObjectFile/', data, callback);
        },
        deleteObjectFile: function (data, callback) {
            $http.post('/Admin/FilePlugin/DeleteObjectFile?id=' + data).then(callback);
        },

        //View file
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/EDMSRepository/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM_FILE_PLUGIN', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
            var mess = { Status: false }
            if (!partternCode.test(data)) {
                mess.Status = true;
            }
            return mess;
        }
    });

});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AssetType/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderFilePlugin + '/index.html',
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {

});

app.controller('file-plugin', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceFilePlugin, $filter, $window, Upload, $timeout) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $rootScope.progress = [];
    $scope.progressModal = {};
    $scope.isProgressModelOpen = false;
    $scope.model = {
        FromDate: '',
        ToDate: ''
    }
    $scope.headerCompiledFP = false;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/FilePlugin/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#dropzone",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ObjCode = $rootScope.ObjCode;
                d.ObjType = $rootScope.ObjectTypeFile;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                //heightTableManual(250);
                App.unblockUI("#dropzone");
                heightTableManual(250, "#tblDataObjectFile")
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiledFP) {
                $scope.headerCompiledFP = true;
                $compile(angular.element(header).contents())($scope);
                $timeout(function () {
                    $scope.$apply();
                })
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
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ContractFileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('{{"FILE_PLUG_NAME_FILE" | translate}}').withOption('sClass', 'first-col-sticky mnw200').renderWith(function (data, type, full) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withTitle('{{"FILE_PLUG_WAREHOUSE_DATA" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return '<i class="fa fa-folder-open icon-state-warning"></i>&nbsp' + data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"FILE_PLUG_CREATE_DATE" | translate}}').withOption('sClass', 'w75 text-center nowrap').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').withOption('sClass', 'w75 text-center nowrap').withTitle("Xem nội dung").notSortable().renderWith(function (data, type, full) {
    //    var excel = ['.XLSM', '.XLSX', '.XLS'];
    //    var document = ['.TXT'];
    //    var word = ['.DOCX', '.DOC'];
    //    var pdf = ['.PDF'];
    //    var powerPoint = ['.PPS', '.PPTX', '.PPT'];
    //    var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];

    //    var mode = 2;
    //    if (full.ListUserShare != "" && full.ListUserShare != null && full.ListUserShare != undefined) {
    //        var lstShare = JSON.parse(full.ListUserShare);
    //        if (lstShare.length > 0) {
    //            for (var i = 0; i < lstShare.length; i++) {
    //                if (lstShare[i].Code == userName) {
    //                    if (lstShare[i].Permission != null) {
    //                        if (!lstShare[i].Permission.Write) {
    //                            mode = 0;
    //                            break;
    //                        }
    //                    }
    //                }
    //            }
    //        }
    //    }

    //    if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
    //        typefile = 'excel';
    //        return '<a ng-click="viewExcel(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20"></i></a>';
    //    } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
    //        typefile = 'word';
    //        return '<a ng-click="viewWord(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20"></i></a>';
    //    } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
    //        typefile = 'pdf';
    //        return '<a ng-click="viewPDF(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20"></i></a>';
    //    } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
    //        return '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20"></i></a>';
    //    } else {
    //        return '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20"></i></a>';
    //    }
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('').withTitle('Mô tả').withOption('sClass', 'w75 text-center nowrap').notSortable().renderWith(function (data, type, full) {
    //    return '<button title="Mô tả" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info-circle"></i></button>';
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeFile').withTitle('{{"FILE_PLUG_FILE_TYPE" | translate}}').withOption('sClass', 'w75 text-center nowrap').notSortable().renderWith(function (data, type, full) {
        if (data == "SHARE") {
            return "<label class='text-primary'>Tệp được chia sẻ</label>";
        } else {
            return "Tệp gốc";
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"FILE_PLUG_ACTION" | translate}}').withOption('sClass', 'w75 text-center nowrap').notSortable().renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];

        var htmlData = '';

        var mode = 2;
        if (full.ListUserShare != "" && full.ListUserShare != null && full.ListUserShare != undefined) {
            var lstShare = JSON.parse(full.ListUserShare);
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (lstShare[i].Permission != null) {
                            if (!lstShare[i].Permission.Write) {
                                mode = 0;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'excel';
            htmlData += '<a ng-click="viewExcel(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20 pr10"></i></a>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'word';
            htmlData += '<a ng-click="viewWord(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20 pr10"></i></a>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            typefile = 'pdf';
            htmlData += '<a ng-click="viewPDF(' + full.Id + ', ' + mode + '' + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20 pr10"></i></a>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            htmlData += '<a ng-click="view(' + full.Id + ')" title="{{&quot; Chỉnh sửa &quot; | translate}}" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20 pr10"></i></a>';
        } else {
            htmlData += '<a ng-click="getObjectFile(0)" title="{{&quot; Chỉnh sửa &quot; | translate}}" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit pt5 fs20 pr10"></i></a>';
        }

        htmlData += '<a title="Mô tả" ng-click="extension(' + full.FileID + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-info-circle fs20 pr10"></i></a>';

        if (full.TypeFile == "SHARE") {
            htmlData += '<a ng-click="download(\'' + full.FileCode + '\')" target="_blank" style1="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class1="btn btn-icon-only btn-circle btn-outline green " download><i class="fas fa-download fs20"></i></a>';
        } else {
            htmlData += '<a ng-click="share(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" title="Chia sẻ - ' + full.FileName + '" class1="btn btn-icon-only btn-circle btn-outline blue "><i class="fas fa-share-alt fs20 pr10"></i></a>' +
                '<a ng-click="download(\'' + full.FileCode + '\')"  style1="width: 25px; height: 25px; padding: 0px" title="Tải xuống - ' + full.FileName + '" class1="btn btn-icon-only btn-circle btn-outline green"><i class="fas fa-download fs20 pr10"></i></a>' +
                '<a title="Xoá" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt text-danger fs20"></i></a>';
        }
        return htmlData;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Url').withTitle('{{"FILE_PLUG_ADDRESS_PHYSICS" | translate}}').withOption('sClass', 'w75 text-center nowrap').notSortable().renderWith(function (data, type, full) {
        return /*'<button title="Địa chỉ vật lý" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-link" aria-hidden="true"></i></button>'*/data;
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

    $scope.add = function () {
        if ($scope.file == '' || $scope.file == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        }
        else if ($scope.file.size > 104857600) {
            App.toastrError('File không được quá 100mb');
            //App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
        } else {
            var data = new FormData();
            data.append("FileUpload", $scope.file);
            data.append("ObjectCode", $rootScope.ObjCode);
            data.append("ObjectType", $rootScope.ObjectTypeFile);
            data.append('ModuleName', $rootScope.moduleName);
            data.append("IsMore", false);
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });
            dataserviceFilePlugin.insertObjectFile(data, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                    App.unblockUI("#contentMain");
                } else {
                    App.toastrSuccess(result.Title);
                    defaultShareFile(result.ID);
                    $scope.reload();
                    App.unblockUI("#contentMain");
                    $scope.file = null;
                    $('.inputFile').val('');
                }
            });
        }
    }

    $scope.delete = function (id) {
        var userModel = {};
        var listdata = $('#tblDataObjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isDelete = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Delete) {
                            isDelete = false;
                            break;
                        }
                    }
                }
                if (!isDelete) {
                    return App.toastrError("Bạn không có quyền xóa tệp tin");
                }
            }
        }

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceFilePlugin.deleteObjectFile(id, function (result) {
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
            controller: 'contractTabFileShare',
            windowClass: 'modal-center',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            reloadData()
        }, function () { });
    }

    $scope.download = function (fileCode) {
        var userModel = {};
        var listdata = $('#tblDataObjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].FileCode == fileCode) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isDownload = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isDownload = false;
                            break;
                        }
                    }
                }
                if (!isDownload) {
                    return App.toastrError("Bạn không có quyền tải tệp tin");
                }
            }
        }
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }

    $scope.extend = function () {
        dataserviceFilePlugin.getDefaultRepo($rootScope.ObjCode, $rootScope.ObjectTypeFile, function (rs) {
            rs = rs.data;
            var data = rs !== null ? rs : { CatCode: '', ObjectCode: $rootScope.ObjCode, ObjectType: $rootScope.ObjectTypeFile };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderFilePlugin + '/setup-repo-default.html',
                controller: 'setup-repo-plugin-file',
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
    };

    $scope.loadFile = function (event) {
        console.log(event);
        if (event.target.files.length > 0) {
            $scope.file = event.target.files[0];
        }
    };

    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceFilePlugin.getItemFile(id, true, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                var object = rs.Object;
                if (object != null && object.Type == "DRIVER") {
                    console.log(object.Link);
                    $window.open(object.Link, '_blank');
                } else {
                    return null;
                }
            });
        }
    };

    $scope.viewExcel = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataObjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceFilePlugin.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                console.log(object.Link);
                                $window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/Excel#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            $window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/Excel#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError("Tệp tin lớn hơn 20MB");
            }

        }
    };

    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataObjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {

            if (userModel.SizeOfFile < 20971520) {
                dataserviceFilePlugin.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                console.log(object.Link);
                                $window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/Docman#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            $window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/Docman#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError("Vui lòng chọn tệp tin nhỏ hơn 20MB");
            }
        }
    };

    $scope.viewPDF = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblDataObjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (userModel.SizeOfFile < 20971520) {
                dataserviceFilePlugin.getItemFile(id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                console.log(object.Link);
                                $window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/PDF#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            $window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/PDF#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError("Vui lòng chọn tệp tin nhỏ hơn 20MB");
            }
        }
    };

    $scope.view = function (id) {
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblDataObjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel.ListUserShare != "" && userModel.ListUserShare != null && userModel.ListUserShare != undefined) {
            var lstShare = JSON.parse(userModel.ListUserShare);
            var isView = true;
            if (lstShare.length > 0) {
                for (var i = 0; i < lstShare.length; i++) {
                    if (lstShare[i].Code == userName) {
                        if (!lstShare[i].Permission.Write && !lstShare[i].Permission.Read) {
                            isView = false;
                            break;
                        }
                    }
                }
                if (!isView) {
                    return App.toastrError("Bạn không có quyền xem tệp tin");
                }
            }
        }

        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            dataserviceFilePlugin.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {
                        window.open(rs.Object, '_blank')
                    } else
                        $scope.openViewer(rs.Object, isImage);
                }
                else {

                }
            });
        }
        else {
            dataserviceFilePlugin.createTempFile(id, false, "", function (rs) {
                rs = rs.data;
                rs.Object = encodeURI(rs.Object);
                if (rs.Error == false) {
                    if (isImage == false) {

                        var url = window.location.origin + '/' + rs.Object;
                        window.open(url, '_blank')
                    }
                    else
                        $scope.openViewer(rs.Object, isImage);
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
            templateUrl: ctxfolderFilePlugin + '/viewer.html',
            controller: 'viewer-plugin',
            backdrop: 'false',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
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

    $scope.share = function (id) {
        var userModel = {};
        var listdata = $('#tblDataObjectFile').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        debugger
        if (userModel.CreatedBy != userName) {
            return App.toastrError("Bạn không có quyền thực hiện chức năng này");
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderFilePlugin + '/shareFile.html',
            controller: 'share-file-object',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Id: id
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.modelShare = {
        Id: '',
        LstShare: '',
        ObjectType: $rootScope.ObjectTypeFile
    };

    $scope.permission = {
        Read: true,
        Write: true,
        Delete: true
    };

    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    $scope.uploadFile = function (files) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file == '' || file == undefined) {
                App.toastrError(caption.COM_MSG_CHOSE_FILE);
            }
            else if (file.size > 20971520) {
                App.toastrError(caption.COM_MSG_CHOSE_FILE_20MB);
            } else {
                var data = {};
                data.FileUpload = file;
                data.ObjectCode = $rootScope.ObjCode;
                data.ObjectType = $rootScope.ObjectTypeFile;
                data.ModuleName = $rootScope.moduleName;
                data.IsMore = false;
                data.uuid = create_UUID();

                if (!$scope.isProgressModelOpen) {
                    $scope.viewProgress();
                }
                $rootScope.progress.push({ name: data.FileUpload.name, uuid: data.uuid, progress: '0%', style: { 'width': '0%' } });

                Upload.upload({
                    url: '/Admin/FilePlugin/InsertObjectFile/',
                    data: data
                }).then(function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        defaultShareFile(result.ID);
                        $scope.reload();
                    }
                    var index = $rootScope.progress.findIndex(x => x.uuid == result.Object);
                    $rootScope.progress.splice(index, 1);
                    if ($rootScope.progress.length == 0) {
                        $scope.progressModal.close("End uploading");
                        $scope.isProgressModelOpen = false;
                    }
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    var data = evt.config.data;
                    var index = $rootScope.progress.findIndex(x => x.uuid == data.uuid);
                    $rootScope.progress[index].progress = progressPercentage + '% ';
                    $rootScope.progress[index].style.width = progressPercentage + '% ';
                });
            }
        }
    };

    $scope.viewProgress = function () {
        $scope.progressModal = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageProgressUpload.html',
            backdrop: false,
            windowClass: "progress-modal",
            appendTo: angular.element(document).find('#dropzone'),
            controller: function ($scope, $uibModalInstance) {
                $scope.cancelUpload = function () {

                };

                //$scope.cancel = function () {
                //    $uibModalInstance.dismiss('cancel');
                //};
            },
            size: '100',
        });
        $scope.progressModal.opened.then(function (d) {
            $scope.isProgressModelOpen = true;
        }, function () {
        });
        $scope.progressModal.result.then(function (d) {
        }, function () {
        });
    };

    function defaultShareFile(id) {
        if ($rootScope.ObjectTypeFile != "ACT_CAT") {
            dataserviceFilePlugin.getListUserShare(function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
                $scope.lstUserShare = [];
                if ($scope.listUser.length > 0) {
                    for (var i = 0; i < $scope.listUser.length; i++) {
                        var item = {
                            Code: $scope.listUser[i].Code,
                            Name: $scope.listUser[i].Name,
                            DepartmentName: $scope.listUser[i].DepartmentName,
                            Permission: $scope.permission
                        }
                        $scope.lstUserShare.push(item);
                    }
                    $scope.modelShare.Id = id;
                    $scope.modelShare.LstShare = JSON.stringify($scope.lstUserShare);
                    dataserviceFilePlugin.autoShareFilePermission($scope.modelShare, function (rs) { })
                }
            });
        }
        else {
            dataserviceFilePlugin.getListUserShareActCat($rootScope.ObjCode, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
                $scope.lstUserShare = [];
                if ($scope.listUser.length > 0) {
                    for (var i = 0; i < $scope.listUser.length; i++) {
                        var item = {
                            Code: $scope.listUser[i].Code,
                            Name: $scope.listUser[i].Name,
                            DepartmentName: $scope.listUser[i].DepartmentName,
                            Permission: $scope.permission
                        }
                        $scope.lstUserShare.push(item);
                    }
                    $scope.modelShare.Id = id;
                    $scope.modelShare.LstShare = JSON.stringify($scope.lstUserShare);
                    dataserviceFilePlugin.autoShareFilePermission($scope.modelShare, function (rs) { })
                }
            });
        }
    };

    setTimeout(function () {

    }, 200);
});

app.controller('share-file-object', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceFilePlugin, para) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    };

    $scope.model = {
        UserName: ''
    };

    $scope.model1 = {
        Code: '',
        Name: '',
        DepartmentName: '',
        Id: para.Id,
        ObjectType: $rootScope.ObjectTypeFile
    };

    $scope.permission = {
        Read: true,
        Write: true,
        Delete: true
    };

    $scope.init = function () {
        $scope.model.Id = para.Id;
        if ($rootScope.ObjectTypeFile != "ACT_CAT") {
            dataserviceFilePlugin.getListUserShare(function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        }
        else {
            dataserviceFilePlugin.getListUserShareActCat($rootScope.ObjCode, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
            });
        }
        dataserviceFilePlugin.getUserShareFilePermission($scope.model.Id, function (rs) {
            rs = rs.data;
            $scope.lstUserSharePermission = rs;
        })
    };

    $scope.init();

    $scope.share = function () {
        if ($scope.model.UserName == '') {
            return App.toastrError("Vui lòng chọn nhân viên");
        }
        $scope.model1.Permission = $scope.permission;
        dataserviceFilePlugin.insertFileShareObject($scope.model1, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceFilePlugin.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.updatePermission = function (item, position, value) {
        item.Id = para.Id;
        if (position == 0) {
            if (value) {
                item.Permission.Read = false;
                item.Permission.Write = false;
                item.Permission.Delete = false;
            }
            else {
                item.Permission.Read = true;
            }
        }
        else if (position == 1) {
            if (value) {
                item.Permission.Write = false;
                item.Permission.Delete = false;
            }
            else {
                item.Permission.Write = true;
                item.Permission.Read = true;
            }
        }
        else {
            if (value) {
                item.Permission.Delete = false;
            }
            else {
                item.Permission.Delete = true;
                item.Permission.Read = true;
                item.Permission.Write = true;
            }
        }
        dataserviceFilePlugin.insertFileShareObject(item, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceFilePlugin.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.deleteShare = function (userName) {
        dataserviceFilePlugin.deleteShareFile(para.Id, userName, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                App.toastrSuccess(rs.Title);
                dataserviceFilePlugin.getUserShareFilePermission($scope.model.Id, function (rs) {
                    rs = rs.data;
                    $scope.lstUserSharePermission = rs;
                })
            }
        })
    }

    $scope.changeUser = function (item) {
        debugger
        $scope.model1.Name = item.Name;
        $scope.model1.Code = item.Code;
        $scope.model1.DepartmentName = item.DepartmentName;
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('setup-repo-plugin-file', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataserviceFilePlugin, para) {
    $scope.treeDataCategory = [];
    if (para != null) {
        $scope.catCode = para.CatCode;
        $scope.objectCode = para.ObjectCode;
        $scope.objectType = para.ObjectType;
    }
    $scope.model = {
        NumberDocument: '',
        Tags: '',
        Desc: '',
        IsScan: false
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FolderName').withTitle('{{"Thư mục lưu trữ" | translate}}').withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
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
                else {
                    $scope.submit(itemId);
                }
            }
        }
    }

    $scope.loadFile = function (event) {
        $scope.file = event.target.files[0];
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.submit = function (id) {
        var itemSelect = [];
        /*for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    itemSelect.push(id);
                }
            }
        }*/
        itemSelect.push(id);
        if (itemSelect.length == 0) {
            App.toastrError(caption.EDMSR_MSG_CHOOSE_DOC_SAVE);
            return;
        }
        else if (itemSelect.length > 1) {
            App.toastrError(caption.EDMSR_MSG_PLS_SELECT_A_FORDER);
            return;
        }
        dataserviceFilePlugin.setupDefaultRepoObject($scope.objectCode, $scope.objectType, itemSelect[0], function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        })
    };

    $scope.ordering = function () {
        if ($scope.file === undefined || $scope.file === null) {
            return App.toastrError(caption.EDMST_MSG_SELECT_FILE_BEFORE);
        };

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRepository + '/orderDocument.html',
            controller: 'orderDocument',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return $scope.file;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.extension = function () {
        if ($scope.file === undefined || $scope.file === null) {
            return App.toastrError(caption.EDMST_MSG_SELECT_FILE_BEFORE);
        };

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRepository + '/extension.html',
            controller: 'extension',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return {
                        Type: 'DETAIL',
                        Object: $scope.file
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
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
            dataserviceFilePlugin.getTreeCategory(function (result) {
                result = result.data;
                if (!result.Error) {
                    var root = {
                        id: 'root',
                        parent: "#",
                        text: caption.EDMSR_LBL_ALL_CATEGORY,//"Tất cả kho dữ liệu"
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
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('viewer-plugin', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, para, $sce) {
    var data = para;
    $scope.url = data.url;
    $scope.isImage = data.isImage;
    if ($scope.isImage)
        $scope.url = "/" + $scope.url;
    $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.url);
});
