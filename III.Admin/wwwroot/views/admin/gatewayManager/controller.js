var ctxfolderTokenManager = "/views/admin/gatewayManager";
var ctxfolderTokenManagerMessage = "/views/message-box";
var ctxfolderTokenManagerFileShare = "/views/admin/fileObjectShare";
var ctxfolderTokenManagerCommonSetting = "/views/admin/commonSetting";

var app = angular.module('App_ESEIM_Token_Manager', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'dynamicNumber']);
app.directive('autoLoad', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var src = scope.$eval(attrs.autoLoad);
            //element.on('change', onChangeHandler);
            //element.on('$destroy', function () {
            //    element.off();
            //});
            if (element.length && element.length > 0 && src != '' && src != null) {
                element[0].src = src;
                element.css('background', 'white');
            }
        }
    };
});
app.factory("interceptors", [function () {
    return {
        // if beforeSend is defined call it
        'request': function (request) {
            if (request.beforeSend)
                request.beforeSend();

            return request;
        },
        // if complete is defined call it
        'response': function (response) {
            if (response.config.complete)
                response.config.complete(response);
            return response;
        }
    };
}]);
app.filter("fomartDateTime", function ($filter) {
    return function (date) {
        var dateNow = $filter('date')(new Date(), 'dd/MM/yyyy');
        var createDate = $filter('date')(new Date(date), 'dd/MM/yyyy');
        if (dateNow == createDate) {
            var today = new Date();
            var created = new Date(date);
            var diffMs = (today - created);
            var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            if (diffHrs <= 0) {
                if (diffMins <= 0) {
                    return 'Vừa xong';
                } else {
                    return diffMins + ' phút trước';
                }
            } else {
                return diffHrs + ' giờ ' + diffMins + ' phút trước.';
            }
        } else {
            return $filter('date')(new Date(date), 'dd/MM/yyyy lúc h:mma');
        }
    }
});
app.factory('dataserviceTokenManager', function ($http) {
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
        insert: function (data, callback) {
            $http.post('/Admin/GatewayManager/InsertCustomToken', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/GatewayManager/UpdateCustomToken', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/GatewayManager/Delete?id=' + data).then(callback);
        },
        getListService: function (callback) {
            $http.post('/Admin/GatewayManager/GetListService').then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/GatewayManager/GetItem?id=' + data).then(callback);
        },
        // upload image
        uploadImage: function (data, callback) {
            submitFormUpload('/Admin/materialProduct/UploadImage/', data, callback);
        },
    };
});
app.controller('Ctrl_ESEIM_Token_Manager', function ($scope, $rootScope, $cookies, $translate, dataserviceTokenManager, $filter) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        captionTm = captionTm[culture];
        $.extend($.validator.messages, {
            min: captionTm.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^đĐ!@#$%^&*<>?\s]*$/g;
            var partternTelephone = /[0-9]/g;
            var partternVersion = /^\d+(\.\d+)*$/g;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ContractCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", captionTm.COM_VALIDATE_ITEM_CODE.replace("{0}", captionTm.CONTRACT_CURD_LBL_CONTRACT_CODE), "<br/>");//"Mã hợp đồng không chứa ký tự đặc biệt hoặc khoảng trắng!"
            }
            if (!partternVersion.test(data.Version) && data.Version != null) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", "Phiên bản nhập không đúng", "<br/>");//"Phiên bản phải là chữ số!"
            }
            return mess;
        }
        $rootScope.validationOptions = {
            rules: {
                GatewayCode: {
                    required: true,
                },
                GatewayName: {
                    required: true,
                },
                Email: {
                    required: true,
                },
            },
            messages: {
                GatewayCode: {
                    required: /*captionTm.TOKEN_MANAGER_VALIDATE_ACCOUNT_CODE*/"Mã cổng thanh toán không được bỏ trống"
                },
                GatewayName: {
                    required: /*captionTm.TOKEN_MANAGER_VALIDATE_ACCOUNT_NAME*/"Tiêu đề cổng thanh toán không được bỏ trống"
                },
                Email: {
                    required: /*captionTm.TOKEN_MANAGER_VALIDATE_EMAIL*/"Thư điện tử không được bỏ trống"
                },
            }
        }
        dataserviceTokenManager.getListService(function (rs) {
            rs = rs.data;
            if (!rs.Error) {
                $rootScope.listService = rs.Object;
            }
        });
        $rootScope.listType = [
            { Code: 'MEETING_SCHEDULE', Name: captionTm.TOKEN_MANAGER_TYPE_MEETING },
            { Code: 'GROUP', Name: captionTm.TOKEN_MANAGER_TYPE_GROUP },
            { Code: 'REPOSITORY', Name: captionTm.TOKEN_MANAGER_TYPE_REPOSITORY },
            { Code: 'MATH', Name: captionTm.TOKEN_MANAGER_TYPE_MATH }];
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider) {
    $translateProvider.useUrlLoader('/Admin/TokenManager/Translation');
    captionTm = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderTokenManager + '/index.html',
            controller: 'indexTokenManager'
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
    $httpProvider.interceptors.push('interceptors');
});
app.controller('indexTokenManager', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceTokenManager, $window, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        GatewayName: '',
        Email: '',
    }
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/GatewayManager/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.GatewayName = $scope.model.GatewayName;
                d.Email = $scope.model.Email;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableViewportManual(268, '#tblDataRequestImport');
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
                        $('#tblDataRequestImport').DataTable().$('tr.selected').removeClass('selected');
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
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.ID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GatewayName').withTitle(/*'{{"TOKEN_MANAGER_ACCOUNT_NAME"|translate}}'*/"Tên cổng thanh toán").withOption('sClass', ' dataTable-pr0 nowrap').renderWith(function (data, type) {
        return '<span class="text-brown bold">' + data + '</span>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Logo').withTitle(/*'{{"MLP_LIST_COL_PATHIMG" | translate}}'*/"Logo").withOption('sClass', ' dataTable-pr0 nowrap').renderWith(function (data, type) {
        return '<img class="img-circle img-responsive img-250" src="' + data + '" onerror =' + "'" + 'this.src="' + '/images/default/no_image.png' + '"' + "'" + 'height="65" width="65">';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('ServiceType').withTitle(/*'{{"TOKEN_MANAGER_TYPE"|translate}}'*/"Nhà cung cấp").withOption('sClass', ' dataTable-pr0 nowrap').renderWith(function (data, type) {
        //switch (data) {
        //    case 'Paypal':
        //        data = '<span class="text-green">' + captionTm.TOKEN_MANAGER_TYPE_MEETING + '</span>';
        //        break;

        //    case 'GROUP':
        //        data = '<span class="text-purple">' + captionTm.TOKEN_MANAGER_TYPE_GROUP + '</span>';
        //        break;

        //    case 'REPOSITORY':
        //        data = '<span class="text-purple">' + captionTm.TOKEN_MANAGER_TYPE_REPOSITORY + '</span>';
        //        break;

        //    case 'MATH':
        //        data = '<span class="text-purple">' + captionTm.TOKEN_MANAGER_TYPE_MATH + '</span>';
        //        break;
        //}

        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('GatewayCode').withTitle(/*'{{"TOKEN_MANAGER_ACCOUNT_CODE"|translate}}'*/"Mã cổng thanh toán").withOption('sClass', ' dataTable-pr0 w110').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Email').withTitle(/*'{{"TOKEN_MANAGER_EMAIL"|translate}}'*/"Thư điện tử").withOption('sClass', 'tleft dataTable-pr0  w300').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle(/*'{{"TOKEN_MANAGER_EMAIL"|translate}}'*/"Người tạo").withOption('sClass', 'tleft dataTable-pr0  w300').renderWith(function (data, type) {
        return data;
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedTime').withTitle(/*'{{"TOKEN_MANAGER_EMAIL"|translate}}'*/"Thời gian tạo").withOption('sClass', 'tleft dataTable-pr0  w300').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"COM_LIST_COL_ACTION"|translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
        return '<a title="{{&quot;COM_BTN_EDIT&quot; | translate}}" ng-click="edit(' + full.Id + ')" style1= "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class1="btn btn-icon-only btn-circle btn-outline blue"><i class="fas fa-edit fs25 pr20"></i></a>' +
            '<a title="{{&quot;COM_BTN_DELETE&quot; | translate}}" ng-click="delete(' + full.Id + ')" style1="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class1="btn btn-icon-only btn-circle btn-outline red"><i class="fas fa-trash-alt fs25 text-danger pr20"></i></a>';
    }));

    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    };
    function callback(json) {

    };
    function toggleAll(selectAll, selectedItems) {
        for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
                selectedItems[id] = selectAll;
            }
        }
    };
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
    };
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 55;
    } else if ($window.innerWidth > 1400) {
        size = 50;
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
            templateUrl: ctxfolderTokenManager + '/add.html',
            controller: 'addTokenManager',
            backdrop: 'static',
            size: size
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.edit = function (id) {
        dataserviceTokenManager.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderTokenManager + '/edit.html',
                    controller: 'editTokenManager',
                    backdrop: 'static',
                    size: size,
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () { });
            }
        })
    };
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderTokenManagerMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = captionTm.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceTokenManager.delete(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
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
    }, 50);
});
app.controller('addTokenManager', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataserviceTokenManager, $filter, $window) {
    $scope.model = {
        //Group: 'ZOOM',
        ServiceType: ''
    }
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        $scope.model.ConfigJson = JSON.stringify($scope.listNewAttr);
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            $scope.insertImage(function () {
                dataserviceTokenManager.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        //App.toastrSuccess(rs.Title);
                        //if (rs.Object != null) {
                        //    $window.open(rs.Object, '_blank');
                        //}
                        $uibModalInstance.close();
                        App.toastrSuccess(rs.Title);
                    }
                });
            })
        }
    }
    $scope.insertImage = function (callback) {
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                callback();
            }
            else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
                    callback();
                } else {
                    var fileUpload = $("#file").get(0);
                    var reader = new FileReader();
                    reader.readAsDataURL(fileUpload.files[0]);
                    reader.onload = function (e) {
                        ////
                        //Initiate the JavaScript Image object.
                        var image = new Image();
                        //Set the Base64 string return from FileReader as source.
                        image.src = e.target.result;
                        image.onload = function () {
                            //Determine the Height and Width.
                            var height = this.height;
                            var width = this.width;
                            if (width > 5000 || height > 5000) {
                                App.toastrError(caption.MLP_MSG_IMG_SIZE_MAXIMUM);
                                callback();
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceTokenManager.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        callback();
                                    }
                                    else {
                                        $scope.model.Logo = '/uploads/images/' + rs.Object;
                                        ok = true;
                                        callback();
                                    }
                                })
                            }
                        };
                    }
                }
            }
        }
        else {
            callback();
        }
    }
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
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
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.listNewAttr = [];
    $scope.currentId = 0;

    $scope.addNewAttr = function () {
        var newAttr = {
            Id: $scope.currentId,
            AttrName: '',
            Value: '',
        };
        $scope.listNewAttr.push(newAttr);
        $scope.currentId = $scope.currentId + 1;
    }

    $scope.deleteNewAtt = function (id) {
        for (var i = 0; i < $scope.listNewAttr.length; i++) {
            if ($scope.listNewAttr[i].Id == id) {
                $scope.listNewAttr.splice(i, 1);
                break;
            }
        }
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ServiceType" && $scope.model.Type != "") {
            $scope.errorServiceType = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ServiceType == "" || data.ServiceType == undefined || data.ServiceType == null) {
            $scope.errorServiceType = true;
            mess.Status = true;
        } else {
            $scope.errorServiceType = false;
        }

        return mess;
    };

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
app.controller('editTokenManager', function ($scope, $filter, $rootScope, $compile, $uibModal, $uibModalInstance, dataserviceTokenManager, para, $window) {
    $scope.model = {};
    $scope.listNewAttr = [];
    $scope.initLoad = function () {
        $scope.model = para;
        try {
            $scope.listNewAttr = JSON.parse($scope.model.ConfigJson);
            console.log($scope.listNewAttr.length);
        } catch (e) {
            console.log(e);
        }
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.submit = function () {
        $scope.model.ConfigJson = JSON.stringify($scope.listNewAttr);
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            $scope.insertImage(function () {
                dataserviceTokenManager.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $uibModalInstance.close();
                    }
                });
            })
        }
    }
    $scope.insertImage = function (callback) {
        var fileName = $('input[type=file]').val();
        var idxDot = fileName.lastIndexOf(".") + 1;
        var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        if (extFile !== "") {
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.MLP_MSG_FORMAT_REQUIRED);
                callback();
            }
            else {
                var fi = document.getElementById('file');
                var fsize = (fi.files.item(0).size) / 1024;
                if (fsize > 1024) {
                    App.toastrError(caption.MLP_MSG_FILE_SIZE_MAXXIMUM);
                    callback();
                } else {
                    var fileUpload = $("#file").get(0);
                    var reader = new FileReader();
                    reader.readAsDataURL(fileUpload.files[0]);
                    reader.onload = function (e) {
                        ////
                        //Initiate the JavaScript Image object.
                        var image = new Image();
                        //Set the Base64 string return from FileReader as source.
                        image.src = e.target.result;
                        image.onload = function () {
                            //Determine the Height and Width.
                            var height = this.height;
                            var width = this.width;
                            if (width > 5000 || height > 5000) {
                                App.toastrError(caption.MLP_MSG_IMG_SIZE_MAXIMUM);
                                callback();
                            } else {
                                var data = new FormData();
                                file = fileUpload.files[0];
                                data.append("FileUpload", file);
                                dataserviceTokenManager.uploadImage(data, function (rs) {
                                    rs = rs.data;
                                    if (rs.Error) {
                                        App.toastrError(rs.Title);
                                        callback();
                                    }
                                    else {
                                        $scope.model.Logo = '/uploads/images/' + rs.Object;
                                        ok = true;
                                        callback();
                                    }
                                })
                            }
                        };
                    }
                }
            }
        }
        else {
            callback();
        }
    }
    $scope.selectImage = function () {
        var fileuploader = angular.element("#file");
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
            if (extFile !== "jpg" && extFile !== "jpeg" && extFile !== "png" && extFile !== "gif" && extFile !== "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click');
    }
    $scope.currentId = 0;

    $scope.addNewAttr = function () {
        var newAttr = {
            Id: $scope.currentId,
            AttrName: '',
            Value: '',
        };
        $scope.listNewAttr.push(newAttr);
        $scope.currentId = $scope.currentId + 1;
    }

    $scope.deleteNewAtt = function (id) {
        for (var i = 0; i < $scope.listNewAttr.length; i++) {
            if ($scope.listNewAttr[i].Id == id) {
                $scope.listNewAttr.splice(i, 1);
                break;
            }
        }
    }

    $scope.changleSelect = function (SelectType) {
        if (SelectType == "ServiceType" && $scope.model.Type != "") {
            $scope.errorServiceType = false;
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.ServiceType == "" || data.ServiceType == undefined || data.ServiceType == null) {
            $scope.errorServiceType = true;
            mess.Status = true;
        } else {
            $scope.errorServiceType = false;
        }

        return mess;
    };

    setTimeout(function () {
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});
