var ctxfolder = "/views/admin/assetZoneManager";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

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
        //commomsetting
        getDataType: function (callback) {
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
        //commomsetting

        //Combobox
        getTreeZone: function (callback) {
            $http.post('/Admin/AssetZoneManager/GetTreeZone').then(callback);
        },
        getZoneLevel: function (callback) {
            $http.post('/Admin/AssetZoneManager/GetZoneLevel').then(callback);
        },
        getZoneGroup: function (callback) {
            $http.post('/Admin/AssetZoneManager/GetZoneGroup').then(callback);
        },
        getZoneType: function (callback) {
            $http.post('/Admin/AssetZoneManager/GetZoneType').then(callback);
        },
        getAttrUnit: function (callback) {
            $http.post('/Admin/AssetZoneManager/GetAttrUnit').then(callback);
        },
        getAttrDataType: function (callback) {
            $http.post('/Admin/AssetZoneManager/GetAttrDataType').then(callback);
        },
        //Combobox

        insertAttribute: function (data, callback) {
            $http.post('/Admin/AssetZoneManager/InsertAttribute', data).then(callback);
        },
        updateAttribute: function (data, callback) {
            $http.post('/Admin/AssetZoneManager/UpdateAttribute', data).then(callback);
        },
        deleteAttribute: function (data, callback) {
            $http.post('/Admin/AssetZoneManager/DeleteAttribute/' + data).then(callback);
        },
        getDetailAttribute: function (data, callback) {
            $http.post('/Admin/AssetZoneManager/GetDetailAttribute?Id=' + data).then(callback);
        },

        //Header
        getTreeData: function (data, data1, data2, callback) {
            $http.post('/Admin/AssetZoneManager/GetTreeData?zoneType=' + data + '&zoneCode=' + data1 + '&zoneLevel=' + data2).then(callback);
        },
        insert: function (data, callback) {
            submitFormUpload('/Admin/AssetZoneManager/Insert', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/AssetZoneManager/Update', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/AssetZoneManager/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/AssetZoneManager/GetItem?Id=' + data).then(callback);
        },
        getInfoZone: function (data, callback) {
            $http.post('/Admin/AssetZoneManager/GetInfoZone?zoneCode=' + data).then(callback);
        }
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
                ZoneCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 255
                },
                ZoneName: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
            },
            messages: {
                ZoneCode: {
                    required: "Mã vùng không được bỏ trống",
                    regx: "Mã vùng không chứa ký tự đặc biệt, khoảng trắng và không có dấu",
                    maxlength: "Tối đa 255 ký tự"
                },
                ZoneName: {
                    required: "Tên vùng không được bỏ trống",
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Tên vùng không bắt đầu bằng khoảng trắng"
                },
            }
        }
        $rootScope.validationAttributeOptions = {
            rules: {
                ZoneAttrCode: {
                    required: true,
                    regx: /^[a-zA-Z0-9._äöüÄÖÜ]*$/,
                    maxlength: 255
                },
                ZoneAttrName: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                ZoneAttrValue: {
                    required: true,
                    regx: /^[^\s].*/
                },
            },
            messages: {
                ZoneAttrCode: {
                    required: "Mã thuộc tính không được bỏ trống",
                    regx: "Mã thuộc tính không chứa ký tự đặc biệt, khoảng trắng và không có dấu",
                    maxlength: "Tối đa 255 ký tự"
                },
                ZoneAttrName: {
                    required: "Tên thuộc tính không được bỏ trống",
                    maxlength: "Tối đa 255 ký tự",
                    regx: "Tên thuộc tính không bắt đầu bằng khoảng trắng"
                },
                ZoneAttrValue: {
                    required: "Giá trị không được bỏ trống",
                    regx: "Giá trị không bắt đầu bằng khoảng trắng"
                }
            }
        }
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ZoneManager/Translation');
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

    $scope.model = {
        ZoneType: '',
        ZoneCode: '',
        ZoneLevel: ''
    }

    $scope.initTreeGird = function (rawTreeData) {
        var myTreeData = getTree(rawTreeData, 'Id', 'ZoneParentId');
        $scope.tree_data = myTreeData;
    }

    $scope.my_tree = {};
    $scope.my_tree_handler = function (branch) {
        console.log('you clicked on', branch)

        $scope.edit(branch.Id);
    }

    $scope.expanding_property = {
        field: "ZoneName",
        displayName: "Vùng",
        sortable: true,
        filterable: true,
        cellTemplate: "<i>{{row.branch[expandingProperty.field]}}</i>"
    };

    $scope.col_defs = [
        {
            field: "ZoneLabel",
            sortable: true,
            sortingType: "string",
            displayName: "Nhãn vùng",
            cellTemplate: "<i class=''>{{row.branch[col.field]}}</i>"
        },
        {
            field: "Quantity",
            displayName: "Sức chứa",
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
            //cellTemplate: "{{row.branch[col.field]}}" == 0 ? "<span class='text-danger text-center bold'>Không hoạt động</span>" : "<span class='text-green text-center bold'>Hoạt động</span>"
        },
        {
            field: "Id",
            sortable: true,
            sortingType: "int",
            displayName: "Thao tác",
            cellTemplate: "<span ng-click='cellTemplateScope.edit(row.branch[col.field])' style='width: 25px; height: 25px; padding: 0px' class= 'btn btn-icon-only btn-circle btn-outline blue' > <i class='fa fa-edit'></i></span> <span ng-click='cellTemplateScope.delete(row.branch[col.field])' style='width: 25px; height: 25px; padding: 0px' class='btn btn-icon-only btn-circle btn-outline red'><i class='fa fa-trash'></i></span>",
            cellTemplateScope: {
                edit: function (id) {
                    $scope.edit(id);
                },
                delete: function (id) {
                    $scope.delete(id);
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
        dataservice.getTreeData($scope.model.ZoneType, $scope.model.ZoneCode, $scope.model.ZoneLevel, function (rs) {
            rs = rs.data;
            $scope.listData = rs;
            $scope.initTreeGird($scope.listData);
        });
    }

    $scope.initData = function () {
        dataservice.getTreeZone(function (rs) {
            rs = rs.data;
            $scope.listZone = rs;
        });
        dataservice.getZoneLevel(function (rs) {
            rs = rs.data;
            $scope.listZoneLevel = rs;
        });
        dataservice.getZoneType(function (rs) {
            rs = rs.data;
            $scope.listZoneType = rs;
        });
        $scope.search();
    }
    $scope.initData();

    $scope.addAttr = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/addAttr.html',
            controller: 'add-attr',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60',
        });
        modalInstance.result.then(function (d) {
            $scope.search();
        }, function () {
            $scope.search();
        });
    }
    $scope.edit = function (id) {
        dataservice.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '50',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.search();
                }, function () {
                    $scope.search();
                });
            }
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
    };
});

