//var webSyncHandleUrl = 'http://117.6.131.222:8089/websync.ashx';
var webSyncHandleUrl = 'https://websync.s-work.vn/websync.ashx';
//var host = "http://117.6.131.222:4020";
var host = "http://localhost:5100";
var hostVicem = "http://vicem.s-work.vn";
//var hostVicem = "http://localhost:6002";


fm.websync.client.enableMultiple = true;
client = new fm.websync.client(webSyncHandleUrl);
client.setDisableCORS(true);
var current_channel = {};
var driverlist = { "driverId": 4045, "name": "AAA", "cdata": [105.0000, 21.07571], "status": 2 };
var robots = [];
var remoocs = [];
var tracktors = [];
var textArea;
var listRoom;
var mUtil;
var pins = [
    { name: "Romooc, Tam Long", pin: "RM" },
    { name: "Vicem", pin: "VC" },
    { name: "S-work", pin: "SW" }
]
var currentRoom = pins[1].pin;
var list = [10000];
var data;
var map, polygon, id;
id = 0;
carSourceVector = new ol.source.Vector({
    features: []

});
var addMarker = function (data) {
    drawMarkerExist(data);
}

//var addMarker1 = function (data) {
//    var data1 = data;
//    var count = 0;
//    setInterval(() => {
//        drawMarkerExist1(data1, count);
//        count++;
//    }, 5000)
//}
var addMarker1 = function (data) {
    drawMarkerExist1(data);
}

$(document).ready(function () {
    textArea = document.getElementById('log_id');
    textArea.innerHTML = "";
    
    for (var i = 0; i < pins.length; i++) {
        $('#listRoom')
            .append($("<option>")
                .attr("class", 'list-group-item')
                .attr("data-customvalue", pins[i].pin)
                .attr("value", pins[i].pin + " - " + pins[i].name));
    }
    oninput = 'onInput()';

    //$.ajax({
    //    type: "GET",
    //    dataType: "json",
    //    url: host+"/PingMeMonitor/GetRooms",
    //    success: function (data) {
    //        listRoom = data;
    //        console.log(data);
    //        for (var i = 0; i < listRoom.length; i++) {
    //            $('#listRoom')
    //                .append($("<option>")
    //                    .attr("class", 'list-group-item')
    //                    .attr("data-customvalue", listRoom[i].District_channel)
    //                    .attr("value", listRoom[i].District_channel + " - " + listRoom[i].District_name));
    //        }
       
    //        //oninput = 'onInput()' 
    //    },
    //    failure: function (data) {
    //        console.log(data);
    //    }
    //});

    //$.ajax({
    //    type: "GET",
    //    dataType: "json",
    //    url: host+"/PingMeMonitor/GetRobots",
    //    success: function (data) {
    //        robots = data;
    //        console.log(data);
    //        for (var i = 0; i < robots.length; i++) {
                
    //            $('#listNodeStart')
    //                .append($("<option>")
    //                    .attr("class", 'list-group-item')
    //                    .attr("data-customvalue", robots[i].Username)
    //                    .attr("value", robots[i].Displayname));
    //        }

    //        //oninput = 'onInput()' 
    //    },
    //    failure: function (data) {
    //        console.log(data);
    //    }
    //});

    $.ajax({
        type: "POST",
        dataType: "json",
        url: hostVicem + "/Admin/Monitor/getTestUser",
        success: function (data) {
            debugger
            robots = data;
            console.log(data);
            var id = 0;
            for (var i = 0; i < robots.length; i++) {
                robots[i].Id = i;
                $('#listNodeStart')
                    .append($("<option>")
                        .attr("class", 'list-group-item')
                        .attr("data-customvalue", robots[i].Username)
                        .attr("value", robots[i].GivenName));

                //$('#listNodeStart')
                //    .append($("<option>")
                //        .attr("class", 'list-group-item')
                //        .attr("data-customvalue", i)
                //        .attr("value", robots[i].GivenName));
            }

            //oninput = 'onInput()' 
        },
        failure: function (data) {
            console.log(data);
        }
    });
 
});

