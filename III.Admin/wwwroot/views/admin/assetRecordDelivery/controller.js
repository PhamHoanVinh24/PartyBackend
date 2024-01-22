var ctxfolder = "/views/admin/assetRecordDelivery";

var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber', 'ngTagsInput']).

    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
    });

app.directive('customOnChangeCustomer', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCustomer);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
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
            data: data
        }

        $http(req).then(callback);
    };
    return {
        insertRecordDeliveryDetail: function (data, callback) {
            $http.post("/Admin/AssetRecordDelivery/InsertRecordDeliveryDetail", data).then(callback);
        },
        getTreeRecordsPack: function (callback) {
            $http.post("/Admin/AssetPackManager/GetTreeRecordsPack").then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post("/Admin/AssetRecordDelivery/DeleteDetail?id=" + data).then(callback);
        },

        getPackGroup: function (callback) {
            $http.post('/Admin/AssetPackManager/GetPackGroup').then(callback);
        },
        getPackType: function (callback) {
            $http.post('/Admin/AssetPackManager/GetPackType').then(callback);
        },
        getUnitPack: function (callback) {
            $http.post('/Admin/AssetPackManager/GetUnitPack').then(callback);
        },
        getAttrDataType: function (callback) {
            $http.post('/Admin/AssetPackManager/GetAttrDataType').then(callback);
        },
        getTreeRecordsPack: function (callback) {
            $http.post('/Admin/AssetPackManager/GetTreeRecordsPack').then(callback);
        },
        getTreeZone: function (callback) {
            $http.post('/Admin/AssetZoneManager/GetTreeZone').then(callback);
        },
        getInfoZone: function (data, callback) {
            $http.post('/Admin/AssetZoneManager/GetInfoZone?zoneCode=' + data).then(callback);
        },
        getTreePack: function (data, data1, callback) {
            $http.post('/Admin/AssetPackManager/GetTreeRecordsPack').then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Title: {
                    required: true
                },
                Quantity: {
                    required: true
                },
                Adress: {
                    required: true
                },
                CancelTime: {
                    required: true
                }
            },
            messages: {
                Title: {
                    required: caption.ASSET_CANCEL_VALIDATE.replace("{0}", caption.ASSET_CANCEL_TICKET_NAME), //tên phiếu yêu cầu bắt buộc
                },
                Quantity: {
                    required: caption.ASSET_CANCEL_EMPTY,
                },
                Adress: {
                    required: caption.ASSET_CANCEL_VALIDATE.replace("{0}", caption.ASSET_CANCEL_TICKET_ADRESS), // địa điểm yêu cầu bắt buộc
                },
                CancelTime: {
                    required: caption.ASSET_CANCEL_VALIDATE_DATE_NOT_NULL
                }
            },


        }

        $rootScope.validationOptionAssets = {
            rules: {
                AssetName: {
                    required: true
                },
                QuantityAsset: {
                    required: true,
                    regx: /^([0-9])+\b$/
                },

            },
            messages: {

                AssetName: {
                    required: caption.ASSET_CANCEL_VALIDATE.replace("{0}", caption.ASSET_CANCEL_ASSET_NAME), // tên tài sản
                },
                QuantityAsset: {
                    required: caption.ASSET_CANCEL_VALIDATE.replace("{0}", caption.ASSET_CANCEL_ASSET_QUANTITY),  // số lượng
                    regx: caption.ASSET_CANCEL_VALIDATE_NO_ZERO.replace("{0}", caption.ASSET_CANCEL_ASSET_QUANTITY),
                },

            },


        }

        $rootScope.validationOptionAct = {
            rules: {
                //Value: {
                //    required: true
                //},
            },
            messages: {
                //Value: {
                //    required: caption.ASSET_CANCEL_VALIDATE.replace("{0}", caption.ASSET_CANCEL_VALUE), //giá tri
                //},

            },

        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/assetCancel/translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
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

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        Code: '',
        Name: '',
    };

    $scope.selected = [];

    $scope.selectAll = false;

    $scope.toggleAll = toggleAll;

    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetRecordDelivery/JTableDetail",
            beforeSend: function (jqXHR, settings) {
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
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'asc'])
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
                    $scope.selected[data.ID] = !$scope.selected[data.ID];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.ID] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.ID] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName === 'input' && evt.target.type === 'checkbox') {

                } else {
                    var Id = data.ID;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).renderWith(function (data, type, full, meta) {
        $scope.selected[full.ID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeliveryCode').withTitle('{{"Mã phiếu" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"Tiêu đề phiếu" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('RecordName').withTitle('{{"Tài sản" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeliveryType').withTitle('{{"Kiểu xuất" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('DeliverCode').withTitle('{{"Người xuất" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ReceiverName').withTitle('{{"Người nhận" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Status').withTitle('{{"Trạng thái" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"Mô tả" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="delete(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    }

    $scope.delete = function (id) {
        dataservice.deleteDetail(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        })
    }
});

app.controller('add', function ($scope, $rootScope, $confirm, DTOptionsBuilder, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }

    $scope.model = {
        PackLevel: "",
        PackType: "",
        PackParent: "",
        PackCode: "",
        PackName: "",
        PackQuantity: 0,
        PackLabel: "",
        PackZoneLocation: "",
        PackHierarchyPath: "",
        ZoneCode: ""
    }

    $scope.lstRecordPackAdded = [];

    $scope.lstRecordPackAddedRight = [];

    $scope.lstRecordsPackAll = [];

    $scope.initData = function () {
        dataservice.getPackType(function (rs) {
            rs = rs.data;
            $scope.lstPackType = rs;
        });

        //dataservice.getRecordsPack("", "", function (rs) {
        //    rs = rs.data;
        //    $scope.recordsPacks = rs;
        //    $scope.lstRecordsPackAll = angular.copy($scope.recordsPacks);
        //});

        dataservice.getTreeZone(function (rs) {
            rs = rs.data;
            $scope.treeZone = rs;
        })

        dataservice.getTreePack("", "", function (rs) {
            rs = rs.data;
            $scope.lstRecordPack = rs;
            $scope.lstRecordsPackAll = angular.copy($scope.lstRecordPack);
        })

        for (var i = 0; i < 8; i++) {
            var obj = {
                PackName: "",
                PackCode: "",
                PackParent: "",
                PackParentName: ""
            };

            $scope.lstRecordPackAdded.push(obj);
        }
        $scope.lstRecordPackAddedRight = angular.copy($scope.lstRecordPackAdded);
    }

    $scope.initData();

    $scope.addBellow = function () {
        var check = false;
        if ($scope.model.PackCode == "" || $scope.model.PackCode == null || $scope.model.PackCode == undefined) {
            return App.toastrError("Vui lòng chọn hồ sơ cần xuất");
        }
        for (var i = 0; i < $scope.lstRecordPackAdded.length; i++) {
            if ($scope.lstRecordPackAdded[i].PackCode === $scope.model.PackCode) {
                check = true;
                break;
            }
        }
        if (!check) {
            var obj = {
                PackName: $scope.packName,
                PackCode: $scope.packCode,
                PackParent: $scope.model.PackParent,
                PackParentName: $scope.packParentName
            };
            debugger
            if ($scope.lstRecordPackAdded.length == 8) {
                var isPackCodeEmpty = false;
                for (var i = 0; i < $scope.lstRecordPackAdded.length; i++) {
                    if ($scope.lstRecordPackAdded[i].PackCode == "") {
                        $scope.lstRecordPackAdded[i] = obj;
                        isPackCodeEmpty = true;
                        break;
                    }
                }
                if (!isPackCodeEmpty) {
                    $scope.lstRecordPackAdded.push(obj);
                }
            }
            else {
                $scope.lstRecordPackAdded.push(obj);
            }
        }
        else {
            App.toastrError("Hồ sơ cần xuất đã được thêm vào danh sách");
        }
    }

    $scope.submit = function () {
        var obj = {
            ListPack: $scope.lstRecordPackAdded,
            DeliveryCode: "DLT020321"
        }
        dataservice.insertRecordDeliveryDetail(obj, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        })
    }

    $scope.selectChange = function (SelectType, item) {
        if (SelectType == "PackType" && $scope.model.PackType != "") {
            $scope.errorPackType = false;
            $scope.model.PackCode = "";
            $scope.model.PackParent = "";
            dataservice.getTreePack($scope.model.PackType, $scope.model.PackLevel, function (rs) {
                rs = rs.data;
                $scope.lstRecordPack = rs;
            })
        }
        if (SelectType == "PackLevel") {
            $scope.errorPackType = false;
            $scope.model.PackCode = "";
            $scope.model.PackParent = "";
            dataservice.getTreePack($scope.model.PackType, $scope.model.PackLevel, function (rs) {
                rs = rs.data;
                $scope.lstRecordPack = rs;
            })
        }
        if (SelectType == "PackCode") {
            debugger
            $scope.model.PackParent = item.ParentCode;
            $scope.packName = item.Title;
            $scope.packCode = item.Code;
            $scope.packParentName = "";
            for (var i = 0; i < $scope.lstRecordsPackAll.length; i++) {
                if ($scope.lstRecordsPackAll[i].Code === $scope.model.PackParent) {
                    $scope.packParentName = $scope.lstRecordsPackAll[i].Title;
                    break;
                }
            }
        }
        if (SelectType == "ZoneCode") {
            dataservice.getInfoZone(item.Code, function (rs) {
                rs = rs.data;
                $scope.zoneInfo = rs;
            })
        }
    }

    $scope.reset = function () {
        $scope.model.PackType = ""
        $scope.model.PackCode = "";
        dataservice.getTreePack($scope.model.PackType, $scope.model.PackLevel, function (rs) {
            rs = rs.data;
            $scope.lstRecordPack = rs;
        })
    }

    $scope.delete = function (packCode) {
        for (var i = 0; i < $scope.lstRecordPackAdded.length; i++) {
            if ($scope.lstRecordPackAdded[i].PackCode === packCode) {
                $scope.lstRecordPackAdded.splice(i, 1);
                break;
            }
        }
        if ($scope.lstRecordPackAdded.length < 8) {
            var obj = {
                PackName: "",
                PackCode: "",
                PackParent: "",
                PackParentName: ""
            };

            $scope.lstRecordPackAdded.push(obj);
        }
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});
