var ctxfolder = "/views/front-end/admin";
var app = angular.module('App_ESEIM', ["ngRoute"])
app.factory('dataservice', function ($http) {
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
        getJTableData: function (data, callback) {
            $http.post('/UserProfile/Jtable/', data).then(callback);
        },
    }
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, dataservice) {

});

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
       
});
app.controller('index', function ($scope, $rootScope, $compile, dataservice, $filter,$http) {

    $scope.Gender = [{
        Name: 'Nam',
        Code: 1
    },
    {
        Name: 'Nữ',
        Code: 0
    },
    {
        Name: 'Khác',
        Code: 2
    }]
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.searchModel = {
        CurrentName: '',
								FromDate: '',
                                Gender: 1,
                                Nation: '',
                                Religion: '',
                                JobEducation: '',
                                Degree: '',
                                ForeignLanguage: '',
                                ItDegree: '',
                                MinorityLanguage: '',
                                PermanentResidence: '',
                                Job: '',
                                TemporaryAddress: '',
                                HomeTown: '',
                                GeneralEducation: '',
								ToDate: '',
                                UserCode: 1
    }
    $scope.model = {
        CurrentName: '',
								Birthday: '',
                                Gender: '',
                                Nation: '',
                                Religion: '',
                                JobEducation: '',
                                Degree: '',
                                ForeignLanguage: '',
                                ItDegree: '',
                                MinorityLanguages: '',
                                PermanentResidence: '',
                                Job: '',
                                TemporaryAddress: '',
                                HomeTown: '',
                                UnderPostGraduateEducation: '',
                                GeneralEducation: '',
                                PoliticalTheory: '',
                                PlaceBirth: '',
                                SelfComment: '',
								CreatedPlace: '',
                                ResumeNumber: ''
    }
    $scope.listSearchModel = []

    $scope.getAll = function () {
        console.log($scope.searchModel);
        dataservice.getJTableData($scope.searchModel, function (rs) {
            rs = rs.data;
            console.log(rs);
            $scope.listSearchModel = rs;
        })
    }

    $scope.search = function () {
        $scope.getAll();
        console.log($scope.searchModel);
    }
    $scope.getAll();

    

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
    }
    $rootScope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.initData = function () {
        dataservice.getCatId(function (rs) {
            rs = rs.data;

            $scope.listModuleId = rs;
        });

    };


    $scope.add = function (data) {
        $rootScope.data = data;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/add.html',
            controller: 'add',
            backdrop: 'static',
            size: '90'
        });
        modalInstance.result.then(function (d) {
            reloadData(true);
        }, function () { });
    };

    $scope.upload = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: ctxfolder + '/word.html',
            controller: 'word',
            backdrop: 'static',
            size: '70'
        });
        modalInstance.result.then(function (d) {
            reloadData(true);
        }, function () { });
        console.log("ok");
    };

    setTimeout(function () {
    }, 200);
    // $("#PostFromDate").datepicker({
    //     inline: false,
    //     autoclose: true,
    //     format: "dd/mm/yyyy",
    //     fontAwesome: true,
    // }).on('changeDate', function (selected) {
    //     var maxDate = new Date(selected.date.valueOf());
    //     $('#PostToDate').datepicker('setStartDate', maxDate);
    // });
    // $("#PostToDate").datepicker({
    //     inline: false,
    //     autoclose: true,
    //     format: "dd/mm/yyyy",
    //     fontAwesome: true,
    // }).on('changeDate', function (selected) {
    //     var maxDate = new Date(selected.date.valueOf());
    //     $('#PostFromDate').datepicker('setEndDate', maxDate);
    // });
});


