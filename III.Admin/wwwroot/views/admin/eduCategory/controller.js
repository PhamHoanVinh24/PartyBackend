var ctxfolder = "/views/admin/eduCategory";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    };
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
        getUser: function (callback) {
            $http.post('/Admin/cms_categories/GetUser').then(callback);
        },
        insert: function (data, callback) {
            submitFormUpload('/Admin/EduCategory/Insert/', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/EduCategory/Update/', data, callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/EduCategory/Delete/' + data).then(callback);
        },
        getParenCat: function (callback) {
            $http.post('/Admin/EduCategory/GetParenCat/').then(callback);
        },
        getExtraFiled: function (callback) {
            $http.post('/Admin/EduCategory/GetExtraFiled/').then(callback);
        },
        getlistGroup: function (callback) {
            $http.post('/Admin/EduCategory/GetExtraGroup').then(callback);
        },
        getTemplate: function (callback) {
            $http.post('/Admin/EduCategory/GetTemplate').then(callback);
        },
        gettreedata: function (callback) {
            $http.post('/Admin/EduCategory/GetTreeData').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/EduCategory/GetItem/', data).then(callback);
        },
        approve: function (data, callback) {
            $http.post('/Admin/EduCategory/Approve/' + data).then(callback);
        },

        insertCSC: function (data, callback) {
            $http.post('/Admin/EduCategory/InsertCSC/', data).then(callback);
        },
        updateCSC: function (data, callback) {
            $http.post('/Admin/EduCategory/UpdateCSC/', data).then(callback);
        },
        deleteCSC: function (data, callback) {
            $http.post('/Admin/EduCategory/DeleteCSC/' + data).then(callback);
        },
        getItemCSC: function (data, callback) {
            $http.post('/Admin/EduCategory/GetItemCSC', data).then(callback);
        },
        getCatId: function (callback) {
            $http.post('/Admin/CMSItem/GetCatID').then(callback);
        },
        getTypeCMA: function (callback) {
            $http.post('/Admin/CMSItem/GetTypeCMA').then(callback);
        },
    };
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
                Name: {
                    required: true
                },
                Alias: {
                    required: true
                },
            },
            messages: {
                Name: {
                    //required: "Tên danh mục không được bỏ trống",
                    required: caption.CMS_CAT_VALIDATE_CATEGORY_NAME,
                },
                Alias: {
                    //required: "Alias không được bỏ trống",
                    required: caption.CMS_CAT_VALIDATE_ALIAS,
                },
            }
        }
        $rootScope.IsTranslate = true;
    });
    dataservice.getUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/EduCategory/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        CategoryName: '',
        Published: '',
        ExtraFieldGroup: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.listPublished = [
        { code: '', name: 'Tất cả' },
        {
            code: false,
            name: "Không hiển thị"
        }, {
            code: true,
            name: "Hiển thị"
        }
    ];
    $scope.initData = function () {
        dataservice.getlistGroup(function (rs) {
            rs = rs.data;
            $scope.listGroup = rs;
            var all = {
                Id: '',
                Name: 'Tất cả'
            }
            $scope.listGroup.unshift(all)
        });
    };
    $scope.initData();
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EduCategory/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.ExtraFieldGroup = $scope.model.ExtraFieldGroup;
                d.CategoryName = $scope.model.CategoryName;
                d.Published = $scope.model.Published;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
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
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').withTitle('{{"CMS_CAT_COL_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Group').withTitle('{{"Nhóm" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Ordering').withTitle('{{"CMS_CAT_COL_ORDER" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Published').withTitle('{{"CMS_CAT_COL_PUBLISH" | translate}}').renderWith(function (data, type, full) {

        if (data == "True") {
            return '<span class="cursor glyphicon glyphicon-ok-sign text-success fs20 pTip-right btn-publish-inline" ng-click="publish(' + full.Id + ')" ></span> '
        }
        else {
            return '<span class="cursor glyphicon glyphicon-ban-circle text-danger fs20 pTip-right btn-publish-inline" ng-click="publish(' + full.Id + ')"></span> '
        }

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
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
            size: '50'
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
    };

    $scope.publish = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = "Bạn muốn thay đổi trạng thái hiển thị?";
                $scope.ok = function () {

                    dataservice.approve(id, function (rs) {
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
            $scope.reloadNoResetPage();
        }, function () {
        });
    };

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    setTimeout(function () {
    }, 500);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.model = {
        Name: '',
        Alias: '',
        Ordering: '',
        Published: '',
        Parent: '',
        ExtraFieldsGroup: '',
        Description: '',
        Language: '',
        Template: '',
    };
    $rootScope.isShow = '';
    $scope.ConvertToAlias = function (strInput) {
        strInput = strInput.toLowerCase().trim();
        strInput = strInput.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        strInput = strInput.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        strInput = strInput.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        strInput = strInput.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        strInput = strInput.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        strInput = strInput.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        strInput = strInput.replace(/đ/g, "d");
        strInput = strInput.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g, "-");
        strInput = strInput.replace(/-+-/g, "-"); //thay thế 2- thành 1-
        strInput = strInput.replace(/^\-+|\-+$/g, "");//cắt bỏ ký tự - ở đầu và cuối chuỗi
        $scope.model.Alias = strInput;
    };
    $scope.listLanguage = [
        {
            Code: "all",
            Name: "Tất cả"
        }, {
            Code: "vi_VN",
            Name: "Tiếng việt"
        },
        {
            Code: "en_US",
            Name: "English"
        }];

    $scope.chkSubTab = function () {
        if ($rootScope.isShow == '') {
            App.toastrError(caption.CMS_ITEM_MSG_NOT_BLANK);
        }
    }
    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemCategory'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemCategory'].getData();
            $scope.model.Description = data;
        }
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
                else {
                    $scope.file = file;
                }
            }
            var formData = new FormData();
            formData.append("images", $scope.file);
            formData.append("Name", $scope.model.Name);
            formData.append("Template", $scope.model.Template);
            formData.append("Alias", $scope.model.Alias);
            formData.append("Ordering", $scope.model.Ordering);
            formData.append("Parent", $scope.model.Parent);
            formData.append("ExtraFieldsGroup", $scope.model.ExtraFieldsGroup);
            formData.append("Published", $scope.model.Published);
            formData.append("Language", $scope.model.Language);
            formData.append("Description", $scope.model.Description);

            dataservice.insert(formData, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
                else {
                    App.toastrError(rs.Title);
                }
            });
        }

    };
    $scope.initData = function () {
        dataservice.getExtraFiled(function (rs) {
            rs = rs.data;
            $scope.listExtraFiled = rs;
        });
        dataservice.getTemplate(function (rs) {
            rs = rs.data;
            $scope.listTemplate = rs;
        });
        dataservice.gettreedata(function (result) {
            result = result.data;
            $scope.listParenCat = result;
        });
    }
    $scope.initData();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError("Định dạng ảnh không hợp lệ!");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Group" && $scope.model.ExtraFieldsGroup != "" && $scope.model.ExtraFieldsGroup != null && $scope.model.ExtraFieldsGroup != undefined) {
            $scope.errorGroup = false;
        } else {
            $scope.errorGroup = true;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ExtraFieldsGroup == "" || data.ExtraFieldsGroup == null || data.ExtraFieldsGroup == undefined) {
            $scope.errorGroup = true;
            mess.Status = true;
        } else {
            $scope.errorGroup = false;
        }
        return mess;
    }

    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItemCategory', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 500);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model = {
        Name: '',
        Alias: '',
        Ordering: '',
        Published: '',
        Parent: '',
        ExtraFieldsGroup: '',
        Description: '',
        Language: '',
        Template: '',
    };
    $scope.ConvertToAlias = function (strInput) {

        strInput = strInput.toLowerCase().trim();
        strInput = strInput.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        strInput = strInput.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        strInput = strInput.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        strInput = strInput.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        strInput = strInput.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        strInput = strInput.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        strInput = strInput.replace(/đ/g, "d");
        strInput = strInput.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g, "-");
        strInput = strInput.replace(/-+-/g, "-"); //thay thế 2- thành 1-
        strInput = strInput.replace(/^\-+|\-+$/g, "");//cắt bỏ ký tự - ở đầu và cuối chuỗi
        $scope.model.Alias = strInput;

    };
    $scope.listLanguage = [
        {
            Code: "all",
            Name: "Tất cả"
        }, {
            Code: "vi_VN",
            Name: "Tiếng việt"
        },
        {
            Code: "en_US",
            Name: "English"
        }];
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            $rootScope.catId = rs.Id;
        });
        dataservice.getExtraFiled(function (rs) {
            rs = rs.data;
            $scope.listExtraFiled = rs;
        });
        dataservice.getTemplate(function (rs) {
            rs = rs.data;
            $scope.listTemplate = rs;
        });
        dataservice.gettreedata(function (result) {
            result = result.data;
            $scope.listParenCat = result;
        });
    }
    $scope.initData();

    $scope.submit = function () {
        var check = CKEDITOR.instances['ckEditorItemCategory'];
        if (check !== undefined) {
            var data = CKEDITOR.instances['ckEditorItemCategory'].getData();
            $scope.model.Description = data;
        }
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            var file = document.getElementById("File").files[0]
            if (file != undefined) {
                var idxDot = file.name.lastIndexOf(".") + 1;
                var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
                else {
                    $scope.file = file;

                }
            }
            var formData = new FormData();
            formData.append("Id", para);
            formData.append("images", $scope.file);
            formData.append("Name", $scope.model.Name);
            formData.append("Template", $scope.model.Template == null ? "" : $scope.model.Template);
            formData.append("Alias", $scope.model.Alias);
            formData.append("Ordering", $scope.model.Ordering == null ? "" : $scope.model.Ordering);
            formData.append("Parent", $scope.model.Parent == null ? "" : $scope.model.Parent);
            formData.append("ExtraFieldsGroup", $scope.model.ExtraFieldsGroup == null ? "" : $scope.model.ExtraFieldsGroup);
            formData.append("Published", $scope.model.Published == null ? "" : $scope.model.Published);
            formData.append("Language", $scope.model.Language == null ? "" : $scope.model.Language);
            formData.append("Description", $scope.model.Description == null ? "" : $scope.model.Description);
            dataservice.update(formData, function (rs) {
                rs = rs.data;
                if (!rs.Error) {
                    App.toastrSuccess(rs.Title);
                    $uibModalInstance.close();
                }
                else {
                    App.toastrError(rs.Title);
                }
            });
        }
    }

    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('imageId').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError("Định dạng ảnh không hợp lệ!");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    };

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Group" && $scope.model.ExtraFieldsGroup != "" && $scope.model.ExtraFieldsGroup != null && $scope.model.ExtraFieldsGroup != undefined) {
            $scope.errorGroup = false;
        } else {
            $scope.errorGroup = true;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ExtraFieldsGroup == "" || data.ExtraFieldsGroup == null || data.ExtraFieldsGroup == undefined) {
            $scope.errorGroup = true;
            mess.Status = true;
        } else {
            $scope.errorGroup = false;
        }
        return mess;
    }

    function ckEditer() {
        var editor = CKEDITOR.replace('ckEditorItemCategory', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
    }

    setTimeout(function () {
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 500);
});

