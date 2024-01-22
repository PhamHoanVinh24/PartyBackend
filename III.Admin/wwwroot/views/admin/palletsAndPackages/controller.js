var ctxfolder = "/views/admin/palletsAndPackages";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_PALLET', ['App_ESEIM_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ng.jsoneditor', 'monospaced.qrcode']);

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
        // dummy
        createTicket: function (data, callback) {
            $http.post('/Admin/CylinderFuelLoading/CreateTicket', data, callback).then(callback);
        },
        getStatusOrder: function (callback) {
            $http.post('/Admin/CheckProductQuality/GetStatusOrder').then(callback);
        },
        getListEmployess: function (callback) {
            $http.post('/Admin/CheckProductQuality/GetListEmployess').then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/CheckProductQuality/GetListUnit').then(callback);
        },
        getDetailTicketByID: function (data, callback) {
            $http.post('/Admin/CylinderFuelLoading/GetTicketById/' + data).then(callback);
        },
        updateTicketHeader: function (id, data, callback) {
            $http.post('/Admin/CylinderFuelLoading/UpdateTicket/' + id, data, callback).then(callback);
        },
        deleteTicketHeader: function (data, callback) {
            $http.post('/Admin/CylinderFuelLoading/DeleteTicket/' + data).then(callback);
        },
        getListBottle: function (callback) {
            $http.post('/MobileProduct/GetListProductCategory?group=BOTTLE').then(callback);
        },
        getListStaticTank: function (callback) {
            $http.post('/MobileProduct/GetListProductCategory?group=STATIC_TANK').then(callback);
        },
        createTicketDetail: function (data, callback) {
            $http.post('/Admin/CylinderFuelLoading/CreateTicketDetail', data, callback).then(callback);
        },
        getTicketDetailById: function (data, callback) {
            $http.post('/Admin/CylinderFuelLoading/GetTicketDetailById/' + data).then(callback);
        },
        updateTicketDetail: function (id, data, callback) {
            $http.post('/Admin/CylinderFuelLoading/UpdateTicketDetail/' + id, data, callback).then(callback);
        },
        deleteTicketDetail: function (data, callback) {
            $http.post('/Admin/CylinderFuelLoading/DeleteTicketDetail/' + data).then(callback);
        },
        // start
        getStatusHeader: function (callback) {
            $http.post('/Admin/CheckProductQuality/GetStatusOrder').then(callback);
        },
        getListStatus: function (callback) {
            $http.get('/Admin/PalletsAndPackages/GetListStatus').then(callback);
        },
        getListMapping: function (callback) {
            $http.get('/Admin/EDMSDiagramWarehouse/GetListMapping?start=').then(callback);
        },
        getTicketCode: function (callback) {
            $http.get('/Admin/PalletsAndPackages/GetTicketCode').then(callback);
        },
        getListTypePacking: function (callback) {
            $http.get('/Admin/PalletsAndPackages/GetListTypePacking').then(callback);
        },
        getListPackage: function (callback) {
            $http.get('/Admin/PalletsAndPackages/GetListPackage').then(callback);
        },
        createPallet: function (data, callback) {
            $http.post('/Admin/PalletsAndPackages/Insert', data, callback).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/PalletsAndPackages/GetItem?id=' + data).then(callback);
        },
        updatePallet: function (data, callback) {
            $http.put('/Admin/PalletsAndPackages/Update', data, callback).then(callback);
        },
        deletePallet: function (data, callback) {
            $http.delete('/Admin/PalletsAndPackages/Delete/' + data).then(callback);
        },
        createHeader: function (data, callback) {
            $http.post('/Admin/PalletsAndPackages/InsertHeader', data, callback).then(callback);
        },
        getItemHeader: function (data, callback) {
            $http.get('/Admin/PalletsAndPackages/GetItemHeader?id=' + data).then(callback);
        },
        updateHeader: function (data, callback) {
            $http.put('/Admin/PalletsAndPackages/UpdateHeader', data, callback).then(callback);
        },
        deleteHeader: function (data, callback) {
            $http.delete('/Admin/PalletsAndPackages/DeleteHeader/' + data).then(callback);
        },
        getListProductInStock: function (callback) {
            $http.post('/Admin/PalletsAndPackages/GetListProductInStock').then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/PalletsAndPackages/GetListProduct').then(callback);
        },
        getListProperties: function (callback) {
            $http.post('/MobileProduct/GetListProperties').then(callback);
        },
        getInfoProduct: function (data, callback) {
            $http.post('/MobileProduct/GetInfoProduct?product=' + data).then(callback);
        },
        createDetail: function (data, callback) {
            $http.post('/Admin/PalletsAndPackages/InsertDetail', data, callback).then(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/PalletsAndPackages/GetItemDetail?id=' + data).then(callback);
        },
        updateDetail: function (data, callback) {
            $http.put('/Admin/PalletsAndPackages/UpdateDetail', data, callback).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.delete('/Admin/PalletsAndPackages/DeleteDetail/' + data).then(callback);
        },
        deleteAllDetail: function (data, callback) {
            $http.delete('/Admin/PalletsAndPackages/DeleteAllDetail/' + data).then(callback);
        },
        getListStatusReady: function (callback) {
            $http.get('/MobileProduct/GetListStatusReady').then(callback);
        },
        //Kiet sync app
        updatePackageTicketDt: function (data, callback) {
            $http.post('/Admin/PalletsAndPackages/UpdatePackageTicketDetail', data, callback).then(callback);
        },
    }
});

