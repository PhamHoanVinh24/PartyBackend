var ctxfolder = "/views/admin/symbolLibrary";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']).
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
app.directive('customOnChangeSumbol', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeSumbol);
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
    var submitFormUpload1 = function (url, data, callback) {
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
            data: data
        }
        $http(req).then(callback);
    };
    return {
        getTypeLibrary: function (callback) {
            $http.get('/Admin/WorkflowActivity/GetTypeLibrary').then(callback)
        },
        insertSharpLibrary: function (data, callback) {
            $http.post('/Admin/SymbolLibrary/InsertSharpLibrary', data).then(callback)
        },
        deleteSharpLib: function (data, callback) {
            $http.post('/Admin/SymbolLibrary/DeleteSharpLib?id=' + data).then(callback)
        },
        getSharpLibItem: function (data, callback) {
            $http.get('/Admin/SymbolLibrary/GetSharpLibItem?id=' + data).then(callback)
        },
        updateSharpLib: function (data, callback) {
            $http.post('/Admin/SymbolLibrary/UpdateSharpLib', data).then(callback)
        },
        uploadAttachment: function (data, callback) {
            submitFormUpload('/Admin/SymbolLibrary/UploadFile/', data, callback);
        },
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        })
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.AssetCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.ASSET_VALIDATE_ITEM_CODE.replace("{0}", caption.ASSET_CURD_LBL_ASSET_CODE), "<br/>");//"Mã tài sản bao gồm chữ cái và số"
            }
            if (!partternName.test(data.AssetName)) {
                mess.Status = true;
                mess.Title += caption.ASSET_VALIDATE_ASSET_NAME.replace("{0}", caption.ASSET_CURD_LBL_ASSET_NAME)//"Yêu cầu tên tài sản có ít nhất một ký tự là chữ cái hoặc số và không bao gồm ký tự đặc biệt!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                SharpCode: {
                    required: true,
                },
                SharpName: {
                    required: true,
                },
                SharpData: {
                    required: true,
                },
               
            },
            messages: {
                SharpCode: {
                    required: caption.SYB_VALIDATE_OBJECTCODE,
                },
                SharpName: {
                    required: caption.SYB_VALIDATE_OBJECTNAME,
                },
                SharpData: {
                    required: caption.SYB_VALIDATE_OBJECT_JSONDATA,
                },
               
            }
        }

        $rootScope.validationOptionsAct = {
            rules: {
                LimitTime: {
                    required: true,
                    maxlength: 100
                },
                UnitTime: {
                    required: true,
                    maxlength: 100
                },
                Priority: {
                    required: true,
                },
            },
            messages: {
                LimitTime: {
                    required: caption.ACT_VALIDATE_TIME_LIMIT,
                    maxlength: caption.ACT_VALIDATE_TIME_LIMIT_SIZE
                },
                UnitTime: {
                    required: caption.ACT_VALIDATE_UNIT,
                    maxlength: caption.ACT_VALIDATE_TIME_LIMIT_SIZE
                },
                Priority: {
                    required: caption.ACT_VALIDATE_PRIORITY_NOT_NULL,
                },
            }
        }
        $rootScope.IsAdd = false;
    });
    $rootScope.WorkFlowCode = '';
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/SymbolLibrary/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        SharpCode: '',
        SharpName: ''
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/SymbolLibrary/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.SharpCode = $scope.model.SharpCode;
                d.SharpName = $scope.model.SharpName;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ID;
                    $scope.edit(Id);
                }
            });
        });
    //end option table
    //Tạo các cột của bảng để đổ dữ liệu vào
    vm.dtColumns = [];
    //vm.dtcolumns.push(dtcolumnbuilder.newcolumn("check").withtitle(titlehtml).notsortable().renderwith(function (data, type, full, meta) {
    //    $scope.selected[full.id] = false;
    //    return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleone(selected)"/><span></span></label>';
    //}).withoption('sclass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn("ID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SharpCode').withTitle('{{"SYB_LIST_COL_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SharpName').withTitle('{{"SYB_LIST_COL_TITLE "| translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SharpType').withTitle('{{"SYB_LIST_COL_TYPE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SharpDesc').withTitle('{{"SYB_LIST_COL_DESCRIPTION "| translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"SYB_LIST_COL_ACTION" | translate}}').withOption('sClass', 'nowrap dataTable-w80 text-center').renderWith(function (data, type, full) {
        return '<a title="Sửa" ng-click="edit(' + full.ID + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></button>' +
            '<a title="Xoá" ng-click="delete(' + full.ID + ')" class="fs25 "><i class="fas fa-trash"style="--fa-primary-color: red;"></i></button>';
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
        reloadData(false);
    }

    $scope.initLoad = function () {

    }

    $scope.initLoad();

    $scope.addSharpLib = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add-wf-sharp-library.html',
            controller: 'add-wf-sharp-library',
            backdrop: 'static',
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit-wf-sharp-library.html',
            controller: 'edit-wf-sharp-library',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.delete = function (id) {
        dataservice.deleteSharpLib(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.reload();
            }
        })
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
    }, 200);
});

