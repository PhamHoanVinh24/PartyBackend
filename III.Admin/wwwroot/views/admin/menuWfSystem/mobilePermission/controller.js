var ctxfolder = "/views/admin/mobilePermission";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        insertRolePrivilege: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/InsertRolePrivilege', data).then(callback);
        },
        delRolePrivilege: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/DeleteRolePrivilege', data).then(callback);
        },
        insertUserPrivilege: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/InsertUserPrivilege', data).then(callback);
        },
        delUserPrivilege: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/DeleteUserPrivilege', data).then(callback);
        },
        insertGroupUserPrivilege: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/InsertGroupUserPrivilege', data).then(callback);
        },
        delGroupUserPrivilege: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/DeleteGroupUserPrivilege', data).then(callback);
        },
        updatePermission: function (data, callback) {
            $http.post('/Admin/MobilePermission/UpdatePermission', data).then(callback);
        },
        getFunction: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/GetFunction/', data).then(callback);
        },
        getFunctionChild: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/GetFunctionChild/', data).then(callback);
        },
        getResource: function (data, callback) {
            $http.post('/Admin/MobilePermission/GetResource', data).then(callback);
        },
        getAllApplication: function (callback) {
            $http.post('/Admin/MobilePermissionResource/GetApplication/').then(callback);
        },
        getGUser: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/GetGUser', data).then(callback);
        },
        getGRole: function (callback) {
            $http.post('/Admin/MobilePermissionResource/GetGRole').then(callback);
        },
        getUser: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/GetUser', data).then(callback);
        },
        getUserInGroup: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/GetUserInGroup', data).then(callback);
        },
        getAction: function (data, callback) {
            $http.post('/Admin/MobilePermissionResource/getACtion', data).then(callback);
        },
        //getGroupResource: function (callback) {
        //    $http.get('/Admin/MobilePermissionResource/getGroupResource').then(callback);
        //},
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };

    var culture = $cookies.get('.AspNetCore.Culture') || 'vi-VN';
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

    $translateProvider.useUrlLoader('/Admin/MobilePermission/Translation');
    caption = $translateProvider.translations();
});