// Hoặc bạn có thể sử dụng factory
app.factory('value', function () {
    var TicketCode = "";
    var InStock = false;
    var IsUpdate = false;
    var IsReadOnly = false;
    return {
        getTicketCode: function () {
            return TicketCode;
        },
        setTicketCode: function (value) {
            TicketCode = value;
        },
        getInStock: function () {
            return InStock;
        },
        setInStock: function (value) {
            InStock = value;
        },
        getIsUpdate: function () {
            return IsUpdate;
        },
        setIsUpdate: function (value) {
            IsUpdate = value;
        },
        getIsReadOnly: function () {
            return IsReadOnly;
        },
        setIsReadOnly: function (value) {
            IsReadOnly = value;
        },
    };
});

app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});

app.controller('Ctrl_ESEIM_PALLET', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, $cookies, $translate, dataservice) {
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
        });
        $rootScope.validationOptions = {
            rules: {
                ProductCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 50
                },
                ProductName: {
                    required: true,
                    maxlength: 50
                },

            },
            messages: {
                ProductCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SCG_CURD_TXT_CODE),
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.SCG_CURD_LBL_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SCG_COL_CODE).replace("{1}", "50")
                },
                ProductName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SCG_CURD_TXT_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.SCG_CURD_TXT_NAME).replace("{1}", "50")
                },

            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/ServiceCategoryPrice/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();


    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/indexTab.html',
            controller: 'tab'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
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

