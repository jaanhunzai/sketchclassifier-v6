var metricFileName;
var map_mm;
var MMisRoute = [];
var MMLandmarksIDs = [];
var MMRegionsIDs = [];
var deleteVar = 0;
var ArrowsArray = [];
var MMStreetIDs = [];
var drawnItems;
var arrowHead;
var MMGeoJsonData;
var labelLayer = null;


function loadMetricMap() {
    //var location = document.getElementById("metricmapplaceholder");
    var fileList = document.getElementById('MetrichMapInputbutton').files;

    $("metricmapplaceholder").hide();
    for (var i = 0; i < fileList.length; i++) {
        randerLoadedMMFile(fileList[i], location);
    }
}

function randerLoadedMMFile(file, location) {
    var reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function (e) {

        var container = L.DomUtil.get('map');
        if (container != null) {
            container._leaflet_id = null;
        }
        var image = new Image();
        console.log("i am here ");
        image.title = file.name;
        image.src = this.result;
        //document.getElementById('mm').src = image.src;

        map_mm = new L.map('metricmapplaceholder', {
            crs: L.CRS.Simple
        });

        map_mm.options.doubleClickZoom = false;

        var bounds = [[0, 0], [600, 850]];
        var MMLoaded = new L.imageOverlay(image.src, bounds);
        MMLoaded.addTo(map_mm);
        map_mm.fitBounds(bounds);

        metricFileName = image.title;


        /*   $.ajax({
               url: '/metricFileName',
               data: {metricFileName: metricFileName},
               success: function (resp) {
               }
           });*/
        loadEditingToolforMM(map_mm);

        $("#stepper_load_bm").prop("style", "background: #17a2b8");
    }

}


function uploadJsonMM() {
    var fileList = document.getElementById('importMetricFeatures').files;
    for (var i = 0; i < fileList.length; i++) {
        randerGeoJsonFilesMM(fileList[i], map_mm);
    }
}

function randerGeoJsonFilesMM(file, map_mm) {
    var fileName = file.name;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    //var loadedJsonLayer;
    reader.onload = function () {
        // load GeoJSON from an external file
        $.getJSON(reader.result, function (data) {
            //passing data to qualifier
            MMGeoJsonData = data;
            loadedJsonLayer = L.geoJson(data, {
                opacity: 0.5,
                onEachFeature: function (feature, layer) {
                    // give ids from MM for landmarks to SM
                    if (feature.geometry.type == "Polygon") {
                        if (feature.properties.feat_type == "Landmark") {
                            MMLandmarksIDs.push(feature.properties.id);
                        } else {
                            MMRegionsIDs.push(feature.properties.id);
                        }

                    }
                    // give ids from MM for streets to SM
                    else if (feature.geometry.type == "LineString") {
                        if (feature.properties.isRoute == "Yes") {
                            MMisRoute.push(feature.properties.id);
                        } else {
                            MMStreetIDs.push(feature.properties.id);
                        }
                    }
                }
            });
            map_mm.fitBounds(loadedJsonLayer.getBounds());
            loadJsonLayer_mm(map_mm);
        });
    }
}

function loadJsonLayer_mm(map_mm) {
    drawnItems = new L.FeatureGroup();
    loadedJsonLayer.eachLayer(
        function (l) {
            drawnItems.addLayer(l);
        }
    );
    drawnItems.eachLayer(function (layer) {
        if (layer.feature.geometry.type == "Polygon") {
            addLandmarkPopupMM(layer);

        }
        else if (layer.feature.geometry.type == "LineString" && layer.feature.properties.isRoute == null) {
            arrowHead = L.polylineDecorator(layer, {
                patterns: [
                    {
                        offset: 25,
                        repeat: 50,
                        endoffset: 0,
                        symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})
                    }
                ]
            }).addTo(map_mm);

            // push LayerGroup for arrows and layers in Array
            var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
            var Linie = [arrowsLayerGroup, layer, arrowHead];
            ArrowsArray.push(Linie);

            addStreetPopupMM(layer);
        } else if (layer.feature.geometry.type == "LineString" && layer.feature.properties.isRoute == 'Yes') {
            arrowHead = L.polylineDecorator(layer, {
                patterns: [
                    {
                        offset: 25,
                        repeat: 50,
                        endoffset: 0,
                        symbol: L.Symbol.arrowHead({
                            pixelSize: 15,
                            pathOptions: {fillOpacity: 1, weight: 0, color: 'red'}
                        })
                    }
                ]
            }).addTo(map_mm);

            // push LayerGroup for arrows and layers in Array
            var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
            var Linie = [arrowsLayerGroup, layer, arrowHead];
            ArrowsArray.push(Linie);

            layer.options.color = 'red';
            addStreetPopupMM(layer);
        }
    });
    $("#stepper_annotate_bm").prop("style", "background: #17a2b8");
    map_mm.addLayer(drawnItems);

}

