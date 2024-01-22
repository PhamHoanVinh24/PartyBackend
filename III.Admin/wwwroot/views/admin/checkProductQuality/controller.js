var ctxfolder = "/views/admin/checkProductQuality";
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
        //header
        createTicket: function (data, callback) {
            $http.post('/Admin/CheckProductQuality/CreateTicket', data, callback).then(callback);
        },
        getTicket: function (data, callback) {
            $http.post('/Admin/CheckProductQuality/GetTicket/' + data).then(callback);
        },
        updateTicket: function (id, data, callback) {
            $http.post('/Admin/CheckProductQuality/UpdateTicket/' + id, data, callback).then(callback);
        },
        deleteTicket: function (data, callback) {
            $http.post('/Admin/CheckProductQuality/DeleteTicket/' + data).then(callback);
        },

        //get list
        getStatusOrder: function (callback) {
            $http.post('/Admin/CheckProductQuality/GetStatusOrder').then(callback);
        },
        getListEmployess: function (callback) {
            $http.post('/Admin/CheckProductQuality/GetListEmployess').then(callback);
        },
        getListProduct: function (callback) {
            $http.post('/Admin/ProductImport/GetListProduct').then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/CheckProductQuality/GetListUnit').then(callback);
        },
        getListStandard: function (callback) {
            $http.post('/Admin/CheckProductQuality/GetListStandard').then(callback);
        },
        getListAttr: function (callback) {
            $http.post('/Admin/CheckProductQuality/GetListAttr').then(callback);
        },

        //detail
        createDetailTicket: function (data, callback) {
            $http.post('/Admin/CheckProductQuality/CreateDetailTicket', data, callback).then(callback);
        },
        getServiceUser: function (callback) {
            $http.post('/Admin/ServiceRegist/GetServiceUser').then(callback);
        },
        getServiceEmployee: function (callback) {
            $http.post('/Admin/ServiceRegist/GetServiceEmployee').then(callback);
        },
        getServiceCategory: function (callback) {
            $http.post('/Admin/ServiceRegist/GetServiceCategory').then(callback);
        },
        getDetailTicketByID: function (data, callback) {
            $http.post('/Admin/CheckProductQuality/GetDetailTicket/' + data).then(callback);
        },
        updateDetailTicket: function (id, data, callback) {
            $http.post('/Admin/CheckProductQuality/UpdateDetailTicket/' + id, data, callback).then(callback);
        },
        deleteDetailTicket: function (data, callback) {
            $http.post('/Admin/CheckProductQuality/DeleteDetailTicket/' + data).then(callback);
        },
        createAttrDetail: function (data, callback) {
            $http.post('/Admin/CheckProductQuality/CreateAttrDetail/' + data, callback).then(callback);
        },
    }
});