app.controller('tab', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window, myService, $location) {
    $rootScope.tab = '';
    $rootScope.headingIndex = "PAP_PALLETANDPACKAGE_LIST";
    $rootScope.headingDetail = "PAUP_LIST";
    $scope.chooseHeader = function () {
        $rootScope.tab = 'HEADER';
    }
    $scope.chooseDetail = function () {
        $rootScope.tab = 'DETAIL';
    }
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        Status: '',
        Keyword: '',
        MappingCode: '',
    };

    $scope.initData = function () {
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getListMapping(function (rs) {
            rs = rs.data;
            $scope.listMapping = rs;
        });
        callback();
    }

    $scope.initData();
    $scope.listEmployee = [];
    $scope.selected = [];
    $scope.listStatus = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.isOrganization = false;
    $scope.isEditTicket = false;
    $scope.Id;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptionsPallet = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PalletsAndPackages/JTablePallet",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $scope.Id = 0;
                // d.code = $scope.modelJTable.code;
                // d.name = $scope.modelJTable.name;
                // d.parenid = $scope.modelJTable.parenid;
                // d.BeginTime = $scope.modelJTable.BeginTime;
                // d.EndTime = $scope.modelJTable.EndTime;
                d.Keyword = $scope.model.Keyword;
                d.Status = $scope.model.Status;
                d.MappingCode = $scope.model.MappingCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
            $compile(angular.element(row).contents())($scope);
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
                        $('#tblDataPallet').DataTable().$('tr.selected').removeClass('selected');
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

    vm.dtColumnsPallet = [];
    vm.dtColumnsPallet.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumnsPallet.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"STT" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumnsPallet.push(DTColumnBuilder.newColumn('PackCode').withOption('sClass', 'w300').withTitle('{{"PAP_PALLETANDPACKAGE_CODE_AND_TITLE" | translate}}').renderWith(function (data, type, full) {
        return `<b class="text-brown">${full.PackCode}</b>
        <br /><span class="text-primary fs10">- {{'Kiện hàng' | translate}}: ${full.PackName}</span>
        <br /><span class="text-primary fs10">- {{'Vị trí' | translate}}: ${full.CurrentPos}</span>
        <br /><span class="text-primary fs10">- {{'Đóng gói trong' | translate}}: ${full.Parent}</span>`;
    }));
    vm.dtColumnsPallet.push(DTColumnBuilder.newColumn('Specs').withOption('sClass', 'w100').withTitle('{{"PAP_PALLETANDPACKAGE_STANDARD" | translate}}').renderWith(function (data, type, full) {
        return data;
    }).withOption('sWidth', '300px'));
    vm.dtColumnsPallet.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'w100').withTitle('{{"SCP_TXT_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumnsPallet.push(DTColumnBuilder.newColumn('Type').withOption('sClass', 'w100').withTitle('{{"PAP_PALLETANDPACKAGE_PACK" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumnsPallet.push(DTColumnBuilder.newColumn('StatusReady').withOption('sClass', 'w100').withTitle('{{"PAP_PALLETANDPACKAGE_READYSTATE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumnsPallet.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w50').withTitle('{{"SCG_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Chỉnh sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }

    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 35;
    } else if ($window.innerWidth > 1400) {
        size = 25;
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            //windowClass: "modal-center",
            size: '70',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.edit = function (data) {
        console.log(data);
        dataservice.getItem(data, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstanceEdit = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    //windowClass: "modal-center",
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs;
                        }
                    }
                });
                modalInstanceEdit.result.then(function (d) {
                    $scope.reload();
                }, function () {
                });
            }
        })

    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deletePallet(id, function (rs) {
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
    function generateRandomArray(length, min, max) {
        var randomArray = [];
        for (var i = 0; i < length; i++) {
            var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            randomArray.push(randomNum);
        }
        return randomArray;
    }
    $scope.submit = function () {
        $scope.model.TicketCode = generateRandomArray(7, 1, 9).join('');
        console.log($scope.model);
        if (!$scope.isEditTicket) {
            dataservice.createTicket($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                }
            });
        } else {
            dataservice.updateTicketHeader($scope.idTicketHeader, $scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.TicketTitle = "";
                    $scope.model.Status = "";
                    $scope.model.TicketCreator = "";
                    $scope.model.TicketCreatedTime = "";
                    $scope.model.Loader = "";
                    $scope.model.LoaderTime = "";
                    $scope.model.Note = "";
                    $scope.reloadNoResetPage();
                }
            });
            $scope.isEditTicket = false;
        }
    };

    $scope.cancelEdit = function () {
        $scope.model.TicketTitle = "";
        $scope.model.Status = "";
        $scope.model.TicketCreator = "";
        $scope.model.TicketCreatedTime = "";
        $scope.model.Loader = "";
        $scope.model.LoaderTime = "";
        $scope.model.Note = "";
        $scope.isEditTicket = false;
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
        $("#BeginTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndTime').datepicker('setStartDate', maxDate);
        });
        $("#TicketCreateTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#LoaderTime').datepicker('setStartDate', maxDate);
        });
        $("#LoaderTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#TicketCreateTime').datepicker('setStartDate', maxDate);
        });
        $("#EndTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#BeginTime').datepicker('setEndDate', maxDate);
        });
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        PackCode: '',
        PackName: '',
        PackType: '',
        Specs: '',
        Noted: '',
        CurrentPos: '',
        Status: '',
        PackCodeParent: '',
        AttrPack: '',
        Level: '',
        NumPosition: '',
        StatusReady: '',
    }

    $scope.modelProperties = {
        Code: '',
        Name: '',
        Value: '',
        Unit: '',
    }

    $scope.listUnit = [];
    $scope.listStatusReady = [];

    $scope.initData = function () {
        dataservice.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getTicketCode(function (rs) {
            rs = rs.data;
            $scope.model.PackCode = rs;
        });
        dataservice.getListMapping(function (rs) {
            rs = rs.data;
            $scope.listMapping = rs;
        });
        dataservice.getListTypePacking(function (rs) {
            rs = rs.data;
            $scope.listTypePacking = rs;
        });
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getListPackage(function (rs) {
            rs = rs.data;
            $scope.listPackage = rs;
        });
        dataservice.getListStatusReady(function (rs) {
            rs = rs.data;
            $scope.listStatusReady = rs.Object;
        });
    }
    $scope.initData();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.tableProperties = [];

    $scope.isOrganization = false;

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('headerCallback', function (header) {
            $compile(angular.element(header).contents())($scope);
        })
        .withOption('data', $scope.tableProperties)
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
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
                        $('#tblDataAddPackage').DataTable().$('tr.selected').removeClass('selected');
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

    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withOption('sClass', '').withTitle('{{"PAP_PALLETANDPACKAGE_ATTRIBUTE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withOption('sClass', '').withTitle('{{"SCP_TXT_TITLE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withOption('sClass', 'text-center').withTitle('{{"SCP_LBL_VALUE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withOption('sClass', 'text-center').withTitle('{{"SCP_LBL_UNIT" | translate}}').renderWith(function (data, type) {
        var codeToFind = data; // Giá trị Code bạn muốn tìm

        var foundItem = $scope.listUnit.find(function (item) {
            return item.Code === codeToFind;
        });
        if (foundItem) {

            return foundItem.Name;
        } else {
            return data;
        }

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'text-center').withTitle('{{"SCG_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="deleteProperties(' + "'" + full.Code + "'" + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }

    function callback(json) {

    }

    $scope.addProperties = function () {
        // Sử dụng phương thức find để kiểm tra giá trị
        var foundItem = $scope.tableProperties.find(function (item) {
            return item.Code === $scope.modelProperties.Code;
        });

        if (foundItem) {
            // Giá trị đã tồn tại trong mảng
            console.log('Giá trị đã tồn tại trong mảng:', foundItem);
        } else {
            var newProperty = angular.copy($scope.modelProperties);
            $scope.tableProperties.push(newProperty);
            // Sử dụng reloadData để tải lại dữ liệu cho bảng
            $scope.reloadNoResetPage();
        }
    }

    $scope.deleteProperties = function (data) {
        $scope.tableProperties = $scope.tableProperties.filter(function (item) {
            return item.Code != data;
        });
        // Gọi lại DataTable để vẽ lại bảng với dữ liệu mới
        var table = $('#tblDataAddPackage').DataTable();
        table.clear().rows.add($scope.tableProperties).draw();
        // Sử dụng reloadData để tải lại dữ liệu cho bảng
        $scope.reloadNoResetPage();
    }

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.isEditTicketDetail = false;

    $scope.submit = function () {
        $scope.model.AttrPack = JSON.stringify($scope.tableProperties);
        dataservice.createPallet($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
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

    setTimeout(function () {

        $("#ReceivedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CheckingDate').datepicker('setStartDate', maxDate);
        });
        $("#CheckingDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ReceivedDate').datepicker('setEndDate', maxDate);
        });
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, para) {
    var vm = $scope;
    $scope.model = {
        Id: para.Pallet.Id,
        PackCode: para.Pallet.PackCode,
        PackName: para.Pallet.PackName,
        PackType: para.Pallet.PackType,
        Specs: para.Pallet.Specs,
        Noted: para.Pallet.Noted,
        CurrentPos: para.Pallet.CurrentPos,
        Status: para.Pallet.Status,
        PackCodeParent: para.Pallet.PackCodeParent,
        AttrPack: para.Pallet.AttrPack,
        Level: para.Pallet.Level,
        NumPosition: para.Pallet.NumPosition,
        StatusReady: para.Pallet.StatusReady,
    }

    $scope.modelProperties = {
        Code: '',
        Name: '',
        Value: '',
        Unit: '',
    }

    $scope.listUnit = para.ListUnit;
    $scope.tableProperties = [];
    $scope.listStatusReady = [];

    $scope.initData = function () {
        dataservice.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListMapping(function (rs) {
            rs = rs.data;
            $scope.listMapping = rs;
        });
        dataservice.getListTypePacking(function (rs) {
            rs = rs.data;
            $scope.listTypePacking = rs;
        });
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getListPackage(function (rs) {
            rs = rs.data;
            $scope.listPackage = rs;
        });
        dataservice.getListStatusReady(function (rs) {
            rs = rs.data;
            $scope.listStatusReady = rs.Object;
        });
        $scope.tableProperties = JSON.parse(para.Pallet.AttrPack)
        console.log(para);
        console.log(para.Pallet);
        console.log(para.ListUnit);
    }
    $scope.initData();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    function getListUnitPromise() {
        return new Promise(function (resolve, reject) {
            dataservice.getListUnit(function (response) {
                var data = response.data;
                resolve(data);
            });
        });
    }

    $scope.isOrganization = false;

    vm.dtOptionsEditPackage = DTOptionsBuilder.newOptions()
        .withOption('headerCallback', function (header) {
            $compile(angular.element(header).contents())($scope);
        })
        .withOption('data', $scope.tableProperties)
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            console.log(data)
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
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
                        $('#tblDataEditPackage').DataTable().$('tr.selected').removeClass('selected');
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
        });
    vm.dtColumnsEditPackage = [];

    vm.dtColumnsEditPackage.push(DTColumnBuilder.newColumn('Code').withOption('sClass', '').withTitle('{{"Mã thuộc tính" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumnsEditPackage.push(DTColumnBuilder.newColumn('Name').withOption('sClass', '').withTitle('{{"Tiêu đề" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsEditPackage.push(DTColumnBuilder.newColumn('Value').withOption('sClass', 'text-center').withTitle('{{"Giá" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsEditPackage.push(DTColumnBuilder.newColumn('Unit').withOption('sClass', 'text-center').withTitle('{{"Đơn vị tính" | translate}}').renderWith(function (data, type) {
        var codeToFind = data; // Giá trị Code bạn muốn tìm
        console.log($scope.listUnit);

        var foundItem = $scope.listUnit.find(function (item) {
            return item.Code === codeToFind;
        });

        if (foundItem) {
            return foundItem.Name;; // Sử dụng await để chờ promise hoàn thành và trả về giá trị đồng bộ
        } else {
            return data;
        }
    }));

    vm.dtColumnsEditPackage.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'text-center w20').withTitle('{{"Thao tác" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="deleteProperties(' + "'" + full.Code + "'" + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));

    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }

    function callback(json) {

    }

    $scope.addProperties = function () {
        console.log('click');
        // Sử dụng phương thức find để kiểm tra giá trị
        var foundItem = $scope.tableProperties.find(function (item) {
            return item.Code === $scope.modelProperties.Code;
        });

        if (foundItem) {
            // Giá trị đã tồn tại trong mảng
            console.log('Giá trị đã tồn tại trong mảng:', foundItem);
        } else {
            var newProperty = angular.copy($scope.modelProperties);
            $scope.tableProperties.push(newProperty);
            // Gọi lại DataTable để vẽ lại bảng với dữ liệu mới
            var table = $('#tblDataEditPackage').DataTable();
            table.clear().rows.add($scope.tableProperties).draw();
            $scope.reloadNoResetPage();
        }
    }

    $scope.deleteProperties = function (data) {
        $scope.tableProperties = $scope.tableProperties.filter(function (item) {
            return item.Code != data;
        });
        // Gọi lại DataTable để vẽ lại bảng với dữ liệu mới
        var table = $('#tblDataEditPackage').DataTable();
        table.clear().rows.add($scope.tableProperties).draw();
        // Sử dụng reloadData để tải lại dữ liệu cho bảng
        $scope.reloadNoResetPage();
    }

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.isEditTicketDetail = false;

    $scope.submit = function () {
        $scope.model.AttrPack = JSON.stringify($scope.tableProperties);
        console.log($scope.model);
        dataservice.updatePallet($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
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

    setTimeout(function () {
        $scope.tableProperties = JSON.parse(para.AttrPack)
        $("#ReceivedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CheckingDate').datepicker('setStartDate', maxDate);
        });
        $("#CheckingDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ReceivedDate').datepicker('setEndDate', maxDate);
        });
    }, 500);
});

app.controller('indexDetail', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        Status: '',
        Keyword: '',
        Creator: '',
    };

    $scope.initData = function () {
        dataservice.getListStatus(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getListEmployess(function (rs) {
            rs = rs.data;
            $scope.listEmployee = rs;
        });

        callback();
    }

    $scope.initData();
    $scope.listEmployee = [];
    $scope.selected = [];
    $scope.listStatus = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.isOrganization = false;
    $scope.isEditTicket = false;
    $scope.Id;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PalletsAndPackages/JTableHeader",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $scope.Id = 0;
                // d.code = $scope.modelJTable.code;
                // d.name = $scope.modelJTable.name;
                // d.parenid = $scope.modelJTable.parenid;
                // d.BeginTime = $scope.modelJTable.BeginTime;
                // d.EndTime = $scope.modelJTable.EndTime;
                d.Keyword = $scope.model.Keyword;
                d.Status = $scope.model.Status;
                d.Creator = $scope.model.Creator;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
            $compile(angular.element(row).contents())($scope);
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
                        $('#tblDataTicket').DataTable().$('tr.selected').removeClass('selected');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"STT" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketTitle').withOption('sClass', 'w300').withTitle('{{"SCP_COL_TITLE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatorName').withOption('sClass', 'w100').withTitle('{{"SCP_COL_CREATED_BY" | translate}}').renderWith(function (data, type, full) {
        return data;
    }).withOption('sWidth', '300px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketTimeCreator').withOption('sClass', 'w100').withTitle('{{"SCP_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PackagerName').withOption('sClass', 'w100').withTitle('{{"PAUP_IMPLEMENTER" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PackagerTime').withOption('sClass', 'w100').withTitle('{{"PAUP_DATE_IMPLEMENT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withOption('sClass', 'w100').withTitle('{{"SCP_TXT_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Noted').withOption('sClass', 'w200').withTitle('{{"SCP_LBL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    // vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCreatedTime').withOption('sClass', 'w100').withTitle('{{"Đóng gói" | translate}}').renderWith(function (data, type) {
    //     return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    // }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w100').withTitle('{{"SCG_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Chỉnh sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }

    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 35;
    } else if ($window.innerWidth > 1400) {
        size = 25;
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addDetail.html',
            controller: 'addDetail',
            backdrop: 'static',
            //windowClass: "modal-center",
            size: '70',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.edit = function (data) {
        dataservice.getItemHeader(data, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstanceEdit = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/editDetail.html',
                    controller: 'editDetail',
                    backdrop: 'static',
                    //windowClass: "modal-center",
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs;
                        }
                    }
                });
                modalInstanceEdit.result.then(function (d) {
                    $scope.reload();
                }, function () {
                });
            }
        })
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteHeader(id, function (rs) {
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
    function generateRandomArray(length, min, max) {
        var randomArray = [];
        for (var i = 0; i < length; i++) {
            var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            randomArray.push(randomNum);
        }
        return randomArray;
    }
    $scope.submit = function () {
        $scope.model.TicketCode = generateRandomArray(7, 1, 9).join('');
        console.log($scope.model);
        if (!$scope.isEditTicket) {
            dataservice.createTicket($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                }
            });
        } else {
            dataservice.updateTicketHeader($scope.idTicketHeader, $scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.TicketTitle = "";
                    $scope.model.Status = "";
                    $scope.model.TicketCreator = "";
                    $scope.model.TicketCreatedTime = "";
                    $scope.model.Loader = "";
                    $scope.model.LoaderTime = "";
                    $scope.model.Note = "";
                    $scope.reloadNoResetPage();
                }
            });
            $scope.isEditTicket = false;
        }
    };

    $scope.cancelEdit = function () {
        $scope.model.TicketTitle = "";
        $scope.model.Status = "";
        $scope.model.TicketCreator = "";
        $scope.model.TicketCreatedTime = "";
        $scope.model.Loader = "";
        $scope.model.LoaderTime = "";
        $scope.model.Note = "";
        $scope.isEditTicket = false;
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
        $("#BeginTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndTime').datepicker('setStartDate', maxDate);
        });
        $("#TicketCreateTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#LoaderTime').datepicker('setStartDate', maxDate);
        });
        $("#LoaderTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#TicketCreateTime').datepicker('setStartDate', maxDate);
        });
        $("#EndTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#BeginTime').datepicker('setEndDate', maxDate);
        });
    }, 200);
});

