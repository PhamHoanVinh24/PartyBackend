var ctxfolder = "/views/admin/KPIEmployee";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber']).
    directive("filesInput", function () {
        return {
            require: "ngModel",
            link: function postLink(scope, elem, attrs, ngModel) {
                elem.on("change", function (e) {
                    var files = elem[0].files;
                    ngModel.$setViewValue(files);
                });
            }
        }
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
        getKPIEmployee: function (data, callback) {
            $http.post('/Admin/KPIEmployee/GetKPIEmployee', data).then(callback);
        },
        searchChartKPI: function (data, callback) {
            $http.post('/Admin/KPIEmployee/SearchChartKPI', data).then(callback);
        },
        getDepartment: function (callback) {
            $http.post('/Admin/HREmployee/GetDepartment').then(callback);
        },
        getEmployee: function (data, callback) {
            $http.get('/Admin/KPIEmployee/GetEmployee?code=' + data).then(callback);
        },
    };
});

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

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, dataservice, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.IsTranslate = false;
    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture] ? caption[culture] : caption;
        $rootScope.IsTranslate = true;
    });

    
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider, $qProvider) {
    $translateProvider.useUrlLoader('/Admin/KPIEmployee/Translation');
    caption = $translateProvider.translations();
    $qProvider.errorOnUnhandledRejections(false);
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/map', {
            templateUrl: ctxfolder + '/google-map.html',
            controller: 'google-map'
        })
        .when('/1', {
            templateUrl: ctxfolder + '/menu1.html',
            controller: 'index1'
        })
        .when('/2', {
            templateUrl: ctxfolder + '/menu2.html',
            controller: 'index'
        })
        .when('/3', {
            templateUrl: ctxfolder + '/menu3.html',
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

app.controller('index', function ($scope, $rootScope, $sce, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter, $translate) {
    $scope.model = {
        DepartmentCode: "",
        EmployeeCode: "",
        StartTime: "",
        EndTime: ""
    }

    $scope.initBoxCard = function () {
        dataservice.getDepartment(function (rs) {
            rs = rs.data.Object;
            $scope.lstDp = rs;
        });

    }

    $scope.ChangeDepart = function (data) {
        dataservice.getEmployee(data,function (rs) {
            rs = rs.data;
            $scope.lstEmpl = rs;

        })
        $scope.model.EmployeeCode = "";
    }
    
    window.tabler = {
        colors: {
            'blue': '#467fcf',
            'blue-darkest': '#0e1929',
            'blue-darker': '#1c3353',
            'blue-dark': '#3866a6',
            'blue-light': '#7ea5dd',
            'blue-lighter': '#c8d9f1',
            'blue-lightest': '#edf2fa',
            'azure': '#45aaf2',
            'azure-darkest': '#0e2230',
            'azure-darker': '#1c4461',
            'azure-dark': '#3788c2',
            'azure-light': '#7dc4f6',
            'azure-lighter': '#c7e6fb',
            'azure-lightest': '#ecf7fe',
            'indigo': '#6574cd',
            'indigo-darkest': '#141729',
            'indigo-darker': '#282e52',
            'indigo-dark': '#515da4',
            'indigo-light': '#939edc',
            'indigo-lighter': '#d1d5f0',
            'indigo-lightest': '#f0f1fa',
            'purple': '#a55eea',
            'purple-darkest': '#21132f',
            'purple-darker': '#42265e',
            'purple-dark': '#844bbb',
            'purple-light': '#c08ef0',
            'purple-lighter': '#e4cff9',
            'purple-lightest': '#f6effd',
            'pink': '#f66d9b',
            'pink-darkest': '#31161f',
            'pink-darker': '#622c3e',
            'pink-dark': '#c5577c',
            'pink-light': '#f999b9',
            'pink-lighter': '#fcd3e1',
            'pink-lightest': '#fef0f5',
            'red': '#e74c3c',
            'red-darkest': '#2e0f0c',
            'red-darker': '#5c1e18',
            'red-dark': '#b93d30',
            'red-light': '#ee8277',
            'red-lighter': '#f8c9c5',
            'red-lightest': '#fdedec',
            'orange': '#fd9644',
            'orange-darkest': '#331e0e',
            'orange-darker': '#653c1b',
            'orange-dark': '#ca7836',
            'orange-light': '#feb67c',
            'orange-lighter': '#fee0c7',
            'orange-lightest': '#fff5ec',
            'yellow': '#f1c40f',
            'yellow-darkest': '#302703',
            'yellow-darker': '#604e06',
            'yellow-dark': '#c19d0c',
            'yellow-light': '#f5d657',
            'yellow-lighter': '#fbedb7',
            'yellow-lightest': '#fef9e7',
            'lime': '#7bd235',
            'lime-darkest': '#192a0b',
            'lime-darker': '#315415',
            'lime-dark': '#62a82a',
            'lime-light': '#a3e072',
            'lime-lighter': '#d7f2c2',
            'lime-lightest': '#f2fbeb',
            'green': '#5eba00',
            'green-darkest': '#132500',
            'green-darker': '#264a00',
            'green-dark': '#4b9500',
            'green-light': '#8ecf4d',
            'green-lighter': '#cfeab3',
            'green-lightest': '#eff8e6',
            'teal': '#2bcbba',
            'teal-darkest': '#092925',
            'teal-darker': '#11514a',
            'teal-dark': '#22a295',
            'teal-light': '#6bdbcf',
            'teal-lighter': '#bfefea',
            'teal-lightest': '#eafaf8',
            'cyan': '#17a2b8',
            'cyan-darkest': '#052025',
            'cyan-darker': '#09414a',
            'cyan-dark': '#128293',
            'cyan-light': '#5dbecd',
            'cyan-lighter': '#b9e3ea',
            'cyan-lightest': '#e8f6f8',
            'gray': '#868e96',
            'gray-darkest': '#1b1c1e',
            'gray-darker': '#36393c',
            'gray-dark': '#6b7278',
            'gray-light': '#aab0b6',
            'gray-lighter': '#dbdde0',
            'gray-lightest': '#f3f4f5',
            'gray-dark': '#343a40',
            'gray-dark-darkest': '#0a0c0d',
            'gray-dark-darker': '#15171a',
            'gray-dark-dark': '#2a2e33',
            'gray-dark-light': '#717579',
            'gray-dark-lighter': '#c2c4c6',
            'gray-dark-lightest': '#ebebec'
        }
    };

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

    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        //Check null 

        if (data.DepartmentCode == "" || data.DepartmentCode == null) {
            $scope.errorDepart = true;
            mess.Status = true;
        } else {
            $scope.errorDepart = false;
        }

        if (data.EmployeeCode == "") {
            $scope.errorUser = true;
            mess.Status = true;
        } else {
            $scope.errorUser = false;
        }

        return mess;
    };

    $scope.TimeMustWork = 0;
    $scope.TimeWorkReal = 0;
    $scope.TimeWorkLate = 0;
    $scope.TimeWorkNotwork = 0;
    $scope.SumCardWork = 0;
    $scope.SumCardWorkComp = 0;
    $scope.SumCardWorkComDead = 0;
    $scope.SumCardWorkComnotDead = 0;
    $scope.SumCardWorkCancel = 0;
    $scope.SumCardWorkPending = 0;

    $scope.searchkpi = function (obj) {
        var cls = {
            DepartmentCode : obj.DepartmentCode,
            EmployeeCode : obj.EmployeeCode,
            StartTime : obj.StartTime,
            EndTime: obj.EndTime

        }
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            dataservice.getKPIEmployee($scope.model, function (rs) {
                rs = rs.data;
                $scope.UserName = rs[0].FullName;
                $scope.Postion = rs[0].Postion;
                $scope.TimeMustWork = rs[0].TimeMustWork;
                $scope.TimeWorkReal = rs[0].TimeWorkReal;
                $scope.TimeWorkLate = rs[0].TimeWorkLate;
                $scope.TimeWorkNotwork = rs[0].TimeWorkNotwork;
                $scope.SumCardWork = rs[0].SumCardWork;
                $scope.SumCardWorkComp = rs[0].SumCardWorkComp;
                $scope.SumCardWorkComDead = rs[0].SumCardWorkComDead;
                $scope.SumCardWorkComnotDead = rs[0].SumCardWorkComnotDead;
                $scope.SumCardWorkCancel = rs[0].SumCardWorkCancel;
                $scope.SumCardWorkPending = rs[0].SumCardWorkPending;
            });
            dataservice.searchChartKPI($scope.model, function (rs) {
                rs = rs.data;
                month = [];
                SumCardWork = ['SumCardWork'];
                SumCardWorkComp = ['SumCardWorkComp'];
                SumCardWorkComDead = ['SumCardWorkComDead'];
                SumCardWorkComnotDead = ['SumCardWorkComnotDead'];
                SumCardWorkCancel = ['SumCardWorkCancel'];
                SumCardWorkPending = ['SumCardWorkPending'];
                for (var i = 0; i < rs.length; i++) {
                    SumCardWork.push(rs[i].SumCardWork);
                    SumCardWorkComp.push(rs[i].SumCardWorkComp);
                    SumCardWorkComDead.push(rs[i].SumCardWorkComDead);
                    SumCardWorkComnotDead.push(rs[i].SumCardWorkComnotDead);
                    SumCardWorkCancel.push(rs[i].SumCardWorkCancel);
                    SumCardWorkPending.push(rs[i].SumCardWorkPending);
                    month.push('Tháng ' + (rs[i].Month));
                }
                setTimeout(function () {
                    var chart = c3.generate({
                        bindto: '#chart', // id of chart wrapper
                        data: {
                            columns: [
                                // each columns data
                                SumCardWork,
                                SumCardWorkComp,
                                SumCardWorkComDead,
                                SumCardWorkComnotDead,
                                SumCardWorkCancel,
                                SumCardWorkPending
                            ],
                            type: 'area', // default type of chart
                            colors: {
                                'SumCardWork': tabler.colors["blue"],
                                'SumCardWorkComp': tabler.colors["lime"],
                                'SumCardWorkComDead': tabler.colors["red"],
                                'SumCardWorkComnotDead': tabler.colors["yellow"],
                                'SumCardWorkCancel': tabler.colors["grey"],
                                'SumCardWorkPending': tabler.colors["pink"],

                            },
                            names: {
                                // name of each serie
                                'SumCardWork': caption.KPIEM_LBL_ALL_JOB_ASSIGN,
                                'SumCardWorkComp': caption.KPIEM_LBL_ALL_JOB_DONE,
                                'SumCardWorkComDead': caption.KPIEM_LBL_ALL_JOB_DONE_ON_TIME,
                                'SumCardWorkComnotDead': caption.KPIEM_LBL_ALL_JOB_DONE_OUT_TIME,
                                'SumCardWorkCancel': caption.KPIEM_LBL_ALL_CANCLE,
                                'SumCardWorkPending': caption.KPIEM_LBL_ALL_JOB_PENDING,
                            }
                        },
                        axis: {
                            x: {
                                type: 'category',
                                // name of each category
                                categories: month
                            },
                        },
                        legend: {
                            show: true, //hide legend
                        },
                        padding: {
                            bottom: 0,
                            top: 0
                        },
                    });
                }, 100);

            });
        }
    }

    function loadDate() {
        $("#datefrom").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#dateto').datepicker('setStartDate', maxDate);
        });
        $("#dateto").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#datefrom').datepicker('setEndDate', maxDate);
        });
        $('.end-date').click(function () {
            $('#datefrom').datepicker('setEndDate', null);
        });
        $('.start-date').click(function () {
            $('#dateto').datepicker('setStartDate', null);
        });
    }

    $scope.initBoxCard();

    function formatNumber(n) {
        // format number 1000000 to 1,234,567
        return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }

    function showTime() {
        var date = new Date();
        var h = date.getHours(); // 0 - 23
        var m = date.getMinutes(); // 0 - 59
        var s = date.getSeconds(); // 0 - 59
        var session = "AM";

        if (h == 0) {
            h = 12;
        }

        if (h > 12) {
            h = h - 12;
            session = "PM";
        }

        h = (h < 10) ? "0" + h : h;
        m = (m < 10) ? "0" + m : m;
        s = (s < 10) ? "0" + s : s;

        var time = h + ":" + m + ":" + s + " " + session;
        document.getElementById("MyClockDisplay").innerText = time;
        document.getElementById("MyClockDisplay").textContent = time;

        //setTimeout(showTime, 1000);
    }

    setTimeout(function () {
        loadDate();
    }, 100)
});
