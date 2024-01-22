var ctxfolder = "/views/admin/mapOnline";
//var webSyncHandleUrl = 'https://websync.s-work.vn/websync.ashx';
var webSyncHandleUrl = 'http://117.6.131.222:8080/websync.ashx';
//var urlIcon = '/images/map/xeracX.png';
// mảng chứa icon xe rác 
var carSourceVector = new ol.source.Vector({
    features: []
});
var carSourceVectorStatus = new ol.source.Vector({
    features: []
});
var carSourceVectorTypeAndBranch = new ol.source.Vector({
    features: []
});
var map;
// layer map
var LayerMap;
var layerGoogle = new ol.source.XYZ({
    url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
})
var OSM = new ol.source.OSM({
})
// mảng chứa id xe và x,y là kích thước xe
var idCar = [];
var x = 32;
var y = 32;

//mảng chứa layer tuyến đường
var routeSources = new ol.source.Vector({
    features: []
});
var routeSourceVector = new ol.layer.Vector({
    source: routeSources,
    updateWhileAnimating: true
});

//Show or hide route when click on car
var routeCarSources = new ol.source.Vector({
    features: []
});
var routeCarSourceVector = new ol.layer.Vector({
    source: routeCarSources,
    updateWhileAnimating: true
});
//mảng marker center park
var parkCenterSourceVector = new ol.source.Vector({
    features: []
});
var parkCenterLayer = new ol.layer.Vector({
    source: parkCenterSourceVector,
    updateWhileAnimating: true
});
// mảng chứa layer điểm để rác
var parkSources = new ol.source.Vector({
    features: [
    ]
});
var parkSourceVector = new ol.layer.Vector({
    source: parkSources,
    updateWhileAnimating: true
});
//Mảng chứa điểm rác được thêm mới khi vẽ bằng đa giác
var drawSV = new ol.source.Vector({ wrapX: false });
var drawLV = new ol.layer.Vector({
    source: drawSV
});
// mảng layer chứa route để thêm điểm
var routeDrawSource = new ol.source.Vector({
    features: [
    ]
});
var routeDrawLayer = new ol.layer.Vector({
    source: routeDrawSource,
    updateWhileAnimating: true
});
// mảng layer chứa điểm mới vẽ
var parkDrawSource = new ol.source.Vector({
    features: [
    ]
});
var parkDrawLayer = new ol.layer.Vector({
    source: parkDrawSource,
    updateWhileAnimating: true
});

var app = angular.module('App_ESEIM', ['App_ESEIM_DASHBOARD',"ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngSanitize', "ngCookies", "pascalprecht.translate", 'monospaced.qrcode']);

app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getStaffKeeping: function (data, callback) {
            $http.post('/Admin/MapOnline/GetStaffKeeping/', data).then(callback);
        },
        getRouteInOut: function (data, callback) {
            $http.post('/Admin/MapOnline/GetRouteInOut/', data).then(callback);
        },
        getAllInCalendar: function (data, memberId, callback) {
            $http.post('/Admin/StaffSalary/GetAllInCalendar?dateSearch=' + data + '&memberId=' + memberId).then(callback);
        },
        statiscalEmployee: function (callback) {
            $http.post('/Admin/MapOnline/StatiscalEmployee').then(callback);
        }
    };
});

app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $compile, $uibModal, $filter, dataservice, $cookies, $translate) {
    $rootScope.IsMapCustomer = true;
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);
    $rootScope.RouteCode = "";
});

app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/MapOnline/Translation');
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