app.controller('add-wf-sharp-library', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = {
        SharpCode: "",
        SharpName: "",
        SharpType: "",
        SharpData: "",
        SharpDesc: "",
        SharpPath: ""
    };

    $scope.loadfile = function (e) {

        $("#upload").trigger('click');
    }
    $scope.attrfile = function (event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function () {
            document.getElementById('imageId').src = reader.result;
        };
        reader.readAsDataURL(file);

        if (file != undefined) {
            var data = new FormData();
            data.append("FileUpload", file);
            dataservice.uploadAttachment(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return;
                }
                else {
                    $scope.model.SharpPath = '/uploads/files/' + rs.Object;
                }
            });
        }
    };

    //$scope.SharpDataChange = function () {
    //    if ($(".JsonData").val() == "") {
    //        $(".ShowImage").html('');
    //    }
    //    else {
    //        var type = JSON.parse($(".JsonData").val());

    //        /* if (typeof (type) == "object") {
    //             if (type.type == "draw2d.shape.node.Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item1"><i class="fas fa-clock"></i><span>Process</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Oval_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item2"><i class="fas fa-clock"></i><span>Connector</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Document_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item3"><i class="fas fa-clock"></i><span>Activty</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Teminator_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item4"><i class="fas fa-clock"></i><span>Termiator</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Process_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item5"><i class="fas fa-clock"></i><span>Alternate/Process</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Delay_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item6"><i class="fas fa-clock"></i><span>Delay</span></div>');
    //             }
    //         }*/


    //    }
    //    $scope.model.SharpData = (JSON.stringify(type)).toString();

    //}

    $scope.initData = function () {
        dataservice.getTypeLibrary(function (rs) {
            rs = rs.data;
            $scope.lstTypeLib = rs;
        })

    }

    $scope.initData();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insertSharpLibrary($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }

            })
        }
    }

    $scope.changeSelect = function (selectType) {
        if (selectType == "Type" && $scope.model.SharpType != "") {
            $scope.errorType = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if ($scope.model.SharpCode == "") {
            $scope.errorSharpCode = true;
            mess.Status = true;
        } else {
            $scope.errorSharpCode = false;
        }

        if ($scope.model.SharpName == "") {
            $scope.errorSharpName = true;
            mess.Status = true;
        } else {
            $scope.errorSharpName = false;
        }
        if (data.SharpType == "") {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }
        if ($scope.model.SharpData == "") {
            $scope.errorJson = true;
            mess.Status = true;
        } else {
            $scope.errorJson = false;
        }


        return mess;

    };
    
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});

app.controller('edit-wf-sharp-library', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = {
        SharpCode: "",
        SharpName: "",
        SharpType: "",
        SharpData: "",
        SharpDesc: "",
        SharpPath: ""
    };

    $scope.loadfile = function (e) {
        $("#upload").trigger('click');
    };
    $scope.attrfile = function (event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function () {
            document.getElementById('imageId').src = reader.result;
        };
        reader.readAsDataURL(file);
        if (file != undefined) {
            var data = new FormData();
            data.append("FileUpload", file);
            dataservice.uploadAttachment(data, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    return;
                }
                else {
                    $scope.model.SharpPath = '/uploads/files/' + rs.Object;
                }
            });
        }
    };

    //$scope.SharpDataChange = function () {
    //    if ($(".JsonData").val() == "") {
    //        $(".ShowImage").html('');
    //    }
    //    else {
    //        var type = JSON.parse($(".JsonData").val());

    //        /* if (typeof (type) == "object") {
    //             if (type.type == "draw2d.shape.node.Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item1"><i class="fas fa-clock"></i><span>Process</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Oval_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item2"><i class="fas fa-clock"></i><span>Connector</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Document_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item3"><i class="fas fa-clock"></i><span>Activty</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Teminator_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item4"><i class="fas fa-clock"></i><span>Termiator</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Process_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item5"><i class="fas fa-clock"></i><span>Alternate/Process</span></div>');
    //             }
    //             if (type.type == "draw2d.shape.node.Delay_Hub") {
    //                 $(".ShowImage").html('<div class="item__act2 item6"><i class="fas fa-clock"></i><span>Delay</span></div>');
    //             }
    //         }*/


    //    }
    //    $scope.model.SharpData = (JSON.stringify(type)).toString();

    //}

    $scope.initData = function () {
        dataservice.getTypeLibrary(function (rs) {
            rs = rs.data;
            $scope.lstTypeLib = rs;
        })
        dataservice.getSharpLibItem(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
        })
    }

    $scope.initData();

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.updateSharpLib($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
            });
        }
    };

    $scope.changeSelect = function (selectType) {
        if (selectType == "Type" && $scope.model.SharpType != "") {
            $scope.errorType = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        if ($scope.model.SharpCode == "") {
            $scope.errorSharpCode = true;
            mess.Status = true;
        } else {
            $scope.errorSharpCode = false;
        }

        if ($scope.model.SharpName == "") {
            $scope.errorSharpName = true;
            mess.Status = true;
        } else {
            $scope.errorSharpName = false;
        }
        if (data.SharpType == "") {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }
        if ($scope.model.SharpData == "") {
            $scope.errorJson = true;
            mess.Status = true;
        } else {
            $scope.errorJson = false;
        }


        return mess;

    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
