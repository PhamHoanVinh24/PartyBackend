var ctxfolder = "/views/admin/packManager";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";

var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'monospaced.qrcode']);

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
        //Combobox
        getPackGroup: function (callback) {
            $http.post('/Admin/PackManager/GetPackGroup').then(callback);
        },
        getPackType: function (callback) {
            $http.post('/Admin/PackManager/GetPackType').then(callback);
        },
        getUnitPack: function (callback) {
            $http.post('/Admin/PackManager/GetUnitPack').then(callback);
        },
        getAttrDataType: function (callback) {
            $http.post('/Admin/PackManager/GetAttrDataType').then(callback);
        },
        getTreeRecordsPack: function (callback) {
            $http.post('/Admin/PackManager/GetTreeRecordsPack').then(callback);
        },
        getTreeZone: function (callback) {
            $http.post('/Admin/ZoneManager/GetTreeZone').then(callback);
        },
        getInfoZone: function (data, callback) {
            $http.post('/Admin/ZoneManager/GetInfoZone?zoneCode=' + data).then(callback);
        },
        getTreePack: function (data, data1, callback) {
            $http.post('/Admin/PackManager/GetTreePack?packType=' + data + '&packLevel=' + data1).then(callback);
        },

        //Tree Records Pack
        getTreeData: function (callback) {
            $http.post('/Admin/PackManager/GetTreeData').then(callback);
        },

        //Common Setting
        getDataTypeCommon: function (callback) {
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

        //Records Pack Attribute
        insertPackAttribute: function (data, callback) {
            $http.post('/Admin/PackManager/InsertPackAttribute', data).then(callback);
        },
        updatePackAttribute: function (data, callback) {
            $http.post('/Admin/PackManager/UpdatePackAttribute', data).then(callback);
        },
        getItemPackAttr: function (data, callback) {
            $http.post('/Admin/PackManager/GetItemPackAttr?id=' + data).then(callback);
        },
        deletePackAttribute: function (data, callback) {
            $http.post('/Admin/PackManager/DeletePackAttribute?id=' + data).then(callback);
        },

        //Records Pack
        insertRecordsPack: function (data, callback) {
            $http.post('/Admin/PackManager/InsertRecordsPack', data).then(callback);
        },

        //Records Pack Arrange
        getRecordsPack: function (data1, data2, callback) {
            $http.get('/Admin/PackManager/GetRecordsPack?packType=' + data1 + '&level=' + data2).then(callback);
        },

        //Info additional
        getInfoRecordsPack: function (data, callback) {
            $http.post('/Admin/PackManager/GetInfoRecordsPack?packCode=' + data).then(callback);
        },

        //Encapsulate
        encapsulateRecordsPack: function (data, callback) {
            $http.post('/Admin/PackManager/EncapsulateRecordsPack', data).then(callback);
        },
        autoUpdateHierarchy: function (callback) {
            $http.post('/Admin/PackManager/AutoUpdateHierarchy').then(callback);
        },

        //Arrange
        arrangeRecordsPack: function (data, callback) {
            $http.post('/Admin/PackManager/ArrangeRecordsPack', data).then(callback);
        },
        checkArrangeRecordPack: function (data, callback) {
            $http.post('/Admin/PackManager/CheckArrangeRecordPack?packCode=' + data).then(callback);
        },

        //Delete Record Pack
        deleteRecordsPack: function (data, callback) {
            $http.post('/Admin/PackManager/DeleteRecordsPack?id=' + data).then(callback);
        },

        //Update Records Pack
        getItemRecordsPack: function (data, callback) {
            $http.post('/Admin/PackManager/GetItemRecordsPack?id=' + data).then(callback);
        },
        updateRecordsPack: function (data, callback) {
            $http.post('/Admin/PackManager/UpdateRecordsPack', data).then(callback);
        },

        //File Pack Record
        getFileEdms: function (callback) {
            $http.post('/Admin/PackManager/GetFileEdms').then(callback);
        },
        insertRecordsFilePack: function (data, callback) {
            $http.post('/Admin/PackManager/InsertRecordsFilePack', data).then(callback);
        },
        deleteRecordFile: function (data, callback) {
            $http.post('/Admin/PackManager/DeleteRecordFile?id=' + data).then(callback);
        },

        //Generate QrCode
        generatorQRCode: function (data, callback) {
            $http.post('/Admin/EDMSWareHouseManager/GenQRCode?code=' + data, callback).then(callback);
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
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                PackAttrCode: {
                    required: true,
                    //regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 255
                },
                PackAttrName: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                PackAttrValue: {
                    required: true,
                    regx: /^[^\s].*/
                }
            },
            messages: {
                PackAttrCode: {
                    required: "Mã thuộc tính không được bỏ trống",
                    //regx: "Mã thuộc tính không chứa ký tự đặc biệt, khoảng trắng và không có dấu",
                    maxlength: "Tối đa 255 ký tự"
                },
                PackAttrName: {
                    required: "Tên thuộc tính không được bỏ trống",
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Tên thuộc tính không bắt đầu bằng khoảng trắng"
                },

                PackAttrValue: {
                    required: "Giá trị không được bỏ trống",
                    regx: "Giá trị không bắt đầu bằng khoảng trắng"
                }
            }
        }

        $rootScope.validationAttributeOptions = {
            rules: {
                AttributeCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/
                },
                AttributeName: {
                    required: true,
                },
                Note: {
                    maxlength: 300
                },
                FieldType: {
                    required: true,
                },
                AttributeValue: {
                    required: true,
                },
            },
            messages: {
                AttributeCode: {
                    required: caption._MSG_CODE_NOT_BLANK,
                    regx: caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption._CURD_TAB_ATTRIBUTE_LBL_CODE),
                },
                AttributeName: {
                    required: caption._MSG_NAME_NOT_BLANK,
                },
                Note: {
                    maxlength: caption._MSG_NOT_ACTION_CHARACTER
                },
                FieldType: {
                    required: caption._MSG_VALUE_TYPE_NOT_BLANK,
                },
                AttributeValue: {
                    required: caption._MSG_TYPE_NOT_BLANK
                }
            }
        }

        $rootScope.validationOptionsRecordsPack = {
            rules: {
                PackCode: {
                    required: true,
                    //regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 255
                },
                PackName: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                PackLabel: {
                    regx: /^[^\s].*/,
                    maxlength: 1000
                },
                PackQuantity: {
                    regx: /^[+]?\d+(\.\d+)?$/,
                    maxlength: 5
                }
            },
            messages: {
                PackCode: {
                    required: "Mã đối tượng hồ sơ không được bỏ trống",
                    //regx: "Mã đối tượng hồ sơ không chứa ký tự đặc biệt, khoảng trắng và không có dấu",
                    maxlength: "Tối đa 255 ký tự"
                },
                PackName: {
                    required: "Tiêu đề không được bỏ trống",
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Tiêu đề không bắt đầu bằng khoảng trắng"
                },

                PackLabel: {
                    regx: "Nhãn mô tả không bắt đầu bằng khoảng trắng",
                    maxlength: "Tối đa 1000 ký tự",
                },
                PackQuantity: {
                    regx: "Nhập đúng định dạng số",
                    maxlength: "Vui lòng nhập số nhỏ hơn hoặc bằng 5 chữ số"
                }
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/PackManager/Translation');
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
});

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    $scope.tree_data = [];

    $rootScope.isUpdateRecord = false;

    $scope.model = {};

    $scope.initTreeGird = function (rawTreeData) {
        var myTreeData = getTree(rawTreeData, 'Id', 'ZoneParentId');
        $scope.tree_data = myTreeData;
    }

    $scope.my_tree = {};

    $scope.my_tree_handler = function (branch) {
        console.log('you clicked on', branch)

        //$scope.edit(branch.Id);
    }

    $scope.expanding_property = {
        field: "ZoneName",
        displayName: "Hồ sơ",
        sortable: true,
        filterable: true,
        cellTemplate: "<i>{{row.branch[expandingProperty.field]}}</i>"
    };

    $scope.col_defs = [
        {
            field: "ZoneLabel",
            sortable: true,
            sortingType: "string",
            displayName: "Nhãn hồ sơ",
            cellTemplate: "<i class=''>{{row.branch[col.field]}}</i>"
        },
        {
            field: "Quantity",
            displayName: "Số lượng hồ sơ",
            sortable: true,
            sortingType: "string",
            cellTemplate: "<strong class='text-danger text-center bold'>{{row.branch[col.field]}}</strong>"
        },
        {
            field: "Status",
            sortable: true,
            sortingType: "int",
            displayName: "Trạng thái",
            cellTemplate: "<span class='bold'>{{row.branch[col.field]}}</span>"
        },
        {
            field: "Id",
            sortable: true,
            sortingType: "int",
            displayName: "Thao tác",
            cellTemplate: "<span ng-click='cellTemplateScope.edit(row.branch[col.field])' style='width: 25px; height: 25px; padding: 0px' class= 'btn btn-icon-only btn-circle btn-outline blue' > <i class='fa fa-edit'></i></span> <span ng-click='cellTemplateScope.delete(row.branch[col.field])' style='width: 25px; height: 25px; padding: 0px' class='btn btn-icon-only btn-circle btn-outline red'><i class='fa fa-trash'></i></span>",
            cellTemplateScope: {
                edit: function (id) {
                    $scope.editRecord(id);
                },
                delete: function (id) {
                    $scope.deleteRecord(id);
                }
            }
        }
    ];

    function getTree(data, primaryIdName, parentIdName) {
        if (!data || data.length == 0 || !primaryIdName || !parentIdName)
            return [];

        var tree = [],
            rootIds = [],
            item = data[0],
            primaryKey = item[primaryIdName],
            treeObjs = {},
            tempChildren = {},
            parentId,
            parent,
            len = data.length,
            i = 0;

        while (i < len) {
            item = data[i++];
            primaryKey = item[primaryIdName];

            if (tempChildren[primaryKey]) {
                item.children = tempChildren[primaryKey];
                delete tempChildren[primaryKey];
            }

            treeObjs[primaryKey] = item;
            parentId = item[parentIdName];

            if (parentId) {
                parent = treeObjs[parentId];

                if (!parent) {
                    var siblings = tempChildren[parentId];
                    if (siblings) {
                        siblings.push(item);
                    }
                    else {
                        tempChildren[parentId] = [item];
                    }
                }
                else if (parent.children) {
                    parent.children.push(item);
                }
                else {
                    parent.children = [item];
                }
            }
            else {
                rootIds.push(primaryKey);
            }
        }

        for (var i = 0; i < rootIds.length; i++) {
            tree.push(treeObjs[rootIds[i]]);
        };

        return tree;
    }

    $scope.search = function () {
        dataservice.getTreeData(function (rs) {
            rs = rs.data;
            $scope.listData = rs;
            $scope.initTreeGird($scope.listData);
        });
    }

    $scope.initData = function () {
        $scope.search();
    }

    $scope.initData();

    $scope.deleteRecord = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteRecordsPack(id, function (rs) {
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
            $scope.search();
        }, function () {
            $scope.search();
        });
    }

    $scope.editRecord = function (id) {
        dataservice.getItemRecordsPack(id, function (rs) {
            rs = rs.data;
            $rootScope.packCode = rs.PackCode;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit-pack-records.html',
                controller: 'edit-pack-records',
                backdrop: 'static',
                windowClass: "message-center",
                size: '60',
                resolve: {
                    para: function () {
                        return rs;
                    }
                },
            });
            modalInstance.result.then(function (d) {
                $scope.search();
            }, function () {
            });
        })
    }

    $scope.addPackAttr = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/recordsAttribute.html',
            controller: 'recordsAttribute',
            backdrop: 'static',
            windowClass: "message-center",
            size: '60',
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }

    $scope.packRecords = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/pack-records.html',
            controller: 'add-pack-records',
            backdrop: 'static',
            windowClass: "message-center",
            size: '60',
        });
        modalInstance.result.then(function (d) {
            $scope.search();
        }, function () {
        });
    }

    $scope.packRecordsArrange = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/records-pack-arrange.html',
            controller: 'records-pack-arrange',
            backdrop: 'static',
            //windowClass: "message-center",
            size: '70',
        });
        modalInstance.result.then(function (d) {
            $scope.search();
        }, function () {
        });
    }
});

