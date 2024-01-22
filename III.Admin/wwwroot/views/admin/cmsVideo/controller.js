var ctxfolder = "/views/admin/CMSvideo";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]).directive('customOnChange', function () {
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
            $http.post('/Admin/CMSVideo/GetUser').then(callback);
        },
        getActivityType: function (callback) {
            $http.post('/Admin/CMSVideo/GetActivityType').then(callback);
        },
        getAsset: function (callback) {
            $http.post('/Admin/CMSVideo/GetAsset/').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/CMSVideo/GetItem/', data).then(callback);
        },
        insert: function (data, callback) {
            submitFormUpload('/Admin/CMSVideo/Insert/', data, callback);
        },
        update: function (data, callback) {
            submitFormUpload('/Admin/CMSVideo/Update/', data, callback);

        },
        delete: function (data, callback) {
            $http.post('/Admin/CMSVideo/Delete/' + data).then(callback);
        },
        published: function (data, callback) {
            $http.post('/Admin/CMSVideo/Published/' + data).then(callback);
        },
        getCatId: function (callback) {
            $http.post('/Admin/CMSVideo/GetTreeData/').then(callback);
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
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/;
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
                Title: {
                    required: true,

                },
                FileItem: {
                    required: true,

                },
                Filevideo: {
                    required: true,

                },
                //Ordering: {
                //    required: true,

                //}
            },
            messages: {
                Title: {
                    required: "Tiêu đề không được bỏ trống"
                    //required: caption.CMS_VIDEO_VALIDATE_TITLE,
                },
                FileItem: {
                    // required: "Bạn chưa chon video"
                    required: caption.CMS_VIDEO_VALIDATE_VIDEO,
                },
                Filevideo: {
                    required: "Không được để trống video"
                },
                //Ordering: {
                //    required: "Sắp xếp không được để trống"
                //}
            }
        }
        $rootScope.IsTranslate = true;
    });

    dataservice.getActivityType(function (rs) {
        rs = rs.data;
        $rootScope.ActivityType = rs;
    })
    dataservice.getUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CMSVideo/Translation');
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $filter) {
    var vm = $scope;
    $scope.model = {
        title: '',
        trash: '',
        publish: ''
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CMSVideo/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.title = $scope.model.title;
                d.trash = $scope.model.trash;
                d.publish = $scope.model.publish;
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
                    var Id = data.id;
                    $scope.edit(Id);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('title').withTitle('{{ "CMS_VIDEO_COL_TITLE" | translate }}').renderWith(function (data, type) {
        if (data.length > 70) {
            return data.substr(0, 50) + "...";
        }
        else {
            return data;
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('video').withOption('sClass', 'dataTable-20per').withTitle('{{ "CMS_VIDEO_COL_VIDEO" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('published').withOption('sClass', 'dataTable-w80').withTitle('{{ "Hiển thị" | translate }}').renderWith(function (data, type, full) {

        if (data == "True") {
            return '<span ng-click="published(' + full.id + ')" class="cursor glyphicon glyphicon-ok-sign text-success fs20 pTip-right btn-publish-inline"></span> '
        }
        else {
            return '<span ng-click="published(' + full.id + ')" class="cursor glyphicon glyphicon-ban-circle text-danger fs20 pTip-right btn-publish-inline"></span> '
        }
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ordering').withOption('sClass', 'dataTable-10per').withTitle('{{ "CMS_VIDEO_COL_ORDERING" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('created_date').withOption('sClass', 'dataTable-10per').withTitle('{{ "CMS_VIDEO_COL_CREATED_DATE" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('modified_date').withOption('sClass', 'dataTable-10per').withTitle('{{ "CMS_VIDEO_COL_MODIFIED_DATE" | translate }}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger"></i></a>';
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
    }
    $scope.search = function () {
        reloadData(true);
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
    $scope.published = function (id) {
        dataservice.published(id, function (rs) {
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
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;   //Bạn có chắc chắn muốn xóa ?
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
            size: '25'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () {
        });
    };
    $scope.viewVideo = function (link) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/view-video.html',
            controller: 'view-video',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return link;
                }
            }
        });
        modalInstance.result.then(function (d) {
            
        }, function () {
        });
    }

    $scope.listUsing = [
        {
            Code: true,
            Name: "Hiện tại đang dùng"

        }, {
            Code: false,
            Name: "Đã xóa"
        },


    ];
    $scope.listPublished = [
        { Code: '', Name: 'Tất cả' },
        {
            Code: 1,
            Name: "Hiển thị"

        }, {
            Code: 0,
            Name: "Ẩn"
        },
    ];
    $scope.initData = function () {
    };
    $scope.initData();
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
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.model = {
        FileUpload: '',
        FileName: '',
        description:''
    };
    $scope.model1 = {
        listMember: []
    };
    $scope.loadFile = function (event) {

        var fileVideo = event.target.files;
        $scope.model.FileName = fileVideo[0].name;
        $scope.model.FileType = fileVideo[0].type;
        $scope.$apply();
    };
    $scope.initData = function () {
        dataservice.getAsset(function (rs) {
            rs = rs.data;
            $scope.listAsset = rs;
        });
        dataservice.getCatId(function (rs) {
            rs = rs.data;

            $scope.listCatId = rs;
        });
    };
    $scope.initData();
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
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.submit = function () {
        //validationSelect($scope.model);
        //if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
        if ($scope.addform.validate()) {
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

            var filevideo = document.getElementById("FileItem").files[0]
            if (filevideo != null || filevideo != undefined) {
                var idxFile = filevideo.name.lastIndexOf(".") + 1;
                var extFileVideo = filevideo.name.substr(idxFile, filevideo.name.length).toLowerCase();
                if (extFileVideo != "mp4" && extFileVideo != "avi" && extFileVideo != "mkv" && extFileVideo != "wmv" && extFileVideo != "mpg" && extFileVideo != "mpeg") {
                    App.toastrError(caption.CMS_VIDEO_MSG_VIDEO);
                    return;
                } else {
                    $scope.model.FileUpload = filevideo;
                    $scope.filevideo = filevideo;
                }
            }
            var formData = new FormData();
            formData.append("images", $scope.file);
            formData.append("file", $scope.filevideo);
            formData.append("title", $scope.model.title);
            formData.append("description", $scope.model.description);
            if ($scope.model.category_id !== undefined)
                formData.append("category_id", $scope.model.category_id);
            if ($scope.model.ordering !== undefined && $scope.model.ordering !== null && $scope.model.ordering !== '')
                formData.append("ordering", $scope.model.ordering);
            formData.append("published", $scope.model.published === undefined ? false : $scope.model.published);
            formData.append("FileUpload", $scope.model.FileUpload);
            formData.append("FileCode", $scope.model.FileCode);
            formData.append("FileName", $scope.model.FileName);
            formData.append("FileType", $scope.model.FileType);
            if ($scope.model.post_date !== undefined)
                formData.append("post_date", $scope.model.post_date);
            dataservice.insert(formData, function (rs) {
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    setTimeout(function () {

        $("#post_date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    });
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model1 = {
        listMember: [],
    };
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
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
    $scope.loadFile = function (event) {
        var fileVideo = event.target.files;
        $scope.model.FileName = fileVideo[0].name;
        $scope.model.FileType = fileVideo[0].type;
        $scope.$apply();
    };
    $scope.initData = function () {
        dataservice.getAsset(function (rs) {
            rs = rs.data;
            $scope.listAsset = rs;
        });
        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
            }
        });
        dataservice.getCatId(function (rs) {
            rs = rs.data;
            $scope.listCatId = rs;
        });
    };
    $scope.initData();
    $scope.submit = function () {
        if ($scope.editform.validate()) {
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
            var filevideo = document.getElementById("FileItem").files[0]
            if (filevideo != null || filevideo != undefined) {
                var idxFile = filevideo.name.lastIndexOf(".") + 1;
                var extFileVideo = filevideo.name.substr(idxFile, filevideo.name.length).toLowerCase();
                if (extFileVideo != "mp4" && extFileVideo != "avi" && extFileVideo != "mkv" && extFileVideo != "wmv" && extFileVideo != "mpg" && extFileVideo != "mpeg") {
                    App.toastrError(caption.CMS_VIDEO_MSG_VIDEO);
                    return;
                } else {
                    $scope.model.FileUpload = filevideo;
                    $scope.filevideo = filevideo;
                }
            }
            var formData = new FormData();
            formData.append("id", para);
            formData.append("images", $scope.file);
            formData.append("file", $scope.filevideo);
            formData.append("title", $scope.model.title);
            formData.append("description", $scope.model.description);
            if ($scope.model.category_id !== undefined)
                formData.append("category_id", $scope.model.category_id);
            if ($scope.model.ordering !== undefined && $scope.model.ordering !== null && $scope.model.ordering !== '')
                formData.append("ordering", $scope.model.ordering);
            formData.append("published", $scope.model.published === undefined ? false : $scope.model.published);
            formData.append("FileUpload", $scope.model.FileUpload);
            formData.append("FileCode", $scope.model.FileCode);
            formData.append("FileName", $scope.model.FileName);
            formData.append("FileType", $scope.model.FileType);
            if ($scope.model.post_date !== undefined)
                formData.append("post_date", $scope.model.post_date);
            dataservice.update(formData, function (rs) {
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
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
    setTimeout(function () {

        $("#post_date").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        });
    });
});
app.controller('view-video', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.link = para;
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200);
});
