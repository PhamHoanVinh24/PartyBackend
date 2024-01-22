var ctxfolder = "/views/admin/cmsExtraField";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        //CommonSetting
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

        getUser: function (callback) {
            $http.post('/Admin/FundCatReptExps/GetUser').then(callback);
        },
        //getAsset: function (callback) {
        //    $http.post('/Admin/FundCatReptExps/GetAsset/').then(callback);
        //},
        getGetCatCode: function (callback) {
            $http.post('/Admin/FundAccEntry/GetCatCode').then(callback);
        },
        getCatParent: function (callback) {
            $http.post('/Admin/FundCatReptExps/GetCatParent/').then(callback);
        },
        getCatFund: function (callback) {
            $http.post('/Admin/FundCatReptExps/GetCatFund/').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/CMSExtraField/GetItem/', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/CMSExtraField/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/CMSExtraField/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/CMSExtraField/Delete/' + data).then(callback);
        },
        getProceduce: function (callback) {
            $http.get('/Admin/FundCatReptExps/RunProceduce').then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/GetTreeData', data).then(callback);
        },
        getExtraFieldGroup: function (callback) {
            $http.post('/Admin/CMSExtraField/GetExtraFieldGroup').then(callback);
        },

    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
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
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.CatCode)) {
                mess.Status = true;
                mess.Title = mess.Title.CatCode(" - ", "{{'CEF_MSG_TITLE_ERR' | translate}}", "<br/>");
            }
            //if (!partternName.test(data.CatName)) {
            //    mess.Status = true;
            //    mess.Title += caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.AA_CURD_LBL_AA_ACTTITLE) + "<br/>";
            //    //mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.USER_USERNAME) + "<br/>";
            //}
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Name: {
                    required: true,
                },
            },
            messages: {
                Name: {
                    required: "Tên mở rộng không được bỏ trống ",
                    //required: caption.CEF_VALIDATE_NAME,
                },
            }
        }
        $rootScope.IsTranslate = true;



    });
    dataservice.getUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
    $scope.initData = function () {
        dataservice.getGetCatCode(function (rs) {
            rs = rs.data;
            $rootScope.listCatCode = rs;
        })

    }
    $scope.initData();
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CMSExtraField/Translation');
    //$translateProvider.preferredLanguage('en-US');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    var vm = $scope;
    $scope.model = {
        name: '',
        value: '',
        type: '',
        group: '',
        published: '',
        ordering: ''
    };

    $scope.catCode = '';

    $scope.getGetCatCode

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CMSExtraField/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.name = $scope.model.name;
                d.value = $scope.model.value;
                d.value = $scope.model.value;
                d.type = $scope.model.type;
                d.group = $scope.model.group;
                d.published = $scope.model.published;
                d.ordering = $scope.model.ordering;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [6, 'desc'])
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
                    var Id = data.fieldID;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sClass', ' hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fieldName').withOption('sClass', 'nowrap dataTable-30per').withTitle('{{"CEF_CL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('groupName').withOption('sClass', 'nowrap dataTable-30per').withTitle('{{"CEF_CL_GROUP" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('type').withOption('sClass', 'nowrap dataTable-20per').withTitle('{{"CEF_CL_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ordering').withOption('sClass', 'nowrap dataTable-30per').withTitle('{{"CEF_CL_ORDERING" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('published').withOption('sClass', 'nowrap dataTable-30per').withTitle('{{"Published" | translate}}').renderWith(function (data, type) {

        if (data == "True") {
            return '<span class="cursor glyphicon glyphicon-ok-sign text-success fs20 pTip-right btn-publish-inline"></span> '
        }
        else {
            return '<span class="cursor glyphicon glyphicon-ban-circle text-danger fs20 pTip-right btn-publish-inline"></span> '
        }

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fieldID').withOption('sClass', 'nowrap dataTable-30per').withTitle('{{"ID" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.fieldID + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.fieldID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.listPublished = [
        { Code: '', Name: 'Tất cả' },
        {
            Code: false,
            Name: "Ẩn"
        }, {
            Code: true,
            Name: "Hiển thị"
        }
    ];

    $scope.listTypeExtraField = [
        { Code: '', Name: 'Tất cả' },
        {
            Code: "Text Field",
            Name: "Text Field"
        },
        {
            Code: "Textarea",
            Name: "Textarea"
        },
        {
            Code: "Drop-down selection",
            Name: "Drop-down selection"
        },
        {
            Code: "Multi-select list",
            Name: "Multi-select list"
        },
        {
            Code: "Radio buttons",
            Name: "Radio buttons"
        },
        {
            Code: "Checkbox buttons",
            Name: "Checkbox buttons"
        },
        {
            Code: "Label",
            Name: "Label"
        },
        {
            Code: "Link",
            Name: "Link"
        },
        {
            Code: "Date",
            Name: "Date"
        },

    ];
    $scope.initData = function () {
        dataservice.getCatFund(function (rs) {
            rs = rs.data;
            $rootScope.listTypeFund = rs;
        });
        dataservice.getExtraFieldGroup(function (rs) {
            rs = rs.data;
            $rootScope.listExtraFieldGroup = rs;
            var all = {
                Id: '',
                Name: 'Tất cả'
            }
            $scope.listExtraFieldGroup.unshift(all)
        });
    };
    $scope.initData();

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
    };

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '40',
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
    };

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                            $uibModalInstance.close();
                        } else {
                            App.toastrSuccess(result.Title);
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
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.model = {
        name: '',
        published: false,
        group: '',
        type: '',
        value: '',
        ordering:''
    }
    $scope.model1 = {
        listMember: []
    }
    $scope.listTypeExtraField = [
        {
            Code: "Text Field",
            Name: "Text Field"
        },
        {
            Code: "Textarea",
            Name: "Textarea"
        },
        {
            Code: "Drop-down selection",
            Name: "Drop-down selection"
        },
        {
            Code: "Multi-select list",
            Name: "Multi-select list"
        },
        {
            Code: "Radio buttons",
            Name: "Radio buttons"
        },
        {
            Code: "Checkbox buttons",
            Name: "Checkbox buttons"
        },
        {
            Code: "Label",
            Name: "Label"
        },
        {
            Code: "Link",
            Name: "Link"
        },
        {
            Code: "Date",
            Name: "Date"
        }

    ];
    $scope.initData = function () {
        dataservice.getCatFund(function (rs) {
            rs = rs.data;
            $rootScope.listTypeFund = rs;
            $scope.model.CatType = rs.length != 0 ? rs[0].Code : '';
        });
        dataservice.getGetCatCode(function (rs) {
            rs = rs.data;
            $rootScope.listCatCode = rs;
        });
        dataservice.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
        });
        dataservice.getExtraFieldGroup(function (rs) {
            rs = rs.data;
            $rootScope.listExtraFieldGroup = rs;
            var all = {
                Id: '',
                Name: 'Tất cả'
            }
            $scope.listExtraFieldGroup.unshift(all)
        });
    };
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insert($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    };
    $scope.addCommonSettingCatType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CAT_FUND_TYPE',
                        GroupNote: 'Loại danh mục quỹ',
                        AssetCode: 'CAT_FUND'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getCatFund(function (rs) {
                rs = rs.data;
                $rootScope.listTypeFund = rs;
            })
        }, function () { });
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "group" && $scope.model.group != "") {
            $scope.errorGroup = false;
        }
        if (SelectType == "type" && $scope.model.type != "") {
            $scope.errorType = false;
        }
    }
    function validationSelect(data) {
        //var mess = { Status: false, Title: "" }
        //if (data.CatType == "" || data.CatType == null) {
        //    $scope.errorCatType = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorCatType = false;

        //}
        //return mess;

        var mess = { Status: false, Title: "" }
        if (data.group == "" || data.group == null) {
            $scope.errorGroup = true;
            mess.Status = true;
        } else {
            $scope.errorGroup = false;

        }
        if (data.type == "" || data.type == null) {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;

        }
        return mess;

    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model1 = {
        listMember: []
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.listTypeExtraField = [
        {
            Code: "Text Field",
            Name: "Text Field"
        },
        {
            Code: "Textarea",
            Name: "Textarea"
        },
        {
            Code: "Drop-down selection",
            Name: "Drop-down selection"
        },
        {
            Code: "Multi-select list",
            Name: "Multi-select list"
        },
        {
            Code: "Radio buttons",
            Name: "Radio buttons"
        },
        {
            Code: "Checkbox buttons",
            Name: "Checkbox buttons"
        },
        {
            Code: "Label",
            Name: "Label"
        },
        {
            Code: "Link",
            Name: "Link"
        },
        {
            Code: "Date",
            Name: "Date"
        }

    ];
    $scope.initData = function () {
        dataservice.getCatFund(function (rs) {
            rs = rs.data;
            $rootScope.listTypeFund = rs;
        })
        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {

                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
            }
        });
        dataservice.getGetCatCode(function (rs) {
            rs = rs.data;
            $rootScope.listCatCode = rs;
        });
        dataservice.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
        });
        dataservice.getExtraFieldGroup(function (rs) {
            rs = rs.data;
            $rootScope.listExtraFieldGroup = rs;
        });

    };
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.CatType == "" || data.CatType == null) {
            $scope.errorCatType = true;
            mess.Status = true;
        } else {
            $scope.errorCatType = false;

        }
        return mess;

    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "group" && $scope.model.group != "") {
            $scope.errorGroup = false;
        }
        if (SelectType == "type" && $scope.model.type != "") {
            $scope.errorType = false;
        }
    }
    $scope.addCommonSettingCatType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'CAT_FUND_TYPE',
                        GroupNote: 'Loại danh mục quỹ',
                        AssetCode: 'CAT_FUND'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getCatFund(function (rs) {
                rs = rs.data;
                $rootScope.listTypeFund = rs;
            })
        }, function () { });
    };
    $scope.submit = function () {
        if ($scope.editform.validate()) {
            dataservice.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
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
app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
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
        dataservice.getDataType(function (rs) {
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
        } else {
            dataservice.insertCommonSetting($scope.model, function (rs) {
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
        if ($scope.model.CodeSet == '') {
            App.toastrError(caption.COM_SET_CURD_MSG_DATA_NOT_BLANK)
        } else if ($scope.model.ValueSet.length > 255) {
            App.toastrError("Vui lòng nhập giá trị cài đặt nhỏ hơn 255 ký tự");
        } else {
            dataservice.updateCommonSetting($scope.model, function (rs) {
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
                $scope.message = caption.CEF_MSG_DELETE;
                $scope.ok = function () {
                    dataservice.deleteCommonSetting(id, function (rs) {
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
        //$uibModalInstance.dismiss('cancel');
        $uibModalInstance.close();
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});