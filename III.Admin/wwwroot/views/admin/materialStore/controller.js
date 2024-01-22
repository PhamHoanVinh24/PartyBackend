var ctxfolder = "/views/admin/materialStore";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getUser: function (callback) {
            $http.post('/Admin/MaterialStore/GetUser').then(callback);
        },
        getOrganization: function (callback) {
            $http.post('/Admin/MaterialStore/GetBranch').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/MaterialStore/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/MaterialStore/Update/', data).then(callback);
        },
        getData: function (data, callback) {
            $http.post('/Admin/MaterialStore/GetStore?id=' + data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/MaterialStore/Delete/' + data).then(callback);
        },
         getStoreAreas: function (callback) {
             $http.post('/Admin/MaterialStore/getStoreAreas').then(callback);
        },
         getStoreStatuss: function (callback) {
             $http.post('/Admin/MaterialStore/getStoreStatuss').then(callback);
         },
         getStoreExtends: function (callback) {
             $http.post('/Admin/MaterialStore/getStoreExtends').then(callback);
         },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, dataservice, $filter, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'


        })
        $rootScope.validationOptions = {
            rules: {
                StoreCode: {
                    required: true,
                    maxlength: 100
                },
                StoreName: {
                    required: true,
                    maxlength: 250
                },
                Description: {
                    maxlength: 500
                }
            },
            messages: {
                StoreCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MATERIAL_STORE_COL_STORE_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MATERIAL_STORE_LIST_COL_STORE_CODE).replace("{1}", "100")
                },
                StoreName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.MATERIAL_STORE_LIST_COL_STORE_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.MATERIAL_STORE_LIST_COL_STORE_NAME).replace("{1}", "250")
                },
                Description: {
                    axlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.MATERIAL_STORE_LBL_DESCRIPTION).replace('{1}', '500')
                }
            }
        }
    });
         
    
    $rootScope.ActivityType = [{
        Value: 1,
        Name: 'Cho mượn'
    }, {
        Value: 2,
        Name: 'Mua'
    }, {
        Value: 3,
        Name: 'Bán | Thanh lý'
    }, {
        Value: 4,
        Name: 'Hủy'
    }, {
        Value: 5,
        Name: 'Sửa | Bảo hành'
    }];
    $rootScope.ListUser = [];
    dataservice.getUser(function (rs) {rs=rs.data;
        $rootScope.ListUser = rs;
    });
    $rootScope.DateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
    $rootScope.DateBeforeSevenDay = $filter('date')(new Date().setDate((new Date()).getDate() + (-7)), 'dd/MM/yyyy');

    dataservice.getStoreAreas(function (rs) {rs=rs.data;
        $rootScope.StoreAreas = rs.Object;
    });
    dataservice.getStoreStatuss(function (rs) {rs=rs.data;
        $rootScope.StoreStatuss = rs;
    });
    dataservice.getStoreExtends(function (rs) {rs=rs.data;
        $rootScope.StoreExtends = rs.Object;
    });
});
app.config(function ($routeProvider, $validatorProvider,$translateProvider) {
    //$translateProvider.useUrlLoader('/Language/Translation');
    //$translateProvider.preferredLanguage('en-US');
    //caption = $translateProvider.translations();
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.model = {
        StoreCode: '',
        StoreName: '',
        FromDate: '',
        ToDate: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/MaterialStore/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.StoreCode = $scope.model.StoreCode;
                d.StoreName = $scope.model.StoreName;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
                d.Type = "PRODUCT";
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"ADM_APP_CURD_LBL_APP_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('code').withTitle('{{"MATERIAL_STORE_LIST_COL_STORE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('name').withTitle('{{"MATERIAL_STORE_LIST_COL_STORE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('countFloor').withTitle('{{"MATERIAL_STORE_CURD_TXT_NUMBER_FLOOR" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('description').withTitle('{{"MATERIAL_STORE_LIST_COL_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('location').withTitle('{{"MATERIAL_STORE_LIST_COL_LOCATION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('manager').withTitle('{{"MATERIAL_STORE_LIST_COL_MANAGER" | translate}}').renderWith(function (data, type) {
        for (var i = 0; i < $rootScope.ListUser.length; i++) {
            if (data === $rootScope.ListUser[i].Id) {
                return $rootScope.ListUser[i].UserName;
            }
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('createdTime').withTitle('{{"MATERIAL_STORE_LIST_COL_DATE_CREATED" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"MATERIAL_STORE_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45)" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>'
            + '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45);" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';

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
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '40'
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
            size: '40',
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}',"");
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {rs=rs.data;
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
        //$('#FromTo').datepicker('setEndDate', $rootScope.DateNow);
        //$('#DateTo').datepicker('setStartDate', $rootScope.DateBeforeSevenDay);
        //$('#FromTo').datepicker('update', $rootScope.DateBeforeSevenDay);
        //$('#DateTo').datepicker('update', $rootScope.DateNow);
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        showHideSearch();
        loadDate();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {
        StoreCode: '',
        StoreName: '',
        Location: '',
        BranchId: '',
        UserId: '',
        Description: '',
        CountFloor:1
    }

    $scope.initData = function () {
        dataservice.getUser(function (rs) {rs=rs.data;
            $scope.Managers = rs;
        });
        dataservice.getOrganization(function (rs) {rs=rs.data;
            $scope.Organizations = rs;
        })
    }
    $scope.initData();

    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.insert($scope.model, function (rs) {
                rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.listUser = [];
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        var listManager = [];
        var listBranch = [];
        dataservice.getUser(function (rs) {rs=rs.data;
            listManager = rs;
            $scope.Managers = rs;
        });
        dataservice.getOrganization(function (rs) {rs=rs.data;
            listBranch = rs;
            $scope.Organizations = rs;
        })
        dataservice.getData(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
                //angular.forEach(listManager, function (value) {
                //    if (rs.UserId == value.Id) {
                //        $scope.model.UserId = value;
                //    }
                //});
                //angular.forEach(listBranch, function (value) {
                //    if (rs.BranchId == value.OrgId) {
                //        $scope.model.BranchId = value;
                //    }
                //});
            }
        });

    }
    $scope.initData();
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            dataservice.update($scope.model, function (rs) {
                rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});