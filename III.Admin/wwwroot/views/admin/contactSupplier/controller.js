var ctxfolder = "/views/admin/contactSupplier";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "pascalprecht.translate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select']);
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
        insert: function (data, callback) {
            $http.post('/Admin/ContactSupplier/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/ContactSupplier/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/ContactSupplier/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/ContactSupplier/GetItem/' + data).then(callback);
        },
        getSupplier: function (callback) {
            $http.post('/Admin/ContactSupplier/GetSupplier/').then(callback);
        },
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/ContactSupplier/UploadImage/', data, callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, dataservice, $translate, $cookies) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    $rootScope.permissionContactSupplier = PERMISSION_CONTACT_SUPPLIER;
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        console.log(caption);
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
            //max: 'Max some message {0}'
        });
        $rootScope.validationOptionsContact = {
            rules: {
                ContactName: {
                    required: true,
                    maxlength: 255,
                    regx: /^[^\s].*/
                },
                Email: {
                    required: true,
                    maxlength: 100,
                    regx: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
                },
                Mobile: {
                    required: true,
                    maxlength: 100,
                    regx: /^[0|+|+84]+([\s0-9]{9,15})([\s#0-9]{5})?\b$/
                },
                Title: {
                    maxlength: 1000,
                },
                InChargeOf: {
                    maxlength: 1000
                },
                Address: {
                    maxlength: 500
                },
                Telephone: {
                    maxlength: 100,
                    regx: /^[0|+|+84]+([\s0-9]{9,15})([\s#0-9]{5})?\b$/
                },
                Fax: {
                    maxlength: 100
                },
                Facebook: {
                    maxlength: 100
                },
                GooglePlus: {
                    maxlength: 100
                },
                Twitter: {
                    maxlength: 100
                },
                Skype: {
                    maxlength: 100
                },
                Note: {
                    maxlength: 1000
                },
            },
            messages: {
                ContactName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CS_CURD_LBL_CS_CONTACTNAME),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_CONTACTNAME).replace("{1}", "255"),
                    regx: "Tên liên hệ không bắt đầu bằng khoảng trắng"
                },
                Email: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CS_CURD_LBL_CS_EMAIL),
                    regx: caption.COM_MSG_FORMAT_EMAIL.replace("{0}", caption.CS_CURD_LBL_CS_EMAIL),
                    maxlength: "Tối đa 100 ký tự"
                },
                Mobile: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.CS_CURD_LBL_CS_MOBIEPHONE),
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_MOBIEPHONE).replace("{1}", "100"),
                    regx: caption.COM_MSG_INVALID_FORMAT.replace("{0}", caption.CS_CURD_LBL_CS_MOBIEPHONE),
                },
                Title: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_POSITION).replace("{1}", "1000"),
                },
                InChargeOf: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_INCHARGEOF).replace("{1}", "1000")
                },
                Address: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_ADDRESS).replace("{1}", "500")
                },
                Telephone: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_TELEPHONE).replace("{1}", "100"),
                    regx: caption.COM_MSG_INVALID_FORMAT.replace("{0}", caption.CS_CURD_LBL_CS_TELEPHONE),
                },
                Fax: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_FAX).replace("{1}", "100")
                },
                Facebook: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_FACEBOOK).replace("{1}", "100")
                },
                GooglePlus: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_GOOGLEPLUS).replace("{1}", "100")
                },
                Twitter: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_TWITTER).replace("{1}", "100")
                },
                Skype: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_SKYPE).replace("{1}", "100")
                },
                Note: {
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.CS_CURD_LBL_CS_NOTE).replace("{1}", "1000")
                },
            }
        }
        $rootScope.IsTranslate = true;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ContactSupplier/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Name: '',
        DateFrom: '',
        DateTo: '',
        Phone: '',
        Email: '',
        Title: '',
        SuppCode:''
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContactSupplier/JTable",
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
                d.DateFrom = $scope.model.DateFrom;
                d.DateTo = $scope.model.DateTo;
                d.Phone = $scope.model.Phone;
                d.Email = $scope.model.Email;
                d.Title = $scope.model.Title;
                d.SuppCode = $scope.model.SuppCode;
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
            $compile(angular.element(row))($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.Id] = !$scope.selected[data.Id];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.Id] = false;
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
            if ($rootScope.permissionContactSupplier.Update) {
                $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                    } else {
                        var Id = data.Id;
                        $scope.edit(Id);
                    }
                });
            }
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ContactName').withTitle('{{ "CS_LIST_COL_CS_CONTACTNAME" | translate }}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('MobilePhone').withTitle('{{ "CS_LIST_COL_CS_MOBIEPHONE" | translate }}').renderWith(function (data, type) {
        return '<span class= "text-success">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle('{{ "CS_LIST_COL_CS_MAIL" | translate }}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SupName').withTitle('{{ "CS_CURD_LBL_SUPPCODE" | translate }}').renderWith(function (data, type, full) {
        return '<span class= "text-danger">' + data + '</span>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CreateTime').withTitle('{{ "CS_LIST_COL_CS_CREATETIME" | translate }}').renderWith(function (data, type, full) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{ "CS_CURD_LBL_CS_POSITION" | translate }}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('FilePath').withTitle('{{ "CS_LIST_COL_CS_IMAGE" | translate }}').renderWith(function (data, type) {
        return '<img class="img-circle" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'tcenter dataTable-pr20').withTitle('{{ "COM_LIST_COL_ACTION" | translate }}').renderWith(function (data, type, full, meta) {
        var listButton = '';
        if ($rootScope.permissionContactSupplier.Update) {
            listButton += '<a ng-click="edit(' + full.Id + ')"  ><i class="fas fa-edit fs25 pr10"style="--fa-primary-color: green;"></i></a>';
        }
        if ($rootScope.permissionContactSupplier.Delete) {
            listButton += '<a ng-click="delete(' + full.Id + ')"  ><i class="fas fa-trash fs25"style="--fa-primary-color: red;"></i></a>';
        }
        return listButton;
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


    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 60;
    } else if ($window.innerWidth > 1400) {
        size = 50;
    } 
    $scope.init = function () {
        dataservice.getSupplier(function (rs) {
            rs = rs.data;
            $scope.listSupplier = rs;
        })
    }
    $scope.init();
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadNoResetPage();
        }, function () { });
    };
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

    };

    $scope.isSearch = false;
    $scope.showSearch = function () {
        
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    function loadDate() {
        $("#DateFrom").datepicker({
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
            $('#DateFrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#DateFrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, $filter) {
    $scope.model = {
        SuppCode: '',
    };
    $scope.init = function () {
        dataservice.getSupplier(function (rs) {rs=rs.data;
            $scope.listSupplier = rs;
        })
    }
    $scope.init();
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addForm.validate() && !validationSelect($scope.model).Status) {
            var files = $('#File').get(0);
            var file = files.files[0];
            var data = new FormData();
            var fileName = '';
            data.append("FileUpload", file);
            dataservice.uploadImage(data, function (rs) {rs=rs.data;
                if (rs.Error) {
                    App.toastrError(result.Title);
                    return;
                }
                else {
                    $scope.model.FilePath = '/uploads/images/' + rs.Object;
                    dataservice.insert($scope.model, function (result) {result=result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $uibModalInstance.close();
                        }
                    });
                }
            });
        }
    };
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('image').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_CHECK_ADD_FILEIMAGE);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "SuppCode" && $scope.model.SuppCode != "" && $scope.model.SuppCode != null && $scope.model.SuppCode != undefined) {
            $scope.errorSuppCode = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.SuppCode == "" || data.SuppCode == null || data.SuppCode == undefined) {
            $scope.errorSuppCode = true;
            mess.Status = true;
        } else {
            $scope.errorSuppCode = false;
        }
        return mess;
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model = {
        FileName: ''
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                $scope.model = rs;
            }
        });
        dataservice.getSupplier(function (rs) {rs=rs.data;
            $scope.listSupplier = rs;
        })
    }
    $scope.initData();
    $scope.loadImage = function () {
        var fileuploader = angular.element("#File");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('image').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_CHECK_ADD_FILEIMAGE);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
    $scope.submit = function () {
        validationSelect($scope.model)
        if ($scope.editForm.validate() && !validationSelect($scope.model).Status) {
            var files = $('#File').get(0);
            var file = files.files[0];
            var data = new FormData();
            var fileName = '';
            if (file == null) {
                dataservice.update($scope.model, function (result) {result=result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        App.toastrSuccess(result.Title);
                        $uibModalInstance.close();
                    }
                });
            }
            else {
                data.append("FileUpload", file);
                dataservice.uploadImage(data, function (rs) {rs=rs.data;
                    if (rs.Error) {
                        App.toastrError(result.Title);
                        return;
                    }
                    else {
                        $scope.model.FilePath = '/uploads/images/' + rs.Object;
                        dataservice.update($scope.model, function (result) {result=result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                            } else {
                                App.toastrSuccess(result.Title);
                                $uibModalInstance.close();
                            }
                        });
                    }
                });
            }
        }
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "SuppCode" && $scope.model.SuppCode != "" && $scope.model.SuppCode != null && $scope.model.SuppCode != undefined) {
            $scope.errorSuppCode = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.SuppCode == "" || data.SuppCode == null || data.SuppCode == undefined) {
            $scope.errorSuppCode = true;
            mess.Status = true;
        } else {
            $scope.errorSuppCode = false;
        }
        return mess;
    }
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});
