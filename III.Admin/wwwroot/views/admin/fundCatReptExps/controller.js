var ctxfolder = "/views/admin/fundCatReptExps";
var ctxfolderMessage = "/views/message-box";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD', "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);

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
            $http.post('/Admin/FundCatReptExps/GetItem/', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/Delete/' + data).then(callback);
        },
        getProceduce: function (callback) {
            $http.get('/Admin/FundCatReptExps/RunProceduce').then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/GetTreeData', data).then(callback);
        },

        //Tree view new
        getTreeCategory: function (callback) {
            $http.post('/Admin/FundCatReptExps/GetTreeCategory').then(callback);
        },
        getItemByCode: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/GetItemByCode?code=' + data).then(callback);
        },
        deleteByCode: function (data, callback) {
            $http.post('/Admin/FundCatReptExps/DeleteByCode?code=' + data).then(callback);
        }
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
                mess.Title += caption.COM_VALIDATE_ITEM_NAME.replace('{0}', "mã");
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
                CatCode: {
                    required: true,
                    maxlength: 100
                },
                CatName: {
                    required: true,
                    maxlength: 255
                }
            },
            messages: {
                CatCode: {
                    required: caption.FCRE_VALIDATE_CAT_CODE_BLANK,
                    maxlength: caption.FCRE_VALIDATE_CAT_CODE_MAX_LENGTH
                },
                CatName: {
                    required: caption.FCRE_VALIDATE_CAT_NAME_REQUIRE,
                    maxlength: caption.FCRE_VALIDATE_CAT_NAME_MAX_LENGTH
                }
            }
        }



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
    $translateProvider.useUrlLoader('/Admin/FundCatReptExps/Translation');
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