/**
 * adding toolbar in the map
 * using leaflet plugin "leaflet.pm"
 * @param map
 * @returns
 */

function loadEditingToolforMM(map_mm) {

    drawnItems = new L.FeatureGroup();

    map_mm.addLayer(drawnItems);

    var options = {
        position: 'topleft',
        drawMarker: false,
        drawPolyline: true,
        drawRectangle: false,
        drawPolygon: true,
        drawCircle: false,
        cutPolygon: false,
        editMode: true,
        removalMode: true,
        finishOnDoubleClick: true,
        snapMiddle: false,

    };
    map_mm.pm.addControls(options);

    /**
     * now how drawing works
     * using again leaflet plugin "leaflet.pm"
     */
    map_mm.on('pm:create', function (event) {
        var layer = event.layer;
        var type = event.shape;
        feature = layer.feature = layer.feature || {};
        feature.type = feature.type || "Feature";
        var props = feature.properties = feature.properties || {};
        props.FID = null;
        props.id = null;
        props.isRoute = null;
        props.name = null;
        props.feat_type = null;
        props.sm_sk_type = "rectangle | olopololi | some stuff";
        props.descriptn = "something";

        drawnItems.addLayer(layer);

        if (type === "Line") {
            addStreetPopupMM(layer);
            layer.openPopup();

            // add Arrows to each line
            arrowHead = L.polylineDecorator(layer, {
                patterns: [
                    {
                        offset: 25,
                        repeat: 50,
                        endoffset: 0,
                        symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})
                    }
                ]
            }).addTo(map_mm);
            var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
            var Linie = [arrowsLayerGroup, layer, arrowHead];
            ArrowsArray.push(Linie);
        }
        if (type === "Poly") {
            addLandmarkPopupMM(layer);
            layer.openPopup();
        }
        $("#stepper_annotate_bm").prop("style", "background: #17a2b8");
    });

    map_mm.on('pm:remove', function (event) {
        var deleteButton = document.getElementsByClassName('leaflet-pm-icon-delete');
        var buttoncontrol = deleteButton[0].parentElement;

        // delete line and arrows from map
        if (buttoncontrol.classList.contains('active')) {
            loop1:
                for (var i = 0; i < ArrowsArray.length; i++) {
                    for (var j = 0; j < ArrowsArray[i].length; j++) {
                        if (event.layer._leaflet_id == ArrowsArray[i][j]._leaflet_id) {
                            if (j == 1) {
                                map_mm.removeLayer(ArrowsArray[i][j + 1]);
                                ArrowsArray.splice(i, 1);
                                break loop1;

                            } else if (j == 2) {
                                map_mm.removeLayer(ArrowsArray[i][j - 1]);
                                break loop1;
                            }
                        }
                    }
                }
        }
        layerid = event.layer._leaflet_id;
        deleteFunction();
    });

    function deleteFunction() {
        drawnItems.eachLayer(function (l) {
            jsonId = l._leaflet_id;

            if (layerid == jsonId) {
                drawnItems.removeLayer(l);
                // delete object from Route array
                if (l.feature.properties.isRoute == "Yes") {
                    for (i = 0; i < MMisRoute.length; i++) {
                        if (MMisRoute[i] == l.feature.properties.id) {
                            MMisRoute.splice(i, 1);
                            deleteVar = 1;
                        }
                    }
                    // delete object from Streets array
                } else {
                    for (i = 0; i < MMStreetIDs.length; i++) {
                        if (MMStreetIDs[i] == l.feature.properties.id) {
                            MMStreetIDs.splice(i, 1);
                            deleteVar = 1;
                        }
                    }
                }
                // delete object from Landmarks array
                if (l.feature.properties.feat_type == "Landmark") {
                    for (i = 0; i < MMLandmarksIDs.length; i++) {
                        if (MMLandmarksIDs[i] == l.feature.properties.id) {
                            MMLandmarksIDs.splice(i, 1);
                            deleteVar = 1;
                        }
                    }
                    // delte object from Regions array
                } else if (l.feature.properties.feat_type == "Cityblock") {
                    for (i = 0; i < MMRegionsIDs.length; i++) {
                        if (MMRegionsIDs[i] == l.feature.properties.id) {
                            MMRegionsIDs.splice(i, 1);
                            deleteVar = 1;
                        }
                    }
                }
            }
        });
    }

}


