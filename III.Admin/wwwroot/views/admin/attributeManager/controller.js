var ctxfolderAttrManager = "/views/admin/attributeManager";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_ATTR_MANAGER', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataserviceAttrManager', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    };

    var submitFormUpload = function (url, data, callback) {

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        };

        $http(req).then(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/AttributeManager/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/AttributeManager/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/AttributeManager/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/AttributeManager/GetItem/' + data).then(callback);
        },

        getListParent: function (callback) {
            $http.post('/Admin/AttributeManager/GetListParent').then(callback);
        },
        insertChildren: function (data, callback) {
            $http.post('/Admin/AttributeManager/InsertChildren', data, callback).then(callback);
        },
        updateChildren: function (data, callback) {
            $http.post('/Admin/AttributeManager/UpdateChildren', data).then(callback);
        },
        deleteChildren: function (data, callback) {
            $http.post('/Admin/AttributeManager/DeleteChildren/' + data).then(callback);
        },
        getItemChildren: function (data, callback) {
            $http.get('/Admin/AttributeManager/GetItemChildren/' + data).then(callback);
        },

        getAttrUnit: function (callback) {
            $http.post('/Admin/AttributeManager/GetAttrUnit/').then(callback);
        },
        getAttrGroup: function (callback) {
            $http.post('/Admin/AttributeManager/GetAttrGroup/').then(callback);
        },
        getAttrDataType: function (callback) {
            $http.post('/Admin/AttributeManager/GetAttrDataType/').then(callback);
        },
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },

        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },

        getListAttributeManager: function (callback) {
            $http.post('/Admin/AttributeManager/GetListAttributeManager').then(callback);
        },
        insertAttributeMore: function (data, callback) {
            $http.post('/Admin/AttributeManager/InsertAttributeMore', data).then(callback);
        },
        getDetailAttributeMore: function (data, callback) {
            $http.post('/Admin/AttributeManager/GetDetailAttributeMore?Id=' + data).then(callback);
        },
        updateAttributeMore: function (data, callback) {
            $http.post('/Admin/AttributeManager/UpdateAttributeMore', data).then(callback);
        },
        deleteAttributeMore: function (data, callback) {
            $http.post('/Admin/AttributeManager/deleteAttributeMore/' + data).then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM_ATTR_MANAGER', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, $cookies, $translate, dataserviceAttrManager) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.validationOptionsAttr = {
            rules: {
                Code: {
                    required: true,
                    regx: /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/,
                    maxlength: 50,
                },
                Name: {
                    required: true,
                    maxlength: 50,
                    regx: /^[^\s].*/
                },
            },
            messages: {
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ATTRM_CURD_LBL_MPA_CODE),
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.ATTRM_CURD_LBL_MPA_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.ATTRM_CURD_LBL_MPA_CODE).replace("{1}", "50"),
                },
                Name: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ATTRM_CURD_LBL_MPA_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.ATTRM_CURD_LBL_MPA_NAME).replace("{1}", "50"),
                    regx: "Không bắt đầu bằng khoảng trắng",
                }
            }
        };

        $rootScope.validationAttributeManagerOptions = {
            rules: {
                Value: {
                    required: true,
                    maxlength: 50
                },
            },
            messages: {
                Value: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ATTRM_CURD_LBL_COST),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.ATTRM_CURD_LBL_COST).replace("{1}", "50")
                }
            }
        };
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/AttributeManager/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderAttrManager + '/index.html',
            controller: 'index_attr_manager'
        })
        .when('/add', {
            templateUrl: ctxfolderAttrManager + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolderAttrManager + '/edit.html',
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

app.controller('index_attr_manager', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAttrManager, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        para: '',
        code: '',
        name: '',
        type: ''
    },
        $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AttributeManager/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.code = $scope.model.code;
                d.name = $scope.model.name;
                d.type = $scope.model.type;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"ATTRM_LIST_COL_MPA_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"ATTRM_LIST_COL_MPA_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Childrens').withTitle('{{"Thuộc tính con" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ATTRM_LIST_COL_MPA_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ATTRM_LIST_COL_MPA_ACTION" | translate}}').renderWith(function (data, type, full) {
        var listButton = '';
        listButton += '<a ng-click="edit(' + full.Id + ')" /*style = "width: 25px; height: 25px; padding: 0px"*/ class="fs25"><i class="fas fa-edit" style="--fa-primary-color:green;margin-right:10px"></i></a>';
        listButton += '<a ng-click="delete(' + full.Id + ')"style="width: 25px; height: 25px; padding: 0px" class="fs25"><i class="fas fa-trash" style="--fa-primary-color:red"></i></a>';
        return listButton;
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
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.initData = function () {
    }
    $scope.initData();
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderAttrManager + '/add.html',
            controller: 'add_attr_manager',
            backdrop: 'static',
            size: '40',

        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    };
    $scope.edit = function (Id) {
        dataserviceAttrManager.getItem(Id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
                $rootScope.ParentCode = $scope.model.Code;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderAttrManager + '/edit.html',
                    controller: 'edit_attr_manager',
                    backdrop: 'static',
                    size: '40',
                    resolve: {
                        para: function () {
                            return $scope.model;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "panel-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceAttrManager.delete(id, function (rs) {
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
            var list = $('#tblData').DataTable().data();
            if (list.length > 1)
                $scope.reloadNoResetPage();
            else
                $scope.reload();
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
    setTimeout(function () {
        showHideSearch();
    }, 200);
});
app.controller('add_attr_manager', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceAttrManager, $filter) {
    $scope.model = {
        ParentCode: '',
        Code: '',
        Name: '',
        Note: '',
        DataType: ''
    };

    $rootScope.ParentCode = '';

    $scope.initData = function () {
        dataserviceAttrManager.getAttrUnit(function (rs) {
            rs = rs.data;
            $rootScope.listUnit = rs;
        });

        dataserviceAttrManager.getAttrGroup(function (rs) {
            rs = rs.data;
            $rootScope.listGroup = rs;
        });

        dataserviceAttrManager.getAttrDataType(function (rs) {
            rs = rs.data;
            $rootScope.listDataType = rs;
        });

        dataserviceAttrManager.getListParent(function (rs) {
            rs = rs.data;
            $scope.listParent = rs;
        });
    };
    $scope.initData();

    $scope.addUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_UNIT',
                        GroupNote: 'Đơn vị thuộc tính',
                        ObjCode: 'ATTRIBUTE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }

    $scope.addGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_GROUP',
                        GroupNote: 'Nhóm thuộc tính',
                        ObjCode: 'ATTRIBUTE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }

    $scope.addDataType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_DATA_TYPE',
                        GroupNote: 'Nhóm thuộc tính',
                        ObjCode: 'ATTRIBUTE'
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        debugger
        if ($scope.addform.validate()) {
            dataserviceAttrManager.insert($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $rootScope.ParentCode = $scope.model.Code;
                    $scope.initData();
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit_attr_manager', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceAttrManager, para) {
    $scope.model = {
        FileName: ''
    };
    $scope.cancel = function () {
        $rootScope.reloadNoResetPage();
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataserviceAttrManager.getAttrUnit(function (rs) {
            rs = rs.data;
            $rootScope.listUnit = rs;
        });

        dataserviceAttrManager.getAttrGroup(function (rs) {
            rs = rs.data;
            $rootScope.listGroup = rs;
        });

        dataserviceAttrManager.getAttrDataType(function (rs) {
            rs = rs.data;
            $rootScope.listDataType = rs;
        });

        dataserviceAttrManager.getListParent(function (rs) {
            rs = rs.data;
            $scope.listParent = rs;
        });

        $scope.model = para;
    };
    $scope.initData();

    $scope.addUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_UNIT',
                        GroupNote: 'Đơn vị thuộc tính',
                        ObjCode: 'ATTRIBUTE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    }

    $scope.addGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_GROUP',
                        GroupNote: 'Nhóm thuộc tính',
                        ObjCode: 'ATTRIBUTE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    }

    $scope.addDataType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_DATA_TYPE',
                        GroupNote: 'Nhóm thuộc tính',
                        ObjCode: 'ATTRIBUTE'
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    };


    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataserviceAttrManager.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    //$uibModalInstance.close();
                }
            });
        }
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAttrManager, $filter, para) {
    var vm = $scope;
    $scope.model = {
        CodeSet: '',
        ValueSet: '',
        AssetCode: para.AssetCode,
        Group: para.Group,
        GroupNote: para.GroupNote
    }
    $scope.listDataType = [];
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CommonSetting/JTableDetail/",
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
                    $scope.model.Type = data.Type;
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"COM_SET_LIST_COL_ORDER" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"COM_SET_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"COM_SET_LIST_COL_TYPE_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"COM_SET_LIST_COL_CREATE_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"COM_SET_LIST_COL_CREATE_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_SET_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.init = function () {
        dataserviceAttrManager.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.COM_SET_CURD_MSG_SETTING_NOT_BLANK);
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        }else {
            dataserviceAttrManager.insertCommonSetting($scope.model, function (rs) {
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
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.COM_SET_CURD_MSG_DATA_NOT_BLANK)
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        }else {
            dataserviceAttrManager.updateCommonSetting($scope.model, function (rs) {
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
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
                $scope.ok = function () {
                    dataserviceAttrManager.deleteCommonSetting(id, function (rs) {
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('tabAttribute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAttrManager, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {};

    $rootScope.isEditAttribute = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AttributeManager/JTableChildren",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.parentCode = $rootScope.ParentCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"ATTRM_CURD_LBL_MPA_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"ATTRM_CURD_LBL_MPA_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ATTRM_LIST_COL_MPA_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"Thao tác" | translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full) {
    //    return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));

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
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadAttribute = function () {
        $scope.reload();
    };

    $scope.add = function () {
        if ($rootScope.ParentCode == '' || $rootScope.ParentCode == null || $rootScope.ParentCode == undefined) {
            App.toastrError('Vui lòng nhập thuộc tính sản phẩm ở trên trước');
            return;
        }

        if ($scope.addform.validate()) {
            $scope.model.ParentCode = $rootScope.ParentCode;
            dataserviceAttrManager.insertChildren($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadAttribute();
                }
            });
        }
    };
    $scope.edit = function (id) {
        dataserviceAttrManager.getItemChildren(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
                $rootScope.isEditAttribute = true;
            }
        });
    };
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            $scope.model.ParentCode = $rootScope.ParentCode;
            dataserviceAttrManager.updateChildren($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.isEditAttribute = false;
                    $rootScope.reloadAttribute();
                }
            });
        }
    };
    $scope.cancel = function () {
        $rootScope.isEditAttribute = false;
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataserviceAttrManager.deleteChildren(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $rootScope.reloadAttribute();
                            $rootScope.isEditAttribute = false;
                            $uibModalInstance.dismiss('cancel');
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
            $scope.reloadAttribute();
        }, function () {
        });
    };
});
app.controller('tabAttributeManager', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceAttrManager, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        AttrCode: '',
    };
    $scope.listAttributeManager = [];
    $scope.listProductAttributeChildren = [];
    $scope.listValues = [];
    $scope.forms = {};
    $scope.isControlDate = false;

    $rootScope.isEditAttribute = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AttributeManager/JTableAttribute",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ObjCode = $rootScope.ObjCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrCode').withTitle('{{"ATTRM_LIST_COL_ATTR_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrName').withTitle('{{"ATTRM_LIST_COL_ATTR_NAME" | translate}}').renderWith(function (data, type, full) {
        return data;
        //return '<input id="attrName_' + full.Id + '" type="text" class="form-control" value="' + data + '">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AttrValue').withTitle('{{"ATTRM_CURD_LBL_COST" | translate}}').renderWith(function (data, type, full) {
        return data;
        //return '<input id="attrValue_' + full.Id + '" type="text" class="form-control" value="' + data + '">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Unit').withTitle('{{"ATTRM_LIST_COL_CURRENCY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"ATTRM_COL_GROUP" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DataType').withTitle('{{"ATTRM_COL_DATA_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Parent').withTitle('{{"ATTRM_COL_PARENT_PROPERTY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"ATTRM_CURD_TAB_ATTRIBUTE_LIST_COL_ACTION" | translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash  fs25"></i></a>';
    }));
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
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadAttribute = function () {
        $scope.reload();
    }
    $scope.init = function () {
        dataserviceAttrManager.getListAttributeManager(function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.listAttributeManager = rs.Object;
            }
        })
    }
    $scope.init();
    $rootScope.initAttr = function () {
        $scope.init();
    };
    //$scope.selectAttributeMain = function (code) {
    //    if ($scope.model.AttrCode != "") {
    //        $scope.errAttrCode = false;
    //    }
    //    $scope.listValues = [];
    //    $scope.model.ProductAttributeChildren = '';
    //    dataserviceAttrManager.getListProductAttributeChildren(code, function (rs) {
    //        rs = rs.data;
    //        if (rs.Error) {
    //            App.toastrError(rs.Title);
    //        }
    //        else {
    //            $scope.listProductAttributeChildren = rs.Object;
    //        }
    //    })
    //}
    //$scope.selectAttributeChildren = function (item) {
    //    var obj = { code: item.Code, name: item.Name };
    //    var checkExits = $scope.listValues.filter(k => k.name === item.Name);
    //    if (checkExits.length === 0) {
    //        $scope.listValues.push(obj);
    //    }
    //};
    //$scope.removeValues = function (index) {
    //    if ($scope.listValues[index].code == $scope.model.ProductAttributeChildren)
    //        $scope.model.ProductAttributeChildren = '';

    //    $scope.listValues.splice(index, 1);
    //    if ($scope.listValues.length == 0)
    //        $scope.model.ProductAttributeChildren = '';
    //}
    var dataType = '';
    $scope.selectAttr = function (item) {
        if ($scope.model.AttrCode != "") {
            $scope.errAttrCode = false;
        }
        dataType = item.DataType;
        if (item.DataType === 'ATTR_DATA_TYPE_DATE') {
            $scope.isControlDate = true;
        } else {
            $scope.isControlDate = false;
        }
    };

    $scope.addAttributeMain = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderAttrManager + '/add.html',
            controller: 'add_attr_manager',
            size: '40',
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.checkInsert = function () {
        var error = false;
        if ($rootScope.ObjCode === '' || $rootScope.ObjCode === undefined) {
            App.toastrError(caption.ATTRM_MSG_ADD_ATTRM_FIRST);
            error = true;
        }

        return error;
    };
    $scope.saveAll = function () {
        if (!$scope.checkInsert()) {
            var listAssetAttr = [];
            var userModel = {};
            var listdata = $('#tblDataAttribute').DataTable().data();
            for (var i = 0; i < listdata.length; i++) {
                var idAttrValue = '#attrValue_' + listdata[i].Id;
                var obj = {
                    Id: parseInt(listdata[i].Id),
                    ObjCode: $rootScope.ObjCode,
                    AttrCode: listdata[i].AttrCode,
                    AttrValue: $(idAttrValue).val()
                };

                listAssetAttr.push(obj);
            };
            if (listAssetAttr.length > 0) {
                dataserviceAttrManager.updateAttributeMoreAll(listAssetAttr, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadAttribute();
                    }
                });
            } else {
                App.toastrError('Danh sách thuộc tính trống');
            }

        }
    };
    $scope.add = function () {
        if (!$scope.checkInsert()) {
            validationSelect($scope.model);
            if ($scope.forms.addAttr.validate() && !validationSelect($scope.model).Status) {
                if ($scope.model.AttrValue === undefined || $scope.model.AttrValue === null || $scope.model.AttrValue === '') {
                    App.toastrError(caption.COM_ERR_REQUIRED.replace("{0}", caption.ATTRM_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_VALUE));
                    return;
                }
                $scope.model.ObjCode = $rootScope.ObjCode;
                dataserviceAttrManager.insertAttributeMore($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reloadAttribute();
                        //$uibModalInstance.close(rs.Object);
                    }
                })
            }
        }
    };
    $scope.inheritance = function () {
        $scope.model.Inheritance = $rootScope.Inheritance;
        if ($scope.model.Inheritance == '' || $scope.model.Inheritance == undefined) {
            App.toastrError(caption.MLP_MSG_NOT_PICK_PRODUCT);
        } else {
            $scope.model.ProductCode = $rootScope.ProductCode;
            dataserviceAttrManager.insertInheritanceAttributeMore($scope.model.ProductCode, $scope.model.Inheritance, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadAttribute();
                }
            })
        }
    }
    $scope.edit = function (id) {
        if (!$scope.checkInsert()) {
            dataserviceAttrManager.getDetailAttributeMore(id, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $scope.model = rs.Object;
                    var item = $scope.listAttributeManager.find(function (element) {
                        if (element.Code === $scope.model.AttrCode) return true;
                    });
                    if (item !== null && item !== undefined && item !== '') {
                        if (item.DataType === 'ATTR_DATA_TYPE_DATE') {
                            $scope.isControlDate = true;
                        } else {
                            $scope.isControlDate = false;
                        }
                    }

                    $rootScope.isEditAttribute = true;
                }
            });
        }
    };
    $scope.submit = function () {
        if (!$scope.checkInsert()) {
            if ($scope.forms.addAttr.validate()) {
                $scope.model.ProductCode = $rootScope.ProductCode;
                dataserviceAttrManager.updateAttributeMore($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.isEditAttribute = false;
                        $rootScope.reloadAttribute();
                        $uibModalInstance.close(rs.Object);
                    }
                })
            }
        }
    }
    $scope.cancel = function () {
        $rootScope.isEditAttribute = false;
    }
    $scope.delete = function (id) {
        if (!$scope.checkInsert()) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                controller: function ($scope, $uibModalInstance) {
                    $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                    $scope.ok = function () {
                        dataserviceAttrManager.deleteAttributeMore(id, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $rootScope.reloadAttribute();
                                $rootScope.isEditAttribute = false;
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
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 

        if (data.AttrCode == "") {
            $scope.errAttrCode = true;
            mess.Status = true;
        } else {
            $scope.errAttrCode = false;
        }
        return mess;
    };
    function initDateTime() {
        $("#dateAttrValue").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
        });
    }

    setTimeout(function () {
        initDateTime();
    }, 200);
});