var ctxfolder = "/views/admin/cmsDocument";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'ui.tinymce', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    };
    return {
        getUser: function (callback) {
            $http.post('/Admin/FundCurrency/GetUser').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/CMSDocument/GetItem/', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/CMSDocument/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/CMSDocument/Update/', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/CMSDocument/Delete/' + data).then(callback);
        },
        getCategory: function (callback) {
            $http.post('/Admin/CMSDocument/GetCategory').then(callback);
        },
        getPublished: function (callback) {
            $http.post('/Admin/CMSDocument/GetPublished').then(callback);
        }
    };
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
            if (!partternCode.test(data.CurrencyCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.FCC_MSG_ITEM_CODE, "<br/>");
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                CurrencyCode: {
                    required: true,
                    maxlength: 10
                },
                Title: {
                    required: true,
                },
                Alias: {
                    required: true,
                },
                IndexNumber: {
                    required: true,
                },
                Summary: {
                    required: true,
                }
            },
            messages: {
                CurrencyCode: {
                    required: caption.FCC_VALIDATE_FCC_CODE,
                    maxlength: caption.FCC_VALIDATE_FCC_CODE_MAX_LENGTH
                },
                Title: {
                    required: "Tiêu đề không được bỏ trống"
                },
                Alias: {
                    required: "Đường dẫn không được bỏ trống",
                },
                IndexNumber: {
                    required: "Số ký hiệu không được bỏ trống",
                },
                Summary: {
                    required: "Trích yếu không được bỏ trống",
                }
            }
        }
    });
    dataservice.getUser(function (rs) {
        rs = rs.data;
        $rootScope.listUser = rs;
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/CMSDocument/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        });
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        CurrencyCode: '',
        DefaultPayment: '',
        Note: '',
    };
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.initData = function () {
        dataservice.getCategory(function (rs) {
            rs = rs.data;
            $scope.listCategory = rs;
        });
        dataservice.getPublished(function (rs) {
            rs = rs.data;
            $scope.listPublished = rs;
        });
    };
    $scope.initData();
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CMSDocument/Jtable",
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
                d.categoryName = $scope.model.categoryName;
                d.published = $scope.model.published;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAuto();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
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
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'tcenter hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('stt').withTitle('{{"#" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('title').withTitle('{{"Tiêu đề" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('categoryName').withTitle('{{"Chuyên mục" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('published').withTitle('{{"Published" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('postDate').withTitle('{{"Ngày đăng" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('createDate').withTitle('{{"Ngày tạo" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('modifiedDate').withTitle('{{"Ngày sửa" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('id').withTitle('{{"ID" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full, meta) {
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
    };
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.search = function () {
        reloadData(true);
    };
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 70;
    } else if ($window.innerWidth > 1400) {
        size = 60;
    }
    $scope.add = function () {
        
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: size,
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: size,
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

    $scope.approve = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmUpdate.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.FCC_MSG_SET_DEFAULT;
                $scope.ok = function () {
                    
                    dataservice.setDefaultPayment(id, function (rs) {
                        rs = rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                        } else {
                            
                            dataservice.unSetDefaultPayment(id, function (rs) {
                                rs = rs.data;
                                if (rs.Error) {

                                } else {
                                    App.toastrSuccess(rs.Title);
                                    $uibModalInstance.close();
                                }
                            });
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
            size: '25'
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
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice) {
    $scope.model = {
        CurrencyCode: '',
        DefaultPayment: false,
        Note: '',
        cat_id:''
    };
    $scope.model1 = {
        listMember: []
    };
    $scope.listLanguage = [
        {
            code: "all",
            name: "Tất cả"
        }, {
            code: "vi_VN",
            name: "Tiếng Việt"
        }, {
            code: "en_US",
            name: "English"
        }
    ];
    $scope.listAgencyIssued = [
        {
            code: "Bộ giao thông vận tải",
            name: "Bộ giao thông vận tải"
        }, {
            code: "Bộ giáo dục và đào tạo",
            name: "Bộ giáo dục và đào tạo"
        }, {
            code: "Bộ quốc phòng",
            name: "Bộ quốc phòng"
        }
    ];
    $scope.listTypeDocument = [
        {
            code: "Hiến pháp",
            name: "Hiến pháp"
        }, {
            code: "Nghị định",
            name: "Nghị định"
        }
    ];
    $scope.listField = [
        {
            code: "Nghĩa vụ quân sự",
            name: "Nghĩa vụ quân sự"
        }, {
            code: "Dân quân tự vệ",
            name: "Dân quân tự vệ"
        }
    ];
    $scope.listDisplay = [
        {
            code: "Hiển thị phần văn bản quản lý, chỉ đạo hướng dẫn",
            name: "Hiển thị phần văn bản quản lý, chỉ đạo hướng dẫn"
        }
    ];
    $scope.initData = function () {
        dataservice.getCategory(function (rs) {
            rs = rs.data;
            $scope.listCategory = rs;
        });
    };
    $scope.initData();
    $scope.tinymceOptions = {
        plugins: 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help',
        toolbar: "formatselect bold italic strikethrough forecolor link  alignleft aligncenter alignright alignjustify numlist bullist outdent indent removeformat fullscreen"
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            //var temp = $rootScope.checkData($scope.model);
            //if (temp.Status) {
            //    App.toastrError(temp.Title);
            //    return;
            //}
            dataservice.insert($scope.model, function (rs) {
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

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "cat_id" && $scope.model.cat_id != "") {
            $scope.errorCatId = false;
        }
    }
    function initDateTime() {
        $("#date-post").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii:ss",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
        $("#releaseDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
        $("#effectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
        $("#expiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.cat_id == "") {
            $scope.errorCatId = true;
            mess.Status = true;
        } else {
            $scope.errorCatId = false;
        }
        return mess;
    }
    setTimeout(function () {
        initDateTime();
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para) {
    $scope.model1 = {
        listMember: []
    };
    $scope.model = {
        cat_id:'',
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.listAgencyIssued = [
        {
            code: "Bộ giao thông vận tải",
            name: "Bộ giao thông vận tải"
        }, {
            code: "Bộ giáo dục và đào tạo",
            name: "Bộ giáo dục và đào tạo"
        }, {
            code: "Bộ quốc phòng",
            name: "Bộ quốc phòng"
        }
    ];
    $scope.listTypeDocument = [
        {
            code: "Hiến pháp",
            name: "Hiến pháp"
        }, {
            code: "Nghị định",
            name: "Nghị định"
        }
    ];
    $scope.listField = [
        {
            code: "Nghĩa vụ quân sự",
            name: "Nghĩa vụ quân sự"
        }, {
            code: "Dân quân tự vệ",
            name: "Dân quân tự vệ"
        }
    ];
    $scope.listDisplay = [
        {
            code: "Hiển thị phần văn bản quản lý, chỉ đạo hướng dẫn",
            name: "Hiển thị phần văn bản quản lý, chỉ đạo hướng dẫn"
        }
    ];
    $scope.listLanguage = [
        {
            code: "all",
            name: "Tất cả"
        }, {
            code: "vi_VN",
            name: "Tiếng Việt"
        }, {
            code: "en_US",
            name: "English"
        }
    ];
    $scope.initData = function () {
        dataservice.getItem(para, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $scope.model = rs;
            }
        });
        dataservice.getCategory(function (rs) {
            rs = rs.data;
            $scope.listCategory = rs;
        });
    };
    $scope.initData();
    $scope.tinymceOptions = {
        plugins: 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor wordcount imagetools contextmenu colorpicker textpattern help',
        toolbar: "formatselect bold italic strikethrough forecolor link  alignleft aligncenter alignright alignjustify numlist bullist outdent indent removeformat fullscreen"
    };
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            
            $scope.model.ActMember = $scope.model1.listMember.join(',');
            dataservice.update($scope.model, function (rs) {
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

    $scope.changeSelect = function (SelectType) {
        if (SelectType == "cat_id" && $scope.model.cat_id != "") {
            $scope.errorCatId = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.cat_id == "") {
            $scope.errorCatId = true;
            mess.Status = true;
        } else {
            $scope.errorCatId = false;
        }
        return mess;
    }
    function initDateTime() {
        $("#date-post").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:ii:ss",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

            });
        $("#releaseDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

            });
        $("#effectiveDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

            });
        $("#expiryDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {

        });
    }
    setTimeout(function () {
        initDateTime();
        setModalDraggable('.modal-dialog');
    }, 200);
});