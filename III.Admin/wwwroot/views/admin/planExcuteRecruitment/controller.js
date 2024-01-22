var ctxfolder = "/views/admin/planExcuteRecruitment";
var ctxfolderCommonSetting = "/views/admin/commonSetting";

var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_PER', ['App_ESEIM_DASHBOARD',"App_ESEIM_REPOSITORY", "ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservicePER', function ($http) {
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
        //commomsetting
        getDataType: function (callback) {
            $http.get('/Admin/CommonSetting/GetDataType').then(callback);
        },
        insertCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Insert/', data).then(callback);
        },
        updateCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Update/', data).then(callback);
        },
        deleteCommonSetting: function (data, callback) {
            $http.post('/Admin/CommonSetting/Delete', data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/Insert', data, callback).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/PlanExcuteRecruitment/GetItem/' + data).then(callback);
        },

        //Detail
        insertDetail: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/InsertDetail', data, callback).then(callback);
        },
        updateDetail: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/UpdateDetail', data).then(callback);
        },
        deleteDetail: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/DeleteDetail/' + data).then(callback);
        },
        getItemDetail: function (data, callback) {
            $http.get('/Admin/PlanExcuteRecruitment/GetItemDetail/' + data).then(callback);
        },

        //Combobox
        getListSubject: function (callback) {
            $http.post('/Admin/PlanExcuteRecruitment/GetListSubject').then(callback);
        },
        getListStatusHeader: function (callback) {
            $http.post('/Admin/PlanExcuteRecruitment/getListStatusHeader').then(callback);
        },
        getListStatusDetail: function (callback) {
            $http.post('/Admin/PlanExcuteRecruitment/GetListStatusDetail').then(callback);
        },
        getListCadidate: function (callback) {
            $http.post('/Admin/PlanExcuteRecruitment/GetListCadidate').then(callback);
        },
        getListPlanRecruitment: function (callback) {
            $http.post('/Admin/PlanExcuteRecruitment/GetListPlanRecruitment').then(callback);
        },

        //File
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/PlanExcuteRecruitment/UploadFile', data, callback);
        },

        getListFileHeader: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/GetListFileHeader?objCode=' + data).then(callback);
        },

        getListFileDetail: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/GetListFileDetail?objCode=' + data).then(callback);
        },

        deleteFile: function (data, callback) {
            $http.post('/Admin/PlanExcuteRecruitment/DeleteFile?id=' + data).then(callback);
        },

        getSuggestionsRecruitmentHeaderFile: function (data, callback) {
            $http.get('/Admin/PlanExcuteRecruitment/GetSuggestionsRecruitmentHeaderFile?objCode=' + data).then(callback);
        },
        getSuggestionsRecruitmentDetailFile: function (data, callback) {
            $http.get('/Admin/PlanExcuteRecruitment/GetSuggestionsRecruitmentDetailFile?objCode=' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM_PER', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataservicePER, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptions = {
            rules: {
                RecruitmentCode: {
                    required: true,
                },
                Title: {
                    required: true,
                },
                StartTime: {
                    required: true,
                },
                EndTime: {
                    required: true,
                },
            },
            messages: {
                RecruitmentCode: {
                    required: caption.PER_RECRUITMENT_CODE_MSG_NOT_EMPTY,
                },
                Title: {
                    required: caption.PER_TITLE_MSG_NOT_EMPTY,
                },
                StartTime: {
                    required: caption.PER_START_TIME_MSG_NOT_EMPTY,
                },
                EndTime: {
                    required: caption.PER_END_TIME_MSG_NOT_EMPTY,
                },
            }
        }
        $rootScope.validationDetailOptions = {
            rules: {
                Result: {
                    required: true,
                },
            },
            messages: {
                Result: {
                    required: caption.PER_RESULT_MSG_NOT_EMPTY,
                },
            }
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/PlanExcuteRecruitment/Translation');
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
app.directive('customOnChange', function () {
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
app.directive('customOnChangeHeader', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeHeader);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });
        }
    };
});
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservicePER, $translate, $window) {
    var vm = $scope;
    $scope.model = {
        RecruitmentCode: '',
        Title: '',
    }
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PlanExcuteRecruitment/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.RecruitmentCode = $scope.model.RecruitmentCode;
                d.Title = $scope.model.Title;
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

            $(row).find('td:not(:has(label.mt-checkbox))').on('click', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                    $scope.selected[data.ServiceCatID] = !$scope.selected[data.ServiceCatID];
                } else {
                    var self = $(this).parent();
                    if ($(self).hasClass('selected')) {
                        $(self).removeClass('selected');
                        $scope.selected[data.ServiceCatID] = false;
                    } else {
                        $('#tblData').DataTable().$('tr.selected').removeClass('selected');
                        $scope.selected.forEach(function (obj, index) {
                            if ($scope.selected[index])
                                $scope.selected[index] = false;
                        });
                        $(self).addClass('selected');
                        $scope.selected[data.ServiceCatID] = true;
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

    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml)
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.ServiceCatID] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.ServiceCatID + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RecruitmentCode').withTitle('{{"PER_RECRUITMENT_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Title').withTitle('{{"PER_TITLE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SubjectName').withTitle('{{"PER_SUBJECT_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('{{"PER_START_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('{{"PER_END_TIME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withOption('sClass', 'w75').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<span ng-click="edit(' + full.Id + ')" /*style = "width: 25px; height: 25px; padding: 0px"*/ class="fs25"><i class="fas fa-edit" style="margin-right: 10px; color: #337ab7"></i></span>' +
            '<span title="Xoá" ng-click="delete(' + full.Id + ')" /*style="width: 25px; height: 25px; padding: 0px"*/ class="fs25"><i class="fas fa-trash" style=" color: #337ab7;--fa-primary-color: red;"></i></span>';
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
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.reload = function () {
        reloadData(true);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    };
    $scope.initData = function () {
        $rootScope.RecruitmentCode == '';
    }
    $scope.initData();
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    var size = 0;
    if ($window.innerWidth < 1400) {
        size = 60;
    } else if ($window.innerWidth > 1400) {
        size = 50;
    }

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

    $scope.add = function () {
        $rootScope.ServiceCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '70',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.edit = function (id) {
        dataservicePER.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                $rootScope.RecruitmentCode = rs.RecruitmentCode;
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolder + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '70',
                    resolve: {
                        para: function () {
                            return rs;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reloadNoResetPage();
                }, function () {
                });
            }
        });
    }
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservicePER.delete(id, function (rs) {
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
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservicePER) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        $rootScope.RecruitmentCode = '';

        dataservicePER.getListSubject(function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });

        dataservicePER.getListPlanRecruitment(function (rs) {
            rs = rs.data;
            $scope.listPlan = rs;
        });

        dataservicePER.getListStatusHeader(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
    }
    $scope.initData();

    $scope.uploadFile = function (event) {
        if ($rootScope.RecruitmentCode === null || $rootScope.RecruitmentCode === undefined || $rootScope.RecruitmentCode === '') {
            return App.toastrError(caption.PER_PLAN_NUMBER_MSG_NOT_EMPTY);
        }

        $scope.file = event.target.files[0];
        if ($scope.file !== undefined && $scope.file !== null && $scope.file !== '') {
            var fileName = $scope.file.name;
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            //Kiểm tra định dạng file excel
            var formData = new FormData();
            formData.append("FileUpload", $scope.file);
            formData.append("ObjectCode", $scope.model.RecruitmentCode);
            formData.append("ObjectType", "RECRUITMENT_EXC_HEADER");

            dataservicePER.uploadFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.loadFile();
                }
            });

            $('#btn-upload-file').replaceWith($('#btn-upload-file').val('').clone(true));
        }
    };
    $scope.removeFile = function (fileCode) {
        dataservicePER.removeFile(fileCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.loadFile();
            }
        });
    }
    $scope.download = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.deleteFile = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservicePER.deleteFile(id, function (result) {
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
            $scope.loadFile();
        }, function () {
        });
    }
    $scope.extend = function () {
        dataservicePER.getSuggestionsRecruitmentHeaderFile($rootScope.RecruitmentCode, function (rs) {
            rs = rs.data;
            var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.RecruitmentCode, ObjectType: 'RECRUITMENT_EXC_HEADER' };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderRepository + '/addFile.html',
                controller: 'addFile',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.loadFile();
            }, function () { });
        })
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($rootScope.RecruitmentCode == '' || $rootScope.RecruitmentCode == undefined || $rootScope.RecruitmentCode == null) {
                dataservicePER.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.RecruitmentCode = $scope.model.RecruitmentCode;
                        $rootScope.reload();
                    }
                });
            } else {
                dataservicePER.update($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    } else {
                        App.toastrSuccess(rs.Title);
                        $rootScope.reload();
                    }
                });
            }
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        return mess;
    };
    $scope.loadDate = function () {
        $("#start-time").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:mm",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#end-time').datetimepicker('setStartDate', maxDate);
            //if ($('#start-time').valid()) {
            //    $('#start-time').removeClass('invalid').addClass('success');
            //}
        });
        $("#end-time").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:mm",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#start-time').datetimepicker('setEndDate', maxDate);
            //if ($('#end-time').valid()) {
            //    $('#end-time').removeClass('invalid').addClass('success');
            //}
        });
    }

    setTimeout(function () {
        $scope.loadDate();
        setModalDraggable('.modal-dialog');
    }, 50);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, dataservicePER, para) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.initData = function () {
        $scope.model = para;

        dataservicePER.getListSubject(function (rs) {
            rs = rs.data;
            $scope.listSubject = rs;
        });

        dataservicePER.getListPlanRecruitment(function (rs) {
            rs = rs.data;
            $scope.listPlan = rs;
        });

        dataservicePER.getListStatusHeader(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
    }
    $scope.initData();

    $scope.loadFile = function () {
        dataservicePER.getListFileHeader($scope.model.RecruitmentCode, function (rs) {
            rs = rs.data;
            $scope.listFileHeader = rs;
        });
    }
    $scope.loadFile();

    $scope.uploadFile = function (event) {
        $scope.file = event.target.files[0];
        if ($scope.file !== undefined && $scope.file !== null && $scope.file !== '') {
            var fileName = $scope.file.name;
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            //Kiểm tra định dạng file excel
            var formData = new FormData();
            formData.append("FileUpload", $scope.file);
            formData.append("ObjectCode", $scope.model.RecruitmentCode);
            formData.append("ObjectType", "RECRUITMENT_EXC_HEADER");

            dataservicePER.uploadFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.loadFile();
                }
            });

            $('#btn-upload-file').replaceWith($('#btn-upload-file').val('').clone(true));
        }
    };
    $scope.removeFile = function (fileCode) {
        dataservicePER.removeFile(fileCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.loadFile();
            }
        });
    }
    $scope.download = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.deleteFile = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservicePER.deleteFile(id, function (result) {
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
            $scope.loadFile();
        }, function () {
        });
    }
    $scope.extend = function () {
        dataservicePER.getSuggestionsRecruitmentHeaderFile($rootScope.RecruitmentCode, function (rs) {
            rs = rs.data;
            var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $rootScope.RecruitmentCode, ObjectType: 'RECRUITMENT_EXC_HEADER' };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderRepository + '/addFile.html',
                controller: 'addFile',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.loadFile();
            }, function () { });
        })
    }

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            dataservicePER.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reload();
                }
            });
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        return mess;
    };
    $scope.loadDate = function () {
        $("#start-time").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:mm",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#end-time').datetimepicker('setStartDate', maxDate);
        });
        $("#end-time").datetimepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy hh:mm",
            //dateFormat: "dd/mm/yyyy hh:mm",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#start-time').datetimepicker('setEndDate', maxDate);
        });
    }

    setTimeout(function () {
        $scope.loadDate();
        setModalDraggable('.modal-dialog');
    }, 50);
});
app.controller('detail', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservicePER, $filter) {
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.model = {
        Code: generateUUID()
    };
    $scope.isEditDetail = false;

    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/PlanExcuteRecruitment/JtableDetail",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.RecruitmentCode = $rootScope.RecruitmentCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(5)
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
        });
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CandidateCode').withTitle('{{"PER_DETAIL_CANDIDATE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CandidateName').withTitle('{{"PER_DETAIL_CANDIDATE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('{{"PER_DETAIL_STATUS_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Result').withTitle('{{"PER_DETAIL_RESULT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Note').withTitle('{{"PER_DETAIL_NOTE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').notSortable().withOption('sClass', 'w75').renderWith(function (data, type, full) {
        return '<button title="Sửa" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-edit"></i></button>' +
            '<button title="Xoá" ng-click="delete(' + full.Id + ')" style="width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline red"><i class="fa fa-trash"></i></button>';
    }).withOption('sClass', 'col50'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
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
    function callback(json) {

    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadAttribute = function () {
        $scope.reload();
    }

    $scope.initData = function () {
        dataservicePER.getListCadidate(function (rs) {
            rs = rs.data;
            $scope.listCadidate = rs;
        });

        dataservicePER.getListStatusDetail(function (rs) {
            rs = rs.data;
            $scope.listStatus = rs;
        });
    }
    $scope.initData();

    $scope.loadFile = function () {
        dataservicePER.getListFileDetail($scope.model.Code, function (rs) {
            rs = rs.data;
            $scope.listFileDetail = rs;
        });
    }

    $scope.uploadFileDetail = function (event) {
        if ($scope.model.Code === undefined || $scope.model.Code === '' || $scope.model.Code === null) {
            return App.toastrError(caption.PER_DETAIL_CODE_MSG_NOT_EMPTY);
        } else {
            $scope.fileDetail = event.target.files[0];
            var fileName = $scope.fileDetail.name;
            var idxDot = fileName.lastIndexOf(".") + 1;
            var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
            //Kiểm tra định dạng file excel
            var formData = new FormData();
            formData.append("FileUpload", $scope.fileDetail);
            formData.append("ObjectCode", $scope.model.Code);
            formData.append("ObjectType", "RECRUITMENT_EXC_DETAIL");

            dataservicePER.uploadFile(formData, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    $scope.loadFile();
                }
            });

            $('#btn-upload-file-detail').replaceWith($('#btn-upload-file-detail').val('').clone(true));
        }
    };
    $scope.removeFile = function (fileCode) {
        dataservicePER.removeFile(fileCode, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.loadFile();
            }
        });
    }
    $scope.download = function (fileCode) {
        location.href = "/Admin/EDMSRepository/DownloadFile?fileCode="
            + fileCode;
    }
    $scope.deleteFile = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataservicePER.deleteFile(id, function (result) {
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
            $scope.loadFile();
        }, function () {
        });
    }
    $scope.extend = function () {
        dataservicePER.getSuggestionsRecruitmentDetailFile($scope.model.Code, function (rs) {
            rs = rs.data;
            var data = rs !== '' ? rs : { CatCode: '', ObjectCode: $scope.model.Code, ObjectType: 'RECRUITMENT_EXC_DETAIL' };
            var modalInstance = $uibModal.open({
                templateUrl: ctxfolderRepository + '/addFile.html',
                controller: 'addFile',
                windowClass: 'modal-file',
                backdrop: 'static',
                size: '60',
                resolve: {
                    para: function () {
                        return data;
                    }
                }
            });
            modalInstance.result.then(function (d) {
                $scope.loadFile();
            }, function () { });
        })
    }

    $scope.add = function () {
        validationSelect($scope.model);
        if ($scope.detailform.validate() && !validationSelect($scope.model).Status) {
            App.blockUI({
                target: "#contentMain",
                boxed: true,
                message: 'loading...'
            });

            $scope.model.RecruitmentCode = $rootScope.RecruitmentCode;

            dataservicePER.insertDetail($scope.model, function (rs) {
                rs = rs.data;
                App.unblockUI("#contentMain");
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.reloadAttribute();
                    $scope.clear();
                }
            })
        }
    }
    $scope.edit = function (id) {
        dataservicePER.getItemDetail(id, function (rs) {
            rs = rs.data;
            $scope.model = rs;
            $scope.isEditDetail = true;
            $scope.loadFile();
        })
    }
    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.detailform.validate() && !validationSelect($scope.model).Status) {
            $scope.model.RecruitmentCode = $rootScope.RecruitmentCode;
            dataservicePER.updateDetail($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                }
                else {
                    App.toastrSuccess(rs.Title);
                    $rootScope.isEditAttribute = false;
                    $rootScope.reloadAttribute();
                }
            })
        }
    }
    $scope.cancel = function () {
        $scope.isEditDetail = false;
        $scope.clear();
    }

    $scope.clear = function () {
        $scope.model = {};
        $scope.listFileDetail = [];
    }

    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;//"Bạn có chắc chắn muốn xóa?";
                $scope.ok = function () {
                    dataservicePER.deleteDetail(id, function (result) {
                        result = result.data;
                        if (result.Error) {
                            App.toastrError(result.Title);
                        } else {
                            App.toastrSuccess(result.Title);
                            $rootScope.reloadAttribute();
                            $rootScope.isEditAttribute = false;
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
            $scope.cancel();
        }, function () {
        });
    }

    $scope.changeSelect = function (type) {
        if (type === "CandidateCode") {
            $scope.errorCandidateCode = false;
        }

        if (type === "Status") {
            $scope.errorStatus = false;
        }
    }

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }

        if (data.CandidateCode == "" || data.CandidateCode == undefined || data.CandidateCode == null) {
            $scope.errorCandidateCode = true;
            mess.Status = true;
        } else {
            $scope.errorCandidateCode = false;
        }
        if (data.Status == "" || data.Status == undefined || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        return mess;
    };
});
