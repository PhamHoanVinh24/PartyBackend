var ctxfolder = "/views/admin/catactivity";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
    });
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
        insert: function (data, callback) {
            $http.post('/Admin/CatActivity/Insert', data).then(callback);
        },
        insertcatactivity: function (data, callback) {
            $http.post('/Admin/CatActivity/InsertCatActivity', data).then(callback);
        },

        insertActAttrSetup: function (data, callback) {
            $http.post('/Admin/CatActivity/InsertActAttrSetup', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/CatActivity/GetItem?id=' + data).then(callback);
        },
        getItemCatActivity: function (data, callback) {
            $http.post('/Admin/CatActivity/GetItemCatActivity?id=' + data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/CatActivity/Update', data).then(callback);
        },
        updatecatactivity: function (data, callback) {
            $http.post('/Admin/CatActivity/UpdateCatActivity', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/CatActivity/Delete?id=' + data).then(callback);
        },
        deletecatactivity: function (data, callback) {
            $http.post('/Admin/CatActivity/DeleteCatActivity?id=' + data).then(callback);
        },

        deleteActAttrSetup: function (data, callback) {
            $http.post('/Admin/CatActivity/DeleteActAttrSetup?id=' + data).then(callback);
        },
        getListActivityType: function (data, callback) {
            $http.post('/Admin/CatActivity/GetListActivityType?actgroup=' + data).then(callback);
        },
        getListActivityGroup: function (callback) {
            $http.post('/Admin/CatActivity/GetListActivityGroup').then(callback);
        },
        getListActivityGroupName: function (callback) {
            $http.post('/Admin/CatActivity/GetListActivityGroupName').then(callback);
        },
        getListATTRUNIT: function (callback) {
            $http.post('/Admin/CatActivity/GetListATTRUNIT').then(callback);
        },
        getListATTRTYPE: function (callback) {
            $http.post('/Admin/CatActivity/GetListATTRTYPE').then(callback);
        },

        getGenAttrReqCode: function (callback) {
            $http.post('/Admin/CatActivity/GenAttrReqCode').then(callback);
        },
        insertACTGroup: function (data, callback) {
            $http.post('/Admin/CatActivity/InsertACTGroup', data).then(callback);
        },
        insertACTType: function (data, callback) {
            $http.post('/Admin/CatActivity/InsertACTType', data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
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
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                ObjActCode: {
                    required: true,
                    maxlength: 100
                },
                Name: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                ObjActCode: {
                    required: caption.CAT_VLD_ACTIVITY_CATE_CODE,
                    maxlength: caption.CAT_VLD_ACTIVITY_CATE_CODE_SIZE
                },
                Name: {
                    required: caption.CAT_VLD_ACTIVITY_CATE_TITLE,
                    maxlength: caption.CAT_VLD_ACTIVITY_CATE_TITLE_SIZE
                },
            }
        }

        $rootScope.validationOptionsAct = {
            rules: {
                ActCode: {
                    required: true,
                    maxlength: 100
                },
                ActName: {
                    required: true,
                    maxlength: 100
                },
                ActGroupName: {
                    required: true,
                    maxlength: 100
                },
                ActTypeName: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                ActCode: {
                    required: caption.CAT_VLD_ACTIVITY_CODE,
                    maxlength: caption.CAT_VLD_ACTIVITY_CODE_SIZE
                },
                ActName: {
                    required: caption.CAT_VLD_ACTIVITY_NAME,
                    maxlength: caption.CAT_VLD_ACTIVITY_NAME_SIZE
                },
                ActGroupName: {
                    required: caption.CAT_VALIDATE_ACTIVITY_GROUP,
                    maxlength: caption.CAT_VLD_ACTIVITY_NAME_SIZE
                },
                ActTypeName: {
                    required: caption.CAT_VALIDATE_ACTIVITY_TYPE,
                    maxlength: caption.CAT_VLD_ACTIVITY_NAME_SIZE
                },
            }
        }
        $rootScope.validationOptionsAttr = {
            rules: {
                AttrCode: {
                    required: true,
                    maxlength: 100
                },
                AttrName: {
                    required: true,
                    maxlength: 100
                },
            },
            messages: {
                AttrCode: {
                    required: 'Mã Thuộc tính bắt buộc',
                    maxlength: 'Mã Thuộc tính không vượt quá 100 ký tự'
                },
                AttrName: {
                    required: 'Tên Thuộc tính yêu cầu bắt buộc',
                    maxlength: 'Tên hoạt động không vượt quá 255 ký tự'
                },
            }
        }
        $rootScope.IsAdd = false;
    });

});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CatActivity/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
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
    $scope.model = {
        ActCode: '',
        ActGroup: '',
        ActType: '',
        ActName: ''
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {

        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    dataservice.getListActivityType($scope.model.ActGroup, function (result) {
        result = result.data;
        $scope.ListActivityType = result.Object;

    });
    dataservice.getListActivityGroup(function (result) {
        result = result.data;
        $scope.ListActivityGroup = result.Object;
    });
    $scope.isDisabled = true;
    $scope.check = function () {
        if ($scope.model.ActGroup == '') {
            App.toastrError("Vui lòng chọn nhóm hoạt động trước");

        }

    }
    $scope.click = function () {
        if ($scope.model.ActGroup == '') {

            $scope.isDisabled = true;
            $scope.model.ActType = '';
        } else {
            $scope.isDisabled = false;
            dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                result = result.data;
                $scope.ListActivityType = result.Object;

            });
        }

    }
    $scope.clear = function () {

        $scope.isDisabled = true;
        $scope.model.ActGroup = '';
        $scope.model.ActType = '';

    }
    $scope.initLoad = function () {

    }
    $scope.initLoad();

    $scope.addcatactivity = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addCatActivity.html',
            controller: 'addCatActivity',
            backdrop: true,
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    }

    function loadDate() {
        $("#fromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
        $("#toDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('addCatActivity', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        ActCode: '',
        ActGroup: '',
        ActType: '',
        ActName: ''
    }
    $scope.modelGroup = {

    };
    $scope.modelType = {

    };
    $scope.listGroupNameNew = [];
    $scope.listTypeNameNew = [];
    $scope.listTypeName = [];
    $scope.forms = {};
    $scope.initLoad = function () {
        //dataservice.getListActivityGroup(function (result) {
        //    result = result.data;
        //    $scope.ListActivityGroup = result.Object;
        //}); 
        dataservice.getListActivityGroupName(function (result) {
            $scope.listGroupName = result.data.Object;
        });
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $rootScope.ActCode = null;
        $rootScope.IsAdd = false;
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {

        validationSelect($scope.model);

        if ($scope.addcatact.validate() && !validationSelect($scope.model).status) {

            var msg = $rootScope.checkData($scope.model);

            if (msg.status) {
                app.toastrerror(msg.title);
                return;
            }

            if (!$rootScope.IsAdd) {
                dataservice.insertcatactivity($scope.model, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $rootScope.ActCode = $scope.model.ActCode;
                        $scope.model.ID = result.ID;
                        $rootScope.IsAdd = true;
                        //$uibModalInstance.close();
                        $scope.reloadNoResetPage();
                    }
                });
            }
            else {
                dataservice.updatecatactivity($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.IsAdd = false;
                        $scope.reloadNoResetPage();
                        $uibModalInstance.close();
                        $rootScope.ActCode = null;
                    }
                });
            }

        }
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ActGroup" && $scope.model.ActGroup != "") {
            $scope.errorActGroup = false;
            dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                result = result.data;
                $scope.ListActivityType = result.Object;
            });
        }
        if (SelectType == "ActType" && $scope.model.ActType != "") {
            $scope.errorActType = false;
        }

    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.ActGroup == "") {
            $scope.errorActGroup = true;
            mess.Status = true;
        } else {
            $scope.errorActGroup = false;
        }

        if (data.ActType == "") {
            $scope.errorActType = true;
            mess.Status = true;
        } else {
            $scope.errorActType = false;
        }

        return mess;
    };

    $scope.change = function (string) {
        var output = [];
        angular.forEach($scope.listGroupName, function (item) {
            if (item.Name.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
                output.push(item.Name);
            }
        });
        $scope.listGroupNameNew = output;
    };
    $scope.changeType = function (string) {
        
        var outputType = [];
        angular.forEach($scope.listTypeName, function (item) {
            if (item.Name.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
                outputType.push(item.Name);
            }
        });
        $scope.listTypeNameNew = outputType;
    };

    $scope.addGroup = function (name) {
        var check = 0;
        for (var i = 0; i < $scope.listGroupName.length; i++) {
            if ($scope.listGroupName[i].Name == name) {
                $scope.model.ActGroup = $scope.listGroupName[i].Code;
                $scope.model.ActGroupName = name;
                $scope.listTypeNameNew = [];
                check = 1;
                dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                    result = result.data;
                    $scope.listTypeName = result.Object;
                });
            }
        }

        if (check == 0) {
            if (name == "" || name == null) {
                App.toastrError("Vui lòng nhập tên nhóm hoạt động!");
                return;
            } else {
                $scope.modelGroup.ValueSet = name;
                dataservice.insertACTGroup($scope.modelGroup, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        
                        App.toastrSuccess(result.Title);
                        $scope.model.ActGroup = result.Code;
                        dataservice.getListActivityGroupName(function (result) {
                            $scope.listGroupName = result.data.Object;
                        });
                        dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                            result = result.data;
                            $scope.listTypeName = result.Object;
                        });
                    }
                });
            }
        }
    };
    $scope.addType = function (name) {
        var check = 0;
        for (var i = 0; i < $scope.listTypeName.length; i++) {
            if ($scope.listTypeName[i].Name == name) {
                $scope.model.ActType = $scope.listTypeName[i].Code;
                $scope.model.ActTypeName = name;
                check = 1;
            }
        }

        if (check == 0) {
            if (name == "" || name == null) {
                App.toastrError("Vui lòng nhập tên loại hoạt động!");
                return;
            } else {
                if ($scope.model.ActGroup == null || $scope.model.ActGroup == "") {
                    App.toastrError("Nhóm hoạt động chưa xác định!");
                    return;
                } else {
                    $scope.modelType.ValueSet = name;
                    $scope.modelType.Type = $scope.model.ActGroup;
                    dataservice.insertACTType($scope.modelType, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            
                            App.toastrSuccess(result.Title);
                            $scope.model.ActType = result.Code;
                            dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                                result = result.data;
                                $scope.listTypeName = result.Object;
                            });
                        }
                    });
                }
            }

        }
    };
    $scope.outUser = function () {
        $("#user-packing").slideUp();
    };
    $scope.inUser = function () {
        $("#user-packing").slideDown();
    };
    $scope.outUser2 = function () {
        $("#user-packing2").slideUp();
    };
    $scope.inUser2 = function () {
        $("#user-packing2").slideDown();
    };
});
app.controller('Activity', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CatActivity/JTableCatActivity",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ActName = $scope.model.ActName;
                d.ActGroup = $scope.model.ActGroup;
                d.ActType = $scope.model.ActType;
                d.ActCode = $scope.model.ActCode;
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '20px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActCode').withTitle('{{"CAT_TITLE_ACTIVITY_CODE" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActName').withTitle('{{"CAT_TITLE_ACTIVITY_NAME" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActType').withTitle('{{"CAT_TITLE_ACTIVITY_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActGroup').withTitle('{{"CAT_TITLE_ACTIVITY_GROUP" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CAT_LBL_ACTIVITY_GC" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"CAT_COL_ACTIVITY_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; COM_BTN_EDIT &quot; | translate}}" ng-click="edit(' + full.ID + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $rootScope.search = function (id) {
        reloadData(true);
    };

    $scope.edit = function (id) {
        // $scope.model.TicketCode = $rootScope.TicketCode;
        dataservice.getItemCatActivity(id, function (rs) {
            rs = rs.data;
            $rootScope.ActCode = rs.Object.ActCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/editCatActivity.html',
                controller: 'editCatActivity',
                backdrop: 'static',
                size: '50',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $rootScope.ActCode = null;
                $scope.reloadNoResetPage();
            }, function () {
            });
        });
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataservice.deletecatactivity(id, function (rs) {
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


    setTimeout(function () {


    }, 200);
});
app.controller('editCatActivity', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, para) {
    //$scope.isDisabled = true;
    $scope.modelGroup = {

    };
    $scope.modelType = {

    };
    $scope.listGroupNameNew = [];
    $scope.listTypeNameNew = [];
    $scope.listTypeName = [];
    $scope.cancel = function () {
        $rootScope.ActCode = null;
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        $scope.model = para;
        dataservice.getListActivityGroupName(function (result) {
            $scope.listGroupName = result.data.Object;
            for (var i = 0; i < $scope.listGroupName.length; i++) {
                if ($scope.listGroupName[i].Code == $scope.model.ActGroup) {
                    $scope.model.ActGroupName = $scope.listGroupName[i].Name;
                    $scope.listTypeNameNew = [];
                    dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                        result = result.data;
                        $scope.listTypeName = result.Object;
                        for (var i = 0; i < $scope.listTypeName.length; i++) {
                            if ($scope.listTypeName[i].Code == $scope.model.ActType) {
                                $scope.model.ActTypeName = $scope.listTypeName[i].Name;
                            }
                        }
                    });
                }
            }
        });
    };
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            dataservice.updatecatactivity($scope.model, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                    $rootScope.ActCode = null;
                    $scope.reloadNoResetPage();
                }
            });
        }
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ActGroup" && $scope.model.ActGroup != "") {
            $scope.errorActGroup = false;
            dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                result = result.data;
                $scope.ListActivityType = result.Object;
            });
        }
        if (SelectType == "ActType" && $scope.model.ActType != "") {
            $scope.errorActType = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.ActGroup == "") {
            $scope.errorActGroup = true;
            mess.Status = true;
        } else {
            $scope.errorActGroup = false;
        }

        if (data.ActType == "") {
            $scope.errorActType = true;
            mess.Status = true;
        } else {
            $scope.errorActType = false;
        }

        return mess;
    };
    $scope.change = function (string) {
        var output = [];
        angular.forEach($scope.listGroupName, function (item) {
            if (item.Name.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
                output.push(item.Name);
            }
        });
        $scope.listGroupNameNew = output;
    };
    $scope.changeType = function (string) {
        
        var outputType = [];
        angular.forEach($scope.listTypeName, function (item) {
            if (item.Name.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
                outputType.push(item.Name);
            }
        });
        $scope.listTypeNameNew = outputType;
    };

    $scope.addGroup = function (name) {
        var check = 0;
        for (var i = 0; i < $scope.listGroupName.length; i++) {
            if ($scope.listGroupName[i].Name == name) {
                $scope.model.ActGroup = $scope.listGroupName[i].Code;
                $scope.model.ActGroupName = name;
                $scope.listTypeNameNew = [];
                check = 1;
                dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                    result = result.data;
                    $scope.listTypeName = result.Object;
                });
            }
        }

        if (check == 0) {
            if (name == "" || name == null) {
                App.toastrError("Vui lòng nhập tên nhóm hoạt động!");
                return;
            } else {
                $scope.modelGroup.ValueSet = name;
                dataservice.insertACTGroup($scope.modelGroup, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        
                        App.toastrSuccess(result.Title);
                        $scope.model.ActGroup = result.Code;
                        dataservice.getListActivityGroupName(function (result) {
                            $scope.listGroupName = result.data.Object;
                        });
                        dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                            result = result.data;
                            $scope.listTypeName = result.Object;
                        });
                    }
                });
            }
        }
    };
    $scope.addType = function (name) {
        var check = 0;
        for (var i = 0; i < $scope.listTypeName.length; i++) {
            if ($scope.listTypeName[i].Name == name) {
                $scope.model.ActType = $scope.listTypeName[i].Code;
                $scope.model.ActTypeName = name;
                check = 1;
            }
        }

        if (check == 0) {
            if (name == "" || name == null) {
                App.toastrError("Vui lòng nhập tên loại hoạt động!");
                return;
            } else {
                if ($scope.model.ActGroup == null || $scope.model.ActGroup == "") {
                    App.toastrError("Nhóm hoạt động chưa xác định!");
                    return;
                } else {
                    $scope.modelType.ValueSet = name;
                    $scope.modelType.Type = $scope.model.ActGroup;
                    dataservice.insertACTType($scope.modelType, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            
                            App.toastrSuccess(result.Title);
                            $scope.model.ActType = result.Code;
                            dataservice.getListActivityType($scope.model.ActGroup, function (result) {
                                result = result.data;
                                $scope.listTypeName = result.Object;
                            });
                        }
                    });
                }
            }

        }
    };
    $scope.outUser = function () {
        $("#user-packing").slideUp();
    };
    $scope.inUser = function () {
        $("#user-packing").slideDown();
    };
    $scope.outUser2 = function () {
        $("#user-packing2").slideUp();
    };
    $scope.inUser2 = function () {
        $("#user-packing2").slideDown();
    };
    setTimeout(function () {
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
            //var maxDate = new Date(selected.date.valueOf());
            //$('#datefrom').datepicker('setEndDate', maxDate);
        });
        setModalDraggable('.modal-dialog');
        setModalMaxHeight('.modal');
    }, 100);
});
app.controller('addheader', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    var vm = $scope;
    $scope.modelAttr = {
        ActCode: '',
        AttrUnit: '',
        AttrDataType: ''

    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CatActivity/JTableAttr",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ActCode = $rootScope.ActCode;

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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.AssetID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ID').withTitle('ID').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrCode').withTitle('{{"CAT_LBL_ACTIVITY_PROPERTIES_CODE" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrName').withTitle('{{"CAT_LBL_ACTIVITY_PROPERTIES_NAME" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrDataType').withTitle('{{"CAT_LBL_ACTIVITY_DATA_TYPE" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrUnit').withTitle('{{"CAT_LBL_ACTIVITY_DVT" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"CAT_LBL_ACTIVITY_GC" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"CAT_COL_ACTIVITY_ACTION" | translate}}').withOption('sWidth', '30px').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot; COM_BTN_DELETE &quot; | translate}}" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $rootScope.reloadNoResetPage5 = function () {
        reloadData(false);
    };

    $scope.addattr = function () {
        validationSelect($scope.modelAttr);
        if ($scope.addheader.validate() && !validationSelect($scope.modelAttr).Status) {
            var temp = $rootScope.checkData($scope.modelAttr);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            $scope.modelAttr.ActCode = $rootScope.ActCode;
            dataservice.insertActAttrSetup($scope.modelAttr, function (result) {
                var rs = result.data;
                if (result.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage5();


                }
            });
        }
    }

    $rootScope.search = function (id) {
        reloadData(true);
    };



    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM.replace('{0}', "");
                $scope.ok = function () {
                    dataservice.deleteActAttrSetup(id, function (rs) {
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
            $scope.reloadNoResetPage5();
        }, function () {
        });
    }

    dataservice.getListATTRTYPE(function (result) {
        result = result.data;
        $scope.ListATTRTYPE = result.Object;
    });
    dataservice.getListATTRUNIT(function (result) {
        result = result.data;
        $scope.ListATTRUNIT = result.Object;
    });

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "AttrDataType" && $scope.modelAttr.AttrDataType != "") {
            $scope.errorAttrDataType = false;
        }
        if (SelectType == "AttrUnit" && $scope.modelAttr.AttrUnit != "") {
            $scope.errorAttrUnit = false;
        }

    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.AttrDataType == "") {
            $scope.errorAttrDataType = true;
            mess.Status = true;
        } else {
            $scope.errorAttrDataType = false;
        }

        if (data.AttrUnit == "") {
            $scope.errorAttrUnit = true;
            mess.Status = true;
        } else {
            $scope.errorAttrUnit = false;
        }

        return mess;
    };

    setTimeout(function () {


    }, 200);
});