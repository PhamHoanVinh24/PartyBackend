var ctxfolder = "/views/admin/gateInOut";
var ctxfolderMessage = "/views/message-box";

var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate", 'ng.jsoneditor', 'dynamicNumber']).
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
        getZone: function (callback) {
            $http.post('/Admin/GateInOut/GetZone').then(callback);
        },
        getDeviceInZone: function (data, callback) {
            $http.post('/Admin/GateInOut/GetDeviceInZone?zoneCode=' + data).then(callback);
        }
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
    $translateProvider.useUrlLoader('/Admin/DashBoard/Translation');
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
    $('.menu-toggle').addClass('hidden');
    var oldZone = "";
    $scope.initData = function () {
        dataservice.getZone(function (rs) {
            rs = rs.data;
            $scope.zones = rs;
            if ($scope.zones.length > 0) {
                $scope.viewDevice($scope.zones[0].ZoneCode);
                oldZone = $scope.zones[0].ZoneCode;
            }
        })
    }
    $scope.initData();

    $scope.viewDevice = function (zoneCode) {
        dataservice.getDeviceInZone(zoneCode, function (rs) {
            debugger
            var clearZone = document.getElementById(oldZone);
            if (clearZone != null) {
                clearZone.remove();
            }

            rs = rs.data;
            var $iframe = $('#ifr' + zoneCode);
            var lstDevice = rs;
            var content = "";
            content += '<svg id="' + zoneCode + '" height="570" version="1.1" width="890" xmlns = "http://www.w3.org/2000/svg" xmlns: xlink = "http://www.w3.org/1999/xlink" style = "overflow: hidden; background: #000;border-radius: 10px;border: 2px solid #fff;margin-top:15px;" >';
            for (var j = 0; j < lstDevice.length; j++) {
                var svg = "";
                if (lstDevice[j].DeviceSvg !== "") {
                    
                    let blob = new Blob([lstDevice[j].DeviceSvg], { type: 'image/svg+xml' });
                    svg = URL.createObjectURL(blob);
                }
                else {
                    svg = "../../../lib/inOut/img/1.svg";
                }

                content += '<g>';
                content += '<rect x="' + (j * 180 + 7) + '" y="0" width="170" height="140" rx="0" ry="0" fill="#000000" stroke="#000000" class="draw2d_shape_composite_Group" stroke-opacity="0" stroke-width="1" fill-opacity="0" stroke-dasharray="none" opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 1; cursor: default;"></rect>';
                content += '<rect x="' + (j * 180 + 7) + '" y="0" width="170" height="140" rx="0" ry="0" fill="#1A1A1A" stroke="#1b1b1b" class="draw2d_shape_basic_Rectangle" stroke-opacity="1" stroke-width="1" fill-opacity="1" stroke-dasharray="none" opacity="1" transform="matrix(1,0,0,1,0,0)" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 1; cursor: move;"></rect>';
                content += '<rect x="' + (j * 180 + 53.765625) + '" y="142" width="76.46875" height="23.5" rx="0" ry="0" fill="#000000" stroke="#1b1b1b" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); opacity: 1;" class="draw2d_shape_basic_Label" stroke-opacity="1" stroke-width="1" fill-opacity="0" stroke-dasharray="none" opacity="1" transform="matrix(1,0,0,1,0,0)"></rect>';
                content += '<text x="' + (j * 180 + 5) + '" y="11.671875" text-anchor="start" font-family="&quot;Arial&quot;" font-size="12px" stroke="#000000" fill="#00adef" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); text-anchor: start; font-family: Arial; font-size: 12px; font-weight: normal; opacity: 1;" stroke-scale="true" class="draw2d_shape_basic_Label" font-weight="normal" fill-opacity="1" stroke-opacity="0" stroke-width="0" opacity="1" transform="matrix(1,0,0,1,53.7656,142)">';
                content += '<tspan dy="4" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">' + lstDevice[j].DeviceName + '</tspan>';

                content += ' </text>';
                content += '<image x="' + (j * 180 + 19) + '" y="28" width="70" height="95" preserveAspectRatio="none" xlink:href="' + svg + '" class="draw2d_shape_basic_Image" opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); display: inline-block; width: 70px; height: 95px; opacity: 1; cursor: move;"></image>';
                content += '<image x="' + (j * 180 + 96) + '" y="29" width="70" height="95" preserveAspectRatio="none" xlink:href="' + svg + '" class="draw2d_shape_basic_Image" opacity="1" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); display: inline-block; width: 70px; height: 95px; opacity: 1; cursor: move;"></image>';
                content += ' <text x="' + (j * 180 + 48) + '" y="20" fill="#00FF00">01</text>';
                content += '<text x="' + (j * 180 + 123) + '" y="20" fill="#00FF00">01</text>';
                content += '<text x="' + (j * 180 + 48) + '" y="140" fill="#00FF00">In</text>';
                content += '<text x="' + (j * 180 + 118) + '" y="140" fill="#00FF00">Out</text>';
                content += '</g>';
            }
            content += '</svg>';
            content += '<div class="content-box">';
            
            content += '</div>';
            
            $iframe.ready(function () {
                $iframe.contents().find("body").append(content);
            });
            const div = document.createElement('div');
            div.setAttribute("id", zoneCode);
            div.innerHTML = content;
            document.getElementById("div1").appendChild(div);
            oldZone = zoneCode;
            $scope.currentZone = zoneCode;
        })
    }
});
