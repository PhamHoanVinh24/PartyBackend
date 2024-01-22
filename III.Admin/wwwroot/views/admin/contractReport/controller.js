var ctxfolder = "/views/admin/ContractReport";
var ctxfolderCommonSetting = "/views/admin/commonSetting";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', "pascalprecht.translate", 'ngSanitize', "ngCookies"]);
app.factory('dataservice', function ($http) {
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }  

    return {
        uploadFile: function (data, callback) {
            submitFormUpload('/Admin/ContractReport/UploadFile', data, callback)
        },
        getListSchool: function (callback) {
            $http.post('/Admin/ContractReport/GetListSchool').then(callback);
        },
        getListSpecialized: function (callback) {
            $http.post('/Admin/ContractReport/GetListSpecialized').then(callback);
        },
        getListEmployeeLevel: function (callback) {
            $http.post('/Admin/ContractReport/GetListEmployeeLevel').then(callback);
        },       
        getEmployee: function (data, data1, data2, callback) {
            $http.post('/Admin/ContractReport/GetEmployee?page=' + data + '&pageSize=' + data1 + '&productname=' + data2).then(callback);
        },
        getCert: function (callback) {
            $http.post('/Admin/EmployeeCert/GetCert').then(callback);
        },
        getDepart: function (callback) {
            $http.post('/Admin/ContractReport/GetDepart').then(callback);
        },
        insert: function (data, callback) {
            submitFormUpload('/Admin/ContractReport/Insert/', data, callback);
        },
        getItem: function (data, callback) {
            $http.post('/Admin/ContractReport/GetItem?Id=' + data).then(callback);
        },
      
        delete: function (data, callback) {
            $http.post('/Admin/ContractReport/Delete?Id=' + data).then(callback);
        },
        generatorPicture: function (data, callback) {
            $http.post('/Admin/ContractReport/GeneratorPicture?path=' + data).then(callback);
        },
        checkData: function (data, callback) {
            $http.post('/Admin/ContractReport/CheckData', data).then(callback);
        },
        insertImage: function (data, callback) {
            submitFormUpload('/Admin/ContractReport/InsertImage', data, callback);
        },
        saveData: function (data, callback) {
            $http.post('/Admin/ContractReport/SaveData', data).then(callback);
        },
        loadExcel: function (callback) {
            $http.post('/Admin/Excel/Index', callback);
        },
        loadFile: function (data, callback) {
            submitFormUpload('/Admin/Excel/LoadFile', data, callback);
        },
        getdataChart: function (data, callback) {
            $http.get('/Admin/ContractReport/getdataChart?DepartmentCode=' + data).then(callback);
        },
        //CommonSetting
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
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $filter, dataservice, $cookies, $translate) {
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
                CertNum: {
                    required: true,
                },
                Date: {
                    required: true,
                },

            },
            messages: {
                CertNum: {
                    required: caption.CRPT_VALIDATE_NUM_EMPTY,
                },
                Date: {
                    required: caption.CRPT_VALIDATE_DATE_EMPTY,
                },
            }
        }
    });
   
    dataservice.getCert(function (rs) {

        rs = rs.data;
        $rootScope.listCert = rs;
    });
    dataservice.getDepart(function (rs) {

        rs = rs.data;
        $rootScope.listDepart = rs;
    });
   

});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ContractReport/Translation');
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
        FromTo: '',
        Dateto: '',
        CertName: '',
        fullname: '',
        DepartmentCode: '',
        DecisionNum: '',
        DecisionBy: '',
        EmployeeCode:'',
    }

    var vm = $scope;

    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/ContractReport/JTable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) { 
                d.CertName = $scope.model.CertName;
                d.EmployeeName = $scope.model.fullname;
                d.Dateto = $scope.model.Dateto;
                d.FromTo = $scope.model.FromTo;
                d.DepartmentCode = $scope.model.DepartmentCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
                heightTableManual(500, '#tblDataAssetTransfer');
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
            $rootScope.Count = json.recordsTotal;
        })
        .withOption('createdRow', function (row, data, dataIndex) {
            const contextScope = $scope.$new(true);
            contextScope.data = data;
            contextScope.contextMenu = $scope.contextMenu;
            $compile(angular.element(row).contents())($scope);
            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
        
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('EmployeeCode').withTitle('{{"CRPT_LIST_COL_EMPLOYEE_CODE" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('fullname').withTitle('{{"CRPT_LIST_COL_EMP_NAME" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DecisionNum').withTitle('{{"CRPT_LIST_COL_NUM_DEC" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('DecisionDate').withTitle('{{"CRPT_LIST_COL_DATE_DEC" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Depart').withTitle('{{"CRPT_LIST_COL_DEPARTMENT" | translate}}').renderWith(function (data, type) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('birthday').withTitle('{{"CRPT_LIST_COL_DOB" | translate}}').renderWith(function (data, type) {
        return data != "" ? $filter('date')(new Date(data), 'dd/MM/yyyy') : null;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Reason').withTitle('{{"CRPT_LIST_COL_REASON" | translate}}').renderWith(function (data, type) {
        return data;
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
                selectedItems[Id] = selectAll;
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
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadTimeKeeping = function () {
        reloadData(true);
        $rootScope.reloadWorkingTime();
    }
    $scope.showSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.search = function () {
        dataservice.getdataChart($scope.model.DepartmentCode, function (rs) {
            rs = rs.data;
            day = [];
            MT = ['MT'];
            $rootScope.Count = 0;
            for (var i = 0; i < rs.length; i++) {
                day.push(caption.CRPT_LBL_MONTH + " " + rs[i].date);
                MT.push((rs[i].Count));
                $rootScope.Count += rs[i].Count;
            }
            setTimeout(function () {
                var chart = c3.generate({
                    bindto: '#chart', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            MT
                        ],
                        type: 'area', // default type of chart
                        //colors: {
                        //    'MT': tabler.colors["blue"],
                        //    'HH': tabler.colors["yellow"],

                        //},
                        names: {
                            // name of each serie
                            'MT': caption.CRPT_LBL_END_CONTRACT,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: day,
                            tick: {
                                rotate: 5
                            }
                        },
                        y: {
                            label: {
                                text: 'Số người',
                                position: 'outer-middle'
                            }

                        }
                    },
                    point: {
                        r: 5
                    },
                    grid: {
                        y: {
                            show: true
                        },
                        x: {
                            show: true
                        }
                    }
                    ,
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });
            }, 200);
        })
        reloadData(true);
    }
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '60',
            resolve: {
                para: function () {
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
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
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            $uibModalInstance.close();
                        }
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: '30',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
    $scope.Export = function () {
        location.href = "/Admin/ContractReport/ExportExcel?"         
            + "&DepartmentCode=" + $scope.model.DepartmentCode
            + "&DecisionBy=" + $scope.model.DecisionBy
            + "&DecisionNum=" + $scope.model.DecisionNum
            + "&Fromto=" + $scope.model.FromTo
            + "&Dateto=" + $scope.model.Dateto
    }
    $scope.Import = function (id) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/importExcel.html',
            controller: 'import',
            backdrop: 'static',
            size: '50',
            resolve: {
                para: function () {
                    return id;
                }
            }
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () { });
    };
    $scope.initLoad = function () {
        $scope.model.Time = $filter('date')(new Date(), 'dd/MM/yyyy');
        dataservice.getListSchool(function (rs) {
            rs = rs.data;
            $scope.listSchool = rs.Object;
        });
        dataservice.getListSpecialized(function (rs) {
            rs = rs.data;
            $scope.listSpecialized = rs.Object;
        });
        dataservice.getListEmployeeLevel(function (rs) {
            rs = rs.data;
            $scope.listEmployeeLevel = rs.Object;
        });
        dataservice.getdataChart($scope.model.DepartmentCode, function (rs) {
            rs = rs.data;
            day = [];
            MT = ['MT'];
            for (var i = 0; i < rs.length; i++) {
                day.push(caption.CRPT_LBL_MONTH + " " + rs[i].date);
                MT.push((rs[i].Count));
            }
            setTimeout(function () {

                var chart = c3.generate({
                    bindto: '#chart', // id of chart wrapper
                    data: {
                        columns: [
                            // each columns data
                            MT
                        ],
                        type: 'area', // default type of chart
                        //colors: {
                        //    'MT': tabler.colors["blue"],
                        //    'HH': tabler.colors["yellow"],

                        //},
                        names: {
                            // name of each serie
                            'MT': caption.CRPT_LBL_END_CONTRACT,
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            // name of each category
                            categories: day,
                            tick: {
                                rotate: 5
                            }
                        },
                        y: {
                            label: {
                                text: 'Số người',
                                position: 'outer-middle'
                            }

                        }
                    },
                    point: {
                        r: 5
                    },
                    grid: {
                        y: {
                            show: true
                        },
                        x: {
                            show: true
                        }
                    }
                    ,
                    legend: {
                        show: true, //hide legend
                    },
                    padding: {
                        bottom: 0,
                        top: 0
                    },
                });



            }, 200);
        })
    };
    $scope.listEmployee = [];
    $scope.textSearch = "";
    $scope.page = 1;
    $scope.pageSize = 10;
    $scope.loadMore = function ($select, $event) {
        if (!$event) {
            $scope.page = 1;
            $scope.items = [];
        } else {
            $event.stopPropagation();
            $event.preventDefault();
            $scope.page++;
        }
        dataservice.getEmployee($scope.page, $scope.pageSize, $scope.textSearch, function (rs) {
            rs = rs.data;
            $scope.listEmployee = $scope.listEmployee.concat(rs.Object);
        });
    }
    $scope.refreshAddresses = function (input) {
        $scope.textSearch = input;
        $scope.page = 1;
        $scope.items = [];
        dataservice.getEmployee($scope.page, $scope.pageSize, $scope.textSearch, function (rs) {
            rs = rs.data;
            $scope.listEmployee = $scope.listEmployee.concat(rs.Object);
        });
    }
    $scope.initLoad();


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

    function loadDate() {
        $("#Date").datepicker({
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
            $('#Date').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('add', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, DTColumnBuilder, DTInstances, dataservice, $filter) {

    $scope.model = {

        CertCode: "",
        CertNum: "",
        EmployeeCode: "",
        CertDateLicense: "",
        PathIMG: "",
        Noted: "",
        ImgPath:'',
    }
   
    $scope.initLoad = function () {
        dataservice.getListSchool(function (rs) {
            rs = rs.data;
            $scope.listSchool = rs.Object;
        });
        dataservice.getListSpecialized(function (rs) {
            rs = rs.data;
            $scope.listSpecialized = rs.Object;
        });
        dataservice.getListEmployeeLevel(function (rs) {
            rs = rs.data;
            $scope.listEmployeeLevel = rs.Object;
        });
    };


    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
  

    $scope.submit = function () {
        validationSelect($scope.model);
        if ($scope.addform.validate() && !validationSelect($scope.model).Status) {
            var file = document.getElementById("FileItem").files[0]
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
            formData.append("CertCode", $scope.model.CertCode);
            formData.append("CertNum", $scope.model.CertNum);
            formData.append("CertDateLicense", $scope.model.CertDateLicense);
            formData.append("EmployeeCode", $scope.model.EmployeeCode);
            formData.append("Noted", $scope.model.Noted);
           
            dataservice.insert(formData, function (result) {
                result = result.data;
                if (result.Error) {
                    App.toastrError(result.Title);
                } else {
                    App.toastrSuccess(result.Title);
                    $uibModalInstance.close();
                }
            });
        }
    }
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "EmployeeCode" && $scope.model.EmployeeCode != "" && $scope.model.EmployeeCode != null) {
            $scope.errorEquipment = false;           
        }
        if (SelectType == "CertCode" && $scope.model.CertCode != "" && $scope.model.CertCode != null) {
            $scope.errorCertCode = false;
        }
    }
    $scope.ViewImage = function () {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolder + '/Image.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {


                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.loadImage = function () {
                    var fileuploader = angular.element("#FileItem");
                    fileuploader.on('click', function () {
                    });
                    fileuploader.on('change', function (e) {
                        var reader = new FileReader();
                        reader.onload = function () {
                            document.getElementById('picture').src = reader.result;
                        }
                        var files = fileuploader[0].files;
                        var idxDot = files[0].name.lastIndexOf(".") + 1;
                        var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
                        if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                            App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                            return;
                        }
                        reader.readAsDataURL(files[0]);
                    });
                    fileuploader.trigger('click')
                }
            },
            backdrop: 'static',
            size: '40',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }
  
    $scope.listEmployee = [];
    $scope.textSearch = "";
    $scope.page = 1;
    $scope.pageSize = 10;
    $scope.loadMore = function ($select, $event) {
        if (!$event) {
            $scope.page = 1;
            $scope.items = [];
        } else {
            $event.stopPropagation();
            $event.preventDefault();
            $scope.page++;
        }
        dataservice.getEmployee($scope.page, $scope.pageSize, $scope.textSearch, function (rs) {
            rs = rs.data;
            $scope.listEmployee = $scope.listEmployee.concat(rs.Object);
        });
    }
    $scope.refreshAddresses = function (input) {
        $scope.textSearch = input;
        $scope.page = 1;
        $scope.items = [];
        dataservice.getEmployee($scope.page, $scope.pageSize, $scope.textSearch, function (rs) {
            rs = rs.data;
            $scope.listEmployee = $scope.listEmployee.concat(rs.Object);
        });
    }
   
    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.EmployeeCode == "") {
            $scope.errorEmployeeCode = true;
            mess.Status = true;
        } else {
            $scope.errorEmployeeCode = false;
        }
        if (data.CertCode == "") {
            $scope.errorCertCode = true;
            mess.Status = true;
        } else {
            $scope.errorCertCode = false;
        }
       
        return mess;
    }
    function loadDate() {
        $("#Date").datepicker({
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
            $('#Date').datepicker('setEndDate', maxDate);
        });
    }
    setTimeout(function () {
        loadDate();
    }, 200);
});
app.controller('edit', function ($scope, $rootScope, $compile, $uibModal, $uibModalInstance, dataservice, para, $filter) {

    $scope.initLoad = function () {
        dataservice.getListSchool(function (rs) {
       
            rs = rs.data;
            $scope.listSchool = rs.Object;
        });
        dataservice.getListSpecialized(function (rs) {
            rs = rs.data;
            $scope.listSpecialized = rs.Object;
        });
        dataservice.getListEmployeeLevel(function (rs) {
            rs = rs.data;
            $scope.listEmployeeLevel = rs.Object;
        });
        dataservice.getItem(para, function (rs) {
       
            rs = rs.data.Object;      
            $scope.model = rs;
            $scope.model.CertDateLicense = $filter('date')(new Date($scope.model.CertDateLicense), 'dd/MM/yyyy');
        });
     
    };
    $scope.listEmployee = [];
    $scope.textSearch = "";
    $scope.page = 1;
    $scope.pageSize = 10;
    $scope.loadMore = function ($select, $event) {
        if (!$event) {
            $scope.page = 1;
            $scope.items = [];
        } else {
            $event.stopPropagation();
            $event.preventDefault();
            $scope.page++;
        }
        dataservice.getEmployee($scope.page, $scope.pageSize, $scope.textSearch, function (rs) {
            rs = rs.data;
            $scope.listEmployee = $scope.listEmployee.concat(rs.Object);
        });
    }
    $scope.ViewImage = function (id) {
        var modalInstance = $uibModal.open({
            templateUrl: ctxfolder + '/Image.html',
            windowClass: "message-center",
            controller: function ($scope, $uibModalInstance) {
               

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.Image = id;
            },
            backdrop: 'static',
            size: '40',
        });
        modalInstance.result.then(function (d) {
            $scope.reload();
        }, function () {
        });
    }

    $scope.refreshAddresses = function (input) {
        $scope.textSearch = input;
        $scope.page = 1;
        $scope.items = [];
        dataservice.getEmployee($scope.page, $scope.pageSize, $scope.textSearch, function (rs) {
            rs = rs.data;
            $scope.listEmployee = $scope.listEmployee.concat(rs.Object);
        });
    }
    $scope.initLoad();
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.changleSelect = function (SelectType) {
        if (SelectType == "EmployeeCode" && $scope.model.EmployeeCode != "" && $scope.model.EmployeeCode != null) {
            $scope.errorEquipment = false;
        }
        if (SelectType == "CertCode" && $scope.model.CertCode != "" && $scope.model.CertCode != null) {
            $scope.errorCertCode = false;
        }
    }
   
    $scope.loadImage = function () {
        var fileuploader = angular.element("#FileItem");
        fileuploader.on('click', function () {
        });
        fileuploader.on('change', function (e) {
            var reader = new FileReader();
            reader.onload = function () {
                document.getElementById('picture').src = reader.result;
            }
            var files = fileuploader[0].files;
            var idxDot = files[0].name.lastIndexOf(".") + 1;
            var extFile = files[0].name.substr(idxDot, files[0].name.length).toLowerCase();
            if (extFile != "jpg" && extFile != "jpeg" && extFile != "png" && extFile != "gif" && extFile != "bmp") {
                App.toastrError(caption.COM_MSG_INVALID_FORMAT);
                return;
            }
            reader.readAsDataURL(files[0]);
        });
        fileuploader.trigger('click')
    }
   

    function validationSelect(data) {
        var mess = { Status: false, Title: "" };
        if (data.EmployeeCode == "") {
            $scope.errorEmployeeCode = true;
            mess.Status = true;
        } else {
            $scope.errorEmployeeCode = false;
        }
        if (data.CertCode == "") {
            $scope.errorCertCode = true;
            mess.Status = true;
        } else {
            $scope.errorCertCode = false;
        }

        return mess;
    }
   
   
});
app.controller('import', function ($scope, $uibModalInstance, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    $scope.model = {
    };
    $scope.Listdata = [];
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
    $scope.import = function () {
        var form = new FormData;
        var file = document.getElementById("FileItem").files[0]
        form.append("fileUpload", file);
        if (file == null || file == undefined || file == "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
      
            var excel = ['.xlsm', '.xlsx', '.xlsb', '.xltx', '.xltm', '.xls', '.xlt', '.xls', '.xml', '.xml', '.xlam', '.xla', '.xlw', '.xlr'];
            if ($scope.model.FileName == "") {
                App.toastrError(caption.CRPT_MSG_FILE_MUST_EXCEL);
            } else {
                for (i = 0; i < excel.length; i++) {
                    if (file.name.indexOf(excel[i]) != -1) {
                        $scope.model.FileUpload = file;
                        dataservice.uploadFile(form, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                $scope.Listdata = rs.Object;
                                App.toastrSuccess(rs.Title);
                            }
                        });
                        return;
                    }
                }
                App.toastrError(caption.CRPT_MSG_FILE_MUST_EXCEL);
                return;
            }
        }
    }
    $scope.loadExcel = function () {
        var form = new FormData;
        var file = document.getElementById("FileItem").files[0];
        form.append("fileUpload", file);
        form.append("fileNameUpload", file.name);
        if (file === null || file === undefined || file === "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
            var excel = ['.xlsm', '.xlsx', '.xlsb', '.xltx', '.xltm', '.xls', '.xlt', '.xls', '.xml', '.xml', '.xlam', '.xla', '.xlw', '.xlr'];
            if ($scope.model.FileName === "") {
                App.toastrError(caption.CRPT_MSG_FILE_MUST_EXCEL);
            } else {
                dataservice.loadFile(form, function (rs) {
                    var url = "/Admin/EXCEL/Index";
                    window.open(url, '_blank');
                });
            }
        }
    };
    $scope.check = function () {
        dataservice.checkData($scope.Listdata, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        });

    }
    $scope.submit = function () {
        dataservice.saveData($scope.Listdata, function (rs) {
            rs = rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            } else {
                App.toastrSuccess(rs.Title);
            }
        });

    }
    $scope.checkData = function () {
        var form = new FormData;
        var file = document.getElementById("FileItem").files[0]
        form.append("fileUpload", file);
        form.append("DepartmentCode", $scope.model.Department);
        form.append("Date", $scope.model.Date);
        if (file == null || file == undefined || file == "") {
            App.toastrError(caption.COM_MSG_CHOSE_FILE);
        } else {
         
            var excel = ['.xlsm', '.xlsx', '.xlsb', '.xltx', '.xltm', '.xls', '.xlt', '.xls', '.xml', '.xml', '.xlam', '.xla', '.xlw', '.xlr'];
            if ($scope.model.FileName == "") {
                App.toastrError(caption.CRPT_MSG_FILE_MUST_EXCEL);
            } else {
                for (i = 0; i < excel.length; i++) {
                    if (file.name.indexOf(excel[i]) != -1) {
                        $scope.model.FileUpload = file;
                        dataservice.checkData(form, function (rs) {
                            rs = rs.data;
                            if (rs.Error) {
                                App.toastrError(rs.Title);
                            } else {
                                App.toastrSuccess(rs.Title);
                                if (rs.Object != null) {
                                    $scope.DataExcel = rs.Object;
                                }
                            }
                        });
                        return;
                    }
                }
                App.toastrError(caption.CRPT_MSG_FILE_MUST_EXCEL);
                return;
            }
        }
    }

});