getImagebyStatus = function (status) {
    if (status == 1) {
        return "lib/assets/layouts/monitor/image/car_grey.png";
    }
    if (status == 2) {

        return "lib/assets/layouts/monitor/image/car.png";
    }
    //if(status != 1  && status != 2){

    //    return "lib/assets/layouts/monitor/image/car_grey.png";
    //}
}
//
function initMap() {
    var uluru = { lat: 20.99093210090554, lng: 105.80906867980957 };
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            rotation: 0,
            src: 'lib/assets/layouts/monitor/image/check.png'
        }))
    });
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([105.81022739410399, 20.99113243756568], 'EPSG:4326',
       'EPSG:3857')),
        name: 'Hạ Đình',
        population: 4000,
        rainfall: 500,
        style: iconStyle
    });
    iconFeature.setId(1);
    iconFeature.setStyle(iconStyle);
    var vectorSource = new ol.source.Vector({
        features: [iconFeature]
    });
    console.log("idL133333: " + vectorSource.getFeatureById(1).get('name'));


    var vectorLayerMarker = new ol.layer.Vector({
        source: vectorSource
    });
    // car layer
    
    
    carLayerMarker = new ol.layer.Vector({
        source: carSourceVector
    });
    carLayerMarker.setZIndex(2);
    // path layer
    pathSourceVector = new ol.source.Vector({
        features: []
    });
    pathLayerMarker = new ol.layer.Vector({
        source: pathSourceVector
    });
    var view1 = new ol.View({
        //	center : ol.proj.fromLonLat([105.810227394,20.991132437]),
        center: ol.proj.fromLonLat([105.8102273, 20.99113243]),
        zoom: 12
    });
    var googleLayer = new ol.layer.Tile({
        source: new ol.source.OSM({
            url: 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            attributions: [
                new ol.Attribution({ html: '© Google' }),
                new ol.Attribution({ html: '<a href="https://developers.google.com/maps/terms">Terms of Use.</a>' })
            ]
        })
    });
    map = new ol.Map({
        target: 'map',
        layers: [
            googleLayer,
            vectorLayerMarker,
            carLayerMarker
        ],
        view: view1
    });
    map.on('moveend', checknewzoom);
   
    element = document.getElementById('popupBooking');
    popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
    });
    map.addOverlay(popup);

    map.on('click', function (evt) {
        var coordinatez = evt.coordinate;
        var hdms = ol.proj.transform(coordinatez, 'EPSG:3857', 'EPSG:4326');
        console.log(hdms);

        if ($('#coorx1').val() == null || $('#coorx1').val() == "") {
            $('#coorx1').val(hdms[1]);
            $('#coory1').val(hdms[0]);
        }
        else {
            $('#coorx2').val(hdms[1]);
            $('#coory2').val(hdms[0]);
        }
    });
    // var element = popup.getElement();
    // popup.setPosition([11772998.295847073,2390238.343688335]);
    // $(element).popover({
    // 'placement': 'top',
    // 'html': true,
    // 'content': "ThuLuu"
    // });
    // $(element).popover('show');
    //$.ajax({
    //    type: "POST",
    //    dataType: "json",
    //    url: "/Driver/GetAllDriverId",
    //    success: function (data) {
    //        var listDriver = data.Object;
    //        console.log(listDriver)
    //        for (var i = 0; i < listDriver.length; i++) {
    //            $('#listNodeStart')
    //                .append($("<option>")
    //                    .attr("class", 'list-group-item')
    //                    .attr("data-customvalue", data.Object[i].Id)
    //                    .attr("value", listDriver[i].Name));
    //        }
    //    }
    //});
}

