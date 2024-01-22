var ctxfolderSVC = "/views/admin/commitmentHeader";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM_SVC', ["ui.bootstrap", "angularjs-dropdown-multiselect", 'ng.jsoneditor', 'dynamicNumber', "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ui.tinymce']);

app.directive('customOnChangeCommit', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChangeCommit);
            element.on('change', onChangeHandler);
            element.on('$destroy', function () {
                element.off();
            });

        }
    };
});
app.directive('tooltip', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            var content = "";
            if (attr.tooltipData != null && attr.tooltipData != "") {
                scope.$watch($parse(attr.tooltipData), function (newval) {
                    content = newval;
                });
            }
            element.hover(function(){
                // on mouseenter
                element.tooltip('show');
            }, function(){
                // on mouseleave
                element.tooltip('hide');
            });
        }
    };
});
app.directive("drawing", function ($timeout) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                scope.canvasWidth = element.width();
                if (element.height() > 0 && element.width() > 0 && element.width() >= 200 && scope.isLoad == null) {
                    element.attr('height', element.height());
                    element.attr('width', element.width());
                    scope.isLoad = false;
                    var signaturePad = new SignaturePad(element[0]);
                    signaturePad.addEventListener('endStroke', async () => {
                        scope.signB64 = await signaturePad.toDataURL();
                        scope.isModified = true;
                        if (scope.errorSignature == true) {
                            $timeout(function () {
                                scope.changleSelect('Signature');
                                scope.$apply();
                            })
                        }
                    });
                    scope.signaturePad = signaturePad;
                }
                if (scope.signUrl && scope.signB64 == "" && scope.isLoad == false && scope.canvasWidth >= 200) {
                    scope.isLoad = true;
                    const myImage = new Image(scope.canvasWidth, 200);
                    myImage.crossOrigin = "anonymous";
                    myImage.crossOrigin = "anonymous";
                    myImage.src = scope.signUrl;
                    myImage.onload = function () {
                        scope.signB64 = getBase64Image(myImage);
                        scope.signaturePad.fromDataURL(scope.signB64,
                            {
                                ratio: undefined,
                                width: element.width(),
                                height: 200,
                                xOffset: undefined,
                                yOffset: undefined
                            });
                    }
                }
            });
            function getBase64Image(img) {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                return canvas.toDataURL("image/png");
                // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
            }
        }
    };
});
app.factory('dataserviceSVC', function ($http) {
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
    var submitFormUploadAsync = async function (url, data) {
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        }
        return await $http(req);
    }
    return { //API   get : get data and not do anything with this 
        insert: function (data, callback) {
            $http.post('/Admin/CommitmentHeader/Insert/', data).then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/CommitmentHeader/Update', data).then(callback);
        },
        delete: function (data, callback) {
            $http.post('/Admin/CommitmentHeader/Delete/' + data).then(callback);
        },
        getItem: function (data, callback) {
            $http.get('/Admin/CommitmentHeader/GetItem/' + data).then(callback);
        },
        getStatusCommitmentHeader: function (callback) {
            $http.post('/Admin/CommitmentHeader/GetStatusCommitmentHeader').then(callback);
        },
        getSurrogateCommitmentHeader: function (callback) {
            $http.post('/Admin/CommitmentHeader/GetSurrogateCommitmentHeader').then(callback);
        },
        insertDetail: function (data, callback) {
            $http.post('/Admin/CommitmentHeader/InsertDetail/', data).then(callback);
        }, // need a , please focus
        deleteDetail: function (data, callback) {
            $http.post('/Admin/CommitmentHeader/DeleteDetail/', data).then(callback);
        },
        getCompanyRule: function (callback) {
            $http.post('/Admin/CommitmentHeader/GetCompanyRule').then(callback);
        },
        getCommitmentDetail: function (data, callback) {
            $http.post('/Admin/CommitmentHeader/GetCommitmentDetail?commitmentCode=' + data).then(callback);
        },
        uploadFile: function (data, callback) {                                                       // Upload file
            submitFormUpload('/Admin/CommitmentHeader/UploadFile', data, callback);
        },
        removeFile: function (data, callback) {                                                       //Remove File
            $http.post('/Admin/CommitmentHeader/RemoveFile?Id=' + data, callback).then(callback);
        },
        uploadFileSignature: async function (data) {                                                       // Upload file
            return await submitFormUploadAsync('/Admin/CommitmentHeader/UploadFileSignature', data);
        },
        uploadFileCommitment: async function (data) {                                                       // Upload file
            return await submitFormUploadAsync('/Admin/CommitmentHeader/UploadFileCommitment', data);
        },
        deleteFile: function (data, callback) {
            $http.post('/Admin/CommitmentHeader/DeleteFile?filePath=' + data).then(callback);
        },
    }
});
app.controller('Ctrl_ESEIM_SVC', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, $confirm, DTColumnBuilder, DTInstances, dataserviceSVC, $cookies, $translate) {
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
                CommitmentCode: {
                    required: true,
                },
                Title: {
                    required: true,
                },
                StartDate: {
                    required: true,
                },
                EndDate: {
                    required: true,
                },
            },
            messages: {
                CommitmentCode: {
                    required: caption.CMH_VALIDATE_CODE,
                },
                Title: {
                    required: caption.CMH_VALIDATE_TITLE,
                },
                StartDate: {
                    required: caption.CMH_VALIDATE_START_DATE,
                },
                EndDate: {
                    required: caption.CMH_VALIDATE_END_DATE,
                },
            }
        }
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/CommitmentHeader/Translation');
    //$translateProvider.preferredLanguage('en-US');
    caption = $translateProvider.translations();

    $routeProvider
        .when('/', {
            templateUrl: ctxfolderSVC + '/index.html',
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
app.controller('index', function ($scope, $rootScope, $confirm, $filter, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataserviceSVC, $translate, $window,) {
    // declare variable : khai báo biến
    $scope.model = {
        CommitmentCode: '',
        Title: '',
        UserID: '',
        FromDate: '',
        ToDate: '',
        Status: '',
        Surrogate: ''
    }
    // config main table 
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/CommitmentHeader/Jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.CommitmentCode = $scope.model.CommitmentCode;
                d.Title = $scope.model.Title;
                d.UserId = $scope.model.UserId;
                d.Surrogate = $scope.model.Surrogate;
                d.Status = $scope.model.Status;
                d.FromDate = $scope.model.FromDate;
                d.ToDate = $scope.model.ToDate;
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {

                } else {
                    var Id = data.Id;
                    $scope.edit(Id);
                }
            });
        });

    // creat collumn
    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', ' hidden'));
    // creat column ID
    vm.dtColumns.push(DTColumnBuilder.newColumn('Id').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"ID" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, full, type) {
        return '<span class="badge-customer badge-customer-success ml-1" style = "background-color: #3c92e8fc !important;">' + data + '</span>'
    }));
    // creat column ID
    vm.dtColumns.push(DTColumnBuilder.newColumn('CommitmentCode').withTitle('<i class="fa fa-paper-plane mr5 "></i>{{"CMH_CODE_AND_NAME" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, full, type) {
        /*console.log(type, data)*/
        return '<span>' + ' ' + ' </span>' + '<span style =" font - family: system - ui; font-weight : 700;font - size: 15px;">' + type.Title + '</span>' + '<br>' + '<span></span>' + '[' + '<span  style = "color: #2bb742 !important;">' + ' ' + data + ' ' + '</span>' + ']'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"CMH_CMM_GIVEN_NAME" | translate}}').withOption('sClass', 'nowrap w20', 'dashed').renderWith(function (data, full, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StartTime').withTitle('<i class="fas fa-calendar-check mr5"></i>{{"CMH_START_TIME" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, full, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EndTime').withTitle('<i class="fas fa-calendar-exclamation mr5"></i>{{"CMH_END_TIME" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, full, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('StatusName').withTitle('<i class="fa fa-newspaper-o mr5"></i>{{"CMH_STATUS" | translate}}').withOption('sClass', 'nowrap w20').renderWith(function (data, full, type) {
        return '<span class="badge-customer badge-customer-success ml-1" style = "background-color: #3c92e8fc !important;">' + data + '</span>'
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('SurrogateName').withTitle('<i class="fas fa-head-side-brain mr5"></i>{{"CMH_SURROGATE" | translate}}').withOption('sClass', 'nowrap w50').renderWith(function (data, full, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Noted').withTitle('<i class="fas fa-exclamation mr5"></i>{{"CMH_NOTE" | translate}}').withOption('sClass', 'nowrap w80').renderWith(function (data, full, type) {
        return data;
    }));
    // tạo stick thao tác
    vm.dtColumns.push(DTColumnBuilder.newColumn('Flag').notSortable().withOption('sClass', 'w75 nowrap').withTitle('{{"COM_LIST_COL_ACTION" | translate}}').renderWith(function (data, type, full) {
        return '<a title="{{"COM_BTN_EDIT" | translate}}" ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 10px" class=""><i style="--fa-primary-color: green;" class="fa-solid fa-pen-to-square fs25"></i></a>' +
            '<a title="{{"COM_BTN_DELETE" | translate}}" ng-click="delete(' + full.Id + ')" style = "width: 25px; height: 25px; padding-right: 5px" class=""><i style="--fa-primary-color: red;" class="fa-solid fa-trash fs25"></i></a>';
    }));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    function toggleAll(
        All, selectedItems) {
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
    $filter('date')(new Date($scope.model.EffectiveDate), 'dd/MM/yyyy');

    // init function to populate data to controller
    $scope.initData = function () {
        dataserviceSVC.getStatusCommitmentHeader(function (rs) {
            rs = rs.data;
            $rootScope.listStatusCommitmentHeader = rs;
        });
        dataserviceSVC.getSurrogateCommitmentHeader(function (rs) {
            rs = rs.data;
            $rootScope.listSurrogateCommitmentHeader = rs;
        });
    }
    $scope.initData();
    // toggle on off search box
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    // popup add form to insert data into database
    $scope.add = function () {
        $rootScope.ServiceCode = '';
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolderSVC + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '50',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        },
            function () {
                $scope.reload();
            });
    }

    // popup edit form to edit existing data in database
    $scope.edit = function (id) {
        dataserviceSVC.getItem(id, function (rs) {
            rs = rs.data;
            if (rs.Object === undefined || rs.Object === null || rs.Object === '') {
                App.toastrError(caption.CMS_ITEM_MSG_ERR_GET_DATA);
            } else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: ctxfolderSVC + '/edit.html',
                    controller: 'edit',
                    backdrop: 'static',
                    size: '60',
                    resolve: {
                        para: function () {
                            return rs.Object;
                        }
                    }
                });
                modalInstance.result.then(function (d) {
                    $scope.reload();
                }, function () {
                    $scope.reload();
                });
            }
        });
    }

    // popup confirm dialog to delete existing data in database
    $scope.delete = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolderMessage + '/messageConfirmDeleted.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
                $scope.message = caption.COM_MSG_DELETE_CONFIRM_COM;
                $scope.ok = function () {
                    dataserviceSVC.delete(id, function (rs) {
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
            $scope.reloadNoResetPage();
        });
    }

    function decodeHTML(str) {
        var element = document.createElement('div');
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }
    window.decodeHTML = decodeHTML;

    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#ToDate').datepicker('setStartDate', null);
            }
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#FromDate').datepicker('setEndDate', null);
            }
        });
    }
    setTimeout(function () {
        loadDate();
    }, 50);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $confirm, $uibModalInstance, $filter, dataserviceSVC, $timeout, $window) {  // add = insert
    // declare variable
    $scope.model = {
        CommitmentCode: '',
        Title: '',
        UserId: '',
        StartTime: '',
        EndTime: '',
        Status: '',
        Surrogate: '',
        Signature: '',
        Noted: '',
        FileReference: '',
    }
    $scope.id = '';
    $scope.file = '';
    $scope.listFile = [];
    $scope.listFileRemove = [];
    $scope.signUrl = "";
    $scope.signB64 = "";
    $scope.isModified = false;
    // init signature
    $scope.init = function () {
        $scope.newSignature = {};
        $scope.signatures = [];
        $scope.moveToList = [];
        $scope.lineToList = [];
        //dataservice => list => forEach: Check = false****
        dataserviceSVC.getCompanyRule(function (rs) { //get da
            rs = rs.data;
            $rootScope.listRule = rs;
            $rootScope.listRule.forEach(x => {
                x.Check = false;
                x.Note = decodeHTML(x.Note);
            });
        }); // Call ItemCompanyRule
    };
    // run after declare it
    $scope.init();
    // cancel to close popup
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
    // submit to save model to database
    $scope.uploadFileSign = async function (file, name) {
        const body = new FormData();
        body.append('file', file, name);
        var result = await dataserviceSVC.uploadFileSignature(body);
        result = result.data;
        return result.Object;
    }
    $scope.uploadFileCommitment = async function (file, name) {
        const body = new FormData();
        body.append('file', file, name);
        var result = await dataserviceSVC.uploadFileCommitment(body);
        result = result.data;
        return result.Object;
    }
    $scope.submit = async function () {
        if (CKEDITOR.instances['Content']) {
            var data = CKEDITOR.instances['Content'].getData();
            $scope.model.Noted = data;
        }
        if ($scope.signUrl == "" && $scope.signB64 || $scope.isModified) {
            var regex = /data:(.*);base64,(.*)/;
            var matches = $scope.signB64.match(regex);
            var signBlob = b64toBlob(matches[2], matches[1]);
            var fileName = create_UUID() + ".png";
            var result = await $scope.uploadFileSign(signBlob, fileName);
            $scope.model.Signature = result.FilePath;
        } else {
            $scope.model.Signature = $scope.signUrl;
        }
        $scope.model.FileReference = JSON.stringify($scope.listFile);
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            if ($scope.id == '') {
                dataserviceSVC.insert($scope.model, function (rs) {
                    rs = rs.data;
                    if (rs.Error) {
                        App.toastrError(rs.Title);
                    }
                    else {
                        App.toastrSuccess(rs.Title);
                        $scope.id = rs.Object; //id return from insert header
                        //$uibModalInstance.close(); //close popup when finish but not necessary
                    }
                });
            }
        }
    }
    // listen when user choose a item in combobox
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Surrogate" && $scope.model.Surrogate != "") {
            $scope.errorSurrogate = false;
        }
        if (SelectType == "Signature" && $scope.signB64 != "" && $scope.signB64 != null) {
            $scope.errorSignature = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
    }
    // insert detail****
    $scope.insertDetail = function (item) {
        if ($scope.id == '') {
            return App.toastrError(caption.CMH_SAVE_FIRST);
        }
        item.Check = true;
        var obj = {
            ItemCode: item.Code,
            CommitmentCode: $scope.model.CommitmentCode
        }
        dataserviceSVC.insertDetail(obj, function (rs) {    // Lưu lại detail
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    }
    // delete detail****
    $scope.deleteDetail = function (item) {
        if ($scope.id = '') {
            return App.toastrError(caption.CMH_SAVE_FIRST);
        }
        item.Check = false;
        var obj = {
            ItemCode: item.Code,
            CommitmentCode: $scope.model.CommitmentCode
        }
        dataserviceSVC.deleteDetail(obj, function (rs) {    //Xóa detail
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    }
    // upload file signature
    $scope.loadFileSignature = async function ($event) {
        if (!$event.target.files || $event.target.files.length <= 0 || $event.target.files[0].size / 1024 > 20480) {
            App.toastrError(caption.CMH_VALIDATE_FILE);
        } else {
            var file = $event.target.files[0];
            var result = await $scope.uploadFileSign(file, file.name);
            $scope.signUrl = result.FilePath;
            $scope.signB64 = await blobToBase64(file);
            $event.target.value = "";
            await $scope.signaturePad.fromDataURL($scope.signB64, { ratio: undefined, width: $scope.canvasWidth, height: 200, xOffset: undefined, yOffset: undefined });
            $scope.isModified = false;
        }
    }
    // upload file signature
    $scope.loadFileRef = async function ($event) {
        if (!$event.target.files || $event.target.files.length <= 0 || $event.target.files[0].size / 1024 > 20480) {
            App.toastrError(caption.CMH_VALIDATE_FILE);
        } else {
            var checkExits = $scope.listFile.filter(k => k.FileName === $event.target.files[0].name);
            if (checkExits.length == 0) {
                var file = $event.target.files[0];
                var result = await $scope.uploadFileCommitment(file, file.name);
                $scope.listFile.push(result);
                $timeout(function () {
                    $scope.$apply();
                });
            } else {
                App.toastrError(caption.COM_MSG_FILE_EXISTS);
            }
        }
    }
    //remove file
    $scope.removeFile = function (index) {
        var itemRemove = $scope.listFile[index];
        dataserviceSVC.deleteFile(itemRemove.ShortPath, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.listFile.splice(index, 1);
            }
        });
    }
    //Show, hide header
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = false;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = true;
    }
    // validate model (show error when user do not enter specific value)
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null Surrogate
        if (data.Surrogate == "" || data.Surrogate == null) {
            $scope.errorSurrogate = true;
            mess.Status = true;
        } else {
            $scope.errorSurrogate = false;
        }
        //Check null Signature
        if (data.Signature == "" || data.Signature == null) {
            $scope.errorSignature = true;
            mess.Status = true;
        } else {
            $scope.errorSignature = false;
        }
        //Check null Status
        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        //Check null UserId
        if (data.UserId == "" || data.UserId == null) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        return mess;
    };
    function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    async function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.toString());
            reader.readAsDataURL(blob);
        });
    }
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    // convert textbox into ckeditor (word editor)
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

    function loadDate() {
        $("#StartDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
            $scope.addform.validate()
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EndDate').datepicker('setStartDate', null);
                $scope.addform.validate();
            }
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#StartDate').datepicker('setEndDate', maxDate);
            $scope.addform.validate()
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#StartDate').datepicker('setEndDate', null);
                $scope.addform.validate()
            }
        });
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
    // a function that run later instead of instantly
    setTimeout(function () {
        loadDate();
        setModalDraggable('.modal-dialog');
        ckEditer();
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $filter, $confirm, $timeout, $uibModalInstance, dataserviceSVC, para) {
    // declare variable
    $scope.model = {
        CommitmentCode: '',
        Title: '',
        UserId: '',
        StartTime: '',
        EndTime: '',
        Status: '',
        Surrogate: '',
        Signature: '',
        Noted: '',
        FileReference: '',
    }
    $scope.id = '';
    $scope.file = '';
    $scope.listFile = [];
    $scope.listFileRemove = [];
    $scope.signUrl = "";
    $scope.signB64 = "";
    $scope.isModified = false;
    // Upload async function
    $scope.uploadFileSign = async function (file, name) {
        const body = new FormData();
        body.append('file', file, name);
        var result = await dataserviceSVC.uploadFileSignature(body);
        result = result.data;
        return result.Object;
    }
    $scope.uploadFileCommitment = async function (file, name) {
        const body = new FormData();
        body.append('file', file, name);
        var result = await dataserviceSVC.uploadFileCommitment(body);
        result = result.data;
        return result.Object;
    }
    //Show, hide header  
    $scope.isShowHeader = true;
    $scope.showHeaderCard = function () {
        $scope.isShowHeader = false;
    }
    $scope.hideHeader = function () {
        $scope.isShowHeader = true;
    }

    // cancel to close popup
    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    }
    // insert detail****
    $scope.insertDetail = function (item) {
        item.Check = true;
        var obj = {
            ItemCode: item.Code,
            CommitmentCode: $scope.model.CommitmentCode
        }
        dataserviceSVC.insertDetail(obj, function (rs) {    // Lưu lại detail
            rs = rs.data;
            if (rs.Error) {
                /*App.toastrError(rs.Title);*/
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    }
    // delete detail****
    $scope.deleteDetail = function (item) {
        item.Check = false;
        var obj = {
            ItemCode: item.Code,
            CommitmentCode: $scope.model.CommitmentCode
        }
        dataserviceSVC.deleteDetail(obj, function (rs) {    //Xóa detail
            rs = rs.data;
            if (rs.Error) {
                /*App.toastrError(rs.Title);*/
            }
            else {
                App.toastrSuccess(rs.Title);
            }
        });
    }
    // Call ItemcompanyRule ****
    $scope.initData = function () {
        $scope.model = para;
        $scope.signUrl = $scope.model.Signature;
        var startTime = moment($scope.model.StartTime);
        var userTimezoneOffset = startTime.toDate().getTimezoneOffset() * 60000;
        $scope.model.StartTime = moment(new Date(startTime.toDate().getTime() - userTimezoneOffset)).format("DD/MM/YYYY");
        var endTime = moment($scope.model.EndTime);
        userTimezoneOffset = endTime.toDate().getTimezoneOffset() * 60000;
        $scope.model.EndTime = moment(new Date(endTime.toDate().getTime() - userTimezoneOffset)).format("DD/MM/YYYY");
        if ($scope.model.UserId == null) {
            $scope.model.UserId = $scope.model.UserID;
        }
        try {
            $scope.listFile = JSON.parse($scope.model.FileReference);
            console.log($scope.listFile.length);
        } catch (e) {
            $scope.listFile = [];
        }
        dataserviceSVC.getCompanyRule(function (rs) {  //dataservice => list => forEach: Check = false
            rs = rs.data;
            $rootScope.listRule = rs; //return array about item_code
            $rootScope.listRule.forEach(x => {
                x.Check = false;
                x.Note = decodeHTML(x.Note);
                // x.Check = false;
            });
            dataserviceSVC.getCommitmentDetail($scope.model.CommitmentCode, function (result) {
                result = result.data;
                $rootScope.listRule.forEach(x => {
                    var index = result.findIndex(y => y.Code == x.Code);
                    if (index != -1) {
                        x.Check = true;
                    }
                })
            });
        });

        // Gọi ItemCompanyRule
    }
    $scope.initData();
    // upload file signature
    $scope.loadFileSignature = async function ($event) {
        if (!$event.target.files || $event.target.files.length <= 0 || $event.target.files[0].size / 1024 > 20480) {
            App.toastrError(caption.CMH_VALIDATE_FILE);
        } else {
            var file = $event.target.files[0];
            var result = await $scope.uploadFileSign(file, file.name);
            $scope.signUrl = result.FilePath;
            $scope.signB64 = await blobToBase64(file);
            $event.target.value = "";
            await $scope.signaturePad.fromDataURL($scope.signB64, { ratio: undefined, width: $scope.canvasWidth, height: 200, xOffset: undefined, yOffset: undefined });
            $scope.isModified = false;
        }
    }
    // upload file signature
    $scope.loadFileRef = async function ($event) {
        if (!$event.target.files || $event.target.files.length <= 0 || $event.target.files[0].size / 1024 > 20480) {
            App.toastrError(caption.CMH_VALIDATE_FILE);
        } else {
            var checkExits = $scope.listFile.filter(k => k.FileName === $event.target.files[0]);
            if (checkExits.length == 0) {
                var file = $event.target.files[0];
                var result = await $scope.uploadFileCommitment(file, file.name);
                $scope.listFile.push(result);
                $timeout(function () {
                    $scope.$apply();
                });
            } else {
                App.toastrError(caption.COM_MSG_FILE_EXISTS);
            }
        }
    }
    //remove file
    $scope.removeFile = function (index) {
        var itemRemove = $scope.listFile[index];
        dataserviceSVC.deleteFile(itemRemove.ShortPath, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
                $scope.listFile.splice(index, 1);
            }
        });
    }

    // submit to save model to database
    $scope.submit = async function () {
        if (CKEDITOR.instances['Content']) {
            var data = CKEDITOR.instances['Content'].getData();
            $scope.model.Noted = data;
        }
        if ($scope.signUrl == "" && $scope.signB64 || $scope.isModified) {
            var regex = /data:(.*);base64,(.*)/;
            var matches = $scope.signB64.match(regex);
            var signBlob = b64toBlob(matches[2], matches[1]);
            var fileName = create_UUID() + ".png";
            var result = await $scope.uploadFileSign(signBlob, fileName);
            $scope.model.Signature = result.FilePath;
        } else {
            $scope.model.Signature = $scope.signUrl;
        }
        validationSelect($scope.model);
        if ($scope.editform.validate() && validationSelect($scope.model)) {
            $scope.model.FileReference = JSON.stringify($scope.listFile);
            dataserviceSVC.update($scope.model, function (rs) {
                rs = rs.data;
                if (rs.Error) {
                    App.toastrError(rs.Title);
                } else {
                    App.toastrSuccess(rs.Title);
                    // convert Array to String 
                }

            });

        }
    }
    // listen when user choose a item in combobox
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "Surrogate" && $scope.model.Surrogate != "") {
            $scope.errorSurrogate = false;
        }
        if (SelectType == "Signature" && $scope.signB64 != "" && $scope.signB64 != null) {
            $scope.errorSignature = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            $scope.errorStatus = false;
        }
        if (SelectType == "UserId" && $scope.model.UserId != "") {
            $scope.errorUserId = false;
        }
    }
    // validate model (show error when user do not enter specific value)
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null Surrogate
        if (data.Surrogate == "" || data.Surrogate == null) {
            $scope.errorSurrogate = true;
            mess.Status = true;
        } else {
            $scope.errorSurrogate = false;
        }
        //Check null Signature
        if (data.Signature == "" || data.Signature == null) {
            $scope.errorSignature = true;
            mess.Status = true;
        } else {
            $scope.errorSignature = false;
        }
        //Check null Status
        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;
        }
        //Check null UserId
        if (data.UserId == "" || data.UserId == null) {
            $scope.errorUserId = true;
            mess.Status = true;
        } else {
            $scope.errorUserId = false;
        }
        return mess;
    };
    function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    async function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.toString());
            reader.readAsDataURL(blob);
        });
    }
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    function loadDate() {
        $("#StartDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#EndDate').datepicker('setStartDate', maxDate);
            $scope.editform.validate()
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#EndDate').datepicker('setStartDate', null);
                $scope.editform.validate();
            }
        });
        $("#EndDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#StartDate').datepicker('setEndDate', maxDate);
            $scope.editform.validate()
        }).keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
                $('#StartDate').datepicker('setEndDate', null);
                $scope.editform.validate()
            }
        });
    }
    // convert textbox into ckeditor (word editor)
    function ckEditer() {
        var editor1 = CKEDITOR.replace('Content', {
            cloudServices_tokenUrl: '/MobileApp/Token',
            cloudServices_uploadUrl: '/MobileApp/UploadFile',
            filebrowserBrowseUrl: '',
            filebrowserUploadUrl: '/MobileApp/Upload',
            embed_provider: '/uploader/upload.php'
        });
        CKEDITOR.instances['Content'].config.height = 80;
    }

    // a function that run later instead of instantly
    setTimeout(function () {
        ckEditer();
        loadDate();
        setModalMaxHeight('.modal');
        setModalDraggable('.modal-dialog');
    }, 200);
});