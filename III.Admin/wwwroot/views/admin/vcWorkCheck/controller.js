var ctxfolder = "/views/admin/vcWorkCheck";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
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

        $http(req).success(callback);
    };
    return {
        getItem: function (data, callback) {
            $http.get('/Admin/VCWorkCheck/GetItem?id=' + data, {
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
            }).success(callback);
        },
        getAllStaff: function (callback) {
            $http.post('/Admin/VCWorkCheck/GetAllStaff/').success(callback);
        },
        getListCustomer: function (callback) {
            $http.post('/Admin/VCWorkCheck/GetListCustomer/').success(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
    //$rootScope.checkData = function (data) {
    //    var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
    //    // var partternCode = new RegExp("^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$");
    //    //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
    //    var mess = { Status: false, Title: "" }
    //    if (!partternCode.test(data.ProductCode)) {
    //        mess.Status = true;
    //        mess.Title = mess.Title.concat(" - ", "Mã sản phẩm không chứa ký tự đặc biệt hoặc khoảng trắng", "<br/>");
    //    }
    //    return mess;
    //}
    //$rootScope.validationOptions = {
    //    rules: {
    //        ProductCode: {
    //            required: true,
    //            maxlength: 50
    //        },
    //        ProductName: {
    //            required: true,
    //            maxlength: 200
    //        },
    //        Unit: {
    //            required: true,
    //            maxlength: 100
    //        },


    //    },
    //    messages: {
    //        ProductCode: {
    //            required: "Nhập sản phẩm!",
    //            maxlength: "Mã sản phẩm không vượt quá 100 kí tự!"
    //        },
    //        ProductName: {
    //            required: "Nhập tên sản phẩm!",
    //            maxlength: "Tên sản phẩm không vượt quá 200 kí tự!"
    //        },
    //        Unit: {
    //            required: "Nhập đơn vị!",
    //            maxlength: "Đơn vị không vượt quá 200 kí tự!"
    //        },

    //    }
    //}
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $http, $filter) {
    var vm = $scope;
    $scope.model = {
        UserName:'',
        FromDate: '',
        ToDate: '',
        WpCode: '',
        Name: '',
        CustomerName: '',
        Checkout: ''
    };
    $scope.CheckoutStatuss = [
        {
            Code: '',
            Name: 'Tất cả trạng thái'
        },
        {
            Code: 'true',
            Name: 'Đã làm xong'
        },
        {
            Code: 'false',
            Name: 'Đang làm việc'
        }
    ];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/VCWorkCheck/Jtable",
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
                d.WpCode = $scope.model.WpCode;
                d.UserName = $scope.model.UserName;
                d.CustomerName = $scope.model.CustomerName;
                d.Checkout = $scope.model.Checkout;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
                    var Id = data.Id;
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.Id] = true;
                        dataservice.getItem(Id, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                var modalInstance = $uibModal.open({
                                    animation: true,
                                    templateUrl: ctxfolder + '/slideImage.html',
                                    controller: 'slideImage',
                                    backdrop: 'true',
                                    size: '60',
                                    resolve: {
                                        para: function () {
                                            return rs.Object;
                                        }
                                    }
                                });
                            }
                        });
                    }
                    $scope.$apply();
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{ "VCMM_LIST_COL_STT" | translate }}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{ "VCMM_LIST_COL_ID" | translate }}').notSortable().withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WpCode').withTitle('{{ "VCMM_LIST_COL_WP_CODE" | translate }}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{ "VCMM_LIST_COL_NAME" | translate }}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CustomerName').withTitle('{{ "VCMM_LIST_COL_STORE" | translate }}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CheckinTime').withTitle('{{ "VCMM_LIST_COL_CHECK_IN" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm') : null;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Checkin').withTitle('Xác nhận đến').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
    //    if (data != "") {
    //        return '<span class="text-success">Đã đến</span>';
    //    } else {
    //        return data;
    //    }
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CheckoutTime').withTitle('{{ "VCMM_LIST_COL_CHECK_OUT" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy HH:mm') : '';  //'<span class="text-warning">Đang làm việc</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Checkout').withTitle('{{ "VCMM_LIST_COL_CURRENT_STATUS" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        if (data != "") {
            return '<span class="text-success">Đã làm xong</span>';
        } else {
            return '<span class="text-warning">Đang làm việc</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TimeNode').withTitle('{{ "VCMM_LIST_COL_TIME_IMPLEMENT" | translate }}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Image').withTitle('{{ "VCMM_LIST_COL_IMAGE_CHECKIN_CHECKOUT" | translate }}').renderWith(function (data, type) {
        return data === "" || data == null ? '<img class="img-circle" src="/images/default/no_user.png" height="65" width="65">' : '<img class="img-circle" src="' + data + '" onerror=this.src="/images/default/no_image.png" height="65" width="65">';
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        $scope.reload();
    }

    $rootScope.rootreload = function () {
        $scope.reload();
    }

    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '70',

    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}
    //$scope.edit = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: '70',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}
    //$scope.delete = function (id) {
    //    $confirm({ text: 'Bạn có chắc chắn xóa?', title: 'Xác nhận', cancel: ' Hủy ' })
    //        .then(function () {
    //            App.blockUI({
    //                target: "#contentMain",
    //                boxed: true,
    //                message: 'loading...'
    //            });
    //            dataservice.delete(id, function (result) {
    //                if (result.Error) {
    //                    App.toastrError(result.Title);
    //                } else {
    //                    App.toastrSuccess(result.Title);
    //                    $scope.reload();
    //                }
    //                App.unblockUI("#contentMain");
    //            });
    //        });
    //}
    //function loadDate() {
    //    $("#FromDate").datepicker({
    //        inline: false,
    //        autoclose: true,
    //        format: "dd/mm/yyyy",
    //        fontAwesome: true,
    //    });
    //    $("#ToDate").datepicker({
    //        inline: false,
    //        autoclose: true,
    //        format: "dd/mm/yyyy",
    //        fontAwesome: true,
    //    });
    //}

    //setTimeout(function () {
    //    loadDate();
    //}, 200);


    $scope.initLoad = function () {
        setTimeout(function () {
            $("#FromDate").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
                todayHighlight: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('#ToDate').datepicker('setStartDate', maxDate);
            });

            $("#ToDate").datepicker({
                inline: false,
                autoclose: true,
                format: "dd/mm/yyyy",
                fontAwesome: true,
                todayHighlight: true,
            }).on('changeDate', function (selected) {
                var maxDate = new Date(selected.date.valueOf());
                $('#FromDate').datepicker('setEndDate', maxDate);
            });

            $('.end-date').click(function () {
                $('#FromDate').datepicker('setEndDate', null);
            });
            $('.start-date').click(function () {
                $('#ToDate').datepicker('setStartDate', null);
            });
        }, 200);
    }
    $scope.initLoad();


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
    setTimeout(function () {
        showHideSearch();
    }, 50);

    //Export Excel
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
        
        location.href = "/Admin/VCWorkCheck/ExportExcel?"
            + "page=" + page
            + "&row=" + length
            + "&FromDate=" + $scope.model.FromDate
            + "&ToDate=" + $scope.model.ToDate
            + "&WpCode=" + $scope.model.WpCode
            + "&UserName=" + $scope.model.UserName
            + "&CustomerName=" + $scope.model.CustomerName
            + "&orderBy=" + orderBy
            + "&Checkout=" + $scope.model.Checkout
    }
    $scope.getAllStaff = function () {
        dataservice.getAllStaff(function (rs) {
            $scope.allStaff = rs;
        });
    }
    $scope.getAllStaff();
    $scope.getListCustomer = function () {
        dataservice.getListCustomer(function (rs) {
            $scope.listCustomer = rs;
        });
    }
    $scope.getListCustomer();
});

app.controller('slideImage', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var fisrtImg = [];
    fisrtImg.push(para.ImagePath);
    var nextImgs = [];
    $scope.model = {
        fisrtImg: fisrtImg,
        nextImgs: nextImgs
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        $('.multi-item-carousel .item').each(function () {
            var next = $(this).next();
            if (!next.length) {
                next = $(this).siblings(':first');
            }
            next.children(':first-child').clone().appendTo($(this));

            if (next.next().length > 0) {
                next.next().children(':first-child').clone().appendTo($(this));
            } else {
                $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
            }
        });
    }, 50);
});



