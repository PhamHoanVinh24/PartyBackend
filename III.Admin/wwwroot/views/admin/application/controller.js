var ctxfolder = "/views/admin/application";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
    .directive("filesInput", function () {
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
        var config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        var formData = new FormData();
        formData.append("ApplicationId", data.ApplicationId);
        formData.append("Title", data.Title);
        formData.append("ApplicationCode", data.ApplicationCode);
        formData.append("AppUrl", data.AppUrl);
        formData.append("Ord", data.Ord);
        formData.append("UploadIcon", data.UploadIcon != null && data.UploadIcon.length > 0 ? data.UploadIcon[0] : null);

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }

        $http(req).then(callback);
    };
    return {
        insert: function (data, callback) {
            submitFormUpload('/Admin/application/insert', data, callback);
            //$http.post('/application/insert', data).then(callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/application/update', data, callback);
            //$http.post('/application/update', data).then(callback);
        },
        deleteItems: function (data, callback) {
            $http.post('/Admin/application/deleteItems', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/application/delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/application/getitem/' + data).then(callback);
        },
        resort: function (data, callback) {
            $http.post('/Admin/application/resort', data).then(callback);
        },
        getAll: function (callback) {
            $http.post('/Admin/application/getAll/').then(callback);
        },
        GetFunctionById: function (data, callback) {
            $http.post('/Admin/application/GetFunctionById/' + data).then(callback);
        },
        JTableFunctionByApplicationId: function (data, callback) {
            $http.post('/Admin/application/JTableFunctionByApplicationId', data).then(callback);
        },
        //GetFunctionItem: function (data, callback) {
        //    $http.post('/application/GetTreeData/' + data).then(callback);
        //},
        GetFunctionItem: function (callback) {
            $http.post('/Admin/application/GetTreeFunction').then(callback);
        },
        InsertFunction: function (data, callback) {
            $http.post('/Admin/application/insertfunction/', data).then(callback);
        },
        deleteFunction: function (data, callback) {
            $http.post('/Admin/application/deleteFunction/', data).then(callback);
        },
        checkUsing: function (data, callback) {
            $http.post('/Admin/application/CheckUsing/' + data).then(callback);
        },
        checkListUsing: function (data, callback) {
            $http.post('/Admin/application/CheckListUsing', data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
            //var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            var partternUrl = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^!@$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng & dấu #
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ApplicationCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.ADM_APP_CURD_LBL_APP_CODE), "<br/>");
            }
            if (!partternName.test(data.Title)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.ADM_APP_CURD_LBL_APP_NAME) + "<br/>";
            }
            if (!partternUrl.test(data.AppUrl)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM.replace('{0}', caption.ADM_APP_CURD_LBL_APP_URL) + "<br/>";
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255
                },
                ApplicationCode: {
                    required: true,
                    maxlength: 50
                },
                Ord: {
                    required: true,
                    maxlength: 5
                },
                AppUrl: {
                    required: true,
                    maxlength: 255
                }
            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_APP_CURD_LBL_APP_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_APP_CURD_LBL_APP_NAME).replace('{1}', '255')
                },
                ApplicationCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ADM_APP_CURD_LBL_APP_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.ADM_APP_CURD_LBL_APP_CODE).replace("{1}", "50")
                },
                Ord: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ORDER),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ORDER_SORT).replace('{1}', '5')
                },
                AppUrl: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.ADM_APP_CURD_LBL_APP_URL),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.ADM_APP_CURD_LBL_APP_URL).replace("{1}", "255")
                }
            }
        }
        $rootScope.StatusData = [{
            Value: 1,
            Name: caption.ADM_APP_CURD_LBL_APP_ACTIVE
        }, {
            Value: 0,
            Name: caption.ADM_APP_CURD_LBL_APP_INACTIVE
        }];

    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {

    $translateProvider.useUrlLoader('/Admin/application/Translation');
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
        }).when('/function/', {
            templateUrl: ctxfolder + '/function.html',
            controller: 'function'
        });

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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice) {

    var vm = $scope;
    $scope.model = {
        AppCode: '',
        Name: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/application/jtable",
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
                d.AppCode = $scope.model.AppCode;
                d.Name = $scope.model.Name;
                // d.query = $scope.searchdata;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [2, 'asc'])
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
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected, $event)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('#').withOption('sWidth', '60px').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle('{{"APP_CODE" | translate}}').withOption('sClass', 'mw70'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ApplicationCode').withTitle('{{"ADM_APP_LIST_COL_APP_CODE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"ADM_APP_LIST_COL_APP_NAME" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Icon').withTitle('{{"ADM_APP_LIST_COL_APP_ICON" | translate}}').withOption('sClass', 'tcenter').renderWith(function (data, type) {
        //return data === "" ? "" : '<img src="' + data + '" height="30" width="30">  onerror ="this.src='imagesdefaultno_image.png'"';
        return '<img style="width:64px; height:64px" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + ' height="30" width="30">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AppUrl').withTitle('{{"ADM_APP_LIST_COL_APP_URL" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"DESCRIPTION" | translate}}').renderWith(function (data, type) {
    //    return data;
    //})); 
    //vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"STATUS" | translate}}').withOption('sClass', 'mw70').renderWith(function (data, type) {
    //    if (data === "1") return caption.ACTIVE;
    //    if (data === "0") return caption.INACTIVE; 
    //    return "";
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ord').withTitle('{{"ADM_APP_LIST_COL_APP_ORDER" | translate}}').withOption('sWidth', '60px').withOption('sClass', 'wpercent5 text-center'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap wpercent5 text-center').withTitle('{{"ADM_APP_LIST_COL_APP_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a ng-click="edit(' + full.Id + ')" style1 = "width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs20 pr20"></i></a>' +
            '<a title="{{&quot; ADM_TITLE_DEL &quot; | translate}}" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash fs20"></i></a>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.reload = function () {
        reloadData(true);
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



    $scope.contextMenu = [
        //[function ($itemScope) {
        //    return '<i class="fa fa-edit"></i>' + caption.EDIT;
        //}, function ($itemScope, $event, model) {
        //    var modalInstance = $uibModal.open({
        //        animation: true,
        //        templateUrl: ctxfolder + '/edit.html',
        //        controller: 'edit',
        //        backdrop: 'static',
        //        size: 'lg',
        //        resolve: {
        //            para: function () {
        //                return $itemScope.data.Id;
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function (d) {
        //        $scope.reload();
        //    }, function () {
        //    });
        //}, function ($itemScope, $event, model) {
        //    return true;
        //}],
        //[function ($itemScope) {
        //    return '<i class="fa fa-remove"></i>' + caption.DELETE;
        //}, function ($itemScope, $event, model) {
        //    bootbox.confirm({
        //        title: caption.CONFIRM,
        //        message: caption.COM_MSG_DELETE_CONFIRM.replace('{0}', $itemScope.data.Title),
        //        buttons: {
        //            confirm: {
        //                label: 'Yes',
        //                className: 'btn-primary'
        //            },
        //            cancel: {
        //                label: 'Cancel',
        //                className: 'btn-default'
        //            }
        //        },
        //        callback: function (result) {result=result.data;
        //            if (result) {
        //                App.blockUI({
        //                    target: "#contentMain",
        //                    boxed: true,
        //                    message: 'loading...'
        //                });

        //                dataservice.delete($itemScope.data.Id, function (res) {
        //                    if (res.Error) {
        //                        App.toastrError(res.Title);
        //                    } else {
        //                        App.toastrSuccess(res.Title);
        //                        $scope.reload();
        //                    }
        //                    App.unblockUI("#contentMain");
        //                });
        //            }
        //        }
        //    });
        //    //$confirm({ text: caption.COM_MSG_DELETE_CONFIRM.replace('{0}', $itemScope.data.Title), title: caption.CONFIRM, cancel: caption.CONFIRM_CANCEL })
        //    //    .then(function () {
        //    //        App.blockUI({
        //    //            target: "#contentMain",
        //    //            boxed: true,
        //    //            message: 'loading...'
        //    //        });
        //    //        //dataservice.checkUsing($itemScope.data.Id, function (result) {result=result.data;
        //    //        //    if (result.Error) {
        //    //        //        App.toastrError(result.Title);
        //    //        //    } else {

        //    //        //    }
        //    //        //});
        //    //        dataservice.delete($itemScope.data.Id, function (result) {result=result.data;
        //    //            if (result.Error) {
        //    //                App.toastrError(result.Title);
        //    //            } else {
        //    //                App.toastrSuccess(result.Title);
        //    //                $scope.reload();
        //    //            }
        //    //            App.unblockUI("#contentMain");
        //    //        });
        //    //    });
        //}, function ($itemScope, $event, model) {
        //    return true;
        //}],
        [function ($itemScope) {
            return '<i class="fa fa-sitemap"></i> ' + caption.ADM_FUNC_FUNC_MANAGEMENT;
        }, function ($itemScope, $event, model) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/function.html',
                controller: 'function',
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
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM ;
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
    //$scope.sort = function () {
    //    var modalInstance = $uibModal.open({
    //        animation: true,
    //        templateUrl: ctxfolder + '/sort.html',
    //        controller: 'sort',
    //        backdrop: 'static',
    //        size: '60'
    //    });
    //    modalInstance.result.then(function (d) {
    //        $scope.reload();
    //    }, function () {
    //    });
    //}
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
    //        bootbox.confirm({
    //            title: caption.CONFIRM,
    //            message: caption.COM_MSG_DELETE_LIST_CONFIRM.replace('{0}', caption.APPLICATION.toLowerCase()),
    //            buttons: {
    //                confirm: {
    //                    label: 'Yes',
    //                    className: 'btn-primary'
    //                },
    //                cancel: {
    //                    label: 'Cancel',
    //                    className: 'btn-default'
    //                }
    //            },
    //            callback: function (result) {result=result.data;
    //                if (result) {
    //                    App.blockUI({
    //                        target: "#contentMain",
    //                        boxed: true,
    //                        message: 'loading...'
    //                    });

    //                    dataservice.deleteItems(deleteItems, function (res) {
    //                        if (res.Error) {
    //                            App.toastrError(res.Title);
    //                            $scope.reload();
    //                        } else {
    //                            App.toastrSuccess(res.Title);
    //                            $scope.reload();
    //                        }
    //                        App.unblockUI("#contentMain");
    //                    });
    //                }
    //            }
    //        });

    //        //$confirm({ text: caption.COM_MSG_DELETE_LIST_CONFIRM.replace('{0}', caption.APPLICATION.toLowerCase()), title: caption.CONFIRM, ok: caption.CONFIRM_OK, cancel: caption.CONFIRM_CANCEL })
    //        //    .then(function () {
    //        //        //App.blockUI({
    //        //        //    target: "#contentMain",
    //        //        //    boxed: true,
    //        //        //    message: 'loading...'
    //        //        //});
    //        //        dataservice.deleteItems(deleteItems, function (result) {result=result.data;
    //        //            if (result.Error) {
    //        //                App.toastrError(result.Title);
    //        //                $scope.reload();
    //        //            } else {
    //        //                App.toastrSuccess(result.Title);
    //        //                $scope.reload();
    //        //            }
    //        //            App.unblockUI("#contentMain");
    //        //        });
    //        //    });
    //    } else {
    //        App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.APPLICATION));
    //    }
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
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        ApplicationId: 0
    }
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
            var fileName = $('input[type=file]').val();





            //var fileUpload = $("#fileIconApp")[0];
            //var reader = new FileReader();
            //reader.readAsDataURL(fileUpload.files[0]);
            //reader.onload = function(e) {
            //    //Initiate the JavaScript Image object.
            //    var image = new Image();
            //    //Set the Base64 string return from FileReader as source.
            //    image.src = e.target.result;
            //    image.onload = function() {
            //        //Determine the Height and Width.
            //        var height = this.height;
            //        var width = this.width;
            //    };
            //}

            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('fileIconApp');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 20) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#fileIconApp")[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                var height = this.height;
                                var width = this.width;
                                //if (width > 48 || height > 48) {
                                //    App.toastrError("Maximum allowed file size is (48px x 48px)!");
                                //} else {
                                dataservice.insert($scope.model,
                                    function (rs) {rs=rs.data;
                                        if (rs.Error) {
                                            App.toastrError(rs.Title);
                                        } else {
                                            App.toastrSuccess(rs.Title);
                                            $uibModalInstance.close();
                                        }
                                    });
                                //}
                            };
                        }
                    }
                }
            } else {
                dataservice.insert($scope.model,
                    function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
            }
        }
    }

    $timeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 100);
});
app.controller('sort', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataservice.getAll(function (rs) {rs=rs.data;
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
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
                $scope.model.UploadIcon = null;
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
            var fileName = $('input[type=file]').val();
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            if (extFile != "") {
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.COM_MSG_FORMAT_PNG_JPG_JEG_GIF_BMP);
                } else {
                    var fi = document.getElementById('fileIconApp');
                    var fsize = (fi.files.item(0).size) / 1024;
                    if (fsize > 20) {
                        App.toastrError(caption.COM_MSG_MAXIMUM_FILE);
                    } else {
                        var fileUpload = $("#fileIconApp")[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(fileUpload.files[0]);
                        reader.onload = function (e) {
                            //Initiate the JavaScript Image object.
                            var image = new Image();
                            //Set the Base64 string return from FileReader as source.
                            image.src = e.target.result;
                            image.onload = function () {
                                //Determine the Height and Width.
                                //var height = this.height;
                                //var width = this.width;
                                //if (width > 48 || height > 48) {
                                //    App.toastrError("Maximum allowed file size is (48px x 48px)!");
                                //} else {
                                dataservice.update($scope.model, function (rs) {rs=rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                    } else {
                                        App.toastrSuccess(rs.Title);
                                        $uibModalInstance.close();
                                    }
                                });
                                //}
                            };
                        }
                    }
                }
            } else {
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
    }

    $timeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 100);
});
app.controller('function', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $uibModalInstance, para, $timeout) {
    //console.log(para);
    $scope.App = para.Title;
    var vm = $scope;
    $scope.model = {
        Id: para.Id,
        ApplicationCode: para.ApplicationCode,
    };
    $scope.selected = [];
    $scope.ListAppFunctionDefault = [];
    $scope.ListAppFunction = [];
    $scope.ListFunctionAdd = [];
    $scope.ListFunctionDel = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/application/JTableFunctionByApplicationId",
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
                d.Id = $scope.model.Id;
                d.Code = $scope.model.ApplicationCode;
            },
            complete: function (rs) {
                $scope.ListAppFunction = rs.responseJSON.data;
                $scope.ListAppFunctionDefault = angular.copy(rs.responseJSON.data);

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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('#').notSortable().withOption('sClass', 'sorting_disabled').withOption('sWidth', '60px').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle(caption.ADM_APP_CURD_COL_FUNC_NAME).notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data.replace(/. . . /g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Code').withTitle(caption.ADM_APP_CURD_COL_FUNC_CODE).notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type, full, meta) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ParentId').withTitle('ParentId').notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle(caption.ADM_APP_CURD_COL_FUNC_DESCRIPTION).notSortable().withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn("Code").withTitle("").notSortable().renderWith(function (data, type, full, meta) {
        //$scope.selected[full.Id] = false;
        //return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        return '<button class="btn btn-icon-only btn-round  btn-danger" ng-click="removeAppFunction(\'' + data + '\')"><i class="fa fa-times white"></i></button>';
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
        //$scope.loadData();
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadData = function () {
        dataservice.GetFunctionItem(function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.liFunction = rs;
            }
        });
    }
    $scope.loadData();

    $scope.addAppFunction = function () {
        if ($scope.model.ApplicationCode != null && $scope.model.Function != undefined) {
            var index = $scope.ListAppFunction.map(function (e) { return e.Code; }).indexOf($scope.model.Function.Code);
            if (index > -1) {
                App.toastrError(caption.COM_ERR_EXIST.replace('{0}', caption.ADM_FUNC_TITLE_FUNC));
            } else {
                index = $scope.ListAppFunction.map(function (e) { return e.Code; }).indexOf($scope.model.Function.ParentCode);
                if ($scope.model.Function.ParentCode == null || index > -1) {
                    // Define the row to insert (using your method of choice)
                    var rowInsert = {
                        "Id": $scope.model.Function.Id,
                        "Code": $scope.model.Function.Code,
                        "Title": $scope.model.Function.Title.replace(/- /g, '. . . '),
                        "Description": $scope.model.Function.Description,
                        "ParentCode": $scope.model.Function.ParentCode,
                        "Ord": "0",
                        "_STT": "1"
                    };

                    $scope.ListAppFunction.splice(index + 1, 0, rowInsert);
                    var indexAdd = $scope.ListAppFunctionDefault.map(function (e) { return e.Code; }).indexOf($scope.model.Function.Code);
                    if (indexAdd < 0) {
                        $scope.ListFunctionAdd.push($scope.model.Function.Code);
                    }
                    var indexDel = $scope.ListFunctionDel.map(function (e) { return e; }).indexOf($scope.model.Function.Code);
                    if (indexDel > -1) {
                        $scope.ListFunctionDel.splice(indexDel, 1);
                    }

                    // Get table reference - note: dataTable() not DataTable()
                    var table = $('#tblData').dataTable();
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
                    App.toastrError(caption.COM_MSG_ADD_PARENT_FIRST.replace('{0}', caption.ADM_FUNC_TITLE_FUNC));
                }
            }
        } else {
            App.toastrError(caption.COM_ERR_NOT_CHECKED.replace('{0}', caption.ADM_FUNC_TITLE_FUNC));
        }
    }
    $scope.refreshAppFunction = function () {
        $scope.model.Function = undefined;
        $scope.ListFunctionAdd = [];
        $scope.ListFunctionDel = [];
        $scope.reload();
    }
    $scope.removeAppFunction = function (temp) {
        if ($scope.ListAppFunction.length > 0) {
            var index = $scope.ListAppFunction.map(function (e) { return e.Code; }).indexOf(temp);
            if (index > -1) {
                var indexChild = $scope.ListAppFunction.map(function (e) { return e.ParentCode; }).indexOf($scope.ListAppFunction[index].Code);
                if (indexChild > -1) {
                    App.toastrError(caption.COM_MSG_DELETE_CHILD.replace('{0}', caption.FUNCTION));
                } else {
                    var indexDel = $scope.ListAppFunctionDefault.map(function (e) { return e.Code; }).indexOf(temp);
                    if (indexDel > -1) {
                        $scope.ListFunctionDel.push(temp);
                    }
                    var indexAdd = $scope.ListFunctionAdd.map(function (e) { return e; }).indexOf(temp);
                    if (indexAdd > -1) {
                        $scope.ListFunctionAdd.splice(indexAdd, 1);
                    }
                    $scope.ListAppFunction.splice(index, 1);

                    var table = $('#tblData').dataTable();
                    var row = table.find('tr').eq(index + 1);
                    table.fnDeleteRow(row[0]);
                }
            }
        }
    }
    $scope.saveAppFunction = function () {
        $scope.model.ApplicationCode = para.ApplicationCode;
        if ($scope.model.ApplicationCode != null) {
            if ($scope.ListFunctionAdd.length > 0 || $scope.ListFunctionDel.length > 0) {
                var modelUpdate = {
                    ApplicationCode: $scope.model.ApplicationCode,
                    FunctionAdd: $scope.ListFunctionAdd,
                    FunctionDel: $scope.ListFunctionDel
                }
                dataservice.InsertFunction(modelUpdate, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        $scope.model.Function = undefined;
                        $scope.reload();
                        App.toastrSuccess(rs.Title);
                    }
                });
            } else {
                App.toastrError(caption.ADM_MSG_FUNC_UPDATE);
            }
        } else {
            App.toastrError(caption.COM_ERR_EXIST);
        }
    }

    $scope.deleteFunction = function (temp) {
        $scope.model.ApplicationCode = para.ApplicationCode;
        $scope.model.FunctionCode = temp;
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            resolve: {
                para: function () {
                    return $$scope.model;
                }
            },
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM;
                $scope.ok = function () {
                    dataservice.deleteFunction(para, function (rs) {rs=rs.data;
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
        setModalDraggable('.modal-dialog');
    }, 200);
});
