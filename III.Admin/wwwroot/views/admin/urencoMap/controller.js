var ctxfolder = "/views/admin/urencoMap";
//var webSyncHandleUrl = 'https://websync.s-work.vn/websync.ashx';
var webSyncHandleUrl = 'https://websync.3i.com.vn/websync.ashx';
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
    features: [
    ]
});
var routeSourceVector = new ol.layer.Vector({
    source: routeSources,
    updateWhileAnimating: true
});

//Show or hide route when click on car
var routeCarSources = new ol.source.Vector({
    features: [
    ]
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
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngCookies", "ngValidate", "datatables", "datatables.bootstrap", "ngJsTree", "treeGrid", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', 'ui.select', 'ngSanitize', "ngCookies", "pascalprecht.translate", 'monospaced.qrcode']);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose",
    }
    return {
        getAllData: function (data, callback) {
            $http.get('/Admin/Map/GetAll?objType=' + data).then(callback);
        },
        getRoute: function (callback) {
            $http.get('/Admin/UrencoMap/GetRoute').then(callback);
        },
        getRouteId: function (data, callback) {
            $http.get('/Admin/UrencoMap/GetRouteId?Id=' + data).then(callback);
        },
        getPark: function (callback) {
            $http.post('/Admin/UrencoMap/GetPark').then(callback);
        },
        getListRoute: function (callback) {
            $http.post('/Admin/GarbagePoint/GetListRoute/').then(callback);
        },
        getListUnit: function (callback) {
            $http.post('/Admin/GarbagePoint/GetListUnit/').then(callback);
        },
        getEmployee: function (callback) {
            $http.post('/Admin/Route/GetEmployee').then(callback);
        },
        GetDetailRoute: function (data, callback) {
            $http.post('/Admin/urencoMap/GetDetailRoute?RouteCode=' + data).then(callback);
        },
        insert: function (data, callback) {
            $http.post('/Admin/GarbagePoint/Insert/', data).then(callback);
        },
        getListStatus: function (callback) {
            $http.post('/Admin/GarbagePoint/GetListStatus/').then(callback);
        },
        getListVehicle: function (callback) {
            $http.post('/Admin/UrencoMap/GetListVehicle').then(callback);
        },
        update: function (data, callback) {
            $http.post('/Admin/UrencoMap/UpdateNote', data).then(callback);
        },
        ChangeStatusCar: function (data, callback) {
            $http.post('/Admin/TrashCar/ChangeStatusCar?' + data).then(callback);
        },
        getStatus: function (callback) {
            $http.post('/Admin/Route/GetStatus').then(callback);
        },
        getEmployee: function (callback) {
            $http.post('/Admin/Route/GetEmployee').then(callback);
        },
        getUrencoData: function (callback) {
            $http.get('/Admin/UrencoMap/GetUrencoData').then(callback);
        },
        getGroupVehicle: function (data, callback) {
            $http.get('/Admin/UrencoMap/GetGroupVehicle?vehicelPalate=' + data).then(callback);
        },
        insertCommandTracking: function (data, callback) {
            $http.post('/Admin/UrencoMap/InsertCommandTracking', data).then(callback);
        },
        getDataTracking: function (data, callback) {
            $http.post('/Admin/UrencoMap/GetDataTracking?vehiclePlate=' + data).then(callback);
        },
        insertCar: function (data, callback) {
            $http.post('/Admin/TrashCar/Insert', data).then(callback);
        },
        getStatusVehicle: function (callback) {
            $http.post('/Admin/UrencoMap/GetStatusVehicle').then(callback);
        },
        getParkInRoute: function (data, callback) {
            $http.post('/Admin/UrencoMap/GetParkInRoute?routeCode=' + data).then(callback);
        },
        getUrencoRoute: function (callback) {
            $http.post('/Admin/UrencoMap/GetUrencoRoute').then(callback);
        },
        loadMenuVehicle: function (callback) {
            $http.post('/Admin/UrencoMap/LoadMenuVehicle').then(callback);
        },
        getListPark: function (callback) {
            $http.post('/Admin/UrencoMap/GetListPark').then(callback);
        },
        getRouteOfNode: function (data, callback) {
            $http.post('/Admin/UrencoMap/GetRouteOfNode?nodeCode=' + data).then(callback);
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
    $translateProvider.useUrlLoader('/Admin/Language/Translation');
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
    var cars = {};
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
    var popup = new ol.Overlay.Popup;
    var popupPark = new ol.Overlay.Popup;
    var config = {
        init: function () {
            config.loadMap();
            config.setHeightMap();
            config.mapClick();
            config.zoomMap();
            config.loadDataPark();
        },
        /**Load bản đồ */
        loadMap: function () {
            //Vector data that is rendered client-side
            carLayerMarker = new ol.layer.Vector({
                source: carSourceVector
            });

            carLayerMarkerStatus = new ol.layer.Vector({
                source: carSourceVectorStatus
            });
            carLayerMarkerBranchAndType = new ol.layer.Vector({
                source: carSourceVectorTypeAndBranch
            });
            //Đặt chỉ mục cho carLayerMarker là 2 trước khi rendering
            carLayerMarker.setZIndex(2);
            //For layer sources that provide pre-rendered, tiled images in grids that are organized by zoom levels for specific resolutions.
            LayerMap = new ol.layer.Tile({
                source: googleLayer
            });

            //Khởi tạo Map
            map = new ol.Map({
                target: $('#map')[0],
                layers: [
                    LayerMap,
                    carLayerMarker,
                    carLayerMarkerStatus,
                    carLayerMarkerBranchAndType,
                    routeSourceVector,
                    routeCarSourceVector,
                    parkSourceVector,
                    parkCenterLayer,
                    routeDrawLayer,
                    parkDrawLayer,
                    drawLV
                ],
                view: new ol.View({
                    center: ol.proj.transform([105.805069, 20.991153], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 15
                }),
                controls: ol.control.defaults({
                    attribution: false,
                    zoom: false,
                })
            });
            //hide car   
            var checkCar = false;
            document.getElementById('car-Urenco').addEventListener('click', function () {
                if (checkCar == false) {
                    carLayerMarker.setVisible(false);
                    checkCar = true;
                }
                else {

                    carLayerMarker.setVisible(true);
                    checkCar = false;
                }
            });
            // hide park park-Urenco
            var checkPark = false;
            document.getElementById('park-Urenco').addEventListener('click', function () {
                if (checkPark == false) {
                    parkSourceVector.setVisible(false);
                    parkCenterLayer.setVisible(false);
                    checkPark = true;
                }
                else {

                    parkSourceVector.setVisible(true);
                    parkCenterLayer.setVisible(true);
                    checkPark = false;
                }

            });
            //hide route
            var checkRoute = false;
            document.getElementById('route-Urenco').addEventListener('click', function () {
                if (checkRoute == false) {
                    routeSourceVector.setVisible(false);
                    checkRoute = true;
                }
                else {

                    routeSourceVector.setVisible(true);
                    checkRoute = false;
                }

            });
            //đổi icon
            var i = 0;
            document.getElementById('Change-Icon').addEventListener('click', function () {
                var url = [
                    '/images/map/xe_01.png',
                    '/images/map/xe_02.png',
                    '/images/map/xe_03.png',
                    '/images/map/xe_04.png',
                    '/images/map/xe_05.png',
                    '/images/map/17.png',
                    '/images/map/22.png',
                    '/images/map/xe_08.png',
                    '/images/map/xe_09.png',
                    '/images/map/xe_10.png',
                    '/images/map/xe_11.png',
                    '/images/map/xe_12.png',
                    '/images/map/xe_13.png',
                    '/images/map/xe_14.png',
                    '/images/map/xe_15.png',
                    '/images/map/xe_16.png',
                    '/images/map/xe_17.png',
                    '/images/map/xe_18.png',
                    '/images/map/xe_19.png',
                    '/images/map/xe_20.png',
                    '/images/map/xe_21.png',
                    '/images/map/xe_22.png',
                    '/images/map/xe_23.png',
                    '/images/map/xe_24.png',
                    '/images/map/xe_25.png',
                    '/images/map/27.png',
                    '/images/map/23.png',
                    '/images/map/24.png',
                    '/images/map/25.png',
                    '/images/map/26.png',
                    '/images/map/28.png',
                ];
                i = i + 1;
                urlIcon = url[i]
            });
            //hide and show icon 
            document.getElementById("hide-poi").checked = true;
            document.getElementById("show-poi").checked = false;
            document.getElementById('hide-poi').addEventListener('click', function () {
                LayerMap.setSource(googleLayer);
                document.getElementById("show-poi").checked = false;
            });
            document.getElementById('show-poi').addEventListener('click', function () {
                LayerMap.setSource(layerGoogle);
                document.getElementById("hide-poi").checked = false;
            });
            //chuyeenr map
            document.getElementById('show-OSM').addEventListener('click', function osm() {
                LayerMap.setSource(OSM);
                document.getElementById("show-gg").checked = false;
            });
            document.getElementById('show-gg').addEventListener('click', function googleMap() {
                LayerMap.setSource(googleLayer);
                document.getElementById("show-OSM").checked = false;
                document.getElementById("hide-poi").checked = true;
                document.getElementById("show-poi").checked = false;
            });
        },
        /**Load dữ liệu tuyến đường */
        loadDataRoute: function () {
            dataservice.getRoute(function (result) {result=result.data;
                console.log(result);
                for (var i = 0; i < result.length; i++) {
                    var array = [];
                    var data = JSON.parse(result[i].RouteDataGps);
                    for (var j = 0; j < data.gis_data.length; j++) {
                        var a = ol.proj.transform([data.gis_data[j].lng, data.gis_data[j].lat], 'EPSG:4326', 'EPSG:3857');
                        array.push(a)
                    }
                    var lineString = new ol.geom.LineString([]);
                    lineString.setCoordinates(array);
                    var styleLine = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            width: 1.5, color: '#25B128'
                        }),
                        text: new ol.style.Text({
                            text: result[i].RouteName,
                            fill: new ol.style.Fill({
                                color: '#000000'
                            }),
                            stroke: new ol.style.Stroke({
                                color: [156, 203, 227, 0.8],
                                width: 5
                            }),
                            font: 'bold 12px "Helvetica Neue", Arial',
                            backgroundFill: new ol.style.Fill({
                                color: '#D3D3D3',
                            }),
                            textAlign: "bottom",
                            offsetY: -18,
                            offsetX: -38
                        }),
                        zIndex: 2
                    })
                    var aaaa = new ol.Feature({
                        geometry: lineString,
                        name: result[i].RouteName
                    });
                    aaaa.setStyle(styleLine);
                    aaaa.setId(result[i].Id);
                    aaaa.set("idRoute", result[i].Id);
                    aaaa.set("nameRoute", result[i].RouteName);
                    routeSources.addFeature(aaaa);
                }
            });
        },
        /**Load dữ liệu bãi rác */
        loadDataPark: function () {
            dataservice.getPark(function (result) {result=result.data;
                parkCenterSourceVector.clear();
                parkSources.clear();
                for (var i = 0; i < result.length; i++) {
                    var color = '';
                    var img = '';
                    var view = result[i].Volume / result[i].VolumeLimit * 100;
                    if (50 > view) {
                        color = '#00FFFF';
                        img = '/images/map/cau_rac_70.png';
                    }
                    else if (90 > view) {
                        color = '#F9B900';
                        img = '/images/map/cau_rac_70.png';
                    }
                    else {
                        color = '#D20000';
                        img = '/images/map/cau_rac_70.png';
                    }
                    //vẽ polygon
                    var array = [];
                    var data = JSON.parse(result[i].GpsNode);
                    array = data.gis_data;
                    var parkPolygon = new ol.geom.Polygon([]);
                    parkPolygon.setCoordinates(array);
                    var styleLine = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            width: 0.1, color: color
                        }),
                        fill: new ol.style.Fill({
                            color: color
                        }),
                        zIndex: 2
                    })
                    var aaaa = new ol.Feature({
                        geometry: parkPolygon,
                        name: result[i].NodeName
                    });

                    aaaa.setStyle(styleLine);
                    aaaa.setId(result[i].NodeCode);
                    aaaa.set("idPark", result[i].NodeCode);
                    aaaa.set("namePark", result[i].NodeName);
                    aaaa.set("Volume", result[i].Volume);
                    aaaa.set("VolumeLimit", result[i].VolumeLimit);
                    aaaa.set("centerPoint", data.centerPoint);
                    aaaa.set("Unit", result[i].Unit);
                    aaaa.set("type", 'Bin');

                    parkSources.addFeature(aaaa);
                    //vẽ maker center
                    var styleFunction = new ol.style.Style({
                        image: new ol.style.Icon(({
                            anchor: [0.5, 0.5],
                            imgSize: [70, 70],
                            opacity: 6,
                            scale: 1,
                            src: img,
                        })),

                        //text: new ol.style.Text({
                        //    text: result[i].NodeName + "-" + result[i].Volume + result[i].Unit,
                        //    fill: new ol.style.Fill({
                        //        color: '#8B0000'
                        //    }),
                        //    stroke: new ol.style.Stroke({
                        //        color: [141, 238, 238, 0.8],
                        //        width: 10
                        //    }),
                        //    font: 'bold 11px "Helvetica Neue", Arial',
                        //    backgroundFill: new ol.style.Fill({
                        //        color: 'black',
                        //    }),
                        //    textAlign: "bottom",
                        //    offsetY: 15,
                        //    offsetX: -25
                        //})

                    })
                    var lonlat3857 = new ol.geom.Point(data.centerPoint);
                    var iconFeature = new ol.Feature({
                        geometry: lonlat3857,
                        style: styleFunction
                    });
                    iconFeature.setStyle(styleFunction);
                    //iconFeature.setId(result[i].Id);
                    iconFeature.setId(result[i].NodeCode);
                    iconFeature.set("namePark", result[i].NodeName);
                    iconFeature.set("Volume", result[i].Volume);
                    iconFeature.set("VolumeLimit", result[i].VolumeLimit);
                    iconFeature.set("centerPoint", data.centerPoint);
                    iconFeature.set("Unit", result[i].Unit);
                    iconFeature.set("type", 'Bin');
                    parkCenterSourceVector.addFeature(iconFeature);

                }
            });
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
        // sự kiện popup khi click marker
        mapClick: function () {
            map.on('click', function (evt) {
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature) {
                        return feature;
                    });
                if (feature) {
                    routeCarSourceVector.setVisible(false);
                    routeCarSources.clear();
                    var type = feature.get("type");
                    if (type == 'trashCar') {
                        var carCode = feature.get("carCode");
                        var driverName = feature.get("driverName");
                        var phone = feature.get("phone");
                        var routeName = feature.get("routeName");
                        var licensePlate = feature.get("licensePlate");
                        var speed = feature.get("speed");
                        var totalkm = feature.get("totalKm");
                        var direction = feature.get("direction");
                        var time = feature.get("time");
                        var coordinates = feature.getGeometry().getCoordinates();
                        var html = '<div id="content">' +
                            '<a href="#" id="popup-closer" class="ol-popup-closer"></a>' +
                            '<div id="siteNotice">' +
                            '</div>' +
                            '<h2 id="firstHeading" class="firstHeading"><b><u>Thông tin xe</u></b></h2>' +
                            '<div id="bodyContent">' +
                            '<b>Mã số riêng : </b>' + carCode + '<br>' +
                            '<b>Biển số xe : </b>' + licensePlate + '<br>' +
                            '<b>Giờ cập nhật : </b>' + time + '<br>' +
                            '<b>Vận tốc GPS : </b>' + speed + " km/h" + '<br>' +
                            '<b>Vận tốc cơ : </b>' + " km/h" + '<br>' +
                            '<b>Dừng đỗ : </b>' + " lần" + '<br>' +
                            '<b>Dừng xe nổ máy : </b>' + " lần" + '<br>' +
                            '<b>Km trong ngày : </b>' + totalkm + " km" + '<br>' +
                            '<b>Km trong tháng : </b>' + totalkm + " km" + '<br>' +
                            '<b>Cửa : </b>' + '<br>' +
                            '<b>Máy : </b>' + '<br>' +
                            '<b>Điều hòa : </b>' + '<br>' +
                            '<b>Địa chỉ : </b>' + routeName + '<br>' +
                            '<b>Lái xe : </b>' + driverName + '<br>' +
                            '<b>Số điện thoại : </b>' + phone + '<br>' +
                            '<b>Giấy phép lái xe : </b>' + '<br>' +
                            '<b>Quá tốc độ : </b>' + '<br>' +
                            '<b>TG LX liên tục : </b>' + "phút" + '<br>' +
                            '<b>TG LX trong ngày : </b>' + "phút" + '<br>' +
                            '<b>TT thẻ nhớ : </b>' + '<br>' +
                            '<b>Hướng đi : </b>' + direction + '<br>' +
                            '<b>Sở quản lý : </b>' + '<br>' +
                            '<b>Tình trạng : </b>' + 'Đang hoạt động' +
                            '</p>' +
                            '</div>' +
                            '</div>';
                        //var popup = new ol.Overlay.Popup;
                        map.addOverlay(popup);
                        popup.show(coordinates, html);
                        getRouteVehicle(licensePlate);
                        routeCarSourceVector.setVisible(true);
                        var closer = document.getElementById('popup-closer');
                        closer.onclick = function () {
                            popup.hide();
                            routeCarSourceVector.setVisible(false);
                            routeCarSources.clear();
                            return false;
                        };
                    }
                    else if (type == 'Bin') {
                        var namePark = feature.get("namePark");
                        var Volume = feature.get("Volume");
                        var VolumeLimit = feature.get("VolumeLimit");
                        var coordinates = feature.get("centerPoint");
                        var Unit = feature.get("Unit");
                        var html ='<div id="content">' +
                            '<div id="siteNotice">' +
                            '</div>' +
                            '<h2 id="firstHeading" class="firstHeading"><b><u>Thông tin điểm rác</u></b></h2>' +
                            '<div id="bodyContent">' +
                            '<p><b>Tên điểm rác : </b>' + namePark + '<br>' +
                            '<b>Dung lượng hiện tại : </b>' + Volume + '' + Unit + '<br>' +
                            '<b>Dung lượng tối đa : </b>' + VolumeLimit + '' + Unit + '<br>' +
                            '</p>' +
                            '</div>' +
                            '</div>';
                        //var popup = new ol.Overlay.Popup;
                        map.addOverlay(popupPark);
                        popupPark.show(coordinates, html);

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
        }
    }
    //code join websync
    fm.websync.client.enableMultiple = true;
    var client = new fm.websync.client(webSyncHandleUrl);
    //client.setDisableCORS(true);
    var currentRoom = "HN.VN";
    fm.util.addOnLoad(function () {
        var chatObject = {
            alias: 'Unknown',
            clientId: '0',
            channels: {
                main: '/chat'
            }
        }
        listDriver = [1000];
        util = {

            observe: fm.util.observe,
            stopEvent: function (event) {
                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
            },

            subcribe: function (channel) {

                client.subscribe({
                    channel: '/' + currentRoom,
                    onSuccess: function (args) {
                    },
                    onFailure: function (args) {
                    },
                    onReceive: function (args) {
                        var dataDriver = args.getData();
                        console.log("onReceive-----------");
                        console.log(dataDriver);
                        drawMarkerExistRm(dataDriver);
                    }
                });
            },

            unsubcribe: function (channel) {
                client.unsubscribe({
                    channel: '/' + channel,
                    onSuccess: function (args) {
                        // console.log("unsubcribe success: "+args.channel);
                        //	util.log('subcribe success to WebSync.')
                    },
                    onFailure: function (args) {
                        // console.log("subcribe failed: "+args.channel);
                    }

                });
            },
            disconnect: function () {
            }
        }
        mUtil = util;
        //allUserOrder = {};
        //allClientMap = {};
        //allClientArr = [];
        client.connect({
            onSuccess: function (args) {
                chatObject.clientId = args.clientId;
                console.log("coneect sucsecs : ");
            },
            onFailure: function (args) {

            }
        });
        util.subcribe();
    });
    //Ham ve tren Map gg
    drawMarkerExist = function (data) {

        if (data == null) {
        }
        else {
            var id = data.locationMessage.driverId;
            var name = data.locationMessage.driverName;
            if (cars[id] != undefined) {
                var lat = cars[id].getPosition().lat();
                var lng = cars[id].getPosition().lng();

                var bearing = config.getBearing(lat, lng, data.locationMessage.latitude, data.locationMessage.longitude)
                console.log(bearing);
                var icon = cars[id].getIcon();
                console.log(icon);
                icon.rotation = bearing;
                cars[id].setIcon(icon);
                var latlong = { "lat": data.locationMessage.latitude, "lng": data.locationMessage.longitude }
                cars[id].setPosition(latlong);

            }
            else {

                var contentString = '<div id="content">' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<h1 id="firstHeading" class="firstHeading"><b>Thông tin xe</b></h1>' +
                    '<div id="bodyContent">' +
                    '<p><b>Tên tài xế : </b>' + name + '<br>' +
                    '<b>Biển số xe : </b>' + '29B - 125.' + id + '<br>' +
                    '<b>Tình trạng : </b>' + 'Đang hoạt động' +
                    '</p>' +
                    '</div>' +
                    '</div>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                var latlong = { "lat": data.locationMessage.latitude, "lng": data.locationMessage.longitude };
                var LatLng = new google.maps.LatLng(data.locationMessage.latitude, data.locationMessage.longitude);
                var imgMaker = {
                    url: '/images/map/car.png',
                    labelOrigin: new google.maps.Point(18, -8),
                    rotation: 0
                }
                cars[id] = new google.maps.Marker({
                    position: latlong,
                    icon: imgMaker,
                    map: map,
                    draggable: false,
                    labelClass: "labels",
                    label: {
                        text: "29B-125." + id,
                        color: 'red',
                        fontSize: '12px',
                        fontWeight: '1000'
                    }
                });
                cars[id].addListener('click', function () {
                    infowindow.open(map, cars[id]);
                });
            }
        }
    };
    //ham vẽ trên map ol
    drawMarkerExistRm = function (data) {
        try {
            var urlIcon = "/images/map/carBA50.png";
            var id = data.locationMessage.VehiclePlate;
            $scope.model = {
                VehiclePlate: data.locationMessage.VehiclePlate,
                CarName: data.locationMessage.VehiclePlate,
                CarCode: data.locationMessage.VehiclePlate,
                LicensePlate: data.locationMessage.VehiclePlate,
                Latitude: data.locationMessage.Latitude,
                Longitude: data.locationMessage.Longitude,
                State: data.locationMessage.State,
                Speed: data.locationMessage.Speed
            }
            //dataservice.insertCar($scope.model, function (rs) {rs=rs.data;
            //    if (result.Error) {
            //        App.toastrError(result.Title);
            //    } else {
            //        App.toastrSuccess(result.Title);
            //    }
            //});
            dataservice.insertCommandTracking($scope.model, function (result) {result=result.data;
                //if (result.Error) {
                //    App.toastrError(result.Title);
                //} else {
                //    App.toastrSuccess(result.Title);
                //}
            })
            dataservice.getGroupVehicle(id, function (rs) {rs=rs.data;
                if (rs.Object != null) {
                    var fullName = rs.Object.FullName;
                    var phone = rs.Object.Phone;
                    var carCode = rs.Object.Code;
                    var branchCode = rs.Object.BranchCode;
                    var typeCar = rs.Object.Type;
                    if (typeCar == "T2.5") {
                        urlIcon = "/images/map/carBA50.png";
                    } else if (typeCar == "T0.5") {
                        urlIcon = "/images/map/tai_nho_BA.png";
                    } else if (typeCar == "CE") {
                        urlIcon = "/images/map/cuon_ep_BA.png";
                    } else if (typeCar == "CO") {
                        urlIcon = "/images/map/container_BA.png";
                    } else if (typeCar == "Hk") {
                        urlIcon = "/images/map/quet_hut_BA.png";
                    } else if (typeCar == "R") {
                        urlIcon = "/images/map/rua_duong_BA_1.png";
                    }

                    var book = {
                        location: [parseFloat(data.locationMessage.Latitude), parseFloat(data.locationMessage.Longitude)]
                    };
                    if (data != null) {
                        if (carSourceVector.getFeatureById(id) != null) {
                            if (data.type == "START") {
                                var feature1 = carSourceVector.getFeatureById(id);
                                var coord = feature1.getGeometry().getCoordinates();
                                coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
                                var lon = coord[0];
                                var lat = coord[1];
                                var bear = bearing(lat, lon, book.location[0], book.location[1]);
                                var styleFunction1 = new ol.style.Style({
                                    image: new ol.style.Icon(({
                                        anchor: [0.5, 0.5],
                                        imgSize: [50, 50],
                                        opacity: 6,
                                        scale: 1,
                                        rotation: bear,
                                        src: urlIcon
                                    })),
                                    text: new ol.style.Text({
                                        text: carCode,
                                        fill: new ol.style.Fill({
                                            color: '#000000'
                                        }),
                                        stroke: new ol.style.Stroke({
                                            //color: [141, 238, 238, 0.8],
                                            color: [156, 203, 227, 0.8],
                                            width: 10
                                        }),
                                        font: 'bold 12px "Helvetica Neue", Arial',
                                        backgroundFill: new ol.style.Fill({
                                            color: '#D3D3D3',
                                        }),
                                        textAlign: "bottom",
                                        offsetY: -18,
                                        offsetX: -38
                                    }),
                                })
                                var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                                    'EPSG:3857'));
                                var style = carSourceVector.getFeatureById(id).getStyle();
                                carSourceVector.getFeatureById(id).setGeometry(lonlat3857);
                                carSourceVector.getFeatureById(id).set("bear", bear);
                                carSourceVector.getFeatureById(id).setStyle(styleFunction1);
                            }
                            else {
                                carSourceVector.removeFeature(carSourceVector.getFeatureById(id));
                                for (var i = 0; i < idCar.length; i++) {
                                    if (idCar[i] === id) {
                                        idCar.splice(i, 1);
                                    }
                                }
                            }
                        }
                        else if (carSourceVector.getFeatureById(id) == null) {
                            if (data.type == "START") {
                                var styleFunction = new ol.style.Style({
                                    image: new ol.style.Icon(({
                                        anchor: [0.5, 0.5],
                                        size: [50, 50],
                                        opacity: 6,
                                        scale: 1,
                                        src: urlIcon
                                    })),
                                    text: new ol.style.Text({
                                        text: carCode,
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
                                //20.991897, 105.811989
                                var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                                    'EPSG:3857'));
                                var iconFeature = new ol.Feature({
                                    geometry: lonlat3857,
                                    name: "" /*+ "_" + data.location_message.channel*/,
                                    population: 4000,
                                    rainfall: 500,
                                    style: styleFunction
                                });

                                // 20191025084527
                                var year = data.locationMessage.LocalTime.substr(0, 4);
                                var month = data.locationMessage.LocalTime.substr(4, 2);
                                var date = data.locationMessage.LocalTime.substr(6, 2);
                                var hours = data.locationMessage.LocalTime.substr(8, 2);
                                var minute = data.locationMessage.LocalTime.substr(10, 2);
                                var seconds = data.locationMessage.LocalTime.substr(12, 2);

                                var time = date + "/" + month + "/" + year + " " + hours + ":" + minute + ":" + seconds;

                                iconFeature.setId(id);
                                iconFeature.set("branchCode", branchCode);
                                iconFeature.set("typeCar", typeCar);
                                iconFeature.set("idCar", id);
                                iconFeature.set("carCode", carCode);
                                iconFeature.set("type", 'trashCar');
                                iconFeature.set("driverName", fullName);
                                iconFeature.set("phone", phone);
                                iconFeature.set("licensePlate", data.locationMessage.VehiclePlate);
                                iconFeature.set("routeName", data.locationMessage.Address);
                                iconFeature.set("speed", data.locationMessage.Speed);
                                iconFeature.set("totalKm", data.locationMessage.TotalKm);
                                iconFeature.set("direction", data.locationMessage.Direction);
                                iconFeature.set("state", data.locationMessage.State);
                                iconFeature.set("time", time);
                                iconFeature.set("isShow", false);
                                var popup = new ol.Overlay.Popup;
                                iconFeature.set("popup", popup);
                                iconFeature.setStyle(styleFunction);
                                carSourceVector.addFeature(iconFeature);
                            }
                        }
                    }
                }

            })
        }
        catch (ex) {
            console.log(data);
        }
    };
    function getRouteVehicle(vehiclePlate) {
        dataservice.getDataTracking(vehiclePlate, function (result) {result=result.data;
            var data = JSON.parse(result);
            var array = [];
            for (var j = 0; j < data.length; j++) {
                var a = ol.proj.transform([data[j].Longitude, data[j].Latitude], 'EPSG:4326', 'EPSG:3857');
                array.push(a)
            }
            var lineString = new ol.geom.LineString([]);
            lineString.setCoordinates(array);
            var styleLine = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    width: 2, color: '#FF0000'
                }),
                text: new ol.style.Text({
                    //text: result[i].RouteName,
                    fill: new ol.style.Fill({
                        color: '#8B0000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: [141, 238, 238, 0.8],
                        width: 10
                    }),
                    font: 'bold 11px "Helvetica Neue", Arial',
                    backgroundFill: new ol.style.Fill({
                        color: 'black',
                    }),
                    textAlign: "bottom",
                    offsetY: -18,
                    offsetX: -38
                }),
                zIndex: 2
            })
            var routeCar = new ol.Feature({
                geometry: lineString,
                //name: result[i].RouteName
            });
            routeCar.setStyle(styleLine);
            //aaaa.setId(result[i].Id);
            //aaaa.set("idRoute", result[i].Id);
            //aaaa.set("nameRoute", result[i].RouteName);
            routeCarSources.addFeature(routeCar);
            //}
        });
    };
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
    //load QR code
    $scope.changeQrCode = function () {
        $scope.model.QrCode = $scope.model.NodeCode + "/" + $scope.model.NodeName + "/" + $scope.model.Address + "/" + $scope.model.VolumeLimit;
    }
    //Ham dong menu
    // setTimeout(function () {
    //     $.app.menu.expanded = true;
    //     $.app.menu.collapsed = false;
    //     $.app.menu.toggle();
    //     dataservice.getListRoute(function (rs) {rs=rs.data;
    //         $scope.listRoute = rs;
    //     });
    //     dataservice.getEmployee(function (rs) {rs=rs.data;
    //         $scope.managers = rs;
    //     });
    //     dataservice.getListUnit(function (rs) {rs=rs.data;
    //         $scope.listUnit = rs;
    //     });
    //     dataservice.getListStatus(function (rs) {rs=rs.data;
    //         $scope.listStatus = rs;
    //     });
    // }, 300);
    //Hide leftMenu
    // setTimeout(function () {
    //     $("#arrow-tab-urenco-hide").click(function () {
    //         $(".leftPanel").show(500);
    //         $(".leftPanel-hide").hide(500);

    //     });
    //     $("#arrow-tab-urenco").click(function () {
    //         $(".leftPanel").hide(500);
    //         $(".leftPanel-hide").show(500);
    //     });
    //     $("#arrow-menu-urenco-hide").click(function () {
    //         $(".rightPanel").show(500);
    //         $(".rightPanel-hide").hide(500);

    //     });
    //     $("#arrow-menu-urenco").click(function () {
    //         $(".rightPanel").hide(500);
    //         $(".rightPanel-hide").show(500);
    //     });
    // }, 100);
    setTimeout(function () {
        config.init();
    }, 200);
    setInterval(function () {
        config.loadDataPark();
    }, 60000)

});
app.controller('urencoVehicle', function ($scope, $rootScope, $compile, $uibModal, $location, dataservice, $filter, DTOptionsBuilder, DTColumnBuilder, DTInstances) {
    $scope.model = {
        car: '',

    };
    var config = {
        init: function () {
            dataservice.getListVehicle(function (rs) {rs=rs.data;
                $scope.listCar = rs;
            });
            dataservice.getStatusVehicle(function (rs) {rs=rs.data;
                $scope.listStatusVehicle = rs.Object;
                $scope.model.Status = $scope.listStatusVehicle[0].Condition
            });

            dataservice.loadMenuVehicle(function (rs) {rs=rs.data;
                $scope.menuVehicle = rs;
            })
        }
    }
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.treeDataunit = [];
    $scope.positionData = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UrencoMap/JTableVehicle",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.State = $scope.model.State;
                d.Type = $scope.model.Type;
                d.BranchCode = $scope.model.BranchCode;

            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    $scope.model.car = data.LicensePlate;
                    $scope.searchcar();
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('CarCode').withTitle('Biển số xe').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Speed').withTitle('V(km/h)').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Time').withTitle('Thời gian').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0  dataTable-10per'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};
    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
        //loadDataRoute();
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
    $scope.reload = function () {
        reloadData(true);

    }
    $rootScope.reloadRoute = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    /** Hàm tìm kiếm xe đang chạy */
    var popup = new ol.Overlay.Popup;
    $scope.searchcar = function () {
        if (popup.isOpened) {
            popup.hide();
        }

        var feature = carSourceVector.getFeatureById($scope.model.car);
        if (feature != null) {
            var carCode = feature.get("carCode");
            var driverName = feature.get("driverName");
            var routeName = feature.get("routeName");
            var phone = feature.get("phone");
            var licensePlate = feature.get("licensePlate");
            var speed = feature.get("speed");
            var totalkm = feature.get("totalKm");
            var direction = feature.get("direction");
            var time = feature.get("time");
            var coordinates = feature.getGeometry().getCoordinates();

            //iconFeature.set("speed", data.locationMessage.Speed);
            //iconFeature.set("totalKm", data.locationMessage.TotalKm);
            //iconFeature.set("direction", data.locationMessage.Direction);
            //iconFeature.set("time", data.locationMessage.time); 

            var html = '<div id="content">' +
                '<a href="#" id="popup-closer" class="ol-popup-closer"></a>' +
                '<div id="siteNotice">' +
                '</div>' +
                '<h2 id="firstHeading" class="firstHeading"><b><u>Thông tin xe</u></b></h2>' +
                '<div id="bodyContent">' +
                '<b>Mã số riêng : </b>' + carCode + '<br>' +
                '<b>Biển số xe : </b>' + licensePlate + '<br>' +
                '<b>Giờ cập nhật : </b>' + time + '<br>' +
                '<b>Vận tốc GPS : </b>' + speed + " km/h" + '<br>' +
                '<b>Vận tốc cơ : </b>' + " km/h" + '<br>' +
                '<b>Dừng đỗ : </b>' + " lần" + '<br>' +
                '<b>Dừng xe nổ máy : </b>' + " lần" + '<br>' +
                '<b>Km trong ngày : </b>' + totalkm + " km" + '<br>' +
                '<b>Km trong tháng : </b>' + totalkm + " km" + '<br>' +
                '<b>Cửa : </b>' + '<br>' +
                '<b>Máy : </b>' + '<br>' +
                '<b>Điều hòa : </b>' + '<br>' +
                '<b>Địa chỉ : </b>' + routeName + '<br>' +
                '<b>Lái xe : </b>' + driverName + '<br>' +
                '<b>Số điện thoại : </b>' + phone + '<br>' +
                '<b>Giấy phép lái xe : </b>' + '<br>' +
                '<b>Quá tốc độ : </b>' + '<br>' +
                '<b>TG LX liên tục : </b>' + "phút" + '<br>' +
                '<b>TG LX trong ngày : </b>' + "phút" + '<br>' +
                '<b>TT thẻ nhớ : </b>' + '<br>' +
                '<b>Hướng đi : </b>' + direction + '<br>' +
                '<b>Sở quản lý : </b>' + '<br>' +
                '<b>Tình trạng : </b>' + 'Đang hoạt động' +
                '</p>' +
                '</div>' +
                '</div>';

            map.addOverlay(popup);
            popup.show(coordinates, html);
            map.getView().fit(feature.getGeometry(), map.getSize());
            map.getView().setZoom(17);
            $scope.model.car = null;
            var closer = document.getElementById('popup-closer');
            closer.onclick = function () {
                popup.hide();
                routeCarSourceVector.setVisible(false);
                routeCarSources.clear();
                return false;
            };
        }
        else {
            App.toastrError("Xe đang tắt vị trí !");
        }
    };
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "Type" && $scope.model.Types != "") {
            debugger
            //carLayerMarker.setVisible(false);
            var branchAndType = $scope.model.Types.split("/");
            $scope.model.Type = branchAndType[0];
            $scope.model.BranchCode = branchAndType[1];
            $scope.reload();
            //var features = carSourceVector.getFeatures();
            //var featuresSave1 = [];
            //if (carSourceVectorStatus.getFeatures().length == 0) {
            //    featuresSave1 = features;
            //} else {
            //    featuresSave1 = carSourceVectorStatus.getFeatures();
            //}

            //carSourceVectorTypeAndBranch.clear();
            //for (var i = 0; i < featuresSave1.length; i++) {
            //    var branchCode = featuresSave1[i].get("branchCode");
            //    var typeCar = featuresSave1[i].get("typeCar");
            //    if ($scope.model.Type === typeCar && $scope.model.BranchCode === branchCode) {
            //        carSourceVectorTypeAndBranch.addFeature(featuresSave1[i]);
            //    }
            //}
            $scope.errorTypes = false;
        }
        if (SelectType == "Status" && $scope.model.Status != "") {
            debugger
            $scope.model.State = $scope.model.Status;

            $scope.reload();
            //carLayerMarker.setVisible(false);
            //var con1 = $scope.model.Status.substr(0, 1);
            //var con2 = $scope.model.Status.substr(2, 1);
            //var con3 = $scope.model.Status.substr(4, 1);
            //var features = carSourceVector.getFeatures();
            //var featuresSave = [];
            //if (carSourceVectorTypeAndBranch.getFeatures().length == 0) {
            //    featuresSave = features;
            //} else {
            //    featuresSave = carSourceVectorTypeAndBranch.getFeatures();
            //}
            //carSourceVectorStatus.clear();
            //for (var i = 0; i < featuresSave.length; i++) {
            //    var state = featuresSave[i].get("state");
            //    var id = featuresSave[i].get("licensePlate");
            //    if (state == con1 | state == con2 | state == con3) {
            //        carSourceVectorStatus.addFeature(featuresSave[i]);
            //    }
            //}
            $scope.errorStatus = false;
        }
    }
    setTimeout(function () {
        config.init();
    }, 100);
    setInterval(function () {
        $scope.reload();
    }, 60000);
});
app.controller('urencoAddGarbage', function ($scope, $rootScope, $compile, $uibModal, $location, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    ///****-------------------PHẦN VẼ ĐIỂM RÁC ---------------------****/
    var drawListen;
    $scope.model = {
        parkPolygon: false
    }
    var config = {
        init: function () {
            config.drag();
            config.resetDrag();
        },
        drag: function () {

            $('#draw').click(function () {

                console.log($scope.model.parkPolygon)
                if (!$scope.model.parkPolygon) {
                    config.addCirclePolygon();
                }
                else {
                    config.addPolygon();
                }
            })
        },
        /** Vẽ điểm rác hình tròn */
        addCirclePolygon: function () {

            drawListen = map.on('click', function (evt) {
                //xóa polygon cũ
                var features = parkDrawLayer.getSource().getFeatures();
                if (features != null && features.length > 0) {
                    parkDrawLayer.getSource().removeFeature(features[features.length - 1]);
                }
                map.removeInteraction(draw);
                // Thêm mới
                circleCoords = createCirclePointCoords(evt.coordinate[0], evt.coordinate[1], 10, 360)
                centerPoint = evt.coordinate;
                var parkPolygon = new ol.geom.Polygon([circleCoords]);
                var styleLine = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width: 0.1, color: '#0000FF'
                    }),
                    fill: new ol.style.Fill({
                        color: '#00FFFF'
                    }),
                    zIndex: 2
                })
                var aaaa = new ol.Feature({
                    geometry: parkPolygon
                });
                aaaa.setStyle(styleLine);
                aaaa.set("centerPoint", evt.coordinate);
                parkDrawSource.addFeature(aaaa);
                var data = {};
                var features2 = parkDrawLayer.getSource().getFeatures();
                var newForm = new ol.format.GeoJSON();
                var featColl = newForm.writeFeaturesObject(features2);
                data = {
                    gis_data: featColl.features[0].geometry.coordinates,
                    centerPoint: centerPoint,
                    properties: {
                        fill_color: "#FF0000",
                        font_size: 12
                    }
                };
                $scope.model.GpsNode = JSON.stringify(data);
            });
        },
        /** Vẽ điểm rác hình đa giác */
        addPolygon: function () {

            //xóa polygon cũ
            var features = parkDrawLayer.getSource().getFeatures();
            if (features != null && features.length > 0) {
                parkDrawLayer.getSource().removeFeature(features[features.length - 1]);
            }
            ol.Observable.unByKey(drawListen);
            draw = new ol.interaction.Draw({
                source: parkDrawSource,
                type: "Polygon"
            });

            map.addInteraction(draw);

        },
        /**Xóa điểm rác */
        resetDrag: function () {
            $('#refresh').click(function () {
                var features = parkDrawLayer.getSource().getFeatures();
                if (features != null && features.length > 0) {
                    parkDrawLayer.getSource().removeFeature(features[features.length - 1]);
                }
                //map.addOverlay(popup);
                map.removeInteraction(parkDrawLayer);
                //typeSelect.value = 'None';
            })
        },
    }
    setTimeout(function () {
        config.init();
    }, 200);
    /**
     * Hàm lấy các điểm  xung quanh 1 điểm tâm cho trước
     * @param {int} circleCenterX : Lat của tâm đường tròn
     * @param {int} circleCenterY : lng của đường tròn
     * @param {int} circleRadius : Bán kính đường tròn
     * @param {int} pointsToFind : Số đỉnh muốn vẽ // hình tròn thì là 360 , hình vuông là 4
     */
    function createCirclePointCoords(circleCenterX, circleCenterY, circleRadius, pointsToFind) {

        var angleToAdd = 360 / pointsToFind;
        var coords = [];
        var angle = 0;
        for (var i = 0; i < pointsToFind; i++) {
            angle = angle + angleToAdd;
            var coordX = circleCenterX + circleRadius * Math.cos(angle * Math.PI / 180);
            var coordY = circleCenterY + circleRadius * Math.sin(angle * Math.PI / 180);
            coords.push([coordX, coordY]);
        }

        return coords;
    }
    // Hiển thị tuyến đường được thêm điểm rác
    $scope.changleSelect = function () {
        dataservice.GetDetailRoute($scope.model.Route, function (result) {result=result.data;

            console.log(result);
            routeDrawSource.clear()
            routeSourceVector.setVisible(false);
            parkSourceVector.setVisible(false);
            parkCenterLayer.setVisible(false);
            carLayerMarker.setVisible(false);
            var array = [];
            var data = JSON.parse(result.RouteDataGps);
            for (var j = 0; j < data.gis_data.length; j++) {
                var a = ol.proj.transform([data.gis_data[j].lng, data.gis_data[j].lat], 'EPSG:4326', 'EPSG:3857');
                array.push(a)
            }
            var lineString = new ol.geom.LineString([]);
            lineString.setCoordinates(array);
            var styleLine = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    width: 2, color: '#8A2BE2'
                }),
                text: new ol.style.Text({
                    text: result.RouteName,
                    fill: new ol.style.Fill({
                        color: '#8B0000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: [141, 238, 238, 0.8],
                        width: 10
                    }),
                    font: 'bold 11px "Helvetica Neue", Arial',
                    backgroundFill: new ol.style.Fill({
                        color: 'black',
                    }),
                    textAlign: "bottom",
                    offsetY: -18,
                    offsetX: -38
                }),
                zIndex: 2
            })
            var aaaa = new ol.Feature({
                geometry: lineString,
                name: result.RouteName
            });
            aaaa.setStyle(styleLine);
            aaaa.setId(result.Id);
            aaaa.set("idRoute", result.Id);
            aaaa.set("nameRoute", result.RouteName);
            routeDrawSource.addFeature(aaaa);
            map.getView().fit(aaaa.getGeometry(), map.getSize());
            map.getView().setZoom(16);
        });
    }
    /** Hàm insert dữ liệu vào bảng */
    $scope.submit = function () {
        validationSelect($scope.model);
        if (!validationSelect($scope.model).Status) {
            var data = {};
            var features2 = parkDrawLayer.getSource().getFeatures();
            var newForm = new ol.format.GeoJSON();
            var featColl = newForm.writeFeaturesObject(features2);
            if (featColl.features.length == 0) {
                App.toastrError("Vui lòng vẽ vị trí !");
            }
            else {
                if (featColl.features.length == 1) {
                    var polygon1 = new ol.geom.Polygon(featColl.features[0].geometry.coordinates);
                    var feature = new ol.Feature(polygon1);
                    var bbb = feature.getGeometry().getExtent();
                    var aaaaa = ol.extent.getCenter(bbb);

                    data = {
                        gis_data: featColl.features[0].geometry.coordinates,
                        centerPoint: aaaaa,
                        properties: {
                            fill_color: "#FF0000",
                            font_size: 12
                        }
                    };
                    var a = JSON.stringify(data);
                    $scope.model.GpsNode = a;
                    dataservice.insert($scope.model, function (rs) {rs=rs.data;
                        if (rs.Error) {
                            App.toastrError(rs.Title);
                            config.init();
                            $scope.model = null;
                        }
                        else {
                            App.toastrSuccess(rs.Title);
                            $scope.model = null;
                        }
                    })
                }
                else {
                    App.toastrError("Chỉ được phép vẽ 1 vị trí !");
                }
            }
        }
    }
    function validationSelect(data) {
        var mess = { Status: false, Title: "" }
        if (data.Route == "" || data.Route == null) {
            $scope.errorRoute = true;
            mess.Status = true;
        } else {
            $scope.errorRoute = false;

        }
        if (data.Manager == "" || data.Manager == null) {
            $scope.errorManager = true;
            mess.Status = true;
        } else {
            $scope.errorManager = false;

        }
        if (data.Status == "" || data.Status == null) {
            $scope.errorStatus = true;
            mess.Status = true;
        } else {
            $scope.errorStatus = false;

        }
        if (data.Unit == "" || data.Unit == null) {
            $scope.errorUnit = true;
            mess.Status = true;
        } else {
            $scope.errorUnit = false;

        }
        return mess;
    }
});
app.controller('urencoSearchGarbage', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
    var vm = $scope;
    $scope.model = {
        RouteCode: '',
        NodeCode: ''
    };
    $scope.initData = function () {
        dataservice.getListPark(function (rs) {rs=rs.data;
            $scope.listPark = rs.Object;
        });
    }
    $scope.initData();
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.liFunction = [];

    debugger
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/UrencoMap/GetListParkInRoute",
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
                d.RouteCode = $scope.model.RouteCode;
                d.NodeCode = $scope.model.NodeCode;
            },
            complete: function () {
                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
        .withOption('order', [0, 'asc'])
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
            $(row).find('td:not(:has(label.mt-checkbox))').on('dblclick', function (evt) {
                if (evt.target.localName == 'input' && evt.target.type == 'checkbox') {
                } else {
                    var nodeCode = data.NodeCode;
                    $scope.searchGarbage(nodeCode);
                }
            });
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable()
        .renderWith(function (data, type, full, meta) {
            $scope.selected[full.Id] = false;
            return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected, $event)"/><span></span></label>';
        }).withOption('sWidth', '30px').withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NodeName').withTitle('Tên điểm').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-50per pl5'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('VolumeUsed').withTitle('Số rác hiện có').renderWith(function (data, type, full) {
        return '<input id="' + full.Id + '" type="text" class="form-control" style="float: left;width: 75%;" value="' + data + '" placeholder="Nhập thể tích..."/> <span>m3</span>';

    }).withOption('sClass', 'dataTable-pr0 dataTable-30per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('action').notSortable().withTitle('{{"Thao tác" | translate}}').renderWith(function (data, type, full) {
        return '<button ng-click="edit(' + full.Id + ')" style = "margin-left: 40%;width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline green-custom"><i class="fa fa-save"></i></button>';
    }).withOption('t-center'));
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
    $scope.reload = function () {
        reloadData(true);
    }
    $rootScope.reloadGarbage = function (data) {
        $scope.model.RouteCode = data;
        reloadData(true);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $scope.edit = function (id) {
        var valueUse = $("#" + id).val();
        body = {
            Id: id,
            Volume: valueUse
        };
        dataservice.update(body, function (rs) {rs=rs.data;
            if (rs.Error) {
                App.toastrError(rs.Title);
            }
            else {
                App.toastrSuccess(rs.Title);
                $uibModalInstance.close();
            }
        })
    }
    var popup = new ol.Overlay.Popup;
    $scope.searchGarbage = function (data) {
        debugger
        var feature = parkCenterSourceVector.getFeatureById(data);
        if (feature != null) {
            var namePark = feature.get("namePark");
            var Volume = feature.get("Volume");
            var VolumeLimit = feature.get("VolumeLimit");
            var coordinates = feature.get("centerPoint");
            var Unit = feature.get("Unit");
            var html = '<div class="ol-popup-park" style="display: block;">' +
                '<div class="ol-popup-content-park">' +
                '<div id="content">' +
                '<div id="siteNotice">' +
                '</div>' +
                '<h2 id="firstHeading" class="firstHeading"><b><u>Thông tin điểm rác</u></b></h2>' +
                '<div id="bodyContent">' +
                '<p><b>Tên điểm rác : </b>' + namePark + '<br>' +
                '<b>Dung lượng hiện tại : </b>' + Volume + '' + Unit + '<br>' +
                '<b>Dung lượng tối đa : </b>' + VolumeLimit + '' + Unit + '<br>' +
                //'<b>Đơn vị : </b>' + Unit +
                '</p>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            map.addOverlay(popup);
            popup.show(coordinates, html);
            map.getView().fit(feature.getGeometry(), map.getSize());
            map.getView().setZoom(17);
            $scope.model.car = null;
        }
    }
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "NodeCode" && $scope.model.NodeCode != "") {
            dataservice.getRouteOfNode($scope.model.NodeCode, function (rs) {rs=rs.data;

                $rootScope.edit(rs.Object.ID);
            });
            debugger
            $scope.searchGarbage($scope.model.NodeCode);
            $scope.errorNodeCode = false;
        }
    }
});
app.controller('urencoRoute', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {

    $scope.model = {
        Status: '',
        NumLine: '',
        Manager: '',
        RoutePriority: '',
        RouteLevel: '',
        RouteType: ''
    }
    $scope.initLoad = function () {
        dataservice.getUrencoRoute(function (rs) {rs=rs.data;
            $scope.listUrencoRoute = rs;
        })
    }
    $scope.initLoad();
    var vm = $scope;
    $scope.selected = [];
    $scope.selectAll = false;
    $scope.toggleAll = toggleAll;
    $scope.toggleOne = toggleOne;
    $scope.treeDataunit = [];
    $scope.positionData = [];
    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('ajax', {
            url: "/Admin/Route/jtable",
            beforeSend: function (jqXHR, settings) {
                App.blockUI({
                    target: "#contentMain",
                    boxed: true,
                    message: 'loading...'
                });
            },
            type: 'POST',
            data: function (d) {
                d.RouteName = $scope.model.RouteName;
                d.RouteCode = $scope.model.RouteCode;
                d.RouteLevel = $scope.model.RouteLevel;
                d.RoutePriority = $scope.model.RoutePriority
                d.Manager = $scope.model.Manager;
                d.NumLine = $scope.model.NumLine;
                d.Status = $scope.model.Status;
            },
            complete: function () {


                App.unblockUI("#contentMain");
            }
        })
        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
        .withDataProp('data').withDisplayLength(10)
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
        });

    vm.dtColumns = [];
    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
        $scope.selected[full.Id] = false;
        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.Id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
    }).withOption('sClass', 'hidden'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('RouteName').withTitle('Tên đường').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-20per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('NumLength').withTitle('Chiều dài(m)').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0 dataTable-10per'));
    vm.dtColumns.push(DTColumnBuilder.newColumn('Manager').withTitle('Người quản lý').renderWith(function (data, type) {
        return data;
    }).withOption('sClass', 'dataTable-pr0  dataTable-10per'));

    vm.dtColumns.push(DTColumnBuilder.newColumn("null").withTitle('Thao tác').notSortable().renderWith(function (data, type, full, meta) {
        return '<button ng-click="edit(' + full.Id + ')" style = "width: 25px; height: 25px; padding: 0px" class="btn btn-icon-only btn-circle btn-outline blue"><i class="fa fa-eye"></i></button>';
    }).withOption('sClass', 'nowrap tcenter  dataTable-10per'));
    vm.reloadData = reloadData;
    vm.dtInstance = {};

    function reloadData(resetPaging) {
        vm.dtInstance.reloadData(callback, resetPaging);
        loadDataRoute();
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
    $scope.reload = function () {
        reloadData(true);

    }
    $rootScope.reloadRoute = function () {
        reloadData(true);
    }
    $scope.reloadNoResetPage = function () {
        reloadData(false);
    }
    $scope.search = function () {
        reloadData(true);
    }
    $rootScope.edit = function (Id) {
        dataservice.getRouteId(Id, function (result) {result=result.data;
            routeSources.clear();
            var array = [];
            var data = JSON.parse(result.RouteDataGps);
            var routeCode = result.RouteCode;

            debugger
            $rootScope.RouteCode = routeCode;
            $rootScope.reloadGarbage($rootScope.RouteCode);

            //dataservice.getParkInRoute(routeCode, function (rs) {rs=rs.data;
            //    //parkCenterSourceVector.clear();
            //    //parkSources.clear();
            //    for (var i = 0; i < rs.length; i++) {
            //        var color = '';
            //        var img = '';
            //        var view = rs[i].Volume / rs[i].VolumeLimit * 100;
            //        if (50 > view) {
            //            color = '#00FFFF';
            //            //img = '/images/map/racgif.gif';
            //            img = '/images/map/cau_rac_70.png';
            //            //img = '/images/map/rac10_l.png';
            //        }
            //        else if (90 > view) {
            //            color = '#F9B900';
            //            img = '/images/map/cau_rac_70.png';
            //        }
            //        else {
            //            color = '#D20000';
            //            img = '/images/map/cau_rac_70.png';
            //        }
            //        //vẽ polygon
            //        var array = [];
            //        var data = JSON.parse(rs[i].GpsNode);
            //        array = data.gis_data;
            //        var parkPolygon = new ol.geom.Polygon([]);
            //        parkPolygon.setCoordinates(array);
            //        var styleLine = new ol.style.Style({
            //            stroke: new ol.style.Stroke({
            //                width: 0.1, color: color
            //            }),
            //            fill: new ol.style.Fill({
            //                color: color
            //            }),
            //            zIndex: 2
            //        })
            //        var aaaa = new ol.Feature({
            //            geometry: parkPolygon,
            //            name: rs[i].NodeName
            //        });

            //        aaaa.setStyle(styleLine);
            //        aaaa.setId(rs[i].NodeCode);
            //        aaaa.set("idPark", rs[i].NodeCode);
            //        aaaa.set("namePark", rs[i].NodeName);
            //        aaaa.set("Volume", rs[i].Volume);
            //        aaaa.set("VolumeLimit", rs[i].VolumeLimit);
            //        aaaa.set("centerPoint", data.centerPoint);
            //        aaaa.set("Unit", rs[i].Unit);
            //        aaaa.set("type", 'Bin');

            //        parkSources.addFeature(aaaa);
            //        //vẽ maker center
            //        var styleFunction = new ol.style.Style({
            //            image: new ol.style.Icon(({
            //                anchor: [0.25, 0.6],
            //                size: [x, y],
            //                opacity: 6,
            //                scale: 0.7,
            //                src: img,
            //            })),

            //            text: new ol.style.Text({
            //                text: rs[i].NodeName /*+ "-" + rs[i].Volume + rs[i].Unit*/,
            //                fill: new ol.style.Fill({
            //                    color: '#8B0000'
            //                }),
            //                stroke: new ol.style.Stroke({
            //                    color: [141, 238, 238, 0.8],
            //                    width: 10
            //                }),
            //                font: 'bold 11px "Helvetica Neue", Arial',
            //                backgroundFill: new ol.style.Fill({
            //                    color: 'black',
            //                }),
            //                textAlign: "bottom",
            //                offsetY: 15,
            //                offsetX: -25
            //            })

            //        })
            //        var lonlat3857 = new ol.geom.Point(data.centerPoint);
            //        var iconFeature = new ol.Feature({
            //            geometry: lonlat3857,
            //            style: styleFunction
            //        });
            //        iconFeature.setStyle(styleFunction);
            //        iconFeature.setId(rs[i].Id);
            //        iconFeature.set("namePark", rs[i].NodeName);
            //        iconFeature.set("Volume", rs[i].Volume);
            //        iconFeature.set("VolumeLimit", rs[i].VolumeLimit);
            //        iconFeature.set("centerPoint", data.centerPoint);
            //        iconFeature.set("Unit", rs[i].Unit);
            //        iconFeature.set("type", 'Bin');
            //        parkCenterSourceVector.addFeature(iconFeature);

            //    }
            //})
            for (var j = 0; j < data.gis_data.length; j++) {
                var a = ol.proj.transform([data.gis_data[j].lng, data.gis_data[j].lat], 'EPSG:4326', 'EPSG:3857');
                array.push(a)
            }
            var lineString = new ol.geom.LineString([]);
            lineString.setCoordinates(array);
            var styleLine = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    width: 2, color: '#000000'
                }),
                text: new ol.style.Text({
                    text: result.RouteName,
                    fill: new ol.style.Fill({
                        color: '#000000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: [156, 203, 227, 0.8],
                        width: 10
                    }),
                    font: 'bold 12px "Helvetica Neue", Arial',
                    backgroundFill: new ol.style.Fill({
                        color: 'black',
                    }),
                    textAlign: "bottom",
                    offsetY: -18,
                    offsetX: -38
                }),
                zIndex: 2
            })
            var aaaa = new ol.Feature({
                geometry: lineString,
                name: result.RouteName
            });
            aaaa.setStyle(styleLine);
            aaaa.setId(result.Id);
            aaaa.set("idRoute", result.Id);
            aaaa.set("nameRoute", result.RouteName);
            routeSources.addFeature(aaaa);
            map.getView().fit(aaaa.getGeometry(), map.getSize());
            map.getView().setZoom(18);
        });
    },
        setTimeout(function () {
            dataservice.getStatus(function (rs) {rs=rs.data;
                $scope.statuss = rs;

                $scope.statuss.unshift({ Code: "", Name: "Tất cả" });
            });
            dataservice.getEmployee(function (rs) {rs=rs.data;
                $scope.managers = rs;
            });
            loadDataRoute();
        }, 200);
    $scope.changeSelect = function (SelectType) {
        if (SelectType == "RouteCode" && $scope.model.RouteCode != "") {
            debugger
            dataservice.GetDetailRoute($scope.model.RouteCode, function (rs) {rs=rs.data;
                $scope.edit(rs.Id);
            })
            $scope.errorRouteCode = false;
        }
    }
    function loadDataRoute() {
        dataservice.getRoute(function (result) {result=result.data;
            console.log(result);
            for (var i = 0; i < result.length; i++) {
                var array = [];
                var data = JSON.parse(result[i].RouteDataGps);
                for (var j = 0; j < data.gis_data.length; j++) {
                    var a = ol.proj.transform([data.gis_data[j].lng, data.gis_data[j].lat], 'EPSG:4326', 'EPSG:3857');
                    array.push(a)
                }
                var lineString = new ol.geom.LineString([]);
                lineString.setCoordinates(array);
                var styleLine = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width: 1.5, color: '#25B128'
                    }),
                    text: new ol.style.Text({
                        text: result[i].RouteName,
                        fill: new ol.style.Fill({
                            color: '#000000'
                        }),
                        stroke: new ol.style.Stroke({
                            color: [156, 203, 227, 0.8],
                            width: 10
                        }),
                        font: 'bold 12px "Helvetica Neue", Arial',
                        backgroundFill: new ol.style.Fill({
                            color: 'black',
                        }),
                        textAlign: "bottom",
                        offsetY: -18,
                        offsetX: -38
                    }),
                    zIndex: 2
                })
                var aaaa = new ol.Feature({
                    geometry: lineString,
                    name: result[i].RouteName
                });
                aaaa.setStyle(styleLine);
                aaaa.setId(result[i].Id);
                aaaa.set("idRoute", result[i].Id);
                aaaa.set("nameRoute", result[i].RouteName);
                routeSources.addFeature(aaaa);
            }
        });
    };
    setTimeout(function () {
        loadDataRoute()
    }, 500);
});

app.controller('monitor2', function ($scope, $rootScope, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $filter) {
});