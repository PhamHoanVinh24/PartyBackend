var ctxfolder = "/views/admin/vcCarPosition";
//var webSyncHandleUrl = 'https://websync.s-work.vn/websync.ashx';
var webSyncHandleUrl = 'https://websync.3i.com.vn/websync.ashx';
var urlIcon = '/images/map/car.png';
// mảng chứa icon xe rác 
var carSourceVector = new ol.source.Vector({
    features: []
});
var map;
// layer map
var LayerMap;
var layerGoogle = new ol.source.XYZ({
    url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
});
var OSM = new ol.source.OSM({
});
//// mảng chứa id xe và x,y là kích thước xe
//var idCar = [];
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
fm.websync.client.enableMultiple = true;
var client = new fm.websync.client(webSyncHandleUrl);
var currentRoom = "BTS";
var app = angular.module('App_ESEIM', ["ui.bootstrap", "ngRoute", "ngValidate", "datatables", "datatables.bootstrap", 'datatables.colvis', "ui.bootstrap.contextMenu", 'datatables.colreorder', 'angular-confirm', "ngJsTree", "treeGrid", "ui.select", "ngCookies", "pascalprecht.translate"]);
app.factory('dataservice', function ($http) {
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    var headers = {
        "Content-Type": "application/json;odata=verbose",
        "Accept": "application/json;odata=verbose"
    };


    var submitFormUpload = function (url, data, callback) {

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined
            },
            data: data
        };

        $http(req).success(callback);
    };
    return {
        //insert: function (data, callback) {
        //    $http.post('Admin/VCProductCategory/Insert', data, callback).success(callback);
        //},
        //update: function (data, callback) {
        //    $http.post('Admin/VCProductCategory/Update', data).success(callback);
        //},
        //deleteItems: function (data, callback) {
        //    $http.post('Admin/VCProductCategory/DeleteItems', data).success(callback);
        //},
        //delete: function (data, callback) {
        //    $http.post('Admin/VCProductCategory/Delete/' + data).success(callback);
        //},
        //getItem: function (data, callback) {
        //    $http.get('Admin/VCProductCategory/GetItem/' + data).success(callback);
        //},
        //getItemDetail: function (data, callback) {
        //    $http.get('Admin/VCProductCategory/GetItemDetail/' + data).success(callback);
        //},
        //getproductgroup: function (callback) {
        //    $http.post('Admin/VCProductCategory/GetProductGroup/').success(callback);
        //},
        //gettreedataLevel: function (callback) {
        //    $http.post('Admin/VCProductCategory/GetProductUnit/').success(callback);
        //},
        //uploadImage: function (data, callback) {
        //    submitFormUpload('Admin/VCProductCategory/UploadImage/', data, callback);
        //},
        //getListCar: function (callback) {
        //    $http.post('/Admin/VCCarPosition/GetListCar').success(callback);
        //},
        //getCarCheckIn: function (data, callback) {
        //    $http.post('/Admin/VCCarPosition/getCarCheckIn/', data).success(callback);
        //},
        //getCarCheckInNotPaging: function (data, callback) {
        //    $http.post('/Admin/VCCarPosition/GetCarCheckInNotPaging/', data).success(callback);
        //},
        //getCarCheckIn1: function (data, callback) {
        //    $http.post('/Admin/VCCarPosition/getCarCheckIn1/', data).success(callback);
        //},
        //getArea: function (callback) {
        //    $http.post('/Admin/Map/GetListArea').success(callback);
        //}
        getListCarDemo: function (callback) {
            $http.post('/Admin/VCCarPosition/GetListCarDemo').then(callback);
        },
        getInfoCarDemo: function (data, callback) {
            $http.get('/Admin/VCCarPosition/GetInfoCarDemo?vehicleCode=' + data).then(callback);
        },
        // API Lộ trình
        getAllLogtisTracking: function (callback) {
            $http.post('/Admin/VCCarPosition/GetAllLogtisTracking').then(callback);
        },
    };
});
app.controller('Ctrl_ESEIM', function ($scope, $rootScope, $cookies, $translate) {
    $rootScope.go = function (path) {
        $location.path(path); return false;
    };
    var culture = $cookies.get('_CULTURE') || 'vi-VN';
    $translate.use(culture);

    $rootScope.$on('$translateChangeSuccess', function () {
        caption = caption[culture];
        $.extend($.validator.messages, {
            min: caption.COM_VALIDATE_VALUE_MIN
            //max: 'Max some message {0}'
        });
        $rootScope.checkData = function (data) {
            var partternCode = /^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$/g;
            // var partternCode = new RegExp("^[a-zA-Z0-9]+[^!@#$%^&*<>?\s]*$");
            //var partternName = /^(^[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]+$)|^(^[0-9]+[ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.\s][ĂăĐđĨĩŨũƠơƯưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹẠ-ỹa-zA-Z.0-9\s]*$)/
            var mess = { Status: false, Title: "" }
            if (!partternCode.test(data.ProductCode)) {
                mess.Status = true;
                mess.Title = mess.Title.concat(" - ", caption.COM_VALIDATE_ITEM_CODE.replace("{0}", caption.VCSP_CURD_LBL_PRODUCT_CODE)/*"Mã sản phẩm không chứa ký tự đặc biệt hoặc khoảng trắng"*/, "<br/>");
            }
            return mess;
        };
        $rootScope.validationOptions = {
            rules: {
                ProductCode: {
                    required: true,
                    maxlength: 50
                },
                ProductName: {
                    required: true,
                    maxlength: 200
                },
                Unit: {
                    required: true,
                    maxlength: 100
                }
            },
            messages: {
                ProductCode: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.VCSP_CURD_LBL_PRODUCT_CODE),//"Nhập sản phẩm!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.VCSP_CURD_LBL_PRODUCT_CODE).replace("{1}", "100")//"Mã sản phẩm không vượt quá 100 kí tự!"
                },
                ProductName: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.VCSP_CURD_LBL_PRODUCT_NAME),//"Nhập tên sản phẩm!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.VCSP_CURD_LBL_PRODUCT_NAME).replace("{1}", "200")//"Tên sản phẩm không vượt quá 200 kí tự!"
                },
                Unit: {
                    required: caption.COM_ERR_REQUIRED.replace("{0}", caption.VCSP_CURD_LBL_UNIT),//"Nhập đơn vị!",
                    maxlength: caption.COM_ERR_EXCEED_CHARACTERS.replace("{0}", caption.VCSP_CURD_LBL_UNIT).replace("{1}", "200")//"Đơn vị không vượt quá 200 kí tự!"
                }
            }
        };
    });
});
app.config(function ($routeProvider, $validatorProvider, $translateProvider) {
    $translateProvider.useUrlLoader('/Admin/ProductImport/Translation');
    caption = $translateProvider.translations();
    $routeProvider
        .when('/', {
            templateUrl: ctxfolder + '/index.html',
            controller: 'index'
        })
        .when('/edit/:id', {
            templateUrl: ctxfolder + '/edit.html',
            controller: 'edit'
        })
        .when('/add/', {
            templateUrl: ctxfolder + '/add.html',
            controller: 'add'
        });
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
app.controller('index', function ($scope, $rootScope, $compile, $uibModal, $location, dataservice, $filter, DTOptionsBuilder, DTColumnBuilder) {
    var cars = {};
    var popup = {};
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
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
    });
    var config = {
        init: function () {
            config.loadMap();
            config.setHeightMap();
            config.mapClick();
            config.loadData();
            config.searchMap();
            config.enterSearchMap();
        },
        loadMap: function () {
            carLayerMarker = new ol.layer.Vector({
                source: carSourceVector
            });
            carLayerMarker.setZIndex(2);
            LayerMap = new ol.layer.Tile({
                source: googleLayer
            });

            //Khởi tạo Map
            map = new ol.Map({
                target: $('#map')[0],
                layers: [
                    LayerMap,
                    carLayerMarker,
                    routeSourceVector,
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
            var checkCar = true;
            var checkPark = false;
            //hide route
            var checkRoute = false;
            //đổi icon
            var i = 0;
        },
        loadData: function () {
            //load xe trên websync
            fm.util.addOnLoad(function () {
                var chatObject = {
                    alias: 'Unknown',
                    clientId: '0',
                    channels: {
                        main: '/chat'
                    }
                };
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
                };
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
                        App.toastrError("Không thể kết nối đến Websync. Vui lòng liên hệ đến quản lý")
                    }
                });
                util.subcribe();
            });

            dataservice.getListCarDemo(function (rs) {
                drawMarkerExistRmDemo(rs);
            })
            //load xe trên server(Có xe để demo)
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
                    var driverName = feature.get("driverName");
                    var routeName = feature.get("routeName");
                    var storeName = feature.get("storeName");
                    var soCode = feature.get("soCode");
                    var licensePlate = feature.get("licensePlate");
                    dataservice.getInfoCarDemo(licensePlate, function (rs) {
                        var coordinates = feature.getGeometry().getCoordinates();
                        var html = '<div id="content">' +
                            '<div id="siteNotice">' +
                            '</div>' +
                            '<h2 id="firstHeading" class="firstHeading"><b><u>Thông tin xe</u></b></h2>' +
                            '<div id="bodyContent">' +
                            '<p><b>Tên tài xế : </b>' + driverName + '<br>' +
                            '<b>Biển số xe : </b>' + licensePlate + '<br>' +
                            '<b>Cửa hàng : </b>' + (storeName == undefined ? rs.storeName : storeName != '' ? storeName : rs.storeName == undefined ? '' : rs.storeName)  + '<br>' +
                            '<b>Mã đơn hàng : </b>' + (soCode == undefined ? rs.soCode : soCode != '' ? soCode : rs.soCode == undefined ? '' : rs.soCode)  + '<br>' +
                            '<b>Tình trạng : </b>' + '<span class="text-success bold">Đang hoạt động</span>' +
                            '</p>' +
                            '</div>' +
                            '</div>';
                        map.removeOverlay(popup);
                        popup = new ol.Overlay.Popup;
                        map.addOverlay(popup);
                        popup.show(coordinates, html);
                    })
                }
            });
        },
        mapReSize: function () {
            setTimeout(function () {
                map.updateSize();
            }, 600);
        },
        searchMap: function () {
            $('#searchMap').click(function (rs) {
                var dataSearch = $("#autocomplete").val();
                if (dataSearch != '') {
                    var place = autocomplete.getPlace();
                    if (place == undefined || place.geometry == undefined) {
                        var getCarFeature = carSourceVector.getFeatures().find(function (element) {
                            if (element.T.licensePlate.toLowerCase() == dataSearch.toLowerCase() || element.T.soCode.toLowerCase() == dataSearch.toLowerCase()) return true;
                        });
                        if (getCarFeature) {
                            map.getView().fit(getCarFeature.getGeometry(), map.getSize());
                            map.getView().setZoom(18);
                            var driverName = getCarFeature.get("driverName");
                            var routeName = getCarFeature.get("routeName");
                            var storeName = getCarFeature.get("storeName");
                            var soCode = getCarFeature.get("soCode");
                            var licensePlate = getCarFeature.get("licensePlate");
                            dataservice.getInfoCarDemo(licensePlate, function (rs) {
                                var coordinates = getCarFeature.getGeometry().getCoordinates();
                                var html = '<div id="content">' +
                                    '<div id="siteNotice">' +
                                    '</div>' +
                                    '<h2 id="firstHeading" class="firstHeading"><b><u>Thông tin xe</u></b></h2>' +
                                    '<div id="bodyContent">' +
                                    '<p><b>Tên tài xế : </b>' + driverName + '<br>' +
                                    '<b>Biển số xe : </b>' + licensePlate + '<br>' +
                                    '<b>Cửa hàng : </b>' + (storeName == undefined ? rs.storeName : storeName != '' ? storeName : rs.storeName == undefined ? '' : rs.storeName) + '<br>' +
                                    '<b>Mã đơn hàng : </b>' + (soCode == undefined ? rs.soCode : soCode != '' ? soCode : rs.soCode == undefined ? '' : rs.soCode) + '<br>' +
                                    '<b>Tình trạng : </b>' + '<span class="text-success bold">Đang hoạt động</span>' +
                                    '</p>' +
                                    '</div>' +
                                    '</div>';
                                map.removeOverlay(popup);
                                popup = new ol.Overlay.Popup;
                                map.addOverlay(popup);
                                popup.show(coordinates, html);
                            })
                           
                        } else {
                            App.toastrError("Không tìm thấy xe nào phù hợp");
                        }
                    } else {
                        var lat = place.geometry.location.lat();
                        var lng = place.geometry.location.lng();
                        var point = new ol.geom.Point(ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'));
                        map.setView(new ol.View({
                            center: ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'),
                            zoom: 11
                        }));
                        map.getView().setZoom(15);
                    }

                } else {
                    App.toastrError("Vui lòng nhập thông tin tìm kiếm");
                }
            })
        },
        enterSearchMap: function () {
            $('#autocomplete').on('keydown', function (e) {
                if (e.which == 13) {
                    var dataSearch = $("#autocomplete").val();
                    if (dataSearch != '') {
                        var place = autocomplete.getPlace();
                        if (place == undefined || place.geometry == undefined) {
                            var getCarFeature = carSourceVector.getFeatures().find(function (element) {
                                if (element.T.licensePlate.toLowerCase() == dataSearch.toLowerCase() || element.T.soCode.toLowerCase() == dataSearch.toLowerCase()) return true;
                            });
                            if (getCarFeature) {
                               
                                var driverName = getCarFeature.get("driverName");
                                var routeName = getCarFeature.get("routeName");
                                var storeName = getCarFeature.get("storeName");
                                var soCode = getCarFeature.get("soCode");
                                var licensePlate = getCarFeature.get("licensePlate");
                                dataservice.getInfoCarDemo(licensePlate, function (rs) {
                                    map.getView().fit(getCarFeature.getGeometry(), map.getSize());
                                    map.getView().setZoom(18);
                                    var coordinates = getCarFeature.getGeometry().getCoordinates();
                                    var html = '<div id="content">' +
                                        '<div id="siteNotice">' +
                                        '</div>' +
                                        '<h2 id="firstHeading" class="firstHeading"><b><u>Thông tin xe</u></b></h2>' +
                                        '<div id="bodyContent">' +
                                        '<p><b>Tên tài xế : </b>' + driverName + '<br>' +
                                        '<b>Biển số xe : </b>' + licensePlate + '<br>' +
                                        '<b>Cửa hàng : </b>' + (storeName == undefined ? rs.storeName : storeName != '' ? storeName : rs.storeName == undefined ? '' : rs.storeName) + '<br>' +
                                        '<b>Mã đơn hàng : </b>' + (soCode == undefined ? rs.soCode : soCode != '' ? soCode : rs.soCode == undefined ? '' : rs.soCode) + '<br>' +
                                            '<b>Tình trạng : </b>' + '<span class="text-success bold">Đang hoạt động</span>' +
                                            '</p>' +
                                            '</div>' +
                                        '</div>';
                                    map.removeOverlay(popup);
                                    popup = new ol.Overlay.Popup;
                                    map.addOverlay(popup);
                                    popup.show(coordinates, html);
                                })

                            } else {
                                App.toastrError("Không tìm thấy xe nào phù hợp");
                            }
                        } else {
                            var lat = place.geometry.location.lat();
                            var lng = place.geometry.location.lng();
                            var point = new ol.geom.Point(ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'));
                            map.setView(new ol.View({
                                center: ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'),
                                zoom: 11
                            }));
                            map.getView().setZoom(15);
                        }

                    } else {
                        App.toastrError("Vui lòng nhập thông tin tìm kiếm");
                    }
                }
            });
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
    };
    function drawMarkerExistRm(data) {
        try {
            var id = data.locationMessage.idCar;
            var book = {
                location: [data.locationMessage.latitude, data.locationMessage.longitude]
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
                                size: [x, y],
                                opacity: 6,
                                scale: 0.7,
                                rotation: bear,
                                src: urlIcon
                                //src: '/images/map/xeracx.png'
                                //src: '/images/map/car.png'
                            })),
                            text: new ol.style.Text({
                                text: data.locationMessage.licensePlate,
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
                    }
                }
                else if (carSourceVector.getFeatureById(id) == null) {
                    if (data.type == "START") {
                        var styleFunction = new ol.style.Style({
                            image: new ol.style.Icon(({
                                anchor: [0.5, 0.5],
                                size: [x, y],
                                opacity: 6,
                                scale: 0.7,
                                src: urlIcon
                                //src: '/images/map/xeracX.png'
                                //src: '/images/map/car.png'
                            })),
                            text: new ol.style.Text({
                                text: data.locationMessage.licensePlate,
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
                        var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                            'EPSG:3857'));
                        var iconFeature = new ol.Feature({
                            geometry: lonlat3857,
                            name: "" /*+ "_" + data.location_message.channel*/,
                            population: 4000,
                            rainfall: 500,
                            style: styleFunction
                        });
                        iconFeature.setId(id);
                        iconFeature.set("idCar", id);
                        iconFeature.set("licensePlate", data.locationMessage.licensePlate);
                        iconFeature.set("routeName", data.locationMessage.routeName);
                        iconFeature.set("driverName", data.locationMessage.driverName);
                        iconFeature.set("storeName", data.locationMessage.storeName);
                        iconFeature.set("soCode", data.locationMessage.soCode);
                        iconFeature.set("isShow", false);
                        popup = new ol.Overlay.Popup;
                        iconFeature.set("popup", popup);
                        iconFeature.setStyle(styleFunction);
                        carSourceVector.addFeature(iconFeature);
                    }
                }
            }
        }
        catch (ex) {
            console.log(data);
        }
    };
    function drawMarkerExistRmDemo(data) {
        for (var i = 0; i < data.length; i++) {
            var id = data[i].idCar;
            var book = {
                location: [data[i].latitude, data[i].longitude]
            };
            var styleFunction = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 0.5],
                    size: [x, y],
                    opacity: 6,
                    scale: 0.7,
                    src: urlIcon
                    //src: '/images/map/xeracX.png'
                    //src: '/images/map/car.png'
                })),
                text: new ol.style.Text({
                    text: data[i].licensePlate,
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
            var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                'EPSG:3857'));
            var iconFeature = new ol.Feature({
                geometry: lonlat3857,
                name: "" /*+ "_" + data.location_message.channel*/,
                population: 4000,
                rainfall: 500,
                style: styleFunction
            });
            iconFeature.setId(id);
            iconFeature.set("idCar", id);
            iconFeature.set("type", 'trashCar');
            iconFeature.set("licensePlate", data[i].licensePlate);
            iconFeature.set("routeName", data[i].routeName);
            iconFeature.set("driverName", data[i].driverName);
            iconFeature.set("storeName", data[i].storeName);
            iconFeature.set("soCode", data[i].soCode);
            iconFeature.set("isShow", false);
             popup = new ol.Overlay.Popup;
            iconFeature.set("popup", popup);
            iconFeature.setStyle(styleFunction);
            carSourceVector.addFeature(iconFeature);
        }
    }
    setTimeout(function () {
        $("#arrow-tab-urenco-hide").click(function () {
            $(".leftPanel").show(500);
            $(".leftPanel-hide").hide(500);

        });
        $("#arrow-tab-urenco").click(function () {
            $(".leftPanel").hide(500);
            $(".leftPanel-hide").show(500);
        });
        $("#arrow-menu-urenco-hide").click(function () {
            $(".rightPanel").show(500);
            $(".rightPanel-hide").hide(500);

        });
        $("#arrow-menu-urenco").click(function () {
            $(".rightPanel").hide(500);
            $(".rightPanel-hide").show(500);
        });
        //$.app.menu.expanded = true;
        //$.app.menu.collapsed = false;
        //$.app.menu.toggle();
        config.init();
    }, 100);
});


    ////Ham ve tren Map gg
    //drawMarkerExist = function (data) {

    //    if (data == null) {
    //    }
    //    else {
    //        var id = data.locationMessage.driverId;
    //        var name = data.locationMessage.driverName;
    //        if (cars[id] != undefined) {
    //            var lat = cars[id].getPosition().lat();
    //            var lng = cars[id].getPosition().lng();

    //            var bearing = config.getBearing(lat, lng, data.locationMessage.latitude, data.locationMessage.longitude)
    //            console.log(bearing);
    //            var icon = cars[id].getIcon();
    //            console.log(icon);
    //            icon.rotation = bearing;
    //            cars[id].setIcon(icon);
    //            var latlong = { "lat": data.locationMessage.latitude, "lng": data.locationMessage.longitude }
    //            cars[id].setPosition(latlong);

    //        }
    //        else {

    //            var contentString = '<div id="content">' +
    //                '<div id="siteNotice">' +
    //                '</div>' +
    //                '<h1 id="firstHeading" class="firstHeading"><b>Thông tin xe</b></h1>' +
    //                '<div id="bodyContent">' +
    //                '<p><b>Tên tài xế : </b>' + name + '<br>' +
    //                '<b>Biển số xe : </b>' + '29B - 125.' + id + '<br>' +
    //                '<b>Tình trạng : </b>' + 'Đang hoạt động' +
    //                '</p>' +
    //                '</div>' +
    //                '</div>';
    //            var infowindow = new google.maps.InfoWindow({
    //                content: contentString
    //            });
    //            var latlong = { "lat": data.locationMessage.latitude, "lng": data.locationMessage.longitude };
    //            var LatLng = new google.maps.LatLng(data.locationMessage.latitude, data.locationMessage.longitude);
    //            var imgMaker = {
    //                url: '/images/map/car.png',
    //                labelOrigin: new google.maps.Point(18, -8),
    //                rotation: 0
    //            }
    //            cars[id] = new google.maps.Marker({
    //                position: latlong,
    //                icon: imgMaker,
    //                map: map,
    //                draggable: false,
    //                labelClass: "labels",
    //                label: {
    //                    text: "29B-125." + id,
    //                    color: 'red',
    //                    fontSize: '12px',
    //                    fontWeight: '1000'
    //                }
    //            });
    //            cars[id].addListener('click', function () {
    //                infowindow.open(map, cars[id]);
    //            });
    //        }
    //    }
    //};
