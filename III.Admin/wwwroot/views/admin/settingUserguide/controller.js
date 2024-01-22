var ctxfolder = "/views/admin/settingUserguide";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"])
    .directive('customOnChange', function () {
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
            $http.post('/Admin/SettingUserguide/Insert', data).then(callback)
        },
        updateAll: function (data, callback) {
            $http.post('/Admin/SettingUserguide/UpdateAll', data).then(callback)
        },
        delete: function (data, callback) {
            $http.post('/Admin/SettingUserguide/Delete/' + data).then(callback);
        },
        getListHelp: function (callback) {
            $http.post('/Admin/SettingUserguide/GetListHelp').then(callback)
        },
        getListCmsItem: function (data, data1, data2, callback) {
            $http.post('/Admin/SettingUserguide/GetListCmsItem?pageNo=' + data + '&pageSize=' + data1 + '&content=' + data2).then(callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/SettingUserguide/GetItem?helpId=' + data).then(callback);
        },
        getCurrentCmsItem: function (data, callback) {
            $http.post('/Admin/SettingUserguide/GetCurrentCmsItem?articleId=' + data).then(callback);
        },
    }

});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });

        $rootScope.validationOptions = {
            rules: {
                BookMark: {
                    required: true,
                },
                HelpId: {
                    required: true,
                },
            },
            messages: {
                BookMark: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SETT_USERGUIDE_BOOKMARK),
                },
                HelpId: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.SETT_USERGUIDE_HELP_ID)
                },
            }
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/SettingUserguide/Translation');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
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

app.controller('index', function ($scope, $rootScope, $compile, $confirm, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $translate) {
    var vm = $scope;
    $scope.model = {
        Code: '',
        Name: '',
        Status: true
    };

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liRole = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/SettingUserguide/Jtable",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
                $scope.liRole = [];
            },
            type: 'POST',
            data: function (d) {
                d.HelpId = $scope.model.HelpId;
                d.BookMark = $scope.model.BookMark;
                d.ArticleId = $scope.model.ArticleId;
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
        //.withOption('autoWidth', true)
        //.withOption('scrollY', $(window).height() - 220)
        //.withOption('scrollX', false)
        //.withOption('scrollCollapse', true)
        .withOption('headerCallback', function (header) {
            if (!$scope.headerCompiled) {
                $scope.headerCompiled = true;
                $compile(angular.element(header).contents())($scope);
            }
        })
        .withOption('initComplete', function (settings, json) {
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            $scope.liRole.push(data);

            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);


        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("_STT").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full._STT] = false;

            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full._STT + ']" ng-click="toggleOne(selected, $event)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ''));
    vm.dtColumns.push(DTColumnBuilder.newColumn('HelpId').withTitle('{{"SETT_USERGUIDE_HELP_ID" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('ArticleId').withTitle('{{"SETT_USERGUIDE_ARTICLE" | translate}}').renderWith(function (data, type, full, meta) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('BookMark').withTitle('{{"SETT_USERGUIDE_BOOKMARK" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Description').withTitle('{{"SETT_USERGUIDE_DESCRIPTION" | translate}}').renderWith(function (data, type) {
        return decodeHTML(data);
    }));

    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('{{"SETT_USERGUIDE_ACTION" | translate}}').notSortable().renderWith(function (data, type, full, meta) {
        return '<a ng-click="edit(' + full.Id + ')"  class="fs25 pr10"><i class="fas fa-edit" style="--fa-primary-color: green;"></i></a>' +
            '<a ng-click="delete(' + full.Id + ')"  class="fs25"><i class="fas fa-trash" style="--fa-primary-color: red;"></i></a>';
    }).withOption('sWidth', '50px').withOption('sClass', 'nowrap'));
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
    function toggleOne(selectedItems, evt) {
        //$(evt.target).closest('tr').toggleClass('selected');

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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.pageSize = 10;
    $scope.listCmsItem = [];
    $scope.init = function () {
        $rootScope.loadMore = function ($select, $event) {
            if (!$event) {
                $rootScope.page = 1;
                $rootScope.items = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.page++;
            }
            dataservice.getListCmsItem($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
                rs = rs.data;
                $scope.listCmsItem = $scope.listCmsItem.concat(rs);
                $scope.listCmsItem = removeDuplicate($scope.listCmsItem);
            });
        };
    }
    $scope.init();

    $rootScope.reloadCmsItem = function (input) {
        $rootScope.codeSearch = input;
        $rootScope.page = 1;
        $rootScope.items = [];
        dataservice.getListCmsItem($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
            rs = rs.data;
            $scope.listCmsItem = $scope.listCmsItem.concat(rs);
            $scope.listCmsItem = removeDuplicate($scope.listCmsItem);
        });
    }

    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60'
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
            $scope.reload();
        });
    }
    $scope.edit = function (id) {
        var data = {};
        var listdata = $('#tblDataSubject').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                data = listdata[i];
                break;
            }
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                    return data;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
            $scope.reload();
        });
    };

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservice.delete(id, function (result) {
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
            $scope.reload();
        }, function () {
        });
    };

    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            str = str.replace('\n', '\\n');
            str = str.replace('name', 'label');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }
    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].Id == itm.Id) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
    };
});

