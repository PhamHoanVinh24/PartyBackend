var ctxfolder = "/views/admin/edmsProfileManagementCategory";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);
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
app.service('myService', function () {
    var data;
    this.setData = function (d) {
        data = d;
    }
    this.getData = function () {
        return data;
    }
});
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
            beforeSend: function () {
                App.blockUI({
                    target: "#contentFile",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#contentFile");
            },
            data: data
        }
        $http(req).success(callback);
    };

    return {
        
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/pdfViewer', {
            templateUrl: ctxfolder + '/pdfViewer.html',
            controller: 'pdfViewer'
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
    $httpProvider.interceptors.push('interceptors');
    $httpProvider.interceptors.push('httpResponseInterceptor');
});
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DispatchesIncommingDispatches/JTable",
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
             
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
        .withOption('stateSave', true)
        .withOption('stateSaveCallback', function (settings, data) {
            sessionStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data));
        })
        .withOption('stateLoadCallback', function (settings) {
            if ($rootScope.savePageState) {
                return JSON.parse(sessionStorage.getItem('DataTables_' + settings.sInstance));
            } else {
                return settings.sInstance;
            }
        })
        .withOption('serverSide', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
            $rootScope.savePageState = true;
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentNumber').withTitle('Số đến').withOption('sWidth', '30px').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FromDate').withTitle('Ngày đến').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Origanization').withTitle('Cơ quan BH').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentSymbol').withTitle('Số/ký hiệu').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('Ngày VB').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('Trích yếu').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('Trạng thái').withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type) {
        if (data == "DONE") {
            return '<span class="text-success">Đã hoàn thành</span>';
        } else {
            return '<span class="text-danger">Đang chờ</span>';
        }
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $scope.search = function () {
        reloadData(true);
    }

    $scope.reload = function () {
        reloadData(false);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    }

    $scope.delete = function (id) {
        var list = [];
        list.push(id);
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return list;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = "Bạn muốn xóa hay không ?";
                $scope.ok = function () {
                    dataservice.delete(para, function (rs) {
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
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                myService.setData(rs.Object);
                $location.path('/edit/');
            }
        });
    }
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#DateTo').datepicker('setStartDate', maxDate);
        });
        $("#DateTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });

        $("#CreatedTimeFrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CreatedTimeTo').datepicker('setStartDate', maxDate);
        });
        $("#CreatedTimeTo").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#CreatedTimeFrom').datepicker('setEndDate', maxDate);
        });
        $('.CreatedTime-To').click(function () {
            $('#CreatedTimeFrom').datepicker('setEndDate', null);
        });
        $('.CreatedTime-From').click(function () {
            $('#CreatedTimeTo').datepicker('setStartDate', null);
        });
    }
    function validateNumber() {
        var number = document.getElementById('DocumentNumber');
        number.onkeydown = function (e) {
            if (!((e.keyCode > 95 && e.keyCode < 106)
                || (e.keyCode > 47 && e.keyCode < 58)
                || e.keyCode == 8)) {
                return false;
            }
        }
    }
    setTimeout(function () {
        loadDate();
        validateNumber();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, dataservice, myService) {
    var fileId = 1;
    var memmberId = 1;
    var commentId = 1;
    $scope.model = {
        Header: {
            DocumentNumber: '',
            DocumentCode: '',
            Origanization: '',
            UnitEditor: '',
            CreatedUserId: '',
            IsReply: true,
            IsProcess: true,
        },
        Detail: {
            ListFile: [],
            ListComment: [],
            ListMember: [],
            Reason: '',
            DeadLine: '',
            Coordinate: [],
            Received: []
        }
    }
    $scope.model1 = {
        Comment: '',
        Member: [],
    }

    //list default
    $scope.ListRole = [{
        Code: 1,
        Checked: false,
        Name: 'Xử lý chính'
    }, {
        Code: 2,
        Checked: false,
        Name: 'Phối hợp'
    }, {
        Code: 3,
        Checked: false,
        Name: 'Xem để biết'
    }]
    $scope.ListSearchMember = [];
    $scope.treeData = [];



    $scope.initLoad = function () {
        dataservice.getLoadDefaultUser(function (rs) {
            $scope.model.Header.CreatedUserId = rs.UserId;
        });
        dataservice.getAllListUserActive(function (rs) {
            $scope.ListUserData = rs;
        })
        dataservice.getDispatches(function (rs) {
            $scope.DispatchesData = rs;
        })
        dataservice.getDocumentField(function (rs) {
            $scope.DocumentFieldData = rs;
        });
        dataservice.getGetMothod(function (rs) {
            $scope.GetMothodData = rs;
        });
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $location.path('/');
    }

    //select combobox
    $scope.changeDocument = function (item) {
        $scope.model.Header.DocumentNumber = item.NumberCreator;
    }

    //Start_GroupUser https://github.com/ezraroi/ngJsTree
    $scope.readyCB = function () {
        dataservice.getAllGroupUser(function (rs) {
            App.blockUI({
                target: "#contentMainTree",
                boxed: true,
                message: 'loading...'
            });
            var root = {
                id: 'root',
                parent: "#",
                text: "Tất cả phòng ban",
                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
            }
            $scope.treeData.push(root);
            var index = 0;
            $scope.ListParent = rs.filter(function (item) {
                return (item.ParentCode == null);
            });
            for (var i = 0; i < rs.length; i++) {
                if (rs[i].ParentCode == null) {
                    var stt = $scope.ListParent.length - index;
                    if (stt.toString().length == 1) {
                        stt = "0" + stt;
                    }
                    index = index + 1;
                    var data = {
                        id: rs[i].Code,
                        parent: "root",
                        text: stt + ' - ' + rs[i].Title,
                        title: rs[i].Title,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeData.push(data);
                } else {
                    var data = {
                        id: rs[i].Code,
                        parent: rs[i].ParentCode,
                        text: rs[i].Title,
                        title: rs[i].Title,
                        state: { selected: false, opened: false }
                    }
                    $scope.treeData.push(data);
                }
            }
            App.unblockUI("#contentMainTree");
        });
    }
    $scope.selectGroupUser = function () {
        var listSelect = $("#treeDiv").jstree("get_selected", true);
        var listGroup = [];
        for (var i = 0; i < listSelect.length; i++) {
            listGroup.push(listSelect[i].id);
        }
        dataservice.getListUserInGroup(listGroup, function (result) {
            dataservice.getUserActive(function (rs) {
                var getUserPermision = result.find(function (element) {
                    if (element.IsPermision == true) return true;
                });
                if (getUserPermision) {
                    var checkExistUser = $scope.model.Detail.ListMember.find(function (element) {
                        if (element.UserId == getUserPermision.UserId) return true;
                    });
                    if (!checkExistUser) {
                        //check exist user main
                        var checkExistUserMain = $scope.model.Detail.ListMember.find(function (element) {
                            if (element.Role == 1) return true;
                        });
                        var getGroupName = $scope.treeData.find(function (element) {
                            if (element.id == getUserPermision.GroupUserCode) return element;
                        });
                        if (!checkExistUserMain) {
                            var obj = {
                                Assigner: rs.UserId,
                                AssignerName: rs.Name,
                                AssignerGroupUserName: rs.AssignerGroupUserName,
                                GroupUserName: getGroupName ? getGroupName.title : null,
                                UserId: getUserPermision.UserId,
                                Name: getUserPermision.Name,
                                Role: 1,
                                CreatedTime: new Date(),
                                IsPermision: getUserPermision.IsPermision,
                            }
                            $scope.model.Detail.ListMember.push(obj);
                            App.toastrSuccess("Thêm người nhận: " + obj.Name + " thành công");
                        } else {
                            var obj = {
                                Assigner: rs.UserId,
                                AssignerName: rs.Name,
                                AssignerGroupUserName: rs.AssignerGroupUserName,
                                GroupUserName: getGroupName ? getGroupName.title : null,
                                UserId: getUserPermision.UserId,
                                Name: getUserPermision.Name,
                                Role: 2,
                                CreatedTime: new Date(),
                                IsPermision: getUserPermision.IsPermision,
                            }
                            $scope.model.Detail.ListMember.push(obj);
                            App.toastrSuccess("Thêm người nhận: " + obj.Name + " thành công");
                        }
                    } else {
                        App.toastrError(checkExistUser.Name + ": Đã được nhận văn bản");
                    }
                } else {
                    App.toastrError("Phòng ban không có người nhận văn bản");
                }
            })
            $scope.model1.Member = [];
            $scope.ListSearchMember = result;
        });
    }
    $scope.deselectGroupUser = function () {
        $scope.model1.Member = [];
        $scope.ListSearchMember = [];
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
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
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
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
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectGroupUser,
        'deselect_node': $scope.deselectGroupUser,
        //'search': $scope.searchTreeRepository,
    }
    $scope.updateSelection = function (position, ListRole) {
        angular.forEach(ListRole, function (subscription, index) {
            if (position != index) {
                subscription.Checked = false;
            }
        });
    }
    $scope.addMember = function (member) {
        if (member == '') {
            App.toastrError("Xin mời chọn người dùng");
        } else {
            //check no select role
            var role = $scope.ListRole.find(function (element) {
                if (element.Checked == true) return element;
            });
            if (!role) {
                App.toastrError("Xin mời chọn vai trò");
            } else {
                if (role.Code == 1) {
                    //check exist user main
                    var checkExistUserMain = $scope.model.Detail.ListMember.find(function (element) {
                        if (element.Role == 1) return true;
                    });
                    //check exist select one main
                    if ($scope.model1.Member.length > 1) {
                        App.toastrError("Không thể chọn hơn một người xử lý chính!");
                        return;
                    }
                }
                if (checkExistUserMain) {
                    App.toastrError("Bạn đã chọn người xử lý chính!");
                } else {
                    dataservice.getUserActive(function (rs) {
                        var count = 0;
                        for (var i = 0; i < $scope.model1.Member.length; i++) {
                            var getGroupName = $scope.treeData.find(function (element) {
                                if (element.id == $scope.model1.Member[i].GroupUserCode) return element;
                            });
                            if (!$scope.model1.Member[i].IsPermision && $scope.model1.Member[i].IsMain) {
                                continue;
                            } else {
                                //check exist user
                                var checkExistUser = $scope.model.Detail.ListMember.find(function (element) {
                                    if (element.UserId == $scope.model1.Member[i].UserId) return true;
                                });
                                if (!checkExistUser) {
                                    var obj = {
                                        AssignerGroupUserName: rs.AssignerGroupUserName,
                                        Assigner: rs.UserId,
                                        AssignerName: rs.Name,
                                        UserId: $scope.model1.Member[i].UserId,
                                        Name: $scope.model1.Member[i].Name,
                                        GroupUserName: getGroupName ? getGroupName.title : null,
                                        Role: role.Code,
                                        CreatedTime: new Date(),
                                        Status: false,
                                        IsPermision: false,
                                    }
                                    $scope.model.Detail.ListMember.push(obj);
                                    count++;
                                }
                            }
                        }
                        if (count == 0) {
                            App.toastrError("Người nhận đã được chọn");
                        } else {
                            if (role.Code == 1) {
                                App.toastrSuccess("Thêm người xử lý chính thành công");
                            } else if (role.Code == 2) {
                                App.toastrSuccess("Thêm người phối hợp thành công");
                            } else {
                                App.toastrSuccess("Thêm người xem để biết thành công");
                            }
                            $scope.model1.Member = [];
                        }
                    })
                }
            }
        }
    }
    $scope.deleteMember = function (index) {
        $scope.model.Detail.ListMember.splice(index, 1);
        App.toastrSuccess("Xóa người xử lý thành công");
    }
    //end_GroupUser


    //file
    $scope.addFile = function () {
        var file = document.getElementById("File").files[0];
        if (file == null || file == undefined) {
            App.toastrError("Vui lòng chọn tệp tin");
        } else {
            if ($scope.model.Header.CreatedUserId == '') {
                App.toastrError("Vui lòng chọn người soạn thảo");
            } else {
                //start else
                var idxDot = file.name.lastIndexOf(".") + 1;
                var name = file.name.substr(0, idxDot - 1).toLowerCase();
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();

                var exist = false;
                for (var i = 0; i < $scope.model.Detail.ListFile.length; i++) {
                    if ($scope.model.Detail.ListFile[i].FileName == name) {
                        exist = true;
                    }
                }
                if (exist) {
                    App.toastrError("Tệp tin đã tồn tại");
                } else {
                    var formData = new FormData();
                    formData.append("file", file);
                    var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'csv'];
                    var txt = ['txt'];
                    var word = ['docx', 'doc'];
                    var pdf = ['pdf'];
                    var png = ['png', 'jpg'];
                    var powerPoint = ['pps', 'pptx'];
                    if (excel.indexOf(extFile) !== -1) {
                        extFile = 1;
                    } else if (word.indexOf(extFile) !== -1) {
                        extFile = 2;
                    } else if (txt.indexOf(extFile) !== -1) {
                        extFile = 3;
                    } else if (pdf.indexOf(extFile) !== -1) {
                        extFile = 4;
                    } else if (powerPoint.indexOf(extFile) !== -1) {
                        extFile = 5;
                    } else if (png.indexOf(extFile) !== -1) {
                        extFile = 6;
                    } else {
                        extFile = 0;
                    }
                    if (extFile == 0) {
                        App.toastrError("Định dạng tệp không cho phép");
                    } else {
                        dataservice.uploadFile(formData, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                $scope.file = {
                                    Id: fileId++,
                                    FileName: name,
                                    User: rs.Object != null ? rs.Object.User : null,
                                    Fomart: extFile,
                                    CreatedTime: new Date(),
                                    Source: rs.Object != null ? rs.Object.Source : null,
                                }

                                $scope.model.Detail.ListFile.push($scope.file);
                                App.toastrSuccess(rs.Title);
                            }
                        })
                    }
                }
                //end else
            }
        }
    }
    $scope.deleteFile = function (index) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn muốn xóa tệp tin hay không ?";
                $scope.ok = function () {
                    $scope.model.Detail.ListFile.splice(index, 1);
                    App.toastrSuccess("Xóa tệp tin thành công");
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '25',
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    //comment
    $scope.addComment = function () {
        if ($scope.model1.Comment == null || $scope.model1.Comment == "") {
            App.toastrError("Bạn chưa nhập ý kiến");
        } else {
            dataservice.getUserActive(function (rs) {
                $scope.comment = {
                    Id: commentId++,
                    User: rs.Name,
                    Comment: $scope.model1.Comment,
                    CreatedTime: new Date(),
                    IsShowDelete: true,
                }
                $scope.model.Detail.ListComment.push($scope.comment);
                App.toastrSuccess("Thêm ý kiến thành công");
            });
        }
    }
    $scope.deleteComment = function (index) {
        $scope.model.Detail.ListComment.splice(index, 1);
        App.toastrSuccess("Xóa ý kiến thành công");
    }

    //submit
    $scope.changeSelect = function (selectType) {
        if (selectType == "DocumentCode" && $scope.model.Header.DocumentCode != "") {
            $scope.errorDocumentCode = false;
        }
        if (selectType == "CreatedUserId" && $scope.model.Header.CreatedUserId != "") {
            $scope.errorCreatedUserId = false;
        }
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = "Bạn muốn tạo văn bản hay không ?";
                    $scope.ok = function () {
                        dataservice.insertAsync(para, function (rs) {
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
                $rootScope.savePageState = false;
                $location.path('/');
            }, function () {
            });
        }
    }
    $scope.view = function (source) {
        var url = ctxfolder.replace("views/", "");
        window.open(url + '#/pdfViewer?source=' + source, '_blank');
        window.focus();
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Header.DocumentCode == "") {
            $scope.errorDocumentCode = true;
            mess.Status = true;
        } else {
            $scope.errorDocumentCode = false;
        }
        //if (data.Header.UnitEditor == "") {
        //    $scope.errorUnitEditor = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorUnitEditor = false;
        //}
        if (data.Header.CreatedUserId == "") {
            $scope.errorCreatedUserId = true;
            mess.Status = true;
        } else {
            $scope.errorCreatedUserId = false;
        }
        return mess;
    };
    function loadDate() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#PromulgateDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#DeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        var minDate = new Date();
        $('#FromDate').datepicker('setEndDate', minDate);
        $('#PromulgateDate').datepicker('setEndDate', minDate);
        $('#DeadLine').datepicker('setStartDate', minDate);
    }
    function validateNumber() {
        var number = document.getElementById('DocumentNumber');
        number.onkeydown = function (e) {
            if (!((e.keyCode > 95 && e.keyCode < 106)
                || (e.keyCode > 47 && e.keyCode < 58)
                || e.keyCode == 8)) {
                return false;
            }
        }
    }
    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        loadPoper();
        loadDate();
        validateNumber();
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $location, $filter, $routeParams, dataservice, myService) {
    var fileId = -1;
    var commentId = -1;
    var memberId = -1;
    $scope.model = {};
    $scope.model1 = {
        Comment: '',
        Memmber: []
    }
    $scope.ListRole = [{
        Code: 1,
        Checked: false,
        Name: 'Xử lý chính'
    }, {
        Code: 2,
        Checked: false,
        Name: 'Phối hợp'
    }, {
        Code: 3,
        Checked: false,
        Name: 'Xem để biết'
    }]
    $scope.ListSearchMember = [];
    $scope.treeData = [];
    $scope.ListDeleteFile = [];
    $scope.ListDeleteComment = [];
    $scope.ListDeleteMember = [];
    $scope.time_left = '';
    $scope.initLoad = function () {
        $scope.model = myService.getData();
        if ($scope.model != undefined) {
            validationDefaultDateTime();
            dataservice.getActivity($scope.model.Header.Id, function (rs) {
                $scope.ActivityData = rs;
            })
            $rootScope.DocumentStatus = $scope.model.Status;
        } else {
            $location.path('/');
        }
        dataservice.getDispatches(function (rs) {
            $scope.DispatchesData = rs;
        })
        dataservice.getGetMothod(function (rs) {
            $scope.GetMothodData = rs;
        });
        dataservice.getAllListUserActive(function (rs) {
            $scope.ListUserData = rs;
        })
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $location.path('/');
    }
    //select combobox 
    $scope.changeDocument = function (item) {
        $scope.model.Header.DocumentNumber = item.NumberCreator;
    }

    //groupUser
    $scope.readyCB = function () {
        dataservice.getAllGroupUser(function (rs) {
            App.blockUI({
                target: "#contentMainTree",
                boxed: true,
                message: 'loading...'
            });
            var root = {
                id: 'root',
                parent: "#",
                text: "Tất cả phòng ban",
                state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
            }
            $scope.treeData.push(root);
            var index = 0;
            $scope.ListParent = rs.filter(function (item) {
                return (item.ParentCode == null);
            });
            for (var i = 0; i < rs.length; i++) {
                if (rs[i].ParentCode == null) {
                    var stt = $scope.ListParent.length - index;
                    if (stt.toString().length == 1) {
                        stt = "0" + stt;
                    }
                    index = index + 1;
                    var data = {
                        id: rs[i].Code,
                        parent: "root",
                        text: stt + ' - ' + rs[i].Title,
                        title: rs[i].Title,
                        state: { selected: false, opened: true }
                    }
                    $scope.treeData.push(data);
                } else {
                    var data = {
                        id: rs[i].Code,
                        parent: rs[i].ParentCode,
                        text: rs[i].Title,
                        title: rs[i].Title,
                        state: { selected: false, opened: false }
                    }
                    $scope.treeData.push(data);
                }
            }
            App.unblockUI("#contentMainTree");
        });
    }
    $scope.selectGroupUser = function () {
        var listSelect = $("#treeDiv").jstree("get_selected", true);
        var listGroup = [];
        for (var i = 0; i < listSelect.length; i++) {
            listGroup.push(listSelect[i].id);
        }
        dataservice.getListUserInGroup(listGroup, function (result) {
            dataservice.getUserActive(function (rs) {
                var getUserPermision = result.find(function (element) {
                    if (element.IsPermision == true) return true;
                });
                if (getUserPermision) {
                    //check exist user
                    var checkExistUser = $scope.model.Detail.ListMember.find(function (element) {
                        if (element.UserId == getUserPermision.UserId) return true;
                    });
                    if (!checkExistUser) {
                        //check exist user main
                        var checkExistUserMain = $scope.model.Detail.ListMember.find(function (element) {
                            if (element.Role == 1) return true;
                        });
                        var getGroupName = $scope.treeData.find(function (element) {
                            if (element.id == getUserPermision.GroupUserCode) return element;
                        });
                        if (!checkExistUserMain) {
                            var obj = {
                                Id: memberId--,
                                Assigner: rs.UserId,
                                AssignerName: rs.Name,
                                AssignerGroupUserName: rs.AssignerGroupUserName,
                                GroupUserName: getGroupName ? getGroupName.title : null,
                                UserId: getUserPermision.UserId,
                                Name: getUserPermision.Name,
                                Role: 1,
                                CreatedTime: new Date(),
                                IsPermision: getUserPermision.IsPermision,
                                Status: false,
                                IsShowDelete: true,
                                IsShowComment: true,
                            }
                            $scope.model.Detail.ListMember.push(obj);
                            App.toastrSuccess("Thêm người nhận: " + obj.Name + " thành công");
                        } else {
                            var obj = {
                                Id: memberId--,
                                Assigner: rs.UserId,
                                AssignerName: rs.Name,
                                AssignerGroupUserName: rs.AssignerGroupUserName,
                                GroupUserName: getGroupName ? getGroupName.title : null,
                                UserId: getUserPermision.UserId,
                                Name: getUserPermision.Name,
                                Role: 2,
                                CreatedTime: new Date(),
                                IsPermision: getUserPermision.IsPermision,
                                Status: false,
                                IsShowDelete: true,
                                IsShowComment: true,
                            }
                            $scope.model.Detail.ListMember.push(obj);
                            App.toastrSuccess("Thêm người nhận: " + obj.Name + " thành công");
                        }
                    } else {
                        App.toastrError(checkExistUser.Name + " đã được nhận văn bản");
                    }
                } else {
                    App.toastrError("Phòng ban không có người nhận văn bản");
                }
            })
            $scope.model1.Member = [];
            $scope.ListSearchMember = result;
        });
    }
    $scope.deselectGroupUser = function () {
        $scope.model1.Member = [];
        $scope.ListSearchMember = [];
    }
    $scope.treeConfig = {
        core: {
            multiple: false,
            animation: true,
            error: function (error) {
                $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
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
        plugins: ['checkbox', 'types', 'search', 'state'],
        checkbox: {
            "three_state": false,
            "whole_node": true,
            "keep_selected_style": true,
            "cascade": "undetermined",
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
        }
    };
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectGroupUser,
        'deselect_node': $scope.deselectGroupUser,
        //'search': $scope.searchTreeRepository,
    }
    $scope.updateSelection = function (position, ListRole) {
        angular.forEach(ListRole, function (subscription, index) {
            if (position != index) {
                subscription.Checked = false;
            }
        });
    }
    $scope.addMember = function (member) {
        if (member == '' || member == undefined) {
            App.toastrError("Xin mời chọn người dùng");
        } else {
            //check no select role
            var role = $scope.ListRole.find(function (element) {
                if (element.Checked == true) return element;
            });
            if (!role) {
                App.toastrError("Xin mời chọn vai trò");
            } else {
                if (role.Code == 1) {
                    //check exist user main
                    var checkExistUserMain = $scope.model.Detail.ListMember.find(function (element) {
                        if (element.Role == 1) return true;
                    });
                    //check exist select one main
                    if ($scope.model1.Member.length > 1) {
                        App.toastrError("Không thể chọn hơn một người xử lý chính!");
                        return;
                    }
                }
                if (checkExistUserMain) {
                    App.toastrError("Đã tồn tại người xử lý chính");
                } else {
                    dataservice.getUserActive(function (rs) {
                        var count = 0;
                        for (var i = 0; i < $scope.model1.Member.length; i++) {
                            var getGroupName = $scope.treeData.find(function (element) {
                                if (element.id == $scope.model1.Member[i].GroupUserCode) return element;
                            });
                            if (!$scope.model1.Member[i].IsPermision && $scope.model1.Member[i].IsMain) {
                                continue;
                            } else {
                                //check exist user
                                var checkExistUser = $scope.model.Detail.ListMember.find(function (element) {
                                    if (element.UserId == $scope.model1.Member[i].UserId) return true;
                                });
                                if (!checkExistUser) {
                                    var obj = {
                                        Id: memberId--,
                                        AssignerGroupUserName: rs.AssignerGroupUserName,
                                        Assigner: rs.UserId,
                                        AssignerName: rs.Name,
                                        UserId: $scope.model1.Member[i].UserId,
                                        Name: $scope.model1.Member[i].Name,
                                        GroupUserName: getGroupName ? getGroupName.title : null,
                                        Role: role.Code,
                                        CreatedTime: new Date(),
                                        IsPermision: false,
                                        Status: false,
                                        IsShowDelete: true,
                                        IsShowComment: true,
                                    }
                                    $scope.model.Detail.ListMember.push(obj);
                                    count++;
                                }
                            }
                        }
                        if (count == 0) {
                            App.toastrError("Người xử lý đã được chọn");
                        } else {
                            if (role.Code == 1) {
                                App.toastrSuccess("Thêm người xử lý chính thành công");
                            } else if (role.Code == 2) {
                                App.toastrSuccess("Thêm người phối hợp thành công");
                            } else {
                                App.toastrSuccess("Thêm người xem để biết thành công");
                            }
                        }
                    });
                }
            }
        }
    }
    $scope.deleteMember = function (index, id) {
        $scope.model.Detail.ListMember.splice(index, 1);
        if (id > 0) {
            $scope.ListDeleteMember.push(id);
        }
        App.toastrSuccess("Xóa người xử lý thành công");
    }




    //file
    $scope.addFile = function () {
        var file = document.getElementById("File").files[0];
        if (file == null || file == undefined) {
            App.toastrError("Vui lòng chọn tệp tin");
        } else {
            if ($scope.model.Header.CreatedUserId == '') {
                App.toastrError("Vui lòng chọn người soạn thảo");
            } else {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var name = file.name.substr(0, idxDot - 1).toLowerCase();
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                var exist = false;
                for (var i = 0; i < $scope.model.Detail.ListFile.length; i++) {
                    if ($scope.model.Detail.ListFile[i].FileName == name) {
                        exist = true;
                    }
                }
                if (exist) {
                    App.toastrError("Tệp tin đã tồn tại");
                } else {
                    var formData = new FormData();
                    formData.append("file", file);
                    var excel = ['xlsm', 'xlsx', 'xlsb', 'xltx', 'xltm', 'xls', 'xlt', 'xls', 'xml', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'csv'];
                    var txt = ['txt'];
                    var word = ['docx', 'doc'];
                    var pdf = ['pdf'];
                    var png = ['png', 'jpg'];
                    var powerPoint = ['pps', 'pptx'];
                    if (excel.indexOf(extFile) !== -1) {
                        extFile = 1;
                    } else if (word.indexOf(extFile) !== -1) {
                        extFile = 2;
                    } else if (txt.indexOf(extFile) !== -1) {
                        extFile = 3;
                    } else if (pdf.indexOf(extFile) !== -1) {
                        extFile = 4;
                    } else if (powerPoint.indexOf(extFile) !== -1) {
                        extFile = 5;
                    } else if (png.indexOf(extFile) !== -1) {
                        extFile = 6;
                    } else {
                        extFile = 0;
                    }
                    if (extFile == 0) {
                        App.toastrError("Định dạng tệp không cho phép");
                    } else {
                        dataservice.uploadFile(formData, function (rs) {
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                //var createdEditor = $filter('filter')($scope.ListUserData, { Id: $scope.model.Header.CreatedUserId }, true)[0];
                                $scope.file = {
                                    Id: fileId--,
                                    FileName: name,
                                    //CreatedEditor: createdEditor != null ? createdEditor.GivenName : null,
                                    User: rs.Object != null ? rs.Object.User : null,
                                    Fomart: extFile,
                                    CreatedTime: new Date(),
                                    IsShowDelete: true,
                                    Source: rs.Object != null ? rs.Object.Source : null
                                }
                                $scope.model.Detail.ListFile.push($scope.file);
                                App.toastrSuccess(rs.Title);
                            }
                        })
                    }
                }
            }
        }
    }
    $scope.deleteFile = function (index, id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn muốn xóa tệp tin hay không ?";
                $scope.ok = function () {
                    $scope.model.Detail.ListFile.splice(index, 1);
                    if (id > 0) {
                        $scope.ListDeleteFile.push(id);
                    }
                    App.toastrSuccess("Xóa tệp tin thành công");
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    }

    //comment
    $scope.addComment = function () {
        if ($scope.model1.Comment == null || $scope.model1.Comment == "") {
            App.toastrError("Bạn chưa nhập ý kiến")
        } else {
            var createdEditor = $filter('filter')($scope.ListUserData, { Id: $scope.model.Header.CreatedUserId }, true)[0];
            dataservice.getUserActive(function (rs) {
                $scope.comment = {
                    Id: commentId--,
                    CreatedEditor: createdEditor != null ? createdEditor.GivenName : null,
                    User: rs.Name,
                    Comment: $scope.model1.Comment,
                    CreatedTime: new Date(),
                    IsShowDelete: true,
                }
                $scope.model.Detail.ListComment.push($scope.comment);
                App.toastrSuccess("Thêm ý kiến thành công");
            });
        }
    }
    $scope.deleteComment = function (index, id) {
        $scope.model.Detail.ListComment.splice(index, 1);
        if (id > 0) {
            $scope.ListDeleteComment.push(id);
        }
        App.toastrSuccess("Xóa ý kiến thành công");
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "DocumentCode" && $scope.model.Header.DocumentCode != "") {
            $scope.errorDocumentCode = false;
        }
        if (SelectType == "CreatedUserId" && $scope.model.Header.CreatedUserId != "") {
            $scope.errorCreatedUserId = false;
        }
        //if (SelectType == "UnitEditor" && $scope.model.Header.UnitEditor != "") {
        //    $scope.errorUnitEditor = false;
        //}
    }
    $scope.submit = function (e) {
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.Detail.ListDeleteFile = $scope.ListDeleteFile;
            $scope.model.Detail.ListDeleteComment = $scope.ListDeleteComment;
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
                windowClass: "message-center",
                resolve: {
                    para: function () {
                        return $scope.model;
                    }
                },
                controller: function ($scope, $uibModalInstance, para) {
                    $scope.message = "Bạn muốn cập nhập văn bản hay không?";
                    $scope.ok = function () {
                        dataservice.updateAsync(para, function (rs) {
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
                $location.path('/');
            }, function () {
            });
        }
    }
    $scope.recover = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return $scope.model.Header.Id;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = "Bạn muốn thu hồi văn bản hay không?";
                $scope.ok = function () {
                    dataservice.recover(para, function (rs) {
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
            $location.path('/');
        }, function () {
        });
    }

    //view online
    $scope.view = function (source) {
        var url = ctxfolder.replace("views/", "");
        window.open(url + '#/pdfViewer?source=' + source, '_blank');
        window.focus();
    }

    //validate UiSelect
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Header.DocumentCode == "") {
            $scope.errorDocumentCode = true;
            mess.Status = true;
        } else {
            $scope.errorDocumentCode = false;
        }
        if (data.Header.CreatedUserId == "") {
            $scope.errorCreatedUserId = true;
            mess.Status = true;
        } else {
            $scope.errorCreatedUserId = false;
        }
        //if (data.Header.UnitEditor == "") {
        //    $scope.errorUnitEditor = true;
        //    mess.Status = true;
        //} else {
        //    $scope.errorUnitEditor = false;
        //}
        return mess;
    };

    function validationDefaultDateTime() {
        $.fn.datepicker.defaults.language = 'vi';
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });


        $("#PromulgateDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        $("#DeadLine").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
        var minDate = new Date();
        $('#FromDate').datepicker('setEndDate', minDate);
        $('#PromulgateDate').datepicker('setEndDate', minDate);
        $('#DeadLine').datepicker('setStartDate', minDate);
    }

    function caculatorDeadLine(date) {
        var numberDate = null;
        if (date != '' && date != null) {
            var from = date.split("/");
            var f = new Date(from[2], from[1] - 1, from[0]);
            var date = new Date();
            numberDate = Math.round((f - date) / (1000 * 60 * 60 * 24));
        }
        return numberDate;
    }

    function validateNumber() {
        var number = document.getElementById('DocumentNumber');
        number.onkeydown = function (e) {
            if (!((e.keyCode > 95 && e.keyCode < 106)
                || (e.keyCode > 47 && e.keyCode < 58)
                || e.keyCode == 8)) {
                return false;
            }
        }
    }

    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }

    setTimeout(function () {
        validateNumber();
        loadPoper();
    }, 10);
});

app.controller('pdfViewer', function ($scope, $rootScope, $compile, $uibModal, dataservice, $filter) {

    // PDFObject.embed(para, "#example1");
    var url_string = window.location.href;
    //console.log('url: ' + url_string);
    //var url = new URL(url_string);
    //console.log(url.toString());
    //var c = url.searchParams.get("source");
    //console.log('source: '+c);
    var index = url_string.indexOf("source=");
    var length = url_string.length;
    var res = url_string.substring(index + 7);
    var source = res.replace("%2F", "/");
    source = source.replace("%3D", "=");
    PDFObject.embed(source, "#example1");
});
