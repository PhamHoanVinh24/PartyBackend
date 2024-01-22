var ctxfolder = "/views/admin/wareHouseQRCodeManager";
var ctxfolderMessage = "/views/message-box";
var ctxfolderQrCode = "/views/admin/edmsQRCodeManager";
var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'monospaced.qrcode']);
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
    };
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
        //Danh sách kho
        getListWareHouse: function (callback) {
            $http.get('/Admin/WareHouseQRCodeManager/GetListWareHouse').then(callback);
        },
        getListFloorWithListWareHouse: function (data, callback) {
            $http.get('/Admin/WareHouseQRCodeManager/GetListFloorWithListWareHouse?listWareHouse=' + data).then(callback);
        },
        getListLineWithListFloor: function (data, callback) {
            $http.get('/Admin/WareHouseQRCodeManager/GetListLineWithListFloor?listFloor=' + data).then(callback);
        },
        getListRackWithListLine: function (data, callback) {
            $http.get('/Admin/WareHouseQRCodeManager/GetListRackWithListLine?listLine=' + data).then(callback);
        },
        getListRackPositionWithListRack: function (data, callback) {
            $http.get('/Admin/WareHouseQRCodeManager/GetListRackPositionWithListRack?listRack=' + data).then(callback);
        },
        getListBoxWithListRack: function (data, callback) {
            $http.get('/Admin/EDMSQRCodeManager/GetListBoxWithListRack?listRack=' + data).then(callback);
        },

        loadBranch: function (callback) {
            $http.post('/User/GetBranch/').then(callback);
        },
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $filter, $location, $cookies, $translate, dataservice) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('.AspNetCore.Culture') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
    });
    
});

