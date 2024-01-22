var ctxfolder = "/views/admin/dispatchesOutDispatchesPending";
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
        send: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/Send', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).success(callback);
        },

        getItem: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/GetItem/', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).success(callback);
        },
        getYear: function (callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/GetYear').success(callback);
        },
        watched: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/Watched/', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).success(callback);
        },
        checkExistUser: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/CheckExist', data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).success(callback);
        },


        getListUser: function (callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/GetListUser').success(callback);
        },
        getListUserInGroup: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/GetListUserInGroup?listGroup=' + data).success(callback);
        },
        getAuthoringDeparment: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/GetAuthoringDeparment?listGroup=' + data).success(callback);
        },


        getAllGroupUser: function (callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/GetAllGroupUser').success(callback);
        },
        getUserActive: function (callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/GetUserActive').success(callback);
        },
        getActivity: function (data, callback) {
            $http.post('/Admin/DispatchesOutDispatchesPending/GetActivity?id=' + data).success(callback);
        },
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/DispatchesOutDispatchesPending/UploadFile/', data, callback);
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
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
    });
    $rootScope.validationOptions = {
        rules: {
            DocumentSymbol: {
                required: true
            },
            DocumentNumber: {
                required: true,
            }
        },
        messages: {
            DocumentSymbol: {
                required: caption.DODP_VALIDATE_NUMBER_SYMBOL
            },
            DocumentNumber: {
                required: caption.DODP_VALIDATE_NUMBER
            }
        }
    }

    $scope.StatusData = [
        { Code: 'REVIEW', Name: caption.COM_MSG_REVIEW },
        { Code: 'NOREVIEW', Name: caption.COM_MSG_NOREVIEW }
    ];
    $rootScope.Modelsearch = {
        Number: '',
        DocumentSymbol: '',
        DocumentSymbols: '',
        SignUser: '',
        FromDate: '',
        ToDate: '',
        CreatedUser: '',
        Year: ''
    };
    $rootScope.Modelsearch.Year = getYearDefault();
    dataservice.getYear(function (rs) {
        $rootScope.ListYearData = rs;
    })
    dataservice.getListUser(function (rs) {
        $rootScope.ListUserData = rs;
    });
    dataservice.getAllGroupUser(function (rs) {
        $rootScope.UnitEditorDataOrder = rs;
        $rootScope.UnitEditorData = [];
        var getManager = rs.find(function (element) {
            if (element.Code == "LANHDAO") return true;
        });
        for (var i = rs.length - 1; i >= 0; i--) {
            if (rs[i].Code != "LANHDAO") {
                var obj = {
                    Id: rs[i].Id,
                    Code: rs[i].Code,
                    Title: rs[i].Title,
                }
                $rootScope.UnitEditorData.push(obj);
            }
        }
        if (getManager) {
            var obj = {
                Id: getManager.Id,
                Code: getManager.Code,
                Title: getManager.Title,
            }
            $rootScope.UnitEditorData.push(obj);
        }
    });
    function getYearDefault() {
        var currentdate = new Date();
        var year = currentdate.getFullYear();
        return year;
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
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/document/', {
            templateUrl: ctxfolder + '/document.html',
            controller: 'document'
        }).when('/pdfViewer', {
            templateUrl: ctxfolder + '/pdfViewer.html',
            controller: 'pdfViewer'
        });

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
    $httpProvider.interceptors.push('interceptors');
    $httpProvider.interceptors.push('httpResponseInterceptor');

});
app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter, myService) {
    var vm = $scope;
  

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/DispatchesOutDispatchesPending/JTable",
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
                d.Number = $rootScope.Modelsearch.Number;
                //d.DocumentSymbol = $scope.model.DocumentSymbol;
                d.DocumentSymbols = $rootScope.Modelsearch.DocumentSymbols;
                d.SignUser = $rootScope.Modelsearch.SignUser;
                d.Note = $rootScope.Modelsearch.Note;
                d.UnitEditor = $rootScope.Modelsearch.UnitEditor;
                d.Status = $rootScope.Modelsearch.Status;
                d.Year = $rootScope.Modelsearch.Year;
                //d.FromDate = $scope.model.FromDate;
                //d.ToDate = $scope.model.ToDate;
                // d.CreatedUser = $scope.model.CreatedUser;
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var row = $(evt.target).closest('tr');
                    // data key value
                    var key = row.attr("data-id");
                    // cell values
                    var Id = row.find('td:eq(1)').text();
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                        $scope.selected[data.Id] = !$scope.selected[data.Id];
                    } else {
                        var self = $(this).parent();
                        $scope.selected[data.Id] = true;
                        dataservice.watched(data.Id, function (rs) {
                            dataservice.getItem(data.Id, function (rs) {
                                if (rs.Error) {
                                    App.toastrError(rs.Title);
                                } else {
                                    myService.setData(rs.Object);
                                    //$scope.model = rs.Object;
                                    $location.path('/document/');
                                }
                            });
                        });
                    }
                    $scope.$apply();
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentNumber').withTitle('{{"DODP_LIST_COL_DOCUMENT_NUMBER" | translate}}').notSortable().withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DocumentSymbols').withTitle('{{"DODP_LIST_COL_DOCUMENT_SYMBOL" | translate}}').notSortable().withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SignUser').withTitle('{{"DODP_LIST_COL_SIGNUSER" | translate}}').notSortable().withOption('sClass', 'tcenter nowrap dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"DODP_LIST_COL_NOTE" | translate}}').notSortable().renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('UnitEditor').withTitle('{{"DODP_LIST_COL_UNIT_EDITOR" | translate}}').notSortable().withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type, full, meta) {
        return data;
    }));


    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"DODP_LIST_COL_STATUS" | translate}}').notSortable().withOption('sClass', 'tcenter dataTable-pr20').renderWith(function (data, type) {
        if (data == 'REVIEW') {
            return '<span class="text-success">{{"COM_MSG_REVIEW" | translate}}</span>';
        } else {
            return '<span class="text-danger">{{"COM_MSG_NOREVIEW | translate}}</span>';
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
        reloadData(true);
    } 
});
app.controller('document', function ($scope, $rootScope, $compile, $uibModal, $confirm, $location, $filter, dataservice, myService) {
    var memberId = -1;
    $scope.model = {};
    $scope.model1 = {
        Memmber: ''
    }

    $scope.ListSearchMember = [];
    $scope.treeData = [];
    $scope.lengthMember = 0;
    $scope.lengthMemberSelect = 0;
    $scope.ListMember = [];
    $scope.ListGroup = [];

    $scope.initLoad = function () {
        $scope.model = myService.getData();
        if ($scope.model != undefined) {
            $scope.ListGroup = $scope.model.Detail.ListGroup;
            $scope.ListMember = $scope.model.Detail.ListMember;
            dataservice.getActivity($scope.model.Header.Id, function (rs) {
                $scope.ActivityData = rs;
            })

            var unit = $rootScope.UnitEditorData.find(function (element) {
                if (element.Code == $scope.model.Header.UnitEditor) return element;
            });
            if (unit) {
                $scope.model.Header.UnitEditor = unit.Title;
            }
            if ($scope.model.Header.SignUser != null) {
                var getItem = $rootScope.ListUserData.find(function (element) {
                    if (element.Id == $scope.model.Header.SignUser) return element.GivenName;
                });
                if (getItem) {
                    $scope.model.Header.SignUser = getItem != undefined && getItem != null ? getItem.GivenName : null;
                }

                var getUserCreated = $rootScope.ListUserData.find(function (element) {
                    if (element.Id == $scope.model.Header.CreatedEditor) return element.GivenName;
                });
                if (getItem) {
                    $scope.model.Header.CreatedEditor = getUserCreated != undefined && getUserCreated != null ? getUserCreated.GivenName : null;
                }
            }
        } else {
            $location.path('/');
        }
    }
    $scope.initLoad();
    $scope.changeSelect = function (selectType) {
        if (selectType == "DocumentCode" && $scope.model.DocumentCode != "") {
            $scope.errorDocumentCode = false;
        }
    }

    //group user
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainTree",
            boxed: true,
            message: 'loading...'
        });
        var root = {
            id: 'root',
            parent: "#",
            text: caption.DODP_TITLE_FILE_DEPARTMENT,
            state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
        }
        $scope.treeData.push(root);
        var index = 0;
        $scope.ListParent = $rootScope.UnitEditorDataOrder.filter(function (item) {
            return (item.ParentCode == null);
        });
        for (var i = 0; i < $rootScope.UnitEditorDataOrder.length; i++) {
            if ($rootScope.UnitEditorDataOrder[i].ParentCode == null) {
                var stt = $scope.ListParent.length - index;
                if (stt.toString().length == 1) {
                    stt = "0" + stt;
                }
                index = index + 1;
                var data = {
                    id: $rootScope.UnitEditorDataOrder[i].Code,
                    parent: "root",
                    text: stt + ' - ' + $rootScope.UnitEditorDataOrder[i].Title,
                    title: $rootScope.UnitEditorDataOrder[i].Title,
                    state: { selected: false, opened: true }
                }
                $scope.treeData.push(data);
            } else {
                var data = {
                    id: $rootScope.UnitEditorDataOrder[i].Code,
                    parent: $rootScope.UnitEditorDataOrder[i].ParentCode,
                    text: $rootScope.UnitEditorDataOrder[i].Title,
                    title: $rootScope.UnitEditorDataOrder[i].Title,
                    state: { selected: false, opened: false }
                }
                $scope.treeData.push(data);
            }
        }
        App.unblockUI("#contentMainTree");
    }
    $scope.selectGroupUser = function () {
        var listSelect = $("#treeDiv").jstree("get_selected", true);
        var listGroup = [];
        for (var i = 0; i < listSelect.length; i++) {
            listGroup.push(listSelect[i].id);
        }
        dataservice.getListUserInGroup(listGroup, function (result) {
            $scope.ListSearchMember = result;
            $scope.lengthMember = result.length;
            $scope.selectAll = false;
        });
    }
    $scope.deselectGroupUser = function () {
        $scope.ListSearchMember = [];
        $scope.lengthMember = 0;
        $scope.selectAll = false;
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


    //member
    $scope.saveUser = function (selectAll) {
        if ($scope.ListSearchMember.length == 0) {
            App.toastrError(caption.DODP_ERR_RECEIVER);
        } else {
            var listCheck = $scope.ListSearchMember.filter(function (obj, index) { return obj.IsChecked; });
            if (listCheck.length == 0) {
                App.toastrError(caption.DODP_ERR_CHOOSE_RECEIVER);
            } else {
                var listUserId = [];
                for (var i = 0; i < listCheck.length; i++) {
                    listUserId.push(listCheck[i].UserId);
                }

                var obj = {
                    Id: $scope.model.Header.Id,
                    UserId: listUserId,
                }
                dataservice.checkExistUser(obj, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        var count = 0;
                        for (var i = 0; i < listCheck.length; i++) {
                            //check exist user main in group
                            if (listCheck[i].IsPermision && listCheck[i].GroupUserCode != 'LANHDAO') {
                                var checkExistUserMainInGroup = $scope.ListGroup.find(function (element) {
                                    if (element.GroupUserCode == listCheck[i].GroupUserCode) return true;
                                });
                                if (checkExistUserMainInGroup) {
                                    App.toastrError(caption.DODP_MSG_RECEIVER_SEND);
                                    return;
                                }
                            }
                            //check exist user in group(LANHDAO)
                            var checkExistUserMainInGroup = $scope.ListGroup.find(function (element) {
                                if (element.GroupUserCode == listCheck[i].GroupUserCode && listCheck[i].GroupUserCode == "LANHDAO") return true;
                            });
                            if (checkExistUserMainInGroup) {
                                App.toastrError(checkExistUserMainInGroup.Name + caption.DODP_MSG_SEND);
                                return;
                            }

                            //check exist user select
                            var checkExistUser = $scope.ListMember.find(function (element) {
                                if (element.UserId == listCheck[i].UserId) return true;
                            });

                            //check exist user select group other
                            var checkExistOther = rs.find(function (element) {
                                if (element.UserId == listCheck[i].UserId) return true;
                            });


                            if (!checkExistUser && !checkExistOther) {
                                var obj = {
                                    UserId: listCheck[i].UserId,
                                    Name: listCheck[i].Name,
                                    GroupUserCode: listCheck[i].GroupUserCode,
                                    IsPermision: listCheck[i].IsPermision,
                                    IsShowDelete: true,
                                    IsShowSend: true
                                }
                                $scope.ListMember.push(obj);
                                count++;
                            }
                        }
                        if (count == 0) {
                            App.toastrError(caption.DODP_MSG_RECEVIER);
                        } else {
                            App.toastrSuccess(caption.DODP_ADD_RECEVIER);
                        }
                    }
                });

            }
        }
    }
    $scope.removeUser = function (userId) {
        for (var i = 0; i < $scope.ListMember.length; i++) {
            if ($scope.ListMember[i].UserId == userId) {
                $scope.ListMember.splice(i, 1);
                break;
            }
        }
    }
    $scope.selectAllUser = function (selectAll) {
        $scope.ListSearchMember.forEach(function (obj, index) {
            obj.IsChecked = selectAll;
        });
        if (selectAll) {
            $scope.lengthMemberSelect = $scope.ListSearchMember.length;
        } else {
            $scope.lengthMemberSelect = 0;
        }
    }
    $scope.clickSelectOneUser = function (item, type) {
        if (type == 1) {
            item.IsChecked = !item.IsChecked;
        }
        var lengthChecked = $scope.ListSearchMember.filter(function (obj, index) { return obj.IsChecked; }).length;
        if ($scope.ListSearchMember.length == lengthChecked) {
            $scope.selectAll = true;
        } else {
            $scope.selectAll = false;
        }
        $scope.lengthMemberSelect = lengthChecked;
    }

    //submit
    $scope.cancel = function () {
        $location.path('/');
    }
    $scope.submit = function () {
        //var checkSelectGroup = $scope.ListGroup.find(function (element) {
        //    if (element.IsShow == true) return true;
        //});
        var checkSelectUser = $scope.ListMember.find(function (element) {
            if (element.IsShowDelete == true) return true;
        });
        if (!checkSelectUser) {
            App.toastrError(caption.DODP_MSG_CHOOSE_RECEIVER);
        } else {
            $confirm({ text: caption.DODP_MSG_NEXT, title: caption.COM_CONFIRM, ok: caption.COM_CONFIRM_CANCEL, cancel: caption.COM_CONFIRM_CANCEL })
                .then(function () {
                    dataservice.send($scope.model, function (rs) {
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $rootScope.savePageState = false;
                            $location.path('/');
                        }
                    });
                });
        }
    }

    //view file online
    $scope.view = function (source) {
        var url = ctxfolder.replace("views/", "");
        window.open(url + '#/pdfViewer?source=' + source, '_blank');
        window.focus();
    }

    function loadPoper() {
        $('[data-toggle="popover"]').popover()
    }
    setTimeout(function () {
        loadPoper();
    }, 200);
});
app.controller('pdfViewer', function ($scope, $rootScope, $compile, $uibModal, $confirm, dataservice, $filter) {

    var url_string = window.location.href;
    var index = url_string.indexOf("source=");
    var length = url_string.length;
    var res = url_string.substring(index + 7);
    var source = res.replace("%2F", "/");
    source = source.replace("%3D", "=");
    PDFObject.embed(source, "#example1");
});
