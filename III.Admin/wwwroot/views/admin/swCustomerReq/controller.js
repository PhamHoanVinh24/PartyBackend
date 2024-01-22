var ctxfolder = "/views/admin/swCustomerReq";
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
        };

        $http(req).then(callback);
    };

    return {
        insertSwCustomerReq: function (data, callback) {
            $http.post('/Admin/SwCustomerReq/Insert/', data).then(callback);
        },
        updateSwCustomerReq: function (data, callback) {
            submitFormUpload('/Admin/SwCustomerReq/Update/', data, callback);
        },
        deleteSwCustomerReq: function (data, callback) {
            $http.post('/Admin/SwCustomerReq/Delete', data).then(callback);
        },
        getTreeDataParent: function (data, callback) {
            $http.post('/Admin/SwCustomerReq/GetTreeDataParent', data).then(callback);
        },
        getExtraFieldGroup: function (callback) {
            $http.post('/Admin/CMSExtraField/GetExtraFieldGroup').then(callback);
        },
        GetTreeInNode: function (data, callback) {
            $http.post('/Admin/swModule/GetTreeInNode?parentId=' + data).then(callback);
        },
        getListModuleByReqCode: function (reqCode, callback) {
            $http.post('/Admin/SwCustomerReq/GetListModuleByReqCode?reqcode=' + reqCode).then(callback);
        }
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
            // var partternCode = /^[a-zA-Z0-9]+[^Đđ!@#$%^&*<>?\s]*$/;
            // var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (data.MonthTried == null || data.MonthTried == '') {
                mess.Status = true;
                $rootScope.errorMonthTried = true
            }
            else {
                $rootScope.errorMonthTried = false
            }
            return mess;
        }

        $rootScope.validationOptions = {
            rules: {
                CompanyName: {
                    required: true,
                },
                requestTitle: {
                    required: true,
                },
                Tel: {
                    required: true,
                },
                Email: {
                    required: true,
                },
                MonthTried: {
                    required: true,
                },
            },
            messages: {
                CompanyName: {
                    required: "Tên công ty không được bỏ trống ",
                },
                requestTitle: {
                    required: "Tiêu đề yêu cầu khách hàng không được bỏ trống ",
                },
                Tel: {
                    required: "Số điện thoại không được bỏ trống ",
                },
                Email: {
                    required: "Email không được bỏ trống ",
                },
                MonthTried: {
                    required: "Vui lòng chọn thời gian thuê",
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


app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window, $filter) {
    var vm = $scope;
    $scope.model = {
        Title: '',
        PostFromDate: '',
        PostToDate: '',
        CreFromDate: '',
        CreToDate: '',
        Category: '',
        Status: '',
        TypeItem: '',
    };
    $scope.ListStatus = [{
        Name: 'Chưa duyệt',
        Code: 'Chưa duyệt'
    },
    {
        Name: 'đã duyệt',
        Code: 'đã duyệt'
    }]
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.searchModel = {
        CompanyName: '',
        ReqCode: '',
        Title: '',
        ModuleCode: '',
        Status: '',
        FromDate: '',
        ToDate: ''
    }

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/SwCustomerReq/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CompanyName = $scope.searchModel.CompanyName
                d.ReqCode = $scope.searchModel.ReqCode
                d.Title = $scope.searchModel.Title
                d.ModuleCode = $scope.searchModel.ModuleCode
                d.Status = $scope.searchModel.Status
                d.FromDate = $scope.searchModel.FromDate
                d.ToDate = $scope.searchModel.ToDate
            },
            complete: function () {
                App.unblockUI("#contentMain");
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                var self = $(this).parent();
                if ($(self).hasClass('selected')) {
                    $(self).removeClass('selected');
                } else {
                    $('#tblDataEmployee').DataTable().$('tr.selected').removeClass('selected');
                    $(self).addClass('selected');
                    $scope.add(data);
                }
                $scope.$apply();
            });
        });

    vm.dtColumns = [];

    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withOption('sClass', 'w30').withTitle(titleHtml).renderWith(function (data, type) {
        $scope.selected[data] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + data + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CompanyName').withOption('sClass', 'nowrap dataTable-40per').withTitle('{{"Công ty" | translate}}').renderWith(function (data, type, full) {
        return data + '<br><span style="font-weight:400">Email: ' + full.Email + '</span>' + '<br><span                 style="font-weight:400">Sdt: ' + full.Tel + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Noted').withOption('sClass', 'nowrap dataTable-30per').withTitle('{{"Ghi chú" | translate}}').renderWith(function (data, type) {

        return data;

    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Domain').withOption('sClass', 'nowrap dataTable-30per').withTitle('{{"Trang web" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('requestTitle').withOption('sClass', 'w100 nowrap dataTable-30per').withTitle('{{"Yêu cầu" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MonthTried').withOption('sClass', 'nowrap dataTable-30per').withTitle('{{"MonthTried" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ModuleCount').withOption('sClass', 'nowrap dataTable-30per').withTitle('{{"Số module" | translate}}').renderWith(function (data, type, full) {
        return '<div ng-click="add(' + "'" + full.ReqCode + "'" + ')">' + data + '</div>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap dataTable-w80').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        return '<button title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.fieldID + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.fieldID + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
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
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.initData = function () {
        dataservice.getCatId(function (rs) {
            rs = rs.data;

            $scope.listModuleId = rs;
        });

    };


    $scope.add = function (data) {
        $rootScope.data = data;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '90'
        });
        modalInstance.result.then(function (d) {
            reloadData(true);
        }, function () { });
    };

    $scope.upload = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/word.html',
            controller: 'word',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            reloadData(true);
        }, function () { });
        console.log("ok");
    };

    setTimeout(function () {
    }, 200);
    $("#PostFromDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#PostToDate').datepicker('setStartDate', maxDate);
    });
    $("#PostToDate").datepicker({
        inline: false,
        autoclose: true,
        format: "dd/mm/yyyy",
        fontAwesome: true,
    }).on('changeDate', function (selected) {
        var maxDate = new Date(selected.date.valueOf());
        $('#PostFromDate').datepicker('setEndDate', maxDate);
    });
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter, $window) {
    $scope.model = {
        Background: $rootScope.data.Background,
        CompanyName: $rootScope.data.CompanyName,
        Domain: $rootScope.data.Domain,
        Email: $rootScope.data.Email,
        Id: $rootScope.data.Id,
        Logo: $rootScope.data.Logo,
        MonthTried: $rootScope.data.MonthTried,
        Noted: $rootScope.data.Noted,
        ReqCode: $rootScope.data.ReqCode,
        Tel: $rootScope.data.Tel,
        requestTitle: $rootScope.data.requestTitle,
        Slogan: $rootScope.data.Slogan,
    }
    $scope.initData = function () {
        console.log($rootScope.data);
        dataservice.getListModuleByReqCode($rootScope.data.ReqCode, function (rs) {
            rs = rs.data;
            $scope.listModuleSelected = rs.Object
            console.log($scope.listModuleSelected);
        })

    }
    $scope.initData()
    $scope.cancel = function () {
        $uibModalInstance.close();
    }

    $scope.submit = function () {
        var a = $rootScope.checkData($scope.model);
        $scope.errorMonthTried = $rootScope.errorMonthTried
        if ($scope.addform.validate() && a.Status == false) {

            var FileLogo = document.getElementById("FileLogo").files[0]
            if (FileLogo != undefined) {
                var idxDot = FileLogo.name.lastIndexOf(".") + 1;
                var extFile = FileLogo.name.substr(idxDot, FileLogo.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }

            var FileBackground = document.getElementById("FileBackground").files[0]
            if (FileBackground != undefined) {
                var idxDot = FileBackground.name.lastIndexOf(".") + 1;
                var extFile = FileBackground.name.substr(idxDot, file.name.length).toLowerCase();
                if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                    App.toastrError(caption.ADM_USER_VALIDATE_ITEM_IMAGE);
                    return;
                }
            }
            const formData = new FormData();
            formData.append('Slogan', $scope.model.Slogan);
            formData.append('Domain', $scope.model.Domain);
            formData.append('CompanyName', $scope.model.CompanyName);
            formData.append('requestTitle', $scope.model.requestTitle);
            formData.append('MonthTried', $scope.model.MonthTried);
            formData.append('Tel', $scope.model.Tel);
            formData.append('Email', $scope.model.Email);
            formData.append('Noted', $scope.model.Noted);
            formData.append('ReqCode', $scope.model.ReqCode);
            formData.append('Logo', FileLogo != undefined ? FileLogo : null);
            formData.append('Background', FileBackground != undefined ? FileBackground : null);
            formData.append('CheckNode', null);
            dataservice.updateSwCustomerReq(formData, function (rs) {
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
    }
    $scope.checkAndOpenFile = function () {
        var filePath = '/uploads/repository/' + $scope.model.ReqCode + '.xlsx'
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('File không tồn tại hoặc có lỗi khi truy cập.');
                }
                return response.blob();
            })
            .then(blobData => {
                // Kiểm tra loại MIME để đảm bảo rằng đây là file Excel
                if (blobData.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    openFile(filePath);
                } else {
                    throw new Error('Không tìm thấy file Excel.');
                }
            })
            .catch(error => {
                alert(error.message);
            });
    }

    function openFile(filePath) {
        // Mở file hoặc thực hiện các hành động khác tại đây
        window.open(filePath, '_blank');
    }
    //load ảnh 
    $scope.loadLogo = function () {
        var fileuploader = angular.element("#FileLogo");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('Logo').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError("{{ 'CMS_MSG_ERR_IMG' | translate }}");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }

    $scope.ListMonthTried = [{
        name: "Chọn",
        code: ''
    }, {
        name: "Tháng",
        code: 'Tháng'
    }, {
        name: "Quý",
        code: 'Quý'
    }, {
        name: "Năm",
        code: 'Năm'
    }, {
        name: "MuaHẳn",
        code: 'Mua Hẳn'
    }]
    $scope.loadBackground = function () {
        var fileuploader = angular.element("#FileBackground");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('Background').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError("{{ 'CMS_MSG_ERR_IMG' | translate }}");
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.treeData = [];
    $scope.ProjectCode = '';
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
                        var title = result[i].Title;
                        var data = {
                            id: result[i].Code,
                            parent: 'root',
                            title: title,
                            text: title,
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: {
                                selected: $scope.listModuleSelected.some(item => item.ModuleCode
                                    === result[i].Code), opened: true
                            }
                        }
                        console.log(result[i]);
                        $scope.treeData.push(data);
                    } else {
                        var title = result[i].Code + ' - ' + result[i].Title;
                        var data = {
                            id: result[i].Code,
                            parent: result[i].ParentCode,
                            title: title,
                            text: title,
                            catId: result[i].Id,
                            catCode: result[i].Code,
                            catName: result[i].Title,
                            catParent: result[i].ParentCode,
                            listRepository: result[i].ListRepository,
                            state: {
                                selected: $scope.listModuleSelected.some(item => item.ModuleCode
                                    === result[i].Code), opened: true
                            }
                        }
                        $scope.treeData.push(data);
                    }
                }
                App.unblockUI("#contentMainRepository");
            }
        });
    }
    // // code khi select 1 node
    // $scope.selectNodeRepository = function (e, data) {
    //     var listSelect = [];
    //     var idCurrentNode = data.node.id;
    //     var codeCurrentNote = data.node.catCode;
    //     if (nodeBefore != idCurrentNode) {
    //         $("#" + nodeBefore + "_anchor").removeClass('bold');

    //         nodeBefore = idCurrentNode;
    //         $scope.recentFile = false;
    //         var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
    //         // for (var i = 0; i < listNoteSelect.length; i++) {
    //         //     listSelect.push(listNoteSelect[i].original.catCode);
    //         // }
    //         // $scope.modelCardJob.ListItem = listSelect;
    //         //$scope.reload();
    //     }
    //     else {
    //         $scope.recentFile = false;
    //         listSelect = [];
    //         $("#" + idCurrentNode + "_anchor").addClass('bold');
    //         listSelect.push(codeCurrentNote);
    //         $scope.modelCardJob.ListItem = listSelect;
    //         //$scope.reload();
    //     }
    // }
    // // code khi bỏ select 1 node
    // $scope.deselectNodeRepository = function (e, data) {
    //     $scope.recentFile = false;
    //     var listSelect = [];
    //     var listNoteSelect = $scope.treeInstance.jstree(true).get_checked(true);
    //     if (listNoteSelect.length > 0) {
    //         for (var i = 0; i < listNoteSelect.length; i++) {
    //             listSelect.push(listNoteSelect[i].original.catCode);
    //             dataserviceProject.getTreeInNode(listNoteSelect[i].id, function (rs) {
    //                 rs = rs.data;
    //                 if (rs.length > 0) {
    //                     for (var i = 0; i < rs.length; i++) {
    //                         listSelect.push(rs[i].Code);
    //                     }
    //                 }
    //                 $scope.modelCardJob.ListItem = listSelect;
    //                 //$scope.reload();
    //             })
    //         }
    //     } else {
    //         $scope.modelCardJob.ListItem = listSelect;
    //         //$scope.reload();
    //     }
    // }
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

    $scope.selectObjectType = function (objectType) {

    }

    $scope.selectObjectCode = function (item) {

    }

    $scope.resetObjectType = function () {

    }

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
        //initAutocomplete();
    }, 200);
});
app.controller('word', function ($scope, $compile, $uibModal, $location, $filter, $uibModalInstance, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    // $scope.isEdit = false;
    // //wflow
    // $scope.modelWf = {
    //     WorkflowCode: "",
    //     ObjectType: "DECISION_END_CONTRACT",
    //     ObjectInst: "",
    // };
    // $scope.model1 = {
    //     ListStatus: []
    // };
    // $scope.model = {
    //     Currency: 'VND'
    // };
    // $scope.indexProduct = -1;
    // $scope.changeUnit = function (data) {
    //dataserviceEndContract.getUserDepartment(data, function (rs) {
    //    rs = rs.data;
    //    $scope.lstUserinDpt = rs;
    //    if (rs != null && rs != undefined && rs != "") {
    //        var all = {
    //            Code: "",
    //            Name: caption.COM_TXT_ALL
    //        }
    //        $scope.lstUserinDpt.unshift(all)
    //    }
    //})
    //}
    //$scope.changeEmployee = function (data) {
    //    for (var i = 0; i < $scope.lstUserinDpt.length; i++) {
    //        if ($scope.lstUserinDpt[i].Code == data) {
    //            $scope.model.NewRole = $scope.lstUserinDpt[i].OldRole;
    //        }
    //    }
    //}
    //$scope.checkloop = function () {
    //    $scope.ListEmp = [];
    //}
    let inputString = "- Họ và tên:";
    let result = inputString.slice("- Họ và tên:".length).trim();
    console.log(result); // Kết quả: ""

    $scope.uploadFile = async function () {
        var file = document.getElementById("FileItem").files[0];
        if (file == null || file == undefined || file == "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var formdata = new FormData();
            formdata.append("files", file);

            var requestOptions = {
                method: 'POST',
                body: formdata,
                redirect: 'follow'
            };

            var resultImp = await fetch("/Admin/SwCustomerReq/Import", requestOptions);
            var txt = await resultImp.text();
            //  handleTextUpload(txt);
            handleTextUpload2(txt)
        }
    };
    $scope.fileNameChanged = function () {
        $scope.openExcel = true;
        setTimeout(function () {
            $scope.$apply();
        });
    }
    function loadDate() {
        //$("#Decisiondate").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //});
        //$("#planDate").datepicker({
        //    inline: false,
        //    autoclose: true,
        //    format: "dd/mm/yyyy",
        //    fontAwesome: true,
        //    todayBtn: true,
        //    todayHighlight: true
        //});
    }
    function handleTextUpload(txt) {
        $scope.defaultRTE.value = txt;
        $scope.JsonkeySection = [];
        $scope.JSONvalueSection = [];
        setTimeout(function () {
            var listPage = document.querySelectorAll(".Section0 > div > table");
            // tách thông tin page[0]: lí lịch người xin vào đảng
            /*var listTagpinPage0 = listPage[0].querySelectorAll("tbody > tr > td > p");
    
            //loc lay cac the p sao cho the p chua van ban và chứa dấu : sau đó lưu vào m
            var objPage0 = Array.from(listTagpinPage0).filter(function (element) {
                // Kiểm tra xem thuộc tính của thẻ <p> có chứa văn bản không
                return element.textContent.trim().length > 0 && /:/.test(element.textContent);
            });
            var innerTextArray = Array.from(objPage0).map(function (element) {
                return element.innerText.split(':');
            });*///để tạm đây fomat sau

            //Page2 Lịch sử bản thân
            var listTagpinPage1 = listPage[1].querySelectorAll("tbody > tr > td > p");
            var objPage1 = Array.from(listTagpinPage1).filter(function (element) {
                // Kiểm tra xem thuộc tính của thẻ <p> có chứa văn bản không
                var textContent = element.textContent.trim();
                return textContent.length > 0 && /\+/.test(textContent);
            });

            var PersonalHistory = [];//đối tượng lưu thông tin lịch sử bản thân dưới bằng mảng
            for (let i = 0; i < objPage1.length; i++) {
                var PersonHis = {};
                // Sửa lỗi ở đây, sử dụng indexOf thay vì search và sửa lỗi về cú pháp của biểu thức chấm phẩy
                PersonHis['time'] = {
                    begin: objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') - 7, 7).trim(),
                    end: objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') + 1, 7).trim(),
                };
                // Sửa lỗi ở đây, sử dụng split(':') để tách thời gian và thông tin
                PersonHis['infor'] = objPage1[i].innerText.split(':')[1];
                PersonalHistory.push(PersonHis);
            }
            console.log('PersonalHistory', PersonalHistory)
            //Page3 Những nơi công tác và chức vụ đã qua

            /*var datapage2 = Array.from(listPage[2].querySelectorAll('tr:nth-child(2) > td > p'))
                .filter(function (element) {
                    return element.textContent.trim().length > 0;
                })
                .map(function (element) {
                    return element.innerText.trim();
                });*/

            var datapage2 = Array.from(listPage[2].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP2s = [];
            datapage2.forEach(function (datapage2Element) {
                var pInTr = Array.from(datapage2Element.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });;
                pElementP2s.push(pInTr);
            })
            var BusinessNDuty = [];
            for (let i = 0; i < pElementP2s.length; i++) {
                var begin = pElementP2s[i][0].substr(pElementP2s[i][0].indexOf('-') - 2, 7);
                var end = pElementP2s[i][0].substr(pElementP2s[i][0].lastIndexOf('-') - 2, 7);
                var BusinessNDutyObj = {
                    time: {
                        begin: begin,
                        end: end
                    },
                    business: pElementP2s[i][1],
                    duty: pElementP2s[i][2]
                };
                BusinessNDuty.push(BusinessNDutyObj);
            }
            console.log('BusinessNDuty', BusinessNDuty)
            //
            var data = Array.from(listPage[3].querySelectorAll('td > p')).filter(function (ele) {
                return ele.innerText.trim().length > 0;
            }).map(function (element) {
                return element.innerText.trim();
            });
            function isTime(e) {
                return (e.includes('Ngày') && e.includes('tháng') && e.includes('năm')) ? true : false;
            }
            var HistoricalFeatures = [];
            for (let i = 0; i < data.length; i++) {
                var obj = {
                    time: null,
                    content: null
                };
                if (isTime(data[i])) {
                    obj.time = data[i].substr(data[i].indexOf("Ngày") + 4, 4).trim() + '-' +
                        data[i].substr(data[i].indexOf("tháng") + 5, 4).trim() + '-' +
                        data[i].substr(data[i].indexOf("năm") + 4, 5),
                        obj.content = data[i + 1];
                }
                if (obj.time != null && obj.content != null) {
                    HistoricalFeatures.push(obj);
                }
            }
            console.log("HistoricalFeatures:", HistoricalFeatures);
            //Page 5 Di nuoc nguoai
            var datapage5 = Array.from(listPage[5].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP5s = [];
            datapage5.forEach(function (datapage5Elemnt) {
                var pInTr = Array.from(datapage5Elemnt.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP5s.push(pInTr);
            })
            var GoAboard = [];
            for (let i = 0; i < pElementP5s.length; i++) {

                var GoAboardObj = {

                    purpose: pElementP5s[i][1],
                    country: pElementP5s[i][2]
                };
                GoAboard.push(GoAboardObj);
            }
            console.log('GoAboard', GoAboard)
            //Page6 Khen thuong
            var datapage6 = Array.from(listPage[6].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP6s = [];
            datapage6.forEach(function (datapage6Elemnt) {
                var pInTr = Array.from(datapage6Elemnt.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP6s.push(pInTr);
            })
            var Laudatory = [];
            for (let i = 0; i < pElementP6s.length; i++) {

                var obj = {
                    time: pElementP6s[i][0].trim(),
                    officialReason: pElementP6s[i][1],
                    grantDecision: pElementP6s[i][2]
                };
                Laudatory.push(Laudatory);
            }
            console.log('Laudatory', Laudatory)
            //Page7 ki luat
            //phan van giua 2 truong hop: neu bi ki luat thi lay binh thuonng con neeu ko bij thi se de trong
            var datapage7 = Array.from(listPage[7].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP7s = [];
            datapage7.forEach(function (datapage7Elemnt) {
                var pInTr = Array.from(datapage7Elemnt.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP7s.push(pInTr);
            })
            var Disciplined = [];
            for (let i = 0; i < pElementP7s.length; i++) {
                var DisciplinedObj = {
                    time: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][0].substr(pElementP6s[i][0].indexOf('-') - 2, 7) : 'None',
                    officialReason: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][1] : "None",
                    grantDecision: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][2] : "None",
                };
                Disciplined.push(DisciplinedObj);
            }
            console.log('Disciplined', Disciplined)
            //Page8 Hoan canh gia dinh
            var datapage8 = Array.from(listPage[8].querySelectorAll("tr:first-child>td"));
            var pE8 = [];
            datapage8.forEach(function (datapage8Elemnt) {
                var pInTr = Array.from(datapage8Elemnt.querySelectorAll("p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pE8.push(pInTr);
            })
            $scope.Relationship = [];
            let RelationshipIndex = 0;
            for (let y = 0; y < pE8.length; y++) {
                for (let i = 0; i < pE8[y].length; i++) {
                    if (pE8[y][i].startsWith('- Họ và tên:')) {
                        $scope.Relationship[RelationshipIndex].Name = pE8[y][i].slice(('- Họ và tên:').length).trim()
                    }
                    if (pE8[y][i].startsWith('- Năm sinh:')) {
                        let regex = /^(\d{4})-(\d{4})(?:\(([^)]*)\))?$/;
                        let match = pE8[y][i].slice(('- Năm sinh:').length).trim().match(regex);

                        if (match) {
                            $scope.Relationship[RelationshipIndex].Year = {
                                YearBirth: match[1],
                                YearDeath: match[2],
                                Reason: match[3] ? match[3].trim() : ''  // Kiểm tra xem có thông tin lý do không
                            };
                        }
                    }
                    if (pE8[y][i].startsWith("- Quê quán:")) {
                        $scope.Relationship[RelationshipIndex].HomeTown = pE8[y][i].slice(('- Quê quán:').length).trim()
                    }
                    if (pE8[y][i].startsWith("- Nơi cư trú:")) {
                        $scope.Relationship[RelationshipIndex].Residence = pE8[y][i].slice(('- Nơi cư trú:').length).trim()
                    }
                    if (pE8[y][i].startsWith("- Nghề nghiệp:")) {
                        $scope.Relationship[RelationshipIndex].Job = pE8[y][i].slice(('- Nghề nghiệp:').length).trim()
                    }
                    if (pE8[y][i].startsWith("- Là đảng viên")) {
                        $scope.Relationship[RelationshipIndex].ClassComposition = pE8[y][i].slice(('-').length).trim()
                        $scope.Relationship[RelationshipIndex].PartyMember = true
                    }
                    if (pE8[y][i].startsWith("- Quá trình công tác:")) {
                        // let regex = /^(\d{4})-(.*)$/;

                        $scope.Relationship[RelationshipIndex].WorkingProcess = [];
                        for (j = i + 1; !pE8[y][j].startsWith('-') && !pE8[y][j].startsWith('*'); j++) {
                            let inputString = pE8[y][j];
                            //let match = inputString.match(regex);

                            //if (match) {
                            //   let resultObject = {
                            //     Year: match[1],
                            //     Job: match[2].trim()  // Loại bỏ khoảng trắng ở đầu và cuối của công việc
                            //   };
                            //  $scope.Relationship[RelationshipIndex].WorkingProcess.push(resultObject);
                            $scope.Relationship[RelationshipIndex].WorkingProcess.push(inputString);
                            i = j;
                            //}
                        }
                    }
                    if (pE8[y][i].startsWith("- Thái độ chính trị:")) {
                        $scope.Relationship[RelationshipIndex].PoliticalAttitude = [];
                        for (j = i + 1; pE8[y][j].startsWith('+'); j++) {
                            $scope.Relationship[RelationshipIndex].PoliticalAttitude.push(pE8[y][j].slice(1).trim());
                            i = j;
                        }
                    }
                    if ((pE8[y][i].startsWith('*'))) {
                        let regex = /^\*(.+?)\s:$/;
                        let match = pE8[y][i].match(regex);

                        if (match) {
                            let relationship = match[1];
                            RelationshipIndex = $scope.Relationship.length;
                            $scope.Relationship[RelationshipIndex] = {
                                Relation: relationship.trim(),
                                ClassComposition: '',
                                PartyMember: false,
                            }
                        }
                        if (pE8[y][i] == "* Anh, chị, em ruột: khai đầy đủ anh chị em"
                            || pE8[y][i] == "* Anh, chị, em ruột của vợ (chồng):"
                            || pE8[y][i] == "* Các con ruột và con nuôi có đăng ký hợp pháp : khai đầy đủ các con") {
                            for (let a = i + 1; !pE8[y][a].startsWith("*") && a < pE8[y].length - 1; a++) {
                                let regex = /^(\d+)\.\s(.+)$/;
                                let match = pE8[y][a].match(regex);

                                if (match) {
                                    let relationship = match[2];
                                    RelationshipIndex = $scope.Relationship.length;
                                    $scope.Relationship[RelationshipIndex] = {
                                        Relation: relationship.trim(),
                                        ClassComposition: '',
                                        PartyMember: false,
                                    }
                                }
                                if (pE8[y][a].startsWith('- Họ và tên:')) {
                                    $scope.Relationship[RelationshipIndex].Name = pE8[y][a].slice(('- Họ và tên:').length).trim()
                                }
                                if (pE8[y][a].startsWith('- Năm sinh:')) {
                                    let regex = /^(\d{4})-(\d{4})(?:\(([^)]*)\))?$/;
                                    let match = pE8[y][a].slice(('- Năm sinh:').length).trim().match(regex);

                                    if (match) {
                                        $scope.Relationship[RelationshipIndex].Year = {
                                            YearBirth: match[1],
                                            YearDeath: match[2],
                                            Reason: match[3] ? match[3].trim() : ''  // Kiểm tra xem có thông tin lý do không
                                        };
                                    }
                                }
                                if (pE8[y][a].startsWith("- Quê quán:")) {
                                    $scope.Relationship[RelationshipIndex].HomeTown = pE8[y][a].slice(('- Quê quán:').length).trim()
                                }
                                if (pE8[y][a].startsWith("- Nơi cư trú:")) {
                                    $scope.Relationship[RelationshipIndex].Residence = pE8[y][a].slice(('- Nơi cư trú:').length).trim()
                                }
                                if (pE8[y][a].startsWith("- Nghề nghiệp:")) {
                                    $scope.Relationship[RelationshipIndex].Job = pE8[y][a].slice(('- Nghề nghiệp:').length).trim()
                                }
                                if (pE8[y][a].startsWith("- Là đảng viên")) {
                                    $scope.Relationship[RelationshipIndex].ClassComposition = pE8[y][a].slice(('-').length).trim()
                                    $scope.Relationship[RelationshipIndex].PartyMember = true
                                }
                                if (pE8[y][a].startsWith("- Quá trình công tác:")) {
                                    let regex = /^(\d{4})-(.*)$/;

                                    $scope.Relationship[RelationshipIndex].WorkingProcess = [];
                                    for (j = a + 1; !pE8[y][j].startsWith('-'); j++) {
                                        let inputString = pE8[y][j];
                                        // let match = inputString.match(regex);

                                        // if (match) {
                                        // let resultObject = {
                                        //     Year: match[1],
                                        //     Job: match[2].trim()  // Loại bỏ khoảng trắng ở đầu và cuối của công việc
                                        // };
                                        // $scope.Relationship[RelationshipIndex].WorkingProcess.push(resultObject);
                                        // }
                                        $scope.Relationship[RelationshipIndex].WorkingProcess.push(inputString);
                                        i = j;
                                    }
                                }
                                if (pE8[y][a].startsWith("- Thái độ chính trị:")) {
                                    $scope.Relationship[RelationshipIndex].PoliticalAttitude = [];
                                    for (j = a + 1; pE8[y][j].startsWith('+'); j++) {
                                        $scope.Relationship[RelationshipIndex].PoliticalAttitude.push(pE8[y][j].slice(1).trim());
                                        i = j;
                                    }
                                }
                                i = a;
                            }
                        }
                    }
                }
            }

            console.log("Relationship:", $scope.Relationship);
            //Page 9 Tự nhận xét
            var SelfComment = {
                context: Array.from(listPage[9].querySelectorAll("tr:first-child > td > p:first-child"))[0].innerText
            };
            //Page 9 ket don
            var datapage9 = Array.from(listPage[9].querySelectorAll("tr:last-child > td > p")).filter(function (element) {
                return element.innerText.trim().length > 0 && element.innerText.includes("ngày") && element.innerText.includes("tháng") && element.innerText.includes("năm");
            }).map(function (element) {
                return element.innerText.trim();
            });
            var PlaceCreatedTime = {
                place: datapage9[0].substring(0, datapage9[0].indexOf(',')),
                createdTime: datapage9[0].substring(datapage9[0].indexOf('ngày') + 4, datapage9[0].indexOf('tháng')).trim() + '-'
                    + datapage9[0].substring(datapage9[0].indexOf('tháng') + 5, datapage9[0].indexOf('năm')).trim() + '-'
                    + datapage9[0].substring(datapage9[0].indexOf('năm') + 4).trim()
            };
            //tao doi tuong Json
            var JSONobj = {
                create: PlaceCreatedTime,
                PersonalHistory: PersonalHistory,
                BusinessNDuty: BusinessNDuty,
                GoAboard: GoAboard,
                Disciplined: Disciplined,
                SelfComment: SelfComment
            }

            console.log("PlaceCreatedTime", JSONobj);
            JSON.stringify(JSONobj)
        }, 100);
    }
    // function handleTextUpload2(txt) {
    //     $scope.infUser = {
    //         LevelEducation: {
    //             Undergraduate: [],
    //             PoliticalTheory: [],
    //             ForeignLanguage: [],
    //             It: [],
    //             MinorityLanguage: []
    //         }
    //     }
    //     $scope.defaultRTE.value = txt;
    //     setTimeout(function () {
    //         var listPage = document.querySelectorAll(".Section0 > div > table");
    //         // tách thông tin page[0]: lí lịch người xin vào đảng
    //         /*var listTagpinPage0 = listPage[0].querySelectorAll("tbody > tr > td > p");
    
    //         //loc lay cac the p sao cho the p chua van ban và chứa dấu : sau đó lưu vào m
    //         var objPage0 = Array.from(listTagpinPage0).filter(function (element) {
    //             // Kiểm tra xem thuộc tính của thẻ <p> có chứa văn bản không
    //             return element.textContent.trim().length > 0 && /:/.test(element.textContent);
    //         });
    //         var innerTextArray = Array.from(objPage0).map(function (element) {
    //             return element.innerText.split(':');
    //         });*///để tạm đây fomat sau

    //         //Page2 Lịch sử bản thân
    //         var listTagpinPage1 = listPage[1].querySelectorAll("tbody > tr > td > p");
    //         var objPage1 = Array.from(listTagpinPage1).filter(function (element) {
    //             // Kiểm tra xem thuộc tính của thẻ <p> có chứa văn bản không
    //             var textContent = element.textContent.trim();
    //             return textContent.length > 0 && /\+/.test(textContent);
    //         });

    //         var PersonalHistory = [];//đối tượng lưu thông tin lịch sử bản thân dưới bằng mảng
    //         for (let i = 0; i < objPage1.length; i++) {
    //             var PersonHis = {};
    //             // Sửa lỗi ở đây, sử dụng indexOf thay vì search và sửa lỗi về cú pháp của biểu thức chấm phẩy
    //             PersonHis['time'] = {
    //                 begin: objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') - 7, 7).trim(),
    //                 end: objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') + 1, 7).trim(),
    //             };
    //             // Sửa lỗi ở đây, sử dụng split(':') để tách thời gian và thông tin
    //             PersonHis['infor'] = objPage1[i].innerText.split(':')[1];
    //             PersonalHistory.push(PersonHis);
    //         }
    //         console.log('PersonalHistory', PersonalHistory)
    //         //Page3 Những nơi công tác và chức vụ đã qua

    //         /*var datapage2 = Array.from(listPage[2].querySelectorAll('tr:nth-child(2) > td > p'))
    //             .filter(function (element) {
    //                 return element.textContent.trim().length > 0;
    //             })
    //             .map(function (element) {
    //                 return element.innerText.trim();
    //             });*/

    //         var datapage2 = Array.from(listPage[2].querySelectorAll("tr:nth-child(n+2)"));
    //         var pElementP2s = [];
    //         datapage2.forEach(function (datapage2Element) {
    //             var pInTr = Array.from(datapage2Element.querySelectorAll("td > p")).filter(function (ele) {
    //                 return ele.innerText.trim().length > 0;
    //             }).map(function (element) {
    //                 return element.innerText.trim();
    //             });;
    //             pElementP2s.push(pInTr);
    //         })
    //         var BusinessNDuty = [];
    //         for (let i = 0; i < pElementP2s.length; i++) {
    //             var begin = pElementP2s[i][0].substr(pElementP2s[i][0].indexOf('-') - 2, 7);
    //             var end = pElementP2s[i][0].substr(pElementP2s[i][0].lastIndexOf('-') - 2, 7);
    //             var BusinessNDutyObj = {
    //                 time: {
    //                     begin: begin,
    //                     end: end
    //                 },
    //                 business: pElementP2s[i][1],
    //                 duty: pElementP2s[i][2]
    //             };
    //             BusinessNDuty.push(BusinessNDutyObj);
    //         }
    //         console.log('BusinessNDuty', BusinessNDuty)

    //         //pag4: những lớp đào tạo bồi dưỡng đã qa
    //         var datapage4 = Array.from(listPage[4].querySelectorAll('tr:nth-child(n+2)'));
    //         var pElementP4s = [];
    //         datapage4.forEach(function (e) {
    //             var pInTr = Array.from(e.querySelectorAll("td > p")).filter(function (ele) {
    //                 return ele.innerText.trim().length > 0;
    //             }).map(function (element) {
    //                 return element.innerText.trim();
    //             });
    //             pElementP4s.push(pInTr);
    //         });

    //         console.log(pElementP4s)
    //         var PassedTrainingClasses = [];
    //         for (let i = 0; i < pElementP4s.length; i++) {
    //             var obj = {
    //                 school: pElementP4s[i][0],
    //                 class: pElementP4s[i][1],
    //                 time: {
    //                     begin: pElementP4s[i][2].substring(0, pElementP4s[i][2].indexOf('đến')),
    //                     end: pElementP4s[i][2].substring(pElementP4s[i][2].lastIndexOf('đến') + 4).trim()
    //                 },
    //                 business: pElementP4s[i][1]
    //             };
    //             PassedTrainingClasses.push(obj);
    //         }
    //         console.log('PassedTrainingClasses', PassedTrainingClasses)

    //         // console.log(data)
    //         //
    //         var data = Array.from(listPage[3].querySelectorAll('td > p')).filter(function (ele) {
    //             return ele.innerText.trim().length > 0;
    //         }).map(function (element) {
    //             return element.innerText.trim();
    //         });
    //         function isTime(e) {
    //             return (e.includes('Ngày') && e.includes('tháng') && e.includes('năm')) ? true : false;
    //         }
    //         var HistoricalFeatures = [];
    //         for (let i = 0; i < data.length; i++) {
    //             var obj = {
    //                 time: null,
    //                 content: null
    //             };
    //             if (isTime(data[i])) {
    //                 obj.time = data[i].substr(data[i].indexOf("Ngày") + 4, 4).trim() + '-' +
    //                     data[i].substr(data[i].indexOf("tháng") + 5, 4).trim() + '-' +
    //                     data[i].substr(data[i].indexOf("năm") + 4, 5),
    //                     obj.content = data[i + 1];
    //             }
    //             if (obj.time != null && obj.content != null) {
    //                 HistoricalFeatures.push(obj);
    //             }
    //         }
    //         console.log("HistoricalFeatures:", HistoricalFeatures);
    //         //Page 5 Di nuoc nguoai
    //         var datapage5 = Array.from(listPage[5].querySelectorAll("tr:nth-child(n+2)"));
    //         var pElementP5s = [];
    //         datapage5.forEach(function (datapage5Elemnt) {
    //             var pInTr = Array.from(datapage5Elemnt.querySelectorAll("td > p")).filter(function (ele) {
    //                 return ele.innerText.trim().length > 0;
    //             }).map(function (element) {
    //                 return element.innerText.trim();
    //             });
    //             pElementP5s.push(pInTr);
    //         })
    //         var GoAboard = [];
    //         for (let i = 0; i < pElementP5s.length; i++) {

    //             var GoAboardObj = {

    //                 purpose: pElementP5s[i][1],
    //                 country: pElementP5s[i][2]
    //             };
    //             GoAboard.push(GoAboardObj);
    //         }
    //         console.log('GoAboard', GoAboard)
    //         //Page6 Khen thuong
    //         var datapage6 = Array.from(listPage[6].querySelectorAll("tr:nth-child(n+2)"));
    //         var pElementP6s = [];
    //         datapage6.forEach(function (datapage6Elemnt) {
    //             var pInTr = Array.from(datapage6Elemnt.querySelectorAll("td > p")).filter(function (ele) {
    //                 return ele.innerText.trim().length > 0;
    //             }).map(function (element) {
    //                 return element.innerText.trim();
    //             });
    //             pElementP6s.push(pInTr);
    //         })
    //         var Laudatory = [];
    //         for (let i = 0; i < pElementP6s.length; i++) {

    //             var obj = {
    //                 time: pElementP6s[i][0].trim(),
    //                 officialReason: pElementP6s[i][1],
    //                 grantDecision: pElementP6s[i][2]
    //             };
    //             Laudatory.push(Laudatory);
    //         }
    //         console.log('Laudatory', Laudatory)
    //         //Page7 ki luat
    //         //phan van giua 2 truong hop: neu bi ki luat thi lay binh thuonng con neeu ko bij thi se de trong
    //         var datapage7 = Array.from(listPage[7].querySelectorAll("tr:nth-child(n+2)"));
    //         var pElementP7s = [];
    //         datapage7.forEach(function (datapage7Elemnt) {
    //             var pInTr = Array.from(datapage7Elemnt.querySelectorAll("td > p")).filter(function (ele) {
    //                 return ele.innerText.trim().length > 0;
    //             }).map(function (element) {
    //                 return element.innerText.trim();
    //             });
    //             pElementP7s.push(pInTr);
    //         })
    //         var Disciplined = [];
    //         for (let i = 0; i < pElementP7s.length; i++) {
    //             var DisciplinedObj = {
    //                 time: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][0].substr(pElementP6s[i][0].indexOf('-') - 2, 7) : 'None',
    //                 officialReason: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][1] : "None",
    //                 grantDecision: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][2] : "None",
    //             };
    //             Disciplined.push(DisciplinedObj);
    //         }
    //         console.log('Disciplined', Disciplined)
    //         //Page8 Hoan canh gia dinh
    //         var datapage8 = Array.from(listPage[8].querySelectorAll("tr:first-child>td"));
    //         var pE8 = [];
    //         datapage8.forEach(function (datapage8Elemnt) {
    //             var pInTr = Array.from(datapage8Elemnt.querySelectorAll("p")).filter(function (ele) {
    //                 return ele.innerText.trim().length > 0;
    //             }).map(function (element) {
    //                 return element.innerText.trim();
    //             });
    //             pE8.push(pInTr);
    //         })
    //         $scope.Relationship = [];
    //         let RelationshipIndex = 0;
    //         for (let y = 0; y < pE8.length; y++) {
    //             for (let i = 0; i < pE8[y].length; i++) {
    //                 if (pE8[y][i].startsWith('- Họ và tên:')) {
    //                     $scope.Relationship[RelationshipIndex].Name = pE8[y][i].slice(('- Họ và tên:').length).trim()
    //                 }
    //                 if (pE8[y][i].startsWith('- Năm sinh:')) {
    //                     let regex = /^(\d{4})-(\d{4})(?:\(([^)]*)\))?$/;
    //                     let match = pE8[y][i].slice(('- Năm sinh:').length).trim().match(regex);

    //                     if (match) {
    //                         $scope.Relationship[RelationshipIndex].Year = {
    //                             YearBirth: match[1],
    //                             YearDeath: match[2],
    //                             Reason: match[3] ? match[3].trim() : ''  // Kiểm tra xem có thông tin lý do không
    //                         };
    //                     }
    //                 }
    //                 if (pE8[y][i].startsWith("- Quê quán:")) {
    //                     $scope.Relationship[RelationshipIndex].HomeTown = pE8[y][i].slice(('- Quê quán:').length).trim()
    //                 }
    //                 if (pE8[y][i].startsWith("- Nơi cư trú:")) {
    //                     $scope.Relationship[RelationshipIndex].Residence = pE8[y][i].slice(('- Nơi cư trú:').length).trim()
    //                 }
    //                 if (pE8[y][i].startsWith("- Nghề nghiệp:")) {
    //                     $scope.Relationship[RelationshipIndex].Job = pE8[y][i].slice(('- Nghề nghiệp:').length).trim()
    //                 }
    //                 if (pE8[y][i].startsWith("- Là đảng viên")) {
    //                     $scope.Relationship[RelationshipIndex].ClassComposition = pE8[y][i].slice(('-').length).trim()
    //                     $scope.Relationship[RelationshipIndex].PartyMember = true
    //                 }
    //                 if (pE8[y][i].startsWith("- Quá trình công tác:")) {
    //                     // let regex = /^(\d{4})-(.*)$/;

    //                     $scope.Relationship[RelationshipIndex].WorkingProcess = [];
    //                     for (j = i + 1; !pE8[y][j].startsWith('-') && !pE8[y][j].startsWith('*'); j++) {
    //                         let inputString = pE8[y][j];
    //                         //let match = inputString.match(regex);

    //                         //if (match) {
    //                         //   let resultObject = {
    //                         //     Year: match[1],
    //                         //     Job: match[2].trim()  // Loại bỏ khoảng trắng ở đầu và cuối của công việc
    //                         //   };
    //                         //  $scope.Relationship[RelationshipIndex].WorkingProcess.push(resultObject);
    //                         $scope.Relationship[RelationshipIndex].WorkingProcess.push(inputString);
    //                         i = j;
    //                         //}
    //                     }
    //                 }
    //                 if (pE8[y][i].startsWith("- Thái độ chính trị:")) {
    //                     $scope.Relationship[RelationshipIndex].PoliticalAttitude = [];
    //                     for (j = i + 1; pE8[y][j].startsWith('+'); j++) {
    //                         $scope.Relationship[RelationshipIndex].PoliticalAttitude.push(pE8[y][j].slice(1).trim());
    //                         i = j;
    //                     }
    //                 }
    //                 if ((pE8[y][i].startsWith('*'))) {
    //                     let regex = /^\*(.+?)\s:$/;
    //                     let match = pE8[y][i].match(regex);

    //                     if (match) {
    //                         let relationship = match[1];
    //                         RelationshipIndex = $scope.Relationship.length;
    //                         $scope.Relationship[RelationshipIndex] = {
    //                             Relation: relationship.trim(),
    //                             ClassComposition: '',
    //                             PartyMember: false,
    //                         }
    //                     }
    //                     if (pE8[y][i] == "* Anh, chị, em ruột: khai đầy đủ anh chị em"
    //                         || pE8[y][i] == "* Anh, chị, em ruột của vợ (chồng):"
    //                         || pE8[y][i] == "* Các con ruột và con nuôi có đăng ký hợp pháp : khai đầy đủ các con") {
    //                         for (let a = i + 1; !pE8[y][a].startsWith("*") && a < pE8[y].length - 1; a++) {
    //                             let regex = /^(\d+)\.\s(.+)$/;
    //                             let match = pE8[y][a].match(regex);

    //                             if (match) {
    //                                 let relationship = match[2];
    //                                 RelationshipIndex = $scope.Relationship.length;
    //                                 $scope.Relationship[RelationshipIndex] = {
    //                                     Relation: relationship.trim(),
    //                                     ClassComposition: '',
    //                                     PartyMember: false,
    //                                 }
    //                             }
    //                             if (pE8[y][a].startsWith('- Họ và tên:')) {
    //                                 $scope.Relationship[RelationshipIndex].Name = pE8[y][a].slice(('- Họ và tên:').length).trim()
    //                             }
    //                             if (pE8[y][a].startsWith('- Năm sinh:')) {
    //                                 let regex = /^(\d{4})-(\d{4})(?:\(([^)]*)\))?$/;
    //                                 let match = pE8[y][a].slice(('- Năm sinh:').length).trim().match(regex);

    //                                 if (match) {
    //                                     $scope.Relationship[RelationshipIndex].Year = {
    //                                         YearBirth: match[1],
    //                                         YearDeath: match[2],
    //                                         Reason: match[3] ? match[3].trim() : ''  // Kiểm tra xem có thông tin lý do không
    //                                     };
    //                                 }
    //                             }
    //                             if (pE8[y][a].startsWith("- Quê quán:")) {
    //                                 $scope.Relationship[RelationshipIndex].HomeTown = pE8[y][a].slice(('- Quê quán:').length).trim()
    //                             }
    //                             if (pE8[y][a].startsWith("- Nơi cư trú:")) {
    //                                 $scope.Relationship[RelationshipIndex].Residence = pE8[y][a].slice(('- Nơi cư trú:').length).trim()
    //                             }
    //                             if (pE8[y][a].startsWith("- Nghề nghiệp:")) {
    //                                 $scope.Relationship[RelationshipIndex].Job = pE8[y][a].slice(('- Nghề nghiệp:').length).trim()
    //                             }
    //                             if (pE8[y][a].startsWith("- Là đảng viên")) {
    //                                 $scope.Relationship[RelationshipIndex].ClassComposition = pE8[y][a].slice(('-').length).trim()
    //                                 $scope.Relationship[RelationshipIndex].PartyMember = true
    //                             }
    //                             if (pE8[y][a].startsWith("- Quá trình công tác:")) {
    //                                 let regex = /^(\d{4})-(.*)$/;

    //                                 $scope.Relationship[RelationshipIndex].WorkingProcess = [];
    //                                 for (j = a + 1; !pE8[y][j].startsWith('-'); j++) {
    //                                     let inputString = pE8[y][j];
    //                                     // let match = inputString.match(regex);

    //                                     // if (match) {
    //                                     // let resultObject = {
    //                                     //     Year: match[1],
    //                                     //     Job: match[2].trim()  // Loại bỏ khoảng trắng ở đầu và cuối của công việc
    //                                     // };
    //                                     // $scope.Relationship[RelationshipIndex].WorkingProcess.push(resultObject);
    //                                     // }
    //                                     $scope.Relationship[RelationshipIndex].WorkingProcess.push(inputString);
    //                                     i = j;
    //                                 }
    //                             }
    //                             if (pE8[y][a].startsWith("- Thái độ chính trị:")) {
    //                                 $scope.Relationship[RelationshipIndex].PoliticalAttitude = [];
    //                                 for (j = a + 1; pE8[y][j].startsWith('+'); j++) {
    //                                     $scope.Relationship[RelationshipIndex].PoliticalAttitude.push(pE8[y][j].slice(1).trim());
    //                                     i = j;
    //                                 }
    //                             }
    //                             i = a;
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         console.log("Relationship:", $scope.Relationship);
    //         //Page 9 Tự nhận xét
    //         var SelfComment = {
    //             context: Array.from(listPage[9].querySelectorAll("tr:first-child > td > p:first-child"))[0].innerText
    //         };
    //         //Page 9 ket don
    //         var datapage9 = Array.from(listPage[9].querySelectorAll("tr:last-child > td > p")).filter(function (element) {
    //             return element.innerText.trim().length > 0 && element.innerText.includes("ngày") && element.innerText.includes("tháng") && element.innerText.includes("năm");
    //         }).map(function (element) {
    //             return element.innerText.trim();
    //         });
    //         var PlaceCreatedTime = {
    //             place: datapage9[0].substring(0, datapage9[0].indexOf(',')),
    //             createdTime: datapage9[0].substring(datapage9[0].indexOf('ngày') + 4, datapage9[0].indexOf('tháng')).trim() + '-'
    //                 + datapage9[0].substring(datapage9[0].indexOf('tháng') + 5, datapage9[0].indexOf('năm')).trim() + '-'
    //                 + datapage9[0].substring(datapage9[0].indexOf('năm') + 4).trim()
    //         };
    //         var obj = $scope.defaultRTE.getContent();
    //         console.log(obj);
    //         $scope.listPage = $(obj).find('> div > div > div').toArray();
    //         $scope.listInfo1 = $($scope.listPage[0]).find('table > tbody > tr > td > p').toArray()
    //             .map(y => $(y).find('> span').toArray().map(t => $(t).text()));
    //         //Lấy sdt 
    //         $scope.listDetail8 = $($scope.listPage[0])
    //             .find('table > tbody > tr:nth-child(1) > td > p:nth-child(27) > span:last-child').text();

    //         $scope.listDetail1 = $($scope.listPage[0])
    //             .find('table > tbody > tr:nth-child(2) > td > p:nth-child(n+7):nth-child(-n+12)').toArray()
    //             .map(t => $(t).find('> span:last-child').text());

    //         $scope.listDetail2 = $($scope.listPage[0])
    //             .find('table > tbody > tr:nth-child(2) > td > p:nth-child(16) > span:nth-child(even)').toArray()
    //             .map(z => $(z).text());
    //         $scope.listDetail3 = $($scope.listPage[0])
    //             .find('table > tbody > tr:nth-child(2) > td > p:nth-child(17) > span:last-child').text()

    //         $scope.listDetail4 = $($scope.listPage[0])
    //             .find('table > tbody > tr:nth-child(2) > td > p:nth-child(27) > span:last-child').text().split(',')

    //         $scope.listDetail5 = $($scope.listPage[0])
    //             .find('table > tbody > tr:nth-child(2) > td > p:nth-child(28) > span:nth-child(even)').toArray()
    //             .map(z => $(z).text());

    //         $scope.listDetail6 = $($scope.listPage[0])
    //             .find('table > tbody > tr:nth-child(2) > td > p:nth-child(n+19):nth-child(-n+26)').toArray()
    //             .map(t => $(t).find('> span:last-child').text());

    //         $scope.listDetail7 = $($scope.listPage[0])
    //             .find('table > tbody > tr:nth-child(2) > td > p:nth-child(28) > span:nth-child(5)').toArray()
    //             .map(z => $(z).text());

    //         $scope.listDetail9 = $($scope.listPage[0])
    //             .find('table > tbody > tr:nth-child(1) > td > p:nth-child(29) > span:last-child').text();

    //         $scope.infUser.FistName = $scope.listDetail1[0];
    //         $scope.infUser.Sex = $scope.listDetail1[1];
    //         $scope.infUser.LastName = $scope.listDetail1[2];
    //         $scope.infUser.DateofBird = $scope.listDetail1[3];
    //         $scope.infUser.HomeTown = $scope.listDetail1[5];
    //         $scope.infUser.PlaceofBirth = $scope.listDetail1[4];

    //         $scope.infUser.Nation = $scope.listDetail2[0];
    //         $scope.infUser.Religion = $scope.listDetail2[1];

    //         $scope.infUser.NowEmployee = $scope.listDetail3;

    //         $scope.infUser.PlaceinGroup = $scope.listDetail4[0];
    //         $scope.infUser.DateInGroup = $scope.listDetail4[1].match(/\d+/g).join('-');

    //         $scope.infUser.PlaceInParty = $scope.listDetail5[0].split(',')[0];
    //         $scope.infUser.DateInParty = $scope.listDetail5[0].split(',')[1].match(/\d+/g).join('-');
    //         $scope.infUser.PlaceRecognize = $scope.listDetail7[0].split(',')[0];
    //         $scope.infUser.DateRecognize = $scope.listDetail7[0].split(',')[1].match(/\d+/g).join('-');
    //         $scope.infUser.Presenter = $scope.listDetail5[2];

    //         $scope.infUser.LevelEducation.GeneralEducation = $scope.listDetail6[0];
    //         $scope.infUser.LevelEducation.VocationalTraining = $scope.listDetail6[1];
    //         $scope.infUser.LevelEducation.Undergraduate = $scope.listDetail6[2].split(',');
    //         $scope.infUser.LevelEducation.RankAcademic = $scope.listDetail6[3];
    //         $scope.infUser.LevelEducation.PoliticalTheory = $scope.listDetail6[4].split(',');
    //         $scope.infUser.LevelEducation.ForeignLanguage = $scope.listDetail6[5].split(',');
    //         $scope.infUser.LevelEducation.It = $scope.listDetail6[6].split(',');
    //         $scope.infUser.LevelEducation.MinorityLanguage = $scope.listDetail6[7].split(',');

    //         $scope.infUser.Phone = $scope.listDetail8;
    //         $scope.infUser.PhoneLL = $scope.listDetail9.trim();

    //         console.log("infUser", $scope.infUser);
    //         var JSONobj = {
    //             InformationUser: $scope.infUser,
    //             Create: PlaceCreatedTime,
    //             PersonalHistory: PersonalHistory,
    //             BusinessNDuty: BusinessNDuty,
    //             PassedTrainingClasses: PassedTrainingClasses,
    //             GoAboard: GoAboard,
    //             Disciplined: Disciplined,
    //             SelfComment: SelfComment,
    //             Relationship: $scope.Relationship
    //         }
    //         console.log(JSON.stringify(JSONobj))
    //         setTimeout(function () {
    //             $scope.$apply();
    //         });
    //     }, 100);
    // }
    function handleTextUpload2(txt) {
        $scope.infUser = {
            LevelEducation: {
                Undergraduate: [],
                PoliticalTheory: [],
                ForeignLanguage: [],
                It: [],
                MinorityLanguage: []
            }
        }
        $scope.defaultRTE.value = txt;
        setTimeout(function () {
            var listPage = document.querySelectorAll(".Section0 > div > table");
            // tách thông tin page[0]: lí lịch người xin vào đảng
            /*var listTagpinPage0 = listPage[0].querySelectorAll("tbody > tr > td > p");
    
            //loc lay cac the p sao cho the p chua van ban và chứa dấu : sau đó lưu vào m
            var objPage0 = Array.from(listTagpinPage0).filter(function (element) {
                // Kiểm tra xem thuộc tính của thẻ <p> có chứa văn bản không
                return element.textContent.trim().length > 0 && /:/.test(element.textContent);
            });
            var innerTextArray = Array.from(objPage0).map(function (element) {
                return element.innerText.split(':');
            });*///để tạm đây fomat sau

            //Page2 Lịch sử bản thân
            var listTagpinPage1 = listPage[1].querySelectorAll("tbody > tr > td > p");
            var objPage1 = Array.from(listTagpinPage1).filter(function (element) {
                // Kiểm tra xem thuộc tính của thẻ <p> có chứa văn bản không
                var textContent = element.textContent.trim();
                return textContent.length > 0 && /\+/.test(textContent);
            });

            var PersonalHistory = [];//đối tượng lưu thông tin lịch sử bản thân dưới bằng mảng
            for (let i = 0; i < objPage1.length; i++) {
                var PersonHis = {};
                // Sửa lỗi ở đây, sử dụng indexOf thay vì search và sửa lỗi về cú pháp của biểu thức chấm phẩy
                PersonHis['time'] = {
                    begin: objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') - 7, 7).trim(),
                    end: objPage1[i].innerText.split(':')[0].substr(objPage1[i].innerText.indexOf('-') + 1, 7).trim(),
                };
                // Sửa lỗi ở đây, sử dụng split(':') để tách thời gian và thông tin
                PersonHis['infor'] = objPage1[i].innerText.split(':')[1];
                PersonalHistory.push(PersonHis);
            }
            console.log('PersonalHistory', PersonalHistory)
            //Page3 Những nơi công tác và chức vụ đã qua

            /*var datapage2 = Array.from(listPage[2].querySelectorAll('tr:nth-child(2) > td > p'))
                .filter(function (element) {
                    return element.textContent.trim().length > 0;
                })
                .map(function (element) {
                    return element.innerText.trim();
                });*/

            var datapage2 = Array.from(listPage[2].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP2s = [];
            datapage2.forEach(function (datapage2Element) {
                var pInTr = Array.from(datapage2Element.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });;
                pElementP2s.push(pInTr);
            })
            var BusinessNDuty = [];
            for (let i = 0; i < pElementP2s.length; i++) {
                var begin = pElementP2s[i][0].substr(pElementP2s[i][0].indexOf('-') - 2, 7);
                var end = pElementP2s[i][0].substr(pElementP2s[i][0].lastIndexOf('-') - 2, 7);
                var BusinessNDutyObj = {
                    time: {
                        begin: begin,
                        end: end
                    },
                    business: pElementP2s[i][1],
                    duty: pElementP2s[i][2]
                };
                BusinessNDuty.push(BusinessNDutyObj);
            }
            console.log('BusinessNDuty', BusinessNDuty)

            //pag4: những lớp đào tạo bồi dưỡng đã qa
            var datapage4 = Array.from(listPage[4].querySelectorAll('tr:nth-child(n+2)'));
            var pElementP4s = [];
            datapage4.forEach(function (e) {
                var pInTr = Array.from(e.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP4s.push(pInTr);
            });

            console.log(pElementP4s)
            var PassedTrainingClasses = [];
            for (let i = 0; i < pElementP4s.length; i++) {
                var obj = {
                    school: pElementP4s[i][0],
                    class: pElementP4s[i][1],
                    time: {
                        begin: pElementP4s[i][2].substring(0, pElementP4s[i][2].indexOf('đến')),
                        end: pElementP4s[i][2].substring(pElementP4s[i][2].lastIndexOf('đến') + 4).trim()
                    },
                    business: pElementP4s[i][1]
                };
                PassedTrainingClasses.push(obj);
            }
            console.log('PassedTrainingClasses', PassedTrainingClasses)

            // console.log(data)
            //
            var data = Array.from(listPage[3].querySelectorAll('td > p')).filter(function (ele) {
                return ele.innerText.trim().length > 0;
            }).map(function (element) {
                return element.innerText.trim();
            });
            function isTime(e) {
                return (e.includes('Ngày') && e.includes('tháng') && e.includes('năm')) ? true : false;
            }
            var HistoricalFeatures = [];
            for (let i = 0; i < data.length; i++) {
                var obj = {
                    time: null,
                    content: null
                };
                if (isTime(data[i])) {
                    obj.time = data[i].substr(data[i].indexOf("Ngày") + 4, 4).trim() + '-' +
                        data[i].substr(data[i].indexOf("tháng") + 5, 4).trim() + '-' +
                        data[i].substr(data[i].indexOf("năm") + 4, 5),
                        obj.content = data[i + 1];
                }
                if (obj.time != null && obj.content != null) {
                    HistoricalFeatures.push(obj);
                }
            }
            console.log("HistoricalFeatures:", HistoricalFeatures);
            //Page 5 Di nuoc nguoai
            var datapage5 = Array.from(listPage[5].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP5s = [];
            datapage5.forEach(function (datapage5Elemnt) {
                var pInTr = Array.from(datapage5Elemnt.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP5s.push(pInTr);
            })
            var GoAboard = [];
            for (let i = 0; i < pElementP5s.length; i++) {

                var GoAboardObj = {

                    purpose: pElementP5s[i][1],
                    country: pElementP5s[i][2]
                };
                GoAboard.push(GoAboardObj);
            }
            console.log('GoAboard', GoAboard)
            //Page6 Khen thuong
            var datapage6 = Array.from(listPage[6].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP6s = [];
            datapage6.forEach(function (datapage6Elemnt) {
                var pInTr = Array.from(datapage6Elemnt.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP6s.push(pInTr);
            })
            var Laudatory = [];
            for (let i = 0; i < pElementP6s.length; i++) {

                var obj = {
                    time: pElementP6s[i][0].trim(),
                    officialReason: pElementP6s[i][1],
                    grantDecision: pElementP6s[i][2]
                };
                Laudatory.push(Laudatory);
            }
            console.log('Laudatory', Laudatory)
            //Page7 ki luat
            //phan van giua 2 truong hop: neu bi ki luat thi lay binh thuonng con neeu ko bij thi se de trong
            var datapage7 = Array.from(listPage[7].querySelectorAll("tr:nth-child(n+2)"));
            var pElementP7s = [];
            datapage7.forEach(function (datapage7Elemnt) {
                var pInTr = Array.from(datapage7Elemnt.querySelectorAll("td > p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pElementP7s.push(pInTr);
            })
            var Disciplined = [];
            for (let i = 0; i < pElementP7s.length; i++) {
                var DisciplinedObj = {
                    time: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][0].substr(pElementP6s[i][0].indexOf('-') - 2, 7) : 'None',
                    officialReason: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][1] : "None",
                    grantDecision: pElementP7s[i][0].includes('-', 2) ? pElementP7s[i][2] : "None",
                };
                Disciplined.push(DisciplinedObj);
            }
            console.log('Disciplined', Disciplined)
            //Page8 Hoan canh gia dinh
            var datapage8 = Array.from(listPage[8].querySelectorAll("tr:first-child>td"));
            var pE8 = [];
            datapage8.forEach(function (datapage8Elemnt) {
                var pInTr = Array.from(datapage8Elemnt.querySelectorAll("p")).filter(function (ele) {
                    return ele.innerText.trim().length > 0;
                }).map(function (element) {
                    return element.innerText.trim();
                });
                pE8.push(pInTr);
            })
            $scope.Relationship = [];
            let RelationshipIndex = 0;
            for (let y = 0; y < pE8.length; y++) {
                for (let i = 0; i < pE8[y].length; i++) {
                    if (pE8[y][i].startsWith('- Họ và tên:')) {
                        $scope.Relationship[RelationshipIndex].Name = pE8[y][i].slice(('- Họ và tên:').length).trim()
                    }
                    if (pE8[y][i].startsWith('- Năm sinh:')) {
                        let regex = /^(\d{4})-(\d{4})(?:\(([^)]*)\))?$/;
                        let match = pE8[y][i].slice(('- Năm sinh:').length).trim().match(regex);

                        if (match) {
                            $scope.Relationship[RelationshipIndex].Year = {
                                YearBirth: match[1],
                                YearDeath: match[2],
                                Reason: match[3] ? match[3].trim() : ''  // Kiểm tra xem có thông tin lý do không
                            };
                        }
                    }
                    if (pE8[y][i].startsWith("- Quê quán:")) {
                        $scope.Relationship[RelationshipIndex].HomeTown = pE8[y][i].slice(('- Quê quán:').length).trim()
                    }
                    if (pE8[y][i].startsWith("- Nơi cư trú:")) {
                        $scope.Relationship[RelationshipIndex].Residence = pE8[y][i].slice(('- Nơi cư trú:').length).trim()
                    }
                    if (pE8[y][i].startsWith("- Nghề nghiệp:")) {
                        $scope.Relationship[RelationshipIndex].Job = pE8[y][i].slice(('- Nghề nghiệp:').length).trim()
                    }
                    if (pE8[y][i].startsWith("- Là đảng viên")) {
                        $scope.Relationship[RelationshipIndex].ClassComposition = pE8[y][i].slice(('-').length).trim()
                        $scope.Relationship[RelationshipIndex].PartyMember = true
                    }
                    if (pE8[y][i].startsWith("- Quá trình công tác:")) {
                        // let regex = /^(\d{4})-(.*)$/;

                        $scope.Relationship[RelationshipIndex].WorkingProcess = [];
                        for (j = i + 1; !pE8[y][j].startsWith('-') && !pE8[y][j].startsWith('*'); j++) {
                            let inputString = pE8[y][j];
                            //let match = inputString.match(regex);

                            //if (match) {
                            //   let resultObject = {
                            //     Year: match[1],
                            //     Job: match[2].trim()  // Loại bỏ khoảng trắng ở đầu và cuối của công việc
                            //   };
                            //  $scope.Relationship[RelationshipIndex].WorkingProcess.push(resultObject);
                            $scope.Relationship[RelationshipIndex].WorkingProcess.push(inputString);
                            i = j;
                            //}
                        }
                    }
                    if (pE8[y][i].startsWith("- Thái độ chính trị:")) {
                        $scope.Relationship[RelationshipIndex].PoliticalAttitude = [];
                        for (j = i + 1; pE8[y][j].startsWith('+'); j++) {
                            $scope.Relationship[RelationshipIndex].PoliticalAttitude.push(pE8[y][j].slice(1).trim());
                            i = j;
                        }
                    }
                    if ((pE8[y][i].startsWith('*'))) {
                        let regex = /^\*(.+?)\s:$/;
                        let match = pE8[y][i].match(regex);

                        if (match) {
                            let relationship = match[1];
                            RelationshipIndex = $scope.Relationship.length;
                            $scope.Relationship[RelationshipIndex] = {
                                Relation: relationship.trim(),
                                ClassComposition: '',
                                PartyMember: false,
                            }
                        }
                        if (pE8[y][i] == "* Anh, chị, em ruột: khai đầy đủ anh chị em"
                            || pE8[y][i] == "* Anh, chị, em ruột của vợ (chồng):"
                            || pE8[y][i] == "* Các con ruột và con nuôi có đăng ký hợp pháp : khai đầy đủ các con") {
                            for (let a = i + 1; !pE8[y][a].startsWith("*") && a < pE8[y].length - 1; a++) {
                                let regex = /^(\d+)\.\s(.+)$/;
                                let match = pE8[y][a].match(regex);

                                if (match) {
                                    let relationship = match[2];
                                    RelationshipIndex = $scope.Relationship.length;
                                    $scope.Relationship[RelationshipIndex] = {
                                        Relation: relationship.trim(),
                                        ClassComposition: '',
                                        PartyMember: false,
                                    }
                                }
                                if (pE8[y][a].startsWith('- Họ và tên:')) {
                                    $scope.Relationship[RelationshipIndex].Name = pE8[y][a].slice(('- Họ và tên:').length).trim()
                                }
                                if (pE8[y][a].startsWith('- Năm sinh:')) {
                                    let regex = /^(\d{4})-(\d{4})(?:\(([^)]*)\))?$/;
                                    let match = pE8[y][a].slice(('- Năm sinh:').length).trim().match(regex);

                                    if (match) {
                                        $scope.Relationship[RelationshipIndex].Year = {
                                            YearBirth: match[1],
                                            YearDeath: match[2],
                                            Reason: match[3] ? match[3].trim() : ''  // Kiểm tra xem có thông tin lý do không
                                        };
                                    }
                                }
                                if (pE8[y][a].startsWith("- Quê quán:")) {
                                    $scope.Relationship[RelationshipIndex].HomeTown = pE8[y][a].slice(('- Quê quán:').length).trim()
                                }
                                if (pE8[y][a].startsWith("- Nơi cư trú:")) {
                                    $scope.Relationship[RelationshipIndex].Residence = pE8[y][a].slice(('- Nơi cư trú:').length).trim()
                                }
                                if (pE8[y][a].startsWith("- Nghề nghiệp:")) {
                                    $scope.Relationship[RelationshipIndex].Job = pE8[y][a].slice(('- Nghề nghiệp:').length).trim()
                                }
                                if (pE8[y][a].startsWith("- Là đảng viên")) {
                                    $scope.Relationship[RelationshipIndex].ClassComposition = pE8[y][a].slice(('-').length).trim()
                                    $scope.Relationship[RelationshipIndex].PartyMember = true
                                }
                                if (pE8[y][a].startsWith("- Quá trình công tác:")) {
                                    let regex = /^(\d{4})-(.*)$/;

                                    $scope.Relationship[RelationshipIndex].WorkingProcess = [];
                                    for (j = a + 1; !pE8[y][j].startsWith('-'); j++) {
                                        let inputString = pE8[y][j];
                                        // let match = inputString.match(regex);

                                        // if (match) {
                                        // let resultObject = {
                                        //     Year: match[1],
                                        //     Job: match[2].trim()  // Loại bỏ khoảng trắng ở đầu và cuối của công việc
                                        // };
                                        // $scope.Relationship[RelationshipIndex].WorkingProcess.push(resultObject);
                                        // }
                                        $scope.Relationship[RelationshipIndex].WorkingProcess.push(inputString);
                                        i = j;
                                    }
                                }
                                if (pE8[y][a].startsWith("- Thái độ chính trị:")) {
                                    $scope.Relationship[RelationshipIndex].PoliticalAttitude = [];
                                    for (j = a + 1; pE8[y][j].startsWith('+'); j++) {
                                        $scope.Relationship[RelationshipIndex].PoliticalAttitude.push(pE8[y][j].slice(1).trim());
                                        i = j;
                                    }
                                }
                                i = a;
                            }
                        }
                    }
                }
            }

            console.log("Relationship:", $scope.Relationship);
            //Page 9 Tự nhận xét
            var SelfComment = {
                context: Array.from(listPage[9].querySelectorAll("tr:first-child > td > p:first-child"))[0].innerText
            };
            //Page 9 ket don
            var datapage9 = Array.from(listPage[9].querySelectorAll("tr:last-child > td > p")).filter(function (element) {
                return element.innerText.trim().length > 0 && element.innerText.includes("ngày") && element.innerText.includes("tháng") && element.innerText.includes("năm");
            }).map(function (element) {
                return element.innerText.trim();
            });
            var PlaceCreatedTime = {
                place: datapage9[0].substring(0, datapage9[0].indexOf(',')),
                createdTime: datapage9[0].substring(datapage9[0].indexOf('ngày') + 4, datapage9[0].indexOf('tháng')).trim() + '-'
                    + datapage9[0].substring(datapage9[0].indexOf('tháng') + 5, datapage9[0].indexOf('năm')).trim() + '-'
                    + datapage9[0].substring(datapage9[0].indexOf('năm') + 4).trim()
            };
            var obj = $scope.defaultRTE.getContent();
            console.log(obj);
            $scope.listPage = $(obj).find('> div > div > div').toArray();
            $scope.listInfo1 = $($scope.listPage[0]).find('table > tbody > tr > td > p').toArray()
                .map(y => $(y).find('> span').toArray().map(t => $(t).text()));
            //Lấy sdt 
            $scope.listDetail8 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(1) > td > p:nth-child(27) > span:last-child').text();

            $scope.listDetail1 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(n+7):nth-child(-n+12)').toArray()
                .map(t => $(t).find('> span:last-child').text());

            $scope.listDetail2 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(16) > span:nth-child(even)').toArray()
                .map(z => $(z).text());
            $scope.listDetail3 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(17) > span:last-child').text()

            $scope.listDetail4 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(27) > span:last-child').text().split(',')

            $scope.listDetail5 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(28) > span:nth-child(even)').toArray()
                .map(z => $(z).text());

            $scope.listDetail6 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(n+19):nth-child(-n+26)').toArray()
                .map(t => $(t).find('> span:last-child').text());

            $scope.listDetail7 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(2) > td > p:nth-child(28) > span:nth-child(5)').toArray()
                .map(z => $(z).text());

            $scope.listDetail9 = $($scope.listPage[0])
                .find('table > tbody > tr:nth-child(1) > td > p:nth-child(29) > span:last-child').text();

            $scope.infUser.FistName = $scope.listDetail1[0];
            $scope.infUser.Sex = $scope.listDetail1[1];
            $scope.infUser.LastName = $scope.listDetail1[2];
            $scope.infUser.DateofBird = $scope.listDetail1[3];
            $scope.infUser.HomeTown = $scope.listDetail1[5];
            $scope.infUser.PlaceofBirth = $scope.listDetail1[4];

            $scope.infUser.Nation = $scope.listDetail2[0];
            $scope.infUser.Religion = $scope.listDetail2[1];

            $scope.infUser.NowEmployee = $scope.listDetail3;

            $scope.infUser.PlaceinGroup = $scope.listDetail4[0];
            $scope.infUser.DateInGroup = $scope.listDetail4[1].match(/\d+/g).join('-');

            $scope.infUser.PlaceInParty = $scope.listDetail5[0].split(',')[0];
            $scope.infUser.DateInParty = $scope.listDetail5[0].split(',')[1].match(/\d+/g).join('-');
            $scope.infUser.PlaceRecognize = $scope.listDetail7[0].split(',')[0];
            $scope.infUser.DateRecognize = $scope.listDetail7[0].split(',')[1].match(/\d+/g).join('-');
            $scope.infUser.Presenter = $scope.listDetail5[2];

            $scope.infUser.LevelEducation.GeneralEducation = $scope.listDetail6[0];
            $scope.infUser.LevelEducation.VocationalTraining = $scope.listDetail6[1];
            $scope.infUser.LevelEducation.Undergraduate = $scope.listDetail6[2].split(',');
            $scope.infUser.LevelEducation.RankAcademic = $scope.listDetail6[3];
            $scope.infUser.LevelEducation.PoliticalTheory = $scope.listDetail6[4].split(',');
            $scope.infUser.LevelEducation.ForeignLanguage = $scope.listDetail6[5].split(',');
            $scope.infUser.LevelEducation.It = $scope.listDetail6[6].split(',');
            $scope.infUser.LevelEducation.MinorityLanguage = $scope.listDetail6[7].split(',');

            $scope.infUser.Phone = $scope.listDetail8;
            $scope.infUser.PhoneLL = $scope.listDetail9.trim();

            console.log("infUser", $scope.infUser);
            var JSONobj = {
                InformationUser: $scope.infUser,
                Create: PlaceCreatedTime,
                PersonalHistory: PersonalHistory,
                BusinessNDuty: BusinessNDuty,
                PassedTrainingClasses: PassedTrainingClasses,
                GoAboard: GoAboard,
                Disciplined: Disciplined,
                SelfComment: SelfComment,
                Relationship: $scope.Relationship
            }
            console.log(JSONobj)
            setTimeout(function () {
                $scope.$apply();
            });
        }, 100);
    }
    setTimeout(async function () {
        loadDate();
        // initialize Rich Text Editor component
        $scope.defaultRTE = new ej.richtexteditor.RichTextEditor({
            height: '850px'
        });
        // Render initialized Rich Text Editor.
        $scope.defaultRTE.appendTo('#defaultRTE');
        var obj = $scope.defaultRTE.getContent();
        obj.firstChild.contentEditable = 'false'
        //var url = "/files/Template/PRODUCT_IMP/EVN_INV_TMP.rtf";
        //var result = await fetch(url);
        //var blob = await result.blob();
    }, 50);
});