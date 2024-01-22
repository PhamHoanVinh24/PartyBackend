var ctxfolder = "/views/admin/edmsRepositoryReport";
var ctxfolderMessage = "/views/message-box";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ngTagsInput', "chart.js"])
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
    })
    .directive('fileDropzone', function () {
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
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    var submitFormUpload = function (url, data, callback) {
        var formData = new FormData();
        formData.append("FileUpload", data.FileUpload);
        formData.append("FileCode", data.FileCode);
        formData.append("FileName", data.FileName);
        formData.append("FileType", data.FileType);
        formData.append("ContractCode", data.ContractCode);
        formData.append("Tags", data.Tags);
        formData.append("Desc", data.Desc);
        formData.append("ReposCode", data.ReposCode);
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
            data: formData
        }
        $http(req).then(callback);
    };
    var submitFormUploadNew = function (url, data, callback) {
        var formData = new FormData();
        formData.append("CateRepoSettingId", data.CateRepoSettingId);
        formData.append("FileUpload", data.FileUpload);
        formData.append("FileName", data.FileName);
        formData.append("Desc", data.Desc);
        formData.append("Tags", data.Tags);
        formData.append("NumberDocument", data.NumberDocument);
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
            data: formData
        }
        $http(req).then(callback);
    };
    return {
        //category
        getTreeCategory: function (callback) {
            $http.post('/Admin/edmsRepositoryReport/GetTreeCategory').then(callback);
        },
        getParentCategory: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/GetParentCategory', data).then(callback);
        },
        getItemCategory: function (data, callback) {
            $http.get('/Admin/edmsRepositoryReport/GetItemCategory?id=' + data).then(callback);
        },
        insertCategory: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/InsertCategory', data).then(callback);
        },
        updateCategory: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/UpdateCategory', data).then(callback);
        },
        deleteCategory: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/DeleteCategory?catCode=' + data).then(callback);
        },

        //repository
        getTreeRepository: function (callback) {
            $http.post('/Admin/edmsRepositoryReport/GetTreeRepository').then(callback);
        },
        getItemRepository: function (data, callback) {
            $http.get('/Admin/edmsRepositoryReport/GetItemRepository?reposCode=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        insertRepository: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/InsertRepository', data).then(callback);
        },
        updateRepository: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/UpdateRepository', data).then(callback);
        },
        deleteRepository: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/DeleteRepository?respos=' + data).then(callback);
        },

        //file
        insertFile: function (data, callback) {
            submitFormUpload('/Admin/edmsRepositoryReport/InsertFile', data, callback);
        },
        insertFileNew: function (data, callback) {
            submitFormUploadNew('/Admin/edmsRepositoryReport/insertFileNew', data, callback);
        },
        deleteFile: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/DeleteFile', data).then(callback);
        },
        getContract: function (callback) {
            $http.post('/Admin/edmsRepositoryReport/GetContract').then(callback);
        },
        getFileImage: function (data, callback) {
            $http.get('/Admin/edmsRepositoryReport/GetFileImage?id=' + data, {
                beforeSend: function () {
                    App.blockUI({
                        target: "#contentMain",
                        boxed: true,
                        message: 'loading...'
                    });
                },
                complete: function () {
                    App.unblockUI("#contentMain");
                }
            }).then(callback);
        },
        getAllContract: function (callback) {
            $http.post('/Admin/edmsRepositoryReport/GetAllContract').then(callback);
        },
        getAllCustomer: function (callback) {
            $http.post('/Admin/edmsRepositoryReport/GetAllCustomer').then(callback);
        },
        getAllSupplier: function (callback) {
            $http.post('/Admin/edmsRepositoryReport/GetAllSupplier').then(callback);
        },
        getAllProject: function (callback) {
            $http.post('/Admin/edmsRepositoryReport/GetAllProject').then(callback);
        },

        jtableFileWithRepository: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/JtableFileWithRepository', data).then(callback);
        },
        getObjects: function (callback) {
            $http.post('/Admin/edmsRepositoryReport/GetObjects').then(callback);
        },
        getUsers: function (callback) {
            $http.post('/Admin/edmsRepositoryReport/GetUsers').then(callback);
        },
        createTempFile: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/CreateTempFile?Id=' + data).then(callback);
        },
        getSupportCategory: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/GetSupportCategory?CatCode=' + data).then(callback);
        },
        getChartByWeek: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/ChartByWeek', data).then(callback);
        },
        getChartBySearch: function (data, callback) {
            $http.post('/Admin/edmsRepositoryReport/ChartBySearch', data).then(callback);
        },


    }
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.$on('$translateChangeSuccess', function () {
        $rootScope.IsTranslate = true;
        caption = caption[culture] ? caption[culture] : caption;
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN,
        });
        $rootScope.validationOptionsCategory = {
            rules: {
                CatCode: {
                    required: true
                },
                CatName: {
                    required: true
                }
            },
            messages: {
                CatCode: {
                    required: caption.EDMSRR_VALIDATE_CODE_CATE
                },
                CatName: {
                    required: caption.EDMSRR_VALIDATE_NAME_CATE
                }
            }
        }
        $rootScope.validationOptionsRepository = {
            rules: {
                ReposName: {
                    required: true
                },
                Server: {
                    required: true
                },
                Account: {
                    required: true
                },
                PassWord: {
                    required: true
                }
            },
            messages: {
                ReposName: {
                    required: caption.EDMSRR_VALIDATE_SERVER_NAME
                },
                Server: {
                    required: caption.EDMSRR_VALIDATE_SERVER
                },
                Account: {
                    required: caption.EDMSRR_VALIDATE_USER
                },
                PassWord: {
                    required: caption.EDMSRR_VALIDATE_PASS
                }
            }
        }
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9_äöüÄÖÜ]*$/;
            var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            //var partternDescription = /^[ĂăĐđĨĩŨũƠơƯưẠ-ỹa-zA-Z0-9]*[^Đđ!@#$%^&*<>?]*$/; //Có thể null, và có chứa được khoảng trắng
            //var partternNumber = /^\d+$/;
            //var partternPremiumTerm = /^\d+(\+)?/
            //var partternFloat = /^-?\d*(\.\d+)?$/;
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ReposCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.EDMSR_VALIDATE_REPOS_CODE, "<br/>");
            }
            return mess;
        }
    });
    $scope.FileType = [{
        Code: 1,
        Name: 'Ảnh',
    }, {
        Code: 2,
        Name: 'Word'
    }, {
        Code: 3,
        Name: 'Excel'
    }, {
        Code: 4,
        Name: 'Powerpoint'
    }, {
        Code: 5,
        Name: 'Pdf'
    }, {
        Code: 6,
        Name: 'Tệp tin'
    }]
});
app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/edmsRepositoryReport/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
    //.when('/pdfViewer', {
    //    templateUrl: ctxfolder + '/pdfViewer.html',
    //    controller: 'pdfViewer'
    //});
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
app.controller('index', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window) {
    var vm = $scope;
    $scope.objects = [];
    $scope.objectDetails = [];
    $scope.users = [];
    $scope.model = {
        FromDate: '',
        ToDate: '',
        Name: '',
        FileType: '',
        Content: '',
        Tags: '',
        ListRepository: [],
        ObjectDetailCode: null,
        ObjectCode: null,
        UserUpload: ''
    };

    $rootScope.model = {
        FromDate: '',
        ToDate: '',
        Name: '',
        FileType: '',
        Content: '',
        Tags: '',
        ListRepository: [],
        ObjectDetailCode: null,
        ObjectCode: null,
        UserUpload: ''
    };

    $scope.currentPath = "";
    $scope.totalFile = 0;
    $scope.totalCapacity = "0M";
    $scope.searchByWeek = true;
    $scope.treeData = [];
    $scope.selected = [];
    $scope.selectAll = false;

    $scope.search = function () {
        $rootScope.model = $scope.model;
        if (
            ($scope.model.FromDate != null && $scope.model.FromDate != "") ||
            ($scope.model.ToDate != null && $scope.model.ToDate != "")
            //||
            //($scope.model.ObjectCode != null && $scope.model.ObjectCode != "") ||
            //($scope.model.ObjectDetailCode != null && $scope.model.ObjectDetailCode != "")||
            //($scope.model.UserUpload != null && $scope.model.UserUpload != "")
        ) {
            $scope.searchByWeek = false;
            $scope.getChartBySearch();
            $rootScope.reloadData1();
        }
        else {
            $scope.searchByWeek = true;
            $scope.getChartByWeek();
            $rootScope.reloadData();
        }
    };

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


    $scope.init = function () {
        $scope.objects = [];
        $scope.objectDetails = [];
        $scope.users = [];
        dataservice.getObjects(function (rs) {
            rs = rs.data;
            $scope.objects = rs;
        });
        dataservice.getUsers(function (rs) {
            rs = rs.data;
            $scope.users = rs;
            var all = {
                UserName: '',
                Name: caption.EDMSRR_LBL_ALL
            }
            $scope.users.unshift(all)
        });

        $scope.optionsWeekData = {
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var totalFile = $scope.searchByWeekData.totalFile[tooltipItem.index].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '';
                        var totalSize = $scope.searchByWeekData.totalSize[tooltipItem.index];
                        var capacity = totalSize
                        var kb = 1024;
                        var mb = 1024 * kb;
                        var gb = 1024 * mb;
                        var dt = capacity / gb;
                        var totalSizes = "";
                        if (capacity / gb > 1) {
                            totalSizes = Math.floor(capacity / gb) + " GB";
                        }
                        else if (capacity / mb > 1) {
                            totalSizes = Math.floor(capacity / mb) + " MB";
                        }
                        else if (capacity / kb > 1) {
                            totalSizes = Math.floor(capacity / kb) + " KB";
                        }
                        else {
                            totalSizes = capacity + " byte";
                        }

                        var label = caption.EDMSRR_LBL_ALL_FILE + ": " + totalFile + " - " + caption.EDMSRR_LBL_CAP + ": " + totalSizes;
                        return [label];
                    }
                },
            },
            animation: {
                duration: 100,
                onComplete: function () {
                    var ctx = this.chart.ctx;
                    ctx.font = Chart.helpers.fontString(11, 'normal', Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function (dataset) {
                        for (var i = 0; i < dataset.data.length; i++) {
                            var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                                scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
                            ctx.fillStyle = '#444';
                            var y_pos = model.y - 5;
                            // Make sure data value does not get overflown and hidden
                            // when the bar's value is too close to max value of scale
                            // Note: The y value is reverse, it counts from top down
                            if ((scale_max - model.y) / scale_max >= 0.93)
                                y_pos = model.y + 20;
                            //if (dataset.data[i] != 0) {
                            ctx.fillText((Math.round(dataset.data[i] * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), model.x, y_pos);
                            //}
                        }
                    });
                }
            },
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true, // minimum will be 0, unless there is a lower value.
                        //callback: function (value, index, values) {
                        //    if (parseInt(value) >= 1000) {
                        //        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        //    } else {
                        //        return (Math.round(value * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        //    }
                        //}
                    }
                }]
            },
            maintainAspectRatio: false,
            //legend: { display: true },
            responsive: true,
        };
        $scope.searchByWeekData = {
            options: $scope.optionsWeekData,
            labels: ["", "", "", "", "", "", "", "", "", ""],
            data: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
            date: [],
            totalFile: [],
            totalSize: [],
            product: '',
            dateSearch: ''
        }
        $scope.optionsTimeData = {
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {

                        //var dataSet = tooltipItem.datasetIndex;
                        //var data1 = datasets[dataSet];
                        var label = data.datasets[tooltipItem.datasetIndex].label;
                        var totalFile = $scope.searchByTime.totalFile[tooltipItem.datasetIndex][tooltipItem.index];
                        var totalSize = $scope.searchByTime.totalSize[tooltipItem.datasetIndex][tooltipItem.index];
                        var capacity = totalSize
                        var kb = 1024;
                        var mb = 1024 * kb;
                        var gb = 1024 * mb;
                        var dt = capacity / gb;
                        var totalSizes = "";
                        if (capacity / gb > 1) {
                            totalSizes = Math.floor(capacity / gb) + " GB";
                        }
                        else if (capacity / mb > 1) {
                            totalSizes = Math.floor(capacity / mb) + " MB";
                        }
                        else if (capacity / kb > 1) {
                            totalSizes = Math.floor(capacity / kb) + " KB";
                        }
                        else {
                            totalSizes = capacity + " byte";
                        }

                        var label = label + ": " + caption.EDMSRR_LBL_ALL_FILE + ": " + totalFile + " - " + EDMSRR_LBL_CAP + ": " + totalSizes;
                        return [label];
                    }
                },
            },
            animation: {
                duration: 100,
                onComplete: function () {
                    var ctx = this.chart.ctx;
                    ctx.font = Chart.helpers.fontString(11, 'normal', Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function (dataset) {
                        for (var i = 0; i < dataset.data.length; i++) {
                            var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                                scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
                            ctx.fillStyle = '#444';
                            var y_pos = model.y - 5;
                            // Make sure data value does not get overflown and hidden
                            // when the bar's value is too close to max value of scale
                            // Note: The y value is reverse, it counts from top down
                            if ((scale_max - model.y) / scale_max >= 0.93)
                                y_pos = model.y + 20;
                            //if (dataset.data[i] != 0) {
                            ctx.fillText((Math.round(dataset.data[i] * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), model.x, y_pos);
                            //}
                        }
                    });
                }
            },
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true, // minimum will be 0, unless there is a lower value.
                        //callback: function (value, index, values) {
                        //    if (parseInt(value) >= 1000) {
                        //        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        //    } else {
                        //        return (Math.round(value * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        //    }
                        //}
                    }
                }]
            },
            maintainAspectRatio: false,
            //legend: { display: true },
            responsive: true,
        };
        $scope.searchByTime = {
            options: $scope.optionsTimeData,
            labels: ["", "", "", "", "", "", "", "", "", ""],
            data: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
            date: [],
            series: ['Hợp đồng', 'Khách hàng', "Nhà cung cấp", "Dự án", "Khác"],
            colors: ['#3498db', '#F0AB05', '#A0B421', '#00A39F', "#FF0099"],
            totalFile: [],
            totalSize: [],
            product: '',
            dateSearch: ''
        }
    }
    $scope.init();

    $scope.changeObject = function () {
        $scope.model.ObjectDetailCode = null;
        $scope.objectDetails = [];
        if ($scope.model.ObjectCode == "FILE_OBJ_CONTRACT") {
            dataservice.getAllContract(function (rs) {
                rs = rs.data;

            });
        }
        if ($scope.model.ObjectCode == "FILE_OBJ_CUSTOMMER") {
            dataservice.getAllCustomer(function (rs) {
                rs = rs.data;
                $scope.objectDetails = rs.Object;
            });
        }
        if ($scope.model.ObjectCode == "FILE_OBJ_PROJECT") {
            dataservice.getAllProject(function (rs) {
                rs = rs.data;
                $scope.objectDetails = rs.Object;
            });

        }
        if ($scope.model.ObjectCode == "FILE_OBJ_SUPPLIER") {
            dataservice.getAllSupplier(function (rs) {
                rs = rs.data;
                $scope.objectDetails = rs.Object;
            });
        }

    }
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }

    }
    $scope.dowload = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var dt = null;
        for (var i = 0; i < $scope.treeData.length; ++i) {
            var item = $scope.treeData[i];
            if (item.id == userModel.Category) {
                dt = item;
                break;
            }
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            if (dt != null)
                $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            else
                $scope.currentPath = "Google Driver/" + userModel.FileName;
        }
        else {

            if (dt != null)
                $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
            else
                $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
        }
        location.href = "/Admin/edmsRepositoryReport/Download?"
            + "Id=" + id;
    }


    $scope.loadCombobox = function () {
        dataservice.getAllContract(function (rs) {
            rs = rs.data;
            $scope.contracts = rs.Object;
        });
        dataservice.getAllCustomer(function (rs) {
            rs = rs.data;
            $scope.customers = rs.Object;
        });
        dataservice.getAllSupplier(function (rs) {
            rs = rs.data;
            $scope.suppliers = rs.Object;
        });
        dataservice.getAllProject(function (rs) {
            rs = rs.data;
            $scope.projects = rs.Object;
        });
    }
    function loadDate() {
        $("#FromTo").datepicker({
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
            $('#FromTo').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#FromTo').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#DateTo').datepicker('setStartDate', null);
        });
    }

    setTimeout(function () {
        $scope.loadCombobox();
        loadDate();
    }, 200);

    setTimeout(function () {
        $scope.search();
    }, 2000);

    $scope.getChartByWeek = function () {
        var d = {};
        d.FromDate = $scope.model.FromDate;
        d.ToDate = $scope.model.ToDate;
        d.ObjectCode = $scope.model.ObjectCode;
        d.ContractCode = null;
        d.CustomerCode = null;
        d.SupplierCode = null;
        d.ProjectCode = null;
        d.UserUpload = $scope.model.UserUpload;
        if ($scope.model.ObjectCode == "FILE_OBJ_CONTRACT")
            d.ContractCode = $scope.model.ObjectDetailCode;
        if ($scope.model.ObjectCode == "FILE_OBJ_CUSTOMMER")
            d.CustomerCode = $scope.model.ObjectDetailCode;
        if ($scope.model.ObjectCode == "FILE_OBJ_SUPPLIER")
            d.SupplierCode = $scope.model.ObjectDetailCode;
        if ($scope.model.ObjectCode == "FILE_OBJ_PROJECT")
            d.ProjectCode = $scope.model.ObjectDetailCode;
        dataservice.getChartByWeek(d, function (rs) {
            rs = rs.data;
            var list = rs.Object;

            if (list.length > 0) {
                $scope.searchByWeekData.labels = [];
                $scope.searchByWeekData.data = [];
                $scope.searchByWeekData.date = [];
                $scope.searchByWeekData.totalFile = [];
                $scope.searchByWeekData.totalSize = [];
                $scope.searchByWeekData.dateSearch = d.DateSearch;

                var list1 = [];
                for (var i = 0; i < list.length; ++i) {
                    $scope.searchByWeekData.labels.push(list[i].CreatedDate);
                    list1.push(list[i].TotalFile);
                    $scope.searchByWeekData.totalFile.push(list[i].TotalFile);
                    $scope.searchByWeekData.totalSize.push(list[i].TotalSize);
                }
                $scope.searchByWeekData.data.push(list1);
            } else {
                App.toastrError(caption.EDMSRR_MSG_NOT_FOUND_RESULT);
            }
        });
    };
    $scope.getChartBySearch = function () {
        var d = {};
        d.FromDate = $scope.model.FromDate;
        d.ToDate = $scope.model.ToDate;
        d.ObjectCode = $scope.model.ObjectCode;
        d.ContractCode = null;
        d.CustomerCode = null;
        d.SupplierCode = null;
        d.ProjectCode = null;
        d.UserUpload = $scope.model.UserUpload;
        if ($scope.model.ObjectCode == "FILE_OBJ_CONTRACT")
            d.ContractCode = $scope.model.ObjectDetailCode;
        if ($scope.model.ObjectCode == "FILE_OBJ_CUSTOMMER")
            d.CustomerCode = $scope.model.ObjectDetailCode;
        if ($scope.model.ObjectCode == "FILE_OBJ_SUPPLIER")
            d.SupplierCode = $scope.model.ObjectDetailCode;
        if ($scope.model.ObjectCode == "FILE_OBJ_PROJECT")
            d.ProjectCode = $scope.model.ObjectDetailCode;
        dataservice.getChartBySearch(d, function (rs) {
            rs = rs.data;

            var list = rs.Object;
            var listContract = list[0];
            var listCustomer = list[1];
            var listSupplier = list[2];
            var listProject = list[3];
            var listOther = list[4];
            if (rs.Object2.length == 0) {
                $scope.searchByTime = {
                    options: $scope.optionsTimeData,
                    labels: ["", "", "", "", "", "", "", "", "", ""],
                    data: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
                    date: [],
                    series: ['Hợp đồng', 'Khách hàng', "Nhà cung cấp", "Dự án", "Khác"],
                    colors: ['#3498db', '#F0AB05', '#A0B421', '#00A39F', "#FF0099"],
                    totalFile: [],
                    totalSize: [],
                    product: '',
                    dateSearch: ''
                }
            }
            else {
                $scope.searchByTime.labels = [];
                $scope.searchByTime.data = [[], [], [], [], []];
                $scope.searchByTime.totalFile = [[], [], [], [], []];
                $scope.searchByTime.totalSize = [[], [], [], [], []];
                $scope.searchByTime.dateSearch = d.DateSearch;
                if (rs.Object2.length > 0) {
                    var l1 = rs.Object2;
                    for (var i = 0; i < l1.length; ++i)
                        $scope.searchByTime.labels.push(l1[i].CreatedDates);
                }
                for (var i = 0; i < list.length; ++i) {
                    var list1 = list[i];
                    var list2 = [];
                    var list3 = [];
                    var list4 = [];
                    for (var j = 0; j < list1.length; ++j) {
                        list2.push(list1[j].TotalFile);
                        list3.push(list1[j].TotalFile);
                        list4.push(list1[j].TotalSize);
                    }
                    $scope.searchByTime.data[i] = list2;
                    $scope.searchByTime.totalFile[i] = list3;
                    $scope.searchByTime.totalSize[i] = list4;
                }
            }
        });
    }
    $scope.getChartByWeek();
});
app.controller('default', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window) {
    var vm = $scope;
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/edmsRepositoryReport/JTableFileNew",
            beforeSend: function (jqXHR, settings) {
                resetCheckbox();
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FromDate = $rootScope.model.FromDate;
                d.ToDate = $rootScope.model.ToDate;
                d.ObjectCode = $rootScope.model.ObjectCode;
                d.ContractCode = null;
                d.CustomerCode = null;
                d.SupplierCode = null;
                d.ProjectCode = null;
                d.UserUpload = $rootScope.model.UserUpload;
                if ($rootScope.model.ObjectCode == "FILE_OBJ_CONTRACT")
                    d.ContractCode = $rootScope.model.ObjectDetailCode;
                if ($rootScope.model.ObjectCode == "FILE_OBJ_CUSTOMMER")
                    d.CustomerCode = $rootScope.model.ObjectDetailCode;
                if ($rootScope.model.ObjectCode == "FILE_OBJ_SUPPLIER")
                    d.SupplierCode = $rootScope.model.ObjectDetailCode;
                if ($rootScope.model.ObjectCode == "FILE_OBJ_PROJECT")
                    d.ProjectCode = $rootScope.model.ObjectDetailCode;
            },
            complete: function (json) {
                App.unblockUI("#contentMain");
                heightTableManual(425,'#tblData');
                var listdata = $('#tblData').DataTable().data();
                if (listdata.length > 0) {
                    var item = listdata[0];
                    var capacity = item.FileSize;
                    var kb = 1024;
                    var mb = 1024 * kb;
                    var gb = 1024 * mb;
                    var dt = capacity / gb;
                    if (capacity / gb > 1) {
                        $scope.totalCapacity = Math.floor(capacity / gb) + " GB";
                    }
                    else if (capacity / mb > 1) {
                        $scope.totalCapacity = Math.floor(capacity / mb) + " MB";
                    }
                    else if (capacity / kb > 1) {
                        $scope.totalCapacity = Math.floor(capacity / kb) + " KB";
                    }
                    else {
                        $scope.totalCapacity = capacity + " Byte";
                    }
                }
                else
                    $scope.totalCapacity = "0 byte";
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
            $compile(angular.element(row)
                .attr('context-menu', 'contextMenu')
                .attr('id', 'id-' + data.FileID)
                .attr('draggable', true)
                .attr('data-downloadurl', 'application/pdf:HTML5CheatSheet.pdf:http://www.thecssninja.com/demo/gmail_dragout/html5-cheat-sheet.pdf')
            )(contextScope);
            console.log('createdRow');
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn('CategoryName').withOption('sClass', 'w40').withTitle('{{"EDMSRR_LIST_COL_CATE_DATA" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('GivenName').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSRR_LIST_COL_USER_UPLOAD" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalFile').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSRR_LIST_COL_TOTAL_FILE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns.push(DTColumnBuilder.newColumn('TotalSize').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSRR_LIST_COL_CAPICITY" | translate}}').renderWith(function (data, type, full) {
        var capacity = data;
        var kb = 1024;
        var mb = 1024 * kb;
        var gb = 1024 * mb;
        var dt = capacity / gb;
        if (capacity / gb > 1) {
            return Math.floor(capacity / gb) + " GB";
        }
        else if (capacity / mb > 1) {
            return Math.floor(capacity / mb) + " MB";
        }
        else if (capacity / kb > 1) {
            return Math.floor(capacity / kb) + " KB";
        }
        else {
            return capacity + " byte";
        }
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
    function resetCheckbox() {
        $scope.selected = [];
        vm.selectAll = false;
    }

    $rootScope.reloadData = function () {
        reloadData(true);
    };
    $scope.dowload = function (id) {
        var userModel = {};
        var listdata = $('#tblData').DataTable().data();
        for (var i = 0; i < listdata.length; i++) {
            if (listdata[i].Id == id) {
                userModel = listdata[i];
                break;
            }
        }
        var dt = null;
        for (var i = 0; i < $scope.treeData.length; ++i) {
            var item = $scope.treeData[i];
            if (item.id == userModel.Category) {
                dt = item;
                break;
            }
        }
        if (userModel.CloudFileId != null && userModel.CloudFileId != "") {
            if (dt != null)
                $scope.currentPath = "Google Driver/" + dt.text + "/" + userModel.FolderName + "/" + userModel.FileName;
            else
                $scope.currentPath = "Google Driver/" + userModel.FileName;
        }
        else {

            if (dt != null)
                $scope.currentPath = userModel.ServerAddress + "/" + dt.text + "" + userModel.Url;
            else
                $scope.currentPath = userModel.ServerAddress + "/" + userModel.Url;
        }
        location.href = "/Admin/edmsRepositoryReport/Download?"
            + "Id=" + id;
    };
});
app.controller('result', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $window) {
    var vm = $scope;
    $scope.objects = [];
    $scope.objectDetails = [];
    $scope.users = [];
    $scope.model = {
        FromDate: '',
        ToDate: '',
        Name: '',
        FileType: '',
        Content: '',
        Tags: '',
        ListRepository: [],
        ObjectDetailCode: null,
        ObjectCode: null,
        UserUpload: ''
    };
    $scope.currentPath = "";
    $scope.totalFile = 0;
    $scope.totalCapacity = "0M";
    $scope.searchByWeek = true;
    $scope.treeData = [];
    $scope.selected = [];
    $scope.selectAll = false;
    //theo search
    vm.dtOptions1 = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/edmsRepositoryReport/JTableFileNew",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.FromDate = $rootScope.model.FromDate;
                d.ToDate = $rootScope.model.ToDate;
                d.ObjectCode = $rootScope.model.ObjectCode;
                d.ContractCode = null;
                d.CustomerCode = null;
                d.SupplierCode = null;
                d.ProjectCode = null;
                d.UserUpload = $rootScope.model.UserUpload;
                if ($rootScope.model.ObjectCode == "FILE_OBJ_CONTRACT")
                    d.ContractCode = $rootScope.model.ObjectDetailCode;
                if ($rootScope.model.ObjectCode == "FILE_OBJ_CUSTOMMER")
                    d.CustomerCode = $rootScope.model.ObjectDetailCode;
                if ($rootScope.model.ObjectCode == "FILE_OBJ_SUPPLIER")
                    d.SupplierCode = $rootScope.model.ObjectDetailCode;
                if ($rootScope.model.ObjectCode == "FILE_OBJ_PROJECT")
                    d.ProjectCode = $rootScope.model.ObjectDetailCode;
            },
            complete: function (json) {
                App.unblockUI("#contentMain");
                heightTableManual(425, '#tblData1');
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(pageLength)
        .withOption('order', [1, 'desc'])
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
            $compile(angular.element(row)
                .attr('context-menu', 'contextMenu')
                .attr('id', 'id-' + data.FileID)
                .attr('draggable', true)
                .attr('data-downloadurl', 'application/pdf:HTML5CheatSheet.pdf:http://www.thecssninja.com/demo/gmail_dragout/html5-cheat-sheet.pdf')
            )(contextScope);
            console.log('createdRow');
        });

    vm.dtColumns1 = [];
    vm.dtColumns1.push(DTColumnBuilder.newColumn('Name').withOption('sClass', 'w40').withTitle('{{"EDMSRR_LIST_COL_OBJ" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('Type').withOption('sClass', 'w40').withTitle('{{"EDMSRR_LIST_COL_TYPE_OBJ" | translate}}').renderWith(function (data, type, full) {
        if (data == "CONTRACT")
            return "Hợp đồng";
        if (data == "SUPPLIER")
            return "Nhà cung cấp";
        if (data == "PROJECT")
            return "Dự án";
        if (data == "CUSTOMER")
            return "Khách hàng";
        return "Kho dữ liệu";
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('UploadUser').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSRR_LIST_COL_USER_UPLOAD" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('TotalFile').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSRR_LIST_COL_TOTAL_FILE" | translate}}').renderWith(function (data, type, full) {
        return data;
    }));
    vm.dtColumns1.push(DTColumnBuilder.newColumn('TotalSize').withOption('sClass', 'dataTable-createdDate').withTitle('{{"EDMSRR_LIST_COL_CAPICITY" | translate}}').renderWith(function (data, type, full) {
        var capacity = data;
        var kb = 1024;
        var mb = 1024 * kb;
        var gb = 1024 * mb;
        var dt = capacity / gb;
        if (capacity / gb > 1) {
            return Math.floor(capacity / gb) + " GB";
        }
        else if (capacity / mb > 1) {
            return Math.floor(capacity / mb) + " MB";
        }
        else if (capacity / kb > 1) {
            return Math.floor(capacity / kb) + " KB";
        }
        else {
            return capacity + " byte";
        }
    }));
    vm.reloadData = reloadData1;
    vm.dtInstance1 = {};
    function reloadData1(resetPaging) {
        vm.dtInstance1.reloadData(callback, resetPaging);
    }
    function callback(json) {

    }
    $rootScope.reloadData1 = function () {
        reloadData1(true);
    };
});