//app.controller('indexOld', function ($scope, $rootScope, $confirm, $compile, $uibModal, DTOptionsBuilder, DTColumnBuilder, DTInstances, dataservice, $http) {
//    var vm = $scope;
//    $scope.selected = [];
//    $scope.selectAll = false;
//    $scope.model = { StaffName: '', UserName: '' };
//    $scope.modelPopUp = {
//        Avatar: '',
//        Name: '',
//        Phone: '',
//        CheckInTime: '',
//        Position: '',
//        CheckInDate: ''
//    };

//    var vectorArrowSource = new ol.source.Vector({});

//    var vectorArrowLayer = new ol.layer.Vector({
//        source: vectorArrowSource,
//        style: new ol.style.Style({
//            fill: new ol.style.Fill({ color: '#B40404', width: 1 }),
//            stroke: new ol.style.Stroke({ color: '#B40404', width: 4 })
//        })
//    });

//    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
//    var map;
//    $scope.staffCodeOrName = {
//        StaffCodeOrName: ''
//    };
//    $scope.staffInfoGroupByIdAndDate = [];
//    $scope.Customers = [];
//    $scope.reloadCount = 0;
//    var titleHtml = '<label class="mt-checkbox"><input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)"/><span></span></label>';
//    vm.dtOptions = DTOptionsBuilder.newOptions()
//        .withOption('ajax', {
//            url: "/Admin/VCCarPosition/getCarCheckIn/",
//            beforeSend: function (jqXHR, settings) {

