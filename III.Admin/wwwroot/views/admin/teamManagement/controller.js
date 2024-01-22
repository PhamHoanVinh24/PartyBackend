var ctxfolder = "/views/admin/teamManagement";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", "pascalprecht.translate", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'dynamicNumber']);
app.factory('dataservice', function ($http) {
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
        $http(req).success(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/TeamManagement/Insert/', data).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/TeamManagement/Update/', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/TeamManagement/Delete?Id=' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/TeamManagement/GetItem?Id=' + data).success(callback);
        },
        getListMember: function (data, callback) {
            $http.get('/Admin/TeamManagement/GetListMember?listMember=' + data).success(callback);
        },

        //combobox
        getTeamStatuss: function (callback) {
            $http.post('/Admin/TeamManagement/GetTeamStatuss/').success(callback);
        },
        getUsers: function (callback) {
            $http.post('/Admin/TeamManagement/GetUsers/').success(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $cookies, $filter, dataservice, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.validationOptions = {
            rules: {
                TeamName: {
                    required: true,
                },
            },
            messages: {
                TeamName: {
                    required: "Tên Team không được để trống",
                },
            }
        }

        $rootScope.IsTranslate = true;
    });
  
    //$rootScope.Categories = [];
    //$rootScope.PaymentType = [{
    //    Value: 0,
    //    Name: "Phiếu chi"
    //}, {
    //    Value: 1,
    //    Name: "Phiếu thu"
    //}]
    //$rootScope.DateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
    //$rootScope.DateBeforeSevenDay = $filter('date')(new Date().setDate((new Date()).getDate() + (-7)), 'dd/MM/yyyy');
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/TeamManagement/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        TeamName: '',
        Leader: '',
        Member: '',
        Status: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/teamManagement/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.TeamName = $scope.model.TeamName;
                d.Leader = $scope.model.Leader
                d.Member = $scope.model.Member;
                d.Status = $scope.model.Status;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TeamName').withTitle('{{ "TEAM_LIST_COL_TEAM_TEAMNAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('LeaderName').withTitle('{{ "TEAM_LIST_COL_TEAM_LEADER" | translate }}').renderWith(function (data, type) {
        return '<span class="text-danger">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('{{ "TEAM_LIST_COL_TEAM_STATUS" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Members').withTitle('{{ "TEAM_LIST_COL_TEAM_MEMBERS" | translate }}').renderWith(function (data, type, full) {
        return '<a ng-click="viewDetailMember(' + full.Id + ')">Xem chi tiết</a>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{ "TEAM_LIST_COL_TEAM_ACTION" | translate }}').notSortable().withOption('sClass', 'nowrap').renderWith(function (data, type, full, meta) {
        return '<button title="Edit" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Delete" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));

    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }

    $scope.reload = function () {
        reloadData(true);
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

    $scope.search = function () {
        reloadData(true);
    };
    $scope.reload = function () {
        reloadData(true);
    }

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
        }, function () { });
    };
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
            reloadData(false);
        }, function () { });
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {
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
            reloadData(false);
        }, function () {
        });
    };
    $scope.viewDetailMember = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        if (userModel) {
            dataservice.getListMember(userModel.Members, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: ctxfolder + '/listMember.html',
                        controller: 'listMember',
                        backdrop: 'static',
                        size: '30',
                        resolve: {
                            para: function () {
                                return rs.Object;
                            }
                        }
                    });
                    modalInstance.result.then(function (d) {
                    }, function () { });
                }
            })
        }
    }
    $scope.initLoad = function () {
        dataservice.getTeamStatuss(function (rs) {
            $scope.Statuss = rs;
        });
        dataservice.getUsers(function (rs) {
            $scope.Leaders = rs;
        });
    }
    $scope.initLoad();
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.Members = [];
    $scope.model = {
        TeamName: '',
        Leader: '',
        Status: '',
        User: '',
        Employee: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        var member = [];
        for (var i = 0; i < $scope.Members.length; i++) {
            member.push($scope.Members[i].Id);
        }
        $scope.model1 = {
            TeamName: $scope.model.TeamName,
            Leader: $scope.model.Leader,
            Status: $scope.model.Status,
            Members: member.join(','),
            Description: $scope.model.Description
        }
        $scope.model2 = {
            Header: $scope.model1,
            //List: $scope.Members
        }
        validationSelect($scope.model);
        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            dataservice.insert($scope.model2, function (result) {
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.initLoad = function () {
        dataservice.getTeamStatuss(function (rs) {
            $scope.Statuss = rs;
        });
        dataservice.getUsers(function (rs) {
            $scope.Leaders = rs;
            $scope.Users = rs;
        });
    }
    $scope.initLoad();
    $scope.selectUser = function () {
        for (var indx = 0; indx < $scope.Users.length; ++indx) {
            if ($scope.Users[indx].Id == $scope.model.User) {
                var user = $scope.Users[indx];
                var userIn = false;
                var id = "" + user.Id;
                for (var idx = 0; idx < $scope.Members.length; ++idx) {
                    if ($scope.Members[idx].Id == id) {
                        userIn = true;
                        break;
                    }
                }
                if (userIn == false) {
                    var user1 = user;
                    user1.Id = id;
                    $scope.Members.push(user1);
                }
                else {
                    App.toastrError(caption.TEAM_MSG_EXIST_USER);
                }
            }
        }
    }
    $scope.removeUser = function (indx) {
        $scope.Members.splice(indx, 1);
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "Leader" && $scope.model.Leader != "") {
            $scope.errorLeader = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Leader == "" || data.Leader == null) {
            $scope.errorLeader = true;
            mess.Status = true;
        } else {
            $scope.errorLeader = false;
        }
        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        return mess;
    }
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
    $scope.Members = [];
    $scope.model = {
        TeamName: '',
        Leader: '',
        Status: '',
        User: '',
        Employee: ''
    }
   
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        var member = [];
        for (var i = 0; i < $scope.Members.length; i++) {
            member.push($scope.Members[i].Id);
        }
        $scope.model1 = {
            TeamName: $scope.model.TeamName,
            Leader: $scope.model.Leader,
            Status: $scope.model.Status,
            Members: member.join(','),
            Description: $scope.model.Description
        }
        $scope.model2 = {
            TeamCode: $scope.model.TeamCode,
            Header: $scope.model1,
            //List: $scope.Members
        }
        if ($scope.editform.validate() && validationSelect($scope.model).Status == false) {
            dataservice.update($scope.model2, function (result) {
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
      
    }
    $scope.initLoad = function () {
        dataservice.getTeamStatuss(function (rs) {
            $scope.Statuss = rs;
        });
        dataservice.getUsers(function (rs) {
            $scope.Leaders = rs;
            $scope.Users = rs;
        });
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs.Object.Header;
                $scope.Members = rs.Object.List;
            }
        });
    }
    $scope.initLoad();
    $scope.selectUser = function () {
        for (var indx = 0; indx < $scope.Users.length; ++indx) {
            if ($scope.Users[indx].Id == $scope.model.User) {
                var user = $scope.Users[indx];
                var userIn = false;
                for (var idx = 0; idx < $scope.Members.length; ++idx) {
                    if ($scope.Members[idx].Id == user.Id) {
                        userIn = true;
                        break;
                    }
                }
                if (userIn == false) {
                    $scope.Members.push(user);
                }
                else {
                    App.toastrError(caption.TEAM_MSG_EXIST_USER);
                }
            }
        }
    }
    $scope.removeUser = function (indx) {
        $scope.Members.splice(indx, 1);
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "Leader" && $scope.model.Leader != "") {
            $scope.errorLeader = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Leader == "" || data.Leader == null) {
            $scope.errorLeader = true;
            mess.Status = true;
        } else {
            $scope.errorLeader = false;
        }
        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        return mess;
    }
});
app.controller('listMember', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.init = function () {
        $scope.listMember = para;
    }
    $scope.init();
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});