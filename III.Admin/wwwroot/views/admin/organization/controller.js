var ctxfolder = "/views/admin/organization";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        insert: function (data, callback) {
            $http.post('/Admin/Organization/insert', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/Organization/update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.get('/Admin/Organization/delete?id=' + data).then(callback);
        },
        getIem: function (data, callback) {
            $http.get('/Admin/Organization/getitem?OrgAddonCode=' + data).then(callback);
        },
        getall: function (data, callback) {
            $http.post('/Admin/Organization/getall', data).then(callback);
        },
        resort: function (data, callback) {
            $http.post('/Admin/Organization/resort', data).then(callback);
        },
        getTreeBranch: function (data, callback) {
            $http.post('/Admin/Organization/getTreeBranch', data).then(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/Organization/gettreedata/' + data).then(callback);
        },
        loadOrganizationType: function (callback) {
            $http.get('/Admin/Organization/loadOrganizationType').then(callback);
        },
        getbyparent: function (data, callback) {
            $http.post('/Admin/Organization/getbyparent/' + data).then(callback);
        },
        gettreedatadivision: function (data, callback) {
            $http.post('/Admin/Organization/gettreedatadivision/' + data).then(callback);
        },
        getUserOutOrg: function (data, callback, callFinally) {
            //$http.post('/Admin/Organization/GetUserOutOrg', data).then(callback);
            $http({
                method: 'POST',
                url: '/Admin/Organization/GetUserOutOrg',
                data: data
            }).then(callback)['finally'](callFinally);
        },
        getUserInOrg: function (data, callback) {
            $http.post('/Admin/Organization/GetUserInOrg', data).then(callback);
        },
        getOrgByGroup: function (data, callback) {
            $http.post('/Admin/Organization/GetOrgByGroup', data).then(callback);
        },
        getGroupUser: function (data, callback) {
            $http.post('/Admin/GroupUser/GetTreeGroupUser/', data).then(callback);
        },
        updateUserInOrg: function (data, callback) {
            $http.post('/Admin/Organization/updateUserInOrg', data).then(callback);
        },
        updateBranchStatus: function (data, callback) {
            $http.post('/Admin/Organization/updateBranchStatus', data).then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/Organization/GetDepartment').then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };

    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];

        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true,
                    maxlength: 255
                },
                Code: {
                    required: true,
                    maxlength: 50,
                    regx: /^[a-zA-Z0-9_äöüÄÖÜ]*$/
                }
            },
            messages: {
                Title: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_BRANCH_CURD_LBL_BRANCH_NAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_BRANCH_CURD_LBL_BRANCH_NAME).replace('{1}', '255')
                },
                Code: {
                    required: caption.COM_ERR_REQUIRED.replace('{0}', caption.ADM_BRANCH_CURD_LBL_BRANCH_CODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace('{0}', caption.ADM_BRANCH_CURD_LBL_BRANCH_CODE).replace('{1}', '50'),
                    regx: caption.ADM_BRANCH_REGX_CODE
                }
            }
        }

    })
    $rootScope.checkData = function (data) {
        var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
        var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
        var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
        //var partternPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{6,}/;
        var mess = { Status: false, Title: "" }
        if (!partternCode.test(data.OrgCode)) {
            mess.Status = true;
            mess.Title = mess.Title.concat(" - ", caption.ADM_BRANCH_CURD_VALIDATE_BRANCH_CODE, "<br/>");
        }
        if (!partternName.test(data.OrgName)) {
            mess.Status = true;
            mess.Title += " - " + caption.ADM_BRANCH_CURD_VALIDATE_BRANCH_NAME + "<br/>";
        }

        return mess;
    }
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/Organization/Translation');
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $timeout) {
    // View TreeGrid using custom dataTable directive
    var vm = $scope;
    vm.span = function (item) {
        return '<span title="' + item + '">';
    }
    vm.spans = function () {
        return '</span>';
    }
    $scope.model = {
        Id: 2,
        Name: '',
    };

    $scope.model.UserOutOrg = null;
    $scope.model.UserNameOutOrg = '';
    $scope.model.GroupUserCode = '';
    $scope.model.OrgAddonCode = '';

    $scope.showUserInOrg = false;
    $scope.userInOrgs = [];
    $scope.userInOrgsDefault = [];
    $scope.userInOrgsSelected = [];
    $scope.listUserOutOrg = [];

    $scope.page = 1;
    $scope.loading = false;
    $scope.showButtonLoadMore = true;
    $scope.fetchAccount = function ($select, $event) {
        if (!$event) {
            $scope.page = 1;
            $scope.listUserOutOrg = [];
        } else {
            $event.stopPropagation();
            $event.preventDefault();
            $scope.page++;
        }

        $scope.loading = true;
        var modelUserOutOrg = {
            Group: 2,
            GroupUser: $scope.model.GroupUserCode,
            Code: $scope.model.OrgAddonCode,
            Name: $select.search,
            Page: $scope.page,
            Row: pageLength
        };
        dataservice.getUserOutOrg(modelUserOutOrg, function (rs) {rs=rs.data;
            //$scope.userOutOrgs = result;
            //$scope.userOutOrgsDefault = angular.copy(result);

            $scope.showButtonLoadMore = rs.data != null && rs.data.length == pageLength;
            if (rs.data && rs.data.length > 0) {
                $scope.listUserOutOrg = $scope.listUserOutOrg.concat(rs.data);
            }

            //if ($scope.userOutOrgs.length > 0) {
            //    $scope.userInOrgs = diffArray($scope.userOutOrgs, $scope.userInOrgs);
            //    //if ($scope.userInOrgsSelected.length > 0) {
            //    //    $scope.userInOrgs = $scope.userInOrgs.concat($scope.userInOrgsSelected);
            //    //    $scope.userInOrgsSelected = [];
            //    //}
            //} else {
            //    App.toastrWarning('No data available');
            //}
        }, function () { $scope.loading = false; });

    }
    $scope.loadUserOutOrg = function () {
        $scope.model.UserOutOrg = null;
        $scope.fetchAccount({ search: '' });
    }
    $scope.clickAddAccountToBranch = function () {
        if ($scope.model.UserOutOrg == null) {
            App.toastrWarning(caption.ADM_BRANCH_MSG_CHOOSE_ACCOUNT);
        } else {
            var index1 = $scope.userInOrgs.map(function (obj, index) { return obj.UserId; }).indexOf($scope.model.UserOutOrg.UserId);
            if (index1 > -1) {
                App.toastrWarning(caption.ADM_BRANCH_MSG_ACCOUNT_EXITS);
            } else {
                $scope.userInOrgs.push($scope.model.UserOutOrg);
                $scope.model.UserOutOrg = null;
            }
        }
    }
    $scope.searchUserInOrg = function () {
        var modelUserInOrg = {
            Group: 2,
            Code: $scope.model.OrgAddonCode,
            Name: $scope.model.UserNameInOrg,
        };
        dataservice.getUserInOrg(modelUserInOrg, function (result) {result=result.data;
            $scope.userInOrgs = result;
            $scope.userInOrgsDefault = angular.copy(result);
        });
    }
    $scope.loadData = function () {
        //dataservice.loadOrganizationType(function (result) {result=result.data;
        //    $scope.organizationType = result;
        //});

        dataservice.getGroupUser('', function (rs) {rs=rs.data;
            $scope.groupUserData = rs;
        });
        
        //$scope.searchUserOutOrg();
        //$scope.searchUserInOrg();
    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.loadData();
    $scope.clear = function () {
        //$scope.model.Id = 2;
        //$scope.loadData();
        //$scope.reload();
    }
    $scope.loadFullBranch = function () {
        if ($scope.model.Name === '' || $scope.model.Name == null) {
            $('#treeDiv').jstree(true).clear_search();

            $scope.initBootstrapSwitch();
        }
    }
    $scope.searchBranch = function () {
        if ($scope.model.Name === '' || $scope.model.Name == null) {

        } else {
            $("#treeDiv").jstree("close_all");
            $('#treeDiv').jstree(true).search($scope.model.Name);

            $scope.initBootstrapSwitch();
        }
    }
    $scope.removeUserInOrg = function (user) {
        if (user != null) {
            if ($scope.userInOrgs.length > 0) {
                var index = $scope.userInOrgs.map(function (e) { return e.UserId; }).indexOf(user.UserId);
                $scope.userInOrgs.splice(index, 1);
            }
        } else {
            $scope.userInOrgs = [];
        }
    }
    $scope.refreshUserInOrg = function () {
        $scope.model.GroupUserCode = '';
        //$scope.userInOrgs = angular.copy($scope.userInOrgsDefault);
    }
    $scope.updateUserInOrg = function () {
        if ($scope.model.OrgAddonCode == '') {
            App.toastrError(caption.COM_ERR_REQUIRED.replace('{0}', $scope.model.OrgTitle));
        }
        else {
            var modelUpdate = {
                OrgAddonCode: $scope.model.OrgAddonCode,
                ListUser: $scope.userInOrgs.map(function (item) { return item.UserId; })
            };

            dataservice.updateUserInOrg(modelUpdate, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.initBootstrapSwitch = function () {
        if ($().bootstrapSwitch) {
            $timeout(function () {
                $(".make-switch").bootstrapSwitch()
                    .unbind("switchChange.bootstrapSwitch")
                    .bind('switchChange.bootstrapSwitch', function (event, state) {
                        var orgCode = $(this).attr('data-code');
                        $scope.changeBranchEnable(orgCode, state);
                    });
            }, 100);
        }
    }

    $scope.changeBranchEnable = function (groupCode, isCheck) {
        App.blockUI({
            target: "#contentMainTree",
            boxed: true,
            message: 'loading...'
        });

        var modelUpdate = {
            OrgAddonCode: groupCode,
            IsEnabled: isCheck
        };

        dataservice.updateBranchStatus(modelUpdate, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }

            App.unblockUI("#contentMainTree");
        });
    }
    $scope.ac = function () {
        return true;
    }
    $scope.searchTreeBranch = function (e, data) {
        if (data.res.length === 0) {
            App.toastrWarning(caption.COM_MSG_NOT_FOUND);
        };
    }
    $scope.selectNodeTreeBranch = function (evt, data) {
        $scope.model.OrgAddonCode = data.selected[0];
        $scope.searchUserInOrg(0);
        $scope.loadUserOutOrg();
        $scope.showUserInOrg = true;
        setMaxHeightTable();
    }
    $scope.deselectNodeTreeBranch = function (evt, data) {
        $scope.model.OrgAddonCode = '';
        $scope.userInOrgs = [];
        $scope.showUserInOrg = false;
    }
    $scope.openNodeTreeBranch = function (evt, data) {
        $scope.initBootstrapSwitch();
    }
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainTree",
            boxed: true,
            message: 'loading...'
        });
        var dataSearch = {};
        dataservice.getTreeBranch(dataSearch, function (rs) {
            rs = rs.data;
            
            if (rs.Error) {

            } else {
                for (var j = 0; j < rs.length; j++) {
                    rs[j] = { Id: rs[j].OrgAddonCode, Title: rs[j].OrgName, ParentId: rs[j].OrgParentCode, DisabledCheck: rs[j].DisabledCheck, IsEnabled: rs[j].IsEnabled };
                }
                for (var i = 0; i < rs.length; i++) {
                    $scope.treeEnd = [];
                    vm.jdata = rs[i];
                    if (vm.jdata.ParentId == undefined || vm.jdata.ParentId == null) {
                        vm.jdata.ParentId = '#';
                        vm.treeData.push({ id: vm.jdata.Id, parent: vm.jdata.ParentId, text: vm.span(vm.jdata.Title) + vm.jdata.Title + vm.spans(), state: { "opened": true, "checkbox_disabled": vm.jdata.DisabledCheck, "disabled": vm.jdata.DisabledCheck } });
                    } else {
                        var enableHtml = '<input type="checkbox" class="make-switch" data-size="mini" data-on-text="<i class=\'fa fa-unlock\'></i>" data-off-text="<i class=\'fa fa-lock\'></i>" data-on-color="success" data-off-color="danger" name="BranchEnable" data-code="' + vm.jdata.Id + '" ng-model="branchEnable" ng-change="changeBranchEnable(\'' + vm.jdata.Id + '\', ' + vm.jdata.IsEnabled + ')" ng-checked="' + vm.jdata.IsEnabled + '" ' + (vm.jdata.IsEnabled ? 'checked' : '') + ' /> ';
                        $compile(enableHtml)($scope);

                        vm.treeData.push({ id: vm.jdata.Id, parent: vm.jdata.ParentId, text: enableHtml + vm.span(vm.jdata.Title) + vm.jdata.Title + vm.spans(), state: { "opened": true, "checkbox_disabled": vm.jdata.DisabledCheck, "disabled": vm.jdata.DisabledCheck } });
                    }
                    //if (i == rs.length - 1) {
                    //    vm.treeData.push($scope.treeEnd);
                    //}
                };
                $scope.initBootstrapSwitch();
            }
            App.unblockUI("#contentMainTree");
        });
    }
    $scope.treeData = [];
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
            },
            check_callback: true,
            worker: true
        },
        plugins: ['checkbox', 'contextmenu', 'types', 'state', 'search'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
        },
        search: {
            "case_insensitive": false,
            "show_only_matches": false,
        },
        types: {
            valid_children: ["selected"],
            types: {
                "selected": {
                    "select_node": false
                }
            },
            "default": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "file": {
                "icon": "fa fa-file icon-state-warning icon-lg"
            }
        },
        contextmenu: {
            items: customMenu
        }
    };
    $scope.treeEventsObjBranch = {
        //'ready': $scope.readyCB,
        'search': $scope.searchTreeBranch,
        'select_node': $scope.selectNodeTreeBranch,
        'deselect_node': $scope.deselectNodeTreeBranch,
        'open_node': $scope.openNodeTreeBranch,
    }
    $('#treeDiv').jstree({});



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

    var recuNew = function (data) {
        var datatemp = [];
        var datatempParent = [];
        if (data.length > 0) {
            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i].ParentId == null) {
                    datatemp.push(data[i]);
                    datatempParent.push(data[i]);
                }
            }
        }

        if (datatemp.length > 0) {
            for (var i = 0; i < datatemp.length; i++) {
                var temp = Recu1(data, datatemp[i].Id);
                //datatempParent.concat(temp);

                if (temp.length > 0) {
                    for (var j = 0; j < temp.length; j++) {
                        datatempParent.push(temp[j]);
                    }
                }
            }
        }

        return datatempParent;
    }
    var Recu1 = function (data, id) {
        var datatemp = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i] != null && data[i].ParentId == id) {
                datatemp.push(data[i]);
            }
        }
        if (datatemp.length > 0) {
            for (var j = 0; j < datatemp.length; j++) {
                var xtemp = Recu2(data, datatemp[j].Id);
                //datatemp.concat(xtemp);
                if (xtemp.length > 0) {
                    for (var k = 0; k < xtemp.length; k++) {
                        datatemp.push(xtemp[k]);
                    }
                }
            }
        }
        return datatemp;
    }
    var Recu2 = function (data, id) {
        var datatemp = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i] != null && data[i].ParentId == id) {
                datatemp.push(data[i]);
            }
        }
        return datatemp;
    }
    function diffArray(arr1, arr2) {
        arr1.forEach(function (val) {
            var index = arr2.map(function (e) { return e.UserId; }).indexOf(val.UserId);
            if (index < 0) arr2.push(val);
        });

        return arr2;
    }
    function customMenu(node) {
        if (node.state.checkbox_disabled) {
            var items = {
                'item1': {
                    'label': caption.COM_BTN_ADD,
                    'icon': "fa fa-plus",
                    'action': function (data) {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: ctxfolder + '/add.html',
                            controller: 'add',
                            backdrop: 'static',
                            size: '40',
                            resolve: {
                                para: function () {
                                    return node.id;
                                }
                            }
                        });
                        modalInstance.result.then(function (d) {
                            $('#treeDiv').jstree(true).refresh();
                            setTimeout(function () {
                                $scope.readyCB();
                            }, 200);
                        }, function () {
                        });
                    }
                }
            }
        } else {
            var items = {
                'item1': {
                    'label': caption.COM_BTN_EDIT,
                    'icon': "fa fa-edit",
                    'action': function (data) {
                        if ($scope.model.OrgAddonCode != "") {
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
                                $('#treeDiv').jstree(true).refresh();
                                setTimeout(function () {
                                    $scope.readyCB();
                                }, 200);
                            }, function () {
                            });
                        } else {
                            App.toastrError(caption.ADM_BRANCH_CURD_MSG_CHOOSE_BRANCH);
                        }
                    }
                },
                'item2': {
                    'label': caption.COM_BTN_DELETE,
                    'icon': "fa fa-trash",
                    'action': function () {
                        var modalInstance = $uibModal.open({
                            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                            windowClass: "message-center",
                            controller: function ($scope, $uibModalInstance) {
                                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                                $scope.ok = function () {
                                    dataservice.delete(node.id, function (result) {result=result.data;
                                        if (result.Error) {
                                            App.toastrError(result.Title);
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
                            $('#treeDiv').jstree(true).refresh();
                            setTimeout(function () {
                                $scope.readyCB();
                            }, 200);
                        }, function () {
                        });
                    }
                }
            }
        }
        return items;
    }
    $(document).ready(function () {
        var branch = $("#contentMainTree").position().top;
        var maxHeightBranch = $(window).height() - branch - 30;
        $(".block-tree-branch").css({
            'max-height': maxHeightBranch,
            'overflow-y': 'auto',
            'border': '1px solid #e7ecf1'
        });
    });
    function setMaxHeightTable() {
        setTimeout(function () {
            var table = $(".table-height-scroll").position().top;
            var maxHeightTable = $(window).height() - table - 210;
            $(".table-height-scroll").css({
                'max-height': maxHeightTable,
                'overflow': 'auto',
            });
        }, 200);
    }
    setTimeout(function () {
        $scope.readyCB();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, dataservice, $uibModal, $uibModalInstance, para) {
    $scope.model = {};
    $scope.model1 = {
        Department: []
    };
    $scope.model.Division = para.replace('d_', '');
    $scope.loadData = function () {
        dataservice.gettreedatadivision(0, function (result) {result=result.data;
            $scope.treeData = result;
        });
        dataservice.getDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs;
        })
    }
    $scope.loadData();
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Division" && $scope.model.Division != "") {
            $scope.errorDivision = false;
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.DepartmentCode = $scope.model1.Department.join(',');
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null Branch
        if (data.Division == "") {
            $scope.errorDivision = true;
            mess.Status = true;
        } else {
            $scope.errorDivision = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model1 = {
        Department: []
    };
    $scope.loadData = function () {
        dataservice.gettreedatadivision(0, function (result) {
            result = result.data;
            $scope.treeData = result;
        });
        dataservice.getDepartment(function (rs) {
            rs = rs.data;
            $scope.listDepartment = rs;
        })
    }
    $scope.loadData();
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Division" && $scope.model.Division != "") {
            $scope.errorDivision = false;
        }
    }
    $scope.initData = function () {
        if (para.OrgAddonCode == '') {
            App.toastrError(caption.ADM_BRANCH_CURD_MSG_CHOOSE_BRANCH);
        } else {
            dataservice.getIem(para.OrgAddonCode, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    $scope.model = rs;
                    
                    if ($scope.model.DepartmentCode != null && $scope.model.DepartmentCode != "") {
                        $scope.model1.Department = $scope.model.DepartmentCode.split(',');
                    }
                }
            });
            dataservice.gettreedatadivision(0, function (result) {result=result.data;
                $scope.treeData = result;
            });
        }
    }
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.DepartmentCode = $scope.model1.Department.join(',');
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null Branch
        if (data.Division == "") {
            $scope.errorDivision = true;
            mess.Status = true;
        } else {
            $scope.errorDivision = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

//app.controller('sort', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {

//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    }

//    $scope.initData = function () {
//        dataservice.getbyparent(para, function (rs) {rs=rs.data;
//            $scope.model = rs;
//        });
//    }
//    $scope.initData();
//    $scope.resort = function (item, index) {
//        $scope.model.splice(index, 1);
//        $scope.model.splice(item.Ord - 1, 0, item);
//        $.each($scope.model, function (index, item) {
//            item.Ord = index + 1;
//        });
//    }
//    $scope.submit = function () {
//        dataservice.resort($scope.model, function (rs) {rs=rs.data;
//            if (rs.Error) {
//                App.toastrError(rs.Title);
//            } else {
//                App.toastrSuccess(rs.Title);
//                $uibModalInstance.close();
//            }
//        });
//    }
//});

//app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    }
//    $scope.initData = function () {
//        dataservice.gitem(para, function (rs) {rs=rs.data;
//            if (rs.Error) {
//                App.toastrError(rs.Title);
//            } else {
//                dataservice.gettreedata(rs.Id, function (result) {result=result.data;
//                    $scope.treeData = result;
//                });
//                $scope.model = rs;
//            }

//        });

//    }
//    $scope.initData();
//    $scope.submit = function () {
//        if ($scope.editform.validate()) {
//            dataservice.update($scope.model, function (rs) {rs=rs.data;
//                if (rs.Error) {
//                    App.toastrError(rs.Title);
//                } else {
//                    App.toastrSuccess(rs.Title);
//                    $uibModalInstance.close();
//                }
//            });
//        }
//    }
//});

//app.controller('user', function ($scope, $rootScope, $compile, $uibModal, $confirm, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, dataservice, para) {
//    $scope.paraDefault = angular.copy(para);
//    $scope.model = {};
//    $scope.model.UserNameOutOrg = '';
//    $scope.model.UserNameInOrg = '';
//    $scope.model.GroupUserCode = '';
//    $scope.model.OrgAddonCode = para.Data.OrgAddonCode;

//    $scope.userOutOrgs = [];
//    $scope.userOutOrgsDefault = [];
//    $scope.userOutOrgsSelected = [];
//    $scope.selectAllUserOutOrg = false;
//    $scope.selectUserOutOrg = [];

//    $scope.userInOrgs = [];
//    $scope.userInOrgsDefault = [];
//    $scope.userInOrgsSelected = [];
//    $scope.selectAllUserInOrg = false;
//    $scope.selectUserInOrg = [];

//    if (para.Group == 1) {
//        $scope.model.OrgTitle = "Department";
//    } else if (para.Group == 2) {
//        $scope.model.OrgTitle = "Branch";
//    } else if (para.Group == 3) {
//        $scope.model.OrgTitle = "Profit center";
//    } else if (para.Group == 4) {
//        $scope.model.OrgTitle = "Account executive";
//    }

//    $scope.searchUserOutOrg = function () {
//        var modelUserOutOrg = {
//            Group: para.Group,
//            Code: $scope.model.OrgAddonCode,
//            Name: $scope.model.UserNameOutOrg,
//            GroupUser: $scope.model.GroupUserCode,
//        };
//        dataservice.getUserOutOrg(modelUserOutOrg, function (result) {result=result.data;
//            $scope.userOutOrgs = result;
//            $scope.userOutOrgsDefault = angular.copy(result);
//        });
//    }
//    $scope.searchUserInOrg = function () {
//        var modelUserInOrg = {
//            Group: para.Group,
//            Code: $scope.model.OrgAddonCode,
//            Name: $scope.model.UserNameInOrg,
//        };
//        dataservice.getUserInOrg(modelUserInOrg, function (result) {result=result.data;
//            $scope.userInOrgs = result;
//            $scope.userInOrgsDefault = angular.copy(result);
//        });
//    }

//    $scope.cancel = function () {
//        $uibModalInstance.dismiss('cancel');
//    }

//    $scope.initData = function () {
//        dataservice.getOrgByGroup({ Group: para.Group }, function (rs) {rs=rs.data;
//            $scope.listOrgData = rs;
//        });

//        dataservice.getGroupUser(para.Group, function (rs) {rs=rs.data;
//            $scope.groupUserData = rs;
//        });

//        $scope.searchUserOutOrg();
//        $scope.searchUserInOrg();
//    }
//    $scope.initData();

//    $scope.addOrRemoveUserOutOrg = function (user, isChecked) {
//        if (user != null) {
//            if (isChecked == true)
//                $scope.userOutOrgsSelected.push(user);
//            else {
//                if ($scope.userOutOrgsSelected.length > 0) {
//                    var index = $scope.userOutOrgsSelected.map(function (e) { return e.UserId; }).indexOf(user.UserId);
//                    $scope.userOutOrgsSelected.splice(index, 1);
//                }
//            }
//            $scope.selectAllUserOutOrg = $scope.userOutOrgsSelected.length == $scope.userOutOrgs.length;
//        } else {
//            if (isChecked == true)
//                $scope.userOutOrgsSelected = angular.copy($scope.userOutOrgs);
//            else {
//                $scope.userOutOrgsSelected = [];
//            }
//            angular.forEach($scope.selectUserOutOrg, function (val, key) {
//                $scope.selectUserOutOrg[key] = isChecked;
//            });
//        }
//    }
//    $scope.addOrRemoveUserInOrg = function (user, isChecked) {
//        if (user != null) {
//            if (isChecked == true)
//                $scope.userInOrgsSelected.push(user);
//            else {
//                if ($scope.userInOrgsSelected.length > 0) {
//                    var index = $scope.userInOrgsSelected.map(function (e) { return e.UserId; }).indexOf(user.UserId);
//                    $scope.userInOrgsSelected.splice(index, 1);
//                }
//            }
//            $scope.selectAllUserInOrg = $scope.userInOrgsSelected.length == $scope.userInOrgs.length;
//        } else {
//            if (isChecked == true)
//                $scope.userInOrgsSelected = angular.copy($scope.userInOrgs);
//            else {
//                $scope.userInOrgsSelected = [];
//            }
//            angular.forEach($scope.selectUserInOrg, function (val, key) {
//                $scope.selectUserInOrg[key] = isChecked;
//            });
//        }
//    }

//    $scope.addAllUser = function () {
//        if ($scope.userOutOrgs.length > 0) {
//            // Add to list in
//            angular.forEach($scope.userOutOrgs, function (user, key) {
//                $scope.userInOrgs.push(user);
//            });
//            // Reset
//            $scope.userOutOrgs = [];
//            $scope.userOutOrgsSelected = [];
//            $scope.selectAllUserOutOrg = false;
//            $scope.selectUserOutOrg = [];
//            $scope.selectAllUserInOrg = false;
//        }
//    }
//    $scope.addUserSelected = function () {
//        if ($scope.userOutOrgsSelected.length > 0) {
//            angular.forEach($scope.userOutOrgsSelected, function (user, key) {
//                // Add to list in
//                $scope.userInOrgs.push(user);
//                // Remove list out
//                var index = $scope.userOutOrgs.indexOf(user);
//                $scope.userOutOrgs.splice(index, 1);
//            });
//            $scope.userOutOrgsSelected = [];
//            // Remove checkbox
//            $scope.selectAllUserOutOrg = false;
//            $scope.selectUserOutOrg = [];
//            $scope.selectAllUserInOrg = false;
//        } else {
//            App.toastrInfo(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER.toLowerCase()));
//        }
//    }
//    $scope.removeUserSelected = function () {
//        if ($scope.userInOrgsSelected.length > 0) {
//            angular.forEach($scope.userInOrgsSelected, function (user, key) {
//                // Add to list out
//                $scope.userOutOrgs.push(user);
//                // Remove list in
//                var index = $scope.userInOrgs.indexOf(user);
//                $scope.userInOrgs.splice(index, 1);
//            });
//            $scope.userInOrgsSelected = [];
//            // Remove checkbox
//            $scope.selectAllUserInOrg = false;
//            $scope.selectUserInOrg = [];
//            $scope.selectAllUserOutOrg = false;
//        } else {
//            App.toastrInfo(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER.toLowerCase()));
//        }
//    }
//    $scope.removeAllUser = function () {
//        if ($scope.userInOrgs.length > 0) {
//            // Add to list in
//            angular.forEach($scope.userInOrgs, function (user, key) {
//                $scope.userOutOrgs.push(user);
//            });
//            // Reset
//            $scope.userInOrgs = [];
//            $scope.userInOrgsSelected = [];
//            $scope.selectAllUserInOrg = false;
//            $scope.selectUserInOrg = [];
//            $scope.selectAllUserOutOrg = false;
//        }
//    }
//    $scope.refreshUser = function () {
//        $scope.userOutOrgs = angular.copy($scope.userOutOrgsDefault);
//        $scope.userOutOrgsSelected = [];
//        $scope.selectAllUserOutOrg = false;
//        $scope.selectUserOutOrg = [];

//        $scope.userInOrgs = angular.copy($scope.userInOrgsDefault);
//        $scope.userInOrgsSelected = [];
//        $scope.selectAllUserInOrg = false;
//        $scope.selectUserInOrg = [];
//    }

//    $scope.clearGroupUser = function () {
//        $scope.model.GroupUserCode = '';
//    }
//    $scope.clearOrgData = function () {
//        $scope.model.OrgAddonCode = para.Data.OrgAddonCode;
//        $scope.searchUserInOrg();
//    }

//    $scope.submit = function ($event) {
//        if ($scope.model.OrgAddonCode == '') {
//            App.toastrError(caption.COM_ERR_REQUIRED.replace('{0}', $scope.model.OrgTitle));
//        } else if ($scope.userInOrgs.length <= 0) {
//            App.toastrError(caption.ERR_NOT_CHECKED.replace('{0}', caption.USER.toLowerCase()));
//        }
//        else {
//            var modelUpdate = {
//                OrgAddonCode: $scope.model.OrgAddonCode,
//                ListUser: $scope.userInOrgs.map(function (item) { return item.UserId; })
//            };

//            dataservice.updateUserInOrg(modelUpdate, function (rs) {rs=rs.data;
//                if (rs.Error) {
//                    App.toastrError(rs.Title);
//                } else {
//                    App.toastrSuccess(rs.Title);
//                    //$uibModalInstance.close();
//                }
//            });
//        }
//    }
//});
