var ctxfolder = "/views/admin/cylinderFuelLoading";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
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
            $http.post('/Admin/CylinderFuelLoading/GetListBottle').then(callback);
        },
        getListStaticTank: function (callback) {
            $http.post('/Admin/CylinderFuelLoading/GetListStaticTank').then(callback);
        },
        GetWeigth: function (pc, callback) {
            $http.post('/Admin/CylinderFuelLoading/GetWeigth?product=' + pc).then(callback);
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
        getInfoProduct: function (data, data1, callback) {
            $http.get('/Admin/ProductImport/GetInfoProduct?product=' + data + '&ticket=' + data1).then(callback);
        },
        // Bottle and Tank
        getListProductInStockCylinker: function (data, data1, data2, data3, callback) {
            $http.post('/Admin/CylinderFuelLoading/GetListProductInStockCylinker?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2 + '&group=' + data3).then(callback);
        },
        // Group Type
        getAllType: function (callback) {
            $http.post('/Admin/ProductImport/GetProductGroupTypes').then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, $cookies, $translate, dataservice) {
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
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
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


app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        TicketCode: '',
        TicketTitle: '',
        TicketCreator: '',
        TicketCreatedTime: '',
        Loader: '',
        LoaderTime: '',
        Status: '',
        Note: '',
        CurrentPageView: 2,
        Length: 9
    };
    $scope.modelJTable = {
        Status: '',
        BeginTime: '',
        EndTime: '',
        IsPlan: '',
        CatParent: '',
        OrganizationCode: '',
        ObjectCode: '',
        PaymentStatus: '',
    };
    $scope.listPaymentStatus = [
        { Code: '', Name: 'Tất cả' },
        {
            Code: "PAID",
            Name: "Đã thanh toán"
        },
        {
            Code: "NOT_PAID",
            Name: "Chưa thanh toán"
        },
    ];

    $scope.initData = function () {
        dataservice.getListEmployess(function (rs) {
            rs = rs.data;
            $scope.listEmployee = rs;
        });
        dataservice.getStatusOrder(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
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
            url: "/Admin/CylinderFuelLoading/Jtable",
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
                d.code = $scope.modelJTable.code;
                d.name = $scope.modelJTable.name;
                d.parenid = $scope.modelJTable.parenid;
                d.BeginTime = $scope.modelJTable.BeginTime;
                d.EndTime = $scope.modelJTable.EndTime;
                d.CatCode = $scope.modelJTable.CatParent;
                d.ObjectCode = $scope.modelJTable.ObjectCode;
                d.PaymentStatus = $scope.modelJTable.PaymentStatus;
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
                        $('#tblDataHeader').DataTable().$('tr.selected').removeClass('selected');
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

    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketTitle').withOption('sClass', 'w400').withTitle('{{"COM_ITEM_VALIDATE_TITLE" | translate}}').renderWith(function (data, type) {

        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'w100').withTitle('{{"COM_CFL_STATUS" | translate}}').renderWith(function (data, type, full) {
        return data;
    }).withOption('sWidth', '300px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCreator').withOption('sClass', 'w100').withTitle('{{"COM_CFL_VOTE_MAKER" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCreatedTime').withOption('sClass', 'w100').withTitle('{{"COM_CFL_DATE_VOTE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Loader').withOption('sClass', 'w100').withTitle('{{"COM_CFL_IMPLEMENTER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LoaderTime').withOption('sClass', 'w100').withTitle('{{"COM_CFL_EXECUTION_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withOption('sClass', 'w250').withTitle('{{"COM_CRUMB_WF_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w150').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return `<a title="Thêm" ng-click="add('${full.TicketCode}')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="color: green;" class="fa-solid fa-plus fs25"></i></a>
            <a title="Chỉnh sửa" ng-click="edit(${full.Id})" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>
            <a title="Xoá" ng-click="delete(${full.Id})" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>`;
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
    };

    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 35;
    } else if ($window.innerWidth > 1400) {
        size = 25;
    }
    $scope.add = function (data) {
        console.log(data);
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            //windowClass: "modal-center",
            size: '70',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.edit = function (data) {
        $scope.isEditTicket = true;
        dataservice.getDetailTicketByID(data, function (rs) {
            rs = rs.data;
            $scope.model.TicketTitle = rs.TicketTitle;
            $scope.model.Status = rs.Status;
            $scope.model.TicketCreator = rs.TicketCreator;
            $scope.model.TicketCreatedTime = $filter('date')(new Date(rs.TicketCreatedTime), 'dd/MM/yyyy');
            $scope.model.Loader = rs.Loader;
            $scope.model.LoaderTime = $filter('date')(new Date(rs.LoaderTime), 'dd/MM/yyyy');
            $scope.model.Note = rs.Note;
        })
        $scope.idTicketHeader = data;
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteTicketHeader(id, function (rs) {
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.TicketTitle == "" || data.TicketTitle == null || data.TicketTitle == undefined) {
            $scope.errorTicketTitle = true;
            mess.Status = true;
        } else {
            $scope.errorTicketTitle = false;
        }

        if (data.TicketCreator == "" || data.TicketCreator == null || data.TicketCreator == undefined) {
            $scope.errorTicketCreator = true;
            mess.Status = true;
        } else {
            $scope.errorTicketCreator = false;
        }

        if (data.TicketCreatedTime == "" || data.TicketCreatedTime == null || data.TicketCreatedTime == undefined) {
            $scope.errorTicketCreatedTime = true;
            mess.Status = true;
        } else {
            $scope.errorTicketCreatedTime = false;
        }

        if (data.Loader == "" || data.Loader == null || data.Loader == undefined) {
            $scope.errorLoader = true;
            mess.Status = true;
        } else {
            $scope.errorLoader = false;
        }

        if (data.LoaderTime == "" || data.LoaderTime == null || data.LoaderTime == undefined) {
            $scope.errorLoaderTime = true;
            mess.Status = true;
        } else {
            $scope.errorLoaderTime = false;
        }

        if (data.Status == "" || data.Status == null || data.Status == undefined) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }

        return mess
    }


    $scope.submit = function () {
        if (!validationSelect($scope.model).Status) {
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
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, para) {
    var vm = $scope;
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.TankCode == "" || data.TankCode == null || data.TankCode == undefined) {
            $scope.errorTankCode = true;
            mess.Status = true;
        } else {
            $scope.errorTankCode = false;
        }

        if (data.CylinkerCode == "" || data.CylinkerCode == null || data.CylinkerCode == undefined) {
            $scope.errorCylinkerCode = true;
            mess.Status = true;
        }
        else if ($scope.bottleFuelCode && $scope.tankFuelCode && $scope.tankFuelCode !== $scope.bottleFuelCode) {
            // $scope.errorCylinkerCode = true;
            mess.Status = true;
            App.toastrError(`Không được nạp ${$scope.tankFuelName} từ bồn vào bình chứa ${$scope.bottleFuelName}`);
        } else {
            $scope.errorCylinkerCode = false;
        }


        if (data.Volume == null || data.Volume == undefined || data.Volume == 0) {
            $scope.errorVolume = true;
            mess.Status = true;
            $scope.validVolume = "Khối lượng không được để trống và phải lớn hơn 0"
        } else {
            if (data.Volume > $scope.Total2) {
                $scope.errorVolume = true;
                mess.Status = true;
                $scope.validVolume = "Khối lượng không được lớn hơn trọng lượng còn lại của bồn"
            }
            // else {
            //     $scope.errorVolume = false;
            // }
            else if (data.Volume > $scope.Total) {
                $scope.errorVolume = true;
                mess.Status = true;
                $scope.validVolume = "Khối lượng không được lớn hơn trọng lượng bình"
            }
            else {
                $scope.errorVolume = false;
            }
        }

        if (data.Unit == "" || data.Unit == null || data.Unit == undefined) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }

        console.log($scope.min);
        return mess
    }
    $scope.changeCL = function (item) {
        $scope.weight = item.MaxWeight;
        $scope.Total = item.MaxWeight - item.CurrentWeight;
        dataservice.getInfoProduct(item.Code, '', function (rs) {
            rs = rs.data;
            $scope.weightUnit = rs.UnitWeight;
        });
        $scope.bottleFuelCode = item.FuelCode;
        $scope.bottleFuelName = item.FuelName;
        $scope.errorVolume = false;
        $scope.errorCylinkerCode = false;
    }
    $scope.changeTank = function (item) {
        $scope.weight2 = item.MaxWeight == null ? 0 : item.MaxWeight;
        $scope.Total2 = item.CurrentWeight == null ? 0 : item.CurrentWeight;
        $scope.errorTankCode = false;
        dataservice.getInfoProduct(item.Code, '', function (rs) {
            rs = rs.data;
            $scope.weightUnit2 = rs.UnitWeight;
        });
        $scope.tankFuelCode = item.FuelCode;
        $scope.tankFuelName = item.FuelName;
    }
    $scope.model = {
        TicketCode: para,
        TankCode: '',
        CylinkerCode: '',
        Volume: 0,
        Unit: '',
    }

    $scope.listUnit = [];
    $scope.listStandard = [];
    $scope.listStaticTank = [];
    $scope.listBottle = [];
    $rootScope.pageTank = 1;
    $rootScope.pageSizeTank = 25;
    $rootScope.codeSearchTank = '';
    $rootScope.pageBottle = 1;
    $rootScope.pageSizeBottle = 25;
    $rootScope.codeSearchBottle = '';


    $scope.initData = function () {
        // dataservice.getAllType(function (rs) {
        //     rs = rs.data;
        //     $scope.Types = rs;
        // });
        dataservice.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });

        $rootScope.loadMoreTank = function ($select, $event) {
            if (!$event) {
                $rootScope.pageTank = 1;
                $scope.listStaticTank = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.pageTank++;
            }
            dataservice.getListProductInStockCylinker($rootScope.pageTank, $rootScope.pageSizeTank, $rootScope.codeSearchTank, 'STATIC_TANK', function (rs) {
                rs = rs.data;
                $scope.listStaticTank = $scope.listStaticTank.concat(rs);
                $scope.listStaticTank = removeDuplicate($scope.listStaticTank);
            });
        }

        $rootScope.loadMoreBottle = function ($select, $event) {
            if (!$event) {
                $rootScope.pageBottle = 1;
                $scope.listBottle = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.pageBottle++;
            }
            dataservice.getListProductInStockCylinker($rootScope.pageBottle, $rootScope.pageSizeBottle, $rootScope.codeSearchBottle, 'BOTTLE', function (rs) {
                rs = rs.data;
                $scope.listBottle = $scope.listBottle.concat(rs);
                $scope.listBottle = removeDuplicate($scope.listBottle);
            });
        }
    }
    $scope.initData();

    $scope.listQcTicketCode = [];
    $scope.listProdCodeLst = [];
    $scope.listSupplierCode = [];
    $scope.listFacilitySpect = [];
    $scope.listResults = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.Id;

    $scope.isOrganization = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CylinderFuelLoading/JTableDetail",
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
                d.TicketCode = para;
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
                        $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
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
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"STT" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TankName').withOption('sClass', 'w400').withTitle('{{"COM_CFL_TANK" | translate}}').renderWith(function (data, type, full) {
        return `${data}
        <br>${full.TankCode}`;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CylinkerName').withOption('sClass', 'w400').withTitle('{{"COM_CFL_JAR" | translate}}').renderWith(function (data, type, full) {
        return `${data}
        <br>${full.CylinkerCode}`;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Volume').withOption('sClass', 'w100').withTitle('{{"COM_CFL_MASS" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withOption('sClass', 'w100').withTitle('{{"COM_CFL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w100').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Chỉnh sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));
    vm.dtInstance = {};
    $scope.listProduct = [];

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

    $scope.edit = function (data) {
        $scope.isEditTicketDetail = true;
        dataservice.getTicketDetailById(data, function (rs) {
            rs = rs.data;
            $scope.model.TankCode = rs.TankCode;
            $scope.model.CylinkerCode = rs.CylinkerCode;
            $scope.model.Volume = rs.Volume;
            $scope.model.Unit = rs.Unit;
        })
        $scope.idTicketDetail = data;
    }

    $scope.submit = function () {
        if (!validationSelect($scope.model).Status) {
            if (!$scope.isEditTicketDetail) {
                dataservice.createTicketDetail($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.Total += 40;
                        $scope.reloadNoResetPage();
                    }
                });
            } else {
                dataservice.updateTicketDetail($scope.idTicketDetail, $scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.model.TankCode = "";
                        $scope.model.CylinkerCode = "";
                        $scope.model.Volume = "";
                        $scope.model.Unit = "";
                        $scope.reloadNoResetPage();
                    }
                });
                $scope.isEditTicketDetail = false;
            }
        }
    }

    $scope.cancelEdit = function () {
        $scope.model.TankCode = "";
        $scope.model.CylinkerCode = "";
        $scope.model.Volume = "";
        $scope.model.Unit = "";
        $scope.isEditTicketDetail = false;
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteTicketDetail(id, function (rs) {
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

    // reload data search
    $rootScope.reloadProductTank = function (input) {
        $rootScope.codeSearchTank = input;
        $rootScope.pageTank = 1;
        $scope.listStaticTank = [];
        dataservice.getListProductInStockCylinker($rootScope.pageTank, $rootScope.pageSizeTank, $rootScope.codeSearchTank, 'STATIC_TANK', function (rs) {
            rs = rs.data;
            $scope.listStaticTank = $scope.listStaticTank.concat(rs);
            $scope.listStaticTank = removeDuplicate($scope.listStaticTank);
        });
    }
    $rootScope.reloadProductBottle = function (input) {
        $rootScope.codeSearchBottle = input;
        $rootScope.pageBottle = 1;
        $scope.listBottle = [];
        dataservice.getListProductInStockCylinker($rootScope.pageBottle, $rootScope.pageSizeBottle, $rootScope.codeSearchBottle, 'BOTTLE', function (rs) {
            rs = rs.data;
            $scope.listBottle = $scope.listBottle.concat(rs);
            $scope.listBottle = removeDuplicate($scope.listBottle);
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

    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].Id == itm.Id) {
                    isDuplicate = true;
                    break;
                }
                //if (res[i].Id == itm.Id) {
                //    isDuplicate = true;
                //    break;
                //}
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
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