//                App.blockUI({
//                    target: "#tblData",
//                    boxed: true,
//                    message: 'loading...'
//                });
//                if ($scope.reloadCount == 0) {
//                    $scope.reloadCount = $scope.reloadCount + 1;
//                    reloadNotPaging();
//                }
//            },
//            type: 'POST',
//            data: function (d) {
//                d.UserName = $scope.model.UserName;
//                d.FromDate = $scope.model.fromDate;
//                d.ToDate = $scope.model.toDate;
//            },
//            complete: function (data) {
//                if (data.status === 401) {
//                    var url = "/Home/Logout";
//                    location.href = url;
//                }
//                App.unblockUI("#tblData");
//            }
//        })
//        .withPaginationType('full_numbers').withDOM("<'table-scrollable't>ip")
//        .withDataProp('data').withDisplayLength(5)
//        .withOption('order', [0, 'desc'])
//        .withOption('serverSide', true)
//        //.withOption('scrollX', '400px')
//        .withOption('headerCallback', function (header) {
//            if (!$scope.headerCompiled) {
//                $scope.headerCompiled = true;
//                $compile(angular.element(header).contents())($scope);
//            }
//        })
//        .withOption('initComplete', function (settings, json) {
//        })
//        .withOption('createdRow', function (row, data, dataIndex) {
//            const contextScope = $scope.$new(true);
//            contextScope.data = data;
//            contextScope.contextMenu = $scope.contextMenu;
//            $compile(angular.element(row).contents())($scope);
//            $compile(angular.element(row).attr('context-menu', 'contextMenu'))(contextScope);
//            //drawMarkerExist(data);
//        });

