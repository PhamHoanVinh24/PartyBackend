var ctxfolder = "/views/admin/permissionUser";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        searchUserPaging: function (data, callback, callFinally) {
            $http({
                method: 'POST',
                url: '/Admin/PermissionUser/searchUserPaging',
                data: data
            }).then(callback)['finally'](callFinally);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/User/Getitem/' + data).then(callback);
        },
        loadRole: function (callback) {
            $http.post('/Admin/PermissionResource/GetGRole').then(callback);
        },
        getAllApplication: function (callback) {
            $http.post('/Admin/PermissionResource/GetApplication/').then(callback);
        },
        getAllBranch: function (data, callback) {
            $http.post('/Admin/PermissionResource/GetAllBranch', data).then(callback);
        },
        getDepartmentByApp: function (data, callback) {
            $http.post('/Admin/PermissionUser/GetDepartmentByApp', data).then(callback);
        },
        getResourceOfGroup: function (data, callback) {
            $http.post('/Admin/PermissionUser/GetResourceOfGroup', data).then(callback);
        },
        updatePermission: function (data, callback) {
            $http.post('/Admin/PermissionUser/UpdateUserPermission', data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };

    var culture = $cookies.get('_CULTURE') || 'en-US';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        });

    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
});
app.filter('cmdate', [
    '$filter', function ($filter) {
        return function (input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
]);

app.controller('index', function ($scope, $rootScope, $confirm, $uibModal, dataservice, $filter, $sce) {
    $scope.trustAsHtml = $sce.trustAsHtml;

    var vm = $scope;
    vm.span = function (item) { return '<span title="' + item + '">'; }
    vm.spans = function () { return '</span>'; }

    $scope.model = {
        UserId: '',
        RoleId: '',
        GroupCode: '',
        AppCode: '',
        GroupUsers: [],
        Resources: [],
        BranchRefs: [],
    };
    $scope.UserInfo = {};
    $scope.listUsers = [];
    $scope.listRoles = [];
    $scope.listApplication = [];
    $scope.listGroupUsers = [];
    $scope.listGroupUsersCopy = [];
    $scope.listResources = [];
    $scope.listResourcesCopy = [];
    $scope.listBranchs = [];
    $scope.page = 1;
    $scope.showBlockPermission = false;
    $scope.showButtonLoadMore = true;

    $scope.fetchAccount = function ($select, $event) {
        if (!$event) {
            $scope.page = 1;
            $scope.listUsers = [];
        } else {
            $event.stopPropagation();
            $event.preventDefault();
            $scope.page++;
        }

        $scope.loading = true;
        var search = {
            Name: $select.search,
            Page: $scope.page,
            Row: pageLength
        }
        dataservice.searchUserPaging(search, function (rs) {rs=rs.data;
            if (rs.Error) { }
            else {
                $scope.showButtonLoadMore = rs.data != null && rs.data.length == pageLength;
                if (rs.data && rs.data.length > 0) {
                    $scope.listUsers = $scope.listUsers.concat(rs.data);
                }
            }
        }, function () { $scope.loading = false; });


    }
    $scope.clearSearchAccount = function () {
        $scope.showBlockPermission = false;
        $scope.showButtonLoadMore = true;
        $scope.model.UserId = '';
        $scope.UserInfo = {};
    }
    $scope.changeAccount = function () {
        dataservice.getItem($scope.model.UserId, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.UserInfo = rs;
                $scope.loadGroupUser();
                $scope.clearAllResource();
                //// Reload Branch Ref
                //$('#treeDivBranch').jstree(true).refresh();
                //$scope.readyCBBranch();
                $scope.setSelectedNodeTreeBranch();
                // Show block
                $scope.showBlockPermission = true;
            }
        });
    }

    // Application
    $scope.changeApplication = function () {
        $scope.loadGroupUser();
        $scope.setSelectedNodeTreeBranch();
    }
    $scope.clearApplication = function () {
        $scope.model.AppCode = '';
        $scope.loadGroupUser();
        $scope.setSelectedNodeTreeBranch();
    }

    // Group user
    $scope.searchGroupUser = function () {
        $scope.listGroupUsers = $scope.listGroupUsersCopy.filter(function (group, key) {
            var index = group.GroupCode.indexOf($scope.txtGroupUserName);
            var index1 = group.Title.indexOf($scope.txtGroupUserName);
            return index > -1 || index1 > -1;
        });
        if ($scope.listGroupUsers.length == 0) {
            App.toastrWarning(caption.ADM_PER_EMP_MSG_NO_DATA);
        }
    }
    $scope.clearSearchGroupUser = function () {
        $scope.txtGroupUserName = '';
        $scope.listGroupUsers = angular.copy($scope.listGroupUsersCopy);
    }
    $scope.selectAllGroup = false;
    $scope.selectOneGroup = [];
    $scope.selectedGroup = [];
    $scope.loadGroupUser = function () {
        //App.blockUI({
        //    target: "#contentMainTree2",
        //    boxed: true,
        //    message: 'loading...'
        //});
        var model = {
            AppCode: $scope.model.AppCode,
            UserId: $scope.model.UserId,
        }
        dataservice.getDepartmentByApp(model, function (rs) {rs=rs.data;
            if (rs.Error) { }
            else {
                if ($scope.model.UserId) {
                    $scope.listGroupUsersCopy.forEach(function (e, index) {
                        var index1 = rs.map(function (e1) { return e1.GroupCode; }).indexOf(e.GroupCode);
                        if (index1 < 0) {
                            e.IsChecked = false;
                            e.IsMain = false;
                            e.RoleId = '';
                        } else {
                            e.IsChecked = true;
                            e.IsMain = rs[index1].IsMain;
                            e.RoleId = rs[index1].RoleId;
                        }
                    });
                    $scope.listGroupUsers.forEach(function (e, index) {
                        var index1 = rs.map(function (e1) { return e1.GroupCode; }).indexOf(e.GroupCode);
                        if (index1 < 0) {
                            e.IsChecked = false;
                            e.IsMain = false;
                            e.RoleId = '';
                        } else {
                            e.IsChecked = true;
                            e.IsMain = rs[index1].IsMain;
                            e.RoleId = rs[index1].RoleId;
                        }
                    });
                    //$scope.listGroupUsersCopy = angular.copy($scope.listGroupUsers);
                    $scope.model.GroupUsers = rs.length > 0 ? rs.map(function (e, index) { return e.GroupCode; }) : [];
                    $scope.clearAllResource();
                } else {
                    $scope.listGroupUsers = rs;
                    $scope.listGroupUsersCopy = angular.copy(rs);
                    $scope.model.GroupUsers = $scope.listGroupUsersCopy
                        .filter(function (e, index) { return e.IsChecked; })
                        .map(function (e, index) { return e.GroupCode; });
                }
            }
            //App.unblockUI("#contentMainTree2");
        });
    }
    $scope.clickSelectAllGroup = function (selectAllGroup) {
        if (selectAllGroup) {
            $scope.model.GroupUsers = $scope.listGroupUsers.map(function (e, index) {
                $scope.listGroupUsers[index].IsChecked = selectAllGroup;
                var index1 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(e.GroupCode);
                if (index1 > -1) $scope.listGroupUsersCopy[index1].IsChecked = selectAllGroup;

                return e.GroupCode;
            });
        } else {
            $scope.model.GroupUsers = [];
            $scope.listGroupUsers.forEach(function (e, index) {
                $scope.listGroupUsers[index].IsChecked = selectAllGroup;

                var index1 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(e.GroupCode);
                if (index1 > -1) $scope.listGroupUsersCopy[index1].IsChecked = selectAllGroup;
            });
        }
    }
    $scope.clickSelectOneGroup = function (index, item) {
        if ($scope.listGroupUsers[index].IsChecked) {
            $scope.model.GroupUsers.push(item.GroupCode);

            var index1 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(item.GroupCode);
            if (index1 > -1) $scope.listGroupUsersCopy[index1].IsChecked = true;
        } else {
            var index2 = $scope.model.GroupUsers.map(function (e) { return e; }).indexOf(item.GroupCode);
            $scope.model.GroupUsers.splice(index2, 1);

            var index3 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(item.GroupCode);
            if (index3 > -1) $scope.listGroupUsersCopy[index3].IsChecked = false;
        }
        $scope.selectAllGroup = $scope.listGroupUsers.length == $scope.model.GroupUsers.length;
    }
    $scope.changeRoleOfGroup = function (item) {
        // Set role in copy
        var index1 = $scope.listGroupUsersCopy.map(function (e1) { return e1.GroupCode; }).indexOf(item.GroupCode);
        if (index1 > -1) {
            $scope.listGroupUsersCopy[index1].RoleId = item.RoleId;
            // Reload resource
            if ($scope.model.GroupCode == item.GroupCode) {
                $scope.model.RoleId = item.RoleId;
                $scope.getResourceApi(0);
            } else {
                $scope.listGroupUsersCopy[index1].Resources = [];
            }
        }
    }
    $scope.showUserPermission = function (group, index) {
        $scope.model.GroupCode = group.GroupCode;
        $scope.model.RoleId = group.RoleId;
        // Get resource
        $scope.getResourceApi(1);
    }
    $scope.getResourceApi = function (type) {
        if ($scope.model.AppCode == null || $scope.model.AppCode == '') {
            App.toastrWarning(caption.ADM_PER_EMP_MSG_SELECT_APP_REQUIRED);
        } else if ($scope.model.RoleId == null || $scope.model.RoleId == '') {
            App.toastrWarning(caption.ADM_PER_EMP_MSG_SELECT_DEPT_REQUIRED);
        } else {
            $scope.txtResourceApi = '';
            //var index = $scope.listGroupUsers.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
            var index = $scope.listGroupUsersCopy.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
            if (index > -1) {
                // Set class selected
                $scope.selectedGroup.forEach(function (e, index1) {
                    $scope.selectedGroup[index1] = false;
                });
                $scope.selectedGroup[index] = true;
                // Get and show resource
                if (type == 1
                    && $scope.listGroupUsersCopy[index].Resources != undefined
                    && $scope.listGroupUsersCopy[index].Resources.length > 0) {
                    $scope.model.Resources = $scope.listGroupUsersCopy[index].Resources;
                    // Check all resource api
                    var countPermission = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
                    $scope.selectAll = countPermission == $scope.model.Resources.length;
                    initDateTimePicker();
                } else {
                    //App.blockUI({
                    //    target: "#contentMainTree3",
                    //    boxed: true,
                    //    message: 'loading...'
                    //});
                    var model = {
                        AppCode: $scope.model.AppCode,
                        UserId: $scope.model.UserId,
                        GroupCode: $scope.model.GroupCode,
                        RoleId: $scope.model.RoleId,
                    }
                    dataservice.getResourceOfGroup(model, function (rs) {rs=rs.data;
                        if (rs.Error) { }
                        else {
                            if (rs.length <= 0) {
                                App.toastrWarning(caption.ADM_PER_EMP_MSG_NOT_PERMISSION);
                            }

                            $scope.model.Resources = rs;
                            $scope.listGroupUsersCopy[index].Resources = $scope.model.Resources;
                            // Check all resource api
                            var countPermission1 = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
                            $scope.selectAll = countPermission1 == $scope.model.Resources.length;
                            initDateTimePicker();
                        }
                        //App.unblockUI("#contentMainTree3");
                    });
                }
            }
        }
    }
    $scope.getCountGroupUserHighlight = function () {
        var length = $scope.listGroupUsers.length;
        var lengthCheck = $scope.listGroupUsers.filter(function (obj, index) { return obj.IsChecked; }).length;
        return lengthCheck + '/' + length;
    }

    // Resource API
    $scope.getCountResourceLength = function () {
        var length = $scope.model.Resources.filter(function (obj, index) { return !obj.IsFunction; }).length;
        var lengthCheck = $scope.model.Resources.filter(function (obj, index) { return obj.HasPermission && !obj.IsFunction; }).length;
        return lengthCheck + '/' + length;
    }
    $scope.selectAllResource = function (selectAll) {
        if ($scope.model.Resources != null) {
            if (selectAll == true) {
                angular.forEach($scope.model.Resources, function (value, key) {
                    if (!value.IsFunction) value.HasPermission = true;
                });
            } else {
                angular.forEach($scope.model.Resources, function (value, key) {
                    if (!value.IsFunction) value.HasPermission = false;
                });
            }
        }
    }
    $scope.selectOneResource = function (item) {
        item.HasPermission = !item.HasPermission;

        var countPermission = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
        $scope.selectAll = countPermission == $scope.model.Resources.length;
    }
    $scope.searchResource = function () {
        var index = $scope.listGroupUsersCopy.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
        if (index > -1) {
            $scope.model.Resources = $scope.listGroupUsersCopy[index].Resources.filter(function (obj, index1) {
                var index2 = obj.Title.indexOf($scope.txtResourceApi);
                var index3 = obj.Api.indexOf($scope.txtResourceApi);

                return index2 > -1 || index3 > -1 || obj.IsFunction;
            });

            var countPermission = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
            $scope.selectAll = countPermission == $scope.model.Resources.length;

            if ($scope.model.Resources.length == 0) {
                App.toastrWarning(caption.ADM_PER_EMP_MSG_NO_DATA);
            }
        }
    }
    $scope.clearSearchResource = function () {
        $scope.txtResourceApi = '';
        var index = $scope.listGroupUsersCopy.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
        if (index > -1) {
            $scope.model.Resources = angular.copy($scope.listGroupUsersCopy[index].Resources);

            var countPermission = $scope.model.Resources.filter(function (obj) { return obj.HasPermission }).length;
            $scope.selectAll = countPermission == $scope.model.Resources.length;
        }
    }
    $scope.changeExpiredDate = function (resource, index) {
        var index1 = $scope.listGroupUsersCopy.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
        if (index1 > -1) {
            $scope.listGroupUsersCopy[index1].Resources[index].ExpiredDate = resource.ExpiredDate;
        }
    }
    function initDateTimePicker() {
        setTimeout(function () {
            $(".control-datetime").datetimepicker({
                inline: false,
                autoclose: true,
                format: "mm/dd/yyyy hh:ii",
                fontAwesome: true,
            });
        }, 200);
    }

    // Branch Reference
    vm.listBranchReference = [];
    vm.listBranchReferenceDefault = [];
    vm.recursiveBranchReference = function (data, parent) {
        var result = [];

        var listChild = data.filter(function (obj, index) { return obj.OrgParentCode == parent; });
        if (listChild.length > 0) {
            listChild.forEach(function (obj, index) {
                result.push(obj);

                var resultTemp = vm.recursiveBranchReference(data, obj.OrgAddonCode);
                result = result.concat(resultTemp);
            });
        }

        return result;
    }
    vm.getCountBranchReferenceLength = function () {
        var length = $scope.listBranchReference.length;
        var lengthCheck = $scope.listBranchReference.filter(function (obj, index) { return obj.IsChecked; }).length;
        return lengthCheck + '/' + length;
    }

    vm.searchBranch = function () {
        if ($scope.txtBranchName && $scope.txtBranchName.length > 0) {
            var listSearch = $scope.listBranchReferenceDefault.filter(function (obj, index) {
                return obj.Ord == 0 || obj.Ord == 1 || obj.OrgName.indexOf($scope.txtBranchName) > -1;
            });

            angular.copy(listSearch, vm.listBranchReference);
        } else {
            angular.copy(vm.listBranchReferenceDefault, vm.listBranchReference);
        }
    }
    vm.clearSearchBranch = function () {
        $scope.txtBranchName = '';
        angular.copy(vm.listBranchReferenceDefault, vm.listBranchReference);
    }
    vm.searchTreeBranch = function (e, data) {
        if (data.res.length === 0) {
            App.toastrWarning(caption.ADM_PER_EMP_MSG_NO_DATA);
        };
    }

    vm.getAllBranch = function () {
        var paraSearch = {
            UserId: null,//$scope.model.UserId,
            Name: null//$scope.txtBranchName,
        }
        dataservice.getAllBranch(paraSearch, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                var data = vm.recursiveBranchReference(rs, null);
                $scope.listBranchReferenceDefault = angular.copy(data);
                $scope.listBranchReference = angular.copy(data);
            }
        });
    }
    vm.setSelectedNodeTreeBranch = function () {
        var paraSearch = {
            AppCode: $scope.model.AppCode,
            UserId: $scope.model.UserId,
            OnlySelected: true,
        }
        dataservice.getAllBranch(paraSearch, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                vm.searchBranch();

                vm.listBranchReference.forEach(function (obj, index) {
                    if (obj.OrgAddonCode == vm.UserInfo.BranchId) {
                        obj.IsChecked = true;
                        obj.IsMain = true;
                    }

                    var index1 = rs.map(function (e1) { return e1; }).indexOf(obj.OrgAddonCode);
                    if (index1 > -1) {
                        obj.IsChecked = true;

                        recursiveCheckBranchRefChild(obj.OrgAddonCode, obj.IsChecked);
                        recursiveCheckBranchRefParent(obj.OrgParentCode);
                    }
                });
            }
        });
    }
    vm.clickSelectOneBranchRef = function (item, type) {
        if (!item.IsMain) {
            if (type == 1) {
                item.IsChecked = !item.IsChecked;
            }

            recursiveCheckBranchRefChild(item.OrgAddonCode, item.IsChecked);
            recursiveCheckBranchRefParent(item.OrgParentCode);
        }
    }
    vm.getBranchReferenceChecked = function () {
        var listBranchChecked = [];
        var checkedBranchs = vm.listBranchReference.filter(function (obj, index) { return obj.IsChecked; });
        var indexAll = checkedBranchs.map(function (e) { return e.OrgAddonCode; }).indexOf('b_000');
        if (indexAll > -1) {
            listBranchChecked.push('b_000');
        } else {
            angular.forEach(checkedBranchs, function (obj, index) {
                if (obj.Ord > 1)
                    listBranchChecked.push(obj.OrgAddonCode);
            });
        }

        $scope.model.BranchRefs = listBranchChecked;
    }
    function recursiveCheckBranchRefChild(code, isChecked) {
        $scope.listBranchReference.forEach(function (obj, index) {
            if (obj.OrgParentCode != null && obj.OrgParentCode == code && !obj.IsMain) {
                obj.IsChecked = isChecked;

                recursiveCheckBranchRefChild(obj.OrgAddonCode, isChecked);
            }
        });
    }
    function recursiveCheckBranchRefParent(parentCode) {
        var indexParent = $scope.listBranchReference.map(function (obj, index) { return obj.OrgAddonCode; }).indexOf(parentCode);
        if (indexParent > -1) {
            var listChild = $scope.listBranchReference.filter(function (obj, index) { return obj.OrgParentCode == parentCode; });
            var totalChildChecked = listChild.filter(function (obj, index) { return obj.IsChecked; }).length;
            // Set check parent
            $scope.listBranchReference[indexParent].IsChecked = listChild.length == totalChildChecked;

            // recursive up parent
            if ($scope.listBranchReference[indexParent].OrgParentCode != null)
                recursiveCheckBranchRefParent($scope.listBranchReference[indexParent].OrgParentCode);
        }
    }

    // Save and refresh action
    $scope.refreshResource = function () {
        $scope.getResourceApi(0);
    }
    $scope.clearAllResource = function () {
        var index = $scope.listGroupUsersCopy.map(function (e) { return e.GroupCode; }).indexOf($scope.model.GroupCode);
        if (index > -1) {
            $scope.listGroupUsersCopy[index].Resources = [];
            $scope.model.Resources = [];
            $scope.selectedGroup[index] = false;
            $scope.selectAll = false;
        }
    }
    $scope.saveResource = function () {
        // Get all group selected
        $scope.GroupUsersSelected = [];
        var roleCount = 0;
        angular.forEach($scope.listGroupUsersCopy, function (value, key) {
            var index = $scope.model.GroupUsers.map(function (e) { return e; }).indexOf(value.GroupCode);
            if (index > -1) {
                $scope.GroupUsersSelected.push(value);
                if (value.RoleId != null && value.RoleId != '' && value.RoleId != '--- Role ---') roleCount++;
            }
        });
        // Get all Branch reference
        $scope.getBranchReferenceChecked();
        // Validate input
        if ($scope.model.AppCode == null || $scope.model.AppCode == '') {
            App.toastrWarning('Application is required!Please select application!');
        } else if (roleCount < $scope.GroupUsersSelected.length) {
            App.toastrWarning('Role is required! Please select role for each department or profit center.');
        } else {
            var data = {
                UserId: $scope.model.UserId,
                AppCode: $scope.model.AppCode,
                IsExceeded: $scope.UserInfo.IsExceeded,
                GroupUsers: $scope.GroupUsersSelected,
                BranchRefs: $scope.model.BranchRefs,
            };

            dataservice.updatePermission(data, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    // Init data
    $scope.initData = function () {
        //dataservice.getItem($scope.model.UserId, function (rs) {rs=rs.data;
        //    if (rs.Error) {
        //        App.toastrError(rs.Title);
        //        $location.path('/');
        //    } else {
        //        $scope.UserInfo = rs;

        //        $scope.loadGroupUser();
        //    }
        //});

        dataservice.getAllApplication(function (rs1) {rs1=rs1.data;
            if (rs1.Error) { }
            else {
                $scope.listApplication = rs1;
            }
        });
        dataservice.loadRole(function (rs1) {rs1=rs1.data;
            if (rs1.Error) { }
            else {
                $scope.listRoles = rs1;
            }
        });
        $scope.loadGroupUser();
        $scope.getAllBranch();
    }
    $scope.initData();

});
