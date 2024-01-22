var ctxfolder = "/views/admin/LMSSubject";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
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
            $http.post('/Admin/LMSSubject/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/LMSSubject/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/LMSSubject/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/LMSSubject/GetItem/' + data).then(callback);
        },

        getListParent: function (callback) {
            $http.post('/Admin/LMSSubject/GetListParent').then(callback);
        },
        insertChildren: function (data, callback) {
            $http.post('/Admin/LMSSubject/InsertChildren', data, callback).then(callback);
        },
        updateChildren: function (data, callback) {
            $http.post('/Admin/LMSSubject/UpdateChildren', data).then(callback);
        },
        deleteChildren: function (data, callback) {
            $http.post('/Admin/LMSSubject/DeleteChildren/' + data).then(callback);
        },
        getItemChildren: function (data, callback) {
            $http.get('/Admin/LMSSubject/GetItemChildren/' + data).then(callback);
        },

        getAttrUnit: function (callback) {
            $http.post('/Admin/LMSSubject/GetAttrUnit/').then(callback);
        },
        getLmsGroup: function (callback) {
            $http.post('/Admin/LMSSubject/GetLmsGroup/').then(callback);
        },
        getLmsType: function (callback) {
            $http.post('/Admin/LMSSubject/GetLmsType/').then(callback);
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
    };
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
                Code: {
                    required: true,
                    regx: /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/,
                    maxlength: 50
                },
                Name: {
                    required: true,
                    maxlength: 50
                },
            },
            messages: {
                Code: {
                    required: "",
                    regx: "",
                    maxlength: ""
                },
                Name: {
                    required: "",
                    maxlength: ""
                }
            }
        };

        $rootScope.validationAttributeOptions = {
            rules: {
                Code: {
                    required: true,
                    regx: /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/,
                    maxlength: 50
                },
                Name: {
                    required: true,
                    maxlength: 50
                },

            },
            messages: {
                Code: {
                    required: "",
                    regx: "",
                    maxlength: "",
                },
                Name: {
                    required: "",
                    maxlength: "",
                }
            }
        };
    });

    $rootScope.loadData = function () {
        dataservice.getAttrUnit(function (rs) {
            rs = rs.data;
            $rootScope.listUnit = rs;
        });

    };

    $rootScope.loadData();
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/LMSSubject/Translation');
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

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    var vm = $scope;
    $scope.modelsearch = {
        para: '',
        LmsSubjectCodee: '',
        LmsSubjectNamee: '',
        LmsSubjectType: ''
    },
        $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/LMSSubject/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.LmsSubjectCode = $scope.modelsearch.LmsSubjectCodee;
                d.LmsSubjectName = $scope.modelsearch.LmsSubjectNamee;
                d.LmsSubjectType = $scope.modelsearch.LmsSubjectType;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('LmsSubjectCode').withTitle('{{"LMS_CURD_LBL_LMS_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LmsSubjectName').withTitle('{{"LMS_CURD_LBL_LMS_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LmsSubjectGroup').withTitle('{{"LMS_CURD_LBL_LMS_GROUP" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LmsSubjectType').withTitle('{{"LMS_CURD_LBL_LMS_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LmsSubjectDesc').withTitle('{{"LMS_CURD_LBL_LMS_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"LMS_CURD_LBL_LMS_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '40',

        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (Id) {
        dataservice.getItem(Id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
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
            var list = $('#tblData').DataTable().data();
            if (list.length > 1)
                $scope.reloadNoResetPage();
            else
                $scope.reload();
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
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        LmsSubjectCode: '',
        LmsSubjectName: '',
        LmsSubjectType: '',
        LmsSubjectGroup: '',
        LmsSubjectDesc: ''
    };

    $rootScope.ParentCode = '';

    $scope.initData = function () {
        dataservice.getLmsGroup(function (rs) {
            rs = rs.data;
            $scope.listGroup = rs;
        });
        dataservice.getLmsType(function (rs) {
            rs = rs.data;
            $scope.listType = rs;
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
                        AssetCode: 'ATTRIBUTE'
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
                        AssetCode: 'ATTRIBUTE'
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
                        AssetCode: 'ATTRIBUTE'
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    };

    function validationSelect(data) {
        
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.LmsSubjectCode == "") {
            $scope.errorLmsSubjectCode = true;
            mess.Status = true;
        } else {
            $scope.errorLmsSubjectCode = false;
        }

        if (data.LmsSubjectName == "") {
            $scope.errorLmsSubjectName = true;
            mess.Status = true;
        } else {
            $scope.errorLmsSubjectName = false;
        }

        if (data.LmsSubjectType == "") {
            $scope.errorLmsSubjectType = true;
            mess.Status = true;
        } else {
            $scope.errorLmsSubjectType = false;
        }
        if (data.LmsSubjectGroup == "") {
            $scope.errorLmsSubjectGroup = true;
            mess.Status = true;
        } else {
            $scope.errorLmsSubjectGroup = false;
        }
        return mess;
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        if (!validationSelect($scope.model).Status) {
            dataservice.insert($scope.model, function (rs) {
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
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.model = {
        LmsSubjectCode: '',
        LmsSubjectName: '',
        LmsSubjectType: '',
        LmsSubjectGroup: '',
        LmsSubjectDesc: ''
    };
    $scope.cancel = function () {
        $rootScope.reloadNoResetPage();
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataservice.getLmsGroup(function (rs) {
            rs = rs.data;
            $scope.listGroup = rs;
        });
        dataservice.getLmsType(function (rs) {
            rs = rs.data;
            $scope.listType = rs;
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
                        AssetCode: 'ATTRIBUTE'
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
                        AssetCode: 'ATTRIBUTE'
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
                        AssetCode: 'ATTRIBUTE'
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {
        }, function () { });
    };
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if (data.LmsSubjectCode == "") {
            $scope.errorLmsSubjectCode = true;
            mess.Status = true;
        } else {
            $scope.errorLmsSubjectCode = false;
        }

        if (data.LmsSubjectName == "") {
            $scope.errorLmsSubjectName = true;
            mess.Status = true;
        } else {
            $scope.errorLmsSubjectName = false;
        }

        if (data.LmsSubjectType == "") {
            $scope.errorLmsSubjectType = true;
            mess.Status = true;
        } else {
            $scope.errorLmsSubjectType = false;
        }
        if (data.LmsSubjectGroup == "") {
            $scope.errorLmsSubjectGroup = true;
            mess.Status = true;
        } else {
            $scope.errorLmsSubjectGroup = false;
        }
        return mess;
    }

    $scope.submit = function () {
        if (!validationSelect($scope.model).Status) {
            dataservice.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
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