//    vm.dtColumns = [];
//    vm.dtColumns.push(DTColumnBuilder.newColumn("Id").withTitle(titleHtml).notSortable().renderWith(function (data, type, full, meta) {
//        $scope.selected[full.id] = false;
//        return '<label class="mt-checkbox"><input type="checkbox" ng-model="selected[' + full.id + ']" ng-click="toggleOne(selected)"/><span></span></label>';
//    }).withOption('sClass', 'hidden'));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('Name').notSortable().withTitle('{{"VCSP_LIST_COL_NAME" | translate}}').withOption('sClass', 'sorting_disabled').renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('CompanyName').notSortable().withTitle('{{"VCSP_LIST_COL_COMPANY_NAME" | translate}}').renderWith(function (data, type) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('CheckInTime').notSortable().withTitle('{{"VCSP_LIST_COL_CHECK_IN_TIME" | translate}}').renderWith(function (data, type, full) {
//        return data;
//    }));
//    vm.dtColumns.push(DTColumnBuilder.newColumn('CompanyAddress').notSortable().withTitle('{{"VCSP_LIST_COL_COMPANY_ADDRESS" | translate}}').renderWith(function (data, type, full) {
//        return data;
//    }));
//    vm.reloadData = reloadData;
//    vm.dtInstance = {};
//    function reloadData(resetPaging) {
//        vm.dtInstance.reloadData(callback, resetPaging);
//    }
//    function callback(json) {