app.controller('addDetail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window) {
    var vm = $scope;
    $scope.modelHeader = {
        TicketCode: '',
        TicketTitle: '',
        TicketCreator: '',
        TicketTimeCreator: '',
        Packager: '',
        PackagerTime: '',
        Status: '',
        Noted: '',
    }

    $scope.modelProperties = {
        Code: '',
        Name: '',
        Value: '',
        Unit: '',
    }

    $scope.listUnit = [];
    $scope.listEmployee = [];
    $scope.listProduct = [];
    $scope.listProperties = [];

    $scope.initData = function () {
        dataservice.getStatusHeader(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getListPackage(function (rs) {
            rs = rs.data;
            $scope.listPackage = rs;
        });
        dataservice.getListEmployess(function (rs) {
            rs = rs.data;
            $scope.listEmployee = rs;
        });
    }
    $scope.initData();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.tableProperties = [];

    $scope.isOrganization = false;


    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }

    function callback(json) {

    }

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.isEditTicketDetail = false;

    $scope.submit = function () {
        console.log($scope.model)
        dataservice.createHeader($scope.modelHeader, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
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

    setTimeout(function () {
        $("#TicketCreateTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExecuteTime').datepicker('setStartDate', maxDate);
        });
        $("#ExecuteTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#TicketCreateTime').datepicker('setStartDate', maxDate);
        });
        $("#ReceivedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CheckingDate').datepicker('setStartDate', maxDate);
        });
        $("#CheckingDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ReceivedDate').datepicker('setEndDate', maxDate);
        });
    }, 200);
});