app.controller('index', function ($scope, $rootScope, $compile, $uibModal, $location, dataservice, $filter, DTOptionsBuilder, DTColumnBuilder) {
    $scope.model = {
        FromDate: '',
        ToDate: '',
        UserName: ''
    }
    //var date = new Date();
    //var priorDate = new Date().setDate(date.getDate() - 3)
    //$scope.model.FromDate = $filter('date')((priorDate), 'dd/MM/yyyy')
    //$scope.model.ToDate = $filter('date')((date), 'dd/MM/yyyy')

    $scope.initData = function () {
        var searchData = { FromDate: $scope.model.FromDate, ToDate: $scope.model.ToDate, UserName: "" }
        dataservice.getStaffKeeping(searchData, function (rs) {
            rs = rs.data;
            $scope.listUser = rs.ListIn;
        });
        dataservice.statiscalEmployee(function (rs) {
            rs = rs.data;
            $scope.lstEmp = rs.LstEmp;
            $scope.allEmp = rs.AllEmp;
            $scope.checkIn = rs.CheckIn;
            $scope.late = rs.Late;
            $scope.notWork = rs.NotWork;
        })
    }
    $scope.initData();

    $scope.listStaffOnline = [];
    var input = document.getElementById('autocomplete');
    var autocomplete = new google.maps.places.Autocomplete(input);
    var bounds = new google.maps.LatLngBounds();
    var points = [],
        url_osrm_nearest = '//router.project-osrm.org/nearest/v1/driving/',
        url_osrm_route = '//router.project-osrm.org/route/v1/driving/',
        icon_url = '/images/map/map_user.png',
        vectorSource = new ol.source.Vector(),
        vectorLayer = new ol.layer.Vector({
            source: vectorSource
        }),
        stylesRoute = {
            route: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: [167, 12, 155, 0.8]
                })
            }),
            icon: new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    src: icon_url
                })
            })
        };
    $scope.numLines = [{ Code: '', Name: "Tất cả" }, { Code: 1, Name: "1 Chiều" }, { Code: 2, Name: "2 Chiều" }];
    $scope.statuss = [{ Code: '', Name: "Tất cả" }, { Code: 1, Name: "Cấm đường" }, { Code: 2, Name: "Hoạt động" }];

    /*Hàm trả về style để ẩn feature map */
    encodeStyle = function (styles) {
        let ret = "";

        const styleparse_types = { "all": "0", "administrative": "1", "administrative.country": "17", "administrative.land_parcel": "21", "administrative.locality": "19", "administrative.neighborhood": "20", "administrative.province": "18", "landscape": "5", "landscape.man_made": "81", "landscape.natural": "82", "poi": "2", "poi.attraction": "37", "poi.business": "33", "poi.government": "34", "poi.medical": "36", "poi.park": "40", "poi.place_of_worship": "38", "poi.school": "35", "poi.sports_complex": "39", "road": "3", "road.arterial": "50", "road.highway": "49", "road.local": "51", "transit": "4", "transit.line": "65", "transit.station": "66", "water": "6" };

        const styleparse_elements = { "all": "a", "geometry": "g", "geometry.fill": "g.f", "geometry.stroke": "g.s", "labels": "l", "labels.icon": "l.i", "labels.text": "l.t", "labels.text.fill": "l.t.f", "labels.text.stroke": "l.t.s" };

        const styleparse_stylers = { "color": "p.c", "gamma": "p.g", "hue": "p.h", "invert_lightness": "p.il", "lightness": "p.l", "saturation": "p.s", "visibility": "p.v", "weight": "p.w" };

        styles.forEach((style) => {
            if (style.featureType) ret += "s.t:" + styleparse_types[style.featureType] + "|";

            // if !styleparse_elements[style.elementType], the style element is unknown
            if (style.elementType) ret += "s.e:" + styleparse_elements[style.elementType] + "|";

            style.stylers.forEach((styler) => {
                let keys = [];
                for (var k in styler) {
                    if (k === "color" && styler[k].length === 7) styler[k] = "#ff" + styler[k].slice(1);
                    ret += styleparse_stylers[k] + ":" + styler[k] + "|";
                }
            });

            ret = ret.slice(0, ret.length - 1);
            ret += ","
        });

        return encodeURIComponent(ret.slice(0, ret.length - 1));
    };
    //layer hide fure 
    styles = [
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        }
    ];
    const apistyles = encodeStyle(styles);
    var googleLayer = new ol.source.XYZ({
        url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=' + apistyles,
    })
    var config = {
        init: function () {
            config.loadMap();
            config.setHeightMap();
            config.mapClick();
            config.zoomMap();
            config.searchMap();
        },
        /**Load bản đồ */
        loadMap: function () {
            carLayerMarker = new ol.layer.Vector({
                source: carSourceVector
            });
            carLayerMarker.setZIndex(2);
            LayerMap = new ol.layer.Tile({
                source: googleLayer
            });
            map = new ol.Map({
                target: $('#map')[0],
                layers: [
                    LayerMap,
                    carLayerMarker,
                    routeSourceVector,
                    routeCarSourceVector,
                    vectorLayer
                ],
                view: new ol.View({
                    center: ol.proj.transform([105.53073053045564, 20.812571517857524], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 8
                }),
                controls: ol.control.defaults({
                    attribution: false,
                    zoom: false,
                })
            });
            drawMarkerExistRm();
            //GetDataInOut();
        },
        setHeightMap: function () {
            var maxHeightMap = $(window).height() - $("#map").position().top - 40;
            $("#map").css({
                'height': maxHeightMap,
                'max-height': maxHeightMap,
                'overflow': 'auto',
            });
            config.mapReSize();
        },
        radians: function (n) {
            return n * (Math.PI / 180);
        },
        degrees: function (n) {
            return n * (180 / Math.PI);
        },
        mapClick: function () {
            map.on('click', function (evt) {
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature) {
                        return feature;
                    });
                if (feature) {
                    var type = feature.get("type");
                    if (type == "STAFF") {
                        //routeCarSourceVector.setVisible(false);
                        var name = feature.get("name");
                        var phone = feature.get("phone");
                        var email = feature.get("email");
                        var empCode = feature.get("empCode");
                        var roles = feature.get("roles");
                        var checkIn = feature.get("checkIn");
                        var timeIn = feature.get("time");
                        var checkOut = feature.get("checkOut");
                        var coordinates = feature.getGeometry().getCoordinates();

                        var latStaff = feature.get("lat");
                        var lngStaff = feature.get("lng");

                        var html = '<div id="content">' +
                            '<div id="siteNotice">' +
                            '</div>' +
                            '<h2 id="firstHeading" class="firstHeading"><b><u>Thông tin nhân viên</u></b></h2>' +
                            '<div id="bodyContent">' +
                            '<b>Mã nhân sự : </b>' + empCode + '<br>' +
                            '<b>Họ và tên : </b>' + '<span class="text-danger bold">' + name + ' (' + phone + ')</span>' + '<br>' +
                            '<b>Vai trò : </b>' + roles + '<br>' +
                            '<b>Vào : </b>' + timeIn + '<br>' +
                            '</p>' +
                            '</div>' +
                            '</div>';
                        var popup = new ol.Overlay.Popup;
                        map.addOverlay(popup);
                        popup.show(coordinates, html);

                        map.setView(new ol.View({
                            center: ol.proj.transform([lngStaff, latStaff], 'EPSG:4326', 'EPSG:3857'),
                            zoom: 11
                        }));
                        map.getView().setZoom(14);
                    }
                    else if (type == "PointInOut") {
                        var name = feature.get("uName");
                        var time = feature.get("time");
                        var action = feature.get("action");
                        var address = feature.get("address");
                        var coordinates = feature.getGeometry().getCoordinates();
                        var html = '<div id="content">' +
                            '<div id="siteNotice">' +
                            '</div>' +
                            '<h2 id="firstHeading" class="firstHeading"><b><u>Thông điểm check in/out</u></b></h2>' +
                            '<div id="bodyContent">' +
                            '<b>Nhân viên : </b>' + name + '<br>' +
                            '<b>Hành động : </b>' + action + '<br>' +
                            '<b>Thời gian : </b>' + time + '<br>' +
                            '<b>Địa điểm : </b>' + address + '<br>' +
                            '</p>' +
                            '</div>' +
                            '</div>';
                        var popup = new ol.Overlay.Popup;
                        map.addOverlay(popup);
                        popup.show(coordinates, html);
                    }
                }
            });
        },
        //set map resize
        mapReSize: function () {
            setTimeout(function () {
                map.updateSize();
            }, 600);
        },
        // sự kiện zoom map
        zoomMap: function () {

            var zzoom = 13;
            map.on('moveend', (function () {
                var zoom = map.getView().getZoom();
                if (idCar.length > 0) {
                    if (zoom > zzoom) {
                        var so = Math.abs(zoom - zzoom);
                        x = 10 + (2 * so);
                        y = 20 + (4 * so);

                        for (var i = 0; i < idCar.length; i++) {
                            var feature1 = carSourceVector.getFeatureById(idCar[i]);
                            var bear = feature1.get("bear");
                            var licensePlate = feature1.get("licensePlate");
                            var styleFunction = new ol.style.Style({
                                image: new ol.style.Icon(({
                                    anchor: [0.5, 0.5],
                                    size: [x, y],
                                    opacity: 6,
                                    scale: 0.7,
                                    rotation: bear,
                                    src: urlIcon
                                    //src: '/images/map/car.png'
                                })),
                                text: new ol.style.Text({
                                    text: licensePlate,
                                    fill: new ol.style.Fill({
                                        color: '#8B0000'
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: [141, 238, 238, 0.8],
                                        width: 10
                                    }),
                                    font: 'bold 11px "Helvetica Neue", Arial',
                                    textAlign: "bottom",
                                    offsetY: -18,
                                    offsetX: -38
                                }),
                            })
                            carSourceVector.getFeatureById(idCar[i]).setStyle(styleFunction);
                        }
                    } else {
                        var zoom = map.getView().getZoom();
                        var so2 = Math.abs(zoom - zzoom);
                        x = 10 - (2 * so2);
                        y = 20 - (4 * so2);

                        for (var i = 0; i < idCar.length; i++) {
                            var feature1 = carSourceVector.getFeatureById(idCar[i]);
                            var bear = feature1.get("bear");
                            var licensePlate = feature1.get("licensePlate");
                            var styleFunction = new ol.style.Style({
                                image: new ol.style.Icon(({
                                    anchor: [0.5, 0.5],
                                    size: [x, y],
                                    opacity: 6,
                                    scale: 0.7,
                                    rotation: bear,
                                    src: urlIcon
                                    //src: '/images/map/car.png'
                                })),
                                text: new ol.style.Text({
                                    text: licensePlate,
                                    fill: new ol.style.Fill({
                                        color: '#8B0000'
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: [141, 238, 238, 0.8],
                                        width: 10
                                    }),
                                    font: 'bold 11px "Helvetica Neue", Arial',
                                    textAlign: "bottom",
                                    offsetY: -18,
                                    offsetX: -38
                                }),
                            })
                            carSourceVector.getFeatureById(idCar[i]).setStyle(styleFunction);
                        }
                    }
                }

            }));
        },
        loadImage: function (src) {
            var image = new Image();
            image.src = src;
            return image;
        },
        getBearing: function (startLat, startLong, endLat, endLong) {
            startLat = config.radians(startLat);
            startLong = config.radians(startLong);
            endLat = config.radians(endLat);
            endLong = config.radians(endLong);
            var dLong = endLong - startLong;
            var dPhi = Math.log(Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0));
            if (Math.abs(dLong) > Math.PI) {
                if (dLong > 0.0)
                    dLong = -(2.0 * Math.PI - dLong);
                else
                    dLong = (2.0 * Math.PI + dLong);
            }
            return (config.degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
        },
        searchMap: function () {
            $('#TimKiem').click(function () {
                var place = autocomplete.getPlace();

                var a = bounds.extend(place.geometry.location);
                var lat = place.geometry.location.lat();
                var lng = place.geometry.location.lng();
                var point = new ol.geom.Point(ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'));
                map.setView(new ol.View({
                    center: ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 11
                }));
                map.getView().setZoom(15);
            });
            $scope.searchStaff = function (gps) {
                var gpsTemp = gps.split(",");
                var latStr = gpsTemp[0].replace("[", "");
                var lngStr = gpsTemp[1].replace("]", "");
                var latStaff = parseFloat(latStr);
                var lngStaff = parseFloat(lngStr);
                map.setView(new ol.View({
                    center: ol.proj.transform([lngStaff, latStaff], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 11
                }));
                map.getView().setZoom(16);
                $scope.initData();
            };
        },
    }
    //ham vẽ trên map ol
    drawMarkerExistRm = function () {
        try {
            
            var urlIcon = "";
            var searchData = { FromDate: $scope.model.FromDate, ToDate: $scope.model.ToDate, UserName: $scope.model.UserName }
            dataservice.getStaffKeeping(searchData, function (rs) {
                rs = rs.data;
                $scope.listStaffOnline = rs.ListIn;
                
                carSourceVector.clear();
                for (var i = 0; i < rs.ListIn.length; i++) {
                    if (rs.ListIn[i].Gender == 0) {
                        if (rs.ListIn[i].Action == "IN") {
                            urlIcon = "/images/map/female.png";
                        }
                        else {
                            urlIcon = "/images/map/female_offline.png";
                        }
                        
                    } else if (rs.ListIn[i].Gender == 1) {
                        if (rs.ListIn[i].Action == "IN") {
                            urlIcon = "/images/map/male.png";
                        } else {
                            urlIcon = "/images/map/male_offline.png";
                        }
                    } else {
                        urlIcon = "/images/map/pinmap_red.png";
                    }
                    var phone = rs.ListIn[i].PhoneNumber != null ? "(" + rs.ListIn[i].PhoneNumber + ")" : "";
                    var id = rs.ListIn[i].Id;
                    var gps = rs.ListIn[i].LocationGPS;
                    if (gps != null && gps != "" && gps != undefined && gps != "[0,0]") {
                        var gpsTemp = gps.split(",");
                        var latStr = gpsTemp[0].replace("[", "");
                        var lngStr = gpsTemp[1].replace("]", "");
                        var latStaff = parseFloat(latStr);
                        var lngStaff = parseFloat(lngStr);
                        if (carSourceVector.getFeatureById(id) == null /*&& rs.ListIn[i].TimeOut == ""*/) {
                            var styleFunction = new ol.style.Style({
                                image: new ol.style.Icon(({
                                    anchor: [0.5, 0.5],
                                    size: [33, 33],
                                    opacity: 6,
                                    scale: 1,
                                    src: urlIcon
                                })),
                                text: new ol.style.Text({
                                    text: rs.ListIn[i].GivenName + phone,
                                    fill: new ol.style.Fill({
                                        color: '#000000'
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: [156, 203, 227, 0.8],
                                        width: 10
                                    }),
                                    font: 'bold 12px "Helvetica Neue", Arial',
                                    textAlign: "top",
                                    offsetY: 23,
                                    offsetX: -60
                                }),
                            })
                            var lonlat3857 = new ol.geom.Point(ol.proj.transform([lngStaff, latStaff], 'EPSG:4326',
                                'EPSG:3857'));
                            var iconFeature = new ol.Feature({
                                geometry: lonlat3857,
                                name: "",
                                population: 4000,
                                rainfall: 500,
                                style: styleFunction
                            });
                            var roles = "";
                            for (var k = 0; k < rs.ListIn[i].ListRoleGroup.length; k++) {
                                roles = roles + ", " + rs.ListIn[i].ListRoleGroup[k].RoleName;
                            }
                            iconFeature.setId(id);
                            iconFeature.set("phone", rs.ListIn[i].PhoneNumber != null ? rs.ListIn[i].PhoneNumber : "Chưa có")
                            iconFeature.set("name", rs.ListIn[i].GivenName)
                            iconFeature.set("empCode", rs.ListIn[i].EmployCode)
                            iconFeature.set("email", rs.ListIn[i].Email)
                            iconFeature.set("time", rs.ListIn[i].TimeIn)
                            iconFeature.set("lat", latStaff)
                            iconFeature.set("lng", lngStaff)
                            iconFeature.set("roles", roles)
                            iconFeature.set("type", "STAFF")
                            iconFeature.set("isShow", false);
                            var popup = new ol.Overlay.Popup;
                            iconFeature.set("popup", popup);
                            iconFeature.setStyle(styleFunction);
                            carSourceVector.addFeature(iconFeature);
                        }
                    }
                }
            })
        }
        catch (ex) {

        }
    };
    $scope.isSearch = false;
    $scope.showSearch = function () {
        if (!$scope.isSearch) {
            $scope.isSearch = true;
        } else {
            $scope.isSearch = false;
        }
    }
    $scope.loadImage = function () {
        var fileuploader = angular.element("#file");
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
    $scope.points = [];
    function GetDataInOut() {
        var searchData = { FromDate: $scope.model.FromDate, ToDate: $scope.model.ToDate, UserName: $scope.model.UserName }
        dataservice.getRouteInOut(searchData ,function (rs) {
            rs = rs.data;
            for (var i = 0; i < rs.length; i++) {
                var routeInOut = rs[i].RouteInOuts;
                for (var k = 0; k < routeInOut.length; k++) {
                    var arrayLatLng = [];
                    var gps = routeInOut[k].LatLng;
                    if (gps != null && gps != "" && gps != undefined && gps != "[0,0]") {
                        var gpsTemp = gps.split(",");
                        var latStr = gpsTemp[0].replace("[", "");
                        var lngStr = gpsTemp[1].replace("]", "");
                        var lat = parseFloat(latStr);
                        var lng = parseFloat(lngStr);
                        arrayLatLng.push(lng);
                        arrayLatLng.push(lat);
                        DrawPoint(lat, lng, routeInOut[k].Time, routeInOut[k].Address, routeInOut[k].Action, rs[i].UserName, k);
                        DrawRoute(arrayLatLng);
                    }
                }
                points = []
            }
        })
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

    function DrawRoute(coord_street) {
        var last_point = points[points.length - 1];
        var points_length = points.push(coord_street);
        utils.createFeature(coord_street);
        if (points_length < 2) {
            return;
        }
        //get the route
        var point1 = last_point.join();
        var point2 = coord_street.join();
        utils.getNearest(coord_street).then(function (coord_street) {
            fetch(url_osrm_route + point1 + ';' + point2).then(function (r) {
                return r.json();
            }).then(function (json) {
                if (json.code !== 'Ok') {
                    return;
                }
                utils.createRoute(json.routes[0].geometry);
            });
        });
    }
    function DrawPoint(lat, lng, time, address, action, uName, id) {
        var urlIcon = "";
        if (action == "In") {
            urlIcon = "/images/map/map_user.png";
        } else if (action == "Out") {
            urlIcon = "/images/map/map_user.png";
        }
        var styleFunction = new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 0.5],
                imgSize: [30, 30],
                opacity: 6,
                scale: 0.09,
                src: urlIcon
            })),
            text: new ol.style.Text({
                text: "",
                fill: new ol.style.Fill({
                    color: '#000000'
                }),
                stroke: new ol.style.Stroke({
                    color: [156, 203, 227, 0.8],
                    width: 10
                }),
                font: 'bold 12px "Helvetica Neue", Arial',
                textAlign: "bottom",
                offsetY: -18,
                offsetX: -38
            }),
        })
        var lonlat3857 = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));
        var iconFeature = new ol.Feature({
            geometry: lonlat3857,
            name: "",
            population: 4000,
            rainfall: 500,
            style: styleFunction
        });
        iconFeature.set("uName", uName)
        iconFeature.set("time", time)
        iconFeature.set("action", action)
        iconFeature.set("address", address)
        iconFeature.set("type", "PointInOut")
        var popup = new ol.Overlay.Popup;
        iconFeature.set("popup", popup);
        iconFeature.setStyle(styleFunction);
        routeCarSources.addFeature(iconFeature);
    }
    $scope.search = function () {
        routeCarSources.clear();
        vectorSource.clear();
        //var searchData = { FromDate: $scope.model.FromDate, ToDate: $scope.model.ToDate, UserName: $scope.model.UserName }
        //dataservice.getRouteInOut(searchData, function (rs) {
        //    rs = rs.data;
        //    for (var i = 0; i < rs.length; i++) {
        //        var routeInOut = rs[i].RouteInOuts;
        //        for (var k = 0; k < routeInOut.length; k++) {
        //            var arrayLatLng = [];
        //            var gps = routeInOut[k].LatLng;
        //            if (gps != null && gps != "" && gps != undefined && gps != "[0,0]") {
        //                var gpsTemp = gps.split(",");
        //                var latStr = gpsTemp[0].replace("[", "");
        //                var lngStr = gpsTemp[1].replace("]", "");
        //                var lat = parseFloat(latStr);
        //                var lng = parseFloat(lngStr);
        //                arrayLatLng.push(lng);
        //                arrayLatLng.push(lat);
        //                DrawRoute(arrayLatLng);
        //            }
        //        }
        //        points = []
        //    }
            
        //})
        //drawTimeOutPoint();
        drawMarkerExistRm();
    }
    var index = 0;
    function drawTimeOutPoint() {
        var searchData = { FromDate: $scope.model.FromDate, ToDate: $scope.model.ToDate, UserName: $scope.model.UserName }
        dataservice.getRouteInOut(searchData, function (rs) {
            rs = rs.data;
            var routeInOut = rs[0].RouteInOuts;
            setTimeout(function () {
                routeCarSources.clear();
                var gps = routeInOut[index].LatLng;
                if (gps != null && gps != "" && gps != undefined && gps != "[0,0]") {
                    var gpsTemp = gps.split(",");
                    var latStr = gpsTemp[0].replace("[", "");
                    var lngStr = gpsTemp[1].replace("]", "");
                    var lat = parseFloat(latStr);
                    var lng = parseFloat(lngStr);
                    DrawPoint(lat, lng, routeInOut[index].Time, routeInOut[index].Address, routeInOut[index].Action, rs[0].UserName, index);
                }
                
                index++;
                if (index < routeInOut.length) {
                    drawTimeOutPoint();
                } else {
                    index = 0;
                }
            }, 2000);
        })
    }

    var utils = {
        getNearest: function (coord) {
            //var coord4326 = utils.to4326(coord);
            return new Promise(function (resolve, reject) {
                //make sure the coord is on street
                fetch(url_osrm_nearest + coord.join()).then(function (response) {
                    // Convert to JSON
                    return response.json();
                }).then(function (json) {
                    if (json.code === 'Ok') resolve(json.waypoints[0].location);
                    else reject();
                });
            });
        },
        createFeature: function (coord) {
            var feature = new ol.Feature({
                type: 'place',
                geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
            });
            //feature.setStyle(stylesRoute.icon);
            vectorSource.addFeature(feature);
        },
        createRoute: function (polyline) {
            // route is ol.geom.LineString
            var route = new ol.format.Polyline({
                factor: 1e5
            }).readGeometry(polyline, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            var feature = new ol.Feature({
                type: 'route',
                geometry: route
            });
            feature.setStyle(stylesRoute.route);
            vectorSource.addFeature(feature);
        },
        to4326: function (coord) {
            return ol.proj.transform([
                parseFloat(coord[0]), parseFloat(coord[1])
            ], 'EPSG:3857', 'EPSG:4326');
        }
    };
    function loadDate() {
        $("#FromDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            dateFormat: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#ToDate').datepicker('setStartDate', maxDate);
        });
        $("#ToDate").datepicker({
            inline: false,
            autoclose: true,
            format: "dd/mm/yyyy",
            fontAwesome: true,
        }).on('changeDate', function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $('#FromDate').datepicker('setEndDate', maxDate);
        });
    }
    //Hide leftMenu
    setTimeout(function () {
        loadDate();
        config.init();
    }, 200);
});