//    }
//    $scope.reload = function () {
//        reloadData(true);
//        reloadNotPaging();
//    };
//    function reloadNotPaging() {
//        carSourceVector.clear();
//        vectorArrowSource.clear();
//        var searchData = {};
//        searchData.UserName = $scope.model.UserName;
//        searchData.FromDate = $scope.model.fromDate;
//        searchData.ToDate = $scope.model.toDate;
//        dataservice.getCarCheckInNotPaging(searchData, function (rs) {
//            $scope.staffInfoGroupByIdAndDate = rs;
//            for (var indx = 0; indx < rs.length; indx++) {
//                var list = rs[indx].Data;
//                // tìm kiếm theo 1 thằng cụ thể mới vẽ
//                if ($scope.model.UserName != "") {
//                    // move to current staff gps

//                    for (var indx1 = 0; indx1 < list.length; indx1++) {
//                        if (indx1 == list.length - 1) {
//                            if (list[indx1].CheckOutTime != "")
//                                drawMarkerExistByOneStaff(list[indx1], "../../../images/logo/pinmap_yellow.png", indx1);
//                            else
//                                drawMarkerExistByOneStaff(list[indx1], "../../../images/logo/pinmap_start.png", indx1);
//                        }
//                        else if (indx1 == 0) {
//                            drawMarkerExistByOneStaff(list[indx1], "../../../images/logo/ic_start_flag.png", indx1);
//                        }
//                        else {
//                            drawMarkerExistByOneStaff(list[indx1], "../../../images/logo/pinmap_gray.png", indx1);
//                        }
//                        if (indx1 > 0) {
//                            drawLineExist(list[indx1], list[indx1 - 1]);
//                        }
//                    }
//                }
//                else {
//                    if (list[list.length - 1].CheckOutTime != "")
//                        drawMarkerExist(list[list.length - 1], "../../../images/logo/pinmap_yellow.png");
//                    else
//                        drawMarkerExist(list[list.length - 1], "../../../images/logo/pinmap_start.png");

