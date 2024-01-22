var ctxfolder = "/views/admin/serviceRegist";
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
        // insert: function (data, callback) {
        //     $http.post('/Admin/ServiceCategoryGroup/Insert', data, callback).then(callback);
        // },
        insert: function (data, callback) {
            $http.post('/Admin/ServiceRegist/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/ServiceCategoryGroup/Update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Category/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/ServiceCategoryGroup/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/ServiceCategoryGroup/GetItem/' + data).then(callback);
        },
        //gettreedataCoursetype: function (callback) {
        //    $http.post('/Admin/ServiceCategoryGroup/gettreedataCoursetype/').then(callback);
        //},
        //gettreedataLevel: function (callback) {
        //    $http.post('/Admin/ServiceCategoryGroup/gettreedataLevel/').then(callback);
        //},
        //gettreedataedit: function (callback) {
        //    $http.post('/Admin/ServiceCategoryGroup/gettreedataLevel/').then(callback);
        //},
        //uploadImage: function (data, callback) {
        //    submitFormUpload('/EDMSCategory/UploadImage/', data, callback);
        //}
        getServiceUser: function (callback) {
            $http.post('/Admin/ServiceRegist/GetServiceUser').then(callback);
        },
        getServiceEmployee: function (callback) {
            $http.post('/Admin/ServiceRegist/GetServiceEmployee').then(callback);
        },
        getServiceCategory: function (callback) {
            $http.post('/Admin/ServiceRegist/GetServiceCategory').then(callback);
        },
        getServiceByID: function (data, callback) {
            $http.post('/Admin/ServiceRegist/GetServiceByID/' + data).then(callback);
        },
        update: function (id, data, callback) {
            $http.post('/Admin/ServiceRegist/Update/' + id, data).then(callback);
        },
        deleteServiceRegist: function (data, callback) {
            $http.post('/Admin/ServiceRegist/DeleteServiceRegist/' + data).then(callback);
        },
        exportPdf: function (data, callback) {
            $http.post('/Admin/ServiceRegist/ExportPdf', data).then(callback);
        },
        PriceByServiceCode: function (data, data2, callback) {
            $http.post('/Admin/ServiceRegist/PriceByServiceCode?ServiceCode=' + data + '&ServiceCostHeaderCode=' + data2).then(callback);
        },
        CheckSubscription: function (data, callback) {
            $http.post('/Admin/ServiceRegist/CheckSubscription', data).then(callback);
        },
        GetServiceCostHeader: function (data, callback) {
            $http.post('/Admin/ServiceRegist/GetServiceCostHeader', data).then(callback);
        },
        getServiceCondition: function (callback) {
            $http.post('/Admin/Contract/GetServiceCondition').then(callback);
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
var pageLength = 10

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window) {
    var vm = $scope;
    $scope.model = {
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
        //dataservice.gettreedataLevel(function (result) {result=result.data;
        //    $scope.treedataLevel = result.Object;
        //});
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


        callback();
    }

    $scope.initData();
    $scope.listOrganization = [
        { Code: '', Name: 'SCP_LBL_CUS_TYPE' },
        {
            Code: "Individual",
            Name: "Cá nhân"
        }, {
            Code: "Organization",
            Name: "Tổ chức"
        }];
    $scope.listServiceUser = [];
    $scope.listServiceEmployee = [];
    $scope.listServiceCategory = [];
    $scope.WarningData = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.isOrganization = false;
    $scope.Id;

    $scope.setIsOrganization = function () {
        if ($scope.model.OrganizationCode == "Organization") {
            $scope.isOrganization = true;
        } else {
            $scope.isOrganization = false;
        }
    }
    function makeColumnsResizable() {
        var thElements = $(".resizeable");
        thElements.each(function (index) {
            $(this).resizable({
                handles: "e",
                minHeight: 200,
            });
        });
    }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ServiceRegist/Jtable",
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
                d.code = $scope.model.code;
                d.name = $scope.model.name;
                d.parenid = $scope.model.parenid;
                d.BeginTime = $scope.model.BeginTime;
                d.EndTime = $scope.model.EndTime;
                d.CatCode = $scope.model.CatParent;
                d.ObjectCode = $scope.model.ObjectCode;
                d.PaymentStatus = $scope.model.PaymentStatus;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        }).withOption('autoWidth', false)
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
            makeColumnsResizable()
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

    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withOption('sClass', 'w20').withTitle('{{"STT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CustomerName').withOption('sClass', 'resizeable').withTitle('{{"SCP_LBL_CUS_NAME" | translate}}').renderWith(function (data, type, full) {
        if (full.ObjectType != 'Organization') {
            return '<span>' + data + '<p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã khách hàng: " + full.ObjectCode + "]" + '</p>'
                + '<p style="color: green; font-weight: bold; font-size: 9px;">' + "[Loại khách hàng: Cá nhân]" + '</p>' + '</span>';
        } else {
            return '<span>' + data + '<p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã khách hàng: " + full.ObjectCode + "]" + '</p>'
                + '<p style="color: green; font-weight: bold; font-size: 9px;">' + "[Loại khách hàng: Tổ chức]" + '</p>' + '</span>';
        }
    }).withOption());
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceName').withOption('sClass', 'resizeable').withTitle('{{"SCP_LBL_SERVICE_NAME" | translate}}').renderWith(function (data, type, full) {
        return '<span>' + data + '<p style="color: #0000FF; font-weight: bold; display: inline; font-size: 9px;">' + " [Mã dịch vụ: " + full.ServiceCode + "]" + '</p>' + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withOption('sClass', 'w100 resizeable').withTitle('{{"SCP_TXT_STATUS" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sWidth', '100px'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BeginTime').withOption('sClass', 'w100 resizeable').withTitle('{{"SCP_CURD_TXT_SEFFECTIVE_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withOption('sClass', 'w100 resizeable').withTitle('{{"SCP_CURD_TXT_SEXPIRY_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceType').withOption('sClass', 'w100 resizeable').withTitle('{{"SCP_CURD_TXT_SEXPIRY_DATE" | translate}}').renderWith(function (data, type, full) {
        var beginTime = new Date(full.BeginTime);
        var endTime = new Date(full.EndTime);
        var today = new Date();
        var style = ''; // Thêm style nhấp nháy

        if (endTime < today) {
            return '<span class="badge-customer badge-customer-danger bold" style="' + style + '">Đã quá hạn</span>';
        } else if (endTime < today.setMonth(today.getMonth() + 1)) {
            return '<span class="badge-customer badge-customer-warning bold" style="' + style + '">Gần hết hạn</span>';
        } else {
            return '<span class="badge-customer badge-customer-success bold" style="' + style + '">Còn hiệu lực</span>';
        }
    }));


    vm.dtColumns.push(DTColumnBuilder.newColumn('PaymentStatus').withOption('sClass', 'w70 resizeable').withTitle('{{"SCG_COL_PAYMENT_STATUS" | translate}}').renderWith(function (data, type) {
        if (data == "Đã thanh toán") {
            return '<p style="color: green; font-weight: bold;">' + data + '</p>';
        } else {
            return '<p style="color: red; font-weight: bold;">' + data + '</p>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"SCG_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Chỉnh sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }).withOption('sWidth', '200px'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {
        makeColumnsResizable();
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
            size: '50',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (Id) {
        dataservice.getServiceByID(Id, function (rs) {
            rs = rs.data;
            console.log(rs)
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
                    size: '50',
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

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteServiceRegist(id, function (rs) {
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
    $scope.search = function () {
        console.log($scope.listServiceCategory);
        reloadData(true);
    }
    $scope.doc;

    function jsPDFLoaded() {
        // Thư viện jsPDF đã tải hoàn tất ở đây
        $scope.doc = new jsPDF();
        // Các thao tác khác với jsPDF

    }
    // $scope.exportToPDF = function () {
    //     // Get the table element by its ID
    //     var table = document.getElementById("tblData");

    //     // Get the table body
    //     var tbody = table.getElementsByTagName("tbody")[0];

    //     // Get all rows in the table body
    //     var rows = tbody.getElementsByTagName("tr");

    //     // Create an array to store the data
    //     var data = [];

    //     // Loop through the rows and extract data from each cell
    //     for (var i = 0; i < rows.length; i++) {
    //         var cells = rows[i].getElementsByTagName("td");
    //         var rowData = [];

    //         for (var j = 0; j < cells.length; j++) {
    //             rowData.push(cells[j].textContent);
    //         }

    //         data.push(rowData);
    //     }
    //     $scope.dataExport = "";
    //     if (data.length > 0) {
    //         for (var j = 0; j < data.length; j++) {
    //             $scope.dataExport += data[j] + ",";
    //         }
    //         location.href = `/Admin/Inventory/Export?listId=${$scope.dataExport}&groupType="OTHER"`;
    //     }
    //     else {
    //         App.toastrError("Không sản phẩm nào được chọn")
    //     }

    //     console.log(data);
    // };

    $scope.exportToExcel = function () {
        location.href = `/Admin/ServiceRegist/GeneratePdf?BeginTime=${$scope.model.BeginTime}&EndTime=${$scope.model.EndTime}&PaymentStatus=${$scope.model.PaymentStatus}&ObjectCode=${$scope.model.ObjectCode}`;
    }

    $scope.exportToPdf = function () {
        location.href = `/Admin/ServiceRegist/GeneratePdf?BeginTime=${$scope.model.BeginTime}&EndTime=${$scope.model.EndTime}&PaymentStatus=${$scope.model.PaymentStatus}&ObjectCode=${$scope.model.ObjectCode}`;

        // Tạo yêu cầu GET bằng AJAX để tải tệp PDF
        // $.ajax({
        //     url: `/Admin/ServiceRegist/GeneratePdf?BeginTime=${$scope.model.BeginTime}&EndTime=${$scope.model.EndTime}&PaymentStatus=${$scope.model.PaymentStatus}&ObjectCode=${$scope.model.ObjectCode}`,
        //     type: 'GET',
        //     responseType: 'arraybuffer', // Đặt kiểu dữ liệu trả về là mảng byte
        //     success: function (data) {
        //         // Tạo tệp tin từ dữ liệu và tên tệp PDF
        //         var blob = new Blob([data], { type: 'application/pdf' });
        //         var fileName = 'generated.pdf';

        //         // Tạo một đường dẫn URL tạm thời để tải tệp PDF
        //         var url = window.URL.createObjectURL(blob);

        //         // Tạo một thẻ a để thực hiện việc tải tệp PDF
        //         var a = document.createElement('a');
        //         a.href = url;
        //         a.download = fileName;
        //         document.body.appendChild(a);
        //         a.click();

        //         // Xóa đường dẫn URL tạm thời sau khi tải xong
        //         window.URL.revokeObjectURL(url);
        //     },
        //     error: function () {
        //         alert('Đã xảy ra lỗi khi tạo tệp PDF.');
        //     }
        // });
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
        Status: '',
        BeginTime: '',
        EndTime: '',
        ObjectType: '',
        ObjectCode: '',
        PaymentStatus: '',
        ServiceType: '',
        ServiceCode: '',
        WarningType: '',
        IsServcieAdditional: false,
        ListServiceAdditional: ''
    }
    $scope.$watchGroup(['model.BeginTime', 'model.EndTime', 'model.ObjectType', 'model.ServiceCode'], function (newValues) {
        var allHaveData = newValues.every(function (value) {
            return value !== undefined && value !== null && value != '';
        });

        if (allHaveData) {
            // Gọi hàm của bạn ở đây
            $scope.pricing();
            $scope.TotalPricef()
        }
    });
    $scope.ServiceCodeHeader = null
    $scope.StartPrice = 0;
    $scope.ServiceAdd2=''
    $scope.listCondition=[]
    $scope.ServiceAdditional=[]
    $scope.onServiceAddSelect=function(select){
        console.log(select);
        $scope.ServiceAdditional=select;
        $scope.ServiceAdd2=null
    }    
    $scope.onServiceAddSelect2=function(select){
        console.log(select);
        $scope.ServiceAdd2=select;
    }
    $scope.$watch('model.IsServcieAdditional', function (newVal, oldval) {
        if ($scope.ServiceCodeHeader != null)
            if (newVal) {
                $scope.GetListServiceAdditional();
                $scope.StartPrice = $scope.ServiceCodeHeader.Group.Extent.Price
            }
            else {
                $scope.StartPrice = $scope.ServiceCodeHeader.Group.Normal.Price
            }
        $scope.TotalPricef()
    });
    $scope.$watch('ServiceAdditional', function (newVal, oldval) {
        if ($scope.ServiceAdditional != null)
            console.log($scope.ServiceAdditional)
    });
    $scope.GetListServiceAdditional = function () {
        dataservice.PriceByServiceCode($scope.model.ServiceCode, $scope.ServiceCodeHeader.HeaderCode, function (data) {
            data = data.data,
                $scope.listServiceAdditional = data;
            console.log(data)
        })
    }
    $scope.AdditionalSelect = [];
    $scope.TotalPrice = 0;
    $scope.PriceNormal = 0;
    $scope.TotalPricef = function () {
        $scope.TotalPrice = 0;
        if ($scope.StartPrice != 0) {
            $scope.TotalPrice += $scope.StartPrice;
        }
        for (var key in $scope.dataTable) {
            $scope.TotalPrice += $scope.dataTable[key].Price;
        }
    };
    $scope.SeviceCatPrice = '';

    $scope.showServices = function (key, selected) {
        console.log($scope.ServiceAdd)
    }
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

    $scope.listWarningType = [
        { Code: '', Name: 'Loại cảnh báo' },
        {
            Code: "SMS",
            Name: "Tin nhắn thoại"
        },
        {
            Code: "Mail",
            Name: "Email"
        },
    ];

    $scope.services = [];
    $rootScope.serviceCost = [];
    $scope.serviceCost = [];
    $scope.serviceTotalCost = [];
    $scope.serviceDetails = [];
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.ServiceCode == "" || data.ServiceCode == null || data.ServiceCode == undefined) {
            $scope.errorServiceCode = true;
            mess.Status = true;
        } else {
            $scope.errorServiceCode = false;
        }

        if (data.ObjectType == "" || data.ObjectType == null || data.ObjectType == undefined) {
            $scope.errorObjectType = true;
            mess.Status = true;
        } else {
            $scope.errorObjectType = false;
        }

        if (data.ObjectCode == "" || data.ObjectCode == null || data.ObjectCode == undefined) {
            $scope.errorObjectCode = true;
            mess.Status = true;
        } else {
            $scope.errorObjectCode = false;
        }

        if (data.BeginTime == "" || data.BeginTime == null || data.BeginTime == undefined || !dateIsValid(data.BeginTime)) {
            $scope.errorBeginTime = true;
            mess.Status = true;
        } else {
            $scope.errorBeginTime = false;
        }

        if (data.EndTime == "" || data.EndTime == null || data.EndTime == undefined || !dateIsValid(data.EndTime)) {
            $scope.errorEndTime = true;
            mess.Status = true;
        } else {
            $scope.errorEndTime = false;
        }

        if (data.PaymentStatus == "" || data.PaymentStatus == null || data.PaymentStatus == undefined) {
            $scope.errorPaymentStatus = true;
            mess.Status = true;
        } else {
            $scope.errorPaymentStatus = false;
        }

        if (data.ServiceType == "" || data.ServiceType == null || data.ServiceType == undefined) {
            $scope.errorServiceType = true;
            mess.Status = true;
        } else {
            $scope.errorServiceType = false;
        }
        return mess;
    }
    $scope.pricing = function () {
        dataservice.GetServiceCostHeader($scope.model, function (data) {
            data = data.data;
            console.log(data)
            if (!data.Error) {
                $scope.ServiceCodeHeader = data.Object
                if ($scope.model.IsServcieAdditional) {
                    $scope.StartPrice = $scope.ServiceCodeHeader.Group.Extent.Price
                }
                else {
                    $scope.StartPrice = $scope.ServiceCodeHeader.Group.Normal.Price
                }
                $scope.PriceNormal = $scope.ServiceCodeHeader.Group.Normal.Price
                $scope.TotalPricef()
            } else {
                App.toastrError(data.Title);
            }
            $scope.AdditionalSelect = [];
        })
    }
    $scope.changeAdditional = function (service, selected) {
        // service là đối tượng service chứa thông tin về dịch vụ
        // selected là dịch vụ đã được chọn trong ui-select

        // Thực hiện xử lý tùy theo dịch vụ đã chọn và service
        console.log("Service:", service);
        console.log("Dịch vụ đã chọn:", selected);

        // Đoạn mã xử lý tùy theo dịch vụ đã chọn và service
    };

    $scope.listObjectType = [
        { Code: '', Name: 'Chọn kiểu' },
        {
            Code: "Individual",
            Name: "Cá nhân"
        }, {
            Code: "Organization",
            Name: "Tổ chức"
        }];
    $scope.listStatus = [
        {
            Code: "Active",
            Name: "Kích hoạt"
        }, {
            Code: "Non Active",
            Name: "Không kích hoạt"
        }];
    $scope.listServiceType = [
        { Code: '', Name: 'Chọn kiểu dịch vụ' },
        {
            Code: "None",
            Name: "Re new None"
        }, {
            Code: "Daily",
            Name: "Re new Daily"
        },
        {
            Code: "Weekly",
            Name: "Re new Weekly"
        },
        {
            Code: "Monthly",
            Name: "Re new Monthly"
        },
        {
            Code: "Annual",
            Name: "Re new Annual"
        }];
    $scope.listServiceUser = [];
    $scope.listServiceCategory = [];
    $scope.listServiceEmployee = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.Id;
    $scope.oldServiceName = $scope.model.ServiceCode;

    $scope.isOrganization = false;

    $scope.setIsOrganization = function () {
        $scope.model.ObjectCode = '';
        if ($scope.model.ObjectType == "Organization") {
            $scope.isOrganization = true;
        } else {
            $scope.isOrganization = false;
        }
    }
    $scope.dataTable=[]

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
    .withPaginationType('full_numbers')
    .withDOM("<'table-scrollable't>ip")
    .withDisplayLength(pageLength)
    .withOption('order', [0, 'desc'])
    .withOption('serverSide', false) // Tắt chế độ server-side
    .withDataProp('data') // Đặt tên thuộc tính chứa dữ liệu trong mảng
    .withOption('data', $scope.dataTable)
    .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
    })
    .withOption('createdRow', function (row, data, dataIndex) {
        const contextScope = $scope.$new(true);
        contextScope.data = data;
        contextScope.contextMenu = $scope.contextMenu;
        $compile(angular.element(row).contents())($scope);
        $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
    })

// Cấu hình các cột tương tự như trước
vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('Tên dịch vụ').renderWith(function (data, type) {
        return data.ObjectName;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('Ràng buộc').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Price').withTitle('Giá').renderWith(function (data, type) {
        return $filter('currency')(data, '', 0)
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"SCG_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<a title="Xoá" ng-click="$event.stopPropagation();deleteData(' + meta.row + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }).withOption('sWidth', '200px'));
    
    vm.deleteData = function(index){
        console.log('Clicked delete for row:', index);
        var dataToDelete = $scope.dataTable[index];
        // Tiến hành xóa dataToDelete
        $scope.dataTable.splice(index, 1);  
        $scope.TotalPricef();
        $scope.reloadTable()
    }

    vm.addData = function () {
        
        //Validate
        
        if ($scope.ServiceAdd2==null) {
            // ServiceName đã tồn tại, báo lỗi hoặc thực hiện hành động phù hợp
            alert('Bạn chưa chọn dịch vụ nâng cao');
            return;
        }
        var objIndex = $scope.dataTable.findIndex(item => (
                item.Group.ObjectCode == $scope.ServiceAdd2.Group.ObjectCode&&
                item.Group.ObjectName == $scope.ServiceAdd2.Group.ObjectName
            ));

        if (objIndex !== -1) {
            var obj = $scope.dataTable[objIndex];
            // Cập nhật lại các thuộc tính của obj
            obj.CodeHeader = ''; // Cập nhật các giá trị cần thiết
            obj.Price= $scope.ServiceAdd2.Price;
            obj.Name= $scope.ServiceAdd2.Name;
            obj.ObjFromValue=$scope.ServiceAdd2.ObjFromValue
            obj.ObjToValue=$scope.ServiceAdd2.ObjToValue
        } 
        else{
            // Nếu không tìm thấy, thêm dữ liệu mới
            var newData = {
                CodeHeader: '',
                Name: $scope.ServiceAdd2.Name,
                Price: $scope.ServiceAdd2.Price,
                ObjFromValue: $scope.ServiceAdd2.ObjFromValue,
                ObjToValue: $scope.ServiceAdd2.ObjToValue,
                Group: $scope.ServiceAdd2.Group,
            };
          
            $scope.dataTable.push(newData);
        }
        
        $scope.TotalPricef()
        // Cập nhật bảng DataTables để hiển thị dữ liệu mới
        var table = $('#tblData1').DataTable(); // Thay thế 'yourDataTable' bằng ID thực tế của bảng
        table.draw();
      };
      
    

        
    vm.reloadData = reloadData;
    vm.dtInstance = {};
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
        dataservice.getServiceCondition(function (rs) {
            rs = rs.data;
            //$rootScope.serviceConditions = rs;
            for (var i = 0; i < rs.length; ++i) {
                var item = rs[i];
                if (item.Priority != null && (1 <= item.Priority && item.Priority <= 4)) {
                    $rootScope.excludeCondition[item.Code] = item.Priority;
                    $rootScope.unExcludeCondition[item.Priority] = item.Code;
                }
            }
        });
        //dataservice.gettreedataCoursetype(function (result) {result=result.data;
        //    $scope.treedataCoursetype = result.Object;
        //});
    }
    $scope.initData();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    // Lưu trữ giá trị ban đầu

    $scope.$watch('model.ServiceCode', function (newValue, oldValue) {
        if (newValue !== $scope.oldServiceName) {
            // Giá trị của Service Name đã thay đổi
            $scope.model.IsServcieAdditional = false; // Đặt checkbox thành unchecked
            $scope.dataTable.splice(0, $scope.dataTable.length);
        }
        $scope.oldServiceName = newValue; // Cập nhật giá trị tạm thời
    });

    $scope.updateCheckbox = function () {
        // Không cần thay đổi trạng thái của checkbox ở đây
       
    }


    $scope.submit = function () {
        console.log($scope.model);
        if (!validationSelect($scope.model).Status) {
            if ($scope.model.IsServcieAdditional) {
                var selectedData = [];
                for (var key in $scope.dataTable) {
                    if ($scope.dataTable.hasOwnProperty(key)) {
                        var item = $scope.dataTable[key];
                        selectedData.push({
                            CodeHeader: $scope.ServiceCodeHeader.HeaderCode,
                            Name: item.Name,
                            Price: item.Price,
                            Group: item.Group,
                            ObjFromValue:item.ObjFromValue,
                            ObjToValue:item.ObjToValue
                        });
                    }
                }
                var additionalSelectJson = JSON.stringify(selectedData);

                $scope.model.ListServiceAdditional = additionalSelectJson;
            }
            dataservice.insert($scope.model, function (rs) {
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
    }
    $scope.sumitsearch = function () {
        reloadData(true)
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
    function dateIsValid(dateStr) {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;

        if (dateStr.match(regex) === null) {
            return false;
        }

        const [day, month, year] = dateStr.split('/');

        // 👇️ format Date string as `yyyy-mm-dd`
        const isoFormattedStr = `${year}-${month}-${day}`;

        const date = new Date(isoFormattedStr);

        const timestamp = date.getTime();

        if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
            return false;
        }
        return date.toISOString().startsWith(isoFormattedStr);
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
app.controller('edit', function ($timeout,$scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate, $window, $uibModalInstance, para) {
    var vm = $scope;
    $scope.model = {
        Status: para.obj.Status,
        BeginTime: $filter('date')(new Date(para.obj.BeginTime), 'dd/MM/yyyy'),
        EndTime: $filter('date')(new Date(para.obj.EndTime), 'dd/MM/yyyy'),
        ObjectType: para.obj.ObjectType,
        ObjectCode: para.obj.ObjectCode,
        PaymentStatus: para.obj.PaymentStatus,
        ServiceType: para.obj.ServiceType,
        ServiceCode: para.obj.ServiceCode,
        IsServcieAdditional: !(para.obj.LogPay == null || para.obj.LogPay == undefined || para.obj.LogPay == ''),
        ListServiceAdditional: para.obj.LogPay
    }
    $scope.warning = {
        BeginTime: $scope.model.BeginTime,
        EndTime: $scope.model.EndTime,
        ServiceType: $scope.model.ServiceType,
        PaymentStatus: $scope.model.PaymentStatus,
    }
    $scope.TotalPricef = function () {
        $scope.TotalPrice = 0;
        if ($scope.StartPrice != 0) {
            $scope.TotalPrice += $scope.StartPrice;
        }
        for (var key in $scope.dataTable) {
            if ($scope.dataTable.hasOwnProperty(key)) {
                $scope.TotalPrice += $scope.dataTable[key].Price;
            }
        }
    };
    $scope.onServiceAddSelect=function(select){
        console.log(select);
        $scope.ServiceAdditional=select;
        $scope.ServiceAdd2=null
    }    
    $scope.onServiceAddSelect2=function(select){
        console.log(select);
        $scope.ServiceAdd2=select;
    }
    $scope.dataTable= [];
    $scope.initData = function () {
        $scope.setIsOrganization()
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
        dataservice.CheckSubscription($scope.warning, function (rs) {
            rs = rs.data;
            console.log(rs);
            $scope.MessageAlert = rs;
            $scope.showSubscriptionAlert = true;
        });

        if ($scope.model.IsServcieAdditional) {
            var dataTable=JSON.parse(para.obj.LogPay)
            dataTable.forEach(item=>{
                $scope.dataTable.push(item)
            })
            $scope.pricing()
            console.log($scope.dataTable)
            setTimeout(function() {
                $scope.GetListServiceAdditional();
            }, 1000)
        }
    }
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

    vm.addData = function () {
        
        //Validate
        
        if ($scope.ServiceAdd2==null) {
            // ServiceName đã tồn tại, báo lỗi hoặc thực hiện hành động phù hợp
            alert('Bạn chưa chọn dịch vụ nâng cao');
            return;
        }
        var objIndex = $scope.dataTable.findIndex(item => (
                item.Group.ObjectCode == $scope.ServiceAdd2.Group.ObjectCode&&
                item.Group.ObjectName == $scope.ServiceAdd2.Group.ObjectName
            ));

        if (objIndex !== -1) {
            var obj = $scope.dataTable[objIndex];
            // Cập nhật lại các thuộc tính của obj
            obj.CodeHeader = ''; // Cập nhật các giá trị cần thiết
            obj.Price= $scope.ServiceAdd2.Price;
            obj.Name= $scope.ServiceAdd2.Name;
            obj.ObjFromValue=$scope.ServiceAdd2.ObjFromValue
            obj.ObjToValue=$scope.ServiceAdd2.ObjToValue
        } 
        else{
            // Nếu không tìm thấy, thêm dữ liệu mới
            var newData = {
                CodeHeader: '',
                Name: $scope.ServiceAdd2.Name,
                Price: $scope.ServiceAdd2.Price,
                ObjFromValue: $scope.ServiceAdd2.ObjFromValue,
                ObjToValue: $scope.ServiceAdd2.ObjToValue,
                Group: $scope.ServiceAdd2.Group,
            };
          
            $scope.dataTable.push(newData);
        }
        
        $scope.TotalPricef()
        // Cập nhật bảng DataTables để hiển thị dữ liệu mới
        var table = $('#tblData2').DataTable(); // Thay thế 'yourDataTable' bằng ID thực tế của bảng
        table.draw();
      };
      
    $scope.$watchGroup(['model.BeginTime', 'model.EndTime', 'model.ServiceCode'], function (newValues) {
        var allHaveData = newValues.every(function (value) {
            return value !== undefined && value !== null && value != '';
        });

        if (allHaveData) {
            // Gọi hàm của bạn ở đây
            $scope.pricing();
        }
    });
    $scope.ServiceCodeHeader = null
    $scope.StartPrice = 0;
    $scope.GetListServiceAdditional = function () {
        dataservice.PriceByServiceCode($scope.model.ServiceCode, $scope.ServiceCodeHeader.HeaderCode, function (data) {
            data = data.data,
                $scope.listServiceAdditional = data;
            var List = JSON.parse($scope.model.ListServiceAdditional);
            if (List.length > 0) {
                $scope.listServiceAdditional.forEach(function (item) {
                    item.forEach(function (item2) {
                        {
                            console.log(item2)
                            var rs = List.find(function (x) {
                                return item2.Name == x.Name
                            });
                            if (rs) {
                                item.selected = true
                                $scope.AdditionalSelect[item2.Group.ObjectCode] = item2
                            }
                        }
                    })
                })
                $scope.TotalPricef()
            }
        })
        
    }
    $scope.$watch('model.IsServcieAdditional', function (newVal, oldval) {
        if ($scope.ServiceCodeHeader != null)
            if (newVal) {
                $scope.GetListServiceAdditional();
                $scope.StartPrice = $scope.ServiceCodeHeader.Group.Extent.Price
            }
            else {
                $scope.StartPrice = $scope.ServiceCodeHeader.Group.Normal.Price
            }
        $scope.TotalPricef()
    });

    console.log(para);
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.ServiceCode == "" || data.ServiceCode == null || data.ServiceCode == undefined) {
            $scope.errorServiceCode = true;
            mess.Status = true;
        } else {
            $scope.errorServiceCode = false;
        }


        if (data.BeginTime == "" || data.BeginTime == null || data.BeginTime == undefined || !dateIsValid(data.BeginTime)) {
            $scope.errorBeginTime = true;
            mess.Status = true;
        } else {
            $scope.errorBeginTime = false;
        }

        if (data.EndTime == "" || data.EndTime == null || data.EndTime == undefined || !dateIsValid(data.EndTime)) {
            $scope.errorEndTime = true;
            mess.Status = true;
        } else {
            $scope.errorEndTime = false;
        }

        if (data.PaymentStatus == "" || data.PaymentStatus == null || data.PaymentStatus == undefined) {
            $scope.errorPaymentStatus = true;
            mess.Status = true;
        } else {
            $scope.errorPaymentStatus = false;
        }

        if (data.ServiceType == "" || data.ServiceType == null || data.ServiceType == undefined) {
            $scope.errorServiceType = true;
            mess.Status = true;
        } else {
            $scope.errorServiceType = false;
        }
        return mess;
    }
    $scope.AdditionalSelect = [];

    $scope.SeviceCatPrice = '';

    $scope.showServices = function (key, selected) {
        console.log(key)
    }
    $scope.pricing = function () {
        dataservice.GetServiceCostHeader($scope.model, function (data) {
            data = data.data;
            console.log(data)
            if (!data.Error) {
                $scope.ServiceCodeHeader = data.Object
                if ($scope.model.IsServcieAdditional) {
                    $scope.StartPrice = $scope.ServiceCodeHeader.Group.Extent.Price
                }
                else {
                    $scope.StartPrice = $scope.ServiceCodeHeader.Group.Normal.Price
                }
                $scope.PriceNormal = $scope.ServiceCodeHeader.Group.Normal.Price
                $scope.TotalPricef()
            } else {
                App.toastrError(data.Title);
            }
            $scope.AdditionalSelect = [];
        })
    }
    $scope.PriceNormal = 0;
    $scope.changeAdditional = function (service, selected) {
        // service là đối tượng service chứa thông tin về dịch vụ
        // selected là dịch vụ đã được chọn trong ui-select

        // Thực hiện xử lý tùy theo dịch vụ đã chọn và service
        console.log("Service:", service);
        console.log("Dịch vụ đã chọn:", selected);
        // Đoạn mã xử lý tùy theo dịch vụ đã chọn và service
    };
    $scope.Id = para.obj.Id;
    $scope.Customer = para.cus;
    $scope.oldServiceName = $scope.model.ServiceCode;
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

    $scope.listWarningType = [
        { Code: '', Name: 'Loại cảnh báo' },
        {
            Code: "SMS",
            Name: "Tin nhắn thoại"
        },
        {
            Code: "Mail",
            Name: "Email"
        },
    ];

    $scope.listObjectType = [
        { Code: '', Name: 'Chọn kiểu' },
        {
            Code: "Individual",
            Name: "Cá nhân"
        }, {
            Code: "Organization",
            Name: "Tổ chức"
        }];
    $scope.listStatus = [
        {
            Code: "Active",
            Name: "Kích hoạt"
        }, {
            Code: "Non Active",
            Name: "Không kích hoạt"
        }];
    $scope.listServiceType = [
        { Code: '', Name: 'Chọn kiểu dịch vụ' },
        {
            Code: "None",
            Name: "Re new None"
        }, {
            Code: "Daily",
            Name: "Re new Daily"
        },
        {
            Code: "Weekly",
            Name: "Re new Weekly"
        },
        {
            Code: "Monthly",
            Name: "Re new Monthly"
        },
        {
            Code: "Annual",
            Name: "Re new Annual"
        }];

    $scope.listServiceUser = [];
    $scope.listServiceCategory = [];
    $scope.listServiceEmployee = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.isOrganization = false;
    $scope.showSubscriptionAlert = false;
    $scope.setIsOrganization = function () {
        if ($scope.model.ObjectType == "Organization") {
            $scope.isOrganization = true;
        } else {
            $scope.isOrganization = false;
        }
    }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
    .withPaginationType('full_numbers')
    .withDOM("<'table-scrollable't>ip")
    .withDisplayLength(pageLength)
    .withOption('order', [0, 'desc'])
    .withOption('data', $scope.dataTable)
    .withOption('headerCallback', function (header) {
        $compile(angular.element(header).contents())($scope);
    })
    .withOption('createdRow', function (row, data, dataIndex) {
        const contextScope = $scope.$new(true);
        contextScope.data = data;
        contextScope.contextMenu = $scope.contextMenu;
        $compile(angular.element(row).contents())($scope);
        $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
    })

// Cấu hình các cột tương tự như trước
vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('Tên dịch vụ').renderWith(function (data, type) {
        return data.ObjectName;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('Ràng buộc').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Price').withTitle('Giá').renderWith(function (data, type) {
        return $filter('currency')(data, '', 0)
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"SCG_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<a title="Xoá" ng-click="$event.stopPropagation();deleteData(' + meta.row + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }).withOption('sWidth', '200px'));
    
    vm.deleteData = function(index){
        console.log('Clicked delete for row:', index);
        var dataToDelete = $scope.dataTable[index];
        // Tiến hành xóa dataToDelete
        $scope.dataTable.splice(index, 1);  
        $scope.TotalPricef(); 
        var table = $('#tblData2').DataTable();
        table.draw();
    }


    $scope.setIsOrganization = function () {
        if ($scope.model.ObjectType == "Organization") {
            $scope.isOrganization = true;
        } else {
            $scope.isOrganization = false;
        }
    }

    vm.reloadData = reloadData;
    vm.dtInstance = {};
    $scope.initData();


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.submit = function () {
        if (validationSelect($scope.model)) {
            if (!validationSelect($scope.model).Status) {
                if ($scope.model.IsServcieAdditional) {
                    var selectedData = [];
                    for (var key in $scope.dataTable) {
                        if ($scope.dataTable.hasOwnProperty(key)) {
                            var item = $scope.dataTable[key];
                            selectedData.push({
                                CodeHeader: $scope.ServiceCodeHeader.HeaderCode,
                                Name: item.Name,
                                Price: item.Price,
                                Group: item.Group,
                                ObjFromValue:item.ObjFromValue,
                                ObjToValue:item.ObjToValue
                            });
                        }
                    }
                    var additionalSelectJson = JSON.stringify(selectedData);
    
                    $scope.model.ListServiceAdditional = additionalSelectJson;
                }
                dataservice.update($scope.Id, $scope.model, function (rs) {
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
        }
    }
        $scope.$watch('model.ServiceCode', function (newValue, oldValue) {
        if (newValue !== $scope.oldServiceName) {
            // Giá trị của Service Name đã thay đổi
            $scope.model.IsServcieAdditional = false; // Đặt checkbox thành unchecked
            $scope.dataTable.splice(0, $scope.dataTable.length);
        }
        $scope.oldServiceName = newValue; // Cập nhật giá trị tạm thời
        });

        $scope.updateCheckbox = function () {
            // Không cần thay đổi trạng thái của checkbox ở đây
            // $scope.dataTable=[];
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

        function dateIsValid(dateStr) {
            const regex = /^\d{2}\/\d{2}\/\d{4}$/;

            if (dateStr.match(regex) === null) {
                return false;
                return false;
            }

            const [day, month, year] = dateStr.split('/');

            // 👇️ format Date string as `yyyy-mm-dd`
            const isoFormattedStr = `${year}-${month}-${day}`;

            const date = new Date(isoFormattedStr);

            const timestamp = date.getTime();


            if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
                return false;
                return false;
            }
            return date.toISOString().startsWith(isoFormattedStr);
        }


        $scope.showSubscriptionModal = false;

        // Hàm đóng modal
        $scope.dongModal = function () {
            $scope.showSubscriptionModal = false;
        }

        // Hàm xử lý khi người dùng đồng ý gia hạn dịch vụ
        $scope.giaHanDichVu = function () {

            // Thực hiện xử lý gia hạn dịch vụ ở đây
            // Sau khi xử lý xong, có thể đóng modal bằng cách gọi $scope.dongModal()
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
//

