var ctxfolder = "/views/admin/GroupUser";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        insert: function (data, callback) {
            $http.post('/Admin/GroupUser/insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/GroupUser/update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/GroupUser/delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/GroupUser/Getitem/' + data).then(callback);
        },
        resort: function (data, callback) {
            $http.post('/Admin/GroupUser/resort', data).then(callback);
        },
        //getAll: function (callback) {
        //    $http.post('/Admin/GroupUser/getAll/').then(callback);
        //},
        getGroupUser: function (data, callback) {
            $http.post('/Admin/GroupUser/GetTreeGroupUser', data).then(callback);
        },


        getUserOutGroup: function (data, callback) {
            $http.post('/Admin/GroupUser/GetUserOutGroup', data).then(callback);
        },
        getUserInGroup: function (data, callback) {
            $http.post('/Admin/GroupUser/GetUserInGroup', data).then(callback);
        },
        getGRole: function (callback) {
            $http.post('/Admin/GroupUser/GetGRole').then(callback);
        },
        //updateGroupUser: function (data, callback) {
        //    $http.post('/Admin/GroupUser/UpdateGroupUserAsync', data).then(callback);
        //},
        gettreedata: function (data, callback) {
            $http.post('/Admin/GroupUser/gettreedata/' + data).then(callback);
        },
        getListUserInGroup: function (data, callback) {
            $http.post('/Admin/GroupUser/GetListUserInGroup?deparment=' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('.AspNetCore.Culture') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess',
        function () {
            caption = caption[culture];
            $rootScope.checkData = function (data) {
                var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
                var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
                var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
                var mess = { Status: false, Title: "" }
                if (!partternCode.test(data.GroupUserCode)) {
                    mess.Status = true;
                    mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', 'Mã nhóm người dùng'), "<br/>");
                }
                return mess;
            }
            $rootScope.validationOptions = {
                rules: {
                    Title: {
                        required: true,
                        maxlength: 255
                    },
                    GroupUserCode: {
                        required: true,
                        maxlength: 50
                    },
                    Description: {
                        maxlength: 500
                    }
                },
                messages: {
                    GroupUserCode: {
                        required: caption.COM_ERR_REQUIRED.replace('{0}', 'Mã nhóm người dùng'),
                        maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', 'Mã nhóm người dùng').replace('{1}', '50')
                    },
                    Title: {
                        required: caption.COM_ERR_REQUIRED.replace('{0}', 'Tên nhóm người dùng'),
                        maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', 'Tên nhóm người dùng').replace('{1}', '255')
                    },
                    Description: {
                        maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', 'Mô tả').replace('{1}', '500')
                    }
                }
            }
            $rootScope.StatusData = [
                {
                    Value: '',
                    Name: 'Tất cả'
                },
                {
                Value: true,
                Name: 'Hoạt động'
                },
                {
                Value: false,
                Name: 'Không hoạt động'
            }];
        });


});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/GroupUser/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/',
            {
                templateUrl: ctxfolder + '/index.html',
                controller: 'index'
            })
        .when('/edit/:id',
            {
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit'
            })
        .when('/add/',
            {
                templateUrl: ctxfolder + '/add.html',
                controller: 'add'
            });
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
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    var vm = $scope;
    $scope.model = {
        GroupName: '',
        GroupCode: '',
        Status: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liGroupUser = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/GroupUser/jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                
                d.GroupCode = $scope.model.GroupCode;
                d.GroupName = $scope.model.GroupName;
                d.Status = $scope.model.Status;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'asc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full._STT] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-change="toggleOne(selected,$event)"/><span></span></label>';
    }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('ID').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"GUSR_LBL_TAB_GROUPUSR_TITLE" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data.replace(/. . . /g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"GUSR_LBL_TAB_GROUPUSR_CODE" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"GUSR_LBL_TAB_GROUPUSR_DETAIL" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('IsEnabled').withTitle('{{"GUSR_LBL_TAB_GROUPUSR_TUS" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data == "True" ? '<span class="text-success">{{"GUSR_LBL_TAB_GROUPUSR_SET_ACT" | translate}}</span>' : '<span class="text-danger">{{"GUSR_LBL_TAB_GROUPUSR_SET_DEACT" | translate}}</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"GUSR_LBL_TAB_GROUPUSR_ACT" | translate}}').renderWith(function (data, type, full, meta) {
        return '<span title="Sửa" ng-click="edit(' + full.Id + ')" /*style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);"*/ class="fs25"><i class="fas fa-edit" style="margin-right:10px; color:#337ab7"></i></span>' +
            '<span title="Xoá" ng-click="delete(' + full.Id + ')" /*style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)"*/ class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;color:#337ab7"></i></span>';
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
    function toggleOne(selectedItems, evt) {
        $(evt.target).closest('tr').toggleClass('selected');
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.reload = function () {
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

    $scope.edit = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return userModel;
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
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


    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    setTimeout(function () {
    }, 50);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice) {
    $scope.model = {
        ParentId: null
    };
    $scope.loadData = function () {
        dataservice.gettreedata(null, function (result) {result=result.data;
            $scope.treeData = result;
        });
    }
    $scope.loadData();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        if ($scope.addform.validate()) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            dataservice.insert($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
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
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getItem(para.Id, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                dataservice.getListUserInGroup(para.Code, function (rs) {rs=rs.data;
                    
                    $scope.listUserInGroupData = rs;
                });
            }
        });
    }
    $scope.initData();

    $scope.submit = function () {
        if ($scope.editform.validate()) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            dataservice.update($scope.model, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
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

