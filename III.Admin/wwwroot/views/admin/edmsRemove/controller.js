var ctxfolder = "/views/admin/edmsRemove";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", "pascalprecht.translate", 'datatables.colreorder', 'angular-confirm', 'ui.select']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        //var formData = new FormData();
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
        insert: function (data, callback) {
            $http.post('/Admin/EDMSRemove/Insert', data, callback).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/EDMSRemove/Update', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/EDMSRemove/Delete/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/EDMSRemove/GetItem/' + data).success(callback);
        },
        getItemDetail: function (data, callback) {
            $http.post('/Admin/EDMSRemove/GetItemDetail/' + data).success(callback);
        },
        //getItemAdd: function (data, callback) {
        //    $http.post('/Admin/EDMSRemove/GetItemAdd?Code=' + data).success(callback);
        //},
        getListPersonProcessor: function (callback) {
            $http.post('/Admin/EDMSRemove/GetListPersonProcessor/').success(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/EDMSRemove/GetListStatus/').success(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/EDMSRemove/UploadImage/', data, callback);
        },

        //Tab Box
        insertTabBox: function (data, callback) {
            $http.post('/Admin/EDMSRemove/InsertTabBox', data, callback).success(callback);
        },
        updateTabBox: function (data, callback) {
            $http.post('/Admin/EDMSRemove/UpdateTabBox', data).success(callback);
        },
        deleteTabBox: function (data, callback) {
            $http.post('/Admin/EDMSRemove/DeleteTabBox/' + data).success(callback);
        },
        getTabBox: function (data, callback) {
            $http.post('/Admin/EDMSRemove/GetTabBox/' + data).success(callback);
        },
        //getListWHS_Code: function (callback) {
        //    $http.post('/Admin/EDMSRemove/GetListWHS_Code/').success(callback);
        //},
        //getListFloorCode: function (data, callback) {
        //    $http.post('/Admin/EDMSRemove/GetListFloorCode?WHS_Code=' + data).success(callback);
        //},
        //getListLineCode: function (data2, callback) {
        //    $http.post('/Admin/EDMSRemove/GetListLineCode?FloorCode=' + data2).success(callback);
        //},
        //getListRackCode: function (data3, callback) {
        //    $http.post('/Admin/EDMSRemove/GetListRackCode?LineCode=' + data3).success(callback);
        //},
        //getListBoxId: function (data4, callback) {
        //    $http.post('/Admin/EDMSRemove/GetListBoxId?RackCode=' + data4).success(callback);
        //},
        getListBoxId: function (callback) {
            $http.post('/Admin/EDMSRemove/GetListBoxId/').success(callback);
        },
        getListBoxIdUpdate: function (data, callback) {
            $http.post('/Admin/EDMSTermites/GetListBoxIdUpdate/' + data).success(callback);
        },
        //Tạo mã QR_Code
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSRemove/GeneratorQRCode?code=' + data).success(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];

        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
            // var partternCode = new RegExp("^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$");
            //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            //if (!partternCode.test(data.Code)) {
            //    mess.Status = true;
            //    mess.Title = mess.Title.concat(" - ", "Mã không chứa ký tự đặc biệt hoặc khoảng trắng", "<br/>");
            //}
            return mess;
        }

        $rootScope.validationOptions = {
            rules: {
                Name: {
                    required: true,
                    maxlength: 255
                },
                FromDate: {
                    required: true,
                    //maxlength: 255
                },
                ToDate: {
                    required: true,
                    //maxlength: 255
                },
                Business: {
                    required: true
                },
            },
            messages: {
                Name: {
                    //required: "Nhập tiêu đề!",
                    required: (caption.EDMSR_VALIDATE_TITLE),
                    maxlength: "Tiêu đề không vượt quá 255 kí tự!"
                },
                FromDate: {
                    //required: "Nhập ngày bắt đầu!",
                    required: (caption.EDMSR_VALIDATE_FROM_DATE),
                    //maxlength: "Tiêu đề không vượt quá 255 kí tự!"
                },
                ToDate: {
                    //required: "Nhập ngày kết thúc!",
                    required: (caption.EDMSR_VALIDATE_MAJOR),
                    //maxlength: "Hành động không vượt quá 255 kí tự!"
                },
                Business: {
                    //required: "Nhập nghiệp vụ!",
                    required: (caption.EDMSR_VALIDATE_TITLE),
                },
            }
        }
    });
    if (isCmRemove) {
        $rootScope.isCmRemove = true;
    }
    if (isBoxRemove) {
        $rootScope.isBoxRemove = true;
    }
    if (isBoxExpired) {
        $rootScope.isBoxExpired = true;
    }

    $rootScope.permission = PERMISSION;
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
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
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };

    //$scope.edit = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: '40',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {

    //    }, function () {
    //    });
    //}
});
app.controller('cmRemove', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        Name: '',
        Business: '',
        PersonProcessor: '',
        Status: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRemove/JTableCmRemove",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Name = $scope.model.Name;
                d.Business = $scope.model.Business;
                d.PersonProcessor = $scope.model.PersonProcessor;
                d.Status = $scope.model.Status;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $compile(angular.element(row))($scope);
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
                        $('#tblDataCmRemove').DataTable().$('tr.selected').removeClass('selected');
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL_FROMDATE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ToDate').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL_TODATE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Business').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL_BUSINESS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Danh sách người phụ trách" ng-click="view(' + full.Id + ')">Chi tiết</a>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Picture').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL_PICTURE" | translate}}').notSortable().renderWith(function (data, type, full) {
        return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL_NOTE" | translate}}').notSortable().renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL_STATUS_NAME" | translate}}').notSortable().renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL" | translate}}').withOption('sClass', '').renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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


    $scope.initLoad = function () {
        dataservice.getListPersonProcessor(function (result) {
            $scope.ListPersonProcessor = result.Object;
        });
        dataservice.getListStatus(function (result) {
            $scope.ListStatus = result.Object;
        });
    }
    $scope.initLoad();
    $rootScope.reload = function () {
        $scope.reload();
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
    $scope.view = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detailUser.html',
            controller: 'detailUser',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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
            var from = $scope.model.FromDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#DateToBoxRemove').datepicker('setStartDate', date);
            $('#FromToBoxRemove').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            var from = $scope.model.ToDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#FromToBoxRemove').datepicker('setEndDate', $scope.model.ToDate);
            $('#DateToBoxRemove').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);

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
    }, 200);
});
app.controller('boxRemove', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        Text: '',
        PersonProcessor: '',
        Status: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRemove/JTableBoxRemove",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Text = $scope.model.Text;
                d.PersonProcessor = $scope.model.PersonProcessor;
                d.Status = $scope.model.Status;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
    }).withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoxCode').withTitle('{{"EDMSR_TAB_BOX_REMOVE_COL_BOX_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumBoxth').withTitle('{{"EDMSR_TAB_BOX_REMOVE_COL_NUMBOXTH" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WHS_Name').withTitle('{{"EDMSR_TAB_BOX_REMOVE_COL_WHS_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Placement').withTitle('{{"EDMSR_TAB_BOX_REMOVE_COL_PLACEMENT" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle('{{"Tầng" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('L_Text').withTitle('Dãy').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('RackName').withTitle('{{"Kệ" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('{{"EDMSR_TAB_BOX_REMOVE_COL_FROMDATE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ToDate').withTitle('{{"EDMSR_TAB_BOX_REMOVE_COL_TODATE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"EDMSR_TAB_BOX_REMOVE_COL_ACTION" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return '<a title="Danh sách người phụ trách" ng-click="view(' + full.Id + ')">Chi tiết</a>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('{{"EDMSR_TAB_BOX_REMOVE_COL_STATUS_NAME" | translate}}').notSortable().renderWith(function (data, type, full) {
        return data;
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


    $scope.initLoad = function () {
        dataservice.getListPersonProcessor(function (result) {
            $scope.ListPersonProcessor = result.Object;
        });
        dataservice.getListStatus(function (result) {
            $scope.ListStatus = result.Object;
        });
    }
    $scope.initLoad();
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadRemove = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '60'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () { });
    //};
    //$scope.edit = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: '60',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () { });
    //};
    $scope.view = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detailUser.html',
            controller: 'detailUser',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
    //$scope.delete = function (id) {
    //    var modalInstance = $uibModal.open({
    //        templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
    //        windowClass: "message-center",
    //        controller: function ($scope, $uibModalInstance) {
    //            $scope.message = "Bạn có chắc chắn muốn xóa ?";
    //            $scope.ok = function () {
    //                dataservice.delete(id, function (rs) {
    //                    if (rs.Error) {
    //                        App.toastrError(rs.Title);
    //                    } else {
    //                        App.toastrSuccess(rs.Title);
    //                        $uibModalInstance.close();
    //                    }
    //                });
    //            };

    //            $scope.cancel = function () {
    //                $uibModalInstance.dismiss('cancel');
    //            };
    //        },
    //        size: '25',
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () {
    //    });
    //};

    function loadDate() {
        $("#FromToBoxRemove").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateToBoxRemove').datepicker('setStartDate', maxDate);
        });
        $("#DateToBoxRemove").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromToBoxRemove').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            var from = $scope.model.FromDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#DateToBoxRemove').datepicker('setStartDate', date);
            $('#FromToBoxRemove').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            var from = $scope.model.ToDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#FromToBoxRemove').datepicker('setEndDate', $scope.model.ToDate);
            $('#DateToBoxRemove').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);

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
    }, 200);
});
app.controller('boxExpired', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        Text: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRemove/JTableBoxExpired",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Text = $scope.model.Text;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BoxCode').withTitle('{{"EDMSR_TAB_BOX_EXPIRED_COL_BOX_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumBoxth').withTitle('{{"EDMSR_TAB_BOX_EXPIRED_COL_NUMBOXTH" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('OrgName').withTitle('{{"EDMSR_TAB_BOX_EXPIRED_COL_ORGNAME" | translate}}').notSortable().renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ExpiredDate').withTitle('{{"EDMSR_TAB_BOX_EXPIRED_COL_EXPIRED_DATE" | translate}}').renderWith(function (data, type, full) {
        if (full.LevelWarning == "1" || full.LevelWarning == "2") {
            return '<span class="text-danger bold"> ' + data + '</span>';
        } else if (full.LevelWarning == "3") {
            return '<span class="text-danger"> ' + data + '</span>';
        } else if (full.LevelWarning == "4") {
            return '<span class="text-warning"> ' + data + '</span>';
        } else {
            return '<span class="text-info"> ' + data + '</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WHS_Name').withTitle('{{"EDMSR_TAB_BOX_EXPIRED_COL_WHS_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Placement').withTitle('{{"EDMSR_TAB_BOX_EXPIRED_COL_PLACEMENT" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle('{{"Tầng" | translate}}').renderWith(function (data, type, full) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('L_Text').withTitle('Dãy').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('RackName').withTitle('{{"Kệ" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusSecurity').withTitle('{{"EDMSR_TAB_BOX_EXPIRED_COL_STATUS_SECURITY" | translate}}').renderWith(function (data, type) {
        return data;
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


    $scope.initLoad = function () {
    }
    $scope.initLoad();
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadBoxExpired = function () {
        $scope.reload();
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    //$scope.add = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/add.html',
    //        controller: 'add',
    //        backdrop: 'static',
    //        size: '60'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () { });
    //};
    //$scope.edit = function (id) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: '60',
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () { });
    //};
    $scope.view = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detailUser.html',
            controller: 'detailUser',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
    //$scope.delete = function (id) {
    //    var modalInstance = $uibModal.open({
    //        templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
    //        windowClass: "message-center",
    //        controller: function ($scope, $uibModalInstance) {
    //            $scope.message = "Bạn có chắc chắn muốn xóa ?";
    //            $scope.ok = function () {
    //                dataservice.delete(id, function (rs) {
    //                    if (rs.Error) {
    //                        App.toastrError(rs.Title);
    //                    } else {
    //                        App.toastrSuccess(rs.Title);
    //                        $uibModalInstance.close();
    //                    }
    //                });
    //            };

    //            $scope.cancel = function () {
    //                $uibModalInstance.dismiss('cancel');
    //            };
    //        },
    //        size: '25',
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () {
    //    });
    //};

    function loadDate() {
        $("#FromToBoxExpired").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateToBoxExpired').datepicker('setStartDate', maxDate);
        });
        $("#DateToBoxExpired").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromToBoxExpired').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            var from = $scope.model.FromDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#DateToBoxExpired').datepicker('setStartDate', date);
            $('#FromToBoxExpired').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            var from = $scope.model.ToDate.split("/");
            var date = new Date(from[2], from[1] - 1, from[0])
            $('#FromToBoxExpired').datepicker('setEndDate', $scope.model.ToDate);
            $('#DateToBoxExpired').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);

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
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reload();
    }
    $scope.model1 = {
        ListChoose: []
    };
    $scope.model = {};
    $rootScope.Id = '';
    //$scope.ListFloorCode = [];
    //$scope.ListLineCode = [];
    //$scope.ListRackCode = [];
    $scope.ListBoxId = [];
    $scope.QR_Code_Req = '';
    //$scope.model = {
    //    Id: null,
    //    Code: 'CM_Remove_2019_03_18_14_17_23',
    //    Name: '',
    //    FromDate: '',
    //    ToDate: '',
    //    Business: '',
    //    PersonProcessor: '',
    //    Note: '',
    //    Picture: '',
    //    Status: '',
    //};
    var d = new Date();
    var dd = d.getDate();
    var mm = d.getMonth() + 1;
    var hh = d.getHours();
    var mmi = d.getMinutes();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (hh < 10) {
        hh = '0' + hh;
    }
    if (mmi < 10) {
        mmi = '0' + mmi;
    }
    $scope.model.Code = 'CM_Remove_' + d.getFullYear() + '_' + mm + '_' + dd + '_' + hh + '_' + mmi + '_' + d.getSeconds();


    $scope.initData = function () {
        dataservice.getListPersonProcessor(function (result) {
            $scope.ListPersonProcessor = result.Object;
        });
        dataservice.getListStatus(function (result) {
            $scope.ListStatus = result.Object;
        });
        dataservice.getListBoxId(function (result) {
            $scope.ListBoxId = result.Object;
        });
        //dataservice.getListWHS_Code(function (result) {
        //    $scope.ListWHS_Code = result.Object;
        //});
    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.PersonProcessor == "" || data.PersonProcessor == null || data.PersonProcessor == undefined) {
            $scope.errorPersonProcessor = true;
            mess.Status = true;
        } else {
            $scope.errorPersonProcessor = false;
        }
        if (data.Status == "" || data.Status == null || data.Status == undefined) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        //if (data.FromDate == "" || data.FromDate == null || data.FromDate == undefined) {
        //    $scope.errorFromDate = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorFromDate = false;
        //}
        //if (data.ToDate == "" || data.ToDate == null || data.ToDate == undefined) {
        //    $scope.errorToDate = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorToDate = false;
        //}

        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        //if (SelectType == "FromDate" && $scope.model.FromDate != "") {
        //    $scope.errorFromDate = false;
        //}
        //if (SelectType == "ToDate" && $scope.model.ToDate != "") {
        //    $scope.errorToDate = false;
        //}
    }

    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
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
    $scope.submit = function () {
        $scope.model.PersonProcessor = $scope.model1.ListChoose.join(";");
        validationSelect($scope.model);

        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            //console.log('Name File: ' + extFile);
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //debugger
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataservice.uploadImage(data, function (rs) {
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Picture = '/uploads/images/' + rs.Object;
                                            //debugger
                                            if ($rootScope.Id == '') {
                                                dataservice.insert($scope.model, function (rs) {
                                                    //$rootScope.Code = $scope.model.Code;
                                                    if (rs.Error) {
                                                        App.toastrError(rs.Title);
                                                    } else {
                                                        App.toastrSuccess(rs.Title);
                                                        $rootScope.Id = rs.Object;
                                                    }
                                                });
                                            } else{
                                                dataservice.update($scope.model, function (rs) {
                                                    if (rs.Error) {
                                                        App.toastrError(rs.Title);
                                                    } else {
                                                        App.toastrSuccess(rs.Title);
                                                        $uibModalInstance.close();
                                                        $rootScope.reloadRemove();
                                                        $rootScope.reloadBoxExpired();
                                                    }
                                                });
                                            }
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                $scope.model.Picture = '/uploads/images/no-image.png';
                if ($rootScope.Id == '') {
                    dataservice.insert($scope.model, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $rootScope.Id = rs.Object;
                            $rootScope.reloadRemove();
                            $rootScope.reloadBoxExpired();
                        }
                    });
                } else {
                    dataservice.update($scope.model, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $rootScope.reloadRemove();
                            $rootScope.reloadBoxExpired();
                        }
                    });
                }
            }
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);


    function loadDate() {
        var dateToday = new Date();

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

        $('#DateTo').datepicker('setStartDate', dateToday);
        $('#FromTo').datepicker('setStartDate', dateToday);

        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', dateToday);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
        $rootScope.reload();
    }
    $scope.model1 = {
        ListChoose: []
    };
    $scope.model = {};
    //$scope.ListFloorCode = [];
    //$scope.ListLineCode = [];
    //$scope.ListRackCode = [];
    $scope.ListBoxId = [];
    $scope.QR_Code_Req = '';
    $rootScope.Id = para;
    //$scope.model = {
    //    Id: null,
    //    Code: 'CM_Remove_2019_03_18_14_17_23',
    //    Name: '',
    //    FromDate: '',
    //    ToDate: '',
    //    Business: '',
    //    PersonProcessor: '',
    //    Note: '',
    //    Picture: '',
    //    Status: '',
    //};

    $scope.initData = function () {
        dataservice.getListPersonProcessor(function (result) {
            $scope.ListPersonProcessor = result.Object;
        });
        dataservice.getListStatus(function (result) {
            $scope.ListStatus = result.Object;
        });
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                debugger
                $scope.model = rs.Object;
                if ($scope.model.PersonProcessor != '' && $scope.model.PersonProcessor != null) {
                    $scope.model1.ListChoose = $scope.model.PersonProcessor.split(';');
                }
            }
        });
        dataservice.getListBoxId(function (result) {
            $scope.ListBoxId = result.Object;
        });
        //dataservice.getListWHS_Code(function (result) {
        //    $scope.ListWHS_Code = result.Object;
        //});
    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.PersonProcessor == "" || data.PersonProcessor == null || data.PersonProcessor == undefined) {
            $scope.errorPersonProcessor = true;
            mess.Status = true;
        } else {
            $scope.errorPersonProcessor = false;
        }
        if (data.Status == "" || data.Status == null || data.Status == undefined) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        //if (data.FromDate == "" || data.FromDate == null || data.FromDate == undefined) {
        //    $scope.errorFromDate = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorFromDate = false;
        //}
        //if (data.ToDate == "" || data.ToDate == null || data.ToDate == undefined) {
        //    $scope.errorToDate = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorToDate = false;
        //}

        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        //if (SelectType == "FromDate" && $scope.model.FromDate != "") {
        //    $scope.errorFromDate = false;
        //}
        //if (SelectType == "ToDate" && $scope.model.ToDate != "") {
        //    $scope.errorToDate = false;
        //}
    }

    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
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
    $scope.submit = function () {
        $scope.model.PersonProcessor = $scope.model1.ListChoose.join(";");
        validationSelect($scope.model);

        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            //console.log('Name File: ' + extFile);
            if (extFile !== "") {
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError(caption.CATEGORY_MSG_FORMAT_REQUIRED);
                } else {
                    var fi = document.getElementById('file');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 1024) {
                        App.toastrError(caption.CATEGORY_MSG_FILE_SIZE_MAXXIMUM);
                    } else {
                        var fileUpload = $("#file").get(0);
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //debugger
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                if (width > 5000 || height > 5000) {
                                    App.toastrError(caption.CATEGORY_MSG_IMG_SIZE_MAXIMUM);
                                } else {
                                    var data = new FormData();
                                    file = fileUpload.files[0];
                                    data.append("FileUpload", file);
                                    dataservice.uploadImage(data, function (rs) {
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                            return;
                                        }
                                        else {
                                            $scope.model.Picture = '/uploads/images/' + rs.Object;
                                            //debugger

                                            dataservice.update($scope.model, function (rs) {
                                                if (rs.Error) {
                                                    App.toastrError(rs.Title);
                                                } else {
                                                    App.toastrSuccess(rs.Title);
                                                    $uibModalInstance.close();
                                                }
                                            });
                                        }
                                    })
                                }
                            };
                        }
                    }
                }
            } else {
                //debugger
                dataservice.update($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                        $rootScope.reloadRemove();
                        $rootScope.reloadBoxExpired();
                    }
                });
            }
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);


    function loadDate() {
        var dateToday = new Date();

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

        $('#DateTo').datepicker('setStartDate', dateToday);
        $('#FromTo').datepicker('setStartDate', dateToday);

        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', dateToday);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('detailUser', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model = {};
    $scope.initData = function () {
        dataservice.getItemDetail(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model.ListData = rs.Object;
            }
        });
    }
    $scope.initData();

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 50);

});
app.controller('tabBox', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $confirm) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        RemoveId: $rootScope.Id
    };
    $scope.modelSearch = {
        Text: ''
    };
    $scope.isEdit = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSRemove/JTableTabBox",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Id = $rootScope.Id;
                d.Text = $scope.modelSearch.Text;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("check").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('WHS_Name').withTitle('{{"EDMSR_TAB_BOX_EXPIRED_COL_WHS_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('createdTime').withTitle('{{"CONTRACT_CURD_TAB_FILE_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
    //    return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FloorName').withTitle('{{"EDMSR_COL_FLOOR" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('L_Text').withTitle('{{"EDMSR_COL_ROW" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RackName').withTitle('{{"EDMSR_COL_SHELF" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumBoxth').withTitle('{{"EDMSR_TAB_BOX_EXPIRED_COL_NUMBOXTH" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"Ghi chú" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"EDMSR_TAB_CM_REMOVE_COL" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.BoxId == undefined || data.BoxId == null || data.BoxId == "") {
            $scope.errorBoxId = true;
            mess.Status = true;
        } else {
            $scope.errorBoxId = false;
        }

        return mess;
    };
    $scope.changleSelect = function (SelectType, item) {
        debugger
        if (SelectType == "BoxId" && $scope.model.BoxId != "") {
            $scope.errorBoxId = false;
            //Tạo mã QR_Code
            $scope.createReqCode(item.BoxCode);
        }

        //if (SelectType == "WHS_Code" && $scope.model.WHS_Code != "") {
        //    //debugger
        //    dataservice.getListFloorCode($scope.model.WHS_Code, function (result) {
        //        $scope.ListFloorCode = result.Object;
        //        $scope.model.FloorCode = '';
        //        $scope.ListLineCode = [];
        //        $scope.model.LineCode = '';
        //        $scope.ListRackCode = [];
        //        $scope.model.RackCode = '';
        //        $scope.ListBoxId = [];
        //        $scope.model.BoxId = '';
        //    });
        //}

        //if (SelectType == "FloorCode" && $scope.model.FloorCode != "") {
        //        //debugger
        //    dataservice.getListLineCode($scope.model.FloorCode, function (result) {
        //        $scope.ListLineCode = result.Object;
        //        $scope.model.LineCode = '';
        //        $scope.ListRackCode = [];
        //        $scope.model.RackCode = '';
        //        $scope.ListBoxId = [];
        //        $scope.model.BoxId = '';
        //    });
        //}

        //if (SelectType == "LineCode" && $scope.model.LineCode != "") {
        //        //debugger
        //    dataservice.getListRackCode($scope.model.LineCode, function (result) {
        //        $scope.ListRackCode = result.Object;
        //        $scope.model.RackCode = '';
        //        $scope.ListBoxId = [];
        //        $scope.model.BoxId = '';
        //    });
        //}

        //if (SelectType == "RackCode" && $scope.model.RackCode != "") {
        //        //debugger
        //    dataservice.getListBoxId($scope.model.RackCode, function (result) {
        //        $scope.ListBoxId = result.Object;
        //        $scope.model.BoxId = '';
        //    });
        //}
    }

    $scope.createReqCode = function (boxCode) {
        dataservice.generatorQRCode(boxCode, function (result) {
            $scope.QR_Code_Req = result;
        });
    };

    $scope.add = function () {
        validationSelect($scope.model);
        if (validationSelect($scope.model).Status == false) {
            debugger
            $scope.model.RemoveId = $rootScope.Id;
            dataservice.insertTabBox($scope.model, function (result) {
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    //$scope.model = {
                    //    RemoveId: $rootScope.Id
                    //};
                    $scope.reload();
                    $rootScope.reloadRemove();
                    $rootScope.reloadBoxExpired();
                }
            });
        }
    }

    $scope.edit = function (id) {
        dataservice.getTabBox(id, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                debugger
                dataservice.getListBoxIdUpdate(id, function (result) {
                    $scope.ListBoxId = result.Object;
                });

                $scope.model = rs.Object;
                //dataservice.getListFloorCode($scope.model.WHS_Code, function (result) {
                //    $scope.ListFloorCode = result.Object;
                //});
                //dataservice.getListLineCode($scope.model.FloorCode, function (result) {
                //    $scope.ListLineCode = result.Object;
                //});
                //dataservice.getListRackCode($scope.model.LineCode, function (result) {
                //    $scope.ListRackCode = result.Object;
                //});

                $scope.isEdit = true;
                $("#btnAddFile").addClass("hidden");
                $("#btnEditFile").removeClass("hidden");
            }
        })
    }

    $scope.save = function () {
        dataservice.updateTabBox($scope.model, function (result) {
            if (result.Error) {
                App.toastrError(result.Title);
            } else {
                App.toastrSuccess(result.Title);
                //$scope.model = {
                //    RemoveId: $rootScope.Id
                //};
                $scope.isEdit = false;
                $("#btnAddFile").removeClass("hidden");
                $("#btnEditFile").addClass("hidden");
                $scope.reload();
                $rootScope.reloadRemove();
                $rootScope.reloadBoxExpired();
            }
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteTabBox(id, function (result) {
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $rootScope.reloadRemove();
                            $rootScope.reloadBoxExpired();
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
});
