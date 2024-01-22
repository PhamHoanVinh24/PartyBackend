var ctxfolder = "/views/admin/assetActivity";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getGenReqCode: function (callback) {
            $http.post('/Admin/AssetActivity/GenReqCode').then(callback);
        },
        getUser: function (callback) {
            $http.post('/Admin/AssetActivity/GetUser').then(callback);
        },
        getActivityType: function (callback) {
            $http.post('/Admin/AssetActivity/GetActivityType').then(callback);
        },
        getAsset: function (callback) {
            $http.post('/Admin/AssetActivity/GetAsset/').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/admin/AssetActivity/GetItem?id=' + data).then(callback);
        },
        //getItem: function (data, callback) {
        //    $http.post('/Admin/AssetActivity/GetItem/', data).then(callback);
        //},
        insert: function (data, callback) {
            $http.post('/Admin/AssetActivity/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/AssetActivity/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/AssetActivity/Delete/' + data).then(callback);
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
            //max: 'Max some message {0}'
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ActCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.AA_CURD_LBL_AA_ACTCODE), "<br/>");
            }
            if (!partternName.test(data.ActTitle)) {
                mess.Status = true;
                mess.Title += caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.AA_CURD_LBL_AA_ACTTITLE) + "<br/>";
                //mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.USER_USERNAME) + "<br/>";
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                ActCode: {
                    required: true,
                    maxlength: 100
                },
                ActTitle: {
                    required: true,
                    maxlength: 255
                },
            },
            messages: {
                ActCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.AA_CURD_LBL_AA_ACTCODE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.AA_CURD_LBL_AA_ACTCODE).replace("{1}", "100")
                },
                ActTitle: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.AA_CURD_LBL_AA_ACTTITLE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.AA_CURD_LBL_AA_ACTTITLE).replace("{1}", "100")
                }
            }
        }
        $rootScope.IsTranslate = true;
    });
    dataservice.getAsset(function (rs) {rs=rs.data;
        $rootScope.listAsset = rs;
    })
    dataservice.getActivityType(function (rs) {rs=rs.data;
        $rootScope.ActivityType = rs;
    })
    dataservice.getUser(function (rs) {rs=rs.data;
        $rootScope.listUser = rs;
    });
    
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/AssetActivity/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    var vm = $scope;
    $scope.model = {
        ActCode: '',
        ActTitle: '',
        ActType: '',
        ActMember: '',
        ActNote: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/AssetActivity/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
        //search
            data: function (d) {
                d.ActCode = $scope.model.ActCode;
                d.ActTitle = $scope.model.ActTitle;
                d.ActType = $scope.model.ActType;
                d.ActNote = $scope.model.ActNote;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.ActivityId;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("ActivityId").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActivityId').withTitle('ID').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActCode').withTitle('{{ "AA_LIST_COL_AA_ACTCODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActTitle').withTitle('{{ "AA_CURD_TXT_AA_ACTTITLE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Asset').withTitle('{{ "AA_CURD_LBL_AA_ASSETCODE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActType').withTitle('{{ "AA_CURD_LBL_AA_ACTTYPE" | translate }}').renderWith(function (data, type) {
        //for (var i = 0; i < $rootScope.ActivityType.length; i++) {
        //    if (data === $rootScope.ActivityType[i].Code) {
        //        return $rootScope.ActivityType[i].Name;
        //    }
        //}
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActNote').withTitle('{{ "AA_CURD_TXT_SEARCH_ACTNOTE" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ActMember').withTitle('{{ "AA_LIST_COL_AA_ACTMEMBER" | translate }}').renderWith(function (data, type) {
        if (data != null) {
            var listUser = "";
            var list = data.split(',');
            for (var i = 0; i < list.length; i++) {
                for (var j = 0; j < $rootScope.listUser.length; j++) {
                    if (list[i] == $rootScope.listUser[j].Id) {
                        listUser += $rootScope.listUser[j].GivenName;
                        if (list.length - i > 1) {
                            listUser += ",";
                        }
                        break;
                    }
                }
            }
            return listUser;
        } else {
            return '';
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.ActivityId + ')"  class="fs25 pr10"><i class="fas fa-edit"style="--fa-primary-color: green;"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.ActivityId + ')" class="fs25"><i class="fas fa-trash"style="--fa-primary-color: red;"></i></a>';
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
    $rootScope.search = function (id) {
        reloadData(true);
    };
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '40'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.edit = function (id) {

        dataservice.getItem(id, function (rs) {rs=rs.data;
            //$rootScope.TicketCode = rs.Object.TicketCode; // de hien o ngoai  index phan edit. cua  tai san
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: ctxfolder + '/edit.html',
                controller: 'edit',
                backdrop: 'static',
                size: '40',
                resolve: {
                    para: function () {
                        return rs.Object;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.reloadNoResetPage();
            }, function () {
            });
        });
    }
    

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (rs) {rs=rs.data;
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

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
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

    // view help detail
    $scope.viewCmsDetail = function (helpId) {
        //item, bookMark
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderDashBoard + '/viewItem.html',
            controller: 'viewItemHelp',
            backdrop: 'static',
            windowClass: 'message-avoid-header',
            size: '65',
            resolve: {
                para: function () {
                    return {
                        helpId
                    };
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    };

    setTimeout(function () {
        showHideSearch();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.model = {
        ActCode: '',
        ActTitle: '',
        ActType: '',
        ActMember: '',
    }
    $scope.model1 = {
        listMember: []
    }
    dataservice.getGenReqCode(function (rs) {rs=rs.data;
        if (!rs.Error) {
            $scope.model.ActCode = rs;
        }
    });
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "AssetCode" && $scope.model.AssetCode != "" && $scope.model.AssetCode != null) {
            $scope.errorAssetCode = false;
        }
        if (SelectType == "ActType" && $scope.model.ActType != "" && $scope.model.ActType != null) {
            $scope.errorActType = false;
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            
            $scope.model.ActMember = $scope.model1.listMember.join(',');
            
            dataservice.insert($scope.model, function (rs) {rs=rs.data;
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
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 

        if (data.AssetCode == "" || data.AssetCode == null) {
            $scope.errorAssetCode = true;
            mess.Status = true;
        } else {
            $scope.errorAssetCode = false;
        }

        if (data.ActType == "") {
            $scope.errorActType = true;
            mess.Status = true;
        } else {
            $scope.errorActType = false;
        }
        
        return mess;
    };
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model1 = {
        listMember: [],
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.initData = function () {
        $scope.model = para;
        $scope.model1.listMember = $scope.model.ActMember.split(',');    
    }
    $scope.initData();
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var temp = $rootScope.checkData($scope.model);
            if (temp.Status) {
                App.toastrError(temp.Title);
                return;
            }
            ;
            $scope.model.ActMember = $scope.model1.listMember.join(',');
           
            dataservice.update($scope.model, function (rs) {rs=rs.data;
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
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "AssetCode" && $scope.model.AssetCode != "" && $scope.model.AssetCode != null) {
            $scope.errorAssetCode = false;
        }
        if (SelectType == "ActType" && $scope.model.ActType != "" && $scope.model.ActType != null) {
            $scope.errorActType = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 
        
        if (data.AssetCode == "") {
            $scope.errorAssetCode = true;
            mess.Status = true;
        } else {
            $scope.errorAssetCode = false;
        }

        if (data.ActType == "") {
            $scope.errorActType = true;
            mess.Status = true;
        } else {
            $scope.errorActType = false;
        }
        
        return mess;
    };

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});