app.controller('editDetail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, para, value) {
    var vm = $scope;
    $scope.modelHeader = {
        Id: para.Id,
        TicketCode: para.TicketCode,
        TicketTitle: para.TicketTitle,
        TicketCreator: para.TicketCreator,
        TicketTimeCreator: $filter('date')(new Date(para.TicketTimeCreator), 'dd/MM/yyyy'),
        Packager: para.Packager,
        PackagerTime: $filter('date')(new Date(para.PackagerTime), 'dd/MM/yyyy'),
        Status: para.Status,
        Noted: para.Noted,
    }

    $scope.modelDetail = {
        TicketCode: para.TicketCode,
        ProductCode: '',
        IdImpProduct: 0,
        ProductNumRange: '',
        GattrCode: '',
        IsInStock: false,
        Weight: 0,
        PackCode: '',
        StatusReady: '',
        UUID: generateUUID(),
    }

    $rootScope.headingAdd = "PAUP_ADDNEW_ITEM";
    $rootScope.headingUpdate = "PAUP_EDIT_ITEM";
    $scope.chooseAdd = function () {
        $scope.updateDetail();
        value.setTicketCode(para.TicketCode)
        $rootScope.$broadcast('tabAddProduct');
    }
    $scope.chooseUpdate = function () {
        $scope.updateDetail();
        value.setTicketCode(para.TicketCode)
        $rootScope.$broadcast('tabEditProduct');
    }

    $scope.InStock = false;
    $scope.IsUpdate = false;

    $scope.updateDetail = function () {
        $scope.IsUpdate = !$scope.IsUpdate;
        value.setIsUpdate($scope.IsUpdate);
        $scope.isReadOnly = !$scope.IsUpdate;
        value.setIsReadOnly($scope.isReadOnly);
        if (!$scope.IsUpdate) {
            $scope.modelDetail.PackCode = '';
            $scope.modelDetail.IdImpProduct = 0;
            $scope.modelDetail.ProductNumRange = '';
            $scope.modelDetail.GattrCode = '';
            $scope.modelDetail.Measure = 0;
            $scope.modelDetail.ProductCode = '';
            $scope.modelDetail.StatusReady = '';
        }
    }

    $scope.changePack = function () {
        if ($scope.IsUpdate) {
            $scope.reloadNoResetPage();
        }
        var foundItem = $scope.listPackage.find(function (item) {
            return item.Code === $scope.modelDetail.PackCode;
        });
        if (foundItem) {
            $scope.modelDetail.StatusReady = foundItem.StatusReady;
        }

    }

    $scope.changeProduct = function (code) {
        if ($scope.InStock) {
            var foundItem = $scope.listProduct.find(function (item) {
                return item.Code === code;
            });
            $scope.modelDetail.IdImpProduct = foundItem.IdImpProduct;
        } else {
            $scope.modelDetail.IdImpProduct = 0;
        }
        dataservice.getInfoProduct(code, function (rs) {
            rs = rs.data;
            $scope.modelDetail.Measure = rs.Weight == null ? 0 : rs.Weight;
        });
    }

    $scope.changeListProduct = function () {
        $scope.InStock = !$scope.InStock;
        value.setInStock($scope.InStock);
        $scope.modelDetail.IsInStock = $scope.InStock;
    };

    $scope.modelProperties = {
        Code: '',
        Name: '',
        Value: '',
        Unit: '',
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    $scope.listUnit = [];
    $scope.listEmployee = [];
    $scope.listStatusReady = [];

    $scope.initData = function () {
        dataservice.getStatusHeader(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
        dataservice.getListPackage(function (rs) {
            rs = rs.data;
            $scope.listPackage = rs;
        });
        dataservice.getListEmployess(function (rs) {
            rs = rs.data;
            $scope.listEmployee = rs;
        });
        dataservice.getListProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
        dataservice.getListProperties(function (rs) {
            rs = rs.data;
            $scope.listProperties = rs.Object;
        });
        dataservice.getListStatusReady(function (rs) {
            rs = rs.data;
            $scope.listStatusReady = rs.Object;
        });
        $rootScope.tab = 'DETAIL';
    }
    $scope.initData();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.tableProperties = [];

    $scope.isOrganization = false;
    $scope.isReadOnly = true;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PalletsAndPackages/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $scope.Id = 0;
                d.TicketCode = $scope.modelHeader.TicketCode;
                d.PackCode = $scope.modelDetail.PackCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
            $compile(angular.element(row).contents())($scope);
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
                        $('#tblDataPallet').DataTable().$('tr.selected').removeClass('selected');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"STT" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withOption('sClass', 'w300').withTitle('{{"Tên sản phẩm" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductNumRange').withOption('sClass', 'w100').withTitle('{{"Dãy" | translate}}').renderWith(function (data, type, full) {
        return data;
    }).withOption('sWidth', '300px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('IdImpProduct').withOption('sClass', 'w100').withTitle('{{"Mã phiếu" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'w100').withTitle('{{"Trạng thái" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeProperties').withOption('sClass', 'w100').withTitle('{{"Thuộc tính" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w100').withTitle('{{"Thao tác" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Chỉnh sửa" ng-click="editDetail(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="Xoá" ng-click="deleteDetail(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
        dataservice.getListPackage(function (rs) {
            rs = rs.data;
            $scope.listPackage = rs;
        });
    }

    function callback(json) {

    }

    $scope.addDetail = function () {
        dataservice.createDetail($scope.modelDetail, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.modelDetail.PackCode = '';
                $scope.reloadNoResetPage();
            }
        });
    }

    $scope.deleteProperties = function (data) {
        console.log(data)
        $scope.tableProperties = $scope.tableProperties.filter(function (item) {
            return item.Code != data;
        });
        console.log($scope.tableProperties)
    }

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.editDetail = function (data) {
        $scope.IsUpdate = true;
        $scope.isReadOnly = false;
        dataservice.getItemDetail(data, function (rs) {
            rs = rs.data;
            $scope.modelDetail.Id = data
            $scope.modelDetail.ProductCode = rs.ProductCode
            $scope.modelDetail.IdImpProduct = rs.IdImpProduct
            $scope.modelDetail.ProductNumRange = rs.ProductNumRange
            $scope.modelDetail.GattrCode = rs.GattrCode
            $scope.modelDetail.Measure = rs.Measure
            $scope.modelDetail.PackCode = rs.PackCode
        });
    }

    $scope.deleteDetail = function (data) {
        if ($scope.IsUpdate) {
            dataservice.deleteDetail(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                }
            });
        } else {
            dataservice.deleteAllDetail(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                }
            });
        }
    }

    $scope.saveDetail = function () {
        dataservice.updateDetail($scope.modelDetail, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.reloadNoResetPage();
            }
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.isEditTicketDetail = false;

    $scope.submit = function () {
        console.log($scope.model)
        dataservice.updateHeader($scope.modelHeader, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
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

    setTimeout(function () {
        $("#TicketCreateTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExecuteTime').datepicker('setStartDate', maxDate);
        });
        $("#ExecuteTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#TicketCreateTime').datepicker('setStartDate', maxDate);
        });
        $("#ReceivedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CheckingDate').datepicker('setStartDate', maxDate);
        });
        $("#CheckingDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ReceivedDate').datepicker('setEndDate', maxDate);
        });
    }, 200);
});

