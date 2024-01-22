var _toRad = function(deg) {
    return deg * Math.PI / 180;
}

/**
 * Since not all browsers implement this we have our own utility that will
 * convert from radians into degrees
 *
 * @param rad - The radians to be converted into degrees
 * @return degrees
 */
var _toDeg = function(rad) {
    return rad * 180 / Math.PI;
}
bearing = function (lat1,lng1,lat2,lng2) {
    var dLon = (lng2-lng1);
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    var brng = this._toDeg(Math.atan2(y, x));
    var deg= 360 - ((brng + 360) % 360);
   return _toRad(deg);
}

function radians(n) {
    return n * (Math.PI / 180);
}
function degrees(n) {
    return n * (180 / Math.PI);
}

function getBearing(startLat,startLong,endLat,endLong){
    startLat = radians(startLat);
    startLong = radians(startLong);
    endLat = radians(endLat);
    endLong = radians(endLong);

    var dLong = endLong - startLong;

    var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
    if (Math.abs(dLong) > Math.PI){
        if (dLong > 0.0)
            dLong = -(2.0 * Math.PI - dLong);
        else
            dLong = (2.0 * Math.PI + dLong);
    }

    return (degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
}


    car_url="../image/car.png";
    renderCarStyke= function () {
       return new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                src: car_url
            }))
        });
    }

    renderCarFeature= function (lonlat3857,id) {

       var feature=    new ol.Feature({
            geometry:lonlat3857 ,
            name: 'Null Island',
            population: 4000,
            rainfall: 500
        });
        feature.setId(id);
        feature.setStyle(new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                rotation: 0,
                src: car_url
            }))
        }));

        return feature;
    }
getRandomInt= function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
color = ["rgba(70, 191, 63, 0.8)","rgba(50, 100, 21, 0.8)","rgba(98, 233, 72, 0.8)","rgba(250, 140, 140, 0.8)","rgba(145, 20, 74, 0.8)"];
//Coordinate to Path layer -----------------------------
stylePath = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: color[getRandomInt(0,4)],
        width: 4,
        opacity: 0.5
    })
});
renderStylePath = function(){
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: color[getRandomInt(0,4)],
            width: 4,
            opacity: 0.5
        })
    });
}
renderLineStringFeature = function (coordinates) {
    var coordinates3857 = [];
    for (var i = 0; i < coordinates.length; i++) {
        coordinates3857.push(ol.proj.transform([parseFloat(coordinates[i][1]), parseFloat(coordinates[i][0])], 'EPSG:4326', 'EPSG:3857'))
    }
    var lineStringFeature = new ol.Feature({
        geometry: new ol.geom.LineString(coordinates3857),
        name: 'Path'
    });
    lineStringFeature.setStyle(renderStylePath);
    return lineStringFeature;
}
renderLinePathSource = function (coordinates) {
    var iconFeatures = [];
    iconFeatures.push(renderLineStringFeature(coordinates));
    return new ol.source.Vector({
        features: iconFeatures
    });
};
renderLinePathLayer = function (coordinates) {
    var result = new ol.layer.Vector({
        source: renderLinePathSource(coordinates)
    });
    result.setZIndex(1);
    return result;
};