app.controller('add', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $confirm, $uibModalInstance, dataservice) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.model = {
        ZoneType: '',
        ZoneGroup: '',
        ZoneCode: '',
        ZoneName: '',
        ZoneParent: '',
        ZoneLabel: '',
        ZoneHierachy: '',
        SvgIconData: '',
        ZoneLevel: 0
    }

    $scope.isEditAttribute = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetZoneManager/JtableAttributeEx",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ZoneType = $scope.model.ZoneType;
                d.ZoneGroup = $scope.model.ZoneGroup;
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
                    var Id = data.Id;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrCode').withTitle('{{"Mã thuộc tính & tên thuộc tính" | translate}}').renderWith(function (data, type, full) {
        return data + ' - ' + full.ZoneAttrName;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrName').withTitle('{{"Tên thuộc tính" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrValue').withTitle('{{"Giá trị(Đơn vị)" | translate}}').renderWith(function (data, type, full) {
        return data + ' (' + full.ZoneAttrUnitName + ')';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneTypeName').withTitle('{{"Kiểu vùng" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneGroupName').withTitle('{{"Nhóm vùng" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
    //    return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));
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
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataservice.getTreeZone(function (rs) {
            rs = rs.data;
            $scope.listZoneParent = rs;
        });
        dataservice.getZoneGroup(function (rs) {
            rs = rs.data;
            $scope.listZoneGroup = rs;
        });
        dataservice.getZoneType(function (rs) {
            rs = rs.data;
            $scope.listZoneType = rs;
        });
        dataservice.getAttrUnit(function (rs) {
            rs = rs.data;
            $scope.listAttrUnit = rs;
        });
        dataservice.getAttrDataType(function (rs) {
            rs = rs.data;
            $scope.listAttrType = rs;
        });
    }
    $scope.initData();

    $scope.changeZone = function (item) {
        debugger
        $scope.model.ZoneLevel = item.Level + 1;
        dataservice.getInfoZone(item.Code, function (rs) {
            rs = rs.data;
            $scope.model.ZoneHierachy = rs.ZoneHierachy;
        })
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var image = document.getElementById("image").files[0];
            if (image != undefined) {
                var fileName = image.name;
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError('Không hỗ trợ định dạng');
                    return;
                } else {
                    $scope.image = image;
                }
            }

            var formData = new FormData();
            formData.append("Image", image != undefined ? $scope.image : null);
            formData.append("ZoneType", $scope.model.ZoneType);
            formData.append("ZoneGroup", $scope.model.ZoneGroup);
            formData.append("ZoneCode", $scope.model.ZoneCode);
            formData.append("ZoneName", $scope.model.ZoneName);
            formData.append("ZoneParent", $scope.model.ZoneParent);
            formData.append("ZoneLevel", $scope.model.ZoneLevel);

            if ($scope.model.ZoneLabel !== null && $scope.model.ZoneLabel !== undefined)
                formData.append("ZoneLabel", $scope.model.ZoneLabel);

            if ($scope.model.ZoneHierachy !== null && $scope.model.ZoneHierachy !== undefined)
                formData.append("ZoneHierachy", $scope.model.ZoneHierachy);

            if ($scope.model.SvgIconData !== null && $scope.model.SvgIconData !== undefined)
                formData.append("SvgIconData", $scope.model.SvgIconData);

            dataservice.insert(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.clear = function () {
        $scope.isEditAttribute = false;
        $scope.model = {
            ZoneType: '',
            ZoneGroup: '',
            ZoneAttrCode: '',
            ZoneAttrName: '',
            ZoneAttrValue: '',
            ZoneAttrUnit: '',
            ZoneAttrType: '',
            ZoneAttrSize: '',
        };
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteAttribute(id, function (rs) {
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

    $scope.selectChange = function (SelectType) {
        if (SelectType == "ZoneType" && $scope.model.ZoneType != "" && $scope.model.ZoneType != undefined) {
            $scope.errorZoneType = false;
            $scope.reloadNoResetPage();
        }
        if (SelectType == "ZoneGroup" && $scope.model.ZoneGroup != "" && $scope.model.ZoneGroup != undefined) {
            $scope.errorZoneGroup = false;
            $scope.reloadNoResetPage();
        }
    }

    $scope.uploadImage = function () {
        var fileuploader = angular.element("#image");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }

    $scope.addZoneType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ZONE_TYPE',
                        GroupNote: 'Kiểu vùng',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.addZoneGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ZONE_GROUP',
                        GroupNote: 'Nhóm vùng',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.addAttrUnit = function () {
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
                        GroupNote: 'Đơn vị',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.addAttrType = function () {
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
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ZoneType == undefined || data.ZoneType == null || data.ZoneType == "") {
            $scope.errorZoneType = true;
            mess.Status = true;
        } else {
            $scope.errorZoneType = false;
        }

        if (data.ZoneGroup == undefined || data.ZoneGroup == null || data.ZoneGroup == "") {
            $scope.errorZoneGroup = true;
            mess.Status = true;
        } else {
            $scope.errorZoneGroup = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $confirm, $uibModalInstance, dataservice, para) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.model = {
        ZoneType: '',
        ZoneGroup: '',
        ZoneCode: '',
        ZoneName: '',
        ZoneParent: '',
        ZoneLabel: '',
    }

    $scope.isEditAttribute = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetZoneManager/JtableAttributeEx",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ZoneType = $scope.model.ZoneType;
                d.ZoneGroup = $scope.model.ZoneGroup;
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
                    var Id = data.Id;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrCode').withTitle('{{"Mã thuộc tính & tên thuộc tính" | translate}}').renderWith(function (data, type, full) {
        return data + ' - ' + full.ZoneAttrName;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrName').withTitle('{{"Tên thuộc tính" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrValue').withTitle('{{"Giá trị(Đơn vị)" | translate}}').renderWith(function (data, type, full) {
        return data + ' (' + full.ZoneAttrUnitName + ')';
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneTypeName').withTitle('{{"Kiểu vùng" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneGroupName').withTitle('{{"Nhóm vùng" | translate}}').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
    //    return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));
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
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        $scope.model = para;

        dataservice.getTreeZone(function (rs) {
            rs = rs.data;
            $scope.listZoneParent = rs;
        });
        dataservice.getZoneGroup(function (rs) {
            rs = rs.data;
            $scope.listZoneGroup = rs;
        });
        dataservice.getZoneType(function (rs) {
            rs = rs.data;
            $scope.listZoneType = rs;
        });
        dataservice.getAttrUnit(function (rs) {
            rs = rs.data;
            $scope.listAttrUnit = rs;
        });
        dataservice.getAttrDataType(function (rs) {
            rs = rs.data;
            $scope.listAttrType = rs;
        });
    }
    $scope.initData();

    $scope.changeZone = function (item) {
        $scope.model.ZoneLevel = item.Level + 1;
        dataservice.getInfoZone(item.Code, function (rs) {
            rs = rs.data;
            $scope.model.ZoneHierachy = rs.ZoneHierachy;
        })
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var image = document.getElementById("image").files[0];
            if (image != undefined) {
                var fileName = image.name;
                var idxDot = fileName.lastIndexOf(".") + 1;
                var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
                if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                    App.toastrError('Không hỗ trợ định dạng');
                    return;
                } else {
                    $scope.image = image;
                }
            }

            var formData = new FormData();
            formData.append("Image", image != undefined ? $scope.image : null);
            formData.append("ZoneType", $scope.model.ZoneType);
            formData.append("ZoneGroup", $scope.model.ZoneGroup);
            formData.append("ZoneCode", $scope.model.ZoneCode);
            formData.append("ZoneName", $scope.model.ZoneName);
            formData.append("ZoneParent", $scope.model.ZoneParent);
            formData.append("ZoneLevel", $scope.model.ZoneLevel);

            if ($scope.model.ZoneLabel !== null && $scope.model.ZoneLabel !== undefined)
                formData.append("ZoneLabel", $scope.model.ZoneLabel);

            if ($scope.model.ZoneHierachy !== null && $scope.model.ZoneHierachy !== undefined)
                formData.append("ZoneHierachy", $scope.model.ZoneHierachy);

            if ($scope.model.SvgIconData !== null && $scope.model.SvgIconData !== undefined)
                formData.append("SvgIconData", $scope.model.SvgIconData);

            dataservice.update(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                }
            });
        }
    }

    $scope.clear = function () {
        $scope.isEditAttribute = false;
        $scope.model = {
            ZoneType: '',
            ZoneGroup: '',
            ZoneAttrCode: '',
            ZoneAttrName: '',
            ZoneAttrValue: '',
            ZoneAttrUnit: '',
            ZoneAttrType: '',
            ZoneAttrSize: '',
        };
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteAttribute(id, function (rs) {
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

    $scope.selectChange = function (SelectType) {
        if (SelectType == "ZoneType" && $scope.model.ZoneType != "" && $scope.model.ZoneType != undefined) {
            $scope.errorZoneType = false;
            $scope.reloadNoResetPage();
        }
        if (SelectType == "ZoneGroup" && $scope.model.ZoneGroup != "" && $scope.model.ZoneGroup != undefined) {
            $scope.errorZoneGroup = false;
            $scope.reloadNoResetPage();
        }
    }

    $scope.uploadImage = function () {
        var fileuploader = angular.element("#image");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }

    $scope.addZoneType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ZONE_TYPE',
                        GroupNote: 'Kiểu vùng',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.addZoneGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ZONE_GROUP',
                        GroupNote: 'Nhóm vùng',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.addAttrUnit = function () {
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
                        GroupNote: 'Đơn vị',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.addAttrType = function () {
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
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ZoneType == undefined || data.ZoneType == null || data.ZoneType == "") {
            $scope.errorZoneType = true;
            mess.Status = true;
        } else {
            $scope.errorZoneType = false;
        }

        if (data.ZoneGroup == undefined || data.ZoneGroup == null || data.ZoneGroup == "") {
            $scope.errorZoneGroup = true;
            mess.Status = true;
        } else {
            $scope.errorZoneGroup = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('add-attr', function ($scope, $rootScope, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModal, $confirm, $uibModalInstance, dataservice) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    $scope.model = {
        ZoneType: '',
        ZoneGroup: '',
        ZoneAttrCode: '',
        ZoneAttrName: '',
        ZoneAttrValue: '',
        ZoneAttrUnit: '',
        ZoneAttrType: '',
        ZoneAttrSize: '',
    }

    $scope.isEditAttribute = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetZoneManager/JtableAttribute",
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
                    var Id = data.Id;
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrCode').withTitle('{{"Mã thuộc tính" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrName').withTitle('{{"Tên thuộc tính" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneAttrValue').withTitle('{{"Giá trị(Đơn vị)" | translate}}').renderWith(function (data, type, full) {
        return data + ' (' + full.ZoneAttrUnitName + ')';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneTypeName').withTitle('{{"Kiểu vùng" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ZoneGroupName').withTitle('{{"Nhóm vùng" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
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
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        dataservice.getZoneGroup(function (rs) {
            rs = rs.data;
            $scope.listZoneGroup = rs;
        });
        dataservice.getZoneType(function (rs) {
            rs = rs.data;
            $scope.listZoneType = rs;
        });
        dataservice.getAttrUnit(function (rs) {
            rs = rs.data;
            $scope.listAttrUnit = rs;
        });
        dataservice.getAttrDataType(function (rs) {
            rs = rs.data;
            $scope.listAttrType = rs;
        });
    }
    $scope.initData();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insertAttribute($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.reloadNoResetPage();
                }
            });
        }
    }

    $scope.edit = function (id) {
        dataservice.getDetailAttribute(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs.Object;
                $scope.isEditAttribute = true;
            }
        });
    }

    $scope.save = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.updateAttribute($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $scope.clear();
                    $scope.reloadNoResetPage();
                }
            });
        }
    }

    $scope.clear = function () {
        $scope.isEditAttribute = false;
        $scope.model = {
            ZoneType: '',
            ZoneGroup: '',
            ZoneAttrCode: '',
            ZoneAttrName: '',
            ZoneAttrValue: '',
            ZoneAttrUnit: '',
            ZoneAttrType: '',
            ZoneAttrSize: '',
        };
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteAttribute(id, function (rs) {
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

    $scope.selectChange = function (SelectType) {
        if (SelectType == "ZoneType" && $scope.model.ZoneType != "" && $scope.model.ZoneType != undefined) {
            $scope.errorZoneType = false;
        }
        if (SelectType == "ZoneGroup" && $scope.model.ZoneGroup != "" && $scope.model.ZoneGroup != undefined) {
            $scope.errorZoneGroup = false;
        }
    }

    $scope.addZoneType = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ZONE_TYPE',
                        GroupNote: 'Kiểu vùng',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.addZoneGroup = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCommonSetting + "/detail.html",
            controller: 'detail',
            size: '50',
            backdrop: 'static',
            resolve: {
                para: function () {
                    return {
                        Group: 'ZONE_GROUP',
                        GroupNote: 'Nhóm vùng',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.addAttrUnit = function () {
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
                        GroupNote: 'Đơn vị',
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }
    $scope.addAttrType = function () {
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
                        AssetCode: ''
                    }
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.initData();
        }, function () { });
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ZoneType == undefined || data.ZoneType == null || data.ZoneType == "") {
            $scope.errorZoneType = true;
            mess.Status = true;
        } else {
            $scope.errorZoneType = false;
        }

        if (data.ZoneGroup == undefined || data.ZoneGroup == null || data.ZoneGroup == "") {
            $scope.errorZoneGroup = true;
            mess.Status = true;
        } else {
            $scope.errorZoneGroup = false;
        }
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('detail', function ($scope, $rootScope, $confirm, $compile, $uibModal, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, para) {
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
    vm.dtColumns.push(DTColumnBuilder.newColumn('_STT').withTitle('{{"SVC_LIST_COL_INDEX" | translate}}').notSortable().withOption('sWidth', '30px').withOption('sClass', 'tcenter w50').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"SVC_LIST_COL_VALUE_SET" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TypeName').withTitle('{{"SVC_LIST_COL_DATA_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle('{{"SVC_LIST_COL_DATE_CREATED" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"SVC_LIST_COL_CREATED_BY" | translate}}').renderWith(function (data, type) {
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
        dataservice.getDataType(function (rs) {
            rs = rs.data;
            $scope.listDataType = rs;
        });
    }
    $scope.init();
    $scope.add = function () {
        if ($scope.model.ValueSet == '') {
            App.toastrError(caption.SVC_CURD_MSG_SETTING_NOT_BLANK);
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
        if ($scope.model.CodeSet == '') {
            App.toastrError(caption.SVC_CURD_MSG_DATA_NOT_BLANK)
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
                $scope.message = "Bạn có chắc chắn muốn xóa ?";
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
