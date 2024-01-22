var webSyncHandleUrl = 'http://117.6.131.222:8089/websync.ashx';
fm.websync.client.enableMultiple = true;
client = new fm.websync.client(webSyncHandleUrl);
client.setDisableCORS(true);


var current_channel = {};
var addMarker = function (data) {
    drawMarkerExist(data);
    if (data != null && allClientMap[data.id] != null) {

    }

}

getImagebyStatus = function (status, channel) {
    if (status != 0) {
        return "image/car_grey.png";

    }
    if (status == 0 && channel == "VN.HN.TX") {

        return "image/car.png";
    }
    if (status == 0 && channel != "VN.HN.TX") {

        return "image/car_green.png";
    }
}

var drawMarkerExist = function (data) {
    if (data != null && carSourceVector.getFeatureById(data.id) != null) {
        var feature1 = carSourceVector.getFeatureById(data.id);
        var coord = feature1.getGeometry().getCoordinates();
        coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
        var lon = coord[0];
        var lat = coord[1];
        var bear = bearing(lat, lon, data.lonlat[1], data.lonlat[0]);
        // var bear= getBearing(lat,lon,data.lonlat[1],data.lonlat[0]);
        // console.log("bear: "+bear);
        var lonlat3857 = new ol.geom.Point(ol.proj.transform(data.lonlat, 'EPSG:4326',
            'EPSG:3857'));
        carSourceVector.getFeatureById(data.id).setGeometry(lonlat3857);
        carSourceVector.getFeatureById(data.id).set("name", data.username + "_" + data.channel);
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: bear,
                src: getImagebyStatus(data.status, data.channel)
            }))
        });
        carSourceVector.getFeatureById(data.id).setStyle(iconStyle);
        // console.log("method: " +carSourceVector.getFeatureById(data.id).get("style"));
    }
    else if (data != null && carSourceVector.getFeatureById(data.id) == null) {
        //--------------------------------------------
        var lonlat3857 = new ol.geom.Point(ol.proj.transform(data.lonlat, 'EPSG:4326',
            'EPSG:3857'));
        //   var carFeature = renderCarFeature(lonlat3857,data.id);
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                src: getImagebyStatus(data.status)
            }))
        });

        var iconFeature = new ol.Feature({
            geometry: lonlat3857,
            name: data.username + "_" + data.channel,
            population: 4000,
            rainfall: 500,
            style: iconStyle
        });
        iconFeature.setId(data.id);
        iconFeature.setStyle(iconStyle);
        carSourceVector.addFeature(iconFeature);
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
                channel: '/' + channel,
                onSuccess: function (args) {
                    // console.log("subcribe successx: "+channel);
                    //	util.log('subcribe success to WebSync.')
                },
                onFailure: function (args) {
                    // console.log("subcribe failed: "+args.channel);
                },
                onReceive: function (args) {
                    console.log("Data Romooc" + JSON.stringify(args.getData()))
                    //dataDriver = args.getData();
                    receiveQueue.enqueue(args.getData());
                    //addMarker(dataDriver);
                    //console.log("subcribe failed: " + JSON.stringify(receiveQueue));
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


    util.subcribe("romooc");
});