app.controller('addProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, value) {
    var vm = $scope;
    $scope.modelDetail = {
        TicketCode: value.getTicketCode(),
        ProductCode: '',
        IdImpProduct: 0,
        ProductNumRange: '',
        GattrCode: '',
        IsInStock: false,
        Weight: 0,
        PackCode: '',
        StatusReady: '',
        UUID: generateUUID(),
    }
    $scope.InStock = value.getInStock();

    // Đặt một $watch để theo dõi sự thay đổi của biến InStock
    $scope.$watch(function () {
        return value.getInStock();
    }, function (newVal) {
        $scope.InStock = newVal;
        $scope.modelDetail.IsInStock = $scope.InStock;
        $scope.initData();
    });

    $scope.IsUpdate = false;

    $scope.changePack = function () {
        if ($scope.IsUpdate) {
            $scope.reloadNoResetPage();
        }
        var foundItem = $scope.listPackage.find(function (item) {
            return item.Code === $scope.modelDetail.PackCode;
        });
        if (foundItem) {
            $scope.modelDetail.StatusReady = foundItem.StatusReady;
        }

    }

    $scope.changeProduct = function (code) {
        if ($scope.InStock) {
            var foundItem = $scope.listProduct.find(function (item) {
                return item.Code === code;
            });
            $scope.modelDetail.IdImpProduct = foundItem.IdImpProduct;
        } else {
            $scope.modelDetail.IdImpProduct = 0;
        }
        dataservice.getInfoProduct(code, function (rs) {
            rs = rs.data;
            $scope.modelDetail.Measure = rs.Weight == null ? 0 : rs.Weight;
        });
    }

    $scope.modelProperties = {
        Code: '',
        Name: '',
        Value: '',
        Unit: '',
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    $scope.listStatusReady = [];

    $scope.initData = function () {
        dataservice.getListPackage(function (rs) {
            rs = rs.data;
            $scope.listPackage = rs;
        });
        dataservice.getListProperties(function (rs) {
            rs = rs.data;
            $scope.listProperties = rs.Object;
        });
        dataservice.getListStatusReady(function (rs) {
            rs = rs.data;
            $scope.listStatusReady = rs.Object;
        });
        if ($scope.InStock) {
            dataservice.getListProductInStock(function (rs) {
                rs = rs.data;
                $scope.listProduct = rs;
            });
        } else {
            dataservice.getListProduct(function (rs) {
                rs = rs.data;
                $scope.listProduct = rs;
            });
        }
        $scope.isReadOnly = !$scope.IsUpdate;
    }
    $scope.initData();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.tableProperties = [];

    $scope.isOrganization = false;
    $scope.isReadOnly = true;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PalletsAndPackages/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $scope.Id = 0;
                d.TicketCode = $scope.modelHeader.TicketCode;
                d.PackCode = "";
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
            $compile(angular.element(row).contents())($scope);
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
                        $('#tblDataAddProduct').DataTable().$('tr.selected').removeClass('selected');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"STT" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withOption('sClass', 'w300').withTitle('{{"PAUP_PALLETANDPACKAGE_PRODUCT_MATERIAL" | translate}}').renderWith(function (data, type, full) {
        return `<b class="text-brown">${full.ProductName}</b>
        <br /><span class="text-primary fs10">- {{'Mã SP:' | translate}}: ${full.ProductCode}</span>`;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackName').withOption('sClass', 'w100').withTitle('{{"PAUP_PALLETANDPACKAGE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductNumRange').withOption('sClass', 'w100').withTitle('{{"Dãy" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('IdImpProduct').withOption('sClass', 'w100').withTitle('{{"PAUP_ITEM_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'w100').withTitle('{{"SCP_TXT_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeProperties').withOption('sClass', 'w100').withTitle('{{"Thuộc tính" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'text-center').withTitle('{{"SCG_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="deleteDetail(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
        dataservice.getListPackage(function (rs) {
            rs = rs.data;
            $scope.listPackage = rs;
        });
    }

    $scope.addDetail = function () {
        dataservice.createDetail($scope.modelDetail, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.modelDetail.PackCode = '';
                $scope.reloadNoResetPage();
            }
        });
    }

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.deleteDetail = function (data) {
        if ($scope.IsUpdate) {
            dataservice.deleteDetail(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                }
            });
        } else {
            dataservice.deleteAllDetail(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                }
            });
        }
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

    $scope.$on('tabAddProduct', function () {
        $scope.reloadNoResetPage();
    });

    setTimeout(function () {
        $("#TicketCreateTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExecuteTime').datepicker('setStartDate', maxDate);
        });
        $("#ExecuteTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#TicketCreateTime').datepicker('setStartDate', maxDate);
        });
        $("#ReceivedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CheckingDate').datepicker('setStartDate', maxDate);
        });
        $("#CheckingDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ReceivedDate').datepicker('setEndDate', maxDate);
        });
        $scope.reloadNoResetPage();
    }, 200);
});

