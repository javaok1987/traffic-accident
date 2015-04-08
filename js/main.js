var gmap = {
    map: {},

}

jQuery(function($) {

    google.maps.event.addDomListener(window, "load", function() {
        var mapOptions = {
            zoom: 11,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE]
            },
            panControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            panControl: false,
            center: new google.maps.LatLng(25.0172264, 121.506378) //全台23.714059, 120.832002
        };
        gmap.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        resizePanel();
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
    });


    $('input[type="checkbox"]').radiocheck();

    $("#map-panel").resizable({
        handles: "e",
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

    var dc
    $('input[type="checkbox"]').on("click", function() {
        $($(".box2")[$(this).val()]).toggle();
    })

});

function resizePanel() {
    $("#map-panel").height("100%");
    $("#chart-panel").width($(window).width() - ($("#map-panel").width() + $(".handler_vertical").width() + 30));
}
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
        radius: 45,
        dissipating: true,
    });
    heatmap.setMap(gmap.map);
    if (heatmap) {
        if (gmap.map.getZoom() > 13) {
            heatmap.setOptions({
                radius: 55
            })
        } else {
            heatmap.setOptions({
                radius: 25
            })
        }
    }
};
