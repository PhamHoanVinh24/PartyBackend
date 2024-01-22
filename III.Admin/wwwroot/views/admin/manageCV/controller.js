var ctxfolderManageCV = "/views/admin/manageCV";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var app = angular.module('App_ESEIM_MANAGECV', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput'])
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
    })
    .directive('fileDropzone', function () {
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
app.factory('dataserviceManageCV', function ($http) {
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
    var submitFormUploadNew = function (url, data, callback) {
        var formData = new FormData();
        formData.append("CateRepoSettingId", data.CateRepoSettingId);
        formData.append("FileUpload", data.FileUpload);
        formData.append("FileName", data.FileName);
        formData.append("Desc", data.Desc);
        formData.append("Tags", data.Tags);
        formData.append("NumberDocument", data.NumberDocument);
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
            data: formData
        }
        $http(req).then(callback);
    };
    return {
        //category
        getTreeInNode: function (data, callback) {
            $http.post('/Admin/ManageCV/GetTreeInNode?parentId=' + data).then(callback);
        },
        getParentCategory: function (data, callback) {
            $http.post('/Admin/ManageCV/GetParentCategory', data).then(callback);
        },
        getItemCategory: function (data, callback) {
            $http.get('/Admin/ManageCV/GetItemCategory?id=' + data).then(callback);
        },
        insertCategory: function (data, callback) {
            $http.post('/Admin/ManageCV/InsertCategory', data).then(callback);
        },
        updateCategory: function (data, callback) {
            $http.post('/Admin/ManageCV/UpdateCategory', data).then(callback);
        },
        deleteCategory: function (data, callback) {
            $http.post('/Admin/ManageCV/DeleteCategory?catCode=' + data).then(callback);
        },

        //repository
        getTreeRepository: function (callback) {
            $http.post('/Admin/ManageCV/GetTreeRepository').then(callback);
        },
        getItemRepository: function (data, callback) {
            $http.get('/Admin/ManageCV/GetItemRepository?reposCode=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        insertRepository: function (data, callback) {
            $http.post('/Admin/ManageCV/InsertRepository', data).then(callback);
        },
        updateRepository: function (data, callback) {
            $http.post('/Admin/ManageCV/UpdateRepository', data).then(callback);
        },
        deleteRepository: function (data, callback) {
            $http.post('/Admin/ManageCV/DeleteRepository?respos=' + data).then(callback);
        },

        //file
        deleteFile: function (data, callback) {
            $http.post('/Admin/ManageCV/DeleteFile', data).then(callback);
        },
        getContract: function (callback) {
            $http.post('/Admin/ManageCV/GetContract').then(callback);
        },
        getFileImage: function (data, callback) {
            $http.get('/Admin/ManageCV/GetFileImage?id=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getObjectsType: function (callback) {
            $http.post('/Admin/ManageCV/GetObjectsType').then(callback);
        },
        getListObject: function (data, callback) {
            $http.get('/Admin/ManageCV/GetListObject?objectType=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/ManageCV/GetItem?id=' + data).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/ManageCV/GetItemFile?id=' + data + '&&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },

        jtableFileWithRepository: function (data, callback) {
            $http.post('/Admin/ManageCV/JtableFileWithRepository', data).then(callback);
        },
        getUsers: function (callback) {
            $http.post('/Admin/ManageCV/GetUsers').then(callback);
        },
        createTempFile: function (data, data1, data2, callback) {
            $http.post('/Admin/ManageCV/CreateTempFile?Id=' + data + "&isSearch=" + data1 + "&content=" + data2).then(callback);
        },
        getSupportCategory: function (data, callback) {
            $http.post('/Admin/ManageCV/GetSupportCategory?CatCode=' + data).then(callback);
        },
        getTotal: function (callback) {
            $http.get('/Admin/ManageCV/GetTotal').then(callback);
        },

        //File && Meta Data
        getTreeCategory: function (callback) {
            $http.post('/Admin/ManageCV/GetTreeCategory').then(callback);
        },
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/ManageCV/InsertFile', data, callback);
        },
        getListMetaType: function (callback) {
            $http.post('/Admin/ManageCV/GetListMetaType').then(callback);
        },
        getListMetaGroup: function (callback) {
            $http.post('/Admin/ManageCV/GetListMetaGroup').then(callback);
        },
        updateMetaData: function (data1, data2, callback) {
            $http.post('/Admin/ManageCV/UpdateMetaData?fileId=' + data1 + '&metaDataExt=' + data2).then(callback);
        },
        getMetaData: function (data1, callback) {
            $http.post('/Admin/ManageCV/GetMetaData?fileId=' + data1).then(callback);
        },

        //OrderDocument & Pack
        getListRack: function (callback) {
            $http.post('/Admin/ManageCV/GetListRack').then(callback);
        },
        getListPack: function (data, callback) {
            $http.post('/Admin/ManageCV/GetListPack?rackCode=' + data).then(callback);
        },
        insertPack: function (data, callback) {
            $http.post('/Admin/ManageCV/InsertPack', data).then(callback);
        },
        getItemPack: function (data, callback) {
            $http.post('/Admin/ManageCV/GetItemPack?id=' + data).then(callback);
        },
        updatePack: function (data, callback) {
            $http.post('/Admin/ManageCV/UpdatePack', data).then(callback);
        },
        deletePack: function (data, callback) {
            $http.post('/Admin/ManageCV/DeletePack?id=' + data).then(callback);
        },

        //paste File
        pasteFile: function (data, callback) {
            $http.post('/Admin/ManageCV/PasteFile', data).then(callback);
        },

        //ShareFile
        getListUser: function (callback) {
            $http.post('/Admin/ManageCV/GetListUser').then(callback);
        },
        insertFileShare: function (data, callback) {
            $http.post('/Admin/ManageCV/InsertFileShare', data).then(callback);
        },
        getFileShare: function (data, callback) {
            $http.post('/Admin/ManageCV/GetFileShare?id=' + data).then(callback);
        },

        //Commonsetting
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        getDataTypeCommonSetting: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        }
    };
});
app.controller('Ctrl_ESEIM_MANAGECV', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.IsTranslate = true;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptionsCategory = {
            rules: {
                CatCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/,
                },
                CatName: {
                    required: true
                }
            },
            messages: {
                CatCode: {
                    required: caption.EDMSR_VALIDATE_RQ_CODE_CATE,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.EDMSR_CURD_LBL_CATEGORY_CODE),
                },
                CatName: {
                    required: caption.EDMSR_VALIDATE_RQ_CAT_NAME
                }
            }
        }
        $rootScope.validationOptionsRepository = {
            rules: {
                ReposName: {
                    required: true
                },
                Server: {
                    required: true
                },
                Account: {
                    required: true
                },
                PassWord: {
                    required: true
                }
            },
            messages: {
                ReposName: {
                    required: caption.EDMSR_VALIDATE_NAME_SERVER
                },
                Server: {
                    required: caption.EDMSR_VALIDATE_SERVER
                },
                Account: {
                    required: caption.EDMSR_VALIDATE_USER
                },
                PassWord: {
                    required: caption.EDMSR_VALIDATE_PASS
                }
            }
        }
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            //var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            //var partternNumber = /^\d+$/;
            //var partternPremiumTerm = /^\d+(\+)?/
            //var partternFloat = /^-?\d*(\.\d+)?$/;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ReposCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.EDMSR_VALIDATE_REPOS_CODE, "<br/>");
            }
            return mess;
        }
    });
    $scope.FileType = [{
        Code: 1,
        Name: 'Ảnh',
    }, {
        Code: 2,
        Name: 'Word'
    }, {
        Code: 3,
        Name: 'Excel'
    }, {
        Code: 4,
        Name: 'Powerpoint'
    }, {
        Code: 5,
        Name: 'Pdf'
    }, {
        Code: 6,
        Name: 'Tệp tin'
    }];

    $rootScope.listUnit = [{
        Code: '1',
        Name: 'Tập'
    }, {
        Code: '2',
        Name: 'Cuốn'
    }, {
        Code: '3',
        Name: 'Thùng'
    }];
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ManageCV/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolderManageCV + '/index.html',
            controller: 'index'
        })
    //.when('/pdfViewer', {
    //    templateUrl: ctxfolderManageCV + '/pdfViewer.html',
    //    controller: 'pdfViewer'
    //});
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceManageCV, $filter, $window) {
    var vm = $scope;
    //$scope.objects = [];
    //$scope.objectDetails = [];
    //$scope.users = [];
    $scope.model = {
        ObjectType: 'All',
        ObjectCode: '',
        FromDate: '',
        ToDate: '',
        Name: '',
        FileType: '',
        Content: '',
        Tags: '',
        ListRepository: [],
        UserUpload: ''
        //ObjectDetailCode: '',
    };
    $scope.recentFile = false;
    $scope.currentPath = "";
    $scope.totalFile = 0;
    $scope.totalCapacity = "0M";
    $scope.isSearchContent = false;
    $scope.content = "";
    $scope.treeData = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ManageCV/JTableFile",
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
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Name = $scope.model.Name;
                d.Content = $scope.model.Content;
                
                if ($scope.model.Content != null && $scope.model.Content != "") {
                    $scope.isSearchContent = true;
                }
                else
                    $scope.isSearchContent = false;
                $scope.content = $scope.model.Content;
            },
            complete: function (json) {
                App.unblockUI("#contentMain");
                heightTableManual(613, "#tblData");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(9)
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

            $compile(angular.element(row)
                .attr('context-menu', 'contextMenu')
                .attr('id', 'id-' + data.FileID)
                .attr('draggable', true)
                .attr('data-downloadurl', 'application/pdf:HTML5CheatSheet.pdf:http://www.thecssninja.com/demo/gmail_dragout/html5-cheat-sheet.pdf')
            )(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle("ID").notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return data;
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('FileSize').withOption('sClass', '').withTitle('{{"EDMSR_LIST_COL_SIZE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSR_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FullName').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMST_TITLE_CANDIDATE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
   
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle('{{"EDMSR_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return  '<a ng-click="dowload(' + full.Id + ')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="{{&quot; EDMSR_DOWNLOAD &quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline green " download><i class="fa fa-download pt5"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.table = {
        dtInstance: {}
    };
    function reloadData(resetPaging) {
        vm.table.dtInstance.reloadData(callback, resetPaging);
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
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.fileManage = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderManageCV + '/fileManage.html',
            controller: 'fileManage',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.initData = function () {
        var date = new Date();
        var priorDate = new Date().setDate(date.getDate() - 30)
        $scope.model.ToDate = $filter('date')((date), 'dd/MM/yyyy')
        $scope.model.FromDate = $filter('date')((priorDate), 'dd/MM/yyyy')
        dataserviceManageCV.getTotal(function (rs) {
            rs = rs.data;
            $scope.totalFile = rs.TotalFile;
            $scope.totalSize = rs.TotalSize;
        })
    }
    $scope.initData();

    $scope.initDataTemp = function () {
        $scope.dataTemp = {
            action: '',
            data: {}
        };
    };
    $scope.initDataTemp();

    $scope.recentFileLoad = function () {
        $scope.recentFile = true;
        $scope.reload();
    }

    $scope.addFile = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderManageCV + '/addFile.html',
            controller: 'addFile',
            backdrop: 'static',
            size: '65',
            resolve: {
                para: function () {

                    return $scope.model.ListRepository;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.deleteFile = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.EDMSR_MSG_DELETE_FILE;
                $scope.ok = function () {
                    dataserviceManageCV.deleteFile(id, function (rs) {
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
    $scope.viewFile = function (id) {

        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].FileID == id) {
                userModel = listdata[i];
                break;
            }
        }
        var url = window.encodeURIComponent(userModel.Url);
        console.log(window.location.origin + '' + url);
        //window.open(url);
        window.open('https://docs.google.com/gview?url=' + window.location.origin + '' + url + ' & embedded=true', '_blank');
    }
    $scope.viewImage = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        toDataUrl(window.location.origin + userModel.Url, function (myBase64) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderManageCV + '/imageViewer.html',
                controller: 'imageViewerFile',
                backdrop: 'static',
                size: '40',
                resolve: {
                    para: function () {
                        return myBase64;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () {
            });
        });
    }
    $scope.view_old = function (id) {
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
        if (userModel.SizeOfFile < 20971520) {
            if (image.indexOf(userModel.FileTypePhysic.toUpperCase()) !== -1) {
                isImage = true;
                $scope.openViewer(rs.Object, isImage);
            }
            var dt = null;
            for (var i = 0; i < $scope.treeData.length; ++i) {
                var item = $scope.treeData[i];
                if (item.id == userModel.Category) {
                    dt = item;
                    break;
                }
            }
            if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
                if (dt != null)
                    $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
                else
                    $scope.currentPath = "Google Driver/" + userModel.FileName;
                //SHOW LÊN MÀN HÌNH LUÔN
                // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
                //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
                dataserviceManageCV.createTempFile(id, $scope.isSearchContent, $scope.content, function (rs) {
                    rs = rs.data;
                    rs.Object = encodeURI(rs.Object);
                    if (rs.Error == false) {
                        if (isImage == false)
                            $scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                        else
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
                dataserviceManageCV.createTempFile(id, $scope.isSearchContent, $scope.content, function (rs) {
                    rs = rs.data;
                    rs.Object = encodeURI(rs.Object);
                    if (rs.Error == false) {
                        if (isImage == false)
                            $scope.openViewer("https://docs.google.com/gview?url=" + window.location.origin + '/' + rs.Object + '&embedded=true', isImage);
                        else
                            $scope.openViewer(rs.Object, isImage);
                        //window.open('https://docs.google.com/gview?url=' + window.location.origin + '/' + rs.Object + '&embedded=true', '_blank');
                    }
                    else {

                    }
                });
            }
        } else {
            App.toastrError(caption.EDMSR_MSG_FILE_SIZE_LIMIT_EDIT);
        }

    }
    $scope.openViewer = function (url, isImage) {
        var data = {};
        data.url = url;
        data.isImage = isImage;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderManageCV + '/viewer.html',
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



    $scope.addCategory = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderManageCV + '/addCategory.html',
            controller: 'addCategory',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $('#treeDiv').jstree(true).refresh();
            setTimeout(function () {
                $scope.readyCB();
            }, 200);
        }, function () {
        });
    }
    $scope.editCategory = function () {
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length == 0) {
            App.toastrError(caption.EDMSR_MSG_SELECT_CATEGORIES);
        } else if (listNoteSelect.length > 1) {
            App.toastrError(caption.EDMSR_MSG_SELECT_A_REPOSITORY);
        } else {
            dataserviceManageCV.getItemCategory(listNoteSelect[0].original.catId, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolderManageCV + '/editCategory.html',
                        controller: 'editCategory',
                        backdrop: 'static',
                        size: '70',
                        resolve: {
                            para: function () {
                                return rs.Object;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                        $('#treeDiv').jstree(true).refresh();
                        setTimeout(function () {
                            $scope.readyCB();
                        }, 200);
                    }, function () {
                    });
                }
            })
        }
    }
    $scope.deleteCategory = function () {
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        for (var i = 0; i < listNoteSelect.length; i++) {
            listSelect.push(listNoteSelect[i].id);
        }
        if (listSelect.length == 0) {
            App.toastrError(caption.EDMSR_MSG_SELECT_CATEGORIES);
        } else if (listSelect.length > 1) {
            App.toastrError(caption.EDMSR_MSG_SELECT_A_CATEGORIES);
        } else {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                resolve: {
                    para: function () {
                        return listSelect[0];
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.EDMSR_MSG_DELETE_CATEGORIES;
                    $scope.ok = function () {
                        dataserviceManageCV.deleteCategory(para, function (rs) {
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
                $('#treeDiv').jstree(true).refresh();
                setTimeout(function () {
                    $scope.readyCB();
                    $scope.reload();
                }, 200);
            }, function () {
            });
        }
    }

    $scope.getObjectFile = function (id) {
        if (id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            dataserviceManageCV.getItemFile(id, true, function (rs) {
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
        var listdata = $('#tblData').DataTable().data();
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
                dataserviceManageCV.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.EDMSR_MSG_FILE_SIZE_LIMIT_EDIT);
            }

        }
    };
    $scope.viewWord = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
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
                dataserviceManageCV.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.EDMSR_MSG_FILE_SIZE_LIMIT_EDIT);
            }
        }
    };
    $scope.viewPDF = function (id, mode) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
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
                dataserviceManageCV.getItemFile(id, true, mode, function (rs) {
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
                App.toastrError(caption.EDMSR_MSG_FILE_SIZE_LIMIT_EDIT);
            }
        }
    };
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
        for (var i = 0; i < $scope.treeData.length; ++i) {
            var item = $scope.treeData[i];
            if (item.id == userModel.Category) {
                dt = item;
                break;
            }
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            if (dt != null)
                $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            else
                $scope.currentPath = "Google Driver/" + userModel.FileName;
            //SHOW LÊN MÀN HÌNH LUÔN
            // window.open(" https://drive.google.com/file/d/" + userModel.CloudFileId + "/view", "_blank");
            //$scope.openViewer("https://drive.google.com/file/d/"+userModel.CloudFileId + "/view");3
            dataserviceManageCV.createTempFile(id, $scope.isSearchContent, $scope.content, function (rs) {
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
            dataserviceManageCV.createTempFile(id, $scope.isSearchContent, $scope.content, function (rs) {
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
            templateUrl: ctxfolderManageCV + '/viewer.html',
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

    $scope.share = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderManageCV + '/shareFile.html',
            controller: 'shareFile',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.contextMenu = [
        [function ($itemScope) {
            return '<i class="fa fa-copy"></i> ' + caption.COM_LBL_COPY;
        }, function ($itemScope, $event, model) {
            $scope.dataTemp = {
                action: 'Copy',
                data: $itemScope.data
            };

        }, function ($itemScope, $event, model) {
            return true;
        }],
        [function ($itemScope) {
            return '<i class="fa fa-cut"></i> ' + caption.COM_LBL_MOVE;
        }, function ($itemScope, $event, model) {
            $scope.dataTemp = {
                action: 'Move',
                data: $itemScope.data
            };
        }, function ($itemScope, $event, model) {
            return true;
        }]
    ];

    //treeview
    var nodeBefore = "";
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataserviceManageCV.getTreeCategory(function (result) {
            result = result.data;

            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: caption.EDMSR_LBL_ALL_CATEGORY,//"Tất cả kho dữ liệu"
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeData.push(root);
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
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
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
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }
    $scope.selectNodeRepository = function (e, data) {
        var listSelect = [];
        var idCurrentNode = data.node.id;
        if (nodeBefore != idCurrentNode) {
            $("#" + nodeBefore + "_anchor").removeClass('bold');

            nodeBefore = idCurrentNode;
            $scope.recentFile = false;
            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].id);
            }
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }
        else {
            $scope.recentFile = false;
            listSelect = [];
            $("#" + idCurrentNode + "_anchor").addClass('bold');
            listSelect.push(idCurrentNode);
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }
    }
    $scope.deselectNodeRepository = function (e, data) {
        $scope.recentFile = false;
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length > 0) {
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].id);
                dataserviceManageCV.getTreeInNode(listNoteSelect[i].id, function (rs) {
                    rs = rs.data;
                    if (rs.length > 0) {
                        for (var i = 0; i < rs.length; i++) {
                            listSelect.push(rs[i].Code);
                        }
                    }
                    $scope.model.ListRepository = listSelect;
                    $scope.reload();
                })
            }
        } else {
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }


    }
    $scope.treeConfig = {
        core: {
            multiple: true,
            animation: true,
            error: function (error) {
                //$log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
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
        plugins: ['checkbox', 'types', 'contextmenu'],
        checkbox: {
            "three_state": false,
            "whole_node": false,
            "keep_selected_style": false,
            "cascade": "undetermined",
        },
        contextmenu: {
            items: customMenu
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'deselect_node': $scope.deselectNodeRepository,
    };
    $scope.ac = function () {
        return true;
    }

    function customMenu(node) {
        var items = {
            'item1': {
                'label': caption.COM_BTN_EDIT,
                'icon': "fa fa-edit",
                'action': function (data) {
                    dataserviceManageCV.getItemCategory(node.original.catId, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            var modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: ctxfolderManageCV + '/editCategory.html',
                                controller: 'editCategory',
                                backdrop: 'static',
                                size: '70',
                                resolve: {
                                    para: function () {
                                        return rs.Object;
                                    }
                                }
                            });
                            modalInstance.result.then(function (d) {
                                $('#treeDiv').jstree(true).refresh();
                                setTimeout(function () {
                                    $scope.readyCB();
                                }, 200);
                            }, function () {
                            });
                        }
                    })
                }
            },
            'item2': {
                'label': caption.COM_BTN_DELETE,
                'icon': "fa fa-trash",
                'action': function (data) {
                    var modalInstance = $uibModal.open({
                        templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                        windowClass: "message-center",
                        resolve: {
                            para: function () {
                                return node.original.catCode;
                            }
                        },
                        controller: function ($scope, $uibModalInstance, para) {
                            $scope.message = caption.EDMSR_MSG_DELETE_CATEGORIES;
                            $scope.ok = function () {
                                dataserviceManageCV.deleteCategory(para, function (rs) {
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
                        $('#treeDiv').jstree(true).refresh();
                        setTimeout(function () {
                            $scope.readyCB();
                            $scope.reload();
                        }, 200);
                    }, function () {
                    });
                }
            }
        };
        if ($scope.dataTemp.action === 'Copy' || $scope.dataTemp.action === 'Move') {
            items = {
                'item1': {
                    'label': caption.COM_BTN_EDIT,
                    'icon': "fa fa-edit",
                    'action': function (data) {
                        dataserviceManageCV.getItemCategory(node.original.catId, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                var modalInstance = $uibModal.open({
                                    animation: true,
                                    templateUrl: ctxfolderManageCV + '/editCategory.html',
                                    controller: 'editCategory',
                                    backdrop: 'static',
                                    size: '70',
                                    resolve: {
                                        para: function () {
                                            return rs.Object;
                                        }
                                    }
                                });
                                modalInstance.result.then(function (d) {
                                    $('#treeDiv').jstree(true).refresh();
                                    setTimeout(function () {
                                        $scope.readyCB();
                                    }, 200);
                                }, function () {
                                });
                            }
                        })
                    }
                },
                'item2': {
                    'label': caption.COM_BTN_DELETE,
                    'icon': "fa fa-trash",
                    'action': function (data) {
                        var modalInstance = $uibModal.open({
                            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                            windowClass: "message-center",
                            resolve: {
                                para: function () {
                                    return node.original.catCode;
                                }
                            },
                            controller: function ($scope, $uibModalInstance, para) {
                                $scope.message = caption.EDMSR_MSG_DELETE_CATEGORIES;
                                $scope.ok = function () {
                                    dataserviceManageCV.deleteCategory(para, function (rs) {
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
                            $('#treeDiv').jstree(true).refresh();
                            setTimeout(function () {
                                $scope.readyCB();
                                $scope.reload();
                            }, 200);
                        }, function () {
                        });
                    }
                },
                'item3': {
                    'label': caption.COM_LBL_PASTE,
                    'icon': "fa fa-paste",
                    'action': function (data) {
                        switch ($scope.dataTemp.action) {
                            case 'Copy':
                                copy($scope.dataTemp, node);
                                break;

                            case 'Move':
                                move($scope.dataTemp, node);
                                break;
                        }
                    }
                }
            };
        }

        return items;
    }

    function copy(item, node) {
        var actionData = {
            Action: 'Copy',
            FileIdFrom: item.data.FileID,
            CatIdTo: node.original.catId
        };

        if (item.data.Category === node.original.catCode) {
            return App.toastrError(caption.EDMSR_MSG_PLS_CHOOSE_ANOTHER);
        }

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmQuestion.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return actionData;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.EDMSR_MSG_PASTE_CATEGORIES;
                $scope.ok = function () {
                    dataserviceManageCV.pasteFile(para, function (rs) {
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
            //$('#treeDiv').jstree(true).refresh();
            setTimeout(function () {
                //$scope.readyCB();
                $scope.reload();
            }, 200);
        }, function () {
        });

        $scope.initDataTemp();
    }

    function move(item, node) {
        var actionData = {
            Action: 'Move',
            FileIdFrom: item.data.FileID,
            CatIdTo: node.original.catId
        };

        if (item.data.Category === node.original.catCode) {
            return App.toastrError(caption.EDMSR_MSG_PLS_CHOOSE_ANOTHER);
        }

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmQuestion.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return actionData;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.EDMSR_MSG_PASTE_CATEGORIES;
                $scope.ok = function () {
                    dataserviceManageCV.pasteFile(para, function (rs) {
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
            //$('#treeDiv').jstree(true).refresh();
            setTimeout(function () {
                //$scope.readyCB();
                $scope.reload();
            }, 200);
        }, function () {
        });

        $scope.initDataTemp();
    }

    $scope.search = function () {
        reloadData(true);
    }
    $scope.init = function () {
        dataserviceManageCV.getObjectsType(function (rs) {
            rs = rs.data;
            $scope.objects = rs;
        });
        reloadObject('');
        dataserviceManageCV.getListUser(function (rs) {
            rs = rs.data;
            $scope.listUser = rs;
        });
    }
    $scope.init();
    $scope.selectObjectType = function (objectType) {
        //$scope.objectDetails = [];
        //$scope.model.ObjectDetailCode = null;

        //if ($scope.model.ObjectCode == "FILE_OBJ_CONTRACT") {
        //    dataserviceManageCV.getAllContract(function (rs) {rs=rs.data;
        //        $scope.objectDetails = rs.Object;
        //    });
        //}
        //if ($scope.model.ObjectCode == "FILE_OBJ_CUSTOMMER") {
        //    dataserviceManageCV.getAllCustomer(function (rs) {rs=rs.data;
        //        $scope.objectDetails = rs.Object;
        //    });
        //}
        //if ($scope.model.ObjectCode == "FILE_OBJ_PROJECT") {
        //    dataserviceManageCV.getAllProject(function (rs) {rs=rs.data;
        //        $scope.objectDetails = rs.Object;
        //    });

        //}
        //if ($scope.model.ObjectCode == "FILE_OBJ_SUPPLIER") {
        //    dataserviceManageCV.getAllSupplier(function (rs) {rs=rs.data;
        //        $scope.objectDetails = rs.Object;
        //    });
        //}
        reloadObject(objectType);
        reloadData(true);
    }
    $scope.selectObjectCode = function (item) {
        $scope.model.ObjectType = item.ObjectType;
        reloadData(true);
    }
    $scope.resetObjectType = function () {
        reloadObject('');
        reloadData(true);
    }
    $scope.downloadSearch = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var dt = null;
        for (var i = 0; i < $scope.treeData.length; ++i) {
            var item = $scope.treeData[i];
            if (item.id == userModel.Category) {
                dt = item;
                break;
            }
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            if (dt != null)
                $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            else
                $scope.currentPath = "Google Driver/" + userModel.FileName;
        }
        else {

            if (dt != null)
                $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
            else
                $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
        }
        location.href = "/Admin/ManageCV/DownloadSearch?"
            + "Id=" + id + "&content=" + $scope.content;
    }
    $scope.dowload = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var dt = null;
        for (var i = 0; i < $scope.treeData.length; ++i) {
            var item = $scope.treeData[i];
            if (item.id == userModel.Category) {
                dt = item;
                break;
            }
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            if (dt != null)
                $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            else
                $scope.currentPath = "Google Driver/" + userModel.FileName;
        }
        else {

            if (dt != null)
                $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
            else
                $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
        }
        location.href = "/Admin/ManageCV/Download?"
            + "Id=" + id;
    }
    $scope.tabFileHistory = function (fileId) {
        if (fileId === 0) {
            App.toastrError(caption.COM_MSG_FILE_NOT_HISTORY);
            return null;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderManageCV + '/tabFileHistory.html',
            controller: 'tabFileHistory',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return fileId;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () { });
    };
    $scope.extension = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderManageCV + '/extension.html',
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

    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });
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
    function handlerFunction(event) {
        if (event !== null) {
            event.preventDefault();
        }
        event.dataTransfer.effectAllowed = 'copy';
        console.log(event);
    }
    function handlerFunction1(event) {
        if (event !== null) {
            event.preventDefault();
        }
        var file = event.dataTransfer.files;
        if ($scope.model.ListRepository.length === 0) {
            App.toastrError(caption.EDMSR_MSG_PLS_SELECT_CATE_ADD_FILE);
        }
        else if ($scope.model.ListRepository.length > 1) {
            App.toastrError(caption.EDMSR_MSG_PLS_ONLY_CATE_ADD_FILE);
        }
        else {
            dataserviceManageCV.getSupportCategory($scope.model.ListRepository[0], function (rs) {
                rs = rs.data;
                if (rs.Error == true) {
                    App.toastrError(rs.Title);
                }
                else {
                    if (rs.Object != null) {
                        var obj = rs.Object;
                        for (var i = 0; i < file.length; ++i) {
                            var data = {};
                            data.CateRepoSettingId = obj.Id;
                            data.FileUpload = file[i];
                            data.FileName = file[i].name;

                            var formData = new FormData();
                            formData.append("FileUpload", data.FileUpload);
                            formData.append("FileName", data.FileName);
                            formData.append("CateRepoSettingId", data.CateRepoSettingId);

                            dataserviceManageCV.insertFile(formData, function (result) {
                                result = result.data;
                                if (result.Error) {
                                    App.toastrError(result.Title);
                                } else {
                                    App.toastrSuccess(result.Title);
                                    $scope.reload();
                                }
                            });
                        }
                    }
                    else {
                        App.toastrError(caption.EDMSR_MSG_NO_SUGGESST_FORDER);
                    }
                }
            });
        }

    }
    function reloadObject(objectType) {
        dataserviceManageCV.getListObject(objectType, function (rs) {
            rs = rs.data;
            $scope.listObjects = rs;
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
        $scope.search();
        //showHideSearch();
        loadDate();
        //let dropArea = document.getElementById('dropzone1')
        //dropArea.addEventListener('dragover', handlerFunction, false)
        //dropArea.addEventListener('dragenter', handlerFunction, false)
        //dropArea.addEventListener('drop', handlerFunction1, false)
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

//File & Extension
