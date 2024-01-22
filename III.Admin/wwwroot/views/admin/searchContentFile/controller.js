var ctxfolder = "/views/admin/searchContentFile";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD','App_ESEIM_REPOSITORY', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);

app.directive('customOnChangeCardjob', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCardjob);
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
            data: data
        }
        $http(req).then(callback);
    };
    return {
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
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

        getDataType: function (callback) {
            $http.get('/Admin/SearchContentFile/GetDataType').then(callback);
        },
        getTreeCategory: function (callback) {
            $http.post('/Admin/EDMSRepository/GetTreeCategory').then(callback);
        },
        exportExcel: function (callback) {
            $http.post('/Admin/SearchContentFile/ExportExcel').then(callback);
        },
        convertImageToPdf: function (data, callback) {
            $http.post('/Admin/FileImageToPdf/ConvertImageToPdf?id=' + data).then(callback);
        },
        performOCR: function (data, callback) {
            $http.post('/Admin/FileImageToPdf/PerformOCR?id=' + data).then(callback);
        },
        performOcrEdms: function (data, callback) {
            $http.post('/Admin/FileImageToPdf/PerformOcrEdms', data).then(callback);
        },
        getGroupKeySearch: function (callback) {
            $http.post('/Admin/SearchContentFile/GetGroupKeySearch').then(callback);
        },
        getUnitKeyWord: function (callback) {
            $http.post('/Admin/SearchContentFile/GetUnitKeyWord').then(callback);
        },
        getTypeKeyWord: function (callback) {
            $http.post('/Admin/SearchContentFile/GetTypeKeyWord').then(callback);
        },
        insertKeyWord: function (data, callback) {
            $http.post('/Admin/SearchContentFile/InsertKeyWord', data).then(callback);
        },
        getItemKeyWord: function (data, callback) {
            $http.post('/Admin/SearchContentFile/GetItemKeyWord?id=' + data).then(callback);
        },
        updateKeyWord: function (data, callback) {
            $http.post('/Admin/SearchContentFile/UpdateKeyWord', data).then(callback);
        },
        deleteKeyWord: function (data, callback) {
            $http.post('/Admin/SearchContentFile/DeleteKeyWord?id=' + data).then(callback);
        },
        getPoolKeyWord: function (callback) {
            $http.post('/Admin/SearchContentFile/GetPoolKeyWord').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/SearchContentFile/GetUser').then(callback);
        },
        deleteFile: function (data, callback) {
            $http.post('/Admin/EDMSRepository/DeleteFile', data).then(callback);
        },
        deleteFileOCR: function (data, callback) {
            $http.post('/Admin/SearchContentFile/DeleteFileOCR', data).then(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/SearchContentFile/InsertFile', data, callback);
        },
        deleteResultOCR: function (data, callback) {
            $http.post('/Admin/SearchContentFile/DeleteResultOCR?id=' + data).then(callback);
        },
        getInfoGroup: function (data, callback) {
            $http.get('/Admin/SearchContentFile/GetInfoGroup?group=' + data).then(callback);
        },
        searchInFile: function (data, callback) {
            $http.post('/Admin/SearchContentFile/SearchInFile', data).then(callback);
        }
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ActCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.AA_CURD_LBL_AA_ACTCODE), "<br/>");
            }
            if (!partternName.test(data.ActTitle)) {
                mess.Status = true;
                mess.Title += caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.AA_CURD_LBL_AA_ACTTITLE) + "<br/>";
                //mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.USER_USERNAME) + "<br/>";
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                //Code: {
                //    required: true,
                //},
                Name: {
                    required: true,
                },
            },
            messages: {
                //Code: {
                //    required: "Mã không được bỏ trống",
                //},
                Name: {
                    required: caption.SEARCH_CT_FILE_NAME_NOT_BLANK,
                }
            }
        }
        $rootScope.IsTranslate = true;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/SearchContentFile/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
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
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, dataserviceRepository) {
    $scope.model = {
        ListRepository: [],
        CatCode: "",
        Group: ""
    }

    $scope.initData = function () {
        dataservice.getGroupKeySearch(function (rs) {
            rs = rs.data;
            $scope.lstGroupKeySearch = rs;
        })
        dataservice.getUser(function (rs) {
            rs = rs.data;
            $scope.lstUser = rs;
        })
        dataservice.getTreeCategory(function (rs) {
            rs = rs.data;
            $scope.lstCat = rs;
        })
    }
    $scope.initData();

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/FileImageToPdf/JTableFile",
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
                heightTableAuto();
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ActivityId;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle('{{"EDMSR_LIST_COL_FILE_NAME" |translate}}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o pr5" aria-hidden="true"></i>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o pr5" aria-hidden="true"></i>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o pr5" aria-hidden="true"></i>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o pr5" aria-hidden="true"></i>';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o pr5" aria-hidden="true"></i>';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o pr5" aria-hidden="true"></i>';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify pr5" aria-hidden="true"></i>';
        }
        var downloadSearch = "/ &nbsp;<a ng-click='downloadSearch(" + full.Id + ")'> Search_" + data + "</a>\n";

        $scope.countFile = full.Count;

        var updateTime = '';
        var fileSize = 0;
        if (full.SizeOfFile != null) {
            //fileSize = (full.SizeOfFile / 1024000).toFixed(0);
            var kb = 1024;
            var mb = 1024 * kb;
            var gb = 1024 * mb;
            var dt = full.SizeOfFile / gb;
            if (full.SizeOfFile / gb > 1) {
                fileSize = Math.floor(full.SizeOfFile / gb) + " GB";
            }
            else if (full.SizeOfFile / mb > 1) {
                fileSize = Math.floor(full.SizeOfFile / mb) + " MB";
            }
            else if (full.SizeOfFile / kb > 1) {
                fileSize = Math.floor(full.SizeOfFile / kb) + " KB";
            }
            else {
                fileSize = full.SizeOfFile + " Byte";
            }

            fileSize = '<div><span class="badge-customer badge-customer-success">' + fileSize + '</span></div>';
        }

        if (full.UpdateTime != "" && full.UpdateTime != null && full.UpdateTime != undefined) {
            updateTime = '<div><span class="badge-customer badge-customer-black">' + full.UpdateTime + '</span></div>'
        }
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) != -1 || word.indexOf(full.FileTypePhysic.toUpperCase()) != -1
            || pdf.indexOf(full.FileTypePhysic.toUpperCase()) != -1 || powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'excel';
                var file = '<a ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isSearchContent)
                        file = file + downloadSearch;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime + fileSize;
                } else {
                    return icon + '<a ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize;
                }
            } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'Syncfusion';
                var file = '<a ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isSearchContent)
                        file = file + downloadSearch;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime + fileSize;
                } else {
                    return icon + '<a ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize;
                }
            } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'pdf';
                var file = '<a ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isSearchContent)
                        file = file + downloadSearch;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime;
                } else {
                    return icon + '<a ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>' + updateTime + fileSize;
                }
            } else {
                return icon + '<a ng-click="getObjectFile(0)">' + data + '</a>' + updateTime + fileSize;
            }
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                if ($scope.isSearchContent)
                    file = file + downloadSearch;
                var content = "<div>" + full.Content + "</div>";

                return icon + file + content + updateTime + fileSize;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize;
            }
        }
        else if (document.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                var content = "<div>" + full.Content + "</div>";
                return file + content + updateTime + fileSize;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize;
            }
        }
        else if (image.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                var content = "<div>" + full.Content + "</div>";
                return file + content + updateTime + fileSize;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize;
            }
        }
        else {
            return data + updateTime + fileSize;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withOption('sClass', '').withTitle('{{"EDMSR_LIST_COL_SERVER" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withOption('sClass', '').withTitle('{{"EDMSR_LBL_PATH" | translate}}').renderWith(function (data, type, full) {
        var currentPath = "";
        if (full.CloudFileId != null && full.CloudFileId != "") {
            currentPath = full.CatName;
        }
        else {
            currentPath = full.CatName;
        }
        return currentPath;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSR_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle('{{"EDMSR_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        //return '<a ng-click="" style="width: 25px; height: 25px; padding: 0px" title="{{&quot; Xuất excel kết quả tệp tin &quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-file-excel-o pt5"></i></a>' +
        //    '<a ng-click="" style="width: 25px; height: 25px; padding: 0px" title="{{&quot; Chi tiết kết quả tệp tin &quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-eye pt5"></i></a>' +
        return '<div title="{{"SEARCH_CT_FILE_DELETE" | translate}}" ng-click="deleteFile(' + full.Id + ')" /*style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);"*/ class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;"></i></div>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
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


    $rootScope.search = function (id) {
        reloadData(true);
    };

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.deleteFile = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.EDMSR_MSG_DELETE_FILE;
                $scope.ok = function () {
                    dataservice.deleteFile(id, function (rs) {
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
            $scope.reload();
        }, function () {
        });
    }

    $scope.ocrPdf = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/ocrPdf.html',
            controller: 'ocrPdf',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.performOCREdms = function () {
        
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        var ids = [];
        $scope.dataExport = "";
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    ids.push(id);
                }
            }
        }
        if (ids.length == 0) {
            return App.toastrError("Vui lòng chọn tệp tin");
            App.unblockUI("#contentMain");
        }
        dataservice.performOcrEdms(ids, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
                App.unblockUI("#contentMain");
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
                App.unblockUI("#contentMain");
            }
        })
    }

    $scope.addKeyWord = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addKeyWord.html',
            controller: 'addKeyWord',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return $scope.model.Group;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () {
        });
    }

    $scope.resultOCR = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/resultOCR.html',
            controller: 'resultOCR',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return $scope.model.Group;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.ocrFile = function () {
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        $scope.model.Length = 10;
        dataservice.searchInFile($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
                App.unblockUI("#contentMain");
            }
            else {
                App.toastrSuccess(rs.Title);
                App.unblockUI("#contentMain");
            }
        })
    }

    $scope.exportExcel = function () {
        dataservice.exportExcel(function (rs) {
            rs = rs.data;
            App.unblockUI("#contentMain");
            download(rs.fileName, '/' + rs.pathFile);
        });
    }

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', text);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    $scope.addAttachment = function () {
        if ($scope.model.CatCode == '') {
            App.toastrError(caption.SEARCH_CT_FILE_PLS_SELECT_FOLDER)
        } else {
            $("#fileAttachment").trigger("click");
        }
    }

    $scope.loadAttachment = function (event) {
        
        var file = event.target.files[0];
        if (file != undefined) {
            var formData = new FormData();
            formData.append("FileUpload", file);

            var fileName = $('#fileAttachment').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            var fileName = fileName.split('\\');
            formData.append("FileName", fileName[fileName.length - 1]);
            formData.append("FileType", extFile);
            formData.append("CatCode", $scope.model.CatCode);
            dataservice.insertFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            })
        }
    }

    $scope.addFile = function () {
        var data = { CatCode: '', ObjectCode: '', ObjectType: '' };
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderRepository + '/addFile.html',
            controller: 'addFile',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.deleteFiles = function () {
        var ids = [];
        $scope.dataExport = "";
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    ids.push(id);
                }
            }
        }
        if (ids.length == 0) {
            return App.toastrError("Vui lòng chọn tệp tin");
        }
        dataservice.deleteFileOCR(ids, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        })
    }

    $scope.view = function (id) {
        var isImage = false;
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
            isImage = true;
        }
        var dt = null;
        //for (var i = 0; i < $scope.treeData.length; ++i) {
        //    var item = $scope.treeData[i];
        //    if (item.id == userModel.Category) {
        //        dt = item;
        //        break;
        //    }
        //}
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            if (dt != null)
                $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            else
                $scope.currentPath = "Google Driver/" + userModel.FileName;
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceRepository.createTempFile(id, $scope.isSearchContent, $scope.content, function (rs) {
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
            if (dt != null)
                $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
            else
                $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
            dataserviceRepository.createTempFile(id, false, '', function (rs) {
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
            templateUrl: ctxfolderRepository + '/viewer.html',
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

    setTimeout(function () {
    }, 200);
});

app.controller('ocrPdf', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $uibModalInstance, dataservice) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/FileImageToPdf/JTableFile",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            //search
            data: function (d) {

            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ActivityId;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withOption('sClass', '').withTitle('{{"EDMSR_LIST_COL_FILE_NAME" |translate}}').renderWith(function (data, type, full) {
        var excel = ['.XLSM', '.XLSX', '.XLS'];
        var document = ['.TXT'];
        var word = ['.DOCX', '.DOC'];
        var pdf = ['.PDF'];
        var powerPoint = ['.PPS', '.PPTX', '.PPT'];
        var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
        var icon = "";
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(106,170,89);font-size: 15px;" class="fa fa-file-excel-o pr5" aria-hidden="true"></i>';
        } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(13,118,206);font-size: 15px;" class="fa fa-file-word-o pr5" aria-hidden="true"></i>';
        } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(0,0,0);font-size: 15px;" class="fa fa-file-text-o pr5" aria-hidden="true"></i>';
        } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-pdf-o pr5" aria-hidden="true"></i>';
        } else if (powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(226,165,139);font-size: 15px;" class="fa fa-file-powerpoint-o pr5" aria-hidden="true"></i>';
        } else if (image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fa fa-picture-o pr5" aria-hidden="true"></i>';
        } else {
            icon = '<i style="color: rgb(42,42,42);font-size: 15px;" class="fas fa-align-justify pr5" aria-hidden="true"></i>';
        }
        var downloadSearch = "/ &nbsp;<a ng-click='downloadSearch(" + full.Id + ")'> Search_" + data + "</a>\n";

        var updateTime = '';
        var fileSize = 0;
        if (full.SizeOfFile != null) {
            //fileSize = (full.SizeOfFile / 1024000).toFixed(0);
            var kb = 1024;
            var mb = 1024 * kb;
            var gb = 1024 * mb;
            var dt = full.SizeOfFile / gb;
            if (full.SizeOfFile / gb > 1) {
                fileSize = Math.floor(full.SizeOfFile / gb) + " GB";
            }
            else if (full.SizeOfFile / mb > 1) {
                fileSize = Math.floor(full.SizeOfFile / mb) + " MB";
            }
            else if (full.SizeOfFile / kb > 1) {
                fileSize = Math.floor(full.SizeOfFile / kb) + " KB";
            }
            else {
                fileSize = full.SizeOfFile + " Byte";
            }

            fileSize = '<div><span class="badge-customer badge-customer-success">' + fileSize + '</span></div>';
        }

        if (full.UpdateTime != "" && full.UpdateTime != null && full.UpdateTime != undefined) {
            updateTime = '<div><span class="badge-customer badge-customer-black">' + full.UpdateTime + '</span></div>'
        }
        if (excel.indexOf(full.FileTypePhysic.toUpperCase()) != -1 || word.indexOf(full.FileTypePhysic.toUpperCase()) != -1
            || pdf.indexOf(full.FileTypePhysic.toUpperCase()) != -1 || powerPoint.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'excel';
                var file = '<a ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isSearchContent)
                        file = file + downloadSearch;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime + fileSize;
                } else {
                    return icon + '<a ng-click="viewExcel(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize;
                }
            } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'Syncfusion';
                var file = '<a ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isSearchContent)
                        file = file + downloadSearch;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime + fileSize;
                } else {
                    return icon + '<a ng-click="viewWord(' + full.Id + ', 1' + ')" >' + data + '</a>' + updateTime + fileSize;
                }
            } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
                typefile = 'pdf';
                var file = '<a ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>';
                if (full.Content != undefined) {
                    if ($scope.isSearchContent)
                        file = file + downloadSearch;
                    var content = "<div>" + full.Content + "</div>";
                    return icon + file + content + updateTime;
                } else {
                    return icon + '<a ng-click="viewPDF(' + full.Id + ', 1' + ')">' + data + '</a>' + updateTime + fileSize;
                }
            } else {
                return icon + '<a ng-click="getObjectFile(0)">' + data + '</a>' + updateTime + fileSize;
            }
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                if ($scope.isSearchContent)
                    file = file + downloadSearch;
                var content = "<div>" + full.Content + "</div>";

                return icon + file + content + updateTime + fileSize;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize;
            }
        }
        else if (document.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                var content = "<div>" + full.Content + "</div>";
                return file + content + updateTime + fileSize;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize;
            }
        }
        else if (image.indexOf(full.FileTypePhysic.toUpperCase()) != -1) {
            if (full.Content != undefined) {
                var file = icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>\n";
                var content = "<div>" + full.Content + "</div>";
                return file + content + updateTime + fileSize;
            } else {
                return icon + "&nbsp;<a ng-click='view(" + full.Id + ")'>" + data + "</a>" + updateTime + fileSize;
            }
        }
        else {
            return data + updateTime + fileSize;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ReposName').withOption('sClass', '').withTitle('{{"EDMSR_LIST_COL_SERVER" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withOption('sClass', '').withTitle('{{"EDMSR_LBL_PATH" | translate}}').renderWith(function (data, type, full) {
        var currentPath = "";
        if (full.CloudFileId != null && full.CloudFileId != "") {
            currentPath = full.CatName;
        }
        else {
            currentPath = full.CatName;
        }
        return currentPath;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSR_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('').notSortable().withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle('{{"COM_LIST_COL_NOTE" | translate}}').renderWith(function (data, type, full) {
    //    return '<button title="{{&quot; EDMSR_TAB_FILE_CURD_LBL_WHS_NOTE &quot; | translate}}" ng-click="extension(' + full.FileID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-info-circle"></i></button>';
    //}));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('FileID').withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle('{{"EDMSR_BTN_EDIT_FILE" | translate }}').renderWith(function (data, type, full) {
    //    var excel = ['.XLSM', '.XLSX', '.XLS'];
    //    var document = ['.TXT'];
    //    var word = ['.DOCX', '.DOC'];
    //    var pdf = ['.PDF'];
    //    var powerPoint = ['.PPS', '.PPTX', '.PPT'];
    //    var image = ['.JPG', '.PNG', '.TIF', '.TIFF'];
    //    var icon = "";
    //    var typefile = "#";
    //    if (excel.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
    //        typefile = 'excel';
    //        return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; EDMSR_TITLE_FILE_EDIT_HISTORY &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
    //            '<a ng-click="viewExcel(' + full.Id + ', 2' + ')" title="{{&quot;EDMSR_BTN_EDIT_FILE &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
    //    } else if (word.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
    //        typefile = 'Syncfusion';
    //        return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; EDMSR_TITLE_FILE_EDIT_HISTORY &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
    //            '<a ng-click="viewWord(' + full.Id + ', 2' + ')" title="{{&quot; EDMSR_BTN_EDIT_FILE &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
    //    } else if (pdf.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
    //        typefile = 'pdf';
    //        return '<a ng-click="tabFileHistory(' + full.FileID + ')"  title="{{&quot; EDMSR_TITLE_FILE_EDIT_HISTORY &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
    //            '<a ng-click="viewPDF(' + full.Id + ', 2' + ')" title="{{&quot; EDMSR_BTN_EDIT_FILE &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
    //    } else if (document.indexOf(full.FileTypePhysic.toUpperCase()) !== -1 || image.indexOf(full.FileTypePhysic.toUpperCase()) !== -1) {
    //        return '<a ng-click="tabFileHistory(0)"  title="{{&quot; EDMSR_TITLE_FILE_EDIT_HISTORY &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
    //            '<a ng-click="view(' + full.Id + ')" title="{{&quot; EDMSR_BTN_EDIT_FILE &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
    //    } else {
    //        return '<a ng-click="tabFileHistory(0)"  title="{{&quot; EDMSR_TITLE_FILE_EDIT_HISTORY &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-history pt5"></i></a>' +
    //            '<a ng-click="getObjectFile(0)" title="{{&quot; EDMSR_BTN_EDIT_FILE &quot; | translate}}" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit pt5"></i></a>';
    //    }
    //}));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle('{{"EDMSR_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a ng-click="convertImageToPdf(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" title="{{&quot; Chuyển đổi ảnh sang pdf &quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-recycle pt5"></i></a>' +
            '<a ng-click="performOCR(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" title="{{&quot; Chuyển đổi pdf sang OCR &quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-file-pdf-o pt5"></i></a>';
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

    $rootScope.search = function (id) {
        reloadData(true);
    };

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }

    $scope.convertImageToPdf = function (id) {
        dataservice.convertImageToPdf(id, function (rs) {
            rs = rs.data;
        })
        $scope.reload();
    }

    $scope.performOCR = function (id) {
        dataservice.performOCR(id, function (rs) {
            rs = rs.data;
            App.toastrError(rs.Title);
            $scope.reload();
        })
    }

    $scope.performOCREdms = function () {
        
        var ids = [];
        $scope.dataExport = "";
        for (var id in $scope.selected) {
            if ($scope.selected.hasOwnProperty(id)) {
                if ($scope.selected[id]) {
                    ids.push(id);
                }
            }
        }
        dataservice.performOcrEdms(ids, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        })
    }

    setTimeout(function () {

    }, 200);
});

app.controller('addKeyWord', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, para) {
    $scope.model = {
        Group: para,
        KeyWord: "",
        Type: "",
        Unit: "",
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataservice.getGroupKeySearch(function (rs) {
            rs = rs.data;
            $scope.lstGroupKeySearch = rs;
        })
        dataservice.getUnitKeyWord(function (rs) {
            rs = rs.data;
            $scope.lstUnitKeyWord = rs;
        });
        dataservice.getTypeKeyWord(function (rs) {
            rs = rs.data;
            $scope.lstTypeKeyWord = rs;
        });
        dataservice.getPoolKeyWord(function (rs) {
            rs = rs.data;
            $scope.lstKeyWord = rs;
        })
    }

    $scope.initData();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addforms.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            if (!$scope.isUpdate) {
                dataservice.insertKeyWord($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title)
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        $scope.resetInput();
                    }
                })
            }
            else {
                dataservice.updateKeyWord($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.resetInput();
                        $scope.reload();
                        $scope.isUpdate = false;
                    }
                })
            }

        }
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Group" && $scope.model.Group != "") {
            $scope.errorGroup = false;
            $scope.reload();
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.Group == "") {
            $scope.errorGroup = true;
            mess.Status = true;
        } else {
            $scope.errorGroup = false;
        }

        return mess;
    };

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/SearchContentFile/JTableKeyWord",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Group = $scope.model.Group;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblData");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [3, 'asc'])
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
                    var Id = data.Code;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '').withOption('sClass', 'tcenter hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('KeyWord').withTitle('{{"SEARCH_CT_FILE_KEY_WORD"|translate}}').withOption('sWidth', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"SEARCH_CT_FILE_UNIT"|translate}}').withOption('sWidth', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"SEARCH_CT_FILE_GROUP_KEY_WORD"|translate}}').withOption('sWidth', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"SEARCH_CT_FILE_TYPE_KEY_WORD"|translate}}').withOption('sWidth', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sWidth', '60px').renderWith(function (data, type, full, meta) {
        return '<span title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.ID + ')" /*style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);"*/ class="fs25"><i class="fas fa-edit" style="color: #337ab7;margin-right: 7px;"></i></span>' +
            '<span title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.ID + ')" /*style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)"*/ class="fs25"><i class="fas fa-trash" style="color: #337ab7;"></i></span>';
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

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataservice.deleteKeyWord(id, function (rs) {
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
            $scope.reload();
        }, function () {
        });
    }

    $scope.change = function (string) {
        var output = [];
        angular.forEach($scope.lstKeyWord, function (item) {
            if (item.Value.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
                output.push(item.Value);
            }
        });
        
        $scope.listKeyWordNew = [];
        $scope.listKeyWordNew = output;
    };

    $scope.outUser = function () {
        $("#user-packing").slideUp();
    };

    $scope.inUser = function () {
        $("#user-packing").slideDown();
    };

    $scope.addKeyWord = function (name) {
        
        var check = 0;
        for (var i = 0; i < $scope.lstKeyWord.length; i++) {
            if ($scope.lstKeyWord[i].Value == name) {
                
                $scope.model.KeyWord = name;
                $scope.model.Group = $scope.lstKeyWord[i].Group;
                $scope.listKeyWordNew = [];
                check = 1;
                break;
            }
        }
        if (check == 0) {
            if (name == "" || name == null) {
                App.toastrError("Vui lòng nhập tên nhóm hoạt động!");
                return;
            } else {
                $scope.model.KeyWord = name;
            }
        }
    };

    //Update attribute
    $scope.isUpdate = false;

    $scope.edit = function (id) {
        dataservice.getItemKeyWord(id, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            $scope.isUpdate = true;
        })
    }

    $scope.resetInput = function () {
        $scope.model.Code = "";
        $scope.model.Value = "";
    }

    $scope.addCommonSettingGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'TEMP_GROUP_KEY_SEARCH',
                        GroupNote: "Key search content file",
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getGroupKeySearch(function (rs) {
                rs = rs.data;
                $scope.lstGroupKeySearch = rs;
            })
        }, function () { });
    }

    $scope.addCommonSettingType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'KEY_WORD_TYPE',
                        GroupNote: "Key search content file",
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getTypeKeyWord(function (rs) {
                rs = rs.data;
                $scope.lstTypeKeyWord = rs;
            })
        }, function () { });
    }

    $scope.addCommonSettingUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'KEY_WORD_UNIT',
                        GroupNote: "Key search content file",
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getUnitKeyWord(function (rs) {
                rs = rs.data;
                $scope.lstUnitKeyWord = rs;
            });
        }, function () { });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('resultOCR', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, para) {
    $scope.group = para;
    $scope.cancel = function () {
        $uibModalInstance.close()
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/SearchContentFile/JTableResult",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Group = para;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(250, "#tblData");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [3, 'asc'])
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
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '').withOption('sClass', 'tcenter hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('KeyWord').withTitle('{{"SEARCH_CT_FILE_KEY_WORD"|translate}}').withOption('sWidth', '').withOption('sClass', 'text-wrap w350').renderWith(function (data, type) {
        return '<span class="text-green">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle('{{"SEARCH_CT_FILE_VALUE"|translate}}').withOption('sWidth', '').withOption('sClass', 'text-wrap w200').renderWith(function (data, type) {
        return '<span class="text-danger">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"SEARCH_CT_FILE_UNIT"|translate}}').withOption('sWidth', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"SEARCH_CT_FILE_GROUP_KEY_WORD"|translate}}').withOption('sWidth', '').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"SEARCH_CT_FILE_TYPE_DATA"|translate}}').withOption('sWidth', '').withOption('sClass', 'text-wrap w150').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w50').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').withOption('sWidth', '').renderWith(function (data, type, full, meta) {
        return '<button title="{{"COM_BTN_DELETE" | translate}}" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.initData = function () {
        if (para != "") {
            dataservice.getInfoGroup(para, function (rs) {
                rs = rs.data;
                $scope.info = rs;
            });
        }
    }

    $scope.initData();

    $scope.delete = function (id) {
        dataservice.deleteResultOCR(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        })
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
        dataservice.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {

        if ($scope.model.ValueSet == '') {
            App.toastrError("Giá trị cài đặt không được bỏ trống");
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataservice.insertCommonSetting($scope.model, function (rs) {
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
            dataservice.updateCommonSetting($scope.model, function (rs) {
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
                    dataservice.deleteCommonSetting(id, function (rs) {
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