var drawMarkerExist = function (data) {

    //var book = data.bookUserSend;
    var id = parseInt(book.fromID);
    console.log(" -------------> ");
    console.log(data);
    console.log(" <---------------------------------------------------------------------------------------------------------");
        if (data != null) {
            if (carSourceVector.getFeatureById(id) != null) {
                var feature1 = carSourceVector.getFeatureById(id);
                var coord = feature1.getGeometry().getCoordinates();
                coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
                var lon = coord[0];
                var lat = coord[1];
                if (Contains(book.location[1], book.location[0], polygon)) {
                    var bear = bearing(lat, lon, book.location[0], book.location[1]);
                    var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                        'EPSG:3857'));

                    var style = carSourceVector.getFeatureById(id).getStyle();

                    carSourceVector.getFeatureById(id).setGeometry(lonlat3857);
                    carSourceVector.getFeatureById(id).set("name", "Đây là tên người lái");
                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                            anchor: [0.5, 0.5],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            rotation: bear,
                            src: 'lib/assets/layouts/monitor/image/car.png'
                        }))
                    });
                    carSourceVector.getFeatureById(id).setStyle(iconStyle);
                }
                else {
                    var fea = carSourceVector.getFeatureById(id);
                    carSourceVector.removeFeature(fea);
                }

            }
            else if (carSourceVector.getFeatureById(id) == null) {
                if (Contains(book.location[1], book.location[0], polygon)) {
                    var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                        'EPSG:3857'));
                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                            anchor: [0.5, 0.5],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            rotation: 0,
                            src: 'lib/assets/layouts/monitor/image/car.png'
                        }))
                    });

                    var iconFeature = new ol.Feature({
                        geometry: lonlat3857,
                        name: "" /*+ "_" + data.location_message.channel*/,
                        population: 4000,
                        rainfall: 500,
                        style: iconStyle
                    });
                    iconFeature.setId(id);
                    iconFeature.setStyle(iconStyle);
                    carSourceVector.addFeature(iconFeature);
                }
            }
        }
    
}

var drawMarkerExist1 = function (data) {
    console.log('HH');
    console.log(data);
    if (data != null && carSourceVector.getFeatureById(data.driverId) != null) {
        
        var lonlat3857 = new ol.geom.Point(ol.proj.transform(data.cdata, 'EPSG:4326',
            'EPSG:3857'));
        console.log('HG');
        console.log(lonlat3857);
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                src: 'http://sohanews.sohacdn.com/thumb_w/660/2017/photo1486969199024-1486969199175-0-32-308-529-crop-1486969281069.jpg'
            }))
        });

        var iconFeature = new ol.Feature({
            geometry: lonlat3857,
            name: data.name,
            population: 4000,
            rainfall: 500,
            style: iconStyle
        });
        iconFeature.setId(data.driverId);
        iconFeature.setStyle(iconStyle);
       
        carSourceVector.clear();
        carSourceVector.addFeature(iconFeature);
        var field_location = carSourceVector.getFeatureById(data.driverId).getProperties();
        var field_extent = field_location.geometry.getExtent();
        map.getView().fit(field_extent, map.getSize());
        map.getView().setZoom(15);
        
    }
    else if (data != null && carSourceVector.getFeatureById(data.driverId) == null) {
        //--------------------------------------------
        var lonlat3857 = new ol.geom.Point(ol.proj.transform(data.cdata, 'EPSG:4326',
            'EPSG:3857'));
        console.log('HG');
        console.log(lonlat3857);
        //   var carFeature = renderCarFeature(lonlat3857,data.id);
        //console.log("22222222222222222222222222222222222222" + data.location_message.status)
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                src: 'http://sohanews.sohacdn.com/thumb_w/660/2017/photo1486969199024-1486969199175-0-32-308-529-crop-1486969281069.jpg'
            }))
        });

        var iconFeature = new ol.Feature({
            geometry: lonlat3857,
            name: data.name,
            population: 4000,
            rainfall: 500,
            style: iconStyle
        });
        iconFeature.setId(data.driverId);
        iconFeature.setStyle(iconStyle);
        carSourceVector.clear();
        carSourceVector.addFeature(iconFeature);
        var field_location = carSourceVector.getFeatureById(data.driverId).getProperties();
        var field_extent = field_location.geometry.getExtent();
        map.getView().fit(field_extent, map.getSize());
        map.getView().setZoom(12);
        
    }
}