//                }

//            }
//        });
//    }
//    $scope.init = function () {
//        initMap();
//        hideToogle();
//        dataservice.getArea(function (rs) {
//            $rootScope.StaffAreas = rs.Object;
//        });
//        dataservice.getListCar(function (rs) {
//            $scope.Customers = rs;
//        });

//    }
//    $scope.init();
//    $scope.toogleClick = function () {
//        if ($('a[data-toggle="tab"]').hasClass("hidden")) {
//            $('a[data-toggle="tab"]').removeClass("hidden");
//            $(".tab-content").removeClass("hidden");
//        } else {
//            $('a[data-toggle="tab"]').addClass("hidden");
//            $(".tab-content").addClass("hidden");
//        }
//    }
//    $scope.searchMap = function () {
//        var place = autocomplete.getPlace();
//        if (place == undefined) {
//            App.toastrError("Vui lòng nhập địa chỉ chính xác!");
//            return;
//        }
//        var lat = place.geometry.location.lat();
//        var lng = place.geometry.location.lng();
//        var point = new ol.geom.Point(ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'));
//        map.setView(new ol.View({
//            center: ol.proj.transform([place.geometry.location.lng(), place.geometry.location.lat()], 'EPSG:4326', 'EPSG:3857'),
//            zoom: 11
//        }));
//        map.getView().setZoom(15);
//    }
//    function drawMarkerExist(data, imgIconUrl) {
//        if (data.CheckInGps != undefined && data.CheckInGps != null && data.CheckInGps != '') {
//            var s = data.CheckInGps.replace("[", "").replace("]", "").replace(" ", "").split(",");
//            if (s.length == 2) {
//                var lng = parseFloat(s[1]);
//                var lat = parseFloat(s[0]);

