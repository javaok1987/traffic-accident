var gmap = {
    map: {}
}

jQuery(function($) {

    google.maps.event.addDomListener(window, "load", function() {
        var mapOptions = {
            zoom: 12,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE]
            },
            disableDefaultUI: false,
            minZoom: 12,
            maxZoom: 16,
            center: new google.maps.LatLng(25.057910, 121.537963) //全台23.714059, 120.832002
        };
        gmap.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        resizePanel();
        $("#chart-panel").block({
            overlayCSS: {
                backgroundColor: "#ffffff",
                opacity: .5
            },
            css: {
                border: "0px"
            },
            message: "資料載入中<br><img src='./img/preloader-w8-cycle-black.gif'/>"
        });
        gmap.map.mapTypes.set("map_style", new google.maps.StyledMapType([{
            "stylers": [{
                "hue": "#dd0d0d"
            }]
        }, {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                "lightness": 100
            }, {
                "visibility": "simplified"
            }]
        }]));
        gmap.map.setMapTypeId("map_style");
        google.maps.event.addListener(gmap.map, 'zoom_changed', function() {
            heatmap.setOptions({
                radius: getNewRadius()
            });
        });
    });


    $('input[type="checkbox"]').radiocheck();

    $("#map-panel").resizable({
        handles: "e",
        maxWidth: $("#map-panel").width(),
        stop: function(event, ui) {
            // resizePanel();
            // google.maps.event.trigger(gmap.map, "resize");
        }
    });
    $(".ui-resizable-handle").addClass("handler_vertical")

    $(window).resize(function() {
        resizePanel();
        google.maps.event.trigger(gmap.map, "resize");
    });

    $('input[type="checkbox"]').on("click", function() {
        $($(".box2")[$(this).val()]).toggle();
    })

});

function resizePanel() {
    $("#map-panel").height("100%");
    $("#chart-panel").width($(window).width() - ($("#map-panel").width() + $(".handler_vertical").width() + 30));
}

var TILE_SIZE = 256;
var DESIRE_RADIUS_METER = 400;
var pointMVCArray = new google.maps.MVCArray();

function updateAccidentMap(data) {
    if (!pointMVCArray) {
        for (var i = 0, len = data.length; i < len; i++) {
            pointMVCArray.push(new google.maps.LatLng(data[i].lat, data[i].lng));
        }
    } else {
        pointMVCArray.clear();
        pointMVCArray = new google.maps.MVCArray();
        for (var i = 0, len = data.length; i < len; i++) {
            pointMVCArray.push(new google.maps.LatLng(data[i].lat, data[i].lng));
        }
    }
    addHeatMapLayer();

};

function addHeatMapLayer() {
    var gradient = ['rgba(0, 255, 255, 0)', 'rgba(0, 255, 255, 1)', 'rgba(0, 191, 255, 1)', 'rgba(0, 127, 255, 1)', 'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)', 'rgba(0, 0, 223, 1)', 'rgba(0, 0, 191, 1)', 'rgba(0, 0, 159, 1)', 'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)', 'rgba(127, 0, 63, 1)', 'rgba(191, 0, 31, 1)', 'rgba(255, 0, 0, 1)'
    ];
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: pointMVCArray,
        radius: getNewRadius(),
        dissipating: true,
    });
    heatmap.setMap(gmap.map);
};

function getNewRadius() {
    var numTiles = Math.pow(2, gmap.map.getZoom());
    var center = gmap.map.getCenter();
    var moved = google.maps.geometry.spherical.computeOffset(center, 10000, 90); /*1000 meters to the right*/
    var projection = new MercatorProjection();
    var initCoord = projection.fromLatLngToPoint(center);
    var endCoord = projection.fromLatLngToPoint(moved);
    var initPoint = new google.maps.Point(
        initCoord.x * numTiles,
        initCoord.y * numTiles);
    var endPoint = new google.maps.Point(
        endCoord.x * numTiles,
        endCoord.y * numTiles);
    var pixelsPerMeter = (Math.abs(initPoint.x - endPoint.x)) / 10000.0;
    var totalPixelSize = Math.floor(DESIRE_RADIUS_METER * pixelsPerMeter);
    return totalPixelSize;
}

//Mercator --BEGIN--
function bound(value, opt_min, opt_max) {
    if (opt_min !== null) value = Math.max(value, opt_min);
    if (opt_max !== null) value = Math.min(value, opt_max);
    return value;
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
}

function MercatorProjection() {
    this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2,
        TILE_SIZE / 2);
    this.pixelsPerLonDegree_ = TILE_SIZE / 360;
    this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
}

MercatorProjection.prototype.fromLatLngToPoint = function(latLng,
    opt_point) {
    var me = this;
    var point = opt_point || new google.maps.Point(0, 0);
    var origin = me.pixelOrigin_;

    point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;

    // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
    // 89.189.  This is about a third of a tile past the edge of the world
    // tile.
    var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999,
        0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_;
    return point;
};

MercatorProjection.prototype.fromPointToLatLng = function(point) {
    var me = this;
    var origin = me.pixelOrigin_;
    var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
    return new google.maps.LatLng(lat, lng);
};

//Mercator --END--