app.controller('categorycommon', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window, $filter) {
    var vm = $scope;
    $scope.model = {
        CategoryCode: '',
        Type: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/EduCategory/JTableCSC",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CategoryCode = $rootScope.catId;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(200, "#tblDataCategory");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'desc'])
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("SettingID").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.SettingID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.SettingID + ']" ng-change="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"CMS_ITEM_LIST_COL_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ValueSet').withTitle('{{"CMS_ITEM_CURD_LBL_VALUE" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('GroupNote').withTitle('{{"CMS_ITEM_CURD_LBL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.SettingID + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.SettingID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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

    $scope.reload1 = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage1 = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.isEdit = false;
    $scope.addCSC = function () {
        validationSelect($scope.model);
        if ($scope.addCSCform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.CategoryCode = $rootScope.catId;
            if (!$scope.isEdit) {
                dataservice.insertCSC($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.isShow = "1";

                        $scope.reloadNoResetPage1();

                        //$uibModalInstance.close();
                    }
                });
            }
            else {
                dataservice.updateCSC($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.isShow = "1";
                        $scope.read = false;
                        $scope.reloadNoResetPage1();
                        $scope.model = {
                            CategoryCode: '',
                            Type: ''
                        };
                        //$uibModalInstance.close();
                    }
                })
            }
        }
    }

    $scope.read = false;
    $scope.edit = function (id) {
        dataservice.getItemCSC(id, function (rs) {
            rs = rs.data;

            $scope.model = rs.Object;
            $scope.read = true;
            $rootScope.CategoryCode = $scope.model.CategoryCode;
        });
        $scope.isEdit = true;
        $rootScope.catId = id;
    }

    $scope.approve = function (id) {

        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.CMS_ITEM_VALIDATE_STATE_DISPLAY;
                $scope.ok = function () {

                    dataservice.aprrove(id, function (rs) {
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
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.deleteCSC(id, function (rs) {
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
            $scope.reloadNoResetPage1();
        }, function () {
        });
    }

    $scope.initData = function () {

        dataservice.getCatId(function (rs) {
            rs = rs.data;

            $scope.listCatId = rs;
        });
        dataservice.getTypeCMA(function (rs) {
            rs = rs.data;

            $scope.listtTypeCMA = rs;
        });


    };
    $scope.initData();

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "type" && $scope.model.Type != "" && $scope.model.Type != null) {
            $scope.errorType = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Type == "" || data.Type == null) {
            $scope.errorType = true;
            mess.Status = true;
        } else {
            $scope.errorType = false;
        }
        return mess;
    }
    setTimeout(function () {
        //showHideSearch();
    }, 200);

});