/**
 * the function create popUp that contains box for ID
 * and checkbox for being a segment as route part
 */
function addStreetPopupMM(layer_mm) {
    var popupContent = document.createElement('div');
    popupContent.id = "popupCOntent";
    var featurId = document.createElement("input");
    featurId.id = "featurId";
    var featurIdLabel = document.createElement("label");
    featurIdLabel.setAttribute = ("for", "featurId");
    featurIdLabel.appendChild(document.createTextNode('St_ID'));

    var labelRoute = document.createElement('label');
    labelRoute.id = "id";
    labelRoute.setAttribute = ("for", "isRoute");
    labelRoute.appendChild(document.createTextNode("RouteSegment?"));

    var isRoute = document.createElement("input");
    isRoute.type = "checkbox";
    isRoute.id = "isRoute";
    isRoute.name = "isRoute";
    isRoute.value = "No";

    // show the name of each object that is loaded from geoJson
    RouteType = layer_mm.feature.properties.isRoute;
    if (RouteType == "Yes") {
        isRoute.checked = true;
    }

    popupContent.append(featurIdLabel);
    popupContent.append(featurId);
    popupContent.append(labelRoute);
    popupContent.append(isRoute);
    layer_mm.bindPopup(popupContent);

    var popup = layer_mm.getPopup();
    popup.options.maxHeight = 250;
    popup.options.maxWidth = 350;

    // handling of the checkbox for the "RouteSegment" statetment
    var popupStreets;
    isRoute.addEventListener("click", clickedFunction, false);

    function clickedFunction() {
        if (isRoute.checked == true) {
            isRoute.setAttribute("value", "Yes");
            layer_mm.feature.properties.isRoute = isRoute.value;
            changeColor(layer_mm);
        } else if (isRoute.checked == false) {
            isRoute.setAttribute("value", null);
            layer_mm.feature.properties.isRoute = isRoute.value;
            changeColorBack(layer_mm);
        }
    }

    layer_mm.on("popupopen", function () {
        featurId.value = layer_mm.feature.properties.id;
        isRoute.value = layer_mm.feature.properties.isRoute;
        featurId.focus();
    });


    var closedLayer;
    layer_mm.on("popupclose", function () {
        if (featurId.value == '') {
            alert("ERROR! Do not forget to give the street a name!");
        } else {
            layer_mm.feature.properties.id = featurId.value;
            layer_mm.feature.properties.FID = featurId.value;
            layer_mm.feature.properties.name = featurId.value;

            if (deleteVar == 0) {
                /**
                 *  if id from object is already in Streets array
                 *  but is labelled as Route
                 *  than delete id from Streets array and add it to Route array
                 */
                if (MMStreetIDs.includes(layer_mm.feature.properties.id)) {
                    if (isRoute.value == "Yes") {
                        for (i = 0; i < MMStreetIDs.length; i++) {
                            if (MMStreetIDs[i] == layer_mm.feature.properties.id) {
                                MMStreetIDs.splice(i, 1);
                                MMisRoute.push(layer_mm.feature.properties.id);
                            }
                        }
                    }
                    /**
                     *  if id from object is already in Route array
                     *  but is note labelled as Route anymore
                     *  than delete id from Routes array and add it to Streets array
                     */
                } else if (MMisRoute.includes(layer_mm.feature.properties.id)) {
                    if (isRoute.value == "Yes") {
                    } else {
                        for (i = 0; i < MMisRoute.length; i++) {
                            if (MMisRoute[i] == layer_mm.feature.properties.id) {
                                MMisRoute.splice(i, 1);
                                MMStreetIDs.push(layer_mm.feature.properties.id);
                            }
                        }
                    }
                    /**
                     *  if id from object is neither in Streets nor in Route array
                     *  than add it to the corresponding array
                     */
                } else {
                    if (layer_mm.feature.properties.isRoute == "Yes") {
                        MMisRoute.push(layer_mm.feature.properties.id);
                        arrowHead.options.patterns[0].symbol.options.pathOptions.color = "red";
                    } else {
                        MMStreetIDs.push(layer_mm.feature.properties.id);
                    }
                }
            } else {
                deleteVar = 0;
            }
        }

    })
}