//                var lonlat3857 = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326',
//                    'EPSG:3857'));
//                var iconStyle = new ol.style.Style({
//                    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
//                        anchor: [0.5, 1],
//                        anchorXUnits: 'fraction',
//                        anchorYUnits: 'fraction',
//                        rotation: 0,
//                        // src: 'https://sv1.uphinhnhanh.com/images/2019/01/19/Webp.net-resizeimage.png'
//                        src: imgIconUrl

//                    })),
//                    fill: new ol.style.Fill({
//                        color: '#000'
//                    }),
//                    stroke: new ol.style.Stroke({
//                        color: '#000',
//                        width: '0.2'
//                    }),
//                    text: new ol.style.Text({
//                        font: 14 + 'px Calibri,sans-serif',
//                        fill: new ol.style.Fill({ color: '#000' }),
//                        textBaseline: 'top',
//                        stroke: new ol.style.Stroke({
//                            color: '#000', width: '0.2'
//                        }),
//                        // get the text from the feature - `this` is ol.Feature
//                        text: data.Name
//                    }),

//                });

//                var iconFeature = new ol.Feature({
//                    geometry: lonlat3857,
//                    id: data.Id,
//                    userId: data.IdUser,
//                    name: data.Name,
//                    phone: data.Phone,
//                    profilePicture: data.ProfilePicture,
//                    checkInGps: data.CheckInGps,
//                    checkInTime: data.CheckInTime,
//                    population: 4000,
//                    rainfall: 500,
//                    style: iconStyle,
//                    companyAddress: data.CompanyAddress,
//                    checkInDate: data.CheckInDate,
//                    companyName: data.CompanyName
//                });
//                iconFeature.setId(data.Id);
//                iconFeature.setStyle(iconStyle);
//                carSourceVector.addFeature(iconFeature);

//            }
//        }
//    }
//    function drawMarkerExistByOneStaff(data, imgIconUrl, indx) {
//        var s = data.CheckInGps.replace("[", "").replace("]", "").replace(" ", "").split(",");
//        if (s.length == 2) {
//            var lng = parseFloat(s[1]);
//            var lat = parseFloat(s[0]);

//            var lonlat3857 = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326',
//                'EPSG:3857'));
//            var iconStyle = new ol.style.Style({
//                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
//                    anchor: [0.5, 1],
//                    anchorXUnits: 'fraction',
//                    anchorYUnits: 'fraction',
//                    rotation: 0,
//                    // src: 'https://sv1.uphinhnhanh.com/images/2019/01/19/Webp.net-resizeimage.png'
//                    src: imgIconUrl

//                })),
//                fill: new ol.style.Fill({
//                    color: '#000'
//                }),
//                stroke: new ol.style.Stroke({
//                    color: '#000',
//                    width: '0.2'
//                }),
//                text: new ol.style.Text({
//                    font: 14 + 'px Calibri,sans-serif',
//                    fill: new ol.style.Fill({ color: '#000' }),
//                    textBaseline: 'top',
//                    stroke: new ol.style.Stroke({
//                        color: '#000', width: '0.2'
//                    }),
//                    // get the text from the feature - `this` is ol.Feature
//                    text: data.CompanyName
//                }),

//            });
//            //
//            var iconFeature = new ol.Feature({
//                geometry: lonlat3857,
//                id: data.Id,
//                userId: data.IdUser,
//                name: data.Name,
//                phone: data.Phone,
//                profilePicture: data.ProfilePicture,
//                checkInGps: data.CheckInGps,
//                checkInTime: data.CheckInTime,
//                population: 4000,
//                rainfall: 500,
//                style: iconStyle,
//                companyAddress: data.CompanyAddress,
//                checkInDate: data.CheckInDate,
//                companyName: data.CompanyName
//            });
//            iconFeature.setId(data.Id);
//            iconFeature.setStyle(iconStyle);
//            carSourceVector.addFeature(iconFeature);
//            if (indx == 0) {
//                map.getView().fit(iconFeature.getGeometry(), map.getSize());
//                map.getView().setZoom(15);
//            }

//        }
//    }
//    function drawLineExist(data, data1) {
//        var s = data.CheckInGps.replace("[", "").replace("]", "").replace(" ", "").split(",");
//        var s1 = data1.CheckInGps.replace("[", "").replace("]", "").replace(" ", "").split(",");
//        if (s.length == 2 && s1.length == 2) {
//            var lng = parseFloat(s[1]);
//            var lat = parseFloat(s[0]);

//            var lng1 = parseFloat(s1[1]);
//            var lat1 = parseFloat(s1[0]);

//            var lonlat3857 = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'));

//            var lonlat3857_1 = new ol.geom.Point(ol.proj.transform([lng1, lat1], 'EPSG:4326', 'EPSG:3857'));

//            var geometry = new ol.geom.LineString([ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'), ol.proj.transform([lng1, lat1], 'EPSG:4326', 'EPSG:3857')]);
//            var featureLine = new ol.Feature({
//                geometry: geometry
//            });
//            vectorArrowSource.addFeature(featureLine);

