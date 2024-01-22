var ctxfolder = "/views/admin/fundPlanAccEntry";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
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
        getAetType: function (callback) {
            $http.post('/Admin/FundPlanAccEntry/GetAetType').then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/GetTreeData', data).then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/FundPlanAccEntry/GetUser').then(callback);
        },
        getGetCurrency: function (callback) {
            $http.post('/Admin/ParamForWarning/GetCurrency').then(callback);
        },
        getGetCatCode: function (callback) {
            $http.post('/Admin/FundPlanAccEntry/GetCatCode').then(callback);
        },
        getGetAetRelative: function (callback) {
            $http.post('/Admin/FundPlanAccEntry/GetAetRelative').then(callback);
        },
        getGetAetRelativeType: function (callback) {
            $http.post('/Admin/FundPlanAccEntry/GetAetRelativeType').then(callback);
        },
        getListFundFiles: function (data, callback) {
            $http.post('/Admin/FundPlanAccEntry/GetListFundFiles?aetCode=' + data).then(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/FundPlanAccEntry/UploadFile', data, callback);
        },
        removeFileReq: function (data, callback) {
            $http.post('/Admin/FundPlanAccEntry/RemoveFundFile?Id=' + data, callback).then(callback);
        },
        getListFundCategoryParent: function (callback) {
            $http.post('/Admin/FundPlanAccEntry/GetListFundCategoryParent').then(callback);
        },
        removeFileReq: function (data, callback) {
            $http.post('/Admin/EDMSSendRequestProfile/RemoveFileRequest?fileId=' + data, callback).then(callback);
        },
        getGetAccTrackingDetail: function (data, callback) {
            $http.get('/Admin/FundPlanAccEntry/GetAccTrackingDetail?aetCode=' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/FundPlanAccEntry/GetItem/', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/FundPlanAccEntry/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/FundPlanAccEntry/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/FundPlanAccEntry/Delete/' + data).then(callback);
        },
        getGenAETCode: function (type, catCode, title, callback) {
            $http.post('/admin/FundPlanAccEntry/GenAETCode?type=' + type + "&&catCode=" + catCode + "&&title=" + title).then(callback);
        },
        insertAccEntryTracking: function (aetCode, status, note, callback) {
            $http.post('/admin/FundPlanAccEntry/InsertAccEntryTracking?aetCode=' + aetCode + "&&status=" + status + "&&note=" + note).then(callback);
        },
        getTotalReceipt: function (fromTime, toTime, aetType, status, payer, catCode, callback) {
            $http.post('/Admin/FundPlanAccEntry/Total?fromDatePara=' + fromTime + "&&toDatePara=" + toTime + "&&aetType=" + aetType + "&&status=" + status + "&&payer=" + payer + "&&catCode=" + catCode).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $filter, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            max: 'Max some message {0}'
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.CatCode)) {
                mess.Status = true;
                mess.Title = mess.Title.CatCode(" - ", "Yêu cầu mã thu chi có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt, khoảng trống!", "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255
                },
                Total: {
                    required: true,
                    maxlength: 255
                }
            },
            messages: {
                Title: {
                    required: "Tiêu đề thu chi không được để trống",
                    maxlength: "Tiêu đề thu chi không được vượt quá 255 ký tự"
                },
                Total: {
                    required: "Số tiền không được để trống",
                    maxlength: "Số tiền phải là dạng số, và không được Vượt quá 18 ký tự"
                }
            }
        }
    });
    $rootScope.zoomMapDefault = 16;
    $rootScope.latDefault = 21.0277644;
    $rootScope.lngDefault = 105.83415979999995;
    $rootScope.addressDefault = 'Hanoi, Hoàn Kiếm, Hanoi, Vietnam';

    dataservice.getUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
    $scope.initData = function () {
        dataservice.getGetCurrency(function (rs) {
            rs = rs.data;
            $rootScope.Currency = rs;
        })
    }
    $scope.initData();

    $rootScope.listStatus = [
        { Code: '', Name: 'Tất cả' },
        {
            Code: "FUND_CREATED",
            Name: "Khởi tạo"
        },
        {
            Code: "FUND_CANCEL",
            Name: "Hủy bỏ"
        },
        {
            Code: "FUND_PENDING",
            Name: "Đang xử lý"
        },
        {
            Code: "FUND_APPROVED",
            Name: "Đã duyệt"
        },
        {
            Code: "FUND_REFUSE",
            Name: "Từ chối"
        },
    ];

});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/FundPlanAccEntry/Translation');
    //$translateProvider.preferredLanguage('en-US');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        AetCode: '',
        Title: '',
        AetType: '',
        DeadLine: '',
        AetDescription: '',
        Total: '',
        Payer: '',
        Status: '',
        FromTime: '',
        ToTime: '',
        IsPlan: '',
        CatParent: '',


    };
    $scope.listAetType = [
        {Code:'', Name:'Tất cả'},
        {
            Code: "Receipt",
            Name: "Thu"
        }, {
            Code: "Expense",
            Name: "Chi"
        }];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/FundPlanAccEntry/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.AetCode = $scope.model.AetCode;
                d.Title = $scope.model.Title;
                d.AetType = $scope.model.AetType;
                d.AetDescription = $scope.model.AetDescription;
                d.Status = $scope.model.Status;
                d.Payer = $scope.model.Payer;
                d.FromTime = $scope.model.FromTime;
                d.ToTime = $scope.model.ToTime;
                d.CatCode = $scope.model.CatParent;

            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'desc'])
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
        })
        .withOption('footerCallback', function (tfoot, data) {

            dataservice.getTotalReceipt($scope.model.FromTime, $scope.model.ToTime, $scope.model.AetType, $scope.model.Status, $scope.model.Payer, $scope.model.CatParent, function (rs) {
                rs = rs.data;
                
                $scope.totalReceipts = Math.round(rs.Item1);
                $scope.totalPaymentSlip = Math.round(rs.Item2);
                $scope.totalSurplus = Math.round(rs.Item1 - rs.Item2);
            })
            //if (data.length > 0) {
            //    $scope.$apply(function () {
            //        $scope.totalReceipts = 0;
            //        $scope.totalPaymentSlip = 0;
            //        angular.forEach(data, function (item, index) {
            //            if (item.AetType == "Receipt") {
            //                $scope.totalReceipts = parseFloat($scope.totalReceipts) + parseFloat(item.Total);
            //            } else {
            //                $scope.totalPaymentSlip = parseFloat($scope.totalPaymentSlip) + parseFloat(item.Total);
            //            }
            //        });
            //    });
            //}
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusPlan').withTitle('{{"PPAE_LIST_COL_STATUS_PLAN" | translate}}').renderWith(function (data, type, full) {
        if (full.Type == 1) {
            return '<span class="badge-customer badge-customer-danger  fs9">&nbsp;Quá hạn</span>';
        }
        if (full.Type == 2) {
            return '<span class="badge-customer badge-customer-warning fs9">&nbsp;Đến hạn</span>';
        }
        if (full.Type == 3) {
            return '<span class="badge-customer badge-customer-success  fs9">&nbsp;Chưa đến hạn</span>';
        }
        if (full.Type == 4) {
            return '<span class="badge-customer badge-customer-primary  fs9">&nbsp;Đã hoàn thành</span>';

        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Deadline').withTitle('{{"PPAE_LIST_COL_DEAD_LINE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CatName').withTitle('{{"PPAE_LIST_COL_CAT_NAME" | translate}}').renderWith(function (data, type, full) {
        //if (full.Type == 1) {
        //    return '<span class="text-danger">' + data + '</span>';
        //}
        //if (full.Type == 2) {
        //    return '<span class="text-warning">' + data + '</span>';
        //}
        //if (full.Type == 3) {
        //    return '<span class="text-success">' + data + '</span>';
        //}
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"PPAE_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '200px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AetType').withTitle('{{"PPAE_LIST_COL_AET_TYLE" | translate}}').renderWith(function (data, type) {
        if (data == "Receipt") {
            return "Thu";
        }
        else {
            return "Chi";
        }

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Total').withTitle('{{"PPAE_LIST_COL_TOTAL" | translate}}').renderWith(function (data, type) {
        return '<span class="text-danger">' + $filter('currency')(data, '', 0) + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Currency').withTitle('{{"PPAE_LIST_COL_CURRENCY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusObject').withTitle('{{"PPAE_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        switch (data) {
            case 'Duyệt':
                data = '<span class="bold text-green">' + data + '</span>';
                break;
            case 'Hủy bỏ':
            case 'Từ chối':
                data = '<span class="bold text-danger">' + data + '</span>';
                break;
            case 'Đang xử lý':
                data = '<span class="bold text-waring">' + data + '</span>';
                break;
            case 'Khởi tạo':
                data = '<span class="bold text-primary">' + data + '</span>';
                break;
        }
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Payer').withTitle('{{"PPAE_LIST_COL_PAYER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Receiptter').withTitle('{{"PPAE_LIST_COL_RECEIPTTER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Type').withTitle('{{"PPAE_LIST_COL_TYPE" | translate}}').withOption('sClass', 'tcenter hidden').renderWith(function (data, type, full) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass').withTitle('Tác vụ').renderWith(function (data, type, full, meta) {
    //    return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));
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
        dataservice.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
            var all = {
                Code: '',
                Title: 'Tất cả'
            }
            $scope.treeData.unshift(all)
        });
    }
    $scope.initload();

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '80'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '80',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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

    function initAutocomplete() {
        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-33.8902, 151.1759), new google.maps.LatLng(-33.8474, 151.2631));
        var options = {
            bounds: defaultBounds,
            types: ['geocode']
        };

        var autocomplete = new google.maps.places.Autocomplete(document.getElementById('Address'), options);
    }
    $scope.export = function () {
        var orderBy = 'Id DESC';
        var exportType = 0;
        var orderArr = $scope.dtInstance.DataTable.order();
        var column;
        if (orderArr.length == 2) {
            column = $scope.dtInstance.DataTable.init().aoColumns[orderArr[0]];
            orderBy = column.mData + ' ' + orderArr[1];
        } else if (orderArr.length > 0) {
            var order = orderArr[0];
            column = $scope.dtInstance.DataTable.init().aoColumns[order[0]];
            orderBy = column.mData + ' ' + order[1];
        }
        //var pageInfo = $scope.dtInstance.DataTable.page.info();
        //var obj = {
        //    start: pageInfo.row,
        //    length: pageInfo.length,
        //    //QueryOrderBy: orderBy,
        //    ExportType: exportType,
        //    Month: $scope.model.CustomerMonth,
        //    Packcode: $scope.model.PackCode,
        //    Cif: $scope.model.CustomerCif
        //};

        var page = vm.dtInstance.DataTable.page() + 1;
        var length = vm.dtInstance.DataTable.page.len();
        location.href = "/Admin/FundPlanAccEntry/ExportExcel?"
            + "page=" + page
            + "&row=" + length
            + "&title=" + $scope.model.Title
            + "&total=" + $scope.model.Total
            + "&aetType=" + $scope.model.AetType
            + "&currency=" + $scope.model.Currency
            + "&payer=" + $scope.model.Payer
            + "&receiptter=" + $scope.model.Receiptter
            + "&status=" + $scope.model.Status
            + "&orderBy=" + orderBy
            + "&receiptter=" + $scope.model.receiptter
            + "&fromDatePara=" + $scope.model.FromTime
            + "&toDatePara=" + $scope.model.ToTime
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
        $("#FromTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToTime').datepicker('setStartDate', maxDate);
        });
        $("#ToTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTime').datepicker('setEndDate', maxDate);
        });
    }, 200);
});
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