//###################################################
// add popup for the drawn landmarks
function addLandmarkPopupMM(layer_mm) {
    var popupContent = document.createElement('div');
    popupContent.id = "popupCOntent";
    var featurId = document.createElement("input");
    featurId.id = "featurId";
    var featurIdLabel = document.createElement("label");
    featurIdLabel.setAttribute = ("for", "featurId");
    featurIdLabel.appendChild(document.createTextNode('LM_ID'));


    var islandmarkCityblock = document.createElement('div');

    var labelLandmark = document.createElement('label');
    labelLandmark.id = "id";
    labelLandmark.setAttribute = ("for", "isLandmark");
    labelLandmark.appendChild(document.createTextNode("is_Landmark?"));

    var isLandmark = document.createElement("input");
    isLandmark.type = "checkbox";
    isLandmark.id = "isLandmark";
    isLandmark.name = "isLandmark";
    isLandmark.value = "null";

    // show the name of each object that is loaded from geoJson
    featureType = layer_mm.feature.properties.feat_type;
    if (featureType == "Landmark") {
        isLandmark.checked = true;
    }

    var labelCityblock = document.createElement('label');
    labelCityblock.id = "id";
    labelCityblock.setAttribute = ("for", "isCityblock");
    labelCityblock.appendChild(document.createTextNode("is_Region?"));

    var isCityblock = document.createElement("input");
    isCityblock.type = "checkbox";
    isCityblock.id = "isCityblock";
    isCityblock.name = "isCityblock";
    isCityblock.value = "null";

    // show the name of each object that is loaded from geoJson
    if (featureType == "Cityblock") {
        isCityblock.checked = true;
    }

    var br = document.createTextNode("         ");
    islandmarkCityblock.append(labelLandmark)
    islandmarkCityblock.append(isLandmark)
    islandmarkCityblock.append(br);
    islandmarkCityblock.append(labelCityblock)
    islandmarkCityblock.append(isCityblock)

    popupContent.append(featurIdLabel);
    popupContent.append(featurId);
    popupContent.append(islandmarkCityblock);

    layer_mm.bindPopup(popupContent);

    // handling of the checkbox for the "Landmark" statetment
    isLandmark.addEventListener("click", clickedFunction1, false);

    function clickedFunction1() {
        if (isLandmark.checked == true) {
            isLandmark.setAttribute("value", "Landmark");
            layer_mm.feature.properties.feat_type = isLandmark.value;
            isCityblock.checked = false;
        } else if (isLandmark.checked == false) {
            isCityblock.checked = true;
            isCityblock.setAttribute("value", "Cityblock");
            layer_mm.feature.properties.feat_type = isCityblock.value;
        }
    }

    // handling of the checkbox for the "Region" statetment
    isCityblock.addEventListener("click", clickedFunction2, false);

    function clickedFunction2() {
        if (isCityblock.checked == true) {
            isCityblock.setAttribute("value", "Cityblock");
            layer_mm.feature.properties.feat_type = isCityblock.value;
            isLandmark.checked = false;
        } else if (isCityblock.checked == false) {
            isLandmark.checked = true;
            isLandmark.setAttribute("value", "Landmark");
            layer_mm.feature.properties.feat_type = isCityblock.value;
        }
    }

    layer_mm.on("popupopen", function () {
        featurId.value = layer_mm.feature.properties.id;
        isCityblock.value = layer_mm.feature.properties.feat_type;
        featurId.focus();
    });

    layer_mm.on("popupclose", function () {
        if (featurId.value == '') {
            alert("ERROR! Do not forget to give the landmark/ region a name!");
        } else {
            layer_mm.feature.properties.id = featurId.value;
            layer_mm.feature.properties.FID = featurId.value;
            layer_mm.feature.properties.name = featurId.value;

            if (MMLandmarksIDs.includes(layer_mm.feature.properties.id)) {
                if (layer_mm.feature.properties.feat_type == "Cityblock") {
                    for (i = 0; i < MMLandmarksIDs.length; i++) {
                        if (MMLandmarksIDs[i] == layer_mm.feature.properties.id) {
                            MMLandmarksIDs.splice(i, 1);
                            MMRegionsIDs.push(layer_mm.feature.properties.id);
                        }
                    }

                } else {
                }
            } else if (MMRegionsIDs.includes(layer_mm.feature.properties.id)) {
                if (layer_mm.feature.properties.feat_type == "Landmark") {
                    for (i = 0; i < MMRegionsIDs.length; i++) {
                        if (MMRegionsIDs[i] == layer_mm.feature.properties.id) {
                            MMRegionsIDs.splice(i, 1);
                            MMLandmarksIDs.push(layer_mm.feature.properties.id);
                        }
                    }
                }
            } else {
                if (layer_mm.feature.properties.feat_type == "Landmark") {
                    MMLandmarksIDs.push(layer_mm.feature.properties.id);
                } else if (layer_mm.feature.properties.feat_type == "Cityblock") {
                    MMRegionsIDs.push(layer_mm.feature.properties.id);
                }
            }
        }
    });
}

