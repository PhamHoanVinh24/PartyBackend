var ctxfolder = "/views/admin/userManual";
var ctxfolderMessage = "/views/message-box";
var ctxfolderFilePlugin = "/views/admin/filePlugin";

var app = angular.module('App_ESEIM', ["App_ESEIM_CMS_CAT", "App_ESEIM_CMS_ITEM", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", "dndLists"]);

app.directive('myRepeatDirective', function ($timeout) {
    return {
        restrit: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            scope.$watch('$last', function (newValue) {
                if (newValue) {
                    $timeout(function () {
                        scope.model.isCmsLoadingFinished = true;
                        scope.$apply();
                    })
                }
            });
        }
    }
});

app.directive('treeGridUserManual', function ($parse) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attrs) {
            scope.$watch(attrs['ngModel'], function (newValue) {
                if (newValue) {
                    console.log('finish loading');
                    el.treegrid({
                        expanderExpandedClass: 'fa fa-caret-up pull-right pt5',
                        expanderCollapsedClass: 'fa fa-caret-down pull-right pt5',
                        saveState: true,
                    });
                    isLoad = true;
                    //el.treegrid('collapseAll');

                    //unset trigger
                    scope.model.isCmsLoadingFinished = false;
                    scope.$emit();
                }
                //setTimeout(function () {
                //}, 1000);
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
    return {
        getVideo: function (callback) {
            $http.post('/Admin/UserManual/GetVideo').then(callback);
        },
        getListCMS: function (data, callback) {
            $http.post('/Admin/UserManual/GetListCMS?cmsCatId=' + data).then(callback);
        },
        getContentCms: function (data, callback) {
            $http.get('/Admin/UserManual/GetContentCms?id=' + data).then(callback);
        },
        pasteCmsItem: function (data, data1, callback) {
            $http.post('/Admin/UserManual/PasteCmsItem?itemId=' + data + '&targetCatId=' + data1).then(callback);
        },
        getItemFile: function (data, data1, data2, callback) {
            $http.get('/Admin/EDMSRepository/GetItemFile?id=' + data + '&IsEdit=' + data1 + '&mode=' + data2).then(callback);
        },
        getDetailItemFile: function (data, callback) {
            $http.post('/Admin/ExamHome/GetFileItem?id=' + data).then(callback);
        },
    }
});

app.factory('httpResponseInterceptor', ['$q', '$rootScope', '$location', function ($q, $rootScope, $location) {
    return {
        responseError: function (rejection) {
            if (rejection.status === 401) {
                var url = "/Home/Logout";
                location.href = url;
            }
            return $q.reject(rejection);
        }
    };
}]);

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, $cookies, $translate, dataservice, dataserviceCmsCat, dataserviceCmsItem) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.VALIDATE_VALUE_MIN,
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9\[\]]+[^!@#$%^&*<>?]*$/; //Có chứa được khoảng trắng
            var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.FunctionCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace('{0}', caption.ADM_FUNC_CURD_LBL_FUNC_CODE), "<br/>");
            }
            if (!partternName.test(data.Title)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM_NAME.replace('{0}', caption.ADM_FUNC_CURD_LBL_FUNC_NAME) + "<br/>";
            }
            if (!partternDescription.test(data.Description)) {
                mess.Status = true;
                mess.Title += " - " + caption.COM_VALIDATE_ITEM.replace('{0}', caption.ADM_FUNC_LIST_COL_FUNC_DESCRIPTION) + "<br/>";
            }
            return mess;
        }
    });
    $rootScope.group == "USER_MANUAL";
    dataserviceCmsCat.gettreedata(function (result) {
        result = result.data;
        $scope.listParenCat = result;
    });
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $httpProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $translateProvider.useUrlLoader('/Admin/UserManual/Translation');
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
    $httpProvider.interceptors.push('httpResponseInterceptor');
});