app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, $translate, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.model = {
        HelpId: '',
        ArticleId: '',
        BookMark: '',
        Description: ''
    };
    $scope.model1 = {
        ListUser: [],
        UserName: '',
        GivenName: '',
        Status: 'WORKING_SCHEDULE_NOT_APPROVED'
    };

    $scope.model = {
        BackgroundColor: '',
        BackgroundImage: '',
        StartDate: '',
        ListUser: '',
        EndDate: '',
        Location: '',
        Content: ''
    };

    $scope.model2 = {
        CmsItemCode: '',
        CmsItemName: ''
    }
    $rootScope.pageSize = 10;
    $scope.listCmsItem = [];
    $scope.isUserInList = false;
    $scope.listStatus = [{
        Code: 'WORKING_SCHEDULE_NOT_APPROVED',
        Name: 'Chưa duyệt'
    },
    {
        Code: 'WORKING_SCHEDULE_APPROVED',
        Name: 'Đã duyệt'
    },];
    $scope.listhelp = [

    ];
    $scope.init = function () {
        //dataservice.getListHelp(function (rs) {
        //    rs = rs.data;
        //    $scope.listhelp = rs;
        //});
        $rootScope.loadMore = function ($select, $event) {
            if (!$event) {
                $rootScope.page = 1;
                $rootScope.items = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.page++;
            }
            dataservice.getListCmsItem($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
                rs = rs.data;
                $scope.listCmsItem = $scope.listCmsItem.concat(rs);
                $scope.listCmsItem = removeDuplicate($scope.listCmsItem);
            });
        };
    }
    $scope.init();

    $rootScope.reloadCmsItem = function (input) {
        $rootScope.codeSearch = input;
        $rootScope.page = 1;
        $rootScope.items = [];
        dataservice.getListCmsItem($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
            rs = rs.data;
            $scope.listCmsItem = $scope.listCmsItem.concat(rs);
            $scope.listCmsItem = removeDuplicate($scope.listCmsItem);
        });
    }
    $scope.transformGroup = function (newTag) {
        var item = {
            Code: newTag,
        };
        return item;
    }
    $scope.submit = function () {
        $scope.model.Description = CKEDITOR.instances.Content.getData();
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservice.insert($scope.model, function (rs) {
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
    $scope.changeCmsItem = function(item) {
        if ($scope.model.ArticleId == "" || $scope.model.ArticleId == null || $scope.model.ArticleId == undefined) {
            $scope.errorArticleId = true;
        } else {
            $scope.errorArticleId = false;
        }
    }

    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].Id == itm.Id) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
    };

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null ArticleId
        if (data.ArticleId == "" || data.ArticleId == null || data.ArticleId == undefined) {
            $scope.errorArticleId = true;
            mess.Status = true;
        } else {
            $scope.errorArticleId = false;
        }
        return mess;
    };

    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            str = str.replace('\n', '\\n');
            str = str.replace('name', 'label');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }
    function ckEditer() {
        var editor = CKEDITOR.replace('Content', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Content'].config.height = 80;
    }
    $timeout(function () {
        ckEditer()
        setModalDraggable('.modal-dialog');
    }, 100);
});

app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservice, para, $translate, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    $scope.model = {
        Id: para.Id,
        HelpId: para.HelpId,
        ArticleId: para.ArticleId,
        //BookMark: para.BookMark,
        //Description: para.Description
    };
    $scope.listhelp = [

    ];
    $rootScope.pageSize = 10;
    $scope.listCmsItem = [];
    $scope.init = function () {
        //dataservice.getListHelp(function (rs) {
        //    rs = rs.data;
        //    $scope.listhelp = rs;
        //});
        dataservice.getItem(para.HelpId, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            $scope.model.ArticleId = parseInt(rs.ArticleId);
        });
        dataservice.getCurrentCmsItem(para.ArticleId,
            function(rs) {
                rs = rs.data;
                $scope.listCmsItem.push(rs);
            });
        $rootScope.loadMore = function ($select, $event) {
            if (!$event) {
                $rootScope.page = 1;
                $rootScope.items = [];
            } else {
                $event.stopPropagation();
                $event.preventDefault();
                $rootScope.page++;
            }
            dataservice.getListCmsItem($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
                rs = rs.data;
                $scope.listCmsItem = $scope.listCmsItem.concat(rs);
                $scope.listCmsItem = removeDuplicate($scope.listCmsItem);
            });
        };
    }
    $scope.init();

    $rootScope.reloadCmsItem = function (input) {
        $rootScope.codeSearch = input;
        $rootScope.page = 1;
        $rootScope.items = [];
        dataservice.getListCmsItem($rootScope.page, $rootScope.pageSize, $rootScope.codeSearch, function (rs) {
            rs = rs.data;
            $scope.listCmsItem = $scope.listCmsItem.concat(rs);
            $scope.listCmsItem = removeDuplicate($scope.listCmsItem);
        });
    }
    $scope.transformGroup = function (newTag) {
        var item = {
            Code: newTag,
        };
        return item;
    }
    $scope.submit = function () {
        $scope.model.Description = CKEDITOR.instances.Description.getData();
        validationSelect($scope.model);
        if ($scope.editform.validate() && !validationSelect($scope.model).Status) {
            dataservice.updateAll($scope.model, function (rs) {
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
    $scope.changeCmsItem = function(item) {
        if ($scope.model.ArticleId == "" || $scope.model.ArticleId == null || $scope.model.ArticleId == undefined) {
            $scope.errorArticleId = true;
        } else {
            $scope.errorArticleId = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null ArticleId
        if (data.ArticleId == "" || data.ArticleId == null || data.ArticleId == undefined) {
            $scope.errorArticleId = true;
            mess.Status = true;
        } else {
            $scope.errorArticleId = false;
        }
        return mess;
    };
    function removeDuplicate(array) {
        res = [];
        len = array.length;

        while (len--) {
            var itm = array[len];
            var isDuplicate = false;
            for (i = 0; i < res.length; i++) {
                if (res[i].Id == itm.Id) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                res.unshift(itm);
            }
        }
        return res;
    };
    function ckEditer() {
        var editor = CKEDITOR.replace('Description', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Description'].config.height = 80;
    }
    $timeout(function () {
        ckEditer()
        setModalDraggable('.modal-dialog');
    }, 100);
});