app.controller('editProduct', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, value) {
    var vm = $scope;

    $scope.modelDetail = {
        TicketCode: value.getTicketCode(),
        ProductCode: '',
        IdImpProduct: 0,
        ProductNumRange: '',
        GattrCode: '',
        IsInStock: false,
        Measure: 0,
        PackCode: '',
        StatusReady: '',
        UUID: generateUUID(),
    }

    $scope.InStock = value.getInStock();

    // Đặt một $watch để theo dõi sự thay đổi của biến InStock
    $scope.$watch(function () {
        return value.getInStock();
    }, function (newVal) {
        $scope.InStock = newVal;
        $scope.modelDetail.IsInStock = $scope.InStock;
        $scope.initData();
    });

    $scope.IsUpdate = true;

    $scope.changePack = function () {
        if ($scope.IsUpdate) {
            $scope.reloadNoResetPage();
        }
        var foundItem = $scope.listPackage.find(function (item) {
            return item.Code === $scope.modelDetail.PackCode;
        });
        if (foundItem) {
            $scope.modelDetail.StatusReady = foundItem.StatusReady;
        }

    }

    $scope.changeProduct = function (code) {
        if ($scope.InStock) {
            var foundItem = $scope.listProduct.find(function (item) {
                return item.Code === code;
            });
            $scope.modelDetail.IdImpProduct = foundItem.IdImpProduct;
        } else {
            $scope.modelDetail.IdImpProduct = 0;
        }
        dataservice.getInfoProduct(code, function (rs) {
            rs = rs.data;
            $scope.modelDetail.Measure = rs.Weight == null ? 0 : rs.Weight;
        });
    }

    $scope.modelProperties = {
        Code: '',
        Name: '',
        Value: '',
        Unit: '',
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    $scope.listUnit = [];
    $scope.listEmployee = [];
    $scope.listStatusReady = [];

    $scope.initData = function () {
        dataservice.getListPackage(function (rs) {
            rs = rs.data;
            $scope.listPackage = rs;
        });
        dataservice.getListProperties(function (rs) {
            rs = rs.data;
            $scope.listProperties = rs.Object;
        });
        dataservice.getListStatusReady(function (rs) {
            rs = rs.data;
            $scope.listStatusReady = rs.Object;
        });
        if ($scope.InStock) {
            dataservice.getListProductInStock(function (rs) {
                rs = rs.data;
                $scope.listProduct = rs;
            });
        } else {
            dataservice.getListProduct(function (rs) {
                rs = rs.data;
                $scope.listProduct = rs;
            });
        }
        $scope.isReadOnly = !$scope.IsUpdate;
    }
    $scope.initData();

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.tableProperties = [];

    $scope.isOrganization = false;
    $scope.isReadOnly = true;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PalletsAndPackages/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                $scope.Id = 0;
                d.TicketCode = $scope.modelHeader.TicketCode;
                d.PackCode = $scope.modelDetail.PackCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
            $compile(angular.element(row).contents())($scope);
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
                        $('#tblDataEditProduct').DataTable().$('tr.selected').removeClass('selected');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sClass', 'hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"STT" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withOption('sClass', 'w300').withTitle('{{"Tên sản phẩm" | translate}}').renderWith(function (data, type, full) {
        return `<b class="text-brown">${full.ProductName}</b>
        <br /><span class="text-primary fs10">- {{'Mã SP:' | translate}}: ${full.ProductCode}</span>`;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PackName').withOption('sClass', 'w100').withTitle('{{"PAUP_PALLETANDPACKAGE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ProductNumRange').withOption('sClass', 'w100').withTitle('{{"Dãy" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('IdImpProduct').withOption('sClass', 'w100').withTitle('{{"Mã phiếu" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'w100').withTitle('{{"Trạng thái" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeProperties').withOption('sClass', 'w100').withTitle('{{"Thuộc tính" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'text-center').withTitle('{{"Thao tác" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Chỉnh sửa" ng-click="editDetail(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="Xoá" ng-click="deleteDetail(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
        dataservice.getListPackage(function (rs) {
            rs = rs.data;
            $scope.listPackage = rs;
        });
    }

    $scope.addDetail = function () {
        dataservice.createDetail($scope.modelDetail, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.modelDetail.PackCode = '';
                $scope.reloadNoResetPage();
            }
        });
    }

    $scope.deleteProperties = function (data) {
        console.log(data)
        $scope.tableProperties = $scope.tableProperties.filter(function (item) {
            return item.Code != data;
        });
        console.log($scope.tableProperties)
    }

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.editDetail = function (data) {
        dataservice.getItemDetail(data, function (rs) {
            rs = rs.data;
            $scope.modelDetail.Id = data
            $scope.modelDetail.ProductCode = rs.ProductCode
            $scope.modelDetail.IdImpProduct = rs.IdImpProduct
            $scope.modelDetail.ProductNumRange = rs.ProductNumRange
            $scope.modelDetail.GattrCode = rs.GattrCode
            $scope.modelDetail.Measure = rs.Measure
            $scope.modelDetail.PackCode = rs.PackCode
        });
    }

    $scope.deleteDetail = function (data) {
        if ($scope.IsUpdate) {
            dataservice.deleteDetail(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                }
            });
        } else {
            dataservice.deleteAllDetail(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                }
            });
        }
    }

    $scope.saveDetail = function () {
        dataservice.updatePackageTicketDt($scope.modelDetail, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.reloadNoResetPage();
            }
        });
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

    $scope.$on('tabEditProduct', function () {
        $scope.reloadNoResetPage();
    });

    setTimeout(function () {
        $("#TicketCreateTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ExecuteTime').datepicker('setStartDate', maxDate);
        });
        $("#ExecuteTime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#TicketCreateTime').datepicker('setStartDate', maxDate);
        });
        $("#ReceivedDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CheckingDate').datepicker('setStartDate', maxDate);
        });
        $("#CheckingDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ReceivedDate').datepicker('setEndDate', maxDate);
        });
    }, 200);
});