app.controller('index', function ($scope, $rootScope, $uibModal, dataservice) {
    $scope.model = {

    };

    $scope.initData = function () {
        dataservice.getCatFund(function (rs) {
            rs = rs.data;
            $rootScope.listTypeFund = rs;
        })
        dataservice.getGetCatCode(function (rs) {
            rs = rs.data;
            $rootScope.listCatCode = rs;
        })
        dataservice.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.lstCat = result;
        });
    }

    $scope.isDisabled = false;

    $scope.isEdit = false;

    $scope.initData();

    $scope.treeData = [];

    $scope.contextMenu = [
        [function ($itemScope) {
            return '<i class="fa fa-copy"></i> ' + caption.COM_LBL_COPY;
        }, function ($itemScope, $event, model) {
            $scope.dataTemp = {
                action: 'Copy',
                data: $itemScope.data
            };

        }, function ($itemScope, $event, model) {
            return true;
        }],
        [function ($itemScope) {
            return '<i class="fa fa-cut"></i> ' + caption.COM_LBL_MOVE;
        }, function ($itemScope, $event, model) {
            $scope.dataTemp = {
                action: 'Move',
                data: $itemScope.data
            };
        }, function ($itemScope, $event, model) {
            return true;
        }]
    ];


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

    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getTreeCategory(function (result) {
            result = result.data;
            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: caption.FCRE_LBL_ALL_CAT,
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeData.push(root);
                var index = 0;
                $scope.ListParent = result.filter(function (item) {
                    return (item.ParentCode == '');
                });
                for (var i = 0; i < result.length; i++) {
                    if (result[i].ParentCode == '') {
                        var stt = $scope.ListParent.length - index;
                        if (stt.toString().length == 1) {
                            stt = "0" + stt;
                        }
                        index = index + 1;
                        var data = {
                            id: result[i].Code,
                            parent: 'root',
                            text: stt + ' - ' + result[i].Title,
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    }
                    else {
                        var data = {
                            id: result[i].Code,
                            parent: result[i].ParentCode,
                            text: result[i].Code + ' - ' + result[i].Title,
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }

    $scope.selectNodeRepository = function (e, data) {
        var listSelect = [];
        $scope.recentFile = false;
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        for (var i = 0; i < listNoteSelect.length; i++) {
            listSelect.push(listNoteSelect[i].id);
        }
        //$scope.model.ListRepository = listSelect;
        dataservice.getItemByCode(listSelect[0], function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
                $scope.isDisabled = true;
                $scope.isEdit = true;
            }
        });
    }

    $scope.deselectNodeRepository = function (e, data) {
        $scope.recentFile = false;
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length > 0) {
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].id);
                dataserviceRepository.getTreeInNode(listNoteSelect[i].id, function (rs) {
                    rs = rs.data;
                    if (rs.length > 0) {
                        for (var i = 0; i < rs.length; i++) {
                            listSelect.push(rs[i].Code);
                        }
                    }
                    $scope.model.ListRepository = listSelect;
                    $scope.reload();
                })
            }
        } else {
            $scope.model.ListRepository = listSelect;
            $scope.reload();
        }


    }

    $scope.treeConfig = {
        core: {
            multiple: true,
            animation: true,
            error: function (error) {
            },
            check_callback: true,
            worker: true,

        },
        types: {
            default: {
                icon: 'fa fa-folder icon-state-warning'
            }
        },
        version: 1,
        plugins: ['checkbox', 'types', 'contextmenu'],
        checkbox: {
            "three_state": false,
            "whole_node": false,
            "keep_selected_style": true,
            "visible" : false
            //"cascade": "undetermined",
        },
        contextmenu: {
            items: customMenu
        }
    };

    function customMenu(node) {
        var items = {
            'item2': {
                'label': caption.COM_BTN_DELETE,
                'icon': "fa fa-trash",
                'action': function (data) {
                    var modalInstance = $uibModal.open({
                        templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                        windowClass: "message-center",
                        resolve: {
                            para: function () {
                                return node.original.catCode;
                            }
                        },
                        controller: function ($scope, $uibModalInstance, para) {
                            $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                            $scope.ok = function () {
                                dataservice.deleteByCode(para, function (rs) {
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
                        $('#treeDiv').jstree(true).refresh();
                        setTimeout(function () {
                            reset();
                            $scope.readyCB();
                        }, 200);
                    }, function () {
                    });
                }
            }
        };
        return items;
    }

    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'deselect_node': $scope.deselectNodeRepository,
    };

    $scope.ac = function () {
        return true;
    }

    $scope.cancel = function () {
        reset();
        $scope.isDisabled = true;
    }

    $scope.edit = function () {
        if (window.isAllData != true) {
            return App.toastrError(caption.COM_MSG_NO_PERMISSION);
        }
        $scope.isDisabled = false;
    }

    $scope.insert = function () {
        if (window.isAllData != true) {
            return App.toastrError(caption.COM_MSG_NO_PERMISSION);
        }
        if (!$scope.isDisabled) {
            validationSelect($scope.model);
            if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
                var temp = $rootScope.checkData($scope.model);
                if (temp.Status) {
                    App.toastrError(temp.Title);
                    return;
                }
                dataservice.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        reset();
                        $('#treeDiv').jstree(true).refresh();
                        setTimeout(function () {
                            $scope.readyCB();
                        }, 200);
                    }
                })
            }
        }
        else {
            reset();
            $scope.isDisabled = false;
            $scope.isEdit = false;
        }
    }

    $scope.update = function () {
        if ($scope.isDisabled) {
            return App.toastrError(caption.FCRE_MSG_CLICK_EDIT);
        }

        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }

            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
                windowClass: "message-center",
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = caption.FCRE_MSG_SURE_EDIT_CAT;
                    $scope.ok = function () {
                        dataservice.update(para, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            }
                            else {
                                App.toastrSuccess(rs.Title);
                                $uibModalInstance.close();
                            }
                        })
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: '25',
            });
            modalInstance.result.then(function (d) {
                $scope.isEdit = false;
                reset();
                $('#treeDiv').jstree(true).refresh();
                setTimeout(function () {
                    $scope.readyCB();
                }, 200);
                $scope.isDisabled = true;
            }, function () {
            });

            
        }
    }

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

    $scope.changleSelect = function (selectType) {
        if (selectType == "CatType" && $scope.model.CatType != "") {
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
    }

    function reset() {
        $scope.model.CatCode = '';
        $scope.model.CatName = '';
        $scope.model.CatParent = '';
        $scope.model.CatType = '';
        $scope.model.Note = '';
        $scope.model.Id = 0;
    }

    setTimeout(function () {

    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.model = {
        CatCode: '',
        CatName: '',
        CatParent: 'CAT_FUND',
        CatType: '',
        Note: ''
    }
    $scope.model1 = {
        listMember: []
    }
    $scope.initData = function () {
        //dataservice.getCatParent(function (rs) {rs=rs.data;
        //    $scope.listCatParent = rs;
        //})
        dataservice.getCatFund(function (rs) {
            rs = rs.data;
            $rootScope.listTypeFund = rs;
            $scope.model.CatType = rs.length != 0 ? rs[0].Code : '';

        })
        dataservice.getGetCatCode(function (rs) {
            rs = rs.data;
            $rootScope.listCatCode = rs;
        })
        dataservice.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
        });

    }
    $scope.initData();

    $scope.changleSelect = function (selectType) {
        if (selectType == "CatType" && $scope.model.CatType != "") {
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            $scope.model.ActMember = $scope.model1.listMember.join(',');
            dataservice.insert($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
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
    }

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

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model1 = {
        listMember: []
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
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
        })
        dataservice.gettreedata({ IdI: null }, function (result) {
            result = result.data;
            $scope.treeData = result;
        });
    }
    $scope.initData();
    $scope.changleSelect = function (selectType) {
        if (selectType == "CatType" && $scope.model.CatType != "") {
        }
    }
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
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            $scope.model.ActMember = $scope.model1.listMember.join(',');
            dataservice.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            })
        }
    }
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM
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
