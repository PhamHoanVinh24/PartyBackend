var ctxfolderSVC = "/views/admin/companyRule";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_SVC', ["ui.bootstrap", "angularjs-dropdown-multiselect", 'ng.jsoneditor', 'dynamicNumber', "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce']);

app.factory('dataserviceSVC', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload2 = function (url, data, callback) {

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
            $http.post('/Admin/CompanyRule/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/CompanyRule/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/CompanyRule/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/CompanyRule/GetItem/' + data).then(callback);
        },
        getStatusCompanyRule: function (callback) {
            $http.post('/Admin/CompanyRule/GetStatusCompanyRule').then(callback);
        },
        getDescriptionCompanyRule: function (callback) {
            $http.post('/Admin/CompanyRule/GetDescriptionCompanyRule').then(callback);
        },
        getItemCompanyRule: function (callback) {
            $http.post('/Admin/CompanyRule/GetItemCompanyRule').then(callback);
        },
        getItemCodeCompanyRule: function (callback) {
            $http.post('/Admin/CompanyRule/GetItemCodeCompanyRule').then(callback);
        },
        getNoteCompanyRule: function (callback) {
            $http.post('/Admin/CompanyRule/GetNoteCompanyRule').then(callback);
        },
        
    }
});
app.controller('Ctrl_ESEIM_SVC', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataserviceSVC, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                ItemCode: {
                    required: true,
                },
                Item: {
                    required: true,
                },
            },
            messages: {
                ItemCode: {
                    required: caption.COMP_RULE_VALIDATE_CODE,
                },
                Item: {
                    required: caption.COMP_RULE_VALIDATE_TITLE,
                },
            }
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CompanyRule/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderSVC + '/index.html',
            controller: 'index'
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSVC, $translate, $window) {
    // declare variable
    $scope.model = {
        Item: '',
        Description: '',
    }
    // config main table
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CompanyRule/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Item = $scope.model.Item;
                d.Description = $scope.model.Description;
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
           
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml)
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('{{"COMP_RULE_ID" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ItemCode').withTitle('{{"COMP_RULE_CODE" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"COMP_RULE_GROUP" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Item').withTitle('{{"COMP_RULE_TITLE" | translate}}').withOption('sClass', 'nowrap w30').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"COMP_RULE_STATUS" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, type) {
        return data;
    }));
    //tạo column
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"COMP_RULE_NOTE" | translate}}').withOption('sClass', 'nowrap w70').renderWith(function (data, type) {
        return data;
    }));
    // tạo stick thao tác
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag').notSortable().withOption('sClass', 'w75').withTitle('{{"Thao tác" | translate}}').renderWith(function (data, type, full) {
        return '<a ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-duotone fa-pen-to-square fs20 color-cf-blue pr-2"></i></a>' +
            '<a title="Xoá" ng-click="delete(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    function callback(json) {

    }
    function toggleAll(
        All, selectedItems) {
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
   
    // end config main table

    // init function to populate data to controller
    $scope.initData = function () {
        dataserviceSVC.getStatusCompanyRule(function (rs) {
            rs = rs.data;
            $rootScope.listStatusCompanyRule = rs;
        });
        dataserviceSVC.getItemCodeCompanyRule(function (rs) {
            rs = rs.data;
            $rootScope.listItemCodeCompanyRule = rs;
        });
        dataserviceSVC.getItemCompanyRule(function (rs) {
            rs = rs.data;
            $rootScope.listItemCompanyRule = rs;
        });
        dataserviceSVC.getDescriptionCompanyRule(function (rs) {
            rs = rs.data;
            $rootScope.listDescriptionCompanyRule = rs;
        });
        dataserviceSVC.getNoteCompanyRule(function (rs) {
            rs = rs.data;
            $rootScope.listNoteCompanyRule = rs;
        });
    }

    $scope.initData();

    // toggle on off search box //Bật tắt search box
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    // popup add form to insert data into database
    $scope.add = function () {
        $rootScope.ServiceCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSVC + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        },
        function () {
        });
    }

    // popup edit form to edit existing data in database
    $scope.edit = function (id) {
        dataserviceSVC.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderSVC + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                });
            }
        });
    }

    // popup confirm dialog to delete existing data in database
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceSVC.delete(id, function (rs) {
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

    }, 50);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceSVC) {
    // declare variable
    $scope.model = {
        ItemCode: '',
        Item: '',
        Description: '',
        Status: '',
        Note: ''
    }
    $scope.id = '';

    // cancel to close popup
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    // submit to save model to database
    $scope.submit = function () {
        if (CKEDITOR.instances['Content']) {
            var data = CKEDITOR.instances['Content'].getData();
            $scope.model.Note = data;
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.id == '') {
                dataserviceSVC.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.id = rs.Object;
                        $uibModalInstance.close();
                    }
                });
            }
        }
    }

    // listen when user choose a item in combobox
    $scope.changleSelect = function (SelectType) {

    }

    // validate model (show error when user do not enter specific value)
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        return mess;
    };

    // convert textbox into ckeditor (word editor)
    function ckEditer() {
        var editor = CKEDITOR.replace('Content', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Content'].config.height = 80;
    }

    // a function that run later instead of instantly
    setTimeout(function () {

        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 1000);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataserviceSVC, para) {
    // declare variable
    $scope.model = {
        ItemCode: '',
        Item: '',
        Description: '',
        Status: '',
        Note: ''
    }

    // cancel to close popup
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }

    // init function to populate data to controller
    $scope.initData = function () {
        $scope.model = para;
    }
    $scope.initData();

    // submit to save model to database
    $scope.submit = function () {
        if (CKEDITOR.instances['Content']) {
            var data = CKEDITOR.instances['Content'].getData();
            $scope.model.Note = data;
        }
        if ($scope.editform.validate()) {
            dataserviceSVC.update($scope.model, function (rs) {
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

    // listen when user choose a item in combobox
    $scope.changleSelect = function (SelectType) {

    }

    // validate model (show error when user do not enter specific value)
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        return mess;
    };

    // convert textbox into ckeditor (word editor)
    function ckEditer() {
        var editor1 = CKEDITOR.replace('Content', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Content'].config.height = 80;
    }

    // a function that run later instead of instantly
    setTimeout(function () {
        ckEditer();
        //initAutocomplete();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 1000);
});