var ctxfolder = "/views/admin/addonApp";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
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
        getAddonStatus: function (callback) {
            $http.post('/Admin/AddonApp/GetAddonStatus').then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/AddonApp/GetItem?id=' + data).then(callback);
        },
        insert: function (data, callback) {
            submitFormUpload('/Admin/AddonApp/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/AddonApp/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/AddonApp/Delete/', data).then(callback);
        },
    }
});
app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, dataservice, $cookies, $translate) {
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
    });
    $rootScope.validationOptions = {
        rules: {
            AppCode: {
                required: true,
                maxlength: 50,
            },
            AppTitle: {
                required: true,
                maxlength: 255,
            },
            AppDate: {
                required: true,
            }
        },
        messages: {
            AppCode: {
                required: caption.ADA_VALIDATE_CODE,
                maxlength: caption.ADA_VALIDATE_CODE_CHARACTER
            },
            AppTitle: {
                required: caption.ADA_VALIDATE_NAME,
                maxlength: caption.ADA_VALIDATE_NAME_CHARACTER
            },
            AppDate: {
                required: caption.ADA_VALIDATE_DATE,
            }
        }
    }
    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/g;
        //var partternTelephone = /[0-9]/g;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.CusCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.ADA_VALIDATE_CHARACTERS_SPACE, "<br/>");
        }
        return mess;
    }
    dataservice.getAddonStatus(function (rs) {
        rs = rs.data;
        $rootScope.StatusData = rs;
    });

});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/AddonApp/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, myService) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Code: '',
        Title: '',
        Date: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AddonApp/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Code = $scope.model.Code;
                d.Title = $scope.model.Title;
                d.Date = $scope.model.Date;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'asc'])
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
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AppCode').withTitle('{{"ADA_LIST_COL_APP_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AppTitle').withTitle('{{"ADA_LIST_COL_APP_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('AppDate').withTitle('{{"ADA_LIST_COL_APP_DATE" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Icon').withTitle('{{"ADA_LIST_COL_ICON" | translate}}').renderWith(function (data, type) {
        return data === "" || data == null ? '<img class="img-circle" src="/images/default/no_image.png" height="30" width="30">' : '<img class="img-circle" src="' + data + '" height="30" width="30">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"ADA_LIST_COL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"ADA_LIST_COL_STATUS" | translate}}').renderWith(function (data, type) {
        if (data == "ACTIVE") {
            return '<span class="text-success"> {{"ADA_MSG_ACTIVITY" | translate}}</span>';
        } else if (data == "DEACTIVE") {
            return '<span class="text-danger">{{"ADA_MSG_INACTIVE" | translate}}</span>';
        } else {
            return '<span class="text-warning">{{"ADA_MSG_UNKNOWN" | translate}}</span>';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"ADA_LIST_COL_ACTION" | translate}}').withOption('sClass', '').renderWith(function (data, type, full, meta) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.search = function () {
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
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                myService.setData(rs.Object);
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '50'
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () { });
            }
        });
    };
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
    };
    function loadDate() {
        $("#date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    function showHideSearch() {
        /*$(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });*/
    }
    setTimeout(function () {
        showHideSearch();
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance) {
    $scope.model = {
        AppCode: '',
        AppTitle: '',
        AppDate: '',
        LinkChplay: '',
        Status: '',
        Note: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.changleSelect = function (selectType) {
        if (selectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addForm.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var data = new FormData();
            var file = document.getElementById("fileIconApp").files[0];
            if (file != null) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var name = file.name.substr(0, idxDot - 1).toLowerCase();
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                var img = ['png', 'jpg', 'PNG', 'gif'];
                if (img.indexOf(extFile) !== -1) {
                    data.append("icon", file);
                } else {
                    App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                    return;
                }
            }
            data.append("AppCode", $scope.model.AppCode);
            data.append("AppTitle", $scope.model.AppTitle);
            data.append("AppDate", $scope.model.AppDate);
            data.append("LinkChplay", $scope.model.LinkChplay);
            data.append("Status", $scope.model.Status);
            data.append("Note", $scope.model.Note);
            dataservice.insert(data, function (result) {
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

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        return mess;
    };
    function loadDate() {
        $("#appDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        loadDate();
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, myService) {
    $scope.initLoad = function () {
        $scope.model = myService.getData();
    }
    $scope.initLoad();

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editForm.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            var data = new FormData();
            var file = document.getElementById("fileIconApp").files[0];
            if (file != null) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var name = file.name.substr(0, idxDot - 1).toLowerCase();
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                var img = ['png', 'jpg', 'PNG', 'gif'];
                if (img.indexOf(extFile) !== -1) {
                    data.append("icon", file);
                } else {
                    App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                    return;
                }
            }
            data.append("Id", $scope.model.Id);
            data.append("AppCode", $scope.model.AppCode);
            data.append("AppTitle", $scope.model.AppTitle);
            data.append("AppDate", $scope.model.AppDate);
            data.append("LinkChplay", $scope.model.LinkChplay);
            data.append("Status", $scope.model.Status);
            data.append("Note", $scope.model.Note);
            dataservice.update(data, function (result) {
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

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.Status == "") {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        return mess;
    };

    function loadDate() {
        $("#appDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    }

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        loadDate();
    }, 200);

});