var drawMarkerExistRm = function (data) {
    
    try {
        //var book = data.bookUserSend;
        var id = data.locationMessage.driverId;
        //console.log(" -------------> ");
        //console.log(data);
        //console.log(" <---------------------------------------------------------------------------------------------------------");
        var book = {
            location: [data.locationMessage.latitude, data.locationMessage.longitude]
        };
        if (data != null) {
            if (carSourceVector.getFeatureById(id) != null) {
                var feature1 = carSourceVector.getFeatureById(id);
                var coord = feature1.getGeometry().getCoordinates();
                coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
                var lon = coord[0];
                var lat = coord[1];
                if (Contains(book.location[1], book.location[0], polygon)) {
                    var bear = bearing(lat, lon, book.location[0], book.location[1]);
                    var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                        'EPSG:3857'));

                    var style = carSourceVector.getFeatureById(id).getStyle();

                    carSourceVector.getFeatureById(id).setGeometry(lonlat3857);
                    carSourceVector.getFeatureById(id).set("name", "Đây là tên người lái");
                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                            anchor: [0.5, 0.5],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            rotation: bear,
                            src: 'https://www.upsieutoc.com/images/2019/03/18/car.png'
                        }))
                    });
                    carSourceVector.getFeatureById(id).setStyle(iconStyle);
                }
                else {
                    var fea = carSourceVector.getFeatureById(id);
                    carSourceVector.removeFeature(fea);
                }

            }
            else if (carSourceVector.getFeatureById(id) == null) {
                if (Contains(book.location[1], book.location[0], polygon)) {
                    var lonlat3857 = new ol.geom.Point(ol.proj.transform([book.location[1], book.location[0]], 'EPSG:4326',
                        'EPSG:3857'));
                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                            anchor: [0.5, 0.5],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            rotation: 0,
                            src: 'lib/assets/layouts/monitor/image/car.png'
                        }))
                    });

                    var iconFeature = new ol.Feature({
                        geometry: lonlat3857,
                        name: "" /*+ "_" + data.location_message.channel*/,
                        population: 4000,
                        rainfall: 500,
                        style: iconStyle
                    });
                    iconFeature.setId(id);
                    iconFeature.setStyle(iconStyle);
                    carSourceVector.addFeature(iconFeature);
                }
            }
        }
    }
    catch (ex) {
        console.log(data);
    }
}

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
                    // console.log("subcribe successx: "+channel);
                    //	util.log('subcribe success to WebSync.')
                },
                onFailure: function (args) {
                    // console.log("subcribe failed: "+args.channel);
                },
                onReceive: function (args) {    
                    var dataDriver = args.getData();
                    console.log("onReceive-----------");
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
    allUserOrder = {};
    allClientMap = {};
    allClientArr = [];

    client.connect({
        onSuccess: function (args) {
            chatObject.clientId = args.clientId;
        },
        onFailure: function (args) {

        }
    });

    util.subcribe();
    //changeRoom("VN.HN.TX");
});

function removeAllMarker() {
    carSourceVector.clear()
}

function changeRoom(room) {
    client.unsubscribe({
        channel: '/' + currentRoom,
        onSuccess: function (args) {
        },
        onFailure:

        function (args) {

        }

    });
    removeAllMarker();
    currentRoom = room;
    client.subscribe({
        channel: '/' + currentRoom,
        onSuccess: function (args) {
            console.log("subcribe successx: " + currentRoom);
            //	util.log('subcribe success to WebSync.')
            textArea.innerHTML = "";
        },
        onFailure: function (args) {
            // console.log("subcribe failed: "+args.channel);
        },
        onReceive: function (args) {
            var dataDriver = args.getData();
            console.log("onReceive++++++++++++++");
            drawMarkerExist(dataDriver);
        }
    });
}
function onInput() {
    var val = document.getElementById("count1").value;
    var res = val.split(" - ");
    var arr = res[0].split(".");
    if (arr.length == 3) {
        console.log(res[0]);
        changeRoom(res[0]);
        console.log('room mới: '+res[0]);
    }
}