//##############################################################
/**
 * If the isRoute checkbox is checked, the color of the line should change to red
 */
function changeColor(layer_mm) {

    drawnItems.eachLayer(function (l) {
        if (l == layer_mm) {
            loop1:
                for (var i = 0; i < ArrowsArray.length; i++) {
                    for (var j = 0; j < ArrowsArray[i].length; j++) {
                        if (l._leaflet_id == ArrowsArray[i][j]._leaflet_id) {
                            if (j == 1) {
                                map_mm.removeLayer(ArrowsArray[i][j + 1]);
                                map_mm.removeLayer(l);
                                ArrowsArray.splice(i, 1);
                                break loop1;
                            } else if (j == 2) {
                                map_mm.removeLayer(l)
                                map_mm.removeLayer(ArrowsArray[i][j]);
                                ArrowsArray.splice(i, 1);
                                break loop1;
                            }
                        }
                    }
                }

            function x(callback) {
                l.options.color = 'red';
                callback();
            }

            function y() {
                drawnItems.addLayer(l);
                drawnItems.eachLayer(function (layers) {
                    if (layers == layer_mm) {
                        arrowHead = L.polylineDecorator(layers, {
                            patterns: [
                                {
                                    offset: 25,
                                    repeat: 50,
                                    endoffset: 0,
                                    symbol: L.Symbol.arrowHead({
                                        pixelSize: 15,
                                        pathOptions: {fillOpacity: 1, weight: 0, color: 'red'}
                                    })
                                }
                            ]
                        }).addTo(map_mm);
                        var arrowsLayerGroup = L.layerGroup([layer_mm, arrowHead]);
                        var Linie = [arrowsLayerGroup, layer_mm, arrowHead];
                        ArrowsArray.push(Linie);
                        addStreetPopupMM(layers);
                    }
                })
            }

            x(y);
        }
    });
}

