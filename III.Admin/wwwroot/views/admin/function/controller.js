var ctxfolder = "/views/admin/function";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        //getall: function (callback) {
        //    $http.get('/Admin/Function/getall').then(callback);
        //},
        //getByName: function (data, callback) {
        //    $http.get('/Admin/Function/GetByNameAddParent/?name=' + data).then(callback);
        //},
        insert: function (data, callback) {
            $http.post('/Admin/Function/insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Function/update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/Function/DeleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/Function/delete', data).then(callback);
        },
        gitem: function (data, callback) {
            $http.post('/Admin/Function/getitem', data).then(callback);
        },
        resort: function (data, callback) {
            $http.post('/Admin/Function/resort', data).then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/Function/gettreedata', data).then(callback);
        },
        getbyparent: function (data, callback) {
            $http.post('/Admin/Function/getbyparent/', data).then(callback);
        },
        getGroupResource: function (callback) {
            $http.get('/Admin/Function/getGroupResource').then(callback);
        },
        insertResAtribute: function (data, callback) {
            $http.post('/Admin/Function/InsertResAtribute', data).then(callback);
        },
        updateResAtribute: function (data, callback) {
            $http.post('/Admin/Function/UpdateResAtribute', data).then(callback);
        },
        deleteResAtribute: function (data, callback) {
            $http.post('/Admin/Function/DeleteResAtribute', data).then(callback);
        },
        getResAtribute: function (data, callback) {
            $http.post('/Admin/Function/GetResAtribute', data).then(callback);
        },
        getResourceByFunctionId: function (data, callback) {
            $http.post('/Admin/Function/GetResourceByFunctionId/' + data).then(callback);
        },
        getTreeResourceData: function (data, callback) {
            $http.post('/Admin/Function/GetTreeResourceData/' + data).then(callback);
        },
        addResource: function (data, callback) {
            $http.post('/Admin/Function/AddResource', data).then(callback);
        },
        deletePrivilege: function (data, callback) {
            $http.post('/Admin/Function/DeletePrivilege/', data).then(callback);
        },
        getAllApplication: function (callback) {
            $http.post('/Admin/accessLog/GetApplication/').then(callback);
        }
    }
});
app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 401) {
                var url = "/Home/Logout";
                location.href = url;
            }
            return $q.reject(rejection);
        }
    };
}]);
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'en-US';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9\[\]]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
            var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.FunctionCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.ADM_FUNC_CURD_LBL_FUNC_CODE), "<br/>");
            }
            if (!partternName.test(data.Title)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.ADM_FUNC_CURD_LBL_FUNC_NAME) + "<br/>";
            }
            if (!partternDescription.test(data.Description)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM.replace('{0}', caption.ADM_FUNC_LIST_COL_FUNC_DESCRIPTION) + "<br/>";
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255
                },
                FunctionCode: {
                    required: true,
                    maxlength: 50
                },
                Ord: {
                    required: true
                },
                Description: {
                    maxlength: 500
                }
                //GroupResourceId: {
                //    required: true,
                //    maxlength: 50
                //}
            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ADM_FUNC_CURD_LBL_FUNC_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.ADM_FUNC_CURD_LBL_FUNC_NAME).replace("{1}", "255")
                },
                FunctionCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ADM_FUNC_CURD_LBL_FUNC_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.ADM_FUNC_CURD_LBL_FUNC_CODE).replace("{1}", "50")
                },
                Ord: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ORDER)
                },
                Description: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_FUNC_LIST_COL_FUNC_DESCRIPTION).replace('{1}', '500')
                }
                //GroupResourceId: {
                //    required: "Yêu cầu chọn nhóm chức năng.",
                //    maxlength: "Nhóm chức năng không vượt quá 50 ký tự."
                //}
            }
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    //$httpProvider.interceptors.push('responseObserver');

    $translateProvider.useUrlLoader('/Admin/Function/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/resource/', {
            templateUrl: ctxfolder + '/resource.html',
            controller: 'resource'
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
    $httpProvider.interceptors.push('httpResponseInterceptor');
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {

    var vm = $scope;
    $scope.model = {
        Name: '',
        AppCode: '',
    };
    $scope.selected = [];
    $scope.selectedItem = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Function/jtable",
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
                d.Name = $scope.model.Name;
                d.AppCode = $scope.model.AppCode;
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
        //.withOption('autoWidth', true)
        //.withOption('scrollY', $(window).height() - 220)
        ////.withOption('scrollX', true)
        //.withOption('scrollCollapse', true)
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
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected, $event)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' sorting_disabled'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('#').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"ADM_FUNC_LIST_COL_FUNC_NAME" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data.replace(/. . . /g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"ADM_FUNC_LIST_COL_FUNC_CODE" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Icon').withTitle('{{"ICON_APP" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
    //    return '<img src="/images/appIcon/' + data + '" height="30" width="30">';
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ParentCode').withTitle('ParentCode').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"ADM_FUNC_LIST_COL_FUNC_DESCRIPTION" | translate}}').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"STATUS" | translate}}').withOption('sClass', 'mw70').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
    //    if (data === "1") return caption.ACTIVE;
    //    if (data === "0") return caption.INACTIVE; 
    //    return "";
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Ord').withTitle('{{"ORDER_SORT" | translate}}').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled').withOption('sClass', 'tcenter'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ADM_FUNC_LIST_COL_FUNC_MANIPULATION" | translate}}').renderWith(function (data, type, full, meta) {
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
        //if (selectAll)
        //    $('#tblData').DataTable().$('tr:not(.selected)').addClass('selected');
        //else
        //    $('#tblData').DataTable().$('tr.selected').removeClass('selected');

        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    }
    function toggleOne(selectedItems, evt) {
        //$(evt.target).closest('tr').toggleClass('selected');

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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.reload = function () {
        reloadData(true);
    }

    $scope.initLoad = function () {
        dataservice.getAllApplication(function (rs) {rs=rs.data;
            if (rs.Error) {
            }
            else {
                $scope.applicationData = rs;
            }
        });
    }
    $scope.initLoad();

    //$scope.deleteChecked = function () {
    //    var deleteItems = [];
    //    for (var id in $scope.selected) {
    //        if ($scope.selected.hasOwnProperty(id)) {
    //            if ($scope.selected[id]) {
    //                deleteItems.push(id);
    //            }
    //        }
    //    }
    //    if (deleteItems.length > 0) {
    //        $confirm({ text: caption.MSG_DELETE_LIST_CONFIRM.replace('{0}', caption.FUNCTION), title: caption.CONFIRM, ok: caption.CONFIRM_OK, cancel: caption.CONFIRM_CANCEL })
    //            .then(function () {
    //                //App.blockUI({
    //                //    target: "#contentMain",
    //                //    boxed: true,
    //                //    message: 'loading...'
    //                //});
    //                dataservice.deleteItems(deleteItems, function (result) {result=result.data;
    //                    if (result.Error) {
    //                        App.toastrError(result.Title);
    //                        $scope.reload();
    //                    } else {
    //                        App.toastrSuccess(result.Title);
    //                        $scope.reload();
    //                    }
    //                    App.unblockUI("#contentMain");
    //                });

    //            });
    //    } else {
    //        App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.FUNCTION));
    //    }
    //}

    $scope.contextMenu = [
        [function ($itemScope) {
            return '<i class="fa fa-sitemap"></i> ' + caption.ADM_FUNC_RESOURE_MANAGEMENT;
        }, function ($itemScope, $event, model) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/resource.html',
                controller: 'resource',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    para: function () {
                        return $itemScope.data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
            }, function () {
            });
        }, function ($itemScope, $event, model) {
            return true;
        }]
    ];

    $scope.add = function (p) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    if (p == null) {
                        return { check: true, value: $scope.model.Id };
                    }
                    else {
                        return { check: false, value: p }
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
            //$scope.changeGroup();
        }, function () {
        });
    }
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    }
    $scope.sort = function (p) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/sort.html',
            controller: 'sort',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return { check: true, valueG: (($scope.model.Id == undefined) ? 0 : $scope.model.Id), valueO: p };
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.changeGroup();
        }, function () {
        });
    }
    $scope.resource = function (p) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/resource.html',
            controller: 'resource',
            backdrop: 'static',
            size: 'lg',
            resolve: {
                para: function () {
                    return p;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.changeGroup();
        }, function () {
        });
    }
    //#endregion
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
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    }


    //$scope.edit = function (temp) {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/edit.html',
    //        controller: 'edit',
    //        backdrop: 'static',
    //        size: 'lg',
    //        resolve: {
    //            para: function () {
    //                return temp.Id;
    //            }
    //        }
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //        //$scope.changeGroup();
    //    }, function () {
    //    });
    //}
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
app.controller('add', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance, para, $timeout) {
    $scope.model = {
        ParentCode: null
    };
    $scope.loadData = function () {
        dataservice.gettreedata({ IdI: null }, function (result) {result=result.data;
            $scope.treeData = result;
        });
        //dataservice.gitem(para,function(rs) {
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //    } else {
        //        $scope.model.ParentCode = rs.FunctionCode;
        //    }
        //});
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

    //$timeout(function () {
    //    setModalMaxHeight('.modal');
    //}, 100);
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('sort', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataservice.getbyparent({ IdI: [para.valueO], IdS: [para.valueG] }, function (rs) {rs=rs.data;
            $scope.model = rs;
        });
    }
    $scope.initData();
    $scope.resort = function (item, index) {
        $scope.model.splice(index, 1);
        $scope.model.splice(item.Ord - 1, 0, item);
        $.each($scope.model, function (index, item) {
            item.Ord = index + 1;
        });
    }
    $scope.submit = function () {
        dataservice.resort($scope.model, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        });
    }
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.gitem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                dataservice.gettreedata({ IdI: [para] }, function (result) {result=result.data;
                    $scope.treeData = result;
                });
                //dataservice.getGroupResource(function (result) {result=result.data;
                //    $scope.GroupResource = result;
                //});
                $scope.model = rs;
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
    //$timeout(function () {
    //    setModalMaxHeight('.modal');
    //}, 100);
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('resource', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, para, $timeout) {
    $scope.Func = para.Title.replace(/. . . /g, '').replace("<i class='fa fa-folder text-info'></i>", '').replace("<i class='fa fa-folder-open font-green-sharp'></i>", '').replace("<i class='fa fa-folder-open icon-state-warning'></i>", '');
    
    var vm = $scope;
    $scope.model = {
        Id: para.Id,
        FunctionCode: para.Code,
        Name: ''
    };
    $scope.selected = [];
    $scope.ListFuncResourceDefault = [];
    $scope.ListFuncResource = [];
    $scope.ListResourceAdd = [];
    $scope.ListResourceDel = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Function/JTableResourceByFunctionId",
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
                d.Name = $scope.model.Name;
                d.Code = $scope.model.FunctionCode;
                d.Id = $scope.model.Id;
            },
            complete: function (rs) {
                $scope.ListFuncResource = rs.responseJSON.data;
                $scope.ListFuncResourceDefault = angular.copy(rs.responseJSON.data);

                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        //.withOption('order', [1, 'asc'])
        .withOption('serverSide', false)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                //$compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            //const contextScope = $scope.$new(true);
            //contextScope.data = data;
            //contextScope.contextMenu = $scope.contextMenu;
            //$compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).find('input'))($scope);
            //$compile(angular.element(row).find('button'))($scope);
        });

    vm.dtColumns = [];
    //vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
    //    .renderWith(function (data, type, full, meta) {
    //        $scope.selected[full.Id] = false;
    //        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    //    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('#').withOption('sWidth', '60px').notSortable().withOption('sClass', 'sorting_disabled hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle(caption.ADM_FUNC_LIST_COL_FUNC_RESOURCE_NAME).notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ResourceCode').withTitle(caption.ADM_FUNC_LIST_COL_FUNC_RESOURCE_CODE).notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('GroupResourceTitle').withTitle('{{"GROUP_RESOURCE_NAME" | translate}}').renderWith(function (data, type, full, meta) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Path').withTitle(caption.ADM_FUNC_LIST_COL_FUNC_URL).notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Api').withTitle(caption.ADM_FUNC_LIST_COL_FUNC_API).notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle(caption.ADM_FUNC_LIST_COL_FUNC_DESCRIPTION).notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ParentCode').withTitle('Parent Code').withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Function').withTitle('{{"FUNCTION" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ResourceCode").withTitle("").notSortable().renderWith(function (data, type, full, meta) {
        return "<button class='btn btn-icon-only btn-round btn-danger' ng-click='removeFuncResource(\"" + data + "\")'><i class='fa fa-times white'></i></button>";
    }).withOption('sWidth', '30px').withOption('sClass', 'tcenter'));
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.reload = function () {
        reloadData(true);
        $scope.loadData();
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadData = function () {
        dataservice.getTreeResourceData('', function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.treeData = rs;
            }
        });
    }
    $scope.loadData();

    $scope.addFuncResource = function () {
        if ($scope.model.FunctionCode != null && $scope.model.Resource != undefined) {
            var index = $scope.ListFuncResource.map(function (e) { return e.ResourceCode; }).indexOf($scope.model.Resource.Code);
            if (index > -1) {
                App.toastrError(caption.COM_ERR_EXIST.replace('{0}', caption.ADM_FUNC_RESOURCE));
            } else {
                index = $scope.ListFuncResource.map(function (e) { return e.ResourceCode; }).indexOf($scope.model.Resource.ParentCode);
                if ($scope.model.Resource.ParentCode == null || index > -1) {
                    // Define the row to insert (using your method of choice)
                    var rowInsert = {
                        "_STT": "1",
                        "Title": $scope.model.Resource.Title,
                        "ResourceCode": $scope.model.Resource.Code,
                        "Path": $scope.model.Resource.Path,
                        "Api": $scope.model.Resource.Api,
                        "Status": $scope.model.Resource.Status,
                        "Ord": "0",
                        "Description": $scope.model.Resource.Description,
                        "ParentCode": $scope.model.Resource.ParentCode,
                    };
                    $scope.ListFuncResource.splice(index + 1, 0, rowInsert);
                    var indexAdd = $scope.ListFuncResourceDefault.map(function (e) { return e.Code; }).indexOf($scope.model.Resource.Code);
                    if (indexAdd < 0) {
                        $scope.ListResourceAdd.push($scope.model.Resource.Code);
                    }
                    var indexDel = $scope.ListResourceDel.map(function (e) { return e; }).indexOf($scope.model.Resource.Code);
                    if (indexDel > -1) {
                        $scope.ListResourceDel.splice(indexDel, 1);
                    }

                    // Get table reference - note: dataTable() not DataTable()
                    var table = $('#tblDataRes').dataTable();
                    // Get api
                    var dt = table.api();
                    // Insert row (inserted as the last element in aiDisplayMaster array)
                    dt.row.add(rowInsert);
                    // Get the array holding the rows
                    var aiDisplayMaster = table.fnSettings()['aiDisplayMaster'];
                    // Remove the last element in the array
                    var moveRow = aiDisplayMaster.pop();
                    // EITHER add row to the beginning of the array (uncomment)
                    //aiDisplayMaster.unshift(moveRow);
                    // OR add row to a specific index (in this case to index 3)
                    aiDisplayMaster.splice(index + 1, 0, moveRow);
                    // Redraw Table
                    dt.draw();
                } else {
                    App.toastrError(caption.MSG_ADD_PARENT_FIRST.replace('{0}', caption.ADM_FUNC_RESOURCE));
                }
            }
        } else {
            App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.ADM_FUNC_RESOURCE));
        }
    }
    $scope.refreshFuncResource = function () {
        $scope.model.Resource = undefined;
        $scope.ListResourceAdd = [];
        $scope.ListResourceDel = [];
        $scope.reload();
    }

    $scope.removeFuncResource = function (temp) {
        if ($scope.ListFuncResource.length > 0) {
            var index = $scope.ListFuncResource.map(function (e) { return e.ResourceCode; }).indexOf(temp);
            if (index > -1) {
                var indexChild = $scope.ListFuncResource.map(function (e) { return e.ParentCode; }).indexOf($scope.ListFuncResource[index].ResourceCode);
                if (indexChild > -1) {
                    App.toastrError(caption.MSG_DELETE_CHILD.replace('{0}', caption.ADM_FUNC_RESOURCE));
                } else {
                    var indexDel = $scope.ListFuncResourceDefault.map(function (e) { return e.ResourceCode; }).indexOf(temp);
                    if (indexDel > -1) {
                        $scope.ListResourceDel.push(temp);
                    }
                    var indexAdd = $scope.ListResourceAdd.map(function (e) { return e; }).indexOf(temp);
                    if (indexAdd > -1) {
                        $scope.ListResourceAdd.splice(indexAdd, 1);
                    }
                    $scope.ListFuncResource.splice(index, 1);

                    var table = $('#tblDataRes').dataTable();
                    //var row = table.find('tr').eq(index + 1);
                    var row = table.find('tr').eq(index + 1);
                    table.fnDeleteRow(row[0]);
                }
            }
        }
    }
    $scope.saveFuncResource = function () {
        $scope.model.FunctionCode = para.Code;
        if ($scope.model.FunctionCode != null) {
            if ($scope.ListResourceAdd.length > 0 || $scope.ListResourceDel.length > 0) {
                var modelUpdate = {
                    FunctionCode: $scope.model.FunctionCode,
                    ResourceAdd: $scope.ListResourceAdd,
                    ResourceDel: $scope.ListResourceDel
                }
                dataservice.addResource(modelUpdate, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        $scope.model.Resource = undefined;
                        $scope.reload();
                        App.toastrSuccess(rs.Title);
                    }
                });
            } else {
                App.toastrError(caption.ADM_FUNC_MSG_ADD_OR_DELETE);
            }
        } else {
            App.toastrError(caption.COM_ERR_EXIST.replace("{0}", caption.ADM_FUNC_RESOURCE),)
            App.toastrError('Function is not exists!');
        }
    }

    $timeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 100);

    ////$scope.model = {
    ////    ResourceId: "",
    ////    FunctionId: undefined,
    ////}
    //$scope.cancel = function () {
    //    $uibModalInstance.dismiss('cancel');
    //}
    //$scope.initData = function () {
    //    //alert(JSONtri.sngify(para.Id));
    //    dataservice.getResourceByFunctionId(para.Id, function (rs) {rs=rs.data;
    //        if (rs.Error) {
    //            App.toastrError(rs.Title);
    //        } else {
    //            $scope.tree_data = buildJtree(rs);
    //            dataservice.getTreeResourceData(para.Id, function (result) {result=result.data;
    //                $scope.treeData = result;
    //            });
    //            //dataservice.gettreedata({ IdS: [$rootScope.selectGResourceId], IdI: [rs.Id] }, function (result) {result=result.data;
    //            //    $scope.treeData = result;
    //            //});
    //            //dataservice.getGroupResource(function (result) {result=result.data;
    //            //    $scope.GroupResource = result;
    //            //});
    //            $scope.model = rs;
    //        }
    //    });
    //}
    //$scope.initData();
    //$scope.tree_data = [];
    //$scope.my_tree = tree = {};
    //$scope.expanding_property = {
    //    field: "Title",
    //    width: "200px",
    //    displayName: caption.ADM_FUNC_RESOURCE_NAME,
    //    sortable: true,
    //    filterable: true
    //};
    //var contextMenu = [];
    //contextMenu.push("<li  ><a  ng-click='cellTemplateScope.deletePrivilege(row.branch)' title='" + '{{"DELETE" | translate }}' + "'><i class='fa fa-remove'></i> " + '{{"DELETE" | translate }}' + "</a></li>");
    //$scope.col_defs = [
    //    {
    //        field: "Code", displayName: caption.ADM_FUNC_RESOURCE_CODE, width: "120px",
    //        sortable: tree,
    //        cellTemplate: "<span>{{row.branch['Code']}}</span>",
    //    },
    //    {
    //        field: "Path", displayName: caption.URL, width: "120px",
    //        sortable: tree,
    //        cellTemplate: "<span>{{row.branch['Path']}}</span>",
    //    },
    //    {
    //        field: "Api", displayName: caption.API, width: "120px",
    //        sortable: tree,
    //        cellTemplate: "<span>{{row.branch['Api']}}</span>",
    //    },
    //    {
    //        field: "Description", displayName: caption.ADM_FUNC_LIST_COL_FUNC_DESCRIPTION, width: "250px",
    //        sortable: tree,
    //        cellTemplate: "<span>{{row.branch['Description']}}</span>",
    //    },
    //    //{
    //    //    field: "", displayName: '', width: "50px",
    //    //    sortable: tree,
    //    //    cellTemplate: "<span class='text-center'><button class='btn red' type='button'><i class='fa fa-remove'></i></button></span>",
    //    //},

    //    // Using delete icon button.
    //    {
    //        field: "",
    //        sortable: false, width: '45px',
    //        displayName: "",
    //        colclass: "action",
    //        cellTemplate: "<div class='btn-group  '>"
    //            + "<a class='btn btn-icon-only btn-rectange btn-danger' ng-click='cellTemplateScope.deletePrivilege(row.branch)'><i class='fa fa-times'></i></a>"
    //            + "</div>",
    //        cellTemplateScope: {
    //            deletePrivilege: function (data) {

    //                $scope.delete(data);

    //            }
    //        }
    //    }
    //    //{
    //    //    field: "",
    //    //    sortable: false, width: '45px',
    //    //    displayName: "",
    //    //    colclass: "action",
    //    //    cellTemplate: "<div class='btn-group  '>"
    //    //    + "<a   class='btn btn-icon-xs btn-icon-only ' data-toggle='dropdown'  ><i class='fa fa-list-ul'></i></a>"
    //    //    + "<ul class='dropdown-menu  pull-right' >"
    //    //    + contextMenu.join("")
    //    //    + "</ul>"
    //    //    + "</div>",
    //    //    cellTemplateScope: {
    //    //        deletePrivilege: function (data) {

    //    //            $scope.delete(data);

    //    //        }
    //    //    }
    //    //}
    //];

    //$scope.my_tree_handler = function (branch) {
    //    $rootScope.selectedItem = branch;
    //}
    //function buildJtree(data) {
    //    var tree = [];
    //    if (!data || data.length === 0) return [];
    //    $.each(data, function (index, item) {
    //        if (!item.ParentCode) {
    //            var treeObjs = item;
    //            var sub = subJtree(data, item.Id);
    //            if (sub.length > 0) {
    //                treeObjs.children = sub;
    //            }
    //            treeObjs.expanded = true;
    //            tree.push(treeObjs);
    //        }
    //    });
    //    return tree;
    //}
    //function subJtree(data, parentVal) {
    //    var subTree = [];
    //    $.each(data, function (index, item) {
    //        if (item.ParentCode && item.ParentCode === parentVal) {
    //            var treeObjs = item;
    //            var sub = subJtree(data, item.Id);
    //            if (sub.length > 0) {
    //                treeObjs.children = sub;
    //            }
    //            treeObjs.expanded = true;
    //            subTree.push(treeObjs);
    //        }
    //    });
    //    return subTree;
    //}
    //$scope.addResource = function () {
    //    $scope.model.FunctionCode = para.Code;
    //    var obj = {};
    //    obj.FunctionCode = $scope.model.FunctionCode;
    //    obj.ResourceCode = $scope.model.ResourceCode;
    //    dataservice.addResource(obj, function (rs) {rs=rs.data;
    //        if (rs.Error) {
    //            App.toastrError(rs.Title);
    //        } else {
    //            $scope.model.ResourceCode = undefined;
    //            $scope.reload();
    //            App.toastrSuccess(rs.Title);
    //        }
    //    });


    //$scope.model.FunctionId = para.Id;
    //alert($scope.model.ResourceId);
    //if ($scope.model.FunctionId != null && $scope.model.FunctionId != undefined) {
    //    dataservice.addResource($scope.model, function (rs) {rs=rs.data;
    //        if (rs.Error) {
    //            App.toastrError(rs.Title);
    //        } else {
    //            $scope.model.ResourceId = undefined;
    //            $scope.initData();
    //            App.toastrError(rs.Title);
    //        }
    //    });
    //} else {
    //    App.toastrError('Chưa chọn tài nguyên');
    //}
    //}
    //$scope.delete = function (temp) {
    //    $scope.model.FunctionCode = para.Code;
    //    $scope.model.ResourceCode = temp;
    //    var obj = {};
    //    obj.FunctionCode = $scope.model.FunctionCode;
    //    obj.ResourceCode = $scope.model.ResourceCode;
    //    $confirm({ text: caption.MSG_DELETE_CONFIRM.replace('{0}', caption.ADM_FUNC_RESOURCE), title: caption.CONFIRM, ok: caption.CONFIRM_OK, cancel: caption.CONFIRM_CANCEL })
    //        .then(function () {
    //            dataservice.deletePrivilege(obj, function (rs) {rs=rs.data;
    //                if (rs.Error) {
    //                    App.toastrError(rs.Title);
    //                } else {
    //                    App.toastrSuccess(rs.Title);
    //                    $scope.reload();
    //                }
    //            });
    //        });
    //}
});