//        }
//    }
//    function initMap() {
//        var uluru = { lat: 20.99093210090554, lng: 105.80906867980957 };
//        var iconStyle = new ol.style.Style({
//            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
//                anchor: [0.5, 0.5],
//                anchorXUnits: 'fraction',
//                anchorYUnits: 'fraction',
//                rotation: 0,
//                src: 'http://picresize.com/images/rsz_user.png'
//            }))
//        });
//        var vectorSource = new ol.source.Vector({
//            features: []
//        });
//        var vectorLayerMarker = new ol.layer.Vector({
//            source: vectorSource
//        });
//        // car layer
//        carSourceVector = new ol.source.Vector({
//            features: []

//        });

//        carLayerMarker = new ol.layer.Vector({
//            source: carSourceVector
//        });
//        carLayerMarker.setZIndex(2);
//        // path layer
//        pathSourceVector = new ol.source.Vector({
//            features: []
//        });
//        pathLayerMarker = new ol.layer.Vector({
//            source: pathSourceVector
//        });
//        var view1 = new ol.View({
//            //	center : ol.proj.fromLonLat([105.810227394,20.991132437]),
//            center: ol.proj.fromLonLat([105.8102273, 20.99113243]),
//            zoom: 15
//        });
//        var googleLayer = new ol.layer.Tile({
//            source: new ol.source.OSM({
//                url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
//                attributions: [
//                    new ol.Attribution({ html: '© Google' }),
//                    new ol.Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
//                ]
//            })
//        });
//        map = new ol.Map({
//            target: 'map',
//            layers: [

//                googleLayer,
//                vectorArrowLayer,
//                vectorLayerMarker,
//                carLayerMarker
//            ],
//            view: view1
//        });
//        //map.on('moveend', checknewzoom);

//        element = document.getElementById('popupBooking');
//        popup = new ol.Overlay({
//            element: element,
//            positioning: 'bottom-center',
//            stopEvent: false,
//            offset: [0, -10]
//        });
//        map.addOverlay(popup);
//        map.on('click', function (evt) {
//            var feature = map.forEachFeatureAtPixel(evt.pixel,
//                function (feature) {
//                    return feature;
//                });

//            if (feature) {
//                var userId = feature.get('userId');
//                var checkInDate = feature.get('checkInDate');
//                $scope.modelPopUp = {
//                    Avatar: feature.get('profilePicture'),
//                    Name: feature.get('name'),
//                    Phone: feature.get('phone'),
//                    CheckInTime: feature.get('checkInTime'),
//                    Position: feature.get('companyAddress'),
//                    CheckInDate: checkInDate,
//                    CompanyName: feature.get('companyName')
//                };
//                $scope.modelPopUpList = [];

//                var title = caption.VCSP_TITLE_MAP_ON;
//                var list = $scope.staffInfoGroupByIdAndDate;
//                for (var indx = 0; indx < list.length; ++indx) {
//                    if (list[indx].IdUser == userId && list[indx].CheckInDate == checkInDate) {
//                        $scope.modelPopUpList = list[indx].Data;
//                    }
//                }
//                var coordinates = feature.getGeometry().getCoordinates();
//                popup.setPosition(coordinates);
//                $('#title').html(title);
//                $('#Modal_Info').modal('show');
//                $scope.$apply();
//            }
//            else {
//                $(element).popover('destroy');
//                $("#listrm").attr("hidden", "true");
//                $("#romoocstatus").attr("hidden", "true");
//                $("#parkinghst").attr("hidden", "true");
//                $('#rm1Table').empty();
//                $('#parkingTable').empty();
//            }
//        });
//    }
//    function hideToogle() {
//        //$('a[data-toggle="tab"]').addClass("hidden");
//        //$(".tab-content").addClass("hidden");
//    }
//    function loadDate() {
//        $("#FromDate").datepicker({
//            inline: false,
//            autoclose: true,
//            format: "dd/mm/yyyy",
//            fontAwesome: true,
//            todayHighlight: true,
//        }).on('changeDate', function (selected) {
//            //var maxDate = new Date(selected.date.valueOf());
//            //$('#ToDate').datepicker('setStartDate', maxDate);
//        });
//        // tạm ẩn tìm kiếm đến ngày
//        //$("#ToDate").datepicker({
//        //    inline: false,
//        //    autoclose: true,
//        //    format: "dd/mm/yyyy",
//        //    fontAwesome: true,
//        //}).on('changeDate', function (selected) {
//        //    var maxDate = new Date(selected.date.valueOf());
//        //    $('#FromDate').datepicker('setEndDate', maxDate);
//        //});
//    }
//    //set height map
//    function setHeightMap() {
//        var maxHeightMap = $(window).height() - $("#map").position().top - 40;
//        $("#map").css({
//            'max-height': maxHeightMap,
//            'height': maxHeightMap,
//            'overflow': 'auto',
//        });
//        mapReSize();
//    }
//    function mapReSize() {
//        setTimeout(function () {
//            map.updateSize();
//        }, 600);
//    }
//    function menuLeftClick() {
//        $(".menu-toggle").click(function (e) {
//            mapReSize();
//        });
//    }
//    setTimeout(function () {
//        loadDate();
//        setHeightMap();
//        menuLeftClick();
//    }, 200);
//});