function remove(data) {
    var data1;
    var user_name = "";
    for (var i = 0; i < list.length; ++i) {
        console.log(list[i]);
        try {
            if (list[i] != null && list[i] != undefined && list[i].location_message.driverId == data) {
                data1 = list[i];
                user_name = data1.location_message.driverName;
                break;
            }
        }
        catch (ex) {

        }
    }

    data1.type = -99999;
    if (confirm("Có chắc đuổi tài xế " + user_name + " không?")) {
        var element = document.getElementById("" + data);
        element.classList.add("gone");
        client.publish({
            channel: '/warehouse',
            data: data1,
            onSuccess: function (args) {
                var element = document.getElementById("" + data);
                element.classList.add("gone");
                console.log("send success");
                ///   util.clear(dom.text);
            }
        });

    } else {

    }
}
function runRobot(robotCode) {
    console.log(robotCode);
    var robotId = -1;
    for (var item = 0; item < robots.length; item++) {
        if (robots[item].Username == robotCode) {
            robotId = robots[item].Id;
        }
    }
    var MapDataWebsync = {
        type: -999,
        from: "monitor",
        locationMessage: {
            driverId: robotId
        }
    }
    console.log(MapDataWebsync);
    client.publish({
        channel: '/'+currentRoom,
        data: MapDataWebsync,
        onSuccess: function (args) {
            console.log("send success");
        }
    });
}
function stopRobot(robotCode) {
    console.log(robotCode);
    var robotId = -1;
    for (var item = 0; item < robots.length; item++) {
        if (robots[item].Username == robotCode) {
            robotId = robots[item].Id;
        }
    }
    var MapDataWebsync = {
        type: -888,
        from: "monitor",
        locationMessage: {
            driverId: robotId
        }
    }
    client.publish({
        channel: '/' + currentRoom,
        data: MapDataWebsync,
        onSuccess: function (args) {
            console.log("send success");
        }
    });
}
function finishRobot(robotCode) {
    var robotId = -1;
    for (var item = 0; item < robots.length; item++) {
        if (robots[item].Username == robotCode) {
            robotId = robots[item].Id;
        }
    }
    var MapDataWebsync = {
        type: -777,
        from: "monitor",
        locationMessage: {
            driverId: robotId
        }
    }
    client.publish({
        channel: '/' + currentRoom,
        data: data,
        onSuccess: function (args) {
            console.log("send success");
        }
    });
}

function Smonitor() {
    
    var roomPos = $('#count1').val();
    var roomCode = $('#listRoom [value="' + roomPos + '"]').data('customvalue');

    var remoocPos = $('#count2').val();
    var remoocCode = $('#listRemooc [value="' + remoocPos + '"]').data('customvalue');

    var robotPos = $('#count3').val();
    var robotCode = $('#listNodeStart [value="' + robotPos + '"]').data('customvalue');

    var tracktorPos = $('#count4').val();
    var tracktorCode = $('#listTracktor [value="' + tracktorPos + '"]').data('customvalue');

    console.log("room Code: " + roomCode);
    console.log("remooc Code: " + remoocCode);
    console.log("robot Code: " + robotCode);
    console.log("tracktor Code: " + tracktorCode);

    var coorx1 = $('#coorx1').val();
    var coory1 = $('#coory1').val();
    var coorx2 = $('#coorx2').val();
    var coory2 = $('#coory2').val();
    var robotId = -1;
    var road = "";
    for (var item = 0; item < robots.length;item++) {
        if (robots[item].Username == robotCode) {
            robotId = robots[item].Id;
            road = robots[item].Road;
        }
    }
    
    var mData = {
        Room: roomCode,
        driverId: robotId,
        userName: robotCode,
        DriverName: robotPos,
        RemoocId: remoocCode,
        RemoocName: robotPos,
        tracktorId: tracktorCode,
        Lat1: coorx1,
        Lng1: coory1,
        Lat2: coorx2,
        Lng2: coory2,
        road: road
    };
    console.log(mData);
    $.ajax({
        type: "POST",
        dataType: "json",
        crossDomain: true,
        url: "http://117.6.131.222:4037/RmCreateClientBot",
        data: mData,
        //+ "?Room=" + roomCode + "&driverId="+robotCode+ "&DriverName=" + robotPos + "&RemoocId=" + remoocCode
        //+ "&RemoocName=" + remoocPos + "&tracktorId=" + tracktorCode + "&tracktorName="+tracktorPos
        //+ "&lat1=" + coorx1
        //+ "&lng1=" + coory1
        //+ "&lat2=" + coorx2
        //+ "&lng2=" + coory2,
        success: function (data) {
            console.log(data);
            var html = '<tr><td class="text-center">' + robotCode + '</td>'
                + '< td class="text-center" > ' + robotCode + '</td>'
                + '<td <label onclick=runRobot("' + robotCode + '")> <a>Start</a></label ></td>'
                + '<td <label onclick=stopRobot("' + robotCode + '")> <a>Stop</a></label ></td>'
                + '<td><label onclick=finishRobot("' + robotCode + '")> <a>Finish</a></label >'
                + '</td ></tr > </tr>';
            $('#tableDriver').append(html)
        },
        fail: function (data) {
            console.log("1111");
        }
    });
}