app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, $window, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, dataserviceFilePlugin, $filter, $location, $anchorScroll) {
    // JTable
    angular.element("#breadcrumb").appendTo(angular.element("#breadcrumb-sub"));
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = { Content: "", parent: 307, isCmsLoadingFinished: false };
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UserManual/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.Content = $scope.model.Content;
                //d.cmsCatGroupId = $scope.model.parent;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableAutoCustom();
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [0, 'asc'])
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
            //$(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
            //    if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
            //        $scope.selected[data.Id] = !$scope.selected[data.Id];
            //    } else {
            //        var self = $(this).parent();
            //        if ($(self).hasClass('selected')) {
            //            $(self).removeClass('selected');
            //            $scope.selected[data.Id] = false;
            //        } else {
            //            $('#tblDataRequestImport').DataTable().$('tr.selected').removeClass('selected');
            //            $scope.selected.forEach(function (obj, index) {
            //                if ($scope.selected[index])
            //                    $scope.selected[index] = false;
            //            });
            //            $(self).addClass('selected');
            //            $scope.selected[data.Id] = true;
            //        }
            //    }

            //    vm.selectAll = false;
            //    $scope.$apply();
            //});
            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.viewContent(Id);
                    //$scope.edit(Id);
                }
            });
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().withOption('sClass', 'hidden').renderWith(function (data, type, full, meta) {
        $scope.selected[full.ID] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"USER_MANUAL_TITLE"|translate}}').withOption('sClass', ' dataTable-pr0 w110').renderWith(function (data, type) {
        return '<a>' + data + '</a>';
    }));

    //vm.dtColumns.push(DTColumnBuilder.newColumn('Content').withTitle('{{"Nội dung"|translate}}').withOption('sClass', 'tleft dataTable-pr0  w300').renderWith(function (data, type) {
    //    return data;
    //}));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Created').withTitle('{{"USER_MANUAL_CREATE_DATE"|translate}}').withOption('sClass', 'tleft dataTable-pr0 w300 nowrap').renderWith(function (data, type) {
        return data;
    }));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('CreatedBy').withTitle('{{"Người tạo"|translate}}').withOption('sClass', 'tleft dataTable-pr0 w300 nowrap').renderWith(function (data, type) {
    //    return data;
    //}));
    //vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"COM_LIST_COL_ACTION"|translate}}').withOption('sClass', 'nowrap dataTable-w80').renderWith(function (data, type, full, meta) {
    //    return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(85,168,253,0.45);" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
    //        '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px;-webkit-box-shadow: 0 2px 5px 0 rgba(230,60,95,0.45)" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    //}));

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
    // JTable end
    $(".content-wrapper").removeClass("padding-right-60");
    //$("#nav-right").addClass("hidden");
    var listColor = ['#f1c40f', '#3498db', '#9b59b6', '#2ecc71'];
    $scope.isCmsLoadingFinished = false;
    $scope.listCms = [];
    $scope.markId = 0;
    $scope.initData = function () {
        dataservice.getListCMS($scope.model.parent, function (rs) {
            rs = rs.data;
            $scope.listCms = rs;
            for (var i = 0; i < $scope.listCms.length; i++) {
                if ($scope.listCms[i].Level == 0) {
                    $scope.listCms[i].IsExpand = true;
                } else {
                    $scope.listCms[i].IsExpand = false;
                }

                for (var j = 0; j < $scope.listCms[i].ListCmsItem.length; j++) {
                    if ($scope.listCms[i].Level == 0) {
                        $scope.listCms[i].ListCmsItem[j].IsShow = true;
                    } else {
                        $scope.listCms[i].ListCmsItem[j].IsShow = false;
                    }
                }
            }
        })
    }
    $scope.initData();

    $scope.expand = function (item) {
        item.IsExpand = !item.IsExpand;
        for (var j = 0; j < item.ListCmsItem.length; j++) {
            item.ListCmsItem[j].IsShow = item.IsExpand;
            //if (item.Level == 0) {
            //    item.ListCmsItem[j].IsShow = true;
            //} else {
            //    item.ListCmsItem[j].IsShow = item.IsExpand;
            //}
        }
    }

    $scope.viewContent = function (id, idCat) {
        $scope.markId = id;
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getContentCms(id, function (rs) {
            rs = rs.data;
            $scope.listFile = rs.ListFile;

            $('#viewContent').html(rs.Content);
            $compile(angular.element("#viewContent"))($scope);
            App.unblockUI("#contentMain");
        })
    }

    var obj = {
        Type: '',
        Source: ''
    };

    $scope.addCmsCategory = function () {
        var parent = $scope.model.parent;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCmsCat + '/add.html',
            controller: 'addCmsCat',
            backdrop: 'static',
            windowClass: 'custom-width',
            resolve: {
                para: function () {
                    return parent;
                }
            },
            size: '50'
        });
        modalInstance.result.then(function (d) {
            $scope.reloadCmsCat(false);
        }, function () {
            $scope.reloadCmsCat(false);
        });
    };

    $scope.editCmsCategory = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCmsCat + '/edit.html',
            controller: 'editCmsCat',
            backdrop: 'static',
            windowClass: 'custom-width',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadCmsCat(false);
        }, function () {
            $scope.reloadCmsCat(false);
        });
    }

    $scope.addCmsItem = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCmsItem + '/add.html',
            controller: 'addCmsItm',
            backdrop: 'static',
            windowClass: 'custom-width',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            },
        });
        modalInstance.result.then(function (d) {
            $scope.reloadCmsCat(false);
        }, function () {
            $scope.reloadCmsCat(false);
        });
    };

    $scope.editCmsItem = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderCmsItem + '/add.html',
            controller: 'editCmsItm',
            backdrop: 'static',
            windowClass: 'custom-width',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reloadCmsCat(false);
        }, function () {
            $scope.reloadCmsCat(false);
        });
    };

    $scope.viewFile = function (item) {
        var typeFile = item.FileTypePhysic;
        switch (typeFile) {
            case '.mp4':
                obj.Type = 'video';
                dataservice.getDetailItemFile(item.Id, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        obj.Source = result.Object;
                        $scope.viewFileDetail(obj);
                    }
                });
                break;

            case '.mp3':
                obj.Type = 'audio';
                dataservice.getDetailItemFile(item.Id, function (result) {
                    result = result.data;
                    if (result.Error) {
                        App.toastrError(result.Title);
                    } else {
                        obj.Source = result.Object;
                        $scope.viewFileDetail(obj);
                    }
                });
                break;

            case '.doc':
            case '.docx':
                $scope.viewWord(item, 1);
                break;

            case '.xls':
            case '.xlsx':
                $scope.viewExcel(item, 1);
                break;

            case '.pdf':
                $scope.viewPDF(item, 1);
                break;

            case '.jpg':
            case '.png':
                $scope.download(item.Id);
                break;

            default:
                $scope.download(item.Id);
                break;
        }
    }

    $scope.viewExcel = function (item, mode) {
        if (item.Id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (item.SizeOfFile < 20971520) {
                dataservice.getItemFile(item.Id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                console.log(object.Link);
                                $window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/Excel#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            $window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/Excel#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError('Dung lượng file giới hạn');
            }

        }
    };

    $scope.mark = function (item) {
        oldValue = item.IsMarked;

        for (var i = 0; i < $scope.listCms.length; i++) {
            $scope.listCms[i].IsMarked = false;
        }

        item.IsMarked = !oldValue;
    }

    $scope.viewWord = function (item, mode) {
        if (item.Id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (item.SizeOfFile < 20971520) {
                dataservice.getItemFile(item.Id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                console.log(object.Link);
                                $window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/Docman#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            $window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/Docman#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError('Dung lượng file giới hạn');
            }
        }
    };

    $scope.viewPDF = function (item, mode) {
        if (item.Id === 0) {
            App.toastrError(caption.COM_MSG_NOT_SUPPORT);
            return null;
        } else {
            if (item.SizeOfFile < 20971520) {
                dataservice.getItemFile(item.Id, true, mode, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        if (rs.ID === -1) {
                            App.toastrError(rs.Title);
                            var object = rs.Object;
                            if (object != null && object.Type == "DRIVER") {
                                console.log(object.Link);
                                $window.open(object.Link, '_blank');
                            } else {
                                setTimeout(function () {
                                    window.open('/Admin/PDF#', '_blank');
                                }, 2000);
                            }
                        } else {
                            App.toastrError(rs.Title);
                        }
                        return null;
                    } else {
                        var object = rs.Object;
                        if (object != null && object.Type == "DRIVER") {
                            $window.open(object.Link, '_blank');
                        } else {
                            window.open('/Admin/PDF#', '_blank');
                        }
                    }
                });
            } else {
                App.toastrError('Dung lượng file giới hạn');
            }
        }
    };

    $scope.viewFileDetail = function (item) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/viewFile.html',
            controller: 'viewFile',
            backdrop: 'static',
            size: '40',
            resolve: {
                para: function () {
                    return item;
                }
            }
        });
        modalInstance.result.then(function (d) {

        }, function () {
        });
    }
    $scope.goToHash = function(hash) {
        // set the location.hash to the id of
        // the element you wish to scroll to.
        $location.hash(hash);

        // call $anchorScroll()
        $anchorScroll();
    };

    $scope.download = function (id) {
        location.href = "/Admin/EDMSRepository/Download?"
            + "Id=" + id;
    }

    $scope.backMobile = function () {
        $(".nav-left").addClass('nav-left-full');
        $(".nav-right").addClass('nav-right-hide');
    }

    $scope.search = function () {
        $scope.markId = 0;
        reloadData(true);
    }
    $scope.reloadCmsCat = function (resetList) {
        dataservice.getListCMS($scope.model.parent, function (rs) {
            rs = rs.data;
            var listCms = rs;
            for (var i = 0; i < listCms.length; i++) {
                if (listCms[i].Level == 0) {
                    listCms[i].IsExpand = true;
                } else {
                    listCms[i].IsExpand = false;
                }

                listCms[i].IsMarked = false;
                for (var j = 0; j < listCms[i].ListCmsItem.length; j++) {
                    if (listCms[i].Level == 0) {
                        listCms[i].ListCmsItem[j].IsShow = true;
                    } else {
                        listCms[i].ListCmsItem[j].IsShow = false;
                    }
                }
            }
            if (resetList == true) {
                $scope.listCms = listCms;
            }
            else {
                for (var i = 0; i < listCms.length; i++) {
                    var cmsIndex = $scope.listCms.findIndex(x => x.Id == listCms[i].Id);
                    if (cmsIndex != -1) {
                        listCms[i].IsExpand = $scope.listCms[cmsIndex].IsExpand;
                        listCms[i].IsMarked = $scope.listCms[cmsIndex].IsMarked;
                        for (var j = 0; j < listCms[i].ListCmsItem.length; j++) {
                            if (listCms[i].IsExpand == true) {
                                listCms[i].ListCmsItem[j].IsShow = true;
                            } else {
                                listCms[i].ListCmsItem[j].IsShow = false;
                            }
                        }
                    }
                }
                $scope.listCms = listCms;
            }
        })
        reloadData(true);
    }
    $scope.cancel = function () {
        dataservice.getListCMS($scope.model.parent, function (rs) {
            rs = rs.data;
            $scope.listCms = rs;
            for (var i = 0; i < $scope.listCms.length; i++) {
                $scope.listCms[i].IsExpand = false;

                for (var j = 0; j < $scope.listCms[i].ListCmsItem.length; j++) {
                    if ($scope.listCms[i].Level == 0) {
                        $scope.listCms[i].ListCmsItem[j].IsShow = true;
                    } else {
                        $scope.listCms[i].ListCmsItem[j].IsShow = false;
                    }
                }
            }
        })
    }

    $rootScope.copyItemId = '';
    $rootScope.listFileCopy = [];
    $scope.copyCmsItem = function (itemId) {
        $rootScope.copyItemId = itemId;
        App.blockUI({
            target: "#contentMain",
            boxed: true,
            message: 'loading...'
        });
        dataservice.getContentCms(itemId, function (rs) {
            rs = rs.data;
            $rootScope.listFileCopy = rs.ListFile;
            App.unblockUI("#contentMain");
        })
    }

    $scope.pasteCmsItem = function (targetCatId) {
        if ($rootScope.copyItemId == '' || $rootScope.copyItemId == null || $rootScope.copyItemId == undefined) {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });
            dataservice.pasteCmsItem($rootScope.copyItemId, targetCatId, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                    $rootScope.copyItemId = '';
                    $rootScope.listFileCopy = [];
                    return null;
                } else {
                    var cmsItemId = rs.ID;
                    App.unblockUI("#contentMain");
                    $scope.reloadCmsCat(false);
                    for (var item of $rootScope.listFileCopy) {
                        var actionData = {
                            Action: 'Copy',
                            FileIdFrom: item.FileID,
                            CatIdTo: '',
                            ObjectCode: cmsItemId
                        };
                        //App.blockUI({
                        //    target: "#contentMain",
                        //    boxed: true,
                        //    message: 'loading...'
                        //});
                        dataserviceFilePlugin.pasteObjectFile(actionData, function (result) {
                            result = result.data;
                            if (result.Error) {
                                App.toastrError(result.Title);
                                //App.unblockUI("#contentMain");
                            } else {
                                //App.toastrSuccess(result.Title);
                                defaultShareFile(result.ID);
                                //$scope.reload();
                                //App.unblockUI("#contentMain");
                                //$scope.file = null;
                                //$('.inputFile').val('');
                            }
                        });
                    }
                }
            });
        }
    }

    function defaultShareFile(id) {
        if ($rootScope.ObjectTypeFile != "ACT_CAT") {
            dataserviceFilePlugin.getListUserShare(function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
                $scope.lstUserShare = [];
                if ($scope.listUser.length > 0) {
                    for (var i = 0; i < $scope.listUser.length; i++) {
                        var item = {
                            Code: $scope.listUser[i].Code,
                            Name: $scope.listUser[i].Name,
                            DepartmentName: $scope.listUser[i].DepartmentName,
                            Permission: $scope.permission
                        }
                        $scope.lstUserShare.push(item);
                    }
                    $scope.modelShare.Id = id;
                    $scope.modelShare.LstShare = JSON.stringify($scope.lstUserShare);
                    dataserviceFilePlugin.autoShareFilePermission($scope.modelShare, function (rs) { })
                }
            });
        }
        else {
            dataserviceFilePlugin.getListUserShareActCat($rootScope.ObjCode, function (rs) {
                rs = rs.data;
                $scope.listUser = rs;
                $scope.lstUserShare = [];
                if ($scope.listUser.length > 0) {
                    for (var i = 0; i < $scope.listUser.length; i++) {
                        var item = {
                            Code: $scope.listUser[i].Code,
                            Name: $scope.listUser[i].Name,
                            DepartmentName: $scope.listUser[i].DepartmentName,
                            Permission: $scope.permission
                        }
                        $scope.lstUserShare.push(item);
                    }
                    $scope.modelShare.Id = id;
                    $scope.modelShare.LstShare = JSON.stringify($scope.lstUserShare);
                    dataserviceFilePlugin.autoShareFilePermission($scope.modelShare, function (rs) { })
                }
            });
        }
    };
});

app.controller('viewFile', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, $uibModalInstance, $filter, $translate, para) {
    $scope.cancel = function () {
        $uibModalInstance.close();
    }
    $scope.model = para;
    setTimeout(function () {
        setModalDraggable('.modal-dialog');
    }, 200)
});