app.filter("trust", ['$sce', function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);

app.controller('index', function ($scope, $rootScope, $confirm, $uibModal, dataservice, $timeout) {
    var vm = $scope;
    vm.span = function (item) {
        return '<span title="' + item + '">';
    }
    vm.spans = function () {
        return '</span>';
    }

    $scope.model = { ApplicationId: 'ADMIN', Function: null, Resources: [], GroupCodes: [], RoleId: '' };
    $scope.selectAll = false;
    $scope.search = '';

    $scope.applicationData = [];
    $scope.listRoles = [];

    // Role
    $scope.changeRole = function () {
        //if ($scope.lockCheckGroupUser) {
        setSelectedGroupUser();
        //} else {
        setSelectedNodeTreeFunction();
        //}
        ////$scope.getResourceApi();
    }


    // Department - Profit center
    $scope.listGroupUser = [];
    $scope.listGroupUserDefault = [];
    $scope.listGroupUserSelected = [];
    $scope.initDataGroup = function () {
        var search = {
            OnlyFunction: false,
        };

        dataservice.getGUser(search, function (rs) {rs=rs.data;
            if (rs.Error) {
            } else {
                
                $scope.listGroupUserDefault = rs;
                $scope.listGroupUser = angular.copy(rs);
            }
        });
    }
    $scope.SearchGroupUser = function () {
        if ($scope.model.SearchGroup === '' || $scope.model.SearchGroup == null) {
            //App.toastrWarning('Nhập điều kiện tìm kiếm');

            if ($scope.listGroupUser.length != $scope.listGroupUserDefault.length)
                $scope.listGroupUser = angular.copy($scope.listGroupUserDefault);
        } else {
            if ($scope.listGroupUserDefault.length > 0) {
                var listFilter = $scope.listGroupUserDefault.filter(function (obj, index) {
                    var index1 = obj.Title.toLowerCase().indexOf($scope.model.SearchGroup.toLowerCase());

                    return (obj.Ord == 1 || obj.Ord == 2 || obj.Ord == 4) || index1 > -1;
                });

                $scope.listGroupUser = angular.copy(listFilter);
            }
        }

        // Set highlight group user
        setSelectedGroupUser();

        // Reset all check function
        $scope.selectAllFunction = false;
        $scope.listFunction.forEach(function (obj, index) {
            obj.IsChecked = false;
        });

        // Reset resource api
        $scope.model.Resources = [];
    }
    $scope.clearSearchGroupUser = function () {
        $scope.model.SearchGroup = '';
        $scope.selectAllGroupUser = false;
        $scope.listGroupUser = angular.copy($scope.listGroupUserDefault);
    }
    $scope.getCountGroupUserLength = function () {
        var length = $scope.listGroupUser.length;
        var lengthCheck = $scope.listGroupUser.filter(function (obj, index) { return obj.IsChecked; }).length;
        return lengthCheck + '/' + length;
    }
    $scope.getCountGroupUserHighlight = function () {
        var length = $scope.listGroupUser.length;
        var lengthCheck = $scope.listGroupUser.filter(function (obj, index) { return obj.IsEnabled; }).length;
        return lengthCheck + '/' + length;
    }
    function setSelectedGroupUser() {
        //var listFunctionChecked = [];
        //$scope.listFunction.forEach(function (obj, index) {
        //    if (obj.IsChecked) listFunctionChecked.push(obj.Code);
        //});
        
        if ($scope.model.ApplicationId && $scope.model.RoleId) {
            var search = {
                RoleId: $scope.model.RoleId,
                AppCode: $scope.model.ApplicationId,
                //Function: listFunctionChecked[0],
                OnlyFunction: true,
            };
            dataservice.getGUser(search, function (rs) {rs=rs.data;
                if (rs.Error) {
                } else {
                    $scope.listGroupUser.forEach(function (obj, index) {
                        var index1 = rs.map(function (e1) { return e1.Code; }).indexOf(obj.Code);
                        obj.IsEnabled = index1 > -1;
                    });

                    //$scope.getResourceApi();
                }
            });
        } else {
            $scope.listGroupUser.forEach(function (obj, index) {
                obj.IsEnabled = false;
            });
            //$scope.getResourceApi();
        }
    }

    $scope.selectAllGroupUser = false;
    $scope.clickSelectAllGroupUser = function () {
        $scope.listGroupUser.forEach(function (obj, index) {
            obj.IsChecked = $scope.selectAllGroupUser;
        });

        //if ($scope.lockCheckGroupUser) {
        //    $scope.getResourceApi();
        //} else {
        // Set selected function
        setSelectedNodeTreeFunction();
        //}
    }
    $scope.clickSelectOneGroupUser = function (item, type) {
        if ($scope.lockCheckGroupUser) {
            if (type == 0) {
            } else {
                item.IsChecked = !item.IsChecked;
            }
        } else {
            if (type == 0) {
                if (item.IsChecked) {
                    $scope.listGroupUser.forEach(function (obj, index) {
                        if (item.Code != obj.Code) obj.IsChecked = false;
                    });
                }
            } else {
                $scope.listGroupUser.forEach(function (obj, index) {
                    obj.IsChecked = item.Code == obj.Code && !item.IsChecked;
                });
            }
        }

        var lengthChecked = $scope.listGroupUser.filter(function (obj, index) { return obj.IsChecked; }).length;
        $scope.selectAllGroupUser = lengthChecked == $scope.listGroupUser.length;

        //if ($scope.lockCheckGroupUser) {
        //    $scope.getResourceApi();
        //} else {
        setSelectedNodeTreeFunction();
        //}
    }

    //// Application
    //$scope.changeApplication = function () {
    //    //$scope.model.Function = undefined;

    //    $scope.showSelectPermission = false;
    //    //$scope.model.Resources = [];
    //    $scope.getAllFunction();
    //    setSelectedGroupUser();
    //}
    //$scope.clearApplication = function () {
    //    $scope.model.ApplicationId = undefined;
    //    $scope.model.Function = undefined;
    //    $scope.model.Resources = [];
    //    $scope.showSelectPermission = false;

    //    $scope.ddlFunction = [];
    //    $scope.listFunctionDefault = [];
    //    $scope.selectAllFunction = false;
    //    angular.copy($scope.listFunctionDefault, $scope.listFunction);
    //    setSelectedGroupUser();
    //};

    // Function gridview
    $scope.ddlFunction = [];
    $scope.listFunction = [];
    $scope.listFunctionDefault = [];
    function getAllFunction() {
        
        $scope.ddlFunction = [];
        $scope.listFunction = [];
        $scope.listFunctionDefault = [];
        var temp = { IdS: [$scope.model.ApplicationId] };

        dataservice.getFunction(temp, function (rs) {rs=rs.data;
            if (rs.Error) {
            } else {
                if (rs.length > 0) {
                    $scope.listFunctionDefault = rs;
                    $scope.listFunction = angular.copy(rs);

                    var listParent = $scope.listFunctionDefault.filter(function (obj, index) {
                        return obj.ParentCode == undefined || obj.ParentCode == null;
                    });
                    $scope.ddlFunction = angular.copy(listParent);
                }

                //if ($scope.lockCheckGroupUser) {
                //    setSelectedGroupUser();
                //} else {
                setSelectedNodeTreeFunction();
                //}
            }
        });
    }
    $scope.getAllFunctionChild = function () {
        if ($scope.model.Function) {
            var listData = recursiveFunction($scope.listFunctionDefault, $scope.model.Function.Code, 0);

            angular.copy(listData, $scope.listFunction);
        } else {
            angular.copy($scope.listFunctionDefault, $scope.listFunction);
        }
        // Set check parent
        $scope.listFunction.forEach(function (obj, index) {
            recursiveCheckFunctionParent(obj.ParentCode);

            //var indexParent = $scope.listFunction.map(function (obj1, index1) { return obj1.Code; }).indexOf(obj.ParentCode);
            //if (indexParent > -1) {
            //    var listChild = $scope.listFunction.filter(function (obj2, index2) { return obj2.ParentCode == obj.ParentCode; });
            //    var totalChildChecked = listChild.filter(function (obj3, index3) { return obj3.IsChecked; }).length;
            //    // Set check parent
            //    $scope.listFunction[indexParent].IsChecked = listChild.length == totalChildChecked;
            //}
        });
        // Set check all function
        $scope.setCheckAllFunction();
    }
    function setSelectedNodeTreeFunction() {
        var isCheckArrGroupUserId = [];
        $scope.listGroupUser.forEach(function (obj, index) {
            if (obj.IsChecked) isCheckArrGroupUserId.push(obj.Code);
        });

        if (isCheckArrGroupUserId.length == 1 && !$scope.lockCheckGroupUser) {
            if ($scope.model.RoleId) {
                var temp = { IdS: [$scope.model.ApplicationId, isCheckArrGroupUserId[0], $scope.model.RoleId] };
                dataservice.getFunction(temp, function (rs) {rs=rs.data;
                    if (rs.Error) {
                    } else {
                        $scope.listFunctionDefault.forEach(function (obj, index) {
                            var index1 = rs.map(function (e1) { return e1.Code; }).indexOf(obj.Code);
                            obj.IsChecked = index1 > -1;
                        });

                        $scope.getAllFunctionChild();
                        $timeout(function () {
                            $scope.getResourceApi();
                        }, 100);
                    }
                });
            }
        } else {
            if (isCheckArrGroupUserId.length > 0 || $scope.lockCheckGroupUser) {
                $scope.listFunctionDefault.forEach(function (obj, index) {
                    var obj1 = $scope.listFunction.filter(function (e1) { return e1.Code === obj.Code; });
                    obj.IsChecked = obj1.length > 0 && obj1[0].IsChecked;
                });
            } else {
                $scope.listFunctionDefault.forEach(function (obj, index) {
                    obj.IsChecked = false;
                });
            }

            $scope.getAllFunctionChild();
            $timeout(function () {
                $scope.getResourceApi();
            }, 100);
        }
    }
    $scope.getCountFunctionLength = function () {
        var length = $scope.listFunction.length;
        var lengthCheck = $scope.listFunction.filter(function (obj, index) { return obj.IsChecked; }).length;
        return lengthCheck + '/' + length;
    }
    $scope.changeFunction = function () {
        $scope.model.Resources = [];
        $scope.showSelectPermission = false;

        //$timeout(function () {
        setSelectedNodeTreeFunction();
        //}, 100);
    }
    $scope.clearFunction = function () {
        $scope.model.Function = undefined;
        $scope.changeFunction();
    }
    function recursiveFunction(data, code, count) {
        var result = [];
        var resultTemp1 = [];
        if (data && code) {
            count++;
            if (count == 1) {
                resultTemp1 = data.filter(function (obj, index) {
                    return obj.Code == code;
                });
                resultTemp1.forEach(function (obj, index) {
                    result.push(obj);

                    var resultTemp2 = recursiveFunction(data, obj.Code, count);
                    result = result.concat(resultTemp2);
                });
            } else {
                resultTemp1 = data.filter(function (obj, index) {
                    return obj.ParentCode == code;
                });
                resultTemp1.forEach(function (obj, index) {
                    result.push(obj);

                    var resultTemp2 = recursiveFunction(data, obj.Code, count);
                    result = result.concat(resultTemp2);
                });
            }
        }
        return result;
    }

    $scope.selectAllFunction = false;
    $scope.clickSelectAllFunction = function () {
        $scope.listFunction.forEach(function (obj, index) {
            obj.IsChecked = $scope.selectAllFunction;
        });

        $scope.getResourceApi();
    }
    $scope.clickSelectOneFunction = function (item, type) {
        //if ($scope.lockCheckGroupUser) {
        //    if (type == 0) {
        //        if (item.IsChecked) {
        //            $scope.listFunction.forEach(function (obj, index) {
        //                if (item.Code != obj.Code) obj.IsChecked = false;
        //            });
        //        }
        //    } else {
        //        $scope.listFunction.forEach(function (obj, index) {
        //            obj.IsChecked = item.Code == obj.Code && !item.IsChecked;
        //        });
        //    }

        //    setSelectedGroupUser();
        //} else {
        if (type == 1) {
            item.IsChecked = !item.IsChecked;
        }
        recursiveCheckFunctionChild(item.Code, item.IsChecked);
        recursiveCheckFunctionParent(item.ParentCode);

        $scope.setCheckAllFunction();

        $scope.getResourceApi();
        //}
    }
    $scope.setCheckAllFunction = function () {
        var lengthChecked = $scope.listFunction.filter(function (obj, index) { return obj.IsChecked; }).length;
        $scope.selectAllFunction = lengthChecked == $scope.listFunction.length;
    }
    function recursiveCheckFunctionChild(code, isChecked) {
        $scope.listFunction.forEach(function (obj, index) {
            if (obj.ParentCode != null && obj.ParentCode == code) {
                obj.IsChecked = isChecked;

                recursiveCheckFunctionChild(obj.Code, isChecked);
            }
        });
    }
    function recursiveCheckFunctionParent(parentCode) {
        var indexParent = $scope.listFunction.map(function (obj, index) { return obj.Code; }).indexOf(parentCode);
        if (indexParent > -1) {
            var listChild = $scope.listFunction.filter(function (obj, index) { return obj.ParentCode == parentCode; });
            var totalChildChecked = listChild.filter(function (obj, index) { return obj.IsChecked; }).length;
            // Set check parent
            $scope.listFunction[indexParent].IsChecked = listChild.length == totalChildChecked;

            // recursive up parent
            if ($scope.listFunction[indexParent].ParentCode != null)
                recursiveCheckFunctionParent($scope.listFunction[indexParent].ParentCode);
        }
    }

    $scope.lockCheckGroupUser = false;
    $scope.changeLockCheckGroup = function () {
        // Reset all check group user
        $scope.selectAllGroupUser = false;
        $scope.listGroupUser.forEach(function (obj, index) {
            obj.IsChecked = false;
        });

        // Reset all check function
        $scope.selectAllFunction = false;
        $scope.listFunction.forEach(function (obj, index) {
            obj.IsChecked = false;
        });

        // Reset resource api
        $scope.model.Resources = [];
    }

    // Resource API
    $scope.getCountResourceLength = function () {
        var length = $scope.model.Resources.filter(function (obj, index) { return !obj.IsFunction; }).length;
        var lengthCheck = $scope.model.Resources.filter(function (obj, index) { return obj.HasPermission && !obj.IsFunction; }).length;
        return lengthCheck + '/' + length;
    }
    $scope.getResourceApi = function () {
        $scope.selectAll = false;

        var isCheckArrGroupUserId = [];
        $scope.listGroupUser.forEach(function (obj, index) {
            if (obj.IsChecked) isCheckArrGroupUserId.push(obj.Code);
        });

        var isCheckArrFuncId = [];
        $scope.listFunction.forEach(function (obj, index) {
            if (obj.IsChecked) isCheckArrFuncId.push(obj.Code);
        });

        $scope.showSelectPermission = isCheckArrGroupUserId.length > 0 && $scope.model.ApplicationId && $scope.model.RoleId !== '';
        var model1 = {
            AppCode: $scope.model.ApplicationId,
            ListGUserId: isCheckArrGroupUserId,
            ListFuncId: isCheckArrFuncId,
            RoleId: $scope.model.RoleId,
            IsMultiple: $scope.lockCheckGroupUser,
        }

        if (isCheckArrFuncId.length > 0) {
            dataservice.getResource(model1, function (rs) {rs=rs.data;
                if (rs.Error) {
                } else {
                    $scope.model.Resources = rs;
                }
            });
        } else {
            $scope.model.Resources = [];
        }
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

    // Event click
    $scope.saveResource = function () {
        $scope.model.GroupCodes = [];
        $scope.listGroupUser.forEach(function (obj, index) {
            if (obj.IsChecked) $scope.model.GroupCodes.push(obj.Code);
        });

        if ($scope.model.ApplicationId == null || $scope.model.ApplicationId <= 0) {
            App.toastrWarning('Please select application!');
            //} else if ($scope.model.Resources.length <= 0) {
            //    App.toastrWarning('Resource API is empty! Please select other function!');
        } else if ($scope.model.GroupCodes.length <= 0) {
            App.toastrWarning('Please select department or profit center!');
        } else if ($scope.model.RoleId === '') {
            App.toastrWarning('Role is required! Please select role.');
        } else {
            var resources = $scope.model.Resources.filter(function (obj, index) {
                return obj.HasPermission && !obj.IsFunction;
            });
            var data = {
                ApplicationCode: $scope.model.ApplicationId,
                FunctionCode: $scope.model.Function == null ? null : $scope.model.Function.Code,
                Resources: resources,
                GroupCodes: $scope.model.GroupCodes,
                RoleId: $scope.model.RoleId,
                IsMultiple: $scope.lockCheckGroupUser,
            };

            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });
            
            dataservice.updatePermission(data, function (rs) {rs=rs.data;
                App.unblockUI("#contentMain");
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }
    $scope.refreshResource = function () {
        $scope.getResourceApi();
    }

    // Init data
    $scope.initLoad = function () {
        dataservice.getAllApplication(function (rs) {rs=rs.data;
            if (rs.Error) { }
            else {
                $scope.applicationData = rs;
            }
        });
        dataservice.getGRole(function (rs) {rs=rs.data;
            if (rs.Error) { }
            else {
                $scope.listRoles = rs;
            }
        });
        $scope.initDataGroup();
        $scope.showSelectPermission = false;
        getAllFunction();
        setSelectedGroupUser();

        if ($().bootstrapSwitch) {
            $(".make-switch").bootstrapSwitch();

            $('.make-switch').on('switchChange.bootstrapSwitch', function (event, state) {
                //if (state) {
                //    $('#contentMainGroupUser').addClass('col-md-push-3 col-sm-push-6 res-pa-h0');
                //    $('#contentMainAppFunc').addClass('col-md-pull-3 col-sm-pull-6').removeClass('res-pa-h0');
                //} else {
                //    $('#contentMainGroupUser').removeClass('col-md-push-3 col-sm-push-6 res-pa-h0');
                //    $('#contentMainAppFunc').removeClass('col-md-pull-3 col-sm-pull-6').addClass('res-pa-h0');
                //}

                $scope.lockCheckGroupUser = state;
                $scope.changeLockCheckGroup();
                angular.element('#contentMain').scope().$apply();
            });
        }
    }
    $scope.initLoad();
});
