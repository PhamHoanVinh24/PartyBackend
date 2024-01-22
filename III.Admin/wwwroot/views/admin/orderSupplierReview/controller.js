var ctxfolder = "/views/admin/orderSupplierReview";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
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
        GetListProducts: function(callback){
            $http.post('/Admin/OrderSupplierReview/GetListProduct').then(callback);
        },
        GetListStatus: function(callback){
            $http.post('/Admin/OrderSupplierReview/GetListStatus').then(callback);
        },
        GetListSuppliers: function(callback){
            $http.post('/Admin/OrderSupplierReview/GetListSuppliers').then(callback);
        },
        GetListCreator: function(callback){
            $http.post('/Admin/OrderSupplierReview/GetListCreator').then(callback);
        },
        GetPaymentOrder: function(callback){
            $http.post('/Admin/OrderSupplierReview/GetPaymentOrder').then(callback);
        },
        GetUnit: function(callback){
            $http.post('/Admin/OrderSupplierReview/GetUnit').then(callback);
        },
        Insert: function(data,callback){
            $http.post('/Admin/OrderSupplierReview/Insert',data).then(callback);
        },
        InsertDetail: function(data,callback){
            $http.post('/Admin/OrderSupplierReview/InsertDetail',data).then(callback);
        },
        Update: function (data, callback) {
            $http.post('/Admin/OrderSupplierReview/Update', data).then(callback);
        },
        UpdateDetail: function (data, callback) {
            $http.post('/Admin/OrderSupplierReview/UpdateDetail', data).then(callback);
        },
        GetOrderSupplierReviewByCode: function (data, callback) {
            $http.post('/Admin/OrderSupplierReview/GetOrderSupplierReviewByCode?ReviewCode=' + data).then(callback);
        },
        GetOrderSupplierReviewDetail: function(data,callback){
            $http.post('/Admin/OrderSupplierReview/GetOrderSupplierReviewDetail/' + data).then(callback);
        },
        DeleteOrderSupplier: function (data, callback) {
            $http.post('/Admin/OrderSupplierReview/DeleteOrderSupplier?reviewCode=' + data).then(callback);
        },
        DeleteOrderSupplierDetail: function (data, callback) {
            $http.post('/Admin/OrderSupplierReview/DeleteOrderSupplierDetail/' + data).then(callback);
        },
        ChangeResultReview: function (id ,data, callback) {
            $http.post('/Admin/OrderSupplierReview/ChangeResultReview/' + id+'?ResultReview='+data).then(callback);
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
    $translateProvider.useUrlLoader('/Admin/ServiceCategoryGroup/Translation');
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


app.controller('index', function ($scope, $rootScope,$filter, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    var vm=$scope;
    var pageLength=10;
    
    $scope.search={
        FromDate:"",
        ToDate:"",
        TitleReview:"",
        CreatorTicket:"",
        Status:"",
      
    }

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    
   
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
        //Jtable main
        vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/OrderSupplierReview/JTable",
            beforeSend: function (jqXHR, settings) {
                
                $scope.initData();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (a) {
                a.FromDate=$scope.search.FromDate;
                a.ToDate=$scope.search.ToDate;
                a.TitleReview=$scope.search.TitleReview;
                a.CreatorTicket=$scope.search.CreatorTicket;
                a.Status=$scope.search.Status;
                // a.ReviewCode=$scope.search.ReviewCode
                console.log(a)
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
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
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
                    $scope.search.ReviewCode=data.ReviewCode
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('TitleReview').withTitle('{{"SCG_OSR_TITLE" | translate}}').renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumns.push(DTColumnBuilder.newColumn('CreatorTicket').withTitle('{{"SCG_OSR_CREATOR" | translate}}').renderWith(function (data, type, full) {
            return data ;
         }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('DateReviewTicket').withTitle('{{"SCG_OSR_DAY" | translate}}').renderWith(function (data, type) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;;
        }));
        vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"SCG_OSR_STATUS" | translate}}').renderWith(function (data, type) {
            return data;
        }));
        vm.dtColumns.push(DTColumnBuilder.newColumn('Noted').withTitle('{{"SCG_OSR_NOTE" | translate}}').renderWith(function (data, type) {
            return data;
        }));
        
        vm.dtColumns.push(DTColumnBuilder.newColumn('ReviewCode').notSortable().withOption('sClass', 'w100').withTitle('{{"SCG_OSR_OPERATION" | translate}}').renderWith(function (data, type, full) {
            return '<a title="Thêm mới chi tiết đánh giá" ng-click="addDetail('+"'" + data +"'"+ ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-plus fs25"></i></a>' + 
                '<a title="Chỉnh sửa" ng-click="edit('+"'" + data +"'"+ ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
                '<a title="Xoá" ng-click="delete('+"'" + data +"'"+ ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>' ;
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
    function loadDate() {
        $("#FromDate").datepicker({
             inline: false,
             autoclose: true,
             format: "dd/mm/yyyy",
             fontAwesome: true,
         }).on('changeDate', function (selected) {
             var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
         });

         $("#ToDate").datepicker({
             inline: false,
             autoclose: true,
             format: "dd/mm/yyyy",
             fontAwesome: true,
         }).on('changeDate', function (selected) {
             var maxDate = new Date(selected.date.valueOf());
             $('#FromDate').datepicker('setEndDate', maxDate);
         }); 

         $("#deliverytime").datepicker({
             inline: false,
             autoclose: true,
             format: "dd/mm/yyyy",
             fontAwesome: true,
         }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
             $('#deliverytime').datepicker('setEndDate', maxDate);
        });
        
        
         $('.end-date').click(function () {
             $('#datefrom').datepicker('setEndDate', null);
         });
         $('.start-date').click(function () {
             $('#dateto').datepicker('setStartDate', null);
         });
     }

     function callback(json) {
 
     }
     
     
    // view detail
     $scope.Details = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail',
            backdrop: 'static',
            //windowClass: "modal-center",
            size: '70',
        });
        modalInstance.result.then(function () {
            $scope.reloadNoResetPage();
            }, function () {
        });
     };


    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.initData = function () {
        dataservice.GetListSuppliers(function(rs){
            $scope.ListSuppliers=rs.data;
        });
        dataservice.GetListProducts(function(rs){
            $scope.ListProducts=rs.data;
        })
        dataservice.GetListCreator(function(rs){
            $scope.ListCreator=rs.data;
        })
        dataservice.GetPaymentOrder(function(rs){
            $scope.PaymentMethods=rs.data;
        })
        dataservice.GetUnit(function(rs){
            $scope.Units=rs.data;
        })
        dataservice.GetListStatus(function(rs){
            $scope.listStatus=rs.data;
        })
    }
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 35;
    } else if ($window.innerWidth > 1400) {
        size = 25;
    }

    $scope.add = function () {
        console.log();
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            //windowClass: "modal-center",
            size: '70',
        });
        modalInstance.result.then(function () {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }

    $scope.edit = function (ReviewCode) {
        dataservice.GetOrderSupplierReviewByCode(ReviewCode, function (rs) {
            rs = rs.data;
            console.log(rs);
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    //windowClass: "modal-center",
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        })

    }

    $scope.delete = function (ReviewCode) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.DeleteOrderSupplier(ReviewCode, function (rs) {
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
                    $uibModalInstance.close();
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }

    $scope.addDetail = function (ReviewCode) {
        console.log(ReviewCode);
        dataservice.GetOrderSupplierReviewByCode(ReviewCode,function(rs){
            rs=rs.data;
            console.log(rs);
            if(rs.Error){
                App.toastrError(rs.Title)
            }else{
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/addDetail.html',
                    controller: 'addDetail',
                    backdrop: 'static',
                    //windowClass: "modal-center",
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function () {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        })
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
            $scope.search={
                FromDate:"",
                ToDate:"",
                TitleReview:"",
                CreatorTicket:"",
                Status:"",
            }
            $scope.reloadNoResetPage();
        
        }
    }
    setTimeout(function () {
       loadDate()
    }, 200);
});

app.controller('add', function ($scope, $rootScope,$filter, $confirm, $compile, $uibModal,$uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    var vm=$scope;
    var pageLength=10;
    $rootScope.ReviewCode=""
    $scope.search={
        FromDate:"",
        ToDate:"",
        SuppliersName:"",
        ProductName:"",
        Review:""
    }

    $scope.model = {
        Status:"",
        DateReviewTicket:"" ,
        TitleReview:"",
        CreatorTicket:"",
        PaymentStatus: "",
        Noted: "",
        ReviewCode:"",
    }
    $scope.listReputation = [
        {
            Code: "Cao",
            Name: "Cao"
        },
        {
            Code: "Trung bình",
            Name: "Trung bình"
        },
        {
            Code: "Thấp",
            Name: "Thấp"
        },
    ];

    $scope.listReview = [
        {
            Code: "Đạt",
            Name: "Đạt"
        },
        {
            Code: "Chưa đạt",
            Name: "Chưa đạt"
        },
    ];
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
            if (data.CreatorTicket==""|| data.CreatorTicket == null|| data.CreatorTicket == undefined){
                $scope.errorCreatorTicket=true;
                mess.Status=true;
            }else{ 
                $scope.errorCreatorTicket=false;
            }
            if (data.DateReviewTicket==""|| data.DateReviewTicket == null|| data.DateReviewTicket == undefined){
                $scope.errorDateReviewTicket=true;
                mess.Status=true;
            }else{ 
                $scope.errorDateReviewTicket=false;
            }
            if (data.TitleReview==""|| data.TitleReview == null|| data.TitleReview == undefined){
                $scope.errorTitleReview=true;
                mess.Status=true;
            }else{ 
                $scope.errorTitleReview=false;
            }
            if (data.Status==""|| data.Status == null|| data.Status == undefined){
                $scope.errorStatus=true;
                mess.Status=true;
            }else{ 
                $scope.errorStatus=false;
            }
        return mess;
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
        //Jtable main
        vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/OrderSupplierReview/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                
                $scope.initData();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (a) {
                a.FromDate=$scope.search.FromDate;
                a.ToDate=$scope.search.ToDate;
                a.SuppliersName=$scope.search.SuppliersName;
                a.ProductName=$scope.search.ProductName;
                a.Review=$scope.search.Review
                console.log(a)
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
                        $('#tblData4').DataTable().$('tr.selected').removeClass('selected');
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
                    //$scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
        // vm.dtColumns.push(DTColumnBuilder.newColumn('ReviewCode').withTitle('{{"ReviewCode" | translate}}').renderWith(function (data, type) {
        //     return data;
        // }));
        vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"SCG_OSR_PRODUCTNAME" | translate}}').renderWith(function (data, type, full) {
            return data+'<br/><p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã sản phẩm: " + full.ProductCode+ "]" + '</p>' + '</span>';;
        }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"SCG_OSR_SUPPLIER" | translate}}').renderWith(function (data, type,full) {
            return data+'<br/><p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã nhà cung cấp: " + full.SupplierCode+ "]" + '</p>' + '</span>';;;
        }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('QcSystem').withTitle('{{"SCG_OSR_SYSTEM" | translate}}').renderWith(function (data, type) {
            return data ;
        }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('Pricing').withTitle('{{"SCG_OSR_PRICE" | translate}}').renderWith(function (data, type,full) {
            return $filter('currency')(data, '', 0)+' '+full.Unit;
        }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('PaymentMethod').withTitle('{{"SCG_OSR_PAY" | translate}}').renderWith(function (data, type) {
            return data;
        }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('DeliveryTime').withTitle('{{"SCG_OSR_DAY" | translate}}').renderWith(function (data, type) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;;
        }).withOption('sClass', 'dataTable-pr0 dataTable-5per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('Reputation').withTitle('{{"SCG_OSR_EVALUATE" | translate}}').renderWith(function (data, type) {
            return data
        }).withOption('sClass', 'dataTable-pr0 dataTable-5per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('Id').notSortable().withOption('sClass', 'w50').withTitle('{{"SCG_OSR_OPERATION" | translate}}').renderWith(function (data, type, full) {
            return '<a title="Chỉnh sửa chi tiết phiếu đánh giá" ng-click="editDetail('+data+ ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
                '<a title="Xoá chi tiết phiếu đánh giá" ng-click="deleteDetail('+ data + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
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

         $("#deliverytime").datepicker({
             inline: false,
             autoclose: true,
             format: "dd/mm/yyyy",
             fontAwesome: true,
         }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
             $('#deliverytime').datepicker('setEndDate', maxDate);
        });
        
        
         $('.end-date').click(function () {
             $('#datefrom').datepicker('setEndDate', null);
         });
         $('.start-date').click(function () {
             $('#dateto').datepicker('setStartDate', null);
         });
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.initData = function () {
        dataservice.GetListSuppliers(function(rs){
            $scope.ListSuppliers=rs.data;
        });
        dataservice.GetListProducts(function(rs){
            $scope.ListProducts=rs.data;
        })
        dataservice.GetListCreator(function(rs){
            $scope.ListCreator=rs.data;
        })
        dataservice.GetPaymentOrder(function(rs){
            $scope.PaymentMethods=rs.data;
        })
        dataservice.GetUnit(function(rs){
            $scope.Units=rs.data;
        })
        dataservice.GetListStatus(function(rs){
            $scope.listStatus=rs.data;
        })
    }
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 35;
    } else if ($window.innerWidth > 1400) {
        size = 25;
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.submit = function () {
        if (!validationSelect($scope.model).Status) {
            dataservice.Insert($scope.model, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
                } else {
                   App.toastrSuccess(rs.Title);
                   $uibModalInstance.close();
                }
            })
        }
    }

    $scope.deleteDetail = function (ReviewCode) {
        console.log("hello");
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.DeleteOrderSupplierDetail(ReviewCode, function (rs) {
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
                    $uibModalInstance.close();
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.addDetail = function (ReviewCode) {
        console.log(ReviewCode);
        dataservice.GetOrderSupplierReviewByCode(ReviewCode,function(rs){
            rs=rs.data;
            console.log(rs);
            if(rs.Error){
                App.toastrError(rs.Title)
            }else{
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/addDetail.html',
                    controller: 'addDetail',
                    backdrop: 'static',
                    //windowClass: "modal-center",
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function () {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        })
    }
    $scope.editDetail = function (id) {
        dataservice.GetOrderSupplierReviewDetail(id,function(rs){
            rs=rs.data;
            console.log(rs);
            if(rs.Error){
                App.toastrError(rs.Title)
            }else{
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/editDetail.html',
                    controller: 'editDetail',
                    backdrop: 'static',
                    //windowClass: "modal-center",
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function () {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        })
    }

   
    
    $scope.initData();
    $scope.cancel = function () {
        console.log("he");
        $uibModalInstance.close();
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
        $("#datereview").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datereview').datepicker('setEndDate', maxDate);
        });
    }, 200);
});

app.controller('edit', function ($scope, $rootScope,$filter, $confirm, $compile, $uibModal,$uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window,para) {
    var vm=$scope;
    var pageLength=10;
    $rootScope.ReviewCode=para.ReviewCode
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
            if (data.CreatorTicket==""|| data.CreatorTicket == null|| data.CreatorTicket == undefined){
                $scope.errorCreatorTicket=true;
                mess.Status=true;
            }else{ 
                $scope.errorCreatorTicket=false;
            }
            if (data.DateReviewTicket==""|| data.DateReviewTicket == null|| data.DateReviewTicket == undefined){
                $scope.errorDateReviewTicket=true;
                mess.Status=true;
            }else{ 
                $scope.errorDateReviewTicket=false;
            }
            if (data.TitleReview==""|| data.TitleReview == null|| data.TitleReview == undefined){
                $scope.errorTitleReview=true;
                mess.Status=true;
            }else{ 
                $scope.errorTitleReview=false;
            }
            if (data.Status==""|| data.Status == null|| data.Status == undefined){
                $scope.errorStatus=true;
                mess.Status=true;
            }else{ 
                $scope.errorStatus=false;
            }
        return mess;
    };
    $scope.search={
        FromDate:"",
        ToDate:"",
        SuppliersName:"",
        ProductName:"",
        Review:""
    }

    $scope.model = {
        DateReviewTicket: $filter('date')(new Date(para.DateReviewTicket), 'dd/MM/yyyy') ,
        TitleReview: para.TitleReview,
        CreatorTicket: para.CreatorTicket,
        PaymentStatus: para.PaymentStatus,
        Noted: para.Noted,
        ReviewCode: para.ReviewCode,
    }

    $scope.submit = function () {
        if (!validationSelect($scope.model).Status) {
            dataservice.Update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }

    $scope.addDetail = function () {
        dataservice.GetOrderSupplierReviewByCode($scope.model.ReviewCode,function(rs){
            rs=rs.data;
            console.log(rs);
            if(rs.Error){
                App.toastrError(rs.Title)
            }else{
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/addDetail.html',
                    controller: 'addDetail',
                    backdrop: 'static',
                    //windowClass: "modal-center",
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function () {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        })
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
        //Jtable main
        vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/OrderSupplierReview/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                
                $scope.initData();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (a) {
                a.FromDate=$scope.search.FromDate;
                a.ToDate=$scope.search.ToDate;
                a.SuppliersName=$scope.search.SuppliersName;
                a.ProductName=$scope.search.ProductName;
                a.Review=$scope.search.Review;
                a.ReviewCode=$scope.model.ReviewCode;
                console.log(a)
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
                        $('#tblData3').DataTable().$('tr.selected').removeClass('selected');
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
                    //$scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
        // vm.dtColumns.push(DTColumnBuilder.newColumn('ReviewCode').withTitle('{{"ReviewCode" | translate}}').renderWith(function (data, type) {
        //     return data;
        // }));
        vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"SCG_OSR_PRODUCTNAME" | translate}}').renderWith(function (data, type, full) {
            return data+'<br/><p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã sản phẩm: " + full.ProductCode+ "]" + '</p>' + '</span>';;
        }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"SCG_OSR_SUPPLIER" | translate}}').renderWith(function (data, type,full) {
            return data+'<br/><p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã nhà cung cấp: " + full.SupplierCode+ "]" + '</p>' + '</span>';;;
        }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('QcSystem').withTitle('{{"SCG_OSR_SYSTEM" | translate}}').renderWith(function (data, type) {
            return data ;
        }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('Pricing').withTitle('{{"SCG_OSR_PRICE" | translate}}').renderWith(function (data, type,full) {
            return $filter('currency')(data, '', 0) +' '+full.Unit;
        }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('PaymentMethod').withTitle('{{"SCG_OSR_PAY" | translate}}').renderWith(function (data, type) {
            return data;
        }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('DeliveryTime').withTitle('{{"SCG_OSR_DAY" | translate}}').renderWith(function (data, type) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;;
        }).withOption('sClass', 'dataTable-pr0 dataTable-5per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('Id').notSortable().withOption('sClass', 'w50').withTitle('{{"SCG_OSR_OPERATION" | translate}}').renderWith(function (data, type, full) {
            return '<a title="Chỉnh sửa chi tiết phiếu đánh giá" ng-click="editDetail('+"'" + data +"'"+ ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
                '<a title="Xoá chi tiết phiếu đánh giá" ng-click="deleteDetail('+"'" + data +"'"+ ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
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
       
     };


    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.initData = function () {
        dataservice.GetListSuppliers(function(rs){
            $scope.ListSuppliers=rs.data;
        });
        dataservice.GetListProducts(function(rs){
            $scope.ListProducts=rs.data;
        })
        dataservice.GetListCreator(function(rs){
            $scope.ListCreator=rs.data;
        })
        dataservice.GetPaymentOrder(function(rs){
            $scope.PaymentMethods=rs.data;
        })
        dataservice.GetUnit(function(rs){
            $scope.Units=rs.data;
        })
        dataservice.GetListStatus(function(rs){
            $scope.listStatus=rs.data;
            var status=para.Status;
            $scope.model.Status=$scope.listStatus.find(x=>x.Name==status).Code
            
            console.log($scope.model.Status);
        })
    }
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 35;
    } else if ($window.innerWidth > 1400) {
        size = 25;
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    
    $scope.initData();
    $scope.cancel = function () {
        console.log("he");
        $uibModalInstance.close();
    }
    $scope.editDetail = function (id) {
        dataservice.GetOrderSupplierReviewDetail(id,function(rs){
            rs=rs.data;
            console.log(rs);
            if(rs.Error){
                App.toastrError(rs.Title)
            }else{
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/editDetail.html',
                    controller: 'editDetail',
                    backdrop: 'static',
                    //windowClass: "modal-center",
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function () {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        })
    }
    $scope.deleteDetail = function (ReviewCode) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.DeleteOrderSupplierDetail(ReviewCode, function (rs) {
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
                    $uibModalInstance.close();
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
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
        $("#datereview").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datereview').datepicker('setEndDate', maxDate);
        });
    }, 200);
});

app.controller('addDetail', function (para,$scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window) {
   
    console.log(para)
    $scope.model={
        CreatorTicket:para.CreatorTicket, 
        DateReviewTicket:$filter('date')(new Date(para.DateReviewTicket), 'dd/MM/yyyy'),
        Id:para.Id,
        Noted:para.Noted,
        ReviewCode:para.ReviewCode,
        Status:para.Status,
        TitleReview:para.TitleReview,
    }
    $scope.modeldetail={
        Id:"",
        DeliveryTime:"",
        Noted:"",
        PaymentMethod:"",
        ResultReview:"",
        Pricing:"",
        ProductCode:"",
        QcSystem:"",
        Reputation:"",
        SupplierCode:"",
        Unit:"",
        ReviewCode:para.ReviewCode
    }
    $scope.listReputation = [
        {
            Code: "High",
            Name: "Cao"
        },
        {
            Code: "Medium",
            Name: "Trung bình"
        },
        {
            Code: "Low",
            Name: "Thấp"
        },
        
    ];

    $scope.listReview = [
        {
            Code: "Đạt",
            Name: "Đạt"
        },
        {
            Code: "Không Đạt",
            Name: "Không Đạt"
        },
        
    ];

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }


        //Check null vật tư
        if (data.ProductCode == undefined || data.ProductCode == null || data.ProductCode == '') { 
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }

        //Check null nhà cung cấp
        if (data.SupplierCode == undefined || data.SupplierCode == null || data.SupplierCode == '') {
            $scope.errorSupplier = true;
            mess.Status = true;
        } else {
            $scope.errorSupplier = false;
        }

        //Check null hệ thống
        if (data.QcSystem == undefined || data.QcSystem == null || data.QcSystem == '') {
            $scope.errorSystem = true;
            mess.Status = true;
        } else {
            $scope.errorSystem = false;
        }

        //Check null giá
        if (data.Pricing == undefined || data.Pricing == null || data.Pricing == '') {
            $scope.errorPrice = true;
            $scope.validPrice="OSR_DETAIL_VALIDATE_PRICE_BLANK"
            mess.Status = true;
        } else {
            $scope.errorPrice = false;
        }

        //Check null unit
        if (data.Unit == undefined || data.Unit == null || data.Unit == '') {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        //Check null paymenMethod
        if (data.PaymentMethod == undefined || data.PaymentMethod == null || data.PaymentMethod == '') {
            $scope.errorPaymentMethod = true;
            mess.Status = true;
        } else {
            $scope.errorPaymentMethod = false;
        }
        //Check null DeliveryTime
        if (data.DeliveryTime == undefined || data.DeliveryTime == null || data.DeliveryTime == '') {
            $scope.errorDeliveryTime = true;
            mess.Status = true;
        } else {
            $scope.errorDeliveryTime = false;
        }
        //Check null Reputation
        if (data.Reputation == undefined || data.Reputation == null || data.Reputation == '') {
            $scope.errorReputation = true;
            mess.Status = true;
        } else {
            $scope.errorReputation = false;
        }
       
        

        return mess;
    };


    $scope.submit = function () {
        console.log(validationSelect($scope.modeldetail));
        if ($scope.addform.validate() && !validationSelect($scope.modeldetail).Status) {
            console.log($scope.modeldetail)
            dataservice.InsertDetail($scope.modeldetail, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    $scope.initData = function () {
        dataservice.GetListSuppliers(function (rs) {
            $scope.ListSuppliers = rs.data;
        });
        dataservice.GetListProducts(function (rs) {
            $scope.ListProducts = rs.data;
        })
        dataservice.GetListCreator(function (rs) {
            $scope.ListCreator = rs.data;
            console.log(rs)
        })
        dataservice.GetPaymentOrder(function (rs) {
            $scope.PaymentMethods = rs.data;
        })
        dataservice.GetUnit(function (rs) {
            $scope.Units = rs.data;
        })
        dataservice.GetListStatus(function (rs) {
            $scope.listStatus = rs.data;
        })
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    setTimeout(function () {
        $("#deliverytime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        })
    }, 200);
})

app.controller('editDetail', function ($scope,para, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window) {
    $scope.model={
        CreatorTicket:para.parent.CreatorTicket, 
        DateReviewTicket:$filter('date')(new Date(para.parent.DateReviewTicket), 'dd/MM/yyyy') ,
        Noted:para.parent.Noted,
        ReviewCode:para.parent.ReviewCode,
        Status:para.parent.Status,
        TitleReview:para.parent.TitleReview,
    }
    $scope.modeldetail={
        Id:para.data.Id,
        DeliveryTime: $filter('date')(new Date(para.data.DeliveryTime), 'dd/MM/yyyy') ,
        Noted:para.data.Noted,
        PaymentMethod:para.data.PaymentMethod,
        ResultReview:para.data.ResultReview,
        Pricing:para.data.Pricing,
        ProductCode:para.data.ProductCode,
        QcSystem:para.data.QcSystem,
        Reputation:para.data.Reputation,
        SupplierCode:para.data.SupplierCode,
        Unit:para.data.Unit,
        ReviewCode:para.data.ReviewCode
    }

    console.log($scope.modeldetail);
    
    $scope.listReview = [
        {
            Code: "Đạt",
            Name: "Đạt"
        },
        {
            Code: "Chưa đạt",
            Name: "Chưa đạt"
        },
    ];
    $scope.listReputation = [
        {
            Code: "Cao",
            Name: "Cao"
        },
        {
            Code: "Trung bình",
            Name: "Trung bình"
        },
        {
            Code: "Thấp",
            Name: "Thấp"
        },
    ];

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }


        //Check null vật tư
        if (data.ProductCode == undefined || data.ProductCode == null || data.ProductCode == '') { 
            $scope.errorProductCode = true;
            mess.Status = true;
        } else {
            $scope.errorProductCode = false;
        }

        //Check null nhà cung cấp
        if (data.SupplierCode == undefined || data.SupplierCode == null || data.SupplierCode == '') {
            $scope.errorSupplier = true;
            mess.Status = true;
        } else {
            $scope.errorSupplier = false;
        }

        //Check null hệ thống
        if (data.QcSystem == undefined || data.QcSystem == null || data.QcSystem == '') {
            $scope.errorSystem = true;
            mess.Status = true;
        } else {
            $scope.errorSystem = false;
        }

        //Check null giá
        if (data.Pricing == undefined || data.Pricing == null || data.Pricing == '') {
            $scope.errorPrice = true;
            $scope.validPrice="OSR_DETAIL_VALIDATE_PRICE_BLANK"
            mess.Status = true;
        } else {
            $scope.errorPrice = false;
        }
        console.log($scope.errorPrice)
        //Check null unit
        if (data.Unit == undefined || data.Unit == null || data.Unit == '') {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;
        }
        //Check null paymenMethod
        if (data.PaymentMethod == undefined || data.PaymentMethod == null || data.PaymentMethod == '') {
            $scope.errorPaymentMethod = true;
            mess.Status = true;
        } else {
            $scope.errorPaymentMethod = false;
        }
        //Check null DeliveryTime
        if (data.DeliveryTime == undefined || data.DeliveryTime == null || data.DeliveryTime == '') {
            $scope.errorDeliveryTime = true;
            mess.Status = true;
        } else {
            $scope.errorDeliveryTime = false;
        }
        //Check null Reputation
        if (data.Reputation == undefined || data.Reputation == null || data.Reputation == '') {
            $scope.errorReputation = true;
            mess.Status = true;
        } else {
            $scope.errorReputation = false;
        }
       
        

        return mess;
    };

    $scope.submit = function () {
        if ($scope.addform.validate() && !validationSelect($scope.modeldetail).Status) {
            console.log($scope.modeldetail)
            dataservice.UpdateDetail($scope.modeldetail, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
    $scope.initData = function () {
        dataservice.GetListSuppliers(function (rs) {
            $scope.ListSuppliers = rs.data;
        });
        dataservice.GetListProducts(function (rs) {
            $scope.ListProducts = rs.data;
        })
        dataservice.GetListCreator(function (rs) {
            $scope.ListCreator = rs.data;
            console.log(rs)
        })
        dataservice.GetPaymentOrder(function (rs) {
            $scope.PaymentMethods = rs.data;
        })
        dataservice.GetUnit(function (rs) {
            $scope.Units = rs.data;
        })
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    setTimeout(function () {
        $("#deliverytime").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        })
    }, 200);
})


app.controller('detail', function ($scope, $rootScope,$filter, $confirm, $compile, $uibModal,$uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    var vm=$scope;
    var pageLength=10;
    
    $scope.search={
        FromDate:"",
        ToDate:"",
        SuppliersName:"",
        ProductName:"",
        Review:""
    }

    $scope.listReputation = [
        {
            Code: "Cao",
            Name: "Cao"
        },
        {
            Code: "Trung bình",
            Name: "Trung bình"
        },
        {
            Code: "Thấp",
            Name: "Thấp"
        },
    ];

    $scope.listReview = [
        {
            Code: "Đạt",
            Name: "Đạt"
        },
        {
            Code: "Chưa đạt",
            Name: "Chưa đạt"
        },
    ];
    

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
        //Jtable main
        vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/OrderSupplierReview/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                
                $scope.initData();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (a) {
                a.FromDate=$scope.search.FromDate;
                a.ToDate=$scope.search.ToDate;
                a.SuppliersName=$scope.search.SuppliersName;
                a.ProductName=$scope.search.ProductName;
                a.Review=$scope.search.Review
                console.log(a)
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
                        $('#tblData4').DataTable().$('tr.selected').removeClass('selected');
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
                    //$scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
        // vm.dtColumns.push(DTColumnBuilder.newColumn('ReviewCode').withTitle('{{"ReviewCode" | translate}}').renderWith(function (data, type) {
        //     return data;
        // }));
        vm.dtColumns.push(DTColumnBuilder.newColumn('ProductName').withTitle('{{"SCG_OSR_PRODUCTNAME" | translate}}').renderWith(function (data, type, full) {
            return data+'<br/><p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã sản phẩm: " + full.ProductCode+ "]" + '</p>' + '</span>';;
        }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"SCG_OSR_SUPPLIER" | translate}}').renderWith(function (data, type,full) {
            return data+'<br/><p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã nhà cung cấp: " + full.SupplierCode+ "]" + '</p>' + '</span>';;;
        }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('QcSystem').withTitle('{{"SCG_OSR_SYSTEM" | translate}}').renderWith(function (data, type) {
            return data ;
        }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('Pricing').withTitle('{{"SCG_OSR_PRICE" | translate}}').renderWith(function (data, type,full) {
            return $filter('currency')(data, '', 0) +' '+full.Unit;
        }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('PaymentMethod').withTitle('{{"SCG_OSR_PAY" | translate}}').renderWith(function (data, type) {
            return data;
        }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('DeliveryTime').withTitle('{{"SCG_OSR_DAY" | translate}}').renderWith(function (data, type) {
            return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;;
        }).withOption('sClass', 'dataTable-pr0 dataTable-5per'));
        vm.dtColumns.push(DTColumnBuilder.newColumn('Reputation').withTitle('{{"SCG_OSR_EVALUATE" | translate}}').renderWith(function (data, type) {
            return data
        }).withOption('sClass', 'dataTable-pr0 dataTable-5per'));       
        vm.dtColumns.push(DTColumnBuilder.newColumn('Id').notSortable().withOption('sClass', 'w50').withTitle('{{"SCG_OSR_OPERATION" | translate}}').renderWith(function (data, type, full) {
            return '<a title="Chỉnh sửa chi tiết phiếu đánh giá" ng-click="editDetail('+data+ ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
                '<a title="Xoá chi tiết phiếu đánh giá" ng-click="deleteDetail('+ data + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
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
    function loadDate() {
        $("#datefrom").datepicker({
             inline: false,
             autoclose: true,
             format: "dd/mm/yyyy",
             fontAwesome: true,
         }).on('changeDate', function (selected) {
             var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
         });

         $("#dateto").datepicker({
             inline: false,
             autoclose: true,
             format: "dd/mm/yyyy",
             fontAwesome: true,
         }).on('changeDate', function (selected) {
             var maxDate = new Date(selected.date.valueOf());
             $('#FromDate').datepicker('setEndDate', maxDate);
         });         
        
         $('.end-date').click(function () {
             $('#datefrom').datepicker('setEndDate', null);
         });
         $('.start-date').click(function () {
             $('#dateto').datepicker('setStartDate', null);
         });
     }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.initData = function () {
        dataservice.GetListSuppliers(function(rs){
            $scope.ListSuppliers=rs.data;
        });
        dataservice.GetListProducts(function(rs){
            $scope.ListProducts=rs.data;
        })
    }
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 35;
    } else if ($window.innerWidth > 1400) {
        size = 25;
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.deleteDetail = function (id) {
        console.log("hello");
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.DeleteOrderSupplierDetail(id, function (rs) {
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
                    $uibModalInstance.close();
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.editDetail = function (id) {
        dataservice.GetOrderSupplierReviewDetail(id,function(rs){
            rs=rs.data;
            console.log(rs);
            if(rs.Error){
                App.toastrError(rs.Title)
            }else{
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/editDetail.html',
                    controller: 'editDetail',
                    backdrop: 'static',
                    //windowClass: "modal-center",
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function () {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        })
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    setTimeout(function () {
        loadDate()
    }, 200);
});


app.controller('tabAttribute', function ($scope, $rootScope,$filter, $confirm, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    console.log('Tab')
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {};
    $scope.listReputation = [
        {
            Code: "Cao",
            Name: "Cao"
        },
        {
            Code: "Khá",
            Name: "Khá"
        },
        {
            Code: "Trung bình",
            Name: "Trung bình"
        },
        {
            Code: "Thấp",
            Name: "Thấp"
        },
    ];
    
    $scope.listReview = [
        "Đạt","Chưa đạt"
    ];
    $scope.result=[]
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/OrderSupplierReview/JTableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ReviewCode=$rootScope.ReviewCode
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataAttribute");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
        .withOption('order', [0, 'desc'])
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled2) {
                $scope.headerCompiled2 = true;
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
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{"SCG_OSR_SUPPLIER" | translate}}').renderWith(function (data, type,full) {
        return data+'<br/><p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã nhà cung cấp: " + full.SupplierCode+ "]" + '</p>' + '</span>'
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per').withOption('sClass', 'col-4'));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('Reputation').withTitle('{{"SCG_OSR_EVALUATE" | translate}}').renderWith(function (data, type,full) {
        return data
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per').withOption('sClass', 'col-4'));
    
    vm.dtColumns.push(DTColumnBuilder.newColumn('ResultReview').withTitle('{{"SCG_RESULT_REVIEW" | translate}}').renderWith(function (data, type, full) {
        $scope.result[full.Id]={
            Id:full.Id,
            data
        };
        var rs='<div class="br24"> '+
                '<ui-select tagging ng-model="result['+full.Id+'].data" theme="bootstrap" class="d-block w-100" on-select=ChangeResult('+full.Id+')>'+
                '<ui-select-match>{{$select.selected}}</ui-select-match>'+
                    '<ui-select-choices repeat="x in listReview| filter: $select.search">'+
                        '{{x}}'+
                    '</ui-select-choices>'+
                '</ui-select>'+
                '</div>'
        return rs;
    }).withOption('sClass', 'dataTable-pr0 dataTable-5per').withOption('sClass', 'col-4').withOption('createdCell', function(td, cellData, rowData, row, col) {
        $compile( td )( $scope ); //<--- here
     }) );
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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

    function callback(json) {

    }
    $scope.ChangeResult=function(id){
        var data=$scope.result[id]
        dataservice.ChangeResultReview(data.Id,data.data,function(rs){
            rs=rs.data;
            if(rs.Error){
                App.toastrError(rs.Title)
            }else{
                App.toastrSuccess(rs.Title)
            }
        });
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadAttribute = function () {
        $scope.reload();
    }
    
});