app.controller('recordsAttribute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, $confirm, $uibModalInstance, dataservice, $timeout) {
    $scope.model = {
        PackAttrType: "",
        PackAttrGroup: "",
        PackAttrCode: "",
        PackAttrName: "",
        PackAttrValue: "",
        PackAttrUnit: "",
        PackAttrDataType: "",
        PackAttrSize: ""
    };

    $scope.isUpdate = false;

    function reset() {
        $scope.model.PackAttrType = "";
        $scope.model.PackAttrGroup = "";
        $scope.model.PackAttrCode = "";
        $scope.model.PackAttrName = "";
        $scope.model.PackAttrValue = "";
        $scope.model.PackAttrUnit = "";
        $scope.model.PackAttrDataType = "";
        $scope.model.PackAttrSize = "";
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataservice.getPackGroup(function (rs) {
            rs = rs.data;
            $scope.lstPackGroup = rs;
        });

        dataservice.getPackType(function (rs) {
            rs = rs.data;
            $scope.lstPackType = rs;
        });

        dataservice.getUnitPack(function (rs) {
            rs = rs.data;
            $scope.lstUnitPack = rs;
        });

        dataservice.getAttrDataType(function (rs) {
            rs = rs.data;
            $scope.lstAttrDataType = rs;
        });
    }

    $scope.initData();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.isUpdate) {
                dataservice.updatePackAttribute($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        reset();
                        $scope.isUpdate = false;
                    }
                })
            }
            else {
                dataservice.insertPackAttribute($scope.model, function (rs) {
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.reload();
                        reset();
                    }
                })
            }
        }
    }

    $scope.edit = function (id) {
        $scope.isUpdate = true;
        dataservice.getItemPackAttr(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title)
            }
            else {
                $scope.model = rs.Object;
            }
        })
    }

    $scope.cancelEdit = function () {
        reset();
        $scope.isUpdate = false;
    }

    $scope.deletePackAttr = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            resolve: {
                para: function () {
                    return id;
                }
            },
            controller: function ($scope, $uibModalInstance, para) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deletePackAttribute(para, function (rs) {
                        if (rs.data.Error) {
                            App.toastrError(rs.data.Title);
                        } else {
                            App.toastrSuccess(rs.data.Title);
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

    $scope.selectChange = function (SelectType) {
        if (SelectType == "PackAttrType" && $scope.model.PackAttrType != "") {
            $scope.errorPackAttrType = false;
        }
        if (SelectType == "PackAttrGroup" && $scope.model.PackAttrGroup != "") {
            $scope.errorPackAttrGroup = false;
        }
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.PackAttrType == "") {
            $scope.errorPackAttrType = true;
            mess.Status = true;
        } else {
            $scope.errorPackAttrType = false;
        }

        if (data.PackAttrGroup == "") {
            $scope.errorPackAttrGroup = true;
            mess.Status = true;
        } else {
            $scope.errorPackAttrGroup = false;
        }

        return mess;
    };

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PackManager/JTablePackAttribute",
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
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
        .withOption('serverSide', true)
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
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.ServiceCatID] = !$scope.selected[data.ServiceCatID];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.ServiceCatID] = false;
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
                    var Id = data.ID;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml)
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrCode').withTitle('{{"Mã thuộc tính" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrName').withTitle('{{"Tên thuộc tính" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrValue').withTitle('{{"Giá trị(Đơn vị)" | translate}}').renderWith(function (data, type, full) {
        return data + ' (' + full.PackAttrUnit + ')';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrSize').withTitle('{{"Kiểu dữ liệu" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrType').withTitle('{{"Kiểu đóng gói" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrGroup').withTitle('{{"Nhóm đóng gói" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrSize').withTitle('{{"Kích thước" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.ID + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="deletePackAttr(' + full.ID + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $rootScope.reload = function () {
        reloadData(true);
    }

    $scope.reload = function () {
        reloadData(true);
    }

    $scope.addPackAttrGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PACK_GROUP',
                        GroupNote: 'Pack Group',
                        AssetCode: 'PACK_GROUP'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getPackGroup(function (rs) {
                rs = rs.data;
                $scope.lstPackGroup = rs;
            });
        }, function () { });
    }

    $scope.addPackAttrType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PACK_TYPE',
                        GroupNote: 'Pack Type',
                        AssetCode: 'PACK_TYPE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getPackType(function (rs) {
                rs = rs.data;
                $scope.lstPackType = rs;
            })
        }, function () { });
    }

    $scope.addPackAttrUnit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'UNIT',
                        GroupNote: 'Unit',
                        AssetCode: 'PUBLISH'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getUnitPack(function (rs) {
                rs = rs.data;
                $scope.lstUnitPack = rs;
            })
        }, function () { });
    }

    $scope.addPackAttrDataType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ATTR_DATA_TYPE',
                        GroupNote: 'Kiểu dữ liệu',
                        AssetCode: 'ATTR_DATA_TYPE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getAttrDataType(function (rs) {
                rs = rs.data;
                $scope.lstAttrDataType = rs;
            })
        }, function () { });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('add-pack-records', function ($scope, $rootScope, $confirm, DTOptionsBuilder, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }

    $rootScope.isAdded = false;

    $scope.model = {
        PackLevel: 0,
        PackType: "",
        PackParent: "",
        PackCode: "",
        PackName: "",
        PackQuantity: 0,
        PackLabel: "",
        PackZoneLocation: "",
        PackHierarchyPath: ""
    }

    $scope.initData = function () {
        dataservice.getPackType(function (rs) {
            rs = rs.data;
            $scope.lstPackType = rs;
        });

        dataservice.getTreeRecordsPack(function (rs) {
            rs = rs.data;
            $scope.lstRecordPack = rs;
        })

        dataservice.getTreeZone(function (rs) {
            rs = rs.data;
            $scope.treeZone = rs;
        })
    }

    $scope.initData();
    $scope.QR_CODE = "";
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insertRecordsPack($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    $rootScope.isAdded = true;
                    $rootScope.packCode = $scope.model.PackCode;
                    //$scope.QR_CODE = $scope.model.PackCode;
                    App.toastrSuccess(rs.Title);
                    dataservice.getTreeRecordsPack(function (rs) {
                        rs = rs.data;
                        $scope.lstRecordPack = rs;
                    })
                    dataservice.autoUpdateHierarchy(function (rs) { });
                }
            })
        }
    }

    $scope.selectChange = function (SelectType) {
        if (SelectType == "PackType" && $scope.model.PackType != "") {
            $scope.errorPackType = false;
            $scope.reload();
        }

        if (SelectType == "PackParent" && $scope.model.PackParent != "") {
            dataservice.getInfoRecordsPack($scope.model.PackParent, function (rs) {
                rs = rs.data;
                debugger
                $scope.recordsPack = rs;
                $scope.model.PackLevel = parseInt($scope.recordsPack.PackLevel) + 1;
                $scope.model.PackHierarchyPath = $scope.recordsPack.PackHierarchyPath;

                if ($scope.recordsPack.PackZoneLocation != "" && $scope.recordsPack.PackZoneLocation != null && $scope.recordsPack.PackZoneLocation != undefined) {
                    dataservice.getInfoZone($scope.recordsPack.PackZoneLocation, function (rs) {
                        rs = rs.data;
                        $scope.zoneInfo = rs;
                        $scope.model.PackZoneLocation = $scope.zoneInfo.ZoneCode;
                    })
                }
            })
        }
    }

    $scope.reset = function () {
        $scope.model.PackLevel = 0;
        $scope.model.PackHierarchyPath = "";
        $scope.model.PackZoneLocation = "";
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.PackType == "") {
            $scope.errorPackType = true;
            mess.Status = true;
        } else {
            $scope.errorPackType = false;
        }

        return mess;
    };

    $scope.addPackType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PACK_TYPE',
                        GroupNote: 'Pack Type',
                        AssetCode: 'PACK_TYPE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getPackType(function (rs) {
                rs = rs.data;
                $scope.lstPackType = rs;
            })
        }, function () { });
    }

    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PackManager/JTableRecordsPack",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PackType = $scope.model.PackType;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
                    $scope.selected[data.ServiceCatID] = !$scope.selected[data.ServiceCatID];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.ServiceCatID] = false;
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

                }
            });
        });

    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml)
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrCode').withTitle('{{"WPM_CODE_NAME_ATTR" | translate}}').renderWith(function (data, type, full) {
        return full.PackAttrName + ' (' + data + ')';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrValue').withTitle('{{"WPM_VALUE_UNIT" | translate}}').renderWith(function (data, type, full) {
        return data + ' (' + full.PackAttrUnit + ')';
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

    //Print
    $scope.print = function () {
        if ($scope.QR_CODE != '') {
            var image = '<img src="data:image/png;base64,' + $scope.QR_CODE + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('edit-pack-records', function ($scope, $rootScope, $confirm, DTOptionsBuilder, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $translate, $window, para) {
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }

    $scope.model = {
        PackLevel: 0,
        PackType: "",
        PackParent: "",
        PackCode: "",
        PackName: "",
        PackQuantity: 0,
        PackLabel: "",
        PackZoneLocation: "",
        PackHierarchyPath: ""
    }
    $scope.QR_CODE = "";
    $scope.initData = function () {
        debugger
        $scope.model = para;
        
        dataservice.generatorQRCode($scope.model.PackCode, function (rs) {
            rs = rs.data;
            $scope.QR_CODE = rs;
        })

        $rootScope.isAdded = true;

        dataservice.getPackType(function (rs) {
            rs = rs.data;
            $scope.lstPackType = rs;
        });

        dataservice.getTreeRecordsPack(function (rs) {
            rs = rs.data;
            $scope.lstRecordPack = rs;
        })

        dataservice.getTreeZone(function (rs) {
            rs = rs.data;
            $scope.treeZone = rs;
        })
    }

    $scope.initData();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.updateRecordsPack($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    dataservice.getTreeRecordsPack(function (rs) {
                        rs = rs.data;
                        $scope.lstRecordPack = rs;
                    })
                    dataservice.autoUpdateHierarchy(function (rs) { });
                }
            })
        }
    }

    $scope.selectChange = function (SelectType) {
        if (SelectType == "PackType" && $scope.model.PackType != "") {
            $scope.errorPackType = false;
            $scope.reload();
        }

        if (SelectType == "PackParent" && $scope.model.PackParent != "") {
            dataservice.getInfoRecordsPack($scope.model.PackParent, function (rs) {
                rs = rs.data;
                debugger
                $scope.recordsPack = rs;
                $scope.model.PackLevel = parseInt($scope.recordsPack.PackLevel) + 1;
                $scope.model.PackHierarchyPath = $scope.recordsPack.PackHierarchyPath;

                if ($scope.recordsPack.PackZoneLocation != "" && $scope.recordsPack.PackZoneLocation != null && $scope.recordsPack.PackZoneLocation != undefined) {
                    dataservice.getInfoZone($scope.recordsPack.PackZoneLocation, function (rs) {
                        rs = rs.data;
                        $scope.zoneInfo = rs;
                        $scope.model.PackZoneLocation = $scope.zoneInfo.ZoneCode;
                    })
                }
            })
        }
    }

    $scope.reset = function () {
        $scope.model.PackLevel = 0;
        $scope.model.PackHierarchyPath = "";
        $scope.model.PackZoneLocation = "";
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.PackType == "") {
            $scope.errorPackType = true;
            mess.Status = true;
        } else {
            $scope.errorPackType = false;
        }

        return mess;
    };

    $scope.addPackType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'PACK_TYPE',
                        GroupNote: 'Pack Type',
                        AssetCode: 'PACK_TYPE'
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            dataservice.getPackType(function (rs) {
                rs = rs.data;
                $scope.lstPackType = rs;
            })
        }, function () { });
    }

    $scope.viewQrCode = function (code) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderQrCode + '/qrViewer.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.qrcodeString = code;
                setTimeout(function () {
                    setModalDraggable('.modal-dialog');
                }, 200);
            },
            backdrop: 'static',
            size: '25',
        });
    }

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PackManager/JTableRecordsPack",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PackType = $scope.model.PackType;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
                    $scope.selected[data.ServiceCatID] = !$scope.selected[data.ServiceCatID];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.ServiceCatID] = false;
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

                }
            });
        });

    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml)
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrCode').withTitle('{{"WPM_CODE_NAME_ATTR" | translate}}').renderWith(function (data, type, full) {
        return full.PackAttrName + ' (' + data + ')';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('PackAttrValue').withTitle('WPM_VALUE_UNIT" | translate}}').renderWith(function (data, type, full) {
        return data + ' (' + full.PackAttrUnit + ')';
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

    //Print
    $scope.print = function () {
        if ($scope.QR_CODE != '') {
            var image = '<img src="data:image/png;base64,' + $scope.QR_CODE + '" width="125" height="125" /> ';
            var hiddenFrame = $('<iframe style="width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            doc.write('<style>@page{margin:0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;}</style >' + '<body>' + image + '</body>');
            doc.close();
            setTimeout(function () {
                hiddenFrame.contentWindow.print();
            }, 250);
        } else {
            App.toastrError(caption.PWM_MSG_CREATE_QRCODE)
        }
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('record-pack-files', function ($scope, $rootScope, $confirm, DTOptionsBuilder, $compile, $uibModal, DTColumnBuilder, DTInstances, dataservice, $translate) {
    $scope.model = {
        FileCode: "",
        PackCode: ""
    }

    $scope.initData = function () {
        dataservice.getFileEdms(function (rs) {
            rs = rs.data;
            $scope.listFiles = rs;
        })
    }

    $scope.initData();

    $scope.submit = function () {
        debugger
        if (!$rootScope.isAdded) {
            return App.toastrError("Vui lòng thêm hồ sơ trước");
        }
        $scope.model.PackCode = $rootScope.packCode;
        dataservice.insertRecordsFilePack($scope.model, function (rs) {
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

    $scope.selectChange = function (SelectType, item) {
        if (SelectType == "FILE") {
            $scope.urlFile = item.Url;
        }
    }

    $scope.reset = function () {
        $scope.model.PackLevel = 0;
        $scope.model.PackHierarchyPath = "";
        $scope.model.PackZoneLocation = "";
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.PackType == "") {
            $scope.errorPackType = true;
            mess.Status = true;
        } else {
            $scope.errorPackType = false;
        }

        return mess;
    };

    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-change="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PackManager/JTableFileRecordPack",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.PackCode = $rootScope.packCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
                    $scope.selected[data.ServiceCatID] = !$scope.selected[data.ServiceCatID];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        //$(self).removeClass('selected');
                        //$scope.selected[data.ServiceCatID] = false;
                    } else {
                        //$('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        //$scope.selected.forEach(function (obj, index) {
                        //    if ($scope.selected[index])
                        //        $scope.selected[index] = false;
                        //});
                        //$(self).addClass('selected');
                        //$scope.selected[data.Id] = true;
                    }
                }

                vm.selectAll = false;
                $scope.$apply();
            });
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {

                }
            });
        });

    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml)
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));

    vm.dtColumns.push(DTColumnBuilder.newColumn('FileName').withTitle('Tệp tin').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Url').withTitle('Đường dẫn').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('Thao tác').renderWith(function (data, type, full) {
        return '<button title="Xoá" ng-click="deletePackFile(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.deletePackFile = function (id) {
        dataservice.deleteRecordFile(id, function (rs) {
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

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('records-pack-arrange', function ($scope, $rootScope, $confirm, DTOptionsBuilder, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
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
            return App.toastrError("Vui lòng chọn hồ sơ cần đóng gói");
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
            App.toastrError("Hồ sơ cần đóng gói đã được thêm vào danh sách");
        }
    }

    $scope.moveRight = function () {
        $scope.lstRecordPackAddedRight = angular.copy($scope.lstRecordPackAdded);
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

    $scope.deleteRight = function (packCode) {
        for (var i = 0; i < $scope.lstRecordPackAddedRight.length; i++) {
            if ($scope.lstRecordPackAddedRight[i].PackCode === packCode) {
                $scope.lstRecordPackAddedRight.splice(i, 1);
                break;
            }
        }
        if ($scope.lstRecordPackAddedRight.length < 8) {
            var obj = {
                PackName: "",
                PackCode: "",
                PackParent: "",
                PackParentName: ""
            };

            $scope.lstRecordPackAddedRight.push(obj);
        }
    }

    $scope.recordsPack = function () {
        if ($scope.lstRecordPackAddedRight.length == 0) {
            return App.toastrError("Vui lòng chọn hồ sơ cần đóng gói");
        }
        if ($scope.model.RecordsPack == "" || $scope.model.RecordsPack == null || $scope.model.RecordsPack == undefined) {
            return App.toastrError("Vui lòng chọn nơi đóng gói");
        }

        for (var i = 0; i < $scope.lstRecordPackAddedRight.length; i++) {
            if ($scope.lstRecordPackAddedRight[i].PackCode != "") {

                var obj = {
                    RecordsPack: $scope.model.RecordsPack,
                    ListRecordsPack: $scope.lstRecordPackAddedRight[i].PackCode
                };

                dataservice.encapsulateRecordsPack(obj, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        //App.toastrSuccess(rs.Title);
                        dataservice.autoUpdateHierarchy(function (rs) { });
                        dataservice.getTreeRecordsPack(function (rs) {
                            rs = rs.data;
                            $scope.lstRecordPack = rs;
                            $scope.lstRecordsPackAll = angular.copy($scope.lstRecordPack);
                        })
                    }
                })
            }

            setTimeout(function () {
            }, 400);
        }
        App.toastrSuccess("Đóng gói thành công");
    }

    $scope.arrangePack = function () {
        if ($scope.model.ZoneCode == "" || $scope.model.ZoneCode == null || $scope.model.ZoneCode == undefined) {
            return App.toastrError("Vui lòng chọn vị trí xếp");
        }

        if ($scope.lstRecordPackAddedRight.length == 0) {
            return App.toastrError("Vui lòng chọn hồ sơ đóng gói");
        }
        var isOnePack = 0;
        for (var i = 0; i < $scope.lstRecordPackAddedRight.length; i++) {
            if ($scope.lstRecordPackAddedRight[i].PackCode != "") {
                isOnePack = isOnePack + 1;
            }
        }
        if (isOnePack > 1) {
            return App.toastrError("Vui lòng chọn 1 hồ sơ cần đóng gói");
        }

        var obj = {
            ZoneCode: $scope.model.ZoneCode,
            ListRecordsPack: $scope.lstRecordPackAddedRight[0].PackCode
        };
        dataservice.checkArrangeRecordPack(obj.ListRecordsPack, function (rs) {
            rs = rs.data;
            if (rs) {
                var modalInstance = $uibModal.open({
                    templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
                    resolve: {
                        para: function () {
                            return obj;
                        }
                    },
                    windowClass: "message-center",
                    controller: function ($scope, $uibModalInstance, para) {
                        $scope.message = "Gói chứa hồ sơ cần xếp đã được xếp kho, bạn có muốn tách hồ sơ khỏi gói để xếp?";
                        $scope.ok = function () {
                            dataservice.arrangeRecordsPack(para, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {
                                    App.toastrError(rs.Title)
                                }
                                else {
                                    App.toastrSuccess(rs.Title);
                                    $uibModalInstance.dismiss('cancel');
                                    dataservice.autoUpdateHierarchy(function (rs) { });
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
                    $uibModalInstance.close();
                }, function () {
                });
            }
            else {
                dataservice.arrangeRecordsPack(obj, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title)
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        dataservice.autoUpdateHierarchy(function (rs) { });
                    }
                })
            }
        })
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"STT" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"COM_CURD_LBL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"COM_CURD_LBL_TYPE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"COM_LIST_COL_CREATED_TIME" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"COM_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
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
        dataservice.getDataTypeCommon(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '') {
            App.toastrError("Vui lòng nhập giá trị");
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
        if ($scope.model.ValueSet == '') {
            App.toastrError("Vui lòng nhập giá trị")
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
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
