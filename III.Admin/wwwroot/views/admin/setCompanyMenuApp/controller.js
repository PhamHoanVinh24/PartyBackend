var ctxfolder = "/views/admin/setCompanyMenuApp";
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

        $http(req).success(callback);
    };
    return {
        insert: function (data, callback) {
            $http.post('/Admin/SetCompanyMenuApp/Insert', data, callback).success(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/SetCompanyMenuApp/Update', data).success(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/SetCompanyMenuApp/Delete/' + data).success(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/SetCompanyMenuApp/GetItem/' + data).success(callback);
        },
        getListPin: function (callback) {
            $http.post('/Admin/SetCompanyMenuApp/GetListPin/').success(callback);
        },
        getListMenuParent: function (data, callback) {
            $http.post('/Admin/SetCompanyMenuApp/GetListMenuParent?menuCaption=' + data).success(callback);
        },
        gettreedata: function (data, callback) {
            $http.post('/Admin/SetCompanyMenuApp/Gettreedata', data).success(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
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
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/g;
            // var partternCode = new RegExp("^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$");
            //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.MenuCaption)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Caption danh mục không chứa ký tự đặc biệt hoặc khoảng trắng", "<br/>");
            }
            return mess;
        }

        $rootScope.validationOptions = {
            rules: {
                MenuCaption: {
                    required: true,
                    maxlength: 255
                },
                Title: {
                    required: true,
                    maxlength: 255
                },
                Action: {
                    required: true,
                    maxlength: 255
                },
                Priority: {
                    required: true
                },


            },
            messages: {
                MenuCaption: {
                    required: "Nhập caption danh mục!",
                    maxlength: "Caption danh mục không vượt quá 255 kí tự!"
                },
                Title: {
                    required: "Nhập tiêu đề!",
                    maxlength: "Tiêu đề không vượt quá 255 kí tự!"
                },
                Action: {
                    required: "Nhập hành động!",
                    maxlength: "Hành động không vượt quá 255 kí tự!"
                },
                Priority: {
                    required: "Nhập thứ tự ưu tiên!",
                },
            }
        }
        $rootScope.IsTranslate = true;
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
        .when('/add', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        })
        .when('/edit', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/detail', {
            templateUrl: ctxfolder + '/detail.html',
            controller: 'detail'
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    $scope.model = {
        MenuCaption: '',
        Title: '',
        Action: '',
        Pin: '',
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/SetCompanyMenuApp/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.MenuCaption = $scope.model.MenuCaption;
                d.Title = $scope.model.Title;
                d.Action = $scope.model.Action;
                d.Pin = $scope.model.Pin;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'asc'])
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
        });

    vm.dtColumns = [];
    var ad = 0;
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('Id').notSortable().withOption('sClass', 'hidden').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MenuCaption').withTitle('{{"Caption danh mục" | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"Tiêu đề danh mục   " | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
        //return data.replace(/. . . /g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MenuParent').withTitle('{{"Danh mục cha" | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Action').withTitle('{{"Hành động" | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Pin').withTitle('{{"Pin" | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Priority').withTitle('{{"Thứ tự ưu tiên" | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"Ghi chú" | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('').withOption('sClass', 'nowrap').withTitle('{{"Thao tác" | translate}}').notSortable().withOption('sClass', 'tcenter').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.getListPin(function (result) {
            $scope.listPin = result.Object;
        });
    }
    $scope.initData();

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: true,
            size: '50',

        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: true,
            size: '50',
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
    }

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
            $scope.reloadNoResetPage();
        }, function () {
        });
    }

    function showHideSearch() {
        $(".btnSearch").click(function () {
            $(".input-search").removeClass('hidden');
            $(".btnSearch").hide();
        });
        $(".close-input-search").click(function () {
            $(".input-search").addClass('hidden');
            $(".btnSearch").show();
        });
    }

    setTimeout(function () {
        showHideSearch();
    }, 50);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.model = {};


    $scope.initData = function () {
        dataservice.getListPin(function (result) {
            $scope.listPin = result.Object;
        });
        //dataservice.getListMenuParent('', function (result) {
        //    $scope.listMenuParent = result.Object;
        //});
        dataservice.gettreedata({ IdI: null }, function (result) {
            $scope.treeData = result;
        });
    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Pin == "" || data.Pin == null || data.Pin == undefined) {
            $scope.errorPin = true;
            mess.Status = true;
        } else {
            $scope.errorPin = false;

        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Pin" && $scope.model.Pin != "") {
            $scope.errorPin = false;
        }
    }


    $scope.submit = function () {
        validationSelect($scope.model);

        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            dataservice.insert($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model = {};
    $scope.initData = function () {
        dataservice.getListPin(function (result) {
            $scope.listPin = result.Object;
        });
        dataservice.getItem(para, function (rs) {
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object;

                //dataservice.getListMenuParent($scope.model.MenuCaption, function (result) {
                //    $scope.listMenuParent = result.Object;
                //});
                dataservice.gettreedata({ IdI: [para] }, function (result) {
                    $scope.treeData = result;
                });
            }
        });

    }
    $scope.initData();
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };

        if (data.Pin == "" || data.Pin == null || data.Pin == undefined) {
            $scope.errorPin = true;
            mess.Status = true;
        } else {
            $scope.errorPin = false;

        }
        return mess;
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Pin" && $scope.model.Pin != "") {
            $scope.errorPin = false;
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);

        if ($scope.addform.validate() && validationSelect($scope.model).Status == false) {
            var msg = $rootScope.checkData($scope.model);
            if (msg.Status) {
                App.toastrError(msg.Title);
                return;
            }
            dataservice.update($scope.model, function (rs) {
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});