/**
 * If the isRoute checkbox is unchecked, the color of the line should change to red
 */
function changeColorBack(layer) {
    drawnItems.eachLayer(function (l) {
        if (l == layer) {
            loop1:
                for (var i = 0; i < ArrowsArray.length; i++) {
                    for (var j = 0; j < ArrowsArray[i].length; j++) {
                        if (l._leaflet_id == ArrowsArray[i][j]._leaflet_id) {
                            if (j == 1) {
                                map_mm.removeLayer(ArrowsArray[i][j + 1]);
                                map_mm.removeLayer(l);
                                ArrowsArray.splice(i, 1);
                                break loop1;
                            } else if (j == 2) {
                                map_mm.removeLayer(l);
                                map_mm.removeLayer(ArrowsArray[i][j]);
                                ArrowsArray.splice(i, 1);
                                break loop1;
                            }
                        }
                    }
                }

            function x(callback) {
                l.options.color = '#3388ff';
                callback();
            }

            function y() {
                drawnItems.addLayer(l);
                drawnItems.eachLayer(function (layers) {
                    if (layers == layer) {

                        arrowHead = L.polylineDecorator(layers, {
                            patterns: [
                                {
                                    offset: 25,
                                    repeat: 50,
                                    endoffset: 0,
                                    symbol: L.Symbol.arrowHead({
                                        pixelSize: 15,
                                        pathOptions: {fillOpacity: 1, weight: 0, color: '#3388ff'}
                                    })
                                }
                            ]
                        }).addTo(map_mm);
                        var arrowsLayerGroup = L.layerGroup([layer, arrowHead]);
                        var Linie = [arrowsLayerGroup, layer, arrowHead];
                        ArrowsArray.push(Linie);

                        addStreetPopupMM(layers);
                    }
                })
            }

            x(y);
        }
    });
}

function downloadJsonMM() {
    MMGeoJsonData = drawnItems.toGeoJSON();
    // Stringify the GeoJson
    var mmGeojson = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(MMGeoJsonData));
    // Create export
    document.getElementById('exportMetricFeatures').setAttribute('href', 'data:' + mmGeojson);
    document.getElementById('exportMetricFeatures').setAttribute('download', metricFileName+'.geojson');
}

function showLabels() {
    document.getElementById("showLabels").checked = true;
    document.getElementById("hideLabels").checked = false;

    var data = drawnItems.toGeoJSON();
    labelLayer = L.geoJson(data, {
        onEachFeature: function (feature, layer) {
            var temLayer = layer;
            if (temLayer.feature.properties.isRoute == "Yes") {
                temLayer.options.color = "red";
            } else {
            }
            temLayer.bindTooltip(feature.properties.id, {permanent: true, direction: 'auto'});
            return temLayer;
        }
    });
    labelLayer.addTo(map_mm);
    //document.getElementById("showLabels").disabled = true;

}

function hideLabels() {
    document.getElementById("hideLabels").checked = true;
    document.getElementById("showLabels").checked = false;
    map_mm.removeLayer(labelLayer);
    //document.getElementById("showLabels").disabled = false;
}

/**
 - qualify_MM function takes the geojson from metric maps and pass
 - it to the paython function "mmReceiver" that connect qualifier plugin
 **/

function qualify_MM(callback) {
    MMGeoJsonData = drawnItems.toGeoJSON();
    console.log("metric map jsondata:",MMGeoJsonData);

    $.ajax({
        url: '/mmReceiver',
        type: 'POST',
        data:
            {
                metricFileName: metricFileName,
                MMGeoJsonData: JSON.stringify(MMGeoJsonData)
            },
        //contentType: 'application/json',
        success: function (resp) {
            console.log("Metric Map Qualify complete");
            callback();
        }
    });
}