var ctxfolder = "/views/admin/CategoryCareer";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    };

    return {
        getPayScaleCat: function (callback) {
            $http.get('/Admin/SalaryScale/GetPayScaleCat').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/CategoryCareer/GetUser').then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/CategoryCareer/Insert/', data).then(callback);
        },
        insertCareerGroup: function (data, callback) {
            $http.post('/Admin/CategoryCareer/InsertCareerGroup/', data).then(callback);
        },
        insertCareerCatScale: function (data, callback) {
            $http.post('/Admin/CategoryCareer/InsertCareerCatScale/', data).then(callback);
        },
        updateCareerGroup: function (data, callback) {
            $http.post('/Admin/CategoryCareer/UpdateCareerGroup/', data).then(callback);
        },
        deleteCareerGroup: function (data, callback) {
            $http.post('/Admin/CategoryCareer/DeleteCareerGroup/', data).then(callback);
        },
        insertCareerType: function (data, callback) {
            $http.post('/Admin/CategoryCareer/InsertCareerType/', data).then(callback);
        },
        getListCategory: function (callback) {
            $http.post('/Admin/CategoryCareer/GetListCategory').then(callback);
        },
        updateCareerType: function (data, callback) {
            $http.post('/Admin/CategoryCareer/UpdateCareerType/', data).then(callback);
        },
        deleteCareerType: function (data, callback) {
            $http.post('/Admin/CategoryCareer/DeleteCareerType/', data).then(callback);
        },
        update: function (data, callback) {

            $http.post('/Admin/CategoryCareer/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/CategoryCareer/Delete/', data).then(callback);
        },
        getNhanvienFiled: function (callback) {
            $http.post('/Admin/CategoryCareer/GetNhanvienFiled/').then(callback);
        },
        getPayGradesCode: function (callback) {
            $http.post('/Admin/CategoryCareer/GetPayGradesCode').then(callback);
        },
        getGroup: function (callback) {
            $http.post('/Admin/CategoryCareer/GetGroup/').then(callback);
        },
        getTypeD: function (callback) {
            $http.post('/Admin/CategoryCareer/GetTypeD/').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/CategoryCareer/GetItem/', data).then(callback);
        },
        updatePayScale: function (data, callback) {
            $http.post('/Admin/SalaryScale/UpdatePayScale/', data).then(callback);
        },
        insertPayScale: function (data, callback) {
            $http.post('/Admin/SalaryScale/InsertPayScale/', data).then(callback);
        },
        deletePayScale: function (data, callback) {
            $http.post('/Admin/SalaryScale/DeletePayScale/', data).then(callback);
        },

    };
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

        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            mess.Status = true;
            if (!partternCode.test(data.ActCode)) {
                mess.Title = mess.Title.concat(" - ", caption.CMS_CAT_VALIDATE_ITEM_CODE.replace('{0}', caption.AA_CURD_LBL_AA_ACTCODE), "<br/>");
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
                CareerCode: {
                    required: true,
                    regx: /^[^\s].*/
                },
                CareerName: {
                    required: true,
                    regx: /^[^\s].*/
                },
                CodeSet: {
                    required: true
                },
                ValueSet: {
                    required: true
                },
            },
            messages: {
                CareerCode: {
                    required: caption.CC_VALIDATE_CODE,
                    regx: 'Không nhập khoảng trắng'
                },
                CareerName: {
                    required: caption.CC_VALIDATE_CAREER_NAME,
                    regx: 'Không nhập khoảng trắng'
                },
                CodeSet: {
                    required: caption.CC_VALIDATE_CODESET,
                },
                ValueSet: {
                    required: caption.CC_VALIDATE_NAMESET,
                },

            }
        }
        $rootScope.IsTranslate = true;
    });
    dataservice.getTypeD(function (rs) {
        rs = rs.data;
        $rootScope.listCareerType = rs;
    });
    dataservice.getGroup(function (rs) {
        rs = rs.data;
        $rootScope.listCareerGroup = rs;
    })
    dataservice.getPayGradesCode(function (rs) {
        rs = rs.data;

        $rootScope.listPayGradesCode = rs;
    });
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CategoryCareer/Translation');

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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window, $filter) {
    var vm = $scope;
    $scope.model = {
        Id: '',
        CareerCode: '',
        CareerName: '',
        CareerGroup: '',
        CareerType: '',
        PayGradesCode: '',
        Note: '',

    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.listPublished = [
        {
            code: true,
            name: caption.CMS_CAT_DISPLAY
        }, {
            code: false,
            name: caption.CMS_CAT_NOT_DISPLAY
        }
    ];
    $scope.initData = function () {
        dataservice.getNhanvienFiled(function (rs) {
            rs = rs.data;
            $scope.listNhanvienFiled = rs;
        });
        dataservice.getListCategory(function (rs) {

            rs = rs.data.Object;
            $scope.listCategory = rs;
        })
    }
    $scope.initData();
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CategoryCareer/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CareerCode = $scope.model.CareerCode;
                d.CareerName = $scope.model.CareerName;
                d.CareerGroup = $scope.model.CareerGroup;
                d.CareerType = $scope.model.CareerType;
                d.PayGradesCode = $scope.model.PayGradesCode;

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
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        })
        .withOption('footerCallback', function (tfoot, data) {
            if (data.length > 0) {
                $scope.$apply(function () {
                    $scope.totalReceipts = 0;
                    $scope.totalPaymentSlip = 0;
                    angular.forEach(data, function (item, index) {
                        if (item.AetType == "Receipt") {
                            $scope.totalReceipts = parseFloat($scope.totalReceipts) + parseFloat(item.Total);
                        } else {
                            $scope.totalPaymentSlip = parseFloat($scope.totalPaymentSlip) + parseFloat(item.Total);
                        }
                    });
                });
            }
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CareerCode').withTitle('{{"CC_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CareerName').withTitle('{{"CC_LIST_COL_CAREER_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CareerGroup').withTitle('{{"CC_LIST_COL_GROUP_CAREER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CareerType').withTitle('{{"CC_LIST_COL_TYPE_CAREER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('List').withTitle('{{"CC_LIST_COL_SCALE_SALARY" | translate}}').renderWith(function (data, type) {
        return data;
    }));


    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
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
    };
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };
    $scope.add = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };

    $scope.publish = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.CMS_MSG_ERROR_YOU_SURE;
                $scope.ok = function () {
                    dataservice.approve(id, function (rs) {
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
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
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
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    };

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


    //xuất exel

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
    }

    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $filter, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {
        Id: '',
        CareerCode: '',
        CareerName: '',
        CareerGroup: '',
        CareerType: '',
        PayGradesCode: '',
        Note: '',
        Group: '',
        ValueSet: '',
        CodeSet: '',
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addData.validate() && !validationSelect($scope.model).Status) {
            dataservice.insert($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
            /*var obj = {
                CareerCode: $scope.model.CareerCode,
                PayScaleCode: $scope.model.PayGradesCode
            }
            dataservice.insertCareerCatScale(obj, function (rs) {
                

                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })*/
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "CareerGroup" && $scope.model.CareerGroup != "") {
            $scope.errorCareerGroup = false;
        }
        if (SelectType == "CareerType" && $scope.model.CareerType != "") {
            $scope.errorCareerType = false;
        }
        if (SelectType == "PayGradesCode" && $scope.model.PayGradesCode != "") {
            $scope.errorPayGradesCode = false;
        }
    }
    $scope.CareerType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + "/CareerType.html",
            controller: 'CareerType',
            size: '40',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CAREER_TYPE',
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.CareerRange = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + "/CareerRange.html",
            controller: 'CareerRange',
            size: '40',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.CareerGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + "/CareerGroup.html",
            controller: 'CareerGroup',
            size: '40',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CAREER_GROUP',
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.PayGradesCode = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + "/PayGradesCode.html",
            controller: 'PayGradesCode',
            size: '40',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'EMPLOYEE_STYLE',
                        GroupNote: 'Kiểu nhân viên',
                        AssetCode: 'EMPLOYEE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.init = function () {
        dataservice.getPayScaleCat(function (rs) {
            rs = rs.data;
            $scope.lstScaleCat = rs;
        });
    }

    $scope.init();

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.CareerGroup == "") {
            $scope.errorCareerGroup = true;
            mess.Status = true;
        } else {
            $scope.CareerGroup = false;
        }
        if (data.CareerType == "") {
            $scope.errorCareerType = true;
            mess.Status = true;
        } else {
            $scope.CareerType = false;
        }
        if (data.PayGradesCode == "") {
            $scope.errorPayGradesCode = true;
            mess.Status = true;
        } else {
            $scope.PayGradesCode = false;
        }
        return mess;
    };

    function initDateTime() {
        var now = new Date();
        $("#Date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            endDate: now,
        }).on('changeDate', function (selected) {
        });

    }
    
    setTimeout(function () {
        initDateTime();
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $filter, $confirm, $uibModalInstance, dataservice, para) {
    $scope.model = {
        Id: '',
        CareerCode: '',
        CareerName: '',
        CareerGroup: '',
        CareerType: '',
        Note: '',
        PayGradesCode: '',
    };

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "CareerGroup" && $scope.model.CareerGroup != "") {
            $scope.errorCareerGroup = false;
        }
        if (SelectType == "CareerType" && $scope.model.CareerType != "") {
            $scope.errorCareerType = false;
        }
        if (SelectType == "PayGradesCode" && $scope.model.PayGradesCode != "") {
            $scope.errorPayGradesCode = false;
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            $scope.model.Date = $filter('date')(new Date($scope.model.Date), 'dd/MM/yyyy');
        });
        dataservice.getPayScaleCat(function (rs) {
            rs = rs.data;
            $scope.lstScaleCat = rs;


        })
    }
    $scope.initData();
    $scope.submit = function () {
        /*var temp = $rootScope.checkData($scope.model);     
*/
        validationSelect($scope.model);
        if ($scope.editData.validate() && !validationSelect($scope.model).Status) {
            dataservice.update($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.CareerType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + "/CareerType.html",
            controller: 'CareerType',
            size: '40',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CAREER_TYPE',
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.CareerRange = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + "/CareerRange.html",
            controller: 'CareerRange',
            size: '40',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.CareerGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + "/CareerGroup.html",
            controller: 'CareerGroup',
            size: '40',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CAREER_GROUP',
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.CareerGroup == "") {
            $scope.errorCareerGroup = true;
            mess.Status = true;
        } else {
            $scope.CareerGroup = false;
        }
        if (data.CareerType == "") {
            $scope.errorCareerType = true;
            mess.Status = true;
        } else {
            $scope.CareerType = false;
        }
        if (data.PayGradesCode == "") {
            $scope.errorPayGradesCode = true;
            mess.Status = true;
        } else {
            $scope.PayGradesCode = false;
        }
        return mess;
    };
    function initDateTime() {
        var now = new Date();
        $("#Date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
            endDate: now,
        }).on('changeDate', function (selected) {
        });
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "CareerGroup" && $scope.model.CareerGroup != "") {
            $scope.errorCareerGroup = false;
        }
        if (SelectType == "CareerType" && $scope.model.CareerType != "") {
            $scope.errorCareerType = false;
        }
        if (SelectType == "PayGradesCode" && $scope.model.PayGradesCode != "") {
            $scope.erroPayGradesCode = false;
        }

    }
    setTimeout(function () {

        initDateTime();
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('CareerGroup', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',

    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CategoryCareer/JTableCareerGroup/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SettingGroup = para.Group;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.SettingId = data.SettingID;
                    $scope.model.CodeSet = data.CodeSet;
                    $scope.model.ValueSet = data.ValueSet;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingId").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CodeSet').withTitle('{{"CC_LIST_COL_GROUP_CODE" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"CC_LIST_COL_GROUP_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="delete(' + full.SettingID + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }


    $scope.add = function () {

        if ($scope.model.ValueSet == '' || $scope.model.CodeSet == '') {
            App.toastrError(caption.CC_MSG_ENTER_FULL_INFO);
        } else {
            dataservice.insertCareerGroup($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function (id) {
        if ($scope.model.CodeSet == '' || $scope.model.ValueSet == '') {
            App.toastrError(caption.CC_MSG_ENTER_FULL_INFO)
        } else {
            dataservice.updateCareerGroup($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteCareerGroup(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            reloadData(true);
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
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
        dataservice.getGroup(function (rs) {
            rs = rs.data;
            $rootScope.listCareerGroup = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('CareerType', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',

    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CategoryCareer/JTableCareerType/",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SettingGroup = para.Group;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.CodeSet = data.CodeSet;
                    $scope.model.ValueSet = data.ValueSet;
                    $scope.model.SettingId = data.SettingID;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingId").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CodeSet').withTitle('{{"CC_LIST_COL_TYPE_CODE" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"CC_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="delete(' + full.SettingID + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }



    $scope.add = function () {

        if ($scope.model.ValueSet == '' || $scope.model.CodeSet == '') {
            App.toastrError(caption.CC_MSG_ENTER_FULL_INFO);
        } else {
            dataservice.insertCareerType($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.CodeSet == '' || $scope.model.ValueSet == '') {
            App.toastrError(caption.CC_MSG_ENTER_FULL_INFO)
        } else {
            dataservice.updateCareerType($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteCareerType(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            reloadData(true);
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
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
        dataservice.getTypeD(function (rs) {
            rs = rs.data;
            $rootScope.listCareerType = rs;
        });
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('CareerRange', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    var vm = $scope;
    $scope.model = {
        PayScaleCode: '',
    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/SalaryScale/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PayScaleCode = para.PayScaleCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                    resetInput();
                } else {
                    $('#tblDataDetail').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.model.PayScaleCode = data.PayScaleCode;
                    $scope.model.Id = data.Id;

                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PayScaleCode').withTitle('{{"CC_LIST_COL_SCALE_SALARY" | translate}}').withOption('sClass').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('PayBase').withTitle('{{"CC_LIST_COL_BASE_SALARY" | translate}}').withOption('sClass', 'hidden').renderWith(function (data, type) {
        data = $filter('number')(data, '0');
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"CC_LIST_COL_UNIT" | translate}}').withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="Xoá" ng-click="deletePayScale(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
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
    function resetInput() {
        $scope.model.CodeSet = '';
        $scope.model.ValueSet = ''
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.deletePayScale = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {

                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deletePayScale(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            reloadData(true);

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
        }, function () {
        });
    };
    $scope.AddPayScale = function () {
        if ($scope.model.PayScaleCode == '') {
            App.toastrError(caption.CC_MSG_ENTER_FULL_INFO);
        } else {
            dataservice.insertPayScale($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reload();
                }
            })

        }
    }
    $scope.EditPayScale = function () {
        if ($scope.model.PayScaleCode == '') {
            App.toastrError(caption.CC_MSG_ENTER_SCALE_SALARY)
        } else {
            dataservice.updatePayScale($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.model.PayScaleCode = "";
                    $scope.model.PayBase = "";
                    $scope.model.Unit = "";
                    $scope.reload();
                    $scope.edit = false;
                }
            })
        }


    }
    $scope.add = function () {

        if ($scope.model.PayScaleCode == '') {
            App.toastrError(caption.CC_MSG_ENTER_SCALE_SALARY);
        } else {
            dataservice.insertCareerRange($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                }
            })
        }
    }
    $scope.edit = function () {
        if ($scope.model.PayScaleCode == '') {
            App.toastrError(caption.CC_MSG_ENTER_SCALE_SALARY)
        } else {
            dataservice.updateCareerRange($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    reloadData(true);
                    resetInput();
                }
            })
        }
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteCareerRange(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            reloadData(true);
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
            $rootScope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.cancel = function () {
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
        dataservice.getListCategory(function (rs) {

            rs = rs.data.Object;
            $scope.listCategory = rs;
        })
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