app.config(function ($routeProvider, $validatorProvider, $httpProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/EDMSQRCodeManager/Translation');
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
    $httpProvider.interceptors.push('interceptors');
});

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $location, $filter) {
    $scope.model = {
        ListWareHouseCode: [],
        ListFloorCode: [],
        ListLineCode: [],
        ListRackCode: [],
        IsRackPosition: false,
        IsBox: false
    };
    $scope.searchBoxModel = {
        FromDate: '',
        ToDate: '',
    };
    $scope.QRlistFloor = [];
    $scope.QRlistLine = [];
    $scope.QRlistRack = [];
    $scope.listObjPrint = [];
    $scope.init = function () {
        dataservice.getListWareHouse(function (rs) {
            rs = rs.data;
            $rootScope.QRlistWareHouse = rs;
            setTimeout(function () {
                loadMultiSelectWareHouse();
            }, 10);
        });

        //dataservice.getListCabinet(function (rs) {
        //    rs = rs.data;
        //    $rootScope.listCabinet = rs;
        //});
    };
    $scope.init();
    $scope.selectWareHouse = function (listWareHouseCode) {
        dataservice.getListFloorWithListWareHouse(listWareHouseCode, function (rs) {
            rs = rs.data;
            $scope.QRlistFloor = rs;
            $('#floor-multiple-checkboxes').multiselect('destroy');
            setTimeout(function () {
                loadMultiSelectFloor();
            }, 1);
        });
    };
    $scope.selectFloor = function (listFloor) {
        dataservice.getListLineWithListFloor(listFloor, function (rs) {
            rs = rs.data;
            $scope.QRlistLine = rs;
            $('#line-multiple-checkboxes').multiselect('destroy');
            setTimeout(function () {
                loadMultiSelectLine();
            }, 1);
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
    $scope.selectLine = function (listLine) {
        dataservice.getListRackWithListLine(listLine, function (rs) {
            rs = rs.data;
            $scope.QRlistRack = rs;
            $('#rack-multiple-checkboxes').multiselect('destroy');
            setTimeout(function () {
                loadMultiSelectRack();
            }, 1);
        });
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



    $scope.selectPositionRack = function (isRackPosition) {
        dataservice.getListRackPositionWithListRack($scope.model.ListRackCode, function (rs) {
            rs = rs.data;
            if (isRackPosition) {
                if (rs.length !== 0) {
                    rs.forEach(function (obj, index) {
                        $scope.listObjPrint.push(obj);
                    });
                    App.toastrSuccess(caption.EDMS_QRCODE_MANAGER_ADD_SHELF_POSITION)
                } else {
                    App.toastrError(caption.EDMS_QRCODE_MANAGER_NOT_LOCATION)
                }
            } else {
                for (var i = 0; i < $scope.listObjPrint.length; i++) {
                    if ($scope.listObjPrint[i].Type === "RACK_POSITION") {
                        $scope.listObjPrint.splice(i, 1);
                        i--;
                    }
                }
                App.toastrSuccess(caption.EDMS_QRCODE_MANAGER_DELETE_SHELF_POSITION)
            }
        });
    };
    $scope.selectBox = function (isBox) {
        setTimeout(function () {
            isBox = $scope.model.IsBox;
            dataservice.getListBoxWithListRack($scope.model.ListRackCode, function (rs) {
                rs = rs.data;
                if (isBox) {
                    if (rs.length != 0) {
                        rs.forEach(function (obj, index) {
                            $scope.listObjPrint.push(obj);
                        });
                        App.toastrSuccess(caption.EDMS_QRCODE_MANAGER_ADD_BOX)
                    } else {
                        App.toastrError(caption.EDMS_QRCODE_MANAGER_NOT_BOX)
                    }
                } else {
                    for (var i = 0; i < $scope.listObjPrint.length; i++) {
                        if ($scope.listObjPrint[i].Type == "BOX") {
                            $scope.listObjPrint.splice(i, 1);
                            i--;
                        }
                    }
                    App.toastrSuccess(caption.EDMS_QRCODE_MANAGER_DELETE_BOX)
                }
            });
        }, 100);
    }

    $scope.selectObjPrint = function (item) {
        item.IsCheck = !item.IsCheck;
        var lengthCheck = $filter('filter')($scope.listObjPrint, { 'IsCheck': true }).length;
        $scope.IsCheckAll = lengthCheck === $scope.listObjPrint.length;
    };
    $scope.selectAllObjPrint = function (isCheckAll) {
        $scope.listObjPrint.forEach(function (obj, index) {
            obj.IsCheck = isCheckAll;
        });
        $scope.model.IsRackPosition = false;
        $scope.model.IsBox = false;
    };
    $scope.deleteObjPrint = function () {
        var countDelete = 0;
        for (var i = 0; i < $scope.listObjPrint.length; i++) {
            if ($scope.listObjPrint[i].IsCheck) {
                if ($scope.listObjPrint[i].Type == "WAREHOUSE") {
                    resetSelectMultiSelectWareHouse($scope.listObjPrint[i].Code);
                } else if ($scope.listObjPrint[i].Type == "FLOOR") {
                    resetSelectMultiSelectFloor($scope.listObjPrint[i].Code);
                } else if ($scope.listObjPrint[i].Type == "LINE") {
                    resetSelectMultiSelectLine($scope.listObjPrint[i].Code);
                } else if ($scope.listObjPrint[i].Type == "RACK") {
                    resetSelectMultiSelectRack($scope.listObjPrint[i].Code);
                }

                $scope.listObjPrint.splice(i, 1);
                countDelete++;
                i--;
            }
        }
        if (countDelete > 0) {
            App.toastrSuccess(caption.COM_DELETE_SUCCESS);
        } else {
            App.toastrError(caption.EDMS_QRCODE_MANAGER_CHOOSE_OBJ_DEL);
        }
        if ($scope.listObjPrint.length == 0) {
            $scope.IsCheckAll = false;
        }
    }
    $scope.printObjPrint = function () {
        var listPrint = [];
        for (var i = 0; i < $scope.listObjPrint.length; i++) {
            if ($scope.listObjPrint[i].IsCheck) {
                var obj = {
                    Code: $scope.listObjPrint[i].Code,
                    Base64: document.getElementById($scope.listObjPrint[i].Code).getElementsByTagName('a')[0].getAttribute('href')
                };
                listPrint.push(obj);
            }
        }
        if (listPrint.length > 0) {
            var hiddenFrame = $('<iframe style = "width:0;height:0;border:none"></iframe>').appendTo('body')[0];
            var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
            var listQrCode = "";
            var newWin = window.frames["printf"];
            for (var j = 0; j < listPrint.length; j++) {
                var str = listPrint[j].Code.replace(/_QUANGTRUNG/g, '');
                listQrCode = listQrCode + '<div class="col-md-2" style="text-align: center"> ' +
                    '<img src="' + listPrint[j].Base64 + '"width="100" height="100"/> ' +
                    '<p style="font-family:verdana, arial, sans-serif;font-size:6px;word-break:break-all">' + str + '<p/>' +
                    '</div>';
            }

            doc.write('<style>@page{margin: 0;size: auto;}' +
                '.col-md-2{width: 16.66667%;float: left;margin-top:20px}</style>' + '<body onload="window.print()">' + listQrCode + '</body>');
            doc.close();
        } else {
            App.toastrError(caption.EDMS_QRCODE_MANAGER_CHOOSE_OBJ_PRINT);
        }
    };

    function loadMultiSelectWareHouse() {
        $("#warehouse-multiple-checkboxes").multiselect({
            nonSelectedText: caption.EDMS_QRCODE_MANAGER_CHOOSE_WAREHOUSE,
            allSelectedText: caption.EDMS_QRCODE_MANAGER_SELECT_ALL,
            nSelectedText: caption.EDMS_QRCODE_MANAGER_CHOOSE,
            maxHeight: 400,
            buttonWidth: '100%',
            disableIfEmpty: true,
            includeSelectAllOption: true,
            selectAllText: caption.EDMS_QRCODE_MANAGER_All,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            filterPlaceholder: caption.COM_BTN_SEARCH,
            onChange: function (option, checked) {
                var item = $rootScope.QRlistWareHouse.find(function (element) {
                    if (element.Code == $(option).val()) return true;
                });
                if (item) {
                    if (checked) {
                        $scope.listObjPrint.push(item);
                    } else {
                        //remove item print
                        for (var i = 0; i < $scope.listObjPrint.length; i++) {
                            if ($scope.listObjPrint[i].Code == item.Code) {
                                $scope.listObjPrint.splice(i, 1);
                                break;
                            }
                        }
                        //remove child print
                        removeChildPrintWareHouse(item.Code);
                        removeChildListWareHouse(item.Code);
                    }
                }
            },
            onSelectAll: function () {
                $rootScope.QRlistWareHouse.forEach(function (obj, index) {
                    var checkExist = $scope.listObjPrint.find(function (element) {
                        if (element.Code == obj.Code) return true;
                    });
                    if (!checkExist) {
                        $scope.listObjPrint.push(obj);
                    }
                });
            },
            onDeselectAll: function () {
                for (var i = 0; i < $scope.listObjPrint.length; i++) {
                    if ($scope.listObjPrint[i].Type == "WAREHOUSE") {
                        //remove child
                        removeChildPrintWareHouse($scope.listObjPrint[i].Code);
                        removeChildListWareHouse($scope.listObjPrint[i].Code);


                        $scope.listObjPrint.splice(i, 1);
                        i--;
                    }
                }
            },
            templates: {
                li: '<li class="checkList"><a tabindex="0"><div class="aweCheckbox aweCheckbox-danger"><label for=""></label></div></a></li>'
            }
        });
        $('.multiselect-container div.aweCheckbox').each(function (index) {

            var id = 'multiselectWareHouse-' + index,
                $input = $(this).find('input');
            // Associate the label and the input
            $(this).find('label').attr('for', id);
            $input.attr('id', id);

            // Remove the input from the label wrapper
            $input.detach();

            // Place the input back in before the label
            $input.prependTo($(this));

            $(this).click(function (e) {
                // Prevents the click from bubbling up and hiding the dropdown
                e.stopPropagation();
            });
        });
    }
    function loadMultiSelectFloor() {
        $("#floor-multiple-checkboxes").multiselect({
            nonSelectedText: caption.EDMS_QRCODE_MANAGER_CHOOSE_FLOOR,
            allSelectedText: caption.EDMS_QRCODE_MANAGER_SELECT_ALL,
            nSelectedText: caption.EDMS_QRCODE_MANAGER_CHOOSE,
            maxHeight: 400,
            buttonWidth: '100%',
            disableIfEmpty: true,
            includeSelectAllOption: true,
            selectAllText: caption.EDMS_QRCODE_MANAGER_All,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            filterPlaceholder: caption.COM_BTN_SEARCH,
            onChange: function (option, checked) {
                var item = $scope.QRlistFloor.find(function (element) {
                    if (element.Code == $(option).val()) return true;
                });
                if (item) {
                    if (checked) {
                        $scope.listObjPrint.push(item);
                    } else {
                        //remove item
                        for (var i = 0; i < $scope.listObjPrint.length; i++) {
                            if ($scope.listObjPrint[i].Code == item.Code) {
                                $scope.listObjPrint.splice(i, 1);
                                break;
                            }
                        }
                        //remove child print
                        removeChildPrintFloor(item.Code);
                        removeChildListFloor(item.Code);
                    }
                }
            },
            onSelectAll: function () {
                $scope.QRlistFloor.forEach(function (obj, index) {
                    var checkExist = $scope.listObjPrint.find(function (element) {
                        if (element.Code == obj.Code) return true;
                    });
                    if (!checkExist) {
                        $scope.listObjPrint.push(obj);
                    }
                });
            },
            onDeselectAll: function () {
                for (var i = 0; i < $scope.listObjPrint.length; i++) {
                    if ($scope.listObjPrint[i].Type == "FLOOR") {
                        //remove child
                        removeChildPrintFloor($scope.listObjPrint[i].Code);
                        removeChildListFloor($scope.listObjPrint[i].Code);
                        $scope.listObjPrint.splice(i, 1);
                        i--;
                    }
                }
            },
            templates: {
                li: '<li class="checkList"><a tabindex="0"><div class="aweCheckbox aweCheckbox-danger"><label for=""></label></div></a></li>'
            }
        });
        $('.multiselect-container div.aweCheckbox').each(function (index) {

            var id = 'multiselect-floor-' + index,
                $input = $(this).find('input');
            // Associate the label and the input
            $(this).find('label').attr('for', id);
            $input.attr('id', id);

            // Remove the input from the label wrapper
            $input.detach();

            // Place the input back in before the label
            $input.prependTo($(this));

            $(this).click(function (e) {
                // Prevents the click from bubbling up and hiding the dropdown
                e.stopPropagation();
            });
        });
    }
    function loadMultiSelectLine() {
        $("#line-multiple-checkboxes").multiselect({
            nonSelectedText: caption.EDMS_QRCODE_MANAGER_CHOOSE_ROW,
            allSelectedText: caption.EDMS_QRCODE_MANAGER_SELECT_ALL,
            nSelectedText: caption.EDMS_QRCODE_MANAGER_CHOOSE,
            maxHeight: 400,
            buttonWidth: '100%',
            disableIfEmpty: true,
            includeSelectAllOption: true,
            selectAllText: caption.EDMS_QRCODE_MANAGER_All,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            filterPlaceholder: caption.COM_BTN_SEARCH,
            onChange: function (option, checked) {
                var item = $scope.QRlistLine.find(function (element) {
                    if (element.Code == $(option).val()) return true;
                });
                if (item) {
                    if (checked) {
                        $scope.listObjPrint.push(item);
                    } else {
                        //remove item
                        for (var i = 0; i < $scope.listObjPrint.length; i++) {
                            if ($scope.listObjPrint[i].Code == item.Code) {
                                $scope.listObjPrint.splice(i, 1);
                                break;
                            }
                        }

                        //remove child
                        removeChildPrintLine(item.Code);
                        removeChildListLine(item.Code);

                    }
                }
            },
            onSelectAll: function () {
                $scope.QRlistLine.forEach(function (obj, index) {
                    var checkExist = $scope.listObjPrint.find(function (element) {
                        if (element.Code == obj.Code) return true;
                    });
                    if (!checkExist) {
                        $scope.listObjPrint.push(obj);
                    }
                });
            },
            onDeselectAll: function () {
                for (var i = 0; i < $scope.listObjPrint.length; i++) {
                    if ($scope.listObjPrint[i].Type == "LINE") {
                        //remove child
                        removeChildPrintLine($scope.listObjPrint[i].Code);
                        removeChildListLine($scope.listObjPrint[i].Code);
                        $scope.listObjPrint.splice(i, 1);
                        i--;
                    }
                }
            },
            templates: {
                li: '<li class="checkList"><a tabindex="0"><div class="aweCheckbox aweCheckbox-danger"><label for=""></label></div></a></li>'
            }
        });
        $('.multiselect-container div.aweCheckbox').each(function (index) {

            var id = 'multiselect-line-' + index,
                $input = $(this).find('input');
            // Associate the label and the input
            $(this).find('label').attr('for', id);
            $input.attr('id', id);

            // Remove the input from the label wrapper
            $input.detach();

            // Place the input back in before the label
            $input.prependTo($(this));

            $(this).click(function (e) {
                // Prevents the click from bubbling up and hiding the dropdown
                e.stopPropagation();
            });
        });
    }
    function loadMultiSelectRack() {
        $("#rack-multiple-checkboxes").multiselect({
            nonSelectedText: caption.EDMS_QRCODE_MANAGER_CHOOSE_SHELF,
            allSelectedText: caption.EDMS_QRCODE_MANAGER_SELECT_ALL,
            nSelectedText: caption.EDMS_QRCODE_MANAGER_All,
            maxHeight: 400,
            buttonWidth: '100%',
            disableIfEmpty: true,
            includeSelectAllOption: true,
            selectAllText: caption.EDMS_QRCODE_MANAGER_All,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            filterPlaceholder: caption.COM_BTN_SEARCH,
            onChange: function (option, checked) {
                var item = $scope.QRlistRack.find(function (element) {
                    if (element.Code == $(option).val()) return true;
                });
                if (item) {
                    if (checked) {
                        $scope.listObjPrint.push(item);
                        $scope.model.IsRackPosition = false;
                        $scope.model.IsBox = false;
                    } else {
                        //remove item
                        for (var i = 0; i < $scope.listObjPrint.length; i++) {
                            if ($scope.listObjPrint[i].Code == item.Code) {
                                $scope.listObjPrint.splice(i, 1);
                                break;
                            }
                        }

                        //remove child                      
                        removeChildPrintRack(item.Code);
                    }
                }
            },
            onSelectAll: function () {
                $scope.QRlistRack.forEach(function (obj, index) {
                    var checkExist = $scope.listObjPrint.find(function (element) {
                        if (element.Code == obj.Code) return true;
                    });
                    if (!checkExist) {
                        $scope.listObjPrint.push(obj);
                    }
                });
            },
            onDeselectAll: function () {
                for (var i = 0; i < $scope.listObjPrint.length; i++) {
                    if ($scope.listObjPrint[i].Type == "RACK") {
                        //remove child
                        removeChildPrintRack($scope.listObjPrint[i].Code);
                        $scope.listObjPrint.splice(i, 1);
                        i--;
                    }
                }
            },
            templates: {
                li: '<li class="checkList"><a tabindex="0"><div class="aweCheckbox aweCheckbox-danger"><label for=""></label></div></a></li>'
            }
        });
        $('.multiselect-container div.aweCheckbox').each(function (index) {

            var id = 'multiselect-rack-' + index,
                $input = $(this).find('input');
            // Associate the label and the input
            $(this).find('label').attr('for', id);
            $input.attr('id', id);

            // Remove the input from the label wrapper
            $input.detach();

            // Place the input back in before the label
            $input.prependTo($(this));

            $(this).click(function (e) {
                // Prevents the click from bubbling up and hiding the dropdown
                e.stopPropagation();
            });
        });
    }

    function removeChildPrintWareHouse(code) {
        for (var i = 0; i < $scope.listObjPrint.length; i++) {
            if ($scope.listObjPrint[i].Parent == code && $scope.listObjPrint[i].Type == "FLOOR") {
                removeChildPrintFloor($scope.listObjPrint[i].Code);
                resetSelectMultiSelectFloor($scope.listObjPrint[i].Code);
                $scope.listObjPrint.splice(i, 1);
                i--;
            }
        }
    }
    function removeChildPrintFloor(code) {
        for (var i = 0; i < $scope.listObjPrint.length; i++) {
            if ($scope.listObjPrint[i].Parent == code && $scope.listObjPrint[i].Type == "LINE") {
                removeChildPrintLine($scope.listObjPrint[i].Code);
                resetSelectMultiSelectLine($scope.listObjPrint[i].Code);
                $scope.listObjPrint.splice(i, 1);
                i--;
            }
        }
    }
    function removeChildPrintLine(code) {
        for (var i = 0; i < $scope.listObjPrint.length; i++) {
            if ($scope.listObjPrint[i].Parent == code && $scope.listObjPrint[i].Type == "RACK") {
                removeChildPrintRack($scope.listObjPrint[i].Code);
                resetSelectMultiSelectRack($scope.listObjPrint[i].Code);
                $scope.listObjPrint.splice(i, 1);
                i--;
            }
        }
    }
    function removeChildPrintRack(code) {
        for (var i = 0; i < $scope.listObjPrint.length; i++) {
            if ($scope.listObjPrint[i].Parent == code && ($scope.listObjPrint[i].Type == "RACK_POSITION" || $scope.listObjPrint[i].Type == "BOX")) {
                $scope.listObjPrint.splice(i, 1);
                i--;
            }
        }
        $scope.model.IsRackPosition = false;
        $scope.model.IsBox = false;
    }

    function removeChildListWareHouse(code) {
        for (var i = 0; i < $scope.QRlistFloor.length; i++) {
            if ($scope.QRlistFloor[i].Parent == code) {
                removeChildListFloor($scope.QRlistFloor[i].Code);
                $scope.QRlistFloor.splice(i, 1);
                i--;
            }
        }
        $('#floor-multiple-checkboxes').multiselect('destroy');
        setTimeout(function () {
            loadMultiSelectFloor();
        }, 1);
    }
    function removeChildListFloor(code) {
        for (var i = 0; i < $scope.QRlistLine.length; i++) {
            if ($scope.QRlistLine[i].Parent == code) {
                removeChildListLine($scope.QRlistLine[i].Code);
                $scope.QRlistLine.splice(i, 1);
                i--;
            }
        }
        $('#line-multiple-checkboxes').multiselect('destroy');
        setTimeout(function () {
            loadMultiSelectLine();
        }, 1);
    }
    function removeChildListLine(code) {
        for (var i = 0; i < $scope.QRlistRack.length; i++) {
            if ($scope.QRlistRack[i].Parent == code) {
                $scope.QRlistRack.splice(i, 1);
                i--;
            }
        }
        $('#rack-multiple-checkboxes').multiselect('destroy');
        setTimeout(function () {
            loadMultiSelectRack();
        }, 1);
    }


    function resetSelectMultiSelectWareHouse(code) {
        $('option:selected', $('#warehouse-multiple-checkboxes')).each(function (element) {
            if (code == $(this).val()) {
                $(this).removeAttr('selected').prop('selected', false);
                return;
            }
        });
        $('#warehouse-multiple-checkboxes').multiselect('refresh');
    }
    function resetSelectMultiSelectFloor(code) {
        $('option:selected', $('#floor-multiple-checkboxes')).each(function (element) {
            var a = $(this).val();
            if (code == $(this).val()) {
                $(this).removeAttr('selected').prop('selected', false);
            }
        });
        $('#floor-multiple-checkboxes').multiselect('refresh');
    }
    function resetSelectMultiSelectLine(code) {
        $('option:selected', $('#line-multiple-checkboxes')).each(function (element) {
            if (code == $(this).val()) {
                $(this).removeAttr('selected').prop('selected', false);
                return;
            }
        });
        $('#line-multiple-checkboxes').multiselect('refresh');
    }
    function resetSelectMultiSelectRack(code) {
        $('option:selected', $('#rack-multiple-checkboxes')).each(function (element) {
            if (code == $(this).val()) {
                $(this).removeAttr('selected').prop('selected', false);
                return;
            }
        });
        $('#rack-multiple-checkboxes').multiselect('refresh');
    }

    function addClassScrollFade() {
        $(".bootstrap-multiple-checkboxes").find('.multiselect-container').addClass("scroller-sm-fade");
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
        loadMultiSelectWareHouse();
        loadMultiSelectFloor();
        loadMultiSelectLine();
        loadMultiSelectRack();
        addClassScrollFade();
        loadDate();
    }, 1000);
});
