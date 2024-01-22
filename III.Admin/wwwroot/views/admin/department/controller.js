var ctxfolder = "/views/admin/Department";
var ctxforderHrEmp = "/views/admin/hrEmployee"
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
            $http.post('/Admin/Department/insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Department/update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/Department/delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/Department/Getitem/' + data).then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/Department/gettreedata/' + data).then(callback);
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
                var partternCode = /^[a-zA-Z0-9._äöüÄÖÜ]*$/g;
                var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
                var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
                var mess = { Status: false, Title: "" }
                if (!partternCode.test(data.DepartmentCode)) {
                    mess.Status = true;
                    mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.ADM_DEPARTMENT_LIST_COL_DEPT_CODE), "<br/>");
                }
                //if (!partternName.test(data.Title)) {
                //    mess.Status = true;
                //    mess.Title += " - " + caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.ADM_DEPARTMENT_LIST_COL_DEPT_NAME) + "<br/>";
                //}
                //if (!partternDescription.test(data.Description)) {
                //    mess.Status = true;
                //    mess.Title += " - " + caption.COM_VALIDATE_ITEM.replace('{0}', caption.ADM_DEPARTMENT_LIST_COL_DEPT_DESCIPTION) + "<br/>";
                //}
                return mess;
            }
            $rootScope.validationOptions = {
                rules: {
                    Title: {
                        required: true,
                        maxlength: 255
                    },
                    DepartmentCode: {
                        required: true,
                        maxlength: 50
                    },
                    Description: {
                        maxlength: 500
                    }
                },
                messages: {
                    DepartmentCode: {
                        required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_DEPARTMENT_CURD_LBL_DEPT_CODE),
                        maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_DEPARTMENT_CURD_LBL_DEPT_CODE).replace('{1}', '50')
                    },
                    Title: {
                        required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_DEPARTMENT_CURD_LBL_DEPT_NAME),
                        maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_DEPARTMENT_CURD_LBL_DEPT_NAME).replace('{1}', '255')
                    },
                    Description: {
                        maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_DEPARTMENT_CURD_LBL_DEPT_DESCIPTION).replace('{1}', '500')
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
                    Name: caption.ADM_DEPARTMENT_LIST_LBL_DEPT_ACTIVE
                }, {
                    Value: false,
                    Name: caption.ADM_DEPARTMENT_LIST_LBL_DEPT_INACTIVE
                }];
        });
    $rootScope.DepartmentCode = "";
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Department/Translation');
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
        .when('/user/:id',
            {
                templateUrl: ctxfolder + '/user.html',
                controller: 'user'
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
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Department/jtable",
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

            //$(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
            //        $scope.selected[data.Id] = !$scope.selected[data.Id];
            //    } else {
            //        var self = $(this).parent();
            //        if ($(self).hasClass('selected')) {
            //            $(self).removeClass('selected');
            //            $scope.selected[data.Id] = false;
            //        } else {
            //            $('#tblData').DataTable().$('tr.selected').removeClass('selected');
            //            $scope.selected.forEach(function (obj, index) {
            //                if ($scope.selected[index])
            //                    $scope.selected[index] = false;
            //            });
            //            $(self).addClass('selected');
            //            $scope.selected[data.Id] = true;
            //        }
            //    }

            //    vm.selectAll = false;
            //    $scope.$apply();
            //});
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"ADM_DEPARTMENT_LIST_COL_DEPT_NAME" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data.replace(/. . . /g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"ADM_DEPARTMENT_LIST_COL_DEPT_CODE" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('null').withTitle('{{"ADM_DEPARTMENT_LIST_COL_MANAGER" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        //return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('null').withTitle('{{"ADM_DEPARTMENT_LIST_COL_NUMBER_PROJECT" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        //return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('null').withTitle('{{"ADM_DEPARTMENT_LIST_COL_SUM_EMPLOY" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        //return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"ADM_DEPARTMENT_LIST_COL_DEPT_DESCIPTION" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('IsEnabled').withTitle('{{"ADM_DEPARTMENT_LIST_COL_DEPT_STATUS" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data == "True" ? '<span class="text-success">{{"ADM_DEPARTMENT_LIST_LBL_DEPT_ACTIVE" | translate}}</span>' : '<span class="text-danger">{{"ADM_DEPARTMENT_LIST_LBL_DEPT_INACTIVE" | translate}}</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ADM_DEPARTMENT_LIST_COL_DEPT_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<a title="Sửa" ng-click="edit(' + full.Id + ')" class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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

    $scope.edit = function (id) {
        //var userModel = {};
        //var listdata = $('#tblData').DataTable().data();
        //for (var i = 0; i < listdata.length; i++) {
        //    if (listdata[i].Id == id) {
        //        userModel = listdata[i];
        //        break;
        //    }
        //}

        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            
            $rootScope.DepartmentCode = rs.DepartmentCode;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '50',
                    resolve: {
                        para: function () {
                            return rs;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
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
        dataservice.gettreedata(null, function (result) {
            result = result.data;
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
            dataservice.insert($scope.model, function (rs) {
                rs = rs.data;
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
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, $translate, $window, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        $scope.model = para;
        dataservice.gettreedata(null, function (result) {
            result = result.data;
            $scope.treeData = result;
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
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('jTableEmp', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $translate, $window, dataservice) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        DepartmentCode: ''
    }
    
    $scope.model.DepartmentCode = $rootScope.DepartmentCode;
    $scope.treeDataunit = [];
    $scope.positionData = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Department/JTableHrEmp",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.DepartmentCode = $scope.model.DepartmentCode;
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
                    } else {
                        $('#tblDataContract').DataTable().$('tr.selected').removeClass('selected');
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
            //if ($rootScope.showFunctionHr.Update) {
            //    $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
            //        if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

            //        } else {
            //            var Id = data.Id;
            //            $scope.edit(Id);
            //        }
            //    });
            //}
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fullname').withTitle('{{"ADM_DEPARTMENT_LIST_COL_FULL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('gender').withTitle('{{"ADM_DEPARTMENT_LIST_COL_SEX" | translate}}').renderWith(function (data, type) {
        if (data == 1) {
            return '<i class="fas fa-male "></i>';
        }
        if (data == 2) {
            return '<i class="fas fa-female " style="color: #f1204fcf;"></i>';
        }
    }).withOption('sClass', 'tcenter'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('phone').withTitle('{{"HR_HR_MAN_LIST_COL_HR_MAN_PHONE" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}).withOption('sClass', 'dataTable-pr0 hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('unitName').withTitle('{{"ADM_DEPARTMENT_LIST_COL_DEPARTMENT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('positionName').withTitle('{{"ADM_DEPARTMENT_LIST_COL_POSITION" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0  dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('permanentresidence').withTitle('{{"ADM_DEPARTMENT_LIST_COL_RESIDENT" | translate}}').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('employeetype').withTitle('{{"ADM_DEPARTMENT_LIST_COL_EMPLOYEE_TYPE" | translate}}').renderWith(function (data, type) {
        if (data == 'Nhân viên thử việc') {
            return '<span class="text-warning">' + data + '</span>';
        } else if (data == 'Nhân viên thực tập') {
            return '<span class="text-danger">' + data + '</span>';
        } else if (data == 'Nhân viên chính thức') {
            return '<span class="text-success">' + data + '</span>';
        } else if (data == 'Cộng tác viên') {
            return '<span class="text-info">' + data + '</span>';
        } else if (data == 'Đã nghỉ việc') {
            return '<span class="text-danger">' + data + '</span>';
        } else {
            return data;
        }
    }).withOption('sClass', 'nowrap dataTable-pr0 dataTable-10per'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"Tác vụ" | translate}}').notSortable().renderWith(function (data, type, full, meta) {
    //    //return '<button title="Sửa" ng-click="editHrEmp(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>'
    //    //var listButton = '';
    //    //if ($rootScope.showFunctionHr.Update) {
    //    //    listButton += '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>';
    //    //}
    //    //if ($rootScope.showFunctionHr.Delete) {
    //    //    listButton += '<button ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //    //}
    //    //return listButton;
    //}).withOption('sClass', 'nowrap tcenter dataTable-w80'));
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
    }
    $scope.search = function () {
        reloadData(true);
    }
    //$scope.edit = function (id) {
    //    var size = 0;
    //    if ($window.innerWidth < 1200 && $window.innerWidth > 768) {
    //        size = 90;
    //    } else if ($window.innerWidth > 1200 && $window.innerWidth < 1500) {
    //        size = 80;
    //    } else {
    //        size = 70;
    //    }
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: size,
    //        resolve: {
    //            para: function () {
    //                return id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reloadNoResetPage();
    //    }, function () {
    //    });
    //}
    $scope.editHrEmp = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxforderHrEmp + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: 60,
            resolve: {
                para: function () {
                    return id;
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $rootScope.resetEmployee = function (resetPage) {
        $scope.reload(resetPage);
    }
    setTimeout(function () {
    }, 200);
});
