var ctxfolder = "/views/admin/fileImageToPdf";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);

app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        convertImageToPdf: function (data, callback) {
            $http.post('/Admin/FileImageToPdf/ConvertImageToPdf?id=' + data).then(callback);
        },
        performOCR: function (data, callback) {
            $http.post('/Admin/FileImageToPdf/PerformOCR?id=' + data).then(callback);
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
                ActCode: {
                    required: true,
                    maxlength: 100
                },
                ActTitle: {
                    required: true,
                    maxlength: 255
                },
            },
            messages: {
                ActCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.AA_CURD_LBL_AA_ACTCODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.AA_CURD_LBL_AA_ACTCODE).replace("{1}", "100")
                },
                ActTitle: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.AA_CURD_LBL_AA_ACTTITLE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.AA_CURD_LBL_AA_ACTTITLE).replace("{1}", "100")
                }
            }
        }
        $rootScope.IsTranslate = true;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/FileImageToPdf/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
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
            //contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ActivityId;
                    //$scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("FileID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.FileID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.FileID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
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
        return '<a ng-click="convertImageToPdf(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" title="{{&quot; EDMSR_SHARE &quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-recycle pt5"></i></a>' +
            '<a ng-click="performOCR(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" title="{{&quot; EDMSR_SHARE &quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-file-pdf-o pt5"></i></a>';
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
    }

    $scope.performOCR = function (id) {
        dataservice.performOCR(id, function (rs) {
            rs = rs.data;
            App.toastrError(rs.Title);
        })
    }

    setTimeout(function () {

    }, 200);
});
