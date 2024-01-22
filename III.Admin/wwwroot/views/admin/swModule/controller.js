var ctxfolder = "/views/admin/swModule";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        GetTreeInNode: function (data, callback) {
            $http.post('/Admin/swModule/GetTreeInNode?parentId='+ data).then(callback);
        },
        GetListModule: function (data, callback) {
            $http.post('/Admin/swModule/GetListModule?moduleCode='+data).then(callback);
        },
        InsertModuleResource: function (data, callback) {
            $http.post('/Admin/swModule/Insert', data).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/swModule/GetItem/'+ data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/swModule/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/swModule/Delete/' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $cookies, $translate) {
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
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.CatCode)) {
                mess.Status = true;
                mess.Title = mess.Title.CatCode(" - ", "{{'CEF_MSG_TITLE_ERR' | translate}}", "<br/>");
            }
            //if (!partternName.test(data.CatName)) {
            //    mess.Status = true;
            //    mess.Title += caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.AA_CURD_LBL_AA_ACTTITLE) + "<br/>";
            //    //mess.Title += " - " + caption.VALIDATE_ITEM_NAME.replace('{0}', caption.USER_USERNAME) + "<br/>";
            //}
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                Name: {
                    required: true,
                },
            },
            messages: {
                Name: {
                    required: "Tên mở rộng không được bỏ trống ",
                    //required: caption.CEF_VALIDATE_NAME,
                },
            }
        }
        $rootScope.IsTranslate = true;



    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CMSExtraField/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, dataservice, $translate) {
    var vm = $scope;
    $scope.model = {
        ModuleCode: '',
        ModuleTitle: '',
        Description: '',
        Level: 0,
        ParentModule: ''
    }

    $scope.initData = function () {
        dataservice.GetListModule($scope.model.ModuleCode,function(rs){
            rs=rs.data;
            if(!rs.Error){
                $scope.ListModuleParent=rs.Object;
                console.log($scope.ListModuleParent);
            }
        });
    };
    $scope.initData();
    $scope.catCode = '';

    // $scope.selected = [];
    // $scope.selectAll = false;
    // $scope.toggleAll = toggleAll;
    // $scope.toggleOne = toggleOne;

    $scope.treeData = [];
    $scope.ProjectCode='';
    var nodeBefore = "";
// code khởi tạo cây
    $scope.readyCB = function () {
        App.blockUI({
            target: "#contentMainRepository",
            boxed: true,
            message: 'loading...'
        });
        dataservice.GetTreeInNode($scope.ProjectCode, function (result) {
            result = result.data;
            console.log(result)

            if (!result.Error) {
                var root = {
                    id: 'root',
                    parent: "#",
                    text: "Tất cả module",//"Tất cả kho dữ liệu"
                    state: { selected: false, opened: true, checkbox_disabled: true, disabled: true }
                }
                $scope.treeData.push(root);
                var index = 0;
                result = result.Object;
                $scope.ListParent = result.filter(function (item) {
                    return (item.ParentCode == null);
                });
                for (var i = 0; i < result.length; i++) {
                    if (result[i].ParentCode == null) {
                        var stt = $scope.ListParent.length - index;
                        if (stt.toString().length == 1) {
                            stt = "0" + stt;
                        }
                        index = index + 1;
                        var title = stt+' - '+result[i].Title;
                        var data = {
                            id: result[i].Code,
                            parent: 'root',
                            title:title,
                            text:(title.length>20)?title.substring(0, 40)+'...':title,
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    } else {
                        var title = result[i].Code + ' - ' +result[i].Title;
                        var data = {
                            id: result[i].Code,
                            parent: result[i].ParentCode,
                            title:title,
                            text: (title.length>20)?title.substring(0, 35)+'...':title,
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: { selected: false, opened: true }
                        }
                        $scope.treeData.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }
// code khi select 1 node
    $scope.selectNodeRepository = function (e, data) {
        var listSelect = [];
        var idCurrentNode = data.node.id;
        var codeCurrentNote = data.node.catCode;
        if (nodeBefore != idCurrentNode) {
            $("#" + nodeBefore + "_anchor").removeClass('bold');

            nodeBefore = idCurrentNode;
            $scope.recentFile = false;
            var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
            // for (var i = 0; i < listNoteSelect.length; i++) {
            //     listSelect.push(listNoteSelect[i].original.catCode);
            // }
            // $scope.modelCardJob.ListItem = listSelect;
            //$scope.reload();
        }
        else {
            $scope.recentFile = false;
            listSelect = [];
            $("#" + idCurrentNode + "_anchor").addClass('bold');
            listSelect.push(codeCurrentNote);
            $scope.modelCardJob.ListItem = listSelect;
            //$scope.reload();
        }
    }
// code khi bỏ select 1 node
    $scope.deselectNodeRepository = function (e, data) {
        $scope.recentFile = false;
        var listSelect = [];
        var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
        if (listNoteSelect.length > 0) {
            for (var i = 0; i < listNoteSelect.length; i++) {
                listSelect.push(listNoteSelect[i].original.catCode);
                dataserviceProject.getTreeInNode(listNoteSelect[i].id, function (rs) {
                    rs = rs.data;
                    if (rs.length > 0) {
                        for (var i = 0; i < rs.length; i++) {
                            listSelect.push(rs[i].Code);
                        }
                    }
                    $scope.modelCardJob.ListItem = listSelect;
                    //$scope.reload();
                })
            }
        } else {
            $scope.modelCardJob.ListItem = listSelect;
            //$scope.reload();
        }
    }
// config của cây
    $scope.treeConfig = {
        core: {
            multiple: true,
            animation: true,
            error: function (error) {
                //$log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
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
        plugins: ['checkbox', 'types', 'contextmenu'],
        checkbox: {
            "three_state": false,
            "whole_node": false,
            "keep_selected_style": false,
            "cascade": "undetermined",
        },
        contextmenu: {
            items: customMenu
        }
    };
// khai báo event
    $scope.treeEvents = {
        'ready': $scope.readyCB,
        'select_node': $scope.selectNodeRepository,
        'deselect_node': $scope.deselectNodeRepository,
    };

    $scope.ac = function () {
        return true;
    }
// menu khi click chuột phải vào node
    function customMenu(node) {
        var items = {};

        items = {
            'item1': {
                'label': 'Sửa thẻ việc',
                'icon': "fa fa-add",
                'action': function (data) {
                    $scope.edit(node.original.catId);
                }
            },
            'item2': {
                'label': 'Xóa thẻ việc',
                'icon': "fa fa-trash",
                'action': function (data) {
                    $scope.delete(node.original.catId);
                }
            }
        };

        return items;
    }

    $scope.selectObjectType = function (objectType) {
        
    }

    $scope.selectObjectCode = function (item) {
       
    }

    $scope.resetObjectType = function () {

    }
    $scope.IsEdit=false;
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if($scope.IsEdit==false){
                dataservice.InsertModuleResource($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        $scope.readyCB();
                        $scope.initData();
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
            else{
                dataservice.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                        $scope.readyCB();
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            }
        }
    };
    
    $scope.cancel = function () {
        $scope.model = {
            ModuleCode: '',
            ModuleTitle: '',
            Description: '',
            Level: 0,
            ParentModule: ''
        }
        $scope.IsEdit=false;
    };
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ModuleCode == "" || data.ModuleCode == null) {
            $scope.errorModuleCode = true;
            $scope.errorModuleCodeTile = "Mã module không được bỏ trống";
            mess.Status = true;
        } else {
            $scope.errorModuleCode = false;
            $scope.errorModuleCodeTile = "";
        }

        if (data.ModuleTitle == "" || data.ModuleTitle == null) {
            $scope.errorModuleTitle = true;
            $scope.errorModuleTitleTitle = "Tên module không được bỏ trống";
            mess.Status = true;
        } else {
            $scope.errorModuleTitle = false;
            $scope.errorModuleTitleTitle = "";
        }
        return mess;

    };
    $scope.edit = function (id) {
        dataservice.getItem(id,function(rs){
            rs=rs.data;
            if(rs.Error==false){
                rs=rs.Object;
                $scope.model = {
                    ModuleCode: rs.ModuleCode,
                    ModuleTitle: rs.ModuleTitle,
                    Description: rs.Description,
                    Level: rs.Level,
                    ParentModule: rs.ParentModule
                }
                $scope.IsEdit=true;
            }
            else{
                App.toastrError(rs.Title);
            }
        })
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(para, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                            $scope.initData();
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
            $('#treeDiv').jstree(true).refresh();
            setTimeout(function () {
                $scope.readyCB();
                //$scope.reload();
            }, 200);
        }, function () {
        });
    };

    setTimeout(function () {
        showHideSearch();
    }, 200);
});