// Xét các tọa độ thuộc polygon
function Contains(x, y, points) {
    var j = 0;
    var oddNodes = false;
    /*
    var splPoint1 = p.split(':');
    var splitPoint = splPoint1[0].split(',').map(function (item) {
        return parseFloat(item);
    });

    var x = splitPoint[1], y = splitPoint[0];
    */
    
    for (i in points) {

        j++;
        if (j == points.length) { j = 0; }
        if (((points[i]['lat'] < y) && (points[j]['lat'] >= y))
            || ((points[j]['lat'] < y) && (points[i]['lat'] >= y))) {
            if (points[i]['lng'] + (y - points[i]['lat'])
                / (points[j]['lat'] - points[i]['lat'])
                * (points[j]['lng'] - points[i]['lng']) < x) {
                oddNodes = !oddNodes
            }
        }
    }
    //console.log('check: ' + oddNodes);
    return oddNodes;
}


// Lấy tọa độ 4 góc theo map
var getCoordinate = function () {

    var bounds = map.getBounds();
    var x1 = bounds.getNorthEast().lat();
    var y1 = bounds.getNorthEast().lng();
    var x2 = bounds.getSouthWest().lat();
    var y2 = bounds.getSouthWest().lng()

    polygon =
        [{ lat: x1, lng: y1 },
        { lat: x1, lng: y2 },
        { lat: x2, lng: y2 },
        { lat: x2, lng: y1 },
        { lat: x1, lng: y1 }];
}

// Sự kiện kéo map
var checknewzoom = function () {
    var newZoomLevel = map.getView().getZoom();
    console.log("newZoomLevel: " + newZoomLevel);
    var bounds = map.getView().calculateExtent(map.getSize());
    var extent = ol.proj.transformExtent(bounds, 'EPSG:3857', 'EPSG:4326');
     polygon =
        [{ lat: extent[1], lng: extent[2] },
        { lat: extent[3], lng: extent[2] },
        { lat: extent[3], lng: extent[0] },
        { lat: extent[1], lng: extent[0] },
        { lat: extent[1], lng: extent[2] }];
     
    

}

var draw = function (x,y,id) {
    var lonlat3857 = new ol.geom.Point(ol.proj.transform([y,x], 'EPSG:4326',
        'EPSG:3857'));
    //   var carFeature = renderCarFeature(lonlat3857,data.id);
    // console.log("22222222222222222222222222222222222222")
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            rotation: 0,
            src: 'lib/assets/layouts/monitor/image/car.png'
        }))
    });

    var iconFeature = new ol.Feature({
        geometry: lonlat3857,
        name: "" /*+ "_" + data.location_message.channel*/,
        population: 4000,
        rainfall: 500,
        style: iconStyle
    });
    iconFeature.setId(id);
    iconFeature.setStyle(iconStyle);
    carSourceVector.addFeature(iconFeature);
}