app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
    var Code;
    this.setCode = function(d){
        Code = d;
    }
    this.getCode = function () {
        return Code;
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
                TicketTitle:{
                    required:true
                },
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
    $translateProvider.useUrlLoader('/Admin/CheckProductQuality/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();


    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add', {
            templateUrl: ctxfolder + '/addHeader.html',
            controller: 'addHeader'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/editHeader.html',
            controller: 'editHeader'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, $location, myService) {
    var vm = $scope;
    $scope.model = {
        QcTicketCode: '',
        TicketTitle: '',
        TicketCreator: '',
        TicketCreateTime: '',
        Status: '',
        Excuter: '',
        Checker: '',
        Noted: '',
        Attr: [],
        CurrentPageView: 2,
        Length: 9
    };
    
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.TicketTitle==""|| data.TicketTitle == null|| data.TicketTitle == undefined){
            $scope.errorTicketTitle=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketTitle=false;
        }

        if (data.Status==""|| data.Status == null|| data.Status == undefined){
            $scope.errorStatus=true;
            mess.Status=true;
        }else{ 
            $scope.errorStatus=false;
        }

        if (data.TicketCreateTime==""|| data.TicketCreateTime == null|| data.TicketCreateTime == undefined){
            $scope.errorTicketCreateTime=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketCreateTime=false;
        }

        if (data.TicketCreator==""|| data.TicketCreator == null|| data.TicketCreator == undefined){
            $scope.errorTicketCreator=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketCreator=false;
        }

        if (data.Excuter==""|| data.Excuter == null|| data.Excuter == undefined){
            $scope.errorExcuter=true;
            mess.Status=true;
        }else{ 
            $scope.errorExcuter=false;
        }
        
        if (data.Checker==""|| data.Checker == null|| data.Checker == undefined){
            $scope.errorChecker=true;
            mess.Status=true;
        }else{ 
            $scope.errorChecker=false;
        }
        
        return mess
    }

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
        dataservice.getServiceUser(function (rs) {
            rs = rs.data;
            $scope.listServiceUser = rs;
        });
        dataservice.getServiceEmployee(function (rs) {
            rs = rs.data;
            $scope.listServiceEmployee = rs;
        });
        dataservice.getServiceCategory(function (rs) {
            rs = rs.data;
            $scope.listServiceCategory = rs;
        });
        dataservice.getListEmployess(function(rs) {
            rs = rs.data;
            $scope.listEmployee = rs;
        });
        dataservice.getStatusOrder(function(rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });

        callback();
    }

    $scope.initData();
    $scope.listServiceUser = [];
    $scope.listServiceEmployee = [];
    $scope.listServiceCategory = [];
    $scope.listEmployee = [];
    $scope.selected = [];
    $scope.listStatus = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.isOrganization = false;
    $scope.Id;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CheckProductQuality/JTableHeader",
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
                d.Keyword = $scope.model.Keyword;
                d.Status = $scope.model.Status;
                d.TicketCreator = $scope.model.TicketCreator;
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

    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"COM_LIST_COL_NO" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketTitle').withOption('sClass', 'w200').withTitle('{{"PRD_QC_LBL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '200px'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCreator').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_CREATOR" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('TicketCreateTime').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_TICKET_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sWidth', '100px'));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Excuter').withOption('sClass', 'w50').withTitle('{{"PRD_QC_LBL_EXEC" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Checker').withOption('sClass', 'w50').withTitle('{{"PRD_QC_LBL_CHECKER" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Noted').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w50').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="{{\'COM_BTN_EDIT\' | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{\'COM_BTN_DELETE\' | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
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
    $scope.add = function () {
        $location.path('/add');
    }
    $scope.edit = function (id) {
        myService.setData(data = id);
        dataservice.getTicket(id, function(rs) {
            rs = rs.data;
            console.log(rs.QcTicketCode)
            myService.setCode(rs.QcTicketCode)
            $location.path('/edit');
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteTicket(id, function (rs) {
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
        if(!validationSelect($scope.model).Status){
            $scope.model.QcTicketCode = generateRandomArray(7,1,9).join('');
            console.log($scope.model);
            dataservice.createTicket($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    };

    $scope.search = function () {
        reloadData(true);
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
            $('#EndTime').datepicker('setStartDate', maxDate);
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

app.controller('addHeader', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, $location) {
    var vm = $scope;
    $scope.model = {
        QcTicketCode: '',
        TicketTitle: '',
        TicketCreator: '',
        TicketCreateTime: '',
        Status: '',
        Excuter: '',
        Checker: '',
        Noted: '',
        Attr: [],
        CurrentPageView: 2,
        Length: 9
    };
    
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.TicketTitle==""|| data.TicketTitle == null|| data.TicketTitle == undefined){
            $scope.errorTicketTitle=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketTitle=false;
        }

        if (data.Status==""|| data.Status == null|| data.Status == undefined){
            $scope.errorStatus=true;
            mess.Status=true;
        }else{ 
            $scope.errorStatus=false;
        }

        if (data.TicketCreateTime==""|| data.TicketCreateTime == null|| data.TicketCreateTime == undefined){
            $scope.errorTicketCreateTime=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketCreateTime=false;
        }

        if (data.TicketCreator==""|| data.TicketCreator == null|| data.TicketCreator == undefined){
            $scope.errorTicketCreator=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketCreator=false;
        }

        if (data.Excuter==""|| data.Excuter == null|| data.Excuter == undefined){
            $scope.errorExcuter=true;
            mess.Status=true;
        }else{ 
            $scope.errorExcuter=false;
        }
        
        if (data.Checker==""|| data.Checker == null|| data.Checker == undefined){
            $scope.errorChecker=true;
            mess.Status=true;
        }else{ 
            $scope.errorChecker=false;
        }
        
        return mess
    }

    $scope.initData = function () {
        dataservice.getListEmployess(function(rs) {
            rs = rs.data;
            $scope.listEmployee = rs;
        });
        dataservice.getStatusOrder(function(rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });

        callback();
    }

    $scope.initData();
    $scope.listEmployee = [];
    $scope.listStatus = [];
    
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

    function generateRandomArray(length, min, max) {
        var randomArray = [];
        for (var i = 0; i < length; i++) {
            var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            randomArray.push(randomNum);
        }
        return randomArray;
    }
    $scope.submit = function () {
        if(!validationSelect($scope.model).Status){
            $scope.model.QcTicketCode = generateRandomArray(7,1,9).join('');
            console.log($scope.model);
            dataservice.createTicket($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $location.path('/');
                }
            });
        }
    };

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
            $('#EndTime').datepicker('setStartDate', maxDate);
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

app.controller('editHeader', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, myService) {
    var vm = $scope;
    $scope.model = {
        QcTicketCode: myService.getCode(),
        TicketTitle: '',
        TicketCreator: '',
        TicketCreateTime: '',
        Status: '',
        Excuter: '',
        Checker: '',
        Noted: '',
        Attr: [],
        CurrentPageView: 2,
        Length: 9
    };
    
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.TicketTitle==""|| data.TicketTitle == null|| data.TicketTitle == undefined){
            $scope.errorTicketTitle=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketTitle=false;
        }

        if (data.Status==""|| data.Status == null|| data.Status == undefined){
            $scope.errorStatus=true;
            mess.Status=true;
        }else{ 
            $scope.errorStatus=false;
        }

        if (data.TicketCreateTime==""|| data.TicketCreateTime == null|| data.TicketCreateTime == undefined){
            $scope.errorTicketCreateTime=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketCreateTime=false;
        }

        if (data.TicketCreator==""|| data.TicketCreator == null|| data.TicketCreator == undefined){
            $scope.errorTicketCreator=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketCreator=false;
        }

        if (data.Excuter==""|| data.Excuter == null|| data.Excuter == undefined){
            $scope.errorExcuter=true;
            mess.Status=true;
        }else{ 
            $scope.errorExcuter=false;
        }
        
        if (data.Checker==""|| data.Checker == null|| data.Checker == undefined){
            $scope.errorChecker=true;
            mess.Status=true;
        }else{ 
            $scope.errorChecker=false;
        }
        
        return mess
    }

    var para = myService.getData();

    if (para != undefined) {
        $scope.initLoad = function () {
            dataservice.getListEmployess(function(rs) {
                rs = rs.data;
                $scope.listEmployee = rs;
            });
            dataservice.getStatusOrder(function(rs) {
                rs = rs.data;
                $scope.listStatus = rs;
            });
            dataservice.getTicket(para, function(rs) {
                rs = rs.data;
                $scope.model.QcTicketCode = rs.QcTicketCode
                $scope.model.TicketTitle = rs.TicketTitle
                $scope.model.TicketCreator = rs.TicketCreator
                $scope.model.TicketCreateTime = $filter('date')(new Date(rs.TicketCreateTime), 'dd/MM/yyyy') 
                $scope.model.Status = rs.Status
                $scope.model.Excuter = rs.Excuter
                $scope.model.Checker = rs.Checker
                $scope.model.Noted = rs.Noted
            });
        }
        $scope.initLoad();
    }
    else {
        $location.path("/");
    }

    $scope.listEmployee = [];
    $scope.selected = [];
    $scope.listStatus = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.isOrganization = false;
    $scope.Id;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CheckProductQuality/Jtable",
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
                d.QcTicketCode = $scope.model.QcTicketCode;
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
                        $('#tblDetailData').DataTable().$('tr.selected').removeClass('selected');
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

    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"COM_LIST_COL_NO" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ProdCodeLst').withOption('sClass', 'w400').withTitle('{{"PRD_QC_LBL_PROD_EQUIP" | translate}}').renderWith(function (data, type) {
        $scope.listProductOld = JSON.parse(data);
        const mangObject = $scope.listProductOld;
          
        const mangChuoi = mangObject.map((doiTuong) => {
            return `${doiTuong.Name}-${doiTuong.Code}`;
        });

        return mangChuoi.join(', ');
    }).withOption('sWidth', '400px'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CheckingDate').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_CHK_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DeliveryNo').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_DELI_NO" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FacilitySpect').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_STANDARD" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Quantity').withOption('sClass', 'w50').withTitle('{{"PRD_QC_LBL_QUAN" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withOption('sClass', 'w50').withTitle('{{"PRD_QC_LBL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Results').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_RESULT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Content').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_CONTENT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w50').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="{{\'COM_BTN_EDIT\' | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{\'COM_BTN_DELETE\' | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="color: red;" class="fa-solid fa-trash fs25"></i></a>';
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
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (data) {
        console.log(data);
        dataservice.getDetailTicketByID(data, function (rs) {
            rs = rs.data;
            console.log(rs)
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
                    dataservice.deleteDetailTicket(id, function (rs) {
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
    $scope.submit = function () {
        if(!validationSelect($scope.model).Status){
            console.log($scope.model);
            dataservice.updateTicket(para, $scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    };

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
            $('#EndTime').datepicker('setStartDate', maxDate);
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

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, myService) {
    var vm = $scope;
    $scope.model = {
        QcTicketCode: myService.getCode(),
        ProdCodeLst: '',
        ReceivedDate: '',
        CheckingDate: '',
        SupplierCode: '',
        DeliveryNo: '',
        FacilitySpect: '',
        Quantity: '',
        Unit: '',
        Results: '',
        Content: '',
        Attr: [],
        Value: [],
        ListKeywords: [],
        keywords: '',
        ListAttr: [],
    }

    $scope.modelJTable = {
        AttrCode: '',
        AttrName: '',
        Unit: '',
    };
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.ListKeywords.length==0){
            $scope.errorListKeywords=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketTitle=false;
        }

        if (data.ReceivedDate==""|| data.ReceivedDate == null|| data.ReceivedDate == undefined){
            $scope.errorReceivedDate=true;
            mess.Status=true;
        }else{ 
            $scope.errorReceivedDate=false;
        }

        if (data.CheckingDate==""|| data.CheckingDate == null|| data.CheckingDate == undefined){
            $scope.errorCheckingDate=true;
            mess.Status=true;
        }else{ 
            $scope.errorCheckingDate=false;
        }

        if (data.DeliveryNo==""|| data.DeliveryNo == null|| data.DeliveryNo == undefined){
            $scope.errorDeliveryNo=true;
            mess.Status=true;
        }else{ 
            $scope.errorDeliveryNo=false;
        }

        if (data.FacilitySpect==""|| data.FacilitySpect == null|| data.FacilitySpect == undefined){
            $scope.errorFacilitySpect=true;
            mess.Status=true;
        }else{ 
            $scope.errorFacilitySpect=false;
        }
        
        if (data.Quantity==""|| data.Quantity == null|| data.Quantity == undefined){
            $scope.errorQuantity=true;
            mess.Status=true;
        }else{ 
            $scope.errorQuantity=false;
        }
        
        if (data.Unit==""|| data.Unit == null|| data.Unit == undefined){
            $scope.errorUnit=true;
            mess.Status=true;
        }else{ 
            $scope.errorUnit=false;
        }
        
        if (data.Results==""|| data.Results == null|| data.Results == undefined){
            $scope.errorResults=true;
            mess.Status=true;
        }else{ 
            $scope.errorResults=false;
        }
        
        return mess
    }
    $scope.listUnit = [];
    $scope.listStandard = [];
    $scope.listAttr = [];

    $scope.initData = function () {
        dataservice.getServiceUser(function (rs) {
            rs = rs.data;
            $scope.listServiceUser = rs;
        });
        dataservice.getServiceEmployee(function (rs) {
            rs = rs.data;
            $scope.listServiceEmployee = rs;
        });
        dataservice.getServiceCategory(function (rs) {
            rs = rs.data;
            $scope.listServiceCategory = rs;
        });
        dataservice.getListProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
        dataservice.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListStandard(function (rs) {
            rs = rs.data;
            $scope.listStandard = rs;
        });
        dataservice.getListAttr(function (rs) {
            rs = rs.data;
            $scope.listAttr = rs;
        });
        //dataservice.gettreedataCoursetype(function (result) {result=result.data;
        //    $scope.treedataCoursetype = result.Object;
        //});
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
            url: "/Admin/CheckProductQuality/Jtable2",
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
                d.Attr = $scope.model.Attr;
                d.AttrCode = $scope.model.AttrCode;
                d.AttrName = $scope.model.AttrName;
                d.Unit = $scope.modelJTable.Unit;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
                        $('#tblDataAddAttr').DataTable().$('tr.selected').removeClass('selected');
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

    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"COM_LIST_COL_NO" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrCode').withOption('sClass', 'w100').withTitle('{{"Tiêu đề & Mã" | translate}}').renderWith(function (data, type) {
        var desiredCode = data;
        var foundAttr= $scope.listAttr.find(function(obj) {
            return obj.Code === desiredCode;
        });
        if (foundAttr == undefined){
            $scope.initData();
        }
        if (foundAttr.Name){
            var desiredName = foundAttr.Name;
            return '<span>' + desiredName + '<p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã: " + data + "]" + '</p>' + '</span>';
            
        }else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle('{{"Giá trị" | translate}}').renderWith(function (data, type, full) {
        return '<input class="form-control br24" ng-model="model.Value[' + ($scope.Id - 1) + ']" type="text" placeholder="{{\'Giá trị\' | translate}}..." custom-code="' + full.AttrCode + '"/>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrUnit').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    $scope.listProduct = [];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    
    // Getmainpost
    $scope.addKeyword1 = function (data) {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.model.keywords;
        console.log(valueKeyword);
        // nếu keyword chưa có 
        if ($scope.model.ListKeywords.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.model.ListKeywords.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.keywords = "";
        $scope.model.SupplierCode = data;
        console.log(data);
    }

    $scope.search = function () {
        console.log($scope.listAttr);
        reloadData(true);
    }

    $scope.submit = function () {
        // Lấy danh sách các giá trị từ cột "Value" và mã từ thuộc tính tùy chỉnh "custom-code"
        var values = $scope.model.Value;
        var codes = $('[custom-code]');

        if(values.length > 0 && codes != undefined) {
            var items = [];
            for (var i = 0; i < values.length; i++) {
                var item = {
                    Code: codes[i].getAttribute('custom-code'),
                    Value: values[i]
                };
                items.push(item);
            }
            // items bây giờ là một mảng chứa mã và giá trị của từng hàng.
            $scope.model.ListAttr = items;
        }
        
        //if(!validationSelect($scope.model).Status){
            const mangDoiTuong = $scope.model.ListKeywords.map((chuoi) => {
                const parts = chuoi.split('-');
                if (parts.length > 2){
                    let chuoiKetQua = '';
                    for (let i = 0; i < parts.length - 1; i++) {
                        chuoiKetQua += parts[i] + '-'; // Nối chuỗi và thêm dấu phẩy
                    }
                    return {
                        Name: chuoiKetQua.slice(0, -1),
                        Code: parts[parts.length - 1]
                    };
                }else {
                    return {
                        Name: parts[0],
                        Code: parts[1]
                    };
                }
            });
            $scope.model.ProdCodeLst = JSON.stringify(mangDoiTuong);
            console.log($scope.model);
            dataservice.createDetailTicket($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    console.log(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        //}
    }
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
        QcTicketCode: para.QcTicketCode,
        ProdCodeLst: para.ProdCodeLst,
        ReceivedDate: $filter('date')(new Date(para.ReceivedDate), 'dd/MM/yyyy'),
        CheckingDate: $filter('date')(new Date(para.CheckingDate), 'dd/MM/yyyy'),
        SupplierCode: para.SupplierCode,
        DeliveryNo: para.DeliveryNo,
        FacilitySpect: para.FacilitySpect,
        Quantity: para.Quantity,
        Unit: para.Unit,
        Results: para.Results,
        Content: para.Content,
        AttrOld: para.Attr,
        Attr: [],
        ListKeywords: [],
        keywords: '',
        Value: [],
        ListAttr: [],
    }

    $scope.listUnit = [];
    $scope.listStandard = [];

    $scope.initData = function () {
        dataservice.getServiceUser(function (rs) {
            rs = rs.data;
            $scope.listServiceUser = rs;
        });
        dataservice.getServiceEmployee(function (rs) {
            rs = rs.data;
            $scope.listServiceEmployee = rs;
        });
        dataservice.getServiceCategory(function (rs) {
            rs = rs.data;
            $scope.listServiceCategory = rs;
        });
        dataservice.getListProduct(function (rs) {
            rs = rs.data;
            $scope.listProduct = rs;
        });
        dataservice.getListUnit(function (rs) {
            rs = rs.data;
            $scope.listUnit = rs;
        });
        dataservice.getListStandard(function (rs) {
            rs = rs.data;
            $scope.listStandard = rs;
        });
        dataservice.getListAttr(function (rs) {
            rs = rs.data;
            $scope.listAttr = rs;
        });
        $scope.listProductOld = JSON.parse(para.ProdCodeLst);
        console.log($scope.listProductOld);
        const mangObject = $scope.listProductOld;
          
        const mangChuoi = mangObject.map((doiTuong) => {
            return `${doiTuong.Name}-${doiTuong.Code}`;
        });
        $scope.model.ListKeywords = mangChuoi;
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
            url: "/Admin/CheckProductQuality/JTableAttr",
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
                d.Id = para.Id;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
                        $('#tblDataEditAttr').DataTable().$('tr.selected').removeClass('selected');
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

    vm.dtColumns.push(DTColumnBuilder.newColumn('STT').withOption('sClass', 'w20').withTitle('{{"COM_LIST_COL_NO" | translate}}').renderWith(function (data, type) {
        $scope.Id++;
        return $scope.Id;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrCode').withOption('sClass', 'w100').withTitle('{{"Tiêu đề & Mã" | translate}}').renderWith(function (data, type) {
        var desiredCode = data;
        var foundAttr = $scope.listAttr.find(function(obj) {
            return obj.Code === desiredCode;
        });
        if (foundAttr == undefined){
            $scope.initData();
        }
        if (foundAttr.Name){
            var desiredName = foundAttr.Name;
            return '<span>' + desiredName + '<p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã: " + data + "]" + '</p>' + '</span>';
            
        }else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Value').withTitle('{{"Giá trị" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrUnit').withOption('sClass', 'w100').withTitle('{{"PRD_QC_LBL_UNIT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    $scope.listProduct = [];

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    
    // Getmainpost
    $scope.addKeyword1 = function (data) {
        // 1. kiểm tra keyword có hay chưa
        var valueKeyword = $scope.model.keywords;
        console.log(valueKeyword);
        // nếu keyword chưa có 
        if ($scope.model.ListKeywords.findIndex(x => x == valueKeyword) == -1) {
            // 2. thêm keyword vào mảng
            $scope.model.ListKeywords.push(valueKeyword);
        }
        // 3. clear trường keyword
        $scope.model.keywords = "";
        $scope.model.SupplierCode = data;
        console.log(data);
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

        if (data.ListKeywords.length==0){
            $scope.errorListKeywords=true;
            mess.Status=true;
        }else{ 
            $scope.errorTicketTitle=false;
        }

        if (data.ReceivedDate==""|| data.ReceivedDate == null|| data.ReceivedDate == undefined){
            $scope.errorReceivedDate=true;
            mess.Status=true;
        }else{ 
            $scope.errorReceivedDate=false;
        }

        if (data.CheckingDate==""|| data.CheckingDate == null|| data.CheckingDate == undefined){
            $scope.errorCheckingDate=true;
            mess.Status=true;
        }else{ 
            $scope.errorCheckingDate=false;
        }

        if (data.DeliveryNo==""|| data.DeliveryNo == null|| data.DeliveryNo == undefined){
            $scope.errorDeliveryNo=true;
            mess.Status=true;
        }else{ 
            $scope.errorDeliveryNo=false;
        }

        if (data.FacilitySpect==""|| data.FacilitySpect == null|| data.FacilitySpect == undefined){
            $scope.errorFacilitySpect=true;
            mess.Status=true;
        }else{ 
            $scope.errorFacilitySpect=false;
        }
        
        if (data.Quantity==""|| data.Quantity == null|| data.Quantity == undefined){
            $scope.errorQuantity=true;
            mess.Status=true;
        }else{ 
            $scope.errorQuantity=false;
        }
        
        if (data.Unit==""|| data.Unit == null|| data.Unit == undefined){
            $scope.errorUnit=true;
            mess.Status=true;
        }else{ 
            $scope.errorUnit=false;
        }
        
        if (data.Results==""|| data.Results == null|| data.Results == undefined){
            $scope.errorResults=true;
            mess.Status=true;
        }else{ 
            $scope.errorResults=false;
        }
        
        return mess
    }
    $scope.submit = function () {
        // Lấy danh sách các giá trị từ cột "Value" và mã từ thuộc tính tùy chỉnh "custom-code"
        var values = $scope.model.Value;
        var codes = $('[custom-code]');

        if(values.length > 0 && codes != undefined) {
            var items = [];
            for (var i = 0; i < values.length; i++) {
                var item = {
                    Code: codes[i].getAttribute('custom-code'),
                    Value: values[i]
                };
                items.push(item);
            }
            // items bây giờ là một mảng chứa mã và giá trị của từng hàng.
            $scope.model.ListAttr = items;
        }
        console.log($scope.model.ListAttr);
        if(!validationSelect($scope.model).Status){
            $scope.model.QcTicketCode = generateRandomArray(7,1,9).join('');
            const mangDoiTuong = $scope.model.ListKeywords.map((chuoi) => {
                const parts = chuoi.split('-');
                if (parts.length > 2){
                    let chuoiKetQua = '';
                    for (let i = 0; i < parts.length - 1; i++) {
                        chuoiKetQua += parts[i] + '-'; // Nối chuỗi và thêm dấu phẩy
                    }
                    return {
                        Name: chuoiKetQua.slice(0, -1),
                        Code: parts[parts.length - 1]
                    };
                }else {
                    return {
                        Name: parts[0],
                        Code: parts[1]
                    };
                }
            });
            $scope.model.ProdCodeLst = JSON.stringify(mangDoiTuong);
            console.log($scope.model);
            // dataservice.updateDetailTicket(para.Id, $scope.model, function (rs) {
            //     rs = rs.data;
            //     if (rs.Error) {
            //         App.toastrError(rs.Title);
            //     }
            //     else {
            //         App.toastrSuccess(rs.Title);
            //         $uibModalInstance.close();
            //     }
            // });
        }
    }
    function reloadData(resetPaging) {
        console.log($scope.model);
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
//

