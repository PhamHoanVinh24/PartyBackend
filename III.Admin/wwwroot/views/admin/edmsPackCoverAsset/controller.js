var ctxfolder = "/views/admin/edmsPackCover";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
    .directive('customOnChange', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.on('change', onChangeHandler);
                element.on('$destroy', function () {
                    element.off();
                });

            }
        };
    })
    .directive('fileDropzone', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.on('change', onChangeHandler);
                element.on('$destroy', function () {
                    element.off();
                });

            }
        };
    });
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        var formData = new FormData();
        formData.append("FileUpload", data.FileUpload);
        formData.append("FileCode", data.FileCode);
        formData.append("FileName", data.FileName);
        formData.append("FileType", data.FileType);
        formData.append("CateRepoSettingId", data.CateRepoSettingId);
        formData.append("Tags", data.Tags);
        formData.append("Desc", data.Desc);
        formData.append("IsScan", data.IsScan);
        formData.append("ObjPackCode", data.ObjPackCode);
        formData.append("RackCode", data.RackCode);
        formData.append("RackPosition", data.RackPosition);
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: formData
        }
        $http(req).then(callback);
    };
    var submitFormUploadNew = function (url, data, callback) {
        var formData = new FormData();
        formData.append("CateRepoSettingId", data.CateRepoSettingId);
        formData.append("FileUpload", data.FileUpload);
        formData.append("FileName", data.FileName);
        formData.append("Desc", data.Desc);
        formData.append("Tags", data.Tags);
        formData.append("NumberDocument", data.NumberDocument);
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            beforeSend: function () {
                App.blockUI({
                    target: "#modal-body",
                    boxed: true,
                    message: 'loading...'
                });
            },
            complete: function () {
                App.unblockUI("#modal-body");
            },
            data: formData
        }
        $http(req).then(callback);
    };
    return {
        //OrderDocument & Pack
        getListRack: function (callback) {
            $http.post('/Admin/EDMSRepository/GetListRack').then(callback);
        },
        getListPack: function (callback) {
            $http.post('/Admin/EDMSPackCoverAsset/GetListPack').then(callback);
        },
        insertPack: function (data, callback) {
            $http.post('/Admin/EDMSPackCoverAsset/InsertPack', data).then(callback);
        },
        getItemPack: function (data, callback) {
            $http.post('/Admin/EDMSPackCoverAsset/GetItemPack?id=' + data).then(callback);
        },
        updatePack: function (data, callback) {
            $http.post('/Admin/EDMSPackCoverAsset/UpdatePack', data).then(callback);
        },
        deletePack: function (data, callback) {
            $http.post('/Admin/EDMSPackCoverAsset/DeletePack?id=' + data).then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.IsTranslate = true;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            //var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            //var partternNumber = /^\d+$/;
            //var partternPremiumTerm = /^\d+(\+)?/
            //var partternFloat = /^-?\d*(\.\d+)?$/;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ReposCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.EDMSR_VALIDATE_REPOS_CODE, "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Name: {
                    required: true,
                }
            },
            messages: {
                Name: {
                    required: caption.EDMS_VALIDATE_PACK_NAME,
                }
            }
        }
    });
    $scope.FileType = [{
        Code: 1,
        Name: 'Ảnh',
    }, {
        Code: 2,
        Name: 'Word'
    }, {
        Code: 3,
        Name: 'Excel'
    }, {
        Code: 4,
        Name: 'Powerpoint'
    }, {
        Code: 5,
        Name: 'Pdf'
    }, {
        Code: 6,
        Name: 'Tệp tin'
    }];

    $rootScope.listUnit = [{
        Code: '1',
        Name: 'Tập'
    }, {
        Code: '2',
        Name: 'Cuốn'
    }, {
        Code: '3',
        Name: 'Thùng'
    }];
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/EDMSPackCoverAsset/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $timeout) {
    var vm = $scope;

    $scope.model = {
        Name: '',
        FromDate: '',
        ToDate: ''
    };

    $scope.isEdit = false;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    vm.dtOptionsPackCover = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EDMSPackCoverAsset/JtablePack",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Name = $scope.model.Name;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(30)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
        //.withOption('scrollY', "200px")
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
                $timeout(function () {
                    $scope.$apply();
                });
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {

                }
            });
        });

    vm.dtColumnsPackCover = [];
    vm.dtColumnsPackCover.push(DTColumnBuilder.newColumn("Id").withTitle('').notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumnsPackCover.push(DTColumnBuilder.newColumn('Name').withOption('sClass', '').withTitle($translate('EDMS_LIST_COL_PACK_NAME')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsPackCover.push(DTColumnBuilder.newColumn('SpecSize').withTitle($translate('EDMS_LIST_COL_PACK_SIZE')).withOption('sClass', 'nowrap dataTable-100').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsPackCover.push(DTColumnBuilder.newColumn('Weight').withTitle($translate('EDMS_LIST_COL_PACK_WEIGHT')).withOption('sClass', 'nowrap dataTable-100').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsPackCover.push(DTColumnBuilder.newColumn('Unit').withTitle($translate('EDMS_LIST_COL_PACK_UNIT')).withOption('sClass', 'nowrap dataTable-100').renderWith(function (data, type, full) {
        switch (data) {
            case '1':
                data = $rootScope.listUnit[0].Name;
                break;
            case '2':
                data = $rootScope.listUnit[1].Name;
                break;
            case '3':
                data = $rootScope.listUnit[2].Name;
                break;
        }
        return data;
    }));
    vm.dtColumnsPackCover.push(DTColumnBuilder.newColumn('CreatedBy').withTitle($translate('EDMS_LIST_COL_PACK_CREATE_USER')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsPackCover.push(DTColumnBuilder.newColumn('CreatedTime').withTitle($translate('EDMS_LIST_COL_PACK_CREATE_TIME')).withOption('sClass', 'nowrap').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumnsPackCover.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80 text-center').withTitle($translate('EDMS_LIST_COL_PACK_NAME')).renderWith(function (data, type, full) {
        return '<a ng-click="edit(' + full.Id + ')" target="_blank" style="width: 25px; height: 25px; padding: 0px" title="{{&quot; EDMS_TITLE_UPDATE &quot; | translate}} - ' + full.FileName + '" class="btn btn-icon-only btn-circle btn-outline blue "><i class="fa fa-edit pt5"></i></a>' +
            '<button title="{{&quot; EDMS_TITLE_DEL &quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstancePackCover = {};
    function reloadData(resetPaging) {
        vm.dtInstancePackCover.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(selectAll, selectedItems) {

    }
    function toggleOne(selectedItems, evt) {
        $(evt.target).closest('tr').toggleClass('selected');
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
    };

    $rootScope.reload = function () {
        reloadData(true);
    };

    $scope.search = function () {
        reloadData(true);
    };

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '40',
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
            },
        });
        modalInstance.result.then(function (d) {
        }, function () {
        });
    };

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return id;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.EDMSR_MSG_DELETE_CATEGORIES;
                $scope.ok = function () {
                    dataservice.deletePack(para, function (rs) {
                        rs = rs.data;

                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $rootScope.reload();
                            $uibModalInstance.dismiss('cancel');
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

        }, function () {
            $scope.reload();
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

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
    function loadDate() {
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
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window) {
    $scope.model = {
        ObjPackCode: generateUUID(),
        Name: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.init = function () {
        dataservice.getListRack(function (rs) {
            rs = rs.data;
            $scope.listRackSearch = rs;
        });
    };

    $scope.init();

    $scope.submit = function () {
        if ($scope.addform.validate()) {
            dataservice.insertPack($scope.model, function (rs) {
                rs = rs.data;

                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reload();
                    $uibModalInstance.dismiss('cancel');
                }
            });
        }
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window, para) {
    $scope.model = {
        Id: '',
        Name: '',
        ObjPackCode: '',
        SpecSize: '',
        Weight: '',
        Unit: '',
        Located: ''
    };

    $scope.init = function () {
        dataservice.getItemPack(para, function (rs) {
            rs = rs.data;
            $scope.isEdit = true;

            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model.Id = para;
                $scope.model.ObjPackCode = rs.Object.ObjPackCode;
                $scope.model.Name = rs.Object.Name;
                $scope.model.SpecSize = rs.Object.SpecSize;
                $scope.model.Weight = rs.Object.Weight;
                $scope.model.Unit = rs.Object.Unit;
                $scope.model.Located = rs.Object.Located;
            }
        });
        dataservice.getListRack(function (rs) {
            rs = rs.data;
            $scope.listRackSearch = rs;
        });
    };

    $scope.init();

    $scope.submit = function () {
        if ($scope.editform.validate()) {
            dataservice.updatePack($scope.model, function (rs) {
                rs = rs.data;

                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reload();
                    $uibModalInstance.dismiss('cancel');
                }
            });
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

